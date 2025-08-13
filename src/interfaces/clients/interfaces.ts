/**
 * Unified API Client Layer (UACL) - Core Interfaces.
 *
 * Provides generic interfaces for standardizing client access across all protocols.
 * Including HTTP (REST API), WebSocket (Real-time), Knowledge (FACT integration),
 * MCP (Model Context Protocol), and any other client communication mechanisms.
 */

import type { ProtocolType } from '../../types/protocol-types.ts';

/**
 * Generic client interface for standardized API access.
 *
 * @template T The request/response type this client handles.
 * @example
 */
/**
 * @file Interface implementation: interfaces.
 */

export interface IClient<T = any> {
  /** Connect to the service */
  connect(): Promise<void>;

  /** Disconnect from the service */
  disconnect(): Promise<void>;

  /** Send data and receive response */
  send<R = any>(data: T): Promise<R>;

  /** Check client health */
  health(): Promise<boolean>;

  /** Get client configuration */
  getConfig(): ClientConfig;

  /** Get current connection status */
  isConnected(): boolean;

  /** Get protocol-specific metadata */
  getMetadata(): Promise<ClientMetadata>;
}

/**
 * Client factory interface for creating protocol-specific clients.
 *
 * @example
 */
export interface IClientFactory {
  /** Create a client instance */
  create(protocol: ProtocolType, config: ClientConfig): Promise<IClient>;

  /** Check if factory supports a protocol */
  supports(protocol: ProtocolType): boolean;

  /** Get supported protocols */
  getSupportedProtocols(): ProtocolType[];

  /** Validate configuration for a protocol */
  validateConfig(protocol: ProtocolType, config: ClientConfig): boolean;
}

/**
 * Specialized interface for HTTP clients (REST API).
 *
 * @example
 */
export interface IHttpClient<T = any> extends IClient<T> {
  /** GET request */
  get<R = any>(
    path: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<R>;

  /** POST request */
  post<R = any>(path: string, data?: T, options?: RequestOptions): Promise<R>;

  /** PUT request */
  put<R = any>(path: string, data?: T, options?: RequestOptions): Promise<R>;

  /** DELETE request */
  delete<R = any>(path: string, options?: RequestOptions): Promise<R>;

  /** PATCH request */
  patch<R = any>(
    path: string,
    data?: Partial<T>,
    options?: RequestOptions
  ): Promise<R>;

  /** Set request headers */
  setHeaders(headers: Record<string, string>): void;

  /** Set authentication */
  setAuth(auth: AuthConfig): void;

  /** Get response headers from last request */
  getLastResponseHeaders(): Record<string, string>;
}

/**
 * Specialized interface for WebSocket clients (Real-time).
 *
 * @example
 */
export interface IWebSocketClient<T = any> extends IClient<T> {
  /** Subscribe to events */
  subscribe(event: string, callback: (data: T) => void): Promise<string>;

  /** Unsubscribe from events */
  unsubscribe(subscriptionId: string): Promise<void>;

  /** Emit event to server */
  emit(event: string, data: T): Promise<void>;

  /** Get active subscriptions */
  getSubscriptions(): Promise<WebSocketSubscription[]>;

  /** Check if subscribed to event */
  isSubscribed(event: string): boolean;

  /** Get connection statistics */
  getConnectionStats(): Promise<WebSocketStats>;

  /** Set reconnection options */
  setReconnectOptions(options: ReconnectOptions): void;
}

/**
 * Specialized interface for Knowledge clients (FACT integration).
 *
 * @example
 */
export interface IKnowledgeClient<T = any> extends IClient<T> {
  /** Query knowledge base */
  query<R = any>(query: string, options?: KnowledgeQueryOptions): Promise<R>;

  /** Search knowledge entries */
  search<R = any>(
    searchTerm: string,
    options?: KnowledgeSearchOptions
  ): Promise<R[]>;

  /** Get knowledge entry by ID */
  getEntry<R = any>(id: string): Promise<R | null>;

  /** Add knowledge entry */
  addEntry(data: T): Promise<string>;

  /** Update knowledge entry */
  updateEntry(id: string, data: Partial<T>): Promise<boolean>;

  /** Delete knowledge entry */
  deleteEntry(id: string): Promise<boolean>;

  /** Get knowledge statistics */
  getKnowledgeStats(): Promise<KnowledgeStats>;

  /** Execute semantic search */
  semanticSearch<R = any>(
    query: string,
    options?: SemanticSearchOptions
  ): Promise<R[]>;
}

/**
 * Specialized interface for MCP clients (Model Context Protocol).
 *
 * @example.
 * @example
 */
export interface IMcpClient<T = any> extends IClient<T> {
  /** List available tools */
  listTools(): Promise<McpTool[]>;

  /** Execute tool */
  executeTool<R = any>(
    toolName: string,
    parameters: Record<string, unknown>
  ): Promise<R>;

  /** Get tool schema */
  getToolSchema(toolName: string): Promise<McpToolSchema>;

  /** Subscribe to tool notifications */
  subscribeToNotifications(
    callback: (notification: McpNotification) => void
  ): Promise<string>;

  /** Get server capabilities */
  getCapabilities(): Promise<McpCapabilities>;

  /** Initialize MCP session */
  initialize(clientInfo: McpClientInfo): Promise<McpInitResult>;

  /** Get protocol version */
  getProtocolVersion(): string;
}

/**
 * Generic client configuration.
 *
 * @example
 */
export interface ClientConfig {
  /** Protocol type */
  protocol: ProtocolType;

  /** Base URL or connection string */
  url: string;

  /** Connection timeout in milliseconds */
  timeout?: number;

  /** Retry configuration */
  retry?: RetryConfig;

  /** Authentication configuration */
  auth?: AuthConfig;

  /** Request headers */
  headers?: Record<string, string>;

  /** Protocol-specific options */
  options?: Record<string, unknown>;

  /** Health check configuration */
  healthCheck?: HealthCheckConfig;

  /** Logging configuration */
  logging?: ClientLoggingConfig;
}

/**
 * Request options for HTTP clients.
 *
 * @example
 */
export interface RequestOptions {
  /** Request timeout */
  timeout?: number;

  /** Additional headers */
  headers?: Record<string, string>;

  /** Query parameters */
  params?: Record<string, unknown>;

  /** Request body type */
  contentType?: string;

  /** Response type expected */
  responseType?: 'json' | 'text' | 'blob' | 'stream';

  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Authentication configuration.
 *
 * @example
 */
export interface AuthConfig {
  /** Authentication type */
  type: 'bearer' | 'basic' | 'api-key' | 'oauth' | 'custom';

  /** Token or key */
  token?: string;

  /** Username for basic auth */
  username?: string;

  /** Password for basic auth */
  password?: string;

  /** API key field name */
  keyField?: string;

  /** Custom authentication headers */
  customHeaders?: Record<string, string>;
}

/**
 * Retry configuration.
 *
 * @example
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries: number;

  /** Initial delay between retries */
  initialDelay: number;

  /** Backoff multiplier */
  backoffMultiplier: number;

  /** Maximum delay between retries */
  maxDelay: number;

  /** Retry on these HTTP status codes */
  retryOn?: number[];

  /** Custom retry condition */
  retryCondition?: (error: unknown) => boolean;
}

/**
 * Health check configuration.
 *
 * @example
 */
export interface HealthCheckConfig {
  /** Health check endpoint */
  endpoint?: string;

  /** Health check interval */
  interval?: number;

  /** Health check timeout */
  timeout?: number;

  /** Expected response for healthy status */
  expectedResponse?: unknown;

  /** Custom health check function */
  customCheck?: () => Promise<boolean>;
}

/**
 * Client logging configuration.
 *
 * @example
 */
export interface ClientLoggingConfig {
  /** Enable request logging */
  logRequests: boolean;

  /** Enable response logging */
  logResponses: boolean;

  /** Enable error logging */
  logErrors: boolean;

  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error';

  /** Log sensitive data */
  logSensitiveData: boolean;
}

/**
 * Client metadata.
 *
 * @example
 */
export interface ClientMetadata {
  /** Protocol type */
  protocol: ProtocolType;

  /** Client version */
  version: string;

  /** Supported features */
  features: string[];

  /** Connection details */
  connection: {
    url: string;
    connected: boolean;
    lastConnected?: Date;
    connectionDuration?: number;
  };

  /** Performance metrics */
  metrics: ClientMetrics;

  /** Additional metadata */
  custom?: Record<string, unknown>;
}

/**
 * Client performance metrics.
 *
 * @example
 */
export interface ClientMetrics {
  /** Total requests sent */
  totalRequests: number;

  /** Successful requests */
  successfulRequests: number;

  /** Failed requests */
  failedRequests: number;

  /** Average response time */
  averageResponseTime: number;

  /** Last request timestamp */
  lastRequestTime?: Date;

  /** Connection uptime */
  uptime: number;

  /** Bytes sent */
  bytesSent: number;

  /** Bytes received */
  bytesReceived: number;
}

/**
 * WebSocket specific types.
 *
 * @example
 */
export interface WebSocketSubscription {
  id: string;
  event: string;
  callback: (data: unknown) => void;
  subscribed: Date;
}

export interface WebSocketStats {
  connected: boolean;
  connectionTime: Date;
  messagesReceived: number;
  messagesSent: number;
  subscriptionsActive: number;
  reconnectCount: number;
  lastHeartbeat?: Date;
}

export interface ReconnectOptions {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Knowledge client specific types.
 *
 * @example
 */
export interface KnowledgeQueryOptions {
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeMetadata?: boolean;
}

export interface KnowledgeSearchOptions extends KnowledgeQueryOptions {
  fuzzy?: boolean;
  threshold?: number;
  fields?: string[];
}

export interface SemanticSearchOptions extends KnowledgeQueryOptions {
  vectorSearch?: boolean;
  similarity?: 'cosine' | 'euclidean' | 'dot';
  threshold?: number;
}

export interface KnowledgeStats {
  totalEntries: number;
  totalSize: number;
  lastUpdated: Date;
  categories: Record<string, number>;
  averageResponseTime: number;
  indexHealth: number;
}

/**
 * MCP client specific types.
 *
 * @example
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface McpToolSchema {
  type: string;
  properties: Record<string, unknown>;
  required?: string[];
}

export interface McpNotification {
  method: string;
  params?: Record<string, unknown>;
  timestamp: Date;
}

export interface McpCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: {};
}

export interface McpClientInfo {
  name: string;
  version: string;
  capabilities?: Record<string, unknown>;
}

export interface McpInitResult {
  protocolVersion: string;
  capabilities: McpCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
}

/**
 * Error types for client operations.
 *
 * @example
 */
export interface ClientError extends Error {
  code: string;
  protocol: ProtocolType;
  statusCode?: number;
  details?: Record<string, unknown>;
  retryable?: boolean;
}

/**
 * Client health status.
 *
 * @example
 */
export interface ClientHealthStatus {
  healthy: boolean;
  protocol: ProtocolType;
  url: string;
  responseTime: number;
  lastCheck: Date;
  errors?: string[];
  details?: Record<string, unknown>;
}

/**
 * Transaction operation for multi-client operations.
 *
 * @example
 */
export interface ClientTransaction {
  id: string;
  operations: ClientOperation[];
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: ClientError;
}

export interface ClientOperation {
  client: string;
  method: string;
  data: unknown;
  options?: Record<string, unknown>;
  result?: unknown;
  error?: ClientError;
}
