import { EventEmitter } from 'node:events';
import { initializeCollectiveFACT } from './collective-fact-integration.ts';
export class CollectiveCubeCoordinator extends EventEmitter {
    eventBus;
    logger;
    collectiveRegistry;
    syncInterval = 3000;
    heartbeatInterval = 1000;
    syncTimer;
    heartbeatTimer;
    connectionHealth = new Map();
    collectiveFact;
    constructor(eventBus, logger) {
        super();
        this.eventBus = eventBus;
        this.logger = logger;
        this.collectiveRegistry = {
            availableDrones: new Map(),
            activeCubes: new Map(),
            globalTaskQueue: [],
            taskAssignments: new Map(),
            globalResources: this.initializeGlobalResources(),
            collectiveHealth: this.initializeCollectiveHealth(),
        };
        this.setupEventHandlers();
    }
    async initialize() {
        await this.start();
    }
    async start() {
        this.logger?.info('Starting collective-cube coordination');
        try {
            this.collectiveFact = await initializeCollectiveFACT({
                enableCache: true,
                cacheSize: 10000,
                knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep'],
                autoRefreshInterval: 3600000,
            }, this);
            this.logger?.info('HiveFACT system initialized for universal knowledge');
        }
        catch (error) {
            this.logger?.error('Failed to initialize HiveFACT:', error);
        }
        this.syncTimer = setInterval(() => {
            this.performHiveSync().catch((error) => {
                this.logger?.error('Hive sync failed', { error: error.message });
            });
        }, this.syncInterval);
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeats();
            this.checkSwarmHealth();
        }, this.heartbeatInterval);
        this.emit('hive:coordination:started');
    }
    async shutdown() {
        await this.stop();
    }
    async stop() {
        this.logger?.info('Stopping hive-swarm coordination');
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = undefined;
        }
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        if (this.hiveFact) {
            await this.hiveFact.shutdown();
            this.hiveFact = undefined;
        }
        this.emit('hive:coordination:stopped');
    }
    async performHiveSync() {
        try {
            await this.collectAgentStates();
            await this.updateGlobalResources();
            await this.optimizeTaskDistribution();
            await this.balanceWorkloads();
            await this.updateSwarmMetrics();
            await this.broadcastGlobalState();
            this.updateHiveHealth();
            this.emit('hive:sync:completed', this.getHiveStatus());
        }
        catch (error) {
            this.logger?.error('Hive sync cycle failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            this.emit('hive:sync:failed', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async collectAgentStates() {
        this.eventBus.emit('hive:request:agent_states', {
            timestamp: Date.now(),
            requestId: this.generateRequestId(),
        });
    }
    async updateGlobalResources() {
        const agents = Array.from(this.hiveRegistry.availableAgents.values());
        this.hiveRegistry.globalResources = {
            totalCPU: agents.reduce((sum, _agent) => sum + 100, 0),
            usedCPU: agents.reduce((sum, agent) => sum + (agent.metrics?.cpuUsage ?? 0), 0),
            totalMemory: agents.reduce((sum, _agent) => sum + 1000, 0),
            usedMemory: agents.reduce((sum, agent) => sum + (agent.metrics?.memoryUsage ?? 0), 0),
            totalAgents: agents.length,
            availableAgents: agents.filter((a) => a.availability.status === 'available').length,
            busyAgents: agents.filter((a) => a.availability.status === 'busy').length,
            networkBandwidth: 1000,
        };
    }
    async optimizeTaskDistribution() {
        const pendingTasks = this.hiveRegistry.globalTaskQueue.filter((t) => t.assignedAgents.length === 0);
        const availableAgents = Array.from(this.hiveRegistry.availableAgents.values())
            .filter((agent) => agent.availability.status === 'available')
            .sort((a, b) => a.currentWorkload - b.currentWorkload);
        for (const task of pendingTasks) {
            const suitableAgent = this.findBestAgentForTask(task, availableAgents);
            if (suitableAgent) {
                this.hiveRegistry.taskAssignments.set(task.id, suitableAgent.id.id);
                suitableAgent.availability.status = 'busy';
                suitableAgent.currentWorkload++;
                this.eventBus.emit('hive:task:assigned', {
                    taskId: task.id,
                    agentId: suitableAgent.id,
                    swarmId: suitableAgent.swarmId,
                    task: task,
                });
                this.logger?.debug('Task assigned via hive coordination', {
                    taskId: task.id,
                    agentId: suitableAgent.id,
                    swarmId: suitableAgent.swarmId,
                });
            }
        }
    }
    findBestAgentForTask(task, availableAgents) {
        let bestAgent = null;
        let bestScore = -1;
        for (const agent of availableAgents) {
            const score = this.calculateAgentTaskScore(agent, task);
            if (score > bestScore) {
                bestScore = score;
                bestAgent = agent;
            }
        }
        return bestScore > 0.5 ? bestAgent : null;
    }
    calculateAgentTaskScore(agent, task) {
        let score = 0;
        const requiredCapabilities = task.requirements.capabilities || [];
        const agentCapabilities = agent.capabilities.map((c) => c.type);
        const capabilityMatch = requiredCapabilities.filter((req) => agentCapabilities.includes(req))
            .length / Math.max(requiredCapabilities.length, 1);
        score += capabilityMatch * 0.4;
        const workloadScore = 1 - agent.currentWorkload / agent.availability.maxConcurrentTasks;
        score += workloadScore * 0.3;
        const latencyScore = Math.max(0, 1 - agent.networkLatency / 1000);
        score += latencyScore * 0.2;
        const performanceScore = agent.metrics?.successRate || 0;
        score += performanceScore * 0.1;
        return Math.min(score, 1.0);
    }
    async balanceWorkloads() {
        const swarms = Array.from(this.hiveRegistry.activeSwarms.values());
        const averageWorkload = swarms.reduce((sum, s) => sum + s.taskQueue, 0) / swarms.length;
        for (const swarm of swarms) {
            if (swarm.taskQueue > averageWorkload * 1.5) {
                this.eventBus.emit('hive:load:rebalance', {
                    overloadedSwarmId: swarm.id,
                    currentLoad: swarm.taskQueue,
                    suggestedReduction: swarm.taskQueue - averageWorkload,
                });
            }
        }
    }
    async updateSwarmMetrics() {
        for (const [swarmId, swarmInfo] of this.hiveRegistry.activeSwarms) {
            const swarmAgents = Array.from(this.hiveRegistry.availableAgents.values()).filter((agent) => agent.swarmId === swarmId);
            if (swarmAgents.length > 0) {
                swarmInfo.performance = {
                    averageResponseTime: swarmAgents.reduce((sum, a) => sum + (a.metrics?.responseTime ?? 0), 0) / swarmAgents.length,
                    tasksCompletedPerMinute: swarmAgents.reduce((sum, a) => sum + (a.metrics?.tasksCompleted ?? 0), 0),
                    successRate: swarmAgents.reduce((sum, a) => sum + (a.metrics?.successRate ?? 0), 0) / swarmAgents.length,
                    resourceEfficiency: 1 -
                        swarmAgents.reduce((sum, a) => sum + (a.metrics?.cpuUsage ?? 0), 0) /
                            swarmAgents.length /
                            100,
                    qualityScore: swarmAgents.reduce((sum, a) => sum + (a.metrics?.codeQuality ?? 0), 0) / swarmAgents.length,
                };
            }
        }
    }
    async broadcastGlobalState() {
        const globalState = {
            timestamp: Date.now(),
            availableAgents: this.hiveRegistry.availableAgents.size,
            activeSwarms: this.hiveRegistry.activeSwarms.size,
            globalResources: this.hiveRegistry.globalResources,
            hiveHealth: this.hiveRegistry.hiveHealth,
            taskDistribution: Array.from(this.hiveRegistry.taskAssignments.entries()),
        };
        this.eventBus.emit('hive:global:state', globalState);
    }
    sendHeartbeats() {
        this.eventBus.emit('hive:heartbeat', {
            timestamp: Date.now(),
            hiveHealth: this.hiveRegistry.hiveHealth.overallHealth,
            activeSwarms: this.hiveRegistry.activeSwarms.size,
            availableAgents: this.hiveRegistry.availableAgents.size,
        });
    }
    checkSwarmHealth() {
        const now = Date.now();
        const healthThreshold = 30000;
        for (const [swarmId, swarmInfo] of this.hiveRegistry.activeSwarms) {
            const timeSinceHeartbeat = now - swarmInfo.lastHeartbeat.getTime();
            if (timeSinceHeartbeat > healthThreshold) {
                this.connectionHealth.set(swarmId, 0);
                this.logger?.warn('Swarm health degraded - no recent heartbeat', {
                    swarmId,
                });
                this.eventBus.emit('hive:swarm:unhealthy', {
                    swarmId,
                    lastHeartbeat: swarmInfo.lastHeartbeat,
                    timeSinceHeartbeat,
                });
            }
            else {
                const healthScore = Math.max(0, 100 - timeSinceHeartbeat / 1000);
                this.connectionHealth.set(swarmId, healthScore);
            }
        }
    }
    updateHiveHealth() {
        const swarms = Array.from(this.hiveRegistry.activeSwarms.values());
        const agents = Array.from(this.hiveRegistry.availableAgents.values());
        if (swarms.length === 0 || agents.length === 0) {
            this.collectiveRegistry.collectiveHealth =
                this.initializeCollectiveHealth();
            return;
        }
        const avgSwarmHealth = Array.from(this.connectionHealth.values()).reduce((sum, health) => sum + health, 0) / this.connectionHealth.size;
        const consensus = 85;
        const avgSyncAge = agents.reduce((sum, a) => sum + (Date.now() - a.lastSync.getTime()), 0) /
            agents.length;
        const synchronization = Math.max(0, 100 - avgSyncAge / 1000 / 60);
        const faultTolerance = Math.min(100, (agents.length / Math.max(swarms.length, 1)) * 10);
        const swarmLoads = swarms.map((s) => s.taskQueue);
        const avgLoad = swarmLoads.reduce((sum, load) => sum + load, 0) / swarmLoads.length;
        const maxDeviation = Math.max(...swarmLoads.map((load) => Math.abs(load - avgLoad)));
        const loadBalance = Math.max(0, 100 - (maxDeviation / Math.max(avgLoad, 1)) * 100);
        this.hiveRegistry.hiveHealth = {
            overallHealth: (avgSwarmHealth +
                consensus +
                synchronization +
                faultTolerance +
                loadBalance) /
                5,
            consensus,
            synchronization,
            faultTolerance,
            loadBalance,
        };
    }
    setupEventHandlers() {
        this.eventBus.on('swarm:register', (data) => {
            this.registerSwarmLegacy(data);
        });
        this.eventBus.on('agent:register', (data) => {
            this.registerAgent(data);
        });
        this.eventBus.on('agent:state:update', (data) => {
            this.updateAgentState(data);
        });
        this.eventBus.on('swarm:heartbeat', (data) => {
            this.handleSwarmHeartbeat(data);
        });
        this.eventBus.on('task:completed', (data) => {
            this.handleTaskCompletion(data);
        });
        this.eventBus.on('swarm:disconnect', (data) => {
            this.handleSwarmDisconnect(data);
        });
        this.eventBus.on('swarm:fact:request', async (data) => {
            try {
                const result = await this.requestUniversalFact(data?.swarmId, data?.factType, data?.subject);
                this.eventBus.emit('swarm:fact:response', {
                    requestId: data?.requestId,
                    swarmId: data?.swarmId,
                    factType: data?.factType,
                    subject: data?.subject,
                    content: result,
                    success: true,
                });
            }
            catch (error) {
                this.eventBus.emit('swarm:fact:response', {
                    requestId: data?.requestId,
                    swarmId: data?.swarmId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    success: false,
                });
            }
        });
        if (this.hiveFact) {
            this.hiveFact.on('fact-updated', (data) => {
                this.eventBus.emit('hive:fact:updated', data);
            });
            this.hiveFact.on('fact-refreshed', (data) => {
                this.eventBus.emit('hive:fact:refreshed', data);
            });
        }
    }
    registerSwarmLegacy(data) {
        const swarmInfo = {
            id: data?.swarmId,
            hiveMindId: data?.hiveMindId || 'default',
            topology: data?.topology || 'mesh',
            agentCount: data?.agentCount || 0,
            activeAgents: data?.activeAgents || 0,
            taskQueue: data?.taskQueue || 0,
            performance: data?.performance || this.initializeSwarmPerformance(),
            lastHeartbeat: new Date(),
            location: data?.location,
        };
        this.hiveRegistry.activeSwarms.set(data?.swarmId, swarmInfo);
        this.connectionHealth.set(data?.swarmId, 100);
        this.logger?.info('Swarm registered with hive', { swarmId: data?.swarmId });
        this.emit('swarm:registered', { swarmId: data?.swarmId, swarmInfo });
    }
    registerAgent(data) {
        const agentInfo = {
            ...data?.agentState,
            swarmId: data?.swarmId,
            hiveMindId: data?.hiveMindId || 'default',
            availability: data?.availability || {
                status: 'available',
                currentTasks: 0,
                maxConcurrentTasks: 5,
            },
            lastSync: new Date(),
            networkLatency: data?.networkLatency || 50,
        };
        this.hiveRegistry.availableAgents.set(data?.agentState?.id, agentInfo);
        this.logger?.debug('Agent registered with hive', {
            agentId: data?.agentState?.id,
            swarmId: data?.swarmId,
        });
    }
    updateAgentState(data) {
        const agent = this.hiveRegistry.availableAgents.get(data?.agentId);
        if (agent) {
            Object.assign(agent, data?.updates);
            agent.lastSync = new Date();
        }
    }
    handleSwarmHeartbeat(data) {
        const swarm = this.hiveRegistry.activeSwarms.get(data?.swarmId);
        if (swarm) {
            swarm.lastHeartbeat = new Date();
            swarm.agentCount = data?.agentCount || swarm.agentCount;
            swarm.activeAgents = data?.activeAgents || swarm.activeAgents;
            swarm.taskQueue = data?.taskQueue || swarm.taskQueue;
            this.connectionHealth.set(data?.swarmId, 100);
        }
    }
    handleTaskCompletion(data) {
        this.hiveRegistry.taskAssignments.delete(data?.taskId);
        const agent = this.hiveRegistry.availableAgents.get(data?.agentId);
        if (agent) {
            agent.currentWorkload = Math.max(0, agent.currentWorkload - 1);
            if (agent.currentWorkload === 0) {
                agent.availability.status = 'available';
            }
        }
    }
    handleSwarmDisconnect(data) {
        this.hiveRegistry.activeSwarms.delete(data?.swarmId);
        this.connectionHealth.delete(data?.swarmId);
        for (const [agentId, agent] of this.hiveRegistry.availableAgents) {
            if (agent.swarmId === data?.swarmId) {
                this.hiveRegistry.availableAgents.delete(agentId);
            }
        }
        this.logger?.warn('Swarm disconnected from hive', {
            swarmId: data?.swarmId,
        });
        this.emit('swarm:disconnected', { swarmId: data?.swarmId });
    }
    getHiveStatus() {
        return {
            totalSwarms: this.hiveRegistry.activeSwarms.size,
            totalAgents: this.hiveRegistry.availableAgents.size,
            availableAgents: Array.from(this.hiveRegistry.availableAgents.values()).filter((a) => a.availability.status === 'available').length,
            busyAgents: Array.from(this.hiveRegistry.availableAgents.values()).filter((a) => a.availability.status === 'busy').length,
            pendingTasks: this.hiveRegistry.globalTaskQueue.length,
            globalResources: this.hiveRegistry.globalResources,
            hiveHealth: this.hiveRegistry.hiveHealth,
            swarmHealthScores: Object.fromEntries(this.connectionHealth),
        };
    }
    getHiveFACT() {
        return this.hiveFact;
    }
    async requestUniversalFact(swarmId, factType, subject) {
        if (!this.hiveFact) {
            throw new Error('HiveFACT not initialized');
        }
        const fact = await this.hiveFact.getFact(factType, subject, swarmId);
        if (fact) {
            this.logger?.debug('Universal fact requested', {
                swarmId,
                factType,
                subject,
                accessCount: fact.accessCount,
                swarmsUsing: fact.swarmAccess.size,
            });
            return fact.content;
        }
        return null;
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    initializeGlobalResources() {
        return {
            totalCPU: 0,
            usedCPU: 0,
            totalMemory: 0,
            usedMemory: 0,
            totalAgents: 0,
            availableAgents: 0,
            busyAgents: 0,
            networkBandwidth: 0,
        };
    }
    initializeCollectiveHealth() {
        return {
            overallHealth: 100,
            consensus: 100,
            synchronization: 100,
            faultTolerance: 100,
            loadBalance: 100,
        };
    }
    initializeSwarmPerformance() {
        return {
            averageResponseTime: 0,
            tasksCompletedPerMinute: 0,
            successRate: 1.0,
            resourceEfficiency: 1.0,
            qualityScore: 0,
        };
    }
    async registerSwarm(swarmInfo) {
        this.hiveRegistry.activeSwarms.set(swarmInfo.id, swarmInfo);
        this.logger?.info(`Registered swarm: ${swarmInfo.id}`);
        this.emit('swarm:registered', swarmInfo);
    }
    async unregisterSwarm(swarmId) {
        const swarmInfo = this.hiveRegistry.activeSwarms.get(swarmId);
        if (swarmInfo) {
            this.hiveRegistry.activeSwarms.delete(swarmId);
            this.logger?.info(`Unregistered swarm: ${swarmId}`);
            this.emit('swarm:unregistered', swarmInfo);
        }
    }
    async getSwarmInfo(swarmId) {
        return this.hiveRegistry.activeSwarms.get(swarmId) || null;
    }
    async getAllSwarms() {
        return Array.from(this.hiveRegistry.activeSwarms.values());
    }
    async distributeTask(task) {
        this.hiveRegistry.globalTaskQueue.push(task);
        await this.optimizeTaskDistribution();
        this.emit('task:distributed', task);
    }
    async getGlobalAgents() {
        return Array.from(this.hiveRegistry.availableAgents.values());
    }
    async getCollectiveHealth() {
        return this.hiveRegistry.hiveHealth;
    }
    async getSwarmMetrics(swarmId) {
        const swarm = this.hiveRegistry.activeSwarms.get(swarmId);
        return swarm?.performance || this.initializeSwarmPerformance();
    }
    async getGlobalResourceMetrics() {
        return this.hiveRegistry.globalResources;
    }
    notifyFACTUpdate(fact) {
        this.emit('fact:updated', fact);
    }
    async requestFACTSearch(query) {
        if (this.hiveFact) {
            return await this.hiveFact.searchFacts(query);
        }
        return [];
    }
}
export default HiveSwarmCoordinator;
//# sourceMappingURL=collective-cube-sync.js.map