/**
 * @file Main utilities module that re-exports system utility functions including logging, error handling, type guards, and various helper utilities.
 */

// Use foundation logging and error handling instead of custom implementations
export type { Logger } from '@claude-zen/foundation';
export { getLogger } from '@claude-zen/foundation';

// Use foundation error handling instead of custom error-monitoring
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
  createErrorRecovery,
  Result,
  ok,
  err,
  ResultAsync,
  errAsync,
  okAsync,
  AbortError,
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
  transformError
} from '@claude-zen/foundation';

// Still export error recovery as it might have app-specific logic
export * from './error-recovery';

// Type guards and utilities
export * from './type-guards';

// Agent analysis utilities (excluded from build due to tsconfig exclude)
// export * from './agent-gap-analysis';
