/**
 * @file Interface implementation: external-mcp-client.
 */
import { EventEmitter } from 'node:events';
/**
 * External MCP Server Client.
 * Connects to remote MCP servers like Context7, DeepWiki, GitMCP, and Semgrep.
 *
 * @example
 */
export declare class ExternalMCPClient extends EventEmitter {
    private servers;
    private connections;
    private toolCache;
    private retryAttempts;
    constructor();
    /**
     * Load external server configurations.
     */
    private loadServerConfigs;
    /**
     * Connect to all configured external MCP servers.
     */
    connectAll(): Promise<ConnectionResult[]>;
    /**
     * Connect to a specific external MCP server.
     *
     * @param name
     * @param config
     */
    private connectToServer;
    /**
     * Create connection based on server type.
     *
     * @param name
     * @param config
     */
    private createConnection;
    /**
     * Create HTTP connection to MCP server.
     *
     * @param _name
     * @param config
     */
    private createHTTPConnection;
    /**
     * Create SSE connection to MCP server.
     *
     * @param _name
     * @param config
     */
    private createSSEConnection;
    /**
     * Discover available tools from connected server.
     *
     * @param name
     * @param _connection
     */
    private discoverTools;
    /**
     * Get mock tools for demonstration (replace with actual MCP tool discovery).
     *
     * @param serverName.
     * @param serverName
     */
    private getMockToolsForServer;
    /**
     * Execute tool on external server.
     *
     * @param serverName
     * @param toolName
     * @param parameters
     */
    executeTool(serverName: string, toolName: string, parameters: any): Promise<ToolExecutionResult>;
    /**
     * Simulate tool execution (replace with actual MCP protocol calls).
     *
     * @param serverName
     * @param toolName
     * @param _parameters
     */
    private simulateToolExecution;
    /**
     * Get available tools from all connected servers.
     */
    getAvailableTools(): {
        [serverName: string]: MCPTool[];
    };
    /**
     * Get server status.
     */
    getServerStatus(): {
        [serverName: string]: ServerStatus;
    };
    /**
     * Disconnect from all servers.
     */
    disconnectAll(): Promise<void>;
}
export interface ExternalMCPConfig {
    timeout?: number;
    retryAttempts?: number;
    enableLogging?: boolean;
}
export interface MCPServerConfig {
    url: string;
    type: 'http' | 'sse';
    description: string;
    timeout: number;
    retryAttempts: number;
    capabilities: string[];
}
export interface MCPConnection {
    type: 'http' | 'sse';
    url: string;
    connected: boolean;
    lastPing: Date;
    send: (message: any) => Promise<any>;
    close: () => Promise<void>;
}
export interface MCPTool {
    name: string;
    description: string;
    parameters?: any;
    schema?: any;
}
export interface ConnectionResult {
    server: string;
    success: boolean;
    url?: string;
    toolCount?: number;
    capabilities?: string[];
    error?: string;
}
export interface ToolExecutionResult {
    success: boolean;
    server: string;
    tool: string;
    result?: any;
    error?: string;
    executionTime?: number;
}
export interface ServerStatus {
    name: string;
    url: string;
    type: string;
    connected: boolean;
    toolCount: number;
    capabilities: string[];
    lastPing: Date | null;
}
//# sourceMappingURL=external-mcp-client.d.ts.map