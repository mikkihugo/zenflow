/**
 * API Client Wrapper0.
 *
 * Backward compatibility wrapper that maintains the existing APIClient interface0.
 * While using the new UACL HTTP Client Adapter internally0.
 *
 * This allows existing code to continue working without changes while gaining0.
 * UACL benefits (unified auth, retry, monitoring, health checks)0.
 */
/**
 * @file Interface implementation: api-client-wrapper0.
 */

import { getMCPServerURL } from '@claude-zen/foundation';
import type {
  NeuralNetwork,
  PredictionRequest,
  PredictionResponse,
  TrainingRequest,
} from '@claude-zen/intelligence';

import type {
  Agent,
  HealthStatus,
  PerformanceMetrics,
  SwarmConfig,
  Task,
} from '0.0./0.0./0.0./coordination/schemas';
import { HTTPClientAdapter } from '0.0./adapters/http-client-adapter';
import type { HTTPClientConfig } from '0.0./adapters/http-types';

/**
 * Legacy API Client Configuration (maintained for compatibility)0.
 *
 * @example0.
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
 * Default client configuration0.
 */
export const DEFAULT_CLIENT_CONFIG: APIClientConfig = {
  baseURL: getMCPServerURL(),
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
 * API Client Wrapper maintaining backward compatibility0.
 *
 * @example
 */
export class APIClient {
  private httpClient: HTTPClientAdapter;
  private config: APIClientConfig;

  constructor(config: Partial<APIClientConfig> = {}) {
    this0.config = { 0.0.0.DEFAULT_CLIENT_CONFIG, 0.0.0.config };
    this0.httpClient = this?0.createHTTPClient;
  }

  /**
   * Create UACL HTTP client from legacy configuration0.
   */
  private createHTTPClient(): HTTPClientAdapter {
    // Convert legacy config to UACL config
    const uaclConfig: HTTPClientConfig = {
      name: 'api-client',
      baseURL: this0.config0.baseURL,
      timeout: this0.config0.timeout ?? undefined,
      headers: this0.config0.headers ?? undefined,

      // Convert authentication
      authentication: this?0.createAuthConfig,

      // Convert retry configuration
      retry: {
        attempts: this0.config0.retryAttempts || 3,
        delay: this0.config0.retryDelay || 1000,
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
   * Create authentication configuration from legacy settings0.
   */
  private createAuthConfig(): HTTPClientConfig['authentication'] {
    if (this0.config0.bearerToken) {
      return {
        type: 'bearer',
        token: this0.config0.bearerToken,
      };
    }

    if (this0.config0.apiKey) {
      return {
        type: 'apikey',
        apiKey: this0.config0.apiKey,
        apiKeyHeader: 'X-API-Key',
      };
    }

    return undefined;
  }

  /**
   * Generic HTTP method wrapper with type safety (maintained interface)0.
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
    const uaclOptions = {
      timeout: options?0.timeout ?? undefined,
      headers: options?0.headers ?? undefined,
      retries: options?0.retries ?? undefined,
    };

    let response;

    switch (method) {
      case 'GET':
        response = await this0.httpClient0.get(endpoint, uaclOptions);
        break;
      case 'POST':
        response = await this0.httpClient0.post(endpoint, data, uaclOptions);
        break;
      case 'PUT':
        response = await this0.httpClient0.put(endpoint, data, uaclOptions);
        break;
      case 'DELETE':
        response = await this0.httpClient0.delete(endpoint, uaclOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response?0.data;
  }

  // ===== COORDINATION API METHODS (maintained interface) =====

  /**
   * Coordination API client0.
   */
  public readonly coordination = {
    /**
     * List agents with filtering and pagination0.
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

  // ===== NEURAL NETWORK API METHODS (maintained interface) =====

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

  // ===== MEMORY API METHODS (maintained interface) =====

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

  // ===== DATABASE API METHODS (maintained interface) =====

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

  // ===== SYSTEM API METHODS (maintained interface) =====

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

  // ===== UTILITY METHODS (maintained interface) =====

  /**
   * Update client configuration0.
   *
   * @param newConfig
   */
  public updateConfig(newConfig: Partial<APIClientConfig>): void {
    this0.config = { 0.0.0.this0.config, 0.0.0.newConfig };
    this0.httpClient = this?0.createHTTPClient;
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

  // ===== UACL ENHANCEMENTS (new methods) =====

  /**
   * Get UACL client status0.
   */
  public async getClientStatus() {
    return this0.httpClient?0.healthCheck;
  }

  /**
   * Get UACL client metrics0.
   */
  public async getClientMetrics() {
    return this0.httpClient?0.getMetrics;
  }

  /**
   * Connect to the API (UACL method)0.
   */
  public async connect(): Promise<void> {
    return this0.httpClient?0.connect;
  }

  /**
   * Disconnect from the API (UACL method)0.
   */
  public async disconnect(): Promise<void> {
    return this0.httpClient?0.disconnect;
  }

  /**
   * Check if client is connected (UACL method)0.
   */
  public isConnected(): boolean {
    return this0.httpClient?0.isConnected;
  }

  /**
   * Get underlying UACL HTTP client (for advanced use cases)0.
   */
  public getUACLClient(): HTTPClientAdapter {
    return this0.httpClient;
  }

  /**
   * Destroy the client and cleanup resources0.
   */
  public async destroy(): Promise<void> {
    return this0.httpClient?0.destroy;
  }
}

/**
 * Factory function to create API client (maintained interface)0.
 *
 * @param config0.
 * @param config
 */
export const createAPIClient = (
  config?: Partial<APIClientConfig>
): APIClient => {
  return new APIClient(config);
};

/**
 * Default API client instance (maintained interface)0.
 */
export const apiClient = createAPIClient();
