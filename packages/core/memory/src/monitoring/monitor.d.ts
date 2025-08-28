/**
 * @file Real-time Memory System Monitor
 * Comprehensive monitoring and analytics for memory operations.
 */
import { EventEmitter } from '@claude-zen/foundation';
import type { MemoryCoordinator } from '../core/memory-coordinator';
import type { BackendInterface } from '../core/memory-system';
import type { PerformanceOptimizer } from '../optimization/performance-optimizer';
export interface MemoryMetrics {
    timestamp: number;
    operationsPerSecond: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    totalMemoryUsage: number;
    cacheSize: number;
    cacheHitRate: number;
    cacheMissRate: number;
    activeNodes: number;
    healthyNodes: number;
    consensus: {
        decisions: number;
        successful: number;
        failed: number;
        averageTime: number;
    };
    backends: {
        [id: string]: {
            status: 'healthy|degraded|failed';
            operations: number;
            errors: number;
            latency: number;
        };
    };
    errorRate: number;
    errorsByType: Record<string, number>;
    recoveryRate: number;
}
export interface MemoryAlert {
    id: string;
    type: 'performance|capacity|error|coordination';
    severity: 'info|warning|error|critical';
    message: string;
    timestamp: number;
    source: string;
    metadata?: Record<string, unknown>;
    acknowledged: boolean;
    resolved: boolean;
}
export interface MonitoringConfig {
    enabled: boolean;
    collectInterval: number;
    retentionPeriod: number;
    alerts: {
        enabled: boolean;
        thresholds: {
            latency: number;
            errorRate: number;
            memoryUsage: number;
            cacheHitRate: number;
        };
    };
    metrics: {
        detailed: boolean;
        histograms: boolean;
        percentiles: boolean;
    };
}
/**
 * Real-time Memory Monitor.
 * Provides comprehensive monitoring and alerting for memory systems.
 *
 * @example
 */
export declare class MemoryMonitor extends EventEmitter {
    private config;
    private metrics;
    private alerts;
    private collecting;
    private collectInterval;
    private backends;
    private coordinator?;
    private optimizer?;
    private operationHistory;
    private latencyHistogram;
    constructor(config: MonitoringConfig);
    /**
     * Register components for monitoring.
     *
     * @param id
     * @param backend
     */
    registerBackend(id: string, backend: BackendInterface): void;
    registerCoordinator(coordinator: MemoryCoordinator): void;
    registerOptimizer(optimizer: PerformanceOptimizer): void;
    /**
     * Start metric collection.
     */
    startCollection(): void;
    /**
     * Stop metric collection.
     */
    stopCollection(): void;
    /**
     * Record an operation for tracking.
     *
     * @param operation
     * @param duration
     * @param success
     */
    recordOperation(operation: string, duration: number, success: boolean): void;
    /**
     * Collect current metrics.
     */
    private collectMetrics;
    /**
     * Check metrics against alert thresholds.
     *
     * @param metrics
     */
    private checkAlerts;
    if(metrics: any, cacheHitRate: any, : any, thresholds: any, cacheHitRate: any): void;
}
//# sourceMappingURL=monitor.d.ts.map