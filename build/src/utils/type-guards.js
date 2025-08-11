/**
 * Type Guards Utility Module.
 *
 * Provides type guard functions for safe union type property access.
 * Throughout the claude-code-zen codebase. This addresses TypeScript
 * strict mode compilation issues with union type handling..
 *
 * @file Comprehensive type guards for union type safety.
 */
/**
 * Type guard for successful database query results.
 *
 * @param result
 * @example
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
 * Safely extract data from a result union type.
 *
 * @param result
 * @example
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
        return result?.error instanceof Error ? result?.error?.message : String(result?.error);
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
    return obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj;
}
/**
 * Safe property access with type checking.
 *
 * @param obj
 * @param prop
 * @example
 */
export function safePropertyAccess(obj, prop) {
    if (obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj) {
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
    return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
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
