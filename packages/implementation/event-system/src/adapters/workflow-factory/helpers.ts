/**
 * @file Workflow Event Factory - Helper Functions
 * 
 * Utility functions and helpers for workflow event factory operations.
 */

import type { EventManagerConfig } from '../../core/interfaces';
import { EventManagerTypes } from '../../core/interfaces';

/**
 * Helper functions for workflow event factory operations.
 */
export class WorkflowFactoryHelpers {
  /**
   * Create default workflow event manager configuration.
   */
  static createDefaultConfig(name: string, overrides?: Partial<EventManagerConfig>): EventManagerConfig {
    return {
      name,
      type: EventManagerTypes.WORKFLOW,
      processing: {
        strategy: 'queued',
        queueSize: 5000,
      },
      retry: {
        attempts: 3,
        delay: 2000,
        backoff: 'exponential',
        maxDelay: 10000,
      },
      health: {
        checkInterval: 45000,
        timeout: 8000,
        failureThreshold: 3,
        successThreshold: 2,
        enableAutoRecovery: true,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        enableProfiling: true,
      },
      ...overrides,
    };
  }

  /**
   * Validate workflow event manager configuration.
   */
  static validateConfig(config: EventManagerConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!config?.type || config?.type !== EventManagerTypes.WORKFLOW) {
      throw new Error('Configuration must have type "workflow"');
    }

    // Validate processing strategy
    if (config?.processing?.strategy) {
      const validStrategies = ['immediate', 'queued', 'batched', 'throttled'];
      if (!validStrategies.includes(config?.processing?.strategy)) {
        throw new Error(`Invalid processing strategy: ${config?.processing?.strategy}`);
      }
    }

    // Validate retry configuration
    if (config?.retry) {
      if (config?.retry?.attempts && config?.retry?.attempts < 0) {
        throw new Error('Retry attempts must be non-negative');
      }
      if (config?.retry?.delay && config?.retry?.delay < 0) {
        throw new Error('Retry delay must be non-negative');
      }
    }

    // Validate health configuration
    if (config?.health) {
      if (config?.health?.checkInterval && config?.health?.checkInterval < 1000) {
        throw new Error('Health check interval must be at least 1000ms');
      }
      if (config?.health?.timeout && config?.health?.timeout < 100) {
        throw new Error('Health check timeout must be at least 100ms');
      }
    }
  }

  /**
   * Generate unique instance name with timestamp.
   */
  static generateInstanceName(baseName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${baseName}-${timestamp}-${random}`;
  }

  /**
   * Calculate factory metrics from operational data.
   */
  static calculateMetrics(
    totalCreated: number,
    totalErrors: number,
    activeInstances: number,
    runningInstances: number,
    startTime: Date,
    workflowMetrics?: {
      totalWorkflows: number;
      completedWorkflows: number;
      failedWorkflows: number;
      averageExecutionTime: number;
    }
  ) {
    const uptime = Date.now() - startTime.getTime();
    const hours = uptime / (1000 * 60 * 60);
    
    return {
      totalCreated,
      totalErrors,
      activeInstances,
      runningInstances,
      uptime,
      creationRate: hours > 0 ? totalCreated / hours : 0,
      errorRate: totalCreated > 0 ? totalErrors / totalCreated : 0,
      workflowMetrics: workflowMetrics || {
        totalWorkflows: 0,
        completedWorkflows: 0,
        failedWorkflows: 0,
        averageExecutionTime: 0,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Calculate workflow success rate.
   */
  static calculateWorkflowSuccessRate(completed: number, failed: number): number {
    const total = completed + failed;
    return total > 0 ? completed / total : 1;
  }

  /**
   * Optimize workflow processing parameters based on performance.
   */
  static optimizeWorkflowParameters(
    successRate: number, 
    averageExecutionTime: number
  ): {
    queueSize: number;
    retryAttempts: number;
    timeout: number;
  } {
    let queueSize = 5000;
    let retryAttempts = 3;
    let timeout = 8000;

    if (successRate < 0.8) {
      // Increase retries and timeout for better reliability
      retryAttempts = 5;
      timeout = 12000;
    } else if (averageExecutionTime > 10000) {
      // Increase queue size for better throughput
      queueSize = 10000;
      timeout = 15000;
    }

    return { queueSize, retryAttempts, timeout };
  }

  /**
   * Validate workflow state transitions.
   */
  static validateWorkflowTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['running', 'cancelled'],
      'running': ['completed', 'failed', 'paused'],
      'paused': ['running', 'cancelled'],
      'completed': [],
      'failed': ['pending'], // Allow retry
      'cancelled': []
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}