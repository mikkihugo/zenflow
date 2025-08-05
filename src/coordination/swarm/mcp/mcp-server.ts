/**
 * Unified MCP Server for Claude Code CLI Integration
 * Single stdio MCP server combining coordination and swarm functionality
 */

import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { createLogger } from '../../../core/logger';
import type { MCPServerConfig } from './types';

const logger = createLogger({ prefix: 'UnifiedMCPServer' });

export class StdioMcpServer {
  private server: MCPServer;
  private transport: StdioServerTransport;
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig = {}) {
    this.config = {
      timeout: 30000,
      logLevel: 'info',
      maxConcurrentRequests: 10,
      ...config,
    };

    this.transport = new StdioServerTransport();
    this.server = new MCPServer(
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
    // Tools will be registered by the tool registry
    logger.debug('Tools registration handled by EnhancedMCPTools');
  }

  async stop(): Promise<void> {
    logger.info('Stopping unified MCP server');
    await this.server.close();
  }
}

// Re-export for compatibility
export { StdioMcpServer as MCPServer };
export default StdioMcpServer;
