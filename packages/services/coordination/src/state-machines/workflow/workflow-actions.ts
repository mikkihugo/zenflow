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

import { assign } from 'xstate';
// =============================================================================
// TASK MANAGEMENT ACTIONS
// =============================================================================

/**
 * Add new task to workflow context
 */
export const addTask = assign({
  tasks: ({ context, event }) => {
    if (event.type !== 'TASK_CREATED)return context.tasks';
    return {
      ...context.tasks,
      [event.task.id]: event.task,
    };
  },

  tasksByState: ({ context, event }) => {
    if (event.type !== 'TASK_CREATED)return context.tasksByState';
    const state = event.task.state;
    return {
      ...context.tasksByState,
      [state]: [...context.tasksByState[state], event.task.id],
    };
  },
});

/**
 * Move task between workflow states
 */
export const moveTask = assign({
  tasks: ({ context, event }) => {
    if (event.type !== 'TASK_MOVED)return context.tasks';
    const task = context.tasks[event.taskId];
    if (!task) return context.tasks;

    return {
      ...context.tasks,
      [event.taskId]: {
        ...task,
        state: event.toState,
        updatedAt: new Date(),
      },
    };
  },

  tasksByState: ({ context, event }) => {
    if (event.type !== 'TASK_MOVED)return context.tasksByState';
    return {
      ...context.tasksByState,
      [event.fromState]: context.tasksByState[event.fromState].filter(
        (id: string) => id !== event.taskId
      ),
      [event.toState]: [...context.tasksByState[event.toState], event.taskId],
    };
  },
});

/**
 * Update task properties
 */
export const updateTask = assign({
  tasks: ({ context, event }) => {
    if (event.type !== 'TASK_UPDATED)return context.tasks';
    const task = context.tasks[event.taskId];
    if (!task) return context.tasks;

    return {
      ...context.tasks,
      [event.taskId]: {
        ...task,
        ...event.updates,
        updatedAt: new Date(),
      },
    };
  },
});

// =============================================================================
// WIP MANAGEMENT ACTIONS
// =============================================================================

/**
 * Record WIP limit violation
 */
export const recordWIPViolation = assign({
  wipViolations: ({ context, event }) => {
    if (event.type !== 'WIP_LIMIT_EXCEEDED)return context.wipViolations';
    const violation = {
      state: event.state,
      count: event.count,
      limit: context.wipLimits[event.state],
      timestamp: new Date(),
    };

    // Keep last 10 violations
    return [...context.wipViolations.slice(-9), violation];
  },

  systemHealth: ({ context, event }) => {
    if (event.type !== 'WIP_LIMIT_EXCEEDED)return context.systemHealth';
    // Reduce system health on WIP violations
    return Math.max(0, context.systemHealth - 0.1);
  },
});

/**
 * Update WIP limits
 */
export const updateWIPLimits = assign({
  wipLimits: ({ context, event }) => {
    if (event.type !== 'WIP_LIMITS_UPDATED)return context.wipLimits';
    return {
      ...context.wipLimits,
      ...event.wipLimits,
    };
  },
});

// =============================================================================
// BOTTLENECK MANAGEMENT ACTIONS
// =============================================================================

/**
 * Add detected bottleneck
 */
export const addBottleneck = assign({
  activeBottlenecks: ({ context, event }) => {
    if (event.type !== 'BOTTLENECK_DETECTED)return context.activeBottlenecks';
    // Check if bottleneck already exists
    const existingIndex = context.activeBottlenecks.findIndex(
      (b: any) => b.id === event.bottleneck.id
    );

    if (existingIndex >= 0) {
      // Update existing bottleneck
      const updated = [...context.activeBottlenecks];
      updated[existingIndex] = event.bottleneck;
      return updated;
    }

    // Add new bottleneck
    return [...context.activeBottlenecks, event.bottleneck];
  },

  systemHealth: ({ context, event }) => {
    if (event.type !== 'BOTTLENECK_DETECTED)return context.systemHealth';
    // Reduce system health based on bottleneck severity
    const severity = event.bottleneck.severity;
    const healthImpact =
      severity ==='critical '? 0.3 : severity ==='high '? 0.2 : 0.1';
    return Math.max(0, context.systemHealth - healthImpact);
  },
});

/**
 * Remove resolved bottleneck
 */
export const resolveBottleneck = assign({
  activeBottlenecks: ({ context, event }) => {
    if (event.type !== 'BOTTLENECK_RESOLVED)return context.activeBottlenecks';
    return context.activeBottlenecks.filter(
      (b: any) => b.id !== event.bottleneckId
    );
  },

  bottleneckHistory: ({ context, event }) => {
    if (event.type !== 'BOTTLENECK_RESOLVED)return context.bottleneckHistory';
    const resolvedBottleneck = context.activeBottlenecks.find(
      (b: any) => b.id === event.bottleneckId
    );

    if (!resolvedBottleneck) return context.bottleneckHistory;

    const historicalBottleneck = {
      ...resolvedBottleneck,
      metadata: {
        ...resolvedBottleneck.metadata,
        resolvedAt: new Date(),
      },
    };

    // Keep last 50 resolved bottlenecks
    return [...context.bottleneckHistory.slice(-49), historicalBottleneck];
  },

  systemHealth: ({ context }) => {
    // Improve system health when bottlenecks are resolved
    return Math.min(1.0, context.systemHealth + 0.1);
  },
});

// =============================================================================
// FLOW METRICS ACTIONS
// =============================================================================

/**
 * Update flow metrics
 */
export const updateFlowMetrics = assign({
  currentMetrics: ({ context, event }) => {
    if (event.type !== 'FLOW_ANALYSIS_COMPLETE)return context.currentMetrics';
    return event.metrics;
  },

  metricsHistory: ({ context, event }) => {
    if (event.type !== 'FLOW_ANALYSIS_COMPLETE)return context.metricsHistory';
    const historyEntry = {
      timestamp: new Date(),
      metrics: event.metrics,
    };

    // Keep last 100 metric snapshots
    return [...context.metricsHistory.slice(-99), historyEntry];
  },
});

// =============================================================================
// OPTIMIZATION ACTIONS
// =============================================================================

/**
 * Record optimization attempt
 */
export const recordOptimization = assign({
  lastOptimization: ({ event }) => {
    if (event.type !== 'OPTIMIZATION_TRIGGERED)return null';
    return new Date();
  },

  optimizationStrategy: ({ event }) => {
    if (event.type !== 'OPTIMIZATION_TRIGGERED)return null';
    return event.strategy;
  },

  systemHealth: ({ context }) => {
    // Optimization attempts improve system health slightly
    return Math.min(1.0, context.systemHealth + 0.05);
  },
});

// =============================================================================
// SYSTEM HEALTH ACTIONS
// =============================================================================

/**
 * Update system health directly
 */
export const updateSystemHealth = assign({
  systemHealth: ({ context, event }) => {
    if (event.type !== 'SYSTEM_HEALTH_UPDATED)return context.systemHealth';
    return Math.max(0, Math.min(1.0, event.health);
  },
});

// =============================================================================
// ERROR HANDLING ACTIONS
// =============================================================================

/**
 * Record system error
 */
export const recordError = assign({
  errors: ({ context, event }) => {
    if (event.type !== 'ERROR_OCCURRED)return context.errors';
    const errorEntry = {
      timestamp: new Date(),
      error: event.error,
      context: event.errorContext,
    };

    // Keep last 20 errors
    return [...context.errors.slice(-19), errorEntry];
  },

  systemHealth: ({ context }) => {
    // Errors reduce system health
    return Math.max(0, context.systemHealth - 0.05);
  },
});

// =============================================================================
// CONFIGURATION ACTIONS
// =============================================================================

/**
 * Update system configuration
 */
export const updateConfiguration = assign({
  config: ({ context, event }) => {
    if (event.type !== 'CONFIGURATION_UPDATED)return context.config';
    return {
      ...context.config,
      ...event.config,
    };
  },
});

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

  // Configuration
  updateConfiguration,
} as const;
