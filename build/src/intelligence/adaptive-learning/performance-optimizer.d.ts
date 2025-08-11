/**
 * Performance Optimizer.
 *
 * Optimizes agent behavior, task allocation, and resource utilization based on.
 * Learned patterns to improve overall swarm performance and efficiency.
 */
/**
 * @file Performance-optimizer implementation.
 */
import { EventEmitter } from 'node:events';
import type { AdaptiveLearningConfig, Agent, AllocationStrategy, BehaviorOptimization, Bottleneck, EfficiencyImprovement, PerformanceOptimizer as IPerformanceOptimizer, LatencyReduction, Pattern, PerformanceMetrics, Resource, ResourceStrategy, SystemContext, Task } from './types.ts';
export declare class PerformanceOptimizer extends EventEmitter implements IPerformanceOptimizer {
    private config;
    private behaviorCache;
    private allocationHistory;
    private resourceHistory;
    private optimizationMetrics;
    private adaptiveThresholds;
    private context;
    constructor(config: AdaptiveLearningConfig, context: SystemContext);
    /**
     * Optimize agent behavior based on learned patterns.
     *
     * @param agentId
     * @param patterns
     */
    optimizeBehavior(agentId: string, patterns: Pattern[]): BehaviorOptimization;
    /**
     * Optimize task allocation across agents.
     *
     * @param tasks
     * @param agents
     */
    optimizeTaskAllocation(tasks: Task[], agents: Agent[]): AllocationStrategy;
    /**
     * Optimize resource allocation.
     *
     * @param resources
     */
    optimizeResourceAllocation(resources: Resource[]): ResourceStrategy;
    /**
     * Improve overall system efficiency.
     *
     * @param metrics
     */
    improveEfficiency(metrics: PerformanceMetrics): EfficiencyImprovement;
    /**
     * Reduce system latency by addressing bottlenecks.
     *
     * @param bottlenecks
     */
    reduceLatency(bottlenecks: Bottleneck[]): LatencyReduction;
    /**
     * Get optimization history for analysis.
     */
    getOptimizationHistory(): {
        behaviors: Map<string, BehaviorOptimization>;
        allocations: Map<string, AllocationStrategy[]>;
        resources: Map<string, ResourceStrategy[]>;
        metrics: Map<string, PerformanceMetrics>;
    };
    /**
     * Clear optimization cache.
     */
    clearOptimizationCache(): void;
    private filterPatternsForAgent;
    private generateBehaviorOptimizations;
    private calculateExpectedImprovement;
    private calculateImplementationCost;
    private calculateOptimizationConfidence;
    private defineValidationMetrics;
    private analyzeAgentCapabilities;
    private analyzeTaskRequirements;
    private generateOptimalAllocations;
    private calculateAgentTaskScore;
    private calculateAllocationEfficiency;
    private calculateResourceUtilization;
    private calculateLoadBalance;
    private identifyAllocationConstraints;
    private analyzeResourceUsage;
    private generateResourceAllocations;
    private calculateResourcePerformance;
    private calculateUtilizationTarget;
    private calculateCostEfficiency;
    private generateResourceThresholds;
    private identifyEfficiencyBottlenecks;
    private generateEfficiencyOptimizations;
    private calculateEfficiencyGain;
    private createImplementationPlan;
    private calculateTargetMetrics;
    private determinePrimaryCategory;
    private prioritizeBottlenecks;
    private generateLatencyOptimizations;
    private calculateLatencyReduction;
    private createLatencyImplementationPlan;
    private createLatencyMonitoringPlan;
    private initializeAdaptiveThresholds;
    private startContinuousOptimization;
    private performPeriodicOptimization;
}
//# sourceMappingURL=performance-optimizer.d.ts.map