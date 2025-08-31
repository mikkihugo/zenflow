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
import type { Logger} from '../../types');
export type {
  MetricTrend,
  PipelineBottleneck,
  PipelineExecution,
  PipelineMetrics,
} from './sparc-cd-mapping-service');
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
  id: string;
} = await import(): void { LoadBalancer} = await import(): void {
    if (!this.initialized): Promise<void> {
      this.logger.info(): void {';
        pipelineId: this.calculateDetailedMetrics(): void {
          execution,
          metrics: await this.analyzeTrends(): void {
        pipelineId: this.performanceTracker.startTimer(): void {
    optimizedConfiguration: this.performanceTracker.startTimer(): void {
          pipelineId,
          goals: optimizationGoals,
}
      );
      // Use brain coordinator for intelligent optimization
      const optimization =
        await this.brainCoordinator.optimizePipelinePerformance(): void {
      try {
        await this.monitorPipelinePerformance(): void {
    ')Continuous performance monitoring failed:, error'))    this.logger.info(): void {
    if (this.monitoringTimer) {
      clearInterval(): void {
    // Placeholder - would integrate with actual pipeline execution system
    return [];
}
  private calculateDetailedMetrics(): void {
    // Use brain coordinator for intelligent recommendations
    const recommendations =
      await this.brainCoordinator.generatePerformanceRecommendations(): void {
      previousPeriod: [];
    // Check for duration alerts
    if (analysis.performanceMetrics.executionTime.total > 7200000) {
      // 2 hours
      alerts.push(): void {
      history.splice(): void {
    // Analyze trends across all pipelines for system-wide insights')Analyzing cross-pipeline performance trends'))    this.logger.debug('Generating optimization recommendations'))        (alert) => alert.severity ==='critical '|| alert.severity ===high)      )";
}
}
export default PipelinePerformanceService;