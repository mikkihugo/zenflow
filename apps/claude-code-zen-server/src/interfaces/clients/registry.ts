/**
 * Client Registry System for UACL.
 *
 * Provides centralized registration, discovery, and management of all client types
 * with type safety, health monitoring, and event-driven status updates.
 *
 * @file Central registry for all client implementations.
 */

import { TypedEventBase, getLogger } from '@claude-zen/foundation';
import type { Client, ClientConfig, ClientMetrics, HealthCheckResult } from './core/interfaces';
import type { ProtocolType } from './types';

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
export interface BaseClientConfig {
  readonly id: string;
  readonly type: ClientType;
  readonly enabled?: boolean;
  readonly priority?: number;
  readonly timeout?: number;
  readonly healthCheckInterval?: number;
  readonly retryAttempts?: number;
}

/**
 * HTTP client specific configuration.
 */
export interface HTTPClientConfig extends BaseClientConfig {
  readonly type: ClientType.HTTP;
  readonly baseURL: string;
  readonly apiKey?: string;
  readonly bearerToken?: string;
  readonly headers?: Record<string, string>;
  readonly maxRetries?: number;
}

/**
 * WebSocket client specific configuration.
 */
export interface WebSocketClientConfig extends BaseClientConfig {
  readonly type: ClientType.WEBSOCKET;
  readonly url: string;
  readonly protocols?: string[];
  readonly reconnectInterval?: number;
  readonly maxReconnectAttempts?: number;
}

/**
 * Knowledge client specific configuration.
 */
export interface KnowledgeClientConfig extends BaseClientConfig {
  readonly type: ClientType.KNOWLEDGE;
  readonly provider: string;
  readonly endpoint?: string;
  readonly credentials?: Record<string, any>;
}

/**
 * MCP client specific configuration.
 */
export interface MCPClientConfig extends BaseClientConfig {
  readonly type: ClientType.MCP;
  readonly serverUrl: string;
  readonly capabilities?: string[];
  readonly authentication?: Record<string, any>;
}

/**
 * Union type for all client configurations.
 */
export type AnyClientConfig = HTTPClientConfig | WebSocketClientConfig | KnowledgeClientConfig | MCPClientConfig;

/**
 * Registered client entry.
 */
export interface RegisteredClient {
  readonly id: string;
  readonly type: ClientType;
  readonly config: AnyClientConfig;
  readonly client: Client;
  readonly registeredAt: Date;
  readonly lastHealthCheck?: Date;
  readonly isHealthy: boolean;
  readonly metrics?: ClientMetrics;
}

/**
 * Client registry events.
 */
export interface ClientRegistryEvents {
  'client:registered': { client: RegisteredClient };
  'client:unregistered': { id: string; type: ClientType };
  'client:health-changed': { id: string; isHealthy: boolean };
  'client:metrics-updated': { id: string; metrics: ClientMetrics };
  'registry:initialized': { clientCount: number };
  'registry:shutdown': { reason?: string };
}

/**
 * Client Registry System.
 *
 * Centralized registry for managing all client instances with type safety,
 * health monitoring, metrics collection, and event-driven notifications.
 */
export class ClientRegistry extends TypedEventBase<ClientRegistryEvents> {
  private clients = new Map<string, RegisteredClient>();
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private logger = getLogger('ClientRegistry');
  private initialized = false;

  constructor() {
    super();
  }

  /**
   * Initialize the registry.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.logger.info('Initializing client registry');

    // Start health monitoring
    this.startHealthMonitoring();
    
    // Start metrics collection
    this.startMetricsCollection();

    this.initialized = true;
    this.emit('registry:initialized', { clientCount: this.clients.size });
    
    this.logger.info('Client registry initialized');
  }

  /**
   * Register a client.
   */
  registerClient(config: AnyClientConfig, client: Client): void {
    if (this.clients.has(config.id)) {
      throw new Error(`Client with ID '${config.id}' is already registered`);
    }

    const registeredClient: RegisteredClient = {
      id: config.id,
      type: config.type,
      config,
      client,
      registeredAt: new Date(),
      isHealthy: true
    };

    this.clients.set(config.id, registeredClient);
    this.emit('client:registered', { client: registeredClient });
    
    this.logger.info(`Client registered: ${config.id} (${config.type})`);
  }

  /**
   * Unregister a client.
   */
  unregisterClient(id: string): boolean {
    const client = this.clients.get(id);
    if (!client) {
      return false;
    }

    this.clients.delete(id);
    this.emit('client:unregistered', { id, type: client.type });
    
    this.logger.info(`Client unregistered: ${id}`);
    return true;
  }

  /**
   * Get a client by ID.
   */
  getClient(id: string): RegisteredClient | undefined {
    return this.clients.get(id);
  }

  /**
   * Get all clients.
   */
  getAllClients(): RegisteredClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get clients by type.
   */
  getClientsByType(type: ClientType): RegisteredClient[] {
    return this.getAllClients().filter(client => client.type === type);
  }

  /**
   * Get healthy clients.
   */
  getHealthyClients(): RegisteredClient[] {
    return this.getAllClients().filter(client => client.isHealthy);
  }

  /**
   * Check if client exists.
   */
  hasClient(id: string): boolean {
    return this.clients.has(id);
  }

  /**
   * Get client count.
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client count by type.
   */
  getClientCountByType(): Record<ClientType, number> {
    const counts: Record<ClientType, number> = {
      [ClientType.HTTP]: 0,
      [ClientType.WEBSOCKET]: 0,
      [ClientType.KNOWLEDGE]: 0,
      [ClientType.MCP]: 0
    };

    for (const client of this.clients.values()) {
      counts[client.type]++;
    }

    return counts;
  }

  /**
   * Perform health check on all clients.
   */
  async performHealthCheck(): Promise<void> {
    const healthPromises = Array.from(this.clients.entries()).map(async ([id, registeredClient]) => {
      try {
        const health = await registeredClient.client.healthCheck();
        const isHealthy = health.status === 'healthy';
        
        if (registeredClient.isHealthy !== isHealthy) {
          // Update health status
          this.clients.set(id, {
            ...registeredClient,
            isHealthy,
            lastHealthCheck: new Date()
          });
          
          this.emit('client:health-changed', { id, isHealthy });
        }
      } catch (error) {
        this.logger.warn(`Health check failed for client ${id}:`, error);
        
        if (registeredClient.isHealthy) {
          // Mark as unhealthy
          this.clients.set(id, {
            ...registeredClient,
            isHealthy: false,
            lastHealthCheck: new Date()
          });
          
          this.emit('client:health-changed', { id, isHealthy: false });
        }
      }
    });

    await Promise.allSettled(healthPromises);
  }

  /**
   * Collect metrics from all clients.
   */
  async collectMetrics(): Promise<void> {
    const metricsPromises = Array.from(this.clients.entries()).map(async ([id, registeredClient]) => {
      try {
        const metrics = await registeredClient.client.getMetrics();
        
        // Update client with metrics
        this.clients.set(id, {
          ...registeredClient,
          metrics
        });
        
        this.emit('client:metrics-updated', { id, metrics });
      } catch (error) {
        this.logger.warn(`Metrics collection failed for client ${id}:`, error);
      }
    });

    await Promise.allSettled(metricsPromises);
  }

  /**
   * Get registry statistics.
   */
  getStatistics(): {
    totalClients: number;
    healthyClients: number;
    unhealthyClients: number;
    clientsByType: Record<ClientType, number>;
  } {
    const total = this.clients.size;
    let healthy = 0;

    for (const client of this.clients.values()) {
      if (client.isHealthy) {
        healthy++;
      }
    }

    return {
      totalClients: total,
      healthyClients: healthy,
      unhealthyClients: total - healthy,
      clientsByType: this.getClientCountByType()
    };
  }

  /**
   * Shutdown the registry.
   */
  async shutdown(reason?: string): Promise<void> {
    this.logger.info('Shutting down client registry', { reason });

    // Stop intervals
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Shutdown all clients
    const shutdownPromises = Array.from(this.clients.values()).map(async (registeredClient) => {
      try {
        await registeredClient.client.shutdown();
      } catch (error) {
        this.logger.error(`Error shutting down client ${registeredClient.id}:`, error);
      }
    });

    await Promise.allSettled(shutdownPromises);

    // Clear clients
    this.clients.clear();

    this.initialized = false;
    this.emit('registry:shutdown', { reason });
    
    this.logger.info('Client registry shutdown completed');
  }

  /**
   * Start health monitoring.
   */
  private startHealthMonitoring(): void {
    const interval = 30000; // 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.logger.error('Error during health check:', error);
      }
    }, interval);
  }

  /**
   * Start metrics collection.
   */
  private startMetricsCollection(): void {
    const interval = 60000; // 1 minute
    this.metricsInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        this.logger.error('Error during metrics collection:', error);
      }
    }, interval);
  }
}

/**
 * Global client registry instance.
 */
export const globalClientRegistry = new ClientRegistry();

/**
 * Initialize the global client registry.
 */
export const initializeClientRegistry = async (): Promise<void> => {
  return globalClientRegistry.initialize();
};

/**
 * Register a client globally.
 */
export const registerClient = (config: AnyClientConfig, client: Client): void => {
  return globalClientRegistry.registerClient(config, client);
};

/**
 * Get a client globally.
 */
export const getClient = (id: string): RegisteredClient | undefined => {
  return globalClientRegistry.getClient(id);
};

export default ClientRegistry;