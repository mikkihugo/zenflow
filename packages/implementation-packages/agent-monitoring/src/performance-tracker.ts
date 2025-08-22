/**
 * @file Performance Tracker - Replaces Hook System Performance Tracking
 *
 * Monitors agent performance, resource usage, and coordination metrics.
 * This replaces the removed hook system's performance tracking functionality.
 */

import { getLogger, recordMetric } from '@claude-zen/foundation';
import type { AgentId } from './types';

const logger = getLogger('agent-monitoring-performance-tracker');

/**
 * Performance metrics snapshot
 */
export interface PerformanceSnapshot {
  timestamp: number;
  agentId: string;
  operation: string;
  duration: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Performance tracking result (replaces hook performance tracking)
 */
export interface PerformanceTrackingResult {
  tracked: boolean;
  startTime: number;
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
  operation?: string;
  agentId?: string;
  error?: string;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  totalOperations: number;
  avgDuration: number;
  successRate: number;
  memoryTrend: 'increasing | stable' | 'decreasing';
  cpuEfficiency: number;
  recentFailures: number;
}

/**
 * Performance Tracker Configuration
 */
export interface PerformanceTrackerConfig {
  enabled: boolean;
  historySize: number;
  metricsInterval: number;
  alertThresholds: {
    memoryMB: number;
    cpuPercent: number;
    operationTimeoutMs: number;
  };
}

/**
 * Default performance tracker configuration
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceTrackerConfig = {
  enabled: true,
  historySize: 100,
  metricsInterval: 5000, // 5 seconds
  alertThresholds: {
    memoryMB: 500, // 500MB
    cpuPercent: 80, // 80% CPU
    operationTimeoutMs: 30000, // 30 seconds
  },
};

/**
 * Performance Tracker - Monitors agent and coordination performance
 *
 * Replaces the removed hook system's performance tracking with integrated monitoring.
 */
export class PerformanceTracker {
  private config: PerformanceTrackerConfig;
  private snapshots: Map<string, PerformanceSnapshot[]> = new Map();
  private activeOperations: Map<
    string,
    { startTime: number; operation: string; agentId: string }
  > = new Map();
  private baselineMemory: NodeJS.MemoryUsage;
  private baselineCpu: NodeJS.CpuUsage;

  constructor(config?: Partial<PerformanceTrackerConfig>) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
    this.baselineMemory = process.memoryUsage();
    this.baselineCpu = process.cpuUsage();

    if (this.config.enabled) {
      this.startPeriodicMetrics();
    }

    logger.info('PerformanceTracker initialized', {
      enabled: this.config.enabled,
      historySize: this.config.historySize,
    });
  }

  /**
   * Start tracking a performance operation (replaces hook system)
   */
  async trackPerformance(context: {
    operation?: string;
    agentId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PerformanceTrackingResult> {
    if (!this.config.enabled) {
      return {
        tracked: false,
        startTime: 0,
        metrics: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
        },
      };
    }

    try {
      const startTime = Date.now();
      const operationId = `${context.agentId'' | '''' | '''unknown'}-${context.operation'' | '''' | '''unknown'}-${startTime}`;

      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Track active operation
      this.activeOperations.set(operationId, {
        startTime,
        operation: context.operation'' | '''' | '''unknown',
        agentId: context.agentId'' | '''' | '''unknown',
      });

      // Record start metrics
      recordMetric('performance_tracking_started', 1, {
        operation: context.operation'' | '''' | '''unknown',
        agentId: context.agentId'' | '''' | '''unknown',
      });

      return {
        tracked: true,
        startTime,
        metrics: {
          memoryUsage,
          cpuUsage,
        },
        operation: context.operation,
        agentId: context.agentId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Performance tracking failed', { error: errorMessage });

      return {
        tracked: false,
        startTime: Date.now(),
        metrics: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
        },
        error: errorMessage,
      };
    }
  }

  /**
   * Complete performance tracking for an operation
   */
  completeTracking(
    agentId: string,
    operation: string,
    startTime: number,
    success: boolean = true,
    error?: string,
    metadata?: Record<string, unknown>
  ): PerformanceSnapshot {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const snapshot: PerformanceSnapshot = {
      timestamp: endTime,
      agentId,
      operation,
      duration,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(this.baselineCpu),
      success,
      error,
      metadata,
    };

    // Store snapshot
    const agentKey = agentId;
    if (!this.snapshots.has(agentKey)) {
      this.snapshots.set(agentKey, []);
    }

    const agentSnapshots = this.snapshots.get(agentKey)!;
    agentSnapshots.push(snapshot);

    // Maintain history size
    if (agentSnapshots.length > this.config.historySize) {
      agentSnapshots.shift();
    }

    // Clean up active operation
    const operationId = `${agentId}-${operation}-${startTime}`;
    this.activeOperations.delete(operationId);

    // Record completion metrics
    recordMetric('performance_tracking_completed', 1, {
      operation,
      agentId,
      duration: duration.toString(),
      success: success ? 'true' : 'false',
    });

    // Check for performance alerts
    this.checkPerformanceAlerts(snapshot);

    logger.debug('Performance tracking completed', {
      agentId,
      operation,
      duration,
      success,
      memoryMB: Math.round(snapshot.memoryUsage.rss / 1024 / 1024),
    });

    return snapshot;
  }

  /**
   * Get performance statistics for an agent
   */
  getAgentPerformanceStats(agentId: string): PerformanceStats'' | ''null {
    const snapshots = this.snapshots.get(agentId);
    if (!snapshots'' | '''' | ''snapshots.length === 0) {
      return null;
    }

    const successful = snapshots.filter((s) => s.success);
    const recent = snapshots.slice(-10); // Last 10 operations

    const totalOperations = snapshots.length;
    const avgDuration =
      snapshots.reduce((sum, s) => sum + s.duration, 0) / totalOperations;
    const successRate = successful.length / totalOperations;

    // Memory trend analysis
    const memoryTrend = this.calculateMemoryTrend(snapshots);

    // CPU efficiency (lower CPU usage per operation is better)
    const avgCpuUser =
      snapshots.reduce((sum, s) => sum + s.cpuUsage.user, 0) / totalOperations;
    const cpuEfficiency = Math.max(0, 100 - avgCpuUser / 1000); // Normalize to 0-100 scale

    const recentFailures = recent.filter((s) => !s.success).length;

    return {
      totalOperations,
      avgDuration,
      successRate,
      memoryTrend,
      cpuEfficiency,
      recentFailures,
    };
  }

  /**
   * Get all active operations (for monitoring)
   */
  getActiveOperations(): Array<{
    operationId: string;
    agentId: string;
    operation: string;
    elapsedTime: number;
  }> {
    const now = Date.now();
    return Array.from(this.activeOperations.entries()).map(([id, op]) => ({
      operationId: id,
      agentId: op.agentId,
      operation: op.operation,
      elapsedTime: now - op.startTime,
    }));
  }

  /**
   * Clear performance history for an agent
   */
  clearAgentHistory(agentId: string): void {
    this.snapshots.delete(agentId);
    logger.info('Performance history cleared', { agentId });
  }

  /**
   * Clear all performance history
   */
  clearAllHistory(): void {
    this.snapshots.clear();
    this.activeOperations.clear();
    logger.info('All performance history cleared');
  }

  /**
   * Start periodic metrics collection
   */
  private startPeriodicMetrics(): void {
    setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.metricsInterval);
  }

  /**
   * Collect system-wide metrics
   */
  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    recordMetric('system_memory_rss', memoryUsage.rss);
    recordMetric('system_memory_heap_used', memoryUsage.heapUsed);
    recordMetric('system_cpu_user', cpuUsage.user);
    recordMetric('system_cpu_system', cpuUsage.system);
    recordMetric('active_operations_count', this.activeOperations.size);
  }

  /**
   * Calculate memory trend over time
   */
  private calculateMemoryTrend(
    snapshots: PerformanceSnapshot[]
  ): 'increasing | stable' | 'decreasing' {
    if (snapshots.length < 3) return 'stable';

    const recentMemory = snapshots.slice(-5).map((s) => s.memoryUsage.rss);
    const olderMemory = snapshots.slice(-10, -5).map((s) => s.memoryUsage.rss);

    if (recentMemory.length === 0'' | '''' | ''olderMemory.length === 0) return'stable';

    const recentAvg =
      recentMemory.reduce((sum, m) => sum + m, 0) / recentMemory.length;
    const olderAvg =
      olderMemory.reduce((sum, m) => sum + m, 0) / olderMemory.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(snapshot: PerformanceSnapshot): void {
    const memoryMB = snapshot.memoryUsage.rss / 1024 / 1024;
    const cpuPercent =
      (snapshot.cpuUsage.user + snapshot.cpuUsage.system) / 10000; // Convert to percentage

    // Memory alert
    if (memoryMB > this.config.alertThresholds.memoryMB) {
      logger.warn('High memory usage detected', {
        agentId: snapshot.agentId,
        operation: snapshot.operation,
        memoryMB: Math.round(memoryMB),
        threshold: this.config.alertThresholds.memoryMB,
      });

      recordMetric('performance_alert_memory', 1, {
        agentId: snapshot.agentId,
        memoryMB: Math.round(memoryMB).toString(),
      });
    }

    // CPU alert
    if (cpuPercent > this.config.alertThresholds.cpuPercent) {
      logger.warn('High CPU usage detected', {
        agentId: snapshot.agentId,
        operation: snapshot.operation,
        cpuPercent: Math.round(cpuPercent),
        threshold: this.config.alertThresholds.cpuPercent,
      });

      recordMetric('performance_alert_cpu', 1, {
        agentId: snapshot.agentId,
        cpuPercent: Math.round(cpuPercent).toString(),
      });
    }

    // Duration alert
    if (snapshot.duration > this.config.alertThresholds.operationTimeoutMs) {
      logger.warn('Long operation duration detected', {
        agentId: snapshot.agentId,
        operation: snapshot.operation,
        duration: snapshot.duration,
        threshold: this.config.alertThresholds.operationTimeoutMs,
      });

      recordMetric('performance_alert_duration', 1, {
        agentId: snapshot.agentId,
        duration: snapshot.duration.toString(),
      });
    }
  }
}

/**
 * Factory function to create Performance Tracker
 */
export function createPerformanceTracker(
  config?: Partial<PerformanceTrackerConfig>
): PerformanceTracker {
  return new PerformanceTracker(config);
}

/**
 * Global performance tracker instance
 */
let globalTracker: PerformanceTracker | null = null;

/**
 * Get or create global performance tracker
 */
export function getGlobalPerformanceTracker(): PerformanceTracker {
  if (!globalTracker) {
    globalTracker = new PerformanceTracker();
  }
  return globalTracker;
}

/**
 * Utility function to wrap an async operation with performance tracking
 */
export async function withPerformanceTracking<T>(
  operation: string,
  agentId: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const tracker = getGlobalPerformanceTracker();
  const tracking = await tracker.trackPerformance({
    operation,
    agentId,
    metadata,
  });

  try {
    const result = await fn();
    tracker.completeTracking(
      agentId,
      operation,
      tracking.startTime,
      true,
      undefined,
      metadata
    );
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    tracker.completeTracking(
      agentId,
      operation,
      tracking.startTime,
      false,
      errorMessage,
      metadata
    );
    throw error;
  }
}
