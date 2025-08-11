/**
 * @file USL Data Service Helper Functions.
 *
 * Collection of utility functions and helper methods for common data operations.
 * across DataServiceAdapter instances. Provides simplified interfaces for
 * frequently used operations, data transformation utilities, and convenience
 * methods for working with unified data services.
 *
 * These helpers follow the same patterns as UACL client helpers, providing.
 * a higher-level abstraction over the core adapter functionality.
 */
import type { DataServiceAdapter } from './data-service-adapter.ts';
export interface BaseDocumentEntity {
    id: string;
    type: string;
    content?: string;
    projectId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface DocumentSearchOptions {
    searchType?: 'fulltext' | 'semantic' | 'keyword' | 'combined' | undefined;
    query: string;
    documentTypes?: DocumentType[] | undefined;
    projectId?: string | undefined;
    limit?: number | undefined;
    includeContent?: boolean | undefined;
}
export type DocumentType = 'document' | 'note' | 'file' | 'resource';
export interface SwarmData {
    id: string;
    name: string;
    status: string;
    agents: number;
    progress: number;
    createdAt?: string;
}
export interface SystemStatusData {
    system: string;
    status: string;
    uptime: number;
    timestamp: string;
}
export interface TaskData {
    id: string;
    title: string;
    status: string;
    progress: number;
    assignedAgents: string[];
    priority?: string;
    createdAt: string;
}
/**
 * Data operation result with standardized metadata.
 *
 * @example
 */
export interface DataOperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metadata: {
        operation: string;
        timestamp: Date;
        duration: number;
        cached: boolean;
        retryCount: number;
    };
}
/**
 * Batch operation configuration.
 *
 * @example
 */
export interface BatchOperationConfig {
    operations: Array<{
        operation: string;
        params?: Record<string, unknown>;
        options?: Record<string, unknown>;
    }>;
    concurrency?: number;
    failFast?: boolean;
    timeout?: number;
}
/**
 * Data validation result.
 *
 * @example
 */
export interface DataValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    data?: unknown;
}
/**
 * Search and filter options for enhanced querying.
 *
 * @example
 */
export interface EnhancedSearchOptions {
    query?: string;
    filters?: Record<string, unknown>;
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    pagination?: {
        limit: number;
        offset: number;
    };
    includeMetadata?: boolean;
    searchType?: 'fulltext' | 'semantic' | 'keyword' | 'combined';
}
/**
 * Data aggregation options.
 *
 * @example
 */
export interface DataAggregationOptions {
    groupBy?: string | string[];
    aggregations?: Array<{
        field: string;
        operation: 'count' | 'sum' | 'avg' | 'min' | 'max';
        alias?: string;
    }>;
    having?: Record<string, unknown>;
}
/**
 * Data transformation pipeline step.
 *
 * @example
 */
export interface TransformationStep {
    type: 'filter' | 'map' | 'reduce' | 'sort' | 'group' | 'validate';
    config: Record<string, unknown>;
}
/**
 * Data service helper class with common operations.
 *
 * @example
 */
export declare class DataServiceHelper {
    private adapter;
    private logger;
    constructor(adapter: DataServiceAdapter);
    /**
     * Get comprehensive system status with caching.
     *
     * @param useCache
     */
    getSystemStatus(useCache?: boolean): Promise<DataOperationResult<SystemStatusData>>;
    /**
     * Get system health summary.
     */
    getSystemHealthSummary(): Promise<DataOperationResult<{
        overall: 'healthy' | 'degraded' | 'unhealthy';
        components: Array<{
            name: string;
            status: string;
            lastCheck: Date;
        }>;
        metrics: {
            uptime: number;
            responseTime: number;
            errorRate: number;
        };
    }>>;
    /**
     * Get all swarms with enhanced filtering.
     *
     * @param filters
     * @param filters.status
     * @param filters.minAgents
     * @param filters.maxAgents
     * @param filters.createdAfter
     */
    getSwarms(filters?: {
        status?: string;
        minAgents?: number;
        maxAgents?: number;
        createdAfter?: Date;
    }): Promise<DataOperationResult<SwarmData[]>>;
    /**
     * Create swarm with validation and monitoring.
     *
     * @param config
     * @param config.name
     * @param config.agents
     * @param config.topology
     * @param config.timeout
     */
    createSwarm(config: {
        name: string;
        agents?: number;
        topology?: string;
        timeout?: number;
    }): Promise<DataOperationResult<SwarmData>>;
    /**
     * Get swarm statistics and analytics.
     */
    getSwarmAnalytics(): Promise<DataOperationResult<{
        totalSwarms: number;
        activeSwarms: number;
        averageAgents: number;
        averageProgress: number;
        statusDistribution: Record<string, number>;
        performanceMetrics: {
            totalTasks: number;
            completionRate: number;
            averageTaskTime: number;
        };
    }>>;
    /**
     * Get tasks with enhanced filtering and sorting.
     *
     * @param options
     */
    getTasks(options?: EnhancedSearchOptions): Promise<DataOperationResult<TaskData[]>>;
    /**
     * Create task with workflow integration.
     *
     * @param config
     * @param config.title
     * @param config.description
     * @param config.assignedAgents
     * @param config.priority
     * @param config.eta
     * @param config.dependencies
     */
    createTask(config: {
        title: string;
        description?: string;
        assignedAgents?: string[];
        priority?: 'low' | 'medium' | 'high';
        eta?: string;
        dependencies?: string[];
    }): Promise<DataOperationResult<TaskData>>;
    /**
     * Enhanced document search with multiple search types.
     *
     * @param query
     * @param options
     * @param options.searchType
     * @param options.documentTypes
     * @param options.projectId
     * @param options.limit
     * @param options.includeContent
     */
    searchDocuments<T extends BaseDocumentEntity>(query: string, options?: {
        searchType?: 'fulltext' | 'semantic' | 'keyword' | 'combined';
        documentTypes?: DocumentType[];
        projectId?: string;
        limit?: number;
        includeContent?: boolean;
    }): Promise<DataOperationResult<{
        documents: T[];
        total: number;
        searchMetadata: {
            relevanceScores?: number[];
            searchTime?: number;
            indexesUsed?: string[];
        };
    }>>;
    /**
     * Bulk document operations.
     *
     * @param operations
     */
    bulkDocumentOperations(operations: Array<{
        action: 'create' | 'update' | 'delete';
        documentId?: string;
        document?: Record<string, unknown>;
        updates?: Record<string, unknown>;
    }>): Promise<DataOperationResult<{
        successful: number;
        failed: number;
        results: Array<{
            success: boolean;
            data?: unknown;
            error?: string;
        }>;
    }>>;
    /**
     * Execute multiple operations in parallel with concurrency control.
     *
     * @param config
     */
    executeBatch(config: BatchOperationConfig): Promise<DataOperationResult<unknown[]>>;
    /**
     * Apply data transformation pipeline.
     *
     * @param data
     * @param pipeline
     */
    transformData<T, R>(data: T[], pipeline: TransformationStep[]): R[];
    /**
     * Data aggregation with multiple operations.
     *
     * @param data
     * @param options
     */
    aggregateData(data: unknown[], options: DataAggregationOptions): Record<string, unknown>;
    /**
     * Export data in various formats.
     *
     * @param data
     * @param format
     */
    exportData(data: Record<string, unknown>[], format?: 'json' | 'csv' | 'xml'): string;
    private validateSwarmConfig;
    private validateTaskConfig;
    private validateItem;
    private createMetadata;
    private createErrorResult;
    private applyFilters;
    private searchTasks;
    private sortData;
    private groupData;
    private groupByMultipleFields;
    private applyAggregations;
    private calculateDistribution;
    private convertToCSV;
    private convertToXML;
}
/**
 * Factory function for creating data service helpers.
 *
 * @param adapter
 * @example
 */
export declare function createDataServiceHelper(adapter: DataServiceAdapter): DataServiceHelper;
/**
 * Utility functions for common data operations (stateless).
 */
export declare const DataServiceUtils: {
    /**
     * Validate configuration object against schema.
     *
     * @param config
     * @param schema
     */
    validateConfiguration(config: Record<string, unknown>, schema: {
        required?: string[];
    }): DataValidationResult;
    /**
     * Generate cache key for operation.
     *
     * @param operation
     * @param params
     * @param prefix
     */
    generateCacheKey(operation: string, params?: Record<string, unknown>, prefix?: string): string;
    /**
     * Estimate data size in bytes.
     *
     * @param data
     */
    estimateDataSize(data: unknown): number;
    /**
     * Deep clone object safely.
     *
     * @param obj
     */
    deepClone<T>(obj: T): T;
    /**
     * Merge objects deeply.
     *
     * @param target
     * @param {...any} sources
     */
    deepMerge(target: Record<string, unknown>, ...sources: Array<Record<string, unknown>>): Record<string, unknown>;
    /**
     * Rate limiting utility.
     *
     * @param maxRequests
     * @param windowMs
     */
    createRateLimiter(maxRequests: number, windowMs: number): (key: string) => boolean;
};
export default DataServiceHelper;
//# sourceMappingURL=data-service-helpers.d.ts.map