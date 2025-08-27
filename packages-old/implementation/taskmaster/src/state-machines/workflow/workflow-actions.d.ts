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
/**
 * Add new task to workflow context
 */
export declare const addTask: any;
/**
 * Move task between workflow states
 */
export declare const moveTask: any;
/**
 * Update task properties
 */
export declare const updateTask: any;
/**
 * Record WIP limit violation
 */
export declare const recordWIPViolation: any;
/**
 * Update WIP limits
 */
export declare const updateWIPLimits: any;
/**
 * Add detected bottleneck
 */
export declare const addBottleneck: any;
/**
 * Remove resolved bottleneck
 */
export declare const resolveBottleneck: any;
/**
 * Update flow metrics
 */
export declare const updateFlowMetrics: any;
/**
 * Record optimization attempt
 */
export declare const recordOptimization: any;
/**
 * Update system health directly
 */
export declare const updateSystemHealth: any;
/**
 * Record system error
 */
export declare const recordError: any;
/**
 * Update system configuration
 */
export declare const updateConfiguration: any;
/**
 * Complete action registry for XState machine setup
 */
export declare const workflowActions: {
    readonly addTask: any;
    readonly moveTask: any;
    readonly updateTask: any;
    readonly recordWIPViolation: any;
    readonly updateWIPLimits: any;
    readonly addBottleneck: any;
    readonly resolveBottleneck: any;
    readonly updateFlowMetrics: any;
    readonly recordOptimization: any;
    readonly updateSystemHealth: any;
    readonly recordError: any;
    readonly updateConfiguration: any;
};
//# sourceMappingURL=workflow-actions.d.ts.map