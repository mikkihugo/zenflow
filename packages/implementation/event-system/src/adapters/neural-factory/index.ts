/**
 * @file Neural Event Factory - Main Export
 *
 * Exports the modular neural event factory system with all components.
 */

// Type exports
export type {
  NeuralEventFactoryConfig,
  NeuralFactoryMetrics,
  NeuralHealthResult,
  FactoryOperationResult,
  BulkOperationResult,
} from './types';

// Main factory class
export { NeuralEventFactory } from './factory';

// Helper functions and utilities
export { NeuralFactoryHelpers } from './helpers';

// Factory function for creating NeuralEventFactory instances
import { NeuralEventFactory } from './factory';
import type { NeuralEventFactoryConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
import { NeuralFactoryHelpers } from './helpers';

export function createNeuralEventFactory(
  config?: NeuralEventFactoryConfig
): NeuralEventFactory {
  return new NeuralEventFactory(config);
}

// Convenience functions for creating neural event managers
export async function createNeuralManager(
  config: EventManagerConfig
): Promise<import('../../core/interfaces').EventManager> {
  const factory = new NeuralEventFactory();
  return await factory.create(config);
}

export async function createTransformerNeuralManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = NeuralFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 20000,
      batchSize: 64,
      timeout: 15000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
    ...overrides,
  });

  return createNeuralManager(config);
}

export async function createLSTMNeuralManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = NeuralFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 15000,
      batchSize: 32,
      timeout: 12000,
    },
    retry: {
      attempts: 3,
      delay: 1500,
      backoff: 'exponential',
      maxDelay: 8000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 8000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
    ...overrides,
  });

  return createNeuralManager(config);
}

export async function createCNNNeuralManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = NeuralFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 10000,
      batchSize: 128,
      timeout: 20000,
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
  });

  return createNeuralManager(config);
}

export async function createHybridNeuralManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = NeuralFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 25000,
      batchSize: 256,
      timeout: 25000,
    },
    retry: {
      attempts: 5,
      delay: 3000,
      backoff: 'exponential',
      maxDelay: 15000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 3000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
    ...overrides,
  });

  return createNeuralManager(config);
}

export async function createComprehensiveNeuralManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = NeuralFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 50000,
      batchSize: 512,
      timeout: 30000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 2000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true,
    },
    ...overrides,
  });

  return createNeuralManager(config);
}

// Global factory instance
export const neuralEventFactory = new NeuralEventFactory();

// Default export
export default NeuralEventFactory;
