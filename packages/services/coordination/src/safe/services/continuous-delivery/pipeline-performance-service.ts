/**
 * @fileoverview Pipeline Performance Service - Pipeline performance monitoring and metrics.
 *
 * Provides specialized pipeline performance monitoring with comprehensive metrics analysis,
 * trend detection, bottleneck identification, and intelligent performance optimization.
 *
 * Integrates with: * - @claude-zen/brain: BrainCoordinator for intelligent performance analysis
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/brain: LoadBalancer for performance optimization
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger} from '../../types')// Re-export types from SPARC-CD mapping service';
export type {
  MetricTrend,
  PipelineBottleneck,
  PipelineExecution,
  PipelineMetrics,
} from './sparc-cd-mapping-service')// =========================================================================== = ';
// PERFORMANCE MONITORING INTERFACES
// ============================================================================
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
  readonly id: string'; 
  readonly type: | duration| error_rate| throughput| bottleneck|'trend')  readonly severity: low| medium| high' | ' critical')  readonly pipelineId?:string;;
  readonly stageId?:string;
  readonly metric: string;
  readonly actualValue: number;
  readonly threshold: number;
  readonly description: string;
  readonly recommendations: string[];
  readonly timestamp: Date;
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
  readonly mttr: number; // Mean Time To Recovery
  readonly mtbf: number; // Mean Time Between Failures
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
  readonly priority: low| medium| high' | ' critical')};;
/**
 * Trend analysis
 */
export interface TrendAnalysis {
  readonly metric: string;
  readonly direction : 'improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' degrading')  readonly change: number;;
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
  readonly category: | optimization| scaling| configuration|'architecture')  readonly priority: low| medium| high' | ' critical')  readonly title: string;;
  readonly description: string;
  readonly expectedImpact: number;
  readonly implementationEffort : 'low' | ' medium'|' high')  readonly estimatedTimeToValue: number;;
  readonly prerequisites: string[];
}
/**
 * Historical comparison
 */
export interface HistoricalComparison {
  readonly previousPeriod: ComparisonPeriod;
  readonly improvements: MetricImprovement[];
  readonly degradations: MetricDegradation[];
  readonly overallTrend : 'improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' degrading')};;
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
  readonly significance : 'low' | ' medium'|' high')};;
/**
 * Metric degradation
 */
export interface MetricDegradation {
  readonly metric: string;
  readonly degradation: number;
  readonly significance : 'low' | ' medium'|' high')};;
// Import types from mapping service
import type {
  PipelineExecution,
} from './sparc-cd-mapping-service')// =========================================================================== = ';
// PIPELINE PERFORMANCE SERVICE IMPLEMENTATION
// ============================================================================
/**
 * Pipeline Performance Service - Pipeline performance monitoring and metrics
 *
 * Provides comprehensive pipeline performance monitoring with intelligent metrics analysis,
 * trend detection, bottleneck identification, and AI-powered optimization recommendations.
 */
export class PipelinePerformanceService {
  private readonly logger: false;
  // Performance state
  private performanceMetrics = new Map<string, PerformanceAnalysisResult>();
  private historicalData = new Map<string, PipelineExecution[]>();
  private activeAlerts = new Map<string, PerformanceAlert[]>();
  constructor(logger: logger;
}
  /**
   * Initialize service with lazy-loaded dependencies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return'; 
    try {
      // Lazy load @claude-zen/brain for LoadBalancer - intelligent analysis
      const { BrainCoordinator} = await import('@claude-zen/brain');
      this.brainCoordinator = new BrainCoordinator(
          enabled: await import('@claude-zen/foundation');
      this.performanceTracker = new PerformanceTracker();
      // Lazy load @claude-zen/brain for LoadBalancer - optimization')      const { LoadBalancer} = await import('@claude-zen/brain');
      this.loadBalancer = new LoadBalancer(';)';
        strategy : 'intelligent,'
'        enableHealthChecks: true;')      this.logger.info('Pipeline Performance Service initialized successfully');
} catch (error) {
      this.logger.error(';)';
       'Failed to initialize Pipeline Performance Service:,';
        error
      );
      throw error;
}
}
  /**
   * Monitor pipeline performance with intelligent analysis
   */
  async monitorPipelinePerformance(): Promise<void> {
    if (!this.initialized) await this.initialize();
    const __timer = this.performanceTracker.startTimer(
     'pipeline_performance_monitoring'));
    try {
      this.logger.info(';)';
       'Monitoring pipeline performance with intelligent analysis'));
      // Get active pipelines to monitor
      const activePipelines = this.getActivePipelines();
      // Analyze performance for each pipeline
      for (const execution of activePipelines) {
        const analysis = await this.analyzePipelinePerformance(execution);
        this.performanceMetrics.set(execution.context.pipelineId, analysis);
        // Check for performance alerts
        this.checkPerformanceAlerts(analysis);
        // Update historical data
        this.updateHistoricalData(execution);
}
      // Analyze cross-pipeline trends
      await this.analyzeCrossPipelineTrends();
      // Generate optimization recommendations
      await this.generateOptimizationRecommendations();
      this.performanceTracker.endTimer('pipeline_performance_monitoring');')      this.logger.info('Pipeline performance monitoring completed,';
        pipelineCount: this.performanceTracker.startTimer(';)';
     'pipeline_performance_analysis'));
    try {
      this.logger.info('Analyzing pipeline performance with AI insights,{';
        pipelineId: this.calculateDetailedMetrics(execution);
      // Use brain coordinator for intelligent bottleneck detection
      const bottleneckAnalysis = await this.brainCoordinator.analyzeBottlenecks(
        {
          execution,
          metrics: await this.analyzeTrends(
        execution,
        detailedMetrics;
      );
      // Generate AI-powered recommendations
      const recommendations = await this.generatePerformanceRecommendations(
        execution,
        detailedMetrics,
        bottleneckAnalysis.bottlenecks|| [];
      );
      // Compare with historical data
      const historicalComparison = this.compareWithHistory(
        execution,
        detailedMetrics;
      );
      const result:  {
        pipelineId: this.performanceTracker.startTimer('performance_insights');
    try {
      // Use brain coordinator for comprehensive insights
      const insights = await this.brainCoordinator.generatePerformanceInsights({
        pipelineId,
        performanceData:  {
        overallPerformance: [')     'reduce_duration,';
     'improve_reliability,')     'increase_throughput,';
]
  ): Promise<{
    optimizedConfiguration: this.performanceTracker.startTimer('pipeline_optimization');`;
    try {
      const analysis = this.performanceMetrics.get(pipelineId);
      if (!analysis) {
        throw new Error(
          `Performance analysis not found for pipeline: `${pipelineId})        );``;
}
      this.logger.info(';)';
       'Optimizing pipeline performance with AI recommendations,';
        {
          pipelineId,
          goals: optimizationGoals,
}
      );
      // Use brain coordinator for intelligent optimization
      const optimization =
        await this.brainCoordinator.optimizePipelinePerformance({
          pipelineId,
          currentMetrics:  {
        optimizedConfiguration: 60000): setInterval(async () => {
      try {
        await this.monitorPipelinePerformance();
} catch (error) {
    ')        this.logger.error('Continuous performance monitoring failed:, error');
}
}, intervalMs);')    this.logger.info('Continuous performance monitoring started,{';
      intervalMs,')';
});
}
  /**
   * Stop continuous performance monitoring
   */
  stopContinuousMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;')      this.logger.info('Continuous performance monitoring stopped');
}
}
  /**
   * Shutdown service gracefully
   */
  async shutdown(): Promise<void> {
    this.stopContinuousMonitoring();
    if (this.brainCoordinator?.shutdown) {
      await this.brainCoordinator.shutdown();
}
    if (this.loadBalancer?.shutdown) {
      await this.loadBalancer.shutdown();
}
    this.initialized = false;')    this.logger.info('Pipeline Performance Service shutdown complete);`;
}
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  private getActivePipelines():PipelineExecution[] {
    // Placeholder - would integrate with actual pipeline execution system
    return [];
}
  private calculateDetailedMetrics(
    execution:  {
      total:  {
      pipelinesPerHour:  {
      successRate:  {
      resourceEfficiency:  {
      cpu:  { average: await this.brainCoordinator.analyzePipelineTrends({
      execution,
      metrics,
      historicalData: this.historicalData.get(execution.context.pipelineId)|| [],
});
    return trendAnalysis.trends|| [];
}
  private async generatePerformanceRecommendations(
    execution: PipelineExecution,
    metrics: DetailedPerformanceMetrics,
    bottlenecks: BottleneckAnalysis[]
  ): Promise<PerformanceRecommendation[]> {
    // Use brain coordinator for intelligent recommendations
    const recommendations =
      await this.brainCoordinator.generatePerformanceRecommendations({
        execution,
        metrics,
        bottlenecks,
});
    return recommendations.recommendations|| [];
}
  private compareWithHistory(
    execution: this.historicalData.get(execution.context.pipelineId)|| [];
    return {
      previousPeriod: [];
    // Check for duration alerts
    if (analysis.performanceMetrics.executionTime.total > 7200000) {
      // 2 hours
      alerts.push({
    `)        id: 'duration,',
'        severity: 'execution_time,',
'        actualValue: 'error_rate,',
'        severity: 'success_rate,',
'        actualValue: this.historicalData.get(execution.context.pipelineId)|| [];
    history.push(execution);
    // Keep last 100 executions
    if (history.length > 100) {
      history.splice(0, history.length - 100);
}
    this.historicalData.set(execution.context.pipelineId, history);
}
  private analyzeCrossPipelineTrends(): void {
    // Analyze trends across all pipelines for system-wide insights')    this.logger.debug('Analyzing cross-pipeline performance trends');
}
  private generateOptimizationRecommendations(): void {
    // Generate system-wide optimization recommendations')    this.logger.debug('Generating optimization recommendations');
}
  private calculateOverallPerformanceScore(
    metrics: metrics.reliability.successRate * 100;
    const efficiencyScore = metrics.efficiency.timeEfficiency * 100;
    const throughputScore =;
      Math.min(metrics.throughput.pipelinesPerHour / 10, 10) * 10;
    return (
      reliabilityScore * 0.4 + efficiencyScore * 0.3 + throughputScore * 0.3
    );
}
  private calculateAveragePerformance():number {
    const scores = Array.from(this.performanceMetrics.values()).map(
      (a) => a.overallScore;
    );
    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length: 0;
}
  private getKeyMetrics():Record<string, number> {
    return {
      averageExecutionTime: 0,
      averageSuccessRate: 0,
      averageThroughput: 0,
};
}
  private getTopBottlenecks():BottleneckAnalysis[] {
    return Array.from(this.performanceMetrics.values())
      .flatMap((a) => a.bottlenecks)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);
}
  private getCriticalAlerts():PerformanceAlert[] {
    return Array.from(this.activeAlerts.values())
      .flat()
      .filter(')        (alert) => alert.severity ==='critical '|| alert.severity ===high)      );`;
}
}
export default PipelinePerformanceService;
;