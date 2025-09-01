/**
 * @fileoverview System Monitoring Package for claude-code-zen - 100% EVENT-DRIVEN
 *
 * **100% EVENT-BASED INFRASTRUCTURE MONITORING**
 *
 * Pure event-driven system monitoring with ZERO imports.
 * Listens to brain events and responds with system metrics via events only.
 *
 * **EVENT-DRIVEN CAPABILITIES:**
 * -  **Brain Integration**:Responds to brain monitoring requests via events
 * - ️ **System Resources**:CPU, memory, disk, network monitoring via events
 * -  **Performance Tracking**:System performance metrics via event emission
 * -  **Health Checks**:System availability via event responses
 * -  **Telemetry Events**:Metrics emission via telemetry events (no imports)
 * -  **Zero Dependencies**:No foundation or telemetry imports
 *
 * **EVENT ARCHITECTURE:**
 * Brain emits monitoring request events  System Monitor responds with metric events
 * Pure event coordination with no direct package dependencies.
 *
 * @example Event-Driven Usage (Brain Integration)
 * '''typescript'
 * // Brain emits request
 * eventSystem.emit('brain:system-monitoring:get-metrics', { 
 *   requestId: '123', *   timestamp:Date.now() 
 *});
 *
 * // System monitor responds with event
 * eventSystem.on('system-monitoring:metrics', (data) => {
 *   logger.info('System metrics: ', data.metrics);
` *});
 * `
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-event-driven
 */

// PRIMARY EVENT-DRIVEN EXPORTS (ZERO IMPORTS)
export {
  createEventDrivenSystemMonitor,
  EventDrivenSystemMonitor,
  EventDrivenSystemMonitor as default,
} from './monitoring-event-driven.js';

// EVENT BRIDGE EXPORTS (WITH FOUNDATION IMPORTS)
export {
  EventDrivenSystemMonitorBridge,
  createSystemMonitoringBridge,
  createCustomSystemMonitoringBridge,
} from './monitoring-event-bridge.js';

// LEGACY EXPORTS (WITH IMPORTS - DEPRECATED)
export {
  createHealthChecker,
  createPerformanceTracker,
  createSystemMonitor,
  getSystemMonitoring,
  HealthChecker,
  InfrastructureMetrics,
  PerformanceTracker,
  SystemMonitor,
} from './monitoring.js';
// System metrics types (moved from foundation)
export type {
  CpuMetrics,
  MemoryMetrics,
  SystemHealth,
  SystemMetricsError,
  SystemPerformanceTracker,
} from './system-metrics.js';
// System metrics implementation (moved from foundation)
export {
  createSystemMetricsCollector,
  SYSTEM_METRICS_COLLECTOR_TOKEN,
  SystemMetricsCollector,
} from './system-metrics.js';
export type {
  HealthStatus,
  InfrastructureConfig,
  PerformanceMetrics,
  SystemMetrics,
  SystemMonitoringConfig,
} from './types.js';
