/**
 * @fileoverview Multi-Level Orchestration Events
 * 
 * Event definitions for orchestration-specific events.
 * Provides type-safe events for portfolio, program, and swarm execution coordination.
 */

// ============================================================================
// BASE ORCHESTRATION EVENT
// ============================================================================

/**
 * Base event for all multi-level orchestration events
 */
export interface OrchestrationEvent {
  readonly type: string;
  readonly id: string;
  readonly timestamp: number;
  readonly source: string;
}

// ============================================================================
// STREAM EVENTS - Workflow stream lifecycle
// ============================================================================

/**
 * Stream status change event
 */
export interface StreamStatusChangedEvent extends OrchestrationEvent {
  readonly type: 'orchestration:stream:status_changed';
  readonly streamId: string;
  readonly oldStatus: string;
  readonly newStatus: string;
  readonly reason?: string;
}

/**
 * WIP limit exceeded event
 */
export interface WIPLimitExceededEvent extends OrchestrationEvent {
  readonly type: 'orchestration:wip:limit_exceeded';
  readonly streamId: string;
  readonly currentWip: number;
  readonly wipLimit: number;
  readonly rejectedItemId: string;
}

// ============================================================================
// EVENT UNION TYPE
// ============================================================================

/**
 * Union of all orchestration event types
 */
export type OrchestrationEventType =
  | StreamStatusChangedEvent
  | WIPLimitExceededEvent;

// ============================================================================
// EVENT TYPE GUARDS
// ============================================================================

/**
 * Type guard for stream events
 */
export function isStreamEvent(event: OrchestrationEventType): event is StreamStatusChangedEvent | WIPLimitExceededEvent {
  return event.type.startsWith('orchestration:stream:') || event.type.startsWith('orchestration:wip:');
}