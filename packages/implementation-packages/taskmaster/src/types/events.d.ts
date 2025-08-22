/**
 * @fileoverview Workflow Events - XState Event Definitions
 *
 * Professional type-safe event definitions for XState workflow coordination.
 * All events are strongly typed with payload validation.
 *
 * SINGLE RESPONSIBILITY: Event type definitions
 * FOCUSES ON: Type safety, event payloads, XState integration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
export type TaskState = 'backlog' | 'analysis' | 'development' | 'testing' | 'review' | 'done' | 'blocked';
export type OptimizationStrategy = 'wip_reduction' | 'bottleneck_removal' | 'parallel_processing' | 'load_balancing' | 'priority_queue' | 'resource_allocation';
export interface WorkflowTask {
    id: string;
    title: string;
    description?: string;
    state: TaskState;
    priority: number;
    assignee?: string;
    createdAt: number;
    updatedAt: number;
}
export interface FlowMetrics {
    throughput: number;
    leadTime: number;
    cycleTime: number;
    wipCount: number;
}
export interface WIPLimits {
    analysis: number;
    development: number;
    testing: number;
    review: number;
}
export interface WorkflowBottleneck {
    state: TaskState;
    count: number;
    severity: 'low' | 'medium' | 'high';
}
export interface WorkflowKanbanConfig {
    wipLimits: WIPLimits;
    enableMetrics: boolean;
    enableBottleneckDetection: boolean;
}
/**
 * Task created event - new task added to workflow
 */
export interface TaskCreatedEvent {
    type: 'TASK_CREATED';
    task: WorkflowTask;
}
/**
 * Task moved between states event
 */
export interface TaskMovedEvent {
    type: 'TASK_MOVED';
    taskId: string;
    fromState: TaskState;
    toState: TaskState;
    reason?: string;
}
/**
 * Task updated event - properties changed
 */
export interface TaskUpdatedEvent {
    type: 'TASK_UPDATED';
    taskId: string;
    updates: Partial<WorkflowTask>;
}
/**
 * Task completed event - moved to done state
 */
export interface TaskCompletedEvent {
    type: 'TASK_COMPLETED';
    taskId: string;
    completedAt: Date;
    duration?: number;
}
/**
 * Task blocked event - moved to blocked state
 */
export interface TaskBlockedEvent {
    type: 'TASK_BLOCKED';
    taskId: string;
    reason: string;
    blockedAt: Date;
}
/**
 * WIP limit exceeded event
 */
export interface WIPLimitExceededEvent {
    type: 'WIP_LIMIT_EXCEEDED';
    state: TaskState;
    count: number;
    limit: number;
}
/**
 * WIP limits updated event
 */
export interface WIPLimitsUpdatedEvent {
    type: 'WIP_LIMITS_UPDATED';
    wipLimits: Partial<WIPLimits>;
}
/**
 * Bottleneck detected event
 */
export interface BottleneckDetectedEvent {
    type: 'BOTTLENECK_DETECTED';
    bottleneck: WorkflowBottleneck;
}
/**
 * Bottleneck resolved event
 */
export interface BottleneckResolvedEvent {
    type: 'BOTTLENECK_RESOLVED';
    bottleneckId: string;
    resolvedAt: Date;
}
/**
 * Flow analysis completed event
 */
export interface FlowAnalysisCompleteEvent {
    type: 'FLOW_ANALYSIS_COMPLETE';
    metrics: FlowMetrics;
    analysisId: string;
    timestamp: Date;
}
/**
 * Optimization triggered event
 */
export interface OptimizationTriggeredEvent {
    type: 'OPTIMIZATION_TRIGGERED';
    strategy: OptimizationStrategy;
    triggeredBy: 'manual' | 'automatic' | 'emergency';
    timestamp: Date;
}
/**
 * System health updated event
 */
export interface SystemHealthUpdatedEvent {
    type: 'SYSTEM_HEALTH_UPDATED';
    health: number;
    previousHealth: number;
    timestamp: Date;
}
/**
 * System health check event
 */
export interface SystemHealthCheckEvent {
    type: 'SYSTEM_HEALTH_CHECK';
    timestamp: Date;
}
/**
 * Configuration updated event
 */
export interface ConfigurationUpdatedEvent {
    type: 'CONFIGURATION_UPDATED';
    config: Partial<WorkflowKanbanConfig>;
    updatedBy: string;
    timestamp: Date;
}
/**
 * Error occurred event
 */
export interface ErrorOccurredEvent {
    type: 'ERROR_OCCURRED';
    error: string;
    errorContext: string;
    timestamp: Date;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * System restart event
 */
export interface RestartSystemEvent {
    type: 'RESTART_SYSTEM';
    reason: string;
    timestamp: Date;
}
/**
 * Enter maintenance mode event
 */
export interface EnterMaintenanceEvent {
    type: 'ENTER_MAINTENANCE';
    reason: string;
    estimatedDuration?: number;
    timestamp: Date;
}
/**
 * Resume operations event
 */
export interface ResumeOperationEvent {
    type: 'RESUME_OPERATION';
    timestamp: Date;
}
/**
 * Pause operation event
 */
export interface PauseOperationEvent {
    type: 'PAUSE_OPERATION';
    reason?: string;
    timestamp: Date;
}
/**
 * Optimization complete event
 */
export interface OptimizationCompleteEvent {
    type: 'OPTIMIZATION_COMPLETE';
    strategy: string;
    results: Record<string, unknown>;
    timestamp: Date;
}
/**
 * Retry operation event
 */
export interface RetryOperationEvent {
    type: 'RETRY_OPERATION';
    reason?: string;
    timestamp: Date;
}
/**
 * Complete union type for all workflow events
 *
 * This type ensures type safety across all XState event handlers
 * and provides comprehensive event payload validation.
 */
export type WorkflowEvent = TaskCreatedEvent | TaskMovedEvent | TaskUpdatedEvent | TaskCompletedEvent | TaskBlockedEvent | WIPLimitExceededEvent | WIPLimitsUpdatedEvent | BottleneckDetectedEvent | BottleneckResolvedEvent | FlowAnalysisCompleteEvent | OptimizationTriggeredEvent | SystemHealthUpdatedEvent | SystemHealthCheckEvent | ConfigurationUpdatedEvent | ErrorOccurredEvent | RestartSystemEvent | EnterMaintenanceEvent | ResumeOperationEvent | PauseOperationEvent | OptimizationCompleteEvent | RetryOperationEvent;
/**
 * Event creation utilities for type-safe event construction
 */
export declare class WorkflowEventUtils {
    /**
     * Create task created event
     */
    static createTaskCreated(task: WorkflowTask): TaskCreatedEvent;
    /**
     * Create task moved event
     */
    static createTaskMoved(taskId: string, fromState: TaskState, toState: TaskState, reason?: string): TaskMovedEvent;
    /**
     * Create bottleneck detected event
     */
    static createBottleneckDetected(bottleneck: WorkflowBottleneck): BottleneckDetectedEvent;
    /**
     * Create system health updated event
     */
    static createSystemHealthUpdated(health: number, previousHealth: number): SystemHealthUpdatedEvent;
    /**
     * Create error occurred event
     */
    static createErrorOccurred(error: string, errorContext: string, severity?: 'low' | 'medium' | 'high' | 'critical'): ErrorOccurredEvent;
    /**
     * Create configuration updated event
     */
    static createConfigurationUpdated(config: Partial<WorkflowKanbanConfig>, updatedBy: string): ConfigurationUpdatedEvent;
}
