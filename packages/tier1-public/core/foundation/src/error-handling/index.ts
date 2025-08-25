/**
 * @fileoverview Error Handling Module Exports
 *
 * Comprehensive error handling with resilience patterns and type-safe error management.
 * Provides Result pattern, circuit breakers, retry logic, and error recovery mechanisms.
 *
 * @example Basic Error Handling
 * ```typescript
 * import { Result, ok, err, safeAsync } from '@claude-zen/foundation/error-handling';
 *
 * const result = await safeAsync(async () => {
 *   return await riskyOperation();
 * });
 *
 * if (result.isOk()) {
 *   console.log('Success:', result.value);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 *
 * @example Circuit Breaker Pattern
 * ```typescript
 * import { createCircuitBreaker } from '@claude-zen/foundation/error-handling';
 *
 * const breaker = createCircuitBreaker({
 *   threshold: 5,
 *   timeout: 60000,
 *   monitor: true
 * });
 * ```
 */

// Export base errors (ValidationError and ConfigurationError defined here)
export * from './errors/base.errors';

// Export error handlers (but avoid duplicate createErrorRecovery)
export {
  ErrorHandling,
  EnhancedError,
  ContextError,
  NetworkError,
  TimeoutError,
  ResourceError,
  CircuitBreakerWithMonitoring,
  createCircuitBreaker,
  ErrorAggregator,
  createErrorAggregator,
  createErrorChain,
  Result,
  ok,
  err,
  ResultAsync,
  errAsync,
  okAsync,
  isError,
  isErrorWithContext,
  ensureError,
  withContext,
  safeAsync,
  safe,
  withTimeout,
  withRetry,
  executeAll,
  executeAllSuccessful,
  transformError,
  attempt,
  attemptAsync,
  retryWithResult,
  timeoutWithResult,
  circuitBreakerWithResult,
  parallel,
  parallelSuccessful,
  recover,
  aggregate,
  chain,
  context,
  exit,
  panic,
  assert,
  invariant,
  fail,
  failWith,
} from './handling/error.handler';

// Export recovery functions (createErrorRecovery from here, not handler)
export * from './handling/error.recovery';

// Export types that main index.ts needs
export type {
  RetryOptions,
  CircuitBreakerOptions,
  CockatielRetryOptions,
  CockatielTimeoutOptions,
} from './handling/error.handler';