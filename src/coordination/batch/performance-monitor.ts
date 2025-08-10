/**
 * @file Batch Performance Monitor
 * Tracks and compares batch vs sequential execution performance.
 * Implements claude-zen's performance monitoring patterns.
 */

import { createLogger } from '../../core/logger';

const logger = createLogger({ prefix: 'BatchPerformanceMonitor' });

export interface PerformanceMetrics {
  executionMode: 'batch' | 'sequential';
  operationCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  successRate: number;
  throughput: number; // operations per second
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  timestamp: number;
}

export interface PerformanceComparison {
  batchMetrics: PerformanceMetrics;
  sequentialMetrics: PerformanceMetrics;
  speedImprovement: number;
  throughputImprovement: number;
  resourceEfficiency: number;
  tokenReduction: number;
  recommendations: string[];
}

export interface PerformanceTrend {
  metric: keyof PerformanceMetrics;
  values: number[];
  timestamps: number[];
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number; // percentage change per hour
}

/**
 * Monitors and tracks performance of batch operations vs sequential execution.
 * Provides insights and recommendations for optimization.
 *
 * @example
 */
export class BatchPerformanceMonitor {
  private readonly metricsHistory: PerformanceMetrics[];
  private readonly maxHistorySize: number;
  private performanceBaseline: PerformanceMetrics | null;

  constructor(maxHistorySize = 1000) {
    this.metricsHistory = [];
    this.maxHistorySize = maxHistorySize;
    this.performanceBaseline = null;
  }

  /**
   * Record performance metrics for a batch execution.
   *
   * @param summary
   * @param resourceUsage
   * @param resourceUsage.memory
   * @param resourceUsage.cpu
   */
  recordBatchExecution(
    summary: BatchExecutionSummary,
    resourceUsage?: { memory: number; cpu: number }
  ): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      executionMode: 'batch',
      operationCount: summary.totalOperations,
      totalExecutionTime: summary.totalExecutionTime,
      averageExecutionTime: summary.averageExecutionTime,
      successRate:
        summary.totalOperations > 0 ? summary.successfulOperations / summary.totalOperations : 0,
      throughput:
        summary.totalExecutionTime > 0
          ? (summary.successfulOperations / summary.totalExecutionTime) * 1000
          : 0,
      memoryUsage: resourceUsage?.memory ?? 0,
      cpuUsage: resourceUsage?.cpu ?? 0,
      timestamp: Date.now(),
    };

    this.addMetrics(metrics);

    logger.debug('Recorded batch execution metrics', {
      operationCount: metrics.operationCount,
      totalTime: metrics.totalExecutionTime,
      throughput: metrics.throughput.toFixed(2),
      successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
    });

    return metrics;
  }

  /**
   * Record performance metrics for sequential execution (for comparison)
   *
   * @param operationCount
   * @param executionTime
   * @param successfulOperations
   * @param resourceUsage.
   * @param resourceUsage.memory
   * @param resourceUsage.cpu
   */
  recordSequentialExecution(
    operationCount: number,
    executionTime: number,
    successfulOperations: number,
    resourceUsage?: { memory: number; cpu: number }
  ): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      executionMode: 'sequential',
      operationCount,
      totalExecutionTime: executionTime,
      averageExecutionTime: operationCount > 0 ? executionTime / operationCount : 0,
      successRate: operationCount > 0 ? successfulOperations / operationCount : 0,
      throughput: executionTime > 0 ? (successfulOperations / executionTime) * 1000 : 0,
      memoryUsage: resourceUsage?.memory ?? 0,
      cpuUsage: resourceUsage?.cpu ?? 0,
      timestamp: Date.now(),
    };

    this.addMetrics(metrics);

    logger.debug('Recorded sequential execution metrics', {
      operationCount: metrics.operationCount,
      totalTime: metrics.totalExecutionTime,
      throughput: metrics.throughput.toFixed(2),
      successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
    });

    return metrics;
  }

  /**
   * Compare batch vs sequential performance.
   *
   * @param batchMetrics
   * @param sequentialMetrics
   */
  comparePerformance(
    batchMetrics: PerformanceMetrics,
    sequentialMetrics: PerformanceMetrics
  ): PerformanceComparison {
    const speedImprovement =
      sequentialMetrics.totalExecutionTime > 0
        ? sequentialMetrics.totalExecutionTime / batchMetrics.totalExecutionTime
        : 1;

    const throughputImprovement =
      sequentialMetrics.throughput > 0 ? batchMetrics.throughput / sequentialMetrics.throughput : 1;

    // Calculate resource efficiency (less is better for resource usage)
    const memoryEfficiency =
      sequentialMetrics.memoryUsage > 0
        ? sequentialMetrics.memoryUsage / Math.max(batchMetrics.memoryUsage, 1)
        : 1;

    const cpuEfficiency =
      sequentialMetrics.cpuUsage > 0
        ? sequentialMetrics.cpuUsage / Math.max(batchMetrics.cpuUsage, 1)
        : 1;

    const resourceEfficiency = (memoryEfficiency + cpuEfficiency) / 2;

    // Estimate token reduction based on performance improvement
    const tokenReduction = Math.min(35, Math.max(0, (speedImprovement - 1) * 12));

    const recommendations = this.generateRecommendations(
      speedImprovement,
      throughputImprovement,
      resourceEfficiency,
      batchMetrics,
      sequentialMetrics
    );

    return {
      batchMetrics,
      sequentialMetrics,
      speedImprovement: Math.round(speedImprovement * 100) / 100,
      throughputImprovement: Math.round(throughputImprovement * 100) / 100,
      resourceEfficiency: Math.round(resourceEfficiency * 100) / 100,
      tokenReduction: Math.round(tokenReduction * 10) / 10,
      recommendations,
    };
  }

  /**
   * Generate performance improvement recommendations.
   *
   * @param speedImprovement
   * @param throughputImprovement
   * @param resourceEfficiency
   * @param batchMetrics
   * @param _sequentialMetrics
   */
  private generateRecommendations(
    speedImprovement: number,
    throughputImprovement: number,
    resourceEfficiency: number,
    batchMetrics: PerformanceMetrics,
    _sequentialMetrics: PerformanceMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Speed improvement recommendations
    if (speedImprovement < 2.0) {
      recommendations.push('Consider increasing batch size or optimizing operation concurrency');
    } else if (speedImprovement > 4.0) {
      recommendations.push(
        'Excellent speed improvement achieved! Current configuration is optimal'
      );
    }

    // Throughput recommendations
    if (throughputImprovement < 1.5) {
      recommendations.push(
        'Low throughput improvement detected. Check for bottlenecks in operation execution'
      );
    }

    // Resource efficiency recommendations
    if (resourceEfficiency < 0.8) {
      recommendations.push(
        'High resource usage detected. Consider reducing batch concurrency or optimizing operations'
      );
    }

    // Success rate recommendations
    if (batchMetrics.successRate < 0.95) {
      recommendations.push(
        'Low success rate in batch execution. Check error handling and operation dependencies'
      );
    }

    // Operation count recommendations
    if (batchMetrics.operationCount < 3) {
      recommendations.push(
        'Small batch size detected. Batch operations are most effective with 5+ operations'
      );
    } else if (batchMetrics.operationCount > 20) {
      recommendations.push(
        'Large batch size detected. Consider splitting into smaller batches for better error handling'
      );
    }

    return recommendations;
  }

  /**
   * Get performance trends over time.
   *
   * @param metric
   * @param hours
   */
  getPerformanceTrends(metric: keyof PerformanceMetrics, hours = 24): PerformanceTrend {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const recentMetrics = this.metricsHistory.filter((m) => m.timestamp >= cutoffTime);

    if (recentMetrics.length < 2) {
      return {
        metric,
        values: [],
        timestamps: [],
        trend: 'stable',
        changeRate: 0,
      };
    }

    const values = recentMetrics.map((m) => m[metric] as number);
    const timestamps = recentMetrics.map((m) => m.timestamp);

    // Calculate trend using linear regression
    const trend = this.calculateTrend(values, timestamps);
    const changeRate = this.calculateChangeRate(values, hours);

    return {
      metric,
      values,
      timestamps,
      trend,
      changeRate,
    };
  }

  /**
   * Calculate trend direction using simple linear regression.
   *
   * @param values
   * @param timestamps
   */
  private calculateTrend(
    values: number[],
    timestamps: number[]
  ): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';

    const n = values.length;
    const sumX = timestamps.reduce((sum, t) => sum + t, 0);
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = timestamps.reduce((sum, t, i) => sum + t * (values[i] ?? 0), 0);
    const sumXX = timestamps.reduce((sum, t) => sum + t * t, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (Math.abs(slope) < 0.001) return 'stable';
    return slope > 0 ? 'improving' : 'declining';
  }

  /**
   * Calculate percentage change rate per hour.
   *
   * @param values
   * @param hours
   */
  private calculateChangeRate(values: number[], hours: number): number {
    if (values.length < 2) return 0;

    const firstValue = values[0];
    const lastValue = values[values.length - 1];

    if (firstValue === undefined || firstValue === 0) return 0;
    if (lastValue === undefined) return 0;

    const totalChange = ((lastValue - firstValue) / firstValue) * 100;
    return totalChange / hours;
  }

  /**
   * Get summary of recent performance.
   *
   * @param hours
   */
  getPerformanceSummary(hours = 24): {
    totalExecutions: number;
    batchExecutions: number;
    sequentialExecutions: number;
    averageSpeedImprovement: number;
    averageTokenReduction: number;
    recommendations: string[];
  } {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const recentMetrics = this.metricsHistory.filter((m) => m.timestamp >= cutoffTime);

    const batchMetrics = recentMetrics.filter((m) => m.executionMode === 'batch');
    const sequentialMetrics = recentMetrics.filter((m) => m.executionMode === 'sequential');

    let averageSpeedImprovement = 1;
    let averageTokenReduction = 0;

    if (batchMetrics.length > 0 && sequentialMetrics.length > 0) {
      const speedImprovements: number[] = [];
      const tokenReductions: number[] = [];

      batchMetrics.forEach((batchMetric) => {
        // Find closest sequential metric for comparison
        const closestSequential = sequentialMetrics.reduce((closest, current) => {
          const currentDiff = Math.abs(current?.timestamp - batchMetric.timestamp);
          const closestDiff = Math.abs(closest.timestamp - batchMetric.timestamp);
          return currentDiff < closestDiff ? current : closest;
        });

        const comparison = this.comparePerformance(batchMetric, closestSequential);
        speedImprovements.push(comparison.speedImprovement);
        tokenReductions.push(comparison.tokenReduction);
      });

      averageSpeedImprovement =
        speedImprovements.reduce((sum, val) => sum + val, 0) / speedImprovements.length;
      averageTokenReduction =
        tokenReductions.reduce((sum, val) => sum + val, 0) / tokenReductions.length;
    }

    const recommendations = this.generateSummaryRecommendations(
      batchMetrics.length,
      sequentialMetrics.length,
      averageSpeedImprovement,
      averageTokenReduction
    );

    return {
      totalExecutions: recentMetrics.length,
      batchExecutions: batchMetrics.length,
      sequentialExecutions: sequentialMetrics.length,
      averageSpeedImprovement: Math.round(averageSpeedImprovement * 100) / 100,
      averageTokenReduction: Math.round(averageTokenReduction * 10) / 10,
      recommendations,
    };
  }

  /**
   * Generate summary recommendations.
   *
   * @param batchCount
   * @param sequentialCount
   * @param avgSpeedImprovement
   * @param avgTokenReduction
   */
  private generateSummaryRecommendations(
    batchCount: number,
    sequentialCount: number,
    avgSpeedImprovement: number,
    avgTokenReduction: number
  ): string[] {
    const recommendations: string[] = [];

    if (batchCount === 0) {
      recommendations.push(
        'No batch executions detected. Consider using batch operations for better performance'
      );
    } else if (batchCount / (batchCount + sequentialCount) < 0.5) {
      recommendations.push('Low batch execution ratio. Consider batching more operations together');
    }

    if (avgSpeedImprovement < 2.8) {
      recommendations.push(
        'Speed improvement below claude-zen target (2.8x). Optimize batch configuration'
      );
    }

    if (avgTokenReduction < 20) {
      recommendations.push('Token reduction below optimal. Consider larger batch sizes');
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Performance metrics are within expected ranges. Continue current batch strategy'
      );
    }

    return recommendations;
  }

  /**
   * Set performance baseline for comparison.
   *
   * @param metrics
   */
  setBaseline(metrics: PerformanceMetrics): void {
    this.performanceBaseline = { ...metrics };
    logger.info('Performance baseline set', {
      mode: metrics.executionMode,
      throughput: metrics.throughput.toFixed(2),
      successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
    });
  }

  /**
   * Compare current metrics against baseline.
   *
   * @param currentMetrics
   */
  compareToBaseline(currentMetrics: PerformanceMetrics): {
    improvement: number;
    recommendation: string;
  } | null {
    if (!this.performanceBaseline) return null;

    const improvement =
      this.performanceBaseline.throughput > 0
        ? currentMetrics?.throughput / this.performanceBaseline.throughput
        : 1;

    let recommendation: string;
    if (improvement > 1.1) {
      recommendation = 'Performance improved significantly compared to baseline';
    } else if (improvement < 0.9) {
      recommendation = 'Performance degraded compared to baseline. Investigate potential issues';
    } else {
      recommendation = 'Performance is stable compared to baseline';
    }

    return {
      improvement: Math.round(improvement * 100) / 100,
      recommendation,
    };
  }

  /**
   * Add metrics to history with size management.
   *
   * @param metrics
   */
  private addMetrics(metrics: PerformanceMetrics): void {
    this.metricsHistory.push(metrics);

    // Maintain history size limit
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.splice(0, this.metricsHistory.length - this.maxHistorySize);
    }
  }

  /**
   * Get all metrics history.
   */
  getMetricsHistory(): readonly PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Clear metrics history.
   */
  clearHistory(): void {
    this.metricsHistory.length = 0;
    this.performanceBaseline = null;
    logger.info('Performance metrics history cleared');
  }

  /**
   * Export performance data for analysis.
   */
  exportPerformanceData(): {
    metrics: PerformanceMetrics[];
    baseline: PerformanceMetrics | null;
    summary: ReturnType<BatchPerformanceMonitor['getPerformanceSummary']>;
  } {
    return {
      metrics: [...this.metricsHistory],
      baseline: this.performanceBaseline ? { ...this.performanceBaseline } : null,
      summary: this.getPerformanceSummary(),
    };
  }
}
