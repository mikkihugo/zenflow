/**
 * @file Comprehensive Workflow Types - Single Source of Truth
 * Unified types for all workflow operations across the system
 */
// Re-export all workflow-related types from the base types (avoids circular dependency)
export type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from './workflow-base-types'; // Import WorkflowDefinition for proper typing
// Additional workflow types for advanced functionality
export interface WorkflowTemplate {
  id: string;
}
export interface WorkflowExecution {
  id: string;
};
}
export interface WorkflowRegistry {
  templates: Map<string, WorkflowTemplate>;
  definitions: Map<string, WorkflowDefinition>;
  executions: Map<string, WorkflowExecution>;
}
// Event types for workflow orchestration
export interface WorkflowEvent {
  type : 'workflow.started' | ' workflow.completed'|' workflow.failed' | ' step.started'|' step.completed' | ' step.failed')  workflowId: string;
  stepIndex?:number;
  data?:Record<string, unknown>;
  timestamp: string;
};