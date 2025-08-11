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
import type { IConfig, ILogger } from '../../core/interfaces/base-interfaces.ts';
import type { ClientConfig, ClientHealthStatus, ClientOperation, ClientTransaction, IClient, IHttpClient, IKnowledgeClient, IMcpClient, IWebSocketClient } from './interfaces.ts';
import type { ClientStatus, ClientType, ProtocolType } from './types.ts';
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
    customImplementation?: new (...args: any[]) => IClient;
}
/**
 * Client type mapping for better type safety.
 */
export type ClientTypeMap<T> = IClient<T> | IHttpClient<T> | IWebSocketClient<T> | IKnowledgeClient<T> | IMcpClient<T>;
/**
 * Client registry for managing client instances.
 *
 * @example
 */
export interface ClientRegistry {
    [clientId: string]: {
        client: IClient;
        config: ClientConfig;
        created: Date;
        lastUsed: Date;
        status: ClientStatus;
        metadata: Record<string, any>;
    };
}
/**
 * Main factory class for creating UACL client instances.
 *
 * @example
 */
export declare class UACLFactory {
    private _logger;
    private _config;
    private clientCache;
    private factoryCache;
    private clientRegistry;
    private transactionLog;
    constructor(_logger: ILogger, _config: IConfig);
    /**
     * Create a client instance.
     *
     * @param factoryConfig
     */
    createClient<T = any>(factoryConfig: ClientFactoryConfig): Promise<ClientTypeMap<T>>;
    /**
     * Create HTTP client with convenience methods.
     *
     * @param url
     * @param config
     */
    createHttpClient<T = any>(url: string, config?: Partial<ClientConfig>): Promise<IHttpClient<T>>;
    /**
     * Create WebSocket client with real-time capabilities.
     *
     * @param url
     * @param config
     */
    createWebSocketClient<T = any>(url: string, config?: Partial<ClientConfig>): Promise<IWebSocketClient<T>>;
    /**
     * Create Knowledge client for FACT integration.
     *
     * @param url
     * @param config
     */
    createKnowledgeClient<T = any>(url: string, config?: Partial<ClientConfig>): Promise<IKnowledgeClient<T>>;
    /**
     * Create MCP client for Model Context Protocol.
     *
     * @param url
     * @param config
     */
    createMcpClient<T = any>(url: string, config?: Partial<ClientConfig>): Promise<IMcpClient<T>>;
    /**
     * Create generic client for custom protocols.
     *
     * @param protocol
     * @param url
     * @param config
     */
    createGenericClient<T = any>(protocol: ProtocolType, url: string, config?: Partial<ClientConfig>): Promise<IClient<T>>;
    /**
     * Get client by ID from registry.
     *
     * @param clientId
     */
    getClient(clientId: string): IClient | null;
    /**
     * List all registered clients.
     */
    listClients(): ClientRegistry;
    /**
     * Health check for all clients.
     */
    healthCheckAll(): Promise<ClientHealthStatus[]>;
    /**
     * Execute transaction across multiple clients.
     *
     * @param operations
     */
    executeTransaction(operations: ClientOperation[]): Promise<ClientTransaction>;
    /**
     * Disconnect and clean up all clients.
     */
    disconnectAll(): Promise<void>;
    /**
     * Get factory statistics.
     */
    getStats(): {
        totalClients: number;
        clientsByType: Record<ClientType, number>;
        clientsByStatus: Record<ClientStatus, number>;
        cacheSize: number;
        transactions: number;
    };
    /**
     * Private methods for internal operations.
     */
    private initializeFactories;
    private getOrCreateFactory;
    private validateClientConfig;
    private mergeWithDefaults;
    private registerClient;
    private updateClientUsage;
    private generateCacheKey;
    private generateClientId;
    private generateTransactionId;
    private getClientTypeFromConfig;
}
/**
 * Multi-client coordinator for handling operations across different client types.
 *
 * @example
 */
export declare class MultiClientCoordinator {
    private factory;
    private logger;
    constructor(factory: UACLFactory, logger: ILogger);
    /**
     * Execute operation on multiple clients with different protocols.
     *
     * @param clients
     * @param operation
     */
    executeMultiProtocol<T = any>(clients: Array<{
        type: ClientType;
        protocol: ProtocolType;
        url: string;
        config?: Partial<ClientConfig>;
    }>, operation: (client: IClient) => Promise<T>): Promise<T[]>;
    /**
     * Create load-balanced client setup.
     *
     * @param clientConfigs
     * @param strategy
     */
    createLoadBalanced<T = any>(clientConfigs: Array<{
        type: ClientType;
        protocol: ProtocolType;
        url: string;
        weight?: number;
        config?: Partial<ClientConfig>;
    }>, strategy?: 'round-robin' | 'weighted' | 'random'): Promise<LoadBalancedClient<T>>;
}
/**
 * Load-balanced client wrapper.
 *
 * @example
 */
export declare class LoadBalancedClient<T = any> implements IClient<T> {
    private clients;
    private strategy;
    private currentIndex;
    private requestCount;
    constructor(clients: Array<{
        client: IClient<T>;
        weight: number;
        url: string;
    }>, strategy: 'round-robin' | 'weighted' | 'random');
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send<R = any>(data: T): Promise<R>;
    health(): Promise<boolean>;
    getConfig(): ClientConfig;
    isConnected(): boolean;
    getMetadata(): Promise<any>;
    private selectClient;
}
/**
 * Create a simple client for quick setup.
 *
 * @param clientType
 * @param protocol
 * @param url
 * @param config
 * @example
 */
export declare function createClient<T = any>(clientType: ClientType, protocol: ProtocolType, url: string, config?: Partial<ClientConfig>): Promise<IClient<T>>;
/**
 * Create HTTP client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export declare function createHttpClient<T = any>(url: string, config?: Partial<ClientConfig>): Promise<IHttpClient<T>>;
/**
 * Create WebSocket client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export declare function createWebSocketClient<T = any>(url: string, config?: Partial<ClientConfig>): Promise<IWebSocketClient<T>>;
/**
 * Create MCP client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export declare function createMcpClient<T = any>(url: string, config?: Partial<ClientConfig>): Promise<IMcpClient<T>>;
export default UACLFactory;
//# sourceMappingURL=factories.d.ts.map