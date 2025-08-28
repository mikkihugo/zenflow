/**
 * @fileoverview Flow Analysis Domain Service
 *
 * Pure domain logic for workflow flow analysis and metrics calculation.
 * Handles cycle time, lead time, throughput, and flow efficiency analysis.
 *
 * **Responsibilities:**
 * - Flow metrics calculation (cycle time, lead time, throughput)
 * - Flow efficiency analysis and optimization
 * - Performance trend analysis
 * - Predictability assessment
 * - Quality index calculation
 *
 * **Domain Concepts:**
 * - Cycle Time: Time from start to completion
 * - Lead Time: Time from creation to completion  
 * - Throughput: Tasks completed per time period
 * - Flow Efficiency: Ratio of active work to wait time
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  FlowMetrics,
  TimeRange,
  WorkflowStatistics,
  WorkflowTask,
} from '../types/index';
import { ImmutableMetricsUtils } from '../utilities/index';
const logger = getLogger('FlowAnalysis'');

/**
 * Flow trend analysis result
 */
export interface FlowTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend:'improving'|'declining'|'stable';
  confidence: number;
}

/**
 * Predictability analysis result
 */
export interface PredictabilityAnalysis {
  cycleTimes: number[];
  averageCycleTime: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  predictabilityScore: number; // 0-1, higher is more predictable
  recommendation: string;
}

/**
 * Flow Analysis Domain Service
 *
 * Handles all flow metrics and analysis with pure domain logic.
 * Focuses on workflow optimization insights and recommendations.
 */
export class FlowAnalysisService {
  private metricsHistory: FlowMetrics[] = [];

  constructor() {
    logger.info('FlowAnalysisService initialized'');
  }

  /**
   * Calculate current flow metrics
   */
  async calculateFlowMetrics(allTasks: WorkflowTask[]): Promise<FlowMetrics| null> {
    const completedTasks = allTasks.filter(task => task.state === 'done');
    const blockedTasks = allTasks.filter(task => task.state === 'blocked');

    if (completedTasks.length === 0) {
      logger.warn('No completed tasks available for flow metrics calculation'');
      return null;
    }

    // Use immutable utilities for safe metrics calculation
    const metrics = ImmutableMetricsUtils.calculateFlowMetrics(
      allTasks,
      completedTasks,
      blockedTasks,
      {
        wipEfficiency: this.calculateWIPEfficiency(allTasks),
        predictabilityCalculator: this.calculatePredictability.bind(this),
        qualityCalculator: this.calculateQualityIndex.bind(this),
      }
    );

    // Store for trend analysis
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 30) { // Keep last 30 measurements
      this.metricsHistory.shift();
    }

    logger.info('Flow metrics calculated,{
      throughput: metrics.throughput,
      averageCycleTime: metrics.averageCycleTime,
      flowEfficiency: metrics.flowEfficiency,
    });

    return metrics;
  }

  /**
   * Calculate workflow statistics for time range
   */
  async calculateWorkflowStatistics(
    allTasks: WorkflowTask[],
    timeRange?: TimeRange
  ): Promise<WorkflowStatistics> {
    const range = timeRange|| {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    };

    const tasksInRange = allTasks.filter(
      task => task.createdAt >= range.start && task.createdAt <= range.end
    );

    const completedTasks = tasksInRange.filter(task => task.state === 'done');
    const blockedTasks = tasksInRange.filter(task => task.state === 'blocked');

    // Calculate cycle times
    const cycleTimes = completedTasks
      .filter(task => task.startedAt && task.completedAt)
      .map(task => 
        ((task.completedAt?.getTime()|| 0) - (task.startedAt?.getTime()|| 0)) / (1000 * 60 * 60)
      );

    // Calculate lead times
    const leadTimes = completedTasks.map(task =>
      ((task.completedAt?.getTime()|| 0) - task.createdAt.getTime()) / (1000 * 60 * 60)
    );

    // Calculate averages
    const averageCycleTime = cycleTimes.length > 0
      ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
      : 0;

    const averageLeadTime = leadTimes.length > 0
      ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
      : 0;

    // Calculate throughput (tasks per day)
    const rangeHours = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60);
    const throughput = rangeHours > 0 ? (completedTasks.length / rangeHours) * 24 : 0;

    const statistics: WorkflowStatistics = {
      totalTasks: tasksInRange.length,
      completedTasks: completedTasks.length,
      blockedTasks: blockedTasks.length,
      averageCycleTime,
      averageLeadTime,
      throughput,
      wipEfficiency: this.calculateWIPEfficiency(allTasks),
      timeRange: range,
    };

    logger.info('Workflow statistics calculated,{
      totalTasks: statistics.totalTasks,
      completedTasks: statistics.completedTasks,
      throughput: statistics.throughput,
    });

    return statistics;
  }

  /**
   * Analyze flow trends over time
   */
  async analyzeFlowTrends(): Promise<FlowTrend[]> {
    if (this.metricsHistory.length < 2) {
      return [];
    }

    const current = this.metricsHistory[this.metricsHistory.length - 1];
    const previous = this.metricsHistory[this.metricsHistory.length - 2];

    const trends: FlowTrend[] = [
      this.calculateTrend('throughput,current.throughput, previous.throughput,'higher'),
      this.calculateTrend('averageCycleTime,current.averageCycleTime, previous.averageCycleTime,'lower'),
      this.calculateTrend('averageLeadTime,current.averageLeadTime, previous.averageLeadTime,'lower'),
      this.calculateTrend('flowEfficiency,current.flowEfficiency, previous.flowEfficiency,'higher'),
    ];

    return trends.filter(trend => trend.confidence > 0.3); // Only return meaningful trends
  }

  /**
   * Analyze predictability of workflow
   */
  async analyzePredictability(completedTasks: WorkflowTask[]): Promise<PredictabilityAnalysis> {
    const cycleTimes = completedTasks
      .filter(task => task.startedAt && task.completedAt)
      .map(task => 
        ((task.completedAt?.getTime()|| 0) - (task.startedAt?.getTime()|| 0)) / (1000 * 60 * 60)
      );

    if (cycleTimes.length < 3) {
      return {
        cycleTimes,
        averageCycleTime: 0,
        standardDeviation: 0,
        coefficientOfVariation: 0,
        predictabilityScore: 0,
        recommendation:'Need more completed tasks (minimum 3) for predictability analysis,
      };
    }

    const averageCycleTime = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    const variance = cycleTimes.reduce((acc, time) => acc + (time - averageCycleTime) ** 2, 0) / cycleTimes.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = averageCycleTime > 0 ? standardDeviation / averageCycleTime : 0;

    // Lower coefficient of variation = higher predictability
    const predictabilityScore = Math.max(0, 1 - Math.min(1, coefficientOfVariation);

    const analysis: PredictabilityAnalysis = {
      cycleTimes,
      averageCycleTime,
      standardDeviation,
      coefficientOfVariation,
      predictabilityScore,
      recommendation: this.generatePredictabilityRecommendation(predictabilityScore, coefficientOfVariation),
    };

    logger.info('Predictability analysis completed,{
      predictabilityScore: analysis.predictabilityScore,
      coefficientOfVariation: analysis.coefficientOfVariation,
    });

    return analysis;
  }

  /**
   * Calculate quality index based on flow characteristics
   */
  async calculateFlowQualityIndex(allTasks: WorkflowTask[], completedTasks: WorkflowTask[]): Promise<number> {
    const totalTasks = completedTasks.length;
    const blockedTasks = allTasks.filter(task => task.state ==='blocked').length';
    // Quality metric based on tasks not being blocked
    const qualityIndex = totalTasks > 0
      ? Math.max(0, 1 - blockedTasks / (totalTasks + blockedTasks))
      : 1;

    logger.debug('Flow quality index calculated,{
      qualityIndex,
      totalTasks,
      blockedTasks,
    });

    return qualityIndex;
  }

  // =============================================================================
  // PRIVATE DOMAIN LOGIC
  // =============================================================================

  private calculateWIPEfficiency(allTasks: WorkflowTask[]): number {
    const workingStates = ['analysis,'development,'testing,'review,'deployment];
    const workingTasks = allTasks.filter(task => workingStates.includes(task.state);
    const blockedTasks = allTasks.filter(task => task.state === 'blocked');

    const totalActiveTasks = workingTasks.length + blockedTasks.length;
    return totalActiveTasks > 0 ? workingTasks.length / totalActiveTasks : 1;
  }

  private calculatePredictability(cycleTimes: number[]): number {
    if (cycleTimes.length < 3) return 1;

    const mean = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    const variance = cycleTimes.reduce((acc, time) => acc + (time - mean) ** 2, 0) / cycleTimes.length;
    const stdDev = Math.sqrt(variance);

    // Lower coefficient of variation = higher predictability
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    return Math.max(0, 1 - Math.min(1, coefficientOfVariation);
  }

  private calculateQualityIndex(completedTasks: WorkflowTask[]): number {
    // Simple quality metric - could be enhanced with defect tracking
    return 0.85; // Placeholder - would typically analyze rework, defects, etc.
  }

  private calculateTrend(
    metric: string, 
    current: number, 
    previous: number, 
    betterDirection:'higher'|'lower
  ): FlowTrend {
    const change = current - previous;
    const percentChange = previous !== 0 ? Math.abs(change / previous) : 0;
    
    let trend:'improving'|'declining'|'stable';
    if (percentChange < 0.05) { // Less than 5% change
      trend = 'stable';
    } else {
      const isImproving = betterDirection ==='higher '? change > 0 : change < 0';
      trend = isImproving ?'improving: 'declining';
    }

    return {
      metric,
      current,
      previous,
      change,
      trend,
      confidence: Math.min(1, percentChange * 2), // Higher confidence for bigger changes
    };
  }

  private generatePredictabilityRecommendation(score: number, cv: number): string {
    if (score > 0.8) {
      return'Workflow shows high predictability. Continue current practices.';
    } else if (score > 0.6) {
      return'Workflow shows moderate predictability. Consider identifying and reducing sources of variation.';
    } else if (score > 0.4) {
      return'Workflow shows low predictability. Focus on standardizing processes and removing blockers.';
    } else {
      return'Workflow shows very low predictability. Immediate attention needed to identify and address root causes of variation.';
    }
  }
}