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
    getProcessMetrics(pid?: number): Promise<{
        pid: number;
        cpu: number;
        memory: number;
        ppid: number;
        ctime: number;
        elapsed: number;
        timestamp: number;
        name?: string;
        command?: string;
        memoryPercent?: number;
        state?: string;
        started?: number;
        user?: string;
        error?: string;
    }>;
    /**
     * Get all running processes metrics
     */
    getAllProcessesMetrics(): Promise<any[]>;
    /**
     * Get system health status
     */
    getHealthStatus(): Promise<HealthStatus>;
    private startSystemMetricsCollection;
}
/**
 * Performance tracking for operations
 */
export declare class PerformanceTracker {
    private operations;
    private logger;
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
    /**
     * Reset performance data
     */
    reset(): void;
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
    /**
     * Track resource utilization
     */
    trackResourceUtilization(resource: string, utilization: number): void;
    /**
     * Track infrastructure event
     */
    trackEvent(event: string, attributes?: Record<string, any>): void;
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
export declare function getSystemMonitoring(config?: any): Promise<any>;
//# sourceMappingURL=monitoring.d.ts.map