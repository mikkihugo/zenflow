/**
 * MCP Request Handler.
 *
 * Handles MCP protocol requests and routes them to appropriate tool handlers.
 * Implements the Model Context Protocol specification for tool calls.
 */
/**
 * @file Interface implementation: request-handler.
 */
export interface MCPRequest {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: any;
}
export interface MCPResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}
export interface MCPCapabilities {
    tools: {};
    resources: {
        list: boolean;
        read: boolean;
    };
    notifications: {
        initialized: boolean;
    };
}
export interface MCPServerInfo {
    name: string;
    version: string;
    description: string;
}
/**
 * Handles MCP protocol requests.
 *
 * @example
 */
export declare class MCPRequestHandler {
    private toolRegistry;
    private serverInfo;
    private capabilities;
    private initialized;
    constructor(toolRegistry: MCPToolRegistry);
    /**
     * Handle incoming MCP request.
     *
     * @param request
     */
    handleRequest(request: MCPRequest): Promise<MCPResponse>;
    /**
     * Handle initialization request.
     *
     * @param params
     */
    private handleInitialize;
    /**
     * Handle initialization notification.
     *
     * @param params
     */
    private handleInitialized;
    /**
     * Handle tools list request.
     */
    private handleToolsList;
    /**
     * Handle tool call request.
     *
     * @param params
     */
    private handleToolCall;
    /**
     * Handle resources list request.
     */
    private handleResourcesList;
    /**
     * Handle resource read request.
     *
     * @param params
     */
    private handleResourceRead;
    /**
     * Handle ping request.
     */
    private handlePing;
    /**
     * Get system status information.
     */
    private getSystemStatus;
    /**
     * Get tools information.
     */
    private getToolsInfo;
    /**
     * Get performance metrics.
     */
    private getMetrics;
    /**
     * Check if server is initialized.
     */
    isInitialized(): boolean;
    /**
     * Get server information.
     */
    getServerInfo(): MCPServerInfo;
    /**
     * Get server capabilities.
     */
    getCapabilities(): MCPCapabilities;
}
export default MCPRequestHandler;
//# sourceMappingURL=request-handler.d.ts.map