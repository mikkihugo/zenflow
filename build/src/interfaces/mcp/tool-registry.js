/**
 * @file MCP Tools Registry.
 *
 * Central registry for MCP tools from claude-zen.
 * Integrates with existing HTTP and Stdio MCP servers.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-mcp-tool-registry');
import coordinationTools from './tools/coordination-tools.ts';
import githubIntegrationTools from './tools/github-integration-tools.ts';
import memoryNeuralTools from './tools/memory-neural-tools.ts';
import monitoringTools from './tools/monitoring-tools.ts';
import orchestrationTools from './tools/orchestration-tools.ts';
import { createSPARCIntegrationTools } from './tools/sparc-integration-tools.ts';
import systemTools from './tools/system-tools.ts';
/**
 * Simple tool registry.
 *
 * @example
 */
class ToolRegistry {
    tools = new Map();
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getAllTools() {
        const tools = [];
        for (const tool of this.tools.values()) {
            tools.push(tool);
        }
        return tools;
    }
    getToolsByCategory(category) {
        return this.getAllTools().filter((tool) => tool.category === category);
    }
    getCategorySummary() {
        const categories = new Map();
        for (const tool of this.tools.values()) {
            categories.set(tool.category, (categories.get(tool.category) || 0) + 1);
        }
        return Object.fromEntries(categories);
    }
    getToolCount() {
        return this.tools.size;
    }
}
export const toolRegistry = new ToolRegistry();
/**
 * MCP Tools Manager.
 * Provides centralized management for MCP tools.
 *
 * @example
 */
export class MCPToolsManager {
    initialized = false;
    toolStats = new Map();
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
        this.initializeTools();
    }
    /**
     * Initialize all tools in the registry.
     */
    initializeTools() {
        if (this.initialized)
            return;
        try {
            // Register Coordination Tools
            coordinationTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            // Register Monitoring Tools
            monitoringTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            // Register Memory & Neural Tools
            memoryNeuralTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            // Register GitHub Integration Tools
            githubIntegrationTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            // Register System Tools
            systemTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            // Register Orchestration Tools
            orchestrationTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            // Register SPARC Integration Tools - DATABASE-DRIVEN
            if (this.documentService) {
                const sparcTools = createSPARCIntegrationTools(this.documentService);
                sparcTools.forEach((tool) => {
                    toolRegistry.registerTool(tool);
                    this.initializeToolStats(tool.name);
                });
            }
            this.initialized = true;
        }
        catch (error) {
            logger.error('Failed to initialize MCP tools:', error);
        }
    }
    /**
     * Get tool by name.
     *
     * @param name
     */
    getTool(name) {
        return toolRegistry.getTool(name);
    }
    /**
     * Execute tool with enhanced error handling and metrics.
     *
     * @param name
     * @param params
     */
    async executeTool(name, params) {
        const startTime = Date.now();
        const tool = this.getTool(name);
        if (!tool) {
            throw new Error(`Tool not found: ${name}`);
        }
        try {
            const result = await tool.handler(params);
            // Update success statistics
            this.updateToolStats(name, Date.now() - startTime, false);
            return result;
        }
        catch (error) {
            // Update error statistics
            this.updateToolStats(name, Date.now() - startTime, true);
            throw error;
        }
    }
    /**
     * List all tools with metadata.
     */
    listAllTools() {
        const tools = toolRegistry.getAllTools();
        const categoryStats = toolRegistry.getCategorySummary();
        return {
            total: tools.length,
            categories: categoryStats,
            tools: tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                category: tool.category,
                version: tool.version,
                priority: tool.priority,
                tags: tool.metadata.tags,
                permissions: tool.permissions.map((p) => `${p.type}:${p.resource}`),
            })),
        };
    }
    /**
     * Get tools by category.
     *
     * @param category
     */
    getToolsByCategory(category) {
        return toolRegistry.getToolsByCategory(category);
    }
    /**
     * Get tool execution statistics.
     */
    getToolStats() {
        const stats = {};
        this.toolStats.forEach((toolStats, toolName) => {
            stats[toolName] = {
                ...toolStats,
                successRate: toolStats.calls > 0
                    ? `${(((toolStats.calls - toolStats.errors) / toolStats.calls) * 100).toFixed(2)}%`
                    : '0%',
            };
        });
        return stats;
    }
    /**
     * Get registry overview.
     */
    getRegistryOverview() {
        const categoryStats = toolRegistry.getCategorySummary();
        const totalCalls = Array.from(this.toolStats.values()).reduce((sum, stats) => sum + stats.calls, 0);
        const totalErrors = Array.from(this.toolStats.values()).reduce((sum, stats) => sum + stats.errors, 0);
        return {
            toolCount: this.getToolCount(),
            categories: categoryStats,
            statistics: {
                totalCalls,
                totalErrors,
                errorRate: totalCalls > 0 ? `${((totalErrors / totalCalls) * 100).toFixed(2)}%` : '0%',
                avgResponseTime: this.calculateAvgResponseTime(),
            },
            status: 'operational',
            version: '2.0.0',
        };
    }
    /**
     * Search tools by tags or keywords.
     *
     * @param query
     */
    searchTools(query) {
        const lowercaseQuery = query.toLowerCase();
        return toolRegistry
            .getAllTools()
            .filter((tool) => tool.name.toLowerCase().includes(lowercaseQuery) ||
            tool.description.toLowerCase().includes(lowercaseQuery) ||
            tool.metadata.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)));
    }
    /**
     * Get tool count.
     */
    getToolCount() {
        return toolRegistry.getToolCount();
    }
    /**
     * Check if tool exists.
     *
     * @param name
     */
    hasTool(name) {
        return toolRegistry.getTool(name) !== undefined;
    }
    /**
     * Get tools requiring specific permissions.
     *
     * @param permissionType
     * @param resource
     */
    getToolsByPermission(permissionType, resource) {
        return toolRegistry
            .getAllTools()
            .filter((tool) => tool.permissions.some((perm) => perm.type === permissionType && (!resource || perm.resource === resource)));
    }
    initializeToolStats(toolName) {
        this.toolStats.set(toolName, { calls: 0, errors: 0, avgTime: 0 });
    }
    updateToolStats(toolName, executionTime, isError) {
        const stats = this.toolStats.get(toolName);
        if (stats) {
            stats.calls++;
            if (isError)
                stats.errors++;
            stats.avgTime = (stats.avgTime * (stats.calls - 1) + executionTime) / stats.calls;
        }
    }
    calculateAvgResponseTime() {
        const allStats = Array.from(this.toolStats.values());
        if (allStats.length === 0)
            return '0ms';
        const avgTime = allStats.reduce((sum, stats) => sum + stats.avgTime, 0) / allStats.length;
        return `${Math.round(avgTime)}ms`;
    }
}
// Global instance - initialize without services first
export const mcpToolsManager = new MCPToolsManager();
/**
 * Initialize the MCP tools manager with database services for SPARC integration.
 *
 * @param documentService
 * @example
 */
export function initializeWithDatabaseServices(documentService) {
    // Create new instance with database services for SPARC tools
    const manager = new MCPToolsManager(documentService);
    return manager;
}
/**
 * Integration helper for existing MCP servers.
 *
 * @example
 */
export class MCPServerIntegration {
    /**
     * Register tools with HTTP MCP server.
     *
     * @param mcpServer
     */
    static async integrateWithHTTPServer(mcpServer) {
        const tools = toolRegistry.getAllTools();
        for (const tool of tools) {
            // Convert tool to standard MCP tool format
            const mcpTool = {
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                handler: async (params) => {
                    const result = await mcpToolsManager.executeTool(tool.name, params);
                    return result;
                },
            };
            // Register with HTTP MCP server
            if (mcpServer.registerTool) {
                mcpServer.registerTool(mcpTool);
            }
        }
    }
    /**
     * Register tools with Stdio MCP server.
     *
     * @param mcpServer
     */
    static async integrateWithStdioServer(mcpServer) {
        const tools = toolRegistry.getAllTools();
        for (const tool of tools) {
            // Convert tool to stdio MCP tool format
            const stdioTool = {
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                handler: async (params) => {
                    const result = await mcpToolsManager.executeTool(tool.name, params);
                    return result;
                },
            };
            // Register with Stdio MCP server
            if (mcpServer.tools) {
                mcpServer.tools[tool.name] = stdioTool;
            }
        }
    }
    /**
     * Create tool discovery endpoint.
     */
    static createDiscoveryEndpoint() {
        return {
            path: '/tools',
            handler: async () => {
                return {
                    success: true,
                    data: mcpToolsManager.listAllTools(),
                    metadata: {
                        version: '2.0.0',
                        totalTools: mcpToolsManager.getToolCount(),
                        categories: [
                            'coordination',
                            'monitoring',
                            'memory-neural',
                            'github-integration',
                            'system',
                            'orchestration',
                        ],
                    },
                };
            },
        };
    }
    /**
     * Create tool execution endpoint.
     */
    static createExecutionEndpoint() {
        return {
            path: '/tools/:toolName',
            method: 'POST',
            handler: async (req) => {
                const { toolName } = req.params;
                const params = req.body;
                try {
                    const result = await mcpToolsManager.executeTool(toolName, params);
                    return {
                        success: true,
                        tool: toolName,
                        result,
                        timestamp: new Date().toISOString(),
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        tool: toolName,
                        error: error.message,
                        timestamp: new Date().toISOString(),
                    };
                }
            },
        };
    }
}
export default mcpToolsManager;
