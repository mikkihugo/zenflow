import { getMCPServerURL } from '../../../config/index.ts';
import { HTTPClientAdapter } from '../adapters/http-client-adapter.ts';
export const DEFAULT_CLIENT_CONFIG = {
    baseURL: getMCPServerURL(),
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
};
export class APIClient {
    httpClient;
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
        this.httpClient = this.createHTTPClient();
    }
    createHTTPClient() {
        const uaclConfig = {
            name: 'api-client',
            baseURL: this.config.baseURL,
            timeout: this.config.timeout ?? undefined,
            headers: this.config.headers ?? undefined,
            authentication: this.createAuthConfig(),
            retry: {
                attempts: this.config.retryAttempts || 3,
                delay: this.config.retryDelay || 1000,
                backoff: 'exponential',
                retryStatusCodes: [408, 429, 500, 502, 503, 504],
            },
            monitoring: {
                enabled: true,
                metricsInterval: 60000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
            },
            health: {
                endpoint: '/health',
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 2,
            },
        };
        return new HTTPClientAdapter(uaclConfig);
    }
    createAuthConfig() {
        if (this.config.bearerToken) {
            return {
                type: 'bearer',
                token: this.config.bearerToken,
            };
        }
        if (this.config.apiKey) {
            return {
                type: 'apikey',
                apiKey: this.config.apiKey,
                apiKeyHeader: 'X-API-Key',
            };
        }
        return undefined;
    }
    async request(method, endpoint, data, options) {
        const uaclOptions = {
            timeout: options?.timeout ?? undefined,
            headers: options?.headers ?? undefined,
            retries: options?.retries ?? undefined,
        };
        let response;
        switch (method) {
            case 'GET':
                response = await this.httpClient.get(endpoint, uaclOptions);
                break;
            case 'POST':
                response = await this.httpClient.post(endpoint, data, uaclOptions);
                break;
            case 'PUT':
                response = await this.httpClient.put(endpoint, data, uaclOptions);
                break;
            case 'DELETE':
                response = await this.httpClient.delete(endpoint, uaclOptions);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
        return response?.data;
    }
    coordination = {
        listAgents: async (params, options) => {
            const queryParams = new URLSearchParams();
            if (params?.status)
                queryParams?.set('status', params?.status);
            if (params?.type)
                queryParams?.set('type', params?.type);
            if (params?.limit)
                queryParams?.set('limit', params?.limit.toString());
            if (params?.offset)
                queryParams?.set('offset', params?.offset.toString());
            return this.request('GET', `/api/v1/coordination/agents?${queryParams}`, undefined, options);
        },
        createAgent: async (data, options) => {
            return this.request('POST', '/api/v1/coordination/agents', data, options);
        },
        getAgent: async (agentId, options) => {
            return this.request('GET', `/api/v1/coordination/agents/${agentId}`, undefined, options);
        },
        removeAgent: async (agentId, options) => {
            return this.request('DELETE', `/api/v1/coordination/agents/${agentId}`, undefined, options);
        },
        createTask: async (data, options) => {
            return this.request('POST', '/api/v1/coordination/tasks', data, options);
        },
        getTask: async (taskId, options) => {
            return this.request('GET', `/api/v1/coordination/tasks/${taskId}`, undefined, options);
        },
        getSwarmConfig: async (options) => {
            return this.request('GET', '/api/v1/coordination/swarm/config', undefined, options);
        },
        updateSwarmConfig: async (config, options) => {
            return this.request('PUT', '/api/v1/coordination/swarm/config', config, options);
        },
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/coordination/health', undefined, options);
        },
        getMetrics: async (timeRange, options) => {
            const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
            return this.request('GET', `/api/v1/coordination/metrics${queryParams}`, undefined, options);
        },
    };
    neural = {
        listNetworks: async (params, options) => {
            const queryParams = new URLSearchParams();
            if (params?.type)
                queryParams?.set('type', params?.type);
            if (params?.status)
                queryParams?.set('status', params?.status);
            return this.request('GET', `/api/v1/neural/networks?${queryParams}`, undefined, options);
        },
        createNetwork: async (data, options) => {
            return this.request('POST', '/api/v1/neural/networks', data, options);
        },
        getNetwork: async (networkId, options) => {
            return this.request('GET', `/api/v1/neural/networks/${networkId}`, undefined, options);
        },
        trainNetwork: async (networkId, data, options) => {
            return this.request('POST', `/api/v1/neural/networks/${networkId}/train`, data, options);
        },
        predict: async (networkId, data, options) => {
            return this.request('POST', `/api/v1/neural/networks/${networkId}/predict`, data, options);
        },
        getTrainingStatus: async (networkId, trainingId, options) => {
            return this.request('GET', `/api/v1/neural/networks/${networkId}/training/${trainingId}`, undefined, options);
        },
        cancelTraining: async (networkId, trainingId, options) => {
            return this.request('DELETE', `/api/v1/neural/networks/${networkId}/training/${trainingId}`, undefined, options);
        },
    };
    memory = {
        listStores: async (options) => {
            return this.request('GET', '/api/v1/memory/stores', undefined, options);
        },
        get: async (storeId, key, options) => {
            return this.request('GET', `/api/v1/memory/stores/${storeId}/keys/${key}`, undefined, options);
        },
        set: async (storeId, key, data, options) => {
            return this.request('PUT', `/api/v1/memory/stores/${storeId}/keys/${key}`, data, options);
        },
        delete: async (storeId, key, options) => {
            return this.request('DELETE', `/api/v1/memory/stores/${storeId}/keys/${key}`, undefined, options);
        },
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/memory/health', undefined, options);
        },
    };
    database = {
        listConnections: async (options) => {
            return this.request('GET', '/api/v1/database/connections', undefined, options);
        },
        vectorSearch: async (collection, data, options) => {
            return this.request('POST', `/api/v1/database/vector/collections/${collection}/search`, data, options);
        },
        graphQuery: async (data, options) => {
            return this.request('POST', '/api/v1/database/graph/query', data, options);
        },
        sqlQuery: async (data, options) => {
            return this.request('POST', '/api/v1/database/sql/query', data, options);
        },
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/database/health', undefined, options);
        },
    };
    system = {
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/system/health', undefined, options);
        },
        getMetrics: async (options) => {
            return this.request('GET', '/api/v1/system/metrics', undefined, options);
        },
    };
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.httpClient = this.createHTTPClient();
    }
    getConfig() {
        return { ...this.config };
    }
    async ping(options) {
        try {
            await this.request('GET', '/health', undefined, options);
            return true;
        }
        catch {
            return false;
        }
    }
    async getClientStatus() {
        return this.httpClient.healthCheck();
    }
    async getClientMetrics() {
        return this.httpClient.getMetrics();
    }
    async connect() {
        return this.httpClient.connect();
    }
    async disconnect() {
        return this.httpClient.disconnect();
    }
    isConnected() {
        return this.httpClient.isConnected();
    }
    getUACLClient() {
        return this.httpClient;
    }
    async destroy() {
        return this.httpClient.destroy();
    }
}
export const createAPIClient = (config) => {
    return new APIClient(config);
};
export const apiClient = createAPIClient();
//# sourceMappingURL=api-client-wrapper.js.map