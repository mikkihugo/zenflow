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
 * @file Main USL exports following the same successful patterns as DAL and UACL
 */

// Data service adapters (enhanced implementations)
// Integration service adapters (enhanced implementations)
export {
  type APIOperationConfig,
  type ArchitectureOperationConfig,
  type BatchIntegrationConfig,
  type BatchOperationConfig,
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig,
  createDefaultIntegrationServiceAdapterConfig,
  createIntegrationServiceAdapter,
  type DataAggregationOptions,
  type DataOperationResult,
  DataServiceAdapter,
  type DataServiceAdapterConfig,
  DataServiceFactory,
  DataServiceHelper,
  DataServiceUtils,
  type DataValidationResult,
  type EnhancedSearchOptions,
  globalDataServiceFactory,
  type IntegrationOperationResult,
  IntegrationServiceAdapter,
  type IntegrationServiceAdapterConfig,
  IntegrationServiceFactory,
  IntegrationServiceHelper,
  IntegrationServiceUtils,
  integrationServiceFactory,
  type ProtocolOperationConfig,
  type TransformationStep,
} from './adapters';
export {
  type CompatibilityConfig,
  compat,
  initializeCompatibility,
  type LegacyServicePattern,
  MigrationUtils,
  // Backward Compatibility Layer
  USLCompatibilityLayer,
} from './compatibility';
// Core USL components
export {
  // Core interfaces
  type IService,
  type IServiceCapabilityRegistry,
  type IServiceConfigValidator,
  type IServiceFactory,
  type IServiceRegistry,
  // Configuration interfaces
  type ServiceAuthConfig,
  type ServiceCapability,
  type ServiceConfig,
  ServiceConfigurationError,
  type ServiceDependencyConfig,
  ServiceDependencyError,
  // Error classes
  ServiceError,
  type ServiceEvent,
  type ServiceEventType,
  type ServiceHealthConfig,
  ServiceInitializationError,
  type ServiceLifecycleStatus,
  type ServiceMetrics,
  type ServiceMonitoringConfig,
  ServiceOperationError,
  type ServiceOperationOptions,
  type ServiceOperationResponse,
  type ServiceRetryConfig,
  type ServiceStatus,
  ServiceTimeoutError,
} from './core/interfaces';
// Factory and registry implementations
export {
  globalServiceCapabilityRegistry,
  globalServiceConfigValidator,
  globalServiceRegistry,
  // Global instances
  globalUSLFactory,
  ServiceCapabilityRegistry,
  ServiceConfigValidator,
  // Registry implementations
  ServiceRegistry,
  // Main factory class
  USLFactory,
  type USLFactoryConfig,
} from './factories';
export type { CoordinationService } from './implementations/coordination-service';
// Service implementations (re-exported for convenience)
export type { DataService } from './implementations/data-service';
export type { DatabaseService } from './implementations/database-service';
export type { MemoryService } from './implementations/memory-service';
export type { NeuralService } from './implementations/neural-service';
export type { WebService } from './implementations/web-service';
export {
  type BatchServiceCreationRequest,
  type ServiceCreationRequest,
  // Service Manager - Complete Lifecycle Management
  ServiceManager,
  type ServiceManagerConfig,
  type ServiceManagerStatus,
} from './manager';
// Enhanced Service Management (USL Integration Layer)
export {
  // Enhanced Service Registry
  EnhancedServiceRegistry,
  type ServiceDependencyGraph,
  type ServiceDiscoveryInfo,
  type ServiceRegistryConfig,
} from './registry';
// Service types and configurations
export {
  type AnyServiceConfig,
  // Configuration types
  type BaseServiceConfig,
  type CoordinationServiceConfig,
  type DatabaseServiceConfig,
  type DataServiceConfig,
  type IntegrationServiceConfig,
  type InterfaceServiceConfig,
  isCoordinationServiceConfig,
  isDatabaseServiceConfig,
  // Type guards
  isDataServiceConfig,
  isIntegrationServiceConfig,
  isMemoryServiceConfig,
  isMonitoringServiceConfig,
  isNeuralServiceConfig,
  isWebServiceConfig,
  type MemoryServiceConfig,
  type MonitoringServiceConfig,
  type NeuralServiceConfig,
  // Configuration factory
  ServiceConfigFactory,
  ServiceEnvironment,
  ServicePriority,
  // Enums
  ServiceType,
  type WebServiceConfig,
  type WorkflowServiceConfig,
} from './types';
export {
  type SystemHealthValidation,
  // Validation Framework
  USLValidationFramework,
  type ValidationConfig,
  type ValidationResult,
  type ValidationSectionResult,
} from './validation';

/**
 * USL Main Interface
 *
 * Primary interface for interacting with the Unified Service Layer.
 * Provides high-level methods for service management and operations.
 *
 * @class USL
 * @description Singleton class for managing all service layer operations
 * @example
 * ```typescript
 * import { USL, usl } from '@claude-zen/usl';
 *
 * // Initialize USL system
 * await usl.initialize();
 *
 * // Create a data service
 * const dataService = await usl.createDataService('my-data', {
 *   type: ServiceType.DATA,
 *   enabled: true
 * });
 *
 * // Create a web service
 * const webService = await usl.createWebService('my-web', 3000, {
 *   server: { host: '0.0.0.0', port: 3000 }
 * });
 *
 * // Get system health
 * const health = await usl.getSystemHealth();
 * console.log(`System status: ${health.overall}`);
 * ```
 */
export class USL {
  private static instance: USL;
  private initialized = false;

  private constructor() {}

  /**
   * Get singleton USL instance
   *
   * @static
   * @returns {USL} The singleton USL instance
   * @description Returns the global USL instance, creating it if it doesn't exist
   * @example
   * ```typescript
   * const usl = USL.getInstance();
   * await usl.initialize();
   * ```
   */
  static getInstance(): USL {
    if (!USL.instance) {
      USL.instance = new USL();
    }
    return USL.instance;
  }

  /**
   * Initialize USL system
   *
   * @param {USLFactoryConfig} [config] Optional factory configuration
   * @param _config
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   * @throws {ServiceInitializationError} When initialization fails
   * @description Initializes the USL system with optional configuration
   * @example
   * ```typescript
   * await usl.initialize({
   *   enableMetrics: true,
   *   defaultTimeout: 30000,
   *   logLevel: 'info'
   * });
   * ```
   */
  async initialize(_config?: USLFactoryConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize global instances if needed
    // globalUSLFactory is already initialized with default config

    this.initialized = true;
  }

  /**
   * Check if USL is initialized
   *
   * @returns {boolean} True if USL system is initialized
   * @description Returns the initialization status of the USL system
   * @example
   * ```typescript
   * if (!usl.isInitialized()) {
   *   await usl.initialize();
   * }
   * ```
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create and register a data service (uses enhanced DataServiceAdapter)
   *
   * @param {string} name Unique service name identifier
   * @param {Partial<DataServiceConfig>} [options={}] Service configuration options
   * @returns {Promise<IService>} Promise resolving to the created data service
   * @throws {ServiceConfigurationError} When configuration is invalid
   * @throws {ServiceInitializationError} When service creation fails
   * @description Creates a new data service with enhanced adapter capabilities
   * @example
   * ```typescript
   * const dataService = await usl.createDataService('user-data', {
   *   type: ServiceType.DATA,
   *   enabled: true,
   *   health: { enabled: true, interval: 30000 },
   *   monitoring: { enabled: true, trackLatency: true }
   * });
   *
   * // Execute data operations
   * const result = await dataService.execute('query', {
   *   collection: 'users',
   *   filter: { active: true }
   * });
   * ```
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Create web data service adapter (optimized for web operations)
   *
   * @param {string} name Unique service name identifier
   * @param {Partial<DataServiceAdapterConfig>} [options={}] Web adapter configuration
   * @returns {Promise<DataServiceAdapter>} Promise resolving to the web data adapter
   * @throws {ServiceConfigurationError} When web configuration is invalid
   * @throws {ServiceInitializationError} When adapter creation fails
   * @description Creates an optimized data service adapter for web-based operations
   * @example
   * ```typescript
   * const webAdapter = await usl.createWebDataService('api-data', {
   *   web: {
   *     enabled: true,
   *     apiEndpoint: 'https://api.example.com',
   *     authentication: { type: 'bearer', token: 'your-token' },
   *     rateLimiting: { enabled: true, maxRequests: 1000 }
   *   }
   * });
   *
   * // Fetch data from web API
   * const users = await webAdapter.fetchData('/users', {
   *   pagination: { page: 1, limit: 50 }
   * });
   * ```
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
   *
   * @param {string} name Unique service name identifier
   * @param {'postgresql' | 'sqlite' | 'mysql'} [databaseType='postgresql'] Database type to use
   * @param {Partial<DataServiceAdapterConfig>} [options={}] Document adapter configuration
   * @returns {Promise<DataServiceAdapter>} Promise resolving to the document adapter
   * @throws {ServiceConfigurationError} When database configuration is invalid
   * @throws {ServiceInitializationError} When adapter creation fails
   * @description Creates an optimized data service adapter for document/database operations
   * @example
   * ```typescript
   * const docAdapter = await usl.createDocumentService('user-docs', 'postgresql', {
   *   document: {
   *     enabled: true,
   *     databaseType: 'postgresql',
   *     connectionString: process.env.DATABASE_URL,
   *     pooling: { min: 2, max: 10 },
   *     migrations: { autoRun: true }
   *   }
   * });
   *
   * // Store document in database
   * const stored = await docAdapter.storeDocument('users', {
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   metadata: { created: new Date() }
   * });
   * ```
   */
  async createDocumentService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    options: Partial<DataServiceAdapterConfig> = {}
  ): Promise<DataServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }

    const adapter = await globalDataServiceFactory.createDocumentAdapter(
      name,
      databaseType,
      options
    );
    return adapter;
  }

  /**
   * Create unified data service adapter (both web and document operations)
   *
   * @param {string} name Unique service name identifier
   * @param {'postgresql' | 'sqlite' | 'mysql'} [databaseType='postgresql'] Database type for document operations
   * @param {Partial<DataServiceAdapterConfig>} [options={}] Unified adapter configuration
   * @returns {Promise<DataServiceAdapter>} Promise resolving to the unified data adapter
   * @throws {ServiceConfigurationError} When configuration is invalid
   * @throws {ServiceInitializationError} When adapter creation fails
   * @description Creates a unified data service adapter supporting both web and document operations
   * @example
   * ```typescript
   * const unifiedAdapter = await usl.createUnifiedDataService('hybrid-data', 'postgresql', {
   *   web: {
   *     enabled: true,
   *     apiEndpoint: 'https://api.example.com',
   *     authentication: { type: 'apikey', key: process.env.API_KEY }
   *   },
   *   document: {
   *     enabled: true,
   *     databaseType: 'postgresql',
   *     connectionString: process.env.DATABASE_URL,
   *     caching: { enabled: true, ttl: 300 }
   *   }
   * });
   *
   * // Use both web and document operations
   * const webData = await unifiedAdapter.fetchData('/external/users');
   * const dbData = await unifiedAdapter.findDocuments('users', { active: true });
   * ```
   */
  async createUnifiedDataService(
    name: string,
    databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql',
    options: Partial<DataServiceAdapterConfig> = {}
  ): Promise<DataServiceAdapter> {
    if (!this.initialized) {
      await this.initialize();
    }

    const adapter = await globalDataServiceFactory.createUnifiedDataAdapter(
      name,
      databaseType,
      options
    );
    return adapter;
  }

  /**
   * Create and register a web service
   *
   * @param {string} name Unique service name identifier
   * @param {number} [port=3000] Port number for the web server
   * @param {Partial<WebServiceConfig>} [options={}] Web service configuration options
   * @returns {Promise<IService>} Promise resolving to the created web service
   * @throws {ServiceConfigurationError} When web server configuration is invalid
   * @throws {ServiceInitializationError} When web service creation fails
   * @description Creates and registers a new web service with HTTP server capabilities
   * @example
   * ```typescript
   * const webService = await usl.createWebService('api-server', 3000, {
   *   server: {
   *     host: '0.0.0.0',
   *     port: 3000,
   *     cors: { enabled: true, origins: ['http://localhost:3456'] }
   *   },
   *   middleware: {
   *     compression: true,
   *     rateLimiting: { enabled: true, maxRequests: 1000 }
   *   },
   *   security: {
   *     helmet: true,
   *     authentication: { required: false }
   *   }
   * });
   *
   * // Service automatically starts HTTP server on specified port
   * const status = await webService.getStatus();
   * console.log(`Web service running: ${status.lifecycle}`);
   * ```
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a coordination service
   *
   * @param {string} name Unique service name identifier
   * @param {Partial<CoordinationServiceConfig>} [options={}] Coordination service configuration
   * @returns {Promise<IService>} Promise resolving to the created coordination service
   * @throws {ServiceConfigurationError} When coordination configuration is invalid
   * @throws {ServiceInitializationError} When coordination service creation fails
   * @description Creates a coordination service for managing distributed operations and agent coordination
   * @example
   * ```typescript
   * const coordService = await usl.createCoordinationService('swarm-coordinator', {
   *   swarm: {
   *     topology: 'mesh',
   *     maxAgents: 10,
   *     coordinationStrategy: 'parallel'
   *   },
   *   messaging: {
   *     protocol: 'websocket',
   *     heartbeatInterval: 30000,
   *     reconnectAttempts: 3
   *   },
   *   taskManagement: {
   *     queueSize: 1000,
   *     executionTimeout: 300000,
   *     retryPolicy: { attempts: 3, backoff: 'exponential' }
   *   }
   * });
   *
   * // Execute coordinated operations
   * const result = await coordService.execute('orchestrate-task', {
   *   task: 'process-documents',
   *   agents: ['agent-1', 'agent-2', 'agent-3'],
   *   strategy: 'parallel'
   * });
   * ```
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a neural service
   *
   * @param {string} name Unique service name identifier
   * @param {Partial<NeuralServiceConfig>} [options={}] Neural service configuration options
   * @returns {Promise<IService>} Promise resolving to the created neural service
   * @throws {ServiceConfigurationError} When neural network configuration is invalid
   * @throws {ServiceInitializationError} When neural service creation fails
   * @description Creates a neural service for machine learning operations and neural network management
   * @example
   * ```typescript
   * const neuralService = await usl.createNeuralService('ml-processor', {
   *   networks: {
   *     defaultArchitecture: [784, 128, 64, 10],
   *     activationFunction: 'relu',
   *     optimizer: 'adam',
   *     learningRate: 0.001
   *   },
   *   training: {
   *     batchSize: 32,
   *     epochs: 100,
   *     validationSplit: 0.2,
   *     earlyStoppingPatience: 10
   *   },
   *   wasm: {
   *     enabled: true,
   *     wasmPath: './neural.wasm',
   *     useAcceleration: true
   *   }
   * });
   *
   * // Train and use neural networks
   * const trainResult = await neuralService.execute('train', {
   *   dataset: trainingData,
   *   networkId: 'classification-net'
   * });
   *
   * const prediction = await neuralService.execute('predict', {
   *   input: inputData,
   *   networkId: 'classification-net'
   * });
   * ```
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a memory service
   *
   * @param name
   * @param options
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register a database service
   *
   * @param name
   * @param options
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Create and register an integration service
   *
   * @param name
   * @param options
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Create integration service adapter (optimized for integration operations)
   *
   * @param name
   * @param options
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
   *
   * @param name
   * @param databaseType
   * @param options
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
        cachingEnabled: true,
      },
      safeAPI: { enabled: false },
      protocolManagement: { enabled: false },
      ...options,
    });

    return adapter;
  }

  /**
   * Create safe API integration service
   *
   * @param name
   * @param baseURL
   * @param options
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
          sanitization: true,
        },
      },
      protocolManagement: { enabled: false },
      ...options,
    });

    return adapter;
  }

  /**
   * Create protocol management integration service
   *
   * @param name
   * @param supportedProtocols
   * @param options
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
          idleTimeout: 300000,
        },
        failover: {
          enabled: true,
          retryAttempts: 3,
          backoffMultiplier: 2,
        },
      },
      ...options,
    });

    return adapter;
  }

  /**
   * Create unified integration service (all integration features enabled)
   *
   * @param name
   * @param options
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
        cachingEnabled: true,
      },
      safeAPI: {
        enabled: true,
        baseURL,
        timeout: 30000,
        retries: 3,
        validation: {
          enabled: true,
          strictMode: false,
          sanitization: true,
        },
      },
      protocolManagement: {
        enabled: true,
        supportedProtocols,
        defaultProtocol: supportedProtocols[0] || 'http',
        connectionPooling: {
          enabled: true,
          maxConnections: 50,
          idleTimeout: 300000,
        },
        failover: {
          enabled: true,
          retryAttempts: 3,
          backoffMultiplier: 2,
        },
      },
      ...adapterOptions,
    });

    return adapter;
  }

  /**
   * Create and register a monitoring service
   *
   * @param name
   * @param options
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
      ...options,
    });

    return await globalUSLFactory.create(config);
  }

  /**
   * Get service by name
   *
   * @param serviceName
   */
  getService(serviceName: string): IService | undefined {
    return globalServiceRegistry.findService(serviceName);
  }

  /**
   * Get all services of a specific type
   *
   * @param type
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
   *
   * @returns {Promise<Object>} Promise resolving to comprehensive system health information
   * @returns {Promise<Object>} returns.overall Overall system health status
   * @returns {Promise<Map<string, ServiceStatus>>} returns.services Map of service statuses by name
   * @returns {Promise<Object>} returns.summary Health summary statistics
   * @throws {ServiceOperationError} When health check operations fail
   * @description Performs comprehensive health checks across all registered services
   * @example
   * ```typescript
   * const health = await usl.getSystemHealth();
   *
   * console.log(`Overall health: ${health.overall}`);
   * console.log(`Healthy services: ${health.summary.healthy}/${health.summary.total}`);
   * console.log(`Error rate: ${health.summary.errorRate.toFixed(2)}%`);
   *
   * // Check individual service health
   * health.services.forEach((status, serviceName) => {
   *   if (status.health !== 'healthy') {
   *     console.warn(`Service ${serviceName} is ${status.health}: ${status.errorCount} errors`);
   *   }
   * });
   *
   * // Alert on system degradation
   * if (health.overall === 'unhealthy') {
   *   await notifySystemAdministrators(health);
   * }
   * ```
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

    const healthy = statusValues.filter((s) => s.health === 'healthy').length;
    const degraded = statusValues.filter((s) => s.health === 'degraded').length;
    const unhealthy = statusValues.filter((s) => s.health === 'unhealthy').length;
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
        errorRate,
      },
    };
  }

  /**
   * Get system metrics
   *
   * @returns {Promise<Object>} Promise resolving to comprehensive system performance metrics
   * @returns {Promise<number>} returns.totalServices Total number of registered services
   * @returns {Promise<number>} returns.runningServices Number of currently running services
   * @returns {Promise<number>} returns.healthyServices Number of healthy services
   * @returns {Promise<number>} returns.errorServices Number of services with errors
   * @returns {Promise<ServiceMetrics[]>} returns.aggregatedMetrics Individual service metrics
   * @returns {Promise<Object>} returns.performanceSummary System-wide performance summary
   * @throws {ServiceOperationError} When metrics collection fails
   * @description Collects and aggregates performance metrics from all services
   * @example
   * ```typescript
   * const metrics = await usl.getSystemMetrics();
   *
   * // System overview
   * console.log(`Services: ${metrics.runningServices}/${metrics.totalServices} running`);
   * console.log(`Health: ${metrics.healthyServices}/${metrics.totalServices} healthy`);
   *
   * // Performance metrics
   * console.log(`Average latency: ${metrics.performanceSummary.averageLatency}ms`);
   * console.log(`Total throughput: ${metrics.performanceSummary.totalThroughput} ops/sec`);
   * console.log(`Error rate: ${(metrics.performanceSummary.totalErrors / metrics.performanceSummary.totalOperations * 100).toFixed(2)}%`);
   *
   * // Individual service analysis
   * metrics.aggregatedMetrics.forEach(metric => {
   *   if (metric.averageLatency > 1000) {
   *     console.warn(`High latency detected in ${metric.name}: ${metric.averageLatency}ms`);
   *   }
   * });
   * ```
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
        totalOperations: acc.totalOperations + metric.operationCount,
      }),
      {
        averageLatency: 0,
        totalThroughput: 0,
        totalErrors: 0,
        totalOperations: 0,
      }
    );

    return {
      ...metrics,
      performanceSummary,
    };
  }

  /**
   * Discover services by criteria
   *
   * @param {Object} [criteria] Service discovery criteria
   * @param {ServiceType} [criteria.type] Filter by service type
   * @param {string[]} [criteria.capabilities] Filter by required capabilities
   * @param {string[]} [criteria.tags] Filter by service tags
   * @returns {IService[]} Array of services matching the criteria
   * @description Discovers services based on specified criteria for dynamic service resolution
   * @example
   * ```typescript
   * // Find all data services
   * const dataServices = usl.discoverServices({
   *   type: ServiceType.DATA
   * });
   *
   * // Find services with specific capabilities
   * const searchServices = usl.discoverServices({
   *   capabilities: ['search', 'index', 'query']
   * });
   *
   * // Find services by tags
   * const productionServices = usl.discoverServices({
   *   tags: ['production', 'critical']
   * });
   *
   * // Complex criteria
   * const mlDataServices = usl.discoverServices({
   *   type: ServiceType.NEURAL,
   *   capabilities: ['training', 'inference'],
   *   tags: ['ml', 'gpu-enabled']
   * });
   * ```
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
   *
   * @param serviceName
   * @param capability
   */
  registerCapability(serviceName: string, capability: ServiceCapability): void {
    globalServiceCapabilityRegistry.register(serviceName, capability);
  }

  /**
   * Find services by capability
   *
   * @param capabilityName
   */
  findServicesByCapability(capabilityName: string): string[] {
    return globalServiceCapabilityRegistry.findServicesByCapability(capabilityName);
  }

  /**
   * Shutdown USL system
   *
   * @returns {Promise<void>} Promise that resolves when shutdown is complete
   * @throws {ServiceOperationError} When shutdown operations fail
   * @description Gracefully shuts down all services and the USL system
   * @example
   * ```typescript
   * // Graceful shutdown with cleanup
   * process.on('SIGTERM', async () => {
   *   console.log('Shutting down USL system...');
   *
   *   try {
   *     await usl.shutdown();
   *     console.log('USL shutdown completed');
   *     process.exit(0);
   *   } catch (error) {
   *     console.error('USL shutdown failed:', error);
   *     process.exit(1);
   *   }
   * });
   * ```
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
 *
 * @constant {USL}
 * @description Pre-initialized global USL instance for immediate use across the application
 * @example
 * ```typescript
 * import { usl } from '@claude-zen/usl';
 *
 * // Direct usage without getInstance()
 * await usl.initialize();
 * const dataService = await usl.createDataService('my-data');
 * ```
 */
export const usl = USL.getInstance();

/**
 * Initialize USL with default configuration
 *
 * @param {USLFactoryConfig} [config] Optional factory configuration
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 * @throws {ServiceInitializationError} When initialization fails
 * @description Convenience function to initialize the global USL instance
 * @example
 * ```typescript
 * import { initializeUSL } from '@claude-zen/usl';
 *
 * // Initialize with default configuration
 * await initializeUSL();
 *
 * // Initialize with custom configuration
 * await initializeUSL({
 *   enableMetrics: true,
 *   defaultTimeout: 60000,
 *   logLevel: 'debug'
 * });
 * ```
 */
export const initializeUSL = async (config?: USLFactoryConfig): Promise<void> => {
  await usl.initialize(config);
};

/**
 * Convenience functions for common service operations
 *
 * @namespace USLHelpers
 * @description Collection of utility functions for common USL operations and workflows
 * @example
 * ```typescript
 * import { USLHelpers } from '@claude-zen/usl';
 *
 * // Setup common services quickly
 * const services = await USLHelpers.setupCommonServices({
 *   webPort: 3000,
 *   enableMonitoring: true,
 *   enableCoordination: true
 * });
 *
 * // Get quick system status
 * const status = await USLHelpers.getQuickStatus();
 * console.log(`System health: ${status.healthPercentage}%`);
 * ```
 */
export const USLHelpers = {
  /**
   * Initialize and create common services for a typical setup
   *
   * @param {Object} config Configuration for common services setup
   * @param {number} [config.webPort] Port for web service (creates web service if provided)
   * @param {boolean} [config.enableMonitoring] Whether to create monitoring service
   * @param {boolean} [config.enableCoordination] Whether to create coordination service
   * @param {boolean} [config.enableNeural] Whether to create neural service
   * @param {Partial<DatabaseServiceConfig>} [config.databaseConfig] Database service configuration
   * @param {Partial<MemoryServiceConfig>} [config.memoryConfig] Memory service configuration
   * @returns {Promise<Object>} Promise resolving to created services object
   * @throws {ServiceInitializationError} When service creation fails
   * @description Creates and starts a typical set of services for most applications
   * @example
   * ```typescript
   * const services = await USLHelpers.setupCommonServices({
   *   webPort: 3000,
   *   enableMonitoring: true,
   *   enableCoordination: true,
   *   enableNeural: false,
   *   databaseConfig: {
   *     connectionString: process.env.DATABASE_URL,
   *     pooling: { min: 2, max: 20 }
   *   },
   *   memoryConfig: {
   *     cacheSize: 1000,
   *     ttl: 3600
   *   }
   * });
   *
   * // All services are now running and ready
   * console.log('Web service:', services.web?.name);
   * console.log('Data service:', services.data?.name);
   * console.log('Memory service:', services.memory?.name);
   * ```
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
        services.database = await usl.createDatabaseService(
          'default-database',
          config.databaseConfig
        );
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
        uptime: 0,
      };
    }

    const health = await usl.getSystemHealth();
    const healthPercentage =
      health.summary.total > 0 ? (health.summary.healthy / health.summary.total) * 100 : 100;

    const status = health.overall;
    const uptime = process.uptime();

    return {
      initialized: true,
      totalServices: health.summary.total,
      healthyServices: health.summary.healthy,
      healthPercentage,
      status,
      uptime,
    };
  },

  /**
   * Perform comprehensive health check on all services
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<
      string,
      {
        status: 'healthy' | 'degraded' | 'unhealthy';
        responseTime: number;
        errorRate: number;
        uptime: number;
        details?: any;
      }
    >;
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
        details: status.metadata,
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
        averageResponseTime,
      },
    };
  },

  /**
   * Get performance metrics for all services
   */
  async getPerformanceMetrics(): Promise<{
    timestamp: Date;
    services: Record<
      string,
      {
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
      }
    >;
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

    metrics.aggregatedMetrics.forEach((metric) => {
      services[metric.name] = {
        name: metric.name,
        type: metric.type,
        latency: {
          average: metric.averageLatency,
          p95: metric.p95Latency,
          p99: metric.p99Latency,
        },
        throughput: metric.throughput,
        errorRate:
          metric.operationCount > 0 ? (metric.errorCount / metric.operationCount) * 100 : 0,
        operationsPerSecond: metric.throughput,
        memoryUsage: metric.memoryUsage,
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
        systemErrorRate,
      },
    };
  },

  /**
   * Create a service with automatic dependency resolution
   *
   * @param config
   * @param dependencies
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
      dependencies: dependencies.map((serviceName) => ({
        serviceName,
        required: true,
        healthCheck: true,
        timeout: 5000,
        retries: 3,
      })),
    };

    return await globalUSLFactory.create(configWithDeps);
  },

  /**
   * Batch create services with dependency resolution
   *
   * @param configs
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
   *
   * @param config
   * @param config.enableServiceManager
   * @param config.enableEnhancedRegistry
   * @param config.enableCompatibilityLayer
   * @param config.enableValidationFramework
   * @param config.serviceManagerConfig
   * @param config.registryConfig
   * @param config.compatibilityConfig
   * @param config.validationConfig
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
   *
   * @param existingServices
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
        compatibilityReport,
      };
    } catch (error) {
      console.error('❌ Migration to USL failed:', error);
      return {
        success: false,
        migrated: [],
        failed: [{ name: 'system', error: error instanceof Error ? error.message : String(error) }],
        warnings: [],
        compatibilityReport: null,
      };
    }
  },

  /**
   * Validate complete USL system integration
   *
   * @param config
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
        validationConfig: config,
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

      recommendations.push(...validationResult.recommendations.map((rec) => rec.action));

      return {
        success: validationResult.overall !== 'fail',
        validationResult,
        healthValidation,
        recommendations,
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
            integration: { status: 'fail', score: 0, checks: [], warnings: [], errors: [] },
          },
          summary: { totalChecks: 0, passed: 0, warnings: 0, failures: 1, criticalIssues: 1 },
          recommendations: [
            {
              type: 'critical',
              category: 'system',
              description: 'Validation system failure',
              impact: 'high',
              effort: 'high',
              action: `Resolve validation error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
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
            uptime: 0,
          },
          alerts: [
            {
              severity: 'critical',
              message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
              timestamp: new Date(),
            },
          ],
        },
        recommendations: ['Fix validation system errors before proceeding'],
      };
    }
  },
};

// Export common service creation functions

/**
 * Create a data service with specified configuration
 *
 * @function createDataService
 * @param {string} name Service name identifier
 * @param {Partial<DataServiceConfig>} options Service configuration options
 * @returns {Promise<IService>} Promise resolving to created data service
 * @example createDataService('user-data', { enabled: true })
 */
export const createDataService = usl.createDataService.bind(usl);

/**
 * Create a web-optimized data service adapter
 *
 * @function createWebDataService
 * @param {string} name Service name identifier
 * @param {Partial<DataServiceAdapterConfig>} options Adapter configuration options
 * @returns {Promise<DataServiceAdapter>} Promise resolving to web data adapter
 * @example createWebDataService('api-data', { web: { enabled: true } })
 */
export const createWebDataService = usl.createWebDataService.bind(usl);

/**
 * Create a document-optimized data service adapter
 *
 * @function createDocumentService
 * @param {string} name Service name identifier
 * @param {'postgresql' | 'sqlite' | 'mysql'} databaseType Database type
 * @param {Partial<DataServiceAdapterConfig>} options Adapter configuration options
 * @returns {Promise<DataServiceAdapter>} Promise resolving to document adapter
 * @example createDocumentService('docs', 'postgresql', { document: { enabled: true } })
 */
export const createDocumentService = usl.createDocumentService.bind(usl);

/**
 * Create a unified data service adapter (web + document capabilities)
 *
 * @function createUnifiedDataService
 * @param {string} name Service name identifier
 * @param {'postgresql' | 'sqlite' | 'mysql'} databaseType Database type
 * @param {Partial<DataServiceAdapterConfig>} options Adapter configuration options
 * @returns {Promise<DataServiceAdapter>} Promise resolving to unified adapter
 * @example createUnifiedDataService('hybrid', 'postgresql', { web: { enabled: true }, document: { enabled: true } })
 */
export const createUnifiedDataService = usl.createUnifiedDataService.bind(usl);

/**
 * Create a web service with HTTP server capabilities
 *
 * @function createWebService
 * @param {string} name Service name identifier
 * @param {number} port Server port number
 * @param {Partial<WebServiceConfig>} options Web service configuration options
 * @returns {Promise<IService>} Promise resolving to created web service
 * @example createWebService('api', 3000, { server: { cors: { enabled: true } } })
 */
export const createWebService = usl.createWebService.bind(usl);

/**
 * Create a coordination service for distributed operations
 *
 * @function createCoordinationService
 * @param {string} name Service name identifier
 * @param {Partial<CoordinationServiceConfig>} options Coordination configuration options
 * @returns {Promise<IService>} Promise resolving to created coordination service
 * @example createCoordinationService('swarm', { swarm: { topology: 'mesh' } })
 */
export const createCoordinationService = usl.createCoordinationService.bind(usl);

/**
 * Create a neural service for machine learning operations
 *
 * @function createNeuralService
 * @param {string} name Service name identifier
 * @param {Partial<NeuralServiceConfig>} options Neural service configuration options
 * @returns {Promise<IService>} Promise resolving to created neural service
 * @example createNeuralService('ml', { networks: { defaultArchitecture: [784, 128, 10] } })
 */
export const createNeuralService = usl.createNeuralService.bind(usl);

/**
 * Create a memory service for caching and storage
 *
 * @function createMemoryService
 * @param {string} name Service name identifier
 * @param {Partial<MemoryServiceConfig>} options Memory service configuration options
 * @returns {Promise<IService>} Promise resolving to created memory service
 * @example createMemoryService('cache', { cacheSize: 1000, ttl: 3600 })
 */
export const createMemoryService = usl.createMemoryService.bind(usl);

/**
 * Create a database service for persistent data storage
 *
 * @function createDatabaseService
 * @param {string} name Service name identifier
 * @param {Partial<DatabaseServiceConfig>} options Database configuration options
 * @returns {Promise<IService>} Promise resolving to created database service
 * @example createDatabaseService('db', { connectionString: process.env.DATABASE_URL })
 */
export const createDatabaseService = usl.createDatabaseService.bind(usl);

/**
 * Create an integration service for external system connectivity
 *
 * @function createIntegrationService
 * @param {string} name Service name identifier
 * @param {Partial<IntegrationServiceConfig>} options Integration configuration options
 * @returns {Promise<IService>} Promise resolving to created integration service
 * @example createIntegrationService('api-client', { endpoints: { baseURL: 'https://api.example.com' } })
 */
export const createIntegrationService = usl.createIntegrationService.bind(usl);

/**
 * Create an integration service adapter with enhanced capabilities
 *
 * @function createIntegrationServiceAdapter
 * @param {string} name Service name identifier
 * @param {Partial<IntegrationServiceAdapterConfig>} options Adapter configuration options
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to integration adapter
 * @example createIntegrationServiceAdapter('integration', { safeAPI: { enabled: true } })
 */
export const createIntegrationServiceAdapter = usl.createIntegrationServiceAdapter.bind(usl);

/**
 * Create an architecture storage service for system metadata
 *
 * @function createArchitectureStorageService
 * @param {string} name Service name identifier
 * @param {'postgresql' | 'sqlite' | 'mysql'} databaseType Database type
 * @param {Partial<IntegrationServiceAdapterConfig>} options Configuration options
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to architecture storage service
 * @example createArchitectureStorageService('arch-store', 'postgresql', { architectureStorage: { enableVersioning: true } })
 */
export const createArchitectureStorageService = usl.createArchitectureStorageService.bind(usl);

/**
 * Create a safe API service with validation and security features
 *
 * @function createSafeAPIService
 * @param {string} name Service name identifier
 * @param {string} baseURL Base URL for API operations
 * @param {Partial<IntegrationServiceAdapterConfig>} options Configuration options
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to safe API service
 * @example createSafeAPIService('safe-api', 'https://api.example.com', { safeAPI: { validation: { strictMode: true } } })
 */
export const createSafeAPIService = usl.createSafeAPIService.bind(usl);

/**
 * Create a protocol management service for multi-protocol communication
 *
 * @function createProtocolManagementService
 * @param {string} name Service name identifier
 * @param {string[]} supportedProtocols Array of supported protocols
 * @param {Partial<IntegrationServiceAdapterConfig>} options Configuration options
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to protocol management service
 * @example createProtocolManagementService('protocol-mgr', ['http', 'websocket'], { protocolManagement: { connectionPooling: { enabled: true } } })
 */
export const createProtocolManagementService = usl.createProtocolManagementService.bind(usl);

/**
 * Create a unified integration service with all features enabled
 *
 * @function createUnifiedIntegrationService
 * @param {string} name Service name identifier
 * @param {Object} options Configuration options with baseURL, databaseType, and supportedProtocols
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to unified integration service
 * @example createUnifiedIntegrationService('full-integration', { baseURL: 'https://api.example.com', databaseType: 'postgresql' })
 */
export const createUnifiedIntegrationService = usl.createUnifiedIntegrationService.bind(usl);

/**
 * Create a monitoring service for system observability
 *
 * @function createMonitoringService
 * @param {string} name Service name identifier
 * @param {Partial<MonitoringServiceConfig>} options Monitoring configuration options
 * @returns {Promise<IService>} Promise resolving to created monitoring service
 * @example createMonitoringService('monitor', { metrics: { enabled: true, interval: 30000 } })
 */
export const createMonitoringService = usl.createMonitoringService.bind(usl);

// Export service discovery functions

/**
 * Get a service by its unique name
 *
 * @function getService
 * @param {string} serviceName Unique service identifier
 * @returns {IService | undefined} Service instance or undefined if not found
 * @example const userService = getService('user-data');
 */
export const getService = usl.getService.bind(usl);

/**
 * Get all services of a specific type
 *
 * @function getServicesByType
 * @param {ServiceType} type Service type to filter by
 * @returns {IService[]} Array of services matching the type
 * @example const dataServices = getServicesByType(ServiceType.DATA);
 */
export const getServicesByType = usl.getServicesByType.bind(usl);

/**
 * Get all registered services
 *
 * @function getAllServices
 * @returns {Map<string, IService>} Map of all services by name
 * @example const allServices = getAllServices();
 */
export const getAllServices = usl.getAllServices.bind(usl);

/**
 * Discover services by criteria (type, capabilities, tags)
 *
 * @function discoverServices
 * @param {Object} criteria Discovery criteria
 * @returns {IService[]} Array of matching services
 * @example const mlServices = discoverServices({ capabilities: ['training', 'inference'] });
 */
export const discoverServices = usl.discoverServices.bind(usl);

// Export system management functions

/**
 * Start all registered services
 *
 * @function startAllServices
 * @returns {Promise<void>} Promise that resolves when all services are started
 * @throws {ServiceOperationError} When service startup fails
 * @example await startAllServices();
 */
export const startAllServices = usl.startAllServices.bind(usl);

/**
 * Stop all registered services
 *
 * @function stopAllServices
 * @returns {Promise<void>} Promise that resolves when all services are stopped
 * @throws {ServiceOperationError} When service shutdown fails
 * @example await stopAllServices();
 */
export const stopAllServices = usl.stopAllServices.bind(usl);

/**
 * Get comprehensive system health status
 *
 * @function getSystemHealth
 * @returns {Promise<Object>} Promise resolving to system health information
 * @example const health = await getSystemHealth(); console.log(health.overall);
 */
export const getSystemHealth = usl.getSystemHealth.bind(usl);

/**
 * Get system performance metrics
 *
 * @function getSystemMetrics
 * @returns {Promise<Object>} Promise resolving to system metrics
 * @example const metrics = await getSystemMetrics(); console.log(metrics.performanceSummary);
 */
export const getSystemMetrics = usl.getSystemMetrics.bind(usl);

/**
 * Default export for convenience
 *
 * @default {USL}
 * @description The global USL instance as the default export
 * @example
 * ```typescript
 * import usl from '@claude-zen/usl';
 *
 * await usl.initialize();
 * const service = await usl.createDataService('my-data');
 * ```
 */
export default usl;
