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
export type { Config } from './core/config/index.js';
export { EnvironmentDetector, getConfig, isDevelopment, isProduction, isTest, getEnv, requireEnv, validateConfig, reloadConfig, isDebugMode as isDebug, shouldLog, configHelpers, } from './core/config/index.js';
export { ProcessLifecycleManager, setupProcessLifecycle, } from './core/lifecycle/index.js';
export type { Logger } from './core/logging/index.js';
export { getLogger, LoggingLevel as LogLevel, getLogEntries, setLogBroadcaster, clearLogBroadcaster, } from './core/logging/index.js';
export { createContainer, inject, TOKENS, } from './dependency-injection/index.js';
export type { Container, ContainerStats, ServiceInfo, } from './dependency-injection/index.js';
export { ConfigurationError, createCircuitBreaker, err, isError, NetworkError, ok, ResourceError, Result, safeAsync, TimeoutError, ValidationError, withRetry, withTimeout, } from './error-handling/index.js';
export { EventEmitter } from './events/event-emitter.js';
export type { EventMap, EventArgs } from './events/event-emitter.js';
export { EventBus } from './events/event-bus.js';
export type { EventBusConfig, EventListener, EventMetrics, EventContext, EventMiddleware, } from './events/event-bus.js';
export type { Event as EventBusEvent } from './events/event-bus.js';
export { EventLogger, logEvent, logFlow, logError, } from './events/event-logger.js';
export { EVENT_CATALOG, isValidEventName, getEventType, getAllEventNames, getEventsByCategory, CatalogEventLogger, } from './events/event-catalog.js';
export { eventRegistryInitializer } from './events/event-registry-initializer.js';
export type { BaseEvent, EventPayload, EventName, SPARCPhaseReviewEvent, SPARCProjectCompleteEvent, SPARCPhaseCompleteEvent, LLMInferenceRequestEvent, LLMInferenceCompleteEvent, LLMInferenceFailedEvent, ClaudeCodeExecuteTaskEvent, ClaudeCodeTaskCompleteEvent, ClaudeCodeTaskFailedEvent, TeamworkReviewAcknowledgedEvent, TeamworkReviewCompleteEvent, TeamworkCollaborationFailedEvent, SafePIPlanningEvent, SafeEpicEvent, GitOperationStartedEvent, GitOperationCompletedEvent, GitOperationFailedEvent, GitConflictResolvedEvent, GitWorktreeEvent, GitMaintenanceEvent, SystemStartEvent, SystemErrorEvent, } from './events/event-catalog.js';
export type { AnyFunction, AsyncOrSync, DeepPartial, DeepReadonly, DeepRequired, Dictionary, Email, Entity, Environment, ErrorResult, Identifiable, ISODateString, JsonArray, JsonObject, JsonPrimitive, JsonValue, LogLevel as LogLevelType, MarkOptional, MarkRequired, NonEmptyArray, Paginated, PaginationOptions, Primitive, Priority, Result as ResultType, Status, StrictOmit, SuccessResult, Timestamp, Timestamped, UnknownRecord, UUID, ValueOf, } from './types/index.js';
export { facadeStatusManager, getSystemStatus, hasService, registerFacade, } from './infrastructure/facades/index.js';
export { databaseFacade, createDatabaseAdapter, createKeyValueStore, createVectorStore, createGraphStore, getDatabaseCapability, } from './infrastructure/database/index.js';
export type { DatabaseConfig, DatabaseConnection, DatabaseAdapter, KeyValueStore, VectorStore, GraphStore, SqlStorage, HealthStatus, QueryResult, QueryParams, DatabaseType, StorageType, } from './infrastructure/database/index.js';
export type { CircuitBreakerOptions, RetryOptions } from './resilience.js';
export { BrokenCircuitError, BulkheadRejectedError, bulkhead, CircuitState, ConsecutiveBreaker, ConstantBackoff, CountBreaker, circuitBreaker, DelegateBackoff, decorrelatedJitterGenerator, Event, ExponentialBackoff, fallback, handleAll, handleResultType, handleType, handleWhen, handleWhenResult, IsolatedCircuitError, IterableBackoff, noJitterGenerator, noop, Policy, retry, SamplingBreaker, TaskCancelledError, TimeoutStrategy, timeout, usePolicy, wrap, } from './resilience.js';
export { createValidator, emailSchema, getValidationErrors, hasValidationError, isEmail, isISODateString, isNonEmptyArray, isPrimitive, isTimestamp, isURL, isUUID, isValidJSON, nonEmptyStringSchema, positiveNumberSchema, urlSchema, uuidSchema, validateInput, z, } from './utilities/validation.js';
export { concurrent, pTimeout, withRetry as retryAsync, withTimeout as timeoutPromise, } from './utilities/async.js';
export { _, addDays, customAlphabet, dateFns, format, lodash, nanoid, } from './utilities/common/index.js';
export { generateApiKey, generateCustomId, generateSessionId, generateShortId, generateTimestampId, generateUUID, } from './utilities/ids.js';
export { checkSystemRequirements, createSystemSummary, getArchitecture, getEnvironment, getPlatform, getProcessInfo, getSystemInfo, getWorkspaceDetector, isCI, isDocker, isLinux, isMacOS, isWindows, isWSL, } from './utilities/system.js';
export { dateFromTimestamp, formatTimestamp, isoStringFromTimestamp, now, parseISO, timestampFromDate, } from './utilities/time.js';
//# sourceMappingURL=index.d.ts.map