/**
 * @fileoverview TaskMaster Main Entry Point
 *
 * Main entry point for the TaskMaster SAFe 6.0 Essentials implementation.
 * Provides complete workflow engine with XState, database integration, and facade connectivity.
 */

import { getLogger } from '@claude-zen/foundation';
import { getTaskMasterSystem } from './facades/taskmaster-facade';
import type { TaskMasterSystem } from './facades/taskmaster-facade';

const logger = getLogger('TaskMaster');'

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
 * 
 * // Create SAFe workflow task
 * const task = await taskMaster.createTask({
 *   title: 'Implement Feature Toggle',
 *   priority: 'high',
 *   estimatedEffort: 13
 * });
 * 
 * // Move through SAFe workflow
 * await taskMaster.moveTask(task.id, 'development');'
 * await taskMaster.moveTask(task.id, 'testing');'
 * 
 * // Create PI Planning event
 * const piEvent = await taskMaster.createPIPlanningEvent({
 *   planningIntervalNumber: 2024.3,
 *   artId: 'platform-train',
 *   startDate: new Date(),
 *   endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
 * });
 * ````
 */
export async function getTaskMaster(): Promise<TaskMasterSystem> {
  try {
    const system = getTaskMasterSystem();
    logger.info('TaskMaster system accessed');'
    return system;
  } catch (error) {
    logger.error('Failed to get TaskMaster system', error);'
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
    const { createTaskMasterSystem } = await import('./facades/taskmaster-facade');'
    const system = createTaskMasterSystem(config);
    logger.info('TaskMaster system created with custom config');'
    return system;
  } catch (error) {
    logger.error('Failed to create TaskMaster system', error);'
    throw error;
  }
}

// ============================================================================
// CONVENIENCE EXPORTS FOR MAIN APP INTEGRATION
// ============================================================================

// Re-export facade for direct access
export { getTaskMasterSystem, createTaskMasterSystem } from './facades/taskmaster-facade';
export type { TaskMasterSystem } from './facades/taskmaster-facade';

// Re-export core workflow types
export type {
  WorkflowTask,
  TaskState,
  TaskPriority,
  FlowMetrics,
  WorkflowKanbanConfig,
  ApprovalGateInstance,
  PIPlanningEvent
} from './types/index';

// Re-export main API classes for advanced usage
export { WorkflowKanban, createWorkflowKanban } from './api/workflow-kanban';
export { ApprovalGateManager } from './core/approval-gate-manager';

// ============================================================================
// DEFAULT EXPORT FOR CONVENIENCE
// ============================================================================

export default {
  getTaskMaster,
  createTaskMaster,
  getTaskMasterSystem,
  createTaskMasterSystem
};