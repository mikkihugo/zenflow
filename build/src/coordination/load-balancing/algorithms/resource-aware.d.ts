/**
 * Resource-Aware Load Balancing Algorithm.
 * Multi-dimensional resource monitoring and intelligent scheduling.
 */
/**
 * @file Coordination system: resource-aware
 */
import type { LoadBalancingAlgorithm } from '../interfaces.ts';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types.ts';
export declare class ResourceAwareAlgorithm implements LoadBalancingAlgorithm {
    readonly name = "resource_aware";
    private resourceProfiles;
    private config;
    /**
     * Select agent based on multi-dimensional resource availability.
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
     * @param task
     * @param duration
     * @param success
     */
    onTaskComplete(agentId: string, task: Task, duration: number, success: boolean): Promise<void>;
    /**
     * Handle agent failure.
     *
     * @param agentId
     * @param _error
     */
    onAgentFailure(agentId: string, _error: Error): Promise<void>;
    /**
     * Get or create resource profile for an agent.
     *
     * @param agentId
     */
    private getOrCreateResourceProfile;
    /**
     * Create a resource metric with default values.
     *
     * @param threshold
     */
    private createResourceMetric;
    /**
     * Update resource profiles based on current metrics.
     *
     * @param agents
     * @param metrics
     */
    private updateResourceProfiles;
    /**
     * Estimate resource requirements for a task.
     *
     * @param task
     */
    private estimateTaskRequirements;
    /**
     * Score agents based on resource fitness for the task.
     *
     * @param agents
     * @param taskRequirements
     * @param metrics
     */
    private scoreAgentsByResources;
    /**
     * Check if an agent can handle a task based on resource constraints.
     *
     * @param profile
     * @param requirements
     */
    private canHandleTask;
    /**
     * Calculate fitness score for a specific resource.
     *
     * @param resource
     * @param requirement
     */
    private calculateResourceFitness;
    /**
     * Apply penalties based on resource trends.
     *
     * @param score
     * @param profile
     */
    private applyTrendPenalties;
    /**
     * Apply penalties based on resource constraints.
     *
     * @param score
     * @param profile
     */
    private applyConstraintPenalties;
    /**
     * Reserve resources for a task.
     *
     * @param agentId
     * @param requirements
     */
    private reserveResources;
    /**
     * Release resources after task completion.
     *
     * @param agentId
     * @param requirements
     * @param actualDuration
     * @param success
     */
    private releaseResources;
    /**
     * Update resource averages and trend analysis.
     *
     * @param profile
     */
    private updateResourceAveragesAndTrends;
    /**
     * Calculate trend using simple linear regression.
     *
     * @param values
     */
    private calculateTrend;
    /**
     * Update adaptive resource thresholds.
     *
     * @param profile
     */
    private updateResourceThresholds;
    private selectFallbackAgent;
    private calculateConfidence;
    private estimateLatency;
    private estimateQuality;
    private calculateAverageUtilization;
    private calculateResourceEfficiency;
    private countConstraintViolations;
    private calculatePredictionAccuracy;
    private updateResourceTrends;
    private updateResourcePredictionModels;
}
//# sourceMappingURL=resource-aware.d.ts.map