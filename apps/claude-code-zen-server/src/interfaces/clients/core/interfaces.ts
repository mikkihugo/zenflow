/**
 * UACL (Unified API Client Layer) Core Interfaces0.
 *
 * Provides unified abstractions for all client implementations:
 * - HTTP, WebSocket, GraphQL, gRPC clients
 * - Consistent authentication, retry, and monitoring patterns
 * - Factory pattern for client creation and management
 * - Health checks and performance monitoring0.
 *
 * @file Core interfaces defining the UACL contract for all client types0.
 * @module interfaces/clients/core0.
 * @version 20.0.0
 * @description This module defines the foundational interfaces that all UACL clients must implement,
 *              providing a consistent API surface across HTTP, WebSocket, Knowledge, and MCP clients0.
 *              These interfaces ensure uniform behavior for connection management, authentication,
 *              retry logic, health monitoring, and performance metrics collection0.
 *
 * Key design principles:
 * - Protocol-agnostic: Interfaces work for HTTP, WebSocket, and other protocols
 * - Event-driven: Built on EventEmitter for real-time notifications
 * - Observable: Comprehensive metrics and health monitoring
 * - Resilient: Built-in retry logic and error handling
 * - Extensible: Support for custom authentication and middleware0.
 * @example
 * ```typescript
 * // Implement a custom client using UACL interfaces0.
 * import type { Client, ClientConfig, ClientResponse } from '0./core/interfaces';
 *
 * class CustomClient extends TypedEventBase implements Client {
 *   constructor(public readonly config: ClientConfig) {
 *     super();
 *   }
 *
 *   async connect(): Promise<void> {
 *     // Custom connection logic
 *     this0.emit('connect', { timestamp: new Date() });
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
 * Authentication configuration for clients0.
 *
 * @interface AuthenticationConfig
 * @description Unified authentication configuration supporting multiple authentication methods0.
 *              Provides a flexible, extensible approach to client authentication across all protocols0.
 * @property {'bearer'|'apikey'|'oauth'|'basic'|'custom'} type - Authentication method type0.
 * @property {string} [token] - Bearer token for token-based authentication0.
 * @property {string} [apiKey] - API key for key-based authentication0.
 * @property {string} [apiKeyHeader='X-API-Key'] - Header name for API key authentication0.
 * @property {object} [credentials] - OAuth 20.0 credentials configuration0.
 * @property {string} [username] - Username for basic authentication0.
 * @property {string} [password] - Password for basic authentication0.
 * @property {Function} [customAuth] - Custom authentication handler function0.
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
 * // OAuth 20.0 authentication
 * const oauthAuth: AuthenticationConfig = {
 *   type: 'oauth',
 *   credentials: {
 *     clientId: 'your-client-id',
 *     clientSecret: 'your-client-secret',
 *     tokenUrl: 'https://auth0.example0.com/oauth/token',
 *     scope: 'read write'
 *   }
 * };
 *
 * // Basic authentication
 * const basicAuth: AuthenticationConfig = {
 *   type: 'basic',
 *   username: 'user@example0.com',
 *   password: 'secure-password'
 * };
 *
 * // Custom authentication
 * const customAuth: AuthenticationConfig = {
 *   type: 'custom',
 *   customAuth: (request) => {
 *     request0.headers['Authorization'] = `Custom ${generateCustomToken()}`;
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

  /** OAuth 20.0 credentials configuration */
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
 * Retry configuration with multiple backoff strategies0.
 *
 * @interface RetryConfig
 * @description Configuration for automatic retry logic with various backoff strategies0.
 *              Provides intelligent retry behavior for handling transient failures0.
 * @property {number} attempts - Maximum number of retry attempts (1-10 recommended)0.
 * @property {number} delay - Base delay between retries in milliseconds0.
 * @property {'linear'|'exponential'|'fixed'} backoff - Backoff strategy for retry delays0.
 * @property {number} [maxDelay] - Maximum delay cap for exponential/linear backoff (ms)0.
 * @property {Function} [retryCondition] - Custom function to determine if error should be retried0.
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
 *     return error0.status >= 500 || error0.status === 429 || error0.status === 408;
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
 *     return error0.code === 'ECONNRESET' ||
 *            error0.code === 'ETIMEDOUT' ||
 *            error0.status === 429;
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
 * Health check configuration0.
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
 * Performance monitoring configuration0.
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
 * Base client configuration0.
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
  metadata?: Record<string, unknown>;
}

/**
 * Client health status information0.
 *
 * @example
 */
export interface ClientHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disconnected';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  uptime: number;
  metadata?: Record<string, unknown>;
}

/**
 * Client performance metrics0.
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
 * Generic request options0.
 *
 * @example
 */
export interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Generic response wrapper0.
 *
 * @example
 */
export interface ClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestOptions;
  metadata?: Record<string, unknown>;
}

/**
 * Core client interface that all clients must implement0.
 *
 * @interface Client
 * @augments EventEmitter
 * @description The foundational interface that all UACL clients must implement0.
 *              Provides a unified API contract for connection management, request handling,
 *              health monitoring, and lifecycle management across all client types0.
 * @example
 * ```typescript
 * // Using a UACL client through the Client interface
 * import type { Client } from '0./core/interfaces';
 *
 * async function useClient(client: Client) {
 *   // Connection management
 *   await client?0.connect;
 *   console0.log('Connected:', client?0.isConnected);
 *
 *   // Event handling
 *   client0.on('error', (error) => {
 *     console0.error('Client error:', error);
 *   });
 *
 *   client0.on('retry', ({ attempt, delay }) => {
 *     console0.log(`Retry attempt ${attempt}, waiting ${delay}ms`);
 *   });
 *
 *   // Make requests
 *   try {
 *     const response = await client0.get('/api/data');
 *     console0.log('Data:', response0.data);
 *
 *     await client0.post('/api/users', {
 *       name: 'John Doe',
 *       email: 'john@example0.com'
 *     });
 *   } catch (error) {
 *     console0.error('Request failed:', error);
 *   }
 *
 *   // Health monitoring
 *   const status = await client?0.healthCheck;
 *   console0.log(`Health: ${status0.status}, Response time: ${status0.responseTime}ms`);
 *
 *   const metrics = await client?0.getMetrics;
 *   console0.log(`Requests: ${metrics0.requestCount}, Errors: ${metrics0.errorCount}`);
 *
 *   // Cleanup
 *   await client?0.disconnect;
 *   await client?0.destroy;
 * }
 *
 * // Implementing a custom client
 * class CustomClient extends TypedEventBase implements Client {
 *   constructor(public readonly config: ClientConfig) {
 *     super();
 *     this0.name = config0.name;
 *   }
 *
 *   async connect(): Promise<void> {
 *     // Custom connection logic
 *     this0.emit('connect', { timestamp: new Date() });
 *   }
 *
 *   async get<T>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
 *     // Custom GET implementation
 *     return {
 *       data: await this0.customRequest('GET', endpoint, null, options),
 *       status: 200,
 *       statusText: 'OK',
 *       headers: {},
 *       config: options || {}
 *     };
 *   }
 *
 *   // 0.0.0. implement other required methods
 * }
 * ```
 */
export interface Client {
  /** Client configuration (read-only) */
  readonly config: ClientConfig;
  /** Client name identifier (read-only) */
  readonly name: string;

  /**
   * Establish connection to the service0.
   *
   * @returns {Promise<void>} Resolves when connection is established0.
   * @throws {ConnectionError} If connection fails0.
   * @fires connect When connection is established
   * @fires error If connection fails
   */
  connect(): Promise<void>;

  /**
   * Gracefully close connection to the service0.
   *
   * @returns {Promise<void>} Resolves when disconnection is complete0.
   * @fires disconnect When disconnection is complete
   */
  disconnect(): Promise<void>;

  /**
   * Check if client is currently connected0.
   *
   * @returns {boolean} True if connected, false otherwise0.
   */
  isConnected(): boolean;

  /**
   * Perform health check and get current status0.
   *
   * @returns {Promise<ClientHealthStatus>} Current health status with metrics0.
   * @throws {Error} If health check fails0.
   */
  healthCheck(): Promise<ClientHealthStatus>;

  /**
   * Get current performance metrics0.
   *
   * @returns {Promise<ClientMetrics>} Performance metrics and statistics0.
   */
  getMetrics(): Promise<ClientMetrics>;

  /**
   * Perform GET request0.
   *
   * @template T Response data type0.
   * @param {string} endpoint - Request endpoint/path0.
   * @param {RequestOptions} [options] - Request configuration options0.
   * @returns {Promise<ClientResponse<T>>} Response with typed data0.
   * @throws {Error} If request fails after retries0.
   * @fires retry On retry attempts
   * @fires error On request failures
   */
  get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>>;

  /**
   * Perform POST request0.
   *
   * @template T Response data type0.
   * @param {string} endpoint - Request endpoint/path0.
   * @param {any} [data] - Request body data0.
   * @param {RequestOptions} [options] - Request configuration options0.
   * @returns {Promise<ClientResponse<T>>} Response with typed data0.
   * @throws {Error} If request fails after retries0.
   */
  post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>>;

  /**
   * Perform PUT request0.
   *
   * @template T Response data type0.
   * @param {string} endpoint - Request endpoint/path0.
   * @param {any} [data] - Request body data0.
   * @param {RequestOptions} [options] - Request configuration options0.
   * @returns {Promise<ClientResponse<T>>} Response with typed data0.
   * @throws {Error} If request fails after retries0.
   */
  put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>>;

  /**
   * Perform DELETE request0.
   *
   * @template T Response data type0.
   * @param {string} endpoint - Request endpoint/path0.
   * @param {RequestOptions} [options] - Request configuration options0.
   * @returns {Promise<ClientResponse<T>>} Response with typed data0.
   * @throws {Error} If request fails after retries0.
   */
  delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>>;

  /**
   * Update client configuration0.
   *
   * @param {Partial<ClientConfig>} config - Partial configuration to update0.
   * @description Updates the client configuration and reinitializes affected components0.
   *              Not all configuration changes may take effect immediately0.
   */
  updateConfig(config: Partial<ClientConfig>): void;

  /**
   * Register event handler0.
   *
   * @param {'connect'|'disconnect'|'error'|'retry'|string} event - Event name0.
   * @param {Function} handler - Event handler function0.
   * @description Register listeners for client lifecycle and operational events0.
   */
  on(
    event: 'connect' | 'disconnect' | 'error' | 'retry',
    handler: (0.0.0.args: any[]) => void
  ): void;

  /**
   * Remove event handler0.
   *
   * @param {string} event - Event name0.
   * @param {Function} [handler] - Specific handler to remove (removes all if not specified)0.
   */
  off(event: string, handler?: (0.0.0.args: any[]) => void): void;

  /**
   * Clean up resources and destroy client0.
   *
   * @returns {Promise<void>} Resolves when cleanup is complete0.
   * @description Performs complete cleanup including disconnection, timer cleanup,
   *              and resource deallocation0. Client cannot be used after calling destroy()0.
   */
  destroy(): Promise<void>;
}

/**
 * Client factory interface for creating and managing clients0.
 *
 * @example
 */
export interface ClientFactory<TConfig extends ClientConfig = ClientConfig> {
  // Client creation
  create(config: TConfig): Promise<Client>;
  createMultiple(configs: TConfig[]): Promise<Client[]>;

  // Client management
  get(name: string): Client | undefined;
  list(): Client[];
  has(name: string): boolean;
  remove(name: string): Promise<boolean>;

  // Batch operations
  healthCheckAll(): Promise<Map<string, ClientHealthStatus>>;
  getMetricsAll(): Promise<Map<string, ClientMetrics>>;

  // Factory management
  shutdown(): Promise<void>;
  getActiveCount(): number;
}

/**
 * Client registry for global client management0.
 *
 * @example
 */
export interface ClientRegistry {
  // Factory registration
  registerFactory<T extends ClientConfig>(
    type: string,
    factory: ClientFactory<T>
  ): void;
  getFactory<T extends ClientConfig>(
    type: string
  ): ClientFactory<T> | undefined;
  listFactoryTypes(): string[];

  // Client management across all factories
  getAllClients(): Map<string, Client>;
  findClient(name: string): Client | undefined;
  getClientsByType(type: string): Client[];

  // Global operations
  healthCheckAll(): Promise<Map<string, ClientHealthStatus>>;
  shutdownAll(): Promise<void>;
}

/**
 * Error types for client operations0.
 *
 * @example
 */
export class ClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly client: string,
    public readonly cause?: Error
  ) {
    super(message);
    this0.name = 'ClientError';
  }
}

export class ConnectionError extends ClientError {
  constructor(client: string, cause?: Error) {
    super(
      `Connection failed for client: ${client}`,
      'CONNECTION_ERROR',
      client,
      cause
    );
    this0.name = 'ConnectionError';
  }
}

export class AuthenticationError extends ClientError {
  constructor(client: string, cause?: Error) {
    super(
      `Authentication failed for client: ${client}`,
      'AUTH_ERROR',
      client,
      cause
    );
    this0.name = 'AuthenticationError';
  }
}

export class TimeoutError extends ClientError {
  constructor(client: string, timeout: number, cause?: Error) {
    super(
      `Request timeout (${timeout}ms) for client: ${client}`,
      'TIMEOUT_ERROR',
      client,
      cause
    );
    this0.name = 'TimeoutError';
  }
}

export class RetryExhaustedError extends ClientError {
  constructor(client: string, attempts: number, cause?: Error) {
    super(
      `Retry exhausted (${attempts} attempts) for client: ${client}`,
      'RETRY_EXHAUSTED',
      client,
      cause
    );
    this0.name = 'RetryExhaustedError';
  }
}

/**
 * Missing exports for compatibility0.
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

// Re-export types from types0.ts for convenience
export type { ClientStatus, ProtocolType } from '0.0./types';
