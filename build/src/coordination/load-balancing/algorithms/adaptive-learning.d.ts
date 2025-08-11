/**
 * Adaptive Learning Load Balancing Algorithm.
 * Self-improving algorithm that learns from historical patterns and adapts strategies.
 */
/**
 * @file Coordination system: adaptive-learning
 */
import type { LoadBalancingAlgorithm } from '../interfaces.ts';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types.ts';
export declare class AdaptiveLearningAlgorithm implements LoadBalancingAlgorithm {
    readonly name = "adaptive_learning";
    private strategies;
    private patterns;
    private decisionHistory;
    private reinforcementHistory;
    private config;
    constructor();
    /**
     * Select agent using adaptive learning strategy.
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
     * Handle task completion for reinforcement learning.
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
     * Initialize available strategies.
     */
    private initializeStrategies;
    /**
     * Extract context features from current situation.
     *
     * @param task
     * @param availableAgents
     * @param metrics
     */
    private extractContext;
    /**
     * Detect patterns in historical data.
     *
     * @param context
     */
    private detectPattern;
    /**
     * Select strategy using epsilon-greedy or other methods.
     *
     * @param _context
     * @param detectedPattern
     */
    private selectStrategy;
    /**
     * Epsilon-greedy strategy selection.
     */
    private epsilonGreedySelection;
    /**
     * Upper Confidence Bound strategy selection.
     */
    private upperConfidenceBoundSelection;
    /**
     * Thompson sampling strategy selection.
     */
    private thompsonSamplingSelection;
    /**
     * Apply selected strategy to choose agent.
     *
     * @param strategyName
     * @param task
     * @param availableAgents
     * @param metrics
     * @param _context
     */
    private applyStrategy;
    /**
     * Calculate reward for reinforcement learning.
     *
     * @param duration
     * @param success
     * @param task
     */
    private calculateReward;
    /**
     * Update strategy performance based on outcome.
     *
     * @param strategyName
     * @param duration
     * @param success
     * @param reward
     */
    private updateStrategyPerformance;
    /**
     * Record decision for learning.
     *
     * @param task
     * @param result
     * @param strategy
     * @param context
     */
    private recordDecision;
    private selectByLeastConnections;
    private selectByWeightedRoundRobin;
    private selectByResourceAwareness;
    private selectByResponseTime;
    private selectByCapabilityMatch;
    private selectByHybridHeuristic;
    private calculateStrategyScore;
    private sampleBeta;
    private generatePatternKey;
    private findSimilarPattern;
    private calculateContextSimilarity;
    private findRecentDecision;
    private recordReinforcementState;
    private encodeState;
    private updatePatterns;
    private performLearningUpdate;
    private calculateLearningProgress;
}
//# sourceMappingURL=adaptive-learning.d.ts.map