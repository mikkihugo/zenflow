/**
 * @fileoverview Kanban Workflow Engine
 *
 * Core kanban workflow engine shared across coordination systems.
 * Provides XState-powered workflow management with WIP limits,
 * bottleneck detection, and flow metrics.
 *
 * **Used By: **
 * - TaskMaster: Enterprise task management with human approval gates
 * - SAFe: Portfolio/Program/Team flow configurations
 * - Workflows: Process orchestration with flow state management
 *
 * **Features:**
 * - XState state machines for reliable workflow coordination
 * - WIP limit enforcement with intelligent optimization
 * - Real-time bottleneck detection and resolution
 * - Flow metrics and performance tracking
 * - Event-driven coordination with type safety
 * - Immutable state management with professional error handling
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// =============================================================================
// CORE KANBAN ENGINE - XState-powered workflow coordination
// =============================================================================
export {
  KanbanEngine,
  type WorkflowKanbanEvents,
} from './api/kanban-engine')// ============================================================================ = ''; 
// XSTATE MACHINE EXPORTS - For Advanced Integration
// =============================================================================
export {
  createConfiguredWorkflowMachine,
  createDefaultWorkflowConfig,
  createWorkflowMachine,
  WorkflowContextUtils,
  type WorkflowMachineContext,
} from './state-machines/index')// ============================================================================ = ''; 
// COMPREHENSIVE TYPE EXPORTS - Full Kanban Domain Type System
// =============================================================================
export type {
  BottleneckReport,
  BottleneckResolution,
  BottleneckTrend,
  FlowDirection,
  FlowMetrics,
  FlowState,
  HealthCheckResult,
  IntelligentWIPLimits,
  KanbanOperationResult,
  OptimizationResult,
  OptimizationStrategy,
  PerformanceThreshold,
  TaskAssignment,
  TaskMovementResult,
  TaskPriority,
  TaskState,
  TaskStateTransition,
  TimeRange,
  WIPLimits,
  WIPViolation,
  WorkflowBottleneck,
  WorkflowContext,
  WorkflowEvent,
  WorkflowKanbanConfig,
  WorkflowStatistics,
  WorkflowTask,
} from './types/index')// ============================================================================ = ''; 
// UTILITY EXPORTS - Immutable Operations and Validation
// =============================================================================
export {
  ImmutableContextUtils,
  ImmutableMetricsUtils,
  ImmutableTaskUtils,
  ImmutableUtils,
  ImmutableWIPUtils,
  KanbanConfigSchema,
  TaskPrioritySchema,
  TaskStateSchema,
  ValidationUtils,
  WIPLimitsSchema,
  WorkflowTaskSchema,
} from './utilities/index')// ============================================================================ = ''; 
// WORKFLOW CONSTANTS - Helper Functions and Validation
// =============================================================================
/**
 * Default task states in workflow order
 */
export const DEFAULT_WORKFLOW_STATES: [
 'backlog,') 'analysis,';
 'development,') 'testing,';
 'review,') 'deployment,';
 'done,';
];
/**
 * Blocked and expedite states (special handling)
 */')export const SPECIAL_WORKFLOW_STATES: ['blocked,' expedite];;
/**
 * All supported workflow states
 */
export const ALL_WORKFLOW_STATES: [
  ...DEFAULT_WORKFLOW_STATES,
  ...SPECIAL_WORKFLOW_STATES,
];
/**
 * Task priority levels in order (highest to lowest)
 */
export const TASK_PRIORITIES: [';];;
 'critical,') 'high,';
 'medium,') 'low,';
];
/**
 * Available optimization strategies
 */
export const OPTIMIZATION_STRATEGIES: [
 'wip_reduction,') 'bottleneck_removal,';
 'parallel_processing,') 'batch_optimization,';
 'cycle_time_reduction,';
];
// =============================================================================
// VALIDATION UTILITIES - Domain Validation Functions
// =============================================================================
/**
 * Validate if a state is a valid workflow state
 */
export const isValidWorkflowState = (state: string): state is TaskState => {
  return ALL_WORKFLOW_STATES.includes(state as TaskState);')'};;
/**
 * Validate if a priority is valid
 */
export const isValidTaskPriority = (
  priority: string
):priority is TaskPriority => {
  return TASK_PRIORITIES.includes(priority as TaskPriority);
'};;
/**
 * Validate if an optimization strategy is valid
 */
export const isValidOptimizationStrategy = (
  strategy: string
):strategy is OptimizationStrategy => {
  return OPTIMIZATION_STRATEGIES.includes(strategy as OptimizationStrategy);
'};;
/**
 * Get next state in workflow (or null if at end)
 */
export const getNextWorkflowState = (
  currentState: TaskState
):TaskState| null => {
  const currentIndex = DEFAULT_WORKFLOW_STATES.indexOf(currentState);
  if (
    currentIndex === -1|| 
    currentIndex === DEFAULT_WORKFLOW_STATES.length - 1
  ) {
    return null;
}
  return DEFAULT_WORKFLOW_STATES[currentIndex + 1];
'};;
/**
 * Get previous state in workflow (or null if at beginning)
 */
export const getPreviousWorkflowState = (
  currentState: TaskState
):TaskState| null => {
  const currentIndex = DEFAULT_WORKFLOW_STATES.indexOf(currentState);
  if (currentIndex <= 0) {
    return null;
}
  return DEFAULT_WORKFLOW_STATES[currentIndex - 1];
'};;
/**
 * Check if state transition is valid (follows workflow order)
 */
export const isValidStateTransition = (
  fromState: TaskState,
  toState: TaskState
):boolean => {
  // Special states can transition to any state
  if (
    SPECIAL_WORKFLOW_STATES.includes(fromState)|| 
    SPECIAL_WORKFLOW_STATES.includes(toState)
  ) {
    return true;
}
  // Normal workflow progression
  const fromIndex = DEFAULT_WORKFLOW_STATES.indexOf(fromState);
  const toIndex = DEFAULT_WORKFLOW_STATES.indexOf(toState);
  if (fromIndex === -1|| toIndex === -1) {
    return false;
}
  // Allow forward movement, backward movement (for rework), or staying in same state
  return Math.abs(toIndex - fromIndex) <= 2|| toIndex >= fromIndex;
'};;
// =============================================================================
// PACKAGE METADATA - Shared Flow Visualization Information
// =============================================================================
/**
 * Shared flow visualization engine metadata and feature information
 */
export const FLOW_PACKAGE_INFO = {
  name : '@claude-zen/coordination/flow')  version,  description,   'Shared flow visualization engine with XState-powered state management,';
  features: 'XState state machines + EventEmitter3 events',)    domain : 'Workflow coordination (shared across coordination systems)')    api : 'Clean interfaces hiding XState complexity')    integration,},')'} as const;';