/**
 * Least Connections Load Balancing Algorithm.
 * Predictive capacity modeling with connection tracking.
 */
/**
 * @file Coordination system:least-connections
 */

import type { LoadBalancingAlgorithm } from '../interfaces';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types';
import { taskPriorityToNumber as _taskPriorityToNumber } from '../types';

interface ConnectionState {
  agentId: string;
  activeConnections: number;
  maxConnections: number;
  averageConnectionDuration: number;
  recentCompletions: Date[];
  predictedCapacity: number;
  connectionHistory: number[];
  lastCapacityUpdate: Date;
}

export class LeastConnectionsAlgorithm implements LoadBalancingAlgorithm {
  public readonly name = 'least_connections';

  private connectionStates: Map<string, ConnectionState> = new Map();
  private config = {
    defaultMaxConnections: 100,
    capacityPredictionWindow: 300000, // 5 minutes
    historySize: 100,
    adaptiveCapacityEnabled: true,
    connectionTimeoutMs: 30000,
    capacityBufferRatio: 0.8, // Use 80% of predicted capacity
    smoothingFactor: 0.3, // For exponential smoothing
  };

  /**
   * Select agent with least connections and available capacity.
   *
   * @param task
   * @param availableAgents
   * @param metrics
   */
  public async selectAgent(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<RoutingResult> {
    if (availableAgents.length === 0) {
      throw new Error('No available agents');
    }

    if (availableAgents.length === 1) {
      const agent = availableAgents[0];
      return {
        selectedAgent: agent,
        confidence: 1.0,
        reasoning: 'Only agent available',
        alternativeAgents: [],
        estimatedLatency: this.estimateLatency(agent, metrics),
        expectedQuality: 0.8,
      };
    }

    // Update connection states and capacity predictions
    await this.updateConnectionStates(availableAgents, metrics);

    // Score agents based on connections and predicted capacity
    const scoredAgents = await this.scoreAgents(availableAgents, task, metrics);

    // Sort by score (lower is better for least connections)
    scoredAgents.sort((a, b) => a.score - b.score);

    const selectedAgent = scoredAgents[0]?.agent;
    const confidence = this.calculateConfidence(scoredAgents);
    const alternatives = scoredAgents.slice(1, 4).map((s) => s.agent);

    // Update connection count for selected agent
    await this.incrementConnections(selectedAgent?.id);

    return {
      selectedAgent,
      confidence,
      reasoning: `Selected agent with ${scoredAgents[0]?.connections} active connections (capacity:${scoredAgents[0]?.capacity})"Fixed unterminated template"