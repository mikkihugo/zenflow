/**
 * UEL Communication Event Factory.
 *
 * Factory implementation for creating and managing Communication Event Adapters.
 * Following the exact same patterns as system and coordination event factories.
 *
 * Provides centralized management, health monitoring, and metrics collection.
 * For all communication event adapters in the UEL system.
 */
/**
 * @file Interface implementation: communication-event-factory.
 */

import { EventEmitter } from 'node:events';
import type { Logger } from '../../../config/logging-config.ts';
import { getLogger } from '../../../config/logging-config.ts';
import type {
  EventManagerMetrics,
  EventManagerStatus,
  IEventManagerFactory,
} from '../core/interfaces.ts';
import {
  CommunicationEventAdapter,
  type CommunicationEventAdapterConfig,
  createDefaultCommunicationEventAdapterConfig,
} from './communication-event-adapter.ts';

/**
 * Communication Event Manager Factory.
 *
 * Manages the lifecycle of communication event adapters, providing:
 * - Centralized creation and configuration management
 * - Health monitoring and metrics collection
 * - Batch operations for multiple adapters
 * - Resource cleanup and graceful shutdown.
 *
 * @example
 */
export class CommunicationEventFactory
  extends EventEmitter
  implements IEventManagerFactory<CommunicationEventAdapterConfig>
{
  private adapters = new Map<string, CommunicationEventAdapter>();
  private logger: Logger;
  private startTime: Date;
  private totalErrors = 0;
  private totalCreated = 0;

  constructor() {
    super();
    this.logger = getLogger('CommunicationEventFactory');
    this.startTime = new Date();
    this.logger.info('Communication Event Factory initialized');
  }

  /**
   * Create new communication event adapter instance.
   *
   * @param config
   */
  async create(config: CommunicationEventAdapterConfig): Promise<CommunicationEventAdapter> {
    try {
      this.logger.info(`Creating communication event adapter: ${config?.name}`);

      // Validate configuration
      this.validateConfig(config);

      // Check for duplicate names
      if (this.adapters.has(config?.name)) {
        throw new Error(`Communication event adapter with name '${config?.name}' already exists`);
      }

      // Create adapter instance
      const adapter = new CommunicationEventAdapter(config);

      // Set up event forwarding
      this.setupEventForwarding(adapter);

      // Start the adapter
      await adapter.start();

      // Store in registry
      this.adapters.set(config?.name, adapter);
      this.totalCreated++;

      this.logger.info(`Communication event adapter created successfully: ${config?.name}`);
      this.emit('adapter-created', { name: config?.name, adapter });

      return adapter;
    } catch (error) {
      this.totalErrors++;
      this.logger.error(`Failed to create communication event adapter '${config?.name}':`, error);
      this.emit('adapter-creation-failed', { name: config?.name, error });
      throw error;
    }
  }

  /**
   * Create multiple communication event adapters.
   *
   * @param configs
   */
  async createMultiple(
    configs: CommunicationEventAdapterConfig[]
  ): Promise<CommunicationEventAdapter[]> {
    this.logger.info(`Creating ${configs.length} communication event adapters`);

    const results: CommunicationEventAdapter[] = [];
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
      this.logger.warn(`Failed to create ${errors.length} communication event adapters:`, errors);
      this.emit('multiple-creation-partial-failure', {
        successes: results.length,
        failures: errors,
      });
    }

    this.logger.info(
      `Successfully created ${results.length}/${configs.length} communication event adapters`
    );
    return results;
  }

  /**
   * Get communication event adapter by name.
   *
   * @param name
   */
  get(name: string): CommunicationEventAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * List all communication event adapters.
   */
  list(): CommunicationEventAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Check if communication event adapter exists.
   *
   * @param name
   */
  has(name: string): boolean {
    return this.adapters.has(name);
  }

  /**
   * Remove communication event adapter by name.
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      return false;
    }

    try {
      this.logger.info(`Removing communication event adapter: ${name}`);

      // Stop the adapter
      await adapter.stop();

      // Destroy the adapter
      await adapter.destroy();

      // Remove from registry
      this.adapters.delete(name);

      this.logger.info(`Communication event adapter removed successfully: ${name}`);
      this.emit('adapter-removed', { name });

      return true;
    } catch (error) {
      this.logger.error(`Failed to remove communication event adapter '${name}':`, error);
      this.emit('adapter-removal-failed', { name, error });
      throw error;
    }
  }

  /**
   * Health check all communication event adapters.
   */
  async healthCheckAll(): Promise<Map<string, EventManagerStatus>> {
    this.logger.debug('Performing health check on all communication event adapters');

    const results = new Map<string, EventManagerStatus>();
    const healthPromises: Promise<void>[] = [];

    for (const [name, adapter] of this.adapters) {
      const healthPromise = (async () => {
        try {
          const status = await adapter.healthCheck();
          results?.set(name, status);
        } catch (error) {
          this.logger.warn(`Health check failed for communication event adapter '${name}':`, error);
          results?.set(name, {
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

    this.logger.debug(`Health check completed for ${results.size} communication event adapters`);
    return results;
  }

  /**
   * Get metrics for all communication event adapters.
   */
  async getMetricsAll(): Promise<Map<string, EventManagerMetrics>> {
    this.logger.debug('Collecting metrics from all communication event adapters');

    const results = new Map<string, EventManagerMetrics>();
    const metricsPromises: Promise<void>[] = [];

    for (const [name, adapter] of this.adapters) {
      const metricsPromise = (async () => {
        try {
          const metrics = await adapter.getMetrics();
          results?.set(name, metrics);
        } catch (error) {
          this.logger.warn(
            `Metrics collection failed for communication event adapter '${name}':`,
            error
          );
          // Create default error metrics
          results?.set(name, {
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

    this.logger.debug(`Metrics collected from ${results.size} communication event adapters`);
    return results;
  }

  /**
   * Start all communication event adapters.
   */
  async startAll(): Promise<void> {
    this.logger.info(`Starting ${this.adapters.size} communication event adapters`);

    const startPromises: Promise<void>[] = [];
    const errors: Array<{ name: string; error: Error }> = [];

    for (const [name, adapter] of this.adapters) {
      const startPromise = (async () => {
        try {
          if (!adapter.isRunning()) {
            await adapter.start();
          }
        } catch (error) {
          errors.push({ name, error: error as Error });
          this.logger.error(`Failed to start communication event adapter '${name}':`, error);
        }
      })();

      startPromises.push(startPromise);
    }

    await Promise.all(startPromises);

    if (errors.length > 0) {
      this.logger.warn(`Failed to start ${errors.length} communication event adapters:`, errors);
      this.emit('start-all-partial-failure', { failures: errors });
    }

    const runningCount = this.list().filter((adapter) => adapter.isRunning()).length;
    this.logger.info(`Started ${runningCount}/${this.adapters.size} communication event adapters`);
  }

  /**
   * Stop all communication event adapters.
   */
  async stopAll(): Promise<void> {
    this.logger.info(`Stopping ${this.adapters.size} communication event adapters`);

    const stopPromises: Promise<void>[] = [];
    const errors: Array<{ name: string; error: Error }> = [];

    for (const [name, adapter] of this.adapters) {
      const stopPromise = (async () => {
        try {
          if (adapter.isRunning()) {
            await adapter.stop();
          }
        } catch (error) {
          errors.push({ name, error: error as Error });
          this.logger.error(`Failed to stop communication event adapter '${name}':`, error);
        }
      })();

      stopPromises.push(stopPromise);
    }

    await Promise.all(stopPromises);

    if (errors.length > 0) {
      this.logger.warn(`Failed to stop ${errors.length} communication event adapters:`, errors);
      this.emit('stop-all-partial-failure', { failures: errors });
    }

    const stoppedCount = this.list().filter((adapter) => !adapter.isRunning()).length;
    this.logger.info(`Stopped ${stoppedCount}/${this.adapters.size} communication event adapters`);
  }

  /**
   * Shutdown factory and all communication event adapters.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Communication Event Factory');

    try {
      // Stop all adapters first
      await this.stopAll();

      // Destroy all adapters
      const destroyPromises = Array.from(this.adapters.entries()).map(async ([name, adapter]) => {
        try {
          await adapter.destroy();
        } catch (error) {
          this.logger.error(`Failed to destroy communication event adapter '${name}':`, error);
        }
      });

      await Promise.all(destroyPromises);

      // Clear registry
      this.adapters.clear();

      // Remove all listeners
      this.removeAllListeners();

      this.logger.info('Communication Event Factory shutdown completed');
      this.emit('factory-shutdown');
    } catch (error) {
      this.logger.error('Failed to shutdown Communication Event Factory:', error);
      this.emit('factory-shutdown-failed', error);
      throw error;
    }
  }

  /**
   * Get active adapter count.
   */
  getActiveCount(): number {
    return this.adapters.size;
  }

  /**
   * Get factory metrics.
   */
  getFactoryMetrics() {
    const uptime = Date.now() - this.startTime.getTime();
    const runningAdapters = this.list().filter((adapter) => adapter.isRunning()).length;

    return {
      totalManagers: this.adapters.size,
      runningManagers: runningAdapters,
      errorCount: this.totalErrors,
      uptime,
    };
  }

  // ============================================
  // Communication-Specific Factory Methods
  // ============================================

  /**
   * Create communication event adapter with WebSocket focus.
   *
   * @param name
   * @param config
   */
  async createWebSocketAdapter(
    name: string,
    config?: Partial<CommunicationEventAdapterConfig>
  ): Promise<CommunicationEventAdapter> {
    const adapterConfig = createDefaultCommunicationEventAdapterConfig(name, {
      websocketCommunication: {
        enabled: true,
        wrapConnectionEvents: true,
        wrapMessageEvents: true,
        wrapHealthEvents: true,
        wrapReconnectionEvents: true,
        clients: ['websocket-client'],
      },
      mcpProtocol: { enabled: false },
      httpCommunication: { enabled: false },
      protocolCommunication: { enabled: false },
      ...config,
    });

    return await this.create(adapterConfig);
  }

  /**
   * Create communication event adapter with MCP focus.
   *
   * @param name
   * @param config
   */
  async createMCPAdapter(
    name: string,
    config?: Partial<CommunicationEventAdapterConfig>
  ): Promise<CommunicationEventAdapter> {
    const adapterConfig = createDefaultCommunicationEventAdapterConfig(name, {
      mcpProtocol: {
        enabled: true,
        wrapServerEvents: true,
        wrapClientEvents: true,
        wrapToolEvents: true,
        wrapProtocolEvents: true,
        servers: ['http-mcp-server'],
        clients: ['mcp-client'],
      },
      websocketCommunication: { enabled: false },
      httpCommunication: { enabled: true },
      protocolCommunication: { enabled: false },
      ...config,
    });

    return await this.create(adapterConfig);
  }

  /**
   * Create communication event adapter with HTTP focus.
   *
   * @param name
   * @param config
   */
  async createHTTPAdapter(
    name: string,
    config?: Partial<CommunicationEventAdapterConfig>
  ): Promise<CommunicationEventAdapter> {
    const adapterConfig = createDefaultCommunicationEventAdapterConfig(name, {
      httpCommunication: {
        enabled: true,
        wrapRequestEvents: true,
        wrapResponseEvents: true,
        wrapTimeoutEvents: true,
        wrapRetryEvents: true,
      },
      websocketCommunication: { enabled: false },
      mcpProtocol: { enabled: false },
      protocolCommunication: { enabled: false },
      ...config,
    });

    return await this.create(adapterConfig);
  }

  /**
   * Create communication event adapter with protocol management focus.
   *
   * @param name
   * @param config
   */
  async createProtocolAdapter(
    name: string,
    config?: Partial<CommunicationEventAdapterConfig>
  ): Promise<CommunicationEventAdapter> {
    const adapterConfig = createDefaultCommunicationEventAdapterConfig(name, {
      protocolCommunication: {
        enabled: true,
        wrapRoutingEvents: true,
        wrapOptimizationEvents: true,
        wrapFailoverEvents: true,
        wrapSwitchingEvents: true,
        protocols: ['http', 'https', 'ws', 'wss', 'stdio'],
      },
      websocketCommunication: { enabled: false },
      mcpProtocol: { enabled: false },
      httpCommunication: { enabled: false },
      ...config,
    });

    return await this.create(adapterConfig);
  }

  /**
   * Create comprehensive communication event adapter (all communication types).
   *
   * @param name
   * @param config.
   * @param config
   */
  async createComprehensiveAdapter(
    name: string,
    config?: Partial<CommunicationEventAdapterConfig>
  ): Promise<CommunicationEventAdapter> {
    const adapterConfig = createDefaultCommunicationEventAdapterConfig(name, {
      websocketCommunication: { enabled: true },
      mcpProtocol: { enabled: true },
      httpCommunication: { enabled: true },
      protocolCommunication: { enabled: true },
      ...config,
    });

    return await this.create(adapterConfig);
  }

  /**
   * Get communication health summary for all adapters.
   */
  async getCommunicationHealthSummary(): Promise<{
    totalAdapters: number;
    healthyAdapters: number;
    degradedAdapters: number;
    unhealthyAdapters: number;
    connectionHealth: Record<string, any>;
    protocolHealth: Record<string, any>;
  }> {
    const healthResults = await this.healthCheckAll();

    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    const connectionHealth: Record<string, any> = {};
    const protocolHealth: Record<string, any> = {};

    for (const [name, status] of healthResults?.entries()) {
      switch (status.status) {
        case 'healthy':
          healthyCount++;
          break;
        case 'degraded':
          degradedCount++;
          break;
        case 'unhealthy':
          unhealthyCount++;
          break;
      }

      // Extract communication-specific health data
      if (status.metadata?.componentHealth) {
        connectionHealth[name] = status.metadata.componentHealth;
      }
      if (status.metadata?.avgCommunicationLatency !== undefined) {
        protocolHealth[name] = {
          avgLatency: status.metadata.avgCommunicationLatency,
          errorRate: status.errorRate,
        };
      }
    }

    return {
      totalAdapters: healthResults.size,
      healthyAdapters: healthyCount,
      degradedAdapters: degradedCount,
      unhealthyAdapters: unhealthyCount,
      connectionHealth,
      protocolHealth,
    };
  }

  /**
   * Get communication metrics summary for all adapters.
   */
  async getCommunicationMetricsSummary(): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    avgLatency: number;
    totalThroughput: number;
    connectionMetrics: Record<string, any>;
    protocolMetrics: Record<string, any>;
  }> {
    const metricsResults = await this.getMetricsAll();

    let totalEvents = 0;
    let successfulEvents = 0;
    let failedEvents = 0;
    let totalLatency = 0;
    let totalThroughput = 0;
    const connectionMetrics: Record<string, any> = {};
    const protocolMetrics: Record<string, any> = {};

    for (const [name, metrics] of metricsResults?.entries()) {
      totalEvents += metrics.eventsProcessed;
      successfulEvents += metrics.eventsEmitted;
      failedEvents += metrics.eventsFailed;
      totalLatency += metrics.averageLatency;
      totalThroughput += metrics.throughput;

      connectionMetrics[name] = {
        eventsProcessed: metrics.eventsProcessed,
        throughput: metrics.throughput,
        avgLatency: metrics.averageLatency,
      };

      protocolMetrics[name] = {
        p95Latency: metrics.p95Latency,
        p99Latency: metrics.p99Latency,
        subscriptions: metrics.subscriptionCount,
        queueSize: metrics.queueSize,
      };
    }

    const avgLatency = metricsResults.size > 0 ? totalLatency / metricsResults.size : 0;

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      avgLatency,
      totalThroughput,
      connectionMetrics,
      protocolMetrics,
    };
  }

  /**
   * Configure all adapters with new settings.
   *
   * @param configUpdates
   */
  async reconfigureAll(configUpdates: Partial<CommunicationEventAdapterConfig>): Promise<void> {
    this.logger.info('Reconfiguring all communication event adapters');

    const errors: Array<{ name: string; error: Error }> = [];

    for (const [name, adapter] of this.adapters) {
      try {
        adapter.updateConfig(configUpdates);
      } catch (error) {
        errors.push({ name, error: error as Error });
        this.logger.error(`Failed to reconfigure communication event adapter '${name}':`, error);
      }
    }

    if (errors.length > 0) {
      this.logger.warn(
        `Failed to reconfigure ${errors.length} communication event adapters:`,
        errors
      );
      this.emit('reconfigure-all-partial-failure', { failures: errors });
    }

    this.logger.info(
      `Reconfigured ${this.adapters.size - errors.length}/${this.adapters.size} communication event adapters`
    );
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Validate communication event adapter configuration.
   *
   * @param config
   */
  private validateConfig(config: CommunicationEventAdapterConfig): void {
    if (!config?.name || typeof config?.name !== 'string') {
      throw new Error('Communication event adapter configuration must have a valid name');
    }

    if (!config?.type || config?.type !== 'communication') {
      throw new Error('Communication event adapter configuration must have type "communication"');
    }

    // Validate at least one communication type is enabled
    const communicationTypes = [
      config?.websocketCommunication?.enabled,
      config?.mcpProtocol?.enabled,
      config?.httpCommunication?.enabled,
      config?.protocolCommunication?.enabled,
    ];

    if (!communicationTypes.some((enabled) => enabled === true)) {
      throw new Error('At least one communication type must be enabled');
    }

    // Validate processing strategy
    if (config?.processing?.strategy) {
      const validStrategies = ['immediate', 'queued', 'batched', 'throttled'];
      if (!validStrategies.includes(config?.processing?.strategy)) {
        throw new Error(`Invalid processing strategy: ${config?.processing?.strategy}`);
      }
    }

    // Validate retry configuration
    if (config?.retry) {
      if (config?.retry?.attempts && config?.retry?.attempts < 0) {
        throw new Error('Retry attempts must be non-negative');
      }
      if (config?.retry?.delay && config?.retry?.delay < 0) {
        throw new Error('Retry delay must be non-negative');
      }
    }

    // Validate health configuration
    if (config?.health) {
      if (config?.health?.checkInterval && config?.health?.checkInterval < 1000) {
        throw new Error('Health check interval must be at least 1000ms');
      }
      if (config?.health?.timeout && config?.health?.timeout < 100) {
        throw new Error('Health check timeout must be at least 100ms');
      }
    }
  }

  /**
   * Set up event forwarding from adapter to factory.
   *
   * @param adapter
   */
  private setupEventForwarding(adapter: CommunicationEventAdapter): void {
    // Forward important events from adapter to factory
    adapter.on('start', () => {
      this.emit('adapter-started', { name: adapter.name });
    });

    adapter.on('stop', () => {
      this.emit('adapter-stopped', { name: adapter.name });
    });

    adapter.on('error', (error) => {
      this.emit('adapter-error', { name: adapter.name, error });
    });

    adapter.on('subscription', (data) => {
      this.emit('adapter-subscription', { name: adapter.name, ...data });
    });

    adapter.on('emission', (data) => {
      this.emit('adapter-emission', { name: adapter.name, ...data });
    });
  }
}

/**
 * Global communication event factory instance.
 */
export const communicationEventFactory = new CommunicationEventFactory();

/**
 * Convenience functions for creating communication event adapters.
 *
 * @param config
 * @example
 */
export async function createCommunicationEventAdapter(
  config: CommunicationEventAdapterConfig
): Promise<CommunicationEventAdapter> {
  return await communicationEventFactory.create(config);
}

export async function createWebSocketCommunicationAdapter(
  name: string,
  config?: Partial<CommunicationEventAdapterConfig>
): Promise<CommunicationEventAdapter> {
  return await communicationEventFactory.createWebSocketAdapter(name, config);
}

export async function createMCPCommunicationAdapter(
  name: string,
  config?: Partial<CommunicationEventAdapterConfig>
): Promise<CommunicationEventAdapter> {
  return await communicationEventFactory.createMCPAdapter(name, config);
}

export async function createHTTPCommunicationAdapter(
  name: string,
  config?: Partial<CommunicationEventAdapterConfig>
): Promise<CommunicationEventAdapter> {
  return await communicationEventFactory.createHTTPAdapter(name, config);
}

export async function createProtocolCommunicationAdapter(
  name: string,
  config?: Partial<CommunicationEventAdapterConfig>
): Promise<CommunicationEventAdapter> {
  return await communicationEventFactory.createProtocolAdapter(name, config);
}

export async function createComprehensiveCommunicationAdapter(
  name: string,
  config?: Partial<CommunicationEventAdapterConfig>
): Promise<CommunicationEventAdapter> {
  return await communicationEventFactory.createComprehensiveAdapter(name, config);
}

export default CommunicationEventFactory;
