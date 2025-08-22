/**
 * @fileoverview Modern Error Handling using Battle-Tested Libraries
 *
 * Professional error handling using established npm packages:
 * - neverthrow: Type-safe Result<T, E> pattern
 * - p-retry: Advanced retry logic with exponential backoff
 * - opossum: Production-ready circuit breaker
 *
 * Features:
 * - Type-safe error handling with Result pattern
 * - Advanced retry logic with configurable strategies
 * - Circuit breaker with metrics and health monitoring
 * - Error composition and transformation utilities
 * - Async error handling helpers
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import { Result, ok, err, ResultAsync, errAsync, okAsync } from 'neverthrow';
import CircuitBreaker, { Options as CircuitBreakerOptions } from 'opossum';
import pRetry, { AbortError, Options as PRetryOptions } from 'p-retry';

import { getLogger } from './logging';
import type { JsonObject } from './types/primitives';

const logger = getLogger('error-handling');

// Re-export neverthrow types and functions - removed to avoid duplicates
export type { PRetryOptions, CircuitBreakerOptions };

/**
 * Enhanced error classes with context
 */
export class EnhancedError extends Error {
  public readonly context: JsonObject;
  public readonly timestamp: Date;
  public readonly code?: string;

  constructor(
    message: string,
    context: JsonObject = {},
    code?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'EnhancedError';
    this.context = context;
    this.timestamp = new Date();
    this.code = code;
  }

  /**
   * Create an enhanced error with additional context
   */
  withContext(additionalContext: JsonObject): EnhancedError {
    return new EnhancedError(
      this.message,
      { ...this.context, ...additionalContext },
      this.code,
      { cause: this }
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): JsonObject {
    return {
      name: this.name,
      message: this.message,
      code: this.code ?? null,
      context: this.context as JsonObject,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack ?? null,
    };
  }
}

export class ContextError extends Error {
  public readonly context: JsonObject;
  public readonly timestamp: Date;
  public readonly code?: string;

  constructor(
    message: string,
    context: JsonObject = {},
    code?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ContextError';
    this.context = context;
    this.timestamp = new Date();
    this.code = code;
  }

  /**
   * Create an enhanced error with additional context
   */
  withContext(additionalContext: JsonObject): ContextError {
    return new ContextError(
      this.message,
      { ...this.context, ...additionalContext },
      this.code,
      { cause: this }
    );
  }

  /**
   * Convert to plain object for serialization with enhanced context information
   */
  toObject(): JsonObject {
    // Enhanced context error serialization with additional metadata
    const baseObject = {
      name: this.name,
      message: this.message,
      code: this.code ?? null,
      context: this.context as JsonObject,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack ?? null,
    };

    // Add enhanced context information for ContextError
    return {
      ...baseObject,
      errorType: 'ContextError',
      contextKeys: Object.keys(this.context'' | '''' | ''{}),
      hasContext: Boolean(this.context && Object.keys(this.context).length > 0),
      contextSummary:
        Object.keys(this.context'' | '''' | ''{}).join(', ')'' | '''' | '''no context',
    };
  }
}

/**
 * Specific error types
 */
export class ValidationError extends ContextError {
  constructor(message: string, context: JsonObject = {}) {
    super(message, context, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends ContextError {
  constructor(message: string, context: JsonObject = {}) {
    super(message, context, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class NetworkError extends ContextError {
  constructor(message: string, context: JsonObject = {}) {
    super(message, context, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ContextError {
  constructor(message: string, context: JsonObject = {}) {
    super(message, context, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

export class ResourceError extends ContextError {
  constructor(message: string, context: JsonObject = {}) {
    super(message, context, 'RESOURCE_ERROR');
    this.name = 'ResourceError';
  }
}

/**
 * Error utilities
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isErrorWithContext(value: unknown): value is ContextError {
  return value instanceof ContextError;
}

export function ensureError(value: unknown): Error {
  if (isError(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  return new Error(String(value));
}

export function withContext(error: unknown, context: JsonObject): ContextError {
  const baseError = ensureError(error);
  if (isErrorWithContext(baseError)) {
    return baseError.withContext(context);
  }
  return new ContextError(baseError.message, context, undefined, {
    cause: baseError,
  });
}

/**
 * Safe async execution with Result pattern
 */
export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const result = await fn();
    return ok(result);
  } catch (error) {
    return err(ensureError(error));
  }
}

/**
 * Safe sync execution with Result pattern
 */
export function safe<T>(fn: () => T): Result<T, Error> {
  try {
    const result = fn();
    return ok(result);
  } catch (error) {
    return err(ensureError(error));
  }
}

/**
 * Advanced retry configuration
 */
export interface RetryOptions extends Omit<PRetryOptions, 'onFailedAttempt'> {
  onFailedAttempt?: (
    error: Error,
    attemptNumber: number
  ) => void'' | ''Promise<void>;
  shouldRetry?: (error: Error) => boolean;
  retryIf?: (error: Error) => boolean;
  abortIf?: (error: Error) => boolean;
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: boolean;
}

/**
 * Enhanced retry function with logging and better error handling
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<Result<T, Error>> {
  const { onFailedAttempt, shouldRetry, retryIf, abortIf, ...retryOptions } =
    options;

  const finalOptions: PRetryOptions = {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 30000,
    randomize: true,
    ...retryOptions,
    onFailedAttempt: (error) => {
      logger.warn(`Attempt ${error.attemptNumber} failed:`, error);

      // Custom abort logic
      if (abortIf && abortIf(error)) {
        throw new AbortError(error);
      }

      // Custom retry logic
      if (shouldRetry && !shouldRetry(error)) {
        throw new AbortError(error);
      }

      if (retryIf && !retryIf(error)) {
        throw new AbortError(error);
      }

      // Call user-provided callback
      if (onFailedAttempt) {
        const result = onFailedAttempt(error, error.attemptNumber);
        if (result instanceof Promise) {
          return result;
        }
      }
      return Promise.resolve();
    },
  };

  try {
    const result = await pRetry(fn, finalOptions);
    return ok(result);
  } catch (error) {
    const enhancedError = withContext(error, {
      operation:'retry',
      maxRetries: finalOptions.retries'' | '''' | ''0,
      finalAttempt: true,
    });
    logger.error('Retry failed permanently:', enhancedError);
    return err(enhancedError);
  }
}

/**
 * Circuit breaker with monitoring
 */
export class CircuitBreakerWithMonitoring<T extends unknown[], R> {
  private breaker: CircuitBreaker<T, R>;
  private readonly name: string;

  constructor(
    action: (...args: T) => Promise<R>,
    options: CircuitBreakerOptions = {},
    name = 'circuit-breaker'
  ) {
    this.name = name;

    const defaultOptions: CircuitBreakerOptions = {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
      ...options,
    };

    this.breaker = new CircuitBreaker(action, defaultOptions);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.breaker.on('open', () => {
      logger.warn(`Circuit breaker ${this.name} opened`);
    });

    this.breaker.on('halfOpen', () => {
      logger.info(`Circuit breaker ${this.name} half-open`);
    });

    this.breaker.on('close', () => {
      logger.info(`Circuit breaker ${this.name} closed`);
    });

    this.breaker.on('fallback', () => {
      logger.debug(`Circuit breaker ${this.name} executed fallback`);
    });

    this.breaker.on('failure', (error) => {
      logger.debug(`Circuit breaker ${this.name} recorded failure:`, error);
    });

    this.breaker.on('success', () => {
      logger.debug(`Circuit breaker ${this.name} recorded success`);
    });

    this.breaker.on('timeout', () => {
      logger.warn(`Circuit breaker ${this.name} timed out`);
    });

    this.breaker.on('reject', () => {
      logger.warn(`Circuit breaker ${this.name} rejected call`);
    });
  }

  /**
   * Execute the circuit breaker with Result pattern
   */
  async execute(...args: T): Promise<Result<R, Error>> {
    try {
      const result = await this.breaker.fire(...args);
      return ok(result);
    } catch (error) {
      const enhancedError = withContext(error, {
        circuitBreaker: this.name,
        state: JSON.stringify(this.breaker.stats),
        isOpen: this.breaker.opened,
        isHalfOpen: this.breaker.halfOpen,
      });
      return err(enhancedError);
    }
  }

  /**
   * Add a fallback function
   */
  fallback(fallbackFn: (...args: T) => Promise<R>'' | ''R): this {
    this.breaker.fallback(fallbackFn);
    return this;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats() {
    return this.breaker.stats;
  }

  /**
   * Get circuit breaker state
   */
  getState() {
    return {
      isOpen: this.breaker.opened,
      isHalfOpen: this.breaker.halfOpen,
      isClosed: this.breaker.closed,
      stats: this.breaker.stats,
    };
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.breaker.close();
    logger.info(`Circuit breaker ${this.name} manually reset`);
  }

  /**
   * Shutdown the circuit breaker
   */
  shutdown(): void {
    this.breaker.shutdown();
    logger.info(`Circuit breaker ${this.name} shutdown`);
  }
}

/**
 * Create a circuit breaker with Result pattern
 */
export function createCircuitBreaker<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  options: CircuitBreakerOptions = {},
  name?: string
): CircuitBreakerWithMonitoring<T, R> {
  return new CircuitBreakerWithMonitoring(action, options, name);
}

/**
 * Timeout wrapper with Result pattern
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<Result<T, TimeoutError>> {
  let timeoutHandle: NodeJS.Timeout'' | ''undefined;

  const cleanup = () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = undefined;
    }
  };

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new TimeoutError(
          timeoutMessage'' | '''' | ''`Operation timed out after ${timeoutMs}ms`,
          { timeoutMs }
        )
      );
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    cleanup();
    return ok(result);
  } catch (error) {
    cleanup();
    if (error instanceof TimeoutError) {
      return err(error);
    } else {
      const enhancedError = ensureError(error);
      return err(
        new TimeoutError(enhancedError.message, {
          originalError: enhancedError.message,
        })
      );
    }
  }
}

/**
 * Execute all operations in parallel and collect results
 */
export async function executeAll<T>(
  operations: (() => Promise<T>)[]
): Promise<Result<T[], Error[]>> {
  const results = await Promise.allSettled(operations.map((op) => op()));

  const successes: T[] = [];
  const failures: Error[] = [];

  for (const result of results) {
    if (result.status ==='fulfilled') {
      successes.push(result.value);
    } else {
      failures.push(ensureError(result.reason));
    }
  }

  return failures.length === 0 ? ok(successes) : err(failures);
}

/**
 * Execute all operations and return only successful results
 */
export async function executeAllSuccessful<T>(
  operations: (() => Promise<T>)[]
): Promise<Result<T[], Error[]>> {
  const result = await executeAll(operations);

  if (result.isOk()) {
    return ok(result.value);
  } else {
    // Return successful results even if some failed
    const results = await Promise.allSettled(operations.map((op) => op()));
    const successes: T[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        successes.push(result.value);
      }
    }

    return ok(successes);
  }
}

/**
 * Transform errors in Result chains
 */
export function transformError<T, E, F>(
  result: Result<T, E>,
  transformer: (error: E) => F
): Result<T, F> {
  return result.mapErr(transformer);
}

/**
 * Error recovery utility
 */
export function createErrorRecovery<T>(
  fallbackValue: T,
  shouldRecover?: (error: Error) => boolean
) {
  return (error: Error): Result<T, Error> => {
    if (!shouldRecover'' | '''' | ''shouldRecover(error)) {
      logger.debug('Recovering from error with fallback value:', error.message);
      return ok(fallbackValue);
    }
    return err(error);
  };
}

/**
 * Error aggregator for collecting multiple errors
 */
export class ErrorAggregator {
  private errors: Error[] = [];

  add(error: Error): this {
    this.errors.push(error);
    return this;
  }

  addResult<T>(result: Result<T, Error>): this {
    if (result.isErr()) {
      this.errors.push(result.error);
    }
    return this;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): Error[] {
    return [...this.errors];
  }

  getFirstError(): Error'' | ''null {
    return this.errors[0]'' | '''' | ''null;
  }

  clear(): this {
    this.errors = [];
    return this;
  }

  toResult<T>(value: T): Result<T, Error[]> {
    if (this.hasErrors()) {
      return err(this.getErrors())();
    }
    return ok(value);
  }

  toSingleResult<T>(value: T): Result<T, Error> {
    const firstError = this.getFirstError();
    if (firstError) {
      return err(firstError);
    }
    return ok(value);
  }
}

/**
 * Create an error aggregator
 */
export function createErrorAggregator(): ErrorAggregator {
  return new ErrorAggregator();
}

/**
 * Utility for creating error chains
 */
export function createErrorChain(
  baseError: Error,
  ...additionalErrors: Error[]
): ContextError {
  const allErrors = [baseError, ...additionalErrors];
  const messages = allErrors.map((e) => e.message);
  const contexts = allErrors
    .filter(isErrorWithContext)
    .map((e) => e.context)
    .reduce((acc, ctx) => ({ ...acc, ...ctx }), {});

  return new ContextError(
    messages.join(' -> '),
    {
      ...contexts,
      errorChain: messages,
      errorCount: allErrors.length,
    },
    'ERROR_CHAIN',
    { cause: baseError }
  );
}

// Export convenience functions
// Export p-retry and neverthrow directly
export { AbortError, Result, ok, err, ResultAsync, errAsync, okAsync };

// Re-export from types for backwards compatibility
export type { BaseError } from './types/errors';

// Export enums with clear naming to avoid conflicts
export {
  ErrorSeverity as ErrorSeverityEnum,
  ErrorCategory as ErrorCategoryEnum,
} from './types/errors';

export const ErrorHandling = {
  safe,
  safeAsync,
  withRetry,
  withTimeout,
  createCircuitBreaker,
  executeAll,
  executeAllSuccessful,
  transformError,
  createErrorRecovery,
  createErrorAggregator,
  createErrorChain,
  withContext,
  ensureError,
  isError,
  isErrorWithContext,
} as const;
