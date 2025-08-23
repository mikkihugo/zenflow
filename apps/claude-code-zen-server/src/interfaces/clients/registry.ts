/**
 * Client Registry System for UACL.
 *
 * Provides centralized registration, discovery, and management of all client types
 * with type safety, health monitoring, and event-driven status updates.
 *
 * @file Central registry for all client implementations.
 */

import { TypedEventBase } from '@claude-zen/foundation';

// Import client implementations
import type { createAPIClient } from './api/http/client';
import type { WebSocketClient } from './api/websocket/client';
import type { FACTIntegration } from '@claude-zen/intelligence';
import type { ExternalMCPClient } from './mcp/external-mcp-client';

/**
 * Client type enumeration for type safety.
 */
export enum ClientType {
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  KNOWLEDGE = 'knowledge',
  MCP = 'mcp'

}

/**
 * Base client configuration interface.
 */
ex'ort interface BaseClientConfig {
  readonly id: string;
  readonly type: ClientType;
  readonly enabled?: boolean;
  readonly priority?: number;
  readonly timeout?: number;
  readonly healthCheckInterval?: number;
  readonly retryAttempts?: number

}

/**
 * HTTP client specific configuration.
 */
export interface HTTPClientConfig extends BaseClientConfig {
  readonly type: ClientType.HTTP;
  readonly baseURL: string;
  readonly apiKey?: string;
  readonly bearerToken?: string;
  readonly headers?: Record<string,
  string>

}

/**
 * WebSocket client specific configuration.
 */
export interface WebSocketClientConfig extends BaseClientConfig {
  readonly type: ClientType.WEBSOCKET;
  readonly url: string;
  readonly reconnect?: boolean;
  readonly reconnectInterval?: number;
  readonly maxReconnectAttempts?: number

}

/**
 * Knowledge client specific configuration.
 */
export interface KnowledgeClientConfig extends BaseClientConfig {
  readonly type: ClientType.KNOWLEDGE;
  readonly endpoint: string;
  readonly contextPath?: string;
  readonly capabilities: string[]

}

/**
 * MCP client specific configuration.
 */
export interface MCPClientConfig extends BaseClientConfig {
  readonly type: ClientType.MCP;
  readonly servers: Record<string, {
  url: string;
    type: 'http' | 'sse';
    capabilities: string[]

}>
}

/**
 * Union type for all client configurations.
 */
export type ClientConfig =
  | HTTPClientConfig
  | WebSocketClientConfig
  | KnowledgeClientConfig
  | MCPClientConfig;

/**
 * Client metrics interface.
 */
export interface ClientMetrics {
  requests: {
  total: number;
  successful: number;
  failed: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number

};
  connections: {
  attempts: number;
    successful: number;
    failed: number;
    currentStatus: string

};
  health: {
  lastCheck: Date;
    checksTotal: number;
    checksSuccessful: number;
    uptime: number;
    downtimeTotal: number

};
  errors: {
    total: number;
    byType: Record<string, number>;
    recent: Array<{
  timestamp: Date;
      type: string;
      message: string

}>
}
}

/**
 * Client instance interface for type safety.
 */
export interface ClientInstance {
  readonly id: string;
  readonly type: ClientType;
  readonly config: ClientConfig;
  readonly client: any;
  // APIClient | WebSocketClient | FACTIntegration | ExternalMCPClient;
  readonly status: 'initialized' | 'connecting' | 'connected' | 'disconnected' | 'error';
  readonly lastHealth?: Date;
  readonly metrics: ClientMetrics

}

/**
 * Client factory interface for creating client instances.
 */
export interface ClientFactory {
  create(config: ClientConfig): Promise<ClientInstance>;
  validate(config: ClientConfig): boolean;
  getDefaultConfig(type: ClientType): Partial<ClientConfig>

}

/**
 * Registry events interface.
 */
interface RegistryEvents {
  client:registered: { client: ClientInstance }';
  client:unregistered: { clientI: string }';
  client:status_changed: { clientI: string; status: string };
  client:health_check: { clientId: string; healthy: boolean };
  registry:error: { eror: Error }';
'

/**
 * Main client registry class.
 */
export class ClientRegistry extends TypedEventBase<RegistryEvents> {
  private clients = new Map<string, ClientInstance>();
  private factories = new Map<ClientType, ClientFactory>();
  private healthCheckTimer?: NodeJS.Timeout;
  private readonly healthCheckInterval: number;

  constructor(healthCheckInterval = 30000) {
  super();
    this.healthCheckInterval = healthCheckInterval;
    this.setupFactories()

}

  /**
   * Register a client instance.
   */
  async register(config: ClientConfig): Promise<ClientInstance>  {
    // Validate configuration
    if (!this.validateConfig(config)) {
      throw new Error('Invalid configuration for client ' + config?.id + ')'
}

    // Check if client already exists
    if (this.clients.has(config?.id)' {
      throw new Error('Client with id ' + config?.id + ' already registered)'
}

    // Get appropriate factory
    const factory = this.factories.get(config?.type);
    if (!factory' {
      throw new Error('No factory available for client type ' + config?.type + )'
}

    try {
      // Create client instance
      const instance = await factory.create(config);

      // Store in registry
      this.clients.set(config?.id, instance);

      // Emit registration event
      this.emit(client: registered, { client: instance })';

      return instance
} catch (error) {
      this.emit(registry: error, { eror: error as Error });;
      throw error
}
  }

  /**
   * Unregister a client instance.
   */
  async unregister(clientId: string: Promise<boolean> {
    const instance = this.clients.get(clientId);
    if (!instance) {
      return false
}

    try {
      // Cleanup client if it has a disconnect method
      if('disconnect' in ins'ance.client && typeof instance.client.disconnect === 'function) {
        await i'stance.client?.disconnect()
}

      if('shutdown' i' instance.client && typeof instance.client?.shutdown === 'function) {
        await i'stance.client?.shutdown()
}

      // Remove from registry
      this.clients.delete(clientId);

      // Emit unregistration event
      this.emit(client: unregistered, { clientId })';

      return true
} catch (error) {
      this.emit(registry: error, { eror: error as Error });;
      return false
}
  }

  /**
   * Get client instance by ID.
   */
  get(clientId: string: ClientInstance | undefined {
    return this.clients.get(clientId)
}

  /**
   * Get all clients of a specific type.
   */
  getByType(type: ClientType): ClientInstance[]  {
  return Array.from(this.clients.values()).filter(
      (client) => client.type === type
    )

}

  /**
   * Get all clients matching a filter.
   */
  getAll(filter?: (client: ClientInstance) => boolean): ClientInstance[] {
  const allClients = Array.from(this.clients.values());
    return filter ? allClients.filter(filter) : allClients

}

  /**
   * Get healthy clients of a specific type.
   */
  getHealthy(type?: ClientType): ClientInstance[]  {
    return this.getAll((client) => {
  const typeMatch = !type || client.type === type;
      const statusMatch = client.status === 'connected;
      return typeMatch && statusMatch

})
}

  /**
   * Get client by priority (highest priority first).
   */
  getByPriority(type?: ClientType): ClientInstance[]  {
  return this.getAll((client) => !type || client.type === type).sort(
      (a,
  b) => (b.config.priority || 0) - (a.config.priority || 0)
    )

}

  /**
   * Check if a client is registered and healthy.
   */
  isHealthy(clientId: string): boolean  {
  const client = this.clients.get(clientId);
    return client?.status === 'connected;

}

  /**
   * Get registry statistics.
   */
  getStats(): {
  total: number;
    byType: Record<ClientType,
  number>;
    byStatus: Record<string,
  number>;
    healthy: number;
    avgLatency: number

} {
    const all = this.getAll();

    const byType = Object.values(ClientType).reduce(
      (acc, type) => {
  acc[type] = this.getByType(type).length;
        return acc

},
      {} as Record<ClientType, number>
    );

    const byStatus = all.reduce(
      (acc, client) => {
  acc[client.status] = (acc[client.status] || 0) + 1;
        return acc

},
      {} as Record<string, number>
    );

    const healthy = all.filter((c) => c.status === 'connected').length';
    const avgLatency =
      all.lengt' > 0
        ? all.reduce((sum, c) => sum + c.metrics.requests.avgLatency, 0) / all.length
        : 0;

    return {
  total: all.length,
  byType,
  byStatus,
  healthy,
  avgLatency

}
}

  /**
   * Start health monitoring.
   */
  startHealthMonitoring(): void  {
    if (this.healthCheckTimer) {
      return
}

    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks()
}, this.healthCheckInterval)
}

  /**
   * Stop health monitoring.
   */
  stopHealthMonitoring(): void  {
    if (this.healthCheckTimer) {
  clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined

}
  }

  /**
   * Register a client factory.
   */
  registerFactory(type: ClientType, factory: ClientFactory): void  {
  this.factories.set(type,
  factory)

}

  /**
   * Clean shutdown of registry.
   */
  async shutdown(): Promise<void>  {
  this.stopHealthMonitoring();

    // Unregister all clients
    const clientIds = Array.from(this.clients.keys());
    const shutdownPromises = clientIds.map((id) => this.unregister(id));

    await Promise.allSettled(shutdownPromises);

    this.clients.clear();
    this.factories.clear()

}

  /**
   * Perform health checks on all clients.
   */
  private async performHealthChecks(): Promise<void>  {
    const clients = this.getAll();

    const healthChecks = clients.map(async (client) => {
      try {
        const isHealthy = await this.checkClientHealth(client);
        const newStatus = isHealthy ? 'connected' : 'error;

        if (client.status !== newStatus) {
          this.emit(
  client: status_changed,
  {
  clientI: client.id,
  status: newStatus
}
)'
}

        this.emit(
  client: health_check,
  {
  clientId: client.id,
  healthy: isHealthy
}
)';

        return {
  clientId: client.id,
  healthy: isHealthy
}
} catch (error) {
        this.emit(registry: error, { eror: error as Error });;
        return {
  clientId: client.id,
  healthy: false
}
}
    });

    await Promise.allSettled(healthChecks)
}

  /**
   * Check health of individual client.
   */
  private async checkClientHealth(instance: ClientInstance: Promise<boolean> {
    try {
      // Try to ping the client if it has a ping method
      if ('ping' in instance.client && typeof instance.client.pin' === 'function) {
        retur' await instance.client.ping()
}

      // For WebSocket clients, check connection status
      if (instance.type === ClientType.WEBSOCKET && 'connected' in instance.client) {
        return Boolean(instance.client.connected)
}

      // For other clients, assume healthy if not in error state
      return instance.status !== 'error;
} catch {
      return false
}
  }

  /**
   * Validate client configuration.
   */
  private validateConfig(config: ClientConfig): boolean  {
  const factory = this.factories.get(config?.type);
    return factory ? factory.validate(config) : false

}

  /**
   * Setup client factories for each type.
   */
  private setupFactories(): void  {
  // This would be implemented with actual factory classes
    // HTTP Client Factory would be registered here
    // WebSocket Client Factory would be registered here
    // Knowledge Client Factory would be registered here
    // MCP Client Factory would be registered here

}
}