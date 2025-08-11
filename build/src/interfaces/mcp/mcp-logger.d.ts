/**
 * @file Interface implementation: mcp-logger.
 */
/**
 * MCP Logger for MCP Server.
 * Standalone logger to avoid dependency issues.
 */
export interface MCPLogger {
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export declare function createLogger(name: string): MCPLogger;
//# sourceMappingURL=mcp-logger.d.ts.map