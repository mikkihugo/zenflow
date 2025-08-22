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
export declare const WorkflowStepSchema: z.ZodObject<
  {
    type: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    retries: z.ZodDefault<z.ZodNumber>;
    timeout: z.ZodOptional<z.ZodNumber>;
    output: z.ZodOptional<z.ZodString>;
    onError: z.ZodDefault<z.ZodEnum<['stop', 'continue', 'skip']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: string;
    retries: number;
    onError: 'stop|continue|skip';
    params?: Record<string, unknown>|undefined;
    name?: string|undefined;
    timeout?: number|undefined;
    output?: string|undefined;
  },
  {
    type: string;
    params?: Record<string, unknown>|undefined;
    name?: string | undefined;
    retries?: number | undefined;
    timeout?: number | undefined;
    output?: string | undefined;
    onError?:'stop|continue|skip'|undefined;
  }
>;
/**
 * Workflow definition validation schema
 */
export declare const WorkflowDefinitionSchema: z.ZodObject<
  {
    name: z.ZodString;
    steps: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString;
          name: z.ZodOptional<z.ZodString>;
          params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
          retries: z.ZodDefault<z.ZodNumber>;
          timeout: z.ZodOptional<z.ZodNumber>;
          output: z.ZodOptional<z.ZodString>;
          onError: z.ZodDefault<z.ZodEnum<['stop', 'continue', 'skip']>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          type: string;
          retries: number;
          onError: 'stop|continue|skip';
          params?: Record<string, unknown>|undefined;
          name?: string|undefined;
          timeout?: number|undefined;
          output?: string|undefined;
        },
        {
          type: string;
          params?: Record<string, unknown>|undefined;
          name?: string | undefined;
          retries?: number | undefined;
          timeout?: number | undefined;
          output?: string | undefined;
          onError?:'stop|continue|skip'|undefined;
        }
      >,'many'
    >;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    timeout: z.ZodOptional<z.ZodNumber>;
    maxConcurrency: z.ZodDefault<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    steps: {
      type: string;
      retries: number;
      onError: 'stop|continue|skip';
      params?: Record<string, unknown>|undefined;
      name?: string|undefined;
      timeout?: number|undefined;
      output?: string|undefined;
    }[];
    maxConcurrency: number;
    description?: string|undefined;
    timeout?: number|undefined;
    version?: string|undefined;
    tags?: string[]|undefined;
  },
  {
    name: string;
    steps: {
      type: string;
      params?: Record<string, unknown>|undefined;
      name?: string | undefined;
      retries?: number | undefined;
      timeout?: number | undefined;
      output?: string | undefined;
      onError?:'stop|continue|skip'|undefined;
    }[];
    description?: string|undefined;
    timeout?: number|undefined;
    version?: string|undefined;
    tags?: string[]|undefined;
    maxConcurrency?: number | undefined;
  }
>;
/**
 * Workflow context validation schema
 */
export declare const WorkflowContextSchema: z.ZodRecord<
  z.ZodString,
  z.ZodUnknown
>;
/**
 * Workflow execution result schema
 */
export declare const WorkflowExecutionResultSchema: z.ZodObject<
  {
    workflowId: z.ZodString;
    success: z.ZodBoolean;
    startTime: z.ZodString;
    endTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    stepResults: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            stepName: z.ZodString;
            success: z.ZodBoolean;
            output: z.ZodOptional<z.ZodUnknown>;
            error: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
          },'strip',
          z.ZodTypeAny,
          {
            success: boolean;
            stepName: string;
            error?: string | undefined;
            duration?: number | undefined;
            output?: unknown;
          },
          {
            success: boolean;
            stepName: string;
            error?: string | undefined;
            duration?: number | undefined;
            output?: unknown;
          }
        >,'many'
      >
    >;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    success: boolean;
    startTime: string;
    workflowId: string;
    metadata?: Record<string, unknown> | undefined;
    context?: Record<string, unknown> | undefined;
    duration?: number | undefined;
    endTime?: string | undefined;
    stepResults?:
      | {
          success: boolean;
          stepName: string;
          error?: string | undefined;
          duration?: number | undefined;
          output?: unknown;
        }[]
      | undefined;
  },
  {
    success: boolean;
    startTime: string;
    workflowId: string;
    metadata?: Record<string, unknown> | undefined;
    context?: Record<string, unknown> | undefined;
    duration?: number | undefined;
    endTime?: string | undefined;
    stepResults?:
      | {
          success: boolean;
          stepName: string;
          error?: string | undefined;
          duration?: number | undefined;
          output?: unknown;
        }[]
      | undefined;
  }
>;
/**
 * Type exports for external usage
 */
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;
export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;
export type WorkflowExecutionResult = z.infer<
  typeof WorkflowExecutionResultSchema
>;
//# sourceMappingURL=workflow-schemas.d.ts.map
