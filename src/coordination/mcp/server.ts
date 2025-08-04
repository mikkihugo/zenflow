/**
 * MCP Server - Model Context Protocol server implementation
 * Provides a simple MCP server for claude-zen integration
 */

import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/logger';

export interface MCPConfig {
  port: number;
  host: string;
  timeout: number;
  enabled?: boolean;
}

export interface MCPRequest {
  id: string;
  method: string;
  params?: any;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Simple MCP Server implementation
 */
export class MCPServer extends EventEmitter {
  private config: Required<MCPConfig>;
  private isRunning = false;
  private requestHandlers = new Map<string, (params: any) => Promise<any>>();

  constructor(
    config: MCPConfig,
    private logger?: ILogger
  ) {
    super();

    this.config = {
      port: config.port,
      host: config.host,
      timeout: config.timeout,
      enabled: config.enabled !== false,
    };

    this.setupDefaultHandlers();
    this.logger?.info('MCPServer initialized');
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    if (!this.config.enabled || this.isRunning) {
      return;
    }

    this.logger?.info(`Starting MCP server on ${this.config.host}:${this.config.port}`);

    // In a real implementation, this would start an HTTP/WebSocket server
    // For now, it's just a placeholder

    this.isRunning = true;
    this.emit('started');
    this.logger?.info('MCP server started');
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logger?.info('Stopping MCP server...');

    this.isRunning = false;
    this.emit('stopped');
    this.logger?.info('MCP server stopped');
  }

  /**
   * Handle MCP request
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const handler = this.requestHandlers.get(request.method);
      if (!handler) {
        return {
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`,
          },
        };
      }

      const result = await handler(request.params || {});
      return {
        id: request.id,
        result,
      };
    } catch (error) {
      this.logger?.error(`MCP request failed: ${request.method}`, { error });
      return {
        id: request.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error',
        },
      };
    }
  }

  /**
   * Register a request handler
   */
  registerHandler(method: string, handler: (params: any) => Promise<any>): void {
    this.requestHandlers.set(method, handler);
    this.logger?.debug(`Registered MCP handler: ${method}`);
  }

  /**
   * Get server status
   */
  getStatus(): {
    running: boolean;
    enabled: boolean;
    host: string;
    port: number;
    handlers: string[];
  } {
    return {
      running: this.isRunning,
      enabled: this.config.enabled,
      host: this.config.host,
      port: this.config.port,
      handlers: Array.from(this.requestHandlers.keys()),
    };
  }

  private setupDefaultHandlers(): void {
    // Ping handler
    this.registerHandler('ping', async () => ({
      message: 'pong',
      timestamp: new Date().toISOString(),
    }));

    // Status handler
    this.registerHandler('status', async () => this.getStatus());

    // Info handler
    this.registerHandler('info', async () => ({
      name: 'claude-zen-mcp',
      version: '1.0.0',
      capabilities: ['tools', 'resources'],
    }));
  }
}

export default MCPServer;
