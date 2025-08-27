/**
 * @fileoverview System Monitoring Implementation
 *
 * System monitoring using @claude-zen/telemetry for metrics collection.
 */
import type { HealthStatus, InfrastructureConfig, SystemMetrics } from './types.js';
/**
 * System resource monitoring using telemetry
 */
export declare class SystemMonitor {
    private config;
    private logger;
    ': any;
    private monitoringInterval;
    private initialized;
    constructor(config?: InfrastructureConfig);
    initialize(): Promise<void>;
    shutdown(): void;
    /**
     * Get current system metrics
     */
    getMetrics(): Promise<SystemMetrics>;
    /**
     * Get process-specific metrics using pidusage
     */
    getProcessMetrics(pid?: number): Promise<any>;
    /**
     * Get all running processes metrics
     */
    getAllProcessesMetrics(): Promise<any[]>;
    /**
     * Get system health status
     */
    getHealthStatus(): Promise<HealthStatus>;
    uptime: {
        status: 'ok';
        value: metrics.uptime;
        threshold: 0;
        message: `System uptime: ${Math.round;
        (metrics: any, uptime: any): any;
    };
}
/**
 * Performance tracking for operations
 */
export declare class PerformanceTracker {
    ': any;
    /**
     * Start timing an operation with high precision
     */
    startTimer(name: string): () => number;
    /**
     * Time an async operation
     */
    timeAsync<T>(name: string, operation: () => Promise<T>): Promise<T>;
    /**
     * Time a sync operation
     */
    time<T>(name: string, operation: () => T): T;
    /**
     * Record operation duration
     */
    recordDuration(name: string, duration: number): void;
    /**
     * Get performance metrics with statistical analysis
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Calculate performance trend
     */
    private calculateTrend;
    ' {': any;
    if(durations: any, length: any, : any, : any): any;
}
/**
 * System health checker
 */
export declare class HealthChecker {
    private monitor;
    constructor(config?: InfrastructureConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    /**
     * Perform health check
     */
    check(): Promise<HealthStatus>;
}
/**
 * Infrastructure-specific metrics collection
 */
export declare class InfrastructureMetrics {
    /**
     * Track system operation
     */
    trackSystemOperation(operation: string, duration: number, success: boolean): void;
}
/**
 * Create system monitor instance
 */
export declare function createSystemMonitor(config?: InfrastructureConfig): SystemMonitor;
/**
 * Create performance tracker instance
 */
export declare function createPerformanceTracker(): PerformanceTracker;
/**
 * Create health checker instance
 */
export declare function createHealthChecker(config?: InfrastructureConfig): HealthChecker;
/**
 * Get system monitoring access (main facade interface)
 */
export declare function getSystemMonitoring(config?: SystemMonitoringConfig): Promise<any>;
//# sourceMappingURL=monitoring.d.ts.map