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
import { LogLevel } from "./primitives";
// =============================================================================
// ERROR SEVERITY AND CLASSIFICATION
// =============================================================================
/**
 * Error severity levels
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
/**
 * Error categories for classification
 */
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["CONFIGURATION"] = "configuration";
    ErrorCategory["SYSTEM"] = "system";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["RESOURCE"] = "resource";
    ErrorCategory["PERMISSION"] = "permission";
    ErrorCategory["BUSINESS"] = "business";
    ErrorCategory["TIMEOUT"] = "timeout";
    ErrorCategory["RATELIMIT"] = "ratelimit";
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (ErrorCategory = {}));
// =============================================================================
// UTILITY FUNCTIONS - Error creation and manipulation
// =============================================================================
/**
 * Create a validation error
 */
export function createValidationError(message, options) {
    return {
        type: "ValidationError",
        name: "ValidationError",
        code: "VALIDATION_FAILED",
        message,
        timestamp: Date.now(),
        errorId: (typeof globalThis.crypto !== 'undefined' ? globalThis.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })),
        retryable: false,
        logLevel: LogLevel.WARN,
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
export function createSystemError(message, options) {
    return {
        type: "SystemError",
        name: "SystemError",
        code: "SYSTEM_ERROR",
        message,
        timestamp: Date.now(),
        errorId: (typeof globalThis.crypto !== 'undefined' ? globalThis.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })),
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
export function createNetworkError(message, options) {
    return {
        type: "NetworkError",
        name: "NetworkError",
        code: "NETWORK_ERROR",
        message,
        timestamp: Date.now(),
        errorId: (typeof globalThis.crypto !== 'undefined' ? globalThis.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })),
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
export function createResourceError(message, options) {
    return {
        type: "ResourceError",
        name: "ResourceError",
        code: "RESOURCE_ERROR",
        message,
        timestamp: Date.now(),
        errorId: (typeof globalThis.crypto !== 'undefined' ? globalThis.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })),
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
export function createSuccess(data) {
    return { success: true, data };
}
/**
 * Create an error result
 */
export function createError(error) {
    return { success: false, error };
}
/**
 * Check if result is successful (type guard)
 */
export function isSuccess(result) {
    return result.success === true;
}
/**
 * Check if result is an error (type guard)
 */
export function isError(result) {
    return result.success === false;
}
// =============================================================================
// ERROR TYPE GUARDS - Runtime error type checking
// =============================================================================
/**
 * Check if error is a validation error
 */
export function isValidationError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "ValidationError");
}
/**
 * Check if error is a system error
 */
export function isSystemError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "SystemError");
}
/**
 * Check if error is a network error
 */
export function isNetworkError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "NetworkError");
}
/**
 * Check if error is a resource error
 */
export function isResourceError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "ResourceError");
}
/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    return error.retryable === true;
}
/**
 * Check if error is a base error (has required BaseError fields)
 */
export function isBaseError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "type" in error &&
        "code" in error &&
        "message" in error &&
        "timestamp" in error &&
        "errorId" in error &&
        "retryable" in error &&
        "logLevel" in error);
}
