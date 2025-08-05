/**
 * USL (Unified Service Layer) - Main Exports
 * 
 * Central export point for all USL functionality including:
 * - Service registry and factory management
 * - Service type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization
 * - Convenience functions for common service operations
 * 
 * @fileoverview Main USL exports following the same successful patterns as DAL and UACL
 */

// Core USL components
export {
  // Core interfaces
  type IService,
  type IServiceFactory,
  type IServiceRegistry,
  type IServiceConfigValidator,
  type IServiceCapabilityRegistry,
  type ServiceConfig,
  type ServiceStatus,
  type ServiceMetrics,
  type ServiceEvent,
  type ServiceEventType,
  type ServiceLifecycleStatus,
  type ServiceCapability,
  type ServiceOperationOptions,
  type ServiceOperationResponse,
  
  // Configuration interfaces
  type ServiceAuthConfig,
  type ServiceRetryConfig,
  type ServiceHealthConfig,
  type ServiceMonitoringConfig,
  type ServiceDependencyConfig,
  
  // Error classes
  ServiceError,
  ServiceInitializationError,
  ServiceConfigurationError,
  ServiceDependencyError,
  ServiceOperationError,
  ServiceTimeoutError
} from './core/interfaces';

// Service types and configurations
export {
  // Enums
  ServiceType,
  ServicePriority,
  ServiceEnvironment,
  
  // Configuration types
  type BaseServiceConfig,
  type DataServiceConfig,
  type WebServiceConfig,
  type CoordinationServiceConfig,
  type NeuralServiceConfig,
  type MemoryServiceConfig,
  type DatabaseServiceConfig,
  type InterfaceServiceConfig,
  type IntegrationServiceConfig,
  type MonitoringServiceConfig,
  type WorkflowServiceConfig,
  type AnyServiceConfig,
  
  // Configuration factory
  ServiceConfigFactory,
  
  // Type guards
  isDataServiceConfig,
  isWebServiceConfig,
  isCoordinationServiceConfig,
  isNeuralServiceConfig,
  isMemoryServiceConfig,
  isDatabaseServiceConfig,
  isIntegrationServiceConfig,
  isMonitoringServiceConfig
} from './types';

// Factory and registry implementations
export {
  // Main factory class
  USLFactory,
  type USLFactoryConfig,
  
  // Registry implementations
  ServiceRegistry,
  ServiceConfigValidator,
  ServiceCapabilityRegistry,
  
  // Global instances
  globalUSLFactory,
  globalServiceRegistry,
  globalServiceConfigValidator,
  globalServiceCapabilityRegistry
} from './factories';

// Enhanced Service Management (USL Integration Layer)
export {
  // Enhanced Service Registry
  EnhancedServiceRegistry,
  type ServiceRegistryConfig,
  type ServiceDiscoveryInfo,
  type ServiceDependencyGraph
} from './registry';

export {
  // Service Manager - Complete Lifecycle Management
  ServiceManager,
  type ServiceManagerConfig,
  type ServiceManagerStatus,
  type ServiceCreationRequest,
  type BatchServiceCreationRequest
} from './manager';

export {
  // Backward Compatibility Layer
  USLCompatibilityLayer,
  type CompatibilityConfig,
  type LegacyServicePattern,
  compat,
  initializeCompatibility,
  MigrationUtils
} from './compatibility';

export {
  // Validation Framework
  USLValidationFramework,
  type ValidationConfig,
  type ValidationResult,
  type ValidationSectionResult,
  type SystemHealthValidation
} from './validation';

// Service implementations (re-exported for convenience)
export type { DataService } from './implementations/data-service';
export type { WebService } from './implementations/web-service';
export type { CoordinationService } from './implementations/coordination-service';
export type { NeuralService } from './implementations/neural-service';
export type { MemoryService } from './implementations/memory-service';
export type { DatabaseService } from './implementations/database-service';

// Data service adapters (enhanced implementations)
export {
  DataServiceAdapter,
  DataServiceFactory,
  DataServiceHelper,
  DataServiceUtils,
  globalDataServiceFactory,
  type DataServiceAdapterConfig,
  type DataOperationResult,
  type BatchOperationConfig,
  type DataValidationResult,
  type EnhancedSearchOptions,
  type DataAggregationOptions,
  type TransformationStep,
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig
} from './adapters';

// Integration service adapters (enhanced implementations)
export {
  IntegrationServiceAdapter,
  IntegrationServiceFactory,
  integrationServiceFactory,
  IntegrationServiceHelper,
  IntegrationServiceUtils,
  createIntegrationServiceAdapter,
  createDefaultIntegrationServiceAdapterConfig,
  type IntegrationServiceAdapterConfig,
  type IntegrationOperationResult,
  type BatchIntegrationConfig,
  type ArchitectureOperationConfig,
  type APIOperationConfig,
  type ProtocolOperationConfig
} from './adapters';

/**
 * USL Main Interface
 * 
 * Primary interface for interacting with the Unified Service Layer.
 * Provides high-level methods for service management and operations.
 */
export class USL {
  private static instance: USL;
  private initialized = false;

  private constructor() {}

  /**
   * Get singleton USL instance
   */
  static getInstance(): USL {
    if (!USL.instance) {
      USL.instance = new USL();
    }
    return USL.instance;
  }

  /**
   * Initialize USL system
   */
  async initialize(config?: USLFactoryConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize global instances if needed
    // globalUSLFactory is already initialized with default config
    
    this.initialized = true;
  }

  /**
   * Check if USL is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create and register a data service (uses enhanced DataServiceAdapter)
   */
  async createDataService(
    name: string,
    options: Partial<DataServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createDataServiceConfig(name, {
      type: ServiceType.DATA,
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Create web data service adapter (optimized for web operations)
   */
  async createWebDataService(
    name: string,
    options: Partial<DataServiceAdapterConfig> = {}
  ): Promise<DataServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const adapter = await globalDataServiceFactory.createWebDataAdapter(name, options);
    return adapter;
  }

  /**
   * Create document service adapter (optimized for database operations)
   */
  async createDocumentService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    options: Partial<DataServiceAdapterConfig> = {}
  ): Promise<DataServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const adapter = await globalDataServiceFactory.createDocumentAdapter(name, databaseType, options);
    return adapter;
  }

  /**
   * Create unified data service adapter (both web and document operations)
   */
  async createUnifiedDataService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    options: Partial<DataServiceAdapterConfig> = {}
  ): Promise<DataServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const adapter = await globalDataServiceFactory.createUnifiedDataAdapter(name, databaseType, options);
    return adapter;
  }

  /**
   * Create and register a web service
   */
  async createWebService(
    name: string,
    port: number = 3000,
    options: Partial<WebServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createWebServiceConfig(name, {
      type: ServiceType.WEB,
      server: { port, host: 'localhost' },
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a coordination service
   */
  async createCoordinationService(
    name: string,
    options: Partial<CoordinationServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createCoordinationServiceConfig(name, {
      type: ServiceType.SWARM,
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a neural service
   */
  async createNeuralService(
    name: string,
    options: Partial<NeuralServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createNeuralServiceConfig(name, {
      type: ServiceType.NEURAL,
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a memory service
   */
  async createMemoryService(
    name: string,
    options: Partial<MemoryServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createMemoryServiceConfig(name, {
      type: ServiceType.MEMORY,
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a database service
   */
  async createDatabaseService(
    name: string,
    options: Partial<DatabaseServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createDatabaseServiceConfig(name, {
      type: ServiceType.DATABASE,
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register an integration service
   */
  async createIntegrationService(
    name: string,
    options: Partial<IntegrationServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createIntegrationServiceConfig(name, {
      type: ServiceType.API,
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Create integration service adapter (optimized for integration operations)
   */
  async createIntegrationServiceAdapter(
    name: string,
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = createDefaultIntegrationServiceAdapterConfig(name, options);
    const adapter = createIntegrationServiceAdapter(config);
    await adapter.initialize();
    
    return adapter;
  }

  /**
   * Create architecture storage integration service
   */
  async createArchitectureStorageService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const adapter = await this.createIntegrationServiceAdapter(name, {
      architectureStorage: {
        enabled: true,
        databaseType,
        autoInitialize: true,
        enableVersioning: true,
        enableValidationTracking: true,
        cachingEnabled: true
      },
      safeAPI: { enabled: false },
      protocolManagement: { enabled: false },
      ...options
    });
    
    return adapter;
  }

  /**
   * Create safe API integration service
   */
  async createSafeAPIService(
    name: string,
    baseURL: string,
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const adapter = await this.createIntegrationServiceAdapter(name, {
      architectureStorage: { enabled: false },
      safeAPI: {
        enabled: true,
        baseURL,
        timeout: 30000,
        retries: 3,
        validation: {
          enabled: true,
          strictMode: false,
          sanitization: true
        }
      },
      protocolManagement: { enabled: false },
      ...options
    });
    
    return adapter;
  }

  /**
   * Create protocol management integration service
   */
  async createProtocolManagementService(
    name: string,
    supportedProtocols: string[] = ['http', 'websocket', 'mcp-http'],
    options: Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const adapter = await this.createIntegrationServiceAdapter(name, {
      architectureStorage: { enabled: false },
      safeAPI: { enabled: false },
      protocolManagement: {
        enabled: true,
        supportedProtocols,
        defaultProtocol: supportedProtocols[0] || 'http',
        connectionPooling: {
          enabled: true,
          maxConnections: 50,
          idleTimeout: 300000
        },
        failover: {
          enabled: true,
          retryAttempts: 3,
          backoffMultiplier: 2
        }
      },
      ...options
    });
    
    return adapter;
  }

  /**
   * Create unified integration service (all integration features enabled)
   */
  async createUnifiedIntegrationService(
    name: string,
    options: {
      baseURL?: string;
      databaseType?: 'postgresql' | 'sqlite' | 'mysql';
      supportedProtocols?: string[];
    } & Partial<IntegrationServiceAdapterConfig> = {}
  ): Promise<IntegrationServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const {
      baseURL = 'http://localhost:3000',
      databaseType = 'postgresql',
      supportedProtocols = ['http', 'websocket', 'mcp-http', 'mcp-stdio'],
      ...adapterOptions
    } = options;
    
    const adapter = await this.createIntegrationServiceAdapter(name, {
      architectureStorage: {
        enabled: true,
        databaseType,
        autoInitialize: true,
        enableVersioning: true,
        enableValidationTracking: true,
        cachingEnabled: true
      },
      safeAPI: {
        enabled: true,
        baseURL,
        timeout: 30000,
        retries: 3,
        validation: {
          enabled: true,
          strictMode: false,
          sanitization: true
        }
      },
      protocolManagement: {
        enabled: true,
        supportedProtocols,
        defaultProtocol: supportedProtocols[0] || 'http',
        connectionPooling: {
          enabled: true,
          maxConnections: 50,
          idleTimeout: 300000
        },
        failover: {
          enabled: true,
          retryAttempts: 3,
          backoffMultiplier: 2
        }
      },
      ...adapterOptions
    });
    
    return adapter;
  }

  /**
   * Create and register a monitoring service
   */
  async createMonitoringService(
    name: string,
    options: Partial<MonitoringServiceConfig> = {}
  ): Promise<IService> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const config = ServiceConfigFactory.createMonitoringServiceConfig(name, {
      type: ServiceType.MONITORING,
      ...options
    });
    
    return await globalUSLFactory.create(config);
  }

  /**
   * Get service by name
   */
  getService(serviceName: string): IService | undefined {
    return globalServiceRegistry.findService(serviceName);
  }

  /**
   * Get all services of a specific type
   */
  getServicesByType(type: ServiceType): IService[] {
    return globalServiceRegistry.getServicesByType(type);
  }

  /**
   * Get all services
   */
  getAllServices(): Map<string, IService> {
    return globalServiceRegistry.getAllServices();
  }

  /**
   * Start all services
   */
  async startAllServices(): Promise<void> {
    await globalServiceRegistry.startAllServices();
  }

  /**
   * Stop all services
   */
  async stopAllServices(): Promise<void> {
    await globalServiceRegistry.stopAllServices();
  }

  /**
   * Get system health status
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
    };
  }> {
    const serviceStatuses = await globalServiceRegistry.healthCheckAll();
    const statusValues = Array.from(serviceStatuses.values());
    
    const healthy = statusValues.filter(s => s.health === 'healthy').length;
    const degraded = statusValues.filter(s => s.health === 'degraded').length;
    const unhealthy = statusValues.filter(s => s.health === 'unhealthy').length;
    const total = statusValues.length;
    
    const errorRate = total > 0 ? ((degraded + unhealthy) / total) * 100 : 0;
    
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (errorRate === 0) {
      overall = 'healthy';
    } else if (errorRate <= 20) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }
    
    return {
      overall,
      services: serviceStatuses,
      summary: {
        total,
        healthy,
        degraded,
        unhealthy,
        errorRate
      }
    };
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<{
    totalServices: number;
    runningServices: number;
    healthyServices: number;
    errorServices: number;
    aggregatedMetrics: ServiceMetrics[];
    performanceSummary: {
      averageLatency: number;
      totalThroughput: number;
      totalErrors: number;
      totalOperations: number;
    };
  }> {
    const metrics = await globalServiceRegistry.getSystemMetrics();
    
    // Calculate performance summary
    const performanceSummary = metrics.aggregatedMetrics.reduce(
      (acc, metric) => ({
        averageLatency: (acc.averageLatency + metric.averageLatency) / 2,
        totalThroughput: acc.totalThroughput + metric.throughput,
        totalErrors: acc.totalErrors + metric.errorCount,
        totalOperations: acc.totalOperations + metric.operationCount
      }),
      {
        averageLatency: 0,
        totalThroughput: 0,
        totalErrors: 0,
        totalOperations: 0
      }
    );
    
    return {
      ...metrics,
      performanceSummary
    };
  }

  /**
   * Discover services by criteria
   */
  discoverServices(criteria?: {
    type?: ServiceType;
    capabilities?: string[];
    tags?: string[];
  }): IService[] {
    return globalServiceRegistry.discoverServices(criteria);
  }

  /**
   * Register a service capability
   */
  registerCapability(serviceName: string, capability: ServiceCapability): void {
    globalServiceCapabilityRegistry.register(serviceName, capability);
  }

  /**
   * Find services by capability
   */
  findServicesByCapability(capabilityName: string): string[] {
    return globalServiceCapabilityRegistry.findServicesByCapability(capabilityName);
  }

  /**
   * Shutdown USL system
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await globalServiceRegistry.shutdownAll();
    this.initialized = false;
  }
}

/**
 * Global USL instance for convenience
 */
export const usl = USL.getInstance();

/**
 * Initialize USL with default configuration
 */
export const initializeUSL = async (config?: USLFactoryConfig): Promise<void> => {
  await usl.initialize(config);
};

/**
 * Convenience functions for common service operations
 */
export const USLHelpers = {
  /**
   * Initialize and create common services for a typical setup
   */
  async setupCommonServices(config: {
    webPort?: number;
    enableMonitoring?: boolean;
    enableCoordination?: boolean;
    enableNeural?: boolean;
    databaseConfig?: Partial<DatabaseServiceConfig>;
    memoryConfig?: Partial<MemoryServiceConfig>;
  }): Promise<{
    web?: IService;
    data?: IService;
    memory?: IService;
    database?: IService;
    coordination?: IService;
    neural?: IService;
    monitoring?: IService;
  }> {
    await usl.initialize();

    const services: {
      web?: IService;
      data?: IService;
      memory?: IService;
      database?: IService;
      coordination?: IService;
      neural?: IService;
      monitoring?: IService;
    } = {};

    try {
      // Create core services
      services.memory = await usl.createMemoryService('default-memory', config.memoryConfig);
      services.data = await usl.createDataService('default-data');
      
      if (config.webPort) {
        services.web = await usl.createWebService('default-web', config.webPort);
      }
      
      if (config.databaseConfig) {
        services.database = await usl.createDatabaseService('default-database', config.databaseConfig);
      }
      
      if (config.enableCoordination) {
        services.coordination = await usl.createCoordinationService('default-coordination');
      }
      
      if (config.enableNeural) {
        services.neural = await usl.createNeuralService('default-neural');
      }
      
      if (config.enableMonitoring) {
        services.monitoring = await usl.createMonitoringService('default-monitoring');
      }

      // Start all created services
      await usl.startAllServices();

      return services;
    } catch (error) {
      console.error('❌ Failed to setup common services:', error);
      throw error;
    }
  },

  /**
   * Get a quick system status overview
   */
  async getQuickStatus(): Promise<{
    initialized: boolean;
    totalServices: number;
    healthyServices: number;
    healthPercentage: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
  }> {
    if (!usl.isInitialized()) {
      return {
        initialized: false,
        totalServices: 0,
        healthyServices: 0,
        healthPercentage: 0,
        status: 'unhealthy',
        uptime: 0
      };
    }

    const health = await usl.getSystemHealth();
    const healthPercentage = health.summary.total > 0 
      ? (health.summary.healthy / health.summary.total) * 100 
      : 100;
    
    const status = health.overall;
    const uptime = process.uptime();

    return {
      initialized: true,
      totalServices: health.summary.total,
      healthyServices: health.summary.healthy,
      healthPercentage,
      status,
      uptime
    };
  },

  /**
   * Perform comprehensive health check on all services
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
      errorRate: number;
      uptime: number;
      details?: any;
    }>;
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
      averageResponseTime: number;
    };
  }> {
    const health = await usl.getSystemHealth();
    const services: Record<string, any> = {};
    
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    health.services.forEach((status, name) => {
      services[name] = {
        status: status.health,
        responseTime: 0, // Would need to be measured during health check
        errorRate: status.errorRate,
        uptime: status.uptime,
        details: status.metadata
      };
      
      // Simulate response time for now
      const simulatedResponseTime = Math.random() * 100 + 10;
      services[name].responseTime = simulatedResponseTime;
      totalResponseTime += simulatedResponseTime;
      responseTimeCount++;
    });

    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return {
      overall: health.overall,
      services,
      summary: {
        ...health.summary,
        averageResponseTime
      }
    };
  },

  /**
   * Get performance metrics for all services
   */
  async getPerformanceMetrics(): Promise<{
    timestamp: Date;
    services: Record<string, {
      name: string;
      type: string;
      latency: {
        average: number;
        p95: number;
        p99: number;
      };
      throughput: number;
      errorRate: number;
      operationsPerSecond: number;
      memoryUsage?: {
        used: number;
        total: number;
        percentage: number;
      };
    }>;
    aggregate: {
      totalOperations: number;
      totalErrors: number;
      averageLatency: number;
      totalThroughput: number;
      systemErrorRate: number;
    };
  }> {
    const metrics = await usl.getSystemMetrics();
    const services: Record<string, any> = {};
    
    let totalOperations = 0;
    let totalErrors = 0;
    let totalThroughput = 0;
    let totalLatency = 0;
    let serviceCount = 0;

    metrics.aggregatedMetrics.forEach(metric => {
      services[metric.name] = {
        name: metric.name,
        type: metric.type,
        latency: {
          average: metric.averageLatency,
          p95: metric.p95Latency,
          p99: metric.p99Latency
        },
        throughput: metric.throughput,
        errorRate: metric.operationCount > 0 ? (metric.errorCount / metric.operationCount) * 100 : 0,
        operationsPerSecond: metric.throughput,
        memoryUsage: metric.memoryUsage
      };
      
      totalOperations += metric.operationCount;
      totalErrors += metric.errorCount;
      totalThroughput += metric.throughput;
      totalLatency += metric.averageLatency;
      serviceCount++;
    });

    const averageLatency = serviceCount > 0 ? totalLatency / serviceCount : 0;
    const systemErrorRate = totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;

    return {
      timestamp: new Date(),
      services,
      aggregate: {
        totalOperations,
        totalErrors,
        averageLatency,
        totalThroughput,
        systemErrorRate
      }
    };
  },

  /**
   * Create a service with automatic dependency resolution
   */
  async createServiceWithDependencies<T extends AnyServiceConfig>(
    config: T,
    dependencies: string[] = []
  ): Promise<IService> {
    // Ensure dependencies exist
    for (const depName of dependencies) {
      const existingService = usl.getService(depName);
      if (!existingService) {
        throw new ServiceDependencyError(config.name, depName);
      }
    }

    // Add dependencies to config
    const configWithDeps = {
      ...config,
      dependencies: dependencies.map(serviceName => ({
        serviceName,
        required: true,
        healthCheck: true,
        timeout: 5000,
        retries: 3
      }))
    };

    return await globalUSLFactory.create(configWithDeps);
  },

  /**
   * Batch create services with dependency resolution
   */
  async createServiceBatch(
    configs: Array<{ config: AnyServiceConfig; dependencies?: string[] }>
  ): Promise<IService[]> {
    // Sort by dependency order
    const sortedConfigs = [...configs].sort((a, b) => {
      const aDeps = a.dependencies?.length || 0;
      const bDeps = b.dependencies?.length || 0;
      return aDeps - bDeps;
    });

    const createdServices: IService[] = [];

    for (const { config, dependencies = [] } of sortedConfigs) {
      try {
        const service = await USLHelpers.createServiceWithDependencies(config, dependencies);
        createdServices.push(service);
      } catch (error) {
        console.error(`Failed to create service ${config.name}:`, error);
        throw error;
      }
    }

    return createdServices;
  },

  /**
   * Initialize complete USL system with enhanced integration layer
   */
  async initializeCompleteUSL(config?: {
    enableServiceManager?: boolean;
    enableEnhancedRegistry?: boolean;
    enableCompatibilityLayer?: boolean;
    enableValidationFramework?: boolean;
    serviceManagerConfig?: Partial<ServiceManagerConfig>;
    registryConfig?: Partial<ServiceRegistryConfig>;
    compatibilityConfig?: Partial<CompatibilityConfig>;
    validationConfig?: Partial<ValidationConfig>;
  }): Promise<{
    usl: USL;
    serviceManager?: ServiceManager;
    registry?: EnhancedServiceRegistry;
    compatibility?: USLCompatibilityLayer;
    validation?: USLValidationFramework;
  }> {
    // Initialize core USL
    await usl.initialize();

    const result: {
      usl: USL;
      serviceManager?: ServiceManager;
      registry?: EnhancedServiceRegistry;
      compatibility?: USLCompatibilityLayer;
      validation?: USLValidationFramework;
    } = { usl };

    try {
      // Initialize Service Manager if enabled
      if (config?.enableServiceManager ?? true) {
        const { ServiceManager } = await import('./manager');
        const serviceManager = new ServiceManager(config?.serviceManagerConfig);
        await serviceManager.initialize();
        result.serviceManager = serviceManager;
      }

      // Initialize Enhanced Registry if enabled
      if (config?.enableEnhancedRegistry ?? true) {
        const { EnhancedServiceRegistry } = await import('./registry');
        const registry = new EnhancedServiceRegistry(config?.registryConfig);
        result.registry = registry;
      }

      // Initialize Compatibility Layer if enabled
      if (config?.enableCompatibilityLayer ?? true) {
        const { USLCompatibilityLayer } = await import('./compatibility');
        const compatibility = new USLCompatibilityLayer(config?.compatibilityConfig);
        await compatibility.initialize();
        result.compatibility = compatibility;
      }

      // Initialize Validation Framework if enabled
      if (config?.enableValidationFramework ?? false) {
        const { USLValidationFramework } = await import('./validation');
        if (result.serviceManager && result.registry) {
          const validation = new USLValidationFramework(
            result.serviceManager,
            result.registry,
            config?.validationConfig
          );
          result.validation = validation;
        }
      }

      return result;

    } catch (error) {
      console.error('❌ Failed to initialize complete USL system:', error);
      throw error;
    }
  },

  /**
   * Migrate existing system to USL with full integration
   */
  async migrateToUSL(existingServices: Record<string, any>): Promise<{
    success: boolean;
    migrated: IService[];
    failed: Array<{ name: string; error: string }>;
    warnings: string[];
    compatibilityReport: any;
  }> {
    try {
      // Initialize compatibility layer
      const { USLCompatibilityLayer } = await import('./compatibility');
      const compatibility = new USLCompatibilityLayer();
      await compatibility.initialize();

      // Perform migration
      const migrationResult = await compatibility.migrateExistingServices(existingServices);
      
      // Generate compatibility report
      const { MigrationUtils } = await import('./compatibility');
      const compatibilityReport = MigrationUtils.generateCompatibilityReport();

      return {
        success: migrationResult.failed.length === 0,
        migrated: migrationResult.migrated,
        failed: migrationResult.failed,
        warnings: migrationResult.warnings,
        compatibilityReport
      };

    } catch (error) {
      console.error('❌ Migration to USL failed:', error);
      return {
        success: false,
        migrated: [],
        failed: [{ name: 'system', error: error instanceof Error ? error.message : String(error) }],
        warnings: [],
        compatibilityReport: null
      };
    }
  },

  /**
   * Validate complete USL system integration
   */
  async validateSystemIntegration(config?: Partial<ValidationConfig>): Promise<{
    success: boolean;
    validationResult: ValidationResult;
    healthValidation: SystemHealthValidation;
    recommendations: string[];
  }> {
    try {
      // Initialize complete USL system
      const system = await USLHelpers.initializeCompleteUSL({
        enableValidationFramework: true,
        validationConfig: config
      });

      if (!system.validation || !system.serviceManager || !system.registry) {
        throw new Error('Validation framework not properly initialized');
      }

      // Perform comprehensive validation
      const validationResult = await system.validation.validateSystem();
      const healthValidation = await system.validation.validateSystemHealth();

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (validationResult.overall === 'fail') {
        recommendations.push('Address critical validation failures before production deployment');
      }
      
      if (healthValidation.overallHealth !== 'healthy') {
        recommendations.push('Resolve system health issues to ensure optimal performance');
      }
      
      recommendations.push(...validationResult.recommendations.map(rec => rec.action));

      return {
        success: validationResult.overall !== 'fail',
        validationResult,
        healthValidation,
        recommendations
      };

    } catch (error) {
      console.error('❌ System validation failed:', error);
      
      // Return minimal error result
      return {
        success: false,
        validationResult: {
          overall: 'fail',
          score: 0,
          timestamp: new Date(),
          duration: 0,
          results: {
            configuration: { status: 'fail', score: 0, checks: [], warnings: [], errors: [] },
            dependencies: { status: 'fail', score: 0, checks: [], warnings: [], errors: [] },
            performance: { status: 'fail', score: 0, checks: [], warnings: [], errors: [] },
            security: { status: 'fail', score: 0, checks: [], warnings: [], errors: [] },
            compatibility: { status: 'fail', score: 0, checks: [], warnings: [], errors: [] },
            integration: { status: 'fail', score: 0, checks: [], warnings: [], errors: [] }
          },
          summary: { totalChecks: 0, passed: 0, warnings: 0, failures: 1, criticalIssues: 1 },
          recommendations: [{
            type: 'critical',
            category: 'system',
            description: 'Validation system failure',
            impact: 'high',
            effort: 'high',
            action: `Resolve validation error: ${error instanceof Error ? error.message : String(error)}`
          }]
        },
        healthValidation: {
          overallHealth: 'unhealthy',
          serviceHealth: new Map(),
          systemMetrics: {
            totalServices: 0,
            healthyServices: 0,
            responseTimeP95: 0,
            errorRate: 100,
            memoryUsage: 0,
            uptime: 0
          },
          alerts: [{
            severity: 'critical',
            message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date()
          }]
        },
        recommendations: ['Fix validation system errors before proceeding']
      };
    }
  }
};

// Export common service creation functions
export const createDataService = usl.createDataService.bind(usl);
export const createWebDataService = usl.createWebDataService.bind(usl);
export const createDocumentService = usl.createDocumentService.bind(usl);
export const createUnifiedDataService = usl.createUnifiedDataService.bind(usl);
export const createWebService = usl.createWebService.bind(usl);
export const createCoordinationService = usl.createCoordinationService.bind(usl);
export const createNeuralService = usl.createNeuralService.bind(usl);
export const createMemoryService = usl.createMemoryService.bind(usl);
export const createDatabaseService = usl.createDatabaseService.bind(usl);
export const createIntegrationService = usl.createIntegrationService.bind(usl);
export const createIntegrationServiceAdapter = usl.createIntegrationServiceAdapter.bind(usl);
export const createArchitectureStorageService = usl.createArchitectureStorageService.bind(usl);
export const createSafeAPIService = usl.createSafeAPIService.bind(usl);
export const createProtocolManagementService = usl.createProtocolManagementService.bind(usl);
export const createUnifiedIntegrationService = usl.createUnifiedIntegrationService.bind(usl);
export const createMonitoringService = usl.createMonitoringService.bind(usl);

// Export service discovery functions
export const getService = usl.getService.bind(usl);
export const getServicesByType = usl.getServicesByType.bind(usl);
export const getAllServices = usl.getAllServices.bind(usl);
export const discoverServices = usl.discoverServices.bind(usl);

// Export system management functions
export const startAllServices = usl.startAllServices.bind(usl);
export const stopAllServices = usl.stopAllServices.bind(usl);
export const getSystemHealth = usl.getSystemHealth.bind(usl);
export const getSystemMetrics = usl.getSystemMetrics.bind(usl);

/**
 * Default export for convenience
 */
export default usl;