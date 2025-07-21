"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskExecutor = void 0;
/**
 * Advanced Task Executor with timeout handling and process management
 */
const node_child_process_1 = require("node:child_process");
const node_events_1 = require("node:events");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const logger_js_1 = require("../core/logger.js");
const helpers_js_1 = require("../utils/helpers.js");
const types_js_1 = require("./types.js");
class TaskExecutor extends node_events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.activeExecutions = new Map();
        this.config = this.mergeWithDefaults(config);
        this.logger = new logger_js_1.Logger({ level: this.config.logLevel || 'info', format: 'text', destination: 'console' }, { component: 'TaskExecutor' });
        this.resourceMonitor = new ResourceMonitor();
        this.processPool = new ProcessPool(this.config);
        this.setupEventHandlers();
    }
    async initialize() {
        this.logger.info('Initializing task executor...');
        await this.resourceMonitor.initialize();
        await this.processPool.initialize();
        this.logger.info('Task executor initialized');
    }
    async shutdown() {
        this.logger.info('Shutting down task executor...');
        // Stop all active executions
        const stopPromises = Array.from(this.activeExecutions.values())
            .map(session => this.stopExecution(session.id, 'Executor shutdown'));
        await Promise.allSettled(stopPromises);
        await this.processPool.shutdown();
        await this.resourceMonitor.shutdown();
        this.logger.info('Task executor shut down');
    }
    async executeTask(task, agent, options = {}) {
        const sessionId = (0, helpers_js_1.generateId)('execution');
        const context = await this.createExecutionContext(task, agent);
        const config = { ...this.config, ...options };
        this.logger.info('Starting task execution', {
            sessionId,
            taskId: task.id.id,
            agentId: agent.id.id,
            timeout: config.timeoutMs
        });
        const session = new ExecutionSession(sessionId, task, agent, context, config, this.logger);
        this.activeExecutions.set(sessionId, session);
        try {
            // Setup monitoring
            this.resourceMonitor.startMonitoring(sessionId, context.resources);
            // Execute with timeout protection
            const result = await this.executeWithTimeout(session);
            // Cleanup
            await this.cleanupExecution(session);
            this.logger.info('Task execution completed', {
                sessionId,
                success: result.success,
                duration: result.duration
            });
            return result;
        }
        catch (error) {
            this.logger.error('Task execution failed', {
                sessionId,
                error: (error instanceof Error ? error.message : String(error)),
                stack: error.stack
            });
            await this.cleanupExecution(session);
            throw error;
        }
        finally {
            this.activeExecutions.delete(sessionId);
            this.resourceMonitor.stopMonitoring(sessionId);
        }
    }
    async stopExecution(sessionId, reason) {
        const session = this.activeExecutions.get(sessionId);
        if (!session) {
            return;
        }
        this.logger.info('Stopping execution', { sessionId, reason });
        try {
            await session.stop(reason);
        }
        catch (error) {
            this.logger.error('Error stopping execution', { sessionId, error });
        }
    }
    async executeClaudeTask(task, agent, claudeOptions = {}) {
        const sessionId = (0, helpers_js_1.generateId)('claude-execution');
        const context = await this.createExecutionContext(task, agent);
        this.logger.info('Starting Claude task execution', {
            sessionId,
            taskId: task.id.id,
            agentId: agent.id.id
        });
        try {
            return await this.executeClaudeWithTimeout(sessionId, task, agent, context, claudeOptions);
        }
        catch (error) {
            this.logger.error('Claude task execution failed', {
                sessionId,
                error: (error instanceof Error ? error.message : String(error))
            });
            throw error;
        }
    }
    getActiveExecutions() {
        return Array.from(this.activeExecutions.values());
    }
    getExecutionMetrics() {
        return {
            activeExecutions: this.activeExecutions.size,
            totalExecutions: this.processPool.getTotalExecutions(),
            averageDuration: this.processPool.getAverageDuration(),
            successRate: this.processPool.getSuccessRate(),
            resourceUtilization: this.resourceMonitor.getUtilization(),
            errorRate: this.processPool.getErrorRate()
        };
    }
    async executeWithTimeout(session) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.logger.warn('Execution timeout', {
                    sessionId: session.id,
                    timeout: session.config.timeoutMs
                });
                session.stop('Timeout').then(() => {
                    reject(new Error(`Execution timed out after ${session.config.timeoutMs}ms`));
                });
            }, session.config.timeoutMs);
            session.execute()
                .then(result => {
                clearTimeout(timeout);
                resolve(result);
            })
                .catch(error => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    async executeClaudeWithTimeout(sessionId, task, agent, context, options) {
        const startTime = Date.now();
        const timeout = options.timeout || this.config.timeoutMs;
        // Build Claude command
        const command = this.buildClaudeCommand(task, agent, options);
        // Create execution environment
        const env = {
            ...process.env,
            ...context.environment,
            CLAUDE_TASK_ID: task.id.id,
            CLAUDE_AGENT_ID: agent.id.id,
            CLAUDE_SESSION_ID: sessionId,
            CLAUDE_WORKING_DIR: context.workingDirectory
        };
        this.logger.debug('Executing Claude command', {
            sessionId,
            command: command.command,
            args: command.args,
            workingDir: context.workingDirectory
        });
        return new Promise((resolve, reject) => {
            let outputBuffer = '';
            let errorBuffer = '';
            let isTimeout = false;
            let process = null;
            // Setup timeout
            const timeoutHandle = setTimeout(() => {
                isTimeout = true;
                if (process) {
                    this.logger.warn('Claude execution timeout, killing process', {
                        sessionId,
                        pid: process.pid,
                        timeout
                    });
                    // Graceful shutdown first
                    process.kill('SIGTERM');
                    // Force kill after grace period
                    setTimeout(() => {
                        if (process && !process.killed) {
                            process.kill('SIGKILL');
                        }
                    }, this.config.killTimeout);
                }
            }, timeout);
            try {
                // Spawn Claude process
                process = (0, node_child_process_1.spawn)(command.command, command.args, {
                    cwd: context.workingDirectory,
                    env,
                    stdio: ['pipe', 'pipe', 'pipe'],
                    detached: options.detached || false
                });
                if (!process.pid) {
                    clearTimeout(timeoutHandle);
                    reject(new Error('Failed to spawn Claude process'));
                    return;
                }
                this.logger.info('Claude process started', {
                    sessionId,
                    pid: process.pid,
                    command: command.command
                });
                // Handle process output
                if (process.stdout) {
                    process.stdout.on('data', (data) => {
                        const chunk = data.toString();
                        outputBuffer += chunk;
                        if (this.config.streamOutput) {
                            this.emit('output', {
                                sessionId,
                                type: 'stdout',
                                data: chunk
                            });
                        }
                    });
                }
                if (process.stderr) {
                    process.stderr.on('data', (data) => {
                        const chunk = data.toString();
                        errorBuffer += chunk;
                        if (this.config.streamOutput) {
                            this.emit('output', {
                                sessionId,
                                type: 'stderr',
                                data: chunk
                            });
                        }
                    });
                }
                // Handle process completion
                process.on('close', async (code, signal) => {
                    clearTimeout(timeoutHandle);
                    const duration = Date.now() - startTime;
                    const exitCode = code || 0;
                    this.logger.info('Claude process completed', {
                        sessionId,
                        exitCode,
                        signal,
                        duration,
                        isTimeout
                    });
                    try {
                        // Collect resource usage
                        const resourceUsage = await this.collectResourceUsage(sessionId);
                        // Collect artifacts
                        const artifacts = await this.collectArtifacts(context);
                        const result = {
                            success: !isTimeout && exitCode === 0,
                            output: outputBuffer,
                            error: errorBuffer,
                            exitCode,
                            duration,
                            resourcesUsed: resourceUsage,
                            artifacts,
                            metadata: {
                                sessionId,
                                timeout: isTimeout,
                                signal,
                                command: command.command,
                                args: command.args
                            }
                        };
                        if (isTimeout) {
                            reject(new Error(`Claude execution timed out after ${timeout}ms`));
                        }
                        else if (exitCode !== 0) {
                            reject(new Error(`Claude execution failed with exit code ${exitCode}: ${errorBuffer}`));
                        }
                        else {
                            resolve(result);
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                });
                // Handle process errors
                process.on('error', (error) => {
                    clearTimeout(timeoutHandle);
                    this.logger.error('Claude process error', {
                        sessionId,
                        error: (error instanceof Error ? error.message : String(error))
                    });
                    reject(error);
                });
                // Send input if provided
                if (command.input && process.stdin) {
                    process.stdin.write(command.input);
                    process.stdin.end();
                }
                // If detached, unreference to allow parent to exit
                if (options.detached) {
                    process.unref();
                }
            }
            catch (error) {
                clearTimeout(timeoutHandle);
                reject(error);
            }
        });
    }
    buildClaudeCommand(task, agent, options) {
        const args = [];
        let input = '';
        // Build prompt
        const prompt = this.buildClaudePrompt(task, agent);
        if (options.useStdin) {
            // Send prompt via stdin
            input = prompt;
        }
        else {
            // Send prompt as argument
            args.push('-p', prompt);
        }
        // Add tools
        if (task.requirements.tools.length > 0) {
            args.push('--allowedTools', task.requirements.tools.join(','));
        }
        // Add model if specified
        if (options.model) {
            args.push('--model', options.model);
        }
        // Add max tokens if specified
        if (options.maxTokens) {
            args.push('--max-tokens', options.maxTokens.toString());
        }
        // Add temperature if specified
        if (options.temperature !== undefined) {
            args.push('--temperature', options.temperature.toString());
        }
        // Skip permissions check for swarm execution
        args.push('--dangerously-skip-permissions');
        // Add output format
        if (options.outputFormat) {
            args.push('--output-format', options.outputFormat);
        }
        return {
            command: options.claudePath || 'claude',
            args,
            input
        };
    }
    buildClaudePrompt(task, agent) {
        const sections = [];
        // Agent identification
        sections.push(`You are ${agent.name}, a ${agent.type} agent in a swarm system.`);
        sections.push(`Agent ID: ${agent.id.id}`);
        sections.push(`Swarm ID: ${agent.id.swarmId}`);
        sections.push('');
        // Task information
        sections.push(`TASK: ${task.name}`);
        sections.push(`Type: ${task.type}`);
        sections.push(`Priority: ${task.priority}`);
        sections.push('');
        // Task description
        sections.push('DESCRIPTION:');
        sections.push(task.description);
        sections.push('');
        // Task instructions
        sections.push('INSTRUCTIONS:');
        sections.push(task.instructions);
        sections.push('');
        // Context if provided
        if (Object.keys(task.context).length > 0) {
            sections.push('CONTEXT:');
            sections.push(JSON.stringify(task.context, null, 2));
            sections.push('');
        }
        // Input data if provided
        if (task.input && Object.keys(task.input).length > 0) {
            sections.push('INPUT DATA:');
            sections.push(JSON.stringify(task.input, null, 2));
            sections.push('');
        }
        // Examples if provided
        if (task.examples && task.examples.length > 0) {
            sections.push('EXAMPLES:');
            task.examples.forEach((example, index) => {
                sections.push(`Example ${index + 1}:`);
                sections.push(JSON.stringify(example, null, 2));
                sections.push('');
            });
        }
        // Expected output format
        sections.push('EXPECTED OUTPUT:');
        if (task.expectedOutput) {
            sections.push(JSON.stringify(task.expectedOutput, null, 2));
        }
        else {
            sections.push('Provide a structured response with:');
            sections.push('- Summary of what was accomplished');
            sections.push('- Any artifacts created (files, data, etc.)');
            sections.push('- Recommendations or next steps');
            sections.push('- Any issues encountered');
        }
        sections.push('');
        // Quality requirements
        sections.push('QUALITY REQUIREMENTS:');
        sections.push(`- Quality threshold: ${task.requirements.minReliability || 0.8}`);
        if (task.requirements.reviewRequired) {
            sections.push('- Review required before completion');
        }
        if (task.requirements.testingRequired) {
            sections.push('- Testing required before completion');
        }
        if (task.requirements.documentationRequired) {
            sections.push('- Documentation required');
        }
        sections.push('');
        // Capabilities and constraints
        sections.push('CAPABILITIES:');
        const capabilities = Object.entries(agent.capabilities)
            .filter(([key, value]) => typeof value === 'boolean' && value)
            .map(([key]) => key);
        sections.push(capabilities.join(', '));
        sections.push('');
        sections.push('CONSTRAINTS:');
        sections.push(`- Maximum execution time: ${task.constraints.timeoutAfter || types_js_1.SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT}ms`);
        sections.push(`- Maximum retries: ${task.constraints.maxRetries || types_js_1.SWARM_CONSTANTS.MAX_RETRIES}`);
        if (task.constraints.deadline) {
            sections.push(`- Deadline: ${task.constraints.deadline.toISOString()}`);
        }
        sections.push('');
        // Final instructions
        sections.push('EXECUTION GUIDELINES:');
        sections.push('1. Read and understand the task completely before starting');
        sections.push('2. Use your capabilities efficiently and effectively');
        sections.push('3. Provide detailed output about your progress and results');
        sections.push('4. Handle errors gracefully and report issues clearly');
        sections.push('5. Ensure your work meets the quality requirements');
        sections.push('6. When complete, provide a clear summary of what was accomplished');
        sections.push('');
        sections.push('Begin your task execution now.');
        return sections.join('\n');
    }
    async createExecutionContext(task, agent) {
        const baseDir = path.join(os.tmpdir(), 'swarm-execution', task.id.id);
        const workingDir = path.join(baseDir, 'work');
        const tempDir = path.join(baseDir, 'temp');
        const logDir = path.join(baseDir, 'logs');
        // Create directories
        await fs.mkdir(workingDir, { recursive: true });
        await fs.mkdir(tempDir, { recursive: true });
        await fs.mkdir(logDir, { recursive: true });
        return {
            task,
            agent,
            workingDirectory: workingDir,
            tempDirectory: tempDir,
            logDirectory: logDir,
            environment: {
                NODE_ENV: 'production',
                SWARM_MODE: 'execution',
                AGENT_TYPE: agent.type,
                TASK_TYPE: task.type,
                ...agent.environment.credentials
            },
            resources: {
                maxMemory: task.requirements.memoryRequired || types_js_1.SWARM_CONSTANTS.DEFAULT_MEMORY_LIMIT,
                maxCpuTime: task.requirements.maxDuration || types_js_1.SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT,
                maxDiskSpace: 1024 * 1024 * 1024, // 1GB
                maxNetworkConnections: 10,
                maxFileHandles: 100,
                priority: this.getPriorityNumber(task.priority)
            }
        };
    }
    async cleanupExecution(session) {
        try {
            await session.cleanup();
            this.logger.debug('Execution cleanup completed', { sessionId: session.id });
        }
        catch (error) {
            this.logger.warn('Error during execution cleanup', {
                sessionId: session.id,
                error: (error instanceof Error ? error.message : String(error))
            });
        }
    }
    async collectResourceUsage(sessionId) {
        return this.resourceMonitor.getUsage(sessionId);
    }
    async collectArtifacts(context) {
        const artifacts = {};
        try {
            // Scan working directory for artifacts
            const files = await this.scanDirectory(context.workingDirectory);
            artifacts.files = files;
            // Check for specific artifact types
            artifacts.logs = await this.collectLogs(context.logDirectory);
            artifacts.outputs = await this.collectOutputs(context.workingDirectory);
        }
        catch (error) {
            this.logger.warn('Error collecting artifacts', {
                workingDir: context.workingDirectory,
                error: (error instanceof Error ? error.message : String(error))
            });
        }
        return artifacts;
    }
    async scanDirectory(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const files = [];
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isFile()) {
                    files.push(fullPath);
                }
                else if (entry.isDirectory()) {
                    const subFiles = await this.scanDirectory(fullPath);
                    files.push(...subFiles);
                }
            }
            return files;
        }
        catch (error) {
            return [];
        }
    }
    async collectLogs(logDir) {
        const logs = {};
        try {
            const files = await fs.readdir(logDir);
            for (const file of files) {
                if (file.endsWith('.log')) {
                    const filePath = path.join(logDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    logs[file] = content;
                }
            }
        }
        catch (error) {
            // Log directory might not exist
        }
        return logs;
    }
    async collectOutputs(workingDir) {
        const outputs = {};
        try {
            // Look for common output files
            const outputFiles = ['output.json', 'result.json', 'response.json'];
            for (const fileName of outputFiles) {
                const filePath = path.join(workingDir, fileName);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    outputs[fileName] = JSON.parse(content);
                }
                catch (error) {
                    // File doesn't exist or isn't valid JSON
                }
            }
        }
        catch (error) {
            // Working directory might not exist
        }
        return outputs;
    }
    getPriorityNumber(priority) {
        switch (priority) {
            case 'critical': return 0;
            case 'high': return 1;
            case 'normal': return 2;
            case 'low': return 3;
            case 'background': return 4;
            default: return 2;
        }
    }
    mergeWithDefaults(config) {
        return {
            timeoutMs: types_js_1.SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT,
            retryAttempts: types_js_1.SWARM_CONSTANTS.MAX_RETRIES,
            killTimeout: 5000, // 5 seconds
            resourceLimits: {
                maxMemory: types_js_1.SWARM_CONSTANTS.DEFAULT_MEMORY_LIMIT,
                maxCpuTime: types_js_1.SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT,
                maxDiskSpace: 1024 * 1024 * 1024, // 1GB
                maxNetworkConnections: 10,
                maxFileHandles: 100,
                priority: 2
            },
            sandboxed: true,
            logLevel: 'info',
            captureOutput: true,
            streamOutput: false,
            enableMetrics: true,
            ...config
        };
    }
    setupEventHandlers() {
        // Handle resource limit violations
        this.resourceMonitor.on('limit-violation', (data) => {
            this.logger.warn('Resource limit violation', data);
            const session = this.activeExecutions.get(data.sessionId);
            if (session) {
                session.stop('Resource limit violation').catch(error => {
                    this.logger.error('Error stopping session due to resource violation', {
                        sessionId: data.sessionId,
                        error
                    });
                });
            }
        });
        // Handle process pool events
        this.processPool.on('process-failed', (data) => {
            this.logger.error('Process failed in pool', data);
        });
    }
}
exports.TaskExecutor = TaskExecutor;
// ===== SUPPORTING CLASSES =====
class ExecutionSession {
    constructor(id, task, agent, context, config, logger) {
        this.id = id;
        this.task = task;
        this.agent = agent;
        this.context = context;
        this.config = config;
        this.logger = logger;
    }
    async execute() {
        this.startTime = new Date();
        // Implementation would go here for actual task execution
        // This is a placeholder that simulates execution
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.endTime = new Date();
        return {
            success: true,
            output: 'Task completed successfully',
            exitCode: 0,
            duration: this.endTime.getTime() - this.startTime.getTime(),
            resourcesUsed: {
                cpuTime: 1000,
                maxMemory: 50 * 1024 * 1024,
                diskIO: 1024,
                networkIO: 0,
                fileHandles: 5
            },
            artifacts: {},
            metadata: {
                sessionId: this.id,
                agentId: this.agent.id.id,
                taskId: this.task.id.id
            }
        };
    }
    async stop(reason) {
        this.logger.info('Stopping execution session', { sessionId: this.id, reason });
        if (this.process) {
            this.process.kill('SIGTERM');
            // Force kill after timeout
            setTimeout(() => {
                if (this.process && !this.process.killed) {
                    this.process.kill('SIGKILL');
                }
            }, 5000);
        }
    }
    async cleanup() {
        // Cleanup temporary files and resources
        try {
            await fs.rm(this.context.tempDirectory, { recursive: true, force: true });
        }
        catch (error) {
            // Ignore cleanup errors
        }
    }
}
class ResourceMonitor extends node_events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.activeMonitors = new Map();
        this.usage = new Map();
    }
    async initialize() {
        // Initialize resource monitoring
    }
    async shutdown() {
        // Stop all monitors
        for (const [sessionId, timer] of this.activeMonitors) {
            clearInterval(timer);
        }
        this.activeMonitors.clear();
    }
    startMonitoring(sessionId, limits) {
        const timer = setInterval(() => {
            this.checkResources(sessionId, limits);
        }, 1000);
        this.activeMonitors.set(sessionId, timer);
    }
    stopMonitoring(sessionId) {
        const timer = this.activeMonitors.get(sessionId);
        if (timer) {
            clearInterval(timer);
            this.activeMonitors.delete(sessionId);
        }
    }
    getUsage(sessionId) {
        return this.usage.get(sessionId) || {
            cpuTime: 0,
            maxMemory: 0,
            diskIO: 0,
            networkIO: 0,
            fileHandles: 0
        };
    }
    getUtilization() {
        // Return overall system utilization
        return {
            cpu: 0.1,
            memory: 0.2,
            disk: 0.05,
            network: 0.01
        };
    }
    checkResources(sessionId, limits) {
        // Check if any limits are exceeded
        const usage = this.collectCurrentUsage(sessionId);
        this.usage.set(sessionId, usage);
        if (usage.maxMemory > limits.maxMemory) {
            this.emit('limit-violation', {
                sessionId,
                type: 'memory',
                current: usage.maxMemory,
                limit: limits.maxMemory
            });
        }
        if (usage.cpuTime > limits.maxCpuTime) {
            this.emit('limit-violation', {
                sessionId,
                type: 'cpu',
                current: usage.cpuTime,
                limit: limits.maxCpuTime
            });
        }
    }
    collectCurrentUsage(sessionId) {
        // Collect actual resource usage - this would interface with system APIs
        return {
            cpuTime: Math.random() * 1000,
            maxMemory: Math.random() * 100 * 1024 * 1024,
            diskIO: Math.random() * 1024,
            networkIO: Math.random() * 1024,
            fileHandles: Math.floor(Math.random() * 10)
        };
    }
}
class ProcessPool extends node_events_1.EventEmitter {
    constructor(config) {
        super();
        this.totalExecutions = 0;
        this.totalDuration = 0;
        this.successCount = 0;
        this.errorCount = 0;
        this.config = config;
    }
    async initialize() {
        // Initialize process pool
    }
    async shutdown() {
        // Shutdown process pool
    }
    getTotalExecutions() {
        return this.totalExecutions;
    }
    getAverageDuration() {
        return this.totalExecutions > 0 ? this.totalDuration / this.totalExecutions : 0;
    }
    getSuccessRate() {
        return this.totalExecutions > 0 ? this.successCount / this.totalExecutions : 0;
    }
    getErrorRate() {
        return this.totalExecutions > 0 ? this.errorCount / this.totalExecutions : 0;
    }
}
exports.default = TaskExecutor;
