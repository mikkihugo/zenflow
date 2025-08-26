/**
 * @file Workflow Event Factory - Main Export
 *
 * Exports the modular workflow event factory system with all components.
 */

// Type exports
export type {
  WorkflowEventFactoryConfig,
  WorkflowFactoryMetrics,
  WorkflowHealthResult,
  FactoryOperationResult,
  BulkOperationResult,
} from './types';

// Main factory class
export { WorkflowEventFactory } from './factory';

// Helper functions and utilities
export { WorkflowFactoryHelpers } from './helpers';

// Factory function for creating WorkflowEventFactory instances
import { WorkflowEventFactory } from './factory';
import type { WorkflowEventFactoryConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
import { WorkflowFactoryHelpers } from './helpers';

export function createWorkflowEventFactory(
  config?: WorkflowEventFactoryConfig
): WorkflowEventFactory {
  return new WorkflowEventFactory(config);
}

// Convenience functions for creating workflow event managers
export async function createWorkflowManager(
  config: EventManagerConfig
): Promise<import('../../core/interfaces').EventManager> {
  const factory = new WorkflowEventFactory();
  return await factory.create(config);
}

export async function createSimpleWorkflowManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = WorkflowFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'immediate',
      queueSize: 1000,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 15000,
      trackLatency: true,
      trackThroughput: false,
      trackErrors: true,
    },
    ...overrides,
  });

  return createWorkflowManager(config);
}

export async function createBatchWorkflowManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = WorkflowFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 10000,
      batchSize: 50,
      timeout: 15000,
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

  return createWorkflowManager(config);
}

export async function createParallelWorkflowManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = WorkflowFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'queued',
      queueSize: 20000,
    },
    retry: {
      attempts: 5,
      delay: 3000,
      backoff: 'exponential',
      maxDelay: 15000,
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

  return createWorkflowManager(config);
}

export async function createRobustWorkflowManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = WorkflowFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'queued',
      queueSize: 25000,
    },
    retry: {
      attempts: 8,
      delay: 5000,
      backoff: 'exponential',
      maxDelay: 30000,
    },
    health: {
      checkInterval: 30000,
      timeout: 10000,
      failureThreshold: 5,
      successThreshold: 3,
      enableAutoRecovery: true,
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

  return createWorkflowManager(config);
}

export async function createComprehensiveWorkflowManager(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = WorkflowFactoryHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'batched',
      queueSize: 50000,
      batchSize: 200,
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

  return createWorkflowManager(config);
}

// Global factory instance
export const workflowEventFactory = new WorkflowEventFactory();

// Default export
export default WorkflowEventFactory;
