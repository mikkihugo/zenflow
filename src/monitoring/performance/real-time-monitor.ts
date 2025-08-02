/**
 * Real-time Performance Monitoring System for Claude-Zen
 * Provides comprehensive performance tracking and alerting
 */

import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import { cpuUsage, memoryUsage } from 'node:process';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceBounds {
  min?: number;
  max?: number;
  p95?: number;
  p99?: number;
}

export interface AlertConfig {
  metric: string;
  threshold: number;
  comparison: 'gt' | 'lt' | 'eq';
  enabled: boolean;
}

export class RealTimePerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: AlertConfig[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(
    private config: {
      retentionPeriod?: number; // milliseconds
      alertThresholds?: AlertConfig[];
      samplingInterval?: number;
    } = {}
  ) {
    super();

    this.config = {
      retentionPeriod: 5 * 60 * 1000, // 5 minutes
      samplingInterval: 1000, // 1 second
      ...config,
    };

    if (config.alertThresholds) {
      this.alerts = config.alertThresholds;
    }

    this.setupDefaultAlerts();
  }

  /**
   * Start real-time monitoring
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🚀 Starting real-time performance monitoring...');

    // Start periodic system metrics collection
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.cleanupOldMetrics();
      this.checkAlerts();
    }, this.config.samplingInterval);

    this.emit('monitoring:started');
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('⏹️  Performance monitoring stopped');
    this.emit('monitoring:stopped');
  }

  /**
   * Record a performance metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);
    this.emit('metric:recorded', metric);

    // Check if this metric triggers any alerts
    this.checkMetricAlerts(metric);
  }

  /**
   * Measure execution time of a function
   */
  measure<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.record(`${name}.duration`, duration, tags);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${name}.error_duration`, duration, tags);
      this.record(`${name}.error_count`, 1, tags);
      throw error;
    }
  }

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(`${name}.duration`, duration, tags);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${name}.error_duration`, duration, tags);
      this.record(`${name}.error_count`, 1, tags);
      throw error;
    }
  }

  /**
   * Get performance metrics for a specific metric name
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get aggregated statistics for a metric
   */
  getStats(name: string): PerformanceBounds & { count: number } {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) {
      return { count: 0 };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      p95: this.percentile(values, 0.95),
      p99: this.percentile(values, 0.99),
    };
  }

  /**
   * Get current system performance snapshot
   */
  getSystemSnapshot(): Record<string, any> {
    const mem = memoryUsage();
    const cpu = cpuUsage();

    return {
      timestamp: Date.now(),
      memory: {
        heapUsed: mem.heapUsed / 1024 / 1024, // MB
        heapTotal: mem.heapTotal / 1024 / 1024,
        external: mem.external / 1024 / 1024,
        rss: mem.rss / 1024 / 1024,
      },
      cpu: {
        user: cpu.user / 1000, // microseconds to milliseconds
        system: cpu.system / 1000,
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      monitoring: {
        isActive: this.isMonitoring,
        metricsCount: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
        uniqueMetrics: this.metrics.size,
      },
      system: this.getSystemSnapshot(),
      metrics: {},
    };

    // Add statistics for each metric
    for (const [name] of this.metrics) {
      report.metrics[name] = this.getStats(name);
    }

    return JSON.stringify(report, null, 2);
  }

  /**
   * Add performance alert
   */
  addAlert(alert: AlertConfig): void {
    this.alerts.push(alert);
  }

  /**
   * Remove performance alert
   */
  removeAlert(metric: string): void {
    this.alerts = this.alerts.filter((alert) => alert.metric !== metric);
  }

  /**
   * Private methods
   */
  private collectSystemMetrics(): void {
    const snapshot = this.getSystemSnapshot();

    this.record('system.memory.heap_used', snapshot.memory.heapUsed);
    this.record('system.memory.heap_total', snapshot.memory.heapTotal);
    this.record('system.memory.rss', snapshot.memory.rss);
    this.record('system.cpu.user', snapshot.cpu.user);
    this.record('system.cpu.system', snapshot.cpu.system);
    this.record('system.uptime', snapshot.uptime);
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.config.retentionPeriod!;

    for (const [name, metrics] of this.metrics) {
      const filtered = metrics.filter((metric) => metric.timestamp > cutoff);
      if (filtered.length !== metrics.length) {
        this.metrics.set(name, filtered);
      }
    }
  }

  private checkAlerts(): void {
    for (const alert of this.alerts) {
      if (!alert.enabled) continue;

      const latestMetrics = this.getMetrics(alert.metric);
      if (latestMetrics.length === 0) continue;

      const latestValue = latestMetrics[latestMetrics.length - 1].value;
      const triggered = this.evaluateAlert(latestValue, alert);

      if (triggered) {
        this.emit('alert:triggered', {
          alert,
          value: latestValue,
          timestamp: Date.now(),
        });
      }
    }
  }

  private checkMetricAlerts(metric: PerformanceMetric): void {
    const relevantAlerts = this.alerts.filter(
      (alert) => alert.enabled && alert.metric === metric.name
    );

    for (const alert of relevantAlerts) {
      const triggered = this.evaluateAlert(metric.value, alert);
      if (triggered) {
        this.emit('alert:triggered', {
          alert,
          value: metric.value,
          timestamp: metric.timestamp,
        });
      }
    }
  }

  private evaluateAlert(value: number, alert: AlertConfig): boolean {
    switch (alert.comparison) {
      case 'gt':
        return value > alert.threshold;
      case 'lt':
        return value < alert.threshold;
      case 'eq':
        return value === alert.threshold;
      default:
        return false;
    }
  }

  private percentile(values: number[], p: number): number {
    const index = Math.ceil(values.length * p) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  private setupDefaultAlerts(): void {
    this.alerts.push(
      {
        metric: 'system.memory.heap_used',
        threshold: 200, // 200MB
        comparison: 'gt',
        enabled: true,
      },
      {
        metric: 'build.duration',
        threshold: 30000, // 30 seconds
        comparison: 'gt',
        enabled: true,
      },
      {
        metric: 'api.response.duration',
        threshold: 1000, // 1 second
        comparison: 'gt',
        enabled: true,
      }
    );
  }
}

// Global performance monitor instance
export const globalMonitor = new RealTimePerformanceMonitor();

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  globalMonitor.start();

  // Handle graceful shutdown
  process.on('SIGTERM', () => globalMonitor.stop());
  process.on('SIGINT', () => globalMonitor.stop());
}

// Performance monitoring decorators and utilities
export function monitored(metricName?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return globalMonitor.measure(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

export function monitoredAsync(metricName?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return globalMonitor.measureAsync(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

// Export types and utilities
export type { PerformanceMetric, PerformanceBounds, AlertConfig };
