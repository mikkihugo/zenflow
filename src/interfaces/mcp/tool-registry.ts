/**
 * MCP Tool Registry
 *
 * Manages registration and execution of MCP tools for the HTTP MCP server.
 * Provides a centralized registry for all available tools and their schemas.
 */

import { createLogger } from './simple-logger.js';

const logger = createLogger('MCP-ToolRegistry');

export interface MCPToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolDefinition extends MCPToolSchema {
  handler: (params: any) => Promise<any>;
}

export interface MCPToolInfo {
  name: string;
  description: string;
  inputSchema: MCPToolSchema['inputSchema'];
}

/**
 * Registry for MCP tools
 */
export class MCPToolRegistry {
  private tools = new Map<string, MCPToolDefinition>();
  private executionStats = new Map<
    string,
    {
      calls: number;
      totalTime: number;
      errors: number;
      lastCalled: Date;
    }
  >();

  constructor() {
    logger.debug('Initializing MCP Tool Registry');
  }

  /**
   * Register a new MCP tool
   */
  registerTool(schema: MCPToolSchema, handler: (params: any) => Promise<any>): void {
    if (this.tools.has(schema.name)) {
      logger.warn(`Tool ${schema.name} already registered, overwriting`);
    }

    // Validate schema
    this.validateToolSchema(schema);

    const tool: MCPToolDefinition = {
      ...schema,
      handler: this.wrapHandler(schema.name, handler),
    };

    this.tools.set(schema.name, tool);
    this.initializeStats(schema.name);

    logger.info(`Registered MCP tool: ${schema.name}`);
  }

  /**
   * Get tool definition by name
   */
  getTool(name: string): MCPToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * List all registered tools
   */
  async listTools(): Promise<MCPToolInfo[]> {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  /**
   * Execute a tool with given parameters
   */
  async executeTool(name: string, params: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    // Validate parameters against schema
    this.validateParameters(tool, params);

    // Execute the tool
    try {
      const result = await tool.handler(params);
      return result;
    } catch (error) {
      this.updateErrorStats(name);
      throw error;
    }
  }

  /**
   * Get tool execution statistics
   */
  getToolStats(name?: string): any {
    if (name) {
      return this.executionStats.get(name) || null;
    }

    const stats: any = {};
    for (const [toolName, toolStats] of this.executionStats.entries()) {
      stats[toolName] = {
        ...toolStats,
        averageTime: toolStats.calls > 0 ? toolStats.totalTime / toolStats.calls : 0,
      };
    }

    return stats;
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): any {
    const totalCalls = Array.from(this.executionStats.values()).reduce(
      (sum, stats) => sum + stats.calls,
      0
    );

    const totalErrors = Array.from(this.executionStats.values()).reduce(
      (sum, stats) => sum + stats.errors,
      0
    );

    return {
      totalTools: this.tools.size,
      totalCalls,
      totalErrors,
      errorRate: totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0,
      mostUsedTool: this.getMostUsedTool(),
      lastActivity: this.getLastActivity(),
    };
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Clear all tools (for testing)
   */
  clear(): void {
    this.tools.clear();
    this.executionStats.clear();
    logger.debug('Tool registry cleared');
  }

  /**
   * Validate tool schema
   */
  private validateToolSchema(schema: MCPToolSchema): void {
    if (!schema.name || typeof schema.name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }

    if (!schema.description || typeof schema.description !== 'string') {
      throw new Error('Tool description is required and must be a string');
    }

    if (!schema.inputSchema || schema.inputSchema.type !== 'object') {
      throw new Error('Tool inputSchema is required and must be an object type');
    }

    if (!schema.inputSchema.properties || typeof schema.inputSchema.properties !== 'object') {
      throw new Error('Tool inputSchema must have properties');
    }
  }

  /**
   * Validate parameters against tool schema
   */
  private validateParameters(tool: MCPToolDefinition, params: any): void {
    const { inputSchema } = tool;

    // Check required parameters
    if (inputSchema.required) {
      for (const required of inputSchema.required) {
        if (!(required in (params || {}))) {
          throw new Error(`Missing required parameter: ${required}`);
        }
      }
    }

    // Basic type validation
    if (params && typeof params !== 'object') {
      throw new Error('Parameters must be an object');
    }

    // Validate parameter types (basic validation)
    if (params) {
      for (const [paramName, paramValue] of Object.entries(params)) {
        const paramSchema = inputSchema.properties[paramName];
        if (paramSchema && !this.validateParameterType(paramValue, paramSchema)) {
          throw new Error(`Invalid type for parameter ${paramName}: expected ${paramSchema.type}`);
        }
      }
    }
  }

  /**
   * Basic parameter type validation
   */
  private validateParameterType(value: any, schema: any): boolean {
    if (schema.type === 'string') {
      return typeof value === 'string';
    }
    if (schema.type === 'number') {
      return typeof value === 'number';
    }
    if (schema.type === 'boolean') {
      return typeof value === 'boolean';
    }
    if (schema.type === 'array') {
      return Array.isArray(value);
    }
    if (schema.type === 'object') {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    // Allow any other types
    return true;
  }

  /**
   * Wrap tool handler with metrics and error handling
   */
  private wrapHandler(toolName: string, handler: (params: any) => Promise<any>) {
    return async (params: any): Promise<any> => {
      const startTime = Date.now();

      try {
        logger.debug(`Executing tool: ${toolName}`, { params });

        const result = await handler(params);

        const executionTime = Date.now() - startTime;
        this.updateSuccessStats(toolName, executionTime);

        logger.debug(`Tool ${toolName} completed in ${executionTime}ms`);

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        logger.error(`Tool ${toolName} failed after ${executionTime}ms:`, error);

        this.updateErrorStats(toolName);
        throw error;
      }
    };
  }

  /**
   * Initialize stats for a tool
   */
  private initializeStats(toolName: string): void {
    this.executionStats.set(toolName, {
      calls: 0,
      totalTime: 0,
      errors: 0,
      lastCalled: new Date(),
    });
  }

  /**
   * Update success statistics
   */
  private updateSuccessStats(toolName: string, executionTime: number): void {
    const stats = this.executionStats.get(toolName);
    if (stats) {
      stats.calls++;
      stats.totalTime += executionTime;
      stats.lastCalled = new Date();
    }
  }

  /**
   * Update error statistics
   */
  private updateErrorStats(toolName: string): void {
    const stats = this.executionStats.get(toolName);
    if (stats) {
      stats.errors++;
      stats.lastCalled = new Date();
    }
  }

  /**
   * Get most used tool
   */
  private getMostUsedTool(): string | null {
    let mostUsed: string | null = null;
    let maxCalls = 0;

    for (const [toolName, stats] of this.executionStats.entries()) {
      if (stats.calls > maxCalls) {
        maxCalls = stats.calls;
        mostUsed = toolName;
      }
    }

    return mostUsed;
  }

  /**
   * Get last activity timestamp
   */
  private getLastActivity(): Date | null {
    let lastActivity: Date | null = null;

    for (const stats of this.executionStats.values()) {
      if (!lastActivity || stats.lastCalled > lastActivity) {
        lastActivity = stats.lastCalled;
      }
    }

    return lastActivity;
  }
}

export default MCPToolRegistry;
