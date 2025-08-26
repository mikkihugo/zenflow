/**
 * @file Monitoring Event Adapter Helpers
 * 
 * Helper functions for monitoring event adapter operations.
 */

import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';

/**
 * Helper function to validate monitoring adapter configuration.
 */
export function validateMonitoringAdapterConfig(config: EventManagerConfig): boolean {
  return !!(config && config.name && config.type === 'monitoring');
}

/**
 * Helper function to create default monitoring adapter config.
 */
export function createDefaultMonitoringAdapterConfig(name: string, overrides?: any): EventManagerConfig {
  return {
    name,
    type: 'monitoring',
    enabled: true,
    maxListeners: 200,
    processing: {
      strategy: 'queued',
      queueSize: 2000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential',
    },
    ...overrides,
  };
}

/**
 * Alias for createDefaultMonitoringAdapterConfig for compatibility.
 */
export function createDefaultConfig(name: string, overrides?: any): EventManagerConfig {
  return createDefaultMonitoringAdapterConfig(name, overrides);
}

/**
 * Helper function to validate generic config.
 */
export function validateConfig(config: any): boolean {
  return validateMonitoringAdapterConfig(config);
}

/**
 * Helper function for logging monitoring adapter events.
 */
export function logMonitoringAdapterEvent(logger: Logger, event: string, data?: any): void {
  logger.debug(`Monitoring adapter event: ${event}`, data);
}

/**
 * Helper function to generate monitoring adapter event IDs.
 */
export function generateMonitoringAdapterEventId(): string {
  return `monitoring_adapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Collection of monitoring adapter helpers.
 */
export const MonitoringEventHelpers = {
  validateMonitoringAdapterConfig,
  createDefaultMonitoringAdapterConfig,
  createDefaultConfig,
  validateConfig,
  logMonitoringAdapterEvent,
  generateMonitoringAdapterEventId,
};

/**
 * Alias for MonitoringEventHelpers for compatibility.
 */
export const MonitoringAdapterHelpers = MonitoringEventHelpers;