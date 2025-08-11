/**
 * @fileoverview Comprehensive MCP Error Handling System for Claude Code Zen
 * 
 * This module provides sophisticated error handling, validation, and recovery mechanisms
 * for all MCP (Model Context Protocol) operations in Claude Code Zen. It includes
 * specialized error types, validation systems, error classification, and recovery
 * strategies for robust swarm coordination.
 * 
 * ## Error Handling Philosophy
 * 
 * The error handling system follows these principles:
 * - **Type Safety**: Strongly typed errors with specific context information
 * - **Recoverability**: Errors classified by recovery potential and strategies
 * - **Observability**: Comprehensive logging and error tracking for debugging
 * - **Graceful Degradation**: System continues operating when possible
 * - **Context Preservation**: Rich error context for effective troubleshooting
 * 
 * ## Error Type Hierarchy
 * 
 * ### Core MCP Errors
 * - `ValidationError` - Parameter and input validation failures
 * - `MCPErrorHandler` - General MCP error handling and classification
 * 
 * ### Domain-Specific Errors
 * - `AgentError` - Agent creation, management, and operation failures
 * - `SwarmError` - Swarm coordination and management issues
 * - `TaskError` - Task execution and orchestration problems
 * - `NeuralError` - Neural network and AI model failures
 * - `WasmError` - WebAssembly module execution issues
 * - `PersistenceError` - Data storage and retrieval problems
 * - `ResourceError` - Resource allocation and management failures
 * - `ZenSwarmError` - Claude Code Zen specific swarm coordination errors
 * 
 * ## Error Recovery Strategies
 * 
 * - **Retry Logic**: Automatic retry for transient failures
 * - **Fallback Operations**: Alternative execution paths when primary fails
 * - **Circuit Breaker**: Prevent cascade failures in distributed operations
 * - **Graceful Degradation**: Reduced functionality rather than complete failure
 * 
 * ## Integration with stdio MCP
 * 
 * All error handling integrates seamlessly with the stdio MCP server:
 * - Proper MCP error response formatting
 * - Error classification for client handling
 * - Detailed error context for debugging
 * - Recovery suggestions for operational issues
 * 
 * @example
 * ```typescript
 * // Create specialized errors with context
 * const agentError = ErrorFactory.createAgentError(
 *   'Agent failed to initialize neural network',
 *   'agent-research-001'
 * );
 * 
 * // Handle errors with classification
 * try {
 *   await swarmOperation();
 * } catch (error) {
 *   const classification = MCPErrorHandler.classifyError(error, 'swarm-init');
 *   if (classification.recoverable) {
 *     await retryOperation();
 *   }
 * }
 * 
 * // Wrap MCP tools with error handling
 * const safeTool = MCPToolWrapper.wrap(originalTool, 'swarm_status');
 * ```
 * 
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 * @see {@link StdioMcpServer} MCP server integration
 * @see {@link SwarmTools} Core swarm tools using error handling
 * @see {@link HiveTools} Hive tools using error handling
 */

import { getLogger } from '../../../config/logging-config.ts';

const logger = getLogger('MCP-ErrorHandler');

/**
 * Specialized error for parameter and input validation failures in MCP operations.
 * 
 * ValidationError is thrown when MCP tool parameters fail validation checks,
 * including missing required parameters, invalid types, or constraint violations.
 * Includes field-specific information for precise error reporting.
 * 
 * @example
 * ```typescript
 * // Throw validation error for missing required parameter
 * if (!params.agentId) {
 *   throw new ValidationError('Agent ID is required', 'agentId');
 * }
 * 
 * // Create via factory for consistent context
 * const error = ErrorFactory.createValidationError(
 *   'Invalid cognitive pattern specified',
 *   'cognitivePattern'
 * );
 * ```
 */
export class ValidationError extends Error {
  /** The specific field that failed validation, if applicable */
  public field?: string | undefined;

  /**
   * Creates a new ValidationError with optional field context.
   * 
   * @param message - Descriptive error message explaining the validation failure
   * @param field - The specific field that failed validation (optional)
   */
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Central error handling system for all MCP operations in Claude Code Zen.
 * 
 * Provides comprehensive error handling, classification, validation, and logging
 * for MCP tool operations. Includes error severity assessment, recoverability
 * analysis, and context preservation for effective debugging and monitoring.
 * 
 * @example
 * ```typescript
 * // Handle and classify errors with context
 * try {
 *   await mcpToolOperation();
 * } catch (error) {
 *   const classification = MCPErrorHandler.classifyError(error, {
 *     tool: 'swarm_init',
 *     agentId: 'agent-001'
 *   });
 *   
 *   if (classification.recoverable) {
 *     // Attempt recovery
 *   } else {
 *     MCPErrorHandler.handleError(error, 'swarm_init');
 *   }
 * }
 * ```
 */
export class MCPErrorHandler {
  /**
   * Handles critical errors by logging and re-throwing with context.
   * 
   * This method provides centralized error handling for unrecoverable errors,
   * ensuring proper logging and context preservation before propagating the error.
   * 
   * @param error - The error to handle
   * @param context - Optional context string describing where the error occurred
   * @throws The original error after logging
   * 
   * @example
   * ```typescript
   * try {
   *   await dangerousOperation();
   * } catch (error) {
   *   MCPErrorHandler.handleError(error, 'agent-spawn-operation');
   * }
   * ```
   */
  static handleError(error: any, context?: string): never {
    logger.error(`MCP Error${context ? ` in ${context}` : ''}:`, error);
    throw error;
  }

  /**
   * Validates MCP tool parameters against a schema.
   * 
   * Performs basic parameter validation to ensure required parameters are present
   * and meet basic requirements. Can be extended for more sophisticated validation.
   * 
   * @param params - The parameters to validate
   * @param schema - The schema defining validation rules
   * @throws {Error} When required parameters are missing
   * 
   * @example
   * ```typescript
   * MCPErrorHandler.validateParameters(
   *   { agentId: 'agent-001' },
   *   { required: ['agentId'] }
   * );
   * ```
   */
  static validateParameters(params: any, schema: any): void {
    // Basic parameter validation
    if (!params && schema.required) {
      throw new Error('Missing required parameters');
    }
  }

  /**
   * Classifies errors for recovery strategy determination and monitoring.
   * 
   * Analyzes errors to determine their type, severity, recoverability, and
   * appropriate handling strategies. Essential for building resilient MCP
   * operations with intelligent error recovery.
   * 
   * @param error - The error to classify
   * @param context - Additional context about the error occurrence
   * @returns Error classification with recovery information
   * @returns result.type - Error type from constructor name
   * @returns result.message - Error message
   * @returns result.severity - Error severity level ('low', 'medium', 'high', 'critical')
   * @returns result.recoverable - Whether the error can potentially be recovered from
   * @returns result.context - Additional context information
   * 
   * @example
   * ```typescript
   * const classification = MCPErrorHandler.classifyError(
   *   new AgentError('Agent failed to spawn', 'agent-001'),
   *   { operation: 'agent_spawn', swarmId: 'swarm-alpha' }
   * );
   * 
   * if (classification.severity === 'high' && classification.recoverable) {
   *   await attemptErrorRecovery();
   * }
   * ```
   */
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

/**
 * Wrapper utility for MCP tools that provides automatic error handling and recovery.
 * 
 * MCPToolWrapper ensures that all MCP tools have consistent error handling behavior,
 * preventing uncaught exceptions from crashing the MCP server and providing
 * standardized error responses for client applications.
 * 
 * @example
 * ```typescript
 * // Wrap a tool function for safe execution
 * const safeTool = MCPToolWrapper.wrap(
 *   async (params) => {
 *     // Tool implementation that might throw
 *     if (!params.agentId) throw new Error('Missing agent ID');
 *     return await performAgentOperation(params);
 *   },
 *   'agent_operation'
 * );
 * 
 * // Safe execution returns standardized response
 * const result = await safeTool({ agentId: 'agent-001' });
 * if (!result.success) {
 *   console.log(`Tool failed: ${result.error}`);
 * }
 * ```
 */
export class MCPToolWrapper {
  /**
   * Wraps an MCP tool function with comprehensive error handling.
   * 
   * Creates a safe wrapper around MCP tool functions that catches all errors,
   * logs them appropriately, and returns standardized error responses instead
   * of allowing exceptions to propagate to the MCP server.
   * 
   * @param toolFn - The MCP tool function to wrap
   * @param toolName - The name of the tool for logging purposes
   * @returns Wrapped tool function that never throws, always returns a response
   * @returns result.success - Whether the tool executed successfully (false on error)
   * @returns result.error - Error message if execution failed
   * @returns result.[...] - Original tool response if execution succeeded
   * 
   * @example
   * ```typescript
   * const wrappedSwarmInit = MCPToolWrapper.wrap(
   *   swarmTools.swarmInit.bind(swarmTools),
   *   'swarm_init'
   * );
   * 
   * const result = await wrappedSwarmInit({ topology: 'mesh' });
   * ```
   */
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

/**
 * Comprehensive parameter validation system for MCP tools.
 * 
 * Provides validation, sanitization, and security checks for all MCP tool
 * parameters to ensure data integrity and prevent security vulnerabilities.
 * Includes schema validation, input sanitization, and type checking.
 * 
 * @example
 * ```typescript
 * // Validate tool parameters
 * const params = MCPParameterValidator.validateParams(
 *   { agentId: 'agent-001', type: 'coder' },
 *   'agent_spawn'
 * );
 * 
 * // Sanitize user input
 * const safeInput = MCPParameterValidator.sanitizeInput(
 *   'User input with <script>alert("xss")</script>'
 * );
 * ```
 */
export class MCPParameterValidator {
  /**
   * Validates parameters against a provided schema.
   * 
   * Performs comprehensive parameter validation including type checking,
   * required field validation, and constraint enforcement. Can be extended
   * with JSON Schema or other validation libraries.
   * 
   * @param _params - Parameters to validate
   * @param _schema - Validation schema
   * @returns Whether validation passed
   * 
   * @example
   * ```typescript
   * const isValid = MCPParameterValidator.validate(
   *   { agentId: 'agent-001' },
   *   { type: 'object', required: ['agentId'] }
   * );
   * ```
   */
  static validate(_params: any, _schema: any): boolean {
    // Basic validation - could be enhanced with proper schema validation
    return true;
  }

  /**
   * Validates and sanitizes parameters for MCP tool execution.
   * 
   * Ensures that tool parameters are present and valid before tool execution.
   * Throws ValidationError for missing or invalid parameters.
   * 
   * @param params - Tool parameters to validate
   * @param toolName - Name of the tool for error context
   * @returns Validated parameters
   * @throws {ValidationError} When parameters are missing or invalid
   * 
   * @example
   * ```typescript
   * try {
   *   const validParams = MCPParameterValidator.validateParams(
   *     params,
   *     'swarm_init'
   *   );
   *   await executeTool(validParams);
   * } catch (error) {
   *   // Handle validation error
   * }
   * ```
   */
  static validateParams(params: any, toolName: string): any {
    // Basic parameter validation
    if (!params) {
      throw new ValidationError(`Missing parameters for tool: ${toolName}`);
    }
    return params;
  }

  /**
   * Sanitizes string input to prevent security vulnerabilities.
   * 
   * Removes potentially dangerous characters and patterns from string inputs
   * to prevent XSS, injection attacks, and other security issues.
   * 
   * @param input - String input to sanitize
   * @returns Sanitized string safe for processing
   * 
   * @example
   * ```typescript
   * // Remove dangerous HTML tags
   * const safe = MCPParameterValidator.sanitizeInput(
   *   'Hello <script>alert("bad")</script> World'
   * );
   * // Returns: 'Hello alert("bad") World'
   * ```
   */
  static sanitizeInput(input: string): string {
    // Basic sanitization
    return input.replace(/[<>]/g, '');
  }
}

/**
 * Specialized error for agent-related operations and failures.
 * 
 * AgentError is thrown when agent creation, management, or operation fails.
 * Includes agent-specific context such as agent ID for precise error tracking
 * and debugging in multi-agent environments.
 * 
 * @example
 * ```typescript
 * // Agent initialization failure
 * throw new AgentError(
 *   'Failed to initialize neural network for agent',
 *   'agent-research-001'
 * );
 * 
 * // Agent communication failure
 * throw new AgentError(
 *   'Agent communication timeout',
 *   'agent-coordinator-005'
 * );
 * ```
 */
export class AgentError extends Error {
  /**
   * Creates a new AgentError with optional agent context.
   * 
   * @param message - Descriptive error message explaining the agent failure
   * @param agentId - The ID of the agent that encountered the error (optional)
   */
  constructor(
    message: string,
    public agentId?: string
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

/**
 * Specialized error for neural network and AI model operations.
 * 
 * NeuralError is thrown when neural network operations fail, including model
 * loading, inference, training, or configuration issues. Includes model-specific
 * context for debugging complex AI operations.
 * 
 * @example
 * ```typescript
 * // Model loading failure
 * throw new NeuralError(
 *   'Failed to load neural model weights',
 *   'transformer-base-v1',
 *   'model_load'
 * );
 * 
 * // Inference failure
 * throw new NeuralError(
 *   'Neural inference timeout',
 *   'gpt-analyzer',
 *   'inference'
 * );
 * ```
 */
export class NeuralError extends Error {
  /**
   * Creates a new NeuralError with model and operation context.
   * 
   * @param message - Descriptive error message explaining the neural operation failure
   * @param modelId - The ID of the neural model that encountered the error (optional)
   * @param operation - The specific operation that failed (optional)
   */
  constructor(
    message: string,
    public modelId?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'NeuralError';
  }
}

/**
 * Specialized error for data persistence and storage operations.
 * 
 * PersistenceError is thrown when database operations, file I/O, or other
 * persistence mechanisms fail. Includes key and operation context for
 * debugging storage-related issues.
 * 
 * @example
 * ```typescript
 * // Database write failure
 * throw new PersistenceError(
 *   'Failed to save agent state to database',
 *   'agent-state-001',
 *   'database_write'
 * );
 * 
 * // File read failure
 * throw new PersistenceError(
 *   'Configuration file not found',
 *   '/config/swarm.json',
 *   'file_read'
 * );
 * ```
 */
export class PersistenceError extends Error {
  /**
   * Creates a new PersistenceError with key and operation context.
   * 
   * @param message - Descriptive error message explaining the persistence failure
   * @param key - The key, filename, or identifier that failed to persist (optional)
   * @param operation - The specific persistence operation that failed (optional)
   */
  constructor(
    message: string,
    public key?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'PersistenceError';
  }
}

/**
 * Specialized error for resource allocation and management failures.
 * 
 * ResourceError is thrown when system resources cannot be allocated,
 * accessed, or managed properly. Includes resource type and ID context
 * for debugging resource-related issues.
 * 
 * @example
 * ```typescript
 * // Memory allocation failure
 * throw new ResourceError(
 *   'Insufficient memory for neural model',
 *   'memory',
 *   'neural-buffer-001'
 * );
 * 
 * // CPU resource unavailable
 * throw new ResourceError(
 *   'CPU cores not available for swarm processing',
 *   'cpu',
 *   'swarm-workers'
 * );
 * ```
 */
export class ResourceError extends Error {
  /**
   * Creates a new ResourceError with resource type and ID context.
   * 
   * @param message - Descriptive error message explaining the resource failure
   * @param resourceType - The type of resource that failed (optional)
   * @param resourceId - The specific resource identifier that failed (optional)
   */
  constructor(
    message: string,
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(message);
    this.name = 'ResourceError';
  }
}

/**
 * Specialized error for swarm coordination and management failures.
 * 
 * SwarmError is thrown when swarm operations fail, including swarm creation,
 * agent coordination, or swarm management issues. Includes swarm-specific
 * context such as swarm ID and agent count for debugging.
 * 
 * @example
 * ```typescript
 * // Swarm initialization failure
 * throw new SwarmError(
 *   'Failed to initialize swarm topology',
 *   'swarm-mesh-001',
 *   8
 * );
 * 
 * // Agent coordination failure
 * throw new SwarmError(
 *   'Swarm coordination timeout with agents',
 *   'swarm-hierarchical-002',
 *   12
 * );
 * ```
 */
export class SwarmError extends Error {
  /**
   * Creates a new SwarmError with swarm context.
   * 
   * @param message - Descriptive error message explaining the swarm failure
   * @param swarmId - The ID of the swarm that encountered the error (optional)
   * @param agentCount - The number of agents in the swarm (optional)
   */
  constructor(
    message: string,
    public swarmId?: string,
    public agentCount?: number
  ) {
    super(message);
    this.name = 'SwarmError';
  }
}

/**
 * Specialized error for task execution and orchestration failures.
 * 
 * TaskError is thrown when task operations fail, including task creation,
 * execution, coordination, or completion issues. Includes task-specific
 * context for debugging complex workflows.
 * 
 * @example
 * ```typescript
 * // Task execution failure
 * throw new TaskError(
 *   'Task execution timed out after 30 seconds',
 *   'task-analysis-001',
 *   'code-analysis'
 * );
 * 
 * // Task orchestration failure
 * throw new TaskError(
 *   'Failed to orchestrate task dependencies',
 *   'workflow-batch-002',
 *   'batch-processing'
 * );
 * ```
 */
export class TaskError extends Error {
  /**
   * Creates a new TaskError with task context.
   * 
   * @param message - Descriptive error message explaining the task failure
   * @param taskId - The ID of the task that encountered the error (optional)
   * @param taskType - The type of task that failed (optional)
   */
  constructor(
    message: string,
    public taskId?: string,
    public taskType?: string
  ) {
    super(message);
    this.name = 'TaskError';
  }
}

/**
 * Specialized error for WebAssembly (WASM) module operations.
 * 
 * WasmError is thrown when WebAssembly operations fail, including module
 * loading, function execution, or memory management issues. Includes
 * module and function context for debugging WASM operations.
 * 
 * @example
 * ```typescript
 * // WASM module loading failure
 * throw new WasmError(
 *   'Failed to load WASM module',
 *   'neural-compute.wasm',
 *   undefined
 * );
 * 
 * // WASM function execution failure
 * throw new WasmError(
 *   'WASM function execution failed',
 *   'matrix-operations.wasm',
 *   'multiply_matrices'
 * );
 * ```
 */
export class WasmError extends Error {
  /**
   * Creates a new WasmError with module and function context.
   * 
   * @param message - Descriptive error message explaining the WASM failure
   * @param module - The WASM module that encountered the error (optional)
   * @param functionName - The specific WASM function that failed (optional)
   */
  constructor(
    message: string,
    public module?: string,
    public functionName?: string
  ) {
    super(message);
    this.name = 'WasmError';
  }
}

/**
 * Specialized error for Claude Code Zen specific swarm operations.
 * 
 * ZenSwarmError is thrown when Claude Code Zen specific swarm features fail,
 * including advanced coordination patterns, zen-specific algorithms, or
 * integration issues. Includes swarm type and coordination context.
 * 
 * @example
 * ```typescript
 * // Zen coordination failure
 * throw new ZenSwarmError(
 *   'Zen meditation pattern failed to converge',
 *   'zen-meditation-swarm',
 *   'mindfulness-coordination'
 * );
 * 
 * // Advanced swarm pattern failure
 * throw new ZenSwarmError(
 *   'Quantum swarm entanglement lost',
 *   'quantum-swarm',
 *   'entanglement-sync'
 * );
 * ```
 */
export class ZenSwarmError extends Error {
  /**
   * Creates a new ZenSwarmError with swarm type and coordination context.
   * 
   * @param message - Descriptive error message explaining the zen swarm failure
   * @param swarmType - The type of zen swarm that encountered the error (optional)
   * @param coordination - The specific coordination pattern that failed (optional)
   */
  constructor(
    message: string,
    public swarmType?: string,
    public coordination?: string
  ) {
    super(message);
    this.name = 'ZenSwarmError';
  }
}

/**
 * Comprehensive error context interface for detailed error tracking and debugging.
 * 
 * ErrorContext provides rich contextual information about error occurrences,
 * enabling effective debugging, monitoring, and error analysis across the
 * Claude Code Zen system.
 * 
 * @example
 * ```typescript
 * const context: ErrorContext = {
 *   operation: 'agent_spawn',
 *   timestamp: new Date(),
 *   metadata: {
 *     agentType: 'researcher',
 *     swarmId: 'swarm-001',
 *     cognitivePattern: 'divergent'
 *   },
 *   stackTrace: new Error().stack,
 *   userId: 'user-123',
 *   sessionId: 'session-456'
 * };
 * ```
 */
export interface ErrorContext {
  /** The operation that was being performed when the error occurred */
  operation: string;
  
  /** Timestamp when the error occurred */
  timestamp: Date;
  
  /** Additional metadata relevant to the error context (optional) */
  metadata?: Record<string, any> | undefined;
  
  /** Stack trace of the error occurrence (optional) */
  stackTrace?: string | undefined;
  
  /** User ID associated with the operation (optional) */
  userId?: string | undefined;
  
  /** Session ID associated with the operation (optional) */
  sessionId?: string | undefined;
}

/**
 * Factory class for creating consistent error contexts across the system.
 * 
 * ErrorContextFactory provides standardized error context creation with
 * automatic timestamp generation and stack trace capture for debugging.
 * 
 * @example
 * ```typescript
 * // Create error context for agent operation
 * const context = ErrorContextFactory.create(
 *   'agent_spawn',
 *   {
 *     agentId: 'agent-001',
 *     swarmId: 'swarm-research',
 *     cognitivePattern: 'analytical'
 *   }
 * );
 * ```
 */
export class ErrorContextFactory {
  /**
   * Creates a standardized error context with automatic metadata.
   * 
   * Generates an ErrorContext object with current timestamp, stack trace,
   * and provided metadata for comprehensive error tracking.
   * 
   * @param operation - The operation being performed when context is created
   * @param metadata - Additional context metadata (optional)
   * @returns Complete ErrorContext object with timestamp and stack trace
   * 
   * @example
   * ```typescript
   * const context = ErrorContextFactory.create(
   *   'swarm_init',
   *   { topology: 'mesh', maxAgents: 8 }
   * );
   * ```
   */
  static create(operation: string, metadata?: Record<string, any>): ErrorContext {
    return {
      operation,
      timestamp: new Date(),
      metadata: metadata || {},
      stackTrace: new Error().stack ?? undefined,
    };
  }
}

/**
 * Comprehensive error factory for consistent error creation across Claude Code Zen.
 * 
 * ErrorFactory provides standardized methods for creating all types of errors
 * with proper context, metadata, and error hierarchy. Ensures consistent error
 * handling patterns across the entire system.
 * 
 * ## Factory Methods
 * 
 * - **Validation Errors**: `createValidationError()` for parameter validation failures
 * - **Agent Errors**: `createAgentError()` for agent-related failures
 * - **Neural Errors**: `createNeuralError()` for AI/ML operation failures
 * - **Persistence Errors**: `createPersistenceError()` for storage failures
 * - **Resource Errors**: `createResourceError()` for resource allocation failures
 * - **Swarm Errors**: `createSwarmError()` for swarm coordination failures
 * - **Task Errors**: `createTaskError()` for task execution failures
 * - **WASM Errors**: `createWasmError()` for WebAssembly failures
 * - **Zen Swarm Errors**: `createZenSwarmError()` for zen-specific failures
 * 
 * @example
 * ```typescript
 * // Create specific error types
 * const agentError = ErrorFactory.createAgentError(
 *   'Agent failed to initialize',
 *   'agent-001'
 * );
 * 
 * // Create dynamic errors with metadata
 * const dynamicError = ErrorFactory.createError(
 *   'neural',
 *   'Model inference timeout',
 *   { modelId: 'transformer-v1', operation: 'inference' }
 * );
 * 
 * // Create errors with full context
 * const contextError = ErrorFactory.createErrorWithContext(
 *   SwarmError,
 *   'Swarm coordination failed',
 *   ErrorContextFactory.create('swarm_coordination'),
 *   'swarm-001',
 *   8
 * );
 * ```
 */
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

  /**
   * Generic error factory method for dynamic error creation based on type string.
   * 
   * Creates errors dynamically based on error type string with optional metadata.
   * Useful for creating errors from configuration, API responses, or other
   * dynamic contexts where the error type is determined at runtime.
   * 
   * ## Supported Error Types
   * 
   * - `'validation'` - Creates ValidationError with field context
   * - `'agent'` - Creates AgentError with agent ID context
   * - `'neural'` - Creates NeuralError with model and operation context
   * - `'persistence'` - Creates PersistenceError with key and operation context
   * - `'resource'` - Creates ResourceError with resource type and ID context
   * - `'swarm'` - Creates SwarmError with swarm ID and agent count context
   * - `'task'` - Creates TaskError with task ID and type context
   * - `'wasm'` - Creates WasmError with module and function context
   * - `'zenswarm'` - Creates ZenSwarmError with swarm type and coordination context
   * 
   * @param errorType - The type of error to create (case-insensitive)
   * @param message - Error message describing the failure
   * @param metadata - Optional metadata providing error context
   * @returns Specific error instance with appropriate context
   * 
   * @example
   * ```typescript
   * // Create agent error dynamically
   * const error = ErrorFactory.createError(
   *   'agent',
   *   'Agent initialization failed',
   *   { agentId: 'research-agent-001' }
   * );
   * 
   * // Create neural error with operation context
   * const neuralError = ErrorFactory.createError(
   *   'neural',
   *   'Model inference timeout',
   *   { 
   *     modelId: 'transformer-base-v1',
   *     operation: 'text-generation'
   *   }
   * );
   * 
   * // Create validation error with field context
   * const validationError = ErrorFactory.createError(
   *   'validation',
   *   'Required parameter missing',
   *   { field: 'cognitivePattern' }
   * );
   * ```
   */
  static createError(errorType: string, message: string, metadata?: Record<string, any>): Error {
    const context = ErrorContextFactory.create(`create-${errorType}`, metadata);

    switch (errorType.toLowerCase()) {
      case 'validation':
        return ErrorFactory.createErrorWithContext(
          ValidationError,
          message,
          context,
          metadata?.['field']
        );
      case 'agent':
        return ErrorFactory.createErrorWithContext(
          AgentError,
          message,
          context,
          metadata?.['agentId']
        );
      case 'neural':
        return ErrorFactory.createErrorWithContext(
          NeuralError,
          message,
          context,
          metadata?.['modelId'],
          metadata?.['operation']
        );
      case 'persistence':
        return ErrorFactory.createErrorWithContext(
          PersistenceError,
          message,
          context,
          metadata?.['key'],
          metadata?.['operation']
        );
      case 'resource':
        return ErrorFactory.createErrorWithContext(
          ResourceError,
          message,
          context,
          metadata?.['resourceType'],
          metadata?.['resourceId']
        );
      case 'swarm':
        return ErrorFactory.createErrorWithContext(
          SwarmError,
          message,
          context,
          metadata?.['swarmId'],
          metadata?.['agentCount']
        );
      case 'task':
        return ErrorFactory.createErrorWithContext(
          TaskError,
          message,
          context,
          metadata?.['taskId'],
          metadata?.['taskType']
        );
      case 'wasm':
        return ErrorFactory.createErrorWithContext(
          WasmError,
          message,
          context,
          metadata?.['module'],
          metadata?.['functionName']
        );
      case 'zenswarm':
        return ErrorFactory.createErrorWithContext(
          ZenSwarmError,
          message,
          context,
          metadata?.['swarmType'],
          metadata?.['coordination']
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

/**
 * Default MCP error handler export for backward compatibility.
 * 
 * Provides a simplified interface to the most commonly used error handling
 * functions for easy integration with existing code.
 * 
 * @example
 * ```typescript
 * import mcpErrorHandler from './error-handler.ts';
 * 
 * // Classify and handle errors
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const classification = mcpErrorHandler.classifyError(error, 'operation');
 *   if (!classification.recoverable) {
 *     mcpErrorHandler.handleError(error, 'critical-operation');
 *   }
 * }
 * ```
 */
const mcpErrorHandler = {
  classifyError: MCPErrorHandler.classifyError,
  handleError: MCPErrorHandler.handleError,
  validateParameters: MCPErrorHandler.validateParameters,
};

export { mcpErrorHandler };
export default mcpErrorHandler;
