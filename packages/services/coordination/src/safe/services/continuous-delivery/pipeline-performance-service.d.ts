export type { MetricTrend, PipelineBottleneck, PipelineExecution, PipelineMetrics, } from './sparc-cd-mapping-service';
/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitoringConfig {
    readonly monitoringEnabled: boolean;
    readonly metricsInterval: number;
    readonly alertThresholds: PerformanceThresholds;
    readonly trendAnalysisEnabled: boolean;
    readonly bottleneckDetectionEnabled: boolean;
    readonly performanceOptimizationEnabled: boolean;
}
/**
 * Performance thresholds for alerting
 */
export interface PerformanceThresholds {
    readonly maxPipelineDuration: number;
    readonly maxStageDuration: number;
    readonly minSuccessRate: number;
    readonly maxErrorRate: number;
    readonly minThroughput: number;
    readonly maxQueueTime: number;
}
/**
 * Performance alert
 */
export interface PerformanceAlert {
    readonly id: string;
    '; : any;
    readonly type: duration | error_rate | throughput | bottleneck | 'trend';
    readonly severity: low | medium | high;
}
/**
 * Performance analysis result
 */
export interface PerformanceAnalysisResult {
    readonly pipelineId: string;
    readonly overallScore: number;
    readonly performanceMetrics: DetailedPerformanceMetrics;
    readonly bottlenecks: BottleneckAnalysis[];
    readonly trends: TrendAnalysis[];
    readonly recommendations: PerformanceRecommendation[];
    readonly alerts: PerformanceAlert[];
    readonly historicalComparison: HistoricalComparison;
}
/**
 * Detailed performance metrics
 */
export interface DetailedPerformanceMetrics {
    readonly executionTime: ExecutionTimeMetrics;
    readonly throughput: ThroughputMetrics;
    readonly reliability: ReliabilityMetrics;
    readonly efficiency: EfficiencyMetrics;
    readonly resourceUtilization: ResourceUtilizationMetrics;
}
/**
 * Execution time metrics
 */
export interface ExecutionTimeMetrics {
    readonly total: number;
    readonly stages: Record<string, number>;
    readonly queueTime: number;
    readonly waitTime: number;
    readonly percentiles:  {
        readonly p50: number;
        readonly p90: number;
        readonly p95: number;
        readonly p99: number;
    };
}
/**
 * Throughput metrics
 */
export interface ThroughputMetrics {
    readonly pipelinesPerHour: number;
    readonly stagesPerHour: number;
    readonly parallelExecutions: number;
    readonly concurrencyUtilization: number;
}
/**
 * Reliability metrics
 */
export interface ReliabilityMetrics {
    readonly successRate: number;
    readonly failureRate: number;
    readonly retryRate: number;
    readonly rollbackRate: number;
    readonly mttr: number;
    readonly mtbf: number;
}
/**
 * Efficiency metrics
 */
export interface EfficiencyMetrics {
    readonly resourceEfficiency: number;
    readonly timeEfficiency: number;
    readonly costEfficiency: number;
    readonly wasteReduction: number;
}
/**
 * Resource utilization metrics
 */
export interface ResourceUtilizationMetrics {
    readonly cpu: ResourceMetric;
    readonly memory: ResourceMetric;
    readonly disk: ResourceMetric;
    readonly network: ResourceMetric;
    readonly agents: AgentUtilizationMetric;
}
/**
 * Resource metric
 */
export interface ResourceMetric {
    readonly average: number;
    readonly peak: number;
    readonly minimum: number;
    readonly utilization: number;
}
/**
 * Agent utilization metric
 */
export interface AgentUtilizationMetric {
    readonly totalAgents: number;
    readonly activeAgents: number;
    readonly idleAgents: number;
    readonly utilizationRate: number;
    readonly queuedTasks: number;
}
/**
 * Bottleneck analysis
 */
export interface BottleneckAnalysis {
    readonly stageId: string;
    readonly stageName: string;
    readonly impact: number;
    readonly frequency: number;
    readonly averageDuration: number;
    readonly causes: string[];
    readonly solutions: string[];
    readonly priority: low | medium | high;
}
/**
 * Trend analysis
 */
export interface TrendAnalysis {
    readonly metric: string;
    readonly direction: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' degrading';
    readonly change: number;
    readonly period: string;
    readonly confidence: number;
    readonly forecast: TrendForecast;
}
/**
 * Trend forecast
 */
export interface TrendForecast {
    readonly shortTerm: number;
    readonly mediumTerm: number;
    readonly longTerm: number;
    readonly confidence: number;
}
/**
 * Performance recommendation
 */
export interface PerformanceRecommendation {
    readonly category: optimization | scaling | configuration | 'architecture';
    readonly priority: low | medium | high;
}
/**
 * Historical comparison
 */
export interface HistoricalComparison {
    readonly previousPeriod: ComparisonPeriod;
    readonly improvements: MetricImprovement[];
    readonly degradations: MetricDegradation[];
    readonly overallTrend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' degrading';
}
/**
 * Comparison period
 */
export interface ComparisonPeriod {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly executionCount: number;
    readonly averageMetrics: Record<string, number>;
}
/**
 * Metric improvement
 */
export interface MetricImprovement {
    readonly metric: string;
    readonly improvement: number;
    readonly significance: 'low' | ' medium' | ' high';
}
/**
 * Metric degradation
 */
export interface MetricDegradation {
    readonly metric: string;
    readonly degradation: number;
    readonly significance: 'low' | ' medium' | ' high';
}
/**
 * Pipeline Performance Service - Pipeline performance monitoring and metrics
 *
 * Provides comprehensive pipeline performance monitoring with intelligent metrics analysis,
 * trend detection, bottleneck identification, and AI-powered optimization recommendations.
 */
export declare class PipelinePerformanceService {
    private readonly logger;
    private performanceMetrics;
    private historicalData;
    private activeAlerts;
    constructor(logger: logger);
}
export default PipelinePerformanceService;
//# sourceMappingURL=pipeline-performance-service.d.ts.map