/**
 * HTTP Client Adapter for UACL (Unified API Client Layer).
 *
 * Converts existing HTTP APIClient to UACL architecture while maintaining.
 * Backward compatibility and adding enterprise-grade features..
 *
 * @file HTTP client adapter implementing the UACL IClient interface.
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
 * ```typescript.
 * import { HTTPClientAdapter } from './http-client-adapter.ts';
 * import type { HTTPClientConfig } from './http-types.ts';
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
 *     token: process.env['API_TOKEN']
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
import { EventEmitter } from 'node:events';
import { type AxiosInstance } from 'axios';
import type { ClientMetrics, ClientResponse, ClientStatus, IClient, RequestOptions } from '../core/interfaces.ts';
import type { HTTPClientCapabilities, HTTPClientConfig } from './http-types.ts';
/**
 * HTTP Client Adapter implementing UACL IClient interface.
 *
 * @class HTTPClientAdapter
 * @augments EventEmitter
 * @implements {IClient}
 * @description Production-ready HTTP client adapter providing enterprise-grade features
 *              including authentication, retry logic, health monitoring, and comprehensive metrics.
 *              Built on Axios with additional UACL-specific enhancements for reliability and observability.
 * @property {HTTPClientConfig} config - Client configuration (read-only).
 * @property {string} name - Client identifier (read-only).
 * @property {AxiosInstance} http - Underlying Axios instance (private).
 * @property {boolean} connected - Connection status (private).
 * @property {ClientMetrics} metrics - Performance metrics (private).
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
 *       clientId: process.env['CLIENT_ID'],
 *       clientSecret: process.env['CLIENT_SECRET'],
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
export declare class HTTPClientAdapter extends EventEmitter implements IClient {
    readonly config: HTTPClientConfig;
    readonly name: string;
    private http;
    private connected;
    private metrics;
    private healthTimer?;
    private metricsTimer?;
    private requestCount;
    private successCount;
    private errorCount;
    private latencySum;
    private latencies;
    private startTime;
    /**
     * Create new HTTP Client Adapter instance.
     *
     * @param {HTTPClientConfig} config - HTTP client configuration.
     * @param {string} config.name - Unique client identifier.
     * @param {string} config.baseURL - Base URL for all HTTP requests.
     * @param {number} [config.timeout=30000] - Request timeout in milliseconds.
     * @param {AuthenticationConfig} [config.authentication] - Authentication configuration.
     * @param {RetryConfig} [config.retry] - Retry configuration.
     * @param {HealthConfig} [config.health] - Health check configuration.
     * @param {MonitoringConfig} [config.monitoring] - Monitoring configuration.
     * @param {Record<string, string>} [config.headers] - Default headers.
     * @throws {Error} If required configuration is missing or invalid.
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
    constructor(config: HTTPClientConfig);
    /**
     * Create configured Axios instance with UACL patterns.
     */
    private createHttpClient;
    /**
     * Setup authentication based on configuration.
     */
    private setupAuthentication;
    /**
     * Setup OAuth token management.
     */
    private setupOAuthInterceptor;
    /**
     * Get valid OAuth token (refresh if needed).
     */
    private getValidOAuthToken;
    /**
     * Setup retry logic with UACL patterns.
     */
    private setupRetryLogic;
    /**
     * Determine if request should be retried.
     */
    private shouldRetry;
    /**
     * Calculate retry delay with backoff strategy.
     */
    private calculateRetryDelay;
    /**
     * Setup error handling with UACL error types.
     */
    private setupErrorHandling;
    /**
     * Setup custom interceptors from configuration.
     */
    private setupInterceptors;
    /**
     * Setup metrics collection.
     */
    private setupMetricsCollection;
    /**
     * Record successful request metrics.
     */
    private recordSuccess;
    /**
     * Record failed request metrics.
     */
    private recordError;
    /**
     * Record request latency.
     */
    private recordLatency;
    /**
     * Initialize metrics object.
     */
    private initializeMetrics;
    /**
     * Start monitoring timers.
     */
    private startMonitoring;
    /**
     * Start health check timer.
     */
    private startHealthChecks;
    /**
     * Update metrics calculations.
     */
    private updateMetrics;
    /**
     * Calculate latency percentile.
     */
    private calculatePercentile;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    healthCheck(): Promise<ClientStatus>;
    getMetrics(): Promise<ClientMetrics>;
    get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
    post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
    put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
    delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
    updateConfig(newConfig: Partial<HTTPClientConfig>): void;
    destroy(): Promise<void>;
    /**
     * Build Axios configuration from UACL options.
     */
    private buildAxiosConfig;
    /**
     * Transform Axios response to UACL ClientResponse.
     */
    private transformResponse;
    /**
     * Get client capabilities.
     */
    getCapabilities(): HTTPClientCapabilities;
    /**
     * Get underlying Axios instance (for advanced use cases).
     */
    getAxiosInstance(): AxiosInstance;
}
//# sourceMappingURL=http-client-adapter.d.ts.map