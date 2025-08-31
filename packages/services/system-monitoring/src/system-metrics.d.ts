/**
 * @fileoverview System Metrics Collection - System Monitoring Implementation
 *
 * **MOVED FROM FOUNDATION  SYSTEM MONITORING IMPLEMENTATION**
 *
 * Real system metrics collection implementation for accurate CPU, memory, and performance measurements.
 * This belongs in the implementation package, not in the foundation facade.
 *
 * Key Features:
 * - Real-time system performance monitoring
 * - CPU usage tracking with baseline measurements
 * - Memory metrics (system and process heap)
 * - Performance tracking for operations
 * - System health assessment with recommendations
 * - Agent-specific metrics with realistic variations
 *
 * **FOUNDATION INTEGRATION:**
 * - Uses foundation Logger interface
 * - Integrates with foundation error handling
 * - Available for DI injection
 * - Follows foundation patterns
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (extracted from main app)
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export interface CpuMetrics {
    usage_percent: number;
    user_time_ms: number;
    system_time_ms: number;
    cores: number;
    load_average: number[];
}
export interface MemoryMetrics {
    used_mb: number;
    total_mb: number;
    free_mb: number;
    heap_used_mb: number;
    heap_total_mb: number;
    external_mb: number;
    rss_mb: number;
}
export interface SystemPerformanceTracker {
    start_time: number;
    end_time?: number;
    duration_ms?: number;
    memory_start: NodeJS.MemoryUsage;
    memory_end?: NodeJS.MemoryUsage;
    memory_delta_mb?: number;
}
export interface SystemHealth {
    status: 'healthy' | ' warning' | ' critical';
    cpu_health: 'good' | ' high' | ' critical';
    memory_health: 'good' | ' high' | ' critical';
    load_health: 'good' | ' high' | ' critical';
    recommendations: string[];
}
export declare class SystemMetricsError extends Error {
    readonly metric?: string | undefined;
    constructor(message: string, metric?: string | undefined);
}
export declare class SystemMetricsCollector {
    private static instance;
    private cpuBaseline;
    private lastCpuCheck;
    private performanceTrackers;
    private logger;
    private constructor();
    /**
     * Get singleton instance with optional logger
     */
    static getInstance(logger?: Logger): SystemMetricsCollector;
    /**
     * Get CPU metrics
     */
    getCpuMetrics(): CpuMetrics;
    /**
     * Get memory metrics
     */
    getMemoryMetrics(): MemoryMetrics;
    /**
     * Start performance tracking for an operation
     */
    startPerformanceTracking(operationId: string): void;
}
/**
 * DI token for SystemMetricsCollector
 */
export declare const SYSTEM_METRICS_COLLECTOR_TOKEN: unique symbol;
/**
 * Create SystemMetricsCollector with DI
 */
export declare function createSystemMetricsCollector(logger?: Logger): SystemMetricsCollector;
//# sourceMappingURL=system-metrics.d.ts.map