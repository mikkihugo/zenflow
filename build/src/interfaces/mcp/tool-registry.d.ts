/**
 * @file MCP Tools Registry.
 *
 * Central registry for MCP tools from claude-zen.
 * Integrates with existing HTTP and Stdio MCP servers.
 */
import type { DocumentService } from '../services/document-service';
import type { MCPTool } from './types.ts';
export type { MCPTool } from './types.ts';
/**
 * Simple tool registry.
 *
 * @example
 */
declare class ToolRegistry {
    private tools;
    registerTool(tool: MCPTool): void;
    getTool(name: string): MCPTool | undefined;
    getAllTools(): MCPTool[];
    getToolsByCategory(category: string): MCPTool[];
    getCategorySummary(): any;
    getToolCount(): number;
}
export declare const toolRegistry: ToolRegistry;
/**
 * MCP Tools Manager.
 * Provides centralized management for MCP tools.
 *
 * @example
 */
export declare class MCPToolsManager {
    private initialized;
    private toolStats;
    private documentService?;
    constructor(documentService?: DocumentService);
    /**
     * Initialize all tools in the registry.
     */
    private initializeTools;
    /**
     * Get tool by name.
     *
     * @param name
     */
    getTool(name: string): MCPTool | undefined;
    /**
     * Execute tool with enhanced error handling and metrics.
     *
     * @param name
     * @param params
     */
    executeTool(name: string, params: any): Promise<any>;
    /**
     * List all tools with metadata.
     */
    listAllTools(): any;
    /**
     * Get tools by category.
     *
     * @param category
     */
    getToolsByCategory(category: string): MCPTool[];
    /**
     * Get tool execution statistics.
     */
    getToolStats(): any;
    /**
     * Get registry overview.
     */
    getRegistryOverview(): any;
    /**
     * Search tools by tags or keywords.
     *
     * @param query
     */
    searchTools(query: string): MCPTool[];
    /**
     * Get tool count.
     */
    getToolCount(): number;
    /**
     * Check if tool exists.
     *
     * @param name
     */
    hasTool(name: string): boolean;
    /**
     * Get tools requiring specific permissions.
     *
     * @param permissionType
     * @param resource
     */
    getToolsByPermission(permissionType: string, resource?: string): MCPTool[];
    private initializeToolStats;
    private updateToolStats;
    private calculateAvgResponseTime;
}
export declare const mcpToolsManager: MCPToolsManager;
/**
 * Initialize the MCP tools manager with database services for SPARC integration.
 *
 * @param documentService
 * @example
 */
export declare function initializeWithDatabaseServices(documentService: DocumentService): MCPToolsManager;
/**
 * Integration helper for existing MCP servers.
 *
 * @example
 */
export declare class MCPServerIntegration {
    /**
     * Register tools with HTTP MCP server.
     *
     * @param mcpServer
     */
    static integrateWithHTTPServer(mcpServer: any): Promise<void>;
    /**
     * Register tools with Stdio MCP server.
     *
     * @param mcpServer
     */
    static integrateWithStdioServer(mcpServer: any): Promise<void>;
    /**
     * Create tool discovery endpoint.
     */
    static createDiscoveryEndpoint(): any;
    /**
     * Create tool execution endpoint.
     */
    static createExecutionEndpoint(): any;
}
export default mcpToolsManager;
//# sourceMappingURL=tool-registry.d.ts.map