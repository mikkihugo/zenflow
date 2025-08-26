/**
 * @file Monitoring Event Factory - Helper Functions
 * 
 * Utility functions and helpers for monitoring event factory operations.
 */

import type { EventManagerConfig } from '../../core/interfaces';
import { EventManagerTypes } from '../../core/interfaces';

/**
 * Helper functions for monitoring event factory operations.
 */
export class MonitoringFactoryHelpers {
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
}