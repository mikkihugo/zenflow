/**
 * Performance Optimization Monitor
 * Real-time monitoring and alerting for optimization processes
 */

import { EventEmitter } from 'node:events';
import type { OptimizationResult, PerformanceMetrics } from '../interfaces/optimization-interfaces';

export interface OptimizationAlert {
  id: string;
  type: 'performance_degradation' | 'optimization_failure' | 'target_missed' | 'resource_threshold';
  severity: 'low' | 'medium' | 'high' | 'critical';
  domain: string;
  message: string;
  metrics: PerformanceMetrics;
  timestamp: Date;
  acknowledged: boolean;
}

export interface OptimizationMonitorConfig {
  enabled: boolean;
  monitoringInterval: number;
  alertThresholds: {
    latency: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
  };
  retentionPeriod: number;
  realTimeUpdates: boolean;
}

export interface OptimizationDashboard {
  currentMetrics: PerformanceMetrics;
  trends: {
    latency: number[];
    throughput: number[];
    memoryUsage: number[];
    cpuUsage: number[];
  };
  alerts: OptimizationAlert[];
  optimizationHistory: OptimizationResult[];
  systemHealth: {
    overall: 'healthy' | 'warning' | 'critical';
    domains: Record<string, 'healthy' | 'warning' | 'critical'>;
  };
  recommendations: OptimizationRecommendation[];
}

export interface OptimizationRecommendation {
  id: string;
  domain: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  automated: boolean;
}

export class OptimizationMonitor extends EventEmitter {
  private config: OptimizationMonitorConfig;
  private metricsHistory: Map<string, PerformanceMetrics[]> = new Map();
  private alerts: OptimizationAlert[] = [];
  private optimizationHistory: OptimizationResult[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: Partial<OptimizationMonitorConfig> = {}) {
    super();

    this.config = {
      enabled: true,
      monitoringInterval: 5000, // 5 seconds
      alertThresholds: {
        latency: 100, // >100ms
        throughput: 1000, // <1000 req/sec
        memoryUsage: 0.9, // >90%
        cpuUsage: 0.8, // >80%
        errorRate: 0.01, // >1%
      },
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      realTimeUpdates: true,
      ...config,
    };
  }

  /**
   * Start optimization monitoring
   */
  public startMonitoring(): void {
    if (!this.config.enabled || this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.emit('monitoring:started');

    // Start monitoring loop
    this.monitoringInterval = setInterval(
      () => this.performMonitoringCycle(),
      this.config.monitoringInterval
    );
  }

  /**
   * Stop optimization monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.emit('monitoring:stopped');
  }

  /**
   * Record optimization result
   */
  public recordOptimizationResult(result: OptimizationResult): void {
    this.optimizationHistory.push(result);

    // Cleanup old history
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.optimizationHistory = this.optimizationHistory.filter(
      (r) => r.afterMetrics.timestamp.getTime() > cutoff
    );

    this.emit('optimization:recorded', result);

    // Check for performance degradation
    this.checkPerformanceDegradation(result);
  }

  /**
   * Record performance metrics
   */
  public recordMetrics(domain: string, metrics: PerformanceMetrics): void {
    const domainHistory = this.metricsHistory.get(domain) || [];
    domainHistory.push(metrics);

    // Keep only recent metrics
    const cutoff = Date.now() - this.config.retentionPeriod;
    const filteredHistory = domainHistory.filter((m) => m.timestamp.getTime() > cutoff);

    this.metricsHistory.set(domain, filteredHistory);

    this.emit('metrics:recorded', { domain, metrics });

    // Check for threshold violations
    this.checkThresholds(domain, metrics);
  }

  /**
   * Get current optimization dashboard
   */
  public getDashboard(): OptimizationDashboard {
    const currentMetrics = this.getCurrentMetrics();
    const trends = this.calculateTrends();
    const systemHealth = this.assessSystemHealth();
    const recommendations = this.generateRecommendations();

    return {
      currentMetrics,
      trends,
      alerts: this.getActiveAlerts(),
      optimizationHistory: this.getRecentOptimizations(),
      systemHealth,
      recommendations,
    };
  }

  /**
   * Get alerts by severity
   */
  public getAlertsBySeverity(
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): OptimizationAlert[] {
    return this.alerts.filter((alert) => alert.severity === severity && !alert.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert:acknowledged', alert);
    }
  }

  /**
   * Get optimization trends for domain
   */
  public getOptimizationTrends(
    _domain: string,
    period: number = 3600000
  ): {
    improvements: number[];
    successes: number[];
    failures: number[];
  } {
    const cutoff = Date.now() - period;
    const recentOptimizations = this.optimizationHistory.filter(
      (r) => r.afterMetrics.timestamp.getTime() > cutoff
    );

    const improvements = recentOptimizations.map((r) => r.improvement);
    const successes = recentOptimizations.filter((r) => r.success).length;
    const failures = recentOptimizations.filter((r) => !r.success).length;

    return {
      improvements,
      successes: [successes],
      failures: [failures],
    };
  }

  /**
   * Perform monitoring cycle
   */
  private async performMonitoringCycle(): Promise<void> {
    try {
      // Collect current metrics from all domains
      const domains = ['neural', 'swarm', 'data', 'wasm'];

      for (const domain of domains) {
        const metrics = await this.collectDomainMetrics(domain);
        this.recordMetrics(domain, metrics);
      }

      // Cleanup old data
      this.cleanupOldData();

      this.emit('monitoring:cycle:completed');
    } catch (error) {
      this.emit('monitoring:cycle:error', error);
    }
  }

  /**
   * Check for performance degradation
   */
  private checkPerformanceDegradation(result: OptimizationResult): void {
    if (!result.success) {
      this.createAlert({
        type: 'optimization_failure',
        severity: 'high',
        domain: 'system',
        message: `Optimization failed: ${result.error}`,
        metrics: result.beforeMetrics,
      });
      return;
    }

    if (result.improvement < 0) {
      this.createAlert({
        type: 'performance_degradation',
        severity: 'medium',
        domain: 'system',
        message: `Performance degraded by ${Math.abs(result.improvement * 100).toFixed(1)}%`,
        metrics: result.afterMetrics,
      });
    }
  }

  /**
   * Check threshold violations
   */
  private checkThresholds(domain: string, metrics: PerformanceMetrics): void {
    const thresholds = this.config.alertThresholds;

    if (metrics.latency > thresholds.latency) {
      this.createAlert({
        type: 'resource_threshold',
        severity: 'high',
        domain,
        message: `High latency detected: ${metrics.latency.toFixed(1)}ms`,
        metrics,
      });
    }

    if (metrics.throughput < thresholds.throughput) {
      this.createAlert({
        type: 'resource_threshold',
        severity: 'medium',
        domain,
        message: `Low throughput detected: ${metrics.throughput.toFixed(0)} req/sec`,
        metrics,
      });
    }

    if (metrics.memoryUsage > thresholds.memoryUsage) {
      this.createAlert({
        type: 'resource_threshold',
        severity: 'critical',
        domain,
        message: `High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`,
        metrics,
      });
    }

    if (metrics.cpuUsage > thresholds.cpuUsage) {
      this.createAlert({
        type: 'resource_threshold',
        severity: 'high',
        domain,
        message: `High CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`,
        metrics,
      });
    }

    if (metrics.errorRate > thresholds.errorRate) {
      this.createAlert({
        type: 'resource_threshold',
        severity: 'critical',
        domain,
        message: `High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
        metrics,
      });
    }
  }

  /**
   * Create alert
   */
  private createAlert(alertData: {
    type: OptimizationAlert['type'];
    severity: OptimizationAlert['severity'];
    domain: string;
    message: string;
    metrics: PerformanceMetrics;
  }): void {
    const alert: OptimizationAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
      ...alertData,
    };

    this.alerts.push(alert);
    this.emit('alert:created', alert);

    // Cleanup old alerts
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.alerts = this.alerts.filter((a) => a.timestamp.getTime() > cutoff);
  }

  /**
   * Get current system metrics
   */
  private getCurrentMetrics(): PerformanceMetrics {
    const allMetrics: PerformanceMetrics[] = [];

    for (const domainMetrics of this.metricsHistory.values()) {
      if (domainMetrics.length > 0) {
        allMetrics.push(domainMetrics[domainMetrics.length - 1]);
      }
    }

    if (allMetrics.length === 0) {
      return {
        latency: 0,
        throughput: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        timestamp: new Date(),
      };
    }

    return {
      latency: allMetrics.reduce((sum, m) => sum + m.latency, 0) / allMetrics.length,
      throughput: allMetrics.reduce((sum, m) => sum + m.throughput, 0) / allMetrics.length,
      memoryUsage: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / allMetrics.length,
      cpuUsage: allMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / allMetrics.length,
      errorRate: allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(): OptimizationDashboard['trends'] {
    const trends = {
      latency: [] as number[],
      throughput: [] as number[],
      memoryUsage: [] as number[],
      cpuUsage: [] as number[],
    };

    // Combine metrics from all domains
    const allMetrics: PerformanceMetrics[] = [];
    for (const domainMetrics of this.metricsHistory.values()) {
      allMetrics.push(...domainMetrics);
    }

    // Sort by timestamp
    allMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Take last 20 data points
    const recentMetrics = allMetrics.slice(-20);

    trends.latency = recentMetrics.map((m) => m.latency);
    trends.throughput = recentMetrics.map((m) => m.throughput);
    trends.memoryUsage = recentMetrics.map((m) => m.memoryUsage);
    trends.cpuUsage = recentMetrics.map((m) => m.cpuUsage);

    return trends;
  }

  /**
   * Assess system health
   */
  private assessSystemHealth(): OptimizationDashboard['systemHealth'] {
    const thresholds = this.config.alertThresholds;
    const currentMetrics = this.getCurrentMetrics();

    const domains: Record<string, 'healthy' | 'warning' | 'critical'> = {};
    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Assess each domain using current metrics for most up-to-date status
    for (const [domain, metrics] of this.metricsHistory.entries()) {
      if (metrics.length === 0) {
        domains[domain] = 'warning';
        continue;
      }

      // Use current metrics if available, otherwise fall back to latest historical
      const current = currentMetrics[domain] || metrics[metrics.length - 1];
      let domainHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

      if (current.memoryUsage > thresholds.memoryUsage || current.errorRate > thresholds.errorRate) {
        domainHealth = 'critical';
      } else if (
        current.latency > thresholds.latency ||
        current.cpuUsage > thresholds.cpuUsage ||
        current.throughput < thresholds.throughput
      ) {
        domainHealth = 'warning';
      }

      domains[domain] = domainHealth;

      // Update overall health
      if (domainHealth === 'critical') {
        overallHealth = 'critical';
      } else if (domainHealth === 'warning' && overallHealth === 'healthy') {
        overallHealth = 'warning';
      }
    }

    return { overall: overallHealth, domains };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const currentMetrics = this.getCurrentMetrics();
    const thresholds = this.config.alertThresholds;

    // High latency recommendation
    if (currentMetrics.latency > thresholds.latency) {
      recommendations.push({
        id: 'latency-optimization',
        domain: 'system',
        type: 'latency_reduction',
        priority: 'high',
        description: 'Implement caching and optimize message routing to reduce latency',
        estimatedImpact: 0.4,
        implementationEffort: 'medium',
        automated: true,
      });
    }

    // High memory usage recommendation
    if (currentMetrics.memoryUsage > thresholds.memoryUsage) {
      recommendations.push({
        id: 'memory-optimization',
        domain: 'system',
        type: 'memory_optimization',
        priority: 'critical',
        description: 'Enable memory compression and implement garbage collection optimization',
        estimatedImpact: 0.3,
        implementationEffort: 'high',
        automated: true,
      });
    }

    // Low throughput recommendation
    if (currentMetrics.throughput < thresholds.throughput) {
      recommendations.push({
        id: 'throughput-optimization',
        domain: 'system',
        type: 'throughput_improvement',
        priority: 'medium',
        description: 'Enable batch processing and implement connection pooling',
        estimatedImpact: 0.5,
        implementationEffort: 'medium',
        automated: true,
      });
    }

    return recommendations;
  }

  /**
   * Get active alerts
   */
  private getActiveAlerts(): OptimizationAlert[] {
    return this.alerts.filter((alert) => !alert.acknowledged).slice(-10);
  }

  /**
   * Get recent optimizations
   */
  private getRecentOptimizations(): OptimizationResult[] {
    return this.optimizationHistory.slice(-20);
  }

  /**
   * Collect metrics for specific domain
   */
  private async collectDomainMetrics(domain: string): Promise<PerformanceMetrics> {
    // Mock implementation - replace with actual metrics collection
    const baseLatency = { neural: 50, swarm: 10, data: 30, wasm: 5 }[domain] || 20;
    const baseThroughput = { neural: 500, swarm: 2000, data: 1000, wasm: 3000 }[domain] || 1000;

    return {
      latency: baseLatency + Math.random() * 20,
      throughput: baseThroughput + Math.random() * 500,
      memoryUsage: 0.3 + Math.random() * 0.4,
      cpuUsage: 0.2 + Math.random() * 0.4,
      errorRate: Math.random() * 0.005,
      timestamp: new Date(),
    };
  }

  /**
   * Cleanup old data
   */
  private cleanupOldData(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;

    // Cleanup metrics history
    for (const [domain, metrics] of this.metricsHistory.entries()) {
      const filteredMetrics = metrics.filter((m) => m.timestamp.getTime() > cutoff);
      this.metricsHistory.set(domain, filteredMetrics);
    }

    // Cleanup alerts
    this.alerts = this.alerts.filter((a) => a.timestamp.getTime() > cutoff);

    // Cleanup optimization history
    this.optimizationHistory = this.optimizationHistory.filter(
      (r) => r.afterMetrics.timestamp.getTime() > cutoff
    );
  }
}
