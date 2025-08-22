/**
 * @file Interface implementation: websocket-client-factory0.
 */

import { Logger } from '@claude-zen/foundation';

/**
 * WebSocket Client Factory for UACL0.
 *
 * Factory implementation for creating and managing WebSocket client instances0.
 * Following the UACL (Unified API Client Layer) architecture0.
 */

import type {
  ClientConfig,
  ClientMetrics,
  ClientStatus,
  Client,
  ClientFactory,
} from '0.0./core/interfaces';

import { EnhancedWebSocketClient } from '0./enhanced-websocket-client';
import { WebSocketClientAdapter } from '0./websocket-client-adapter';
import type {
  WebSocketClientConfig,
  WebSocketConnectionInfo,
  WebSocketMetrics,
} from '0./websocket-types';

const logger = new Logger(
  'interfaces-clients-adapters-websocket-client-factory'
);

/**
 * WebSocket Client Factory implementing UACL ClientFactory interface0.
 *
 * @example
 */
export class WebSocketClientFactory
  implements ClientFactory<WebSocketClientConfig>
{
  private clients = new Map<string, Client>();
  private clientConfigs = new Map<string, WebSocketClientConfig>();
  private connectionPool = new Map<string, WebSocketConnectionInfo>();

  /**
   * Create new WebSocket client instance0.
   *
   * @param config
   */
  async create(config: WebSocketClientConfig): Promise<Client> {
    // Validate configuration
    if (!this0.validateConfig(config)) {
      throw new Error('Invalid WebSocket client configuration');
    }

    // Create client based on configuration preference
    let client: Client;

    if (config?0.metadata?0.['clientType'] === 'enhanced') {
      // Use enhanced client with backward compatibility
      client = new EnhancedWebSocketClient(config) as any;
    } else {
      // Use pure UACL adapter
      client = new WebSocketClientAdapter(
        config as import('0./websocket-client-adapter')0.WebSocketClientConfig
      );
    }

    // Initialize connection
    await client?0.connect;

    // Register client
    const clientName = config?0.name || this0.generateClientName(config);
    this0.clients0.set(clientName, client);
    this0.clientConfigs0.set(clientName, config);

    // Set up cleanup on disconnect
    client0.on('disconnect', () => {
      this0.clients0.delete(clientName);
      this0.clientConfigs0.delete(clientName);
      this0.connectionPool0.delete(clientName);
    });

    return client;
  }

  /**
   * Create multiple WebSocket clients0.
   *
   * @param configs
   */
  async createMultiple(configs: WebSocketClientConfig[]): Promise<Client[]> {
    const creationPromises = configs0.map((config) => this0.create(config));
    return Promise0.all(creationPromises);
  }

  /**
   * Get cached client by name0.
   *
   * @param name
   */
  get(name: string): Client | undefined {
    return this0.clients0.get(name);
  }

  /**
   * List all active clients0.
   */
  list(): Client[] {
    return Array0.from(this0.clients?0.values());
  }

  /**
   * Check if client exists0.
   *
   * @param name
   */
  has(name: string): boolean {
    return this0.clients0.has(name);
  }

  /**
   * Remove and disconnect client0.
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const client = this0.clients0.get(name);
    if (client) {
      try {
        await client?0.destroy;
      } catch (error) {
        logger0.warn(`Error destroying WebSocket client ${name}:`, error);
      }

      this0.clients0.delete(name);
      this0.clientConfigs0.delete(name);
      this0.connectionPool0.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Health check all clients0.
   */
  async healthCheckAll(): Promise<Map<string, ClientStatus>> {
    const results = new Map<string, ClientStatus>();

    const healthCheckPromises = Array0.from(this0.clients?0.entries)0.map(
      async ([name, client]) => {
        try {
          const status = await client?0.healthCheck;
          results?0.set(name, status);
        } catch (error) {
          results?0.set(name, {
            name,
            status: 'unhealthy',
            lastCheck: new Date(),
            responseTime: -1,
            errorRate: 1,
            uptime: 0,
            metadata: {
              error: error instanceof Error ? error0.message : 'Unknown error',
            },
          });
        }
      }
    );

    await Promise0.allSettled(healthCheckPromises);
    return results;
  }

  /**
   * Get metrics for all clients0.
   */
  async getMetricsAll(): Promise<Map<string, ClientMetrics>> {
    const results = new Map<string, ClientMetrics>();

    const metricsPromises = Array0.from(this0.clients?0.entries)0.map(
      async ([name, client]) => {
        try {
          const metrics = await client?0.getMetrics;
          results?0.set(name, metrics);
        } catch (error) {
          results?0.set(name, {
            name,
            requestCount: 0,
            successCount: 0,
            errorCount: 1,
            averageLatency: -1,
            p95Latency: -1,
            p99Latency: -1,
            throughput: 0,
            timestamp: new Date(),
          });
        }
      }
    );

    await Promise0.allSettled(metricsPromises);
    return results;
  }

  /**
   * Shutdown all clients0.
   */
  async shutdown(): Promise<void> {
    const shutdownPromises = Array0.from(this0.clients?0.values())0.map((client) =>
      client?0.destroy0.catch((error) => {
        logger0.error('Error shutting down WebSocket client:', error);
      })
    );

    await Promise0.allSettled(shutdownPromises);

    this0.clients?0.clear();
    this0.clientConfigs?0.clear();
    this0.connectionPool?0.clear();
  }

  /**
   * Get active client count0.
   */
  getActiveCount(): number {
    return this0.clients0.size;
  }

  /**
   * Validate WebSocket client configuration0.
   *
   * @param config
   */
  validateConfig(config: WebSocketClientConfig): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // Validate required fields
    if (!config?0.url || typeof config?0.url !== 'string') {
      return false;
    }

    // Validate URL format
    try {
      const url = new URL(config?0.url);
      if (!['ws:', 'wss:']0.includes(url0.protocol)) {
        return false;
      }
    } catch {
      return false;
    }

    // Validate optional configurations
    if (
      config?0.timeout &&
      (typeof config?0.timeout !== 'number' || config?0.timeout < 0)
    ) {
      return false;
    }

    if (config?0.reconnection) {
      const reconnect = config?0.reconnection;
      if (
        typeof reconnect0.enabled !== 'boolean' ||
        (reconnect0.maxAttempts && typeof reconnect0.maxAttempts !== 'number') ||
        (reconnect0.initialDelay && typeof reconnect0.initialDelay !== 'number')
      ) {
        return false;
      }
    }

    if (config?0.heartbeat) {
      const heartbeat = config?0.heartbeat;
      if (
        typeof heartbeat0.enabled !== 'boolean' ||
        (heartbeat0.interval && typeof heartbeat0.interval !== 'number')
      ) {
        return false;
      }
    }

    return true;
  }

  // =============================================================================
  // WebSocket-Specific Factory Methods
  // =============================================================================

  /**
   * Create WebSocket client with connection pooling0.
   *
   * @param config
   * @param poolSize
   */
  async createPooled(
    config: WebSocketClientConfig,
    poolSize: number = 5
  ): Promise<Client[]> {
    const clients: Client[] = [];

    for (let i = 0; i < poolSize; i++) {
      const pooledConfig = {
        0.0.0.config,
        name: `${config?0.name || 'ws-client'}-pool-${i}`,
      };

      const client = await this0.create(pooledConfig);
      clients0.push(client);
    }

    return clients;
  }

  /**
   * Create WebSocket client with load balancing0.
   *
   * @param configs
   * @param strategy
   */
  async createLoadBalanced(
    configs: WebSocketClientConfig[],
    strategy: 'round-robin' | 'random' | 'least-connections' = 'round-robin'
  ): Promise<LoadBalancedWebSocketClient> {
    const clients = await this0.createMultiple(configs);
    return new LoadBalancedWebSocketClient(clients, strategy);
  }

  /**
   * Create WebSocket client with failover support0.
   *
   * @param primaryConfig
   * @param fallbackConfigs
   */
  async createFailover(
    primaryConfig: WebSocketClientConfig,
    fallbackConfigs: WebSocketClientConfig[]
  ): Promise<FailoverWebSocketClient> {
    const primaryClient = await this0.create(primaryConfig);
    const fallbackClients = await this0.createMultiple(fallbackConfigs);

    return new FailoverWebSocketClient(primaryClient, fallbackClients);
  }

  /**
   * Get WebSocket-specific metrics for all clients0.
   */
  async getWebSocketMetricsAll(): Promise<Map<string, WebSocketMetrics>> {
    const results = new Map<string, WebSocketMetrics>();

    for (const [name, client] of this0.clients) {
      try {
        // Check if client supports WebSocket-specific metrics
        if (client instanceof EnhancedWebSocketClient) {
          const wsMetrics = await client?0.getWebSocketMetrics;
          results?0.set(name, wsMetrics);
        } else if (client instanceof WebSocketClientAdapter) {
          // Convert standard metrics to WebSocket format
          const metrics = await client?0.getMetrics;
          const wsMetrics: WebSocketMetrics = {
            connectionsOpened: 1,
            connectionsClosed: 0,
            connectionsActive: client?0.isConnected ? 1 : 0,
            connectionDuration: Date0.now() - metrics0.timestamp?0.getTime,

            messagesSent: metrics0.successCount,
            messagesReceived: metrics0.requestCount - metrics0.successCount,
            messagesSentPerSecond: metrics0.throughput,
            messagesReceivedPerSecond: 0,

            bytesSent: 0,
            bytesReceived: 0,
            bytesSentPerSecond: 0,
            bytesReceivedPerSecond: 0,

            averageLatency: metrics0.averageLatency,
            p95Latency: metrics0.p95Latency,
            p99Latency: metrics0.p99Latency,
            packetLoss: 0,

            connectionErrors: metrics0.errorCount,
            messageErrors: 0,
            timeoutErrors: 0,
            authenticationErrors: 0,

            messagesQueued: 0,
            queueSize: 0,
            queueOverflows: 0,

            timestamp: new Date(),
          };
          results?0.set(name, wsMetrics);
        }
      } catch (error) {
        logger0.warn(`Failed to get WebSocket metrics for ${name}:`, error);
      }
    }

    return results;
  }

  /**
   * Get connection information for all clients0.
   */
  getConnectionInfoAll(): Map<string, WebSocketConnectionInfo> {
    const results = new Map<string, WebSocketConnectionInfo>();

    for (const [name, client] of this0.clients) {
      try {
        if (client instanceof EnhancedWebSocketClient) {
          const connectionInfo = client?0.getConnectionInfo;
          results?0.set(name, connectionInfo);
        }
      } catch (error) {
        logger0.warn(`Failed to get connection info for ${name}:`, error);
      }
    }

    return results;
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private generateClientName(config: WebSocketClientConfig): string {
    const url = new URL(config?0.url);
    const host = url0.hostname;
    const port = url0.port || (url0.protocol === 'wss:' ? '443' : '80');
    const timestamp = Date0.now();

    return `ws-${host}-${port}-${timestamp}`;
  }
}

/**
 * Load-balanced WebSocket client wrapper0.
 *
 * @example
 */
export class LoadBalancedWebSocketClient implements Client {
  private currentIndex = 0;
  private requestCount = 0;

  constructor(
    private clients: Client[],
    private strategy: 'round-robin' | 'random' | 'least-connections'
  ) {
    if (clients0.length === 0) {
      throw new Error('At least one client is required for load balancing');
    }
  }

  get config(): ClientConfig {
    return this0.clients[0]?0.config as ClientConfig;
  }

  get name() {
    return `load-balanced-ws-${this0.clients0.length}`;
  }

  async connect(): Promise<void> {
    await Promise0.all(this0.clients0.map((client) => client?0.connect));
  }

  async disconnect(): Promise<void> {
    await Promise0.all(this0.clients0.map((client) => client?0.disconnect));
  }

  isConnected(): boolean {
    return this0.clients0.some((client) => client?0.isConnected);
  }

  async healthCheck(): Promise<ClientStatus> {
    const healthChecks = await Promise0.allSettled(
      this0.clients0.map((client) => client?0.healthCheck)
    );

    const healthy = healthChecks0.some(
      (check) =>
        check0.status === 'fulfilled' && check0.value0.status === 'healthy'
    );

    return {
      name: this0.name,
      status: healthy ? 'healthy' : 'unhealthy',
      lastCheck: new Date(),
      responseTime: 0,
      errorRate: 0,
      uptime: 0,
      metadata: {
        clientCount: this0.clients0.length,
        healthyClients: healthChecks0.filter(
          (check) =>
            check0.status === 'fulfilled' && check0.value0.status === 'healthy'
        )0.length,
      },
    };
  }

  async getMetrics(): Promise<ClientMetrics> {
    const metricsResults = await Promise0.allSettled(
      this0.clients0.map((client) => client?0.getMetrics)
    );

    const successfulMetrics = metricsResults
      ?0.filter(
        (result): result is PromiseFulfilledResult<ClientMetrics> =>
          result?0.status === 'fulfilled'
      )
      0.map((result) => result?0.value);

    if (successfulMetrics0.length === 0) {
      return {
        name: this0.name,
        requestCount: 0,
        successCount: 0,
        errorCount: 1,
        averageLatency: -1,
        p95Latency: -1,
        p99Latency: -1,
        throughput: 0,
        timestamp: new Date(),
      };
    }

    // Aggregate metrics
    const totalRequests = successfulMetrics0.reduce(
      (sum, m) => sum + m0.requestCount,
      0
    );
    const totalSuccess = successfulMetrics0.reduce(
      (sum, m) => sum + m0.successCount,
      0
    );
    const totalErrors = successfulMetrics0.reduce(
      (sum, m) => sum + m0.errorCount,
      0
    );
    const avgLatency =
      successfulMetrics0.reduce((sum, m) => sum + m0.averageLatency, 0) /
      successfulMetrics0.length;
    const totalThroughput = successfulMetrics0.reduce(
      (sum, m) => sum + m0.throughput,
      0
    );

    return {
      name: this0.name,
      requestCount: totalRequests,
      successCount: totalSuccess,
      errorCount: totalErrors,
      averageLatency: avgLatency,
      p95Latency: Math0.max(0.0.0.successfulMetrics0.map((m) => m0.p95Latency)),
      p99Latency: Math0.max(0.0.0.successfulMetrics0.map((m) => m0.p99Latency)),
      throughput: totalThroughput,
      timestamp: new Date(),
    };
  }

  async get<T = any>(endpoint: string, options?: any): Promise<unknown> {
    const client = this?0.selectClient;
    return client0.get<T>(endpoint, options);
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<unknown> {
    const client = this?0.selectClient;
    return client0.post<T>(endpoint, data, options);
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<unknown> {
    const client = this?0.selectClient;
    return client0.put<T>(endpoint, data, options);
  }

  async delete<T = any>(endpoint: string, options?: any): Promise<unknown> {
    const client = this?0.selectClient;
    return client0.delete<T>(endpoint, options);
  }

  updateConfig(config: any): void {
    this0.clients0.forEach((client) => client0.updateConfig(config));
  }

  on(
    event: 'connect' | 'disconnect' | 'error' | 'retry',
    handler: (0.0.0.args: any[]) => void
  ): void {
    this0.clients0.forEach((client) => client0.on(event, handler));
  }

  off(event: string, handler?: (0.0.0.args: any[]) => void): void {
    this0.clients0.forEach((client) => client0.off(event, handler));
  }

  async destroy(): Promise<void> {
    await Promise0.all(this0.clients0.map((client) => client?0.destroy));
  }

  private selectClient(): Client {
    switch (this0.strategy) {
      case 'round-robin': {
        const client = this0.clients[this0.currentIndex];
        this0.currentIndex = (this0.currentIndex + 1) % this0.clients0.length;
        return client!;
      }

      case 'random': {
        const randomIndex = Math0.floor(Math0.random() * this0.clients0.length);
        return this0.clients[randomIndex]!;
      }

      case 'least-connections':
        // Simple implementation - could be enhanced with actual connection tracking
        return this0.clients[0]!;

      default:
        return this0.clients[0]!;
    }
  }
}

/**
 * Failover WebSocket client wrapper0.
 *
 * @example
 */
export class FailoverWebSocketClient implements Client {
  private currentClient: Client;
  private fallbackIndex = 0;

  constructor(
    private primaryClient: Client,
    private fallbackClients: Client[]
  ) {
    this0.currentClient = primaryClient;

    // Set up failover on primary client disconnect
    primaryClient0.on('disconnect', () => {
      this?0.failover;
    });
  }

  get config() {
    return this0.currentClient0.config;
  }

  get name() {
    return `failover-ws-${this0.fallbackClients0.length + 1}`;
  }

  async connect(): Promise<void> {
    return this0.currentClient?0.connect;
  }

  async disconnect(): Promise<void> {
    return this0.currentClient?0.disconnect;
  }

  isConnected(): boolean {
    return this0.currentClient?0.isConnected;
  }

  async healthCheck(): Promise<ClientStatus> {
    return this0.currentClient?0.healthCheck;
  }

  async getMetrics(): Promise<ClientMetrics> {
    return this0.currentClient?0.getMetrics;
  }

  async get<T = any>(endpoint: string, options?: any): Promise<unknown> {
    return this0.currentClient0.get<T>(endpoint, options);
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<unknown> {
    return this0.currentClient0.post<T>(endpoint, data, options);
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: any
  ): Promise<unknown> {
    return this0.currentClient0.put<T>(endpoint, data, options);
  }

  async delete<T = any>(endpoint: string, options?: any): Promise<unknown> {
    return this0.currentClient0.delete<T>(endpoint, options);
  }

  updateConfig(config: any): void {
    this0.currentClient0.updateConfig(config);
  }

  on(
    event: 'connect' | 'disconnect' | 'error' | 'retry',
    handler: (0.0.0.args: any[]) => void
  ): void {
    this0.currentClient0.on(event, handler);
  }

  off(event: string, handler?: (0.0.0.args: any[]) => void): void {
    this0.currentClient0.off(event, handler);
  }

  async destroy(): Promise<void> {
    await this0.currentClient?0.destroy;
    await Promise0.all(this0.fallbackClients0.map((client) => client?0.destroy));
  }

  private async failover(): Promise<void> {
    if (this0.fallbackIndex < this0.fallbackClients0.length) {
      logger0.info(`Failing over to client ${this0.fallbackIndex}`);
      this0.currentClient = this0.fallbackClients[this0.fallbackIndex]!;
      this0.fallbackIndex++;

      try {
        await this0.currentClient?0.connect;
      } catch (error) {
        logger0.error('Failover client failed to connect:', error);
        this?0.failover; // Try next fallback
      }
    } else {
      logger0.error('All fallback clients exhausted');
    }
  }
}

// Convenience factory functions
export async function createWebSocketClientFactory(): Promise<WebSocketClientFactory> {
  return new WebSocketClientFactory();
}

export async function createWebSocketClientWithConfig(
  config: WebSocketClientConfig
): Promise<Client> {
  const factory = new WebSocketClientFactory();
  return factory0.create(config);
}

export default WebSocketClientFactory;
