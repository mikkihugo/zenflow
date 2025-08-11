/**
 * Error Monitoring System.
 * Comprehensive error tracking, analysis, and reporting for Claude-Zen.
 */
/**
 * @file Error-monitoring implementation.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/interfaces/base-interfaces.ts';
export interface ErrorContext {
    component: string;
    operation: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
    stackTrace?: string;
    timestamp: Date;
}
export interface ErrorMetrics {
    totalErrors: number;
    errorRate: number;
    criticalErrors: number;
    errorsByComponent: Record<string, number>;
    errorsByType: Record<string, number>;
    lastError?: Date;
    mttr: number;
}
export interface ErrorPattern {
    id: string;
    pattern: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    threshold: number;
    timeWindow: number;
    actions: string[];
}
export interface ErrorAlert {
    id: string;
    type: 'threshold' | 'pattern' | 'critical';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
    count: number;
    timeframe: string;
    timestamp: Date;
}
export declare class ErrorMonitoring extends EventEmitter {
    private logger;
    private errors;
    private patterns;
    private metrics;
    private monitoringInterval?;
    constructor(logger: ILogger);
    /**
     * Record an error.
     *
     * @param error
     * @param context
     */
    recordError(error: Error, context?: Partial<ErrorContext>): void;
    /**
     * Add error pattern monitoring.
     *
     * @param pattern
     */
    addPattern(pattern: ErrorPattern): void;
    /**
     * Remove error pattern.
     *
     * @param patternId
     */
    removePattern(patternId: string): void;
    /**
     * Get current error metrics.
     */
    getMetrics(): ErrorMetrics;
    /**
     * Get errors for a specific component.
     *
     * @param component
     * @param since
     */
    getComponentErrors(component: string, since?: Date): ErrorContext[];
    /**
     * Get error trends over time.
     *
     * @param component
     * @param timeWindow
     */
    getErrorTrends(component?: string, timeWindow?: number): {
        hourly: number[];
        daily: number[];
        components: Record<string, number>;
    };
    /**
     * Clear old errors.
     *
     * @param maxAge
     */
    clearOldErrors(maxAge?: number): void;
    /**
     * Generate error report.
     *
     * @param timeWindow
     */
    generateReport(timeWindow?: number): {
        summary: ErrorMetrics;
        trends: ReturnType<ErrorMonitoring['getErrorTrends']>;
        topErrors: Array<{
            error: string;
            count: number;
            component: string;
        }>;
        recentAlerts: ErrorAlert[];
    };
    private updateMetrics;
    private checkPatterns;
    private matchesPattern;
    private countRecentMatches;
    private triggerAlert;
    private isCriticalError;
    private initializeDefaultPatterns;
    private startMonitoring;
    shutdown(): Promise<void>;
}
export declare function createErrorMonitoring(logger: ILogger): ErrorMonitoring;
export default ErrorMonitoring;
//# sourceMappingURL=error-monitoring.d.ts.map