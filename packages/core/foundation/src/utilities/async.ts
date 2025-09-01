/**
 * @fileoverview Async utilities - Consolidated async patterns for claude-code-zen
 * @module utilities/async
 *
 * Provides comprehensive async utilities including retry patterns, timeouts,
 * circuit breakers, and concurrent execution helpers.
 */

import { TimeoutStrategy, timeout } from 'cockatiel';
import { err, ok, type Result } from '../error-handling/index.js';

// Use cockatiel's timeout - more robust than custom implementation
export function pTimeout<T>(
 promise: Promise<T>,
 timeoutMs: number,
 message?: string
): Promise<T> {
 const policy = timeout(timeoutMs, TimeoutStrategy.Aggressive);
 return policy.execute(async () => {
 try {
 return await promise;
 } catch (error) {
 if (
 error &&
 typeof error === 'object' &&
 'name' in error &&
 (error.name === 'TaskCancelledError' || error.name === 'TimeoutError')
 ) {
 throw new Error(message ?? `Operation timed out after ${timeoutMs}ms`);
 }
 throw error;
 }
 });
}

/**
 * Configuration for retry operations
 */
export interface RetryConfig {
 /** Maximum number of retry attempts (default:3) */
 maxAttempts?: number;
 /** Base delay between retries in milliseconds (default:1000) */
 baseDelay?: number;
 /** Maximum delay between retries in milliseconds (default:30000) */
 maxDelay?: number;
 /** Backoff multiplier for exponential backoff (default:2) */
 backoffMultiplier?: number;
 /** Jitter factor to randomize delays (0-1, default:0.1) */
 jitter?: number;
 /** Custom function to determine if an error should trigger a retry */
 shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/**
 * Configuration for timeout operations
 */
export interface TimeoutConfig {
 /** Timeout duration in milliseconds */
 timeout: number;
 /** Custom timeout message */
 message?: string;
 /** Whether to reject with TimeoutError (default:true) */
 rejectWithTimeoutError?: boolean;
}

/**
 * Configuration for circuit breaker
 */
export interface CircuitBreakerConfig {
 /** Number of failures before opening circuit (default:5) */
 failureThreshold?: number;
 /** Time to wait before attempting to close circuit in milliseconds (default:60000) */
 resetTimeout?: number;
 /** Function to determine if an error should count as a failure */
 shouldTrack?: (error: unknown) => boolean;
 /** Optional monitoring callback */
 onStateChange?: (state: CircuitBreakerState, error?: unknown) => void;
}

/**
 * Circuit breaker states
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Circuit breaker implementation for handling cascading failures
 */
export class CircuitBreaker<T extends unknown[], R> {
 private state: CircuitBreakerState = 'closed';
 private failureCount = 0;
 private lastFailureTime = 0;
 private readonly config: Required<CircuitBreakerConfig>;

 constructor(
 private readonly fn: (...args: T) => Promise<R>,
 config: CircuitBreakerConfig = {}
 ) {
 this.config = {
 failureThreshold: 5,
 resetTimeout: 60000,
 shouldTrack: () => true,
 onStateChange: () => {},
 ...config,
 };
 }

 /**
 * Execute the wrapped function with circuit breaker protection
 */
 async execute(...args: T): Promise<R> {
 if (this.state === 'open') {
 if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
 this.state = 'half-open';
 this.config.onStateChange(this.state);
 } else {
 throw new Error('Circuit breaker is open');
 }
 }

 try {
 const result = await this.fn(...args);
 this.onSuccess();
 return result;
 } catch (error) {
 this.onFailure(error);
 throw error;
 }
 }

 private onSuccess(): void {
 if (this.state === 'half-open') {
 this.state = 'closed';
 this.failureCount = 0;
 this.config.onStateChange(this.state);
 }
 }

 private onFailure(error: unknown): void {
 if (this.config.shouldTrack(error)) {
 this.failureCount++;
 this.lastFailureTime = Date.now();

 if (this.failureCount >= this.config.failureThreshold) {
 this.state = 'open';
 this.config.onStateChange(this.state, error);
 }
 }
 }

 /**
 * Get current circuit breaker state
 */
 getState(): CircuitBreakerState {
 return this.state;
 }

 /**
 * Reset circuit breaker to closed state
 */
 reset(): void {
 this.state = 'closed';
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
 * ```typescript`;
 * const result = await withRetry(
 * async () => {
 * const response = await fetch('/api/data');
 * if (!response.ok) throw new Error('Failed to fetch');
 * return response.json();
 *},
 * { maxAttempts:5, baseDelay:1000}
 * );
 * ```
 */
export async function withRetry<T>(
 fn: () => Promise<T>,
 config: RetryConfig = {}
): Promise<T> {
 const {
 maxAttempts = 3,
 baseDelay = 1000,
 maxDelay = 30000,
 backoffMultiplier = 2,
 jitter = 0.1,
 shouldRetry = () => true,
 } = config;

 let lastError: unknown;

 for (let attempt = 1; attempt <= maxAttempts; attempt++) {
 try {
 return await fn();
 } catch (error) {
 lastError = error;

 if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
 throw error;
 }

 // Calculate delay with exponential backoff and jitter
 const exponentialDelay = Math.min(
 baseDelay * backoffMultiplier ** (attempt - 1),
 maxDelay
 );

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
 * ```typescript`;
 * const result = await withTimeout(
 * fetch('/api/slow-endpoint'),
 * { timeout:5000, message: 'API request timed out'}
 * );
 *
 * if (result.isOk()) {
 * logger.info('Success: ', result.value);
' *} else {
 * logger.info('Error: ', result.error);
' *}
 * ```
 */
export async function withTimeout<T>(
 promise: Promise<T>,
 config: TimeoutConfig
): Promise<Result<T, Error>> {
 try {
 const result = await Promise.race([
 promise,
 new Promise<never>((_, reject) => {
 setTimeout(() => {
 reject(
 new Error(
 config['message'] ||
 `Operation timed out after ${config.timeout}ms`;
 )
 );
 }, config.timeout);
 }),
 ]);
 return ok(result);
 } catch (error) {
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
 * ```typescript`;
 * const result = await safeAsync(
 * async () => {
 * const response = await fetch('/api/data');
 * return response.json();
 *},
 * { timeout:5000}
 * );
 * ```
 */
export async function safeAsync<T>(
 fn: () => Promise<T>,
 config?: TimeoutConfig
): Promise<Result<T, Error>> {
 try {
 const promise = fn();

 if (config) {
 return withTimeout(promise, config);
 }

 const result = await promise;
 return ok(result);
 } catch (error) {
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
 * ```typescript`;
 * const apiCall = createCircuitBreaker(
 * async (url:string) => {
 * const response = await fetch(url);
 * if (!response.ok) throw new Error('API failure');
 * return response.json();
 *},
 * { failureThreshold:3, resetTimeout:30000}
 * );
 *
 * try {
 * const data = await apiCall.execute('/api/data');
 *} catch (error) {
 * logger.info('Circuit breaker prevented call or API failed');
 *}
 * ```
 */
export function createCircuitBreaker<T extends unknown[], R>(
 fn: (...args: T) => Promise<R>,
 config?: CircuitBreakerConfig
): CircuitBreaker<T, R> {
 return new CircuitBreaker(fn, config);
}

/**
 * Sleep for specified milliseconds
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 *
 * @example
 * ```typescript`;
 * await sleep(1000); // Wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
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
 * ```typescript`;
 * const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];
 * const results = await concurrent(
 * urls.map(url => () => fetch(url)),
 * 3 // Max 3 concurrent requests
 * );
 * ```
 */
export async function concurrent<T>(
 tasks: (() => Promise<T>)[],
 concurrency?: number
): Promise<T[]> {
 if (!concurrency || concurrency >= tasks.length) {
 return Promise.all(tasks.map((task) => task()));
 }

 const results: T[] = [];
 let index = 0;

 async function executeNext(): Promise<void> {
 const currentIndex = index++;
 if (currentIndex >= tasks.length) return;

 const task = tasks[currentIndex];
 if (!task) return;

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
 * ```typescript`;
 * const results = await allSettledSafe([
 * fetch('/api/data1'),
 * fetch('/api/data2'),
 * fetch('/api/data3')
 *]);
 *
 * results.forEach((result, index) => {
 * if (result.isOk()) {
 * logger.info(`Request ${index} succeeded:`, result.value);
 *} else {
 * logger.info(`Request ${index} failed:`, result.error);
 *}
 *});
 * ```
 */
export async function allSettledSafe<T>(
 promises: Promise<T>[]
): Promise<Result<T, Error>[]> {
 const settled = await Promise.allSettled(promises);

 return settled.map((result) =>
 result.status === 'fulfilled'
 ? ok(result.value)
 : err(
 result.reason instanceof Error
 ? result.reason
 : new Error(String(result.reason))
 )
 );
}

/**
 * Debounce an async function call
 *
 * @param fn - The async function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript`;
 * const debouncedSave = debounce(
 * async (data:any) => {
 * await saveToDatabase(data);
 *},
 * 1000
 * );
 *
 * // Multiple rapid calls will be debounced
 * debouncedSave(data1);
 * debouncedSave(data2);
 * debouncedSave(data3); // Only this call will execute after 1 second
 * ```
 */
export function debounce<T extends unknown[], R>(
 fn: (...args: T) => Promise<R>,
 delay: number
): (...args: T) => Promise<R> {
 let timeoutId: NodeJS.Timeout | undefined;
 let latestArgs: T;
 let promise: Promise<R> | undefined;
 let resolve: (value: R) => void;
 let reject: (reason?: unknown) => void;

 return (...args: T): Promise<R> => {
 latestArgs = args;

 if (timeoutId) {
 clearTimeout(timeoutId);
 }

 if (!promise) {
 promise = new Promise<R>((res, rej) => {
 resolve = res;
 reject = rej;
 });
 }

 timeoutId = setTimeout(async () => {
 try {
 const result = await fn(...latestArgs);
 resolve(result);
 } catch (error) {
 reject(error);
 } finally {
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
 * ```typescript`;
 * const throttledAPI = throttle(
 * async (query:string) => {
 * return fetch(`/api/search?q=${query}`);
 *},
 * 1000
 * );
 * ```
 */
export function throttle<T extends unknown[], R>(
 fn: (...args: T) => Promise<R>,
 limit: number
): (...args: T) => Promise<R> {
 let lastExecution = 0;
 let timeoutId: NodeJS.Timeout | undefined;

 return (...args: T): Promise<R> => {
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
 } catch (error) {
 reject(error);
 }
 }, limit - timeSinceLastExecution);
 });
 };
}
