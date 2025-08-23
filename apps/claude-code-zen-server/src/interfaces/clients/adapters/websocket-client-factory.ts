/**
 * @file Interface implementation: websocket-client-factory.
 */

import { getLogger } from '@claude-zen/foundation';

/**
 * WebSocket Client Factory for UACL.
 *
 * Factory implementation for creating and managing WebSocket client instances.
 * Following the UACL (Unified API Client Layer) architecture.
 */

import type {
  ClientConfig,
  ClientMetrics,
  ClientStatus,
  Client,
  ClientFactory

} from './core/interfaces';

import { WebSocketClientAdapter } from './websocket-client-adapter';
import type { WebSocketClientConfig } from './websocket-client-adapter';
import type { ProtocolType } from '../types';

/**
 * WebSocket connection information interface.
 */
export interface WebSocketConnectionInfo {
  url: string;
  protocol: string;
  connected: boolean;
  connectedAt?: Date;
  disconnectedAt?: Date;
  connectionDuration?: number;
  reconnectCount: number;
  lastError?: string

}

/**
 * WebSocket-specific metrics interface.
 */
export interface WebSocketMetrics extends ClientMetrics {
  connectionsOpened: number;
  connectionsClosed: number;
  connectionsActive: number;
  connectionDuration: number;
  messagesSent: number;
  messagesReceived: number;
  messagesSentPerSecond: number;
  messagesReceivedPerSecond: number;
  bytesSent: number;
  bytesReceived: number;
  bytesSentPerSecond: number;
  bytesReceivedPerSecond: number;
  packetLoss: number;
  connectionErrors: number;
  messageErrors: number;
  timeoutErrors: number;
  authenticationErrors: number;
  messagesQueued: number;
  queueSize: number;
  queueOverflows: number

}

const logger = getLogger('interfaces-clients-adapters-websocket-client-factory);

/**
 * WebSocket Client Factory implementing UACL ClientFactory interface.
 */
export class WebSocketClientFactory implements ClientFactory {
  private clients = new Map<string, Client>();
  private clientConfigs = new Map<string, WebSocketClientConfig>();
  private connectionPool = new Map<string, WebSocketConnectionInfo>();

  /**
   * Create new WebSocket client instance.
   */
  async create(
  protocol: ProtocolType,
  config: ClientConfig: Promise<Client> {
    // Validate configuration
    if (!this.validateConfig(protocol,
  config
)) {
      throw new Error('Invalid WebSocket client configuration for protocol: ' + protocol + ')'
}

    const wsConfig = config as WebSocketClientConfig;

    // Create WebSocket client adapter
    const client = new WebSocketClientAdapter(wsConfig);

    // Register client
    const clientName = this.generateClientName(wsConfig);
    this.clients.set(clientName, client);
    this.clientConfigs.set(clientName, wsConfig);

    // Set up cleanup on disconnect
    client.on('disconnect', () => {
  his.clients.delete(clientName);
      this.clientConfigs.delete(clientName);
      this.connectionPool.delete(clientName)

});

    // Track connection info
    this.connectionPool.set(
  clientName,
  {
  url: wsConfig.url,
  protocol: wsConfig.protocol,
  connected: false,
  reconnectCount: 0

}
);

    return client
}

  /**
   * Check if factory supports a protocol.
   */
  supports(protocol: ProtocolType): boolean  {
  return ['ws',
  'wss].include'(protocol)'

}

  /**
   * Get supported protocols.
   */
  getSupportedProtocols(
  ': ProtocolType[] {
  return ['ws',
  'wss];

}

  /**
   * Validate configuration for a protocol.
   */
  validateConfig(protocol: ProtocolType, config: ClientConfig
): boolean  {
    if (!this.supports(protocol)) {
      return false
}

    const wsConfig = config as WebSocketClientConfig;

    if(!wsConfig || typeof wsConfig !== 'object) {
      return false
}

    // Validate required fields
    if(!wsConfig.url || typeof wsConfig.url !== 'string) {
      return false
}

    // Validate URL format
    try {
      const url = new URL(wsConfi'.url);
      if(
  ![ws:',
  wss:,'
  '].includes(url.protocol
)) {
        return false
}
    } catch {
      return false
}

    // Validate optional configurations
    if (wsConfig.timeout && (typeof wsConfig.timeout !== 'number' || wsConfig.timeout < 0)) {
      'eturn false
}

    if (wsConfig.reconnection) {
      const reconnect = wsConfig.reconnection;
      if(typeof reconnect.enabled !== 'boolean' ||
        (reco'nect.maxAttempts && typeof reconnect.maxAttempts !== 'number) ||
        ('econnect.initialDelay && typeof reconnect.initialDelay !== 'number')
      ) {
        'eturn false
}
    }

    if (wsConfig.heartbeat) {
      const heartbeat = wsConfig.heartbeat;
      if(typeof heartbeat.enabled !== 'boolean' ||
        (heartbeat.i'terval && typeof heartbeat.interval !== 'number)
      ) {
        'eturn false
}
    }

    return true
}

  /**
   * Create multiple WebSocket clients.
   */
  async createMultiple(configs: Array<{ protocol: ProtocolType; config: ClientConfig }>): Promise<Client[]>  {
    const creationPromises = configs.map(({
  protocol,
  config
}) => this.create(protocol, config));
    return Promise.all(creationPromises)
}

  /**
   * Get cached client by name.
   */
  get(name: string): Client | undefined  {
    return this.clients.get(name)
}

  /**
   * List all active clients.
   */
  list(): Client[]  {
    return Array.from(this.clients.values())
}

  /**
   * Check if client exists.
   */
  has(name: string): boolean  {
    return this.clients.has(name)
}

  /**
   * Remove and disconnect client.
   */
  async remove(name: string): Promise<boolean>  {
    const client = this.clients.get(name);
    if (client) {
      try {
        await client.disconnect()
} catch (error) {
        logger.warn('Error destroying WebSocket client ' + name + ':', error)'
}

      this.clients.delete(name);
      this.clientConfigs.delete(name);
      this.connectionPool.delete(name);
      return true
}
    return false
}

  /**
   * Health check all clients.
   */
  async healthCheckAll(
  ': Promise<Map<string,
  boolean>> {
    const results = new Map<string,
  boolean>(
);
    const healthCheckPromises = Array.from(this.clients.entries()).map(
      async ([name, client]) => {
        try {
  const healthy = await client.health();
          results.set(name,
  healthy)

} catch (error) {
          results.set(name, false);
          logger.warn('Health check failed for client ' + name + ':', error)'
}
      }
    );

    await Promise.allSettled(healthCheckPromises);
    return results
}

  /**
   * Get metrics for all clients.
   */
  async getMetricsAll(
  ': Promise<Map<string,
  ClientMetrics>> {
    const results = new Map<string,
  ClientMetrics>(
);
    const metricsPromises = Array.from(this.clients.entries()).map(
      async ([name, client]) => {
        try {
          const metadata = await client.getMetadata();
          if (metadata.metrics) {
  results.set(name,
  metadata.metrics)

}
        } catch (error) {
          logger.warn('Failed to get metrics for client ' + name + ':', error)';
          results.set(
  name,
  {
  name,
  requestCount: 0,
  successCount: 0,
  errorCount: 1,
  averageLatency: -1,
  p95Latency: -1,
  p99Latency: -1,
  throughput: 0,
  timestamp: new Date(
)

})
}
      }
    );

    await Promise.allSettled(metricsPromises);
    return results
}

  /**
   * Shutdown all clients.
   */
  async shutdown(': Promise<void> {
    const shutdownPromises = Array.from(this.clients.values()).map((client) =>
      client.disconnect().catch((error) => {
  logger.error('Error shutting down WebSocket client:,
  error);
})
    );

    await Promise.allSettled(shutdownPromises);
    this.clients.clear();
    this.clientConfigs.clear();
    this.connectionPool.clear()
}

  /**
   * Get active client count.
   */
  getActiveCount(
  ': number {
    return this.clients.size
}


  // =============================================================================
  // WebSocket-Specific Factory Methods
  // =============================================================================

  /**
   * Create WebSocket client with connection pooling.
   */
  async createPooled(
    protocol: ProtocolType,
  config: ClientConfig,
  poolSize: number = 5
): Promise<Client[]>  {
    const clients: Client[] = [];
    const wsConfig = config as WebSocketClientConfig;

    for (let i = 0; i < poolSize; i++) {
      const pooledConfig = {
        ...wsConfig,
        metadata: {
  ...wsConfig.metadata,
  poolIndex: i,
  poolSize

}
};
      const client = await this.create(protocol, pooledConfig);
      clients.push(client)
}
    return clients
}

  /**
   * Create WebSocket client with load balancing.
   */
  async createLoadBalanced(configs: Array<{ protocol: ProtocolType; config: ClientConfig }>,
    strategy: 'round-robin' | 'random' | 'least-connections' = 'round-robin
  ): Promise<LoadBala'cedWebSocketClient>  {
  const clients = await this.createMultiple(configs);
    return new LoadBalancedWebSocketClient(clients,
  strategy)

}

  /**
   * Create WebSocket client with failover support.
   */
  async createFailover(primaryConfig: { protocol: ProtocolType; config: ClientConfig },
    fallbackConfigs: Array<{ protocol: ProtocolType; config: ClientConfig }>
  ): Promise<FailoverWebSocketClient>  {
  const primaryClient = await this.create(primaryConfig.protocol,
  primaryConfig.config);
    const fallbackClients = await this.createMultiple(fallbackConfigs);
    return new FailoverWebSocketClient(primaryClient,
  fallbackClients)

}

  /**
   * Get WebSocket-specific metrics for all clients.
   */
  async getWebSocketMetricsAll(): Promise<Map<string, WebSocketMetrics>>  {
    const results = new Map<string, WebSocketMetrics>();

    for (const [name, client] of this.clients) {
      try {
        if (client instanceof WebSocketClientAdapter) {
          // Convert standard metrics to WebSocket format
          const metadata = await client.getMetadata();
          if (metadata.metrics) {
            const metrics = metadata.metrics;
            const wsMetrics: WebSocketMetrics = {
  ...metrics,
  connectionsOpened: 1,
  connectionsClosed: 0,
  connectionsActive: client.isConnected() ? 1 : 0,
  connectionDuration: metadata.connection?.connectionDuration || 0,
  messagesSent: metrics.successCount,
  messagesReceived: metrics.requestCount - metrics.successCount,
  messagesSentPerSecond: metrics.throughput,
  messagesReceivedPerSecond: 0,
  bytesSent: 0,
  bytesReceived: 0,
  bytesSentPerSecond: 0,
  bytesReceivedPerSecond: 0,
  packetLoss: 0,
  connectionErrors: metrics.errorCount,
  messageErrors: 0,
  timeoutErrors: 0,
  authenticationErrors: 0,
  messagesQueued: metadata.custom?.queuedMessages || 0,
  queueSize: metadata.custom?.queuedMessages || 0,
  queueOverflows: 0

};
            results.set(name, wsMetrics)
}
        }
      } catch (error) {
        logger.warn('Failed to get WebSocket metrics for ' + name + ':', error)'
}
    }

    return results
}

  /**
   * Get connection information for all clients.
   */
  getConnectionInfoAll(': Map<string, WebSocketConnectionInfo> {
    return new Map(this.connectionPool)
}

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private generateClientName(config: WebSocketClientConfig): string  {
    try {
      const url = new URL(config.url);
      const host = url.hostname;
      const port = url.port || (url.protocol === wss:' ? '443' : '80')';
      const timestamp = Date.now();
      return 'ws-' + host + '-${port}-${timestamp}''
} catch {
      return 'ws-client-' + Date.now() + '';
}
  }
}

/**
 * Load-balanced WebSocket client wrapper.
 */
export class LoadBalancedWebSocketClient implements Client {
  private currentIndex = 0;
  private requestCount = 0;

  constructor(private clients: Client[],
    private strategy: 'round-robin' | 'random' | 'least-connections
  ) {
    if (client'.length === 0) {
  throw new Error('At least one client is required for load balancing);

}
  }

  get config(': ClientConfig {
    return this.clients[0]?.config as ClientConfig
}

  get name() {
    return 'load-balanced-ws-' + this.clients.length + '';
}

  async connect(): Promise<void>  {
  await Promise.all(this.clients.map((client) => client.connect()))

}

  async disconnect(): Promise<void>  {
  await Promise.all(this.clients.map((client) => client.disconnect()))

}

  isConnected(): boolean  {
  return this.clients.some((client) => client.isConnected())

}

  async health(): Promise<boolean>  {
  const healthChecks = await Promise.allSettled(
      this.clients.map((client) => client.health())
    );

    return healthChecks.some(
      (check) => check.status === 'fulfilled' && check.value === true
    )

}

  async getMeta'ata(): Promise<any>  {
    const metadataResults = await Promise.allSettled(
      this.clients.map((client) => client.getMetadata())
    );

    const successfulResults = metadataResults
      .filter((result) => result.status === 'fulfilled')
      .map((result: any) => result.value);

    if (successfulResults.length === 0) {
      return {
        name: this.name,
        metrics: {
  name: this.name,
  requestCount: 0,
  successCount: 0,
  errorCount: 1,
  averageLatency: -1,
  p95Latency: -1,
  p99Latency: -1,
  throughput: 0,
  timestamp: new Date()

}
}
}

    // Aggregate metrics from all clients
    const aggregate'Metrics = this.aggregateMetrics(successfulResults);

    return {
      name: this.name,
      metrics: aggregatedMetrics,
      custom: {
  clientCount: this.clients.length,
  healthyClients: successfulResults.length,
  strategy: this.strategy

}
}
}

  async send<R = any>(data: any): Promise<R> {
  const client = this.selectClient();
    return client.send<R>(data)

}

  on(event: string, handler: (...args: any[]) => void): void {
  this.clients.forEach((client) => client.on(event,
  handler))

}

  off(event: string, handler?: (...args: any[]) => void): void {
  this.clients.forEach((client) => client.off(event,
  handler))

}

  private aggregateMetrics(results: any[]): ClientMetrics  {
    const totalRequests = results.reduce((sum, r) => sum + (r.metrics?.requestCount || 0), 0);
    const totalSuccess = results.reduce((sum, r) => sum + (r.metrics?.successCount || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.metrics?.errorCount || 0), 0);
    const avgLatency = results.reduce((sum, r) => sum + (r.metrics?.averageLatency || 0), 0) / results.length;
    const totalThroughput = results.reduce((sum, r) => sum + (r.metrics?.throughput || 0), 0);

    return {
  name: this.name,
  requestCount: totalRequests,
  successCount: totalSuccess,
  errorCount: totalErrors,
  averageLatency: avgLatency,
  p95Latency: Math.max(...results.map((r) => r.metrics?.p95Latency || 0)),
  p99Latency: Math.max(...results.map((r) => r.metrics?.p99Latency || 0)),
  throughput: totalThroughput,
  timestamp: new Date()

}
}

  private selectClient(): Client  {
    switch (this.strategy) {
      case 'round-robin: {
  co'st client = this.clients[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.clients.length;
        return client!

}
      case random: {
  const rando'Index = Math.floor(Math.random() * this.clients.length);
        return this.clients[randomIndex]!

}
      case 'least-connections:
        // Simple implementation - could be enhanced with actual connection tracking
        return thi'.clients[0]!;
      default:
        return this.clients[0]!
}
  }
}

/**
 * Failover WebSocket client wrapper.
 */
export class FailoverWebSocketClient implements Client {
  private currentClient: Client;
  private fallbackIndex = 0;

  constructor(
    private primaryClient: Client,
    private fallbackClients: Client[]
  ) {
    this.currentClient = primaryClient;

    // Set up failover on primary client disconnect
    primaryClient.on('disconnect', () => {
      his.failover()
})
}

  get config() {
    return this.currentClient.config
}

  get name() {
    return 'failover-ws-' + this.fallbackClients.length'+ 1 + '''
}

  async connect(): Promise<void>  {
    return this.currentClient.connect()
}

  async disconnect(): Promise<void>  {
    return this.currentClient.disconnect()
}

  isConnected(): boolean  {
    return this.currentClient.isConnected()
}

  async health(): Promise<boolean>  {
    return this.currentClient.health()
}

  async getMetadata(): Promise<any>  {
    return this.currentClient.getMetadata()
}

  async send<R = any>(data: any): Promise<R> {
    return this.currentClient.send<R>(data)
}

  on(event: string, handler: (...args: any[]) => void): void {
  this.currentClient.on(event,
  handler)

}

  off(event: string, handler?: (...args: any[]) => void): void {
  this.currentClient.off(event,
  handler)

}

  private async failover(): Promise<void>  {
    if (this.fallbackIndex < this.fallbackClients.length) {
      logger.info('Failing over to client ' + this.fallbackIndex + ');;
      this.currentClient = this.fallbackClients[this.fallbackIndex]!;
      this.fallbackIndex++;

      try {
        await this.currentClient.connect()
} catch (error) {
  logger.error(`Failover client failed to connect:','
  error)';
        await this.failover(); // Try next fallback

}
    } else {
      logger.error('All fallback clients exhausted)'
}
  }
}

// Convenience factory functions
export async function createWebSocketClientFactory(': Promise<WebSocketClientFactory> {
  return new WebSocketClientFactory()
}

export async function createWebSocketClientWithConfig(protocol: ProtocolType,
  config: WebSocketClientConfig
): Promise<Client>  {
  const factory = new WebSocketClientFactory();
  return factory.create(protocol,
  config)

}

export default WebSocketClientFactory;