/**
 * Tool registry for MCP
 */

import { MCPTool } from '../utils/types.ts';
import { ILogger } from '../core/logger.ts';
import { MCPError } from '../utils/errors.ts';

/**
 * Tool registry implementation
 */
export class ToolRegistry {
  private tools = new Map<string, MCPTool>();

  constructor(private logger: ILogger) {}

  /**
   * Registers a new tool
   */
  register(tool: MCPTool): void {
    if (this.tools.has(tool.name)) {
      throw new MCPError(`Tool already registered: ${tool.name}`);
    }

    // Validate tool schema
    this.validateTool(tool);

    this.tools.set(tool.name, tool);
    this.logger.debug('Tool registered', { name: tool.name });
  }

  /**
   * Unregisters a tool
   */
  unregister(name: string): void {
    if (!this.tools.has(name)) {
      throw new MCPError(`Tool not found: ${name}`);
    }

    this.tools.delete(name);
    this.logger.debug('Tool unregistered', { name });
  }

  /**
   * Gets a tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Lists all registered tools
   */
  listTools(): Array<{ name: string; description: string }> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
    }));
  }

  /**
   * Gets the number of registered tools
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Executes a tool
   */
  async executeTool(name: string, input: unknown): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new MCPError(`Tool not found: ${name}`);
    }

    this.logger.debug('Executing tool', { name, input });

    try {
      // Validate input against schema
      this.validateInput(tool, input);

      // Execute tool handler
      const result = await tool.handler(input);

      this.logger.debug('Tool executed successfully', { name });
      return result;
    } catch (error) {
      this.logger.error('Tool execution failed', { name, error });
      throw error;
    }
  }

  /**
   * Validates tool definition
   */
  private validateTool(tool: MCPTool): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new MCPError('Tool name must be a non-empty string');
    }

    if (!tool.description || typeof tool.description !== 'string') {
      throw new MCPError('Tool description must be a non-empty string');
    }

    if (typeof tool.handler !== 'function') {
      throw new MCPError('Tool handler must be a function');
    }

    if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
      throw new MCPError('Tool inputSchema must be an object');
    }

    // Validate tool name format (namespace/name)
    if (!tool.name.includes('/')) {
      throw new MCPError('Tool name must be in format: namespace/name');
    }
  }

  /**
   * Validates input against tool schema
   */
  private validateInput(tool: MCPTool, input: unknown): void {
    // Simple validation - in production, use a JSON Schema validator
    const schema = tool.inputSchema as any;

    if (schema.type === 'object' && schema.properties) {
      if (typeof input !== 'object' || input === null) {
        throw new MCPError('Input must be an object');
      }

      const inputObj = input as Record<string, unknown>;

      // Check required properties
      if (schema.required && Array.isArray(schema.required)) {
        for (const prop of schema.required) {
          if (!(prop in inputObj)) {
            throw new MCPError(`Missing required property: ${prop}`);
          }
        }
      }

      // Check property types
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (prop in inputObj) {
          const value = inputObj[prop];
          const expectedType = (propSchema as any).type;

          if (expectedType && !this.checkType(value, expectedType)) {
            throw new MCPError(
              `Invalid type for property ${prop}: expected ${expectedType}`,
            );
          }
        }
      }
    }
  }

  /**
   * Checks if a value matches a JSON Schema type
   */
  private checkType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'null':
        return value === null;
      default:
        return true;
    }
  }
}