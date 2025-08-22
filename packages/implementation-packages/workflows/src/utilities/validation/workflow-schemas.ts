/**
 * @fileoverview Workflow Validation Schemas
 *
 * Professional workflow schemas using Zod library.
 * Focused on workflow-specific validation rules.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import { z } from 'zod';

/**
 * Workflow step validation schema
 */
export const WorkflowStepSchema = z.object({
  type: z.string().min(1, 'Step type is required'),
  name: z.string().optional(),
  params: z.record(z.unknown()).optional(),
  retries: z.number().int().min(0).max(10).default(0),
  timeout: z.number().int().min(100).max(300000).optional(),
  output: z.string().optional(),
  onError: z.enum(['stop', 'continue', 'skip']).default('stop'),
});

/**
 * Workflow definition validation schema
 */
export const WorkflowDefinitionSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  steps: z.array(WorkflowStepSchema).min(1, 'At least one step is required'),
  description: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  timeout: z.number().int().min(1000).max(3600000).optional(),
  maxConcurrency: z.number().int().min(1).max(100).default(1),
});

/**
 * Workflow context validation schema
 */
export const WorkflowContextSchema = z.record(z.unknown())();

/**
 * Workflow execution result schema
 */
export const WorkflowExecutionResultSchema = z.object({
  workflowId: z.string(),
  success: z.boolean(),
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  stepResults: z
    .array(
      z.object({
        stepName: z.string(),
        success: z.boolean(),
        output: z.unknown().optional(),
        error: z.string().optional(),
        duration: z.number().optional(),
      })
    )
    .optional(),
  context: WorkflowContextSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Type exports for external usage
 */
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;
export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;
export type WorkflowExecutionResult = z.infer<
  typeof WorkflowExecutionResultSchema
>;
