/**
 * @fileoverview Async utilities - Consolidated async patterns for claude-code-zen
 * @module utilities/async
 *
 * Provides comprehensive async utilities including retry patterns, timeouts,
 * circuit breakers, and concurrent execution helpers.
 */
import { TimeoutStrategy, timeout } from "cockatiel";
import { err, ok } from "../error-handling/index.js";
// Use cockatiel's timeout - more robust than custom implementation
export function pTimeout(promise, timeoutMs, message) {
    const policy = timeout(timeoutMs, TimeoutStrategy.Aggressive);
    return policy.execute(async () => {
        try {
            return await promise;
        }
        catch (error) {
            if (error &&
                typeof error === "object" &&
                "name" in error &&
                (error.name === "TaskCancelledError" || error.name === "TimeoutError")) {
                throw new Error(message ?? `Operation timed out after ${timeoutMs}ms`);
            }
            throw error;
        }
    });
}
/**
 * Circuit breaker implementation for handling cascading failures
 */
export class CircuitBreaker {
    fn;
    state = "closed";
    failureCount = 0;
    lastFailureTime = 0;
    config;
    constructor(fn, config = {}) {
        this.fn = fn;
        this.config = {
            failureThreshold: 5,
            resetTimeout: 60000,
            shouldTrack: () => true,
            onStateChange: () => { },
            ...config,
        };
    }
    /**
     * Execute the wrapped function with circuit breaker protection
     */
    async execute(...args) {
        if (this.state === "open") {
            if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
                this.state = "half-open";
                this.config.onStateChange(this.state);
            }
            else {
                throw new Error("Circuit breaker is open");
            }
        }
        try {
            const result = await this.fn(...args);
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    onSuccess() {
        if (this.state === "half-open") {
            this.state = "closed";
            this.failureCount = 0;
            this.config.onStateChange(this.state);
        }
    }
    onFailure(error) {
        if (this.config.shouldTrack(error)) {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            if (this.failureCount >= this.config.failureThreshold) {
                this.state = "open";
                this.config.onStateChange(this.state, error);
            }
        }
    }
    /**
     * Get current circuit breaker state
     */
    getState() {
        return this.state;
    }
    /**
     * Reset circuit breaker to closed state
     */
    reset() {
        this.state = "closed";
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.config.onStateChange(this.state);
    }
}
/**
 * Retry an async operation with exponential backoff and jitter
 *
 * @param fn - The async function to retry
 * @param config - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after max attempts
 *
 * @example
 * ```typescript`
 * const result = await withRetry(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) throw new Error('Failed to fetch');
 *     return response.json();
 *},
 *   { maxAttempts:5, baseDelay:1000}
 * );
 * ```
 */
export async function withRetry(fn, config = {}) {
    const { maxAttempts = 3, baseDelay = 1000, maxDelay = 30000, backoffMultiplier = 2, jitter = 0.1, shouldRetry = () => true, } = config;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
                throw error;
            }
            // Calculate delay with exponential backoff and jitter
            const exponentialDelay = Math.min(baseDelay * backoffMultiplier ** (attempt - 1), maxDelay);
            const jitterMultiplier = 1 + (Math.random() - 0.5) * jitter;
            const delayWithJitter = Math.round(exponentialDelay * jitterMultiplier);
            await sleep(delayWithJitter);
        }
    }
    throw lastError;
}
/**
 * Add timeout to an async operation using Result pattern
 *
 * @param promise - The promise to add timeout to
 * @param config - Timeout configuration
 * @returns Promise that resolves with Result containing success or timeout error
 *
 * @example
 * ```typescript`
 * const result = await withTimeout(
 *   fetch('/api/slow-endpoint'),
 *   { timeout:5000, message: 'API request timed out'}
 * );
 *
 * if (result.isOk()) {
 *   console.log('Success: ', result.value);
' *} else {
 *   console.log('Error: ', result.error);
' *}
 * ```
 */
export async function withTimeout(promise, config) {
    try {
        const result = await Promise.race([
            promise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(config['message'] || `Operation timed out after ${config.timeout}ms`));
                }, config.timeout);
            }),
        ]);
        return ok(result);
    }
    catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}
/**
 * Execute async operations with timeout using Result pattern
 *
 * @param fn - The async function to execute
 * @param config - Timeout configuration
 * @returns Promise that resolves with Result containing success or timeout error
 *
 * @example
 * ```typescript`
 * const result = await safeAsync(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *},
 *   { timeout:5000}
 * );
 * ```
 */
export async function safeAsync(fn, config) {
    try {
        const promise = fn();
        if (config) {
            return withTimeout(promise, config);
        }
        const result = await promise;
        return ok(result);
    }
    catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}
/**
 * Create a circuit breaker for an async function
 *
 * @param fn - The async function to wrap
 * @param config - Circuit breaker configuration
 * @returns Circuit breaker instance
 *
 * @example
 * ```typescript`
 * const apiCall = createCircuitBreaker(
 *   async (url:string) => {
 *     const response = await fetch(url);
 *     if (!response.ok) throw new Error('API failure');
 *     return response.json();
 *},
 *   { failureThreshold:3, resetTimeout:30000}
 * );
 *
 * try {
 *   const data = await apiCall.execute('/api/data');
 *} catch (error) {
 *   console.log('Circuit breaker prevented call or API failed');
 *}
 * ```
 */
export function createCircuitBreaker(fn, config) {
    return new CircuitBreaker(fn, config);
}
/**
 * Sleep for specified milliseconds
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 *
 * @example
 * ```typescript`
 * await sleep(1000); // Wait 1 second
 * ```
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Execute multiple promises concurrently with optional concurrency limit
 *
 * @param tasks - Array of functions that return promises
 * @param concurrency - Maximum number of concurrent executions (default:unlimited)
 * @returns Promise that resolves with array of results
 *
 * @example
 * ```typescript`
 * const urls = ['url1',    'url2',    'url3',    'url4',    'url5'];
 * const results = await concurrent(
 *   urls.map(url => () => fetch(url)),
 *   3 // Max 3 concurrent requests
 * );
 * ```
 */
export async function concurrent(tasks, concurrency) {
    if (!concurrency || concurrency >= tasks.length) {
        return Promise.all(tasks.map((task) => task()));
    }
    const results = [];
    let index = 0;
    async function executeNext() {
        const currentIndex = index++;
        if (currentIndex >= tasks.length)
            return;
        const task = tasks[currentIndex];
        if (!task)
            return;
        const result = await task();
        results[currentIndex] = result;
        await executeNext();
    }
    const workers = Array(concurrency)
        .fill(0)
        .map(() => executeNext());
    await Promise.all(workers);
    return results;
}
/**
 * Execute multiple promises and return results with Result pattern
 *
 * @param promises - Array of promises to execute
 * @returns Promise that resolves with array of Results
 *
 * @example
 * ```typescript`
 * const results = await allSettledSafe([
 *   fetch('/api/data1'),
 *   fetch('/api/data2'),
 *   fetch('/api/data3')
 *]);
 *
 * results.forEach((result, index) => {
 *   if (result.isOk()) {
 *     console.log(`Request ${index} succeeded:`, result.value);
 *} else {
 *     console.log(`Request ${index} failed:`, result.error);
 *}
 *});
 * ```
 */
export async function allSettledSafe(promises) {
    const settled = await Promise.allSettled(promises);
    return settled.map((result) => result.status === "fulfilled"
        ? ok(result.value)
        : err(result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason))));
}
/**
 * Debounce an async function call
 *
 * @param fn - The async function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript`
 * const debouncedSave = debounce(
 *   async (data:any) => {
 *     await saveToDatabase(data);
 *},
 *   1000
 * );
 *
 * // Multiple rapid calls will be debounced
 * debouncedSave(data1);
 * debouncedSave(data2);
 * debouncedSave(data3); // Only this call will execute after 1 second
 * ```
 */
export function debounce(fn, delay) {
    let timeoutId;
    let latestArgs;
    let promise;
    let resolve;
    let reject;
    return (...args) => {
        latestArgs = args;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (!promise) {
            promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });
        }
        timeoutId = setTimeout(async () => {
            try {
                const result = await fn(...latestArgs);
                resolve(result);
            }
            catch (error) {
                reject(error);
            }
            finally {
                promise = undefined;
                timeoutId = undefined;
            }
        }, delay);
        return promise;
    };
}
/**
 * Throttle an async function call
 *
 * @param fn - The async function to throttle
 * @param limit - Throttle limit in milliseconds
 * @returns Throttled function
 *
 * @example
 * ```typescript`
 * const throttledAPI = throttle(
 *   async (query:string) => {
 *     return fetch(`/api/search?q=${query}`);
 *},
 *   1000
 * );
 * ```
 */
export function throttle(fn, limit) {
    let lastExecution = 0;
    let timeoutId;
    return (...args) => {
        const now = Date.now();
        const timeSinceLastExecution = now - lastExecution;
        if (timeSinceLastExecution >= limit) {
            lastExecution = now;
            return fn(...args);
        }
        return new Promise((resolve, reject) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(async () => {
                lastExecution = Date.now();
                try {
                    const result = await fn(...args);
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            }, limit - timeSinceLastExecution);
        });
    };
}
