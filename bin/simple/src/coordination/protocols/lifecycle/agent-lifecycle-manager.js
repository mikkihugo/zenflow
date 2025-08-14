import { spawn, } from 'node:child_process';
import { EventEmitter } from 'node:events';
export class AgentLifecycleManager extends EventEmitter {
    config;
    logger;
    eventBus;
    agents = new Map();
    templates = new Map();
    spawnQueue = [];
    terminationQueue = [];
    healthMonitor;
    performanceTracker;
    capabilityDiscovery;
    scalingEngine;
    recoveryEngine;
    metrics;
    processingInterval;
    healthInterval;
    scalingInterval;
    constructor(config, logger, eventBus) {
        super();
        this.config = config;
        this.logger = logger;
        this.eventBus = eventBus;
        this.healthMonitor = new HealthMonitor(this.config, this.logger);
        this.performanceTracker = new PerformanceTracker(this.config, this.logger);
        this.capabilityDiscovery = new CapabilityDiscovery();
        this.scalingEngine = new ScalingEngine(this.config, this.logger);
        this.recoveryEngine = new RecoveryEngine(this.config, this.logger);
        this.metrics = this.initializeMetrics();
        this.setupEventHandlers();
        this.startProcessing();
    }
    setupEventHandlers() {
        this.eventBus.on('agent:heartbeat', (data) => {
            this.handleAgentHeartbeat(data);
        });
        this.eventBus.on('agent:task-completed', (data) => {
            this.handleTaskCompletion(data);
        });
        this.eventBus.on('agent:task-failed', (data) => {
            this.handleTaskFailure(data);
        });
        this.eventBus.on('agent:error', this.handleAgentError.bind(this));
        this.eventBus.on('system:resource-pressure', this.handleResourcePressure.bind(this));
        this.eventBus.on('workload:demand-change', this.handleDemandChange.bind(this));
    }
    async registerTemplate(template) {
        this.templates.set(template.id, template);
        this.logger.info('Agent template registered', {
            templateId: template.id,
            name: template.name,
            type: template.type,
            capabilities: template.capabilities,
        });
        this.emit('template:registered', { templateId: template.id });
    }
    async spawnAgents(request) {
        const startTime = Date.now();
        const template = this.templates.get(request.templateId);
        if (!template) {
            throw new Error(`Template ${request.templateId} not found`);
        }
        if (this.agents.size + request.count > this.config.maxAgents) {
            throw new Error(`Would exceed maximum agent limit (${this.config.maxAgents})`);
        }
        const result = {
            success: true,
            agentIds: [],
            failures: [],
            duration: 0,
        };
        this.spawnQueue.push(request);
        try {
            for (let i = 0; i < request.count; i++) {
                try {
                    const agentId = await this.spawnSingleAgent(template, request);
                    result?.agentIds.push(agentId);
                }
                catch (error) {
                    result?.failures?.push({
                        error: error instanceof Error ? error.message : String(error),
                        reason: 'spawn_failed',
                    });
                    result.success = false;
                }
            }
            result.duration = Date.now() - startTime;
            this.logger.info('Agent spawn request completed', {
                templateId: request.templateId,
                requested: request.count,
                spawned: result?.agentIds.length,
                failures: result?.failures.length,
                duration: result?.duration,
            });
            this.emit('agents:spawned', { request, result });
            return result;
        }
        catch (error) {
            this.logger.error('Agent spawn request failed', { request, error });
            throw error;
        }
    }
    async terminateAgents(request) {
        const startTime = Date.now();
        const result = {
            success: true,
            terminated: [],
            failures: [],
            duration: 0,
        };
        try {
            for (const agentId of request.agentIds) {
                try {
                    await this.terminateSingleAgent(agentId, request);
                    result?.terminated.push(agentId);
                }
                catch (error) {
                    result?.failures?.push({
                        agentId,
                        error: error instanceof Error ? error.message : String(error),
                    });
                    result.success = false;
                }
            }
            result.duration = Date.now() - startTime;
            this.logger.info('Agent termination request completed', {
                requested: request.agentIds.length,
                terminated: result?.terminated.length,
                failures: result?.failures.length,
                duration: result?.duration,
            });
            this.emit('agents:terminated', { request, result });
            return result;
        }
        catch (error) {
            this.logger.error('Agent termination request failed', { request, error });
            throw error;
        }
    }
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    getAgentsByStatus(status) {
        return Array.from(this.agents.values()).filter((agent) => agent.status === status);
    }
    getAgentsByType(type) {
        return Array.from(this.agents.values()).filter((agent) => agent.type === type);
    }
    getMetrics() {
        this.updateMetrics();
        return { ...this.metrics };
    }
    async getScalingRecommendation() {
        return await this.scalingEngine.analyze(this.agents, this.templates, this.metrics);
    }
    async triggerScaling(templateId, targetCount) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        const currentCount = this.getAgentsByType(template.type).length;
        if (targetCount > currentCount) {
            await this.spawnAgents({
                templateId,
                count: targetCount - currentCount,
                priority: 1,
                requester: 'manual',
                reason: 'manual_scaling',
            });
        }
        else if (targetCount < currentCount) {
            const agentsToTerminate = this.getAgentsByType(template.type)
                .slice(0, currentCount - targetCount)
                .map((agent) => agent.id);
            await this.terminateAgents({
                agentIds: agentsToTerminate,
                reason: 'manual_scaling',
                graceful: true,
                requester: 'manual',
            });
        }
    }
    async checkAgentHealth(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        return await this.healthMonitor.checkHealth(agent);
    }
    getPerformanceRanking(type) {
        let agents = Array.from(this.agents.values());
        if (type) {
            agents = agents.filter((agent) => agent.type === type);
        }
        const scored = agents.map((agent) => ({
            agentId: agent.id,
            score: this.calculatePerformanceScore(agent),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.map((item, index) => ({
            ...item,
            rank: index + 1,
        }));
    }
    async spawnSingleAgent(template, request) {
        const agentId = this.generateAgentId(template.type);
        const agent = {
            id: agentId,
            templateId: template.id,
            name: `${template.name}-${agentId.slice(-8)}`,
            type: template.type,
            status: 'spawning',
            startTime: new Date(),
            lastSeen: new Date(),
            health: this.initializeHealth(),
            performance: this.initializePerformance(),
            resources: this.initializeResourceUsage(),
            capabilities: this.initializeCapabilities(template.capabilities),
            assignments: [],
            errors: [],
            metadata: { ...template.metadata, spawnRequest: request },
        };
        this.agents.set(agentId, agent);
        try {
            const process = await this.createAgentProcess(agent, template);
            agent.process = process;
            agent.pid = process.pid ?? 0;
            agent.status = 'initializing';
            await this.waitForAgentReady(agent, request.timeout ?? this.config.spawnTimeout);
            agent.status = 'ready';
            this.logger.info('Agent spawned successfully', {
                agentId,
                templateId: template.id,
                pid: agent.pid,
            });
            this.startAgentMonitoring(agent);
            this.emit('agent:spawned', { agent });
            return agentId;
        }
        catch (error) {
            agent.status = 'failed';
            this.addAgentError(agent, {
                timestamp: new Date(),
                type: 'startup',
                severity: 'critical',
                message: error instanceof Error ? error.message : String(error),
                context: { templateId: template.id, request },
                recovered: false,
            });
            this.agents.delete(agentId);
            throw error;
        }
    }
    async terminateSingleAgent(agentId, request) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        if (agent.status === 'terminated' || agent.status === 'terminating') {
            return;
        }
        agent.status = 'terminating';
        try {
            if (request.graceful && agent.process) {
                await this.gracefulShutdown(agent, request.timeout || this.config.shutdownTimeout);
            }
            else if (agent.process) {
                agent.process.kill('SIGKILL');
            }
            agent.status = 'terminated';
            this.logger.info('Agent terminated', {
                agentId,
                reason: request.reason,
                graceful: request.graceful,
            });
            this.stopAgentMonitoring(agent);
            this.emit('agent:terminated', { agent, reason: request.reason });
        }
        catch (error) {
            agent.status = 'failed';
            this.addAgentError(agent, {
                timestamp: new Date(),
                type: 'shutdown',
                severity: 'high',
                message: error instanceof Error ? error.message : String(error),
                context: { request },
                recovered: false,
            });
            throw error;
        }
    }
    async createAgentProcess(agent, template) {
        const env = {
            ...process.env,
            ...template.environment,
            AGENT_ID: agent.id,
            AGENT_TYPE: agent.type,
            AGENT_NAME: agent.name,
        };
        const options = {
            env,
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: false,
        };
        const childProcess = spawn(template.executable, template.args, options);
        childProcess?.on('exit', (code, signal) => {
            this.handleProcessExit(agent, code, signal);
        });
        childProcess?.on('error', (error) => {
            this.handleProcessError(agent, error);
        });
        childProcess?.stdout?.on('data', (data) => {
            this.handleProcessOutput(agent, data.toString(), 'stdout');
        });
        childProcess?.stderr?.on('data', (data) => {
            this.handleProcessOutput(agent, data.toString(), 'stderr');
        });
        return childProcess;
    }
    async waitForAgentReady(agent, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Agent ${agent.id} initialization timeout`));
            }, timeout);
            const checkReady = () => {
                setTimeout(() => {
                    clearTimeout(timer);
                    resolve();
                }, 1000);
            };
            checkReady();
        });
    }
    async gracefulShutdown(agent, timeout) {
        return new Promise((resolve, reject) => {
            if (!agent.process) {
                resolve();
                return;
            }
            const timer = setTimeout(() => {
                agent.process?.kill('SIGKILL');
                reject(new Error(`Agent ${agent.id} graceful shutdown timeout`));
            }, timeout);
            agent.process.on('exit', () => {
                clearTimeout(timer);
                resolve();
            });
            agent.process.kill('SIGTERM');
        });
    }
    startAgentMonitoring(_agent) {
    }
    stopAgentMonitoring(_agent) {
    }
    startProcessing() {
        this.processingInterval = setInterval(async () => {
            await this.processSpawnQueue();
            await this.processTerminationQueue();
            await this.updateMetrics();
        }, 1000);
        this.healthInterval = setInterval(async () => {
            await this.performHealthChecks();
            await this.detectUnhealthyAgents();
        }, this.config.healthCheckInterval);
        this.scalingInterval = setInterval(async () => {
            if (this.config.autoScale) {
                await this.performAutoScaling();
            }
        }, 30000);
    }
    async processSpawnQueue() {
        const request = this.spawnQueue.shift();
        if (request) {
        }
    }
    async processTerminationQueue() {
        const request = this.terminationQueue.shift();
        if (request) {
        }
    }
    async performHealthChecks() {
        const healthPromises = Array.from(this.agents.values())
            .filter((agent) => agent.status !== 'terminated' && agent.status !== 'terminating')
            .map((agent) => this.healthMonitor.checkHealth(agent));
        await Promise.allSettled(healthPromises);
    }
    async detectUnhealthyAgents() {
        for (const agent of this.agents.values()) {
            if (agent.health.overall < 0.3 && agent.status !== 'terminated') {
                await this.handleUnhealthyAgent(agent);
            }
        }
    }
    async handleUnhealthyAgent(agent) {
        this.logger.warn('Unhealthy agent detected', {
            agentId: agent.id,
            health: agent.health.overall,
            issues: agent.health.issues,
        });
        if (this.config.autoRestart) {
            try {
                await this.recoveryEngine.recoverAgent(agent, this.templates.get(agent.templateId));
                this.emit('agent:recovered', { agentId: agent.id });
            }
            catch (error) {
                this.logger.error('Agent recovery failed', {
                    agentId: agent.id,
                    error,
                });
                this.emit('agent:recovery-failed', { agentId: agent.id, error });
            }
        }
    }
    async performAutoScaling() {
        for (const template of this.templates.values()) {
            const decision = await this.scalingEngine.analyze(this.agents, this.templates, this.metrics);
            if (decision.action !== 'no_action' && decision.confidence > 0.7) {
                this.logger.info('Auto-scaling triggered', {
                    templateId: template.id,
                    action: decision.action,
                    targetCount: decision.targetCount,
                    reasoning: decision.reasoning,
                });
                await this.executeScalingDecision(template.id, decision);
            }
        }
    }
    async executeScalingDecision(templateId, decision) {
        try {
            if (decision.action === 'scale_up') {
                const spawnCount = decision.targetCount - decision.currentCount;
                await this.spawnAgents({
                    templateId,
                    count: spawnCount,
                    priority: decision.urgency === 'critical' ? 0 : 1,
                    requester: 'auto-scaler',
                    reason: `auto_scale_up: ${decision.reasoning.join(', ')}`,
                });
            }
            else if (decision.action === 'scale_down') {
                const terminateCount = decision.currentCount - decision.targetCount;
                const agentsToTerminate = this.selectAgentsForTermination(templateId, terminateCount);
                await this.terminateAgents({
                    agentIds: agentsToTerminate,
                    reason: `auto_scale_down: ${decision.reasoning.join(', ')}`,
                    graceful: true,
                    requester: 'auto-scaler',
                });
            }
            this.emit('scaling:executed', { templateId, decision });
        }
        catch (error) {
            this.logger.error('Scaling execution failed', {
                templateId,
                decision,
                error,
            });
            this.emit('scaling:failed', { templateId, decision, error });
        }
    }
    selectAgentsForTermination(templateId, count) {
        const template = this.templates.get(templateId);
        if (!template)
            return [];
        const agents = this.getAgentsByType(template.type)
            .filter((agent) => agent.status !== 'terminated' && agent.status !== 'terminating')
            .sort((a, b) => this.calculatePerformanceScore(a) - this.calculatePerformanceScore(b))
            .slice(0, count);
        return agents.map((agent) => agent.id);
    }
    calculatePerformanceScore(agent) {
        const metrics = agent.performance;
        const successRateWeight = 0.3;
        const responseTimeWeight = 0.2;
        const throughputWeight = 0.2;
        const reliabilityWeight = 0.15;
        const efficiencyWeight = 0.15;
        const score = metrics.successRate * successRateWeight +
            Math.max(0, 1 - metrics.averageResponseTime / 10000) *
                responseTimeWeight +
            Math.min(1, metrics.throughput / 100) * throughputWeight +
            metrics.reliability * reliabilityWeight +
            metrics.efficiency * efficiencyWeight;
        return Math.max(0, Math.min(1, score));
    }
    updateMetrics() {
        const agents = Array.from(this.agents.values());
        const agentsByStatus = {
            spawning: 0,
            initializing: 0,
            ready: 0,
            active: 0,
            idle: 0,
            busy: 0,
            degraded: 0,
            unhealthy: 0,
            terminating: 0,
            terminated: 0,
            failed: 0,
        };
        const agentsByType = {};
        let totalHealth = 0;
        let healthyAgents = 0;
        for (const agent of agents) {
            agentsByStatus[agent.status]++;
            agentsByType[agent.type] = (agentsByType[agent.type] || 0) + 1;
            if (agent.status !== 'terminated' && agent.status !== 'failed') {
                totalHealth += agent.health.overall;
                healthyAgents++;
            }
        }
        this.metrics = {
            totalAgents: agents.length,
            agentsByStatus,
            agentsByType,
            spawnRate: this.calculateSpawnRate(),
            terminationRate: this.calculateTerminationRate(),
            averageLifetime: this.calculateAverageLifetime(),
            averageHealth: healthyAgents > 0 ? totalHealth / healthyAgents : 1,
            resourceUtilization: this.calculateResourceUtilization(),
            failureRate: this.calculateFailureRate(),
            recoveryRate: this.calculateRecoveryRate(),
        };
    }
    calculateSpawnRate() {
        const oneHourAgo = Date.now() - 3600000;
        const recentSpawns = Array.from(this.agents.values()).filter((agent) => agent.startTime.getTime() > oneHourAgo);
        return recentSpawns.length;
    }
    calculateTerminationRate() {
        return 0;
    }
    calculateAverageLifetime() {
        const now = Date.now();
        const lifetimes = Array.from(this.agents.values())
            .filter((agent) => agent.status === 'terminated')
            .map((agent) => now - agent.startTime.getTime());
        return lifetimes.length > 0
            ? lifetimes.reduce((sum, time) => sum + time, 0) / lifetimes.length
            : 0;
    }
    calculateResourceUtilization() {
        const agents = Array.from(this.agents.values()).filter((agent) => agent.status !== 'terminated');
        if (agents.length === 0) {
            return this.initializeResourceUsage();
        }
        const totalResources = agents.reduce((sum, agent) => ({
            cpu: sum.cpu + agent.resources.cpu,
            memory: sum.memory + agent.resources.memory,
            network: sum.network + agent.resources.network,
            disk: sum.disk + agent.resources.disk,
            handles: sum.handles + agent.resources.handles,
            threads: sum.threads + agent.resources.threads,
        }), { cpu: 0, memory: 0, network: 0, disk: 0, handles: 0, threads: 0 });
        return {
            ...totalResources,
            gpu: 0,
            timestamp: new Date(),
        };
    }
    calculateFailureRate() {
        const totalAgents = this.metrics.totalAgents;
        const failedAgents = this.metrics.agentsByStatus.failed;
        return totalAgents > 0 ? failedAgents / totalAgents : 0;
    }
    calculateRecoveryRate() {
        return 0.8;
    }
    handleAgentHeartbeat(data) {
        const agent = this.agents.get(data?.agentId);
        if (agent) {
            agent.lastSeen = new Date();
            if (agent.status === 'ready') {
                agent.status = 'idle';
            }
        }
    }
    handleTaskCompletion(data) {
        const agent = this.agents.get(data?.agentId);
        if (agent) {
            agent.performance.tasksCompleted++;
            agent.performance.lastActivity = new Date();
            const assignment = agent.assignments.find((a) => a.taskId === data?.taskId);
            if (assignment) {
                assignment.status = 'completed';
                assignment.progress = 100;
                assignment.quality = data?.quality || 1.0;
            }
            this.performanceTracker.updateMetrics(agent, data);
        }
    }
    handleTaskFailure(data) {
        const agent = this.agents.get(data?.agentId);
        if (agent) {
            agent.performance.tasksFailed++;
            agent.performance.lastActivity = new Date();
            const assignment = agent.assignments.find((a) => a.taskId === data?.taskId);
            if (assignment) {
                assignment.status = 'failed';
            }
            this.addAgentError(agent, {
                timestamp: new Date(),
                type: 'task',
                severity: 'medium',
                message: `Task ${data?.taskId} failed: ${data?.error}`,
                context: data,
                recovered: false,
            });
        }
    }
    handleAgentError(data) {
        const agent = this.agents.get(data?.agentId);
        if (agent) {
            this.addAgentError(agent, data?.error);
            if (data?.error?.severity === 'critical') {
                agent.status = 'unhealthy';
            }
        }
    }
    handleResourcePressure(data) {
        this.logger.warn('System resource pressure detected', data);
        if (data.severity === 'critical') {
            this.emit('resource:pressure-critical', data);
        }
    }
    handleDemandChange(data) {
        this.logger.info('Workload demand change detected', data);
        if (this.config.autoScale) {
            this.performAutoScaling().catch((error) => {
                this.logger.error('Auto-scaling failed after demand change', { error });
            });
        }
    }
    handleProcessExit(agent, code, signal) {
        this.logger.info('Agent process exited', {
            agentId: agent.id,
            code,
            signal,
        });
        if (agent.status !== 'terminating') {
            agent.status = 'failed';
            this.addAgentError(agent, {
                timestamp: new Date(),
                type: 'runtime',
                severity: 'high',
                message: `Process exited unexpectedly (code: ${code}, signal: ${signal})`,
                context: { code, signal },
                recovered: false,
            });
            this.emit('agent:unexpected-exit', { agent, code, signal });
        }
    }
    handleProcessError(agent, error) {
        this.logger.error('Agent process error', {
            agentId: agent.id,
            error: error.message,
        });
        agent.status = 'failed';
        this.addAgentError(agent, {
            timestamp: new Date(),
            type: 'runtime',
            severity: 'critical',
            message: error.message,
            stack: error.stack ?? '',
            context: { error: error.toString() },
            recovered: false,
        });
    }
    handleProcessOutput(agent, data, stream) {
        this.logger.debug(`Agent ${stream}`, {
            agentId: agent.id,
            data: data.trim(),
        });
        this.capabilityDiscovery.processOutput(agent, data, stream);
    }
    addAgentError(agent, error) {
        agent.errors.push(error);
        if (agent.errors.length > 100) {
            agent.errors.shift();
        }
        this.emit('agent:error', { agentId: agent.id, error });
    }
    generateAgentId(type) {
        return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }
    initializeHealth() {
        return {
            overall: 1.0,
            components: {
                responsiveness: 1.0,
                performance: 1.0,
                reliability: 1.0,
                resourceUsage: 1.0,
                connectivity: 1.0,
            },
            issues: [],
            trend: 'stable',
            lastCheck: new Date(),
        };
    }
    initializePerformance() {
        return {
            tasksCompleted: 0,
            tasksFailed: 0,
            averageResponseTime: 0,
            successRate: 1.0,
            throughput: 0,
            efficiency: 1.0,
            reliability: 1.0,
            qualityScore: 1.0,
            uptime: 0,
            lastActivity: new Date(),
            trends: [],
        };
    }
    initializeResourceUsage() {
        return {
            cpu: 0,
            memory: 0,
            network: 0,
            disk: 0,
            handles: 0,
            threads: 0,
            timestamp: new Date(),
        };
    }
    initializeCapabilities(declared) {
        return {
            declared,
            verified: [],
            inferred: [],
            specialized: [],
            quality: {},
            confidence: {},
            lastUpdated: new Date(),
        };
    }
    initializeMetrics() {
        return {
            totalAgents: 0,
            agentsByStatus: {
                spawning: 0,
                initializing: 0,
                ready: 0,
                active: 0,
                idle: 0,
                busy: 0,
                degraded: 0,
                unhealthy: 0,
                terminating: 0,
                terminated: 0,
                failed: 0,
            },
            agentsByType: {},
            spawnRate: 0,
            terminationRate: 0,
            averageLifetime: 0,
            averageHealth: 1.0,
            resourceUtilization: this.initializeResourceUsage(),
            failureRate: 0,
            recoveryRate: 0,
        };
    }
    async shutdown() {
        this.logger.info('Shutting down agent lifecycle manager');
        if (this.processingInterval)
            clearInterval(this.processingInterval);
        if (this.healthInterval)
            clearInterval(this.healthInterval);
        if (this.scalingInterval)
            clearInterval(this.scalingInterval);
        const activeAgents = Array.from(this.agents.values())
            .filter((agent) => agent.status !== 'terminated' && agent.status !== 'terminating')
            .map((agent) => agent.id);
        if (activeAgents.length > 0) {
            await this.terminateAgents({
                agentIds: activeAgents,
                reason: 'system_shutdown',
                graceful: true,
                timeout: this.config.shutdownTimeout,
                requester: 'system',
            });
        }
        this.emit('shutdown');
    }
}
class HealthMonitor {
    _config;
    _logger;
    constructor(_config, _logger) {
        this._config = _config;
        this._logger = _logger;
    }
    async checkHealth(agent) {
        const health = { ...agent.health };
        health.components.responsiveness = this.checkResponsiveness(agent);
        health.components.performance = this.checkPerformance(agent);
        health.components.reliability = this.checkReliability(agent);
        health.components.resourceUsage = this.checkResourceUsage(agent);
        health.components.connectivity = this.checkConnectivity(agent);
        health.overall =
            Object.values(health.components).reduce((sum, val) => sum + val, 0) / 5;
        health.lastCheck = new Date();
        agent.health = health;
        return health;
    }
    checkResponsiveness(agent) {
        const now = Date.now();
        const timeSinceLastSeen = now - agent.lastSeen.getTime();
        if (timeSinceLastSeen > 60000)
            return 0;
        if (timeSinceLastSeen > 30000)
            return 0.5;
        return 1.0;
    }
    checkPerformance(agent) {
        return agent.performance.efficiency;
    }
    checkReliability(agent) {
        return agent.performance.reliability;
    }
    checkResourceUsage(agent) {
        const cpuScore = Math.max(0, 1 - agent.resources.cpu);
        const memoryScore = Math.max(0, 1 - agent.resources.memory);
        return (cpuScore + memoryScore) / 2;
    }
    checkConnectivity(agent) {
        return agent.process && !agent.process.killed ? 1.0 : 0.0;
    }
}
class PerformanceTracker {
    _config;
    _logger;
    constructor(_config, _logger) {
        this._config = _config;
        this._logger = _logger;
    }
    updateMetrics(agent, data) {
        const metrics = agent.performance;
        const totalTasks = metrics.tasksCompleted + metrics.tasksFailed;
        metrics.successRate =
            totalTasks > 0 ? metrics.tasksCompleted / totalTasks : 1.0;
        if (data?.responseTime) {
            metrics.averageResponseTime = this.updateMovingAverage(metrics.averageResponseTime, data?.responseTime, totalTasks);
        }
        metrics.efficiency = Math.min(1.0, metrics.successRate * (1000 / Math.max(1, metrics.averageResponseTime)));
        metrics.reliability = metrics.successRate ** 2;
    }
    updateMovingAverage(current, newValue, count) {
        if (count === 0)
            return newValue;
        return (current * (count - 1) + newValue) / count;
    }
}
class CapabilityDiscovery {
    constructor() {
    }
    processOutput(_agent, _data, _stream) {
    }
}
class ScalingEngine {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async analyze(agents, _templates, metrics) {
        const totalAgents = metrics.totalAgents;
        const utilization = this.calculateUtilization(agents);
        if (utilization > 0.8 && totalAgents < this.config.maxAgents) {
            return {
                action: 'scale_up',
                targetCount: Math.min(totalAgents + 2, this.config.maxAgents),
                currentCount: totalAgents,
                reasoning: ['High utilization detected'],
                confidence: 0.8,
                urgency: 'medium',
            };
        }
        if (utilization < 0.3 && totalAgents > this.config.minAgents) {
            return {
                action: 'scale_down',
                targetCount: Math.max(totalAgents - 1, this.config.minAgents),
                currentCount: totalAgents,
                reasoning: ['Low utilization detected'],
                confidence: 0.7,
                urgency: 'low',
            };
        }
        return {
            action: 'no_action',
            targetCount: totalAgents,
            currentCount: totalAgents,
            reasoning: ['Utilization within target range'],
            confidence: 0.9,
            urgency: 'low',
        };
    }
    calculateUtilization(agents) {
        const activeAgents = Array.from(agents.values()).filter((agent) => agent.status === 'busy' || agent.status === 'active');
        const totalAgents = Array.from(agents.values()).filter((agent) => agent.status !== 'terminated' && agent.status !== 'failed');
        return totalAgents.length > 0
            ? activeAgents.length / totalAgents.length
            : 0;
    }
}
class RecoveryEngine {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async recoverAgent(agent, _template) {
        this.logger.info('Attempting agent recovery', { agentId: agent.id });
        agent.health.overall = 0.8;
        agent.status = 'idle';
    }
}
export default AgentLifecycleManager;
//# sourceMappingURL=agent-lifecycle-manager.js.map