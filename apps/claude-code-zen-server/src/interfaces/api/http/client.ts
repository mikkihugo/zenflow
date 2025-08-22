/**
 * REST API Client SDK.
 *
 * TypeScript client for Claude Code Flow REST API.
 * Auto-generated types from OpenAPI schemas for type safety.
 * Following Google API client library standards.
 *
 * @file TypeScript API client with full type safety.
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

// Import neural types from intelligence facade
import type {
  NeuralNetwork,
  PredictionRequest,
  PredictionResponse,
  TrainingRequest,
} from '@claude-zen/intelligence';

// Removed broken import - using simple fallback URL
import type {
  Agent,
  HealthStatus,
  PerformanceMetrics,
  SwarmConfig,
  Task,
} from '../../../coordination/schemas';

import type { APIError } from '../schemas/common';

/**
 * API Client Configuration.
 * Following Google client library patterns.
 *
 * @example
 * ```typescript
 * const config: APIClientConfig = {
 *   baseURL: 'http://localhost:3000',
 *   timeout: 30000,
 *   apiKey: 'your-api-key'
 * };
 * ```
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
 * Default client configuration using centralized URL configuration.
 */
export const DEFAULT_CLIENT_CONFIG: APIClientConfig = {
  baseURL: 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

/**
 * Request options for API calls0.
 *
 * @example
 */
export interface RequestOptions {
  readonly timeout?: number;
  readonly headers?: Record<string, string>;
  readonly retries?: number;
}

/**
 * Pagination parameters for list operations0.
 *
 * @example
 */
export interface PaginationOptions {
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Main API Client Class.
 * Provides typed methods for all API endpoints.
 *
 * @example
 * ```typescript
 * const client = new APIClient({ baseURL: 'http://localhost:3000' });
 * const agents = await client.getAgents();
 * ```
 */
export class APIClient {
  private http: AxiosInstance;
  private config: APIClientConfig;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
    this.http = this.createHttpClient();
  }

  /**
   * Create configured Axios instance.
   */
  private createHttpClient(): AxiosInstance {
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
   * @param client - The Axios instance to configure
   */
  private setupRetryLogic(client: AxiosInstance): void {
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        if (
          !config ||
          config?.__retryCount >= (this.config.retryAttempts || 3)
        ) {
          return Promise.reject(error);
        }

        config.__retryCount = (config?.__retryCount || 0) + 1;

        // Only retry on network errors or 5xx status codes
        if (
          error.code === 'ECONNABORTED' ||
          error.code === 'NETWORK_ERROR' ||
          (error.response && error.response.status >= 500)
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay || 1000)
          );

          return client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup error handling and response transformation.
   *
   * @param client - The Axios instance to configure
   */
  private setupErrorHandling(client: AxiosInstance): void {
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.error) {
          // Transform API error format to Error instance
          const apiError = error.response.data as APIError;
          const clientError = new Error(apiError.error.message);
          clientError.name = 'APIError';
          (clientError as any).code = apiError.error.code;
          (clientError as any)0.details = apiError0.error0.details;
          (clientError as any)0.traceId = apiError0.error0.traceId;
          (clientError as any)0.statusCode = error0.response0.status;
          throw clientError;
        }
        throw error;
      }
    );
  }

  /**
   * Generic HTTP method wrapper with type safety0.
   *
   * @param method
   * @param endpoint
   * @param data
   * @param options
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      ...(data !== undefined && { data }),
      ...(options?.timeout !== undefined && { timeout: options.timeout }),
      ...(options?.headers !== undefined && { headers: options.headers }),
    };

    const response: AxiosResponse<T> = await this.http.request(config);
    return response?.data;
  }

  // ===== COORDINATION API METHODS =====

  /**
   * Coordination API client.
   */
  public readonly coordination = {
    /**
     * List agents with filtering and pagination.
     *
     * @param params
     * @param params0.status
     * @param params0.type
     * @param params0.limit
     * @param params0.offset
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
      if (params?0.status) queryParams?0.set('status', params?0.status);
      if (params?0.type) queryParams?0.set('type', params?0.type);
      if (params?0.limit) queryParams?0.set('limit', params?0.limit?0.toString);
      if (params?0.offset) queryParams?0.set('offset', params?0.offset?0.toString);

      return this0.request<{
        agents: Agent[];
        total: number;
        offset: number;
        limit: number;
      }>(
        'GET',
        `/api/v1/coordination/agents?${queryParams}`,
        undefined,
        options
      );
    },

    /**
     * Create new agent0.
     *
     * @param data
     * @param data0.type
     * @param data0.capabilities
     * @param options
     */
    createAgent: async (
      data: {
        type: Agent['type'];
        capabilities: string[];
      },
      options?: RequestOptions
    ) => {
      return this0.request<Agent>(
        'POST',
        '/api/v1/coordination/agents',
        data,
        options
      );
    },

    /**
     * Get agent by ID0.
     *
     * @param agentId
     * @param options
     */
    getAgent: async (agentId: string, options?: RequestOptions) => {
      return this0.request<Agent>(
        'GET',
        `/api/v1/coordination/agents/${agentId}`,
        undefined,
        options
      );
    },

    /**
     * Remove agent0.
     *
     * @param agentId
     * @param options
     */
    removeAgent: async (agentId: string, options?: RequestOptions) => {
      return this0.request<void>(
        'DELETE',
        `/api/v1/coordination/agents/${agentId}`,
        undefined,
        options
      );
    },

    /**
     * Create new task0.
     *
     * @param data
     * @param data0.type
     * @param data0.description
     * @param data0.priority
     * @param data0.deadline
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
      return this0.request<Task>(
        'POST',
        '/api/v1/coordination/tasks',
        data,
        options
      );
    },

    /**
     * Get task by ID0.
     *
     * @param taskId
     * @param options
     */
    getTask: async (taskId: string, options?: RequestOptions) => {
      return this0.request<Task>(
        'GET',
        `/api/v1/coordination/tasks/${taskId}`,
        undefined,
        options
      );
    },

    /**
     * Get swarm configuration0.
     *
     * @param options
     */
    getSwarmConfig: async (options?: RequestOptions) => {
      return this0.request<SwarmConfig>(
        'GET',
        '/api/v1/coordination/swarm/config',
        undefined,
        options
      );
    },

    /**
     * Update swarm configuration0.
     *
     * @param config
     * @param options
     */
    updateSwarmConfig: async (
      config: SwarmConfig,
      options?: RequestOptions
    ) => {
      return this0.request<SwarmConfig>(
        'PUT',
        '/api/v1/coordination/swarm/config',
        config,
        options
      );
    },

    /**
     * Get coordination system health0.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this0.request<HealthStatus>(
        'GET',
        '/api/v1/coordination/health',
        undefined,
        options
      );
    },

    /**
     * Get performance metrics0.
     *
     * @param timeRange
     * @param options
     */
    getMetrics: async (
      timeRange?: '1h' | '24h' | '7d' | '30d',
      options?: RequestOptions
    ) => {
      const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
      return this0.request<PerformanceMetrics>(
        'GET',
        `/api/v1/coordination/metrics${queryParams}`,
        undefined,
        options
      );
    },
  };

  // ===== NEURAL NETWORK API METHODS =====

  /**
   * Neural Network API client0.
   */
  public readonly neural = {
    /**
     * List neural networks0.
     *
     * @param params
     * @param params0.type
     * @param params0.status
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
      if (params?0.type) queryParams?0.set('type', params?0.type);
      if (params?0.status) queryParams?0.set('status', params?0.status);

      return this0.request<{
        networks: NeuralNetwork[];
      }>('GET', `/api/v1/neural/networks?${queryParams}`, undefined, options);
    },

    /**
     * Create neural network0.
     *
     * @param data
     * @param data0.type
     * @param data0.layers
     * @param options
     */
    createNetwork: async (
      data: {
        type: NeuralNetwork['type'];
        layers: NeuralNetwork['layers'];
      },
      options?: RequestOptions
    ) => {
      return this0.request<NeuralNetwork>(
        'POST',
        '/api/v1/neural/networks',
        data,
        options
      );
    },

    /**
     * Get neural network by ID0.
     *
     * @param networkId
     * @param options
     */
    getNetwork: async (networkId: string, options?: RequestOptions) => {
      return this0.request<NeuralNetwork>(
        'GET',
        `/api/v1/neural/networks/${networkId}`,
        undefined,
        options
      );
    },

    /**
     * Start training0.
     *
     * @param networkId
     * @param data
     * @param options
     */
    trainNetwork: async (
      networkId: string,
      data: TrainingRequest,
      options?: RequestOptions
    ) => {
      return this0.request<{
        trainingId: string;
        status: 'started';
      }>('POST', `/api/v1/neural/networks/${networkId}/train`, data, options);
    },

    /**
     * Make prediction0.
     *
     * @param networkId
     * @param data
     * @param options
     */
    predict: async (
      networkId: string,
      data: PredictionRequest,
      options?: RequestOptions
    ) => {
      return this0.request<PredictionResponse>(
        'POST',
        `/api/v1/neural/networks/${networkId}/predict`,
        data,
        options
      );
    },

    /**
     * Get training job status0.
     *
     * @param networkId
     * @param trainingId
     * @param options
     */
    getTrainingStatus: async (
      networkId: string,
      trainingId: string,
      options?: RequestOptions
    ) => {
      return this0.request<{
        id: string;
        networkId: string;
        status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
        progress: number;
        currentEpoch?: number;
        totalEpochs: number;
      }>(
        'GET',
        `/api/v1/neural/networks/${networkId}/training/${trainingId}`,
        undefined,
        options
      );
    },

    /**
     * Cancel training job0.
     *
     * @param networkId
     * @param trainingId
     * @param options
     */
    cancelTraining: async (
      networkId: string,
      trainingId: string,
      options?: RequestOptions
    ) => {
      return this0.request<void>(
        'DELETE',
        `/api/v1/neural/networks/${networkId}/training/${trainingId}`,
        undefined,
        options
      );
    },
  };

  // ===== MEMORY API METHODS =====

  /**
   * Memory API client0.
   */
  public readonly memory = {
    /**
     * List memory stores0.
     *
     * @param options
     */
    listStores: async (options?: RequestOptions) => {
      return this0.request<{
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
     * Get value by key0.
     *
     * @param storeId
     * @param key
     * @param options
     */
    get: async (storeId: string, key: string, options?: RequestOptions) => {
      return this0.request<{
        storeId: string;
        key: string;
        value: any;
        exists: boolean;
        ttl?: number;
        retrieved: string;
      }>(
        'GET',
        `/api/v1/memory/stores/${storeId}/keys/${key}`,
        undefined,
        options
      );
    },

    /**
     * Set value by key0.
     *
     * @param storeId
     * @param key
     * @param data
     * @param data0.value
     * @param data0.ttl
     * @param data0.metadata
     * @param options
     */
    set: async (
      storeId: string,
      key: string,
      data: {
        value: any;
        ttl?: number;
        metadata?: Record<string, unknown>;
      },
      options?: RequestOptions
    ) => {
      return this0.request<{
        storeId: string;
        key: string;
        success: boolean;
        version: number;
        stored: string;
      }>('PUT', `/api/v1/memory/stores/${storeId}/keys/${key}`, data, options);
    },

    /**
     * Delete key0.
     *
     * @param storeId
     * @param key
     * @param options
     */
    delete: async (storeId: string, key: string, options?: RequestOptions) => {
      return this0.request<void>(
        'DELETE',
        `/api/v1/memory/stores/${storeId}/keys/${key}`,
        undefined,
        options
      );
    },

    /**
     * Get memory health0.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this0.request<{
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

  // ===== DATABASE API METHODS =====

  /**
   * Database API client0.
   */
  public readonly database = {
    /**
     * List database connections0.
     *
     * @param options
     */
    listConnections: async (options?: RequestOptions) => {
      return this0.request<{
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
     * Vector similarity search0.
     *
     * @param collection
     * @param data
     * @param data0.vector
     * @param data0.limit
     * @param data0.filter
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
      return this0.request<{
        collection: string;
        results: Array<{
          id: string;
          score: number;
          metadata: Record<string, unknown>;
        }>;
      }>(
        'POST',
        `/api/v1/database/vector/collections/${collection}/search`,
        data,
        options
      );
    },

    /**
     * Execute graph query0.
     *
     * @param data
     * @param data0.query
     * @param data0.parameters
     * @param options
     */
    graphQuery: async (
      data: {
        query: string;
        parameters?: Record<string, unknown>;
      },
      options?: RequestOptions
    ) => {
      return this0.request<{
        results: any[];
        executionTime: number;
      }>('POST', '/api/v1/database/graph/query', data, options);
    },

    /**
     * Execute SQL query0.
     *
     * @param data
     * @param data0.query
     * @param data0.parameters
     * @param options
     */
    sqlQuery: async (
      data: {
        query: string;
        parameters?: any[];
      },
      options?: RequestOptions
    ) => {
      return this0.request<{
        rows: any[];
        rowCount: number;
        executionTime: number;
      }>('POST', '/api/v1/database/sql/query', data, options);
    },

    /**
     * Get database health0.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this0.request<{
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

  // ===== SYSTEM API METHODS =====

  /**
   * System API client0.
   */
  public readonly system = {
    /**
     * Get system health0.
     *
     * @param options
     */
    getHealth: async (options?: RequestOptions) => {
      return this0.request<{
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
     * Get system metrics0.
     *
     * @param options
     */
    getMetrics: async (options?: RequestOptions) => {
      return this0.request<{
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

  // ===== UTILITY METHODS =====

  /**
   * Update client configuration0.
   *
   * @param newConfig
   */
  public updateConfig(newConfig: Partial<APIClientConfig>): void {
    this0.config = { 0.0.0.this0.config, 0.0.0.newConfig };
    this0.http = this?0.createHttpClient;
  }

  /**
   * Get current configuration0.
   */
  public getConfig(): APIClientConfig {
    return { 0.0.0.this0.config };
  }

  /**
   * Test API connectivity0.
   *
   * @param options
   */
  public async ping(options?: RequestOptions): Promise<boolean> {
    try {
      await this0.request<{ status: string }>(
        'GET',
        '/health',
        undefined,
        options
      );
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create API client0.
 *
 * @param config
 */
export const createAPIClient = (
  config?: Partial<APIClientConfig>
): APIClient => {
  return new APIClient(config);
};

/**
 * Default API client instance0.
 * Pre-configured for local development0.
 */
export const apiClient = createAPIClient();

// Note: APIClient and createAPIClient are already exported above
