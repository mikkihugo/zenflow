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
import { default as pTimeout, TimeoutError } from 'p-timeout';
import { z } from 'zod';

import { Result, ok, err } from './error-handling';
import { getLogger } from './logging';

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

// Re-export p-timeout for timeout operations
export { default as pTimeout, TimeoutError } from 'p-timeout';

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
  input: unknown
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
      error instanceof Error ? error : new Error('Unknown validation error')
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
  timeoutMessage?: string
): Promise<Result<T, Error>> {
  try {
    const result = await pTimeout(promise, {
      milliseconds: timeoutMs,
      message: timeoutMessage||`Operation timed out after ${timeoutMs}ms`,
    });
    return ok(result);
  } catch (error) {
    if (error instanceof TimeoutError) {
      return err(new Error(error.message));
    }
    const errorInstance = error as Error;
    return err(
      errorInstance instanceof Error
        ? errorInstance
        : new Error('Unknown timeout error')
    );
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
