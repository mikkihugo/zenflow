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
import { z } from '@claude-zen/foundation';

/**
 * Task state validation schema
 */
export declare const TaskStateSchema: z.ZodEnum<['backlog', 'analysis', 'ready', 'in_progress', 'review', 'done']>;

/**
 * WIP limits validation schema
 */
export declare const WIPLimitsSchema: z.ZodObject<{
  analysis: z.ZodNumber;
  development: z.ZodNumber;
  testing: z.ZodNumber;
  deployment: z.ZodNumber;
}>;

/**
 * Task priority validation schema
 */
export declare const TaskPrioritySchema: z.ZodEnum<['critical', 'high', 'medium', 'low']>;

/**
 * Workflow task validation schema
 */
export declare const WorkflowTaskSchema: z.ZodObject<{
  id: z.ZodString;
  title: z.ZodString;
  description: z.ZodString;
  state: z.ZodEnum<['backlog', 'analysis', 'ready', 'in_progress', 'review', 'done']>;
  priority: z.ZodEnum<['critical', 'high', 'medium', 'low']>;
  assignee?: z.ZodString;
  createdAt: z.ZodDate;
  updatedAt: z.ZodDate;
}>;

/**
 * Kanban configuration validation schema
 */
export declare const KanbanConfigSchema: z.ZodObject<{
  enableIntelligentWIP: z.ZodBoolean;
  maxConcurrentTasks: z.ZodNumber;
  workflowStates: z.ZodArray<z.ZodString>;
}>;
