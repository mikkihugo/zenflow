/**
 * @fileoverview UACL (Unified API Client Layer) - Main Exports
 *
 * Central export point for all UACL functionality including:
 * - Client registry and management system
 * - Client factory implementations
 * - Type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization
 *
 * The UACL provides a unified interface for managing HTTP, WebSocket,
 * Knowledge, and MCP clients with consistent patterns for authentication,
 * retry logic, health monitoring, and metrics collection.
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';

// Core UACL components
export {
  ClientRegistry,
  getClientRegistry,
  initializeClientRegistry,
  resetClientRegistry

} from './core/client-registry';
export type {
  Client,
  ClientConfig,
  ClientFactory,
  ClientInstance,
  ClientType,
  ClientResponse,
  ClientError,
  ClientMetrics,
  HealthCheckResult,
  AuthenticationConfig,
  RetryConfig,
  RateLimitConfig,
  LoggingConfig,
  CircuitBreakerConfig,
  CacheConfig,
  TimeoutConfig

} from './core/interfaces';

// Client factories and implementations
export {
  UACLFactory,
  MultiClientCoordinator,
  LoadBalancedClient

} from './factories';
export { HTTPClientFactory } from './factories/http-client-factory';
export { HTTPClientAdapter } from './adapters/http-client-adapter';
export { WebSocketClientAdapter } from './adapters/websocket-client-adapter';
export { KnowledgeClientAdapter } from './adapters/knowledge-client-adapter';
export { MCPClientAdapter } from './adapters/mcp-client-adapter';

// HTTP client types and utilities
export type {
  HTTPClientConfig,
  HTTPMethod
} from './adapters/http-types';
export {
  APIClient,
  createAPIClient

} from './api/http/client';

// WebSocket client types and utilities
export type { WebSocketClientConfig } from './adapters/websocket-types';
export { WebSocketClient } from './api/websocket/client';

// Knowledge client integration
export { FACTIntegration } from '../knowledge/knowledge-client';

// MCP client integration
export { ExternalMCPClient } from './mcp/external-mcp-client';

// Type definitions and enums
export {
  ClientType,
  ProtocolType,
  ClientStatus

} from './types';

// Client manager functionality
export { ClientManager } from './manager';
export { ClientInstanceManager } from './instance';

// Client validation and type guards
export {
  ValidationHelpers,
  ClientValidation

} from './validation';

/**
 * Client manager configuration interface.
 */
export interface ClientManagerConfig {
  /** Enable automatic health checking */
  enableHealthChecks?: boolean;
  /** Metrics collection interval in milliseconds */
  metricsInterval?: number;
  /** Maximum number of concurrent clients */
  maxClients?: number;
  /** Enable automatic retry mechanisms */
  enableRetries?: boolean;
  /** Enable performance metrics collection */
  enableMetrics?: boolean;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number

}

/**
 * System-wide metrics interface.
 */
export interface SystemMetrics {
  /** Total number of clients */
  total: number;
  /** Number of connected clients */
  connected: number;
  /** Number of disconnected clients */
  disconnected: number;
  /** Number of clients in error state */
  error: number;
  /** Total requests across all clients */
  totalRequests: number;
  /** Total errors across all clients */
  totalErrors: number;
  /** Average latency across all clients */
  averageLatency: number;
  /** Combined throughput of all clients */
  totalThroughput: number

}

/**
 * System health status interface.
 */
export interface SystemHealthStatus {
  /** Overall system status */
  status: 'healthy' | 'degraded' | 'critical';
  /** Total number of clients */
  totalClients: number;
  /** Number of healthy clients */
  healthyClients: number;
  /** Number of degraded clients */
  degradedClients: number;
  /** Number of unhealthy clients */
  unhealthyClients: number;
  /** Health breakdown by client type */
  byType: Record<string, {
  total: number;
  healthy: number;
  degraded: number;
  unhealthy: number

}>
}

/**
 * UACL Main Interface - Singleton Pattern.
 *
 * Primary interface for interacting with the Unified API Client Layer.
 * Provides high-level methods for client management and operations.
 */
export class UACL {
  private static instance: UACL;
  private initialized = false;
  private clientRegistry: ClientRegistry;
  private logger = getLogger('UACL);

  private constructor(' {
    this.clientRegistry = getClientRegistry()
}

  /**
   * Get singleton UACL instance.
   */
  static getInstance(): UACL  {
    if (!UACL.instance) {
      UACL.instance = new UACL()
}
    return UACL.instance
}

  /**
   * Initialize UACL system.
   */
  async initialize(config?: ClientManagerConfig): Promise<void>  {
    if (this.initialized) {
      return
}

    try {
  await this.clientRegistry.initialize();
      this.initialized = true;
      this.logger.info('UACL system initialized)'

} catch (error) {
  this.logger.error('Failed to initialize UACL system:','
  error)';
      throw error

}
  }

  /**
   * Check if UACL is initialized.
   */
  isInitialized(
  ': boolean {
    return this.initialized
}

  /**
   * Create and register HTTP client.
   */
  async createHTTPClient(
    id: string,
  baseURL: string,
  options: Partial<ClientConfig> = {}
): Promise<ClientInstance>  {
    if (!this.initialized) {
      await this.initialize()
}

    try {
      const factory = new UACLFactory();
      const client = await factory.createHttpClient(
  baseURL,
  {
  name: id,
  baseURL,
  ...options

}
);

      const clientInstance: ClientInstance = {
        ...client,
        id,
        name: id,
        createdAt: new Date(),
        tags: ['http],
        metadata: {
  tye: 'http',
  baseURL
}
      };

      this.clientRegistry.registerClient(id, clientInstance);
      this.logger.info('Created HTTP client: ' + id + ')';
      return clientInstance
} catch (error) {
      this.logger.error('Failed to create HTTP client ' + id + ':', error);;
      throw error
}
  }

  /**
   * Create and register WebSocket client.
   */
  async createWebSocketClient(
  id: string,
  url: string,
  options: Partial<ClientConfig> = {}
  ': Promise<ClientInstance> {
    if (!this.initialized
) {
      await this.initialize()
}

    try {
      const factory = new UACLFactory();
      const client = await factory.createWebSocketClient(
  url,
  {
  name: id,
  baseURL: url,
  ...options

}
);

      const clientInstance: ClientInstance = {
        ...client,
        id,
        name: id,
        createdAt: new Date(),
        tags: ['websocket],
        meadata: {
  type: 'websocket',
  url
}
      };

      'his.clientRegistry.registerClient(id, clientInstance);
      this.logger.info('Created WebSocket client: ' + id + ')';
      return clientInstance
} catch (error) {
      this.logger.error('Failed to create WebSocket client ' + id + ':', error);;
      throw error
}
  }

  /**
   * Create and register Knowledge client.
   */
  async createKnowledgeClient(
  id: string,
  factRepoPath: string,
  anthropicApiKey: string,
    options: Partial<ClientConfig> = {}
  ': Promise<ClientInstance> {
    if (!this.initialized
) {
      await this.initialize()
}

    try {
      const factory = new UACLFactory();
      const client = await factory.createKnowledgeClient(
  factRepoPath,
  {
        name: id,
  baseURL: factRepoPath,
        auth: {
  type: 'bearer',
  token: anth'opicApiKey

},
        ...options
      }
);

      const clientInstance: ClientInstance = {
        ...client,
        id,
        name: id,
        createdAt: new Date(),
        tags: ['knowledge],
        mtadata: {
  type: 'knowledge',
  factR'poPath
}
      };

      this.clientRegistry.registerClient(id, clientInstance);
      this.logger.info('Created Knowledge client: ' + id + ')';
      return clientInstance
} catch (error) {
      this.logger.error('Failed to create Knowledge client ' + id + ':', error);;
      throw error
}
  }

  /**
   * Create and register MCP client.
   */
  async createMCPClient(
  id: string,
  serverUrl: string,
  options: Partial<ClientConfig> = {}
  ': Promise<ClientInstance> {
    if (!this.initialized
) {
      await this.initialize()
}

    try {
      const factory = new UACLFactory();
      const client = await factory.createMcpClient(
  serverUrl,
  {
  name: id,
  baseURL: serverUrl,
  ...options

}
);

      const clientInstance: ClientInstance = {
        ...client,
        id,
        name: id,
        createdAt: new Date(),
        tags: ['mcp],
        metadata: {
  tye: 'mcp',
  serverUrl
}
      };

      this.clientRegistry.registerClient(id, clientInstance);
      this.logger.info('Created MCP client: ' + id + ')';
      return clientInstance
} catch (error) {
      this.logger.error('Failed to create MCP client ' + id + ':', error);;
      throw error
}
  }

  /**
   * Get client by ID.
   */
  getClient(clientId: string: ClientInstance | undefined {
    return this.clientRegistry.getClient(clientId)
}

  /**
   * Get all clients of a specific type.
   */
  getClientsByType(type: string): ClientInstance[]  {
  const allClients = this.clientRegistry.getAllClients();
    return allClients.filter(client => client.metadata?.type === type)

}

  /**
   * Get best available client for a type.
   */
  getBestClient(type: string): ClientInstance | undefined  {
    const clients = this.getClientsByType(type);

    // Filter for healthy, connected clients
    const healthyClients = clients.filter(client =>
      client.isConnected && client.isInitialized
    );

    if (healthyClients.length === 0) {
      return undefined
}

    // Return the first healthy client (could be enhanced with load balancing)
    return healthyClients[0]
}

  /**
   * Get system health status.
   */
  async getHealthStatus(): Promise<SystemHealthStatus>  {
    const allClients = this.clientRegistry.getAllClients();
    const totalClients = allClients.length;
    let healthyClients = 0;
    let degradedClients = 0;
    let unhealthyClients = 0;

    const byType: Record<string, {
  total: number; healthy: number; degraded: number; unhealthy: number
}> = {};

    // Check health of each client
    for (const client of allClients) {
      const clientType = client.metadata?.type || 'unknown';

      if (!byType[clientType]) {
        byType[clientType] = {
  total: 0,
  healthy: 0,
  degraded: 0,
  unhealthy: 0
}
}
      byType[clientType].total++;

      try {
        if (client.isConnected && client.isInitialized) {
          const healthResult = await client.healthCheck();

          switch (healthResult.status) {
  case healthy:
              health'Clients++;
              byType[clientType].healthy++;
              break;
            case degraded:
              'egradedClients++;
              byType[clientType].degraded++;
              break;
            case unhealthy:
            default:'
              unhealth'Clients++;
              byType[clientType].unhealthy++;
              break

}
        } else {
  unhealthyClients++;
          byType[clientType].unhealthy++

}
      } catch (error) {
  unhealthyClients++;
        byType[clientType].unhealthy++

}
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'critical';
    if (unhealthyClients === 0) {
      status = 'healthy'
} else if (healthyClients > unhealthyClients) {
      status = 'degraded'
} else {
      status = 'critical'
}

    return {
  status,
  totalClients,
  healthyClients,
  degradedClients,
  unhealthyClients,
  byType

}
}

  /**
   * Get aggregated metrics.
   */
  async getMetrics(): Promise<SystemMetrics>  {
    const allClients = this.clientRegistry.getAllClients();

    let totalRequests = 0;
    let totalErrors = 0;
    let totalLatency = 0;
    let connectedCount = 0;
    let disconnectedCount = 0;
    let errorCount = 0;

    // Aggregate metrics from all clients
    for (const client of allClients) {
      if (client.isConnected) {
        connectedCount++
} else {
        disconnectedCount++
}

      try {
  const metrics = await client.getMetrics();
        totalRequests += metrics.totalOperations;
        totalErrors += metrics.failedOperations;
        totalLatency += metrics.averageLatency

} catch (error) {
        errorCount++
}
    }

    const averageLatency = allClients.length > 0 ? totalLatency / allClients.length : 0;

    return {
  total: allClients.length,
  connected: connectedCount,
  disconnected: disconnectedCount,
  error: errorCount,
  totalRequests,
  totalErrors,
  averageLatency,
  totalThroughput: 0 // Would need real-time calculation

}
}

  /**
   * Connect all clients.
   */
  async connectAll(): Promise<void>  {
    const allClients = this.clientRegistry.getAllClients();
    const connectionPromises = allClients.map(async (client) => {
      try {
        if (!client.isConnected) {
          await client.connect()
}
      } catch (error) {
        this.logger.warn('Failed to connect client ' + client.id + ':', error)'
}
    });

    await Promise.allSettled(connectionPromises)
}

  /**
   * Disconnect all clients.
   */
  async disconnectAll(': Promise<void> {
    const allClients = this.clientRegistry.getAllClients();
    const disconnectionPromises = allClients.map(async (client) => {
      try {
        if (client.isConnected) {
          await client.disconnect()
}
      } catch (error) {
        this.logger.warn('Failed to disconnect client ' + client.id + ':', error)'
}
    });

    await Promise.allSettled(disconnectionPromises)
}

  /**
   * Shutdown UACL system.
   */
  async shutdown(': Promise<void> {
    if (!this.initialized) {
      return
}

    try {
  await this.disconnectAll();
      await this.clientRegistry.shutdown();
      this.initialized = false;
      this.logger.info(`UACL system shutdown completed)'

} catch (error) {
  this.logger.error('Error during UACL shutdown:','
  error)';
      throw error

}
  }
}

/**
 * Global UACL instance for convenience.
 */
export const uacl = UACL.getInstance();

/**
 * Initialize UACL with default configuration.
 */
export async function initializeUACL(config?: ClientManagerConfig: Promise<void> {
  return uacl.initialize(config)
}

/**
 * Convenience functions for quick client creation.
 */

/**
 * Create HTTP client with minimal configuration.
 */
export async function createHTTPClient(
  id: string,
  baseURL: string,
  options?: Partial<ClientConfig>
): Promise<ClientInstance>  {
  return uacl.createHTTPClient(
  id,
  baseURL,
  options
)

}

/**
 * Create WebSocket client with minimal configuration.
 */
export async function createWebSocketClient(
  id: string,
  url: string,
  options?: Partial<ClientConfig>
): Promise<ClientInstance>  {
  return uacl.createWebSocketClient(
  id,
  url,
  options
)

}

/**
 * Create Knowledge client with minimal configuration.
 */
export async function createKnowledgeClient(
  id: string,
  factRepoPath: string,
  anthropicApiKey: string,
  options?: Partial<ClientConfig>
): Promise<ClientInstance>  {
  return uacl.createKnowledgeClient(
  id,
  factRepoPath,
  anthropicApiKey,
  options
)

}

/**
 * Create MCP client with minimal configuration.
 */
export async function createMCPClient(
  id: string,
  serverUrl: string,
  options?: Partial<ClientConfig>
): Promise<ClientInstance>  {
  return uacl.createMCPClient(
  id,
  serverUrl,
  options
)

}

// Default export
export default {
  UACL,
  uacl,
  initializeUACL,
  createHTTPClient,
  createWebSocketClient,
  createKnowledgeClient,
  createMCPClient

};