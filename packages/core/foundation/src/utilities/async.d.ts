/**
 * @fileoverview Async utilities - Consolidated async patterns for claude-code-zen
 * @module utilities/async
 *
 * Provides comprehensive async utilities including retry patterns, timeouts,
 * circuit breakers, and concurrent execution helpers.
 */
import { type Result } from '../error-handling/index.js';
export declare function pTimeout<T>(promise: Promise<T>, timeoutMs: number, message?: string): Promise<T>;
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
export declare class CircuitBreaker<T extends unknown[], R> {
    private readonly fn;
    private state;
    private failureCount;
    private lastFailureTime;
    private readonly config;
    constructor(fn: (...args: T) => Promise<R>, config?: CircuitBreakerConfig);
    /**
     * Execute the wrapped function with circuit breaker protection
     */
    execute(...args: T): Promise<R>;
    private onSuccess;
    private onFailure;
    /**
     * Get current circuit breaker state
     */
    getState(): CircuitBreakerState;
    /**
     * Reset circuit breaker to closed state
     */
    reset(): void;
}
/**
 * Retry an async operation with exponential backoff and jitter
 *
 * @param fn - The async function to retry
 * @param config - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after max attempts
 *
 * @example
 * '''typescript'
 * const result = await withRetry(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) throw new Error('Failed to fetch');
 *     return response.json();
 *},
 *   { maxAttempts:5, baseDelay:1000}
 * );
 * '
 */
export declare function withRetry<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T>;
/**
 * Add timeout to an async operation using Result pattern
 *
 * @param promise - The promise to add timeout to
 * @param config - Timeout configuration
 * @returns Promise that resolves with Result containing success or timeout error
 *
 * @example
 * '''typescript'
 * const result = await withTimeout(
 *   fetch('/api/slow-endpoint'),
 *   { timeout:5000, message: 'API request timed out'}
 * );
 *
 * if (result.isOk()) {
 *   logger.info('Success: ', result.value);
' *} else {
 *   logger.info('Error: ', result.error);
' *}
 * '
 */
export declare function withTimeout<T>(promise: Promise<T>, config: TimeoutConfig): Promise<Result<T, Error>>;
/**
 * Execute async operations with timeout using Result pattern
 *
 * @param fn - The async function to execute
 * @param config - Timeout configuration
 * @returns Promise that resolves with Result containing success or timeout error
 *
 * @example
 * '''typescript'
 * const result = await safeAsync(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *},
 *   { timeout:5000}
 * );
 * '
 */
export declare function safeAsync<T>(fn: () => Promise<T>, config?: TimeoutConfig): Promise<Result<T, Error>>;
/**
 * Create a circuit breaker for an async function
 *
 * @param fn - The async function to wrap
 * @param config - Circuit breaker configuration
 * @returns Circuit breaker instance
 *
 * @example
 * '''typescript'
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
 *   logger.info('Circuit breaker prevented call or API failed');
 *}
 * '
 */
export declare function createCircuitBreaker<T extends unknown[], R>(fn: (...args: T) => Promise<R>, config?: CircuitBreakerConfig): CircuitBreaker<T, R>;
/**
 * Sleep for specified milliseconds
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 *
 * @example
 * '''typescript'
 * await sleep(1000); // Wait 1 second
 * '
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Execute multiple promises concurrently with optional concurrency limit
 *
 * @param tasks - Array of functions that return promises
 * @param concurrency - Maximum number of concurrent executions (default:unlimited)
 * @returns Promise that resolves with array of results
 *
 * @example
 * '''typescript'
 * const urls = ['url1',    'url2',    'url3',    'url4',    'url5'];
 * const results = await concurrent(
 *   urls.map(url => () => fetch(url)),
 *   3 // Max 3 concurrent requests
 * );
 * '
 */
export declare function concurrent<T>(tasks: (() => Promise<T>)[], concurrency?: number): Promise<T[]>;
/**
 * Execute multiple promises and return results with Result pattern
 *
 * @param promises - Array of promises to execute
 * @returns Promise that resolves with array of Results
 *
 * @example
 * '''typescript'
 * const results = await allSettledSafe([
 *   fetch('/api/data1'),
 *   fetch('/api/data2'),
 *   fetch('/api/data3')
 *]);
 *
 * results.forEach((result, index) => {
 *   if (result.isOk()) {
 *     logger.info('Request ' + index + ' succeeded:', result.value);
 *} else {
 *     logger.info('Request ' + index + ' failed:', result.error);
 *}
 *});
 * '
 */
export declare function allSettledSafe<T>(promises: Promise<T>[]): Promise<Result<T, Error>[]>;
/**
 * Debounce an async function call
 *
 * @param fn - The async function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * '''typescript'
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
 * '
 */
export declare function debounce<T extends unknown[], R>(fn: (...args: T) => Promise<R>, delay: number): (...args: T) => Promise<R>;
/**
 * Throttle an async function call
 *
 * @param fn - The async function to throttle
 * @param limit - Throttle limit in milliseconds
 * @returns Throttled function
 *
 * @example
 * '''typescript'
 * const throttledAPI = throttle(
 *   async (query:string) => {
 *     return fetch('/api/search?q=' + query);
 *},
 *   1000
 * );
 * `
 */
export declare function throttle<T extends unknown[], R>(fn: (...args: T) => Promise<R>, limit: number): (...args: T) => Promise<R>;
//# sourceMappingURL=async.d.ts.map