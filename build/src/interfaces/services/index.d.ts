/**
 * @file USL (Unified Service Layer) - Main Exports.
 *
 * Central export point for all USL functionality including:
 * - Service registry and factory management
 * - Service type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization
 * - Convenience functions for common service operations.
 *
 * Main USL exports following the same successful patterns as DAL and UACL.
 */
import type { CompatibilityConfig } from './compatibility.ts';
import { USLCompatibilityLayer } from './compatibility.ts';
import type { IService, ServiceCapability, ServiceMetrics, ServiceStatus } from './core/interfaces.ts';
import type { ServiceManager, ServiceManagerConfig } from './manager.ts';
import type { EnhancedServiceRegistry, ServiceRegistryConfig } from './registry.ts';
import { type AnyServiceConfig, ServiceType } from './types.ts';
import type { SystemHealthValidation, USLValidationFramework, ValidationConfig, ValidationResult } from './validation.ts';
export { type APIOperationConfig, type ArchitectureOperationConfig, type BatchIntegrationConfig, type BatchOperationConfig, createDataServiceAdapter, createDefaultDataServiceAdapterConfig, createDefaultIntegrationServiceAdapterConfig, type DataAggregationOptions, type DataOperationResult, DataServiceAdapter, type DataServiceAdapterConfig, DataServiceFactory, DataServiceHelper, DataServiceUtils, type DataValidationResult, type EnhancedSearchOptions, globalDataServiceFactory, type IntegrationOperationResult, IntegrationServiceAdapter, type IntegrationServiceAdapterConfig, IntegrationServiceFactory, IntegrationServiceHelper, IntegrationServiceUtils, integrationServiceFactory, type ProtocolOperationConfig, type TransformationStep, } from './adapters';
export { type CompatibilityConfig, initializeCompatibility, type LegacyServicePattern, MigrationUtils, } from './compatibility.ts';
export declare const compat: USLCompatibilityLayer;
export { type IService, type IServiceCapabilityRegistry, type IServiceConfigValidator, type IServiceFactory, type IServiceRegistry, type ServiceAuthConfig, type ServiceCapability, type ServiceConfig, ServiceConfigurationError, type ServiceDependencyConfig, ServiceDependencyError, ServiceError, type ServiceEvent, type ServiceEventType, type ServiceHealthConfig, ServiceInitializationError, type ServiceLifecycleStatus, type ServiceMetrics, type ServiceMonitoringConfig, ServiceOperationError, type ServiceOperationOptions, type ServiceOperationResponse, type ServiceRetryConfig, type ServiceStatus, ServiceTimeoutError, } from './core/interfaces.ts';
export { globalServiceCapabilityRegistry, globalServiceConfigValidator, globalServiceRegistry, globalUSLFactory, ServiceCapabilityRegistry, ServiceConfigValidator, ServiceRegistry, USLFactory, type USLFactoryConfig, } from './factories.ts';
export type { CoordinationService } from './implementations/coordination-service.ts';
export type { DataService } from './implementations/data-service.ts';
export type { DatabaseService } from './implementations/database-service.ts';
export type { MemoryService } from './implementations/memory-service.ts';
export type { NeuralService } from './implementations/neural-service.ts';
export type { WebService } from './implementations/web-service.ts';
export { type BatchServiceCreationRequest, type ServiceCreationRequest, ServiceManager, type ServiceManagerConfig, type ServiceManagerStatus, } from './manager.ts';
export { EnhancedServiceRegistry, type ServiceDependencyGraph, type ServiceDiscoveryInfo, type ServiceRegistryConfig, } from './registry.ts';
export { type AnyServiceConfig, type BaseServiceConfig, type CoordinationServiceConfig, type DatabaseServiceConfig, type DataServiceConfig, type IntegrationServiceConfig, type InterfaceServiceConfig, isCoordinationServiceConfig, isDatabaseServiceConfig, isDataServiceConfig, isIntegrationServiceConfig, isMemoryServiceConfig, isMonitoringServiceConfig, isNeuralServiceConfig, isWebServiceConfig, type MemoryServiceConfig, type MonitoringServiceConfig, type NeuralServiceConfig, ServiceConfigFactory, ServiceEnvironment, ServicePriority, ServiceType, type WebServiceConfig, type WorkflowServiceConfig, } from './types.ts';
export { type SystemHealthValidation, USLValidationFramework, type ValidationConfig, type ValidationResult, type ValidationSectionResult, } from './validation.ts';
/**
 * USL Main Interface.
 *
 * Primary interface for interacting with the Unified Service Layer.
 * Provides high-level methods for service management and operations.
 *
 * @class USL
 * @description Singleton class for managing all service layer operations.
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
export declare class USL {
    private static instance;
    private initialized;
    private constructor();
    /**
     * Get singleton USL instance.
     *
     * @static
     * @returns {USL} The singleton USL instance.
     * @description Returns the global USL instance, creating it if it doesn't exist.
     * @example
     * ```typescript
     * const usl = USL.getInstance();
     * await usl.initialize();
     * ```
     */
    static getInstance(): USL;
    /**
     * Initialize USL system.
     *
     * @param {USLFactoryConfig} [config] Optional factory configuration.
     * @param _config
     * @returns {Promise<void>} Promise that resolves when initialization is complete.
     * @throws {ServiceInitializationError} When initialization fails.
     * @description Initializes the USL system with optional configuration.
     * @example
     * ```typescript
     * await usl.initialize({
     *   enableMetrics: true,
     *   defaultTimeout: 30000,
     *   logLevel: 'info'
     * });
     * ```
     */
    initialize(_config?: any): Promise<void>;
    /**
     * Check if USL is initialized.
     *
     * @returns {boolean} True if USL system is initialized.
     * @description Returns the initialization status of the USL system.
     * @example
     * ```typescript
     * if (!usl.isInitialized()) {
     *   await usl.initialize();
     * }
     * ```
     */
    isInitialized(): boolean;
    /**
     * Create and register a data service (uses enhanced DataServiceAdapter).
     *
     * @param {string} name Unique service name identifier.
     * @param {Partial<DataServiceConfig>} [options={}] Service configuration options.
     * @returns {Promise<IService>} Promise resolving to the created data service.
     * @throws {ServiceConfigurationError} When configuration is invalid.
     * @throws {ServiceInitializationError} When service creation fails.
     * @description Creates a new data service with enhanced adapter capabilities.
     * @example
     * ```typescript.
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
    createDataService(name: string, options?: Partial<any>): Promise<IService>;
    /**
     * Create web data service adapter (optimized for web operations).
     *
     * @param {string} name Unique service name identifier.
     * @param {Partial<DataServiceAdapterConfig>} [options={}] Web adapter configuration.
     * @returns {Promise<DataServiceAdapter>} Promise resolving to the web data adapter.
     * @throws {ServiceConfigurationError} When web configuration is invalid.
     * @throws {ServiceInitializationError} When adapter creation fails.
     * @description Creates an optimized data service adapter for web-based operations.
     * @example
     * ```typescript.
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
    createWebDataService(name: string, options?: Partial<any>): Promise<any>;
    /**
     * Create document service adapter (optimized for database operations).
     *
     * @param {string} name Unique service name identifier.
     * @param {'postgresql' | 'sqlite' | 'mysql'} [databaseType='postgresql'] Database type to use.
     * @param {Partial<DataServiceAdapterConfig>} [options={}] Document adapter configuration.
     * @returns {Promise<DataServiceAdapter>} Promise resolving to the document adapter.
     * @throws {ServiceConfigurationError} When database configuration is invalid.
     * @throws {ServiceInitializationError} When adapter creation fails.
     * @description Creates an optimized data service adapter for document/database operations.
     * @example
     * ```typescript.
     * const docAdapter = await usl.createDocumentService('user-docs', 'postgresql', {
     *   document: {
     *     enabled: true,
     *     databaseType: 'postgresql',
     *     connectionString: process.env['DATABASE_URL'],
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
    createDocumentService(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', options?: Partial<any>): Promise<any>;
    /**
     * Create unified data service adapter (both web and document operations).
     *
     * @param {string} name Unique service name identifier.
     * @param {'postgresql' | 'sqlite' | 'mysql'} [databaseType='postgresql'] Database type for document operations.
     * @param {Partial<DataServiceAdapterConfig>} [options={}] Unified adapter configuration.
     * @returns {Promise<DataServiceAdapter>} Promise resolving to the unified data adapter.
     * @throws {ServiceConfigurationError} When configuration is invalid.
     * @throws {ServiceInitializationError} When adapter creation fails.
     * @description Creates a unified data service adapter supporting both web and document operations.
     * @example
     * ```typescript.
     * const unifiedAdapter = await usl.createUnifiedDataService('hybrid-data', 'postgresql', {
     *   web: {
     *     enabled: true,
     *     apiEndpoint: 'https://api.example.com',
     *     authentication: { type: 'apikey', key: process.env['API_KEY'] }
     *   },
     *   document: {
     *     enabled: true,
     *     databaseType: 'postgresql',
     *     connectionString: process.env['DATABASE_URL'],
     *     caching: { enabled: true, ttl: 300 }
     *   }
     * });
     *
     * // Use both web and document operations
     * const webData = await unifiedAdapter.fetchData('/external/users');
     * const dbData = await unifiedAdapter.findDocuments('users', { active: true });
     * ```
     */
    createUnifiedDataService(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', options?: Partial<any>): Promise<any>;
    /**
     * Create and register a web service.
     *
     * @param {string} name Unique service name identifier.
     * @param {number} [port=3000] Port number for the web server.
     * @param {Partial<WebServiceConfig>} [options={}] Web service configuration options.
     * @returns {Promise<IService>} Promise resolving to the created web service.
     * @throws {ServiceConfigurationError} When web server configuration is invalid.
     * @throws {ServiceInitializationError} When web service creation fails.
     * @description Creates and registers a new web service with HTTP server capabilities.
     * @example
     * ```typescript
     * const webService = await usl.createWebService('api-server', 3000, {
     *   server: {
     *     host: '0.0.0.0',
     *     port: 3000,
     *     cors: { enabled: true, origins: [getWebDashboardURL()] }
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
    createWebService(name: string, port?: number, options?: Partial<any>): Promise<IService>;
    /**
     * Create and register a coordination service.
     *
     * @param {string} name Unique service name identifier.
     * @param {Partial<CoordinationServiceConfig>} [options={}] Coordination service configuration.
     * @returns {Promise<IService>} Promise resolving to the created coordination service.
     * @throws {ServiceConfigurationError} When coordination configuration is invalid.
     * @throws {ServiceInitializationError} When coordination service creation fails.
     * @description Creates a coordination service for managing distributed operations and agent coordination.
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
    createCoordinationService(name: string, options?: Partial<any>): Promise<IService>;
    /**
     * Create and register a neural service.
     *
     * @param {string} name Unique service name identifier.
     * @param {Partial<NeuralServiceConfig>} [options={}] Neural service configuration options.
     * @returns {Promise<IService>} Promise resolving to the created neural service.
     * @throws {ServiceConfigurationError} When neural network configuration is invalid.
     * @throws {ServiceInitializationError} When neural service creation fails.
     * @description Creates a neural service for machine learning operations and neural network management.
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
    createNeuralService(name: string, options?: Partial<any>): Promise<IService>;
    /**
     * Create and register a memory service.
     *
     * @param name
     * @param options
     */
    createMemoryService(name: string, options?: Partial<any>): Promise<IService>;
    /**
     * Create and register a database service.
     *
     * @param name
     * @param options
     */
    createDatabaseService(name: string, options?: Partial<any>): Promise<IService>;
    /**
     * Create and register an integration service.
     *
     * @param name
     * @param options
     */
    createIntegrationService(name: string, options?: Partial<any>): Promise<IService>;
    /**
     * Create integration service adapter (optimized for integration operations).
     *
     * @param name
     * @param options.
     * @param options
     */
    createIntegrationServiceAdapter(name: string, options?: Partial<any>): Promise<any>;
    /**
     * Create architecture storage integration service.
     *
     * @param name
     * @param databaseType
     * @param options
     */
    createArchitectureStorageService(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', options?: Partial<any>): Promise<any>;
    /**
     * Create safe API integration service.
     *
     * @param name
     * @param baseURL
     * @param options
     */
    createSafeAPIService(name: string, baseURL: string, options?: Partial<any>): Promise<any>;
    /**
     * Create protocol management integration service.
     *
     * @param name
     * @param supportedProtocols
     * @param options
     */
    createProtocolManagementService(name: string, supportedProtocols?: string[], options?: Partial<any>): Promise<any>;
    /**
     * Create unified integration service (all integration features enabled).
     *
     * @param name
     * @param options.
     * @param options
     */
    createUnifiedIntegrationService(name: string, options?: {
        baseURL?: string;
        databaseType?: 'postgresql' | 'sqlite' | 'mysql';
        supportedProtocols?: string[];
    } & Partial<any>): Promise<any>;
    /**
     * Create and register a monitoring service.
     *
     * @param name
     * @param options
     */
    createMonitoringService(name: string, options?: Partial<any>): Promise<IService>;
    /**
     * Get service by name.
     *
     * @param serviceName
     */
    getService(serviceName: string): IService | undefined;
    /**
     * Get all services of a specific type.
     *
     * @param type
     */
    getServicesByType(type: ServiceType): IService[];
    /**
     * Get all services.
     */
    getAllServices(): Map<string, IService>;
    /**
     * Start all services.
     */
    startAllServices(): Promise<void>;
    /**
     * Stop all services.
     */
    stopAllServices(): Promise<void>;
    /**
     * Get system health status.
     *
     * @returns {Promise<Object>} Promise resolving to comprehensive system health information.
     * @returns {Promise<Object>} Returns.overall Overall system health status.
     * @returns {Promise<Map<string, ServiceStatus>>} Returns.services Map of service statuses by name.
     * @returns {Promise<Object>} Returns.summary Health summary statistics.
     * @throws {ServiceOperationError} When health check operations fail.
     * @description Performs comprehensive health checks across all registered services.
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
    getSystemHealth(): Promise<{
        overall: 'healthy' | 'degraded' | 'unhealthy';
        services: Map<string, ServiceStatus>;
        summary: {
            total: number;
            healthy: number;
            degraded: number;
            unhealthy: number;
            errorRate: number;
        };
    }>;
    /**
     * Get system metrics.
     *
     * @returns {Promise<Object>} Promise resolving to comprehensive system performance metrics.
     * @returns {Promise<number>} Returns.totalServices Total number of registered services.
     * @returns {Promise<number>} Returns.runningServices Number of currently running services.
     * @returns {Promise<number>} Returns.healthyServices Number of healthy services.
     * @returns {Promise<number>} Returns.errorServices Number of services with errors.
     * @returns {Promise<ServiceMetrics[]>} Returns.aggregatedMetrics Individual service metrics.
     * @returns {Promise<Object>} Returns.performanceSummary System-wide performance summary.
     * @throws {ServiceOperationError} When metrics collection fails.
     * @description Collects and aggregates performance metrics from all services.
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
    getSystemMetrics(): Promise<{
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
    }>;
    /**
     * Discover services by criteria.
     *
     * @param {Object} [criteria] Service discovery criteria.
     * @param {ServiceType} [criteria.type] Filter by service type.
     * @param {string[]} [criteria.capabilities] Filter by required capabilities.
     * @param {string[]} [criteria.tags] Filter by service tags.
     * @returns {IService[]} Array of services matching the criteria.
     * @description Discovers services based on specified criteria for dynamic service resolution.
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
    }): IService[];
    /**
     * Register a service capability.
     *
     * @param serviceName
     * @param capability
     */
    registerCapability(serviceName: string, capability: ServiceCapability): void;
    /**
     * Find services by capability.
     *
     * @param capabilityName
     */
    findServicesByCapability(capabilityName: string): string[];
    /**
     * Shutdown USL system.
     *
     * @returns {Promise<void>} Promise that resolves when shutdown is complete.
     * @throws {ServiceOperationError} When shutdown operations fail.
     * @description Gracefully shuts down all services and the USL system.
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
    shutdown(): Promise<void>;
}
/**
 * Global USL instance for convenience.
 *
 * @constant {USL}
 * @description Pre-initialized global USL instance for immediate use across the application.
 * @example
 * ```typescript
 * import { usl } from '@claude-zen/usl';
 *
 * // Direct usage without getInstance()
 * await usl.initialize();
 * const dataService = await usl.createDataService('my-data');
 * ```
 */
export declare const usl: USL;
/**
 * Initialize USL with default configuration.
 *
 * @param {USLFactoryConfig} [config] Optional factory configuration.
 * @returns {Promise<void>} Promise that resolves when initialization is complete.
 * @throws {ServiceInitializationError} When initialization fails.
 * @description Convenience function to initialize the global USL instance.
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
export declare const initializeUSL: (config?: any) => Promise<void>;
/**
 * Convenience functions for common service operations.
 *
 * @namespace USLHelpers
 * @description Collection of utility functions for common USL operations and workflows.
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
export declare const USLHelpers: {
    /**
     * Initialize and create common services for a typical setup.
     *
     * @param {Object} config Configuration for common services setup.
     * @param {number} [config.webPort] Port for web service (creates web service if provided).
     * @param {boolean} [config.enableMonitoring] Whether to create monitoring service.
     * @param {boolean} [config.enableCoordination] Whether to create coordination service.
     * @param {boolean} [config.enableNeural] Whether to create neural service.
     * @param {Partial<DatabaseServiceConfig>} [config.databaseConfig] Database service configuration.
     * @param {Partial<MemoryServiceConfig>} [config.memoryConfig] Memory service configuration.
     * @returns {Promise<Object>} Promise resolving to created services object.
     * @throws {ServiceInitializationError} When service creation fails.
     * @description Creates and starts a typical set of services for most applications.
     * @example
     * ```typescript
     * const services = await USLHelpers.setupCommonServices({
     *   webPort: 3000,
     *   enableMonitoring: true,
     *   enableCoordination: true,
     *   enableNeural: false,
     *   databaseConfig: {
     *     connectionString: process.env['DATABASE_URL'],
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
    setupCommonServices(config: {
        webPort?: number;
        enableMonitoring?: boolean;
        enableCoordination?: boolean;
        enableNeural?: boolean;
        databaseConfig?: Partial<any>;
        memoryConfig?: Partial<any>;
    }): Promise<{
        web?: IService;
        data?: IService;
        memory?: IService;
        database?: IService;
        coordination?: IService;
        neural?: IService;
        monitoring?: IService;
    }>;
    /**
     * Get a quick system status overview.
     */
    getQuickStatus(): Promise<{
        initialized: boolean;
        totalServices: number;
        healthyServices: number;
        healthPercentage: number;
        status: "healthy" | "degraded" | "unhealthy";
        uptime: number;
    }>;
    /**
     * Perform comprehensive health check on all services.
     */
    performHealthCheck(): Promise<{
        overall: "healthy" | "degraded" | "unhealthy";
        services: Record<string, {
            status: "healthy" | "degraded" | "unhealthy";
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
    }>;
    /**
     * Get performance metrics for all services.
     */
    getPerformanceMetrics(): Promise<{
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
    }>;
    /**
     * Create a service with automatic dependency resolution.
     *
     * @param config
     * @param dependencies
     */
    createServiceWithDependencies<T extends AnyServiceConfig>(config: T, dependencies?: string[]): Promise<IService>;
    /**
     * Batch create services with dependency resolution.
     *
     * @param configs
     */
    createServiceBatch(configs: Array<{
        config: AnyServiceConfig;
        dependencies?: string[];
    }>): Promise<IService[]>;
    /**
     * Initialize complete USL system with enhanced integration layer.
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
    initializeCompleteUSL(config?: {
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
    }>;
    /**
     * Migrate existing system to USL with full integration.
     *
     * @param existingServices
     */
    migrateToUSL(existingServices: Record<string, any>): Promise<{
        success: boolean;
        migrated: IService[];
        failed: Array<{
            name: string;
            error: string;
        }>;
        warnings: string[];
        compatibilityReport: any;
    }>;
    /**
     * Validate complete USL system integration.
     *
     * @param config
     */
    validateSystemIntegration(config?: Partial<ValidationConfig>): Promise<{
        success: boolean;
        validationResult: ValidationResult;
        healthValidation: SystemHealthValidation;
        recommendations: string[];
    }>;
};
/**
 * Create a data service with specified configuration.
 *
 * @function createDataService
 * @param {string} name Service name identifier.
 * @param {Partial<DataServiceConfig>} options Service configuration options.
 * @returns {Promise<IService>} Promise resolving to created data service.
 * @example createDataService('user-data', { enabled: true })
 */
export declare const createDataService: (name: string, options?: Partial<any>) => Promise<IService>;
/**
 * Create a web-optimized data service adapter.
 *
 * @function createWebDataService
 * @param {string} name Service name identifier.
 * @param {Partial<DataServiceAdapterConfig>} options Adapter configuration options.
 * @returns {Promise<DataServiceAdapter>} Promise resolving to web data adapter.
 * @example createWebDataService('api-data', { web: { enabled: true } })
 */
export declare const createWebDataService: (name: string, options?: Partial<any>) => Promise<any>;
/**
 * Create a document-optimized data service adapter.
 *
 * @function createDocumentService
 * @param {string} name Service name identifier.
 * @param {'postgresql' | 'sqlite' | 'mysql'} databaseType Database type.
 * @param {Partial<DataServiceAdapterConfig>} options Adapter configuration options.
 * @returns {Promise<DataServiceAdapter>} Promise resolving to document adapter.
 * @example createDocumentService('docs', 'postgresql', { document: { enabled: true } })
 */
export declare const createDocumentService: (name: string, databaseType?: "postgresql" | "sqlite" | "mysql", options?: Partial<any>) => Promise<any>;
/**
 * Create a unified data service adapter (web + document capabilities).
 *
 * @function createUnifiedDataService
 * @param {string} name Service name identifier.
 * @param {'postgresql' | 'sqlite' | 'mysql'} databaseType Database type.
 * @param {Partial<DataServiceAdapterConfig>} options Adapter configuration options.
 * @returns {Promise<DataServiceAdapter>} Promise resolving to unified adapter.
 * @example createUnifiedDataService('hybrid', 'postgresql', { web: { enabled: true }, document: { enabled: true } })
 */
export declare const createUnifiedDataService: (name: string, databaseType?: "postgresql" | "sqlite" | "mysql", options?: Partial<any>) => Promise<any>;
/**
 * Create a web service with HTTP server capabilities.
 *
 * @function createWebService
 * @param {string} name Service name identifier.
 * @param {number} port Server port number.
 * @param {Partial<WebServiceConfig>} options Web service configuration options.
 * @returns {Promise<IService>} Promise resolving to created web service.
 * @example createWebService('api', 3000, { server: { cors: { enabled: true } } })
 */
export declare const createWebService: (name: string, port?: number, options?: Partial<any>) => Promise<IService>;
/**
 * Create a coordination service for distributed operations.
 *
 * @function createCoordinationService
 * @param {string} name Service name identifier.
 * @param {Partial<CoordinationServiceConfig>} options Coordination configuration options.
 * @returns {Promise<IService>} Promise resolving to created coordination service.
 * @example createCoordinationService('swarm', { swarm: { topology: 'mesh' } })
 */
export declare const createCoordinationService: (name: string, options?: Partial<any>) => Promise<IService>;
/**
 * Create a neural service for machine learning operations.
 *
 * @function createNeuralService
 * @param {string} name Service name identifier.
 * @param {Partial<NeuralServiceConfig>} options Neural service configuration options.
 * @returns {Promise<IService>} Promise resolving to created neural service.
 * @example createNeuralService('ml', { networks: { defaultArchitecture: [784, 128, 10] } })
 */
export declare const createNeuralService: (name: string, options?: Partial<any>) => Promise<IService>;
/**
 * Create a memory service for caching and storage.
 *
 * @function createMemoryService
 * @param {string} name Service name identifier.
 * @param {Partial<MemoryServiceConfig>} options Memory service configuration options.
 * @returns {Promise<IService>} Promise resolving to created memory service.
 * @example createMemoryService('cache', { cacheSize: 1000, ttl: 3600 })
 */
export declare const createMemoryService: (name: string, options?: Partial<any>) => Promise<IService>;
/**
 * Create a database service for persistent data storage.
 *
 * @function createDatabaseService
 * @param {string} name Service name identifier.
 * @param {Partial<DatabaseServiceConfig>} options Database configuration options.
 * @returns {Promise<IService>} Promise resolving to created database service.
 * @example createDatabaseService('db', { connectionString: process.env['DATABASE_URL'] })
 */
export declare const createDatabaseService: (name: string, options?: Partial<any>) => Promise<IService>;
/**
 * Create an integration service for external system connectivity.
 *
 * @function createIntegrationService
 * @param {string} name Service name identifier.
 * @param {Partial<IntegrationServiceConfig>} options Integration configuration options.
 * @returns {Promise<IService>} Promise resolving to created integration service.
 * @example createIntegrationService('api-client', { endpoints: { baseURL: 'https://api.example.com' } })
 */
export declare const createIntegrationService: (name: string, options?: Partial<any>) => Promise<IService>;
/**
 * Create an integration service adapter with enhanced capabilities.
 *
 * @function createIntegrationServiceAdapterBound
 * @param {string} name Service name identifier.
 * @param {Partial<IntegrationServiceAdapterConfig>} options Adapter configuration options.
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to integration adapter.
 * @example createIntegrationServiceAdapterBound('integration', { safeAPI: { enabled: true } })
 */
export declare const createIntegrationServiceAdapterBound: (name: string, options?: Partial<any>) => Promise<any>;
/**
 * Create an architecture storage service for system metadata.
 *
 * @function createArchitectureStorageService
 * @param {string} name Service name identifier.
 * @param {'postgresql' | 'sqlite' | 'mysql'} databaseType Database type.
 * @param {Partial<IntegrationServiceAdapterConfig>} options Configuration options.
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to architecture storage service.
 * @example createArchitectureStorageService('arch-store', 'postgresql', { architectureStorage: { enableVersioning: true } })
 */
export declare const createArchitectureStorageService: (name: string, databaseType?: "postgresql" | "sqlite" | "mysql", options?: Partial<any>) => Promise<any>;
/**
 * Create a safe API service with validation and security features.
 *
 * @function createSafeAPIService
 * @param {string} name Service name identifier.
 * @param {string} baseURL Base URL for API operations.
 * @param {Partial<IntegrationServiceAdapterConfig>} options Configuration options.
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to safe API service.
 * @example createSafeAPIService('safe-api', 'https://api.example.com', { safeAPI: { validation: { strictMode: true } } })
 */
export declare const createSafeAPIService: (name: string, baseURL: string, options?: Partial<any>) => Promise<any>;
/**
 * Create a protocol management service for multi-protocol communication.
 *
 * @function createProtocolManagementService
 * @param {string} name Service name identifier.
 * @param {string[]} supportedProtocols Array of supported protocols.
 * @param {Partial<IntegrationServiceAdapterConfig>} options Configuration options.
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to protocol management service.
 * @example createProtocolManagementService('protocol-mgr', ['http', 'websocket'], { protocolManagement: { connectionPooling: { enabled: true } } })
 */
export declare const createProtocolManagementService: (name: string, supportedProtocols?: string[], options?: Partial<any>) => Promise<any>;
/**
 * Create a unified integration service with all features enabled.
 *
 * @function createUnifiedIntegrationService
 * @param {string} name Service name identifier.
 * @param {Object} options Configuration options with baseURL, databaseType, and supportedProtocols.
 * @returns {Promise<IntegrationServiceAdapter>} Promise resolving to unified integration service.
 * @example createUnifiedIntegrationService('full-integration', { baseURL: 'https://api.example.com', databaseType: 'postgresql' })
 */
export declare const createUnifiedIntegrationService: (name: string, options?: {
    baseURL?: string;
    databaseType?: "postgresql" | "sqlite" | "mysql";
    supportedProtocols?: string[];
} & Partial<any>) => Promise<any>;
/**
 * Create a monitoring service for system observability.
 *
 * @function createMonitoringService
 * @param {string} name Service name identifier.
 * @param {Partial<MonitoringServiceConfig>} options Monitoring configuration options.
 * @returns {Promise<IService>} Promise resolving to created monitoring service.
 * @example createMonitoringService('monitor', { metrics: { enabled: true, interval: 30000 } })
 */
export declare const createMonitoringService: (name: string, options?: Partial<any>) => Promise<IService>;
/**
 * Get a service by its unique name.
 *
 * @function getService
 * @param {string} serviceName Unique service identifier.
 * @returns {IService | undefined} Service instance or undefined if not found.
 * @example const userService = getService('user-data');
 */
export declare const getService: (serviceName: string) => IService | undefined;
/**
 * Get all services of a specific type.
 *
 * @function getServicesByType
 * @param {ServiceType} type Service type to filter by.
 * @returns {IService[]} Array of services matching the type.
 * @example const dataServices = getServicesByType(ServiceType.DATA);
 */
export declare const getServicesByType: (type: ServiceType) => IService[];
/**
 * Get all registered services.
 *
 * @function getAllServices
 * @returns {Map<string, IService>} Map of all services by name.
 * @example const allServices = getAllServices();
 */
export declare const getAllServices: () => Map<string, IService>;
/**
 * Discover services by criteria (type, capabilities, tags).
 *
 * @function discoverServices
 * @param {Object} criteria Discovery criteria.
 * @returns {IService[]} Array of matching services.
 * @example const mlServices = discoverServices({ capabilities: ['training', 'inference'] });
 */
export declare const discoverServices: (criteria?: {
    type?: ServiceType;
    capabilities?: string[];
    tags?: string[];
}) => IService[];
/**
 * Start all registered services.
 *
 * @function startAllServices
 * @returns {Promise<void>} Promise that resolves when all services are started.
 * @throws {ServiceOperationError} When service startup fails.
 * @example await startAllServices();
 */
export declare const startAllServices: () => Promise<void>;
/**
 * Stop all registered services.
 *
 * @function stopAllServices
 * @returns {Promise<void>} Promise that resolves when all services are stopped.
 * @throws {ServiceOperationError} When service shutdown fails.
 * @example await stopAllServices();
 */
export declare const stopAllServices: () => Promise<void>;
/**
 * Get comprehensive system health status.
 *
 * @function getSystemHealth
 * @returns {Promise<Object>} Promise resolving to system health information.
 * @example const health = await getSystemHealth(); console.log(health.overall);
 */
export declare const getSystemHealth: () => Promise<{
    overall: "healthy" | "degraded" | "unhealthy";
    services: Map<string, ServiceStatus>;
    summary: {
        total: number;
        healthy: number;
        degraded: number;
        unhealthy: number;
        errorRate: number;
    };
}>;
/**
 * Get system performance metrics.
 *
 * @function getSystemMetrics
 * @returns {Promise<Object>} Promise resolving to system metrics.
 * @example const metrics = await getSystemMetrics(); console.log(metrics.performanceSummary);
 */
export declare const getSystemMetrics: () => Promise<{
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
}>;
/**
 * Default export for convenience.
 *
 * @default {USL}
 * @description The global USL instance as the default export.
 * @example
 * ```typescript
 * import usl from '@claude-zen/usl';
 *
 * await usl.initialize();
 * const service = await usl.createDataService('my-data');
 * ```
 */
export default usl;
//# sourceMappingURL=index.d.ts.map