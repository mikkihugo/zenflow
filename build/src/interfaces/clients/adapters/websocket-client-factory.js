/**
 * @file Interface implementation: websocket-client-factory.
 */
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-clients-adapters-websocket-client-factory');
import { EnhancedWebSocketClient } from './enhanced-websocket-client.ts';
import { WebSocketClientAdapter } from './websocket-client-adapter.ts';
/**
 * WebSocket Client Factory implementing UACL IClientFactory interface.
 *
 * @example
 */
export class WebSocketClientFactory {
    clients = new Map();
    clientConfigs = new Map();
    connectionPool = new Map();
    /**
     * Create new WebSocket client instance.
     *
     * @param config
     */
    async create(config) {
        // Validate configuration
        if (!this.validateConfig(config)) {
            throw new Error('Invalid WebSocket client configuration');
        }
        // Create client based on configuration preference
        let client;
        if (config?.metadata?.['clientType'] === 'enhanced') {
            // Use enhanced client with backward compatibility
            client = new EnhancedWebSocketClient(config);
        }
        else {
            // Use pure UACL adapter
            client = new WebSocketClientAdapter(config);
        }
        // Initialize connection
        await client.connect();
        // Register client
        const clientName = config?.name || this.generateClientName(config);
        this.clients.set(clientName, client);
        this.clientConfigs.set(clientName, config);
        // Set up cleanup on disconnect
        client.on('disconnect', () => {
            this.clients.delete(clientName);
            this.clientConfigs.delete(clientName);
            this.connectionPool.delete(clientName);
        });
        return client;
    }
    /**
     * Create multiple WebSocket clients.
     *
     * @param configs
     */
    async createMultiple(configs) {
        const creationPromises = configs.map((config) => this.create(config));
        return Promise.all(creationPromises);
    }
    /**
     * Get cached client by name.
     *
     * @param name
     */
    get(name) {
        return this.clients.get(name);
    }
    /**
     * List all active clients.
     */
    list() {
        return Array.from(this.clients.values());
    }
    /**
     * Check if client exists.
     *
     * @param name
     */
    has(name) {
        return this.clients.has(name);
    }
    /**
     * Remove and disconnect client.
     *
     * @param name
     */
    async remove(name) {
        const client = this.clients.get(name);
        if (client) {
            try {
                await client.destroy();
            }
            catch (error) {
                logger.warn(`Error destroying WebSocket client ${name}:`, error);
            }
            this.clients.delete(name);
            this.clientConfigs.delete(name);
            this.connectionPool.delete(name);
            return true;
        }
        return false;
    }
    /**
     * Health check all clients.
     */
    async healthCheckAll() {
        const results = new Map();
        const healthCheckPromises = Array.from(this.clients.entries()).map(async ([name, client]) => {
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
        });
        await Promise.allSettled(healthCheckPromises);
        return results;
    }
    /**
     * Get metrics for all clients.
     */
    async getMetricsAll() {
        const results = new Map();
        const metricsPromises = Array.from(this.clients.entries()).map(async ([name, client]) => {
            try {
                const metrics = await client.getMetrics();
                results?.set(name, metrics);
            }
            catch (error) {
                results?.set(name, {
                    name,
                    requestCount: 0,
                    successCount: 0,
                    errorCount: 1,
                    averageLatency: -1,
                    p95Latency: -1,
                    p99Latency: -1,
                    throughput: 0,
                    timestamp: new Date(),
                });
            }
        });
        await Promise.allSettled(metricsPromises);
        return results;
    }
    /**
     * Shutdown all clients.
     */
    async shutdown() {
        const shutdownPromises = Array.from(this.clients.values()).map((client) => client.destroy().catch((error) => {
            logger.error('Error shutting down WebSocket client:', error);
        }));
        await Promise.allSettled(shutdownPromises);
        this.clients.clear();
        this.clientConfigs.clear();
        this.connectionPool.clear();
    }
    /**
     * Get active client count.
     */
    getActiveCount() {
        return this.clients.size;
    }
    /**
     * Validate WebSocket client configuration.
     *
     * @param config
     */
    validateConfig(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }
        // Validate required fields
        if (!config?.url || typeof config?.url !== 'string') {
            return false;
        }
        // Validate URL format
        try {
            const url = new URL(config?.url);
            if (!['ws:', 'wss:'].includes(url.protocol)) {
                return false;
            }
        }
        catch {
            return false;
        }
        // Validate optional configurations
        if (config?.timeout && (typeof config?.timeout !== 'number' || config?.timeout < 0)) {
            return false;
        }
        if (config?.reconnection) {
            const reconnect = config?.reconnection;
            if (typeof reconnect.enabled !== 'boolean' ||
                (reconnect.maxAttempts && typeof reconnect.maxAttempts !== 'number') ||
                (reconnect.initialDelay && typeof reconnect.initialDelay !== 'number')) {
                return false;
            }
        }
        if (config?.heartbeat) {
            const heartbeat = config?.heartbeat;
            if (typeof heartbeat.enabled !== 'boolean' ||
                (heartbeat.interval && typeof heartbeat.interval !== 'number')) {
                return false;
            }
        }
        return true;
    }
    // =============================================================================
    // WebSocket-Specific Factory Methods
    // =============================================================================
    /**
     * Create WebSocket client with connection pooling.
     *
     * @param config
     * @param poolSize
     */
    async createPooled(config, poolSize = 5) {
        const clients = [];
        for (let i = 0; i < poolSize; i++) {
            const pooledConfig = {
                ...config,
                name: `${config?.name || 'ws-client'}-pool-${i}`,
            };
            const client = await this.create(pooledConfig);
            clients.push(client);
        }
        return clients;
    }
    /**
     * Create WebSocket client with load balancing.
     *
     * @param configs
     * @param strategy
     */
    async createLoadBalanced(configs, strategy = 'round-robin') {
        const clients = await this.createMultiple(configs);
        return new LoadBalancedWebSocketClient(clients, strategy);
    }
    /**
     * Create WebSocket client with failover support.
     *
     * @param primaryConfig
     * @param fallbackConfigs
     */
    async createFailover(primaryConfig, fallbackConfigs) {
        const primaryClient = await this.create(primaryConfig);
        const fallbackClients = await this.createMultiple(fallbackConfigs);
        return new FailoverWebSocketClient(primaryClient, fallbackClients);
    }
    /**
     * Get WebSocket-specific metrics for all clients.
     */
    async getWebSocketMetricsAll() {
        const results = new Map();
        for (const [name, client] of this.clients) {
            try {
                // Check if client supports WebSocket-specific metrics
                if (client instanceof EnhancedWebSocketClient) {
                    const wsMetrics = await client.getWebSocketMetrics();
                    results?.set(name, wsMetrics);
                }
                else if (client instanceof WebSocketClientAdapter) {
                    // Convert standard metrics to WebSocket format
                    const metrics = await client.getMetrics();
                    const wsMetrics = {
                        connectionsOpened: 1,
                        connectionsClosed: 0,
                        connectionsActive: client.isConnected() ? 1 : 0,
                        connectionDuration: Date.now() - metrics.timestamp.getTime(),
                        messagesSent: metrics.successCount,
                        messagesReceived: metrics.requestCount - metrics.successCount,
                        messagesSentPerSecond: metrics.throughput,
                        messagesReceivedPerSecond: 0,
                        bytesSent: 0,
                        bytesReceived: 0,
                        bytesSentPerSecond: 0,
                        bytesReceivedPerSecond: 0,
                        averageLatency: metrics.averageLatency,
                        p95Latency: metrics.p95Latency,
                        p99Latency: metrics.p99Latency,
                        packetLoss: 0,
                        connectionErrors: metrics.errorCount,
                        messageErrors: 0,
                        timeoutErrors: 0,
                        authenticationErrors: 0,
                        messagesQueued: 0,
                        queueSize: 0,
                        queueOverflows: 0,
                        timestamp: new Date(),
                    };
                    results?.set(name, wsMetrics);
                }
            }
            catch (error) {
                logger.warn(`Failed to get WebSocket metrics for ${name}:`, error);
            }
        }
        return results;
    }
    /**
     * Get connection information for all clients.
     */
    getConnectionInfoAll() {
        const results = new Map();
        for (const [name, client] of this.clients) {
            try {
                if (client instanceof EnhancedWebSocketClient) {
                    const connectionInfo = client.getConnectionInfo();
                    results?.set(name, connectionInfo);
                }
            }
            catch (error) {
                logger.warn(`Failed to get connection info for ${name}:`, error);
            }
        }
        return results;
    }
    // =============================================================================
    // Private Helper Methods
    // =============================================================================
    generateClientName(config) {
        const url = new URL(config?.url);
        const host = url.hostname;
        const port = url.port || (url.protocol === 'wss:' ? '443' : '80');
        const timestamp = Date.now();
        return `ws-${host}-${port}-${timestamp}`;
    }
}
/**
 * Load-balanced WebSocket client wrapper.
 *
 * @example
 */
export class LoadBalancedWebSocketClient {
    clients;
    strategy;
    currentIndex = 0;
    requestCount = 0;
    constructor(clients, strategy) {
        this.clients = clients;
        this.strategy = strategy;
        if (clients.length === 0) {
            throw new Error('At least one client is required for load balancing');
        }
    }
    get config() {
        return this.clients[0]?.config;
    }
    get name() {
        return `load-balanced-ws-${this.clients.length}`;
    }
    async connect() {
        await Promise.all(this.clients.map((client) => client.connect()));
    }
    async disconnect() {
        await Promise.all(this.clients.map((client) => client.disconnect()));
    }
    isConnected() {
        return this.clients.some((client) => client.isConnected());
    }
    async healthCheck() {
        const healthChecks = await Promise.allSettled(this.clients.map((client) => client.healthCheck()));
        const healthy = healthChecks.some((check) => check.status === 'fulfilled' && check.value.status === 'healthy');
        return {
            name: this.name,
            status: healthy ? 'healthy' : 'unhealthy',
            lastCheck: new Date(),
            responseTime: 0,
            errorRate: 0,
            uptime: 0,
            metadata: {
                clientCount: this.clients.length,
                healthyClients: healthChecks.filter((check) => check.status === 'fulfilled' && check.value.status === 'healthy').length,
            },
        };
    }
    async getMetrics() {
        const metricsResults = await Promise.allSettled(this.clients.map((client) => client.getMetrics()));
        const successfulMetrics = metricsResults
            ?.filter((result) => result?.status === 'fulfilled')
            .map((result) => result?.value);
        if (successfulMetrics.length === 0) {
            return {
                name: this.name,
                requestCount: 0,
                successCount: 0,
                errorCount: 1,
                averageLatency: -1,
                p95Latency: -1,
                p99Latency: -1,
                throughput: 0,
                timestamp: new Date(),
            };
        }
        // Aggregate metrics
        const totalRequests = successfulMetrics.reduce((sum, m) => sum + m.requestCount, 0);
        const totalSuccess = successfulMetrics.reduce((sum, m) => sum + m.successCount, 0);
        const totalErrors = successfulMetrics.reduce((sum, m) => sum + m.errorCount, 0);
        const avgLatency = successfulMetrics.reduce((sum, m) => sum + m.averageLatency, 0) / successfulMetrics.length;
        const totalThroughput = successfulMetrics.reduce((sum, m) => sum + m.throughput, 0);
        return {
            name: this.name,
            requestCount: totalRequests,
            successCount: totalSuccess,
            errorCount: totalErrors,
            averageLatency: avgLatency,
            p95Latency: Math.max(...successfulMetrics.map((m) => m.p95Latency)),
            p99Latency: Math.max(...successfulMetrics.map((m) => m.p99Latency)),
            throughput: totalThroughput,
            timestamp: new Date(),
        };
    }
    async get(endpoint, options) {
        const client = this.selectClient();
        return client.get(endpoint, options);
    }
    async post(endpoint, data, options) {
        const client = this.selectClient();
        return client.post(endpoint, data, options);
    }
    async put(endpoint, data, options) {
        const client = this.selectClient();
        return client.put(endpoint, data, options);
    }
    async delete(endpoint, options) {
        const client = this.selectClient();
        return client.delete(endpoint, options);
    }
    updateConfig(config) {
        this.clients.forEach((client) => client.updateConfig(config));
    }
    on(event, handler) {
        this.clients.forEach((client) => client.on(event, handler));
    }
    off(event, handler) {
        this.clients.forEach((client) => client.off(event, handler));
    }
    async destroy() {
        await Promise.all(this.clients.map((client) => client.destroy()));
    }
    selectClient() {
        switch (this.strategy) {
            case 'round-robin': {
                const client = this.clients[this.currentIndex];
                this.currentIndex = (this.currentIndex + 1) % this.clients.length;
                return client;
            }
            case 'random': {
                const randomIndex = Math.floor(Math.random() * this.clients.length);
                return this.clients[randomIndex];
            }
            case 'least-connections':
                // Simple implementation - could be enhanced with actual connection tracking
                return this.clients[0];
            default:
                return this.clients[0];
        }
    }
}
/**
 * Failover WebSocket client wrapper.
 *
 * @example
 */
export class FailoverWebSocketClient {
    primaryClient;
    fallbackClients;
    currentClient;
    fallbackIndex = 0;
    constructor(primaryClient, fallbackClients) {
        this.primaryClient = primaryClient;
        this.fallbackClients = fallbackClients;
        this.currentClient = primaryClient;
        // Set up failover on primary client disconnect
        primaryClient.on('disconnect', () => {
            this.failover();
        });
    }
    get config() {
        return this.currentClient.config;
    }
    get name() {
        return `failover-ws-${this.fallbackClients.length + 1}`;
    }
    async connect() {
        return this.currentClient.connect();
    }
    async disconnect() {
        return this.currentClient.disconnect();
    }
    isConnected() {
        return this.currentClient.isConnected();
    }
    async healthCheck() {
        return this.currentClient.healthCheck();
    }
    async getMetrics() {
        return this.currentClient.getMetrics();
    }
    async get(endpoint, options) {
        return this.currentClient.get(endpoint, options);
    }
    async post(endpoint, data, options) {
        return this.currentClient.post(endpoint, data, options);
    }
    async put(endpoint, data, options) {
        return this.currentClient.put(endpoint, data, options);
    }
    async delete(endpoint, options) {
        return this.currentClient.delete(endpoint, options);
    }
    updateConfig(config) {
        this.currentClient.updateConfig(config);
    }
    on(event, handler) {
        this.currentClient.on(event, handler);
    }
    off(event, handler) {
        this.currentClient.off(event, handler);
    }
    async destroy() {
        await this.currentClient.destroy();
        await Promise.all(this.fallbackClients.map((client) => client.destroy()));
    }
    async failover() {
        if (this.fallbackIndex < this.fallbackClients.length) {
            logger.info(`Failing over to client ${this.fallbackIndex}`);
            this.currentClient = this.fallbackClients[this.fallbackIndex];
            this.fallbackIndex++;
            try {
                await this.currentClient.connect();
            }
            catch (error) {
                logger.error('Failover client failed to connect:', error);
                this.failover(); // Try next fallback
            }
        }
        else {
            logger.error('All fallback clients exhausted');
        }
    }
}
// Convenience factory functions
export async function createWebSocketClientFactory() {
    return new WebSocketClientFactory();
}
export async function createWebSocketClientWithConfig(config) {
    const factory = new WebSocketClientFactory();
    return factory.create(config);
}
export default WebSocketClientFactory;
