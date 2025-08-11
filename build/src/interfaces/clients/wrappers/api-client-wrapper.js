/**
 * API Client Wrapper.
 *
 * Backward compatibility wrapper that maintains the existing APIClient interface.
 * While using the new UACL HTTP Client Adapter internally.
 *
 * This allows existing code to continue working without changes while gaining.
 * UACL benefits (unified auth, retry, monitoring, health checks).
 */
/**
 * @file Interface implementation: api-client-wrapper.
 */
import { getMCPServerURL } from '../../../config/index.ts';
import { HTTPClientAdapter } from '../adapters/http-client-adapter.ts';
/**
 * Default client configuration.
 */
export const DEFAULT_CLIENT_CONFIG = {
    baseURL: getMCPServerURL(),
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
};
/**
 * API Client Wrapper maintaining backward compatibility.
 *
 * @example
 */
export class APIClient {
    httpClient;
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
        this.httpClient = this.createHTTPClient();
    }
    /**
     * Create UACL HTTP client from legacy configuration.
     */
    createHTTPClient() {
        // Convert legacy config to UACL config
        const uaclConfig = {
            name: 'api-client',
            baseURL: this.config.baseURL,
            timeout: this.config.timeout ?? undefined,
            headers: this.config.headers ?? undefined,
            // Convert authentication
            authentication: this.createAuthConfig(),
            // Convert retry configuration
            retry: {
                attempts: this.config.retryAttempts || 3,
                delay: this.config.retryDelay || 1000,
                backoff: 'exponential',
                retryStatusCodes: [408, 429, 500, 502, 503, 504],
            },
            // Enable monitoring for better observability
            monitoring: {
                enabled: true,
                metricsInterval: 60000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
            },
            // Add health checks
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
    /**
     * Create authentication configuration from legacy settings.
     */
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
    /**
     * Generic HTTP method wrapper with type safety (maintained interface).
     *
     * @param method
     * @param endpoint
     * @param data
     * @param options
     */
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
    // ===== COORDINATION API METHODS (maintained interface) =====
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
    // ===== NEURAL NETWORK API METHODS (maintained interface) =====
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
    // ===== MEMORY API METHODS (maintained interface) =====
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
    // ===== DATABASE API METHODS (maintained interface) =====
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
    // ===== SYSTEM API METHODS (maintained interface) =====
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
    // ===== UTILITY METHODS (maintained interface) =====
    /**
     * Update client configuration.
     *
     * @param newConfig
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.httpClient = this.createHTTPClient();
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
    // ===== UACL ENHANCEMENTS (new methods) =====
    /**
     * Get UACL client status.
     */
    async getClientStatus() {
        return this.httpClient.healthCheck();
    }
    /**
     * Get UACL client metrics.
     */
    async getClientMetrics() {
        return this.httpClient.getMetrics();
    }
    /**
     * Connect to the API (UACL method).
     */
    async connect() {
        return this.httpClient.connect();
    }
    /**
     * Disconnect from the API (UACL method).
     */
    async disconnect() {
        return this.httpClient.disconnect();
    }
    /**
     * Check if client is connected (UACL method).
     */
    isConnected() {
        return this.httpClient.isConnected();
    }
    /**
     * Get underlying UACL HTTP client (for advanced use cases).
     */
    getUACLClient() {
        return this.httpClient;
    }
    /**
     * Destroy the client and cleanup resources.
     */
    async destroy() {
        return this.httpClient.destroy();
    }
}
/**
 * Factory function to create API client (maintained interface).
 *
 * @param config.
 * @param config
 */
export const createAPIClient = (config) => {
    return new APIClient(config);
};
/**
 * Default API client instance (maintained interface).
 */
export const apiClient = createAPIClient();
