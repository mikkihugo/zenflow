/**
 * @fileoverview Resilience Patterns Entry Point
 *
 * Circuit breakers, retry logic, timeouts, and error handling patterns.
 * Import this for resilient application patterns.
 */

// =============================================================================
// ERROR HANDLING & RESULT PATTERNS
// =============================================================================
export {
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
} from './error-handling';

export type {
  RetryOptions,
  CircuitBreakerOptions,
  CockatielRetryOptions,
  CockatielTimeoutOptions,
} from './error-handling';

// =============================================================================
// COCKATIEL RESILIENCE PATTERNS
// =============================================================================
export {
  retry,
  circuitBreaker,
  timeout,
  bulkhead,
  fallback,
  wrap,
  noop,
  handleAll,
  handleType,
  handleWhen,
  handleResultType,
  handleWhenResult,
  Policy,
  ExponentialBackoff,
  ConstantBackoff,
  IterableBackoff,
  DelegateBackoff,
  noJitterGenerator,
  decorrelatedJitterGenerator,
  ConsecutiveBreaker,
  SamplingBreaker,
  CountBreaker,
  BrokenCircuitError,
  BulkheadRejectedError,
  IsolatedCircuitError,
  TaskCancelledError,
  CircuitState,
  TimeoutStrategy,
  Event,
  usePolicy,
} from 'cockatiel';

// =============================================================================
// ERROR CLASSES
// =============================================================================
export {
  ErrorHandling,
  EnhancedError,
  ContextError,
  ValidationError,
  ConfigurationError,
  NetworkError,
  TimeoutError,
  ResourceError,
  CircuitBreakerWithMonitoring,
  createCircuitBreaker,
  ErrorAggregator,
  createErrorAggregator,
  createErrorChain,
} from './error-handling';
