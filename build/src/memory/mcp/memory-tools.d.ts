/**
 * @file Memory Management MCP Tools
 * Comprehensive MCP tools for advanced memory system coordination and management.
 */
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
    handler: (params: Record<string, unknown>) => Promise<unknown>;
}
export interface MCPToolResult {
    success: boolean;
    data?: unknown;
    error?: string;
    metadata?: Record<string, unknown>;
}
export declare const memoryInitTool: MCPTool;
export declare const memoryOptimizeTool: MCPTool;
export declare const memoryMonitorTool: MCPTool;
export declare const memoryDistributeTool: MCPTool;
export declare const memoryHealthCheckTool: MCPTool;
export declare const memoryTools: MCPTool[];
export default memoryTools;
//# sourceMappingURL=memory-tools.d.ts.map