/**
 * @fileoverview Flow Analysis Domain Service
 *
 * Pure domain logic for workflow flow analysis and metrics calculation.
 * Analyzes throughput, cycle time, and flow efficiency patterns.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('FlowAnalysis');

/**
 * Flow trend analysis
 */
export interface FlowTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changePercent: number;
  periodDays: number;
}

/**
 * Flow metrics interface
 */
export interface FlowMetrics {
  throughput: number;
  cycleTime: number;
  leadTime: number;
  wipEfficiency: number;
  blockedRatio: number;
  flowEfficiency: number;
}

/**
 * Service for analyzing workflow flow metrics
 */
export class FlowAnalysisService {
  constructor() {
    logger.info('FlowAnalysisService initialized');
  }

  /**
   * Calculate current flow metrics
   */
  async calculateFlowMetrics(
    allTasks: any[],
    timeRange?: any
  ): Promise<FlowMetrics | null> {
    const completedTasks = allTasks.filter((task) => task.state === 'done');
    const blockedTasks = allTasks.filter((task) => task.state === 'blocked');

    if (completedTasks.length === 0) {
      logger.warn('No completed tasks available for flow metrics calculation');
      return null;
    }

    // Calculate basic metrics
    const throughput = this.calculateThroughput(completedTasks, timeRange);
    const cycleTime = this.calculateAverageCycleTime(completedTasks);
    const leadTime = this.calculateAverageLeadTime(completedTasks);
    const wipEfficiency = this.calculateWipEfficiency(allTasks);
    const blockedRatio = blockedTasks.length / allTasks.length;
    const flowEfficiency = this.calculateFlowEfficiency(completedTasks);

    const metrics: FlowMetrics = {
      throughput,
      cycleTime,
      leadTime,
      wipEfficiency,
      blockedRatio,
      flowEfficiency,
    };

    logger.debug('Flow metrics calculated', metrics);
    return metrics;
  }

  private calculateThroughput(completedTasks: any[], timeRange?: any): number {
    if (!completedTasks.length) return 0;

    // Calculate throughput based on actual completion data
    const timeRangeInDays = timeRange?.days || 7; // Default to weekly
    const throughputPerDay = completedTasks.length / timeRangeInDays;

    // Return throughput per week for consistency
    return Math.round(throughputPerDay * 7 * 100) / 100;
  }

  private calculateAverageCycleTime(completedTasks: any[]): number {
    if (!completedTasks.length) return 0;

    const totalCycleTime = completedTasks.reduce((sum, task) => {
      const startTime = new Date(task.startedAt || task.createdAt);
      const endTime = new Date(task.completedAt || Date.now());
      const cycleTimeHours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return sum + Math.max(0, cycleTimeHours);
    }, 0);

    // Return average cycle time in days
    return (
      Math.round((totalCycleTime / completedTasks.length / 24) * 100) / 100
    );
  }

  private calculateAverageLeadTime(completedTasks: any[]): number {
    if (!completedTasks.length) return 0;

    const totalLeadTime = completedTasks.reduce((sum, task) => {
      const requestTime = new Date(task.requestedAt || task.createdAt);
      const deliveryTime = new Date(
        task.deliveredAt || task.completedAt || Date.now()
      );
      const leadTimeHours =
        (deliveryTime.getTime() - requestTime.getTime()) / (1000 * 60 * 60);
      return sum + Math.max(0, leadTimeHours);
    }, 0);

    // Return average lead time in days
    return Math.round((totalLeadTime / completedTasks.length / 24) * 100) / 100;
  }

  private calculateWipEfficiency(allTasks: any[]): number {
    if (!allTasks.length) return 0;

    const wipTasks = allTasks.filter(
      (task) =>
        task.status === 'in_progress' ||
        task.status === 'in_review' ||
        task.status === 'testing'
    );

    const completedTasks = allTasks.filter(
      (task) => task.status === 'completed'
    );

    // Calculate WIP efficiency as completed vs in-progress ratio
    const wipCount = wipTasks.length;
    const completedCount = completedTasks.length;

    if (wipCount === 0) return 1.0; // Perfect efficiency if no WIP

    // Efficiency based on Little's Law principles
    const efficiency = Math.min(
      1.0,
      completedCount / (completedCount + wipCount)
    );
    return Math.round(efficiency * 100) / 100;
  }

  private calculateFlowEfficiency(completedTasks: any[]): number {
    if (!completedTasks.length) return 0;

    const totalFlowEfficiency = completedTasks.reduce((sum, task) => {
      // Calculate time spent in active work vs waiting
      const totalTime = this.calculateTaskTotalTime(task);
      const activeTime = this.calculateTaskActiveTime(task);

      const efficiency = totalTime > 0 ? activeTime / totalTime : 0;
      return sum + Math.max(0, Math.min(1, efficiency));
    }, 0);

    return (
      Math.round((totalFlowEfficiency / completedTasks.length) * 100) / 100
    );
  }

  /**
   * Calculate total time a task spent in the system
   */
  private calculateTaskTotalTime(task: any): number {
    const startTime = new Date(task.createdAt);
    const endTime = new Date(task.completedAt || Date.now());
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Hours
  }

  /**
   * Calculate active work time vs waiting time
   */
  private calculateTaskActiveTime(task: any): number {
    // Estimate active time based on task complexity and status history
    const totalTime = this.calculateTaskTotalTime(task);

    // Assume 40% of time is active work (industry average)
    // This could be improved with actual status transition tracking
    const activeTimeRatio =
      task.complexity === 'high'
        ? 0.6
        : task.complexity === 'medium'
          ? 0.4
          : 0.3;

    return totalTime * activeTimeRatio;
  }

  /**
   * Analyze flow trends over time
   */
  async analyzeFlowTrends(
    historicalMetrics: FlowMetrics[]
  ): Promise<FlowTrend[]> {
    // Implementation stub
    return [];
  }
}
