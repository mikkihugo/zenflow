/**
 * @fileoverview Async Utilities
 *
 * Async operation utilities and patterns.
 */

import { err, ok, type Result } from '../../error-handling/index.js';

/**
 * Promise timeout utility
 */
export async function pTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(message || `Promise timed out after ${ms}ms`));
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutHandle) clearTimeout(timeoutHandle);
    return result;
  } catch (error) {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    throw error;
  }
}

/**
 * Retry utility with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Result<T, Error>> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return ok(result);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = baseDelay * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return err(lastError);
}

/**
 * Run promises concurrently with limit
 */
export async function concurrent<T>(
  tasks: (() => Promise<T>)[],
  limit: number = 3
): Promise<Result<T[], Error>[]> {
  const results: Result<T[], Error>[] = [];

  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchPromises = batch.map(async (task) => {
      try {
        const result = await task();
        return ok([result]);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Timeout promise wrapper
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string
): Promise<T> {
  return pTimeout(promise, ms, message);
}

// Alias for compatibility (but avoid withTimeout naming conflict)
export { pTimeout as timeoutPromise, withRetry as retryAsync };
