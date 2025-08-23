/**
 * @fileoverview Provides foundational interfaces and abstract classes for client adapters
 * within the Universal Abstraction and Client Layer (UACL).
 * Ensures consistent client management and interoperability across the system.
 */

import {
  TypedEventBase,
  Logger
} from '@claude-zen/foundation';

import type {
  ClientConfig,
  ClientMetrics
} from '../core/interfaces';

const logger = new Logger('interfaces-clients-adapters-base-client-adapter)';

/**
 * Universal Abstraction and Client Layer (UACL' Base Adapter.
 *
 * Provides the foundational interfaces and patterns for all client adapters.
 * Following UACL architecture for consistent client management across the system.
 */

/**
 * Represents the result of a client operation.
 *
 * @interface ClientResult
 * @template T The type of the data returned by the operation.
 * @property {string} operationId - Unique identifier for this operation.
 * @property {boolean} success - Operation success status.
 * @property {T} [data] - Result data (if successful).
 * @property {object} [error] - Error information (if failed).
 * @property {string} [error.code] - Error code.
 * @property {string} [error.message] - Error message.
 * @property {any} [error.details] - Optional additional error details.
 * @property {object} metadata - Operation metadata.
 * @property {number} metadata.duration - Duration of the operation in milliseconds.
 * @property {string} metadata.timestamp - Timestamp when operation started.
 * @property {boolean} [metadata.cached] - Whether result came from cache.
 * @property {any} [metadata.additional] - Additional operation-specific metadata.
 * @example
 * ``'typescript
 * const successResult: ClientResult<string> = {
 *   operationId: 'op-123',
 *   success: true,
 *   data: 'Operation'successful',
 *   metadata: {
  duration: 150,
  timestamp: new Date().toISOString()
}
 * };
 *
 * const errorResut: ClientResult = {
 *   operationId: 'op-456',
 *   success: false,
 *   error: {
  code: 'AUTH_ERROR',
  message: 'Authentication'failed'
},
 *   metaata: {
  duration: 50,
  timestamp: new Date().toISOString()
}
 * };
 * ``'
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
    details?: any

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
    [key: string]: any

}
}

/**
 * Represents the overall health status of a client.
 *
 * @interface ClientHealth
 * @property {'healthy' | 'degraded' | 'unhealthy'} status - Overall health status.
 * @propert' {string} timestamp - Health check timestamp in ISO 8601 format.
 * @property {object} components - Detailed health status of individual client components.
 * @property {ClientComponentHealth} components.connectivity - Health of client connectivity.
 * @property {ClientComponentHealth} components.performance - Health of client performance.
 * @property {ClientComponentHealth} [components.cache] - Optional health of client cache.
 * @property {object} metrics - Summary of health-related metrics.
 * @property {number} metrics.uptime - Client uptime in milliseconds.
 * @property {number} metrics.errorRate - Error rate (e.g., failed operations / total operations).
 * @property {number} metrics.averageLatency - Average operation latency in milliseconds.
 * @property {number} metrics.throughput - Operations per second.
 * @example
 * ``'typescript
 * const health: ClientHealth = {
 *   status: 'healthy',
 *   timestamp: new Date().toISOString(),
 *   components: {
 *     connectivit: { status: 'healthy' },
 *     performance: { status: 'healthy' }
 *   },
 *   metrics: {
  uptime: 120000,
  errorRate: 0.01,
  averageLatenc: 50,
  throughput: 100
}
 * };
 * ``'
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
  [key: string]: ClientComponentHealth | undefined

};
  /** Health metrics summary */
  metrics: {
  uptime: number;
    errorRate: number;
    averageLatency: number;
    throughput: number

}
}

/**
 * Represents the health status of a specific component within a client.
 */
export interface ClientComponentHealth {
  /** The overall status of the component. */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** An optional message providing more details about the component's status. */
  message?: string;
  /** Optional additional details about the component's heal'h. */
  details?: any

}

/**
 * Adapter-specific client interface that bridges between core Client and implementation needs.
 * Extends the core Client pattern with operation execution and adapter-specific methods.
 */
export interface ClientAdapter extends TypedEventBase {
  readonly config: ClientConfig;
  readonly type: string;
  readonly version: string;
  readonly isInitialized: boolean;
  initialize(): Promise<void>;
  execute<T = any>(operation: string,
  params?: any): Promise<ClientResult<T>>;
  healthCheck(): Promise<ClientHealth>;
  getMetrics(): Promise<ClientMetrics>;
  shutdown(): Promise<void>

}

/**
 * Adapter-specific factory interface for creating and managing client adapters.
 */
export interface ClientAdapterFactory<
  TConfig extends ClientConfig = ClientConfig
> {
  readonly type: string;
  createClient(config: TConfig): Promise<ClientAdapter>;
  getClient(id: string,
  config: TConfig): Promise<ClientAdapter>;
  validateConfig(config: TConfig): boolean;
  getActiveClients(): ClientAdapter[];
  shutdownAll(): Promise<void>

}

/**
 * Base Client Adapter.
 *
 * Abstract base class that provides common functionality for all client adapters.
 * Implements the Client interface with shared behavior.
 *
 * @example
 * ``'typescript
 * class MyClientAdapter extends BaseClientAdapter {
 *   async initialize(): Promise<void>  {
  *     // Implementation-specific initialization
 *     this._isInitialized = true;
 *
}
 *
 *   async execute<T>(operation: string, params?: any): Promise<ClientResult<T>> {
 *     const operationId = this.generateOperationId();
 *     const startTime = Date.now();
 *     try {
  *       // Implementation-specific operation execution
 *       const result = await this.performOperation(operation,
  params);
 *       this.updateMetrics(true,
  Date.now() - startTime);
 *       return this.createResult(
  operationId,
  true,
  result
);
 *
} catch (error) {
 *       this.updateMetrics(false, Date.now() - startTime);
 *       return this.createResult(
  operationId,
  false,
  undefined, {
  *         code: 'OPERATION_FAILED',
  *         message: error.message
 *
}
);
 *     }
 *   }
 * }
 * ``'
 */
export abstract class BaseClientAdapter
  extends TypedEventBase
  implements ClientAdapter
{
  protected _isInitialized = false;
  protected _metrics: ClientMetrics;
  protected _startTime: number;
  protected _operationCounter: number = 0;

  constructor(public readonly config: ClientConfig,
  public readonly type: string,
  public readonly version: string = '1.0
) {
  super();
    this._startTime = Date.now();
    this._metrics = this.initializeMetrics()

}

  get isInitialized(): boolean  {
    return this._isInitialized
}

  /**
   * Initialize the client (abstract - must be implemented by subclasses)
   */
  abstract initialize(): Promise<void>;

  /**
   * Execute a client operation (abstract - must be implemented by subclasses)
   */
  abstract execute<T = any>(
    operation: string,
    params?: any
  ): Promise<ClientResult<T>>;

  /**
   * Check client health.
   */
  async healthCheck(): Promise<ClientHealth>  {
    return {
      status: this._isInitialized ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        connectivit: {
  status: this._isInitialized ? 'healthy' : 'unhealthy',
  message: this._isInitialized
            ? 'Client'initialized'
            : 'Client'not initialized'

},
        performance: {
          status: this._metrics.averageLatency < 5000 ? 'healthy' : 'degraded',
          message: 'Averagelatency: ' + this._metrics.averageLatency + 'ms;
}
},
      metric: {
  uptime: Date.now() - this._startTime,
  errorRate:
          this._metrics.totalOperations > 0
            ? this._metrics.failedOperations / this._metrics.totalOperations
            : 0,
  averageLatency: this._metrics.averageLatency,
  throughput: this._metrics.throughput

}
}
}

  /**
   * Get client metrics.
   */
  async getMetrics(): Promise<ClientMetrics>  {
    if (this._metrics) {
  this._metrics.uptime = Date.now() - this._startTime

}
    return { ...this._metrics }
}

  /**
   * Shutdown the client.
   */
  async shutdown(): Promise<void>  {
    this._isInitialized = false;
    this.emit(`shutdown', { timestamp: 'ew Date() })'
}

  /**
   * Create a standardized client result.
   *
   * @param operationId - Unique operation identifier
   * @param success - Operation success status
   * @param data - Result data
   * @param error - Error information
   * @param error.code - Error code
   * @param error.message - Error message
   * @param error.details - Error details
   * @param metadata - Additional metadata
   */
  protected createResult<T>(
    operationId: string,
    success: boolean,
    data?: T,
    error?: { code: string; message: string; details?: any },
    metadata: Record<string, unknown> = {}
  ': ClientResult<T> {
    return {
      operationId,
      success,
      data,
      error,
      metadata: {
  duration: Date.now() - this._startTime,
  timestamp: new Date().toISOString(),
  ...metadata

}
}
}

  /**
   * Update metrics after an operation.
   *
   * @param success - Operation success status
   * @param duration - Operation duration
   * @param cached - Whether result was cached
   */
  protected updateMetrics(
  success: boolean,
  duration: number,
  cached = false
): void  {
    if (this._metrics) {
      this._metrics.totalOperations++
}

    if (success && this._metrics) {
      this._metrics.successfulOperations++
} else if (this._metrics) {
      this._metrics.failedOperations++
}

    if (cached && this._metrics) {
      // Update cache hit ratio
      const totalCacheOps = this._metrics.custom?.cacheOps || 0;
      const cacheHits = this._metrics.custom?.cacheHits || 0;

      if (!this._metrics.custom) {
        this._metrics.custom = {}
}

      this._metrics.custom.cacheOps = totalCacheOps + 1;
      if (cached) {
        this._metrics.custom.cacheHits = cacheHits + 1
}

      this._metrics.cacheHitRatio =
        (this._metrics.custom.cacheHits || 0) /
        (this._metrics.custom.cacheOps || 1)
}

    // Update average latency
    if (this._metrics) {
  const totalLatency =
        this._metrics.averageLatency * (this._metrics.totalOperations - 1);
      this._metrics.averageLatency =
        (totalLatency + duration) / this._metrics.totalOperations;

      // Calculate throughput (operations per second over last minute)
      const uptimeSeconds = (Date.now() - this._startTime) / 1000;
      this._metrics.throughput =
        this._metrics.totalOperations / Math.max(uptimeSeconds,
  1)

}
  }

  /**
   * Generate a unique operation ID.
   */
  protected generateOperationId(): string  {
    return '' + this.type + '_${++this._operationCounter}_${Date.now()}';
}

  /**
   * Log an operation (if logging is enabled)
   *
   * @param level - Log level
   * @param message - Log message
   * @param meta - Additional metadata
   */
  protected log(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: st'ing,
  meta?: any
): void  {
    if (this.config.logging?.enabled) {
      const prefix = this.config.logging.prefix || this.type;
      const shouldLog = this.shouldLog(level);
      if (shouldLog) {
        logger.log(
  level,
  '[' + prefix + ']'${message}',
  meta
)'
}
    }
  }

  /**
   * Check if log level should be output.
   *
   * @param level - Log level to check
   */
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error): boolean  {
  const configLevel = this.config.logging?.level || 'info';
    const levels = ['debug',
  'info',
  'warn',
  'error]';
    return levels.indexOf(level) >= levels.indexOf(configLevel)

}

  /**
   * Initialize default metrics.
   */
  private initializeMetrics(): ClientMetrics  {
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      cacheHitRatio: 0,
      averageLatency: 0,
      throughput: 0,
      concurrentOperations: 0,
      uptime: 0,
      custom: {}
}
}
}

/**
 * Base Client Factory.
 *
 * Abstract base class for client factories that provides common functionality
 * and lifecycle management.
 *
 * @example
 * '`'typescript
 * class MyClientFactory extends BaseClientFactory<MyClientConfig> {
 *   async createClient(config: MyClientConfig): Promise<ClientAdapter>  {
  *     const client = new MyClientAdapter(config,
  this.type);
 *     await client.initialize();
 *     return client;
 *
}
 *
 *   validateConfig(config: MyClientConfig): boolean  {
  *     return super.validateConfig(config) && !!config.specificProperty;
 *
}
 * }
 * '`'
 */
export abstract class BaseClientFactory<
  TConfig extends ClientConfig = ClientConfig
> implements ClientAdapterFactory<TConfig>
{
  protected clients = new Map<string, ClientAdapter>();

  constructor(public readonly type: string) {}

  /**
   * Create a new client instance (abstract - must be implemented by subclasses)
   */
  abstract createClient(config: TConfig): Promise<ClientAdapter>;

  /**
   * Get or create a cached client instance.
   *
   * @param id - Client identifier
   * @param config - Client configuration
   */
  async getClient(id: string, config: TConfig): Promise<ClientAdapter>  {
    if (this.clients.has(id)) {
      return this.clients.get(id)!
}

    const client = await this.createClient(config);
    this.clients.set(id, client);

    // Clean up when client shuts down
    client.once('shutdown', () => {
      this.cliets.delete(id)
});

    return client
}

  /**
   * Validate client configuration (default implementation)
   *
   * @param config - Configuration to validate
   */
  validateConfig(config: TConfig): boolean  {
  return Boolean(config && typeof config === 'object)'

}

  /**
   * Get all active client instances.
   */
  getActiveClients(': ClientAdapter[] {
    return Array.from(this.clients.values())
}

  /**
   * Shutdown all clients managed by this factory.
   */
  async shutdownAll(): Promise<void>  {
    const shutdownPromises = Array.from(this.clients.values()).map((client) =>
      client.shutdown().catch((error) => {
  logger.error('Error shutting down client:,
  error);
})
    );

    await Promise.all(shutdownPromises);
    this.clients.clear()
}
}