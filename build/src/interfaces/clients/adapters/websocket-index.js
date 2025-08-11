/**
 * @file Interface implementation: websocket-index.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-clients-adapters-websocket-index');
// Enhanced WebSocket client with backward compatibility
export { EnhancedWebSocketClient, WebSocketClient, // Legacy export
 } from './enhanced-websocket-client.ts';
// Core WebSocket adapter
export { createWebSocketClient, WebSocketClientAdapter, WebSocketClientFactory as WebSocketAdapterFactory, } from './websocket-client-adapter.ts';
// WebSocket client factory with advanced features
export { createWebSocketClientFactory, createWebSocketClientWithConfig, FailoverWebSocketClient, LoadBalancedWebSocketClient, WebSocketClientFactory, } from './websocket-client-factory.ts';
// Import for internal use
import { FailoverWebSocketClient, LoadBalancedWebSocketClient, WebSocketClientFactory, } from './websocket-client-factory.ts';
// WebSocket types and utilities
export { WebSocketAuthMethod, WebSocketCloseCode, WebSocketMessageType, 
// Enums and constants
WebSocketReadyState, 
// Utilities and type guards
WebSocketTypeGuards, WebSocketUtils, } from './websocket-types.ts';
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
export async function createOptimalWebSocketClient(config, options) {
    const factory = new WebSocketClientFactory();
    // Handle load balancing
    if (options?.loadBalancing?.enabled && options?.loadBalancing?.urls) {
        const configs = options?.loadBalancing?.urls?.map((url) => ({
            ...config,
            url,
            name: `${config?.name || 'ws'}-${url.split('://')[1]?.replace(/[:.]/g, '-')}`,
        }));
        return factory.createLoadBalanced(configs, options?.loadBalancing?.strategy);
    }
    // Handle failover
    if (options?.failover?.enabled && options?.failover?.fallbackUrls) {
        const fallbackConfigs = options?.failover?.fallbackUrls?.map((url) => ({
            ...config,
            url,
            name: `${config?.name || 'ws'}-fallback-${url.split('://')[1]?.replace(/[:.]/g, '-')}`,
        }));
        const primaryClient = await factory.create(config);
        const fallbackClients = await factory.createMultiple(fallbackConfigs);
        return new FailoverWebSocketClient(primaryClient, fallbackClients);
    }
    // Handle connection pooling
    if (options?.pooling?.enabled) {
        const pooledClients = await factory.createPooled(config, options?.pooling.size);
        return new LoadBalancedWebSocketClient(pooledClients, 'round-robin');
    }
    // Use enhanced client if requested
    if (options?.useEnhanced) {
        config.metadata = { ...config?.metadata, clientType: 'enhanced' };
    }
    // Create standard client
    return factory.create(config);
}
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
export async function createSimpleWebSocketClient(url, options) {
    const config = {
        name: `simple-ws-${Date.now()}`,
        baseURL: url,
        url,
        timeout: options?.timeout || 30000,
        reconnection: {
            enabled: options?.reconnect !== false,
            maxAttempts: 10,
            initialDelay: 1000,
            maxDelay: 30000,
            backoff: 'exponential',
        },
        heartbeat: {
            enabled: options?.heartbeat !== false,
            interval: 30000,
            message: { type: 'ping' },
        },
        messageQueue: {
            enabled: true,
            maxSize: 1000,
        },
    };
    return createOptimalWebSocketClient(config, { useEnhanced: options?.useEnhanced });
}
/**
 * Default WebSocket client configurations for common use cases.
 */
export const WebSocketClientPresets = {
    /**
     * High-performance configuration for low-latency applications.
     *
     * @param url
     */
    HighPerformance: (url) => ({
        name: 'high-performance-ws',
        baseURL: url,
        url,
        timeout: 5000,
        reconnection: {
            enabled: true,
            maxAttempts: 5,
            initialDelay: 100,
            maxDelay: 1000,
            backoff: 'exponential',
        },
        heartbeat: {
            enabled: true,
            interval: 10000,
            timeout: 2000,
            message: { type: 'ping' },
        },
        messageQueue: {
            enabled: true,
            maxSize: 100,
            drainOnReconnect: true,
        },
        compression: {
            enabled: true,
            method: 'deflate',
            level: 6,
            threshold: 1024,
        },
    }),
    /**
     * Robust configuration for unreliable networks.
     *
     * @param url
     */
    Robust: (url) => ({
        name: 'robust-ws',
        baseURL: url,
        url,
        timeout: 60000,
        reconnection: {
            enabled: true,
            maxAttempts: 50,
            initialDelay: 2000,
            maxDelay: 60000,
            backoff: 'exponential',
            jitter: true,
        },
        heartbeat: {
            enabled: true,
            interval: 45000,
            timeout: 10000,
            message: { type: 'heartbeat' },
        },
        messageQueue: {
            enabled: true,
            maxSize: 10000,
            persistOnDisconnect: true,
            drainOnReconnect: true,
        },
        retry: {
            attempts: 10,
            delay: 1000,
            backoff: 'exponential',
            maxDelay: 30000,
        },
    }),
    /**
     * Minimal configuration for simple applications.
     *
     * @param url
     */
    Simple: (url) => ({
        name: 'simple-ws',
        baseURL: url,
        url,
        timeout: 30000,
        reconnection: {
            enabled: true,
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 5000,
            backoff: 'linear',
        },
        heartbeat: {
            enabled: false,
        },
        messageQueue: {
            enabled: false,
        },
    }),
    /**
     * Secure configuration with authentication.
     *
     * @param url
     * @param token
     */
    Secure: (url, token) => ({
        name: 'secure-ws',
        baseURL: url,
        url,
        timeout: 30000,
        authentication: {
            type: 'bearer',
            method: 'header',
            token,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        reconnection: {
            enabled: true,
            maxAttempts: 10,
            initialDelay: 1000,
            maxDelay: 30000,
            backoff: 'exponential',
        },
        heartbeat: {
            enabled: true,
            interval: 30000,
            message: { type: 'auth-ping', token },
        },
        messageQueue: {
            enabled: true,
            maxSize: 1000,
        },
    }),
};
/**
 * WebSocket client health monitor utility.
 *
 * @example
 */
export class WebSocketHealthMonitor {
    clients = new Map();
    intervals = new Map();
    /**
     * Add client to monitoring.
     *
     * @param name
     * @param client
     * @param checkInterval
     */
    addClient(name, client, checkInterval = 60000) {
        this.clients.set(name, client);
        const interval = setInterval(async () => {
            try {
                const status = await client.healthCheck();
                if (status.status === 'unhealthy') {
                    logger.warn(`WebSocket client ${name} is unhealthy:`, status.metadata);
                }
            }
            catch (error) {
                logger.error(`WebSocket health check failed for ${name}:`, error);
            }
        }, checkInterval);
        this.intervals.set(name, interval);
    }
    /**
     * Remove client from monitoring.
     *
     * @param name
     */
    removeClient(name) {
        const interval = this.intervals.get(name);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(name);
        }
        this.clients.delete(name);
    }
    /**
     * Get health status for all monitored clients.
     */
    async getHealthStatus() {
        const results = new Map();
        for (const [name, client] of this.clients) {
            try {
                const status = await client.healthCheck();
                results?.set(name, status);
            }
            catch (error) {
                results?.set(name, {
                    name,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    responseTime: -1,
                    errorRate: 1,
                    uptime: 0,
                    metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        }
        return results;
    }
    /**
     * Stop monitoring all clients.
     */
    stopAll() {
        for (const interval of this.intervals.values()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        this.clients.clear();
    }
}
export default {
    WebSocketClientAdapter,
    EnhancedWebSocketClient,
    WebSocketClientFactory,
    LoadBalancedWebSocketClient,
    FailoverWebSocketClient,
    createOptimalWebSocketClient,
    createSimpleWebSocketClient,
    WebSocketClientPresets,
    WebSocketHealthMonitor,
};
