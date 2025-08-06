/**
 * UACL Client Manager
 *
 * Manages the complete lifecycle of all client types in the system.
 * Provides factories, health monitoring, metrics collection, and recovery.
 *
 * @file Centralized client lifecycle management
 */

import { EventEmitter } from 'node:events';
import { FACTIntegration } from '../../knowledge/knowledge-client';

// Import actual client implementations
import { APIClient, createAPIClient } from '../api/http/client';
import { WebSocketClient } from '../api/websocket/client';
import { ExternalMCPClient } from '../mcp/external-mcp-client';
import {
  type ClientConfig,
  type ClientFactory,
  type ClientInstance,
  ClientRegistry,
  ClientType,
  type HTTPClientConfig,
  type KnowledgeClientConfig,
  type MCPClientConfig,
  type WebSocketClientConfig,
} from './registry';

/**
 * Manager configuration options
 *
 * @example
 */
export interface ClientManagerConfig {
  healthCheckInterval?: number;
  autoReconnect?: boolean;
  maxRetryAttempts?: number;
  retryDelay?: number;
  metricsRetention?: number; // How long to keep metrics (ms)
  enableLogging?: boolean;
}

/**
 * Client metrics interface
 *
 * @example
 */
export interface ClientMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgLatency: number;
    minLatency: number;
    maxLatency: number;
  };
  connections: {
    attempts: number;
    successful: number;
    failed: number;
    currentStatus: string;
  };
  health: {
    lastCheck: Date;
    checksTotal: number;
    checksSuccessful: number;
    uptime: number;
    downtimeTotal: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    recent: Array<{
      timestamp: Date;
      type: string;
      message: string;
    }>;
  };
}

/**
 * HTTP Client Factory Implementation
 *
 * @example
 */
class HTTPClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config.type !== ClientType.HTTP) {
      throw new Error('Invalid client type for HTTP factory');
    }

    const httpConfig = config as HTTPClientConfig;
    const apiClient = createAPIClient({
      baseURL: httpConfig.baseURL,
      timeout: httpConfig.timeout,
      apiKey: httpConfig.apiKey,
      bearerToken: httpConfig.bearerToken,
      headers: httpConfig.headers,
      retryAttempts: httpConfig.retryAttempts,
    });

    return {
      id: config.id,
      type: ClientType.HTTP,
      config,
      client: apiClient,
      status: 'initialized',
      metrics: this.createInitialMetrics(),
    };
  }

  validate(config: ClientConfig): boolean {
    if (config.type !== ClientType.HTTP) return false;
    const httpConfig = config as HTTPClientConfig;
    return !!(httpConfig.baseURL && httpConfig.id);
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType.HTTP) return {};
    return {
      enabled: true,
      priority: 5,
      timeout: 30000,
      retryAttempts: 3,
      healthCheckInterval: 30000,
    };
  }

  private createInitialMetrics(): ClientMetrics {
    return {
      requests: { total: 0, successful: 0, failed: 0, avgLatency: 0, minLatency: 0, maxLatency: 0 },
      connections: { attempts: 0, successful: 0, failed: 0, currentStatus: 'initialized' },
      health: {
        lastCheck: new Date(),
        checksTotal: 0,
        checksSuccessful: 0,
        uptime: 0,
        downtimeTotal: 0,
      },
      errors: { total: 0, byType: {}, recent: [] },
    };
  }
}

/**
 * WebSocket Client Factory Implementation
 *
 * @example
 */
class WebSocketClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config.type !== ClientType.WEBSOCKET) {
      throw new Error('Invalid client type for WebSocket factory');
    }

    const wsConfig = config as WebSocketClientConfig;
    const wsClient = new WebSocketClient(wsConfig.url, {
      reconnect: wsConfig.reconnect,
      reconnectInterval: wsConfig.reconnectInterval,
      maxReconnectAttempts: wsConfig.maxReconnectAttempts,
      timeout: wsConfig.timeout,
    });

    return {
      id: config.id,
      type: ClientType.WEBSOCKET,
      config,
      client: wsClient,
      status: 'initialized',
      metrics: this.createInitialMetrics(),
    };
  }

  validate(config: ClientConfig): boolean {
    if (config.type !== ClientType.WEBSOCKET) return false;
    const wsConfig = config as WebSocketClientConfig;
    return !!(wsConfig.url && wsConfig.id);
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType.WEBSOCKET) return {};
    return {
      enabled: true,
      priority: 5,
      timeout: 30000,
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      healthCheckInterval: 30000,
    };
  }

  private createInitialMetrics(): ClientMetrics {
    return {
      requests: { total: 0, successful: 0, failed: 0, avgLatency: 0, minLatency: 0, maxLatency: 0 },
      connections: { attempts: 0, successful: 0, failed: 0, currentStatus: 'initialized' },
      health: {
        lastCheck: new Date(),
        checksTotal: 0,
        checksSuccessful: 0,
        uptime: 0,
        downtimeTotal: 0,
      },
      errors: { total: 0, byType: {}, recent: [] },
    };
  }
}

/**
 * Knowledge (FACT) Client Factory Implementation
 *
 * @example
 */
class KnowledgeClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config.type !== ClientType.KNOWLEDGE) {
      throw new Error('Invalid client type for Knowledge factory');
    }

    const knowledgeConfig = config as KnowledgeClientConfig;
    const factClient = new FACTIntegration({
      factRepoPath: knowledgeConfig.factRepoPath,
      anthropicApiKey: knowledgeConfig.anthropicApiKey,
      pythonPath: knowledgeConfig.pythonPath,
      enableCache: knowledgeConfig.enableCache,
      cacheConfig: knowledgeConfig.cacheConfig,
    });

    return {
      id: config.id,
      type: ClientType.KNOWLEDGE,
      config,
      client: factClient,
      status: 'initialized',
      metrics: this.createInitialMetrics(),
    };
  }

  validate(config: ClientConfig): boolean {
    if (config.type !== ClientType.KNOWLEDGE) return false;
    const knowledgeConfig = config as KnowledgeClientConfig;
    return !!(
      knowledgeConfig.factRepoPath &&
      knowledgeConfig.anthropicApiKey &&
      knowledgeConfig.id
    );
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType.KNOWLEDGE) return {};
    return {
      enabled: true,
      priority: 5,
      timeout: 30000,
      pythonPath: 'python3',
      enableCache: true,
      healthCheckInterval: 60000,
    };
  }

  private createInitialMetrics(): ClientMetrics {
    return {
      requests: { total: 0, successful: 0, failed: 0, avgLatency: 0, minLatency: 0, maxLatency: 0 },
      connections: { attempts: 0, successful: 0, failed: 0, currentStatus: 'initialized' },
      health: {
        lastCheck: new Date(),
        checksTotal: 0,
        checksSuccessful: 0,
        uptime: 0,
        downtimeTotal: 0,
      },
      errors: { total: 0, byType: {}, recent: [] },
    };
  }
}

/**
 * MCP Client Factory Implementation
 *
 * @example
 */
class MCPClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config.type !== ClientType.MCP) {
      throw new Error('Invalid client type for MCP factory');
    }

    const mcpConfig = config as MCPClientConfig;
    const mcpClient = new ExternalMCPClient();

    return {
      id: config.id,
      type: ClientType.MCP,
      config,
      client: mcpClient,
      status: 'initialized',
      metrics: this.createInitialMetrics(),
    };
  }

  validate(config: ClientConfig): boolean {
    if (config.type !== ClientType.MCP) return false;
    const mcpConfig = config as MCPClientConfig;
    return !!(mcpConfig.servers && Object.keys(mcpConfig.servers).length > 0 && mcpConfig.id);
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType.MCP) return {};
    return {
      enabled: true,
      priority: 5,
      timeout: 30000,
      retryAttempts: 3,
      healthCheckInterval: 30000,
    };
  }

  private createInitialMetrics(): ClientMetrics {
    return {
      requests: { total: 0, successful: 0, failed: 0, avgLatency: 0, minLatency: 0, maxLatency: 0 },
      connections: { attempts: 0, successful: 0, failed: 0, currentStatus: 'initialized' },
      health: {
        lastCheck: new Date(),
        checksTotal: 0,
        checksSuccessful: 0,
        uptime: 0,
        downtimeTotal: 0,
      },
      errors: { total: 0, byType: {}, recent: [] },
    };
  }
}

/**
 * Main Client Manager Class
 *
 * Provides complete lifecycle management for all client types:
 * - Factory registration and client creation
 * - Health monitoring and auto-recovery
 * - Metrics collection and analysis
 * - Configuration validation
 * - Error handling and logging
 *
 * @example
 */
export class ClientManager extends EventEmitter {
  public readonly registry: ClientRegistry;
  private config: Required<ClientManagerConfig>;
  private metricsStore = new Map<string, ClientMetrics>();
  private reconnectTimers = new Map<string, NodeJS.Timeout>();
  private isInitialized = false;

  constructor(config: ClientManagerConfig = {}) {
    super();

    this.config = {
      healthCheckInterval: config.healthCheckInterval ?? 30000,
      autoReconnect: config.autoReconnect ?? true,
      maxRetryAttempts: config.maxRetryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      metricsRetention: config.metricsRetention ?? 24 * 60 * 60 * 1000, // 1 day
      enableLogging: config.enableLogging ?? true,
    };

    this.registry = new ClientRegistry(this.config.healthCheckInterval);
    this.setupEventHandlers();
  }

  /**
   * Initialize the client manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Register all client factories
    this.registry.registerFactory(ClientType.HTTP, new HTTPClientFactory());
    this.registry.registerFactory(ClientType.WEBSOCKET, new WebSocketClientFactory());
    this.registry.registerFactory(ClientType.KNOWLEDGE, new KnowledgeClientFactory());
    this.registry.registerFactory(ClientType.MCP, new MCPClientFactory());

    // Start health monitoring
    this.registry.startHealthMonitoring();

    this.isInitialized = true;
    this.emit('initialized');

    if (this.config.enableLogging) {
      console.log('✅ UACL Client Manager initialized successfully');
    }
  }

  /**
   * Create and register a new client
   *
   * @param config
   */
  async createClient(config: ClientConfig): Promise<ClientInstance> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const instance = await this.registry.register(config);

    // Initialize metrics for this client
    this.metricsStore.set(config.id, this.createInitialMetrics());

    // Connect the client if it's enabled
    if (config.enabled) {
      await this.connectClient(config.id);
    }

    return instance;
  }

  /**
   * Connect a client by ID
   *
   * @param clientId
   */
  async connectClient(clientId: string): Promise<boolean> {
    const instance = this.registry.get(clientId);
    if (!instance) {
      throw new Error(`Client ${clientId} not found`);
    }

    try {
      const metrics = this.metricsStore.get(clientId)!;
      metrics.connections.attempts++;

      // Connect based on client type
      if (instance.type === ClientType.WEBSOCKET && 'connect' in instance.client) {
        await (instance.client as WebSocketClient).connect();
      } else if (instance.type === ClientType.KNOWLEDGE && 'initialize' in instance.client) {
        await (instance.client as FACTIntegration).initialize();
      } else if (instance.type === ClientType.MCP && 'connectAll' in instance.client) {
        await (instance.client as ExternalMCPClient).connectAll();
      }
      // HTTP clients are stateless, so they're always "connected"

      metrics.connections.successful++;
      metrics.connections.currentStatus = 'connected';

      this.emit('client:connected', clientId);

      if (this.config.enableLogging) {
        console.log(`✅ Client ${clientId} connected successfully`);
      }

      return true;
    } catch (error) {
      const metrics = this.metricsStore.get(clientId)!;
      metrics.connections.failed++;
      metrics.errors.total++;
      metrics.errors.recent.push({
        timestamp: new Date(),
        type: 'connection_error',
        message: error instanceof Error ? error.message : String(error),
      });

      this.emit('client:error', clientId, error);

      // Auto-reconnect if enabled
      if (this.config.autoReconnect) {
        this.scheduleReconnect(clientId);
      }

      return false;
    }
  }

  /**
   * Disconnect a client by ID
   *
   * @param clientId
   */
  async disconnectClient(clientId: string): Promise<boolean> {
    const instance = this.registry.get(clientId);
    if (!instance) {
      return false;
    }

    try {
      // Cancel any pending reconnect
      const timer = this.reconnectTimers.get(clientId);
      if (timer) {
        clearTimeout(timer);
        this.reconnectTimers.delete(clientId);
      }

      // Disconnect based on client type
      if (instance.type === ClientType.WEBSOCKET && 'disconnect' in instance.client) {
        (instance.client as WebSocketClient).disconnect();
      } else if (instance.type === ClientType.KNOWLEDGE && 'shutdown' in instance.client) {
        await (instance.client as FACTIntegration).shutdown();
      } else if (instance.type === ClientType.MCP && 'disconnectAll' in instance.client) {
        await (instance.client as ExternalMCPClient).disconnectAll();
      }

      const metrics = this.metricsStore.get(clientId);
      if (metrics) {
        metrics.connections.currentStatus = 'disconnected';
      }

      this.emit('client:disconnected', clientId);

      if (this.config.enableLogging) {
        console.log(`📡 Client ${clientId} disconnected`);
      }

      return true;
    } catch (error) {
      this.emit('client:error', clientId, error);
      return false;
    }
  }

  /**
   * Remove a client completely
   *
   * @param clientId
   */
  async removeClient(clientId: string): Promise<boolean> {
    await this.disconnectClient(clientId);
    this.metricsStore.delete(clientId);
    return this.registry.unregister(clientId);
  }

  /**
   * Get client instance by ID
   *
   * @param clientId
   */
  getClient(clientId: string): ClientInstance | undefined {
    return this.registry.get(clientId);
  }

  /**
   * Get all clients of a specific type
   *
   * @param type
   */
  getClientsByType(type: ClientType): ClientInstance[] {
    return this.registry.getByType(type);
  }

  /**
   * Get the best available client for a type
   *
   * @param type
   */
  getBestClient(type: ClientType): ClientInstance | undefined {
    const healthy = this.registry.getHealthy(type);
    if (healthy.length === 0) return undefined;

    // Return highest priority healthy client
    return healthy.sort((a, b) => b.config.priority - a.config.priority)[0];
  }

  /**
   * Get client metrics
   *
   * @param clientId
   */
  getClientMetrics(clientId: string): ClientMetrics | undefined {
    return this.metricsStore.get(clientId);
  }

  /**
   * Get aggregated metrics for all clients
   */
  getAggregatedMetrics(): {
    total: number;
    connected: number;
    byType: Record<ClientType, { total: number; connected: number; avgLatency: number }>;
    totalRequests: number;
    totalErrors: number;
    avgLatency: number;
  } {
    const stats = this.registry.getStats();
    const allMetrics = Array.from(this.metricsStore.values());

    const totalRequests = allMetrics.reduce((sum, m) => sum + m.requests.total, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errors.total, 0);
    const avgLatency =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, m) => sum + m.requests.avgLatency, 0) / allMetrics.length
        : 0;

    const byType = Object.values(ClientType).reduce(
      (acc, type) => {
        const typeClients = this.registry.getByType(type);
        const typeMetrics = typeClients
          .map((c) => this.metricsStore.get(c.id))
          .filter(Boolean) as ClientMetrics[];

        acc[type] = {
          total: typeClients.length,
          connected: typeClients.filter((c) => c.status === 'connected').length,
          avgLatency:
            typeMetrics.length > 0
              ? typeMetrics.reduce((sum, m) => sum + m.requests.avgLatency, 0) / typeMetrics.length
              : 0,
        };

        return acc;
      },
      {} as Record<ClientType, { total: number; connected: number; avgLatency: number }>
    );

    return {
      total: stats.total,
      connected: stats.healthy,
      byType,
      totalRequests,
      totalErrors,
      avgLatency,
    };
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    overall: 'healthy' | 'warning' | 'critical';
    details: Record<string, { status: 'healthy' | 'warning' | 'critical'; message?: string }>;
  } {
    const stats = this.registry.getStats();
    const healthyPercentage = stats.total > 0 ? stats.healthy / stats.total : 1;

    const overall =
      healthyPercentage >= 0.8 ? 'healthy' : healthyPercentage >= 0.5 ? 'warning' : 'critical';

    const details: Record<
      string,
      { status: 'healthy' | 'warning' | 'critical'; message?: string }
    > = {};

    for (const type of Object.values(ClientType)) {
      const typeClients = this.getClientsByType(type);
      const healthyType = typeClients.filter((c) => c.status === 'connected').length;
      const totalType = typeClients.length;

      if (totalType === 0) {
        details[type] = { status: 'healthy', message: 'No clients configured' };
      } else {
        const typeHealthy = healthyType / totalType;
        details[type] = {
          status: typeHealthy >= 0.8 ? 'healthy' : typeHealthy >= 0.5 ? 'warning' : 'critical',
          message: `${healthyType}/${totalType} clients healthy`,
        };
      }
    }

    return { overall, details };
  }

  /**
   * Schedule reconnection attempt
   *
   * @param clientId
   */
  private scheduleReconnect(clientId: string): void {
    // Clear any existing timer
    const existingTimer = this.reconnectTimers.get(clientId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const metrics = this.metricsStore.get(clientId);
    if (!metrics) return;

    const attempts = metrics.connections.failed;
    if (attempts >= this.config.maxRetryAttempts) {
      if (this.config.enableLogging) {
        console.log(`❌ Max reconnection attempts reached for client ${clientId}`);
      }
      return;
    }

    const delay = this.config.retryDelay * 2 ** Math.min(attempts, 5); // Exponential backoff

    const timer = setTimeout(() => {
      this.reconnectTimers.delete(clientId);
      this.connectClient(clientId);
    }, delay);

    this.reconnectTimers.set(clientId, timer);

    if (this.config.enableLogging) {
      console.log(
        `🔄 Scheduling reconnect for client ${clientId} in ${delay}ms (attempt ${attempts + 1})`
      );
    }
  }

  /**
   * Setup event handlers for registry events
   */
  private setupEventHandlers(): void {
    this.registry.on('client:registered', (client) => {
      this.emit('client:registered', client);
    });

    this.registry.on('client:unregistered', (clientId) => {
      this.emit('client:unregistered', clientId);
    });

    this.registry.on('client:status_changed', (clientId, status) => {
      const metrics = this.metricsStore.get(clientId);
      if (metrics) {
        metrics.connections.currentStatus = status;
      }
      this.emit('client:status_changed', clientId, status);
    });

    this.registry.on('client:health_check', (clientId, healthy) => {
      const metrics = this.metricsStore.get(clientId);
      if (metrics) {
        metrics.health.lastCheck = new Date();
        metrics.health.checksTotal++;
        if (healthy) {
          metrics.health.checksSuccessful++;
        }
      }
      this.emit('client:health_check', clientId, healthy);
    });

    this.registry.on('registry:error', (error) => {
      this.emit('error', error);
    });
  }

  /**
   * Create initial metrics for a client
   */
  private createInitialMetrics(): ClientMetrics {
    return {
      requests: { total: 0, successful: 0, failed: 0, avgLatency: 0, minLatency: 0, maxLatency: 0 },
      connections: { attempts: 0, successful: 0, failed: 0, currentStatus: 'initialized' },
      health: {
        lastCheck: new Date(),
        checksTotal: 0,
        checksSuccessful: 0,
        uptime: 0,
        downtimeTotal: 0,
      },
      errors: { total: 0, byType: {}, recent: [] },
    };
  }

  /**
   * Clean shutdown of the manager
   */
  async shutdown(): Promise<void> {
    if (this.config.enableLogging) {
      console.log('🛑 Shutting down UACL Client Manager...');
    }

    // Clear all reconnect timers
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();

    // Shutdown the registry (which will disconnect all clients)
    await this.registry.shutdown();

    // Clear metrics
    this.metricsStore.clear();

    this.isInitialized = false;
    this.emit('shutdown');

    if (this.config.enableLogging) {
      console.log('✅ UACL Client Manager shutdown complete');
    }
  }
}

/**
 * Global client manager instance
 */
export const globalClientManager = new ClientManager();

/**
 * Helper functions for common manager operations
 */
export const ClientManagerHelpers = {
  /**
   * Initialize the global manager with default configuration
   *
   * @param config
   */
  async initialize(config?: ClientManagerConfig): Promise<void> {
    if (config) {
      // Would need to recreate manager with new config in real implementation
    }
    await globalClientManager.initialize();
  },

  /**
   * Create HTTP client with sensible defaults
   *
   * @param id
   * @param baseURL
   * @param options
   */
  async createHTTPClient(
    id: string,
    baseURL: string,
    options: Partial<HTTPClientConfig> = {}
  ): Promise<ClientInstance> {
    return globalClientManager.createClient({
      id,
      type: ClientType.HTTP,
      baseURL,
      enabled: true,
      priority: 5,
      timeout: 30000,
      retryAttempts: 3,
      ...options,
    });
  },

  /**
   * Create WebSocket client with sensible defaults
   *
   * @param id
   * @param url
   * @param options
   */
  async createWebSocketClient(
    id: string,
    url: string,
    options: Partial<WebSocketClientConfig> = {}
  ): Promise<ClientInstance> {
    return globalClientManager.createClient({
      id,
      type: ClientType.WEBSOCKET,
      url,
      enabled: true,
      priority: 5,
      timeout: 30000,
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      ...options,
    });
  },

  /**
   * Create Knowledge client with sensible defaults
   *
   * @param id
   * @param factRepoPath
   * @param anthropicApiKey
   * @param options
   */
  async createKnowledgeClient(
    id: string,
    factRepoPath: string,
    anthropicApiKey: string,
    options: Partial<KnowledgeClientConfig> = {}
  ): Promise<ClientInstance> {
    return globalClientManager.createClient({
      id,
      type: ClientType.KNOWLEDGE,
      factRepoPath,
      anthropicApiKey,
      enabled: true,
      priority: 5,
      timeout: 30000,
      pythonPath: 'python3',
      enableCache: true,
      ...options,
    });
  },

  /**
   * Create MCP client with sensible defaults
   *
   * @param id
   * @param servers
   * @param options
   */
  async createMCPClient(
    id: string,
    servers: MCPClientConfig['servers'],
    options: Partial<MCPClientConfig> = {}
  ): Promise<ClientInstance> {
    return globalClientManager.createClient({
      id,
      type: ClientType.MCP,
      servers,
      enabled: true,
      priority: 5,
      timeout: 30000,
      retryAttempts: 3,
      ...options,
    });
  },

  /**
   * Get comprehensive system status
   */
  getSystemStatus(): {
    health: ReturnType<ClientManager['getHealthStatus']>;
    metrics: ReturnType<ClientManager['getAggregatedMetrics']>;
    clients: ClientInstance[];
  } {
    return {
      health: globalClientManager.getHealthStatus(),
      metrics: globalClientManager.getAggregatedMetrics(),
      clients: globalClientManager.registry.getAll(),
    };
  },
};

export default ClientManager;
