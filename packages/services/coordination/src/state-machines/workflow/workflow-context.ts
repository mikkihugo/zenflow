/**
 * @fileoverview Workflow Machine Context - XState Context Management
 *
 * Professional context definition and initialization for workflow coordination.
 * Defines the complete state structure for XState workflow management.
 *
 * SINGLE RESPONSIBILITY: Context management and initialization
 * FOCUSES ON: State structure, initial values, context utilities
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type {
  FlowMetrics,
  OptimizationStrategy,
  TaskState,
  WIPLimits,
  WorkflowBottleneck,
  WorkflowKanbanConfig,
  WorkflowTask,
} from '../../kanban/types/index')// ============================================================================ = ';
// XSTATE MACHINE CONTEXT DEFINITION
// =============================================================================
/**
 * XState machine context for workflow coordination
 *
 * Complete state structure containing all coordination data: * - Task management and indexing
 * - WIP limit tracking and violations
 * - Bottleneck detection and history
 * - Flow metrics and analytics
 * - System health monitoring
 * - Error tracking and recovery
 */
export interface WorkflowMachineContext {
  // Task management;
  tasks: Record<string, WorkflowTask>;
  tasksByState: Record<TaskState, string[]>;
  // WIP management
  wipLimits: WIPLimits;
  wipViolations: Array<{
    state: TaskState;
    count: number;
    limit: number;
    timestamp: Date;
}>;
  // Bottleneck detection
  activeBottlenecks: WorkflowBottleneck[];
  bottleneckHistory: WorkflowBottleneck[];
  // Flow metrics
  currentMetrics: FlowMetrics| null;
  metricsHistory: Array<{ timestamp: Date; metrics: FlowMetrics}>;
  // System status
  systemHealth: number; // 0-1 range
  lastOptimization: Date| null;
  optimizationStrategy: OptimizationStrategy| null;
  // Configuration
  config: WorkflowKanbanConfig;
  // Error handling
  errors: Array<{
    timestamp: Date;
    error: string;
    context: string;
}>'; 
}
// =============================================================================
// CONTEXT INITIALIZATION
// =============================================================================
/**
 * Create initial workflow machine context with safe defaults
 */
export const createInitialContext = (
  config: WorkflowKanbanConfig
):WorkflowMachineContext => ({
  // Initialize task management structures
  tasks:{},
  tasksByState: {
    backlog:[],
    analysis: [],
    development: [],
    testing: [],
    review: [],
    deployment: [],
    done: [],
    blocked: [],
    expedite: [],
},
  // Initialize WIP management
  wipLimits: { ...config.defaultWIPLimits},
  wipViolations: [],
  // Initialize bottleneck tracking
  activeBottlenecks: [],
  bottleneckHistory: [],
  // Initialize flow metrics
  currentMetrics: null,
  metricsHistory: [],
  // Initialize system health (start optimistic)
  systemHealth: 1.0,
  lastOptimization: null,
  optimizationStrategy: null,
  // Store configuration
  config: { ...config},
  // Initialize error tracking
  errors: [],
'});
// =============================================================================
// CONTEXT UTILITIES
// =============================================================================
/**
 * Context utility functions for safe state access
 */
export class WorkflowContextUtils {
  /**
   * Get task count for specific state
   */
  static getTaskCountForState(
    context: WorkflowContextUtils.getTaskCountForState(
      context,
      state;
    );
    const limit = context.wipLimits[state];
    return limit > 0 ? currentCount / limit: 1
  ):boolean {
    const currentCount = WorkflowContextUtils.getTaskCountForState(
      context,
      state;
    );
    const limit = context.wipLimits[state];
    return currentCount + additionalTasks > limit;
}
  /**
   * Get system health category
   */
  static getSystemHealthCategory(
    health: number')  ):'excellent| good| warning| critical '{';
    if (health >= 0.9) return'excellent')    if (health >= 0.7) return'good')    if (health >= 0.3) return'warning')    return'critical')};;
  /**
   * Get recent errors (last N errors)
   */
  static getRecentErrors(
    context: 5
  ):Array<{ timestamp: [
     'analysis,')     'development,';
     'testing,')     'review,';
     'deployment,';
];
    let totalUtilization = 0;
    let stateCount = 0;
    for (const state of workStates) {
      const utilization = WorkflowContextUtils.getWIPUtilization(
        context,
        state;
      );
      totalUtilization += Math.min(1, utilization); // Cap at 100%
      stateCount++;
}
    return stateCount > 0 ? totalUtilization / stateCount: 0;
};)};;
