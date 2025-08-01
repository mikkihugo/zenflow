#!/usr/bin/env node

/**
 * @fileoverview Claude-Zen MCP Server
 * Model Context Protocol server for claude-zen swarm coordination tools
 */

import { createLogger } from '../utils/logger.js';
import { MCPServer } from './server.js';
import { neuralTools } from './tools/neural-tools.js';
import { swarmTools } from './tools/swarm-tools.js';
import type { MCPTool } from './types/mcp-types.js';

/**
 * Claude-Zen MCP Server with swarm tools
 */
export class ClaudeZenMCPServer extends MCPServer {
  private tools: Record<string, MCPTool>;
  private logger = createLogger({ prefix: 'MCP-Claude-Zen' });

  constructor() {
    super(
      {
        port: 3001,
        host: 'localhost',
        timeout: 30000,
        enabled: true,
      },
      undefined,
      undefined
    );

    this.tools = swarmTools;
    this.setupSwarmHandlers();
    this.logger.info('Claude-Zen MCP Server initialized with swarm tools');
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
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // Register individual tool handlers for convenience
    Object.entries(this.tools).forEach(([name, tool]) => {
      this.registerHandler(`claude-zen/${name}`, async (params: any) => {
        return await tool.handler(params);
      });
    });

    this.logger.info(`Registered ${Object.keys(this.tools).length} swarm tools`);
  }

  /**
   * Start the Claude-Zen MCP server
   */
  async start(): Promise<void> {
    await super.start();
    this.logger.info('Claude-Zen MCP Server ready for swarm coordination');
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
}

// CLI entry point
async function startServer(): Promise<void> {
  const server = new ClaudeZenMCPServer();

  try {
    await server.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down Claude-Zen MCP Server...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nShutting down Claude-Zen MCP Server...');
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
