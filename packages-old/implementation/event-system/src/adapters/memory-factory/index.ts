/**
 * @file Memory Event Factory - Main Export
 *
 * Exports the modular memory event factory system with all components.
 */

// Type exports
export type {
  MemoryEventFactoryConfig,
  MemoryFactoryMetrics,
  MemoryHealthResult,
  FactoryOperationResult,
  BulkOperationResult,
} from './types';

// Main factory class
export { MemoryEventFactory } from './factory';

// Helper functions and utilities
export { MemoryFactoryHelpers } from './helpers';

// Factory function for creating MemoryEventFactory instances
import { MemoryEventFactory } from './factory';
import type { MemoryEventFactoryConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
import { MemoryFactoryHelpers } from './helpers';

export function createMemoryEventFactory(
  config?: MemoryEventFactoryConfig
): MemoryEventFactory {
  return new MemoryEventFactory(config);
}

// Convenience functions for creating memory event managers
export async function createMemoryManager(
  config: EventManagerConfig
): Promise<import('../../core/interfaces').EventManager> {
  const factory = new MemoryEventFactory();
  return await factory.create(config);
}

export async function createCacheMemoryManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = MemoryFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'immediate',
      queueSize: 10000,
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

  return createMemoryManager(config);
}

export async function createStorageMemoryManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = MemoryFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'queued',
      queueSize: 20000,
    },
    retry: {
      attempts: 5,
      delay: 2000,
      backoff: 'exponential',
      maxDelay: 10000,
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

  return createMemoryManager(config);
}

export async function createStreamingMemoryManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = MemoryFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 50000,
      batchSize: 1000,
      timeout: 5000,
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

  return createMemoryManager(config);
}

export async function createComprehensiveMemoryManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = MemoryFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'queued',
      queueSize: 100000,
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

  return createMemoryManager(config);
}

// Global factory instance
export const memoryEventFactory = new MemoryEventFactory();

// Default export
export default MemoryEventFactory;
