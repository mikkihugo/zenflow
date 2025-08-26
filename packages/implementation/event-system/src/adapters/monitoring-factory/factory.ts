/**
 * @file Monitoring Event Factory - Main Factory Class
 *
 * Core factory class for creating monitoring event managers.
 */

import type { Config, Logger } from '@claude-zen/foundation';
import { EventEmitter } from '@claude-zen/foundation';
import type {
  EventManager,
  EventManagerConfig,
  EventManagerFactory,
} from '../../core/interfaces';
import { createMonitoringEventAdapter } from '../monitoring/adapter';
import type {
  MonitoringEventFactoryConfig,
  MonitoringFactoryMetrics,
  MonitoringHealthResult,
} from './types';
import { MonitoringFactoryHelpers } from './helpers';

/**
 * Monitoring Event Factory implementation.
 *
 * Factory for creating and managing monitoring event manager instances
 * with comprehensive lifecycle management and monitoring orchestration.
 */
export class MonitoringEventFactory
  extends EventEmitter
  implements EventManagerFactory<EventManagerConfig>
{
  private readonly logger: Logger;
  private readonly instances = new Map<string, EventManager>();
  private readonly startTime = new Date();
  private totalCreated = 0;
  private totalErrors = 0;
  private monitoringMetrics = {
    totalMonitors: 0,
    activeMonitors: 0,
    failedMonitors: 0,
    averageResponseTime: 3000, // Default 3 seconds
  };

  constructor(
    private readonly factoryConfig: MonitoringEventFactoryConfig = {},
    logger?: Logger,
    private readonly systemConfig?: Config
  ) {
    super();
    this.logger = logger || (console as any);
    this.logger.info('Monitoring Event Factory initialized');

    // Start monitoring if enabled
    if (this.factoryConfig.enableMonitoring !== false) {
      this.startMonitoringSystem();
    }
  }

  /**
   * Create a new monitoring event manager instance.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    const startTime = Date.now();

    try {
      this.logger.info(`Creating monitoring event manager: ${config?.name}`);

      // Validate configuration
      MonitoringFactoryHelpers.validateConfig(config);

      // Apply monitoring-optimized defaults
      const optimizedConfig = MonitoringFactoryHelpers.createDefaultConfig(
        config?.name,
        config
      );

      // Create manager instance
      const manager = await createMonitoringEventAdapter(
        optimizedConfig as any
      );

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
        `Monitoring event manager created successfully: ${config?.name}`
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
        `Failed to create monitoring event manager: ${config?.name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Create multiple monitoring event managers.
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
      this.logger.warn(`Failed to create ${errors.length} monitoring event managers:`, errors);
    }

    return results;
  }

  /**
   * Get an existing monitoring event manager instance.
   */
  get(name: string): EventManager | undefined {
    return this.instances.get(name);
  }

  /**
   * List all monitoring event manager instances.
   */
  list(): EventManager[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check if a monitoring event manager instance exists.
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove and destroy a monitoring event manager instance.
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

      this.logger.info(`Monitoring event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to remove monitoring event manager ${name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get factory metrics including monitoring performance.
   */
  async getFactoryMetrics(): Promise<MonitoringFactoryMetrics> {
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

    return MonitoringFactoryHelpers.calculateMetrics(
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
  async healthCheck(): Promise<MonitoringHealthResult> {
    const metrics = await this.getFactoryMetrics();

    const instanceHealth = await Promise.all(
      Array.from(this.instances.entries()).map(async ([name, manager]) => {
        try {
          const status = await manager.healthCheck();
          return {
            name,
            status: status.status || 'unknown',
            activeMonitors: 0, // This would come from actual monitoring tracking
            lastCheck: status.lastCheck || new Date(),
          };
        } catch {
          return {
            name,
            status: 'unhealthy',
            activeMonitors: 0,
            lastCheck: new Date(),
          };
        }
      })
    );

    const status = this.determineOverallHealth(metrics, instanceHealth);
    const monitoringSuccessRate =
      MonitoringFactoryHelpers.calculateMonitoringSuccessRate(
        this.monitoringMetrics.activeMonitors,
        this.monitoringMetrics.failedMonitors
      );

    return {
      status,
      activeInstances: metrics.activeInstances,
      runningInstances: metrics.runningInstances,
      errorRate: metrics.errorRate,
      monitoringSuccessRate,
      uptime: metrics.uptime,
      timestamp: new Date(),
      details: {
        factoryHealth: `Factory is ${status}`,
        monitoringHealth: `Success rate: ${(monitoringSuccessRate * 100).toFixed(1)}%`,
        instanceHealth,
      },
    };
  }

  /**
   * Update monitoring metrics from execution results.
   */
  updateMonitoringMetrics(
    metrics: Partial<typeof this.monitoringMetrics>
  ): void {
    this.monitoringMetrics = { ...this.monitoringMetrics, ...metrics };

    this.emit('monitoring:metrics:updated', {
      metrics: this.monitoringMetrics,
      timestamp: new Date(),
    });
  }

  /**
   * Shutdown the factory and all managed instances.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Monitoring Event Factory');

    try {
      // Shutdown all instances
      const shutdownPromises = Array.from(this.instances.entries()).map(
        async ([name, manager]) => {
          try {
            await manager.destroy();
            this.logger.debug(`Shutdown monitoring event manager: ${name}`);
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

      this.logger.info('Monitoring Event Factory shutdown complete');
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

  private startMonitoringSystem(): void {
    const interval = this.factoryConfig.healthCheckInterval || 30000;

    setInterval(() => {
      const successRate =
        MonitoringFactoryHelpers.calculateMonitoringSuccessRate(
          this.monitoringMetrics.activeMonitors,
          this.monitoringMetrics.failedMonitors
        );

      if (successRate < 0.8) {
        this.logger.warn(
          'Monitoring success rate is low, considering optimization'
        );
      }

      // Emit monitoring performance metrics
      this.emit('monitoring:performance', {
        successRate,
        averageResponseTime: this.monitoringMetrics.averageResponseTime,
        totalMonitors: this.monitoringMetrics.totalMonitors,
        timestamp: new Date(),
      });
    }, interval);
  }

  private determineOverallHealth(
    metrics: MonitoringFactoryMetrics,
    instanceHealth: Array<{
      name: string;
      status: string;
      activeMonitors: number;
      lastCheck: Date;
    }>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Check factory-level health
    if (metrics.errorRate > 0.5) return 'unhealthy';
    if (metrics.errorRate > 0.1) return 'degraded';

    // Check monitoring success rate
    const successRate = MonitoringFactoryHelpers.calculateMonitoringSuccessRate(
      metrics.monitoringMetrics.activeMonitors,
      metrics.monitoringMetrics.failedMonitors
    );

    if (successRate < 0.5) return 'unhealthy';
    if (successRate < 0.8) return 'degraded';

    // Check average response time
    if (metrics.monitoringMetrics.averageResponseTime > 10000)
      return 'degraded';
    if (metrics.monitoringMetrics.averageResponseTime > 20000)
      return 'unhealthy';

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
