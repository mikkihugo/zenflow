/**
 * @file Monitoring Event Adapter - Helper Functions
 * 
 * Utility functions and helpers for monitoring event adapter operations.
 */

import type { EventManagerConfig } from '../../core/interfaces';
import { EventManagerTypes } from '../../core/interfaces';

/**
 * Helper functions for monitoring event adapter operations.
 */
export class MonitoringAdapterHelpers {
  /**
   * Create default monitoring event manager configuration.
   */
  static createDefaultConfig(name: string, overrides?: Partial<EventManagerConfig>): EventManagerConfig {
    return {
      name,
      type: EventManagerTypes.MONITORING,
      processing: {
        strategy: 'queued',
        queueSize: 3000,
      },
      retry: {
        attempts: 2,
        delay: 1500,
        backoff: 'linear',
        maxDelay: 5000,
      },
      health: {
        checkInterval: 60000,
        timeout: 6000,
        failureThreshold: 2,
        successThreshold: 1,
        enableAutoRecovery: true,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 5000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        enableProfiling: false,
      },
      ...overrides,
    };
  }

  /**
   * Validate monitoring event manager configuration.
   */
  static validateConfig(config: EventManagerConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!config?.type || config?.type !== EventManagerTypes.MONITORING) {
      throw new Error('Configuration must have type "monitoring"');
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
   * Calculate monitoring metrics from operational data.
   */
  static calculateMetrics(
    totalCreated: number,
    totalErrors: number,
    activeInstances: number,
    runningInstances: number,
    startTime: Date,
    monitoringMetrics?: {
      totalMonitors: number;
      activeMonitors: number;
      failedMonitors: number;
      averageResponseTime: number;
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
      monitoringMetrics: monitoringMetrics || {
        totalMonitors: 0,
        activeMonitors: 0,
        failedMonitors: 0,
        averageResponseTime: 0,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Calculate monitoring success rate.
   */
  static calculateMonitoringSuccessRate(active: number, failed: number): number {
    const total = active + failed;
    return total > 0 ? active / total : 1;
  }

  /**
   * Check system health based on monitoring metrics.
   */
  static checkSystemHealth(metrics: {
    errorRate: number;
    averageResponseTime: number;
    successRate: number;
  }): 'healthy' | 'degraded' | 'unhealthy' {
    if (metrics.errorRate > 0.5 || metrics.successRate < 0.5) {
      return 'unhealthy';
    }
    
    if (metrics.errorRate > 0.1 || metrics.averageResponseTime > 5000 || metrics.successRate < 0.8) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Optimize monitoring parameters based on performance.
   */
  static optimizeMonitoringParameters(
    successRate: number,
    averageResponseTime: number
  ): {
    queueSize: number;
    retryAttempts: number;
    timeout: number;
    checkInterval: number;
  } {
    let queueSize = 3000;
    let retryAttempts = 2;
    let timeout = 6000;
    let checkInterval = 60000;

    if (successRate < 0.8) {
      // Increase retries and timeout for better reliability
      retryAttempts = 4;
      timeout = 10000;
      checkInterval = 30000; // More frequent checks
    } else if (averageResponseTime > 3000) {
      // Increase queue size and timeout for better throughput
      queueSize = 5000;
      timeout = 8000;
    }

    return { queueSize, retryAttempts, timeout, checkInterval };
  }

  /**
   * Validate monitoring state transitions.
   */
  static validateMonitoringTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'inactive': ['active', 'error'],
      'active': ['inactive', 'error', 'degraded'],
      'degraded': ['active', 'error', 'inactive'],
      'error': ['inactive'], // Allow restart
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}