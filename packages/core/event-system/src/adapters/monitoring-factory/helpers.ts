/**
 * @file Monitoring Factory Helpers
 * 
 * Helper functions for monitoring event factory operations.
 */

import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';

/**
 * Helper function to validate monitoring configuration.
 */
export function validateMonitoringConfig(config: EventManagerConfig): boolean {
  return !!(config && config.name && config.type === 'monitoring');
}

/**
 * Helper function to create default monitoring config.
 */
export function createDefaultMonitoringConfig(name: string, overrides?: any): EventManagerConfig {
  return {
    name,
    type: 'monitoring',
    enabled: true,
    maxListeners: 200,
    processing: {
      strategy: 'queued',
      queueSize: 2000,
    },
    ...overrides,
  };
}

/**
 * Alias for createDefaultMonitoringConfig for compatibility.
 */
export function createDefaultConfig(name: string, overrides?: any): EventManagerConfig {
  return createDefaultMonitoringConfig(name, overrides);
}

/**
 * Helper function for logging monitoring events.
 */
export function logMonitoringEvent(logger: Logger, event: string, data?: any): void {
  logger.debug(`Monitoring event: ${event}`, data);
}

/**
 * Helper function to generate monitoring event IDs.
 */
export function generateMonitoringEventId(): string {
  return `monitoring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
 * Helper function to calculate monitoring success rate.
 */
export function calculateMonitoringSuccessRate(active: number, failed: number): number {
  const total = active + failed;
  return total > 0 ? active / total : 1.0;
}

/**
 * Collection of monitoring factory helpers.
 */
export const MonitoringFactoryHelpers = {
  validateMonitoringConfig,
  createDefaultMonitoringConfig,
  createDefaultConfig,
  logMonitoringEvent,
  generateMonitoringEventId,
  validateConfig,
  calculateMetrics,
  calculateMonitoringSuccessRate,
};