/**
 * @file Workflow Factory Helpers
 * 
 * Helper functions for workflow event factory operations.
 */

import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';

/**
 * Helper function to validate workflow configuration.
 */
export function validateWorkflowConfig(config: EventManagerConfig): boolean {
  return !!(config && config.name && config.type === 'workflow');
}

/**
 * Helper function to create default workflow config.
 */
export function createDefaultWorkflowConfig(name: string, overrides?: any): EventManagerConfig {
  return {
    name,
    type: 'workflow',
    enabled: true,
    maxListeners: 250,
    processing: {
      strategy: 'queued',
      queueSize: 3000,
    },
    ...overrides,
  };
}

/**
 * Helper function for logging workflow events.
 */
export function logWorkflowEvent(logger: Logger, event: string, data?: any): void {
  logger.debug(`Workflow event: ${event}`, data);
}

/**
 * Helper function to generate workflow event IDs.
 */
export function generateWorkflowEventId(): string {
  return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
 * Alias for createDefaultWorkflowConfig for compatibility.
 */
export function createDefaultConfig(name: string, overrides?: any): EventManagerConfig {
  return createDefaultWorkflowConfig(name, overrides);
}

/**
 * Helper function to calculate workflow success rate.
 */
export function calculateWorkflowSuccessRate(totalWorkflows: number, failedWorkflows: number): number {
  if (totalWorkflows === 0) return 1;
  return Math.max(0, (totalWorkflows - failedWorkflows) / totalWorkflows);
}

/**
 * Helper function to optimize workflow parameters.
 */
export function optimizeWorkflowParameters(metrics: {
  successRate: number;
  averageExecutionTime: number;
  errorRate: number;
}): any {
  return {
    queueSize: metrics.successRate > 0.9 ? 5000 : 3000,
    batchSize: metrics.averageExecutionTime < 200 ? 30 : 20,
    throttleMs: metrics.errorRate > 0.1 ? 1500 : 750,
  };
}

/**
 * Collection of workflow factory helpers.
 */
export const WorkflowFactoryHelpers = {
  validateWorkflowConfig,
  createDefaultWorkflowConfig,
  createDefaultConfig,
  logWorkflowEvent,
  generateWorkflowEventId,
  validateConfig,
  calculateMetrics,
  calculateWorkflowSuccessRate,
  optimizeWorkflowParameters,
};