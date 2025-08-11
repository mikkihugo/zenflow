/**
 * Real-time Performance Monitoring System for Claude-Zen.
 * Provides comprehensive performance tracking and alerting.
 */
/**
 * @file Real-time-monitor implementation.
 */
import { EventEmitter } from 'node:events';
export interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    tags?: Record<string, string>;
}
export interface PerformanceBounds {
    min?: number;
    max?: number;
    p95?: number;
    p99?: number;
}
export interface AlertConfig {
    metric: string;
    threshold: number;
    comparison: 'gt' | 'lt' | 'eq';
    enabled: boolean;
}
export declare class RealTimePerformanceMonitor extends EventEmitter {
    private config;
    private metrics;
    private alerts;
    private isMonitoring;
    private monitoringInterval?;
    constructor(config?: {
        retentionPeriod?: number;
        alertThresholds?: AlertConfig[];
        samplingInterval?: number;
    });
    /**
     * Start real-time monitoring.
     */
    start(): void;
    /**
     * Stop monitoring.
     */
    stop(): void;
    /**
     * Record a performance metric.
     *
     * @param name
     * @param value
     * @param tags
     */
    record(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Measure execution time of a function.
     *
     * @param name
     * @param fn
     * @param tags
     */
    measure<T>(name: string, fn: () => T, tags?: Record<string, string>): T;
    /**
     * Measure async function execution time.
     *
     * @param name
     * @param fn
     * @param tags
     */
    measureAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T>;
    /**
     * Get performance metrics for a specific metric name.
     *
     * @param name
     */
    getMetrics(name: string): PerformanceMetric[];
    /**
     * Get aggregated statistics for a metric.
     *
     * @param name
     */
    getStats(name: string): PerformanceBounds & {
        count: number;
    };
    /**
     * Get current system performance snapshot.
     */
    getSystemSnapshot(): Record<string, any>;
    /**
     * Generate performance report.
     */
    generateReport(): string;
    /**
     * Add performance alert.
     *
     * @param alert
     */
    addAlert(alert: AlertConfig): void;
    /**
     * Remove performance alert.
     *
     * @param metric
     */
    removeAlert(metric: string): void;
    /**
     * Private methods.
     */
    private collectSystemMetrics;
    private cleanupOldMetrics;
    private checkAlerts;
    private checkMetricAlerts;
    private evaluateAlert;
    private percentile;
    private setupDefaultAlerts;
}
export declare const globalMonitor: RealTimePerformanceMonitor;
export declare function monitored(metricName?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function monitoredAsync(metricName?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=real-time-monitor.d.ts.map