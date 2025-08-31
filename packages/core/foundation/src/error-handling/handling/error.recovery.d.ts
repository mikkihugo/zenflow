/**
 * @fileoverview Error Recovery System for Foundation
 *
 * Comprehensive error recovery and system resilience framework that provides
 * automatic recovery strategies, retry mechanisms, and failover capabilities
 * for distributed systems and neural network operations.
 *
 * Key Features:
 * - Multi-strategy error recovery with configurable policies
 * - Exponential backoff with jitter for retry mechanisms
 * - Circuit breaker pattern for failing services
 * - Automatic failover and load balancing
 * - Comprehensive error classification and routing
 * - Recovery action orchestration with rollback capabilities
 * - Metrics collection and health monitoring
 * - Event-driven recovery notifications
 *
 * Recovery Strategies:
 * - Restart:Component/service restart with graceful shutdown
 * - Rollback:Version rollback to last known good state
 * - Failover:Automatic failover to backup systems
 * - Scale:Dynamic scaling based on error patterns
 * - Notify:Alert and notification management
 * - Repair:Self-healing and automatic repair actions
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 *
 * @see {@link https://martinfowler.com/bliki/CircuitBreaker.html} Circuit Breaker Pattern
 * @see {@link https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/} Retry Strategies
 *
 * @example Basic Recovery Strategy
 * '''typescript'
 * import { ErrorRecoverySystem} from '@claude-zen/foundation';
 *
 * const recovery = new ErrorRecoverySystem({
 *   strategies:[{
 *     id: 'neural-restart', *     name: 'Neural Network Restart', *     severity: 'high', *     timeout:30000,
 *     maxRetries:3,
 *     backoffStrategy: 'exponential', *     actions:[{ type: 'restart', target: ' neural-engine'}]
 *}]
 *});
 *
 * const result = await recovery.handleError({
 *   errorId: 'neural-training-failure', *   component: 'neural-network', *   operation: 'train', *   errorType: 'timeout', *   severity:'high') *});
 * `
 */
import { type Result } from './error.handler.js';
import { EventEmitter } from '../../events/event-emitter.js';
interface ServiceEvents {
    service_started: [{
        serviceName: string;
        timestamp: Date;
    }];
    service_stopped: [{
        serviceName: string;
        timestamp: Date;
    }];
    service_error: [{
        serviceName: string;
        error: Error;
        timestamp: Date;
    }];
    health_check: [{
        serviceName: string;
        healthy: boolean;
        timestamp: Date;
    }];
    [key: string]: unknown[];
}
/**
 * Recovery strategy configuration interface.
 *
 * Defines the complete configuration for an error recovery strategy,
 * including retry policies, backoff strategies, and recovery actions.
 */
export interface RecoveryStrategy {
    /** Unique identifier for the recovery strategy */
    id: string;
    /** Human-readable name for the strategy */
    name: string;
    /** Detailed description of strategy purpose */
    description?: string;
    /** Error severity level this strategy handles */
    severity: 'low' | 'medium' | 'high' | 'critical';
    /** Recovery strategy type for categorization */
    type?: 'retry' | 'fallback' | 'circuit_breaker' | 'graceful_degradation' | 'custom' | 'timeout';
    /** Maximum time to wait for recovery completion (ms) */
    timeout: number;
    /** Maximum number of retry attempts */
    maxRetries: number;
    /** Delay strategy between retries */
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    /** Base delay for backoff strategies (ms) */
    baseDelay?: number;
    /** Maximum delay for backoff strategies (ms) */
    maxDelay?: number;
    /** Conditions that must be met to trigger this strategy */
    conditions: string[];
    /** Recovery actions to execute */
    actions: RecoveryAction[];
    /** Strategy priority (higher numbers = higher priority) */
    priority: number;
    /** Whether this strategy is currently enabled */
    enabled: boolean;
}
/**
 * Recovery action definition.
 */
export interface RecoveryAction {
    /** Type of recovery action */
    type: 'restart' | 'rollback' | 'failover' | 'scale' | 'notify' | 'repair' | 'custom';
    /** Target component/service for the action */
    target: string;
    /** Action-specific parameters */
    parameters?: Record<string, unknown>;
    /** Timeout for this specific action (ms) */
    timeout?: number;
    /** Whether this action can be retried if it fails */
    retryable?: boolean;
}
/**
 * Error information for recovery processing.
 */
export interface ErrorInfo {
    /** Unique identifier for this error instance */
    errorId: string;
    /** Component where the error occurred */
    component: string;
    /** Operation that was being performed */
    operation: string;
    /** Type/category of error */
    errorType: string;
    /** Error severity level */
    severity: 'low' | 'medium' | 'high' | 'critical';
    /** Error message */
    message?: string;
    /** Stack trace */
    stack?: string;
    /** Additional context information */
    context?: Record<string, unknown>;
    /** Timestamp when error occurred */
    timestamp?: Date;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Recovery result information.
 */
export interface RecoveryResult {
    /** Whether recovery was successful */
    success: boolean;
    /** Strategy that was used for recovery */
    strategy?: RecoveryStrategy;
    /** Actions that were executed */
    actionsExecuted: RecoveryActionResult[];
    /** Total time taken for recovery (ms) */
    duration: number;
    /** Error message if recovery failed */
    error?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Result of a specific recovery action.
 */
export interface RecoveryActionResult {
    /** The action that was executed */
    action: RecoveryAction;
    /** Whether the action was successful */
    success: boolean;
    /** Duration of the action (ms) */
    duration: number;
    /** Error message if action failed */
    error?: string;
    /** Action output/result data */
    result?: unknown;
}
/**
 * Configuration for the error recovery system.
 */
export interface ErrorRecoveryConfig {
    /** Available recovery strategies */
    strategies: RecoveryStrategy[];
    /** Default timeout for recovery operations (ms) */
    defaultTimeout?: number;
    /** Maximum number of concurrent recovery operations */
    maxConcurrentRecoveries?: number;
    /** Whether to enable automatic recovery */
    autoRecovery?: boolean;
    /** Monitoring and metrics collection settings */
    monitoring?: {
        enabled: boolean;
        metricsInterval: number;
        alertThresholds: Record<string, number>;
    };
}
/**
 * Comprehensive error recovery and system resilience framework.
 *
 * Provides automatic error recovery with configurable strategies,
 * retry mechanisms, and comprehensive monitoring.
 */
export declare class ErrorRecoverySystem extends EventEmitter<ServiceEvents> {
    private logger;
    private strategies;
    private activeRecoveries;
    private recoveryHistory;
    private recoveryConfig;
    constructor(config: ErrorRecoveryConfig);
    /**
     * Handle an error with automatic recovery.
     */
    handleError(errorInfo: ErrorInfo): Promise<Result<RecoveryResult, Error>>;
    /**
     * Add or update a recovery strategy.
     */
    addStrategy(strategy: RecoveryStrategy): void;
    /**
     * Remove a recovery strategy.
     */
    removeStrategy(strategyId: string): boolean;
    /**
     * Get recovery metrics and statistics.
     */
    getRecoveryMetrics(): {
        totalRecoveries: number;
        successfulRecoveries: number;
        failedRecoveries: number;
        averageDuration: number;
        activeRecoveries: number;
        strategiesCount: number;
        recentRecoveries: RecoveryResult[];
    };
    /**
     * Get all active recoveries.
     */
    getActiveRecoveries(): string[];
    /**
     * Cancel an active recovery operation.
     */
    cancelRecovery(errorId: string): boolean;
    /**
     * Shutdown the recovery system gracefully.
     */
    shutdown(): Promise<void>;
    private findRecoveryStrategy;
    private strategyMatches;
    private executeRecovery;
    private executeRecoveryAction;
    private executeActionByType;
    private delay;
    private startMonitoring;
}
/**
 * Create a new error recovery system with default configuration.
 */
export declare function createErrorRecovery(config?: Partial<ErrorRecoveryConfig>): ErrorRecoverySystem;
/**
 * Simplified recovery strategy interface for built-in strategies.
 */
interface SimpleRecoveryStrategy {
    id: string;
    name: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type?: 'retry' | 'fallback' | 'circuit_breaker' | 'graceful_degradation' | 'timeout' | 'custom';
    timeout: number;
    canRecover(errorInfo: ErrorInfo): Promise<boolean>;
    recover(errorInfo: ErrorInfo): Promise<{
        success: boolean;
        message: string;
        recoverTime: number;
        metadata?: Record<string, unknown>;
    }>;
}
/**
 * Create a retry strategy with exponential backoff.
 */
export declare function createRetryStrategy(options: {
    id: string;
    name: string;
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}): SimpleRecoveryStrategy;
/**
 * Create a fallback strategy that provides alternative functionality.
 */
export declare function createFallbackStrategy(options: {
    id: string;
    name: string;
    fallbackValue?: unknown;
    fallbackFunction?: () => Promise<unknown>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}): SimpleRecoveryStrategy;
/**
 * Create a circuit breaker strategy to prevent cascading failures.
 */
export declare function createCircuitBreakerStrategy(options: {
    id: string;
    name: string;
    failureThreshold?: number;
    resetTimeout?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}): SimpleRecoveryStrategy;
/**
 * Create a graceful degradation strategy for non-critical features.
 */
export declare function createGracefulDegradationStrategy(options: {
    id: string;
    name: string;
    degradedFunction?: () => Promise<unknown>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}): SimpleRecoveryStrategy;
/**
 * Create a timeout strategy for operations that may hang.
 */
export declare function createTimeoutStrategy(options: {
    id: string;
    name: string;
    timeoutMs?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}): SimpleRecoveryStrategy;
/**
 * Create a rate limiting strategy to prevent overload.
 */
export declare function createRateLimitStrategy(options: {
    id: string;
    name: string;
    maxRequestsPerSecond?: number;
    backoffMs?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}): SimpleRecoveryStrategy;
/**
 * Create common recovery strategies for typical use cases.
 */
export declare function createCommonRecoveryStrategies(): SimpleRecoveryStrategy[];
/**
 * Create specialized recovery strategies for enterprise systems.
 */
export declare function createEnterpriseRecoveryStrategies(): SimpleRecoveryStrategy[];
/**
 * Create an error recovery system with common strategies pre-configured.
 */
export declare function createErrorRecoveryWithCommonStrategies(additionalConfig?: Partial<ErrorRecoveryConfig>): ErrorRecoverySystem;
/**
 * Create an enterprise error recovery system with advanced strategies.
 */
export declare function createEnterpriseErrorRecoverySystem(additionalConfig?: Partial<ErrorRecoveryConfig>): ErrorRecoverySystem;
/**
 * Execute a simple recovery strategy directly without the full error recovery system.
 */
export declare function executeSimpleRecovery(strategy: SimpleRecoveryStrategy, errorInfo: ErrorInfo): Promise<{
    success: boolean;
    message: string;
    recoverTime: number;
    metadata?: Record<string, unknown>;
} | null>;
/**
 * Test multiple recovery strategies and return the first successful one.
 */
export declare function tryMultipleRecoveryStrategies(strategies: SimpleRecoveryStrategy[], errorInfo: ErrorInfo): Promise<{
    success: boolean;
    message: string;
    recoverTime: number;
    strategyUsed?: string;
    metadata?: Record<string, unknown>;
}>;
export {};
//# sourceMappingURL=error.recovery.d.ts.map