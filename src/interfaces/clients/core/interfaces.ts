/**
 * UACL (Unified API Client Layer) Core Interfaces
 * 
 * Provides unified abstractions for all client implementations:
 * - HTTP, WebSocket, GraphQL, gRPC clients
 * - Consistent authentication, retry, and monitoring patterns
 * - Factory pattern for client creation and management
 * - Health checks and performance monitoring
 */

/**
 * Authentication configuration for clients
 */
export interface AuthenticationConfig {
  type: 'bearer' | 'apikey' | 'oauth' | 'basic' | 'custom';
  
  // Bearer token auth
  token?: string;
  
  // API key auth
  apiKey?: string;
  apiKeyHeader?: string; // Default: 'X-API-Key'
  
  // OAuth credentials  
  credentials?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    scope?: string;
  };
  
  // Basic auth
  username?: string;
  password?: string;
  
  // Custom auth handler
  customAuth?: (request: any) => any;
}

/**
 * Retry configuration with multiple backoff strategies
 */
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Health check configuration
 */
export interface HealthConfig {
  endpoint: string;
  interval: number; // ms
  timeout: number; // ms
  failureThreshold: number;
  successThreshold: number;
}

/**
 * Performance monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number; // ms
  trackLatency: boolean;
  trackThroughput: boolean;
  trackErrors: boolean;
}

/**
 * Base client configuration
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
 * Client status information
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
 * Client performance metrics
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
 * Generic request options
 */
export interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  metadata?: Record<string, any>;
}

/**
 * Generic response wrapper
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
 * Core client interface that all clients must implement
 */
export interface IClient {
  // Configuration
  readonly config: ClientConfig;
  readonly name: string;
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Health monitoring
  healthCheck(): Promise<ClientStatus>;
  getMetrics(): Promise<ClientMetrics>;
  
  // Generic request methods
  get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
  post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
  put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
  delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
  
  // Configuration updates
  updateConfig(config: Partial<ClientConfig>): void;
  
  // Event handlers
  on(event: 'connect' | 'disconnect' | 'error' | 'retry', handler: (...args: any[]) => void): void;
  off(event: string, handler?: (...args: any[]) => void): void;
  
  // Cleanup
  destroy(): Promise<void>;
}

/**
 * Client factory interface for creating and managing clients
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
 * Client registry for global client management
 */
export interface IClientRegistry {
  // Factory registration
  registerFactory<T extends ClientConfig>(type: string, factory: IClientFactory<T>): void;
  getFactory<T extends ClientConfig>(type: string): IClientFactory<T> | undefined;
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
 * Error types for client operations
 */
export class ClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly client: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ClientError';
  }
}

export class ConnectionError extends ClientError {
  constructor(client: string, cause?: Error) {
    super(`Connection failed for client: ${client}`, 'CONNECTION_ERROR', client, cause);
    this.name = 'ConnectionError';
  }
}

export class AuthenticationError extends ClientError {
  constructor(client: string, cause?: Error) {
    super(`Authentication failed for client: ${client}`, 'AUTH_ERROR', client, cause);
    this.name = 'AuthenticationError';
  }
}

export class TimeoutError extends ClientError {
  constructor(client: string, timeout: number, cause?: Error) {
    super(`Request timeout (${timeout}ms) for client: ${client}`, 'TIMEOUT_ERROR', client, cause);
    this.name = 'TimeoutError';
  }
}

export class RetryExhaustedError extends ClientError {
  constructor(client: string, attempts: number, cause?: Error) {
    super(`Retry exhausted (${attempts} attempts) for client: ${client}`, 'RETRY_EXHAUSTED', client, cause);
    this.name = 'RetryExhaustedError';
  }
}

/**
 * Missing exports for compatibility
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
export type { ProtocolType, ClientStatus } from '../types';