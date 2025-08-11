/**
 * MCP Interface.
 *
 * Claude Desktop remote interface for coordinating with MCP tools.
 * Handles communication with Claude Code via MCP protocol.
 */
/**
 * @file Interface implementation: mcp-interface.
 */
import { EventEmitter } from 'node:events';
export interface MCPInterfaceConfig {
    serverUrl?: string;
    toolPrefix?: string;
    reconnectInterval?: number;
    maxRetries?: number;
}
export interface MCPMessage {
    id: string;
    method: string;
    params?: any;
    result?: any;
    error?: any;
}
export declare class MCPInterface extends EventEmitter {
    private config;
    private isConnected;
    private reconnectTimer?;
    private retryCount;
    constructor(config?: MCPInterfaceConfig);
    /**
     * Initialize MCP connection.
     */
    start(): Promise<void>;
    /**
     * Stop MCP interface.
     */
    stop(): Promise<void>;
    /**
     * Send tool call to Claude Code via MCP.
     *
     * @param name
     * @param args
     */
    callTool(name: string, args: any): Promise<any>;
    /**
     * List available MCP tools.
     */
    listTools(): Promise<string[]>;
    private connect;
    private disconnect;
    private sendMessage;
    private setupEventHandlers;
    private handleReconnect;
    get connected(): boolean;
}
/**
 * Create and configure MCP interface instance.
 *
 * @param config
 * @example
 */
export declare function createMCPInterface(config?: MCPInterfaceConfig): MCPInterface;
export default MCPInterface;
//# sourceMappingURL=mcp-interface.d.ts.map