/**
 * REST API Client SDK.
 *
 * TypeScript client for Claude Code Flow REST API.
 * Auto-generated types from OpenAPI schemas for type safety.
 * Following Google API client library standards.
 *
 * @file TypeScript API client with full type safety.
 */
import axios from 'axios';
import { getMCPServerURL } from '../../../config/defaults.ts';
/**
 * Default client configuration using centralized URL configuration.
 */
export const DEFAULT_CLIENT_CONFIG = {
    baseURL: getMCPServerURL(),
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
};
/**
 * Main API Client Class.
 * Provides typed methods for all API endpoints.
 *
 * @example
 */
export class APIClient {
    http;
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
        this.http = this.createHttpClient();
    }
    /**
     * Create configured Axios instance.
     */
    createHttpClient() {
        const client = axios.create({
            baseURL: this.config.baseURL,
            ...(this.config.timeout !== undefined && { timeout: this.config.timeout }),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...this.config.headers,
            },
        });
        // Add authentication headers
        if (this.config.apiKey) {
            client.defaults.headers.common['X-API-Key'] = this.config.apiKey;
        }
        if (this.config.bearerToken) {
            client.defaults.headers.common.Authorization = `Bearer ${this.config.bearerToken}`;
        }
        // Add retry logic
        this.setupRetryLogic(client);
        // Add error handling
        this.setupErrorHandling(client);
        return client;
    }
    /**
     * Setup retry logic for failed requests.
     *
     * @param client
     */
    setupRetryLogic(client) {
        client.interceptors.response.use((response) => response, async (error) => {
            const config = error.config;
            if (!config || config?.__retryCount >= (this.config.retryAttempts || 3)) {
                return Promise.reject(error);
            }
            config.__retryCount = (config?.__retryCount || 0) + 1;
            // Only retry on network errors or 5xx status codes
            if (error.code === 'ECONNABORTED' ||
                error.code === 'NETWORK_ERROR' ||
                (error.response && error.response.status >= 500)) {
                await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay || 1000));
                return client(config);
            }
            return Promise.reject(error);
        });
    }
    /**
     * Setup error handling and response transformation.
     *
     * @param client
     */
    setupErrorHandling(client) {
        client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.data?.error) {
                // Transform API error format to Error instance
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
    /**
     * Generic HTTP method wrapper with type safety.
     *
     * @param method
     * @param endpoint
     * @param data
     * @param options
     */
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
    // ===== COORDINATION API METHODS =====
    /**
     * Coordination API client.
     */
    coordination = {
        /**
         * List agents with filtering and pagination.
         *
         * @param params
         * @param params.status
         * @param params.type
         * @param params.limit
         * @param params.offset
         * @param options
         */
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
        /**
         * Create new agent.
         *
         * @param data
         * @param data.type
         * @param data.capabilities
         * @param options
         */
        createAgent: async (data, options) => {
            return this.request('POST', '/api/v1/coordination/agents', data, options);
        },
        /**
         * Get agent by ID.
         *
         * @param agentId
         * @param options
         */
        getAgent: async (agentId, options) => {
            return this.request('GET', `/api/v1/coordination/agents/${agentId}`, undefined, options);
        },
        /**
         * Remove agent.
         *
         * @param agentId
         * @param options
         */
        removeAgent: async (agentId, options) => {
            return this.request('DELETE', `/api/v1/coordination/agents/${agentId}`, undefined, options);
        },
        /**
         * Create new task.
         *
         * @param data
         * @param data.type
         * @param data.description
         * @param data.priority
         * @param data.deadline
         * @param options
         */
        createTask: async (data, options) => {
            return this.request('POST', '/api/v1/coordination/tasks', data, options);
        },
        /**
         * Get task by ID.
         *
         * @param taskId
         * @param options
         */
        getTask: async (taskId, options) => {
            return this.request('GET', `/api/v1/coordination/tasks/${taskId}`, undefined, options);
        },
        /**
         * Get swarm configuration.
         *
         * @param options
         */
        getSwarmConfig: async (options) => {
            return this.request('GET', '/api/v1/coordination/swarm/config', undefined, options);
        },
        /**
         * Update swarm configuration.
         *
         * @param config
         * @param options
         */
        updateSwarmConfig: async (config, options) => {
            return this.request('PUT', '/api/v1/coordination/swarm/config', config, options);
        },
        /**
         * Get coordination system health.
         *
         * @param options
         */
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/coordination/health', undefined, options);
        },
        /**
         * Get performance metrics.
         *
         * @param timeRange
         * @param options
         */
        getMetrics: async (timeRange, options) => {
            const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
            return this.request('GET', `/api/v1/coordination/metrics${queryParams}`, undefined, options);
        },
    };
    // ===== NEURAL NETWORK API METHODS =====
    /**
     * Neural Network API client.
     */
    neural = {
        /**
         * List neural networks.
         *
         * @param params
         * @param params.type
         * @param params.status
         * @param options
         */
        listNetworks: async (params, options) => {
            const queryParams = new URLSearchParams();
            if (params?.type)
                queryParams?.set('type', params?.type);
            if (params?.status)
                queryParams?.set('status', params?.status);
            return this.request('GET', `/api/v1/neural/networks?${queryParams}`, undefined, options);
        },
        /**
         * Create neural network.
         *
         * @param data
         * @param data.type
         * @param data.layers
         * @param options
         */
        createNetwork: async (data, options) => {
            return this.request('POST', '/api/v1/neural/networks', data, options);
        },
        /**
         * Get neural network by ID.
         *
         * @param networkId
         * @param options
         */
        getNetwork: async (networkId, options) => {
            return this.request('GET', `/api/v1/neural/networks/${networkId}`, undefined, options);
        },
        /**
         * Start training.
         *
         * @param networkId
         * @param data
         * @param options
         */
        trainNetwork: async (networkId, data, options) => {
            return this.request('POST', `/api/v1/neural/networks/${networkId}/train`, data, options);
        },
        /**
         * Make prediction.
         *
         * @param networkId
         * @param data
         * @param options
         */
        predict: async (networkId, data, options) => {
            return this.request('POST', `/api/v1/neural/networks/${networkId}/predict`, data, options);
        },
        /**
         * Get training job status.
         *
         * @param networkId
         * @param trainingId
         * @param options
         */
        getTrainingStatus: async (networkId, trainingId, options) => {
            return this.request('GET', `/api/v1/neural/networks/${networkId}/training/${trainingId}`, undefined, options);
        },
        /**
         * Cancel training job.
         *
         * @param networkId
         * @param trainingId
         * @param options
         */
        cancelTraining: async (networkId, trainingId, options) => {
            return this.request('DELETE', `/api/v1/neural/networks/${networkId}/training/${trainingId}`, undefined, options);
        },
    };
    // ===== MEMORY API METHODS =====
    /**
     * Memory API client.
     */
    memory = {
        /**
         * List memory stores.
         *
         * @param options
         */
        listStores: async (options) => {
            return this.request('GET', '/api/v1/memory/stores', undefined, options);
        },
        /**
         * Get value by key.
         *
         * @param storeId
         * @param key
         * @param options
         */
        get: async (storeId, key, options) => {
            return this.request('GET', `/api/v1/memory/stores/${storeId}/keys/${key}`, undefined, options);
        },
        /**
         * Set value by key.
         *
         * @param storeId
         * @param key
         * @param data
         * @param data.value
         * @param data.ttl
         * @param data.metadata
         * @param options
         */
        set: async (storeId, key, data, options) => {
            return this.request('PUT', `/api/v1/memory/stores/${storeId}/keys/${key}`, data, options);
        },
        /**
         * Delete key.
         *
         * @param storeId
         * @param key
         * @param options
         */
        delete: async (storeId, key, options) => {
            return this.request('DELETE', `/api/v1/memory/stores/${storeId}/keys/${key}`, undefined, options);
        },
        /**
         * Get memory health.
         *
         * @param options
         */
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/memory/health', undefined, options);
        },
    };
    // ===== DATABASE API METHODS =====
    /**
     * Database API client.
     */
    database = {
        /**
         * List database connections.
         *
         * @param options
         */
        listConnections: async (options) => {
            return this.request('GET', '/api/v1/database/connections', undefined, options);
        },
        /**
         * Vector similarity search.
         *
         * @param collection
         * @param data
         * @param data.vector
         * @param data.limit
         * @param data.filter
         * @param options
         */
        vectorSearch: async (collection, data, options) => {
            return this.request('POST', `/api/v1/database/vector/collections/${collection}/search`, data, options);
        },
        /**
         * Execute graph query.
         *
         * @param data
         * @param data.query
         * @param data.parameters
         * @param options
         */
        graphQuery: async (data, options) => {
            return this.request('POST', '/api/v1/database/graph/query', data, options);
        },
        /**
         * Execute SQL query.
         *
         * @param data
         * @param data.query
         * @param data.parameters
         * @param options
         */
        sqlQuery: async (data, options) => {
            return this.request('POST', '/api/v1/database/sql/query', data, options);
        },
        /**
         * Get database health.
         *
         * @param options
         */
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/database/health', undefined, options);
        },
    };
    // ===== SYSTEM API METHODS =====
    /**
     * System API client.
     */
    system = {
        /**
         * Get system health.
         *
         * @param options
         */
        getHealth: async (options) => {
            return this.request('GET', '/api/v1/system/health', undefined, options);
        },
        /**
         * Get system metrics.
         *
         * @param options
         */
        getMetrics: async (options) => {
            return this.request('GET', '/api/v1/system/metrics', undefined, options);
        },
    };
    // ===== UTILITY METHODS =====
    /**
     * Update client configuration.
     *
     * @param newConfig
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.http = this.createHttpClient();
    }
    /**
     * Get current configuration.
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Test API connectivity.
     *
     * @param options
     */
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
/**
 * Factory function to create API client.
 *
 * @param config
 */
export const createAPIClient = (config) => {
    return new APIClient(config);
};
/**
 * Default API client instance.
 * Pre-configured for local development.
 */
export const apiClient = createAPIClient();
// Note: APIClient and createAPIClient are already exported above
