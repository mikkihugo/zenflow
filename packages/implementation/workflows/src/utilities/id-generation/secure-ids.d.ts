/**
 * @fileoverview Secure ID Generation Utilities
 *
 * Professional ID generation using nanoid library.
 * Focused on secure, collision-resistant identifiers.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
/**
 * Professional secure ID generation utilities
 */
export declare class SecureIdGenerator {
	/**
	 * Generate secure random ID
	 */
	static generate(size?: number): string;
	/**
	 * Generate workflow-specific ID
	 */
	static generateWorkflowId(): string;
	/**
	 * Generate step-specific ID
	 */
	static generateStepId(): string;
	/**
	 * Generate execution ID
	 */
	static generateExecutionId(): string;
	/**
	 * Generate URL-safe ID
	 */
	static generateUrlSafe(size?: number): string;
	/**
	 * Generate numeric-only ID
	 */
	static generateNumeric(size?: number): string;
}
//# sourceMappingURL=secure-ids.d.ts.map
