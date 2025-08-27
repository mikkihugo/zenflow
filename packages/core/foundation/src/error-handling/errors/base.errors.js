/**
 * Comprehensive Error Handling System for Claude-Zen.
 *
 * Hierarchical error types for FACT, RAG, Swarm, MCP, and WASM systems.
 * Includes error recovery strategies, monitoring, and resilience patterns.
 */
/**
 * @file Errors implementation.
 */
import { getLogger } from "../../core/logging/index.js";
// Define ValidationError and ConfigurationError locally to avoid circular import
export class ValidationError extends Error {
    field;
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = "ValidationError";
    }
}
export class ConfigurationError extends Error {
    configKey;
    constructor(message, configKey) {
        super(message);
        this.configKey = configKey;
        this.name = "ConfigurationError";
    }
}
const logger = getLogger("ErrorSystem");
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
     * @param options - Error configuration options.
     */
    constructor(message, options) {
        super(message);
        this.category = options.category;
        this.severity = options.severity ?? "medium";
        this.recoverable = options.recoverable ?? true;
        this.context = {
            timestamp: Date.now(),
            component: this.category,
            stackTrace: this.stack || "",
            ...(options.context ?? {}),
        };
        // Log error immediately
        this.logError();
    }
    logError() {
        const logLevel = this.severity === "critical"
            ? "error"
            : this.severity === "high"
                ? "warn"
                : "info";
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
// FACT System Errors - Domain-Specific (Moved to @claude-zen/intelligence)
// ===============================
// FACT errors moved to @claude-zen/intelligence package where FACT integration lives
// FACT errors moved to @claude-zen/intelligence package
// export { FACTError, FACTStorageError, FACTGatheringError, FACTProcessingError } from '@claude-zen/intelligence';
// ===============================
// RAG System Errors - Domain-Specific (Moved to @claude-zen/intelligence)
// ===============================
// RAG errors moved to @claude-zen/intelligence package where RAG integration lives
// export { RAGError, RAGVectorError, RAGEmbeddingError, RAGRetrievalError } from '@claude-zen/intelligence';
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
    constructor(message, swarmId, severity = "medium", context = {}) {
        super(message, {
            category: "Swarm",
            severity,
            context: { ...context, metadata: { swarmId } },
        });
        this.swarmId = swarmId;
        this.name = "SwarmError";
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
    constructor(message, agentId, agentType, severity = "medium") {
        super(message, {
            category: "Agent",
            severity,
            context: { metadata: { agentId, agentType } },
        });
        this.agentId = agentId;
        this.agentType = agentType;
        this.name = "AgentError";
    }
}
export class SwarmCommunicationError extends SwarmError {
    fromAgent;
    toAgent;
    messageType;
    constructor(message, options) {
        super(message, undefined, options.severity ?? "high", {
            metadata: {
                fromAgent: options.fromAgent,
                toAgent: options.toAgent,
                messageType: options.messageType,
            },
        });
        this.name = "SwarmCommunicationError";
        this.fromAgent = options.fromAgent;
        this.toAgent = options.toAgent;
        this.messageType = options.messageType;
    }
}
export class SwarmCoordinationError extends SwarmError {
    coordinationType;
    participantCount;
    constructor(message, coordinationType, participantCount, severity = "high") {
        super(message, undefined, severity, {
            metadata: { coordinationType, participantCount },
        });
        this.coordinationType = coordinationType;
        this.participantCount = participantCount;
        this.name = "SwarmCoordinationError";
    }
}
// ===============================
// System Infrastructure Errors
// ===============================
// ===============================
// Domain-Specific Errors (Keep these - they're claude-code-zen specific)
// ===============================
/**
 * Error for task execution failures (domain-specific).
 */
export class TaskError extends BaseClaudeZenError {
    taskId;
    taskType;
    constructor(message, taskId, taskType, severity = "medium") {
        super(message, {
            category: "Task",
            severity,
            context: { metadata: { taskId, taskType } },
        });
        this.taskId = taskId;
        this.taskType = taskType;
        this.name = "TaskError";
    }
}
/**
 * Error for resource not found (domain-specific).
 */
export class NotFoundError extends BaseClaudeZenError {
    resource;
    resourceId;
    constructor(message, resource, resourceId) {
        super(message, {
            category: "NotFound",
            severity: "medium",
            context: { metadata: { resource, resourceId } },
        });
        this.resource = resource;
        this.resourceId = resourceId;
        this.name = "NotFoundError";
    }
}
// ===============================
// Storage and Database Errors - Foundation's Public API Only
// ===============================
// Foundation's public storage error API (database package is private/internal)
// REMOVED: Circular import - these errors should be defined locally
// export { StorageError, DatabaseConnectionError } from '@claude-zen/foundation';
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
        error.message.includes("out of memory") ||
        error.message.includes("segmentation fault"));
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
    if (error.message.includes("timeout") || error.message.includes("network")) {
        return "medium";
    }
    if (error.message.includes("memory") || error.message.includes("critical")) {
        return "critical";
    }
    return "high";
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
    return !(attempt >= maxRetries ||
        !isRecoverableError(error) ||
        error instanceof ValidationError ||
        error instanceof ConfigurationError);
}
// ===============================
// FOUNDATION ERROR SYSTEM
// ===============================
// Foundation error utilities available via main package exports
// Export utility functions for validation error handling
export function isValidationError(error) {
    return error instanceof ValidationError;
}
export function createValidationError(message, field) {
    return new ValidationError(message, field);
}
export function hasValidationError(error) {
    return isValidationError(error);
}
export function getValidationErrors(errors) {
    return errors.filter(isValidationError);
}
// Add BaseError alias for backward compatibility
export { BaseClaudeZenError as BaseError };
// Export isError utility function
export function isError(value) {
    return value instanceof Error;
}
