/**
 * @fileoverview System Monitoring Implementation
 * 
 * System monitoring using @claude-zen/telemetry for metrics collection.
 */

import * as si from 'systeminformation';
import * as pidusage from 'pidusage';

import { getLogger } from '@claude-zen/foundation/logging';
import { 
  recordMetric, 
  recordHistogram, 
  recordGauge, 
  withAsyncTrace, 
  getTelemetry, 
  initializeTelemetry,
  type TelemetryConfig 
} from '@claude-zen/telemetry';

import type { 
  SystemMetrics, 
  PerformanceMetrics, 
  HealthStatus, 
  InfrastructureConfig,
  SystemMonitoringConfig 
} from './types.js';

// =============================================================================
// SYSTEM MONITOR
// =============================================================================

/**
 * System resource monitoring using telemetry
 */
export class SystemMonitor {
  private config: Required<InfrastructureConfig>;
  private logger = getLogger('SystemMonitor');
  private monitoringInterval: NodeJS.Timer | null = null;
  private initialized = false;

  constructor(config: InfrastructureConfig = {}) {
    this.config = {
      enableSystemMetrics: true,
      systemMetricsInterval: 5000,
      enablePerformanceTracking: true,
      enableHealthChecks: true,
      healthCheckInterval: 10000,
      cpuWarningThreshold: 70,
      cpuErrorThreshold: 90,
      memoryWarningThreshold: 80,
      memoryErrorThreshold: 95,
      diskWarningThreshold: 80,
      diskErrorThreshold: 95,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure telemetry is initialized
      const telemetry = getTelemetry();
      if (!telemetry.isInitialized()) {
        await initializeTelemetry({ serviceName: 'system-monitoring' });
      }

      if (this.config.enableSystemMetrics) {
        this.startSystemMetricsCollection();
      }

      this.initialized = true;
      this.logger.info('System monitor initialized', { config: this.config });
    } catch (error) {
      this.logger.error('Failed to initialize system monitor', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.initialized = false;
    this.logger.info('System monitor shut down');
  }

  /**
   * Get current system metrics
   */
  async getMetrics(): Promise<SystemMetrics> {
    return withAsyncTrace('system.get_metrics', async () => {
      const [cpu, memory, disk, network, uptime] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.time()
      ]);

      const metrics: SystemMetrics = {
        cpu: {
          usage: Math.round(cpu.currentLoad),
          load: cpu.cpus.map(c => Math.round(c.load)),
          cores: cpu.cpus.length
        },
        memory: {
          total: memory.total,
          used: memory.used,
          free: memory.free,
          usage: Math.round((memory.used / memory.total) * 100)
        },
        disk: {
          total: disk[0]?.size || 0,
          used: disk[0]?.used || 0,
          free: disk[0]?.available || 0,
          usage: Math.round(((disk[0]?.used || 0) / (disk[0]?.size || 1)) * 100)
        },
        network: {
          bytesIn: network[0]?.rx_bytes || 0,
          bytesOut: network[0]?.tx_bytes || 0,
          packetsIn: network[0]?.rx_sec || 0,
          packetsOut: network[0]?.tx_sec || 0
        },
        uptime: uptime.uptime,
        timestamp: Date.now()
      };

      // Record metrics via telemetry
      recordGauge('system.cpu.usage', metrics.cpu.usage);
      recordGauge('system.memory.usage', metrics.memory.usage);
      recordGauge('system.disk.usage', metrics.disk.usage);
      recordGauge('system.uptime', metrics.uptime);

      return metrics;
    });
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return withAsyncTrace('system.health_check', async () => {
      const metrics = await this.getMetrics();
      
      const checks: HealthStatus['checks'] = {
        cpu: {
          status: metrics.cpu.usage > this.config.cpuErrorThreshold ? 'error' :
                 metrics.cpu.usage > this.config.cpuWarningThreshold ? 'warning' : 'ok',
          value: metrics.cpu.usage,
          threshold: this.config.cpuWarningThreshold
        },
        memory: {
          status: metrics.memory.usage > this.config.memoryErrorThreshold ? 'error' :
                 metrics.memory.usage > this.config.memoryWarningThreshold ? 'warning' : 'ok',
          value: metrics.memory.usage,
          threshold: this.config.memoryWarningThreshold
        },
        disk: {
          status: metrics.disk.usage > this.config.diskErrorThreshold ? 'error' :
                 metrics.disk.usage > this.config.diskWarningThreshold ? 'warning' : 'ok',
          value: metrics.disk.usage,
          threshold: this.config.diskWarningThreshold
        }
      };

      const hasError = Object.values(checks).some(check => check.status === 'error');
      const hasWarning = Object.values(checks).some(check => check.status === 'warning');

      const status: HealthStatus = {
        status: hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
        checks,
        timestamp: Date.now()
      };

      // Record health status
      recordMetric('system.health', status.status === 'healthy' ? 1 : 0);

      return status;
    });
  }

  private startSystemMetricsCollection(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.getMetrics();
      } catch (error) {
        this.logger.error('Error collecting system metrics', error);
      }
    }, this.config.systemMetricsInterval);
  }
}

// =============================================================================
// PERFORMANCE TRACKER
// =============================================================================

/**
 * Performance tracking for operations
 */
export class PerformanceTracker {
  private operations = new Map<string, number[]>();
  private logger = getLogger('PerformanceTracker');

  /**
   * Start timing an operation
   */
  startTimer(name: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.recordDuration(name, duration);
      return duration;
    };
  }

  /**
   * Record operation duration
   */
  recordDuration(name: string, duration: number): void {
    if (!this.operations.has(name)) {
      this.operations.set(name, []);
    }
    
    const durations = this.operations.get(name)!;
    durations.push(duration);
    
    // Keep only last 1000 measurements
    if (durations.length > 1000) {
      durations.splice(0, durations.length - 1000);
    }

    // Record to telemetry
    recordHistogram(`operation.${name}.duration`, duration);
    recordMetric(`operation.${name}.count`, 1);
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const operations: PerformanceMetrics['operations'] = {};

    for (const [name, durations] of this.operations.entries()) {
      if (durations.length === 0) continue;

      operations[name] = {
        count: durations.length,
        totalTime: durations.reduce((sum, d) => sum + d, 0),
        avgTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minTime: Math.min(...durations),
        maxTime: Math.max(...durations)
      };
    }

    return {
      operations,
      system: {
        responseTime: 0, // TODO: Calculate from operations
        throughput: 0,   // TODO: Calculate from operations
        errorRate: 0     // TODO: Track errors
      },
      timestamp: Date.now()
    };
  }

  /**
   * Reset performance data
   */
  reset(): void {
    this.operations.clear();
    this.logger.info('Performance tracker reset');
  }
}

// =============================================================================
// HEALTH CHECKER
// =============================================================================

/**
 * System health checker
 */
export class HealthChecker {
  private monitor: SystemMonitor;
  private logger = getLogger('HealthChecker');

  constructor(config?: InfrastructureConfig) {
    this.monitor = new SystemMonitor(config);
  }

  async initialize(): Promise<void> {
    await this.monitor.initialize();
  }

  async shutdown(): Promise<void> {
    await this.monitor.shutdown();
  }

  /**
   * Perform health check
   */
  async check(): Promise<HealthStatus> {
    return this.monitor.getHealthStatus();
  }
}

// =============================================================================
// INFRASTRUCTURE METRICS
// =============================================================================

/**
 * Infrastructure-specific metrics collection
 */
export class InfrastructureMetrics {
  private logger = getLogger('InfrastructureMetrics');

  /**
   * Track system operation
   */
  trackSystemOperation(operation: string, duration: number, success: boolean): void {
    recordHistogram(`infrastructure.${operation}.duration`, duration);
    recordMetric(`infrastructure.${operation}.calls`, 1, { 
      status: success ? 'success' : 'error' 
    });
  }

  /**
   * Track resource utilization
   */
  trackResourceUtilization(resource: string, utilization: number): void {
    recordGauge(`infrastructure.resource.${resource}`, utilization);
  }

  /**
   * Track infrastructure event
   */
  trackEvent(event: string, attributes: Record<string, any> = {}): void {
    recordMetric(`infrastructure.event.${event}`, 1, attributes);
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create system monitor instance
 */
export function createSystemMonitor(config?: InfrastructureConfig): SystemMonitor {
  return new SystemMonitor(config);
}

/**
 * Create performance tracker instance
 */
export function createPerformanceTracker(): PerformanceTracker {
  return new PerformanceTracker();
}

/**
 * Create health checker instance
 */
export function createHealthChecker(config?: InfrastructureConfig): HealthChecker {
  return new HealthChecker(config);
}

/**
 * Get system monitoring access (main facade interface)
 */
export async function getSystemMonitoring(config?: SystemMonitoringConfig): Promise<any> {
  // Initialize telemetry if needed
  if (config?.serviceName) {
    const telemetryConfig: TelemetryConfig = {
      serviceName: config.serviceName,
      enableTracing: true,
      enableMetrics: true
    };
    await initializeTelemetry(telemetryConfig);
  }

  const monitor = new SystemMonitor(config);
  const tracker = new PerformanceTracker();
  const healthChecker = new HealthChecker(config);

  await monitor.initialize();
  await healthChecker.initialize();

  return {
    // System monitoring
    getMetrics: () => monitor.getMetrics(),
    getHealthStatus: () => healthChecker.check(),
    
    // Performance tracking
    trackOperation: (name: string, duration: number) => tracker.recordDuration(name, duration),
    startTimer: (name: string) => tracker.startTimer(name),
    getPerformanceMetrics: () => tracker.getMetrics(),
    
    // Infrastructure metrics
    trackSystem: (metrics: any) => recordMetric('system.health', metrics.cpu + metrics.memory),
    trackPerformance: (operation: string, duration: number) => recordHistogram('operation.duration', duration, { operation }),
    
    // Lifecycle
    shutdown: async () => {
      await monitor.shutdown();
      await healthChecker.shutdown();
    }
  };
}