/**
 * @file Database Management MCP Tools
 * Comprehensive MCP tools for advanced database coordination and management.
 */
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
    handler: (params: any) => Promise<any>;
}
export interface MCPToolResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: Record<string, any>;
}
export declare const databaseInitTool: MCPTool;
export declare const databaseQueryTool: MCPTool;
export declare const databaseOptimizeTool: MCPTool;
export declare const databaseMonitorTool: MCPTool;
export declare const databaseHealthCheckTool: MCPTool;
export declare const databaseTools: MCPTool[];
export default databaseTools;
//# sourceMappingURL=database-tools.d.ts.map