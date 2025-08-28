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
 *   logger.info('Success: ', result.value);
' *} else {
 *   logger.error('Error: ', result.error);
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

// Export base errors (ValidationError and ConfigurationError defined here)
export * from "./errors/base.errors";
// Export types that main index.ts needs
export type {
	CircuitBreakerOptions,
	CockatielRetryOptions,
	CockatielTimeoutOptions,
	RetryOptions,
} from "./handling/error.handler";
// Export error handlers (but avoid duplicate createErrorRecovery)
export {
	aggregate,
	assert,
	attempt,
	attemptAsync,
	CircuitBreakerWithMonitoring,
	ContextError,
	chain,
	circuitBreakerWithResult,
	context,
	createCircuitBreaker,
	createErrorAggregator,
	createErrorChain,
	EnhancedError,
	ErrorAggregator,
	ERROR_HANDLING,
	ensureError,
	err,
	errAsync,
	executeAll,
	executeAllSuccessful,
	exit,
	fail,
	failWith,
	invariant,
	isError,
	isErrorWithContext,
	NetworkError,
	ok,
	okAsync,
	panic,
	parallel,
	parallelSuccessful,
	ResourceError,
	Result,
	ResultAsync,
	recover,
	retryWithResult,
	safe,
	safeAsync,
	TimeoutError,
	timeoutWithResult,
	transformError,
	withContext,
	withRetry,
	withTimeout,
} from "./handling/error.handler";
// Export recovery functions (createErrorRecovery from here, not handler)
export * from "./handling/error.recovery.js";
