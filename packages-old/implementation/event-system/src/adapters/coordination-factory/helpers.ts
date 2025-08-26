/**
 * @file Coordination Factory Helpers
 * 
 * Helper functions for coordination event factory operations.
 */

import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';

/**
 * Helper function to validate coordination configuration.
 */
export function validateCoordinationConfig(config: EventManagerConfig): boolean {
  return !!(config && config.name && config.type === 'coordination');
}

/**
 * Helper function to create default coordination config.
 */
export function createDefaultCoordinationConfig(name: string, overrides?: any): EventManagerConfig {
  return {
    name,
    type: 'coordination',
    enabled: true,
    maxListeners: 100,
    processing: {
      strategy: 'queued',
      queueSize: 1000,
    },
    ...overrides,
  };
}

/**
 * Helper function for logging coordination events.
 */
export function logCoordinationEvent(logger: Logger, event: string, data?: any): void {
  logger.debug(`Coordination event: ${event}`, data);
}

/**
 * Helper function to generate coordination event IDs.
 */
export function generateCoordinationEventId(): string {
  return `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
export function createDefaultConfig(name: string): EventManagerConfig {
  return createDefaultCoordinationConfig(name);
}

/**
 * Collection of coordination factory helpers.
 */
export const CoordinationFactoryHelpers = {
  validateCoordinationConfig,
  createDefaultCoordinationConfig,
  createDefaultConfig,
  logCoordinationEvent,
  generateCoordinationEventId,
  validateConfig,
  calculateMetrics,
};