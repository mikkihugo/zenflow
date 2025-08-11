/**
 * @file Interface implementation: http-client-factory.
 */
import type { HTTPClientConfig } from '../adapters/http-types.ts';
import type { ClientMetrics, ClientStatus, IClient, IClientFactory } from '../core/interfaces.ts';
/**
 * HTTP Client Factory implementing UACL IClientFactory interface.
 *
 * @example
 */
export declare class HTTPClientFactory implements IClientFactory<HTTPClientConfig> {
    private clients;
    private isShuttingDown;
    create(config: HTTPClientConfig): Promise<IClient>;
    createMultiple(configs: HTTPClientConfig[]): Promise<IClient[]>;
    get(name: string): IClient | undefined;
    list(): IClient[];
    has(name: string): boolean;
    remove(name: string): Promise<boolean>;
    healthCheckAll(): Promise<Map<string, ClientStatus>>;
    getMetricsAll(): Promise<Map<string, ClientMetrics>>;
    shutdown(): Promise<void>;
    getActiveCount(): number;
    /**
     * Create HTTP client with authentication preset.
     *
     * @param name
     * @param baseURL
     * @param authType
     * @param credentials
     */
    createWithAuth(name: string, baseURL: string, authType: 'bearer' | 'apikey' | 'basic', credentials: string | {
        username: string;
        password: string;
    }): Promise<IClient>;
    /**
     * Create HTTP client with retry configuration.
     *
     * @param name
     * @param baseURL
     * @param retryConfig
     * @param retryConfig.attempts
     * @param retryConfig.delay
     * @param retryConfig.backoff
     */
    createWithRetry(name: string, baseURL: string, retryConfig: {
        attempts: number;
        delay: number;
        backoff?: 'linear' | 'exponential' | 'fixed';
    }): Promise<IClient>;
    /**
     * Create HTTP client with monitoring enabled.
     *
     * @param name
     * @param baseURL
     * @param monitoringConfig
     * @param monitoringConfig.metricsInterval
     * @param monitoringConfig.healthCheckInterval
     * @param monitoringConfig.healthEndpoint
     */
    createWithMonitoring(name: string, baseURL: string, monitoringConfig?: {
        metricsInterval?: number;
        healthCheckInterval?: number;
        healthEndpoint?: string;
    }): Promise<IClient>;
    /**
     * Create load-balanced HTTP clients.
     *
     * @param baseName
     * @param baseURLs
     * @param options
     * @param options.strategy
     * @param options.healthCheck
     */
    createLoadBalanced(baseName: string, baseURLs: string[], options?: {
        strategy?: 'round-robin' | 'random' | 'least-connections';
        healthCheck?: boolean;
    }): Promise<IClient[]>;
    /**
     * Get clients by status.
     *
     * @param status
     */
    getClientsByStatus(status: 'healthy' | 'degraded' | 'unhealthy'): Promise<IClient[]>;
    /**
     * Get factory statistics.
     */
    getStats(): {
        totalClients: number;
        connectedClients: number;
        averageResponseTime: number;
        totalRequests: number;
        totalErrors: number;
    };
    /**
     * Setup event handlers for created clients.
     *
     * @param client
     */
    private setupClientHandlers;
}
/**
 * Default HTTP client factory instance.
 */
export declare const httpClientFactory: HTTPClientFactory;
/**
 * Convenience function to create HTTP client.
 *
 * @param config
 */
export declare const createHTTPClient: (config: HTTPClientConfig) => Promise<IClient>;
/**
 * Convenience function to create multiple HTTP clients.
 *
 * @param configs
 */
export declare const createHTTPClients: (configs: HTTPClientConfig[]) => Promise<IClient[]>;
//# sourceMappingURL=http-client-factory.d.ts.map