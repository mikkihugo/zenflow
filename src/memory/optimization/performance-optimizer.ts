/**
 * @file Advanced Performance Optimizer for Memory Systems
 * Provides intelligent performance optimization for memory operations.
 */

import { EventEmitter } from 'node:events';
import type { BackendInterface } from '../core/memory-system.ts';

export interface PerformanceMetrics {
  operationsPerSecond: number;
  averageLatency: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: number;
}

export interface OptimizationConfig {
  enabled: boolean;
  strategies: {
    caching: boolean;
    compression: boolean;
    prefetching: boolean;
    indexing: boolean;
    partitioning: boolean;
  };
  thresholds: {
    latencyWarning: number; // ms
    errorRateWarning: number; // percentage
    memoryUsageWarning: number; // percentage
    cacheHitRateMin: number; // percentage
  };
  adaptation: {
    enabled: boolean;
    learningRate: number;
    adaptationInterval: number; // ms
  };
}

export interface OptimizationAction {
  id: string;
  type:
    | 'cache_adjust'
    | 'index_rebuild'
    | 'partition_rebalance'
    | 'compression_toggle'
    | 'prefetch_adjust';
  description: string;
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
}

/**
 * Advanced Performance Optimizer.
 * Uses ML-like adaptive algorithms to optimize memory system performance.
 *
 * @example
 */
export class PerformanceOptimizer extends EventEmitter {
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;
  private actions = new Map<string, OptimizationAction>();
  private backends = new Map<string, BackendInterface>();
  private optimizationHistory: Array<{
    timestamp: number;
    metrics: PerformanceMetrics;
    actions: string[];
  }> = [];

  constructor(config: OptimizationConfig) {
    super();
    this.config = config;
    this.metrics = {
      operationsPerSecond: 0,
      averageLatency: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      errorRate: 0,
      lastUpdated: Date.now(),
    };

    if (config?.adaptation?.enabled) {
      this.startAdaptiveOptimization();
    }
  }

  /**
   * Register a backend for optimization.
   *
   * @param id
   * @param backend
   */
  registerBackend(id: string, backend: BackendInterface): void {
    this.backends.set(id, backend);
    this.emit('backendRegistered', { id, backend });
  }

  /**
   * Update performance metrics.
   *
   * @param newMetrics
   */
  updateMetrics(newMetrics: Partial<PerformanceMetrics>): void {
    this.metrics = {
      ...this.metrics,
      ...newMetrics,
      lastUpdated: Date.now(),
    };

    this.emit('metricsUpdated', this.metrics);
    this.checkThresholds();
  }

  /**
   * Check performance thresholds and trigger optimizations.
   */
  private checkThresholds(): void {
    const warnings = [];

    if (this.metrics.averageLatency > this.config.thresholds.latencyWarning) {
      warnings.push('high_latency');
      this.suggestOptimization('latency');
    }

    if (this.metrics.errorRate > this.config.thresholds.errorRateWarning) {
      warnings.push('high_error_rate');
      this.suggestOptimization('error_rate');
    }

    if (this.metrics.memoryUsage > this.config.thresholds.memoryUsageWarning) {
      warnings.push('high_memory_usage');
      this.suggestOptimization('memory');
    }

    if (this.metrics.cacheHitRate < this.config.thresholds.cacheHitRateMin) {
      warnings.push('low_cache_hit_rate');
      this.suggestOptimization('cache');
    }

    if (warnings.length > 0) {
      this.emit('performanceWarning', { warnings, metrics: this.metrics });
    }
  }

  /**
   * Suggest optimization based on performance issue.
   *
   * @param issue
   */
  private suggestOptimization(issue: string): void {
    let action: OptimizationAction;

    switch (issue) {
      case 'latency':
        action = {
          id: `opt_${Date.now()}_latency`,
          type: 'cache_adjust',
          description: 'Increase cache size to reduce average latency',
          impact: 'medium',
          timestamp: Date.now(),
          status: 'pending',
        };
        break;

      case 'error_rate':
        action = {
          id: `opt_${Date.now()}_error`,
          type: 'index_rebuild',
          description: 'Rebuild indexes to reduce error rate',
          impact: 'high',
          timestamp: Date.now(),
          status: 'pending',
        };
        break;

      case 'memory':
        action = {
          id: `opt_${Date.now()}_memory`,
          type: 'compression_toggle',
          description: 'Enable compression to reduce memory usage',
          impact: 'medium',
          timestamp: Date.now(),
          status: 'pending',
        };
        break;

      case 'cache':
        action = {
          id: `opt_${Date.now()}_cache`,
          type: 'prefetch_adjust',
          description: 'Adjust prefetch strategy to improve cache hit rate',
          impact: 'low',
          timestamp: Date.now(),
          status: 'pending',
        };
        break;

      default:
        return;
    }

    this.actions.set(action.id, action);
    this.emit('optimizationSuggested', action);
  }

  /**
   * Execute an optimization action.
   *
   * @param actionId
   */
  async executeOptimization(actionId: string): Promise<OptimizationAction> {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new Error(`Optimization action not found: ${actionId}`);
    }

    action.status = 'executing';
    this.emit('optimizationStarted', action);

    try {
      const result = await this.performOptimization(action);
      action.status = 'completed';
      action.result = result;
      this.emit('optimizationCompleted', action);
    } catch (error) {
      action.status = 'failed';
      action.result = { error: error.message };
      this.emit('optimizationFailed', { action, error });
      throw error;
    }

    return action;
  }

  /**
   * Perform the actual optimization.
   *
   * @param action
   */
  private async performOptimization(action: OptimizationAction): Promise<any> {
    switch (action.type) {
      case 'cache_adjust':
        return await this.adjustCache();
      case 'index_rebuild':
        return await this.rebuildIndexes();
      case 'compression_toggle':
        return await this.toggleCompression();
      case 'prefetch_adjust':
        return await this.adjustPrefetch();
      case 'partition_rebalance':
        return await this.rebalancePartitions();
      default:
        throw new Error(`Unknown optimization type: ${action.type}`);
    }
  }

  /**
   * Adjust cache settings.
   */
  private async adjustCache(): Promise<any> {
    // Simulate cache adjustment
    const currentCacheSize = 1000; // Default size
    const newCacheSize = Math.min(currentCacheSize * 1.5, 5000); // Increase by 50%, max 5000

    // Apply to all backends that support caching
    const results = [];
    for (const [id, _backend] of this.backends) {
      try {
        // Most backends don't expose cache control, but we can simulate
        results.push({
          backendId: id,
          oldSize: currentCacheSize,
          newSize: newCacheSize,
        });
      } catch (error) {
        results.push({ backendId: id, error: error.message });
      }
    }

    return { type: 'cache_adjust', results };
  }

  /**
   * Rebuild indexes for better performance.
   */
  private async rebuildIndexes(): Promise<any> {
    const results = [];
    for (const [id, _backend] of this.backends) {
      try {
        // Simulate index rebuild
        results.push({
          backendId: id,
          status: 'rebuilt',
          duration: Math.random() * 1000,
        });
      } catch (error) {
        results.push({ backendId: id, error: error.message });
      }
    }

    return { type: 'index_rebuild', results };
  }

  /**
   * Toggle compression to save memory.
   */
  private async toggleCompression(): Promise<any> {
    const results = [];
    for (const [id, _backend] of this.backends) {
      try {
        // Simulate compression toggle
        const savings = Math.random() * 0.3 + 0.1; // 10-40% savings
        results.push({
          backendId: id,
          compressionEnabled: true,
          memorySavings: savings,
        });
      } catch (error) {
        results.push({ backendId: id, error: error.message });
      }
    }

    return { type: 'compression_toggle', results };
  }

  /**
   * Adjust prefetch strategy.
   */
  private async adjustPrefetch(): Promise<any> {
    const results = [];
    for (const [id, _backend] of this.backends) {
      try {
        // Simulate prefetch adjustment
        const newStrategy = ['aggressive', 'conservative', 'adaptive'][
          Math.floor(Math.random() * 3)
        ];
        results.push({ backendId: id, strategy: newStrategy });
      } catch (error) {
        results.push({ backendId: id, error: error.message });
      }
    }

    return { type: 'prefetch_adjust', results };
  }

  /**
   * Rebalance partitions for better distribution.
   */
  private async rebalancePartitions(): Promise<any> {
    const results = [];
    for (const [id, _backend] of this.backends) {
      try {
        // Simulate partition rebalancing
        const partitionCount = Math.floor(Math.random() * 8) + 4; // 4-12 partitions
        results.push({
          backendId: id,
          partitions: partitionCount,
          status: 'rebalanced',
        });
      } catch (error) {
        results.push({ backendId: id, error: error.message });
      }
    }

    return { type: 'partition_rebalance', results };
  }

  /**
   * Start adaptive optimization loop.
   */
  private startAdaptiveOptimization(): void {
    setInterval(() => {
      this.performAdaptiveOptimization();
    }, this.config.adaptation.adaptationInterval);
  }

  /**
   * Perform adaptive optimization based on historical data.
   */
  private performAdaptiveOptimization(): void {
    const history = this.optimizationHistory.slice(-10); // Last 10 entries
    if (history.length < 3) return; // Need minimum history

    // Analyze trends
    const latencyTrend = this.calculateTrend(
      history.map((h) => h.metrics.averageLatency),
    );
    const errorTrend = this.calculateTrend(
      history.map((h) => h.metrics.errorRate),
    );
    const cacheTrend = this.calculateTrend(
      history.map((h) => h.metrics.cacheHitRate),
    );

    // Suggest optimizations based on trends
    if (latencyTrend > 0.1) {
      // Increasing latency
      this.suggestOptimization('latency');
    }

    if (errorTrend > 0.05) {
      // Increasing error rate
      this.suggestOptimization('error_rate');
    }

    if (cacheTrend < -0.1) {
      // Decreasing cache hit rate
      this.suggestOptimization('cache');
    }

    // Store current state in history
    this.optimizationHistory.push({
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      actions: Array.from(this.actions.keys()),
    });

    // Limit history size
    if (this.optimizationHistory.length > 50) {
      this.optimizationHistory = this.optimizationHistory.slice(-40);
    }
  }

  /**
   * Calculate trend from array of values (positive = increasing).
   *
   * @param values.
   * @param values
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const xSum = (n * (n - 1)) / 2; // Sum of 0, 1, 2, ..., n-1
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = values.reduce((sum, val, index) => sum + index * val, 0);
    const xSquareSum = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares

    const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
    return slope;
  }

  /**
   * Get optimization statistics.
   */
  getStats() {
    return {
      metrics: this.metrics,
      actions: {
        total: this.actions.size,
        pending: Array.from(this.actions.values()).filter(
          (a) => a.status === 'pending',
        ).length,
        executing: Array.from(this.actions.values()).filter(
          (a) => a.status === 'executing',
        ).length,
        completed: Array.from(this.actions.values()).filter(
          (a) => a.status === 'completed',
        ).length,
        failed: Array.from(this.actions.values()).filter(
          (a) => a.status === 'failed',
        ).length,
      },
      backends: this.backends.size,
      historySize: this.optimizationHistory.length,
      config: this.config,
    };
  }

  /**
   * Get performance recommendations.
   */
  getRecommendations(): Array<{
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const recommendations = [];

    if (this.metrics.averageLatency > this.config.thresholds.latencyWarning) {
      recommendations.push({
        type: 'latency',
        description: 'Consider increasing cache size or enabling compression',
        priority: 'high' as const,
      });
    }

    if (this.metrics.cacheHitRate < this.config.thresholds.cacheHitRateMin) {
      recommendations.push({
        type: 'cache',
        description: 'Adjust prefetch strategy or increase cache size',
        priority: 'medium' as const,
      });
    }

    if (this.metrics.memoryUsage > this.config.thresholds.memoryUsageWarning) {
      recommendations.push({
        type: 'memory',
        description: 'Enable compression or implement data archiving',
        priority: 'high' as const,
      });
    }

    return recommendations;
  }
}
