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
 *   name:z.string().min(1),
 *   email:z.string().email(),
 *   age:z.number().min(18)
 * });
 *
 * const result = validateInput(UserSchema, { name:'John', email:' john@example.com', age:25 });
 * if (result.isOk()) {
 *   logger.info('Valid user: ', result.value);
' * }
 * ```
 *
 * @example Environment Configuration with Envalid
 * ```typescript`
 * import { env, str, num, bool, createEnvValidator } from '@claude-zen/foundation/utilities';
 *
 * const config = createEnvValidator({
 *   NODE_ENV:str({ choices: ['development',    'production',    'test'], default:' development' }),
 *   PORT:num({ default: 3000 }),
 *   ENABLE_LOGGING:bool({ default: true }),
 *   DATABASE_URL:str()
 * });
 *
 * logger.info(`Server starting on port ${config.PORT} in ${config.NODE_ENV} mode`);
 * ```
 *
 * @example Process Lifecycle Management
 * ```typescript`
 * import { onExit, withTimeout } from '@claude-zen/foundation/utilities';
 *
 * // Cleanup on process exit
 * onExit(async () => {
 *   logger.info('Cleaning up resources...');
 *   await database.close();
 *   await cache.disconnect();
 * });
 *
 * // Timeout operations
 * const result = await withTimeout(
 *   longRunningOperation(),
 *   5000,
 *   'Operation timed out after 5 seconds') * );
 * ```
 *
 * Features:
 * • Zod integration for type-safe validation
 * • Envalid integration for environment configuration
 * • Exit hook management for cleanup
 * • Timeout utilities with proper error handling
 * • Result pattern integration with foundation error handling
 */
import {
  bool,
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
import { type Result } from '../../error-handling/index.js';
/**
 * Common environment configuration schema and validation utilities.
 * Provides type-safe environment variable processing.
 */
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
export { bool, email, host, json, num, port, str, url };
export { default as onExit } from 'exit-hook';
export { default as _, default as lodash } from 'lodash';
export { customAlphabet, nanoid } from 'nanoid';
export type { ZodError, ZodSchema, ZodType } from 'zod';
export { z } from 'zod';
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
 *   name:z.string().min(1),
 *   email:z.string().email()
 * });
 *
 * const result = validateInput(UserSchema, userData);
 * if (result.isOk()) {
 *   logger.info('Valid user: ', result.value);
' * } else {
 *   logger.error('Validation error:', result.error.message);
 * }
 * ```
 */
export declare function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): Result<T, Error>;
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
 *   name:z.string().min(1),
 *   email:z.string().email()
 * }));
 *
 * // Reuse validator multiple times
 * const result1 = validateUser(userData1);
 * const result2 = validateUser(userData2);
 * ```
 */
export declare function createValidator<T>(
  schema: z.ZodSchema<T>
): (input: unknown) => Result<T, Error>;
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
 *   NODE_ENV:str({ choices: ['development',    'production',    'test'] }),
 *   PORT:num({ default: 3000 }),
 *   DEBUG:bool({ default: false }),
 *   DATABASE_URL:str({ desc: 'Database connection string' })
 * });
 *
 * // Type-safe access with intellisense
 * logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
 * ```
 */
export declare function createEnvValidator<
  T extends Record<string, Spec<unknown>>,
>(specs: T): CleanedEnv<T>;
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
 *   fetchData(),
 *   5000,
 *   'Data fetch timed out after 5 seconds') * );
 *
 * if (result.isOk()) {
 *   logger.info('Data: ', result.value);
' * } else {
 *   logger.error('Error or timeout:', result.error.message);
 * }
 * ```
 *
 * @example API Calls with Timeout
 * ```typescript`
 * const apiResult = await withTimeout(
 *   fetch('/api/users').then(r => r.json()),
 *   3000,
 *   'API call timed out') * );
 * ```
 */
export declare function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<Result<T, Error>>;
export declare const commonEnvSchema: {
  readonly NODE_ENV: import('envalid').RequiredValidatorSpec<
    'development' | 'production' | 'test'
  >;
  readonly LOG_LEVEL: import('envalid').RequiredValidatorSpec<
    'error' | 'warn' | 'info' | 'debug'
  >;
  readonly DEBUG: import('envalid').RequiredValidatorSpec<boolean>;
};
/**
 * Get common environment configuration
 */
export declare function getCommonEnv(): Readonly<
  {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
    readonly DEBUG: boolean;
  } & import('envalid').CleanedEnvAccessors
>;
/**
 * Utility to check if we're in development mode
 */
export declare function isDevelopment(): boolean;
/**
 * Utility to check if we're in production mode
 */
export declare function isProduction(): boolean;
/**
 * Utility to check if we're in test mode
 */
export declare function isTest(): boolean;
/**
 * Safe JSON parsing that never throws
 * Forces developers away from JSON.parse() which crashes on invalid input
 */
export declare function parseJSON<T = unknown>(text: string): Result<T, Error>;
/**
 * Safe JSON stringification that handles circular references and errors
 * Forces developers away from JSON.stringify() which can throw
 */
export declare function stringifyJSON(
  value: unknown,
  space?: number
): Result<string, Error>;
/**
 * Safe JSON parsing with schema validation
 * Combines parsing + validation in one operation
 */
export declare function parseJSONWithSchema<T>(
  text: string,
  schema: ZodType<T>
): Result<T, Error>;
/**
 * Force validation of unknown input data
 * Prevents runtime errors and security vulnerabilities
 */
export declare function validate<T>(
  schema: ZodType<T>,
  data: unknown
): Result<T, Error>;
/**
 * Force validation of API request bodies
 * Standardizes request validation across all endpoints
 */
export declare function validateRequest<T>(
  schema: ZodType<T>,
  body: unknown
): Result<T, Error>;
/**
 * Force validation of environment variables
 * Prevents runtime errors from missing or invalid env vars
 */
export declare function validateEnv<T>(
  schema: ZodType<T>,
  env?: Record<string, string | undefined>
): Result<T, Error>;
/**
 * Force validation of configuration objects
 * Ensures configuration is valid before use
 */
export declare function validateConfig<T>(
  schema: ZodType<T>,
  config: unknown
): Result<T, Error>;
/**
 * Safe object property access with validation
 * Forces type-safe access to object properties
 */
export declare function safeGet<T>(
  obj: unknown,
  path: string,
  schema: ZodType<T>
): Result<T, Error>;
/**
 * Safe file reading with Result pattern
 * Forces async operations and proper error handling
 */
export declare function readFile(
  filePath: string,
  encoding?:
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
    | 'hex'
): Promise<Result<string, Error>>;
/**
 * Safe file writing with Result pattern
 * Forces async operations and proper error handling
 */
export declare function writeFile(
  filePath: string,
  content: string,
  encoding?:
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
    | 'hex'
): Promise<Result<void, Error>>;
/**
 * Safe directory checking with Result pattern
 * Prevents errors from missing directories
 */
export declare function directoryExists(
  dirPath: string
): Promise<Result<boolean, Error>>;
/**
 * Safe file existence checking with Result pattern
 * Prevents errors from missing files
 */
export declare function fileExists(
  filePath: string
): Promise<Result<boolean, Error>>;
/**
 * Safe path operations preventing traversal attacks
 * Forces secure path joining and validation
 */
export declare function safePath(...segments: string[]): Result<string, Error>;
/**
 * Safe JSON file operations
 * Combines file I/O with JSON parsing/stringifying
 */
export declare function readJSONFile<T = unknown>(
  filePath: string
): Promise<Result<T, Error>>;
export declare function writeJSONFile(
  filePath: string,
  data: unknown,
  space?: number
): Promise<Result<void, Error>>;
//# sourceMappingURL=common.utilities.d.ts.map
