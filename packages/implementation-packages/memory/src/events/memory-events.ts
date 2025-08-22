/**
 * @fileoverview Memory Orchestration Events
 *
 * Event definitions for memory orchestration events.
 * Provides type-safe events for unified memory system coordination.
 */

// ============================================================================
// BASE MEMORY EVENT
// ============================================================================

/**
 * Base event for all memory orchestration events
 */
export interface MemoryEvent {
  readonly type: string;
  readonly id: string;
  readonly timestamp: number;
  readonly source: string;
}

// ============================================================================
// MEMORY COORDINATION EVENTS
// ============================================================================

/**
 * Memory system synchronization event
 */
export interface MemorySystemSyncEvent extends MemoryEvent {
  readonly type: 'memory:system:sync_initiated';
  readonly systemId: string;
  readonly syncType: 'full|incremental|delta';
  readonly dataSize: number;
}

/**
 * Cache coordination event
 */
export interface CacheCoordinationEvent extends MemoryEvent {
  readonly type: 'memory:cache:coordination_updated';
  readonly cacheId: string;
  readonly operation: 'populate|invalidate|refresh|migrate';
  readonly keyPattern: string;
}

// ============================================================================
// EVENT UNION TYPE
// ============================================================================

/**
 * Union of all memory orchestration event types
 */
export type MemoryEventType = MemorySystemSyncEvent|CacheCoordinationEvent;

// ============================================================================
// EVENT TYPE GUARDS
// ============================================================================

/**
 * Type guard for coordination events
 */
export function isCoordinationEvent(
  event: MemoryEventType
): event is MemorySystemSyncEvent {
  return event.type.startsWith('memory:system:');
}

/**
 * Type guard for cache events
 */
export function isCacheEvent(
  event: MemoryEventType
): event is CacheCoordinationEvent {
  return event.type.startsWith('memory:cache:');
}
