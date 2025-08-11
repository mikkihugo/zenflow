/**
 * @file USL Infrastructure Service Adapter.
 *
 * Unified Service Layer adapter for infrastructure-related services, providing
 * a consistent interface to ClaudeZenFacade, IntegratedPatternSystem, and
 * core infrastructure services while maintaining full backward compatibility.
 * and adding enhanced orchestration, resource management, configuration management,
 * and performance metrics.
 *
 * This adapter follows the exact same patterns as other USL service adapters,
 * implementing the IService interface and providing unified configuration.
 * management for infrastructure operations across Claude-Zen.
 */
import type { IService, ServiceDependencyConfig, ServiceEvent, ServiceEventType, ServiceMetrics, ServiceOperationOptions, ServiceOperationResponse, ServiceStatus } from '../core/interfaces.ts';
import type { InfrastructureServiceConfig } from '../types.ts';
/**
 * Infrastructure service adapter configuration extending USL InfrastructureServiceConfig.
 *
 * @example
 */
export interface InfrastructureServiceAdapterConfig extends InfrastructureServiceConfig {
    /** Claude Zen Facade integration settings */
    facade?: {
        enabled: boolean;
        autoInitialize?: boolean;
        enableCaching?: boolean;
        enableMetrics?: boolean;
        enableHealthChecks?: boolean;
        systemStatusInterval?: number;
        mockServices?: boolean;
        enableBatchOperations?: boolean;
    };
    /** Pattern Integration System settings */
    patternIntegration?: {
        enabled: boolean;
        configProfile?: 'default' | 'production' | 'development';
        enableEventSystem?: boolean;
        enableCommandSystem?: boolean;
        enableProtocolSystem?: boolean;
        enableAgentSystem?: boolean;
        maxAgents?: number;
        enableAutoOptimization?: boolean;
    };
    /** Service orchestration settings */
    orchestration?: {
        enableServiceDiscovery?: boolean;
        enableLoadBalancing?: boolean;
        enableCircuitBreaker?: boolean;
        maxConcurrentServices?: number;
        serviceStartupTimeout?: number;
        shutdownGracePeriod?: number;
        enableServiceMesh?: boolean;
    };
    /** Resource management settings */
    resourceManagement?: {
        enableResourceTracking?: boolean;
        enableResourceOptimization?: boolean;
        memoryThreshold?: number;
        cpuThreshold?: number;
        diskThreshold?: number;
        networkThreshold?: number;
        cleanupInterval?: number;
        enableGarbageCollection?: boolean;
    };
    /** Configuration management settings */
    configManagement?: {
        enableHotReload?: boolean;
        enableValidation?: boolean;
        enableVersioning?: boolean;
        reloadCheckInterval?: number;
        backupConfigs?: boolean;
        maxConfigHistory?: number;
        configEncryption?: boolean;
    };
    /** Event coordination settings */
    eventCoordination?: {
        enableCentralizedEvents?: boolean;
        enableEventPersistence?: boolean;
        enableEventMetrics?: boolean;
        maxEventQueueSize?: number;
        eventRetentionPeriod?: number;
        enableEventFiltering?: boolean;
        enableEventAggregation?: boolean;
    };
    /** Health monitoring settings */
    healthMonitoring?: {
        enableAdvancedChecks?: boolean;
        enableServiceDependencyTracking?: boolean;
        enablePerformanceAlerts?: boolean;
        healthCheckTimeout?: number;
        performanceThresholds?: {
            responseTime?: number;
            errorRate?: number;
            resourceUsage?: number;
        };
        enablePredictiveMonitoring?: boolean;
    };
}
/**
 * Unified Infrastructure Service Adapter.
 *
 * Provides a unified interface to ClaudeZenFacade, IntegratedPatternSystem,
 * and core infrastructure services while implementing the IService interface.
 * For USL compatibility.
 *
 * Features:
 * - Service orchestration and lifecycle management
 * - Resource monitoring and optimization
 * - Configuration management with hot reloading
 * - Event-driven architecture coordination
 * - Health checking and service discovery
 * - Performance optimization and load balancing
 * - Unified configuration management
 * - Performance monitoring and metrics
 * - Error handling and recovery.
 *
 * @example
 */
export declare class InfrastructureServiceAdapter implements IService {
    readonly name: string;
    readonly type: string;
    readonly config: InfrastructureServiceAdapterConfig;
    private lifecycleStatus;
    private eventEmitter;
    private logger;
    private startTime?;
    private operationCount;
    private successCount;
    private errorCount;
    private totalLatency;
    private dependencies;
    private facade?;
    private patternSystem?;
    private integrationConfig?;
    private serviceRegistry;
    private configVersions;
    private resourceTracker;
    private metrics;
    private eventQueue;
    private circuitBreakers;
    private cache;
    private performanceStats;
    constructor(config: InfrastructureServiceAdapterConfig);
    /**
     * Initialize the infrastructure service adapter and its dependencies.
     *
     * @param config
     */
    initialize(config?: Partial<InfrastructureServiceAdapterConfig>): Promise<void>;
    /**
     * Start the infrastructure service adapter.
     */
    start(): Promise<void>;
    /**
     * Stop the infrastructure service adapter.
     */
    stop(): Promise<void>;
    /**
     * Destroy the infrastructure service adapter and clean up resources.
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
    updateConfig(config: Partial<InfrastructureServiceAdapterConfig>): Promise<void>;
    /**
     * Validate service configuration.
     *
     * @param config
     */
    validateConfig(config: InfrastructureServiceAdapterConfig): Promise<boolean>;
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
     * Internal operation execution with infrastructure-specific logic.
     *
     * @param operation
     * @param params
     * @param options
     * @param _options
     */
    private executeOperationInternal;
    private initializeProject;
    private getProjectStatus;
    private processDocument;
    private getSystemStatus;
    private executeWorkflow;
    private executeBatch;
    private initializeSwarm;
    private getSwarmStatus;
    private coordinateSwarm;
    private spawnAgent;
    private getPatternSystemStatus;
    private registerService;
    private discoverServices;
    private checkServiceHealth;
    private performLoadBalancing;
    private trackResources;
    private optimizeResources;
    private getResourceStats;
    private performResourceCleanup;
    private reloadConfiguration;
    private validateCurrentConfiguration;
    private getConfigurationVersion;
    private rollbackConfiguration;
    private publishEvent;
    private subscribeToEvents;
    private getEventStats;
    private clearEventQueue;
    private getInfrastructureStats;
    private clearCache;
    private performHealthCheck;
    private generatePerformanceReport;
    private createIntegrationConfig;
    private createMockMetrics;
    private createStandaloneFacade;
    private performGracefulShutdown;
    private performHotReload;
    private createConfigurationVersion;
    private generateConfigHash;
    private startServiceDiscovery;
    private startResourceTracking;
    private startConfigurationManagement;
    private startEventCoordination;
    private startAdvancedHealthMonitoring;
    private startMetricsCollection;
    private processEventQueue;
    private checkPerformanceAlerts;
    private cleanupMetrics;
    private addToEventQueue;
    private isCircuitBreakerOpen;
    private recordCircuitBreakerFailure;
    private resetCircuitBreaker;
    private getCurrentResourceUsage;
    private getServicesInvolvedInOperation;
    private recordOperationMetrics;
    private calculateOrchestrationEfficiency;
    private calculateResourceOptimization;
    private calculateConfigEffectiveness;
    private calculateEventProcessingRate;
    private generatePerformanceRecommendations;
    private estimateMemoryUsage;
    private estimateStorageUsage;
    private determineHealthStatus;
}
/**
 * Factory function for creating InfrastructureServiceAdapter instances.
 *
 * @param config
 * @example
 */
export declare function createInfrastructureServiceAdapter(config: InfrastructureServiceAdapterConfig): InfrastructureServiceAdapter;
/**
 * Helper function for creating default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createDefaultInfrastructureServiceAdapterConfig(name: string, overrides?: Partial<InfrastructureServiceAdapterConfig>): InfrastructureServiceAdapterConfig;
export default InfrastructureServiceAdapter;
//# sourceMappingURL=infrastructure-service-adapter.d.ts.map