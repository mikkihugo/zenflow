/**
 * Comprehensive Error Handling System for Claude-Zen.
 *
 * Hierarchical error types for FACT, RAG, Swarm, MCP, and WASM systems.
 * Includes error recovery strategies, monitoring, and resilience patterns.
 */
/**
 * @file Errors implementation.
 */
export declare class ValidationError extends Error {
    readonly field?: string;
    constructor(message: string, field?: string);
}
export declare class ConfigurationError extends Error {
    readonly configKey?: string;
    constructor(message: string, configKey?: string);
}
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
export declare abstract class BaseClaudeZenError extends Error {
    /** Error context with tracking information. */
    readonly context: ErrorContext;
    /** Error severity level. */
    readonly severity: "low" | "medium" | "high" | "critical";
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
     * @param options - Error configuration options.
     */
    constructor(message: string, options: {
        category: string;
        severity?: "low" | "medium" | "high" | "critical";
        context?: Partial<ErrorContext>;
        recoverable?: boolean;
    });
    private logError;
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
    toJSON(): object;
}
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
export declare class SwarmError extends BaseClaudeZenError {
    readonly swarmId?: string;
    /**
     * Creates a new SwarmError instance.
     *
     * @param message - Error message.
     * @param swarmId - Unique identifier of the swarm (optional).
     * @param severity - Error severity level (defaults to 'medium').
     * @param context - Additional error context (optional).
     */
    constructor(message: string, swarmId?: string, severity?: "low" | "medium" | "high" | "critical", context?: Partial<ErrorContext>);
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
export declare class AgentError extends BaseClaudeZenError {
    readonly agentId?: string;
    readonly agentType?: string;
    /**
     * Creates a new AgentError instance.
     *
     * @param message - Error message.
     * @param agentId - Unique identifier of the agent (optional).
     * @param agentType - Type of agent (e.g., 'researcher',    'coder') (optional).
     * @param severity - Error severity level (defaults to 'medium').
     */
    constructor(message: string, agentId?: string, agentType?: string, severity?: "low" | "medium" | "high" | "critical");
}
export declare class SwarmCommunicationError extends SwarmError {
    readonly fromAgent: string;
    readonly toAgent: string;
    readonly messageType?: string;
    constructor(message: string, options: {
        fromAgent: string;
        toAgent: string;
        messageType?: string;
        severity?: "low" | "medium" | "high" | "critical";
    });
}
export declare class SwarmCoordinationError extends SwarmError {
    readonly coordinationType: string;
    readonly participantCount?: number;
    constructor(message: string, coordinationType: string, participantCount?: number, severity?: "low" | "medium" | "high" | "critical");
}
/**
 * Error for task execution failures (domain-specific).
 */
export declare class TaskError extends BaseClaudeZenError {
    readonly taskId?: string;
    readonly taskType?: string;
    constructor(message: string, taskId?: string, taskType?: string, severity?: "low" | "medium" | "high" | "critical");
}
/**
 * Error for resource not found (domain-specific).
 */
export declare class NotFoundError extends BaseClaudeZenError {
    readonly resource?: string;
    readonly resourceId?: string;
    constructor(message: string, resource?: string, resourceId?: string);
}
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
export declare function isRecoverableError(error: Error): boolean;
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
export declare function getErrorSeverity(error: Error): "low" | "medium" | "high" | "critical";
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
export declare function shouldRetry(error: Error, attempt: number, maxRetries?: number): boolean;
export declare function isValidationError(error: unknown): error is ValidationError;
export declare function createValidationError(message: string, field?: string): ValidationError;
export declare function hasValidationError(error: unknown): boolean;
export declare function getValidationErrors(errors: unknown[]): ValidationError[];
export { BaseClaudeZenError as BaseError };
export declare function isError(value: unknown): value is Error;
//# sourceMappingURL=base.errors.d.ts.map