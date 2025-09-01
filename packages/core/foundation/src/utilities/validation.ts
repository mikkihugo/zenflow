/**
 * @fileoverview Validation Utilities
 *
 * Consolidated validation utilities - schema validation, type guards, and input validation.
 * Combines Zod schemas with custom type guards for comprehensive validation.
 *
 * @example Schema Validation
 * '''typescript'
 * import { z, validateInput, createValidator} from '@claude-zen/foundation/utilities/validation';
 *
 * const UserSchema = z.object({
 *   name:z.string().min(1),
 *   email:z.string().email()
 *});
 *
 * const result = validateInput(UserSchema, userData);
 * if (result.isOk()) {
 *   logger.info('Valid: ', result.value);
' *}
 * '
 *
 * @example Type Guards
 * '''typescript'
 * import { isEmail, isURL, isPrimitive} from '@claude-zen/foundation/utilities/validation';
 *
 * if (isEmail(userInput)) {
 *   // userInput is now typed as Email
 *}
 * '
 */

// Foundation re-exports zod - use internal import to avoid circular dependency
import { ZodError, type ZodSchema, type ZodType, z as zodInstance } from 'zod';
import { err, ok, type Result } from '../error-handling/index.js';
import type {
  Email,
  ISODateString,
  JsonPrimitive,
  Timestamp,
  UUID,
} from '../types/primitives';

// =============================================================================
// ZOD SCHEMA UTILITIES - Re-export for convenience
// =============================================================================

export { zodInstance as z, ZodError };
export type { ZodSchema, ZodType };

// =============================================================================
// INPUT VALIDATION WITH RESULT PATTERN
// =============================================================================

/**
 * Validate input data against a Zod schema with Result pattern.
 * Returns Result<T, ZodError> for type-safe error handling.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Result with validated data or error
 * @example
 * '''typescript'
 * const UserSchema = z.object({ name:z.string(), age:z.number()});
 * const result = validateInput(UserSchema, { name:"John", age:30});
 *
 * if (result.isOk()) {
 *   logger.info(result.value.name); // Type-safe access
 *} else {
 *   logger.error(result.error.issues); // ZodError details
 *}
 * '
 */
export function validateInput<T>(
  schema: ZodSchema<T>,
  data: unknown
): Result<T, ZodError> {
  try {
    const validated = schema.parse(data);
    return ok(validated);
  } catch (error) {
    if (error instanceof ZodError) {
      return err(error);
    }
    return err(
      new ZodError([
        {
          code: 'custom',
          message: 'Unknown validation error',
          path: [],
        },
      ])
    );
  }
}

/**
 * Create a reusable validator function from a Zod schema.
 * Returns a function that validates data and returns Result.
 *
 * @param schema - Zod schema to create validator for
 * @returns Validator function
 * @example
 * '''typescript'
 * const validateUser = createValidator(UserSchema);
 *
 * const result1 = validateUser(userData1);
 * const result2 = validateUser(userData2);
 * '
 */
export function createValidator<T>(
  schema: ZodSchema<T>
): (data: unknown) => Result<T, ZodError> {
  return (data: unknown) => validateInput(schema, data);
}

// =============================================================================
// TYPE GUARDS - Branded types and primitives
// =============================================================================

/**
 * Check if value is a valid UUID format.
 * Supports UUID v1, v3, v4, and v5.
 *
 * @param value - Value to check
 * @returns True if valid UUID
 * @example
 * '''typescript'
 * if (isUUID(userInput)) {
 *   // userInput is now typed as UUID
 *   processUUID(userInput);
 *}
 * '
 */
export function isUUID(value: unknown): value is UUID {
  return (
    typeof value === 'string' &&
    /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
      value
    )
  );
}

/**
 * Check if value is a valid email format.
 * Basic email format validation.
 *
 * @param value - Value to check
 * @returns True if valid email format
 * @example
 * '''typescript'
 * if (isEmail(userInput)) {
 *   // userInput is now typed as Email
 *   sendEmail(userInput);
 *}
 * '
 */
export function isEmail(value: unknown): value is Email {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Check if value is a valid timestamp.
 * Must be positive number representing milliseconds since epoch.
 *
 * @param value - Value to check
 * @returns True if valid timestamp
 * @example
 * '''typescript'
 * if (isTimestamp(userInput)) {
 *   const date = new Date(userInput);
 *}
 * '
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'number' && value > 0 && Number.isInteger(value);
}

/**
 * Check if value is a valid ISO date string.
 * Validates format and parsability.
 *
 * @param value - Value to check
 * @returns True if valid ISO date string
 * @example
 * '''typescript'
 * if (isISODateString(userInput)) {
 *   const date = new Date(userInput);
 *}
 * '
 */
export function isISODateString(value: unknown): value is ISODateString {
  return (
    typeof value === 'string' &&
    !Number.isNaN(Date.parse(value)) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)
  );
}

/**
 * Check if value is a primitive type.
 * Includes string, number, boolean, null, undefined.
 *
 * @param value - Value to check
 * @returns True if primitive type
 * @example
 * '''typescript'
 * if (isPrimitive(value)) {
 *   // Safe to serialize/clone
 *}
 * '
 */
export function isPrimitive(value: unknown): value is JsonPrimitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/**
 * Check if array is non-empty.
 * Type guard for arrays with at least one element.
 *
 * @param arr - Array to check
 * @returns True if array has elements
 * @example
 * '''typescript'
 * if (isNonEmptyArray(items)) {
 *   // items[0] is safe to access
 *   const firstItem = items[0];
 *}
 * '
 */
export function isNonEmptyArray<T>(arr: T[]): arr is [T, ...T[]] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Check if value is a valid URL.
 * Uses URL constructor for validation.
 *
 * @param value - Value to check
 * @returns True if valid URL
 * @example
 * '''typescript'
 * if (isURL(userInput)) {
 *   fetch(userInput);
 *}
 * '
 */
export function isURL(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    if (typeof globalThis.URL !== 'undefined') {
      new globalThis.URL(value);
      return true;
    }
    // Basic URL pattern fallback when URL constructor not available
    return /^https?:\/\/.+/.test(value);
  } catch {
    return false;
  }
}

/**
 * Check if value is valid JSON.
 * Attempts to parse and returns boolean.
 *
 * @param value - String to check
 * @returns True if valid JSON
 * @example
 * '''typescript'
 * if (isValidJSON(userInput)) {
 *   const parsed = JSON.parse(userInput);
 *}
 * '
 */
export function isValidJSON(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// COMMON VALIDATION SCHEMAS - Pre-built for convenience
// =============================================================================

/**
 * Pre-built Zod schema for UUID validation.
 * @example
 * '''typescript'
 * const result = validateInput(UUIDSchema, userInput);
 * '
 */
export const uuidSchema = zodInstance.string().uuid();
export const emailSchema = zodInstance.string().email();
export const urlSchema = zodInstance.string().url();
export const nonEmptyStringSchema = zodInstance.string().min(1);
export const positiveNumberSchema = zodInstance.number().positive();

// Legacy exports removed - use camelCase versions instead
// export const UUIDSchema = uuidSchema;
// export const EmailSchema = emailSchema;
// export const URLSchema = urlSchema;
// export const NonEmptyStringSchema = nonEmptyStringSchema;
// export const PositiveNumberSchema = positiveNumberSchema;

// =============================================================================
// VALIDATION RESULT HELPERS
// =============================================================================

/**
 * Check if validation result contains specific error code.
 * Useful for handling specific validation failures.
 *
 * @param result - Validation result to check
 * @param code - Zod error code to look for
 * @returns True if result contains the error code
 * @example
 * '''typescript'
 * const result = validateInput(schema, data);
 * if (hasValidationError(result, 'too_small')) {
 *   logger.info('Value too small');
 *}
 * '
 */
export function hasValidationError(
  result: Result<unknown, ZodError>,
  code: string
): boolean {
  if (result.isOk()) return false;
  return result.error.issues.some((issue) => issue.code === code);
}

/**
 * Extract all validation error messages from Result.
 * Returns array of human-readable error messages.
 *
 * @param result - Validation result
 * @returns Array of error messages
 * @example
 * '''typescript`
 * const result = validateInput(schema, data);
 * const errors = getValidationErrors(result);
 * errors.forEach(error => logger.info(error));
 * `
 */
export function getValidationErrors(
  result: Result<unknown, ZodError>
): string[] {
  if (result.isOk()) return [];
  return result.error.issues.map((issue) => issue['message']);
}
