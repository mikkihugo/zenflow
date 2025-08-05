/**
 * UACL (Unified Adaptive Client Layer) - Main Exports
 * 
 * Central export point for all UACL functionality including:
 * - Client registry and manager
 * - Client type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization
 * 
 * @fileoverview Main UACL exports
 */

// Core UACL components
export { 
  ClientRegistry, 
  ClientType,
  globalClientRegistry,
  ClientRegistryHelpers,
  type ClientConfig,
  type ClientInstance,
  type ClientFactory,
  type HTTPClientConfig,
  type WebSocketClientConfig,
  type KnowledgeClientConfig,
  type MCPClientConfig,
  type BaseClientConfig
} from './registry';

export {
  ClientManager,
  globalClientManager,
  ClientManagerHelpers,
  type ClientManagerConfig,
  type ClientMetrics
} from './manager';

// Re-export client implementations for convenience
export { APIClient, createAPIClient } from '../api/http/client';

// WebSocket clients - both legacy and UACL
export { WebSocketClient } from '../api/websocket/client'; // Legacy WebSocket client
export * from './adapters/websocket-index'; // UACL WebSocket adapters

// Core interfaces for UACL compatibility
export type { 
  IClient, 
  IClientFactory, 
  ClientConfig as CoreClientConfig, 
  ClientStatus as CoreClientStatus, 
  ClientMetrics as CoreClientMetrics, 
  RequestOptions as CoreRequestOptions, 
  ClientResponse as CoreClientResponse 
} from './core/interfaces';

// Legacy FACT integration
export { FACTIntegration } from '../../knowledge/knowledge-client';

// UACL Knowledge Client Adapter
export { 
  KnowledgeClientAdapter, 
  KnowledgeClientFactory,
  createFACTClient,
  createCustomKnowledgeClient,
  KnowledgeHelpers,
  type KnowledgeClientConfig as UACLKnowledgeClientConfig,
  type KnowledgeRequest,
  type KnowledgeResponse
} from './adapters/knowledge-client-adapter';

export { ExternalMCPClient } from '../mcp/external-mcp-client';

/**
 * UACL Main Interface
 * 
 * Primary interface for interacting with the Unified Adaptive Client Layer.
 * Provides high-level methods for client management and operations.
 */
export class UACL {
  private static instance: UACL;
  private initialized = false;

  private constructor() {}

  /**
   * Get singleton UACL instance
   */
  static getInstance(): UACL {
    if (!UACL.instance) {
      UACL.instance = new UACL();
    }
    return UACL.instance;
  }

  /**
   * Initialize UACL system
   */
  async initialize(config?: ClientManagerConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    await ClientManagerHelpers.initialize(config);
    this.initialized = true;
  }

  /**
   * Check if UACL is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create and register HTTP client
   */
  async createHTTPClient(
    id: string,
    baseURL: string,
    options: Partial<HTTPClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createHTTPClient(id, baseURL, options);
  }

  /**
   * Create and register WebSocket client
   */
  async createWebSocketClient(
    id: string,
    url: string,
    options: Partial<WebSocketClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createWebSocketClient(id, url, options);
  }

  /**
   * Create and register Knowledge client
   */
  async createKnowledgeClient(
    id: string,
    factRepoPath: string,
    anthropicApiKey: string,
    options: Partial<KnowledgeClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createKnowledgeClient(id, factRepoPath, anthropicApiKey, options);
  }

  /**
   * Create and register MCP client
   */
  async createMCPClient(
    id: string,
    servers: MCPClientConfig['servers'],
    options: Partial<MCPClientConfig> = {}
  ): Promise<ClientInstance> {
    if (!this.initialized) {
      await this.initialize();
    }
    return ClientManagerHelpers.createMCPClient(id, servers, options);
  }

  /**
   * Get client by ID
   */
  getClient(clientId: string): ClientInstance | undefined {
    return globalClientManager.getClient(clientId);
  }

  /**
   * Get best available client for a type
   */
  getBestClient(type: ClientType): ClientInstance | undefined {
    return globalClientManager.getBestClient(type);
  }

  /**
   * Get all clients of a specific type
   */
  getClientsByType(type: ClientType): ClientInstance[] {
    return globalClientManager.getClientsByType(type);
  }

  /**
   * Get system health status
   */
  getHealthStatus(): ReturnType<ClientManager['getHealthStatus']> {
    return globalClientManager.getHealthStatus();
  }

  /**
   * Get aggregated metrics
   */
  getMetrics(): ReturnType<ClientManager['getAggregatedMetrics']> {
    return globalClientManager.getAggregatedMetrics();
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus(): ReturnType<typeof ClientManagerHelpers.getSystemStatus> {
    return ClientManagerHelpers.getSystemStatus();
  }

  /**
   * Connect all clients
   */
  async connectAll(): Promise<void> {
    const allClients = globalClientManager.registry.getAll();
    const connectionPromises = allClients
      .filter(client => client.config.enabled)
      .map(client => globalClientManager.connectClient(client.id));
    
    await Promise.allSettled(connectionPromises);
  }

  /**
   * Disconnect all clients
   */
  async disconnectAll(): Promise<void> {
    const allClients = globalClientManager.registry.getAll();
    const disconnectionPromises = allClients.map(client => 
      globalClientManager.disconnectClient(client.id)
    );
    
    await Promise.allSettled(disconnectionPromises);
  }

  /**
   * Shutdown UACL system
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await globalClientManager.shutdown();
    this.initialized = false;
  }
}

/**
 * Global UACL instance for convenience
 */
export const uacl = UACL.getInstance();

/**
 * Initialize UACL with default configuration
 */
export const initializeUACL = async (config?: ClientManagerConfig): Promise<void> => {
  await uacl.initialize(config);
};

/**
 * Quick access functions for common operations
 */
export const UACLHelpers = {
  /**
   * Initialize and create common clients for a typical setup
   */
  async setupCommonClients(config: {
    httpBaseURL?: string;
    websocketURL?: string;
    factRepoPath?: string;
    anthropicApiKey?: string;
    mcpServers?: MCPClientConfig['servers'];
  }): Promise<{
    http?: ClientInstance;
    websocket?: ClientInstance;
    knowledge?: ClientInstance;
    mcp?: ClientInstance;
  }> {
    await uacl.initialize();

    const clients: {
      http?: ClientInstance;
      websocket?: ClientInstance;
      knowledge?: ClientInstance;
      mcp?: ClientInstance;
    } = {};

    try {
      if (config.httpBaseURL) {
        clients.http = await uacl.createHTTPClient('default-http', config.httpBaseURL);
      }

      if (config.websocketURL) {
        clients.websocket = await uacl.createWebSocketClient('default-websocket', config.websocketURL);
      }

      if (config.factRepoPath && config.anthropicApiKey) {
        clients.knowledge = await uacl.createKnowledgeClient(
          'default-knowledge',
          config.factRepoPath,
          config.anthropicApiKey
        );
      }

      if (config.mcpServers) {
        clients.mcp = await uacl.createMCPClient('default-mcp', config.mcpServers);
      }

      // Connect all created clients
      await uacl.connectAll();

      return clients;
    } catch (error) {
      console.error('❌ Failed to setup common clients:', error);
      throw error;
    }
  },

  /**
   * Get a quick status overview
   */
  getQuickStatus(): {
    initialized: boolean;
    totalClients: number;
    healthyClients: number;
    healthPercentage: number;
    status: 'healthy' | 'warning' | 'critical';
  } {
    if (!uacl.isInitialized()) {
      return {
        initialized: false,
        totalClients: 0,
        healthyClients: 0,
        healthPercentage: 0,
        status: 'critical'
      };
    }

    const metrics = uacl.getMetrics();
    const healthPercentage = metrics.total > 0 ? (metrics.connected / metrics.total) * 100 : 100;
    
    const status = healthPercentage >= 80 ? 'healthy' 
      : healthPercentage >= 50 ? 'warning' 
      : 'critical';

    return {
      initialized: true,
      totalClients: metrics.total,
      healthyClients: metrics.connected,
      healthPercentage,
      status
    };
  },

  /**
   * Perform health check on all clients
   */
  async performHealthCheck(): Promise<Record<string, boolean>> {
    const allClients = uacl.getClientsByType(ClientType.HTTP)
      .concat(uacl.getClientsByType(ClientType.WEBSOCKET))
      .concat(uacl.getClientsByType(ClientType.KNOWLEDGE))
      .concat(uacl.getClientsByType(ClientType.MCP));

    const healthChecks = allClients.map(async (client) => {
      try {
        // This would need actual health check implementation per client type
        const isHealthy = client.status === 'connected';
        return { [client.id]: isHealthy };
      } catch {
        return { [client.id]: false };
      }
    });

    const results = await Promise.allSettled(healthChecks);
    
    return results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        Object.assign(acc, result.value);
      }
      return acc;
    }, {} as Record<string, boolean>);
  }
};

// UACL validation and compatibility
export { UACLValidator, validateUACL, printValidationReport, type ValidationResult, type ValidationReport } from './validation';
export * from './compatibility';

/**
 * Default export for convenience
 */
export default uacl;