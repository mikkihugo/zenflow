/**
 * Error System Integration.
 *
 * Central integration point for all error handling, recovery, monitoring,
 * and resilience systems in Claude-Zen.
 */
/**
 * @file Error-system-integration implementation.
 */
import { BaseClaudeZenError, type ErrorContext } from './errors';
export interface ErrorHandlingConfig {
    maxRetries: number;
    retryDelayMs: number;
    exponentialBackoff: boolean;
    circuitBreakerThreshold: number;
    monitoringEnabled: boolean;
    monitoringIntervalMs: number;
    alertsEnabled: boolean;
    bulkheadsEnabled: boolean;
    errorBoundariesEnabled: boolean;
    resourceLimitsEnabled: boolean;
    emergencyShutdownEnabled: boolean;
    emergencyThresholds: {
        criticalErrorRate: number;
        memoryUsagePercent: number;
        systemHealthScore: number;
    };
}
export declare class IntegratedErrorHandler {
    private config;
    private initialized;
    private emergencyMode;
    constructor(config?: Partial<ErrorHandlingConfig>);
    initialize(): Promise<void>;
    private setupMonitoring;
    private setupAlerts;
    private setupEmergencyProcedures;
    private setupSystemFallbacks;
    private checkEmergencyThresholds;
    handleError(error: Error, context?: Partial<ErrorContext>, options?: {
        useRecovery?: boolean;
        useFallback?: boolean;
        reportToMonitoring?: boolean;
    }): Promise<{
        recovered: boolean;
        result?: unknown;
        finalError?: BaseClaudeZenError;
    }>;
    private classifyError;
    executeWithErrorHandling<T>(operation: () => Promise<T>, context: Partial<ErrorContext>, options?: {
        resilience?: {
            bulkhead?: string;
            errorBoundary?: string;
            timeoutMs?: number;
        };
        recovery?: {
            maxRetries?: number;
            fallbackEnabled?: boolean;
        };
    }): Promise<T>;
    getSystemStatus(): {
        initialized: boolean;
        emergencyMode: boolean;
        errorHandling: unknown;
        monitoring: unknown;
        resilience: unknown;
        recovery: unknown;
    };
    shutdown(): Promise<void>;
}
export declare function initializeErrorHandling(config?: Partial<ErrorHandlingConfig>): Promise<void>;
export declare function getErrorHandler(): IntegratedErrorHandler;
export declare function handleErrorGlobally(error: Error, context?: Partial<ErrorContext>): Promise<{
    recovered: boolean;
    result?: unknown;
    finalError?: BaseClaudeZenError;
}>;
export declare function executeWithErrorHandling<T>(operation: () => Promise<T>, context: Partial<ErrorContext>, options?: unknown): Promise<T>;
export declare function getSystemStatus(): unknown;
export declare function shutdownErrorHandling(): Promise<void>;
export * from './error-monitoring';
export * from './error-recovery';
export * from './errors';
export * from './system-resilience';
//# sourceMappingURL=error-system-integration.d.ts.map