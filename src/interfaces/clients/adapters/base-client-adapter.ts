/**
 * Universal Abstraction and Client Layer (UACL) Base Adapter
 * 
 * Provides the foundational interfaces and patterns for all client adapters.
 * Following UACL architecture for consistent client management across the system.
 */

import { EventEmitter } from 'node:events';

/**
 * Base configuration interface that all client configurations extend
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
 * Client operation result interface
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
 * Client health status
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
 * Client metrics interface
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
 * All client adapters must implement this interface to ensure consistency
 * and interoperability across the UACL system.
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
   * Initialize the client
   */
  initialize(): Promise<void>;
  
  /**
   * Execute a client operation
   */
  execute<T = any>(operation: string, params?: any): Promise<ClientResult<T>>;
  
  /**
   * Check client health
   */
  healthCheck(): Promise<ClientHealth>;
  
  /**
   * Get client metrics
   */
  getMetrics(): Promise<ClientMetrics>;
  
  /**
   * Shutdown the client gracefully
   */
  shutdown(): Promise<void>;
}

/**
 * Client Factory Interface
 * 
 * Defines the contract for creating client instances with proper configuration
 * and lifecycle management.
 */
export interface IClientFactory<TConfig extends ClientConfig = ClientConfig> {
  /** Factory type identifier */
  readonly type: string;
  
  /**
   * Create a new client instance
   */
  createClient(config: TConfig): Promise<IClient>;
  
  /**
   * Get or create a cached client instance
   */
  getClient(id: string, config: TConfig): Promise<IClient>;
  
  /**
   * Validate client configuration
   */
  validateConfig(config: TConfig): boolean;
  
  /**
   * Get all active client instances
   */
  getActiveClients(): IClient[];
  
  /**
   * Shutdown all clients managed by this factory
   */
  shutdownAll(): Promise<void>;
}

/**
 * Base Client Adapter
 * 
 * Abstract base class that provides common functionality for all client adapters.
 * Implements the IClient interface with shared behavior.
 */
export abstract class BaseClientAdapter extends EventEmitter implements IClient {
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
    this._startTime = Date.now();
    this._metrics = this.initializeMetrics();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
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
   * Check client health
   */
  async healthCheck(): Promise<ClientHealth> {
    return {
      status: this._isInitialized ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        connectivity: {
          status: this._isInitialized ? 'healthy' : 'unhealthy',
          message: this._isInitialized ? 'Client initialized' : 'Client not initialized'
        },
        performance: {
          status: this._metrics.averageLatency < 5000 ? 'healthy' : 'degraded',
          message: `Average latency: ${this._metrics.averageLatency}ms`
        }
      },
      metrics: {
        uptime: Date.now() - this._startTime,
        errorRate: this._metrics.totalOperations > 0 
          ? this._metrics.failedOperations / this._metrics.totalOperations 
          : 0,
        averageLatency: this._metrics.averageLatency,
        throughput: this._metrics.throughput
      }
    };
  }

  /**
   * Get client metrics
   */
  async getMetrics(): Promise<ClientMetrics> {
    this._metrics.uptime = Date.now() - this._startTime;
    return { ...this._metrics };
  }

  /**
   * Shutdown the client
   */
  async shutdown(): Promise<void> {
    this._isInitialized = false;
    this.emit('shutdown');
  }

  /**
   * Create a standardized client result
   */
  protected createResult<T>(
    operationId: string,
    success: boolean,
    data?: T,
    error?: { code: string; message: string; details?: any },
    metadata: Record<string, any> = {}
  ): ClientResult<T> {
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
    };
  }

  /**
   * Update metrics after an operation
   */
  protected updateMetrics(success: boolean, duration: number, cached = false): void {
    this._metrics.totalOperations++;
    
    if (success) {
      this._metrics.successfulOperations++;
    } else {
      this._metrics.failedOperations++;
    }
    
    if (cached) {
      // Update cache hit ratio
      const totalCacheOps = this._metrics.custom.cacheOps || 0;
      const cacheHits = this._metrics.custom.cacheHits || 0;
      this._metrics.custom.cacheOps = totalCacheOps + 1;
      if (cached) {
        this._metrics.custom.cacheHits = cacheHits + 1;
      }
      this._metrics.cacheHitRatio = this._metrics.custom.cacheHits / this._metrics.custom.cacheOps;
    }
    
    // Update average latency
    const totalLatency = this._metrics.averageLatency * (this._metrics.totalOperations - 1);
    this._metrics.averageLatency = (totalLatency + duration) / this._metrics.totalOperations;
    
    // Calculate throughput (operations per second over last minute)
    const uptimeSeconds = (Date.now() - this._startTime) / 1000;
    this._metrics.throughput = this._metrics.totalOperations / Math.max(uptimeSeconds, 1);
  }

  /**
   * Generate a unique operation ID
   */
  protected generateOperationId(): string {
    return `${this.type}_${++this._operationCounter}_${Date.now()}`;
  }

  /**
   * Log an operation (if logging is enabled)
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: any): void {
    if (this.config.logging?.enabled) {
      const prefix = this.config.logging.prefix || this.type;
      const shouldLog = this.shouldLog(level);
      
      if (shouldLog) {
        console[level](`[${prefix}] ${message}`, meta || '');
      }
    }
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const configLevel = this.config.logging?.level || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(configLevel);
  }

  /**
   * Initialize default metrics
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
      custom: {}
    };
  }
}

/**
 * Base Client Factory
 * 
 * Abstract base class for client factories that provides common functionality
 * and lifecycle management.
 */
export abstract class BaseClientFactory<TConfig extends ClientConfig = ClientConfig> 
  implements IClientFactory<TConfig> {
  
  protected clients = new Map<string, IClient>();

  constructor(public readonly type: string) {}

  /**
   * Create a new client instance (abstract - must be implemented by subclasses)
   */
  abstract createClient(config: TConfig): Promise<IClient>;

  /**
   * Get or create a cached client instance
   */
  async getClient(id: string, config: TConfig): Promise<IClient> {
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
   */
  validateConfig(config: TConfig): boolean {
    return Boolean(config && typeof config === 'object');
  }

  /**
   * Get all active client instances
   */
  getActiveClients(): IClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Shutdown all clients managed by this factory
   */
  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.clients.values()).map(client => 
      client.shutdown().catch(error => {
        console.error(`Error shutting down client:`, error);
      })
    );
    
    await Promise.all(shutdownPromises);
    this.clients.clear();
  }
}