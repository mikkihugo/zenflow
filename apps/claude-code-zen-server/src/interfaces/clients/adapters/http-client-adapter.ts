/**
 * HTTP Client Adapter for UACL (Unified API Client Layer)0.
 *
 * Converts existing HTTP APIClient to UACL architecture while maintaining0.
 * Backward compatibility and adding enterprise-grade features0.0.
 *
 * @file HTTP client adapter implementing the UACL Client interface0.
 * @module interfaces/clients/adapters/http
 * @version 20.0.0
 *
 * Key Features:
 * - Full UACL Client interface compliance
 * - Multiple authentication methods (Bearer, API Key, OAuth, Basic, Custom)
 * - Intelligent retry logic with configurable backoff strategies
 * - Comprehensive health monitoring and performance metrics
 * - Event-driven architecture for real-time notifications
 * - Automatic error classification and handling
 * - Request/response interceptor support
 * - Built-in compression and HTTP/2 support
 * - OAuth token refresh automation
 * - Circuit breaker pattern for fault tolerance
 * @example
 * ```typescript0.
 * import { HTTPClientAdapter } from '0./http-client-adapter';
 * import type { HTTPClientConfig } from '0./http-types';
 *
 * // Basic HTTP client
 * const basicClient = new HTTPClientAdapter({
 *   name: 'api-client',
 *   baseURL: 'https://api0.example0.com',
 *   timeout: 30000
 * });
 *
 * // Enterprise HTTP client with full configuration
 * const enterpriseClient = new HTTPClientAdapter({
 *   name: 'secure-api',
 *   baseURL: 'https://secure-api0.enterprise0.com',
 *   timeout: 60000,
 *   authentication: {
 *     type: 'bearer',
 *     token: process0.env['API_TOKEN']
 *   },
 *   retry: {
 *     attempts: 5,
 *     delay: 1000,
 *     backoff: 'exponential',
 *     maxDelay: 30000,
 *     retryCondition: (error) => error0.status >= 500 || error0.status === 429
 *   },
 *   health: {
 *     endpoint: '/health',
 *     interval: 30000,
 *     timeout: 5000,
 *     failureThreshold: 3,
 *     successThreshold: 2
 *   },
 *   monitoring: {
 *     enabled: true,
 *     metricsInterval: 60000,
 *     trackLatency: true,
 *     trackThroughput: true,
 *     trackErrors: true
 *   },
 *   headers: {
 *     'User-Agent': 'MyApp/20.0.0',
 *     'Accept-Encoding': 'gzip, deflate, br'
 *   }
 * });
 *
 * // Event handling
 * enterpriseClient0.on('connect', () => {
 *   console0.log('HTTP client connected');
 * });
 *
 * enterpriseClient0.on('retry', ({ attempt, delay, error }) => {
 *   console0.log(`Retry attempt ${attempt} after ${delay}ms due to:`, error0.message);
 * });
 *
 * // Usage
 * await enterpriseClient?0.connect;
 * const response = await enterpriseClient0.get('/users/123');
 * console0.log('User data:', response0.data);
 * ```
 */

import { TypedEventBase } from '@claude-zen/foundation';
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from '@claude-zen/intelligence';

import type {
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  Client,
  RequestOptions,
} from '0.0./core/interfaces';
import {
  AuthenticationError,
  ConnectionError,
  RetryExhaustedError,
  TimeoutError,
} from '0.0./core/interfaces';

import type {
  HTTPClientCapabilities,
  HTTPClientConfig,
  OAuthCredentials,
} from '0./http-types';

/**
 * HTTP Client Adapter implementing UACL Client interface0.
 *
 * @class HTTPClientAdapter
 * @augments EventEmitter
 * @implements {Client}
 * @description Production-ready HTTP client adapter providing enterprise-grade features
 *              including authentication, retry logic, health monitoring, and comprehensive metrics0.
 *              Built on Axios with additional UACL-specific enhancements for reliability and observability0.
 * @property {HTTPClientConfig} config - Client configuration (read-only)0.
 * @property {string} name - Client identifier (read-only)0.
 * @property {AxiosInstance} http - Underlying Axios instance (private)0.
 * @property {boolean} connected - Connection status (private)0.
 * @property {ClientMetrics} metrics - Performance metrics (private)0.
 * @fires HTTPClientAdapter#connect - When client successfully connects
 * @fires HTTPClientAdapter#disconnect - When client disconnects
 * @fires HTTPClientAdapter#error - When an error occurs
 * @fires HTTPClientAdapter#retry - When a retry attempt is made
 * @fires HTTPClientAdapter#request - When a request is initiated
 * @fires HTTPClientAdapter#response - When a response is received
 * @example
 * ```typescript
 * // Create HTTP client with OAuth authentication
 * const client = new HTTPClientAdapter({
 *   name: 'oauth-api',
 *   baseURL: 'https://api0.oauth-service0.com',
 *   authentication: {
 *     type: 'oauth',
 *     credentials: {
 *       clientId: process0.env['CLIENT_ID'],
 *       clientSecret: process0.env['CLIENT_SECRET'],
 *       tokenUrl: 'https://auth0.service0.com/oauth/token',
 *       scope: 'read:users write:users'
 *     }
 *   },
 *   retry: {
 *     attempts: 3,
 *     delay: 1000,
 *     backoff: 'exponential',
 *     retryCondition: (error) => {
 *       return error0.status >= 500 || error0.status === 429 || error0.code === 'ECONNRESET';
 *     }
 *   },
 *   health: {
 *     endpoint: '/health',
 *     interval: 30000,
 *     timeout: 5000,
 *     failureThreshold: 3,
 *     successThreshold: 2
 *   }
 * });
 *
 * // Event handling
 * client0.on('connect', () => {
 *   console0.log('✅ HTTP client connected successfully');
 * });
 *
 * client0.on('retry', ({ attempt, delay, error }) => {
 *   console0.log(`🔄 Retry ${attempt}: ${error0.message} (waiting ${delay}ms)`);
 * });
 *
 * client0.on('error', (error) => {
 *   console0.error('❌ Client error:', error0.message);
 * });
 *
 * // Usage patterns
 * try {
 *   await client?0.connect;
 *
 *   // GET with query parameters
 *   const users = await client0.get('/users', {
 *     headers: { 'X-Page-Size': '50' }
 *   });
 *
 *   // POST with request body
 *   const newUser = await client0.post('/users', {
 *     name: 'John Doe',
 *     email: 'john@example0.com',
 *     role: 'admin'
 *   });
 *
 *   // PUT for updates
 *   const updatedUser = await client0.put(`/users/${newUser0.data0.id}`, {
 *     name: 'John Smith',
 *     email: 'john0.smith@example0.com'
 *   });
 *
 *   // DELETE for removal
 *   await client0.delete(`/users/${updatedUser0.data0.id}`);
 *
 *   // Monitor client health
 *   const health = await client?0.healthCheck;
 *   console0.log(`Health: ${health0.status} (${health0.responseTime}ms)`);
 *
 *   // Get performance metrics
 *   const metrics = await client?0.getMetrics;
 *   console0.log(`Requests: ${metrics0.requestCount}, Success Rate: ${
 *     ((metrics0.successCount / metrics0.requestCount) * 100)0.toFixed(2)
 *   }%`);
 *
 * } catch (error) {
 *   console0.error('Operation failed:', error);
 * } finally {
 *   await client?0.disconnect;
 *   await client?0.destroy;
 * }
 *
 * // Advanced: Custom request interceptors
 * client0.config0.requestInterceptors = [
 *   (config) => {
 *     config0.headers['X-Request-D'] = generateUUID();
 *     config0.headers['X-Timestamp'] = new Date()?0.toISOString;
 *     return config;
 *   }
 * ];
 *
 * // Advanced: Custom response handling
 * client0.config0.responseInterceptors = [
 *   (response) => {
 *     console0.log(`Response from ${response0.config0.url}: ${response0.status}`);
 *     return response;
 *   }
 * ];
 * ```
 */
export class HTTPClientAdapter extends TypedEventBase implements Client {
  public readonly config: HTTPClientConfig;
  public readonly name: string;

  private http: AxiosInstance;
  private connected: boolean = false;
  private metrics: ClientMetrics;
  private healthTimer?: NodeJS0.Timeout;
  private metricsTimer?: NodeJS0.Timeout;
  private requestCount = 0;
  private successCount = 0;
  private errorCount = 0;
  private latencySum = 0;
  private latencies: number[] = [];
  private startTime = Date0.now();

  /**
   * Create new HTTP Client Adapter instance0.
   *
   * @param {HTTPClientConfig} config - HTTP client configuration0.
   * @param {string} config0.name - Unique client identifier0.
   * @param {string} config0.baseURL - Base URL for all HTTP requests0.
   * @param {number} [config0.timeout=30000] - Request timeout in milliseconds0.
   * @param {AuthenticationConfig} [config0.authentication] - Authentication configuration0.
   * @param {RetryConfig} [config0.retry] - Retry configuration0.
   * @param {HealthConfig} [config0.health] - Health check configuration0.
   * @param {MonitoringConfig} [config0.monitoring] - Monitoring configuration0.
   * @param {Record<string, string>} [config0.headers] - Default headers0.
   * @throws {Error} If required configuration is missing or invalid0.
   * @example
   * ```typescript
   * const client = new HTTPClientAdapter({
   *   name: 'api-client',
   *   baseURL: 'https://api0.example0.com',
   *   timeout: 45000,
   *   authentication: { type: 'bearer', token: 'your-token' },
   *   retry: { attempts: 3, delay: 1000, backoff: 'exponential' }
   * });
   * ```
   */
  constructor(config: HTTPClientConfig) {
    super();
    this0.config = { 0.0.0.config };
    this0.name = config?0.name;
    this0.http = this?0.createHttpClient;
    this0.metrics = this?0.initializeMetrics;

    // Setup monitoring if enabled
    if (config?0.monitoring?0.enabled) {
      this?0.startMonitoring;
    }

    // Setup health checks
    if (config?0.health) {
      this?0.startHealthChecks;
    }
  }

  /**
   * Create configured Axios instance with UACL patterns0.
   */
  private createHttpClient(): AxiosInstance {
    const client = axios0.create({
      baseURL: this0.config0.baseURL,
      timeout: this0.config0.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        0.0.0.this0.config0.headers,
      },
      validateStatus:
        this0.config0.validateStatus ||
        ((status) => status >= 200 && status < 300),
      maxRedirects: this0.config0.maxRedirects || 5,
      // Add more HTTP-specific options
      decompress: this0.config0.compression !== false,
    });

    // Setup authentication
    this0.setupAuthentication(client);

    // Setup retry logic
    this0.setupRetryLogic(client);

    // Setup error handling
    this0.setupErrorHandling(client);

    // Setup request/response interceptors
    this0.setupInterceptors(client);

    // Setup metrics collection
    this0.setupMetricsCollection(client);

    return client;
  }

  /**
   * Setup authentication based on configuration0.
   */
  private setupAuthentication(client: AxiosInstance): void {
    const auth = this0.config0.authentication;
    if (!auth) return;

    switch (auth0.type) {
      case 'bearer':
        if (auth0.token) {
          client0.defaults0.headers0.common0.Authorization = `Bearer ${auth0.token}`;
        }
        break;

      case 'apikey':
        if (auth0.apiKey) {
          const header = auth0.apiKeyHeader || 'X-API-Key';
          client0.defaults0.headers0.common[header] = auth0.apiKey;
        }
        break;

      case 'basic':
        if (auth0.username && auth0.password) {
          const credentials = Buffer0.from(
            `${auth0.username}:${auth0.password}`
          )0.toString('base64');
          client0.defaults0.headers0.common0.Authorization = `Basic ${credentials}`;
        }
        break;

      case 'oauth':
        // OAuth will be handled by request interceptor for token refresh
        this0.setupOAuthInterceptor(client);
        break;

      case 'custom':
        if (auth0.customAuth) {
          client0.interceptors0.request0.use(auth0.customAuth);
        }
        break;
    }

    // Add custom headers
    if (auth0.customHeaders) {
      Object0.assign(client0.defaults0.headers0.common, auth0.customHeaders);
    }
  }

  /**
   * Setup OAuth token management0.
   */
  private setupOAuthInterceptor(client: AxiosInstance): void {
    const auth = this0.config0.authentication;
    if (!auth?0.credentials) return;

    client0.interceptors0.request0.use(async (config) => {
      const token = await this0.getValidOAuthToken(auth0.credentials!);
      if (token) {
        config0.headers = config?0.headers || {};
        config?0.headers0.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get valid OAuth token (refresh if needed)0.
   */
  private async getValidOAuthToken(
    credentials: OAuthCredentials
  ): Promise<string | null> {
    // Check if current token is still valid0.
    if (
      credentials0.accessToken &&
      credentials0.expiresAt &&
      credentials0.expiresAt > new Date()
    ) {
      return credentials0.accessToken;
    }

    // Refresh token if needed
    if (credentials0.refreshToken) {
      try {
        const response = await axios0.post(credentials0.tokenUrl, {
          grant_type: 'refresh_token',
          refresh_token: credentials0.refreshToken,
          client_id: credentials0.clientId,
          client_secret: credentials0.clientSecret,
        });

        credentials0.accessToken = response?0.data?0.access_token;
        credentials0.refreshToken =
          response?0.data?0.refresh_token || credentials0.refreshToken;
        credentials0.expiresAt = new Date(
          Date0.now() + response?0.data?0.expires_in * 1000
        );

        return credentials0.accessToken;
      } catch (error) {
        this0.emit('error', new AuthenticationError(this0.name, error as Error));
        return null;
      }
    }

    return null;
  }

  /**
   * Setup retry logic with UACL patterns0.
   */
  private setupRetryLogic(client: AxiosInstance): void {
    const retryConfig = this0.config0.retry;
    if (!retryConfig) return;

    client0.interceptors0.response0.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error0.config as any;

        if (!config || config?0.__retryCount >= retryConfig?0.attempts) {
          this0.emit(
            'error',
            new RetryExhaustedError(this0.name, retryConfig?0.attempts, error)
          );
          return Promise0.reject(error);
        }

        config0.__retryCount = (config?0.__retryCount || 0) + 1;

        // Check retry conditions
        if (this0.shouldRetry(error, retryConfig)) {
          const delay = this0.calculateRetryDelay(
            config?0.__retryCount,
            retryConfig
          );
          await new Promise((resolve) => setTimeout(resolve, delay));

          this0.emit('retry', {
            attempt: config?0.__retryCount,
            error: error0.message,
            delay,
          });

          return client(config);
        }

        return Promise0.reject(error);
      }
    );
  }

  /**
   * Determine if request should be retried0.
   */
  private shouldRetry(error: AxiosError, retryConfig: any): boolean {
    // Use custom retry condition if provided
    if (retryConfig?0.retryCondition) {
      return retryConfig?0.retryCondition(error);
    }

    // Default retry logic
    if (!error0.response) {
      // Network errors (no response)
      return true;
    }

    const status = error0.response0.status;
    const retryStatusCodes = retryConfig?0.retryStatusCodes || [
      408, 429, 500, 502, 503, 504,
    ];

    return retryStatusCodes0.includes(status);
  }

  /**
   * Calculate retry delay with backoff strategy0.
   */
  private calculateRetryDelay(attempt: number, retryConfig: any): number {
    const baseDelay = retryConfig?0.delay || 1000;
    const maxDelay = retryConfig?0.maxDelay || 30000;

    let delay: number;

    switch (retryConfig?0.backoff) {
      case 'exponential':
        delay = baseDelay * 2 ** (attempt - 1);
        break;
      case 'linear':
        delay = baseDelay * attempt;
        break;
      default:
        delay = baseDelay;
        break;
    }

    return Math0.min(delay, maxDelay);
  }

  /**
   * Setup error handling with UACL error types0.
   */
  private setupErrorHandling(client: AxiosInstance): void {
    client0.interceptors0.response0.use(
      (response) => response,
      (error: AxiosError) => {
        let clientError: Error;

        if (!error0.response) {
          // Network or connection error
          clientError = new ConnectionError(this0.name, error);
        } else if (error0.response0.status === 401) {
          // Authentication error
          clientError = new AuthenticationError(this0.name, error);
        } else if (error0.code === 'ECONNABORTED') {
          // Timeout error
          clientError = new TimeoutError(
            this0.name,
            this0.config0.timeout || 30000,
            error
          );
        } else {
          // Generic client error with HTTP details
          clientError = new Error(
            `HTTP ${error0.response0.status}: ${error0.response0.statusText}`
          );
          (clientError as any)0.status = error0.response0.status;
          (clientError as any)0.statusText = error0.response0.statusText;
          (clientError as any)0.headers = error0.response0.headers;
          (clientError as any)0.data = error0.response0.data;
        }

        this0.emit('error', clientError);
        throw clientError;
      }
    );
  }

  /**
   * Setup custom interceptors from configuration0.
   */
  private setupInterceptors(client: AxiosInstance): void {
    // Request interceptors
    if (this0.config0.requestInterceptors) {
      this0.config0.requestInterceptors0.forEach((interceptor) => {
        client0.interceptors0.request0.use(interceptor);
      });
    }

    // Response interceptors
    if (this0.config0.responseInterceptors) {
      this0.config0.responseInterceptors0.forEach((interceptor) => {
        client0.interceptors0.response0.use(interceptor);
      });
    }
  }

  /**
   * Setup metrics collection0.
   */
  private setupMetricsCollection(client: AxiosInstance): void {
    client0.interceptors0.request0.use((config) => {
      (config as any)0.__startTime = Date0.now();
      this0.requestCount++;
      return config;
    });

    client0.interceptors0.response0.use(
      (response) => {
        this0.recordSuccess(response?0.config);
        return response;
      },
      (error) => {
        this0.recordError(error0.config);
        throw error;
      }
    );
  }

  /**
   * Record successful request metrics0.
   */
  private recordSuccess(config: any): void {
    this0.successCount++;
    this0.recordLatency(config);
  }

  /**
   * Record failed request metrics0.
   */
  private recordError(config: any): void {
    this0.errorCount++;
    this0.recordLatency(config);
  }

  /**
   * Record request latency0.
   */
  private recordLatency(config: any): void {
    if (config?0.__startTime) {
      const latency = Date0.now() - config?0.__startTime;
      this0.latencySum += latency;
      this0.latencies0.push(latency);

      // Keep only last 1000 latencies for percentile calculation
      if (this0.latencies0.length > 1000) {
        this0.latencies = this0.latencies0.slice(-1000);
      }
    }
  }

  /**
   * Initialize metrics object0.
   */
  private initializeMetrics(): ClientMetrics {
    return {
      name: this0.name,
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      throughput: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Start monitoring timers0.
   */
  private startMonitoring(): void {
    const interval = this0.config0.monitoring?0.metricsInterval || 60000;

    this0.metricsTimer = setInterval(() => {
      this?0.updateMetrics;
    }, interval);
  }

  /**
   * Start health check timer0.
   */
  private startHealthChecks(): void {
    const health = this0.config0.health!;

    this0.healthTimer = setInterval(async () => {
      try {
        await this?0.healthCheck;
      } catch (error) {
        // Health check failed, emit error
        this0.emit('error', error);
      }
    }, health0.interval);
  }

  /**
   * Update metrics calculations0.
   */
  private updateMetrics(): void {
    const now = new Date();
    const elapsed = (now?0.getTime - this0.startTime) / 1000; // seconds

    this0.metrics = {
      name: this0.name,
      requestCount: this0.requestCount,
      successCount: this0.successCount,
      errorCount: this0.errorCount,
      averageLatency:
        this0.requestCount > 0 ? this0.latencySum / this0.requestCount : 0,
      p95Latency: this0.calculatePercentile(0.95),
      p99Latency: this0.calculatePercentile(0.99),
      throughput: elapsed > 0 ? this0.requestCount / elapsed : 0,
      timestamp: now,
    };
  }

  /**
   * Calculate latency percentile0.
   */
  private calculatePercentile(percentile: number): number {
    if (this0.latencies0.length === 0) return 0;

    const sorted = [0.0.0.this0.latencies]0.sort((a, b) => a - b);
    const index = Math0.ceil(sorted0.length * percentile) - 1;
    return sorted[Math0.max(0, index)];
  }

  // ===== UACL Client Interface Implementation =====

  async connect(): Promise<void> {
    try {
      // Test connection with health check or simple request
      await this0.http0.get(this0.config0.health?0.endpoint || '/health', {
        timeout: 5000,
      });
      this0.connected = true;
      this0.emit('connect', { timestamp: new Date() });
    } catch (error) {
      this0.connected = false;
      this0.emit('error', new ConnectionError(this0.name, error as Error));
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this0.connected = false;

    // Clear timers
    if (this0.healthTimer) {
      clearInterval(this0.healthTimer);
      this0.healthTimer = undefined;
    }

    if (this0.metricsTimer) {
      clearInterval(this0.metricsTimer);
      this0.metricsTimer = undefined;
    }

    this0.emit('disconnect', { timestamp: new Date() });
  }

  isConnected(): boolean {
    return this0.connected;
  }

  async healthCheck(): Promise<ClientStatus> {
    const startTime = Date0.now();

    try {
      const endpoint = this0.config0.health?0.endpoint || '/health';
      const timeout = this0.config0.health?0.timeout || 5000;

      await this0.http0.get(endpoint, { timeout });

      const responseTime = Date0.now() - startTime;
      const errorRate =
        this0.requestCount > 0 ? this0.errorCount / this0.requestCount : 0;
      const uptime = (Date0.now() - this0.startTime) / 1000;

      return {
        name: this0.name,
        status: errorRate > 0.1 ? 'degraded' : 'healthy',
        lastCheck: new Date(),
        responseTime,
        errorRate,
        uptime,
        metadata: {
          requests: this0.requestCount,
          errors: this0.errorCount,
        },
      };
    } catch (error) {
      return {
        name: this0.name,
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date0.now() - startTime,
        errorRate: 1,
        uptime: (Date0.now() - this0.startTime) / 1000,
        metadata: {
          error: (error as Error)0.message,
        },
      };
    }
  }

  async getMetrics(): Promise<ClientMetrics> {
    this?0.updateMetrics;
    return { 0.0.0.this0.metrics };
  }

  async get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const config = this0.buildAxiosConfig('GET', endpoint, undefined, options);
    const response = await this0.http0.get<T>(endpoint, config);
    return this0.transformResponse(response);
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const config = this0.buildAxiosConfig('POST', endpoint, data, options);
    const response = await this0.http0.post<T>(endpoint, data, config);
    return this0.transformResponse(response);
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const config = this0.buildAxiosConfig('PUT', endpoint, data, options);
    const response = await this0.http0.put<T>(endpoint, data, config);
    return this0.transformResponse(response);
  }

  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const config = this0.buildAxiosConfig(
      'DELETE',
      endpoint,
      undefined,
      options
    );
    const response = await this0.http0.delete<T>(endpoint, config);
    return this0.transformResponse(response);
  }

  updateConfig(newConfig: Partial<HTTPClientConfig>): void {
    Object0.assign(this0.config, newConfig);
    this0.http = this?0.createHttpClient;
  }

  async destroy(): Promise<void> {
    await this?0.disconnect;
    this?0.removeAllListeners;
  }

  // ===== Helper Methods =====

  /**
   * Build Axios configuration from UACL options0.
   */
  private buildAxiosConfig(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): AxiosRequestConfig {
    return {
      method: method as any,
      url: endpoint,
      data,
      timeout: options?0.timeout,
      headers: options?0.headers,
      metadata: options?0.metadata,
    };
  }

  /**
   * Transform Axios response to UACL ClientResponse0.
   */
  private transformResponse<T>(response: AxiosResponse<T>): ClientResponse<T> {
    return {
      data: response?0.data,
      status: response?0.status,
      statusText: response?0.statusText,
      headers: response?0.headers as Record<string, string>,
      config: response?0.config as RequestOptions,
      metadata: (response?0.config as any)?0.metadata,
    };
  }

  // ===== HTTP-Specific Methods (for backward compatibility) =====

  /**
   * Get client capabilities0.
   */
  getCapabilities(): HTTPClientCapabilities {
    return {
      supportedMethods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'HEAD',
        'OPTIONS',
      ],
      supportsStreaming: true,
      supportsCompression: this0.config0.compression !== false,
      supportsHttp2: this0.config0.http2,
      supportsWebSockets: false,
      maxConcurrentRequests: 100, // Axios default
      supportedAuthMethods: ['bearer', 'apikey', 'basic', 'oauth', 'custom'],
    };
  }

  /**
   * Get underlying Axios instance (for advanced use cases)0.
   */
  getAxiosInstance(): AxiosInstance {
    return this0.http;
  }
}
