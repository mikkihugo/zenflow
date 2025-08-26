/**
 * Weighted Round Robin Load Balancing Algorithm.
 * Performance-based weights with dynamic adjustment.
 */
/**
 * @file Coordination system: weighted-round-robin
 */

import type { LoadBalancingAlgorithm } from "../interfaces";
import type { Agent, LoadMetrics, RoutingResult, Task } from "../types";

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
	public readonly name = "weighted_round_robin";

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
		metrics: Map<string, LoadMetrics>,
	): Promise<RoutingResult> {
		if (availableAgents.length === 0) {
			throw new Error("No available agents");
		}

		if (availableAgents.length === 1) {
			return {
				selectedAgent: availableAgents[0],
				confidence: 1.0,
				reasoning: "Only agent available",
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
			throw new Error("No agent selected by weighted round robin");
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
			metrics,
		);
		const alternatives = this.getAlternativeAgents(
			selectedAgent,
			availableAgents,
			3,
		);

		return {
			selectedAgent,
			confidence,
			reasoning: `Selected based on weighted round robin (weight: ${selectedWeight?.effectiveWeight || "unknown"})`,
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
		config: Record<string, unknown>,
	): Promise<void> {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Get performance metrics for this algorithm.
	 */
	public async getPerformanceMetrics(): Promise<Record<string, number>> {
		const weights = Array.from(this.weights.values());

		return {
			totalAgents: weights.length,
			averageWeight:
				weights.reduce((sum, w) => sum + w.weight, 0) / weights.length,
			weightVariance: this.calculateWeightVariance(weights),
			adaptationRate: this.config.adaptationRate,
			successRate: this.calculateOverallSuccessRate(weights),
		};
	}

	/**
	 * Update weights based on current performance metrics.
	 *
	 * @param agents
	 * @param metrics
	 */
	public async updateWeights(
		agents: Agent[],
		metrics: Map<string, LoadMetrics>,
	): Promise<void> {
		await this.updateWeightsFromMetrics(agents, metrics);
	}

	/**
	 * Handle task completion to adjust weights.
	 *
	 * @param agentId
	 * @param _task
	 * @param _duration
	 * @param success
	 */
	public async onTaskComplete(
		agentId: string,
		_task: Task,
		_duration: number,
		success: boolean,
	): Promise<void> {
		const weight = this.getOrCreateWeight(agentId);

		if (success) {
			weight.successCount++;
			// Increase weight for successful completions
			weight.weight = Math.min(
				this.config.maxWeight,
				weight.weight * (1 + this.config.adaptationRate),
			);
		} else {
			weight.failureCount++;
			// Decrease weight for failures
			weight.weight = Math.max(
				this.config.minWeight,
				weight.weight * this.config.weightDecayFactor,
			);
		}

		weight.lastUpdate = new Date();
		this.updateEffectiveWeight(weight);
	}

	/**
	 * Handle agent failure.
	 *
	 * @param agentId
	 * @param _error
	 */
	public async onAgentFailure(agentId: string, _error: Error): Promise<void> {
		const weight = this.getOrCreateWeight(agentId);
		weight.failureCount++;

		// Significantly reduce weight on failure
		weight.weight = Math.max(this.config.minWeight, weight.weight * 0.5);

		weight.lastUpdate = new Date();
		this.updateEffectiveWeight(weight);
	}

	/**
	 * Get or create weight entry for an agent.
	 *
	 * @param agentId
	 */
	private getOrCreateWeight(agentId: string): AgentWeight {
		if (!this.weights.has(agentId)) {
			this.weights.set(agentId, {
				agentId,
				weight: this.config.initialWeight,
				currentWeight: 0,
				effectiveWeight: this.config.initialWeight,
				successCount: 0,
				failureCount: 0,
				lastUpdate: new Date(),
			});
		}
		return this.weights.get(agentId)!;
	}

	/**
	 * Update weights based on performance metrics.
	 *
	 * @param agents
	 * @param metrics
	 */
	private async updateWeightsFromMetrics(
		agents: Agent[],
		metrics: Map<string, LoadMetrics>,
	): Promise<void> {
		const now = new Date();

		for (const agent of agents) {
			const agentMetrics = metrics.get(agent.id);
			if (!agentMetrics) continue;

			const weight = this.getOrCreateWeight(agent.id);

			// Calculate performance score based on multiple factors
			const performanceScore = this.calculatePerformanceScore(agentMetrics);

			// Adjust weight based on performance score
			const targetWeight = this.config.initialWeight * performanceScore;
			const weightDelta =
				(targetWeight - weight.weight) * this.config.adaptationRate;

			weight.weight = Math.max(
				this.config.minWeight,
				Math.min(this.config.maxWeight, weight.weight + weightDelta),
			);

			weight.lastUpdate = now;
			this.updateEffectiveWeight(weight);
		}
	}

	/**
	 * Calculate performance score from metrics.
	 *
	 * @param metrics
	 */
	private calculatePerformanceScore(metrics: LoadMetrics): number {
		// Normalize metrics to 0-1 range and calculate composite score
		const cpuScore = Math.max(0, 1 - metrics.cpuUsage);
		const memoryScore = Math.max(0, 1 - metrics.memoryUsage);
		const responseTimeScore = Math.max(0, 1 - metrics.responseTime / 10000); // Assume 10s is max
		const errorScore = Math.max(0, 1 - metrics.errorRate);
		const throughputScore = Math.min(1, metrics.throughput / 100); // Normalize to 100

		// Weighted combination of scores
		return (
			cpuScore * 0.2 +
			memoryScore * 0.2 +
			responseTimeScore * 0.3 +
			errorScore * 0.2 +
			throughputScore * 0.1
		);
	}

	/**
	 * Update effective weight considering recent performance.
	 *
	 * @param weight
	 */
	private updateEffectiveWeight(weight: AgentWeight): void {
		const now = new Date();
		const timeSinceUpdate = now.getTime() - weight.lastUpdate.getTime();

		// Apply time-based decay to effective weight
		weight.effectiveWeight =
			timeSinceUpdate > this.config.performanceWindow
				? weight.weight * this.config.weightDecayFactor
				: weight.weight;

		// Consider success/failure ratio
		const totalOperations = weight.successCount + weight.failureCount;
		if (totalOperations > 0) {
			const successRate = weight.successCount / totalOperations;
			weight.effectiveWeight *= 0.5 + successRate * 0.5; // Scale by success rate
		}
	}

	/**
	 * Calculate confidence in the selection.
	 *
	 * @param selectedAgent
	 * @param availableAgents
	 * @param _metrics
	 */
	private calculateConfidence(
		selectedAgent: Agent,
		availableAgents: Agent[],
		_metrics: Map<string, LoadMetrics>,
	): number {
		const selectedWeight = this.weights.get(selectedAgent?.id);
		if (!selectedWeight) return 0.5;

		// Calculate confidence based on weight advantage over others
		const weights = availableAgents
			.map(
				(agent) =>
					this.weights.get(agent.id)?.effectiveWeight ||
					this.config.initialWeight,
			)
			.sort((a, b) => b - a);

		if (weights.length < 2) return 1.0;

		const topWeight = weights[0];
		const secondWeight = weights[1];
		const advantage = (topWeight - secondWeight) / topWeight;

		return Math.min(1.0, Math.max(0.1, advantage + 0.5));
	}

	/**
	 * Get alternative agents sorted by preference.
	 *
	 * @param selectedAgent
	 * @param availableAgents
	 * @param count
	 */
	private getAlternativeAgents(
		selectedAgent: Agent,
		availableAgents: Agent[],
		count: number,
	): Agent[] {
		return availableAgents
			.filter((agent) => agent.id !== selectedAgent?.id)
			.sort((a, b) => {
				const weightA =
					this.weights.get(a.id)?.effectiveWeight || this.config.initialWeight;
				const weightB =
					this.weights.get(b.id)?.effectiveWeight || this.config.initialWeight;
				return weightB - weightA;
			})
			.slice(0, count);
	}

	/**
	 * Estimate latency for an agent.
	 *
	 * @param agent
	 * @param metrics
	 */
	private estimateLatency(
		agent: Agent,
		metrics: Map<string, LoadMetrics>,
	): number {
		const agentMetrics = metrics.get(agent.id);
		if (!agentMetrics) return 1000; // Default 1s

		return agentMetrics.responseTime || 1000;
	}

	/**
	 * Estimate quality for an agent.
	 *
	 * @param agent
	 * @param metrics
	 */
	private estimateQuality(
		agent: Agent,
		metrics: Map<string, LoadMetrics>,
	): number {
		const agentMetrics = metrics.get(agent.id);
		if (!agentMetrics) return 0.8; // Default quality

		return Math.max(0, 1 - agentMetrics.errorRate);
	}

	/**
	 * Calculate variance in weights.
	 *
	 * @param weights
	 */
	private calculateWeightVariance(weights: AgentWeight[]): number {
		if (weights.length === 0) return 0;

		const mean = weights.reduce((sum, w) => sum + w.weight, 0) / weights.length;
		return (
			weights.reduce((sum, w) => sum + (w.weight - mean) ** 2, 0) /
			weights.length
		);
	}

	/**
	 * Calculate overall success rate.
	 *
	 * @param weights
	 */
	private calculateOverallSuccessRate(weights: AgentWeight[]): number {
		const totalSuccess = weights.reduce((sum, w) => sum + w.successCount, 0);
		const totalOperations = weights.reduce(
			(sum, w) => sum + w.successCount + w.failureCount,
			0,
		);

		return totalOperations > 0 ? totalSuccess / totalOperations : 0;
	}
}
