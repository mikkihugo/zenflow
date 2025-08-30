/**
 * @fileoverview Time Utilities
 *
 * Consolidated time and date utilities - timestamps, formatting, delays, and date operations.
 * Combines custom timestamp functions with date-fns re-exports.
 *
 * @example Timestamp Operations
 * ```typescript`
 * import { now, timestampFromDate, formatTimestamp} from '@claude-zen/foundation/utilities/time';
 *
 * const timestamp = now();
 * const date = new Date('2024-01-01');
 * const ts = timestampFromDate(date);
 * const formatted = formatTimestamp(ts);
 * ```
 *
 * @example Date Operations
 * ```typescript`
 * import { addDays, format, differenceInHours} from '@claude-zen/foundation/utilities/time';
 *
 * const tomorrow = addDays(new Date(), 1);
 * const formatted = format(tomorrow, 'yyyy-MM-dd');
 * ```
 *
 * @example Async Delays
 * ```typescript`
 * import { sleep, delay} from '@claude-zen/foundation/utilities/time';
 *
 * await sleep(1000); // Wait 1 second
 * await delay(5000); // Wait 5 seconds
 * ```
 */
import * as dateFnsLib from 'date-fns';
import type { ISODateString, Timestamp } from '../types/primitives';
export declare const dateFns: typeof dateFnsLib;
export {
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addSeconds,
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInSeconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  fromUnixTime,
  getTime,
  getUnixTime,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
  subMilliseconds,
  subMinutes,
  subSeconds,
} from 'date-fns';
/**
 * Get current timestamp as branded Timestamp type.
 * Uses Date.now() for high precision.
 *
 * @returns Current timestamp in milliseconds
 * @example
 * ```typescript`
 * const timestamp = now(); // 1640995200000
 * logger.info(typeof timestamp); // number (but branded as Timestamp)
 * ```
 */
export declare function now(): Timestamp;
/**
 * Create timestamp from Date object.
 * Converts Date to branded Timestamp type.
 *
 * @param date - Date to convert
 * @returns Timestamp in milliseconds
 * @example
 * ```typescript`
 * const date = new Date('2024-01-01');
 * const timestamp = timestampFromDate(date);
 * ```
 */
export declare function timestampFromDate(date: Date): Timestamp;
/**
 * Create Date object from branded Timestamp.
 * Safe conversion with validation.
 *
 * @param timestamp - Timestamp to convert
 * @returns Date object
 * @example
 * ```typescript`
 * const timestamp = now();
 * const date = dateFromTimestamp(timestamp);
 * ```
 */
export declare function dateFromTimestamp(timestamp: Timestamp): Date;
/**
 * Create ISO string from branded Timestamp.
 * Returns branded ISODateString type.
 *
 * @param timestamp - Timestamp to convert
 * @returns ISO date string
 * @example
 * ```typescript`
 * const timestamp = now();
 * const isoString = isoStringFromTimestamp(timestamp);
 * // "2024-01-01T12:00:00.000Z"
 * ```
 */
export declare function isoStringFromTimestamp(
  timestamp: Timestamp
): ISODateString;
/**
 * Create timestamp from ISO string.
 * Parses ISO string to branded Timestamp.
 *
 * @param isoString - ISO date string to parse
 * @returns Timestamp in milliseconds
 * @example
 * ```typescript`
 * const timestamp = timestampFromISOString("2024-01-01T12:00:00.000Z");
 * ```
 */
export declare function timestampFromISOString(isoString: string): Timestamp;
/**
 * Format timestamp using date-fns format patterns.
 * Combines branded types with date-fns formatting.
 *
 * @param timestamp - Timestamp to format
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 * @example
 * ```typescript`
 * const timestamp = now();
 * const formatted = formatTimestamp(timestamp, 'yyyy-MM-dd HH:mm:ss');
 * // "2024-01-01 12:00:00"
 * ```
 */
export declare function formatTimestamp(
  timestamp: Timestamp,
  formatStr?: string
): string;
/**
 * Sleep for specified milliseconds using Promise.
 * Modern alternative to setTimeout with Promise.
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 * @example
 * ```typescript`
 * await sleep(1000); // Wait 1 second
 * logger.info('1 second later');
 * ```
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Delay using Node.js timers/promises for better performance.
 * Uses Node.js native setTimeout from timers/promises.
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 * @example
 * ```typescript`
 * await delay(5000); // Wait 5 seconds
 * logger.info('5 seconds later');
 * ```
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Create a timeout that rejects after specified time.
 * Useful for implementing timeouts in async operations.
 *
 * @param ms - Milliseconds before timeout
 * @param message - Optional timeout error message
 * @returns Promise that rejects after timeout
 * @example
 * ```typescript`
 * const result = await Promise.race([
 *   fetchData(),
 *   timeout(5000, 'Data fetch timeout')
 *]);
 * ```
 */
export declare function timeout(ms: number, message?: string): Promise<never>;
/**
 * Execute function with timeout using Promise.race.
 * Automatically races the operation with a timeout.
 *
 * @param operation - Async operation to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Optional timeout error message
 * @returns Promise that resolves/rejects based on race result
 * @example
 * ```typescript`
 * const result = await withTimeout(
 *   fetchUserData(userId),
 *   10000,
 *   'User data fetch timeout') * );
 * ```
 */
export declare function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T>;
/**
 * High-resolution time measurement for performance timing.
 * Uses process.hrtime.bigint() for nanosecond precision.
 *
 * @returns High-resolution timestamp in nanoseconds
 * @example
 * ```typescript`
 * const start = highResTime();
 * await someOperation();
 * const end = highResTime();
 * const durationNs = end - start;
 * const durationMs = Number(durationNs) / 1_000_000;
 * ```
 */
export declare function highResTime(): bigint;
/**
 * Measure execution time of async operation.
 * Returns both result and execution time.
 *
 * @param operation - Async operation to measure
 * @returns Object with result and duration in milliseconds
 * @example
 * ```typescript`
 * const { result, durationMs} = await measureTime(async () => {
 *   return await expensiveOperation();
 *});
 * logger.info(`Operation took ${durationMs}ms`);
 * ```
 */
export declare function measureTime<T>(operation: () => Promise<T>): Promise<{
  result: T;
  durationMs: number;
}>;
/**
 * Create a simple timer for manual time measurement.
 * Returns functions to start, stop, and get elapsed time.
 *
 * @returns Timer object with control functions
 * @example
 * ```typescript`
 * const timer = createTimer();
 * timer.start();
 * // ... some operations
 * const elapsed = timer.stop(); // Returns elapsed milliseconds
 *
 * // Or get elapsed without stopping
 * const current = timer.elapsed();
 * ```
 */
export declare function createTimer(): {
  start(): void;
  stop(): number;
  elapsed(): number;
  reset(): void;
};
/**
 * Check if timestamp is valid and within reasonable range.
 * Validates timestamp is positive and not too far in future/past.
 *
 * @param timestamp - Timestamp to validate
 * @returns True if valid timestamp
 * @example
 * ```typescript`
 * const timestamp = now();
 * if (isValidTimestamp(timestamp)) {
 *   processTimestamp(timestamp);
 *}
 * ```
 */
export declare function isValidTimestamp(
  timestamp: unknown
): timestamp is Timestamp;
/**
 * Check if ISO date string is valid format and parseable.
 * More comprehensive than basic date parsing.
 *
 * @param dateString - String to validate
 * @returns True if valid ISO date string
 * @example
 * ```typescript`
 * if (isValidISOString("2024-01-01T12:00:00.000Z")) {
 *   const date = new Date(dateString);
 *}
 * ```
 */
export declare function isValidISOString(
  dateString: unknown
): dateString is ISODateString;
export {
  setInterval as recurring,
  setTimeout as nodeDelay,
} from 'node:timers/promises';
//# sourceMappingURL=time.d.ts.map
