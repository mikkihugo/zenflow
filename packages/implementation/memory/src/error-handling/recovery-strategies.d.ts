/**
 * @file Recovery Strategies for Memory System Errors
 * Advanced error recovery and fault tolerance mechanisms.
 */
import { TypedEventBase } from "@claude-zen/foundation";
import type { BaseMemoryBackend } from "../backends/base-backend";
import type { BackendInterface } from "../core/memory-system";
import { type MemoryError, MemoryErrorCode } from "./memory-errors";
export interface RecoveryStrategy {
	name: string;
	description: string;
	applicableErrors: MemoryErrorCode[];
	priority: number;
	timeoutMs: number;
	maxRetries: number;
	execute: (
		error: MemoryError,
		context: RecoveryContext,
	) => Promise<RecoveryResult>;
}
export interface RecoveryContext {
	backends: Map<string, BackendInterface | BaseMemoryBackend>;
	coordinator?: unknown;
	optimizer?: unknown;
	sessionId?: string;
	operation?: string;
	key?: string;
	originalValue?: unknown;
	attempt: number;
	maxAttempts: number;
}
export interface RecoveryResult {
	success: boolean;
	strategy: string;
	action: string;
	duration: number;
	data?: unknown;
	error?: string;
	metadata?: Record<string, unknown>;
}
/**
 * Recovery Strategy Registry and Executor.
 *
 * @example
 */
export declare class RecoveryStrategyManager extends TypedEventBase {
	private strategies;
	private recoveryHistory;
	constructor();
	/**
	 * Register a recovery strategy.
	 *
	 * @param strategy
	 */
	registerStrategy(strategy: RecoveryStrategy): void;
	/**
	 * Attempt to recover from an error.
	 *
	 * @param error
	 * @param context
	 */
	recover(
		error: MemoryError,
		context: RecoveryContext,
	): Promise<RecoveryResult>;
	/**
	 * Execute strategy with timeout.
	 *
	 * @param strategy
	 * @param error
	 * @param context
	 */
	private executeWithTimeout;
	/**
	 * Find strategies applicable to an error.
	 *
	 * @param error
	 */
	private findApplicableStrategies;
	/**
	 * Record recovery attempt for analysis.
	 *
	 * @param error
	 * @param result
	 */
	private recordRecovery;
	/**
	 * Register default recovery strategies.
	 */
	private registerDefaultStrategies;
	/**
	 * Get recovery statistics.
	 */
	getStats(): {
		total: number;
		successful: number;
		successRate: number;
		strategies: any;
		registeredStrategies: number;
	};
	/**
	 * Get recommended strategies for an error.
	 *
	 * @param error
	 */
	getRecommendedStrategies(error: MemoryError): RecoveryStrategy[];
}
//# sourceMappingURL=recovery-strategies.d.ts.map
