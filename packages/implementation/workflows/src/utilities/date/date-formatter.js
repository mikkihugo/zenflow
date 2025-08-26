/**
 * @fileoverview Date Formatting Utilities
 *
 * Professional date formatting using date-fns library.
 * Focused on timestamp generation and format conversion.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { dateFns } from "@claude-zen/foundation";

const { format, parseISO, isValid } = dateFns;
/**
 * Professional date formatting utilities
 */
export class DateFormatter {
	/**
	 * Format date as ISO string with proper timezone
	 */
	static formatISOString(date = new Date()) {
		return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
	}
	/**
	 * Create standardized workflow timestamp
	 */
	static createTimestamp() {
		return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
	}
	/**
	 * Parse ISO string with validation
	 */
	static parseISO(dateString) {
		try {
			const parsed = parseISO(dateString);
			return isValid(parsed) ? parsed : null;
		} catch {
			return null;
		}
	}
	/**
	 * Format relative time display
	 */
	static formatRelative(date) {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const minutes = Math.floor(diffMs / 60000);
		if (minutes < 1) return "just now";
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
}
//# sourceMappingURL=date-formatter.js.map
