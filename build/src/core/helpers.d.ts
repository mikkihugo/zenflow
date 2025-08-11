/**
 * Utility helper functions.
 */
/**
 * @file Helpers implementation.
 */
/**
 * Generate a unique ID.
 *
 * @example
 */
export declare function generateId(): string;
/**
 * Sleep for specified milliseconds.
 *
 * @param ms
 * @example
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry an async function with exponential backoff.
 *
 * @param fn
 * @param maxRetries
 * @param baseDelay
 * @example
 */
export declare function retry<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
/**
 * Deep clone an object.
 *
 * @param obj
 * @example
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Check if value is empty.
 *
 * @param value
 * @example
 */
export declare function isEmpty(value: any): boolean;
//# sourceMappingURL=helpers.d.ts.map