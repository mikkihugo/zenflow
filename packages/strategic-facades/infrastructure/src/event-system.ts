/**
 * @fileoverview Event System Strategic Facade - Simple Delegation
 * 
 * Simple facade that delegates to @claude-zen/event-system package.
 */

// Simple fallback implementations
export function createEventBus() {
  return {
    emit: () => {},
    on: () => {},
    off: () => {}
  };
}

export function createEventEmitter() {
  return {
    emit: () => {},
    on: () => {},
    off: () => {}
  };
}

export function createMessageBroker() {
  return {
    publish: () => {},
    subscribe: () => {},
    unsubscribe: () => {}
  };
}

// Try to delegate to real implementation
try {
  const eventSystemPackage = require('@claude-zen/event-system');
  Object.assign(exports, eventSystemPackage);
} catch {
  // Use fallbacks above
}