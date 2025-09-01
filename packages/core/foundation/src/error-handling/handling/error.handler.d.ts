/**
 * @fileoverview Modern Error Handling using Battle-Tested Libraries
 *
 * Professional error handling using established npm packages:
 * - neverthrow:Type-safe Result<T, E> pattern
 * - p-retry:Advanced retry logic with exponential backoff
 * - opossum:Production-ready circuit breaker
 *
 * Features:
 * - Type-safe error handling with Result pattern
 * - Advanced retry logic with configurable strategies
 * - Circuit breaker with metrics and health monitoring
 * - Error composition and transformation utilities
 * - Async error handling helpers
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */
import { type ConstantBackoff, type DelegateBackoff, ExponentialBackoff, type IterableBackoff, TimeoutStrategy } from 'cockatiel';
import { err, errAsync, ok, okAsync, Result, ResultAsync } from 'neverthrow';
import type { JsonObject } from '../../types/primitives';
/**
 * Retry options for Cockatiel retry policy.
 * Configures retry behavior with backoff strategies.
 *
 * @interface CockatielRetryOptions
 */
export interface CockatielRetryOptions {
    maxAttempts?: number;
    backoff?: ExponentialBackoff<unknown> | ConstantBackoff | IterableBackoff | DelegateBackoff<unknown, unknown>;
}
/**
 * Timeout options for Cockatiel timeout policy.
 * Configures timeout behavior and cancellation strategies.
 *
 * @interface CockatielTimeoutOptions
 */
export interface CockatielTimeoutOptions {
    timeout?: number;
    strategy?: TimeoutStrategy;
}
/**
 * Circuit breaker configuration options.
 * Controls failure detection and recovery behavior.
 *
 * @interface CircuitBreakerOptions
 */
export interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    minimumThroughput?: number;
}
/**
 * Enhanced error class with structured context and metadata.
 * Provides rich error information for debugging and monitoring.
 *
 * @class EnhancedError
 * @extends Error
 *
 * @example
 * '''typescript'
 * const error = new EnhancedError(
 *   'Database connection failed', *   { host: 'localhost', port:5432},
 *   'DB_CONNECTION_ERROR') * );
 *
 * const enriched = error.withContext({ retryAttempt:3});
 * '
 */
export declare class EnhancedError extends Error {
    readonly context: JsonObject;
    readonly timestamp: Date;
    readonly code?: string;
    constructor(message: string, context?: JsonObject, code?: string, options?: {
        cause?: unknown;
    });
    /**
     * Creates a new enhanced error with additional context merged in.
     *
     * @param additionalContext - Additional context to merge with existing context
     * @returns New EnhancedError instance with merged context
     */
    withContext(additionalContext: JsonObject): EnhancedError;
    /**
     * Converts the error to a plain object suitable for serialization.
     *
     * @returns Plain object representation of the error
     */
    toObject(): JsonObject;
}
/**
 * Context error with enhanced metadata and serialization capabilities.
 * Extends basic Error with rich context information and debugging support.
 *
 * @class ContextError
 * @extends Error
 *
 * @example
 * '''typescript'
 * const contextError = new ContextError(
 *   'Validation failed', *   { field: 'email', value: ' invalid-email', rule: ' email-format'},
 *   'VALIDATION_ERROR') * );
 *
 * const enriched = contextError.withContext({ userId: '12345'});
 * const serialized = enriched.toObject();
 * '
 */
export declare class ContextError extends Error {
    readonly context: JsonObject;
    readonly timestamp: Date;
    readonly code?: string;
    constructor(message: string, context?: JsonObject, code?: string, options?: {
        cause?: unknown;
    });
    /**
     * Creates a new context error with additional context merged in.
     *
     * @param additionalContext - Additional context to merge with existing context
     * @returns New ContextError instance with merged context
     */
    withContext(additionalContext: JsonObject): ContextError;
    /**
     * Converts the context error to a plain object with enhanced metadata.
     * Includes context keys, summary, and type information for debugging.
     *
     * @returns Enhanced plain object representation with context metadata
     */
    toObject(): JsonObject;
}
/**
 * Specific error types
 */
export declare class ValidationError extends ContextError {
    constructor(message: string, context?: JsonObject);
}
export declare class ConfigurationError extends ContextError {
    constructor(message: string, context?: JsonObject);
}
export declare class NetworkError extends ContextError {
    constructor(message: string, context?: JsonObject);
}
export declare class TimeoutError extends ContextError {
    constructor(message: string, context?: JsonObject);
}
export declare class ResourceError extends ContextError {
    constructor(message: string, context?: JsonObject);
}
/**
 * Error utilities
 */
export declare function isError(value: unknown): value is Error;
export declare function isErrorWithContext(value: unknown): value is ContextError;
export declare function ensureError(value: unknown): Error;
export declare function withContext(error: unknown, context: JsonObject): ContextError;
/**
 * Safe async execution with Result pattern
 */
export declare function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>>;
/**
 * Safe sync execution with Result pattern
 */
export declare function safe<T>(fn: () => T): Result<T, Error>;
/**
 * Cockatiel-based retry configuration
 */
export interface RetryOptions {
    maxAttempts?: number;
    backoff?: ExponentialBackoff<unknown> | ConstantBackoff | IterableBackoff | DelegateBackoff<unknown, unknown>;
    onFailedAttempt?: (error: Error, attemptNumber: number) => void | Promise<void>;
    shouldRetry?: (error: Error) => boolean;
    retryIf?: (error: Error) => boolean;
    abortIf?: (error: Error) => boolean;
}
/**
 * Cockatiel-based retry function with logging and better error handling
 */
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<Result<T, Error>>;
/**
 * Circuit breaker with monitoring
 */
export declare class CircuitBreakerWithMonitoring<T extends unknown[], R> {
    private readonly policy;
    private readonly name;
    private readonly action;
    constructor(action: (...args: T) => Promise<R>, options?: {
        timeout?: number;
        errorThresholdPercentage?: number;
        resetTimeout?: number;
        minimumThroughput?: number;
    }, name?: string);
    private setupEventListeners;
    /**
     * Execute the circuit breaker with Result pattern
     */
    execute(...args: T): Promise<Result<R, Error>>;
    /**
     * Get circuit breaker statistics
     */
    getStats(): {
        name: string;
        state: string;
        isOpen: boolean;
        isHalfOpen: boolean;
        isClosed: boolean;
    };
    /**
     * Get circuit breaker state
     */
    getState(): {
        isOpen: boolean;
        isHalfOpen: boolean;
        isClosed: boolean;
        state: string;
    };
    /**
     * Clear metrics (cockatiel doesn't support reset/shutdown)
     */
    clear(): void;
}
/**
 * Create a circuit breaker with Result pattern
 */
export declare function createCircuitBreaker<T extends unknown[], R>(action: (...args: T) => Promise<R>, options?: {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    minimumThroughput?: number;
}, name?: string): CircuitBreakerWithMonitoring<T, R>;
/**
 * Cockatiel-based timeout wrapper with Result pattern
 */
export declare function withTimeout<T>(fn: (context: {
    signal: AbortSignal;
}) => Promise<T>, timeoutMs: number, timeoutMessage?: string, strategy?: TimeoutStrategy): Promise<Result<T, TimeoutError>>;
/**
 * Legacy withTimeout for functions that don't accept AbortSignal
 */
export declare function withTimeoutLegacy<T>(fn: () => Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<Result<T, TimeoutError>>;
/**
 * Execute all operations in parallel and collect results
 */
export declare function executeAll<T>(operations: (() => Promise<T>)[]): Promise<Result<T[], Error[]>>;
/**
 * Execute all operations and return only successful results
 */
export declare function executeAllSuccessful<T>(operations: (() => Promise<T>)[]): Promise<Result<T[], Error[]>>;
/**
 * Transform errors in Result chains
 */
export declare function transformError<T, E, F>(result: Result<T, E>, transformer: (error: E) => F): Result<T, F>;
/**
 * Error recovery utility
 */
export declare function createErrorRecovery<T>(fallbackValue: T, shouldRecover?: (error: Error) => boolean): (error: Error) => Result<T, Error>;
/**
 * Error aggregator for collecting multiple errors
 */
export declare class ErrorAggregator {
    private errors;
    add(error: Error): this;
    addResult<T>(result: Result<T, Error>): this;
    hasErrors(): boolean;
    getErrors(): Error[];
    getFirstError(): Error | null;
    clear(): this;
    toResult<T>(value: T): Result<T, Error[]>;
    toSingleResult<T>(value: T): Result<T, Error>;
}
/**
 * Create an error aggregator
 */
export declare function createErrorAggregator(): ErrorAggregator;
/**
 * Utility for creating error chains
 */
export declare function createErrorChain(baseError: Error, ...additionalErrors: Error[]): ContextError;
export { Result, ok, err, ResultAsync, errAsync, okAsync };
export { CircuitState, ConstantBackoff, DelegateBackoff, ExponentialBackoff, IterableBackoff, TaskCancelledError, TimeoutStrategy, } from 'cockatiel';
export declare const attempt: typeof safe;
export declare const attemptAsync: typeof safeAsync;
export declare const retryWithResult: typeof withRetry;
export declare const timeoutWithResult: typeof withTimeout;
export declare const circuitBreakerWithResult: typeof createCircuitBreaker;
export declare const parallel: typeof executeAll;
export declare const parallelSuccessful: typeof executeAllSuccessful;
export declare const recover: typeof createErrorRecovery;
export declare const aggregate: typeof createErrorAggregator;
export declare const chain: typeof createErrorChain;
export declare const context: typeof withContext;
export declare const exit: (error: Error, code?: number) => never;
export declare const panic: (error: Error) => never;
export declare const assert: (condition: unknown, errorMessage?: string) => asserts condition;
export declare const invariant: (condition: unknown, errorMessage?: string) => asserts condition;
export declare const fail: (message: string, context?: JsonObject) => never;
export declare const failWith: <T extends Error>(error: T) => never;
export type { BaseError } from '../../types/errors';
export { ErrorCategory as ErrorCategoryEnum, ErrorSeverity as ErrorSeverityEnum, } from '../../types/errors';
export declare const ERROR_HANDLING: {
    readonly safe: typeof safe;
    readonly safeAsync: typeof safeAsync;
    readonly withRetry: typeof withRetry;
    readonly withTimeout: typeof withTimeout;
    readonly createCircuitBreaker: typeof createCircuitBreaker;
    readonly executeAll: typeof executeAll;
    readonly executeAllSuccessful: typeof executeAllSuccessful;
    readonly transformError: typeof transformError;
    readonly createErrorRecovery: typeof createErrorRecovery;
    readonly createErrorAggregator: typeof createErrorAggregator;
    readonly createErrorChain: typeof createErrorChain;
    readonly withContext: typeof withContext;
    readonly ensureError: typeof ensureError;
    readonly isError: typeof isError;
    readonly isErrorWithContext: typeof isErrorWithContext;
    readonly attempt: typeof safe;
    readonly attemptAsync: typeof safeAsync;
    readonly retryWithResult: typeof withRetry;
    readonly timeoutWithResult: typeof withTimeout;
    readonly circuitBreakerWithResult: typeof createCircuitBreaker;
    readonly parallel: typeof executeAll;
    readonly parallelSuccessful: typeof executeAllSuccessful;
    readonly recover: typeof createErrorRecovery;
    readonly aggregate: typeof createErrorAggregator;
    readonly chain: typeof createErrorChain;
    readonly context: typeof withContext;
    readonly exit: (error: Error, code?: number) => never;
    readonly panic: (error: Error) => never;
    readonly assert: (condition: unknown, errorMessage?: string) => asserts condition;
    readonly invariant: (condition: unknown, errorMessage?: string) => asserts condition;
    readonly fail: (message: string, context?: JsonObject) => never;
    readonly failWith: <T extends Error>(error: T) => never;
};
//# sourceMappingURL=error.handler.d.ts.map