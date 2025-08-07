/**
 * Unified MCP Error Handler for Coordination and Swarm
 * Consolidates error handling from the removed coordination/mcp directory
 */

import { createLogger } from '../../../core/logger';

const logger = createLogger({ prefix: 'MCP-ErrorHandler' });

export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

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

  static classifyError(error: Error, context: any): any {
    // Basic error classification
    return {
      type: error.constructor.name,
      message: error.message,
      severity: 'medium',
      recoverable: true,
      context: context,
    };
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

export class NeuralError extends Error {
  constructor(
    message: string,
    public modelId?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'NeuralError';
  }
}

export class PersistenceError extends Error {
  constructor(
    message: string,
    public key?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'PersistenceError';
  }
}

export class ResourceError extends Error {
  constructor(
    message: string,
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(message);
    this.name = 'ResourceError';
  }
}

export class SwarmError extends Error {
  constructor(
    message: string,
    public swarmId?: string,
    public agentCount?: number
  ) {
    super(message);
    this.name = 'SwarmError';
  }
}

export class TaskError extends Error {
  constructor(
    message: string,
    public taskId?: string,
    public taskType?: string
  ) {
    super(message);
    this.name = 'TaskError';
  }
}

export class WasmError extends Error {
  constructor(
    message: string,
    public module?: string,
    public functionName?: string
  ) {
    super(message);
    this.name = 'WasmError';
  }
}

export class ZenSwarmError extends Error {
  constructor(
    message: string,
    public swarmType?: string,
    public coordination?: string
  ) {
    super(message);
    this.name = 'ZenSwarmError';
  }
}

// Error context for detailed error tracking
export interface ErrorContext {
  operation: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
}

// Error context factory class
export class ErrorContextFactory {
  static create(operation: string, metadata?: Record<string, any>): ErrorContext {
    return {
      operation,
      timestamp: new Date(),
      metadata: metadata || {},
      stackTrace: new Error().stack,
    };
  }
}

// Error factory for consistent error creation
export class ErrorFactory {
  static createValidationError(message: string, field?: string): ValidationError {
    return new ValidationError(message, field);
  }

  static createAgentError(message: string, agentId?: string): AgentError {
    return new AgentError(message, agentId);
  }

  static createNeuralError(message: string, modelId?: string, operation?: string): NeuralError {
    return new NeuralError(message, modelId, operation);
  }

  static createPersistenceError(
    message: string,
    key?: string,
    operation?: string
  ): PersistenceError {
    return new PersistenceError(message, key, operation);
  }

  static createResourceError(
    message: string,
    resourceType?: string,
    resourceId?: string
  ): ResourceError {
    return new ResourceError(message, resourceType, resourceId);
  }

  static createSwarmError(message: string, swarmId?: string, agentCount?: number): SwarmError {
    return new SwarmError(message, swarmId, agentCount);
  }

  static createTaskError(message: string, taskId?: string, taskType?: string): TaskError {
    return new TaskError(message, taskId, taskType);
  }

  static createWasmError(message: string, module?: string, functionName?: string): WasmError {
    return new WasmError(message, module, functionName);
  }

  static createZenSwarmError(
    message: string,
    swarmType?: string,
    coordination?: string
  ): ZenSwarmError {
    return new ZenSwarmError(message, swarmType, coordination);
  }

  static createErrorWithContext(
    ErrorClass: new (message: string, ...args: any[]) => Error,
    message: string,
    context: ErrorContext,
    ...args: any[]
  ): Error {
    const error = new ErrorClass(message, ...args);
    (error as any).context = context;
    return error;
  }

  // Generic error factory method for dynamic error creation
  static createError(errorType: string, message: string, metadata?: Record<string, any>): Error {
    const context = ErrorContextFactory.create(`create-${errorType}`, metadata);

    switch (errorType.toLowerCase()) {
      case 'validation':
        return ErrorFactory.createErrorWithContext(
          ValidationError,
          message,
          context,
          metadata?.field
        );
      case 'agent':
        return ErrorFactory.createErrorWithContext(AgentError, message, context, metadata?.agentId);
      case 'neural':
        return ErrorFactory.createErrorWithContext(
          NeuralError,
          message,
          context,
          metadata?.modelId,
          metadata?.operation
        );
      case 'persistence':
        return ErrorFactory.createErrorWithContext(
          PersistenceError,
          message,
          context,
          metadata?.key,
          metadata?.operation
        );
      case 'resource':
        return ErrorFactory.createErrorWithContext(
          ResourceError,
          message,
          context,
          metadata?.resourceType,
          metadata?.resourceId
        );
      case 'swarm':
        return ErrorFactory.createErrorWithContext(
          SwarmError,
          message,
          context,
          metadata?.swarmId,
          metadata?.agentCount
        );
      case 'task':
        return ErrorFactory.createErrorWithContext(
          TaskError,
          message,
          context,
          metadata?.taskId,
          metadata?.taskType
        );
      case 'wasm':
        return ErrorFactory.createErrorWithContext(
          WasmError,
          message,
          context,
          metadata?.module,
          metadata?.functionName
        );
      case 'zenswarm':
        return ErrorFactory.createErrorWithContext(
          ZenSwarmError,
          message,
          context,
          metadata?.swarmType,
          metadata?.coordination
        );
      default: {
        // Generic error with context
        const error = new Error(message);
        (error as any).context = context;
        (error as any).type = errorType;
        return error;
      }
    }
  }
}

// Create the default export for compatibility
const mcpErrorHandler = {
  classifyError: MCPErrorHandler.classifyError,
  handleError: MCPErrorHandler.handleError,
  validateParameters: MCPErrorHandler.validateParameters,
};

export { mcpErrorHandler };
export default mcpErrorHandler;
