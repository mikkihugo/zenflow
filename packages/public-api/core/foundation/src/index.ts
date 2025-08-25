/**
 * @fileoverview Foundation Package - Minimal Tree-Shakable Entry Point
 *
 * **🌳 TREE-SHAKING OPTIMIZED ENTRY POINT**
 *
 * This is the minimal entry point that imports only essential foundation utilities.
 * For better tree-shaking and smaller bundles, import from specific entry points:
 *
 * @example Tree-Shakable Imports (Recommended)
 * ```typescript
 * // Import only what you need for optimal bundle size:
 * import { getLogger } from '@claude-zen/foundation/core';
 * import { Result, ok, err } from '@claude-zen/foundation/resilience';
 * import { createContainer } from '@claude-zen/foundation/di';
 * import { _, nanoid } from '@claude-zen/foundation/utils';
 * ```
 *
 * @example Full Import (Not Recommended for Production)
 * ```typescript
 * // This imports everything (larger bundle):
 * import { getLogger, Result, createContainer } from '@claude-zen/foundation';
 * ```
 */

// =============================================================================
// COMPREHENSIVE FOUNDATION EXPORTS - All available utilities
// =============================================================================

// CORE MODULES - Essential system functionality
// =============================================================================

// Core logging system
export { getLogger, LoggingLevel as LogLevel } from './core/logging';
export type { Logger } from './core/logging';

// Core configuration and environment
export { getConfig, EnvironmentDetector } from './core/config';
export type { Config } from './core/config';

// Process lifecycle management
export {
  ProcessLifecycleManager,
  setupProcessLifecycle,
} from './core/lifecycle';

// DEPENDENCY INJECTION - Service container and patterns
// =============================================================================
export { createContainer, inject, TOKENS } from './dependency-injection';

// EVENT SYSTEM - Type-safe event management
// =============================================================================
export { default as EventEmitter } from './events/typed.event.base';

// ERROR HANDLING AND RESILIENCE - Comprehensive error management
// =============================================================================
export {
  Result,
  ok,
  err,
  safeAsync,
  withRetry,
  withTimeout,
  createCircuitBreaker,
  ValidationError,
  NetworkError,
  ResourceError,
  ConfigurationError,
  TimeoutError,
  isError,
} from './error-handling';

// TYPE SYSTEM - All types and type utilities
// =============================================================================
export type {
  UUID,
  JsonValue,
  JsonObject,
  JsonArray,
  JsonPrimitive,
  UnknownRecord,
  Timestamp,
  ISODateString,
  Email,
  NonEmptyArray,
  LogLevel as LogLevelType,
  Environment,
  Priority,
  Status,
  Result as ResultType,
  SuccessResult,
  ErrorResult,
  Entity,
  Identifiable,
  Timestamped,
  Paginated,
  PaginationOptions,
} from './types';

// Type utilities and advanced types
export type {
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  MarkOptional,
  MarkRequired,
  StrictOmit,
  ValueOf,
  Dictionary,
  AnyFunction,
  AsyncOrSync,
  Primitive,
} from './types';

// UTILITIES - Comprehensive utility functions
// =============================================================================

// Validation and schema utilities
export {
  validateInput,
  createValidator,
  z,
  isEmail,
  isURL,
  isUUID,
  isTimestamp,
  isISODateString,
  isPrimitive,
  isNonEmptyArray,
  isValidJSON,
  UUIDSchema,
  EmailSchema,
  URLSchema,
  NonEmptyStringSchema,
  PositiveNumberSchema,
  hasValidationError,
  getValidationErrors,
} from './utilities';

// Async utilities and patterns
export {
  pTimeout,
  withRetry as retryAsync,
  concurrent,
  withTimeout as timeoutPromise,
} from './utilities/async';

// System detection and information
export {
  isDevelopment,
  isProduction,
  isTest,
  getEnvironment,
  getSystemInfo,
  getProcessInfo,
  getPlatform,
  getArchitecture,
  isWindows,
  isMacOS,
  isLinux,
  isCI,
  isDocker,
  isWSL,
  getWorkspaceDetector,
  createSystemSummary,
  checkSystemRequirements,
} from './utilities/system';

// ID generation utilities
export {
  generateUUID,
  generateShortId,
  generateCustomId,
  generateTimestampId,
  generateSessionId,
  generateApiKey,
} from './utilities/ids';

// Time utilities
export {
  now,
  timestampFromDate,
  dateFromTimestamp,
  isoStringFromTimestamp,
  formatTimestamp,
  parseISO,
} from './utilities/time';

// Common utilities (lodash-style functions)
export {
  _,
  lodash,
  dateFns,
  format,
  addDays,
  nanoid,
  customAlphabet,
} from './utilities/common';

// INFRASTRUCTURE - Facade system and infrastructure utilities
// =============================================================================
export {
  registerFacade,
  hasService,
  getSystemStatus,
  FacadeStatusManager,
} from './infrastructure/facades';

// RESILIENCE PATTERNS - Advanced resilience utilities (using cockatiel)
// =============================================================================
export {
  // Re-export cockatiel patterns for resilience
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
} from './resilience';

// Export resilience types
export type { RetryOptions, CircuitBreakerOptions } from './resilience';

// =============================================================================
// TREE-SHAKING GUIDANCE COMMENTS
// =============================================================================

/*
🌳 TREE-SHAKING OPTIMIZATION GUIDE:

For smaller bundles, import from specific entry points:

CORE UTILITIES (essential, lightweight):
  import { getLogger, getConfig } from '@claude-zen/foundation/core';

DEPENDENCY INJECTION (when you need DI):
  import { createContainer } from '@claude-zen/foundation/di';

RESILIENCE PATTERNS (error handling, circuit breakers):
  import { Result, ok, err, withRetry } from '@claude-zen/foundation/resilience';

UTILITIES (validation, dates, file ops):
  import { z, validateInput, _ } from '@claude-zen/foundation/utils';

TYPES ONLY (zero runtime cost):
  import type { UUID, Logger, Config } from '@claude-zen/foundation/types';

For complete functionality, use specific entry points:
  import { createContainer } from '@claude-zen/foundation/di';
  import { withRetry, createCircuitBreaker } from '@claude-zen/foundation/resilience';
*/
