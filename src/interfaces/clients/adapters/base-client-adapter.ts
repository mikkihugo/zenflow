/**
 * @fileoverview Provides foundational interfaces and abstract classes for client adapters
 *               within the Universal Abstraction and Client Layer (UACL).
 *               Ensures consistent client management and interoperability across the system.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
import type { 
  ClientConfig, 
  ClientMetrics, 
  IClient, 
  IClientFactory 
} from '../core/interfaces.ts';

const logger = getLogger('interfaces-clients-adapters-base-client-adapter');

/**
 * Universal Abstraction and Client Layer (UACL) Base Adapter.
 *
 * Provides the foundational interfaces and patterns for all client adapters.
 * Following UACL architecture for consistent client management across the system.
 */

// ClientConfig is now imported from '../core/interfaces.ts'

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
 * ```typescript
 * const successResult: ClientResult<string> = {
 *   operationId: 'op-123',
 *   success: true,
 *   data: 'Operation successful',
 *   metadata: { duration: 150, timestamp: new Date().toISOString() }
 * };
 *
 * const errorResult: ClientResult = {
 *   operationId: 'op-456',
 *   success: false,
 *   error: { code: 'AUTH_ERROR', message: 'Authentication failed' },
 *   metadata: { duration: 50, timestamp: new Date().toISOString() }
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
  details?: unknown;
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
 * Represents the overall health status of a client.
 *
 * @interface ClientHealth
 * @property {'healthy' | 'degraded' | 'unhealthy'} status - Overall health status.
 * @property {string} timestamp - Health check timestamp in ISO 8601 format.
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
 * ```typescript
 * const health: ClientHealth = {
 *   status: 'healthy',
 *   timestamp: new Date().toISOString(),
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
 * Represents the health status of a specific component within a client.
 */
export interface ClientComponentHealth {
  /** The overall status of the component. */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** An optional message providing more details about the component's status. */
  message?: string;
  /** Optional additional details about the component's health. */
  details?: unknown;
}

// ClientMetrics is now imported from '../core/interfaces.ts'

/**
 * Adapter-specific client interface that bridges between core IClient and implementation needs.
 * Extends the core IClient pattern with operation execution and adapter-specific methods.
 */
export interface IClientAdapter extends EventEmitter {
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
 * Adapter-specific factory interface for creating and managing client adapters.
 */
export interface IClientAdapterFactory<TConfig extends ClientConfig = ClientConfig> {
  readonly type: string;
  createClient(config: TConfig): Promise<IClientAdapter>;
  getClient(id: string, config: TConfig): Promise<IClientAdapter>;
  validateConfig(config: TConfig): boolean;
  getActiveClients(): IClientAdapter[];
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
export abstract class BaseClientAdapter extends EventEmitter implements IClientAdapter {
  protected _isInitialized = false;
  protected _metrics: ClientMetrics;
  protected _startTime: number;
  protected _operationCounter: number = 0;

  constructor(
    public readonly config: ClientConfig,
    public readonly type: string,
    public readonly version: string = '1.0.0'
  ) {
    super();
    this['_startTime'] = Date.now();
    this['_metrics'] = this.initializeMetrics();
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
  abstract execute<T = any>(operation: string, params?: any): Promise<ClientResult<T>>;

  /**
   * Check client health.
   */
  async healthCheck(): Promise<ClientHealth> {
    return {
      status: this['_isInitialized'] ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        connectivity: {
          status: this['_isInitialized'] ? 'healthy' : 'unhealthy',
          message: this['_isInitialized'] ? 'Client initialized' : 'Client not initialized',
        },
        performance: {
          status: this['_metrics']?.averageLatency < 5000 ? 'healthy' : 'degraded',
          message: `Average latency: ${this['_metrics']?.averageLatency}ms`,
        },
      },
      metrics: {
        uptime: Date.now() - this['_startTime'],
        errorRate:
          this['_metrics']?.totalOperations > 0
            ? this['_metrics']?.failedOperations / this['_metrics']?.totalOperations
            : 0,
        averageLatency: this['_metrics']?.averageLatency,
        throughput: this['_metrics']?.throughput,
      },
    };
  }

  /**
   * Get client metrics.
   */
  async getMetrics(): Promise<ClientMetrics> {
    this["_metrics"]?.uptime = Date.now() - this['_startTime'];
    return { ...this['_metrics'] };
  }

  /**
   * Shutdown the client.
   */
  async shutdown(): Promise<void> {
    this['_isInitialized'] = false;
    this.emit('shutdown');
  }

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
        duration: Date.now() - this['_startTime'],
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Update metrics after an operation.
   *
   * @param success
   * @param duration
   * @param cached
   */
  protected updateMetrics(success: boolean, duration: number, cached = false): void {
    this["_metrics"]?.totalOperations++;

    if (success) {
      this["_metrics"]?.successfulOperations++;
    } else {
      this["_metrics"]?.failedOperations++;
    }

    if (cached) {
      // Update cache hit ratio
      const totalCacheOps = this['_metrics']?.custom?.cacheOps || 0;
      const cacheHits = this['_metrics']?.custom?.cacheHits || 0;
      this["_metrics"]?.custom?.cacheOps = totalCacheOps + 1;
      if (cached) {
        this["_metrics"]?.custom?.cacheHits = cacheHits + 1;
      }
      this["_metrics"]?.cacheHitRatio =
        this['_metrics']?.custom?.cacheHits / this['_metrics']?.custom?.cacheOps;
    }

    // Update average latency
    const totalLatency = this['_metrics']?.averageLatency * (this['_metrics']?.totalOperations - 1);
    this["_metrics"]?.averageLatency =
      (totalLatency + duration) / this['_metrics']?.totalOperations;

    // Calculate throughput (operations per second over last minute)
    const uptimeSeconds = (Date.now() - this['_startTime']) / 1000;
    this["_metrics"]?.throughput = this['_metrics']?.totalOperations / Math.max(uptimeSeconds, 1);
  }

  /**
   * Generate a unique operation ID.
   */
  protected generateOperationId(): string {
    return `${this.type}_${++this['_operationCounter']}_${Date.now()}`;
  }

  /**
   * Log an operation (if logging is enabled)
   *
   * @param level
   * @param message
   * @param meta
   * @param _message
   * @param _meta.
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', _message: string, _meta?: unknown): void {
    if (this.config.logging?.enabled) {
      const _prefix = this.config.logging.prefix || this.type;
      const shouldLog = this.shouldLog(level);

      if (shouldLog) {
      }
    }
  }

  /**
   * Check if log level should be output.
   *
   * @param level
   */
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const configLevel = this.config.logging?.level || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(configLevel);
  }

  /**
   * Initialize default metrics.
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
 * Base Client Factory.
 *
 * Abstract base class for client factories that provides common functionality.
 * and lifecycle management.
 *
 * @example
 */
export abstract class BaseClientFactory<TConfig extends ClientConfig = ClientConfig>
  implements IClientAdapterFactory<TConfig>
{
  protected clients = new Map<string, IClientAdapter>();

  constructor(public readonly type: string) {}

  /**
   * Create a new client instance (abstract - must be implemented by subclasses)
   */
  abstract createClient(config: TConfig): Promise<IClientAdapter>;

  /**
   * Get or create a cached client instance.
   *
   * @param id
   * @param config
   */
  async getClient(id: string, config: TConfig): Promise<IClientAdapter> {
    if (this.clients.has(id)) {
      return this.clients.get(id)!;
    }

    const client = await this.createClient(config);
    this.clients.set(id, client);

    // Clean up when client shuts down
    client.once('shutdown', () => {
      this.clients.delete(id);
    });

    return client;
  }

  /**
   * Validate client configuration (default implementation)
   *
   * @param config.
   */
  validateConfig(config: TConfig): boolean {
    return Boolean(config && typeof config === 'object');
  }

  /**
   * Get all active client instances.
   */
  getActiveClients(): IClientAdapter[] {
    return Array.from(this.clients.values());
  }

  /**
   * Shutdown all clients managed by this factory.
   */
  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.clients.values()).map((client) =>
      client.shutdown().catch((error) => {
        logger.error(`Error shutting down client:`, error);
      })
    );

    await Promise.all(shutdownPromises);
    this.clients.clear();
  }
}
