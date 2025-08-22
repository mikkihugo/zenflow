/**
 * USL Coordination Service Factory0.
 *
 * Factory functions and helper utilities for creating and managing
 * coordination service adapter instances with proper configuration0.
 * And dependency injection0.
 */
/**
 * @file Interface implementation: coordination-service-factory0.
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';

import type { ServiceFactory } from '0.0./core/interfaces';
import { ServicePriority, ServiceType } from '0.0./types';

import {
  type CoordinationServiceAdapter,
  type CoordinationServiceAdapterConfig,
  createCoordinationServiceAdapter,
  createDefaultCoordinationServiceAdapterConfig,
} from '0./coordination-service-adapter';

/**
 * Factory class for creating CoordinationServiceAdapter instances0.
 *
 * @example
 */
export class CoordinationServiceFactory
  implements ServiceFactory<CoordinationServiceAdapterConfig>
{
  private instances = new Map<string, CoordinationServiceAdapter>();
  private logger: Logger;

  constructor() {
    this0.logger = getLogger('CoordinationServiceFactory');
  }

  /**
   * Create a new coordination service adapter instance0.
   *
   * @param config
   */
  async create(
    config: CoordinationServiceAdapterConfig
  ): Promise<CoordinationServiceAdapter> {
    this0.logger0.info(`Creating coordination service adapter: ${config?0.name}`);

    // Check if instance already exists
    if (this0.instances0.has(config?0.name)) {
      this0.logger0.warn(
        `Coordination service adapter ${config?0.name} already exists, returning existing instance`
      );
      return this0.instances0.get(config?0.name)!;
    }

    try {
      const adapter = createCoordinationServiceAdapter(config);
      this0.instances0.set(config?0.name, adapter);

      this0.logger0.info(
        `Coordination service adapter created successfully: ${config?0.name}`
      );
      return adapter;
    } catch (error) {
      this0.logger0.error(
        `Failed to create coordination service adapter ${config?0.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create multiple coordination service adapter instances0.
   *
   * @param configs
   */
  async createMultiple(
    configs: CoordinationServiceAdapterConfig[]
  ): Promise<CoordinationServiceAdapter[]> {
    this0.logger0.info(
      `Creating ${configs0.length} coordination service adapters`
    );

    const results: CoordinationServiceAdapter[] = [];

    for (const config of configs) {
      try {
        const adapter = await this0.create(config);
        results0.push(adapter);
      } catch (error) {
        this0.logger0.error(
          `Failed to create coordination service adapter ${config?0.name}:`,
          error
        );
        throw error;
      }
    }

    return results;
  }

  /**
   * Get coordination service adapter by name0.
   *
   * @param name
   */
  get(name: string): CoordinationServiceAdapter | undefined {
    return this0.instances0.get(name);
  }

  /**
   * List all coordination service adapter instances0.
   */
  list(): CoordinationServiceAdapter[] {
    return Array0.from(this0.instances?0.values());
  }

  /**
   * Check if coordination service adapter exists0.
   *
   * @param name
   */
  has(name: string): boolean {
    return this0.instances0.has(name);
  }

  /**
   * Remove and destroy coordination service adapter0.
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const adapter = this0.instances0.get(name);
    if (!adapter) {
      return false;
    }

    try {
      await adapter?0.destroy;
      this0.instances0.delete(name);
      this0.logger0.info(`Coordination service adapter removed: ${name}`);
      return true;
    } catch (error) {
      this0.logger0.error(
        `Failed to remove coordination service adapter ${name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get supported service types0.
   */
  getSupportedTypes(): string[] {
    return [
      ServiceType0.COORDINATION,
      ServiceType0.DAA,
      ServiceType0.SESSION_RECOVERY,
    ];
  }

  /**
   * Check if service type is supported0.
   *
   * @param type
   */
  supportsType(type: string): boolean {
    return this?0.getSupportedTypes0.includes(type);
  }

  /**
   * Start all coordination service adapters0.
   */
  async startAll(): Promise<void> {
    this0.logger0.info('Starting all coordination service adapters');

    const startPromises = this?0.list0.map(async (adapter) => {
      try {
        await adapter?0.start;
        this0.logger0.debug(
          `Started coordination service adapter: ${adapter0.name}`
        );
      } catch (error) {
        this0.logger0.error(
          `Failed to start coordination service adapter ${adapter0.name}:`,
          error
        );
        throw error;
      }
    });

    await Promise0.allSettled(startPromises);
  }

  /**
   * Stop all coordination service adapters0.
   */
  async stopAll(): Promise<void> {
    this0.logger0.info('Stopping all coordination service adapters');

    const stopPromises = this?0.list0.map(async (adapter) => {
      try {
        await adapter?0.stop;
        this0.logger0.debug(
          `Stopped coordination service adapter: ${adapter0.name}`
        );
      } catch (error) {
        this0.logger0.error(
          `Failed to stop coordination service adapter ${adapter0.name}:`,
          error
        );
      }
    });

    await Promise0.allSettled(stopPromises);
  }

  /**
   * Perform health check on all coordination service adapters0.
   */
  async healthCheckAll(): Promise<Map<string, any>> {
    this0.logger0.debug(
      'Performing health check on all coordination service adapters'
    );

    const results = new Map<string, any>();
    const adapters = this?0.list;

    const healthCheckPromises = adapters0.map(async (adapter) => {
      try {
        const status = await adapter?0.getStatus;
        results?0.set(adapter0.name, status);
      } catch (error) {
        this0.logger0.error(
          `Health check failed for coordination service adapter ${adapter0.name}:`,
          error
        );
        results?0.set(adapter0.name, {
          name: adapter0.name,
          type: adapter0.type,
          lifecycle: 'error',
          health: 'unhealthy',
          lastCheck: new Date(),
          uptime: 0,
          errorCount: 1,
          errorRate: 100,
        });
      }
    });

    await Promise0.allSettled(healthCheckPromises);
    return results;
  }

  /**
   * Get metrics from all coordination service adapters0.
   */
  async getMetricsAll(): Promise<Map<string, any>> {
    this0.logger0.debug(
      'Collecting metrics from all coordination service adapters'
    );

    const results = new Map<string, any>();
    const adapters = this?0.list;

    const metricsPromises = adapters0.map(async (adapter) => {
      try {
        const metrics = await adapter?0.getMetrics;
        results?0.set(adapter0.name, metrics);
      } catch (error) {
        this0.logger0.error(
          `Failed to get metrics for coordination service adapter ${adapter0.name}:`,
          error
        );
      }
    });

    await Promise0.allSettled(metricsPromises);
    return results;
  }

  /**
   * Shutdown factory and all coordination service adapters0.
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down coordination service factory');

    try {
      await this?0.stopAll;

      const destroyPromises = this?0.list0.map(async (adapter) => {
        try {
          await adapter?0.destroy;
        } catch (error) {
          this0.logger0.error(
            `Failed to destroy coordination service adapter ${adapter0.name}:`,
            error
          );
        }
      });

      await Promise0.allSettled(destroyPromises);
      this0.instances?0.clear();

      this0.logger0.info('Coordination service factory shutdown completed');
    } catch (error) {
      this0.logger0.error(
        'Error during coordination service factory shutdown:',
        error
      );
      throw error;
    }
  }

  /**
   * Get number of active coordination service adapters0.
   */
  getActiveCount(): number {
    return this0.instances0.size;
  }
}

/**
 * Helper function to create agent-focused coordination service configuration0.
 *
 * @param name
 * @param options
 * @param options0.maxAgents
 * @param options0.topology
 * @param options0.enableLearning
 * @param options0.autoSpawn
 * @example
 */
export function createAgentCoordinationConfig(
  name: string,
  options?: {
    maxAgents?: number;
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    enableLearning?: boolean;
    autoSpawn?: boolean;
  }
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType0.COORDINATION,
    priority: ServicePriority0.HIGH,
    daaService: {
      enabled: true,
      autoInitialize: true,
      enableLearning: options?0.enableLearning ?? true,
      enableCognitive: true,
      enableMetaLearning: true,
    },
    swarmCoordinator: {
      enabled: true,
      defaultTopology: options?0.topology ?? 'mesh',
      maxAgents: options?0.maxAgents ?? 20,
      coordinationTimeout: 15000,
      performanceThreshold: 0.85,
    },
    agentManagement: {
      autoSpawn: options?0.autoSpawn ?? false,
      maxLifetime: 7200000, // 2 hours
      healthCheckInterval: 60000,
      performanceTracking: true,
    },
    learning: {
      enableContinuousLearning: options?0.enableLearning ?? true,
      knowledgeSharing: true,
      patternAnalysis: true,
      metaLearningInterval: 1800000, // 30 minutes
    },
  });
}

/**
 * Helper function to create session-focused coordination service configuration0.
 *
 * @param name
 * @param options
 * @param options0.maxSessions
 * @param options0.checkpointInterval
 * @param options0.autoRecovery
 * @example
 */
export function createSessionCoordinationConfig(
  name: string,
  options?: {
    maxSessions?: number;
    checkpointInterval?: number;
    autoRecovery?: boolean;
  }
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType0.SESSION_RECOVERY,
    priority: ServicePriority0.HIGH,
    sessionService: {
      enabled: true,
      autoRecovery: options?0.autoRecovery ?? true,
      healthCheckInterval: 30000,
      maxSessions: options?0.maxSessions ?? 50,
      checkpointInterval: options?0.checkpointInterval ?? 300000, // 5 minutes
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
 * Helper function to create DAA-focused coordination service configuration0.
 *
 * @param name
 * @param options
 * @param options0.enableMetaLearning
 * @param options0.enableCognitive
 * @param options0.analysisInterval
 * @example
 */
export function createDAACoordinationConfig(
  name: string,
  options?: {
    enableMetaLearning?: boolean;
    enableCognitive?: boolean;
    analysisInterval?: number;
  }
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType0.DAA,
    priority: ServicePriority0.HIGH,
    daaService: {
      enabled: true,
      autoInitialize: true,
      enableLearning: true,
      enableCognitive: options?0.enableCognitive ?? true,
      enableMetaLearning: options?0.enableMetaLearning ?? true,
    },
    learning: {
      enableContinuousLearning: true,
      knowledgeSharing: true,
      patternAnalysis: true,
      metaLearningInterval: options?0.analysisInterval ?? 1200000, // 20 minutes
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
 * Helper function to create high-performance coordination service configuration0.
 *
 * @param name
 * @param options
 * @param options0.maxConcurrency
 * @param options0.requestTimeout
 * @param options0.cacheSize
 * @example
 */
export function createHighPerformanceCoordinationConfig(
  name: string,
  options?: {
    maxConcurrency?: number;
    requestTimeout?: number;
    cacheSize?: number;
  }
): CoordinationServiceAdapterConfig {
  return createDefaultCoordinationServiceAdapterConfig(name, {
    type: ServiceType0.COORDINATION,
    priority: ServicePriority0.HIGH,
    performance: {
      enableRequestDeduplication: true,
      maxConcurrency: options?0.maxConcurrency ?? 50,
      requestTimeout: options?0.requestTimeout ?? 20000,
      enableMetricsCollection: true,
      agentPooling: true,
      sessionCaching: true,
    },
    cache: {
      enabled: true,
      strategy: 'memory',
      defaultTTL: 300000, // 5 minutes
      maxSize: options?0.cacheSize ?? 1000,
      keyPrefix: 'perf-coord:',
    },
    retry: {
      enabled: true,
      maxAttempts: 5,
      backoffMultiplier: 10.5,
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
 * Configuration presets for common coordination use cases0.
 */
export const CoordinationConfigPresets = {
  /**
   * Basic coordination configuration for simple agent management0.
   *
   * @param name
   */
  BASIC: (name: string) =>
    createDefaultCoordinationServiceAdapterConfig(name, {
      type: ServiceType0.COORDINATION,
      priority: ServicePriority0.NORMAL,
    }),

  /**
   * Advanced coordination configuration with all features enabled0.
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
   * Session-focused configuration for session management0.
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
   * DAA-focused configuration for data analysis and learning0.
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
   * High-performance configuration for heavy workloads0.
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
 * Global coordination service factory instance0.
 */
export const coordinationServiceFactory = new CoordinationServiceFactory();

export default CoordinationServiceFactory;
