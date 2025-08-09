/**
 * @file session management system
 */


import { getLogger } from '../config/logging-config';

const logger = getLogger('coordination-swarm-core-session-manager');

/**
 * Session Management System for ZenSwarm.
 *
 * Provides comprehensive session management with persistence integration,
 * state serialization, checkpoint system, and recovery mechanisms.
 *
 * Architecture:
 * - SessionManager: Main class handling session lifecycle
 * - SessionState: Interface for session data structure
 * - Checkpoint system with integrity verification
 * - Recovery mechanisms with rollback capabilities.
 * - Integration with existing persistence layer.
 */

import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { IDao, SessionCoordinationDao, SessionEntity } from '../database';
import { createDao, DatabaseTypes, EntityTypes } from '../database';
import type { SwarmOptions, SwarmState } from './types';
import { generateId } from './utils';

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
  checkpointInterval?: number; // milliseconds
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
export class SessionManager extends EventEmitter {
  private coordinationDao: SessionCoordinationDao;
  private activeSessions: Map<string, SessionState>;
  private config: Required<SessionConfig>;
  private checkpointTimers: Map<string, NodeJS.Timeout>;
  private initialized: boolean = false;

  constructor(coordinationDao: SessionCoordinationDao, config: SessionConfig = {}) {
    super();

    this.coordinationDao = coordinationDao;
    this.activeSessions = new Map();
    this.checkpointTimers = new Map();

    this.config = {
      autoCheckpoint: config.autoCheckpoint === undefined ? true : config?.autoCheckpoint,
      checkpointInterval:
        config.checkpointInterval === undefined ? 300000 : config?.checkpointInterval, // 5 minutes
      maxCheckpoints: config.maxCheckpoints === undefined ? 10 : config?.maxCheckpoints,
      compressionEnabled:
        config.compressionEnabled === undefined ? true : config?.compressionEnabled,
      encryptionEnabled:
        config.encryptionEnabled === undefined ? false : config?.encryptionEnabled,
      encryptionKey:
        config.encryptionKey === undefined ? this.generateEncryptionKey() : config?.encryptionKey,
    };
  }

  /**
   * Ensure DAO is initialized.
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.coordinationDao) {
      // Create a coordination DAO with proper interface
      const dao = await createDao<SessionEntity>(
        EntityTypes.CoordinationEvent,
        DatabaseTypes?.Coordination
      );

      // Type assertion with proper coordination methods
      this.coordinationDao = {
        ...dao,
        // Add coordination-specific methods
        execute: async (sql: string, params?: unknown[]) => {
          const customQuery = {
            type: 'sql' as const,
            query: sql,
            parameters: params ? Object.fromEntries(params.map((p, i) => [i.toString(), p])) : {},
          };
          const result = await dao.executeCustomQuery<{ affectedRows?: number; insertId?: number }>(
            customQuery
          );
          return result || { affectedRows: 0 };
        },
        query: async (sql: string, params?: unknown[]) => {
          const customQuery = {
            type: 'sql' as const,
            query: sql,
            parameters: params ? Object.fromEntries(params.map((p, i) => [i.toString(), p])) : {},
          };
          const result = await dao.executeCustomQuery<any[]>(customQuery);
          return Array.isArray(result) ? result : [];
        },
        acquireLock: async (resourceId: string, lockTimeout?: number) => {
          throw new Error('Lock operations not yet implemented');
        },
        releaseLock: async (lockId: string) => {
          throw new Error('Lock operations not yet implemented');
        },
        subscribe: async (pattern: string, callback: any) => {
          throw new Error('Subscription operations not yet implemented');
        },
        unsubscribe: async (subscriptionId: string) => {
          throw new Error('Subscription operations not yet implemented');
        },
        publish: async (channel: string, event: any) => {
          throw new Error('Publish operations not yet implemented');
        },
        getCoordinationStats: async () => {
          return {
            activeLocks: 0,
            activeSubscriptions: 0,
            messagesPublished: 0,
            messagesReceived: 0,
            uptime: Date.now(),
          };
        },
      } as SessionCoordinationDao;
    }
  }

  /**
   * Get initialized DAO with null safety.
   */
  private async getDao(): Promise<SessionCoordinationDao> {
    await this.ensureInitialized();
    return this.coordinationDao!;
  }

  /**
   * Initialize the session manager.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure DAO is initialized
      await this.ensureInitialized();

      // Create session tables if they don't exist
      await this.initializeSessionTables();

      // Restore active sessions
      await this.restoreActiveSessions();

      this.initialized = true;
      this.emit('manager:initialized');
    } catch (error) {
      throw new Error(
        `Failed to initialize SessionManager: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create a new session.
   *
   * @param name
   * @param swarmOptions
   * @param initialState
   */
  async createSession(
    name: string,
    swarmOptions: SwarmOptions,
    initialState?: Partial<SwarmState>
  ): Promise<string> {
    await this.ensureInitialized();

    const sessionId = generateId('session');
    const now = new Date();

    const defaultSwarmState: SwarmState = {
      agents: new Map(),
      tasks: new Map(),
      topology: swarmOptions?.topology || 'mesh',
      connections: [],
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageCompletionTime: 0,
        agentUtilization: new Map(),
        throughput: 0,
      },
    };

    const sessionState: SessionState = {
      id: sessionId,
      name,
      createdAt: now,
      lastAccessedAt: now,
      status: 'active',
      swarmState: { ...defaultSwarmState, ...initialState },
      swarmOptions,
      metadata: {},
      checkpoints: [],
      version: '1.0.0',
    };

    // Store in database
    const dao = await this.getDao();
    await dao.execute(
      `
      INSERT INTO sessions (id, name, status, swarm_options, swarm_state, metadata, created_at, last_accessed_at, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        sessionId,
        name,
        'active',
        this.serializeData(swarmOptions),
        this.serializeData(sessionState.swarmState),
        this.serializeData(sessionState.metadata),
        now.toISOString(),
        now.toISOString(),
        sessionState.version,
      ]
    );

    // Add to active sessions
    this.activeSessions.set(sessionId, sessionState);

    // Start auto-checkpoint if enabled
    if (this.config.autoCheckpoint) {
      this.startAutoCheckpoint(sessionId);
    }

    this.emit('session:created', { sessionId, name });
    return sessionId;
  }

  /**
   * Load an existing session.
   *
   * @param sessionId
   */
  async loadSession(sessionId: string): Promise<SessionState> {
    await this.ensureInitialized();

    // Check if already loaded
    if (this.activeSessions.has(sessionId)) {
      const session = this.activeSessions.get(sessionId)!;
      session.lastAccessedAt = new Date();
      await this.updateSessionAccess(sessionId);
      return session;
    }

    // Load from database
    const dao = await this.getDao();
    const sessions = await dao.query('SELECT * FROM sessions WHERE id = ?', [sessionId]);

    if (sessions.length === 0) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const sessionData = sessions[0];
    const sessionState: SessionState = {
      id: sessionData?.id,
      name: sessionData?.name,
      createdAt: new Date(sessionData?.created_at),
      lastAccessedAt: new Date(),
      ...(sessionData?.last_checkpoint_at && {
        lastCheckpointAt: new Date(sessionData?.last_checkpoint_at),
      }),
      status: sessionData?.status as SessionStatus,
      swarmState: this.deserializeData(sessionData?.swarm_state),
      swarmOptions: this.deserializeData(sessionData?.swarm_options),
      metadata: this.deserializeData(sessionData?.metadata),
      checkpoints: await this.loadSessionCheckpoints(sessionId),
      version: sessionData?.version,
    } satisfies SessionState;

    // Add to active sessions
    this.activeSessions.set(sessionId, sessionState);

    // Update last accessed time
    await this.updateSessionAccess(sessionId);

    // Start auto-checkpoint if enabled and session is active
    if (this.config.autoCheckpoint && sessionState.status === 'active') {
      this.startAutoCheckpoint(sessionId);
    }

    this.emit('session:loaded', { sessionId });
    return sessionState;
  }

  /**
   * Save session state.
   *
   * @param sessionId
   * @param state
   */
  async saveSession(sessionId: string, state?: Partial<SwarmState>): Promise<void> {
    await this.ensureInitialized();

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found in active sessions`);
    }

    if (state) {
      session.swarmState = { ...session.swarmState, ...state };
    }

    session.lastAccessedAt = new Date();

    // Update in database
    const dao = await this.getDao();
    await dao.execute(
      `
      UPDATE sessions 
      SET swarm_state = ?, last_accessed_at = ?
      WHERE id = ?
    `,
      [this.serializeData(session.swarmState), session.lastAccessedAt.toISOString(), sessionId]
    );

    this.emit('session:saved', { sessionId });
  }

  /**
   * Create a checkpoint of the current session state.
   *
   * @param sessionId
   * @param description
   * @param metadata
   */
  async createCheckpoint(
    sessionId: string,
    description: string = 'Auto checkpoint',
    metadata: Record<string, any> = {}
  ): Promise<string> {
    await this.ensureInitialized();

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const checkpointId = generateId('checkpoint');
    const now = new Date();
    const stateData = this.serializeData(session.swarmState);
    const checksum = this.calculateChecksum(stateData);

    const checkpoint: SessionCheckpoint = {
      id: checkpointId,
      sessionId,
      timestamp: now,
      checksum,
      state: session.swarmState,
      description,
      metadata,
    };

    // Store checkpoint in database
    const dao = await this.getDao();
    await dao.execute(
      `
      INSERT INTO session_checkpoints (id, session_id, timestamp, checksum, state_data, description, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        checkpointId,
        sessionId,
        now.toISOString(),
        checksum,
        stateData,
        description,
        this.serializeData(metadata),
      ]
    );

    // Add to session checkpoints
    session.checkpoints.push(checkpoint);
    session.lastCheckpointAt = now;

    // Maintain checkpoint limit
    if (session.checkpoints.length > this.config.maxCheckpoints) {
      const oldestCheckpoint = session.checkpoints.shift()!;
      await this.deleteCheckpoint(oldestCheckpoint.id);
    }

    // Update session last checkpoint time
    await dao.execute(
      `
      UPDATE sessions SET last_checkpoint_at = ? WHERE id = ?
    `,
      [now.toISOString(), sessionId]
    );

    this.emit('checkpoint:created', { sessionId, checkpointId, description });
    return checkpointId;
  }

  /**
   * Restore session from a checkpoint.
   *
   * @param sessionId
   * @param checkpointId
   * @param options
   */
  async restoreFromCheckpoint(
    sessionId: string,
    checkpointId: string,
    options: SessionRecoveryOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Load checkpoint
    const dao = await this.getDao();
    const checkpoints = await dao.query(
      'SELECT * FROM session_checkpoints WHERE id = ? AND session_id = ?',
      [checkpointId, sessionId]
    );

    if (checkpoints.length === 0) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const checkpointData = checkpoints[0];
    const stateData = checkpointData?.state_data;

    // Verify integrity if requested
    if (options?.validateState !== false) {
      const expectedChecksum = checkpointData?.checksum;
      const actualChecksum = this.calculateChecksum(stateData);

      if (expectedChecksum !== actualChecksum) {
        if (!options?.ignoreCorruption) {
          throw new Error(`Checkpoint ${checkpointId} integrity check failed`);
        }
        this.emit('session:corruption_detected', { sessionId, checkpointId });
      }
    }

    // Restore state
    const restoredState = this.deserializeData(stateData);
    session.swarmState = restoredState;
    session.lastAccessedAt = new Date();
    session.status = 'active';

    // Save restored session
    await this.saveSession(sessionId);

    this.emit('session:restored', { sessionId, checkpointId });
  }

  /**
   * Pause a session (stop processing but keep in memory).
   *
   * @param sessionId
   */
  async pauseSession(sessionId: string): Promise<void> {
    await this.ensureInitialized();

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'paused';
    session.lastAccessedAt = new Date();

    // Stop auto-checkpointing
    this.stopAutoCheckpoint(sessionId);

    // Update in database
    const dao = await this.getDao();
    await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', [
      'paused',
      session.lastAccessedAt.toISOString(),
      sessionId,
    ]);

    this.emit('session:paused', { sessionId });
  }

  /**
   * Resume a paused session.
   *
   * @param sessionId
   */
  async resumeSession(sessionId: string): Promise<void> {
    await this.ensureInitialized();

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'active';
    session.lastAccessedAt = new Date();

    // Restart auto-checkpointing
    if (this.config.autoCheckpoint) {
      this.startAutoCheckpoint(sessionId);
    }

    // Update in database
    const dao = await this.getDao();
    await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', [
      'active',
      session.lastAccessedAt.toISOString(),
      sessionId,
    ]);

    this.emit('session:resumed', { sessionId });
  }

  /**
   * Hibernate a session (save to disk and remove from memory).
   *
   * @param sessionId
   */
  async hibernateSession(sessionId: string): Promise<void> {
    await this.ensureInitialized();

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Create final checkpoint before hibernation
    await this.createCheckpoint(sessionId, 'Pre-hibernation checkpoint');

    session.status = 'hibernated';
    session.lastAccessedAt = new Date();

    // Stop auto-checkpointing
    this.stopAutoCheckpoint(sessionId);

    // Update in database
    const dao = await this.getDao();
    await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', [
      'hibernated',
      session.lastAccessedAt.toISOString(),
      sessionId,
    ]);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    this.emit('session:hibernated', { sessionId });
  }

  /**
   * Terminate a session permanently.
   *
   * @param sessionId
   * @param cleanup
   */
  async terminateSession(sessionId: string, cleanup: boolean = false): Promise<void> {
    await this.ensureInitialized();

    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'terminated';
      this.stopAutoCheckpoint(sessionId);
      this.activeSessions.delete(sessionId);
    }

    // Update in database
    const dao = await this.getDao();
    await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', [
      'terminated',
      new Date().toISOString(),
      sessionId,
    ]);

    if (cleanup) {
      // Delete all checkpoints
      await dao.execute('DELETE FROM session_checkpoints WHERE session_id = ?', [sessionId]);

      // Delete session record
      await dao.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
    }

    this.emit('session:terminated', { sessionId, cleanup });
  }

  /**
   * List all sessions with optional filtering.
   *
   * @param filter
   * @param filter.status
   * @param filter.namePattern
   * @param filter.createdAfter
   * @param filter.createdBefore
   */
  async listSessions(filter?: {
    status?: SessionStatus;
    namePattern?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  }): Promise<SessionState[]> {
    await this.ensureInitialized();

    let sql = 'SELECT * FROM sessions';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filter) {
      if (filter.status) {
        conditions.push('status = ?');
        params.push(filter.status);
      }

      if (filter.namePattern) {
        conditions.push('name LIKE ?');
        params.push(`%${filter.namePattern}%`);
      }

      if (filter.createdAfter) {
        conditions.push('created_at >= ?');
        params.push(filter.createdAfter.toISOString());
      }

      if (filter.createdBefore) {
        conditions.push('created_at <= ?');
        params.push(filter.createdBefore.toISOString());
      }
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY last_accessed_at DESC';

    const dao = await this.getDao();
    const sessions = await dao.query(sql, params);

    return sessions.map(
      (sessionData: any): SessionState => ({
        id: sessionData?.id,
        name: sessionData?.name,
        createdAt: new Date(sessionData?.created_at),
        lastAccessedAt: new Date(sessionData?.last_accessed_at),
        ...(sessionData?.last_checkpoint_at && {
          lastCheckpointAt: new Date(sessionData?.last_checkpoint_at),
        }),
        status: sessionData?.status as SessionStatus,
        swarmState: this.deserializeData(sessionData?.swarm_state),
        swarmOptions: this.deserializeData(sessionData?.swarm_options),
        metadata: this.deserializeData(sessionData?.metadata),
        checkpoints: [], // Load on demand
        version: sessionData?.version,
      })
    );
  }

  /**
   * Get session statistics.
   *
   * @param sessionId
   */
  async getSessionStats(sessionId?: string): Promise<Record<string, any>> {
    await this.ensureInitialized();

    if (sessionId) {
      // Stats for specific session
      const session = await this.loadSession(sessionId);
      return {
        sessionId,
        name: session.name,
        status: session.status,
        createdAt: session.createdAt,
        lastAccessedAt: session.lastAccessedAt,
        lastCheckpointAt: session.lastCheckpointAt,
        totalAgents: session.swarmState.agents.size,
        totalTasks: session.swarmState.tasks.size,
        completedTasks: session.swarmState.metrics.completedTasks,
        failedTasks: session.swarmState.metrics.failedTasks,
        checkpointCount: session.checkpoints.length,
        version: session.version,
      };
    } else {
      // Global stats
      const dao = await this.getDao();
      const stats = await dao.query(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(julianday('now') - julianday(last_accessed_at)) as avg_days_since_access
        FROM sessions 
        GROUP BY status
      `);

      const totalSessions = await dao.query('SELECT COUNT(*) as total FROM sessions');
      const totalCheckpoints = await dao.query('SELECT COUNT(*) as total FROM session_checkpoints');

      return {
        totalSessions: totalSessions[0]?.total,
        totalCheckpoints: totalCheckpoints[0]?.total,
        activeSessions: this.activeSessions.size,
        statusBreakdown: stats.reduce((acc: any, stat: any) => {
          acc[stat.status] = {
            count: stat.count,
            avgDaysSinceAccess: stat.avg_days_since_access,
          };
          return acc;
        }, {}),
      };
    }
  }

  /**
   * Private helper methods.
   */

  private async initializeSessionTables(): Promise<void> {
    const dao = await this.getDao();
    // Create sessions table
    await dao.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        swarm_options TEXT NOT NULL,
        swarm_state TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_checkpoint_at DATETIME,
        version TEXT DEFAULT '1.0.0'
      )
    `);

    // Create checkpoints table
    await dao.execute(`
      CREATE TABLE IF NOT EXISTS session_checkpoints (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT NOT NULL,
        state_data TEXT NOT NULL,
        description TEXT DEFAULT '',
        metadata TEXT DEFAULT '{}',
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await dao.execute('CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)');
    await dao.execute(
      'CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON sessions(last_accessed_at)'
    );
    await dao.execute(
      'CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON session_checkpoints(session_id)'
    );
    await dao.execute(
      'CREATE INDEX IF NOT EXISTS idx_checkpoints_timestamp ON session_checkpoints(timestamp)'
    );
  }

  private async restoreActiveSessions(): Promise<void> {
    const dao = await this.getDao();
    const activeSessions = await dao.query(
      "SELECT * FROM sessions WHERE status IN ('active', 'paused')"
    );

    for (const sessionData of activeSessions) {
      const sessionState: SessionState = {
        id: sessionData?.id,
        name: sessionData?.name,
        createdAt: new Date(sessionData?.created_at),
        lastAccessedAt: new Date(sessionData?.last_accessed_at),
        ...(sessionData?.last_checkpoint_at && {
          lastCheckpointAt: new Date(sessionData?.last_checkpoint_at),
        }),
        status: sessionData?.status as SessionStatus,
        swarmState: this.deserializeData(sessionData?.swarm_state),
        swarmOptions: this.deserializeData(sessionData?.swarm_options),
        metadata: this.deserializeData(sessionData?.metadata),
        checkpoints: await this.loadSessionCheckpoints(sessionData?.id),
        version: sessionData?.version,
      } satisfies SessionState;

      this.activeSessions.set(sessionState.id, sessionState);

      // Start auto-checkpoint for active sessions
      if (this.config.autoCheckpoint && sessionState.status === 'active') {
        this.startAutoCheckpoint(sessionState.id);
      }
    }
  }

  private async loadSessionCheckpoints(sessionId: string): Promise<SessionCheckpoint[]> {
    const dao = await this.getDao();
    const checkpoints = await dao.query(
      'SELECT * FROM session_checkpoints WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?',
      [sessionId, this.config.maxCheckpoints]
    );

    return checkpoints.map((cp: any) => ({
      id: cp.id,
      sessionId: cp.session_id,
      timestamp: new Date(cp.timestamp),
      checksum: cp.checksum,
      state: this.deserializeData(cp.state_data),
      description: cp.description,
      metadata: this.deserializeData(cp.metadata),
    }));
  }

  private async updateSessionAccess(sessionId: string): Promise<void> {
    const dao = await this.getDao();
    await dao.execute('UPDATE sessions SET last_accessed_at = ? WHERE id = ?', [
      new Date().toISOString(),
      sessionId,
    ]);
  }

  private async deleteCheckpoint(checkpointId: string): Promise<void> {
    const dao = await this.getDao();
    await dao.execute('DELETE FROM session_checkpoints WHERE id = ?', [checkpointId]);
  }

  private startAutoCheckpoint(sessionId: string): void {
    if (this.checkpointTimers.has(sessionId)) {
      return; // Already running
    }

    const timer = setInterval(async () => {
      try {
        await this.createCheckpoint(sessionId, 'Auto checkpoint');
      } catch (error) {
        this.emit('checkpoint:error', {
          sessionId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, this.config.checkpointInterval);

    this.checkpointTimers.set(sessionId, timer);
  }

  private stopAutoCheckpoint(sessionId: string): void {
    const timer = this.checkpointTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.checkpointTimers.delete(sessionId);
    }
  }

  private serializeData(data: any): string {
    if (this.config.compressionEnabled) {
      // In a real implementation, you'd use a compression library
      return JSON.stringify(data);
    }
    return JSON.stringify(data);
  }

  private deserializeData(serializedData: string): any {
    return JSON.parse(serializedData);
  }

  private calculateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Cleanup and shutdown.
   */
  async shutdown(): Promise<void> {
    // Stop all auto-checkpoint timers
    for (const [_sessionId, timer] of this.checkpointTimers) {
      clearInterval(timer);
    }
    this.checkpointTimers.clear();

    // Create final checkpoints for active sessions
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'active') {
        try {
          await this.createCheckpoint(sessionId, 'Shutdown checkpoint');
        } catch (error) {
          logger.error(`Failed to create shutdown checkpoint for session ${sessionId}:`, error);
        }
      }
    }

    this.activeSessions.clear();
    this.initialized = false;
    this.emit('manager:shutdown');
  }
}

export default SessionManager;
