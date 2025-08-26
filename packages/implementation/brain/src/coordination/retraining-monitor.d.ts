/**
 * @file Retraining Monitor - Automatic Neural Network Retraining System
 *
 * Implements automatic retraining triggers based on coordinationSuccessRate
 * and other performance metrics using @claude-zen/foundation infrastructure.
 *
 * Key Features:
 * - Foundation metrics integration
 * - Performance threshold monitoring
 * - LLM-driven retraining strategies
 * - Database-backed training history
 */
export interface RetrainingConfig {
	checkIntervalMs: number;
	minCoordinationSuccessRateThreshold: number;
	cooldownHours: number;
	enableAutoRetraining: boolean;
	maxRetrainingAttemptsPerDay: number;
}
export interface RetrainingTrigger {
	timestamp: Date;
	reason: string;
	metrics: Record<string, number>;
	strategy: "performance" | "manual" | "scheduled";
}
export interface RetrainingResult {
	success: boolean;
	strategy: string;
	duration: number;
	improvementMetrics?: Record<string, number>;
	error?: string;
}
export interface MonitoringMetrics {
	totalRetrainingTriggers: number;
	successfulRetrainings: number;
	averageRetrainingDuration: number;
	currentCoordinationSuccessRate: number;
	lastRetrainingTimestamp?: number;
	retrainingFrequency: number;
	cooldownStatus: "active|inactive";
	dailyLimitStatus: {
		used: number;
		limit: number;
		remaining: number;
	};
}
/**
 * Automated retraining monitor using foundation metrics and LLM coordination.
 *
 * Implements Option 4: Build coordination feedback loops (coordinationSuccessRate → retraining)
 */
export declare class RetrainingMonitor {
	private config;
	private intervalId;
	private dbAccess;
	private isMonitoring;
	private logger;
	constructor(config: RetrainingConfig);
	/**
	 * Start monitoring coordination success rates and trigger retraining when needed.
	 */
	startMonitoring(): Promise<void>;
	/**
	 * Stop the retraining monitor.
	 */
	stopMonitoring(): void;
	/**
	 * Manually trigger retraining for a specific reason.
	 */
	manualRetrain(
		reason: string,
		additionalMetrics?: Record<string, number>,
	): Promise<RetrainingResult>;
	/**
	 * Get current retraining configuration from foundation config system.
	 */
	private getRetrainingConfig;
	/**
	 * Check metrics and trigger retraining if thresholds are breached.
	 */
	private checkAndTriggerRetraining;
	/**
	 * Execute the retraining workflow using foundation LLM integration.
	 */
	private executeRetrainingWorkflow;
	/**
	 * Get current performance metrics from the database.
	 */
	private getCurrentMetrics;
	/**
	 * Check if we're currently in a cooldown period from the last retraining.'
	 */
	private isInCooldownPeriod;
	/**
	 * Check if we've exceeded the daily retraining limit.'
	 */
	private hasExceededDailyLimit;
	/**
	 * Get retraining history and statistics.
	 */
	getRetrainingHistory(
		limit?: number,
	): Promise<Array<RetrainingTrigger & RetrainingResult>>;
	/**
	 * Initialize the retraining monitor with configuration.
	 * @param config Configuration options for the monitor
	 */
	initialize(config?: Partial<RetrainingConfig>): Promise<void>;
	/**
	 * Record feedback for prompt performance to inform retraining decisions.
	 * @param promptId Identifier for the prompt
	 * @param feedback Performance feedback data
	 */
	recordPromptFeedback(
		promptId: string,
		feedback: {
			success: boolean;
			latency?: number;
			accuracy?: number;
			userSatisfaction?: number;
			context?: Record<string, unknown>;
		},
	): Promise<void>;
}
export default RetrainingMonitor;
//# sourceMappingURL=retraining-monitor.d.ts.map
