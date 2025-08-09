import { createLogger } from '../../../core/logger';
import type { IEventManagerFactory } from '../core/interfaces';
import { EventManagerTypes } from '../core/interfaces';
import {
  CoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig,
} from './coordination-event-adapter';

/**
 * Coordination Event Manager Factory
 *
 * Creates and manages CoordinationEventAdapter instances for coordination-level event management.
 * Integrates with the UEL factory system to provide unified access to coordination events.
 *
 * @example
 */
export class CoordinationEventManagerFactory
  implements IEventManagerFactory<CoordinationEventAdapterConfig>
{
  private logger: ILogger;
  private instances = new Map<string, CoordinationEventAdapter>();

  constructor(logger?: ILogger, config?: IConfig) {
    this.logger = logger || createLogger('CoordinationEventManagerFactory');
    this.config = config || {};
    this.logger.debug('CoordinationEventManagerFactory initialized');
  }

  /**
   * Create a new CoordinationEventAdapter instance
   *
   * @param config
   */
  async create(config: CoordinationEventAdapterConfig): Promise<IEventManager> {
    this.logger.info(`Creating coordination event manager: ${config?.name}`);

    try {
      // Validate configuration
      this.validateConfig(config);

      // Create adapter instance
      const adapter = new CoordinationEventAdapter(config);

      // Store instance for management
      this.instances.set(config?.name, adapter);

      this.logger.info(`Coordination event manager created successfully: ${config?.name}`);
      return adapter;
    } catch (error) {
      this.logger.error(`Failed to create coordination event manager ${config?.name}:`, error);
      throw error;
    }
  }

  /**
   * Create multiple coordination event managers
   *
   * @param configs
   */
  async createMultiple(configs: CoordinationEventAdapterConfig[]): Promise<IEventManager[]> {
    this.logger.info(`Creating ${configs.length} coordination event managers`);

    const createPromises = configs?.map((config) => this.create(config));
    const results = await Promise.allSettled(createPromises);

    const managers: IEventManager[] = [];
    const errors: Error[] = [];

    results?.forEach((result, index) => {
      if (result?.status === 'fulfilled') {
        managers.push(result?.value);
      } else {
        errors.push(
          new Error(
            `Failed to create coordination manager ${configs?.[index]?.name}: ${result?.reason}`
          )
        );
      }
    });

    if (errors.length > 0) {
      this.logger.warn(
        `Created ${managers.length}/${configs.length} coordination event managers, ${errors.length} failed`
      );
    } else {
      this.logger.info(`Successfully created ${managers.length} coordination event managers`);
    }

    return managers;
  }

  /**
   * Get existing coordination event manager by name
   *
   * @param name
   */
  get(name: string): IEventManager | undefined {
    return this.instances.get(name);
  }

  /**
   * List all coordination event managers
   */
  list(): IEventManager[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if coordination event manager exists
   *
   * @param name
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove coordination event manager
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const manager = this.instances.get(name);
    if (!manager) {
      return false;
    }

    try {
      // Stop and destroy the manager
      if (manager.isRunning()) {
        await manager.stop();
      }
      await manager.destroy();

      // Remove from instances
      this.instances.delete(name);

      this.logger.info(`Coordination event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove coordination event manager ${name}:`, error);
      return false;
    }
  }

  /**
   * Health check all coordination event managers
   */
  async healthCheckAll(): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    const healthPromises = Array.from(this.instances.entries()).map(async ([name, manager]) => {
      try {
        const status = await manager.healthCheck();
        results?.set(name, status);
      } catch (error) {
        results?.set(name, {
          name: manager.name,
          type: manager.type,
          status: 'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1.0,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        });
      }
    });

    await Promise.allSettled(healthPromises);
    return results;
  }

  /**
   * Get metrics from all coordination event managers
   */
  async getMetricsAll(): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    const metricsPromises = Array.from(this.instances.entries()).map(async ([name, manager]) => {
      try {
        const metrics = await manager.getMetrics();
        results?.set(name, metrics);
      } catch (error) {
        this.logger.warn(`Failed to get metrics for coordination event manager ${name}:`, error);
      }
    });

    await Promise.allSettled(metricsPromises);
    return results;
  }

  /**
   * Start all coordination event managers
   */
  async startAll(): Promise<void> {
    this.logger.info(`Starting ${this.instances.size} coordination event managers`);

    const startPromises = Array.from(this.instances.values()).map(async (manager) => {
      try {
        if (!manager.isRunning()) {
          await manager.start();
        }
      } catch (error) {
        this.logger.error(`Failed to start coordination event manager ${manager.name}:`, error);
      }
    });

    await Promise.allSettled(startPromises);
    this.logger.info('All coordination event managers start operation completed');
  }

  /**
   * Stop all coordination event managers
   */
  async stopAll(): Promise<void> {
    this.logger.info(`Stopping ${this.instances.size} coordination event managers`);

    const stopPromises = Array.from(this.instances.values()).map(async (manager) => {
      try {
        if (manager.isRunning()) {
          await manager.stop();
        }
      } catch (error) {
        this.logger.error(`Failed to stop coordination event manager ${manager.name}:`, error);
      }
    });

    await Promise.allSettled(stopPromises);
    this.logger.info('All coordination event managers stop operation completed');
  }

  /**
   * Shutdown the factory and all managed instances
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down CoordinationEventManagerFactory');

    // Stop all managers
    await this.stopAll();

    // Destroy all managers
    const destroyPromises = Array.from(this.instances.values()).map(async (manager) => {
      try {
        await manager.destroy();
      } catch (error) {
        this.logger.error(`Failed to destroy coordination event manager ${manager.name}:`, error);
      }
    });

    await Promise.allSettled(destroyPromises);

    // Clear instances
    this.instances.clear();

    this.logger.info('CoordinationEventManagerFactory shutdown completed');
  }

  /**
   * Get active manager count
   */
  getActiveCount(): number {
    return Array.from(this.instances.values()).filter((manager) => manager.isRunning()).length;
  }

  /**
   * Get factory metrics
   */
  getFactoryMetrics() {
    const runningManagers = this.getActiveCount();

    return {
      totalManagers: this.instances.size,
      runningManagers,
      errorCount: 0, // Would track factory-level errors in real implementation
      uptime: Date.now(), // Would track actual uptime in real implementation
    };
  }

  /**
   * Validate coordination event manager configuration
   *
   * @param config
   */
  private validateConfig(config: CoordinationEventAdapterConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Coordination event manager configuration must have a valid name');
    }

    if (config?.type !== EventManagerTypes["COORDINATION"]) {
      throw new Error(
        `Coordination event manager must have type '${EventManagerTypes["COORDINATION"]}'`
      );
    }

    // Validate coordination-specific configuration
    if (config?.["swarmCoordination"]?.["enabled"] === undefined) {
      config?.["swarmCoordination"] = { ...config?.["swarmCoordination"], enabled: true };
    }

    if (config?.["coordination"]?.["enabled"] && !config?.["coordination"]?.["correlationTTL"]) {
      throw new Error('Coordination correlation TTL must be specified when correlation is enabled');
    }

    if (
      config?.["agentHealthMonitoring"]?.["enabled"] &&
      !config?.["agentHealthMonitoring"]?.["healthCheckInterval"]
    ) {
      throw new Error(
        'Health check interval must be specified when agent health monitoring is enabled'
      );
    }

    if (config?.["swarmOptimization"]?.["enabled"] && !config?.["swarmOptimization"]?.["performanceThresholds"]) {
      throw new Error(
        'Performance thresholds must be specified when swarm optimization is enabled'
      );
    }

    // Validate coordinator list
    if (
      config?.["swarmCoordination"]?.["coordinators"] &&
      !Array.isArray(config?.["swarmCoordination"]?.["coordinators"])
    ) {
      throw new Error('Swarm coordinators must be an array');
    }
  }
}

/**
 * Convenience factory functions for coordination event managers
 */

/**
 * Create a coordination event manager with default configuration
 *
 * @param name
 * @param overrides
 */
export async function createCoordinationEventManager(
  name: string,
  overrides?: Partial<CoordinationEventAdapterConfig>
): Promise<CoordinationEventAdapter> {
  const factory = new CoordinationEventManagerFactory();
  const config = createDefaultCoordinationEventAdapterConfig(name, overrides);
  const manager = await factory.create(config);
  return manager as CoordinationEventAdapter;
}

/**
 * Create coordination event manager for swarm coordination only
 *
 * @param name
 */
export async function createSwarmCoordinationEventManager(
  name: string = 'swarm-coordination-events'
): Promise<CoordinationEventAdapter> {
  return await createCoordinationEventManager(name, {
    swarmCoordination: {
      enabled: true,
      wrapLifecycleEvents: true,
      wrapPerformanceEvents: true,
      wrapTopologyEvents: true,
      wrapHealthEvents: true,
      coordinators: ['default', 'sparc', 'hierarchical'],
    },
    agentManagement: {
      enabled: false,
    },
    taskOrchestration: {
      enabled: false,
    },
    coordination: {
      enabled: true,
      strategy: 'swarm',
      correlationTTL: 600000, // 10 minutes for swarm events
      maxCorrelationDepth: 20,
      correlationPatterns: [
        'coordination:swarm->coordination:topology',
        'coordination:topology->coordination:swarm',
      ],
      trackAgentCommunication: true,
      trackSwarmHealth: true,
    },
    swarmOptimization: {
      enabled: true,
      optimizationInterval: 30000, // 30 seconds for active optimization
      performanceThresholds: {
        latency: 25, // ms - stricter for swarm-only
        throughput: 300, // ops/sec
        reliability: 0.99,
      },
      autoScaling: true,
      loadBalancing: true,
    },
  });
}

/**
 * Create coordination event manager for agent management only
 *
 * @param name
 */
export async function createAgentManagementEventManager(
  name: string = 'agent-management-events'
): Promise<CoordinationEventAdapter> {
  return await createCoordinationEventManager(name, {
    swarmCoordination: {
      enabled: false,
    },
    agentManagement: {
      enabled: true,
      wrapAgentEvents: true,
      wrapHealthEvents: true,
      wrapRegistryEvents: true,
      wrapLifecycleEvents: true,
    },
    taskOrchestration: {
      enabled: false,
    },
    coordination: {
      enabled: true,
      strategy: 'agent',
      correlationTTL: 300000, // 5 minutes for agent events
      maxCorrelationDepth: 15,
      correlationPatterns: ['coordination:agent->coordination:agent'],
      trackAgentCommunication: true,
      trackSwarmHealth: false,
    },
    agentHealthMonitoring: {
      enabled: true,
      healthCheckInterval: 15000, // 15 seconds for agent-focused monitoring
      agentHealthThresholds: {
        'agent-manager': 0.95,
        'agent-pool': 0.9,
        'agent-registry': 0.95,
      },
      swarmHealthThresholds: {},
      autoRecoveryEnabled: true,
    },
  });
}

/**
 * Create coordination event manager for task orchestration only
 *
 * @param name
 */
export async function createTaskOrchestrationEventManager(
  name: string = 'task-orchestration-events'
): Promise<CoordinationEventAdapter> {
  return await createCoordinationEventManager(name, {
    swarmCoordination: {
      enabled: false,
    },
    agentManagement: {
      enabled: false,
    },
    taskOrchestration: {
      enabled: true,
      wrapTaskEvents: true,
      wrapDistributionEvents: true,
      wrapExecutionEvents: true,
      wrapCompletionEvents: true,
    },
    coordination: {
      enabled: true,
      strategy: 'task',
      correlationTTL: 900000, // 15 minutes for task events (longer running)
      maxCorrelationDepth: 25,
      correlationPatterns: [
        'coordination:task->coordination:task',
        'coordination:task->coordination:agent',
      ],
      trackAgentCommunication: true,
      trackSwarmHealth: false,
    },
    performance: {
      enableSwarmCorrelation: false,
      enableAgentTracking: true,
      enableTaskMetrics: true,
      maxConcurrentCoordinations: 200, // Higher for task-focused
      coordinationTimeout: 60000, // Longer for task operations
      enablePerformanceTracking: true,
    },
  });
}

/**
 * Create coordination event manager for protocol management only
 *
 * @param name
 */
export async function createProtocolManagementEventManager(
  name: string = 'protocol-management-events'
): Promise<CoordinationEventAdapter> {
  return await createCoordinationEventManager(name, {
    swarmCoordination: {
      enabled: false,
    },
    agentManagement: {
      enabled: false,
    },
    taskOrchestration: {
      enabled: false,
    },
    protocolManagement: {
      enabled: true,
      wrapCommunicationEvents: true,
      wrapTopologyEvents: true,
      wrapLifecycleEvents: true,
      wrapCoordinationEvents: true,
    },
    coordination: {
      enabled: true,
      strategy: 'topology',
      correlationTTL: 600000, // 10 minutes for protocol events
      maxCorrelationDepth: 12,
      correlationPatterns: ['coordination:topology->coordination:topology'],
      trackAgentCommunication: true,
      trackSwarmHealth: true,
    },
  });
}

/**
 * Create comprehensive coordination event manager for full coordination monitoring
 *
 * @param name
 */
export async function createComprehensiveCoordinationEventManager(
  name: string = 'comprehensive-coordination-events'
): Promise<CoordinationEventAdapter> {
  return await createCoordinationEventManager(name, {
    swarmCoordination: {
      enabled: true,
      wrapLifecycleEvents: true,
      wrapPerformanceEvents: true,
      wrapTopologyEvents: true,
      wrapHealthEvents: true,
      coordinators: ['default', 'sparc', 'hierarchical', 'mesh', 'ring', 'star'],
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
    coordination: {
      enabled: true,
      strategy: 'swarm',
      correlationTTL: 900000, // 15 minutes for comprehensive monitoring
      maxCorrelationDepth: 30,
      correlationPatterns: [
        'coordination:swarm->coordination:agent',
        'coordination:agent->coordination:task',
        'coordination:task->coordination:agent',
        'coordination:topology->coordination:swarm',
        'coordination:swarm->coordination:topology',
      ],
      trackAgentCommunication: true,
      trackSwarmHealth: true,
    },
    agentHealthMonitoring: {
      enabled: true,
      healthCheckInterval: 20000, // 20 seconds for comprehensive monitoring
      agentHealthThresholds: {
        'swarm-coordinator': 0.98,
        'agent-manager': 0.95,
        orchestrator: 0.9,
        'task-distributor': 0.95,
        'topology-manager': 0.85,
        'protocol-manager': 0.9,
      },
      swarmHealthThresholds: {
        'coordination-latency': 75, // ms
        throughput: 150, // ops/sec
        reliability: 0.97,
        'agent-availability': 0.95,
      },
      autoRecoveryEnabled: true,
    },
    swarmOptimization: {
      enabled: true,
      optimizationInterval: 45000, // 45 seconds for comprehensive optimization
      performanceThresholds: {
        latency: 40, // ms - balanced for comprehensive
        throughput: 250, // ops/sec
        reliability: 0.99,
      },
      autoScaling: true,
      loadBalancing: true,
    },
    performance: {
      enableSwarmCorrelation: true,
      enableAgentTracking: true,
      enableTaskMetrics: true,
      maxConcurrentCoordinations: 300, // High capacity for comprehensive monitoring
      coordinationTimeout: 45000,
      enablePerformanceTracking: true,
    },
  });
}

/**
 * Create high-performance coordination event manager for production workloads
 *
 * @param name
 */
export async function createHighPerformanceCoordinationEventManager(
  name: string = 'high-performance-coordination-events'
): Promise<CoordinationEventAdapter> {
  return await createCoordinationEventManager(name, {
    swarmCoordination: {
      enabled: true,
      wrapLifecycleEvents: true,
      wrapPerformanceEvents: true,
      wrapTopologyEvents: false, // Disable to reduce overhead
      wrapHealthEvents: true,
      coordinators: ['default', 'sparc'], // Limited set for performance
    },
    agentManagement: {
      enabled: true,
      wrapAgentEvents: true,
      wrapHealthEvents: false, // Disable to reduce overhead
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
      enabled: false, // Disable for performance
    },
    coordination: {
      enabled: true,
      strategy: 'swarm',
      correlationTTL: 180000, // 3 minutes - shorter for performance
      maxCorrelationDepth: 10, // Reduced for performance
      correlationPatterns: [
        'coordination:swarm->coordination:agent',
        'coordination:task->coordination:agent',
      ],
      trackAgentCommunication: true,
      trackSwarmHealth: false, // Disable to reduce overhead
    },
    agentHealthMonitoring: {
      enabled: true,
      healthCheckInterval: 60000, // 1 minute - less frequent for performance
      agentHealthThresholds: {
        'swarm-coordinator': 0.95,
        'agent-manager': 0.9,
        orchestrator: 0.85,
      },
      swarmHealthThresholds: {
        'coordination-latency': 50, // ms - tighter for performance
        throughput: 500, // ops/sec - higher for performance
        reliability: 0.98,
      },
      autoRecoveryEnabled: true,
    },
    swarmOptimization: {
      enabled: true,
      optimizationInterval: 120000, // 2 minutes - less frequent optimization
      performanceThresholds: {
        latency: 20, // ms - very strict
        throughput: 500, // ops/sec - high performance
        reliability: 0.995,
      },
      autoScaling: true,
      loadBalancing: true,
    },
    performance: {
      enableSwarmCorrelation: true,
      enableAgentTracking: true,
      enableTaskMetrics: true,
      maxConcurrentCoordinations: 500, // Very high capacity
      coordinationTimeout: 15000, // Shorter timeout for performance
      enablePerformanceTracking: true,
    },
    processing: {
      strategy: 'immediate', // Immediate processing for performance
      queueSize: 5000, // Large queue for high throughput
    },
  });
}

/**
 * Create development coordination event manager with enhanced debugging
 *
 * @param name
 */
export async function createDevelopmentCoordinationEventManager(
  name: string = 'development-coordination-events'
): Promise<CoordinationEventAdapter> {
  return await createCoordinationEventManager(name, {
    swarmCoordination: {
      enabled: true,
      wrapLifecycleEvents: true,
      wrapPerformanceEvents: true,
      wrapTopologyEvents: true,
      wrapHealthEvents: true,
      coordinators: ['default', 'sparc', 'debug'],
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
    coordination: {
      enabled: true,
      strategy: 'swarm',
      correlationTTL: 1800000, // 30 minutes - longer for debugging
      maxCorrelationDepth: 50, // Very deep for debugging
      correlationPatterns: [
        'coordination:swarm->coordination:agent',
        'coordination:agent->coordination:task',
        'coordination:task->coordination:agent',
        'coordination:topology->coordination:swarm',
        'coordination:swarm->coordination:topology',
      ],
      trackAgentCommunication: true,
      trackSwarmHealth: true,
    },
    agentHealthMonitoring: {
      enabled: true,
      healthCheckInterval: 10000, // 10 seconds - frequent for debugging
      agentHealthThresholds: {
        'swarm-coordinator': 0.8, // More lenient for development
        'agent-manager': 0.7,
        orchestrator: 0.7,
        'task-distributor': 0.8,
        'topology-manager': 0.7,
        'protocol-manager': 0.7,
      },
      swarmHealthThresholds: {
        'coordination-latency': 200, // ms - more lenient
        throughput: 50, // ops/sec - lower for development
        reliability: 0.8,
        'agent-availability': 0.7,
      },
      autoRecoveryEnabled: true,
    },
    swarmOptimization: {
      enabled: false, // Disable optimization for debugging
    },
    performance: {
      enableSwarmCorrelation: true,
      enableAgentTracking: true,
      enableTaskMetrics: true,
      maxConcurrentCoordinations: 50, // Lower for development
      coordinationTimeout: 120000, // 2 minutes - very long for debugging
      enablePerformanceTracking: true,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000, // 5 seconds - frequent for debugging
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true, // Enable profiling for debugging
    },
  });
}

export default CoordinationEventManagerFactory;
