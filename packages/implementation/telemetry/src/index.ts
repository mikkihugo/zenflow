/**
 * @fileoverview Core Telemetry Infrastructure for claude-code-zen
 *
 * **FOUNDATIONAL TELEMETRY LAYER**
 *
 * Core telemetry infrastructure using OpenTelemetry for distributed observability.
 * This package provides the foundational telemetry primitives used by monitoring packages.
 *
 * **CORE CAPABILITIES:**
 * - 📊 **Metrics Collection**: Counter, histogram, and gauge metrics
 * - 🔍 **Distributed Tracing**: Span creation and management
 * - 📈 **Event Logging**: Structured telemetry events
 * - 🎯 **Custom Attributes**: Rich context for traces and metrics
 * - 🔄 **Export Management**: Prometheus, Jaeger, and custom exporters
 *
 * **USAGE PATTERN:**
 * This package is intended to be used by monitoring packages, not directly by facades.
 *
 * @example Internal Usage by Monitoring Packages
 * ```typescript`
 * import { TelemetryManager, recordMetric, startTrace } from '@claude-zen/telemetry';
 *
 * // In system-monitoring package
 * const telemetry = new TelemetryManager({ serviceName: 'system-monitoring' });'
 * recordMetric('system.cpu.usage', 45.2);'
 *
 * // In agent-monitoring package
 * const span = startTrace('agent.coordination', { agentId: 'agent-001' });'
 * ````
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 */

// OpenTelemetry re-exports for convenience
export { SpanKind, SpanStatusCode } from "@opentelemetry/api";
// Default export
export {
	getTelemetry,
	initializeTelemetry,
	metered,
	recordEvent,
	recordGauge,
	recordHistogram,
	recordMetric,
	setTraceAttributes,
	shutdownTelemetry,
	startTrace,
	TelemetryManager,
	TelemetryManager as default,
	traced,
	tracedAsync,
	withAsyncTrace,
	withTrace,
} from "./telemetry.js";
// Export types
export type {
	Attributes,
	Meter,
	MetricDefinition,
	MetricType,
	Span,
	SpanOptions,
	TelemetryConfig,
	TelemetryEvent,
	Tracer,
} from "./types.js";
