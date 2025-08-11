/**
 * @file Interface implementation: websocket-index.
 */
/**
 * WebSocket Client Adapter Index.
 *
 * Exports all WebSocket client components for UACL integration.
 */
export type { ClientConfig, ClientMetrics, ClientResponse, ClientStatus, IClient, IClientFactory, RequestOptions, } from '../core/interfaces.ts';
export { EnhancedWebSocketClient, WebSocketClient, } from './enhanced-websocket-client.ts';
export { createWebSocketClient, WebSocketClientAdapter, WebSocketClientFactory as WebSocketAdapterFactory, } from './websocket-client-adapter.ts';
export { createWebSocketClientFactory, createWebSocketClientWithConfig, FailoverWebSocketClient, LoadBalancedWebSocketClient, WebSocketClientFactory, } from './websocket-client-factory.ts';
import { FailoverWebSocketClient, LoadBalancedWebSocketClient, WebSocketClientFactory } from './websocket-client-factory.ts';
import type { WebSocketClientConfig } from './websocket-types.ts';
export { type WebSocketAuthenticationConfig, WebSocketAuthMethod, type WebSocketClientConfig, WebSocketCloseCode, type WebSocketCompressionConfig, type WebSocketConnectionInfo, type WebSocketExtension, type WebSocketHeartbeatConfig, type WebSocketMessage, type WebSocketMessageQueueConfig, WebSocketMessageType, type WebSocketMetrics, type WebSocketPoolConfig, WebSocketReadyState, type WebSocketRequestOptions, type WebSocketResponse, type WebSocketRetryConfig, type WebSocketSecurityConfig, WebSocketTypeGuards, WebSocketUtils, } from './websocket-types.ts';
/**
 * Convenience function to create a WebSocket client with automatic factory selection.
 *
 * @param config
 * @param options
 * @param options.useEnhanced
 * @param options.loadBalancing
 * @param options.loadBalancing.enabled
 * @param options.loadBalancing.strategy
 * @param options.loadBalancing.urls
 * @param options.failover
 * @param options.failover.enabled
 * @param options.failover.fallbackUrls
 * @param options.pooling
 * @param options.pooling.enabled
 * @param options.pooling.size
 * @example
 */
export declare function createOptimalWebSocketClient(config: WebSocketClientConfig, options?: {
    useEnhanced?: boolean;
    loadBalancing?: {
        enabled: boolean;
        strategy?: 'round-robin' | 'random' | 'least-connections';
        urls?: string[];
    };
    failover?: {
        enabled: boolean;
        fallbackUrls?: string[];
    };
    pooling?: {
        enabled: boolean;
        size?: number;
    };
}): Promise<import('../core/interfaces.ts').IClient>;
/**
 * Convenience function to create a WebSocket client from URL with minimal configuration.
 *
 * @param url
 * @param options
 * @param options.timeout
 * @param options.reconnect
 * @param options.heartbeat
 * @param options.useEnhanced
 * @example
 */
export declare function createSimpleWebSocketClient(url: string, options?: {
    timeout?: number;
    reconnect?: boolean;
    heartbeat?: boolean;
    useEnhanced?: boolean;
}): Promise<import('../core/interfaces.ts').IClient>;
/**
 * Default WebSocket client configurations for common use cases.
 */
export declare const WebSocketClientPresets: {
    /**
     * High-performance configuration for low-latency applications.
     *
     * @param url
     */
    HighPerformance: (url: string) => WebSocketClientConfig;
    /**
     * Robust configuration for unreliable networks.
     *
     * @param url
     */
    Robust: (url: string) => WebSocketClientConfig;
    /**
     * Minimal configuration for simple applications.
     *
     * @param url
     */
    Simple: (url: string) => WebSocketClientConfig;
    /**
     * Secure configuration with authentication.
     *
     * @param url
     * @param token
     */
    Secure: (url: string, token: string) => WebSocketClientConfig;
};
/**
 * WebSocket client health monitor utility.
 *
 * @example
 */
export declare class WebSocketHealthMonitor {
    private clients;
    private intervals;
    /**
     * Add client to monitoring.
     *
     * @param name
     * @param client
     * @param checkInterval
     */
    addClient(name: string, client: import('../core/interfaces.ts').IClient, checkInterval?: number): void;
    /**
     * Remove client from monitoring.
     *
     * @param name
     */
    removeClient(name: string): void;
    /**
     * Get health status for all monitored clients.
     */
    getHealthStatus(): Promise<Map<string, import('../core/interfaces.ts').ClientStatus>>;
    /**
     * Stop monitoring all clients.
     */
    stopAll(): void;
}
declare const _default: {
    WebSocketClientAdapter: any;
    EnhancedWebSocketClient: any;
    WebSocketClientFactory: typeof WebSocketClientFactory;
    LoadBalancedWebSocketClient: typeof LoadBalancedWebSocketClient;
    FailoverWebSocketClient: typeof FailoverWebSocketClient;
    createOptimalWebSocketClient: typeof createOptimalWebSocketClient;
    createSimpleWebSocketClient: typeof createSimpleWebSocketClient;
    WebSocketClientPresets: {
        /**
         * High-performance configuration for low-latency applications.
         *
         * @param url
         */
        HighPerformance: (url: string) => WebSocketClientConfig;
        /**
         * Robust configuration for unreliable networks.
         *
         * @param url
         */
        Robust: (url: string) => WebSocketClientConfig;
        /**
         * Minimal configuration for simple applications.
         *
         * @param url
         */
        Simple: (url: string) => WebSocketClientConfig;
        /**
         * Secure configuration with authentication.
         *
         * @param url
         * @param token
         */
        Secure: (url: string, token: string) => WebSocketClientConfig;
    };
    WebSocketHealthMonitor: typeof WebSocketHealthMonitor;
};
export default _default;
//# sourceMappingURL=websocket-index.d.ts.map