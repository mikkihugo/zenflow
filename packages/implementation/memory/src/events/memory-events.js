/**
 * @fileoverview Memory Orchestration Events
 *
 * Event definitions for memory orchestration events.
 * Provides type-safe events for unified memory system coordination.
 */
// ============================================================================
// EVENT TYPE GUARDS
// ============================================================================
/**
 * Type guard for coordination events
 */
export function isCoordinationEvent(event) {
  return event.type.startsWith('memory:system:');
}
/**
 * Type guard for cache events
 */
export function isCacheEvent(event) {
  return event.type.startsWith('memory:cache:');
}
