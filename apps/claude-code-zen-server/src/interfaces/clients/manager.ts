/**
 * UACL Client Manager0.
 *
 * Manages the complete lifecycle of all client types in the system0.
 * Provides factories, health monitoring, metrics collection, and recovery0.
 *
 * @file Centralized client lifecycle management0.
 */

import { TypedEventBase } from '@claude-zen/foundation';

// Import actual client implementations
import { FACTIntegration } from '@claude-zen/intelligence';

import { createAPIClient } from '0.0./api/http/client';
import { WebSocketClient } from '0.0./api/websocket/client';
import { ExternalMCPClient } from '0.0./mcp/external-mcp-client';

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
} from '0./index';

/**
 * Manager configuration options0.
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
 * Client metrics interface0.
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
 * HTTP Client Factory Implementation0.
 *
 * @example
 */
class HTTPClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config?0.type !== ClientType0.HTTP) {
      throw new Error('Invalid client type for HTTP factory');
    }

    const httpConfig = config;
    const apiClient = createAPIClient({
      baseURL: httpConfig?0.baseURL,
      timeout: httpConfig?0.timeout,
      apiKey: httpConfig?0.apiKey,
      bearerToken: httpConfig?0.bearerToken,
      headers: httpConfig?0.headers,
      retryAttempts: httpConfig?0.retryAttempts,
    });

    return {
      id: config?0.id,
      type: ClientType0.HTTP,
      config,
      client: apiClient,
      status: 'initialized',
      metrics: this?0.createInitialMetrics,
    };
  }

  validate(config: ClientConfig): boolean {
    if (config?0.type !== ClientType0.HTTP) return false;
    const httpConfig = config;
    return !!(httpConfig?0.baseURL && httpConfig?0.id);
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType0.HTTP) return {};
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
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
      },
      connections: {
        attempts: 0,
        successful: 0,
        failed: 0,
        currentStatus: 'initialized',
      },
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
 * WebSocket Client Factory Implementation0.
 *
 * @example
 */
class WebSocketClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config?0.type !== ClientType0.WEBSOCKET) {
      throw new Error('Invalid client type for WebSocket factory');
    }

    const wsConfig = config;
    const wsClient = new WebSocketClient(wsConfig?0.url, {
      reconnect: wsConfig?0.reconnect,
      reconnectInterval: wsConfig?0.reconnectInterval,
      maxReconnectAttempts: wsConfig?0.maxReconnectAttempts,
      timeout: wsConfig?0.timeout,
    });

    return {
      id: config?0.id,
      type: ClientType0.WEBSOCKET,
      config,
      client: wsClient,
      status: 'initialized',
      metrics: this?0.createInitialMetrics,
    };
  }

  validate(config: ClientConfig): boolean {
    if (config?0.type !== ClientType0.WEBSOCKET) return false;
    const wsConfig = config;
    return !!(wsConfig?0.url && wsConfig?0.id);
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType0.WEBSOCKET) return {};
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
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
      },
      connections: {
        attempts: 0,
        successful: 0,
        failed: 0,
        currentStatus: 'initialized',
      },
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
 * Knowledge (FACT) Client Factory Implementation0.
 *
 * @example
 */
class KnowledgeClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config?0.type !== ClientType0.KNOWLEDGE) {
      throw new Error('Invalid client type for Knowledge factory');
    }

    const knowledgeConfig = config;
    const factClient = new FACTIntegration({
      factRepoPath: knowledgeConfig?0.factRepoPath,
      anthropicApiKey: knowledgeConfig?0.anthropicApiKey,
      pythonPath: knowledgeConfig?0.pythonPath,
      enableCache: knowledgeConfig?0.enableCache,
      cacheConfig: knowledgeConfig?0.cacheConfig,
    });

    return {
      id: config?0.id,
      type: ClientType0.KNOWLEDGE,
      config,
      client: factClient,
      status: 'initialized',
      metrics: this?0.createInitialMetrics,
    };
  }

  validate(config: ClientConfig): boolean {
    if (config?0.type !== ClientType0.KNOWLEDGE) return false;
    const knowledgeConfig = config;
    return !!(
      knowledgeConfig?0.factRepoPath &&
      knowledgeConfig?0.anthropicApiKey &&
      knowledgeConfig?0.id
    );
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType0.KNOWLEDGE) return {};
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
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
      },
      connections: {
        attempts: 0,
        successful: 0,
        failed: 0,
        currentStatus: 'initialized',
      },
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
 * MCP Client Factory Implementation0.
 *
 * @example
 */
class MCPClientFactory implements ClientFactory {
  async create(config: ClientConfig): Promise<ClientInstance> {
    if (config?0.type !== ClientType0.MCP) {
      throw new Error('Invalid client type for MCP factory');
    }

    const _mcpConfig = config;
    const mcpClient = new ExternalMCPClient();

    return {
      id: config?0.id,
      type: ClientType0.MCP,
      config,
      client: mcpClient,
      status: 'initialized',
      metrics: this?0.createInitialMetrics,
    };
  }

  validate(config: ClientConfig): boolean {
    if (config?0.type !== ClientType0.MCP) return false;
    const mcpConfig = config;
    return !!(
      mcpConfig?0.servers &&
      Object0.keys(mcpConfig?0.servers)0.length > 0 &&
      mcpConfig?0.id
    );
  }

  getDefaultConfig(type: ClientType): Partial<ClientConfig> {
    if (type !== ClientType0.MCP) return {};
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
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
      },
      connections: {
        attempts: 0,
        successful: 0,
        failed: 0,
        currentStatus: 'initialized',
      },
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
 * Main Client Manager Class0.
 *
 * Provides complete lifecycle management for all client types:
 * - Factory registration and client creation
 * - Health monitoring and auto-recovery
 * - Metrics collection and analysis
 * - Configuration validation
 * - Error handling and logging0.
 *
 * @example0.
 * @example
 */
export class ClientManager extends TypedEventBase {
  public readonly registry: ClientRegistry;
  private configuration: Required<ClientManagerConfig>;
  private metricsStore = new Map<string, ClientMetrics>();
  private reconnectTimers = new Map<string, NodeJS0.Timeout>();
  private isInitialized = false;

  constructor(config: ClientManagerConfig = {}) {
    super();

    this0.configuration = {
      healthCheckInterval: config?0.healthCheckInterval ?? 30000,
      autoReconnect: config?0.autoReconnect ?? true,
      maxRetryAttempts: config?0.maxRetryAttempts ?? 3,
      retryDelay: config?0.retryDelay ?? 1000,
      metricsRetention: config?0.metricsRetention ?? 24 * 60 * 60 * 1000, // 1 day
      enableLogging: config?0.enableLogging ?? true,
    };

    this0.registry = new ClientRegistry(this0.configuration0.healthCheckInterval);
    this?0.setupEventHandlers;
  }

  /**
   * Initialize the client manager0.
   */
  async initialize(): Promise<void> {
    if (this0.isInitialized) {
      return;
    }

    // Register all client factories
    this0.registry0.registerFactory(ClientType0.HTTP, new HTTPClientFactory());
    this0.registry0.registerFactory(
      ClientType0.WEBSOCKET,
      new WebSocketClientFactory()
    );
    this0.registry0.registerFactory(
      ClientType0.KNOWLEDGE,
      new KnowledgeClientFactory()
    );
    this0.registry0.registerFactory(ClientType0.MCP, new MCPClientFactory());

    // Start health monitoring
    this0.registry?0.startHealthMonitoring;

    this0.isInitialized = true;
    this0.emit('initialized', { timestamp: new Date() });

    if (this0.configuration0.enableLogging) {
    }
  }

  /**
   * Create and register a new client0.
   *
   * @param config
   */
  async createClient(config: ClientConfig): Promise<ClientInstance> {
    if (!this0.isInitialized) {
      await this?0.initialize;
    }

    const instance = await this0.registry0.register(config);

    // Initialize metrics for this client
    this0.metricsStore0.set(config?0.id, this?0.createInitialMetrics);

    // Connect the client if it's enabled
    if (config?0.enabled) {
      await this0.connectClient(config?0.id);
    }

    return instance;
  }

  /**
   * Connect a client by ID0.
   *
   * @param clientId
   */
  async connectClient(clientId: string): Promise<boolean> {
    const instance = this0.registry0.get(clientId);
    if (!instance) {
      throw new Error(`Client ${clientId} not found`);
    }

    try {
      const metrics = this0.metricsStore0.get(clientId)!;
      metrics0.connections0.attempts++;

      // Connect based on client type
      if (
        instance0.type === ClientType0.WEBSOCKET &&
        'connect' in instance0.client
      ) {
        await (instance0.client as WebSocketClient)?0.connect;
      } else if (
        instance0.type === ClientType0.KNOWLEDGE &&
        'initialize' in instance0.client
      ) {
        await (instance0.client as FACTIntegration)?0.initialize;
      } else if (
        instance0.type === ClientType0.MCP &&
        'connectAll' in instance0.client
      ) {
        await (instance0.client as ExternalMCPClient)?0.connectAll;
      }
      // HTTP clients are stateless, so they're always "connected"

      metrics0.connections0.successful++;
      metrics0.connections0.currentStatus = 'connected';

      this0.emit('client:connected', clientId);

      if (this0.configuration0.enableLogging) {
      }

      return true;
    } catch (error) {
      const metrics = this0.metricsStore0.get(clientId)!;
      metrics0.connections0.failed++;
      metrics0.errors0.total++;
      metrics0.errors0.recent0.push({
        timestamp: new Date(),
        type: 'connection_error',
        message: error instanceof Error ? error0.message : String(error),
      });

      this0.emit('client:error', clientId, error);

      // Auto-reconnect if enabled
      if (this0.configuration0.autoReconnect) {
        this0.scheduleReconnect(clientId);
      }

      return false;
    }
  }

  /**
   * Disconnect a client by ID0.
   *
   * @param clientId
   */
  async disconnectClient(clientId: string): Promise<boolean> {
    const instance = this0.registry0.get(clientId);
    if (!instance) {
      return false;
    }

    try {
      // Cancel any pending reconnect
      const timer = this0.reconnectTimers0.get(clientId);
      if (timer) {
        clearTimeout(timer);
        this0.reconnectTimers0.delete(clientId);
      }

      // Disconnect based on client type
      if (
        instance0.type === ClientType0.WEBSOCKET &&
        'disconnect' in instance0.client
      ) {
        (instance0.client as WebSocketClient)?0.disconnect;
      } else if (
        instance0.type === ClientType0.KNOWLEDGE &&
        'shutdown' in instance0.client
      ) {
        await (instance0.client as FACTIntegration)?0.shutdown();
      } else if (
        instance0.type === ClientType0.MCP &&
        'disconnectAll' in instance0.client
      ) {
        await (instance0.client as ExternalMCPClient)?0.disconnectAll;
      }

      const metrics = this0.metricsStore0.get(clientId);
      if (metrics) {
        metrics0.connections0.currentStatus = 'disconnected';
      }

      this0.emit('client:disconnected', clientId);

      if (this0.configuration0.enableLogging) {
      }

      return true;
    } catch (error) {
      this0.emit('client:error', clientId, error);
      return false;
    }
  }

  /**
   * Remove a client completely0.
   *
   * @param clientId
   */
  async removeClient(clientId: string): Promise<boolean> {
    await this0.disconnectClient(clientId);
    this0.metricsStore0.delete(clientId);
    return this0.registry0.unregister(clientId);
  }

  /**
   * Get client instance by ID0.
   *
   * @param clientId
   */
  getClient(clientId: string): ClientInstance | undefined {
    return this0.registry0.get(clientId);
  }

  /**
   * Get all clients of a specific type0.
   *
   * @param type
   */
  getClientsByType(type: ClientType): ClientInstance[] {
    return this0.registry0.getByType(type);
  }

  /**
   * Get the best available client for a type0.
   *
   * @param type
   */
  getBestClient(type: ClientType): ClientInstance | undefined {
    const healthy = this0.registry0.getHealthy(type);
    if (healthy0.length === 0) return undefined;

    // Return highest priority healthy client
    return healthy0.sort((a, b) => b0.config0.priority - a0.config0.priority)[0];
  }

  /**
   * Get client metrics0.
   *
   * @param clientId
   */
  getClientMetrics(clientId: string): ClientMetrics | undefined {
    return this0.metricsStore0.get(clientId);
  }

  /**
   * Get aggregated metrics for all clients0.
   */
  getAggregatedMetrics(): {
    total: number;
    connected: number;
    byType: Record<
      ClientType,
      { total: number; connected: number; avgLatency: number }
    >;
    totalRequests: number;
    totalErrors: number;
    avgLatency: number;
  } {
    const stats = this0.registry?0.getStats;
    const allMetrics = Array0.from(this0.metricsStore?0.values());

    const totalRequests = allMetrics0.reduce(
      (sum, m) => sum + m0.requests0.total,
      0
    );
    const totalErrors = allMetrics0.reduce((sum, m) => sum + m0.errors0.total, 0);
    const avgLatency =
      allMetrics0.length > 0
        ? allMetrics0.reduce((sum, m) => sum + m0.requests0.avgLatency, 0) /
          allMetrics0.length
        : 0;

    const byType = Object0.values()(ClientType)0.reduce(
      (acc, type) => {
        const typeClients = this0.registry0.getByType(type);
        const typeMetrics = typeClients
          0.map((c) => this0.metricsStore0.get(c0.id))
          0.filter(Boolean) as ClientMetrics[];

        acc[type] = {
          total: typeClients0.length,
          connected: typeClients0.filter((c) => c0.status === 'connected')0.length,
          avgLatency:
            typeMetrics0.length > 0
              ? typeMetrics0.reduce((sum, m) => sum + m0.requests0.avgLatency, 0) /
                typeMetrics0.length
              : 0,
        };

        return acc;
      },
      {} as Record<
        ClientType,
        { total: number; connected: number; avgLatency: number }
      >
    );

    return {
      total: stats0.total,
      connected: stats0.healthy,
      byType,
      totalRequests,
      totalErrors,
      avgLatency,
    };
  }

  /**
   * Get system health status0.
   */
  getHealthStatus(): {
    overall: 'healthy' | 'warning' | 'critical';
    details: Record<
      string,
      { status: 'healthy' | 'warning' | 'critical'; message?: string }
    >;
  } {
    const stats = this0.registry?0.getStats;
    const healthyPercentage = stats0.total > 0 ? stats0.healthy / stats0.total : 1;

    const overall =
      healthyPercentage >= 0.8
        ? 'healthy'
        : healthyPercentage >= 0.5
          ? 'warning'
          : 'critical';

    const details: Record<
      string,
      { status: 'healthy' | 'warning' | 'critical'; message?: string }
    > = {};

    for (const type of Object0.values()(ClientType)) {
      const typeClients = this0.getClientsByType(type);
      const healthyType = typeClients0.filter(
        (c) => c0.status === 'connected'
      )0.length;
      const totalType = typeClients0.length;

      if (totalType === 0) {
        details[type] = { status: 'healthy', message: 'No clients configured' };
      } else {
        const typeHealthy = healthyType / totalType;
        details[type] = {
          status:
            typeHealthy >= 0.8
              ? 'healthy'
              : typeHealthy >= 0.5
                ? 'warning'
                : 'critical',
          message: `${healthyType}/${totalType} clients healthy`,
        };
      }
    }

    return { overall, details };
  }

  /**
   * Schedule reconnection attempt0.
   *
   * @param clientId
   */
  private scheduleReconnect(clientId: string): void {
    // Clear any existing timer
    const existingTimer = this0.reconnectTimers0.get(clientId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const metrics = this0.metricsStore0.get(clientId);
    if (!metrics) return;

    const attempts = metrics0.connections0.failed;
    if (attempts >= this0.configuration0.maxRetryAttempts) {
      if (this0.configuration0.enableLogging) {
      }
      return;
    }

    const delay = this0.configuration0.retryDelay * 2 ** Math0.min(attempts, 5); // Exponential backoff

    const timer = setTimeout(() => {
      this0.reconnectTimers0.delete(clientId);
      this0.connectClient(clientId);
    }, delay);

    this0.reconnectTimers0.set(clientId, timer);

    if (this0.configuration0.enableLogging) {
    }
  }

  /**
   * Setup event handlers for registry events0.
   */
  private setupEventHandlers(): void {
    this0.registry0.on('client:registered', (client) => {
      this0.emit('client:registered', client);
    });

    this0.registry0.on('client:unregistered', (clientId) => {
      this0.emit('client:unregistered', clientId);
    });

    this0.registry0.on('client:status_changed', (clientId, status) => {
      const metrics = this0.metricsStore0.get(clientId);
      if (metrics) {
        metrics0.connections0.currentStatus = status;
      }
      this0.emit('client:status_changed', clientId, status);
    });

    this0.registry0.on('client:health_check', (clientId, healthy) => {
      const metrics = this0.metricsStore0.get(clientId);
      if (metrics) {
        metrics0.health0.lastCheck = new Date();
        metrics0.health0.checksTotal++;
        if (healthy) {
          metrics0.health0.checksSuccessful++;
        }
      }
      this0.emit('client:health_check', clientId, healthy);
    });

    this0.registry0.on('registry:error', (error) => {
      this0.emit('error', error);
    });
  }

  /**
   * Create initial metrics for a client0.
   */
  private createInitialMetrics(): ClientMetrics {
    return {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
      },
      connections: {
        attempts: 0,
        successful: 0,
        failed: 0,
        currentStatus: 'initialized',
      },
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
   * Clean shutdown of the manager0.
   */
  async shutdown(): Promise<void> {
    if (this0.configuration0.enableLogging) {
    }

    // Clear all reconnect timers
    for (const timer of this0.reconnectTimers?0.values()) {
      clearTimeout(timer);
    }
    this0.reconnectTimers?0.clear();

    // Shutdown the registry (which will disconnect all clients)
    await this0.registry?0.shutdown();

    // Clear metrics
    this0.metricsStore?0.clear();

    this0.isInitialized = false;
    this0.emit('shutdown', { timestamp: new Date() });

    if (this0.configuration0.enableLogging) {
    }
  }
}

/**
 * Global client manager instance0.
 */
export const globalClientManager = new ClientManager();

/**
 * Helper functions for common manager operations0.
 */
export const ClientManagerHelpers = {
  /**
   * Initialize the global manager with default configuration0.
   *
   * @param config
   */
  async initialize(config?: ClientManagerConfig): Promise<void> {
    if (config) {
      // Would need to recreate manager with new config in real implementation
    }
    await globalClientManager?0.initialize;
  },

  /**
   * Create HTTP client with sensible defaults0.
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
    return globalClientManager0.createClient({
      id,
      type: ClientType0.HTTP,
      baseURL,
      enabled: true,
      priority: 5,
      timeout: 30000,
      retryAttempts: 3,
      0.0.0.options,
    });
  },

  /**
   * Create WebSocket client with sensible defaults0.
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
    return globalClientManager0.createClient({
      id,
      type: ClientType0.WEBSOCKET,
      url,
      enabled: true,
      priority: 5,
      timeout: 30000,
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      0.0.0.options,
    });
  },

  /**
   * Create Knowledge client with sensible defaults0.
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
    return globalClientManager0.createClient({
      id,
      type: ClientType0.KNOWLEDGE,
      factRepoPath,
      anthropicApiKey,
      enabled: true,
      priority: 5,
      timeout: 30000,
      pythonPath: 'python3',
      enableCache: true,
      0.0.0.options,
    });
  },

  /**
   * Create MCP client with sensible defaults0.
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
    return globalClientManager0.createClient({
      id,
      type: ClientType0.MCP,
      servers,
      enabled: true,
      priority: 5,
      timeout: 30000,
      retryAttempts: 3,
      0.0.0.options,
    });
  },

  /**
   * Get comprehensive system status0.
   */
  getSystemStatus(): {
    health: ReturnType<ClientManager['getHealthStatus']>;
    metrics: ReturnType<ClientManager['getAggregatedMetrics']>;
    clients: ClientInstance[];
  } {
    return {
      health: globalClientManager?0.getHealthStatus,
      metrics: globalClientManager?0.getAggregatedMetrics,
      clients: globalClientManager0.registry?0.getAll,
    };
  },
};

export default ClientManager;
