/**
 * @file AGUI Library - Autonomous Graphical User Interface
 *
 * A comprehensive library for human-in-the-loop interactions in autonomous systems.
 * Provides rich terminal, web, and custom adapters for various interaction patterns.
 *
 * This library includes:
 * - Core AGUI interfaces and adapters
 * - Task approval system integration
 * - Workflow gates and decision logging
 * - Rich terminal interactions
 * - Event-driven architecture support
 */
export type { AGUIInterface, EventHandlerConfig } from './interfaces';
export { TerminalAGUI, MockAGUI, createAGUI } from './interfaces';
export type { ValidationQuestion, Priority, MessageType, QuestionType, QuestionContext, ProgressInfo, AGUIResponse, BatchQuestionResult, AGUIConfig, EventHandlerConfig as AGUIEventHandlerConfig, AGUIFactory, AGUIRegistry } from './types';
export { AGUIType, AGUIError, AGUITimeoutError, AGUIValidationError } from './types';
export type { BaseDocumentEntity, TaskDocumentEntity, FeatureDocumentEntity, EpicDocumentEntity, CodeAnalysisResult, GeneratedSwarmTask, ScanResults, ApprovalRequest, ApprovalWorkflowConfig, TaskApprovalDecision, BatchApprovalResults, TaskApprovalConfig, ApprovalStatistics } from './task-approval-system';
export { TaskApprovalSystem, createTaskApprovalSystem } from './task-approval-system';
export declare const AGUI_VERSION = "1.0.0";
export declare const AGUI_DESCRIPTION = "Autonomous Graphical User Interface Library for Claude-Zen";
/**
 * Create a complete AGUI system with task approval capabilities
 */
export declare function createAGUISystem(config?: {
    aguiType?: 'terminal' | 'mock';
    taskApprovalConfig?: Partial<import('./task-approval-system').TaskApprovalConfig>;
}): Promise<{
    agui: import('./interfaces').AGUIInterface;
    taskApproval: import('./task-approval-system').TaskApprovalSystem;
}>;
//# sourceMappingURL=index.d.ts.map