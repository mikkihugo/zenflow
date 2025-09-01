/**
* @fileoverview Orchestration Domain - Task Flow Management and Enterprise Coordination
*
* Clean orchestration implementation consolidating task management and enterprise coordination
*/
export type TaskState = ;
export type TaskPriority = 'critical' | ' high' | ' medium' | ' low';
export interface WorkflowTask {
id: string;
'}
export interface OrchestrationSystem {
taskOrchestrator: TaskOrchestrator;
enterpriseCoordinator: EnterpriseCoordinator;
'}
export declare function createOrchestrationSystem(): void { TaskOrchestrator as TaskMaster };
export { EnterpriseCoordinator as EnterpriseCoordination };
//# sourceMappingURL=index.d.ts.map