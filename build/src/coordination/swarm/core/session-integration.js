/**
 * @file Session Integration Layer.
 *
 * Integrates the SessionManager with the existing ZenSwarm system,
 * providing seamless session persistence for swarm operations.
 */
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-session-integration');
// Node.js modules
import { EventEmitter } from 'node:events';
// Internal modules - absolute paths
import { ZenSwarm } from './base-swarm.ts';
import { SessionManager } from './session-manager.ts';
import { SessionRecovery, SessionValidator } from './session-utils.ts';
/**
 * Enhanced ZenSwarm with session management capabilities.
 *
 * Provides persistent session support for swarm operations, allowing.
 * Recovery from failures and resumption of long-running tasks..
 *
 * @example
 */
export class SessionEnabledSwarm extends ZenSwarm {
    sessionManager;
    currentSessionId;
    sessionIntegrationEnabled = false;
    /**
     * Creates a new SessionEnabledSwarm instance.
     *
     * @param options - Configuration options for the swarm.
     * @param sessionConfig - Configuration for session management.
     * @param persistence - Optional persistence layer for session data.
     * @example
     * ```typescript
     * const swarm = new SessionEnabledSwarm(
     *   { maxAgents: 10 },
     *   { autoSave: true, saveInterval: 5000 },
     *   coordinationDao
     * )
     * ```
     */
    constructor(options = {}, sessionConfig = {}, persistence) {
        super(options);
        // Initialize session manager with existing or new persistence DAO
        let persistenceLayer;
        if (persistence) {
            persistenceLayer = persistence;
        }
        else {
            // Create a simple mock implementation for now
            // TODO: Implement proper DALFactory integration with DI
            persistenceLayer = {
                // Repository methods
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
                // Coordination methods
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
                execute: async (_sql, _params) => ({ affectedRows: 1 }),
                query: async (_sql, _params) => [],
            };
        }
        this.sessionManager = new SessionManager(persistenceLayer, sessionConfig);
        // Set up event forwarding
        this.setupEventForwarding();
    }
    /**
     * Initialize swarm with session support.
     *
     * Sets up the base swarm infrastructure and initializes the session.
     * Management layer for persistent operation tracking..
     *
     * @throws Error if initialization fails.
     * @example
     * ```typescript
     * await swarm.initialize()
     * console.log('Swarm ready with session support')
     * ```
     */
    async initialize() {
        // Initialize base swarm
        await super.initialize();
        // Initialize session manager
        await this.sessionManager.initialize();
        this.sessionIntegrationEnabled = true;
        this.emit('session:integration_enabled', {});
    }
    /**
     * Create a new session and associate with this swarm.
     *
     * @param sessionName
     */
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
    /**
     * Load an existing session and restore swarm state.
     *
     * @param sessionId
     */
    async loadSession(sessionId) {
        if (!this.sessionIntegrationEnabled) {
            throw new Error('Session integration not enabled. Call init() first.');
        }
        const session = await this.sessionManager.loadSession(sessionId);
        // Restore swarm state from session
        await this.restoreFromSessionState(session);
        this.currentSessionId = sessionId;
        this.emit('session:loaded', { sessionId, sessionName: session.name });
    }
    /**
     * Save current swarm state to session.
     */
    async saveSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        const currentState = await this.captureCurrentState();
        await this.sessionManager.saveSession(this.currentSessionId, currentState);
        this.emit('session:saved', { sessionId: this.currentSessionId });
    }
    /**
     * Create a checkpoint of current state.
     *
     * @param description
     */
    async createCheckpoint(description) {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        // Ensure current state is saved before checkpointing
        await this.saveSession();
        const checkpointId = await this.sessionManager.createCheckpoint(this.currentSessionId, description || 'Manual checkpoint');
        this.emit('session:checkpoint_created', {
            sessionId: this.currentSessionId,
            checkpointId,
            description,
        });
        return checkpointId;
    }
    /**
     * Restore from a specific checkpoint.
     *
     * @param checkpointId
     */
    async restoreFromCheckpoint(checkpointId) {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        await this.sessionManager.restoreFromCheckpoint(this.currentSessionId, checkpointId);
        // Reload the session to get the restored state
        const session = await this.sessionManager.loadSession(this.currentSessionId);
        await this.restoreFromSessionState(session);
        this.emit('session:restored', {
            sessionId: this.currentSessionId,
            checkpointId,
        });
    }
    /**
     * Pause the current session.
     */
    async pauseSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        // Save current state before pausing
        await this.saveSession();
        await this.sessionManager.pauseSession(this.currentSessionId);
        this.emit('session:paused', { sessionId: this.currentSessionId });
    }
    /**
     * Resume a paused session.
     */
    async resumeSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        await this.sessionManager.resumeSession(this.currentSessionId);
        this.emit('session:resumed', { sessionId: this.currentSessionId });
    }
    /**
     * Hibernate the current session.
     */
    async hibernateSession() {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        // Save current state before hibernating
        await this.saveSession();
        await this.sessionManager.hibernateSession(this.currentSessionId);
        this.emit('session:hibernated', { sessionId: this.currentSessionId });
        this.currentSessionId = undefined;
    }
    /**
     * Terminate the current session.
     *
     * @param cleanup
     */
    async terminateSession(cleanup = false) {
        if (!this.currentSessionId) {
            throw new Error('No active session. Create or load a session first.');
        }
        const sessionId = this.currentSessionId;
        await this.sessionManager.terminateSession(sessionId, cleanup);
        this.emit('session:terminated', { sessionId, cleanup });
        this.currentSessionId = undefined;
    }
    /**
     * List available sessions.
     *
     * @param filter
     */
    async listSessions(filter) {
        if (!this.sessionIntegrationEnabled) {
            throw new Error('Session integration not enabled. Call init() first.');
        }
        return this.sessionManager.listSessions(filter);
    }
    /**
     * Get current session info.
     */
    async getCurrentSession() {
        if (!this.currentSessionId) {
            return null;
        }
        return this.sessionManager.loadSession(this.currentSessionId);
    }
    /**
     * Get session statistics.
     *
     * @param sessionId
     */
    async getSessionStats(sessionId) {
        return this.sessionManager.getSessionStats(sessionId || this.currentSessionId);
    }
    /**
     * Enhanced agent operations with session persistence.
     *
     * @param config
     */
    async addAgent(config) {
        // Create agent ID and simulate adding agent
        const agentId = config?.id || `agent-${Date.now()}`;
        // For now, just emit the event since the base class doesn't have addAgent
        this.emit('agent:added', { agentId, config });
        // Auto-save to session if enabled
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
    /**
     * Enhanced task submission with session persistence.
     *
     * @param task
     */
    async submitTask(task) {
        // Create task ID and simulate task submission
        const taskId = `task-${Date.now()}`;
        // For now, just emit the event since the base class doesn't have submitTask
        this.emit('task:created', { taskId, task });
        // Auto-save to session if enabled
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
    /**
     * Enhanced destroy with session cleanup.
     */
    async destroy() {
        // Save session before destroying if there's an active session
        if (this.currentSessionId) {
            try {
                await this.saveSession();
                await this.createCheckpoint('Pre-destroy checkpoint');
            }
            catch (error) {
                logger.error('Failed to save session before destroy:', error);
            }
        }
        // Shutdown session manager
        if (this.sessionManager) {
            await this.sessionManager.shutdown();
        }
        // Call parent shutdown (the method that actually exists)
        await super.shutdown();
    }
    /**
     * Private helper methods.
     */
    async captureCurrentState() {
        // Access the protected state from parent class
        // Note: In a real implementation, you might need to add a getter method to ZenSwarm
        return {
            agents: this.state.agents,
            tasks: this.state.tasks,
            topology: this.state.topology,
            connections: this.state.connections,
            metrics: this.state.metrics,
        };
    }
    async restoreFromSessionState(session) {
        // Restore agents
        for (const [agentId, agent] of session.swarmState.agents) {
            if (!this.state.agents.has(agentId)) {
                // Re-add agent if not present
                try {
                    // Ensure the agent config has the required id field
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
        // Restore tasks
        for (const [taskId, task] of session.swarmState.tasks) {
            if (!this.state.tasks.has(taskId)) {
                // Re-add task if not present
                try {
                    await this.submitTask({
                        description: task.description,
                        priority: task.priority,
                        dependencies: task.dependencies || [],
                        assignedAgents: task.assignedAgents || [],
                        swarmId: this.options.topology || 'default', // Use swarm topology as swarmId
                        strategy: 'balanced', // Default strategy
                        progress: 0, // Initial progress
                        requireConsensus: false, // Default consensus requirement
                        maxAgents: 5, // Default max agents
                        requiredCapabilities: [], // Default capabilities
                        createdAt: new Date(), // Current timestamp
                        metadata: {}, // Empty metadata
                    });
                }
                catch (error) {
                    logger.warn(`Failed to restore task ${taskId}:`, error);
                }
            }
        }
        // Update internal state
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
        // Forward session manager events to swarm events
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
            this.emit('session:error', { ...data, operation: 'checkpoint' });
        });
    }
}
/**
 * Session Recovery Service.
 *
 * Provides automated recovery capabilities for corrupted sessions.
 *
 * @example
 */
export class SessionRecoveryService extends EventEmitter {
    sessionManager;
    recoveryInProgress = new Set();
    constructor(sessionManager) {
        super();
        this.sessionManager = sessionManager;
    }
    /**
     * Attempt to recover a corrupted session.
     *
     * @param sessionId
     */
    async recoverSession(sessionId) {
        if (this.recoveryInProgress.has(sessionId)) {
            throw new Error(`Recovery already in progress for session ${sessionId}`);
        }
        this.recoveryInProgress.add(sessionId);
        this.emit('recovery:started', { sessionId });
        try {
            // Load the corrupted session
            const session = await this.sessionManager.loadSession(sessionId);
            // Validate session state
            const validation = SessionValidator.validateSessionState(session);
            if (validation.valid) {
                this.emit('recovery:not_needed', { sessionId });
                return true;
            }
            this.emit('recovery:validation_failed', {
                sessionId,
                errors: validation.errors,
            });
            // Attempt recovery using checkpoints
            const recoveredSession = await SessionRecovery.recoverSession(session, session.checkpoints);
            if (!recoveredSession) {
                this.emit('recovery:failed', {
                    sessionId,
                    reason: 'No valid checkpoints found',
                });
                return false;
            }
            // Save recovered session
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
    /**
     * Run health check on all sessions.
     */
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
                // Generate recovery recommendation
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
    /**
     * Schedule automatic recovery for corrupted sessions.
     */
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
/**
 * Factory function for creating session-enabled swarms.
 *
 * @param swarmOptions
 * @param sessionConfig
 * @param persistence
 * @example
 */
export function createSessionEnabledSwarm(swarmOptions, sessionConfig, persistence) {
    return new SessionEnabledSwarm(swarmOptions, sessionConfig, persistence);
}
// Components are already exported inline above
