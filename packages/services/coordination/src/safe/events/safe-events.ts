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
  id: string;
}
// ============================================================================
// PORTFOLIO EVENTS - Portfolio management events
// ============================================================================
/**
 * Portfolio epic lifecycle event
 */
export interface PortfolioEpicEvent extends SafeEvent {
  readonly type = 'safe: 'safe: pi: planning_session',)  readonly piId: string;
  readonly phase : 'preparation| day1| day2' | ' finalization'));,)};
/**
 * Type guard for PI events
 */
export function isPIEvent(event: ');,)};
