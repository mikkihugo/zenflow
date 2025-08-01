/**
 * MCP Domain - Index
 * Exports for Model Context Protocol server and tools
 * Unified MCP functionality for Claude Code integration
 */

// Core MCP components
export { MCPServer } from './mcp-server';

// MCP core utilities
export { MCPErrorHandler } from './core/error-handler';
export { MCPMessageHandler } from './core/message-handler';
export { MCPPerformanceMetrics } from './core/performance-metrics';
export { MCPToolExecutor } from './core/tool-executor';

// MCP tools
export * from './tools/neural-tools';
export * from './tools/swarm-tools';

// MCP types
export type * from './types/mcp-types';

// MCP utilities and helpers
export const MCPUtils = {
  /**
   * Create a standard MCP response
   */
  createResponse: (id: string | number, result: any) => ({
    jsonrpc: '2.0',
    id,
    result
  }),

  /**
   * Create a standard MCP error response
   */
  createErrorResponse: (id: string | number, code: number, message: string) => ({
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message
    }
  }),

  /**
   * Validate MCP request format
   */
  validateRequest: (request: any): boolean => {
    return (
      request.jsonrpc === '2.0' &&
      typeof request.method === 'string' &&
      (request.id !== undefined)
    );
  },

  /**
   * Generate unique request ID
   */
  generateId: (): string => {
    return `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Parse MCP tool call
   */
  parseToolCall: (name: string, params: any) => {
    const parts = name.split('__');
    return {
      provider: parts[0] || 'unknown',
      category: parts[1] || 'general',
      tool: parts[2] || name,
      params: params || {}
    };
  },

  /**
   * Format tool response
   */
  formatToolResponse: (result: any, error?: string) => {
    if (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error}`
          }
        ],
        isError: true
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        }
      ],
      isError: false
    };
  }
};

// MCP error codes (following JSON-RPC specification)
export const MCPErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  
  // MCP specific errors
  TOOL_NOT_FOUND: -32000,
  TOOL_EXECUTION_ERROR: -32001,
  PERMISSION_DENIED: -32002,
  RATE_LIMITED: -32003,
  TIMEOUT: -32004
} as const;

// MCP server factory
export class MCPServerFactory {
  private static instances = new Map<string, MCPServer>();

  /**
   * Create or get an MCP server instance
   */
  static getInstance(
    options: any = {},
    instanceKey = 'default'
  ): MCPServer {
    if (!this.instances.has(instanceKey)) {
      const server = new MCPServer(options);
      this.instances.set(instanceKey, server);
    }
    
    return this.instances.get(instanceKey)!;
  }

  /**
   * Clear all cached instances
   */
  static clearInstances(): void {
    for (const [, server] of this.instances) {
      server.stop();
    }
    this.instances.clear();
  }

  /**
   * Get all active server instances
   */
  static getActiveInstances(): string[] {
    return Array.from(this.instances.keys());
  }
}

// Default export is the main MCP server
export { MCPServer as default } from './mcp-server';