/**
 * @file Real-time Memory System Monitor
 * Comprehensive monitoring and analytics for memory operations.
 */

import { EventEmitter } from '@claude-zen/foundation';

import type { MemoryCoordinator } from '../core/memory-coordinator';
import type { BackendInterface } from '../core/memory-system';
import type { PerformanceOptimizer } from '../optimization/performance-optimizer';

interface OperationRecord {
  timestamp: number;
  duration: number;
  operation: string;
  success: boolean;
}

export interface MemoryMetrics {
  timestamp: number;

  // Performance Metrics
  operationsPerSecond: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;

  // Memory Usage
  totalMemoryUsage: number;
  cacheSize: number;
  cacheHitRate: number;
  cacheMissRate: number;

  // Coordination Metrics
  activeNodes: number;
  healthyNodes: number;
  consensus: {
    decisions: number;
    successful: number;
    failed: number;
    averageTime: number;
  };

  // Backend Metrics
  backends: {
    [id: string]: {
      status: 'healthy|degraded|failed';
      operations: number;
      errors: number;
      latency: number;
    };
  };

  // Error Metrics
  errorRate: number;
  errorsByType: Record<string, number>;
  recoveryRate: number;
}

export interface MemoryAlert {
  id: string;
  type: 'performance|capacity|error|coordination';
  severity: 'info|warning|error|critical';
  message: string;
  timestamp: number;
  source: string;
  metadata?: Record<string, unknown>;
  acknowledged: boolean;
  resolved: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  collectInterval: number; // ms
  retentionPeriod: number; // ms
  alerts: {
    enabled: boolean;
    thresholds: {
      latency: number;
      errorRate: number;
      memoryUsage: number;
      cacheHitRate: number;
    };
  };
  metrics: {
    detailed: boolean;
    histograms: boolean;
    percentiles: boolean;
  };
}

/**
 * Real-time Memory Monitor.
 * Provides comprehensive monitoring and alerting for memory systems.
 *
 * @example
 */
export class MemoryMonitor extends EventEmitter {
  private config: MonitoringConfig;
  private metrics: MemoryMetrics[] = [];
  private alerts: MemoryAlert[] = [];
  private collecting = false;
  private collectInterval: NodeJS.Timeout | null = null;

  // Component references
  private backends = new Map<string, BackendInterface>();
  private coordinator?: MemoryCoordinator;
  private optimizer?: PerformanceOptimizer;

  // Operational tracking
  private operationHistory: Array<{
    timestamp: number;
    operation: string;
    duration: number;
    success: boolean;
  }> = [];
  private latencyHistogram = new Map<number, number>();

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;

    if (config?.enabled) {
      this.startCollection();
    }
  }

  /**
   * Register components for monitoring.
   *
   * @param id
   * @param backend
   */
  registerBackend(id: string, backend: BackendInterface): void {
    this.backends.set(id, backend);
    this.emit('backendRegistered', { id });
  }

  registerCoordinator(coordinator: MemoryCoordinator): void {
    this.coordinator = coordinator;
    this.emit('coordinatorRegistered', {});
  }

  registerOptimizer(optimizer: PerformanceOptimizer): void {
    this.optimizer = optimizer;
    this.emit('optimizerRegistered', {});
  }

  /**
   * Start metric collection.
   */
  startCollection(): void {
    if (this.collecting) return;

    this.collecting = true;
    this.collectInterval = setInterval(() => {
      this.collectMetrics();
    }, this.configuration.collectInterval);

    this.emit('collectionStarted', {});
  }

  /**
   * Stop metric collection.
   */
  stopCollection(): void {
    if (!this.collecting) return;

    this.collecting = false;
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }

    this.emit('collectionStopped', {});
  }

  /**
   * Record an operation for tracking.
   *
   * @param operation
   * @param duration
   * @param success
   */
  recordOperation(operation: string, duration: number, success: boolean): void {
    const record = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
    };

    this.operationHistory.push(record);

    // Update latency histogram
    const bucket = Math.floor(duration / 10) * 10; // 10ms buckets
    this.latencyHistogram.set(
      bucket,
      (this.latencyHistogram.get(bucket) || 0) + 1
    );

    // Limit history size
    if (this.operationHistory.length > 10000) {
      this.operationHistory = this.operationHistory.slice(-8000);
    }

    // Limit histogram size
    if (this.latencyHistogram.size > 1000) {
      const sortedBuckets = Array.from(this.latencyHistogram.entries())
        .sort(([a], [b]) => b - a)
        .slice(0, 800);
      this.latencyHistogram = new Map(sortedBuckets);
    }

    this.emit('operationRecorded', record);
  }

  /**
   * Calculate performance metrics from recent operations
   */
  private calculatePerformanceMetrics(recentOperations: OperationRecord[]): {
    operationsPerSecond: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
  } {
    const windowMs = this.configuration.collectInterval * 5;
    const operationsPerSecond = (recentOperations.length / windowMs) * 1000;
    const latencies = recentOperations
      .map((op) => op.duration)
      .sort((a, b) => a - b);
    
    const averageLatency = latencies.length > 0
      ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
      : 0;
    
    const p95Latency = latencies.length > 0
      ? latencies[Math.floor(latencies.length * 0.95)]
      : 0;
    
    const p99Latency = latencies.length > 0
      ? latencies[Math.floor(latencies.length * 0.99)]
      : 0;

    return { operationsPerSecond, averageLatency, p95Latency, p99Latency };
  }

  /**
   * Calculate cache metrics
   */
  private calculateCacheMetrics(totalOperations: number): {
    cacheHitRate: number;
    cacheMissRate: number;
  } {
    const cacheHits = Math.floor(totalOperations * 0.8); // Simulated 80% hit rate
    const cacheHitRate = totalOperations > 0 ? cacheHits / totalOperations : 0;
    const cacheMissRate = 1 - cacheHitRate;
    
    return { cacheHitRate, cacheMissRate };
  }

  /**
   * Get coordinator metrics
   */
  private getCoordinatorMetrics(): {
    consensusMetrics: {
      decisions: number;
      successful: number;
      failed: number;
      averageTime: number;
    };
    activeNodes: number;
    healthyNodes: number;
  } {
    let consensusMetrics = {
      decisions: 0,
      successful: 0,
      failed: 0,
      averageTime: 0,
    };

    let activeNodes = 0;
    let healthyNodes = 0;

    if (this.coordinator) {
      const coordStats = this.coordinator.getStats();
      activeNodes = coordStats.nodes.total;
      healthyNodes = coordStats.nodes.active;

      consensusMetrics = {
        decisions: coordStats.decisions.total,
        successful: coordStats.decisions.completed,
        failed: coordStats.decisions.failed,
        averageTime: 50, // Simulated average consensus time
      };
    }

    return { consensusMetrics, activeNodes, healthyNodes };
  }

  /**
   * Calculate backend metrics
   */
  private calculateBackendMetrics(recentOperations: OperationRecord[]): MemoryMetrics['backends'] {
    const backendMetrics: MemoryMetrics['backends'] = {};
    
    for (const [id] of this.backends) {
      const backendOps = recentOperations.filter((op) =>
        op.operation.includes(id)
      );
      const errors = backendOps.filter((op) => !op.success).length;
      const avgLatency = backendOps.length > 0
        ? backendOps.reduce((sum, op) => sum + op.duration, 0) / backendOps.length
        : 0;

      backendMetrics[id] = {
        status: errors / Math.max(backendOps.length, 1) > 0.1 ? 'degraded' : 'healthy',
        operations: backendOps.length,
        errors,
        latency: avgLatency,
      };
    }

    return backendMetrics;
  }

  /**
   * Calculate error metrics
   */
  private calculateErrorMetrics(recentOperations: OperationRecord[], totalOperations: number): {
    errorRate: number;
    errorsByType: Record<string, number>;
  } {
    const errorOperations = recentOperations.filter((op) => !op.success);
    const errorRate = totalOperations > 0 ? errorOperations.length / totalOperations : 0;
    const errorsByType = errorOperations.reduce(
      (acc, op) => {
        acc[op.operation] = (acc[op.operation] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { errorRate, errorsByType };
  }

  /**
   * Collect current metrics.
   */
  private collectMetrics(): void {
    try {
      const now = Date.now();
      const windowMs = this.configuration.collectInterval * 5; // 5 collection periods
      const recentOperations = this.operationHistory.filter(
        (op) => now - op.timestamp < windowMs
      );

      const { operationsPerSecond, averageLatency, p95Latency, p99Latency } = 
        this.calculatePerformanceMetrics(recentOperations);

      const totalOperations = recentOperations.length;
      const { cacheHitRate, cacheMissRate } = this.calculateCacheMetrics(totalOperations);

      const { consensusMetrics, activeNodes, healthyNodes } = this.getCoordinatorMetrics();
      const backendMetrics = this.calculateBackendMetrics(recentOperations);
      const { errorRate, errorsByType } = this.calculateErrorMetrics(recentOperations, totalOperations);

      const metrics: MemoryMetrics = {
        timestamp: now,
        operationsPerSecond,
        averageLatency,
        p95Latency: p95Latency || 0,
        p99Latency: p99Latency || 0,
        totalMemoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cacheSize: 100, // Simulated cache size in MB
        cacheHitRate,
        cacheMissRate,
        activeNodes,
        healthyNodes,
        consensus: consensusMetrics,
        backends: backendMetrics,
        errorRate,
        errorsByType,
        recoveryRate: 0.95, // Simulated recovery rate
      };

      this.metrics.push(metrics);

      // Limit metrics history
      const maxMetrics = Math.floor(
        this.configuration.retentionPeriod / this.configuration.collectInterval
      );
      if (this.metrics.length > maxMetrics) {
        this.metrics = this.metrics.slice(-Math.floor(maxMetrics * 0.8));
      }

      this.emit('metricsCollected', metrics);

      // Check for alerts
      if (this.configuration.alerts.enabled) {
        this.checkAlerts(metrics);
      }
    } catch (error) {
      this.emit('collectionError', { error: error.message });
    }
  }

  /**
   * Check metrics against alert thresholds.
   *
   * @param metrics
   */
  private checkAlerts(metrics: MemoryMetrics): void {
    const { thresholds } = this.configuration.alerts;

    // Latency alert
    if (metrics.averageLatency > thresholds.latency) {
      this.createAlert({
        type: 'performance',
        severity:
          metrics.averageLatency > thresholds.latency * 2
            ? 'critical'
            : 'warning',
        message: `Average latency (${  metrics.averageLatency.toFixed(2)  }ms) exceeds threshold (${  thresholds.latency  }ms)`,
        source: 'latency_monitor',
        metadata: {
          currentLatency: metrics.averageLatency,
          threshold: thresholds.latency,
          p95Latency: metrics.p95Latency,
          p99Latency: metrics.p99Latency,
        },
      });
    }

    // Error rate alert
    if (metrics.errorRate > thresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity:
          metrics.errorRate > thresholds.errorRate * 2
            ? 'critical'
            : ' warning',
        message: `Error rate (${  (metrics.errorRate * 100).toFixed(2)  }%) exceeds threshold (${  (thresholds.errorRate * 100).toFixed(2)  }%)`,
        source: 'error_monitor',
        metadata: {
          currentErrorRate: metrics.errorRate,
          threshold: thresholds.errorRate,
          errorsByType: metrics.errorsByType,
        },
      });
    }

    // Memory usage alert
    if (metrics.totalMemoryUsage > thresholds.memoryUsage) {
      this.createAlert({
        type: 'capacity',
        severity:
          metrics.totalMemoryUsage > thresholds.memoryUsage * 1.5
            ? 'critical'
            : 'warning',
        message: `Memory usage (${  metrics.totalMemoryUsage.toFixed(2)  }MB) exceeds threshold (${  thresholds.memoryUsage  }MB)`,
        source: 'memory_monitor',
        metadata: {
          currentUsage: metrics.totalMemoryUsage,
          threshold: thresholds.memoryUsage,
          cacheSize: metrics.cacheSize,
        },
      });
    }

    // Cache hit rate alert
    if (metrics.cacheHitRate < thresholds.cacheHitRate) {
      this.createAlert({
        type: 'performance',
        severity:
          metrics.cacheHitRate < thresholds.cacheHitRate * 0.5
            ? 'critical'
            : 'warning',
        message: `Cache hit rate (${  (metrics.cacheHitRate * 100).toFixed(2)  }%) below threshold (${  (thresholds.cacheHitRate * 100).toFixed(2)  }%)`,
        source: 'cache_monitor',
        metadata: {
          currentHitRate: metrics.cacheHitRate,
          threshold: thresholds.cacheHitRate,
          cacheMissRate: metrics.cacheMissRate,
        },
      });
    }

    // Node health alert
    if (metrics.healthyNodes < metrics.activeNodes) {
      this.createAlert({
        type: 'coordination',
        severity:
          metrics.healthyNodes < metrics.activeNodes * 0.5
            ? 'critical'
            : 'warning',
        message: `${metrics.activeNodes - metrics.healthyNodes  } nodes are unhealthy (${  metrics.healthyNodes  }/${  metrics.activeNodes  } healthy)`,
        source: 'node_monitor',
        metadata: {
          activeNodes: metrics.activeNodes,
          healthyNodes: metrics.healthyNodes,
          unhealthyNodes: metrics.activeNodes - metrics.healthyNodes,
        },
      });
    }
  }

  /**
   * Create and emit an alert.
   *
   * @param alertData
   */
  private createAlert(
    alertData: Omit<MemoryAlert, 'id|timestamp|acknowledged|resolved'>
  ): void {
    const alert: MemoryAlert = {
      id: `alert_${  Date.now()  }_${  Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      ...alertData,
    };

    this.alerts.push(alert);

    // Limit alerts history
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-800);
    }

    this.emit('alertCreated', alert);
  }

  /**
   * Acknowledge an alert.
   *
   * @param alertId
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alertAcknowledged', alert);
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert.
   *
   * @param alertId
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alertResolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Get current metrics.
   */
  getCurrentMetrics(): MemoryMetrics | null {
    return this.metrics.length > 0
      ? (this.metrics[this.metrics.length - 1] ?? null)
      : null;
  }

  /**
   * Get metrics for a time range.
   *
   * @param startTime
   * @param endTime
   */
  getMetricsRange(startTime: number, endTime: number): MemoryMetrics[] {
    return this.metrics.filter(
      (m) => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get recent metrics.
   *
   * @param count
   */
  getRecentMetrics(count: number = 100): MemoryMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get active alerts.
   */
  getActiveAlerts(): MemoryAlert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Get all alerts.
   */
  getAllAlerts(): MemoryAlert[] {
    return [...this.alerts];
  }

  /**
   * Get monitoring statistics.
   */
  getStats() {
    const currentMetrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();

    return {
      monitoring: {
        enabled: this.configuration.enabled,
        collecting: this.collecting,
        metricsCollected: this.metrics.length,
        operationsTracked: this.operationHistory.length,
      },
      current: currentMetrics,
      alerts: {
        total: this.alerts.length,
        active: activeAlerts.length,
        bySeverity: activeAlerts.reduce(
          (acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      components: {
        backends: this.backends.size,
        coordinator: !!this.coordinator,
        optimizer: !!this.optimizer,
      },
    };
  }

  /**
   * Generate a health report.
   */
  generateHealthReport(): {
    overall: 'healthy|warning|critical';
    score: number;
    details: Record<string, unknown>;
    recommendations: string[];
  } {
    const currentMetrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();

    if (!currentMetrics) {
      return {
        overall: 'critical',
        score: 0,
        details: { error: 'No metrics available' },
        recommendations: [
          'Start metric collection',
          'Register system components',
        ],
      };
    }

    const scores = {
      latency: Math.max(0, 100 - currentMetrics?.averageLatency),
      errorRate: Math.max(0, 100 - currentMetrics?.errorRate * 1000),
      memory: Math.max(
        0,
        100 - (currentMetrics?.totalMemoryUsage / 1000) * 100
      ),
      cache: currentMetrics?.cacheHitRate * 100,
      nodes:
        currentMetrics?.activeNodes > 0
          ? (currentMetrics?.healthyNodes / currentMetrics?.activeNodes) * 100
          : 100,
    };

    const overallScore =
      Object.values(scores).reduce((sum, score) => sum + score, 0) /
      Object.keys(scores).length;

    let overall: 'healthy|warning|critical';
    if (overallScore >= 80) {
      overall = 'healthy';
    } else if (overallScore >= 60) {
      overall = 'warning';
    } else {
      overall = 'critical';
    }

    const recommendations: string[] = [];
    if (scores.latency < 70) recommendations.push('Optimize system latency');
    if (scores.errorRate < 70)
      recommendations.push('Investigate and fix error sources');
    if (scores.memory < 70) recommendations.push('Optimize memory usage');
    if (scores.cache < 70) recommendations.push('Improve cache configuration');
    if (scores.nodes < 90)
      recommendations.push('Check node health and connectivity');

    return {
      overall,
      score: Math.round(overallScore),
      details: {
        scores,
        metrics: currentMetrics,
        activeAlerts: activeAlerts.length,
        criticalAlerts: activeAlerts.filter((a) => a.severity === 'critical')
          .length,
      },
      recommendations,
    };
  }
}
