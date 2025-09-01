import { z } from 'zod';
import { getLogger } from '@claude-zen/foundation';
import {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowStep
} from '../../workflow-base-types';

const logger = getLogger('workflow-schemas');

// Zod schemas for workflow validation
export const WorkflowStepSchema = z.object({
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

export const WorkflowDefinitionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  steps: z.array(WorkflowStepSchema),
});

export const WorkflowContextSchema = z.record(z.string(), z.unknown());

export const WorkflowExecutionResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  duration: z.number().optional(),
});

export const WorkflowStepResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  duration: z.number().optional(),
});

// Type exports inferred from schemas
export type WorkflowStepSchemaType = z.infer<typeof WorkflowStepSchema>;
export type WorkflowDefinitionSchemaType = z.infer<typeof WorkflowDefinitionSchema>;
export type WorkflowContextSchemaType = z.infer<typeof WorkflowContextSchema>;
export type WorkflowExecutionResultSchemaType = z.infer<typeof WorkflowExecutionResultSchema>;

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
    // TODO: Implement functionality
  }

  // Validation methods
  validateWorkflowDefinition(data: unknown): WorkflowDefinition {
    return WorkflowDefinitionSchema.parse(data);
  }

  validateWorkflowContext(data: unknown): WorkflowContext {
    return WorkflowContextSchema.parse(data);
  }

  validateWorkflowStep(data: unknown): WorkflowStep {
    return WorkflowStepSchema.parse(data);
  }
}
