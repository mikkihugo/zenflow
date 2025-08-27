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
/**
 * Check if WIP limit would be exceeded by task movement
 */
export declare const wouldExceedWIPLimit: ({ context, event, }: {
    context: WorkflowMachineContext;
    event: WorkflowEvent;
}) => boolean;
/**
 * Check if any WIP limits are currently violated
 */
export declare const hasWIPViolations: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if WIP utilization is high across multiple states
 */
export declare const hasHighWIPUtilization: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if system health is critical (requires immediate attention)
 */
export declare const isSystemHealthCritical: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if system health is in warning state
 */
export declare const isSystemHealthWarning: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if system health has improved recently
 */
export declare const isSystemHealthImproving: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if there are active bottlenecks
 */
export declare const hasActiveBottlenecks: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if there are critical bottlenecks
 */
export declare const hasCriticalBottlenecks: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if bottleneck count is increasing
 */
export declare const isBottleneckCountIncreasing: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if system needs optimization
 */
export declare const needsOptimization: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if optimization was recent (avoid over-optimization)
 */
export declare const wasRecentlyOptimized: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if emergency optimization is needed
 */
export declare const needsEmergencyOptimization: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if real-time monitoring is enabled
 */
export declare const isRealTimeMonitoringEnabled: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if bottleneck detection is enabled
 */
export declare const isBottleneckDetectionEnabled: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if flow optimization is enabled
 */
export declare const isFlowOptimizationEnabled: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if predictive analytics is enabled
 */
export declare const isPredictiveAnalyticsEnabled: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Check if task movement is valid workflow progression
 */
export declare const isValidWorkflowProgression: ({ context, event, }: {
    context: WorkflowMachineContext;
    event: WorkflowEvent;
}) => boolean;
/**
 * Check if task has dependencies that are not completed
 */
export declare const hasUnresolvedDependencies: ({ context, event, }: {
    context: WorkflowMachineContext;
    event: WorkflowEvent;
}) => boolean;
/**
 * Check if it's time for periodic analysis'
 */
export declare const isTimeForPeriodicAnalysis: ({ context, }: {
    context: WorkflowMachineContext;
}) => boolean;
/**
 * Complete guard registry for XState machine setup
 */
export declare const workflowGuards: {
    readonly wouldExceedWIPLimit: ({ context, event, }: {
        context: WorkflowMachineContext;
        event: WorkflowEvent;
    }) => boolean;
    readonly hasWIPViolations: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly hasHighWIPUtilization: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isSystemHealthCritical: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isSystemHealthWarning: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isSystemHealthImproving: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly hasActiveBottlenecks: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly hasCriticalBottlenecks: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isBottleneckCountIncreasing: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly needsOptimization: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly wasRecentlyOptimized: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly needsEmergencyOptimization: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isRealTimeMonitoringEnabled: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isBottleneckDetectionEnabled: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isFlowOptimizationEnabled: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isPredictiveAnalyticsEnabled: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
    readonly isValidWorkflowProgression: ({ context, event, }: {
        context: WorkflowMachineContext;
        event: WorkflowEvent;
    }) => boolean;
    readonly hasUnresolvedDependencies: ({ context, event, }: {
        context: WorkflowMachineContext;
        event: WorkflowEvent;
    }) => boolean;
    readonly isTimeForPeriodicAnalysis: ({ context, }: {
        context: WorkflowMachineContext;
    }) => boolean;
};
//# sourceMappingURL=workflow-guards.d.ts.map