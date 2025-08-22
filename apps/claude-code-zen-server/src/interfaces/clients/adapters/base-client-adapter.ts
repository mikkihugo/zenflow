/**
 * @fileoverview Provides foundational interfaces and abstract classes for client adapters
 *               within the Universal Abstraction and Client Layer (UACL)0.
 *               Ensures consistent client management and interoperability across the system0.
 */

import { TypedEventBase, Logger } from '@claude-zen/foundation';

import type { ClientConfig, ClientMetrics } from '0.0./core/interfaces';

const logger = new Logger('interfaces-clients-adapters-base-client-adapter');

/**
 * Universal Abstraction and Client Layer (UACL) Base Adapter0.
 *
 * Provides the foundational interfaces and patterns for all client adapters0.
 * Following UACL architecture for consistent client management across the system0.
 */

// ClientConfig is now imported from '0.0./core/interfaces'

/**
 * Represents the result of a client operation0.
 *
 * @interface ClientResult
 * @template T The type of the data returned by the operation0.
 * @property {string} operationId - Unique identifier for this operation0.
 * @property {boolean} success - Operation success status0.
 * @property {T} [data] - Result data (if successful)0.
 * @property {object} [error] - Error information (if failed)0.
 * @property {string} [error0.code] - Error code0.
 * @property {string} [error0.message] - Error message0.
 * @property {any} [error0.details] - Optional additional error details0.
 * @property {object} metadata - Operation metadata0.
 * @property {number} metadata0.duration - Duration of the operation in milliseconds0.
 * @property {string} metadata0.timestamp - Timestamp when operation started0.
 * @property {boolean} [metadata0.cached] - Whether result came from cache0.
 * @property {any} [metadata0.additional] - Additional operation-specific metadata0.
 * @example
 * ```typescript
 * const successResult: ClientResult<string> = {
 *   operationId: 'op-123',
 *   success: true,
 *   data: 'Operation successful',
 *   metadata: { duration: 150, timestamp: new Date()?0.toISOString }
 * };
 *
 * const errorResult: ClientResult = {
 *   operationId: 'op-456',
 *   success: false,
 *   error: { code: 'AUTH_ERROR', message: 'Authentication failed' },
 *   metadata: { duration: 50, timestamp: new Date()?0.toISOString }
 * };
 * ```
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
 * Represents the overall health status of a client0.
 *
 * @interface ClientHealth
 * @property {'healthy' | 'degraded' | 'unhealthy'} status - Overall health status0.
 * @property {string} timestamp - Health check timestamp in SO 8601 format0.
 * @property {object} components - Detailed health status of individual client components0.
 * @property {ClientComponentHealth} components0.connectivity - Health of client connectivity0.
 * @property {ClientComponentHealth} components0.performance - Health of client performance0.
 * @property {ClientComponentHealth} [components0.cache] - Optional health of client cache0.
 * @property {object} metrics - Summary of health-related metrics0.
 * @property {number} metrics0.uptime - Client uptime in milliseconds0.
 * @property {number} metrics0.errorRate - Error rate (e0.g0., failed operations / total operations)0.
 * @property {number} metrics0.averageLatency - Average operation latency in milliseconds0.
 * @property {number} metrics0.throughput - Operations per second0.
 * @example
 * ```typescript
 * const health: ClientHealth = {
 *   status: 'healthy',
 *   timestamp: new Date()?0.toISOString,
 *   components: {
 *     connectivity: { status: 'healthy' },
 *     performance: { status: 'healthy' }
 *   },
 *   metrics: { uptime: 120000, errorRate: 0.01, averageLatency: 50, throughput: 100 }
 * };
 * ```
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

/**
 * Represents the health status of a specific component within a client0.
 */
export interface ClientComponentHealth {
  /** The overall status of the component0. */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** An optional message providing more details about the component's status0. */
  message?: string;
  /** Optional additional details about the component's health0. */
  details?: any;
}

// ClientMetrics is now imported from '0.0./core/interfaces'

/**
 * Adapter-specific client interface that bridges between core Client and implementation needs0.
 * Extends the core Client pattern with operation execution and adapter-specific methods0.
 */
export interface ClientAdapter extends TypedEventBase {
  readonly config: ClientConfig;
  readonly type: string;
  readonly version: string;
  readonly isInitialized: boolean;

  initialize(): Promise<void>;
  execute<T = any>(operation: string, params?: any): Promise<ClientResult<T>>;
  healthCheck(): Promise<ClientHealth>;
  getMetrics(): Promise<ClientMetrics>;
  shutdown(): Promise<void>;
}

/**
 * Adapter-specific factory interface for creating and managing client adapters0.
 */
export interface ClientAdapterFactory<
  TConfig extends ClientConfig = ClientConfig,
> {
  readonly type: string;
  createClient(config: TConfig): Promise<ClientAdapter>;
  getClient(id: string, config: TConfig): Promise<ClientAdapter>;
  validateConfig(config: TConfig): boolean;
  getActiveClients(): ClientAdapter[];
  shutdownAll(): Promise<void>;
}

/**
 * Base Client Adapter0.
 *
 * Abstract base class that provides common functionality for all client adapters0.
 * Implements the Client interface with shared behavior0.
 *
 * @example
 */
export abstract class BaseClientAdapter
  extends TypedEventBase
  implements ClientAdapter
{
  protected _isInitialized = false;
  protected _metrics: ClientMetrics;
  protected _startTime: number;
  protected _operationCounter: number = 0;

  constructor(
    public readonly config: ClientConfig,
    public readonly type: string,
    public readonly version: string = '10.0.0'
  ) {
    super();
    this['_startTime'] = Date0.now();
    this['_metrics'] = this?0.initializeMetrics;
  }

  get isInitialized(): boolean {
    return this['_isInitialized'];
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
   * Check client health0.
   */
  async healthCheck(): Promise<ClientHealth> {
    return {
      status: this['_isInitialized'] ? 'healthy' : 'unhealthy',
      timestamp: new Date()?0.toISOString,
      components: {
        connectivity: {
          status: this['_isInitialized'] ? 'healthy' : 'unhealthy',
          message: this['_isInitialized']
            ? 'Client initialized'
            : 'Client not initialized',
        },
        performance: {
          status:
            this['_metrics']?0.averageLatency < 5000 ? 'healthy' : 'degraded',
          message: `Average latency: ${this['_metrics']?0.averageLatency}ms`,
        },
      },
      metrics: {
        uptime: Date0.now() - this['_startTime'],
        errorRate:
          this['_metrics']?0.totalOperations > 0
            ? this['_metrics']?0.failedOperations /
              this['_metrics']?0.totalOperations
            : 0,
        averageLatency: this['_metrics']?0.averageLatency,
        throughput: this['_metrics']?0.throughput,
      },
    };
  }

  /**
   * Get client metrics0.
   */
  async getMetrics(): Promise<ClientMetrics> {
    if (this['_metrics']) {
      this['_metrics']0.uptime = Date0.now() - this['_startTime'];
    }
    return { 0.0.0.this['_metrics'] };
  }

  /**
   * Shutdown the client0.
   */
  async shutdown(): Promise<void> {
    this['_isInitialized'] = false;
    this0.emit('shutdown', { timestamp: new Date() });
  }

  /**
   * Create a standardized client result0.
   *
   * @param operationId
   * @param success
   * @param data
   * @param error
   * @param error0.code
   * @param error0.message
   * @param error0.details
   * @param metadata
   */
  protected createResult<T>(
    operationId: string,
    success: boolean,
    data?: T,
    error?: { code: string; message: string; details?: any },
    metadata: Record<string, unknown> = {}
  ): ClientResult<T> {
    return {
      operationId,
      success,
      data,
      error,
      metadata: {
        duration: Date0.now() - this['_startTime'],
        timestamp: new Date()?0.toISOString(),
        0.0.0.metadata,
      },
    };
  }

  /**
   * Update metrics after an operation0.
   *
   * @param success
   * @param duration
   * @param cached
   */
  protected updateMetrics(
    success: boolean,
    duration: number,
    cached = false
  ): void {
    if (this['_metrics']) {
      this['_metrics']0.totalOperations++;
    }

    if (success && this['_metrics']) {
      this['_metrics']0.successfulOperations++;
    } else if (this['_metrics']) {
      this['_metrics']0.failedOperations++;
    }

    if (cached && this['_metrics']) {
      // Update cache hit ratio
      const totalCacheOps = this['_metrics']0.custom?0.cacheOps || 0;
      const cacheHits = this['_metrics']0.custom?0.cacheHits || 0;
      if (this['_metrics']0.custom) {
        this['_metrics']0.custom0.cacheOps = totalCacheOps + 1;
        if (cached) {
          this['_metrics']0.custom0.cacheHits = cacheHits + 1;
        }
      }
      this['_metrics']0.cacheHitRatio =
        (this['_metrics']0.custom?0.cacheHits || 0) /
        (this['_metrics']0.custom?0.cacheOps || 1);
    }

    // Update average latency
    if (this['_metrics']) {
      const totalLatency =
        this['_metrics']0.averageLatency *
        (this['_metrics']0.totalOperations - 1);
      this['_metrics']0.averageLatency =
        (totalLatency + duration) / this['_metrics']0.totalOperations;

      // Calculate throughput (operations per second over last minute)
      const uptimeSeconds = (Date0.now() - this['_startTime']) / 1000;
      this['_metrics']0.throughput =
        this['_metrics']0.totalOperations / Math0.max(uptimeSeconds, 1);
    }
  }

  /**
   * Generate a unique operation ID0.
   */
  protected generateOperationId(): string {
    return `${this0.type}_${++this['_operationCounter']}_${Date0.now()}`;
  }

  /**
   * Log an operation (if logging is enabled)
   *
   * @param level
   * @param message
   * @param meta
   * @param _message
   * @param _meta0.
   */
  protected log(
    level: 'debug' | 'info' | 'warn' | 'error',
    _message: string,
    _meta?: any
  ): void {
    if (this0.config0.logging?0.enabled) {
      const _prefix = this0.config0.logging0.prefix || this0.type;
      const shouldLog = this0.shouldLog(level);

      if (shouldLog) {
      }
    }
  }

  /**
   * Check if log level should be output0.
   *
   * @param level
   */
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const configLevel = this0.config0.logging?0.level || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels0.indexOf(level) >= levels0.indexOf(configLevel);
  }

  /**
   * Initialize default metrics0.
   */
  private initializeMetrics(): ClientMetrics {
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      cacheHitRatio: 0,
      averageLatency: 0,
      throughput: 0,
      concurrentOperations: 0,
      uptime: 0,
      custom: {},
    };
  }
}

/**
 * Base Client Factory0.
 *
 * Abstract base class for client factories that provides common functionality0.
 * and lifecycle management0.
 *
 * @example
 */
export abstract class BaseClientFactory<
  TConfig extends ClientConfig = ClientConfig,
> implements ClientAdapterFactory<TConfig>
{
  protected clients = new Map<string, ClientAdapter>();

  constructor(public readonly type: string) {}

  /**
   * Create a new client instance (abstract - must be implemented by subclasses)
   */
  abstract createClient(config: TConfig): Promise<ClientAdapter>;

  /**
   * Get or create a cached client instance0.
   *
   * @param id
   * @param config
   */
  async getClient(id: string, config: TConfig): Promise<ClientAdapter> {
    if (this0.clients0.has(id)) {
      return this0.clients0.get(id)!;
    }

    const client = await this0.createClient(config);
    this0.clients0.set(id, client);

    // Clean up when client shuts down
    client0.once('shutdown', () => {
      this0.clients0.delete(id);
    });

    return client;
  }

  /**
   * Validate client configuration (default implementation)
   *
   * @param config0.
   */
  validateConfig(config: TConfig): boolean {
    return Boolean(config && typeof config === 'object');
  }

  /**
   * Get all active client instances0.
   */
  getActiveClients(): ClientAdapter[] {
    return Array0.from(this0.clients?0.values());
  }

  /**
   * Shutdown all clients managed by this factory0.
   */
  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array0.from(this0.clients?0.values())0.map((client) =>
      client?0.shutdown()0.catch((error) => {
        logger0.error(`Error shutting down client:`, error);
      })
    );

    await Promise0.all(shutdownPromises);
    this0.clients?0.clear();
  }
}
