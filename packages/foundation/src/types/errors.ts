/**
 * @fileoverview Foundation Types - Error Types and Patterns
 *
 * Standardized error types and error handling patterns used across the monorepo.
 * These provide a consistent approach to error management and error propagation
 * throughout all packages.
 *
 * SCOPE: Generic error types that are NOT domain-specific
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @example
 * ```typescript
 * import type { BaseError, ValidationError, SystemError } from '@claude-zen/foundation/types';
 * import { createValidationError, isValidationError } from '@claude-zen/foundation/types';
 *
 * function validateEmail(email: string): ValidationError|null {
 *   if (!email.includes('@')) {
 *     return createValidationError('Invalid email format', { field: 'email' });
 *   }
 *   return null;
 * }
 * ```
 */

import type { UUID, Timestamp } from './primitives';
import { LogLevel } from './primitives';

// =============================================================================
// BASE ERROR TYPES - Foundation error interfaces
// =============================================================================

/**
 * Base error interface that all custom errors should extend
 * Provides consistent error structure across all packages
 */
export interface BaseError extends Error {
  /** Error type identifier for programmatic handling */
  readonly type: string;
  /** Unique error code for this specific error type */
  readonly code: string;
  /** Human-readable error message */
  readonly message: string;
  /** When this error occurred */
  readonly timestamp: Timestamp;
  /** Unique identifier for error tracking/correlation */
  readonly errorId: UUID;
  /** Additional context data about the error */
  readonly context?: Record<string, unknown>;
  /** Nested cause of this error */
  readonly cause?: Error;
  /** Whether this error can be retried */
  readonly retryable: boolean;
  /** Log level for this error */
  readonly logLevel: LogLevel;
  /** Stack trace (inherited from Error) */
  readonly stack?: string;
}

/**
 * Validation error for input/data validation failures
 */
export interface ValidationError extends BaseError {
  readonly type: 'ValidationError';
  /** Field that failed validation (if applicable) */
  readonly field?: string;
  /** Validation rule that was violated */
  readonly rule?: string;
  /** Expected value or format */
  readonly expected?: unknown;
  /** Actual value that failed validation */
  readonly actual?: unknown;
  /** Multiple validation failures */
  readonly violations?: ValidationViolation[];
}

/**
 * Individual validation violation
 */
export interface ValidationViolation {
  /** Field that failed validation */
  field: string;
  /** Validation rule that was violated */
  rule: string;
  /** Error message for this violation */
  message: string;
  /** Expected value or format */
  expected?: unknown;
  /** Actual value that failed validation */
  actual?: unknown;
}

/**
 * Configuration error for invalid or missing configuration
 */
export interface ConfigurationError extends BaseError {
  readonly type: 'ConfigurationError';
  /** Configuration key that is invalid/missing */
  readonly configKey?: string;
  /** Configuration section that has issues */
  readonly configSection?: string;
  /** Suggested fix for the configuration issue */
  readonly suggestion?: string;
}

/**
 * System error for infrastructure/system-level failures
 */
export interface SystemError extends BaseError {
  readonly type: 'SystemError';
  /** System component that failed */
  readonly component?: string;
  /** System operation that failed */
  readonly operation?: string;
  /** Exit code (for process-related errors) */
  readonly exitCode?: number;
  /** Signal name (for signal-related errors) */
  readonly signal?: string;
}

/**
 * Network error for network-related failures
 */
export interface NetworkError extends BaseError {
  readonly type: 'NetworkError';
  /** URL that failed */
  readonly url?: string;
  /** HTTP status code (if applicable) */
  readonly statusCode?: number;
  /** Request method */
  readonly method?: string;
  /** Network timeout duration */
  readonly timeout?: number;
  /** Whether this was a timeout error */
  readonly isTimeout: boolean;
}

/**
 * Resource error for resource-related failures (files, databases, etc.)
 */
export interface ResourceError extends BaseError {
  readonly type: 'ResourceError';
  /** Resource identifier (path, ID, name, etc.) */
  readonly resourceId?: string;
  /** Resource type (file, database, API, etc.) */
  readonly resourceType?: string;
  /** Resource operation that failed */
  readonly operation?:|'read|write|delete|create|update|connect';
  /** Whether the resource exists */
  readonly resourceExists?: boolean;
}

/**
 * Permission error for authorization/access control failures
 */
export interface PermissionError extends BaseError {
  readonly type: 'PermissionError';
  /** Required permission that was missing */
  readonly requiredPermission?: string;
  /** User/subject that was denied access */
  readonly subject?: string;
  /** Resource that access was denied to */
  readonly resource?: string;
  /** Action that was attempted */
  readonly action?: string;
}

/**
 * Business logic error for domain-specific rule violations
 */
export interface BusinessLogicError extends BaseError {
  readonly type: 'BusinessLogicError';
  /** Business rule that was violated */
  readonly rule?: string;
  /** Domain context where the error occurred */
  readonly domain?: string;
  /** Current state that caused the error */
  readonly currentState?: string;
  /** Expected state or condition */
  readonly expectedState?: string;
}

/**
 * Timeout error for operations that exceed time limits
 */
export interface TimeoutError extends BaseError {
  readonly type: 'TimeoutError';
  /** Timeout duration in milliseconds */
  readonly timeoutMs: number;
  /** Operation that timed out */
  readonly operation?: string;
  /** Elapsed time before timeout */
  readonly elapsedMs?: number;
}

/**
 * Rate limit error for too many requests
 */
export interface RateLimitError extends BaseError {
  readonly type: 'RateLimitError';
  /** Rate limit that was exceeded */
  readonly limit: number;
  /** Time window for the rate limit */
  readonly windowMs: number;
  /** When the rate limit resets */
  readonly resetAt?: Timestamp;
  /** Retry after duration in milliseconds */
  readonly retryAfterMs?: number;
}

// =============================================================================
// ERROR SEVERITY AND CLASSIFICATION
// =============================================================================

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low', // Minor issues, system can continue normally
  MEDIUM = 'medium', // Notable issues, some degradation possible
  HIGH = 'high', // Serious issues, significant impact
  CRITICAL = 'critical', // System-threatening issues, immediate attention required
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation', // Input/data validation errors
  CONFIGURATION = 'configuration', // Configuration-related errors
  SYSTEM = 'system', // System/infrastructure errors
  NETWORK = 'network', // Network/connectivity errors
  RESOURCE = 'resource', // Resource access errors
  PERMISSION = 'permission', // Authorization/permission errors
  BUSINESS = 'business', // Business logic errors
  TIMEOUT = 'timeout', // Timeout-related errors
  RATELIMIT = 'ratelimit', // Rate limiting errors
  UNKNOWN = 'unknown', // Unclassified errors
}

/**
 * Error metadata for tracking and analysis
 */
export interface ErrorMetadata {
  /** Error severity level */
  severity: ErrorSeverity;
  /** Error category for classification */
  category: ErrorCategory;
  /** Whether this error affects user experience */
  affectsUser: boolean;
  /** Whether this error affects system stability */
  affectsSystem: boolean;
  /** Tags for additional classification */
  tags?: string[];
  /** Related error IDs for correlation */
  relatedErrors?: UUID[];
}

// =============================================================================
// RESULT PATTERN TYPES - Alternative to throwing exceptions
// =============================================================================

/**
 * Result type for operations that can succeed or fail
 * Alternative to exception throwing for expected failures
 */
export type Result<T, E extends BaseError = BaseError> =|{ success: true; data: T; error?: never }|{ success: false; data?: never; error: E };

/**
 * Success result helper type
 */
export type SuccessResult<T> = {
  success: true;
  data: T;
  error?: never;
};

/**
 * Error result helper type
 */
export type ErrorResult<E extends BaseError> = {
  success: false;
  data?: never;
  error: E;
};

/**
 * Async result type for promise-based operations
 */
export type AsyncResult<T, E extends BaseError = BaseError> = Promise<
  Result<T, E>
>;

// =============================================================================
// ERROR HANDLER TYPES - Error processing and handling
// =============================================================================

/**
 * Error handler function signature
 */
export type ErrorHandler<E extends BaseError = BaseError> = (
  error: E
) => void|Promise<void>;

/**
 * Error recovery function signature
 */
export type ErrorRecovery<T, E extends BaseError = BaseError> = (
  error: E
) => T|Promise<T>;

/**
 * Error transformation function signature
 */
export type ErrorTransform<TIn extends BaseError, TOut extends BaseError> = (
  error: TIn
) => TOut;

/**
 * Error filter function signature
 */
export type ErrorFilter<E extends BaseError = BaseError> = (
  error: E
) => boolean;

/**
 * Comprehensive error handling configuration
 */
export interface ErrorHandlingConfig {
  /** Default error handler */
  defaultHandler?: ErrorHandler;
  /** Error handlers by error type */
  handlers?: Record<string, ErrorHandler>;
  /** Whether to log errors automatically */
  autoLog: boolean;
  /** Whether to include stack traces in logs */
  includeStackTrace: boolean;
  /** Maximum error context size for logging */
  maxContextSize?: number;
  /** Error aggregation settings */
  aggregation?: {
    enabled: boolean;
    windowMs: number;
    maxErrors: number;
  };
}

// =============================================================================
// UTILITY FUNCTIONS - Error creation and manipulation
// =============================================================================

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  options?: {
    field?: string;
    rule?: string;
    expected?: unknown;
    actual?: unknown;
    violations?: ValidationViolation[];
    context?: Record<string, unknown>;
    cause?: Error;
  }
): ValidationError {
  return {
    type:'ValidationError',
    name: 'ValidationError',
    code: 'VALIDATION_FAILED',
    message,
    timestamp: Date.now() as Timestamp,
    errorId: crypto.randomUUID() as UUID,
    retryable: false,
    logLevel: LogLevel.WARNING,
    field: options?.field,
    rule: options?.rule,
    expected: options?.expected,
    actual: options?.actual,
    violations: options?.violations,
    context: options?.context,
    cause: options?.cause,
  };
}

/**
 * Create a system error
 */
export function createSystemError(
  message: string,
  options?: {
    component?: string;
    operation?: string;
    exitCode?: number;
    signal?: string;
    context?: Record<string, unknown>;
    cause?: Error;
  }
): SystemError {
  return {
    type: 'SystemError',
    name: 'SystemError',
    code: 'SYSTEM_ERROR',
    message,
    timestamp: Date.now() as Timestamp,
    errorId: crypto.randomUUID() as UUID,
    retryable: true,
    logLevel: LogLevel.ERROR,
    component: options?.component,
    operation: options?.operation,
    exitCode: options?.exitCode,
    signal: options?.signal,
    context: options?.context,
    cause: options?.cause,
  };
}

/**
 * Create a network error
 */
export function createNetworkError(
  message: string,
  options?: {
    url?: string;
    statusCode?: number;
    method?: string;
    timeout?: number;
    isTimeout?: boolean;
    context?: Record<string, unknown>;
    cause?: Error;
  }
): NetworkError {
  return {
    type: 'NetworkError',
    name: 'NetworkError',
    code: 'NETWORK_ERROR',
    message,
    timestamp: Date.now() as Timestamp,
    errorId: crypto.randomUUID() as UUID,
    retryable: !options?.isTimeout,
    logLevel: LogLevel.ERROR,
    url: options?.url,
    statusCode: options?.statusCode,
    method: options?.method,
    timeout: options?.timeout,
    isTimeout: options?.isTimeout ?? false,
    context: options?.context,
    cause: options?.cause,
  };
}

/**
 * Create a resource error
 */
export function createResourceError(
  message: string,
  options?: {
    resourceId?: string;
    resourceType?: string;
    operation?: 'read|write|delete|create|update|connect';
    resourceExists?: boolean;
    context?: Record<string, unknown>;
    cause?: Error;
  }
): ResourceError {
  return {
    type: 'ResourceError',
    name: 'ResourceError',
    code: 'RESOURCE_ERROR',
    message,
    timestamp: Date.now() as Timestamp,
    errorId: crypto.randomUUID() as UUID,
    retryable: true,
    logLevel: LogLevel.ERROR,
    resourceId: options?.resourceId,
    resourceType: options?.resourceType,
    operation: options?.operation,
    resourceExists: options?.resourceExists,
    context: options?.context,
    cause: options?.cause,
  };
}

/**
 * Create a successful result
 */
export function createSuccess<T>(data: T): SuccessResult<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function createError<E extends BaseError>(error: E): ErrorResult<E> {
  return { success: false, error };
}

/**
 * Check if result is successful (type guard)
 */
export function isSuccess<T, E extends BaseError>(
  result: Result<T, E>
): result is SuccessResult<T> {
  return result.success === true;
}

/**
 * Check if result is an error (type guard)
 */
export function isError<T, E extends BaseError>(
  result: Result<T, E>
): result is ErrorResult<E> {
  return result.success === false;
}

// =============================================================================
// ERROR TYPE GUARDS - Runtime error type checking
// =============================================================================

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'ValidationError'
  );
}

/**
 * Check if error is a system error
 */
export function isSystemError(error: unknown): error is SystemError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'SystemError'
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'NetworkError'
  );
}

/**
 * Check if error is a resource error
 */
export function isResourceError(error: unknown): error is ResourceError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'ResourceError'
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: BaseError): boolean {
  return error.retryable === true;
}

/**
 * Check if error is a base error (has required BaseError fields)
 */
export function isBaseError(error: unknown): error is BaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error &&
    'errorId' in error &&
    'retryable' in error &&
    'logLevel' in error
  );
}
