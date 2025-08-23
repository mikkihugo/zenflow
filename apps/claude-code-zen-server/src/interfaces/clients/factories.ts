/**
 * @fileoverview Unified API Client Layer (UACL) - Factory Implementation
 *
 * Central factory for creating client instances based on client type,
 * protocol requirements, and configuration. Supports dependency injection and
 * provides a single point of access for all client implementations.
 *
 * Key Features:
 * - Dynamic client creation based on type and protocol
 * - Client caching and instance management
 * - Multi-protocol coordination
 * - Load balancing and failover support
 * - Transaction management across clients
 * - Comprehensive error handling and logging
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import {
  getLogger,
  type Logger
} from '@claude-zen/foundation';
import type {
  Client,
  ClientConfig,
  ClientFactory,
  ClientHealthStatus,
  ClientMetrics,
  ClientInstance,
  ClientType

} from './core/interfaces';
import type {
  ClientTypes,
  ProtocolType,
  ProtocolTypes,
  ClientStatus

} from './types';

/**
 * Configuration for client creation.
 */
export interface ClientFactoryConfig {
  /** Client type to create */
  clientType: keyof typeof ClientTypes;
  /** Protocol type */
  protocol: ProtocolType;
  /** Connection URL */
  url: string;
  /** Client name/identifier */
  name?: string;
  /** Client-specific configuration */
  config?: Partial<ClientConfig>;
  /** Use existing client instance if available */
  reuseExisting?: boolean;
  /** Custom client implementation */
  customImplementation?: new (...args: any[]) => Client

}

/**
 * Client type mapping for better type safety.
 */
export type ClientTypeMap<T = any> = Client;

/**
 * Client registry entry interface.
 */
export interface ClientRegistryEntry {
  client: Client;
  config: ClientConfig;
  created: Date;
  lastUsed: Date;
  status: ClientStatus;
  metadata: Record<string,
  unknown>

}

/**
 * Client registry for managing client instances.
 */
export interface ClientRegistry {
  [clientId: string]: ClientRegistryEntry
}

/**
 * Client operation interface for transactions.
 */
export interface ClientOperation {
  client: string;
  data: any;
  result?: any;
  error?: {
  name: string;
  message: string;
  code: string;
  protocol: ProtocolType

}
}

/**
 * Client transaction interface.
 */
export interface ClientTransaction {
  id: string;
  operations: ClientOperation[];
  status: 'executing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: {
  name: string;
  message: string;
  code: string;
  protocol: ProtocolType

}
}

/**
 * Main factory class for creating UACL client instances.
 */
export class UACLFactory {
  private clientCache = new Map<string, Client>();
  private factoryCache = new Map<keyof typeof ClientTypes, ClientFactory>();
  private clientRegistry: ClientRegistry = {};
  private transactionLog = new Map<string, ClientTransaction>();
  private logger: Logger;

  constructor() {
  this.logger = getLogger('UACLFactory);
    this.initializeFactories()

}

  /**
   * Create a client instance.
   */
  async createClient<T = any>(
    factoryConfig: ClientFactoryConfig
  ': Promise<ClientTypeMap<T>> {
    const {
  clientType,
  protocol,
  url,
  name,
  config,
  reuseExisting = true

} = factoryConfig;

    const cacheKey = this.generateCacheKey(
  clientType,
  protocol,
  url, name
);

    if (reuseExisting && this.clientCache.has(cacheKey)) {
      this.logger.debug('Returning cached client: ' + cacheKey + ')';
      const cachedClient = this.clientCache.get(cacheKey'!;
      this.updateClientUsage(cacheKey);
      return cachedClient as ClientTypeMap<T>
}

    this.logger.info('Creating new client: ' + clientType + '/${protocol} '${url})``;;

    try {
      // Validate configuration
      this.validateClientConfig(
  clientType,
  protocol,
  config
);

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
      const client = await factory.create(mergedConfig);

      // Register and cache the client
      const clientId = this.registerClient(
  client,
  mergedConfig,
  cacheKey
);
      this.clientCache.set(cacheKey, client);

      this.logger.info('Successfully created client: ' + clientId + ')';
      return client as ClientTypeMap<T>
} catch (error) {
      this.logger.error('Failed to create client: ' + error + ');;
      throw new Error('Client'creation failed: ' + '
  error instanceof Error ? error.message : 'Unknown'error'
 + '
      )
}
  '

  /**
   * Create HTTP client with convenience methods.
   */
  async createHttpClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<ClientTypeMap<T>> {
    const protocol = url.startsWith('https) ? 'https' : 'http';

    return await this.createClient<T>({
  clientType: 'HTTP',
  protocol: protocol as 'rotocolType,
  url,
  config: config || undefined

})
}

  /**
   * Create WebSocket client with real-time capabilities.
   */
  async createWebSocketClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<ClientTypeMap<T>> {
    const protocol = url.startsWith('wss) ? 'wss' : 'ws;;

    return await this.createClient<T>({
  clientType: 'WEBSOCKET',
  protocol: protocol as Protocol'ype,
  url,
  config: config || undefined

})
}

  /**
   * Create Knowledge client for FACT integration.
   */
  async createKnowledgeClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<ClientTypeMap<T>> {
    return await this.createClient<T>({
  clientType: 'KNOWLEDGE',
  protocol: url.startsWith('https) ? 'https' : 'http' as ProtocolTy'e,
  url,
  config: config || undefined

})
}

  /**
   * Create MCP client for Model Context Protocol.
   */
  async createMcpClient<T = any>(
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<ClientTypeMap<T>> {
  // Determine protocol based on URL format
    let protocol: ProtocolType;
  if(url.startsWith(stdio: //)) {
      protocol = 'stdio' as Pr'tocolType'
} 'lse if(url.startsWith('ws)) {
  protocol = url.'tartsWith('wss) ? 'wss' : 'ws' a' ProtocolType'

} 'lse {
  protocol = url.startsWith('https) ? 'https' : 'http' as ProtocolTy'e'

}

    r'turn await this.createClient<T>({
  clientType: 'MCP',
  protocol,
  url,
  config: config || undefined

})
}

  /**
   * Create generic client for custom protocols.
   */
  async createGenericClient<T = any>(
    protocol: 'rotocolType,
    url: string,
    config?: Partial<ClientConfig>
  ): Promise<ClientTypeMap<T>> {
    return await this.createClient<T>({;
  clientType: 'GENERIC',
  protocol,
  url,
  config: config || undefined

})
}

  /**
   * Get client by ID from registry.
   */
  get'lient(clientId: string): Client | null  {
  return this.clientRegistry[clientId]?.client || null

}

  /**
   * List all registered clients.
   */
  listClients(): ClientRegistry  {
    return { ...this.clientRegistry }
}

  /**
   * Health check for all clients.
   */
  async healthCheckAll(): Promise<ClientHealthStatus[]>  {
  const results: ClientHealthStatus[] = [];
  for (const [_clientId, entry] of Object.entries(this.clientRegistry)) {
      try {
  const healthResult = await entry.client.healthCheck();
        results.push(healthResult);

        // Update client status
        entry.status = healthResult.status === 'healthy' ? 'connected' : 'error'

} catch (error) {
        results.push(
  {
          name: entry.config.name || 'unknown',
  status: 'unhealthy',
  lastCheck: new Date(
),
          responseTime: -1,
          errorRate: 1.0,
          uptime: 0,
          metadata: {
  error: error instanceof Error ? error.message : 'Unknown'error'

}
});
        ent'y.status = 'error'
}
    }

    return results
}

  /**
   * Execute transaction across multiple clients.
   */
  async executeTransaction(operations: ClientOperation[]
  ): Promise<ClientTransaction>  {
    const transactionId = this.generateTransactionId();
    const transaction: ClientTransaction = {
  id: transactionId,
  operations,
  status: 'executing',
  startTime: new Date()

};

    this.transactionLo'.set(transactionId, transaction);

    try {
      // Execute operations in parallel
      const results = await Promise.allSettled(
        operations.map(async (op) => {
          const client = this.getClient(op.client);
          if (!client) {
            throw new Error('Client not found: ' + op.client + ')
}

          // Assuming clients have a generic request method
          if('get' in clien' && typeof client.get === 'function) {
  retur' await client.get(op.data.endpoint || '/',
  op.data)'

}

          throw new Error('Client does not support generic operations);
})
      );

      // Update operation results
      operations.forEach((op, index' => {
        const result = results[index];
        if (result.status === fulfilled) {
          op.result = result.value
} else {
          op.error = {
  name: 'ClientError',
  message: 'esult.reason?.message || 'Unknown'error',
  code: 'UNKNOWN_ERROR',
  protocol: 'unknown' as ProtocolType

}
}
      });

      tra'saction.status = 'completed';
      transaction.endTime = new Date()
} catch (error) {
      transaction.status = 'failed';
      transaction.endTime = new Date();
      transaction.error = {
  name: 'TransactionError',
  message: e'ror instanceof Error ? error.message : 'Transaction'failed',
  coe: 'UNKNOWN_ERROR',
  protocol: 'unknown' as ProtocolType

};

      this.logger.error('Transaction failed: ' + transactionId + '', error)'
}

    return transaction
}

  /**
   * Disconnect and clean up all clients.
   */
  async disconnectAll(': Promise<void> {
    this.logger.info('Disconnecting all clients);;

    const disconnectPromises = Object.values(this.clientRegistry'.map(
      async (entry) => {
        try {
  await entry.client.disconnect();
          entry.status = 'disconnected

} catch (error) {
          this.logger.warn('Failed to disconnect client: ' + error + ')'
}
      }
    );

    await Promise.allSettled(disconnectPromises);

    // Clear caches
    this.clientCache.clear();
    this.clientRegistry = {};
    this.factoryCache.clear()
}

  /**
   * Get factory statistics.
   */
  getStats(
  ': {
  totalClients: number;
    clientsByType: Record<string,
  number>;
    clientsByStatus: Record<ClientStatus,
  number>;
    cacheSize: number;
    transactions: number

} {
    const clientsByType: Record<string, number> = {};
    const clientsByStatus: Record<ClientStatus, number> = {
  disconnected: 0,
  connecting: 0,
  connected: 0,
  reconnecting: 0,
  error: 0,
  suspended: 0

};

    // Count clients
    Object.values(this.clientRegistry
).forEach((entry) => {
      const clientType = this.getClientTypeFromConfig(entry.config);
      if (clientType) {
  clientsByType[clientType] = (clientsByType[clientType] || 0) + 1

}
      clientsByStatus[entry.status]++
});

    return {
  totalClients: Object.keys(this.clientRegistry).length,
  clientsByType,
  clientsByStatus,
  cacheSize: this.clientCache.size,
  transactions: this.transactionLog.size

}
}

  /**
   * Private methods for internal operations.
   */
  private initializeFactories(): void  {
  this.logger.debug('Initializing client factories);;
    // Factory initialization logic would go here

}

  private async getOrCreateFactory(
    clientType: keyof typeof ClientTypes
  ': Promise<ClientFactory> {
    if (this.factoryCache.has(clientType)) {
      return this.factoryCache.get(clientType)!
}

    // Create a basic factory implementation
    const factory: ClientFactory = {
      type: clientType,
      async create(config: ClientConfig): Promise<Client>  {
        // Dynamic import based on client type
        switch (clientType) {
          case HTTP: {
            const { createA'IClient } = await import('./api/http/client);;
            return createAPIClient(config' as Client
}
          case WEBSOCKET: {
            const { WebSocketClient } = await import('./api/websocket/client);;
            return new WebSocketClient(config.baseURL || ', config) as Client'
}
          case KNOWLEDGE: {
            const { FACTIntegration } = await import('../knowledge/knowledge-client);;
            return new FACTIntegration(config' as Client
}
          case MCP: {
            const { ExternalMC'Client } = await import('./mcp/external-mcp-client);;
            return new ExternalMCPClient(' as Client
}
          default:
            throw new Error('Unsupported client type: ' + clientType + ');
}
      },
      get: (' => undefined,
      register: () => {},
      unregister: () => false,
      getAll: () => [],
      validateConfig: () => true,
      shutdown: async () => {}
};

    this.factoryCache.set(clientType, factory);
    return factory
}

  private validateClientConfig(
  clientType: keyof typeof ClientTypes,
  protocol: ProtocolType,
  _config?: Partial<ClientConfig>
): void  {
    if (!clientType) {
      throw new Error('Invalid client type: ' + clientType + ')'
}

    if (!protocol' {
      throw new Error('Invalid protocol type: ' + protocol + );
}

    // Additional validation logic would go here
  }

  private mergeWithDefaults(
  _clientType: keyof typeof ClientTypes,
  protocol: ProtocolType,
  url: string,
    config?: Partial<ClientConfig>
  ': ClientConfig {
    const defaults: ClientConfig = {
      name: 'client-' + Date.now(
) + '',
      baseURL: url,
      timeout: {
  request: 30000,
  connect: 5000

},
      metadata: {}
};

    return {
      ...defaults,
      ...config,
      // Ensure required fields are not overwritten
      baseURL: url,
      metadata: {
  ...defaults.metadata,
  ...config?.metadata,
  protocol

}
};
  '

  private registerClient(
  client: Client,
  config: ClientConfig,
  cacheKey: string
): string  {
    const clientId = this.generateClientId(config);

    this.clientRegistry[clientId] = {
      client,
      config,
      created: new Date(),
      lastUsed: new Date(),
      status: 'connected',
      metaata: {
  cacheKey,
  version: '1.0.0'
}
};

    return clientId
}

  private updateClientUsage(cacheKey: string): void  {
    // Find client by cache key and update last used time
    for (const entry of Object.values(this.clientRegistry)) {
      if (entry.metadata.cacheKey === cacheKey) {
        entry.lastUsed = new Date();
        break
}
    }
  }

  private generateCacheKey(
  clientType: keyof typeof ClientTypes,
  protocol: ProtocolType,
  url: string,
    name?: string
): string  {
  const parts = [clientType,
  protocol,
  url];
    if (name) parts.push(name);
    return parts.join(':)'

}

  private generateClientId(config: ClientConfig: string {
    const protocol = config.metadata?.protocol || 'unknown;;
    return '' + protocol + ':${config.baseURL}:${Date.now()}'`
}

  private generateTransactionId(): string  {
    return tx:' + Date.now() + ':${
  Math.random().toString(36).substring(2,
  11)
}';
}

  private getClientTypeFromConfig(config: ClientConfig): string | null  {
  return config.metadata?.protocol as string || null

}
}

/**
 * Multi-client coordinator for handling operations across different client types.
 */
export class MultiClientCoordinator {
  private logger: Logger;
  constructor(
    private factory: UACLFactory
  ) {
  this.logger = getLogger('MultiClientCoordinator)'

}

  /**
   * Execute operation on multiple clients with different protocols.
   */
  async executeMultiProtocol<T = any>(
    clients: Array<{
  type: keyof typeof ClientTypes;
      protocol: ProtocolType;
      url: string;
      config?: Partial<ClientConfig>

}>,
    operation: (client: Client' => Promise<T>
  ): Promise<T[]> {
    this.logger.info('Executing multi-protocol operation on ' + clients.length + ' clients)';

    // Create all clients
    const clientInstances = await Promise.all(
  clients.map((clientConfig' =>
        this.factory.createClient({
  clientType: clientConfig.type,
  protocol: clientConfig.protocol,
  url: clientConfig.url,
  config: clientConfig.config || undefined

}
)
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
      if(result.status === `fulfilled) {
        successfulResults.push(result.value)
} else {
        errors.push(new Error('Client ' + index + ' failed: ${result.reason}))'
}
    });

    if(errors.length > 0' {
      this.logger.warn('' + errors.length + ' clients failed during multi-protocol operation)'
}

    return successfulResults
}

  /**
   * Create load-balanced client setup.
   */
  async createLoadBalanced<T = any>(
    clientConfigs: Array<{
  type: keyof typeof ClientTypes;
      protocol: ProtocolType;
      url: string;
      weight?: number;
      config?: Partial<ClientConfig>

}>,
    strategy: 'round-robin' | 'weighted' | 'random' = 'round-robin'
  ): Promise<LoadBala'cedClient<T>> {
    const clients = await Promise.all(
      clientConfigs.map(async (config) => ({
        client: await this.factory.createClient<T>({
  clientType: config.type,
  protocol: config.protocol,
  url: config.url,
  config: config.config || undefined

}),
        weight: config.weight || 1,
        url: config.url
}))
    );

    return new LoadBalancedClient<T>(clients, strategy)
}
}

/**
 * Load-balanced client wrapper.
 */
export class LoadBalancedClient<T = any> implements Client {
  private currentIndex = 0;
  private requestCount = 0;

  public readonly config: ClientConfig;
  public readonly type = 'load-balanced';
  public readonly version = '1.0.0';
  public readonly isConnected = true;
  public readonly isInitialized = true;

  constructor(private clients: Array<{
  client: Client;
      weight: number;
      url: string

}>,
    private strategy: 'round-robin' | 'weighted' | 'random
  ) {
    this.config = this.clients[0]?.client?.config || ({} as ClientConfig)
}

  async initialize(): Pro'ise<void>  {
  await Promise.all(this.clients.map((c) => c.client.initialize()))

}

  async connect(): Promise<void>  {
  await Promise.all(this.clients.map((c) => c.client.connect()))

}

  async disconnect(): Promise<void>  {
  await Promise.all(this.clients.map((c) => c.client.disconnect()))

}

  async get<R = any>(endpoint: string, config?: any): Promise<R> {
  const client = this.selectClient();
    this.requestCount++;
    return await client.get<R>(endpoint,
  config)

}

  async post<R = any>(endpoint: string, data?: any, config?: any): Promise<R> {
  const client = this.selectClient();
    this.requestCount++;
    return await client.post<R>(endpoint,
  data,
  config)

}

  async put<R = any>(endpoint: string, data?: any, config?: any): Promise<R> {
  const client = this.selectClient();
    this.requestCount++;
    return await client.put<R>(endpoint,
  data,
  config)

}

  async delete<R = any>(endpoint: string, config?: any): Promise<R> {
  const client = this.selectClient();
    this.requestCount++;
    return await client.delete<R>(endpoint,
  config)

}

  async patch<R = any>(endpoint: string, data?: any, config?: any): Promise<R> {
  const client = this.selectClient();
    this.requestCount++;
    return await client.patch<R>(endpoint,
  data,
  config)

}

  async head(endpoint: string, config?: any): Promise<any>  {
  const client = this.selectClient();
    this.requestCount++;
    return await client.head(endpoint,
  config)

}

  async options(endpoint: string, config?: any): Promise<any>  {
  const client = this.selectClient();
    this.requestCount++;
    return await client.options(endpoint,
  config)

}

  async healthCheck(): Promise<any>  {
    const healthChecks = await Promise.allSettled(
      this.clients.map((c) => c.client.healthCheck())
    );

    const healthyClients = healthChecks.filter(
      (check) => check.status === 'fulfilled' && check.value.status === 'healthy'
    ).length;

    return {
      status: health'Clients > 0 ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      responseTime: 0,
      metadata: {
  totalClients: this.clients.length,
  health'Clients

}
}
}

  async getMetrics(): Promise<any>  {
  const client = this.selectClient();
    return await client.getMetrics()

}

  resetMetrics(): void  {
  this.clients.forEach((c) => c.client.resetMetrics())

}

  configure(config: Partial<ClientConfig>): void  {
  this.clients.forEach((c) => c.client.configure(config))

}

  async shutdown(): Promise<void>  {
  await Promise.all(this.clients.map((c) => c.client.shutdown()))

}

  // EventEmitter methods
  on(event: string, handler: (...args: any[]) => void): void {
    // Delegate to first client for simplicity
    if (this.clients[0]?.client.on) {
  this.clients[0].client.on(event,
  handler)

}
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (this.clients[0]?.client.off) {
  this.clients[0].client.off(event,
  handler)

}
  }

  emit(event: string, ...args: any[]): boolean  {
    // Delegate to first client for simplicity
    if (this.clients[0]?.client.emit) {
  return this.clients[0].client.emit(event,
  ...args)

}
    return false
}

  private selectClient(): Client  {
    switch (this.strategy) {
      case 'round-robin: {
  co'st client = this.clients[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.clients.length;
        return client.client

}

      case random: {
  const rando'Index = Math.floor(Math.random() * this.clients.length);
        return this.clients[randomIndex].client

}

      case weighted: {
        // Weighte' random selection
        const totalWeight = this.clients.reduce((sum, c) => sum + c.weight, 0);
        let random = Math.random() * totalWeight;

        for (const clientEntry of this.clients) {
          random -= clientEntry.weight;
          if (random <= 0) {
            return clientEntry.client
}
        }
        return this.clients[0].client; // Fallback
      }

      default:
        return this.clients[0].client
}
  }
}

/**
 * Convenience factory functions.
 */

/**
 * Create a simple client for quick setup.
 */
export async function createClient<T = any>(
  clientType: keyof typeof ClientTypes,
  protocol: ProtocolType,
  url: string,
  config?: Partial<ClientConfig>
): Promise<Client> {
  const factory = new UACLFactory();

  return await factory.createClient<T>({
  clientType,
  protocol,
  url,
  config

})
}

/**
 * Create HTTP client convenience function.
 */
export async function createHttpClient(url: string,
  config?: Partial<ClientConfig>
): Promise<Client>  {
  return createClient('HTTP',
  url.startsWith('https) ? 'https' : 'http' as ProtocolTy'e,
  url,
  config)'

}

/**
 * Create WebSocket client convenience function.
 */
export async function createWebSocketClient(url: string,
  config?: Partial<ClientConfig>
': Promise<Client> {
  return createClient('WEBSOCKET',
  url.startsWith('wss
) ? 'wss' : 'ws' a' ProtocolType,
  url,
  config);

}

export default {
  UACLFactory,
  MultiClientCoordinator,
  LoadBalancedClient,
  createClient,
  createHttpClient,
  createWebSocketClient

};