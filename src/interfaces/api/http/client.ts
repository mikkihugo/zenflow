/**
 * REST API Client SDK
 *
 * TypeScript client for Claude Code Flow REST API.
 * Auto-generated types from OpenAPI schemas for type safety.
 * Following Google API client library standards.
 *
 * @fileoverview TypeScript API client with full type safety
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type {
  Agent,
  HealthStatus,
  PerformanceMetrics,
  SwarmConfig,
  Task,
} from '../coordination/schemas.ts';
import type { APIError } from './schemas/common.ts';
import type {
  NeuralNetwork,
  PredictionRequest,
  PredictionResponse,
  TrainingRequest,
} from './schemas/neural.ts';

/**
 * API Client Configuration
 * Following Google client library patterns
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
 * Default client configuration
 */
export const DEFAULT_CLIENT_CONFIG: APIClientConfig = {
  baseURL: 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

/**
 * Request options for API calls
 */
export interface RequestOptions {
  readonly timeout?: number;
  readonly headers?: Record<string, string>;
  readonly retries?: number;
}

/**
 * Pagination parameters for list operations
 */
export interface PaginationOptions {
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Main API Client Class
 * Provides typed methods for all API endpoints
 */
export class APIClient {
  private http: AxiosInstance;
  private config: APIClientConfig;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
    this.http = this.createHttpClient();
  }

  /**
   * Create configured Axios instance
   */
  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
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
      client.defaults.headers.common['Authorization'] = `Bearer ${this.config.bearerToken}`;
    }

    // Add retry logic
    this.setupRetryLogic(client);

    // Add error handling
    this.setupErrorHandling(client);

    return client;
  }

  /**
   * Setup retry logic for failed requests
   */
  private setupRetryLogic(client: AxiosInstance): void {
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        if (!config || config.__retryCount >= (this.config.retryAttempts || 3)) {
          return Promise.reject(error);
        }

        config.__retryCount = (config.__retryCount || 0) + 1;

        // Only retry on network errors or 5xx status codes
        if (
          error.code === 'ECONNABORTED' ||
          error.code === 'NETWORK_ERROR' ||
          (error.response && error.response.status >= 500)
        ) {
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay || 1000));

          return client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup error handling and response transformation
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
          (clientError as any).details = apiError.error.details;
          (clientError as any).traceId = apiError.error.traceId;
          (clientError as any).statusCode = error.response.status;
          throw clientError;
        }
        throw error;
      }
    );
  }

  /**
   * Generic HTTP method wrapper with type safety
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      timeout: options?.timeout,
      headers: options?.headers,
    };

    const response: AxiosResponse<T> = await this.http.request(config);
    return response.data;
  }

  // ===== COORDINATION API METHODS =====

  /**
   * Coordination API client
   */
  public readonly coordination = {
    /**
     * List agents with filtering and pagination
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
      if (params?.status) queryParams.set('status', params.status);
      if (params?.type) queryParams.set('type', params.type);
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.offset) queryParams.set('offset', params.offset.toString());

      return this.request<{
        agents: Agent[];
        total: number;
        offset: number;
        limit: number;
      }>('GET', `/api/v1/coordination/agents?${queryParams}`, undefined, options);
    },

    /**
     * Create new agent
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
     * Get agent by ID
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
     * Remove agent
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
     * Create new task
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
     * Get task by ID
     */
    getTask: async (taskId: string, options?: RequestOptions) => {
      return this.request<Task>('GET', `/api/v1/coordination/tasks/${taskId}`, undefined, options);
    },

    /**
     * Get swarm configuration
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
     * Update swarm configuration
     */
    updateSwarmConfig: async (config: SwarmConfig, options?: RequestOptions) => {
      return this.request<SwarmConfig>('PUT', '/api/v1/coordination/swarm/config', config, options);
    },

    /**
     * Get coordination system health
     */
    getHealth: async (options?: RequestOptions) => {
      return this.request<HealthStatus>('GET', '/api/v1/coordination/health', undefined, options);
    },

    /**
     * Get performance metrics
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

  // ===== NEURAL NETWORK API METHODS =====

  /**
   * Neural Network API client
   */
  public readonly neural = {
    /**
     * List neural networks
     */
    listNetworks: async (
      params?: {
        type?: NeuralNetwork['type'];
        status?: NeuralNetwork['status'];
      },
      options?: RequestOptions
    ) => {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.set('type', params.type);
      if (params?.status) queryParams.set('status', params.status);

      return this.request<{
        networks: NeuralNetwork[];
      }>('GET', `/api/v1/neural/networks?${queryParams}`, undefined, options);
    },

    /**
     * Create neural network
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
     * Get neural network by ID
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
     * Start training
     */
    trainNetwork: async (networkId: string, data: TrainingRequest, options?: RequestOptions) => {
      return this.request<{
        trainingId: string;
        status: 'started';
      }>('POST', `/api/v1/neural/networks/${networkId}/train`, data, options);
    },

    /**
     * Make prediction
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
     * Get training job status
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
     * Cancel training job
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

  // ===== MEMORY API METHODS =====

  /**
   * Memory API client
   */
  public readonly memory = {
    /**
     * List memory stores
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
     * Get value by key
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
     * Set value by key
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
     * Delete key
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
     * Get memory health
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

  // ===== DATABASE API METHODS =====

  /**
   * Database API client
   */
  public readonly database = {
    /**
     * List database connections
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
     * Vector similarity search
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
     * Execute graph query
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
     * Execute SQL query
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
     * Get database health
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

  // ===== SYSTEM API METHODS =====

  /**
   * System API client
   */
  public readonly system = {
    /**
     * Get system health
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
     * Get system metrics
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

  // ===== UTILITY METHODS =====

  /**
   * Update client configuration
   */
  public updateConfig(newConfig: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.http = this.createHttpClient();
  }

  /**
   * Get current configuration
   */
  public getConfig(): APIClientConfig {
    return { ...this.config };
  }

  /**
   * Test API connectivity
   */
  public async ping(options?: RequestOptions): Promise<boolean> {
    try {
      await this.request<{ status: string }>('GET', '/health', undefined, options);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create API client
 */
export const createAPIClient = (config?: Partial<APIClientConfig>): APIClient => {
  return new APIClient(config);
};

/**
 * Default API client instance
 * Pre-configured for local development
 */
export const apiClient = createAPIClient();

/**
 * Export types for external usage
 */
export type {
  APIClientConfig,
  RequestOptions,
  PaginationOptions,
  Agent,
  Task,
  SwarmConfig,
  HealthStatus,
  PerformanceMetrics,
  NeuralNetwork,
  TrainingRequest,
  PredictionRequest,
  PredictionResponse,
};
