/**
 * Base Service Implementation.
 *
 * Abstract base class that provides common functionality for all service implementations.
 * Follows the same patterns established by the DAL and UACL systems.
 */
/**
 * @file Base service implementation.
 */
import { EventEmitter } from 'node:events';
import type { Logger } from '../../../config/logging-config.ts';
import type { IService, ServiceConfig, ServiceDependencyConfig, ServiceEvent, ServiceEventType, ServiceLifecycleStatus, ServiceMetrics, ServiceOperationOptions, ServiceOperationResponse, ServiceStatus } from '../core/interfaces.ts';
/**
 * Abstract base service class with common functionality.
 *
 * @example
 */
export declare abstract class BaseService extends EventEmitter implements IService {
    readonly name: string;
    readonly type: string;
    config: ServiceConfig;
    protected logger: Logger;
    protected lifecycleStatus: ServiceLifecycleStatus;
    protected startTime: Date | null;
    protected operationCount: number;
    protected successCount: number;
    protected errorCount: number;
    protected latencyMetrics: number[];
    protected dependencies: Map<string, ServiceDependencyConfig>;
    protected capabilities: string[];
    constructor(name: string, type: string, config: ServiceConfig);
    /**
     * Perform service-specific initialization.
     * Must be implemented by concrete service classes.
     */
    protected abstract doInitialize(): Promise<void>;
    /**
     * Perform service-specific startup.
     * Must be implemented by concrete service classes.
     */
    protected abstract doStart(): Promise<void>;
    /**
     * Perform service-specific shutdown.
     * Must be implemented by concrete service classes.
     */
    protected abstract doStop(): Promise<void>;
    /**
     * Perform service-specific cleanup.
     * Must be implemented by concrete service classes.
     */
    protected abstract doDestroy(): Promise<void>;
    /**
     * Perform service-specific health check.
     * Must be implemented by concrete service classes.
     */
    protected abstract doHealthCheck(): Promise<boolean>;
    initialize(config?: Partial<ServiceConfig>): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    destroy(): Promise<void>;
    getStatus(): Promise<ServiceStatus>;
    getMetrics(): Promise<ServiceMetrics>;
    healthCheck(): Promise<boolean>;
    updateConfig(config: Partial<ServiceConfig>): Promise<void>;
    validateConfig(config: ServiceConfig): Promise<boolean>;
    isReady(): boolean;
    getCapabilities(): string[];
    execute<T = any>(operation: string, params?: any, options?: ServiceOperationOptions): Promise<ServiceOperationResponse<T>>;
    addDependency(dependency: ServiceDependencyConfig): Promise<void>;
    removeDependency(serviceName: string): Promise<void>;
    checkDependencies(): Promise<boolean>;
    on(event: ServiceEventType, handler: (event: ServiceEvent) => void): this;
    off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): this;
    emit(event: ServiceEventType, data?: any, error?: Error): boolean;
    /**
     * Execute service-specific operation.
     * Must be implemented by concrete service classes.
     */
    protected abstract executeOperation<T = any>(operation: string, params?: any, options?: ServiceOperationOptions): Promise<T>;
    /**
     * Create a service event.
     *
     * @param type
     * @param data
     * @param error
     */
    protected createEvent(type: ServiceEventType, data?: any, error?: Error): ServiceEvent;
    /**
     * Record latency metric.
     *
     * @param latency
     */
    protected recordLatency(latency: number): void;
    /**
     * Add capability to service.
     *
     * @param capability
     */
    protected addCapability(capability: string): void;
    /**
     * Remove capability from service.
     *
     * @param capability
     */
    protected removeCapability(capability: string): void;
    /**
     * Execute operation with retries.
     *
     * @param operation
     * @param maxRetries
     * @param delay
     */
    protected executeWithRetries<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
}
export default BaseService;
//# sourceMappingURL=base-service.d.ts.map