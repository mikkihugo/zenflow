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

import { setTimeout as nodeSetTimeout } from 'node:timers/promises';
// Foundation re-exports date-fns internally to avoid circular dependency
import { format } from 'date-fns';
import * as dateFnsLib from 'date-fns';
import type { ISODateString, Timestamp } from '../types/primitives';

// Re-export date-fns for comprehensive date operations
export const dateFns = dateFnsLib;
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

// =============================================================================
// TIMESTAMP UTILITIES - Branded timestamp type operations
// =============================================================================

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
export function now(): Timestamp {
  return Date.now() as Timestamp;
}

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
export function timestampFromDate(date: Date): Timestamp {
  return date.getTime() as Timestamp;
}

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
export function dateFromTimestamp(timestamp: Timestamp): Date {
  return new Date(timestamp);
}

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
export function isoStringFromTimestamp(timestamp: Timestamp): ISODateString {
  return new Date(timestamp).toISOString() as ISODateString;
}

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
export function timestampFromISOString(isoString: string): Timestamp {
  return Date.parse(isoString) as Timestamp;
}

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
export function formatTimestamp(
  timestamp: Timestamp,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  return format(new Date(timestamp), formatStr);
}

// =============================================================================
// ASYNC DELAY UTILITIES - Promise-based timing
// =============================================================================

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
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
export function delay(ms: number): Promise<void> {
  return nodeSetTimeout(ms);
}

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
export function timeout(
  ms: number,
  message: string = 'Operation timed out'
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

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
export function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return Promise.race([operation, timeout(timeoutMs, timeoutMessage)]);
}

// =============================================================================
// TIME MEASUREMENT UTILITIES
// =============================================================================

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
export function highResTime(): bigint {
  return process.hrtime.bigint();
}

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
export async function measureTime<T>(
  operation: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = highResTime();
  const result = await operation();
  const end = highResTime();
  const durationMs = Number(end - start) / 1_000_000;

  return { result, durationMs };
}

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
export function createTimer() {
  let startTime: bigint | null = null;
  let endTime: bigint | null = null;

  return {
    start() {
      startTime = highResTime();
      endTime = null;
    },

    stop(): number {
      if (startTime === null) {
        throw new Error('Timer not started');
      }
      endTime = highResTime();
      return Number(endTime - startTime) / 1_000_000;
    },

    elapsed(): number {
      if (startTime === null) {
        throw new Error('Timer not started');
      }
      const currentTime = endTime || highResTime();
      return Number(currentTime - startTime) / 1_000_000;
    },

    reset() {
      startTime = null;
      endTime = null;
    },
  };
}

// =============================================================================
// DATE VALIDATION UTILITIES
// =============================================================================

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
export function isValidTimestamp(timestamp: unknown): timestamp is Timestamp {
  if (typeof timestamp !== 'number' || !Number.isInteger(timestamp)) {
    return false;
  }

  // Must be positive and reasonable (after 1970, before year 3000)
  const minTimestamp = 0;
  const maxTimestamp = new Date('3000-01-01').getTime();

  return timestamp >= minTimestamp && timestamp <= maxTimestamp;
}

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
export function isValidISOString(
  dateString: unknown
): dateString is ISODateString {
  if (typeof dateString !== 'string') return false;

  // Check ISO 8601 format pattern
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoPattern.test(dateString)) return false;

  // Check if actually parseable
  const parsed = Date.parse(dateString);
  return !Number.isNaN(parsed);
}

// =============================================================================
// COMPATIBILITY ALIASES
// =============================================================================

// Alias for Node.js timers/promises setTimeout
export {
  setInterval as recurring,
  setTimeout as nodeDelay,
} from 'node:timers/promises';
