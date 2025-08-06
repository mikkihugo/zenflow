/**
 * USL Service Manager - Complete Service Lifecycle Management
 * 
 * @fileoverview Advanced service manager providing comprehensive lifecycle orchestration,
 * factory registration, health monitoring, auto-recovery, and service coordination
 * following the same patterns as UACL Agent 6.
 * 
 * @description The Service Manager is the central orchestrator for all USL services,
 * providing enterprise-grade capabilities:
 * 
 * **Core Capabilities:**
 * - Complete service lifecycle management (create, start, monitor, recover, destroy)
 * - Automatic dependency resolution and service orchestration
 * - Real-time health monitoring with configurable thresholds
 * - Automated recovery and restart mechanisms
 * - Performance metrics collection and analysis
 * - Event-driven service coordination
 * 
 * **Service Management Patterns:**
 * - Factory pattern for service creation with type safety
 * - Observer pattern for event handling and notifications
 * - Dependency injection for service relationships
 * - Circuit breaker pattern for resilience
 * 
 * @example
 * ```typescript
 * import { ServiceManager, type ServiceManagerConfig } from '@claude-zen/usl';
 * 
 * // Configure comprehensive service management
 * const config: ServiceManagerConfig = {
 *   factory: {
 *     maxConcurrentInits: 10,
 *     enableDependencyResolution: true
 *   },
 *   lifecycle: {
 *     startupTimeout: 60000,
 *     parallelStartup: true,
 *     dependencyResolution: true
 *   },
 *   monitoring: {
 *     healthCheckInterval: 30000,
 *     performanceThresholds: {
 *       responseTime: 1000,
 *       errorRate: 5.0
 *     }
 *   },
 *   recovery: {
 *     enabled: true,
 *     maxRetries: 3,
 *     strategy: 'exponential'
 *   }
 * };
 * 
 * const manager = new ServiceManager(config);
 * await manager.initialize();
 * 
 * // Create services with automatic lifecycle management
 * const webService = await manager.createService({
 *   name: 'api-server',
 *   type: ServiceType.WEB,
 *   dependencies: [{ serviceName: 'database', required: true }]
 * });
 * 
 * // Manager handles monitoring, recovery, and coordination automatically
 * manager.on('service-health-degraded', async (event) => {
 *   console.warn(`Service ${event.serviceName} health degraded`);
 *   // Automatic recovery will be triggered based on configuration
 * });
 * ```
 */

import type {
  IService,
  IServiceFactory,
  ServiceConfig,
  ServiceStatus,
  ServiceMetrics,
  ServiceLifecycleStatus
} from './core/interfaces';

import {
  ServiceType,
  ServicePriority,
  ServiceEnvironment,
  type AnyServiceConfig
} from './types';

import {
  ServiceError,
  ServiceInitializationError,
  ServiceOperationError,
  ServiceDependencyError
} from './core/interfaces';

import { EnhancedServiceRegistry, type ServiceRegistryConfig } from './registry';
import { USLFactory, type USLFactoryConfig } from './factories';

// Import all service adapter factories
import {
  DataServiceFactory,
  globalDataServiceFactory,
  type DataServiceAdapterConfig
} from './adapters/data-service-factory';

import {
  CoordinationServiceFactory,
  globalCoordinationServiceFactory,
  type CoordinationServiceAdapterConfig
} from './adapters/coordination-service-factory';

import {
  IntegrationServiceFactory,
  integrationServiceFactory,
  type IntegrationServiceAdapterConfig
} from './adapters/integration-service-factory';

import {
  InfrastructureServiceFactory,
  globalInfrastructureServiceFactory,
  type InfrastructureServiceAdapterConfig
} from './adapters/infrastructure-service-factory';

import { createLogger, type Logger } from '../../utils/logger';
import { EventEmitter } from 'events';

/**
 * Service Manager Configuration
 * 
 * @interface ServiceManagerConfig
 * @description Comprehensive configuration for the USL Service Manager,
 * controlling all aspects of service lifecycle management, monitoring, and recovery
 * @example
 * ```typescript
 * const managerConfig: ServiceManagerConfig = {
 *   factory: {
 *     maxConcurrentInits: 5,
 *     defaultTimeout: 30000,
 *     enableDependencyResolution: true
 *   },
 *   registry: {
 *     discoveryEnabled: true,
 *     healthCheckInterval: 30000
 *   },
 *   lifecycle: {
 *     startupTimeout: 60000,
 *     shutdownTimeout: 30000,
 *     gracefulShutdownPeriod: 10000,
 *     parallelStartup: true,
 *     dependencyResolution: true
 *   },
 *   monitoring: {
 *     healthCheckInterval: 30000,
 *     metricsCollectionInterval: 60000,
 *     performanceThresholds: {
 *       responseTime: 1000,  // 1 second
 *       errorRate: 5.0,      // 5%
 *       memoryUsage: 80.0,   // 80%
 *       cpuUsage: 75.0       // 75%
 *     },
 *     alerting: {
 *       enabled: true,
 *       channels: [
 *         { type: 'console', config: { logLevel: 'warn' } },
 *         { type: 'webhook', config: { url: 'https://alerts.example.com' } }
 *       ]
 *     }
 *   },
 *   recovery: {
 *     enabled: true,
 *     maxRetries: 3,
 *     strategy: 'exponential',
 *     backoffMultiplier: 2,
 *     circuitBreaker: {
 *       enabled: true,
 *       failureThreshold: 5,
 *       recoveryTimeout: 60000
 *     }
 *   }
 * };
 * ```
 */
export interface ServiceManagerConfig {
  /** Core factory configuration for service creation and management */
  factory: USLFactoryConfig;
  
  /** Registry configuration for service discovery and registration */
  registry: ServiceRegistryConfig;
  
  /** Service lifecycle management configuration */
  lifecycle: {
    /** Maximum time to wait for service startup in milliseconds (default: 60000) */
    startupTimeout: number;
    /** Maximum time to wait for service shutdown in milliseconds (default: 30000) */
    shutdownTimeout: number;
    /** Graceful shutdown period before forced termination in milliseconds (default: 10000) */
    gracefulShutdownPeriod: number;
    /** Enable parallel service startup for improved performance (default: true) */
    parallelStartup: boolean;
    /** Enable automatic dependency resolution and ordering (default: true) */
    dependencyResolution: boolean;
  };
  
  /** Health monitoring and auto-recovery */
  monitoring: {
    healthCheckInterval: number; // ms
    metricsCollectionInterval: number; // ms
    performanceThresholds: {
      responseTime: number; // ms
      errorRate: number; // percentage
      memoryUsage: number; // percentage
      cpuUsage: number; // percentage
    };
    alerting: {
      enabled: boolean;
      channels: Array<{
        type: 'console' | 'webhook' | 'email';
        config: Record<string, any>;
      }>;
    };
  };
  
  /** Auto-recovery configuration */
  recovery: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    backoffMultiplier: number;
    recoveryTimeout: number; // ms
    circuitBreaker: {
      enabled: boolean;
      failureThreshold: number;
      recoveryTime: number; // ms
    };
  };
  
  /** Service discovery and communication */
  discovery: {
    enabled: boolean;
    protocol: 'http' | 'websocket' | 'mcp' | 'custom';
    heartbeatInterval: number; // ms
    advertisementInterval: number; // ms
    serviceRegistry: {
      persistent: boolean;
      storageType: 'memory' | 'database' | 'file';
      storagePath?: string;
    };
  };
  
  /** Performance optimization */
  performance: {
    connectionPooling: {
      enabled: boolean;
      maxConnections: number;
      idleTimeout: number; // ms
    };
    caching: {
      enabled: boolean;
      ttl: number; // ms
      maxSize: number;
    };
    loadBalancing: {
      enabled: boolean;
      strategy: 'round-robin' | 'least-connections' | 'weighted';
    };
  };
}

export interface ServiceManagerStatus {
  initialized: boolean;
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  errorServices: number;
  averageResponseTime: number;
  systemErrorRate: number;
  uptime: number;
  factoriesRegistered: number;
  lastHealthCheck: Date;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export interface ServiceCreationRequest {
  name: string;
  type: ServiceType | string;
  config: Partial<AnyServiceConfig>;
  dependencies?: string[];
  priority?: ServicePriority;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface BatchServiceCreationRequest {
  services: ServiceCreationRequest[];
  startImmediately?: boolean;
  parallel?: boolean;
  dependencyResolution?: boolean;
}

/**
 * Complete Service Manager for USL ecosystem
 */
export class ServiceManager extends EventEmitter {
  private registry: EnhancedServiceRegistry;
  private mainFactory: USLFactory;
  private config: ServiceManagerConfig;
  private logger: Logger;
  private initialized = false;
  private startTime = Date.now();
  
  // Registered service factories
  private dataServiceFactory: DataServiceFactory;
  private coordinationServiceFactory: CoordinationServiceFactory;
  private integrationServiceFactory: IntegrationServiceFactory;
  private infrastructureServiceFactory: InfrastructureServiceFactory;
  
  // Monitoring intervals
  private healthMonitoringInterval?: NodeJS.Timeout;
  private metricsCollectionInterval?: NodeJS.Timeout;
  private systemStatusInterval?: NodeJS.Timeout;
  
  // Performance tracking
  private systemMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    totalErrors: 0,
    averageLatency: 0,
    lastUpdate: new Date()
  };

  constructor(config?: Partial<ServiceManagerConfig>) {
    super();
    this.logger = createLogger('ServiceManager');
    
    // Initialize configuration with defaults
    this.config = this.initializeConfig(config);
    
    // Initialize core components
    this.registry = new EnhancedServiceRegistry(this.config.registry);
    this.mainFactory = new USLFactory(this.config.factory);
    
    // Initialize service factories
    this.dataServiceFactory = globalDataServiceFactory;
    this.coordinationServiceFactory = globalCoordinationServiceFactory;
    this.integrationServiceFactory = integrationServiceFactory;
    this.infrastructureServiceFactory = globalInfrastructureServiceFactory;
    
    this.setupEventHandling();
  }

  // ============================================
  // Initialization and Configuration
  // ============================================

  /**
   * Initialize the service manager and register all service factories
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Service manager already initialized');
      return;
    }

    this.logger.info('Initializing USL Service Manager...');

    try {
      // Register all service adapter factories with the registry
      await this.registerServiceFactories();
      
      // Initialize monitoring systems
      this.initializeMonitoring();
      
      // Initialize discovery if enabled
      if (this.config.discovery.enabled) {
        await this.initializeServiceDiscovery();
      }
      
      // Set initialized flag
      this.initialized = true;
      this.startTime = Date.now();
      
      this.logger.info('USL Service Manager initialized successfully');
      this.emit('manager-initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize service manager:', error);
      throw new ServiceInitializationError('ServiceManager', error as Error);
    }
  }

  /**
   * Check if service manager is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get comprehensive service manager status
   */
  async getStatus(): Promise<ServiceManagerStatus> {
    const systemMetrics = await this.registry.getSystemMetrics();
    const healthResults = await this.registry.healthCheckAll();
    
    const healthyCount = Array.from(healthResults.values())
      .filter(status => status.health === 'healthy').length;
    
    const errorCount = Array.from(healthResults.values())
      .filter(status => status.health === 'unhealthy' || status.lifecycle === 'error').length;
    
    const totalServices = systemMetrics.totalServices;
    const systemErrorRate = totalServices > 0 ? (errorCount / totalServices) * 100 : 0;
    
    // Calculate average response time
    const averageResponseTime = systemMetrics.aggregatedMetrics.length > 0
      ? systemMetrics.aggregatedMetrics.reduce((sum, metric) => sum + metric.averageLatency, 0) 
        / systemMetrics.aggregatedMetrics.length
      : 0;
    
    // Determine overall system health
    let systemHealth: 'healthy' | 'degraded' | 'unhealthy';
    if (systemErrorRate === 0) {
      systemHealth = 'healthy';
    } else if (systemErrorRate <= 10) {
      systemHealth = 'degraded';
    } else {
      systemHealth = 'unhealthy';
    }

    return {
      initialized: this.initialized,
      totalServices: systemMetrics.totalServices,
      runningServices: systemMetrics.runningServices,
      healthyServices: systemMetrics.healthyServices,
      errorServices: systemMetrics.errorServices,
      averageResponseTime,
      systemErrorRate,
      uptime: Date.now() - this.startTime,
      factoriesRegistered: this.registry.listFactoryTypes().length,
      lastHealthCheck: new Date(),
      systemHealth
    };
  }

  // ============================================
  // Service Creation and Management
  // ============================================

  /**
   * Create a single service with enhanced configuration
   */
  async createService(request: ServiceCreationRequest): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.logger.info(`Creating service: ${request.name} (${request.type})`);

    try {
      // Determine the appropriate factory based on service type
      const factory = this.getFactoryForServiceType(request.type);
      
      if (!factory) {
        // Fall back to main USL factory
        return await this.createServiceWithMainFactory(request);
      }

      // Create service using specialized factory
      return await this.createServiceWithSpecializedFactory(factory, request);
      
    } catch (error) {
      this.logger.error(`Failed to create service ${request.name}:`, error);
      throw new ServiceInitializationError(request.name, error as Error);
    }
  }

  /**
   * Create multiple services with dependency resolution
   */
  async createServices(request: BatchServiceCreationRequest): Promise<IService[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.logger.info(`Creating batch of ${request.services.length} services`);

    const createdServices: IService[] = [];

    try {
      if (request.dependencyResolution) {
        // Create services in dependency order
        const orderedServices = this.resolveDependencyOrder(request.services);
        
        for (const serviceRequest of orderedServices) {
          const service = await this.createService(serviceRequest);
          createdServices.push(service);
        }
      } else if (request.parallel) {
        // Create services in parallel
        const createPromises = request.services.map(serviceRequest => 
          this.createService(serviceRequest)
        );
        
        const results = await Promise.allSettled(createPromises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            createdServices.push(result.value);
          } else {
            this.logger.error(`Failed to create service ${request.services[index].name}:`, result.reason);
          }
        });
      } else {
        // Create services sequentially
        for (const serviceRequest of request.services) {
          try {
            const service = await this.createService(serviceRequest);
            createdServices.push(service);
          } catch (error) {
            this.logger.error(`Failed to create service ${serviceRequest.name}:`, error);
            // Continue with other services
          }
        }
      }

      // Start services if requested
      if (request.startImmediately) {
        await this.startServices(createdServices.map(s => s.name));
      }

      this.logger.info(`Successfully created ${createdServices.length} services`);
      return createdServices;

    } catch (error) {
      this.logger.error('Failed to create service batch:', error);
      throw error;
    }
  }

  /**
   * Enhanced service creation methods for each service type
   */

  // Data Services
  async createWebDataService(
    name: string, 
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<IService> {
    return await this.dataServiceFactory.createWebDataAdapter(name, config);
  }

  async createDocumentService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<IService> {
    return await this.dataServiceFactory.createDocumentAdapter(name, databaseType, config);
  }

  async createUnifiedDataService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    config?: Partial<DataServiceAdapterConfig>
  ): Promise<IService> {
    return await this.dataServiceFactory.createUnifiedDataAdapter(name, databaseType, config);
  }

  // Coordination Services
  async createDaaService(
    name: string,
    config?: Partial<CoordinationServiceAdapterConfig>
  ): Promise<IService> {
    return await this.coordinationServiceFactory.createDaaAdapter(name, config);
  }

  async createSessionRecoveryService(
    name: string,
    config?: Partial<CoordinationServiceAdapterConfig>
  ): Promise<IService> {
    return await this.coordinationServiceFactory.createSessionRecoveryAdapter(name, config);
  }

  async createUnifiedCoordinationService(
    name: string,
    config?: Partial<CoordinationServiceAdapterConfig>
  ): Promise<IService> {
    return await this.coordinationServiceFactory.createUnifiedCoordinationAdapter(name, config);
  }

  // Integration Services
  async createArchitectureStorageService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    config?: Partial<IntegrationServiceAdapterConfig>
  ): Promise<IService> {
    return await this.integrationServiceFactory.createArchitectureStorageAdapter(name, databaseType, config);
  }

  async createSafeAPIService(
    name: string,
    baseURL: string,
    config?: Partial<IntegrationServiceAdapterConfig>
  ): Promise<IService> {
    return await this.integrationServiceFactory.createSafeAPIAdapter(name, baseURL, config);
  }

  async createUnifiedIntegrationService(
    name: string,
    options: {
      baseURL?: string;
      databaseType?: 'postgresql' | 'sqlite' | 'mysql';
      supportedProtocols?: string[];
    } = {},
    config?: Partial<IntegrationServiceAdapterConfig>
  ): Promise<IService> {
    return await this.integrationServiceFactory.createUnifiedIntegrationAdapter(name, options, config);
  }

  // Infrastructure Services
  async createFacadeService(
    name: string,
    config?: Partial<InfrastructureServiceAdapterConfig>
  ): Promise<IService> {
    return await this.infrastructureServiceFactory.createFacadeAdapter(name, config);
  }

  async createPatternIntegrationService(
    name: string,
    configProfile: 'default' | 'production' | 'development' = 'default',
    config?: Partial<InfrastructureServiceAdapterConfig>
  ): Promise<IService> {
    return await this.infrastructureServiceFactory.createPatternIntegrationAdapter(name, configProfile, config);
  }

  async createUnifiedInfrastructureService(
    name: string,
    configProfile: 'default' | 'production' | 'development' = 'default',
    config?: Partial<InfrastructureServiceAdapterConfig>
  ): Promise<IService> {
    return await this.infrastructureServiceFactory.createUnifiedInfrastructureAdapter(name, configProfile, config);
  }

  // ============================================
  // Service Lifecycle Management
  // ============================================

  /**
   * Start specific services by name
   */
  async startServices(serviceNames: string[]): Promise<void> {
    this.logger.info(`Starting ${serviceNames.length} services`);

    if (this.config.lifecycle.dependencyResolution) {
      await this.startServicesWithDependencyResolution(serviceNames);
    } else if (this.config.lifecycle.parallelStartup) {
      await this.startServicesParallel(serviceNames);
    } else {
      await this.startServicesSequential(serviceNames);
    }
  }

  /**
   * Stop specific services by name
   */
  async stopServices(serviceNames: string[]): Promise<void> {
    this.logger.info(`Stopping ${serviceNames.length} services`);

    // Always stop in reverse dependency order
    const orderedNames = [...serviceNames].reverse();
    
    for (const serviceName of orderedNames) {
      const service = this.registry.findService(serviceName);
      if (service) {
        try {
          await this.stopServiceWithTimeout(service);
        } catch (error) {
          this.logger.error(`Failed to stop service ${serviceName}:`, error);
        }
      }
    }
  }

  /**
   * Start all services
   */
  async startAllServices(): Promise<void> {
    this.logger.info('Starting all services...');
    await this.registry.startAllServices();
  }

  /**
   * Stop all services
   */
  async stopAllServices(): Promise<void> {
    this.logger.info('Stopping all services...');
    await this.registry.stopAllServices();
  }

  /**
   * Restart specific services
   */
  async restartServices(serviceNames: string[]): Promise<void> {
    this.logger.info(`Restarting ${serviceNames.length} services`);

    for (const serviceName of serviceNames) {
      const service = this.registry.findService(serviceName);
      if (service) {
        try {
          await this.stopServiceWithTimeout(service);
          await this.startServiceWithTimeout(service);
          this.logger.info(`Service restarted successfully: ${serviceName}`);
        } catch (error) {
          this.logger.error(`Failed to restart service ${serviceName}:`, error);
          
          if (this.config.recovery.enabled) {
            this.scheduleServiceRecovery(service);
          }
        }
      }
    }
  }

  // ============================================
  // Health Monitoring and Metrics
  // ============================================

  /**
   * Get comprehensive system health report
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Map<string, ServiceStatus>;
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
      errorRate: number;
      averageResponseTime: number;
      uptime: number;
    };
    alerts: Array<{
      type: string;
      severity: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      service?: string;
      timestamp: Date;
    }>;
  }> {
    const healthResults = await this.registry.healthCheckAll();
    const metrics = await this.registry.getSystemMetrics();
    
    const total = healthResults.size;
    const healthy = Array.from(healthResults.values()).filter(s => s.health === 'healthy').length;
    const degraded = Array.from(healthResults.values()).filter(s => s.health === 'degraded').length;
    const unhealthy = Array.from(healthResults.values()).filter(s => s.health === 'unhealthy').length;
    
    const errorRate = total > 0 ? ((degraded + unhealthy) / total) * 100 : 0;
    const averageResponseTime = metrics.aggregatedMetrics.length > 0
      ? metrics.aggregatedMetrics.reduce((sum, m) => sum + m.averageLatency, 0) / metrics.aggregatedMetrics.length
      : 0;
    
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (errorRate === 0) {
      overall = 'healthy';
    } else if (errorRate <= 10) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }
    
    // Generate alerts based on thresholds
    const alerts = this.generateHealthAlerts(healthResults, metrics);
    
    return {
      overall,
      services: healthResults,
      summary: {
        total,
        healthy,
        degraded,
        unhealthy,
        errorRate,
        averageResponseTime,
        uptime: Date.now() - this.startTime
      },
      alerts
    };
  }

  /**
   * Get performance metrics for all services
   */
  async getPerformanceMetrics(): Promise<{
    timestamp: Date;
    system: {
      totalOperations: number;
      successRate: number;
      averageLatency: number;
      throughput: number;
      errorRate: number;
    };
    services: Record<string, {
      name: string;
      type: string;
      metrics: ServiceMetrics;
      health: ServiceStatus;
      performance: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        availability: number;
      };
    }>;
  }> {
    const metrics = await this.registry.getSystemMetrics();
    const healthResults = await this.registry.healthCheckAll();
    
    const services: Record<string, any> = {};
    
    let totalOperations = 0;
    let totalSuccess = 0;
    let totalLatency = 0;
    let totalThroughput = 0;
    let serviceCount = 0;
    
    metrics.aggregatedMetrics.forEach(metric => {
      const health = healthResults.get(metric.name);
      if (!health) return;
      
      const successRate = metric.operationCount > 0 
        ? ((metric.operationCount - metric.errorCount) / metric.operationCount) * 100 
        : 100;
      
      const availability = health.uptime > 0 ? 
        ((health.uptime - (health.errorCount * 1000)) / health.uptime) * 100 : 100;
      
      services[metric.name] = {
        name: metric.name,
        type: metric.type,
        metrics: metric,
        health,
        performance: {
          responseTime: metric.averageLatency,
          throughput: metric.throughput,
          errorRate: metric.operationCount > 0 ? (metric.errorCount / metric.operationCount) * 100 : 0,
          availability: Math.max(0, availability)
        }
      };
      
      totalOperations += metric.operationCount;
      totalSuccess += (metric.operationCount - metric.errorCount);
      totalLatency += metric.averageLatency;
      totalThroughput += metric.throughput;
      serviceCount++;
    });
    
    const systemSuccessRate = totalOperations > 0 ? (totalSuccess / totalOperations) * 100 : 100;
    const systemErrorRate = 100 - systemSuccessRate;
    const averageLatency = serviceCount > 0 ? totalLatency / serviceCount : 0;
    
    return {
      timestamp: new Date(),
      system: {
        totalOperations,
        successRate: systemSuccessRate,
        averageLatency,
        throughput: totalThroughput,
        errorRate: systemErrorRate
      },
      services
    };
  }

  // ============================================
  // Service Discovery and Registry
  // ============================================

  /**
   * Discover services by criteria
   */
  discoverServices(criteria?: {
    type?: string;
    capabilities?: string[];
    health?: 'healthy' | 'degraded' | 'unhealthy';
    tags?: string[];
  }): IService[] {
    return this.registry.discoverServices(criteria);
  }

  /**
   * Get service by name
   */
  getService(name: string): IService | undefined {
    return this.registry.findService(name);
  }

  /**
   * Get all services
   */
  getAllServices(): Map<string, IService> {
    return this.registry.getAllServices();
  }

  /**
   * Get services by type
   */
  getServicesByType(type: string): IService[] {
    return this.registry.getServicesByType(type);
  }

  // ============================================
  // Shutdown and Cleanup
  // ============================================

  /**
   * Graceful shutdown of service manager
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.logger.info('Shutting down Service Manager...');

    try {
      // Stop monitoring
      this.stopMonitoring();
      
      // Shutdown registry and all services
      await this.registry.shutdownAll();
      
      // Shutdown main factory
      await this.mainFactory.shutdown();
      
      // Clear state
      this.initialized = false;
      
      // Remove all listeners
      this.removeAllListeners();
      
      this.logger.info('Service Manager shutdown completed');
      this.emit('manager-shutdown');
      
    } catch (error) {
      this.logger.error('Error during Service Manager shutdown:', error);
      throw error;
    }
  }

  // ============================================
  // Private Implementation Methods
  // ============================================

  private initializeConfig(config?: Partial<ServiceManagerConfig>): ServiceManagerConfig {
    return {
      factory: config?.factory || {},
      registry: config?.registry || {
        healthMonitoring: {
          enabled: true,
          interval: 30000,
          timeout: 5000,
          alertThresholds: { errorRate: 5, responseTime: 1000, resourceUsage: 80 }
        },
        metricsCollection: {
          enabled: true,
          interval: 10000,
          retention: 86400000,
          aggregationWindow: 300000
        },
        discovery: {
          enabled: true,
          heartbeatInterval: 10000,
          advertisementInterval: 30000,
          timeoutThreshold: 60000
        },
        autoRecovery: {
          enabled: true,
          maxRetries: 3,
          backoffMultiplier: 2,
          recoveryTimeout: 30000
        },
        dependencyManagement: {
          enabled: true,
          resolutionTimeout: 30000,
          circularDependencyCheck: true,
          dependencyHealthCheck: true
        },
        performance: {
          enableCaching: true,
          enableConnectionPooling: true,
          enableServiceMemoization: true,
          maxConcurrentOperations: 50
        }
      },
      lifecycle: {
        startupTimeout: config?.lifecycle?.startupTimeout || 60000,
        shutdownTimeout: config?.lifecycle?.shutdownTimeout || 30000,
        gracefulShutdownPeriod: config?.lifecycle?.gracefulShutdownPeriod || 10000,
        parallelStartup: config?.lifecycle?.parallelStartup ?? true,
        dependencyResolution: config?.lifecycle?.dependencyResolution ?? true,
        ...config?.lifecycle
      },
      monitoring: {
        healthCheckInterval: 30000,
        metricsCollectionInterval: 10000,
        performanceThresholds: {
          responseTime: 1000,
          errorRate: 5,
          memoryUsage: 80,
          cpuUsage: 80
        },
        alerting: {
          enabled: true,
          channels: [{ type: 'console', config: {} }]
        },
        ...config?.monitoring
      },
      recovery: {
        enabled: true,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        backoffMultiplier: 2,
        recoveryTimeout: 30000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTime: 60000
        },
        ...config?.recovery
      },
      discovery: {
        enabled: true,
        protocol: 'http',
        heartbeatInterval: 10000,
        advertisementInterval: 30000,
        serviceRegistry: {
          persistent: false,
          storageType: 'memory'
        },
        ...config?.discovery
      },
      performance: {
        connectionPooling: {
          enabled: true,
          maxConnections: 100,
          idleTimeout: 300000
        },
        caching: {
          enabled: true,
          ttl: 300000,
          maxSize: 1000
        },
        loadBalancing: {
          enabled: false,
          strategy: 'round-robin'
        },
        ...config?.performance
      }
    };
  }

  private async registerServiceFactories(): Promise<void> {
    this.logger.info('Registering service adapter factories...');

    // Register the main USL factory
    this.registry.registerFactory('usl', this.mainFactory);

    // Register specialized adapter factories
    this.registry.registerFactory('data', this.dataServiceFactory);
    this.registry.registerFactory('coordination', this.coordinationServiceFactory);
    this.registry.registerFactory('integration', this.integrationServiceFactory);
    this.registry.registerFactory('infrastructure', this.infrastructureServiceFactory);

    // Register specific service types with their appropriate factories
    const serviceTypeFactoryMappings = [
      // Data service types
      { types: [ServiceType.DATA, ServiceType.WEB_DATA, ServiceType.DOCUMENT], factory: this.dataServiceFactory },
      
      // Coordination service types
      { types: [ServiceType.COORDINATION, ServiceType.DAA, ServiceType.SESSION_RECOVERY, ServiceType.SWARM], 
        factory: this.coordinationServiceFactory },
      
      // Integration service types
      { types: [ServiceType.API, ServiceType.SAFE_API, ServiceType.ARCHITECTURE_STORAGE], 
        factory: this.integrationServiceFactory },
      
      // Infrastructure service types
      { types: [ServiceType.INFRASTRUCTURE, ServiceType.SYSTEM], factory: this.infrastructureServiceFactory }
    ];

    serviceTypeFactoryMappings.forEach(({ types, factory }) => {
      types.forEach(type => {
        this.registry.registerFactory(type, factory);
      });
    });

    this.logger.info(`Registered ${this.registry.listFactoryTypes().length} service factories`);
  }

  private initializeMonitoring(): void {
    if (this.config.monitoring.healthCheckInterval > 0) {
      this.healthMonitoringInterval = setInterval(
        () => this.performSystemHealthCheck(),
        this.config.monitoring.healthCheckInterval
      );
    }

    if (this.config.monitoring.metricsCollectionInterval > 0) {
      this.metricsCollectionInterval = setInterval(
        () => this.collectSystemMetrics(),
        this.config.monitoring.metricsCollectionInterval
      );
    }

    // System status reporting
    this.systemStatusInterval = setInterval(
      () => this.reportSystemStatus(),
      60000 // Every minute
    );

    this.logger.debug('Monitoring systems initialized');
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

    if (this.systemStatusInterval) {
      clearInterval(this.systemStatusInterval);
      this.systemStatusInterval = undefined;
    }

    this.logger.debug('Monitoring systems stopped');
  }

  private async initializeServiceDiscovery(): Promise<void> {
    // Initialize service discovery system
    this.logger.info('Initializing service discovery...');
    
    // Set up discovery event handlers
    this.registry.on('service-registered', (serviceName: string, service?: IService) => {
      if (service) {
        this.announceServiceDiscovery(service);
      }
    });

    this.registry.on('service-unregistered', (serviceName: string) => {
      this.announceServiceRemoval(serviceName);
    });

    this.logger.debug('Service discovery initialized');
  }

  private setupEventHandling(): void {
    // Handle registry events
    this.registry.on('health-alert', (services: string[]) => {
      this.emit('health-alert', services);
    });

    this.registry.on('service-recovered', (serviceName: string) => {
      this.emit('service-recovered', serviceName);
    });

    this.registry.on('service-recovery-failed', (serviceName: string) => {
      this.emit('service-recovery-failed', serviceName);
    });

    // Handle factory events
    this.mainFactory.on('service-created', (serviceName: string, service: IService) => {
      this.emit('service-created', serviceName, service);
    });

    this.mainFactory.on('service-removed', (serviceName: string) => {
      this.emit('service-removed', serviceName);
    });
  }

  private getFactoryForServiceType(serviceType: ServiceType | string): IServiceFactory | null {
    // Map service types to their appropriate specialized factories
    switch (serviceType) {
      case ServiceType.DATA:
      case ServiceType.WEB_DATA:
      case ServiceType.DOCUMENT:
        return this.dataServiceFactory;
      
      case ServiceType.COORDINATION:
      case ServiceType.DAA:
      case ServiceType.SESSION_RECOVERY:
        return this.coordinationServiceFactory;
      
      case ServiceType.API:
      case ServiceType.SAFE_API:
      case ServiceType.ARCHITECTURE_STORAGE:
        return this.integrationServiceFactory;
      
      case ServiceType.INFRASTRUCTURE:
      case ServiceType.SYSTEM:
        return this.infrastructureServiceFactory;
      
      default:
        return null;
    }
  }

  private async createServiceWithMainFactory(request: ServiceCreationRequest): Promise<IService> {
    // Create service configuration
    const config: AnyServiceConfig = {
      name: request.name,
      type: request.type,
      enabled: true,
      priority: request.priority || ServicePriority.NORMAL,
      tags: request.tags,
      metadata: request.metadata,
      dependencies: request.dependencies?.map(dep => ({
        serviceName: dep,
        required: true,
        healthCheck: true,
        timeout: 5000,
        retries: 3
      })),
      ...request.config
    } as AnyServiceConfig;

    return await this.mainFactory.create(config);
  }

  private async createServiceWithSpecializedFactory(
    factory: IServiceFactory, 
    request: ServiceCreationRequest
  ): Promise<IService> {
    // Create service configuration for specialized factory
    const config: AnyServiceConfig = {
      name: request.name,
      type: request.type,
      enabled: true,
      priority: request.priority || ServicePriority.NORMAL,
      tags: request.tags,
      metadata: request.metadata,
      dependencies: request.dependencies?.map(dep => ({
        serviceName: dep,
        required: true,
        healthCheck: true,
        timeout: 5000,
        retries: 3
      })),
      ...request.config
    } as AnyServiceConfig;

    return await factory.create(config);
  }

  private resolveDependencyOrder(services: ServiceCreationRequest[]): ServiceCreationRequest[] {
    // Simple topological sort for dependency resolution
    const serviceMap = new Map(services.map(s => [s.name, s]));
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: ServiceCreationRequest[] = [];

    const visit = (serviceName: string) => {
      if (visiting.has(serviceName)) {
        throw new ServiceDependencyError(serviceName, 'circular dependency detected');
      }
      
      if (visited.has(serviceName)) {
        return;
      }

      const service = serviceMap.get(serviceName);
      if (!service) {
        return;
      }

      visiting.add(serviceName);

      // Visit dependencies first
      service.dependencies?.forEach(dep => visit(dep));

      visiting.delete(serviceName);
      visited.add(serviceName);
      result.push(service);
    };

    services.forEach(service => visit(service.name));
    
    return result;
  }

  private async startServicesWithDependencyResolution(serviceNames: string[]): Promise<void> {
    // Build dependency graph and start in correct order
    const services = serviceNames
      .map(name => this.registry.findService(name))
      .filter((service): service is IService => service !== undefined);

    // Start services based on dependency levels
    for (const service of services) {
      try {
        await this.startServiceWithTimeout(service);
      } catch (error) {
        this.logger.error(`Failed to start service ${service.name}:`, error);
        if (this.config.recovery.enabled) {
          this.scheduleServiceRecovery(service);
        }
      }
    }
  }

  private async startServicesParallel(serviceNames: string[]): Promise<void> {
    const startPromises = serviceNames.map(async (serviceName) => {
      const service = this.registry.findService(serviceName);
      if (service) {
        try {
          await this.startServiceWithTimeout(service);
        } catch (error) {
          this.logger.error(`Failed to start service ${serviceName}:`, error);
          if (this.config.recovery.enabled) {
            this.scheduleServiceRecovery(service);
          }
        }
      }
    });

    await Promise.allSettled(startPromises);
  }

  private async startServicesSequential(serviceNames: string[]): Promise<void> {
    for (const serviceName of serviceNames) {
      const service = this.registry.findService(serviceName);
      if (service) {
        try {
          await this.startServiceWithTimeout(service);
        } catch (error) {
          this.logger.error(`Failed to start service ${serviceName}:`, error);
          if (this.config.recovery.enabled) {
            this.scheduleServiceRecovery(service);
          }
        }
      }
    }
  }

  private async startServiceWithTimeout(service: IService): Promise<void> {
    const timeout = this.config.lifecycle.startupTimeout;
    
    return Promise.race([
      service.start(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Service startup timeout: ${service.name}`)), timeout)
      )
    ]);
  }

  private async stopServiceWithTimeout(service: IService): Promise<void> {
    const timeout = this.config.lifecycle.shutdownTimeout;
    
    return Promise.race([
      service.stop(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Service shutdown timeout: ${service.name}`)), timeout)
      )
    ]);
  }

  private scheduleServiceRecovery(service: IService): void {
    if (!this.config.recovery.enabled) {
      return;
    }

    this.logger.info(`Scheduling recovery for service: ${service.name}`);
    
    setTimeout(async () => {
      try {
        await this.performServiceRecovery(service);
      } catch (error) {
        this.logger.error(`Service recovery failed for ${service.name}:`, error);
        this.emit('service-recovery-failed', service.name);
      }
    }, 5000); // 5 second delay before recovery
  }

  private async performServiceRecovery(service: IService): Promise<void> {
    const maxRetries = this.config.recovery.maxRetries;
    const backoffMultiplier = this.config.recovery.backoffMultiplier;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(`Recovery attempt ${attempt}/${maxRetries} for service: ${service.name}`);
        
        // Stop and restart the service
        await this.stopServiceWithTimeout(service);
        await this.startServiceWithTimeout(service);
        
        // Verify health
        const isHealthy = await service.healthCheck();
        if (isHealthy) {
          this.logger.info(`Service recovery successful: ${service.name}`);
          this.emit('service-recovered', service.name);
          return;
        }
      } catch (error) {
        this.logger.warn(`Recovery attempt ${attempt} failed for ${service.name}:`, error);
        
        if (attempt < maxRetries) {
          const delay = this.calculateBackoffDelay(attempt, backoffMultiplier);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new ServiceOperationError(service.name, 'recovery', 
      new Error(`All ${maxRetries} recovery attempts failed`));
  }

  private calculateBackoffDelay(attempt: number, multiplier: number): number {
    switch (this.config.recovery.backoffStrategy) {
      case 'linear':
        return attempt * 1000 * multiplier;
      case 'exponential':
        return Math.pow(multiplier, attempt) * 1000;
      case 'fixed':
      default:
        return 5000; // 5 seconds
    }
  }

  private async performSystemHealthCheck(): Promise<void> {
    try {
      const healthReport = await this.getSystemHealth();
      
      if (healthReport.overall !== 'healthy') {
        this.logger.warn(`System health: ${healthReport.overall} (${healthReport.summary.unhealthy} unhealthy services)`);
        this.emit('system-health-degraded', healthReport);
      }
      
      // Check for performance alerts
      if (healthReport.summary.averageResponseTime > this.config.monitoring.performanceThresholds.responseTime) {
        this.emit('performance-alert', {
          type: 'high-response-time',
          value: healthReport.summary.averageResponseTime,
          threshold: this.config.monitoring.performanceThresholds.responseTime
        });
      }
      
    } catch (error) {
      this.logger.error('System health check failed:', error);
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      const metrics = await this.getPerformanceMetrics();
      
      // Update system metrics
      this.systemMetrics = {
        totalOperations: metrics.system.totalOperations,
        successfulOperations: Math.round(metrics.system.totalOperations * (metrics.system.successRate / 100)),
        totalErrors: Math.round(metrics.system.totalOperations * (metrics.system.errorRate / 100)),
        averageLatency: metrics.system.averageLatency,
        lastUpdate: new Date()
      };
      
      this.emit('metrics-updated', metrics);
      
    } catch (error) {
      this.logger.error('System metrics collection failed:', error);
    }
  }

  private async reportSystemStatus(): Promise<void> {
    try {
      const status = await this.getStatus();
      
      this.logger.info(`System Status: ${status.systemHealth} | ` +
        `Services: ${status.runningServices}/${status.totalServices} | ` +
        `Response Time: ${Math.round(status.averageResponseTime)}ms | ` +
        `Error Rate: ${status.systemErrorRate.toFixed(2)}%`);
      
      this.emit('status-report', status);
      
    } catch (error) {
      this.logger.error('System status reporting failed:', error);
    }
  }

  private generateHealthAlerts(
    healthResults: Map<string, ServiceStatus>, 
    metrics: { aggregatedMetrics: ServiceMetrics[] }
  ): Array<{
    type: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    service?: string;
    timestamp: Date;
  }> {
    const alerts: Array<{
      type: string;
      severity: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      service?: string;
      timestamp: Date;
    }> = [];

    const timestamp = new Date();

    // Check service health alerts
    healthResults.forEach((status, serviceName) => {
      if (status.health !== 'healthy') {
        alerts.push({
          type: 'service-health',
          severity: status.health === 'unhealthy' ? 'critical' : 'warning',
          message: `Service ${serviceName} is ${status.health}`,
          service: serviceName,
          timestamp
        });
      }

      // Check error rate
      if (status.errorRate > this.config.monitoring.performanceThresholds.errorRate) {
        alerts.push({
          type: 'high-error-rate',
          severity: status.errorRate > 20 ? 'error' : 'warning',
          message: `High error rate for service ${serviceName}: ${status.errorRate.toFixed(2)}%`,
          service: serviceName,
          timestamp
        });
      }
    });

    // Check performance metrics
    metrics.aggregatedMetrics.forEach(metric => {
      if (metric.averageLatency > this.config.monitoring.performanceThresholds.responseTime) {
        alerts.push({
          type: 'high-latency',
          severity: metric.averageLatency > this.config.monitoring.performanceThresholds.responseTime * 2 ? 'error' : 'warning',
          message: `High response time for service ${metric.name}: ${metric.averageLatency.toFixed(2)}ms`,
          service: metric.name,
          timestamp
        });
      }
    });

    return alerts;
  }

  private announceServiceDiscovery(service: IService): void {
    if (this.config.discovery.enabled) {
      this.logger.debug(`Announcing service discovery: ${service.name}`);
      this.emit('service-announced', {
        name: service.name,
        type: service.type,
        capabilities: service.getCapabilities(),
        timestamp: new Date()
      });
    }
  }

  private announceServiceRemoval(serviceName: string): void {
    if (this.config.discovery.enabled) {
      this.logger.debug(`Announcing service removal: ${serviceName}`);
      this.emit('service-removed-announcement', {
        name: serviceName,
        timestamp: new Date()
      });
    }
  }
}

export default ServiceManager;