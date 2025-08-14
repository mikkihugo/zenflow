import axios from 'axios';
import { getMCPServerURL } from '../../../config/defaults.ts';
export const DEFAULT_CLIENT_CONFIG = {
    baseURL: getMCPServerURL(),
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
};
export class APIClient {
    http;
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
        this.http = this.createHttpClient();
    }
    createHttpClient() {
        const client = axios.create({
            baseURL: this.config.baseURL,
            ...(this.config.timeout !== undefined && {
                timeout: this.config.timeout,
            }),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...this.config.headers,
            },
        });
        if (this.config.apiKey) {
            client.defaults.headers.common['X-API-Key'] = this.config.apiKey;
        }
        if (this.config.bearerToken) {
            client.defaults.headers.common.Authorization = `Bearer ${this.config.bearerToken}`;
        }
        this.setupRetryLogic(client);
        this.setupErrorHandling(client);
        return client;
    }
    setupRetryLogic(client) {
        client.interceptors.response.use((response) => response, async (error) => {
            const config = error.config;
            if (!config ||
                config?.__retryCount >= (this.config.retryAttempts || 3)) {
                return Promise.reject(error);
            }
            config.__retryCount = (config?.__retryCount || 0) + 1;
            if (error.code === 'ECONNABORTED' ||
                error.code === 'NETWORK_ERROR' ||
                (error.response && error.response.status >= 500)) {
                await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay || 1000));
                return client(config);
            }
            return Promise.reject(error);
        });
    }
    setupErrorHandling(client) {
        client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.data?.error) {
                const apiError = error.response.data;
                const clientError = new Error(apiError.error.message);
                clientError.name = 'APIError';
                clientError.code = apiError.error.code;
                clientError.details = apiError.error.details;
                clientError.traceId = apiError.error.traceId;
                clientError.statusCode = error.response.status;
                throw clientError;
            }
            throw error;
        });
    }
    async request(method, endpoint, data, options) {
        const config = {
            method,
            url: endpoint,
            ...(data !== undefined && { data }),
            ...(options?.timeout !== undefined && { timeout: options.timeout }),
            ...(options?.headers !== undefined && { headers: options.headers }),
        };
        const response = await this.http.request(config);
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
        this.http = this.createHttpClient();
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
}
export const createAPIClient = (config) => {
    return new APIClient(config);
};
export const apiClient = createAPIClient();
//# sourceMappingURL=client.js.map