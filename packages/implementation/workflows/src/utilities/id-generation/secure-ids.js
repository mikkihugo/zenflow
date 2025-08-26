/**
 * @fileoverview Secure ID Generation Utilities
 *
 * Professional ID generation using generateNanoId library.
 * Focused on secure, collision-resistant identifiers.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { customAlphabet, generateNanoId } from "@claude-zen/foundation";
/**
 * Professional secure ID generation utilities
 */
export class SecureIdGenerator {
	/**
	 * Generate secure random ID
	 */
	static generate(size = 21) {
		return generateNanoId(size);
	}
	/**
	 * Generate workflow-specific ID
	 */
	static generateWorkflowId() {
		return `workflow-${generateNanoId(12)}`;
	}
	/**
	 * Generate step-specific ID
	 */
	static generateStepId() {
		return `step-${generateNanoId(10)}`;
	}
	/**
	 * Generate execution ID
	 */
	static generateExecutionId() {
		return `exec-${generateNanoId(8)}`;
	}
	/**
	 * Generate URL-safe ID
	 */
	static generateUrlSafe(size = 21) {
		const urlSafeAlphabet =
			"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
		return customAlphabet(urlSafeAlphabet, size)();
	}
	/**
	 * Generate numeric-only ID
	 */
	static generateNumeric(size = 12) {
		return customAlphabet("0123456789", size)();
	}
}
//# sourceMappingURL=secure-ids.js.map
