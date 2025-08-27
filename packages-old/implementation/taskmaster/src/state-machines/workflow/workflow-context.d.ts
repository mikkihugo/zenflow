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
import type { FlowMetrics, OptimizationStrategy, TaskState, WIPLimits, WorkflowBottleneck, WorkflowKanbanConfig, WorkflowTask } from '../../types/index';
/**
 * XState machine context for workflow coordination
 *
 * Complete state structure containing all coordination data:
 * - Task management and indexing
 * - WIP limit tracking and violations
 * - Bottleneck detection and history
 * - Flow metrics and analytics
 * - System health monitoring
 * - Error tracking and recovery
 */
export interface WorkflowMachineContext {
    tasks: Record<string, WorkflowTask>;
    tasksByState: Record<TaskState, string[]>;
    wipLimits: WIPLimits;
    wipViolations: Array<{
        state: TaskState;
        count: number;
        limit: number;
        timestamp: Date;
    }>;
    activeBottlenecks: WorkflowBottleneck[];
    bottleneckHistory: WorkflowBottleneck[];
    currentMetrics: FlowMetrics | null;
    metricsHistory: Array<{
        timestamp: Date;
        metrics: FlowMetrics;
    }>;
    systemHealth: number;
    lastOptimization: Date | null;
    optimizationStrategy: OptimizationStrategy | null;
    config: WorkflowKanbanConfig;
    errors: Array<{
        timestamp: Date;
        error: string;
        context: string;
    }>;
}
/**
 * Create initial workflow machine context with safe defaults
 */
export declare const createInitialContext: (config: WorkflowKanbanConfig) => WorkflowMachineContext;
/**
 * Context utility functions for safe state access
 */
export declare class WorkflowContextUtils {
    /**
     * Get task count for specific state
     */
    static getTaskCountForState(context: WorkflowMachineContext, state: TaskState): number;
    /**
     * Get WIP utilization for specific state
     */
    static getWIPUtilization(context: WorkflowMachineContext, state: TaskState): number;
    /**
     * Check if WIP limit would be exceeded
     */
    static wouldExceedWIPLimit(context: WorkflowMachineContext, state: TaskState, additionalTasks?: number): boolean;
    /**
     * Get system health category
     */
    static getSystemHealthCategory(health: number): 'excellent|good|warning|critical';
    /**
     * Get recent errors (last N errors)
     */
    static getRecentErrors(context: WorkflowMachineContext, count?: number): Array<{
        timestamp: Date;
        error: string;
        context: string;
    }>;
    /**
     * Calculate overall system utilization
     */
    static calculateSystemUtilization(context: WorkflowMachineContext): number;
}
//# sourceMappingURL=workflow-context.d.ts.map