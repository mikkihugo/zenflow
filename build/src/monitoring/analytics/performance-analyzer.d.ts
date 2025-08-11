/**
 * Performance Analytics Engine.
 * Real-time trend analysis, anomaly detection, and predictive modeling.
 */
/**
 * @file Performance-analyzer implementation.
 */
import { EventEmitter } from 'node:events';
import type { CompositeMetrics } from '../core/metrics-collector.ts';
export interface AnomalyDetection {
    timestamp: number;
    metric: string;
    value: number;
    expectedValue: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
}
export interface TrendAnalysis {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    confidence: number;
    prediction: {
        nextValue: number;
        timeframe: number;
    };
}
export interface BottleneckAnalysis {
    component: 'system' | 'fact' | 'rag' | 'swarm' | 'mcp';
    metric: string;
    impact: number;
    rootCause: string;
    recommendations: string[];
}
export interface PerformanceInsights {
    timestamp: number;
    anomalies: AnomalyDetection[];
    trends: TrendAnalysis[];
    bottlenecks: BottleneckAnalysis[];
    healthScore: number;
    predictions: {
        capacityUtilization: number;
        timeToCapacity: number;
        resourceExhaustion: string[];
    };
}
export declare class PerformanceAnalyzer extends EventEmitter {
    private metricsHistory;
    private baselineMetrics;
    private anomalyThresholds;
    private isAnalyzing;
    constructor();
    /**
     * Initialize baseline metrics for comparison.
     */
    private initializeBaselines;
    /**
     * Initialize anomaly detection thresholds.
     */
    private initializeThresholds;
    /**
     * Start performance analysis.
     */
    startAnalysis(): void;
    /**
     * Stop performance analysis.
     */
    stopAnalysis(): void;
    /**
     * Analyze new metrics.
     *
     * @param metrics
     */
    analyzeMetrics(metrics: CompositeMetrics): PerformanceInsights;
    /**
     * Detect anomalies in current metrics.
     *
     * @param metrics
     */
    private detectAnomalies;
    /**
     * Check for anomaly in a specific metric.
     *
     * @param anomalies
     * @param metricName
     * @param value
     * @param description
     */
    private checkAnomaly;
    /**
     * Analyze trends in metrics over time.
     */
    private analyzeTrends;
    /**
     * Analyze trend for a specific metric.
     *
     * @param metricName
     * @param values
     */
    private analyzeTrend;
    /**
     * Identify performance bottlenecks.
     *
     * @param metrics
     */
    private identifyBottlenecks;
    /**
     * Calculate overall system health score.
     *
     * @param metrics
     */
    private calculateHealthScore;
    /**
     * Generate predictive insights.
     */
    private generatePredictions;
    /**
     * Maintain metrics history size.
     *
     * @param maxSize
     */
    private maintainHistorySize;
    /**
     * Get historical performance insights.
     *
     * @param timeRange
     * @param timeRange.start
     * @param timeRange.end
     */
    getHistoricalInsights(timeRange?: {
        start: number;
        end: number;
    }): PerformanceInsights[];
    /**
     * Update baselines based on historical data.
     */
    updateBaselines(): void;
}
//# sourceMappingURL=performance-analyzer.d.ts.map