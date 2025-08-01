/**
 * @fileoverview MCP Types for Claude-Zen
 * Type definitions for Model Context Protocol integration
 */

export interface MCPToolResult {
  success: boolean;
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<MCPToolResult>;
}

export interface MCPServer {
  name: string;
  version: string;
  tools: Record<string, MCPTool>;
  resources?: Array<{
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
  }>;
}

export interface SwarmAgent {
  id: string;
  type: string;
  name: string;
  specialization: string;
  capabilities: string[];
  status: 'idle' | 'active' | 'busy' | 'error';
  metrics: {
    tasksCompleted: number;
    successRate: number;
    avgExecutionTime: number;
  };
}

export interface SwarmTask {
  id: string;
  description: string;
  strategy: 'sequential' | 'parallel' | 'adaptive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedAgents: string[];
  startTime?: number;
  endTime?: number;
  result?: any;
}

export interface SwarmStatus {
  activeSwarms: number;
  totalAgents: number;
  activeTasks: number;
  completedTasks: number;
  agentsByType: Array<{
    type: string;
    count: number;
  }>;
  metrics: {
    avgTaskTime: number;
    successRate: number;
    memoryUsage: number;
  };
}