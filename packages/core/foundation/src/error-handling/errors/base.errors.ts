/**
 * Comprehensive Error Handling System for Claude-Zen.
 *
 * Hierarchical error types for FACT, RAG, Swarm, MCP, and WASM systems.
 * Includes error recovery strategies, monitoring, and resilience patterns.
 */
/**
 * @file Errors implementation.
 */

import { getLogger} from "../../core/logging/index.js";

// Define ValidationError and ConfigurationError locally to avoid circular import
export class ValidationError extends Error {
	constructor(
		message:string,
		public readonly field?:string,
	) {
		super(message);
		this.name = "ValidationError";
}
}

export class ConfigurationError extends Error {
	constructor(
		message:string,
		public readonly configKey?:string,
	) {
		super(message);
		this.name = "ConfigurationError";
}
}

const logger = getLogger("ErrorSystem");

// ===============================
// Core Error Context Interface
// ===============================

/**
 * Context information for error tracking and debugging.
 *
 * @interface ErrorContext
 * @example
 * ```typescript`
 * const context:ErrorContext = {
 *   timestamp:Date.now(),
 *   component: 'RAG', *   operation: 'vectorSearch', *   correlationId: 'req-123', *   userId: 'user-456', *   metadata:{ query: 'search term'}
 *};
 * ```
 */
export interface ErrorContext {
	/** Timestamp when the error occurred. */
	timestamp:number;
	/** Component or system where the error originated. */
	component:string;
	/** Specific operation that failed (optional). */
	operation?:string;
	/** Unique identifier for request correlation (optional). */
	correlationId?:string;
	/** Additional metadata about the error context (optional). */
	metadata?:Record<string, unknown>;
	/** Stack trace of the error (optional). */
	stackTrace?:string;
	/** User ID associated with the error (optional). */
	userId?:string;
	/** Session ID for the current session (optional). */
	sessionId?:string;
	/** Version of the application (optional). */
	version?:string;
}

/**
 * Configuration options for error recovery strategies.
 *
 * @interface ErrorRecoveryOptions
 * @example
 * ```typescript`
 * const options:ErrorRecoveryOptions = {
 *   maxRetries:3,
 *   retryDelayMs:1000,
 *   exponentialBackoff:true,
 *   circuitBreakerThreshold:5,
 *   fallbackEnabled:true,
 *   gracefulDegradation:true
 *};
 * ```
 */
export interface ErrorRecoveryOptions {
	/** Maximum number of retry attempts (optional). */
	maxRetries?:number;
	/** Delay between retries in milliseconds (optional). */
	retryDelayMs?:number;
	/** Whether to use exponential backoff for retries (optional). */
	exponentialBackoff?:boolean;
	/** Threshold for circuit breaker activation (optional). */
	circuitBreakerThreshold?:number;
	/** Whether fallback mechanisms are enabled (optional). */
	fallbackEnabled?:boolean;
	/** Whether graceful degradation is enabled (optional). */
	gracefulDegradation?:boolean;
}

/**
 * Metrics for error tracking and monitoring.
 *
 * @interface ErrorMetrics
 * @example
 * ```typescript`
 * const metrics:ErrorMetrics = {
 *   errorCount:15,
 *   errorRate:0.02, // 2%
 *   lastErrorTime:Date.now(),
 *   averageRecoveryTime:500,
 *   successfulRecoveries:12,
 *   failedRecoveries:3
 *};
 * ```
 */
export interface ErrorMetrics {
	/** Total number of errors recorded. */
	errorCount:number;
	/** Error rate as a percentage (0-1). */
	errorRate:number;
	/** Timestamp of the most recent error. */
	lastErrorTime:number;
	/** Average time to recover from errors in milliseconds. */
	averageRecoveryTime:number;
	/** Number of successful error recoveries. */
	successfulRecoveries:number;
	/** Number of failed recovery attempts. */
	failedRecoveries:number;
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
 * ```typescript`
 * class CustomError extends BaseClaudeZenError {
 *   constructor(message:string) {
 *     super(message, 'Custom',    'medium', {
 *       operation: 'customOperation', *       metadata:{ customData: 'value'}
 *});
 *     this.name = 'CustomError';
 *}
 *}
 *
 * const error = new CustomError('Something went wrong');
 * logger.info(error.severity); // 'medium') * logger.info(error.recoverable); // true
 * ```
 */
export abstract class BaseClaudeZenError extends Error {
	/** Error context with tracking information. */
	public readonly context:ErrorContext;
	/** Error severity level. */
	public readonly severity:"low" | "medium" | "high" | "critical";
	/** Error category for classification. */
	public readonly category:string;
	/** Whether the error is recoverable. */
	public readonly recoverable:boolean;
	/** Number of retry attempts made. */
	public readonly retryCount:number = 0;

	/**
	 * Creates a new BaseClaudeZenError instance.
	 *
	 * @param message - Error message.
	 * @param options - Error configuration options.
	 */
	constructor(
		message:string,
		options:{
			category:string;
			severity?:"low" | "medium" | "high" | "critical";
			context?:Partial<ErrorContext>;
			recoverable?:boolean;
},
	) {
		super(message);
		this.category = options.category;
		this.severity = options.severity ?? "medium";
		this.recoverable = options.recoverable ?? true;
		this.context = {
			timestamp:Date.now(),
			component:this.category,
			stackTrace:this.stack || "",
			...(options.context ?? {}),
};

		// Log error immediately
		this.logError();
}

	private logError():void {
		const logLevel =
			this.severity === "critical"
				? "error"
				:this.severity === "high"
					? "warn"
					:"info";

		logger[logLevel](`[${this.category}] ${this.message}`, {
			severity:this.severity,
			context:this.context,
			recoverable:this.recoverable,
});
}

	/**
	 * Converts the error to a JSON-serializable object.
	 *
	 * @returns JSON representation of the error.
	 * @example
	 * ```typescript`
	 * const error = new CustomError('Test error');
	 * const json = error.toJSON();
	 * logger.info(JSON.stringify(json, null, 2));
	 * ```
	 */
	public toJSON():object {
		return {
			name:this.name,
			message:this.message,
			category:this.category,
			severity:this.severity,
			recoverable:this.recoverable,
			context:this.context,
			retryCount:this.retryCount,
};
}
}

// ===============================
// FACT System Errors - Domain-Specific (Moved to @claude-zen/intelligence)
// ===============================

// FACT errors moved to @claude-zen/intelligence package where FACT integration lives
// FACT errors moved to @claude-zen/intelligence package
// export { FACTError, FACTStorageError, FACTGatheringError, FACTProcessingError} from '@claude-zen/intelligence';

// ===============================
// RAG System Errors - Domain-Specific (Moved to @claude-zen/intelligence)
// ===============================

// RAG errors moved to @claude-zen/intelligence package where RAG integration lives
// export { RAGError, RAGVectorError, RAGEmbeddingError, RAGRetrievalError} from '@claude-zen/intelligence';

// ===============================
// Swarm Coordination Errors
// ===============================

/**
 * Base error class for swarm coordination system failures.
 *
 * @class SwarmError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript`
 * throw new SwarmError(
 *   'Swarm coordination failed', *   'swarm-789', *   'high', *   { operation: 'coordination', metadata:{ agentCount: 5}}
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
		message:string,
		public readonly swarmId?:string,
		severity:"low" | "medium" | "high" | "critical" = "medium",
		context:Partial<ErrorContext> = {},
	) {
		super(message, {
			category:"Swarm",
			severity,
			context:{ ...context, metadata:{ swarmId}},
});
		this.name = "SwarmError";
}
}

/**
 * Error class for individual agent failures within a swarm.
 *
 * @class AgentError
 * @augments BaseClaudeZenError
 * @example
 * ```typescript`
 * throw new AgentError(
 *   'Agent execution failed', *   'agent-123', *   'researcher', *   'high') * );
 * ```
 */
export class AgentError extends BaseClaudeZenError {
	/**
	 * Creates a new AgentError instance.
	 *
	 * @param message - Error message.
	 * @param agentId - Unique identifier of the agent (optional).
	 * @param agentType - Type of agent (e.g., 'researcher',    'coder') (optional).
	 * @param severity - Error severity level (defaults to 'medium').
	 */
	constructor(
		message:string,
		public readonly agentId?:string,
		public readonly agentType?:string,
		severity:"low" | "medium" | "high" | "critical" = "medium",
	) {
		super(message, {
			category:"Agent",
			severity,
			context:{ metadata: { agentId, agentType}},
});
		this.name = "AgentError";
}
}

export class SwarmCommunicationError extends SwarmError {
	public readonly fromAgent:string;
	public readonly toAgent:string;
	public readonly messageType?:string;

	constructor(
		message:string,
		options:{
			fromAgent:string;
			toAgent:string;
			messageType?:string;
			severity?:"low" | "medium" | "high" | "critical";
},
	) {
		super(message, undefined, options.severity ?? "high", {
			metadata:{
				fromAgent:options.fromAgent,
				toAgent:options.toAgent,
				messageType:options.messageType,
},
});
		this.name = "SwarmCommunicationError";
		this.fromAgent = options.fromAgent;
		this.toAgent = options.toAgent;
		this.messageType = options.messageType;
}
}

export class SwarmCoordinationError extends SwarmError {
	constructor(
		message:string,
		public readonly coordinationType:string,
		public readonly participantCount?:number,
		severity:"low" | "medium" | "high" | "critical" = "high",
	) {
		super(message, undefined, severity, {
			metadata:{ coordinationType, participantCount},
});
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
	constructor(
		message:string,
		public readonly taskId?:string,
		public readonly taskType?:string,
		severity:"low" | "medium" | "high" | "critical" = "medium",
	) {
		super(message, {
			category:"Task",
			severity,
			context:{ metadata: { taskId, taskType}},
});
		this.name = "TaskError";
}
}

/**
 * Error for resource not found (domain-specific).
 */
export class NotFoundError extends BaseClaudeZenError {
	constructor(
		message:string,
		public readonly resource?:string,
		public readonly resourceId?:string,
	) {
		super(message, {
			category:"NotFound",
			severity:"medium",
			context:{ metadata: { resource, resourceId}},
});
		this.name = "NotFoundError";
}
}

// ===============================
// Storage and Database Errors - Foundation's Public API Only
// ===============================

// Foundation's public storage error API (database package is private/internal)
// REMOVED:Circular import - these errors should be defined locally
// export { StorageError, DatabaseConnectionError} from '@claude-zen/foundation';

// ===============================
// Error Classification Utilities
// ===============================

/**
 * Determines if an error is recoverable and can be retried.
 *
 * @param error - Error to check for recoverability.
 * @returns True if the error is recoverable, false otherwise.
 * @example
 * ```typescript`
 * try {
 *   await someOperation();
 *} catch (error) {
 *   if (isRecoverableError(error)) {
 *     // Attempt recovery or retry
 *     logger.info('Error is recoverable, retrying...');
 *} else {
 *     // Log and fail fast
 *     logger.error('Fatal error, cannot recover: ', error);
' *}
 *}
 * ```
 */
export function isRecoverableError(error:Error): boolean {
	if (error instanceof BaseClaudeZenError) {
		return error.recoverable;
}

	// Default classification for non-Claude-Zen errors
	return !(
		error instanceof TypeError ||
		error instanceof ReferenceError ||
		error.message.includes("out of memory") ||
		error.message.includes("segmentation fault")
	);
}

/**
 * Gets the severity level of an error for prioritization and handling.
 *
 * @param error - Error to assess severity for.
 * @returns Severity level ('low',    'medium',    'high', or ' critical').
 * @example
 * ```typescript`
 * try {
 *   await networkOperation();
 *} catch (error) {
 *   const severity = getErrorSeverity(error);
 *   if (severity === 'critical') {
 *     await initiateEmergencyShutdown();
 *} else if (severity === 'high') {
 *     await escalateAlert(error);
 *}
 *}
 * ```
 */
export function getErrorSeverity(
	error:Error,
):"low" | "medium" | "high" | "critical" {
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
 * ```typescript`
 * let attempt = 0;
 * const maxRetries = 3;
 *
 * while (attempt <= maxRetries) {
 *   try {
 *     const result = await unreliableOperation();
 *     return result;
 *} catch (error) {
 *     if (!shouldRetry(error, attempt, maxRetries)) {
 *       throw error; // Give up
 *}
 *     attempt++;
 *     await delay(1000 * attempt); // Backoff
 *}
 *}
 * ```
 */
export function shouldRetry(
	error:Error,
	attempt:number,
	maxRetries = 3,
):boolean {
	return !(
		attempt >= maxRetries ||
		!isRecoverableError(error) ||
		error instanceof ValidationError ||
		error instanceof ConfigurationError
	);
}

// ===============================
// FOUNDATION ERROR SYSTEM
// ===============================

// Foundation error utilities available via main package exports

// Export utility functions for validation error handling
export function isValidationError(error:unknown): error is ValidationError {
	return error instanceof ValidationError;
}

export function createValidationError(
	message:string,
	field?:string,
):ValidationError {
	return new ValidationError(message, field);
}

export function hasValidationError(error:unknown): boolean {
	return isValidationError(error);
}

export function getValidationErrors(errors:unknown[]): ValidationError[] {
	return errors.filter(isValidationError);
}

// Add BaseError alias for backward compatibility
export { BaseClaudeZenError as BaseError};

// Export isError utility function
export function isError(value:unknown): value is Error {
	return value instanceof Error;
}
