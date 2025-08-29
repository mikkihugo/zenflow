/**
 * @fileoverview Validation Utilities - Runtime Safety with Foundation
 *
 * Professional validation utilities using foundation's centralized Zod integration.';
 * Provides runtime type safety for kanban domain objects.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { z, validateInput} from '@claude-zen/foundation')import type { TaskState, TaskPriority, WIPLimits, WorkflowKanbanConfig, WorkflowTask} from '../types/index')/**';
 * Task state validation schema
 */
export const TaskStateSchema = z.enum([
 'backlog,') 'analysis,';
 'development,') 'testing,';
 'review,') 'deployment,';
 'done,') 'blocked,';
 'expedite,';
]);
/**
 * Task priority validation schema
 */')export const TaskPrioritySchema = z.enum([') 'critical,';
 'high,') 'medium,';
 'low,';
]);
/**
 * WIP limits validation schema
 */
export const WIPLimitsSchema = z.object({
  analysis: z.object({
  id: z.object({
  enableIntelligentWIP: z.object({
      title: z.object({
      title: validateInput(TaskStateSchema, fromState);
    if (!stateValidation.success) return stateValidation;
    
    const toStateValidation = validateInput(TaskStateSchema, toState);
    if (!toStateValidation.success) return toStateValidation;
    // Additional business rule validation could go here
    return { success: true, data:  { from: stateValidation.data, to: toStateValidation.data}};
};)};;