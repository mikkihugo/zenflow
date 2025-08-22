/**
 * @fileoverview System Monitoring Package for claude-code-zen
 *
 * **INFRASTRUCTURE MONITORING**
 *
 * System and infrastructure monitoring using @claude-zen/telemetry for metrics collection.
 * Provides monitoring for CPU, memory, disk, network, and overall system performance.
 *
 * **MONITORING CAPABILITIES:**
 * - 🖥️ **System Resources**: CPU, memory, disk, network monitoring
 * - 📊 **Performance Tracking**: System performance metrics and bottlenecks
 * - 🔍 **Health Checks**: System availability and health monitoring
 * - 📈 **Infrastructure Metrics**: Custom infrastructure-specific metrics
 * - ⚡ **Performance Tracker**: Operation timing and performance analysis
 *
 * **INTEGRATION:**
 * Uses @claude-zen/telemetry internally for all metrics collection and tracing.
 * Designed to be used by Infrastructure facade only.
 *
 * @example Infrastructure Usage
 * ```typescript
 * import { SystemMonitor, PerformanceTracker, getSystemMonitoring } from '@claude-zen/system-monitoring';
 *
 * // System monitoring
 * const monitor = new SystemMonitor();
 * await monitor.initialize();
 * const metrics = await monitor.getMetrics();
 *
 * // Performance tracking
 * const tracker = new PerformanceTracker();
 * const timer = tracker.startTimer('database_query');
 * // ... operation
 * timer();
 * ```
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 */

export {
  SystemMonitor,
  PerformanceTracker,
  HealthChecker,
  InfrastructureMetrics,
  getSystemMonitoring,
  createSystemMonitor,
  createPerformanceTracker,
  createHealthChecker,
} from './monitoring.js';

// System metrics implementation (moved from foundation)
export {
  SystemMetricsCollector,
  createSystemMetricsCollector,
  SYSTEM_METRICS_COLLECTOR_TOKEN,
} from './system-metrics.js';

export type {
  SystemMetrics,
  PerformanceMetrics,
  HealthStatus,
  InfrastructureConfig,
  SystemMonitoringConfig,
} from './types.js';

// System metrics types (moved from foundation)
export type {
  CpuMetrics,
  MemoryMetrics,
  SystemPerformanceTracker,
  SystemHealth,
  SystemMetricsError,
} from './system-metrics.js';

// Default export for convenience
export { SystemMonitor as default } from './monitoring.js';
