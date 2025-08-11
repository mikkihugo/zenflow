/**
 * @file base-client adapter implementation
 */
/**
 * Universal Abstraction and Client Layer (UACL) Base Adapter.
 *
 * Provides the foundational interfaces and patterns for all client adapters.
 * Following UACL architecture for consistent client management across the system.
 */
import { EventEmitter } from 'node:events';
/**
 * Base configuration interface that all client configurations extend.
 *
 * @example
 */
export interface ClientConfig {
    /** Unique identifier for this client instance */
    id?: string;
    /** Environment (development, staging, production) */
    environment?: 'development' | 'staging' | 'production';
    /** Timeout configuration in milliseconds */
    timeout?: number;
    /** Retry configuration */
    retries?: {
        max: number;
        backoff: 'linear' | 'exponential';
        baseDelay: number;
    };
    /** Logging configuration */
    logging?: {
        enabled: boolean;
        level: 'debug' | 'info' | 'warn' | 'error';
        prefix?: string;
    };
    /** Metrics collection configuration */
    metrics?: {
        enabled: boolean;
        prefix: string;
        tags?: Record<string, string>;
    };
}
/**
 * Client operation result interface.
 *
 * @example
 */
export interface ClientResult<T = any> {
    /** Unique identifier for this operation */
    operationId: string;
    /** Operation success status */
    success: boolean;
    /** Result data (if successful) */
    data?: T;
    /** Error information (if failed) */
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    /** Operation metadata */
    metadata: {
        /** Duration of the operation in milliseconds */
        duration: number;
        /** Timestamp when operation started */
        timestamp: string;
        /** Whether result came from cache */
        cached?: boolean;
        /** Additional operation-specific metadata */
        [key: string]: any;
    };
}
/**
 * Client health status.
 *
 * @example
 */
export interface ClientHealth {
    /** Overall health status */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Health check timestamp */
    timestamp: string;
    /** Detailed component health */
    components: {
        connectivity: ClientComponentHealth;
        performance: ClientComponentHealth;
        cache?: ClientComponentHealth;
        [key: string]: ClientComponentHealth | undefined;
    };
    /** Health metrics summary */
    metrics: {
        uptime: number;
        errorRate: number;
        averageLatency: number;
        throughput: number;
    };
}
export interface ClientComponentHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    details?: any;
}
/**
 * Client metrics interface.
 *
 * @example
 */
export interface ClientMetrics {
    /** Total operations executed */
    totalOperations: number;
    /** Successful operations count */
    successfulOperations: number;
    /** Failed operations count */
    failedOperations: number;
    /** Cache hit ratio (0-1) */
    cacheHitRatio: number;
    /** Average operation latency in milliseconds */
    averageLatency: number;
    /** Operations per second */
    throughput: number;
    /** Current concurrent operations */
    concurrentOperations: number;
    /** Uptime in milliseconds */
    uptime: number;
    /** Custom metrics */
    custom: Record<string, number>;
}
/**
 * Universal Client Interface (IClient)
 *
 * All client adapters must implement this interface to ensure consistency.
 * and interoperability across the UACL system.
 *
 * @example
 */
export interface IClient extends EventEmitter {
    /** Client configuration */
    readonly config: ClientConfig;
    /** Client type identifier */
    readonly type: string;
    /** Client version */
    readonly version: string;
    /** Initialization status */
    readonly isInitialized: boolean;
    /**
     * Initialize the client.
     */
    initialize(): Promise<void>;
    /**
     * Execute a client operation.
     */
    execute<T = any>(operation: string, params?: any): Promise<ClientResult<T>>;
    /**
     * Check client health.
     */
    healthCheck(): Promise<ClientHealth>;
    /**
     * Get client metrics.
     */
    getMetrics(): Promise<ClientMetrics>;
    /**
     * Shutdown the client gracefully.
     */
    shutdown(): Promise<void>;
}
/**
 * Client Factory Interface.
 *
 * Defines the contract for creating client instances with proper configuration.
 * and lifecycle management.
 *
 * @example
 */
export interface IClientFactory<TConfig extends ClientConfig = ClientConfig> {
    /** Factory type identifier */
    readonly type: string;
    /**
     * Create a new client instance.
     */
    createClient(config: TConfig): Promise<IClient>;
    /**
     * Get or create a cached client instance.
     */
    getClient(id: string, config: TConfig): Promise<IClient>;
    /**
     * Validate client configuration.
     */
    validateConfig(config: TConfig): boolean;
    /**
     * Get all active client instances.
     */
    getActiveClients(): IClient[];
    /**
     * Shutdown all clients managed by this factory.
     */
    shutdownAll(): Promise<void>;
}
/**
 * Base Client Adapter.
 *
 * Abstract base class that provides common functionality for all client adapters.
 * Implements the IClient interface with shared behavior.
 *
 * @example
 */
export declare abstract class BaseClientAdapter extends EventEmitter implements IClient {
    readonly config: ClientConfig;
    readonly type: string;
    readonly version: string;
    protected _isInitialized: boolean;
    protected _metrics: ClientMetrics;
    protected _startTime: number;
    protected _operationCounter: number;
    constructor(config: ClientConfig, type: string, version?: string);
    get isInitialized(): boolean;
    /**
     * Initialize the client (abstract - must be implemented by subclasses)
     */
    abstract initialize(): Promise<void>;
    /**
     * Execute a client operation (abstract - must be implemented by subclasses)
     */
    abstract execute<T = any>(operation: string, params?: any): Promise<ClientResult<T>>;
    /**
     * Check client health.
     */
    healthCheck(): Promise<ClientHealth>;
    /**
     * Get client metrics.
     */
    getMetrics(): Promise<ClientMetrics>;
    /**
     * Shutdown the client.
     */
    shutdown(): Promise<void>;
    /**
     * Create a standardized client result.
     *
     * @param operationId
     * @param success
     * @param data
     * @param error
     * @param error.code
     * @param error.message
     * @param error.details
     * @param metadata
     */
    protected createResult<T>(operationId: string, success: boolean, data?: T, error?: {
        code: string;
        message: string;
        details?: any;
    }, metadata?: Record<string, any>): ClientResult<T>;
    /**
     * Update metrics after an operation.
     *
     * @param success
     * @param duration
     * @param cached
     */
    protected updateMetrics(success: boolean, duration: number, cached?: boolean): void;
    /**
     * Generate a unique operation ID.
     */
    protected generateOperationId(): string;
    /**
     * Log an operation (if logging is enabled)
     *
     * @param level
     * @param message
     * @param meta
     * @param _message
     * @param _meta.
     */
    protected log(level: 'debug' | 'info' | 'warn' | 'error', _message: string, _meta?: any): void;
    /**
     * Check if log level should be output.
     *
     * @param level
     */
    private shouldLog;
    /**
     * Initialize default metrics.
     */
    private initializeMetrics;
}
/**
 * Base Client Factory.
 *
 * Abstract base class for client factories that provides common functionality.
 * and lifecycle management.
 *
 * @example
 */
export declare abstract class BaseClientFactory<TConfig extends ClientConfig = ClientConfig> implements IClientFactory<TConfig> {
    readonly type: string;
    protected clients: Map<string, IClient>;
    constructor(type: string);
    /**
     * Create a new client instance (abstract - must be implemented by subclasses)
     */
    abstract createClient(config: TConfig): Promise<IClient>;
    /**
     * Get or create a cached client instance.
     *
     * @param id
     * @param config
     */
    getClient(id: string, config: TConfig): Promise<IClient>;
    /**
     * Validate client configuration (default implementation)
     *
     * @param config.
     */
    validateConfig(config: TConfig): boolean;
    /**
     * Get all active client instances.
     */
    getActiveClients(): IClient[];
    /**
     * Shutdown all clients managed by this factory.
     */
    shutdownAll(): Promise<void>;
}
//# sourceMappingURL=base-client-adapter.d.ts.map