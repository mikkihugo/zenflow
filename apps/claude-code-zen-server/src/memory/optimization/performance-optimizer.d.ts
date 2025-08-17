/**
 * @file Advanced Performance Optimizer for Memory Systems
 * Provides intelligent performance optimization for memory operations.
 */
import { EventEmitter } from 'node:events';
import type { BackendInterface } from '../core/memory-system';
export interface PerformanceMetrics {
    operationsPerSecond: number;
    averageLatency: number;
    memoryUsage: number;
    cacheHitRate: number;
    errorRate: number;
    lastUpdated: number;
}
export interface OptimizationConfig {
    enabled: boolean;
    strategies: {
        caching: boolean;
        compression: boolean;
        prefetching: boolean;
        indexing: boolean;
        partitioning: boolean;
    };
    thresholds: {
        latencyWarning: number;
        errorRateWarning: number;
        memoryUsageWarning: number;
        cacheHitRateMin: number;
    };
    adaptation: {
        enabled: boolean;
        learningRate: number;
        adaptationInterval: number;
    };
}
export interface OptimizationAction {
    id: string;
    type: 'cache_adjust' | 'index_rebuild' | 'partition_rebalance' | 'compression_toggle' | 'prefetch_adjust';
    description: string;
    impact: 'low' | 'medium' | 'high';
    timestamp: number;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: unknown;
}
/**
 * Advanced Performance Optimizer.
 * Uses ML-like adaptive algorithms to optimize memory system performance.
 *
 * @example
 */
export declare class PerformanceOptimizer extends EventEmitter {
    private config;
    private metrics;
    private actions;
    private backends;
    private optimizationHistory;
    constructor(config: OptimizationConfig);
    /**
     * Register a backend for optimization.
     *
     * @param id
     * @param backend
     */
    registerBackend(id: string, backend: BackendInterface): void;
    /**
     * Update performance metrics.
     *
     * @param newMetrics
     */
    updateMetrics(newMetrics: Partial<PerformanceMetrics>): void;
    /**
     * Check performance thresholds and trigger optimizations.
     */
    private checkThresholds;
    /**
     * Suggest optimization based on performance issue.
     *
     * @param issue
     */
    private suggestOptimization;
    /**
     * Execute an optimization action.
     *
     * @param actionId
     */
    executeOptimization(actionId: string): Promise<OptimizationAction>;
    /**
     * Perform the actual optimization.
     *
     * @param action
     */
    private performOptimization;
    /**
     * Adjust cache settings.
     */
    private adjustCache;
    /**
     * Rebuild indexes for better performance.
     */
    private rebuildIndexes;
    /**
     * Toggle compression to save memory.
     */
    private toggleCompression;
    /**
     * Adjust prefetch strategy.
     */
    private adjustPrefetch;
    /**
     * Rebalance partitions for better distribution.
     */
    private rebalancePartitions;
    /**
     * Start adaptive optimization loop.
     */
    private startAdaptiveOptimization;
    /**
     * Perform adaptive optimization based on historical data.
     */
    private performAdaptiveOptimization;
    /**
     * Calculate trend from array of values (positive = increasing).
     *
     * @param values.
     * @param values
     */
    private calculateTrend;
    /**
     * Get optimization statistics.
     */
    getStats(): {
        metrics: PerformanceMetrics;
        actions: {
            total: number;
            pending: number;
            executing: number;
            completed: number;
            failed: number;
        };
        backends: number;
        historySize: number;
        config: OptimizationConfig;
    };
    /**
     * Get performance recommendations.
     */
    getRecommendations(): Array<{
        type: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
    }>;
}
//# sourceMappingURL=performance-optimizer.d.ts.map