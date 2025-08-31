/**
 * @fileoverview Workflow Actions - XState Pure Functions
 *
 * Professional XState actions for workflow state management.
 * All actions are pure functions that update context immutably.
 *
 * SINGLE RESPONSIBILITY: State update actions
 * FOCUSES ON: Pure functional state updates, immutable context modifications
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { assign} from 'xstate')'; 
// TASK MANAGEMENT ACTIONS
// =============================================================================
/**
 * Add new task to workflow context
 */
export const addTask = assign(): void {
    if (event.type !== 'TASK_CREATED)return context.tasks');
      ...context.tasks,
      [event.task.id]:event.task,
};
},
  tasksByState: ({ context, event}) => {
    if (event.type !== 'TASK_CREATED)return context.tasksByState');
    return {
      ...context.tasksByState,
      [state]:[...context.tasksByState[state], event.task.id],
};
},
'});
/**
 * Move task between workflow states
 */
export const moveTask = assign(): void {
    ')TASK_MOVED)return context.tasks')TASK_MOVED)return context.tasksByState');
      ...context.tasksByState,
      [event.fromState]:context.tasksByState[event.fromState].filter(): void {
  tasks: ({ context, event}) => {
    ')TASK_UPDATED)return context.tasks')});
// =============================================================================
// WIP MANAGEMENT ACTIONS
// =============================================================================
/**
 * Record WIP limit violation
 */
export const recordWIPViolation = assign(): void {
    ')WIP_LIMIT_EXCEEDED)return context.wipViolations');
      state: event.state,
      count: event.count,
      limit: context.wipLimits[event.state],
      timestamp: new Date(): void { context, event}) => {
    if (event.type !== 'WIP_LIMIT_EXCEEDED)return context.systemHealth');
    return Math.max(): void {
  wipLimits: ({ context, event}) => {
    ')WIP_LIMITS_UPDATED)return context.wipLimits');
      ...context.wipLimits,
      ...event.wipLimits,
};
},
'});
// =============================================================================
// BOTTLENECK MANAGEMENT ACTIONS
// =============================================================================
/**
 * Add detected bottleneck
 */
export const addBottleneck = assign(): void {
    ')BOTTLENECK_DETECTED)return context.activeBottlenecks');
    const existingIndex = context.activeBottlenecks.findIndex(): void {
      // Update existing bottleneck
      const updated = [...context.activeBottlenecks];
      updated[existingIndex] = event.bottleneck;
      return updated;
}
    // Add new bottleneck
    return [...context.activeBottlenecks, event.bottleneck];
},
  systemHealth: ({ context, event}) => {
    if (event.type !== 'BOTTLENECK_DETECTED)return context.systemHealth');
    const severity = event.bottleneck.severity;
    const healthImpact =;
      severity ==='critical '? 0.3: severity ===' high '? 0.2: assign(): void {
    ')BOTTLENECK_RESOLVED)return context.activeBottlenecks');
      (b: any) => b.id !== event.bottleneckId
    );
},
  bottleneckHistory: ({ context, event}) => {';
      (b: any) => b.id !== event.bottleneckId
    );
},
  bottleneckHistory: ({ context, event}) => {; 
    if (event.type !== 'BOTTLENECK_RESOLVED)return context.bottleneckHistory');
      (b: any) => b.id === event.bottleneckId
    );
    if (!resolvedBottleneck) return context.bottleneckHistory;
    const historicalBottleneck = {
      ...resolvedBottleneck,
      metadata:  {
        ...resolvedBottleneck.metadata,
        resolvedAt: new Date(): void { context}) => {
    // Improve system health when bottlenecks are resolved
    return Math.min(): void {
      ...resolvedBottleneck,
      metadata:  {
        ...resolvedBottleneck.metadata,
        resolvedAt: new Date(): void { context}) => {
    // Improve system health when bottlenecks are resolved
    return Math.min(): void {
  currentMetrics: ({ context, event}) => {
    ')FLOW_ANALYSIS_COMPLETE)return context.currentMetrics');
},
  metricsHistory: ({ context, event}) => {
    if (event.type !== 'FLOW_ANALYSIS_COMPLETE)return context.metricsHistory');
      timestamp: new Date(): void {
  lastOptimization: ({ event}) => {
    ')OPTIMIZATION_TRIGGERED)return null')OPTIMIZATION_TRIGGERED)return null');
},
  systemHealth: ({ context}) => {
    // Optimization attempts improve system health slightly
    return Math.min(): void {
  systemHealth: ({ context, event}) => {
    ')SYSTEM_HEALTH_UPDATED)return context.systemHealth')});
// =============================================================================
// ERROR HANDLING ACTIONS
// =============================================================================
/**
 * Record system error
 */
export const recordError = assign(): void {
    ')ERROR_OCCURRED)return context.errors');
      timestamp: new Date(): void { context}) => {
    // Errors reduce system health
    return Math.max(): void {
  config: ({ context, event}) => {
    ')CONFIGURATION_UPDATED)return context.config');
      ...context.config,
      ...event.config,
};
},
'});
// =============================================================================
// ACTION REGISTRY
// =============================================================================
/**
 * Complete action registry for XState machine setup
 */
export const workflowActions = {
  // Task management
  addTask,
  moveTask,
  updateTask,
  // WIP management
  recordWIPViolation,
  updateWIPLimits,
  // Bottleneck management
  addBottleneck,
  resolveBottleneck,
  // Flow metrics
  updateFlowMetrics,
  // Optimization
  recordOptimization,
  // System health
  updateSystemHealth,
  // Error handling
  recordError,
  // Configuration;
  updateConfiguration,')} as const;';
