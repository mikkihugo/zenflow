/**
 * UACL Client Registry.
 *
 * Central registry for all client types in the Unified Adaptive Client Layer.
 * Provides type-safe registration, discovery, and configuration management.
 *
 * @file Centralized client type management system.
 */

import { EventEmitter } from 'eventemitter3';

import type { APIClient } from '../api/http/client';
import type { WebSocketClient } from '../api/websocket/client';
import type { FACTIntegration } from '../knowledge/knowledge-client';
import type { ExternalMCPClient } from '../mcp/external-mcp-client';

/**
 * Client type enumeration for type safety.
 */
export enum ClientType {
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  KNOWLEDGE = 'knowledge',
  MCP = 'mcp',
}

/**
 * Base client configuration interface.
 *
 * @example
 */
export interface BaseClientConfig {
  readonly id: string;
  readonly type: ClientType;
  readonly enabled: boolean;
  readonly priority: number; // 1-10, higher = more priority
  readonly timeout?: number;
  readonly retryAttempts?: number;
  readonly healthCheckInterval?: number;
}

/**
 * HTTP client specific configuration.
 *
 * @example
 */
export interface HTTPClientConfig extends BaseClientConfig {
  readonly type: ClientType.HTTP;
  readonly baseURL: string;
  readonly apiKey?: string;
  readonly bearerToken?: string;
  readonly headers?: Record<string, string>;
}

/**
 * WebSocket client specific configuration.
 *
 * @example
 */
export interface WebSocketClientConfig extends BaseClientConfig {
  readonly type: ClientType.WEBSOCKET;
  readonly url: string;
  readonly reconnect?: boolean;
  readonly reconnectInterval?: number;
  readonly maxReconnectAttempts?: number;
}

/**
 * Knowledge (FACT) client specific configuration.
 *
 * @example
 */
export interface KnowledgeClientConfig extends BaseClientConfig {
  readonly type: ClientType.KNOWLEDGE;
  readonly factRepoPath: string;
  readonly anthropicApiKey: string;
  readonly pythonPath?: string;
  readonly enableCache?: boolean;
  readonly cacheConfig?: {
    prefix: string;
    minTokens: number;
    maxSize: string;
    ttlSeconds: number;
  };
}

/**
 * MCP client specific configuration.
 *
 * @example
 */
export interface MCPClientConfig extends BaseClientConfig {
  readonly type: ClientType.MCP;
  readonly servers: Record<
    string,
    {
      url: string;
      type: 'http' | 'sse';
      capabilities: string[];
    }
  >;
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
 * Client instance interface for type safety.
 *
 * @example
 */
export interface ClientInstance {
  readonly id: string;
  readonly type: ClientType;
  readonly config: ClientConfig;
  readonly client:
    | APIClient
    | WebSocketClient
    | FACTIntegration
    | ExternalMCPClient;
  readonly status:
    | 'initialized'
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error';
  readonly lastHealth?: Date;
  readonly metrics: {
    requests: number;
    errors: number;
    avgLatency: number;
    uptime: number;
  };
}

/**
 * Client factory interface for creating client instances.
 *
 * @example
 */
export interface ClientFactory {
  create(config: ClientConfig): Promise<ClientInstance>;
  validate(config: ClientConfig): boolean;
  getDefaultConfig(type: ClientType): Partial<ClientConfig>;
}

/**
 * Registry events interface.
 *
 * @example
 */
export interface RegistryEvents {
  'client:registered': (client: ClientInstance) => void;
  'client:unregistered': (clientId: string) => void;
  'client:status_changed': (
    clientId: string,
    status: ClientInstance['status']
  ) => void;
  'client:health_check': (clientId: string, healthy: boolean) => void;
  'registry:error': (error: Error) => void;
}

/**
 * Main client registry class.
 *
 * Provides centralized management of all client types with:
 * - Type-safe registration and discovery
 * - Health monitoring and metrics
 * - Configuration validation
 * - Event-driven status updates.
 *
 * @example.
 * @example
 */
export class ClientRegistry extends EventEmitter {
  private clients = new Map<string, ClientInstance>();
  private factories = new Map<ClientType, ClientFactory>();
  private healthCheckTimer?: NodeJS.Timeout;
  private readonly healthCheckInterval: number;

  constructor(healthCheckInterval = 30000) {
    super();
    this.healthCheckInterval = healthCheckInterval;
    this.setupFactories();
  }

  /**
   * Register a client instance.
   *
   * @param config
   */
  async register(config: ClientConfig): Promise<ClientInstance> {
    // Validate configuration
    if (!this.validateConfig(config)) {
      throw new Error(`Invalid configuration for client ${config?.id}`);
    }

    // Check if client already exists
    if (this.clients.has(config?.id)) {
      throw new Error(`Client with id ${config?.id} already registered`);
    }

    // Get appropriate factory
    const factory = this.factories.get(config?.type);
    if (!factory) {
      throw new Error(`No factory available for client type ${config?.type}`);
    }

    try {
      // Create client instance
      const instance = await factory.create(config);

      // Store in registry
      this.clients.set(config?.id, instance);

      // Emit registration event
      this.emit('client:registered', instance);

      return instance;
    } catch (error) {
      this.emit('registry:error', error as Error);
      throw error;
    }
  }

  /**
   * Unregister a client instance.
   *
   * @param clientId
   */
  async unregister(clientId: string): Promise<boolean> {
    const instance = this.clients.get(clientId);
    if (!instance) {
      return false;
    }

    try {
      // Cleanup client if it has a cleanup method
      if (
        'disconnect' in instance.client &&
        typeof instance.client.disconnect === 'function'
      ) {
        await instance.client.disconnect();
      }
      if (
        'shutdown' in instance.client &&
        typeof instance.client.shutdown === 'function'
      ) {
        await instance.client.shutdown();
      }

      // Remove from registry
      this.clients.delete(clientId);

      // Emit unregistration event
      this.emit('client:unregistered', clientId);

      return true;
    } catch (error) {
      this.emit('registry:error', error as Error);
      return false;
    }
  }

  /**
   * Get client instance by ID.
   *
   * @param clientId
   */
  get(clientId: string): ClientInstance | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get all clients of a specific type.
   *
   * @param type
   */
  getByType(type: ClientType): ClientInstance[] {
    return Array.from(this.clients.values()).filter(
      (client) => client.type === type
    );
  }

  /**
   * Get all clients matching a filter.
   *
   * @param filter
   */
  getAll(filter?: (client: ClientInstance) => boolean): ClientInstance[] {
    const allClients = Array.from(this.clients.values());
    return filter ? allClients.filter(filter) : allClients;
  }

  /**
   * Get healthy clients of a specific type.
   *
   * @param type
   */
  getHealthy(type?: ClientType): ClientInstance[] {
    return this.getAll((client) => {
      const typeMatch = !type || client.type === type;
      const statusMatch = client.status === 'connected';
      return typeMatch && statusMatch;
    });
  }

  /**
   * Get client by priority (highest priority first).
   *
   * @param type.
   * @param type
   */
  getByPriority(type?: ClientType): ClientInstance[] {
    return this.getAll((client) => !type || client.type === type).sort(
      (a, b) => b.config.priority - a.config.priority
    );
  }

  /**
   * Check if a client is registered and healthy.
   *
   * @param clientId
   */
  isHealthy(clientId: string): boolean {
    const client = this.clients.get(clientId);
    return client?.status === 'connected';
  }

  /**
   * Get registry statistics.
   */
  getStats(): {
    total: number;
    byType: Record<ClientType, number>;
    byStatus: Record<string, number>;
    healthy: number;
    avgLatency: number;
  } {
    const all = this.getAll();

    const byType = Object.values(ClientType).reduce(
      (acc, type) => {
        acc[type] = this.getByType(type).length;
        return acc;
      },
      {} as Record<ClientType, number>
    );

    const byStatus = all.reduce(
      (acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const healthy = all.filter((c) => c.status === 'connected').length;
    const avgLatency =
      all.length > 0
        ? all.reduce((sum, c) => sum + c.metrics.avgLatency, 0) / all.length
        : 0;

    return {
      total: all.length,
      byType,
      byStatus,
      healthy,
      avgLatency,
    };
  }

  /**
   * Start health monitoring.
   */
  startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  /**
   * Stop health monitoring.
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Perform health checks on all clients.
   */
  private async performHealthChecks(): Promise<void> {
    const clients = this.getAll();

    const healthChecks = clients.map(async (client) => {
      try {
        const isHealthy = await this.checkClientHealth(client);
        const newStatus = isHealthy ? 'connected' : 'error';

        if (client.status !== newStatus) {
          // Update status (this would need to be mutable in real implementation)
          this.emit('client:status_changed', client.id, newStatus);
        }

        this.emit('client:health_check', client.id, isHealthy);

        return { clientId: client.id, healthy: isHealthy };
      } catch (error) {
        this.emit('registry:error', error as Error);
        return { clientId: client.id, healthy: false };
      }
    });

    await Promise.allSettled(healthChecks);
  }

  /**
   * Check health of individual client.
   *
   * @param instance
   */
  private async checkClientHealth(instance: ClientInstance): Promise<boolean> {
    try {
      // Try to ping the client if it has a ping method
      if (
        'ping' in instance.client &&
        typeof instance.client.ping === 'function'
      ) {
        return await instance.client.ping();
      }

      // For WebSocket clients, check connection status
      if (
        instance.type === ClientType.WEBSOCKET &&
        'connected' in instance.client
      ) {
        return Boolean(instance.client.connected);
      }

      // For other clients, assume healthy if not in error state
      return instance.status !== 'error';
    } catch {
      return false;
    }
  }

  /**
   * Validate client configuration.
   *
   * @param config
   */
  private validateConfig(config: ClientConfig): boolean {
    const factory = this.factories.get(config?.type);
    return factory ? factory.validate(config) : false;
  }

  /**
   * Setup client factories for each type.
   */
  private setupFactories(): void {
    // This would be implemented with actual factory classes
    // For now, we define the interface
    // HTTP Client Factory would be registered here
    // WebSocket Client Factory would be registered here
    // Knowledge Client Factory would be registered here
    // MCP Client Factory would be registered here
  }

  /**
   * Register a client factory.
   *
   * @param type
   * @param factory
   */
  registerFactory(type: ClientType, factory: ClientFactory): void {
    this.factories.set(type, factory);
  }

  /**
   * Clean shutdown of registry.
   */
  async shutdown(): Promise<void> {
    this.stopHealthMonitoring();

    // Unregister all clients
    const clientIds = Array.from(this.clients.keys());
    const shutdownPromises = clientIds.map((id) => this.unregister(id));

    await Promise.allSettled(shutdownPromises);

    this.clients.clear();
    this.factories.clear();
  }
}

/**
 * Global registry instance.
 */
export const globalClientRegistry = new ClientRegistry();

/**
 * Helper functions for common registry operations.
 */
export const ClientRegistryHelpers = {
  /**
   * Register HTTP client with common configuration.
   *
   * @param config
   */
  async registerHTTPClient(
    config: Omit<HTTPClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry.register({ ...config, type: ClientType.HTTP });
  },

  /**
   * Register WebSocket client with common configuration.
   *
   * @param config
   */
  async registerWebSocketClient(
    config: Omit<WebSocketClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry.register({
      ...config,
      type: ClientType.WEBSOCKET,
    });
  },

  /**
   * Register Knowledge client with common configuration.
   *
   * @param config
   */
  async registerKnowledgeClient(
    config: Omit<KnowledgeClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry.register({
      ...config,
      type: ClientType.KNOWLEDGE,
    });
  },

  /**
   * Register MCP client with common configuration.
   *
   * @param config
   */
  async registerMCPClient(
    config: Omit<MCPClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry.register({ ...config, type: ClientType.MCP });
  },

  /**
   * Get the best available client for a type (highest priority, healthy).
   *
   * @param type.
   * @param type
   */
  getBestClient(type: ClientType): ClientInstance | undefined {
    const clients = globalClientRegistry.getByPriority(type);
    return clients.find((client) => client.status === 'connected');
  },

  /**
   * Get load-balanced client (round-robin among healthy clients).
   *
   * @param type.
   * @param type
   */
  getLoadBalancedClient(type: ClientType): ClientInstance | undefined {
    const healthy = globalClientRegistry.getHealthy(type);
    if (healthy.length === 0) return undefined;

    // Simple round-robin (in practice, this would need state)
    const index = Math.floor(Math.random() * healthy.length);
    return healthy[index];
  },
};

export default ClientRegistry;
