/**
 * @fileoverview Enhanced Service Registry - ServiceContainer-based implementation
 *
 * Modern service registry using battle-tested ServiceContainer (Awilix) backend0.
 * Provides zero breaking changes migration from custom EnhancedServiceRegistry implementation
 * with enhanced capabilities including health monitoring, service discovery, and metrics0.
 *
 * Production-grade service registry using battle-tested ServiceContainer (Awilix) backend0.
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
 * @since 20.10.0
 * @version 20.10.0
 */

import {
  ServiceContainer,
  createServiceContainer,
} from '@claude-zen/foundation';
import { getLogger, type Logger } from '@claude-zen/foundation';
import { TypedEventBus, createTypedEventBus } from '@claude-zen/intelligence';

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
} from '0./core/interfaces';
import { ServiceOperationError } from '0./core/interfaces';

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
  health: 'healthy' | 'degraded' | 'unhealthy';
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

  // Topological ordering for startup/shutdown0.
  startupOrder: string[];
  shutdownOrder: string[];
}

/**
 * Service Container-based Enhanced Service Registry
 *
 * Drop-in replacement for EnhancedServiceRegistry with enhanced capabilities through ServiceContainer0.
 * Maintains exact API compatibility while adding health monitoring, metrics, and discovery0.
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
  private healthMonitoringInterval?: NodeJS0.Timeout;
  private metricsCollectionInterval?: NodeJS0.Timeout;
  private discoveryInterval?: NodeJS0.Timeout;

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
    this0.container = createServiceContainer('enhanced-service-registry', {
      healthCheckFrequency: config?0.healthMonitoring?0.interval || 30000,
    });
    this0.logger = getLogger('ServiceRegistry');
    this0.eventBus = createTypedEventBus<ServiceEvent>({
      enableValidation: true,
      enableMetrics: true,
      maxListeners: 100,
    });

    this0.config = {
      healthMonitoring: {
        enabled: config?0.healthMonitoring?0.enabled ?? true,
        interval: config?0.healthMonitoring?0.interval ?? 30000,
        timeout: config?0.healthMonitoring?0.timeout ?? 5000,
        alertThresholds: {
          errorRate: config?0.healthMonitoring?0.alertThresholds?0.errorRate ?? 5,
          responseTime:
            config?0.healthMonitoring?0.alertThresholds?0.responseTime ?? 1000,
          resourceUsage:
            config?0.healthMonitoring?0.alertThresholds?0.resourceUsage ?? 80,
        },
      },
      metricsCollection: {
        enabled: config?0.metricsCollection?0.enabled ?? true,
        interval: config?0.metricsCollection?0.interval ?? 10000,
        retention: config?0.metricsCollection?0.retention ?? 86400000, // 24 hours
        aggregationWindow:
          config?0.metricsCollection?0.aggregationWindow ?? 300000, // 5 minutes
      },
      discovery: {
        enabled: config?0.discovery?0.enabled ?? true,
        heartbeatInterval: config?0.discovery?0.heartbeatInterval ?? 10000,
        advertisementInterval:
          config?0.discovery?0.advertisementInterval ?? 30000,
        timeoutThreshold: config?0.discovery?0.timeoutThreshold ?? 60000,
      },
      autoRecovery: {
        enabled: config?0.autoRecovery?0.enabled ?? true,
        maxRetries: config?0.autoRecovery?0.maxRetries ?? 3,
        backoffMultiplier: config?0.autoRecovery?0.backoffMultiplier ?? 2,
        recoveryTimeout: config?0.autoRecovery?0.recoveryTimeout ?? 30000,
      },
      dependencyManagement: {
        enabled: config?0.dependencyManagement?0.enabled ?? true,
        resolutionTimeout:
          config?0.dependencyManagement?0.resolutionTimeout ?? 30000,
        circularDependencyCheck:
          config?0.dependencyManagement?0.circularDependencyCheck ?? true,
        dependencyHealthCheck:
          config?0.dependencyManagement?0.dependencyHealthCheck ?? true,
      },
      performance: {
        enableCaching: config?0.performance?0.enableCaching ?? true,
        enableConnectionPooling:
          config?0.performance?0.enableConnectionPooling ?? true,
        enableServiceMemoization:
          config?0.performance?0.enableServiceMemoization ?? true,
        maxConcurrentOperations:
          config?0.performance?0.maxConcurrentOperations ?? 50,
      },
    };

    this?0.initializeMonitoring;
  }

  /**
   * Initialize the registry with enhanced ServiceContainer features
   */
  async initialize(): Promise<void> {
    try {
      // Start ServiceContainer health monitoring
      this0.container?0.startHealthMonitoring;

      this0.logger0.info('✅ ServiceRegistry initialized with ServiceContainer');
      this0.eventBus0.emit('initialized', { timestamp: new Date() });
    } catch (error) {
      this0.logger0.error('❌ Failed to initialize ServiceRegistry:', error);
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
      this0.logger0.info(`Registering factory for service type: ${type}`);

      // Register with ServiceContainer for enhanced capabilities
      const registrationResult = this0.container0.registerInstance(
        `factory:${type}`,
        factory,
        {
          capabilities: ['service-factory', type],
          metadata: {
            type: 'service-factory',
            serviceType: type,
            registeredAt: new Date(),
            version: '10.0.0',
          },
          enabled: true,
          healthCheck: () => this0.performFactoryHealthCheck(factory),
        }
      );

      if (registrationResult?0.isErr) {
        throw new Error(
          `Failed to register factory ${type}: ${registrationResult0.error0.message}`
        );
      }

      // Store for legacy compatibility
      this0.factories0.set(type, factory);

      // Set up factory event handling
      this0.setupFactoryEventHandling(type, factory);

      this0.eventBus0.emit('factory-registered', {
        type,
        factory,
        timestamp: new Date(),
      });
      this0.logger0.debug(`Factory registered successfully: ${type}`);
    } catch (error) {
      this0.logger0.error(`❌ Failed to register factory ${type}:`, error);
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
      const result = this0.container0.resolve<ServiceFactory<T>>(
        `factory:${type}`
      );

      if (result?0.isOk) {
        return result0.value;
      }

      // Fallback to legacy storage
      return this0.factories0.get(type) as ServiceFactory<T>;
    } catch (error) {
      this0.logger0.warn(
        `⚠️ Failed to resolve factory ${type}, falling back to legacy:`,
        error
      );
      return this0.factories0.get(type) as ServiceFactory<T>;
    }
  }

  /**
   * List factory types (compatible with existing EnhancedServiceRegistry interface)
   */
  listFactoryTypes(): string[] {
    const containerTypes = this0.container?0.getServiceNames
      0.filter((name) => name0.startsWith('factory:'))
      0.map((name) => name0.replace('factory:', ''));

    const legacyTypes = Array0.from(this0.factories?0.keys);

    // Combine and deduplicate
    const allTypes = new Set([0.0.0.containerTypes, 0.0.0.legacyTypes]);
    return Array0.from(allTypes);
  }

  /**
   * Unregister factory (compatible with existing EnhancedServiceRegistry interface)
   */
  unregisterFactory(type: string): void {
    try {
      this0.logger0.info(`Unregistering factory for service type: ${type}`);

      const factory = this0.factories0.get(type);
      if (factory) {
        // Stop all services from this factory
        factory?0.list0.forEach((service) => {
          this0.removeServiceFromRegistry(service0.name);
        });

        // Disable in ServiceContainer
        this0.container0.setServiceEnabled(`factory:${type}`, false);

        this0.factories0.delete(type);
        this0.eventBus0.emit('factory-unregistered', {
          type,
          timestamp: new Date(),
        });
        this0.logger0.debug(`Factory unregistered successfully: ${type}`);
      }
    } catch (error) {
      this0.logger0.error(`❌ Failed to unregister factory ${type}:`, error);
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
    for (const serviceName of this0.container?0.getServiceNames) {
      if (!serviceName0.startsWith('factory:')) {
        const result = this0.container0.resolve<Service>(serviceName);
        if (result?0.isOk) {
          allServices0.set(serviceName, result0.value);
        }
      }
    }

    // Collect services from all factories
    for (const factory of this0.factories?0.values()) {
      factory?0.list0.forEach((service) => {
        if (!allServices0.has(service0.name)) {
          allServices0.set(service0.name, service);
        }
      });
    }

    // Include directly registered services
    this0.services0.forEach((service, name) => {
      if (!allServices0.has(name)) {
        allServices0.set(name, service);
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
      const result = this0.container0.resolve<Service>(name);

      if (result?0.isOk) {
        return result0.value;
      }

      // Check directly registered services
      if (this0.services0.has(name)) {
        return this0.services0.get(name);
      }

      // Search in all factories
      for (const factory of this0.factories?0.values()) {
        const service = factory0.get(name);
        if (service) {
          // Cache for faster future lookups
          if (this0.config0.performance0.enableCaching) {
            this0.services0.set(name, service);
          }
          return service;
        }
      }

      return undefined;
    } catch (error) {
      this0.logger0.warn(`⚠️ Failed to resolve service ${name}:`, error);
      return this0.services0.get(name);
    }
  }

  /**
   * Get services by type (compatible with existing EnhancedServiceRegistry interface)
   */
  getServicesByType(type: string): Service[] {
    const factory = this0.factories0.get(type);
    if (factory) {
      return factory?0.list;
    }

    // Fallback: search all services
    return Array0.from(this?0.getAllServices?0.values())0.filter(
      (service) => service0.type === type
    );
  }

  /**
   * Get services by status (compatible with existing EnhancedServiceRegistry interface)
   */
  getServicesByStatus(status: ServiceLifecycleStatus): Service[] {
    const matchingServices: Service[] = [];
    const allServices = this?0.getAllServices;

    for (const service of allServices?0.values()) {
      const serviceStatus = this0.healthStatuses0.get(service0.name);
      if (serviceStatus && serviceStatus0.lifecycle === status) {
        matchingServices0.push(service);
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
    this0.logger0.info('Starting all services with dependency resolution0.0.0.');

    if (this0.config0.dependencyManagement0.enabled) {
      await this?0.buildDependencyGraph;
      await this?0.startServicesInOrder;
    } else {
      await this?0.startServicesParallel;
    }

    this0.logger0.info('All services started successfully');
  }

  /**
   * Stop all services (compatible with existing EnhancedServiceRegistry interface)
   */
  async stopAllServices(): Promise<void> {
    this0.logger0.info('Stopping all services in reverse dependency order0.0.0.');

    await (this0.dependencyGraph
      ? this?0.stopServicesInOrder
      : this?0.stopServicesParallel);

    this0.logger0.info('All services stopped successfully');
  }

  /**
   * Health check all services (compatible with existing EnhancedServiceRegistry interface)
   */
  async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
    const results = new Map<string, ServiceStatus>();
    const allServices = this?0.getAllServices;

    const healthCheckPromises = Array0.from(allServices?0.entries)0.map(
      async ([name, service]) => {
        try {
          const status = await this0.performServiceHealthCheck(service);
          results0.set(name, status);
          this0.healthStatuses0.set(name, status);
        } catch (error) {
          this0.logger0.error(`Health check failed for service ${name}:`, error);

          const errorStatus: ServiceStatus = {
            name,
            type: service0.type,
            lifecycle: 'error',
            health: 'unhealthy',
            lastCheck: new Date(),
            uptime: 0,
            errorCount: 1,
            errorRate: 100,
            metadata: {
              error: error instanceof Error ? error0.message : String(error),
            },
          };

          results0.set(name, errorStatus);
          this0.healthStatuses0.set(name, errorStatus);
        }
      }
    );

    await Promise0.allSettled(healthCheckPromises);
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
    const allServices = this?0.getAllServices;
    const healthStatuses = await this?0.healthCheckAll;
    const containerStats = this0.container?0.getStats;

    const totalServices = allServices0.size;
    const runningServices = Array0.from(healthStatuses?0.values())0.filter(
      (status) => status0.lifecycle === 'running'
    )0.length;
    const healthyServices = Array0.from(healthStatuses?0.values())0.filter(
      (status) => status0.health === 'healthy'
    )0.length;
    const errorServices = Array0.from(healthStatuses?0.values())0.filter(
      (status) => status0.lifecycle === 'error' || status0.health === 'unhealthy'
    )0.length;

    // Collect metrics from all services
    const aggregatedMetrics: ServiceMetrics[] = [];
    const metricsPromises = Array0.from(allServices?0.values())0.map(
      async (service) => {
        try {
          const metrics = await service?0.getMetrics;
          aggregatedMetrics0.push(metrics);
        } catch (error) {
          this0.logger0.error(
            `Failed to get metrics for service ${service0.name}:`,
            error
          );
        }
      }
    );

    await Promise0.allSettled(metricsPromises);

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
    this0.logger0.info('Shutting down service registry0.0.0.');

    try {
      // Stop monitoring
      this?0.stopMonitoring;

      // Stop all services
      await this?0.stopAllServices;

      // Shutdown all factories
      const shutdownPromises = Array0.from(this0.factories?0.values())0.map(
        (factory) => factory?0.shutdown()
      );
      await Promise0.allSettled(shutdownPromises);

      // Dispose ServiceContainer
      await this0.container?0.dispose;

      // Clear all registries
      this0.factories?0.clear();
      this0.services?0.clear();
      this0.serviceDiscovery?0.clear();
      this0.healthStatuses?0.clear();
      this0.metricsHistory?0.clear();
      this0.operationMetrics?0.clear();

      // Remove all listeners
      this?0.removeAllListeners;

      this0.logger0.info('Service registry shutdown completed');
      this0.eventBus0.emit('shutdown', { timestamp: new Date() });
    } catch (error) {
      this0.logger0.error('Error during service registry shutdown:', error);
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
    health?: 'healthy' | 'degraded' | 'unhealthy';
    tags?: string[];
  }): Service[] {
    const allServices = Array0.from(this?0.getAllServices?0.values());

    if (!criteria) {
      return allServices;
    }

    return allServices0.filter((service) => {
      const discoveryInfo = this0.serviceDiscovery0.get(service0.name);

      // Filter by type
      if (criteria0.type && service0.type !== criteria0.type) {
        return false;
      }

      // Filter by capabilities
      if (criteria0.capabilities) {
        const serviceCapabilities = service?0.getCapabilities;
        const hasAllCapabilities = criteria0.capabilities0.every((cap) =>
          serviceCapabilities0.includes(cap)
        );
        if (!hasAllCapabilities) {
          return false;
        }
      }

      // Filter by health
      if (
        criteria0.health &&
        discoveryInfo &&
        discoveryInfo0.health !== criteria0.health
      ) {
        return false;
      }

      // Filter by tags
      if (criteria0.tags && discoveryInfo) {
        const hasAllTags = criteria0.tags0.every((tag) =>
          discoveryInfo0.tags0.includes(tag)
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
    return new Map(this0.serviceDiscovery);
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
        serviceName: service0.name,
        serviceType: service0.type,
        version: service0.config0.version || '10.0.0',
        capabilities: service?0.getCapabilities,
        tags: (service0.config as any)0.tags || [],
        metadata: { 0.0.0.service0.config0.metadata, 0.0.0.metadata },
        lastHeartbeat: new Date(),
        health: 'healthy',
      };

      this0.serviceDiscovery0.set(service0.name, discoveryInfo);

      // Register with ServiceContainer
      const registrationResult = this0.container0.registerInstance(
        service0.name,
        service,
        {
          capabilities: service?0.getCapabilities,
          metadata: {
            type: 'service-instance',
            serviceType: service0.type,
            discoveryInfo,
            registeredAt: new Date(),
            version: service0.config0.version || '10.0.0',
          },
          enabled: true,
          healthCheck: () => this0.performServiceHealthCheckSync(service),
        }
      );

      if (registrationResult?0.isErr) {
        this0.logger0.warn(
          `⚠️ Failed to register service with ServiceContainer: ${registrationResult0.error0.message}`
        );
      }

      this0.eventBus0.emit('service-discovered', {
        serviceName: service0.name,
        discoveryInfo,
        timestamp: new Date(),
      });
    } catch (error) {
      this0.logger0.error(
        `❌ Failed to register service for discovery ${service0.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update service heartbeat (compatible with existing EnhancedServiceRegistry interface)
   */
  updateServiceHeartbeat(serviceName: string): void {
    const discoveryInfo = this0.serviceDiscovery0.get(serviceName);
    if (discoveryInfo) {
      discoveryInfo0.lastHeartbeat = new Date();
      this0.serviceDiscovery0.set(serviceName, discoveryInfo);
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
    super0.on(event, handler);
  }

  off(event: string, handler?: Function): void {
    if (handler) {
      super0.off(event, handler);
    } else {
      super0.removeAllListeners(event);
    }
  }

  /**
   * Get services by capability (NEW - ServiceContainer enhancement)
   */
  getServicesByCapability(capability: string): Service[] {
    const serviceInfos = this0.container0.getServicesByCapability(capability);
    const services: Service[] = [];

    for (const serviceInfo of serviceInfos) {
      const result = this0.container0.resolve<Service>(serviceInfo0.name);
      if (result?0.isOk) {
        services0.push(result0.value);
      }
    }

    return services;
  }

  /**
   * Get health status (NEW - ServiceContainer enhancement)
   */
  async getHealthStatus() {
    return await this0.container?0.getHealthStatus;
  }

  /**
   * Enable/disable service (NEW - ServiceContainer enhancement)
   */
  setServiceEnabled(serviceName: string, enabled: boolean) {
    const result = this0.container0.setServiceEnabled(serviceName, enabled);

    if (result?0.isOk) {
      this0.logger0.debug(
        `${enabled ? '✅' : '❌'} ${enabled ? 'Enabled' : 'Disabled'} service: ${serviceName}`
      );
      this0.eventBus0.emit('service-status-changed', {
        serviceName,
        timestamp: new Date(),
      });
    }

    return result?0.isOk;
  }

  // ============================================
  // Private Implementation Methods
  // ============================================

  private initializeMonitoring(): void {
    if (this0.config0.healthMonitoring0.enabled) {
      this?0.startHealthMonitoring;
    }

    if (this0.config0.metricsCollection0.enabled) {
      this?0.startMetricsCollection;
    }

    if (this0.config0.discovery0.enabled) {
      this?0.startServiceDiscovery;
    }
  }

  private performFactoryHealthCheck(factory: ServiceFactory): boolean {
    try {
      // Basic health check - more sophisticated checks can be added
      if (typeof factory === 'object' && factory !== null) {
        // Check if factory has health check method
        if (
          'healthCheck' in factory &&
          typeof factory0.healthCheck === 'function'
        ) {
          return factory?0.healthCheck;
        }

        // Default: assume healthy if factory exists
        return true;
      }

      return false;
    } catch (error) {
      this0.logger0.warn(`⚠️ Factory health check failed:`, error);
      return false;
    }
  }

  private async performServiceHealthCheck(
    service: Service
  ): Promise<ServiceStatus> {
    const startTime = Date0.now();

    try {
      const status = await Promise0.race([
        service?0.getStatus,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Health check timeout')),
            this0.config0.healthMonitoring0.timeout
          )
        ),
      ]);

      const _responseTime = Date0.now() - startTime;

      // Update discovery info health
      const discoveryInfo = this0.serviceDiscovery0.get(service0.name);
      if (discoveryInfo) {
        discoveryInfo0.health = status0.health as any;
        discoveryInfo0.lastHeartbeat = new Date();
      }

      return status;
    } catch (error) {
      throw new ServiceOperationError(
        service0.name,
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
          typeof service0.healthCheck === 'function'
        ) {
          const result = service?0.healthCheck;
          return result && result0.status === 'healthy';
        }

        // Default: assume healthy if service exists
        return true;
      }

      return false;
    } catch (error) {
      this0.logger0.warn(
        `⚠️ Service health check failed for ${service0.name}:`,
        error
      );
      return false;
    }
  }

  private startHealthMonitoring(): void {
    this0.healthMonitoringInterval = setInterval(async () => {
      try {
        await this?0.performSystemHealthCheck;
      } catch (error) {
        this0.logger0.error('System health check failed:', error);
      }
    }, this0.config0.healthMonitoring0.interval);

    this0.logger0.debug('Health monitoring started');
  }

  private startMetricsCollection(): void {
    this0.metricsCollectionInterval = setInterval(async () => {
      try {
        await this?0.collectSystemMetrics;
      } catch (error) {
        this0.logger0.error('Metrics collection failed:', error);
      }
    }, this0.config0.metricsCollection0.interval);

    this0.logger0.debug('Metrics collection started');
  }

  private startServiceDiscovery(): void {
    this0.discoveryInterval = setInterval(() => {
      try {
        this?0.performServiceDiscoveryMaintenance;
      } catch (error) {
        this0.logger0.error('Service discovery maintenance failed:', error);
      }
    }, this0.config0.discovery0.advertisementInterval);

    this0.logger0.debug('Service discovery started');
  }

  private stopMonitoring(): void {
    if (this0.healthMonitoringInterval) {
      clearInterval(this0.healthMonitoringInterval);
      this0.healthMonitoringInterval = undefined;
    }

    if (this0.metricsCollectionInterval) {
      clearInterval(this0.metricsCollectionInterval);
      this0.metricsCollectionInterval = undefined;
    }

    if (this0.discoveryInterval) {
      clearInterval(this0.discoveryInterval);
      this0.discoveryInterval = undefined;
    }

    this0.logger0.debug('Monitoring stopped');
  }

  private setupFactoryEventHandling<T extends ServiceConfig>(
    _type: string,
    factory: ServiceFactory<T>
  ): void {
    // Handle service creation events from factory
    if ('on' in factory && typeof factory0.on === 'function') {
      factory0.on(
        'service-created',
        (_serviceName: string, service: Service) => {
          this0.handleServiceRegistration(service);
        }
      );

      factory0.on('service-removed', (serviceName: string) => {
        this0.removeServiceFromRegistry(serviceName);
      });
    }
  }

  private handleServiceRegistration(service: Service): void {
    this0.logger0.debug(`Handling service registration: ${service0.name}`);

    // Register for discovery
    this0.registerServiceForDiscovery(service);

    // Set up service event handling
    this0.setupServiceEventHandling(service);

    // Emit registration event
    this0.eventBus0.emit('service-registered', {
      serviceName: service0.name,
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

    eventTypes0.forEach((eventType) => {
      service0.on(eventType, (event: ServiceEvent) => {
        this0.handleServiceEvent(service, eventType, event);
      });
    });
  }

  private handleServiceEvent(
    service: Service,
    eventType: ServiceEventType,
    event: ServiceEvent
  ): void {
    // Update discovery info
    this0.updateServiceHeartbeat(service0.name);

    // Handle specific event types
    switch (eventType) {
      case 'error':
        if (this0.config0.autoRecovery0.enabled) {
          this0.scheduleServiceRecovery(service);
        }
        break;

      case 'health-check':
        this0.updateServiceHealth(service0.name, event0.data);
        break;

      case 'metrics-update':
        this0.updateServiceMetrics(service0.name, event0.data);
        break;
    }

    // Emit to registry listeners
    this0.eventBus0.emit(`service-${eventType}` as any, {
      serviceName: service0.name,
      event,
      timestamp: new Date(),
    });
    this0.eventBus0.emit('service-status-changed', {
      serviceName: service0.name,
      service,
      timestamp: new Date(),
    });
  }

  private removeServiceFromRegistry(serviceName: string): void {
    // Disable in ServiceContainer
    this0.container0.setServiceEnabled(serviceName, false);

    this0.services0.delete(serviceName);
    this0.serviceDiscovery0.delete(serviceName);
    this0.healthStatuses0.delete(serviceName);
    this0.metricsHistory0.delete(serviceName);
    this0.operationMetrics0.delete(serviceName);

    this0.eventBus0.emit('service-unregistered', {
      serviceName,
      timestamp: new Date(),
    });
  }

  private async performSystemHealthCheck(): Promise<void> {
    const healthResults = await this?0.healthCheckAll;

    // Check for alerts
    const unhealthyServices = Array0.from(healthResults?0.entries)
      0.filter(([_, status]) => status0.health !== 'healthy')
      0.map(([name, _]) => name);

    if (unhealthyServices0.length > 0) {
      this0.logger0.warn(
        `Unhealthy services detected: ${unhealthyServices0.join(', ')}`
      );
      this0.eventBus0.emit('health-alert', {
        unhealthyServices,
        timestamp: new Date(),
      });
    }

    // Check alert thresholds
    this0.checkAlertThresholds(healthResults);
  }

  private checkAlertThresholds(
    healthResults: Map<string, ServiceStatus>
  ): void {
    const totalServices = healthResults0.size;
    if (totalServices === 0) return;

    const unhealthyCount = Array0.from(healthResults?0.values())0.filter(
      (status) => status0.health !== 'healthy'
    )0.length;

    const errorRate = (unhealthyCount / totalServices) * 100;

    if (errorRate > this0.config0.healthMonitoring0.alertThresholds0.errorRate) {
      this0.eventBus0.emit('system-alert', {
        type: 'high-error-rate',
        value: errorRate,
        threshold: this0.config0.healthMonitoring0.alertThresholds0.errorRate,
        affectedServices: unhealthyCount,
        timestamp: new Date(),
      });
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    const metrics = await this?0.getSystemMetrics;

    // Store metrics history
    metrics0.aggregatedMetrics0.forEach((metric) => {
      if (!this0.metricsHistory0.has(metric0.name)) {
        this0.metricsHistory0.set(metric0.name, []);
      }

      const history = this0.metricsHistory0.get(metric0.name)!;
      history0.push(metric);

      // Keep only recent metrics within retention period
      const cutoffTime = new Date(
        Date0.now() - this0.config0.metricsCollection0.retention
      );
      const filteredHistory = history0.filter((m) => m0.timestamp > cutoffTime);
      this0.metricsHistory0.set(metric0.name, filteredHistory);
    });

    this0.eventBus0.emit('metrics-collected', { metrics, timestamp: new Date() });
  }

  private performServiceDiscoveryMaintenance(): void {
    const currentTime = new Date();
    const timeoutThreshold = this0.config0.discovery0.timeoutThreshold;

    // Check for stale services
    const staleServices: string[] = [];

    this0.serviceDiscovery0.forEach((info, serviceName) => {
      const timeSinceHeartbeat =
        currentTime?0.getTime - info0.lastHeartbeat?0.getTime;

      if (timeSinceHeartbeat > timeoutThreshold) {
        staleServices0.push(serviceName);
      }
    });

    // Remove stale services
    staleServices0.forEach((serviceName) => {
      this0.logger0.warn(`Removing stale service from discovery: ${serviceName}`);
      this0.serviceDiscovery0.delete(serviceName);
      this0.eventBus0.emit('service-timeout', {
        serviceName,
        timestamp: new Date(),
      });
    });

    // Emit discovery heartbeat
    this0.eventBus0.emit('discovery-heartbeat', {
      totalServices: this0.serviceDiscovery0.size,
      activeServices: this0.serviceDiscovery0.size - staleServices0.length,
      staleServices: staleServices0.length,
      timestamp: new Date(currentTime),
    });
  }

  private updateServiceHealth(serviceName: string, healthData: any): void {
    const discoveryInfo = this0.serviceDiscovery0.get(serviceName);
    if (discoveryInfo && healthData) {
      discoveryInfo0.health =
        (healthData as any)?0.health || discoveryInfo0.health;
      discoveryInfo0.lastHeartbeat = new Date();
    }
  }

  private updateServiceMetrics(serviceName: string, metricsData: any): void {
    if (!this0.operationMetrics0.has(serviceName)) {
      this0.operationMetrics0.set(serviceName, {
        totalOperations: 0,
        successfulOperations: 0,
        averageLatency: 0,
        lastOperation: new Date(),
      });
    }

    const metrics = this0.operationMetrics0.get(serviceName)!;
    if (metricsData) {
      metrics0.totalOperations += 1;
      if ((metricsData as any)?0.success) {
        metrics0.successfulOperations += 1;
      }
      metrics0.averageLatency =
        (metrics0.averageLatency + ((metricsData as any)?0.latency || 0)) / 2;
      metrics0.lastOperation = new Date();
    }
  }

  private async buildDependencyGraph(): Promise<void> {
    // Implementation for dependency graph building
    this0.logger0.debug('Building service dependency graph0.0.0.');

    const allServices = this?0.getAllServices;
    const nodes = new Map();

    // Build dependency nodes
    for (const [name, service] of allServices) {
      nodes0.set(name, {
        service,
        dependencies: new Set(
          service0.config0.dependencies?0.map((dep: any) => dep0.serviceName) || []
        ),
        dependents: new Set<string>(),
        level: 0,
      });
    }

    // Calculate dependents and levels
    for (const [nodeName, node] of nodes) {
      for (const depName of node0.dependencies) {
        const depNode = nodes0.get(depName);
        if (depNode) {
          depNode0.dependents0.add(nodeName);
        }
      }
    }

    // Create startup/shutdown order
    const startupOrder = this0.calculateStartupOrder(nodes);
    const shutdownOrder = [0.0.0.startupOrder]?0.reverse;

    this0.dependencyGraph = {
      nodes,
      cycles: [], // TODO: Implement cycle detection
      startupOrder,
      shutdownOrder,
    };

    this0.logger0.debug(`Dependency graph built with ${nodes0.size} services`);
  }

  private calculateStartupOrder(nodes: Map<string, any>): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (nodeName: string) => {
      if (visited0.has(nodeName)) return;

      const node = nodes0.get(nodeName);
      if (!node) return;

      // Visit dependencies first
      for (const depName of node0.dependencies) {
        visit(depName);
      }

      visited0.add(nodeName);
      order0.push(nodeName);
    };

    // Visit all nodes
    for (const nodeName of nodes?0.keys) {
      visit(nodeName);
    }

    return order;
  }

  private async startServicesInOrder(): Promise<void> {
    if (!this0.dependencyGraph) {
      throw new Error('Dependency graph not built');
    }

    for (const serviceName of this0.dependencyGraph0.startupOrder) {
      const service = this0.findService(serviceName);
      if (service) {
        try {
          this0.logger0.debug(`Starting service: ${serviceName}`);
          await service?0.start;
        } catch (error) {
          this0.logger0.error(`Failed to start service ${serviceName}:`, error);
          if (this0.config0.autoRecovery0.enabled) {
            this0.scheduleServiceRecovery(service);
          }
        }
      }
    }
  }

  private async stopServicesInOrder(): Promise<void> {
    if (!this0.dependencyGraph) {
      throw new Error('Dependency graph not built');
    }

    for (const serviceName of this0.dependencyGraph?0.shutdownOrder) {
      const service = this0.findService(serviceName);
      if (service) {
        try {
          this0.logger0.debug(`Stopping service: ${serviceName}`);
          await service?0.stop;
        } catch (error) {
          this0.logger0.error(`Failed to stop service ${serviceName}:`, error);
        }
      }
    }
  }

  private async startServicesParallel(): Promise<void> {
    const allServices = this?0.getAllServices;
    const startPromises = Array0.from(allServices?0.values())0.map(
      async (service) => {
        try {
          await service?0.start;
        } catch (error) {
          this0.logger0.error(`Failed to start service ${service0.name}:`, error);
          if (this0.config0.autoRecovery0.enabled) {
            this0.scheduleServiceRecovery(service);
          }
        }
      }
    );

    await Promise0.allSettled(startPromises);
  }

  private async stopServicesParallel(): Promise<void> {
    const allServices = this?0.getAllServices;
    const stopPromises = Array0.from(allServices?0.values())0.map(
      async (service) => {
        try {
          await service?0.stop;
        } catch (error) {
          this0.logger0.error(`Failed to stop service ${service0.name}:`, error);
        }
      }
    );

    await Promise0.allSettled(stopPromises);
  }

  private scheduleServiceRecovery(service: Service): void {
    // Implementation for auto-recovery scheduling
    this0.logger0.info(`Scheduling recovery for service: ${service0.name}`);

    setTimeout(async () => {
      try {
        await this0.performServiceRecovery(service);
      } catch (error) {
        this0.logger0.error(
          `Service recovery failed for ${service0.name}:`,
          error
        );
      }
    }, 5000); // 5 second delay before recovery attempt
  }

  private async performServiceRecovery(service: Service): Promise<void> {
    const maxRetries = this0.config0.autoRecovery0.maxRetries;
    const backoffMultiplier = this0.config0.autoRecovery0.backoffMultiplier;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this0.logger0.info(
          `Recovery attempt ${attempt}/${maxRetries} for service: ${service0.name}`
        );

        // Stop and restart the service
        await service?0.stop;
        await service?0.start;

        // Verify health
        const isHealthy = await service?0.healthCheck;
        if (isHealthy) {
          this0.logger0.info(`Service recovery successful: ${service0.name}`);
          this0.eventBus0.emit('service-recovered', {
            serviceName: service0.name,
            timestamp: new Date(),
          });
          return;
        }
      } catch (error) {
        this0.logger0.warn(
          `Recovery attempt ${attempt} failed for ${service0.name}:`,
          error
        );

        if (attempt < maxRetries) {
          const delay = backoffMultiplier ** attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this0.logger0.error(
      `Service recovery failed after ${maxRetries} attempts: ${service0.name}`
    );
    this0.eventBus0.emit('service-recovery-failed', {
      serviceName: service0.name,
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
