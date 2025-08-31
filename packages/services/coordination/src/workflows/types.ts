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
export interface WorkflowTemplate {}
export interface WorkflowExecution {};
}
export interface WorkflowRegistry {}
// Event types for workflow orchestration
export interface WorkflowEvent {};