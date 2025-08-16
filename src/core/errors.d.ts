/**
 * Comprehensive Error Handling System for Claude-Zen.
 *
 * Hierarchical error types for FACT, RAG, Swarm, MCP, and WASM systems.
 * Includes error recovery strategies, monitoring, and resilience patterns.
 */
/**
 * @file Errors implementation.
 */
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
    metadata?: Record<string, unknown>;
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
export declare abstract class BaseClaudeZenError extends Error {
    /** Error context with tracking information. */
    readonly context: ErrorContext;
    /** Error severity level. */
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    /** Error category for classification. */
    readonly category: string;
    /** Whether the error is recoverable. */
    readonly recoverable: boolean;
    /** Number of retry attempts made. */
    readonly retryCount: number;
    /**
     * Creates a new BaseClaudeZenError instance.
     *
     * @param message - Error message.
     * @param category - Error category for classification.
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     * @param recoverable - Whether the error is recoverable (defaults to true).
     */
    constructor(message: string, category: string, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Partial<ErrorContext>, recoverable?: boolean);
    private logError;
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
    toJSON(): object;
}
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
export declare class FACTError extends BaseClaudeZenError {
    /**
     * Creates a new FACTError instance.
     *
     * @param message - Error message.
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message: string, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Partial<ErrorContext>);
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
export declare class FACTStorageError extends FACTError {
    readonly backend: string;
    readonly operation: string;
    /**
     * Creates a new FACTStorageError instance.
     *
     * @param message - Error message.
     * @param backend - Storage backend name (e.g., 'sqlite', 'lancedb').
     * @param operation - Storage operation that failed (e.g., 'read', 'write').
     * @param severity - Error severity level (defaults to 'high').
     */
    constructor(message: string, backend: string, operation: string, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class FACTGatheringError extends FACTError {
    readonly query: string;
    readonly sources: string[];
    constructor(message: string, query: string, sources: string[], severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class FACTProcessingError extends FACTError {
    readonly processType: string;
    readonly dataId?: string | undefined;
    constructor(message: string, processType: string, dataId?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
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
export declare class RAGError extends BaseClaudeZenError {
    /**
     * Creates a new RAGError instance.
     *
     * @param message - Error message.
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message: string, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Partial<ErrorContext>);
}
export declare class RAGVectorError extends RAGError {
    readonly operation: 'embed' | 'search' | 'index' | 'delete';
    readonly vectorDimension?: number | undefined;
    constructor(message: string, operation: 'embed' | 'search' | 'index' | 'delete', vectorDimension?: number | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class RAGEmbeddingError extends RAGError {
    readonly modelName: string;
    readonly textLength?: number | undefined;
    constructor(message: string, modelName: string, textLength?: number | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class RAGRetrievalError extends RAGError {
    readonly query: string;
    readonly similarityThreshold?: number | undefined;
    constructor(message: string, query: string, similarityThreshold?: number | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
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
export declare class SwarmError extends BaseClaudeZenError {
    readonly swarmId?: string | undefined;
    /**
     * Creates a new SwarmError instance.
     *
     * @param message - Error message.
     * @param swarmId - Unique identifier of the swarm (optional).
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message: string, swarmId?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Partial<ErrorContext>);
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
export declare class AgentError extends BaseClaudeZenError {
    readonly agentId?: string | undefined;
    readonly agentType?: string | undefined;
    /**
     * Creates a new AgentError instance.
     *
     * @param message - Error message.
     * @param agentId - Unique identifier of the agent (optional).
     * @param agentType - Type of agent (e.g., 'researcher', 'coder') (optional).
     * @param severity - Error severity level (defaults to 'medium').
     */
    constructor(message: string, agentId?: string | undefined, agentType?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class SwarmCommunicationError extends SwarmError {
    readonly fromAgent: string;
    readonly toAgent: string;
    readonly messageType?: string | undefined;
    constructor(message: string, fromAgent: string, toAgent: string, messageType?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class SwarmCoordinationError extends SwarmError {
    readonly coordinationType: string;
    readonly participantCount?: number | undefined;
    constructor(message: string, coordinationType: string, participantCount?: number | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
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
export declare class MCPError extends BaseClaudeZenError {
    readonly toolName?: string | undefined;
    /**
     * Creates a new MCPError instance.
     *
     * @param message - Error message.
     * @param toolName - Name of the MCP tool that failed (optional).
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message: string, toolName?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Partial<ErrorContext>);
}
export declare class MCPValidationError extends MCPError {
    readonly parameterName: string;
    readonly expectedType: string;
    readonly actualValue: unknown;
    constructor(message: string, parameterName: string, expectedType: string, actualValue: unknown, toolName?: string);
}
export declare class MCPExecutionError extends MCPError {
    readonly executionPhase: 'pre' | 'during' | 'post';
    readonly originalError?: Error | undefined;
    constructor(message: string, toolName: string, executionPhase: 'pre' | 'during' | 'post', originalError?: Error | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class MCPTimeoutError extends MCPError {
    readonly timeoutMs: number;
    readonly actualTimeMs?: number | undefined;
    constructor(message: string, toolName: string, timeoutMs: number, actualTimeMs?: number | undefined);
}
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
export declare class WASMError extends BaseClaudeZenError {
    /**
     * Creates a new WASMError instance.
     *
     * @param message - Error message.
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message: string, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Partial<ErrorContext>);
}
export declare class WASMLoadingError extends WASMError {
    readonly moduleName: string;
    readonly moduleSize?: number | undefined;
    constructor(message: string, moduleName: string, moduleSize?: number | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class WASMExecutionError extends WASMError {
    readonly functionName: string;
    readonly parameters?: unknown[] | undefined;
    constructor(message: string, functionName: string, parameters?: unknown[] | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class WASMMemoryError extends WASMError {
    readonly memoryUsage: number;
    readonly memoryLimit?: number | undefined;
    constructor(message: string, memoryUsage: number, memoryLimit?: number | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
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
export declare class SystemError extends BaseClaudeZenError {
    readonly code?: string | undefined;
    /**
     * Creates a new SystemError instance.
     *
     * @param message - Error message.
     * @param code - System error code for classification (optional).
     * @param severity - Error severity level (defaults to 'high').
     * @param context - Additional error context (optional).
     */
    constructor(message: string, code?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical', context?: Partial<ErrorContext>);
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
export declare class ValidationError extends BaseClaudeZenError {
    readonly field?: string | undefined;
    readonly expectedValue?: unknown | undefined;
    readonly actualValue?: unknown | undefined;
    /**
     * Creates a new ValidationError instance.
     *
     * @param message - Error message.
     * @param field - Name of the field that failed validation (optional).
     * @param expectedValue - Expected value or format (optional).
     * @param actualValue - Actual value that failed validation (optional).
     */
    constructor(message: string, field?: string | undefined, expectedValue?: unknown | undefined, actualValue?: unknown | undefined);
}
export declare class NotFoundError extends BaseClaudeZenError {
    readonly resource?: string | undefined;
    readonly resourceId?: string | undefined;
    constructor(message: string, resource?: string | undefined, resourceId?: string | undefined);
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
export declare class TimeoutError extends BaseClaudeZenError {
    readonly timeoutMs?: number | undefined;
    readonly actualTimeMs?: number | undefined;
    /**
     * Creates a new TimeoutError instance.
     *
     * @param message - Error message.
     * @param timeoutMs - Configured timeout in milliseconds (optional).
     * @param actualTimeMs - Actual time taken in milliseconds (optional).
     * @param severity - Error severity level (defaults to 'high').
     */
    constructor(message: string, timeoutMs?: number | undefined, actualTimeMs?: number | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class ConfigurationError extends BaseClaudeZenError {
    readonly configKey?: string | undefined;
    readonly configValue?: unknown | undefined;
    constructor(message: string, configKey?: string | undefined, configValue?: unknown | undefined);
}
export declare class NetworkError extends BaseClaudeZenError {
    readonly statusCode?: number | undefined;
    readonly endpoint?: string | undefined;
    constructor(message: string, statusCode?: number | undefined, endpoint?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class TaskError extends BaseClaudeZenError {
    readonly taskId?: string | undefined;
    readonly taskType?: string | undefined;
    constructor(message: string, taskId?: string | undefined, taskType?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class StorageError extends BaseClaudeZenError {
    readonly storageType: 'sqlite' | 'memory' | 'file' | 'lancedb' | 'vector';
    readonly operation: string;
    constructor(message: string, storageType: 'sqlite' | 'memory' | 'file' | 'lancedb' | 'vector', operation: string, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class DatabaseError extends StorageError {
    readonly query?: string | undefined;
    readonly connectionId?: string | undefined;
    constructor(message: string, query?: string | undefined, connectionId?: string | undefined, severity?: 'low' | 'medium' | 'high' | 'critical');
}
export declare class TransactionError extends DatabaseError {
    readonly transactionId: string;
    readonly rollbackSuccess: boolean;
    constructor(message: string, transactionId: string, rollbackSuccess?: boolean);
}
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
export declare function isRecoverableError(error: Error): boolean;
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
export declare function getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical';
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
export declare function shouldRetry(error: Error, attempt: number, maxRetries?: number): boolean;
//# sourceMappingURL=errors.d.ts.map