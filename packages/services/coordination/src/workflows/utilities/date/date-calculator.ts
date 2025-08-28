/**
 * @fileoverview Date Calculation Utilities
 *
 * Professional date arithmetic using date-fns library.
 * Focused on duration and time manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import {
  addMinutes,
  differenceInMilliseconds,
  formatDuration,
  intervalToDuration,
  subMinutes,
} from 'date-fns';
/**
 * Professional date calculation utilities
 */
export class DateCalculator {
  /**
   * Calculate duration in milliseconds
   */
  static getDurationMs(startDate: Date, endDate: Date = new Date()): number {
    return differenceInMilliseconds(endDate, startDate);
  }

  /**
   * Add minutes to date
   */
  static addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  /**
   * Subtract minutes from date
   */
  static subMinutes(date: Date, minutes: number): Date {
    return subMinutes(date, minutes);
  }

  /**
   * Format duration in human-readable format
   */
  static formatDuration(startDate: Date, endDate: Date = new Date()): string {
    const duration = intervalToDuration({ start: startDate, end: endDate });
    return formatDuration(duration);
  }

  /**
   * Check if date is within range
   */
  static isWithinRange(date: Date, startRange: Date, endRange: Date): boolean {
    return date >= startRange && date <= endRange;
  }
}
