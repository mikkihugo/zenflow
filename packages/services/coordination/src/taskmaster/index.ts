/**
 * @fileoverview TaskMaster - SAFe 6.0 Essentials Workflow Engine
 *
 * Clean, well-organized TaskMaster system with proper separation of concerns:
 * - Core domain logic for task management and approval workflows
 * - SAFe 6.0 Essentials with PI Planning, ART management, and flow metrics  
 * - Real-time WebSocket updates for Svelte dashboard
 * - Infrastructure services (API, database, facades)
 * - AI-powered intelligence for optimization and predictions
 * 
 * **ARCHITECTURE:**
 * - core/ - Core TaskMaster domain logic and services
 * - safe/ - SAFe 6.0 Essentials consolidated functionality
 * - ui/ - TaskMaster-specific UI components (SAFe dashboard, etc.)
 * - infrastructure/ - External integrations (API, database, WebSocket)
 * - intelligence/ - AI/ML capabilities for optimization
 * - state-machines/ - XState workflow orchestration
 * - utils/ - Consolidated utilities
 *
 * @example Basic TaskMaster Usage
 * ```typescript
 * import { getTaskMaster } from '@claude-zen/taskmaster';
 * 
 * const taskMaster = await getTaskMaster();
 * await taskMaster.initialize();
 * 
 * // Create and manage tasks
 * const task = await taskMaster.createTask({
 *   title:'Implement Feature Toggle,
 *   priority: high,
 *   estimatedEffort: 13
 * });
 * 
 * // SAFe workflow progression
 * await taskMaster.moveTask(task.id,'development'');
 * await taskMaster.moveTask(task.id,'testing'');
 * ```
 *
 * @example SAFe 6.0 Essentials Usage  
 * ```typescript
 * import { getSafeSystem } from '@claude-zen/taskmaster';
 * 
 * const safeSystem = await getSafeSystem();
 * 
 * // Create PI Planning event
 * const piEvent = await safeSystem.createPIPlanningEvent({
 *   planningIntervalNumber: 2024.3,
 *   artId:'platform-train,
 *   startDate: new Date(),
 *   endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
 * });
 * 
 * // Track flow metrics
 * const metrics = await safeSystem.getFlowMetrics();
 * ```
 *
 * @example Real-time Dashboard Integration
 * ```typescript
 * import { getDashboardWebSocketService } from '@claude-zen/taskmaster';
 * 
 * const wsService = getDashboardWebSocketService();
 * await wsService.initialize();
 * 
 * // Broadcast task updates to Svelte dashboard
 * wsService.broadcast({
 *   type:'task_updated,
 *   data: { taskId:'task-123,status: 'completed '}
 * });
 * ```
 */

// =============================================================================
// MAIN TASKMASTER SYSTEM
// =============================================================================
export { getTaskMaster } from './main';
// =============================================================================
// CORE DOMAIN EXPORTS
// =============================================================================
export type { 
  Task,
  ApprovalGate,
  WorkflowState 
} from './core/types';
export {
  TaskService,
  ApprovalService,
  WorkflowEngine
} from './core/services';
// =============================================================================
// SAFe 6.0 ESSENTIALS
// =============================================================================
export type {
  PIPlanningEvent,
  ARTManagement,
  FlowMetrics
} from './safe/domain';
export {
  PIPlanningCoordination,
  ARTSyncCoordination,
  SystemDemoCoordination
} from './safe/events';
// =============================================================================
// UI COMPONENTS (TaskMaster-specific only)
// =============================================================================
export { CompleteSafeDashboard } from './ui/safe-dashboard';
// =============================================================================
// REAL-TIME WEBSOCKET INTEGRATION
// =============================================================================
// Note: WebSocket dashboard integration moved to main events system

// =============================================================================
// MAIN TASKMASTER API
// =============================================================================
export { getTaskMaster, createTaskMaster } from './main';
// =============================================================================
// AI INTELLIGENCE
// =============================================================================
export { 
  TaskIntelligence,
  PIPredictionService,
  LLMApprovalService 
} from './intelligence';
// =============================================================================
// STATE MACHINE WORKFLOWS
// =============================================================================
export { 
  TaskWorkflowMachine,
  ApprovalGateMachine 
} from './state-machines';
// =============================================================================
// UTILITIES
// =============================================================================
export { 
  validateTaskData,
  createImmutableUpdate 
} from './utils';