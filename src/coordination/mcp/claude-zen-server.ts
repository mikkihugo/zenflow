#!/usr/bin/env node

/**
 * @fileoverview Claude-Zen MCP Server
 * Model Context Protocol server for claude-zen swarm coordination tools
 */

import { createLogger } from '../../core/logger';
import { MCPServer } from './server';
import { allFACTTools } from './tools/fact-handlers';
import { swarmTools } from './tools/swarm-tools';
import type { MCPTool } from './types/mcp-types';

/**
 * Claude-Zen MCP Server with swarm tools
 */
export class ClaudeZenMCPServer extends MCPServer {
  private tools: Record<string, MCPTool>;
  private zenLogger = createLogger({ prefix: 'MCP-Claude-Zen' });

  constructor() {
    const logger = createLogger({ prefix: 'MCP-Base' });
    super(
      {
        port: 3001,
        host: 'localhost',
        timeout: 30000,
        enabled: true,
      },
      logger,
    );

    // Combine all tools: swarm tools + FACT tools
    this.tools = {
      ...swarmTools,
      ...allFACTTools,
    };
    this.setupSwarmHandlers();
    this.zenLogger.info('Claude-Zen MCP Server initialized with swarm and FACT tools');
  }

  private setupSwarmHandlers(): void {
    // Register tools/list handler
    this.registerHandler('tools/list', async () => {
      return {
        tools: Object.entries(this.tools).map(([name, tool]) => ({
          name: name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Register tools/call handler
    this.registerHandler('tools/call', async (params: { name: string; arguments?: any }) => {
      const { name, arguments: args } = params;

      if (!this.tools[name]) {
        throw new Error(`Tool "${name}" not found`);
      }

      try {
        const tool = this.tools[name];
        const result = await tool.handler(args || {});
        return result;
      } catch (error) {
        throw new Error(
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    // Register individual tool handlers for convenience
    Object.entries(this.tools).forEach(([name, tool]) => {
      this.registerHandler(`claude-zen/${name}`, async (params: any) => {
        return await tool.handler(params);
      });
    });

    this.zenLogger.info(`Registered ${Object.keys(this.tools).length} tools (swarm + FACT)`);
  }

  /**
   * Start the Claude-Zen MCP server
   */
  async start(): Promise<void> {
    await super.start();
    this.zenLogger.info(
      'Claude-Zen MCP Server ready for swarm coordination and FACT knowledge gathering',
    );
  }

  /**
   * Get available tools
   */
  getTools(): Record<string, MCPTool> {
    return this.tools;
  }

  /**
   * Execute a tool directly
   */
  async executeTool(name: string, params: any): Promise<any> {
    if (!this.tools[name]) {
      throw new Error(`Tool "${name}" not found`);
    }

    return await this.tools[name].handler(params);
  }

  /**
   * Execute multiple file operations in batch
   */
  async executeFileBatch(operations: Array<{ type: string; params: any }>): Promise<any[]> {
    const results = [];
    for (const operation of operations) {
      try {
        // Simulate file operation execution
        const result = await this.executeOperation(operation);
        results.push({ success: true, result });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  }

  /**
   * Execute multiple swarm operations in batch
   */
  async executeSwarmBatch(operations: Array<{ toolName: string; params: any }>): Promise<any[]> {
    const results = [];
    for (const operation of operations) {
      try {
        const result = await this.executeTool(operation.toolName, operation.params);
        results.push({ success: true, result });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  }

  /**
   * Call any registered tool by name
   */
  async callTool(name: string, params: any): Promise<any> {
    return await this.executeTool(name, params);
  }

  /**
   * Execute a generic operation (helper method)
   */
  private async executeOperation(operation: { type: string; params: any }): Promise<any> {
    // This is a placeholder for actual file operations
    // In a real implementation, this would dispatch to appropriate handlers
    return {
      type: operation.type,
      params: operation.params,
      timestamp: Date.now(),
      executionTime: Math.random() * 100, // Simulated execution time
    };
  }
}

// CLI entry point
async function startServer(): Promise<void> {
  const server = new ClaudeZenMCPServer();

  try {
    await server.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.stop();
      process.exit(0);
    });

    // Keep the process alive
    process.stdin.resume();
  } catch (error) {
    console.error('Failed to start Claude-Zen MCP Server:', error);
    process.exit(1);
  }
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

export default ClaudeZenMCPServer;
