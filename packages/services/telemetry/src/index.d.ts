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
 *   console.log('Telemetry data: ', data.metrics);
' *});
 * ````
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-event-driven
 */
export { createEventDrivenTelemetryManager, EventDrivenTelemetryManager, EventDrivenTelemetryManager as default, getEventDrivenTelemetry, initializeEventDrivenTelemetry, shutdownEventDrivenTelemetry, } from './telemetry-event-driven.js';
export { SpanKind, SpanStatusCode } from '@opentelemetry/api';
export { getTelemetry, initializeTelemetry, metered, recordEvent, recordGauge, recordHistogram, recordMetric, setTraceAttributes, shutdownTelemetry, startTrace, TelemetryManager, TelemetryManager as default, traced, tracedAsync, withAsyncTrace, withTrace, } from './telemetry.js';
export type { Attributes, Meter, MetricDefinition, MetricType, Span, SpanOptions, TelemetryConfig, TelemetryEvent, Tracer, } from './types.js';
import { TelemetryManager } from './telemetry.js';
export declare function createTelemetryManager(config?: unknown): TelemetryManager;
export declare class TelemetryProvider {
    private config?;
    constructor(config?: unknown);
    createTelemetryManager(config?: unknown): Promise<TelemetryManager>;
    createCollector(config?: unknown): Promise<TelemetryManager>;
}
export declare function createTelemetryAccess(_config?: unknown): {
    createTelemetryManager: typeof createTelemetryManager;
    createCollector: typeof createTelemetryManager;
    createProvider: (providerConfig?: unknown) => TelemetryProvider;
    TelemetryManager: typeof TelemetryManager;
    TelemetryProvider: typeof TelemetryProvider;
};
//# sourceMappingURL=index.d.ts.map