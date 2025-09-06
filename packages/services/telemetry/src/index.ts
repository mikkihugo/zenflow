/**
 * @fileoverview Core Telemetry Infrastructure for claude-code-zen - 100% EVENT-DRIVEN
 *
 * **100% EVENT-BASED TELEMETRY LAYER**
 *
 * Pure event-driven telemetry infrastructure with ZERO imports.
 * Listens to brain and service events for metrics collection, tracing, and event logging.
 *
 * **EVENT-DRIVEN CAPABILITIES:**
 * -  **Brain Integration**:Responds to brain telemetry requests via events
 * -  **Event-Based Metrics**:Collects metrics via telemetry events
 * -  **Event-Based Tracing**:Handles trace lifecycle via events
 * -  **Event Logging**:Processes telemetry events from all services
 * -  **Zero Dependencies**:No foundation or external imports
 * -  **Pure Coordination**:Event-only communication with services
 *
 * **EVENT ARCHITECTURE:**
 * Services emit telemetry events  Telemetry Manager processes  Brain gets aggregated data
 * Pure event coordination with no direct package dependencies.
 *
 * @example Event-Driven Usage (Brain Integration)
 * '''typescript'
 * // Brain requests telemetry data
 * eventSystem.emit('brain:telemetry:get-metrics', { 
 *   requestId: '123', *   timestamp:Date.now() 
 *});
 *
 * // Services emit telemetry data
 * eventSystem.emit('telemetry:record-metric', {
 *   name: 'system.cpu.usage', *   value:45.2,
 *   timestamp:Date.now()
 *});
 *
 * // Telemetry responds to brain with aggregated metrics
 * eventSystem.on('telemetry:metrics', (data) => {
 *   logger.info('Telemetry data: ', data.metrics);
` *});
 * `
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-event-driven
 */

// Import working implementations
import {
  EventDrivenTelemetryManager,
  createEventDrivenTelemetryManager,
  initializeEventDrivenTelemetry,
  getEventDrivenTelemetry,
  shutdownEventDrivenTelemetry
} from './telemetry-event-driven.js';

import {
  TelemetryEventBridge,
  createTelemetryEventBridge
} from './telemetry-event-bridge.js';

/**
 * Creates a new EventDrivenTelemetryManager.
 *
 * The optional `config` parameter is accepted for API compatibility but is ignored — this factory always returns the manager produced by `createEventDrivenTelemetryManager`.
 *
 * @param config - Optional configuration (not used).
 * @returns A new EventDrivenTelemetryManager instance.
 */
export function createTelemetryManager(config?: unknown): EventDrivenTelemetryManager {
  // Config parameter ignored for now - the implementation uses internal defaults
  void config;
  return createEventDrivenTelemetryManager();
}

/**
 * Returns a small facade exposing telemetry creation and lifecycle helpers.
 *
 * The optional `config` value is captured and provided to the returned
 * `createTelemetryManager` function; callers can use that factory to create
 * a manager without importing other internals. Note: the underlying manager
 * implementation may ignore the config.
 *
 * @param config - Optional configuration object forwarded to the returned `createTelemetryManager`
 * @returns An object with:
 *   - `createTelemetryManager()` — factory that creates a telemetry manager (captures `config`)
 *   - `getEventDrivenTelemetry` — accessor for the event-driven telemetry API
 *   - `initializeEventDrivenTelemetry` — initializer for the telemetry subsystem
 *   - `shutdownEventDrivenTelemetry` — shutdown helper for the telemetry subsystem
 */
export function createTelemetryAccess(config?: unknown) {
  return {
    createTelemetryManager: () => createTelemetryManager(config),
    getEventDrivenTelemetry,
    initializeEventDrivenTelemetry,
    shutdownEventDrivenTelemetry
  };
}

// Export event bridge functionality
export {
  TelemetryEventBridge,
  createTelemetryEventBridge
};

// Export core event-driven telemetry functionality
export {
  EventDrivenTelemetryManager,
  createEventDrivenTelemetryManager,
  initializeEventDrivenTelemetry,
  getEventDrivenTelemetry,
  shutdownEventDrivenTelemetry
};
