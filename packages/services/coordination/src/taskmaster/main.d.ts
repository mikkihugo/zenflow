import { KanbanEngine } from '../kanban/api/kanban-engine';
import { ApprovalGateManager } from './core/approval-gate-manager';
export interface TaskMasterSystem {
kanban: KanbanEngine;
approvalGates: ApprovalGateManager;
database: any;
initialize(): Promise<void>;
getSafeIntegration?(): Promise<any>;
')};;: any;
/**
* Get TaskMaster system for SAFe 6.0 Essentials workflow management
*
* @example
* 'typescript') * import { getTaskMaster} from '@claude-zen/taskmaster') * ';
* const taskMaster = await getTaskMaster();
* await taskMaster.initialize();
* ') */ ';: any;
'}
export declare function getTaskMaster(): Promise<TaskMasterSystem>;
/**
* Create TaskMaster system with custom configuration
*/
export declare function createTaskMaster(config?: {
enableIntelligentWIP?: boolean;
enableBottleneckDetection?: boolean;
enableFlowOptimization?: boolean;
'}): Promise<TaskMasterSystem> {': any;
'}): any;
export { KanbanEngine } from '../kanban/api/kanban-engine';
export { ApprovalGateManager } from './core/approval-gate-manager';
export type { TaskMasterSystem };
export type { ApprovalGateInstance, FlowMetrics, PIPlanningEvent, TaskPriority, TaskState, WorkflowKanbanConfig, WorkflowTask } from './core/types/index';
declare const _default: {
getTaskMaster: typeof getTaskMaster;
createTaskMaster: typeof createTaskMaster;
'; ': string;
'};
export default _default;
//# sourceMappingURL=main.d.ts.map