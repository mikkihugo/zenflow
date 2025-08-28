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
    strategy: 'performance' | ' manual' | ' scheduled';
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
    cooldownStatus: 'active|inactive;;
    '  dailyLimitStatus:{: any;
    used: number;
    limit: number;
    remaining: number;
}
/**
 * Automated retraining monitor using foundation metrics and LLM coordination.
 *
 * Implements Option 4:Build coordination feedback loops (coordinationSuccessRate → retraining)
 */
export declare class RetrainingMonitor {
    private isMonitoring;
    private logger;
    constructor(_config: RetrainingConfig);
    /**
     * Start monitoring coordination success rates and trigger retraining when needed.
     */
    startMonitoring(): Promise<void>;
    /**
     * Get current retraining configuration from foundation config system.
     */
    private getRetrainingConfig;
    /**
     * Check metrics and trigger retraining if thresholds are breached.
     */
    private checkAndTriggerRetraining;
}
export default RetrainingMonitor;
//# sourceMappingURL=retraining-monitor.d.ts.map