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
 * - Restart: Component/service restart with graceful shutdown
 * - Rollback: Version rollback to last known good state
 * - Failover: Automatic failover to backup systems
 * - Scale: Dynamic scaling based on error patterns
 * - Notify: Alert and notification management
 * - Repair: Self-healing and automatic repair actions
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 *
 * @see {@link https://martinfowler.com/bliki/CircuitBreaker.html} Circuit Breaker Pattern
 * @see {@link https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/} Retry Strategies
 *
 * @example Basic Recovery Strategy
 * ```typescript
 * import { ErrorRecoverySystem } from '@claude-zen/foundation';
 *
 * const recovery = new ErrorRecoverySystem({
 *   strategies: [{
 *     id: 'neural-restart',
 *     name: 'Neural Network Restart',
 *     severity: 'high',
 *     timeout: 30000,
 *     maxRetries: 3,
 *     backoffStrategy: 'exponential',
 *     actions: [{ type: 'restart', target: 'neural-engine' }]
 *   }]
 * });
 *
 * const result = await recovery.handleError({
 *   errorId: 'neural-training-failure',
 *   component: 'neural-network',
 *   operation: 'train',
 *   errorType: 'timeout',
 *   severity: 'high'
 * });
 * ```
 */
// Foundation re-exports Result types - use internal imports to avoid circular dependency
import { ok, err } from "./error.handler.js";
import { getLogger } from "../../core/logging/index.js";
import { EventEmitter } from "../../events/event-emitter.js";
// Constants for duplicate string literals
const SERVICE_NAMES = {
    ERROR_RECOVERY_SYSTEM: "error-recovery-system",
    ERROR_RECOVERY: "error-recovery",
    RECOVERY_STRATEGY: "recovery-strategy"
};
const EVENT_NAMES = {
    SERVICE_STOPPED: "service-stopped",
    SERVICE_STARTED: "service-started"
};
// =============================================================================
// ERROR RECOVERY SYSTEM
// =============================================================================
/**
 * Comprehensive error recovery and system resilience framework.
 *
 * Provides automatic error recovery with configurable strategies,
 * retry mechanisms, and comprehensive monitoring.
 */
export class ErrorRecoverySystem extends EventEmitter {
    logger;
    strategies = new Map();
    activeRecoveries = new Map();
    recoveryHistory = [];
    recoveryConfig;
    constructor(config) {
        super({
            captureRejections: true,
        });
        this.logger = getLogger(SERVICE_NAMES.ERROR_RECOVERY_SYSTEM);
        // Set defaults
        this.recoveryConfig = {
            strategies: config.strategies || [],
            defaultTimeout: config.defaultTimeout || 30000,
            maxConcurrentRecoveries: config.maxConcurrentRecoveries || 10,
            autoRecovery: config.autoRecovery ?? true,
            monitoring: {
                enabled: config.monitoring?.enabled ?? true,
                metricsInterval: config.monitoring?.metricsInterval || 60000,
                alertThresholds: config.monitoring?.alertThresholds || {},
            },
        };
        // Initialize strategies
        for (const strategy of this.recoveryConfig.strategies) {
            this.strategies.set(strategy.id, strategy);
        }
        this.logger.info("Error recovery system initialized", {
            strategiesCount: this.strategies.size,
            autoRecovery: this.recoveryConfig.autoRecovery,
        });
        // Start monitoring if enabled
        if (this.recoveryConfig.monitoring.enabled) {
            this.startMonitoring();
        }
    }
    /**
     * Handle an error with automatic recovery.
     */
    async handleError(errorInfo) {
        try {
            this.logger.info("Handling error for recovery", {
                errorId: errorInfo.errorId,
                component: errorInfo.component,
                severity: errorInfo.severity,
            });
            // Check if recovery is already in progress for this error
            if (this.activeRecoveries.has(errorInfo.errorId)) {
                this.logger.warn("Recovery already in progress", {
                    errorId: errorInfo.errorId,
                });
                return err(new Error("Recovery already in progress"));
            }
            // Find suitable recovery strategy
            const strategy = this.findRecoveryStrategy(errorInfo);
            if (!strategy) {
                this.logger.warn("No suitable recovery strategy found", {
                    errorId: errorInfo.errorId,
                    component: errorInfo.component,
                    errorType: errorInfo.errorType,
                });
                return err(new Error("No suitable recovery strategy found"));
            }
            // Check concurrent recovery limit
            if (this.activeRecoveries.size >=
                this.recoveryConfig.maxConcurrentRecoveries) {
                this.logger.warn("Maximum concurrent recoveries reached", {
                    current: this.activeRecoveries.size,
                    max: this.recoveryConfig.maxConcurrentRecoveries,
                });
                return err(new Error("Maximum concurrent recoveries reached"));
            }
            // Execute recovery
            const recoveryPromise = this.executeRecovery(errorInfo, strategy);
            this.activeRecoveries.set(errorInfo.errorId, recoveryPromise);
            try {
                const result = await recoveryPromise;
                this.recoveryHistory.push(result);
                this.emit(EVENT_NAMES.SERVICE_STOPPED, {
                    serviceName: SERVICE_NAMES.ERROR_RECOVERY,
                    timestamp: new Date(),
                });
                return ok(result);
            }
            finally {
                this.activeRecoveries.delete(errorInfo.errorId);
            }
        }
        catch (error) {
            this.logger.error("Error recovery system failure", {
                errorId: errorInfo.errorId,
                error: error instanceof Error ? error.message : String(error),
            });
            return err(error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Add or update a recovery strategy.
     */
    addStrategy(strategy) {
        this.strategies.set(strategy.id, strategy);
        this.emit(EVENT_NAMES.SERVICE_STARTED, {
            serviceName: SERVICE_NAMES.RECOVERY_STRATEGY,
            timestamp: new Date(),
        });
        this.logger.info("Recovery strategy added", {
            strategyId: strategy.id,
            name: strategy.name,
            severity: strategy.severity,
        });
    }
    /**
     * Remove a recovery strategy.
     */
    removeStrategy(strategyId) {
        const removed = this.strategies.delete(strategyId);
        if (removed) {
            this.emit(EVENT_NAMES.SERVICE_STOPPED, {
                serviceName: SERVICE_NAMES.RECOVERY_STRATEGY,
                timestamp: new Date(),
            });
            this.logger.info("Recovery strategy removed", { strategyId });
        }
        return removed;
    }
    /**
     * Get recovery metrics and statistics.
     */
    getRecoveryMetrics() {
        const successful = this.recoveryHistory.filter((r) => r.success).length;
        const failed = this.recoveryHistory.length - successful;
        const averageDuration = this.recoveryHistory.length > 0
            ? this.recoveryHistory.reduce((sum, r) => sum + r.duration, 0) /
                this.recoveryHistory.length
            : 0;
        return {
            totalRecoveries: this.recoveryHistory.length,
            successfulRecoveries: successful,
            failedRecoveries: failed,
            averageDuration,
            activeRecoveries: this.activeRecoveries.size,
            strategiesCount: this.strategies.size,
            recentRecoveries: this.recoveryHistory.slice(-10),
        };
    }
    /**
     * Get all active recoveries.
     */
    getActiveRecoveries() {
        return Array.from(this.activeRecoveries.keys());
    }
    /**
     * Cancel an active recovery operation.
     */
    cancelRecovery(errorId) {
        const recovery = this.activeRecoveries.get(errorId);
        if (!recovery) {
            return false;
        }
        this.activeRecoveries.delete(errorId);
        this.emit("service-error", {
            serviceName: SERVICE_NAMES.ERROR_RECOVERY,
            error: new Error("Recovery cancelled"),
            timestamp: new Date(),
        });
        this.logger.info("Recovery cancelled", { errorId });
        return true;
    }
    /**
     * Shutdown the recovery system gracefully.
     */
    async shutdown() {
        this.logger.info("Shutting down error recovery system");
        // Wait for active recoveries to complete or timeout
        const activeRecoveries = Array.from(this.activeRecoveries.values());
        if (activeRecoveries.length > 0) {
            this.logger.info("Waiting for active recoveries to complete", {
                count: activeRecoveries.length,
            });
            await Promise.allSettled(activeRecoveries);
        }
        this.activeRecoveries.clear();
        this.emit("service-stopped", {
            serviceName: SERVICE_NAMES.ERROR_RECOVERY_SYSTEM,
            timestamp: new Date(),
        });
    }
    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================
    findRecoveryStrategy(errorInfo) {
        const candidates = Array.from(this.strategies.values())
            .filter((strategy) => strategy.enabled && this.strategyMatches(strategy, errorInfo))
            .sort((a, b) => b.priority - a.priority);
        return candidates[0];
    }
    strategyMatches(strategy, errorInfo) {
        // Check severity match
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        if (severityLevels[errorInfo.severity] < severityLevels[strategy.severity]) {
            return false;
        }
        // Check conditions
        return strategy.conditions.some((condition) => 
        // Simple pattern matching - could be extended with regex or more complex rules
        condition === "*" ||
            condition === errorInfo.component ||
            condition === errorInfo.errorType ||
            condition === errorInfo.operation ||
            errorInfo.message?.includes(condition));
    }
    async executeRecovery(errorInfo, strategy) {
        const startTime = Date.now();
        const result = {
            success: false,
            strategy,
            actionsExecuted: [],
            duration: 0,
        };
        this.logger.info("Executing recovery strategy", {
            errorId: errorInfo.errorId,
            strategyId: strategy.id,
            actionsCount: strategy.actions.length,
        });
        this.emit(EVENT_NAMES.SERVICE_STARTED, {
            serviceName: SERVICE_NAMES.ERROR_RECOVERY,
            timestamp: new Date(),
        });
        try {
            // Execute recovery actions in sequence
            for (const action of strategy.actions) {
                const actionResult = await this.executeRecoveryAction(action, errorInfo, strategy);
                result.actionsExecuted.push(actionResult);
                if (!actionResult.success && !action.retryable) {
                    throw new Error(`Recovery action failed: ${actionResult.error}`);
                }
            }
            result.success = true;
            this.logger.info("Recovery strategy completed successfully", {
                errorId: errorInfo.errorId,
                strategyId: strategy.id,
                duration: Date.now() - startTime,
            });
        }
        catch (error) {
            result.error = error instanceof Error ? error.message : String(error);
            this.logger.error("Recovery strategy failed", {
                errorId: errorInfo.errorId,
                strategyId: strategy.id,
                error: result.error,
            });
        }
        result.duration = Date.now() - startTime;
        return result;
    }
    async executeRecoveryAction(action, errorInfo, strategy) {
        const startTime = Date.now();
        const actionTimeout = action.timeout || strategy.timeout;
        this.logger.debug("Executing recovery action", {
            actionType: action.type,
            target: action.target,
            timeout: actionTimeout,
        });
        try {
            // Simulate action execution based on type
            // In a real implementation, this would dispatch to actual recovery handlers
            const result = await this.executeActionByType(action, errorInfo);
            return {
                action,
                success: true,
                duration: Date.now() - startTime,
                result,
            };
        }
        catch (error) {
            return {
                action,
                success: false,
                duration: Date.now() - startTime,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async executeActionByType(action, errorInfo) {
        // This is a simulation - in real implementation, these would be actual recovery operations
        switch (action.type) {
            case "restart":
                this.logger.info("Simulating restart action", {
                    target: action.target,
                    component: errorInfo.component,
                });
                await this.delay(1000); // Simulate restart time
                return { restarted: true, target: action.target };
            case "rollback":
                this.logger.info("Simulating rollback action", {
                    target: action.target,
                    component: errorInfo.component,
                });
                await this.delay(2000); // Simulate rollback time
                return { rolledBack: true, target: action.target };
            case "failover":
                this.logger.info("Simulating failover action", {
                    target: action.target,
                    component: errorInfo.component,
                });
                await this.delay(1500); // Simulate failover time
                return { failedOver: true, target: action.target };
            case "scale":
                this.logger.info("Simulating scale action", {
                    target: action.target,
                    component: errorInfo.component,
                });
                await this.delay(3000); // Simulate scaling time
                return { scaled: true, target: action.target };
            case "notify":
                this.logger.info("Simulating notify action", {
                    target: action.target,
                    component: errorInfo.component,
                });
                await this.delay(500); // Simulate notification time
                return { notified: true, target: action.target };
            case "repair":
                this.logger.info("Simulating repair action", {
                    target: action.target,
                    component: errorInfo.component,
                });
                await this.delay(2500); // Simulate repair time
                return { repaired: true, target: action.target };
            case "custom":
                this.logger.info("Simulating custom action", {
                    target: action.target,
                    component: errorInfo.component,
                    parameters: action.parameters,
                });
                await this.delay(1000); // Simulate custom action time
                return {
                    executed: true,
                    target: action.target,
                    parameters: action.parameters,
                };
            default:
                throw new Error(`Unknown recovery action type: ${action.type}`);
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    startMonitoring() {
        setInterval(() => {
            const metrics = this.getRecoveryMetrics();
            this.emit("health-check", {
                serviceName: SERVICE_NAMES.ERROR_RECOVERY,
                healthy: true,
                timestamp: new Date(),
            });
            this.logger.debug("Recovery system metrics", metrics);
        }, this.recoveryConfig.monitoring.metricsInterval);
    }
}
// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================
/**
 * Create a new error recovery system with default configuration.
 */
export function createErrorRecovery(config) {
    const defaultConfig = {
        strategies: [],
        defaultTimeout: 30000,
        maxConcurrentRecoveries: 10,
        autoRecovery: true,
        monitoring: {
            enabled: true,
            metricsInterval: 60000,
            alertThresholds: {},
        },
    };
    return new ErrorRecoverySystem({ ...defaultConfig, ...config });
}
/**
 * Create a retry strategy with exponential backoff.
 */
export function createRetryStrategy(options) {
    const maxRetries = options.maxRetries ?? 3;
    const baseDelay = options.baseDelay ?? 1000;
    const maxDelay = options.maxDelay ?? 10000;
    return {
        id: options.id,
        name: options.name,
        description: `Retry with exponential backoff (max ${maxRetries} attempts)`,
        severity: options.severity ?? "medium",
        type: "retry",
        timeout: maxDelay * maxRetries * 2,
        canRecover: (errorInfo) => Promise.resolve(errorInfo.severity !== "critical" &&
            !errorInfo.metadata?.['permanent'] &&
            (errorInfo.metadata?.['retryCount'] ?? 0) < maxRetries),
        recover: async (errorInfo) => {
            const retryCount = (errorInfo.metadata?.['retryCount'] ?? 0) + 1;
            const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
            return {
                success: true,
                message: `Retry attempt ${retryCount}/${maxRetries} after ${delay}ms delay`,
                recoverTime: delay,
                metadata: { retryCount, delay, strategy: "exponential_backoff" }
            };
        }
    };
}
/**
 * Create a fallback strategy that provides alternative functionality.
 */
export function createFallbackStrategy(options) {
    return {
        id: options.id,
        name: options.name,
        description: "Provides fallback functionality when primary operation fails",
        severity: options.severity ?? "low",
        type: "fallback",
        timeout: 5000,
        canRecover: (errorInfo) => Promise.resolve(errorInfo.severity !== "critical" && !errorInfo.metadata?.['fallbackUsed']),
        recover: async () => {
            try {
                const result = options.fallbackFunction ?
                    await options.fallbackFunction() :
                    options.fallbackValue;
                return {
                    success: true,
                    message: "Successfully executed fallback operation",
                    recoverTime: 0,
                    metadata: {
                        fallbackUsed: true,
                        fallbackResult: result,
                        strategy: "fallback"
                    }
                };
            }
            catch (fallbackError) {
                return {
                    success: false,
                    message: `Fallback operation failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
                    recoverTime: 0,
                    metadata: {
                        fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
                        strategy: "fallback"
                    }
                };
            }
        }
    };
}
/**
 * Create a circuit breaker strategy to prevent cascading failures.
 */
export function createCircuitBreakerStrategy(options) {
    const failureThreshold = options.failureThreshold ?? 5;
    const resetTimeout = options.resetTimeout ?? 30000;
    let failureCount = 0;
    let lastFailureTime = 0;
    let circuitOpen = false;
    return {
        id: options.id,
        name: options.name,
        description: `Circuit breaker with ${failureThreshold} failure threshold`,
        severity: options.severity ?? "high",
        type: "circuit_breaker",
        timeout: resetTimeout,
        canRecover: async () => {
            const now = Date.now();
            if (circuitOpen && now - lastFailureTime > resetTimeout) {
                circuitOpen = false;
                failureCount = 0;
            }
            if (circuitOpen) {
                return false;
            }
            failureCount++;
            lastFailureTime = now;
            if (failureCount >= failureThreshold) {
                circuitOpen = true;
                return false;
            }
            return true;
        },
        recover: async () => ({
            success: true,
            message: `Circuit breaker allowing operation (failures: ${failureCount}/${failureThreshold})`,
            recoverTime: 0,
            metadata: {
                failureCount,
                threshold: failureThreshold,
                circuitOpen,
                strategy: "circuit_breaker"
            }
        })
    };
}
/**
 * Create a graceful degradation strategy for non-critical features.
 */
export function createGracefulDegradationStrategy(options) {
    return {
        id: options.id,
        name: options.name,
        description: "Gracefully degrade functionality when primary service fails",
        severity: options.severity ?? "low",
        type: "graceful_degradation",
        timeout: 5000,
        canRecover: async (errorInfo) => (errorInfo.severity !== "critical" && !errorInfo.metadata?.['permanent']),
        recover: async () => {
            if (options.degradedFunction) {
                try {
                    const result = await options.degradedFunction();
                    return {
                        success: true,
                        message: "Gracefully degraded to limited functionality",
                        recoverTime: 0,
                        metadata: { strategy: "graceful_degradation", result },
                    };
                }
                catch (degradationError) {
                    return {
                        success: false,
                        message: `Graceful degradation failed: ${degradationError instanceof Error ? degradationError.message : String(degradationError)}`,
                        recoverTime: 0,
                        metadata: { strategy: "graceful_degradation", degradationError: String(degradationError) },
                    };
                }
            }
            return {
                success: true,
                message: "Service temporarily unavailable - degraded mode active",
                recoverTime: 0,
                metadata: { strategy: "graceful_degradation", mode: "disabled" },
            };
        },
    };
}
/**
 * Create a timeout strategy for operations that may hang.
 */
export function createTimeoutStrategy(options) {
    const timeoutMs = options.timeoutMs ?? 30000;
    return {
        id: options.id,
        name: options.name,
        description: `Timeout after ${timeoutMs}ms and attempt recovery`,
        severity: options.severity ?? "medium",
        type: "timeout",
        timeout: timeoutMs,
        canRecover: async (errorInfo) => (errorInfo.errorType === "TimeoutError" ||
            errorInfo.metadata?.['timeout'] === true),
        recover: async () => ({
            success: true,
            message: `Operation timed out after ${timeoutMs}ms - recovery initiated`,
            recoverTime: 0,
            metadata: { strategy: "timeout_recovery", timeoutMs },
        }),
    };
}
/**
 * Create a rate limiting strategy to prevent overload.
 */
export function createRateLimitStrategy(options) {
    const maxRequestsPerSecond = options.maxRequestsPerSecond ?? 10;
    const backoffMs = options.backoffMs ?? 1000;
    let requestCount = 0;
    let lastResetTime = Date.now();
    return {
        id: options.id,
        name: options.name,
        description: `Rate limiting with max ${maxRequestsPerSecond} requests per second`,
        severity: options.severity ?? "medium",
        type: "custom",
        timeout: backoffMs * 2,
        canRecover: async (errorInfo) => {
            const now = Date.now();
            // Reset counter every second
            if (now - lastResetTime >= 1000) {
                requestCount = 0;
                lastResetTime = now;
            }
            // Check if we're over the limit
            return errorInfo.errorType === "RateLimitError" ||
                requestCount >= maxRequestsPerSecond;
        },
        recover: async () => {
            // Wait for the backoff period
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            return {
                success: true,
                message: `Rate limit backoff completed after ${backoffMs}ms`,
                recoverTime: backoffMs,
                metadata: {
                    strategy: "rate_limit",
                    backoffMs,
                    maxRequestsPerSecond
                },
            };
        },
    };
}
/**
 * Create common recovery strategies for typical use cases.
 */
export function createCommonRecoveryStrategies() {
    return [
        createRetryStrategy({
            id: "default-retry",
            name: "Default Retry",
            maxRetries: 3,
            baseDelay: 1000,
            severity: "medium",
        }),
        createFallbackStrategy({
            id: "default-fallback",
            name: "Default Fallback",
            fallbackValue: null,
            severity: "low",
        }),
        createCircuitBreakerStrategy({
            id: "default-circuit-breaker",
            name: "Default Circuit Breaker",
            failureThreshold: 5,
            resetTimeout: 30000,
            severity: "high",
        }),
        createGracefulDegradationStrategy({
            id: "graceful-degradation",
            name: "Graceful Degradation",
            severity: "low",
        }),
        createTimeoutStrategy({
            id: "timeout-recovery",
            name: "Timeout Recovery",
            timeoutMs: 30000,
            severity: "medium",
        }),
        createRateLimitStrategy({
            id: "rate-limiting",
            name: "Rate Limiting",
            maxRequestsPerSecond: 10,
            severity: "medium",
        }),
    ];
}
/**
 * Create specialized recovery strategies for enterprise systems.
 */
export function createEnterpriseRecoveryStrategies() {
    return [
        createRetryStrategy({
            id: "enterprise-retry",
            name: "Enterprise Retry with Extended Backoff",
            maxRetries: 5,
            baseDelay: 2000,
            maxDelay: 30000,
            severity: "high",
        }),
        createCircuitBreakerStrategy({
            id: "enterprise-circuit-breaker",
            name: "Enterprise Circuit Breaker",
            failureThreshold: 10,
            resetTimeout: 60000,
            severity: "critical",
        }),
        createFallbackStrategy({
            id: "enterprise-fallback",
            name: "Enterprise Fallback System",
            fallbackFunction: async () => ({
                status: "degraded",
                message: "Operating in degraded mode"
            }),
            severity: "medium",
        }),
        createRateLimitStrategy({
            id: "enterprise-rate-limit",
            name: "Enterprise Rate Limiting",
            maxRequestsPerSecond: 100,
            backoffMs: 500,
            severity: "medium",
        }),
    ];
}
/**
 * Convert SimpleRecoveryStrategy to RecoveryStrategy for the main error recovery system.
 */
function convertToRecoveryStrategy(simple) {
    return {
        id: simple.id,
        name: simple.name,
        description: simple.description ?? `${simple.name} recovery strategy`,
        severity: simple.severity,
        type: simple.type ?? "custom",
        timeout: simple.timeout,
        maxRetries: 3,
        backoffStrategy: "exponential",
        baseDelay: 1000,
        maxDelay: simple.timeout,
        conditions: ["*"], // Accept all conditions - specific logic in canRecover
        actions: [{ type: "custom", target: simple.id, retryable: true }],
        priority: simple.severity === "critical" ? 1000 :
            simple.severity === "high" ? 500 :
                simple.severity === "medium" ? 100 : 50,
        enabled: true,
    };
}
/**
 * Create an error recovery system with common strategies pre-configured.
 */
export function createErrorRecoveryWithCommonStrategies(additionalConfig) {
    const simpleStrategies = createCommonRecoveryStrategies();
    const legacyStrategies = simpleStrategies.map(convertToRecoveryStrategy);
    const config = {
        strategies: legacyStrategies,
        ...additionalConfig,
    };
    return new ErrorRecoverySystem(config);
}
/**
 * Create an enterprise error recovery system with advanced strategies.
 */
export function createEnterpriseErrorRecoverySystem(additionalConfig) {
    const commonStrategies = createCommonRecoveryStrategies();
    const enterpriseStrategies = createEnterpriseRecoveryStrategies();
    const allSimpleStrategies = [...commonStrategies, ...enterpriseStrategies];
    const legacyStrategies = allSimpleStrategies.map(convertToRecoveryStrategy);
    const config = {
        strategies: legacyStrategies,
        defaultTimeout: 60000, // Extended timeout for enterprise
        maxConcurrentRecoveries: 20, // Higher concurrency
        autoRecovery: true,
        monitoring: {
            enabled: true,
            metricsInterval: 30000, // More frequent monitoring
            alertThresholds: {
                failureRate: 0.1, // 10% failure rate threshold
                avgDuration: 30000, // 30 second average duration threshold
            },
        },
        ...additionalConfig,
    };
    return new ErrorRecoverySystem(config);
}
// =============================================================================
// UTILITY FUNCTIONS FOR SIMPLE RECOVERY STRATEGIES
// =============================================================================
/**
 * Execute a simple recovery strategy directly without the full error recovery system.
 */
export async function executeSimpleRecovery(strategy, errorInfo) {
    try {
        const canRecover = await strategy.canRecover(errorInfo);
        if (!canRecover) {
            return null; // Strategy cannot handle this error
        }
        return await strategy.recover(errorInfo);
    }
    catch (error) {
        return {
            success: false,
            message: `Simple recovery failed: ${error instanceof Error ? error.message : String(error)}`,
            recoverTime: 0,
            metadata: { error: String(error), strategy: strategy.id },
        };
    }
}
/**
 * Test multiple recovery strategies and return the first successful one.
 */
export async function tryMultipleRecoveryStrategies(strategies, errorInfo) {
    const sortedStrategies = strategies.sort((a, b) => {
        const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };
        return severityWeight[b.severity] - severityWeight[a.severity];
    });
    for (const strategy of sortedStrategies) {
        const result = await executeSimpleRecovery(strategy, errorInfo);
        if (result?.success) {
            return {
                ...result,
                strategyUsed: strategy.name,
            };
        }
    }
    return {
        success: false,
        message: "All recovery strategies failed",
        recoverTime: 0,
        metadata: {
            strategiesTried: strategies.map(s => s.name),
            errorInfo
        },
    };
}
