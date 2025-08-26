/**
 * @file Monitoring Event Adapter - Main Export
 *
 * Exports the monitoring event adapter system with all components.
 */

// Type exports
export type {
  MonitoringEventAdapterConfig,
  MonitoringFactoryMetrics,
  MonitoringHealthResult,
  FactoryOperationResult,
  BulkOperationResult,
  PerformanceAnalyzer,
  MetricsCollector,
  RealTimePerformanceMonitor,
} from './types';

// Adapter function
export { createMonitoringEventAdapter } from './adapter';

// Manager implementation
export { MonitoringEventManager } from './manager';

// Helper functions and utilities
export { MonitoringAdapterHelpers } from './helpers';

// Convenience functions for creating monitoring event managers
import { createMonitoringEventAdapter } from './adapter';
import type { MonitoringEventAdapterConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
import { MonitoringAdapterHelpers } from './helpers';

export function createMonitoringAdapter(
  config?: MonitoringEventAdapterConfig
): Promise<import('../../core/interfaces').EventManager> {
  const defaultConfig: MonitoringEventAdapterConfig = {
    name: `monitoring-adapter-${  Date.now()}`,
    type: 'monitoring' as any,
    processing: {
      strategy: 'immediate',
      queueSize: 1000,
    },
    monitoring: {
      enabled: true,
      wrapPerformanceEvents: true,
      wrapMetricsEvents: true,
      wrapHealthEvents: true,
    },
    performanceTracking: {
      enabled: true,
      trackLatency: true,
      trackThroughput: true,
      trackErrorRates: true,
    },
    metricsCollection: {
      enabled: true,
      collectSystemMetrics: true,
      collectApplicationMetrics: true,
      interval: 5000,
    },
    healthMonitoring: {
      enabled: true,
      checkInterval: 60000,
      enableAutoRecovery: true,
    },
    ...config,
  };

  return createMonitoringEventAdapter(defaultConfig);
}

export async function createSimpleMonitoringAdapter(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = MonitoringAdapterHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'immediate',
      queueSize: 1000,
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

  return createMonitoringEventAdapter(config as MonitoringEventAdapterConfig);
}

export async function createRobustMonitoringAdapter(
  name: string,
  overrides?: Partial<EventManagerConfig>
): Promise<import('../../core/interfaces').EventManager> {
  const config = MonitoringAdapterHelpers.createDefaultConfig(name, {
    processing: {
      strategy: 'queued',
      queueSize: 5000,
    },
    retry: {
      attempts: 5,
      delay: 2000,
      backoff: 'exponential',
      maxDelay: 15000,
    },
    health: {
      checkInterval: 30000,
      timeout: 8000,
      failureThreshold: 3,
      successThreshold: 2,
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

  return createMonitoringEventAdapter(config as MonitoringEventAdapterConfig);
}

// Default export
export default createMonitoringEventAdapter;
