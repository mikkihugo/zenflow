/**
 * @file USL Coordination Service Adapter.
 *
 * Unified Service Layer adapter for coordination-related services, providing
 * a consistent interface to DaaService, SessionRecoveryService, and SwarmCoordinator.
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * caching, retry logic, and performance metrics.
 *
 * This adapter follows the exact same patterns as the UACL client adapters,
 * implementing the IService interface and providing unified configuration.
 * management for coordination operations across Claude-Zen.
 */
import type { SwarmTopology } from '../../../coordination/swarm/core/types.ts';
import type { IService, ServiceConfig, ServiceDependencyConfig, ServiceEvent, ServiceEventType, ServiceMetrics, ServiceOperationOptions, ServiceOperationResponse, ServiceStatus } from '../core/interfaces.ts';
import type { CoordinationServiceConfig } from '../types.ts';
import { ServiceType } from '../types.ts';
/**
 * Coordination service adapter configuration extending USL CoordinationServiceConfig.
 *
 * @example
 */
export interface CoordinationServiceAdapterConfig {
    /** Base service configuration */
    service: CoordinationServiceConfig;
    /** Service name */
    name?: string;
    /** Service type */
    type?: ServiceType | string;
    /** DaaService integration settings */
    daaService?: {
        enabled: boolean;
        autoInitialize?: boolean;
        enableLearning?: boolean;
        enableCognitive?: boolean;
        enableMetaLearning?: boolean;
    };
    /** SessionRecoveryService integration settings */
    sessionService?: {
        enabled: boolean;
        autoRecovery?: boolean;
        healthCheckInterval?: number;
        maxSessions?: number;
        checkpointInterval?: number;
    };
    /** SwarmCoordinator integration settings */
    swarmCoordinator?: {
        enabled: boolean;
        defaultTopology?: SwarmTopology;
        maxAgents?: number;
        coordinationTimeout?: number;
        performanceThreshold?: number;
    };
    /** Performance optimization settings */
    performance?: {
        enableRequestDeduplication?: boolean;
        maxConcurrency?: number;
        requestTimeout?: number;
        enableMetricsCollection?: boolean;
        agentPooling?: boolean;
        sessionCaching?: boolean;
    };
    /** Retry configuration for failed operations */
    retry?: {
        enabled: boolean;
        maxAttempts: number;
        backoffMultiplier: number;
        retryableOperations?: string[];
        attempts?: number;
    };
    /** Cache configuration for coordination operations */
    cache?: {
        enabled: boolean;
        strategy: 'memory' | 'redis' | 'hybrid';
        defaultTTL: number;
        maxSize: number;
        keyPrefix: string;
    };
    /** Agent lifecycle management settings */
    agentManagement?: {
        autoSpawn?: boolean;
        maxLifetime?: number;
        healthCheckInterval?: number;
        performanceTracking?: boolean;
    };
    /** Learning and adaptation settings */
    learning?: {
        enableContinuousLearning?: boolean;
        knowledgeSharing?: boolean;
        patternAnalysis?: boolean;
        metaLearningInterval?: number;
    };
}
/**
 * Unified Coordination Service Adapter.
 *
 * Provides a unified interface to DaaService, SessionRecoveryService, and SwarmCoordinator.
 * While implementing the IService interface for USL compatibility.
 *
 * Features:
 * - Unified configuration management
 * - Performance monitoring and metrics
 * - Request caching and deduplication
 * - Retry logic with backoff
 * - Health monitoring
 * - Event forwarding
 * - Error handling and recovery
 * - Agent lifecycle management
 * - Session state management
 * - Learning and adaptation tracking.
 *
 * @example
 */
export declare class CoordinationServiceAdapter implements IService {
    readonly name: string;
    readonly type: string;
    readonly config: ServiceConfig;
    private lifecycleStatus;
    private eventEmitter;
    private logger;
    private startTime?;
    private operationCount;
    private successCount;
    private errorCount;
    private totalLatency;
    private dependencies;
    private adapterConfig;
    private daaService?;
    private sessionEnabledSwarm?;
    private sessionRecoveryService?;
    private swarmCoordinator?;
    private cache;
    private pendingRequests;
    private metrics;
    private agentMetrics;
    private sessionMetrics;
    private healthStats;
    constructor(config: CoordinationServiceAdapterConfig);
    /**
     * Initialize the coordination service adapter and its dependencies.
     *
     * @param config
     */
    initialize(config?: Partial<ServiceConfig>): Promise<void>;
    /**
     * Start the coordination service adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the coordination service adapter.
     */
    stop(): Promise<void>;
    /**
     * Destroy the coordination service adapter and clean up resources.
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
    private createAgent;
    private adaptAgent;
    private getAgentLearningStatus;
    private createWorkflow;
    private executeWorkflow;
    private shareKnowledge;
    private analyzeCognitivePatterns;
    private setCognitivePattern;
    private performMetaLearning;
    private getPerformanceMetrics;
    private createSession;
    private loadSession;
    private saveSession;
    private createCheckpoint;
    private restoreFromCheckpoint;
    private listSessions;
    private getSessionStats;
    private coordinateSwarm;
    private addAgentToSwarm;
    private removeAgentFromSwarm;
    private assignTask;
    private completeTask;
    private getSwarmMetrics;
    private getSwarmAgents;
    private getCacheStats;
    private clearCache;
    private getServiceStats;
    private getAgentMetrics;
    private getSessionMetrics;
    private generateCacheKey;
    private isCacheableOperation;
    private getFromCache;
    private setInCache;
    private cleanupCache;
    private shouldRetryOperation;
    private recordOperationMetrics;
    private calculateCacheHitRate;
    private calculateDeduplicationRate;
    private calculateLearningOperationsRate;
    private estimateMemoryUsage;
    private estimateDataSize;
    private estimateAgentCount;
    private extractSessionId;
    private calculateCoordinationLatency;
    private determineHealthStatus;
    private startCacheCleanupTimer;
    private startMetricsCleanupTimer;
    private startAgentMetricsTimer;
    private startLearningTimer;
}
/**
 * Factory function for creating CoordinationServiceAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createCoordinationServiceAdapter(config: CoordinationServiceAdapterConfig): CoordinationServiceAdapter;
/**
 * Helper function for creating default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultCoordinationServiceAdapterConfig(name: string, overrides?: Partial<CoordinationServiceAdapterConfig>): CoordinationServiceAdapterConfig;
export default CoordinationServiceAdapter;
//# sourceMappingURL=coordination-service-adapter.d.ts.map