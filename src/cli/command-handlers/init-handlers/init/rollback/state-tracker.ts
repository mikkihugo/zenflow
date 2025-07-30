// state-tracker.js - Track initialization state and rollback points

export class StateTracker {
  constructor(workingDir = workingDir;
  this;
  .
  stateFile = `${workingDir}/.claude-zen-state.json`;
}

/**
 * Record a rollback point
 */
async;
recordRollbackPoint(type, data);
: any
{
  const _result = {success = await this.loadState();

  const rollbackPoint = {id = state.rollbackPoints || [];
  state.rollbackPoints.push(rollbackPoint);

  // Keep only the last 10 rollback points
  if (state.rollbackPoints.length > 10) {
    state.rollbackPoints = state.rollbackPoints.slice(-10);
  }

  await this.saveState(state);
}
catch(error)
{
      result.success = false;
      result.errors.push(`Failed to record rollback point = {success = await this.loadState();

      const checkpoint = {id = checkpoint.id;

      state.checkpoints = state.checkpoints || [];
      state.checkpoints.push(checkpoint);

      // Keep only the last 20 checkpoints
      if(state.checkpoints.length > 20) {
        state.checkpoints = state.checkpoints.slice(-20);
      }

      await this.saveState(state);
    } catch(error) {
      result.success = false;
      result.errors.push(`Failed to create checkpoint = {success = await this.loadState();

      if(state.checkpoints) {
        const checkpoint = state.checkpoints.find((cp) => cp.id === checkpointId);
        if(checkpoint) {
          Object.assign(checkpoint, updates);
          await this.saveState(state);
        } else {
          result.success = false;
          result.errors.push(`Checkpoint notfound = false;
      result.errors.push(`Failed to updatecheckpoint = null): any {
    const _result = {success = await this.loadState();

      const rollbackRecord = {id = state.rollbackHistory || [];
      state.rollbackHistory.push(rollbackRecord);

      // Keep only the last 50 rollback records
      if(state.rollbackHistory.length > 50) {
        state.rollbackHistory = state.rollbackHistory.slice(-50);
      }

      await this.saveState(state);
    } catch(error) 
      result.success = false;
      result.errors.push(`Failed to recordrollback = await this.loadState();
      return state.rollbackPoints || [];
    } catch {
      return [];
    }
  }

  /**
   * Get checkpoints
   */
  async getCheckpoints() {
    try {
      const state = await this.loadState();
      return state.checkpoints || [];
    } catch {
      return [];
    }
  }

  /**
   * Get rollback history
   */
  async getRollbackHistory() {
    try {
      const state = await this.loadState();
      return state.rollbackHistory || [];
    } catch {
      return [];
    }
  }

  /**
   * Track file operation
   */
  async trackFileOperation(operation, filePath, metadata = {}): any {
    const result = {success = await this.loadState();

      const fileOp = {id = state.fileOperations || [];
      state.fileOperations.push(fileOp);

      // Keep only the last 100 file operations
      if(state.fileOperations.length > 100) {
        state.fileOperations = state.fileOperations.slice(-100);
      }

      await this.saveState(state);
    } catch(error) {
      result.success = false;
      result.errors.push(`Failed to track fileoperation = await this.loadState();
      return state.currentPhase || 'not-started';catch 
      return 'not-started';
  }

  /**
   * Set current initialization phase
   */
  async setCurrentPhase(phase): any {
    const result = {success = await this.loadState();
      state.currentPhase = phase;
      state.phaseTimestamp = Date.now();

      // Track phase transitions
      state.phaseHistory = state.phaseHistory || [];
      state.phaseHistory.push({
        phase,timestamp = false;
      result.errors.push(`Failed to setphase = await this.loadState();

      return {rollbackPoints = 7): any {
    const result = {success = await this.loadState();
      const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

      let cleaned = 0;

      // Clean rollback points
      if(state.rollbackPoints) {
        const before = state.rollbackPoints.length;
        state.rollbackPoints = state.rollbackPoints.filter((rp) => rp.timestamp > cutoffTime);
        cleaned += before - state.rollbackPoints.length;
      }

      // Clean checkpoints
      if(state.checkpoints) {
        const before = state.checkpoints.length;
        state.checkpoints = state.checkpoints.filter((cp) => cp.timestamp > cutoffTime);
        cleaned += before - state.checkpoints.length;
      }

      // Clean file operations
      if(state.fileOperations) {
        const before = state.fileOperations.length;
        state.fileOperations = state.fileOperations.filter((fo) => fo.timestamp > cutoffTime);
        cleaned += before - state.fileOperations.length;
      }

      result.cleaned = cleaned;

      if(cleaned > 0) {
        await this.saveState(state);
      }
    } catch(error) {
      result.success = false;
      result.errors.push(`State cleanup failed = {success = await this.loadState();

      // Test write access
      state.lastValidation = Date.now();
      await this.saveState(state);

      // Validate state structure
      const validationResult = this.validateStateStructure(state);
      if(!validationResult.valid) {
        result.warnings.push(...validationResult.issues);
      }
    } catch(error) 
      result.success = false;
      result.errors.push(`State tracking validationfailed = await this.loadState();
      return {
        success = {success = false;
        result.errors.push('Invalid state data structure');
      }
    } catch(error) {
      result.success = false;
      result.errors.push(`State importfailed = await node.readTextFile(this.stateFile);
      return JSON.parse(content);catch 
      // Return default state if file doesn't exist or is invalid
      return {version = Date.now();
    state.version = '1.0';
    
    await node.writeTextFile(
      this.stateFile,
      JSON.stringify(state, null, 2)
    );

    await node.writeTextFile(this.stateFile, JSON.stringify(state, null, 2));

  generateId() 
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  validateStateStructure(state): any {
    const result = {valid = = 'object') {
      result.valid = false;
      result.issues.push('State must be an object');
      return result;
    }

    // Check required fields
    const requiredFields = ['version', 'created', 'lastActivity'];
    for(const field of requiredFields) {
      if (!(field in state)) {
        result.issues.push(`Missing requiredfield = ['rollbackPoints', 'checkpoints', 'rollbackHistory', 'fileOperations'];
    for(const field of arrayFields) {
      if (field in state && !Array.isArray(state[field])) {
        result.issues.push(`Field ${field} must be an array`);
      }
    }

    return result;
  }
}
