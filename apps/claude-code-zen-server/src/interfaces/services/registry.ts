/**
 * @fileoverview Enhanced Service Registry - ServiceContainer-based implementation
 *
 * Modern service registry using battle-tested ServiceContainer (Awilix) backend.
 * Provides zero breaking changes migration from custom EnhancedServiceRegistry implementation
 * with enhanced capabilities including health monitoring, service discovery, and metrics.
 *
 * Production-grade service registry using battle-tested ServiceContainer (Awilix) backend.
 *
 * Key Improvements:
 * - Battle-tested Awilix dependency injection for service management
 * - Health monitoring and metrics collection for all services
 * - Service discovery and capability-based service queries
 * - Type-safe registration with lifecycle management
 * - Error handling with Result patterns
 * - Event-driven notifications for registry changes
 * - Advanced dependency management and resolution
 * - Auto-recovery and resilience features
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

import {
  ServiceContainer,
  createServiceContainer,
} from '@claude-zen/foundation');
import { getLogger, type Logger } from '@claude-zen/foundation');
import { TypedEventBus, createTypedEventBus } from '@claude-zen/intelligence');

import type {
  Service,
  ServiceFactory,
  ServiceRegistry as ServiceRegistryInterface,
  ServiceConfig,
  ServiceEvent,
  ServiceEventType,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceStatus,
} from "./core/interfaces";
import('/core/interfaces');

export interface ServiceRegistryConfig {
  /** Health monitoring configuration */
  healthMonitoring: {
    enabled: boolean;
    interval: number; // ms
    timeout: number; // ms
    alertThresholds: {
      errorRate: number; // percentage
      responseTime: number; // ms
      resourceUsage: number; // percentage
    };
  };

  /** Metrics collection configuration */
  metricsCollection: {
    enabled: boolean;
    interval: number; // ms
    retention: number; // ms
    aggregationWindow: number; // ms
  };

  /** Service discovery configuration */
  discovery: {
    enabled: boolean;
    heartbeatInterval: number; // ms
    advertisementInterval: number; // ms
    timeoutThreshold: number; // ms
  };

  /** Auto-recovery configuration */
  autoRecovery: {
    enabled: boolean;
    maxRetries: number;
    backoffMultiplier: number;
    recoveryTimeout: number; // ms
  };

  /** Service dependency management */
  dependencyManagement: {
    enabled: boolean;
    resolutionTimeout: number; // ms
    circularDependencyCheck: boolean;
    dependencyHealthCheck: boolean;
  };

  /** Performance optimization */
  performance: {
    enableCaching: boolean;
    enableConnectionPooling: boolean;
    enableServiceMemoization: boolean;
    maxConcurrentOperations: number;
  };
}

export interface ServiceDiscoveryInfo {
  serviceName: string;
  serviceType: string;
  version: string;
  capabilities: string[];
  tags: string[];
  metadata: Record<string, unknown>;
  lastHeartbeat: Date;
  endpoint?: string;
  health: 'healthy | degraded' | 'unhealthy');
}

export interface ServiceDependencyGraph {
  nodes: Map<
    string,
    {
      service: Service;
      dependencies: Set<string>;
      dependents: Set<string>;
      level: number;
    }
  >;

  // Circular dependency detection
  cycles: string[][];

  // Topological ordering for startup/shutdown.
  startupOrder: string[];
  shutdownOrder: string[];
}

/**
 * Service Container-based Enhanced Service Registry
 *
 * Drop-in replacement for EnhancedServiceRegistry with enhanced capabilities through ServiceContainer.
 * Maintains exact API compatibility while adding health monitoring, metrics, and discovery.
 */
export class ServiceRegistry implements ServiceRegistryInterface {
  private container: ServiceContainer;
  private logger: Logger;
  private eventBus: TypedEventBus<ServiceEvent>;
  private factories = new Map<string, ServiceFactory>();
  private services = new Map<string, Service>();
  private serviceDiscovery = new Map<string, ServiceDiscoveryInfo>();
  private dependencyGraph: ServiceDependencyGraph | null = null;
  private healthStatuses = new Map<string, ServiceStatus>();
  private metricsHistory = new Map<string, ServiceMetrics[]>();
  private config: ServiceRegistryConfig;

  // Monitoring intervals
  private healthMonitoringInterval?: NodeJS.Timeout;
  private metricsCollectionInterval?: NodeJS.Timeout;
  private discoveryInterval?: NodeJS.Timeout;

  // Performance tracking
  private operationMetrics = new Map<
    string,
    {
      totalOperations: number;
      successfulOperations: number;
      averageLatency: number;
      lastOperation: Date;
    }
  >();

  constructor(config?: Partial<ServiceRegistryConfig>) {
    this.container = createServiceContainer('enhanced-service-registry', {
      healthCheckFrequency: config?.healthMonitoring?.interval || 30000,
    });
    this.logger = getLogger('ServiceRegistry');
    this.eventBus = createTypedEventBus<ServiceEvent>({
      enableValidation: true,
      enableMetrics: true,
      maxListeners: 100,
    });

    this.config = {
      healthMonitoring: {
        enabled: config?.healthMonitoring?.enabled ?? true,
        interval: config?.healthMonitoring?.interval ?? 30000,
        timeout: config?.healthMonitoring?.timeout ?? 5000,
        alertThresholds: {
          errorRate: config?.healthMonitoring?.alertThresholds?.errorRate ?? 5,
          responseTime:
            config?.healthMonitoring?.alertThresholds?.responseTime ?? 1000,
          resourceUsage:
            config?.healthMonitoring?.alertThresholds?.resourceUsage ?? 80,
        },
      },
      metricsCollection: {
        enabled: config?.metricsCollection?.enabled ?? true,
        interval: config?.metricsCollection?.interval ?? 10000,
        retention: config?.metricsCollection?.retention ?? 86400000, // 24 hours
        aggregationWindow:
          config?.metricsCollection?.aggregationWindow ?? 300000, // 5 minutes
      },
      discovery: {
        enabled: config?.discovery?.enabled ?? true,
        heartbeatInterval: config?.discovery?.heartbeatInterval ?? 10000,
        advertisementInterval:
          config?.discovery?.advertisementInterval ?? 30000,
        timeoutThreshold: config?.discovery?.timeoutThreshold ?? 60000,
      },
      autoRecovery: {
        enabled: config?.autoRecovery?.enabled ?? true,
        maxRetries: config?.autoRecovery?.maxRetries ?? 3,
        backoffMultiplier: config?.autoRecovery?.backoffMultiplier ?? 2,
        recoveryTimeout: config?.autoRecovery?.recoveryTimeout ?? 30000,
      },
      dependencyManagement: {
        enabled: config?.dependencyManagement?.enabled ?? true,
        resolutionTimeout:
          config?.dependencyManagement?.resolutionTimeout ?? 30000,
        circularDependencyCheck:
          config?.dependencyManagement?.circularDependencyCheck ?? true,
        dependencyHealthCheck:
          config?.dependencyManagement?.dependencyHealthCheck ?? true,
      },
      performance: {
        enableCaching: config?.performance?.enableCaching ?? true,
        enableConnectionPooling:
          config?.performance?.enableConnectionPooling ?? true,
        enableServiceMemoization:
          config?.performance?.enableServiceMemoization ?? true,
        maxConcurrentOperations:
          config?.performance?.maxConcurrentOperations ?? 50,
      },
    };

    this.initializeMonitoring;
  }

  /**
   * Initialize the registry with enhanced ServiceContainer features
   */
  async initialize(): Promise<void> {
    try {
      // Start ServiceContainer health monitoring
      this.container?.startHealthMonitoring()

      this.logger.info('✅ ServiceRegistry initialized with ServiceContainer');
      this.eventBus.emit('initialized', { timestamp: new Date() });
    } catch (error) {
      this.logger.error('❌ Failed to initialize ServiceRegistry:', error);
      throw error;
    }
  }

  // ============================================
  // Factory Registration and Management
  // ============================================

  /**
   * Register factory for service type (compatible with existing EnhancedServiceRegistry interface)
   */
  registerFactory<T extends ServiceConfig>(
    type: string,
    factory: ServiceFactory<T>
  ): void {
    try {
      this.logger.info(`Registering factory for service type: ${type}`);

      // Register with ServiceContainer for enhanced capabilities
      const registrationResult = this.container.registerInstance(
        `factory:${type}`,
        factory,
        {
          capabilities: ['service-factory', type],
          metadata: {
            type: 'service-factory',
            serviceType: type,
            registeredAt: new Date(),
            version: '1..0',
          },
          enabled: true,
          healthCheck: () => this.performFactoryHealthCheck(factory),
        }
      );

      if (registrationResult?.isErr) {
        throw new Error(
          `Failed to register factory ${type}: ${registrationResult.error.message}`
        );
      }

      // Store for legacy compatibility
      this.factories.set(type, factory);

      // Set up factory event handling
      this.setupFactoryEventHandling(type, factory);

      this.eventBus.emit('factory-registered', {
        type,
        factory,
        timestamp: new Date(),
      });
      this.logger.debug(`Factory registered successfully: ${type}`);
    } catch (error) {
      this.logger.error(`❌ Failed to register factory ${type}:`, error);
      throw error;
    }
  }

  /**
   * Get factory for service type (compatible with existing EnhancedServiceRegistry interface)
   */
  getFactory<T extends ServiceConfig>(
    type: string
  ): ServiceFactory<T> | undefined {
    try {
      // Try ServiceContainer first for enhanced resolution
      const result = this.container.resolve<ServiceFactory<T>>(
        `factory:${type}`
      );

      if (result?.isOk) {
        return result.value;
      }

      // Fallback to legacy storage
      return this.factories.get(type) as ServiceFactory<T>;
    } catch (error) {
      this.logger.warn(
        `⚠️ Failed to resolve factory ${type}, falling back to legacy:`,
        error
      );
      return this.factories.get(type) as ServiceFactory<T>;
    }
  }

  /**
   * List factory types (compatible with existing EnhancedServiceRegistry interface)
   */
  listFactoryTypes(): string[] {
    const containerTypes = this.container?.getServiceNames
      .filter((name) => name.startsWith('factory:'))
      .map((name) => name.replace('factory:, '));

    const legacyTypes = Array.from(this.factories?.keys);

    // Combine and deduplicate
    const allTypes = new Set([...containerTypes, ...legacyTypes]);
    return Array.from(allTypes);
  }

  /**
   * Unregister factory (compatible with existing EnhancedServiceRegistry interface)
   */
  unregisterFactory(type: string): void {
    try {
      this.logger.info(`Unregistering factory for service type: ${type}`);

      const factory = this.factories.get(type);
      if (factory) {
        // Stop all services from this factory
        factory?.list.forEach((service) => {
          this.removeServiceFromRegistry(service.name);
        });

        // Disable in ServiceContainer
        this.container.setServiceEnabled(`factory:${type}`, false);

        this.factories.delete(type);
        this.eventBus.emit('factory-unregistered', {
          type,
          timestamp: new Date(),
        });
        this.logger.debug(`Factory unregistered successfully: ${type}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to unregister factory ${type}:`, error);
      throw error;
    }
  }

  // ============================================
  // Service Management and Discovery
  // ============================================

  /**
   * Get all services (compatible with existing EnhancedServiceRegistry interface)
   */
  getAllServices(): Map<string, Service> {
    const allServices = new Map<string, Service>();

    // Collect services from ServiceContainer
    for (const serviceName of this.container?.getServiceNames) {
      if (!serviceName.startsWith('factory:')) {
        const result = this.container.resolve<Service>(serviceName);
        if (result?.isOk) {
          allServices.set(serviceName, result.value);
        }
      }
    }

    // Collect services from all factories
    for (const factory of this.factories?.values()) {
      factory?.list.forEach((service) => {
        if (!allServices.has(service.name)) {
          allServices.set(service.name, service);
        }
      });
    }

    // Include directly registered services
    this.services.forEach((service, name) => {
      if (!allServices.has(name)) {
        allServices.set(name, service);
      }
    });

    return allServices;
  }

  /**
   * Find service by name (compatible with existing EnhancedServiceRegistry interface)
   */
  findService(name: string): Service | undefined {
    try {
      // Try ServiceContainer first for enhanced resolution
      const result = this.container.resolve<Service>(name);

      if (result?.isOk) {
        return result.value;
      }

      // Check directly registered services
      if (this.services.has(name)) {
        return this.services.get(name);
      }

      // Search in all factories
      for (const factory of this.factories?.values()) {
        const service = factory.get(name);
        if (service) {
          // Cache for faster future lookups
          if (this.config.performance.enableCaching) {
            this.services.set(name, service);
          }
          return service;
        }
      }

      return undefined;
    } catch (error) {
      this.logger.warn(`⚠️ Failed to resolve service ${name}:`, error);
      return this.services.get(name);
    }
  }

  /**
   * Get services by type (compatible with existing EnhancedServiceRegistry interface)
   */
  getServicesByType(type: string): Service[] {
    const factory = this.factories.get(type);
    if (factory) {
      return factory?.list()
    }

    // Fallback: search all services
    return Array.from(this.getAllServices?.values()).filter(
      (service) => service.type === type
    );
  }

  /**
   * Get services by status (compatible with existing EnhancedServiceRegistry interface)
   */
  getServicesByStatus(status: ServiceLifecycleStatus): Service[] {
    const matchingServices: Service[] = [];
    const allServices = this.getAllServices;

    for (const service of allServices?.values()) {
      const serviceStatus = this.healthStatuses.get(service.name);
      if (serviceStatus && serviceStatus.lifecycle === status) {
        matchingServices.push(service);
      }
    }

    return matchingServices;
  }

  // ============================================
  // Service Lifecycle Management
  // ============================================

  /**
   * Start all services (compatible with existing EnhancedServiceRegistry interface)
   */
  async startAllServices(): Promise<void> {
    this.logger.info('Starting all services with dependency resolution...');

    if (this.config.dependencyManagement.enabled) {
      await this.buildDependencyGraph;
      await this.startServicesInOrder;
    } else {
      await this.startServicesParallel;
    }

    this.logger.info('All services started successfully');
  }

  /**
   * Stop all services (compatible with existing EnhancedServiceRegistry interface)
   */
  async stopAllServices(): Promise<void> {
    this.logger.info('Stopping all services in reverse dependency order...');

    await (this.dependencyGraph
      ? this.stopServicesInOrder
      : this.stopServicesParallel);

    this.logger.info('All services stopped successfully');
  }

  /**
   * Health check all services (compatible with existing EnhancedServiceRegistry interface)
   */
  async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
    const results = new Map<string, ServiceStatus>();
    const allServices = this.getAllServices;

    const healthCheckPromises = Array.from(allServices?.entries).map(
      async ([name, service]) => {
        try {
          const status = await this.performServiceHealthCheck(service);
          results.set(name, status);
          this.healthStatuses.set(name, status);
        } catch (error) {
          this.logger.error(`Health check failed for service ${name}:`, error);

          const errorStatus: ServiceStatus = {
            name,
            type: service.type,
            lifecycle: 'error',
            health: 'unhealthy',
            lastCheck: new Date(),
            uptime: 0,
            errorCount: 1,
            errorRate: 100,
            metadata: {
              error: error instanceof Error ? error.message : String(error),
            },
          };

          results.set(name, errorStatus);
          this.healthStatuses.set(name, errorStatus);
        }
      }
    );

    await Promise.allSettled(healthCheckPromises);
    return results;
  }

  /**
   * Get system metrics (compatible with existing EnhancedServiceRegistry interface)
   */
  async getSystemMetrics(): Promise<{
    totalServices: number;
    runningServices: number;
    healthyServices: number;
    errorServices: number;
    aggregatedMetrics: ServiceMetrics[];
  }> {
    const allServices = this.getAllServices;
    const healthStatuses = await this.healthCheckAll;
    const containerStats = this.container?.getStats()

    const totalServices = allServices.size;
    const runningServices = Array.from(healthStatuses?.values()).filter(
      (status) => status.lifecycle === 'running'
    ).length;
    const healthyServices = Array.from(healthStatuses?.values()).filter(
      (status) => status.health === 'healthy'
    ).length;
    const errorServices = Array.from(healthStatuses?.values()).filter(
      (status) => status.lifecycle === 'error || status.health === unhealthy'
    ).length;

    // Collect metrics from all services
    const aggregatedMetrics: ServiceMetrics[] = [];
    const metricsPromises = Array.from(allServices?.values()).map(
      async (service) => {
        try {
          const metrics = await service?.getMetrics()
          aggregatedMetrics.push(metrics);
        } catch (error) {
          this.logger.error(
            `Failed to get metrics for service ${service.name}:`,
            error
          );
        }
      }
    );

    await Promise.allSettled(metricsPromises);

    return {
      totalServices,
      runningServices,
      healthyServices,
      errorServices,
      aggregatedMetrics,
    };
  }

  /**
   * Shutdown all services (compatible with existing EnhancedServiceRegistry interface)
   */
  async shutdownAll(): Promise<void> {
    this.logger.info('Shutting down service registry...');

    try {
      // Stop monitoring
      this.stopMonitoring;

      // Stop all services
      await this.stopAllServices;

      // Shutdown all factories
      const shutdownPromises = Array.from(this.factories?.values()).map(
        (factory) => factory?.shutdown()
      );
      await Promise.allSettled(shutdownPromises);

      // Dispose ServiceContainer
      await this.container?.dispose()

      // Clear all registries
      this.factories?.clear();
      this.services?.clear();
      this.serviceDiscovery?.clear();
      this.healthStatuses?.clear();
      this.metricsHistory?.clear();
      this.operationMetrics?.clear();

      // Remove all listeners
      this.removeAllListeners;

      this.logger.info('Service registry shutdown completed');
      this.eventBus.emit('shutdown', { timestamp: new Date() });
    } catch (error) {
      this.logger.error('Error during service registry shutdown:', error);
      throw error;
    }
  }

  // ============================================
  // Advanced Service Discovery
  // ============================================

  /**
   * Discover services (compatible with existing EnhancedServiceRegistry interface)
   */
  discoverServices(criteria?: {
    type?: string;
    capabilities?: string[];
    health?: 'healthy | degraded' | 'unhealthy');
    tags?: string[];
  }): Service[] {
    const allServices = Array.from(this.getAllServices?.values());

    if (!criteria) {
      return allServices;
    }

    return allServices.filter((service) => {
      const discoveryInfo = this.serviceDiscovery.get(service.name);

      // Filter by type
      if (criteria.type && service.type !== criteria.type) {
        return false;
      }

      // Filter by capabilities
      if (criteria.capabilities) {
        const serviceCapabilities = service?.getCapabilities()
        const hasAllCapabilities = criteria.capabilities.every((cap) =>
          serviceCapabilities.includes(cap)
        );
        if (!hasAllCapabilities) {
          return false;
        }
      }

      // Filter by health
      if (
        criteria.health &&
        discoveryInfo &&
        discoveryInfo.health !== criteria.health
      ) {
        return false;
      }

      // Filter by tags
      if (criteria.tags && discoveryInfo) {
        const hasAllTags = criteria.tags.every((tag) =>
          discoveryInfo.tags.includes(tag)
        );
        if (!hasAllTags) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get service discovery info (compatible with existing EnhancedServiceRegistry interface)
   */
  getServiceDiscoveryInfo(): Map<string, ServiceDiscoveryInfo> {
    return new Map(this.serviceDiscovery);
  }

  /**
   * Register service for discovery (compatible with existing EnhancedServiceRegistry interface)
   */
  registerServiceForDiscovery(
    service: Service,
    metadata?: Record<string, unknown>
  ): void {
    try {
      const discoveryInfo: ServiceDiscoveryInfo = {
        serviceName: service.name,
        serviceType: service.type,
        version: service.config.version || '1..0',
        capabilities: service?.getCapabilities,
        tags: (service.config as any).tags || [],
        metadata: { ...service.config.metadata, ...metadata },
        lastHeartbeat: new Date(),
        health: 'healthy',
      };

      this.serviceDiscovery.set(service.name, discoveryInfo);

      // Register with ServiceContainer
      const registrationResult = this.container.registerInstance(
        service.name,
        service,
        {
          capabilities: service?.getCapabilities,
          metadata: {
            type: 'service-instance',
            serviceType: service.type,
            discoveryInfo,
            registeredAt: new Date(),
            version: service.config.version || '1..0',
          },
          enabled: true,
          healthCheck: () => this.performServiceHealthCheckSync(service),
        }
      );

      if (registrationResult?.isErr) {
        this.logger.warn(
          `⚠️ Failed to register service with ServiceContainer: ${registrationResult.error.message}`
        );
      }

      this.eventBus.emit('service-discovered', {
        serviceName: service.name,
        discoveryInfo,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `❌ Failed to register service for discovery ${service.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update service heartbeat (compatible with existing EnhancedServiceRegistry interface)
   */
  updateServiceHeartbeat(serviceName: string): void {
    const discoveryInfo = this.serviceDiscovery.get(serviceName);
    if (discoveryInfo) {
      discoveryInfo.lastHeartbeat = new Date();
      this.serviceDiscovery.set(serviceName, discoveryInfo);
    }
  }

  // ============================================
  // Event Handling
  // ============================================

  /**
   * Event handling (compatible with existing EnhancedServiceRegistry interface)
   */
  on(
    event:
      | 'service-registered'
      | 'service-unregistered'
      | 'service-status-changed'
      | string,
    handler: (serviceName: string, service?: Service) => void
  ): void {
    super.on(event, handler);
  }

  off(event: string, handler?: Function): void {
    if (handler) {
      super.off(event, handler);
    } else {
      super.removeAllListeners(event);
    }
  }

  /**
   * Get services by capability (NEW - ServiceContainer enhancement)
   */
  getServicesByCapability(capability: string): Service[] {
    const serviceInfos = this.container.getServicesByCapability(capability);
    const services: Service[] = [];

    for (const serviceInfo of serviceInfos) {
      const result = this.container.resolve<Service>(serviceInfo.name);
      if (result?.isOk) {
        services.push(result.value);
      }
    }

    return services;
  }

  /**
   * Get health status (NEW - ServiceContainer enhancement)
   */
  async getHealthStatus() {
    return await this.container?.getHealthStatus()
  }

  /**
   * Enable/disable service (NEW - ServiceContainer enhancement)
   */
  setServiceEnabled(serviceName: string, enabled: boolean) {
    const result = this.container.setServiceEnabled(serviceName, enabled);

    if (result?.isOk) {
      this.logger.debug(
        `${enabled ? '✅ : ❌'} ${enabled ? 'Enabled : Disabled'} service: ${serviceName}`
      );
      this.eventBus.emit('service-status-changed', {
        serviceName,
        timestamp: new Date(),
      });
    }

    return result?.isOk()
  }

  // ============================================
  // Private Implementation Methods
  // ============================================

  private initializeMonitoring(): void {
    if (this.config.healthMonitoring.enabled) {
      this.startHealthMonitoring;
    }

    if (this.config.metricsCollection.enabled) {
      this.startMetricsCollection;
    }

    if (this.config.discovery.enabled) {
      this.startServiceDiscovery;
    }
  }

  private performFactoryHealthCheck(factory: ServiceFactory): boolean {
    try {
      // Basic health check - more sophisticated checks can be added
      if (typeof factory === 'object' && factory !== null) {
        // Check if factory has health check method
        if (
          'healthCheck' in factory &&
          typeof factory.healthCheck === 'function'
        ) {
          return factory?.healthCheck()
        }

        // Default: assume healthy if factory exists
        return true;
      }

      return false;
    } catch (error) {
      this.logger.warn(`⚠️ Factory health check failed:`, error);
      return false;
    }
  }

  private async performServiceHealthCheck(
    service: Service
  ): Promise<ServiceStatus> {
    const startTime = Date.now();

    try {
      const status = await Promise.race([
        service?.getStatus,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Health check timeout')),
            this.config.healthMonitoring.timeout
          )
        ),
      ]);

      const _responseTime = Date.now() - startTime;

      // Update discovery info health
      const discoveryInfo = this.serviceDiscovery.get(service.name);
      if (discoveryInfo) {
        discoveryInfo.health = status.health as any;
        discoveryInfo.lastHeartbeat = new Date();
      }

      return status;
    } catch (error) {
      throw new ServiceOperationError(
        service.name,
        'health-check',
        error as Error
      );
    }
  }

  private performServiceHealthCheckSync(service: Service): boolean {
    try {
      // Synchronous health check for ServiceContainer
      if (typeof service === 'object' && service !== null) {
        // Check if service has health check method
        if (
          'healthCheck' in service &&
          typeof service.healthCheck === 'function'
        ) {
          const result = service?.healthCheck()
          return result && result.status === 'healthy');
        }

        // Default: assume healthy if service exists
        return true;
      }

      return false;
    } catch (error) {
      this.logger.warn(
        `⚠️ Service health check failed for ${service.name}:`,
        error
      );
      return false;
    }
  }

  private startHealthMonitoring(): void {
    this.healthMonitoringInterval = setInterval(async () => {
      try {
        await this.performSystemHealthCheck;
      } catch (error) {
        this.logger.error('System health check failed:', error);
      }
    }, this.config.healthMonitoring.interval);

    this.logger.debug('Health monitoring started');
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics;
      } catch (error) {
        this.logger.error('Metrics collection failed:', error);
      }
    }, this.config.metricsCollection.interval);

    this.logger.debug('Metrics collection started');
  }

  private startServiceDiscovery(): void {
    this.discoveryInterval = setInterval(() => {
      try {
        this.performServiceDiscoveryMaintenance;
      } catch (error) {
        this.logger.error('Service discovery maintenance failed:', error);
      }
    }, this.config.discovery.advertisementInterval);

    this.logger.debug('Service discovery started');
  }

  private stopMonitoring(): void {
    if (this.healthMonitoringInterval) {
      clearInterval(this.healthMonitoringInterval);
      this.healthMonitoringInterval = undefined;
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = undefined;
    }

    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = undefined;
    }

    this.logger.debug('Monitoring stopped');
  }

  private setupFactoryEventHandling<T extends ServiceConfig>(
    _type: string,
    factory: ServiceFactory<T>
  ): void {
    // Handle service creation events from factory
    if ('on in factory && typeof factory.on === function') {
      factory.on(
        'service-created',
        (_serviceName: string, service: Service) => {
          this.handleServiceRegistration(service);
        }
      );

      factory.on('service-removed', (serviceName: string) => {
        this.removeServiceFromRegistry(serviceName);
      });
    }
  }

  private handleServiceRegistration(service: Service): void {
    this.logger.debug(`Handling service registration: ${service.name}`);

    // Register for discovery
    this.registerServiceForDiscovery(service);

    // Set up service event handling
    this.setupServiceEventHandling(service);

    // Emit registration event
    this.eventBus.emit('service-registered', {
      serviceName: service.name,
      service,
      timestamp: new Date(),
    });
  }

  private setupServiceEventHandling(service: Service): void {
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
        this.handleServiceEvent(service, eventType, event);
      });
    });
  }

  private handleServiceEvent(
    service: Service,
    eventType: ServiceEventType,
    event: ServiceEvent
  ): void {
    // Update discovery info
    this.updateServiceHeartbeat(service.name);

    // Handle specific event types
    switch (eventType) {
      case 'error':
        if (this.config.autoRecovery.enabled) {
          this.scheduleServiceRecovery(service);
        }
        break;

      case 'health-check':
        this.updateServiceHealth(service.name, event.data);
        break;

      case 'metrics-update':
        this.updateServiceMetrics(service.name, event.data);
        break;
    }

    // Emit to registry listeners
    this.eventBus.emit(`service-${eventType}` as any, {
      serviceName: service.name,
      event,
      timestamp: new Date(),
    });
    this.eventBus.emit('service-status-changed', {
      serviceName: service.name,
      service,
      timestamp: new Date(),
    });
  }

  private removeServiceFromRegistry(serviceName: string): void {
    // Disable in ServiceContainer
    this.container.setServiceEnabled(serviceName, false);

    this.services.delete(serviceName);
    this.serviceDiscovery.delete(serviceName);
    this.healthStatuses.delete(serviceName);
    this.metricsHistory.delete(serviceName);
    this.operationMetrics.delete(serviceName);

    this.eventBus.emit('service-unregistered', {
      serviceName,
      timestamp: new Date(),
    });
  }

  private async performSystemHealthCheck(): Promise<void> {
    const healthResults = await this.healthCheckAll;

    // Check for alerts
    const unhealthyServices = Array.from(healthResults?.entries)
      .filter(([_, status]) => status.health !== 'healthy');
      .map(([name, _]) => name);

    if (unhealthyServices.length > 0) {
      this.logger.warn(
        `Unhealthy services detected: ${unhealthyServices.join(', ')}`
      );
      this.eventBus.emit('health-alert', {
        unhealthyServices,
        timestamp: new Date(),
      });
    }

    // Check alert thresholds
    this.checkAlertThresholds(healthResults);
  }

  private checkAlertThresholds(
    healthResults: Map<string, ServiceStatus>
  ): void {
    const totalServices = healthResults.size;
    if (totalServices === 0) return;

    const unhealthyCount = Array.from(healthResults?.values()).filter(
      (status) => status.health !== 'healthy'
    ).length;

    const errorRate = (unhealthyCount / totalServices) * 100;

    if (errorRate > this.config.healthMonitoring.alertThresholds.errorRate) {
      this.eventBus.emit('system-alert', {
        type: 'high-error-rate',
        value: errorRate,
        threshold: this.config.healthMonitoring.alertThresholds.errorRate,
        affectedServices: unhealthyCount,
        timestamp: new Date(),
      });
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    const metrics = await this.getSystemMetrics;

    // Store metrics history
    metrics.aggregatedMetrics.forEach((metric) => {
      if (!this.metricsHistory.has(metric.name)) {
        this.metricsHistory.set(metric.name, []);
      }

      const history = this.metricsHistory.get(metric.name)!;
      history.push(metric);

      // Keep only recent metrics within retention period
      const cutoffTime = new Date(
        Date.now() - this.config.metricsCollection.retention
      );
      const filteredHistory = history.filter((m) => m.timestamp > cutoffTime);
      this.metricsHistory.set(metric.name, filteredHistory);
    });

    this.eventBus.emit('metrics-collected', { metrics, timestamp: new Date() });
  }

  private performServiceDiscoveryMaintenance(): void {
    const currentTime = new Date();
    const timeoutThreshold = this.config.discovery.timeoutThreshold;

    // Check for stale services
    const staleServices: string[] = [];

    this.serviceDiscovery.forEach((info, serviceName) => {
      const timeSinceHeartbeat =
        currentTime?.getTime - info.lastHeartbeat?.getTime()

      if (timeSinceHeartbeat > timeoutThreshold) {
        staleServices.push(serviceName);
      }
    });

    // Remove stale services
    staleServices.forEach((serviceName) => {
      this.logger.warn(`Removing stale service from discovery: ${serviceName}`);
      this.serviceDiscovery.delete(serviceName);
      this.eventBus.emit('service-timeout', {
        serviceName,
        timestamp: new Date(),
      });
    });

    // Emit discovery heartbeat
    this.eventBus.emit('discovery-heartbeat', {
      totalServices: this.serviceDiscovery.size,
      activeServices: this.serviceDiscovery.size - staleServices.length,
      staleServices: staleServices.length,
      timestamp: new Date(currentTime),
    });
  }

  private updateServiceHealth(serviceName: string, healthData: any): void {
    const discoveryInfo = this.serviceDiscovery.get(serviceName);
    if (discoveryInfo && healthData) {
      discoveryInfo.health =
        (healthData as any)?.health || discoveryInfo.health;
      discoveryInfo.lastHeartbeat = new Date();
    }
  }

  private updateServiceMetrics(serviceName: string, metricsData: any): void {
    if (!this.operationMetrics.has(serviceName)) {
      this.operationMetrics.set(serviceName, {
        totalOperations: 0,
        successfulOperations: 0,
        averageLatency: 0,
        lastOperation: new Date(),
      });
    }

    const metrics = this.operationMetrics.get(serviceName)!;
    if (metricsData) {
      metrics.totalOperations += 1;
      if ((metricsData as any)?.success) {
        metrics.successfulOperations += 1;
      }
      metrics.averageLatency =
        (metrics.averageLatency + ((metricsData as any)?.latency || 0)) / 2;
      metrics.lastOperation = new Date();
    }
  }

  private async buildDependencyGraph(): Promise<void> {
    // Implementation for dependency graph building
    this.logger.debug('Building service dependency graph...');

    const allServices = this.getAllServices;
    const nodes = new Map();

    // Build dependency nodes
    for (const [name, service] of allServices) {
      nodes.set(name, {
        service,
        dependencies: new Set(
          service.config.dependencies?.map((dep: any) => dep.serviceName) || []
        ),
        dependents: new Set<string>(),
        level: 0,
      });
    }

    // Calculate dependents and levels
    for (const [nodeName, node] of nodes) {
      for (const depName of node.dependencies) {
        const depNode = nodes.get(depName);
        if (depNode) {
          depNode.dependents.add(nodeName);
        }
      }
    }

    // Create startup/shutdown order
    const startupOrder = this.calculateStartupOrder(nodes);
    const shutdownOrder = [...startupOrder]?.reverse()

    this.dependencyGraph = {
      nodes,
      cycles: [], // TODO: Implement cycle detection
      startupOrder,
      shutdownOrder,
    };

    this.logger.debug(`Dependency graph built with ${nodes.size} services`);
  }

  private calculateStartupOrder(nodes: Map<string, any>): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (nodeName: string) => {
      if (visited.has(nodeName)) return;

      const node = nodes.get(nodeName);
      if (!node) return;

      // Visit dependencies first
      for (const depName of node.dependencies) {
        visit(depName);
      }

      visited.add(nodeName);
      order.push(nodeName);
    };

    // Visit all nodes
    for (const nodeName of nodes?.keys) {
      visit(nodeName);
    }

    return order;
  }

  private async startServicesInOrder(): Promise<void> {
    if (!this.dependencyGraph) {
      throw new Error('Dependency graph not built');
    }

    for (const serviceName of this.dependencyGraph.startupOrder) {
      const service = this.findService(serviceName);
      if (service) {
        try {
          this.logger.debug(`Starting service: ${serviceName}`);
          await service?.start()
        } catch (error) {
          this.logger.error(`Failed to start service ${serviceName}:`, error);
          if (this.config.autoRecovery.enabled) {
            this.scheduleServiceRecovery(service);
          }
        }
      }
    }
  }

  private async stopServicesInOrder(): Promise<void> {
    if (!this.dependencyGraph) {
      throw new Error('Dependency graph not built');
    }

    for (const serviceName of this.dependencyGraph?.shutdownOrder) {
      const service = this.findService(serviceName);
      if (service) {
        try {
          this.logger.debug(`Stopping service: ${serviceName}`);
          await service?.stop()
        } catch (error) {
          this.logger.error(`Failed to stop service ${serviceName}:`, error);
        }
      }
    }
  }

  private async startServicesParallel(): Promise<void> {
    const allServices = this.getAllServices;
    const startPromises = Array.from(allServices?.values()).map(
      async (service) => {
        try {
          await service?.start()
        } catch (error) {
          this.logger.error(`Failed to start service ${service.name}:`, error);
          if (this.config.autoRecovery.enabled) {
            this.scheduleServiceRecovery(service);
          }
        }
      }
    );

    await Promise.allSettled(startPromises);
  }

  private async stopServicesParallel(): Promise<void> {
    const allServices = this.getAllServices;
    const stopPromises = Array.from(allServices?.values()).map(
      async (service) => {
        try {
          await service?.stop()
        } catch (error) {
          this.logger.error(`Failed to stop service ${service.name}:`, error);
        }
      }
    );

    await Promise.allSettled(stopPromises);
  }

  private scheduleServiceRecovery(service: Service): void {
    // Implementation for auto-recovery scheduling
    this.logger.info(`Scheduling recovery for service: ${service.name}`);

    setTimeout(async () => {
      try {
        await this.performServiceRecovery(service);
      } catch (error) {
        this.logger.error(
          `Service recovery failed for ${service.name}:`,
          error
        );
      }
    }, 5000); // 5 second delay before recovery attempt
  }

  private async performServiceRecovery(service: Service): Promise<void> {
    const maxRetries = this.config.autoRecovery.maxRetries;
    const backoffMultiplier = this.config.autoRecovery.backoffMultiplier;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(
          `Recovery attempt ${attempt}/${maxRetries} for service: ${service.name}`
        );

        // Stop and restart the service
        await service?.stop()
        await service?.start()

        // Verify health
        const isHealthy = await service?.healthCheck()
        if (isHealthy) {
          this.logger.info(`Service recovery successful: ${service.name}`);
          this.eventBus.emit('service-recovered', {
            serviceName: service.name,
            timestamp: new Date(),
          });
          return;
        }
      } catch (error) {
        this.logger.warn(
          `Recovery attempt ${attempt} failed for ${service.name}:`,
          error
        );

        if (attempt < maxRetries) {
          const delay = backoffMultiplier ** attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `Service recovery failed after ${maxRetries} attempts: ${service.name}`
    );
    this.eventBus.emit('service-recovery-failed', {
      serviceName: service.name,
      timestamp: new Date(),
    });
  }
}

/**
 * Factory function for creating new instances
 */
export function createServiceRegistry(
  config?: Partial<ServiceRegistryConfig>
): ServiceRegistry {
  return new ServiceRegistry(config);
}

export default ServiceRegistry;
