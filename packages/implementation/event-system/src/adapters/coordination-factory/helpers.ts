/**
 * @file Coordination Event Factory - Helper Functions
 * 
 * Utility functions and helpers for coordination event factory operations.
 */

import type { CoordinationEventAdapterConfig } from '../coordination';
import { EventManagerTypes } from '../../core/interfaces';

/**
 * Helper functions for coordination event factory operations.
 */
export class CoordinationFactoryHelpers {
  /**
   * Create default coordination event adapter configuration.
   */
  static createDefaultConfig(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): CoordinationEventAdapterConfig {
    return {
      name,
      type: EventManagerTypes.COORDINATION,
      processing: {
        strategy: 'immediate',
        queueSize: 2000,
      },
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
        maxDelay: 5000,
      },
      health: {
        checkInterval: 30000,
        timeout: 5000,
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
      swarmCoordination: {
        enabled: true,
        wrapLifecycleEvents: true,
        wrapPerformanceEvents: true,
        wrapTopologyEvents: true,
        wrapHealthEvents: true,
        coordinators: ['default', 'sparc'],
      },
      agentManagement: {
        enabled: true,
        wrapAgentEvents: true,
        wrapHealthEvents: true,
        wrapRegistryEvents: true,
        wrapLifecycleEvents: true,
      },
      taskOrchestration: {
        enabled: true,
        wrapTaskEvents: true,
        wrapDistributionEvents: true,
        wrapExecutionEvents: true,
        wrapCompletionEvents: true,
      },
      protocolManagement: {
        enabled: true,
        wrapCommunicationEvents: true,
        wrapTopologyEvents: true,
        wrapLifecycleEvents: true,
        wrapCoordinationEvents: true,
      },
      performance: {
        enableSwarmCorrelation: true,
        enableAgentTracking: true,
        enableTaskMetrics: true,
        maxConcurrentCoordinations: 100,
        coordinationTimeout: 30000,
        enablePerformanceTracking: true,
      },
      coordination: {
        enabled: true,
        strategy: 'swarm',
        correlationTTL: 300000,
        maxCorrelationDepth: 15,
        correlationPatterns: [
          'coordination:swarm->coordination:agent',
          'coordination:task->coordination:agent',
          'coordination:topology->coordination:swarm',
          'coordination:agent->coordination:task',
        ],
        trackAgentCommunication: true,
        trackSwarmHealth: true,
      },
      agentHealthMonitoring: {
        enabled: true,
        healthCheckInterval: 30000,
        agentHealthThresholds: {
          'swarm-coordinator': 0.95,
          'agent-manager': 0.9,
          orchestrator: 0.85,
          'task-distributor': 0.9,
          'topology-manager': 0.8,
        },
        swarmHealthThresholds: {
          'coordination-latency': 100,
          throughput: 100,
          reliability: 0.95,
          'agent-availability': 0.9,
        },
        autoRecoveryEnabled: true,
      },
      swarmOptimization: {
        enabled: true,
        optimizationInterval: 60000,
        performanceThresholds: {
          latency: 50,
          throughput: 200,
          reliability: 0.98,
        },
        autoScaling: true,
        loadBalancing: true,
      },
      ...overrides,
    };
  }

  /**
   * Validate coordination event adapter configuration.
   */
  static validateConfig(config: CoordinationEventAdapterConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!config?.type || config?.type !== EventManagerTypes.COORDINATION) {
      throw new Error('Configuration must have type "coordination"');
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
    startTime: Date
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
      timestamp: new Date(),
    };
  }
}