/**
 * @fileoverview TaskMaster Main Entry Point
 *
 * Main entry point for the TaskMaster SAFe 6.0 Essentials implementation.
 * Provides complete workflow engine with XState, database integration, and facade connectivity.
 */
import type { TaskMasterSystem } from './facades/taskmaster-facade';
import { getTaskMasterSystem } from './facades/taskmaster-facade';
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
export declare function getTaskMaster(): Promise<TaskMasterSystem>;
/**
 * Create TaskMaster system with custom configuration
 */
export declare function createTaskMaster(config?: {
    enableIntelligentWIP?: boolean;
    enableBottleneckDetection?: boolean;
    enableFlowOptimization?: boolean;
}): Promise<TaskMasterSystem>;
export { createWorkflowKanban, WorkflowKanban } from './api/workflow-kanban';
export { ApprovalGateManager } from './core/approval-gate-manager';
export type { TaskMasterSystem } from './facades/taskmaster-facade';
export { createTaskMasterSystem, getTaskMasterSystem } from './facades/taskmaster-facade';
export type { ApprovalGateInstance, FlowMetrics, PIPlanningEvent, TaskPriority, TaskState, WorkflowKanbanConfig, WorkflowTask } from './types/index';
declare const _default: {
    getTaskMaster: typeof getTaskMaster;
    createTaskMaster: typeof createTaskMaster;
    getTaskMasterSystem: typeof getTaskMasterSystem;
    createTaskMasterSystem: any;
};
export default _default;
//# sourceMappingURL=main.d.ts.map