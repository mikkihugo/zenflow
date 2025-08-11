/**
 * USL Data Service Factory.
 *
 * Factory implementation for creating and managing data service adapter instances.
 * Provides specialized factory methods for WebDataService and DocumentService.
 * Integration through the unified DataServiceAdapter.
 *
 * This factory follows the USL factory patterns and integrates seamlessly.
 * With the global service registry for unified service management.
 */
/**
 * @file Interface implementation: data-service-factory.
 */
import type { IService, IServiceFactory, ServiceMetrics, ServiceStatus } from '../core/interfaces.ts';
import { type DataServiceAdapter, type DataServiceAdapterConfig } from './data-service-adapter.ts';
/**
 * Data service factory configuration.
 *
 * @example
 */
export interface DataServiceFactoryConfig {
    /** Default web data service settings */
    defaultWebDataConfig?: {
        enabled: boolean;
        mockData?: boolean;
        cacheResponses?: boolean;
        cacheTTL?: number;
    };
    /** Default document service settings */
    defaultDocumentConfig?: {
        enabled: boolean;
        databaseType?: 'postgresql' | 'sqlite' | 'mysql';
        autoInitialize?: boolean;
        searchIndexing?: boolean;
    };
    /** Default performance settings */
    defaultPerformanceConfig?: {
        enableRequestDeduplication?: boolean;
        maxConcurrency?: number;
        requestTimeout?: number;
        enableMetricsCollection?: boolean;
    };
    /** Factory-level monitoring */
    monitoring?: {
        enabled: boolean;
        healthCheckInterval?: number;
        metricsCollectionInterval?: number;
    };
}
/**
 * Specialized factory for data service adapters.
 *
 * @example
 */
export declare class DataServiceFactory implements IServiceFactory<DataServiceAdapterConfig> {
    private services;
    private logger;
    private eventEmitter;
    private config;
    private healthCheckTimer?;
    private metricsTimer?;
    constructor(config?: DataServiceFactoryConfig);
    /**
     * Create a data service adapter instance.
     *
     * @param config
     */
    create(config: DataServiceAdapterConfig): Promise<IService>;
    /**
     * Create multiple data service adapters concurrently.
     *
     * @param configs
     */
    createMultiple(configs: DataServiceAdapterConfig[]): Promise<IService[]>;
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
    validateConfig(config: DataServiceAdapterConfig): Promise<boolean>;
    /**
     * Get configuration schema for service type.
     *
     * @param type
     */
    getConfigSchema(type: string): Record<string, any> | undefined;
    /**
     * Create a web data service adapter with optimized settings.
     *
     * @param name
     * @param config
     */
    createWebDataAdapter(name: string, config?: Partial<DataServiceAdapterConfig>): Promise<DataServiceAdapter>;
    /**
     * Create a document service adapter with database optimization.
     *
     * @param name
     * @param databaseType
     * @param config
     */
    createDocumentAdapter(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', config?: Partial<DataServiceAdapterConfig>): Promise<DataServiceAdapter>;
    /**
     * Create a unified data adapter with both web and document services.
     *
     * @param name
     * @param databaseType
     * @param config
     */
    createUnifiedDataAdapter(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', config?: Partial<DataServiceAdapterConfig>): Promise<DataServiceAdapter>;
    /**
     * Get factory statistics.
     */
    getFactoryStats(): {
        totalServices: number;
        servicesByType: Record<string, number>;
        healthyServices: number;
        unhealthyServices: number;
        averageUptime: number;
    };
    private mergeWithDefaults;
    private setupServiceEventForwarding;
    private startMonitoring;
    private stopMonitoring;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener?: (...args: any[]) => void): void;
}
/**
 * Global data service factory instance.
 */
export declare const globalDataServiceFactory: DataServiceFactory;
export default DataServiceFactory;
//# sourceMappingURL=data-service-factory.d.ts.map