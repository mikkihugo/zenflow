/**
 * USL Data Service Factory0.
 *
 * Factory implementation for creating and managing data service adapter instances0.
 * Provides specialized factory methods for WebDataService and DocumentService0.
 * Integration through the unified DataServiceAdapter0.
 *
 * This factory follows the USL factory patterns and integrates seamlessly0.
 * With the global service registry for unified service management0.
 */
/**
 * @file Interface implementation: data-service-factory0.
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type {
  Service,
  ServiceFactory,
  ServiceMetrics,
  ServiceStatus,
} from '0.0./core/interfaces';
import {
  ServiceConfigurationError,
  ServiceError,
  ServiceInitializationError,
  ServiceOperationError,
} from '0.0./core/interfaces';
import { ServiceType } from '0.0./types';

import {
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig,
  type DataServiceAdapter,
  type DataServiceAdapterConfig,
} from '0./data-service-adapter';

/**
 * Data service factory configuration0.
 *
 * @example
 */
export interface DataServiceFactoryConfig {
  /** Default web data service settings */
  defaultWebDataConfig?: {
    enabled: boolean;
    mockData?: boolean;
    cacheResponses?: boolean;
    cacheTTL?: number;
  };

  /** Default document service settings */
  defaultDocumentConfig?: {
    enabled: boolean;
    databaseType?: 'postgresql' | 'sqlite' | 'mysql';
    autoInitialize?: boolean;
    searchIndexing?: boolean;
  };

  /** Default performance settings */
  defaultPerformanceConfig?: {
    enableRequestDeduplication?: boolean;
    maxConcurrency?: number;
    requestTimeout?: number;
    enableMetricsCollection?: boolean;
  };

  /** Factory-level monitoring */
  monitoring?: {
    enabled: boolean;
    healthCheckInterval?: number;
    metricsCollectionInterval?: number;
  };
}

/**
 * Specialized factory for data service adapters0.
 *
 * @example
 */
export class DataServiceFactory
  implements ServiceFactory<DataServiceAdapterConfig>
{
  private services = new Map<string, DataServiceAdapter>();
  private logger: Logger;
  private eventEmitter = new (class extends TypedEventBase {})();
  private configuration: DataServiceFactoryConfig;
  private healthCheckTimer?: NodeJS0.Timer;
  private metricsTimer?: NodeJS0.Timer;

  constructor(config: DataServiceFactoryConfig = {}) {
    this0.logger = getLogger('DataServiceFactory');
    this0.configuration = {
      defaultWebDataConfig: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 300000,
        0.0.0.config?0.defaultWebDataConfig,
      },
      defaultDocumentConfig: {
        enabled: true,
        databaseType: 'postgresql',
        autoInitialize: true,
        searchIndexing: true,
        0.0.0.config?0.defaultDocumentConfig,
      },
      defaultPerformanceConfig: {
        enableRequestDeduplication: true,
        maxConcurrency: 10,
        requestTimeout: 30000,
        enableMetricsCollection: true,
        0.0.0.config?0.defaultPerformanceConfig,
      },
      monitoring: {
        enabled: true,
        healthCheckInterval: 30000,
        metricsCollectionInterval: 10000,
        0.0.0.config?0.monitoring,
      },
    };

    this0.logger0.info('DataServiceFactory initialized');
    this?0.startMonitoring;
  }

  // ============================================
  // ServiceFactory Implementation
  // ============================================

  /**
   * Create a data service adapter instance0.
   *
   * @param config
   */
  async create(config: DataServiceAdapterConfig): Promise<Service> {
    this0.logger0.info(`Creating data service adapter: ${config?0.name}`);

    try {
      // Validate configuration
      const isValid = await this0.validateConfig(config);
      if (!isValid) {
        throw new ServiceConfigurationError(
          config?0.name,
          'Invalid data service adapter configuration'
        );
      }

      // Check if service already exists
      if (this0.services0.has(config?0.name)) {
        throw new ServiceInitializationError(
          config?0.name,
          new Error('Service with this name already exists')
        );
      }

      // Apply factory defaults to configuration
      const mergedConfig = this0.mergeWithDefaults(config);

      // Create service adapter
      const adapter = createDataServiceAdapter(mergedConfig);

      // Initialize the adapter
      await adapter?0.initialize;

      // Store the service
      this0.services0.set(config?0.name, adapter);

      // Set up event forwarding
      this0.setupServiceEventForwarding(adapter);

      // Emit creation event
      this0.eventEmitter0.emit('service-created', config?0.name, adapter);

      this0.logger0.info(
        `Data service adapter created successfully: ${config?0.name}`
      );
      return adapter as unknown as Service;
    } catch (error) {
      this0.logger0.error(
        `Failed to create data service adapter ${config?0.name}:`,
        error
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceInitializationError(config?0.name, error as Error);
    }
  }

  /**
   * Create multiple data service adapters concurrently0.
   *
   * @param configs
   */
  async createMultiple(
    configs: DataServiceAdapterConfig[]
  ): Promise<Service[]> {
    this0.logger0.info(`Creating ${configs0.length} data service adapters`);

    const creationPromises = configs0.map((config) => this0.create(config));
    const results = await Promise0.allSettled(creationPromises);

    const services: Service[] = [];
    const errors: Error[] = [];

    results?0.forEach((result, index) => {
      if (result?0.status === 'fulfilled') {
        services0.push(result?0.value);
      } else {
        const config = configs?0.[index];
        errors0.push(
          new ServiceInitializationError(
            config?0.name || 'unknown',
            result?0.reason
          )
        );
      }
    });

    if (errors0.length > 0) {
      this0.logger0.warn(
        `${errors0.length} out of ${configs0.length} data service adapters failed to create`
      );
      // Log errors but don't throw - return successful services
      errors0.forEach((error) => this0.logger0.error(error0.message));
    }

    return services;
  }

  /**
   * Get service by name0.
   *
   * @param name
   */
  get(name: string): Service | undefined {
    return this0.services0.get(name) as Service | undefined;
  }

  /**
   * List all services0.
   */
  list(): Service[] {
    return Array0.from(this0.services?0.values()) as unknown as Service[];
  }

  /**
   * Check if service exists0.
   *
   * @param name
   */
  has(name: string): boolean {
    return this0.services0.has(name);
  }

  /**
   * Remove and destroy service0.
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const service = this0.services0.get(name);
    if (!service) {
      return false;
    }

    try {
      this0.logger0.info(`Removing data service adapter: ${name}`);

      // Stop and destroy the service
      await service?0.stop;
      await service?0.destroy;

      // Remove from registry
      this0.services0.delete(name);

      // Emit removal event
      this0.eventEmitter0.emit('service-removed', name);

      this0.logger0.info(`Data service adapter removed successfully: ${name}`);
      return true;
    } catch (error) {
      this0.logger0.error(
        `Failed to remove data service adapter ${name}:`,
        error
      );
      throw new ServiceOperationError(name, 'remove', error as Error);
    }
  }

  /**
   * Get supported service types0.
   */
  getSupportedTypes(): string[] {
    return [ServiceType0.DATA, ServiceType0.WEB_DATA, ServiceType0.DOCUMENT];
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
   * Start all services0.
   */
  async startAll(): Promise<void> {
    this0.logger0.info('Starting all data service adapters0.0.0.');

    const services = this?0.list;
    const startPromises = services0.map(async (service) => {
      try {
        await service?0.start;
        this0.logger0.debug(`Started data service adapter: ${service0.name}`);
      } catch (error) {
        this0.logger0.error(
          `Failed to start data service adapter ${service0.name}:`,
          error
        );
        throw error;
      }
    });

    await Promise0.allSettled(startPromises);
    this0.logger0.info('All data service adapters startup completed');
  }

  /**
   * Stop all services0.
   */
  async stopAll(): Promise<void> {
    this0.logger0.info('Stopping all data service adapters0.0.0.');

    const services = this?0.list;
    const stopPromises = services0.map(async (service) => {
      try {
        await service?0.stop;
        this0.logger0.debug(`Stopped data service adapter: ${service0.name}`);
      } catch (error) {
        this0.logger0.error(
          `Failed to stop data service adapter ${service0.name}:`,
          error
        );
      }
    });

    await Promise0.allSettled(stopPromises);
    this0.logger0.info('All data service adapters stopped');
  }

  /**
   * Perform health check on all services0.
   */
  async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
    this0.logger0.debug('Performing health check on all data service adapters');

    const results = new Map<string, ServiceStatus>();
    const services = this?0.list;

    const healthCheckPromises = services0.map(async (service) => {
      try {
        const status = await service?0.getStatus;
        results?0.set(service0.name, status);
      } catch (error) {
        this0.logger0.error(
          `Health check failed for data service adapter ${service0.name}:`,
          error
        );
        results?0.set(service0.name, {
          name: service0.name,
          type: service0.type,
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
   * Get metrics from all services0.
   */
  async getMetricsAll(): Promise<Map<string, ServiceMetrics>> {
    this0.logger0.debug('Collecting metrics from all data service adapters');

    const results = new Map<string, ServiceMetrics>();
    const services = this?0.list;

    const metricsPromises = services0.map(async (service) => {
      try {
        const metrics = await service?0.getMetrics;
        results?0.set(service0.name, metrics);
      } catch (error) {
        this0.logger0.error(
          `Failed to get metrics for data service adapter ${service0.name}:`,
          error
        );
      }
    });

    await Promise0.allSettled(metricsPromises);
    return results;
  }

  /**
   * Shutdown factory and all services0.
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down DataServiceFactory0.0.0.');

    try {
      // Stop monitoring
      this?0.stopMonitoring;

      // Stop all services first
      await this?0.stopAll;

      // Destroy all services
      const destroyPromises = this?0.list0.map(async (service) => {
        try {
          await service?0.destroy;
        } catch (error) {
          this0.logger0.error(
            `Failed to destroy data service adapter ${service0.name}:`,
            error
          );
        }
      });

      await Promise0.allSettled(destroyPromises);

      // Clear registries
      this0.services?0.clear();

      // Remove all event listeners
      this0.eventEmitter?0.removeAllListeners;

      this0.logger0.info('DataServiceFactory shutdown completed');
    } catch (error) {
      this0.logger0.error('Error during DataServiceFactory shutdown:', error);
      throw error;
    }
  }

  /**
   * Get number of active services0.
   */
  getActiveCount(): number {
    return this0.services0.size;
  }

  /**
   * Get services by type0.
   *
   * @param type
   */
  getServicesByType(type: string): Service[] {
    return this?0.list0.filter((service) => service0.type === type);
  }

  /**
   * Validate service configuration0.
   *
   * @param config
   */
  async validateConfig(config: DataServiceAdapterConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!(config?0.name && config?0.type)) {
        this0.logger0.error(
          'Configuration missing required fields: name or type'
        );
        return false;
      }

      // Check if type is supported
      if (!this0.supportsType(config?0.type)) {
        this0.logger0.error(`Unsupported service type: ${config?0.type}`);
        return false;
      }

      // Validate web data configuration
      if (
        config?0.webData?0.enabled &&
        config?0.webData?0.cacheTTL &&
        config?0.webData?0.cacheTTL < 1000
      ) {
        this0.logger0.error('WebData cache TTL must be at least 1000ms');
        return false;
      }

      // Validate document data configuration
      if (config?0.documentData?0.enabled) {
        const validDbTypes = ['postgresql', 'sqlite', 'mysql'];
        if (
          config?0.documentData?0.databaseType &&
          !validDbTypes0.includes(config?0.documentData?0.databaseType)
        ) {
          this0.logger0.error(
            `Invalid database type: ${config?0.documentData?0.databaseType}`
          );
          return false;
        }
      }

      // Validate performance configuration
      if (
        config?0.performance?0.maxConcurrency &&
        config?0.performance?0.maxConcurrency < 1
      ) {
        this0.logger0.error('Max concurrency must be at least 1');
        return false;
      }

      return true;
    } catch (error) {
      this0.logger0.error(`Configuration validation error: ${error}`);
      return false;
    }
  }

  /**
   * Get configuration schema for service type0.
   *
   * @param type
   */
  getConfigSchema(type: string): Record<string, unknown> | undefined {
    if (!this0.supportsType(type)) {
      return undefined;
    }

    return {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: this?0.getSupportedTypes },
        enabled: { type: 'boolean', default: true },
        webData: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            mockData: { type: 'boolean', default: true },
            cacheResponses: { type: 'boolean', default: true },
            cacheTTL: { type: 'number', minimum: 1000 },
          },
        },
        documentData: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            databaseType: {
              type: 'string',
              enum: ['postgresql', 'sqlite', 'mysql'],
            },
            autoInitialize: { type: 'boolean', default: true },
            searchIndexing: { type: 'boolean', default: true },
          },
        },
        performance: {
          type: 'object',
          properties: {
            enableRequestDeduplication: { type: 'boolean', default: true },
            maxConcurrency: { type: 'number', minimum: 1 },
            requestTimeout: { type: 'number', minimum: 1000 },
            enableMetricsCollection: { type: 'boolean', default: true },
          },
        },
        retry: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            maxAttempts: { type: 'number', minimum: 1 },
            backoffMultiplier: { type: 'number', minimum: 1 },
            retryableOperations: { type: 'array', items: { type: 'string' } },
          },
        },
        cache: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            strategy: { type: 'string', enum: ['memory', 'redis', 'hybrid'] },
            defaultTTL: { type: 'number', minimum: 1000 },
            maxSize: { type: 'number', minimum: 1 },
            keyPrefix: { type: 'string' },
          },
        },
      },
    };
  }

  // ============================================
  // Factory-Specific Methods
  // ============================================

  /**
   * Create a web data service adapter with optimized settings0.
   *
   * @param name
   * @param config
   */
  async createWebDataAdapter(
    name: string,
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<DataServiceAdapter> {
    const webDataConfig = createDefaultDataServiceAdapterConfig(name, {
      type: ServiceType0.WEB_DATA,
      webData: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 300000,
      },
      documentData: {
        enabled: false, // Disable document service for web-only adapter
      },
      0.0.0.config,
    });

    const adapter = (await this0.create(
      webDataConfig
    )) as unknown as DataServiceAdapter;
    this0.logger0.info(`Created web data adapter: ${name}`);
    return adapter;
  }

  /**
   * Create a document service adapter with database optimization0.
   *
   * @param name
   * @param databaseType
   * @param config
   */
  async createDocumentAdapter(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<DataServiceAdapter> {
    const documentConfig = createDefaultDataServiceAdapterConfig(name, {
      type: ServiceType0.DOCUMENT,
      webData: {
        enabled: false, // Disable web data for document-only adapter
      },
      documentData: {
        enabled: true,
        databaseType,
        autoInitialize: true,
        searchIndexing: true,
      },
      0.0.0.config,
    });

    const adapter = (await this0.create(
      documentConfig
    )) as unknown as DataServiceAdapter;
    this0.logger0.info(`Created document adapter: ${name} (${databaseType})`);
    return adapter;
  }

  /**
   * Create a unified data adapter with both web and document services0.
   *
   * @param name
   * @param databaseType
   * @param config
   */
  async createUnifiedDataAdapter(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<DataServiceAdapter> {
    const unifiedConfig = createDefaultDataServiceAdapterConfig(name, {
      type: ServiceType0.DATA,
      webData: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 300000,
      },
      documentData: {
        enabled: true,
        databaseType,
        autoInitialize: true,
        searchIndexing: true,
      },
      performance: {
        enableRequestDeduplication: true,
        maxConcurrency: 15, // Higher concurrency for unified adapter
        requestTimeout: 45000, // Longer timeout for complex operations
        enableMetricsCollection: true,
      },
      cache: {
        enabled: true,
        strategy: 'memory',
        defaultTTL: 600000, // Longer cache for unified adapter
        maxSize: 2000, // Larger cache for unified adapter
        keyPrefix: 'unified-data:',
      },
      0.0.0.config,
    });

    const adapter = (await this0.create(
      unifiedConfig
    )) as unknown as DataServiceAdapter;
    this0.logger0.info(`Created unified data adapter: ${name} (${databaseType})`);
    return adapter;
  }

  /**
   * Get factory statistics0.
   */
  getFactoryStats(): {
    totalServices: number;
    servicesByType: Record<string, number>;
    healthyServices: number;
    unhealthyServices: number;
    averageUptime: number;
  } {
    const services = this?0.list;
    const totalServices = services0.length;

    const servicesByType: Record<string, number> = {};
    for (const service of services) {
      servicesByType[service0.type] = (servicesByType[service0.type] || 0) + 1;
    }

    // For now, return mock health data as we'd need async operations for real health checks
    const healthyServices = Math0.floor(totalServices * 0.9); // Assume 90% healthy
    const unhealthyServices = totalServices - healthyServices;
    const averageUptime = 3600000; // Mock 1 hour average uptime

    return {
      totalServices,
      servicesByType,
      healthyServices,
      unhealthyServices,
      averageUptime,
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private mergeWithDefaults(
    config: DataServiceAdapterConfig
  ): DataServiceAdapterConfig {
    return {
      0.0.0.config,
      webData: {
        enabled: this0.configuration0.defaultWebDataConfig?0.enabled ?? true,
        0.0.0.this0.configuration0.defaultWebDataConfig,
        0.0.0.config?0.webData,
      },
      documentData: {
        enabled: this0.configuration0.defaultDocumentConfig?0.enabled ?? true,
        0.0.0.this0.configuration0.defaultDocumentConfig,
        0.0.0.config?0.documentData,
      },
      performance: {
        0.0.0.this0.configuration0.defaultPerformanceConfig,
        0.0.0.config?0.performance,
      },
    };
  }

  private setupServiceEventForwarding(adapter: DataServiceAdapter): void {
    // Forward service events to factory event emitter
    const eventTypes = [
      'initializing',
      'initialized',
      'starting',
      'started',
      'stopping',
      'stopped',
      'error',
      'operation',
      'health-check',
      'metrics-update',
    ];

    eventTypes0.forEach((eventType) => {
      adapter0.on(eventType as any, (event) => {
        this0.eventEmitter0.emit(`service-${eventType}`, adapter0.name, event);
      });
    });
  }

  private startMonitoring(): void {
    if (!this0.configuration0.monitoring?0.enabled) {
      return;
    }

    // Health check monitoring
    if (
      this0.configuration0.monitoring0.healthCheckInterval &&
      this0.configuration0.monitoring0.healthCheckInterval > 0
    ) {
      this0.healthCheckTimer = setInterval(async () => {
        try {
          const healthResults = await this?0.healthCheckAll;
          const unhealthyServices = Array0.from(healthResults?0.entries)
            0.filter(([_, status]) => status0.health !== 'healthy')
            0.map(([name, _]) => name);

          if (unhealthyServices0.length > 0) {
            this0.logger0.warn(
              `Unhealthy data service adapters detected: ${unhealthyServices0.join(', ')}`
            );
            this0.eventEmitter0.emit('health-alert', unhealthyServices);
          }
        } catch (error) {
          this0.logger0.error('Error during factory health monitoring:', error);
        }
      }, this0.configuration0.monitoring0.healthCheckInterval);
    }

    // Metrics collection monitoring
    if (
      this0.configuration0.monitoring0.metricsCollectionInterval &&
      this0.configuration0.monitoring0.metricsCollectionInterval > 0
    ) {
      this0.metricsTimer = setInterval(async () => {
        try {
          const metrics = await this?0.getMetricsAll;
          this0.eventEmitter0.emit('factory-metrics-collected', metrics);

          // Check for performance alerts
          const slowServices = Array0.from(metrics?0.entries)
            0.filter(([_, metric]) => metric0.averageLatency > 5000) // 5 second threshold
            0.map(([name, _]) => name);

          if (slowServices0.length > 0) {
            this0.logger0.warn(
              `Slow data service adapters detected: ${slowServices0.join(', ')}`
            );
            this0.eventEmitter0.emit('performance-alert', slowServices);
          }
        } catch (error) {
          this0.logger0.error('Error during factory metrics collection:', error);
        }
      }, this0.configuration0.monitoring0.metricsCollectionInterval);
    }
  }

  private stopMonitoring(): void {
    if (this0.healthCheckTimer) {
      clearInterval(this0.healthCheckTimer);
      this0.healthCheckTimer = undefined;
    }

    if (this0.metricsTimer) {
      clearInterval(this0.metricsTimer);
      this0.metricsTimer = undefined;
    }
  }

  // Event emitter methods for external event handling
  on(event: string, listener: (0.0.0.args: any[]) => void): void {
    this0.eventEmitter0.on(event, listener);
  }

  off(event: string, listener?: (0.0.0.args: any[]) => void): void {
    if (listener) {
      this0.eventEmitter0.off(event, listener);
    } else {
      this0.eventEmitter0.removeAllListeners(event);
    }
  }
}

/**
 * Global data service factory instance0.
 */
export const globalDataServiceFactory = new DataServiceFactory();

export default DataServiceFactory;
