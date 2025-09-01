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
export type TaskState = 'todo' | 'in-progress' | 'review' | 'done';
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
severity: 'low';

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
taskId: string;
}
/**
* WIP limit exceeded event
*/
export interface WIPLimitExceededEvent {
type: 'WIP_LIMIT_EXCEEDED';
state: TaskState;
wipLimits: Partial<WIPLimits>;
}
/**
* Bottleneck detected event
*/
export interface BottleneckDetectedEvent {
type: 'BOTTLENECK_DETECTED';
bottleneck: WorkflowBottleneck;
bottleneckId: string;
}
/**
* Flow analysis completed event
*/
export interface FlowAnalysisCompleteEvent {
type: 'FLOW_ANALYSIS_COMPLETE';
metrics: FlowMetrics;
strategy: OptimizationStrategy;
triggeredBy: 'manual' | 'automatic' | 'emergency';
timestamp: Date;
}
/**
* System health updated event
*/
export interface SystemHealthUpdatedEvent {
type: 'SYSTEM_HEALTH_UPDATED';
health: any;
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
reason?: string;
timestamp: Date;
}
/**
* Complete union type for all workflow events
*
* This type ensures type safety across all XState event handlers
* and provides comprehensive event payload validation.
*/
export type WorkflowEvent =
  | TaskCreatedEvent
  | WIPLimitExceededEvent
  | BottleneckDetectedEvent
  | FlowAnalysisCompleteEvent
  | SystemHealthUpdatedEvent
  | ConfigurationUpdatedEvent
  | ErrorOccurredEvent
  | RestartSystemEvent;
/**
* Event creation utilities for type-safe event construction
*/
export declare class WorkflowEventUtils {
/**
* Create task created event
*/
static createTaskCreated(task: WorkflowTask): TaskCreatedEvent;

}
//# sourceMappingURL=events.d.ts.map