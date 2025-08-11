/**
 * Unified MCP Server for Claude Code CLI Integration.
 * Single stdio MCP server combining coordination and swarm functionality.
 */
/**
 * @file Coordination system: mcp-server.
 */
import type { MCPServerConfig } from './types.ts';
export declare class StdioMcpServer {
    private server;
    private transport;
    private toolRegistry;
    private hiveRegistry;
    private config;
    constructor(config?: MCPServerConfig);
    start(): Promise<void>;
    private registerTools;
    stop(): Promise<void>;
}
export { StdioMcpServer as MCPServer };
export default StdioMcpServer;
//# sourceMappingURL=mcp-server.d.ts.map