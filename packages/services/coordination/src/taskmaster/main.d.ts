import { KanbanEngine } from '../kanban/api/kanban-engine';
import { ApprovalGateManager } from './core/approval-gate-manager';
export interface TaskMasterSystem {
    kanban: KanbanEngine;
    approvalGates: ApprovalGateManager;
    database: any;
    initialize(): void {
    enableIntelligentWIP?: boolean;
    enableBottleneckDetection?: boolean;
    enableFlowOptimization?: boolean;
    '}): Promise<TaskMasterSystem> {': any;
}): any;
export { KanbanEngine } from '../kanban/api/kanban-engine';
export { ApprovalGateManager } from './core/approval-gate-manager';
export type { TaskMasterSystem };
export type { ApprovalGateInstance, FlowMetrics, PIPlanningEvent, TaskPriority, TaskState, WorkflowKanbanConfig, WorkflowTask } from './core/types/index';
declare const _default:  {
    getTaskMaster: typeof getTaskMaster;
    createTaskMaster: typeof createTaskMaster;
    '; ': string;
};
export default _default;
//# sourceMappingURL=main.d.ts.map