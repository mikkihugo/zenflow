/**
 * @fileoverview Event System Package - Fully Typed EventEmitter
 *
 * Simple, fully typed EventEmitter replacement for eventemitter3.
 * Drop-in replacement with superior TypeScript typing.
 */

// =============================================================================
// FULLY TYPED EVENT EMITTER - Complete eventemitter3 replacement
// =============================================================================
export { EventEmitter, type EventMap, type EventArgs } from './base-event-emitter';

// =============================================================================
// CONVENIENCE ALIASES - For compatibility and ease of use
// =============================================================================
export { EventEmitter as EventBus } from './base-event-emitter';

// =============================================================================
// UTILITY FUNCTIONS - Simple factories
// =============================================================================

/**
 * Create a typed EventEmitter instance
 */
export function createEventEmitter<T extends EventMap = EventMap>(options?: { captureRejections?: boolean }) {
  return new EventEmitter<T>(options);
}

/**
 * Package information
 */
export const VERSION = '2.0.0';
export const DESCRIPTION = 'Fully typed EventEmitter replacement';

export default EventEmitter;
