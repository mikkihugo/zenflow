/**
 * @fileoverview Approval System Package - Task Approval and Human-in-the-Loop System
 *
 * **TASK APPROVAL AND HUMAN-IN-THE-LOOP INTERACTION SYSTEM**
 *
 * Professional task approval system for autonomous workflows with human-in-the-loop
 * interactions, workflow gates, and decision logging capabilities.
 *
 * **CORE CAPABILITIES:**
 * - 🤖 **Task Approval Workflows**: Structured approval processes with timeouts
 * - 👤 **Human-in-the-loop**: Interactive decision points and validations
 * - 💻 **Web Interface**: Browser-based approval dialogs and interactions
 * - 🎭 **Headless Mode**: Automated responses for testing and CI/CD
 * - 📊 **Event-driven Architecture**: Reactive interface patterns
 * - 🔧 **Foundation Integration**: Complete @claude-zen/foundation support
 * - 🌐 **Multi-platform Support**: Web and headless interfaces
 *
 * **Enterprise Features:**
 * - Workflow gates and decision logging
 * - Automated approval workflows with timeouts
 * - Task validation and context management
 * - Performance monitoring and analytics
 * - Circuit breaker protection for long-running interactions
 * - Graceful degradation to automated decisions
 *
 * @example Basic Approval System
 * ```typescript
 * import { createApprovalSystem } from '@claude-zen/agui';
 *
 * const { approvalSystem, taskApproval } = await createApprovalSystem({
 *   approvalType: 'web',
 *   taskApprovalConfig: {
 *     autoApprove: false,
 *     timeoutMs: 30000,
 *     defaultDecision: 'ask'
 *   }
 * });
 *
 * // Use Approval System for human interaction
 * const userResponse = await approvalSystem.askQuestion('Proceed with deployment?', {
 *   type: 'boolean',
 *   priority: 'high',
 *   context: { environment: 'production' }
 * });
 *
 * if (userResponse.answer) {
 *   console.log('Deployment approved!');
 * }
 * ```
 *
 * @example Task Approval Workflows
 * ```typescript
 * import { TaskApprovalSystem } from '@claude-zen/agui';
 *
 * const taskApproval = new TaskApprovalSystem({
 *   autoApprove: false,
 *   timeoutMs: 60000,
 *   enableLogging: true
 * });
 *
 * // Request approval for sensitive operations
 * const approved = await taskApproval.requestApproval({
 *   taskType: 'file-deletion',
 *   description: 'Delete temporary files older than 30 days',
 *   context: {
 *     fileCount: 1247,
 *     totalSize: '2.3GB',
 *     oldestFile: '45 days ago'
 *   },
 *   priority: 'medium'
 * });
 *
 * if (approved.decision === 'approved') {
 *   // Proceed with deletion
 *   console.log('File deletion approved');
 * }
 * ```
 *
 * @example Web Approval Interface
 * ```typescript
 * import { WebApproval } from '@claude-zen/agui';
 *
 * const webApproval = new WebApproval('#approval-container');
 *
 * // Interactive web-based approval
 * const result = await webApproval.askQuestion('Select deployment strategy:', {
 *   type: 'choice',
 *   choices: [
 *     { value: 'blue-green', label: 'Blue-Green Deployment (Recommended)' },
 *     { value: 'rolling', label: 'Rolling Update' },
 *     { value: 'canary', label: 'Canary Release' }
 *   ],
 *   priority: 'high'
 * });
 *
 * console.log(`Selected strategy: ${result.answer}`);
 * ```
 *
 * @example Headless Approval for Testing
 * ```typescript
 * import { HeadlessApproval } from '@claude-zen/agui';
 *
 * const headlessApproval = new HeadlessApproval({
 *   defaultResponses: {
 *     boolean: true,
 *     choice: 0, // First choice
 *     text: 'automated-response'
 *   }
 * });
 *
 * // Headless automatically responds for testing
 * const response = await headlessApproval.askQuestion('Continue?', {
 *   type: 'boolean'
 * });
 * // response.answer === true (from default)
 * ```
 *
 * @example Batch Approval Processing
 * ```typescript
 * import { TaskApprovalSystem } from '@claude-zen/agui';
 *
 * const taskApproval = new TaskApprovalSystem();
 *
 * const requests = [
 *   { taskType: 'deployment', description: 'Deploy to staging' },
 *   { taskType: 'database-migration', description: 'Update user schema' },
 *   { taskType: 'cache-clear', description: 'Clear Redis cache' }
 * ];
 *
 * const results = await taskApproval.requestBatchApproval(requests, {
 *   requireAllApproved: false,
 *   timeoutMs: 120000
 * });
 *
 * console.log(`Approved: ${results.approved.length}/${requests.length}`);
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 *
 * @see {@link https://github.com/zen-neural/claude-code-zen} Claude Code Zen Documentation
 * @see {@link ./src/main} Main Implementation
 *
 * @requires @claude-zen/foundation - Core utilities and infrastructure
 *
 * @packageDocumentation
 */

// =============================================================================
// PRIMARY ENTRY POINT - Complete Approval System (Following Gold Standards)
// =============================================================================
export { createAGUISystem as ApprovalSystem } from './src/main';
export { createAGUISystem as createApprovalSystem } from './src/main';
export { createAGUISystem as default } from './src/main';

// =============================================================================
// CORE INTERFACES - Basic approval components (Following Gold Standards)
// =============================================================================
export {
  WebAGUI as WebApproval,
  HeadlessAGUI as HeadlessApproval,
  createAGUI as createInteractiveApproval,
} from './src/main';

// =============================================================================
// TASK APPROVAL SYSTEM - Human-in-the-loop workflows
// =============================================================================
export { TaskApprovalSystem, createTaskApprovalSystem } from './src/main';

// =============================================================================
// TYPE DEFINITIONS - Interfaces and types (tree-shakable)
// =============================================================================

// Core interface types
export type {
  AGUIInterface as ApprovalInterface,
  EventHandlerConfig,
} from './src/main';

// Approval System library types
export type {
  ValidationQuestion,
  Priority,
  MessageType,
  QuestionType,
  QuestionContext,
  ProgressInfo,
  AGUIResponse as ApprovalResponse,
  BatchQuestionResult,
  AGUIConfig as ApprovalConfig,
  EventHandlerConfig as ApprovalEventHandlerConfig,
  AGUIFactory as ApprovalFactory,
  AGUIRegistry as ApprovalRegistry,
} from './src/main';

// Task approval types
export type {
  BaseDocumentEntity,
  TaskDocumentEntity,
  FeatureDocumentEntity,
  EpicDocumentEntity,
  CodeAnalysisResult,
  GeneratedSwarmTask,
  ScanResults,
  ApprovalRequest,
  ApprovalWorkflowConfig,
  TaskApprovalDecision,
  BatchApprovalResults,
  TaskApprovalConfig,
  ApprovalStatistics,
} from './src/main';

// =============================================================================
// ENUMS AND CONSTANTS - Essential values (tree-shakable)
// =============================================================================
export {
  AGUIType as ApprovalType,
  AGUIError as ApprovalError,
  AGUITimeoutError as ApprovalTimeoutError,
  AGUIValidationError as ApprovalValidationError,
} from './src/main';

// =============================================================================
// METADATA - Package information
// =============================================================================

/**
 * Approval System Package Information
 *
 * Comprehensive metadata about the Approval System package including
 * version details, capabilities, and feature set.
 */
export const APPROVAL_SYSTEM_INFO = {
  version: '1.0.0',
  name: '@claude-zen/agui',
  description:
    'Task approval and human-in-the-loop interaction system for autonomous workflows',
  capabilities: [
    'Human-in-the-loop interactions',
    'Task approval workflows',
    'Web and headless interfaces',
    'Event-driven architecture',
    'Workflow gates and decision logging',
    'Foundation integration',
  ],
  interfaces: {
    web: 'Browser-based interactive approvals',
    headless: 'Automated testing interface',
    api: 'Programmatic interface',
  },
} as const;

/**
 * Approval System Documentation
 *
 * ## Overview
 *
 * The Approval System provides human-in-the-loop interactions for autonomous
 * systems. It enables intelligent decision points, approval workflows, and
 * rich user interactions for task validation and process control.
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │                User Interface Layer                 │
 * │              (Web, Headless)                        │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │           Approval System Core                      │
 * │  • Question processing                             │
 * │  • Response validation                             │
 * │  • Event management                                │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │           Task Approval System                      │
 * │  • Workflow gates                                  │
 * │  • Decision logging                                │
 * │  • Timeout handling                               │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │             Foundation Layer                        │
 * │  • Logging and telemetry                           │
 * │  • Error handling                                  │
 * │  • Configuration management                        │
 * └─────────────────────────────────────────────────────┘
 * ```
 *
 * ## Question Types and Interactions
 *
 *''''' | '''''Type''''' | '''''Description''''' | '''''Example''''' | '''''*''''' | '''''------''''' | '''''-------------''''' | '''''---------''''' | '''''*''''' | '''''boolean''''' | '''''Yes/No questions''''' | ''''''Proceed with deployment?'''''' | '''''*''''' | '''''choice''''' | '''''Multiple choice''''' | ''''''Select environment: [dev, staging, prod]'''''' | '''''*''''' | '''''text''''' | '''''Free text input''''' | ''''''Enter commit message:'''''' | '''''*''''' | '''''number''''' | '''''Numeric input''''' | ''''''How many instances to deploy?'''''' | '''''*''''' | '''''password''''' | '''''Secure input''''' | ''''''Enter API key:' |
 *
 * ## Approval Workflow States
 *
 * - **Pending**: Awaiting user decision
 * - **Approved**: User approved the action
 * - **Rejected**: User rejected the action
 * - **Timeout**: Decision timeout reached
 * - **Error**: System error during approval
 * - **Auto-approved**: Automatically approved based on rules
 *
 * ## Performance Characteristics
 *
 * - **Response Time**: <50ms for question display
 * - **Memory Usage**: <1MB per active session
 * - **Concurrent Sessions**: Up to 100 simultaneous interactions
 * - **Timeout Handling**: Configurable (default: 30 seconds)
 * - **Decision Logging**: Complete audit trail
 *
 * ## Getting Started
 *
 * ```bash
 * npm install @claude-zen/agui @claude-zen/foundation
 * ```
 *
 * See the examples above for usage patterns.
 */
