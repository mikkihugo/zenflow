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
      reasoning: `Capability: ${(capabilityMatch * 100).toFixed(1)}%, Performance:${(performanceMatch * 100).toFixed(1)}%, Availability:${(availabilityMatch * 100).toFixed(1)}%"Fixed unterminated template"