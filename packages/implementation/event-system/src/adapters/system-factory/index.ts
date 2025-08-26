/**
 * @file System Event Factory - Main Export
 * 
 * Exports the modular system event factory system with all components.
 */

// Type exports
export type {
  SystemEventFactoryConfig,
  SystemFactoryMetrics,
  SystemHealthResult,
  FactoryOperationResult,
  BulkOperationResult,
} from './types';

// Main factory class
export { SystemEventFactory } from './factory';

// Helper functions and utilities
export { SystemFactoryHelpers } from './helpers';

// Factory function for creating SystemEventFactory instances
import { SystemEventFactory } from './factory';
import type { SystemEventFactoryConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
import { SystemFactoryHelpers } from './helpers';

export function createSystemEventFactory(
  config?: SystemEventFactoryConfig
): SystemEventFactory {
  return new SystemEventFactory(config);
}

// Convenience functions for creating system event managers
export async function createSystemManager(
  config: EventManagerConfig
): Promise<import('../../core/interfaces').EventManager> {
  const factory = new SystemEventFactory();
  return await factory.create(config);
}

export async function createBasicSystemManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = SystemFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'immediate',
      queueSize: 500,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 30000,
      trackLatency: true,
      trackThroughput: false,
      trackErrors: true,
    },
    ...overrides,
  });

  return createSystemManager(config);
}

export async function createRobustSystemManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = SystemFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 5000,
      batchSize: 100,
      timeout: 10000,
    },
    retry: {
      attempts: 5,
      delay: 3000,
      backoff: 'exponential',
      maxDelay: 20000,
    },
    health: {
      checkInterval: 15000,
      timeout: 8000,
      failureThreshold: 5,
      successThreshold: 3,
      enableAutoRecovery: true,
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

  return createSystemManager(config);
}

// Global factory instance
export const systemEventFactory = new SystemEventFactory();

// Default export
export default SystemEventFactory;