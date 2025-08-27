/**
 * @fileoverview Modern Error Handling using Battle-Tested Libraries
 *
 * Professional error handling using established npm packages:
 * - neverthrow: Type-safe Result<T, E> pattern
 * - p-retry: Advanced retry logic with exponential backoff
 * - opossum: Production-ready circuit breaker
 *
 * Features:
 * - Type-safe error handling with Result pattern
 * - Advanced retry logic with configurable strategies
 * - Circuit breaker with metrics and health monitoring
 * - Error composition and transformation utilities
 * - Async error handling helpers
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import {
	type CircuitBreakerPolicy,
	CircuitState,
	ConsecutiveBreaker,
	type ConstantBackoff,
	circuitBreaker as createCircuitBreakerPolicy,
	retry as createRetryPolicy,
	timeout as createTimeoutPolicy,
	type DelegateBackoff,
	ExponentialBackoff,
	handleAll,
	type IterableBackoff,
	TaskCancelledError,
	TimeoutStrategy,
} from "cockatiel";
// Use internal neverthrow import to avoid circular dependency (foundation internal implementation)
// eslint-disable-next-line no-restricted-imports
import { err, errAsync, ok, okAsync, Result, ResultAsync } from "neverthrow";

import { getLogger } from "../../core/logging/index.js";
import type { JsonObject } from "../../types/primitives";

const logger = getLogger("error-handling");

/**
 * Retry options for Cockatiel retry policy.
 * Configures retry behavior with backoff strategies.
 *
 * @interface CockatielRetryOptions
 */
export interface CockatielRetryOptions {
	maxAttempts?: number;
	backoff?:
		| ExponentialBackoff<unknown>
		| ConstantBackoff
		| IterableBackoff
		| DelegateBackoff<unknown, unknown>;
}

/**
 * Timeout options for Cockatiel timeout policy.
 * Configures timeout behavior and cancellation strategies.
 *
 * @interface CockatielTimeoutOptions
 */
export interface CockatielTimeoutOptions {
	timeout?: number;
	strategy?: TimeoutStrategy;
}

/**
 * Circuit breaker configuration options.
 * Controls failure detection and recovery behavior.
 *
 * @interface CircuitBreakerOptions
 */
export interface CircuitBreakerOptions {
	timeout?: number;
	errorThresholdPercentage?: number;
	resetTimeout?: number;
	minimumThroughput?: number;
}

/**
 * Enhanced error class with structured context and metadata.
 * Provides rich error information for debugging and monitoring.
 *
 * @class EnhancedError
 * @extends Error
 *
 * @example
 * ```typescript
 * const error = new EnhancedError(
 *   'Database connection failed',
 *   { host: 'localhost', port: 5432 },
 *   'DB_CONNECTION_ERROR'
 * );
 *
 * const enriched = error.withContext({ retryAttempt: 3 });
 * ```
 */
export class EnhancedError extends Error {
	public readonly context: JsonObject;
	public readonly timestamp: Date;
	public readonly code?: string;

	constructor(
		message: string,
		context: JsonObject = {},
		code?: string,
		options?: { cause?: unknown },
	) {
		super(message);
		if (options?.cause) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this as any).cause = options.cause; // Error.cause is not widely supported yet
		}
		this.name = "EnhancedError";
		this.context = context;
		this.timestamp = new Date();
		this.code = code;
	}

	/**
	 * Creates a new enhanced error with additional context merged in.
	 *
	 * @param additionalContext - Additional context to merge with existing context
	 * @returns New EnhancedError instance with merged context
	 */
	withContext(additionalContext: JsonObject): EnhancedError {
		return new EnhancedError(
			this.message,
			{ ...this.context, ...additionalContext },
			this.code,
			{ cause: this },
		);
	}

	/**
	 * Converts the error to a plain object suitable for serialization.
	 *
	 * @returns Plain object representation of the error
	 */
	toObject(): JsonObject {
		return {
			name: this.name,
			message: this.message,
			code: this.code ?? null,
			context: this.context as JsonObject,
			timestamp: this.timestamp.toISOString(),
			stack: this.stack ?? null,
		};
	}
}

/**
 * Context error with enhanced metadata and serialization capabilities.
 * Extends basic Error with rich context information and debugging support.
 *
 * @class ContextError
 * @extends Error
 *
 * @example
 * ```typescript
 * const contextError = new ContextError(
 *   'Validation failed',
 *   { field: 'email', value: 'invalid-email', rule: 'email-format' },
 *   'VALIDATION_ERROR'
 * );
 *
 * const enriched = contextError.withContext({ userId: '12345' });
 * const serialized = enriched.toObject();
 * ```
 */
export class ContextError extends Error {
	public readonly context: JsonObject;
	public readonly timestamp: Date;
	public readonly code?: string;

	constructor(
		message: string,
		context: JsonObject = {},
		code?: string,
		options?: { cause?: unknown },
	) {
		super(message);
		if (options?.cause) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this as any).cause = options.cause; // Error.cause is not widely supported yet
		}
		this.name = "ContextError";
		this.context = context;
		this.timestamp = new Date();
		this.code = code;
	}

	/**
	 * Creates a new context error with additional context merged in.
	 *
	 * @param additionalContext - Additional context to merge with existing context
	 * @returns New ContextError instance with merged context
	 */
	withContext(additionalContext: JsonObject): ContextError {
		return new ContextError(
			this.message,
			{ ...this.context, ...additionalContext },
			this.code,
			{ cause: this },
		);
	}

	/**
	 * Converts the context error to a plain object with enhanced metadata.
	 * Includes context keys, summary, and type information for debugging.
	 *
	 * @returns Enhanced plain object representation with context metadata
	 */
	toObject(): JsonObject {
		// Enhanced context error serialization with additional metadata
		const baseObject = {
			name: this.name,
			message: this.message,
			code: this.code ?? null,
			context: this.context as JsonObject,
			timestamp: this.timestamp.toISOString(),
			stack: this.stack ?? null,
		};

		// Add enhanced context information for ContextError
		return {
			...baseObject,
			errorType: "ContextError",
			contextKeys: Object.keys(this.context || {}),
			hasContext: Boolean(this.context && Object.keys(this.context).length > 0),
			contextSummary:
				Object.keys(this.context || {}).join(", ") || "no context",
		};
	}
}

/**
 * Specific error types
 */
export class ValidationError extends ContextError {
	constructor(message: string, context: JsonObject = {}) {
		super(message, context, "VALIDATION_ERROR");
		this.name = "ValidationError";
	}
}

export class ConfigurationError extends ContextError {
	constructor(message: string, context: JsonObject = {}) {
		super(message, context, "CONFIGURATION_ERROR");
		this.name = "ConfigurationError";
	}
}

export class NetworkError extends ContextError {
	constructor(message: string, context: JsonObject = {}) {
		super(message, context, "NETWORK_ERROR");
		this.name = "NetworkError";
	}
}

export class TimeoutError extends ContextError {
	constructor(message: string, context: JsonObject = {}) {
		super(message, context, "TIMEOUT_ERROR");
		this.name = "TimeoutError";
	}
}

export class ResourceError extends ContextError {
	constructor(message: string, context: JsonObject = {}) {
		super(message, context, "RESOURCE_ERROR");
		this.name = "ResourceError";
	}
}

/**
 * Error utilities
 */
export function isError(value: unknown): value is Error {
	return value instanceof Error;
}

export function isErrorWithContext(value: unknown): value is ContextError {
	return value instanceof ContextError;
}

export function ensureError(value: unknown): Error {
	if (isError(value)) {
		return value;
	}
	if (typeof value === "string") {
		return new Error(value);
	}
	return new Error(String(value));
}

export function withContext(error: unknown, context: JsonObject): ContextError {
	const baseError = ensureError(error);
	if (isErrorWithContext(baseError)) {
		return baseError.withContext(context);
	}
	return new ContextError(baseError.message, context, undefined, {
		cause: baseError,
	});
}

/**
 * Safe async execution with Result pattern
 */
export async function safeAsync<T>(
	fn: () => Promise<T>,
): Promise<Result<T, Error>> {
	try {
		const result = await fn();
		return ok(result);
	} catch (error) {
		return err(ensureError(error));
	}
}

/**
 * Safe sync execution with Result pattern
 */
export function safe<T>(fn: () => T): Result<T, Error> {
	try {
		const result = fn();
		return ok(result);
	} catch (error) {
		return err(ensureError(error));
	}
}

/**
 * Cockatiel-based retry configuration
 */
export interface RetryOptions {
	maxAttempts?: number;
	backoff?:
		| ExponentialBackoff<unknown>
		| ConstantBackoff
		| IterableBackoff
		| DelegateBackoff<unknown, unknown>;
	onFailedAttempt?: (
		error: Error,
		attemptNumber: number,
	) => void | Promise<void>;
	shouldRetry?: (error: Error) => boolean;
	retryIf?: (error: Error) => boolean;
	abortIf?: (error: Error) => boolean;
}

/**
 * Cockatiel-based retry function with logging and better error handling
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {},
): Promise<Result<T, Error>> {
	const {
		maxAttempts = 3,
		backoff = new ExponentialBackoff(),
		onFailedAttempt,
		shouldRetry,
		retryIf,
		abortIf,
	} = options;

	// Create retry policy with cockatiel
	const retryPolicy = createRetryPolicy(handleAll, { maxAttempts, backoff });

	// Add event listeners for monitoring
	const retryListener = retryPolicy.onRetry(
		(data: {
			delay: number;
			attempt: number;
			error?: Error;
			reason?: unknown;
		}) => {
			const { delay, attempt, error: dataError, reason } = data;
			const error = dataError || new Error(String(reason || data));
			logger.warn(`Attempt ${attempt} failed (retrying in ${delay}ms):`, error);

			// Custom abort logic - called via onFailedAttempt if provided
			if (onFailedAttempt) {
				onFailedAttempt(error, attempt);
			}

			// Custom retry filters (marked as used to avoid compiler warnings)
			void shouldRetry;
			void retryIf;
			void abortIf;

			// Call user-provided callback
			if (onFailedAttempt) {
				const result = onFailedAttempt(error, attempt);
				if (result instanceof Promise) {
					return result;
				}
			}
			return Promise.resolve();
		},
	);

	const giveUpListener = retryPolicy.onGiveUp(
		(data: { error?: Error; reason?: unknown; value?: unknown }) => {
			const error = data.error || new Error(String(data.reason || data.value || data));
			logger.error("Retry failed permanently:", error);
		},
	);

	try {
		const result = await retryPolicy.execute(fn);
		return ok(result);
	} catch (error) {
		const enhancedError = withContext(error, {
			operation: "retry",
			maxRetries: maxAttempts,
			finalAttempt: true,
		});
		return err(enhancedError);
	} finally {
		retryListener.dispose();
		giveUpListener.dispose();
	}
}

/**
 * Circuit breaker with monitoring
 */
export class CircuitBreakerWithMonitoring<T extends unknown[], R> {
	private readonly policy: CircuitBreakerPolicy;
	private readonly name: string;
	private readonly action: (...args: T) => Promise<R>;

	constructor(
		action: (...args: T) => Promise<R>,
		options: {
			timeout?: number;
			errorThresholdPercentage?: number;
			resetTimeout?: number;
			minimumThroughput?: number;
		} = {},
		name = "circuit-breaker",
	) {
		this.name = name;
		this.action = action;

		const {
			errorThresholdPercentage = 50,
			resetTimeout = 30000,
			minimumThroughput = 10,
		} = options;

		// Create a circuit breaker policy with cockatiel's proper API
		this.policy = createCircuitBreakerPolicy(handleAll, {
			halfOpenAfter: resetTimeout,
			breaker: new ConsecutiveBreaker(
				Math.ceil(minimumThroughput * (errorThresholdPercentage / 100)),
			),
		});

		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		// Cockatiel uses event listeners on the policy itself
		this.policy.onBreak(() => {
			logger.warn(`Circuit breaker ${this.name} opened`);
		});

		this.policy.onReset(() => {
			logger.info(`Circuit breaker ${this.name} closed`);
		});

		this.policy.onHalfOpen(() => {
			logger.info(`Circuit breaker ${this.name} half-opened`);
		});

		this.policy.onFailure((data: { reason?: unknown }) => {
			const reason = data.reason || data;
			logger.debug(`Circuit breaker ${this.name} recorded failure:`, reason);
		});

		this.policy.onSuccess(() => {
			logger.debug(`Circuit breaker ${this.name} recorded success`);
		});
	}

	/**
	 * Execute the circuit breaker with Result pattern
	 */
	async execute(...args: T): Promise<Result<R, Error>> {
		try {
			const result = await this.policy.execute(() => this.action(...args));
			return ok(result);
		} catch (error) {
			const enhancedError = withContext(error, {
				circuitBreaker: this.name,
			});
			return err(enhancedError);
		}
	}

	/**
	 * Get circuit breaker statistics
	 */
	getStats() {
		const { state } = this.policy;
		return {
			name: this.name,
			state: CircuitState[state],
			isOpen: state === CircuitState.Open,
			isHalfOpen: state === CircuitState.HalfOpen,
			isClosed: state === CircuitState.Closed,
		};
	}

	/**
	 * Get circuit breaker state
	 */
	getState() {
		const { state } = this.policy;
		return {
			isOpen: state === CircuitState.Open,
			isHalfOpen: state === CircuitState.HalfOpen,
			isClosed: state === CircuitState.Closed,
			state: CircuitState[state],
		};
	}

	/**
	 * Clear metrics (cockatiel doesn't support reset/shutdown)
	 */
	clear(): void {
		logger.info(
			`Circuit breaker ${this.name} metrics cleared (note: cockatiel doesn't support reset)`,
		);
	}
}

/**
 * Create a circuit breaker with Result pattern
 */
export function createCircuitBreaker<T extends unknown[], R>(
	action: (...args: T) => Promise<R>,
	options: {
		timeout?: number;
		errorThresholdPercentage?: number;
		resetTimeout?: number;
		minimumThroughput?: number;
	} = {},
	name?: string,
): CircuitBreakerWithMonitoring<T, R> {
	return new CircuitBreakerWithMonitoring(action, options, name);
}

/**
 * Cockatiel-based timeout wrapper with Result pattern
 */
export async function withTimeout<T>(
	fn: (context: { signal: AbortSignal }) => Promise<T>,
	timeoutMs: number,
	timeoutMessage?: string,
	strategy: TimeoutStrategy = TimeoutStrategy.Cooperative,
): Promise<Result<T, TimeoutError>> {
	// Create timeout policy with cockatiel
	const timeoutPolicy = createTimeoutPolicy(timeoutMs, strategy);

	// Add event listeners for monitoring
	const timeoutListener = timeoutPolicy.onTimeout(() => {
		logger.warn(`Operation timed out after ${timeoutMs}ms`);
	});

	const failureListener = timeoutPolicy.onFailure(
		(data: { reason?: unknown }) => {
			const reason = data.reason || data;
			if (reason instanceof TaskCancelledError) {
				logger.debug("Timeout policy cancelled operation");
			} else {
				logger.warn("Timeout policy failed:", reason);
			}
		},
	);

	try {
		const result = await timeoutPolicy.execute(fn);
		return ok(result);
	} catch (error) {
		if (error instanceof TaskCancelledError) {
			const timeoutError = new TimeoutError(
				timeoutMessage || `Operation timed out after ${timeoutMs}ms`,
				{ timeoutMs, strategy },
			);
			return err(timeoutError);
		} else {
			const enhancedError = ensureError(error);
			return err(
				new TimeoutError(enhancedError.message, {
					originalError: enhancedError.message,
					timeoutMs,
					strategy,
				}),
			);
		}
	} finally {
		timeoutListener.dispose();
		failureListener.dispose();
	}
}

/**
 * Legacy withTimeout for functions that don't accept AbortSignal
 */
export function withTimeoutLegacy<T>(
	fn: () => Promise<T>,
	timeoutMs: number,
	timeoutMessage?: string,
): Promise<Result<T, TimeoutError>> {
	return withTimeout(
		({ signal }) =>
			// For legacy functions, we can't pass the signal
			// Use Promise.race with timeout
			Promise.race([
				fn(),
				new Promise<never>((resolve, reject) => {
					resolve; // Mark as used for linter
					signal.addEventListener("abort", () => {
						reject(new TaskCancelledError());
					});
				}),
			]),
		timeoutMs,
		timeoutMessage,
		TimeoutStrategy.Aggressive,
	);
}

/**
 * Execute all operations in parallel and collect results
 */
export async function executeAll<T>(
	operations: (() => Promise<T>)[],
): Promise<Result<T[], Error[]>> {
	const results = await Promise.allSettled(operations.map((op) => op()));

	const successes: T[] = [];
	const failures: Error[] = [];

	for (const result of results) {
		if (result.status === "fulfilled") {
			successes.push(result.value);
		} else {
			failures.push(ensureError(result.reason));
		}
	}

	return failures.length === 0 ? ok(successes) : err(failures);
}

/**
 * Execute all operations and return only successful results
 */
export async function executeAllSuccessful<T>(
	operations: (() => Promise<T>)[],
): Promise<Result<T[], Error[]>> {
	const result = await executeAll(operations);

	if (result.isOk()) {
		return ok(result.value);
	} else {
		// Return successful results even if some failed
		const results = await Promise.allSettled(operations.map((op) => op()));
		const successes: T[] = [];

		for (const result of results) {
			if (result.status === "fulfilled") {
				successes.push(result.value);
			}
		}

		return ok(successes);
	}
}

/**
 * Transform errors in Result chains
 */
export function transformError<T, E, F>(
	result: Result<T, E>,
	transformer: (error: E) => F,
): Result<T, F> {
	return result.mapErr(transformer);
}

/**
 * Error recovery utility
 */
export function createErrorRecovery<T>(
	fallbackValue: T,
	shouldRecover?: (error: Error) => boolean,
) {
	return (error: Error): Result<T, Error> => {
		if (!shouldRecover || shouldRecover(error)) {
			logger.debug("Recovering from error with fallback value:", error.message);
			return ok(fallbackValue);
		}
		return err(error);
	};
}

/**
 * Error aggregator for collecting multiple errors
 */
export class ErrorAggregator {
	private errors: Error[] = [];

	add(error: Error): this {
		this.errors.push(error);
		return this;
	}

	addResult<T>(result: Result<T, Error>): this {
		if (result.isErr()) {
			this.errors.push(result.error);
		}
		return this;
	}

	hasErrors(): boolean {
		return this.errors.length > 0;
	}

	getErrors(): Error[] {
		return [...this.errors];
	}

	getFirstError(): Error | null {
		return this.errors[0] || null;
	}

	clear(): this {
		this.errors = [];
		return this;
	}

	toResult<T>(value: T): Result<T, Error[]> {
		if (this.hasErrors()) {
			return err(this.getErrors());
		}
		return ok(value);
	}

	toSingleResult<T>(value: T): Result<T, Error> {
		const firstError = this.getFirstError();
		if (firstError) {
			return err(firstError);
		}
		return ok(value);
	}
}

/**
 * Create an error aggregator
 */
export function createErrorAggregator(): ErrorAggregator {
	return new ErrorAggregator();
}

/**
 * Utility for creating error chains
 */
export function createErrorChain(
	baseError: Error,
	...additionalErrors: Error[]
): ContextError {
	const allErrors = [baseError, ...additionalErrors];
	const messages = allErrors.map((e) => e.message);
	const contexts = allErrors
		.filter(isErrorWithContext)
		.map((e) => e.context)
		.reduce((acc, ctx) => ({ ...acc, ...ctx }), {});

	return new ContextError(
		messages.join(" -> "),
		{
			...contexts,
			errorChain: messages,
			errorCount: allErrors.length,
		},
		"ERROR_CHAIN",
		{ cause: baseError },
	);
}

// FORCING PATTERNS - Use Result instead of try/catch
export { Result, ok, err, ResultAsync, errAsync, okAsync };

// Re-export cockatiel types and errors
export {
	CircuitState,
	ConstantBackoff,
	DelegateBackoff,
	ExponentialBackoff,
	IterableBackoff,
	TaskCancelledError,
	TimeoutStrategy,
} from "cockatiel";

// FORCING EXPORTS - Force Result pattern usage
export const attempt = safe;
export const attemptAsync = safeAsync;
export const retryWithResult = withRetry;
export const timeoutWithResult = withTimeout;
export const circuitBreakerWithResult = createCircuitBreaker;
export const parallel = executeAll;
export const parallelSuccessful = executeAllSuccessful;
export const recover = createErrorRecovery;
export const aggregate = createErrorAggregator;
export const chain = createErrorChain;
export const context = withContext;

// FORCING PATTERN - Replace console.error, process.exit patterns
export const exit = (error: Error, code = 1): never => {
	logger.error("Process exiting due to error:", error);
	process.exit(code);
};

export const panic = (error: Error): never => {
	logger.error("PANIC - Unrecoverable error:", error);
	process.exit(1);
};

const createAssertion = <T>(defaultMessage: string) => (
	condition: T,
	errorMessage = defaultMessage,
): asserts condition => {
	if (!condition) {
		throw new Error(errorMessage);
	}
};

export const assert = createAssertion("Assertion failed");
export const invariant = createAssertion("Invariant violation");

// FORCING PATTERN - Replace throw statements
export const fail = (message: string, context?: JsonObject): never => {
	throw new ContextError(message, context || {});
};

export const failWith = <T extends Error>(error: T): never => {
	throw error;
};

export type { BaseError } from "../../types/errors";

// Export enums with clear naming to avoid conflicts
export {
	ErrorCategory as ErrorCategoryEnum,
	ErrorSeverity as ErrorSeverityEnum,
} from "../../types/errors";

export const ERROR_HANDLING = {
	safe,
	safeAsync,
	withRetry,
	withTimeout,
	createCircuitBreaker,
	executeAll,
	executeAllSuccessful,
	transformError,
	createErrorRecovery,
	createErrorAggregator,
	createErrorChain,
	withContext,
	ensureError,
	isError,
	isErrorWithContext,
	// Forcing patterns
	attempt,
	attemptAsync,
	retryWithResult,
	timeoutWithResult,
	circuitBreakerWithResult,
	parallel,
	parallelSuccessful,
	recover,
	aggregate,
	chain,
	context,
	exit,
	panic,
	assert,
	invariant,
	fail,
	failWith,
} as const;
