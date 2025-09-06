import { getLogger, z } from '@claude-zen/foundation';
import {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowStep
} from '../../workflow-base-types';

const logger = getLogger('workflow-schemas');

// Zod schemas for workflow validation
export const WORKFLOW_STEP_SCHEMA = z.object({
  id: z.string().optional(),
  type: z.string(),
  name: z.string().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  timeout: z.number().optional(),
  retries: z.number().optional(),
  onError: z.enum(['stop', 'continue', 'skip']).optional(),
  gateConfig: z.object({
    enabled: z.boolean(),
    gateType: z.enum(['approval', 'checkpoint', 'review', 'decision']).optional(),
    businessImpact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    stakeholders: z.array(z.string()).optional(),
    autoApproval: z.boolean().optional(),
  }).optional(),
});

export const WORKFLOW_DEFINITION_SCHEMA = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  steps: z.array(WORKFLOW_STEP_SCHEMA),
});

export const WORKFLOW_CONTEXT_SCHEMA = z.record(z.string(), z.unknown());

export const WORKFLOW_EXECUTION_RESULT_SCHEMA = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  duration: z.number().optional(),
});

export const WORKFLOW_STEP_RESULT_SCHEMA = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  duration: z.number().optional(),
});

// Type exports inferred from schemas
export type WorkflowStepSchemaType = z.infer<typeof WORKFLOW_STEP_SCHEMA>;
export type WorkflowDefinitionSchemaType = z.infer<typeof WORKFLOW_DEFINITION_SCHEMA>;
export type WorkflowContextSchemaType = z.infer<typeof WORKFLOW_CONTEXT_SCHEMA>;
export type WorkflowExecutionResultSchemaType = z.infer<typeof WORKFLOW_EXECUTION_RESULT_SCHEMA>;

// Re-export types from base types for convenience
export type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowStep,
  StepExecutionResult as WorkflowExecutionResult,
} from '../../workflow-base-types';

// Schema validator class
export class WorkflowSchemas {
  constructor() {
    logger.info('WorkflowSchemas initialized');
  }

  async execute(): Promise<void> {
  }

  // Validation methods
  validateWorkflowDefinition(data: unknown): WorkflowDefinition {
  return WORKFLOW_DEFINITION_SCHEMA.parse(data);
  }

  validateWorkflowContext(data: unknown): WorkflowContext {
  return WORKFLOW_CONTEXT_SCHEMA.parse(data);
  }

  validateWorkflowStep(data: unknown): WorkflowStep {
  return WORKFLOW_STEP_SCHEMA.parse(data);
  }
}
