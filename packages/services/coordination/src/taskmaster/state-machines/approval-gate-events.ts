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
import type { SystemEvent} from '@claude-zen/event-system')import type {';
  ApprovalDecision,
  ApprovalRequest,
} from './approval-gate-machine')// ============================================================================ = ''; 
// APPROVAL GATE EVENT TYPES
// =============================================================================
/**
 * Base approval gate event extending the unified event system
 */
export interface ApprovalGateEvent extends SystemEvent {
  type: 'approval: 'request',)  status : 'pending')  details: 'approval: 'success',)  details: 'approval: 'human-review',)  status : 'pending')  details: 'approval: 'success',)  details: 'approval: 'overflow-handling',)  status : 'approval: 'configure',)  status : 'success')  details: 'approval: 'bottleneck-detection',)  status : 'warning')  details: 'approval: 'capacity-monitoring',)  status : 'warning' | ' critical')  details: {';
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
export type ApprovalGateEventType =| ApprovalRequestedEvent| ApprovalAutoProcessedEvent| ApprovalHumanRequestedEvent| ApprovalHumanDecisionEvent| ApprovalQueueOverflowEvent| ApprovalConfigUpdatedEvent| ApprovalBottleneckEvent| ApprovalCapacityAlertEvent;
// =============================================================================
// EVENT BUILDERS
// =============================================================================
/**
 * Create approval requested event
 */
export function createApprovalRequestedEvent(
  gateId: 'request',)    status : 'pending,'
'    timestamp: ' auto-reject',)    status : 'success,'
'    timestamp: 'human-review',)    status : 'pending,'
'    timestamp: ' human-reject',)    status : 'success,'
'    timestamp: []
):ApprovalQueueOverflowEvent {
  return {
    type,    gateId,')    operation : 'overflow-handling')    status: ' warning,',
    timestamp: 'bottleneck-detection',)    status : 'warning,'
'    timestamp: 'capacity-monitoring',)    status: ' warning,',
    timestamp: Date.now(),
    details: {
      utilizationPercent,
      capacityThreshold,
      timeToCapacity,',      recommendedActions: [')       'Pause task intake,';
       'Increase gate capacity,')       'Enable emergency auto-approval,';
       'Escalate to human oversight,';
],
},
};)};;
// =============================================================================
// EVENT CONSTANTS
// =============================================================================
/**
 * Event type constants for type-safe event handling
 */
export const APPROVAL_EVENTS = {
  REQUESTED = 'approval: 'approval: 'approval: 'approval: 'approval: 'approval: 'approval: 'approval: {
  CAPACITY_ALERT : 'critical 'as const,';
  QUEUE_OVERFLOW : 'high 'as const,';
  BOTTLENECK : 'high 'as const,';
  HUMAN_DECISION : 'medium 'as const,';
  AUTO_PROCESSED : 'low 'as const,';
  REQUESTED : 'low 'as const,';
'} as const;';
')';