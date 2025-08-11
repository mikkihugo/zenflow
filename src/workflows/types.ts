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
} from './workflow-base-types.ts';

// Additional workflow types for advanced functionality
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: WorkflowDefinition;
  metadata: {
    version: string;
    author?: string;
    tags?: string[];
    complexity?: 'simple' | 'medium' | 'complex';
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status:
    | 'queued'
    | 'running'
    | 'paused'
    | 'completed'
    | 'failed'
    | 'cancelled';
  startTime: string;
  endTime?: string;
  currentStep: number;
  totalSteps: number;
  results: Record<string, any>;
  metrics: {
    duration?: number;
    stepsCompleted: number;
    stepsFailed: number;
    resourcesUsed: Record<string, any>;
  };
}

export interface WorkflowRegistry {
  templates: Map<string, WorkflowTemplate>;
  definitions: Map<string, WorkflowDefinition>;
  executions: Map<string, WorkflowExecution>;
}

// Event types for workflow orchestration
export interface WorkflowEvent {
  type:
    | 'workflow.started'
    | 'workflow.completed'
    | 'workflow.failed'
    | 'step.started'
    | 'step.completed'
    | 'step.failed';
  workflowId: string;
  stepIndex?: number;
  data?: Record<string, any>;
  timestamp: string;
}
