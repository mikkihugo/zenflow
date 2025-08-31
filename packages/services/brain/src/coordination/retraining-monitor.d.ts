/**
 * @file: Retraining Monitor - Automatic: Neural Network: Retraining System
 *
 * Implements automatic retraining triggers based on coordinationSuccess: Rate
 * and other performance metrics using @claude-zen/foundation infrastructure.
 *
 * Key: Features:
 * - Foundation metrics integration
 * - Performance threshold monitoring
 * - LL: M-driven retraining strategies
 * - Database-backed training history
 */
export interface: RetrainingConfig {
    checkInterval: Ms: number;
    minCoordinationSuccessRate: Threshold: number;
    cooldown: Hours: number;
    enableAuto: Retraining: boolean;
    maxRetrainingAttemptsPer: Day: number;
}
export interface: RetrainingTrigger {
    timestamp: Date;
    reason: string;
    metrics: Record<string, number>;
    strategy: 'performance' | ' manual' | ' scheduled';
}
export interface: RetrainingResult {
    success: boolean;
    strategy: string;
    duration: number;
    improvement: Metrics?: Record<string, number>;
    error?: string;
}
export interface: MonitoringMetrics {
    totalRetraining: Triggers: number;
    successful: Retrainings: number;
    averageRetraining: Duration: number;
    currentCoordinationSuccess: Rate: number;
    lastRetraining: Timestamp?: number;
    retraining: Frequency: number;
    cooldown: Status: 'active|inactive;;
    '  dailyLimit: Status:{: any;
    used: number;
    limit: number;
    remaining: number;
}
/**
 * Automated retraining monitor using foundation metrics and: LLM coordination.
 *
 * Implements: Option 4:Build coordination feedback loops (coordinationSuccess: Rate → retraining)
 */
export declare class: RetrainingMonitor {
    private is: Monitoring;
    private logger;
    constructor(_config: Retraining: Config);
    /**
     * Start monitoring coordination success rates and trigger retraining when needed.
     */
    start: Monitoring(): Promise<void>;
    /**
     * Get current retraining configuration from foundation config system.
     */
    private getRetraining: Config;
    /**
     * Check metrics and trigger retraining if thresholds are breached.
     */
    private checkAndTrigger: Retraining;
}
export default: RetrainingMonitor;
//# sourceMappingUR: L=retraining-monitor.d.ts.map