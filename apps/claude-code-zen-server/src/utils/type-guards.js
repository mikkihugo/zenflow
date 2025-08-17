/**
 * @fileoverview Comprehensive Type Guards Utility Module for Claude Code Zen
 *
 * Provides a complete set of type guard functions for safe union type property access
 * throughout the claude-code-zen codebase. This module addresses TypeScript strict mode
 * compilation issues with union type handling and provides runtime type safety.
 *
 * Key Features:
 * - Database result type guards with discriminant unions
 * - Memory store operation result guards
 * - Neural network training/inference result guards
 * - API response type guards with metadata support
 * - WASM operation result type guards
 * - Coordination system result type guards
 * - Generic Result<T, E> pattern implementation
 * - Utility functions for safe property access
 * - Specialized type guards for system components
 *
 * Type Safety Benefits:
 * - Eliminates unsafe union type access
 * - Provides compile-time type narrowing
 * - Runtime type validation with proper error handling
 * - Consistent error message extraction across result types
 * - Safe property access patterns
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 1.0.0-alpha.43
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html} TypeScript Type Narrowing
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates} Type Predicates
 *
 * @requires typescript >= 4.0 - For discriminant union support
 * @requires @types/node - For Node.js type definitions
 *
 * @example
 * ```typescript
 * // Database result handling
 * const dbResult = await queryDatabase();
 * if (isQuerySuccess(dbResult)) {
 *   console.log('Data:', dbResult.data); // Type-safe access
 * } else if (isQueryError(dbResult)) {
 *   console.error('Error:', dbResult.error.message); // Type-safe error handling
 * }
 *
 * // Memory store result handling
 * const memResult = await memoryStore.get('key');
 * if (isMemorySuccess(memResult)) {
 *   processData(memResult.data); // Guaranteed to exist
 * }
 *
 * // Neural network result handling
 * const neuralResult = await trainNetwork();
 * if (isTrainingResult(neuralResult)) {
 *   console.log('Training completed with error:', neuralResult.finalError);
 * }
 * ```
 */
/**
 * Type guard for successful database query results.
 *
 * Narrows a DatabaseResult union type to QuerySuccess<T> by checking
 * the discriminant property and ensuring data property exists.
 *
 * @template T - The expected data type for successful queries
 * @param {DatabaseResult<T>} result - The database result to check
 * @returns {result is QuerySuccess<T>} True if result is a successful query
 *
 * @example
 * ```typescript
 * const result = await getUserById('123');
 * if (isQuerySuccess(result)) {
 *   // TypeScript knows result.data exists and is of type T
 *   console.log('User found:', result.data.name);
 *   console.log('Query took:', result.executionTime, 'ms');
 *   console.log('Rows returned:', result.rowCount);
 * }
 * ```
 *
 * @see {@link QuerySuccess} Success result interface
 * @see {@link DatabaseResult} Union type definition
 */
export function isQuerySuccess(result) {
    return result?.success === true && 'data' in result;
}
/**
 * Type guard for database query errors.
 *
 * @param result
 * @example
 */
export function isQueryError(result) {
    return result?.success === false && 'error' in result;
}
/**
 * Type guard for successful memory operations.
 *
 * @param result
 * @example
 */
export function isMemorySuccess(result) {
    return result?.found === true && 'data' in result;
}
/**
 * Type guard for memory not found results.
 *
 * @param result
 * @example
 */
export function isMemoryNotFound(result) {
    return result?.found === false && 'reason' in result;
}
/**
 * Type guard for memory operation errors.
 *
 * @param result
 * @example
 */
export function isMemoryError(result) {
    return result?.found === false && 'error' in result;
}
/**
 * Type guard for neural training results.
 *
 * @param result
 * @example
 */
export function isTrainingResult(result) {
    return result?.type === 'training' && result?.success === true;
}
/**
 * Type guard for neural inference results.
 *
 * @param result
 * @example
 */
export function isInferenceResult(result) {
    return result?.type === 'inference' && result?.success === true;
}
/**
 * Type guard for neural operation errors.
 *
 * @param result
 * @example
 */
export function isNeuralError(result) {
    return result?.type === 'error' && result?.success === false;
}
/**
 * Type guard for successful API responses.
 *
 * @param result
 * @example
 */
export function isAPISuccess(result) {
    return result?.success === true && 'data' in result;
}
/**
 * Type guard for API error responses.
 *
 * @param result
 * @example
 */
export function isAPIError(result) {
    return result?.success === false && 'error' in result;
}
/**
 * Type guard for successful WASM operations.
 *
 * @param result
 * @example
 */
export function isWasmSuccess(result) {
    return result?.wasmSuccess === true && 'result' in result;
}
/**
 * Type guard for WASM operation errors.
 *
 * @param result
 * @example
 */
export function isWasmError(result) {
    return result?.wasmSuccess === false && 'error' in result;
}
/**
 * Type guard for successful coordination operations.
 *
 * @param result
 * @example
 */
export function isCoordinationSuccess(result) {
    return result?.coordinated === true && 'result' in result;
}
/**
 * Type guard for coordination operation errors.
 *
 * @param result
 * @example
 */
export function isCoordinationError(result) {
    return result?.coordinated === false && 'error' in result;
}
/**
 * Type guard for successful results.
 *
 * @param result
 * @example
 */
export function isSuccess(result) {
    return result?.ok === true && 'value' in result;
}
/**
 * Type guard for failed results.
 *
 * @param result
 * @example
 */
export function isFailure(result) {
    return result?.ok === false && 'error' in result;
}
// ============================================
// Utility Functions for Safe Property Access
// ============================================
/**
 * Safely extract data from a database result union type.
 *
 * Uses type guards internally to safely extract data from successful
 * database operations, returning null for error cases.
 *
 * @template T - The expected data type
 * @param {DatabaseResult<T>} result - The database result to extract data from
 * @returns {T | null} The extracted data or null if the operation failed
 *
 * @example
 * ```typescript
 * const dbResult = await getUserById('123');
 * const userData = extractData(dbResult);
 *
 * if (userData) {
 *   // userData is guaranteed to be of type T
 *   console.log('User:', userData.name);
 * } else {
 *   // Handle the error case
 *   const errorMsg = extractErrorMessage(dbResult);
 *   console.error('Failed to get user:', errorMsg);
 * }
 * ```
 *
 * @see {@link isQuerySuccess} Type guard used internally
 * @see {@link extractErrorMessage} For error message extraction
 */
export function extractData(result) {
    if (isQuerySuccess(result)) {
        return result?.data;
    }
    return null;
}
/**
 * Safely extract error message from any result type.
 *
 * @param result
 * @example
 */
export function extractErrorMessage(result) {
    if ('success' in result && !result?.success && 'error' in result) {
        return result?.error?.message;
    }
    if ('found' in result && !result?.found && 'error' in result) {
        return result?.error?.message;
    }
    if ('wasmSuccess' in result && !result?.wasmSuccess && 'error' in result) {
        return result?.error?.message;
    }
    if ('coordinated' in result && !result?.coordinated && 'error' in result) {
        return result?.error?.message;
    }
    if ('ok' in result && !result?.ok && 'error' in result) {
        return result?.error instanceof Error
            ? result?.error?.message
            : String(result?.error);
    }
    return null;
}
/**
 * Type predicate to check if an object has a specific property.
 *
 * @param obj
 * @param prop
 * @example
 */
export function hasProperty(obj, prop) {
    return (obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj);
}
/**
 * Safe property access with comprehensive type checking.
 *
 * Provides null-safe property access with TypeScript type preservation.
 * Handles null, undefined, and non-object values gracefully.
 *
 * @template T - The object type to access properties from
 * @template K - The property key type (must be keyof T)
 * @param {T | null | undefined} obj - The object to access properties from
 * @param {K} prop - The property key to access
 * @returns {T[K] | undefined} The property value or undefined if access is unsafe
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email?: string;
 * }
 *
 * const user: User | null = await getUser();
 * const userName = safePropertyAccess(user, 'name');
 * const userEmail = safePropertyAccess(user, 'email');
 *
 * if (userName) {
 *   console.log('User name:', userName); // Type is string
 * }
 *
 * if (userEmail) {
 *   console.log('User email:', userEmail); // Type is string
 * }
 * ```
 *
 * @safety
 * - Handles null and undefined objects gracefully
 * - Validates object type before property access
 * - Preserves TypeScript type information
 * - Never throws runtime errors
 *
 * @see {@link hasProperty} For existence checking without value extraction
 */
export function safePropertyAccess(obj, prop) {
    if (obj !== null &&
        obj !== undefined &&
        typeof obj === 'object' &&
        prop in obj) {
        return obj[prop];
    }
    return undefined;
}
// ============================================
// Additional Type Guards for System Safety
// ============================================
/**
 * Type guard to check if an object is a valid neural network config.
 *
 * @param obj
 * @example
 */
export function isNeuralNetworkConfig(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        Array.isArray(obj['layers']) &&
        obj['layers']?.['every']((layer) => typeof layer === 'number') &&
        Array.isArray(obj['activationFunctions']) &&
        obj['activationFunctions']?.['every']((fn) => typeof fn === 'string') &&
        typeof obj['learningRate'] === 'number');
}
/**
 * Type guard to check if a value is a valid activation function.
 *
 * @param value
 * @example
 */
export function isActivationFunction(value) {
    const validFunctions = [
        'sigmoid',
        'tanh',
        'relu',
        'leaky_relu',
        'elu',
        'swish',
        'gelu',
        'softmax',
    ];
    return typeof value === 'string' && validFunctions.includes(value);
}
/**
 * Type guard for checking array of objects with required properties.
 *
 * @param arr
 * @param requiredProps
 * @example
 */
export function isObjectArrayWithProps(arr, requiredProps) {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.every((item) => {
        if (typeof item !== 'object' || item === null) {
            return false;
        }
        return requiredProps.every((prop) => prop in item);
    });
}
/**
 * Type guard for checking if value is a non-empty string.
 *
 * @param value
 * @example
 */
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
/**
 * Type guard for checking if value is a valid number (not NaN or Infinity).
 *
 * @param value.
 * @param value
 * @example
 */
export function isValidNumber(value) {
    return (typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value));
}
/**
 * Type guard for checking if value is a valid positive number.
 *
 * @param value
 * @example
 */
export function isPositiveNumber(value) {
    return isValidNumber(value) && value > 0;
}
//# sourceMappingURL=type-guards.js.map