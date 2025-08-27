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
// =============================================================================
// CONTEXT INITIALIZATION
// =============================================================================
/**
 * Create initial workflow machine context with safe defaults
 */
export const createInitialContext = (config) => ({
    // Initialize task management structures
    tasks: {},
    tasksByState: {
        backlog: [],
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
    wipLimits: { ...config.defaultWIPLimits },
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
    config: { ...config },
    // Initialize error tracking
    errors: [],
});
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
    static getTaskCountForState(context, state) {
        return context.tasksByState[state]?.length || 0;
    }
    /**
     * Get WIP utilization for specific state
     */
    static getWIPUtilization(context, state) {
        const currentCount = WorkflowContextUtils.getTaskCountForState(context, state);
        const limit = context.wipLimits[state];
        return limit > 0 ? currentCount / limit : 0;
    }
    /**
     * Check if WIP limit would be exceeded
     */
    static wouldExceedWIPLimit(context, state, additionalTasks = 1) {
        const currentCount = WorkflowContextUtils.getTaskCountForState(context, state);
        const limit = context.wipLimits[state];
        return currentCount + additionalTasks > limit;
    }
    /**
     * Get system health category
     */
    static getSystemHealthCategory(health) {
        ';
        if (health >= 0.9)
            return 'excellent;;
        if (health >= 0.7)
            return 'good;;
        if (health >= 0.3)
            return 'warning;;
        return 'critical;;
    }
    /**
     * Get recent errors (last N errors)
     */
    static getRecentErrors(context, count = 5) {
        return context.errors.slice(-count);
    }
    /**
     * Calculate overall system utilization
     */
    static calculateSystemUtilization(context) {
        const workStates = [
            'analysis',
            'development',
            'testing',
            'review',
            'deployment',
        ];
        let totalUtilization = 0;
        let stateCount = 0;
        for (const state of workStates) {
            const utilization = WorkflowContextUtils.getWIPUtilization(context, state);
            totalUtilization += Math.min(1, utilization); // Cap at 100%
            stateCount++;
        }
        return stateCount > 0 ? totalUtilization / stateCount : 0;
    }
}
