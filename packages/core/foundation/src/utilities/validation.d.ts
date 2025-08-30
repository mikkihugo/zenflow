/**
 * @fileoverview Validation Utilities
 *
 * Consolidated validation utilities - schema validation, type guards, and input validation.
 * Combines Zod schemas with custom type guards for comprehensive validation.
 *
 * @example Schema Validation
 * ```typescript`
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
 * ```
 *
 * @example Type Guards
 * ```typescript`
 * import { isEmail, isURL, isPrimitive} from '@claude-zen/foundation/utilities/validation';
 *
 * if (isEmail(userInput)) {
 *   // userInput is now typed as Email
 *}
 * ```
 */
import { ZodError, type ZodSchema, type ZodType, z as zodInstance } from 'zod';
import { type Result } from '../error-handling/index.js';
import type { Email, ISODateString, JsonPrimitive, Timestamp, UUID } from '../types/primitives';
export { zodInstance as z, ZodError };
export type { ZodSchema, ZodType };
/**
 * Validate input data against a Zod schema with Result pattern.
 * Returns Result<T, ZodError> for type-safe error handling.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Result with validated data or error
 * @example
 * ```typescript`
 * const UserSchema = z.object({ name:z.string(), age:z.number()});
 * const result = validateInput(UserSchema, { name:"John", age:30});
 *
 * if (result.isOk()) {
 *   logger.info(result.value.name); // Type-safe access
 *} else {
 *   logger.error(result.error.issues); // ZodError details
 *}
 * ```
 */
export declare function validateInput<T>(schema: ZodSchema<T>, data: unknown): Result<T, ZodError>;
/**
 * Create a reusable validator function from a Zod schema.
 * Returns a function that validates data and returns Result.
 *
 * @param schema - Zod schema to create validator for
 * @returns Validator function
 * @example
 * ```typescript`
 * const validateUser = createValidator(UserSchema);
 *
 * const result1 = validateUser(userData1);
 * const result2 = validateUser(userData2);
 * ```
 */
export declare function createValidator<T>(schema: ZodSchema<T>): (data: unknown) => Result<T, ZodError>;
/**
 * Check if value is a valid UUID format.
 * Supports UUID v1, v3, v4, and v5.
 *
 * @param value - Value to check
 * @returns True if valid UUID
 * @example
 * ```typescript`
 * if (isUUID(userInput)) {
 *   // userInput is now typed as UUID
 *   processUUID(userInput);
 *}
 * ```
 */
export declare function isUUID(value: unknown): value is UUID;
/**
 * Check if value is a valid email format.
 * Basic email format validation.
 *
 * @param value - Value to check
 * @returns True if valid email format
 * @example
 * ```typescript`
 * if (isEmail(userInput)) {
 *   // userInput is now typed as Email
 *   sendEmail(userInput);
 *}
 * ```
 */
export declare function isEmail(value: unknown): value is Email;
/**
 * Check if value is a valid timestamp.
 * Must be positive number representing milliseconds since epoch.
 *
 * @param value - Value to check
 * @returns True if valid timestamp
 * @example
 * ```typescript`
 * if (isTimestamp(userInput)) {
 *   const date = new Date(userInput);
 *}
 * ```
 */
export declare function isTimestamp(value: unknown): value is Timestamp;
/**
 * Check if value is a valid ISO date string.
 * Validates format and parsability.
 *
 * @param value - Value to check
 * @returns True if valid ISO date string
 * @example
 * ```typescript`
 * if (isISODateString(userInput)) {
 *   const date = new Date(userInput);
 *}
 * ```
 */
export declare function isISODateString(value: unknown): value is ISODateString;
/**
 * Check if value is a primitive type.
 * Includes string, number, boolean, null, undefined.
 *
 * @param value - Value to check
 * @returns True if primitive type
 * @example
 * ```typescript`
 * if (isPrimitive(value)) {
 *   // Safe to serialize/clone
 *}
 * ```
 */
export declare function isPrimitive(value: unknown): value is JsonPrimitive;
/**
 * Check if array is non-empty.
 * Type guard for arrays with at least one element.
 *
 * @param arr - Array to check
 * @returns True if array has elements
 * @example
 * ```typescript`
 * if (isNonEmptyArray(items)) {
 *   // items[0] is safe to access
 *   const firstItem = items[0];
 *}
 * ```
 */
export declare function isNonEmptyArray<T>(arr: T[]): arr is [T, ...T[]];
/**
 * Check if value is a valid URL.
 * Uses URL constructor for validation.
 *
 * @param value - Value to check
 * @returns True if valid URL
 * @example
 * ```typescript`
 * if (isURL(userInput)) {
 *   fetch(userInput);
 *}
 * ```
 */
export declare function isURL(value: unknown): value is string;
/**
 * Check if value is valid JSON.
 * Attempts to parse and returns boolean.
 *
 * @param value - String to check
 * @returns True if valid JSON
 * @example
 * ```typescript`
 * if (isValidJSON(userInput)) {
 *   const parsed = JSON.parse(userInput);
 *}
 * ```
 */
export declare function isValidJSON(value: string): boolean;
/**
 * Pre-built Zod schema for UUID validation.
 * @example
 * ```typescript`
 * const result = validateInput(UUIDSchema, userInput);
 * ```
 */
export declare const uuidSchema: zodInstance.ZodString;
export declare const emailSchema: zodInstance.ZodString;
export declare const urlSchema: zodInstance.ZodString;
export declare const nonEmptyStringSchema: zodInstance.ZodString;
export declare const positiveNumberSchema: zodInstance.ZodNumber;
/**
 * Check if validation result contains specific error code.
 * Useful for handling specific validation failures.
 *
 * @param result - Validation result to check
 * @param code - Zod error code to look for
 * @returns True if result contains the error code
 * @example
 * ```typescript`
 * const result = validateInput(schema, data);
 * if (hasValidationError(result, 'too_small')) {
 *   logger.info('Value too small');
 *}
 * ```
 */
export declare function hasValidationError(result: Result<unknown, ZodError>, code: string): boolean;
/**
 * Extract all validation error messages from Result.
 * Returns array of human-readable error messages.
 *
 * @param result - Validation result
 * @returns Array of error messages
 * @example
 * ```typescript`
 * const result = validateInput(schema, data);
 * const errors = getValidationErrors(result);
 * errors.forEach(error => logger.info(error));
 * ```
 */
export declare function getValidationErrors(result: Result<unknown, ZodError>): string[];
//# sourceMappingURL=validation.d.ts.map