/**
 * @fileoverview Date Calculation Utilities
 *
 * Professional date arithmetic using date-fns library.
 * Focused on duration and time manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

export class DateCalculator {
  /**
   * Calculate duration in milliseconds
   */
  static getDurationMs(startDate: Date, endDate: Date): string {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} days`;
    } else if (diffMs > 3600000) { // More than 1 hour
      const hours = Math.floor(diffMs / 3600000);
      return `${hours} hours`;
    } else if (diffMs > 60000) { // More than 1 minute
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} minutes`;
    } else {
      const seconds = Math.floor(diffMs / 1000);
      return `${seconds} seconds`;
    }
  }

  /**
   * Check if date is within range
   */
  static isWithinRange(date: Date, startRange: Date, endRange: Date): boolean {
    return date >= startRange && date <= endRange;
  }
}