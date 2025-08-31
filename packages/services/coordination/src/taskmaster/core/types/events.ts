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
// Local type definitions to avoid circular dependency
export type TaskState =;
 'backlog' | ' analysis'|' development' | ' testing'|' review' | ' done'|' blocked')wip_reduction' | ' bottleneck_removal'|' parallel_processing' | ' load_balancing'|' priority_queue' | ' resource_allocation');
  id: string;
  title: string;
  description?:string;
  state: TaskState;
  priority: number;
  assignee?:string;
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
  severity: low' | ' medium'|' high')TASK_CREATED')TASK_MOVED',)  taskId: 'TASK_UPDATED',)  taskId: 'TASK_COMPLETED',)  taskId: 'TASK_BLOCKED',)  taskId: string;
  reason: string;
  blockedAt: Date;
}
// =============================================================================
// WIP MANAGEMENT EVENTS
// =============================================================================
/**
 * WIP limit exceeded event
 */
export interface WIPLimitExceededEvent {
  type : 'WIP_LIMIT_EXCEEDED')WIP_LIMITS_UPDATED',)  wipLimits: Partial<WIPLimits>;
}
// =============================================================================
// BOTTLENECK MANAGEMENT EVENTS
// =============================================================================
/**
 * Bottleneck detected event
 */
export interface BottleneckDetectedEvent {
  type : 'BOTTLENECK_DETECTED')BOTTLENECK_RESOLVED',)  bottleneckId: string;
  resolvedAt: Date;
}
// =============================================================================
// FLOW ANALYSIS EVENTS
// =============================================================================
/**
 * Flow analysis completed event
 */
export interface FlowAnalysisCompleteEvent {
  type : 'FLOW_ANALYSIS_COMPLETE')OPTIMIZATION_TRIGGERED',)  strategy: OptimizationStrategy;
  triggeredBy : 'manual' | ' automatic'|' emergency')SYSTEM_HEALTH_UPDATED')SYSTEM_HEALTH_CHECK',)  timestamp: Date;
}
// =============================================================================
// CONFIGURATION EVENTS
// =============================================================================
/**
 * Configuration updated event
 */
export interface ConfigurationUpdatedEvent {
  type : 'CONFIGURATION_UPDATED')ERROR_OCCURRED')low| medium| high' | ' critical')RESTART_SYSTEM')ENTER_MAINTENANCE',)  reason: 'RESUME_OPERATION',)  timestamp: 'PAUSE_OPERATION',)  reason?:string;';
  timestamp: 'OPTIMIZATION_COMPLETE',)  strategy: 'RETRY_OPERATION',)  reason?:string;';
  timestamp: Date;
}
// =============================================================================
// WORKFLOW EVENT UNION TYPE
// =============================================================================
/**
 * Complete union type for all workflow events
 *
 * This type ensures type safety across all XState event handlers
 * and provides comprehensive event payload validation.
 */
export type WorkflowEvent =;
  // Task management| TaskCreatedEvent| TaskMovedEvent| TaskUpdatedEvent| TaskCompletedEvent| TaskBlockedEvent
  // WIP management| WIPLimitExceededEvent| WIPLimitsUpdatedEvent
  // Bottleneck management| BottleneckDetectedEvent| BottleneckResolvedEvent
  // Flow analysis| FlowAnalysisCompleteEvent| OptimizationTriggeredEvent
  // System health| SystemHealthUpdatedEvent| SystemHealthCheckEvent
  // Configuration| ConfigurationUpdatedEvent
  // Error handling| ErrorOccurredEvent
  // System lifecycle: RestartSystemEvent| EnterMaintenanceEvent| ResumeOperationEvent| PauseOperationEvent| OptimizationCompleteEvent| RetryOperationEvent
// =============================================================================
// EVENT UTILITIES
// =============================================================================
/**
 * Event creation utilities for type-safe event construction
 */
export class WorkflowEventUtils {
  /**
   * Create task created event
   */
  static createTaskCreated(): void {
    ')ERROR_OCCURRED,'
'      error,';
      errorContext,
      severity,
      timestamp: 'CONFIGURATION_UPDATED,',
'      config,';
      updatedBy,
      timestamp: new Date(),',};
};)};
