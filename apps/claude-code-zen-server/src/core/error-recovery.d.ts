/**
 * Error Recovery Strategies and Circuit Breaker Patterns.
 *
 * Implements sophisticated error recovery mechanisms for Claude-Zen distributed systems.
 * Includes retry patterns, circuit breakers, fallback strategies, and graceful degradation.
 */
/**
 * @file Error-recovery implementation.
 */
export declare enum CircuitBreakerState {
    CLOSED = "closed",// Normal operation
    OPEN = "open",// Failing fast
    HALF_OPEN = "half_open"
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    recoveryTimeout: number;
    successThreshold: number;
    monitoringWindow: number;
    maxRetries: number;
}
export interface CircuitBreakerMetrics {
    state: CircuitBreakerState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
    lastSuccessTime: number;
    totalCalls: number;
    totalFailures: number;
    averageResponseTime: number;
}
export declare class CircuitBreaker {
    private readonly name;
    private readonly config;
    private state;
    private failureCount;
    private successCount;
    private lastFailureTime;
    private lastSuccessTime;
    private totalCalls;
    private totalFailures;
    private responseTimes;
    private nextAttemptTime;
    private failureHistory;
    private callHistory;
    constructor(name: string, config: CircuitBreakerConfig);
    execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private shouldOpenCircuit;
    getMetrics(): CircuitBreakerMetrics;
    reset(): void;
}
export interface RetryConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    exponentialBase: number;
    jitterEnabled: boolean;
    retryableErrors: string[];
}
export declare class RetryStrategy {
    private readonly config;
    constructor(config?: Partial<RetryConfig>);
    execute<T>(operation: () => Promise<T>, operationName?: string): Promise<T>;
    private shouldRetryError;
    private calculateDelay;
    private sleep;
}
export interface FallbackStrategy<T> {
    name: string;
    handler: () => Promise<T>;
    condition?: (error: Error) => boolean;
    priority: number;
}
export declare class FallbackManager<T> {
    private readonly operationName;
    private strategies;
    constructor(operationName: string);
    addStrategy(strategy: FallbackStrategy<T>): void;
    executeWithFallbacks(_primaryOperation: () => Promise<T>, error: Error): Promise<T>;
}
export interface DegradationLevel {
    level: number;
    name: string;
    description: string;
    enabledFeatures: string[];
    disabledFeatures: string[];
}
export declare class GracefulDegradationManager {
    private currentLevel;
    private readonly levels;
    private readonly errorCounts;
    private readonly errorThresholds;
    constructor();
    private initializeDefaultLevels;
    addDegradationLevel(level: DegradationLevel): void;
    reportError(error: Error): void;
    private evaluateDegradation;
    setDegradationLevel(level: number): void;
    isFeatureEnabled(feature: string): boolean;
    getCurrentLevel(): DegradationLevel | undefined;
    resetErrorCounts(): void;
    getErrorCounts(): Map<string, number>;
}
export declare class CircuitBreakerRegistry {
    private static instance;
    private breakers;
    static getInstance(): CircuitBreakerRegistry;
    getOrCreate(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
    getAllMetrics(): Map<string, CircuitBreakerMetrics>;
    resetAll(): void;
}
export declare class ErrorRecoveryOrchestrator {
    private circuitBreakerRegistry;
    private degradationManager;
    private retryStrategies;
    private fallbackManagers;
    executeWithRecovery<T>(operationName: string, operation: () => Promise<T>, options?: ErrorRecoveryOptions): Promise<T>;
    private getOrCreateRetryStrategy;
    addFallbackStrategy<T>(operationName: string, strategy: FallbackStrategy<T>): void;
    getSystemHealth(): {
        degradationLevel: DegradationLevel | undefined;
        circuitBreakers: Map<string, CircuitBreakerMetrics>;
        errorCounts: Map<string, number>;
    };
    resetSystem(): void;
    isFeatureEnabled(feature: string): boolean;
}
export declare const errorRecoveryOrchestrator: ErrorRecoveryOrchestrator;
//# sourceMappingURL=error-recovery.d.ts.map