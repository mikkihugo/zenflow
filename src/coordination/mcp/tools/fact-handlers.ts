/**
 * @fileoverview FACT System MCP Tool Handlers
 * Comprehensive handlers for all FACT (Fast Augmented Context Tools) MCP operations
 */

import { createLogger } from '../../../core/logger';
import type { MCPTool, MCPToolResult } from '../types/mcp-types';
import { factStorageTools } from './fact-storage-tools';
import { factSwarmTools } from './fact-swarm-tools';
import { factCoreTools } from './fact-tools';

const logger = createLogger({ prefix: 'MCP-FACT-Handlers' });

/**
 * FACT Tool Handler Registry
 * Central registry for all FACT MCP tools with unified error handling and logging
 */
export class FACTToolHandlers {
  private static instance: FACTToolHandlers;
  private tools = new Map<string, MCPTool>();
  private handlerStats = new Map<string, { calls: number; errors: number; avgTime: number }>();

  private constructor() {
    this.registerAllTools();
  }

  public static getInstance(): FACTToolHandlers {
    if (!FACTToolHandlers.instance) {
      FACTToolHandlers.instance = new FACTToolHandlers();
    }
    return FACTToolHandlers.instance;
  }

  /**
   * Register all FACT tools
   */
  private registerAllTools(): void {
    logger.info('Registering FACT MCP tools...');

    // Register core FACT tools
    this.registerToolGroup(factCoreTools, 'Core');

    // Register swarm coordination tools
    this.registerToolGroup(factSwarmTools, 'Swarm');

    // Register storage management tools
    this.registerToolGroup(factStorageTools, 'Storage');

    logger.info(`✅ Registered ${this.tools.size} FACT MCP tools`);
  }

  /**
   * Register a group of tools
   */
  private registerToolGroup(toolGroup: Record<string, MCPTool>, groupName: string): void {
    for (const [toolName, tool] of Object.entries(toolGroup)) {
      // Wrap handler with error handling and metrics
      const wrappedTool: MCPTool = {
        ...tool,
        handler: this.wrapHandler(toolName, tool.handler),
      };

      this.tools.set(toolName, wrappedTool);
      this.handlerStats.set(toolName, { calls: 0, errors: 0, avgTime: 0 });
    }

    logger.info(`📦 Registered ${Object.keys(toolGroup).length} ${groupName} tools`);
  }

  /**
   * Wrap tool handler with error handling, logging, and metrics
   */
  private wrapHandler(
    toolName: string,
    originalHandler: (params: any) => Promise<MCPToolResult>
  ): (params: any) => Promise<MCPToolResult> {
    return async (params: any): Promise<MCPToolResult> => {
      const startTime = Date.now();
      const stats = this.handlerStats.get(toolName)!;

      try {
        logger.info(`🚀 Executing FACT tool: ${toolName}`, { params });

        // Execute original handler
        const result = await originalHandler(params);

        // Update metrics
        const executionTime = Date.now() - startTime;
        stats.calls++;
        stats.avgTime = (stats.avgTime * (stats.calls - 1) + executionTime) / stats.calls;

        // Log result
        if (result.success) {
          logger.info(`✅ FACT tool completed: ${toolName} (${executionTime}ms)`);
        } else {
          logger.warn(`⚠️  FACT tool completed with issues: ${toolName} (${executionTime}ms)`, {
            error: result.error,
          });
        }

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        stats.calls++;
        stats.errors++;
        stats.avgTime = (stats.avgTime * (stats.calls - 1) + executionTime) / stats.calls;

        logger.error(`❌ FACT tool failed: ${toolName} (${executionTime}ms)`, error);

        return {
          success: false,
          content: [
            {
              type: 'text',
              text: `❌ FACT Tool Execution Failed

🔧 Tool: ${toolName}
⚠️  Error: ${error instanceof Error ? error.message : String(error)}
⏱️  Execution Time: ${executionTime}ms

🔍 Troubleshooting:
  1. Check if FACT system is initialized (use fact_init)
  2. Verify tool parameters are correct
  3. Check system logs for detailed error information
  4. Try fact_status to check system health

📞 If issue persists, this may be a system-level error requiring investigation.`,
            },
          ],
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };
  }

  /**
   * Get tool by name
   */
  public getTool(toolName: string): MCPTool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Get all registered tools
   */
  public getAllTools(): Record<string, MCPTool> {
    const toolsObject: Record<string, MCPTool> = {};
    for (const [name, tool] of this.tools.entries()) {
      toolsObject[name] = tool;
    }
    return toolsObject;
  }

  /**
   * Get tool names by category
   */
  public getToolsByCategory(): Record<string, string[]> {
    const categories = {
      core: [],
      swarm: [],
      storage: [],
    } as Record<string, string[]>;

    for (const toolName of this.tools.keys()) {
      if (toolName.startsWith('fact_swarm_')) {
        categories.swarm.push(toolName);
      } else if (toolName.startsWith('fact_cache_') || toolName.startsWith('fact_storage_')) {
        categories.storage.push(toolName);
      } else {
        categories.core.push(toolName);
      }
    }

    return categories;
  }

  /**
   * Get handler statistics
   */
  public getHandlerStats(): Record<
    string,
    { calls: number; errors: number; avgTime: number; successRate: number }
  > {
    const stats: Record<string, any> = {};

    for (const [toolName, toolStats] of this.handlerStats.entries()) {
      stats[toolName] = {
        ...toolStats,
        successRate:
          toolStats.calls > 0
            ? ((toolStats.calls - toolStats.errors) / toolStats.calls) * 100
            : 100,
      };
    }

    return stats;
  }

  /**
   * Reset handler statistics
   */
  public resetStats(): void {
    for (const stats of this.handlerStats.values()) {
      stats.calls = 0;
      stats.errors = 0;
      stats.avgTime = 0;
    }
    logger.info('📊 FACT handler statistics reset');
  }

  /**
   * Get system health summary
   */
  public getSystemHealthSummary(): {
    totalTools: number;
    totalCalls: number;
    totalErrors: number;
    avgSuccessRate: number;
    avgExecutionTime: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const stats = this.getHandlerStats();
    const toolNames = Object.keys(stats);

    const totalCalls = toolNames.reduce((sum, name) => sum + stats[name].calls, 0);
    const totalErrors = toolNames.reduce((sum, name) => sum + stats[name].errors, 0);
    const avgSuccessRate =
      toolNames.length > 0
        ? toolNames.reduce((sum, name) => sum + stats[name].successRate, 0) / toolNames.length
        : 100;
    const avgExecutionTime =
      toolNames.length > 0
        ? toolNames.reduce((sum, name) => sum + stats[name].avgTime, 0) / toolNames.length
        : 0;

    let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (avgSuccessRate < 70) healthStatus = 'poor';
    else if (avgSuccessRate < 85) healthStatus = 'fair';
    else if (avgSuccessRate < 95) healthStatus = 'good';

    return {
      totalTools: this.tools.size,
      totalCalls,
      totalErrors,
      avgSuccessRate,
      avgExecutionTime,
      healthStatus,
    };
  }

  /**
   * Execute tool with comprehensive error handling
   */
  public async executeTool(toolName: string, params: any): Promise<MCPToolResult> {
    const tool = this.getTool(toolName);

    if (!tool) {
      logger.error(`Unknown FACT tool: ${toolName}`);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ Unknown FACT Tool: ${toolName}

Available FACT tools:
${Array.from(this.tools.keys())
  .map((name) => `  • ${name}`)
  .join('\n')}

Use one of the above tool names.`,
          },
        ],
        error: `Tool '${toolName}' not found`,
      };
    }

    return await tool.handler(params);
  }

  /**
   * Validate tool parameters against schema
   */
  public validateToolParams(toolName: string, params: any): { valid: boolean; errors: string[] } {
    const tool = this.getTool(toolName);

    if (!tool) {
      return { valid: false, errors: [`Tool '${toolName}' not found`] };
    }

    const schema = tool.inputSchema;
    const errors: string[] = [];

    // Check required parameters
    if (schema.required) {
      for (const requiredParam of schema.required) {
        if (!(requiredParam in params)) {
          errors.push(`Missing required parameter: ${requiredParam}`);
        }
      }
    }

    // Basic type checking (simplified)
    for (const [paramName, paramValue] of Object.entries(params)) {
      const paramSchema = schema.properties[paramName];
      if (paramSchema) {
        // Check enum values
        if (paramSchema.enum && !paramSchema.enum.includes(paramValue)) {
          errors.push(`Parameter '${paramName}' must be one of: ${paramSchema.enum.join(', ')}`);
        }

        // Check number ranges
        if (paramSchema.type === 'number') {
          const numValue = Number(paramValue);
          if (paramSchema.minimum !== undefined && numValue < paramSchema.minimum) {
            errors.push(`Parameter '${paramName}' must be >= ${paramSchema.minimum}`);
          }
          if (paramSchema.maximum !== undefined && numValue > paramSchema.maximum) {
            errors.push(`Parameter '${paramName}' must be <= ${paramSchema.maximum}`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const factHandlers = FACTToolHandlers.getInstance();

// Export all tools for easy access
export const allFACTTools = factHandlers.getAllTools();
