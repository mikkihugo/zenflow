/**
 * @fileoverview Kanban Events and Core Types
 *
 * Core domain types and event definitions for the kanban system.
 * These are the fundamental types that all other components depend on.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
/**
 * Task states in the workflow
 */
export type TaskState = ;
export type TaskPriority = 'critical' | ' high' | ' medium' | ' low'; /**';
 * Optimization strategies for workflow improvement
 */
export type OptimizationStrategy = ;
export interface WIPLimits {
    readonly analysis: number;
    readonly development: number;
    readonly testing: number;
    readonly review: number;
    readonly deployment: number;
    readonly blocked: number;
    readonly done: number;
}
/**
 * Core workflow task
 */
export interface WorkflowTask {
  id: string;
}
/**
 * Workflow bottleneck information
 */
export interface WorkflowBottleneck {
  id: string;
}
/**
 * Flow metrics for performance analysis
 */
export interface FlowMetrics {
    readonly timestamp: Date;
    readonly throughput: number;
    readonly averageCycleTime: number;
    readonly averageLeadTime: number;
    readonly flowEfficiency: number;
    readonly predictability: number;
    readonly qualityIndex: number;
    readonly wipEfficiency: number;
}
/**
 * Workflow kanban configuration
 */
export interface WorkflowKanbanConfig {
    readonly enableIntelligentWIP: boolean;
    readonly enableBottleneckDetection: boolean;
    readonly enableFlowOptimization: boolean;
    readonly enableHealthMonitoring: boolean;
    readonly enableEventSystem: boolean;
    readonly wipLimits: WIPLimits;
    readonly maxConcurrentTasks: number;
    readonly performanceTrackingEnabled: boolean;
}
/**
 * Kanban context for state machines and operations
 */
export interface KanbanContext {
    readonly taskId?: string;
    readonly currentState?: TaskState;
    readonly metadata?: Record<string, any>;
}
/**
 * Event definitions for the kanban system
 */
export interface WorkflowKanbanEvents {
    'kanban: initialized:  {': any;
    timestamp: Date;
    config: WorkflowKanbanConfig;
}
//# sourceMappingURL=events.d.ts.map