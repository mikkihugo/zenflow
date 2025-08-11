/**
 * @file Coordination system: performance-tracker.
 */
import type { BottleneckAnalysis, Improvement, MetricsFilter, MetricsTracker, Operation, OperationContext, OperationMetrics, OperationResult, OptimizedOperation, PerformanceEstimate, PerformanceOptimizer, PerformanceReport, TimeFrame, TrendAnalysis } from './hook-system-core.ts';
export declare class HookPerformanceTracker implements MetricsTracker {
    private readonly metricsStore;
    private readonly performanceThresholds;
    constructor();
    trackOperation(operation: Operation, result: OperationResult): Promise<void>;
    generatePerformanceReport(timeframe: TimeFrame): Promise<PerformanceReport>;
    getMetrics(filter: MetricsFilter): Promise<OperationMetrics[]>;
    analyzePerformanceTrends(timeframe: TimeFrame): Promise<TrendAnalysis>;
    private calculateQualityScore;
    private estimateUserSatisfaction;
    private detectPerformanceIssues;
    private handlePerformanceIssues;
    private updateAgentProfile;
    private shouldOptimizeInRealTime;
    private generateOptimizations;
    private notifyOptimizations;
    private getMetricsInTimeframe;
    private createEmptyReport;
    private identifyBottlenecks;
    private analyzeTrends;
    private generateRecommendations;
    private analyzeAgentPerformance;
    private extractAgentType;
    private generateAgentImprovements;
    private groupByOperationType;
    private calculateSuccessRateTrend;
    private calculateDurationTrend;
    private calculateMemoryTrend;
    private calculateTrends;
    private generatePredictions;
    private generateInsights;
    private calculateFutureTimeframe;
    private getExpectedDuration;
}
export declare class OperationPerformanceOptimizer implements PerformanceOptimizer {
    optimizeOperation(operation: Operation): Promise<OptimizedOperation>;
    predictPerformance(operation: Operation): Promise<PerformanceEstimate>;
    suggestImprovements(metrics: OperationMetrics): Promise<Improvement[]>;
    analyzeBottlenecks(context: OperationContext): Promise<BottleneckAnalysis>;
    private analyzeOptimizationOpportunities;
    private applyOptimizations;
    private calculateSavings;
    private getBasePerformanceEstimate;
    private analyzePerformanceFactors;
    private reduceParameters;
}
//# sourceMappingURL=performance-tracker.d.ts.map