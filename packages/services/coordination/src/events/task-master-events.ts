/**
 * @fileoverview TaskMaster Event Types and Definitions
 *
 * Comprehensive event system for TaskMaster coordination and workflow management.
 * Provides type-safe event handling for task lifecycle, workflow management,
 * and approval processes.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('TaskMasterEvents');

// ============================================================================
// CORE EVENT TYPES
// ============================================================================

/**
 * Base event structure for all TaskMaster events
 */
export interface BaseTaskMasterEvent {
  readonly eventId: string;
  readonly timestamp: Date;
  readonly source: 'taskmaster' | 'coordination' | 'approval' | 'workflow';
  readonly version: string;
  readonly metadata?: Record<string, any>;
}

/**
 * Task lifecycle event types
 */
export interface TaskCreatedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: created';
  readonly taskId: string;
  readonly title: string;
  readonly assignee?: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly dueDate?: Date;
}

export interface TaskUpdatedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: updated';
  readonly taskId: string;
  readonly changes: Record<string, any>;
  readonly updatedBy: string;
}

export interface TaskDeletedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: deleted';
  readonly taskId: string;
  readonly deletedBy: string;
  readonly reason?: string;
}

export interface TaskStateChangedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: state_changed';
  readonly taskId: string;
  readonly fromState: string;
  readonly toState: string;
  readonly triggeredBy: string;
}

export interface TaskAssignedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: assigned';
  readonly taskId: string;
  readonly assignee: string;
  readonly assignedBy: string;
  readonly previousAssignee?: string;
}

export interface TaskCompletedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: completed';
  readonly taskId: string;
  readonly completedBy: string;
  readonly completionNotes?: string;
  readonly duration: number; // milliseconds
}

export interface TaskBlockedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: blocked';
  readonly taskId: string;
  readonly blockerReason: string;
  readonly blockedBy: string;
  readonly estimatedResolutionTime?: number;
}

export interface TaskUnblockedEvent extends BaseTaskMasterEvent {
  readonly type: 'task: unblocked';
  readonly taskId: string;
  readonly unblockedBy: string;
  readonly resolutionNotes?: string;
}

/**
 * Workflow event types
 */
export interface WorkflowStartedEvent extends BaseTaskMasterEvent {
  readonly type: 'workflow: started';
  readonly workflowId: string;
  readonly workflowType: string;
  readonly initiatedBy: string;
  readonly parameters: Record<string, any>;
}

export interface WorkflowCompletedEvent extends BaseTaskMasterEvent {
  readonly type: 'workflow: completed';
  readonly workflowId: string;
  readonly duration: number; // milliseconds
  readonly results: Record<string, any>;
}

export interface WorkflowFailedEvent extends BaseTaskMasterEvent {
  readonly type: 'workflow: failed';
  readonly workflowId: string;
  readonly error: string;
  readonly failureStage: string;
  readonly retryable: boolean;
}

export interface WorkflowPausedEvent extends BaseTaskMasterEvent {
  readonly type: 'workflow: paused';
  readonly workflowId: string;
  readonly pausedBy: string;
  readonly reason: string;
}

export interface WorkflowResumedEvent extends BaseTaskMasterEvent {
  readonly type: 'workflow: resumed';
  readonly workflowId: string;
  readonly resumedBy: string;
}

/**
 * Approval event types
 */
export interface ApprovalRequestedEvent extends BaseTaskMasterEvent {
  readonly type: 'approval: requested';
  readonly approvalId: string;
  readonly requestedBy: string;
  readonly approvers: string[];
  readonly dueDate?: Date;
  readonly context: Record<string, any>;
}

export interface ApprovalGrantedEvent extends BaseTaskMasterEvent {
  readonly type: 'approval: granted';
  readonly approvalId: string;
  readonly approvedBy: string;
  readonly comments?: string;
}

export interface ApprovalRejectedEvent extends BaseTaskMasterEvent {
  readonly type: 'approval: rejected';
  readonly approvalId: string;
  readonly rejectedBy: string;
  readonly reason: string;
}

export interface ApprovalTimeoutEvent extends BaseTaskMasterEvent {
  readonly type: 'approval: timeout';
  readonly approvalId: string;
  readonly timeoutDuration: number; // milliseconds
  readonly nextAction: 'escalate' | 'auto_approve' | 'auto_reject';
}

export interface ApprovalEscalatedEvent extends BaseTaskMasterEvent {
  readonly type: 'approval: escalated';
  readonly approvalId: string;
  readonly escalatedTo: string[];
  readonly escalationReason: string;
}

/**
 * Performance monitoring event types
 */
export interface PerformanceThresholdExceededEvent extends BaseTaskMasterEvent {
  readonly type: 'performance: threshold_exceeded';
  readonly metric: string;
  readonly threshold: number;
  readonly actualValue: number;
  readonly severity: 'warning' | 'critical';
}

export interface WIPViolationEvent extends BaseTaskMasterEvent {
  readonly type: 'wip: violation';
  readonly teamId: string;
  readonly currentWIP: number;
  readonly maxWIP: number;
  readonly severity: 'minor' | 'major' | 'critical';
}

/**
 * Comprehensive TaskMaster event map for type-safe event handling
 */
export interface TaskMasterEventMap {
  // Task lifecycle events
  'task: created': (event: TaskCreatedEvent) => void;
  'task: updated': (event: TaskUpdatedEvent) => void;
  'task: deleted': (event: TaskDeletedEvent) => void;
  'task: state_changed': (event: TaskStateChangedEvent) => void;
  'task: assigned': (event: TaskAssignedEvent) => void;
  'task: completed': (event: TaskCompletedEvent) => void;
  'task: blocked': (event: TaskBlockedEvent) => void;
  'task: unblocked': (event: TaskUnblockedEvent) => void;

  // Workflow events
  'workflow: started': (event: WorkflowStartedEvent) => void;
  'workflow: completed': (event: WorkflowCompletedEvent) => void;
  'workflow: failed': (event: WorkflowFailedEvent) => void;
  'workflow: paused': (event: WorkflowPausedEvent) => void;
  'workflow: resumed': (event: WorkflowResumedEvent) => void;

  // Approval gate events
  'approval: requested': (event: ApprovalRequestedEvent) => void;
  'approval: granted': (event: ApprovalGrantedEvent) => void;
  'approval: rejected': (event: ApprovalRejectedEvent) => void;
  'approval: timeout': (event: ApprovalTimeoutEvent) => void;
  'approval: escalated': (event: ApprovalEscalatedEvent) => void;

  // Performance and monitoring events
  'performance: threshold_exceeded': (
    event: PerformanceThresholdExceededEvent
  ) => void;
  'wip: violation': (event: WIPViolationEvent) => void;
}

/**
 * Union type of all TaskMaster events
 */
export type TaskMasterEvent =
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskDeletedEvent
  | TaskStateChangedEvent
  | TaskAssignedEvent
  | TaskCompletedEvent
  | TaskBlockedEvent
  | TaskUnblockedEvent
  | WorkflowStartedEvent
  | WorkflowCompletedEvent
  | WorkflowFailedEvent
  | WorkflowPausedEvent
  | WorkflowResumedEvent
  | ApprovalRequestedEvent
  | ApprovalGrantedEvent
  | ApprovalRejectedEvent
  | ApprovalTimeoutEvent
  | ApprovalEscalatedEvent
  | PerformanceThresholdExceededEvent
  | WIPViolationEvent;

// ============================================================================
// EVENT UTILITIES
// ============================================================================

/**
 * Create a base event with common fields
 */
export function createBaseEvent(
  source: BaseTaskMasterEvent['source'],
  metadata?: Record<string, any>
): Omit<BaseTaskMasterEvent, 'type'> {
  return {
    eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    source,
    version: '1.0.0',
    metadata,
  };
}

/**
 * Type guards for event types
 */
export function isTaskEvent(
  event: TaskMasterEvent
): event is
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskDeletedEvent
  | TaskStateChangedEvent
  | TaskAssignedEvent
  | TaskCompletedEvent
  | TaskBlockedEvent
  | TaskUnblockedEvent {
  return event.type.startsWith('task:');
}

export function isWorkflowEvent(
  event: TaskMasterEvent
): event is
  | WorkflowStartedEvent
  | WorkflowCompletedEvent
  | WorkflowFailedEvent
  | WorkflowPausedEvent
  | WorkflowResumedEvent {
  return event.type.startsWith('workflow:');
}

export function isApprovalEvent(
  event: TaskMasterEvent
): event is
  | ApprovalRequestedEvent
  | ApprovalGrantedEvent
  | ApprovalRejectedEvent
  | ApprovalTimeoutEvent
  | ApprovalEscalatedEvent {
  return event.type.startsWith('approval:');
}

export function isPerformanceEvent(
  event: TaskMasterEvent
): event is PerformanceThresholdExceededEvent | WIPViolationEvent {
  return event.type.startsWith('performance:') || event.type.startsWith('wip:');
}

/**
 * Event severity levels
 */
export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Get event severity for monitoring and alerting
 */
export function getEventSeverity(event: TaskMasterEvent): EventSeverity {
  switch (event.type) {
    case 'task: blocked':
    case 'workflow: failed':
    case 'approval: rejected':
    case 'approval: timeout':
      return EventSeverity.WARNING;

    case 'performance: threshold_exceeded':
      return (event as PerformanceThresholdExceededEvent).severity ===
        'critical'
        ? EventSeverity.CRITICAL
        : EventSeverity.WARNING;

    case 'wip: violation':
      return (event as WIPViolationEvent).severity === 'critical'
        ? EventSeverity.CRITICAL
        : EventSeverity.WARNING;

    case 'approval: escalated':
      return EventSeverity.ERROR;

    default:
      return EventSeverity.INFO;
  }
}

export default {
  createBaseEvent,
  isTaskEvent,
  isWorkflowEvent,
  isApprovalEvent,
  isPerformanceEvent,
  getEventSeverity,
  EventSeverity,
};
