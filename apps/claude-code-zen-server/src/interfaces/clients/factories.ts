/**
 * Unified API Client Layer (UACL) - Factory Implementation.
 *
 * Central factory for creating client instances based on client type,
 * protocol requirements, and configuration. Supports dependency injection and
 * provides a single point of access for all client implementations.
 */
/**
 * @file Interface implementation: factories.
 */

import type { Config, Logger } from '@claude-zen/foundation';

import type {
  ClientConfig,
  ClientHealthStatus,
  ClientOperation,
  ClientTransaction,
  Client,
  ClientFactory,
  HttpClient,
  KnowledgeClient,
  McpClient,
  WebSocketClient,
} from "./interfaces";
import('./types';
import {
  ClientConfigs,
  ClientErrorCodes,
  ClientTypes,
  ProtocolToClientTypeMap,
  ProtocolTypes,
  TypeGuards,
} from "./types";

/**
 * Configuration for client creation.
 *
 * @example
 */
export interface ClientFactoryConfig {
  /** Client type to create */
  clientType: ClientType;

  /** Protocol type */
  protocol: ProtocolType;

  /** Connection URL */
  url: string;

  /** Client name/identifier */
  name?: string;

  /** Client-specific configuration */
  config?: Partial<ClientConfig> | undefined;

  /** Use existing client instance if available */
  reuseExisting?: boolean;

  /** Custom client implementation */
  customImplementation?: new (args: any[]) => Client;
}

/**
 * Client type mapping for better type safety.
 */
export type ClientTypeMap<T> =
  | Client<T>
  | HttpClient<T>
  | WebSocketClient<T>
  | KnowledgeClient<T>
  | McpClient<T>;

/**
 * Client registry for managing client instances.
 *
 * @example
 */
export interface ClientRegistry {
  [clientId: string]: {
    client: Client;
    config: ClientConfig;
    created: Date;
    lastUsed: Date;
    status: ClientStatus;
    metadata: Record<string, unknown>;
  };
}

/**
 * Main factory class for creating UACL client instances.
 *
 * @example
 */
export class UACLFactory {
  private clientCache = new Map<string, Client>();
  private factoryCache = new Map<ClientType, ClientFactory>();
  private clientRegistry: ClientRegistry = {};
  private transactionLog = new Map<string, ClientTransaction>();

  constructor(
    private _logger: Logger,
    private _config: Config
  ) {
    this.initializeFactories;
  }

  /**
   * Create a client instance.
   *
   * @param factoryConfig
   */
  async createClient<T = any>(
    factoryConfig: ClientFactoryConfig
  ): Promise<ClientTypeMap<T>> {
    const {
      clientType,
      protocol,
      url,
      name,
      config,
      reuseExisting = true,
    } = factoryConfig;

    const cacheKey = this.generateCacheKey(clientType, protocol, url, name);

    if (reuseExisting && this.clientCache.has(cacheKey)) {
      this._logger.debug(`Returning cached client: ${cacheKey}`);
      const cachedClient = this.clientCache.get(cacheKey)!;
      this.updateClientUsage(cacheKey);
      return cachedClient as ClientTypeMap<T>;
    }

    this._logger.info(
      `Creating new client: ${clientType}/${protocol} (${url})`
    );

    try {
      // Validate configuration
      this.validateClientConfig(clientType, protocol, config);

      // Get or create client factory
      const factory = await this.getOrCreateFactory(clientType);

      // Merge with default configuration
      const mergedConfig = this.mergeWithDefaults(
        clientType,
        protocol,
        url,
        config
      );

      // Create client instance
      const client = await factory.create(protocol as any, mergedConfig);

      // Register and cache the client
      const clientId = this.registerClient(client, mergedConfig, cacheKey);
      this.clientCache.set(cacheKey, client);

      this._logger.info(`Successfully created client: ${clientId}`);
      return client as ClientTypeMap<T>;
    } catch (error) {
      this._logger.error(`Failed to create client: ${error}`);
      throw new Error(
        `Client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create HTTP client with convenience methods.
   *
   * @param url
   * @param config
   */
  async createHttpClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<HttpClient<T>> {
    const protocol = url.startsWith('https')
      ? ProtocolTypes.HTTPS
      : ProtocolTypes.HTTP;

    return (await this.createClient<T>({
      clientType: ClientTypes.HTTP,
      protocol,
      url,
      config: config || undefined,
    })) as HttpClient<T>;
  }

  /**
   * Create WebSocket client with real-time capabilities.
   *
   * @param url
   * @param config
   */
  async createWebSocketClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<WebSocketClient<T>> {
    const protocol = url.startsWith('wss')
      ? ProtocolTypes.WSS
      : ProtocolTypes.WS;

    return (await this.createClient<T>({
      clientType: ClientTypes.WEBSOCKET,
      protocol,
      url,
      config: config || undefined,
    })) as WebSocketClient<T>;
  }

  /**
   * Create Knowledge client for FACT integration.
   *
   * @param url
   * @param config
   */
  async createKnowledgeClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<KnowledgeClient<T>> {
    return (await this.createClient<T>({
      clientType: ClientTypes.KNOWLEDGE,
      protocol: url.startsWith('https')
        ? ProtocolTypes.HTTPS
        : ProtocolTypes.HTTP,
      url,
      config: config || undefined,
    })) as KnowledgeClient<T>;
  }

  /**
   * Create MCP client for Model Context Protocol (Context7, etc).
   *
   * @param url
   * @param config
   */
  async createMcpClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<McpClient<T>> {
    // Determine protocol based on URL format
    let protocol: ProtocolType;
    if (url.startsWith('stdio://')) {
      protocol = ProtocolTypes.STDIO;
    } else if (url.startsWith('ws')) {
      protocol = url.startsWith('wss') ? ProtocolTypes.WSS : ProtocolTypes.WS;
    } else {
      protocol = url.startsWith('https')
        ? ProtocolTypes.HTTPS
        : ProtocolTypes.HTTP;
    }

    return (await this.createClient<T>({
      clientType: ClientTypes.MCP,
      protocol,
      url,
      config: config || undefined,
    })) as McpClient<T>;
  }

  /**
   * Create generic client for custom protocols.
   *
   * @param protocol
   * @param url
   * @param config
   */
  async createGenericClient<T = any>(
    protocol: ProtocolType,
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<Client<T>> {
    return await this.createClient<T>({
      clientType: ClientTypes.GENERIC,
      protocol,
      url,
      config: config || undefined,
    });
  }

  /**
   * Get client by ID from registry.
   *
   * @param clientId
   */
  getClient(clientId: string): Client | null {
    return this.clientRegistry[clientId]?.client || null;
  }

  /**
   * List all registered clients.
   */
  listClients(): ClientRegistry {
    return { ...this.clientRegistry };
  }

  /**
   * Health check for all clients.
   */
  async healthCheckAll(): Promise<ClientHealthStatus[]> {
    const results: ClientHealthStatus[] = [];

    for (const [_clientId, entry] of Object.entries(this.clientRegistry)) {
      try {
        const startTime = Date.now();
        const healthy = await entry.client?.health()
        const responseTime = Date.now() - startTime;

        results.push({
          healthy,
          protocol: entry.config.protocol,
          url: entry.config.url,
          responseTime,
          lastCheck: new Date(),
        });

        // Update client status
        entry.status = healthy ? 'connected : error';
      } catch (error) {
        results.push({
          healthy: false,
          protocol: entry.config.protocol,
          url: entry.config.url,
          responseTime: -1,
          lastCheck: new Date(),
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });

        entry.status = 'error';
      }
    }

    return results;
  }

  /**
   * Execute transaction across multiple clients.
   *
   * @param operations
   */
  async executeTransaction(
    operations: ClientOperation[]
  ): Promise<ClientTransaction> {
    const transactionId = this.generateTransactionId;
    const transaction: ClientTransaction = {
      id: transactionId,
      operations,
      status: 'executing',
      startTime: new Date(),
    };

    this.transactionLog.set(transactionId, transaction);

    try {
      // Execute operations in parallel
      const results = await Promise.allSettled(
        operations.map(async (op) => {
          const client = this.getClient(op.client);
          if (!client) {
            throw new Error(`Client not found: ${op.client}`);
          }

          return await client.send(op.data);
        })
      );

      // Update operation results
      operations.forEach((op, index) => {
        const result = results[index];
        if (result?.status === 'fulfilled') {
          op.result = result?.value()
        } else {
          op.error = {
            name: 'ClientError',
            message: result?.reason?.message || 'Unknown error',
            code: ClientErrorCodes.UNKNOWN_ERROR,
            protocol: 'unknown' as any,
          };
        }
      });

      transaction.status = 'completed';
      transaction.endTime = new Date();
    } catch (error) {
      transaction.status = 'failed';
      transaction.endTime = new Date();
      transaction.error = {
        name: 'TransactionError',
        message: error instanceof Error ? error.message : 'Transaction failed',
        code: ClientErrorCodes.UNKNOWN_ERROR,
        protocol: 'unknown' as any,
      };

      this._logger.error(`Transaction failed: ${transactionId}`, error);
    }

    return transaction;
  }

  /**
   * Disconnect and clean up all clients.
   */
  async disconnectAll(): Promise<void> {
    this._logger.info('Disconnecting all clients');

    const disconnectPromises = Object.values()(this.clientRegistry).map(
      async (entry) => {
        try {
          await entry.client?.disconnect()
          entry.status = 'disconnected';
        } catch (error) {
          this._logger.warn(`Failed to disconnect client: ${error}`);
        }
      }
    );

    await Promise.allSettled(disconnectPromises);

    // Clear caches
    this.clientCache?.clear();
    this.clientRegistry = {};
    this.factoryCache?.clear();
  }

  /**
   * Get factory statistics.
   */
  getStats(): {
    totalClients: number;
    clientsByType: Record<ClientType, number>;
    clientsByStatus: Record<ClientStatus, number>;
    cacheSize: number;
    transactions: number;
  } {
    const clientsByType: Record<ClientType, number> = {} as any;
    const clientsByStatus: Record<ClientStatus, number> = {} as any;

    // Initialize counters
    Object.values()(ClientTypes).forEach((type) => {
      clientsByType[type] = 0;
    });

    [
      'disconnected',
      'connecting',
      'connected',
      'reconnecting',
      'error',
      'suspended',
    ].forEach((status) => {
      clientsByStatus[status as ClientStatus] = 0;
    });

    // Count clients
    Object.values()(this.clientRegistry).forEach((entry) => {
      const clientType = this.getClientTypeFromConfig(entry.config);
      if (clientType) {
        clientsByType[clientType]++;
      }
      clientsByStatus[entry.status]++;
    });

    return {
      totalClients: Object.keys(this.clientRegistry).length,
      clientsByType,
      clientsByStatus,
      cacheSize: this.clientCache.size,
      transactions: this.transactionLog.size,
    };
  }

  /**
   * Private methods for internal operations.
   */

  private async initializeFactories(): Promise<void> {
    // Initialize default factories for each client type
    // These would be imported from specific implementation files

    // Note: In a real implementation, these would import actual factory classes
    this._logger.debug('Initializing client factories');

    // Placeholder for factory initialization
    // Real implementation would load specific factory classes
  }

  private async getOrCreateFactory(
    clientType: ClientType
  ): Promise<ClientFactory> {
    if (this.factoryCache.has(clientType)) {
      return this.factoryCache.get(clientType)!;
    }

    // Dynamic import based on client type
    let FactoryClass: new (args: any[]) => ClientFactory;

    switch (clientType) {
      case ClientTypes.HTTP: {
        const { HTTPClientFactory } = await import(
          "./factories/http-client-factory'
        );
        FactoryClass = HTTPClientFactory as unknown as new (
          args: any[]
        ) => ClientFactory;
        break;
      }

      case ClientTypes.WEBSOCKET: {
        const { WebSocketClientFactory } = await import(
          "./adapters/websocket-client-factory'
        );
        FactoryClass = WebSocketClientFactory as unknown as new (
          args: any[]
        ) => ClientFactory;
        break;
      }

      case ClientTypes.KNOWLEDGE: {
        const { KnowledgeClientFactory } = await import(
          "./implementations/knowledge-client-factory'
        );
        FactoryClass = KnowledgeClientFactory as unknown as new (
          args: any[]
        ) => ClientFactory;
        break;
      }

      case ClientTypes.MCPCLIENT: {
        const { McpClientFactory } = await import(
          "./adapters/mcp-client-adapter'
        );
        FactoryClass = McpClientFactory as unknown as new (
          args: any[]
        ) => ClientFactory;
        break;
      }
      case ClientTypes.GENERIC:
      default: {
        // Use generic HTTP-based client factory as fallback
        const { HTTPClientFactory } = await import(
          "./factories/http-client-factory'
        );
        FactoryClass = HTTPClientFactory as unknown as new (
          args: any[]
        ) => ClientFactory;
        break;
      }
    }

    const factory = new FactoryClass(this._logger, this._config);
    this.factoryCache.set(clientType, factory);

    return factory;
  }

  private validateClientConfig(
    clientType: ClientType,
    protocol: ProtocolType,
    _config?: Partial<ClientConfig>
  ): void {
    if (!TypeGuards.isClientType(clientType)) {
      throw new Error(`Invalid client type: ${clientType}`);
    }

    if (!TypeGuards.isProtocolType(protocol)) {
      throw new Error(`Invalid protocol type: ${protocol}`);
    }

    // Additional validation logic would go here
  }

  private mergeWithDefaults(
    clientType: ClientType,
    protocol: ProtocolType,
    url: string,
    config?: Partial<ClientConfig>
  ): ClientConfig {
    const defaults =
      ClientConfigs?.[clientType] || ClientConfigs?.[ClientTypes.GENERIC];

    return {
      ...defaults,
      ...config,
      // Ensure required fields are not overwritten
      protocol,
      url,
    } as ClientConfig;
  }

  private registerClient(
    client: Client,
    config: ClientConfig,
    cacheKey: string
  ): string {
    const clientId = this.generateClientId(config);

    this.clientRegistry[clientId] = {
      client,
      config,
      created: new Date(),
      lastUsed: new Date(),
      status: 'connected',
      metadata: {
        cacheKey,
        version: '1..0',
      },
    };

    return clientId;
  }

  private updateClientUsage(cacheKey: string): void {
    // Find client by cache key and update last used time
    for (const entry of Object.values()(this.clientRegistry)) {
      if (entry.metadata['cacheKey'] === cacheKey) {
        entry.lastUsed = new Date();
        break;
      }
    }
  }

  private generateCacheKey(
    clientType: ClientType,
    protocol: ProtocolType,
    url: string,
    name?: string
  ): string {
    const parts = [clientType, protocol, url];
    if (name) parts.push(name);
    return parts.join(':');
  }

  private generateClientId(config: ClientConfig): string {
    return `${config?.protocol}:${config?.url}:${Date.now()}`;
  }

  private generateTransactionId(): string {
    return `tx:${Date.now()}:${Math.random().toString(36).substring(2, 11)}`;
  }

  private getClientTypeFromConfig(config: ClientConfig): ClientType | null {
    return ProtocolToClientTypeMap[config?.protocol] || null;
  }
}

/**
 * Multi-client coordinator for handling operations across different client types.
 *
 * @example
 */
export class MultiClientCoordinator {
  constructor(
    private factory: UACLFactory,
    private logger: Logger
  ) {}

  /**
   * Execute operation on multiple clients with different protocols.
   *
   * @param clients
   * @param operation
   */
  async executeMultiProtocol<T = any>(
    clients: Array<{
      type: ClientType;
      protocol: ProtocolType;
      url: string;
      config?: Partial<ClientConfig>;
    }>,
    operation: (client: Client) => Promise<T>
  ): Promise<T[]> {
    this.logger.info(
      `Executing multi-protocol operation on ${clients.length} clients`
    );

    // Create all clients
    const clientInstances = await Promise.all(
      clients.map((clientConfig) =>
        this.factory.createClient({
          clientType: clientConfig?.type,
          protocol: clientConfig?.protocol,
          url: clientConfig?.url,
          config: clientConfig?.config || undefined,
        })
      )
    );

    // Execute operation on all clients
    const results = await Promise.allSettled(
      clientInstances.map((client) => operation(client))
    );

    // Process results
    const successfulResults: T[] = [];
    const errors: Error[] = [];

    results.forEach((result, index) => {
      if (result?.status === 'fulfilled') {
        successfulResults.push(result?.value);
      } else {
        errors.push(new Error(`Client ${index} failed: ${result?.reason}`));
      }
    });

    if (errors.length > 0) {
      this.logger.warn(
        `${errors.length} clients failed during multi-protocol operation`
      );
    }

    return successfulResults;
  }

  /**
   * Create load-balanced client setup.
   *
   * @param clientConfigs
   * @param strategy
   */
  async createLoadBalanced<T = any>(
    clientConfigs: Array<{
      type: ClientType;
      protocol: ProtocolType;
      url: string;
      weight?: number;
      config?: Partial<ClientConfig>;
    }>,
    strategy: 'round-robin | weighted' | 'random = round-robin'
  ): Promise<LoadBalancedClient<T>> {
    const clients = await Promise.all(
      clientConfigs?.map(async (config) => ({
        client: await this.factory.createClient<T>({
          clientType: config?.type,
          protocol: config?.protocol,
          url: config?.url,
          config: config?.config || undefined,
        }),
        weight: config?.weight || 1,
        url: config?.url,
      }))
    );

    return new LoadBalancedClient<T>(clients, strategy);
  }
}

/**
 * Load-balanced client wrapper.
 *
 * @example
 */
export class LoadBalancedClient<T = any> implements Client<T> {
  private currentIndex = 0;
  private requestCount = 0;

  constructor(
    private clients: Array<{
      client: Client<T>;
      weight: number;
      url: string;
    }>,
    private strategy: 'round-robin | weighted' | 'random'
  ) {}

  async connect(): Promise<void> {
    await Promise.all(this.clients.map((c) => c.client?.connect));
  }

  async disconnect(): Promise<void> {
    await Promise.all(this.clients.map((c) => c.client?.disconnect));
  }

  async send<R = any>(data: T): Promise<R> {
    const client = this.selectClient;
    this.requestCount++;
    return await client.send<R>(data);
  }

  async health(): Promise<boolean> {
    const healthChecks = await Promise.allSettled(
      this.clients.map((c) => c.client?.health)
    );

    return healthChecks.some(
      (check) => check.status === 'fulfilled' && check.value
    );
  }

  getConfig(): ClientConfig {
    return this.clients[0]?.client?.getConfig || ({} as ClientConfig);
  }

  isConnected(): boolean {
    return this.clients.some((c) => c.client?.isConnected);
  }

  async getMetadata(): Promise<unknown> {
    const client = this.selectClient;
    return await client?.getMetadata()
  }

  private selectClient(): Client<T> {
    switch (this.strategy) {
      case 'round-robin': {
        const client = this.clients[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.clients.length;
        return client?.client || this.clients[0]!.client;
      }

      case 'random': {
        const randomIndex = Math.floor(Math.random() * this.clients.length);
        return this.clients[randomIndex]?.client || this.clients[0]!.client;
      }

      case 'weighted': {
        // Weighted random selection
        const totalWeight = this.clients.reduce((sum, c) => sum + c.weight, 0);
        let random = Math.random() * totalWeight;

        for (const clientEntry of this.clients) {
          random -= clientEntry.weight;
          if (random <= 0) {
            return clientEntry.client;
          }
        }

        return this.clients[0]!.client; // Fallback
      }

      default:
        return this.clients[0]!.client;
    }
  }
}

// Convenience factory functions (following DAL pattern)

/**
 * Create a simple client for quick setup.
 *
 * @param clientType
 * @param protocol
 * @param url
 * @param config
 * @example
 */
export async function createClient<T = any>(
  clientType: ClientType,
  protocol: ProtocolType,
  url: string,
  config?: Partial<ClientConfig>
): Promise<Client<T>> {
  // Create basic logger and config
  const logger: Logger = {
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  const appConfig: Config = {} as Config;

  const factory = new UACLFactory(logger, appConfig);

  return await factory.createClient<T>({
    clientType,
    protocol,
    url,
    config,
  });
}

/**
 * Create HTTP client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export async function createHttpClient<T = any>(
  url: string,
  config?: Partial<ClientConfig>
): Promise<HttpClient<T>> {
  const protocol = url.startsWith('https')
    ? ProtocolTypes.HTTPS
    : ProtocolTypes.HTTP;
  return (await createClient<T>(
    ClientTypes.HTTP,
    protocol,
    url,
    config
  )) as HttpClient<T>;
}

/**
 * Create WebSocket client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export async function createWebSocketClient<T = any>(
  url: string,
  config?: Partial<ClientConfig>
): Promise<WebSocketClient<T>> {
  const protocol = url.startsWith('wss') ? ProtocolTypes.WSS : ProtocolTypes.WS;
  return (await createClient<T>(
    ClientTypes.WEBSOCKET,
    protocol,
    url,
    config
  )) as WebSocketClient<T>;
}

/**
 * Create MCP client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export async function createMcpClient<T = any>(
  url: string,
  config?: Partial<ClientConfig>
): Promise<McpClient<T>> {
  let protocol: ProtocolType;
  if (url.startsWith('stdio://')) {
    protocol = ProtocolTypes.STDIO;
  } else if (url.startsWith('ws')) {
    protocol = url.startsWith('wss') ? ProtocolTypes.WSS : ProtocolTypes.WS;
  } else {
    protocol = url.startsWith('https')
      ? ProtocolTypes.HTTPS
      : ProtocolTypes.HTTP;
  }

  return (await createClient<T>(
    ClientTypes.MCPCLIENT,
    protocol,
    url,
    config
  )) as McpClient<T>;
}

export default UACLFactory;
