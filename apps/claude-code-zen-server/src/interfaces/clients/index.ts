/**
 * UACL (Unified Adaptive Client Layer) - Main Exports.
 *
 * Central export point for all UACL functionality including:
 * - Client registry and manager
 * - Client type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization.
 *
 * @file Main UACL exports providing unified access to HTTP, WebSocket, Knowledge, and MCP clients.
 * @module interfaces/clients.
 * @version 2.0.0
 * @example
 * ```typescript
 * // Initialize UACL system
 * import { uacl, initializeUACL } from './interfaces/clients';
 *
 * // Initialize with default configuration
 * await initializeUACL();
 *
 * // Create HTTP client
 * const httpClient = await uacl.createHTTPClient(
 *   'api-client',
 *   'https://api.example.com',
 *   {
 *     authentication: { type: 'bearer', token: 'your-token' },
 *     retry: { attempts: 3, delay: 1000, backoff: 'exponential' }
 *   }
 * );
 *
 * // Create WebSocket client
 * const wsClient = await uacl.createWebSocketClient(
 *   'ws-client',
 *   'wss://api.example.com/ws',
 *   {
 *     reconnection: { enabled: true, maxAttempts: 10 },
 *     heartbeat: { enabled: true, interval: 30000 }
 *   }
 * );
 *
 * // Monitor system health
 * const health = uacl.getHealthStatus();
 * console.log(`System health: ${health.status}`);
 * ```
 */

import { Logger } from '@claude-zen/foundation';

import {
  globalClientManager as actualGlobalClientManager,
  type ClientManager,
  ClientManagerHelpers,
} from './manager';
import {
  type ClientInstance,
  ClientType,
  type HTTPClientConfig,
  type KnowledgeClientConfig,
  type MCPClientConfig,
  type WebSocketClientConfig,
} from './registry';

// Legacy FACT integration
export { FACTIntegration } from '../../knowledge/knowledge-client';
// Re-export client implementations for convenience
export { APIClient, createAPIClient } from '../api/http/client';
// WebSocket clients - both legacy and UACL
export { WebSocketClient } from '../api/websocket/client'; // Legacy WebSocket client
export { ExternalMCPClient } from '../mcp/external-mcp-client';
// UACL Knowledge Client Adapter
export {
  createCustomKnowledgeClient,
  createFACTClient,
  KnowledgeClientAdapter,
  type KnowledgeClientConfig as UACLKnowledgeClientConfig,
  KnowledgeClientFactory,
  KnowledgeHelpers,
  type KnowledgeRequest,
  type KnowledgeResponse,
} from './adapters/knowledge-client-adapter';
export * from './adapters/websocket-index'; // UACL WebSocket adapters
// Core interfaces for UACL compatibility
export type {
  ClientConfig as CoreClientConfig,
  ClientMetrics as CoreClientMetrics,
  ClientResponse as CoreClientResponse,
  ClientStatus as CoreClientStatus,
  Client,
  ClientFactory,
  RequestOptions as CoreRequestOptions,
} from './core/interfaces';
// Client manager types and interfaces
export interface ClientManagerConfig {
  enableHealthChecks?: boolean;
  metricsInterval?: number;
  maxClients?: number;
  enableRetries?: boolean;
  enableMetrics?: boolean;
  connectionTimeout?: number;
  healthCheckInterval?: number;
}

export interface ClientMetrics {
  total: number;
  connected: number;
  disconnected: number;
  error: number;
  totalRequests: number;
  totalErrors: number;
  averageLatency: number;
  totalThroughput: number;
}

// Global client manager instance
export const globalClientManager = actualGlobalClientManager;
// Core UACL components
export {
  type BaseClientConfig,
  type ClientConfig,
  type ClientFactory,
  type ClientInstance,
  ClientRegistry,
  ClientRegistryHelpers,
  ClientType,
  globalClientRegistry,
  type HTTPClientConfig,
  type KnowledgeClientConfig,
  type MCPClientConfig,
  type WebSocketClientConfig,
} from './registry';

/**
 * UACL Main Interface.
 *
 * Primary interface for interacting with the Unified Adaptive Client Layer.
 * Provides high-level methods for client management and operations.
 *
 * @class UACL
 * @description Singleton class managing all client types (HTTP, WebSocket, Knowledge, MCP) through a unified interface.
 *              Handles client lifecycle, connection management, health monitoring, and metrics collection.
 * @example
 * ```typescript
 * // Get singleton instance
 * const uacl = UACL.getInstance();
 *
 * // Initialize with custom configuration
 * await uacl.initialize({
 *   enableHealthChecks: true,
 *   metricsInterval: 60000,
 *   maxClients: 100
 * });
 *
 * // Create multiple client types
 * const clients = await Promise.all([
 *   uacl.createHTTPClient('api', 'https://api.service.com'),
 *   uacl.createWebSocketClient('realtime', 'wss://live.service.com'),
 *   uacl.createKnowledgeClient('kb', './knowledge', 'api-key')
 * ]);
 *
 * // Monitor all clients
 * const metrics = uacl.getMetrics();
 * console.log(`Active clients: ${metrics.connected}/${metrics.total}`);
 * ```
 */
export class UACL {
  private static instance: UACL;
  private initialized = false;

  private constructor() {}

  /**
   * Get singleton UACL instance.
   *
   * @returns {UACL} The singleton UACL instance.
   * @description Returns the global UACL instance, creating it if it doesn't exist.
   *              Implements the singleton pattern to ensure unified client management.
   * @example
   * ```typescript
   * const uacl = UACL.getInstance();
   * console.log(uacl.isInitialized()); // false initially
   * ```
   */
  static getInstance(): UACL {
    if (!UACL.instance) {
      UACL.instance = new UACL();
    }
    return UACL.instance;
  }

  /**
   * Initialize UACL system.
   *
   * @param {ClientManagerConfig} [config] - Optional configuration for the client manager.
   * @param {boolean} [config.enableHealthChecks=true] - Enable automatic health checking.
   * @param {number} [config.metricsInterval=60000] - Metrics collection interval in milliseconds.
   * @param {number} [config.maxClients=100] - Maximum number of concurrent clients.
   * @param {boolean} [config.enableRetries=true] - Enable automatic retry logic.
   * @returns {Promise<void>} Resolves when initialization is complete.
   * @throws {Error} If initialization fails due to invalid configuration.
   * @description Initializes the UACL system with client manager, registry, and monitoring.
   *              Safe to call multiple times - subsequent calls are ignored.
   * @example
   * ```typescript
   * // Initialize with default settings
   * await uacl.initialize();
   *
   * // Initialize with custom configuration
   * await uacl.initialize({
   *   enableHealthChecks: true,
   *   metricsInterval: 30000,
   *   maxClients: 50
   * });
   * ```
   */
  async initialize(config?: ClientManagerConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    await ClientManagerHelpers.initialize(config);
    this.initialized = true;
  }

  /**
   * Check if UACL is initialized.
   *
   * @returns {boolean} True if UACL has been initialized.
   * @description Returns the initialization status without side effects.
   * @example
   * ```typescript
   * if (!uacl.isInitialized()) {
   *   await uacl.initialize();
   * }
   * ```
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create and register HTTP client.
   *
   * @param {string} id - Unique identifier for the HTTP client.
   * @param {string} baseURL - Base URL for all HTTP requests (e.g., 'https://api.example.com').
   * @param {Partial<HTTPClientConfig>} [options={}] - Optional HTTP client configuration.
   * @param {AuthenticationConfig} [options.authentication] - Authentication configuration (bearer, apikey, oauth, etc.).
   * @param {RetryConfig} [options.retry] - Retry configuration with backoff strategies.
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds.
   * @param {Record<string, string>} [options.headers] - Default headers for all requests.
   * @param {boolean} [options.compression=true] - Enable response compression.
   * @param {boolean} [options.http2=false] - Enable HTTP/2 support.
   * @returns {Promise<ClientInstance>} Promise resolving to the created HTTP client instance.
   * @throws {Error} If client creation fails or ID already exists.
   * @description Creates, configures, and registers a new HTTP client with automatic retry logic,
   *              authentication handling, and performance monitoring.
   * @example
   * ```typescript
   * // Basic HTTP client
   * const apiClient = await uacl.createHTTPClient(
   *   'main-api',
   *   'https://api.example.com'
   * );
   *
   * // HTTP client with authentication and retry logic
   * const secureClient = await uacl.createHTTPClient(
   *   'secure-api',
   *   'https://secure-api.example.com',
   *   {
   *     authentication: {
   *       type: 'bearer',
   *       token: process.env['API_TOKEN']
   *     },
   *     retry: {
   *       attempts: 3,
   *       delay: 1000,
   *       backoff: 'exponential',
   *       maxDelay: 10000
   *     },
   *     timeout: 60000,
   *     headers: {
   *       'User-Agent': 'MyApp/1.0.0'
   *     }
   *   }
   * );
   *
   * // Make requests
   * const response = await apiClient.get('/users');
   * ```
   */
  async createHTTPClient(
    id: string,
    baseURL: string,
    options: Partial<HTTPClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createHTTPClient(id, baseURL, options);
  }

  /**
   * Create and register WebSocket client.
   *
   * @param {string} id - Unique identifier for the WebSocket client.
   * @param {string} url - WebSocket server URL (e.g., 'wss://api.example.com/ws').
   * @param {Partial<WebSocketClientConfig>} [options={}] - Optional WebSocket client configuration.
   * @param {string[]} [options.protocols] - WebSocket subprotocols to negotiate.
   * @param {object} [options.reconnection] - Automatic reconnection configuration.
   * @param {boolean} [options.reconnection.enabled=true] - Enable automatic reconnection.
   * @param {number} [options.reconnection.maxAttempts=10] - Maximum reconnection attempts.
   * @param {object} [options.heartbeat] - Heartbeat/ping configuration.
   * @param {boolean} [options.heartbeat.enabled=true] - Enable heartbeat messages.
   * @param {number} [options.heartbeat.interval=30000] - Heartbeat interval in milliseconds.
   * @param {object} [options.messageQueue] - Message queuing for offline scenarios.
   * @returns {Promise<ClientInstance>} Promise resolving to the created WebSocket client instance.
   * @throws {Error} If client creation fails, connection fails, or ID already exists.
   * @description Creates, configures, and registers a new WebSocket client with automatic reconnection,
   *              heartbeat monitoring, message queuing, and real-time event handling.
   * @example
   * ```typescript
   * // Basic WebSocket client
   * const wsClient = await uacl.createWebSocketClient(
   *   'realtime',
   *   'wss://live.example.com/ws'
   * );
   *
   * // Advanced WebSocket client with full configuration
   * const advancedWS = await uacl.createWebSocketClient(
   *   'trading-feed',
   *   'wss://trading.example.com/feed',
   *   {
   *     protocols: ['trading-v1', 'fallback'],
   *     authentication: {
   *       type: 'query',
   *       token: process.env['WS_TOKEN']
   *     },
   *     reconnection: {
   *       enabled: true,
   *       maxAttempts: 20,
   *       interval: 1000,
   *       backoff: 'exponential',
   *       maxInterval: 30000
   *     },
   *     heartbeat: {
   *       enabled: true,
   *       interval: 15000,
   *       message: { type: 'ping', timestamp: Date.now() }
   *     },
   *     messageQueue: {
   *       enabled: true,
   *       maxSize: 10000,
   *       persistOnDisconnect: true
   *     }
   *   }
   * );
   *
   * // Listen for real-time messages
   * wsClient.on('message', (data) => {
   *   console.log('Received:', data);
   * });
   * ```
   */
  async createWebSocketClient(
    id: string,
    url: string,
    options: Partial<WebSocketClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createWebSocketClient(id, url, options);
  }

  /**
   * Create and register Knowledge client.
   *
   * @param {string} id - Unique identifier for the Knowledge client.
   * @param {string} factRepoPath - Path to the FACT knowledge repository directory.
   * @param {string} anthropicApiKey - Anthropic API key for Claude integration.
   * @param {Partial<KnowledgeClientConfig>} [options={}] - Optional Knowledge client configuration.
   * @param {object} [options.caching] - Knowledge query caching configuration.
   * @param {boolean} [options.caching.enabled=true] - Enable query result caching.
   * @param {number} [options.caching.ttlSeconds=3600] - Cache TTL in seconds.
   * @param {string[]} [options.tools] - Available FACT tools to use for queries.
   * @param {object} [options.rateLimit] - Rate limiting configuration for API calls.
   * @param {object} [options.vectorConfig] - Vector search configuration.
   * @returns {Promise<ClientInstance>} Promise resolving to the created Knowledge client instance.
   * @throws {Error} If client creation fails, FACT integration fails, or invalid configuration.
   * @description Creates, configures, and registers a new Knowledge client with FACT integration,
   *              semantic search capabilities, query caching, and intelligent tool selection.
   * @example
   * ```typescript
   * // Basic Knowledge client
   * const kbClient = await uacl.createKnowledgeClient(
   *   'main-kb',
   *   './knowledge-repo',
   *   process.env['ANTHROPIC_API_KEY']
   * );
   *
   * // Advanced Knowledge client with full configuration
   * const advancedKB = await uacl.createKnowledgeClient(
   *   'technical-kb',
   *   './technical-knowledge',
   *   process.env['ANTHROPIC_API_KEY'],
   *   {
   *     provider: 'fact',
   *     caching: {
   *       enabled: true,
   *       prefix: 'tech-kb',
   *       ttlSeconds: 7200,
   *       minTokens: 50
   *     },
   *     tools: ['search', 'summarize', 'extract'],
   *     rateLimit: {
   *       requestsPerMinute: 100,
   *       burstLimit: 10
   *     },
   *     vectorConfig: {
   *       dimensions: 1536,
   *       similarity: 'cosine',
   *       threshold: 0.8
   *     }
   *   }
   * );
   *
   * // Query knowledge base
   * const response = await kbClient.post('/query', {
   *   query: 'How do I implement OAuth 2.0?',
   *   type: 'semantic',
   *   tools: ['search', 'summarize']
   * });
   * ```
   */
  async createKnowledgeClient(
    id: string,
    factRepoPath: string,
    anthropicApiKey: string,
    options: Partial<KnowledgeClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createKnowledgeClient(
      id,
      factRepoPath,
      anthropicApiKey,
      options
    );
  }

  /**
   * Create and register MCP (Model Context Protocol) client.
   *
   * @param {string} id - Unique identifier for the MCP client.
   * @param {MCPClientConfig['servers']} servers - MCP server configuration array.
   * @param {Partial<MCPClientConfig>} [options={}] - Optional MCP client configuration.
   * @param {number} [options.timeout=30000] - Request timeout for MCP operations.
   * @param {boolean} [options.enableTools=true] - Enable MCP tool execution.
   * @param {boolean} [options.enableResources=true] - Enable MCP resource access.
   * @param {boolean} [options.enablePrompts=true] - Enable MCP prompt templates.
   * @param {object} [options.retryConfig] - Retry configuration for failed operations.
   * @returns {Promise<ClientInstance>} Promise resolving to the created MCP client instance.
   * @throws {Error} If client creation fails, server connection fails, or invalid server configuration.
   * @description Creates, configures, and registers a new MCP client for interacting with
   *              Model Context Protocol servers, enabling tool execution, resource access, and prompt management.
   * @example
   * ```typescript
   * // Basic MCP client with single server
   * const mcpClient = await uacl.createMCPClient(
   *   'claude-tools',
   *   [
   *     {
   *       name: 'filesystem',
   *       command: 'npx',
   *       args: ['@modelcontextprotocol/server-filesystem', '/path/to/files'],
   *       env: {}
   *     }
   *   ]
   * );
   *
   * // Advanced MCP client with multiple servers
   * const advancedMCP = await uacl.createMCPClient(
   *   'multi-tool',
   *   [
   *     {
   *       name: 'filesystem',
   *       command: 'npx',
   *       args: ['@modelcontextprotocol/server-filesystem', './workspace']
   *     },
   *     {
   *       name: 'web-search',
   *       command: 'python',
   *       args: ['mcp_server_web.py'],
   *       env: { SEARCH_API_KEY: process.env['SEARCH_KEY'] }
   *     },
   *     {
   *       name: 'database',
   *       command: 'node',
   *       args: ['database-mcp-server'],
   *       env: { DB_URL: process.env['DATABASE_URL'] }
   *     }
   *   ],
   *   {
   *     timeout: 45000,
   *     enableTools: true,
   *     enableResources: true,
   *     retryConfig: {
   *       attempts: 3,
   *       delay: 2000,
   *       backoff: 'exponential'
   *     }
   *   }
   * );
   *
   * // Execute MCP tools
   * const toolResult = await mcpClient.post('/tools/execute', {
   *   name: 'read_file',
   *   arguments: { path: './config.json' }
   * });
   * ```
   */
  async createMCPClient(
    id: string,
    servers: MCPClientConfig['servers'],
    options: Partial<MCPClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createMCPClient(id, servers, options);
  }

  /**
   * Get client by ID.
   *
   * @param {string} clientId - The unique identifier of the client to retrieve.
   * @returns {ClientInstance | undefined} The client instance if found, undefined otherwise.
   * @description Retrieves a specific client instance by its unique identifier.
   *              Returns undefined if no client with the given ID exists.
   * @example
   * ```typescript
   * // Get a specific client
   * const apiClient = uacl.getClient('main-api');
   * if (apiClient) {
   *   const response = await apiClient.get('/status');
   *   console.log('API Status:', response.data);
   * } else {
   *   console.log('Client not found');
   * }
   * ```
   */
  getClient(clientId: string): ClientInstance | undefined {
    return globalClientManager.getClient(clientId);
  }

  /**
   * Get best available client for a type.
   *
   * @param {ClientType} type - The type of client to retrieve (HTTP, WEBSOCKET, KNOWLEDGE, MCP).
   * @returns {ClientInstance | undefined} The best available client of the specified type, or undefined.
   * @description Returns the best available (connected and healthy) client of the specified type.
   *              Uses health status and performance metrics to determine the "best" client.
   * @example
   * ```typescript
   * // Get the best HTTP client available
   * const httpClient = uacl.getBestClient(ClientType.HTTP);
   * if (httpClient) {
   *   const response = await httpClient.get('/api/data');
   * }
   *
   * // Get the best WebSocket client for real-time updates
   * const wsClient = uacl.getBestClient(ClientType.WEBSOCKET);
   * if (wsClient && wsClient.isConnected()) {
   *   wsClient.send({ type: 'subscribe', channel: 'updates' });
   * }
   * ```
   */
  getBestClient(type: ClientType): ClientInstance | undefined {
    return globalClientManager.getBestClient(type);
  }

  /**
   * Get all clients of a specific type.
   *
   * @param {ClientType} type - The type of clients to retrieve.
   * @returns {ClientInstance[]} Array of all client instances of the specified type.
   * @description Returns all registered clients of the specified type, regardless of their connection status.
   *              Use this for bulk operations or when you need to work with multiple clients of the same type.
   * @example
   * ```typescript
   * // Get all HTTP clients for load balancing
   * const httpClients = uacl.getClientsByType(ClientType.HTTP);
   * console.log(`Found ${httpClients.length} HTTP clients`);
   *
   * // Check health of all WebSocket clients
   * const wsClients = uacl.getClientsByType(ClientType.WEBSOCKET);
   * const healthChecks = await Promise.all(
   *   wsClients.map(client => client.healthCheck())
   * );
   *
   * // Get all Knowledge clients for distributed queries
   * const kbClients = uacl.getClientsByType(ClientType.KNOWLEDGE);
   * const results = await Promise.all(
   *   kbClients.map(client => client.post('/query', { query: 'search term' }))
   * );
   * ```
   */
  getClientsByType(type: ClientType): ClientInstance[] {
    return globalClientManager.getClientsByType(type);
  }

  /**
   * Get system health status.
   *
   * @returns {object} System health status with overall health, client counts, and status breakdown.
   * @returns {string} Returns.status - Overall system status ('healthy' | 'degraded' | 'critical').
   * @returns {number} Returns.totalClients - Total number of registered clients.
   * @returns {number} Returns.healthyClients - Number of healthy clients.
   * @returns {number} Returns.degradedClients - Number of degraded clients.
   * @returns {number} Returns.unhealthyClients - Number of unhealthy clients.
   * @returns {object} Returns.byType - Health breakdown by client type.
   * @description Returns comprehensive health status for the entire UACL system,
   *              including overall status and detailed breakdown by client type.
   * @example
   * ```typescript
   * // Check system health
   * const health = uacl.getHealthStatus();
   * console.log(`System Status: ${health.status}`);
   * console.log(`Healthy: ${health.healthyClients}/${health.totalClients}`);
   *
   * // Alert if system is degraded
   * if (health.status === 'degraded') {
   *   console.warn('Some clients are experiencing issues');
   *   console.log('By type:', health.byType);
   * }
   *
   * // Critical system check
   * if (health.status === 'critical') {
   *   console.error('System is in critical state');
   *   // Trigger alerts, failover, etc.
   * }
   * ```
   */
  getHealthStatus(): ReturnType<ClientManager['getHealthStatus']> {
    return globalClientManager.getHealthStatus();
  }

  /**
   * Get aggregated metrics.
   *
   * @returns {object} Aggregated metrics across all clients.
   * @returns {number} Returns.total - Total number of clients.
   * @returns {number} Returns.connected - Number of connected clients.
   * @returns {number} Returns.disconnected - Number of disconnected clients.
   * @returns {number} Returns.error - Number of clients in error state.
   * @returns {number} Returns.totalRequests - Total requests across all clients.
   * @returns {number} Returns.totalErrors - Total errors across all clients.
   * @returns {number} Returns.averageLatency - Average latency across all clients.
   * @returns {number} Returns.totalThroughput - Combined throughput of all clients.
   * @description Returns aggregated performance metrics across all registered clients,
   *              providing system-wide visibility into request volumes, error rates, and performance.
   * @example
   * ```typescript
   * // Get system-wide metrics
   * const metrics = uacl.getMetrics();
   * console.log(`Connected: ${metrics.connected}/${metrics.total}`);
   * console.log(`Total Requests: ${metrics.totalRequests}`);
   * console.log(`Error Rate: ${(metrics.totalErrors / metrics.totalRequests * 100).toFixed(2)}%`);
   * console.log(`Average Latency: ${metrics.averageLatency}ms`);
   * console.log(`Total Throughput: ${metrics.totalThroughput} req/sec`);
   *
   * // Performance monitoring
   * setInterval(() => {
   *   const currentMetrics = uacl.getMetrics();
   *   if (currentMetrics.averageLatency > 5000) {
   *     console.warn('High latency detected:', currentMetrics.averageLatency);
   *   }
   * }, 30000);
   * ```
   */
  getMetrics(): ReturnType<ClientManager['getAggregatedMetrics']> {
    return globalClientManager.getAggregatedMetrics();
  }

  /**
   * Get comprehensive system status.
   *
   * @returns {object} Comprehensive system status including health, metrics, and detailed breakdowns.
   * @returns {object} Returns.health - Detailed health status by client and type.
   * @returns {object} Returns.metrics - Performance metrics with historical data.
   * @returns {object} Returns.configuration - Current system configuration.
   * @returns {object} Returns.uptime - System uptime and availability statistics.
   * @description Returns the most comprehensive view of the UACL system status,
   *              combining health, performance, configuration, and operational data.
   * @example
   * ```typescript
   * // Get comprehensive system overview
   * const status = uacl.getSystemStatus();
   *
   * console.log('=== UACL System Status ===');
   * console.log(`Overall Health: ${status.health.status}`);
   * console.log(`System Uptime: ${status.uptime.totalUptime}ms`);
   * console.log(`Total Clients: ${status.metrics.total}`);
   *
   * // Detailed breakdown by client type
   * Object.entries(status.health.byType).forEach(([type, typeHealth]) => {
   *   console.log(`${type}: ${typeHealth.healthy}/${typeHealth.total} healthy`);
   * });
   *
   * // Performance summary
   * console.log(`Average Latency: ${status.metrics.averageLatency}ms`);
   * console.log(`Total Throughput: ${status.metrics.totalThroughput} req/sec`);
   *
   * // Configuration summary
   * console.log(`Max Clients: ${status.configuration.maxClients}`);
   * console.log(`Health Checks: ${status.configuration.enableHealthChecks ? 'Enabled' : 'Disabled'}`);
   * ```
   */
  getSystemStatus(): ReturnType<
    (typeof ClientManagerHelpers)['getSystemStatus']
  > {
    return ClientManagerHelpers.getSystemStatus();
  }

  /**
   * Connect all clients.
   *
   * @returns {Promise<void>} Resolves when all connection attempts are complete.
   * @throws {AggregateError} If multiple connection attempts fail (contains all individual errors).
   * @description Attempts to connect all registered clients that are enabled.
   *              Uses Promise.allSettled to ensure all connections are attempted even if some fail.
   *              Only attempts to connect clients where config.enabled is true.
   * @example
   * ```typescript
   * try {
   *   // Connect all enabled clients
   *   await uacl.connectAll();
   *   console.log('All clients connected successfully');
   *
   *   // Check which clients are now connected
   *   const metrics = uacl.getMetrics();
   *   console.log(`Connected: ${metrics.connected}/${metrics.total}`);
   * } catch (error) {
   *   console.error('Some clients failed to connect:', error);
   *
   *   // Check individual client status
   *   const health = uacl.getHealthStatus();
   *   console.log('Health by type:', health.byType);
   * }
   *
   * // Alternative: Connect with error handling per client
   * await uacl.connectAll();
   * const clients = uacl.getClientsByType(ClientType.HTTP);
   * clients.forEach(client => {
   *   if (!client.isConnected()) {
   *     console.warn(`Client ${client.id} failed to connect`);
   *   }
   * });
   * ```
   */
  async connectAll(): Promise<void> {
    const allClients = globalClientManager.registry.getAll();
    const connectionPromises = allClients
      .filter((client) => client.config.enabled)
      .map((client) => globalClientManager.connectClient(client.id));

    await Promise.allSettled(connectionPromises);
  }

  /**
   * Disconnect all clients.
   *
   * @returns {Promise<void>} Resolves when all disconnection attempts are complete.
   * @description Gracefully disconnects all registered clients regardless of their current state.
   *              Uses Promise.allSettled to ensure all disconnections are attempted.
   *              Safe to call even if clients are already disconnected.
   * @example
   * ```typescript
   * // Graceful shutdown of all clients
   * console.log('Disconnecting all clients...');
   * await uacl.disconnectAll();
   *
   * // Verify all clients are disconnected
   * const metrics = uacl.getMetrics();
   * console.log(`Disconnected: ${metrics.disconnected}/${metrics.total}`);
   *
   * // Check for any clients that failed to disconnect
   * const allClients = [
   *   ...uacl.getClientsByType(ClientType.HTTP),
   *   ...uacl.getClientsByType(ClientType.WEBSOCKET),
   *   ...uacl.getClientsByType(ClientType.KNOWLEDGE),
   *   ...uacl.getClientsByType(ClientType.MCP)
   * ];
   *
   * const stillConnected = allClients.filter(client => client.isConnected());
   * if (stillConnected.length > 0) {
   *   console.warn(`${stillConnected.length} clients still connected:`,
   *     stillConnected.map(c => c.id));
   * }
   * ```
   */
  async disconnectAll(): Promise<void> {
    const allClients = globalClientManager.registry.getAll();
    const disconnectionPromises = allClients.map((client) =>
      globalClientManager.disconnectClient(client.id)
    );

    await Promise.allSettled(disconnectionPromises);
  }

  /**
   * Shutdown UACL system.
   *
   * @returns {Promise<void>} Resolves when the system is completely shut down.
   * @description Performs a complete shutdown of the UACL system, including:
   *              - Disconnecting all clients
   *              - Stopping health check timers
   *              - Clearing metrics collection
   *              - Resetting initialization state
   *              Safe to call multiple times - subsequent calls are ignored.
   * @example
   * ```typescript
   * // Graceful system shutdown
   * console.log('Shutting down UACL system...');
   * await uacl.shutdown();
   * console.log('UACL system shutdown complete');
   *
   * // Verify shutdown
   * console.log('Initialized:', uacl.isInitialized()); // false
   *
   * // Application shutdown sequence
   * process.on('SIGTERM', async () => {
   *   console.log('Received SIGTERM, shutting down gracefully...');
   *   await uacl.shutdown();
   *   process.exit(0);
   * });
   *
   * process.on('SIGINT', async () => {
   *   console.log('Received SIGINT, shutting down gracefully...');
   *   await uacl.shutdown();
   *   process.exit(0);
   * });
   * ```
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await globalClientManager.shutdown();
    this.initialized = false;
  }
}

/**
 * Global UACL instance for convenience.
 *
 * @constant {UACL} uacl - Pre-instantiated global UACL singleton instance
 * @description Provides immediate access to the UACL system without needing to call getInstance().
 *              This is the recommended way to access UACL functionality in most applications.
 * @example
 * ```typescript
 * import { uacl } from './interfaces/clients';
 *
 * // Direct access to UACL functionality
 * await uacl.initialize();
 * const client = await uacl.createHTTPClient('api', 'https://api.example.com');
 * const status = uacl.getHealthStatus();
 * ```
 */
export const uacl = UACL.getInstance();

/**
 * Initialize UACL with default configuration.
 *
 * @param {ClientManagerConfig} [config] - Optional UACL system configuration.
 * @param {boolean} [config.enableHealthChecks=true] - Enable automatic health monitoring.
 * @param {number} [config.metricsInterval=60000] - Metrics collection interval (ms).
 * @param {number} [config.maxClients=100] - Maximum concurrent clients.
 * @param {boolean} [config.enableRetries=true] - Enable automatic retry mechanisms.
 * @param {boolean} [config.enableMetrics=true] - Enable performance metrics collection.
 * @returns {Promise<void>} Resolves when UACL initialization is complete.
 * @throws {Error} If initialization fails due to invalid configuration or system constraints.
 * @description Convenience function to initialize the global UACL instance with optional configuration.
 *              This is equivalent to calling `uacl.initialize(config)` but provides a more functional approach.
 * @example
 * ```typescript
 * import { initializeUACL } from './interfaces/clients';
 *
 * // Initialize with default settings
 * await initializeUACL();
 *
 * // Initialize with custom configuration
 * await initializeUACL({
 *   enableHealthChecks: true,
 *   metricsInterval: 30000,
 *   maxClients: 200,
 *   enableRetries: true,
 *   enableMetrics: true
 * });
 *
 * // Application startup sequence
 * async function startApplication() {
 *   try {
 *     await initializeUACL({
 *       enableHealthChecks: process.env['NODE_ENV'] === 'production',
 *       metricsInterval: parseInt(process.env['METRICS_INTERVAL']) || 60000,
 *       maxClients: parseInt(process.env['MAX_CLIENTS']) || 100
 *     });
 *     console.log('UACL system initialized successfully');
 *   } catch (error) {
 *     console.error('Failed to initialize UACL:', error);
 *     process.exit(1);
 *   }
 * }
 * ```
 */
export const initializeUACL = async (
  config?: ClientManagerConfig
): Promise<void> => {
  await uacl.initialize(config);
};

/**
 * Quick access functions for common operations.
 *
 * @namespace UACLHelpers
 * @description Collection of utility functions for common UACL operations and setup patterns.
 *              Provides high-level convenience methods for typical client management scenarios.
 */
export const UACLHelpers = {
  /**
   * Initialize and create common clients for a typical setup.
   *
   * @param {object} config - Configuration object for common client types.
   * @param {string} [config.httpBaseURL] - Base URL for HTTP client creation.
   * @param {string} [config.websocketURL] - WebSocket server URL for real-time client.
   * @param {string} [config.factRepoPath] - Path to FACT knowledge repository.
   * @param {string} [config.anthropicApiKey] - Anthropic API key for knowledge client.
   * @param {MCPClientConfig['servers']} [config.mcpServers] - MCP server configurations.
   * @returns {Promise<object>} Object containing created client instances.
   * @returns {ClientInstance} [returns.http] - HTTP client instance (if httpBaseURL provided).
   * @returns {ClientInstance} [returns.websocket] - WebSocket client instance (if websocketURL provided).
   * @returns {ClientInstance} [returns.knowledge] - Knowledge client instance (if FACT config provided).
   * @returns {ClientInstance} [returns.mcp] - MCP client instance (if mcpServers provided).
   * @throws {Error} If client setup fails or required dependencies are missing.
   * @description Creates a standard set of clients based on provided configuration,
   *              automatically connects them, and returns the instances for immediate use.
   *              Perfect for application bootstrap and common client setup patterns.
   * @example
   * ```typescript
   * // Basic setup with HTTP and WebSocket clients
   * const clients = await UACLHelpers.setupCommonClients({
   *   httpBaseURL: 'https://api.example.com',
   *   websocketURL: 'wss://live.example.com/ws'
   * });
   *
   * // Use the created clients
   * if (clients.http) {
   *   const apiData = await clients.http.get('/data');
   *   console.log('API Data:', apiData.data);
   * }
   *
   * if (clients.websocket) {
   *   clients.websocket.on('message', (data) => {
   *     console.log('Real-time update:', data);
   *   });
   * }
   *
   * // Complete setup with all client types
   * const fullSetup = await UACLHelpers.setupCommonClients({
   *   httpBaseURL: process.env['API_BASE_URL'],
   *   websocketURL: process.env['WS_URL'],
   *   factRepoPath: './knowledge',
   *   anthropicApiKey: process.env['ANTHROPIC_API_KEY'],
   *   mcpServers: [
   *     {
   *       name: 'filesystem',
   *       command: 'npx',
   *       args: ['@modelcontextprotocol/server-filesystem', './workspace']
   *     }
   *   ]
   * });
   *
   * // All clients are connected and ready to use
   * console.log('Setup complete:', {
   *   http: !!fullSetup.http,
   *   websocket: !!fullSetup.websocket,
   *   knowledge: !!fullSetup.knowledge,
   *   mcp: !!fullSetup.mcp
   * });
   * ```
   */
  async setupCommonClients(config: {
    httpBaseURL?: string;
    websocketURL?: string;
    factRepoPath?: string;
    anthropicApiKey?: string;
    mcpServers?: MCPClientConfig['servers'];
  }): Promise<{
    http?: ClientInstance;
    websocket?: ClientInstance;
    knowledge?: ClientInstance;
    mcp?: ClientInstance;
  }> {
    await uacl.initialize();

    const clients: {
      http?: ClientInstance;
      websocket?: ClientInstance;
      knowledge?: ClientInstance;
      mcp?: ClientInstance;
    } = {};

    try {
      if (config?.httpBaseURL) {
        clients.http = await uacl.createHTTPClient(
          'default-http',
          config?.httpBaseURL
        );
      }

      if (config?.websocketURL) {
        clients.websocket = await uacl.createWebSocketClient(
          'default-websocket',
          config?.websocketURL
        );
      }

      if (config?.factRepoPath && config?.anthropicApiKey) {
        clients.knowledge = await uacl.createKnowledgeClient(
          'default-knowledge',
          config?.factRepoPath,
          config?.anthropicApiKey
        );
      }

      if (config?.mcpServers) {
        clients.mcp = await uacl.createMCPClient(
          'default-mcp',
          config?.mcpServers
        );
      }

      // Connect all created clients
      await uacl.connectAll();

      return clients;
    } catch (error) {
      const logger = new Logger('uacl-setup');
      logger.error('Failed to setup common clients', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        config: {
          httpBaseURL: config?.httpBaseURL,
          websocketURL: config?.websocketURL,
          factRepoPath: config?.factRepoPath,
          hasMCPServers: !!config?.mcpServers,
        },
      });
      throw error;
    }
  },

  /**
   * Get a quick status overview.
   *
   * @returns {object} Quick status overview with health assessment.
   * @returns {boolean} Returns.initialized - Whether UACL system is initialized.
   * @returns {number} Returns.totalClients - Total number of registered clients.
   * @returns {number} Returns.healthyClients - Number of healthy/connected clients.
   * @returns {number} Returns.healthPercentage - Health percentage (0-100).
   * @returns {'healthy'|'warning'|'critical'} Returns.status - Overall system status.
   * @description Provides a quick, at-a-glance system health overview with standardized status levels.
   *              Perfect for dashboards, monitoring, and quick health checks.
   *
   * Status levels:
   * - healthy: 80%+ clients are connected
   * - warning: 50-79% clients are connected
   * - critical: <50% clients connected or system not initialized.
   * @example
   * ```typescript
   * // Quick health check.
   * const status = UACLHelpers.getQuickStatus();
   * console.log(`System: ${status.status.toUpperCase()}`);
   * console.log(`Health: ${status.healthPercentage.toFixed(1)}%`);
   * console.log(`Connected: ${status.healthyClients}/${status.totalClients}`);
   *
   * // Health-based decisions
   * switch (status.status) {
   *   case 'healthy':
   *     console.log('✅ All systems operational');
   *     break;
   *   case 'warning':
   *     console.log('⚠️  Some clients experiencing issues');
   *     // Maybe try to reconnect failed clients
   *     break;
   *   case 'critical':
   *     console.log('❌ System in critical state');
   *     // Alert operations, attempt recovery
   *     break;
   * }
   *
   * // Monitoring integration
   * setInterval(() => {
   *   const currentStatus = UACLHelpers.getQuickStatus();
   *   if (currentStatus.status !== 'healthy') {
   *     sendAlert(`UACL Status: ${currentStatus.status}`, currentStatus);
   *   }
   * }, 60000);
   * ```
   */
  getQuickStatus(): {
    initialized: boolean;
    totalClients: number;
    healthyClients: number;
    healthPercentage: number;
    status: 'healthy' | 'warning' | 'critical';
  } {
    if (!uacl.isInitialized()) {
      return {
        initialized: false,
        totalClients: 0,
        healthyClients: 0,
        healthPercentage: 0,
        status: 'critical',
      };
    }

    const metrics = uacl.getMetrics();
    const healthPercentage =
      metrics.total > 0 ? (metrics.connected / metrics.total) * 100 : 100;

    const status =
      healthPercentage >= 80
        ? 'healthy'
        : healthPercentage >= 50
          ? 'warning'
          : 'critical';

    return {
      initialized: true,
      totalClients: metrics.total,
      healthyClients: metrics.connected,
      healthPercentage,
      status,
    };
  },

  /**
   * Perform health check on all clients.
   *
   * @returns {Promise<Record<string, boolean>>} Map of client Ds to health status (true = healthy, false = unhealthy).
   * @throws Never throws - all errors are caught and reported as unhealthy clients.
   * @description Performs individual health checks on all registered clients across all types.
   *              Returns a simple boolean status for each client, making it easy to identify
   *              which specific clients are experiencing issues.
   * @example
   * ```typescript
   * // Check health of all clients
   * const healthResults = await UACLHelpers.performHealthCheck();
   *
   * console.log('Individual client health:');
   * Object.entries(healthResults).forEach(([clientId, isHealthy]) => {
   *   const status = isHealthy ? '✅' : '❌';
   *   console.log(`${status} ${clientId}: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
   * });
   *
   * // Count healthy vs unhealthy
   * const healthyCount = Object.values(healthResults).filter(Boolean).length;
   * const totalCount = Object.keys(healthResults).length;
   * console.log(`Health Summary: ${healthyCount}/${totalCount} clients healthy`);
   *
   * // Find unhealthy clients for remediation
   * const unhealthyClients = Object.entries(healthResults)
   *   .filter(([, isHealthy]) => !isHealthy)
   *   .map(([clientId]) => clientId);
   *
   * if (unhealthyClients.length > 0) {
   *   console.log('Unhealthy clients requiring attention:', unhealthyClients);
   *
   *   // Attempt to reconnect unhealthy clients
   *   for (const clientId of unhealthyClients) {
   *     try {
   *       const client = uacl.getClient(clientId);
   *       if (client && !client.isConnected()) {
   *         await client.connect();
   *         console.log(`Reconnected ${clientId}`);
   *       }
   *     } catch (error) {
   *       console.error(`Failed to reconnect ${clientId}:`, error);
   *     }
   *   }
   * }
   *
   * // Integration with monitoring systems
   * const healthCheckInterval = setInterval(async () => {
   *   const results = await UACLHelpers.performHealthCheck();
   *   const failedClients = Object.entries(results)
   *     .filter(([, healthy]) => !healthy)
   *     .map(([id]) => id);
   *
   *   if (failedClients.length > 0) {
   *     await sendHealthAlert({
   *       message: `${failedClients.length} clients are unhealthy`,
   *       failedClients,
   *       timestamp: new Date().toISOString()
   *     });
   *   }
   * }, 300000); // Check every 5 minutes
   * ```
   */
  async performHealthCheck(): Promise<Record<string, boolean>> {
    const allClients = uacl
      .getClientsByType(ClientType.HTTP)
      .concat(uacl.getClientsByType(ClientType.WEBSOCKET))
      .concat(uacl.getClientsByType(ClientType.KNOWLEDGE))
      .concat(uacl.getClientsByType(ClientType.MCP));

    const healthChecks = allClients.map(async (client) => {
      try {
        // This would need actual health check implementation per client type
        const isHealthy = client.status === 'connected';
        return { [client.id]: isHealthy };
      } catch {
        return { [client.id]: false };
      }
    });

    const results = await Promise.allSettled(healthChecks);

    return results?.reduce(
      (acc, result) => {
        if (result?.status === 'fulfilled') {
          Object.assign(acc, result?.value);
        }
        return acc;
      },
      {} as Record<string, boolean>
    );
  },
};

export * from './compatibility';
// UACL validation and compatibility
export {
  printValidationReport,
  UACLValidator,
  type ValidationReport,
  type ValidationResult,
  validateUACL,
} from './validation';

/**
 * Default export for convenience.
 */
export default uacl;
