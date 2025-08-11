/**
 * @file USL Integration Service Adapter for unified service layer integration.
 *
 * Unified Service Layer adapter for integration-related services, providing a consistent interface to ArchitectureStorageService, SafeAPIService, and Integration Protocols while maintaining full backward compatibility and adding enhanced monitoring, caching, retry logic, and performance metrics.
 *
 * This adapter follows the exact same patterns as the UACL client adapters, implementing the IService interface and providing unified configuration management for integration operations across Claude-Zen.
 */
import type { IService, ServiceConfig, ServiceDependencyConfig, ServiceEvent, ServiceEventType, ServiceMetrics, ServiceOperationOptions, ServiceOperationResponse, ServiceStatus } from '../core/interfaces.ts';
import type { IntegrationServiceConfig } from '../types.ts';
/**
 * Integration service adapter configuration extending USL IntegrationServiceConfig.
 *
 * @example
 */
export interface IntegrationServiceAdapterConfig extends Omit<IntegrationServiceConfig, 'type'> {
    /** Service name */
    name?: string;
    /** Service type */
    type?: string;
    /** Architecture Storage Service integration settings */
    architectureStorage?: {
        enabled: boolean;
        databaseType?: 'postgresql' | 'sqlite' | 'mysql';
        autoInitialize?: boolean;
        enableVersioning?: boolean;
        enableValidationTracking?: boolean;
        cachingEnabled?: boolean;
    };
    /** Safe API Service integration settings */
    safeAPI?: {
        enabled: boolean;
        baseURL?: string;
        timeout?: number;
        retries?: number;
        rateLimiting?: {
            enabled: boolean;
            requestsPerSecond: number;
            burstSize: number;
        };
        authentication?: {
            type: 'bearer' | 'api-key' | 'oauth';
            credentials?: string;
        };
        validation?: {
            enabled: boolean;
            strictMode: boolean;
            sanitization: boolean;
        };
    };
    /** Protocol Management integration settings */
    protocolManagement?: {
        enabled: boolean;
        supportedProtocols: string[];
        defaultProtocol: string;
        connectionPooling?: {
            enabled: boolean;
            maxConnections: number;
            idleTimeout: number;
        };
        failover?: {
            enabled: boolean;
            retryAttempts: number;
            backoffMultiplier: number;
        };
        healthChecking?: {
            enabled: boolean;
            interval: number;
            timeout: number;
        };
    };
    /** Performance optimization settings */
    performance?: {
        enableRequestDeduplication?: boolean;
        maxConcurrency?: number;
        requestTimeout?: number;
        enableMetricsCollection?: boolean;
        connectionPooling?: boolean;
        compressionEnabled?: boolean;
    };
    /** Retry configuration for failed operations */
    retry?: {
        enabled: boolean;
        maxAttempts: number;
        backoffMultiplier: number;
        retryableOperations: string[];
    };
    /** Cache configuration for integration operations */
    cache?: {
        enabled: boolean;
        strategy: 'memory' | 'redis' | 'hybrid';
        defaultTTL: number;
        maxSize: number;
        keyPrefix: string;
    };
    /** Security and validation settings */
    security?: {
        enableRequestValidation?: boolean;
        enableResponseSanitization?: boolean;
        enableRateLimiting?: boolean;
        enableAuditLogging?: boolean;
        enableEncryption?: boolean;
    };
    /** Multi-protocol communication settings */
    multiProtocol?: {
        enableProtocolSwitching?: boolean;
        protocolPriorityOrder?: string[];
        enableLoadBalancing?: boolean;
        enableCircuitBreaker?: boolean;
    };
}
/**
 * Unified Integration Service Adapter.
 *
 * Provides a unified interface to ArchitectureStorageService, SafeAPIService,
 * and Protocol Management while implementing the IService interface for USL compatibility.
 *
 * Features:
 * - Unified configuration management
 * - Performance monitoring and metrics
 * - Request caching and deduplication
 * - Retry logic with backoff
 * - Health monitoring
 * - Event forwarding
 * - Error handling and recovery
 * - Multi-protocol support
 * - API safety and validation
 * - Architecture persistence with versioning
 * - Connection management and pooling
 * - Circuit breaker pattern for resilience.
 *
 * @example
 */
export declare class IntegrationServiceAdapter implements IService {
    readonly name: string;
    readonly type: string;
    readonly config: ServiceConfig & IntegrationServiceAdapterConfig;
    private lifecycleStatus;
    private eventEmitter;
    private logger;
    private startTime?;
    private operationCount;
    private successCount;
    private errorCount;
    private totalLatency;
    private dependencies;
    private architectureStorageService?;
    private safeAPIService?;
    private safeAPIClient?;
    private protocolManager?;
    private cache;
    private pendingRequests;
    private metrics;
    private protocolMetrics;
    private apiEndpointMetrics;
    private architectureMetrics;
    private healthStats;
    private connectionPool;
    private protocolAdapters;
    private circuitBreakers;
    constructor(config: IntegrationServiceAdapterConfig);
    /**
     * Initialize the integration service adapter and its dependencies.
     *
     * @param config
     */
    initialize(config?: Partial<ServiceConfig>): Promise<void>;
    /**
     * Start the integration service adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the integration service adapter.
     */
    stop(): Promise<void>;
    /**
     * Destroy the integration service adapter and clean up resources.
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
    private saveArchitecture;
    private getArchitecture;
    private updateArchitecture;
    private deleteArchitecture;
    private searchArchitectures;
    private getArchitecturesByProject;
    private getArchitecturesByDomain;
    private saveValidation;
    private getValidationHistory;
    private getArchitectureStats;
    private safeAPIGet;
    private safeAPIPost;
    private safeAPIPut;
    private safeAPIDelete;
    private createResource;
    private getResource;
    private listResources;
    private updateResource;
    private deleteResource;
    private connectProtocol;
    private disconnectProtocol;
    private sendProtocolMessage;
    private receiveProtocolMessage;
    private checkProtocolHealth;
    private listActiveProtocols;
    private switchProtocol;
    private broadcastMessage;
    private getConnectionPoolStatus;
    private cleanupConnectionPools;
    private validateRequest;
    private sanitizeResponse;
    private checkRateLimit;
    private getCacheStats;
    private clearCache;
    private getServiceStats;
    private getProtocolMetrics;
    private getEndpointMetrics;
    private generateCacheKey;
    private isCacheableOperation;
    private getFromCache;
    private setInCache;
    private cleanupCache;
    private shouldRetryOperation;
    private recordOperationMetrics;
    private recordArchitectureMetrics;
    private updateAPIEndpointMetrics;
    private calculateCacheHitRate;
    private calculateDeduplicationRate;
    private calculateProtocolHealthScore;
    private calculateArchitectureOperationsRate;
    private calculateValidationSuccessRate;
    private estimateMemoryUsage;
    private estimateDataSize;
    private extractProtocol;
    private extractEndpoint;
    private determineHealthStatus;
    private createProtocolAdapter;
    private initializeProtocolConnections;
    private isConnectionPoolHealthy;
    private isCircuitBreakerClosed;
    private recordCircuitBreakerFailure;
    private resetCircuitBreaker;
    private startCacheCleanupTimer;
    private startMetricsCleanupTimer;
    private startProtocolHealthCheckTimer;
    private startSecurityMonitoringTimer;
}
/**
 * Factory function for creating IntegrationServiceAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createIntegrationServiceAdapter(config: IntegrationServiceAdapterConfig): IntegrationServiceAdapter;
/**
 * Helper function for creating default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultIntegrationServiceAdapterConfig(name: string, overrides?: Partial<IntegrationServiceAdapterConfig>): IntegrationServiceAdapterConfig;
export default IntegrationServiceAdapter;
//# sourceMappingURL=integration-service-adapter.d.ts.map