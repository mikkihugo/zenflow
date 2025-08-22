/**
 * @fileoverview Foundation Type Guards - Local Implementation
 *
 * Basic type guard functions for the foundation package.
 * No external dependencies to avoid circular imports.
 */

// Basic type guards - local implementations
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isDefined<T>(value: T'' | ''undefined'' | ''null): value is T {
  return value !== undefined && value !== null;
}

export function isNullOrUndefined(value: unknown): value is null'' | ''undefined {
  return value === null'' | '''' | ''value === undefined;
}

// Property checking
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function hasStringProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, string> {
  return hasProperty(obj, key) && isString(obj[key]);
}

export function hasNumberProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, number> {
  return hasProperty(obj, key) && isNumber(obj[key]);
}

// Error utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return String(error);
}

export function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(getErrorMessage(error));
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isErrorWithContext(
  value: unknown
): value is Error & { context?: unknown } {
  return isError(value) && hasProperty(value,'context');
}

// Safe JSON operations
export function safeJsonParse<T = unknown>(json: string): T'' | ''null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function safeJsonStringify(value: unknown): string'' | ''null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

// Type conversion utilities
export function toString(value: unknown): string {
  return String(value);
}

export function toNumber(value: unknown): number {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function toBoolean(value: unknown): boolean {
  return Boolean(value);
}

// Assertion utilities
export function assertDefined<T>(
  value: T'' | ''undefined'' | ''null,
  message ='Value must be defined'
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(message);
  }
}

export function assertString(
  value: unknown,
  message = 'Value must be a string'
): asserts value is string {
  if (!isString(value)) {
    throw new Error(message);
  }
}

export function assertNumber(
  value: unknown,
  message = 'Value must be a number'
): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message);
  }
}

export function assertObject(
  value: unknown,
  message = 'Value must be an object'
): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(message);
  }
}

export function assertArray(
  value: unknown,
  message = 'Value must be an array'
): asserts value is unknown[] {
  if (!isArray(value)) {
    throw new Error(message);
  }
}
