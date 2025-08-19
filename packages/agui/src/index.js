/**
 * @fileoverview AGUI Package - Professional Tree-Shakable Exports
 *
 * Autonomous Graphical User Interface for human-in-the-loop interactions
 * in autonomous systems with task approval and workflow management.
 *
 * Key Features:
 * - Tree-shakable exports for optimal bundle size
 * - Professional naming conventions
 * - Separate entry points for different AGUI subsystems
 * - Type-only exports clearly separated
 *
 * @example Importing specific components
 * ```typescript
 * import { AGUISystem, TerminalAGUI } from '@claude-zen/agui';
 * import { TaskApprovalSystem } from '@claude-zen/agui';
 * ```
 *
 * @example Using separate entry points (more optimal)
 * ```typescript
 * import { TerminalAGUI } from '@claude-zen/agui/terminal';
 * import { TaskApprovalSystem } from '@claude-zen/agui/approval';
 * ```
 */
// =============================================================================
// PRIMARY ENTRY POINT - Complete AGUI system
// =============================================================================
/**
 * Creates a complete AGUI (Autonomous Graphical User Interface) system with integrated task approval capabilities.
 *
 * This is the primary factory function for initializing a full-featured AGUI system that combines
 * human-in-the-loop interactions with automated task approval workflows. The system supports both
 * terminal-based and mock interfaces for development and testing.
 *
 * @param config - Optional configuration object for AGUI system setup
 * @param config.aguiType - Type of AGUI interface to create ('terminal' | 'mock'). Defaults to 'terminal'
 * @param config.taskApprovalConfig - Partial configuration for the task approval system
 *
 * @returns Promise resolving to an object containing both the AGUI interface and task approval system
 *
 * @example Basic AGUI system creation
 * ```typescript
 * import { createAGUI } from '@claude-zen/agui';
 *
 * const { agui, taskApproval } = await createAGUI();
 *
 * // Use AGUI for human interaction
 * const userResponse = await agui.askQuestion('Proceed with deployment?', {
 *   type: 'boolean',
 *   priority: 'high'
 * });
 *
 * // Use task approval for workflow gates
 * const approved = await taskApproval.requestApproval({
 *   taskType: 'deployment',
 *   description: 'Deploy to production',
 *   context: { environment: 'prod' }
 * });
 * ```
 *
 * @example AGUI system with custom configuration
 * ```typescript
 * import { createAGUI } from '@claude-zen/agui';
 *
 * const { agui, taskApproval } = await createAGUI({
 *   aguiType: 'terminal',
 *   taskApprovalConfig: {
 *     autoApprove: false,
 *     timeoutMs: 30000,
 *     defaultDecision: 'reject'
 *   }
 * });
 * ```
 *
 * @example Mock AGUI for testing
 * ```typescript
 * import { createAGUI } from '@claude-zen/agui';
 *
 * const { agui, taskApproval } = await createAGUI({
 *   aguiType: 'mock'
 * });
 *
 * // Mock AGUI automatically approves for testing
 * const result = await agui.askQuestion('Test question?', {
 *   type: 'boolean'
 * });
 * // result.answer will be true (default mock response)
 * ```
 *
 * @throws {AGUIError} When AGUI system initialization fails
 * @throws {AGUIValidationError} When configuration validation fails
 *
 * @since 1.0.0
 * @public
 */
export { createAGUISystem as createAGUI } from './create-agui-system';
export { createAGUISystem as AGUISystem } from './create-agui-system';
// =============================================================================
// CORE INTERFACES - Basic AGUI components
// =============================================================================
export { TerminalAGUI, MockAGUI, createAGUI as createBasicAGUI } from './interfaces';
// =============================================================================
// TASK APPROVAL SYSTEM - Human-in-the-loop workflows
// =============================================================================
export { TaskApprovalSystem, createTaskApprovalSystem } from './task-approval-system';
// =============================================================================
// ENUMS AND CONSTANTS - Essential values (tree-shakable)
// =============================================================================
export { AGUIType, AGUIError, AGUITimeoutError, AGUIValidationError } from './types';
// =============================================================================
// METADATA - Package information
// =============================================================================
/**
 * Package metadata and capabilities information for the AGUI library.
 *
 * This constant provides comprehensive information about the AGUI package including
 * version details, capabilities, and feature set. Useful for runtime introspection,
 * debugging, feature detection, and integration with other systems that need to
 * understand AGUI's capabilities.
 *
 * @example Checking AGUI capabilities
 * ```typescript
 * import { AGUI_INFO } from '@claude-zen/agui';
 *
 * console.log(`Using AGUI v${AGUI_INFO.version}`);
 *
 * // Feature detection
 * const hasWorkflowSupport = AGUI_INFO.capabilities.includes(
 *   'Task approval workflows'
 * );
 *
 * if (hasWorkflowSupport) {
 *   // Enable workflow-specific features
 * }
 * ```
 *
 * @example Integration with monitoring systems
 * ```typescript
 * import { AGUI_INFO } from '@claude-zen/agui';
 *
 * // Send package info to monitoring/telemetry
 * telemetry.track('agui_initialized', {
 *   version: AGUI_INFO.version,
 *   capabilities: AGUI_INFO.capabilities,
 *   package: AGUI_INFO.name
 * });
 * ```
 *
 * @example Runtime capability checking
 * ```typescript
 * import { AGUI_INFO } from '@claude-zen/agui';
 *
 * function checkAGUICompatibility(): boolean {
 *   const requiredCapabilities = [
 *     'Human-in-the-loop interactions',
 *     'Terminal and web interfaces'
 *   ];
 *
 *   return requiredCapabilities.every(capability =>
 *     AGUI_INFO.capabilities.includes(capability)
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @readonly
 */
export const AGUI_INFO = {
    version: '1.0.0',
    name: '@claude-zen/agui',
    description: 'Autonomous Graphical User Interface Library for Claude-Zen',
    capabilities: [
        'Human-in-the-loop interactions',
        'Task approval workflows',
        'Terminal and web interfaces',
        'Event-driven architecture',
        'Rich terminal interactions',
        'Workflow gates and decision logging'
    ]
};
