/**
 * @fileoverview Event System Strategic Facade - Simple Delegation
 *
 * Simple facade that delegates to @claude-zen/event-system package.
 */

// Simple fallback implementations
export function createEventBus() {
  return {
    emit: () => {
      /* Fallback emit implementation */
    },
    on: () => {
      /* Fallback on implementation */
    },
    off: () => {
      /* Fallback off implementation */
    },
  };
}

export function createEventEmitter() {
  return {
    emit: () => {
      /* EventEmitter emit */
    },
    on: () => {
      /* EventEmitter on */
    },
    off: () => {
      /* EventEmitter off */
    },
  };
}

export function createMessageBroker() {
  return {
    publish: () => {
      /* Fallback publish implementation */
    },
    subscribe: () => {
      /* Fallback subscribe implementation */
    },
    unsubscribe: () => {
      /* Fallback unsubscribe implementation */
    },
  };
}

// Try to delegate to real implementation
try {
  const eventSystemPackage = require('@claude-zen/event-system');
  Object.assign(exports, eventSystemPackage);
} catch {
  // Use fallbacks above
}
