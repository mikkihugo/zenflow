/**
 * @file Interface implementation: websocket-client-factory.
 */
/**
 * WebSocket Client Factory for UACL.
 *
 * Factory implementation for creating and managing WebSocket client instances.
 * Following the UACL (Unified API Client Layer) architecture.
 */
import type { ClientConfig, ClientMetrics, ClientStatus, IClient, IClientFactory } from '../core/interfaces.ts';
import type { WebSocketClientConfig, WebSocketConnectionInfo, WebSocketMetrics } from './websocket-types.ts';
/**
 * WebSocket Client Factory implementing UACL IClientFactory interface.
 *
 * @example
 */
export declare class WebSocketClientFactory implements IClientFactory<WebSocketClientConfig> {
    private clients;
    private clientConfigs;
    private connectionPool;
    /**
     * Create new WebSocket client instance.
     *
     * @param config
     */
    create(config: WebSocketClientConfig): Promise<IClient>;
    /**
     * Create multiple WebSocket clients.
     *
     * @param configs
     */
    createMultiple(configs: WebSocketClientConfig[]): Promise<IClient[]>;
    /**
     * Get cached client by name.
     *
     * @param name
     */
    get(name: string): IClient | undefined;
    /**
     * List all active clients.
     */
    list(): IClient[];
    /**
     * Check if client exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove and disconnect client.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Health check all clients.
     */
    healthCheckAll(): Promise<Map<string, ClientStatus>>;
    /**
     * Get metrics for all clients.
     */
    getMetricsAll(): Promise<Map<string, ClientMetrics>>;
    /**
     * Shutdown all clients.
     */
    shutdown(): Promise<void>;
    /**
     * Get active client count.
     */
    getActiveCount(): number;
    /**
     * Validate WebSocket client configuration.
     *
     * @param config
     */
    validateConfig(config: WebSocketClientConfig): boolean;
    /**
     * Create WebSocket client with connection pooling.
     *
     * @param config
     * @param poolSize
     */
    createPooled(config: WebSocketClientConfig, poolSize?: number): Promise<IClient[]>;
    /**
     * Create WebSocket client with load balancing.
     *
     * @param configs
     * @param strategy
     */
    createLoadBalanced(configs: WebSocketClientConfig[], strategy?: 'round-robin' | 'random' | 'least-connections'): Promise<LoadBalancedWebSocketClient>;
    /**
     * Create WebSocket client with failover support.
     *
     * @param primaryConfig
     * @param fallbackConfigs
     */
    createFailover(primaryConfig: WebSocketClientConfig, fallbackConfigs: WebSocketClientConfig[]): Promise<FailoverWebSocketClient>;
    /**
     * Get WebSocket-specific metrics for all clients.
     */
    getWebSocketMetricsAll(): Promise<Map<string, WebSocketMetrics>>;
    /**
     * Get connection information for all clients.
     */
    getConnectionInfoAll(): Map<string, WebSocketConnectionInfo>;
    private generateClientName;
}
/**
 * Load-balanced WebSocket client wrapper.
 *
 * @example
 */
export declare class LoadBalancedWebSocketClient implements IClient {
    private clients;
    private strategy;
    private currentIndex;
    private requestCount;
    constructor(clients: IClient[], strategy: 'round-robin' | 'random' | 'least-connections');
    get config(): ClientConfig;
    get name(): string;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    healthCheck(): Promise<ClientStatus>;
    getMetrics(): Promise<ClientMetrics>;
    get<T = any>(endpoint: string, options?: any): Promise<any>;
    post<T = any>(endpoint: string, data?: any, options?: any): Promise<any>;
    put<T = any>(endpoint: string, data?: any, options?: any): Promise<any>;
    delete<T = any>(endpoint: string, options?: any): Promise<any>;
    updateConfig(config: any): void;
    on(event: 'connect' | 'disconnect' | 'error' | 'retry', handler: (...args: any[]) => void): void;
    off(event: string, handler?: (...args: any[]) => void): void;
    destroy(): Promise<void>;
    private selectClient;
}
/**
 * Failover WebSocket client wrapper.
 *
 * @example
 */
export declare class FailoverWebSocketClient implements IClient {
    private primaryClient;
    private fallbackClients;
    private currentClient;
    private fallbackIndex;
    constructor(primaryClient: IClient, fallbackClients: IClient[]);
    get config(): ClientConfig;
    get name(): string;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    healthCheck(): Promise<ClientStatus>;
    getMetrics(): Promise<ClientMetrics>;
    get<T = any>(endpoint: string, options?: any): Promise<any>;
    post<T = any>(endpoint: string, data?: any, options?: any): Promise<any>;
    put<T = any>(endpoint: string, data?: any, options?: any): Promise<any>;
    delete<T = any>(endpoint: string, options?: any): Promise<any>;
    updateConfig(config: any): void;
    on(event: 'connect' | 'disconnect' | 'error' | 'retry', handler: (...args: any[]) => void): void;
    off(event: string, handler?: (...args: any[]) => void): void;
    destroy(): Promise<void>;
    private failover;
}
export declare function createWebSocketClientFactory(): Promise<WebSocketClientFactory>;
export declare function createWebSocketClientWithConfig(config: WebSocketClientConfig): Promise<IClient>;
export default WebSocketClientFactory;
//# sourceMappingURL=websocket-client-factory.d.ts.map