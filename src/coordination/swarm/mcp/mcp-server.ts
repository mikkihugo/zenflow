/**
 * Unified MCP Server for Claude Code CLI Integration
 * Single stdio MCP server combining coordination and swarm functionality
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { z } from 'zod';
import { createLogger } from '../../../core/logger';
import { SwarmTools } from './swarm-tools';
import { HiveTools } from './hive-tools';
import type { MCPServerConfig } from './types';

const logger = createLogger({ prefix: 'UnifiedMCPServer' });

export class StdioMcpServer {
  private server: McpServer;
  private transport: StdioServerTransport;
  private config: MCPServerConfig;
  private toolRegistry: SwarmTools;
  private hiveRegistry: HiveTools;

  constructor(config: MCPServerConfig = {}) {
    this.config = {
      timeout: 30000,
      logLevel: 'info',
      maxConcurrentRequests: 10,
      ...config,
    };

    this.transport = new StdioServerTransport();
    this.toolRegistry = new SwarmTools();
    this.hiveRegistry = new HiveTools();
    
    this.server = new McpServer(
      {
        name: 'claude-zen-unified',
        version: '2.0.0-alpha.73',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          logging: {},
        },
      }
    );
  }

  async start(): Promise<void> {
    logger.info('Starting unified MCP server for Claude Code CLI');

    // Register all tools from the tool registry
    await this.registerTools();

    // Connect server to transport
    await this.server.connect(this.transport);
    logger.info('Unified MCP server started successfully');
  }

  private async registerTools(): Promise<void> {
    logger.info('Registering swarm and hive MCP tools...');
    
    // Get all tools from both registries
    const swarmTools = this.toolRegistry.tools;
    const hiveTools = this.hiveRegistry.tools;
    const tools = { ...swarmTools, ...hiveTools };
    
    // Register each tool with the MCP server using the official SDK pattern
    for (const [toolName, toolFunction] of Object.entries(tools)) {
      try {
        this.server.tool(
          toolName,
          `Swarm ${toolName.replace('_', ' ')} operation`,
          {
            // Basic parameters that all tools can accept
            params: z.record(z.any()).optional().describe('Tool parameters'),
          },
          async (args) => {
            try {
              logger.debug(`Executing tool: ${toolName}`, { args });
              const result = await toolFunction(args?.params || {});
              return { result };
            } catch (error) {
              logger.error(`Tool execution failed: ${toolName}`, error);
              throw error;
            }
          }
        );
        
        logger.debug(`Registered tool: ${toolName}`);
      } catch (error) {
        logger.error(`Failed to register tool ${toolName}:`, error);
      }
    }
    
    logger.info(`Registered ${Object.keys(swarmTools).length} swarm tools and ${Object.keys(hiveTools).length} hive tools`);
  }

  async stop(): Promise<void> {
    logger.info('Stopping unified MCP server');
    await this.server.close();
  }
}

// Re-export for compatibility
export { StdioMcpServer as MCPServer };
export default StdioMcpServer;

// Main execution when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new StdioMcpServer();
  
  server.start().catch((error) => {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}
