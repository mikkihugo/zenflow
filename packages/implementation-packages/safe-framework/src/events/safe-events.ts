/**
 * @fileoverview SAFe Framework Events
 *
 * Event definitions for SAFe-specific events.
 * Provides type-safe events for portfolio management, PI planning, and value streams.
 */

// ============================================================================
// BASE SAFE EVENT
// ============================================================================

/**
 * Base event for all SAFe framework events
 */
export interface SafeEvent {
  readonly type: string;
  readonly id: string;
  readonly timestamp: number;
  readonly source: string;
}

// ============================================================================
// PORTFOLIO EVENTS - Portfolio management events
// ============================================================================

/**
 * Portfolio epic lifecycle event
 */
export interface PortfolioEpicEvent extends SafeEvent {
  readonly type: 'safe:portfolio:epic_updated';
  readonly epicId: string;
  readonly action:|'created|prioritized|approved|funded|completed|cancelled';
  readonly businessValue: number;
}

/**
 * Program Increment planning event
 */
export interface PIPlanningEvent extends SafeEvent {
  readonly type: 'safe:pi:planning_session';
  readonly piId: string;
  readonly phase: 'preparation|day1|day2|finalization';
  readonly confidence: number;
}

// ============================================================================
// EVENT UNION TYPE
// ============================================================================

/**
 * Union of all SAFe event types
 */
export type SafeEventType = PortfolioEpicEvent|PIPlanningEvent;

// ============================================================================
// EVENT TYPE GUARDS
// ============================================================================

/**
 * Type guard for portfolio events
 */
export function isPortfolioEvent(
  event: SafeEventType
): event is PortfolioEpicEvent {
  return event.type.startsWith('safe:portfolio:');
}

/**
 * Type guard for PI events
 */
export function isPIEvent(event: SafeEventType): event is PIPlanningEvent {
  return event.type.startsWith('safe:pi:');
}
