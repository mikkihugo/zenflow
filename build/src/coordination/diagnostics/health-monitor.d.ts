/**
 * @file Coordination system: health-monitor.
 */
import { EventEmitter } from 'node:events';
export interface HealthMonitorOptions {
    checkInterval?: number;
    alertThreshold?: number;
    criticalThreshold?: number;
    enableSystemChecks?: boolean;
    enableCustomChecks?: boolean;
    maxHistorySize?: number;
    [key: string]: unknown;
}
export type HealthCheckFunction = () => Promise<HealthCheckResult | Partial<HealthCheckResult>> | HealthCheckResult | Partial<HealthCheckResult>;
export interface HealthCheck {
    name: string;
    checkFunction: HealthCheckFunction;
    weight: number;
    timeout: number;
    enabled: boolean;
    critical: boolean;
    description: string;
    lastRun: string | null;
    lastResult: HealthCheckResult | null;
    runCount: number;
    errorCount: number;
}
export interface HealthCheckResult {
    score: number;
    status: string;
    details: string;
    metrics: Record<string, unknown>;
    duration: number;
}
export interface HealthReport {
    id: string;
    timestamp: string;
    overallScore: number;
    status: 'healthy' | 'warning' | 'critical';
    duration: number;
    checkCount: number;
    criticalFailures: number;
    results: Record<string, HealthCheckResult>;
}
export interface HealthAlert {
    id: string;
    type: 'critical' | 'warning';
    timestamp: string;
    title: string;
    message: string;
    details: Record<string, unknown> | string | null;
    resolved: boolean;
}
/**
 * HealthMonitor provides comprehensive system health monitoring
 * with configurable checks and automatic alerting.
 *
 * @example.
 * @example
 */
export declare class HealthMonitor extends EventEmitter {
    private options;
    private isRunning;
    private checkTimer;
    private healthChecks;
    private healthHistory;
    private currentHealth;
    private alerts;
    private startTime?;
    private persistenceChecker?;
    constructor(options?: HealthMonitorOptions);
    /**
     * Start health monitoring.
     */
    start(): Promise<void>;
    /**
     * Stop health monitoring.
     */
    stop(): Promise<void>;
    /**
     * Register a custom health check.
     *
     * @param name
     * @param checkFunction
     * @param options
     */
    registerHealthCheck(name: string, checkFunction: HealthCheckFunction, options?: Partial<HealthCheck>): HealthCheck;
    /**
     * Remove a health check.
     *
     * @param name
     */
    unregisterHealthCheck(name: string): boolean;
    /**
     * Run all health checks.
     */
    runHealthChecks(): Promise<HealthReport>;
    /**
     * Run a single health check.
     *
     * @param name
     * @param check
     */
    runSingleHealthCheck(name: string, check: HealthCheck): Promise<HealthCheckResult>;
    /**
     * Get current system health status.
     */
    getCurrentHealth(): any;
    /**
     * Get health history.
     *
     * @param limit
     */
    getHealthHistory(limit?: number): HealthReport[];
    /**
     * Get health trends and analysis.
     */
    getHealthTrends(): any;
    private initializeSystemChecks;
    private determineHealthStatus;
    private processHealthAlerts;
    /**
     * Set persistence checker function.
     *
     * @param checkerFunction
     */
    setPersistenceChecker(checkerFunction: () => Promise<void>): void;
    /**
     * Cleanup resources.
     */
    destroy(): Promise<void>;
}
export default HealthMonitor;
//# sourceMappingURL=health-monitor.d.ts.map