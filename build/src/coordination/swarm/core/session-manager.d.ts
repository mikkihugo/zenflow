/**
 * @file Session management system.
 */
import { EventEmitter } from 'node:events';
import type { SessionCoordinationDao } from '../../../database';
import type { SwarmOptions, SwarmState } from './types.ts';
export interface SessionState {
    id: string;
    name: string;
    createdAt: Date;
    lastAccessedAt: Date;
    lastCheckpointAt?: Date;
    status: SessionStatus;
    swarmState: SwarmState;
    swarmOptions: SwarmOptions;
    metadata: Record<string, any>;
    checkpoints: SessionCheckpoint[];
    version: string;
}
export interface SessionCheckpoint {
    id: string;
    sessionId: string;
    timestamp: Date;
    checksum: string;
    state: SwarmState;
    description: string;
    metadata: Record<string, any>;
}
export interface SessionConfig {
    autoCheckpoint?: boolean;
    checkpointInterval?: number;
    maxCheckpoints?: number;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
    encryptionKey?: string;
}
export type SessionStatus = 'active' | 'paused' | 'hibernated' | 'terminated' | 'corrupted';
export interface SessionRecoveryOptions {
    targetCheckpoint?: string;
    ignoreCorruption?: boolean;
    validateState?: boolean;
}
/**
 * Core Session Manager class.
 *
 * @example
 */
export declare class SessionManager extends EventEmitter {
    private coordinationDao;
    private activeSessions;
    private config;
    private checkpointTimers;
    private initialized;
    constructor(coordinationDao: SessionCoordinationDao, config?: SessionConfig);
    /**
     * Ensure DAO is initialized.
     */
    private ensureInitialized;
    /**
     * Get initialized DAO with null safety.
     */
    private getDao;
    /**
     * Initialize the session manager.
     */
    initialize(): Promise<void>;
    /**
     * Create a new session.
     *
     * @param name
     * @param swarmOptions
     * @param initialState
     */
    createSession(name: string, swarmOptions: SwarmOptions, initialState?: Partial<SwarmState>): Promise<string>;
    /**
     * Load an existing session.
     *
     * @param sessionId
     */
    loadSession(sessionId: string): Promise<SessionState>;
    /**
     * Save session state.
     *
     * @param sessionId
     * @param state
     */
    saveSession(sessionId: string, state?: Partial<SwarmState>): Promise<void>;
    /**
     * Create a checkpoint of the current session state.
     *
     * @param sessionId
     * @param description
     * @param metadata
     */
    createCheckpoint(sessionId: string, description?: string, metadata?: Record<string, any>): Promise<string>;
    /**
     * Restore session from a checkpoint.
     *
     * @param sessionId
     * @param checkpointId
     * @param options
     */
    restoreFromCheckpoint(sessionId: string, checkpointId: string, options?: SessionRecoveryOptions): Promise<void>;
    /**
     * Pause a session (stop processing but keep in memory).
     *
     * @param sessionId
     */
    pauseSession(sessionId: string): Promise<void>;
    /**
     * Resume a paused session.
     *
     * @param sessionId
     */
    resumeSession(sessionId: string): Promise<void>;
    /**
     * Hibernate a session (save to disk and remove from memory).
     *
     * @param sessionId
     */
    hibernateSession(sessionId: string): Promise<void>;
    /**
     * Terminate a session permanently.
     *
     * @param sessionId
     * @param cleanup
     */
    terminateSession(sessionId: string, cleanup?: boolean): Promise<void>;
    /**
     * List all sessions with optional filtering.
     *
     * @param filter
     * @param filter.status
     * @param filter.namePattern
     * @param filter.createdAfter
     * @param filter.createdBefore
     */
    listSessions(filter?: {
        status?: SessionStatus;
        namePattern?: string;
        createdAfter?: Date;
        createdBefore?: Date;
    }): Promise<SessionState[]>;
    /**
     * Get session statistics.
     *
     * @param sessionId
     */
    getSessionStats(sessionId?: string): Promise<Record<string, any>>;
    /**
     * Private helper methods.
     */
    private initializeSessionTables;
    private restoreActiveSessions;
    private loadSessionCheckpoints;
    private updateSessionAccess;
    private deleteCheckpoint;
    private startAutoCheckpoint;
    private stopAutoCheckpoint;
    private serializeData;
    private deserializeData;
    private calculateChecksum;
    private generateEncryptionKey;
    /**
     * Cleanup and shutdown.
     */
    shutdown(): Promise<void>;
}
export default SessionManager;
//# sourceMappingURL=session-manager.d.ts.map