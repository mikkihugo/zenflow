/**
 * Hive-Swarm Synchronization System.
 *
 * Maintains real-time awareness between distributed swarms and the central hive mind.
 * Ensures all swarms know about available agents, task distribution, and global state.
 */
/**
 * @file Coordination system: hive-swarm-sync.
 */
import { EventEmitter } from 'node:events';
// Import HiveFACT from integration module
import { initializeHiveFACT } from './hive-fact-integration.ts';
/**
 * Central hive mind synchronization coordinator.
 *
 * @example
 */
export class HiveSwarmCoordinator extends EventEmitter {
    eventBus;
    logger;
    hiveRegistry;
    syncInterval = 3000; // 3 seconds
    heartbeatInterval = 1000; // 1 second
    syncTimer;
    heartbeatTimer;
    connectionHealth = new Map(); // swarmId -> health score
    hiveFact;
    constructor(eventBus, logger) {
        super();
        this.eventBus = eventBus;
        this.logger = logger;
        this.hiveRegistry = {
            availableAgents: new Map(),
            activeSwarms: new Map(),
            globalTaskQueue: [],
            taskAssignments: new Map(),
            globalResources: this.initializeGlobalResources(),
            hiveHealth: this.initializeHiveHealth(),
        };
        this.setupEventHandlers();
    }
    /**
     * Initialize the hive coordinator.
     * Required by HiveSwarmCoordinatorInterface.
     */
    async initialize() {
        await this.start();
    }
    /**
     * Start hive-swarm synchronization.
     */
    async start() {
        this.logger?.info('Starting hive-swarm coordination');
        // Initialize HiveFACT system for universal knowledge
        try {
            this.hiveFact = await initializeHiveFACT({
                enableCache: true,
                cacheSize: 10000,
                knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep'],
                autoRefreshInterval: 3600000, // 1 hour
            }, this);
            this.logger?.info('HiveFACT system initialized for universal knowledge');
        }
        catch (error) {
            this.logger?.error('Failed to initialize HiveFACT:', error);
        }
        // Start periodic synchronization
        this.syncTimer = setInterval(() => {
            this.performHiveSync().catch((error) => {
                this.logger?.error('Hive sync failed', { error: error.message });
            });
        }, this.syncInterval);
        // Start heartbeat monitoring
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeats();
            this.checkSwarmHealth();
        }, this.heartbeatInterval);
        this.emit('hive:coordination:started');
    }
    /**
     * Shutdown the hive coordinator.
     * Required by HiveSwarmCoordinatorInterface.
     */
    async shutdown() {
        await this.stop();
    }
    /**
     * Stop hive-swarm synchronization.
     */
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
        // Shutdown HiveFACT
        if (this.hiveFact) {
            await this.hiveFact.shutdown();
            this.hiveFact = undefined;
        }
        this.emit('hive:coordination:stopped');
    }
    /**
     * Core hive synchronization process.
     */
    async performHiveSync() {
        try {
            // 1. Collect agent states from all swarms
            await this.collectAgentStates();
            // 2. Update global resource metrics
            await this.updateGlobalResources();
            // 3. Optimize task distribution
            await this.optimizeTaskDistribution();
            // 4. Balance workloads across swarms
            await this.balanceWorkloads();
            // 5. Update swarm performance metrics
            await this.updateSwarmMetrics();
            // 6. Broadcast global state to all swarms
            await this.broadcastGlobalState();
            // 7. Update hive health metrics
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
    /**
     * Collect agent states from all active swarms.
     */
    async collectAgentStates() {
        // Request agent states from all swarms
        this.eventBus.emit('hive:request:agent_states', {
            timestamp: Date.now(),
            requestId: this.generateRequestId(),
        });
        // States will be updated via event handlers
    }
    /**
     * Update global resource metrics.
     */
    async updateGlobalResources() {
        const agents = Array.from(this.hiveRegistry.availableAgents.values());
        this.hiveRegistry.globalResources = {
            totalCPU: agents.reduce((sum, _agent) => sum + 100, 0), // Assume 100% per agent
            usedCPU: agents.reduce((sum, agent) => sum + (agent.metrics?.cpuUsage ?? 0), 0),
            totalMemory: agents.reduce((sum, _agent) => sum + 1000, 0), // Assume 1GB per agent
            usedMemory: agents.reduce((sum, agent) => sum + (agent.metrics?.memoryUsage ?? 0), 0),
            totalAgents: agents.length,
            availableAgents: agents.filter((a) => a.availability.status === 'available').length,
            busyAgents: agents.filter((a) => a.availability.status === 'busy').length,
            networkBandwidth: 1000, // Placeholder
        };
    }
    /**
     * Intelligent task distribution across swarms.
     */
    async optimizeTaskDistribution() {
        const pendingTasks = this.hiveRegistry.globalTaskQueue.filter((t) => t.assignedAgents.length === 0);
        const availableAgents = Array.from(this.hiveRegistry.availableAgents.values())
            .filter((agent) => agent.availability.status === 'available')
            .sort((a, b) => a.currentWorkload - b.currentWorkload); // Least loaded first
        for (const task of pendingTasks) {
            const suitableAgent = this.findBestAgentForTask(task, availableAgents);
            if (suitableAgent) {
                // Assign task to agent
                this.hiveRegistry.taskAssignments.set(task.id, suitableAgent.id.id);
                suitableAgent.availability.status = 'busy';
                suitableAgent.currentWorkload++;
                // Notify the swarm about task assignment
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
    /**
     * Find the best agent for a specific task.
     *
     * @param task
     * @param availableAgents
     */
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
        return bestScore > 0.5 ? bestAgent : null; // Minimum threshold
    }
    /**
     * Calculate how well an agent matches a task.
     *
     * @param agent
     * @param task
     */
    calculateAgentTaskScore(agent, task) {
        let score = 0;
        // Capability matching (40% of score)
        const requiredCapabilities = task.requirements.capabilities || [];
        const agentCapabilities = agent.capabilities.map((c) => c.type);
        const capabilityMatch = requiredCapabilities.filter((req) => agentCapabilities.includes(req)).length /
            Math.max(requiredCapabilities.length, 1);
        score += capabilityMatch * 0.4;
        // Workload balance (30% of score)
        const workloadScore = 1 - agent.currentWorkload / agent.availability.maxConcurrentTasks;
        score += workloadScore * 0.3;
        // Network latency (20% of score)
        const latencyScore = Math.max(0, 1 - agent.networkLatency / 1000); // Lower latency = higher score
        score += latencyScore * 0.2;
        // Agent performance history (10% of score)
        const performanceScore = agent.metrics?.successRate || 0;
        score += performanceScore * 0.1;
        return Math.min(score, 1.0);
    }
    /**
     * Balance workloads across swarms.
     */
    async balanceWorkloads() {
        const swarms = Array.from(this.hiveRegistry.activeSwarms.values());
        const averageWorkload = swarms.reduce((sum, s) => sum + s.taskQueue, 0) / swarms.length;
        for (const swarm of swarms) {
            if (swarm.taskQueue > averageWorkload * 1.5) {
                // Swarm is overloaded - suggest task redistribution
                this.eventBus.emit('hive:load:rebalance', {
                    overloadedSwarmId: swarm.id,
                    currentLoad: swarm.taskQueue,
                    suggestedReduction: swarm.taskQueue - averageWorkload,
                });
            }
        }
    }
    /**
     * Update swarm performance metrics.
     */
    async updateSwarmMetrics() {
        for (const [swarmId, swarmInfo] of this.hiveRegistry.activeSwarms) {
            const swarmAgents = Array.from(this.hiveRegistry.availableAgents.values()).filter((agent) => agent.swarmId === swarmId);
            if (swarmAgents.length > 0) {
                swarmInfo.performance = {
                    averageResponseTime: swarmAgents.reduce((sum, a) => sum + (a.metrics?.responseTime ?? 0), 0) /
                        swarmAgents.length,
                    tasksCompletedPerMinute: swarmAgents.reduce((sum, a) => sum + (a.metrics?.tasksCompleted ?? 0), 0),
                    successRate: swarmAgents.reduce((sum, a) => sum + (a.metrics?.successRate ?? 0), 0) /
                        swarmAgents.length,
                    resourceEfficiency: 1 -
                        swarmAgents.reduce((sum, a) => sum + (a.metrics?.cpuUsage ?? 0), 0) /
                            swarmAgents.length /
                            100,
                    qualityScore: swarmAgents.reduce((sum, a) => sum + (a.metrics?.codeQuality ?? 0), 0) /
                        swarmAgents.length,
                };
            }
        }
    }
    /**
     * Broadcast global state to all swarms.
     */
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
    /**
     * Send heartbeat to all swarms.
     */
    sendHeartbeats() {
        this.eventBus.emit('hive:heartbeat', {
            timestamp: Date.now(),
            hiveHealth: this.hiveRegistry.hiveHealth.overallHealth,
            activeSwarms: this.hiveRegistry.activeSwarms.size,
            availableAgents: this.hiveRegistry.availableAgents.size,
        });
    }
    /**
     * Check health of all swarms.
     */
    checkSwarmHealth() {
        const now = Date.now();
        const healthThreshold = 30000; // 30 seconds
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
    /**
     * Update overall hive health metrics.
     */
    updateHiveHealth() {
        const swarms = Array.from(this.hiveRegistry.activeSwarms.values());
        const agents = Array.from(this.hiveRegistry.availableAgents.values());
        if (swarms.length === 0 || agents.length === 0) {
            this.hiveRegistry.hiveHealth = this.initializeHiveHealth();
            return;
        }
        // Calculate overall health
        const avgSwarmHealth = Array.from(this.connectionHealth.values()).reduce((sum, health) => sum + health, 0) /
            this.connectionHealth.size;
        // Calculate consensus (how well swarms agree on global state)
        const consensus = 85; // Placeholder - would measure actual consensus
        // Calculate synchronization (how up-to-date everything is)
        const avgSyncAge = agents.reduce((sum, a) => sum + (Date.now() - a.lastSync.getTime()), 0) / agents.length;
        const synchronization = Math.max(0, 100 - avgSyncAge / 1000 / 60); // Degrade after 1 minute
        // Calculate fault tolerance
        const faultTolerance = Math.min(100, (agents.length / Math.max(swarms.length, 1)) * 10); // More agents per swarm = better
        // Calculate load balance
        const swarmLoads = swarms.map((s) => s.taskQueue);
        const avgLoad = swarmLoads.reduce((sum, load) => sum + load, 0) / swarmLoads.length;
        const maxDeviation = Math.max(...swarmLoads.map((load) => Math.abs(load - avgLoad)));
        const loadBalance = Math.max(0, 100 - (maxDeviation / Math.max(avgLoad, 1)) * 100);
        this.hiveRegistry.hiveHealth = {
            overallHealth: (avgSwarmHealth + consensus + synchronization + faultTolerance + loadBalance) / 5,
            consensus,
            synchronization,
            faultTolerance,
            loadBalance,
        };
    }
    /**
     * Set up event handlers for hive-swarm communication.
     */
    setupEventHandlers() {
        // Handle swarm registration
        this.eventBus.on('swarm:register', (data) => {
            this.registerSwarmLegacy(data);
        });
        // Handle agent registration
        this.eventBus.on('agent:register', (data) => {
            this.registerAgent(data);
        });
        // Handle agent state updates
        this.eventBus.on('agent:state:update', (data) => {
            this.updateAgentState(data);
        });
        // Handle swarm heartbeats
        this.eventBus.on('swarm:heartbeat', (data) => {
            this.handleSwarmHeartbeat(data);
        });
        // Handle task completions
        this.eventBus.on('task:completed', (data) => {
            this.handleTaskCompletion(data);
        });
        // Handle swarm disconnection
        this.eventBus.on('swarm:disconnect', (data) => {
            this.handleSwarmDisconnect(data);
        });
        // Handle FACT requests from swarms
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
        // Handle FACT updates from HiveFACT
        if (this.hiveFact) {
            this.hiveFact.on('fact-updated', (data) => {
                // Notify all swarms about updated facts
                this.eventBus.emit('hive:fact:updated', data);
            });
            this.hiveFact.on('fact-refreshed', (data) => {
                // Notify interested swarms about refreshed facts
                this.eventBus.emit('hive:fact:refreshed', data);
            });
        }
    }
    /**
     * Register a new swarm with the hive.
     *
     * @param data
     */
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
    /**
     * Register a new agent with the hive.
     *
     * @param data
     */
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
    /**
     * Update agent state in hive registry.
     *
     * @param data
     */
    updateAgentState(data) {
        const agent = this.hiveRegistry.availableAgents.get(data?.agentId);
        if (agent) {
            Object.assign(agent, data?.updates);
            agent.lastSync = new Date();
        }
    }
    /**
     * Handle swarm heartbeat.
     *
     * @param data
     */
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
    /**
     * Handle task completion.
     *
     * @param data
     */
    handleTaskCompletion(data) {
        // Remove from task assignments
        this.hiveRegistry.taskAssignments.delete(data?.taskId);
        // Update agent availability
        const agent = this.hiveRegistry.availableAgents.get(data?.agentId);
        if (agent) {
            agent.currentWorkload = Math.max(0, agent.currentWorkload - 1);
            if (agent.currentWorkload === 0) {
                agent.availability.status = 'available';
            }
        }
    }
    /**
     * Handle swarm disconnection.
     *
     * @param data
     */
    handleSwarmDisconnect(data) {
        // Remove swarm
        this.hiveRegistry.activeSwarms.delete(data?.swarmId);
        this.connectionHealth.delete(data?.swarmId);
        // Remove agents from this swarm
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
    /**
     * Get current hive status.
     */
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
    /**
     * Get HiveFACT system for universal knowledge access.
     */
    getHiveFACT() {
        return this.hiveFact;
    }
    /**
     * Request universal fact from HiveFACT
     * Used by swarms to access universal knowledge.
     *
     * @param swarmId
     * @param factType
     * @param subject
     */
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
    // Utility methods
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
    initializeHiveHealth() {
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
    // Interface compatibility methods required by HiveSwarmCoordinatorInterface
    /**
     * Register a swarm with the hive coordinator.
     */
    async registerSwarm(swarmInfo) {
        this.hiveRegistry.activeSwarms.set(swarmInfo.id, swarmInfo);
        this.logger?.info(`Registered swarm: ${swarmInfo.id}`);
        this.emit('swarm:registered', swarmInfo);
    }
    /**
     * Unregister a swarm from the hive coordinator.
     */
    async unregisterSwarm(swarmId) {
        const swarmInfo = this.hiveRegistry.activeSwarms.get(swarmId);
        if (swarmInfo) {
            this.hiveRegistry.activeSwarms.delete(swarmId);
            this.logger?.info(`Unregistered swarm: ${swarmId}`);
            this.emit('swarm:unregistered', swarmInfo);
        }
    }
    /**
     * Get information about a specific swarm.
     */
    async getSwarmInfo(swarmId) {
        return this.hiveRegistry.activeSwarms.get(swarmId) || null;
    }
    /**
     * Get information about all registered swarms.
     */
    async getAllSwarms() {
        return Array.from(this.hiveRegistry.activeSwarms.values());
    }
    /**
     * Distribute a task across the swarm network.
     */
    async distributeTask(task) {
        this.hiveRegistry.globalTaskQueue.push(task);
        await this.optimizeTaskDistribution();
        this.emit('task:distributed', task);
    }
    /**
     * Get list of all global agents.
     */
    async getGlobalAgents() {
        return Array.from(this.hiveRegistry.availableAgents.values());
    }
    /**
     * Get hive health metrics.
     */
    async getHiveHealth() {
        return this.hiveRegistry.hiveHealth;
    }
    /**
     * Get metrics for a specific swarm.
     */
    async getSwarmMetrics(swarmId) {
        const swarm = this.hiveRegistry.activeSwarms.get(swarmId);
        return swarm?.performance || this.initializeSwarmPerformance();
    }
    /**
     * Get global resource metrics.
     */
    async getGlobalResourceMetrics() {
        return this.hiveRegistry.globalResources;
    }
    /**
     * Notify about FACT updates (optional interface method).
     */
    notifyFACTUpdate(fact) {
        this.emit('fact:updated', fact);
    }
    /**
     * Request FACT search (optional interface method).
     */
    async requestFACTSearch(query) {
        if (this.hiveFact) {
            return await this.hiveFact.searchFacts(query);
        }
        return [];
    }
}
export default HiveSwarmCoordinator;
