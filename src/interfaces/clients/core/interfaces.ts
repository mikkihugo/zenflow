/**
 * UACL (Unified API Client Layer) Core Interfaces.
 *
 * Provides unified abstractions for all client implementations:
 * - HTTP, WebSocket, GraphQL, gRPC clients
 * - Consistent authentication, retry, and monitoring patterns
 * - Factory pattern for client creation and management
 * - Health checks and performance monitoring.
 *
 * @file Core interfaces defining the UACL contract for all client types.
 * @module interfaces/clients/core.
 * @version 2.0.0
 * @description This module defines the foundational interfaces that all UACL clients must implement,
 *              providing a consistent API surface across HTTP, WebSocket, Knowledge, and MCP clients.
 *              These interfaces ensure uniform behavior for connection management, authentication,
 *              retry logic, health monitoring, and performance metrics collection.
 *
 * Key design principles:
 * - Protocol-agnostic: Interfaces work for HTTP, WebSocket, and other protocols
 * - Event-driven: Built on EventEmitter for real-time notifications
 * - Observable: Comprehensive metrics and health monitoring
 * - Resilient: Built-in retry logic and error handling
 * - Extensible: Support for custom authentication and middleware.
 * @example
 * ```typescript
 * // Implement a custom client using UACL interfaces.
 * import type { IClient, ClientConfig, ClientResponse } from './core/interfaces';
 *
 * class CustomClient extends EventEmitter implements IClient {
 *   constructor(public readonly config: ClientConfig) {
 *     super();
 *   }
 *
 *   async connect(): Promise<void> {
 *     // Custom connection logic
 *     this.emit('connect');
 *   }
 *
 *   async get<T>(endpoint: string): Promise<ClientResponse<T>> {
 *     // Custom request implementation
 *     return {
 *       data: {} as T,
 *       status: 200,
 *       statusText: 'OK',
 *       headers: {},
 *       config: {}
 *     };
 *   }
 * }
 * ```
 */

/**
 * Authentication configuration for clients.
 *
 * @interface AuthenticationConfig
 * @description Unified authentication configuration supporting multiple authentication methods.
 *              Provides a flexible, extensible approach to client authentication across all protocols.
 * @property {'bearer'|'apikey'|'oauth'|'basic'|'custom'} type - Authentication method type.
 * @property {string} [token] - Bearer token for token-based authentication.
 * @property {string} [apiKey] - API key for key-based authentication.
 * @property {string} [apiKeyHeader='X-API-Key'] - Header name for API key authentication.
 * @property {object} [credentials] - OAuth 2.0 credentials configuration.
 * @property {string} [username] - Username for basic authentication.
 * @property {string} [password] - Password for basic authentication.
 * @property {Function} [customAuth] - Custom authentication handler function.
 * @example
 * ```typescript
 * // Bearer token authentication
 * const bearerAuth: AuthenticationConfig = {
 *   type: 'bearer',
 *   token: 'your-jwt-token-here'
 * };
 *
 * // API key authentication
 * const apiKeyAuth: AuthenticationConfig = {
 *   type: 'apikey',
 *   apiKey: 'your-api-key',
 *   apiKeyHeader: 'X-Custom-API-Key'
 * };
 *
 * // OAuth 2.0 authentication
 * const oauthAuth: AuthenticationConfig = {
 *   type: 'oauth',
 *   credentials: {
 *     clientId: 'your-client-id',
 *     clientSecret: 'your-client-secret',
 *     tokenUrl: 'https://auth.example.com/oauth/token',
 *     scope: 'read write'
 *   }
 * };
 *
 * // Basic authentication
 * const basicAuth: AuthenticationConfig = {
 *   type: 'basic',
 *   username: 'user@example.com',
 *   password: 'secure-password'
 * };
 *
 * // Custom authentication
 * const customAuth: AuthenticationConfig = {
 *   type: 'custom',
 *   customAuth: (request) => {
 *     request.headers['Authorization'] = `Custom ${generateCustomToken()}`;
 *     return request;
 *   }
 * };
 * ```
 */
export interface AuthenticationConfig {
  /** Authentication method type */
  type: 'bearer' | 'apikey' | 'oauth' | 'basic' | 'custom';

  /** Bearer token for token-based authentication */
  token?: string;

  /** API key for key-based authentication */
  apiKey?: string;
  /** Header name for API key authentication (default: 'X-API-Key') */
  apiKeyHeader?: string;

  /** OAuth 2.0 credentials configuration */
  credentials?: {
    /** OAuth client ID */
    clientId: string;
    /** OAuth client secret */
    clientSecret: string;
    /** OAuth token endpoint URL */
    tokenUrl: string;
    /** OAuth scope (optional) */
    scope?: string;
  };

  /** Username for basic authentication */
  username?: string;
  /** Password for basic authentication */
  password?: string;

  /** Custom authentication handler function */
  customAuth?: (request: any) => any;
}

/**
 * Retry configuration with multiple backoff strategies.
 *
 * @interface RetryConfig
 * @description Configuration for automatic retry logic with various backoff strategies.
 *              Provides intelligent retry behavior for handling transient failures.
 * @property {number} attempts - Maximum number of retry attempts (1-10 recommended).
 * @property {number} delay - Base delay between retries in milliseconds.
 * @property {'linear'|'exponential'|'fixed'} backoff - Backoff strategy for retry delays.
 * @property {number} [maxDelay] - Maximum delay cap for exponential/linear backoff (ms).
 * @property {Function} [retryCondition] - Custom function to determine if error should be retried.
 * @example
 * ```typescript
 * // Exponential backoff for API rate limiting
 * const exponentialRetry: RetryConfig = {
 *   attempts: 5,
 *   delay: 1000,           // Start with 1 second
 *   backoff: 'exponential', // 1s, 2s, 4s, 8s, 16s
 *   maxDelay: 30000,       // Cap at 30 seconds
 *   retryCondition: (error) => {
 *     // Retry on 5xx errors and specific 4xx errors
 *     return error.status >= 500 || error.status === 429 || error.status === 408;
 *   }
 * };
 *
 * // Linear backoff for network issues
 * const linearRetry: RetryConfig = {
 *   attempts: 3,
 *   delay: 2000,      // 2s, 4s, 6s
 *   backoff: 'linear',
 *   maxDelay: 10000
 * };
 *
 * // Fixed delay for simple retry
 * const fixedRetry: RetryConfig = {
 *   attempts: 2,
 *   delay: 5000,     // Always wait 5 seconds
 *   backoff: 'fixed'
 * };
 *
 * // Custom retry condition for specific errors
 * const smartRetry: RetryConfig = {
 *   attempts: 3,
 *   delay: 1000,
 *   backoff: 'exponential',
 *   retryCondition: (error) => {
 *     // Only retry on network errors and rate limits
 *     return error.code === 'ECONNRESET' ||
 *            error.code === 'ETIMEDOUT' ||
 *            error.status === 429;
 *   }
 * };
 * ```
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  attempts: number;
  /** Base delay between retries in milliseconds */
  delay: number;
  /** Backoff strategy for calculating retry delays */
  backoff: 'linear' | 'exponential' | 'fixed';
  /** Maximum delay cap for backoff strategies (milliseconds) */
  maxDelay?: number;
  /** Custom function to determine if an error should trigger a retry */
  retryCondition?: (error: any) => boolean;
}

/**
 * Health check configuration.
 *
 * @example
 */
export interface HealthConfig {
  endpoint: string;
  interval: number; // ms
  timeout: number; // ms
  failureThreshold: number;
  successThreshold: number;
}

/**
 * Performance monitoring configuration.
 *
 * @example
 */
export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number; // ms
  trackLatency: boolean;
  trackThroughput: boolean;
  trackErrors: boolean;
}

/**
 * Base client configuration.
 *
 * @example
 */
export interface ClientConfig {
  name: string;
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  authentication?: AuthenticationConfig;
  retry?: RetryConfig;
  health?: HealthConfig;
  monitoring?: MonitoringConfig;
  metadata?: Record<string, any>;
}

/**
 * Client status information.
 *
 * @example
 */
export interface ClientStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disconnected';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  uptime: number;
  metadata?: Record<string, any>;
}

/**
 * Client performance metrics.
 *
 * @example
 */
export interface ClientMetrics {
  name: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number; // requests per second
  timestamp: Date;
}

/**
 * Generic request options.
 *
 * @example
 */
export interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  metadata?: Record<string, any>;
}

/**
 * Generic response wrapper.
 *
 * @example
 */
export interface ClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestOptions;
  metadata?: Record<string, any>;
}

/**
 * Core client interface that all clients must implement.
 *
 * @interface IClient
 * @augments EventEmitter
 * @description The foundational interface that all UACL clients must implement.
 *              Provides a unified API contract for connection management, request handling,
 *              health monitoring, and lifecycle management across all client types.
 * @example
 * ```typescript
 * // Using a UACL client through the IClient interface
 * import type { IClient } from './core/interfaces';
 *
 * async function useClient(client: IClient) {
 *   // Connection management
 *   await client.connect();
 *   console.log('Connected:', client.isConnected());
 *
 *   // Event handling
 *   client.on('error', (error) => {
 *     console.error('Client error:', error);
 *   });
 *
 *   client.on('retry', ({ attempt, delay }) => {
 *     console.log(`Retry attempt ${attempt}, waiting ${delay}ms`);
 *   });
 *
 *   // Make requests
 *   try {
 *     const response = await client.get('/api/data');
 *     console.log('Data:', response.data);
 *
 *     await client.post('/api/users', {
 *       name: 'John Doe',
 *       email: 'john@example.com'
 *     });
 *   } catch (error) {
 *     console.error('Request failed:', error);
 *   }
 *
 *   // Health monitoring
 *   const status = await client.healthCheck();
 *   console.log(`Health: ${status.status}, Response time: ${status.responseTime}ms`);
 *
 *   const metrics = await client.getMetrics();
 *   console.log(`Requests: ${metrics.requestCount}, Errors: ${metrics.errorCount}`);
 *
 *   // Cleanup
 *   await client.disconnect();
 *   await client.destroy();
 * }
 *
 * // Implementing a custom client
 * class CustomClient extends EventEmitter implements IClient {
 *   constructor(public readonly config: ClientConfig) {
 *     super();
 *     this.name = config.name;
 *   }
 *
 *   async connect(): Promise<void> {
 *     // Custom connection logic
 *     this.emit('connect');
 *   }
 *
 *   async get<T>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
 *     // Custom GET implementation
 *     return {
 *       data: await this.customRequest('GET', endpoint, null, options),
 *       status: 200,
 *       statusText: 'OK',
 *       headers: {},
 *       config: options || {}
 *     };
 *   }
 *
 *   // ... implement other required methods
 * }
 * ```
 */
export interface IClient {
  /** Client configuration (read-only) */
  readonly config: ClientConfig;
  /** Client name identifier (read-only) */
  readonly name: string;

  /**
   * Establish connection to the service.
   *
   * @returns {Promise<void>} Resolves when connection is established.
   * @throws {ConnectionError} If connection fails.
   * @fires connect When connection is established
   * @fires error If connection fails
   */
  connect(): Promise<void>;

  /**
   * Gracefully close connection to the service.
   *
   * @returns {Promise<void>} Resolves when disconnection is complete.
   * @fires disconnect When disconnection is complete
   */
  disconnect(): Promise<void>;

  /**
   * Check if client is currently connected.
   *
   * @returns {boolean} True if connected, false otherwise.
   */
  isConnected(): boolean;

  /**
   * Perform health check and get current status.
   *
   * @returns {Promise<ClientStatus>} Current health status with metrics.
   * @throws {Error} If health check fails.
   */
  healthCheck(): Promise<ClientStatus>;

  /**
   * Get current performance metrics.
   *
   * @returns {Promise<ClientMetrics>} Performance metrics and statistics.
   */
  getMetrics(): Promise<ClientMetrics>;

  /**
   * Perform GET request.
   *
   * @template T Response data type.
   * @param {string} endpoint - Request endpoint/path.
   * @param {RequestOptions} [options] - Request configuration options.
   * @returns {Promise<ClientResponse<T>>} Response with typed data.
   * @throws {Error} If request fails after retries.
   * @fires retry On retry attempts
   * @fires error On request failures
   */
  get<T = any>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<ClientResponse<T>>;

  /**
   * Perform POST request.
   *
   * @template T Response data type.
   * @param {string} endpoint - Request endpoint/path.
   * @param {any} [data] - Request body data.
   * @param {RequestOptions} [options] - Request configuration options.
   * @returns {Promise<ClientResponse<T>>} Response with typed data.
   * @throws {Error} If request fails after retries.
   */
  post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ClientResponse<T>>;

  /**
   * Perform PUT request.
   *
   * @template T Response data type.
   * @param {string} endpoint - Request endpoint/path.
   * @param {any} [data] - Request body data.
   * @param {RequestOptions} [options] - Request configuration options.
   * @returns {Promise<ClientResponse<T>>} Response with typed data.
   * @throws {Error} If request fails after retries.
   */
  put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ClientResponse<T>>;

  /**
   * Perform DELETE request.
   *
   * @template T Response data type.
   * @param {string} endpoint - Request endpoint/path.
   * @param {RequestOptions} [options] - Request configuration options.
   * @returns {Promise<ClientResponse<T>>} Response with typed data.
   * @throws {Error} If request fails after retries.
   */
  delete<T = any>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<ClientResponse<T>>;

  /**
   * Update client configuration.
   *
   * @param {Partial<ClientConfig>} config - Partial configuration to update.
   * @description Updates the client configuration and reinitializes affected components.
   *              Not all configuration changes may take effect immediately.
   */
  updateConfig(config: Partial<ClientConfig>): void;

  /**
   * Register event handler.
   *
   * @param {'connect'|'disconnect'|'error'|'retry'|string} event - Event name.
   * @param {Function} handler - Event handler function.
   * @description Register listeners for client lifecycle and operational events.
   */
  on(
    event: 'connect' | 'disconnect' | 'error' | 'retry',
    handler: (...args: any[]) => void,
  ): void;

  /**
   * Remove event handler.
   *
   * @param {string} event - Event name.
   * @param {Function} [handler] - Specific handler to remove (removes all if not specified).
   */
  off(event: string, handler?: (...args: any[]) => void): void;

  /**
   * Clean up resources and destroy client.
   *
   * @returns {Promise<void>} Resolves when cleanup is complete.
   * @description Performs complete cleanup including disconnection, timer cleanup,
   *              and resource deallocation. Client cannot be used after calling destroy().
   */
  destroy(): Promise<void>;
}

/**
 * Client factory interface for creating and managing clients.
 *
 * @example
 */
export interface IClientFactory<TConfig extends ClientConfig = ClientConfig> {
  // Client creation
  create(config: TConfig): Promise<IClient>;
  createMultiple(configs: TConfig[]): Promise<IClient[]>;

  // Client management
  get(name: string): IClient | undefined;
  list(): IClient[];
  has(name: string): boolean;
  remove(name: string): Promise<boolean>;

  // Batch operations
  healthCheckAll(): Promise<Map<string, ClientStatus>>;
  getMetricsAll(): Promise<Map<string, ClientMetrics>>;

  // Factory management
  shutdown(): Promise<void>;
  getActiveCount(): number;
}

/**
 * Client registry for global client management.
 *
 * @example
 */
export interface IClientRegistry {
  // Factory registration
  registerFactory<T extends ClientConfig>(
    type: string,
    factory: IClientFactory<T>,
  ): void;
  getFactory<T extends ClientConfig>(
    type: string,
  ): IClientFactory<T> | undefined;
  listFactoryTypes(): string[];

  // Client management across all factories
  getAllClients(): Map<string, IClient>;
  findClient(name: string): IClient | undefined;
  getClientsByType(type: string): IClient[];

  // Global operations
  healthCheckAll(): Promise<Map<string, ClientStatus>>;
  shutdownAll(): Promise<void>;
}

/**
 * Error types for client operations.
 *
 * @example
 */
export class ClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly client: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'ClientError';
  }
}

export class ConnectionError extends ClientError {
  constructor(client: string, cause?: Error) {
    super(
      `Connection failed for client: ${client}`,
      'CONNECTION_ERROR',
      client,
      cause,
    );
    this.name = 'ConnectionError';
  }
}

export class AuthenticationError extends ClientError {
  constructor(client: string, cause?: Error) {
    super(
      `Authentication failed for client: ${client}`,
      'AUTH_ERROR',
      client,
      cause,
    );
    this.name = 'AuthenticationError';
  }
}

export class TimeoutError extends ClientError {
  constructor(client: string, timeout: number, cause?: Error) {
    super(
      `Request timeout (${timeout}ms) for client: ${client}`,
      'TIMEOUT_ERROR',
      client,
      cause,
    );
    this.name = 'TimeoutError';
  }
}

export class RetryExhaustedError extends ClientError {
  constructor(client: string, attempts: number, cause?: Error) {
    super(
      `Retry exhausted (${attempts} attempts) for client: ${client}`,
      'RETRY_EXHAUSTED',
      client,
      cause,
    );
    this.name = 'RetryExhaustedError';
  }
}

/**
 * Missing exports for compatibility.
 *
 * @example
 */
export interface ClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ClientConfig;
  timestamp: Date;
}

// Re-export types from types.ts for convenience
export type { ClientStatus, ProtocolType } from '../types.ts';
