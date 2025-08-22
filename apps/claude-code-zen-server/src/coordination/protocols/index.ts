/**
 * Advanced Swarm Coordination Protocols.
 * Comprehensive system for sophisticated multi-agent collaboration.
 */

// Communication Protocols
/**
 * @file Protocols module exports.
 */

/**
 * Advanced Coordination System Factory.
 * Creates and configures integrated coordination systems.
 */
import { CoordinationPatterns } from '@claude-zen/enterprise';
import type { Logger } from '@claude-zen/foundation';
import { PerformanceOptimizer } from '@claude-zen/operations';

import type { EventBusInterface as EventBus } from './core/event-bus';
import {
  TopologyManager,
  type TopologyType,
} from "./topology/topology-manager";

import('/communication/communication-protocols');
import('/distribution/task-distribution-engine');
import('/lifecycle/agent-lifecycle-manager');

export {
  type CommunicationNode,
  CommunicationProtocols,
  type ConsensusProposal,
  type ConsensusVote,
  type GossipState,
  type Message,
  type MessageHandler,
  type MessagePayload,
  type MessagePriority,
  type MessageType,
} from "./communication/communication-protocols";

// Task Distribution
export {
  type AgentCapability,
  type DistributionMetrics,
  type TaskAssignment,
  type TaskComplexity,
  type TaskConstraints,
  type TaskDefinition,
  TaskDistributionEngine,
  type TaskPriority,
  type TaskRequirements,
  type TaskStatus,
} from "./distribution/task-distribution-engine";
// Agent Lifecycle Management
export {
  type AgentInstance,
  type AgentLifecycleConfig,
  AgentLifecycleManager,
  type AgentStatus,
  type AgentTemplate,
  type HealthStatus,
  type LifecycleMetrics,
  type ScalingDecision,
  type SpawnRequest,
  type SpawnResult,
  type TerminationRequest,
  type TerminationResult,
} from "./lifecycle/agent-lifecycle-manager";
// Performance Optimization
export {
  type AdaptationConfig,
  type BatchProcessor,
  type BatchSizingConfig,
  type CachingConfig,
  type ConnectionPool,
  type ConnectionPoolingConfig,
  type LatencyMetrics,
  type LoadPrediction,
  type MonitoringConfig,
  type OptimizationConfig,
  type PerformanceMetrics,
  PerformanceOptimizer,
  type ResourceMetrics,
  type ThroughputMetrics,
} from '@claude-zen/operations';

// Coordination Patterns
export {
  type ConsensusConfig,
  type ConsensusState,
  type CoordinationNode,
  CoordinationPatterns,
  type DelegationRequest,
  type ElectionMessage,
  type ElectionState,
  type EscalationRequest,
  type HierarchicalConfig,
  type HierarchyNode,
  type LeaderElectionConfig,
  type LogEntry,
  type WorkItem,
  type WorkQueue,
  type WorkStealingConfig,
} from '@claude-zen/enterprise';
// Topology Management
export {
  type Connection,
  type NetworkNode,
  type TopologyConfig,
  type TopologyDecision,
  TopologyManager,
  type TopologyMetrics,
  type TopologyType,
} from "./topology/topology-manager";

export interface AdvancedCoordinationConfig {
  nodeId: string;
  topology: {
    type: TopologyType;
    parameters: Record<string, unknown>;
    constraints: {
      maxLatency: number;
      minBandwidth: number;
      faultTolerance: number;
      scalabilityTarget: number;
    };
    adaptation: {
      enabled: boolean;
      sensitivity: number;
      cooldownPeriod: number;
      maxSwitchesPerHour: number;
    };
  };
  distribution: {
    maxConcurrentTasks: number;
    defaultTimeout: number;
    qualityThreshold: number;
    loadBalanceTarget: number;
    enablePredictiveAssignment: boolean;
    enableDynamicRebalancing: boolean;
  };
  communication: {
    maxMessageHistory: number;
    messageTimeout: number;
    gossipInterval: number;
    heartbeatInterval: number;
    compressionThreshold: number;
    encryptionEnabled: boolean;
    consensusTimeout: number;
    maxHops: number;
  };
  lifecycle: {
    maxAgents: number;
    minAgents: number;
    spawnTimeout: number;
    shutdownTimeout: number;
    healthCheckInterval: number;
    performanceWindow: number;
    autoRestart: boolean;
    autoScale: boolean;
    resourceLimits: {
      maxCpuPercent: number;
      maxMemoryMB: number;
      maxNetworkMbps: number;
      maxDiskIOPS: number;
      maxOpenFiles: number;
      maxProcesses: number;
    };
    qualityThresholds: {
      minSuccessRate: number;
      minResponseTime: number;
      maxErrorRate: number;
      minReliability: number;
      minEfficiency: number;
    };
  };
  patterns: {
    election: {
      algorithm: 'bully' | 'ring' | 'raft' | 'fast-bully';
      timeoutMs: number;
      heartbeatInterval: number;
      maxRetries: number;
      priorityBased: boolean;
      minNodes: number;
    };
    consensus: {
      algorithm: 'raft' | 'pbft' | 'tendermint';
      electionTimeout: [number, number];
      heartbeatInterval: number;
      logReplicationTimeout: number;
      maxLogEntries: number;
      snapshotThreshold: number;
    };
    workStealing: {
      maxQueueSize: number;
      stealThreshold: number;
      stealRatio: number;
      retryInterval: number;
      maxRetries: number;
      loadBalancingInterval: number;
    };
    hierarchical: {
      maxDepth: number;
      fanOut: number;
      delegationThreshold: number;
      escalationTimeout: number;
      rebalanceInterval: number;
    };
  };
  optimization: {
    batchSizing: {
      initialSize: number;
      minSize: number;
      maxSize: number;
      adaptationRate: number;
      targetLatency: number;
      targetThroughput: number;
      windowSize: number;
    };
    connectionPooling: {
      initialSize: number;
      maxSize: number;
      minIdle: number;
      maxIdle: number;
      connectionTimeout: number;
      idleTimeout: number;
      keepAliveInterval: number;
      retryAttempts: number;
    };
    caching: {
      maxSize: number;
      ttl: number;
      refreshThreshold: number;
      compressionEnabled: boolean;
      deduplicationEnabled: boolean;
      prefetchEnabled: boolean;
    };
    monitoring: {
      metricsInterval: number;
      alertThresholds: {
        latency: number;
        throughput: number;
        errorRate: number;
        cpuUsage: number;
        memoryUsage: number;
        queueDepth: number;
        connectionUtilization: number;
      };
      historySizeLimit: number;
      anomalyDetection: boolean;
      predictionEnabled: boolean;
    };
    adaptation: {
      enabled: boolean;
      sensitivity: number;
      cooldownPeriod: number;
      maxChangesPerPeriod: number;
      learningRate: number;
      explorationRate: number;
    };
  };
}

export interface AdvancedCoordinationSystem {
  topologyManager: TopologyManager;
  distributionEngine: TaskDistributionEngine;
  communicationProtocols: CommunicationProtocols;
  lifecycleManager: AgentLifecycleManager;
  coordinationPatterns: CoordinationPatterns;
  performanceOptimizer: PerformanceOptimizer;
}

export interface CoordinationMetrics {
  topology: any;
  distribution: any;
  communication: any;
  lifecycle: any;
  patterns: any;
  optimization: any;
  overall: {
    efficiency: number;
    reliability: number;
    scalability: number;
    adaptability: number;
  };
}

/**
 * Create an integrated advanced coordination system.
 *
 * @param config
 * @param logger
 * @param eventBus
 * @example
 */
export async function createAdvancedCoordinationSystem(
  config: AdvancedCoordinationConfig,
  logger: Logger,
  eventBus: EventBus
): Promise<AdvancedCoordinationSystem> {
  // Create topology manager
  const topologyManager = new TopologyManager(
    {
      type: config?.topology?.type,
      parameters: config?.topology?.parameters,
      constraints: config?.topology?.constraints,
      adaptation: config?.topology?.adaptation,
    },
    logger,
    eventBus
  );

  // Create task distribution engine
  const distributionEngine = new TaskDistributionEngine(
    config?.distribution,
    logger,
    eventBus
  );

  // Create communication protocols
  const communicationProtocols = new CommunicationProtocols(
    config?.nodeId,
    config?.communication,
    logger,
    eventBus
  );

  // Create agent lifecycle manager
  const lifecycleManager = new AgentLifecycleManager(
    {
      maxAgents: config?.lifecycle?.maxAgents,
      minAgents: config?.lifecycle?.minAgents,
      spawnTimeout: config?.lifecycle?.spawnTimeout,
      shutdownTimeout: config?.lifecycle?.shutdownTimeout,
      healthCheckInterval: config?.lifecycle?.healthCheckInterval,
      performanceWindow: config?.lifecycle?.performanceWindow,
      autoRestart: config?.lifecycle?.autoRestart,
      autoScale: config?.lifecycle?.autoScale,
      resourceLimits: config?.lifecycle?.resourceLimits,
      qualityThresholds: config?.lifecycle?.qualityThresholds,
    },
    logger,
    eventBus
  );

  // Create coordination patterns
  const coordinationPatterns = new CoordinationPatterns(
    config?.nodeId,
    config?.patterns,
    logger,
    eventBus
  );

  // Create performance optimizer
  const performanceOptimizer = new PerformanceOptimizer(
    config?.optimization,
    logger,
    eventBus
  );

  // Set up cross-system integrations
  await setupIntegrations(
    {
      topologyManager,
      distributionEngine,
      communicationProtocols,
      lifecycleManager,
      coordinationPatterns,
      performanceOptimizer,
    },
    logger
  );

  return {
    topologyManager,
    distributionEngine,
    communicationProtocols,
    lifecycleManager,
    coordinationPatterns,
    performanceOptimizer,
  };
}

/**
 * Set up integrations between coordination systems.
 *
 * @param systems
 * @param logger
 * @example
 */
async function setupIntegrations(
  systems: AdvancedCoordinationSystem,
  logger: Logger
): Promise<void> {
  // Topology -> Distribution: Optimal task routing based on network topology
  systems.topologyManager.on('topology:optimized', (data) => {
    logger.debug('Topology optimized, updating task distribution routes', data);
    // Update distribution engine with new topology information
  });

  // Distribution -> Lifecycle: Dynamic agent scaling based on task load
  systems.distributionEngine.on('load:spike', (data) => {
    logger.info('Task load spike detected, triggering agent scaling', data);
    systems.lifecycleManager
      .triggerScaling('worker', data?.targetAgents)
      .catch((error) => {
        logger.error('Auto-scaling failed', { error });
      });
  });

  // Communication -> Patterns: Network events affect coordination patterns
  systems.communicationProtocols.on('network:partition', (data) => {
    logger.warn(
      'Network partition detected, switching coordination pattern',
      data
    );
    systems.coordinationPatterns
      .switchPattern('leader-follower')
      .catch((error) => {
        logger.error('Pattern switch failed', { error });
      });
  });

  // Lifecycle -> Topology: Agent health affects network topology
  systems.lifecycleManager.on('agent:unhealthy', (data) => {
    logger.warn('Unhealthy agent detected, updating topology', data);
    // Remove unhealthy nodes from topology
  });

  // Patterns -> Communication: Leader election results affect communication
  systems.coordinationPatterns.on('coordination:leader-elected', (data) => {
    logger.info('New leader elected, updating communication protocols', data);
    // Update communication routing for new leader
  });

  // Optimization -> All: Performance insights drive system-wide optimizations
  systems.performanceOptimizer.on('optimization:applied', (data) => {
    logger.info('Performance optimization applied', data);
    // Propagate optimization insights to other systems
  });

  logger.info('Advanced coordination system integrations configured');
}

/**
 * Get comprehensive coordination metrics.
 *
 * @param systems
 * @example
 */
export function getCoordinationMetrics(
  systems: AdvancedCoordinationSystem
): CoordinationMetrics {
  const topologyMetrics = systems.topologyManager.getTopologyMetrics();
  const distributionMetrics = systems.distributionEngine.getMetrics();
  const communicationMetrics = systems.communicationProtocols.getMetrics();
  const lifecycleMetrics = systems.lifecycleManager.getMetrics();
  const patternsMetrics = systems.coordinationPatterns.getMetrics();
  const optimizationMetrics = systems.performanceOptimizer.getMetrics();

  // Calculate overall system metrics
  const efficiency =
    (topologyMetrics.communicationEfficiency +
      distributionMetrics.successRate * distributionMetrics.resourceEfficiency +
      communicationMetrics.networkHealth +
      lifecycleMetrics.averageHealth +
      patternsMetrics.coordinationEfficiency +
      calculateOptimizationEfficiency(optimizationMetrics)) /
    6;

  const reliability =
    (topologyMetrics.faultTolerance +
      distributionMetrics.successRate +
      (1 - communicationMetrics.networkHealth) + // Invert for failures
      (1 - lifecycleMetrics.failureRate) +
      (1 - patternsMetrics.failureRate) +
      (1 - optimizationMetrics.errorMetrics.errorRate)) /
    6;

  const scalability =
    (topologyMetrics.loadBalance +
      distributionMetrics.loadBalance +
      communicationMetrics.nodes / 100 + // Normalize to expected max
      lifecycleMetrics.totalAgents / 100 +
      patternsMetrics.coordinationEfficiency +
      optimizationMetrics.throughput.requestsPerSecond / 1000) /
    6;

  const adaptability =
    ((topologyMetrics.networkDiameter > 0
      ? 1 / topologyMetrics.networkDiameter
      : 1) +
      distributionMetrics.resourceEfficiency +
      communicationMetrics.networkHealth +
      lifecycleMetrics.recoveryRate +
      patternsMetrics.coordinationEfficiency +
      calculateAdaptabilityScore(optimizationMetrics)) /
    6;

  return {
    topology: topologyMetrics,
    distribution: distributionMetrics,
    communication: communicationMetrics,
    lifecycle: lifecycleMetrics,
    patterns: patternsMetrics,
    optimization: optimizationMetrics,
    overall: {
      efficiency: Math.max(0, Math.min(1, efficiency)),
      reliability: Math.max(0, Math.min(1, reliability)),
      scalability: Math.max(0, Math.min(1, scalability)),
      adaptability: Math.max(0, Math.min(1, adaptability)),
    },
  };
}

function calculateOptimizationEfficiency(metrics: any): number {
  // Calculate efficiency based on optimization metrics
  const latencyScore = Math.max(0, 1 - metrics.latency.average / 1000);
  const throughputScore = Math.min(
    1,
    metrics.throughput.requestsPerSecond / 1000
  );
  const resourceScore = Math.max(0, 1 - metrics.resourceUsage.cpuUsage);

  return (latencyScore + throughputScore + resourceScore) / 3;
}

function calculateAdaptabilityScore(metrics: any): number {
  // Calculate adaptability based on how well the system adapts to changes
  const cacheAdaptability = metrics.cacheMetrics.hitRate;
  const batchAdaptability = metrics.batchMetrics.utilizationRate;
  const connectionAdaptability = metrics.connectionMetrics.poolUtilization;

  return (cacheAdaptability + batchAdaptability + connectionAdaptability) / 3;
}

/**
 * Shutdown coordination system gracefully.
 *
 * @param systems
 * @param logger
 * @example
 */
export async function shutdownCoordinationSystem(
  systems: AdvancedCoordinationSystem,
  logger: Logger
): Promise<void> {
  logger.info('Shutting down advanced coordination system...');

  try {
    // Shutdown in reverse dependency order
    await systems.performanceOptimizer.shutdown();
    await systems.coordinationPatterns.shutdown();
    await systems.lifecycleManager.shutdown();
    await systems.communicationProtocols.shutdown();
    await systems.distributionEngine.shutdown();
    await systems.topologyManager.shutdown();

    logger.info('Advanced coordination system shutdown complete');
  } catch (error) {
    logger.error('Error during coordination system shutdown', { error });
    throw error;
  }
}

/**
 * Default configuration for advanced coordination system.
 *
 * @param nodeId
 * @example
 */
export function getDefaultCoordinationConfig(
  nodeId: string
): AdvancedCoordinationConfig {
  return {
    nodeId,
    topology: {
      type: 'hybrid',
      parameters: {},
      constraints: {
        maxLatency: 1000,
        minBandwidth: 1000000,
        faultTolerance: 0.8,
        scalabilityTarget: 100,
      },
      adaptation: {
        enabled: true,
        sensitivity: 0.3,
        cooldownPeriod: 30000,
        maxSwitchesPerHour: 5,
      },
    },
    distribution: {
      maxConcurrentTasks: 100,
      defaultTimeout: 30000,
      qualityThreshold: 0.8,
      loadBalanceTarget: 0.8,
      enablePredictiveAssignment: true,
      enableDynamicRebalancing: true,
    },
    communication: {
      maxMessageHistory: 10000,
      messageTimeout: 30000,
      gossipInterval: 5000,
      heartbeatInterval: 10000,
      compressionThreshold: 1024,
      encryptionEnabled: true,
      consensusTimeout: 30000,
      maxHops: 5,
    },
    lifecycle: {
      maxAgents: 100,
      minAgents: 5,
      spawnTimeout: 30000,
      shutdownTimeout: 15000,
      healthCheckInterval: 10000,
      performanceWindow: 300000,
      autoRestart: true,
      autoScale: true,
      resourceLimits: {
        maxCpuPercent: 80,
        maxMemoryMB: 1024,
        maxNetworkMbps: 100,
        maxDiskIOPS: 1000,
        maxOpenFiles: 1000,
        maxProcesses: 50,
      },
      qualityThresholds: {
        minSuccessRate: 0.9,
        minResponseTime: 1000,
        maxErrorRate: 0.1,
        minReliability: 0.9,
        minEfficiency: 0.8,
      },
    },
    patterns: {
      election: {
        algorithm: 'raft',
        timeoutMs: 10000,
        heartbeatInterval: 5000,
        maxRetries: 3,
        priorityBased: true,
        minNodes: 3,
      },
      consensus: {
        algorithm: 'raft',
        electionTimeout: [150, 300],
        heartbeatInterval: 50,
        logReplicationTimeout: 1000,
        maxLogEntries: 10000,
        snapshotThreshold: 1000,
      },
      workStealing: {
        maxQueueSize: 1000,
        stealThreshold: 10,
        stealRatio: 0.5,
        retryInterval: 1000,
        maxRetries: 3,
        loadBalancingInterval: 5000,
      },
      hierarchical: {
        maxDepth: 4,
        fanOut: 5,
        delegationThreshold: 0.8,
        escalationTimeout: 30000,
        rebalanceInterval: 60000,
      },
    },
    optimization: {
      batchSizing: {
        initialSize: 10,
        minSize: 1,
        maxSize: 100,
        adaptationRate: 0.1,
        targetLatency: 100,
        targetThroughput: 1000,
        windowSize: 100,
      },
      connectionPooling: {
        initialSize: 5,
        maxSize: 50,
        minIdle: 2,
        maxIdle: 10,
        connectionTimeout: 5000,
        idleTimeout: 300000,
        keepAliveInterval: 30000,
        retryAttempts: 3,
      },
      caching: {
        maxSize: 10000,
        ttl: 300000,
        refreshThreshold: 0.8,
        compressionEnabled: true,
        deduplicationEnabled: true,
        prefetchEnabled: true,
      },
      monitoring: {
        metricsInterval: 5000,
        alertThresholds: {
          latency: 1000,
          throughput: 100,
          errorRate: 0.1,
          cpuUsage: 0.8,
          memoryUsage: 0.8,
          queueDepth: 100,
          connectionUtilization: 0.9,
        },
        historySizeLimit: 1000,
        anomalyDetection: true,
        predictionEnabled: true,
      },
      adaptation: {
        enabled: true,
        sensitivity: 0.2,
        cooldownPeriod: 30000,
        maxChangesPerPeriod: 3,
        learningRate: 0.1,
        explorationRate: 0.1,
      },
    },
  };
}

export default {
  createAdvancedCoordinationSystem,
  getCoordinationMetrics,
  shutdownCoordinationSystem,
  getDefaultCoordinationConfig,
};
