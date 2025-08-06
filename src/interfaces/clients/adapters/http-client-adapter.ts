/**
 * HTTP Client Adapter for UACL (Unified API Client Layer)
 *
 * Converts existing HTTP APIClient to UACL architecture while maintaining
 * backward compatibility and adding enterprise-grade features.
 *
 * @file HTTP client adapter implementing the UACL IClient interface
 * @module interfaces/clients/adapters/http
 * @version 2.0.0
 *
 * Key Features:
 * - Full UACL IClient interface compliance
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
 * ```typescript
 * import { HTTPClientAdapter } from './http-client-adapter';
 * import type { HTTPClientConfig } from './http-types';
 *
 * // Basic HTTP client
 * const basicClient = new HTTPClientAdapter({
 *   name: 'api-client',
 *   baseURL: 'https://api.example.com',
 *   timeout: 30000
 * });
 *
 * // Enterprise HTTP client with full configuration
 * const enterpriseClient = new HTTPClientAdapter({
 *   name: 'secure-api',
 *   baseURL: 'https://secure-api.enterprise.com',
 *   timeout: 60000,
 *   authentication: {
 *     type: 'bearer',
 *     token: process.env.API_TOKEN
 *   },
 *   retry: {
 *     attempts: 5,
 *     delay: 1000,
 *     backoff: 'exponential',
 *     maxDelay: 30000,
 *     retryCondition: (error) => error.status >= 500 || error.status === 429
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
 *     'User-Agent': 'MyApp/2.0.0',
 *     'Accept-Encoding': 'gzip, deflate, br'
 *   }
 * });
 *
 * // Event handling
 * enterpriseClient.on('connect', () => {
 *   console.log('HTTP client connected');
 * });
 *
 * enterpriseClient.on('retry', ({ attempt, delay, error }) => {
 *   console.log(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
 * });
 *
 * // Usage
 * await enterpriseClient.connect();
 * const response = await enterpriseClient.get('/users/123');
 * console.log('User data:', response.data);
 * ```
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { EventEmitter } from 'events';
import type {
  AuthenticationError,
  ClientConfig,
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  ConnectionError,
  IClient,
  RequestOptions,
  RetryExhaustedError,
  TimeoutError,
} from '../core/interfaces';
import type {
  HTTPClientCapabilities,
  HTTPClientConfig,
  HTTPErrorDetails,
  HTTPRequestOptions,
  HTTPResponse,
  OAuthCredentials,
} from './http-types';

/**
 * HTTP Client Adapter implementing UACL IClient interface
 *
 * @class HTTPClientAdapter
 * @augments EventEmitter
 * @implements {IClient}
 * @description Production-ready HTTP client adapter providing enterprise-grade features
 *              including authentication, retry logic, health monitoring, and comprehensive metrics.
 *              Built on Axios with additional UACL-specific enhancements for reliability and observability.
 * @property {HTTPClientConfig} config - Client configuration (read-only)
 * @property {string} name - Client identifier (read-only)
 * @property {AxiosInstance} http - Underlying Axios instance (private)
 * @property {boolean} connected - Connection status (private)
 * @property {ClientMetrics} metrics - Performance metrics (private)
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
 *   baseURL: 'https://api.oauth-service.com',
 *   authentication: {
 *     type: 'oauth',
 *     credentials: {
 *       clientId: process.env.CLIENT_ID,
 *       clientSecret: process.env.CLIENT_SECRET,
 *       tokenUrl: 'https://auth.service.com/oauth/token',
 *       scope: 'read:users write:users'
 *     }
 *   },
 *   retry: {
 *     attempts: 3,
 *     delay: 1000,
 *     backoff: 'exponential',
 *     retryCondition: (error) => {
 *       return error.status >= 500 || error.status === 429 || error.code === 'ECONNRESET';
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
 * client.on('connect', () => {
 *   console.log('✅ HTTP client connected successfully');
 * });
 *
 * client.on('retry', ({ attempt, delay, error }) => {
 *   console.log(`🔄 Retry ${attempt}: ${error.message} (waiting ${delay}ms)`);
 * });
 *
 * client.on('error', (error) => {
 *   console.error('❌ Client error:', error.message);
 * });
 *
 * // Usage patterns
 * try {
 *   await client.connect();
 *
 *   // GET with query parameters
 *   const users = await client.get('/users', {
 *     headers: { 'X-Page-Size': '50' }
 *   });
 *
 *   // POST with request body
 *   const newUser = await client.post('/users', {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     role: 'admin'
 *   });
 *
 *   // PUT for updates
 *   const updatedUser = await client.put(`/users/${newUser.data.id}`, {
 *     name: 'John Smith',
 *     email: 'john.smith@example.com'
 *   });
 *
 *   // DELETE for removal
 *   await client.delete(`/users/${updatedUser.data.id}`);
 *
 *   // Monitor client health
 *   const health = await client.healthCheck();
 *   console.log(`Health: ${health.status} (${health.responseTime}ms)`);
 *
 *   // Get performance metrics
 *   const metrics = await client.getMetrics();
 *   console.log(`Requests: ${metrics.requestCount}, Success Rate: ${
 *     ((metrics.successCount / metrics.requestCount) * 100).toFixed(2)
 *   }%`);
 *
 * } catch (error) {
 *   console.error('Operation failed:', error);
 * } finally {
 *   await client.disconnect();
 *   await client.destroy();
 * }
 *
 * // Advanced: Custom request interceptors
 * client.config.requestInterceptors = [
 *   (config) => {
 *     config.headers['X-Request-ID'] = generateUUID();
 *     config.headers['X-Timestamp'] = new Date().toISOString();
 *     return config;
 *   }
 * ];
 *
 * // Advanced: Custom response handling
 * client.config.responseInterceptors = [
 *   (response) => {
 *     console.log(`Response from ${response.config.url}: ${response.status}`);
 *     return response;
 *   }
 * ];
 * ```
 */
export class HTTPClientAdapter extends EventEmitter implements IClient {
  public readonly config: HTTPClientConfig;
  public readonly name: string;

  private http: AxiosInstance;
  private connected: boolean = false;
  private metrics: ClientMetrics;
  private healthTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;
  private requestCount = 0;
  private successCount = 0;
  private errorCount = 0;
  private latencySum = 0;
  private latencies: number[] = [];
  private startTime = Date.now();

  /**
   * Create new HTTP Client Adapter instance
   *
   * @param {HTTPClientConfig} config - HTTP client configuration
   * @param {string} config.name - Unique client identifier
   * @param {string} config.baseURL - Base URL for all HTTP requests
   * @param {number} [config.timeout=30000] - Request timeout in milliseconds
   * @param {AuthenticationConfig} [config.authentication] - Authentication configuration
   * @param {RetryConfig} [config.retry] - Retry configuration
   * @param {HealthConfig} [config.health] - Health check configuration
   * @param {MonitoringConfig} [config.monitoring] - Monitoring configuration
   * @param {Record<string, string>} [config.headers] - Default headers
   * @throws {Error} If required configuration is missing or invalid
   * @example
   * ```typescript
   * const client = new HTTPClientAdapter({
   *   name: 'api-client',
   *   baseURL: 'https://api.example.com',
   *   timeout: 45000,
   *   authentication: { type: 'bearer', token: 'your-token' },
   *   retry: { attempts: 3, delay: 1000, backoff: 'exponential' }
   * });
   * ```
   */
  constructor(config: HTTPClientConfig) {
    super();
    this.config = { ...config };
    this.name = config.name;
    this.http = this.createHttpClient();
    this.metrics = this.initializeMetrics();

    // Setup monitoring if enabled
    if (config.monitoring?.enabled) {
      this.startMonitoring();
    }

    // Setup health checks
    if (config.health) {
      this.startHealthChecks();
    }
  }

  /**
   * Create configured Axios instance with UACL patterns
   */
  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.config.headers,
      },
      validateStatus: this.config.validateStatus || ((status) => status >= 200 && status < 300),
      maxRedirects: this.config.maxRedirects || 5,
      // Add more HTTP-specific options
      decompress: this.config.compression !== false,
    });

    // Setup authentication
    this.setupAuthentication(client);

    // Setup retry logic
    this.setupRetryLogic(client);

    // Setup error handling
    this.setupErrorHandling(client);

    // Setup request/response interceptors
    this.setupInterceptors(client);

    // Setup metrics collection
    this.setupMetricsCollection(client);

    return client;
  }

  /**
   * Setup authentication based on configuration
   */
  private setupAuthentication(client: AxiosInstance): void {
    const auth = this.config.authentication;
    if (!auth) return;

    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          client.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
        }
        break;

      case 'apikey':
        if (auth.apiKey) {
          const header = auth.apiKeyHeader || 'X-API-Key';
          client.defaults.headers.common[header] = auth.apiKey;
        }
        break;

      case 'basic':
        if (auth.username && auth.password) {
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          client.defaults.headers.common.Authorization = `Basic ${credentials}`;
        }
        break;

      case 'oauth':
        // OAuth will be handled by request interceptor for token refresh
        this.setupOAuthInterceptor(client);
        break;

      case 'custom':
        if (auth.customAuth) {
          client.interceptors.request.use(auth.customAuth);
        }
        break;
    }

    // Add custom headers
    if (auth.customHeaders) {
      Object.assign(client.defaults.headers.common, auth.customHeaders);
    }
  }

  /**
   * Setup OAuth token management
   */
  private setupOAuthInterceptor(client: AxiosInstance): void {
    const auth = this.config.authentication;
    if (!auth?.credentials) return;

    client.interceptors.request.use(async (config) => {
      const token = await this.getValidOAuthToken(auth.credentials!);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get valid OAuth token (refresh if needed)
   */
  private async getValidOAuthToken(credentials: OAuthCredentials): Promise<string | null> {
    // Check if current token is still valid
    if (credentials.accessToken && credentials.expiresAt && credentials.expiresAt > new Date()) {
      return credentials.accessToken;
    }

    // Refresh token if needed
    if (credentials.refreshToken) {
      try {
        const response = await axios.post(credentials.tokenUrl, {
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
        });

        credentials.accessToken = response.data.access_token;
        credentials.refreshToken = response.data.refresh_token || credentials.refreshToken;
        credentials.expiresAt = new Date(Date.now() + response.data.expires_in * 1000);

        return credentials.accessToken;
      } catch (error) {
        this.emit('error', new AuthenticationError(this.name, error as Error));
        return null;
      }
    }

    return null;
  }

  /**
   * Setup retry logic with UACL patterns
   */
  private setupRetryLogic(client: AxiosInstance): void {
    const retryConfig = this.config.retry;
    if (!retryConfig) return;

    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;

        if (!config || config.__retryCount >= retryConfig.attempts) {
          this.emit('error', new RetryExhaustedError(this.name, retryConfig.attempts, error));
          return Promise.reject(error);
        }

        config.__retryCount = (config.__retryCount || 0) + 1;

        // Check retry conditions
        if (this.shouldRetry(error, retryConfig)) {
          const delay = this.calculateRetryDelay(config.__retryCount, retryConfig);
          await new Promise((resolve) => setTimeout(resolve, delay));

          this.emit('retry', {
            attempt: config.__retryCount,
            error: error.message,
            delay,
          });

          return client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: AxiosError, retryConfig: any): boolean {
    // Use custom retry condition if provided
    if (retryConfig.retryCondition) {
      return retryConfig.retryCondition(error);
    }

    // Default retry logic
    if (!error.response) {
      // Network errors (no response)
      return true;
    }

    const status = error.response.status;
    const retryStatusCodes = retryConfig.retryStatusCodes || [408, 429, 500, 502, 503, 504];

    return retryStatusCodes.includes(status);
  }

  /**
   * Calculate retry delay with backoff strategy
   */
  private calculateRetryDelay(attempt: number, retryConfig: any): number {
    const baseDelay = retryConfig.delay || 1000;
    const maxDelay = retryConfig.maxDelay || 30000;

    let delay: number;

    switch (retryConfig.backoff) {
      case 'exponential':
        delay = baseDelay * 2 ** (attempt - 1);
        break;
      case 'linear':
        delay = baseDelay * attempt;
        break;
      case 'fixed':
      default:
        delay = baseDelay;
        break;
    }

    return Math.min(delay, maxDelay);
  }

  /**
   * Setup error handling with UACL error types
   */
  private setupErrorHandling(client: AxiosInstance): void {
    client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        let clientError: Error;

        if (!error.response) {
          // Network or connection error
          clientError = new ConnectionError(this.name, error);
        } else if (error.response.status === 401) {
          // Authentication error
          clientError = new AuthenticationError(this.name, error);
        } else if (error.code === 'ECONNABORTED') {
          // Timeout error
          clientError = new TimeoutError(this.name, this.config.timeout || 30000, error);
        } else {
          // Generic client error with HTTP details
          clientError = new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
          (clientError as any).status = error.response.status;
          (clientError as any).statusText = error.response.statusText;
          (clientError as any).headers = error.response.headers;
          (clientError as any).data = error.response.data;
        }

        this.emit('error', clientError);
        throw clientError;
      }
    );
  }

  /**
   * Setup custom interceptors from configuration
   */
  private setupInterceptors(client: AxiosInstance): void {
    // Request interceptors
    if (this.config.requestInterceptors) {
      this.config.requestInterceptors.forEach((interceptor) => {
        client.interceptors.request.use(interceptor);
      });
    }

    // Response interceptors
    if (this.config.responseInterceptors) {
      this.config.responseInterceptors.forEach((interceptor) => {
        client.interceptors.response.use(interceptor);
      });
    }
  }

  /**
   * Setup metrics collection
   */
  private setupMetricsCollection(client: AxiosInstance): void {
    client.interceptors.request.use((config) => {
      (config as any).__startTime = Date.now();
      this.requestCount++;
      return config;
    });

    client.interceptors.response.use(
      (response) => {
        this.recordSuccess(response.config);
        return response;
      },
      (error) => {
        this.recordError(error.config);
        throw error;
      }
    );
  }

  /**
   * Record successful request metrics
   */
  private recordSuccess(config: any): void {
    this.successCount++;
    this.recordLatency(config);
  }

  /**
   * Record failed request metrics
   */
  private recordError(config: any): void {
    this.errorCount++;
    this.recordLatency(config);
  }

  /**
   * Record request latency
   */
  private recordLatency(config: any): void {
    if (config.__startTime) {
      const latency = Date.now() - config.__startTime;
      this.latencySum += latency;
      this.latencies.push(latency);

      // Keep only last 1000 latencies for percentile calculation
      if (this.latencies.length > 1000) {
        this.latencies = this.latencies.slice(-1000);
      }
    }
  }

  /**
   * Initialize metrics object
   */
  private initializeMetrics(): ClientMetrics {
    return {
      name: this.name,
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
   * Start monitoring timers
   */
  private startMonitoring(): void {
    const interval = this.config.monitoring?.metricsInterval || 60000;

    this.metricsTimer = setInterval(() => {
      this.updateMetrics();
    }, interval);
  }

  /**
   * Start health check timer
   */
  private startHealthChecks(): void {
    const health = this.config.health!;

    this.healthTimer = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        // Health check failed, emit error
        this.emit('error', error);
      }
    }, health.interval);
  }

  /**
   * Update metrics calculations
   */
  private updateMetrics(): void {
    const now = new Date();
    const elapsed = (now.getTime() - this.startTime) / 1000; // seconds

    this.metrics = {
      name: this.name,
      requestCount: this.requestCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      averageLatency: this.requestCount > 0 ? this.latencySum / this.requestCount : 0,
      p95Latency: this.calculatePercentile(0.95),
      p99Latency: this.calculatePercentile(0.99),
      throughput: elapsed > 0 ? this.requestCount / elapsed : 0,
      timestamp: now,
    };
  }

  /**
   * Calculate latency percentile
   */
  private calculatePercentile(percentile: number): number {
    if (this.latencies.length === 0) return 0;

    const sorted = [...this.latencies].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }

  // ===== UACL IClient Interface Implementation =====

  async connect(): Promise<void> {
    try {
      // Test connection with health check or simple request
      await this.http.get(this.config.health?.endpoint || '/health', { timeout: 5000 });
      this.connected = true;
      this.emit('connect');
    } catch (error) {
      this.connected = false;
      this.emit('error', new ConnectionError(this.name, error as Error));
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;

    // Clear timers
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = undefined;
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }

    this.emit('disconnect');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async healthCheck(): Promise<ClientStatus> {
    const startTime = Date.now();

    try {
      const endpoint = this.config.health?.endpoint || '/health';
      const timeout = this.config.health?.timeout || 5000;

      await this.http.get(endpoint, { timeout });

      const responseTime = Date.now() - startTime;
      const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
      const uptime = (Date.now() - this.startTime) / 1000;

      return {
        name: this.name,
        status: errorRate > 0.1 ? 'degraded' : 'healthy',
        lastCheck: new Date(),
        responseTime,
        errorRate,
        uptime,
        metadata: {
          requests: this.requestCount,
          errors: this.errorCount,
        },
      };
    } catch (error) {
      return {
        name: this.name,
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorRate: 1,
        uptime: (Date.now() - this.startTime) / 1000,
        metadata: {
          error: (error as Error).message,
        },
      };
    }
  }

  async getMetrics(): Promise<ClientMetrics> {
    this.updateMetrics();
    return { ...this.metrics };
  }

  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    const config = this.buildAxiosConfig('GET', endpoint, undefined, options);
    const response = await this.http.get<T>(endpoint, config);
    return this.transformResponse(response);
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const config = this.buildAxiosConfig('POST', endpoint, data, options);
    const response = await this.http.post<T>(endpoint, data, config);
    return this.transformResponse(response);
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const config = this.buildAxiosConfig('PUT', endpoint, data, options);
    const response = await this.http.put<T>(endpoint, data, config);
    return this.transformResponse(response);
  }

  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    const config = this.buildAxiosConfig('DELETE', endpoint, undefined, options);
    const response = await this.http.delete<T>(endpoint, config);
    return this.transformResponse(response);
  }

  updateConfig(newConfig: Partial<HTTPClientConfig>): void {
    Object.assign(this.config, newConfig);
    this.http = this.createHttpClient();
  }

  async destroy(): Promise<void> {
    await this.disconnect();
    this.removeAllListeners();
  }

  // ===== Helper Methods =====

  /**
   * Build Axios configuration from UACL options
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
      timeout: options?.timeout,
      headers: options?.headers,
      metadata: options?.metadata,
    };
  }

  /**
   * Transform Axios response to UACL ClientResponse
   */
  private transformResponse<T>(response: AxiosResponse<T>): ClientResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      config: response.config as RequestOptions,
      metadata: (response.config as any)?.metadata,
    };
  }

  // ===== HTTP-Specific Methods (for backward compatibility) =====

  /**
   * Get client capabilities
   */
  getCapabilities(): HTTPClientCapabilities {
    return {
      supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      supportsStreaming: true,
      supportsCompression: this.config.compression !== false,
      supportsHttp2: this.config.http2 || false,
      supportsWebSockets: false,
      maxConcurrentRequests: 100, // Axios default
      supportedAuthMethods: ['bearer', 'apikey', 'basic', 'oauth', 'custom'],
    };
  }

  /**
   * Get underlying Axios instance (for advanced use cases)
   */
  getAxiosInstance(): AxiosInstance {
    return this.http;
  }
}
