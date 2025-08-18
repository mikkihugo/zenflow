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
import { Result, ok, err, ResultAsync, errAsync, okAsync } from 'neverthrow';
import pRetry, { AbortError } from 'p-retry';
import CircuitBreaker from 'opossum';
import { getLogger } from './logging';
const logger = getLogger('modern-error-handling');
// Re-export neverthrow types and functions
export { Result, ok, err, ResultAsync, errAsync, okAsync, AbortError };
/**
 * Enhanced error classes with context
 */
export class EnhancedError extends Error {
    context;
    timestamp;
    code;
    constructor(message, context = {}, code, options) {
        super(message, options);
        this.name = 'EnhancedError';
        this.context = context;
        this.timestamp = new Date();
        this.code = code;
    }
    /**
     * Create an enhanced error with additional context
     */
    withContext(additionalContext) {
        return new EnhancedError(this.message, { ...this.context, ...additionalContext }, this.code, { cause: this });
    }
    /**
     * Convert to plain object for serialization
     */
    toObject() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack
        };
    }
}
/**
 * Specific error types
 */
export class ValidationError extends EnhancedError {
    constructor(message, context = {}) {
        super(message, context, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
export class ConfigurationError extends EnhancedError {
    constructor(message, context = {}) {
        super(message, context, 'CONFIGURATION_ERROR');
        this.name = 'ConfigurationError';
    }
}
export class NetworkError extends EnhancedError {
    constructor(message, context = {}) {
        super(message, context, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}
export class TimeoutError extends EnhancedError {
    constructor(message, context = {}) {
        super(message, context, 'TIMEOUT_ERROR');
        this.name = 'TimeoutError';
    }
}
export class ResourceError extends EnhancedError {
    constructor(message, context = {}) {
        super(message, context, 'RESOURCE_ERROR');
        this.name = 'ResourceError';
    }
}
/**
 * Error utilities
 */
export function isError(value) {
    return value instanceof Error;
}
export function isErrorWithContext(value) {
    return value instanceof EnhancedError;
}
export function ensureError(value) {
    if (isError(value))
        return value;
    if (typeof value === 'string')
        return new Error(value);
    return new Error(String(value));
}
export function withContext(error, context) {
    const baseError = ensureError(error);
    if (isErrorWithContext(baseError)) {
        return baseError.withContext(context);
    }
    return new EnhancedError(baseError.message, context, undefined, { cause: baseError });
}
/**
 * Safe async execution with Result pattern
 */
export async function safeAsync(fn) {
    try {
        const result = await fn();
        return ok(result);
    }
    catch (error) {
        return err(ensureError(error));
    }
}
/**
 * Safe sync execution with Result pattern
 */
export function safe(fn) {
    try {
        const result = fn();
        return ok(result);
    }
    catch (error) {
        return err(ensureError(error));
    }
}
/**
 * Enhanced retry function with logging and better error handling
 */
export async function withRetry(fn, options = {}) {
    const { onFailedAttempt, shouldRetry, retryIf, abortIf, ...retryOptions } = options;
    const finalOptions = {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 30000,
        randomize: true,
        ...retryOptions,
        onFailedAttempt: (error) => {
            logger.warn(`Attempt ${error.attemptNumber} failed:`, error);
            // Custom abort logic
            if (abortIf && abortIf(error)) {
                throw new AbortError(error);
            }
            // Custom retry logic
            if (shouldRetry && !shouldRetry(error)) {
                throw new AbortError(error);
            }
            if (retryIf && !retryIf(error)) {
                throw new AbortError(error);
            }
            // Call user-provided callback
            if (onFailedAttempt) {
                const result = onFailedAttempt(error, error.attemptNumber);
                if (result instanceof Promise) {
                    return result;
                }
            }
            return Promise.resolve();
        }
    };
    try {
        const result = await pRetry(fn, finalOptions);
        return ok(result);
    }
    catch (error) {
        const enhancedError = withContext(error, {
            operation: 'retry',
            maxRetries: finalOptions.retries,
            finalAttempt: true
        });
        logger.error('Retry failed permanently:', enhancedError);
        return err(enhancedError);
    }
}
/**
 * Enhanced circuit breaker with monitoring
 */
export class ModernCircuitBreaker {
    breaker;
    name;
    constructor(action, options = {}, name = 'circuit-breaker') {
        this.name = name;
        const defaultOptions = {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            rollingCountTimeout: 10000,
            rollingCountBuckets: 10,
            ...options
        };
        this.breaker = new CircuitBreaker(action, defaultOptions);
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.breaker.on('open', () => {
            logger.warn(`Circuit breaker ${this.name} opened`);
        });
        this.breaker.on('halfOpen', () => {
            logger.info(`Circuit breaker ${this.name} half-open`);
        });
        this.breaker.on('close', () => {
            logger.info(`Circuit breaker ${this.name} closed`);
        });
        this.breaker.on('fallback', () => {
            logger.debug(`Circuit breaker ${this.name} executed fallback`);
        });
        this.breaker.on('failure', (error) => {
            logger.debug(`Circuit breaker ${this.name} recorded failure:`, error);
        });
        this.breaker.on('success', () => {
            logger.debug(`Circuit breaker ${this.name} recorded success`);
        });
        this.breaker.on('timeout', () => {
            logger.warn(`Circuit breaker ${this.name} timed out`);
        });
        this.breaker.on('reject', () => {
            logger.warn(`Circuit breaker ${this.name} rejected call`);
        });
    }
    /**
     * Execute the circuit breaker with Result pattern
     */
    async execute(...args) {
        try {
            const result = await this.breaker.fire(...args);
            return ok(result);
        }
        catch (error) {
            const enhancedError = withContext(error, {
                circuitBreaker: this.name,
                state: this.breaker.stats,
                isOpen: this.breaker.opened,
                isHalfOpen: this.breaker.halfOpen
            });
            return err(enhancedError);
        }
    }
    /**
     * Add a fallback function
     */
    fallback(fallbackFn) {
        this.breaker.fallback(fallbackFn);
        return this;
    }
    /**
     * Get circuit breaker statistics
     */
    getStats() {
        return this.breaker.stats;
    }
    /**
     * Get circuit breaker state
     */
    getState() {
        return {
            isOpen: this.breaker.opened,
            isHalfOpen: this.breaker.halfOpen,
            isClosed: this.breaker.closed,
            stats: this.breaker.stats
        };
    }
    /**
     * Reset the circuit breaker
     */
    reset() {
        this.breaker.close();
        logger.info(`Circuit breaker ${this.name} manually reset`);
    }
    /**
     * Shutdown the circuit breaker
     */
    shutdown() {
        this.breaker.shutdown();
        logger.info(`Circuit breaker ${this.name} shutdown`);
    }
}
/**
 * Create a circuit breaker with Result pattern
 */
export function createCircuitBreaker(action, options = {}, name) {
    return new ModernCircuitBreaker(action, options, name);
}
/**
 * Timeout wrapper with Result pattern
 */
export async function withTimeout(fn, timeoutMs, timeoutMessage) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(timeoutMessage || `Operation timed out after ${timeoutMs}ms`, { timeoutMs }));
        }, timeoutMs);
    });
    try {
        const result = await Promise.race([fn(), timeoutPromise]);
        return ok(result);
    }
    catch (error) {
        if (error instanceof TimeoutError) {
            return err(error);
        }
        else {
            const enhancedError = ensureError(error);
            return err(new TimeoutError(enhancedError.message, { originalError: enhancedError }));
        }
    }
}
/**
 * Execute all operations in parallel and collect results
 */
export async function executeAll(operations) {
    const results = await Promise.allSettled(operations.map(op => op()));
    const successes = [];
    const failures = [];
    for (const result of results) {
        if (result.status === 'fulfilled') {
            successes.push(result.value);
        }
        else {
            failures.push(ensureError(result.reason));
        }
    }
    if (failures.length === 0) {
        return ok(successes);
    }
    else {
        return err(failures);
    }
}
/**
 * Execute all operations and return only successful results
 */
export async function executeAllSuccessful(operations) {
    const result = await executeAll(operations);
    if (result.isOk()) {
        return ok(result.value);
    }
    else {
        // Return successful results even if some failed
        const results = await Promise.allSettled(operations.map(op => op()));
        const successes = [];
        for (const result of results) {
            if (result.status === 'fulfilled') {
                successes.push(result.value);
            }
        }
        return ok(successes);
    }
}
/**
 * Transform errors in Result chains
 */
export function transformError(result, transformer) {
    return result.mapErr(transformer);
}
/**
 * Error recovery utility
 */
export function createErrorRecovery(fallbackValue, shouldRecover) {
    return (error) => {
        if (!shouldRecover || shouldRecover(error)) {
            logger.debug('Recovering from error with fallback value:', error.message);
            return ok(fallbackValue);
        }
        return err(error);
    };
}
/**
 * Error aggregator for collecting multiple errors
 */
export class ErrorAggregator {
    errors = [];
    add(error) {
        this.errors.push(error);
        return this;
    }
    addResult(result) {
        if (result.isErr()) {
            this.errors.push(result.error);
        }
        return this;
    }
    hasErrors() {
        return this.errors.length > 0;
    }
    getErrors() {
        return [...this.errors];
    }
    getFirstError() {
        return this.errors[0] || null;
    }
    clear() {
        this.errors = [];
        return this;
    }
    toResult(value) {
        if (this.hasErrors()) {
            return err(this.getErrors());
        }
        return ok(value);
    }
    toSingleResult(value) {
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
export function createErrorAggregator() {
    return new ErrorAggregator();
}
/**
 * Utility for creating error chains
 */
export function createErrorChain(baseError, ...additionalErrors) {
    const allErrors = [baseError, ...additionalErrors];
    const messages = allErrors.map(e => e.message);
    const contexts = allErrors
        .filter(isErrorWithContext)
        .map(e => e.context)
        .reduce((acc, ctx) => ({ ...acc, ...ctx }), {});
    return new EnhancedError(messages.join(' -> '), {
        ...contexts,
        errorChain: messages,
        errorCount: allErrors.length
    }, 'ERROR_CHAIN', { cause: baseError });
}
// Export convenience functions
export const ModernErrorHandling = {
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
    isErrorWithContext
};
