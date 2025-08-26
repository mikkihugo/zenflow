/**
 * @fileoverview Date Calculation Utilities
 *
 * Professional date arithmetic using date-fns library.
 * Focused on duration and time manipulation.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
/**
 * Professional date calculation utilities
 */
export declare class DateCalculator {
	/**
	 * Calculate duration in milliseconds
	 */
	static getDurationMs(startDate: Date, endDate?: Date): number;
	/**
	 * Add minutes to date
	 */
	static addMinutes(date: Date, minutes: number): Date;
	/**
	 * Subtract minutes from date
	 */
	static subMinutes(date: Date, minutes: number): Date;
	/**
	 * Format duration in human-readable format
	 */
	static formatDuration(startDate: Date, endDate?: Date): string;
	/**
	 * Check if date is within range
	 */
	static isWithinRange(date: Date, startRange: Date, endRange: Date): boolean;
}
//# sourceMappingURL=date-calculator.d.ts.map
