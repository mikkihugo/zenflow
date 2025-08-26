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

export type { Config } from "./core/config";
// Core configuration and environment
export { EnvironmentDetector, getConfig } from "./core/config";
// Process lifecycle management
export {
	ProcessLifecycleManager,
	setupProcessLifecycle,
} from "./core/lifecycle";
export type { Logger } from "./core/logging";
// Core logging system
export { getLogger, LoggingLevel as LogLevel } from "./core/logging";

// DEPENDENCY INJECTION - Service container and patterns
// =============================================================================
export { createContainer, inject, TOKENS } from "./dependency-injection";
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
} from "./error-handling";
// EVENT SYSTEM - Type-safe event management
// =============================================================================
export { default as EventEmitter } from "./events/typed.event.base";
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
} from "./types";

// UTILITIES - Comprehensive utility functions
// =============================================================================

// INFRASTRUCTURE - Facade system and infrastructure utilities
// =============================================================================
export {
	FacadeStatusManager,
	getSystemStatus,
	hasService,
	registerFacade,
} from "./infrastructure/facades";
// Export resilience types
export type { CircuitBreakerOptions, RetryOptions } from "./resilience";
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
} from "./resilience";
// Validation and schema utilities
export {
	createValidator,
	EmailSchema,
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
	NonEmptyStringSchema,
	PositiveNumberSchema,
	URLSchema,
	UUIDSchema,
	validateInput,
	z,
} from "./utilities";
// Async utilities and patterns
export {
	concurrent,
	pTimeout,
	withRetry as retryAsync,
	withTimeout as timeoutPromise,
} from "./utilities/async";

// Common utilities (lodash-style functions)
export {
	_,
	addDays,
	customAlphabet,
	dateFns,
	format,
	lodash,
	nanoid,
} from "./utilities/common";
// ID generation utilities
export {
	generateApiKey,
	generateCustomId,
	generateSessionId,
	generateShortId,
	generateTimestampId,
	generateUUID,
} from "./utilities/ids";
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
	isDevelopment,
	isDocker,
	isLinux,
	isMacOS,
	isProduction,
	isTest,
	isWindows,
	isWSL,
} from "./utilities/system";
// Time utilities
export {
	dateFromTimestamp,
	formatTimestamp,
	isoStringFromTimestamp,
	now,
	parseISO,
	timestampFromDate,
} from "./utilities/time";

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
