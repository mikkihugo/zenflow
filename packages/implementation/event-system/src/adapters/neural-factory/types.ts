/**
 * @file Neural Event Factory - Type Definitions
 * 
 * Type definitions and interfaces for neural event factory operations.
 */

import type { EventManagerConfig, EventManagerStatus } from '../../core/interfaces';
import type { NeuralEvent } from '../../types';

/**
 * Neural event factory configuration.
 */
export interface NeuralEventFactoryConfig {
  maxInstances?: number;
  defaultTimeout?: number;
  enableMonitoring?: boolean;
  enableHealthChecking?: boolean;
  healthCheckInterval?: number;
  neuralConfig?: {
    modelType: 'transformer' | 'lstm' | 'cnn' | 'hybrid';
    enableLearning: boolean;
    learningRate: number;
    batchSize: number;
  };
  retryConfig?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
}

/**
 * Neural factory metrics.
 */
export interface NeuralFactoryMetrics {
  totalCreated: number;
  totalErrors: number;
  activeInstances: number;
  runningInstances: number;
  uptime: number;
  creationRate: number;
  errorRate: number;
  neuralMetrics: {
    totalInferences: number;
    averageInferenceTime: number;
    modelAccuracy: number;
    learningProgress: number;
  };
  timestamp: Date;
}

/**
 * Neural health result.
 */
export interface NeuralHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeInstances: number;
  runningInstances: number;
  errorRate: number;
  modelPerformance: number;
  uptime: number;
  timestamp: Date;
  details: {
    factoryHealth: string;
    modelHealth: string;
    instanceHealth: Array<{
      name: string;
      status: string;
      modelAccuracy: number;
      lastCheck: Date;
    }>;
  };
}

/**
 * Factory operation result.
 */
export interface FactoryOperationResult {
  success: boolean;
  instanceName?: string;
  error?: Error;
  duration: number;
  timestamp: Date;
}

/**
 * Bulk operation result.
 */
export interface BulkOperationResult {
  totalRequested: number;
  totalSuccessful: number;
  totalFailed: number;
  results: FactoryOperationResult[];
  overallDuration: number;
  timestamp: Date;
}