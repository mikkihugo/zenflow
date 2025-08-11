/**
 * @file Mcp-client adapter implementation.
 */
import { EventEmitter } from 'node:events';
import { type ClientConfig, type ClientMetrics, type ClientResponse, type ClientStatus, type IClient, type IClientFactory, type RequestOptions } from '../core/interfaces.ts';
/**
 * MCP-specific client configuration.
 *
 * @example
 */
export interface MCPClientConfig extends ClientConfig {
    protocol: 'stdio' | 'http';
    command?: string[];
    url?: string;
    tools?: {
        timeout: number;
        retries: number;
        discovery: boolean;
    };
    server?: {
        name: string;
        version: string;
        capabilities?: string[];
    };
    stdio?: {
        encoding: 'utf8' | 'buffer';
        killSignal: 'SIGTERM' | 'SIGKILL';
        killTimeout: number;
    };
}
/**
 * MCP Tool definition.
 *
 * @example
 */
export interface MCPTool {
    name: string;
    description: string;
    inputSchema?: any;
    outputSchema?: any;
}
/**
 * MCP Protocol Message types.
 *
 * @example
 */
export interface MCPMessage {
    jsonrpc: '2.0';
    id?: string | number;
    method?: string;
    params?: any;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}
/**
 * Tool execution result.
 *
 * @example
 */
export interface MCPToolResult {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}
/**
 * MCP Client Adapter - Implements UACL IClient interface.
 *
 * @example
 */
export declare class MCPClientAdapter extends EventEmitter implements IClient {
    readonly config: ClientConfig;
    readonly name: string;
    private _mcpConfig;
    private _isConnected;
    private _process?;
    private _tools;
    private _pendingRequests;
    private _metrics;
    private _latencyHistory;
    private _lastMetricsUpdate;
    private _messageId;
    constructor(config: MCPClientConfig);
    /**
     * Connect to MCP server.
     */
    connect(): Promise<void>;
    /**
     * Connect via stdio protocol.
     */
    private _connectStdio;
    /**
     * Connect via HTTP protocol.
     */
    private _connectHTTP;
    /**
     * Disconnect from MCP server.
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected.
     */
    isConnected(): boolean;
    /**
     * Perform health check.
     */
    healthCheck(): Promise<ClientStatus>;
    /**
     * Get performance metrics.
     */
    getMetrics(): Promise<ClientMetrics>;
    /**
     * Execute MCP tool (mapped to POST request).
     *
     * @param toolName
     * @param parameters
     * @param options
     */
    post<T = any>(toolName: string, parameters?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Get available tools (mapped to GET request).
     *
     * @param endpoint
     * @param options
     */
    get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Not supported for MCP - throws error.
     */
    put<T = any>(): Promise<ClientResponse<T>>;
    /**
     * Not supported for MCP - throws error.
     */
    delete<T = any>(): Promise<ClientResponse<T>>;
    /**
     * Update configuration.
     *
     * @param config
     */
    updateConfig(config: Partial<ClientConfig>): void;
    /**
     * Cleanup and destroy client.
     */
    destroy(): Promise<void>;
    /**
     * Execute MCP tool call.
     *
     * @param toolName
     * @param parameters
     * @param options
     */
    private _executeToolCall;
    /**
     * Discover available tools from server.
     */
    private _discoverTools;
    /**
     * Send message to MCP server.
     *
     * @param message
     * @param timeout
     */
    private _sendMessage;
    /**
     * Send message via stdio.
     *
     * @param message
     * @param timeout
     */
    private _sendStdioMessage;
    /**
     * Send message via HTTP.
     *
     * @param message
     * @param timeout
     */
    private _sendHTTPMessage;
    /**
     * Handle stdio messages.
     *
     * @param data
     */
    private _handleStdioMessage;
    /**
     * Get authentication headers for HTTP.
     */
    private _getAuthHeaders;
    /**
     * Generate next message ID.
     */
    private _nextMessageId;
    /**
     * Record latency for metrics.
     *
     * @param latency
     */
    private _recordLatency;
    /**
     * Calculate error rate.
     */
    private _calculateErrorRate;
    /**
     * Update metrics.
     */
    private _updateMetrics;
}
/**
 * MCP Client Factory - Creates and manages MCP clients.
 *
 * @example
 */
export declare class MCPClientFactory implements IClientFactory<ClientConfig> {
    private _clients;
    /**
     * Create new MCP client.
     *
     * @param config
     */
    create(config: ClientConfig): Promise<IClient>;
    /**
     * Create multiple MCP clients.
     *
     * @param configs
     */
    createMultiple(configs: ClientConfig[]): Promise<IClient[]>;
    /**
     * Get client by name.
     *
     * @param name
     */
    get(name: string): IClient | undefined;
    /**
     * List all clients.
     */
    list(): IClient[];
    /**
     * Check if client exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove client.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Health check all clients.
     */
    healthCheckAll(): Promise<Map<string, ClientStatus>>;
    /**
     * Get metrics for all clients.
     */
    getMetricsAll(): Promise<Map<string, ClientMetrics>>;
    /**
     * Shutdown all clients.
     */
    shutdown(): Promise<void>;
    /**
     * Get active client count.
     */
    getActiveCount(): number;
}
/**
 * Helper function to create MCP client configurations from legacy format.
 *
 * @param name
 * @param legacyConfig
 * @param legacyConfig.url
 * @param legacyConfig.type
 * @param legacyConfig.command
 * @param legacyConfig.timeout
 * @param legacyConfig.capabilities
 * @example
 */
export declare function createMCPConfigFromLegacy(name: string, legacyConfig: {
    url?: string;
    type?: 'http' | 'sse';
    command?: string[];
    timeout?: number;
    capabilities?: string[];
}): MCPClientConfig;
//# sourceMappingURL=mcp-client-adapter.d.ts.map