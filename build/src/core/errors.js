/**
 * Comprehensive Error Handling System for Claude-Zen.
 *
 * Hierarchical error types for FACT, RAG, Swarm, MCP, and WASM systems.
 * Includes error recovery strategies, monitoring, and resilience patterns.
 */
/**
 * @file Errors implementation.
 */
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('ErrorSystem');
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
export class BaseClaudeZenError extends Error {
    /** Error context with tracking information. */
    context;
    /** Error severity level. */
    severity;
    /** Error category for classification. */
    category;
    /** Whether the error is recoverable. */
    recoverable;
    /** Number of retry attempts made. */
    retryCount = 0;
    /**
     * Creates a new BaseClaudeZenError instance.
     *
     * @param message - Error message.
     * @param category - Error category for classification.
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     * @param recoverable - Whether the error is recoverable (defaults to true).
     */
    constructor(message, category, severity = 'medium', context = {}, recoverable = true) {
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
    logError() {
        const logLevel = this.severity === 'critical' ? 'error' : this.severity === 'high' ? 'warn' : 'info';
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
    toJSON() {
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
    constructor(message, severity = 'medium', context = {}) {
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
    backend;
    operation;
    /**
     * Creates a new FACTStorageError instance.
     *
     * @param message - Error message.
     * @param backend - Storage backend name (e.g., 'sqlite', 'lancedb').
     * @param operation - Storage operation that failed (e.g., 'read', 'write').
     * @param severity - Error severity level (defaults to 'high').
     */
    constructor(message, backend, operation, severity = 'high') {
        super(message, severity, { operation, metadata: { backend } });
        this.backend = backend;
        this.operation = operation;
        this.name = 'FACTStorageError';
    }
}
export class FACTGatheringError extends FACTError {
    query;
    sources;
    constructor(message, query, sources, severity = 'medium') {
        super(message, severity, { metadata: { query, sources } });
        this.query = query;
        this.sources = sources;
        this.name = 'FACTGatheringError';
    }
}
export class FACTProcessingError extends FACTError {
    processType;
    dataId;
    constructor(message, processType, dataId, severity = 'medium') {
        super(message, severity, { metadata: { processType, dataId } });
        this.processType = processType;
        this.dataId = dataId;
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
    constructor(message, severity = 'medium', context = {}) {
        super(message, 'RAG', severity, context);
        this.name = 'RAGError';
    }
}
export class RAGVectorError extends RAGError {
    operation;
    vectorDimension;
    constructor(message, operation, vectorDimension, severity = 'high') {
        super(message, severity, { operation, metadata: { vectorDimension } });
        this.operation = operation;
        this.vectorDimension = vectorDimension;
        this.name = 'RAGVectorError';
    }
}
export class RAGEmbeddingError extends RAGError {
    modelName;
    textLength;
    constructor(message, modelName, textLength, severity = 'high') {
        super(message, severity, { metadata: { modelName, textLength } });
        this.modelName = modelName;
        this.textLength = textLength;
        this.name = 'RAGEmbeddingError';
    }
}
export class RAGRetrievalError extends RAGError {
    query;
    similarityThreshold;
    constructor(message, query, similarityThreshold, severity = 'medium') {
        super(message, severity, { metadata: { query, similarityThreshold } });
        this.query = query;
        this.similarityThreshold = similarityThreshold;
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
    swarmId;
    /**
     * Creates a new SwarmError instance.
     *
     * @param message - Error message.
     * @param swarmId - Unique identifier of the swarm (optional).
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message, swarmId, severity = 'medium', context = {}) {
        super(message, 'Swarm', severity, { ...context, metadata: { swarmId } });
        this.swarmId = swarmId;
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
    agentId;
    agentType;
    /**
     * Creates a new AgentError instance.
     *
     * @param message - Error message.
     * @param agentId - Unique identifier of the agent (optional).
     * @param agentType - Type of agent (e.g., 'researcher', 'coder') (optional).
     * @param severity - Error severity level (defaults to 'medium').
     */
    constructor(message, agentId, agentType, severity = 'medium') {
        super(message, 'Agent', severity, { metadata: { agentId, agentType } });
        this.agentId = agentId;
        this.agentType = agentType;
        this.name = 'AgentError';
    }
}
export class SwarmCommunicationError extends SwarmError {
    fromAgent;
    toAgent;
    messageType;
    constructor(message, fromAgent, toAgent, messageType, severity = 'high') {
        super(message, undefined, severity, {
            metadata: { fromAgent, toAgent, messageType },
        });
        this.fromAgent = fromAgent;
        this.toAgent = toAgent;
        this.messageType = messageType;
        this.name = 'SwarmCommunicationError';
    }
}
export class SwarmCoordinationError extends SwarmError {
    coordinationType;
    participantCount;
    constructor(message, coordinationType, participantCount, severity = 'high') {
        super(message, undefined, severity, {
            metadata: { coordinationType, participantCount },
        });
        this.coordinationType = coordinationType;
        this.participantCount = participantCount;
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
    toolName;
    /**
     * Creates a new MCPError instance.
     *
     * @param message - Error message.
     * @param toolName - Name of the MCP tool that failed (optional).
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message, toolName, severity = 'medium', context = {}) {
        super(message, 'MCP', severity, { ...context, metadata: { toolName } });
        this.toolName = toolName;
        this.name = 'MCPError';
    }
}
export class MCPValidationError extends MCPError {
    parameterName;
    expectedType;
    actualValue;
    constructor(message, parameterName, expectedType, actualValue, toolName) {
        super(message, toolName, 'medium', {
            metadata: { parameterName, expectedType, actualValue },
        });
        this.parameterName = parameterName;
        this.expectedType = expectedType;
        this.actualValue = actualValue;
        this.name = 'MCPValidationError';
    }
}
export class MCPExecutionError extends MCPError {
    executionPhase;
    originalError;
    constructor(message, toolName, executionPhase, originalError, severity = 'high') {
        super(message, toolName, severity, {
            metadata: { executionPhase, originalError: originalError?.message },
        });
        this.executionPhase = executionPhase;
        this.originalError = originalError;
        this.name = 'MCPExecutionError';
    }
}
export class MCPTimeoutError extends MCPError {
    timeoutMs;
    actualTimeMs;
    constructor(message, toolName, timeoutMs, actualTimeMs) {
        super(message, toolName, 'high', { metadata: { timeoutMs, actualTimeMs } });
        this.timeoutMs = timeoutMs;
        this.actualTimeMs = actualTimeMs;
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
    constructor(message, severity = 'medium', context = {}) {
        super(message, 'WASM', severity, context);
        this.name = 'WASMError';
    }
}
export class WASMLoadingError extends WASMError {
    moduleName;
    moduleSize;
    constructor(message, moduleName, moduleSize, severity = 'critical') {
        super(message, severity, { metadata: { moduleName, moduleSize } });
        this.moduleName = moduleName;
        this.moduleSize = moduleSize;
        this.name = 'WASMLoadingError';
    }
}
export class WASMExecutionError extends WASMError {
    functionName;
    parameters;
    constructor(message, functionName, parameters, severity = 'high') {
        super(message, severity, { metadata: { functionName, parameters } });
        this.functionName = functionName;
        this.parameters = parameters;
        this.name = 'WASMExecutionError';
    }
}
export class WASMMemoryError extends WASMError {
    memoryUsage;
    memoryLimit;
    constructor(message, memoryUsage, memoryLimit, severity = 'critical') {
        super(message, severity, { metadata: { memoryUsage, memoryLimit } });
        this.memoryUsage = memoryUsage;
        this.memoryLimit = memoryLimit;
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
    code;
    /**
     * Creates a new SystemError instance.
     *
     * @param message - Error message.
     * @param code - System error code for classification (optional).
     * @param severity - Error severity level (defaults to 'high').
     * @param context - Additional error context (optional).
     */
    constructor(message, code, severity = 'high', context = {}) {
        super(message, 'System', severity, { ...context, metadata: { code } });
        this.code = code;
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
    field;
    expectedValue;
    actualValue;
    /**
     * Creates a new ValidationError instance.
     *
     * @param message - Error message.
     * @param field - Name of the field that failed validation (optional).
     * @param expectedValue - Expected value or format (optional).
     * @param actualValue - Actual value that failed validation (optional).
     */
    constructor(message, field, expectedValue, actualValue) {
        super(message, 'Validation', 'medium', {
            metadata: { field, expectedValue, actualValue },
        });
        this.field = field;
        this.expectedValue = expectedValue;
        this.actualValue = actualValue;
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends BaseClaudeZenError {
    resource;
    resourceId;
    constructor(message, resource, resourceId) {
        super(message, 'NotFound', 'medium', {
            metadata: { resource, resourceId },
        });
        this.resource = resource;
        this.resourceId = resourceId;
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
    timeoutMs;
    actualTimeMs;
    /**
     * Creates a new TimeoutError instance.
     *
     * @param message - Error message.
     * @param timeoutMs - Configured timeout in milliseconds (optional).
     * @param actualTimeMs - Actual time taken in milliseconds (optional).
     * @param severity - Error severity level (defaults to 'high').
     */
    constructor(message, timeoutMs, actualTimeMs, severity = 'high') {
        super(message, 'Timeout', severity, { metadata: { timeoutMs, actualTimeMs } }, false);
        this.timeoutMs = timeoutMs;
        this.actualTimeMs = actualTimeMs;
        this.name = 'TimeoutError';
    }
}
export class ConfigurationError extends BaseClaudeZenError {
    configKey;
    configValue;
    constructor(message, configKey, configValue) {
        super(message, 'Configuration', 'high', { metadata: { configKey, configValue } }, false);
        this.configKey = configKey;
        this.configValue = configValue;
        this.name = 'ConfigurationError';
    }
}
export class NetworkError extends BaseClaudeZenError {
    statusCode;
    endpoint;
    constructor(message, statusCode, endpoint, severity = 'medium') {
        super(message, 'Network', severity, { metadata: { statusCode, endpoint } });
        this.statusCode = statusCode;
        this.endpoint = endpoint;
        this.name = 'NetworkError';
    }
}
export class TaskError extends BaseClaudeZenError {
    taskId;
    taskType;
    constructor(message, taskId, taskType, severity = 'medium') {
        super(message, 'Task', severity, { metadata: { taskId, taskType } });
        this.taskId = taskId;
        this.taskType = taskType;
        this.name = 'TaskError';
    }
}
// ===============================
// Storage and Database Errors
// ===============================
export class StorageError extends BaseClaudeZenError {
    storageType;
    operation;
    constructor(message, storageType, operation, severity = 'high') {
        super(message, 'Storage', severity, {
            operation,
            metadata: { storageType },
        });
        this.storageType = storageType;
        this.operation = operation;
        this.name = 'StorageError';
    }
}
export class DatabaseError extends StorageError {
    query;
    connectionId;
    constructor(message, query, connectionId, severity = 'high') {
        super(message, 'sqlite', 'database', severity);
        this.query = query;
        this.connectionId = connectionId;
        this.context.metadata = { ...this.context.metadata, query, connectionId };
        this.name = 'DatabaseError';
    }
}
export class TransactionError extends DatabaseError {
    transactionId;
    rollbackSuccess;
    constructor(message, transactionId, rollbackSuccess = false) {
        super(message, undefined, undefined, 'critical');
        this.transactionId = transactionId;
        this.rollbackSuccess = rollbackSuccess;
        this.context.metadata = {
            ...this.context.metadata,
            transactionId,
            rollbackSuccess,
        };
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
export function isRecoverableError(error) {
    if (error instanceof BaseClaudeZenError) {
        return error.recoverable;
    }
    // Default classification for non-Claude-Zen errors
    return !(error instanceof TypeError ||
        error instanceof ReferenceError ||
        error.message.includes('out of memory') ||
        error.message.includes('segmentation fault'));
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
export function getErrorSeverity(error) {
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
export function shouldRetry(error, attempt, maxRetries = 3) {
    if (attempt >= maxRetries)
        return false;
    if (!isRecoverableError(error))
        return false;
    // Don't retry validation or configuration errors
    if (error instanceof ValidationError || error instanceof ConfigurationError) {
        return false;
    }
    return true;
}
