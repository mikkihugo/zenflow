/**
 * Least Connections Load Balancing Algorithm.
 * Predictive capacity modeling with connection tracking.
 */
/**
 * @file Coordination system: least-connections
 */
import type { LoadBalancingAlgorithm } from '../interfaces.ts';
export declare class LeastConnectionsAlgorithm implements LoadBalancingAlgorithm {
    readonly name = "least_connections";
    private connectionStates;
    private config;
    /**
     * Select agent with least connections and available capacity.
     *
     * @param task
     * @param availableAgents
     * @param metrics
     */
    selectAgent(task: Task, availableAgents: Agent[], metrics: Map<string, LoadMetrics>): Promise<RoutingResult>;
    /**
     * Update algorithm configuration.
     *
     * @param config
     */
    updateConfiguration(config: Record<string, any>): Promise<void>;
    /**
     * Get performance metrics.
     */
    getPerformanceMetrics(): Promise<Record<string, number>>;
    /**
     * Handle task completion.
     *
     * @param agentId
     * @param _task
     * @param duration
     * @param _success
     */
    onTaskComplete(agentId: string, _task: Task, duration: number, _success: boolean): Promise<void>;
    /**
     * Handle agent failure.
     *
     * @param agentId
     * @param _error
     */
    onAgentFailure(agentId: string, _error: Error): Promise<void>;
    /**
     * Get or create connection state for an agent.
     *
     * @param agentId
     */
    private getOrCreateConnectionState;
    /**
     * Update connection states based on current metrics.
     *
     * @param agents
     * @param metrics
     */
    private updateConnectionStates;
    /**
     * Score agents based on connections and capacity.
     *
     * @param agents
     * @param task
     * @param metrics
     */
    private scoreAgents;
    /**
     * Increment connection count for an agent.
     *
     * @param agentId
     */
    private incrementConnections;
    /**
     * Update capacity prediction based on historical data.
     *
     * @param state
     */
    private updateCapacityPrediction;
    /**
     * Calculate recent throughput (completions per second)
     *
     * @param state.
     */
    private calculateRecentThroughput;
    /**
     * Update average connection duration with new measurement.
     *
     * @param state
     * @param newDuration
     */
    private updateAverageConnectionDuration;
    /**
     * Calculate confidence in the selection.
     *
     * @param scoredAgents
     */
    private calculateConfidence;
    /**
     * Estimate latency based on current load.
     *
     * @param agent
     * @param metrics
     */
    private estimateLatency;
    /**
     * Estimate quality based on error rate and utilization.
     *
     * @param agent
     * @param metrics
     */
    private estimateQuality;
    /**
     * Calculate prediction accuracy.
     */
    private calculatePredictionAccuracy;
    /**
     * Calculate average connection duration across all agents.
     *
     * @param states
     */
    private calculateAverageConnectionDuration;
}
//# sourceMappingURL=least-connections.d.ts.map