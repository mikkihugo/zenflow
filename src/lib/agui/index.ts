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

// Core AGUI exports from interfaces
export type { 
  AGUIInterface,
  EventHandlerConfig 
} from '../../interfaces/agui/agui-adapter';

export { 
  TerminalAGUI, 
  MockAGUI, 
  createAGUI 
} from '../../interfaces/agui/agui-adapter';

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

// Workflow AGUI exports
export type {
  WorkflowDecisionAudit,
  WorkflowPromptContext,
  TimeoutConfig,
  WorkflowAGUIConfig
} from '../../interfaces/agui/workflow-agui-adapter';

export {
  WorkflowAGUIAdapter,
  createWorkflowAGUIAdapter,
  createProductionWorkflowAGUIAdapter,
  createTestWorkflowAGUIAdapter
} from '../../interfaces/agui/workflow-agui-adapter';

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
  aguiType?: 'terminal' | 'mock' | 'workflow';
  taskApprovalConfig?: Partial<TaskApprovalConfig>;
  enableWorkflowFeatures?: boolean;
}): Promise<{
  agui: AGUIInterface;
  taskApproval: TaskApprovalSystem;
}> {
  // Create appropriate AGUI adapter
  let agui: AGUIInterface;
  
  switch (config?.aguiType) {
    case 'mock':
      agui = createAGUI('mock');
      break;
    case 'workflow':
      // Would need TypeSafeEventBus instance - placeholder for now
      agui = createAGUI('terminal');
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