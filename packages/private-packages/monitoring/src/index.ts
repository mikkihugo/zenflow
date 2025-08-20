/**
 * @fileoverview Monitoring Package - Comprehensive Telemetry & Observability
 * 
 * Professional-grade telemetry integration using OpenTelemetry and Prometheus
 * for distributed observability across the entire claude-code-zen ecosystem.
 * 
 * @author Claude Code Zen Team  
 * @version 2.0.0 - Now contains actual implementation (moved from foundation)
 */

// Export all telemetry functionality from our implementation
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
  MonitoringConfig,
  MetricData,
  PerformanceMetrics
} from './telemetry.js';

// Default export for convenience
export { TelemetryManager as default } from './telemetry.js';

// Alias for backward compatibility
export { TelemetryManager as MonitoringSystem } from './telemetry.js';