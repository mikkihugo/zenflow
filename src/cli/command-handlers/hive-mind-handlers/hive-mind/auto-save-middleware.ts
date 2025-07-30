/**
 * Auto-save middleware for Hive Mind swarms;
 * Automatically saves session state during operations;
 */
export class AutoSaveMiddleware {
  constructor(sessionId = 30000): unknown {
    this.sessionId = sessionId;
    this.saveInterval = saveInterval;
    this.sessionManager = sessionManager; // Use provided session manager
    this.saveTimer = null;
    this.pendingChanges = [];
    this.isActive = false;
    this.childProcesses = new Set();
  }
  /**
   * Start auto-save monitoring;
   */
  start() {
    if (this.isActive) {
      return;
      //   // LINT: unreachable code removed}
      this.isActive = true;
      // Set up periodic saves
      this.saveTimer = setInterval(() => {
        if (this.pendingChanges.length > 0) {
          this.performAutoSave();
        }
      }, this.saveInterval);
      // Also save on process exit
      process.on('beforeExit', () => {
        this.performAutoSave();
      });
      process.on('SIGINT', async () => {
        console.warn('\n\nReceived SIGINT, cleaning up...');
        await this.cleanup();
        process.exit(0);
      });
      process.on('SIGTERM', async () => {
        console.warn('\n\nReceived SIGTERM, cleaning up...');
        await this.cleanup();
        process.exit(0);
      });
    }
    /**
     * Stop auto-save monitoring;
     */
    stop();
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    this.isActive = false;
    // Final save
    if (this.pendingChanges.length > 0) {
      this.performAutoSave();
    }
    this.sessionManager.close();
    /**
     * Track a change for auto-save;
     */
    trackChange(changeType, _data);
    : unknown 
    this.pendingChanges.push(
      type = === 'task_completed'  ?? changeType === 'agent_spawned'  ?? changeType === 'consensus_reached';
      )
      this.performAutoSave();
      /**
       * Track task progress;
       */
      trackTaskProgress(taskId, status, (result = null));
      : unknown 
    this.trackChange('task_progress',
        taskId,
        status,
        result,
        )
      /**
       * Track agent activity;
       */
      trackAgentActivity(agentId, activity, (data = null));
      : unknown
        this.trackChange('agent_activity', 
      agentId,
        activity,
        data,
      )
    /**
     * Track memory updates;
     */
    trackMemoryUpdate(key, value, (type = 'general'));
    : unknown
      this.trackChange('memory_update', 
      key,
      value,
      type,
    )
  /**
   * Track consensus decisions;
   */
  trackConsensusDecision(topic, decision, votes): unknown 
    this.trackChange('consensus_reached', 
      topic,
    decision,
    votes,
  )
/**
 * Perform auto-save;
 */
async;
performAutoSave();
    if(this.pendingChanges.length === 0) {
      return;
    //   // LINT: unreachable code removed}
;
    try {
      // Group changes by type
      const _changesByType = this.pendingChanges.reduce((acc, change) => {
        if(!acc[change.type]) {
          acc[change.type] = [];
        }
        acc[change.type].push(change);
        return acc;
    //   // LINT: unreachable code removed}, {});
;
      // Calculate progress
      const _taskProgress = changesByType.task_progress  ?? [];
      const _completedTasks = taskProgress.filter((t) => t.data.status === 'completed').length;
      const _totalTasks = taskProgress.length;
      const _completionPercentage =;
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
;
      // Create checkpoint data
      const _checkpointData = {timestamp = `auto-save-${Date.now()}`;
      await this.sessionManager.saveCheckpoint(this.sessionId, checkpointName, checkpointData);
;
      // Update session progress
      if(completionPercentage > 0) {
        await this.sessionManager.updateSessionProgress(this.sessionId, completionPercentage);
      }
;
      // Log all changes as session events
      for(const _change of this.pendingChanges) {
        this.sessionManager.logSessionEvent(;
          this.sessionId,
          'info',
          `Auto-save = [];
    } catch (/* error */) {
      console.error('Auto-save failed => {
        this.childProcesses.delete(childProcess);
        this.sessionManager.removeChildPid(this.sessionId, childProcess.pid);
      });
    }
  }
;
  /**
   * Clean up all resources and child processes;
   */;
  async cleanup() {
    try {
      // Stop the save timer
      if(this.saveTimer) {
        clearInterval(this.saveTimer);
        this.saveTimer = null;
      }
;
      // Perform final save
      await this.performAutoSave();
;
      // Terminate all child processes
      for(const childProcess of this.childProcesses) {
        try {
          if(childProcess.pid) {
            console.warn(`Terminating child process $childProcess.pid...`);
            childProcess.kill('SIGTERM');
;
            // Give it a moment to terminate gracefully
            await new Promise((resolve) => setTimeout(resolve, 100));
;
            // Force kill if still alive
            try {
              process.kill(childProcess.pid, 0); // Check if still alive
              childProcess.kill('SIGKILL');
            } catch (/* e */) {
              // Process already dead, good
            }
          }
        } catch (/* error */) {
          console.error(`Failed to terminate childprocess = await this.sessionManager.getSession(this.sessionId);
      if (session && (session.status === 'active'  ?? session.status === 'paused')) {
        await this.sessionManager.stopSession(this.sessionId);
      }
;
      // Close database connection
      this.sessionManager.close();
;
      console.warn('Cleanup completed successfully');
    } catch (/* error */) {
      console.error('Error during cleanup = {}): unknown {
  const _saveInterval = options.saveInterval  ?? 30000; // Default 30 seconds
  const _middleware = new AutoSaveMiddleware(sessionId, sessionManager, saveInterval);
;
  if(options.autoStart !== false) {
    middleware.start();
  }
;
  return middleware;
}
;
// Export for use in swarm operations
export default AutoSaveMiddleware;
