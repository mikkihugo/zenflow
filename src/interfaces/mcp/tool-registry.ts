/**
 * @fileoverview MCP Tools Registry
 *
 * Central registry for MCP tools from claude-zen.
 * Integrates with existing HTTP and Stdio MCP servers.
 */

import type { DocumentService } from '../../database/services/document-service';
import coordinationTools from './tools/coordination-tools';
import githubIntegrationTools from './tools/github-integration-tools';
import memoryNeuralTools from './tools/memory-neural-tools';
import monitoringTools from './tools/monitoring-tools';
import orchestrationTools from './tools/orchestration-tools';
import { createSPARCIntegrationTools } from './tools/sparc-integration-tools';
import systemTools from './tools/system-tools';

/**
 * MCP Tool interface
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (params: any) => Promise<any>;
  category: string;
  version: string;
  priority: number;
  metadata: {
    tags: string[];
    examples: any[];
  };
  permissions: Array<{ type: string; resource: string }>;
}

/**
 * Simple tool registry
 */
class SimpleToolRegistry {
  private tools = new Map<string, MCPTool>();

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): MCPTool[] {
    const tools: MCPTool[] = [];
    for (const tool of this.tools.values()) {
      tools.push(tool);
    }
    return tools;
  }

  getToolsByCategory(category: string): MCPTool[] {
    return this.getAllTools().filter((tool) => tool.category === category);
  }

  getCategorySummary(): any {
    const categories = new Map<string, number>();
    for (const tool of this.tools.values()) {
      categories.set(tool.category, (categories.get(tool.category) || 0) + 1);
    }
    return Object.fromEntries(categories);
  }

  getToolCount(): number {
    return this.tools.size;
  }
}

export const toolRegistry = new SimpleToolRegistry();

/**
 * MCP Tools Manager
 * Provides centralized management for MCP tools
 */
export class MCPToolsManager {
  private initialized = false;
  private toolStats = new Map<string, { calls: number; errors: number; avgTime: number }>();
  private documentService?: DocumentService;

  constructor(documentService?: DocumentService) {
    this.documentService = documentService;
    this.initializeTools();
  }

  /**
   * Initialize all tools in the registry
   */
  private initializeTools(): void {
    if (this.initialized) return;

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
    } catch (error) {
      console.error('Failed to initialize MCP tools:', error);
    }
  }

  /**
   * Get tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return toolRegistry.getTool(name);
  }

  /**
   * Execute tool with enhanced error handling and metrics
   */
  async executeTool(name: string, params: any): Promise<any> {
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
    } catch (error) {
      // Update error statistics
      this.updateToolStats(name, Date.now() - startTime, true);
      throw error;
    }
  }

  /**
   * List all tools with metadata
   */
  listAllTools(): any {
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
   * Get tools by category
   */
  getToolsByCategory(category: string): MCPTool[] {
    return toolRegistry.getToolsByCategory(category);
  }

  /**
   * Get tool execution statistics
   */
  getToolStats(): any {
    const stats: any = {};
    this.toolStats.forEach((toolStats, toolName) => {
      stats[toolName] = {
        ...toolStats,
        successRate:
          toolStats.calls > 0
            ? `${(((toolStats.calls - toolStats.errors) / toolStats.calls) * 100).toFixed(2)}%`
            : '0%',
      };
    });
    return stats;
  }

  /**
   * Get registry overview
   */
  getRegistryOverview(): any {
    const categoryStats = toolRegistry.getCategorySummary();
    const totalCalls = Array.from(this.toolStats.values()).reduce(
      (sum, stats) => sum + stats.calls,
      0,
    );
    const totalErrors = Array.from(this.toolStats.values()).reduce(
      (sum, stats) => sum + stats.errors,
      0,
    );

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
   * Search tools by tags or keywords
   */
  searchTools(query: string): MCPTool[] {
    const lowercaseQuery = query.toLowerCase();
    return toolRegistry
      .getAllTools()
      .filter(
        (tool) =>
          tool.name.toLowerCase().includes(lowercaseQuery) ||
          tool.description.toLowerCase().includes(lowercaseQuery) ||
          tool.metadata.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
      );
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return toolRegistry.getToolCount();
  }

  /**
   * Check if tool exists
   */
  hasTool(name: string): boolean {
    return toolRegistry.getTool(name) !== undefined;
  }

  /**
   * Get tools requiring specific permissions
   */
  getToolsByPermission(permissionType: string, resource?: string): MCPTool[] {
    return toolRegistry
      .getAllTools()
      .filter((tool) =>
        tool.permissions.some(
          (perm) => perm.type === permissionType && (!resource || perm.resource === resource),
        ),
      );
  }

  private initializeToolStats(toolName: string): void {
    this.toolStats.set(toolName, { calls: 0, errors: 0, avgTime: 0 });
  }

  private updateToolStats(toolName: string, executionTime: number, isError: boolean): void {
    const stats = this.toolStats.get(toolName);
    if (stats) {
      stats.calls++;
      if (isError) stats.errors++;
      stats.avgTime = (stats.avgTime * (stats.calls - 1) + executionTime) / stats.calls;
    }
  }

  private calculateAvgResponseTime(): string {
    const allStats = Array.from(this.toolStats.values());
    if (allStats.length === 0) return '0ms';

    const avgTime = allStats.reduce((sum, stats) => sum + stats.avgTime, 0) / allStats.length;
    return `${Math.round(avgTime)}ms`;
  }
}

// Global instance - initialize without services first
export const mcpToolsManager = new MCPToolsManager();

/**
 * Initialize the MCP tools manager with database services for SPARC integration
 */
export function initializeWithDatabaseServices(documentService: DocumentService): MCPToolsManager {
  // Create new instance with database services for SPARC tools
  const manager = new MCPToolsManager(documentService);
  return manager;
}

/**
 * Integration helper for existing MCP servers
 */
export class MCPServerIntegration {
  /**
   * Register tools with HTTP MCP server
   */
  static async integrateWithHTTPServer(mcpServer: any): Promise<void> {
    const tools = toolRegistry.getAllTools();

    for (const tool of tools) {
      // Convert tool to standard MCP tool format
      const mcpTool = {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        handler: async (params: any) => {
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
   * Register tools with Stdio MCP server
   */
  static async integrateWithStdioServer(mcpServer: any): Promise<void> {
    const tools = toolRegistry.getAllTools();

    for (const tool of tools) {
      // Convert tool to stdio MCP tool format
      const stdioTool = {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        handler: async (params: any) => {
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
   * Create tool discovery endpoint
   */
  static createDiscoveryEndpoint(): any {
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
   * Create tool execution endpoint
   */
  static createExecutionEndpoint(): any {
    return {
      path: '/tools/:toolName',
      method: 'POST',
      handler: async (req: any) => {
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
        } catch (error) {
          return {
            success: false,
            tool: toolName,
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
          };
        }
      },
    };
  }
}

export default mcpToolsManager;
