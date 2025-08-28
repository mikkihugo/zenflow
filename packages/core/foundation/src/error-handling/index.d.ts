/**
 * @fileoverview Error Handling Module Exports
 *
 * Comprehensive error handling with resilience patterns and type-safe error management.
 * Provides Result pattern, circuit breakers, retry logic, and error recovery mechanisms.
 *
 * @example Basic Error Handling
 * ```typescript`
 * import { Result, ok, err, safeAsync} from '@claude-zen/foundation/error-handling';
 *
 * const result = await safeAsync(async () => {
 *   return await riskyOperation();
 *});
 *
 * if (result.isOk()) {
 *   console.log('Success: ', result.value);
' *} else {
 *   console.error('Error: ', result.error);
' *}
 * ```
 *
 * @example Circuit Breaker Pattern
 * ```typescript`
 * import { createCircuitBreaker} from '@claude-zen/foundation/error-handling';
 *
 * const breaker = createCircuitBreaker({
 *   threshold:5,
 *   timeout:60000,
 *   monitor:true
 *});
 * ```
 */
export * from "./errors/base.errors";
export type { CircuitBreakerOptions, CockatielRetryOptions, CockatielTimeoutOptions, RetryOptions, } from "./handling/error.handler";
export { aggregate, assert, attempt, attemptAsync, CircuitBreakerWithMonitoring, ContextError, chain, circuitBreakerWithResult, context, createCircuitBreaker, createErrorAggregator, createErrorChain, EnhancedError, ErrorAggregator, ERROR_HANDLING, ensureError, err, errAsync, executeAll, executeAllSuccessful, exit, fail, failWith, invariant, isError, isErrorWithContext, NetworkError, ok, okAsync, panic, parallel, parallelSuccessful, ResourceError, Result, ResultAsync, recover, retryWithResult, safe, safeAsync, TimeoutError, timeoutWithResult, transformError, withContext, withRetry, withTimeout, } from "./handling/error.handler";
export * from "./handling/error.recovery.js";
//# sourceMappingURL=index.d.ts.map