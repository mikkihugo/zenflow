/**
 * @fileoverview Advanced MCP Tools Registry
 *
 * Central registry for all 87 advanced MCP tools from claude-zen.
 * Integrates with existing HTTP and Stdio MCP servers.
 */

import type { UnifiedWorkflowEngine } from '../../core/unified-workflow-engine';
import type { DocumentService } from '../../database/services/document-service';
import { type AdvancedMCPTool, advancedToolRegistry } from './advanced-tools';
import coordinationTools from './tools/coordination-tools';
import githubIntegrationTools from './tools/github-integration-tools';
import memoryNeuralTools from './tools/memory-neural-tools';
import monitoringTools from './tools/monitoring-tools';
import orchestrationTools from './tools/orchestration-tools';
import { createSPARCIntegrationTools } from './tools/sparc-integration-tools';
import systemTools from './tools/system-tools';

/**
 * Advanced MCP Tools Manager
 * Provides centralized management for all advanced tools including SPARC integration
 */
export class AdvancedMCPToolsManager {
  private initialized = false;
  private toolStats = new Map<string, { calls: number; errors: number; avgTime: number }>();
  private documentService?: DocumentService;
  private workflowEngine?: UnifiedWorkflowEngine;

  constructor(documentService?: DocumentService, workflowEngine?: UnifiedWorkflowEngine) {
    this.documentService = documentService;
    this.workflowEngine = workflowEngine;
    this.initializeTools();
  }

  /**
   * Initialize all advanced tools in the registry
   */
  private initializeTools(): void {
    if (this.initialized) return;

    // Register Coordination Tools (12 tools)
    coordinationTools.forEach((tool) => {
      advancedToolRegistry.registerTool(tool);
      this.initializeToolStats(tool.name);
    });

    // Register Monitoring Tools (15 tools)
    monitoringTools.forEach((tool) => {
      advancedToolRegistry.registerTool(tool);
      this.initializeToolStats(tool.name);
    });

    // Register Memory & Neural Tools (18 tools)
    memoryNeuralTools.forEach((tool) => {
      advancedToolRegistry.registerTool(tool);
      this.initializeToolStats(tool.name);
    });

    // Register GitHub Integration Tools (20 tools)
    githubIntegrationTools.forEach((tool) => {
      advancedToolRegistry.registerTool(tool);
      this.initializeToolStats(tool.name);
    });

    // Register System Tools (12 tools)
    systemTools.forEach((tool) => {
      advancedToolRegistry.registerTool(tool);
      this.initializeToolStats(tool.name);
    });

    // Register Orchestration Tools (10 tools)
    orchestrationTools.forEach((tool) => {
      advancedToolRegistry.registerTool(tool);
      this.initializeToolStats(tool.name);
    });

    // Register SPARC Integration Tools (6 tools) - DATABASE-DRIVEN
    if (this.documentService && this.workflowEngine) {
      const sparcTools = createSPARCIntegrationTools(this.documentService, this.workflowEngine);
      sparcTools.forEach((tool) => {
        advancedToolRegistry.registerTool(tool);
        this.initializeToolStats(tool.name);
      });
    } else {
    }

    this.initialized = true;
  }

  /**
   * Get tool by name
   */
  getTool(name: string): AdvancedMCPTool | undefined {
    return advancedToolRegistry.getTool(name);
  }

  /**
   * Execute tool with enhanced error handling and metrics
   */
  async executeTool(name: string, params: any): Promise<any> {
    const startTime = Date.now();
    const tool = this.getTool(name);

    if (!tool) {
      throw new Error(`Advanced tool not found: ${name}`);
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
    const tools = advancedToolRegistry.getAllTools();
    const categoryStats = advancedToolRegistry.getCategorySummary();

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
  getToolsByCategory(category: string): AdvancedMCPTool[] {
    return advancedToolRegistry.getToolsByCategory(category as any);
  }

  /**
   * Get tool execution statistics
   */
  getToolStats(): any {
    const stats: any = {};
    for (const [toolName, toolStats] of this.toolStats.entries()) {
      stats[toolName] = {
        ...toolStats,
        successRate:
          toolStats.calls > 0
            ? `${(((toolStats.calls - toolStats.errors) / toolStats.calls) * 100).toFixed(2)}%`
            : '0%',
      };
    }
    return stats;
  }

  /**
   * Get registry overview
   */
  getRegistryOverview(): any {
    const categoryStats = advancedToolRegistry.getCategorySummary();
    const totalCalls = Array.from(this.toolStats.values()).reduce(
      (sum, stats) => sum + stats.calls,
      0
    );
    const totalErrors = Array.from(this.toolStats.values()).reduce(
      (sum, stats) => sum + stats.errors,
      0
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
  searchTools(query: string): AdvancedMCPTool[] {
    const lowercaseQuery = query.toLowerCase();
    return advancedToolRegistry
      .getAllTools()
      .filter(
        (tool) =>
          tool.name.toLowerCase().includes(lowercaseQuery) ||
          tool.description.toLowerCase().includes(lowercaseQuery) ||
          tool.metadata.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
      );
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return advancedToolRegistry.getToolCount();
  }

  /**
   * Check if tool exists
   */
  hasTool(name: string): boolean {
    return advancedToolRegistry.getTool(name) !== undefined;
  }

  /**
   * Get tools requiring specific permissions
   */
  getToolsByPermission(permissionType: string, resource?: string): AdvancedMCPTool[] {
    return advancedToolRegistry
      .getAllTools()
      .filter((tool) =>
        tool.permissions.some(
          (perm) => perm.type === permissionType && (!resource || perm.resource === resource)
        )
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
export const advancedMCPToolsManager = new AdvancedMCPToolsManager();

/**
 * Initialize the advanced MCP tools manager with database services for SPARC integration
 */
export function initializeWithDatabaseServices(
  documentService: DocumentService,
  workflowEngine: UnifiedWorkflowEngine
): AdvancedMCPToolsManager {
  // Create new instance with database services for SPARC tools
  const advancedManager = new AdvancedMCPToolsManager(documentService, workflowEngine);
  return advancedManager;
}

/**
 * Integration helper for existing MCP servers
 */
export class MCPServerIntegration {
  /**
   * Register advanced tools with HTTP MCP server
   */
  static async integrateWithHTTPServer(mcpServer: any): Promise<void> {
    const tools = advancedToolRegistry.getAllTools();

    for (const tool of tools) {
      // Convert advanced tool to standard MCP tool format
      const mcpTool = {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        handler: async (params: any) => {
          const result = await advancedMCPToolsManager.executeTool(tool.name, params);
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
   * Register advanced tools with Stdio MCP server
   */
  static async integrateWithStdioServer(mcpServer: any): Promise<void> {
    const tools = advancedToolRegistry.getAllTools();

    for (const tool of tools) {
      // Convert advanced tool to stdio MCP tool format
      const stdioTool = {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        handler: async (params: any) => {
          const result = await advancedMCPToolsManager.executeTool(tool.name, params);
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
      path: '/advanced-tools',
      handler: async () => {
        return {
          success: true,
          data: advancedMCPToolsManager.listAllTools(),
          metadata: {
            version: '2.0.0',
            totalTools: advancedMCPToolsManager.getToolCount(),
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
      path: '/advanced-tools/:toolName',
      method: 'POST',
      handler: async (req: any) => {
        const { toolName } = req.params;
        const params = req.body;

        try {
          const result = await advancedMCPToolsManager.executeTool(toolName, params);
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
            error: error.message,
            timestamp: new Date().toISOString(),
          };
        }
      },
    };
  }
}

export default advancedMCPToolsManager;
