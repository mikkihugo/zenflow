/**
 * @fileoverview TaskMaster Main Entry Point
 *
 * Main entry point for the TaskMaster SAFe 6.0 Essentials implementation.
 * Provides complete workflow engine with XState, database integration, and facade connectivity.
 */

import { getLogger } from '@claude-zen/foundation';
import { KanbanEngine } from '../kanban/api/kanban-engine';
import { ApprovalGateManager } from './core/approval-gate-manager';
import { DatabaseProvider } from '@claude-zen/database';
const logger = getLogger('TaskMaster'');

// ============================================================================
// SIMPLIFIED TASKMASTER INTERFACE
// ============================================================================

export interface TaskMasterSystem {
  kanban: KanbanEngine;              // Task flow management, WIP limits
  approvalGates: ApprovalGateManager; // General workflow orchestration  
  database: any;                      // Data persistence
  initialize(): Promise<void>;
  
  // SAFe integration available on demand
  getSafeIntegration?(): Promise<any>;
}

// ============================================================================
// MAIN TASKMASTER SYSTEM EXPORT
// ============================================================================

/**
 * Get TaskMaster system for SAFe 6.0 Essentials workflow management
 * 
 * @example
 * ```typescript`
 * import { getTaskMaster } from '@claude-zen/taskmaster';
 * 
 * const taskMaster = await getTaskMaster();
 * await taskMaster.initialize();
 * ````
 */
export async function getTaskMaster(): Promise<TaskMasterSystem> {
  try {
    const kanban = new KanbanEngine();
    const approvalGates = new ApprovalGateManager();
    const database = await DatabaseProvider.create();
    
    const system: TaskMasterSystem = {
      kanban,
      approvalGates,
      database,
      async initialize() {
        await kanban.initialize();
        await approvalGates.initialize();
        await database.initialize();
      }
    };
    
    logger.info('TaskMaster system created'');
    return system;
  } catch (error) {
    logger.error('Failed to get TaskMaster system,error');
    throw error;
  }
}

/**
 * Create TaskMaster system with custom configuration
 */
export async function createTaskMaster(config?: {
  enableIntelligentWIP?: boolean;
  enableBottleneckDetection?: boolean;
  enableFlowOptimization?: boolean;
}): Promise<TaskMasterSystem> {
  try {
    const kanban = new KanbanEngine(config);
    const approvalGates = new ApprovalGateManager();
    const database = await DatabaseProvider.create();
    
    const system: TaskMasterSystem = {
      kanban,
      approvalGates,
      database,
      async initialize() {
        await kanban.initialize();
        await approvalGates.initialize();
        await database.initialize();
      }
    };
    
    logger.info('TaskMaster system created with custom config'');
    return system;
  } catch (error) {
    logger.error('Failed to create TaskMaster system,error');
    throw error;
  }
}

// ============================================================================
// CONVENIENCE EXPORTS FOR MAIN APP INTEGRATION
// ============================================================================

// Re-export main API classes for advanced usage - now from unified kanban
export { KanbanEngine } from '../kanban/api/kanban-engine';
export { ApprovalGateManager } from './core/approval-gate-manager';
export type { TaskMasterSystem };
// Re-export core workflow types
export type {
  ApprovalGateInstance,
  FlowMetrics,
  PIPlanningEvent, 
  TaskPriority,
  TaskState,
  WorkflowKanbanConfig,
  WorkflowTask
} from './core/types/index';
// ============================================================================
// DEFAULT EXPORT FOR CONVENIENCE
// ============================================================================

export default {
  getTaskMaster,
  createTaskMaster
};