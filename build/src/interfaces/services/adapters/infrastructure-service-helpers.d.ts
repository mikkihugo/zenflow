/**
 * USL Infrastructure Service Helpers.
 *
 * Helper functions and utilities for infrastructure service operations,
 * providing high-level convenience methods for common infrastructure tasks.
 * Follows the same patterns as other USL service helpers.
 */
/**
 * @file Interface implementation: infrastructure-service-helpers.
 */
import type { InfrastructureServiceAdapter, InfrastructureServiceAdapterConfig } from './infrastructure-service-adapter.ts';
import type { CreateServiceOptions } from './infrastructure-service-factory.ts';
/**
 * Quick create infrastructure service with minimal configuration.
 *
 * @param name
 * @param options
 * @param options.enableFacade
 * @param options.enablePatternIntegration
 * @param options.enableResourceTracking
 * @param options.enableHealthMonitoring
 * @param options.autoStart
 * @example
 */
export declare function quickCreateInfrastructureService(name: string, options?: {
    enableFacade?: boolean;
    enablePatternIntegration?: boolean;
    enableResourceTracking?: boolean;
    enableHealthMonitoring?: boolean;
    autoStart?: boolean;
}): Promise<InfrastructureServiceAdapter>;
/**
 * Create infrastructure service with facade-only configuration.
 *
 * @param name
 * @param facadeOptions
 * @param facadeOptions.mockServices
 * @param facadeOptions.enableBatchOperations
 * @param facadeOptions.systemStatusInterval
 * @example
 */
export declare function createFacadeOnlyInfrastructureService(name: string, facadeOptions?: {
    mockServices?: boolean;
    enableBatchOperations?: boolean;
    systemStatusInterval?: number;
}): Promise<InfrastructureServiceAdapter>;
/**
 * Create infrastructure service with pattern integration only.
 *
 * @param name
 * @param patternOptions
 * @param patternOptions.configProfile
 * @param patternOptions.maxAgents
 * @param patternOptions.enableAutoOptimization
 * @example
 */
export declare function createPatternIntegrationOnlyService(name: string, patternOptions?: {
    configProfile?: 'default' | 'production' | 'development';
    maxAgents?: number;
    enableAutoOptimization?: boolean;
}): Promise<InfrastructureServiceAdapter>;
/**
 * Create infrastructure service optimized for production.
 *
 * @param name
 * @param productionOptions
 * @param productionOptions.maxConcurrentServices
 * @param productionOptions.enableCircuitBreaker
 * @param productionOptions.enablePredictiveMonitoring
 * @param productionOptions.configEncryption
 * @example
 */
export declare function createProductionInfrastructureService(name: string, productionOptions?: {
    maxConcurrentServices?: number;
    enableCircuitBreaker?: boolean;
    enablePredictiveMonitoring?: boolean;
    configEncryption?: boolean;
}): Promise<InfrastructureServiceAdapter>;
/**
 * Execute project initialization with retries.
 *
 * @param service
 * @param projectConfig
 * @param maxRetries
 * @example
 */
export declare function initializeProjectWithRetries(service: InfrastructureServiceAdapter, projectConfig: any, maxRetries?: number): Promise<any>;
/**
 * Process document with enhanced error handling.
 *
 * @param service
 * @param documentPath
 * @param options
 * @param options.useNeural
 * @param options.cacheResults
 * @param options.priority
 * @param options.timeout
 * @param options.swarmId
 * @example
 */
export declare function processDocumentEnhanced(service: InfrastructureServiceAdapter, documentPath: string, options?: {
    useNeural?: boolean;
    cacheResults?: boolean;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    timeout?: number;
    swarmId?: string;
}): Promise<any>;
/**
 * Execute batch operations with progress tracking.
 *
 * @param service
 * @param operations
 * @param onProgress
 * @example
 */
export declare function executeBatchWithProgress(service: InfrastructureServiceAdapter, operations: Array<{
    type: string;
    params: any;
}>, onProgress?: (completed: number, total: number, currentOperation: string) => void): Promise<any[]>;
/**
 * Get comprehensive system status with caching.
 *
 * @param service
 * @param cacheTTL
 * @example
 */
export declare function getSystemStatusCached(service: InfrastructureServiceAdapter, cacheTTL?: number): Promise<any>;
/**
 * Initialize and configure a swarm with best practices.
 *
 * @param service
 * @param swarmConfig
 * @param swarmConfig.topology
 * @param swarmConfig.agentCount
 * @param swarmConfig.capabilities
 * @param swarmConfig.enableAutoOptimization
 * @example
 */
export declare function initializeOptimizedSwarm(service: InfrastructureServiceAdapter, swarmConfig: {
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    agentCount?: number;
    capabilities?: string[];
    enableAutoOptimization?: boolean;
}): Promise<any>;
/**
 * Coordinate swarm operations with monitoring.
 *
 * @param service
 * @param swarmId
 * @param operation
 * @param monitoringCallback
 * @example
 */
export declare function coordinateSwarmWithMonitoring(service: InfrastructureServiceAdapter, swarmId: string, operation: string, monitoringCallback?: (metrics: any) => void): Promise<any>;
/**
 * Perform comprehensive resource optimization.
 *
 * @param service
 * @example
 */
export declare function optimizeResourcesComprehensive(service: InfrastructureServiceAdapter): Promise<{
    optimizations: string[];
    resourcesSaved: any;
    recommendations: string[];
}>;
/**
 * Monitor resource usage with alerts.
 *
 * @param service
 * @param thresholds
 * @param thresholds.cpu
 * @param thresholds.memory
 * @param thresholds.network
 * @param thresholds.storage
 * @param alertCallback
 * @example
 */
export declare function monitorResourcesWithAlerts(service: InfrastructureServiceAdapter, thresholds?: {
    cpu?: number;
    memory?: number;
    network?: number;
    storage?: number;
}, alertCallback?: (alert: {
    type: string;
    value: number;
    threshold: number;
}) => void): Promise<NodeJS.Timeout>;
/**
 * Update configuration with validation and rollback capability.
 *
 * @param service
 * @param newConfig
 * @param validateFirst
 * @example
 */
export declare function updateConfigurationSafely(service: InfrastructureServiceAdapter, newConfig: Partial<InfrastructureServiceAdapterConfig>, validateFirst?: boolean): Promise<{
    success: boolean;
    rollbackAvailable: boolean;
    version?: string;
}>;
/**
 * Rollback configuration to a previous version.
 *
 * @param service
 * @param version
 * @example
 */
export declare function rollbackConfiguration(service: InfrastructureServiceAdapter, version?: string): Promise<{
    success: boolean;
    rolledBackTo: string;
}>;
/**
 * Perform comprehensive health check with detailed results.
 *
 * @param service
 * @example
 */
export declare function performComprehensiveHealthCheck(service: InfrastructureServiceAdapter): Promise<{
    overall: boolean;
    details: {
        service: boolean;
        dependencies: boolean;
        resources: boolean;
        performance: boolean;
    };
    recommendations: string[];
    metrics: any;
}>;
/**
 * Create and configure infrastructure service using factory with best practices.
 *
 * @param name
 * @param environment
 * @param customOptions
 * @example
 */
export declare function createInfrastructureServiceWithBestPractices(name: string, environment?: 'development' | 'staging' | 'production', customOptions?: CreateServiceOptions): Promise<InfrastructureServiceAdapter>;
/**
 * Wait for service to be ready with timeout.
 *
 * @param service
 * @param timeout
 * @param checkInterval
 * @example
 */
export declare function waitForServiceReady(service: InfrastructureServiceAdapter, timeout?: number, checkInterval?: number): Promise<boolean>;
/**
 * Execute operation with automatic retries and exponential backoff.
 *
 * @param service
 * @param operation
 * @param params
 * @param options
 * @param options.maxRetries
 * @param options.baseDelay
 * @param options.maxDelay
 * @param options.timeout
 * @example
 */
export declare function executeWithRetries<T>(service: InfrastructureServiceAdapter, operation: string, params?: any, options?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    timeout?: number;
}): Promise<T>;
/**
 * Batch execute multiple operations with concurrency control.
 *
 * @param service
 * @param operations
 * @param maxConcurrency
 * @example
 */
export declare function batchExecuteWithConcurrency<T>(service: InfrastructureServiceAdapter, operations: Array<{
    operation: string;
    params?: any;
}>, maxConcurrency?: number): Promise<Array<{
    success: boolean;
    data?: T;
    error?: Error;
}>>;
declare const _default: {
    quickCreateInfrastructureService: typeof quickCreateInfrastructureService;
    createFacadeOnlyInfrastructureService: typeof createFacadeOnlyInfrastructureService;
    createPatternIntegrationOnlyService: typeof createPatternIntegrationOnlyService;
    createProductionInfrastructureService: typeof createProductionInfrastructureService;
    initializeProjectWithRetries: typeof initializeProjectWithRetries;
    processDocumentEnhanced: typeof processDocumentEnhanced;
    executeBatchWithProgress: typeof executeBatchWithProgress;
    getSystemStatusCached: typeof getSystemStatusCached;
    initializeOptimizedSwarm: typeof initializeOptimizedSwarm;
    coordinateSwarmWithMonitoring: typeof coordinateSwarmWithMonitoring;
    optimizeResourcesComprehensive: typeof optimizeResourcesComprehensive;
    monitorResourcesWithAlerts: typeof monitorResourcesWithAlerts;
    updateConfigurationSafely: typeof updateConfigurationSafely;
    rollbackConfiguration: typeof rollbackConfiguration;
    performComprehensiveHealthCheck: typeof performComprehensiveHealthCheck;
    createInfrastructureServiceWithBestPractices: typeof createInfrastructureServiceWithBestPractices;
    waitForServiceReady: typeof waitForServiceReady;
    executeWithRetries: typeof executeWithRetries;
    batchExecuteWithConcurrency: typeof batchExecuteWithConcurrency;
};
export default _default;
//# sourceMappingURL=infrastructure-service-helpers.d.ts.map