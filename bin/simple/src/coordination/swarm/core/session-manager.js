import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-core-session-manager');
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import { createDao, DatabaseTypes, EntityTypes, } from '../../../database/index.js';
import { generateId } from './utils.ts';
export class SessionManager extends EventEmitter {
    coordinationDao;
    activeSessions;
    config;
    checkpointTimers;
    initialized = false;
    constructor(coordinationDao, config = {}) {
        super();
        this.coordinationDao = coordinationDao;
        this.activeSessions = new Map();
        this.checkpointTimers = new Map();
        this.config = {
            autoCheckpoint: config.autoCheckpoint === undefined ? true : config?.autoCheckpoint,
            checkpointInterval: config.checkpointInterval === undefined
                ? 300000
                : config?.checkpointInterval,
            maxCheckpoints: config.maxCheckpoints === undefined ? 10 : config?.maxCheckpoints,
            compressionEnabled: config.compressionEnabled === undefined
                ? true
                : config?.compressionEnabled,
            encryptionEnabled: config.encryptionEnabled === undefined
                ? false
                : config?.encryptionEnabled,
            encryptionKey: config.encryptionKey === undefined
                ? this.generateEncryptionKey()
                : config?.encryptionKey,
        };
    }
    async ensureInitialized() {
        if (!this.coordinationDao) {
            const dao = await createDao(EntityTypes.CoordinationEvent, DatabaseTypes?.Coordination);
            this.coordinationDao = {
                ...dao,
                execute: async (sql, params) => {
                    const customQuery = {
                        type: 'sql',
                        query: sql,
                        parameters: params
                            ? Object.fromEntries(params.map((p, i) => [i.toString(), p]))
                            : {},
                    };
                    const result = await dao.executeCustomQuery(customQuery);
                    return result || { affectedRows: 0 };
                },
                query: async (sql, params) => {
                    const customQuery = {
                        type: 'sql',
                        query: sql,
                        parameters: params
                            ? Object.fromEntries(params.map((p, i) => [i.toString(), p]))
                            : {},
                    };
                    const result = await dao.executeCustomQuery(customQuery);
                    return Array.isArray(result) ? result : [];
                },
                acquireLock: async (resourceId, lockTimeout) => {
                    throw new Error('Lock operations not yet implemented');
                },
                releaseLock: async (lockId) => {
                    throw new Error('Lock operations not yet implemented');
                },
                subscribe: async (pattern, callback) => {
                    throw new Error('Subscription operations not yet implemented');
                },
                unsubscribe: async (subscriptionId) => {
                    throw new Error('Subscription operations not yet implemented');
                },
                publish: async (channel, event) => {
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
            };
        }
    }
    async getDao() {
        await this.ensureInitialized();
        return this.coordinationDao;
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            await this.ensureInitialized();
            await this.initializeSessionTables();
            await this.restoreActiveSessions();
            this.initialized = true;
            this.emit('manager:initialized');
        }
        catch (error) {
            throw new Error(`Failed to initialize SessionManager: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async createSession(name, swarmOptions, initialState) {
        await this.ensureInitialized();
        const sessionId = generateId('session');
        const now = new Date();
        const defaultSwarmState = {
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
        const sessionState = {
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
        const dao = await this.getDao();
        await dao.execute(`
      INSERT INTO sessions (id, name, status, swarm_options, swarm_state, metadata, created_at, last_accessed_at, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            sessionId,
            name,
            'active',
            this.serializeData(swarmOptions),
            this.serializeData(sessionState.swarmState),
            this.serializeData(sessionState.metadata),
            now.toISOString(),
            now.toISOString(),
            sessionState.version,
        ]);
        this.activeSessions.set(sessionId, sessionState);
        if (this.config.autoCheckpoint) {
            this.startAutoCheckpoint(sessionId);
        }
        this.emit('session:created', { sessionId, name });
        return sessionId;
    }
    async loadSession(sessionId) {
        await this.ensureInitialized();
        if (this.activeSessions.has(sessionId)) {
            const session = this.activeSessions.get(sessionId);
            session.lastAccessedAt = new Date();
            await this.updateSessionAccess(sessionId);
            return session;
        }
        const dao = await this.getDao();
        const sessions = await dao.query('SELECT * FROM sessions WHERE id = ?', [
            sessionId,
        ]);
        if (sessions.length === 0) {
            throw new Error(`Session ${sessionId} not found`);
        }
        const sessionData = sessions[0];
        const sessionState = {
            id: sessionData?.id,
            name: sessionData?.name,
            createdAt: new Date(sessionData?.created_at),
            lastAccessedAt: new Date(),
            ...(sessionData?.last_checkpoint_at && {
                lastCheckpointAt: new Date(sessionData?.last_checkpoint_at),
            }),
            status: sessionData?.status,
            swarmState: this.deserializeData(sessionData?.swarm_state),
            swarmOptions: this.deserializeData(sessionData?.swarm_options),
            metadata: this.deserializeData(sessionData?.metadata),
            checkpoints: await this.loadSessionCheckpoints(sessionId),
            version: sessionData?.version,
        };
        this.activeSessions.set(sessionId, sessionState);
        await this.updateSessionAccess(sessionId);
        if (this.config.autoCheckpoint && sessionState.status === 'active') {
            this.startAutoCheckpoint(sessionId);
        }
        this.emit('session:loaded', { sessionId });
        return sessionState;
    }
    async saveSession(sessionId, state) {
        await this.ensureInitialized();
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found in active sessions`);
        }
        if (state) {
            session.swarmState = { ...session.swarmState, ...state };
        }
        session.lastAccessedAt = new Date();
        const dao = await this.getDao();
        await dao.execute(`
      UPDATE sessions 
      SET swarm_state = ?, last_accessed_at = ?
      WHERE id = ?
    `, [
            this.serializeData(session.swarmState),
            session.lastAccessedAt.toISOString(),
            sessionId,
        ]);
        this.emit('session:saved', { sessionId });
    }
    async createCheckpoint(sessionId, description = 'Auto checkpoint', metadata = {}) {
        await this.ensureInitialized();
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        const checkpointId = generateId('checkpoint');
        const now = new Date();
        const stateData = this.serializeData(session.swarmState);
        const checksum = this.calculateChecksum(stateData);
        const checkpoint = {
            id: checkpointId,
            sessionId,
            timestamp: now,
            checksum,
            state: session.swarmState,
            description,
            metadata,
        };
        const dao = await this.getDao();
        await dao.execute(`
      INSERT INTO session_checkpoints (id, session_id, timestamp, checksum, state_data, description, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            checkpointId,
            sessionId,
            now.toISOString(),
            checksum,
            stateData,
            description,
            this.serializeData(metadata),
        ]);
        session.checkpoints.push(checkpoint);
        session.lastCheckpointAt = now;
        if (session.checkpoints.length > this.config.maxCheckpoints) {
            const oldestCheckpoint = session.checkpoints.shift();
            await this.deleteCheckpoint(oldestCheckpoint.id);
        }
        await dao.execute(`
      UPDATE sessions SET last_checkpoint_at = ? WHERE id = ?
    `, [now.toISOString(), sessionId]);
        this.emit('checkpoint:created', { sessionId, checkpointId, description });
        return checkpointId;
    }
    async restoreFromCheckpoint(sessionId, checkpointId, options = {}) {
        await this.ensureInitialized();
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        const dao = await this.getDao();
        const checkpoints = await dao.query('SELECT * FROM session_checkpoints WHERE id = ? AND session_id = ?', [checkpointId, sessionId]);
        if (checkpoints.length === 0) {
            throw new Error(`Checkpoint ${checkpointId} not found`);
        }
        const checkpointData = checkpoints[0];
        const stateData = checkpointData?.state_data;
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
        const restoredState = this.deserializeData(stateData);
        session.swarmState = restoredState;
        session.lastAccessedAt = new Date();
        session.status = 'active';
        await this.saveSession(sessionId);
        this.emit('session:restored', { sessionId, checkpointId });
    }
    async pauseSession(sessionId) {
        await this.ensureInitialized();
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        session.status = 'paused';
        session.lastAccessedAt = new Date();
        this.stopAutoCheckpoint(sessionId);
        const dao = await this.getDao();
        await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', ['paused', session.lastAccessedAt.toISOString(), sessionId]);
        this.emit('session:paused', { sessionId });
    }
    async resumeSession(sessionId) {
        await this.ensureInitialized();
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        session.status = 'active';
        session.lastAccessedAt = new Date();
        if (this.config.autoCheckpoint) {
            this.startAutoCheckpoint(sessionId);
        }
        const dao = await this.getDao();
        await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', ['active', session.lastAccessedAt.toISOString(), sessionId]);
        this.emit('session:resumed', { sessionId });
    }
    async hibernateSession(sessionId) {
        await this.ensureInitialized();
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        await this.createCheckpoint(sessionId, 'Pre-hibernation checkpoint');
        session.status = 'hibernated';
        session.lastAccessedAt = new Date();
        this.stopAutoCheckpoint(sessionId);
        const dao = await this.getDao();
        await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', ['hibernated', session.lastAccessedAt.toISOString(), sessionId]);
        this.activeSessions.delete(sessionId);
        this.emit('session:hibernated', { sessionId });
    }
    async terminateSession(sessionId, cleanup = false) {
        await this.ensureInitialized();
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.status = 'terminated';
            this.stopAutoCheckpoint(sessionId);
            this.activeSessions.delete(sessionId);
        }
        const dao = await this.getDao();
        await dao.execute('UPDATE sessions SET status = ?, last_accessed_at = ? WHERE id = ?', ['terminated', new Date().toISOString(), sessionId]);
        if (cleanup) {
            await dao.execute('DELETE FROM session_checkpoints WHERE session_id = ?', [sessionId]);
            await dao.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
        }
        this.emit('session:terminated', { sessionId, cleanup });
    }
    async listSessions(filter) {
        await this.ensureInitialized();
        let sql = 'SELECT * FROM sessions';
        const params = [];
        const conditions = [];
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
        return sessions.map((sessionData) => ({
            id: sessionData?.id,
            name: sessionData?.name,
            createdAt: new Date(sessionData?.created_at),
            lastAccessedAt: new Date(sessionData?.last_accessed_at),
            ...(sessionData?.last_checkpoint_at && {
                lastCheckpointAt: new Date(sessionData?.last_checkpoint_at),
            }),
            status: sessionData?.status,
            swarmState: this.deserializeData(sessionData?.swarm_state),
            swarmOptions: this.deserializeData(sessionData?.swarm_options),
            metadata: this.deserializeData(sessionData?.metadata),
            checkpoints: [],
            version: sessionData?.version,
        }));
    }
    async getSessionStats(sessionId) {
        await this.ensureInitialized();
        if (sessionId) {
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
        }
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
            statusBreakdown: stats.reduce((acc, stat) => {
                acc[stat.status] = {
                    count: stat.count,
                    avgDaysSinceAccess: stat.avg_days_since_access,
                };
                return acc;
            }, {}),
        };
    }
    async initializeSessionTables() {
        const dao = await this.getDao();
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
        await dao.execute('CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)');
        await dao.execute('CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON sessions(last_accessed_at)');
        await dao.execute('CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON session_checkpoints(session_id)');
        await dao.execute('CREATE INDEX IF NOT EXISTS idx_checkpoints_timestamp ON session_checkpoints(timestamp)');
    }
    async restoreActiveSessions() {
        const dao = await this.getDao();
        const activeSessions = await dao.query("SELECT * FROM sessions WHERE status IN ('active', 'paused')");
        for (const sessionData of activeSessions) {
            const sessionState = {
                id: sessionData?.id,
                name: sessionData?.name,
                createdAt: new Date(sessionData?.created_at),
                lastAccessedAt: new Date(sessionData?.last_accessed_at),
                ...(sessionData?.last_checkpoint_at && {
                    lastCheckpointAt: new Date(sessionData?.last_checkpoint_at),
                }),
                status: sessionData?.status,
                swarmState: this.deserializeData(sessionData?.swarm_state),
                swarmOptions: this.deserializeData(sessionData?.swarm_options),
                metadata: this.deserializeData(sessionData?.metadata),
                checkpoints: await this.loadSessionCheckpoints(sessionData?.id),
                version: sessionData?.version,
            };
            this.activeSessions.set(sessionState.id, sessionState);
            if (this.config.autoCheckpoint && sessionState.status === 'active') {
                this.startAutoCheckpoint(sessionState.id);
            }
        }
    }
    async loadSessionCheckpoints(sessionId) {
        const dao = await this.getDao();
        const checkpoints = await dao.query('SELECT * FROM session_checkpoints WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?', [sessionId, this.config.maxCheckpoints]);
        return checkpoints.map((cp) => ({
            id: cp.id,
            sessionId: cp.session_id,
            timestamp: new Date(cp.timestamp),
            checksum: cp.checksum,
            state: this.deserializeData(cp.state_data),
            description: cp.description,
            metadata: this.deserializeData(cp.metadata),
        }));
    }
    async updateSessionAccess(sessionId) {
        const dao = await this.getDao();
        await dao.execute('UPDATE sessions SET last_accessed_at = ? WHERE id = ?', [
            new Date().toISOString(),
            sessionId,
        ]);
    }
    async deleteCheckpoint(checkpointId) {
        const dao = await this.getDao();
        await dao.execute('DELETE FROM session_checkpoints WHERE id = ?', [
            checkpointId,
        ]);
    }
    startAutoCheckpoint(sessionId) {
        if (this.checkpointTimers.has(sessionId)) {
            return;
        }
        const timer = setInterval(async () => {
            try {
                await this.createCheckpoint(sessionId, 'Auto checkpoint');
            }
            catch (error) {
                this.emit('checkpoint:error', {
                    sessionId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }, this.config.checkpointInterval);
        this.checkpointTimers.set(sessionId, timer);
    }
    stopAutoCheckpoint(sessionId) {
        const timer = this.checkpointTimers.get(sessionId);
        if (timer) {
            clearInterval(timer);
            this.checkpointTimers.delete(sessionId);
        }
    }
    serializeData(data) {
        if (this.config.compressionEnabled) {
            return JSON.stringify(data);
        }
        return JSON.stringify(data);
    }
    deserializeData(serializedData) {
        return JSON.parse(serializedData);
    }
    calculateChecksum(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }
    async shutdown() {
        for (const [_sessionId, timer] of this.checkpointTimers) {
            clearInterval(timer);
        }
        this.checkpointTimers.clear();
        for (const [sessionId, session] of this.activeSessions) {
            if (session.status === 'active') {
                try {
                    await this.createCheckpoint(sessionId, 'Shutdown checkpoint');
                }
                catch (error) {
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
//# sourceMappingURL=session-manager.js.map