/**
 * Type Guards and Utility Functions.
 *
 * Provides type checking and utility functions for the Claude-Zen system.
 */
/**
 * Extract error message from various error types.
 *
 * @param error
 */
/**
 * @file Type-guards implementation.
 */
export function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return String(error);
}
/**
 * Check if value is a string.
 *
 * @param value
 * @example
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * Check if value is a number.
 *
 * @param value
 * @example
 */
export function isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
}
/**
 * Check if value is a boolean.
 *
 * @param value
 * @example
 */
export function isBoolean(value) {
    return typeof value === 'boolean';
}
/**
 * Check if value is an object (not null).
 *
 * @param value.
 * @param value
 * @example
 */
export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
/**
 * Check if value is an array.
 *
 * @param value
 * @example
 */
export function isArray(value) {
    return Array.isArray(value);
}
/**
 * Check if value is null or undefined.
 *
 * @param value
 * @example
 */
export function isNullOrUndefined(value) {
    return value === null || value === undefined;
}
/**
 * Check if value is defined (not null or undefined).
 *
 * @param value.
 * @param value
 * @example
 */
export function isDefined(value) {
    return value !== null && value !== undefined;
}
/**
 * Assert that a value is defined.
 *
 * @param value
 * @param message
 * @example
 */
export function assertDefined(value, message) {
    if (!isDefined(value)) {
        throw new Error(message || 'Value is null or undefined');
    }
}
/**
 * Check if value has a specific property.
 *
 * @param obj
 * @param prop
 * @example
 */
export function hasProperty(obj, prop) {
    return isObject(obj) && prop in obj;
}
/**
 * Safe JSON parse with error handling.
 *
 * @param json
 * @example
 */
export function safeJsonParse(json) {
    try {
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
/**
 * Safe JSON stringify with error handling.
 *
 * @param value
 * @example
 */
export function safeJsonStringify(value) {
    try {
        return JSON.stringify(value);
    }
    catch {
        return String(value);
    }
}
//# sourceMappingURL=type-guards.js.map