/**
 * @file System Event Adapter - Main Export
 * 
 * Exports the system event adapter system with all components.
 */

// Type exports
export type {
  SystemEventAdapterConfig,
  SystemFactoryMetrics,
  SystemHealthResult,
  FactoryOperationResult,
  BulkOperationResult,
  SystemResourceMonitor,
  ProcessManager,
  SystemHealthMonitor,
} from './types';

// Adapter function
export { createSystemEventAdapter } from './adapter';

// Helper functions and utilities
export { SystemAdapterHelpers } from './helpers';

// Convenience functions for creating system event managers
import { createSystemEventAdapter } from './adapter';
import type { SystemEventAdapterConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
import { SystemAdapterHelpers } from './helpers';

export function createSystemAdapter(
  config?: SystemEventAdapterConfig
): Promise<import('../../core/interfaces').EventManager> {
  const defaultConfig: SystemEventAdapterConfig = {
    name: 'system-adapter-' + Date.now(),
    type: 'system' as any,
    system: {
      enabled: true,
      wrapSystemEvents: true,
      wrapProcessEvents: true,
      wrapResourceEvents: true,
    },
    processMonitoring: {
      enabled: true,
      trackMemory: true,
      trackCPU: true,
      trackHandles: true,
    },
    resourceTracking: {
      enabled: true,
      trackDisk: true,
      trackNetwork: true,
      trackDatabase: true,
    },
    systemHealth: {
      enabled: true,
      checkInterval: 30000,
      enableAutoRecovery: true,
      thresholds: {
        memory: 0.8,
        cpu: 0.8,
        disk: 0.9,
      },
    },
    ...config,
  };
  
  return createSystemEventAdapter(defaultConfig);
}

export async function createBasicSystemAdapter(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = SystemAdapterHelpers.createDefaultConfig(name, {
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

  return createSystemEventAdapter(config as SystemEventAdapterConfig);
}

export async function createComprehensiveSystemAdapter(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = SystemAdapterHelpers.createDefaultConfig(name, {
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

  return createSystemEventAdapter(config as SystemEventAdapterConfig);
}

// Default export
export default createSystemEventAdapter;