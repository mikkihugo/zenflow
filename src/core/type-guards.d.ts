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
export declare function getErrorMessage(error: unknown): string;
/**
 * Check if value is a string.
 *
 * @param value
 * @example
 */
export declare function isString(value: unknown): value is string;
/**
 * Check if value is a number.
 *
 * @param value
 * @example
 */
export declare function isNumber(value: unknown): value is number;
/**
 * Check if value is a boolean.
 *
 * @param value
 * @example
 */
export declare function isBoolean(value: unknown): value is boolean;
/**
 * Check if value is an object (not null).
 *
 * @param value.
 * @param value
 * @example
 */
export declare function isObject(value: unknown): value is Record<string, unknown>;
/**
 * Check if value is an array.
 *
 * @param value
 * @example
 */
export declare function isArray(value: unknown): value is unknown[];
/**
 * Check if value is null or undefined.
 *
 * @param value
 * @example
 */
export declare function isNullOrUndefined(value: unknown): value is null | undefined;
/**
 * Check if value is defined (not null or undefined).
 *
 * @param value.
 * @param value
 * @example
 */
export declare function isDefined<T>(value: T | null | undefined): value is T;
/**
 * Assert that a value is defined.
 *
 * @param value
 * @param message
 * @example
 */
export declare function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T;
/**
 * Check if value has a specific property.
 *
 * @param obj
 * @param prop
 * @example
 */
export declare function hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown>;
/**
 * Safe JSON parse with error handling.
 *
 * @param json
 * @example
 */
export declare function safeJsonParse(json: string): unknown;
/**
 * Safe JSON stringify with error handling.
 *
 * @param value
 * @example
 */
export declare function safeJsonStringify(value: unknown): string;
//# sourceMappingURL=type-guards.d.ts.map