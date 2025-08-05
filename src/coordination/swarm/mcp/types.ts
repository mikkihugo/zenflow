/**
 * Unified MCP Types for Coordination and Swarm Integration
 * Consolidates all MCP-related types into single source of truth
 */

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<MCPToolResult>;
  category: 'coordination' | 'swarm' | 'system' | 'neural' | 'memory';
  version: string;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime?: number;
    toolVersion?: string;
    warnings?: string[];
  };
}

export interface MCPRequest {
  method: string;
  params?: any;
  id?: string | number;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number;
}

export interface MCPServerConfig {
  port?: number;
  host?: string;
  timeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  maxConcurrentRequests?: number;
}

// Re-export from DAA tools for compatibility
export * from './mcp-daa-tools';