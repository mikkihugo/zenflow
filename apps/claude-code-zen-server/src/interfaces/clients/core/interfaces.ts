/**
 * @fileoverview UACL (Unified API Client Layer) Core Interfaces
 *
 * Provides unified abstractions for all client implementations:
 * - HTTP, WebSocket, GraphQL, gRPC clients
 * - Consistent authentication, retry, and monitoring patterns
 * - Factory pattern for client creation and management
 * - Health checks and performance monitoring
 * - Production-ready error handling and logging
 * - Event-driven architecture with comprehensive notifications
 *
 * Key design principles:
 * - Protocol-agnostic: Interfaces work for HTTP, WebSocket, and other protocols
 * - Event-driven: Built on EventEmitter for real-time notifications
 * - Observable: Comprehensive metrics and health monitoring
 * - Resilient: Built-in retry logic and error handling
 * - Extensible: Support for custom authentication and middleware
 * - Type-safe: Full TypeScript support with strict typing
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { TypedEventBase } from '@claude-zen/foundation';

/**
 * Authentication configuration for clients.
 *
 * Unified authentication configuration supporting multiple authentication methods.
 * Provides a flexible, extensible approach to client authentication across all protocols.
 */
export interface AuthenticationConfig {
  /** Authentication method type */
  type: 'bearer' | 'apikey' | 'oauth' | 'basic' | 'custom';
  /** Bearer token for token-based authentication */
  token?: string;
  /** API key for key-based authentication */
  apiKey?: string;
  /** Header name for API key authentication (default: X-API-Key) */
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
  /** OAuth redirect URI */
    redirectUri?: string;
  /** OAuth grant type */
    grantType?: 'authorization_code' | 'client_credentials' | 'password'

};
  /** Username for basic authentication */
  username?: string;
  /** Password for basic authentication */
  password?: string;
  /** Custom authentication handler function */
  customAuth?: (request: any) => any
}

/**
 * Retry configuration with multiple backoff strategies.
 *
 * Configuration for automatic retry logic with various backoff strategies.
 * Provides intelligent retry behavior for handling transient failures.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (1-10 recommended) */
  attempts: number;
  /** Base delay between retries in milliseconds */
  delay: number;
  /** Backoff strategy for retry delays */
  backoff: 'linear' | 'exponential' | 'fixed';
  /** Maximum delay cap for exponential/linear backoff (ms) */
  maxDelay?: number;
  /** Custom function to determine if error should be retried */
  retryCondition?: (error: any) => boolean;
  /** Jitter factor to add randomness to backoff (0-1) */
  jitter?: number;
  /** Whether to reset delay on successful request */
  resetOnSuccess?: boolean

}

/**
 * Rate limiting configuration.
 *
 * Configures client-side rate limiting to respect API quotas and prevent abuse.
 */
export interface RateLimitConfig {
  /** Maximum requests per time window */
  requestsPerWindow: number;
  /** Time window duration in milliseconds */
  windowMs: number;
  /** Strategy when rate limit is exceeded */
  strategy: 'queue' | 'drop' | 'throttle';
  /** Maximum queue size for 'queue' strat'gy */
  maxQueueSize?: number;
  /** Burst allowance for short-term spikes */
  burstAllowance?: number

}

/**
 * Logging configuration for clients.
 *
 * Configures client logging behavior with different levels and outputs.
 */
export interface LoggingConfig {
  /** Enable logging */
  enabled: boolean;
  /** Logging level */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** Log prefix for identification */
  prefix?: string;
  /** Whether to log request/response bodies */
  includeBody?: boolean;
  /** Whether to log request/response headers */
  includeHeaders?: boolean;
  /** Custom logger function */
  customLogger?: (level: string,
  message: string,
  meta?: any) => void

}

/**
 * Circuit breaker configuration.
 *
 * Implements circuit breaker pattern to handle cascading failures.
 */
export interface CircuitBreakerConfig {
  /** Enable circuit breaker */
  enabled: boolean;
  /** Failure threshold to trigger circuit breaker */
  failureThreshold: number;
  /** Success threshold to close circuit breaker */
  successThreshold: number;
  /** Timeout duration when circuit is open (ms) */
  timeout: number;
  /** Monitor window duration for failure counting (ms) */
  monitoringPeriod: number

}

/**
 * Cache configuration for client responses.
 *
 * Configures client-side caching to improve performance and reduce API calls.
 */
export interface CacheConfig {
  /** Enable caching */
  enabled: boolean;
  /** Cache TTL in milliseconds */
  ttl: number;
  /** Maximum cache size (number of entries) */
  maxSize?: number;
  /** Cache key generator function */
  keyGenerator?: (request: any) => string;
  /** Custom cache implementation */
  store?: any;
  /** Enable cache compression */
  compress?: boolean

}

/**
 * Timeout configuration for various client operations.
 *
 * Configures different timeout values for client operations.
 */
export interface TimeoutConfig {
  /** Connection timeout in milliseconds */
  connect?: number;
  /** Request timeout in milliseconds */
  request?: number;
  /** Response timeout in milliseconds */
  response?: number;
  /** Idle timeout in milliseconds */
  idle?: number;
  /** Keep-alive timeout in milliseconds */
  keepAlive?: number

}

/**
 * Client configuration interface.
 *
 * Core configuration for all client implementations in the UACL.
 * Provides a comprehensive set of options for client behavior.
 */
export interface ClientConfig {
  /** Base URL or connection string */
  baseURL?: string;
  /** Timeout configuration */
  timeout?: TimeoutConfig;
  /** Authentication configuration */
  auth?: AuthenticationConfig;
  /** Retry configuration */
  retry?: RetryConfig;
  /** Rate limiting configuration */
  rateLimit?: RateLimitConfig;
  /** Logging configuration */
  logging?: LoggingConfig;
  /** Circuit breaker configuration */
  circuitBreaker?: CircuitBreakerConfig;
  /** Cache configuration */
  cache?: CacheConfig;
  /** Custom headers to include with all requests */
  headers?: Record<string, string>;
  /** Query parameters to include with all requests */
  params?: Record<string, any>;
  /** Custom user agent string */
  userAgent?: string;
  /** Enable/disable SSL verification */
  validateSSL?: boolean;
  /** Custom SSL certificate */
  sslCert?: string;
  /** Proxy configuration */
  proxy?: {
    host: string;
  port: number;
  auth?: {
  username: string;
  password: string
}
};
  /** Custom client name for identification */
  name?: string;
  /** Client version */
  version?: string;
  /** Environment(
  development,
  staging,
  production
) */
  environment?: string;
  /** Additional metadata */
  metadata?: Record<string, any>
}

/**
 * Client response interface.
 *
 * Standardized response format for all client implementations.
 */
export interface ClientResponse<T = any> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
  /** Request configuration that generated this response */
  config: any;
  /** Response duration in milliseconds */
  duration?: number;
  /** Whether response was served from cache */
  cached?: boolean;
  /** Response metadata */
  metadata?: {
  requestId?: string;
    timestamp?: Date;
    retryCount?: number;
    fromCircuitBreaker?: boolean

}
}

/**
 * Client error interface.
 *
 * Standardized error format for all client implementations.
 */
export interface ClientError extends Error {
  /** Error code */
  code?: string;
  /** HTTP status code (if applicable) */
  status?: number;
  /** Response data (if available) */
  response?: any;
  /** Request configuration that caused this error */
  config?: any;
  /** Whether error is retryable */
  retryable?: boolean;
  /** Error category */
  category: 'network' | 'timeout' | 'authentication' | 'authorization' | 'validation' | 'server' | 'unknown';
  /** Additional error details */
  details?: Record<string,
  any>

}

/**
 * Client metrics interface.
 *
 * Comprehensive metrics collection for client performance monitoring.
 */
export interface ClientMetrics {
  /** Total number of operations performed */
  totalOperations: number;
  /** Number of successful operations */
  successfulOperations: number;
  /** Number of failed operations */
  failedOperations: number;
  /** Cache hit ratio (0-1) */
  cacheHitRatio: number;
  /** Average response time in milliseconds */
  averageLatency: number;
  /** Current throughput (operations per second) */
  throughput: number;
  /** Number of concurrent operations */
  concurrentOperations: number;
  /** Client uptime in milliseconds */
  uptime: number;
  /** Circuit breaker status */
  circuitBreakerStatus?: 'closed' | 'open' | 'half-open';
  /** Rate limit status */
  rateLimitStatus?: {
  remaining: number;
  resetTime: Date
};
  /** Custom metrics */
  custom?: Record<string, number>
}

/**
 * Health check result interface.
 *
 * Standardized health check result for client monitoring.
 */
export interface HealthCheckResult {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Timestamp of health check */
  timestamp: Date;
  /** Response time in milliseconds */
  responseTime: number;
  /** Detailed component health */
  components?: Record<string, {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  responseTime?: number

}>;
  /** Health check metadata */
  metadata?: Record<string, any>
}

/**
 * Core Client Interface.
 *
 * Primary interface that all UACL clients must implement.
 * Provides a unified API surface across all client types.
 */
export interface Client extends TypedEventBase {
  /** Client configuration */
  readonly config: ClientConfig;
  /** Client type identifier */
  readonly type: string;
  /** Client version */
  readonly version: string;
  /** Whether client is connected */
  readonly isConnected: boolean;
  /** Whether client is initialized */
  readonly isInitialized: boolean;

  /**
   * Initialize the client.
   */
  initialize(): Promise<void>;

  /**
   * Connect to the service.
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the service.
   */
  disconnect(): Promise<void>;

  /**
   * Perform a GET request.
   */
  get<T = any>(endpoint: string,
  config?: any): Promise<ClientResponse<T>>;

  /**
   * Perform a POST request.
   */
  post<T = any>(endpoint: string,
  data?: any,
  config?: any): Promise<ClientResponse<T>>;

  /**
   * Perform a PUT request.
   */
  put<T = any>(endpoint: string,
  data?: any,
  config?: any): Promise<ClientResponse<T>>;

  /**
   * Perform a DELETE request.
   */
  delete<T = any>(endpoint: string,
  config?: any): Promise<ClientResponse<T>>;

  /**
   * Perform a PATCH request.
   */
  patch<T = any>(endpoint: string,
  data?: any,
  config?: any): Promise<ClientResponse<T>>;

  /**
   * Perform a HEAD request.
   */
  head(endpoint: string,
  config?: any): Promise<ClientResponse>;

  /**
   * Perform an OPTIONS request.
   */
  options(endpoint: string,
  config?: any): Promise<ClientResponse>;

  /**
   * Perform a health check.
   */
  healthCheck(): Promise<HealthCheckResult>;

  /**
   * Get client metrics.
   */
  getMetrics(): Promise<ClientMetrics>;

  /**
   * Reset client metrics.
   */
  resetMetrics(): void;

  /**
   * Configure the client.
   */
  configure(config: Partial<ClientConfig>): void;

  /**
   * Shutdown the client gracefully.
   */
  shutdown(): Promise<void>

}

/**
 * Client factory interface.
 *
 * Factory pattern for creating and managing client instances.
 */
export interface ClientFactory<TClient extends Client = Client, TConfig extends ClientConfig = ClientConfig> {
  /** Factory type identifier */
  readonly type: string;

  /**
   * Create a new client instance.
   */
  create(config: TConfig): Promise<TClient>;

  /**
   * Get an existing client instance.
   */
  get(id: string): TClient | undefined;

  /**
   * Register a client instance.
   */
  register(id: string,
  client: TClient): void;

  /**
   * Unregister a client instance.
   */
  unregister(id: string): boolean;

  /**
   * Get all registered clients.
   */
  getAll(): TClient[];

  /**
   * Validate client configuration.
   */
  validateConfig(config: TConfig): boolean;

  /**
   * Shutdown all clients managed by this factory.
   */
  shutdown(): Promise<void>

}

/**
 * Client instance interface.
 *
 * Extended client interface with instance-specific metadata.
 */
export interface ClientInstance extends Client {
  /** Unique instance identifier */
  readonly id: string;
  /** Instance name */
  readonly name: string;
  /** Instance creation timestamp */
  readonly createdAt: Date;
  /** Last activity timestamp */
  readonly lastActivityAt?: Date;
  /** Instance tags for categorization */
  readonly tags?: string[];
  /** Instance metadata */
  readonly metadata?: Record<string,
  any>

}

/**
 * Client type interface.
 *
 * Metadata about a client type for registration and discovery.
 */
export interface ClientType {
  /** Type identifier */
  type: string;
  /** Human-readable name */
  name: string;
  /** Type description */
  description: string;
  /** Supported protocols */
  protocols: string[];
  /** Required configuration keys */
  requiredConfig: string[];
  /** Optional configuration keys */
  optionalConfig: string[];
  /** Default configuration */
  defaultConfig: Partial<ClientConfig>;
  /** Supported features */
  features: string[];
  /** Client capabilities */
  capabilities: string[];
  /** Version information */
  version: string

}

/**
 * Request interceptor function type.
 *
 * Function that can modify requests before they are sent.
 */
export type RequestInterceptor =
  | ((config: any) => any)
  | Promise<any>;

/**
 * Response interceptor function type.
 *
 * Function that can modify responses before they are returned.
 */
export type ResponseInterceptor =
  | ((response: ClientResponse) => ClientResponse)
  | Promise<ClientResponse>;

/**
 * Error interceptor function type.
 *
 * Function that can handle or transform errors.
 */
export type ErrorInterceptor =
  | ((error: ClientError) => ClientError)
  | Promise<ClientError>;

/**
 * Middleware interface.
 *
 * Middleware that can be applied to client requests and responses.
 */
export interface ClientMiddleware {
  /** Middleware name */
  name: string;
  /** Request interceptor */
  onRequest?: RequestInterceptor;
  /** Response interceptor */
  onResponse?: ResponseInterceptor;
  /** Error interceptor */
  onError?: ErrorInterceptor;
  /** Middleware priority (lower numbers run first) */
  priority?: number;
  /** Whether middleware is enabled */
  enabled?: boolean

}

/**
 * Connection pool interface.
 *
 * Manages connection pooling for clients.
 */
export interface ConnectionPool {
  /** Pool name */
  readonly name: string;
  /** Maximum pool size */
  readonly maxSize: number;
  /** Current pool size */
  readonly size: number;
  /** Number of active connections */
  readonly active: number;
  /** Number of idle connections */
  readonly idle: number;
  /**
   * Get a connection from the pool.
   */
  acquire(): Promise<any>;
  /**
   * Return a connection to the pool.
   */
  release(connection: any): void;
  /**
   * Destroy a connection.
   */
  destroy(connection: any): void;
  /**
   * Clear all connections.
   */
  clear(): Promise<void>;
  /**
   * Get pool statistics.
   */
  getStats(): {
  size: number;
  active: number;
  idle: number;
  pending: number;
  acquired: number;
  released: number;
  destroyed: number;
  created: number

}
}

// Re-export commonly used types from foundation
export type { TypedEventBase } from '@claude-zen/foundation';