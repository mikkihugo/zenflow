/**
 * @fileoverview Foundation Utilities - Battle-tested utilities for common tasks
 *
 * Provides modern, battle-tested utilities for validation, environment handling,
 * process lifecycle, and timeouts using proven NPM packages.
 *
 * @example Input Validation with Zod
 * ```typescript
 * import { z, validateInput, createValidator } from '@claude-zen/foundation/utilities';
 *
 * const UserSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 *   age: z.number().min(18)
 * });
 *
 * const result = validateInput(UserSchema, { name: 'John', email: 'john@example.com', age: 25 });
 * if (result.isOk()) {
 *   console.log('Valid user:', result.value);
 * }
 * ```
 *
 * @example Environment Configuration with Envalid
 * ```typescript
 * import { env, str, num, bool, createEnvValidator } from '@claude-zen/foundation/utilities';
 *
 * const config = createEnvValidator({
 *   NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
 *   PORT: num({ default: 3000 }),
 *   ENABLE_LOGGING: bool({ default: true }),
 *   DATABASE_URL: str()
 * });
 *
 * console.log(`Server starting on port ${config.PORT} in ${config.NODE_ENV} mode`);
 * ```
 *
 * @example Process Lifecycle Management
 * ```typescript
 * import { onExit, withTimeout } from '@claude-zen/foundation/utilities';
 *
 * // Cleanup on process exit
 * onExit(async () => {
 *   console.log('Cleaning up resources...');
 *   await database.close();
 *   await cache.disconnect();
 * });
 *
 * // Timeout operations
 * const result = await withTimeout(
 *   longRunningOperation(),
 *   5000,
 *   'Operation timed out after 5 seconds'
 * );
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
import type { Spec, CleanedEnv } from 'envalid';
import { cleanEnv, str as envStr, bool as envBool } from 'envalid';
import { z, type ZodType } from 'zod';

import { Result, ok, err } from '../../error-handling';
import { getLogger } from '../../core/logging';

/**
 * Common environment configuration schema
 */

export { z } from 'zod';
export type { ZodSchema, ZodType, ZodError } from 'zod';

// Re-export envalid for environment validation
export { str, num, bool, port, url, email, json, host } from 'envalid';
export type { Spec, CleanedEnv } from 'envalid';

// Re-export exit-hook for process lifecycle
export { default as onExit } from 'exit-hook';

// Use cockatiel timeout policies: import { timeout, TimeoutStrategy } from '@claude-zen/foundation'
const logger = getLogger('foundation-utilities');

/**
 * Validate input using Zod schema with Result pattern
 *
 * @example
 * ```typescript
 * const UserSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * });
 *
 * const result = validateInput(UserSchema, userData);
 * if (result.isOk()) {
 *   console.log('Valid user:', result.value);
 * } else {
 *   console.error('Validation error:', result.error.message);
 * }
 * ```
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): Result<T, Error> {
  try {
    const validated = schema.parse(input);
    return ok(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = `Validation failed: ${error.issues.map((e: { path: (string|number)[]; message: string }) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      return err(new Error(message));
    }
    return err(
      error instanceof Error ? error : new Error('Unknown validation error'),
    );
  }
}

/**
 * Create a reusable validator function
 *
 * @example
 * ```typescript
 * const validateUser = createValidator(z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * }));
 *
 * const result = validateUser(userData);
 * ```
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (input: unknown): Result<T, Error> => validateInput(schema, input);
}

/**
 * Validate environment variables with Envalid
 *
 * @example
 * ```typescript
 * const env = createEnvValidator({
 *   NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
 *   PORT: num({ default: 3000 }),
 *   DEBUG: bool({ default: false })
 * });
 * ```
 */
export function createEnvValidator<T extends Record<string, Spec<unknown>>>(
  specs: T,
): CleanedEnv<T> {
  try {
    return cleanEnv(process.env, specs);
  } catch (error) {
    logger.error('Environment validation failed:', error);
    throw error;
  }
}

/**
 * Wrap operation with timeout using Result pattern
 *
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   fetchData(),
 *   5000,
 *   'Data fetch timed out'
 * );
 *
 * if (result.isOk()) {
 *   console.log('Data:', result.value);
 * } else {
 *   console.error('Error or timeout:', result.error.message);
 * }
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string,
): Promise<Result<T, Error>> {
  let timeoutHandle: NodeJS.Timeout|undefined;

  const cleanup = () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = undefined;
    }
  };

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(timeoutMessage||`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    cleanup();
    return ok(result);
  } catch (error) {
    cleanup();
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    return err(errorInstance);
  }
}

export const commonEnvSchema = {
  NODE_ENV: envStr({
    choices: ['development', 'production', 'test'],
    default: 'development',
  }),
  LOG_LEVEL: envStr({
    choices: ['error', 'warn', 'info', 'debug'],
    default: 'info',
  }),
  DEBUG: envBool({ default: false }),
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
    return err(new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

/**
 * Safe JSON stringification that handles circular references and errors
 * Forces developers away from JSON.stringify() which can throw
 */
export function stringifyJSON(value: unknown, space?: number): Result<string, Error> {
  try {
    const result = JSON.stringify(value, null, space);
    if (result === undefined) {
      return err(new Error('Value cannot be serialized to JSON'));
    }
    return ok(result);
  } catch (error) {
    return err(new Error(`JSON serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

/**
 * Safe JSON parsing with schema validation
 * Combines parsing + validation in one operation
 */
export function parseJSONWithSchema<T>(text: string, schema: ZodType<T>): Result<T, Error> {
  const parseResult = parseJSON(text);
  if (parseResult.isErr()) {
    return err(parseResult.error);
  }

  const validationResult = validateInput(schema, parseResult.value);
  return validationResult;
}

// =============================================================================
// INPUT VALIDATION FORCING PATTERNS - Security-first validation
// =============================================================================

/**
 * Force validation of unknown input data
 * Prevents runtime errors and security vulnerabilities
 */
export function validate<T>(schema: ZodType<T>, data: unknown): Result<T, Error> {
  return validateInput(schema, data);
}

/**
 * Force validation of API request bodies
 * Standardizes request validation across all endpoints
 */
export function validateRequest<T>(schema: ZodType<T>, body: unknown): Result<T, Error> {
  if (body === null || body === undefined) {
    return err(new Error('Request body is required'));
  }
  return validate(schema, body);
}

/**
 * Force validation of environment variables
 * Prevents runtime errors from missing or invalid env vars
 */
export function validateEnv<T>(schema: ZodType<T>, env: Record<string, string | undefined> = process.env): Result<T, Error> {
  return validate(schema, env);
}

/**
 * Force validation of configuration objects
 * Ensures configuration is valid before use
 */
export function validateConfig<T>(schema: ZodType<T>, config: unknown): Result<T, Error> {
  return validate(schema, config);
}

/**
 * Safe object property access with validation
 * Forces type-safe access to object properties
 */
export function safeGet<T>(obj: unknown, path: string, schema: ZodType<T>): Result<T, Error> {
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
    return err(new Error(`Failed to access property '${path}': ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

// =============================================================================
// FILE OPERATIONS FORCING PATTERNS - Safe async file operations
// =============================================================================

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Safe file reading with Result pattern
 * Forces async operations and proper error handling
 */
export async function readFile(filePath: string, encoding: 'utf8' | 'ascii' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex' = 'utf8'): Promise<Result<string, Error>> {
  try {
    const content = await fs.readFile(filePath, encoding);
    return ok(content);
  } catch (error) {
    return err(new Error(`Failed to read file '${filePath}': ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

/**
 * Safe file writing with Result pattern
 * Forces async operations and proper error handling
 */
export async function writeFile(filePath: string, content: string, encoding: 'utf8' | 'ascii' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex' = 'utf8'): Promise<Result<void, Error>> {
  try {
    await fs.writeFile(filePath, content, encoding);
    return ok(undefined);
  } catch (error) {
    return err(new Error(`Failed to write file '${filePath}': ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

/**
 * Safe directory checking with Result pattern
 * Prevents errors from missing directories
 */
export async function directoryExists(dirPath: string): Promise<Result<boolean, Error>> {
  try {
    const stats = await fs.stat(dirPath);
    return ok(stats.isDirectory());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return ok(false);
    }
    return err(new Error(`Failed to check directory '${dirPath}': ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

/**
 * Safe file existence checking with Result pattern
 * Prevents errors from missing files
 */
export async function fileExists(filePath: string): Promise<Result<boolean, Error>> {
  try {
    const stats = await fs.stat(filePath);
    return ok(stats.isFile());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return ok(false);
    }
    return err(new Error(`Failed to check file '${filePath}': ${error instanceof Error ? error.message : 'Unknown error'}`));
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
      return err(new Error('Path traversal detected: path contains ".."'));
    }

    return ok(normalized);
  } catch (error) {
    return err(new Error(`Invalid path: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

/**
 * Safe JSON file operations
 * Combines file I/O with JSON parsing/stringifying
 */
export async function readJSONFile<T = unknown>(filePath: string): Promise<Result<T, Error>> {
  const fileResult = await readFile(filePath);
  if (fileResult.isErr()) {
    return err(fileResult.error);
  }

  return parseJSON<T>(fileResult.value);
}

export async function writeJSONFile(filePath: string, data: unknown, space?: number): Promise<Result<void, Error>> {
  const jsonResult = stringifyJSON(data, space);
  if (jsonResult.isErr()) {
    return err(jsonResult.error);
  }

  return writeFile(filePath, jsonResult.value);
}
