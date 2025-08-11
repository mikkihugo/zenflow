/**
 * Weighted Round Robin Load Balancing Algorithm.
 * Performance-based weights with dynamic adjustment.
 */
/**
 * @file Coordination system: weighted-round-robin
 */
import type { LoadBalancingAlgorithm } from '../interfaces.ts';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types.ts';
export declare class WeightedRoundRobinAlgorithm implements LoadBalancingAlgorithm {
    readonly name = "weighted_round_robin";
    private weights;
    private config;
    /**
     * Select the best agent using weighted round robin.
     *
     * @param _task
     * @param availableAgents
     * @param metrics
     */
    selectAgent(_task: Task, availableAgents: Agent[], metrics: Map<string, LoadMetrics>): Promise<RoutingResult>;
    /**
     * Update algorithm configuration.
     *
     * @param config
     */
    updateConfiguration(config: Record<string, any>): Promise<void>;
    /**
     * Get performance metrics for this algorithm.
     */
    getPerformanceMetrics(): Promise<Record<string, number>>;
    /**
     * Update weights based on current performance metrics.
     *
     * @param agents
     * @param metrics
     */
    updateWeights(agents: Agent[], metrics: Map<string, LoadMetrics>): Promise<void>;
    /**
     * Handle task completion to adjust weights.
     *
     * @param agentId
     * @param _task
     * @param _duration
     * @param success
     */
    onTaskComplete(agentId: string, _task: Task, _duration: number, success: boolean): Promise<void>;
    /**
     * Handle agent failure.
     *
     * @param agentId
     * @param _error
     */
    onAgentFailure(agentId: string, _error: Error): Promise<void>;
    /**
     * Get or create weight entry for an agent.
     *
     * @param agentId
     */
    private getOrCreateWeight;
    /**
     * Update weights based on performance metrics.
     *
     * @param agents
     * @param metrics
     */
    private updateWeightsFromMetrics;
    /**
     * Calculate performance score from metrics.
     *
     * @param metrics
     */
    private calculatePerformanceScore;
    /**
     * Update effective weight considering recent performance.
     *
     * @param weight
     */
    private updateEffectiveWeight;
    /**
     * Calculate confidence in the selection.
     *
     * @param selectedAgent
     * @param availableAgents
     * @param _metrics
     */
    private calculateConfidence;
    /**
     * Get alternative agents sorted by preference.
     *
     * @param selectedAgent
     * @param availableAgents
     * @param count
     */
    private getAlternativeAgents;
    /**
     * Estimate latency for an agent.
     *
     * @param agent
     * @param metrics
     */
    private estimateLatency;
    /**
     * Estimate quality for an agent.
     *
     * @param agent
     * @param metrics
     */
    private estimateQuality;
    /**
     * Calculate variance in weights.
     *
     * @param weights
     */
    private calculateWeightVariance;
    /**
     * Calculate overall success rate.
     *
     * @param weights
     */
    private calculateOverallSuccessRate;
}
//# sourceMappingURL=weighted-round-robin.d.ts.map