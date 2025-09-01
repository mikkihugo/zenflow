/**
 * @fileoverview Foundation Utilities - Battle-tested utilities for common tasks
 *
 * Provides modern, battle-tested utilities for validation, environment handling,
 * process lifecycle, and timeouts using proven NPM packages.
 *
 * @example Input Validation with Zod
 * ```typescript`
 * import { z, validateInput, createValidator } from '@claude-zen/foundation/utilities';
 *
 * const UserSchema = z.object({
 * name:z.string().min(1),
 * email:z.string().email(),
 * age:z.number().min(18)
 * });
 *
 * const result = validateInput(UserSchema, { name:'John', email:' john@example.com', age:25 });
 * if (result.isOk()) {
 * logger.info('Valid user: ', result.value);
' * }
 * ```
 *
 * @example Environment Configuration with Envalid
 * ```typescript`
 * import { env, str, num, bool, createEnvValidator } from '@claude-zen/foundation/utilities';
 *
 * const config = createEnvValidator({
 * NODE_ENV:str({ choices: ['development', 'production', 'test'], default:' development' }),
 * PORT:num({ default: 3000 }),
 * ENABLE_LOGGING:bool({ default: true }),
 * DATABASE_URL:str()
 * });
 *
 * logger.info(`Server starting on port ${config.PORT} in ${config.NODE_ENV} mode`
 * ```
 *
 * @example Process Lifecycle Management
 * ```typescript`
 * import { onExit, withTimeout } from '@claude-zen/foundation/utilities';
 *
 * // Cleanup on process exit
 * onExit(async () => {
 * logger.info('Cleaning up resources...');
 * await database.close();
 * await cache.disconnect();
 * });
 *
 * // Timeout operations
 * const result = await withTimeout(
 * longRunningOperation(),
 * 5000,
 * 'Operation timed out after 5 seconds') * );
 * ```
 *
 * Features:
 * • Zod integration for type-safe validation
 * • Envalid integration for environment configuration
 * • Exit hook management for cleanup
 * • Timeout utilities with proper error handling
 * • Result pattern integration with foundation error handling
 */

// Re-export zod for type-safe validation
// Foundation integration utilities
import {
 bool,
 cleanEnv,
 email,
 host,
 json,
 num,
 port,
 str,
 url,
 type CleanedEnv,
 type Spec,
} from 'envalid';
import { type ZodType, z } from 'zod';
import { err, ok, type Result } from '../../error-handling/index.js';
import { getLogger } from '../../core/logging/logging.service.js';

// Logger for utility functions
const logger = getLogger('CommonUtilities');

// Constants for duplicate string literals
const ERROR_MESSAGES = {
 UNKNOWN_ERROR: 'Unknown error',
} as const;

/**
 * Common environment configuration schema and validation utilities.
 * Provides type-safe environment variable processing.
 */

// Re-export date-fns for date utilities
export * as dateFns from 'date-fns';
export {
 addDays,
 differenceInDays,
 format,
 formatISO,
 parseISO,
 subDays,
} from 'date-fns';
export type { CleanedEnv, Spec };
// Re-export envalid for environment validation
export { bool, email, host, json, num, port, str, url };

// Re-export exit-hook for process lifecycle
export { default as onExit } from 'exit-hook';
// Re-export lodash for utility functions
export { default as _, default as lodash } from 'lodash';

// Re-export nanoid for ID generation
export { customAlphabet, nanoid } from 'nanoid';
export type { ZodError, ZodSchema, ZodType } from 'zod';
export { z } from 'zod';

// Use cockatiel timeout policies:import { timeout, TimeoutStrategy } from '@claude-zen/foundation')const logger = getLogger("foundation-utilities");

/**
 * Validates input data using a Zod schema with type-safe Result pattern.
 * Returns detailed validation errors on failure.
 *
 * @template T - The expected type after validation
 * @param schema - Zod schema to validate against
 * @param input - Input data to validate
 * @returns Result containing validated data or validation error
 *
 * @example
 * ```typescript`
 * const UserSchema = z.object({
 * name:z.string().min(1),
 * email:z.string().email()
 * });
 *
 * const result = validateInput(UserSchema, userData);
 * if (result.isOk()) {
 * logger.info('Valid user: ', result.value);
' * } else {
 * logger.error('Validation error:', result.error.message);
 * }
 * ```
 */
export function validateInput<T>(
 schema: z.ZodSchema<T>,
 input: unknown
): Result<T, Error> {
 try {
 const validated = schema.parse(input);
 return ok(validated);
 } catch (error) {
 if (error instanceof z.ZodError) {
 const message = `Validation failed: ${error.issues.map((e: { path: (string | number)[]; message: string }) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
 return err(new Error(message));
 }
 return err(
 error instanceof Error ? error : new Error('Unknown validation error')
 );
 }
}

/**
 * Creates a reusable validator function from a Zod schema.
 * Useful for creating validation functions that can be passed around or reused.
 *
 * @template T - The expected type after validation
 * @param schema - Zod schema to create validator from
 * @returns Function that validates input using the provided schema
 *
 * @example
 * ```typescript`
 * const validateUser = createValidator(z.object({
 * name:z.string().min(1),
 * email:z.string().email()
 * }));
 *
 * // Reuse validator multiple times
 * const result1 = validateUser(userData1);
 * const result2 = validateUser(userData2);
 * ```
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
 return (input: unknown): Result<T, Error> => validateInput(schema, input);
}

/**
 * Validates and cleans environment variables using Envalid specification.
 * Provides type-safe access to environment variables with defaults and validation.
 *
 * @template T - Record type of environment variable specifications
 * @param specs - Envalid specification object defining expected environment variables
 * @returns Cleaned and validated environment configuration
 * @throws {Error} When environment validation fails
 *
 * @example
 * ```typescript`
 * const env = createEnvValidator({
 * NODE_ENV:str({ choices: ['development', 'production', 'test'] }),
 * PORT:num({ default: 3000 }),
 * DEBUG:bool({ default: false }),
 * DATABASE_URL:str({ desc: 'Database connection string' })
 * });
 *
 * // Type-safe access with intellisense
 * logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`
 * ```
 */
export function createEnvValidator<T extends Record<string, Spec<unknown>>>(
 specs: T
): CleanedEnv<T> {
 try {
 return cleanEnv(process.env, specs);
 } catch (error) {
 logger.error('Environment validation failed:', error);
 throw error;
 }
}

/**
 * Wraps a promise with a timeout using the Result pattern.
 * Prevents operations from hanging indefinitely and provides clean error handling.
 *
 * @template T - Type of the promise result
 * @param promise - Promise to wrap with timeout
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Optional custom timeout error message
 * @returns Promise resolving to Result containing success value or timeout/error
 *
 * @example
 * ```typescript`
 * const result = await withTimeout(
 * fetchData(),
 * 5000,
 * 'Data fetch timed out after 5 seconds') * );
 *
 * if (result.isOk()) {
 * logger.info('Data: ', result.value);
' * } else {
 * logger.error('Error or timeout:', result.error.message);
 * }
 * ```
 *
 * @example API Calls with Timeout
 * ```typescript`
 * const apiResult = await withTimeout(
 * fetch('/api/users').then(r => r.json()),
 * 3000,
 * 'API call timed out') * );
 * ```
 */
export async function withTimeout<T>(
 promise: Promise<T>,
 timeoutMs: number,
 timeoutMessage?: string
): Promise<Result<T, Error>> {
 let timeoutHandle: NodeJS.Timeout | undefined;

 const cleanup = () => {
 if (timeoutHandle) {
 clearTimeout(timeoutHandle);
 timeoutHandle = undefined;
 }
 };

 const timeoutPromise = new Promise<never>((_resolve, reject) => {
 timeoutHandle = setTimeout(() => {
 reject(
 new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`)
 );
 }, timeoutMs);
 });

 try {
 const result = await Promise.race([promise, timeoutPromise]);
 cleanup();
 return ok(result);
 } catch (error) {
 cleanup();
 const errorInstance =
 error instanceof Error ? error : new Error(String(error));
 return err(errorInstance);
 }
}

export const commonEnvSchema = {
 NODE_ENV: str({
 choices: ['development', 'production', 'test'],
 default: 'development',
 }),
 LOG_LEVEL: str({
 choices: ['error', 'warn', 'info', 'debug'],
 default: 'info',
 }),
 DEBUG: bool({ default: false }),
} as const;

/**
 * Get common environment configuration
 */
export function getCommonEnv() {
 return createEnvValidator(commonEnvSchema);
}

/**
 * Utility to check if we're in development mode
 */
export function isDevelopment(): boolean {
 return process.env['NODE_ENV'] === 'development';
}

/**
 * Utility to check if we're in production mode
 */
export function isProduction(): boolean {
 return process.env['NODE_ENV'] === 'production';
}

/**
 * Utility to check if we're in test mode
 */
export function isTest(): boolean {
 return process.env['NODE_ENV'] === 'test';
}

// =============================================================================
// JSON FORCING PATTERNS - Safe JSON operations with Result pattern
// =============================================================================

/**
 * Safe JSON parsing that never throws
 * Forces developers away from JSON.parse() which crashes on invalid input
 */
export function parseJSON<T = unknown>(text: string): Result<T, Error> {
 try {
 const result = JSON.parse(text) as T;
 return ok(result);
 } catch (error) {
 return err(
 new Error(
 `Invalid JSON:${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

/**
 * Safe JSON stringification that handles circular references and errors
 * Forces developers away from JSON.stringify() which can throw
 */
export function stringifyJSON(
 value: unknown,
 space?: number
): Result<string, Error> {
 try {
 const result = JSON.stringify(value, null, space);
 if (result === undefined) {
 return err(new Error('Value cannot be serialized to JSON'));
 }
 return ok(result);
 } catch (error) {
 return err(
 new Error(
 `JSON serialization failed:${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

/**
 * Safe JSON parsing with schema validation
 * Combines parsing + validation in one operation
 */
export function parseJSONWithSchema<T>(
 text: string,
 schema: ZodType<T>
): Result<T, Error> {
 const parseResult = parseJSON(text);
 if (parseResult.isErr()) {
 return err(parseResult.error);
 }

 return validateInput(schema, parseResult.value);
}

// =============================================================================
// INPUT VALIDATION FORCING PATTERNS - Security-first validation
// =============================================================================

/**
 * Force validation of unknown input data
 * Prevents runtime errors and security vulnerabilities
 */
export function validate<T>(
 schema: ZodType<T>,
 data: unknown
): Result<T, Error> {
 return validateInput(schema, data);
}

/**
 * Force validation of API request bodies
 * Standardizes request validation across all endpoints
 */
export function validateRequest<T>(
 schema: ZodType<T>,
 body: unknown
): Result<T, Error> {
 if (body === null || body === undefined) {
 return err(new Error('Request body is required'));
 }
 return validate(schema, body);
}

/**
 * Force validation of environment variables
 * Prevents runtime errors from missing or invalid env vars
 */
export function validateEnv<T>(
 schema: ZodType<T>,
 env: Record<string, string | undefined> = process.env
): Result<T, Error> {
 return validate(schema, env);
}

/**
 * Force validation of configuration objects
 * Ensures configuration is valid before use
 */
export function validateConfig<T>(
 schema: ZodType<T>,
 config: unknown
): Result<T, Error> {
 return validate(schema, config);
}

/**
 * Safe object property access with validation
 * Forces type-safe access to object properties
 */
export function safeGet<T>(
 obj: unknown,
 path: string,
 schema: ZodType<T>
): Result<T, Error> {
 try {
 const keys = path.split('.');
 let current = obj;

 for (const key of keys) {
 if (current && typeof current === 'object' && key in current) {
 current = (current as Record<string, unknown>)[key];
 } else {
 return err(new Error(`Property '${path}' not found`));
 }
 }

 return validate(schema, current);
 } catch (error) {
 return err(
 new Error(
 `Failed to access property '${path}':${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

// =============================================================================
// FILE OPERATIONS FORCING PATTERNS - Safe async file operations
// =============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Safe file reading with Result pattern
 * Forces async operations and proper error handling
 */
export async function readFile(
 filePath: string,
 encoding:
 | 'utf8'
 | 'ascii'
 | 'utf-8'
 | 'utf16le'
 | 'ucs2'
 | 'ucs-2'
 | 'base64'
 | 'base64url'
 | 'latin1'
 | 'binary'
 | 'hex' = 'utf8'
): Promise<Result<string, Error>> {
 try {
 const content = await fs.readFile(filePath, encoding);
 return ok(content);
 } catch (error) {
 return err(
 new Error(
 `Failed to read file '${filePath}':${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

/**
 * Safe file writing with Result pattern
 * Forces async operations and proper error handling
 */
export async function writeFile(
 filePath: string,
 content: string,
 encoding:
 | 'utf8'
 | 'ascii'
 | 'utf-8'
 | 'utf16le'
 | 'ucs2'
 | 'ucs-2'
 | 'base64'
 | 'base64url'
 | 'latin1'
 | 'binary'
 | 'hex' = 'utf8'
): Promise<Result<void, Error>> {
 try {
 await fs.writeFile(filePath, content, encoding);
 return ok();
 } catch (error) {
 return err(
 new Error(
 `Failed to write file '${filePath}':${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

/**
 * Safe directory checking with Result pattern
 * Prevents errors from missing directories
 */
export async function directoryExists(
 dirPath: string
): Promise<Result<boolean, Error>> {
 try {
 const stats = await fs.stat(dirPath);
 return ok(stats.isDirectory());
 } catch (error) {
 if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
 return ok(false);
 }
 return err(
 new Error(
 `Failed to check directory '${dirPath}':${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

/**
 * Safe file existence checking with Result pattern
 * Prevents errors from missing files
 */
export async function fileExists(
 filePath: string
): Promise<Result<boolean, Error>> {
 try {
 const stats = await fs.stat(filePath);
 return ok(stats.isFile());
 } catch (error) {
 if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
 return ok(false);
 }
 return err(
 new Error(
 `Failed to check file '${filePath}':${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

/**
 * Safe path operations preventing traversal attacks
 * Forces secure path joining and validation
 */
export function safePath(...segments: string[]): Result<string, Error> {
 try {
 const joined = path.join(...segments);
 const normalized = path.normalize(joined);

 // Prevent directory traversal
 if (normalized.includes('..')) {
 return err(new Error('Path traversal detected:path contains ".."'));
 }

 return ok(normalized);
 } catch (error) {
 return err(
 new Error(
 `Invalid path:${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
 )
 );
 }
}

/**
 * Safe JSON file operations
 * Combines file I/O with JSON parsing/stringifying
 */
export async function readJSONFile<T = unknown>(
 filePath: string
): Promise<Result<T, Error>> {
 const fileResult = await readFile(filePath);
 if (fileResult.isErr()) {
 return err(fileResult.error);
 }

 return parseJSON<T>(fileResult.value);
}

export async function writeJSONFile(
 filePath: string,
 data: unknown,
 space?: number
): Promise<Result<void, Error>> {
 const jsonResult = stringifyJSON(data, space);
 if (jsonResult.isErr()) {
 return err(jsonResult.error);
 }

 return await writeFile(filePath, jsonResult.value);
}
