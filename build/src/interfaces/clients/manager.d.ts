/**
 * UACL Client Manager.
 *
 * Manages the complete lifecycle of all client types in the system.
 * Provides factories, health monitoring, metrics collection, and recovery.
 *
 * @file Centralized client lifecycle management.
 */
import { EventEmitter } from 'node:events';
import { type ClientConfig, type ClientInstance, ClientRegistry, ClientType, type HTTPClientConfig, type KnowledgeClientConfig, type MCPClientConfig, type WebSocketClientConfig } from './registry.ts';
/**
 * Manager configuration options.
 *
 * @example
 */
export interface ClientManagerConfig {
    healthCheckInterval?: number;
    autoReconnect?: boolean;
    maxRetryAttempts?: number;
    retryDelay?: number;
    metricsRetention?: number;
    enableLogging?: boolean;
}
/**
 * Client metrics interface.
 *
 * @example
 */
export interface ClientMetrics {
    requests: {
        total: number;
        successful: number;
        failed: number;
        avgLatency: number;
        minLatency: number;
        maxLatency: number;
    };
    connections: {
        attempts: number;
        successful: number;
        failed: number;
        currentStatus: string;
    };
    health: {
        lastCheck: Date;
        checksTotal: number;
        checksSuccessful: number;
        uptime: number;
        downtimeTotal: number;
    };
    errors: {
        total: number;
        byType: Record<string, number>;
        recent: Array<{
            timestamp: Date;
            type: string;
            message: string;
        }>;
    };
}
/**
 * Main Client Manager Class.
 *
 * Provides complete lifecycle management for all client types:
 * - Factory registration and client creation
 * - Health monitoring and auto-recovery
 * - Metrics collection and analysis
 * - Configuration validation
 * - Error handling and logging.
 *
 * @example.
 * @example
 */
export declare class ClientManager extends EventEmitter {
    readonly registry: ClientRegistry;
    private config;
    private metricsStore;
    private reconnectTimers;
    private isInitialized;
    constructor(config?: ClientManagerConfig);
    /**
     * Initialize the client manager.
     */
    initialize(): Promise<void>;
    /**
     * Create and register a new client.
     *
     * @param config
     */
    createClient(config: ClientConfig): Promise<ClientInstance>;
    /**
     * Connect a client by ID.
     *
     * @param clientId
     */
    connectClient(clientId: string): Promise<boolean>;
    /**
     * Disconnect a client by ID.
     *
     * @param clientId
     */
    disconnectClient(clientId: string): Promise<boolean>;
    /**
     * Remove a client completely.
     *
     * @param clientId
     */
    removeClient(clientId: string): Promise<boolean>;
    /**
     * Get client instance by ID.
     *
     * @param clientId
     */
    getClient(clientId: string): ClientInstance | undefined;
    /**
     * Get all clients of a specific type.
     *
     * @param type
     */
    getClientsByType(type: ClientType): ClientInstance[];
    /**
     * Get the best available client for a type.
     *
     * @param type
     */
    getBestClient(type: ClientType): ClientInstance | undefined;
    /**
     * Get client metrics.
     *
     * @param clientId
     */
    getClientMetrics(clientId: string): ClientMetrics | undefined;
    /**
     * Get aggregated metrics for all clients.
     */
    getAggregatedMetrics(): {
        total: number;
        connected: number;
        byType: Record<ClientType, {
            total: number;
            connected: number;
            avgLatency: number;
        }>;
        totalRequests: number;
        totalErrors: number;
        avgLatency: number;
    };
    /**
     * Get system health status.
     */
    getHealthStatus(): {
        overall: 'healthy' | 'warning' | 'critical';
        details: Record<string, {
            status: 'healthy' | 'warning' | 'critical';
            message?: string;
        }>;
    };
    /**
     * Schedule reconnection attempt.
     *
     * @param clientId
     */
    private scheduleReconnect;
    /**
     * Setup event handlers for registry events.
     */
    private setupEventHandlers;
    /**
     * Create initial metrics for a client.
     */
    private createInitialMetrics;
    /**
     * Clean shutdown of the manager.
     */
    shutdown(): Promise<void>;
}
/**
 * Global client manager instance.
 */
export declare const globalClientManager: ClientManager;
/**
 * Helper functions for common manager operations.
 */
export declare const ClientManagerHelpers: {
    /**
     * Initialize the global manager with default configuration.
     *
     * @param config
     */
    initialize(config?: ClientManagerConfig): Promise<void>;
    /**
     * Create HTTP client with sensible defaults.
     *
     * @param id
     * @param baseURL
     * @param options
     */
    createHTTPClient(id: string, baseURL: string, options?: Partial<HTTPClientConfig>): Promise<ClientInstance>;
    /**
     * Create WebSocket client with sensible defaults.
     *
     * @param id
     * @param url
     * @param options
     */
    createWebSocketClient(id: string, url: string, options?: Partial<WebSocketClientConfig>): Promise<ClientInstance>;
    /**
     * Create Knowledge client with sensible defaults.
     *
     * @param id
     * @param factRepoPath
     * @param anthropicApiKey
     * @param options
     */
    createKnowledgeClient(id: string, factRepoPath: string, anthropicApiKey: string, options?: Partial<KnowledgeClientConfig>): Promise<ClientInstance>;
    /**
     * Create MCP client with sensible defaults.
     *
     * @param id
     * @param servers
     * @param options
     */
    createMCPClient(id: string, servers: MCPClientConfig["servers"], options?: Partial<MCPClientConfig>): Promise<ClientInstance>;
    /**
     * Get comprehensive system status.
     */
    getSystemStatus(): {
        health: ReturnType<ClientManager["getHealthStatus"]>;
        metrics: ReturnType<ClientManager["getAggregatedMetrics"]>;
        clients: ClientInstance[];
    };
};
export default ClientManager;
//# sourceMappingURL=manager.d.ts.map