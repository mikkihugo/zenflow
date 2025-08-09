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
 * @file type-guards implementation
 */


export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return String(error);
}

/**
 * Check if value is a string.
 *
 * @param value
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is a number.
 *
 * @param value
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Check if value is a boolean.
 *
 * @param value
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if value is an object (not null)
 *
 * @param value.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if value is an array.
 *
 * @param value
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Check if value is null or undefined.
 *
 * @param value
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if value is defined (not null or undefined)
 *
 * @param value.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Assert that a value is defined.
 *
 * @param value
 * @param message
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(message || 'Value is null or undefined');
  }
}

/**
 * Check if value has a specific property.
 *
 * @param obj
 * @param prop
 */
export function hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown> {
  return isObject(obj) && prop in obj;
}

/**
 * Safe JSON parse with error handling.
 *
 * @param json
 */
export function safeJsonParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Safe JSON stringify with error handling.
 *
 * @param value
 */
export function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
