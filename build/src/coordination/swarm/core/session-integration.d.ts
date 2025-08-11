/**
 * @file Session Integration Layer.
 *
 * Integrates the SessionManager with the existing ZenSwarm system,
 * providing seamless session persistence for swarm operations.
 */
import { EventEmitter } from 'node:events';
import type { SessionCoordinationDao } from '../database';
import { ZenSwarm } from './base-swarm.ts';
import type { SessionConfig, SessionState } from './session-manager.ts';
import { SessionManager } from './session-manager.ts';
import type { AgentConfig, SwarmOptions, Task } from './types.ts';
/**
 * Enhanced ZenSwarm with session management capabilities.
 *
 * Provides persistent session support for swarm operations, allowing.
 * Recovery from failures and resumption of long-running tasks..
 *
 * @example
 */
export declare class SessionEnabledSwarm extends ZenSwarm {
    private sessionManager;
    private currentSessionId;
    private sessionIntegrationEnabled;
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
    constructor(options?: SwarmOptions, sessionConfig?: SessionConfig, persistence?: SessionCoordinationDao);
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
    initialize(): Promise<void>;
    /**
     * Create a new session and associate with this swarm.
     *
     * @param sessionName
     */
    createSession(sessionName: string): Promise<string>;
    /**
     * Load an existing session and restore swarm state.
     *
     * @param sessionId
     */
    loadSession(sessionId: string): Promise<void>;
    /**
     * Save current swarm state to session.
     */
    saveSession(): Promise<void>;
    /**
     * Create a checkpoint of current state.
     *
     * @param description
     */
    createCheckpoint(description?: string): Promise<string>;
    /**
     * Restore from a specific checkpoint.
     *
     * @param checkpointId
     */
    restoreFromCheckpoint(checkpointId: string): Promise<void>;
    /**
     * Pause the current session.
     */
    pauseSession(): Promise<void>;
    /**
     * Resume a paused session.
     */
    resumeSession(): Promise<void>;
    /**
     * Hibernate the current session.
     */
    hibernateSession(): Promise<void>;
    /**
     * Terminate the current session.
     *
     * @param cleanup
     */
    terminateSession(cleanup?: boolean): Promise<void>;
    /**
     * List available sessions.
     *
     * @param filter
     */
    listSessions(filter?: any): Promise<SessionState[]>;
    /**
     * Get current session info.
     */
    getCurrentSession(): Promise<SessionState | null>;
    /**
     * Get session statistics.
     *
     * @param sessionId
     */
    getSessionStats(sessionId?: string): Promise<Record<string, any>>;
    /**
     * Enhanced agent operations with session persistence.
     *
     * @param config
     */
    addAgent(config: AgentConfig): Promise<string>;
    /**
     * Enhanced task submission with session persistence.
     *
     * @param task
     */
    submitTask(task: Omit<Task, 'id' | 'status'>): Promise<string>;
    /**
     * Enhanced destroy with session cleanup.
     */
    destroy(): Promise<void>;
    /**
     * Private helper methods.
     */
    private captureCurrentState;
    private restoreFromSessionState;
    private setupEventForwarding;
}
/**
 * Session Recovery Service.
 *
 * Provides automated recovery capabilities for corrupted sessions.
 *
 * @example
 */
export declare class SessionRecoveryService extends EventEmitter {
    private sessionManager;
    private recoveryInProgress;
    constructor(sessionManager: SessionManager);
    /**
     * Attempt to recover a corrupted session.
     *
     * @param sessionId
     */
    recoverSession(sessionId: string): Promise<boolean>;
    /**
     * Run health check on all sessions.
     */
    runHealthCheck(): Promise<Record<string, any>>;
    /**
     * Schedule automatic recovery for corrupted sessions.
     */
    scheduleAutoRecovery(): Promise<void>;
}
/**
 * Factory function for creating session-enabled swarms.
 *
 * @param swarmOptions
 * @param sessionConfig
 * @param persistence
 * @example
 */
export declare function createSessionEnabledSwarm(swarmOptions?: SwarmOptions, sessionConfig?: SessionConfig, persistence?: SessionCoordinationDao): SessionEnabledSwarm;
//# sourceMappingURL=session-integration.d.ts.map