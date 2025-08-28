/**
 * @fileoverview Validation Utilities - Runtime Safety with Foundation
 *
 * Professional validation utilities using foundation's centralized Zod integration.
 * Provides runtime type safety for kanban domain objects.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { z, validateInput } from '@claude-zen/foundation';
import type { TaskState, TaskPriority, WIPLimits, WorkflowKanbanConfig, WorkflowTask } from '../types/index';
/**
 * Task state validation schema
 */
export const TaskStateSchema = z.enum([
 'backlog,
 'analysis,
 'development,
 'testing,
 'review,
 'deployment,
 'done,
 'blocked,
 'expedite,
]);

/**
 * Task priority validation schema
 */
export const TaskPrioritySchema = z.enum([
 'critical,
 'high,
 'medium,
 'low,
]);

/**
 * WIP limits validation schema
 */
export const WIPLimitsSchema = z.object({
  analysis: z.number().min(1).max(100),
  development: z.number().min(1).max(100),
  testing: z.number().min(1).max(100),
  review: z.number().min(1).max(100),
  deployment: z.number().min(1).max(100),
  blocked: z.number().min(1).max(100),
  done: z.number().min(1).max(10000),
});

/**
 * Workflow task validation schema
 */
export const WorkflowTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  state: TaskStateSchema,
  priority: TaskPrioritySchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  assignedTo: z.string().optional(),
  estimatedEffort: z.number().min(0).max(1000).optional(),
  actualEffort: z.number().min(0).max(1000).optional(),
  dependencies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Kanban configuration validation schema
 */
export const KanbanConfigSchema = z.object({
  enableIntelligentWIP: z.boolean().default(true),
  enableBottleneckDetection: z.boolean().default(true),
  enableFlowOptimization: z.boolean().default(true),
  enableHealthMonitoring: z.boolean().default(true),
  enableEventSystem: z.boolean().default(true),
  wipLimits: WIPLimitsSchema,
  maxConcurrentTasks: z.number().min(1).max(1000).default(50),
  performanceTrackingEnabled: z.boolean().default(true),
});

/**
 * Validation utilities using foundation's validateInput
 */
export class ValidationUtils {
  /**
   * Validate task state
   */
  static validateTaskState(state: unknown) {
    return validateInput(TaskStateSchema, state);
  }

  /**
   * Validate task priority
   */
  static validateTaskPriority(priority: unknown) {
    return validateInput(TaskPrioritySchema, priority);
  }

  /**
   * Validate WIP limits
   */
  static validateWIPLimits(limits: unknown) {
    return validateInput(WIPLimitsSchema, limits);
  }

  /**
   * Validate workflow task
   */
  static validateWorkflowTask(task: unknown) {
    return validateInput(WorkflowTaskSchema, task);
  }

  /**
   * Validate kanban configuration
   */
  static validateKanbanConfig(config: unknown) {
    return validateInput(KanbanConfigSchema, config);
  }

  /**
   * Validate task creation input
   */
  static validateTaskCreation(input: unknown) {
    const schema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      priority:  TaskPrioritySchema.default(medium'),
      assignedTo: z.string().optional(),
      estimatedEffort: z.number().min(0).max(1000).optional(),
      dependencies: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    return validateInput(schema, input);
  }

  /**
   * Validate task update input
   */
  static validateTaskUpdate(input: unknown) {
    const schema = z.object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      priority: TaskPrioritySchema.optional(),
      assignedTo: z.string().optional(),
      estimatedEffort: z.number().min(0).max(1000).optional(),
      actualEffort: z.number().min(0).max(1000).optional(),
      dependencies: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    return validateInput(schema, input);
  }

  /**
   * Validate state transition
   */
  static validateStateTransition(fromState: unknown, toState: unknown) {
    const stateValidation = validateInput(TaskStateSchema, fromState);
    if (!stateValidation.success) return stateValidation;
    
    const toStateValidation = validateInput(TaskStateSchema, toState);
    if (!toStateValidation.success) return toStateValidation;

    // Additional business rule validation could go here
    return { success: true, data: { from: stateValidation.data, to: toStateValidation.data } };
  }
}