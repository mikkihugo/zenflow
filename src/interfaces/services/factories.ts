/**
 * USL (Unified Service Layer) Factory Implementation
 *
 * @file Central factory system for creating, managing, and orchestrating service instances
 * across the Claude-Zen ecosystem. Provides dependency injection, service discovery,
 * and lifecycle management following the same successful patterns as DAL and UACL.
 * @description The USL Factory system implements the Factory pattern with enhanced capabilities:
 * - Automatic dependency resolution and injection
 * - Service lifecycle management (initialize, start, stop, destroy)
 * - Health monitoring and auto-recovery mechanisms
 * - Service discovery and registration
 * - Metrics collection and performance monitoring
 * - Event-driven service coordination
 * @example
 * ```typescript
 * import { USLFactory, globalUSLFactory } from '@claude-zen/usl';
 *
 * // Configure and use the global factory
 * await globalUSLFactory.initialize({
 *   maxConcurrentInits: 5,
 *   enableDependencyResolution: true,
 *   healthMonitoring: { enabled: true, interval: 30000 }
 * });
 *
 * // Create services with automatic dependency resolution
 * const webService = await globalUSLFactory.create({
 *   name: 'api-server',
 *   type: ServiceType.WEB,
 *   dependencies: [{ serviceName: 'database', required: true }]
 * });
 *
 * // Factory handles initialization, dependency injection, and lifecycle
 * const status = await webService.getStatus();
 * console.log(`Service ${webService.name} is ${status.lifecycle}`);
 * ```
 */

import { EventEmitter } from 'events';
import { createLogger, type Logger } from '../../utils/logger';
import type {
  IService,
  IServiceCapabilityRegistry,
  IServiceConfigValidator,
  IServiceFactory,
  IServiceRegistry,
  ServiceCapability,
  ServiceConfig,
  ServiceEvent,
  ServiceEventType,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceStatus,
} from './core/interfaces';
import {
  ServiceConfigurationError,
  ServiceDependencyError,
  ServiceError,
  ServiceInitializationError,
  ServiceOperationError,
  ServiceTimeoutError,
} from './core/interfaces';
import {
  type AnyServiceConfig,
  type BaseServiceConfig,
  type CoordinationServiceConfig,
  type DatabaseServiceConfig,
  type DataServiceConfig,
  isCoordinationServiceConfig,
  isDatabaseServiceConfig,
  isDataServiceConfig,
  isMemoryServiceConfig,
  isNeuralServiceConfig,
  isWebServiceConfig,
  type MemoryServiceConfig,
  type NeuralServiceConfig,
  ServiceConfigFactory,
  ServiceEnvironment,
  ServicePriority,
  ServiceType,
  type WebServiceConfig,
} from './types';

/**
 * Configuration for the USL Factory system
 *
 * @interface USLFactoryConfig
 * @description Comprehensive configuration options for the USL Factory system,
 * controlling service creation, monitoring, discovery, and lifecycle management
 * @example
 * ```typescript
 * const factoryConfig: USLFactoryConfig = {
 *   maxConcurrentInits: 10,
 *   defaultTimeout: 60000,
 *   enableDependencyResolution: true,
 *   discovery: {
 *     enabled: true,
 *     advertisementInterval: 30000,
 *     heartbeatInterval: 15000
 *   },
 *   healthMonitoring: {
 *     enabled: true,
 *     interval: 30000,
 *     alertThresholds: {
 *       errorRate: 5.0,  // 5% error rate threshold
 *       responseTime: 1000  // 1 second response time threshold
 *     }
 *   },
 *   autoRecovery: {
 *     enabled: true,
 *     maxRetries: 3,
 *     backoffMultiplier: 2
 *   }
 * };
 *
 * await globalUSLFactory.initialize(factoryConfig);
 * ```
 */
export interface USLFactoryConfig {
  /** Maximum number of concurrent service initializations (default: 5) */
  maxConcurrentInits?: number;

  /** Default service timeout in milliseconds (default: 30000) */
  defaultTimeout?: number;

  /** Enable automatic dependency resolution and injection (default: true) */
  enableDependencyResolution?: boolean;

  /** Service discovery and advertisement configuration */
  discovery?: {
    /** Enable service discovery system */
    enabled: boolean;
    /** Interval for service advertisements in milliseconds (default: 60000) */
    advertisementInterval?: number;
    /** Heartbeat interval for service availability in milliseconds (default: 30000) */
    heartbeatInterval?: number;
  };

  /** Service health monitoring and alerting configuration */
  healthMonitoring?: {
    /** Enable health monitoring system */
    enabled: boolean;
    /** Health check interval in milliseconds (default: 30000) */
    interval?: number;
    /** Alert thresholds for automated notifications */
    alertThresholds?: {
      /** Error rate percentage threshold for alerts (e.g., 5.0 for 5%) */
      errorRate: number;
      /** Response time threshold in milliseconds for alerts */
      responseTime: number;
    };
  };

  /** Performance metrics collection and storage configuration */
  metricsCollection?: {
    /** Enable metrics collection system */
    enabled: boolean;
    /** Metrics collection interval in milliseconds (default: 60000) */
    interval?: number;
    /** Metrics retention period in milliseconds (default: 86400000 - 24 hours) */
    retention?: number;
  };

  /** Automatic service recovery and restart configuration */
  autoRecovery?: {
    /** Enable automatic recovery for failed services */
    enabled: boolean;
    /** Maximum number of recovery attempts (default: 3) */
    maxRetries?: number;
    /** Backoff multiplier for retry delays (default: 2) */
    backoffMultiplier?: number;
  };
}

/**
 * Main USL Factory class for creating and managing service instances
 *
 * @example
 */
export class USLFactory implements IServiceFactory {
  private services = new Map<string, IService>();
  private serviceFactories = new Map<string, IServiceFactory>();
  private logger: Logger;
  private eventEmitter = new EventEmitter();
  private initializationQueue = new Map<string, Promise<IService>>();
  private config: Required<USLFactoryConfig>;

  constructor(config: USLFactoryConfig = {}) {
    this.logger = createLogger('USLFactory');
    this.config = {
      maxConcurrentInits: config.maxConcurrentInits ?? 5,
      defaultTimeout: config.defaultTimeout ?? 30000,
      enableDependencyResolution: config.enableDependencyResolution ?? true,
      discovery: {
        enabled: config.discovery?.enabled ?? true,
        advertisementInterval: config.discovery?.advertisementInterval ?? 30000,
        heartbeatInterval: config.discovery?.heartbeatInterval ?? 10000,
      },
      healthMonitoring: {
        enabled: config.healthMonitoring?.enabled ?? true,
        interval: config.healthMonitoring?.interval ?? 30000,
        alertThresholds: {
          errorRate: config.healthMonitoring?.alertThresholds?.errorRate ?? 5,
          responseTime: config.healthMonitoring?.alertThresholds?.responseTime ?? 1000,
        },
      },
      metricsCollection: {
        enabled: config.metricsCollection?.enabled ?? true,
        interval: config.metricsCollection?.interval ?? 10000,
        retention: config.metricsCollection?.retention ?? 86400000, // 24 hours
      },
      autoRecovery: {
        enabled: config.autoRecovery?.enabled ?? true,
        maxRetries: config.autoRecovery?.maxRetries ?? 3,
        backoffMultiplier: config.autoRecovery?.backoffMultiplier ?? 2,
      },
    };

    this.initializeSystemServices();
  }

  /**
   * Create a service instance based on configuration
   *
   * @param config
   */
  async create<T extends ServiceConfig = ServiceConfig>(config: T): Promise<IService> {
    this.logger.info(`Creating service: ${config.name} (${config.type})`);

    // Validate configuration
    const isValid = await this.validateConfig(config);
    if (!isValid) {
      throw new ServiceConfigurationError(config.name, 'Invalid service configuration');
    }

    // Check if service already exists
    if (this.services.has(config.name)) {
      this.logger.warn(`Service ${config.name} already exists, returning existing instance`);
      return this.services.get(config.name)!;
    }

    // Check if service is already being initialized
    if (this.initializationQueue.has(config.name)) {
      this.logger.debug(`Service ${config.name} is already being initialized, waiting...`);
      return await this.initializationQueue.get(config.name)!;
    }

    // Create initialization promise
    const initPromise = this.createServiceInstance(config);
    this.initializationQueue.set(config.name, initPromise);

    try {
      const service = await initPromise;
      this.services.set(config.name, service);
      this.initializationQueue.delete(config.name);

      // Set up service event handling
      this.setupServiceEventHandling(service);

      // Emit service creation event
      this.eventEmitter.emit('service-created', config.name, service);

      this.logger.info(`Service created successfully: ${config.name}`);
      return service;
    } catch (error) {
      this.initializationQueue.delete(config.name);
      this.logger.error(`Failed to create service ${config.name}:`, error);
      throw new ServiceInitializationError(config.name, error as Error);
    }
  }

  /**
   * Create multiple services concurrently
   *
   * @param configs
   */
  async createMultiple<T extends ServiceConfig = ServiceConfig>(configs: T[]): Promise<IService[]> {
    this.logger.info(`Creating ${configs.length} services concurrently`);

    // Sort by priority for initialization order
    const sortedConfigs = [...configs].sort((a, b) => {
      const priorityA = (a as any).priority ?? ServicePriority.NORMAL;
      const priorityB = (b as any).priority ?? ServicePriority.NORMAL;
      return priorityA - priorityB;
    });

    // Create services in batches based on maxConcurrentInits
    const results: IService[] = [];
    const batchSize = this.config.maxConcurrentInits;

    for (let i = 0; i < sortedConfigs.length; i += batchSize) {
      const batch = sortedConfigs.slice(i, i + batchSize);
      const batchPromises = batch.map((config) => this.create(config));

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        this.logger.error(`Failed to create service batch starting at index ${i}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Get service by name
   *
   * @param name
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
   *
   * @param name
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Remove and destroy service
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const service = this.services.get(name);
    if (!service) {
      return false;
    }

    try {
      this.logger.info(`Removing service: ${name}`);

      // Stop and destroy the service
      await service.stop();
      await service.destroy();

      // Remove from registry
      this.services.delete(name);

      // Emit service removed event
      this.eventEmitter.emit('service-removed', name);

      this.logger.info(`Service removed successfully: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove service ${name}:`, error);
      throw new ServiceOperationError(name, 'remove', error as Error);
    }
  }

  /**
   * Get supported service types
   */
  getSupportedTypes(): string[] {
    return Object.values(ServiceType);
  }

  /**
   * Check if service type is supported
   *
   * @param type
   */
  supportsType(type: string): boolean {
    return this.getSupportedTypes().includes(type);
  }

  /**
   * Start all services
   */
  async startAll(): Promise<void> {
    this.logger.info('Starting all services...');

    const services = this.list();
    const servicesByPriority = this.groupServicesByPriority(services);

    // Start services by priority level
    for (const priority of [
      ServicePriority.CRITICAL,
      ServicePriority.HIGH,
      ServicePriority.NORMAL,
      ServicePriority.LOW,
      ServicePriority.BACKGROUND,
    ]) {
      const priorityServices = servicesByPriority.get(priority) || [];
      if (priorityServices.length === 0) continue;

      this.logger.info(
        `Starting ${priorityServices.length} services with priority ${ServicePriority[priority]}`
      );

      const startPromises = priorityServices.map(async (service) => {
        try {
          await service.start();
          this.logger.debug(`Started service: ${service.name}`);
        } catch (error) {
          this.logger.error(`Failed to start service ${service.name}:`, error);
          if (this.config.autoRecovery.enabled) {
            this.scheduleServiceRecovery(service);
          }
          throw error;
        }
      });

      await Promise.allSettled(startPromises);

      // Wait a bit between priority levels to ensure dependencies are ready
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.info('All services startup completed');
  }

  /**
   * Stop all services
   */
  async stopAll(): Promise<void> {
    this.logger.info('Stopping all services...');

    const services = this.list();
    const servicesByPriority = this.groupServicesByPriority(services);

    // Stop services in reverse priority order
    for (const priority of [
      ServicePriority.BACKGROUND,
      ServicePriority.LOW,
      ServicePriority.NORMAL,
      ServicePriority.HIGH,
      ServicePriority.CRITICAL,
    ]) {
      const priorityServices = servicesByPriority.get(priority) || [];
      if (priorityServices.length === 0) continue;

      this.logger.info(
        `Stopping ${priorityServices.length} services with priority ${ServicePriority[priority]}`
      );

      const stopPromises = priorityServices.map(async (service) => {
        try {
          await service.stop();
          this.logger.debug(`Stopped service: ${service.name}`);
        } catch (error) {
          this.logger.error(`Failed to stop service ${service.name}:`, error);
        }
      });

      await Promise.allSettled(stopPromises);
    }

    this.logger.info('All services stopped');
  }

  /**
   * Perform health check on all services
   */
  async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
    this.logger.debug('Performing health check on all services');

    const results = new Map<string, ServiceStatus>();
    const services = this.list();

    const healthCheckPromises = services.map(async (service) => {
      try {
        const status = await service.getStatus();
        results.set(service.name, status);
      } catch (error) {
        this.logger.error(`Health check failed for service ${service.name}:`, error);
        results.set(service.name, {
          name: service.name,
          type: service.type,
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
   * Get metrics from all services
   */
  async getMetricsAll(): Promise<Map<string, ServiceMetrics>> {
    this.logger.debug('Collecting metrics from all services');

    const results = new Map<string, ServiceMetrics>();
    const services = this.list();

    const metricsPromises = services.map(async (service) => {
      try {
        const metrics = await service.getMetrics();
        results.set(service.name, metrics);
      } catch (error) {
        this.logger.error(`Failed to get metrics for service ${service.name}:`, error);
      }
    });

    await Promise.allSettled(metricsPromises);
    return results;
  }

  /**
   * Shutdown factory and all services
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down USL Factory...');

    try {
      // Stop all services first
      await this.stopAll();

      // Destroy all services
      const destroyPromises = this.list().map(async (service) => {
        try {
          await service.destroy();
        } catch (error) {
          this.logger.error(`Failed to destroy service ${service.name}:`, error);
        }
      });

      await Promise.allSettled(destroyPromises);

      // Clear registries
      this.services.clear();
      this.serviceFactories.clear();
      this.initializationQueue.clear();

      // Remove all event listeners
      this.eventEmitter.removeAllListeners();

      this.logger.info('USL Factory shutdown completed');
    } catch (error) {
      this.logger.error('Error during USL Factory shutdown:', error);
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
   *
   * @param type
   */
  getServicesByType(type: string): IService[] {
    return this.list().filter((service) => service.type === type);
  }

  /**
   * Validate service configuration
   *
   * @param config
   */
  async validateConfig(config: ServiceConfig): Promise<boolean> {
    try {
      // Basic validation
      if (!config.name || !config.type) {
        this.logger.error('Service configuration missing required fields: name or type');
        return false;
      }

      // Check if type is supported
      if (!this.supportsType(config.type)) {
        this.logger.error(`Unsupported service type: ${config.type}`);
        return false;
      }

      // Type-specific validation
      const validationResult = this.validateTypeSpecificConfig(config);
      if (!validationResult.valid) {
        this.logger.error(
          `Service configuration validation failed for ${config.name}:`,
          validationResult.errors
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error validating service configuration for ${config.name}:`, error);
      return false;
    }
  }

  /**
   * Get configuration schema for service type
   *
   * @param type
   */
  getConfigSchema(type: string): Record<string, any> | undefined {
    // Return basic schema structure - can be extended for each service type
    const baseSchema = {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: this.getSupportedTypes() },
        enabled: { type: 'boolean', default: true },
        timeout: { type: 'number', minimum: 1000 },
        description: { type: 'string' },
        metadata: { type: 'object' },
      },
    };

    // Add type-specific schema properties
    switch (type) {
      case ServiceType.WEB:
      case ServiceType.API:
        return {
          ...baseSchema,
          properties: {
            ...baseSchema.properties,
            server: {
              type: 'object',
              properties: {
                host: { type: 'string' },
                port: { type: 'number', minimum: 1, maximum: 65535 },
              },
            },
          },
        };

      case ServiceType.DATABASE:
        return {
          ...baseSchema,
          properties: {
            ...baseSchema.properties,
            connection: {
              type: 'object',
              properties: {
                host: { type: 'string' },
                port: { type: 'number' },
                database: { type: 'string' },
              },
            },
          },
        };

      default:
        return baseSchema;
    }
  }

  // ============================================
  // Private Methods
  // ============================================

  private async createServiceInstance(config: ServiceConfig): Promise<IService> {
    const startTime = Date.now();

    try {
      // Create service instance based on type
      const service = await this.instantiateServiceByType(config);

      // Initialize the service
      await service.initialize(config);

      const duration = Date.now() - startTime;
      this.logger.info(`Service ${config.name} initialized in ${duration}ms`);

      return service;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Service ${config.name} initialization failed after ${duration}ms:`, error);
      throw error;
    }
  }

  private async instantiateServiceByType(config: ServiceConfig): Promise<IService> {
    // Dynamic import based on service type to avoid circular dependencies
    const serviceType = config.type as ServiceType;

    switch (serviceType) {
      case ServiceType.DATA:
      case ServiceType.WEB_DATA:
      case ServiceType.DOCUMENT: {
        // Use the enhanced DataServiceAdapter for unified data operations
        const { DataServiceAdapter } = await import('./adapters/data-service-adapter');
        return new DataServiceAdapter(config as any);
      }

      case ServiceType.WEB:
      case ServiceType.API: {
        const { WebService } = await import('./implementations/web-service');
        return new WebService(config as WebServiceConfig);
      }

      case ServiceType.COORDINATION:
      case ServiceType.DAA:
      case ServiceType.SESSION_RECOVERY: {
        // Use the enhanced CoordinationServiceAdapter for unified coordination operations
        const { CoordinationServiceAdapter } = await import(
          './adapters/coordination-service-adapter'
        );
        return new CoordinationServiceAdapter(config as any);
      }

      case ServiceType.SWARM:
      case ServiceType.ORCHESTRATION: {
        const { CoordinationService } = await import('./implementations/coordination-service');
        return new CoordinationService(config as CoordinationServiceConfig);
      }

      case ServiceType.NEURAL: {
        const { NeuralService } = await import('./implementations/neural-service');
        return new NeuralService(config as NeuralServiceConfig);
      }

      case ServiceType.MEMORY:
      case ServiceType.CACHE: {
        const { MemoryService } = await import('./implementations/memory-service');
        return new MemoryService(config as MemoryServiceConfig);
      }

      case ServiceType.DATABASE: {
        const { DatabaseService } = await import('./implementations/database-service');
        return new DatabaseService(config as DatabaseServiceConfig);
      }

      case ServiceType.MONITORING: {
        const { MonitoringService } = await import('./implementations/monitoring-service');
        return new MonitoringService(config);
      }

      default: {
        // Try to find registered factory for this type
        const factory = this.serviceFactories.get(config.type);
        if (factory) {
          return await factory.create(config);
        }

        // Fall back to generic service implementation
        const { GenericService } = await import('./implementations/generic-service');
        return new GenericService(config);
      }
    }
  }

  private validateTypeSpecificConfig(config: ServiceConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      if (isDataServiceConfig(config)) {
        // Validate data service specific configuration
        if (
          config.dataSource &&
          !['database', 'memory', 'file', 'api'].includes(config.dataSource.type)
        ) {
          errors.push(`Invalid data source type: ${config.dataSource.type}`);
        }
      } else if (isWebServiceConfig(config)) {
        // Validate web service specific configuration
        if (config.server?.port && (config.server.port < 1 || config.server.port > 65535)) {
          errors.push(`Invalid port number: ${config.server.port}`);
        }
      } else if (isCoordinationServiceConfig(config)) {
        // Validate coordination service specific configuration
        if (config.coordination?.maxAgents && config.coordination.maxAgents < 1) {
          errors.push(`Invalid maxAgents value: ${config.coordination.maxAgents}`);
        }
      }
      // Add more type-specific validations as needed

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Configuration validation error: ${error}`);
      return { valid: false, errors };
    }
  }

  private setupServiceEventHandling(service: IService): void {
    // Forward service events to factory event emitter
    const eventTypes: ServiceEventType[] = [
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

    eventTypes.forEach((eventType) => {
      service.on(eventType, (event: ServiceEvent) => {
        this.eventEmitter.emit(`service-${eventType}`, service.name, event);

        // Handle error events with auto-recovery
        if (eventType === 'error' && this.config.autoRecovery.enabled) {
          this.scheduleServiceRecovery(service);
        }
      });
    });
  }

  private groupServicesByPriority(services: IService[]): Map<ServicePriority, IService[]> {
    const groups = new Map<ServicePriority, IService[]>();

    services.forEach((service) => {
      const priority = (service.config as any).priority ?? ServicePriority.NORMAL;
      if (!groups.has(priority)) {
        groups.set(priority, []);
      }
      groups.get(priority)!.push(service);
    });

    return groups;
  }

  private scheduleServiceRecovery(service: IService): void {
    const recoveryKey = `recovery-${service.name}`;

    // Don't schedule multiple recoveries for the same service
    if (this.initializationQueue.has(recoveryKey)) {
      return;
    }

    const recoveryPromise = this.performServiceRecovery(service);
    this.initializationQueue.set(recoveryKey, recoveryPromise);

    recoveryPromise.finally(() => {
      this.initializationQueue.delete(recoveryKey);
    });
  }

  private async performServiceRecovery(service: IService): Promise<IService> {
    const maxRetries = this.config.autoRecovery.maxRetries;
    const backoffMultiplier = this.config.autoRecovery.backoffMultiplier;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(
          `Attempting service recovery for ${service.name} (attempt ${attempt}/${maxRetries})`
        );

        // Stop the service if it's still running
        try {
          await service.stop();
        } catch (error) {
          this.logger.debug(`Error stopping service during recovery: ${error}`);
        }

        // Restart the service
        await service.start();

        // Verify service is healthy
        const isHealthy = await service.healthCheck();
        if (isHealthy) {
          this.logger.info(`Service recovery successful for ${service.name}`);
          return service;
        } else {
          throw new Error('Service health check failed after restart');
        }
      } catch (error) {
        this.logger.warn(`Service recovery attempt ${attempt} failed for ${service.name}:`, error);

        if (attempt < maxRetries) {
          const delay = backoffMultiplier ** attempt * 1000;
          this.logger.info(`Waiting ${delay}ms before next recovery attempt for ${service.name}`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(`Service recovery failed for ${service.name} after ${maxRetries} attempts`);
    throw new ServiceOperationError(
      service.name,
      'recovery',
      new Error('All recovery attempts failed')
    );
  }

  private initializeSystemServices(): void {
    // Initialize system-level monitoring and health checking
    if (this.config.healthMonitoring.enabled) {
      this.startHealthMonitoring();
    }

    if (this.config.metricsCollection.enabled) {
      this.startMetricsCollection();
    }

    if (this.config.discovery.enabled) {
      this.startServiceDiscovery();
    }
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      try {
        const healthResults = await this.healthCheckAll();
        const unhealthyServices = Array.from(healthResults.entries())
          .filter(([_, status]) => status.health !== 'healthy')
          .map(([name, _]) => name);

        if (unhealthyServices.length > 0) {
          this.logger.warn(`Unhealthy services detected: ${unhealthyServices.join(', ')}`);
          this.eventEmitter.emit('health-alert', unhealthyServices);
        }
      } catch (error) {
        this.logger.error('Error during health monitoring:', error);
      }
    }, this.config.healthMonitoring.interval);
  }

  private startMetricsCollection(): void {
    setInterval(async () => {
      try {
        const metrics = await this.getMetricsAll();
        this.eventEmitter.emit('metrics-collected', metrics);

        // Check for performance alerts
        const slowServices = Array.from(metrics.entries())
          .filter(
            ([_, metric]) =>
              metric.averageLatency > this.config.healthMonitoring.alertThresholds.responseTime
          )
          .map(([name, _]) => name);

        if (slowServices.length > 0) {
          this.logger.warn(`Slow services detected: ${slowServices.join(', ')}`);
          this.eventEmitter.emit('performance-alert', slowServices);
        }
      } catch (error) {
        this.logger.error('Error during metrics collection:', error);
      }
    }, this.config.metricsCollection.interval);
  }

  private startServiceDiscovery(): void {
    // Implement service discovery and heartbeat mechanism
    setInterval(() => {
      this.eventEmitter.emit('service-heartbeat', {
        factoryId: 'usl-factory',
        services: this.list().map((s) => ({ name: s.name, type: s.type })),
        timestamp: new Date(),
      });
    }, this.config.discovery.heartbeatInterval);
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
 * Service Registry implementation for global service management
 *
 * @example
 */
export class ServiceRegistry implements IServiceRegistry {
  private factories = new Map<string, IServiceFactory>();
  private eventEmitter = new EventEmitter();
  private logger: Logger;

  constructor() {
    this.logger = createLogger('ServiceRegistry');
  }

  registerFactory<T extends ServiceConfig>(type: string, factory: IServiceFactory<T>): void {
    this.logger.info(`Registering service factory for type: ${type}`);
    this.factories.set(type, factory);
    this.eventEmitter.emit('factory-registered', type, factory);
  }

  getFactory<T extends ServiceConfig>(type: string): IServiceFactory<T> | undefined {
    return this.factories.get(type) as IServiceFactory<T>;
  }

  listFactoryTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  unregisterFactory(type: string): void {
    this.logger.info(`Unregistering service factory for type: ${type}`);
    this.factories.delete(type);
    this.eventEmitter.emit('factory-unregistered', type);
  }

  getAllServices(): Map<string, IService> {
    const allServices = new Map<string, IService>();

    for (const factory of this.factories.values()) {
      factory.list().forEach((service) => {
        allServices.set(service.name, service);
      });
    }

    return allServices;
  }

  findService(name: string): IService | undefined {
    for (const factory of this.factories.values()) {
      const service = factory.get(name);
      if (service) {
        return service;
      }
    }
    return undefined;
  }

  getServicesByType(type: string): IService[] {
    const factory = this.factories.get(type);
    return factory ? factory.list() : [];
  }

  getServicesByStatus(status: ServiceLifecycleStatus): IService[] {
    const allServices = this.getAllServices();
    return Array.from(allServices.values()).filter(async (service) => {
      try {
        const serviceStatus = await service.getStatus();
        return serviceStatus.lifecycle === status;
      } catch {
        return false;
      }
    });
  }

  async startAllServices(): Promise<void> {
    this.logger.info('Starting all services across all factories');
    const startPromises = Array.from(this.factories.values()).map((factory) => factory.startAll());
    await Promise.allSettled(startPromises);
  }

  async stopAllServices(): Promise<void> {
    this.logger.info('Stopping all services across all factories');
    const stopPromises = Array.from(this.factories.values()).map((factory) => factory.stopAll());
    await Promise.allSettled(stopPromises);
  }

  async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
    const allResults = new Map<string, ServiceStatus>();

    const healthCheckPromises = Array.from(this.factories.values()).map(async (factory) => {
      try {
        const results = await factory.healthCheckAll();
        results.forEach((status, name) => {
          allResults.set(name, status);
        });
      } catch (error) {
        this.logger.error('Error during factory health check:', error);
      }
    });

    await Promise.allSettled(healthCheckPromises);
    return allResults;
  }

  async getSystemMetrics(): Promise<{
    totalServices: number;
    runningServices: number;
    healthyServices: number;
    errorServices: number;
    aggregatedMetrics: ServiceMetrics[];
  }> {
    const allServices = this.getAllServices();
    const healthStatuses = await this.healthCheckAll();

    const totalServices = allServices.size;
    const runningServices = Array.from(healthStatuses.values()).filter(
      (status) => status.lifecycle === 'running'
    ).length;
    const healthyServices = Array.from(healthStatuses.values()).filter(
      (status) => status.health === 'healthy'
    ).length;
    const errorServices = Array.from(healthStatuses.values()).filter(
      (status) => status.lifecycle === 'error'
    ).length;

    // Collect aggregated metrics
    const aggregatedMetrics: ServiceMetrics[] = [];
    const metricsPromises = Array.from(this.factories.values()).map(async (factory) => {
      try {
        const metrics = await factory.getMetricsAll();
        metrics.forEach((metric) => {
          aggregatedMetrics.push(metric);
        });
      } catch (error) {
        this.logger.error('Error collecting factory metrics:', error);
      }
    });

    await Promise.allSettled(metricsPromises);

    return {
      totalServices,
      runningServices,
      healthyServices,
      errorServices,
      aggregatedMetrics,
    };
  }

  async shutdownAll(): Promise<void> {
    this.logger.info('Shutting down all service factories');
    const shutdownPromises = Array.from(this.factories.values()).map((factory) =>
      factory.shutdown()
    );
    await Promise.allSettled(shutdownPromises);
    this.factories.clear();
  }

  discoverServices(criteria?: {
    type?: string;
    capabilities?: string[];
    health?: 'healthy' | 'degraded' | 'unhealthy';
    tags?: string[];
  }): IService[] {
    const allServices = Array.from(this.getAllServices().values());

    if (!criteria) {
      return allServices;
    }

    return allServices.filter((service) => {
      // Filter by type
      if (criteria.type && service.type !== criteria.type) {
        return false;
      }

      // Filter by capabilities
      if (criteria.capabilities) {
        const serviceCapabilities = service.getCapabilities();
        const hasAllCapabilities = criteria.capabilities.every((cap) =>
          serviceCapabilities.includes(cap)
        );
        if (!hasAllCapabilities) {
          return false;
        }
      }

      // Filter by tags
      if (criteria.tags) {
        const serviceTags = (service.config as any).tags || [];
        const hasAllTags = criteria.tags.every((tag) => serviceTags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      // Note: Health filtering would require async operation, so it's not implemented here
      // It could be added as a separate async method if needed

      return true;
    });
  }

  on(
    event: 'service-registered' | 'service-unregistered' | 'service-status-changed',
    handler: (serviceName: string, service?: IService) => void
  ): void {
    this.eventEmitter.on(event, handler);
  }

  off(event: string, handler?: Function): void {
    if (handler) {
      this.eventEmitter.off(event, handler);
    } else {
      this.eventEmitter.removeAllListeners(event);
    }
  }
}

/**
 * Global USL Factory instance
 */
export const globalUSLFactory = new USLFactory();

/**
 * Global Service Registry instance
 */
export const globalServiceRegistry = new ServiceRegistry();

// Register the main USL factory with the registry
globalServiceRegistry.registerFactory('usl', globalUSLFactory);

/**
 * Service configuration validator implementation
 *
 * @example
 */
export class ServiceConfigValidator implements IServiceConfigValidator {
  private schemas = new Map<string, Record<string, any>>();
  private logger: Logger;

  constructor() {
    this.logger = createLogger('ServiceConfigValidator');
    this.initializeDefaultSchemas();
  }

  async validate(config: ServiceConfig): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic validation
      if (!config.name) {
        errors.push('Service name is required');
      }

      if (!config.type) {
        errors.push('Service type is required');
      }

      // Type-specific validation
      if (config.type) {
        const typeValid = await this.validateType(config.type, config);
        if (!typeValid) {
          errors.push(`Invalid configuration for service type: ${config.type}`);
        }
      }

      // Dependency validation
      if (config.dependencies) {
        config.dependencies.forEach((dep) => {
          if (!dep.serviceName) {
            errors.push('Dependency service name is required');
          }
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`Validation error: ${error}`);
      return { valid: false, errors, warnings };
    }
  }

  async validateType(type: string, config: ServiceConfig): Promise<boolean> {
    const schema = this.schemas.get(type);
    if (!schema) {
      this.logger.warn(`No schema found for service type: ${type}`);
      return true; // Allow unknown types
    }

    // Basic schema validation would go here
    // For now, just return true
    return true;
  }

  getSchema(type: string): Record<string, any> | undefined {
    return this.schemas.get(type);
  }

  registerSchema(type: string, schema: Record<string, any>): void {
    this.logger.info(`Registering schema for service type: ${type}`);
    this.schemas.set(type, schema);
  }

  private initializeDefaultSchemas(): void {
    // Register default schemas for built-in service types
    Object.values(ServiceType).forEach((type) => {
      const schema = globalUSLFactory.getConfigSchema(type);
      if (schema) {
        this.registerSchema(type, schema);
      }
    });
  }
}

/**
 * Service capability registry implementation
 *
 * @example
 */
export class ServiceCapabilityRegistry implements IServiceCapabilityRegistry {
  private capabilities = new Map<string, ServiceCapability[]>();
  private logger: Logger;

  constructor() {
    this.logger = createLogger('ServiceCapabilityRegistry');
  }

  register(serviceName: string, capability: ServiceCapability): void {
    if (!this.capabilities.has(serviceName)) {
      this.capabilities.set(serviceName, []);
    }

    const serviceCapabilities = this.capabilities.get(serviceName)!;
    const existingIndex = serviceCapabilities.findIndex((cap) => cap.name === capability.name);

    if (existingIndex >= 0) {
      // Update existing capability
      serviceCapabilities[existingIndex] = capability;
      this.logger.debug(`Updated capability ${capability.name} for service ${serviceName}`);
    } else {
      // Add new capability
      serviceCapabilities.push(capability);
      this.logger.debug(`Registered capability ${capability.name} for service ${serviceName}`);
    }
  }

  unregister(serviceName: string, capabilityName: string): void {
    const serviceCapabilities = this.capabilities.get(serviceName);
    if (serviceCapabilities) {
      const filteredCapabilities = serviceCapabilities.filter((cap) => cap.name !== capabilityName);
      this.capabilities.set(serviceName, filteredCapabilities);
      this.logger.debug(`Unregistered capability ${capabilityName} for service ${serviceName}`);
    }
  }

  getCapabilities(serviceName: string): ServiceCapability[] {
    return this.capabilities.get(serviceName) || [];
  }

  findServicesByCapability(capabilityName: string): string[] {
    const servicesWithCapability: string[] = [];

    this.capabilities.forEach((capabilities, serviceName) => {
      if (capabilities.some((cap) => cap.name === capabilityName)) {
        servicesWithCapability.push(serviceName);
      }
    });

    return servicesWithCapability;
  }

  hasCapability(serviceName: string, capabilityName: string): boolean {
    const serviceCapabilities = this.capabilities.get(serviceName);
    return serviceCapabilities
      ? serviceCapabilities.some((cap) => cap.name === capabilityName)
      : false;
  }
}

/**
 * Global instances
 */
export const globalServiceConfigValidator = new ServiceConfigValidator();
export const globalServiceCapabilityRegistry = new ServiceCapabilityRegistry();

export default USLFactory;
