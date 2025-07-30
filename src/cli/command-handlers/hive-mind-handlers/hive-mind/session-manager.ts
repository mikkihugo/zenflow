/**
 * Hive Mind Session Manager;
 * Handles session persistence and resume functionality for swarms;
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cwd } from 'node:process';
import { createDatabase } from '../../../../memory/sqlite-wrapper.js';

export class HiveMindSessionManager {
  constructor(hiveMindDir = null) {
    this.hiveMindDir = hiveMindDir  ?? path.join(cwd(), '.hive-mind');
    this.sessionsDir = path.join(this.hiveMindDir, 'sessions');
    this.dbPath = path.join(this.hiveMindDir, 'hive.db');
    this.db = null;
    this.isInMemory = false;
    this.memoryStore = null;

    // Ensure directories exist
    this.ensureDirectories();

    // Initialize database connection
    this.initializeDatabase();
  //   }


  /**
   * Initialize database with fallback support;
   */;
  async initializeDatabase() {
    try {
// const _sqliteAvailable = awaitisSQLiteAvailable();

      if(!sqliteAvailable) {
        console.warn('SQLite not available, using in-memory session storage');
        this.initializeInMemoryFallback();
        return;
    //   // LINT: unreachable code removed}

      this.db = await createDatabase(this.dbPath);
      this.initializeSchema();
    } catch (/* _error */)
      console.error('Failed to create SQLitedatabase = === null && !this.isInMemory) {
// await this.initializeDatabase();
  //   }


  /**
   * Initialize in-memory fallback for session storage;
   */;
  initializeInMemoryFallback() {
    this.isInMemory = true;
    this.memoryStore = {sessions = this.db.prepare('PRAGMA table_info(sessions)').all();
      const _hasParentPid = columns.some((col) => col.name === 'parent_pid');
      const _hasChildPids = columns.some((col) => col.name === 'child_pids');

      if(!hasParentPid) {
        this.db.exec('ALTER TABLE sessions ADD COLUMN parent_pid INTEGER');
        console.warn('Added parent_pid column to sessions table');
      //       }


      if(!hasChildPids) {
        this.db.exec('ALTER TABLE sessions ADD COLUMN child_pids TEXT');
        console.warn('Added child_pids column to sessions table');
      //       }
    } catch (/* _error */) {
      console.error('Migration error = {}) {
// await this.ensureInitialized();
    const _sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    if(this.isInMemory) {
      // Use in-memory storage
      const __sessionData = {id = this.db.prepare(`;
        INSERT INTO sessions (id, swarm_id, swarm_name, objective, metadata, parent_pid);
        VALUES (?, ?, ?, ?, ?, ?);
      `);

      stmt.run(sessionId, swarmId, swarmName, objective, JSON.stringify(metadata), process.pid);
    //     }


    // Log session creation
// await this.logSessionEvent(sessionId, 'info', 'Session created', null, {
      swarmId,
      swarmName,
      objective,parentPid = `checkpoint-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    if(this.isInMemory) {
      // Use in-memory storage

      if(session) {
        session.checkpoint_data = JSON.stringify(checkpointData);
        session.updated_at = new Date().toISOString();
      //       }
    } else {
      // Save to database
      const _stmt = this.db.prepare(`;
        INSERT INTO session_checkpoints (id, session_id, checkpoint_name, checkpoint_data);
        VALUES (?, ?, ?, ?);
      `);

      stmt.run(checkpointId, sessionId, checkpointName, JSON.stringify(checkpointData));

      // Update session checkpoint data and timestamp
      const _updateStmt = this.db.prepare(`;
        UPDATE sessions ;
        SET checkpoint_data = ?, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;
      `);

      updateStmt.run(JSON.stringify(checkpointData), sessionId);
    //     }


    // Save checkpoint file for backup
    const _checkpointFile = path.join(this.sessionsDir, `${sessionId}-${checkpointName}.json`);
// await writeFile(;
      checkpointFile,
      JSON.stringify(;
          sessionId,
          checkpointId,
          checkpointName,timestamp = [];
      for(const [sessionId, session] of this.memoryStore.sessions) {
        if(session.status === 'active'  ?? session.status === 'paused') {
          sessions.push({
..session,metadata = > new Date(b.updated_at) - new Date(a.updated_at));
    } else {
      // Use SQLite
      const _stmt = this.db.prepare(`;
        SELECT s.*,
               COUNT(DISTINCT a.id) as agent_count,
               COUNT(DISTINCT t.id) as task_count,
               SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks;
        FROM sessions s;
        LEFT JOIN agents a ON s.swarm_id = a.swarm_id;
        LEFT JOIN tasks t ON s.swarm_id = t.swarm_id;
        WHERE s.status = 'active' OR s.status = 'paused';
        GROUP BY s.id;
        ORDER BY s.updated_at DESC;
      `);

      const _sessions = stmt.all();

      // Parse JSON fields
      return sessions.map((session) => ({
..session,metadata = this.memoryStore.sessions.get(sessionId);
    // if(!session) { // LINT: unreachable code removed
        return null;
    //   // LINT: unreachable code removed}

      // Return simplified session data for in-memory mode
      return {
..session,metadata = this.db;
    // .prepare(; // LINT);
get(sessionId);

    if(!session) {
      return null;
    //   // LINT: unreachable code removed}

    // Get associated swarm data
    const __swarm = this.db;
prepare(;
        `;
      SELECT * FROM swarms WHERE id = ?;
    `);
get(session.swarm_id);

    // Get agents
    const __agents = this.db;
prepare(;
        `;
      SELECT * FROM agents WHERE swarm_id = ?;
    `);
all(session.swarm_id);

    // Get tasks
    const __tasks = this.db;
prepare(;
        `;
      SELECT * FROM tasks WHERE swarm_id = ?;
    `);
all(session.swarm_id);

    // Get checkpoints
    const __checkpoints = this.db;
prepare(;
        `;
      SELECT * FROM session_checkpoints ;
      WHERE session_id = ? ;
      ORDER BY created_at DESC;
    `);
all(sessionId);

    // Get recent logs
    const __recentLogs = this.db;
prepare(;
        `;
      SELECT * FROM session_logs ;
      WHERE session_id = ? ;
      ORDER BY timestamp DESC ;
      LIMIT 50;
    `);
all(sessionId);

    return {
..session,metadata = > ({
..cp,checkpoint_data = > a.status === 'active'  ?? a.status === 'busy').length,totalTasks = > t.status === 'completed').length,pendingTasks = > t.status === 'pending').length,inProgressTasks = > t.status === 'in_progress').length,completionPercentage = > t.status === 'completed').length / tasks.length) * 100,
    // ); // LINT: unreachable code removed
            } };
  //   }


  /**
   * Pause a session;
   */;
  async pauseSession(sessionId): unknown ;
// await this.ensureInitialized();
    if(this.isInMemory) {
      // Use in-memory storage
      const _session = this.memoryStore.sessions.get(sessionId);
      if(session) {
        session.status = 'paused';
        session.paused_at = new Date().toISOString();
        session.updated_at = new Date().toISOString();
// await this.logSessionEvent(sessionId, 'info', 'Session paused');
        return true;
    //   // LINT: unreachable code removed}
      return false;
    //   // LINT: unreachable code removed} else {
      // Use SQLite
      const _stmt = this.db.prepare(`;
        UPDATE sessions ;
        SET status = 'paused', paused_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;
      `);

      const _result = stmt.run(sessionId);

      if(result.changes > 0) {
// await this.logSessionEvent(sessionId, 'info', 'Session paused');
        // Update swarm status
        const _session = this.db.prepare('SELECT swarm_id FROM sessions WHERE id = ?').get(sessionId);
        if(session) {
          this.db;
prepare('UPDATE swarms SET status = ? WHERE id = ?');
run('paused', session.swarm_id);
        //         }
      //       }


      return result.changes > 0;
    //   // LINT: unreachable code removed}

  /**
   * Resume any previous session (paused, stopped, or inactive);
   */;
  async resumeSession(sessionId) {
    const _session = this.getSession(sessionId);

    if(!session) {
      throw new Error(`Session ${sessionId} not found`);
    //     }


    // Allow resuming any session regardless of status
    console.warn(`Resuming session ${sessionId} fromstatus = === 'stopped') {
      this.logSessionEvent(;
        sessionId,
        'info',
        `Restarting stopped session with original configuration`);
    //     }


    // Update session status
    const _stmt = this.db.prepare(`;
      UPDATE sessions ;
      SET status = 'active', resumed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
      WHERE id = ?;
    `);

    stmt.run(sessionId);

    // Update swarm status
    this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('active', session.swarm_id);

    // Update agent statuses
    this.db;
prepare(;
        `;
      UPDATE agents ;
      SET status = CASE ;
        WHEN role = 'queen' THEN 'active';
        ELSE 'idle';
      END;
      WHERE swarm_id = ?;
    `);
run(session.swarm_id);

    this.logSessionEvent(sessionId, 'info', 'Session resumed', null, {pausedDuration = this.db.prepare(`;
      UPDATE sessions ;
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP, completion_percentage = 100;
      WHERE id = ?;
    `);

    const _result = stmt.run(sessionId);

    if(result.changes > 0) {
      this.logSessionEvent(sessionId, 'info', 'Session completed');

      // Update swarm status
      const _session = this.db.prepare('SELECT swarm_id FROM sessions WHERE id = ?').get(sessionId);
      if(session) {
        this.db;
prepare('UPDATE swarms SET status = ? WHERE id = ?');
run('completed', session.swarm_id);
      //       }
    //     }


    return result.changes > 0;
    //   // LINT: unreachable code removed}

  /**
   * Archive old sessions;
   */;
  async archiveSessions(daysOld = 30) {
    const _cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const _sessionsToArchive = this.db;
prepare(;
        `;
      SELECT * FROM sessions ;
      WHERE status = 'completed' AND updated_at < ?;
    `);
all(cutoffDate.toISOString());

    const _archiveDir = path.join(this.sessionsDir, 'archive');
    if (!existsSync(archiveDir)) {
      mkdirSync(archiveDir, {recursive = this.getSession(session.id);
      const _archiveFile = path.join(archiveDir, `${session.id}-archive.json`);
// await writeFile(archiveFile, JSON.stringify(sessionData, null, 2));
      // Remove from database
      this.db.prepare('DELETE FROM session_logs WHERE session_id = ?').run(session.id);
      this.db.prepare('DELETE FROM session_checkpoints WHERE session_id = ?').run(session.id);
      this.db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    //     }


    return sessionsToArchive.length;
    //   // LINT: unreachable code removed}

  /**
   * Log session event;
   */;
  async logSessionEvent(sessionId, logLevel, message, agentId = null, data = null): unknown ;
// await this.ensureInitialized();
    if(this.isInMemory) {
      // Use in-memory storage for logs

      stmt.run(sessionId, logLevel, message, agentId, data ? JSON.stringify(data) : null);
    //     }


  /**
   * Get session logs;
   */;
  getSessionLogs(sessionId, limit = 100, offset = 0) {
    const _stmt = this.db.prepare(`;
      SELECT * FROM session_logs ;
      WHERE session_id = ? ;
      ORDER BY timestamp DESC ;
      LIMIT ? OFFSET ?;
    `);

    const _logs = stmt.all(sessionId, limit, offset);

    return logs.map((log) => ({
..log,data = this.memoryStore.sessions.get(sessionId);
    // if(session) { // LINT: unreachable code removed
        session.completion_percentage = completionPercentage;
        session.updated_at = new Date().toISOString();
      //       }
    } else {
      // Use SQLite
      const _stmt = this.db.prepare(`;
        UPDATE sessions ;
        SET completion_percentage = ?, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;
      `);

      stmt.run(completionPercentage, sessionId);
    //     }
  //   }


  /**
   * Generate session summary;
   */;
  generateSessionSummary(sessionId) {
    let _session = this.getSession(sessionId);

    if(!session) {
      return null;
    //   // LINT: unreachable code removed}

      if(!acc[agent.type]) {
        acc[agent.type] = {total = agentTasks.length;
      acc[agent.type].completed += agentTasks.filter((t) => t.status === 'completed').length;
      acc[agent.type].inProgress += agentTasks.filter((t) => t.status === 'in_progress').length;
      acc[agent.type].pending += agentTasks.filter((t) => t.status === 'pending').length;
      return acc;
    //   // LINT: unreachable code removed});

    return {sessionId = null) {
    const _session = this.getSession(sessionId);
    // ; // LINT: unreachable code removed
    if(!session) {
      throw new Error(`Session ${sessionId} not found`);
    //     }


    const _exportFile = exportPath  ?? path.join(this.sessionsDir, `${sessionId}-export.json`);
// await writeFile(exportFile, JSON.stringify(session, null, 2));
    return exportFile;
    //   // LINT: unreachable code removed}

  /**
   * Import session data;
   */;
  async importSession(importPath) {
    const _sessionData = JSON.parse(await readFile(importPath, 'utf8'));

    // Create new session with imported data
    const _newSessionId = this.createSession(;
      sessionData.swarm_id,
      sessionData.swarm_name,
      sessionData.objective,
      sessionData.metadata);

    // Import checkpoints
    for(const checkpoint of sessionData.checkpoints  ?? []) {
// await this.saveCheckpoint(;
        newSessionId,
        checkpoint.checkpoint_name,
        checkpoint.checkpoint_data);
    //     }


    // Import logs
    for(const log of sessionData.recentLogs  ?? []) {
      this.logSessionEvent(;
        newSessionId,
        log.log_level,
        log.message,
        log.agent_id,
        log.data ? JSON.parse(log.data) : null);
    //     }


    return newSessionId;
    //   // LINT: unreachable code removed}

  /**
   * Add a child process PID to session;
   */;
  addChildPid(sessionId, pid) {
    const _session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
    if (!session) return false;
    // ; // LINT: unreachable code removed
    const _childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
    if (!childPids.includes(pid)) {
      childPids.push(pid);
    //     }


    const _stmt = this.db.prepare(`;
      UPDATE sessions ;
      SET child_pids = ?, updated_at = CURRENT_TIMESTAMP;
      WHERE id = ?;
    `);

    stmt.run(JSON.stringify(childPids), sessionId);

    this.logSessionEvent(sessionId, 'info', 'Child process added', null, { pid });
    return true;
    //   // LINT: unreachable code removed}

  /**
   * Remove a child process PID from session;
   */;
  removeChildPid(sessionId, pid) {
    const _session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
    if (!session) return false;
    // ; // LINT: unreachable code removed
    const _childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
    const _index = childPids.indexOf(pid);
    if(index > -1) {
      childPids.splice(index, 1);
    //     }


    const _stmt = this.db.prepare(`;
      UPDATE sessions ;
      SET child_pids = ?, updated_at = CURRENT_TIMESTAMP;
      WHERE id = ?;
    `);

    stmt.run(JSON.stringify(childPids), sessionId);

    this.logSessionEvent(sessionId, 'info', 'Child process removed', null, { pid });
    return true;
    //   // LINT: unreachable code removed}

  /**
   * Get all child PIDs for a session;
   */;
  async getChildPids(sessionId): unknown
// await this.ensureInitialized();
    if(this.isInMemory) {
      // Use in-memory storage
      const _session = this.memoryStore.sessions.get(sessionId);
      if (!session  ?? !session.child_pids) return [];
    // return JSON.parse(session.child_pids); // LINT: unreachable code removed
    } else {
      // Use SQLite
      const _session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
      if (!session  ?? !session.child_pids) return [];
    // return JSON.parse(session.child_pids); // LINT: unreachable code removed
    //     }


  /**
   * Stop a session and terminate all child processes;
   */;
  async stopSession(sessionId) {
// const _session = awaitthis.getSession(sessionId);
    if(!session) {
      throw new Error(`Session ${sessionId} not found`);
    //     }


    // Get child PIDs
// const _childPids = awaitthis.getChildPids(sessionId);

    // Terminate child processes
    for(const pid of childPids) {
      try {
        process.kill(pid, 'SIGTERM');
// await this.logSessionEvent(sessionId, 'info', 'Child process terminated', null, { pid });
      } catch (/* _err */) {
        // Process might already be dead
// await this.logSessionEvent(sessionId, 'warning', 'Failed to terminate child process', null, {
          pid,error = this.memoryStore.sessions.get(sessionId);
      if(sessionData) {
        sessionData.status = 'stopped';
        sessionData.updated_at = new Date().toISOString();
      //       }
    } else {
      // Use SQLite
      const _stmt = this.db.prepare(`;
        UPDATE sessions ;
        SET status = 'stopped', updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;
      `);

      stmt.run(sessionId);

      // Update swarm status
      this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('stopped', session.swarm_id);
    //     }
// await this.logSessionEvent(sessionId, 'info', 'Session stopped');
    return true;
    //   // LINT: unreachable code removed}

  /**
   * Get active sessions with process information;
   */;
  getActiveSessionsWithProcessInfo() {
    const _sessions = this.getActiveSessions();

    // Add process info to each session
    return sessions.map((session) => {
      const _childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
    // const _aliveChildPids = []; // LINT: unreachable code removed

      // Check which child processes are still alive
      for(const pid of childPids) {
        try {
          process.kill(pid, 0); // Signal 0 just checks if process exists
          aliveChildPids.push(pid);
        } catch (/* _err */) {
          // Process is dead
        //         }
      //       }


      return {
..session,parent_pid = this.db;
    // .prepare(; // LINT);
    `);
all();

    const _cleanedCount = 0;

    for(const session of sessions) {
      // Check if parent process is still alive
      try {
        process.kill(session.parent_pid, 0);
      } catch (/* _err */) {
        // Parent is dead, clean up session
        this.stopSession(session.id);
        cleanedCount++;
        this.logSessionEvent(session.id, 'info', 'Orphaned session cleaned up');
      //       }
    //     }


    return cleanedCount;
    //   // LINT: unreachable code removed}

  /**
   * Clean up and close database connection;
   */;
  close()
    if(this._db && !this._isInMemory) {
      this.db.close();
    //     }
// }


// Export for use in other modules
export default HiveMindSessionManager;
