import { getLogger } from '../../config/logging-config.ts';
import { globalClientManager as actualGlobalClientManager, ClientManagerHelpers, } from './manager.ts';
import { ClientType, } from './registry.ts';
export { FACTIntegration } from '../../knowledge/knowledge-client.ts';
export { APIClient, createAPIClient } from '../api/http/client.ts';
export { WebSocketClient } from '../api/websocket/client.ts';
export { ExternalMCPClient } from '../mcp/external-mcp-client.ts';
export { createCustomKnowledgeClient, createFACTClient, KnowledgeClientAdapter, KnowledgeClientFactory, KnowledgeHelpers, } from './adapters/knowledge-client-adapter.ts';
export * from './adapters/websocket-index.ts';
export const globalClientManager = actualGlobalClientManager;
export { ClientRegistry, ClientRegistryHelpers, ClientType, globalClientRegistry, } from './registry.ts';
export class UACL {
    static instance;
    initialized = false;
    constructor() { }
    static getInstance() {
        if (!UACL.instance) {
            UACL.instance = new UACL();
        }
        return UACL.instance;
    }
    async initialize(config) {
        if (this.initialized) {
            return;
        }
        await ClientManagerHelpers.initialize(config);
        this.initialized = true;
    }
    isInitialized() {
        return this.initialized;
    }
    async createHTTPClient(id, baseURL, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        return ClientManagerHelpers.createHTTPClient(id, baseURL, options);
    }
    async createWebSocketClient(id, url, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        return ClientManagerHelpers.createWebSocketClient(id, url, options);
    }
    async createKnowledgeClient(id, factRepoPath, anthropicApiKey, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        return ClientManagerHelpers.createKnowledgeClient(id, factRepoPath, anthropicApiKey, options);
    }
    async createMCPClient(id, servers, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        return ClientManagerHelpers.createMCPClient(id, servers, options);
    }
    getClient(clientId) {
        return globalClientManager.getClient(clientId);
    }
    getBestClient(type) {
        return globalClientManager.getBestClient(type);
    }
    getClientsByType(type) {
        return globalClientManager.getClientsByType(type);
    }
    getHealthStatus() {
        return globalClientManager.getHealthStatus();
    }
    getMetrics() {
        return globalClientManager.getAggregatedMetrics();
    }
    getSystemStatus() {
        return ClientManagerHelpers.getSystemStatus();
    }
    async connectAll() {
        const allClients = globalClientManager.registry.getAll();
        const connectionPromises = allClients
            .filter((client) => client.config.enabled)
            .map((client) => globalClientManager.connectClient(client.id));
        await Promise.allSettled(connectionPromises);
    }
    async disconnectAll() {
        const allClients = globalClientManager.registry.getAll();
        const disconnectionPromises = allClients.map((client) => globalClientManager.disconnectClient(client.id));
        await Promise.allSettled(disconnectionPromises);
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        await globalClientManager.shutdown();
        this.initialized = false;
    }
}
export const uacl = UACL.getInstance();
export const initializeUACL = async (config) => {
    await uacl.initialize(config);
};
export const UACLHelpers = {
    async setupCommonClients(config) {
        await uacl.initialize();
        const clients = {};
        try {
            if (config?.httpBaseURL) {
                clients.http = await uacl.createHTTPClient('default-http', config?.httpBaseURL);
            }
            if (config?.websocketURL) {
                clients.websocket = await uacl.createWebSocketClient('default-websocket', config?.websocketURL);
            }
            if (config?.factRepoPath && config?.anthropicApiKey) {
                clients.knowledge = await uacl.createKnowledgeClient('default-knowledge', config?.factRepoPath, config?.anthropicApiKey);
            }
            if (config?.mcpServers) {
                clients.mcp = await uacl.createMCPClient('default-mcp', config?.mcpServers);
            }
            await uacl.connectAll();
            return clients;
        }
        catch (error) {
            const logger = getLogger('uacl-setup');
            logger.error('Failed to setup common clients', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                config: {
                    httpBaseURL: config?.httpBaseURL,
                    websocketURL: config?.websocketURL,
                    factRepoPath: config?.factRepoPath,
                    hasMCPServers: !!config?.mcpServers,
                },
            });
            throw error;
        }
    },
    getQuickStatus() {
        if (!uacl.isInitialized()) {
            return {
                initialized: false,
                totalClients: 0,
                healthyClients: 0,
                healthPercentage: 0,
                status: 'critical',
            };
        }
        const metrics = uacl.getMetrics();
        const healthPercentage = metrics.total > 0 ? (metrics.connected / metrics.total) * 100 : 100;
        const status = healthPercentage >= 80
            ? 'healthy'
            : healthPercentage >= 50
                ? 'warning'
                : 'critical';
        return {
            initialized: true,
            totalClients: metrics.total,
            healthyClients: metrics.connected,
            healthPercentage,
            status,
        };
    },
    async performHealthCheck() {
        const allClients = uacl
            .getClientsByType(ClientType.HTTP)
            .concat(uacl.getClientsByType(ClientType.WEBSOCKET))
            .concat(uacl.getClientsByType(ClientType.KNOWLEDGE))
            .concat(uacl.getClientsByType(ClientType.MCP));
        const healthChecks = allClients.map(async (client) => {
            try {
                const isHealthy = client.status === 'connected';
                return { [client.id]: isHealthy };
            }
            catch {
                return { [client.id]: false };
            }
        });
        const results = await Promise.allSettled(healthChecks);
        return results?.reduce((acc, result) => {
            if (result?.status === 'fulfilled') {
                Object.assign(acc, result?.value);
            }
            return acc;
        }, {});
    },
};
export * from './compatibility.ts';
export { printValidationReport, UACLValidator, validateUACL, } from './validation.ts';
export default uacl;
//# sourceMappingURL=index.js.map