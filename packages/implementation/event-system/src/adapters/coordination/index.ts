/**
 * @file Coordination Event System - Main Export
 * 
 * Exports the modular coordination event adapter system with all components.
 */

// Type exports
export type {
  CoordinationEventAdapterConfig,
  CoordinationEventMetrics,
  CoordinationCorrelation,
  CoordinationHealthEntry,
  WrappedCoordinationComponent
} from './types';

// Main adapter class
export { CoordinationEventAdapter } from './adapter';

// Helper functions and utilities
export { CoordinationEventHelpers, CoordinationEventUtils } from './helpers';

// Data extraction utilities
export { CoordinationEventExtractor } from './extractor';

// Factory function for creating CoordinationEventAdapter instances
import { CoordinationEventAdapter } from './adapter';
import type { CoordinationEventAdapterConfig } from './types';

export function createCoordinationEventAdapter(
  config: CoordinationEventAdapterConfig
): CoordinationEventAdapter {
  return new CoordinationEventAdapter(config);
}

// Helper function for creating default coordination event adapter configuration
export function createDefaultCoordinationEventAdapterConfig(
  name: string,
  overrides?: Partial<CoordinationEventAdapterConfig>
): CoordinationEventAdapterConfig {
  return {
    name,
    type: 'coordination' as any, // EventManagerTypes.COORDINATION would be here
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

// Default export
export default CoordinationEventAdapter;