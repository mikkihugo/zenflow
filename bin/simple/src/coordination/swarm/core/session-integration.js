import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-session-integration');
import { EventEmitter } from 'node:events';
import { ZenSwarm } from './base-swarm.ts';
import { SessionManager } from './session-manager.ts';
import { SessionRecovery, SessionValidator } from './session-utils.ts';
export class SessionEnabledSwarm extends ZenSwarm {
    sessionManager;
    currentSessionId;
    sessionIntegrationEnabled = false;
    constructor(options = {}, sessionConfig = {}, persistence) {
        super(options);
        let persistenceLayer;
        if (persistence) {
            persistenceLayer = persistence;
        }
        else {
            persistenceLayer = {
                findById: async (_id) => null,
                findBy: async (_criteria, _options) => [],
                findAll: async (_options) => [],
                create: async (_entity) => ({
                    id: 'mock-id',
                    name: 'mock-session',
                    createdAt: new Date(),
                    lastAccessedAt: new Date(),
                    status: 'active',
                }),
                update: async (_id, _updates) => ({
                    id: _id,
                    name: 'mock-session',
                    createdAt: new Date(),
                    lastAccessedAt: new Date(),
                    status: 'active',
                    ..._updates,
                }),
                delete: async (_id) => true,
                count: async (_criteria) => 0,
                exists: async (_id) => false,
                executeCustomQuery: async (_query) => null,
                acquireLock: async (_resourceId, _lockTimeout) => ({
                    id: 'mock-lock',
                    resourceId: _resourceId,
                    acquired: new Date(),
                    expiresAt: new Date(Date.now() + 30000),
                    owner: 'mock-session-integration',
                }),
                releaseLock: async (_lockId) => { },
                subscribe: async (_pattern, _callback) => `mock-sub-${Date.now()}`,
                unsubscribe: async (_subscriptionId) => { },
                publish: async (_channel, _event) => { },
                getCoordinationStats: async () => ({
                    activeLocks: 0,
                    activeSubscriptions: 0,
                    messagesPublished: 0,
                    messagesReceived: 0,
                    uptime: Date.now(),
                }),
                execute: async (_sql, _params) => ({
                    affectedRows: 1,
                }),
                query: async (_sql, _params) => [],
            };
        }
        this.sessionManager = new SessionManager(persistenceLayer, sessionConfig);
        this.setupEventForwarding();
    }
    async initialize() {
        await super.initialize();
        await this.sessionManager.initialize();
        this.sessionIntegrationEnabled = true;
        this.emit('session:integration_enabled', {});
    }
    async createSession(sessionName) {
        if (!this.sessionIntegrationEnabled) {
            throw new Error('Session integration not enabled. Call init() first.');
        }
        const currentState = await this.captureCurrentState();
        const sessionId = await this.sessionManager.createSession(sessionName, this.options, currentState);
        this.currentSessionId = sessionId;
        this.emit('session:created', { sessionId, sessionName });
        return sessionId;
    }
    async loadSession(sessionId) {
        if (!this.sessionIntegrationEnabled) {
            throw new Error('Session integration not enabled. Call init() first.');
        }
        const session = await this.sessionManager.loadSession(sessionId);
        await this.restoreFromSessionState(session);
        this.currentSessionId = sessionId;
        this.emit('session:loaded', {
            sessionId,
            sessionName: session.name,
        });
    }
    async saveSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        const currentState = await this.captureCurrentState();
        await this.sessionManager.saveSession(this.currentSessionId, currentState);
        this.emit('session:saved', {
            sessionId: this.currentSessionId,
        });
    }
    async createCheckpoint(description) {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        await this.saveSession();
        const checkpointId = await this.sessionManager.createCheckpoint(this.currentSessionId, description || 'Manual checkpoint');
        this.emit('session:checkpoint_created', {
            sessionId: this.currentSessionId,
            checkpointId,
            description,
        });
        return checkpointId;
    }
    async restoreFromCheckpoint(checkpointId) {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        await this.sessionManager.restoreFromCheckpoint(this.currentSessionId, checkpointId);
        const session = await this.sessionManager.loadSession(this.currentSessionId);
        await this.restoreFromSessionState(session);
        this.emit('session:restored', {
            sessionId: this.currentSessionId,
            checkpointId,
        });
    }
    async pauseSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        await this.saveSession();
        await this.sessionManager.pauseSession(this.currentSessionId);
        this.emit('session:paused', {
            sessionId: this.currentSessionId,
        });
    }
    async resumeSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        await this.sessionManager.resumeSession(this.currentSessionId);
        this.emit('session:resumed', {
            sessionId: this.currentSessionId,
        });
    }
    async hibernateSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        await this.saveSession();
        await this.sessionManager.hibernateSession(this.currentSessionId);
        this.emit('session:hibernated', {
            sessionId: this.currentSessionId,
        });
        this.currentSessionId = undefined;
    }
    async terminateSession(cleanup = false) {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        const sessionId = this.currentSessionId;
        await this.sessionManager.terminateSession(sessionId, cleanup);
        this.emit('session:terminated', { sessionId, cleanup });
        this.currentSessionId = undefined;
    }
    async listSessions(filter) {
        if (!this.sessionIntegrationEnabled) {
            throw new Error('Session integration not enabled. Call init() first.');
        }
        return this.sessionManager.listSessions(filter);
    }
    async getCurrentSession() {
        if (!this.currentSessionId) {
            return null;
        }
        return this.sessionManager.loadSession(this.currentSessionId);
    }
    async getSessionStats(sessionId) {
        return this.sessionManager.getSessionStats(sessionId || this.currentSessionId);
    }
    async addAgent(config) {
        const agentId = config?.id || `agent-${Date.now()}`;
        this.emit('agent:added', { agentId, config });
        if (this.currentSessionId && this.sessionIntegrationEnabled) {
            setImmediate(() => this.saveSession().catch((error) => {
                this.emit('session:error', {
                    error: error.message,
                    operation: 'addAgent',
                    agentId,
                });
            }));
        }
        return agentId;
    }
    async submitTask(task) {
        const taskId = `task-${Date.now()}`;
        this.emit('task:created', { taskId, task });
        if (this.currentSessionId && this.sessionIntegrationEnabled) {
            setImmediate(() => this.saveSession().catch((error) => {
                this.emit('session:error', {
                    error: error.message,
                    operation: 'submitTask',
                    taskId,
                });
            }));
        }
        return taskId;
    }
    async destroy() {
        if (this.currentSessionId) {
            try {
                await this.saveSession();
                await this.createCheckpoint('Pre-destroy checkpoint');
            }
            catch (error) {
                logger.error('Failed to save session before destroy:', error);
            }
        }
        if (this.sessionManager) {
            await this.sessionManager.shutdown();
        }
        await super.shutdown();
    }
    async captureCurrentState() {
        return {
            agents: this.state.agents,
            tasks: this.state.tasks,
            topology: this.state.topology,
            connections: this.state.connections,
            metrics: this.state.metrics,
        };
    }
    async restoreFromSessionState(session) {
        for (const [agentId, agent] of session.swarmState.agents) {
            if (!this.state.agents.has(agentId)) {
                try {
                    const configWithId = {
                        ...agent.config,
                        id: agent.config.id || agentId,
                    };
                    await this.addAgent(configWithId);
                }
                catch (error) {
                    logger.warn(`Failed to restore agent ${agentId}:`, error);
                }
            }
        }
        for (const [taskId, task] of session.swarmState.tasks) {
            if (!this.state.tasks.has(taskId)) {
                try {
                    await this.submitTask({
                        description: task.description,
                        priority: task.priority,
                        dependencies: task.dependencies || [],
                        assignedAgents: task.assignedAgents || [],
                        swarmId: this.options.topology || 'default',
                        strategy: 'balanced',
                        progress: 0,
                        requireConsensus: false,
                        maxAgents: 5,
                        requiredCapabilities: [],
                        createdAt: new Date(),
                        metadata: {},
                    });
                }
                catch (error) {
                    logger.warn(`Failed to restore task ${taskId}:`, error);
                }
            }
        }
        this.state.topology = session.swarmState.topology;
        this.state.connections = session.swarmState.connections;
        this.state.metrics = session.swarmState.metrics;
        this.emit('swarm:state_restored', {
            sessionId: session.id,
            agentCount: session.swarmState.agents.size,
            taskCount: session.swarmState.tasks.size,
        });
    }
    setupEventForwarding() {
        this.sessionManager.on('session:created', (data) => {
            this.emit('session:created', data);
        });
        this.sessionManager.on('session:loaded', (data) => {
            this.emit('session:loaded', data);
        });
        this.sessionManager.on('session:saved', (data) => {
            this.emit('session:saved', data);
        });
        this.sessionManager.on('checkpoint:created', (data) => {
            this.emit('session:checkpoint_created', data);
        });
        this.sessionManager.on('session:restored', (data) => {
            this.emit('session:restored', data);
        });
        this.sessionManager.on('session:paused', (data) => {
            this.emit('session:paused', data);
        });
        this.sessionManager.on('session:resumed', (data) => {
            this.emit('session:resumed', data);
        });
        this.sessionManager.on('session:hibernated', (data) => {
            this.emit('session:hibernated', data);
        });
        this.sessionManager.on('session:terminated', (data) => {
            this.emit('session:terminated', data);
        });
        this.sessionManager.on('session:corruption_detected', (data) => {
            this.emit('session:corruption_detected', data);
        });
        this.sessionManager.on('checkpoint:error', (data) => {
            this.emit('session:error', {
                ...data,
                operation: 'checkpoint',
            });
        });
    }
}
export class SessionRecoveryService extends EventEmitter {
    sessionManager;
    recoveryInProgress = new Set();
    constructor(sessionManager) {
        super();
        this.sessionManager = sessionManager;
    }
    async recoverSession(sessionId) {
        if (this.recoveryInProgress.has(sessionId)) {
            throw new Error(`Recovery already in progress for session ${sessionId}`);
        }
        this.recoveryInProgress.add(sessionId);
        this.emit('recovery:started', { sessionId });
        try {
            const session = await this.sessionManager.loadSession(sessionId);
            const validation = SessionValidator.validateSessionState(session);
            if (validation.valid) {
                this.emit('recovery:not_needed', { sessionId });
                return true;
            }
            this.emit('recovery:validation_failed', {
                sessionId,
                errors: validation.errors,
            });
            const recoveredSession = await SessionRecovery.recoverSession(session, session.checkpoints);
            if (!recoveredSession) {
                this.emit('recovery:failed', {
                    sessionId,
                    reason: 'No valid checkpoints found',
                });
                return false;
            }
            await this.sessionManager.saveSession(sessionId, recoveredSession.swarmState);
            this.emit('recovery:completed', {
                sessionId,
                recoveredFromCheckpoint: recoveredSession.metadata['recoveredFromCheckpoint'],
            });
            return true;
        }
        catch (error) {
            this.emit('recovery:failed', {
                sessionId,
                reason: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
        finally {
            this.recoveryInProgress.delete(sessionId);
        }
    }
    async runHealthCheck() {
        const sessions = await this.sessionManager.listSessions();
        const healthReport = {
            total: sessions.length,
            healthy: 0,
            corrupted: 0,
            needsRecovery: [],
            recoveryRecommendations: [],
        };
        for (const session of sessions) {
            const validation = SessionValidator.validateSessionState(session);
            if (validation.valid) {
                healthReport['healthy']++;
            }
            else {
                healthReport['corrupted']++;
                healthReport['needsRecovery']?.push({
                    sessionId: session.id,
                    name: session.name,
                    errors: validation.errors,
                });
                if (session.checkpoints.length > 0) {
                    healthReport['recoveryRecommendations']?.push({
                        sessionId: session.id,
                        recommendation: 'automatic_recovery',
                        availableCheckpoints: session.checkpoints.length,
                    });
                }
                else {
                    healthReport['recoveryRecommendations']?.push({
                        sessionId: session.id,
                        recommendation: 'manual_intervention',
                        reason: 'No checkpoints available',
                    });
                }
            }
        }
        this.emit('health_check:completed', healthReport);
        return healthReport;
    }
    async scheduleAutoRecovery() {
        const healthReport = await this.runHealthCheck();
        const autoRecoverySessions = healthReport['recoveryRecommendations']
            ?.filter((rec) => rec.recommendation === 'automatic_recovery')
            .map((rec) => rec.sessionId);
        this.emit('auto_recovery:scheduled', {
            sessions: autoRecoverySessions,
            count: autoRecoverySessions.length,
        });
        for (const sessionId of autoRecoverySessions) {
            try {
                const success = await this.recoverSession(sessionId);
                this.emit('auto_recovery:session_completed', {
                    sessionId,
                    success,
                });
            }
            catch (error) {
                this.emit('auto_recovery:session_failed', {
                    sessionId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        this.emit('auto_recovery:completed', {
            totalSessions: autoRecoverySessions.length,
        });
    }
}
export function createSessionEnabledSwarm(swarmOptions, sessionConfig, persistence) {
    return new SessionEnabledSwarm(swarmOptions, sessionConfig, persistence);
}
//# sourceMappingURL=session-integration.js.map