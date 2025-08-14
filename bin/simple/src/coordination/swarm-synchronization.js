import { EventEmitter } from 'node:events';
export class SwarmSynchronizer extends EventEmitter {
    eventBus;
    logger;
    config;
    swarmId;
    agentStates = new Map();
    vectorClock = {};
    syncHistory = [];
    consensusProtocol;
    syncTimer;
    heartbeatTimer;
    constructor(swarmId, config = {}, eventBus, logger) {
        super();
        this.eventBus = eventBus;
        this.logger = logger;
        this.swarmId = swarmId;
        this.config = {
            syncInterval: 5000,
            heartbeatInterval: 2000,
            consensusTimeout: 10000,
            maxSyncRetries: 3,
            enableDistributedLocks: true,
            enableEventualConsistency: true,
            enableByzantineFaultTolerance: true,
            ...config,
        };
        this.consensusProtocol = new ConsensusProtocol(this.config, this.logger);
        this.setupEventHandlers();
    }
    async start() {
        this.logger?.info('Starting swarm synchronization', {
            swarmId: this.swarmId,
        });
        this.vectorClock[this.swarmId] = 0;
        this.syncTimer = setInterval(() => {
            this.performSyncCycle().catch((error) => {
                this.logger?.error('Sync cycle failed', { error: error.message });
            });
        }, this.config.syncInterval);
        this.heartbeatTimer = setInterval(() => {
            this.checkAgentHeartbeats();
        }, this.config.heartbeatInterval);
        this.emit('sync:started', { swarmId: this.swarmId });
    }
    async stop() {
        this.logger?.info('Stopping swarm synchronization', {
            swarmId: this.swarmId,
        });
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = undefined;
        }
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        this.emit('sync:stopped', { swarmId: this.swarmId });
    }
    async performSyncCycle() {
        const syncId = this.generateSyncId();
        const startTime = Date.now();
        try {
            this.vectorClock[this.swarmId] =
                (this.vectorClock[this.swarmId] || 0) + 1;
            const localState = await this.gatherLocalState();
            await this.broadcastState(localState, syncId);
            const peerStates = await this.waitForPeerStates(syncId);
            const consensusState = await this.reachConsensus(localState, peerStates);
            await this.applyStateChanges(consensusState);
            await this.createCheckpoint(consensusState);
            this.emit('sync:completed', {
                swarmId: this.swarmId,
                syncId,
                duration: Date.now() - startTime,
                agentCount: consensusState.agentStates.size,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger?.error('Sync cycle failed', {
                swarmId: this.swarmId,
                syncId,
                error: errorMessage,
            });
            this.emit('sync:failed', {
                swarmId: this.swarmId,
                syncId,
                error: errorMessage,
            });
        }
    }
    async gatherLocalState() {
        const agentStates = new Map(this.agentStates);
        const globalMetrics = await this.calculateGlobalMetrics();
        return {
            swarmId: this.swarmId,
            timestamp: new Date(),
            vectorClock: { ...this.vectorClock },
            agentStates,
            globalState: globalMetrics,
            checksum: this.calculateStateChecksum(agentStates, globalMetrics),
        };
    }
    async broadcastState(localState, syncId) {
        if (!this.eventBus)
            return;
        this.eventBus.emit('swarm:sync:broadcast', {
            id: `swarm-sync-broadcast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            version: '1.0.0',
            timestamp: new Date(),
            source: this.swarmId,
            swarmId: this.swarmId,
            sourceSwarmId: this.swarmId,
            syncId,
            syncType: 'state',
            broadcastScope: 'all-agents',
            state: localState,
        });
    }
    async waitForPeerStates(syncId) {
        return new Promise((resolve) => {
            const peerStates = [];
            const timeout = setTimeout(() => resolve(peerStates), this.config.consensusTimeout);
            const responseHandler = (data) => {
                if (data.syncId === syncId && data?.sourceSwarmId !== this.swarmId) {
                    peerStates.push(data?.state);
                    if (peerStates.length >= 3) {
                        clearTimeout(timeout);
                        resolve(peerStates);
                    }
                }
            };
            this.eventBus?.on('swarm:sync:response', responseHandler);
            setTimeout(() => {
                this.eventBus?.off('swarm:sync:response', responseHandler);
            }, this.config.consensusTimeout + 1000);
        });
    }
    async reachConsensus(localState, peerStates) {
        if (this.config.enableByzantineFaultTolerance) {
            return await this.consensusProtocol.byzantineConsensus(localState, peerStates);
        }
        return await this.consensusProtocol.simpleConsensus(localState, peerStates);
    }
    async applyStateChanges(consensusState) {
        for (const [agentId, agentState] of consensusState.agentStates) {
            this.agentStates.set(agentId, agentState);
        }
        this.vectorClock = consensusState.vectorClock;
        if (consensusState.pendingChanges) {
            await this.processPendingChanges(consensusState.pendingChanges);
        }
        this.emit('state:updated', {
            swarmId: this.swarmId,
            agentCount: consensusState.agentStates.size,
            globalState: consensusState.globalState,
        });
    }
    async createCheckpoint(consensusState) {
        const checkpoint = {
            id: this.generateCheckpointId(),
            timestamp: new Date(),
            swarmId: this.swarmId,
            agentStates: new Map(consensusState.agentStates),
            taskQueue: [...(consensusState.taskQueue || [])],
            globalState: { ...consensusState.globalState },
            vectorClock: { ...consensusState.vectorClock },
            checksum: consensusState.checksum,
        };
        this.syncHistory.push(checkpoint);
        if (this.syncHistory.length > 50) {
            this.syncHistory = this.syncHistory.slice(-50);
        }
        this.emit('checkpoint:created', {
            swarmId: this.swarmId,
            checkpointId: checkpoint.id,
            agentCount: checkpoint.agentStates.size,
        });
    }
    checkAgentHeartbeats() {
        const now = Date.now();
        const staleAgents = [];
        for (const [agentId, agentState] of this.agentStates) {
            const timeSinceHeartbeat = now - agentState.lastHeartbeat.getTime();
            if (timeSinceHeartbeat > this.config.heartbeatInterval * 3) {
                staleAgents.push(agentId);
            }
        }
        if (staleAgents.length > 0) {
            this.handleStaleAgents(staleAgents);
        }
    }
    handleStaleAgents(staleAgents) {
        for (const agentId of staleAgents) {
            const agentState = this.agentStates.get(agentId);
            if (agentState) {
                agentState.status = 'offline';
                this.logger?.warn('Agent marked as offline due to missed heartbeats', {
                    agentId,
                });
            }
        }
        this.emit('agents:stale', {
            swarmId: this.swarmId,
            staleAgents,
            totalAgents: this.agentStates.size,
        });
    }
    async calculateGlobalMetrics() {
        const agents = Array.from(this.agentStates.values());
        const activeAgents = agents.filter((a) => a.status !== 'offline').length;
        return {
            activeAgents,
            totalTasks: agents.reduce((sum, a) => sum + a.taskHistory.length, 0),
            completedTasks: agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0),
            averageResponseTime: agents.reduce((sum, a) => sum + a.metrics.responseTime, 0) /
                agents.length,
            systemHealth: (activeAgents / Math.max(agents.length, 1)) * 100,
            resourceUtilization: {
                cpuUsage: agents.reduce((sum, a) => sum + a.metrics.cpuUsage, 0) /
                    agents.length,
                memoryUsage: agents.reduce((sum, a) => sum + a.metrics.memoryUsage, 0) /
                    agents.length,
                networkLatency: 50,
                diskIO: 0,
            },
            consensusRound: this.vectorClock[this.swarmId] || 0,
        };
    }
    setupEventHandlers() {
        if (!this.eventBus)
            return;
        this.eventBus.on('swarm:sync:broadcast', (data) => {
            if (data?.sourceSwarmId !== this.swarmId) {
                this.handlePeerSyncBroadcast(data);
            }
        });
        this.eventBus.on('agent:state:updated', (data) => {
            if (data.swarmId === this.swarmId) {
                this.updateAgentState(data?.agentId, data?.state);
            }
        });
    }
    handlePeerSyncBroadcast(data) {
        if (this.eventBus) {
            this.eventBus.emit('swarm:sync:response', {
                id: `swarm-sync-response-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                version: '1.0.0',
                timestamp: new Date(),
                source: this.swarmId,
                swarmId: this.swarmId,
                syncId: data?.syncId,
                respondingAgentId: this.swarmId,
                responseType: 'ack',
                responseData: this.gatherLocalState(),
                processingTime: 10,
                sourceSwarmId: this.swarmId,
            });
        }
    }
    updateAgentState(agentId, newState) {
        const currentState = this.agentStates.get(agentId);
        if (currentState && typeof newState === 'object' && newState !== null) {
            const updatedState = {
                ...currentState,
                ...newState,
            };
            this.agentStates.set(agentId, updatedState);
            this.vectorClock[this.swarmId] =
                (this.vectorClock[this.swarmId] || 0) + 1;
        }
    }
    getSyncStatus() {
        const lastSync = this.syncHistory[this.syncHistory.length - 1];
        const status = {
            swarmId: this.swarmId,
            isActive: !!this.syncTimer,
            agentCount: this.agentStates.size,
            activeAgents: Array.from(this.agentStates.values()).filter((a) => a.status !== 'offline').length,
            vectorClock: { ...this.vectorClock },
            syncHistory: this.syncHistory.length,
        };
        if (lastSync?.timestamp) {
            status.lastSyncTime = lastSync.timestamp;
        }
        return status;
    }
    generateSyncId() {
        return `sync_${this.swarmId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    generateCheckpointId() {
        return `checkpoint_${this.swarmId}_${Date.now()}`;
    }
    calculateStateChecksum(agentStates, globalState) {
        const crypto = require('node:crypto');
        const data = JSON.stringify({
            agentStates: Array.from(agentStates.entries()),
            globalState,
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    async processPendingChanges(changes) {
        for (const change of changes) {
            try {
                await this.applyStateChange(change);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger?.error('Failed to apply state change', {
                    change,
                    error: errorMessage,
                });
            }
        }
    }
    async applyStateChange(change) {
        this.logger?.debug('Applying state change', { change });
    }
}
class ConsensusProtocol {
    constructor(_config, _logger) {
    }
    async byzantineConsensus(localState, peerStates) {
        const allStates = [localState, ...peerStates];
        const majorityThreshold = Math.floor(allStates.length / 2) + 1;
        const consensusAgentStates = this.findAgentStateConsensus(allStates, majorityThreshold);
        const consensusVectorClock = this.mergeVectorClocks(allStates.map((s) => s.vectorClock));
        return {
            ...localState,
            agentStates: consensusAgentStates,
            vectorClock: consensusVectorClock,
            globalState: await this.calculateConsensusGlobalState(allStates),
            checksum: this.calculateStateChecksum(consensusAgentStates, localState.globalState),
        };
    }
    async simpleConsensus(localState, peerStates) {
        const allStates = [localState, ...peerStates];
        const latestState = allStates.reduce((latest, current) => current?.timestamp > latest.timestamp ? current : latest);
        return {
            ...latestState,
            globalState: await this.calculateConsensusGlobalState(allStates),
        };
    }
    findAgentStateConsensus(states, threshold) {
        const consensusStates = new Map();
        const allAgentIds = new Set();
        states.forEach((state) => {
            state.agentStates.forEach((_, agentId) => allAgentIds.add(agentId));
        });
        for (const agentId of allAgentIds) {
            const agentStates = states
                .map((state) => state.agentStates.get(agentId))
                .filter(Boolean);
            if (agentStates.length >= threshold) {
                const consensusState = agentStates.reduce((latest, current) => current?.lastHeartbeat > latest.lastHeartbeat ? current : latest);
                consensusStates.set(agentId, consensusState);
            }
        }
        return consensusStates;
    }
    mergeVectorClocks(vectorClocks) {
        const merged = {};
        for (const clock of vectorClocks) {
            for (const [swarmId, version] of Object.entries(clock)) {
                merged[swarmId] = Math.max(merged[swarmId] || 0, version);
            }
        }
        return merged;
    }
    async calculateConsensusGlobalState(states) {
        const latestState = states.reduce((latest, current) => current?.timestamp > latest.timestamp ? current : latest);
        return latestState.globalState;
    }
    calculateStateChecksum(agentStates, globalState) {
        const crypto = require('node:crypto');
        const data = JSON.stringify({
            agentStates: Array.from(agentStates.entries()),
            globalState,
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}
export default SwarmSynchronizer;
//# sourceMappingURL=swarm-synchronization.js.map