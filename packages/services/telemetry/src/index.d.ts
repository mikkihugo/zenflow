/**
 * @fileoverview Core Telemetry Infrastructure for claude-code-zen - 100% EVENT-DRIVEN
 *
 * **100% EVENT-BASED TELEMETRY LAYER**
 *
 * Pure event-driven telemetry infrastructure with ZERO imports.
 * Listens to brain and service events for metrics collection, tracing, and event logging.
 *
 * **EVENT-DRIVEN CAPABILITIES:**
 * - 🧠 **Brain Integration**:Responds to brain telemetry requests via events
 * - 📊 **Event-Based Metrics**:Collects metrics via telemetry events
 * - 🔍 **Event-Based Tracing**:Handles trace lifecycle via events
 * - 📈 **Event Logging**:Processes telemetry events from all services
 * - 🎯 **Zero Dependencies**:No foundation or external imports
 * - 🔄 **Pure Coordination**:Event-only communication with services
 *
 * **EVENT ARCHITECTURE:**
 * Services emit telemetry events → Telemetry Manager processes → Brain gets aggregated data
 * Pure event coordination with no direct package dependencies.
 *
 * @example Event-Driven Usage (Brain Integration)
 * ```typescript`
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
' *});
 * ````
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-event-driven
 */
export { createEventDrivenTelemetryManager, EventDrivenTelemetryManager, EventDrivenTelemetryManager as default, getEventDrivenTelemetry, initializeEventDrivenTelemetry, shutdownEventDrivenTelemetry, } from './telemetry-event-driven.js';
export declare function createTelemetryManager(config?: unknown): any;
export declare function createTelemetryAccess(config?: unknown): {
    createTelemetryManager: () => any;
    getEventDrivenTelemetry: any;
    initializeEventDrivenTelemetry: any;
    shutdownEventDrivenTelemetry: any;
};
//# sourceMappingURL=index.d.ts.map