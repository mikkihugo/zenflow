"use strict";
/**
 * Hive Mind Session Manager
 * Handles session persistence and resume functionality for swarms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveMindSessionManager = void 0;
const better_sqlite3_1 = require("better-sqlite3");
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const chalk_1 = require("chalk");
const node_compat_js_1 = require("../../node-compat.js");
class HiveMindSessionManager {
    constructor(hiveMindDir = null) {
        this.hiveMindDir = hiveMindDir || path_1.default.join((0, node_compat_js_1.cwd)(), '.hive-mind');
        this.sessionsDir = path_1.default.join(this.hiveMindDir, 'sessions');
        this.dbPath = path_1.default.join(this.hiveMindDir, 'hive.db');
        // Ensure directories exist
        this.ensureDirectories();
        // Initialize database connection
        this.db = new better_sqlite3_1.default(this.dbPath);
        this.initializeSchema();
    }
    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        if (!(0, fs_1.existsSync)(this.hiveMindDir)) {
            (0, fs_1.mkdirSync)(this.hiveMindDir, { recursive: true });
        }
        if (!(0, fs_1.existsSync)(this.sessionsDir)) {
            (0, fs_1.mkdirSync)(this.sessionsDir, { recursive: true });
        }
    }
    /**
     * Initialize database schema for sessions
     */
    initializeSchema() {
        // Create the base schema
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        swarm_id TEXT NOT NULL,
        swarm_name TEXT NOT NULL,
        objective TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paused_at DATETIME,
        resumed_at DATETIME,
        completion_percentage REAL DEFAULT 0,
        checkpoint_data TEXT,
        metadata TEXT,
        FOREIGN KEY (swarm_id) REFERENCES swarms(id)
      );

      CREATE TABLE IF NOT EXISTS session_checkpoints (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        checkpoint_name TEXT NOT NULL,
        checkpoint_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      CREATE TABLE IF NOT EXISTS session_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        log_level TEXT DEFAULT 'info',
        message TEXT,
        agent_id TEXT,
        data TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );
    `);
        // Run migrations to add new columns
        this.runMigrations();
    }
    /**
     * Run database migrations
     */
    runMigrations() {
        try {
            // Check if parent_pid column exists
            const columns = this.db.prepare("PRAGMA table_info(sessions)").all();
            const hasParentPid = columns.some(col => col.name === 'parent_pid');
            const hasChildPids = columns.some(col => col.name === 'child_pids');
            if (!hasParentPid) {
                this.db.exec('ALTER TABLE sessions ADD COLUMN parent_pid INTEGER');
                console.log('Added parent_pid column to sessions table');
            }
            if (!hasChildPids) {
                this.db.exec('ALTER TABLE sessions ADD COLUMN child_pids TEXT');
                console.log('Added child_pids column to sessions table');
            }
        }
        catch (error) {
            console.error('Migration error:', error);
        }
    }
    /**
     * Create a new session for a swarm
     */
    createSession(swarmId, swarmName, objective, metadata = {}) {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const stmt = this.db.prepare(`
      INSERT INTO sessions (id, swarm_id, swarm_name, objective, metadata, parent_pid)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(sessionId, swarmId, swarmName, objective, JSON.stringify(metadata), process.pid);
        // Log session creation
        this.logSessionEvent(sessionId, 'info', 'Session created', null, {
            swarmId,
            swarmName,
            objective,
            parentPid: process.pid
        });
        return sessionId;
    }
    /**
     * Save session checkpoint
     */
    async saveCheckpoint(sessionId, checkpointName, checkpointData) {
        const checkpointId = `checkpoint-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        // Save to database
        const stmt = this.db.prepare(`
      INSERT INTO session_checkpoints (id, session_id, checkpoint_name, checkpoint_data)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(checkpointId, sessionId, checkpointName, JSON.stringify(checkpointData));
        // Update session checkpoint data and timestamp
        const updateStmt = this.db.prepare(`
      UPDATE sessions 
      SET checkpoint_data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        updateStmt.run(JSON.stringify(checkpointData), sessionId);
        // Save checkpoint file for backup
        const checkpointFile = path_1.default.join(this.sessionsDir, `${sessionId}-${checkpointName}.json`);
        await (0, promises_1.writeFile)(checkpointFile, JSON.stringify({
            sessionId,
            checkpointId,
            checkpointName,
            timestamp: new Date().toISOString(),
            data: checkpointData
        }, null, 2));
        this.logSessionEvent(sessionId, 'info', `Checkpoint saved: ${checkpointName}`, null, {
            checkpointId
        });
        return checkpointId;
    }
    /**
     * Get active sessions
     */
    getActiveSessions() {
        const stmt = this.db.prepare(`
      SELECT s.*, 
             COUNT(DISTINCT a.id) as agent_count,
             COUNT(DISTINCT t.id) as task_count,
             SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM sessions s
      LEFT JOIN agents a ON s.swarm_id = a.swarm_id
      LEFT JOIN tasks t ON s.swarm_id = t.swarm_id
      WHERE s.status = 'active' OR s.status = 'paused'
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `);
        const sessions = stmt.all();
        // Parse JSON fields
        return sessions.map(session => ({
            ...session,
            metadata: session.metadata ? JSON.parse(session.metadata) : {},
            checkpoint_data: session.checkpoint_data ? JSON.parse(session.checkpoint_data) : null,
            completion_percentage: session.task_count > 0
                ? Math.round((session.completed_tasks / session.task_count) * 100)
                : 0
        }));
    }
    /**
     * Get session by ID with full details
     */
    getSession(sessionId) {
        const session = this.db.prepare(`
      SELECT * FROM sessions WHERE id = ?
    `).get(sessionId);
        if (!session) {
            return null;
        }
        // Get associated swarm data
        const swarm = this.db.prepare(`
      SELECT * FROM swarms WHERE id = ?
    `).get(session.swarm_id);
        // Get agents
        const agents = this.db.prepare(`
      SELECT * FROM agents WHERE swarm_id = ?
    `).all(session.swarm_id);
        // Get tasks
        const tasks = this.db.prepare(`
      SELECT * FROM tasks WHERE swarm_id = ?
    `).all(session.swarm_id);
        // Get checkpoints
        const checkpoints = this.db.prepare(`
      SELECT * FROM session_checkpoints 
      WHERE session_id = ? 
      ORDER BY created_at DESC
    `).all(sessionId);
        // Get recent logs
        const recentLogs = this.db.prepare(`
      SELECT * FROM session_logs 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 50
    `).all(sessionId);
        return {
            ...session,
            metadata: session.metadata ? JSON.parse(session.metadata) : {},
            checkpoint_data: session.checkpoint_data ? JSON.parse(session.checkpoint_data) : null,
            swarm,
            agents,
            tasks,
            checkpoints: checkpoints.map(cp => ({
                ...cp,
                checkpoint_data: JSON.parse(cp.checkpoint_data)
            })),
            recentLogs,
            statistics: {
                totalAgents: agents.length,
                activeAgents: agents.filter(a => a.status === 'active' || a.status === 'busy').length,
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                pendingTasks: tasks.filter(t => t.status === 'pending').length,
                inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
                completionPercentage: tasks.length > 0
                    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
                    : 0
            }
        };
    }
    /**
     * Pause a session
     */
    pauseSession(sessionId) {
        const stmt = this.db.prepare(`
      UPDATE sessions 
      SET status = 'paused', paused_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        const result = stmt.run(sessionId);
        if (result.changes > 0) {
            this.logSessionEvent(sessionId, 'info', 'Session paused');
            // Update swarm status
            const session = this.db.prepare('SELECT swarm_id FROM sessions WHERE id = ?').get(sessionId);
            if (session) {
                this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('paused', session.swarm_id);
            }
        }
        return result.changes > 0;
    }
    /**
     * Resume any previous session (paused, stopped, or inactive)
     */
    async resumeSession(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        // Allow resuming any session regardless of status
        console.log(`Resuming session ${sessionId} from status: ${session.status}`);
        // If session was stopped, log that we're restarting it
        if (session.status === 'stopped') {
            this.logSessionEvent(sessionId, 'info', `Restarting stopped session with original configuration`);
        }
        // Update session status
        const stmt = this.db.prepare(`
      UPDATE sessions 
      SET status = 'active', resumed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        stmt.run(sessionId);
        // Update swarm status
        this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('active', session.swarm_id);
        // Update agent statuses
        this.db.prepare(`
      UPDATE agents 
      SET status = CASE 
        WHEN role = 'queen' THEN 'active'
        ELSE 'idle'
      END
      WHERE swarm_id = ?
    `).run(session.swarm_id);
        this.logSessionEvent(sessionId, 'info', 'Session resumed', null, {
            pausedDuration: session.paused_at
                ? new Date() - new Date(session.paused_at)
                : null
        });
        return session;
    }
    /**
     * Mark session as completed
     */
    completeSession(sessionId) {
        const stmt = this.db.prepare(`
      UPDATE sessions 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP, completion_percentage = 100
      WHERE id = ?
    `);
        const result = stmt.run(sessionId);
        if (result.changes > 0) {
            this.logSessionEvent(sessionId, 'info', 'Session completed');
            // Update swarm status
            const session = this.db.prepare('SELECT swarm_id FROM sessions WHERE id = ?').get(sessionId);
            if (session) {
                this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('completed', session.swarm_id);
            }
        }
        return result.changes > 0;
    }
    /**
     * Archive old sessions
     */
    async archiveSessions(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const sessionsToArchive = this.db.prepare(`
      SELECT * FROM sessions 
      WHERE status = 'completed' AND updated_at < ?
    `).all(cutoffDate.toISOString());
        const archiveDir = path_1.default.join(this.sessionsDir, 'archive');
        if (!(0, fs_1.existsSync)(archiveDir)) {
            (0, fs_1.mkdirSync)(archiveDir, { recursive: true });
        }
        for (const session of sessionsToArchive) {
            const sessionData = this.getSession(session.id);
            const archiveFile = path_1.default.join(archiveDir, `${session.id}-archive.json`);
            await (0, promises_1.writeFile)(archiveFile, JSON.stringify(sessionData, null, 2));
            // Remove from database
            this.db.prepare('DELETE FROM session_logs WHERE session_id = ?').run(session.id);
            this.db.prepare('DELETE FROM session_checkpoints WHERE session_id = ?').run(session.id);
            this.db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
        }
        return sessionsToArchive.length;
    }
    /**
     * Log session event
     */
    logSessionEvent(sessionId, logLevel, message, agentId = null, data = null) {
        const stmt = this.db.prepare(`
      INSERT INTO session_logs (session_id, log_level, message, agent_id, data)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(sessionId, logLevel, message, agentId, data ? JSON.stringify(data) : null);
    }
    /**
     * Get session logs
     */
    getSessionLogs(sessionId, limit = 100, offset = 0) {
        const stmt = this.db.prepare(`
      SELECT * FROM session_logs 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `);
        const logs = stmt.all(sessionId, limit, offset);
        return logs.map(log => ({
            ...log,
            data: log.data ? JSON.parse(log.data) : null
        }));
    }
    /**
     * Update session progress
     */
    updateSessionProgress(sessionId, completionPercentage) {
        const stmt = this.db.prepare(`
      UPDATE sessions 
      SET completion_percentage = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        stmt.run(completionPercentage, sessionId);
    }
    /**
     * Generate session summary
     */
    generateSessionSummary(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) {
            return null;
        }
        const duration = session.paused_at && session.resumed_at
            ? new Date(session.updated_at) - new Date(session.created_at) - (new Date(session.resumed_at) - new Date(session.paused_at))
            : new Date(session.updated_at) - new Date(session.created_at);
        const tasksByType = session.agents.reduce((acc, agent) => {
            const agentTasks = session.tasks.filter(t => t.agent_id === agent.id);
            if (!acc[agent.type]) {
                acc[agent.type] = {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    pending: 0
                };
            }
            acc[agent.type].total += agentTasks.length;
            acc[agent.type].completed += agentTasks.filter(t => t.status === 'completed').length;
            acc[agent.type].inProgress += agentTasks.filter(t => t.status === 'in_progress').length;
            acc[agent.type].pending += agentTasks.filter(t => t.status === 'pending').length;
            return acc;
        }, {});
        return {
            sessionId: session.id,
            swarmName: session.swarm_name,
            objective: session.objective,
            status: session.status,
            duration: Math.round(duration / 1000 / 60), // minutes
            statistics: session.statistics,
            tasksByType,
            checkpointCount: session.checkpoints.length,
            lastCheckpoint: session.checkpoints[0] || null,
            timeline: {
                created: session.created_at,
                lastUpdated: session.updated_at,
                paused: session.paused_at,
                resumed: session.resumed_at
            }
        };
    }
    /**
     * Export session data
     */
    async exportSession(sessionId, exportPath = null) {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        const exportFile = exportPath || path_1.default.join(this.sessionsDir, `${sessionId}-export.json`);
        await (0, promises_1.writeFile)(exportFile, JSON.stringify(session, null, 2));
        return exportFile;
    }
    /**
     * Import session data
     */
    async importSession(importPath) {
        const sessionData = JSON.parse(await (0, promises_1.readFile)(importPath, 'utf8'));
        // Create new session with imported data
        const newSessionId = this.createSession(sessionData.swarm_id, sessionData.swarm_name, sessionData.objective, sessionData.metadata);
        // Import checkpoints
        for (const checkpoint of sessionData.checkpoints || []) {
            await this.saveCheckpoint(newSessionId, checkpoint.checkpoint_name, checkpoint.checkpoint_data);
        }
        // Import logs
        for (const log of sessionData.recentLogs || []) {
            this.logSessionEvent(newSessionId, log.log_level, log.message, log.agent_id, log.data ? JSON.parse(log.data) : null);
        }
        return newSessionId;
    }
    /**
     * Add a child process PID to session
     */
    addChildPid(sessionId, pid) {
        const session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
        if (!session)
            return false;
        const childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
        if (!childPids.includes(pid)) {
            childPids.push(pid);
        }
        const stmt = this.db.prepare(`
      UPDATE sessions 
      SET child_pids = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        stmt.run(JSON.stringify(childPids), sessionId);
        this.logSessionEvent(sessionId, 'info', 'Child process added', null, { pid });
        return true;
    }
    /**
     * Remove a child process PID from session
     */
    removeChildPid(sessionId, pid) {
        const session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
        if (!session)
            return false;
        const childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
        const index = childPids.indexOf(pid);
        if (index > -1) {
            childPids.splice(index, 1);
        }
        const stmt = this.db.prepare(`
      UPDATE sessions 
      SET child_pids = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        stmt.run(JSON.stringify(childPids), sessionId);
        this.logSessionEvent(sessionId, 'info', 'Child process removed', null, { pid });
        return true;
    }
    /**
     * Get all child PIDs for a session
     */
    getChildPids(sessionId) {
        const session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
        if (!session || !session.child_pids)
            return [];
        return JSON.parse(session.child_pids);
    }
    /**
     * Stop a session and terminate all child processes
     */
    async stopSession(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        // Get child PIDs
        const childPids = this.getChildPids(sessionId);
        // Terminate child processes
        for (const pid of childPids) {
            try {
                process.kill(pid, 'SIGTERM');
                this.logSessionEvent(sessionId, 'info', 'Child process terminated', null, { pid });
            }
            catch (err) {
                // Process might already be dead
                this.logSessionEvent(sessionId, 'warning', 'Failed to terminate child process', null, {
                    pid,
                    error: err.message
                });
            }
        }
        // Update session status
        const stmt = this.db.prepare(`
      UPDATE sessions 
      SET status = 'stopped', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        stmt.run(sessionId);
        // Update swarm status
        this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('stopped', session.swarm_id);
        this.logSessionEvent(sessionId, 'info', 'Session stopped');
        return true;
    }
    /**
     * Get active sessions with process information
     */
    getActiveSessionsWithProcessInfo() {
        const sessions = this.getActiveSessions();
        // Add process info to each session
        return sessions.map(session => {
            const childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
            const aliveChildPids = [];
            // Check which child processes are still alive
            for (const pid of childPids) {
                try {
                    process.kill(pid, 0); // Signal 0 just checks if process exists
                    aliveChildPids.push(pid);
                }
                catch (err) {
                    // Process is dead
                }
            }
            return {
                ...session,
                parent_pid: session.parent_pid,
                child_pids: aliveChildPids,
                total_processes: 1 + aliveChildPids.length
            };
        });
    }
    /**
     * Clean up orphaned processes
     */
    cleanupOrphanedProcesses() {
        const sessions = this.db.prepare(`
      SELECT * FROM sessions 
      WHERE status IN ('active', 'paused')
    `).all();
        let cleanedCount = 0;
        for (const session of sessions) {
            // Check if parent process is still alive
            try {
                process.kill(session.parent_pid, 0);
            }
            catch (err) {
                // Parent is dead, clean up session
                this.stopSession(session.id);
                cleanedCount++;
                this.logSessionEvent(session.id, 'info', 'Orphaned session cleaned up');
            }
        }
        return cleanedCount;
    }
    /**
     * Clean up and close database connection
     */
    close() {
        this.db.close();
    }
}
exports.HiveMindSessionManager = HiveMindSessionManager;
// Export for use in other modules
exports.default = HiveMindSessionManager;
