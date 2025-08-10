/**
 * Comprehensive Error Handling System for Claude-Zen.
 *
 * Hierarchical error types for FACT, RAG, Swarm, MCP, and WASM systems.
 * Includes error recovery strategies, monitoring, and resilience patterns.
 */
/**
 * @file Errors implementation.
 */

import { createLogger } from './logger';

const logger = createLogger({ prefix: 'ErrorSystem' });

// ===============================
// Core Error Context Interface
// ===============================

/**
 * Context information for error tracking and debugging.
 * 
 * @interface ErrorContext
 * @example
 * ```typescript
 * const context: ErrorContext = {
 *   timestamp: Date.now(),
 *   component: 'RAG',
 *   operation: 'vectorSearch',
 *   correlationId: 'req-123',
 *   userId: 'user-456',
 *   metadata: { query: 'search term' }
 * };
 * ```
 */
export interface ErrorContext {
  /** Timestamp when the error occurred. */
  timestamp: number;
  /** Component or system where the error originated. */
  component: string;
  /** Specific operation that failed (optional). */
  operation?: string;
  /** Unique identifier for request correlation (optional). */
  correlationId?: string;
  /** Additional metadata about the error context (optional). */
  metadata?: Record<string, any>;
  /** Stack trace of the error (optional). */
  stackTrace?: string;
  /** User ID associated with the error (optional). */
  userId?: string;
  /** Session ID for the current session (optional). */
  sessionId?: string;
  /** Version of the application (optional). */
  version?: string;
}

/**
 * Configuration options for error recovery strategies.
 * 
 * @interface ErrorRecoveryOptions
 * @example
 * ```typescript
 * const options: ErrorRecoveryOptions = {
 *   maxRetries: 3,
 *   retryDelayMs: 1000,
 *   exponentialBackoff: true,
 *   circuitBreakerThreshold: 5,
 *   fallbackEnabled: true,
 *   gracefulDegradation: true
 * };
 * ```
 */
export interface ErrorRecoveryOptions {
  /** Maximum number of retry attempts (optional). */
  maxRetries?: number;
  /** Delay between retries in milliseconds (optional). */
  retryDelayMs?: number;
  /** Whether to use exponential backoff for retries (optional). */
  exponentialBackoff?: boolean;
  /** Threshold for circuit breaker activation (optional). */
  circuitBreakerThreshold?: number;
  /** Whether fallback mechanisms are enabled (optional). */
  fallbackEnabled?: boolean;
  /** Whether graceful degradation is enabled (optional). */
  gracefulDegradation?: boolean;
}

/**
 * Metrics for error tracking and monitoring.
 * 
 * @interface ErrorMetrics
 * @example
 * ```typescript
 * const metrics: ErrorMetrics = {
 *   errorCount: 15,
 *   errorRate: 0.02, // 2%
 *   lastErrorTime: Date.now(),
 *   averageRecoveryTime: 500,
 *   successfulRecoveries: 12,
 *   failedRecoveries: 3
 * };
 * ```
 */
export interface ErrorMetrics {
  /** Total number of errors recorded. */
  errorCount: number;
  /** Error rate as a percentage (0-1). */
  errorRate: number;
  /** Timestamp of the most recent error. */
  lastErrorTime: number;
  /** Average time to recover from errors in milliseconds. */
  averageRecoveryTime: number;
  /** Number of successful error recoveries. */
  successfulRecoveries: number;
  /** Number of failed recovery attempts. */
  failedRecoveries: number;
}

// ===============================
// Base Error Classes
// ===============================

/**
 * Base class for all Claude-Zen error types with rich context and recovery options.
 * 
 * Provides structured error handling with severity levels, context tracking,
 * automatic logging, and recovery information.
 * 
 * @abstract
 * @class BaseClaudeZenError
 * @augments Error
 * @example
 * ```typescript
 * class CustomError extends BaseClaudeZenError {
 *   constructor(message: string) {
 *     super(message, 'Custom', 'medium', {
 *       operation: 'customOperation',
 *       metadata: { customData: 'value' }
 *     });
 *     this.name = 'CustomError';
 *   }
 * }
 * 
 * const error = new CustomError('Something went wrong');
 * console.log(error.severity); // 'medium'
 * console.log(error.recoverable); // true
 * ```
 */
export abstract class BaseClaudeZenError extends Error {
  /** Error context with tracking information. */
  public readonly context: ErrorContext;
  /** Error severity level. */
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  /** Error category for classification. */
  public readonly category: string;
  /** Whether the error is recoverable. */
  public readonly recoverable: boolean;
  /** Number of retry attempts made. */
  public readonly retryCount: number = 0;

  /**
   * Creates a new BaseClaudeZenError instance.
   * 
   * @param message - Error message.
   * @param category - Error category for classification.
   * @param severity - Error severity level (defaults to 'medium').
   * @param context - Additional error context (optional).
   * @param recoverable - Whether the error is recoverable (defaults to true).
   */
  constructor(
    message: string,
    category: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: Partial<ErrorContext> = {},
    recoverable: boolean = true
  ) {
    super(message);
    this.category = category;
    this.severity = severity;
    this.recoverable = recoverable;
    this.context = {
      timestamp: Date.now(),
      component: category,
      stackTrace: this.stack || '',
      ...context,
    };

    // Log error immediately
    this.logError();
  }

  private logError(): void {
    const logLevel =
      this.severity === 'critical' ? 'error' : this.severity === 'high' ? 'warn' : 'info';

    logger[logLevel](`[${this.category}] ${this.message}`, {
      severity: this.severity,
      context: this.context,
      recoverable: this.recoverable,
    });
  }

  /**
   * Converts the error to a JSON-serializable object.
   * 
   * @returns JSON representation of the error.
   * @example
   * ```typescript
   * const error = new CustomError('Test error');
   * const json = error.toJSON();
   * console.log(JSON.stringify(json, null, 2));
   * ```
   */
  public toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      recoverable: this.recoverable,
      context: this.context,
      retryCount: this.retryCount,
    };
  }
}

// ===============================
// FACT System Errors
// ===============================

/**
 * Base error class for FACT (Flexible AI Context Transfer) system failures.
 * 
 * @class FACTError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new FACTError(
 *   'Failed to process FACT data',
 *   'high',
 *   { operation: 'dataProcessing', metadata: { factId: 'fact-123' } }
 * );
 * ```
 */
export class FACTError extends BaseClaudeZenError {
  /**
   * Creates a new FACTError instance.
   * 
   * @param message - Error message.
   * @param severity - Error severity level (defaults to 'medium').
   * @param context - Additional error context (optional).
   */
  constructor(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: Partial<ErrorContext> = {}
  ) {
    super(message, 'FACT', severity, context);
    this.name = 'FACTError';
  }
}

/**
 * Error for FACT storage backend operations.
 * 
 * @class FACTStorageError
 * @augments FACTError
 * @example
 * ```typescript
 * throw new FACTStorageError(
 *   'Failed to write to storage backend',
 *   'sqlite',
 *   'write',
 *   'critical'
 * );
 * ```
 */
export class FACTStorageError extends FACTError {
  /**
   * Creates a new FACTStorageError instance.
   * 
   * @param message - Error message.
   * @param backend - Storage backend name (e.g., 'sqlite', 'lancedb').
   * @param operation - Storage operation that failed (e.g., 'read', 'write').
   * @param severity - Error severity level (defaults to 'high').
   */
  constructor(
    message: string,
    public readonly backend: string,
    public readonly operation: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, severity, { operation, metadata: { backend } });
    this.name = 'FACTStorageError';
  }
}

export class FACTGatheringError extends FACTError {
  constructor(
    message: string,
    public readonly query: string,
    public readonly sources: string[],
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, severity, { metadata: { query, sources } });
    this.name = 'FACTGatheringError';
  }
}

export class FACTProcessingError extends FACTError {
  constructor(
    message: string,
    public readonly processType: string,
    public readonly dataId?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, severity, { metadata: { processType, dataId } });
    this.name = 'FACTProcessingError';
  }
}

// ===============================
// RAG System Errors
// ===============================

/**
 * Base error class for RAG (Retrieval Augmented Generation) system failures.
 * 
 * @class RAGError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new RAGError(
 *   'RAG processing failed',
 *   'high',
 *   { operation: 'retrieval', metadata: { queryId: 'query-456' } }
 * );
 * ```
 */
export class RAGError extends BaseClaudeZenError {
  /**
   * Creates a new RAGError instance.
   * 
   * @param message - Error message.
   * @param severity - Error severity level (defaults to 'medium').
   * @param context - Additional error context (optional).
   */
  constructor(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: Partial<ErrorContext> = {}
  ) {
    super(message, 'RAG', severity, context);
    this.name = 'RAGError';
  }
}

export class RAGVectorError extends RAGError {
  constructor(
    message: string,
    public readonly operation: 'embed' | 'search' | 'index' | 'delete',
    public readonly vectorDimension?: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, severity, { operation, metadata: { vectorDimension } });
    this.name = 'RAGVectorError';
  }
}

export class RAGEmbeddingError extends RAGError {
  constructor(
    message: string,
    public readonly modelName: string,
    public readonly textLength?: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, severity, { metadata: { modelName, textLength } });
    this.name = 'RAGEmbeddingError';
  }
}

export class RAGRetrievalError extends RAGError {
  constructor(
    message: string,
    public readonly query: string,
    public readonly similarityThreshold?: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, severity, { metadata: { query, similarityThreshold } });
    this.name = 'RAGRetrievalError';
  }
}

// ===============================
// Swarm Coordination Errors
// ===============================

/**
 * Base error class for swarm coordination system failures.
 * 
 * @class SwarmError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new SwarmError(
 *   'Swarm coordination failed',
 *   'swarm-789',
 *   'high',
 *   { operation: 'coordination', metadata: { agentCount: 5 } }
 * );
 * ```
 */
export class SwarmError extends BaseClaudeZenError {
  /**
   * Creates a new SwarmError instance.
   * 
   * @param message - Error message.
   * @param swarmId - Unique identifier of the swarm (optional).
   * @param severity - Error severity level (defaults to 'medium').
   * @param context - Additional error context (optional).
   */
  constructor(
    message: string,
    public readonly swarmId?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: Partial<ErrorContext> = {}
  ) {
    super(message, 'Swarm', severity, { ...context, metadata: { swarmId } });
    this.name = 'SwarmError';
  }
}

/**
 * Error class for individual agent failures within a swarm.
 * 
 * @class AgentError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new AgentError(
 *   'Agent execution failed',
 *   'agent-123',
 *   'researcher',
 *   'high'
 * );
 * ```
 */
export class AgentError extends BaseClaudeZenError {
  /**
   * Creates a new AgentError instance.
   * 
   * @param message - Error message.
   * @param agentId - Unique identifier of the agent (optional).
   * @param agentType - Type of agent (e.g., 'researcher', 'coder') (optional).
   * @param severity - Error severity level (defaults to 'medium').
   */
  constructor(
    message: string,
    public readonly agentId?: string,
    public readonly agentType?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, 'Agent', severity, { metadata: { agentId, agentType } });
    this.name = 'AgentError';
  }
}

export class SwarmCommunicationError extends SwarmError {
  constructor(
    message: string,
    public readonly fromAgent: string,
    public readonly toAgent: string,
    public readonly messageType?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, undefined, severity, { metadata: { fromAgent, toAgent, messageType } });
    this.name = 'SwarmCommunicationError';
  }
}

export class SwarmCoordinationError extends SwarmError {
  constructor(
    message: string,
    public readonly coordinationType: string,
    public readonly participantCount?: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, undefined, severity, { metadata: { coordinationType, participantCount } });
    this.name = 'SwarmCoordinationError';
  }
}

// ===============================
// MCP Protocol Errors
// ===============================

/**
 * Base error class for MCP (Model Context Protocol) system failures.
 * 
 * @class MCPError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new MCPError(
 *   'MCP tool execution failed',
 *   'filesystem',
 *   'high',
 *   { operation: 'read', metadata: { path: '/data/file.txt' } }
 * );
 * ```
 */
export class MCPError extends BaseClaudeZenError {
  /**
   * Creates a new MCPError instance.
   * 
   * @param message - Error message.
   * @param toolName - Name of the MCP tool that failed (optional).
   * @param severity - Error severity level (defaults to 'medium').
   * @param context - Additional error context (optional).
   */
  constructor(
    message: string,
    public readonly toolName?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: Partial<ErrorContext> = {}
  ) {
    super(message, 'MCP', severity, { ...context, metadata: { toolName } });
    this.name = 'MCPError';
  }
}

export class MCPValidationError extends MCPError {
  constructor(
    message: string,
    public readonly parameterName: string,
    public readonly expectedType: string,
    public readonly actualValue: any,
    toolName?: string
  ) {
    super(message, toolName, 'medium', { metadata: { parameterName, expectedType, actualValue } });
    this.name = 'MCPValidationError';
  }
}

export class MCPExecutionError extends MCPError {
  constructor(
    message: string,
    toolName: string,
    public readonly executionPhase: 'pre' | 'during' | 'post',
    public readonly originalError?: Error,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, toolName, severity, {
      metadata: { executionPhase, originalError: originalError?.message },
    });
    this.name = 'MCPExecutionError';
  }
}

export class MCPTimeoutError extends MCPError {
  constructor(
    message: string,
    toolName: string,
    public readonly timeoutMs: number,
    public readonly actualTimeMs?: number
  ) {
    super(message, toolName, 'high', { metadata: { timeoutMs, actualTimeMs } });
    this.name = 'MCPTimeoutError';
  }
}

// ===============================
// WASM Integration Errors
// ===============================

/**
 * Base error class for WASM (WebAssembly) integration failures.
 * 
 * @class WASMError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new WASMError(
 *   'WASM module execution failed',
 *   'critical',
 *   { operation: 'execute', metadata: { moduleName: 'math-utils' } }
 * );
 * ```
 */
export class WASMError extends BaseClaudeZenError {
  /**
   * Creates a new WASMError instance.
   * 
   * @param message - Error message.
   * @param severity - Error severity level (defaults to 'medium').
   * @param context - Additional error context (optional).
   */
  constructor(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: Partial<ErrorContext> = {}
  ) {
    super(message, 'WASM', severity, context);
    this.name = 'WASMError';
  }
}

export class WASMLoadingError extends WASMError {
  constructor(
    message: string,
    public readonly moduleName: string,
    public readonly moduleSize?: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'critical'
  ) {
    super(message, severity, { metadata: { moduleName, moduleSize } });
    this.name = 'WASMLoadingError';
  }
}

export class WASMExecutionError extends WASMError {
  constructor(
    message: string,
    public readonly functionName: string,
    public readonly parameters?: any[],
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, severity, { metadata: { functionName, parameters } });
    this.name = 'WASMExecutionError';
  }
}

export class WASMMemoryError extends WASMError {
  constructor(
    message: string,
    public readonly memoryUsage: number,
    public readonly memoryLimit?: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'critical'
  ) {
    super(message, severity, { metadata: { memoryUsage, memoryLimit } });
    this.name = 'WASMMemoryError';
  }
}

// ===============================
// System Infrastructure Errors
// ===============================

/**
 * General system infrastructure error for core system failures.
 * 
 * @class SystemError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new SystemError(
 *   'System resource exhausted',
 *   'RESOURCE_LIMIT',
 *   'critical',
 *   { operation: 'allocate', metadata: { resourceType: 'memory' } }
 * );
 * ```
 */
export class SystemError extends BaseClaudeZenError {
  /**
   * Creates a new SystemError instance.
   * 
   * @param message - Error message.
   * @param code - System error code for classification (optional).
   * @param severity - Error severity level (defaults to 'high').
   * @param context - Additional error context (optional).
   */
  constructor(
    message: string,
    public readonly code?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
    context: Partial<ErrorContext> = {}
  ) {
    super(message, 'System', severity, { ...context, metadata: { code } });
    this.name = 'SystemError';
  }
}

/**
 * Error for input validation failures.
 * 
 * @class ValidationError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new ValidationError(
 *   'Invalid email format',
 *   'email',
 *   'valid email address',
 *   'invalid-email'
 * );
 * ```
 */
export class ValidationError extends BaseClaudeZenError {
  /**
   * Creates a new ValidationError instance.
   * 
   * @param message - Error message.
   * @param field - Name of the field that failed validation (optional).
   * @param expectedValue - Expected value or format (optional).
   * @param actualValue - Actual value that failed validation (optional).
   */
  constructor(
    message: string,
    public readonly field?: string,
    public readonly expectedValue?: any,
    public readonly actualValue?: any
  ) {
    super(message, 'Validation', 'medium', { metadata: { field, expectedValue, actualValue } });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BaseClaudeZenError {
  constructor(
    message: string,
    public readonly resource?: string,
    public readonly resourceId?: string
  ) {
    super(message, 'NotFound', 'medium', { metadata: { resource, resourceId } });
    this.name = 'NotFoundError';
  }
}

/**
 * Error for operation timeout failures.
 * 
 * @class TimeoutError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript
 * throw new TimeoutError(
 *   'Operation timed out',
 *   5000,  // 5 second timeout
 *   7500,  // actual time taken
 *   'high'
 * );
 * ```
 */
export class TimeoutError extends BaseClaudeZenError {
  /**
   * Creates a new TimeoutError instance.
   * 
   * @param message - Error message.
   * @param timeoutMs - Configured timeout in milliseconds (optional).
   * @param actualTimeMs - Actual time taken in milliseconds (optional).
   * @param severity - Error severity level (defaults to 'high').
   */
  constructor(
    message: string,
    public readonly timeoutMs?: number,
    public readonly actualTimeMs?: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, 'Timeout', severity, { metadata: { timeoutMs, actualTimeMs } }, false);
    this.name = 'TimeoutError';
  }
}

export class ConfigurationError extends BaseClaudeZenError {
  constructor(
    message: string,
    public readonly configKey?: string,
    public readonly configValue?: any
  ) {
    super(message, 'Configuration', 'high', { metadata: { configKey, configValue } }, false);
    this.name = 'ConfigurationError';
  }
}

export class NetworkError extends BaseClaudeZenError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, 'Network', severity, { metadata: { statusCode, endpoint } });
    this.name = 'NetworkError';
  }
}

export class TaskError extends BaseClaudeZenError {
  constructor(
    message: string,
    public readonly taskId?: string,
    public readonly taskType?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message, 'Task', severity, { metadata: { taskId, taskType } });
    this.name = 'TaskError';
  }
}

// ===============================
// Storage and Database Errors
// ===============================

export class StorageError extends BaseClaudeZenError {
  constructor(
    message: string,
    public readonly storageType: 'sqlite' | 'memory' | 'file' | 'lancedb' | 'vector',
    public readonly operation: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, 'Storage', severity, { operation, metadata: { storageType } });
    this.name = 'StorageError';
  }
}

export class DatabaseError extends StorageError {
  constructor(
    message: string,
    public readonly query?: string,
    public readonly connectionId?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) {
    super(message, 'sqlite', 'database', severity);
    this.context.metadata = { ...this.context.metadata, query, connectionId };
    this.name = 'DatabaseError';
  }
}

export class TransactionError extends DatabaseError {
  constructor(
    message: string,
    public readonly transactionId: string,
    public readonly rollbackSuccess: boolean = false
  ) {
    super(message, undefined, undefined, 'critical');
    this.context.metadata = { ...this.context.metadata, transactionId, rollbackSuccess };
    this.name = 'TransactionError';
  }
}

// ===============================
// Error Classification Utilities
// ===============================

/**
 * Determines if an error is recoverable and can be retried.
 * 
 * @param error - Error to check for recoverability.
 * @returns True if the error is recoverable, false otherwise.
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   if (isRecoverableError(error)) {
 *     // Attempt recovery or retry
 *     console.log('Error is recoverable, retrying...');
 *   } else {
 *     // Log and fail fast
 *     console.error('Fatal error, cannot recover:', error);
 *   }
 * }
 * ```
 */
export function isRecoverableError(error: Error): boolean {
  if (error instanceof BaseClaudeZenError) {
    return error.recoverable;
  }

  // Default classification for non-Claude-Zen errors
  return !(
    error instanceof TypeError ||
    error instanceof ReferenceError ||
    error.message.includes('out of memory') ||
    error.message.includes('segmentation fault')
  );
}

/**
 * Gets the severity level of an error for prioritization and handling.
 * 
 * @param error - Error to assess severity for.
 * @returns Severity level ('low', 'medium', 'high', or 'critical').
 * @example
 * ```typescript
 * try {
 *   await networkOperation();
 * } catch (error) {
 *   const severity = getErrorSeverity(error);
 *   if (severity === 'critical') {
 *     await initiateEmergencyShutdown();
 *   } else if (severity === 'high') {
 *     await escalateAlert(error);
 *   }
 * }
 * ```
 */
export function getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
  if (error instanceof BaseClaudeZenError) {
    return error.severity;
  }

  // Default severity classification
  if (error.message.includes('timeout') || error.message.includes('network')) {
    return 'medium';
  }
  if (error.message.includes('memory') || error.message.includes('critical')) {
    return 'critical';
  }
  return 'high';
}

/**
 * Determines if an operation should be retried based on error type and attempt count.
 * 
 * @param error - Error that occurred during the operation.
 * @param attempt - Current attempt number (0-based).
 * @param maxRetries - Maximum number of retries allowed (defaults to 3).
 * @returns True if the operation should be retried, false otherwise.
 * @example
 * ```typescript
 * let attempt = 0;
 * const maxRetries = 3;
 * 
 * while (attempt <= maxRetries) {
 *   try {
 *     const result = await unreliableOperation();
 *     return result;
 *   } catch (error) {
 *     if (!shouldRetry(error, attempt, maxRetries)) {
 *       throw error; // Give up
 *     }
 *     attempt++;
 *     await delay(1000 * attempt); // Backoff
 *   }
 * }
 * ```
 */
export function shouldRetry(error: Error, attempt: number, maxRetries: number = 3): boolean {
  if (attempt >= maxRetries) return false;
  if (!isRecoverableError(error)) return false;

  // Don't retry validation or configuration errors
  if (error instanceof ValidationError || error instanceof ConfigurationError) {
    return false;
  }

  return true;
}
