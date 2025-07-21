"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedTaskExecutor = void 0;
const type_guards_js_1 = require("../utils/type-guards.js");
/**
 * Advanced task executor with timeout handling, retry logic, and resource management
 */
const node_events_1 = require("node:events");
const node_child_process_1 = require("node:child_process");
const circuit_breaker_js_1 = require("./circuit-breaker.js");
/**
 * Advanced task executor with comprehensive timeout and resource management
 */
class AdvancedTaskExecutor extends node_events_1.EventEmitter {
    constructor(config, logger, eventBus) {
        super();
        this.runningTasks = new Map();
        this.queuedTasks = [];
        this.isShuttingDown = false;
        this.logger = logger;
        this.eventBus = eventBus;
        this.config = {
            maxConcurrentTasks: 10,
            defaultTimeout: 300000, // 5 minutes
            retryAttempts: 3,
            retryBackoffBase: 1000,
            retryBackoffMax: 30000,
            resourceLimits: {
                memory: 512 * 1024 * 1024, // 512MB
                cpu: 1.0, // 1 CPU core
                disk: 1024 * 1024 * 1024, // 1GB
            },
            enableCircuitBreaker: true,
            enableResourceMonitoring: true,
            killTimeout: 5000,
            ...config
        };
        // Initialize circuit breaker manager
        this.circuitBreakerManager = new circuit_breaker_js_1.CircuitBreakerManager({
            failureThreshold: 5,
            successThreshold: 3,
            timeout: 60000, // 1 minute
            halfOpenLimit: 2,
        }, this.logger, this.eventBus);
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        // Handle process events
        process.on('SIGTERM', () => this.gracefulShutdown());
        process.on('SIGINT', () => this.gracefulShutdown());
        // Handle circuit breaker events
        this.eventBus.on('circuitbreaker:state-change', (event) => {
            this.logger.info('Circuit breaker state changed', event);
            this.emit('circuit-breaker-changed', event);
        });
    }
    async initialize() {
        this.logger.info('Initializing advanced task executor', {
            maxConcurrentTasks: this.config.maxConcurrentTasks,
            defaultTimeout: this.config.defaultTimeout,
            resourceLimits: this.config.resourceLimits
        });
        if (this.config.enableResourceMonitoring) {
            this.startResourceMonitoring();
        }
        this.emit('executor-initialized');
    }
    async shutdown() {
        this.logger.info('Shutting down task executor');
        this.isShuttingDown = true;
        // Stop resource monitoring
        if (this.resourceMonitor) {
            clearInterval(this.resourceMonitor);
        }
        // Cancel all running tasks
        const cancelPromises = Array.from(this.runningTasks.values()).map(ctx => this.cancelTask(ctx.taskId, 'Shutdown requested'));
        await Promise.all(cancelPromises);
        this.emit('executor-shutdown');
    }
    /**
     * Execute a task with comprehensive error handling and resource management
     */
    async executeTask(task, agent, options = {}) {
        const startTime = Date.now();
        let retryCount = 0;
        const maxRetries = options.retryAttempts ?? this.config.retryAttempts;
        const timeout = options.timeout ?? this.config.defaultTimeout;
        this.logger.info('Starting task execution', {
            taskId: task.id.id,
            agentId: agent.id.id,
            type: task.type,
            timeout,
            maxRetries
        });
        // Check if we have capacity
        if (this.runningTasks.size >= this.config.maxConcurrentTasks) {
            this.queuedTasks.push(task);
            this.logger.info('Task queued due to capacity limits', {
                taskId: task.id.id,
                queueSize: this.queuedTasks.length
            });
            // Wait for capacity
            await this.waitForCapacity();
        }
        while (retryCount <= maxRetries) {
            try {
                const result = await this.executeSingleAttempt(task, agent, timeout, retryCount);
                this.logger.info('Task completed successfully', {
                    taskId: task.id.id,
                    executionTime: Date.now() - startTime,
                    retryCount
                });
                return {
                    success: true,
                    result: result.result,
                    executionTime: Date.now() - startTime,
                    resourcesUsed: result.resourcesUsed,
                    retryCount
                };
            }
            catch (error) {
                retryCount++;
                this.logger.warn('Task attempt failed', {
                    taskId: task.id.id,
                    attempt: retryCount,
                    maxRetries,
                    error: (0, type_guards_js_1.getErrorMessage)(error)
                });
                // Check if we should retry
                if (retryCount > maxRetries) {
                    const taskError = {
                        type: 'execution_failed',
                        message: (0, type_guards_js_1.getErrorMessage)(error),
                        stack: (0, type_guards_js_1.getErrorStack)(error),
                        context: {
                            retryCount,
                            maxRetries,
                            taskType: task.type
                        },
                        recoverable: false,
                        retryable: false
                    };
                    return {
                        success: false,
                        error: taskError,
                        executionTime: Date.now() - startTime,
                        resourcesUsed: this.getDefaultResourceUsage(),
                        retryCount
                    };
                }
                // Calculate backoff delay
                const backoffDelay = Math.min(this.config.retryBackoffBase * Math.pow(2, retryCount - 1), this.config.retryBackoffMax);
                this.logger.info('Retrying task after backoff', {
                    taskId: task.id.id,
                    backoffDelay,
                    attempt: retryCount + 1
                });
                await this.delay(backoffDelay);
            }
        }
        // This should never be reached, but TypeScript requires it
        throw new Error('Unexpected end of retry loop');
    }
    async executeSingleAttempt(task, agent, timeout, retryCount) {
        const executionContext = {
            taskId: task.id.id,
            agentId: agent.id.id,
            startTime: new Date(),
            resources: this.getDefaultResourceUsage()
        };
        this.runningTasks.set(task.id.id, executionContext);
        try {
            // Set up timeout
            const timeoutPromise = new Promise((_, reject) => {
                executionContext.timeout = setTimeout(() => {
                    reject(new Error(`Task timeout after ${timeout}ms`));
                }, timeout);
            });
            // Set up circuit breaker if enabled
            if (this.config.enableCircuitBreaker) {
                executionContext.circuitBreaker = this.circuitBreakerManager.getBreaker(`agent-${agent.id.id}`);
            }
            // Execute task with circuit breaker protection
            const executionPromise = this.config.enableCircuitBreaker && executionContext.circuitBreaker
                ? executionContext.circuitBreaker.execute(() => this.performTaskExecution(task, agent, executionContext))
                : this.performTaskExecution(task, agent, executionContext);
            // Race between execution and timeout
            const result = await Promise.race([executionPromise, timeoutPromise]);
            // Clear timeout
            if (executionContext.timeout) {
                clearTimeout(executionContext.timeout);
            }
            return result;
        }
        finally {
            // Cleanup
            this.runningTasks.delete(task.id.id);
            // Process queued tasks
            this.processQueuedTasks();
        }
    }
    async performTaskExecution(task, agent, context) {
        const startTime = Date.now();
        // Create task execution command
        const command = this.buildExecutionCommand(task, agent);
        this.logger.debug('Executing task command', {
            taskId: task.id.id,
            command: command.cmd,
            args: command.args
        });
        // Spawn process
        const childProcess = (0, node_child_process_1.spawn)(command.cmd, command.args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                ...command.env,
                TASK_ID: task.id.id,
                AGENT_ID: agent.id.id,
                TASK_TYPE: task.type
            }
        });
        context.process = childProcess;
        // Collect output
        let stdout = '';
        let stderr = '';
        childProcess.stdout?.on('data', (data) => {
            stdout += data.toString();
        });
        childProcess.stderr?.on('data', (data) => {
            stderr += data.toString();
        });
        // Send input if provided
        if (task.input && childProcess.stdin) {
            childProcess.stdin.write(JSON.stringify({
                task: task,
                agent: agent,
                input: task.input
            }));
            childProcess.stdin.end();
        }
        // Wait for process completion
        const exitCode = await new Promise((resolve, reject) => {
            childProcess.on('exit', (code) => {
                resolve(code ?? 0);
            });
            childProcess.on('error', (error) => {
                reject(new Error(`Process error: ${(0, type_guards_js_1.getErrorMessage)(error)}`));
            });
        });
        const executionTime = Date.now() - startTime;
        // Parse result
        let taskResult;
        if (exitCode === 0) {
            try {
                const output = JSON.parse(stdout);
                taskResult = {
                    output: output.result || output,
                    artifacts: output.artifacts || {},
                    metadata: output.metadata || {},
                    quality: output.quality || 0.8,
                    completeness: output.completeness || 1.0,
                    accuracy: output.accuracy || 0.9,
                    executionTime,
                    resourcesUsed: context.resources,
                    validated: false
                };
            }
            catch (error) {
                taskResult = {
                    output: stdout,
                    artifacts: {},
                    metadata: { stderr },
                    quality: 0.5,
                    completeness: 1.0,
                    accuracy: 0.7,
                    executionTime,
                    resourcesUsed: context.resources,
                    validated: false
                };
            }
        }
        else {
            throw new Error(`Task execution failed with exit code ${exitCode}: ${stderr}`);
        }
        return {
            result: taskResult,
            resourcesUsed: context.resources
        };
    }
    buildExecutionCommand(task, agent) {
        // This would be customized based on task type and agent capabilities
        // For now, return a default Claude execution command
        const cmd = 'deno';
        const args = [
            'run',
            '--allow-all',
            '--no-check',
            './src/cli/commands/task-executor.ts',
            '--task-type',
            task.type,
            '--agent-type',
            agent.type
        ];
        const env = {
            TASK_TIMEOUT: (task.constraints.timeoutAfter || this.config.defaultTimeout).toString(),
            MEMORY_LIMIT: this.config.resourceLimits.memory.toString(),
            CPU_LIMIT: this.config.resourceLimits.cpu.toString()
        };
        return { cmd, args, env };
    }
    async cancelTask(taskId, reason) {
        const context = this.runningTasks.get(taskId);
        if (!context) {
            return;
        }
        this.logger.info('Cancelling task', { taskId, reason });
        // Clear timeout
        if (context.timeout) {
            clearTimeout(context.timeout);
        }
        // Kill process if running
        if (context.process && !context.process.killed) {
            context.process.kill('SIGTERM');
            // Force kill after timeout
            setTimeout(() => {
                if (context.process && !context.process.killed) {
                    context.process.kill('SIGKILL');
                }
            }, this.config.killTimeout);
        }
        // Remove from running tasks
        this.runningTasks.delete(taskId);
        this.emit('task-cancelled', { taskId, reason });
    }
    startResourceMonitoring() {
        this.resourceMonitor = setInterval(() => {
            this.updateResourceUsage();
        }, 5000); // Update every 5 seconds
    }
    async updateResourceUsage() {
        for (const [taskId, context] of this.runningTasks) {
            if (context.process) {
                try {
                    const usage = await this.getProcessResourceUsage(context.process.pid);
                    context.resources = {
                        ...usage,
                        lastUpdated: new Date()
                    };
                    // Check resource limits
                    this.checkResourceLimits(taskId, context);
                }
                catch (error) {
                    this.logger.warn('Failed to get resource usage', {
                        taskId,
                        error: (0, type_guards_js_1.getErrorMessage)(error)
                    });
                }
            }
        }
    }
    async getProcessResourceUsage(pid) {
        if (!pid) {
            throw new Error('Process ID is undefined');
        }
        // In a real implementation, this would use system APIs
        // For now, return mock data
        return {
            memory: Math.random() * this.config.resourceLimits.memory,
            cpu: Math.random() * 100,
            disk: Math.random() * this.config.resourceLimits.disk,
            network: Math.random() * 1024 * 1024,
            lastUpdated: new Date()
        };
    }
    checkResourceLimits(taskId, context) {
        const { memory, cpu } = context.resources;
        const limits = this.config.resourceLimits;
        if (memory > limits.memory) {
            this.logger.warn('Task exceeding memory limit', {
                taskId,
                current: memory,
                limit: limits.memory
            });
            this.cancelTask(taskId, 'Memory limit exceeded');
        }
        if (cpu > limits.cpu * 100) { // CPU is in percentage
            this.logger.warn('Task exceeding CPU limit', {
                taskId,
                current: cpu,
                limit: limits.cpu * 100
            });
        }
    }
    getDefaultResourceUsage() {
        return {
            memory: 0,
            cpu: 0,
            disk: 0,
            network: 0,
            lastUpdated: new Date()
        };
    }
    async waitForCapacity() {
        return new Promise((resolve) => {
            const check = () => {
                if (this.runningTasks.size < this.config.maxConcurrentTasks) {
                    resolve();
                }
                else {
                    setTimeout(check, 1000);
                }
            };
            check();
        });
    }
    processQueuedTasks() {
        while (this.queuedTasks.length > 0 &&
            this.runningTasks.size < this.config.maxConcurrentTasks) {
            const task = this.queuedTasks.shift();
            if (task) {
                this.emit('task-dequeued', { taskId: task.id.id });
            }
        }
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async gracefulShutdown() {
        this.logger.info('Received shutdown signal, initiating graceful shutdown');
        await this.shutdown();
        process.exit(0);
    }
    // Public API methods
    getRunningTasks() {
        return Array.from(this.runningTasks.keys());
    }
    getTaskContext(taskId) {
        return this.runningTasks.get(taskId);
    }
    getQueuedTasks() {
        return [...this.queuedTasks];
    }
    getExecutorStats() {
        return {
            runningTasks: this.runningTasks.size,
            queuedTasks: this.queuedTasks.length,
            maxConcurrentTasks: this.config.maxConcurrentTasks,
            totalCapacity: this.config.maxConcurrentTasks,
            resourceLimits: this.config.resourceLimits,
            circuitBreakers: this.circuitBreakerManager.getAllMetrics()
        };
    }
    async forceKillTask(taskId) {
        await this.cancelTask(taskId, 'Force killed by user');
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.logger.info('Task executor configuration updated', { newConfig });
    }
}
exports.AdvancedTaskExecutor = AdvancedTaskExecutor;
