/**
 * Optimization Engine.
 * Automatic performance tuning and resource optimization.
 */
/**
 * @file Optimization processing engine.
 */
import { EventEmitter } from 'node:events';
import type { PerformanceInsights } from '../analytics/performance-analyzer.ts';
import type { CompositeMetrics } from '../core/metrics-collector.ts';
export interface OptimizationAction {
    id: string;
    type: 'cache' | 'scaling' | 'tuning' | 'load_balancing' | 'resource_allocation';
    target: string;
    action: string;
    parameters: Record<string, any>;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedImpact: number;
    executionTime: number;
}
export interface OptimizationResult {
    actionId: string;
    success: boolean;
    executionTime: number;
    beforeMetrics: CompositeMetrics;
    afterMetrics?: CompositeMetrics;
    impact: {
        performance: number;
        efficiency: number;
        cost: number;
    };
    error?: string;
}
export interface OptimizationStrategy {
    name: string;
    enabled: boolean;
    aggressiveness: 'conservative' | 'moderate' | 'aggressive';
    cooldownPeriod: number;
    maxActionsPerMinute: number;
}
export declare class OptimizationEngine extends EventEmitter {
    private strategies;
    private pendingActions;
    private executingActions;
    private actionHistory;
    private isOptimizing;
    private resourceLimits;
    constructor();
    /**
     * Initialize optimization strategies.
     */
    private initializeStrategies;
    /**
     * Initialize resource limits.
     */
    private initializeResourceLimits;
    /**
     * Start optimization engine.
     */
    startOptimization(): void;
    /**
     * Stop optimization engine.
     */
    stopOptimization(): void;
    /**
     * Analyze performance insights and generate optimization actions.
     *
     * @param insights
     * @param metrics
     */
    optimizeFromInsights(insights: PerformanceInsights, metrics: CompositeMetrics): Promise<OptimizationAction[]>;
    /**
     * Handle performance anomalies.
     *
     * @param anomaly
     * @param _metrics
     */
    private handleAnomaly;
    /**
     * Handle performance bottlenecks.
     *
     * @param bottleneck
     * @param metrics
     */
    private handleBottleneck;
    /**
     * Handle predicted resource exhaustion.
     *
     * @param predictions
     * @param predictions.capacityUtilization
     * @param predictions.timeToCapacity
     * @param predictions.resourceExhaustion
     * @param _metrics
     */
    private handleResourceExhaustion;
    /**
     * Handle low system health.
     *
     * @param healthScore
     * @param _metrics
     */
    private handleLowHealth;
    /**
     * Filter and validate optimization actions.
     *
     * @param actions
     */
    private filterActions;
    /**
     * Check if action would exceed resource limits.
     *
     * @param action
     */
    private wouldExceedLimits;
    /**
     * Execute pending optimization actions.
     */
    private executePendingActions;
    /**
     * Execute a single optimization action.
     *
     * @param action
     */
    private executeAction;
    /**
     * Simulate action execution (replace with actual implementations).
     *
     * @param action
     */
    private simulateActionExecution;
    /**
     * Maintain action history size.
     *
     * @param maxSize
     */
    private maintainActionHistory;
    /**
     * Get optimization statistics.
     */
    getOptimizationStats(): {
        totalActions: number;
        successRate: number;
        averageImpact: number;
        actionsByType: Record<string, number>;
        recentActions: OptimizationResult[];
    };
    /**
     * Update optimization strategy.
     *
     * @param strategyName
     * @param updates
     */
    updateStrategy(strategyName: string, updates: Partial<OptimizationStrategy>): void;
    /**
     * Get current strategies.
     */
    getStrategies(): Map<string, OptimizationStrategy>;
}
//# sourceMappingURL=optimization-engine.d.ts.map