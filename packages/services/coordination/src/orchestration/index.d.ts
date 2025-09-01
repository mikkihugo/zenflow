/**
* @fileoverview Orchestration Domain - Task Flow Management and Enterprise Coordination
*
* Clean orchestration implementation consolidating task management and enterprise coordination
*/
export type TaskState = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export interface WorkflowTask {
  id: string;
}
export interface TaskOrchestrator {
  execute(): Promise<void>;
}

export interface EnterpriseCoordinator {
  coordinate(): Promise<void>;
}

export interface OrchestrationSystem {
  taskOrchestrator: TaskOrchestrator;
  enterpriseCoordinator: EnterpriseCoordinator;
}
export declare function createOrchestrationSystem(): OrchestrationSystem;
export { EnterpriseCoordinator as EnterpriseCoordination };
//# sourceMappingURL=index.d.ts.map