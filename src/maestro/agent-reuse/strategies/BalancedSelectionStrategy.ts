/**
 * Balanced Selection Strategy for Agent Pool Management
 * Balances performance, availability, and resource utilization when selecting agents
 */

import { PerformanceScore } from '../PerformanceScorer.js';
import { WorkloadMetrics } from '../WorkloadMonitor.js';

export interface AgentCandidate {
  agentId: string;
  type: string;
  capabilities: string[];
  performanceScore?: PerformanceScore;
  workloadMetrics?: WorkloadMetrics;
  lastUsed: Date;
  usageCount: number;
  availability: 'available' | 'busy' | 'maintenance';
}

export interface SelectionCriteria {
  requiredCapabilities: string[];
  taskType: string;
  maxAgents: number;
  prioritizePerformance: boolean;
  balanceWorkload: boolean;
  preferReused: boolean;
}

export interface SelectionResult {
  selectedAgents: AgentCandidate[];
  score: number;
  reasoning: string;
  alternatives: AgentCandidate[];
}

export class BalancedSelectionStrategy {
  /**
   * Select optimal agents based on balanced criteria
   */
  selectAgents(
    candidates: AgentCandidate[],
    criteria: SelectionCriteria
  ): SelectionResult {
    // Filter candidates by availability and capabilities
    const availableCandidates = this.filterCandidates(candidates, criteria);
    
    if (availableCandidates.length === 0) {
      return {
        selectedAgents: [],
        score: 0,
        reasoning: 'No available agents match the required capabilities',
        alternatives: []
      };
    }

    // Score each candidate
    const scoredCandidates = availableCandidates.map(candidate => ({
      candidate,
      score: this.calculateSelectionScore(candidate, criteria)
    }));

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Select top agents up to max limit
    const selectedCount = Math.min(criteria.maxAgents, scoredCandidates.length);
    const selected = scoredCandidates.slice(0, selectedCount);
    const alternatives = scoredCandidates.slice(selectedCount);

    const avgScore = selected.reduce((sum, s) => sum + s.score, 0) / selected.length;
    
    return {
      selectedAgents: selected.map(s => s.candidate),
      score: avgScore,
      reasoning: this.generateReasoning(selected, criteria),
      alternatives: alternatives.map(a => a.candidate)
    };
  }

  /**
   * Filter candidates by availability and capabilities
   */
  private filterCandidates(
    candidates: AgentCandidate[],
    criteria: SelectionCriteria
  ): AgentCandidate[] {
    return candidates.filter(candidate => {
      // Must be available
      if (candidate.availability !== 'available') {
        return false;
      }

      // Must have required capabilities
      const hasAllCapabilities = criteria.requiredCapabilities.every(
        capability => candidate.capabilities.includes(capability)
      );

      return hasAllCapabilities;
    });
  }

  /**
   * Calculate selection score for a candidate
   */
  private calculateSelectionScore(
    candidate: AgentCandidate,
    criteria: SelectionCriteria
  ): number {
    let score = 0;

    // Performance score (0-1)
    const performanceWeight = criteria.prioritizePerformance ? 0.4 : 0.25;
    const performanceScore = candidate.performanceScore?.overall || 0.5;
    score += performanceScore * performanceWeight;

    // Workload balance (0-1, higher is better for less loaded agents)
    const workloadWeight = criteria.balanceWorkload ? 0.3 : 0.2;
    const workloadScore = this.calculateWorkloadScore(candidate.workloadMetrics);
    score += workloadScore * workloadWeight;

    // Experience/reuse score (0-1)
    const reuseWeight = criteria.preferReused ? 0.2 : 0.15;
    const reuseScore = this.calculateReuseScore(candidate);
    score += reuseScore * reuseWeight;

    // Capability match score (0-1)
    const capabilityWeight = 0.15;
    const capabilityScore = this.calculateCapabilityScore(candidate, criteria);
    score += capabilityScore * capabilityWeight;

    // Freshness/availability score (0-1)
    const freshnessWeight = 0.1;
    const freshnessScore = this.calculateFreshnessScore(candidate);
    score += freshnessScore * freshnessWeight;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate workload score (lower workload = higher score)
   */
  private calculateWorkloadScore(metrics?: WorkloadMetrics): number {
    if (!metrics) return 0.7; // Default score for agents without metrics

    // Combine CPU, memory, and active tasks
    const cpuScore = Math.max(0, 1 - metrics.cpuUsage);
    const memoryScore = Math.max(0, 1 - metrics.memoryUsage);
    const taskScore = Math.max(0, 1 - Math.min(1, metrics.activeTasks / 10)); // Assume 10 is max reasonable

    return (cpuScore * 0.4 + memoryScore * 0.3 + taskScore * 0.3);
  }

  /**
   * Calculate reuse score (agents with some usage but not overused)
   */
  private calculateReuseScore(candidate: AgentCandidate): number {
    const usageCount = candidate.usageCount;
    
    if (usageCount === 0) return 0.3; // New agents get lower score
    if (usageCount <= 5) return 0.8; // Sweet spot
    if (usageCount <= 10) return 0.6; // Still good
    return 0.4; // Overused agents get lower score
  }

  /**
   * Calculate capability match score
   */
  private calculateCapabilityScore(
    candidate: AgentCandidate,
    criteria: SelectionCriteria
  ): number {
    const requiredCount = criteria.requiredCapabilities.length;
    const matchingCount = criteria.requiredCapabilities.filter(
      cap => candidate.capabilities.includes(cap)
    ).length;

    const baseScore = matchingCount / requiredCount;
    
    // Bonus for having extra relevant capabilities
    const extraRelevant = candidate.capabilities.length - requiredCount;
    const bonusScore = Math.min(0.2, extraRelevant * 0.05);
    
    return Math.min(1, baseScore + bonusScore);
  }

  /**
   * Calculate freshness score (recently used agents get slight penalty)
   */
  private calculateFreshnessScore(candidate: AgentCandidate): number {
    const timeSinceLastUse = Date.now() - candidate.lastUsed.getTime();
    const hoursSinceLastUse = timeSinceLastUse / (1000 * 60 * 60);
    
    if (hoursSinceLastUse < 1) return 0.7; // Recently used
    if (hoursSinceLastUse < 6) return 0.9; // Moderately fresh
    return 1.0; // Fresh
  }

  /**
   * Generate human-readable reasoning for the selection
   */
  private generateReasoning(
    selected: Array<{ candidate: AgentCandidate; score: number }>,
    criteria: SelectionCriteria
  ): string {
    if (selected.length === 0) {
      return 'No agents selected';
    }

    const reasons: string[] = [];
    
    if (criteria.prioritizePerformance) {
      const avgPerf = selected.reduce((sum, s) => 
        sum + (s.candidate.performanceScore?.overall || 0.5), 0) / selected.length;
      reasons.push(`High performance agents (avg: ${(avgPerf * 100).toFixed(1)}%)`);
    }

    if (criteria.balanceWorkload) {
      reasons.push('Balanced workload distribution');
    }

    if (criteria.preferReused) {
      const avgUsage = selected.reduce((sum, s) => sum + s.candidate.usageCount, 0) / selected.length;
      reasons.push(`Experienced agents (avg usage: ${avgUsage.toFixed(1)})`);
    }

    const capabilityMatch = selected.every(s => 
      criteria.requiredCapabilities.every(cap => 
        s.candidate.capabilities.includes(cap)
      )
    );
    
    if (capabilityMatch) {
      reasons.push('All required capabilities matched');
    }

    return reasons.join(', ');
  }

  /**
   * Evaluate selection quality
   */
  evaluateSelection(
    selectedAgents: AgentCandidate[],
    criteria: SelectionCriteria
  ): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    const scores = selectedAgents.map(agent => 
      this.calculateSelectionScore(agent, criteria)
    );
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze performance
    const avgPerformance = selectedAgents.reduce((sum, agent) => 
      sum + (agent.performanceScore?.overall || 0.5), 0) / selectedAgents.length;
    
    if (avgPerformance > 0.7) {
      strengths.push('High-performing agent selection');
    } else if (avgPerformance < 0.4) {
      weaknesses.push('Low average performance');
      recommendations.push('Consider training or replacing underperforming agents');
    }

    // Analyze workload distribution
    const workloads = selectedAgents
      .map(agent => agent.workloadMetrics?.activeTasks || 0);
    const maxWorkload = Math.max(...workloads);
    const minWorkload = Math.min(...workloads);
    
    if (maxWorkload - minWorkload <= 2) {
      strengths.push('Well-balanced workload distribution');
    } else {
      weaknesses.push('Uneven workload distribution');
      recommendations.push('Redistribute tasks to balance agent workloads');
    }

    return {
      score: avgScore,
      strengths,
      weaknesses,
      recommendations
    };
  }
}