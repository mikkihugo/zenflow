/**
 * @fileoverview Clean HTTP Client Implementation for UACL
 * 
 * Enterprise-grade HTTP client with full UACL compliance, providing:
 * - RESTful API communication with all HTTP methods
 * - Multiple authentication methods (Bearer, API Key, Basic, OAuth2)
 * - Intelligent retry logic with exponential backoff
 * - Request/response interceptors and middleware
 * - Circuit breaker pattern for fault tolerance
 * - Comprehensive metrics and health monitoring
 * - Response caching and compression support
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TypedEventBase, Logger, getLogger } from '@claude-zen/foundation';
import type {
  Client,
  ClientConfig,
  ClientResponse,
  ClientMetrics,
  ClientError,
  HealthCheckResult
} from '../core/interfaces';

const logger: Logger = getLogger('http-client-new');

/**
 * HTTP-specific authentication configuration
 */
export interface HTTPAuthConfig {
  type: 'bearer' | 'apikey' | 'basic' | 'oauth2' | 'custom';
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  username?: string;
  password?: string;
  oauth2?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    scope?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
  customAuth?: (config: AxiosRequestConfig) => AxiosRequestConfig;
}

/**
 * HTTP-specific retry configuration
 */
export interface HTTPRetryConfig {
  enabled: boolean;
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay?: number;
  retryStatusCodes?: number[];
  retryMethods?: string[];
  jitter?: boolean;
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitoringPeriod: number;
}

/**
 * HTTP client configuration interface
 */
export interface HTTPClientConfig extends ClientConfig {
  /** Base URL for all requests */
  baseURL: string;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Authentication configuration */
  auth?: HTTPAuthConfig;
  /** Retry configuration */
  retry?: HTTPRetryConfig;
  /** Circuit breaker configuration */
  circuitBreaker?: CircuitBreakerConfig;
  /** Default headers */
  headers?: Record<string, string>;
  /** HTTP/HTTPS agent configuration */
  agent?: any;
  /** Enable request/response compression */
  compression?: boolean;
  /** Maximum redirects to follow */
  maxRedirects?: number;
  /** SSL/TLS options */
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string[];
    cert?: string;
    key?: string;
  };
  /** Proxy configuration */
  proxy?: {
    host: string;
    port: number;
    auth?: { username: string; password: string };
  };
  /** Response validation function */
  validateStatus?: (status: number) => boolean;
}

/**
 * Request interceptor type
 */
export type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * Response interceptor type
 */
export type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;

/**
 * Circuit breaker state
 */
type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Circuit breaker implementation
 */
class CircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;

  constructor(private config: CircuitBreakerConfig) {}

  get isOpen(): boolean {
    return this.state === 'open';
  }

  get currentState(): CircuitBreakerState {
    return this.state;
  }

  canExecute(): boolean {
    if (this.state === 'closed') {
      return true;
    }
    
    if (this.state === 'open') {
      return Date.now() >= this.nextAttemptTime;
    }
    
    return true; // half-open
  }

  onSuccess(): void {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = 'closed';
        this.successes = 0;
      }
    }
  }

  onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'closed' && this.failures >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.timeout;
    } else if (this.state === 'half-open') {
      this.state = 'open';
      this.successes = 0;
      this.nextAttemptTime = Date.now() + this.config.timeout;
    }
  }

  onAttempt(): void {
    if (this.state === 'open' && Date.now() >= this.nextAttemptTime) {
      this.state = 'half-open';
      this.successes = 0;
    }
  }
}

/**
 * Clean HTTP Client Implementation
 * 
 * Provides enterprise-grade HTTP functionality with authentication, retry logic,
 * circuit breaker pattern, and comprehensive monitoring capabilities.
 */
export class HTTPClientNew extends TypedEventBase implements Client {
  public readonly config: HTTPClientConfig;
  public readonly type = 'http';
  public readonly version = '2.0.0';

  private http: AxiosInstance;
  private connected = false;
  private initialized = false;
  private circuitBreaker?: CircuitBreaker;
  private metrics: ClientMetrics;
  private startTime = Date.now();
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HTTPClientConfig) {
    super();
    this.config = { ...config };
    this.metrics = this.initializeMetrics();
    this.http = this.createAxiosInstance();
    
    if (this.config.circuitBreaker?.enabled) {
      this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    }
  }

  get isConnected(): boolean {
    return this.connected;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the HTTP client
   */
  async initialize(): Promise<void> {
    logger.info('Initializing HTTP client', { baseURL: this.config.baseURL });
    this.setupAuthentication();
    this.setupRetryLogic();
    this.setupInterceptors();
    this.initialized = true;
    this.emit('initialized', { timestamp: new Date() });
  }

  /**
   * Connect to the HTTP service
   */
  async connect(): Promise<void> {
    if (this.connected) {
      logger.debug('HTTP client already connected');
      return;
    }

    try {
      logger.info('Connecting HTTP client', { baseURL: this.config.baseURL });
      
      // Perform a health check to verify connectivity
      const healthResult = await this.healthCheck();
      if (healthResult.status !== 'healthy') {
        throw new Error('Health check failed during connection');
      }

      this.connected = true;
      this.emit('connected', { timestamp: new Date() });
      logger.info('HTTP client connected successfully');

    } catch (error) {
      logger.error('HTTP client connection failed', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from the HTTP service
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    logger.info('Disconnecting HTTP client');
    this.connected = false;
    this.emit('disconnected', { timestamp: new Date() });
  }

  /**
   * HTTP GET request
   */
  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<ClientResponse<T>> {
    return this.executeRequest('GET', endpoint, undefined, config);
  }

  /**
   * HTTP POST request
   */
  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ClientResponse<T>> {
    return this.executeRequest('POST', endpoint, data, config);
  }

  /**
   * HTTP PUT request
   */
  async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ClientResponse<T>> {
    return this.executeRequest('PUT', endpoint, data, config);
  }

  /**
   * HTTP PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ClientResponse<T>> {
    return this.executeRequest('PATCH', endpoint, data, config);
  }

  /**
   * HTTP DELETE request
   */
  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<ClientResponse<T>> {
    return this.executeRequest('DELETE', endpoint, undefined, config);
  }

  /**
   * HTTP HEAD request
   */
  async head(endpoint: string, config?: AxiosRequestConfig): Promise<ClientResponse> {
    return this.executeRequest('HEAD', endpoint, undefined, config);
  }

  /**
   * HTTP OPTIONS request
   */
  async options(endpoint: string, config?: AxiosRequestConfig): Promise<ClientResponse> {
    return this.executeRequest('OPTIONS', endpoint, undefined, config);
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date();
    const startTime = Date.now();

    try {
      // Try a lightweight HEAD request to check connectivity
      const response = await this.http.head('/');
      
      return {
        status: 'healthy',
        timestamp,
        responseTime: Date.now() - startTime,
        components: {
          http: {
            status: 'healthy',
            responseTime: Date.now() - startTime,
            message: `HTTP ${response.status} ${response.statusText}`
          }
        }
      };

    } catch (error) {
      const axiosError = error as AxiosError;
      const responseTime = Date.now() - startTime;

      // Some errors might still indicate a healthy service
      if (axiosError.response && axiosError.response.status < 500) {
        return {
          status: 'healthy',
          timestamp,
          responseTime,
          components: {
            http: {
              status: 'healthy',
              responseTime,
              message: `HTTP ${axiosError.response.status} ${axiosError.response.statusText}`
            }
          }
        };
      }

      return {
        status: 'unhealthy',
        timestamp,
        responseTime,
        components: {
          http: {
            status: 'unhealthy',
            message: axiosError.message || 'Unknown error'
          }
        }
      };
    }
  }

  /**
   * Get client metrics
   */
  async getMetrics(): Promise<ClientMetrics> {
    this.metrics.uptime = Date.now() - this.startTime;
    this.metrics.throughput = this.metrics.totalOperations / (this.metrics.uptime / 1000);
    
    if (this.circuitBreaker) {
      this.metrics.custom = {
        ...this.metrics.custom,
        circuitBreakerState: this.circuitBreaker.currentState
      };
    }

    return { ...this.metrics };
  }

  /**
   * Reset client metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();
  }

  /**
   * Configure the client
   */
  configure(config: Partial<HTTPClientConfig>): void {
    Object.assign(this.config, config);
    
    // Recreate axios instance with new configuration
    this.http = this.createAxiosInstance();
    this.setupAuthentication();
    this.setupRetryLogic();
    this.setupInterceptors();
    
    logger.info('HTTP client reconfigured');
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
    this.http.interceptors.request.use(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
    this.http.interceptors.response.use(interceptor);
  }

  /**
   * Shutdown the client
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down HTTP client');
    await this.disconnect();
    this.emit('shutdown', { timestamp: new Date() });
  }

  // Private helper methods

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers
      },
      validateStatus: this.config.validateStatus || ((status) => status >= 200 && status < 300),
      maxRedirects: this.config.maxRedirects || 5,
      decompress: this.config.compression !== false,
      ...(this.config.proxy && { proxy: this.config.proxy }),
      ...(this.config.ssl && { 
        httpsAgent: new (require('https')).Agent(this.config.ssl)
      })
    });

    return instance;
  }

  private setupAuthentication(): void {
    const auth = this.config.auth;
    if (!auth) return;

    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          this.http.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
        }
        break;

      case 'apikey':
        if (auth.apiKey) {
          const header = auth.apiKeyHeader || 'X-API-Key';
          this.http.defaults.headers.common[header] = auth.apiKey;
        }
        break;

      case 'basic':
        if (auth.username && auth.password) {
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          this.http.defaults.headers.common.Authorization = `Basic ${credentials}`;
        }
        break;

      case 'oauth2':
        if (auth.oauth2) {
          this.setupOAuth2Interceptor(auth.oauth2);
        }
        break;

      case 'custom':
        if (auth.customAuth) {
          this.http.interceptors.request.use(auth.customAuth);
        }
        break;
    }
  }

  private setupOAuth2Interceptor(oauth2Config: NonNullable<HTTPAuthConfig['oauth2']>): void {
    this.http.interceptors.request.use(async (config) => {
      let token = oauth2Config.accessToken;
      
      // Check if token needs refresh
      if (oauth2Config.expiresAt && new Date() >= oauth2Config.expiresAt) {
        token = await this.refreshOAuth2Token(oauth2Config);
      }
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    });
  }

  private async refreshOAuth2Token(oauth2Config: NonNullable<HTTPAuthConfig['oauth2']>): Promise<string | null> {
    try {
      const response = await axios.post(oauth2Config.tokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: oauth2Config.refreshToken,
        client_id: oauth2Config.clientId,
        client_secret: oauth2Config.clientSecret
      });

      const { access_token, refresh_token, expires_in } = response.data;
      
      oauth2Config.accessToken = access_token;
      if (refresh_token) oauth2Config.refreshToken = refresh_token;
      if (expires_in) {
        oauth2Config.expiresAt = new Date(Date.now() + expires_in * 1000);
      }

      return access_token;
    } catch (error) {
      logger.error('OAuth2 token refresh failed', error);
      this.emit('error', new Error(`OAuth2 token refresh failed: ${error}`));
      return null;
    }
  }

  private setupRetryLogic(): void {
    const retryConfig = this.config.retry;
    if (!retryConfig?.enabled) return;

    this.http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;
        
        if (!config || config._retryCount >= retryConfig.attempts) {
          return Promise.reject(error);
        }

        // Check if we should retry based on status code and method
        if (!this.shouldRetry(error, retryConfig)) {
          return Promise.reject(error);
        }

        config._retryCount = config._retryCount || 0;
        config._retryCount++;

        const delay = this.calculateRetryDelay(config._retryCount, retryConfig);
        
        this.emit('retry', {
          attempt: config._retryCount,
          delay,
          error: error.message,
          url: config.url
        });

        await this.delay(delay);
        return this.http(config);
      }
    );
  }

  private shouldRetry(error: AxiosError, retryConfig: HTTPRetryConfig): boolean {
    // Network errors should be retried
    if (!error.response) {
      return true;
    }

    const status = error.response.status;
    const method = error.config?.method?.toUpperCase();

    // Check retry status codes
    const retryStatusCodes = retryConfig.retryStatusCodes || [408, 429, 500, 502, 503, 504];
    if (!retryStatusCodes.includes(status)) {
      return false;
    }

    // Check retry methods
    const retryMethods = retryConfig.retryMethods || ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];
    if (method && !retryMethods.includes(method)) {
      return false;
    }

    return true;
  }

  private calculateRetryDelay(attempt: number, retryConfig: HTTPRetryConfig): number {
    const baseDelay = retryConfig.delay || 1000;
    let delay = baseDelay;

    switch (retryConfig.backoff) {
      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;
      case 'linear':
        delay = baseDelay * attempt;
        break;
      case 'fixed':
      default:
        delay = baseDelay;
        break;
    }

    // Apply maximum delay limit
    if (retryConfig.maxDelay) {
      delay = Math.min(delay, retryConfig.maxDelay);
    }

    // Add jitter to prevent thundering herd
    if (retryConfig.jitter) {
      delay += Math.random() * 1000;
    }

    return delay;
  }

  private setupInterceptors(): void {
    // Request logging
    this.http.interceptors.request.use((config) => {
      logger.debug('HTTP Request', { 
        method: config.method?.toUpperCase(), 
        url: config.url,
        headers: config.headers
      });
      return config;
    });

    // Response logging and metrics
    this.http.interceptors.response.use(
      (response) => {
        logger.debug('HTTP Response', { 
          status: response.status, 
          url: response.config.url,
          duration: Date.now() - (response.config as any)._requestStart
        });
        return response;
      },
      (error) => {
        logger.error('HTTP Error', { 
          message: error.message,
          status: error.response?.status,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  private async executeRequest<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ClientResponse<T>> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    // Check circuit breaker
    if (this.circuitBreaker && !this.circuitBreaker.canExecute()) {
      const error: ClientError = new Error('Circuit breaker is open') as any;
      error.code = 'CIRCUIT_BREAKER_OPEN';
      error.category = 'server';
      this.metrics.failedOperations++;
      throw error;
    }

    try {
      if (this.circuitBreaker) {
        this.circuitBreaker.onAttempt();
      }

      const requestConfig: AxiosRequestConfig = {
        method: method.toLowerCase() as any,
        url: endpoint,
        data,
        ...config,
        metadata: {
          _requestStart: startTime,
          ...config?.metadata
        }
      };

      const response: AxiosResponse<T> = await this.http.request(requestConfig);
      const duration = Date.now() - startTime;

      // Update metrics
      this.metrics.successfulOperations++;
      this.updateLatencyMetrics(duration);

      if (this.circuitBreaker) {
        this.circuitBreaker.onSuccess();
      }

      const clientResponse: ClientResponse<T> = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        config: response.config,
        duration,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          retryCount: (requestConfig as any)._retryCount || 0
        }
      };

      this.emit('response', clientResponse);
      return clientResponse;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.metrics.failedOperations++;
      this.updateLatencyMetrics(duration);

      if (this.circuitBreaker) {
        this.circuitBreaker.onFailure();
      }

      const clientError: ClientError = new Error(error.message) as any;
      clientError.code = error.code || 'HTTP_ERROR';
      clientError.status = error.response?.status;
      clientError.response = error.response?.data;
      clientError.config = error.config;
      clientError.retryable = this.isRetryableError(error);
      clientError.category = this.categorizeError(error);
      clientError.details = { originalError: error };

      this.emit('error', clientError);
      throw clientError;
    }
  }

  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) return true; // Network errors are retryable
    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
  }

  private categorizeError(error: AxiosError): ClientError['category'] {
    if (!error.response) return 'network';
    
    const status = error.response.status;
    if (status === 401) return 'authentication';
    if (status === 403) return 'authorization';
    if (status >= 400 && status < 500) return 'validation';
    if (status >= 500) return 'server';
    
    return 'unknown';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

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

  private updateLatencyMetrics(latency: number): void {
    const total = this.metrics.totalOperations;
    this.metrics.averageLatency = (this.metrics.averageLatency * (total - 1) + latency) / total;
  }
}

export default HTTPClientNew;