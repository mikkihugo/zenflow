/**
 * @file Memory Factory Helpers
 * 
 * Helper functions for memory event factory operations.
 */

import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';

/**
 * Helper function to validate memory configuration.
 */
export function validateMemoryConfig(config: EventManagerConfig): boolean {
  return !!(config && config.name && config.type === 'memory');
}

/**
 * Helper function to create default memory config.
 */
export function createDefaultMemoryConfig(name: string, overrides?: any): EventManagerConfig {
  return {
    name,
    type: 'memory',
    enabled: true,
    maxListeners: 100,
    processing: {
      strategy: 'immediate',
      queueSize: 1000,
    },
    ...overrides,
  };
}

/**
 * Helper function for logging memory events.
 */
export function logMemoryEvent(logger: Logger, event: string, data?: any): void {
  logger.debug(`Memory event: ${event}`, data);
}

/**
 * Helper function to generate memory event IDs.
 */
export function generateMemoryEventId(): string {
  return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
 * Helper function to check memory health.
 */
export function checkMemoryHealth(): boolean {
  // Simple memory health check
  const usage = process.memoryUsage();
  const totalMem = usage.heapTotal;
  const usedMem = usage.heapUsed;
  return usedMem / totalMem < 0.9; // Consider healthy if < 90% used
}

/**
 * Helper function to suggest garbage collection.
 */
export function suggestGarbageCollection(): void {
  if (global.gc) {
    global.gc();
  }
}

/**
 * Helper function to create default configuration.
 */
export function createDefaultConfig(name: string, overrides?: any): EventManagerConfig {
  return createDefaultMemoryConfig(name, overrides);
}

/**
 * Collection of memory factory helpers.
 */
export const MemoryFactoryHelpers = {
  validateMemoryConfig,
  createDefaultMemoryConfig,
  createDefaultConfig,
  logMemoryEvent,
  generateMemoryEventId,
  validateConfig,
  calculateMetrics,
  checkMemoryHealth,
  suggestGarbageCollection,
};