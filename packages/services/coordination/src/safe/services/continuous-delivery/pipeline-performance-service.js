/**
 * @fileoverview Pipeline Performance Service - Pipeline performance monitoring and metrics.
 *
 * Provides specialized pipeline performance monitoring with comprehensive metrics analysis,
 * trend detection, bottleneck identification, and intelligent performance optimization.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent performance analysis
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/brain: LoadBalancer for performance optimization
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// ============================================================================
// PIPELINE PERFORMANCE SERVICE IMPLEMENTATION
// ============================================================================
/**
 * Pipeline Performance Service - Pipeline performance monitoring and metrics
 *
 * Provides comprehensive pipeline performance monitoring with intelligent metrics analysis,
 * trend detection, bottleneck identification, and AI-powered optimization recommendations.
 */
export class PipelinePerformanceService {
    logger;
    brainCoordinator;
    performanceTracker;
    loadBalancer;
    initialized = false;
    // Performance state
    performanceMetrics = new Map();
    historicalData = new Map();
    activeAlerts = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Initialize service with lazy-loaded dependencies
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Lazy load @claude-zen/brain for LoadBalancer - intelligent analysis
            const { BrainCoordinator } = await import('@claude-zen/brain');
            ';
            this.brainCoordinator = new BrainCoordinator(enabled, true, learningRate, 0.1, adaptationThreshold, 0.7);
            await this.brainCoordinator.initialize();
            // Lazy load @claude-zen/foundation for performance tracking
            const { PerformanceTracker } = await import('@claude-zen/foundation');
            ';
            this.performanceTracker = new PerformanceTracker();
            // Lazy load @claude-zen/brain for LoadBalancer - optimization
            const { LoadBalancer } = await import('@claude-zen/brain');
            ';
            this.loadBalancer = new LoadBalancer(strategy, 'intelligent', enableHealthChecks, true, healthCheckInterval, 30000, failoverTimeout, 5000);
            await this.loadBalancer.initialize();
            this.initialized = true;
            this.logger.info('Pipeline Performance Service initialized successfully');
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize Pipeline Performance Service:', error);
            throw error;
        }
    }
    /**
     * Monitor pipeline performance with intelligent analysis
     */
    async monitorPipelinePerformance() {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('pipeline_performance_monitoring', ');
        try {
            this.logger.info('Monitoring pipeline performance with intelligent analysis', ');
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
            this.performanceTracker.endTimer('pipeline_performance_monitoring');
            ';
            this.logger.info('Pipeline performance monitoring completed', ', pipelineCount, activePipelines.length, alertCount, Array.from(this.activeAlerts.values()).flat().length);
        }
        catch (error) {
            this.performanceTracker.endTimer('pipeline_performance_monitoring');
            ';
            this.logger.error('Pipeline performance monitoring failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Analyze individual pipeline performance with AI insights
     */
    async analyzePipelinePerformance(execution) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('pipeline_performance_analysis', ');
        try {
            this.logger.info('Analyzing pipeline performance with AI insights', { ': pipelineId, execution, : .context.pipelineId,
            });
            // Calculate detailed metrics
            const detailedMetrics = this.calculateDetailedMetrics(execution);
            // Use brain coordinator for intelligent bottleneck detection
            const bottleneckAnalysis = await this.brainCoordinator.analyzeBottlenecks({
                execution,
                metrics: detailedMetrics,
                historicalData: this.historicalData.get(execution.context.pipelineId) || [],
            });
            // Analyze trends with AI
            const trendAnalysis = await this.analyzeTrends(execution, detailedMetrics);
            // Generate AI-powered recommendations
            const recommendations = await this.generatePerformanceRecommendations(execution, detailedMetrics, bottleneckAnalysis.bottlenecks || []);
            // Compare with historical data
            const historicalComparison = this.compareWithHistory(execution, detailedMetrics);
            const result = {
                pipelineId: execution.context.pipelineId,
                overallScore: this.calculateOverallPerformanceScore(detailedMetrics),
                performanceMetrics: detailedMetrics,
                bottlenecks: bottleneckAnalysis.bottlenecks || [],
                trends: trendAnalysis,
                recommendations,
                alerts: [],
                historicalComparison,
            };
            this.performanceTracker.endTimer('pipeline_performance_analysis');
            ';
            this.logger.info('Pipeline performance analysis completed', ', pipelineId, execution.context.pipelineId, overallScore, result.overallScore, bottleneckCount, result.bottlenecks.length, recommendationCount, result.recommendations.length);
            return result;
        }
        catch (error) {
            this.performanceTracker.endTimer('pipeline_performance_analysis');
            ';
            this.logger.error('Pipeline performance analysis failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Get performance insights with intelligent analysis
     */
    async getPerformanceInsights(pipelineId) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('performance_insights');
        ';
        try {
            // Use brain coordinator for comprehensive insights
            const insights = await this.brainCoordinator.generatePerformanceInsights({
                pipelineId,
                performanceData: Array.from(this.performanceMetrics.values()),
                historicalData: Array.from(this.historicalData.values()).flat(),
                timeframe: '30d',
            });
            const result = {
                overallPerformance: insights.overallScore || this.calculateAveragePerformance(),
                keyMetrics: insights.keyMetrics || this.getKeyMetrics(),
                topBottlenecks: insights.bottlenecks || this.getTopBottlenecks(),
                trendSummary: insights.trends || [],
                criticalAlerts: insights.alerts || this.getCriticalAlerts(),
                recommendations: insights.recommendations || [],
            };
            this.performanceTracker.endTimer('performance_insights');
            ';
            this.logger.info('Performance insights generated', ', pipelineId, overallPerformance, result.overallPerformance, bottleneckCount, result.topBottlenecks.length, alertCount, result.criticalAlerts.length);
            return result;
        }
        catch (error) {
            this.performanceTracker.endTimer('performance_insights');
            ';
            this.logger.error('Failed to generate performance insights:', error);
            ';
            throw error;
        }
    }
    /**
     * Optimize pipeline performance with intelligent recommendations
     */
    async optimizePipelinePerformance(pipelineId, _optimizationGoals = [
        'reduce_duration',
        'improve_reliability',
        'increase_throughput',
    ]) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('pipeline_optimization');
        ';
        try {
            const analysis = this.performanceMetrics.get(pipelineId);
            if (!analysis) {
                throw new Error(`Performance analysis not found for pipeline: ${pipelineId}` `
        );
      }

      this.logger.info(
        'Optimizing pipeline performance with AI recommendations',
        {
          pipelineId,
          goals: optimizationGoals,
        }
      );

      // Use brain coordinator for intelligent optimization
      const optimization =
        await this.brainCoordinator.optimizePipelinePerformance({
          pipelineId,
          currentMetrics: analysis.performanceMetrics,
          bottlenecks: analysis.bottlenecks,
          goals: optimizationGoals,
          historicalData: this.historicalData.get(pipelineId) || [],
        });

      const result = {
        optimizedConfiguration: optimization.configuration || {},
        expectedImprovement: optimization.expectedImprovement || 0,
        implementationPlan: optimization.implementationPlan || [],
        riskAssessment: optimization.risks || [],
      };

      this.performanceTracker.endTimer('pipeline_optimization');'

      this.logger.info('Pipeline performance optimization completed', {'
        pipelineId,
        expectedImprovement: result.expectedImprovement,
        planSteps: result.implementationPlan.length,
      });

      return result;
    } catch (error) {
      this.performanceTracker.endTimer('pipeline_optimization');'
      this.logger.error('Pipeline performance optimization failed:', error);'
      throw error;
    }
  }

  /**
   * Start continuous performance monitoring
   */
  startContinuousMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    this.monitoringTimer = setInterval(async () => {
      try {
        await this.monitorPipelinePerformance();
      } catch (error) {
        this.logger.error('Continuous performance monitoring failed:', error);'
      }
    }, intervalMs);

    this.logger.info('Continuous performance monitoring started', {'
      intervalMs,
    });
  }

  /**
   * Stop continuous performance monitoring
   */
  stopContinuousMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
      this.logger.info('Continuous performance monitoring stopped');'
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
    this.initialized = false;
    this.logger.info('Pipeline Performance Service shutdown complete');'
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private getActivePipelines(): PipelineExecution[] {
    // Placeholder - would integrate with actual pipeline execution system
    return [];
  }

  private calculateDetailedMetrics(
    execution: PipelineExecution
  ): DetailedPerformanceMetrics {
    const executionTime: ExecutionTimeMetrics = {
      total: execution.duration || 0,
      stages: execution.metrics.stageDurations,
      queueTime: execution.metrics.queueTime,
      waitTime: 0,
      percentiles: { p50: 0, p90: 0, p95: 0, p99: 0 },
    };

    const throughput: ThroughputMetrics = {
      pipelinesPerHour: execution.metrics.throughput,
      stagesPerHour: 0,
      parallelExecutions: 0,
      concurrencyUtilization: 0,
    };

    const reliability: ReliabilityMetrics = {
      successRate: execution.metrics.successRate,
      failureRate: execution.metrics.failureRate,
      retryRate: 0,
      rollbackRate: 0,
      mttr: 0,
      mtbf: 0,
    };

    const efficiency: EfficiencyMetrics = {
      resourceEfficiency: 0,
      timeEfficiency: 0,
      costEfficiency: 0,
      wasteReduction: 0,
    };

    const resourceUtilization: ResourceUtilizationMetrics = {
      cpu: { average: 0, peak: 0, minimum: 0, utilization: 0 },
      memory: { average: 0, peak: 0, minimum: 0, utilization: 0 },
      disk: { average: 0, peak: 0, minimum: 0, utilization: 0 },
      network: { average: 0, peak: 0, minimum: 0, utilization: 0 },
      agents: {
        totalAgents: 0,
        activeAgents: 0,
        idleAgents: 0,
        utilizationRate: 0,
        queuedTasks: 0,
      },
    };

    return {
      executionTime,
      throughput,
      reliability,
      efficiency,
      resourceUtilization,
    };
  }

  private async analyzeTrends(
    execution: PipelineExecution,
    metrics: DetailedPerformanceMetrics
  ): Promise<TrendAnalysis[]> {
    // Use brain coordinator for trend analysis
    const trendAnalysis = await this.brainCoordinator.analyzePipelineTrends({
      execution,
      metrics,
      historicalData:
        this.historicalData.get(execution.context.pipelineId) || [],
    });

    return trendAnalysis.trends || [];
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

    return recommendations.recommendations || [];
  }

  private compareWithHistory(
    execution: PipelineExecution,
    metrics: DetailedPerformanceMetrics
  ): HistoricalComparison {
    const history = this.historicalData.get(execution.context.pipelineId) || [];

    return {
      previousPeriod: {
        startDate: new Date(),
        endDate: new Date(),
        executionCount: history.length,
        averageMetrics: {},
      },
      improvements: [],
      degradations: [],
      overallTrend:'stable',
    };
  }

  private checkPerformanceAlerts(analysis: PerformanceAnalysisResult): void {
    const alerts: PerformanceAlert[] = [];

    // Check for duration alerts
    if (analysis.performanceMetrics.executionTime.total > 7200000) {
      // 2 hours
      alerts.push({
        id: `, duration - $, { analysis, : .pipelineId } `,`, type, 'duration', severity, 'high', pipelineId, analysis.pipelineId, metric, 'execution_time', actualValue, analysis.performanceMetrics.executionTime.total, threshold, 7200000, description, 'Pipeline execution time exceeds threshold', recommendations, [
                    'Optimize bottleneck stages',
                    'Increase parallelization',
                ], timestamp, new Date());
            }
            ;
        }
        // Check for reliability alerts
        finally {
        }
        // Check for reliability alerts
        if (analysis.performanceMetrics.reliability.successRate < 0.95) {
            alerts.push({
                id: `reliability-${analysis.pipelineId}`,
            } `
        type: 'error_rate',
        severity: 'critical',
        pipelineId: analysis.pipelineId,
        metric: 'success_rate',
        actualValue: analysis.performanceMetrics.reliability.successRate,
        threshold: 0.95,
        description: 'Pipeline success rate below acceptable threshold',
        recommendations: [
          'Investigate failure causes',
          'Improve error handling',
        ],
        timestamp: new Date(),
      });
    }

    if (alerts.length > 0) {
      this.activeAlerts.set(analysis.pipelineId, alerts);
      this.logger.warn('Performance alerts detected', {'
        pipelineId: analysis.pipelineId,
        alertCount: alerts.length,
      });
    }
  }

  private updateHistoricalData(execution: PipelineExecution): void {
    const history = this.historicalData.get(execution.context.pipelineId) || [];
    history.push(execution);

    // Keep last 100 executions
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.historicalData.set(execution.context.pipelineId, history);
  }

  private analyzeCrossPipelineTrends(): void {
    // Analyze trends across all pipelines for system-wide insights
    this.logger.debug('Analyzing cross-pipeline performance trends');'
  }

  private generateOptimizationRecommendations(): void {
    // Generate system-wide optimization recommendations
    this.logger.debug('Generating optimization recommendations');'
  }

  private calculateOverallPerformanceScore(
    metrics: DetailedPerformanceMetrics
  ): number {
    // Calculate weighted performance score
    const reliabilityScore = metrics.reliability.successRate * 100;
    const efficiencyScore = metrics.efficiency.timeEfficiency * 100;
    const throughputScore =
      Math.min(metrics.throughput.pipelinesPerHour / 10, 10) * 10;

    return (
      reliabilityScore * 0.4 + efficiencyScore * 0.3 + throughputScore * 0.3
    );
  }

  private calculateAveragePerformance(): number {
    const scores = Array.from(this.performanceMetrics.values()).map(
      (a) => a.overallScore
    );
    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  private getKeyMetrics(): Record<string, number> {
    return {
      averageExecutionTime: 0,
      averageSuccessRate: 0,
      averageThroughput: 0,
    };
  }

  private getTopBottlenecks(): BottleneckAnalysis[] {
    return Array.from(this.performanceMetrics.values())
      .flatMap((a) => a.bottlenecks)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);
  }

  private getCriticalAlerts(): PerformanceAlert[] {
    return Array.from(this.activeAlerts.values())
      .flat()
      .filter(
        (alert) => alert.severity === 'critical' || alert.severity ==='high''
      );
  }
}

export default PipelinePerformanceService;
            );
        }
    }
}
