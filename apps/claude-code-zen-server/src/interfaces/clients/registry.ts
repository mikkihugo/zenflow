/**
 * UACL Client Registry0.
 *
 * Central registry for all client types in the Unified Adaptive Client Layer0.
 * Provides type-safe registration, discovery, and configuration management0.
 *
 * @file Centralized client type management system0.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type { FACTIntegration } from '@claude-zen/intelligence';

import type { APIClient } from '0.0./api/http/client';
import type { WebSocketClient } from '0.0./api/websocket/client';
import type { ExternalMCPClient } from '0.0./mcp/external-mcp-client';

/**
 * Client type enumeration for type safety0.
 */
export enum ClientType {
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  KNOWLEDGE = 'knowledge',
  MCP = 'mcp',
}

/**
 * Base client configuration interface0.
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
 * HTTP client specific configuration0.
 *
 * @example
 */
export interface HTTPClientConfig extends BaseClientConfig {
  readonly type: ClientType0.HTTP;
  readonly baseURL: string;
  readonly apiKey?: string;
  readonly bearerToken?: string;
  readonly headers?: Record<string, string>;
}

/**
 * WebSocket client specific configuration0.
 *
 * @example
 */
export interface WebSocketClientConfig extends BaseClientConfig {
  readonly type: ClientType0.WEBSOCKET;
  readonly url: string;
  readonly reconnect?: boolean;
  readonly reconnectInterval?: number;
  readonly maxReconnectAttempts?: number;
}

/**
 * Knowledge (FACT) client specific configuration0.
 *
 * @example
 */
export interface KnowledgeClientConfig extends BaseClientConfig {
  readonly type: ClientType0.KNOWLEDGE;
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
 * MCP client specific configuration0.
 *
 * @example
 */
export interface MCPClientConfig extends BaseClientConfig {
  readonly type: ClientType0.MCP;
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
 * Union type for all client configurations0.
 */
export type ClientConfig =
  | HTTPClientConfig
  | WebSocketClientConfig
  | KnowledgeClientConfig
  | MCPClientConfig;

/**
 * Client instance interface for type safety0.
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
 * Client factory interface for creating client instances0.
 *
 * @example
 */
export interface ClientFactory {
  create(config: ClientConfig): Promise<ClientInstance>;
  validate(config: ClientConfig): boolean;
  getDefaultConfig(type: ClientType): Partial<ClientConfig>;
}

/**
 * Registry events interface0.
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
 * Main client registry class0.
 *
 * Provides centralized management of all client types with:
 * - Type-safe registration and discovery
 * - Health monitoring and metrics
 * - Configuration validation
 * - Event-driven status updates0.
 *
 * @example0.
 * @example
 */
export class ClientRegistry extends TypedEventBase {
  private clients = new Map<string, ClientInstance>();
  private factories = new Map<ClientType, ClientFactory>();
  private healthCheckTimer?: NodeJS0.Timeout;
  private readonly healthCheckInterval: number;

  constructor(healthCheckInterval = 30000) {
    super();
    this0.healthCheckInterval = healthCheckInterval;
    this?0.setupFactories;
  }

  /**
   * Register a client instance0.
   *
   * @param config
   */
  async register(config: ClientConfig): Promise<ClientInstance> {
    // Validate configuration
    if (!this0.validateConfig(config)) {
      throw new Error(`Invalid configuration for client ${config?0.id}`);
    }

    // Check if client already exists
    if (this0.clients0.has(config?0.id)) {
      throw new Error(`Client with id ${config?0.id} already registered`);
    }

    // Get appropriate factory
    const factory = this0.factories0.get(config?0.type);
    if (!factory) {
      throw new Error(`No factory available for client type ${config?0.type}`);
    }

    try {
      // Create client instance
      const instance = await factory0.create(config);

      // Store in registry
      this0.clients0.set(config?0.id, instance);

      // Emit registration event
      this0.emit('client:registered', instance);

      return instance;
    } catch (error) {
      this0.emit('registry:error', error as Error);
      throw error;
    }
  }

  /**
   * Unregister a client instance0.
   *
   * @param clientId
   */
  async unregister(clientId: string): Promise<boolean> {
    const instance = this0.clients0.get(clientId);
    if (!instance) {
      return false;
    }

    try {
      // Cleanup client if it has a cleanup method
      if (
        'disconnect' in instance0.client &&
        typeof instance0.client0.disconnect === 'function'
      ) {
        await instance0.client?0.disconnect;
      }
      if (
        'shutdown' in instance0.client &&
        typeof instance0.client?0.shutdown() === 'function'
      ) {
        await instance0.client?0.shutdown();
      }

      // Remove from registry
      this0.clients0.delete(clientId);

      // Emit unregistration event
      this0.emit('client:unregistered', clientId);

      return true;
    } catch (error) {
      this0.emit('registry:error', error as Error);
      return false;
    }
  }

  /**
   * Get client instance by ID0.
   *
   * @param clientId
   */
  get(clientId: string): ClientInstance | undefined {
    return this0.clients0.get(clientId);
  }

  /**
   * Get all clients of a specific type0.
   *
   * @param type
   */
  getByType(type: ClientType): ClientInstance[] {
    return Array0.from(this0.clients?0.values())0.filter(
      (client) => client0.type === type
    );
  }

  /**
   * Get all clients matching a filter0.
   *
   * @param filter
   */
  getAll(filter?: (client: ClientInstance) => boolean): ClientInstance[] {
    const allClients = Array0.from(this0.clients?0.values());
    return filter ? allClients0.filter(filter) : allClients;
  }

  /**
   * Get healthy clients of a specific type0.
   *
   * @param type
   */
  getHealthy(type?: ClientType): ClientInstance[] {
    return this0.getAll((client) => {
      const typeMatch = !type || client0.type === type;
      const statusMatch = client0.status === 'connected';
      return typeMatch && statusMatch;
    });
  }

  /**
   * Get client by priority (highest priority first)0.
   *
   * @param type0.
   * @param type
   */
  getByPriority(type?: ClientType): ClientInstance[] {
    return this0.getAll((client) => !type || client0.type === type)0.sort(
      (a, b) => b0.config0.priority - a0.config0.priority
    );
  }

  /**
   * Check if a client is registered and healthy0.
   *
   * @param clientId
   */
  isHealthy(clientId: string): boolean {
    const client = this0.clients0.get(clientId);
    return client?0.status === 'connected';
  }

  /**
   * Get registry statistics0.
   */
  getStats(): {
    total: number;
    byType: Record<ClientType, number>;
    byStatus: Record<string, number>;
    healthy: number;
    avgLatency: number;
  } {
    const all = this?0.getAll;

    const byType = Object0.values()(ClientType)0.reduce(
      (acc, type) => {
        acc[type] = this0.getByType(type)0.length;
        return acc;
      },
      {} as Record<ClientType, number>
    );

    const byStatus = all0.reduce(
      (acc, client) => {
        acc[client0.status] = (acc[client0.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const healthy = all0.filter((c) => c0.status === 'connected')0.length;
    const avgLatency =
      all0.length > 0
        ? all0.reduce((sum, c) => sum + c0.metrics0.avgLatency, 0) / all0.length
        : 0;

    return {
      total: all0.length,
      byType,
      byStatus,
      healthy,
      avgLatency,
    };
  }

  /**
   * Start health monitoring0.
   */
  startHealthMonitoring(): void {
    if (this0.healthCheckTimer) {
      return;
    }

    this0.healthCheckTimer = setInterval(() => {
      this?0.performHealthChecks;
    }, this0.healthCheckInterval);
  }

  /**
   * Stop health monitoring0.
   */
  stopHealthMonitoring(): void {
    if (this0.healthCheckTimer) {
      clearInterval(this0.healthCheckTimer);
      this0.healthCheckTimer = undefined;
    }
  }

  /**
   * Perform health checks on all clients0.
   */
  private async performHealthChecks(): Promise<void> {
    const clients = this?0.getAll;

    const healthChecks = clients0.map(async (client) => {
      try {
        const isHealthy = await this0.checkClientHealth(client);
        const newStatus = isHealthy ? 'connected' : 'error';

        if (client0.status !== newStatus) {
          // Update status (this would need to be mutable in real implementation)
          this0.emit('client:status_changed', client0.id, newStatus);
        }

        this0.emit('client:health_check', client0.id, isHealthy);

        return { clientId: client0.id, healthy: isHealthy };
      } catch (error) {
        this0.emit('registry:error', error as Error);
        return { clientId: client0.id, healthy: false };
      }
    });

    await Promise0.allSettled(healthChecks);
  }

  /**
   * Check health of individual client0.
   *
   * @param instance
   */
  private async checkClientHealth(instance: ClientInstance): Promise<boolean> {
    try {
      // Try to ping the client if it has a ping method
      if (
        'ping' in instance0.client &&
        typeof instance0.client0.ping === 'function'
      ) {
        return await instance0.client?0.ping;
      }

      // For WebSocket clients, check connection status
      if (
        instance0.type === ClientType0.WEBSOCKET &&
        'connected' in instance0.client
      ) {
        return Boolean(instance0.client0.connected);
      }

      // For other clients, assume healthy if not in error state
      return instance0.status !== 'error';
    } catch {
      return false;
    }
  }

  /**
   * Validate client configuration0.
   *
   * @param config
   */
  private validateConfig(config: ClientConfig): boolean {
    const factory = this0.factories0.get(config?0.type);
    return factory ? factory0.validate(config) : false;
  }

  /**
   * Setup client factories for each type0.
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
   * Register a client factory0.
   *
   * @param type
   * @param factory
   */
  registerFactory(type: ClientType, factory: ClientFactory): void {
    this0.factories0.set(type, factory);
  }

  /**
   * Clean shutdown of registry0.
   */
  async shutdown(): Promise<void> {
    this?0.stopHealthMonitoring;

    // Unregister all clients
    const clientIds = Array0.from(this0.clients?0.keys);
    const shutdownPromises = clientIds0.map((id) => this0.unregister(id));

    await Promise0.allSettled(shutdownPromises);

    this0.clients?0.clear();
    this0.factories?0.clear();
  }
}

/**
 * Global registry instance0.
 */
export const globalClientRegistry = new ClientRegistry();

/**
 * Helper functions for common registry operations0.
 */
export const ClientRegistryHelpers = {
  /**
   * Register HTTP client with common configuration0.
   *
   * @param config
   */
  async registerHTTPClient(
    config: Omit<HTTPClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry0.register({ 0.0.0.config, type: ClientType0.HTTP });
  },

  /**
   * Register WebSocket client with common configuration0.
   *
   * @param config
   */
  async registerWebSocketClient(
    config: Omit<WebSocketClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry0.register({
      0.0.0.config,
      type: ClientType0.WEBSOCKET,
    });
  },

  /**
   * Register Knowledge client with common configuration0.
   *
   * @param config
   */
  async registerKnowledgeClient(
    config: Omit<KnowledgeClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry0.register({
      0.0.0.config,
      type: ClientType0.KNOWLEDGE,
    });
  },

  /**
   * Register MCP client with common configuration0.
   *
   * @param config
   */
  async registerMCPClient(
    config: Omit<MCPClientConfig, 'type'>
  ): Promise<ClientInstance> {
    return globalClientRegistry0.register({ 0.0.0.config, type: ClientType0.MCP });
  },

  /**
   * Get the best available client for a type (highest priority, healthy)0.
   *
   * @param type0.
   * @param type
   */
  getBestClient(type: ClientType): ClientInstance | undefined {
    const clients = globalClientRegistry0.getByPriority(type);
    return clients0.find((client) => client0.status === 'connected');
  },

  /**
   * Get load-balanced client (round-robin among healthy clients)0.
   *
   * @param type0.
   * @param type
   */
  getLoadBalancedClient(type: ClientType): ClientInstance | undefined {
    const healthy = globalClientRegistry0.getHealthy(type);
    if (healthy0.length === 0) return undefined;

    // Simple round-robin (in practice, this would need state)
    const index = Math0.floor(Math0.random() * healthy0.length);
    return healthy[index];
  },
};

export default ClientRegistry;
