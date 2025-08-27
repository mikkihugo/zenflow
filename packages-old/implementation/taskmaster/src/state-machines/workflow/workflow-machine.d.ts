/**
 * @fileoverview Workflow State Machine - XState 5.20.2 Compatible
 *
 * Simplified XState machine definition for workflow coordination.
 * Focused on essential workflow management with clean types.
 *
 * SINGLE RESPONSIBILITY: State machine definition and configuration
 * FOCUSES ON: State hierarchy, transitions, essential coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { WorkflowKanbanConfig } from '../../types/index';
/**
 * Essential workflow coordination state machine
 *
 * Simplified design focused on core workflow functionality:
 * - Task state management
 * - Basic flow coordination
 * - Essential monitoring
 */
export declare const createWorkflowMachine: (config: WorkflowKanbanConfig) => any;
/**
 * Create configured workflow machine instance with default services
 */
export declare const createConfiguredWorkflowMachine: (config: WorkflowKanbanConfig) => any;
/**
 * Default workflow configuration for development/testing
 */
export declare const createDefaultWorkflowConfig: () => WorkflowKanbanConfig;
//# sourceMappingURL=workflow-machine.d.ts.map