/**
 * Task-Agent Matcher.
 * Intelligent matching of tasks to suitable agents based on capabilities and performance.
 */
/**
 * @file Coordination system:task-agent-matcher
 */

import type { CapacityManager } from '../interfaces';
import type { Agent, Task } from '../types';

interface MatchingScore {
  agent: Agent;
  score: number;
  reasoning: string;
  capabilityMatch: number;
  performanceMatch: number;
  availabilityMatch: number;
}

export class TaskAgentMatcher {
  private matchingHistory: Map<string, MatchingScore[]> = new Map();

  public async findCandidates(
    task: Task,
    availableAgents: Agent[],
    capacityManager: CapacityManager
  ): Promise<Agent[]> {
    const matchingScores: MatchingScore[] = [];

    for (const agent of availableAgents) {
      const score = await this.calculateMatchingScore(
        task,
        agent,
        capacityManager
      );
      if (score.score > 0.3) {
        // Minimum threshold
        matchingScores.push(score);
      }
    }

    // Sort by score (highest first)
    matchingScores?.sort((a, b) => b.score - a.score);

    // Store matching history
    this.matchingHistory.set(task.id, matchingScores);

    return matchingScores.map((score) => score.agent);
  }

  private async calculateMatchingScore(
    task: Task,
    agent: Agent,
    capacityManager: CapacityManager
  ): Promise<MatchingScore> {
    // Calculate capability match
    const capabilityMatch = this.calculateCapabilityMatch(task, agent);

    // Calculate performance match based on historical data
    const performanceMatch = this.calculatePerformanceMatch(task, agent);

    // Calculate availability match
    const capacity = await capacityManager.getCapacity(agent.id);
    const availabilityMatch =
      capacity.availableCapacity / capacity.maxConcurrentTasks;

    // Combine scores with weights
    const score =
      capabilityMatch * 0.4 + performanceMatch * 0.3 + availabilityMatch * 0.3;

    return {
      agent,
      score,
      reasoning: `Capability: ${  (capabilityMatch * 100).toFixed(1)  }%, Performance:${  (performanceMatch * 100).toFixed(1)  }%, Availability:${  (availabilityMatch * 100).toFixed(1)  }%`,
      capabilityMatch,
      performanceMatch,
      availabilityMatch,
    };
  }

  private calculateCapabilityMatch(task: Task, agent: Agent): number {
    if (task.requiredCapabilities.length === 0) return 1.0;

    const matchingCapabilities = task.requiredCapabilities.filter(
      (capability) => agent.capabilities.includes(capability)
    );

    return matchingCapabilities.length / task.requiredCapabilities.length;
  }

  private calculatePerformanceMatch(_task: Task, agent: Agent): number {
    // In practice, this would use historical performance data
    // For now, return a score based on agent metadata
    const reliability = (agent.metadata?.reliability as number) || 0.8;
    const avgLatency = (agent.metadata?.averageLatency as number) || 1000;

    // Lower latency is better
    const latencyScore = Math.max(0, 1 - avgLatency / 5000);

    return (reliability + latencyScore) / 2;
  }
}
