/**
 * Memory Optimization Engine - AI-Driven Performance Optimization
 *
 * Provides intelligent memory optimization with real-time performance monitoring,
 * automated tuning, and predictive optimization strategies.
 */

import {
  TypedEventBase,
  getLogger,
  recordMetric,
  TelemetryManager,
  withTrace,
} from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

import type { OptimizationConfig, OptimizationMetrics } from './types';

interface OptimizationSample {
  timestamp: number;
  memoryUsage: number;
  responseTime: number;
  throughput: number;
  cacheHitRate: number;
  errorRate: number;
  cpuUsage: number;
}

interface OptimizationAction {
  id: string;
  type: 'memory|cache|performance|configuration';
  action: string;
  parameters: Record<string, unknown>;
  expectedImpact: number;
  appliedAt: number;
  result?: {
    success: boolean;
    actualImpact: number;
    measuredAt: number;
  };
}

export class MemoryOptimizationEngine extends TypedEventBase {
  private logger: Logger;
  private config: OptimizationConfig;
  private telemetry: TelemetryManager;
  private metrics: OptimizationMetrics;
  private samples: OptimizationSample[] = [];
  private appliedActions: OptimizationAction[] = [];
  private optimizationTimer?: NodeJS.Timeout;
  private initialized = false;
  private baselineMetrics?: OptimizationSample;

  constructor(config: OptimizationConfig) {
    super();
    this.config = config;
    this.logger = getLogger('MemoryOptimizationEngine');
    this.telemetry = new TelemetryManager({
      serviceName: 'memory-optimization',
      enableTracing: true,
      enableMetrics: true,
    });
    this.initializeMetrics();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await withTrace('memory-optimization-init', async () => {
        await this.telemetry.initialize();

        // Collect baseline metrics
        await this.collectBaselineMetrics();

        // Start optimization monitoring
        if (this.config.enabled && this.config.monitoring.enabled) {
          this.startOptimizationMonitoring();
        }

        this.initialized = true;
        this.logger.info('Memory optimization engine initialized', {
          mode: this.config.mode,
          enabled: this.config.enabled,
        });
        recordMetric('memory_optimization_initialized', 1);
      });
    } catch (error) {
      this.logger.error(
        'Failed to initialize memory optimization engine:',
        error
      );
      throw error;
    }
  }

  async optimize(): Promise<OptimizationMetrics> {
    if (!this.config.enabled) {
      return this.metrics;
    }

    return withTrace('memory-optimization-cycle', async (span) => {
      span?.setAttributes({
        'optimization.mode': this.config.mode,
        'optimization.samples': this.samples.length,
      });

      const startTime = Date.now();

      try {
        // Collect current performance sample
        const currentSample = await this.collectPerformanceSample();
        this.samples.push(currentSample);

        // Keep only recent samples (last hour)
        this.trimSamples();

        // Analyze performance trends
        const analysis = this.analyzePerformanceTrends();

        // Generate optimization recommendations
        const recommendations =
          await this.generateOptimizationRecommendations(analysis);

        // Apply optimizations based on mode
        const appliedOptimizations =
          await this.applyOptimizations(recommendations);

        // Update metrics
        this.updateOptimizationMetrics(currentSample, appliedOptimizations);

        // Emit optimization completed event
        this.emit('optimizationCompleted', {
          sample: currentSample,
          analysis,
          recommendations,
          applied: appliedOptimizations,
          duration: Date.now() - startTime,
        });

        recordMetric('memory_optimization_cycle_completed', 1, {
          mode: this.config.mode,
          optimizationsApplied: appliedOptimizations.length,
        });

        return this.metrics;
      } catch (error) {
        this.logger.error('Memory optimization cycle failed:', error);
        recordMetric('memory_optimization_cycle_failed', 1);
        throw error;
      }
    });
  }

  private initializeMetrics(): void {
    this.metrics = {
      memoryUsage: {
        current: 0,
        peak: 0,
        average: 0,
        limit: this.config.targets.memoryUsage,
      },
      performance: {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        throughput: 0,
        cacheHitRate: 0,
        errorRate: 0,
      },
      operations: {
        reads: 0,
        writes: 0,
        evictions: 0,
        compressions: 0,
        decompressions: 0,
      },
      health: {
        score: 100,
        status: 'optimal',
        issues: [],
        recommendations: [],
      },
    };
  }

  private async collectBaselineMetrics(): Promise<void> {
    this.baselineMetrics = await this.collectPerformanceSample();
    this.logger.info('Baseline metrics collected', this.baselineMetrics);
  }

  private async collectPerformanceSample(): Promise<OptimizationSample> {
    // In a real implementation, these would come from actual system monitoring
    return {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage().heapUsed,
      responseTime: await this.measureAverageResponseTime(),
      throughput: await this.measureThroughput(),
      cacheHitRate: await this.measureCacheHitRate(),
      errorRate: await this.measureErrorRate(),
      cpuUsage: await this.measureCpuUsage(),
    };
  }

  private async measureAverageResponseTime(): Promise<number> {
    // Mock implementation - would integrate with actual telemetry
    return Math.random() * 50 + 10; // 10-60ms
  }

  private async measureThroughput(): Promise<number> {
    // Mock implementation - requests per second
    return Math.random() * 1000 + 100; // 100-1100 rps
  }

  private async measureCacheHitRate(): Promise<number> {
    // Mock implementation - cache hit rate as percentage
    return Math.random() * 0.3 + 0.7; // 70-100%
  }

  private async measureErrorRate(): Promise<number> {
    // Mock implementation - error rate as percentage
    return Math.random() * 0.05; // 0-5%
  }

  private async measureCpuUsage(): Promise<number> {
    // Mock implementation - CPU usage as percentage
    return Math.random() * 0.4 + 0.1; // 10-50%
  }

  private trimSamples(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.samples = this.samples.filter(
      (sample) => sample.timestamp > oneHourAgo
    );
  }

  private analyzePerformanceTrends(): {
    trends: Record<string, 'improving|stable|degrading'>;
    anomalies: string[];
    bottlenecks: string[];
    opportunities: string[];
  } {
    if (this.samples.length < 2) {
      return {
        trends: {},
        anomalies: [],
        bottlenecks: [],
        opportunities: [],
      };
    }

    const recent = this.samples.slice(-10); // Last 10 samples
    const older = this.samples.slice(-20, -10); // Previous 10 samples

    const trends: Record<string, 'improving|stable|degrading'> = {};
    const anomalies: string[] = [];
    const bottlenecks: string[] = [];
    const opportunities: string[] = [];

    // Analyze response time trend
    const recentAvgResponseTime = this.average(
      recent.map((s) => s.responseTime)
    );
    const olderAvgResponseTime = this.average(older.map((s) => s.responseTime));
    trends.responseTime = this.getTrend(
      recentAvgResponseTime,
      olderAvgResponseTime,
      this.config.targets.responseTime
    );

    // Analyze memory usage trend
    const recentAvgMemory = this.average(recent.map((s) => s.memoryUsage));
    const olderAvgMemory = this.average(older.map((s) => s.memoryUsage));
    trends.memoryUsage = this.getTrend(
      recentAvgMemory,
      olderAvgMemory,
      this.config.targets.memoryUsage,
      true
    );

    // Analyze throughput trend
    const recentAvgThroughput = this.average(recent.map((s) => s.throughput));
    const olderAvgThroughput = this.average(older.map((s) => s.throughput));
    trends.throughput = this.getTrend(
      recentAvgThroughput,
      olderAvgThroughput,
      this.config.targets.throughput
    );

    // Analyze cache hit rate trend
    const recentAvgCacheHit = this.average(recent.map((s) => s.cacheHitRate));
    const olderAvgCacheHit = this.average(older.map((s) => s.cacheHitRate));
    trends.cacheHitRate = this.getTrend(
      recentAvgCacheHit,
      olderAvgCacheHit,
      this.config.targets.cacheHitRate
    );

    // Detect anomalies
    if (
      recentAvgResponseTime >
      this.config.monitoring.alertThresholds.responseTime
    ) {
      anomalies.push('High response time detected');
      bottlenecks.push('Response time exceeds threshold');
    }

    if (recentAvgMemory > this.config.monitoring.alertThresholds.memoryUsage) {
      anomalies.push('High memory usage detected');
      bottlenecks.push('Memory usage exceeds threshold');
    }

    const recentAvgErrorRate = this.average(recent.map((s) => s.errorRate));
    if (recentAvgErrorRate > this.config.monitoring.alertThresholds.errorRate) {
      anomalies.push('High error rate detected');
      bottlenecks.push('Error rate exceeds threshold');
    }

    // Identify optimization opportunities
    if (recentAvgCacheHit < this.config.targets.cacheHitRate) {
      opportunities.push('Cache hit rate can be improved');
    }

    if (recentAvgThroughput < this.config.targets.throughput) {
      opportunities.push('Throughput can be increased');
    }

    return { trends, anomalies, bottlenecks, opportunities };
  }

  private getTrend(
    recent: number,
    older: number,
    target: number,
    inverse = false
  ): 'improving|stable|degrading' {
    if (older === 0) return 'stable';

    const change = (recent - older) / older;
    const threshold = 0.05; // 5% change threshold

    if (Math.abs(change) < threshold) {
      return 'stable';
    }

    // For metrics where lower is better (like memory usage, response time)
    if (inverse) {
      return change < 0 ? 'improving' : 'degrading';
    }

    // For metrics where higher is better (like throughput, cache hit rate)
    return change > 0 ? 'improving' : 'degrading';
  }

  private average(values: number[]): number {
    return values.length > 0
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
  }

  private async generateOptimizationRecommendations(analysis: {
    trends: Record<string, string>;
    anomalies: string[];
    bottlenecks: string[];
    opportunities: string[];
  }): Promise<OptimizationAction[]> {
    const recommendations: OptimizationAction[] = [];
    let actionId = 0;

    // Generate recommendations based on trends and issues
    if (analysis.trends.memoryUsage === 'degrading') {
      recommendations.push({
        id: `opt-${++actionId}`,
        type: 'memory',
        action: 'increase_cache_eviction_frequency',
        parameters: { multiplier: 1.5 },
        expectedImpact: 0.2,
        appliedAt: 0,
      });
    }

    if (analysis.trends.responseTime === 'degrading') {
      recommendations.push({
        id: `opt-${++actionId}`,
        type: 'performance',
        action: 'enable_compression',
        parameters: { level: 6 },
        expectedImpact: 0.15,
        appliedAt: 0,
      });
    }

    if (analysis.trends.cacheHitRate === 'degrading') {
      recommendations.push({
        id: `opt-${++actionId}`,
        type: 'cache',
        action: 'increase_cache_size',
        parameters: { sizeFactor: 1.2 },
        expectedImpact: 0.1,
        appliedAt: 0,
      });
    }

    if (analysis.trends.throughput === 'degrading') {
      recommendations.push({
        id: `opt-${++actionId}`,
        type: 'performance',
        action: 'enable_prefetching',
        parameters: { enabled: true, lookahead: 3 },
        expectedImpact: 0.25,
        appliedAt: 0,
      });
    }

    // Sort by expected impact (highest first)
    recommendations.sort((a, b) => b.expectedImpact - a.expectedImpact);

    return recommendations;
  }

  private async applyOptimizations(
    recommendations: OptimizationAction[]
  ): Promise<OptimizationAction[]> {
    const applied: OptimizationAction[] = [];

    // Apply optimizations based on mode
    const maxOptimizations = this.getMaxOptimizations();

    for (
      let i = 0;
      i < Math.min(recommendations.length, maxOptimizations);
      i++
    ) {
      const recommendation = recommendations[i];

      try {
        const success = await this.applyOptimization(recommendation);

        recommendation.appliedAt = Date.now();
        recommendation.result = {
          success,
          actualImpact: 0, // Will be measured later
          measuredAt: Date.now(),
        };

        if (success) {
          applied.push(recommendation);
          this.appliedActions.push(recommendation);

          this.emit('optimizationApplied', recommendation);
          recordMetric('memory_optimization_applied', 1, {
            type: recommendation.type,
            action: recommendation.action,
          });
        }
      } catch (error) {
        this.logger.error(
          `Failed to apply optimization ${recommendation.id}:`,
          error
        );
        recommendation.result = {
          success: false,
          actualImpact: 0,
          measuredAt: Date.now(),
        };
      }
    }

    return applied;
  }

  private getMaxOptimizations(): number {
    switch (this.config.mode) {
      case 'conservative':
        return 1;
      case 'balanced':
        return 2;
      case 'aggressive':
        return 4;
      default:
        return 1;
    }
  }

  private async applyOptimization(
    action: OptimizationAction
  ): Promise<boolean> {
    // Mock implementation - in real scenario, this would apply actual optimizations
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate work

    this.logger.info(
      `Applied optimization: ${action.action}`,
      action.parameters
    );

    // Simulate success rate based on mode
    const successRate = this.config.mode === 'aggressive' ? 0.8 : 0.95;
    return Math.random() < successRate;
  }

  private updateOptimizationMetrics(
    sample: OptimizationSample,
    applied: OptimizationAction[]
  ): void {
    // Update current metrics
    this.metrics.memoryUsage.current = sample.memoryUsage;
    this.metrics.memoryUsage.peak = Math.max(
      this.metrics.memoryUsage.peak,
      sample.memoryUsage
    );

    if (this.samples.length > 0) {
      this.metrics.memoryUsage.average = this.average(
        this.samples.map((s) => s.memoryUsage)
      );
    }

    this.metrics.performance.averageResponseTime = sample.responseTime;
    this.metrics.performance.throughput = sample.throughput;
    this.metrics.performance.cacheHitRate = sample.cacheHitRate;
    this.metrics.performance.errorRate = sample.errorRate;

    // Calculate P95 response time from recent samples
    if (this.samples.length >= 20) {
      const recentResponseTimes = this.samples
        .slice(-20)
        .map((s) => s.responseTime)
        .sort((a, b) => a - b);
      this.metrics.performance.p95ResponseTime =
        recentResponseTimes[Math.floor(recentResponseTimes.length * 0.95)];
    }

    // Update health score
    this.updateHealthScore(sample);

    // Update operations count (mock)
    this.metrics.operations.reads += Math.floor(sample.throughput / 2);
    this.metrics.operations.writes += Math.floor(sample.throughput / 4);
    this.metrics.operations.compressions += applied.filter((a) =>
      a.action.includes('compression')
    ).length;
  }

  private updateHealthScore(sample: OptimizationSample): void {
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Penalize based on targets
    if (sample.responseTime > this.config.targets.responseTime) {
      score -= 20;
      issues.push('Response time exceeds target');
      recommendations.push('Consider enabling caching or compression');
    }

    if (sample.memoryUsage > this.config.targets.memoryUsage) {
      score -= 25;
      issues.push('Memory usage exceeds target');
      recommendations.push('Increase cache eviction frequency');
    }

    if (sample.throughput < this.config.targets.throughput) {
      score -= 15;
      issues.push('Throughput below target');
      recommendations.push('Enable prefetching and optimize queries');
    }

    if (sample.cacheHitRate < this.config.targets.cacheHitRate) {
      score -= 10;
      issues.push('Cache hit rate below target');
      recommendations.push('Increase cache size or adjust eviction policy');
    }

    if (sample.errorRate > 0.01) {
      // 1% error rate threshold
      score -= 30;
      issues.push('High error rate detected');
      recommendations.push('Investigate and fix error sources');
    }

    this.metrics.health.score = Math.max(0, score);
    this.metrics.health.issues = issues;
    this.metrics.health.recommendations = recommendations;

    if (score >= 90) {
      this.metrics.health.status = 'optimal';
    } else if (score >= 75) {
      this.metrics.health.status = 'good';
    } else if (score >= 50) {
      this.metrics.health.status = 'warning';
    } else {
      this.metrics.health.status = 'critical';
    }
  }

  private startOptimizationMonitoring(): void {
    this.optimizationTimer = setInterval(async () => {
      try {
        await this.optimize();
      } catch (error) {
        this.logger.error('Optimization monitoring cycle failed:', error);
      }
    }, this.config.monitoring.interval);
  }

  // Public methods

  getMetrics(): OptimizationMetrics {
    return { ...this.metrics };
  }

  getOptimizationHistory(): OptimizationAction[] {
    return [...this.appliedActions];
  }

  getPerformanceSamples(limit = 100): OptimizationSample[] {
    return this.samples.slice(-limit);
  }

  async forceOptimization(): Promise<OptimizationMetrics> {
    this.logger.info('Force optimization requested');
    return this.optimize();
  }

  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart monitoring if interval changed
    if (newConfig.monitoring?.interval !== undefined) {
      if (this.optimizationTimer) {
        clearInterval(this.optimizationTimer);
      }
      if (this.config.enabled && this.config.monitoring.enabled) {
        this.startOptimizationMonitoring();
      }
    }

    this.logger.info('Optimization configuration updated', newConfig);
  }

  async shutdown(): Promise<void> {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }

    this.initialized = false;
    this.logger.info('Memory optimization engine shut down');
  }
}
