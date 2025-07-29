/**
 * Performance Scorer for Agent Selection
 * Calculates performance scores for agents based on various metrics
 */

import { WorkloadMetrics } from './WorkloadMonitor.js';

export interface PerformanceScore {
  overall: number;
  speed: number;
  reliability: number;
  resourceEfficiency: number;
  availability: number;
  timestamp: Date;
}

export interface AgentPerformanceHistory {
  agentId: string;
  scores: PerformanceScore[];
  totalTasks: number;
  successfulTasks: number;
  averageResponseTime: number;
  uptimePercentage: number;
}

export interface ScoringWeights {
  speed: number;
  reliability: number;
  resourceEfficiency: number;
  availability: number;
}

export class PerformanceScorer {
  private performanceHistory: Map<string, AgentPerformanceHistory> = new Map();
  private weights: ScoringWeights;

  constructor(weights: Partial<ScoringWeights> = {}) {
    this.weights = {
      speed: weights.speed || 0.3,
      reliability: weights.reliability || 0.4,
      resourceEfficiency: weights.resourceEfficiency || 0.2,
      availability: weights.availability || 0.1
    };
  }

  /**
   * Calculate performance score for an agent
   */
  calculateScore(
    agentId: string,
    workloadMetrics: WorkloadMetrics,
    taskHistory: {
      completedTasks: number;
      failedTasks: number;
      averageTaskDuration: number;
      uptime: number;
    }
  ): PerformanceScore {
    const speed = this.calculateSpeedScore(taskHistory.averageTaskDuration);
    const reliability = this.calculateReliabilityScore(
      taskHistory.completedTasks,
      taskHistory.failedTasks,
      workloadMetrics.errorRate
    );
    const resourceEfficiency = this.calculateResourceEfficiencyScore(workloadMetrics);
    const availability = this.calculateAvailabilityScore(taskHistory.uptime);

    const overall = (
      speed * this.weights.speed +
      reliability * this.weights.reliability +
      resourceEfficiency * this.weights.resourceEfficiency +
      availability * this.weights.availability
    );

    const score: PerformanceScore = {
      overall,
      speed,
      reliability,
      resourceEfficiency,
      availability,
      timestamp: new Date()
    };

    this.recordScore(agentId, score, taskHistory);
    return score;
  }

  /**
   * Calculate speed score based on task completion time
   */
  private calculateSpeedScore(averageTaskDuration: number): number {
    // Lower duration = higher score
    // Normalize assuming 30 seconds is baseline (score = 0.5)
    const baselineDuration = 30000; // 30 seconds in ms
    const score = Math.max(0, Math.min(1, baselineDuration / averageTaskDuration));
    return score;
  }

  /**
   * Calculate reliability score based on success rate and error rate
   */
  private calculateReliabilityScore(
    completedTasks: number,
    failedTasks: number,
    errorRate: number
  ): number {
    const totalTasks = completedTasks + failedTasks;
    if (totalTasks === 0) return 0.5; // Default score for new agents

    const successRate = completedTasks / totalTasks;
    const reliabilityFromErrors = Math.max(0, 1 - errorRate);
    
    // Average of success rate and error-based reliability
    return (successRate + reliabilityFromErrors) / 2;
  }

  /**
   * Calculate resource efficiency score
   */
  private calculateResourceEfficiencyScore(metrics: WorkloadMetrics): number {
    // Lower resource usage = higher efficiency
    const cpuEfficiency = Math.max(0, 1 - metrics.cpuUsage);
    const memoryEfficiency = Math.max(0, 1 - metrics.memoryUsage);
    
    // Weighted average (CPU is more important)
    return (cpuEfficiency * 0.6 + memoryEfficiency * 0.4);
  }

  /**
   * Calculate availability score based on uptime
   */
  private calculateAvailabilityScore(uptime: number): number {
    // Uptime should be a percentage (0-1)
    return Math.max(0, Math.min(1, uptime));
  }

  /**
   * Record performance score for historical tracking
   */
  private recordScore(
    agentId: string,
    score: PerformanceScore,
    taskHistory: {
      completedTasks: number;
      failedTasks: number;
      averageTaskDuration: number;
      uptime: number;
    }
  ): void {
    if (!this.performanceHistory.has(agentId)) {
      this.performanceHistory.set(agentId, {
        agentId,
        scores: [],
        totalTasks: 0,
        successfulTasks: 0,
        averageResponseTime: 0,
        uptimePercentage: 0
      });
    }

    const history = this.performanceHistory.get(agentId)!;
    history.scores.push(score);
    history.totalTasks = taskHistory.completedTasks + taskHistory.failedTasks;
    history.successfulTasks = taskHistory.completedTasks;
    history.averageResponseTime = taskHistory.averageTaskDuration;
    history.uptimePercentage = taskHistory.uptime;

    // Keep only last 50 scores
    if (history.scores.length > 50) {
      history.scores.shift();
    }
  }

  /**
   * Get current performance score for an agent
   */
  getCurrentScore(agentId: string): PerformanceScore | null {
    const history = this.performanceHistory.get(agentId);
    if (!history || history.scores.length === 0) {
      return null;
    }
    return history.scores[history.scores.length - 1];
  }

  /**
   * Get average performance score over time
   */
  getAverageScore(agentId: string, count: number = 10): PerformanceScore | null {
    const history = this.performanceHistory.get(agentId);
    if (!history || history.scores.length === 0) {
      return null;
    }

    const recentScores = history.scores.slice(-count);
    const sum = recentScores.reduce((acc, score) => ({
      overall: acc.overall + score.overall,
      speed: acc.speed + score.speed,
      reliability: acc.reliability + score.reliability,
      resourceEfficiency: acc.resourceEfficiency + score.resourceEfficiency,
      availability: acc.availability + score.availability
    }), {
      overall: 0,
      speed: 0,
      reliability: 0,
      resourceEfficiency: 0,
      availability: 0
    });

    const scoreCount = recentScores.length;
    return {
      overall: sum.overall / scoreCount,
      speed: sum.speed / scoreCount,
      reliability: sum.reliability / scoreCount,
      resourceEfficiency: sum.resourceEfficiency / scoreCount,
      availability: sum.availability / scoreCount,
      timestamp: new Date()
    };
  }

  /**
   * Get performance history for an agent
   */
  getPerformanceHistory(agentId: string): AgentPerformanceHistory | null {
    return this.performanceHistory.get(agentId) || null;
  }

  /**
   * Compare agents and return sorted by performance
   */
  rankAgents(agentIds: string[]): Array<{ agentId: string; score: number }> {
    const rankings = agentIds
      .map(agentId => {
        const score = this.getCurrentScore(agentId);
        return {
          agentId,
          score: score?.overall || 0
        };
      })
      .sort((a, b) => b.score - a.score);

    return rankings;
  }

  /**
   * Clear performance history for an agent
   */
  clearHistory(agentId: string): void {
    this.performanceHistory.delete(agentId);
  }

  /**
   * Get all tracked agents
   */
  getTrackedAgents(): string[] {
    return Array.from(this.performanceHistory.keys());
  }

  /**
   * Score multiple agents for task assignment
   */
  async scoreAgents(
    candidates: any[],
    requiredCapabilities: string[],
    taskContext: any
  ): Promise<Array<{ agent: any; score: number }>> {
    return candidates.map(agent => {
      const agentId = agent.id || agent.agentId;
      const currentScore = this.getCurrentScore(agentId);
      return {
        agent,
        score: currentScore?.overall || 0.5
      };
    }).sort((a, b) => b.score - a.score);
  }
}