/**
 * USL Coordination Service Factory.
 *
 * Factory functions and helper utilities for creating and managing
 * coordination service adapter instances with proper configuration.
 * And dependency injection.
 */
/**
 * @file Interface implementation: coordination-service-factory.
 */

import type { Logger } from '../../../config/logging-config.ts';
import { getLogger } from '../../../config/logging-config.ts';
import type { IServiceFactory } from '../core/interfaces.ts';
import { ServicePriority, ServiceType } from '../types.ts';
import {
  type CoordinationServiceAdapter,
  type CoordinationServiceAdapterConfig,
  createCoordinationServiceAdapter,
  createDefaultCoordinationServiceAdapterConfig,
} from './coordination-service-adapter.ts';

/**
 * Factory class for creating CoordinationServiceAdapter instances.
 *
 * @example
 */
export class CoordinationServiceFactory
  implements IServiceFactory<CoordinationServiceAdapterConfig>
{
  private instances = new Map<string, CoordinationServiceAdapter>();
  private logger: Logger;

  constructor() {
    this.logger = getLogger('CoordinationServiceFactory');
  }

  /**
   * Create a new coordination service adapter instance.
   *
   * @param config
   */
  async create(
    config: CoordinationServiceAdapterConfig,
  ): Promise<CoordinationServiceAdapter> {
    this.logger.info(`Creating coordination service adapter: ${config?.name}`);

    // Check if instance already exists
    if (this.instances.has(config?.name)) {
      this.logger.warn(
        `Coordination service adapter ${config?.name} already exists, returning existing instance`,
      );
      return this.instances.get(config?.name)!;
    }

    try {
      const adapter = createCoordinationServiceAdapter(config);
      this.instances.set(config?.name, adapter);

      this.logger.info(
        `Coordination service adapter created successfully: ${config?.name}`,
      );
      return adapter;
    } catch (error) {
      this.logger.error(
        `Failed to create coordination service adapter ${config?.name}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create multiple coordination service adapter instances.
   *
   * @param configs
   */
  async createMultiple(
    configs: CoordinationServiceAdapterConfig[],
  ): Promise<CoordinationServiceAdapter[]> {
    this.logger.info(
      `Creating ${configs.length} coordination service adapters`,
    );

    const results: CoordinationServiceAdapter[] = [];

    for (const config of configs) {
      try {
        const adapter = await this.create(config);
        results.push(adapter);
      } catch (error) {
        this.logger.error(
          `Failed to create coordination service adapter ${config?.name}:`,
          error,
        );
        throw error;
      }
    }

    return results;
  }

  /**
   * Get coordination service adapter by name.
   *
   * @param name
   */
  get(name: string): CoordinationServiceAdapter | undefined {
    return this.instances.get(name);
  }

  /**
   * List all coordination service adapter instances.
   */
  list(): CoordinationServiceAdapter[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if coordination service adapter exists.
   *
   * @param name
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove and destroy coordination service adapter.
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const adapter = this.instances.get(name);
    if (!adapter) {
      return false;
    }

    try {
      await adapter.destroy();
      this.instances.delete(name);
      this.logger.info(`Coordination service adapter removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to remove coordination service adapter ${name}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get supported service types.
   */
  getSupportedTypes(): string[] {
    return [
      ServiceType.COORDINATION,
      ServiceType.DAA,
      ServiceType.SESSION_RECOVERY,
    ];
  }

  /**
   * Check if service type is supported.
   *
   * @param type
   */
  supportsType(type: string): boolean {
    return this.getSupportedTypes().includes(type);
  }

  /**
   * Start all coordination service adapters.
   */
  async startAll(): Promise<void> {
    this.logger.info('Starting all coordination service adapters');

    const startPromises = this.list().map(async (adapter) => {
      try {
        await adapter.start();
        this.logger.debug(
          `Started coordination service adapter: ${adapter.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to start coordination service adapter ${adapter.name}:`,
          error,
        );
        throw error;
      }
    });

    await Promise.allSettled(startPromises);
  }

  /**
   * Stop all coordination service adapters.
   */
  async stopAll(): Promise<void> {
    this.logger.info('Stopping all coordination service adapters');

    const stopPromises = this.list().map(async (adapter) => {
      try {
        await adapter.stop();
        this.logger.debug(
          `Stopped coordination service adapter: ${adapter.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to stop coordination service adapter ${adapter.name}:`,
          error,
        );
      }
    });

    await Promise.allSettled(stopPromises);
  }

  /**
   * Perform health check on all coordination service adapters.
   */
  async healthCheckAll(): Promise<Map<string, any>> {
    this.logger.debug(
      'Performing health check on all coordination service adapters',
    );

    const results = new Map<string, any>();
    const adapters = this.list();

    const healthCheckPromises = adapters.map(async (adapter) => {
      try {
        const status = await adapter.getStatus();
        results?.set(adapter.name, status);
      } catch (error) {
        this.logger.error(
          `Health check failed for coordination service adapter ${adapter.name}:`,
          error,
        );
        results?.set(adapter.name, {
          name: adapter.name,
          type: adapter.type,
          lifecycle: 'error',
          health: 'unhealthy',
          lastCheck: new Date(),
          uptime: 0,
          errorCount: 1,
          errorRate: 100,
        });
      }
    });

    await Promise.allSettled(healthCheckPromises);
    return results;
  }

  /**
   * Get metrics from all coordination service adapters.
   */
  async getMetricsAll(): Promise<Map<string, any>> {
    this.logger.debug(
      'Collecting metrics from all coordination service adapters',
    );

    const results = new Map<string, any>();
    const adapters = this.list();

    const metricsPromises = adapters.map(async (adapter) => {
      try {
        const metrics = await adapter.getMetrics();
        results?.set(adapter.name, metrics);
      } catch (error) {
        this.logger.error(
          `Failed to get metrics for coordination service adapter ${adapter.name}:`,
          error,
        );
      }
    });

    await Promise.allSettled(metricsPromises);
    return results;
  }

  /**
   * Shutdown factory and all coordination service adapters.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down coordination service factory');

    try {
      await this.stopAll();

      const destroyPromises = this.list().map(async (adapter) => {
        try {
          await adapter.destroy();
        } catch (error) {
          this.logger.error(
            `Failed to destroy coordination service adapter ${adapter.name}:`,
            error,
          );
        }
      });

      await Promise.allSettled(destroyPromises);
      this.instances.clear();

      this.logger.info('Coordination service factory shutdown completed');
    } catch (error) {
      this.logger.error(
        'Error during coordination service factory shutdown:',
        error,
      );
      throw error;
    }
  }

  /**
   * Get number of active coordination service adapters.
   */
  getActiveCount(): number {
    return this.instances.size;
  }
}

/**
 * Helper function to create agent-focused coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.maxAgents
 * @param options.topology
 * @param options.enableLearning
 * @param options.autoSpawn
 * @example
 */
export function createAgentCoordinationConfig(
  name: string,
  options?: {
    maxAgents?: number;
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    enableLearning?: boolean;
    autoSpawn?: boolean;
  },
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType.COORDINATION,
    priority: ServicePriority.HIGH,
    daaService: {
      enabled: true,
      autoInitialize: true,
      enableLearning: options?.enableLearning ?? true,
      enableCognitive: true,
      enableMetaLearning: true,
    },
    swarmCoordinator: {
      enabled: true,
      defaultTopology: options?.topology ?? 'mesh',
      maxAgents: options?.maxAgents ?? 20,
      coordinationTimeout: 15000,
      performanceThreshold: 0.85,
    },
    agentManagement: {
      autoSpawn: options?.autoSpawn ?? false,
      maxLifetime: 7200000, // 2 hours
      healthCheckInterval: 60000,
      performanceTracking: true,
    },
    learning: {
      enableContinuousLearning: options?.enableLearning ?? true,
      knowledgeSharing: true,
      patternAnalysis: true,
      metaLearningInterval: 1800000, // 30 minutes
    },
  });
}

/**
 * Helper function to create session-focused coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.maxSessions
 * @param options.checkpointInterval
 * @param options.autoRecovery
 * @example
 */
export function createSessionCoordinationConfig(
  name: string,
  options?: {
    maxSessions?: number;
    checkpointInterval?: number;
    autoRecovery?: boolean;
  },
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType.SESSION_RECOVERY,
    priority: ServicePriority.HIGH,
    sessionService: {
      enabled: true,
      autoRecovery: options?.autoRecovery ?? true,
      healthCheckInterval: 30000,
      maxSessions: options?.maxSessions ?? 50,
      checkpointInterval: options?.checkpointInterval ?? 300000, // 5 minutes
    },
    performance: {
      enableRequestDeduplication: true,
      maxConcurrency: 15,
      requestTimeout: 45000,
      enableMetricsCollection: true,
      sessionCaching: true,
    },
    cache: {
      enabled: true,
      strategy: 'memory',
      defaultTTL: 900000, // 15 minutes
      maxSize: 200,
      keyPrefix: 'session-coord:',
    },
  });
}

/**
 * Helper function to create DAA-focused coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.enableMetaLearning
 * @param options.enableCognitive
 * @param options.analysisInterval
 * @example
 */
export function createDAACoordinationConfig(
  name: string,
  options?: {
    enableMetaLearning?: boolean;
    enableCognitive?: boolean;
    analysisInterval?: number;
  },
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType.DAA,
    priority: ServicePriority.HIGH,
    daaService: {
      enabled: true,
      autoInitialize: true,
      enableLearning: true,
      enableCognitive: options?.enableCognitive ?? true,
      enableMetaLearning: options?.enableMetaLearning ?? true,
    },
    learning: {
      enableContinuousLearning: true,
      knowledgeSharing: true,
      patternAnalysis: true,
      metaLearningInterval: options?.analysisInterval ?? 1200000, // 20 minutes
    },
    performance: {
      enableRequestDeduplication: true,
      maxConcurrency: 25,
      requestTimeout: 60000,
      enableMetricsCollection: true,
    },
  });
}

/**
 * Helper function to create high-performance coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.maxConcurrency
 * @param options.requestTimeout
 * @param options.cacheSize
 * @example
 */
export function createHighPerformanceCoordinationConfig(
  name: string,
  options?: {
    maxConcurrency?: number;
    requestTimeout?: number;
    cacheSize?: number;
  },
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType.COORDINATION,
    priority: ServicePriority.HIGH,
    performance: {
      enableRequestDeduplication: true,
      maxConcurrency: options?.maxConcurrency ?? 50,
      requestTimeout: options?.requestTimeout ?? 20000,
      enableMetricsCollection: true,
      agentPooling: true,
      sessionCaching: true,
    },
    cache: {
      enabled: true,
      strategy: 'memory',
      defaultTTL: 300000, // 5 minutes
      maxSize: options?.cacheSize ?? 1000,
      keyPrefix: 'perf-coord:',
    },
    retry: {
      enabled: true,
      maxAttempts: 5,
      backoffMultiplier: 1.5,
      retryableOperations: [
        'agent-create',
        'agent-adapt',
        'workflow-execute',
        'session-create',
        'session-save',
        'session-restore',
        'swarm-coordinate',
        'swarm-assign-task',
        'knowledge-share',
        'cognitive-analyze',
        'meta-learning',
      ],
    },
  });
}

/**
 * Configuration presets for common coordination use cases.
 */
export const CoordinationConfigPresets = {
  /**
   * Basic coordination configuration for simple agent management.
   *
   * @param name
   */
  BASIC: (name: string) =>
    createDefaultCoordinationServiceAdapterConfig(name, {
      type: ServiceType.COORDINATION,
      priority: ServicePriority.NORMAL,
    }),

  /**
   * Advanced coordination configuration with all features enabled.
   *
   * @param name
   */
  ADVANCED: (name: string) =>
    createAgentCoordinationConfig(name, {
      maxAgents: 100,
      topology: 'hierarchical',
      enableLearning: true,
      autoSpawn: true,
    }),

  /**
   * Session-focused configuration for session management.
   *
   * @param name
   */
  SESSION_MANAGEMENT: (name: string) =>
    createSessionCoordinationConfig(name, {
      maxSessions: 200,
      checkpointInterval: 180000, // 3 minutes
      autoRecovery: true,
    }),

  /**
   * DAA-focused configuration for data analysis and learning.
   *
   * @param name
   */
  DATA_ANALYSIS: (name: string) =>
    createDAACoordinationConfig(name, {
      enableMetaLearning: true,
      enableCognitive: true,
      analysisInterval: 900000, // 15 minutes
    }),

  /**
   * High-performance configuration for heavy workloads.
   *
   * @param name
   */
  HIGH_PERFORMANCE: (name: string) =>
    createHighPerformanceCoordinationConfig(name, {
      maxConcurrency: 100,
      requestTimeout: 15000,
      cacheSize: 2000,
    }),
};

/**
 * Global coordination service factory instance.
 */
export const coordinationServiceFactory = new CoordinationServiceFactory();

export default CoordinationServiceFactory;
