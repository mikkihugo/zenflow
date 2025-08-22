/**
 * @file Main utilities module that re-exports system utility functions including logging, error handling, type guards, and various helper utilities0.
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
  transformError,
} from '@claude-zen/foundation';

// Use foundation error recovery system - comprehensive error recovery framework
export {
  ErrorRecoverySystem,
  createErrorRecovery,
  createErrorRecoveryWithCommonStrategies,
  createCommonRecoveryStrategies,
  type RecoveryStrategy,
  type RecoveryAction,
  type ErrorInfo,
  type RecoveryResult,
  type RecoveryActionResult,
  type ErrorRecoveryConfig,
} from '@claude-zen/foundation';

// Type guards from foundation - comprehensive type safety utilities
export {
  type APIError,
  type APIResult,
  type APISuccess,
  isAPIError,
  isAPISuccess,
  extractErrorMessage,
  type Result as FoundationResult,
  type Success,
  type Failure,
  isSuccess,
  isFailure,
} from '@claude-zen/foundation';

// Agent analysis utilities (excluded from build due to tsconfig exclude)
// export * from '0./agent-gap-analysis';
