/**
 * @fileoverview Time Utilities
 *
 * Time and date manipulation utilities.
 */

import { parseISO as parseISOString } from 'date-fns';

/**
 * Get current timestamp
 */
export function now(): number {
  return Date.now();
}

/**
 * Convert Date to timestamp
 */
export function timestampFromDate(date: Date): number {
  return date.getTime();
}

/**
 * Convert timestamp to Date
 */
export function dateFromTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

/**
 * Convert timestamp to ISO string
 */
export function isoStringFromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Format timestamp to string
 */
export function formatTimestamp(timestamp: number, format?: string): string {
  if (format) {
    // Would use date-fns format function with format string
    return new Date(timestamp).toLocaleString();
  }
  return new Date(timestamp).toISOString();
}

/**
 * Parse ISO string to Date
 */
export function parseISO(isoString: string): Date {
  return parseISOString(isoString);
}

// Re-export date-fns utilities to force usage through foundation (prevents direct imports)  
export { formatISO, parseISO as parseISOString } from 'date-fns';
