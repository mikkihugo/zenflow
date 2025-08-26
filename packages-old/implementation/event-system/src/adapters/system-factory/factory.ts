/**
 * @file System Event Factory - Main Factory Class
 *
 * Core factory class for creating system event managers.
 */

import type { Config, Logger } from '@claude-zen/foundation';
import { EventEmitter } from '@claude-zen/foundation';
import type {
  EventManager,
  EventManagerConfig,
  EventManagerFactory,
} from '../../core/interfaces';
import { createSystemEventAdapter } from '../system/adapter';
import type {
  SystemEventFactoryConfig,
  SystemFactoryMetrics,
  SystemHealthResult,
} from './types';
import { SystemFactoryHelpers } from './helpers';

/**
 * System Event Factory implementation.
 *
 * Factory for creating and managing system event manager instances
 * with comprehensive lifecycle management and system orchestration.
 */
export class SystemEventFactory
  extends EventEmitter
  implements EventManagerFactory<EventManagerConfig>
{
  private readonly logger: Logger;
  private readonly instances = new Map<string, EventManager>();
  private readonly startTime = new Date();
  private totalCreated = 0;
  private totalErrors = 0;
  private systemMetrics = {
    totalSystemMonitors: 0,
    activeSystemMonitors: 0,
    failedSystemMonitors: 0,
    averageSystemLoad: 0.2, // Default 20% load
  };

  constructor(
    private readonly factoryConfig: SystemEventFactoryConfig = {},
    logger?: Logger,
    private readonly systemConfig?: Config
  ) {
    super();
    this.logger = logger || (console as any);
    this.logger.info('System Event Factory initialized');

    // Start system monitoring if enabled
    if (this.factoryConfig.enableSystemMonitoring !== false) {
      this.startSystemMonitoring();
    }
  }

  /**
   * Create a new system event manager instance.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    const startTime = Date.now();

    try {
      this.logger.info(`Creating system event manager: ${config?.name}`);

      // Validate configuration
      SystemFactoryHelpers.validateConfig(config);

      // Apply system-optimized defaults
      const optimizedConfig = SystemFactoryHelpers.createDefaultConfig(
        config?.name,
        config
      );

      // Optimize system parameters based on current performance
      const successRate = SystemFactoryHelpers.calculateSystemSuccessRate(
        this.systemMetrics.activeSystemMonitors,
        this.systemMetrics.failedSystemMonitors
      );

      if (successRate > 0) {
        const optimizedParams = SystemFactoryHelpers.optimizeSystemParameters({
          successRate,
          averageResponseTime: this.systemMetrics.averageSystemLoad * 1000,
          errorRate: this.totalErrors / Math.max(this.totalCreated, 1)
        });

        optimizedConfig.processing = {
          ...optimizedConfig.processing,
          queueSize: optimizedParams.queueSize || 10000,
          batchSize: optimizedParams.batchSize || 50,
          throttleMs: optimizedParams.throttleMs || 500,
        };
      }

      // Create manager instance
      const manager = await createSystemEventAdapter(optimizedConfig as any);

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
        `System event manager created successfully: ${config?.name}`
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
        `Failed to create system event manager: ${config?.name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Create multiple system event managers.
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
      this.logger.warn(`Failed to create ${errors.length} system event managers:`, errors);
    }

    return results;
  }

  /**
   * Get an existing system event manager instance.
   */
  get(name: string): EventManager | undefined {
    return this.instances.get(name);
  }

  /**
   * List all system event manager instances.
   */
  list(): EventManager[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if a system event manager instance exists.
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove and destroy a system event manager instance.
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

      this.logger.info(`System event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to remove system event manager ${name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get factory metrics including system performance.
   */
  async getFactoryMetrics(): Promise<SystemFactoryMetrics> {
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

    const baseMetrics = SystemFactoryHelpers.calculateMetrics(
      this.totalCreated,
      this.totalErrors,
      this.instances.size,
      runningInstances,
      this.startTime
    );

    return {
      ...baseMetrics,
      systemMetrics: this.systemMetrics,
    };
  }

  /**
   * Perform health check on the factory and all instances.
   */
  async healthCheck(): Promise<SystemHealthResult> {
    const metrics = await this.getFactoryMetrics();

    const instanceHealth = await Promise.all(
      Array.from(this.instances.entries()).map(async ([name, manager]) => {
        try {
          const status = await manager.healthCheck();
          return {
            name,
            status: status.status || 'unknown',
            activeSystemMonitors: 0, // This would come from actual system tracking
            lastCheck: status.lastCheck || new Date(),
          };
        } catch {
          return {
            name,
            status: 'unhealthy',
            activeSystemMonitors: 0,
            lastCheck: new Date(),
          };
        }
      })
    );

    const status = this.determineOverallHealth(metrics, instanceHealth);
    const systemSuccessRate = SystemFactoryHelpers.calculateSystemSuccessRate(
      this.systemMetrics.activeSystemMonitors,
      this.systemMetrics.failedSystemMonitors
    );

    return {
      status,
      activeInstances: metrics.activeInstances,
      runningInstances: metrics.runningInstances,
      errorRate: metrics.errorRate,
      systemSuccessRate,
      uptime: metrics.uptime,
      timestamp: new Date(),
      details: {
        factoryHealth: `Factory is ${status}`,
        systemHealth: `Success rate: ${(systemSuccessRate * 100).toFixed(1)}%`,
        instanceHealth: instanceHealth.map(h => ({
          ...h,
          status: h.status || 'unknown',
          lastCheck: h.lastCheck || new Date()
        })),
      },
    };
  }

  /**
   * Update system metrics from execution results.
   */
  updateSystemMetrics(metrics: Partial<typeof this.systemMetrics>): void {
    this.systemMetrics = { ...this.systemMetrics, ...metrics };

    this.emit('system:metrics:updated', {
      metrics: this.systemMetrics,
      timestamp: new Date(),
    });
  }

  /**
   * Shutdown the factory and all managed instances.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down System Event Factory');

    try {
      // Shutdown all instances
      const shutdownPromises = Array.from(this.instances.entries()).map(
        async ([name, manager]) => {
          try {
            await manager.destroy();
            this.logger.debug(`Shutdown system event manager: ${name}`);
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

      this.logger.info('System Event Factory shutdown complete');
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

  private startSystemMonitoring(): void {
    const interval = this.factoryConfig.healthCheckInterval || 30000;

    setInterval(() => {
      const successRate = SystemFactoryHelpers.calculateSystemSuccessRate(
        this.systemMetrics.activeSystemMonitors,
        this.systemMetrics.failedSystemMonitors
      );

      if (successRate < 0.8) {
        this.logger.warn(
          'System success rate is low, considering optimization'
        );
      }

      // Emit system performance metrics
      this.emit('system:performance', {
        successRate,
        averageSystemLoad: this.systemMetrics.averageSystemLoad,
        totalSystemMonitors: this.systemMetrics.totalSystemMonitors,
        timestamp: new Date(),
      });
    }, interval);
  }

  private determineOverallHealth(
    metrics: SystemFactoryMetrics,
    instanceHealth: Array<{
      name: string;
      status: string;
      activeSystemMonitors: number;
      lastCheck: Date;
    }>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Check factory-level health
    if (metrics.errorRate > 0.5) return 'unhealthy';
    if (metrics.errorRate > 0.1) return 'degraded';

    // Check system success rate
    const successRate = SystemFactoryHelpers.calculateSystemSuccessRate(
      metrics.systemMetrics.activeSystemMonitors,
      metrics.systemMetrics.failedSystemMonitors
    );

    if (successRate < 0.5) return 'unhealthy';
    if (successRate < 0.8) return 'degraded';

    // Check average system load
    if (metrics.systemMetrics.averageSystemLoad > 0.9) return 'unhealthy';
    if (metrics.systemMetrics.averageSystemLoad > 0.8) return 'degraded';

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
