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
import type { SystemEvent} from '@claude-zen/event-system');
  ApprovalDecision,
  ApprovalRequest,
} from './approval-gate-machine')'; 
// APPROVAL GATE EVENT TYPES
// =============================================================================
/**
 * Base approval gate event extending the unified event system
 */
export interface ApprovalGateEvent extends SystemEvent {
  type: 'approval: 'request',)  status : 'pending')approval: 'success',)  details: 'approval: 'human-review',)  status : 'pending')approval: 'success',)  details: 'approval: 'overflow-handling',)  status : 'approval: 'configure',)  status : 'success')approval: 'bottleneck-detection',)  status : 'warning')approval: 'capacity-monitoring',)  status : 'warning' | ' critical');
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
export function createApprovalRequestedEvent(): void {
  return {
    type,    gateId,')overflow-handling') warning,',
    timestamp: 'bottleneck-detection',)    status : 'warning,'
'    timestamp: 'capacity-monitoring',)    status: ' warning,',
    timestamp: Date.now(): void {
      utilizationPercent,
      capacityThreshold,
      timeToCapacity,',      recommendedActions: [')Pause task intake,';
       'Increase gate capacity,')Enable emergency auto-approval,';
       'Escalate to human oversight,';
],
},
};)};
// =============================================================================
// EVENT CONSTANTS
// =============================================================================
/**
 * Event type constants for type-safe event handling
 */
export const APPROVAL_EVENTS = {
  REQUESTED = 'approval: 'approval: 'approval: 'approval: 'approval: 'approval: 'approval: 'approval:  {
  CAPACITY_ALERT : 'critical 'as const,';
  QUEUE_OVERFLOW : 'high 'as const,';
  BOTTLENECK : 'high 'as const,';
  HUMAN_DECISION : 'medium 'as const,';
  AUTO_PROCESSED : 'low 'as const,';
  REQUESTED : 'low 'as const,';
'} as const;';
');