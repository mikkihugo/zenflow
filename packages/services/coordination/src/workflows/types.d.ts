/**
 * @file Comprehensive Workflow Types - Single Source of Truth
 * Unified types for all workflow operations across the system
 */
export type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from './workflow-base-types';
import type { WorkflowDefinition } from './workflow-base-types';
export interface WorkflowTemplate {
  id: string;
};
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
export interface WorkflowEvent {
  type:
    | 'workflow.started'
    | ' workflow.completed'
    | ' workflow.failed'
    | ' step.started'
    | ' step.completed'
    | ' step.failed';
  workflowId: string;
  stepIndex?: number;
  data?: Record<string, unknown>;
  timestamp: string;
}
//# sourceMappingURL=types.d.ts.map
