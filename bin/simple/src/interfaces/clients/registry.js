import { EventEmitter } from 'node:events';
export var ClientType;
(function (ClientType) {
    ClientType["HTTP"] = "http";
    ClientType["WEBSOCKET"] = "websocket";
    ClientType["KNOWLEDGE"] = "knowledge";
    ClientType["MCP"] = "mcp";
})(ClientType || (ClientType = {}));
export class ClientRegistry extends EventEmitter {
    clients = new Map();
    factories = new Map();
    healthCheckTimer;
    healthCheckInterval;
    constructor(healthCheckInterval = 30000) {
        super();
        this.healthCheckInterval = healthCheckInterval;
        this.setupFactories();
    }
    async register(config) {
        if (!this.validateConfig(config)) {
            throw new Error(`Invalid configuration for client ${config?.id}`);
        }
        if (this.clients.has(config?.id)) {
            throw new Error(`Client with id ${config?.id} already registered`);
        }
        const factory = this.factories.get(config?.type);
        if (!factory) {
            throw new Error(`No factory available for client type ${config?.type}`);
        }
        try {
            const instance = await factory.create(config);
            this.clients.set(config?.id, instance);
            this.emit('client:registered', instance);
            return instance;
        }
        catch (error) {
            this.emit('registry:error', error);
            throw error;
        }
    }
    async unregister(clientId) {
        const instance = this.clients.get(clientId);
        if (!instance) {
            return false;
        }
        try {
            if ('disconnect' in instance.client &&
                typeof instance.client.disconnect === 'function') {
                await instance.client.disconnect();
            }
            if ('shutdown' in instance.client &&
                typeof instance.client.shutdown === 'function') {
                await instance.client.shutdown();
            }
            this.clients.delete(clientId);
            this.emit('client:unregistered', clientId);
            return true;
        }
        catch (error) {
            this.emit('registry:error', error);
            return false;
        }
    }
    get(clientId) {
        return this.clients.get(clientId);
    }
    getByType(type) {
        return Array.from(this.clients.values()).filter((client) => client.type === type);
    }
    getAll(filter) {
        const allClients = Array.from(this.clients.values());
        return filter ? allClients.filter(filter) : allClients;
    }
    getHealthy(type) {
        return this.getAll((client) => {
            const typeMatch = !type || client.type === type;
            const statusMatch = client.status === 'connected';
            return typeMatch && statusMatch;
        });
    }
    getByPriority(type) {
        return this.getAll((client) => !type || client.type === type).sort((a, b) => b.config.priority - a.config.priority);
    }
    isHealthy(clientId) {
        const client = this.clients.get(clientId);
        return client?.status === 'connected';
    }
    getStats() {
        const all = this.getAll();
        const byType = Object.values(ClientType).reduce((acc, type) => {
            acc[type] = this.getByType(type).length;
            return acc;
        }, {});
        const byStatus = all.reduce((acc, client) => {
            acc[client.status] = (acc[client.status] || 0) + 1;
            return acc;
        }, {});
        const healthy = all.filter((c) => c.status === 'connected').length;
        const avgLatency = all.length > 0
            ? all.reduce((sum, c) => sum + c.metrics.avgLatency, 0) / all.length
            : 0;
        return {
            total: all.length,
            byType,
            byStatus,
            healthy,
            avgLatency,
        };
    }
    startHealthMonitoring() {
        if (this.healthCheckTimer) {
            return;
        }
        this.healthCheckTimer = setInterval(() => {
            this.performHealthChecks();
        }, this.healthCheckInterval);
    }
    stopHealthMonitoring() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
        }
    }
    async performHealthChecks() {
        const clients = this.getAll();
        const healthChecks = clients.map(async (client) => {
            try {
                const isHealthy = await this.checkClientHealth(client);
                const newStatus = isHealthy ? 'connected' : 'error';
                if (client.status !== newStatus) {
                    this.emit('client:status_changed', client.id, newStatus);
                }
                this.emit('client:health_check', client.id, isHealthy);
                return { clientId: client.id, healthy: isHealthy };
            }
            catch (error) {
                this.emit('registry:error', error);
                return { clientId: client.id, healthy: false };
            }
        });
        await Promise.allSettled(healthChecks);
    }
    async checkClientHealth(instance) {
        try {
            if ('ping' in instance.client &&
                typeof instance.client.ping === 'function') {
                return await instance.client.ping();
            }
            if (instance.type === ClientType.WEBSOCKET &&
                'connected' in instance.client) {
                return Boolean(instance.client.connected);
            }
            return instance.status !== 'error';
        }
        catch {
            return false;
        }
    }
    validateConfig(config) {
        const factory = this.factories.get(config?.type);
        return factory ? factory.validate(config) : false;
    }
    setupFactories() {
    }
    registerFactory(type, factory) {
        this.factories.set(type, factory);
    }
    async shutdown() {
        this.stopHealthMonitoring();
        const clientIds = Array.from(this.clients.keys());
        const shutdownPromises = clientIds.map((id) => this.unregister(id));
        await Promise.allSettled(shutdownPromises);
        this.clients.clear();
        this.factories.clear();
    }
}
export const globalClientRegistry = new ClientRegistry();
export const ClientRegistryHelpers = {
    async registerHTTPClient(config) {
        return globalClientRegistry.register({ ...config, type: ClientType.HTTP });
    },
    async registerWebSocketClient(config) {
        return globalClientRegistry.register({
            ...config,
            type: ClientType.WEBSOCKET,
        });
    },
    async registerKnowledgeClient(config) {
        return globalClientRegistry.register({
            ...config,
            type: ClientType.KNOWLEDGE,
        });
    },
    async registerMCPClient(config) {
        return globalClientRegistry.register({ ...config, type: ClientType.MCP });
    },
    getBestClient(type) {
        const clients = globalClientRegistry.getByPriority(type);
        return clients.find((client) => client.status === 'connected');
    },
    getLoadBalancedClient(type) {
        const healthy = globalClientRegistry.getHealthy(type);
        if (healthy.length === 0)
            return undefined;
        const index = Math.floor(Math.random() * healthy.length);
        return healthy[index];
    },
};
export default ClientRegistry;
//# sourceMappingURL=registry.js.map