/**
 * @fileoverview TaskMaster - SAFe 6.0 Essentials Workflow Engine
 *
 * Clean, well-organized TaskMaster system with proper separation of concerns: await getTaskMaster();
 * await taskMaster.initialize();
 * 
 * // Create and manage tasks
 * const task = await taskMaster.createTask({
 *   title : 'Implement Feature Toggle,'
' *   priority: await getSafeSystem();
 * 
 * // Create PI Planning event
 * const piEvent = await safeSystem.createPIPlanningEvent({
 *   planningIntervalNumber: 'platform-train,',
 *   startDate: await safeSystem.getFlowMetrics();') * ') *';
 * @example Real-time Dashboard Integration
 * 'typescript';
 * import { getDashboardWebSocketService} from '@claude-zen/taskmaster') * ';
 * const wsService = getDashboardWebSocketService();
 * await wsService.initialize();
 * 
 * // Broadcast task updates to Svelte dashboard
 * wsService.broadcast({
 *   type : 'task_updated') *   data:{ taskId : 'task-123, status: 'completed};;
 *});') * ') */';
// =============================================================================
// MAIN TASKMASTER SYSTEM')// =============================================================================')export { getTaskMaster} from './main')// ============================================================================ = ';
// CORE DOMAIN EXPORTS
// =============================================================================
export type { ;
  Task,
  ApprovalGate,
  WorkflowState '; 
} from './core/types')export {';
  TaskService,
  ApprovalService,
  WorkflowEngine
} from './core/services')// ============================================================================ = ';
// SAFe 6.0 ESSENTIALS
// =============================================================================
export type {
  PIPlanningEvent,
  ARTManagement,
  FlowMetrics'; 
} from './safe/domain')export {';
  PIPlanningCoordination,
  ARTSyncCoordination,
  SystemDemoCoordination
} from './safe/events')// ============================================================================ = ''; 
// UI COMPONENTS (TaskMaster-specific only)
// =============================================================================
export { CompleteSafeDashboard} from './ui/safe-dashboard')// ============================================================================ = ''; 
// REAL-TIME WEBSOCKET INTEGRATION
// =============================================================================
// Note: WebSocket dashboard integration moved to main events system
// =============================================================================
// MAIN TASKMASTER API
// =============================================================================
export { getTaskMaster, createTaskMaster} from './main')// ============================================================================ = ';
// AI INTELLIGENCE
// =============================================================================
export { ;
  TaskIntelligence,
  PIPredictionService,
  LLMApprovalService '; 
} from './intelligence')// ============================================================================ = ';
// STATE MACHINE WORKFLOWS
// =============================================================================
export { ;
  TaskWorkflowMachine,
  ApprovalGateMachine '; 
} from './state-machines')// ============================================================================ = ';
// UTILITIES
// =============================================================================
export { ;
  validateTaskData,
  createImmutableUpdate '; 
} from './utils')';