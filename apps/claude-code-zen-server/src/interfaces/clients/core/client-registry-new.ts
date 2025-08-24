/**
 * UACL Client Registry
 * 
 * Central registry for managing client instances, factories, and lifecycle.
 * Provides service container integration, health monitoring, and resource management.
 */

import { getLogger, createServiceContainer } from '@claude-zen/foundation';
import type {
  Client,
  ClientFactory,
  ClientConfig,
  ClientMetrics,
  ClientCapabilities
} from './interfaces';
import type { ProtocolType } from '../types';
import { ProtocolTypes } from '../types';

const logger = getLogger('ClientRegistry');

/**
 * Client registry entry
 */
export interface ClientRegistryEntry {
  /** Client instance ID */
  id: string;
  
  /** Client instance */
  client: Client;
  
  /** Client configuration */
  config: ClientConfig;
  
  /** Protocol type */
  protocol: ProtocolType;
  
  /** Factory that created this client */
  factory?: ClientFactory;
  
  /** Registration timestamp */
  createdAt: Date;
  
  /** Last accessed timestamp */
  lastAccessedAt: Date;
  
  /** Reference count */
  refCount: number;
  
  /** Client tags for categorization */
  tags: string[];
  
  /** Client metadata */
  metadata: Record<string, any>;
}

/**
 * Factory registry entry
 */
export interface FactoryRegistryEntry {
  /** Factory ID */
  id: string;
  
  /** Factory instance */
  factory: ClientFactory;
  
  /** Supported protocols */
  protocols: ProtocolType[];
  
  /** Registration timestamp */
  registeredAt: Date;
  
  /** Factory metadata */
  metadata: Record<string, any>;
}

/**
 * Registry statistics
 */
export interface RegistryStatistics {
  /** Total registered clients */
  totalClients: number;
  
  /** Active clients */
  activeClients: number;
  
  /** Total factories */
  totalFactories: number;
  
  /** Clients by protocol */
  clientsByProtocol: Record<string, number>;
  
  /** Memory usage estimate */
  memoryUsage: number;
  
  /** Average client lifetime */
  averageClientLifetime: number;
  
  /** Registry uptime */
  uptime: number;
  
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Client Registry Options
 */
export interface ClientRegistryOptions {
  /** Enable automatic cleanup of unused clients */
  autoCleanup?: boolean;
  
  /** Cleanup interval in milliseconds */
  cleanupInterval?: number;
  
  /** Maximum client lifetime in milliseconds */
  maxClientLifetime?: number;
  
  /** Enable health monitoring */
  enableHealthMonitoring?: boolean;
  
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
  
  /** Enable metrics collection */
  enableMetrics?: boolean;
  
  /** Maximum number of clients */
  maxClients?: number;
}

/**
 * UACL Client Registry
 * 
 * Manages all client instances and factories in the system.
 * Provides lifecycle management, health monitoring, and resource optimization.
 */
export class ClientRegistry {
  private clients = new Map<string, ClientRegistryEntry>();
  private factories = new Map<string, FactoryRegistryEntry>();
  private container = createServiceContainer();
  private options: Required<ClientRegistryOptions>;
  private initialized = false;
  private cleanupTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  private startTime = Date.now();

  constructor(options: ClientRegistryOptions = {}) {
    this.options = {
      autoCleanup: options.autoCleanup ?? true,
      cleanupInterval: options.cleanupInterval ?? 60000, // 1 minute
      maxClientLifetime: options.maxClientLifetime ?? 3600000, // 1 hour
      enableHealthMonitoring: options.enableHealthMonitoring ?? true,
      healthCheckInterval: options.healthCheckInterval ?? 30000, // 30 seconds
      enableMetrics: options.enableMetrics ?? true,
      maxClients: options.maxClients ?? 1000
    };
  }

  /**
   * Initialize the registry with enhanced ServiceContainer features.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.info('Initializing UACL Client Registry', this.options);

    // Start health monitoring
    if (this.options.enableHealthMonitoring) {
      await this.startHealthMonitoring();
    }

    // Start automatic cleanup
    if (this.options.autoCleanup) {
      this.startAutoCleanup();
    }

    this.initialized = true;
    logger.info('UACL Client Registry initialized successfully');
  }

  /**
   * Register a client factory
   */
  registerFactory(id: string, factory: ClientFactory, metadata: Record<string, any> = {}): void {
    if (this.factories.has(id)) {
      throw new Error(`Factory with ID '${id}' is already registered`);
    }

    const entry: FactoryRegistryEntry = {
      id,
      factory,
      protocols: factory.getSupportedProtocols(),
      registeredAt: new Date(),
      metadata
    };

    this.factories.set(id, entry);
    logger.info('Registered client factory', { id, protocols: entry.protocols });
  }

  /**
   * Unregister a client factory
   */
  unregisterFactory(id: string): boolean {
    const factory = this.factories.get(id);
    if (!factory) {
      return false;
    }

    // Clean up any clients created by this factory
    const clientsToRemove: string[] = [];
    for (const [clientId, client] of this.clients) {
      if (client.factory === factory.factory) {
        clientsToRemove.push(clientId);
      }
    }

    for (const clientId of clientsToRemove) {
      this.unregisterClient(clientId);
    }

    this.factories.delete(id);
    logger.info('Unregistered client factory', { id, cleanedClients: clientsToRemove.length });
    return true;
  }

  /**
   * Register a client instance
   */
  registerClient(
    id: string,
    client: Client,
    config: ClientConfig,
    protocol: ProtocolType,
    options: {
      factory?: ClientFactory;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): void {
    if (this.clients.has(id)) {
      throw new Error(`Client with ID '${id}' is already registered`);
    }

    if (this.clients.size >= this.options.maxClients) {
      throw new Error(`Maximum number of clients (${this.options.maxClients}) reached`);
    }

    const now = new Date();
    const entry: ClientRegistryEntry = {
      id,
      client,
      config,
      protocol,
      factory: options.factory,
      createdAt: now,
      lastAccessedAt: now,
      refCount: 1,
      tags: options.tags || [],
      metadata: options.metadata || {}
    };

    this.clients.set(id, entry);
    logger.info('Registered client', { id, protocol, tags: entry.tags });
  }

  /**
   * Unregister a client instance
   */
  async unregisterClient(id: string): Promise<boolean> {
    const entry = this.clients.get(id);
    if (!entry) {
      return false;
    }

    try {
      // Disconnect client if connected
      if (entry.client.getStatus() === 'connected') {
        await entry.client.disconnect();
      }

      this.clients.delete(id);
      logger.info('Unregistered client', { id, protocol: entry.protocol });
      return true;
    } catch (error) {
      logger.error('Error unregistering client', { id, error });
      return false;
    }
  }

  /**
   * Get client by ID
   */
  getClient(id: string): Client | undefined {
    const entry = this.clients.get(id);
    if (entry) {
      entry.lastAccessedAt = new Date();
      entry.refCount++;
      return entry.client;
    }
    return undefined;
  }

  /**
   * Get client entry with metadata
   */
  getClientEntry(id: string): ClientRegistryEntry | undefined {
    const entry = this.clients.get(id);
    if (entry) {
      entry.lastAccessedAt = new Date();
      return entry;
    }
    return undefined;
  }

  /**
   * Find clients by criteria
   */
  findClients(criteria: {
    protocol?: ProtocolType;
    tags?: string[];
    status?: string;
    factory?: ClientFactory;
  }): ClientRegistryEntry[] {
    const results: ClientRegistryEntry[] = [];

    for (const entry of this.clients.values()) {
      let matches = true;

      if (criteria.protocol && entry.protocol !== criteria.protocol) {
        matches = false;
      }

      if (criteria.tags && !criteria.tags.every(tag => entry.tags.includes(tag))) {
        matches = false;
      }

      if (criteria.status && entry.client.getStatus() !== criteria.status) {
        matches = false;
      }

      if (criteria.factory && entry.factory !== criteria.factory) {
        matches = false;
      }

      if (matches) {
        results.push(entry);
      }
    }

    return results;
  }

  /**
   * Get factory by ID
   */
  getFactory(id: string): ClientFactory | undefined {
    return this.factories.get(id)?.factory;
  }

  /**
   * Find factory for protocol
   */
  findFactoryForProtocol(protocol: ProtocolType): ClientFactory | undefined {
    for (const entry of this.factories.values()) {
      if (entry.protocols.includes(protocol)) {
        return entry.factory;
      }
    }
    return undefined;
  }

  /**
   * Create client using registered factory
   */
  async createClient(
    protocol: ProtocolType,
    config: ClientConfig,
    options: {
      id?: string;
      factoryId?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<Client> {
    const factory = options.factoryId
      ? this.getFactory(options.factoryId)
      : this.findFactoryForProtocol(protocol);

    if (!factory) {
      throw new Error(`No factory found for protocol: ${protocol}`);
    }

    const client = await factory.create(protocol, config);
    const clientId = options.id || this.generateClientId(protocol);

    this.registerClient(clientId, client, config, protocol, {
      factory,
      tags: options.tags,
      metadata: options.metadata
    });

    return client;
  }

  /**
   * Get registry statistics
   */
  getStatistics(): RegistryStatistics {
    const now = Date.now();
    const clientsByProtocol: Record<string, number> = {};
    let totalLifetime = 0;

    for (const entry of this.clients.values()) {
      const protocol = entry.protocol;
      clientsByProtocol[protocol] = (clientsByProtocol[protocol] || 0) + 1;
      totalLifetime += now - entry.createdAt.getTime();
    }

    return {
      totalClients: this.clients.size,
      activeClients: this.findClients({ status: 'connected' }).length,
      totalFactories: this.factories.size,
      clientsByProtocol,
      memoryUsage: process.memoryUsage().heapUsed,
      averageClientLifetime: this.clients.size > 0 ? totalLifetime / this.clients.size : 0,
      uptime: now - this.startTime,
      lastUpdated: new Date()
    };
  }

  /**
   * Cleanup unused clients
   */
  async cleanup(force = false): Promise<number> {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, entry] of this.clients) {
      const lifetime = now - entry.createdAt.getTime();
      const isExpired = lifetime > this.options.maxClientLifetime;
      const isDisconnected = entry.client.getStatus() === 'disconnected';
      const isUnused = entry.refCount <= 1 && (now - entry.lastAccessedAt.getTime()) > 300000; // 5 minutes

      if (force || (isExpired && (isDisconnected || isUnused))) {
        toRemove.push(id);
      }
    }

    let cleaned = 0;
    for (const id of toRemove) {
      if (await this.unregisterClient(id)) {
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up unused clients', { cleaned, total: this.clients.size });
    }

    return cleaned;
  }

  /**
   * Shutdown registry and cleanup all resources
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down UACL Client Registry');

    // Stop timers
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Cleanup all clients
    await this.cleanup(true);

    // Clear all factories
    this.factories.clear();

    this.initialized = false;
    logger.info('UACL Client Registry shutdown complete');
  }

  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanup();
      } catch (error) {
        logger.error('Error during automatic cleanup', error);
      }
    }, this.options.cleanupInterval);
  }

  /**
   * Start health monitoring
   */
  private async startHealthMonitoring(): Promise<void> {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        logger.error('Error during health checks', error);
      }
    }, this.options.healthCheckInterval);
  }

  /**
   * Perform health checks on all clients
   */
  private async performHealthChecks(): Promise<void> {
    const unhealthyClients: string[] = [];

    for (const [id, entry] of this.clients) {
      try {
        const status = entry.client.getStatus();
        if (status === 'error' || status === 'disconnected') {
          // Check if client should be reconnected or cleaned up
          const timeSinceLastAccess = Date.now() - entry.lastAccessedAt.getTime();
          if (timeSinceLastAccess > 600000) { // 10 minutes
            unhealthyClients.push(id);
          }
        }
      } catch (error) {
        logger.warn('Health check failed for client', { id, error });
        unhealthyClients.push(id);
      }
    }

    // Cleanup unhealthy clients
    for (const id of unhealthyClients) {
      await this.unregisterClient(id);
    }

    if (unhealthyClients.length > 0) {
      logger.info('Cleaned up unhealthy clients', { count: unhealthyClients.length });
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(protocol: ProtocolType): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${protocol}_${timestamp}_${random}`;
  }
}

// Global registry instance
export const globalClientRegistry = new ClientRegistry();

// Initialize on import
globalClientRegistry.initialize().catch(error => {
  logger.error('Failed to initialize global client registry', error);
});

export default ClientRegistry;