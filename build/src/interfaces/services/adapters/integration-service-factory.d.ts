/**
 * USL Integration Service Factory.
 *
 * Factory for creating and managing IntegrationServiceAdapter instances.
 * With predefined configurations for different integration scenarios.
 * Provides convenience methods for Architecture Storage, Safe API, and.
 * Protocol Management integration patterns.
 */
/**
 * @file Interface implementation: integration-service-factory.
 */
import type { IService, IServiceFactory, ServiceConfig } from '../core/interfaces.ts';
import type { ServiceType } from '../types.ts';
import { type IntegrationServiceAdapter, type IntegrationServiceAdapterConfig } from './integration-service-adapter.ts';
/**
 * Integration Service Factory Options for different integration patterns.
 *
 * @example
 */
export interface IntegrationServiceFactoryOptions {
    /** Default base URL for Safe API integrations */
    defaultBaseURL?: string;
    /** Default database type for Architecture Storage integrations */
    defaultDatabaseType?: 'postgresql' | 'sqlite' | 'mysql';
    /** Default supported protocols for Protocol Management integrations */
    defaultProtocols?: string[];
    /** Enable caching across all created services */
    enableGlobalCaching?: boolean;
    /** Enable metrics collection across all created services */
    enableGlobalMetrics?: boolean;
    /** Default retry settings for all created services */
    defaultRetrySettings?: {
        enabled: boolean;
        maxAttempts: number;
        backoffMultiplier: number;
        retryableOperations?: string[];
    };
    /** Default security settings for all created services */
    defaultSecuritySettings?: {
        enableValidation?: boolean;
        enableSanitization?: boolean;
        enableRateLimiting?: boolean;
        enableAuditLogging?: boolean;
    };
}
/**
 * Integration Service Factory.
 *
 * Creates specialized IntegrationServiceAdapter instances for different
 * integration patterns including Architecture Storage, Safe API, and.
 * Protocol Management scenarios.
 *
 * @example
 */
export declare class IntegrationServiceFactory implements IServiceFactory<ServiceConfig> {
    private logger;
    private options;
    private createdServices;
    constructor(options?: IntegrationServiceFactoryOptions);
    /**
     * IServiceFactory implementation - create service from configuration.
     *
     * @param config
     */
    create(config: ServiceConfig): Promise<IService>;
    /**
     * Check if factory can handle the given service type.
     *
     * @param type
     */
    canHandle(type: ServiceType | string): boolean;
    /**
     * Create multiple service instances.
     *
     * @param configs
     */
    createMultiple(configs: ServiceConfig[]): Promise<IService[]>;
    /**
     * Get a service instance by name.
     *
     * @param name
     */
    get(name: string): IService | undefined;
    /**
     * List all managed service instances.
     */
    list(): IService[];
    /**
     * Check if a service with the given name exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove and destroy a service instance.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Check if factory supports the given service type.
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
     * Health check all services.
     */
    healthCheckAll(): Promise<Map<string, any>>;
    /**
     * Get metrics for all services.
     */
    getMetricsAll(): Promise<Map<string, any>>;
    /**
     * Get active service count.
     */
    getActiveCount(): number;
    /**
     * Get services by type.
     *
     * @param type
     */
    getServicesByType(type: string): IService[];
    /**
     * Validate configuration.
     *
     * @param config
     */
    validateConfig(config: ServiceConfig): Promise<boolean>;
    /**
     * Get configuration schema.
     *
     * @param type
     */
    getConfigSchema(type: string): Record<string, any> | undefined;
    /**
     * Get supported service types.
     */
    getSupportedTypes(): (ServiceType | string)[];
    /**
     * Create Architecture Storage integration adapter.
     *
     * @param name
     * @param databaseType
     * @param options
     */
    createArchitectureStorageAdapter(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', options?: Partial<IntegrationServiceAdapterConfig>): Promise<IntegrationServiceAdapter>;
    /**
     * Create Safe API integration adapter.
     *
     * @param name
     * @param baseURL
     * @param options
     */
    createSafeAPIAdapter(name: string, baseURL?: string, options?: Partial<IntegrationServiceAdapterConfig>): Promise<IntegrationServiceAdapter>;
    /**
     * Create Protocol Management integration adapter.
     *
     * @param name
     * @param supportedProtocols
     * @param options
     */
    createProtocolManagementAdapter(name: string, supportedProtocols?: string[], options?: Partial<IntegrationServiceAdapterConfig>): Promise<IntegrationServiceAdapter>;
    /**
     * Create unified integration adapter (all features enabled).
     *
     * @param name
     * @param options.
     * @param options
     */
    createUnifiedIntegrationAdapter(name: string, options?: {
        baseURL?: string;
        databaseType?: 'postgresql' | 'sqlite' | 'mysql';
        supportedProtocols?: string[];
    } & Partial<IntegrationServiceAdapterConfig>): Promise<IntegrationServiceAdapter>;
    /**
     * Create Web Data integration adapter (specialized for web-based data operations).
     *
     * @param name
     * @param baseURL
     * @param options.
     * @param options
     */
    createWebDataIntegrationAdapter(name: string, baseURL: string, options?: Partial<IntegrationServiceAdapterConfig>): Promise<IntegrationServiceAdapter>;
    /**
     * Create Document integration adapter (specialized for document operations).
     *
     * @param name
     * @param databaseType
     * @param options.
     * @param options
     */
    createDocumentIntegrationAdapter(name: string, databaseType?: 'postgresql' | 'sqlite' | 'mysql', options?: Partial<IntegrationServiceAdapterConfig>): Promise<IntegrationServiceAdapter>;
    /**
     * Get all created services.
     */
    getCreatedServices(): Map<string, IntegrationServiceAdapter>;
    /**
     * Get service by name.
     *
     * @param name
     */
    getService(name: string): IntegrationServiceAdapter | undefined;
    /**
     * Check if service exists.
     *
     * @param name
     */
    hasService(name: string): boolean;
    /**
     * Remove service from tracking.
     *
     * @param name
     */
    removeService(name: string): Promise<boolean>;
    /**
     * Get factory statistics.
     */
    getFactoryStats(): {
        totalCreatedServices: number;
        activeServices: number;
        serviceTypes: Record<string, number>;
        memoryUsage: number;
    };
    /**
     * Shutdown all created services.
     */
    shutdown(): Promise<void>;
    /**
     * Convert ServiceConfig to IntegrationServiceAdapterConfig.
     *
     * @param config
     */
    private convertToAdapterConfig;
}
/**
 * Global integration service factory instance.
 */
export declare const integrationServiceFactory: IntegrationServiceFactory;
/**
 * Convenience functions for creating integration services.
 */
export declare const IntegrationServiceHelpers: {
    /**
     * Create architecture storage service.
     *
     * @param name
     * @param databaseType
     */
    createArchitectureStorage(name: string, databaseType?: "postgresql" | "sqlite" | "mysql"): Promise<IntegrationServiceAdapter>;
    /**
     * Create safe API service.
     *
     * @param name
     * @param baseURL
     */
    createSafeAPI(name: string, baseURL: string): Promise<IntegrationServiceAdapter>;
    /**
     * Create protocol management service.
     *
     * @param name
     * @param protocols
     */
    createProtocolManagement(name: string, protocols?: string[]): Promise<IntegrationServiceAdapter>;
    /**
     * Create unified integration service.
     *
     * @param name
     * @param options
     * @param options.baseURL
     * @param options.databaseType
     * @param options.supportedProtocols
     */
    createUnifiedIntegration(name: string, options?: {
        baseURL?: string;
        databaseType?: "postgresql" | "sqlite" | "mysql";
        supportedProtocols?: string[];
    }): Promise<IntegrationServiceAdapter>;
    /**
     * Create web data integration service.
     *
     * @param name
     * @param baseURL
     */
    createWebDataIntegration(name: string, baseURL: string): Promise<IntegrationServiceAdapter>;
    /**
     * Create document integration service.
     *
     * @param name
     * @param databaseType
     */
    createDocumentIntegration(name: string, databaseType?: "postgresql" | "sqlite" | "mysql"): Promise<IntegrationServiceAdapter>;
};
export default integrationServiceFactory;
//# sourceMappingURL=integration-service-factory.d.ts.map