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
  type AxiosResponse
} from 'axios';

// API Configuration interface
export interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
}

// Common API types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    timestamp: number;
    requestId?: string;
  };
}

// Basic health status interface
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
  }>;
}

// Performance metrics interface
export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
}

// Agent interfaces
export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  lastActivity?: Date;
}

export interface Task {
  id: string;
  agentId: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  result?: any;
}

export interface SwarmConfig {
  maxAgents: number;
  strategy: 'parallel' | 'sequential' | 'adaptive';
  timeout: number;
  retryAttempts: number;
}

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
export class APIClient {
  private client: AxiosInstance;
  private config: APIClientConfig;

  constructor(config: APIClientConfig = {}) {
    this.config = {
      baseURL: 'http://localhost:3000',
      timeout: 30000,
      retries: 3,
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers
      }
    });

    // Add auth header if API key provided
    if (this.config.apiKey) {
      this.client.defaults.headers.common['Authorization'] =
        `Bearer ${this.config.apiKey}`;
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.handleAPIError(error));
      }
    );
  }

  /**
   * Handle API errors consistently
   */
  private handleAPIError(error: any): APIError {
    if (error.response) {
      return {
        code: `HTTP_${error.response.status}`,
        message: error.response.data?.message || error.message,
        details: error.response.data
      };
    }

    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: error.message
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error
    };
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(endpoint, config);
      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error as APIError,
        metadata: {
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(
        endpoint,
        data,
        config
      );
      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error as APIError,
        metadata: {
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(
        endpoint,
        data,
        config
      );
      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error as APIError,
        metadata: {
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(endpoint, config);
      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error as APIError,
        metadata: {
          timestamp: Date.now()
        }
      };
    }
  }

  // Specific API methods

  /**
   * Get system health status
   */
  async getHealth(): Promise<APIResponse<HealthStatus>> {
    return this.get<HealthStatus>('/api/health');
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<APIResponse<PerformanceMetrics>> {
    return this.get<PerformanceMetrics>('/api/metrics');
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<APIResponse<Agent[]>> {
    return this.get<Agent[]>('/api/agents');
  }

  /**
   * Get specific agent by ID
   */
  async getAgent(agentId: string): Promise<APIResponse<Agent>> {
    return this.get<Agent>(`/api/agents/${agentId}`);
  }

  /**
   * Create a new agent
   */
  async createAgent(agentConfig: Partial<Agent>): Promise<APIResponse<Agent>> {
    return this.post<Agent>('/api/agents', agentConfig);
  }

  /**
   * Update an existing agent
   */
  async updateAgent(
    agentId: string,
    updates: Partial<Agent>
  ): Promise<APIResponse<Agent>> {
    return this.put<Agent>(`/api/agents/${agentId}`, updates);
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<APIResponse<void>> {
    return this.delete<void>(`/api/agents/${agentId}`);
  }

  /**
   * List tasks for an agent
   */
  async listTasks(agentId?: string): Promise<APIResponse<Task[]>> {
    const endpoint = agentId ? `/api/agents/${agentId}/tasks` : '/api/tasks';
    return this.get<Task[]>(endpoint);
  }

  /**
   * Create a new task
   */
  async createTask(task: Partial<Task>): Promise<APIResponse<Task>> {
    return this.post<Task>('/api/tasks', task);
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<APIResponse<Task>> {
    return this.get<Task>(`/api/tasks/${taskId}`);
  }

  /**
   * Update swarm configuration
   */
  async updateSwarmConfig(config: SwarmConfig): Promise<APIResponse<SwarmConfig>> {
    return this.put<SwarmConfig>('/api/swarm/config', config);
  }

  /**
   * Get current swarm configuration
   */
  async getSwarmConfig(): Promise<APIResponse<SwarmConfig>> {
    return this.get<SwarmConfig>('/api/swarm/config');
  }
}

/**
 * Default API client instance
 */
export const apiClient = new APIClient();

export default APIClient;