import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-mcp-tool-registry');
import coordinationTools from './tools/coordination-tools.ts';
import githubIntegrationTools from './tools/github-integration-tools.ts';
import memoryNeuralTools from './tools/memory-neural-tools.ts';
import monitoringTools from './tools/monitoring-tools.ts';
import orchestrationTools from './tools/orchestration-tools.ts';
import { createSPARCIntegrationTools } from './tools/sparc-integration-tools.ts';
import systemTools from './tools/system-tools.ts';
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
export class MCPToolsManager {
    initialized = false;
    toolStats = new Map();
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
        this.initializeTools();
    }
    initializeTools() {
        if (this.initialized)
            return;
        try {
            coordinationTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            monitoringTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            memoryNeuralTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            githubIntegrationTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            systemTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
            orchestrationTools.forEach((tool) => {
                toolRegistry.registerTool(tool);
                this.initializeToolStats(tool.name);
            });
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
    getTool(name) {
        return toolRegistry.getTool(name);
    }
    async executeTool(name, params) {
        const startTime = Date.now();
        const tool = this.getTool(name);
        if (!tool) {
            throw new Error(`Tool not found: ${name}`);
        }
        try {
            const result = await tool.handler(params);
            this.updateToolStats(name, Date.now() - startTime, false);
            return result;
        }
        catch (error) {
            this.updateToolStats(name, Date.now() - startTime, true);
            throw error;
        }
    }
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
    getToolsByCategory(category) {
        return toolRegistry.getToolsByCategory(category);
    }
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
                errorRate: totalCalls > 0
                    ? `${((totalErrors / totalCalls) * 100).toFixed(2)}%`
                    : '0%',
                avgResponseTime: this.calculateAvgResponseTime(),
            },
            status: 'operational',
            version: '2.0.0',
        };
    }
    searchTools(query) {
        const lowercaseQuery = query.toLowerCase();
        return toolRegistry
            .getAllTools()
            .filter((tool) => tool.name.toLowerCase().includes(lowercaseQuery) ||
            tool.description.toLowerCase().includes(lowercaseQuery) ||
            tool.metadata.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)));
    }
    getToolCount() {
        return toolRegistry.getToolCount();
    }
    hasTool(name) {
        return toolRegistry.getTool(name) !== undefined;
    }
    getToolsByPermission(permissionType, resource) {
        return toolRegistry
            .getAllTools()
            .filter((tool) => tool.permissions.some((perm) => perm.type === permissionType &&
            (!resource || perm.resource === resource)));
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
            stats.avgTime =
                (stats.avgTime * (stats.calls - 1) + executionTime) / stats.calls;
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
export const mcpToolsManager = new MCPToolsManager();
export function initializeWithDatabaseServices(documentService) {
    const manager = new MCPToolsManager(documentService);
    return manager;
}
export class MCPServerIntegration {
    static async integrateWithHTTPServer(mcpServer) {
        const tools = toolRegistry.getAllTools();
        for (const tool of tools) {
            const mcpTool = {
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                handler: async (params) => {
                    const result = await mcpToolsManager.executeTool(tool.name, params);
                    return result;
                },
            };
            if (mcpServer.registerTool) {
                mcpServer.registerTool(mcpTool);
            }
        }
    }
    static async integrateWithStdioServer(mcpServer) {
        const tools = toolRegistry.getAllTools();
        for (const tool of tools) {
            const stdioTool = {
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                handler: async (params) => {
                    const result = await mcpToolsManager.executeTool(tool.name, params);
                    return result;
                },
            };
            if (mcpServer.tools) {
                mcpServer.tools[tool.name] = stdioTool;
            }
        }
    }
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
//# sourceMappingURL=tool-registry.js.map