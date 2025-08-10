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

import { HTTPClientAdapter } from '../adapters/http-client-adapter';
import type { HTTPClientConfig } from '../adapters/http-types';
import type {
  NeuralNetwork,
  PredictionRequest,
  PredictionResponse,
  TrainingRequest,
} from '../api/http/schemas/neural';
import { getMCPServerURL } from '../config/url-builder';
import type {
  Agent,
  HealthStatus,
  PerformanceMetrics,
  SwarmConfig,
  Task,
} from '../coordination/schemas';

/**
 * Legacy API Client Configuration (maintained for compatibility).
 *
 * @example.
 * @example
 */
export interface APIClientConfig {
  readonly baseURL: string;
  readonly timeout?: number;
  readonly apiKey?: string;
  readonly bearerToken?: string;
  readonly headers?: Record<string, string>;
  readonly retryAttempts?: number;
  readonly retryDelay?: number;
}

/**
 * Default client configuration.
 */
export const DEFAULT_CLIENT_CONFIG: APIClientConfig = {
  baseURL: getMCPServerURL(),
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

/**
 * Request options for API calls.
 *
 * @example
 */
export interface RequestOptions {
  readonly timeout?: number;
  readonly headers?: Record<string, string>;
  readonly retries?: number;
}

/**
 * Pagination parameters for list operations.
 *
 * @example
 */
export interface PaginationOptions {
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * API Client Wrapper maintaining backward compatibility.
 *
 * @example
 */
export class APIClient {
  private httpClient: HTTPClientAdapter;
  private config: APIClientConfig;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
    this.httpClient = this.createHTTPClient();
  }

  /**
   * Create UACL HTTP client from legacy configuration.
   */
  private createHTTPClient(): HTTPClientAdapter {
    // Convert legacy config to UACL config
    const uaclConfig: HTTPClientConfig = {
      name: 'api-client',
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,

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
  private createAuthConfig(): HTTPClientConfig['authentication'] {
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
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const uaclOptions = {
      timeout: options?.timeout,
      headers: options?.headers,
      retries: options?.retries,
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
  public readonly coordination = {
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
    listAgents: async (
      params?: {
        status?: Agent['status'];
        type?: Agent['type'];
        limit?: number;
        offset?: number;
      },
      options?: RequestOptions
    ) => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams?.set('status', params?.status);
      if (params?.type) queryParams?.set('type', params?.type);
      if (params?.limit) queryParams?.set('limit', params?.limit.toString());
      if (params?.offset) queryParams?.set('offset', params?.offset.toString());

      return this.request<{
        agents: Agent[];
        total: number;
        offset: number;
        limit: number;
      }>('GET', `/api/v1/coordination/agents?${queryParams}`, undefined, options);
    },

    /**
     * Create new agent.
     *
     * @param data
     * @param data.type
     * @param data.capabilities
     * @param options
     */
    createAgent: async (
      data: {
        type: Agent['type'];
        capabilities: string[];
      },
      options?: RequestOptions
    ) => {
      return this.request<Agent>('POST', '/api/v1/coordination/agents', data, options);
    },

    /**
     * Get agent by ID.
     *
     * @param agentId
     * @param options
     */
    getAgent: async (agentId: string, options?: RequestOptions) => {
      return this.request<Agent>(
        'GET',
        `/api/v1/coordination/agents/${agentId}`,
        undefined,
        options
      );
    },

    /**
     * Remove agent.
     *
     * @param agentId
     * @param options
     */
    removeAgent: async (agentId: string, options?: RequestOptions) => {
      return this.request<void>(
        'DELETE',
        `/api/v1/coordination/agents/${agentId}`,
        undefined,
        options
      );
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
    createTask: async (
      data: {
        type: string;
        description: string;
        priority: number;
        deadline?: Date;
      },
      options?: RequestOptions
    ) => {
      return this.request<Task>('POST', '/api/v1/coordination/tasks', data, options);
    },

    /**
     * Get task by ID.
     *
     * @param taskId
     * @param options
     */
    getTask: async (taskId: string, options?: RequestOptions) => {
      return this.request<Task>('GET', `/api/v1/coordination/tasks/${taskId}`, undefined, options);
    },

    /**
     * Get swarm configuration.
     *
     * @param options
     */
    getSwarmConfig: async (options?: RequestOptions) => {
      return this.request<SwarmConfig>(
        'GET',
        '/api/v1/coordination/swarm/config',
        undefined,
        options
      );
    },

    /**
     * Update swarm configuration.
     *
     * @param config
     * @param options
     */
    updateSwarmConfig: async (config: SwarmConfig, options?: RequestOptions) => {
      return this.request<SwarmConfig>('PUT', '/api/v1/coordination/swarm/config', config, options);
    },

    /**
     * Get coordination system health.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this.request<HealthStatus>('GET', '/api/v1/coordination/health', undefined, options);
    },

    /**
     * Get performance metrics.
     *
     * @param timeRange
     * @param options
     */
    getMetrics: async (timeRange?: '1h' | '24h' | '7d' | '30d', options?: RequestOptions) => {
      const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
      return this.request<PerformanceMetrics>(
        'GET',
        `/api/v1/coordination/metrics${queryParams}`,
        undefined,
        options
      );
    },
  };

  // ===== NEURAL NETWORK API METHODS (maintained interface) =====

  /**
   * Neural Network API client.
   */
  public readonly neural = {
    /**
     * List neural networks.
     *
     * @param params
     * @param params.type
     * @param params.status
     * @param options
     */
    listNetworks: async (
      params?: {
        type?: NeuralNetwork['type'];
        status?: NeuralNetwork['status'];
      },
      options?: RequestOptions
    ) => {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams?.set('type', params?.type);
      if (params?.status) queryParams?.set('status', params?.status);

      return this.request<{
        networks: NeuralNetwork[];
      }>('GET', `/api/v1/neural/networks?${queryParams}`, undefined, options);
    },

    /**
     * Create neural network.
     *
     * @param data
     * @param data.type
     * @param data.layers
     * @param options
     */
    createNetwork: async (
      data: {
        type: NeuralNetwork['type'];
        layers: NeuralNetwork['layers'];
      },
      options?: RequestOptions
    ) => {
      return this.request<NeuralNetwork>('POST', '/api/v1/neural/networks', data, options);
    },

    /**
     * Get neural network by ID.
     *
     * @param networkId
     * @param options
     */
    getNetwork: async (networkId: string, options?: RequestOptions) => {
      return this.request<NeuralNetwork>(
        'GET',
        `/api/v1/neural/networks/${networkId}`,
        undefined,
        options
      );
    },

    /**
     * Start training.
     *
     * @param networkId
     * @param data
     * @param options
     */
    trainNetwork: async (networkId: string, data: TrainingRequest, options?: RequestOptions) => {
      return this.request<{
        trainingId: string;
        status: 'started';
      }>('POST', `/api/v1/neural/networks/${networkId}/train`, data, options);
    },

    /**
     * Make prediction.
     *
     * @param networkId
     * @param data
     * @param options
     */
    predict: async (networkId: string, data: PredictionRequest, options?: RequestOptions) => {
      return this.request<PredictionResponse>(
        'POST',
        `/api/v1/neural/networks/${networkId}/predict`,
        data,
        options
      );
    },

    /**
     * Get training job status.
     *
     * @param networkId
     * @param trainingId
     * @param options
     */
    getTrainingStatus: async (networkId: string, trainingId: string, options?: RequestOptions) => {
      return this.request<{
        id: string;
        networkId: string;
        status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
        progress: number;
        currentEpoch?: number;
        totalEpochs: number;
      }>('GET', `/api/v1/neural/networks/${networkId}/training/${trainingId}`, undefined, options);
    },

    /**
     * Cancel training job.
     *
     * @param networkId
     * @param trainingId
     * @param options
     */
    cancelTraining: async (networkId: string, trainingId: string, options?: RequestOptions) => {
      return this.request<void>(
        'DELETE',
        `/api/v1/neural/networks/${networkId}/training/${trainingId}`,
        undefined,
        options
      );
    },
  };

  // ===== MEMORY API METHODS (maintained interface) =====

  /**
   * Memory API client.
   */
  public readonly memory = {
    /**
     * List memory stores.
     *
     * @param options
     */
    listStores: async (options?: RequestOptions) => {
      return this.request<{
        stores: Array<{
          id: string;
          type: string;
          status: string;
          size: number;
          items: number;
          created: string;
        }>;
        total: number;
      }>('GET', '/api/v1/memory/stores', undefined, options);
    },

    /**
     * Get value by key.
     *
     * @param storeId
     * @param key
     * @param options
     */
    get: async (storeId: string, key: string, options?: RequestOptions) => {
      return this.request<{
        storeId: string;
        key: string;
        value: unknown;
        exists: boolean;
        ttl?: number;
        retrieved: string;
      }>('GET', `/api/v1/memory/stores/${storeId}/keys/${key}`, undefined, options);
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
    set: async (
      storeId: string,
      key: string,
      data: {
        value: unknown;
        ttl?: number;
        metadata?: Record<string, unknown>;
      },
      options?: RequestOptions
    ) => {
      return this.request<{
        storeId: string;
        key: string;
        success: boolean;
        version: number;
        stored: string;
      }>('PUT', `/api/v1/memory/stores/${storeId}/keys/${key}`, data, options);
    },

    /**
     * Delete key.
     *
     * @param storeId
     * @param key
     * @param options
     */
    delete: async (storeId: string, key: string, options?: RequestOptions) => {
      return this.request<void>(
        'DELETE',
        `/api/v1/memory/stores/${storeId}/keys/${key}`,
        undefined,
        options
      );
    },

    /**
     * Get memory health.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this.request<{
        status: string;
        stores: Record<string, string>;
        metrics: {
          totalMemoryUsage: number;
          availableMemory: number;
          utilizationRate: number;
        };
      }>('GET', '/api/v1/memory/health', undefined, options);
    },
  };

  // ===== DATABASE API METHODS (maintained interface) =====

  /**
   * Database API client.
   */
  public readonly database = {
    /**
     * List database connections.
     *
     * @param options
     */
    listConnections: async (options?: RequestOptions) => {
      return this.request<{
        connections: Array<{
          id: string;
          type: string;
          engine: string;
          status: string;
          host: string;
          database: string;
        }>;
        total: number;
      }>('GET', '/api/v1/database/connections', undefined, options);
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
    vectorSearch: async (
      collection: string,
      data: {
        vector: number[];
        limit?: number;
        filter?: Record<string, unknown>;
      },
      options?: RequestOptions
    ) => {
      return this.request<{
        collection: string;
        results: Array<{
          id: string;
          score: number;
          metadata: Record<string, unknown>;
        }>;
      }>('POST', `/api/v1/database/vector/collections/${collection}/search`, data, options);
    },

    /**
     * Execute graph query.
     *
     * @param data
     * @param data.query
     * @param data.parameters
     * @param options
     */
    graphQuery: async (
      data: {
        query: string;
        parameters?: Record<string, unknown>;
      },
      options?: RequestOptions
    ) => {
      return this.request<{
        results: unknown[];
        executionTime: number;
      }>('POST', '/api/v1/database/graph/query', data, options);
    },

    /**
     * Execute SQL query.
     *
     * @param data
     * @param data.query
     * @param data.parameters
     * @param options
     */
    sqlQuery: async (
      data: {
        query: string;
        parameters?: unknown[];
      },
      options?: RequestOptions
    ) => {
      return this.request<{
        rows: unknown[];
        rowCount: number;
        executionTime: number;
      }>('POST', '/api/v1/database/sql/query', data, options);
    },

    /**
     * Get database health.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this.request<{
        status: string;
        databases: Record<
          string,
          {
            status: string;
            responseTime: number;
          }
        >;
      }>('GET', '/api/v1/database/health', undefined, options);
    },
  };

  // ===== SYSTEM API METHODS (maintained interface) =====

  /**
   * System API client.
   */
  public readonly system = {
    /**
     * Get system health.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this.request<{
        status: string;
        timestamp: string;
        services: Record<string, string>;
        uptime: number;
        memory: {
          rss: number;
          heapTotal: number;
          heapUsed: number;
        };
        version: string;
      }>('GET', '/api/v1/system/health', undefined, options);
    },

    /**
     * Get system metrics.
     *
     * @param options
     */
    getMetrics: async (options?: RequestOptions) => {
      return this.request<{
        timestamp: string;
        uptime: number;
        memory: {
          rss: number;
          heapTotal: number;
          heapUsed: number;
        };
        cpu: {
          user: number;
          system: number;
        };
      }>('GET', '/api/v1/system/metrics', undefined, options);
    },
  };

  // ===== UTILITY METHODS (maintained interface) =====

  /**
   * Update client configuration.
   *
   * @param newConfig
   */
  public updateConfig(newConfig: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.httpClient = this.createHTTPClient();
  }

  /**
   * Get current configuration.
   */
  public getConfig(): APIClientConfig {
    return { ...this.config };
  }

  /**
   * Test API connectivity.
   *
   * @param options
   */
  public async ping(options?: RequestOptions): Promise<boolean> {
    try {
      await this.request<{ status: string }>('GET', '/health', undefined, options);
      return true;
    } catch {
      return false;
    }
  }

  // ===== UACL ENHANCEMENTS (new methods) =====

  /**
   * Get UACL client status.
   */
  public async getClientStatus() {
    return this.httpClient.healthCheck();
  }

  /**
   * Get UACL client metrics.
   */
  public async getClientMetrics() {
    return this.httpClient.getMetrics();
  }

  /**
   * Connect to the API (UACL method).
   */
  public async connect(): Promise<void> {
    return this.httpClient.connect();
  }

  /**
   * Disconnect from the API (UACL method).
   */
  public async disconnect(): Promise<void> {
    return this.httpClient.disconnect();
  }

  /**
   * Check if client is connected (UACL method).
   */
  public isConnected(): boolean {
    return this.httpClient.isConnected();
  }

  /**
   * Get underlying UACL HTTP client (for advanced use cases).
   */
  public getUACLClient(): HTTPClientAdapter {
    return this.httpClient;
  }

  /**
   * Destroy the client and cleanup resources.
   */
  public async destroy(): Promise<void> {
    return this.httpClient.destroy();
  }
}

/**
 * Factory function to create API client (maintained interface).
 *
 * @param config.
 * @param config
 */
export const createAPIClient = (config?: Partial<APIClientConfig>): APIClient => {
  return new APIClient(config);
};

/**
 * Default API client instance (maintained interface).
 */
export const apiClient = createAPIClient();
