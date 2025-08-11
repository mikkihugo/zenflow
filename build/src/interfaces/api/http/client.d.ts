/**
 * REST API Client SDK.
 *
 * TypeScript client for Claude Code Flow REST API.
 * Auto-generated types from OpenAPI schemas for type safety.
 * Following Google API client library standards.
 *
 * @file TypeScript API client with full type safety.
 */
import type { Agent, HealthStatus, PerformanceMetrics, SwarmConfig, Task } from '../../../coordination/schemas.ts';
import type { NeuralNetwork, PredictionRequest, PredictionResponse, TrainingRequest } from './schemas/neural.ts';
/**
 * API Client Configuration.
 * Following Google client library patterns.
 *
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
 * Default client configuration using centralized URL configuration.
 */
export declare const DEFAULT_CLIENT_CONFIG: APIClientConfig;
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
 * Main API Client Class.
 * Provides typed methods for all API endpoints.
 *
 * @example
 */
export declare class APIClient {
    private http;
    private config;
    constructor(config?: Partial<APIClientConfig>);
    /**
     * Create configured Axios instance.
     */
    private createHttpClient;
    /**
     * Setup retry logic for failed requests.
     *
     * @param client
     */
    private setupRetryLogic;
    /**
     * Setup error handling and response transformation.
     *
     * @param client
     */
    private setupErrorHandling;
    /**
     * Generic HTTP method wrapper with type safety.
     *
     * @param method
     * @param endpoint
     * @param data
     * @param options
     */
    private request;
    /**
     * Coordination API client.
     */
    readonly coordination: {
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
        listAgents: (params?: {
            status?: Agent["status"];
            type?: Agent["type"];
            limit?: number;
            offset?: number;
        }, options?: RequestOptions) => Promise<{
            agents: Agent[];
            total: number;
            offset: number;
            limit: number;
        }>;
        /**
         * Create new agent.
         *
         * @param data
         * @param data.type
         * @param data.capabilities
         * @param options
         */
        createAgent: (data: {
            type: Agent["type"];
            capabilities: string[];
        }, options?: RequestOptions) => Promise<Agent>;
        /**
         * Get agent by ID.
         *
         * @param agentId
         * @param options
         */
        getAgent: (agentId: string, options?: RequestOptions) => Promise<Agent>;
        /**
         * Remove agent.
         *
         * @param agentId
         * @param options
         */
        removeAgent: (agentId: string, options?: RequestOptions) => Promise<void>;
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
        createTask: (data: {
            type: string;
            description: string;
            priority: number;
            deadline?: Date;
        }, options?: RequestOptions) => Promise<Task>;
        /**
         * Get task by ID.
         *
         * @param taskId
         * @param options
         */
        getTask: (taskId: string, options?: RequestOptions) => Promise<Task>;
        /**
         * Get swarm configuration.
         *
         * @param options
         */
        getSwarmConfig: (options?: RequestOptions) => Promise<SwarmConfig>;
        /**
         * Update swarm configuration.
         *
         * @param config
         * @param options
         */
        updateSwarmConfig: (config: SwarmConfig, options?: RequestOptions) => Promise<SwarmConfig>;
        /**
         * Get coordination system health.
         *
         * @param options
         */
        getHealth: (options?: RequestOptions) => Promise<HealthStatus>;
        /**
         * Get performance metrics.
         *
         * @param timeRange
         * @param options
         */
        getMetrics: (timeRange?: "1h" | "24h" | "7d" | "30d", options?: RequestOptions) => Promise<PerformanceMetrics>;
    };
    /**
     * Neural Network API client.
     */
    readonly neural: {
        /**
         * List neural networks.
         *
         * @param params
         * @param params.type
         * @param params.status
         * @param options
         */
        listNetworks: (params?: {
            type?: NeuralNetwork["type"];
            status?: NeuralNetwork["status"];
        }, options?: RequestOptions) => Promise<{
            networks: NeuralNetwork[];
        }>;
        /**
         * Create neural network.
         *
         * @param data
         * @param data.type
         * @param data.layers
         * @param options
         */
        createNetwork: (data: {
            type: NeuralNetwork["type"];
            layers: NeuralNetwork["layers"];
        }, options?: RequestOptions) => Promise<NeuralNetwork>;
        /**
         * Get neural network by ID.
         *
         * @param networkId
         * @param options
         */
        getNetwork: (networkId: string, options?: RequestOptions) => Promise<NeuralNetwork>;
        /**
         * Start training.
         *
         * @param networkId
         * @param data
         * @param options
         */
        trainNetwork: (networkId: string, data: TrainingRequest, options?: RequestOptions) => Promise<{
            trainingId: string;
            status: "started";
        }>;
        /**
         * Make prediction.
         *
         * @param networkId
         * @param data
         * @param options
         */
        predict: (networkId: string, data: PredictionRequest, options?: RequestOptions) => Promise<PredictionResponse>;
        /**
         * Get training job status.
         *
         * @param networkId
         * @param trainingId
         * @param options
         */
        getTrainingStatus: (networkId: string, trainingId: string, options?: RequestOptions) => Promise<{
            id: string;
            networkId: string;
            status: "pending" | "running" | "completed" | "failed" | "cancelled";
            progress: number;
            currentEpoch?: number;
            totalEpochs: number;
        }>;
        /**
         * Cancel training job.
         *
         * @param networkId
         * @param trainingId
         * @param options
         */
        cancelTraining: (networkId: string, trainingId: string, options?: RequestOptions) => Promise<void>;
    };
    /**
     * Memory API client.
     */
    readonly memory: {
        /**
         * List memory stores.
         *
         * @param options
         */
        listStores: (options?: RequestOptions) => Promise<{
            stores: Array<{
                id: string;
                type: string;
                status: string;
                size: number;
                items: number;
                created: string;
            }>;
            total: number;
        }>;
        /**
         * Get value by key.
         *
         * @param storeId
         * @param key
         * @param options
         */
        get: (storeId: string, key: string, options?: RequestOptions) => Promise<{
            storeId: string;
            key: string;
            value: unknown;
            exists: boolean;
            ttl?: number;
            retrieved: string;
        }>;
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
        set: (storeId: string, key: string, data: {
            value: unknown;
            ttl?: number;
            metadata?: Record<string, unknown>;
        }, options?: RequestOptions) => Promise<{
            storeId: string;
            key: string;
            success: boolean;
            version: number;
            stored: string;
        }>;
        /**
         * Delete key.
         *
         * @param storeId
         * @param key
         * @param options
         */
        delete: (storeId: string, key: string, options?: RequestOptions) => Promise<void>;
        /**
         * Get memory health.
         *
         * @param options
         */
        getHealth: (options?: RequestOptions) => Promise<{
            status: string;
            stores: Record<string, string>;
            metrics: {
                totalMemoryUsage: number;
                availableMemory: number;
                utilizationRate: number;
            };
        }>;
    };
    /**
     * Database API client.
     */
    readonly database: {
        /**
         * List database connections.
         *
         * @param options
         */
        listConnections: (options?: RequestOptions) => Promise<{
            connections: Array<{
                id: string;
                type: string;
                engine: string;
                status: string;
                host: string;
                database: string;
            }>;
            total: number;
        }>;
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
        vectorSearch: (collection: string, data: {
            vector: number[];
            limit?: number;
            filter?: Record<string, unknown>;
        }, options?: RequestOptions) => Promise<{
            collection: string;
            results: Array<{
                id: string;
                score: number;
                metadata: Record<string, unknown>;
            }>;
        }>;
        /**
         * Execute graph query.
         *
         * @param data
         * @param data.query
         * @param data.parameters
         * @param options
         */
        graphQuery: (data: {
            query: string;
            parameters?: Record<string, unknown>;
        }, options?: RequestOptions) => Promise<{
            results: unknown[];
            executionTime: number;
        }>;
        /**
         * Execute SQL query.
         *
         * @param data
         * @param data.query
         * @param data.parameters
         * @param options
         */
        sqlQuery: (data: {
            query: string;
            parameters?: unknown[];
        }, options?: RequestOptions) => Promise<{
            rows: unknown[];
            rowCount: number;
            executionTime: number;
        }>;
        /**
         * Get database health.
         *
         * @param options
         */
        getHealth: (options?: RequestOptions) => Promise<{
            status: string;
            databases: Record<string, {
                status: string;
                responseTime: number;
            }>;
        }>;
    };
    /**
     * System API client.
     */
    readonly system: {
        /**
         * Get system health.
         *
         * @param options
         */
        getHealth: (options?: RequestOptions) => Promise<{
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
        }>;
        /**
         * Get system metrics.
         *
         * @param options
         */
        getMetrics: (options?: RequestOptions) => Promise<{
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
        }>;
    };
    /**
     * Update client configuration.
     *
     * @param newConfig
     */
    updateConfig(newConfig: Partial<APIClientConfig>): void;
    /**
     * Get current configuration.
     */
    getConfig(): APIClientConfig;
    /**
     * Test API connectivity.
     *
     * @param options
     */
    ping(options?: RequestOptions): Promise<boolean>;
}
/**
 * Factory function to create API client.
 *
 * @param config
 */
export declare const createAPIClient: (config?: Partial<APIClientConfig>) => APIClient;
/**
 * Default API client instance.
 * Pre-configured for local development.
 */
export declare const apiClient: APIClient;
//# sourceMappingURL=client.d.ts.map