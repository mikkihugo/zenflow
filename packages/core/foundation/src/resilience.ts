/**
 * @fileoverview Resilience Patterns Entry Point
 *
 * Circuit breakers, retry logic, timeouts, and error handling patterns.
 * Import this for resilient application patterns.
 */

// =============================================================================
// COCKATIEL RESILIENCE PATTERNS
// =============================================================================
export {
	BrokenCircuitError,
	BulkheadRejectedError,
	bulkhead,
	CircuitState,
	ConsecutiveBreaker,
	ConstantBackoff,
	CountBreaker,
	circuitBreaker,
	DelegateBackoff,
	decorrelatedJitterGenerator,
	Event,
	ExponentialBackoff,
	fallback,
	handleAll,
	handleResultType,
	handleType,
	handleWhen,
	handleWhenResult,
	IsolatedCircuitError,
	IterableBackoff,
	noJitterGenerator,
	noop,
	Policy,
	retry,
	SamplingBreaker,
	TaskCancelledError,
	TimeoutStrategy,
	timeout,
	usePolicy,
	wrap,
} from "cockatiel";

export type {
	CircuitBreakerOptions,
	CockatielRetryOptions,
	CockatielTimeoutOptions,
	RetryOptions,
} from "./error-handling";
// =============================================================================
// ERROR HANDLING & RESULT PATTERNS
// =============================================================================
// =============================================================================
// ERROR CLASSES
// =============================================================================
export {
	CircuitBreakerWithMonitoring,
	ConfigurationError,
	ContextError,
	createCircuitBreaker,
	createErrorAggregator,
	createErrorChain,
	EnhancedError,
	ErrorAggregator,
	ErrorHandling,
	ensureError,
	err,
	errAsync,
	executeAll,
	executeAllSuccessful,
	isError,
	isErrorWithContext,
	NetworkError,
	ok,
	okAsync,
	ResourceError,
	Result,
	ResultAsync,
	safe,
	safeAsync,
	TimeoutError,
	transformError,
	ValidationError,
	withContext,
	withRetry,
	withTimeout,
} from "./error-handling";
