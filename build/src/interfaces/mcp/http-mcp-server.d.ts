#!/usr/bin/env node
/**
 * @file Interface implementation: http-mcp-server.
 */
export interface MCPServerConfig {
    port: number;
    host: string;
    timeout: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * HTTP MCP Server using Official SDK for Claude Desktop integration.
 *
 * @example
 */
export declare class HTTPMCPServer {
    private server;
    private expressApp;
    private httpServer;
    private config;
    private isRunning;
    constructor(userConfig?: Partial<MCPServerConfig>);
    /**
     * Setup Express middleware for SDK transport.
     */
    private setupExpressMiddleware;
    /**
     * Register Claude-Zen tools with the SDK.
     */
    private registerTools;
    /**
     * Register advanced tools from claude-zen (87 tools).
     */
    private registerAdvancedTools;
    /**
     * Integrate all advanced tools as native MCP tools (not proxy).
     */
    private integrateAdvancedToolsNatively;
    /**
     * Setup SDK transport routes.
     */
    private setupSDKRoutes;
    /**
     * Start the HTTP MCP server.
     */
    start(): Promise<void>;
    /**
     * Stop the HTTP MCP server.
     */
    stop(): Promise<void>;
    /**
     * Get server status.
     */
    getStatus(): any;
}
export default HTTPMCPServer;
//# sourceMappingURL=http-mcp-server.d.ts.map