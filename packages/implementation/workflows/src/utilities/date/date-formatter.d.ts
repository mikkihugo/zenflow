/**
 * @fileoverview Date Formatting Utilities
 *
 * Professional date formatting using date-fns library.
 * Focused on timestamp generation and format conversion.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
/**
 * Professional date formatting utilities
 */
export declare class DateFormatter {
	/**
	 * Format date as ISO string with proper timezone
	 */
	static formatISOString(date?: Date): string;
	/**
	 * Create standardized workflow timestamp
	 */
	static createTimestamp(): string;
	/**
	 * Parse ISO string with validation
	 */
	static parseISO(dateString: string): Date | null;
	/**
	 * Format relative time display
	 */
	static formatRelative(date: Date): string;
}
//# sourceMappingURL=date-formatter.d.ts.map
