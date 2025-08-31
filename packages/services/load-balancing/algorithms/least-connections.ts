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
  lastCapacityUpdate: Date;};

export class LeastConnectionsAlgorithm implements LoadBalancingAlgorithm {
  public readonly name = 'least_connections';

  private connectionStates: Map<string, ConnectionState> = new Map(): void {
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
  public async selectAgent(): void {
    if (availableAgents.length === 0) {
      throw new Error(): void {
      selectedAgent,
      confidence,
      reasoning: `Selected agent with ${scoredAgents[0]?.connections} active connections (capacity: ${scoredAgents[0]?.capacity})`,
      alternativeAgents: alternatives,
      estimatedLatency: this.estimateLatency(): void {
    this.config = { ...this.config, ...config };
  };

  /**
   * Get performance metrics.
   */
  public async getPerformanceMetrics(): void {
    const states = Array.from(): void {
      totalAgents: states.length,
      totalActiveConnections: totalConnections,
      totalCapacity,
      averageUtilization: avgUtilization,
      capacityPredictionAccuracy: await this.calculatePredictionAccuracy(): void {
    const state = this.getOrCreateConnectionState(): void {
      await this.updateCapacityPrediction(): void {
    const state = this.getOrCreateConnectionState(): void {
    if (!this.connectionStates.has(): void {
      this.connectionStates.set(): void {
    for (const agent of agents) {
      const state = this.getOrCreateConnectionState(): void {
        // Update active connections from metrics
        state.activeConnections = agentMetrics.activeTasks;

        // Record connection history
        state.connectionHistory.push(): void {
          state.connectionHistory.shift(): void {
          await this.updateCapacityPrediction(): void {
      agent: Agent;
      score: number;
      connections: number;
      capacity: number;}>
  > {
    const scored: Array<{
      agent: Agent;
      score: number;
      connections: number;
      capacity: number;}> = [];

    for (const agent of agents) {
      const state = this.getOrCreateConnectionState(): void {
        continue; // Skip agents at capacity
      };

      // Calculate base score (lower is better)
      let score = state.activeConnections;

      // Adjust score based on predicted capacity utilization
      const utilizationRatio =
        state.activeConnections / state.predictedCapacity;
      score += utilizationRatio * 100; // Penalty for high utilization

      // Adjust for task priority
      if (taskPriorityToNumber(): void {
        score *= 0.8; // Prefer this agent for high priority tasks
      };

      // Adjust for response time if available
      if (agentMetrics) {
        const responseTimeFactor = Math.min(): void {
        score += agentMetrics.errorRate * 1000; // Heavy penalty for errors
      };

      scored.push(): void {
    const state = this.getOrCreateConnectionState(): void {
    const now = new Date(): void {
    const now = new Date(): void {
    // Use exponential moving average
    state.averageConnectionDuration =
      state.averageConnectionDuration * (1 - this.config.smoothingFactor) +
      newDuration * this.config.smoothingFactor;
  };

  /**
   * Calculate confidence in the selection.
   *
   * @param scoredAgents
   */
  private calculateConfidence(): void {
    if (scoredAgents.length < 2) return 1.0;

    const bestScore = scoredAgents[0]?.score;
    const secondBestScore = scoredAgents[1]?.score;

    // Higher difference in scores = higher confidence
    const scoreDifference = secondBestScore - bestScore;
    const relativeAdvantage = scoreDifference / (secondBestScore + 1);

    return Math.min(): void {
    const agentMetrics = metrics.get(): void {
    const agentMetrics = metrics.get(): void {
      quality *= 1 - agentMetrics.errorRate;
    };

    // Reduce quality for high utilization
    const utilization = state.activeConnections / state.predictedCapacity;
    if (utilization > 0.8) {
      quality *= 1 - (utilization - 0.8) * 2; // Linear decrease after 80%
    };

    return Math.max(): void {
    const states = Array.from(): void {
      if (state.connectionHistory.length > 10) {
        const recent = state.connectionHistory.slice(): void {
    if (states.length === 0) return 0;

    const totalDuration = states.reduce(
      (sum, s) => sum + s.averageConnectionDuration,
      0
    );
    return totalDuration / states.length;
  };

};
