/**
 * @file System Event Adapter - Helper Functions
 * 
 * Utility functions and helpers for system event adapter operations.
 */

import type { EventManagerConfig } from '../../core/interfaces';
import { EventManagerTypes } from '../../core/interfaces';

/**
 * Helper functions for system event adapter operations.
 */
export class SystemAdapterHelpers {
  /**
   * Create default system event manager configuration.
   */
  static createDefaultConfig(name: string, overrides?: Partial<EventManagerConfig>): EventManagerConfig {
    return {
      name,
      type: EventManagerTypes.SYSTEM,
      processing: {
        strategy: 'queued',
        queueSize: 2000,
      },
      retry: {
        attempts: 3,
        delay: 2000,
        backoff: 'exponential',
        maxDelay: 8000,
      },
      health: {
        checkInterval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 2,
        enableAutoRecovery: true,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 15000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        enableProfiling: true,
      },
      ...overrides,
    };
  }

  /**
   * Validate system event manager configuration.
   */
  static validateConfig(config: EventManagerConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!config?.type || config?.type !== EventManagerTypes.SYSTEM) {
      throw new Error('Configuration must have type "system"');
    }

    // Validate processing strategy
    if (config?.processing?.strategy) {
      const validStrategies = ['immediate', 'queued', 'batched', 'throttled'];
      if (!validStrategies.includes(config?.processing?.strategy)) {
        throw new Error(`Invalid processing strategy: ${config?.processing?.strategy}`);
      }
    }

    // Validate retry configuration
    if (config?.retry) {
      if (config?.retry?.attempts && config?.retry?.attempts < 0) {
        throw new Error('Retry attempts must be non-negative');
      }
      if (config?.retry?.delay && config?.retry?.delay < 0) {
        throw new Error('Retry delay must be non-negative');
      }
    }

    // Validate health configuration
    if (config?.health) {
      if (config?.health?.checkInterval && config?.health?.checkInterval < 1000) {
        throw new Error('Health check interval must be at least 1000ms');
      }
      if (config?.health?.timeout && config?.health?.timeout < 100) {
        throw new Error('Health check timeout must be at least 100ms');
      }
    }
  }

  /**
   * Generate unique instance name with timestamp.
   */
  static generateInstanceName(baseName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${baseName}-${timestamp}-${random}`;
  }

  /**
   * Calculate system metrics from operational data.
   */
  static calculateMetrics(
    totalCreated: number,
    totalErrors: number,
    activeInstances: number,
    runningInstances: number,
    startTime: Date,
    systemMetrics?: {
      totalSystemMonitors: number;
      activeSystemMonitors: number;
      failedSystemMonitors: number;
      averageSystemLoad: number;
    }
  ) {
    const uptime = Date.now() - startTime.getTime();
    const hours = uptime / (1000 * 60 * 60);
    
    return {
      totalCreated,
      totalErrors,
      activeInstances,
      runningInstances,
      uptime,
      creationRate: hours > 0 ? totalCreated / hours : 0,
      errorRate: totalCreated > 0 ? totalErrors / totalCreated : 0,
      systemMetrics: systemMetrics || {
        totalSystemMonitors: 0,
        activeSystemMonitors: 0,
        failedSystemMonitors: 0,
        averageSystemLoad: 0,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Calculate system success rate.
   */
  static calculateSystemSuccessRate(active: number, failed: number): number {
    const total = active + failed;
    return total > 0 ? active / total : 1;
  }

  /**
   * Check system resource health.
   */
  static checkResourceHealth(metrics: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  }, thresholds: {
    memory: number;
    cpu: number;
    disk: number;
  } = { memory: 0.8, cpu: 0.8, disk: 0.9 }): 'healthy' | 'degraded' | 'unhealthy' {
    const memoryOk = metrics.memoryUsage < thresholds.memory;
    const cpuOk = metrics.cpuUsage < thresholds.cpu;
    const diskOk = metrics.diskUsage < thresholds.disk;

    if (!memoryOk || !cpuOk || !diskOk) {
      if (metrics.memoryUsage > 0.9 || metrics.cpuUsage > 0.9 || metrics.diskUsage > 0.95) {
        return 'unhealthy';
      }
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Optimize system parameters based on performance.
   */
  static optimizeSystemParameters(
    successRate: number,
    averageSystemLoad: number
  ): {
    queueSize: number;
    retryAttempts: number;
    timeout: number;
    checkInterval: number;
  } {
    let queueSize = 2000;
    let retryAttempts = 3;
    let timeout = 5000;
    let checkInterval = 30000;

    if (successRate < 0.8) {
      // Increase retries and timeout for better reliability
      retryAttempts = 5;
      timeout = 8000;
      checkInterval = 15000; // More frequent checks
    } else if (averageSystemLoad > 0.7) {
      // Reduce load by increasing queue size
      queueSize = 3000;
      timeout = 7000;
    }

    return { queueSize, retryAttempts, timeout, checkInterval };
  }

  /**
   * Validate system state transitions.
   */
  static validateSystemTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'offline': ['starting', 'error'],
      'starting': ['online', 'error'],
      'online': ['degraded', 'offline', 'error'],
      'degraded': ['online', 'offline', 'error'],
      'error': ['offline'], // Allow restart
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Get current system resource usage.
   */
  static async getCurrentResourceUsage(): Promise<{
    memory: { used: number; total: number; percentage: number };
    cpu: { usage: number };
    uptime: number;
  }> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: memoryUsage.heapUsed / memoryUsage.heapTotal,
      },
      cpu: {
        usage: process.cpuUsage().user / 1000000, // Convert to seconds
      },
      uptime,
    };
  }
}