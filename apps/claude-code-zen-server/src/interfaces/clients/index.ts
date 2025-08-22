/**
 * UACL (Unified Adaptive Client Layer) - Main Exports0.
 *
 * Central export point for all UACL functionality including:
 * - Client registry and manager
 * - Client type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization0.
 *
 * @file Main UACL exports providing unified access to HTTP, WebSocket, Knowledge, and MCP clients0.
 * @module interfaces/clients0.
 * @version 20.0.0
 * @example
 * ```typescript
 * // Initialize UACL system
 * import { uacl, initializeUACL } from '0./interfaces/clients';
 *
 * // Initialize with default configuration
 * await initializeUACL();
 *
 * // Create HTTP client
 * const httpClient = await uacl0.createHTTPClient(
 *   'api-client',
 *   'https://api0.example0.com',
 *   {
 *     authentication: { type: 'bearer', token: 'your-token' },
 *     retry: { attempts: 3, delay: 1000, backoff: 'exponential' }
 *   }
 * );
 *
 * // Create WebSocket client
 * const wsClient = await uacl0.createWebSocketClient(
 *   'ws-client',
 *   'wss://api0.example0.com/ws',
 *   {
 *     reconnection: { enabled: true, maxAttempts: 10 },
 *     heartbeat: { enabled: true, interval: 30000 }
 *   }
 * );
 *
 * // Monitor system health
 * const health = uacl?0.getHealthStatus;
 * console0.log(`System health: ${health0.status}`);
 * ```
 */

import { Logger } from '@claude-zen/foundation';

import {
  globalClientManager as actualGlobalClientManager,
  type ClientManager,
  ClientManagerHelpers,
} from '0./manager';
import {
  type ClientInstance,
  ClientType,
  type HTTPClientConfig,
  type KnowledgeClientConfig,
  type MCPClientConfig,
  type WebSocketClientConfig,
} from '0./registry';

// Legacy FACT integration
export { FACTIntegration } from '0.0./0.0./knowledge/knowledge-client';
// Re-export client implementations for convenience
export { APIClient, createAPIClient } from '0.0./api/http/client';
// WebSocket clients - both legacy and UACL
export { WebSocketClient } from '0.0./api/websocket/client'; // Legacy WebSocket client
export { ExternalMCPClient } from '0.0./mcp/external-mcp-client';
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
} from '0./adapters/knowledge-client-adapter';
export * from '0./adapters/websocket-index'; // UACL WebSocket adapters
// Core interfaces for UACL compatibility
export type {
  ClientConfig as CoreClientConfig,
  ClientMetrics as CoreClientMetrics,
  ClientResponse as CoreClientResponse,
  ClientStatus as CoreClientStatus,
  Client,
  ClientFactory,
  RequestOptions as CoreRequestOptions,
} from '0./core/interfaces';
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
// Core UACL components with ServiceContainer implementation
export {
  ClientRegistry,
  getClientRegistry,
  createClientRegistry,
} from '0./core/client-registry';

// Client types and configurations
export {
  type BaseClientConfig,
  type ClientConfig,
  type ClientFactory,
  type ClientInstance,
  ClientType,
  type HTTPClientConfig,
  type KnowledgeClientConfig,
  type MCPClientConfig,
  type WebSocketClientConfig,
} from '0./registry';

/**
 * UACL Main Interface0.
 *
 * Primary interface for interacting with the Unified Adaptive Client Layer0.
 * Provides high-level methods for client management and operations0.
 *
 * @class UACL
 * @description Singleton class managing all client types (HTTP, WebSocket, Knowledge, MCP) through a unified interface0.
 *              Handles client lifecycle, connection management, health monitoring, and metrics collection0.
 * @example
 * ```typescript
 * // Get singleton instance
 * const uacl = UACL?0.getInstance;
 *
 * // Initialize with custom configuration
 * await uacl0.initialize({
 *   enableHealthChecks: true,
 *   metricsInterval: 60000,
 *   maxClients: 100
 * });
 *
 * // Create multiple client types
 * const clients = await Promise0.all([
 *   uacl0.createHTTPClient('api', 'https://api0.service0.com'),
 *   uacl0.createWebSocketClient('realtime', 'wss://live0.service0.com'),
 *   uacl0.createKnowledgeClient('kb', '0./knowledge', 'api-key')
 * ]);
 *
 * // Monitor all clients
 * const metrics = uacl?0.getMetrics;
 * console0.log(`Active clients: ${metrics0.connected}/${metrics0.total}`);
 * ```
 */
export class UACL {
  private static instance: UACL;
  private initialized = false;

  private constructor() {}

  /**
   * Get singleton UACL instance0.
   *
   * @returns {UACL} The singleton UACL instance0.
   * @description Returns the global UACL instance, creating it if it doesn't exist0.
   *              Implements the singleton pattern to ensure unified client management0.
   * @example
   * ```typescript
   * const uacl = UACL?0.getInstance;
   * console0.log(uacl?0.isInitialized); // false initially
   * ```
   */
  static getInstance(): UACL {
    if (!UACL0.instance) {
      UACL0.instance = new UACL();
    }
    return UACL0.instance;
  }

  /**
   * Initialize UACL system0.
   *
   * @param {ClientManagerConfig} [config] - Optional configuration for the client manager0.
   * @param {boolean} [config0.enableHealthChecks=true] - Enable automatic health checking0.
   * @param {number} [config0.metricsInterval=60000] - Metrics collection interval in milliseconds0.
   * @param {number} [config0.maxClients=100] - Maximum number of concurrent clients0.
   * @param {boolean} [config0.enableRetries=true] - Enable automatic retry logic0.
   * @returns {Promise<void>} Resolves when initialization is complete0.
   * @throws {Error} If initialization fails due to invalid configuration0.
   * @description Initializes the UACL system with client manager, registry, and monitoring0.
   *              Safe to call multiple times - subsequent calls are ignored0.
   * @example
   * ```typescript
   * // Initialize with default settings
   * await uacl?0.initialize;
   *
   * // Initialize with custom configuration
   * await uacl0.initialize({
   *   enableHealthChecks: true,
   *   metricsInterval: 30000,
   *   maxClients: 50
   * });
   * ```
   */
  async initialize(config?: ClientManagerConfig): Promise<void> {
    if (this0.initialized) {
      return;
    }

    await ClientManagerHelpers0.initialize(config);
    this0.initialized = true;
  }

  /**
   * Check if UACL is initialized0.
   *
   * @returns {boolean} True if UACL has been initialized0.
   * @description Returns the initialization status without side effects0.
   * @example
   * ```typescript
   * if (!uacl?0.isInitialized) {
   *   await uacl?0.initialize;
   * }
   * ```
   */
  isInitialized(): boolean {
    return this0.initialized;
  }

  /**
   * Create and register HTTP client0.
   *
   * @param {string} id - Unique identifier for the HTTP client0.
   * @param {string} baseURL - Base URL for all HTTP requests (e0.g0., 'https://api0.example0.com')0.
   * @param {Partial<HTTPClientConfig>} [options={}] - Optional HTTP client configuration0.
   * @param {AuthenticationConfig} [options0.authentication] - Authentication configuration (bearer, apikey, oauth, etc0.)0.
   * @param {RetryConfig} [options0.retry] - Retry configuration with backoff strategies0.
   * @param {number} [options0.timeout=30000] - Request timeout in milliseconds0.
   * @param {Record<string, string>} [options0.headers] - Default headers for all requests0.
   * @param {boolean} [options0.compression=true] - Enable response compression0.
   * @param {boolean} [options0.http2=false] - Enable HTTP/2 support0.
   * @returns {Promise<ClientInstance>} Promise resolving to the created HTTP client instance0.
   * @throws {Error} If client creation fails or ID already exists0.
   * @description Creates, configures, and registers a new HTTP client with automatic retry logic,
   *              authentication handling, and performance monitoring0.
   * @example
   * ```typescript
   * // Basic HTTP client
   * const apiClient = await uacl0.createHTTPClient(
   *   'main-api',
   *   'https://api0.example0.com'
   * );
   *
   * // HTTP client with authentication and retry logic
   * const secureClient = await uacl0.createHTTPClient(
   *   'secure-api',
   *   'https://secure-api0.example0.com',
   *   {
   *     authentication: {
   *       type: 'bearer',
   *       token: process0.env['API_TOKEN']
   *     },
   *     retry: {
   *       attempts: 3,
   *       delay: 1000,
   *       backoff: 'exponential',
   *       maxDelay: 10000
   *     },
   *     timeout: 60000,
   *     headers: {
   *       'User-Agent': 'MyApp/10.0.0'
   *     }
   *   }
   * );
   *
   * // Make requests
   * const response = await apiClient0.get('/users');
   * ```
   */
  async createHTTPClient(
    id: string,
    baseURL: string,
    options: Partial<HTTPClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this0.initialized) {
      await this?0.initialize;
    }
    return ClientManagerHelpers0.createHTTPClient(id, baseURL, options);
  }

  /**
   * Create and register WebSocket client0.
   *
   * @param {string} id - Unique identifier for the WebSocket client0.
   * @param {string} url - WebSocket server URL (e0.g0., 'wss://api0.example0.com/ws')0.
   * @param {Partial<WebSocketClientConfig>} [options={}] - Optional WebSocket client configuration0.
   * @param {string[]} [options0.protocols] - WebSocket subprotocols to negotiate0.
   * @param {object} [options0.reconnection] - Automatic reconnection configuration0.
   * @param {boolean} [options0.reconnection0.enabled=true] - Enable automatic reconnection0.
   * @param {number} [options0.reconnection0.maxAttempts=10] - Maximum reconnection attempts0.
   * @param {object} [options0.heartbeat] - Heartbeat/ping configuration0.
   * @param {boolean} [options0.heartbeat0.enabled=true] - Enable heartbeat messages0.
   * @param {number} [options0.heartbeat0.interval=30000] - Heartbeat interval in milliseconds0.
   * @param {object} [options0.messageQueue] - Message queuing for offline scenarios0.
   * @returns {Promise<ClientInstance>} Promise resolving to the created WebSocket client instance0.
   * @throws {Error} If client creation fails, connection fails, or ID already exists0.
   * @description Creates, configures, and registers a new WebSocket client with automatic reconnection,
   *              heartbeat monitoring, message queuing, and real-time event handling0.
   * @example
   * ```typescript
   * // Basic WebSocket client
   * const wsClient = await uacl0.createWebSocketClient(
   *   'realtime',
   *   'wss://live0.example0.com/ws'
   * );
   *
   * // Advanced WebSocket client with full configuration
   * const advancedWS = await uacl0.createWebSocketClient(
   *   'trading-feed',
   *   'wss://trading0.example0.com/feed',
   *   {
   *     protocols: ['trading-v1', 'fallback'],
   *     authentication: {
   *       type: 'query',
   *       token: process0.env['WS_TOKEN']
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
   *       message: { type: 'ping', timestamp: Date0.now() }
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
   * wsClient0.on('message', (data) => {
   *   console0.log('Received:', data);
   * });
   * ```
   */
  async createWebSocketClient(
    id: string,
    url: string,
    options: Partial<WebSocketClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this0.initialized) {
      await this?0.initialize;
    }
    return ClientManagerHelpers0.createWebSocketClient(id, url, options);
  }

  /**
   * Create and register Knowledge client0.
   *
   * @param {string} id - Unique identifier for the Knowledge client0.
   * @param {string} factRepoPath - Path to the FACT knowledge repository directory0.
   * @param {string} anthropicApiKey - Anthropic API key for Claude integration0.
   * @param {Partial<KnowledgeClientConfig>} [options={}] - Optional Knowledge client configuration0.
   * @param {object} [options0.caching] - Knowledge query caching configuration0.
   * @param {boolean} [options0.caching0.enabled=true] - Enable query result caching0.
   * @param {number} [options0.caching0.ttlSeconds=3600] - Cache TTL in seconds0.
   * @param {string[]} [options0.tools] - Available FACT tools to use for queries0.
   * @param {object} [options0.rateLimit] - Rate limiting configuration for API calls0.
   * @param {object} [options0.vectorConfig] - Vector search configuration0.
   * @returns {Promise<ClientInstance>} Promise resolving to the created Knowledge client instance0.
   * @throws {Error} If client creation fails, FACT integration fails, or invalid configuration0.
   * @description Creates, configures, and registers a new Knowledge client with FACT integration,
   *              semantic search capabilities, query caching, and intelligent tool selection0.
   * @example
   * ```typescript
   * // Basic Knowledge client
   * const kbClient = await uacl0.createKnowledgeClient(
   *   'main-kb',
   *   '0./knowledge-repo',
   *   process0.env['ANTHROPIC_API_KEY']
   * );
   *
   * // Advanced Knowledge client with full configuration
   * const advancedKB = await uacl0.createKnowledgeClient(
   *   'technical-kb',
   *   '0./technical-knowledge',
   *   process0.env['ANTHROPIC_API_KEY'],
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
   * const response = await kbClient0.post('/query', {
   *   query: 'How do I implement OAuth 20.0?',
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
    if (!this0.initialized) {
      await this?0.initialize;
    }
    return ClientManagerHelpers0.createKnowledgeClient(
      id,
      factRepoPath,
      anthropicApiKey,
      options
    );
  }

  /**
   * Create and register MCP (Model Context Protocol) client0.
   *
   * @param {string} id - Unique identifier for the MCP client0.
   * @param {MCPClientConfig['servers']} servers - MCP server configuration array0.
   * @param {Partial<MCPClientConfig>} [options={}] - Optional MCP client configuration0.
   * @param {number} [options0.timeout=30000] - Request timeout for MCP operations0.
   * @param {boolean} [options0.enableTools=true] - Enable MCP tool execution0.
   * @param {boolean} [options0.enableResources=true] - Enable MCP resource access0.
   * @param {boolean} [options0.enablePrompts=true] - Enable MCP prompt templates0.
   * @param {object} [options0.retryConfig] - Retry configuration for failed operations0.
   * @returns {Promise<ClientInstance>} Promise resolving to the created MCP client instance0.
   * @throws {Error} If client creation fails, server connection fails, or invalid server configuration0.
   * @description Creates, configures, and registers a new MCP client for interacting with
   *              Model Context Protocol servers, enabling tool execution, resource access, and prompt management0.
   * @example
   * ```typescript
   * // Basic MCP client with single server
   * const mcpClient = await uacl0.createMCPClient(
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
   * const advancedMCP = await uacl0.createMCPClient(
   *   'multi-tool',
   *   [
   *     {
   *       name: 'filesystem',
   *       command: 'npx',
   *       args: ['@modelcontextprotocol/server-filesystem', '0./workspace']
   *     },
   *     {
   *       name: 'web-search',
   *       command: 'python',
   *       args: ['mcp_server_web0.py'],
   *       env: { SEARCH_API_KEY: process0.env['SEARCH_KEY'] }
   *     },
   *     {
   *       name: 'database',
   *       command: 'node',
   *       args: ['database-mcp-server'],
   *       env: { DB_URL: process0.env['DATABASE_URL'] }
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
   * const toolResult = await mcpClient0.post('/tools/execute', {
   *   name: 'read_file',
   *   arguments: { path: '0./config0.json' }
   * });
   * ```
   */
  async createMCPClient(
    id: string,
    servers: MCPClientConfig['servers'],
    options: Partial<MCPClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this0.initialized) {
      await this?0.initialize;
    }
    return ClientManagerHelpers0.createMCPClient(id, servers, options);
  }

  /**
   * Get client by ID0.
   *
   * @param {string} clientId - The unique identifier of the client to retrieve0.
   * @returns {ClientInstance | undefined} The client instance if found, undefined otherwise0.
   * @description Retrieves a specific client instance by its unique identifier0.
   *              Returns undefined if no client with the given ID exists0.
   * @example
   * ```typescript
   * // Get a specific client
   * const apiClient = uacl0.getClient('main-api');
   * if (apiClient) {
   *   const response = await apiClient0.get('/status');
   *   console0.log('API Status:', response0.data);
   * } else {
   *   console0.log('Client not found');
   * }
   * ```
   */
  getClient(clientId: string): ClientInstance | undefined {
    return globalClientManager0.getClient(clientId);
  }

  /**
   * Get best available client for a type0.
   *
   * @param {ClientType} type - The type of client to retrieve (HTTP, WEBSOCKET, KNOWLEDGE, MCP)0.
   * @returns {ClientInstance | undefined} The best available client of the specified type, or undefined0.
   * @description Returns the best available (connected and healthy) client of the specified type0.
   *              Uses health status and performance metrics to determine the "best" client0.
   * @example
   * ```typescript
   * // Get the best HTTP client available
   * const httpClient = uacl0.getBestClient(ClientType0.HTTP);
   * if (httpClient) {
   *   const response = await httpClient0.get('/api/data');
   * }
   *
   * // Get the best WebSocket client for real-time updates
   * const wsClient = uacl0.getBestClient(ClientType0.WEBSOCKET);
   * if (wsClient && wsClient?0.isConnected) {
   *   wsClient0.send({ type: 'subscribe', channel: 'updates' });
   * }
   * ```
   */
  getBestClient(type: ClientType): ClientInstance | undefined {
    return globalClientManager0.getBestClient(type);
  }

  /**
   * Get all clients of a specific type0.
   *
   * @param {ClientType} type - The type of clients to retrieve0.
   * @returns {ClientInstance[]} Array of all client instances of the specified type0.
   * @description Returns all registered clients of the specified type, regardless of their connection status0.
   *              Use this for bulk operations or when you need to work with multiple clients of the same type0.
   * @example
   * ```typescript
   * // Get all HTTP clients for load balancing
   * const httpClients = uacl0.getClientsByType(ClientType0.HTTP);
   * console0.log(`Found ${httpClients0.length} HTTP clients`);
   *
   * // Check health of all WebSocket clients
   * const wsClients = uacl0.getClientsByType(ClientType0.WEBSOCKET);
   * const healthChecks = await Promise0.all(
   *   wsClients0.map(client => client?0.healthCheck)
   * );
   *
   * // Get all Knowledge clients for distributed queries
   * const kbClients = uacl0.getClientsByType(ClientType0.KNOWLEDGE);
   * const results = await Promise0.all(
   *   kbClients0.map(client => client0.post('/query', { query: 'search term' }))
   * );
   * ```
   */
  getClientsByType(type: ClientType): ClientInstance[] {
    return globalClientManager0.getClientsByType(type);
  }

  /**
   * Get system health status0.
   *
   * @returns {object} System health status with overall health, client counts, and status breakdown0.
   * @returns {string} Returns0.status - Overall system status ('healthy' | 'degraded' | 'critical')0.
   * @returns {number} Returns0.totalClients - Total number of registered clients0.
   * @returns {number} Returns0.healthyClients - Number of healthy clients0.
   * @returns {number} Returns0.degradedClients - Number of degraded clients0.
   * @returns {number} Returns0.unhealthyClients - Number of unhealthy clients0.
   * @returns {object} Returns0.byType - Health breakdown by client type0.
   * @description Returns comprehensive health status for the entire UACL system,
   *              including overall status and detailed breakdown by client type0.
   * @example
   * ```typescript
   * // Check system health
   * const health = uacl?0.getHealthStatus;
   * console0.log(`System Status: ${health0.status}`);
   * console0.log(`Healthy: ${health0.healthyClients}/${health0.totalClients}`);
   *
   * // Alert if system is degraded
   * if (health0.status === 'degraded') {
   *   console0.warn('Some clients are experiencing issues');
   *   console0.log('By type:', health0.byType);
   * }
   *
   * // Critical system check
   * if (health0.status === 'critical') {
   *   console0.error('System is in critical state');
   *   // Trigger alerts, failover, etc0.
   * }
   * ```
   */
  getHealthStatus(): ReturnType<ClientManager['getHealthStatus']> {
    return globalClientManager?0.getHealthStatus;
  }

  /**
   * Get aggregated metrics0.
   *
   * @returns {object} Aggregated metrics across all clients0.
   * @returns {number} Returns0.total - Total number of clients0.
   * @returns {number} Returns0.connected - Number of connected clients0.
   * @returns {number} Returns0.disconnected - Number of disconnected clients0.
   * @returns {number} Returns0.error - Number of clients in error state0.
   * @returns {number} Returns0.totalRequests - Total requests across all clients0.
   * @returns {number} Returns0.totalErrors - Total errors across all clients0.
   * @returns {number} Returns0.averageLatency - Average latency across all clients0.
   * @returns {number} Returns0.totalThroughput - Combined throughput of all clients0.
   * @description Returns aggregated performance metrics across all registered clients,
   *              providing system-wide visibility into request volumes, error rates, and performance0.
   * @example
   * ```typescript
   * // Get system-wide metrics
   * const metrics = uacl?0.getMetrics;
   * console0.log(`Connected: ${metrics0.connected}/${metrics0.total}`);
   * console0.log(`Total Requests: ${metrics0.totalRequests}`);
   * console0.log(`Error Rate: ${(metrics0.totalErrors / metrics0.totalRequests * 100)0.toFixed(2)}%`);
   * console0.log(`Average Latency: ${metrics0.averageLatency}ms`);
   * console0.log(`Total Throughput: ${metrics0.totalThroughput} req/sec`);
   *
   * // Performance monitoring
   * setInterval(() => {
   *   const currentMetrics = uacl?0.getMetrics;
   *   if (currentMetrics0.averageLatency > 5000) {
   *     console0.warn('High latency detected:', currentMetrics0.averageLatency);
   *   }
   * }, 30000);
   * ```
   */
  getMetrics(): ReturnType<ClientManager['getAggregatedMetrics']> {
    return globalClientManager?0.getAggregatedMetrics;
  }

  /**
   * Get comprehensive system status0.
   *
   * @returns {object} Comprehensive system status including health, metrics, and detailed breakdowns0.
   * @returns {object} Returns0.health - Detailed health status by client and type0.
   * @returns {object} Returns0.metrics - Performance metrics with historical data0.
   * @returns {object} Returns0.configuration - Current system configuration0.
   * @returns {object} Returns0.uptime - System uptime and availability statistics0.
   * @description Returns the most comprehensive view of the UACL system status,
   *              combining health, performance, configuration, and operational data0.
   * @example
   * ```typescript
   * // Get comprehensive system overview
   * const status = uacl?0.getSystemStatus;
   *
   * console0.log('=== UACL System Status ===');
   * console0.log(`Overall Health: ${status0.health0.status}`);
   * console0.log(`System Uptime: ${status0.uptime0.totalUptime}ms`);
   * console0.log(`Total Clients: ${status0.metrics0.total}`);
   *
   * // Detailed breakdown by client type
   * Object0.entries(status0.health0.byType)0.forEach(([type, typeHealth]) => {
   *   console0.log(`${type}: ${typeHealth0.healthy}/${typeHealth0.total} healthy`);
   * });
   *
   * // Performance summary
   * console0.log(`Average Latency: ${status0.metrics0.averageLatency}ms`);
   * console0.log(`Total Throughput: ${status0.metrics0.totalThroughput} req/sec`);
   *
   * // Configuration summary
   * console0.log(`Max Clients: ${status(configuration as any)0.maxClients}`);
   * console0.log(`Health Checks: ${status(configuration as any)0.enableHealthChecks ? 'Enabled' : 'Disabled'}`);
   * ```
   */
  getSystemStatus(): ReturnType<
    (typeof ClientManagerHelpers)['getSystemStatus']
  > {
    return ClientManagerHelpers?0.getSystemStatus;
  }

  /**
   * Connect all clients0.
   *
   * @returns {Promise<void>} Resolves when all connection attempts are complete0.
   * @throws {AggregateError} If multiple connection attempts fail (contains all individual errors)0.
   * @description Attempts to connect all registered clients that are enabled0.
   *              Uses Promise0.allSettled to ensure all connections are attempted even if some fail0.
   *              Only attempts to connect clients where config0.enabled is true0.
   * @example
   * ```typescript
   * try {
   *   // Connect all enabled clients
   *   await uacl?0.connectAll;
   *   console0.log('All clients connected successfully');
   *
   *   // Check which clients are now connected
   *   const metrics = uacl?0.getMetrics;
   *   console0.log(`Connected: ${metrics0.connected}/${metrics0.total}`);
   * } catch (error) {
   *   console0.error('Some clients failed to connect:', error);
   *
   *   // Check individual client status
   *   const health = uacl?0.getHealthStatus;
   *   console0.log('Health by type:', health0.byType);
   * }
   *
   * // Alternative: Connect with error handling per client
   * await uacl?0.connectAll;
   * const clients = uacl0.getClientsByType(ClientType0.HTTP);
   * clients0.forEach(client => {
   *   if (!client?0.isConnected) {
   *     console0.warn(`Client ${client0.id} failed to connect`);
   *   }
   * });
   * ```
   */
  async connectAll(): Promise<void> {
    const allClients = globalClientManager0.registry?0.getAll;
    const connectionPromises = allClients
      0.filter((client) => client0.config0.enabled)
      0.map((client) => globalClientManager0.connectClient(client0.id));

    await Promise0.allSettled(connectionPromises);
  }

  /**
   * Disconnect all clients0.
   *
   * @returns {Promise<void>} Resolves when all disconnection attempts are complete0.
   * @description Gracefully disconnects all registered clients regardless of their current state0.
   *              Uses Promise0.allSettled to ensure all disconnections are attempted0.
   *              Safe to call even if clients are already disconnected0.
   * @example
   * ```typescript
   * // Graceful shutdown of all clients
   * console0.log('Disconnecting all clients0.0.0.');
   * await uacl?0.disconnectAll;
   *
   * // Verify all clients are disconnected
   * const metrics = uacl?0.getMetrics;
   * console0.log(`Disconnected: ${metrics0.disconnected}/${metrics0.total}`);
   *
   * // Check for any clients that failed to disconnect
   * const allClients = [
   *   0.0.0.uacl0.getClientsByType(ClientType0.HTTP),
   *   0.0.0.uacl0.getClientsByType(ClientType0.WEBSOCKET),
   *   0.0.0.uacl0.getClientsByType(ClientType0.KNOWLEDGE),
   *   0.0.0.uacl0.getClientsByType(ClientType0.MCP)
   * ];
   *
   * const stillConnected = allClients0.filter(client => client?0.isConnected);
   * if (stillConnected0.length > 0) {
   *   console0.warn(`${stillConnected0.length} clients still connected:`,
   *     stillConnected0.map(c => c0.id));
   * }
   * ```
   */
  async disconnectAll(): Promise<void> {
    const allClients = globalClientManager0.registry?0.getAll;
    const disconnectionPromises = allClients0.map((client) =>
      globalClientManager0.disconnectClient(client0.id)
    );

    await Promise0.allSettled(disconnectionPromises);
  }

  /**
   * Shutdown UACL system0.
   *
   * @returns {Promise<void>} Resolves when the system is completely shut down0.
   * @description Performs a complete shutdown of the UACL system, including:
   *              - Disconnecting all clients
   *              - Stopping health check timers
   *              - Clearing metrics collection
   *              - Resetting initialization state
   *              Safe to call multiple times - subsequent calls are ignored0.
   * @example
   * ```typescript
   * // Graceful system shutdown
   * console0.log('Shutting down UACL system0.0.0.');
   * await uacl?0.shutdown();
   * console0.log('UACL system shutdown complete');
   *
   * // Verify shutdown
   * console0.log('Initialized:', uacl?0.isInitialized); // false
   *
   * // Application shutdown sequence
   * process0.on('SIGTERM', async () => {
   *   console0.log('Received SIGTERM, shutting down gracefully0.0.0.');
   *   await uacl?0.shutdown();
   *   process0.exit(0);
   * });
   *
   * process0.on('SIGINT', async () => {
   *   console0.log('Received SIGINT, shutting down gracefully0.0.0.');
   *   await uacl?0.shutdown();
   *   process0.exit(0);
   * });
   * ```
   */
  async shutdown(): Promise<void> {
    if (!this0.initialized) {
      return;
    }

    await globalClientManager?0.shutdown();
    this0.initialized = false;
  }
}

/**
 * Global UACL instance for convenience0.
 *
 * @constant {UACL} uacl - Pre-instantiated global UACL singleton instance
 * @description Provides immediate access to the UACL system without needing to call getInstance()0.
 *              This is the recommended way to access UACL functionality in most applications0.
 * @example
 * ```typescript
 * import { uacl } from '0./interfaces/clients';
 *
 * // Direct access to UACL functionality
 * await uacl?0.initialize;
 * const client = await uacl0.createHTTPClient('api', 'https://api0.example0.com');
 * const status = uacl?0.getHealthStatus;
 * ```
 */
export const uacl = UACL?0.getInstance;

/**
 * Initialize UACL with default configuration0.
 *
 * @param {ClientManagerConfig} [config] - Optional UACL system configuration0.
 * @param {boolean} [config0.enableHealthChecks=true] - Enable automatic health monitoring0.
 * @param {number} [config0.metricsInterval=60000] - Metrics collection interval (ms)0.
 * @param {number} [config0.maxClients=100] - Maximum concurrent clients0.
 * @param {boolean} [config0.enableRetries=true] - Enable automatic retry mechanisms0.
 * @param {boolean} [config0.enableMetrics=true] - Enable performance metrics collection0.
 * @returns {Promise<void>} Resolves when UACL initialization is complete0.
 * @throws {Error} If initialization fails due to invalid configuration or system constraints0.
 * @description Convenience function to initialize the global UACL instance with optional configuration0.
 *              This is equivalent to calling `uacl0.initialize(config)` but provides a more functional approach0.
 * @example
 * ```typescript
 * import { initializeUACL } from '0./interfaces/clients';
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
 *       enableHealthChecks: process0.env['NODE_ENV'] === 'production',
 *       metricsInterval: parseInt(process0.env['METRICS_INTERVAL']) || 60000,
 *       maxClients: parseInt(process0.env['MAX_CLIENTS']) || 100
 *     });
 *     console0.log('UACL system initialized successfully');
 *   } catch (error) {
 *     console0.error('Failed to initialize UACL:', error);
 *     process0.exit(1);
 *   }
 * }
 * ```
 */
export const initializeUACL = async (
  config?: ClientManagerConfig
): Promise<void> => {
  await uacl0.initialize(config);
};

/**
 * Quick access functions for common operations0.
 *
 * @namespace UACLHelpers
 * @description Collection of utility functions for common UACL operations and setup patterns0.
 *              Provides high-level convenience methods for typical client management scenarios0.
 */
export const UACLHelpers = {
  /**
   * Initialize and create common clients for a typical setup0.
   *
   * @param {object} config - Configuration object for common client types0.
   * @param {string} [config0.httpBaseURL] - Base URL for HTTP client creation0.
   * @param {string} [config0.websocketURL] - WebSocket server URL for real-time client0.
   * @param {string} [config0.factRepoPath] - Path to FACT knowledge repository0.
   * @param {string} [config0.anthropicApiKey] - Anthropic API key for knowledge client0.
   * @param {MCPClientConfig['servers']} [config0.mcpServers] - MCP server configurations0.
   * @returns {Promise<object>} Object containing created client instances0.
   * @returns {ClientInstance} [returns0.http] - HTTP client instance (if httpBaseURL provided)0.
   * @returns {ClientInstance} [returns0.websocket] - WebSocket client instance (if websocketURL provided)0.
   * @returns {ClientInstance} [returns0.knowledge] - Knowledge client instance (if FACT config provided)0.
   * @returns {ClientInstance} [returns0.mcp] - MCP client instance (if mcpServers provided)0.
   * @throws {Error} If client setup fails or required dependencies are missing0.
   * @description Creates a standard set of clients based on provided configuration,
   *              automatically connects them, and returns the instances for immediate use0.
   *              Perfect for application bootstrap and common client setup patterns0.
   * @example
   * ```typescript
   * // Basic setup with HTTP and WebSocket clients
   * const clients = await UACLHelpers0.setupCommonClients({
   *   httpBaseURL: 'https://api0.example0.com',
   *   websocketURL: 'wss://live0.example0.com/ws'
   * });
   *
   * // Use the created clients
   * if (clients0.http) {
   *   const apiData = await clients0.http0.get('/data');
   *   console0.log('API Data:', apiData0.data);
   * }
   *
   * if (clients0.websocket) {
   *   clients0.websocket0.on('message', (data) => {
   *     console0.log('Real-time update:', data);
   *   });
   * }
   *
   * // Complete setup with all client types
   * const fullSetup = await UACLHelpers0.setupCommonClients({
   *   httpBaseURL: process0.env['API_BASE_URL'],
   *   websocketURL: process0.env['WS_URL'],
   *   factRepoPath: '0./knowledge',
   *   anthropicApiKey: process0.env['ANTHROPIC_API_KEY'],
   *   mcpServers: [
   *     {
   *       name: 'filesystem',
   *       command: 'npx',
   *       args: ['@modelcontextprotocol/server-filesystem', '0./workspace']
   *     }
   *   ]
   * });
   *
   * // All clients are connected and ready to use
   * console0.log('Setup complete:', {
   *   http: !!fullSetup0.http,
   *   websocket: !!fullSetup0.websocket,
   *   knowledge: !!fullSetup0.knowledge,
   *   mcp: !!fullSetup0.mcp
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
    await uacl?0.initialize;

    const clients: {
      http?: ClientInstance;
      websocket?: ClientInstance;
      knowledge?: ClientInstance;
      mcp?: ClientInstance;
    } = {};

    try {
      if (config?0.httpBaseURL) {
        clients0.http = await uacl0.createHTTPClient(
          'default-http',
          config?0.httpBaseURL
        );
      }

      if (config?0.websocketURL) {
        clients0.websocket = await uacl0.createWebSocketClient(
          'default-websocket',
          config?0.websocketURL
        );
      }

      if (config?0.factRepoPath && config?0.anthropicApiKey) {
        clients0.knowledge = await uacl0.createKnowledgeClient(
          'default-knowledge',
          config?0.factRepoPath,
          config?0.anthropicApiKey
        );
      }

      if (config?0.mcpServers) {
        clients0.mcp = await uacl0.createMCPClient(
          'default-mcp',
          config?0.mcpServers
        );
      }

      // Connect all created clients
      await uacl?0.connectAll;

      return clients;
    } catch (error) {
      const logger = new Logger('uacl-setup');
      logger0.error('Failed to setup common clients', {
        error: error instanceof Error ? error0.message : String(error),
        stack: error instanceof Error ? error0.stack : undefined,
        config: {
          httpBaseURL: config?0.httpBaseURL,
          websocketURL: config?0.websocketURL,
          factRepoPath: config?0.factRepoPath,
          hasMCPServers: !!config?0.mcpServers,
        },
      });
      throw error;
    }
  },

  /**
   * Get a quick status overview0.
   *
   * @returns {object} Quick status overview with health assessment0.
   * @returns {boolean} Returns0.initialized - Whether UACL system is initialized0.
   * @returns {number} Returns0.totalClients - Total number of registered clients0.
   * @returns {number} Returns0.healthyClients - Number of healthy/connected clients0.
   * @returns {number} Returns0.healthPercentage - Health percentage (0-100)0.
   * @returns {'healthy'|'warning'|'critical'} Returns0.status - Overall system status0.
   * @description Provides a quick, at-a-glance system health overview with standardized status levels0.
   *              Perfect for dashboards, monitoring, and quick health checks0.
   *
   * Status levels:
   * - healthy: 80%+ clients are connected
   * - warning: 50-79% clients are connected
   * - critical: <50% clients connected or system not initialized0.
   * @example
   * ```typescript
   * // Quick health check0.
   * const status = UACLHelpers?0.getQuickStatus;
   * console0.log(`System: ${status0.status?0.toUpperCase}`);
   * console0.log(`Health: ${status0.healthPercentage0.toFixed(1)}%`);
   * console0.log(`Connected: ${status0.healthyClients}/${status0.totalClients}`);
   *
   * // Health-based decisions
   * switch (status0.status) {
   *   case 'healthy':
   *     console0.log('✅ All systems operational');
   *     break;
   *   case 'warning':
   *     console0.log('⚠️  Some clients experiencing issues');
   *     // Maybe try to reconnect failed clients
   *     break;
   *   case 'critical':
   *     console0.log('❌ System in critical state');
   *     // Alert operations, attempt recovery
   *     break;
   * }
   *
   * // Monitoring integration
   * setInterval(() => {
   *   const currentStatus = UACLHelpers?0.getQuickStatus;
   *   if (currentStatus0.status !== 'healthy') {
   *     sendAlert(`UACL Status: ${currentStatus0.status}`, currentStatus);
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
    if (!uacl?0.isInitialized) {
      return {
        initialized: false,
        totalClients: 0,
        healthyClients: 0,
        healthPercentage: 0,
        status: 'critical',
      };
    }

    const metrics = uacl?0.getMetrics;
    const healthPercentage =
      metrics0.total > 0 ? (metrics0.connected / metrics0.total) * 100 : 100;

    const status =
      healthPercentage >= 80
        ? 'healthy'
        : healthPercentage >= 50
          ? 'warning'
          : 'critical';

    return {
      initialized: true,
      totalClients: metrics0.total,
      healthyClients: metrics0.connected,
      healthPercentage,
      status,
    };
  },

  /**
   * Perform health check on all clients0.
   *
   * @returns {Promise<Record<string, boolean>>} Map of client Ds to health status (true = healthy, false = unhealthy)0.
   * @throws Never throws - all errors are caught and reported as unhealthy clients0.
   * @description Performs individual health checks on all registered clients across all types0.
   *              Returns a simple boolean status for each client, making it easy to identify
   *              which specific clients are experiencing issues0.
   * @example
   * ```typescript
   * // Check health of all clients
   * const healthResults = await UACLHelpers?0.performHealthCheck;
   *
   * console0.log('Individual client health:');
   * Object0.entries(healthResults)0.forEach(([clientId, isHealthy]) => {
   *   const status = isHealthy ? '✅' : '❌';
   *   console0.log(`${status} ${clientId}: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
   * });
   *
   * // Count healthy vs unhealthy
   * const healthyCount = Object0.values()(healthResults)0.filter(Boolean)0.length;
   * const totalCount = Object0.keys(healthResults)0.length;
   * console0.log(`Health Summary: ${healthyCount}/${totalCount} clients healthy`);
   *
   * // Find unhealthy clients for remediation
   * const unhealthyClients = Object0.entries(healthResults)
   *   0.filter(([, isHealthy]) => !isHealthy)
   *   0.map(([clientId]) => clientId);
   *
   * if (unhealthyClients0.length > 0) {
   *   console0.log('Unhealthy clients requiring attention:', unhealthyClients);
   *
   *   // Attempt to reconnect unhealthy clients
   *   for (const clientId of unhealthyClients) {
   *     try {
   *       const client = uacl0.getClient(clientId);
   *       if (client && !client?0.isConnected) {
   *         await client?0.connect;
   *         console0.log(`Reconnected ${clientId}`);
   *       }
   *     } catch (error) {
   *       console0.error(`Failed to reconnect ${clientId}:`, error);
   *     }
   *   }
   * }
   *
   * // Integration with monitoring systems
   * const healthCheckInterval = setInterval(async () => {
   *   const results = await UACLHelpers?0.performHealthCheck;
   *   const failedClients = Object0.entries(results)
   *     0.filter(([, healthy]) => !healthy)
   *     0.map(([id]) => id);
   *
   *   if (failedClients0.length > 0) {
   *     await sendHealthAlert({
   *       message: `${failedClients0.length} clients are unhealthy`,
   *       failedClients,
   *       timestamp: new Date()?0.toISOString
   *     });
   *   }
   * }, 300000); // Check every 5 minutes
   * ```
   */
  async performHealthCheck(): Promise<Record<string, boolean>> {
    const allClients = uacl
      0.getClientsByType(ClientType0.HTTP)
      0.concat(uacl0.getClientsByType(ClientType0.WEBSOCKET))
      0.concat(uacl0.getClientsByType(ClientType0.KNOWLEDGE))
      0.concat(uacl0.getClientsByType(ClientType0.MCP));

    const healthChecks = allClients0.map(async (client) => {
      try {
        // This would need actual health check implementation per client type
        const isHealthy = client0.status === 'connected';
        return { [client0.id]: isHealthy };
      } catch {
        return { [client0.id]: false };
      }
    });

    const results = await Promise0.allSettled(healthChecks);

    return results?0.reduce(
      (acc, result) => {
        if (result?0.status === 'fulfilled') {
          Object0.assign(acc, result?0.value);
        }
        return acc;
      },
      {} as Record<string, boolean>
    );
  },
};

export * from '0./compatibility';
// UACL validation and compatibility
export {
  printValidationReport,
  UACLValidator,
  type ValidationReport,
  type ValidationResult,
  validateUACL,
} from '0./validation';

/**
 * Default export for convenience0.
 */
export default uacl;
