/**
 * @file Interface Event Factory - Main Export
 * 
 * Exports the modular interface event factory system with all components.
 */

// Type exports
export type {
  InterfaceEventFactoryConfig,
  InterfaceFactoryMetrics,
  InterfaceHealthResult,
  FactoryOperationResult,
  BulkOperationResult,
} from './types';

// Main factory class
export { InterfaceEventFactory } from './factory';

// Helper functions and utilities
export { InterfaceFactoryHelpers } from './helpers';

// Factory function for creating InterfaceEventFactory instances
import { InterfaceEventFactory } from './factory';
import type { InterfaceEventFactoryConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
import { InterfaceFactoryHelpers } from './helpers';

export function createInterfaceEventFactory(
  config?: InterfaceEventFactoryConfig
): InterfaceEventFactory {
  return new InterfaceEventFactory(config);
}

// Convenience functions for creating interface event managers
export async function createInterfaceManager(
  config: EventManagerConfig
): Promise<import('../../core/interfaces').EventManager> {
  const factory = new InterfaceEventFactory();
  return await factory.create(config);
}

export async function createCLIInterfaceManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = InterfaceFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'immediate',
      queueSize: 100,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: true,
      trackThroughput: false,
      trackErrors: true,
    },
    ...overrides,
  });

  return createInterfaceManager(config);
}

export async function createWebInterfaceManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = InterfaceFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'queued',
      queueSize: 1000,
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

  return createInterfaceManager(config);
}

export async function createAPIInterfaceManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = InterfaceFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 2000,
      batchSize: 50,
      timeout: 5000,
    },
    retry: {
      attempts: 5,
      delay: 1000,
      backoff: 'exponential',
      maxDelay: 10000,
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

  return createInterfaceManager(config);
}

export async function createComprehensiveInterfaceManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = InterfaceFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'queued',
      queueSize: 5000,
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

  return createInterfaceManager(config);
}

// Global factory instance
export const interfaceEventFactory = new InterfaceEventFactory();

// Default export
export default InterfaceEventFactory;