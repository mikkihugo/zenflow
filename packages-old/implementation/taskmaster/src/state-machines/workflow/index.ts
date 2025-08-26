/**
 * @fileoverview Workflow State Machine Module Exports
 *
 * Exports for the complete workflow state machine system.
 * Provides clean API surface for XState workflow coordination.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// Actions for external use (testing, extensions)
export { workflowActions } from './workflow-actions';

// Context utilities and types
export type { WorkflowMachineContext } from './workflow-context';
export { WorkflowContextUtils } from './workflow-context';
// Guards for external use (testing, extensions)
export { workflowGuards } from './workflow-guards';
// Machine definition and factory
export {
  createConfiguredWorkflowMachine,
  createDefaultWorkflowConfig,
  createWorkflowMachine,
} from './workflow-machine';
