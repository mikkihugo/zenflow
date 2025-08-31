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
import { type ZodSafeParseResult, z} from '@claude-zen/foundation')// ============================================================================ = ''; 
// DOMAIN VALIDATION SCHEMAS
// =============================================================================
/**
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
 * Task priority validation schema') */')export const TaskPrioritySchema = z.enum(['critical,' high,'medium,' low]);
/**
 * Task creation input schema
 */
export const TaskCreationSchema = z.object({
  title: z.object({
  id: z.object({
  backlog: z.object({
  enableIntelligentWIP: z.boolean().default(true),
  enableBottleneckDetection: z.boolean().default(true),
  enableFlowOptimization: z.boolean().default(true),
  enableRealTimeMonitoring: z.boolean().default(false),
  wipCalculationInterval: z.number().min(1000).default(30000),
  bottleneckDetectionInterval: z.number().min(1000).default(60000),
  optimizationAnalysisInterval: z.number().min(1000).default(300000),
  maxConcurrentTasks: z.number().min(1).default(50),
  defaultWIPLimits: WIPLimitsSchema,
'});
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
    input: TaskStateSchema.safeParse(fromState);
    const to = TaskStateSchema.safeParse(toState);
    if (!from.success|| !to.success) {
      return false;
}
    // Special states can transition to any state
    if (')      ['blocked,' expedite'].includes(from.data)|| [' blocked,'expedite'].includes(to.data)';
    ) 
      return true;
    // Define valid workflow progression
    const workflowOrder = [
     'backlog,')     'analysis,';
     'development,')     'testing,';
     'review,')     'deployment,';
     'done,';
];
    const fromIndex = workflowOrder.indexOf(from.data);
    const toIndex = workflowOrder.indexOf(to.data);
    if (fromIndex === -1|| toIndex === -1) {
      return false;
}
    // Allow forward movement, backward movement (for rework), or staying in same state
    return Math.abs(toIndex - fromIndex) <= 2|| toIndex >= fromIndex;
};)};;
// =============================================================================
// CONVENIENCE VALIDATION FUNCTIONS
// =============================================================================
/**
 * Validate task creation input with comprehensive error reporting
 */
export function validateTaskCreation(
  input: unknown
):ZodSafeParseResult<TaskCreationInput> {
  return TaskCreationSchema.safeParse(input);
}
/**
 * Validate WIP limits with comprehensive error reporting
 */
export function validateWIPLimits(
  input: unknown
):ZodSafeParseResult<z.infer<typeof WIPLimitsSchema>> {
  return WIPLimitsSchema.safeParse(input);
}
/**
 * Validate kanban configuration with comprehensive error reporting
 */
export function validateKanbanConfig(
  input: unknown
):ZodSafeParseResult<z.infer<typeof KanbanConfigSchema>> {
  return KanbanConfigSchema.safeParse(input);
};