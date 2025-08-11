/**
 * USL Integration Service Helpers and Utilities.
 *
 * Provides helper functions and utilities for working with IntegrationServiceAdapter.
 * Instances, including common operations, batch processing, validation helpers,
 * and specialized integration patterns.
 */
/**
 * @file Interface implementation: integration-service-helpers.
 */
import type { ArchitectureDesign } from '../../../types/shared-types.ts';
import type { IntegrationServiceAdapter, IntegrationServiceAdapterConfig } from './integration-service-adapter.ts';
/**
 * Integration operation result type.
 *
 * @example
 */
export interface IntegrationOperationResult<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        duration: number;
        timestamp: Date;
        operationId: string;
        retryCount?: number;
        cacheHit?: boolean;
    };
}
/**
 * Batch integration operation configuration.
 *
 * @example
 */
export interface BatchIntegrationConfig {
    /** Maximum number of operations to run concurrently */
    maxConcurrency?: number;
    /** Whether to fail fast on first error or continue with remaining operations */
    failFast?: boolean;
    /** Operation timeout in milliseconds */
    operationTimeout?: number;
    /** Whether to use caching for batch operations */
    enableCaching?: boolean;
    /** Whether to deduplicate similar operations */
    enableDeduplication?: boolean;
}
/**
 * Architecture operation configuration.
 *
 * @example
 */
export interface ArchitectureOperationConfig {
    /** Whether to enable versioning for the operation */
    enableVersioning?: boolean;
    /** Whether to validate the architecture before saving */
    validateBeforeSave?: boolean;
    /** Custom validation rules */
    customValidation?: (architecture: ArchitectureDesign) => Promise<boolean>;
    /** Project ID to associate with the architecture */
    projectId?: string;
    /** Tags to apply to the architecture */
    tags?: string[];
}
/**
 * API operation configuration.
 *
 * @example
 */
export interface APIOperationConfig {
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Number of retry attempts */
    retries?: number;
    /** Whether to validate request before sending */
    validateRequest?: boolean;
    /** Whether to sanitize response after receiving */
    sanitizeResponse?: boolean;
    /** Custom headers to include */
    headers?: Record<string, string>;
    /** Request rate limiting configuration */
    rateLimit?: {
        requestsPerSecond: number;
        burstSize: number;
    };
}
/**
 * Protocol operation configuration.
 *
 * @example
 */
export interface ProtocolOperationConfig {
    /** Protocol to use for the operation */
    protocol?: string;
    /** Whether to enable connection pooling */
    useConnectionPooling?: boolean;
    /** Connection timeout in milliseconds */
    connectionTimeout?: number;
    /** Whether to enable automatic failover */
    enableFailover?: boolean;
    /** Health check configuration */
    healthCheck?: {
        enabled: boolean;
        interval: number;
        timeout: number;
    };
}
/**
 * Integration Service Helper Class.
 *
 * Provides high-level helper methods for common integration operations.
 * Across Architecture Storage, Safe API, and Protocol Management..
 *
 * @example
 */
export declare class IntegrationServiceHelper {
    private adapter;
    private logger;
    constructor(adapter: IntegrationServiceAdapter);
    /**
     * Save architecture with enhanced options.
     *
     * @param architecture
     * @param config
     */
    saveArchitectureEnhanced(architecture: ArchitectureDesign, config?: ArchitectureOperationConfig): Promise<IntegrationOperationResult<string>>;
    /**
     * Batch save multiple architectures.
     *
     * @param architectures
     * @param batchConfig
     */
    batchSaveArchitectures(architectures: {
        architecture: ArchitectureDesign;
        config?: ArchitectureOperationConfig;
    }[], batchConfig?: BatchIntegrationConfig): Promise<IntegrationOperationResult<string[]>>;
    /**
     * Search architectures with enhanced filtering.
     *
     * @param criteria
     * @param criteria.domain
     * @param criteria.tags
     * @param criteria.minScore
     * @param criteria.limit
     * @param criteria.projectId
     * @param criteria.dateRange
     * @param criteria.dateRange.start
     * @param criteria.dateRange.end
     */
    searchArchitecturesEnhanced(criteria: {
        domain?: string;
        tags?: string[];
        minScore?: number;
        limit?: number;
        projectId?: string;
        dateRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<IntegrationOperationResult<ArchitectureDesign[]>>;
    /**
     * Enhanced API request with comprehensive configuration.
     *
     * @param method
     * @param endpoint
     * @param data
     * @param config
     */
    apiRequestEnhanced<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any, config?: APIOperationConfig): Promise<IntegrationOperationResult<T>>;
    /**
     * Batch API requests with intelligent concurrency control.
     *
     * @param requests
     * @param batchConfig
     */
    batchAPIRequests<T>(requests: Array<{
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        endpoint: string;
        data?: any;
        config?: APIOperationConfig;
    }>, batchConfig?: BatchIntegrationConfig): Promise<IntegrationOperationResult<T[]>>;
    /**
     * Resource management with CRUD operations.
     *
     * @param operation
     * @param endpoint
     * @param data
     * @param data.id
     * @param data.resourceData
     * @param data.queryParams
     * @param config
     * @param _config
     */
    manageResource<T>(operation: 'create' | 'read' | 'update' | 'delete' | 'list', endpoint: string, data?: {
        id?: string | number;
        resourceData?: any;
        queryParams?: Record<string, any>;
    }, _config?: APIOperationConfig): Promise<IntegrationOperationResult<T>>;
    /**
     * Enhanced protocol communication.
     *
     * @param operation
     * @param config
     */
    protocolCommunicate<T>(operation: 'connect' | 'disconnect' | 'send' | 'receive' | 'broadcast', config?: ProtocolOperationConfig & {
        message?: any;
        protocols?: string[];
        timeout?: number;
    }): Promise<IntegrationOperationResult<T>>;
    /**
     * Protocol health monitoring.
     *
     * @param protocols
     */
    monitorProtocolHealth(protocols?: string[]): Promise<IntegrationOperationResult<Record<string, {
        status: 'healthy' | 'degraded' | 'unhealthy';
        latency: number;
        lastCheck: Date;
        errorCount: number;
    }>>>;
    /**
     * Get comprehensive service statistics.
     */
    getServiceStatistics(): Promise<IntegrationOperationResult<{
        service: {
            name: string;
            type: string;
            uptime: number;
            operationCount: number;
            errorRate: number;
        };
        cache: {
            size: number;
            hitRate: number;
            memoryUsage: number;
        };
        protocols: Record<string, any>;
        endpoints: Record<string, any>;
    }>>;
    /**
     * Validate service configuration.
     */
    validateConfiguration(): Promise<IntegrationOperationResult<{
        valid: boolean;
        issues: Array<{
            severity: 'warning' | 'error';
            component: string;
            message: string;
            suggestion?: string;
        }>;
    }>>;
    /**
     * Optimize service performance.
     */
    optimizePerformance(): Promise<IntegrationOperationResult<{
        optimizations: Array<{
            component: string;
            action: string;
            impact: string;
            applied: boolean;
        }>;
        overallImprovement: number;
    }>>;
}
/**
 * Integration Service Utilities.
 *
 * Static utility functions for integration operations.
 *
 * @example
 */
export declare class IntegrationServiceUtils {
    /**
     * Create helper instance for an adapter.
     *
     * @param adapter
     */
    static createHelper(adapter: IntegrationServiceAdapter): IntegrationServiceHelper;
    /**
     * Validate API endpoint URL.
     *
     * @param url
     */
    static validateEndpoint(url: string): boolean;
    /**
     * Generate unique operation ID.
     */
    static generateOperationId(): string;
    /**
     * Calculate retry delay with exponential backoff.
     *
     * @param attempt
     * @param baseDelay
     * @param maxDelay
     */
    static calculateRetryDelay(attempt: number, baseDelay?: number, maxDelay?: number): number;
    /**
     * Sanitize architecture data for storage.
     *
     * @param architecture
     */
    static sanitizeArchitectureData(architecture: ArchitectureDesign): ArchitectureDesign;
    /**
     * Validate protocol name.
     *
     * @param protocol
     */
    static validateProtocolName(protocol: string): boolean;
    /**
     * Format error for logging.
     *
     * @param error
     */
    static formatError(error: any): string;
    /**
     * Calculate success rate from operation results.
     *
     * @param results
     */
    static calculateSuccessRate(results: IntegrationOperationResult[]): number;
    /**
     * Merge integration configurations.
     *
     * @param base
     * @param override
     */
    static mergeConfigurations(base: Partial<IntegrationServiceAdapterConfig>, override: Partial<IntegrationServiceAdapterConfig>): Partial<IntegrationServiceAdapterConfig>;
    /**
     * Extract metrics from operation results.
     *
     * @param results
     */
    static extractMetrics(results: IntegrationOperationResult[]): {
        totalOperations: number;
        successCount: number;
        errorCount: number;
        averageLatency: number;
        successRate: number;
        errorRate: number;
    };
}
declare const _default: {
    IntegrationServiceHelper: typeof IntegrationServiceHelper;
    IntegrationServiceUtils: typeof IntegrationServiceUtils;
};
export default _default;
//# sourceMappingURL=integration-service-helpers.d.ts.map