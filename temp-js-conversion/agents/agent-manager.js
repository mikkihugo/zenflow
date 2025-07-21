"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
/**
 * Comprehensive agent management system
 */
const node_events_1 = require("node:events");
const node_child_process_1 = require("node:child_process");
const helpers_js_1 = require("../utils/helpers.js");
/**
 * Comprehensive agent lifecycle and resource management
 */
class AgentManager extends node_events_1.EventEmitter {
    constructor(config, logger, eventBus, memory) {
        super();
        // Agent tracking
        this.agents = new Map();
        this.processes = new Map();
        this.templates = new Map();
        this.clusters = new Map();
        this.pools = new Map();
        // Health monitoring
        this.healthChecks = new Map();
        // Scaling and policies
        this.scalingPolicies = new Map();
        this.scalingOperations = new Map();
        // Resource tracking
        this.resourceUsage = new Map();
        this.performanceHistory = new Map();
        this.logger = logger;
        this.eventBus = eventBus;
        this.memory = memory;
        this.config = {
            maxAgents: 50,
            defaultTimeout: 30000,
            heartbeatInterval: 10000,
            healthCheckInterval: 30000,
            autoRestart: true,
            resourceLimits: {
                memory: 512 * 1024 * 1024, // 512MB
                cpu: 1.0,
                disk: 1024 * 1024 * 1024 // 1GB
            },
            agentDefaults: {
                autonomyLevel: 0.7,
                learningEnabled: true,
                adaptationEnabled: true
            },
            environmentDefaults: {
                runtime: 'deno',
                workingDirectory: './agents',
                tempDirectory: './tmp',
                logDirectory: './logs'
            },
            ...config
        };
        this.setupEventHandlers();
        this.initializeDefaultTemplates();
    }
    setupEventHandlers() {
        this.eventBus.on('agent:heartbeat', (data) => {
            const heartbeatData = data;
            this.handleHeartbeat(heartbeatData);
        });
        this.eventBus.on('agent:error', (data) => {
            const errorData = data;
            this.handleAgentError(errorData);
        });
        this.eventBus.on('task:assigned', (data) => {
            const taskData = data;
            this.updateAgentWorkload(taskData.agentId, 1);
        });
        this.eventBus.on('task:completed', (data) => {
            const completedData = data;
            this.updateAgentWorkload(completedData.agentId, -1);
            if (completedData.metrics) {
                this.updateAgentMetrics(completedData.agentId, completedData.metrics);
            }
        });
        this.eventBus.on('resource:usage', (data) => {
            const resourceData = data;
            this.updateResourceUsage(resourceData.agentId, resourceData.usage);
        });
    }
    initializeDefaultTemplates() {
        // Research agent template
        this.templates.set('researcher', {
            name: 'Research Agent',
            type: 'researcher',
            capabilities: {
                codeGeneration: false,
                codeReview: false,
                testing: false,
                documentation: true,
                research: true,
                analysis: true,
                webSearch: true,
                apiIntegration: true,
                fileSystem: true,
                terminalAccess: false,
                languages: [],
                frameworks: [],
                domains: ['research', 'analysis', 'information-gathering'],
                tools: ['web-search', 'document-analysis', 'data-extraction'],
                maxConcurrentTasks: 5,
                maxMemoryUsage: 256 * 1024 * 1024,
                maxExecutionTime: 600000,
                reliability: 0.9,
                speed: 0.8,
                quality: 0.9
            },
            config: {
                autonomyLevel: 0.8,
                learningEnabled: true,
                adaptationEnabled: true,
                maxTasksPerHour: 20,
                maxConcurrentTasks: 5,
                timeoutThreshold: 600000,
                reportingInterval: 30000,
                heartbeatInterval: 10000,
                permissions: ['web-access', 'file-read'],
                trustedAgents: [],
                expertise: { research: 0.9, analysis: 0.8, documentation: 0.7 },
                preferences: { verbose: true, detailed: true }
            },
            environment: {
                runtime: 'deno',
                version: '1.40.0',
                workingDirectory: './agents/researcher',
                tempDirectory: './tmp/researcher',
                logDirectory: './logs/researcher',
                apiEndpoints: {},
                credentials: {},
                availableTools: ['web-search', 'document-reader', 'data-extractor'],
                toolConfigs: {}
            },
            startupScript: './scripts/start-researcher.ts'
        });
        // Developer agent template
        this.templates.set('coder', {
            name: 'Developer Agent',
            type: 'coder',
            capabilities: {
                codeGeneration: true,
                codeReview: true,
                testing: true,
                documentation: true,
                research: false,
                analysis: true,
                webSearch: false,
                apiIntegration: true,
                fileSystem: true,
                terminalAccess: true,
                languages: ['typescript', 'javascript', 'python', 'rust'],
                frameworks: ['deno', 'node', 'react', 'svelte'],
                domains: ['web-development', 'backend', 'api-design'],
                tools: ['git', 'editor', 'debugger', 'linter', 'formatter'],
                maxConcurrentTasks: 3,
                maxMemoryUsage: 512 * 1024 * 1024,
                maxExecutionTime: 1200000,
                reliability: 0.95,
                speed: 0.7,
                quality: 0.95
            },
            config: {
                autonomyLevel: 0.6,
                learningEnabled: true,
                adaptationEnabled: true,
                maxTasksPerHour: 10,
                maxConcurrentTasks: 3,
                timeoutThreshold: 1200000,
                reportingInterval: 60000,
                heartbeatInterval: 15000,
                permissions: ['file-read', 'file-write', 'terminal-access', 'git-access'],
                trustedAgents: [],
                expertise: { coding: 0.95, testing: 0.8, debugging: 0.9 },
                preferences: { codeStyle: 'functional', testFramework: 'deno-test' }
            },
            environment: {
                runtime: 'deno',
                version: '1.40.0',
                workingDirectory: './agents/developer',
                tempDirectory: './tmp/developer',
                logDirectory: './logs/developer',
                apiEndpoints: {},
                credentials: {},
                availableTools: ['git', 'deno', 'editor', 'debugger'],
                toolConfigs: {}
            },
            startupScript: './scripts/start-developer.ts'
        });
        // Add more templates...
        this.initializeSpecializedTemplates();
    }
    initializeSpecializedTemplates() {
        // Analyzer template
        this.templates.set('analyst', {
            name: 'Analyzer Agent',
            type: 'analyst',
            capabilities: {
                codeGeneration: false,
                codeReview: true,
                testing: false,
                documentation: true,
                research: false,
                analysis: true,
                webSearch: false,
                apiIntegration: true,
                fileSystem: true,
                terminalAccess: false,
                languages: ['python', 'r', 'sql'],
                frameworks: ['pandas', 'numpy', 'matplotlib'],
                domains: ['data-analysis', 'statistics', 'visualization'],
                tools: ['data-processor', 'chart-generator', 'statistical-analyzer'],
                maxConcurrentTasks: 4,
                maxMemoryUsage: 1024 * 1024 * 1024,
                maxExecutionTime: 900000,
                reliability: 0.9,
                speed: 0.75,
                quality: 0.9
            },
            config: {
                autonomyLevel: 0.7,
                learningEnabled: true,
                adaptationEnabled: true,
                maxTasksPerHour: 15,
                maxConcurrentTasks: 4,
                timeoutThreshold: 900000,
                reportingInterval: 45000,
                heartbeatInterval: 12000,
                permissions: ['file-read', 'data-access'],
                trustedAgents: [],
                expertise: { analysis: 0.95, visualization: 0.8, statistics: 0.85 },
                preferences: { outputFormat: 'detailed', includeCharts: true }
            },
            environment: {
                runtime: 'deno',
                version: '1.40.0',
                workingDirectory: './agents/analyzer',
                tempDirectory: './tmp/analyzer',
                logDirectory: './logs/analyzer',
                apiEndpoints: {},
                credentials: {},
                availableTools: ['data-processor', 'chart-gen', 'stats-calc'],
                toolConfigs: {}
            },
            startupScript: './scripts/start-analyzer.ts'
        });
    }
    async initialize() {
        this.logger.info('Initializing agent manager', {
            maxAgents: this.config.maxAgents,
            templates: this.templates.size
        });
        // Start health monitoring
        this.startHealthMonitoring();
        // Start heartbeat monitoring
        this.startHeartbeatMonitoring();
        // Initialize default scaling policies
        this.initializeScalingPolicies();
        this.emit('agent-manager:initialized');
    }
    async shutdown() {
        this.logger.info('Shutting down agent manager');
        // Stop monitoring
        if (this.healthInterval)
            clearInterval(this.healthInterval);
        if (this.heartbeatInterval)
            clearInterval(this.heartbeatInterval);
        // Gracefully shutdown all agents
        const shutdownPromises = Array.from(this.agents.keys()).map(agentId => this.stopAgent(agentId, 'shutdown'));
        await Promise.all(shutdownPromises);
        this.emit('agent-manager:shutdown');
    }
    // === AGENT LIFECYCLE ===
    async createAgent(templateName, overrides = {}) {
        if (this.agents.size >= this.config.maxAgents) {
            throw new Error('Maximum agent limit reached');
        }
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        const agentId = (0, helpers_js_1.generateId)('agent');
        const swarmId = 'default'; // Could be parameterized
        const agent = {
            id: { id: agentId, swarmId, type: template.type, instance: 1 },
            name: overrides.name || `${template.name}-${agentId.slice(-8)}`,
            type: template.type,
            status: 'initializing',
            capabilities: { ...template.capabilities },
            metrics: this.createDefaultMetrics(),
            workload: 0,
            health: 1.0,
            config: {
                autonomyLevel: template.config.autonomyLevel ?? this.config.agentDefaults.autonomyLevel,
                learningEnabled: template.config.learningEnabled ?? this.config.agentDefaults.learningEnabled,
                adaptationEnabled: template.config.adaptationEnabled ?? this.config.agentDefaults.adaptationEnabled,
                maxTasksPerHour: template.config.maxTasksPerHour ?? 10,
                maxConcurrentTasks: template.config.maxConcurrentTasks ?? 3,
                timeoutThreshold: template.config.timeoutThreshold ?? 300000,
                reportingInterval: template.config.reportingInterval ?? 30000,
                heartbeatInterval: template.config.heartbeatInterval ?? 10000,
                permissions: template.config.permissions ?? [],
                trustedAgents: template.config.trustedAgents ?? [],
                expertise: template.config.expertise ?? {},
                preferences: template.config.preferences ?? {},
                ...overrides.config
            },
            environment: {
                runtime: template.environment.runtime ?? this.config.environmentDefaults.runtime,
                version: template.environment.version ?? '1.40.0',
                workingDirectory: template.environment.workingDirectory ?? this.config.environmentDefaults.workingDirectory,
                tempDirectory: template.environment.tempDirectory ?? this.config.environmentDefaults.tempDirectory,
                logDirectory: template.environment.logDirectory ?? this.config.environmentDefaults.logDirectory,
                apiEndpoints: template.environment.apiEndpoints ?? {},
                credentials: template.environment.credentials ?? {},
                availableTools: template.environment.availableTools ?? [],
                toolConfigs: template.environment.toolConfigs ?? {},
                ...overrides.environment
            },
            endpoints: [],
            lastHeartbeat: new Date(),
            taskHistory: [],
            errorHistory: [],
            childAgents: [],
            collaborators: []
        };
        this.agents.set(agentId, agent);
        this.healthChecks.set(agentId, this.createDefaultHealth(agentId));
        this.logger.info('Created agent', {
            agentId,
            name: agent.name,
            type: agent.type,
            template: templateName
        });
        this.emit('agent:created', { agent });
        // Store in memory for persistence
        await this.memory.store(`agent:${agentId}`, agent, {
            type: 'agent-state',
            tags: [agent.type, 'active'],
            partition: 'state'
        });
        return agentId;
    }
    async startAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        if (agent.status !== 'initializing' && agent.status !== 'offline') {
            throw new Error(`Agent ${agentId} cannot be started from status ${agent.status}`);
        }
        try {
            agent.status = 'initializing';
            this.updateAgentStatus(agentId, 'initializing');
            // Spawn agent process
            const process = await this.spawnAgentProcess(agent);
            this.processes.set(agentId, process);
            // Wait for agent to signal ready
            await this.waitForAgentReady(agentId, this.config.defaultTimeout);
            agent.status = 'idle';
            this.updateAgentStatus(agentId, 'idle');
            this.logger.info('Started agent', { agentId, name: agent.name });
            this.emit('agent:started', { agent });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            agent.status = 'error';
            this.addAgentError(agentId, {
                timestamp: new Date(),
                type: 'startup_failed',
                message: errorMessage,
                context: { agentId },
                severity: 'critical',
                resolved: false
            });
            this.logger.error('Failed to start agent', { agentId, error });
            throw error;
        }
    }
    async stopAgent(agentId, reason = 'user_request') {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        if (agent.status === 'offline' || agent.status === 'terminated') {
            return; // Already stopped
        }
        try {
            agent.status = 'terminating';
            this.updateAgentStatus(agentId, 'terminating');
            // Send graceful shutdown signal
            const process = this.processes.get(agentId);
            if (process && !process.killed) {
                process.kill('SIGTERM');
                // Force kill after timeout
                setTimeout(() => {
                    if (process && !process.killed) {
                        process.kill('SIGKILL');
                    }
                }, this.config.defaultTimeout);
            }
            // Wait for process to exit
            await this.waitForProcessExit(agentId, this.config.defaultTimeout);
            agent.status = 'terminated';
            this.updateAgentStatus(agentId, 'terminated');
            // Cleanup
            this.processes.delete(agentId);
            this.logger.info('Stopped agent', { agentId, reason });
            this.emit('agent:stopped', { agent, reason });
        }
        catch (error) {
            this.logger.error('Failed to stop agent gracefully', { agentId, error });
            // Force cleanup
            this.processes.delete(agentId);
            agent.status = 'terminated';
        }
    }
    async restartAgent(agentId, reason = 'restart_requested') {
        this.logger.info('Restarting agent', { agentId, reason });
        await this.stopAgent(agentId, `restart:${reason}`);
        await this.startAgent(agentId);
        this.emit('agent:restarted', { agentId, reason });
    }
    async removeAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        // Stop agent if running
        if (agent.status !== 'terminated' && agent.status !== 'offline') {
            await this.stopAgent(agentId, 'removal');
        }
        // Remove from all data structures
        this.agents.delete(agentId);
        this.healthChecks.delete(agentId);
        this.resourceUsage.delete(agentId);
        this.performanceHistory.delete(agentId);
        // Remove from pools and clusters
        this.removeAgentFromPoolsAndClusters(agentId);
        // Remove from memory
        await this.memory.deleteEntry(`agent:${agentId}`);
        this.logger.info('Removed agent', { agentId });
        this.emit('agent:removed', { agentId });
    }
    // === AGENT POOLS ===
    async createAgentPool(name, templateName, config) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        const poolId = (0, helpers_js_1.generateId)('pool');
        const pool = {
            id: poolId,
            name,
            type: template.type,
            minSize: config.minSize,
            maxSize: config.maxSize,
            currentSize: 0,
            availableAgents: [],
            busyAgents: [],
            template,
            autoScale: config.autoScale || false,
            scaleUpThreshold: config.scaleUpThreshold || 0.8,
            scaleDownThreshold: config.scaleDownThreshold || 0.3
        };
        this.pools.set(poolId, pool);
        // Create minimum agents
        for (let i = 0; i < config.minSize; i++) {
            const agentId = await this.createAgent(templateName, {
                name: `${name}-${i + 1}`
            });
            await this.startAgent(agentId);
            pool.availableAgents.push({ id: agentId, swarmId: 'default', type: template.type, instance: i + 1 });
            pool.currentSize++;
        }
        this.logger.info('Created agent pool', { poolId, name, minSize: config.minSize });
        this.emit('pool:created', { pool });
        return poolId;
    }
    async scalePool(poolId, targetSize) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            throw new Error(`Pool ${poolId} not found`);
        }
        if (targetSize < pool.minSize || targetSize > pool.maxSize) {
            throw new Error(`Target size ${targetSize} outside pool limits [${pool.minSize}, ${pool.maxSize}]`);
        }
        const currentSize = pool.currentSize;
        const delta = targetSize - currentSize;
        if (delta > 0) {
            // Scale up
            for (let i = 0; i < delta; i++) {
                const agentId = await this.createAgent(pool.template.name, {
                    name: `${pool.name}-${currentSize + i + 1}`
                });
                await this.startAgent(agentId);
                pool.availableAgents.push({
                    id: agentId,
                    swarmId: 'default',
                    type: pool.type,
                    instance: currentSize + i + 1
                });
            }
        }
        else if (delta < 0) {
            // Scale down
            const agentsToRemove = pool.availableAgents.slice(0, Math.abs(delta));
            for (const agentId of agentsToRemove) {
                await this.removeAgent(agentId.id);
                pool.availableAgents = pool.availableAgents.filter(a => a.id !== agentId.id);
            }
        }
        pool.currentSize = targetSize;
        this.logger.info('Scaled pool', { poolId, fromSize: currentSize, toSize: targetSize });
        this.emit('pool:scaled', { pool, fromSize: currentSize, toSize: targetSize });
    }
    // === HEALTH MONITORING ===
    startHealthMonitoring() {
        this.healthInterval = setInterval(() => {
            this.performHealthChecks();
        }, this.config.healthCheckInterval);
        this.logger.info('Started health monitoring', {
            interval: this.config.healthCheckInterval
        });
    }
    startHeartbeatMonitoring() {
        this.heartbeatInterval = setInterval(() => {
            this.checkHeartbeats();
        }, this.config.heartbeatInterval);
        this.logger.info('Started heartbeat monitoring', {
            interval: this.config.heartbeatInterval
        });
    }
    async performHealthChecks() {
        const healthPromises = Array.from(this.agents.keys()).map(agentId => this.checkAgentHealth(agentId));
        await Promise.allSettled(healthPromises);
    }
    async checkAgentHealth(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        const health = this.healthChecks.get(agentId);
        const now = new Date();
        try {
            // Check responsiveness
            const responsiveness = await this.checkResponsiveness(agentId);
            health.components.responsiveness = responsiveness;
            // Check performance
            const performance = this.calculatePerformanceScore(agentId);
            health.components.performance = performance;
            // Check reliability
            const reliability = this.calculateReliabilityScore(agentId);
            health.components.reliability = reliability;
            // Check resource usage
            const resourceScore = this.calculateResourceScore(agentId);
            health.components.resourceUsage = resourceScore;
            // Calculate overall health
            const overall = (responsiveness + performance + reliability + resourceScore) / 4;
            health.overall = overall;
            health.lastCheck = now;
            // Update agent health
            agent.health = overall;
            // Check for issues
            this.detectHealthIssues(agentId, health);
            // Auto-restart if critically unhealthy
            if (overall < 0.3 && this.config.autoRestart) {
                this.logger.warn('Agent critically unhealthy, restarting', { agentId, health: overall });
                await this.restartAgent(agentId, 'health_critical');
            }
        }
        catch (error) {
            this.logger.error('Health check failed', { agentId, error });
            health.overall = 0;
            health.lastCheck = now;
        }
    }
    async checkResponsiveness(agentId) {
        // Send ping and measure response time
        const startTime = Date.now();
        try {
            // This would send an actual ping to the agent
            // For now, simulate based on last heartbeat
            const agent = this.agents.get(agentId);
            const timeSinceHeartbeat = Date.now() - agent.lastHeartbeat.getTime();
            if (timeSinceHeartbeat > this.config.heartbeatInterval * 3) {
                return 0; // Unresponsive
            }
            else if (timeSinceHeartbeat > this.config.heartbeatInterval * 2) {
                return 0.5; // Slow
            }
            else {
                return 1.0; // Responsive
            }
        }
        catch (error) {
            return 0; // Failed to respond
        }
    }
    calculatePerformanceScore(agentId) {
        const history = this.performanceHistory.get(agentId) || [];
        if (history.length === 0)
            return 1.0;
        // Calculate average task completion time vs expected
        const recent = history.slice(-10); // Last 10 entries
        const avgTime = recent.reduce((sum, entry) => sum + entry.metrics.averageExecutionTime, 0) / recent.length;
        // Normalize based on expected performance (simplified)
        const expectedTime = 60000; // 1 minute baseline
        return Math.max(0, Math.min(1, expectedTime / avgTime));
    }
    calculateReliabilityScore(agentId) {
        const agent = this.agents.get(agentId);
        const totalTasks = agent.metrics.tasksCompleted + agent.metrics.tasksFailed;
        if (totalTasks === 0)
            return 1.0;
        return agent.metrics.tasksCompleted / totalTasks;
    }
    calculateResourceScore(agentId) {
        const usage = this.resourceUsage.get(agentId);
        if (!usage)
            return 1.0;
        const limits = this.config.resourceLimits;
        const memoryScore = 1 - (usage.memory / limits.memory);
        const cpuScore = 1 - (usage.cpu / limits.cpu);
        const diskScore = 1 - (usage.disk / limits.disk);
        return Math.max(0, (memoryScore + cpuScore + diskScore) / 3);
    }
    detectHealthIssues(agentId, health) {
        const issues = [];
        if (health.components.responsiveness < 0.5) {
            issues.push({
                type: 'communication',
                severity: health.components.responsiveness < 0.2 ? 'critical' : 'high',
                message: 'Agent is not responding to heartbeats',
                timestamp: new Date(),
                resolved: false,
                recommendedAction: 'Restart agent or check network connectivity'
            });
        }
        if (health.components.performance < 0.6) {
            issues.push({
                type: 'performance',
                severity: health.components.performance < 0.3 ? 'high' : 'medium',
                message: 'Agent performance is below expected levels',
                timestamp: new Date(),
                resolved: false,
                recommendedAction: 'Check resource allocation or agent configuration'
            });
        }
        if (health.components.resourceUsage < 0.4) {
            issues.push({
                type: 'resource',
                severity: health.components.resourceUsage < 0.2 ? 'critical' : 'high',
                message: 'Agent resource usage is critically high',
                timestamp: new Date(),
                resolved: false,
                recommendedAction: 'Increase resource limits or reduce workload'
            });
        }
        health.issues = issues;
    }
    checkHeartbeats() {
        const now = Date.now();
        const timeout = this.config.heartbeatInterval * 3;
        for (const [agentId, agent] of Array.from(this.agents.entries())) {
            const timeSinceHeartbeat = now - agent.lastHeartbeat.getTime();
            if (timeSinceHeartbeat > timeout && agent.status !== 'offline' && agent.status !== 'terminated') {
                this.logger.warn('Agent heartbeat timeout', { agentId, timeSinceHeartbeat });
                agent.status = 'error';
                this.addAgentError(agentId, {
                    timestamp: new Date(),
                    type: 'heartbeat_timeout',
                    message: 'Agent failed to send heartbeat within timeout period',
                    context: { timeout, timeSinceHeartbeat },
                    severity: 'high',
                    resolved: false
                });
                this.emit('agent:heartbeat-timeout', { agentId, timeSinceHeartbeat });
                // Auto-restart if enabled
                if (this.config.autoRestart) {
                    this.restartAgent(agentId, 'heartbeat_timeout').catch(error => {
                        this.logger.error('Failed to auto-restart agent', { agentId, error });
                    });
                }
            }
        }
    }
    // === UTILITY METHODS ===
    async spawnAgentProcess(agent) {
        const env = {
            ...process.env,
            AGENT_ID: agent.id.id,
            AGENT_TYPE: agent.type,
            AGENT_NAME: agent.name,
            WORKING_DIR: agent.environment.workingDirectory,
            LOG_DIR: agent.environment.logDirectory
        };
        const args = [
            'run',
            '--allow-all',
            agent.environment.availableTools[0] || './agents/generic-agent.ts',
            '--config',
            JSON.stringify(agent.config)
        ];
        const childProcess = (0, node_child_process_1.spawn)(agent.environment.runtime, args, {
            env,
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: agent.environment.workingDirectory
        });
        // Handle process events
        childProcess.on('exit', (code) => {
            this.handleProcessExit(agent.id.id, code);
        });
        childProcess.on('error', (error) => {
            this.handleProcessError(agent.id.id, error);
        });
        return childProcess;
    }
    async waitForAgentReady(agentId, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Agent ${agentId} startup timeout`));
            }, timeout);
            const handler = (data) => {
                const readyData = data;
                if (readyData.agentId === agentId) {
                    clearTimeout(timer);
                    this.eventBus.off('agent:ready', handler);
                    resolve();
                }
            };
            this.eventBus.on('agent:ready', handler);
        });
    }
    async waitForProcessExit(agentId, timeout) {
        return new Promise((resolve) => {
            const process = this.processes.get(agentId);
            if (!process || process.killed) {
                resolve();
                return;
            }
            const timer = setTimeout(() => {
                resolve(); // Timeout, continue anyway
            }, timeout);
            process.on('exit', () => {
                clearTimeout(timer);
                resolve();
            });
        });
    }
    handleProcessExit(agentId, code) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        this.logger.info('Agent process exited', { agentId, exitCode: code });
        if (code !== 0 && code !== null) {
            this.addAgentError(agentId, {
                timestamp: new Date(),
                type: 'process_exit',
                message: `Agent process exited with code ${code}`,
                context: { exitCode: code },
                severity: 'high',
                resolved: false
            });
        }
        agent.status = 'offline';
        this.emit('agent:process-exit', { agentId, exitCode: code });
    }
    handleProcessError(agentId, error) {
        this.logger.error('Agent process error', { agentId, error });
        this.addAgentError(agentId, {
            timestamp: new Date(),
            type: 'process_error',
            message: (error instanceof Error ? error.message : String(error)),
            context: { error: error.toString() },
            severity: 'critical',
            resolved: false
        });
        this.emit('agent:process-error', { agentId, error });
    }
    handleHeartbeat(data) {
        const agent = this.agents.get(data.agentId);
        if (!agent)
            return;
        agent.lastHeartbeat = data.timestamp;
        if (data.metrics) {
            this.updateAgentMetrics(data.agentId, data.metrics);
        }
        // Update health if agent was previously unresponsive
        if (agent.status === 'error') {
            agent.status = 'idle';
            this.updateAgentStatus(data.agentId, 'idle');
        }
    }
    handleAgentError(data) {
        this.addAgentError(data.agentId, data.error);
        const agent = this.agents.get(data.agentId);
        if (agent && data.error.severity === 'critical') {
            agent.status = 'error';
            this.updateAgentStatus(data.agentId, 'error');
        }
    }
    updateAgentStatus(agentId, status) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        const oldStatus = agent.status;
        agent.status = status;
        this.emit('agent:status-changed', { agentId, from: oldStatus, to: status });
    }
    updateAgentWorkload(agentId, delta) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        agent.workload = Math.max(0, agent.workload + delta);
    }
    updateAgentMetrics(agentId, metrics) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        agent.metrics = { ...agent.metrics, ...metrics };
        // Store performance history
        const history = this.performanceHistory.get(agentId) || [];
        history.push({ timestamp: new Date(), metrics: { ...metrics } });
        // Keep only last 100 entries
        if (history.length > 100) {
            history.shift();
        }
        this.performanceHistory.set(agentId, history);
    }
    updateResourceUsage(agentId, usage) {
        this.resourceUsage.set(agentId, usage);
    }
    addAgentError(agentId, error) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        agent.errorHistory.push(error);
        // Keep only last 50 errors
        if (agent.errorHistory.length > 50) {
            agent.errorHistory.shift();
        }
    }
    createDefaultMetrics() {
        return {
            tasksCompleted: 0,
            tasksFailed: 0,
            averageExecutionTime: 0,
            successRate: 1.0,
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            networkUsage: 0,
            codeQuality: 0.8,
            testCoverage: 0,
            bugRate: 0,
            userSatisfaction: 0.8,
            totalUptime: 0,
            lastActivity: new Date(),
            responseTime: 0
        };
    }
    createDefaultHealth(agentId) {
        return {
            agentId,
            overall: 1.0,
            components: {
                responsiveness: 1.0,
                performance: 1.0,
                reliability: 1.0,
                resourceUsage: 1.0
            },
            issues: [],
            lastCheck: new Date(),
            trend: 'stable'
        };
    }
    removeAgentFromPoolsAndClusters(agentId) {
        // Remove from pools
        for (const pool of Array.from(this.pools.values())) {
            pool.availableAgents = pool.availableAgents.filter(a => a.id !== agentId);
            pool.busyAgents = pool.busyAgents.filter(a => a.id !== agentId);
            pool.currentSize = pool.availableAgents.length + pool.busyAgents.length;
        }
        // Remove from clusters
        for (const cluster of Array.from(this.clusters.values())) {
            cluster.agents = cluster.agents.filter(a => a.id !== agentId);
        }
    }
    initializeScalingPolicies() {
        // Default auto-scaling policy
        const defaultPolicy = {
            name: 'default-autoscale',
            enabled: true,
            cooldownPeriod: 300000, // 5 minutes
            maxScaleOperations: 10,
            rules: [
                {
                    metric: 'pool-utilization',
                    threshold: 0.8,
                    comparison: 'gt',
                    action: 'scale-up',
                    amount: 1
                },
                {
                    metric: 'pool-utilization',
                    threshold: 0.3,
                    comparison: 'lt',
                    action: 'scale-down',
                    amount: 1
                }
            ]
        };
        this.scalingPolicies.set('default', defaultPolicy);
    }
    // === PUBLIC API ===
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    getAgentsByType(type) {
        return Array.from(this.agents.values()).filter(agent => agent.type === type);
    }
    getAgentsByStatus(status) {
        return Array.from(this.agents.values()).filter(agent => agent.status === status);
    }
    getAgentHealth(agentId) {
        return this.healthChecks.get(agentId);
    }
    getPool(poolId) {
        return this.pools.get(poolId);
    }
    getAllPools() {
        return Array.from(this.pools.values());
    }
    getAgentTemplates() {
        return Array.from(this.templates.values());
    }
    getSystemStats() {
        const agents = Array.from(this.agents.values());
        const healthChecks = Array.from(this.healthChecks.values());
        const healthyAgents = healthChecks.filter(h => h.overall > 0.7).length;
        const averageHealth = healthChecks.reduce((sum, h) => sum + h.overall, 0) / healthChecks.length || 1;
        const resourceUsages = Array.from(this.resourceUsage.values());
        const avgCpu = resourceUsages.reduce((sum, r) => sum + r.cpu, 0) / resourceUsages.length || 0;
        const avgMemory = resourceUsages.reduce((sum, r) => sum + r.memory, 0) / resourceUsages.length || 0;
        const avgDisk = resourceUsages.reduce((sum, r) => sum + r.disk, 0) / resourceUsages.length || 0;
        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'idle' || a.status === 'busy').length,
            healthyAgents,
            pools: this.pools.size,
            clusters: this.clusters.size,
            averageHealth,
            resourceUtilization: {
                cpu: avgCpu,
                memory: avgMemory,
                disk: avgDisk
            }
        };
    }
}
exports.AgentManager = AgentManager;
