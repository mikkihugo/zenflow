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

export {
  TelemetryManager,
  recordMetric,
  recordHistogram,
  recordGauge,
  recordEvent,
  startTrace,
  withTrace,
  withAsyncTrace,
  setTraceAttributes,
  traced,
  tracedAsync,
  metered,
  getTelemetry,
  initializeTelemetry,
  shutdownTelemetry,
} from './telemetry.js';

// Export types
export type {
  TelemetryConfig,
  MetricDefinition,
  SpanOptions,
  TelemetryEvent,
  MetricType,
  Span,
  Tracer,
  Meter,
  Attributes,
} from './types.js';

// OpenTelemetry re-exports for convenience
export { SpanKind, SpanStatusCode } from '@opentelemetry/api';

// Default export
export { TelemetryManager as default } from './telemetry.js';
