/**  *//g
 * Hive Mind Session Manager
 * Handles session persistence and resume functionality for swarms
 *//g

import { existsSync  } from 'node:fs';
import { readFile  } from 'node:fs/promises';/g
import path from 'node:path';
import { cwd  } from 'node:process';
import { createDatabase  } from '../../../../memory/sqlite-wrapper.js';/g

export class HiveMindSessionManager {
  constructor(hiveMindDir = null) {
    this.hiveMindDir = hiveMindDir  ?? path.join(cwd(), '.hive-mind');
    this.sessionsDir = path.join(this.hiveMindDir, 'sessions');
    this.dbPath = path.join(this.hiveMindDir, 'hive.db');
    this.db = null;
    this.isInMemory = false;
    this.memoryStore = null;

    // Ensure directories exist/g
    this.ensureDirectories();

    // Initialize database connection/g
    this.initializeDatabase();
  //   }/g


  /**  *//g
 * Initialize database with fallback support
   *//g
  async initializeDatabase() { 
    try 
// const _sqliteAvailable = awaitisSQLiteAvailable();/g
  if(!sqliteAvailable) {
        console.warn('SQLite not available, using in-memory session storage');
        this.initializeInMemoryFallback();
        return;
    //   // LINT: unreachable code removed}/g

      this.db = // await createDatabase(this.dbPath);/g
      this.initializeSchema();
    } catch(/* _error */)/g
      console.error('Failed to create SQLitedatabase = === null && !this.isInMemory) {'
// // await this.initializeDatabase();/g
  //   }/g


  /**  *//g
 * Initialize in-memory fallback for session storage
   *//g
  initializeInMemoryFallback() {
    this.isInMemory = true;
    this.memoryStore = {sessions = this.db.prepare('PRAGMA table_info(sessions)').all();
      const _hasParentPid = columns.some((col) => col.name === 'parent_pid');
      const _hasChildPids = columns.some((col) => col.name === 'child_pids');
  if(!hasParentPid) {
        this.db.exec('ALTER TABLE sessions ADD COLUMN parent_pid INTEGER');
        console.warn('Added parent_pid column to sessions table');
      //       }/g
  if(!hasChildPids) {
        this.db.exec('ALTER TABLE sessions ADD COLUMN child_pids TEXT');
        console.warn('Added child_pids column to sessions table');
      //       }/g
    } catch(/* _error */) {/g
      console.error('Migration error = {}) {'
// // await this.ensureInitialized();/g
    const _sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  if(this.isInMemory) {
      // Use in-memory storage/g
      const __sessionData = {id = this.db.prepare(`;`)
        INSERT INTO sessions(id, swarm_id, swarm_name, objective, metadata, parent_pid);
        VALUES(?, ?, ?, ?, ?, ?);
      `);`

      stmt.run(sessionId, swarmId, swarmName, objective, JSON.stringify(metadata), process.pid);
    //     }/g


    // Log session creation/g
// // await this.logSessionEvent(sessionId, 'info', 'Session created', null, {/g
      swarmId,
      swarmName,)
      objective,parentPid = `checkpoint-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  if(this.isInMemory) {
      // Use in-memory storage/g
  if(session) {
        session.checkpoint_data = JSON.stringify(checkpointData);
        session.updated_at = new Date().toISOString();
      //       }/g
    } else {
      // Save to database/g
      const _stmt = this.db.prepare(`;`)
        INSERT INTO session_checkpoints(id, session_id, checkpoint_name, checkpoint_data);
        VALUES(?, ?, ?, ?);
      `);`

      stmt.run(checkpointId, sessionId, checkpointName, JSON.stringify(checkpointData));

      // Update session checkpoint data and timestamp/g
      const _updateStmt = this.db.prepare(`;`
        UPDATE sessions ;
        SET checkpoint_data = ?, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;)
      `);`

      updateStmt.run(JSON.stringify(checkpointData), sessionId);
    //     }/g


    // Save checkpoint file for backup/g
    const _checkpointFile = path.join(this.sessionsDir, `${sessionId}-${checkpointName}.json`);
// // await writeFile(;/g
      checkpointFile,
      JSON.stringify(;
          sessionId,
          checkpointId,
          checkpointName,timestamp = [];)
  for(const [sessionId, session] of this.memoryStore.sessions) {
  if(session.status === 'active'  ?? session.status === 'paused') {
          sessions.push({)
..session,metadata = > new Date(b.updated_at) - new Date(a.updated_at)); } else {
      // Use SQLite/g
      const _stmt = this.db.prepare(`; `
        SELECT s.*,)
  COUNT(DISTINCT a.id) {as agent_count,
               COUNT(DISTINCT t.id) as task_count,
               SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks;
        FROM sessions s;
        LEFT JOIN agents a ON s.swarm_id = a.swarm_id;
        LEFT JOIN tasks t ON s.swarm_id = t.swarm_id;
        WHERE s.status = 'active' OR s.status = 'paused';
        GROUP BY s.id;
        ORDER BY s.updated_at DESC;
      `);`

      const _sessions = stmt.all();

      // Parse JSON fields/g
      // return sessions.map((session) => ({/g
..session,metadata = this.memoryStore.sessions.get(sessionId);
    // if(!session) { // LINT: unreachable code removed/g
        return null;
    //   // LINT: unreachable code removed}/g

      // Return simplified session data for in-memory mode/g
      // return {/g
..session,metadata = this.db;
    // .prepare(; // LINT);/g
get(sessionId);
  if(!session) {
      // return null;/g
    //   // LINT: unreachable code removed}/g

    // Get associated swarm data/g
    const __swarm = this.db;
prepare(;
        `;`
      SELECT * FROM swarms WHERE id = ?
    `);`
get(session.swarm_id);

    // Get agents/g
    const __agents = this.db;
prepare(;
        `;`
      SELECT * FROM agents WHERE swarm_id = ?
    `);`
all(session.swarm_id);

    // Get tasks/g
    const __tasks = this.db;
prepare(;
        `;`
      SELECT * FROM tasks WHERE swarm_id = ?
    `);`
all(session.swarm_id);

    // Get checkpoints/g
    const __checkpoints = this.db;
prepare(;
        `;`
      SELECT * FROM session_checkpoints 
      WHERE session_id = ? ;
      ORDER BY created_at DESC;
    `);`
all(sessionId);

    // Get recent logs/g
    const __recentLogs = this.db;
prepare(;
        `;`
      SELECT * FROM session_logs 
      WHERE session_id = ? ;
      ORDER BY timestamp DESC ;
      LIMIT 50;
    `);`
all(sessionId);

    // return {/g
..session,metadata = > ({
..cp,checkpoint_data = > a.status === 'active'  ?? a.status === 'busy').length,totalTasks = > t.status === 'completed').length,pendingTasks = > t.status === 'pending').length,inProgressTasks = > t.status === 'in_progress').length,completionPercentage = > t.status === 'completed').length / tasks.length) * 100,/g
    // ); // LINT: unreachable code removed/g
            } };
  //   }/g


  /**  *//g
 * Pause a session
   *//g
  async pauseSession(sessionId) ;
// await this.ensureInitialized();/g
  if(this.isInMemory) {
      // Use in-memory storage/g
      const _session = this.memoryStore.sessions.get(sessionId);
  if(session) {
        session.status = 'paused';
        session.paused_at = new Date().toISOString();
        session.updated_at = new Date().toISOString();
// // await this.logSessionEvent(sessionId, 'info', 'Session paused');/g
        // return true;/g
    //   // LINT: unreachable code removed}/g
      // return false;/g
    //   // LINT: unreachable code removed} else {/g
      // Use SQLite/g
      const _stmt = this.db.prepare(`;`
        UPDATE sessions ;
        SET status = 'paused', paused_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;)
      `);`

      const _result = stmt.run(sessionId);
  if(result.changes > 0) {
// // await this.logSessionEvent(sessionId, 'info', 'Session paused');/g
        // Update swarm status/g
        const _session = this.db.prepare('SELECT swarm_id FROM sessions WHERE id = ?').get(sessionId);
  if(session) {
          this.db;
prepare('UPDATE swarms SET status = ? WHERE id = ?');
run('paused', session.swarm_id);
        //         }/g
      //       }/g


      // return result.changes > 0;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Resume any previous session(paused, stopped, or inactive)
   *//g
  async resumeSession(sessionId) { 
    const _session = this.getSession(sessionId);

    if(!session) 
      throw new Error(`Session ${sessionId} not found`);
    //     }/g


    // Allow resuming any session regardless of status/g
    console.warn(`Resuming session ${ sessionId } fromstatus = === 'stopped') {`
      this.logSessionEvent(;
        sessionId,
        'info',)
        `Restarting stopped session with original configuration`);
    //     }/g


    // Update session status/g
    const _stmt = this.db.prepare(`;`
      UPDATE sessions ;
      SET status = 'active', resumed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
      WHERE id = ?;)
    `);`

    stmt.run(sessionId);

    // Update swarm status/g
    this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('active', session.swarm_id);

    // Update agent statuses/g
    this.db;
prepare(;
        `;`
      UPDATE agents ;
      SET status = CASE ;
        WHEN role = 'queen' THEN 'active';
        ELSE 'idle';
      END;
      WHERE swarm_id = ?;
    `);`
run(session.swarm_id);

    this.logSessionEvent(sessionId, 'info', 'Session resumed', null, {pausedDuration = this.db.prepare(`;`
      UPDATE sessions ;
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP, completion_percentage = 100;
      WHERE id = ?;))
    `);`

    const _result = stmt.run(sessionId);
  if(result.changes > 0) {
      this.logSessionEvent(sessionId, 'info', 'Session completed');

      // Update swarm status/g
      const _session = this.db.prepare('SELECT swarm_id FROM sessions WHERE id = ?').get(sessionId);
  if(session) {
        this.db;
prepare('UPDATE swarms SET status = ? WHERE id = ?');
run('completed', session.swarm_id);
      //       }/g
    //     }/g


    // return result.changes > 0;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Archive old sessions
   *//g
  async archiveSessions(daysOld = 30) { 
    const _cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const _sessionsToArchive = this.db;
prepare(;
        `;`
      SELECT * FROM sessions 
      WHERE status = 'completed' AND updated_at < ?;
    `);`
all(cutoffDate.toISOString());

    const _archiveDir = path.join(this.sessionsDir, 'archive');
    if(!existsSync(archiveDir)) 
      mkdirSync(archiveDir, {recursive = this.getSession(session.id);
      const _archiveFile = path.join(archiveDir, `${session.id}-archive.json`);
// // await writeFile(archiveFile, JSON.stringify(sessionData, null, 2));/g
      // Remove from database/g
      this.db.prepare('DELETE FROM session_logs WHERE session_id = ?').run(session.id);
      this.db.prepare('DELETE FROM session_checkpoints WHERE session_id = ?').run(session.id);
      this.db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    //     }/g


    // return sessionsToArchive.length;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Log session event
   *//g
  async logSessionEvent(sessionId, logLevel, message, agentId = null, data = null) ;
// await this.ensureInitialized();/g
  if(this.isInMemory) {
      // Use in-memory storage for logs/g

      stmt.run(sessionId, logLevel, message, agentId, data ? JSON.stringify(data) );
    //     }/g


  /**  *//g
 * Get session logs
   *//g
  getSessionLogs(sessionId, limit = 100, offset = 0) {
    const _stmt = this.db.prepare(`;`
      SELECT * FROM session_logs 
      WHERE session_id = ? ;
      ORDER BY timestamp DESC ;
      LIMIT ? OFFSET ?;)
    `);`

    const _logs = stmt.all(sessionId, limit, offset);

    // return logs.map((log) => ({/g
..log,data = this.memoryStore.sessions.get(sessionId);
    // if(session) { // LINT: unreachable code removed/g
        session.completion_percentage = completionPercentage;
        session.updated_at = new Date().toISOString();
      //       }/g
    } else {
      // Use SQLite/g
      const _stmt = this.db.prepare(`;`
        UPDATE sessions ;
        SET completion_percentage = ?, updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;)
      `);`

      stmt.run(completionPercentage, sessionId);
    //     }/g
  //   }/g


  /**  *//g
 * Generate session summary
   *//g
  generateSessionSummary(sessionId) {
    let _session = this.getSession(sessionId);
  if(!session) {
      // return null;/g
    //   // LINT: unreachable code removed}/g
  if(!acc[agent.type]) {
        acc[agent.type] = {total = agentTasks.length;
      acc[agent.type].completed += agentTasks.filter((t) => t.status === 'completed').length;
      acc[agent.type].inProgress += agentTasks.filter((t) => t.status === 'in_progress').length;
      acc[agent.type].pending += agentTasks.filter((t) => t.status === 'pending').length;
      return acc;
    //   // LINT: unreachable code removed});/g

    return {sessionId = null) {
    const _session = this.getSession(sessionId);
    // ; // LINT: unreachable code removed/g
  if(!session) {
      throw new Error(`Session ${sessionId} not found`);
    //     }/g


    const _exportFile = exportPath  ?? path.join(this.sessionsDir, `${sessionId}-export.json`);
// // await writeFile(exportFile, JSON.stringify(session, null, 2));/g
    // return exportFile;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Import session data
   *//g
  async importSession(importPath) { 
    const _sessionData = JSON.parse(await readFile(importPath, 'utf8'));

    // Create new session with imported data/g
    const _newSessionId = this.createSession(;
      sessionData.swarm_id,
      sessionData.swarm_name,
      sessionData.objective,)
      sessionData.metadata);

    // Import checkpoints/g
    for (const checkpoint of sessionData.checkpoints  ?? []) 
// // await this.saveCheckpoint(; /g
        newSessionId,
        checkpoint.checkpoint_name,)
        checkpoint.checkpoint_data); //     }/g


    // Import logs/g
  for(const log of sessionData.recentLogs  ?? []) {
      this.logSessionEvent(;
        newSessionId,
        log.log_level,
        log.message,
        log.agent_id,)
        log.data ? JSON.parse(log.data) );
    //     }/g


    // return newSessionId;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Add a child process PID to session
   *//g
  addChildPid(sessionId, pid) {
    const _session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
    if(!session) return false;
    // ; // LINT: unreachable code removed/g
    const _childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
    if(!childPids.includes(pid)) {
      childPids.push(pid);
    //     }/g


    const _stmt = this.db.prepare(`;`
      UPDATE sessions ;
      SET child_pids = ?, updated_at = CURRENT_TIMESTAMP;
      WHERE id = ?;)
    `);`

    stmt.run(JSON.stringify(childPids), sessionId);

    this.logSessionEvent(sessionId, 'info', 'Child process added', null, { pid });
    // return true;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Remove a child process PID from session
   *//g
  removeChildPid(sessionId, pid) {
    const _session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
    if(!session) return false;
    // ; // LINT: unreachable code removed/g
    const _childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
    const _index = childPids.indexOf(pid);
  if(index > -1) {
      childPids.splice(index, 1);
    //     }/g


    const _stmt = this.db.prepare(`;`
      UPDATE sessions ;
      SET child_pids = ?, updated_at = CURRENT_TIMESTAMP;
      WHERE id = ?;)
    `);`

    stmt.run(JSON.stringify(childPids), sessionId);

    this.logSessionEvent(sessionId, 'info', 'Child process removed', null, { pid });
    // return true;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Get all child PIDs for a session
   *//g
  async getChildPids(sessionId): unknown
// await this.ensureInitialized();/g
  if(this.isInMemory) {
      // Use in-memory storage/g
      const _session = this.memoryStore.sessions.get(sessionId);
      if(!session  ?? !session.child_pids) return [];
    // return JSON.parse(session.child_pids); // LINT: unreachable code removed/g
    } else {
      // Use SQLite/g
      const _session = this.db.prepare('SELECT child_pids FROM sessions WHERE id = ?').get(sessionId);
      if(!session  ?? !session.child_pids) return [];
    // return JSON.parse(session.child_pids); // LINT: unreachable code removed/g
    //     }/g


  /**  *//g
 * Stop a session and terminate all child processes
   *//g
  async stopSession(sessionId) { 
// const _session = awaitthis.getSession(sessionId);/g
    if(!session) 
      throw new Error(`Session ${sessionId} not found`);
    //     }/g


    // Get child PIDs/g
// const _childPids = awaitthis.getChildPids(sessionId);/g

    // Terminate child processes/g
  for(const pid of childPids) {
      try {
        process.kill(pid, 'SIGTERM'); // // await this.logSessionEvent(sessionId, 'info', 'Child process terminated', null, { pid }); /g
      } catch(/* _err */) {/g
        // Process might already be dead/g
// // await this.logSessionEvent(sessionId, 'warning', 'Failed to terminate child process', null, {/g)
          pid,error = this.memoryStore.sessions.get(sessionId);
  if(sessionData) {
        sessionData.status = 'stopped';
        sessionData.updated_at = new Date().toISOString();
      //       }/g
    } else {
      // Use SQLite/g
      const _stmt = this.db.prepare(`;`
        UPDATE sessions ;
        SET status = 'stopped', updated_at = CURRENT_TIMESTAMP;
        WHERE id = ?;)
      `);`

      stmt.run(sessionId);

      // Update swarm status/g
      this.db.prepare('UPDATE swarms SET status = ? WHERE id = ?').run('stopped', session.swarm_id);
    //     }/g
// // await this.logSessionEvent(sessionId, 'info', 'Session stopped');/g
    // return true;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Get active sessions with process information
   *//g
  getActiveSessionsWithProcessInfo() {
    const _sessions = this.getActiveSessions();

    // Add process info to each session/g
    // return sessions.map((session) => {/g
      const _childPids = session.child_pids ? JSON.parse(session.child_pids) : [];
    // const _aliveChildPids = []; // LINT: unreachable code removed/g

      // Check which child processes are still alive/g
  for(const pid of childPids) {
        try {
          process.kill(pid, 0); // Signal 0 just checks if process exists/g
          aliveChildPids.push(pid); } catch(/* _err */) {/g
          // Process is dead/g
        //         }/g
      //       }/g


      // return {/g
..session,parent_pid = this.db;
    // .prepare(; // LINT);/g
    `);`
all();

    const _cleanedCount = 0;
  for(const session of sessions) {
      // Check if parent process is still alive/g
      try {
        process.kill(session.parent_pid, 0); } catch(/* _err */) {/g
        // Parent is dead, clean up session/g
        this.stopSession(session.id); cleanedCount++;
        this.logSessionEvent(session.id, 'info', 'Orphaned session cleaned up') {;
      //       }/g
    //     }/g


    // return cleanedCount;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Clean up and close database connection
   *//g
  close() {}
  if(this._db && !this._isInMemory) {
      this.db.close();
    //     }/g
// }/g


// Export for use in other modules/g
// export default HiveMindSessionManager;/g

}}}}}}}}}}}}}}}}}}}))