/**
* @fileoverview Workflow-Kanban Integration
*
* Integration layer between Workflows (process orchestration) and Kanban (state management).
* Enables workflows to leverage kanban state management patterns for step-based processes.
*
* **Integration Patterns: getLogger('WorkflowKanbanIntegration');
// =============================================================================
// WORKFLOW-KANBAN INTEGRATION TYPES
// =============================================================================
/**
* Integration configuration for workflow-kanban coordination
*/
export interface WorkflowKanbanIntegrationConfig {
/** Enable kanban state management for workflow steps */
enableKanbanSteps?: boolean;
/** Enable workflow triggers from kanban state transitions */
enableKanbanTriggers?: boolean;
/** Enable bidirectional event coordination */
enableBidirectionalEvents?: boolean;
/** Custom kanban configuration for workflow integration */
kanbanConfig?: Partial<WorkflowKanbanConfig>;
')};;: any;
}
/**
* Workflow step with kanban state integration
*/
export interface KanbanWorkflowStep extends WorkflowStep {
/** Kanban state for this step */
kanbanState?: TaskState;
/** Enable kanban tracking for this step */
useKanban?: boolean;
/** WIP limits for this step type */
wipLimit?: number;
}
/**
* Workflow definition with kanban integration
*/
export interface KanbanWorkflowDefinition extends WorkflowDefinition {
/** Steps with kanban integration */
steps: KanbanWorkflowStep[];
/** Enable kanban integration for this workflow */
useKanban?: boolean;
/** Custom kanban configuration */
kanbanConfig?: Partial<WorkflowKanbanConfig>;
}
/**
* Integration layer between workflow engine and kanban system
*/
export declare class WorkflowKanbanIntegration {
private readonly config;
private initialized;
constructor(config: {});
catch(error: any): void;
}
//# sourceMappingURL=kanban-integration.d.ts.map