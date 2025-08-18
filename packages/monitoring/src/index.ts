/**
 * @fileoverview Monitoring Package - Facade for Foundation Telemetry
 * 
 * Lightweight facade that delegates to @claude-zen/foundation's telemetry system.
 * Created to resolve server package alignment issues - server expects @claude-zen/monitoring
 * but the actual implementation is in foundation's telemetry system.
 * 
 * @author Claude Code Zen Team  
 * @version 1.0.0
 */

// Re-export all monitoring functionality from foundation
export {
  TelemetryManager,
  SystemMonitor,
  PerformanceTracker,
  AgentMonitor,
  MLMonitor,
  createSystemMonitor,
  createPerformanceTracker,
  createAgentMonitor,
  createMLMonitor,
  createMonitoringSystem,
  getTelemetry,
  initializeTelemetry,
  shutdownTelemetry,
  recordMetric,
  recordHistogram,
  recordGauge,
  startTrace,
  withTrace,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  traced,
  tracedAsync,
  metered,
  SpanKind,
  SpanStatusCode
} from '@claude-zen/foundation';

// Re-export types
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
  MonitoringConfig,
  MetricData,
  PerformanceMetrics
} from '@claude-zen/foundation';

// Default export for convenience
export { TelemetryManager as default } from '@claude-zen/foundation';