/**
 * @fileoverview Foundation Package - Minimal Tree-Shakable Entry Point
 *
 * ** TREE-SHAKING OPTIMIZED ENTRY POINT**
 *
 * This is the minimal entry point that imports only essential foundation utilities.
 * For better tree-shaking and smaller bundles, import from specific entry points:
 *
 * @example Tree-Shakable Imports (Recommended)
 * '''typescript'
 * // Import only what you need for optimal bundle size:
 * import { getLogger} from '@claude-zen/foundation/core';
 * import { Result, ok, err} from '@claude-zen/foundation/resilience';
 * import { createContainer} from '@claude-zen/foundation/di';
 * import { _, nanoid} from '@claude-zen/foundation/utils';
 * '
 *
 * @example Full Import (Not Recommended for Production)
 * '''typescript'
 * // This imports everything (larger bundle):
 * import { getLogger, Result, createContainer} from '@claude-zen/foundation';
 * '
 */

// =============================================================================
// COMPREHENSIVE FOUNDATION EXPORTS - All available utilities
// =============================================================================

// CORE MODULES - Essential system functionality
// =============================================================================

export type { Config } from './core/config/index.js';
// Core configuration and environment
export {
  EnvironmentDetector,
  getConfig,
  // Environment detection utilities
  isDevelopment,
  isProduction,
  isTest,
  // Environment variable helpers
  getEnv,
  requireEnv,
  // Configuration management
  validateConfig,
  reloadConfig,
  // Development utilities
  isDebugMode as isDebug,
  shouldLog,
  // Complete config helpers object
  configHelpers,
} from './core/config/index.js';
// Process lifecycle management
export {
  ProcessLifecycleManager,
  setupProcessLifecycle,
} from './core/lifecycle/index.js';
export type { Logger } from './core/logging/index.js';
// Core logging system
export {
  getLogger,
  LoggingLevel as LogLevel,
  getLogEntries,
  setLogBroadcaster,
  clearLogBroadcaster,
} from './core/logging/index.js';

// DEPENDENCY INJECTION - Service container and patterns
// =============================================================================
export {
  createContainer,
  inject,
  TOKENS,
} from './dependency-injection/index.js';
export type {
  Container,
  ContainerStats,
  ServiceInfo,
} from './dependency-injection/index.js';
// ERROR HANDLING AND RESILIENCE - Comprehensive error management
// =============================================================================
export {
  ConfigurationError,
  createCircuitBreaker,
  err,
  isError,
  NetworkError,
  ok,
  ResourceError,
  Result,
  safeAsync,
  TimeoutError,
  ValidationError,
  withRetry,
  withTimeout,
} from './error-handling/index.js';
// EVENT SYSTEM - Complete event system with EventEmitter and EventBus
// =============================================================================
export { EventEmitter } from './events/event-emitter.js';
export type { EventMap, EventArgs } from './events/event-emitter.js';

// Modern event bus with full TypeScript generics
export { EventBus } from './events/event-bus.js';
export type {
  EventBusConfig,
  EventListener,
  EventMetrics,
  EventContext,
  EventMiddleware,
} from './events/event-bus.js';
export type { Event as EventBusEvent } from './events/event-bus.js';

// Development event logger
export {
  EventLogger,
  logEvent,
  logFlow,
  logError,
} from './events/event-logger.js';

// Event catalog and validation
export {
  EVENT_CATALOG,
  isValidEventName,
  getEventType,
  getAllEventNames,
  getEventsByCategory,
  CatalogEventLogger,
} from './events/event-catalog.js';

// Event registry initializer
export { eventRegistryInitializer } from './events/event-registry-initializer.js';
export type {
  BaseEvent,
  EventPayload,
  EventName,
  // SPARC Events
  SPARCPhaseReviewEvent,
  SPARCProjectCompleteEvent,
  SPARCPhaseCompleteEvent,
  // LLM Events
  LLMInferenceRequestEvent,
  LLMInferenceCompleteEvent,
  LLMInferenceFailedEvent,
  // Claude Code Events
  ClaudeCodeExecuteTaskEvent,
  ClaudeCodeTaskCompleteEvent,
  ClaudeCodeTaskFailedEvent,
  // Teamwork Events
  TeamworkReviewAcknowledgedEvent,
  TeamworkReviewCompleteEvent,
  TeamworkCollaborationFailedEvent,
  // SAFe Events
  SafePIPlanningEvent,
  SafeEpicEvent,
  // Git Operations Events
  GitOperationStartedEvent,
  GitOperationCompletedEvent,
  GitOperationFailedEvent,
  GitConflictResolvedEvent,
  GitWorktreeEvent,
  GitMaintenanceEvent,
  // System Events
  SystemStartEvent,
  SystemErrorEvent,
} from './events/event-catalog.js';
// TYPE SYSTEM - All types and type utilities
// =============================================================================
// Type utilities and advanced types
export type {
  AnyFunction,
  AsyncOrSync,
  DeepPartial,
  DeepReadonly,
  DeepRequired,
  Dictionary,
  Email,
  Entity,
  Environment,
  ErrorResult,
  Identifiable,
  ISODateString,
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  LogLevel as LogLevelType,
  MarkOptional,
  MarkRequired,
  NonEmptyArray,
  Paginated,
  PaginationOptions,
  Primitive,
  Priority,
  Result as ResultType,
  Status,
  StrictOmit,
  SuccessResult,
  Timestamp,
  Timestamped,
  UnknownRecord,
  UUID,
  ValueOf,
} from './types/index.js';

// UTILITIES - Comprehensive utility functions
// =============================================================================

// INFRASTRUCTURE - Facade system and infrastructure utilities
// =============================================================================
export {
  facadeStatusManager,
  getSystemStatus,
  hasService,
  registerFacade,
} from './infrastructure/facades/index.js';

// DATABASE ACCESS - Backend-agnostic database interfaces
// =============================================================================
export {
  databaseFacade,
  createDatabaseAdapter,
  createKeyValueStore,
  createVectorStore,
  createGraphStore,
  getDatabaseCapability,
} from './infrastructure/database/index.js';
export type {
  DatabaseConfig,
  DatabaseConnection,
  DatabaseAdapter,
  KeyValueStore,
  VectorStore,
  GraphStore,
  SqlStorage,
  HealthStatus,
  QueryResult,
  QueryParams,
  DatabaseType,
  StorageType,
} from './infrastructure/database/index.js';
// Export resilience types
export type { CircuitBreakerOptions, RetryOptions } from './resilience.js';
// RESILIENCE PATTERNS - Advanced resilience utilities (using cockatiel)
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
  // Re-export cockatiel patterns for resilience
  retry,
  SamplingBreaker,
  TaskCancelledError,
  TimeoutStrategy,
  timeout,
  usePolicy,
  wrap,
} from './resilience.js';
// Validation and schema utilities
export {
  createValidator,
  emailSchema,
  getValidationErrors,
  hasValidationError,
  isEmail,
  isISODateString,
  isNonEmptyArray,
  isPrimitive,
  isTimestamp,
  isURL,
  isUUID,
  isValidJSON,
  nonEmptyStringSchema,
  positiveNumberSchema,
  urlSchema,
  uuidSchema,
  validateInput,
  z,
} from './utilities/validation.js';
// Async utilities and patterns
export {
  concurrent,
  pTimeout,
  withRetry as retryAsync,
  withTimeout as timeoutPromise,
} from './utilities/async.js';

// Common utilities (lodash-style functions)
export {
  _,
  addDays,
  customAlphabet,
  dateFns,
  format,
  lodash,
  nanoid,
} from './utilities/common/index.js';
// ID generation utilities
export {
  generateApiKey,
  generateCustomId,
  generateSessionId,
  generateShortId,
  generateTimestampId,
  generateUUID,
} from './utilities/ids.js';
// System detection and information
export {
  checkSystemRequirements,
  createSystemSummary,
  getArchitecture,
  getEnvironment,
  getPlatform,
  getProcessInfo,
  getSystemInfo,
  getWorkspaceDetector,
  isCI,
  isDocker,
  isLinux,
  isMacOS,
  isWindows,
  isWSL,
} from './utilities/system.js';
// Time utilities
export {
  dateFromTimestamp,
  formatTimestamp,
  isoStringFromTimestamp,
  now,
  parseISO,
  timestampFromDate,
} from './utilities/time.js';
// Type utilities and branding functions
export {
  brand,
  unbrand,
} from './types/primitives.js';

// =============================================================================
// TREE-SHAKING GUIDANCE COMMENTS
// =============================================================================

/*
 TREE-SHAKING OPTIMIZATION GUIDE:

For smaller bundles, import from specific entry points:

CORE UTILITIES (essential, lightweight):
  import { getLogger, getConfig} from '@claude-zen/foundation/core';

DEPENDENCY INJECTION (when you need DI):
  import { createContainer} from '@claude-zen/foundation/di';

RESILIENCE PATTERNS (error handling, circuit breakers):
  import { Result, ok, err, withRetry} from '@claude-zen/foundation/resilience';

UTILITIES (validation, dates, file ops):
  import { z, validateInput, _} from '@claude-zen/foundation/utils';

TYPES ONLY (zero runtime cost):
  import type { UUID, Logger, Config} from '@claude-zen/foundation/types';

For complete functionality, use specific entry points:
  import { createContainer} from '@claude-zen/foundation/di';
  import { withRetry, createCircuitBreaker} from '@claude-zen/foundation/resilience';
*/
