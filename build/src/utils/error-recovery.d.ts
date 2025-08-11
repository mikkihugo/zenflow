/**
 * Error Recovery System.
 * Handles automatic error recovery and system resilience.
 */
/**
 * @file Error-recovery implementation.
 */
import { EventEmitter } from 'node:events';
export interface RecoveryStrategy {
    id: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timeout: number;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    conditions: string[];
    actions: RecoveryAction[];
}
export interface RecoveryAction {
    type: 'restart' | 'rollback' | 'failover' | 'scale' | 'notify' | 'repair';
    target: string;
    parameters: Record<string, any>;
    timeout: number;
    required: boolean;
}
export interface RecoveryContext {
    errorId: string;
    component: string;
    operation: string;
    errorType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata: Record<string, any>;
    timestamp: Date;
    retryCount: number;
}
export interface RecoveryResult {
    success: boolean;
    strategy: string;
    actionsExecuted: string[];
    duration: number;
    error?: string;
    nextRetryAt?: Date;
}
export declare class ErrorRecoverySystem extends EventEmitter {
    private strategies;
    private activeRecoveries;
    private recoveryHistory;
    constructor();
    /**
     * Register a recovery strategy.
     *
     * @param strategy
     */
    registerStrategy(strategy: RecoveryStrategy): void;
    /**
     * Attempt error recovery.
     *
     * @param context
     */
    attemptRecovery(context: RecoveryContext): Promise<RecoveryResult>;
    /**
     * Get recovery strategies for a given error type.
     *
     * @param errorType
     * @param component
     */
    getStrategiesForError(errorType: string, component: string): RecoveryStrategy[];
    /**
     * Get recovery history.
     *
     * @param component
     * @param since
     */
    getRecoveryHistory(component?: string, since?: Date): Array<RecoveryResult & RecoveryContext>;
    /**
     * Get recovery statistics.
     */
    getRecoveryStats(): {
        totalRecoveries: number;
        successRate: number;
        averageDuration: number;
        strategiesUsed: Record<string, number>;
        componentsAffected: Record<string, number>;
    };
    private selectRecoveryStrategy;
    private executeRecoveryStrategy;
    private executeRecoveryAction;
    private executeRestartAction;
    private executeRollbackAction;
    private executeFailoverAction;
    private executeScaleAction;
    private executeNotifyAction;
    private executeRepairAction;
    private matchesCondition;
    private getSeverityWeight;
    private calculateBackoffDelay;
    private recordRecovery;
    private initializeDefaultStrategies;
}
export declare function createErrorRecoverySystem(): ErrorRecoverySystem;
export default ErrorRecoverySystem;
//# sourceMappingURL=error-recovery.d.ts.map