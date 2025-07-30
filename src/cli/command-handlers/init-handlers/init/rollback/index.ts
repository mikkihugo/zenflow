// rollback/index.js - Comprehensive rollback system for SPARC initialization

import { printSuccess } from '../../../utils.js';
import { BackupManager } from './backup-manager.js';
import { RecoveryManager } from './recovery-manager.js';
import { RollbackExecutor } from './rollback-executor.js';
import { StateTracker } from './state-tracker.js';

/**
 * Main rollback orchestrator
 */
export class RollbackSystem {
  constructor(workingDir = workingDir;
  this;
  .
  backupManager = new BackupManager(workingDir);
  this;
  .
  rollbackExecutor = new RollbackExecutor(workingDir);
  this;
  .
  stateTracker = new StateTracker(workingDir);
  this;
  .
  recoveryManager = new RecoveryManager(workingDir);
}

/**
 * Create backup before initialization
 */
async;
createPreInitBackup();
{
    const result = {success = await this.backupManager.createBackup('pre-init');
      result.backupId = backup.id;
      result.success = backup.success;

      if(backup.success) {
        printSuccess(`Backupcreated = false;
      result.errors.push(`Backup creation failed = {}): any {
    const result = {success = await this.stateTracker.createCheckpoint(phase, data);
      result.checkpointId = checkpoint.id;
      result.success = checkpoint.success;

      if(!checkpoint.success) {
        result.errors.push(...checkpoint.errors);
      }
    } catch(error) 
      result.success = false;
      result.errors.push(`Checkpoint creationfailed = null): any {
    const result = {success = backupId || (await this.findLatestPreInitBackup());
      if(!targetBackup) {
        result.success = false;
        result.errors.push('No suitable backup found for rollback');
        return result;
      }

      // Execute rollback
      const rollbackResult = await this.rollbackExecutor.executeFullRollback(targetBackup);
      result.success = rollbackResult.success;
      result.errors.push(...rollbackResult.errors);
      result.warnings.push(...rollbackResult.warnings);
      result.actions.push(...rollbackResult.actions);

      if(rollbackResult.success) {
        printSuccess('Full rollback completed successfully');

        // Update state tracking
        await this.stateTracker.recordRollback(targetBackup, 'full');
      } else {
        printError('Full rollback failed');
      }
    } catch(error) {
      result.success = false;
      result.errors.push(`Rollbackfailed = null): any {
    const result = {success = checkpointId || (await this.findLatestCheckpoint(phase));
      if(!checkpoint) {
        result.success = false;
        result.errors.push(`No checkpoint found forphase = await this.rollbackExecutor.executePartialRollback(phase, checkpoint);
      result.success = rollbackResult.success;
      result.errors.push(...rollbackResult.errors);
      result.warnings.push(...rollbackResult.warnings);
      result.actions.push(...rollbackResult.actions);

      if(rollbackResult.success) {
        printSuccess(`Partial rollback completed forphase = false;
      result.errors.push(`Partial rollback failed = {}): any {
    const result = {success = await this.recoveryManager.performRecovery(failureType, context);
      result.success = recoveryResult.success;
      result.errors.push(...recoveryResult.errors);
      result.warnings.push(...recoveryResult.warnings);
      result.recoveryActions.push(...recoveryResult.actions);

      if(recoveryResult.success) {
        printSuccess(`Auto-recovery completedfor = false;
      result.errors.push(`Auto-recovery failed = {success = await this.stateTracker.getRollbackPoints();
      result.rollbackPoints = rollbackPoints;

      // Get checkpoints
      const checkpoints = await this.stateTracker.getCheckpoints();
      result.checkpoints = checkpoints;
    } catch(error) {
      result.success = false;
      result.errors.push(`Failed to list rollbackpoints = 5): any {
    const result = {success = await this.backupManager.cleanupOldBackups(keepCount);
      result.success = cleanupResult.success;
      result.cleaned = cleanupResult.cleaned;
      result.errors.push(...cleanupResult.errors);

      if(cleanupResult.success) {
        console.warn(`🗑️  Cleaned up ${cleanupResult.cleaned.length} old backups`);
      }
    } catch(error) {
      result.success = false;
      result.errors.push(`Cleanup failed = {success = await this.backupManager.validateBackupSystem();
      result.checks.backup = backupCheck;
      if(!backupCheck.success) {
        result.success = false;
        result.errors.push(...backupCheck.errors);
      }

      // Check state tracking
      const stateCheck = await this.stateTracker.validateStateTracking();
      result.checks.stateTracking = stateCheck;
      if(!stateCheck.success) {
        result.warnings.push(...stateCheck.errors);
      }

      // Check recovery system
      const recoveryCheck = await this.recoveryManager.validateRecoverySystem();
      result.checks.recovery = recoveryCheck;
      if(!recoveryCheck.success) {
        result.warnings.push(...recoveryCheck.errors);
      }
    } catch(error) {
      result.success = false;
      result.errors.push(`Rollback system validationfailed = await this.stateTracker.getRollbackPoints();
      const preInitPoints = rollbackPoints.filter((point) => point.type === 'pre-init');

      if(preInitPoints.length > 0) {
        return preInitPoints.sort((a, b) => b.timestamp - a.timestamp)[0].backupId;
      }

      return null;
    } catch 
      return null;
  }

  async findLatestCheckpoint(phase): any 
    try {
      const checkpoints = await this.stateTracker.getCheckpoints();
      const phaseCheckpoints = checkpoints.filter((checkpoint) => checkpoint.phase === phase);

      if(phaseCheckpoints.length > 0) {
        return phaseCheckpoints.sort((a, b) => b.timestamp - a.timestamp)[0];
      }

      return null;
    } catch {
      return null;
    }
}

/**
 * Atomic operation wrapper
 */
export class AtomicOperation {
  constructor(rollbackSystem = rollbackSystem;
    this.operationName = operationName;
    this.checkpointId = null;
    this.completed = false;
  }

  /**
   * Begin atomic operation
   */
  async begin() {
    const checkpoint = await this.rollbackSystem.createCheckpoint(`atomic-${this.operationName}`, {operation = checkpoint.checkpointId;
    return checkpoint.success;
  }

  /**
   * Commit atomic operation
   */
  async commit() 
    this.completed = true;

    // Mark checkpoint as committed
    if(this.checkpointId) {
      await this.rollbackSystem.stateTracker.updateCheckpoint(this.checkpointId, {
        status: 'committed',
        completed: Date.now(),
      });
    }

  /**
   * Rollback atomic operation
   */
  async rollback() 
    if(this.checkpointId && !this.completed) {
      await this.rollbackSystem.performPartialRollback(
        `atomic-${this.operationName}`,
        this.checkpointId,
      );
    }

/**
 * Create and manage atomic operations
 */
export function _createAtomicOperation(rollbackSystem: any, operationName: any): any {
  return new AtomicOperation(rollbackSystem, operationName);
}
