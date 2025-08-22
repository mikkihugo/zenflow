/**
 * @fileoverview Approval Gate Events - Integration with @claude-zen/event-system
 *
 * Event definitions for approval gate state machine that integrate with the
 * unified event system. Replaces EventEmitter3 with your gold standard event package.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0 - Event System Integration
 */

import type { SystemEvent } from '@claude-zen/event-system';
import type {
  ApprovalRequest,
  ApprovalDecision,
} from './approval-gate-machine';

// =============================================================================
// APPROVAL GATE EVENT TYPES
// =============================================================================

/**
 * Base approval gate event extending the unified event system
 */
export interface ApprovalGateEvent extends SystemEvent {
  type: string;
  gateId: string;
  timestamp: number;
  metadata?: {
    correlationId?: string;
    sessionId?: string;
    userId?: string;
  };
}

/**
 * Approval request submitted to gate
 */
export interface ApprovalRequestedEvent extends ApprovalGateEvent {
  type: 'approval:requested';
  operation: 'request';
  status: 'pending';
  details: {
    request: ApprovalRequest;
    queuePosition: number;
    estimatedWaitTime?: number;
  };
}

/**
 * Auto-approval processed
 */
export interface ApprovalAutoProcessedEvent extends ApprovalGateEvent {
  type: 'approval:auto-processed';
  operation: 'auto-approve|auto-reject';
  status: 'success';
  details: {
    request: ApprovalRequest;
    decision: ApprovalDecision;
    confidence: number;
    threshold: number;
  };
}

/**
 * Human approval requested
 */
export interface ApprovalHumanRequestedEvent extends ApprovalGateEvent {
  type: 'approval:human-requested';
  operation: 'human-review';
  status: 'pending';
  details: {
    request: ApprovalRequest;
    question: string;
    timeout: number;
    priority: string;
  };
}

/**
 * Human decision received
 */
export interface ApprovalHumanDecisionEvent extends ApprovalGateEvent {
  type: 'approval:human-decision';
  operation: 'human-approve|human-reject';
  status: 'success';
  details: {
    request: ApprovalRequest;
    decision: ApprovalDecision;
    responseTime: number;
    rationale?: string;
  };
}

/**
 * Gate queue overflow
 */
export interface ApprovalQueueOverflowEvent extends ApprovalGateEvent {
  type: 'approval:queue-overflow';
  operation: 'overflow-handling';
  status: 'warning|critical';
  details: {
    queueDepth: number;
    maxDepth: number;
    overflowBehavior: string;
    rejectedRequests: string[];
  };
}

/**
 * Gate configuration updated
 */
export interface ApprovalConfigUpdatedEvent extends ApprovalGateEvent {
  type: 'approval:config-updated';
  operation: 'configure';
  status: 'success';
  details: {
    previousConfig: any;
    newConfig: any;
    changes: string[];
  };
}

/**
 * Gate bottleneck detected
 */
export interface ApprovalBottleneckEvent extends ApprovalGateEvent {
  type: 'approval:bottleneck';
  operation: 'bottleneck-detection';
  status: 'warning';
  details: {
    queueDepth: number;
    avgWaitTime: number;
    throughputDecline: number;
    recommendedActions: string[];
  };
}

/**
 * Gate capacity alert
 */
export interface ApprovalCapacityAlertEvent extends ApprovalGateEvent {
  type: 'approval:capacity-alert';
  operation: 'capacity-monitoring';
  status: 'warning|critical';
  details: {
    utilizationPercent: number;
    capacityThreshold: number;
    timeToCapacity: number;
    recommendedActions: string[];
  };
}

// =============================================================================
// EVENT TYPE UNION
// =============================================================================

/**
 * Union type of all approval gate events
 */
export type ApprovalGateEventType =|ApprovalRequestedEvent | ApprovalAutoProcessedEvent | ApprovalHumanRequestedEvent | ApprovalHumanDecisionEvent | ApprovalQueueOverflowEvent | ApprovalConfigUpdatedEvent | ApprovalBottleneckEvent | ApprovalCapacityAlertEvent;

// =============================================================================
// EVENT BUILDERS
// =============================================================================

/**
 * Create approval requested event
 */
export function createApprovalRequestedEvent(
  gateId: string,
  request: ApprovalRequest,
  queuePosition: number
): ApprovalRequestedEvent {
  return {
    type:'approval:requested',
    gateId,
    operation: 'request',
    status: 'pending',
    timestamp: Date.now(),
    details: {
      request,
      queuePosition,
      estimatedWaitTime: queuePosition * 30000, // 30 seconds per queue position
    },
  };
}

/**
 * Create auto-processed event
 */
export function createApprovalAutoProcessedEvent(
  gateId: string,
  request: ApprovalRequest,
  decision: ApprovalDecision,
  threshold: number
): ApprovalAutoProcessedEvent {
  return {
    type: 'approval:auto-processed',
    gateId,
    operation: decision.approved ? 'auto-approve' : 'auto-reject',
    status: 'success',
    timestamp: Date.now(),
    details: {
      request,
      decision,
      confidence: request.confidence,
      threshold,
    },
  };
}

/**
 * Create human requested event
 */
export function createApprovalHumanRequestedEvent(
  gateId: string,
  request: ApprovalRequest,
  timeout: number
): ApprovalHumanRequestedEvent {
  return {
    type: 'approval:human-requested',
    gateId,
    operation: 'human-review',
    status: 'pending',
    timestamp: Date.now(),
    details: {
      request,
      question: request.question,
      timeout,
      priority: request.priority,
    },
  };
}

/**
 * Create human decision event
 */
export function createApprovalHumanDecisionEvent(
  gateId: string,
  request: ApprovalRequest,
  decision: ApprovalDecision,
  responseTime: number
): ApprovalHumanDecisionEvent {
  return {
    type: 'approval:human-decision',
    gateId,
    operation: decision.approved ? 'human-approve' : 'human-reject',
    status: 'success',
    timestamp: Date.now(),
    details: {
      request,
      decision,
      responseTime,
      rationale: decision.rationale,
    },
  };
}

/**
 * Create queue overflow event
 */
export function createApprovalQueueOverflowEvent(
  gateId: string,
  queueDepth: number,
  maxDepth: number,
  overflowBehavior: string,
  rejectedRequests: string[] = []
): ApprovalQueueOverflowEvent {
  return {
    type: 'approval:queue-overflow',
    gateId,
    operation: 'overflow-handling',
    status: queueDepth > maxDepth * 1.5 ? 'critical' : 'warning',
    timestamp: Date.now(),
    details: {
      queueDepth,
      maxDepth,
      overflowBehavior,
      rejectedRequests,
    },
  };
}

/**
 * Create bottleneck detected event
 */
export function createApprovalBottleneckEvent(
  gateId: string,
  queueDepth: number,
  avgWaitTime: number,
  throughputDecline: number
): ApprovalBottleneckEvent {
  return {
    type: 'approval:bottleneck',
    gateId,
    operation: 'bottleneck-detection',
    status: 'warning',
    timestamp: Date.now(),
    details: {
      queueDepth,
      avgWaitTime,
      throughputDecline,
      recommendedActions: [
        'Increase auto-approve threshold',
        'Add more human reviewers',
        'Implement queue prioritization',
        'Consider spillover configuration',
      ],
    },
  };
}

/**
 * Create capacity alert event
 */
export function createApprovalCapacityAlertEvent(
  gateId: string,
  utilizationPercent: number,
  capacityThreshold: number,
  timeToCapacity: number
): ApprovalCapacityAlertEvent {
  return {
    type: 'approval:capacity-alert',
    gateId,
    operation: 'capacity-monitoring',
    status: utilizationPercent > 90 ? 'critical' : 'warning',
    timestamp: Date.now(),
    details: {
      utilizationPercent,
      capacityThreshold,
      timeToCapacity,
      recommendedActions: [
        'Pause task intake',
        'Increase gate capacity',
        'Enable emergency auto-approval',
        'Escalate to human oversight',
      ],
    },
  };
}

// =============================================================================
// EVENT CONSTANTS
// =============================================================================

/**
 * Event type constants for type-safe event handling
 */
export const APPROVAL_EVENTS = {
  REQUESTED: 'approval:requested',
  AUTO_PROCESSED: 'approval:auto-processed',
  HUMAN_REQUESTED: 'approval:human-requested',
  HUMAN_DECISION: 'approval:human-decision',
  QUEUE_OVERFLOW: 'approval:queue-overflow',
  CONFIG_UPDATED: 'approval:config-updated',
  BOTTLENECK: 'approval:bottleneck',
  CAPACITY_ALERT: 'approval:capacity-alert',
} as const;

/**
 * Event priorities for approval events
 */
export const APPROVAL_EVENT_PRIORITIES = {
  CAPACITY_ALERT: 'critical' as const,
  QUEUE_OVERFLOW: 'high' as const,
  BOTTLENECK: 'high' as const,
  HUMAN_DECISION: 'medium' as const,
  AUTO_PROCESSED: 'low' as const,
  REQUESTED: 'low' as const,
} as const;
