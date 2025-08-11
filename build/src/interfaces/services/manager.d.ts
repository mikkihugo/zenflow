/**
 * USL Service Manager - Complete Service Lifecycle Management.
 *
 * @file Advanced service manager providing comprehensive lifecycle orchestration,
 * factory registration, health monitoring, auto-recovery, and service coordination
 * following the same patterns as UACL Agent 6.
 * @description The Service Manager is the central orchestrator for all USL services,
 * providing enterprise-grade capabilities:
 *
 * **Core Capabilities:**
 * - Complete service lifecycle management (create, start, monitor, recover, destroy)
 * - Automatic dependency resolution and service orchestration
 * - Real-time health monitoring with configurable thresholds
 * - Automated recovery and restart mechanisms
 * - Performance metrics collection and analysis
 * - Event-driven service coordination.
 *
 * **Service Management Patterns:**
 * - Factory pattern for service creation with type safety
 * - Observer pattern for event handling and notifications
 * - Dependency injection for service relationships
 * - Circuit breaker pattern for resilience.
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
import { EventEmitter } from 'node:events';
import type { CoordinationServiceAdapterConfig } from './adapters/coordination-service-adapter.ts';
import type { DataServiceAdapterConfig } from './adapters/data-service-adapter.ts';
import type { InfrastructureServiceAdapterConfig } from './adapters/infrastructure-service-adapter.ts';
import type { IntegrationServiceAdapterConfig } from './adapters/integration-service-adapter.ts';
import type { IService, ServiceMetrics, ServiceStatus } from './core/interfaces.ts';
import { type USLFactoryConfig } from './factories.ts';
import { type ServiceRegistryConfig } from './registry.ts';
import { type AnyServiceConfig, ServicePriority, ServiceType } from './types.ts';
/**
 * Service Manager Configuration.
 *
 * @interface ServiceManagerConfig
 * @description Comprehensive configuration for the USL Service Manager,
 * controlling all aspects of service lifecycle management, monitoring, and recovery.
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
        healthCheckInterval: number;
        metricsCollectionInterval: number;
        performanceThresholds: {
            responseTime: number;
            errorRate: number;
            memoryUsage: number;
            cpuUsage: number;
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
        recoveryTimeout: number;
        circuitBreaker: {
            enabled: boolean;
            failureThreshold: number;
            recoveryTime: number;
        };
    };
    /** Service discovery and communication */
    discovery: {
        enabled: boolean;
        protocol: 'http' | 'websocket' | 'mcp' | 'custom';
        heartbeatInterval: number;
        advertisementInterval: number;
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
            idleTimeout: number;
        };
        caching: {
            enabled: boolean;
            ttl: number;
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
 * Complete Service Manager for USL ecosystem.
 *
 * @example
 */
export declare class ServiceManager extends EventEmitter {
    private registry;
    private mainFactory;
    private config;
    private logger;
    private initialized;
    private startTime;
    private dataServiceFactory;
    private coordinationServiceFactory;
    private integrationServiceFactory;
    private infrastructureServiceFactory;
    private healthMonitoringInterval?;
    private metricsCollectionInterval?;
    private systemStatusInterval?;
    constructor(config?: Partial<ServiceManagerConfig>);
    /**
     * Initialize the service manager and register all service factories.
     */
    initialize(): Promise<void>;
    /**
     * Check if service manager is initialized.
     */
    isInitialized(): boolean;
    /**
     * Get comprehensive service manager status.
     */
    getStatus(): Promise<ServiceManagerStatus>;
    /**
     * Create a single service with enhanced configuration.
     *
     * @param request
     */
    createService(request: ServiceCreationRequest): Promise<IService>;
    /**
     * Create multiple services with dependency resolution.
     *
     * @param request
     */
    createServices(request: BatchServiceCreationRequest): Promise<IService[]>;
    /**
     * Enhanced service creation methods for each service type.
     */
    createWebDataService(name: string, config?: Partial<DataServiceAdapterConfig>): Promise<IService>;
    createDocumentService(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', config?: Partial<DataServiceAdapterConfig>): Promise<IService>;
    createUnifiedDataService(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', config?: Partial<DataServiceAdapterConfig>): Promise<IService>;
    createDaaService(name: string, config?: Partial<CoordinationServiceAdapterConfig>): Promise<IService>;
    createSessionRecoveryService(name: string, config?: Partial<CoordinationServiceAdapterConfig>): Promise<IService>;
    createUnifiedCoordinationService(name: string, config?: Partial<CoordinationServiceAdapterConfig>): Promise<IService>;
    createArchitectureStorageService(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', config?: Partial<IntegrationServiceAdapterConfig>): Promise<IService>;
    createSafeAPIService(name: string, baseURL: string, config?: Partial<IntegrationServiceAdapterConfig>): Promise<IService>;
    createUnifiedIntegrationService(name: string, options?: {
        baseURL?: string;
        databaseType?: 'postgresql' | 'sqlite' | 'mysql';
        supportedProtocols?: string[];
    }, config?: Partial<IntegrationServiceAdapterConfig>): Promise<IService>;
    createFacadeService(name: string, config?: Partial<InfrastructureServiceAdapterConfig>): Promise<IService>;
    createPatternIntegrationService(name: string, configProfile?: 'default' | 'production' | 'development', config?: Partial<InfrastructureServiceAdapterConfig>): Promise<IService>;
    createUnifiedInfrastructureService(name: string, configProfile?: 'default' | 'production' | 'development', config?: Partial<InfrastructureServiceAdapterConfig>): Promise<IService>;
    /**
     * Start specific services by name.
     *
     * @param serviceNames
     */
    startServices(serviceNames: string[]): Promise<void>;
    /**
     * Stop specific services by name.
     *
     * @param serviceNames
     */
    stopServices(serviceNames: string[]): Promise<void>;
    /**
     * Start all services.
     */
    startAllServices(): Promise<void>;
    /**
     * Stop all services.
     */
    stopAllServices(): Promise<void>;
    /**
     * Restart specific services.
     *
     * @param serviceNames
     */
    restartServices(serviceNames: string[]): Promise<void>;
    /**
     * Get comprehensive system health report.
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
    }>;
    /**
     * Get performance metrics for all services.
     */
    getPerformanceMetrics(): Promise<{
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
    }>;
    /**
     * Discover services by criteria.
     *
     * @param criteria
     * @param criteria.type
     * @param criteria.capabilities
     * @param criteria.health
     * @param criteria.tags
     */
    discoverServices(criteria?: {
        type?: string;
        capabilities?: string[];
        health?: 'healthy' | 'degraded' | 'unhealthy';
        tags?: string[];
    }): IService[];
    /**
     * Get service by name.
     *
     * @param name
     */
    getService(name: string): IService | undefined;
    /**
     * Get all services.
     */
    getAllServices(): Map<string, IService>;
    /**
     * Get services by type.
     *
     * @param type
     */
    getServicesByType(type: string): IService[];
    /**
     * Graceful shutdown of service manager.
     */
    shutdown(): Promise<void>;
    private initializeConfig;
    private registerServiceFactories;
    private initializeMonitoring;
    private stopMonitoring;
    private initializeServiceDiscovery;
    private setupEventHandling;
    private getFactoryForServiceType;
    private createServiceWithMainFactory;
    private createServiceWithSpecializedFactory;
    private resolveDependencyOrder;
    private startServicesWithDependencyResolution;
    private startServicesParallel;
    private startServicesSequential;
    private startServiceWithTimeout;
    private stopServiceWithTimeout;
    private scheduleServiceRecovery;
    private performServiceRecovery;
    private calculateBackoffDelay;
    private performSystemHealthCheck;
    private collectSystemMetrics;
    private reportSystemStatus;
    private generateHealthAlerts;
    private announceServiceDiscovery;
    private announceServiceRemoval;
}
export default ServiceManager;
//# sourceMappingURL=manager.d.ts.map