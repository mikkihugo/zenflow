/**
 * @file Memory Event Factory - Main Factory Class
 *
 * Core factory class for creating memory event managers.
 */

import type { Config, Logger } from '@claude-zen/foundation';
import { EventEmitter } from '@claude-zen/foundation';
import type {
  EventManager,
  EventManagerConfig,
  EventManagerFactory,
} from '../../core/interfaces';
import { createMemoryEventManager } from '../memory-event-manager';
import type {
  MemoryEventFactoryConfig,
  MemoryFactoryMetrics,
  MemoryHealthResult,
} from './types';
import { MemoryFactoryHelpers } from './helpers';

/**
 * Memory Event Factory implementation.
 *
 * Factory for creating and managing memory event manager instances
 * with comprehensive lifecycle management and memory monitoring.
 */
export class MemoryEventFactory
  extends EventEmitter
  implements EventManagerFactory<EventManagerConfig>
{
  private readonly logger: Logger;
  private readonly instances = new Map<string, EventManager>();
  private readonly startTime = new Date();
  private totalCreated = 0;
  private totalErrors = 0;

  constructor(
    private readonly factoryConfig: MemoryEventFactoryConfig = {},
    logger?: Logger,
    private readonly systemConfig?: Config
  ) {
    super();
    this.logger = logger || (console as any);
    this.logger.info('Memory Event Factory initialized');

    // Start memory monitoring if enabled
    if (this.factoryConfig.enableMonitoring !== false) {
      this.startMemoryMonitoring();
    }
  }

  /**
   * Create a new memory event manager instance.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    const startTime = Date.now();

    try {
      this.logger.info(`Creating memory event manager: ${config?.name}`);

      // Check memory before creating new instance
      if (!MemoryFactoryHelpers.checkMemoryHealth()) {
        MemoryFactoryHelpers.suggestGarbageCollection();
      }

      // Validate configuration
      MemoryFactoryHelpers.validateConfig(config);

      // Apply memory-optimized defaults
      const optimizedConfig = MemoryFactoryHelpers.createDefaultConfig(
        config?.name,
        config
      );

      // Create manager instance
      const manager = await createMemoryEventManager(optimizedConfig);

      // Store in registry
      this.instances.set(config?.name, manager);
      this.totalCreated++;

      this.emit('instance:created', {
        name: config?.name,
        config: optimizedConfig,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      this.logger.info(
        `Memory event manager created successfully: ${config?.name}`
      );
      return manager;
    } catch (error) {
      this.totalErrors++;
      this.emit('instance:error', {
        name: config?.name,
        error,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      this.logger.error(
        `Failed to create memory event manager: ${config?.name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Create multiple memory event managers.
   */
  async createMultiple(configs: EventManagerConfig[]): Promise<EventManager[]> {
    const results: EventManager[] = [];
    const errors: Array<{ name: string; error: Error }> = [];

    for (const config of configs) {
      try {
        const manager = await this.create(config);
        results.push(manager);
      } catch (error) {
        errors.push({ name: config.name, error: error as Error });
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Failed to create ${errors.length} memory event managers:`, errors);
    }

    return results;
  }

  /**
   * Get an existing memory event manager instance.
   */
  get(name: string): EventManager | undefined {
    return this.instances.get(name);
  }

  /**
   * List all memory event manager instances.
   */
  list(): EventManager[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if a memory event manager instance exists.
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove and destroy a memory event manager instance.
   */
  async remove(name: string): Promise<boolean> {
    const manager = this.instances.get(name);
    if (!manager) {
      return false;
    }

    try {
      await manager.destroy();
      this.instances.delete(name);

      // Suggest garbage collection after removal
      MemoryFactoryHelpers.suggestGarbageCollection();

      this.emit('instance:removed', {
        name,
        timestamp: new Date(),
      });

      this.logger.info(`Memory event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to remove memory event manager ${name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get factory metrics including memory usage.
   */
  async getFactoryMetrics(): Promise<MemoryFactoryMetrics> {
    const runningInstances = (
      await Promise.all(
        Array.from(this.instances.values()).map(async (manager) => {
          try {
            return manager.isRunning() ? 1 : 0;
          } catch {
            return 0;
          }
        })
      )
    ).reduce((sum: number, val: number) => sum + val, 0);

    return MemoryFactoryHelpers.calculateMetrics(
      this.totalCreated,
      this.totalErrors,
      this.instances.size,
      runningInstances,
      this.startTime
    );
  }

  /**
   * Perform health check on the factory and all instances.
   */
  async healthCheck(): Promise<MemoryHealthResult> {
    const metrics = await this.getFactoryMetrics();

    const instanceHealth = await Promise.all(
      Array.from(this.instances.entries()).map(async ([name, manager]) => {
        try {
          const status = await manager.healthCheck();
          const memoryUsage = process.memoryUsage();
          return {
            name,
            status: status.status || 'unknown',
            memoryUsage: memoryUsage.heapUsed,
            lastCheck: status.lastCheck || new Date(),
          };
        } catch {
          return {
            name,
            status: 'unhealthy',
            memoryUsage: 0,
            lastCheck: new Date(),
          };
        }
      })
    );

    const status = this.determineOverallHealth(metrics, instanceHealth);
    const memoryUsageRatio =
      metrics.memoryUsage.used / metrics.memoryUsage.total;

    return {
      status,
      activeInstances: metrics.activeInstances,
      runningInstances: metrics.runningInstances,
      errorRate: metrics.errorRate,
      memoryUsage: memoryUsageRatio,
      uptime: metrics.uptime,
      timestamp: new Date(),
      details: {
        factoryHealth: `Factory is ${status}`,
        memoryHealth: `Memory usage: ${(memoryUsageRatio * 100).toFixed(1)}%`,
        instanceHealth,
      },
    };
  }

  /**
   * Shutdown the factory and all managed instances.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Memory Event Factory');

    try {
      // Shutdown all instances
      const shutdownPromises = Array.from(this.instances.entries()).map(
        async ([name, manager]) => {
          try {
            await manager.destroy();
            this.logger.debug(`Shutdown memory event manager: ${name}`);
          } catch (error) {
            this.logger.error(`Failed to shutdown manager ${name}:`, error);
          }
        }
      );

      await Promise.allSettled(shutdownPromises);
      this.instances.clear();

      // Final garbage collection
      MemoryFactoryHelpers.suggestGarbageCollection();

      this.emit('factory:shutdown', {
        timestamp: new Date(),
      });

      this.logger.info('Memory Event Factory shutdown complete');
    } catch (error) {
      this.logger.error('Error during factory shutdown:', error);
      throw error;
    }
  }

  /**
   * Get the number of active instances.
   */
  getActiveCount(): number {
    return this.instances.size;
  }

  private startMemoryMonitoring(): void {
    const interval = this.factoryConfig.healthCheckInterval || 30000;

    setInterval(() => {
      if (!MemoryFactoryHelpers.checkMemoryHealth()) {
        this.logger.warn(
          'High memory usage detected, suggesting garbage collection'
        );
        MemoryFactoryHelpers.suggestGarbageCollection();
      }
    }, interval);
  }

  private determineOverallHealth(
    metrics: MemoryFactoryMetrics,
    instanceHealth: Array<{
      name: string;
      status: string;
      memoryUsage: number;
      lastCheck: Date;
    }>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Check factory-level health
    if (metrics.errorRate > 0.5) return 'unhealthy';
    if (metrics.errorRate > 0.1) return 'degraded';

    // Check memory health
    const memoryUsageRatio =
      metrics.memoryUsage.used / metrics.memoryUsage.total;
    if (memoryUsageRatio > 0.9) return 'unhealthy';
    if (memoryUsageRatio > 0.8) return 'degraded';

    // Check instance health
    const unhealthyCount = instanceHealth.filter(
      (h) => h.status === 'unhealthy'
    ).length;
    const degradedCount = instanceHealth.filter(
      (h) => h.status === 'degraded'
    ).length;
    const totalInstances = instanceHealth.length;

    if (totalInstances === 0) return 'healthy';

    const unhealthyRatio = unhealthyCount / totalInstances;
    const degradedRatio = (unhealthyCount + degradedCount) / totalInstances;

    if (unhealthyRatio > 0.5) return 'unhealthy';
    if (degradedRatio > 0.3) return 'degraded';

    return 'healthy';
  }
}
