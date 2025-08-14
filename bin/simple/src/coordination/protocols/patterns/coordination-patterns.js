import { createHash, randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
export class CoordinationPatterns extends EventEmitter {
    logger;
    eventBus;
    nodes = new Map();
    leaderElection;
    consensusEngine;
    workStealingSystem;
    hierarchicalCoordinator;
    currentPattern = 'hybrid';
    patternMetrics;
    constructor(nodeId, config, logger, eventBus) {
        super();
        this.logger = logger;
        this.eventBus = eventBus;
        this.leaderElection = new LeaderElection(nodeId, config?.election, logger, eventBus);
        this.consensusEngine = new ConsensusEngine(nodeId, config?.consensus, logger, eventBus);
        this.workStealingSystem = new WorkStealingSystem(nodeId, config?.workStealing, logger, eventBus);
        this.hierarchicalCoordinator = new HierarchicalCoordinator(nodeId, config?.hierarchical, logger, eventBus);
        this.patternMetrics = this.initializeMetrics();
        this.setupEventHandlers();
        this.startCoordination();
    }
    setupEventHandlers() {
        this.leaderElection.on('leader:elected', (data) => {
            this.handleLeaderElected(data);
        });
        this.leaderElection.on('leader:failed', (data) => {
            this.handleLeaderFailed(data);
        });
        this.consensusEngine.on('consensus:reached', (data) => {
            this.handleConsensusReached(data);
        });
        this.consensusEngine.on('log:committed', (data) => {
            this.handleLogCommitted(data);
        });
        this.workStealingSystem.on('work:stolen', (data) => {
            this.handleWorkStolen(data);
        });
        this.workStealingSystem.on('work:completed', (data) => {
            this.handleWorkCompleted(data);
        });
        this.hierarchicalCoordinator.on('delegation:created', (data) => {
            this.handleDelegationCreated(data);
        });
        this.hierarchicalCoordinator.on('escalation:triggered', (data) => {
            this.handleEscalationTriggered(data);
        });
        this.eventBus.on('node:joined', (data) => {
            this.handleNodeJoined(data);
        });
        this.eventBus.on('node:left', (data) => {
            this.handleNodeLeft(data);
        });
        this.eventBus.on('network:partition', (data) => {
            this.handleNetworkPartition(data);
        });
    }
    async registerNode(node) {
        this.nodes.set(node?.id, node);
        this.logger.info('Node registered for coordination', {
            nodeId: node?.id,
            type: node?.type,
            capabilities: node?.capabilities,
        });
        await this.leaderElection.addNode(node);
        await this.consensusEngine.addNode(node);
        await this.workStealingSystem.addNode(node);
        await this.hierarchicalCoordinator.addNode(node);
        this.emit('node:registered', { nodeId: node?.id });
    }
    async startElection() {
        return await this.leaderElection.startElection();
    }
    async proposeConsensus(value) {
        return await this.consensusEngine.propose(value);
    }
    async submitWork(item) {
        return await this.workStealingSystem.submitWork(item);
    }
    async delegateTask(request) {
        return await this.hierarchicalCoordinator.delegate(request);
    }
    async escalate(request) {
        return await this.hierarchicalCoordinator.escalate(request);
    }
    async switchPattern(pattern) {
        const oldPattern = this.currentPattern;
        this.currentPattern = pattern;
        this.logger.info('Coordination pattern switched', {
            from: oldPattern,
            to: pattern,
        });
        await this.reconfigureForPattern(pattern);
        this.emit('pattern:switched', { from: oldPattern, to: pattern });
    }
    getCoordinationStatus() {
        return {
            pattern: this.currentPattern,
            leader: this.leaderElection.getCurrentLeader() || undefined,
            consensusState: this.consensusEngine.getState(),
            workQueues: this.workStealingSystem.getQueueCount(),
            hierarchyDepth: this.hierarchicalCoordinator.getDepth(),
            metrics: this.patternMetrics,
        };
    }
    getMetrics() {
        return { ...this.patternMetrics };
    }
    async reconfigureForPattern(pattern) {
        switch (pattern) {
            case 'leader-follower':
                await this.leaderElection.enable();
                await this.consensusEngine.disable();
                await this.workStealingSystem.disable();
                await this.hierarchicalCoordinator.disable();
                break;
            case 'consensus':
                await this.leaderElection.disable();
                await this.consensusEngine.enable();
                await this.workStealingSystem.disable();
                await this.hierarchicalCoordinator.disable();
                break;
            case 'work-stealing':
                await this.leaderElection.disable();
                await this.consensusEngine.disable();
                await this.workStealingSystem.enable();
                await this.hierarchicalCoordinator.disable();
                break;
            case 'hierarchical':
                await this.leaderElection.disable();
                await this.consensusEngine.disable();
                await this.workStealingSystem.disable();
                await this.hierarchicalCoordinator.enable();
                break;
            case 'hybrid':
                await this.leaderElection.enable();
                await this.consensusEngine.enable();
                await this.workStealingSystem.enable();
                await this.hierarchicalCoordinator.enable();
                break;
        }
    }
    startCoordination() {
        this.leaderElection.start();
        this.consensusEngine.start();
        this.workStealingSystem.start();
        this.hierarchicalCoordinator.start();
        setInterval(() => {
            this.updateMetrics();
        }, 5000);
    }
    updateMetrics() {
        this.patternMetrics = {
            electionCount: this.leaderElection.getElectionCount(),
            consensusOperations: this.consensusEngine.getOperationCount(),
            workItemsProcessed: this.workStealingSystem.getProcessedCount(),
            delegationsActive: this.hierarchicalCoordinator.getActiveDelegations(),
            averageLatency: this.calculateAverageLatency(),
            throughput: this.calculateThroughput(),
            failureRate: this.calculateFailureRate(),
            coordinationEfficiency: this.calculateCoordinationEfficiency(),
        };
    }
    calculateAverageLatency() {
        return ((this.leaderElection.getAverageLatency() +
            this.consensusEngine.getAverageLatency() +
            this.workStealingSystem.getAverageLatency() +
            this.hierarchicalCoordinator.getAverageLatency()) /
            4);
    }
    calculateThroughput() {
        return (this.consensusEngine.getThroughput() +
            this.workStealingSystem.getThroughput() +
            this.hierarchicalCoordinator.getThroughput());
    }
    calculateFailureRate() {
        const totalOperations = this.consensusEngine.getOperationCount() +
            this.workStealingSystem.getProcessedCount() +
            this.hierarchicalCoordinator.getActiveDelegations();
        const failures = this.consensusEngine.getFailureCount() +
            this.workStealingSystem.getFailureCount() +
            this.hierarchicalCoordinator.getFailureCount();
        return totalOperations > 0 ? failures / totalOperations : 0;
    }
    calculateCoordinationEfficiency() {
        const successfulOps = this.consensusEngine.getSuccessfulOperations() +
            this.workStealingSystem.getSuccessfulOperations() +
            this.hierarchicalCoordinator.getSuccessfulOperations();
        const totalOps = this.consensusEngine.getOperationCount() +
            this.workStealingSystem.getProcessedCount() +
            this.hierarchicalCoordinator.getActiveDelegations();
        return totalOps > 0 ? successfulOps / totalOps : 1;
    }
    handleLeaderElected(data) {
        this.logger.info('Leader elected', data);
        this.emit('coordination:leader-elected', data);
    }
    handleLeaderFailed(data) {
        this.logger.warn('Leader failed', data);
        this.emit('coordination:leader-failed', data);
    }
    handleConsensusReached(data) {
        this.logger.info('Consensus reached', data);
        this.emit('coordination:consensus-reached', data);
    }
    handleLogCommitted(data) {
        this.logger.debug('Log entry committed', data);
        this.emit('coordination:log-committed', data);
    }
    handleWorkStolen(data) {
        this.logger.debug('Work stolen', data);
        this.emit('coordination:work-stolen', data);
    }
    handleWorkCompleted(data) {
        this.logger.debug('Work completed', data);
        this.emit('coordination:work-completed', data);
    }
    handleDelegationCreated(data) {
        this.logger.info('Delegation created', data);
        this.emit('coordination:delegation-created', data);
    }
    handleEscalationTriggered(data) {
        this.logger.warn('Escalation triggered', data);
        this.emit('coordination:escalation-triggered', data);
    }
    handleNodeJoined(data) {
        const node = {
            id: data?.nodeId,
            type: 'follower',
            status: 'active',
            capabilities: data?.capabilities || [],
            load: 0,
            priority: data?.priority || 1,
            lastHeartbeat: new Date(),
            metadata: data?.metadata || {},
        };
        this.registerNode(node);
    }
    handleNodeLeft(data) {
        this.nodes.delete(data?.nodeId);
        this.leaderElection.removeNode(data?.nodeId);
        this.consensusEngine.removeNode(data?.nodeId);
        this.workStealingSystem.removeNode(data?.nodeId);
        this.hierarchicalCoordinator.removeNode(data?.nodeId);
    }
    handleNetworkPartition(data) {
        this.logger.warn('Network partition detected', data);
        if (this.currentPattern === 'consensus') {
            this.switchPattern('leader-follower');
        }
    }
    initializeMetrics() {
        return {
            electionCount: 0,
            consensusOperations: 0,
            workItemsProcessed: 0,
            delegationsActive: 0,
            averageLatency: 0,
            throughput: 0,
            failureRate: 0,
            coordinationEfficiency: 1,
        };
    }
    async shutdown() {
        await this.leaderElection.shutdown();
        await this.consensusEngine.shutdown();
        await this.workStealingSystem.shutdown();
        await this.hierarchicalCoordinator.shutdown();
        this.emit('shutdown');
        this.logger.info('Coordination patterns shutdown');
    }
}
class LeaderElection extends EventEmitter {
    nodeId;
    config;
    logger;
    eventBus;
    state;
    nodes = new Map();
    enabled = true;
    electionCount = 0;
    latencyHistory = [];
    constructor(nodeId, config, logger, eventBus) {
        super();
        this.nodeId = nodeId;
        this.config = config;
        this.logger = logger;
        this.eventBus = eventBus;
        this.state = {
            currentTerm: 0,
            state: 'follower',
            votes: new Set(),
            lastElection: new Date(),
        };
    }
    async start() {
        if (!this.enabled)
            return;
        this.logger.info('Starting leader election', {
            algorithm: this.config.algorithm,
        });
        this.setupHeartbeat();
    }
    async addNode(node) {
        this.nodes.set(node?.id, node);
    }
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        if (this.state.currentLeader === nodeId) {
            this.startElection();
        }
    }
    async startElection() {
        if (!this.enabled)
            throw new Error('Leader election disabled');
        const startTime = Date.now();
        this.electionCount++;
        this.logger.info('Starting leader election', {
            term: this.state.currentTerm + 1,
            algorithm: this.config.algorithm,
        });
        try {
            let newLeader;
            switch (this.config.algorithm) {
                case 'bully':
                    newLeader = await this.bullyElection();
                    break;
                case 'ring':
                    newLeader = await this.ringElection();
                    break;
                case 'raft':
                    newLeader = await this.raftElection();
                    break;
                case 'fast-bully':
                    newLeader = await this.fastBullyElection();
                    break;
                default:
                    newLeader = await this.bullyElection();
            }
            const latency = Date.now() - startTime;
            this.latencyHistory.push(latency);
            if (this.latencyHistory.length > 100) {
                this.latencyHistory.shift();
            }
            this.state.currentLeader = newLeader;
            this.state.state = newLeader === this.nodeId ? 'leader' : 'follower';
            this.state.lastElection = new Date();
            this.emit('leader:elected', {
                leaderId: newLeader,
                term: this.state.currentTerm,
                latency,
            });
            return newLeader;
        }
        catch (error) {
            this.logger.error('Leader election failed', { error });
            throw error;
        }
    }
    getCurrentLeader() {
        return this.state.currentLeader;
    }
    getElectionCount() {
        return this.electionCount;
    }
    getAverageLatency() {
        return this.latencyHistory.length > 0
            ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) /
                this.latencyHistory.length
            : 0;
    }
    async enable() {
        this.enabled = true;
        await this.start();
    }
    async disable() {
        this.enabled = false;
        if (this.state.electionTimeout) {
            clearTimeout(this.state.electionTimeout);
        }
    }
    async bullyElection() {
        this.state.currentTerm++;
        this.state.state = 'candidate';
        const myPriority = this.getNodePriority(this.nodeId);
        const higherPriorityNodes = Array.from(this.nodes.values()).filter((node) => node?.id !== this.nodeId &&
            node?.status === 'active' &&
            this.getNodePriority(node?.id) > myPriority);
        if (higherPriorityNodes.length === 0) {
            await this.announceVictory();
            return this.nodeId;
        }
        const responses = await this.sendElectionMessages(higherPriorityNodes?.map((n) => n.id));
        if (responses.length === 0) {
            await this.announceVictory();
            return this.nodeId;
        }
        return await this.waitForCoordinator();
    }
    async ringElection() {
        const sortedNodes = Array.from(this.nodes.values())
            .filter((node) => node?.status === 'active')
            .sort((a, b) => a.id.localeCompare(b.id));
        const myIndex = sortedNodes?.findIndex((node) => node?.id === this.nodeId);
        if (myIndex === -1)
            throw new Error('Node not found in ring');
        let highestPriority = -1;
        let leaderId = this.nodeId;
        for (const node of sortedNodes) {
            const priority = this.getNodePriority(node?.id);
            if (priority > highestPriority) {
                highestPriority = priority;
                leaderId = node?.id;
            }
        }
        return leaderId;
    }
    async raftElection() {
        this.state.currentTerm++;
        this.state.state = 'candidate';
        this.state.votedFor = this.nodeId;
        this.state.votes.clear();
        this.state.votes.add(this.nodeId);
        const voteRequests = Array.from(this.nodes.keys())
            .filter((nodeId) => nodeId !== this.nodeId)
            .map((nodeId) => this.sendVoteRequest(nodeId));
        const responses = await Promise.allSettled(voteRequests);
        const grantedVotes = responses?.filter((result) => result?.status === 'fulfilled' && result?.value).length + 1;
        const majority = Math.floor(this.nodes.size / 2) + 1;
        if (grantedVotes >= majority) {
            this.state.state = 'leader';
            return this.nodeId;
        }
        this.state.state = 'follower';
        throw new Error('Failed to achieve majority');
    }
    async fastBullyElection() {
        return await this.bullyElection();
    }
    async sendElectionMessages(nodeIds) {
        const promises = nodeIds.map((nodeId) => this.sendElectionMessage(nodeId));
        const results = await Promise.allSettled(promises);
        return results
            ?.filter((result) => result?.status === 'fulfilled')
            .map((result) => result.value);
    }
    async sendElectionMessage(nodeId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ nodeId, response: 'answer' });
            }, Math.random() * 100);
        });
    }
    async sendVoteRequest(_nodeId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Math.random() > 0.3);
            }, Math.random() * 100);
        });
    }
    async announceVictory() {
        this.logger.info('Announcing election victory', { nodeId: this.nodeId });
        const announcements = Array.from(this.nodes.keys())
            .filter((nodeId) => nodeId !== this.nodeId)
            .map((nodeId) => this.sendCoordinatorMessage(nodeId));
        await Promise.allSettled(announcements);
    }
    async sendCoordinatorMessage(_nodeId) {
        return new Promise((resolve) => {
            setTimeout(resolve, 10);
        });
    }
    async waitForCoordinator() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Coordinator announcement timeout'));
            }, this.config.timeoutMs);
            setTimeout(() => {
                clearTimeout(timeout);
                const highestPriorityNode = Array.from(this.nodes.values())
                    .filter((node) => node?.status === 'active')
                    .sort((a, b) => this.getNodePriority(b.id) - this.getNodePriority(a.id))[0];
                resolve(highestPriorityNode?.id || this.nodeId);
            }, Math.random() * 200);
        });
    }
    setupHeartbeat() {
        setInterval(() => {
            if (this.state.state === 'leader') {
                this.sendHeartbeats();
            }
            else {
                this.checkLeaderHealth();
            }
        }, this.config.heartbeatInterval);
    }
    sendHeartbeats() {
        for (const nodeId of this.nodes.keys()) {
            if (nodeId !== this.nodeId) {
                this.sendHeartbeat(nodeId);
            }
        }
    }
    sendHeartbeat(nodeId) {
        this.eventBus.emit('heartbeat:sent', {
            id: `heartbeat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            version: '1.0.0',
            timestamp: new Date(),
            source: this.nodeId,
            heartbeatId: `heartbeat-${this.nodeId}-${Date.now()}`,
            fromNodeId: this.nodeId,
            from: this.nodeId,
            toNodeId: nodeId,
            heartbeatType: 'node',
            sequenceNumber: this.state.currentTerm,
            interval: 1000,
            payload: {
                status: 'healthy',
                load: 0.5,
                responseTime: 10,
                lastActivity: new Date(),
            },
            expectedResponse: true,
        });
    }
    checkLeaderHealth() {
        if (!this.state.currentLeader)
            return;
        const leader = this.nodes.get(this.state.currentLeader);
        if (!leader)
            return;
        const timeSinceLastHeartbeat = Date.now() - leader.lastHeartbeat.getTime();
        if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 3) {
            this.logger.warn('Leader appears to be failed', {
                leaderId: this.state.currentLeader,
            });
            this.emit('leader:failed', { leaderId: this.state.currentLeader });
            this.startElection().catch((error) => {
                this.logger.error('Failed to start election after leader failure', {
                    error,
                });
            });
        }
    }
    getNodePriority(nodeId) {
        const node = this.nodes.get(nodeId);
        return node?.priority || 0;
    }
    async shutdown() {
        this.enabled = false;
        if (this.state.electionTimeout) {
            clearTimeout(this.state.electionTimeout);
        }
        this.logger.info('Leader election shutdown');
    }
}
class ConsensusEngine extends EventEmitter {
    nodeId;
    config;
    logger;
    state;
    nodes = new Map();
    enabled = true;
    operationCount = 0;
    successfulOperations = 0;
    failureCount = 0;
    latencyHistory = [];
    constructor(nodeId, config, logger, _eventBus) {
        super();
        this.nodeId = nodeId;
        this.config = config;
        this.logger = logger;
        this.state = {
            currentTerm: 0,
            log: [],
            commitIndex: -1,
            lastApplied: -1,
            nextIndex: new Map(),
            matchIndex: new Map(),
            state: 'follower',
            votes: new Set(),
        };
    }
    async start() {
        if (!this.enabled)
            return;
        this.logger.info('Starting consensus engine', {
            algorithm: this.config.algorithm,
        });
        this.setupElectionTimeout();
    }
    async addNode(node) {
        this.nodes.set(node?.id, node);
        this.state.nextIndex.set(node?.id, this.state.log.length);
        this.state.matchIndex.set(node?.id, -1);
    }
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        this.state.nextIndex.delete(nodeId);
        this.state.matchIndex.delete(nodeId);
    }
    async propose(command) {
        if (!this.enabled)
            return false;
        if (this.state.state !== 'leader')
            return false;
        const startTime = Date.now();
        this.operationCount++;
        try {
            const entry = {
                term: this.state.currentTerm,
                index: this.state.log.length,
                command,
                timestamp: new Date(),
                committed: false,
                checksum: this.calculateChecksum(command),
            };
            this.state.log.push(entry);
            const success = await this.replicateEntry(entry);
            if (success) {
                entry.committed = true;
                this.state.commitIndex = entry.index;
                this.successfulOperations++;
                const latency = Date.now() - startTime;
                this.latencyHistory.push(latency);
                if (this.latencyHistory.length > 100) {
                    this.latencyHistory.shift();
                }
                this.emit('consensus:reached', { entry, latency });
                this.emit('log:committed', { entry });
                return true;
            }
            this.failureCount++;
            return false;
        }
        catch (error) {
            this.failureCount++;
            this.logger.error('Consensus proposal failed', { error });
            return false;
        }
    }
    getState() {
        return {
            term: this.state.currentTerm,
            state: this.state.state,
            logLength: this.state.log.length,
            commitIndex: this.state.commitIndex,
            lastApplied: this.state.lastApplied,
        };
    }
    getOperationCount() {
        return this.operationCount;
    }
    getSuccessfulOperations() {
        return this.successfulOperations;
    }
    getFailureCount() {
        return this.failureCount;
    }
    getThroughput() {
        return this.successfulOperations;
    }
    getAverageLatency() {
        return this.latencyHistory.length > 0
            ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) /
                this.latencyHistory.length
            : 0;
    }
    async enable() {
        this.enabled = true;
        await this.start();
    }
    async disable() {
        this.enabled = false;
    }
    async replicateEntry(entry) {
        const followers = Array.from(this.nodes.keys()).filter((id) => id !== this.nodeId);
        if (followers.length === 0) {
            return true;
        }
        const replicationPromises = followers.map((followerId) => this.sendAppendEntries(followerId, [entry]));
        const responses = await Promise.allSettled(replicationPromises);
        const successCount = responses?.filter((result) => result?.status === 'fulfilled' && result?.value?.success).length;
        const majority = Math.floor(this.nodes.size / 2) + 1;
        return successCount >= majority - 1;
    }
    async sendAppendEntries(_followerId, entries) {
        const prevLogIndex = this.state.log.length - entries.length - 1;
        const prevLogTerm = prevLogIndex >= 0 ? (this.state.log[prevLogIndex]?.term ?? 0) : 0;
        const request = {
            term: this.state.currentTerm,
            leaderId: this.nodeId,
            prevLogIndex,
            prevLogTerm,
            entries,
            leaderCommit: this.state.commitIndex,
        };
        void request;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    term: this.state.currentTerm,
                    success: Math.random() > 0.1,
                    matchIndex: prevLogIndex + entries.length,
                });
            }, Math.random() * 50);
        });
    }
    setupElectionTimeout() {
        const timeout = this.getRandomElectionTimeout();
        setTimeout(() => {
            if (this.enabled && this.state.state === 'follower') {
                this.startElection();
            }
            this.setupElectionTimeout();
        }, timeout);
    }
    getRandomElectionTimeout() {
        const [min, max] = this.config.electionTimeout;
        return Math.random() * (max - min) + min;
    }
    async startElection() {
        this.state.currentTerm++;
        this.state.state = 'candidate';
        this.state.votedFor = this.nodeId;
        this.state.votes.clear();
        this.state.votes.add(this.nodeId);
        this.logger.info('Starting consensus election', {
            term: this.state.currentTerm,
        });
        const voteRequests = Array.from(this.nodes.keys())
            .filter((nodeId) => nodeId !== this.nodeId)
            .map((nodeId) => this.sendVoteRequest(nodeId));
        const responses = await Promise.allSettled(voteRequests);
        const grantedVotes = responses?.filter((result) => result?.status === 'fulfilled' && result?.value?.voteGranted).length + 1;
        const majority = Math.floor(this.nodes.size / 2) + 1;
        if (grantedVotes >= majority) {
            this.becomeLeader();
        }
        else {
            this.state.state = 'follower';
        }
    }
    async sendVoteRequest(_nodeId) {
        const lastLogIndex = this.state.log.length - 1;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    term: this.state.currentTerm,
                    voteGranted: Math.random() > 0.3,
                });
            }, Math.random() * 100);
        });
    }
    becomeLeader() {
        this.state.state = 'leader';
        for (const nodeId of this.nodes.keys()) {
            this.state.nextIndex.set(nodeId, this.state.log.length);
            this.state.matchIndex.set(nodeId, -1);
        }
        this.logger.info('Became consensus leader', {
            term: this.state.currentTerm,
        });
        this.sendHeartbeats();
    }
    sendHeartbeats() {
        if (this.state.state !== 'leader')
            return;
        const heartbeatPromises = Array.from(this.nodes.keys())
            .filter((nodeId) => nodeId !== this.nodeId)
            .map((nodeId) => this.sendAppendEntries(nodeId, []));
        Promise.allSettled(heartbeatPromises).then(() => {
            setTimeout(() => this.sendHeartbeats(), this.config.heartbeatInterval);
        });
    }
    calculateChecksum(command) {
        return createHash('sha256').update(JSON.stringify(command)).digest('hex');
    }
    async shutdown() {
        this.enabled = false;
        this.logger.info('Consensus engine shutdown');
    }
}
class WorkStealingSystem extends EventEmitter {
    nodeId;
    config;
    logger;
    workQueues = new Map();
    nodes = new Map();
    enabled = true;
    processedCount = 0;
    successfulOperations = 0;
    failureCount = 0;
    latencyHistory = [];
    constructor(nodeId, config, logger, _eventBus) {
        super();
        this.nodeId = nodeId;
        this.config = config;
        this.logger = logger;
        this.workQueues.set(nodeId, {
            nodeId,
            items: [],
            capacity: config?.maxQueueSize,
            processing: new Set(),
            completed: 0,
            failed: 0,
            lastActivity: new Date(),
        });
    }
    async start() {
        if (!this.enabled)
            return;
        this.logger.info('Starting work stealing system');
        this.startLoadBalancing();
        this.startWorkProcessing();
    }
    async addNode(node) {
        this.nodes.set(node?.id, node);
        if (!this.workQueues.has(node?.id)) {
            this.workQueues.set(node?.id, {
                nodeId: node?.id,
                items: [],
                capacity: this.config.maxQueueSize,
                processing: new Set(),
                completed: 0,
                failed: 0,
                lastActivity: new Date(),
            });
        }
    }
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        const queue = this.workQueues.get(nodeId);
        if (queue && queue.items.length > 0) {
            this.redistributeWork(queue.items);
        }
        this.workQueues.delete(nodeId);
    }
    async submitWork(item) {
        if (!this.enabled)
            throw new Error('Work stealing system disabled');
        const workItem = {
            ...item,
            id: this.generateWorkId(),
            created: new Date(),
            attempts: 0,
        };
        const targetQueue = this.findLeastLoadedQueue();
        targetQueue?.items.push(workItem);
        targetQueue.lastActivity = new Date();
        this.logger.debug('Work submitted', {
            workId: workItem?.id,
            targetQueue: targetQueue?.nodeId,
            priority: workItem?.priority,
        });
        this.emit('work:submitted', { item: workItem, queue: targetQueue?.nodeId });
        return workItem?.id;
    }
    getQueueCount() {
        return this.workQueues.size;
    }
    getProcessedCount() {
        return this.processedCount;
    }
    getSuccessfulOperations() {
        return this.successfulOperations;
    }
    getFailureCount() {
        return this.failureCount;
    }
    getThroughput() {
        return this.successfulOperations;
    }
    getAverageLatency() {
        return this.latencyHistory.length > 0
            ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) /
                this.latencyHistory.length
            : 0;
    }
    async enable() {
        this.enabled = true;
        await this.start();
    }
    async disable() {
        this.enabled = false;
    }
    findLeastLoadedQueue() {
        let leastLoaded = this.workQueues.get(this.nodeId);
        let minLoad = leastLoaded.items.length + leastLoaded.processing.size;
        for (const queue of this.workQueues.values()) {
            const load = queue.items.length + queue.processing.size;
            if (load < minLoad) {
                minLoad = load;
                leastLoaded = queue;
            }
        }
        return leastLoaded;
    }
    startLoadBalancing() {
        setInterval(() => {
            if (this.enabled) {
                this.performLoadBalancing();
            }
        }, this.config.loadBalancingInterval);
    }
    startWorkProcessing() {
        setInterval(() => {
            if (this.enabled) {
                this.processWork();
            }
        }, 100);
    }
    performLoadBalancing() {
        const myQueue = this.workQueues.get(this.nodeId);
        const myLoad = myQueue.items.length + myQueue.processing.size;
        if (myLoad < this.config.stealThreshold) {
            this.attemptWorkStealing();
        }
    }
    async attemptWorkStealing() {
        let mostLoaded = null;
        let maxLoad = this.config.stealThreshold;
        for (const queue of this.workQueues.values()) {
            if (queue.nodeId === this.nodeId)
                continue;
            const load = queue.items.length;
            if (load > maxLoad) {
                maxLoad = load;
                mostLoaded = queue;
            }
        }
        if (mostLoaded) {
            await this.stealWork(mostLoaded);
        }
    }
    async stealWork(targetQueue) {
        const stealCount = Math.floor(targetQueue?.items.length * this.config.stealRatio);
        if (stealCount === 0)
            return;
        const request = {
            requesterId: this.nodeId,
            targetId: targetQueue?.nodeId,
            requestedCount: stealCount,
            timestamp: new Date(),
        };
        try {
            const response = await this.sendStealRequest(request);
            if (response?.success && response?.items.length > 0) {
                const myQueue = this.workQueues.get(this.nodeId);
                for (const item of response?.items) {
                    item.stolen = true;
                    item.owner = this.nodeId;
                    myQueue.items.push(item);
                }
                this.logger.debug('Work stolen successfully', {
                    from: targetQueue?.nodeId,
                    count: response?.items.length,
                });
                this.emit('work:stolen', {
                    from: targetQueue?.nodeId,
                    to: this.nodeId,
                    count: response?.items.length,
                });
            }
        }
        catch (error) {
            this.logger.error('Work stealing failed', {
                target: targetQueue?.nodeId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async sendStealRequest(request) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const targetQueue = this.workQueues.get(request.targetId);
                if (!targetQueue || targetQueue?.items.length === 0) {
                    resolve({ success: false, items: [], reason: 'No work available' });
                    return;
                }
                const sortedItems = [...targetQueue?.items].sort((a, b) => a.priority - b.priority);
                const stolenItems = sortedItems.slice(0, request.requestedCount);
                for (const item of stolenItems) {
                    const index = targetQueue?.items?.indexOf(item);
                    if (index !== -1) {
                        targetQueue?.items?.splice(index, 1);
                    }
                }
                resolve({ success: true, items: stolenItems });
            }, Math.random() * 50);
        });
    }
    processWork() {
        const myQueue = this.workQueues.get(this.nodeId);
        if (myQueue.items.length === 0)
            return;
        myQueue.items.sort((a, b) => b.priority - a.priority);
        const item = myQueue.items.shift();
        if (!item)
            return;
        this.executeWorkItem(item);
    }
    async executeWorkItem(item) {
        const startTime = Date.now();
        const myQueue = this.workQueues.get(this.nodeId);
        myQueue.processing.add(item?.id);
        item.attempts++;
        this.processedCount++;
        try {
            await this.simulateWork(item);
            myQueue.processing.delete(item?.id);
            myQueue.completed++;
            this.successfulOperations++;
            const latency = Date.now() - startTime;
            this.latencyHistory.push(latency);
            if (this.latencyHistory.length > 100) {
                this.latencyHistory.shift();
            }
            this.logger.debug('Work completed', {
                workId: item?.id,
                latency,
                attempts: item?.attempts,
            });
            this.emit('work:completed', { item, latency });
        }
        catch (error) {
            myQueue.processing.delete(item?.id);
            this.failureCount++;
            if (item?.attempts < item?.maxAttempts) {
                myQueue.items.push(item);
                this.logger.debug('Work failed, retrying', {
                    workId: item?.id,
                    attempts: item?.attempts,
                    maxAttempts: item?.maxAttempts,
                });
            }
            else {
                myQueue.failed++;
                this.logger.error('Work failed permanently', {
                    workId: item?.id,
                    attempts: item?.attempts,
                    error: error instanceof Error ? error.message : String(error),
                });
                this.emit('work:failed', { item, error });
            }
        }
    }
    async simulateWork(item) {
        const baseTime = 100;
        const complexity = item?.payload?.complexity || 1;
        const executionTime = baseTime * complexity * (0.5 + Math.random());
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.9) {
                    reject(new Error('Simulated work failure'));
                }
                else {
                    resolve();
                }
            }, executionTime);
        });
    }
    redistributeWork(items) {
        if (items.length === 0)
            return;
        const availableQueues = Array.from(this.workQueues.values()).filter((queue) => queue.nodeId !== this.nodeId);
        if (availableQueues.length === 0) {
            const myQueue = this.workQueues.get(this.nodeId);
            myQueue.items.push(...items);
            return;
        }
        let queueIndex = 0;
        for (const item of items) {
            const targetQueue = availableQueues[queueIndex];
            if (targetQueue) {
                targetQueue?.items.push(item);
            }
            queueIndex = (queueIndex + 1) % availableQueues.length;
        }
        this.logger.info('Work redistributed', {
            itemCount: items.length,
            targetQueues: availableQueues.length,
        });
    }
    generateWorkId() {
        return `work-${Date.now()}-${randomBytes(4).toString('hex')}`;
    }
    async shutdown() {
        this.enabled = false;
        this.logger.info('Work stealing system shutdown');
    }
}
class HierarchicalCoordinator extends EventEmitter {
    nodeId;
    config;
    logger;
    hierarchy = new Map();
    nodes = new Map();
    enabled = true;
    activeDelegations = 0;
    successfulOperations = 0;
    failureCount = 0;
    latencyHistory = [];
    constructor(nodeId, config, logger, eventBus) {
        super();
        this.nodeId = nodeId;
        this.config = config;
        this.logger = logger;
        void eventBus;
        this.hierarchy.set(nodeId, {
            id: nodeId,
            children: new Set(),
            level: 0,
            span: 0,
            role: 'root',
            delegation: {
                maxDelegations: config?.fanOut,
                currentDelegations: 0,
                thresholds: {
                    delegate: config?.delegationThreshold,
                    escalate: 0.8,
                    rebalance: 0.7,
                },
            },
            load: {
                current: 0,
                capacity: 100,
                trend: 'stable',
                utilization: 0,
            },
        });
    }
    async start() {
        if (!this.enabled)
            return;
        this.logger.info('Starting hierarchical coordinator');
        this.startRebalancing();
    }
    async addNode(node) {
        this.nodes.set(node?.id, node);
        await this.insertNodeIntoHierarchy(node);
    }
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        this.removeNodeFromHierarchy(nodeId);
    }
    async delegate(request) {
        if (!this.enabled)
            return false;
        const startTime = Date.now();
        const delegator = this.hierarchy.get(request.delegatorId);
        const delegate = this.hierarchy.get(request.delegateId);
        if (!(delegator && delegate)) {
            this.failureCount++;
            return false;
        }
        try {
            if (delegator.delegation.currentDelegations >=
                delegator.delegation.maxDelegations) {
                this.failureCount++;
                return false;
            }
            if (delegate.load.utilization > 0.8) {
                this.failureCount++;
                return false;
            }
            delegator.delegation.currentDelegations++;
            delegate.load.current++;
            delegate.load.utilization =
                delegate.load.current / delegate.load.capacity;
            this.activeDelegations++;
            const latency = Date.now() - startTime;
            this.latencyHistory.push(latency);
            if (this.latencyHistory.length > 100) {
                this.latencyHistory.shift();
            }
            this.successfulOperations++;
            this.logger.info('Delegation created', {
                from: request.delegatorId,
                to: request.delegateId,
                priority: request.priority,
                latency,
            });
            this.emit('delegation:created', {
                delegatorId: request.delegatorId,
                delegateId: request.delegateId,
                task: request.task,
                latency,
            });
            return true;
        }
        catch (error) {
            this.failureCount++;
            this.logger.error('Delegation failed', { request, error });
            return false;
        }
    }
    async escalate(request) {
        if (!this.enabled)
            return false;
        const escalator = this.hierarchy.get(request.escalatorId);
        if (!(escalator && escalator.parentId)) {
            return false;
        }
        const supervisor = this.hierarchy.get(escalator.parentId);
        if (!supervisor) {
            return false;
        }
        this.logger.info('Escalation triggered', {
            from: request.escalatorId,
            to: request.supervisorId,
            reason: request.reason,
            urgency: request.urgency,
        });
        this.emit('escalation:triggered', {
            escalatorId: request.escalatorId,
            supervisorId: request.supervisorId,
            reason: request.reason,
            urgency: request.urgency,
        });
        return true;
    }
    getDepth() {
        let maxDepth = 0;
        for (const node of this.hierarchy.values()) {
            maxDepth = Math.max(maxDepth, node?.level);
        }
        return maxDepth + 1;
    }
    getActiveDelegations() {
        return this.activeDelegations;
    }
    getSuccessfulOperations() {
        return this.successfulOperations;
    }
    getFailureCount() {
        return this.failureCount;
    }
    getThroughput() {
        return this.successfulOperations;
    }
    getAverageLatency() {
        return this.latencyHistory.length > 0
            ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) /
                this.latencyHistory.length
            : 0;
    }
    async enable() {
        this.enabled = true;
        await this.start();
    }
    async disable() {
        this.enabled = false;
    }
    async insertNodeIntoHierarchy(node) {
        const parent = this.findBestParent();
        if (parent) {
            this.createChildNode(node, parent);
        }
        else {
            const root = this.hierarchy.get(this.nodeId);
            this.createChildNode(node, root);
        }
    }
    findBestParent() {
        let bestParent = null;
        let minLoad = Number.POSITIVE_INFINITY;
        for (const node of this.hierarchy.values()) {
            if (node?.level < this.config.maxDepth - 1 &&
                node?.children.size < this.config.fanOut &&
                node?.load?.utilization < minLoad) {
                minLoad = node?.load?.utilization;
                bestParent = node;
            }
        }
        return bestParent;
    }
    createChildNode(node, parent) {
        const hierarchyNode = {
            id: node?.id,
            parentId: parent?.id,
            children: new Set(),
            level: parent?.level + 1,
            span: 0,
            role: 'leaf',
            delegation: {
                maxDelegations: Math.max(1, Math.floor(this.config.fanOut / 2)),
                currentDelegations: 0,
                thresholds: {
                    delegate: this.config.delegationThreshold,
                    escalate: 0.8,
                    rebalance: 0.7,
                },
            },
            load: {
                current: 0,
                capacity: 50,
                trend: 'stable',
                utilization: 0,
            },
        };
        this.hierarchy.set(node?.id, hierarchyNode);
        parent?.children?.add(node?.id);
        parent.span++;
        if (parent?.role === 'leaf') {
            parent.role = 'coordinator';
        }
        this.logger.debug('Node added to hierarchy', {
            nodeId: node?.id,
            parentId: parent?.id,
            level: hierarchyNode?.level,
        });
    }
    removeNodeFromHierarchy(nodeId) {
        const node = this.hierarchy.get(nodeId);
        if (!node)
            return;
        if (node?.parentId) {
            const parent = this.hierarchy.get(node?.parentId);
            if (parent) {
                parent?.children?.delete(nodeId);
                parent.span--;
                if (parent?.children.size === 0 && parent?.id !== this.nodeId) {
                    parent.role = 'leaf';
                }
            }
        }
        if (node?.children.size > 0) {
            this.reassignOrphans(Array.from(node?.children));
        }
        this.hierarchy.delete(nodeId);
    }
    reassignOrphans(orphanIds) {
        for (const orphanId of orphanIds) {
            const orphan = this.hierarchy.get(orphanId);
            if (!orphan)
                continue;
            const newParent = this.findBestParent();
            if (newParent) {
                orphan.parentId = newParent?.id;
                orphan.level = newParent?.level + 1;
                newParent?.children?.add(orphanId);
                newParent.span++;
            }
        }
    }
    startRebalancing() {
        setInterval(() => {
            if (this.enabled) {
                this.performRebalancing();
            }
        }, this.config.rebalanceInterval);
    }
    performRebalancing() {
        for (const node of this.hierarchy.values()) {
            if (node?.load?.utilization > node?.delegation?.thresholds?.rebalance) {
                this.rebalanceNode(node);
            }
        }
    }
    rebalanceNode(node) {
        this.logger.debug('Rebalancing node', {
            nodeId: node?.id,
            utilization: node?.load?.utilization,
            threshold: node?.delegation?.thresholds?.rebalance,
        });
    }
    async shutdown() {
        this.enabled = false;
        this.logger.info('Hierarchical coordinator shutdown');
    }
}
export default CoordinationPatterns;
//# sourceMappingURL=coordination-patterns.js.map