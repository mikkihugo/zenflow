import { EventEmitter } from 'node:events';
import { createAPIClient } from '../api/http/client.ts';
import { WebSocketClient } from '../api/websocket/client.ts';
import { FACTIntegration } from '../knowledge/knowledge-client';
import { ExternalMCPClient } from '../mcp/external-mcp-client.ts';
import { ClientRegistry, ClientType, } from './registry.ts';
class HTTPClientFactory {
    async create(config) {
        if (config?.type !== ClientType.HTTP) {
            throw new Error('Invalid client type for HTTP factory');
        }
        const httpConfig = config;
        const apiClient = createAPIClient({
            baseURL: httpConfig?.baseURL,
            timeout: httpConfig?.timeout,
            apiKey: httpConfig?.apiKey,
            bearerToken: httpConfig?.bearerToken,
            headers: httpConfig?.headers,
            retryAttempts: httpConfig?.retryAttempts,
        });
        return {
            id: config?.id,
            type: ClientType.HTTP,
            config,
            client: apiClient,
            status: 'initialized',
            metrics: this.createInitialMetrics(),
        };
    }
    validate(config) {
        if (config?.type !== ClientType.HTTP)
            return false;
        const httpConfig = config;
        return !!(httpConfig?.baseURL && httpConfig?.id);
    }
    getDefaultConfig(type) {
        if (type !== ClientType.HTTP)
            return {};
        return {
            enabled: true,
            priority: 5,
            timeout: 30000,
            retryAttempts: 3,
            healthCheckInterval: 30000,
        };
    }
    createInitialMetrics() {
        return {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                avgLatency: 0,
                minLatency: 0,
                maxLatency: 0,
            },
            connections: {
                attempts: 0,
                successful: 0,
                failed: 0,
                currentStatus: 'initialized',
            },
            health: {
                lastCheck: new Date(),
                checksTotal: 0,
                checksSuccessful: 0,
                uptime: 0,
                downtimeTotal: 0,
            },
            errors: { total: 0, byType: {}, recent: [] },
        };
    }
}
class WebSocketClientFactory {
    async create(config) {
        if (config?.type !== ClientType.WEBSOCKET) {
            throw new Error('Invalid client type for WebSocket factory');
        }
        const wsConfig = config;
        const wsClient = new WebSocketClient(wsConfig?.url, {
            reconnect: wsConfig?.reconnect,
            reconnectInterval: wsConfig?.reconnectInterval,
            maxReconnectAttempts: wsConfig?.maxReconnectAttempts,
            timeout: wsConfig?.timeout,
        });
        return {
            id: config?.id,
            type: ClientType.WEBSOCKET,
            config,
            client: wsClient,
            status: 'initialized',
            metrics: this.createInitialMetrics(),
        };
    }
    validate(config) {
        if (config?.type !== ClientType.WEBSOCKET)
            return false;
        const wsConfig = config;
        return !!(wsConfig?.url && wsConfig?.id);
    }
    getDefaultConfig(type) {
        if (type !== ClientType.WEBSOCKET)
            return {};
        return {
            enabled: true,
            priority: 5,
            timeout: 30000,
            reconnect: true,
            reconnectInterval: 1000,
            maxReconnectAttempts: 10,
            healthCheckInterval: 30000,
        };
    }
    createInitialMetrics() {
        return {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                avgLatency: 0,
                minLatency: 0,
                maxLatency: 0,
            },
            connections: {
                attempts: 0,
                successful: 0,
                failed: 0,
                currentStatus: 'initialized',
            },
            health: {
                lastCheck: new Date(),
                checksTotal: 0,
                checksSuccessful: 0,
                uptime: 0,
                downtimeTotal: 0,
            },
            errors: { total: 0, byType: {}, recent: [] },
        };
    }
}
class KnowledgeClientFactory {
    async create(config) {
        if (config?.type !== ClientType.KNOWLEDGE) {
            throw new Error('Invalid client type for Knowledge factory');
        }
        const knowledgeConfig = config;
        const factClient = new FACTIntegration({
            factRepoPath: knowledgeConfig?.factRepoPath,
            anthropicApiKey: knowledgeConfig?.anthropicApiKey,
            pythonPath: knowledgeConfig?.pythonPath,
            enableCache: knowledgeConfig?.enableCache,
            cacheConfig: knowledgeConfig?.cacheConfig,
        });
        return {
            id: config?.id,
            type: ClientType.KNOWLEDGE,
            config,
            client: factClient,
            status: 'initialized',
            metrics: this.createInitialMetrics(),
        };
    }
    validate(config) {
        if (config?.type !== ClientType.KNOWLEDGE)
            return false;
        const knowledgeConfig = config;
        return !!(knowledgeConfig?.factRepoPath &&
            knowledgeConfig?.anthropicApiKey &&
            knowledgeConfig?.id);
    }
    getDefaultConfig(type) {
        if (type !== ClientType.KNOWLEDGE)
            return {};
        return {
            enabled: true,
            priority: 5,
            timeout: 30000,
            pythonPath: 'python3',
            enableCache: true,
            healthCheckInterval: 60000,
        };
    }
    createInitialMetrics() {
        return {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                avgLatency: 0,
                minLatency: 0,
                maxLatency: 0,
            },
            connections: {
                attempts: 0,
                successful: 0,
                failed: 0,
                currentStatus: 'initialized',
            },
            health: {
                lastCheck: new Date(),
                checksTotal: 0,
                checksSuccessful: 0,
                uptime: 0,
                downtimeTotal: 0,
            },
            errors: { total: 0, byType: {}, recent: [] },
        };
    }
}
class MCPClientFactory {
    async create(config) {
        if (config?.type !== ClientType.MCP) {
            throw new Error('Invalid client type for MCP factory');
        }
        const _mcpConfig = config;
        const mcpClient = new ExternalMCPClient();
        return {
            id: config?.id,
            type: ClientType.MCP,
            config,
            client: mcpClient,
            status: 'initialized',
            metrics: this.createInitialMetrics(),
        };
    }
    validate(config) {
        if (config?.type !== ClientType.MCP)
            return false;
        const mcpConfig = config;
        return !!(mcpConfig?.servers &&
            Object.keys(mcpConfig?.servers).length > 0 &&
            mcpConfig?.id);
    }
    getDefaultConfig(type) {
        if (type !== ClientType.MCP)
            return {};
        return {
            enabled: true,
            priority: 5,
            timeout: 30000,
            retryAttempts: 3,
            healthCheckInterval: 30000,
        };
    }
    createInitialMetrics() {
        return {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                avgLatency: 0,
                minLatency: 0,
                maxLatency: 0,
            },
            connections: {
                attempts: 0,
                successful: 0,
                failed: 0,
                currentStatus: 'initialized',
            },
            health: {
                lastCheck: new Date(),
                checksTotal: 0,
                checksSuccessful: 0,
                uptime: 0,
                downtimeTotal: 0,
            },
            errors: { total: 0, byType: {}, recent: [] },
        };
    }
}
export class ClientManager extends EventEmitter {
    registry;
    config;
    metricsStore = new Map();
    reconnectTimers = new Map();
    isInitialized = false;
    constructor(config = {}) {
        super();
        this.config = {
            healthCheckInterval: config?.healthCheckInterval ?? 30000,
            autoReconnect: config?.autoReconnect ?? true,
            maxRetryAttempts: config?.maxRetryAttempts ?? 3,
            retryDelay: config?.retryDelay ?? 1000,
            metricsRetention: config?.metricsRetention ?? 24 * 60 * 60 * 1000,
            enableLogging: config?.enableLogging ?? true,
        };
        this.registry = new ClientRegistry(this.config.healthCheckInterval);
        this.setupEventHandlers();
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        this.registry.registerFactory(ClientType.HTTP, new HTTPClientFactory());
        this.registry.registerFactory(ClientType.WEBSOCKET, new WebSocketClientFactory());
        this.registry.registerFactory(ClientType.KNOWLEDGE, new KnowledgeClientFactory());
        this.registry.registerFactory(ClientType.MCP, new MCPClientFactory());
        this.registry.startHealthMonitoring();
        this.isInitialized = true;
        this.emit('initialized');
        if (this.config.enableLogging) {
        }
    }
    async createClient(config) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const instance = await this.registry.register(config);
        this.metricsStore.set(config?.id, this.createInitialMetrics());
        if (config?.enabled) {
            await this.connectClient(config?.id);
        }
        return instance;
    }
    async connectClient(clientId) {
        const instance = this.registry.get(clientId);
        if (!instance) {
            throw new Error(`Client ${clientId} not found`);
        }
        try {
            const metrics = this.metricsStore.get(clientId);
            metrics.connections.attempts++;
            if (instance.type === ClientType.WEBSOCKET &&
                'connect' in instance.client) {
                await instance.client.connect();
            }
            else if (instance.type === ClientType.KNOWLEDGE &&
                'initialize' in instance.client) {
                await instance.client.initialize();
            }
            else if (instance.type === ClientType.MCP &&
                'connectAll' in instance.client) {
                await instance.client.connectAll();
            }
            metrics.connections.successful++;
            metrics.connections.currentStatus = 'connected';
            this.emit('client:connected', clientId);
            if (this.config.enableLogging) {
            }
            return true;
        }
        catch (error) {
            const metrics = this.metricsStore.get(clientId);
            metrics.connections.failed++;
            metrics.errors.total++;
            metrics.errors.recent.push({
                timestamp: new Date(),
                type: 'connection_error',
                message: error instanceof Error ? error.message : String(error),
            });
            this.emit('client:error', clientId, error);
            if (this.config.autoReconnect) {
                this.scheduleReconnect(clientId);
            }
            return false;
        }
    }
    async disconnectClient(clientId) {
        const instance = this.registry.get(clientId);
        if (!instance) {
            return false;
        }
        try {
            const timer = this.reconnectTimers.get(clientId);
            if (timer) {
                clearTimeout(timer);
                this.reconnectTimers.delete(clientId);
            }
            if (instance.type === ClientType.WEBSOCKET &&
                'disconnect' in instance.client) {
                instance.client.disconnect();
            }
            else if (instance.type === ClientType.KNOWLEDGE &&
                'shutdown' in instance.client) {
                await instance.client.shutdown();
            }
            else if (instance.type === ClientType.MCP &&
                'disconnectAll' in instance.client) {
                await instance.client.disconnectAll();
            }
            const metrics = this.metricsStore.get(clientId);
            if (metrics) {
                metrics.connections.currentStatus = 'disconnected';
            }
            this.emit('client:disconnected', clientId);
            if (this.config.enableLogging) {
            }
            return true;
        }
        catch (error) {
            this.emit('client:error', clientId, error);
            return false;
        }
    }
    async removeClient(clientId) {
        await this.disconnectClient(clientId);
        this.metricsStore.delete(clientId);
        return this.registry.unregister(clientId);
    }
    getClient(clientId) {
        return this.registry.get(clientId);
    }
    getClientsByType(type) {
        return this.registry.getByType(type);
    }
    getBestClient(type) {
        const healthy = this.registry.getHealthy(type);
        if (healthy.length === 0)
            return undefined;
        return healthy.sort((a, b) => b.config.priority - a.config.priority)[0];
    }
    getClientMetrics(clientId) {
        return this.metricsStore.get(clientId);
    }
    getAggregatedMetrics() {
        const stats = this.registry.getStats();
        const allMetrics = Array.from(this.metricsStore.values());
        const totalRequests = allMetrics.reduce((sum, m) => sum + m.requests.total, 0);
        const totalErrors = allMetrics.reduce((sum, m) => sum + m.errors.total, 0);
        const avgLatency = allMetrics.length > 0
            ? allMetrics.reduce((sum, m) => sum + m.requests.avgLatency, 0) /
                allMetrics.length
            : 0;
        const byType = Object.values(ClientType).reduce((acc, type) => {
            const typeClients = this.registry.getByType(type);
            const typeMetrics = typeClients
                .map((c) => this.metricsStore.get(c.id))
                .filter(Boolean);
            acc[type] = {
                total: typeClients.length,
                connected: typeClients.filter((c) => c.status === 'connected').length,
                avgLatency: typeMetrics.length > 0
                    ? typeMetrics.reduce((sum, m) => sum + m.requests.avgLatency, 0) /
                        typeMetrics.length
                    : 0,
            };
            return acc;
        }, {});
        return {
            total: stats.total,
            connected: stats.healthy,
            byType,
            totalRequests,
            totalErrors,
            avgLatency,
        };
    }
    getHealthStatus() {
        const stats = this.registry.getStats();
        const healthyPercentage = stats.total > 0 ? stats.healthy / stats.total : 1;
        const overall = healthyPercentage >= 0.8
            ? 'healthy'
            : healthyPercentage >= 0.5
                ? 'warning'
                : 'critical';
        const details = {};
        for (const type of Object.values(ClientType)) {
            const typeClients = this.getClientsByType(type);
            const healthyType = typeClients.filter((c) => c.status === 'connected').length;
            const totalType = typeClients.length;
            if (totalType === 0) {
                details[type] = { status: 'healthy', message: 'No clients configured' };
            }
            else {
                const typeHealthy = healthyType / totalType;
                details[type] = {
                    status: typeHealthy >= 0.8
                        ? 'healthy'
                        : typeHealthy >= 0.5
                            ? 'warning'
                            : 'critical',
                    message: `${healthyType}/${totalType} clients healthy`,
                };
            }
        }
        return { overall, details };
    }
    scheduleReconnect(clientId) {
        const existingTimer = this.reconnectTimers.get(clientId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const metrics = this.metricsStore.get(clientId);
        if (!metrics)
            return;
        const attempts = metrics.connections.failed;
        if (attempts >= this.config.maxRetryAttempts) {
            if (this.config.enableLogging) {
            }
            return;
        }
        const delay = this.config.retryDelay * 2 ** Math.min(attempts, 5);
        const timer = setTimeout(() => {
            this.reconnectTimers.delete(clientId);
            this.connectClient(clientId);
        }, delay);
        this.reconnectTimers.set(clientId, timer);
        if (this.config.enableLogging) {
        }
    }
    setupEventHandlers() {
        this.registry.on('client:registered', (client) => {
            this.emit('client:registered', client);
        });
        this.registry.on('client:unregistered', (clientId) => {
            this.emit('client:unregistered', clientId);
        });
        this.registry.on('client:status_changed', (clientId, status) => {
            const metrics = this.metricsStore.get(clientId);
            if (metrics) {
                metrics.connections.currentStatus = status;
            }
            this.emit('client:status_changed', clientId, status);
        });
        this.registry.on('client:health_check', (clientId, healthy) => {
            const metrics = this.metricsStore.get(clientId);
            if (metrics) {
                metrics.health.lastCheck = new Date();
                metrics.health.checksTotal++;
                if (healthy) {
                    metrics.health.checksSuccessful++;
                }
            }
            this.emit('client:health_check', clientId, healthy);
        });
        this.registry.on('registry:error', (error) => {
            this.emit('error', error);
        });
    }
    createInitialMetrics() {
        return {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                avgLatency: 0,
                minLatency: 0,
                maxLatency: 0,
            },
            connections: {
                attempts: 0,
                successful: 0,
                failed: 0,
                currentStatus: 'initialized',
            },
            health: {
                lastCheck: new Date(),
                checksTotal: 0,
                checksSuccessful: 0,
                uptime: 0,
                downtimeTotal: 0,
            },
            errors: { total: 0, byType: {}, recent: [] },
        };
    }
    async shutdown() {
        if (this.config.enableLogging) {
        }
        for (const timer of this.reconnectTimers.values()) {
            clearTimeout(timer);
        }
        this.reconnectTimers.clear();
        await this.registry.shutdown();
        this.metricsStore.clear();
        this.isInitialized = false;
        this.emit('shutdown');
        if (this.config.enableLogging) {
        }
    }
}
export const globalClientManager = new ClientManager();
export const ClientManagerHelpers = {
    async initialize(config) {
        if (config) {
        }
        await globalClientManager.initialize();
    },
    async createHTTPClient(id, baseURL, options = {}) {
        return globalClientManager.createClient({
            id,
            type: ClientType.HTTP,
            baseURL,
            enabled: true,
            priority: 5,
            timeout: 30000,
            retryAttempts: 3,
            ...options,
        });
    },
    async createWebSocketClient(id, url, options = {}) {
        return globalClientManager.createClient({
            id,
            type: ClientType.WEBSOCKET,
            url,
            enabled: true,
            priority: 5,
            timeout: 30000,
            reconnect: true,
            reconnectInterval: 1000,
            maxReconnectAttempts: 10,
            ...options,
        });
    },
    async createKnowledgeClient(id, factRepoPath, anthropicApiKey, options = {}) {
        return globalClientManager.createClient({
            id,
            type: ClientType.KNOWLEDGE,
            factRepoPath,
            anthropicApiKey,
            enabled: true,
            priority: 5,
            timeout: 30000,
            pythonPath: 'python3',
            enableCache: true,
            ...options,
        });
    },
    async createMCPClient(id, servers, options = {}) {
        return globalClientManager.createClient({
            id,
            type: ClientType.MCP,
            servers,
            enabled: true,
            priority: 5,
            timeout: 30000,
            retryAttempts: 3,
            ...options,
        });
    },
    getSystemStatus() {
        return {
            health: globalClientManager.getHealthStatus(),
            metrics: globalClientManager.getAggregatedMetrics(),
            clients: globalClientManager.registry.getAll(),
        };
    },
};
export default ClientManager;
//# sourceMappingURL=manager.js.map