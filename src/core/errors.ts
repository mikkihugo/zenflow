/**
 * Comprehensive Error Handling System for Claude-Zen.
 *
 * Hierarchical error types for FACT, RAG, Swarm, MCP, and WASM systems.
 * Includes error recovery strategies, monitoring, and resilience patterns.
 */
/**
 * @file errors implementation
 */



import { createLogger } from './logger';

const logger = createLogger({ prefix: 'ErrorSystem' });

// ===============================
// Core Error Context Interface
// ===============================

export interface ErrorContext {
  timestamp: number;
  component: string;
  operation?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
  version?: string;
}

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  exponentialBackoff?: boolean;
  circuitBreakerThreshold?: number;
  fallbackEnabled?: boolean;
  gracefulDegradation?: boolean;
}

export interface ErrorMetrics {
  errorCount: number;
  errorRate: number;
  lastErrorTime: number;
  averageRecoveryTime: number;
  successfulRecoveries: number;
  failedRecoveries: number;
}

// ===============================
// Base Error Classes
// ===============================

export abstract class BaseClaudeZenError extends Error {
  public readonly context: ErrorContext;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly category: string;
  public readonly recoverable: boolean;
  public readonly retryCount: number = 0;

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

export class FACTError extends BaseClaudeZenError {
  constructor(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: Partial<ErrorContext> = {}
  ) {
    super(message, 'FACT', severity, context);
    this.name = 'FACTError';
  }
}

export class FACTStorageError extends FACTError {
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

export class RAGError extends BaseClaudeZenError {
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

export class SwarmError extends BaseClaudeZenError {
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

export class AgentError extends BaseClaudeZenError {
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

export class MCPError extends BaseClaudeZenError {
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

export class WASMError extends BaseClaudeZenError {
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

export class SystemError extends BaseClaudeZenError {
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

export class ValidationError extends BaseClaudeZenError {
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

export class TimeoutError extends BaseClaudeZenError {
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

export function shouldRetry(error: Error, attempt: number, maxRetries: number = 3): boolean {
  if (attempt >= maxRetries) return false;
  if (!isRecoverableError(error)) return false;

  // Don't retry validation or configuration errors
  if (error instanceof ValidationError || error instanceof ConfigurationError) {
    return false;
  }

  return true;
}
