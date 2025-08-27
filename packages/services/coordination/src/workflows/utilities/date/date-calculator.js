/**
 * @fileoverview Date Calculation Utilities
 *
 * Professional date arithmetic using date-fns library.
 * Focused on duration and time manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { dateFns } from '@claude-zen/foundation';

const {
  differenceInMilliseconds,
  addMinutes,
  subMinutes,
  formatDuration,
  intervalToDuration,
} = dateFns;
/**
 * Professional date calculation utilities
 */
export class DateCalculator {
  /**
   * Calculate duration in milliseconds
   */
  static getDurationMs(startDate, endDate = new Date()) {
    return differenceInMilliseconds(endDate, startDate);
  }
  /**
   * Add minutes to date
   */
  static addMinutes(date, minutes) {
    return addMinutes(date, minutes);
  }
  /**
   * Subtract minutes from date
   */
  static subMinutes(date, minutes) {
    return subMinutes(date, minutes);
  }
  /**
   * Format duration in human-readable format
   */
  static formatDuration(startDate, endDate = new Date()) {
    const duration = intervalToDuration({ start: startDate, end: endDate });
    return formatDuration(duration);
  }
  /**
   * Check if date is within range
   */
  static isWithinRange(date, startRange, endRange) {
    return date >= startRange && date <= endRange;
  }
}
//# sourceMappingURL=date-calculator.js.map
