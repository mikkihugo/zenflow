/**
 * Meta Learning Framework.
 * Learning to learn - adaptive learning strategies.
 */
/**
 * @file Neural network: meta-learning-framework.
 */
interface MetaLearningOptions {
    maxStrategies?: number;
    evaluationWindow?: number;
    [key: string]: any;
}
interface LearningStrategy {
    performance: number;
    usage: number;
    created: Date;
    [key: string]: any;
}
export declare class MetaLearningFramework {
    learningStrategies: Map<string, LearningStrategy>;
    performanceHistory: any[];
    taskHistory: Map<string, any[]>;
    options: MetaLearningOptions;
    constructor(options?: MetaLearningOptions);
    /**
     * Register a learning strategy.
     *
     * @param id
     * @param strategy
     */
    registerStrategy(id: string, strategy: any): void;
    /**
     * Select best strategy for given task.
     *
     * @param taskType
     * @param _context
     */
    selectStrategy(taskType: any, _context?: {}): LearningStrategy | null;
    /**
     * Update strategy performance.
     *
     * @param strategyId
     * @param performance
     */
    updatePerformance(strategyId: any, performance: any): void;
    /**
     * Get framework metrics.
     */
    getMetrics(): {
        totalStrategies: number;
        avgPerformance: number;
        bestStrategy: {
            performance: number;
        };
        recentPerformance: any[];
    };
    private calculateAveragePerformance;
    private getBestStrategy;
    /**
     * Adapt configuration for an agent.
     *
     * @param agentId
     * @param config
     */
    adaptConfiguration(agentId: string, config: any): Promise<any>;
    /**
     * Optimize training options for an agent.
     *
     * @param agentId
     * @param options
     */
    optimizeTraining(agentId: string, options: any): Promise<any>;
    /**
     * Preserve learning state for an agent.
     *
     * @param agentId
     */
    preserveState(agentId: string): Promise<{
        agentId: string;
        taskHistory: any[];
        learningStrategies: LearningStrategy[];
        timestamp: Date;
    }>;
    /**
     * Restore learning state for an agent.
     *
     * @param agentId
     * @param state
     */
    restoreState(agentId: string, state: any): Promise<{
        success: boolean;
    }>;
    /**
     * Extract experiences for an agent.
     *
     * @param agentId
     */
    extractExperiences(agentId: string): Promise<{
        taskId: any;
        performance: any;
        strategy: any;
        timestamp: any;
    }[]>;
    /**
     * Get meta-learning statistics.
     */
    getStatistics(): {
        totalAgents: number;
        totalTasks: number;
        strategies: number;
        averagePerformance: number;
    };
}
export default MetaLearningFramework;
//# sourceMappingURL=meta-learning-framework.d.ts.map