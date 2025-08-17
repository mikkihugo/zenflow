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

// Core AGUI exports from local interfaces
export type { 
  AGUIInterface,
  EventHandlerConfig 
} from './interfaces';

export { 
  TerminalAGUI, 
  MockAGUI, 
  createAGUI 
} from './interfaces';

// AGUI library types
export type {
  ValidationQuestion,
  Priority,
  MessageType,
  QuestionType,
  QuestionContext,
  ProgressInfo,
  AGUIResponse,
  BatchQuestionResult,
  AGUIConfig,
  EventHandlerConfig as AGUIEventHandlerConfig,
  AGUIFactory,
  AGUIRegistry
} from './types';

export {
  AGUIType,
  AGUIError,
  AGUITimeoutError,
  AGUIValidationError
} from './types';

// Workflow AGUI exports (simplified - core interfaces only, complex workflow features not included)

// Task Approval System exports  
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
  ApprovalStatistics
} from './task-approval-system';

export {
  TaskApprovalSystem,
  createTaskApprovalSystem
} from './task-approval-system';

// Library version and metadata
export const AGUI_VERSION = '1.0.0';
export const AGUI_DESCRIPTION = 'Autonomous Graphical User Interface Library for Claude-Zen';

/**
 * Create a complete AGUI system with task approval capabilities
 */
export async function createAGUISystem(config?: {
  aguiType?: 'terminal' | 'mock';
  taskApprovalConfig?: Partial<import('./task-approval-system').TaskApprovalConfig>;
}): Promise<{
  agui: import('./interfaces').AGUIInterface;
  taskApproval: import('./task-approval-system').TaskApprovalSystem;
}> {
  // Import locally to avoid bundling issues
  const { createAGUI } = await import('./interfaces');
  const { createTaskApprovalSystem } = await import('./task-approval-system');
  
  // Create appropriate AGUI adapter
  let agui: import('./interfaces').AGUIInterface;
  
  switch (config?.aguiType) {
    case 'mock':
      agui = createAGUI('mock');
      break;
    default:
      agui = createAGUI('terminal');
  }
  
  // Create task approval system
  const taskApproval = createTaskApprovalSystem(agui, config?.taskApprovalConfig);
  
  return {
    agui,
    taskApproval
  };
}