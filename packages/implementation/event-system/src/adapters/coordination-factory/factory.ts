/**
 * @file Coordination Event Factory - Main Factory Class
 * 
 * Main factory class for creating and managing coordination event adapters.
 */

import { getLogger, type Logger, TypedEventBase } from '@claude-zen/foundation';
import type { EventManager, EventManagerFactory, EventManagerStatus, EventManagerMetrics } from '../../core/interfaces';
import { createCoordinationEventAdapter } from '../coordination';
import type { CoordinationEventAdapterConfig, CoordinationEventAdapter } from '../coordination';
import type { 
  CoordinationEventFactoryConfig, 
  CoordinationFactoryMetrics,
  CoordinationHealthResult,
  FactoryOperationResult,
  BulkOperationResult
} from './types';
import { CoordinationFactoryHelpers } from './helpers';

/**
 * Coordination Event Manager Factory.
 *
 * Creates and manages CoordinationEventAdapter instances for coordination-level event management.
 * Integrates with the UEL factory system to provide unified access to coordination events.
 */
export class CoordinationEventFactory extends TypedEventBase implements EventManagerFactory<CoordinationEventAdapterConfig> {
  private readonly logger: Logger;
  private readonly instances = new Map<string, CoordinationEventAdapter>();
  private readonly config: CoordinationEventFactoryConfig;
  private readonly startTime = new Date();
  private totalCreated = 0;
  private totalErrors = 0;

  constructor(config: CoordinationEventFactoryConfig = { name: 'coordination-factory' }) {
    super();
    this.logger = getLogger('CoordinationEventFactory');
    this.config = config;
    this.logger.info(`Coordination Event Factory initialized: ${config.name}`);
  }

  /**
   * Create new coordination event adapter instance.
   */
  async create(config: CoordinationEventAdapterConfig): Promise<EventManager> {
    try {
      this.logger.info(`Creating coordination event manager: ${config?.name}`);

      // Validate configuration
      CoordinationFactoryHelpers.validateConfig(config);

      // Check for duplicate names
      if (this.instances.has(config?.name)) {
        throw new Error(`Coordination event manager with name '${config?.name}' already exists`);
      }

      // Create adapter instance
      const adapter = createCoordinationEventAdapter(config);

      // Set up event forwarding
      this.setupEventForwarding(adapter, config?.name);

      // Store in registry
      this.instances.set(config?.name, adapter);
      this.totalCreated++;

      this.logger.info(`Coordination event manager created successfully: ${config?.name}`);
      this.emit('adapter-created', { name: config?.name, adapter });

      return adapter;
    } catch (error) {
      this.totalErrors++;
      this.logger.error(`Failed to create coordination event manager '${config?.name}':`, error);
      this.emit('adapter-creation-failed', { name: config?.name, error });
      throw error;
    }
  }

  /**
   * Create multiple coordination event adapters.
   */
  async createMultiple(configs: CoordinationEventAdapterConfig[]): Promise<EventManager[]> {
    this.logger.info(`Creating ${configs.length} coordination event managers`);

    const results: EventManager[] = [];
    const errors: Array<{ name: string; error: Error }> = [];

    // Create adapters in parallel
    const creationPromises = configs.map(async (config) => {
      try {
        const adapter = await this.create(config);
        results.push(adapter);
        return adapter;
      } catch (error) {
        errors.push({ name: config?.name, error: error as Error });
        return null;
      }
    });

    await Promise.all(creationPromises);

    if (errors.length > 0) {
      this.logger.warn(`Failed to create ${errors.length} coordination event managers:`, errors);
      this.emit('multiple-creation-partial-failure', {
        successes: results.length,
        failures: errors,
      });
    }

    this.logger.info(`Successfully created ${results.length}/${configs.length} coordination event managers`);
    return results;
  }

  /**
   * Get coordination event manager by name.
   */
  get(name: string): EventManager | undefined {
    return this.instances.get(name) as EventManager | undefined;
  }

  /**
   * List all coordination event managers.
   */
  list(): EventManager[] {
    return Array.from(this.instances.values()) as EventManager[];
  }

  /**
   * Check if coordination event manager exists.
   */
  has(name: string): boolean {
    return this.instances.has(name);
  }

  /**
   * Remove coordination event manager by name.
   */
  async remove(name: string): Promise<boolean> {
    const adapter = this.instances.get(name);
    if (!adapter) {
      return false;
    }

    try {
      this.logger.info(`Removing coordination event manager: ${name}`);

      // Stop the adapter if running
      if (adapter.isRunning && adapter.isRunning()) {
        await adapter.stop();
      }

      // Destroy the adapter if it has destroy method
      if (adapter.destroy) {
        await adapter.destroy();
      }

      // Remove from registry
      this.instances.delete(name);

      this.logger.info(`Coordination event manager removed successfully: ${name}`);
      this.emit('adapter-removed', { name });

      return true;
    } catch (error) {
      this.logger.error(`Failed to remove coordination event manager '${name}':`, error);
      this.emit('adapter-removal-failed', { name, error });
      throw error;
    }
  }

  /**
   * Health check all coordination event managers.
   */
  async healthCheckAll(): Promise<Map<string, EventManagerStatus>> {
    this.logger.debug('Performing health check on all coordination event managers');

    const results = new Map<string, EventManagerStatus>();
    const healthPromises: Promise<void>[] = [];

    for (const [name, adapter] of this.instances) {
      const healthPromise = (async () => {
        try {
          const status = await adapter.healthCheck();
          results.set(name, status);
        } catch (error) {
          this.logger.warn(`Health check failed for coordination event manager '${name}':`, error);
          results.set(name, {
            name,
            type: adapter.type,
            status: 'unhealthy',
            lastCheck: new Date(),
            subscriptions: 0,
            queueSize: 0,
            errorRate: 1,
            uptime: 0,
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      })();

      healthPromises.push(healthPromise);
    }

    await Promise.all(healthPromises);

    this.logger.debug(`Health check completed for ${results.size} coordination event managers`);
    return results;
  }

  /**
   * Get metrics for all coordination event managers.
   */
  async getMetricsAll(): Promise<Map<string, EventManagerMetrics>> {
    this.logger.debug('Collecting metrics from all coordination event managers');

    const results = new Map<string, EventManagerMetrics>();
    const metricsPromises: Promise<void>[] = [];

    for (const [name, adapter] of this.instances) {
      const metricsPromise = (async () => {
        try {
          const metrics = await adapter.getMetrics();
          results.set(name, metrics);
        } catch (error) {
          this.logger.warn(`Metrics collection failed for coordination event manager '${name}':`, error);
          // Create default error metrics
          results.set(name, {
            name,
            type: adapter.type,
            eventsProcessed: 0,
            eventsEmitted: 0,
            eventsFailed: 1,
            averageLatency: -1,
            p95Latency: -1,
            p99Latency: -1,
            throughput: 0,
            subscriptionCount: 0,
            queueSize: 0,
            memoryUsage: 0,
            timestamp: new Date(),
          });
        }
      })();

      metricsPromises.push(metricsPromise);
    }

    await Promise.all(metricsPromises);

    this.logger.debug(`Metrics collected from ${results.size} coordination event managers`);
    return results;
  }

  /**
   * Get active adapter count.
   */
  getActiveCount(): number {
    return this.instances.size;
  }

  /**
   * Get factory metrics.
   */
  getFactoryMetrics(): CoordinationFactoryMetrics {
    const runningAdapters = this.list().filter((adapter) => 
      adapter.isRunning && adapter.isRunning()
    ).length;

    return CoordinationFactoryHelpers.calculateMetrics(
      this.totalCreated,
      this.totalErrors,
      this.instances.size,
      runningAdapters,
      this.startTime
    );
  }

  /**
   * Shutdown factory and all coordination event managers.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Coordination Event Factory');

    try {
      // Stop and destroy all adapters
      const shutdownPromises = Array.from(this.instances.entries()).map(
        async ([name, adapter]) => {
          try {
            if (adapter.isRunning && adapter.isRunning()) {
              await adapter.stop();
            }
            if (adapter.destroy) {
              await adapter.destroy();
            }
          } catch (error) {
            this.logger.error(`Failed to shutdown coordination event manager '${name}':`, error);
          }
        }
      );

      await Promise.all(shutdownPromises);

      // Clear registry
      this.instances.clear();

      // Remove all listeners
      this.removeAllListeners();

      this.logger.info('Coordination Event Factory shutdown completed');
      this.emit('factory-shutdown');
    } catch (error) {
      this.logger.error('Failed to shutdown Coordination Event Factory:', error);
      this.emit('factory-shutdown-failed', error);
      throw error;
    }
  }

  /**
   * Set up event forwarding from adapter to factory.
   */
  private setupEventForwarding(adapter: CoordinationEventAdapter, name: string): void {
    // Forward important events from adapter to factory
    if (adapter.on) {
      adapter.on('start', () => {
        this.emit('adapter-started', { name });
      });

      adapter.on('stop', () => {
        this.emit('adapter-stopped', { name });
      });

      adapter.on('error', (error: Error) => {
        this.emit('adapter-error', { name, error });
      });

      adapter.on('subscription', (data: unknown) => {
        this.emit('adapter-subscription', {
          name,
          ...(data as object)
        });
      });

      adapter.on('emission', (data: unknown) => {
        this.emit('adapter-emission', {
          name,
          ...(data as object)
        });
      });
    }
  }
}