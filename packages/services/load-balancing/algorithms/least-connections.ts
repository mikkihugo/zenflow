/**
 * Least Connections Load Balancing Algorithm.
 * Predictive capacity modeling with connection tracking.
 */
/**
 * @file Coordination system:least-connections
 */

import type { LoadBalancingAlgorithm } from '../interfaces';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types';
import { taskPriorityToNumber } from '../types';

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
      reasoning: `Selected agent with ${  scoredAgents[0]?.connections  } active connections (capacity:${  scoredAgents[0]?.capacity  })`,
      alternativeAgents: alternatives,
      estimatedLatency: this.estimateLatency(selectedAgent, metrics),
      expectedQuality: this.estimateQuality(selectedAgent, metrics),
    };
  }

  /**
   * Update algorithm configuration.
   *
   * @param config
   */
  public async updateConfiguration(
    config: Record<string, unknown>
  ): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get performance metrics.
   */
  public async getPerformanceMetrics(): Promise<Record<string, number>> {
    const states = Array.from(this.connectionStates.values());

    const totalConnections = states.reduce(
      (sum, s) => sum + s.activeConnections,
      0
    );
    const totalCapacity = states.reduce((sum, s) => sum + s.maxConnections, 0);
    const avgUtilization =
      totalCapacity > 0 ? totalConnections / totalCapacity : 0;

    return {
      totalAgents: states.length,
      totalActiveConnections: totalConnections,
      totalCapacity,
      averageUtilization: avgUtilization,
      capacityPredictionAccuracy: await this.calculatePredictionAccuracy(),
      averageConnectionDuration:
        this.calculateAverageConnectionDuration(states),
    };
  }

  /**
   * Handle task completion.
   *
   * @param agentId
   * @param task
   * @param duration
   * @param success
   */
  public async onTaskComplete(
    agentId: string,
    task: Task,
    duration: number,
    success: boolean
  ): Promise<void> {
    const state = this.getOrCreateConnectionState(agentId);

    // Decrement active connections
    state.activeConnections = Math.max(0, state.activeConnections - 1);

    // Update completion history
    state.recentCompletions.push(new Date());

    // Keep only recent completions within the window
    const cutoff = new Date(Date.now() - this.config.capacityPredictionWindow);
    state.recentCompletions = state.recentCompletions.filter(
      (date) => date > cutoff
    );

    // Update average connection duration
    this.updateAverageConnectionDuration(state, duration);

    // Update capacity prediction if adaptive capacity is enabled
    if (this.config.adaptiveCapacityEnabled) {
      await this.updateCapacityPrediction(state);
    }
  }

  /**
   * Handle agent failure.
   *
   * @param agentId
   * @param error
   */
  public async onAgentFailure(agentId: string, error: Error): Promise<void> {
    const state = this.getOrCreateConnectionState(agentId);

    // Reset active connections on failure
    state.activeConnections = 0;

    // Reduce predicted capacity temporarily
    state.predictedCapacity = Math.max(1, state.predictedCapacity * 0.5);
    state.lastCapacityUpdate = new Date();
  }

  /**
   * Get or create connection state for an agent.
   *
   * @param agentId
   */
  private getOrCreateConnectionState(agentId: string): ConnectionState {
    if (!this.connectionStates.has(agentId)) {
      this.connectionStates.set(agentId, {
        agentId,
        activeConnections: 0,
        maxConnections: this.config.defaultMaxConnections,
        averageConnectionDuration: 5000, // Default 5s
        recentCompletions: [],
        predictedCapacity: this.config.defaultMaxConnections,
        connectionHistory: [],
        lastCapacityUpdate: new Date(),
      });
    }
    return this.connectionStates.get(agentId)!;
  }

  /**
   * Update connection states based on current metrics.
   *
   * @param agents
   * @param metrics
   */
  private async updateConnectionStates(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<void> {
    for (const agent of agents) {
      const state = this.getOrCreateConnectionState(agent.id);
      const agentMetrics = metrics.get(agent.id);

      if (agentMetrics) {
        // Update active connections from metrics
        state.activeConnections = agentMetrics.activeTasks;

        // Record connection history
        state.connectionHistory.push(agentMetrics.activeTasks);
        if (state.connectionHistory.length > this.config.historySize) {
          state.connectionHistory.shift();
        }

        // Update capacity prediction if enabled
        if (this.config.adaptiveCapacityEnabled) {
          await this.updateCapacityPrediction(state);
        }
      }
    }
  }

  /**
   * Score agents based on connections and capacity.
   *
   * @param agents
   * @param task
   * @param metrics
   */
  private async scoreAgents(
    agents: Agent[],
    task: Task,
    metrics: Map<string, LoadMetrics>
  ): Promise<
    Array<{
      agent: Agent;
      score: number;
      connections: number;
      capacity: number;
    }>
  > {
    const scored: Array<{
      agent: Agent;
      score: number;
      connections: number;
      capacity: number;
    }> = [];

    for (const agent of agents) {
      const state = this.getOrCreateConnectionState(agent.id);
      const agentMetrics = metrics.get(agent.id);

      // Check if agent has available capacity
      const availableCapacity =
        state.predictedCapacity * this.config.capacityBufferRatio;
      if (state.activeConnections >= availableCapacity) {
        continue; // Skip agents at capacity
      }

      // Calculate base score (lower is better)
      let score = state.activeConnections;

      // Adjust score based on predicted capacity utilization
      const utilizationRatio =
        state.activeConnections / state.predictedCapacity;
      score += utilizationRatio * 100; // Penalty for high utilization

      // Adjust for task priority
      if (taskPriorityToNumber(task.priority) > 3) {
        score *= 0.8; // Prefer this agent for high priority tasks
      }

      // Adjust for response time if available
      if (agentMetrics) {
        const responseTimeFactor = Math.min(
          2,
          agentMetrics.responseTime / 1000
        ); // Normalize to seconds
        score += responseTimeFactor;
      }

      // Adjust for error rate
      if (agentMetrics && agentMetrics.errorRate > 0) {
        score += agentMetrics.errorRate * 1000; // Heavy penalty for errors
      }

      scored.push({
        agent,
        score,
        connections: state.activeConnections,
        capacity: Math.floor(state.predictedCapacity),
      });
    }

    return scored;
  }

  /**
   * Increment connection count for an agent.
   *
   * @param agentId
   */
  private async incrementConnections(agentId: string): Promise<void> {
    const state = this.getOrCreateConnectionState(agentId);
    state.activeConnections++;
  }

  /**
   * Update capacity prediction based on historical data.
   *
   * @param state
   */
  private async updateCapacityPrediction(
    state: ConnectionState
  ): Promise<void> {
    const now = new Date();
    const timeSinceUpdate = now.getTime() - state.lastCapacityUpdate.getTime();

    // Only update if enough time has passed
    if (timeSinceUpdate < 30000) return; // Update at most every 30 seconds

    // Calculate throughput-based capacity
    const recentThroughput = this.calculateRecentThroughput(state);
    const throughputBasedCapacity =
      recentThroughput * (state.averageConnectionDuration / 1000);

    // Calculate historical peak capacity
    const historicalPeak = Math.max(
      ...state.connectionHistory,
      state.maxConnections
    );

    // Use exponential smoothing to update predicted capacity
    const newPrediction = Math.max(
      throughputBasedCapacity,
      historicalPeak * 0.8, // Conservative estimate
      state.maxConnections * 0.5 // Minimum threshold
    );

    state.predictedCapacity =
      state.predictedCapacity * (1 - this.config.smoothingFactor) +
      newPrediction * this.config.smoothingFactor;

    state.lastCapacityUpdate = now;
  }

  /**
   * Calculate recent throughput (completions per second)
   *
   * @param state.
   */
  private calculateRecentThroughput(state: ConnectionState): number {
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - this.config.capacityPredictionWindow
    );

    const recentCompletions = state.recentCompletions.filter(
      (date) => date > windowStart
    );
    const windowDurationSeconds = this.config.capacityPredictionWindow / 1000;

    return recentCompletions.length / windowDurationSeconds;
  }

  /**
   * Update average connection duration with new measurement.
   *
   * @param state
   * @param newDuration
   */
  private updateAverageConnectionDuration(
    state: ConnectionState,
    newDuration: number
  ): void {
    // Use exponential moving average
    state.averageConnectionDuration =
      state.averageConnectionDuration * (1 - this.config.smoothingFactor) +
      newDuration * this.config.smoothingFactor;
  }

  /**
   * Calculate confidence in the selection.
   *
   * @param scoredAgents
   */
  private calculateConfidence(scoredAgents: Array<{ score: number }>): number {
    if (scoredAgents.length < 2) return 1.0;

    const bestScore = scoredAgents[0]?.score;
    const secondBestScore = scoredAgents[1]?.score;

    // Higher difference in scores = higher confidence
    const scoreDifference = secondBestScore - bestScore;
    const relativeAdvantage = scoreDifference / (secondBestScore + 1);

    return Math.min(1.0, Math.max(0.1, relativeAdvantage + 0.5));
  }

  /**
   * Estimate latency based on current load.
   *
   * @param agent
   * @param metrics
   */
  private estimateLatency(
    agent: Agent,
    metrics: Map<string, LoadMetrics>
  ): number {
    const agentMetrics = metrics.get(agent.id);
    const state = this.getOrCreateConnectionState(agent.id);

    let baseLatency = agentMetrics?.responseTime || 1000;

    // Adjust for current load
    const loadFactor = state.activeConnections / state.predictedCapacity;
    baseLatency *= 1 + loadFactor;

    return Math.max(100, baseLatency); // Minimum 100ms
  }

  /**
   * Estimate quality based on error rate and utilization.
   *
   * @param agent
   * @param metrics
   */
  private estimateQuality(
    agent: Agent,
    metrics: Map<string, LoadMetrics>
  ): number {
    const agentMetrics = metrics.get(agent.id);
    const state = this.getOrCreateConnectionState(agent.id);

    let quality = 0.9; // Base quality

    // Reduce quality for errors
    if (agentMetrics?.errorRate) {
      quality *= 1 - agentMetrics.errorRate;
    }

    // Reduce quality for high utilization
    const utilization = state.activeConnections / state.predictedCapacity;
    if (utilization > 0.8) {
      quality *= 1 - (utilization - 0.8) * 2; // Linear decrease after 80%
    }

    return Math.max(0.1, quality);
  }

  /**
   * Calculate prediction accuracy.
   */
  private async calculatePredictionAccuracy(): Promise<number> {
    const states = Array.from(this.connectionStates.values());
    let totalError = 0;
    let samples = 0;

    for (const state of states) {
      if (state.connectionHistory.length > 10) {
        const recent = state.connectionHistory.slice(-10);
        const actual = Math.max(...recent);
        const predicted = state.predictedCapacity;

        const error =
          Math.abs(actual - predicted) / Math.max(actual, predicted, 1);
        totalError += error;
        samples++;
      }
    }

    return samples > 0 ? 1 - totalError / samples : 0.8; // Default 80% accuracy
  }

  /**
   * Calculate average connection duration across all agents.
   *
   * @param states
   */
  private calculateAverageConnectionDuration(
    states: ConnectionState[]
  ): number {
    if (states.length === 0) return 0;

    const totalDuration = states.reduce(
      (sum, s) => sum + s.averageConnectionDuration,
      0
    );
    return totalDuration / states.length;
  }
}
