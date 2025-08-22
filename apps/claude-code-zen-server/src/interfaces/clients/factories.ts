/**
 * Unified API Client Layer (UACL) - Factory Implementation0.
 *
 * Central factory for creating client instances based on client type,
 * protocol requirements, and configuration0. Supports dependency injection and
 * provides a single point of access for all client implementations0.
 */
/**
 * @file Interface implementation: factories0.
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
} from '0./interfaces';
import type { ClientStatus, ClientType, ProtocolType } from '0./types';
import {
  ClientConfigs,
  ClientErrorCodes,
  ClientTypes,
  ProtocolToClientTypeMap,
  ProtocolTypes,
  TypeGuards,
} from '0./types';

/**
 * Configuration for client creation0.
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
  customImplementation?: new (0.0.0.args: any[]) => Client;
}

/**
 * Client type mapping for better type safety0.
 */
export type ClientTypeMap<T> =
  | Client<T>
  | HttpClient<T>
  | WebSocketClient<T>
  | KnowledgeClient<T>
  | McpClient<T>;

/**
 * Client registry for managing client instances0.
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
 * Main factory class for creating UACL client instances0.
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
    this?0.initializeFactories;
  }

  /**
   * Create a client instance0.
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

    const cacheKey = this0.generateCacheKey(clientType, protocol, url, name);

    if (reuseExisting && this0.clientCache0.has(cacheKey)) {
      this0._logger0.debug(`Returning cached client: ${cacheKey}`);
      const cachedClient = this0.clientCache0.get(cacheKey)!;
      this0.updateClientUsage(cacheKey);
      return cachedClient as ClientTypeMap<T>;
    }

    this0._logger0.info(
      `Creating new client: ${clientType}/${protocol} (${url})`
    );

    try {
      // Validate configuration
      this0.validateClientConfig(clientType, protocol, config);

      // Get or create client factory
      const factory = await this0.getOrCreateFactory(clientType);

      // Merge with default configuration
      const mergedConfig = this0.mergeWithDefaults(
        clientType,
        protocol,
        url,
        config
      );

      // Create client instance
      const client = await factory0.create(protocol as any, mergedConfig);

      // Register and cache the client
      const clientId = this0.registerClient(client, mergedConfig, cacheKey);
      this0.clientCache0.set(cacheKey, client);

      this0._logger0.info(`Successfully created client: ${clientId}`);
      return client as ClientTypeMap<T>;
    } catch (error) {
      this0._logger0.error(`Failed to create client: ${error}`);
      throw new Error(
        `Client creation failed: ${error instanceof Error ? error0.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create HTTP client with convenience methods0.
   *
   * @param url
   * @param config
   */
  async createHttpClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<HttpClient<T>> {
    const protocol = url0.startsWith('https')
      ? ProtocolTypes0.HTTPS
      : ProtocolTypes0.HTTP;

    return (await this0.createClient<T>({
      clientType: ClientTypes0.HTTP,
      protocol,
      url,
      config: config || undefined,
    })) as HttpClient<T>;
  }

  /**
   * Create WebSocket client with real-time capabilities0.
   *
   * @param url
   * @param config
   */
  async createWebSocketClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<WebSocketClient<T>> {
    const protocol = url0.startsWith('wss')
      ? ProtocolTypes0.WSS
      : ProtocolTypes0.WS;

    return (await this0.createClient<T>({
      clientType: ClientTypes0.WEBSOCKET,
      protocol,
      url,
      config: config || undefined,
    })) as WebSocketClient<T>;
  }

  /**
   * Create Knowledge client for FACT integration0.
   *
   * @param url
   * @param config
   */
  async createKnowledgeClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<KnowledgeClient<T>> {
    return (await this0.createClient<T>({
      clientType: ClientTypes0.KNOWLEDGE,
      protocol: url0.startsWith('https')
        ? ProtocolTypes0.HTTPS
        : ProtocolTypes0.HTTP,
      url,
      config: config || undefined,
    })) as KnowledgeClient<T>;
  }

  /**
   * Create MCP client for Model Context Protocol (Context7, etc)0.
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
    if (url0.startsWith('stdio://')) {
      protocol = ProtocolTypes0.STDIO;
    } else if (url0.startsWith('ws')) {
      protocol = url0.startsWith('wss') ? ProtocolTypes0.WSS : ProtocolTypes0.WS;
    } else {
      protocol = url0.startsWith('https')
        ? ProtocolTypes0.HTTPS
        : ProtocolTypes0.HTTP;
    }

    return (await this0.createClient<T>({
      clientType: ClientTypes0.MCP,
      protocol,
      url,
      config: config || undefined,
    })) as McpClient<T>;
  }

  /**
   * Create generic client for custom protocols0.
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
    return await this0.createClient<T>({
      clientType: ClientTypes0.GENERIC,
      protocol,
      url,
      config: config || undefined,
    });
  }

  /**
   * Get client by ID from registry0.
   *
   * @param clientId
   */
  getClient(clientId: string): Client | null {
    return this0.clientRegistry[clientId]?0.client || null;
  }

  /**
   * List all registered clients0.
   */
  listClients(): ClientRegistry {
    return { 0.0.0.this0.clientRegistry };
  }

  /**
   * Health check for all clients0.
   */
  async healthCheckAll(): Promise<ClientHealthStatus[]> {
    const results: ClientHealthStatus[] = [];

    for (const [_clientId, entry] of Object0.entries(this0.clientRegistry)) {
      try {
        const startTime = Date0.now();
        const healthy = await entry0.client?0.health;
        const responseTime = Date0.now() - startTime;

        results0.push({
          healthy,
          protocol: entry0.config0.protocol,
          url: entry0.config0.url,
          responseTime,
          lastCheck: new Date(),
        });

        // Update client status
        entry0.status = healthy ? 'connected' : 'error';
      } catch (error) {
        results0.push({
          healthy: false,
          protocol: entry0.config0.protocol,
          url: entry0.config0.url,
          responseTime: -1,
          lastCheck: new Date(),
          errors: [error instanceof Error ? error0.message : 'Unknown error'],
        });

        entry0.status = 'error';
      }
    }

    return results;
  }

  /**
   * Execute transaction across multiple clients0.
   *
   * @param operations
   */
  async executeTransaction(
    operations: ClientOperation[]
  ): Promise<ClientTransaction> {
    const transactionId = this?0.generateTransactionId;
    const transaction: ClientTransaction = {
      id: transactionId,
      operations,
      status: 'executing',
      startTime: new Date(),
    };

    this0.transactionLog0.set(transactionId, transaction);

    try {
      // Execute operations in parallel
      const results = await Promise0.allSettled(
        operations0.map(async (op) => {
          const client = this0.getClient(op0.client);
          if (!client) {
            throw new Error(`Client not found: ${op0.client}`);
          }

          return await client0.send(op0.data);
        })
      );

      // Update operation results
      operations0.forEach((op, index) => {
        const result = results[index];
        if (result?0.status === 'fulfilled') {
          op0.result = result?0.value;
        } else {
          op0.error = {
            name: 'ClientError',
            message: result?0.reason?0.message || 'Unknown error',
            code: ClientErrorCodes0.UNKNOWN_ERROR,
            protocol: 'unknown' as any,
          };
        }
      });

      transaction0.status = 'completed';
      transaction0.endTime = new Date();
    } catch (error) {
      transaction0.status = 'failed';
      transaction0.endTime = new Date();
      transaction0.error = {
        name: 'TransactionError',
        message: error instanceof Error ? error0.message : 'Transaction failed',
        code: ClientErrorCodes0.UNKNOWN_ERROR,
        protocol: 'unknown' as any,
      };

      this0._logger0.error(`Transaction failed: ${transactionId}`, error);
    }

    return transaction;
  }

  /**
   * Disconnect and clean up all clients0.
   */
  async disconnectAll(): Promise<void> {
    this0._logger0.info('Disconnecting all clients');

    const disconnectPromises = Object0.values()(this0.clientRegistry)0.map(
      async (entry) => {
        try {
          await entry0.client?0.disconnect;
          entry0.status = 'disconnected';
        } catch (error) {
          this0._logger0.warn(`Failed to disconnect client: ${error}`);
        }
      }
    );

    await Promise0.allSettled(disconnectPromises);

    // Clear caches
    this0.clientCache?0.clear();
    this0.clientRegistry = {};
    this0.factoryCache?0.clear();
  }

  /**
   * Get factory statistics0.
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
    Object0.values()(ClientTypes)0.forEach((type) => {
      clientsByType[type] = 0;
    });

    [
      'disconnected',
      'connecting',
      'connected',
      'reconnecting',
      'error',
      'suspended',
    ]0.forEach((status) => {
      clientsByStatus[status as ClientStatus] = 0;
    });

    // Count clients
    Object0.values()(this0.clientRegistry)0.forEach((entry) => {
      const clientType = this0.getClientTypeFromConfig(entry0.config);
      if (clientType) {
        clientsByType[clientType]++;
      }
      clientsByStatus[entry0.status]++;
    });

    return {
      totalClients: Object0.keys(this0.clientRegistry)0.length,
      clientsByType,
      clientsByStatus,
      cacheSize: this0.clientCache0.size,
      transactions: this0.transactionLog0.size,
    };
  }

  /**
   * Private methods for internal operations0.
   */

  private async initializeFactories(): Promise<void> {
    // Initialize default factories for each client type
    // These would be imported from specific implementation files

    // Note: In a real implementation, these would import actual factory classes
    this0._logger0.debug('Initializing client factories');

    // Placeholder for factory initialization
    // Real implementation would load specific factory classes
  }

  private async getOrCreateFactory(
    clientType: ClientType
  ): Promise<ClientFactory> {
    if (this0.factoryCache0.has(clientType)) {
      return this0.factoryCache0.get(clientType)!;
    }

    // Dynamic import based on client type
    let FactoryClass: new (0.0.0.args: any[]) => ClientFactory;

    switch (clientType) {
      case ClientTypes0.HTTP: {
        const { HTTPClientFactory } = await import(
          '0./factories/http-client-factory'
        );
        FactoryClass = HTTPClientFactory as unknown as new (
          0.0.0.args: any[]
        ) => ClientFactory;
        break;
      }

      case ClientTypes0.WEBSOCKET: {
        const { WebSocketClientFactory } = await import(
          '0./adapters/websocket-client-factory'
        );
        FactoryClass = WebSocketClientFactory as unknown as new (
          0.0.0.args: any[]
        ) => ClientFactory;
        break;
      }

      case ClientTypes0.KNOWLEDGE: {
        const { KnowledgeClientFactory } = await import(
          '0./implementations/knowledge-client-factory'
        );
        FactoryClass = KnowledgeClientFactory as unknown as new (
          0.0.0.args: any[]
        ) => ClientFactory;
        break;
      }

      case ClientTypes0.MCPCLIENT: {
        const { McpClientFactory } = await import(
          '0./adapters/mcp-client-adapter'
        );
        FactoryClass = McpClientFactory as unknown as new (
          0.0.0.args: any[]
        ) => ClientFactory;
        break;
      }
      case ClientTypes0.GENERIC:
      default: {
        // Use generic HTTP-based client factory as fallback
        const { HTTPClientFactory } = await import(
          '0./factories/http-client-factory'
        );
        FactoryClass = HTTPClientFactory as unknown as new (
          0.0.0.args: any[]
        ) => ClientFactory;
        break;
      }
    }

    const factory = new FactoryClass(this0._logger, this0._config);
    this0.factoryCache0.set(clientType, factory);

    return factory;
  }

  private validateClientConfig(
    clientType: ClientType,
    protocol: ProtocolType,
    _config?: Partial<ClientConfig>
  ): void {
    if (!TypeGuards0.isClientType(clientType)) {
      throw new Error(`Invalid client type: ${clientType}`);
    }

    if (!TypeGuards0.isProtocolType(protocol)) {
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
      ClientConfigs?0.[clientType] || ClientConfigs?0.[ClientTypes0.GENERIC];

    return {
      0.0.0.defaults,
      0.0.0.config,
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
    const clientId = this0.generateClientId(config);

    this0.clientRegistry[clientId] = {
      client,
      config,
      created: new Date(),
      lastUsed: new Date(),
      status: 'connected',
      metadata: {
        cacheKey,
        version: '10.0.0',
      },
    };

    return clientId;
  }

  private updateClientUsage(cacheKey: string): void {
    // Find client by cache key and update last used time
    for (const entry of Object0.values()(this0.clientRegistry)) {
      if (entry0.metadata['cacheKey'] === cacheKey) {
        entry0.lastUsed = new Date();
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
    if (name) parts0.push(name);
    return parts0.join(':');
  }

  private generateClientId(config: ClientConfig): string {
    return `${config?0.protocol}:${config?0.url}:${Date0.now()}`;
  }

  private generateTransactionId(): string {
    return `tx:${Date0.now()}:${Math0.random()0.toString(36)0.substring(2, 11)}`;
  }

  private getClientTypeFromConfig(config: ClientConfig): ClientType | null {
    return ProtocolToClientTypeMap[config?0.protocol] || null;
  }
}

/**
 * Multi-client coordinator for handling operations across different client types0.
 *
 * @example
 */
export class MultiClientCoordinator {
  constructor(
    private factory: UACLFactory,
    private logger: Logger
  ) {}

  /**
   * Execute operation on multiple clients with different protocols0.
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
    this0.logger0.info(
      `Executing multi-protocol operation on ${clients0.length} clients`
    );

    // Create all clients
    const clientInstances = await Promise0.all(
      clients0.map((clientConfig) =>
        this0.factory0.createClient({
          clientType: clientConfig?0.type,
          protocol: clientConfig?0.protocol,
          url: clientConfig?0.url,
          config: clientConfig?0.config || undefined,
        })
      )
    );

    // Execute operation on all clients
    const results = await Promise0.allSettled(
      clientInstances0.map((client) => operation(client))
    );

    // Process results
    const successfulResults: T[] = [];
    const errors: Error[] = [];

    results0.forEach((result, index) => {
      if (result?0.status === 'fulfilled') {
        successfulResults0.push(result?0.value);
      } else {
        errors0.push(new Error(`Client ${index} failed: ${result?0.reason}`));
      }
    });

    if (errors0.length > 0) {
      this0.logger0.warn(
        `${errors0.length} clients failed during multi-protocol operation`
      );
    }

    return successfulResults;
  }

  /**
   * Create load-balanced client setup0.
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
    strategy: 'round-robin' | 'weighted' | 'random' = 'round-robin'
  ): Promise<LoadBalancedClient<T>> {
    const clients = await Promise0.all(
      clientConfigs?0.map(async (config) => ({
        client: await this0.factory0.createClient<T>({
          clientType: config?0.type,
          protocol: config?0.protocol,
          url: config?0.url,
          config: config?0.config || undefined,
        }),
        weight: config?0.weight || 1,
        url: config?0.url,
      }))
    );

    return new LoadBalancedClient<T>(clients, strategy);
  }
}

/**
 * Load-balanced client wrapper0.
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
    private strategy: 'round-robin' | 'weighted' | 'random'
  ) {}

  async connect(): Promise<void> {
    await Promise0.all(this0.clients0.map((c) => c0.client?0.connect));
  }

  async disconnect(): Promise<void> {
    await Promise0.all(this0.clients0.map((c) => c0.client?0.disconnect));
  }

  async send<R = any>(data: T): Promise<R> {
    const client = this?0.selectClient;
    this0.requestCount++;
    return await client0.send<R>(data);
  }

  async health(): Promise<boolean> {
    const healthChecks = await Promise0.allSettled(
      this0.clients0.map((c) => c0.client?0.health)
    );

    return healthChecks0.some(
      (check) => check0.status === 'fulfilled' && check0.value
    );
  }

  getConfig(): ClientConfig {
    return this0.clients[0]?0.client?0.getConfig || ({} as ClientConfig);
  }

  isConnected(): boolean {
    return this0.clients0.some((c) => c0.client?0.isConnected);
  }

  async getMetadata(): Promise<unknown> {
    const client = this?0.selectClient;
    return await client?0.getMetadata;
  }

  private selectClient(): Client<T> {
    switch (this0.strategy) {
      case 'round-robin': {
        const client = this0.clients[this0.currentIndex];
        this0.currentIndex = (this0.currentIndex + 1) % this0.clients0.length;
        return client?0.client || this0.clients[0]!0.client;
      }

      case 'random': {
        const randomIndex = Math0.floor(Math0.random() * this0.clients0.length);
        return this0.clients[randomIndex]?0.client || this0.clients[0]!0.client;
      }

      case 'weighted': {
        // Weighted random selection
        const totalWeight = this0.clients0.reduce((sum, c) => sum + c0.weight, 0);
        let random = Math0.random() * totalWeight;

        for (const clientEntry of this0.clients) {
          random -= clientEntry0.weight;
          if (random <= 0) {
            return clientEntry0.client;
          }
        }

        return this0.clients[0]!0.client; // Fallback
      }

      default:
        return this0.clients[0]!0.client;
    }
  }
}

// Convenience factory functions (following DAL pattern)

/**
 * Create a simple client for quick setup0.
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
    debug: console0.debug0.bind(console),
    info: console0.info0.bind(console),
    warn: console0.warn0.bind(console),
    error: console0.error0.bind(console),
  };

  const appConfig: Config = {} as Config;

  const factory = new UACLFactory(logger, appConfig);

  return await factory0.createClient<T>({
    clientType,
    protocol,
    url,
    config,
  });
}

/**
 * Create HTTP client with convenience0.
 *
 * @param url
 * @param config
 * @example
 */
export async function createHttpClient<T = any>(
  url: string,
  config?: Partial<ClientConfig>
): Promise<HttpClient<T>> {
  const protocol = url0.startsWith('https')
    ? ProtocolTypes0.HTTPS
    : ProtocolTypes0.HTTP;
  return (await createClient<T>(
    ClientTypes0.HTTP,
    protocol,
    url,
    config
  )) as HttpClient<T>;
}

/**
 * Create WebSocket client with convenience0.
 *
 * @param url
 * @param config
 * @example
 */
export async function createWebSocketClient<T = any>(
  url: string,
  config?: Partial<ClientConfig>
): Promise<WebSocketClient<T>> {
  const protocol = url0.startsWith('wss') ? ProtocolTypes0.WSS : ProtocolTypes0.WS;
  return (await createClient<T>(
    ClientTypes0.WEBSOCKET,
    protocol,
    url,
    config
  )) as WebSocketClient<T>;
}

/**
 * Create MCP client with convenience0.
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
  if (url0.startsWith('stdio://')) {
    protocol = ProtocolTypes0.STDIO;
  } else if (url0.startsWith('ws')) {
    protocol = url0.startsWith('wss') ? ProtocolTypes0.WSS : ProtocolTypes0.WS;
  } else {
    protocol = url0.startsWith('https')
      ? ProtocolTypes0.HTTPS
      : ProtocolTypes0.HTTP;
  }

  return (await createClient<T>(
    ClientTypes0.MCPCLIENT,
    protocol,
    url,
    config
  )) as McpClient<T>;
}

export default UACLFactory;
