/**
 * @file Interface Event Factory - Main Factory Class
 *
 * Core factory class for creating interface event managers.
 */

import type { Config, Logger } from '@claude-zen/foundation';
import { EventEmitter, type EventMap } from '@claude-zen/foundation';
import type {
  EventManager,
  EventManagerConfig,
  EventManagerFactory,
} from '../../core/interfaces';
import { createInterfaceEventManager } from '../interface-event-manager';
import type {
  InterfaceEventFactoryConfig,
  InterfaceFactoryMetrics,
  InterfaceHealthResult,
} from './types';
import { InterfaceFactoryHelpers } from './helpers';

/**
 * Interface Event Factory implementation.
 *
 * Factory for creating and managing interface event manager instances
 * with comprehensive lifecycle management and monitoring capabilities.
 */
export class InterfaceEventFactory
  extends EventEmitter<EventMap>
  implements EventManagerFactory<EventManagerConfig>
{
  private readonly logger: Logger;
  private readonly instances = new Map<string, EventManager>();
  private readonly startTime = new Date();
  private totalCreated = 0;
  private totalErrors = 0;

  constructor(
    private readonly factoryConfig: InterfaceEventFactoryConfig = {},
    logger?: Logger,
    private readonly systemConfig?: Config
  ) {
    super();
    this.logger = logger || (console as any);
    this.logger.info('Interface Event Factory initialized');
  }

  /**
   * Create a new interface event manager instance.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    const startTime = Date.now();

    try {
      this.logger.info(`Creating interface event manager: ${config?.name}`);

      // Validate configuration
      InterfaceFactoryHelpers.validateConfig(config);

      // Apply interface-optimized defaults
      const optimizedConfig = InterfaceFactoryHelpers.createDefaultInterfaceConfig(
        config?.name,
        config
      );

      // Create manager instance
      const manager = await createInterfaceEventManager(optimizedConfig);

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
        `Interface event manager created successfully: ${config?.name}`
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
        `Failed to create interface event manager: ${config?.name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Create multiple interface event managers.
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
      this.logger.warn(`Failed to create ${errors.length} interface event managers:`, errors);
    }

    return results;
  }

  /**
   * Get an existing interface event manager instance.
   */
  get(name: string): EventManager | undefined {
    return this.instances.get(name);
  }

  /**
   * List all interface event manager instances.
   */
  list(): EventManager[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if an interface event manager instance exists.
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove and destroy an interface event manager instance.
   */
  async remove(name: string): Promise<boolean> {
    const manager = this.instances.get(name);
    if (!manager) {
      return false;
    }

    try {
      await manager.destroy();
      this.instances.delete(name);

      this.emit('instance:removed', {
        name,
        timestamp: new Date(),
      });

      this.logger.info(`Interface event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to remove interface event manager ${name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get factory metrics.
   */
  async getFactoryMetrics(): Promise<InterfaceFactoryMetrics> {
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

    return InterfaceFactoryHelpers.calculateMetrics(
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
  async healthCheck(): Promise<InterfaceHealthResult> {
    // Create default metrics for the factory
    const factoryMetrics = {
      activeInstances: this.instances.size,
      runningInstances: Array.from(this.instances.values()).filter(m => m.isRunning()).length,
      errorRate: this.totalErrors / (this.totalCreated || 1),
      uptime: Date.now() - this.startTime.getTime(),
    };

    const instanceHealth = await Promise.all(
      Array.from(this.instances.entries()).map(async ([name, manager]) => {
        try {
          const status = await manager.healthCheck();
          return {
            name,
            status: status.status || 'unknown',
            lastCheck: status.lastCheck || new Date(),
          };
        } catch {
          return {
            name,
            status: 'unhealthy',
            lastCheck: new Date(),
          };
        }
      })
    );

    const healthyInstances = instanceHealth.filter(h => h.status === 'healthy').length;
    const status = healthyInstances === this.instances.size ? 'healthy' : 
                   healthyInstances > this.instances.size / 2 ? 'degraded' : 'unhealthy';

    return {
      status,
      activeInstances: factoryMetrics.activeInstances,
      runningInstances: factoryMetrics.runningInstances,
      errorRate: factoryMetrics.errorRate,
      uptime: factoryMetrics.uptime,
      timestamp: new Date(),
      details: {
        factoryHealth: `Factory is ${status}`,
        instanceHealth,
      },
    };
  }

  /**
   * Shutdown the factory and all managed instances.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Interface Event Factory');

    try {
      // Shutdown all instances
      const shutdownPromises = Array.from(this.instances.entries()).map(
        async ([name, manager]) => {
          try {
            await manager.destroy();
            this.logger.debug(`Shutdown interface event manager: ${name}`);
          } catch (error) {
            this.logger.error(`Failed to shutdown manager ${name}:`, error);
          }
        }
      );

      await Promise.allSettled(shutdownPromises);
      this.instances.clear();

      this.emit('factory:shutdown', {
        timestamp: new Date(),
      });

      this.logger.info('Interface Event Factory shutdown complete');
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

  private determineOverallHealth(
    metrics: InterfaceFactoryMetrics,
    instanceHealth: Array<{ name: string; status: string; lastCheck: Date }>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Check factory-level health
    if (metrics.errorRate > 0.5) return 'unhealthy';
    if (metrics.errorRate > 0.1) return 'degraded';

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
