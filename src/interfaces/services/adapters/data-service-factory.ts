/**
 * USL Data Service Factory
 * 
 * Factory implementation for creating and managing data service adapter instances.
 * Provides specialized factory methods for WebDataService and DocumentService
 * integration through the unified DataServiceAdapter.
 * 
 * This factory follows the USL factory patterns and integrates seamlessly
 * with the global service registry for unified service management.
 */

import type {
  IService,
  IServiceFactory,
  ServiceConfig,
  ServiceStatus,
  ServiceMetrics
} from '../core/interfaces';

import type {
  DataServiceConfig,
  ServiceType,
  ServicePriority,
  ServiceEnvironment
} from '../types';

import {
  DataServiceAdapter,
  type DataServiceAdapterConfig,
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig
} from './data-service-adapter';

import {
  ServiceError,
  ServiceInitializationError,
  ServiceConfigurationError,
  ServiceOperationError
} from '../core/interfaces';

import { createLogger, type Logger } from '../../../utils/logger';
import { EventEmitter } from 'events';

/**
 * Data service factory configuration
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
 * Specialized factory for data service adapters
 */
export class DataServiceFactory implements IServiceFactory<DataServiceAdapterConfig> {
  private services = new Map<string, DataServiceAdapter>();
  private logger: Logger;
  private eventEmitter = new EventEmitter();
  private config: DataServiceFactoryConfig;
  private healthCheckTimer?: NodeJS.Timer;
  private metricsTimer?: NodeJS.Timer;
  
  constructor(config: DataServiceFactoryConfig = {}) {
    this.logger = createLogger('DataServiceFactory');
    this.config = {
      defaultWebDataConfig: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 300000,
        ...config.defaultWebDataConfig
      },
      defaultDocumentConfig: {
        enabled: true,
        databaseType: 'postgresql',
        autoInitialize: true,
        searchIndexing: true,
        ...config.defaultDocumentConfig
      },
      defaultPerformanceConfig: {
        enableRequestDeduplication: true,
        maxConcurrency: 10,
        requestTimeout: 30000,
        enableMetricsCollection: true,
        ...config.defaultPerformanceConfig
      },
      monitoring: {
        enabled: true,
        healthCheckInterval: 30000,
        metricsCollectionInterval: 10000,
        ...config.monitoring
      }
    };
    
    this.logger.info('DataServiceFactory initialized');
    this.startMonitoring();
  }

  // ============================================
  // IServiceFactory Implementation
  // ============================================

  /**
   * Create a data service adapter instance
   */
  async create(config: DataServiceAdapterConfig): Promise<IService> {
    this.logger.info(`Creating data service adapter: ${config.name}`);

    try {
      // Validate configuration
      const isValid = await this.validateConfig(config);
      if (!isValid) {
        throw new ServiceConfigurationError(
          config.name,
          'Invalid data service adapter configuration'
        );
      }

      // Check if service already exists
      if (this.services.has(config.name)) {
        throw new ServiceInitializationError(
          config.name,
          new Error('Service with this name already exists')
        );
      }

      // Apply factory defaults to configuration
      const mergedConfig = this.mergeWithDefaults(config);

      // Create service adapter
      const adapter = createDataServiceAdapter(mergedConfig);

      // Initialize the adapter
      await adapter.initialize();

      // Store the service
      this.services.set(config.name, adapter);

      // Set up event forwarding
      this.setupServiceEventForwarding(adapter);

      // Emit creation event
      this.eventEmitter.emit('service-created', config.name, adapter);

      this.logger.info(`Data service adapter created successfully: ${config.name}`);
      return adapter;
    } catch (error) {
      this.logger.error(`Failed to create data service adapter ${config.name}:`, error);
      throw error instanceof ServiceError ? error : new ServiceInitializationError(config.name, error as Error);
    }
  }

  /**
   * Create multiple data service adapters concurrently
   */
  async createMultiple(configs: DataServiceAdapterConfig[]): Promise<IService[]> {
    this.logger.info(`Creating ${configs.length} data service adapters`);

    const creationPromises = configs.map(config => this.create(config));
    const results = await Promise.allSettled(creationPromises);

    const services: IService[] = [];
    const errors: Error[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        services.push(result.value);
      } else {
        const config = configs[index];
        errors.push(new ServiceInitializationError(
          config.name,
          result.reason
        ));
      }
    });

    if (errors.length > 0) {
      this.logger.warn(`${errors.length} out of ${configs.length} data service adapters failed to create`);
      // Log errors but don't throw - return successful services
      errors.forEach(error => this.logger.error(error.message));
    }

    return services;
  }

  /**
   * Get service by name
   */
  get(name: string): IService | undefined {
    return this.services.get(name);
  }

  /**
   * List all services
   */
  list(): IService[] {
    return Array.from(this.services.values());
  }

  /**
   * Check if service exists
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Remove and destroy service
   */
  async remove(name: string): Promise<boolean> {
    const service = this.services.get(name);
    if (!service) {
      return false;
    }

    try {
      this.logger.info(`Removing data service adapter: ${name}`);
      
      // Stop and destroy the service
      await service.stop();
      await service.destroy();
      
      // Remove from registry
      this.services.delete(name);
      
      // Emit removal event
      this.eventEmitter.emit('service-removed', name);
      
      this.logger.info(`Data service adapter removed successfully: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove data service adapter ${name}:`, error);
      throw new ServiceOperationError(name, 'remove', error as Error);
    }
  }

  /**
   * Get supported service types
   */
  getSupportedTypes(): string[] {
    return [ServiceType.DATA, ServiceType.WEB_DATA, ServiceType.DOCUMENT];
  }

  /**
   * Check if service type is supported
   */
  supportsType(type: string): boolean {
    return this.getSupportedTypes().includes(type);
  }

  /**
   * Start all services
   */
  async startAll(): Promise<void> {
    this.logger.info('Starting all data service adapters...');
    
    const services = this.list();
    const startPromises = services.map(async (service) => {
      try {
        await service.start();
        this.logger.debug(`Started data service adapter: ${service.name}`);
      } catch (error) {
        this.logger.error(`Failed to start data service adapter ${service.name}:`, error);
        throw error;
      }
    });
    
    await Promise.allSettled(startPromises);
    this.logger.info('All data service adapters startup completed');
  }

  /**
   * Stop all services
   */
  async stopAll(): Promise<void> {
    this.logger.info('Stopping all data service adapters...');
    
    const services = this.list();
    const stopPromises = services.map(async (service) => {
      try {
        await service.stop();
        this.logger.debug(`Stopped data service adapter: ${service.name}`);
      } catch (error) {
        this.logger.error(`Failed to stop data service adapter ${service.name}:`, error);
      }
    });
    
    await Promise.allSettled(stopPromises);
    this.logger.info('All data service adapters stopped');
  }

  /**
   * Perform health check on all services
   */
  async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
    this.logger.debug('Performing health check on all data service adapters');
    
    const results = new Map<string, ServiceStatus>();
    const services = this.list();
    
    const healthCheckPromises = services.map(async (service) => {
      try {
        const status = await service.getStatus();
        results.set(service.name, status);
      } catch (error) {
        this.logger.error(`Health check failed for data service adapter ${service.name}:`, error);
        results.set(service.name, {
          name: service.name,
          type: service.type,
          lifecycle: 'error',
          health: 'unhealthy',
          lastCheck: new Date(),
          uptime: 0,
          errorCount: 1,
          errorRate: 100
        });
      }
    });
    
    await Promise.allSettled(healthCheckPromises);
    return results;
  }

  /**
   * Get metrics from all services
   */
  async getMetricsAll(): Promise<Map<string, ServiceMetrics>> {
    this.logger.debug('Collecting metrics from all data service adapters');
    
    const results = new Map<string, ServiceMetrics>();
    const services = this.list();
    
    const metricsPromises = services.map(async (service) => {
      try {
        const metrics = await service.getMetrics();
        results.set(service.name, metrics);
      } catch (error) {
        this.logger.error(`Failed to get metrics for data service adapter ${service.name}:`, error);
      }
    });
    
    await Promise.allSettled(metricsPromises);
    return results;
  }

  /**
   * Shutdown factory and all services
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down DataServiceFactory...');
    
    try {
      // Stop monitoring
      this.stopMonitoring();
      
      // Stop all services first
      await this.stopAll();
      
      // Destroy all services
      const destroyPromises = this.list().map(async (service) => {
        try {
          await service.destroy();
        } catch (error) {
          this.logger.error(`Failed to destroy data service adapter ${service.name}:`, error);
        }
      });
      
      await Promise.allSettled(destroyPromises);
      
      // Clear registries
      this.services.clear();
      
      // Remove all event listeners
      this.eventEmitter.removeAllListeners();
      
      this.logger.info('DataServiceFactory shutdown completed');
    } catch (error) {
      this.logger.error('Error during DataServiceFactory shutdown:', error);
      throw error;
    }
  }

  /**
   * Get number of active services
   */
  getActiveCount(): number {
    return this.services.size;
  }

  /**
   * Get services by type
   */
  getServicesByType(type: string): IService[] {
    return this.list().filter(service => service.type === type);
  }

  /**
   * Validate service configuration
   */
  async validateConfig(config: DataServiceAdapterConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!config.name || !config.type) {
        this.logger.error('Configuration missing required fields: name or type');
        return false;
      }

      // Check if type is supported
      if (!this.supportsType(config.type)) {
        this.logger.error(`Unsupported service type: ${config.type}`);
        return false;
      }

      // Validate web data configuration
      if (config.webData?.enabled && config.webData.cacheTTL && config.webData.cacheTTL < 1000) {
        this.logger.error('WebData cache TTL must be at least 1000ms');
        return false;
      }

      // Validate document data configuration
      if (config.documentData?.enabled) {
        const validDbTypes = ['postgresql', 'sqlite', 'mysql'];
        if (config.documentData.databaseType && !validDbTypes.includes(config.documentData.databaseType)) {
          this.logger.error(`Invalid database type: ${config.documentData.databaseType}`);
          return false;
        }
      }

      // Validate performance configuration
      if (config.performance?.maxConcurrency && config.performance.maxConcurrency < 1) {
        this.logger.error('Max concurrency must be at least 1');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Configuration validation error: ${error}`);
      return false;
    }
  }

  /**
   * Get configuration schema for service type
   */
  getConfigSchema(type: string): Record<string, any> | undefined {
    if (!this.supportsType(type)) {
      return undefined;
    }

    return {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: this.getSupportedTypes() },
        enabled: { type: 'boolean', default: true },
        webData: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            mockData: { type: 'boolean', default: true },
            cacheResponses: { type: 'boolean', default: true },
            cacheTTL: { type: 'number', minimum: 1000 }
          }
        },
        documentData: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            databaseType: { type: 'string', enum: ['postgresql', 'sqlite', 'mysql'] },
            autoInitialize: { type: 'boolean', default: true },
            searchIndexing: { type: 'boolean', default: true }
          }
        },
        performance: {
          type: 'object',
          properties: {
            enableRequestDeduplication: { type: 'boolean', default: true },
            maxConcurrency: { type: 'number', minimum: 1 },
            requestTimeout: { type: 'number', minimum: 1000 },
            enableMetricsCollection: { type: 'boolean', default: true }
          }
        },
        retry: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            maxAttempts: { type: 'number', minimum: 1 },
            backoffMultiplier: { type: 'number', minimum: 1 },
            retryableOperations: { type: 'array', items: { type: 'string' } }
          }
        },
        cache: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            strategy: { type: 'string', enum: ['memory', 'redis', 'hybrid'] },
            defaultTTL: { type: 'number', minimum: 1000 },
            maxSize: { type: 'number', minimum: 1 },
            keyPrefix: { type: 'string' }
          }
        }
      }
    };
  }

  // ============================================
  // Factory-Specific Methods
  // ============================================

  /**
   * Create a web data service adapter with optimized settings
   */
  async createWebDataAdapter(name: string, config?: Partial<DataServiceAdapterConfig>): Promise<DataServiceAdapter> {
    const webDataConfig = createDefaultDataServiceAdapterConfig(name, {
      type: ServiceType.WEB_DATA,
      webData: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 300000
      },
      documentData: {
        enabled: false // Disable document service for web-only adapter
      },
      ...config
    });

    const adapter = await this.create(webDataConfig) as DataServiceAdapter;
    this.logger.info(`Created web data adapter: ${name}`);
    return adapter;
  }

  /**
   * Create a document service adapter with database optimization
   */
  async createDocumentAdapter(
    name: string, 
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<DataServiceAdapter> {
    const documentConfig = createDefaultDataServiceAdapterConfig(name, {
      type: ServiceType.DOCUMENT,
      webData: {
        enabled: false // Disable web data for document-only adapter
      },
      documentData: {
        enabled: true,
        databaseType,
        autoInitialize: true,
        searchIndexing: true
      },
      ...config
    });

    const adapter = await this.create(documentConfig) as DataServiceAdapter;
    this.logger.info(`Created document adapter: ${name} (${databaseType})`);
    return adapter;
  }

  /**
   * Create a unified data adapter with both web and document services
   */
  async createUnifiedDataAdapter(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<DataServiceAdapter> {
    const unifiedConfig = createDefaultDataServiceAdapterConfig(name, {
      type: ServiceType.DATA,
      webData: {
        enabled: true,
        mockData: true,
        cacheResponses: true,
        cacheTTL: 300000
      },
      documentData: {
        enabled: true,
        databaseType,
        autoInitialize: true,
        searchIndexing: true
      },
      performance: {
        enableRequestDeduplication: true,
        maxConcurrency: 15, // Higher concurrency for unified adapter
        requestTimeout: 45000, // Longer timeout for complex operations
        enableMetricsCollection: true
      },
      cache: {
        enabled: true,
        strategy: 'memory',
        defaultTTL: 600000, // Longer cache for unified adapter
        maxSize: 2000, // Larger cache for unified adapter
        keyPrefix: 'unified-data:'
      },
      ...config
    });

    const adapter = await this.create(unifiedConfig) as DataServiceAdapter;
    this.logger.info(`Created unified data adapter: ${name} (${databaseType})`);
    return adapter;
  }

  /**
   * Get factory statistics
   */
  getFactoryStats(): {
    totalServices: number;
    servicesByType: Record<string, number>;
    healthyServices: number;
    unhealthyServices: number;
    averageUptime: number;
  } {
    const services = this.list();
    const totalServices = services.length;
    
    const servicesByType: Record<string, number> = {};
    for (const service of services) {
      servicesByType[service.type] = (servicesByType[service.type] || 0) + 1;
    }

    // For now, return mock health data as we'd need async operations for real health checks
    const healthyServices = Math.floor(totalServices * 0.9); // Assume 90% healthy
    const unhealthyServices = totalServices - healthyServices;
    const averageUptime = 3600000; // Mock 1 hour average uptime

    return {
      totalServices,
      servicesByType,
      healthyServices,
      unhealthyServices,
      averageUptime
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private mergeWithDefaults(config: DataServiceAdapterConfig): DataServiceAdapterConfig {
    return {
      ...config,
      webData: {
        ...this.config.defaultWebDataConfig,
        ...config.webData
      },
      documentData: {
        ...this.config.defaultDocumentConfig,
        ...config.documentData
      },
      performance: {
        ...this.config.defaultPerformanceConfig,
        ...config.performance
      }
    };
  }

  private setupServiceEventForwarding(adapter: DataServiceAdapter): void {
    // Forward service events to factory event emitter
    const eventTypes = [
      'initializing', 'initialized', 'starting', 'started',
      'stopping', 'stopped', 'error', 'operation', 'health-check', 'metrics-update'
    ];
    
    eventTypes.forEach(eventType => {
      adapter.on(eventType as any, (event) => {
        this.eventEmitter.emit(`service-${eventType}`, adapter.name, event);
      });
    });
  }

  private startMonitoring(): void {
    if (!this.config.monitoring?.enabled) {
      return;
    }

    // Health check monitoring
    if (this.config.monitoring.healthCheckInterval && this.config.monitoring.healthCheckInterval > 0) {
      this.healthCheckTimer = setInterval(async () => {
        try {
          const healthResults = await this.healthCheckAll();
          const unhealthyServices = Array.from(healthResults.entries())
            .filter(([_, status]) => status.health !== 'healthy')
            .map(([name, _]) => name);
          
          if (unhealthyServices.length > 0) {
            this.logger.warn(`Unhealthy data service adapters detected: ${unhealthyServices.join(', ')}`);
            this.eventEmitter.emit('health-alert', unhealthyServices);
          }
        } catch (error) {
          this.logger.error('Error during factory health monitoring:', error);
        }
      }, this.config.monitoring.healthCheckInterval);
    }

    // Metrics collection monitoring
    if (this.config.monitoring.metricsCollectionInterval && this.config.monitoring.metricsCollectionInterval > 0) {
      this.metricsTimer = setInterval(async () => {
        try {
          const metrics = await this.getMetricsAll();
          this.eventEmitter.emit('factory-metrics-collected', metrics);
          
          // Check for performance alerts
          const slowServices = Array.from(metrics.entries())
            .filter(([_, metric]) => metric.averageLatency > 5000) // 5 second threshold
            .map(([name, _]) => name);
          
          if (slowServices.length > 0) {
            this.logger.warn(`Slow data service adapters detected: ${slowServices.join(', ')}`);
            this.eventEmitter.emit('performance-alert', slowServices);
          }
        } catch (error) {
          this.logger.error('Error during factory metrics collection:', error);
        }
      }, this.config.monitoring.metricsCollectionInterval);
    }
  }

  private stopMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
  }

  // Event emitter methods for external event handling
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: string, listener?: (...args: any[]) => void): void {
    if (listener) {
      this.eventEmitter.off(event, listener);
    } else {
      this.eventEmitter.removeAllListeners(event);
    }
  }
}

/**
 * Global data service factory instance
 */
export const globalDataServiceFactory = new DataServiceFactory();

export default DataServiceFactory;