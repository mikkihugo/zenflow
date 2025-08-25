/**
 * @fileoverview Validation Utilities - Zod Integration for Kanban Domain
 *
 * Professional runtime validation using battle-tested Zod library.
 * Provides type-safe validation schemas for kanban workflow coordination.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { type ZodSafeParseResult, z } from 'zod';

// =============================================================================
// DOMAIN VALIDATION SCHEMAS
// =============================================================================

/**
 * Task state validation schema
 */
export const TaskStateSchema = z.enum([
  'backlog',
  'analysis',
  'development',
  'testing',
  'review',
  'deployment',
  'done',
  'blocked',
  'expedite',
]);

/**
 * Task priority validation schema
 */
export const TaskPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);

/**
 * Task creation input schema
 */
export const TaskCreationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: TaskPrioritySchema,
  estimatedEffort: z.number().positive(),
  assignedAgent: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

/**
 * Complete workflow task schema
 */
export const WorkflowTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  state: TaskStateSchema,
  priority: TaskPrioritySchema,
  assignedAgent: z.string().optional(),
  estimatedEffort: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  blockedAt: z.date().optional(),
  blockingReason: z.string().optional(),
  dependencies: z.array(z.string()),
  tags: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()),
});

/**
 * WIP limits validation schema
 */
export const WIPLimitsSchema = z.object({
  backlog: z.number().min(1),
  analysis: z.number().min(1),
  development: z.number().min(1),
  testing: z.number().min(1),
  review: z.number().min(1),
  deployment: z.number().min(1),
  done: z.number().min(1),
  blocked: z.number().min(0),
  expedite: z.number().min(0),
  total: z.number().min(1),
});

/**
 * Kanban configuration schema
 */
export const KanbanConfigSchema = z.object({
  enableIntelligentWIP: z.boolean().default(true),
  enableBottleneckDetection: z.boolean().default(true),
  enableFlowOptimization: z.boolean().default(true),
  enableRealTimeMonitoring: z.boolean().default(false),
  wipCalculationInterval: z.number().min(1000).default(30000),
  bottleneckDetectionInterval: z.number().min(1000).default(60000),
  optimizationAnalysisInterval: z.number().min(1000).default(300000),
  maxConcurrentTasks: z.number().min(1).default(50),
  defaultWIPLimits: WIPLimitsSchema,
});

// =============================================================================
// VALIDATION UTILITY FUNCTIONS
// =============================================================================

export type TaskCreationInput = z.infer<typeof TaskCreationSchema>;

/**
 * Validation utilities class using Zod schemas
 */
export class ValidationUtils {
  /**
   * Validate task creation input
   */
  static validateTaskCreation(
    input: unknown
  ): ZodSafeParseResult<TaskCreationInput> {
    return TaskCreationSchema.safeParse(input);
  }

  /**
   * Validate workflow task
   */
  static validateWorkflowTask(
    input: unknown
  ): ZodSafeParseResult<z.infer<typeof WorkflowTaskSchema>> {
    return WorkflowTaskSchema.safeParse(input);
  }

  /**
   * Validate WIP limits
   */
  static validateWIPLimits(
    input: unknown
  ): ZodSafeParseResult<z.infer<typeof WIPLimitsSchema>> {
    return WIPLimitsSchema.safeParse(input);
  }

  /**
   * Validate kanban configuration
   */
  static validateKanbanConfig(
    input: unknown
  ): ZodSafeParseResult<z.infer<typeof KanbanConfigSchema>> {
    return KanbanConfigSchema.safeParse(input);
  }

  /**
   * Validate task state transition
   */
  static validateStateTransition(fromState: string, toState: string): boolean {
    const from = TaskStateSchema.safeParse(fromState);
    const to = TaskStateSchema.safeParse(toState);

    if (!from.success||!to.success) {
      return false;
    }

    // Special states can transition to any state
    if (
      ['blocked', 'expedite'].includes(from.data)||['blocked', 'expedite'].includes(to.data)
    ) {
      return true;
    }

    // Define valid workflow progression
    const workflowOrder = [
      'backlog',
      'analysis',
      'development',
      'testing',
      'review',
      'deployment',
      'done',
    ];
    const fromIndex = workflowOrder.indexOf(from.data);
    const toIndex = workflowOrder.indexOf(to.data);

    if (fromIndex === -1 || toIndex === -1) {
      return false;
    }

    // Allow forward movement, backward movement (for rework), or staying in same state
    return Math.abs(toIndex - fromIndex) <= 2 || toIndex >= fromIndex;
  }
}

// =============================================================================
// CONVENIENCE VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate task creation input with comprehensive error reporting
 */
export function validateTaskCreation(
  input: unknown
): ZodSafeParseResult<TaskCreationInput> {
  return TaskCreationSchema.safeParse(input);
}

/**
 * Validate WIP limits with comprehensive error reporting
 */
export function validateWIPLimits(
  input: unknown
): ZodSafeParseResult<z.infer<typeof WIPLimitsSchema>> {
  return WIPLimitsSchema.safeParse(input);
}

/**
 * Validate kanban configuration with comprehensive error reporting
 */
export function validateKanbanConfig(
  input: unknown
): ZodSafeParseResult<z.infer<typeof KanbanConfigSchema>> {
  return KanbanConfigSchema.safeParse(input);
}
