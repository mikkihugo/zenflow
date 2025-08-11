/**
 * @file USL Data Service Adapter.
 *
 * Unified Service Layer adapter for data-related services, providing
 * a consistent interface to WebDataService and DocumentService while.
 * maintaining full backward compatibility and adding enhanced monitoring,
 * caching, retry logic, and performance metrics.
 *
 * This adapter follows the exact same patterns as the UACL client adapters,
 * implementing the IService interface and providing unified configuration.
 * management for data operations across Claude-Zen.
 */
import type { IService, ServiceConfig, ServiceDependencyConfig, ServiceEvent, ServiceEventType, ServiceMetrics, ServiceOperationOptions, ServiceOperationResponse, ServiceStatus } from '../../core/interfaces';
import { ServiceEnvironment, ServicePriority } from '../types.ts';
/**
 * Data service adapter configuration extending USL DataServiceConfig.
 *
 * @example
 */
export interface DataServiceAdapterConfig {
    name: string;
    type: string;
    enabled?: boolean;
    priority?: ServicePriority;
    environment?: ServiceEnvironment;
    timeout?: number;
    health?: {
        enabled: boolean;
        interval: number;
        timeout: number;
        failureThreshold: number;
        successThreshold: number;
    };
    monitoring?: {
        enabled: boolean;
        metricsInterval: number;
        trackLatency: boolean;
        trackThroughput: boolean;
        trackErrors: boolean;
        trackMemoryUsage: boolean;
    };
    /** WebDataService integration settings */
    webData?: {
        enabled: boolean;
        mockData?: boolean;
        cacheResponses?: boolean;
        cacheTTL?: number;
    };
    /** DocumentService integration settings */
    documentData?: {
        enabled: boolean;
        databaseType?: 'postgresql' | 'sqlite' | 'mysql';
        autoInitialize?: boolean;
        searchIndexing?: boolean;
    };
    /** Performance optimization settings */
    performance?: {
        enableRequestDeduplication?: boolean;
        maxConcurrency?: number;
        requestTimeout?: number;
        enableMetricsCollection?: boolean;
    };
    /** Retry configuration for failed operations */
    retry?: {
        enabled: boolean;
        maxAttempts: number;
        backoffMultiplier: number;
        retryableOperations: string[];
    };
    /** Cache configuration for data operations */
    cache?: {
        enabled: boolean;
        strategy: 'memory' | 'redis' | 'hybrid';
        defaultTTL: number;
        maxSize: number;
        keyPrefix: string;
    };
}
/**
 * Unified Data Service Adapter.
 *
 * Provides a unified interface to WebDataService and DocumentService.
 * While implementing the IService interface for USL compatibility.
 *
 * Features:
 * - Unified configuration management
 * - Performance monitoring and metrics
 * - Request caching and deduplication
 * - Retry logic with backoff
 * - Health monitoring
 * - Event forwarding
 * - Error handling and recovery.
 *
 * @example
 */
export declare class DataServiceAdapter implements IService {
    readonly name: string;
    readonly type: string;
    readonly config: DataServiceAdapterConfig;
    private lifecycleStatus;
    private eventEmitter;
    private logger;
    private startTime?;
    private operationCount;
    private successCount;
    private errorCount;
    private totalLatency;
    private dependencies;
    private webDataService?;
    private documentService?;
    private cache;
    private pendingRequests;
    private metrics;
    private healthStats;
    constructor(config: DataServiceAdapterConfig);
    /**
     * Initialize the data service adapter and its dependencies.
     *
     * @param config
     */
    initialize(config?: Partial<ServiceConfig>): Promise<void>;
    /**
     * Start the data service adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the data service adapter.
     */
    stop(): Promise<void>;
    /**
     * Destroy the data service adapter and clean up resources.
     */
    destroy(): Promise<void>;
    /**
     * Get service status information.
     */
    getStatus(): Promise<ServiceStatus>;
    /**
     * Get service performance metrics.
     */
    getMetrics(): Promise<ServiceMetrics>;
    /**
     * Perform health check on the service.
     */
    healthCheck(): Promise<boolean>;
    /**
     * Update service configuration.
     *
     * @param config
     */
    updateConfig(config: Partial<ServiceConfig>): Promise<void>;
    /**
     * Validate service configuration.
     *
     * @param config
     */
    validateConfig(config: ServiceConfig): Promise<boolean>;
    /**
     * Check if service is ready to handle operations.
     */
    isReady(): boolean;
    /**
     * Get service capabilities.
     */
    getCapabilities(): string[];
    /**
     * Execute service operations with unified interface.
     *
     * @param operation
     * @param params
     * @param options
     */
    execute<T = any>(operation: string, params?: any, options?: ServiceOperationOptions): Promise<ServiceOperationResponse<T>>;
    on(event: ServiceEventType, handler: (event: ServiceEvent) => void): void;
    off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): void;
    emit(event: ServiceEventType, data?: any, error?: Error): void;
    addDependency(dependency: ServiceDependencyConfig): Promise<void>;
    removeDependency(serviceName: string): Promise<void>;
    checkDependencies(): Promise<boolean>;
    /**
     * Internal operation execution with caching, deduplication, and retry logic.
     *
     * @param operation
     * @param params
     * @param options
     */
    private executeOperationInternal;
    /**
     * Execute operation with retry logic.
     *
     * @param operation
     * @param params
     * @param options
     * @param attempt
     */
    private executeWithRetry;
    /**
     * Perform the actual operation based on operation type.
     *
     * @param operation
     * @param params
     * @param options
     * @param _options
     */
    private performOperation;
    private getSystemStatus;
    private getSwarms;
    private createSwarm;
    private getTasks;
    private createTask;
    private getDocuments;
    private executeCommand;
    private createDocument;
    private getDocument;
    private updateDocument;
    private deleteDocument;
    private queryDocuments;
    private searchDocuments;
    private createProject;
    private getProjectWithDocuments;
    private getCacheStats;
    private clearCache;
    private getServiceStats;
    private generateCacheKey;
    private isCacheableOperation;
    private getFromCache;
    private setInCache;
    private cleanupCache;
    private shouldRetryOperation;
    private recordOperationMetrics;
    private calculateCacheHitRate;
    private calculateDeduplicationRate;
    private estimateMemoryUsage;
    private estimateDataSize;
    private determineHealthStatus;
    private startCacheCleanupTimer;
    private startMetricsCleanupTimer;
}
/**
 * Factory function for creating DataServiceAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createDataServiceAdapter(config: DataServiceAdapterConfig): DataServiceAdapter;
/**
 * Helper function for creating default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultDataServiceAdapterConfig(name: string, overrides?: Partial<DataServiceAdapterConfig>): DataServiceAdapterConfig;
export default DataServiceAdapter;
//# sourceMappingURL=data-service-adapter.d.ts.map