/**
 * @fileoverview Workflow Validation Schemas
 *
 * Professional workflow schemas using Zod library.
 * Focused on workflow-specific validation rules.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { z} from '@claude-zen/foundation')/**';
 * Workflow step validation schema
 */
export const WorkflowStepSchema = z.object({
  type: z.object({
  name: z.record(z.unknown())();
/**
 * Workflow execution result schema
 */
export const WorkflowExecutionResultSchema = z.object({
  workflowId: z.infer<typeof WorkflowStepSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;
export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;
export type WorkflowExecutionResult = z.infer<;
  typeof WorkflowExecutionResultSchema
>;
')';