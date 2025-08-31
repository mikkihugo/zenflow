/**
 * Weighted Round Robin Load Balancing Algorithm.
 * Performance-based weights with dynamic adjustment.
 */
/**
 * @file Coordination system:weighted-round-robin
 */

import type { LoadBalancingAlgorithm } from '../interfaces';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types';

interface AgentWeight {
  agentId: string;
  weight: number;
  currentWeight: number;
  effectiveWeight: number;
  successCount: number;
  failureCount: number;
  lastUpdate: Date;
}

export class WeightedRoundRobinAlgorithm implements LoadBalancingAlgorithm {
  public readonly name = 'weighted_round_robin';

  private weights: Map<string, AgentWeight> = new Map();
  private config = {
    initialWeight: 100,
    minWeight: 1,
    maxWeight: 1000,
    weightDecayFactor: 0.9,
    performanceWindow: 300000, // 5 minutes
    adaptationRate: 0.1,
  };

  /**
   * Select the best agent using weighted round robin.
   *
   * @param _task
   * @param availableAgents
   * @param metrics
   */
  public async selectAgent(
    _task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<RoutingResult> {
    if (availableAgents.length === 0) {
      throw new Error('No available agents');
    }

    if (availableAgents.length === 1) {
      return {
        selectedAgent: availableAgents[0],
        confidence: 1.0,
        reasoning: 'Only agent available',
        alternativeAgents: [],
        estimatedLatency: this.estimateLatency(availableAgents[0], metrics),
        expectedQuality: 0.8,
      };
    }

    // Update weights based on current metrics
    await this.updateWeightsFromMetrics(availableAgents, metrics);

    // Find the agent with highest current weight
    let selectedAgent: Agent | null = null;
    let maxCurrentWeight = -1;
    let totalWeight = 0;

    for (const agent of availableAgents) {
      const weight = this.getOrCreateWeight(agent.id);
      totalWeight += weight.effectiveWeight;

      weight.currentWeight += weight.effectiveWeight;

      if (weight.currentWeight > maxCurrentWeight) {
        maxCurrentWeight = weight.currentWeight;
        selectedAgent = agent;
      }
    }

    if (!selectedAgent) {
      selectedAgent = availableAgents[0] as any;
    }

    if (!selectedAgent) {
      throw new Error('No agent selected by weighted round robin');
    }

    // Decrease the current weight of selected agent
    const selectedWeight = this.weights.get(selectedAgent.id);
    if (selectedWeight) {
      selectedWeight.currentWeight -= totalWeight;
    }

    // Calculate confidence and alternatives
    const confidence = this.calculateConfidence(
      selectedAgent,
      availableAgents,
      metrics
    );
    const alternatives = this.getAlternativeAgents(
      selectedAgent,
      availableAgents,
      3
    );

    return {
      selectedAgent,
      confidence,
      reasoning: `Selected based on weighted round robin (weight: ${selectedWeight?.effectiveWeight || 'unknown'})"Fixed unterminated template"