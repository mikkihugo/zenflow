/**
 * USL Service Registry - Complete Service Management System.
 *
 * Advanced service registry providing comprehensive service management,
 * health monitoring, lifecycle orchestration, and service discovery.
 * Following the same patterns as UACL Agent 6.
 */
/**
 * @file Interface implementation: registry.
 */

import { EventEmitter } from 'node:events';
import { getLogger, type Logger } from '../../config/logging-config.ts';
import type {
  IService,
  IServiceFactory,
  IServiceRegistry,
  ServiceConfig,
  ServiceEvent,
  ServiceEventType,
  ServiceLifecycleStatus,
  ServiceMetrics,
  ServiceStatus,
} from './core/interfaces.ts';
import { ServiceOperationError } from './core/interfaces.ts';

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
      service: IService;
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
 * Enhanced Service Registry with comprehensive service management capabilities.
 *
 * @example
 */
export class EnhancedServiceRegistry
  extends EventEmitter
  implements IServiceRegistry
{
  private factories = new Map<string, IServiceFactory>();
  private services = new Map<string, IService>();
  private serviceDiscovery = new Map<string, ServiceDiscoveryInfo>();
  private dependencyGraph: ServiceDependencyGraph | null = null;
  private healthStatuses = new Map<string, ServiceStatus>();
  private metricsHistory = new Map<string, ServiceMetrics[]>();
  private config: ServiceRegistryConfig;
  private logger: Logger;

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
    super();
    this.logger = getLogger('EnhancedServiceRegistry');

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

    this.initializeMonitoring();
  }

  // ============================================
  // Factory Registration and Management
  // ============================================

  registerFactory<T extends ServiceConfig>(
    type: string,
    factory: IServiceFactory<T>
  ): void {
    this.logger.info(`Registering factory for service type: ${type}`);

    this.factories.set(type, factory);

    // Set up factory event handling
    this.setupFactoryEventHandling(type, factory);

    this.emit('factory-registered', type, factory);
    this.logger.debug(`Factory registered successfully: ${type}`);
  }

  getFactory<T extends ServiceConfig>(
    type: string
  ): IServiceFactory<T> | undefined {
    return this.factories.get(type) as IServiceFactory<T>;
  }

  listFactoryTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  unregisterFactory(type: string): void {
    this.logger.info(`Unregistering factory for service type: ${type}`);

    const factory = this.factories.get(type);
    if (factory) {
      // Stop all services from this factory
      factory.list().forEach((service) => {
        this.removeServiceFromRegistry(service.name);
      });

      this.factories.delete(type);
      this.emit('factory-unregistered', type);
      this.logger.debug(`Factory unregistered successfully: ${type}`);
    }
  }

  // ============================================
  // Service Management and Discovery
  // ============================================

  getAllServices(): Map<string, IService> {
    const allServices = new Map<string, IService>();

    // Collect services from all factories
    for (const factory of this.factories.values()) {
      factory.list().forEach((service) => {
        allServices.set(service.name, service);
      });
    }

    // Include directly registered services
    this.services.forEach((service, name) => {
      allServices.set(name, service);
    });

    return allServices;
  }

  findService(name: string): IService | undefined {
    // Check directly registered services first
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Search in all factories
    for (const factory of this.factories.values()) {
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
  }

  getServicesByType(type: string): IService[] {
    const factory = this.factories.get(type);
    if (factory) {
      return factory.list();
    }

    // Fallback: search all services
    return Array.from(this.getAllServices().values()).filter(
      (service) => service.type === type
    );
  }

  getServicesByStatus(status: ServiceLifecycleStatus): IService[] {
    const matchingServices: IService[] = [];
    const allServices = this.getAllServices();

    for (const service of allServices.values()) {
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

  async startAllServices(): Promise<void> {
    this.logger.info('Starting all services with dependency resolution...');

    if (this.config.dependencyManagement.enabled) {
      await this.buildDependencyGraph();
      await this.startServicesInOrder();
    } else {
      await this.startServicesParallel();
    }

    this.logger.info('All services started successfully');
  }

  async stopAllServices(): Promise<void> {
    this.logger.info('Stopping all services in reverse dependency order...');

    if (this.dependencyGraph) {
      await this.stopServicesInOrder();
    } else {
      await this.stopServicesParallel();
    }

    this.logger.info('All services stopped successfully');
  }

  async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
    const results = new Map<string, ServiceStatus>();
    const allServices = this.getAllServices();

    const healthCheckPromises = Array.from(allServices.entries()).map(
      async ([name, service]) => {
        try {
          const status = await this.performServiceHealthCheck(service);
          results?.set(name, status);
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

          results?.set(name, errorStatus);
          this.healthStatuses.set(name, errorStatus);
        }
      }
    );

    await Promise.allSettled(healthCheckPromises);
    return results;
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
      (status) => status.lifecycle === 'error' || status.health === 'unhealthy'
    ).length;

    // Collect metrics from all services
    const aggregatedMetrics: ServiceMetrics[] = [];
    const metricsPromises = Array.from(allServices.values()).map(
      async (service) => {
        try {
          const metrics = await service.getMetrics();
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

  async shutdownAll(): Promise<void> {
    this.logger.info('Shutting down service registry...');

    try {
      // Stop monitoring
      this.stopMonitoring();

      // Stop all services
      await this.stopAllServices();

      // Shutdown all factories
      const shutdownPromises = Array.from(this.factories.values()).map(
        (factory) => factory.shutdown()
      );
      await Promise.allSettled(shutdownPromises);

      // Clear all registries
      this.factories.clear();
      this.services.clear();
      this.serviceDiscovery.clear();
      this.healthStatuses.clear();
      this.metricsHistory.clear();
      this.operationMetrics.clear();

      // Remove all listeners
      this.removeAllListeners();

      this.logger.info('Service registry shutdown completed');
    } catch (error) {
      this.logger.error('Error during service registry shutdown:', error);
      throw error;
    }
  }

  // ============================================
  // Advanced Service Discovery
  // ============================================

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
      const discoveryInfo = this.serviceDiscovery.get(service.name);

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

      // Filter by health
      if (criteria.health && discoveryInfo) {
        if (discoveryInfo.health !== criteria.health) {
          return false;
        }
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
   * Get comprehensive service discovery information.
   */
  getServiceDiscoveryInfo(): Map<string, ServiceDiscoveryInfo> {
    return new Map(this.serviceDiscovery);
  }

  /**
   * Register service for discovery.
   *
   * @param service
   * @param metadata
   */
  registerServiceForDiscovery(
    service: IService,
    metadata?: Record<string, unknown>
  ): void {
    const discoveryInfo: ServiceDiscoveryInfo = {
      serviceName: service.name,
      serviceType: service.type,
      version: service.config.version || '1.0.0',
      capabilities: service.getCapabilities(),
      tags: (service.config as any).tags || [],
      metadata: { ...service.config.metadata, ...metadata },
      lastHeartbeat: new Date(),
      health: 'healthy',
    };

    this.serviceDiscovery.set(service.name, discoveryInfo);
    this.emit('service-discovered', service.name, discoveryInfo);
  }

  /**
   * Update service heartbeat.
   *
   * @param serviceName
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

  on(
    event:
      | 'service-registered'
      | 'service-unregistered'
      | 'service-status-changed'
      | string,
    handler: (serviceName: string, service?: IService) => void
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

  // ============================================
  // Private Implementation Methods
  // ============================================

  private initializeMonitoring(): void {
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
    this.healthMonitoringInterval = setInterval(async () => {
      try {
        await this.performSystemHealthCheck();
      } catch (error) {
        this.logger.error('System health check failed:', error);
      }
    }, this.config.healthMonitoring.interval);

    this.logger.debug('Health monitoring started');
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        this.logger.error('Metrics collection failed:', error);
      }
    }, this.config.metricsCollection.interval);

    this.logger.debug('Metrics collection started');
  }

  private startServiceDiscovery(): void {
    this.discoveryInterval = setInterval(() => {
      try {
        this.performServiceDiscoveryMaintenance();
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
    factory: IServiceFactory<T>
  ): void {
    // Handle service creation events from factory
    if ('on' in factory && typeof factory.on === 'function') {
      factory.on(
        'service-created',
        (_serviceName: string, service: IService) => {
          this.handleServiceRegistration(service);
        }
      );

      factory.on('service-removed', (serviceName: string) => {
        this.removeServiceFromRegistry(serviceName);
      });
    }
  }

  private handleServiceRegistration(service: IService): void {
    this.logger.debug(`Handling service registration: ${service.name}`);

    // Register for discovery
    this.registerServiceForDiscovery(service);

    // Set up service event handling
    this.setupServiceEventHandling(service);

    // Emit registration event
    this.emit('service-registered', service.name, service);
  }

  private setupServiceEventHandling(service: IService): void {
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
    service: IService,
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
    this.emit(`service-${eventType}`, service.name, event);
    this.emit('service-status-changed', service.name, service);
  }

  private removeServiceFromRegistry(serviceName: string): void {
    this.services.delete(serviceName);
    this.serviceDiscovery.delete(serviceName);
    this.healthStatuses.delete(serviceName);
    this.metricsHistory.delete(serviceName);
    this.operationMetrics.delete(serviceName);

    this.emit('service-unregistered', serviceName);
  }

  private async performServiceHealthCheck(
    service: IService
  ): Promise<ServiceStatus> {
    const startTime = Date.now();

    try {
      const status = await Promise.race([
        service.getStatus(),
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
        discoveryInfo.health = status.health;
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

  private async performSystemHealthCheck(): Promise<void> {
    const healthResults = await this.healthCheckAll();

    // Check for alerts
    const unhealthyServices = Array.from(healthResults?.entries())
      .filter(([_, status]) => status.health !== 'healthy')
      .map(([name, _]) => name);

    if (unhealthyServices.length > 0) {
      this.logger.warn(
        `Unhealthy services detected: ${unhealthyServices.join(', ')}`
      );
      this.emit('health-alert', unhealthyServices);
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
      this.emit('system-alert', {
        type: 'high-error-rate',
        value: errorRate,
        threshold: this.config.healthMonitoring.alertThresholds.errorRate,
        affectedServices: unhealthyCount,
      });
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    const metrics = await this.getSystemMetrics();

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

    this.emit('metrics-collected', metrics);
  }

  private performServiceDiscoveryMaintenance(): void {
    const currentTime = new Date();
    const timeoutThreshold = this.config.discovery.timeoutThreshold;

    // Check for stale services
    const staleServices: string[] = [];

    this.serviceDiscovery.forEach((info, serviceName) => {
      const timeSinceHeartbeat =
        currentTime?.getTime() - info.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > timeoutThreshold) {
        staleServices.push(serviceName);
      }
    });

    // Remove stale services
    staleServices.forEach((serviceName) => {
      this.logger.warn(`Removing stale service from discovery: ${serviceName}`);
      this.serviceDiscovery.delete(serviceName);
      this.emit('service-timeout', serviceName);
    });

    // Emit discovery heartbeat
    this.emit('discovery-heartbeat', {
      totalServices: this.serviceDiscovery.size,
      activeServices: this.serviceDiscovery.size - staleServices.length,
      staleServices: staleServices.length,
      timestamp: currentTime,
    });
  }

  private updateServiceHealth(serviceName: string, healthData: unknown): void {
    const discoveryInfo = this.serviceDiscovery.get(serviceName);
    if (discoveryInfo && healthData) {
      discoveryInfo.health = healthData?.health || discoveryInfo.health;
      discoveryInfo.lastHeartbeat = new Date();
    }
  }

  private updateServiceMetrics(serviceName: string, metricsData: unknown): void {
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
      if (metricsData?.success) {
        metrics.successfulOperations += 1;
      }
      metrics.averageLatency =
        (metrics.averageLatency + (metricsData?.latency || 0)) / 2;
      metrics.lastOperation = new Date();
    }
  }

  private async buildDependencyGraph(): Promise<void> {
    // Implementation for dependency graph building
    // This would analyze service dependencies and create a proper graph
    this.logger.debug('Building service dependency graph...');

    const allServices = this.getAllServices();
    const nodes = new Map();

    // Build dependency nodes
    for (const [name, service] of allServices) {
      nodes?.set(name, {
        service,
        dependencies: new Set(
          service.config.dependencies?.map((dep) => dep.serviceName) || []
        ),
        dependents: new Set<string>(),
        level: 0,
      });
    }

    // Calculate dependents and levels
    for (const [nodeName, node] of nodes) {
      for (const depName of node?.dependencies) {
        const depNode = nodes?.get(depName);
        if (depNode) {
          depNode?.dependents?.add(nodeName);
        }
      }
    }

    // Create startup/shutdown order
    const startupOrder = this.calculateStartupOrder(nodes);
    const shutdownOrder = [...startupOrder].reverse();

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

      const node = nodes?.get(nodeName);
      if (!node) return;

      // Visit dependencies first
      for (const depName of node?.dependencies) {
        visit(depName);
      }

      visited.add(nodeName);
      order.push(nodeName);
    };

    // Visit all nodes
    for (const nodeName of nodes?.keys()) {
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
          await service.start();
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

    for (const serviceName of this.dependencyGraph.shutdownOrder) {
      const service = this.findService(serviceName);
      if (service) {
        try {
          this.logger.debug(`Stopping service: ${serviceName}`);
          await service.stop();
        } catch (error) {
          this.logger.error(`Failed to stop service ${serviceName}:`, error);
        }
      }
    }
  }

  private async startServicesParallel(): Promise<void> {
    const allServices = this.getAllServices();
    const startPromises = Array.from(allServices.values()).map(
      async (service) => {
        try {
          await service.start();
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
    const allServices = this.getAllServices();
    const stopPromises = Array.from(allServices.values()).map(
      async (service) => {
        try {
          await service.stop();
        } catch (error) {
          this.logger.error(`Failed to stop service ${service.name}:`, error);
        }
      }
    );

    await Promise.allSettled(stopPromises);
  }

  private scheduleServiceRecovery(service: IService): void {
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

  private async performServiceRecovery(service: IService): Promise<void> {
    const maxRetries = this.config.autoRecovery.maxRetries;
    const backoffMultiplier = this.config.autoRecovery.backoffMultiplier;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(
          `Recovery attempt ${attempt}/${maxRetries} for service: ${service.name}`
        );

        // Stop and restart the service
        await service.stop();
        await service.start();

        // Verify health
        const isHealthy = await service.healthCheck();
        if (isHealthy) {
          this.logger.info(`Service recovery successful: ${service.name}`);
          this.emit('service-recovered', service.name);
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
    this.emit('service-recovery-failed', service.name);
  }
}

export default EnhancedServiceRegistry;
