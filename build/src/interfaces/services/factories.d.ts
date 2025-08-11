/**
 * USL (Unified Service Layer) Factory Implementation.
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
 * - Event-driven service coordination.
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
import type { IService, IServiceCapabilityRegistry, IServiceConfigValidator, IServiceFactory, IServiceRegistry, ServiceCapability, ServiceConfig, ServiceLifecycleStatus, ServiceMetrics, ServiceStatus } from './core/interfaces.ts';
/**
 * Configuration for the USL Factory system.
 *
 * @interface USLFactoryConfig
 * @description Comprehensive configuration options for the USL Factory system,
 * controlling service creation, monitoring, discovery, and lifecycle management.
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
 * Main USL Factory class for creating and managing service instances.
 *
 * @example
 */
export declare class USLFactory implements IServiceFactory {
    private services;
    private serviceFactories;
    private logger;
    private eventEmitter;
    private initializationQueue;
    private config;
    constructor(config?: USLFactoryConfig);
    /**
     * Create a service instance based on configuration.
     *
     * @param config
     */
    create<T extends ServiceConfig = ServiceConfig>(config: T): Promise<IService>;
    /**
     * Create multiple services concurrently.
     *
     * @param configs
     */
    createMultiple<T extends ServiceConfig = ServiceConfig>(configs: T[]): Promise<IService[]>;
    /**
     * Get service by name.
     *
     * @param name
     */
    get(name: string): IService | undefined;
    /**
     * List all services.
     */
    list(): IService[];
    /**
     * Check if service exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove and destroy service.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Get supported service types.
     */
    getSupportedTypes(): string[];
    /**
     * Check if service type is supported.
     *
     * @param type
     */
    supportsType(type: string): boolean;
    /**
     * Start all services.
     */
    startAll(): Promise<void>;
    /**
     * Stop all services.
     */
    stopAll(): Promise<void>;
    /**
     * Perform health check on all services.
     */
    healthCheckAll(): Promise<Map<string, ServiceStatus>>;
    /**
     * Get metrics from all services.
     */
    getMetricsAll(): Promise<Map<string, ServiceMetrics>>;
    /**
     * Shutdown factory and all services.
     */
    shutdown(): Promise<void>;
    /**
     * Get number of active services.
     */
    getActiveCount(): number;
    /**
     * Get services by type.
     *
     * @param type
     */
    getServicesByType(type: string): IService[];
    /**
     * Validate service configuration.
     *
     * @param config
     */
    validateConfig(config: ServiceConfig): Promise<boolean>;
    /**
     * Get configuration schema for service type.
     *
     * @param type
     */
    getConfigSchema(type: string): Record<string, any> | undefined;
    private createServiceInstance;
    private instantiateServiceByType;
    private validateTypeSpecificConfig;
    private setupServiceEventHandling;
    private groupServicesByPriority;
    private scheduleServiceRecovery;
    private performServiceRecovery;
    private initializeSystemServices;
    private startHealthMonitoring;
    private startMetricsCollection;
    private startServiceDiscovery;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener?: (...args: any[]) => void): void;
}
/**
 * Service Registry implementation for global service management.
 *
 * @example
 */
export declare class ServiceRegistry implements IServiceRegistry {
    private factories;
    private eventEmitter;
    private logger;
    constructor();
    registerFactory<T extends ServiceConfig>(type: string, factory: IServiceFactory<T>): void;
    getFactory<T extends ServiceConfig>(type: string): IServiceFactory<T> | undefined;
    listFactoryTypes(): string[];
    unregisterFactory(type: string): void;
    getAllServices(): Map<string, IService>;
    findService(name: string): IService | undefined;
    getServicesByType(type: string): IService[];
    getServicesByStatus(status: ServiceLifecycleStatus): IService[];
    startAllServices(): Promise<void>;
    stopAllServices(): Promise<void>;
    healthCheckAll(): Promise<Map<string, ServiceStatus>>;
    getSystemMetrics(): Promise<{
        totalServices: number;
        runningServices: number;
        healthyServices: number;
        errorServices: number;
        aggregatedMetrics: ServiceMetrics[];
    }>;
    shutdownAll(): Promise<void>;
    discoverServices(criteria?: {
        type?: string;
        capabilities?: string[];
        health?: 'healthy' | 'degraded' | 'unhealthy';
        tags?: string[];
    }): IService[];
    on(event: 'service-registered' | 'service-unregistered' | 'service-status-changed', handler: (serviceName: string, service?: IService) => void): void;
    off(event: string, handler?: Function): void;
}
/**
 * Global USL Factory instance.
 */
export declare const globalUSLFactory: USLFactory;
/**
 * Global Service Registry instance.
 */
export declare const globalServiceRegistry: ServiceRegistry;
/**
 * Service configuration validator implementation.
 *
 * @example
 */
export declare class ServiceConfigValidator implements IServiceConfigValidator {
    private schemas;
    private logger;
    constructor();
    validate(config: ServiceConfig): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    validateType(type: string, _config: ServiceConfig): Promise<boolean>;
    getSchema(type: string): Record<string, any> | undefined;
    registerSchema(type: string, schema: Record<string, any>): void;
    private initializeDefaultSchemas;
}
/**
 * Service capability registry implementation.
 *
 * @example
 */
export declare class ServiceCapabilityRegistry implements IServiceCapabilityRegistry {
    private capabilities;
    private logger;
    constructor();
    register(serviceName: string, capability: ServiceCapability): void;
    unregister(serviceName: string, capabilityName: string): void;
    getCapabilities(serviceName: string): ServiceCapability[];
    findServicesByCapability(capabilityName: string): string[];
    hasCapability(serviceName: string, capabilityName: string): boolean;
}
/**
 * Global instances.
 */
export declare const globalServiceConfigValidator: ServiceConfigValidator;
export declare const globalServiceCapabilityRegistry: ServiceCapabilityRegistry;
export default USLFactory;
//# sourceMappingURL=factories.d.ts.map