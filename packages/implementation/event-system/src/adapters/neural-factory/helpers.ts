/**
 * @file Neural Event Factory - Helper Functions
 * 
 * Utility functions and helpers for neural event factory operations.
 */

import type { EventManagerConfig } from '../../core/interfaces';
import { EventManagerTypes } from '../../core/interfaces';

/**
 * Helper functions for neural event factory operations.
 */
export class NeuralFactoryHelpers {
  /**
   * Create default neural event manager configuration.
   */
  static createDefaultConfig(name: string, overrides?: Partial<EventManagerConfig>): EventManagerConfig {
    return {
      name,
      type: EventManagerTypes.NEURAL,
      processing: {
        strategy: 'batched',
        queueSize: 10000,
        batchSize: 100,
        timeout: 10000,
      },
      retry: {
        attempts: 5,
        delay: 2000,
        backoff: 'exponential',
        maxDelay: 10000,
      },
      health: {
        checkInterval: 45000,
        timeout: 8000,
        failureThreshold: 3,
        successThreshold: 2,
        enableAutoRecovery: true,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        enableProfiling: true,
      },
      ...overrides,
    };
  }

  /**
   * Validate neural event manager configuration.
   */
  static validateConfig(config: EventManagerConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!config?.type || config?.type !== EventManagerTypes.NEURAL) {
      throw new Error('Configuration must have type "neural"');
    }

    // Validate processing strategy
    if (config?.processing?.strategy) {
      const validStrategies = ['immediate', 'queued', 'batched', 'throttled'];
      if (!validStrategies.includes(config?.processing?.strategy)) {
        throw new Error(`Invalid processing strategy: ${config?.processing?.strategy}`);
      }
    }

    // Validate batch configuration for neural processing
    if (config?.processing?.strategy === 'batched') {
      if (!config?.processing?.batchSize || config?.processing?.batchSize < 10) {
        throw new Error('Neural processing requires minimum batch size of 10');
      }
      if (!config?.processing?.timeout || config?.processing?.timeout < 5000) {
        throw new Error('Neural processing requires minimum timeout of 5000ms');
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
    startTime: Date,
    neuralMetrics?: {
      totalInferences: number;
      averageInferenceTime: number;
      modelAccuracy: number;
      learningProgress: number;
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
      neuralMetrics: neuralMetrics || {
        totalInferences: 0,
        averageInferenceTime: 0,
        modelAccuracy: 0,
        learningProgress: 0,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Evaluate neural model performance.
   */
  static evaluateModelPerformance(accuracy: number, inferenceTime: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (accuracy > 0.9 && inferenceTime < 100) return 'excellent';
    if (accuracy > 0.8 && inferenceTime < 500) return 'good';
    if (accuracy > 0.7 && inferenceTime < 1000) return 'fair';
    return 'poor';
  }

  /**
   * Optimize neural processing parameters based on performance.
   */
  static optimizeParameters(currentAccuracy: number, currentInferenceTime: number): {
    batchSize: number;
    learningRate: number;
    timeout: number;
  } {
    // Simple optimization logic - can be enhanced with more sophisticated algorithms
    let batchSize = 100;
    let learningRate = 0.001;
    let timeout = 10000;

    if (currentAccuracy < 0.7) {
      // Increase learning rate and reduce batch size for better accuracy
      learningRate = 0.01;
      batchSize = 50;
      timeout = 15000;
    } else if (currentInferenceTime > 1000) {
      // Increase batch size and reduce timeout for better performance
      batchSize = 200;
      timeout = 8000;
    }

    return { batchSize, learningRate, timeout };
  }
}