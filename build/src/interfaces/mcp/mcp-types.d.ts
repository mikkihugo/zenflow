/**
 * Shared MCP Type Definitions.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */
export type McpToolId = string;
export interface McpToolExecutionContext {
    start: number;
    tool: McpToolId;
    params: unknown;
}
export interface McpToolResult<T = unknown> {
    ok: true;
    tool: McpToolId;
    durationMs: number;
    data: T;
}
export interface McpToolError {
    ok: false;
    tool: McpToolId;
    durationMs: number;
    error: {
        message: string;
        code?: string;
        stack?: string;
    };
}
export type McpToolOutcome<T = unknown> = McpToolResult<T> | McpToolError;
export interface McpToolSpec<TInput = any, TOutput = any> {
    id: McpToolId;
    name: string;
    description: string;
    category?: string;
    version?: string;
    handler: (params: TInput) => Promise<TOutput> | TOutput;
    inputSchema?: unknown;
    metadata?: Record<string, unknown>;
    permissions?: Array<{
        type: string;
        resource: string;
    }>;
}
export type McpToolRegistryMap = Record<McpToolId, McpToolSpec<any, any>>;
export declare function createOutcome<T>(spec: McpToolSpec, start: number, result: T): McpToolResult<T>;
export declare function createErrorOutcome(spec: McpToolSpec | {
    name: string;
    id?: string;
}, start: number, error: unknown): McpToolError;
//# sourceMappingURL=mcp-types.d.ts.map