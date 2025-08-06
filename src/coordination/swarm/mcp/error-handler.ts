/**
 * Unified MCP Error Handler for Coordination and Swarm
 * Consolidates error handling from the removed coordination/mcp directory
 */

import { createLogger } from '../../../core/logger';

const logger = createLogger({ prefix: 'MCP-ErrorHandler' });

export class MCPErrorHandler {
  static handleError(error: any, context?: string): never {
    logger.error(`MCP Error${context ? ` in ${context}` : ''}:`, error);
    throw error;
  }

  static validateParameters(params: any, schema: any): void {
    // Basic parameter validation
    if (!params && schema.required) {
      throw new Error('Missing required parameters');
    }
  }
}

export class MCPToolWrapper {
  static wrap(toolFn: Function, toolName: string) {
    return async (params: any) => {
      try {
        return await toolFn(params);
      } catch (error) {
        logger.error(`Tool ${toolName} failed:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };
  }
}

export class MCPParameterValidator {
  static validate(_params: any, _schema: any): boolean {
    // Basic validation - could be enhanced with proper schema validation
    return true;
  }

  static validateParams(params: any, toolName: string): any {
    // Basic parameter validation
    if (!params) {
      throw new ValidationError(`Missing parameters for tool: ${toolName}`);
    }
    return params;
  }

  static sanitizeInput(input: string): string {
    // Basic sanitization
    return input.replace(/[<>]/g, '');
  }
}

export class AgentError extends Error {
  constructor(
    message: string,
    public agentId?: string
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class ErrorContext {
  constructor(
    public operation: string,
    public metadata?: any
  ) {}
}

export class ErrorFactory {
  static createValidationError(message: string, field?: string): ValidationError {
    return new ValidationError(message, field);
  }

  static createSwarmError(message: string, swarmId?: string): SwarmError {
    return new SwarmError(message, swarmId);
  }

  static createError(type: string, message: string, context?: any): Error {
    switch (type) {
      case 'validation':
        return new ValidationError(message, context?.field);
      case 'swarm':
        return new SwarmError(message, context?.swarmId);
      case 'task':
        return new TaskError(message, context?.taskId);
      case 'agent':
        return new AgentError(message, context?.agentId);
      case 'neural':
        return new NeuralError(message, context?.modelId);
      case 'persistence':
        return new PersistenceError(message, context?.operation);
      case 'resource':
        return new ResourceError(message, context?.resourceType);
      case 'wasm':
        return new WasmError(message, context?.wasmFunction);
      case 'zenswarm':
        return new ZenSwarmError(message, context?.swarmId);
      default:
        return new Error(message);
    }
  }
}

export class NeuralError extends Error {
  constructor(
    message: string,
    public modelId?: string
  ) {
    super(message);
    this.name = 'NeuralError';
  }
}

export class PersistenceError extends Error {
  constructor(
    message: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'PersistenceError';
  }
}

export class ResourceError extends Error {
  constructor(
    message: string,
    public resourceType?: string
  ) {
    super(message);
    this.name = 'ResourceError';
  }
}

export class SwarmError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'SwarmError';
  }
}

export class TaskError extends Error {
  constructor(
    message: string,
    public taskId?: string
  ) {
    super(message);
    this.name = 'TaskError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class WasmError extends Error {
  constructor(
    message: string,
    public wasmFunction?: string
  ) {
    super(message);
    this.name = 'WasmError';
  }
}

export class ZenSwarmError extends Error {
  constructor(
    message: string,
    public swarmId?: string
  ) {
    super(message);
    this.name = 'ZenSwarmError';
  }
}

export const mcpErrorHandler = new MCPErrorHandler();
