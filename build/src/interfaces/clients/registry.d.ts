/**
 * UACL Client Registry.
 *
 * Central registry for all client types in the Unified Adaptive Client Layer.
 * Provides type-safe registration, discovery, and configuration management.
 *
 * @file Centralized client type management system.
 */
import { EventEmitter } from 'node:events';
import type { APIClient } from '../api/http/client.ts';
import type { WebSocketClient } from '../api/websocket/client.ts';
import type { FACTIntegration } from '../knowledge/knowledge-client';
import type { ExternalMCPClient } from '../mcp/external-mcp-client.ts';
/**
 * Client type enumeration for type safety.
 */
export declare enum ClientType {
    HTTP = "http",
    WEBSOCKET = "websocket",
    KNOWLEDGE = "knowledge",
    MCP = "mcp"
}
/**
 * Base client configuration interface.
 *
 * @example
 */
export interface BaseClientConfig {
    readonly id: string;
    readonly type: ClientType;
    readonly enabled: boolean;
    readonly priority: number;
    readonly timeout?: number;
    readonly retryAttempts?: number;
    readonly healthCheckInterval?: number;
}
/**
 * HTTP client specific configuration.
 *
 * @example
 */
export interface HTTPClientConfig extends BaseClientConfig {
    readonly type: ClientType.HTTP;
    readonly baseURL: string;
    readonly apiKey?: string;
    readonly bearerToken?: string;
    readonly headers?: Record<string, string>;
}
/**
 * WebSocket client specific configuration.
 *
 * @example
 */
export interface WebSocketClientConfig extends BaseClientConfig {
    readonly type: ClientType.WEBSOCKET;
    readonly url: string;
    readonly reconnect?: boolean;
    readonly reconnectInterval?: number;
    readonly maxReconnectAttempts?: number;
}
/**
 * Knowledge (FACT) client specific configuration.
 *
 * @example
 */
export interface KnowledgeClientConfig extends BaseClientConfig {
    readonly type: ClientType.KNOWLEDGE;
    readonly factRepoPath: string;
    readonly anthropicApiKey: string;
    readonly pythonPath?: string;
    readonly enableCache?: boolean;
    readonly cacheConfig?: {
        prefix: string;
        minTokens: number;
        maxSize: string;
        ttlSeconds: number;
    };
}
/**
 * MCP client specific configuration.
 *
 * @example
 */
export interface MCPClientConfig extends BaseClientConfig {
    readonly type: ClientType.MCP;
    readonly servers: Record<string, {
        url: string;
        type: 'http' | 'sse';
        capabilities: string[];
    }>;
}
/**
 * Union type for all client configurations.
 */
export type ClientConfig = HTTPClientConfig | WebSocketClientConfig | KnowledgeClientConfig | MCPClientConfig;
/**
 * Client instance interface for type safety.
 *
 * @example
 */
export interface ClientInstance {
    readonly id: string;
    readonly type: ClientType;
    readonly config: ClientConfig;
    readonly client: APIClient | WebSocketClient | FACTIntegration | ExternalMCPClient;
    readonly status: 'initialized' | 'connecting' | 'connected' | 'disconnected' | 'error';
    readonly lastHealth?: Date;
    readonly metrics: {
        requests: number;
        errors: number;
        avgLatency: number;
        uptime: number;
    };
}
/**
 * Client factory interface for creating client instances.
 *
 * @example
 */
export interface ClientFactory {
    create(config: ClientConfig): Promise<ClientInstance>;
    validate(config: ClientConfig): boolean;
    getDefaultConfig(type: ClientType): Partial<ClientConfig>;
}
/**
 * Registry events interface.
 *
 * @example
 */
export interface RegistryEvents {
    'client:registered': (client: ClientInstance) => void;
    'client:unregistered': (clientId: string) => void;
    'client:status_changed': (clientId: string, status: ClientInstance['status']) => void;
    'client:health_check': (clientId: string, healthy: boolean) => void;
    'registry:error': (error: Error) => void;
}
/**
 * Main client registry class.
 *
 * Provides centralized management of all client types with:
 * - Type-safe registration and discovery
 * - Health monitoring and metrics
 * - Configuration validation
 * - Event-driven status updates.
 *
 * @example.
 * @example
 */
export declare class ClientRegistry extends EventEmitter {
    private clients;
    private factories;
    private healthCheckTimer?;
    private readonly healthCheckInterval;
    constructor(healthCheckInterval?: number);
    /**
     * Register a client instance.
     *
     * @param config
     */
    register(config: ClientConfig): Promise<ClientInstance>;
    /**
     * Unregister a client instance.
     *
     * @param clientId
     */
    unregister(clientId: string): Promise<boolean>;
    /**
     * Get client instance by ID.
     *
     * @param clientId
     */
    get(clientId: string): ClientInstance | undefined;
    /**
     * Get all clients of a specific type.
     *
     * @param type
     */
    getByType(type: ClientType): ClientInstance[];
    /**
     * Get all clients matching a filter.
     *
     * @param filter
     */
    getAll(filter?: (client: ClientInstance) => boolean): ClientInstance[];
    /**
     * Get healthy clients of a specific type.
     *
     * @param type
     */
    getHealthy(type?: ClientType): ClientInstance[];
    /**
     * Get client by priority (highest priority first).
     *
     * @param type.
     * @param type
     */
    getByPriority(type?: ClientType): ClientInstance[];
    /**
     * Check if a client is registered and healthy.
     *
     * @param clientId
     */
    isHealthy(clientId: string): boolean;
    /**
     * Get registry statistics.
     */
    getStats(): {
        total: number;
        byType: Record<ClientType, number>;
        byStatus: Record<string, number>;
        healthy: number;
        avgLatency: number;
    };
    /**
     * Start health monitoring.
     */
    startHealthMonitoring(): void;
    /**
     * Stop health monitoring.
     */
    stopHealthMonitoring(): void;
    /**
     * Perform health checks on all clients.
     */
    private performHealthChecks;
    /**
     * Check health of individual client.
     *
     * @param instance
     */
    private checkClientHealth;
    /**
     * Validate client configuration.
     *
     * @param config
     */
    private validateConfig;
    /**
     * Setup client factories for each type.
     */
    private setupFactories;
    /**
     * Register a client factory.
     *
     * @param type
     * @param factory
     */
    registerFactory(type: ClientType, factory: ClientFactory): void;
    /**
     * Clean shutdown of registry.
     */
    shutdown(): Promise<void>;
}
/**
 * Global registry instance.
 */
export declare const globalClientRegistry: ClientRegistry;
/**
 * Helper functions for common registry operations.
 */
export declare const ClientRegistryHelpers: {
    /**
     * Register HTTP client with common configuration.
     *
     * @param config
     */
    registerHTTPClient(config: Omit<HTTPClientConfig, "type">): Promise<ClientInstance>;
    /**
     * Register WebSocket client with common configuration.
     *
     * @param config
     */
    registerWebSocketClient(config: Omit<WebSocketClientConfig, "type">): Promise<ClientInstance>;
    /**
     * Register Knowledge client with common configuration.
     *
     * @param config
     */
    registerKnowledgeClient(config: Omit<KnowledgeClientConfig, "type">): Promise<ClientInstance>;
    /**
     * Register MCP client with common configuration.
     *
     * @param config
     */
    registerMCPClient(config: Omit<MCPClientConfig, "type">): Promise<ClientInstance>;
    /**
     * Get the best available client for a type (highest priority, healthy).
     *
     * @param type.
     * @param type
     */
    getBestClient(type: ClientType): ClientInstance | undefined;
    /**
     * Get load-balanced client (round-robin among healthy clients).
     *
     * @param type.
     * @param type
     */
    getLoadBalancedClient(type: ClientType): ClientInstance | undefined;
};
export default ClientRegistry;
//# sourceMappingURL=registry.d.ts.map