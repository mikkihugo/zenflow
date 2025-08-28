/**
 * @fileoverview Workflow Guards - XState Conditional Logic
 *
 * Professional XState guard functions for workflow state transitions.
 * All guards are pure functions that evaluate conditions based on context and events.
 *
 * SINGLE RESPONSIBILITY: Conditional logic for state transitions
 * FOCUSES ON: Business rule evaluation, state transition conditions
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import type { WorkflowEvent } from '../../types/events';
import type { WorkflowMachineContext } from './workflow-context';
import { WorkflowContextUtils } from './workflow-context';
// =============================================================================
// WIP LIMIT GUARDS
// =============================================================================

/**
 * Check if WIP limit would be exceeded by task movement
 */
export const wouldExceedWIPLimit = ({
  context,
  event,
}: {
  context: WorkflowMachineContext;
  event: WorkflowEvent;
}): boolean => {
  if (event.type !== 'TASK_MOVED)return false';
  const currentCount = context.tasksByState[event.toState].length;
  const wipLimit = context.wipLimits[event.toState];

  return currentCount >= wipLimit;
};

/**
 * Check if any WIP limits are currently violated
 */
export const hasWIPViolations = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.wipViolations.length > 0;
};

/**
 * Check if WIP utilization is high across multiple states
 */
export const hasHighWIPUtilization = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  const workStates = [
   'analysis,
   'development,
   'testing,
   'review,
   'deployment,
  ] as const;

  let highUtilizationStates = 0;

  for (const state of workStates) {
    const utilization = WorkflowContextUtils.getWIPUtilization(context, state);
    if (utilization > 0.8) {
      // 80% utilization threshold
      highUtilizationStates++;
    }
  }

  // High utilization if 3 or more states are over 80%
  return highUtilizationStates >= 3;
};

// =============================================================================
// SYSTEM HEALTH GUARDS
// =============================================================================

/**
 * Check if system health is critical (requires immediate attention)
 */
export const isSystemHealthCritical = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.systemHealth < 0.3;
};

/**
 * Check if system health is in warning state
 */
export const isSystemHealthWarning = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.systemHealth >= 0.3 && context.systemHealth < 0.7;
};

/**
 * Check if system health has improved recently
 */
export const isSystemHealthImproving = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  if (context.metricsHistory.length < 2) return false;

  const recent = context.metricsHistory.slice(-2);
  const previous = recent[0];
  const current = recent[1];

  // Consider health improving if it increased by more than 0.1
  return (
    (current.metrics.flowEfficiency|| 0) -
      (previous.metrics.flowEfficiency|| 0) >
    0.1
  );
};

// =============================================================================
// BOTTLENECK DETECTION GUARDS
// =============================================================================

/**
 * Check if there are active bottlenecks
 */
export const hasActiveBottlenecks = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.activeBottlenecks.length > 0;
};

/**
 * Check if there are critical bottlenecks
 */
export const hasCriticalBottlenecks = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.activeBottlenecks.some((b) => b.severity ===critical'');
};

/**
 * Check if bottleneck count is increasing
 */
export const isBottleneckCountIncreasing = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  // Simple heuristic: if we have more than 3 active bottlenecks
  return context.activeBottlenecks.length > 3;
};

// =============================================================================
// OPTIMIZATION GUARDS
// =============================================================================

/**
 * Check if system needs optimization
 */
export const needsOptimization = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  const hasBottlenecks = context.activeBottlenecks.length > 0;
  const hasWIPIssues = context.wipViolations.length > 0;
  const lowHealth = context.systemHealth < 0.7;

  return hasBottlenecks|| hasWIPIssues|| lowHealth;
};

/**
 * Check if optimization was recent (avoid over-optimization)
 */
export const wasRecentlyOptimized = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  if (!context.lastOptimization) return false;

  const hoursSinceOptimization =
    (Date.now() - context.lastOptimization.getTime()) / (1000 * 60 * 60);

  // Consider "recent" if optimized within last 2 hours
  return hoursSinceOptimization < 2;
};

/**
 * Check if emergency optimization is needed
 */
export const needsEmergencyOptimization = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  const criticalHealth = context.systemHealth < 0.2;
  const multipleCriticalBottlenecks =
    context.activeBottlenecks.filter((b) => b.severity ===critical').length >
    1;
  const systemOverloaded =
    WorkflowContextUtils.calculateSystemUtilization(context) > 0.95;

  return criticalHealth|| multipleCriticalBottlenecks|| systemOverloaded;
};

// =============================================================================
// CONFIGURATION GUARDS
// =============================================================================

/**
 * Check if real-time monitoring is enabled
 */
export const isRealTimeMonitoringEnabled = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.config.enableRealTimeMonitoring;
};

/**
 * Check if bottleneck detection is enabled
 */
export const isBottleneckDetectionEnabled = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.config.enableBottleneckDetection;
};

/**
 * Check if flow optimization is enabled
 */
export const isFlowOptimizationEnabled = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.config.enableFlowOptimization;
};

/**
 * Check if predictive analytics is enabled
 */
export const isPredictiveAnalyticsEnabled = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  return context.config.enablePredictiveAnalytics|| false;
};

// =============================================================================
// TASK FLOW GUARDS
// =============================================================================

/**
 * Check if task movement is valid workflow progression
 */
export const isValidWorkflowProgression = ({
  context,
  event,
}: {
  context: WorkflowMachineContext;
  event: WorkflowEvent;
}): boolean => {
  if (event.type !==TASK_MOVED)return false';
  // Special states can transition to/from any state
  const specialStates = ['blocked,'expedite];
  if (
    specialStates.includes(event.fromState)|| specialStates.includes(event.toState)
  ) {
    return true;
  }

  // Define valid workflow progression
  const workflowOrder = ['backlog,
   'analysis,
   'development,
   'testing,
   'review,
   'deployment,
   'done,
  ];
  const fromIndex = workflowOrder.indexOf(event.fromState);
  const toIndex = workflowOrder.indexOf(event.toState);

  if (fromIndex === -1|| toIndex === -1) {
    return false;
  }

  // Allow forward movement, backward movement (rework), or staying in same state
  // But limit backward movement to prevent excessive thrashing
  return Math.abs(toIndex - fromIndex) <= 2|| toIndex >= fromIndex;
};

/**
 * Check if task has dependencies that are not completed
 */
export const hasUnresolvedDependencies = ({
  context,
  event,
}: {
  context: WorkflowMachineContext;
  event: WorkflowEvent;
}): boolean => {
  if (event.type !==TASK_MOVED)return false';
  const task = context.tasks[event.taskId];
  if (!task|| !task.dependencies|| task.dependencies.length === 0) {
    return false;
  }

  // Check if any dependencies are not in'done'state
  return task.dependencies.some((depId) => {
    const depTask = context.tasks[depId];
    return !depTask|| depTask.state !==done';
  });
};

// =============================================================================
// TIME-BASED GUARDS
// =============================================================================

/**
 * Check if it's time for periodic analysis
 */
export const isTimeForPeriodicAnalysis = ({
  context,
}: {
  context: WorkflowMachineContext;
}): boolean => {
  if (!context.currentMetrics) return true; // First analysis

  const lastAnalysis =
    context.metricsHistory[context.metricsHistory.length - 1];
  if (!lastAnalysis) return true;

  const timeSinceLastAnalysis = Date.now() - lastAnalysis.timestamp.getTime();
  const analysisInterval = context.config.optimizationAnalysisInterval;

  return timeSinceLastAnalysis >= analysisInterval;
};

// =============================================================================
// GUARD REGISTRY
// =============================================================================

/**
 * Complete guard registry for XState machine setup
 */
export const workflowGuards = {
  // WIP limits
  wouldExceedWIPLimit,
  hasWIPViolations,
  hasHighWIPUtilization,

  // System health
  isSystemHealthCritical,
  isSystemHealthWarning,
  isSystemHealthImproving,

  // Bottlenecks
  hasActiveBottlenecks,
  hasCriticalBottlenecks,
  isBottleneckCountIncreasing,

  // Optimization
  needsOptimization,
  wasRecentlyOptimized,
  needsEmergencyOptimization,

  // Configuration
  isRealTimeMonitoringEnabled,
  isBottleneckDetectionEnabled,
  isFlowOptimizationEnabled,
  isPredictiveAnalyticsEnabled,

  // Task flow
  isValidWorkflowProgression,
  hasUnresolvedDependencies,

  // Time-based
  isTimeForPeriodicAnalysis,
} as const;
