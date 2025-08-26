/**
 * @file Neural Factory Helpers
 * 
 * Helper functions for neural event factory operations.
 */

import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';

/**
 * Helper function to validate neural configuration.
 */
export function validateNeuralConfig(config: EventManagerConfig): boolean {
  return !!(config && config.name && config.type === 'neural');
}

/**
 * Helper function to create default neural config.
 */
export function createDefaultNeuralConfig(name: string, overrides?: any): EventManagerConfig {
  return {
    name,
    type: 'neural',
    enabled: true,
    maxListeners: 150,
    processing: {
      strategy: 'batched',
      queueSize: 5000,
      batchSize: 50,
    },
    ...overrides,
  };
}

/**
 * Alias for createDefaultNeuralConfig for compatibility.
 */
export function createDefaultConfig(name: string, overrides?: any): EventManagerConfig {
  return createDefaultNeuralConfig(name, overrides);
}

/**
 * Helper function to optimize neural parameters.
 */
export function optimizeParameters(params: { accuracy: number; inferenceTime: number }): any {
  return {
    batchSize: Math.max(10, Math.floor(params.accuracy * 100) || 50),
    learningRate: params.accuracy < 0.7 ? 0.01 : 0.001,
    timeout: Math.min(5000, Math.max(1000, params.inferenceTime * 2)),
    // Add other optimized parameters as needed
  };
}

/**
 * Helper function for logging neural events.
 */
export function logNeuralEvent(logger: Logger, event: string, data?: any): void {
  logger.debug(`Neural event: ${event}`, data);
}

/**
 * Helper function to generate neural event IDs.
 */
export function generateNeuralEventId(): string {
  return `neural_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to validate generic config.
 */
export function validateConfig(config: any): boolean {
  return !!(config && typeof config === 'object');
}

/**
 * Helper function to calculate metrics.
 */
export function calculateMetrics(
  totalCreated: number,
  totalErrors: number,
  activeInstances: number,
  runningInstances: number,
  startTime: Date
): any {
  const now = new Date();
  const uptimeMs = now.getTime() - startTime.getTime();
  const uptimeMinutes = uptimeMs / (1000 * 60);
  
  return {
    totalCreated,
    totalErrors,
    activeInstances,
    runningInstances,
    uptime: uptimeMs,
    creationRate: uptimeMinutes > 0 ? totalCreated / uptimeMinutes : 0,
    errorRate: totalCreated > 0 ? totalErrors / totalCreated : 0,
    timestamp: now,
  };
}

/**
 * Helper function to evaluate model performance.
 */
export function evaluateModelPerformance(accuracy: number, inferenceTime: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (accuracy >= 0.9 && inferenceTime <= 1000) return 'excellent';
  if (accuracy >= 0.8 && inferenceTime <= 2000) return 'good';
  if (accuracy >= 0.6 && inferenceTime <= 5000) return 'fair';
  return 'poor';
}

/**
 * Collection of neural factory helpers.
 */
export const NeuralFactoryHelpers = {
  validateNeuralConfig,
  createDefaultNeuralConfig,
  createDefaultConfig,
  optimizeParameters,
  logNeuralEvent,
  generateNeuralEventId,
  validateConfig,
  calculateMetrics,
  evaluateModelPerformance,
};