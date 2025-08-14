import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-clients-adapters-websocket-index');
export { EnhancedWebSocketClient, WebSocketClient, } from './enhanced-websocket-client.ts';
export { createWebSocketClient, WebSocketClientAdapter, WebSocketClientFactory as WebSocketAdapterFactory, } from './websocket-client-adapter.ts';
export { createWebSocketClientFactory, createWebSocketClientWithConfig, FailoverWebSocketClient, LoadBalancedWebSocketClient, WebSocketClientFactory, } from './websocket-client-factory.ts';
import { FailoverWebSocketClient, LoadBalancedWebSocketClient, WebSocketClientFactory, } from './websocket-client-factory.ts';
export { WebSocketAuthMethod, WebSocketCloseCode, WebSocketMessageType, WebSocketReadyState, WebSocketTypeGuards, WebSocketUtils, } from './websocket-types.ts';
export async function createOptimalWebSocketClient(config, options) {
    const factory = new WebSocketClientFactory();
    if (options?.loadBalancing?.enabled && options?.loadBalancing?.urls) {
        const configs = options?.loadBalancing?.urls?.map((url) => ({
            ...config,
            url,
            name: `${config?.name || 'ws'}-${url.split('://')[1]?.replace(/[:.]/g, '-')}`,
        }));
        return factory.createLoadBalanced(configs, options?.loadBalancing?.strategy);
    }
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
    if (options?.pooling?.enabled) {
        const pooledClients = await factory.createPooled(config, options?.pooling.size);
        return new LoadBalancedWebSocketClient(pooledClients, 'round-robin');
    }
    if (options?.useEnhanced) {
        config.metadata = { ...config?.metadata, clientType: 'enhanced' };
    }
    return factory.create(config);
}
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
    return createOptimalWebSocketClient(config, {
        useEnhanced: options?.useEnhanced,
    });
}
export const WebSocketClientPresets = {
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
export class WebSocketHealthMonitor {
    clients = new Map();
    intervals = new Map();
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
    removeClient(name) {
        const interval = this.intervals.get(name);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(name);
        }
        this.clients.delete(name);
    }
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
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                });
            }
        }
        return results;
    }
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
//# sourceMappingURL=websocket-index.js.map