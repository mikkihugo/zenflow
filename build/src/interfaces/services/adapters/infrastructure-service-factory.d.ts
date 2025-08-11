/**
 * USL Infrastructure Service Factory.
 *
 * Factory for creating and managing infrastructure service adapter instances.
 * With unified configuration, dependency injection, and lifecycle management.
 * Follows the exact same patterns as other USL service factories.
 */
/**
 * @file Interface implementation: infrastructure-service-factory.
 */
import { EventEmitter } from 'node:events';
import type { ServiceLifecycleStatus } from '../core/interfaces.ts';
import { type InfrastructureServiceAdapter, type InfrastructureServiceAdapterConfig } from './infrastructure-service-adapter.ts';
/**
 * Infrastructure service factory configuration.
 *
 * @example
 */
export interface InfrastructureServiceFactoryConfig {
    /** Default service configuration template */
    defaultConfig?: Partial<InfrastructureServiceAdapterConfig>;
    /** Service naming configuration */
    naming?: {
        prefix?: string;
        suffix?: string;
        includeTimestamp?: boolean;
        includeEnvironment?: boolean;
    };
    /** Factory-level resource limits */
    limits?: {
        maxServices?: number;
        maxMemoryPerService?: number;
        maxConcurrentOperations?: number;
    };
    /** Health monitoring configuration */
    healthMonitoring?: {
        enabled?: boolean;
        checkInterval?: number;
        failureThreshold?: number;
        autoRestart?: boolean;
    };
    /** Service discovery configuration */
    serviceDiscovery?: {
        enabled?: boolean;
        registry?: 'memory' | 'redis' | 'consul';
        heartbeatInterval?: number;
    };
    /** Event coordination configuration */
    eventCoordination?: {
        enabled?: boolean;
        crossServiceEvents?: boolean;
        eventPersistence?: boolean;
    };
}
/**
 * Service creation options.
 *
 * @example
 */
export interface CreateServiceOptions {
    /** Override default configuration */
    config?: Partial<InfrastructureServiceAdapterConfig>;
    /** Auto-start the service after creation */
    autoStart?: boolean;
    /** Register the service for discovery */
    register?: boolean;
    /** Enable health monitoring */
    enableHealthMonitoring?: boolean;
    /** Custom service dependencies */
    dependencies?: string[];
    /** Service tags for categorization */
    tags?: string[];
}
/**
 * Factory statistics and metrics.
 *
 * @example
 */
interface FactoryMetrics {
    totalServicesCreated: number;
    activeServices: number;
    failedServices: number;
    totalOperations: number;
    avgServiceLifetime: number;
    memoryUsage: number;
    lastActivity: Date;
}
/**
 * Infrastructure Service Factory.
 *
 * Provides centralized creation, management, and lifecycle handling for.
 * Infrastructure service adapter instances. Includes service discovery,
 * health monitoring, resource management, and event coordination.
 *
 * Features:
 * - Unified service creation with templates
 * - Service lifecycle management
 * - Health monitoring and auto-restart
 * - Service discovery and registry
 * - Resource usage tracking
 * - Event coordination across services
 * - Configuration management
 * - Dependency injection.
 *
 * @example.
 * @example
 */
export declare class InfrastructureServiceFactory extends EventEmitter {
    private config;
    private logger;
    private serviceRegistry;
    private servicesByTag;
    private healthCheckTimers;
    private metrics;
    private isShuttingDown;
    constructor(config?: InfrastructureServiceFactoryConfig);
    /**
     * Create a new infrastructure service adapter instance.
     *
     * @param name
     * @param options
     */
    createService(name?: string, options?: CreateServiceOptions): Promise<InfrastructureServiceAdapter>;
    /**
     * Get an existing service by name.
     *
     * @param name
     */
    getService(name: string): InfrastructureServiceAdapter | undefined;
    /**
     * Get all registered services.
     */
    getAllServices(): Map<string, InfrastructureServiceAdapter>;
    /**
     * Get services by tag.
     *
     * @param tag
     */
    getServicesByTag(tag: string): InfrastructureServiceAdapter[];
    /**
     * List all registered service names.
     */
    listServices(): string[];
    /**
     * Remove and destroy a service.
     *
     * @param name
     */
    removeService(name: string): Promise<void>;
    /**
     * Start a service.
     *
     * @param name
     */
    startService(name: string): Promise<void>;
    /**
     * Stop a service.
     *
     * @param name
     */
    stopService(name: string): Promise<void>;
    /**
     * Restart a service.
     *
     * @param name
     */
    restartService(name: string): Promise<void>;
    /**
     * Get factory metrics and statistics.
     */
    getMetrics(): FactoryMetrics & {
        serviceHealth: Record<string, 'healthy' | 'degraded' | 'unhealthy' | 'unknown'>;
        servicesByStatus: Record<ServiceLifecycleStatus, number>;
        memoryByService: Record<string, number>;
    };
    /**
     * Get service status summary.
     *
     * @param name
     */
    getServiceStatus(name?: string): Promise<any>;
    /**
     * Perform health checks on all services.
     */
    performHealthChecks(): Promise<Record<string, boolean>>;
    /**
     * Shutdown the factory and all services.
     */
    shutdown(): Promise<void>;
    private generateServiceName;
    private createServiceConfig;
    private registerService;
    private setupServiceEventHandlers;
    private startHealthMonitoring;
    private setupEventHandlers;
    private startPeriodicTasks;
    private updateMetrics;
    private performCleanup;
}
/**
 * Get or create the global infrastructure service factory instance.
 *
 * @param config
 * @example
 */
export declare function getInfrastructureServiceFactory(config?: InfrastructureServiceFactoryConfig): InfrastructureServiceFactory;
/**
 * Create a new infrastructure service factory instance.
 *
 * @param config
 * @example
 */
export declare function createInfrastructureServiceFactory(config?: InfrastructureServiceFactoryConfig): InfrastructureServiceFactory;
/**
 * Convenience function to create a service using the global factory.
 *
 * @param name
 * @param options
 * @example
 */
export declare function createInfrastructureService(name?: string, options?: CreateServiceOptions): Promise<InfrastructureServiceAdapter>;
export default InfrastructureServiceFactory;
export type { InfrastructureServiceFactoryConfig, CreateServiceOptions, InfrastructureServiceAdapterConfig, };
export type { ServiceEventType } from '../core/interfaces.ts';
//# sourceMappingURL=infrastructure-service-factory.d.ts.map