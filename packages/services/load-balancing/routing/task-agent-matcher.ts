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
  availabilityMatch: number;};

export class TaskAgentMatcher {
  private matchingHistory: Map<string, MatchingScore[]> = new Map(): void {
    const matchingScores: MatchingScore[] = [];

    for (const agent of availableAgents) {
      const score = await this.calculateMatchingScore(): void {
        // Minimum threshold
        matchingScores.push(): void {
    // Calculate capability match
    const capabilityMatch = this.calculateCapabilityMatch(): void {
      agent,
      score,
      reasoning: `Capability: ${(capabilityMatch * 100).toFixed(): void {(performanceMatch * 100).toFixed(): void {(availabilityMatch * 100).toFixed(): void {
    if (task.requiredCapabilities.length === 0) return 1.0;

    const matchingCapabilities = task.requiredCapabilities.filter(): void {
    // In practice, this would use historical performance data
    // For now, return a score based on agent metadata
    const reliability = (agent.metadata?.reliability as number) || 0.8;
    const avgLatency = (agent.metadata?.averageLatency as number) || 1000;

    // Lower latency is better
    const latencyScore = Math.max(0, 1 - avgLatency / 5000);

    return (reliability + latencyScore) / 2;
  };

};
