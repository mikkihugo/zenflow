/**
 * @fileoverview System Monitoring Implementation
 *
 * System monitoring using @claude-zen/telemetry for metrics collection.
 */

import {
  getLogger,
} from '@claude-zen/foundation';
import pidusage from 'pidusage';
import * as si from 'systeminformation';

import type { HealthStatus, InfrastructureConfig, SystemMetrics } from './types.js';

// Get logger instance
const logger = getLogger('system-monitoring');

// Define missing types
interface PerformanceMetrics {
  operations: Record<string, {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    avgTime?: number;
    throughput?: number;
  }>;
}

// Helper functions for telemetry
function recordMetric(name: string, value: number): void {
  logger.debug('Metric recorded: ' + (name) + ' = ' + value);
}

function recordHistogram(name: string, value: number): void {
  logger.debug('Histogram recorded: ' + (name) + ' = ' + value);
}

function recordGauge(name: string, value: number): void {
  logger.debug('Gauge recorded: ' + (name) + ' = ' + value);
}

function withAsyncTrace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  logger.debug('Trace started: ' + name);
  return fn().then(
    (result) => {
      logger.debug('Trace completed: ' + (name) + ' (' + Date.now() - start + 'ms)');
      return result;
    },
    (error) => {
      logger.debug('Trace failed: ' + (name) + ' (' + Date.now() - start + 'ms)');
      throw error;
    }
  );
}

async function initializeTelemetry(config: any): Promise<void> {
  logger.info('Telemetry initialized with config:', config);
}

// =============================================================================
// SYSTEM MONITOR
// =============================================================================

/**
 * System resource monitoring using telemetry
 */
export class SystemMonitor {
  private config: Required<InfrastructureConfig>;
  private logger = getLogger('SystemMonitor');
  private monitoringInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor(config: InfrastructureConfig = {}) {
    this.config = {
      enableSystemMetrics:true,
      systemMetricsInterval:5000,
      enablePerformanceTracking:true,
      enableHealthChecks:true,
      healthCheckInterval:10000,
      cpuWarningThreshold:70,
      cpuErrorThreshold:90,
      memoryWarningThreshold:80,
      memoryErrorThreshold:95,
      diskWarningThreshold:80,
      diskErrorThreshold:95,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure telemetry is initialized
      await initializeTelemetry({ serviceName: 'system-monitoring' });

      if (this.config.enableSystemMetrics) {
        this.startSystemMetricsCollection();
      }

      this.initialized = true;
      this.logger.info('System monitor initialized', { config: this.config });
    } catch (error) {
      this.logger.error('Failed to initialize system monitor', { error });
      throw error;
    }
  }

  shutdown(): void {
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
    return await withAsyncTrace('system.get_metrics', async () => {
      const [cpu, memory, disk, network, uptime] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.time(),
      ]);

      const metrics:SystemMetrics = {
        cpu:{
          usage:Math.round(cpu.currentLoad),
          load:cpu.cpus.map((c) => Math.round(c.load)),
          cores:cpu.cpus.length,
        },
        memory:{
          total:memory.total,
          used:memory.used,
          free:memory.free,
          usage:Math.round((memory.used / memory.total) * 100),
        },
        disk:{
          total:disk[0]?.size||0,
          used:disk[0]?.used||0,
          free:disk[0]?.available||0,
          usage:Math.round(
            ((disk[0]?.used||0) / (disk[0]?.size||1)) * 100
          ),
        },
        network:{
          bytesIn:network[0]?.rx_bytes||0,
          bytesOut:network[0]?.tx_bytes||0,
          packetsIn:network[0]?.rx_sec||0,
          packetsOut:network[0]?.tx_sec||0,
        },
        uptime:uptime.uptime,
        timestamp:Date.now(),
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
   * Get process-specific metrics using pidusage
   */
  async getProcessMetrics(pid?: number): Promise<{
    pid: number;
    cpu: number;
    memory: number;
    ppid: number;
    ctime: number;
    elapsed: number;
    timestamp: number;
    name?: string;
    command?: string;
    memoryPercent?: number;
    state?: string;
    started?: number;
    user?: string;
    error?: string;
  }> {
    return await withAsyncTrace('system.get_process_metrics', async () => {
      try {
        const processId = pid ?? process.pid;
        const stats = await pidusage(processId);

        const processMetrics = {
          pid: processId,
          cpu: Math.round((stats.cpu ?? 0) * 100) / 100,
          memory: stats.memory ?? 0,
          ppid: (stats as any).ppid ?? 0,
          ctime: stats.ctime ?? 0,
          elapsed: stats.elapsed ?? 0,
          timestamp: Date.now(),
        };

        // Record process metrics via telemetry
        recordGauge('process.cpu.usage', processMetrics.cpu);
        recordGauge('process.memory.usage', processMetrics.memory);
        recordGauge('process.elapsed.time', processMetrics.elapsed);
        return processMetrics;
      } catch (error) {
        this.logger.warn('Failed to get process metrics', { pid, error });
        return {
          pid: pid ?? process.pid,
          cpu:0,
          memory:0,
          ppid:0,
          ctime:0,
          elapsed:0,
          error: String(error),
          timestamp: Date.now(),
        };
      }
    });
  }

  /**
   * Get all running processes metrics
   */
  async getAllProcessesMetrics(): Promise<any[]> {
    return await withAsyncTrace('system.get_all_processes', async () => {
      try {
        const processes = await si.processes();
        const topProcesses = processes.list
          .filter((p) => p.cpu > 0.1) // Only processes using > 0.1% CPU
          .sort((a, b) => b.cpu - a.cpu) // Sort by CPU usage desc
          .slice(0, 10); // Top 10 processes

        const processMetrics = await Promise.allSettled(
          topProcesses.map(async (proc) => {
            try {
              const stats = await pidusage(proc.pid);
              return {
                pid:proc.pid,
                name:proc.name,
                command:proc.command,
                cpu:Math.round(((stats as any).cpu ?? 0) * 100) / 100,
                memory:(stats as any).memory ?? 0,
                memoryPercent:proc.mem,
                state:proc.state,
                started:proc.started,
                user:proc.user,
              };
            } catch {
              // If pidusage fails, use systeminformation data
              return {
                pid:proc.pid,
                name:proc.name,
                command:proc.command,
                cpu:proc.cpu,
                memory:proc.memRss * 1024, // Convert to bytes
                memoryPercent:proc.mem,
                state:proc.state,
                started:proc.started,
                user:proc.user,
              };
            }
          })
        );

        return processMetrics
          .filter(
            (result):result is PromiseFulfilledResult<any> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);
      } catch (error) {
        this.logger.warn('Failed to get all processes metrics', { error });
        return [];
      }
    });
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return await withAsyncTrace('system.health_check', async () => {
      const [metrics, processMetrics] = await Promise.all([
        this.getMetrics(),
        this.getProcessMetrics(),
      ]);

      const checks: HealthStatus['checks'] = {
        cpu: {
          status:
            metrics.cpu.usage > this.config.cpuErrorThreshold
              ? 'error'
              : metrics.cpu.usage > this.config.cpuWarningThreshold
                ? 'warning'
                : 'ok',
          value: metrics.cpu.usage,
          threshold: this.config.cpuWarningThreshold,
          message: `System CPU usage: ${metrics.cpu.usage}%`,
        },
        memory: {
          status:
            metrics.memory.usage > this.config.memoryErrorThreshold
              ? 'error'
              : metrics.memory.usage > this.config.memoryWarningThreshold
                ? 'warning'
                : 'ok',
          value: metrics.memory.usage,
          threshold: this.config.memoryWarningThreshold,
          message: `System memory usage: ${metrics.memory.usage}%`,
        },
        disk: {
          status:
            metrics.disk.usage > this.config.diskErrorThreshold
              ? 'error'
              : metrics.disk.usage > this.config.diskWarningThreshold
                ? 'warning'
                : 'ok',
          value: metrics.disk.usage,
          threshold: this.config.diskWarningThreshold,
          message: `Disk usage: ${metrics.disk.usage}%`,
        },
        process: {
          status: (processMetrics.cpu ?? 0) > 80 ? 'warning' : 'ok',
          value: processMetrics.cpu ?? 0,
          threshold: 80,
          message: 'Process CPU usage: ' + processMetrics.cpu ?? 0 + '%',
        },
        uptime: {
          status: 'ok',
          value: metrics.uptime,
          threshold: 0,
          message: 'System uptime: ' + Math.round(metrics.uptime / 3600) + ' hours',
        },
      };

  const hasError = Object.values(checks).some((check) => check.status === 'error');
  const hasWarning = Object.values(checks).some((check) => check.status === 'warning');

      const status: HealthStatus = {
        status: hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
        checks,
        timestamp:Date.now(),
        details:{
          systemLoad:metrics.cpu.load,
          processCount:(await this.getAllProcessesMetrics()).length,
          memoryDetails:{
            total:
              Math.round(metrics.memory.total / (1024 * 1024 * 1024)) + ' GB',
            used:
              Math.round(metrics.memory.used / (1024 * 1024 * 1024)) + ' GB',
            free:
              Math.round(metrics.memory.free / (1024 * 1024 * 1024)) + ' GB',
          },
        },
      };

      // Record health status with detailed metrics
      recordMetric('system.health.overall', status.status === 'healthy' ? 1 : 0);
      recordMetric('system.health.checks.total', Object.keys(checks).length);
      recordMetric(
        'system.health.checks.errors',
        Object.values(checks).filter((c) => c.status === 'error').length
      );
      recordMetric(
        'system.health.checks.warnings',
        Object.values(checks).filter((c) => c.status === 'warning').length
      );

      return status;
});
}

  private startSystemMetricsCollection(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        // Collect both system and process metrics
        await Promise.all([
          this.getMetrics(),
          this.getProcessMetrics(),
          this.config.enableHealthChecks
            ? this.getHealthStatus()
            : Promise.resolve(),
        ]);

        // Record collection success
        recordMetric('system.metrics.collection.success', 1);
      } catch (error) {
        this.logger.error('Error collecting system metrics', { error });
        recordMetric('system.metrics.collection.error', 1);
      }
    }, this.config.systemMetricsInterval);

    this.logger.info('Started system metrics collection', {
      interval:this.config.systemMetricsInterval,
      enableHealthChecks:this.config.enableHealthChecks,
    });
}
}

// =============================================================================
// PERFORMANCE TRACKER
// =============================================================================

/**
 * Performance tracking for operations
 */
export class PerformanceTracker {
  private operations: Map<string, number[]> = new Map();
  private logger = getLogger('PerformanceTracker');
  /**
   * Start timing an operation with high precision
   */
  startTimer(name:string): () => number {
    const start = process.hrtime.bigint();

    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      this.recordDuration(name, duration);
      return duration;
    };
  }

  /**
   * Time an async operation
   */
  async timeAsync<T>(name:string, operation:() => Promise<T>): Promise<T> {
    const timer = this.startTimer(name);
    try {
      const result = await operation();
      timer();
      recordMetric(`operation.${name}.success`, 1);
      return result;
    } catch (error) {
      timer();
      recordMetric(`operation.${name}.error`, 1);
      throw error;
    }
  }

  /**
   * Time a sync operation
   */
  time<T>(name:string, operation:() => T): T {
    const timer = this.startTimer(name);
    try {
      const result = operation();
      timer();
      recordMetric(`operation.${name}.success`, 1);
      return result;
    } catch (error) {
      timer();
      recordMetric(`operation.${name}.error`, 1);
      throw error;
    }
  }

  /**
   * Record operation duration
   */
  recordDuration(name:string, duration:number): void {
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
   * Get performance metrics with statistical analysis
   */
  getMetrics(): PerformanceMetrics {
    const operations: PerformanceMetrics['operations'] = {} as any;
    for (const [name, durations] of this.operations.entries()) {
      if (durations.length === 0) continue;

      const sorted = [...durations].sort((a, b) => a - b);
      const count = durations.length;
      const total = durations.reduce((sum, d) => sum + d, 0);
      const avg = total / count;

      // Calculate percentiles
      const p50 = sorted[Math.floor(count * 0.5)];
      const p90 = sorted[Math.floor(count * 0.9)];
      const p95 = sorted[Math.floor(count * 0.95)];
      const p99 = sorted[Math.floor(count * 0.99)];

      // Calculate standard deviation
      const variance =
        durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / count;
      const stdDev = Math.sqrt(variance);

      operations[name] = {
        count,
        totalTime:total,
        avgTime:avg,
        minTime:Math.min(...durations),
        maxTime:Math.max(...durations),
        ...(p50 !== undefined ? { p50 } : {}),
        ...(p90 !== undefined ? { p90 } : {}),
        ...(p95 !== undefined ? { p95 } : {}),
        ...(p99 !== undefined ? { p99 } : {}),
        stdDev,
        throughput:count / (total / 1000), // Operations per second
        trend:this.calculateTrend(durations),
      } as any;
    }

    // Calculate system-wide metrics
    const allOperations = Object.values(operations);
    const systemAvgResponseTime =
      allOperations.length > 0
        ? allOperations.reduce((sum, op) => sum + (op.avgTime || 0), 0) /
          allOperations.length
  : 0;
    const systemThroughput = allOperations.reduce(
      (sum, op) => sum + (op.throughput||0),
      0
    );

    return {
      operations,
      system:{
        responseTime:systemAvgResponseTime,
        throughput:systemThroughput,
        errorRate:0, // Will be enhanced when error tracking is added
      },
      timestamp:Date.now(),
    } as any;
}

  /**
   * Calculate performance trend
   */
  private calculateTrend(
    durations: number[]
  ): 'improving' | 'stable' | 'declining' | 'degrading' {
    if (durations.length < 10) return 'stable';

    const recent = durations.slice(-10);
    const earlier = durations.slice(-20, -10);

    if (earlier.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, d) => sum + d, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d, 0) / earlier.length;

    const change = (recentAvg - earlierAvg) / earlierAvg;

  if (change < -0.05) return 'improving'; // 5% improvement
  if (change > 0.05) return 'degrading'; // 5% degradation
  return 'stable';
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
  private monitor:SystemMonitor;

  constructor(config?:InfrastructureConfig) {
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
    return await this.monitor.getHealthStatus();
  }
}

// =============================================================================
// INFRASTRUCTURE METRICS
// =============================================================================

/**
 * Infrastructure-specific metrics collection
 */
export class InfrastructureMetrics {
  /**
   * Track system operation
   */
  trackSystemOperation(
    operation: string,
    duration: number,
    _success: boolean
  ): void {
  recordHistogram(`infrastructure.${operation}.duration`, duration);
  recordMetric(`infrastructure.${operation}.calls`, 1);
}

  /**
   * Track resource utilization
   */
  trackResourceUtilization(resource:string, utilization:number): void {
    recordGauge('infrastructure.resource.' + resource, utilization);
  }

  /**
   * Track infrastructure event
   */
  trackEvent(event: string, _attributes: Record<string, any> = {}): void {
    recordMetric('infrastructure.event.' + event, 1);
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create system monitor instance
 */
export function createSystemMonitor(
  config?:InfrastructureConfig
):SystemMonitor {
  return new SystemMonitor(config);
}

/**
 * Create performance tracker instance
 */
export function createPerformanceTracker():PerformanceTracker {
  return new PerformanceTracker();
}

/**
 * Create health checker instance
 */
export function createHealthChecker(
  config?:InfrastructureConfig
):HealthChecker {
  return new HealthChecker(config);
}

/**
 * Get system monitoring access (main facade interface)
 */
export async function getSystemMonitoring(
  config?: any
): Promise<any> {
  // Initialize telemetry if needed
  if ((config as any)?.serviceName) {
    await initializeTelemetry({
      serviceName: (config as any).serviceName,
    });
  }

  const monitor = new SystemMonitor(config);
  const tracker = new PerformanceTracker();
  const healthChecker = new HealthChecker(config);

  await monitor.initialize();
  await healthChecker.initialize();

  return {
    // System monitoring
    getMetrics:() => monitor.getMetrics(),
    getHealthStatus:() => healthChecker.check(),

    // Performance tracking
    trackOperation:(name: string, duration:number) =>
      tracker.recordDuration(name, duration),
    startTimer:(name: string) => tracker.startTimer(name),
    getPerformanceMetrics:() => tracker.getMetrics(),

    // Infrastructure metrics
    trackSystem:(metrics: { cpu: number; memory: number }) =>
      recordMetric('system.health', metrics.cpu + metrics.memory),
    trackPerformance: (_operation: string, duration: number) =>
      recordHistogram('operation.duration', duration),

    // Lifecycle
    shutdown: async () => {
      await monitor.shutdown();
      await healthChecker.shutdown();
    },
  };
}
