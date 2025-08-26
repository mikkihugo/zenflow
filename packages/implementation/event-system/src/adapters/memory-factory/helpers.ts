/**
 * @file Memory Event Factory - Helper Functions
 * 
 * Utility functions and helpers for memory event factory operations.
 */

import type { EventManagerConfig } from '../../core/interfaces';
import { EventManagerTypes } from '../../core/interfaces';

/**
 * Helper functions for memory event factory operations.
 */
export class MemoryFactoryHelpers {
  /**
   * Create default memory event manager configuration.
   */
  static createDefaultConfig(name: string, overrides?: Partial<EventManagerConfig>): EventManagerConfig {
    return {
      name,
      type: EventManagerTypes.MEMORY,
      processing: {
        strategy: 'queued',
        queueSize: 5000,
      },
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
        maxDelay: 5000,
      },
      health: {
        checkInterval: 60000,
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
   * Validate memory event manager configuration.
   */
  static validateConfig(config: EventManagerConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!config?.type || config?.type !== EventManagerTypes.MEMORY) {
      throw new Error('Configuration must have type "memory"');
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
   * Calculate factory metrics from operational data.
   */
  static calculateMetrics(
    totalCreated: number,
    totalErrors: number,
    activeInstances: number,
    runningInstances: number,
    startTime: Date
  ) {
    const uptime = Date.now() - startTime.getTime();
    const hours = uptime / (1000 * 60 * 60);
    
    // Get memory usage information
    const memoryUsage = process.memoryUsage();
    
    return {
      totalCreated,
      totalErrors,
      activeInstances,
      runningInstances,
      uptime,
      creationRate: hours > 0 ? totalCreated / hours : 0,
      errorRate: totalCreated > 0 ? totalErrors / totalCreated : 0,
      memoryUsage: {
        total: memoryUsage.heapTotal,
        used: memoryUsage.heapUsed,
        available: memoryUsage.heapTotal - memoryUsage.heapUsed,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Check if memory usage is within acceptable limits.
   */
  static checkMemoryHealth(threshold: number = 0.8): boolean {
    const memoryUsage = process.memoryUsage();
    const usageRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
    return usageRatio < threshold;
  }

  /**
   * Suggest garbage collection if memory usage is high.
   */
  static suggestGarbageCollection(): void {
    if (global.gc && !this.checkMemoryHealth(0.7)) {
      global.gc();
    }
  }
}