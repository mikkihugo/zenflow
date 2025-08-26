/**
 * @file Interface Factory Helpers
 * 
 * Helper functions for interface event factory operations.
 */

import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';

/**
 * Helper function to validate interface configuration.
 */
export function validateInterfaceConfig(config: EventManagerConfig): boolean {
  return !!(config && config.name && config.type === 'interface');
}

/**
 * Helper function to create default interface config.
 */
export function createDefaultInterfaceConfig(name: string, overrides?: any): EventManagerConfig {
  return {
    name,
    type: 'interface',
    enabled: true,
    maxListeners: 100,
    processing: {
      strategy: 'immediate',
      queueSize: 500,
    },
    ...overrides,
  };
}

/**
 * Helper function for logging interface events.
 */
export function logInterfaceEvent(logger: Logger, event: string, data?: any): void {
  logger.debug(`Interface event: ${event}`, data);
}

/**
 * Helper function to generate interface event IDs.
 */
export function generateInterfaceEventId(): string {
  return `interface_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
 * Helper function to create default configuration.
 */
export function createDefaultConfig(name: string, overrides?: any): EventManagerConfig {
  return createDefaultInterfaceConfig(name, overrides);
}

/**
 * Collection of interface factory helpers.
 */
export const InterfaceFactoryHelpers = {
  validateInterfaceConfig,
  createDefaultInterfaceConfig,
  createDefaultConfig,
  logInterfaceEvent,
  generateInterfaceEventId,
  validateConfig,
  calculateMetrics,
};