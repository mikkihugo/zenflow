/**
 * @file Batch Performance Monitor
 * Tracks and compares batch vs sequential execution performance.
 * Implements claude-zen's performance monitoring patterns.
 */
export interface BatchExecutionSummary {
    totalOperations: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    successfulOperations: number;
    failedOperations: number;
    startTime: number;
    endTime: number;
}
export interface PerformanceMetrics {
    executionMode: 'batch' | 'sequential';
    operationCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    successRate: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
    timestamp: number;
}
export interface PerformanceComparison {
    batchMetrics: PerformanceMetrics;
    sequentialMetrics: PerformanceMetrics;
    speedImprovement: number;
    throughputImprovement: number;
    resourceEfficiency: number;
    tokenReduction: number;
    recommendations: string[];
}
export interface PerformanceTrend {
    metric: keyof PerformanceMetrics;
    values: number[];
    timestamps: number[];
    trend: 'improving' | 'declining' | 'stable';
    changeRate: number;
}
/**
 * Monitors and tracks performance of batch operations vs sequential execution.
 * Provides insights and recommendations for optimization.
 *
 * @example
 */
export declare class BatchPerformanceMonitor {
    private readonly metricsHistory;
    private readonly maxHistorySize;
    private performanceBaseline;
    constructor(maxHistorySize?: number);
    /**
     * Record performance metrics for a batch execution.
     *
     * @param summary
     * @param resourceUsage
     * @param resourceUsage.memory
     * @param resourceUsage.cpu
     */
    recordBatchExecution(summary: BatchExecutionSummary, resourceUsage?: {
        memory: number;
        cpu: number;
    }): PerformanceMetrics;
    /**
     * Record performance metrics for sequential execution (for comparison).
     *
     * @param operationCount
     * @param executionTime
     * @param successfulOperations
     * @param resourceUsage.
     * @param resourceUsage.memory
     * @param resourceUsage.cpu
     * @param resourceUsage
     */
    recordSequentialExecution(operationCount: number, executionTime: number, successfulOperations: number, resourceUsage?: {
        memory: number;
        cpu: number;
    }): PerformanceMetrics;
    /**
     * Compare batch vs sequential performance.
     *
     * @param batchMetrics
     * @param sequentialMetrics
     */
    comparePerformance(batchMetrics: PerformanceMetrics, sequentialMetrics: PerformanceMetrics): PerformanceComparison;
    /**
     * Generate performance improvement recommendations.
     *
     * @param speedImprovement
     * @param throughputImprovement
     * @param resourceEfficiency
     * @param batchMetrics
     * @param _sequentialMetrics
     */
    private generateRecommendations;
    /**
     * Get performance trends over time.
     *
     * @param metric
     * @param hours
     */
    getPerformanceTrends(metric: keyof PerformanceMetrics, hours?: number): PerformanceTrend;
    /**
     * Calculate trend direction using simple linear regression.
     *
     * @param values
     * @param timestamps
     */
    private calculateTrend;
    /**
     * Calculate percentage change rate per hour.
     *
     * @param values
     * @param hours
     */
    private calculateChangeRate;
    /**
     * Get summary of recent performance.
     *
     * @param hours
     */
    getPerformanceSummary(hours?: number): {
        totalExecutions: number;
        batchExecutions: number;
        sequentialExecutions: number;
        averageSpeedImprovement: number;
        averageTokenReduction: number;
        recommendations: string[];
    };
    /**
     * Generate summary recommendations.
     *
     * @param batchCount
     * @param sequentialCount
     * @param avgSpeedImprovement
     * @param avgTokenReduction
     */
    private generateSummaryRecommendations;
    /**
     * Set performance baseline for comparison.
     *
     * @param metrics
     */
    setBaseline(metrics: PerformanceMetrics): void;
    /**
     * Compare current metrics against baseline.
     *
     * @param currentMetrics
     */
    compareToBaseline(currentMetrics: PerformanceMetrics): {
        improvement: number;
        recommendation: string;
    } | null;
    /**
     * Add metrics to history with size management.
     *
     * @param metrics
     */
    private addMetrics;
    /**
     * Get all metrics history.
     */
    getMetricsHistory(): readonly PerformanceMetrics[];
    /**
     * Clear metrics history.
     */
    clearHistory(): void;
    /**
     * Export performance data for analysis.
     */
    exportPerformanceData(): {
        metrics: PerformanceMetrics[];
        baseline: PerformanceMetrics | null;
        summary: ReturnType<BatchPerformanceMonitor['getPerformanceSummary']>;
    };
}
//# sourceMappingURL=performance-monitor.d.ts.map