/**
 * Cognitive Pattern Evolution.
 * Advanced neural pattern recognition and evolution system.
 */
/**
 * @file Neural network: cognitive-pattern-evolution.
 */
export declare class CognitivePatternEvolution {
    private patterns;
    private evolutionHistory;
    private options;
    constructor(options?: {});
    /**
     * Evolve cognitive patterns based on performance.
     *
     * @param agentId
     * @param performanceData
     */
    evolvePatterns(agentId: any, performanceData: any): Promise<any>;
    /**
     * Register a new cognitive pattern.
     *
     * @param id
     * @param pattern
     */
    registerPattern(id: any, pattern: any): void;
    /**
     * Get pattern by ID.
     *
     * @param id
     */
    getPattern(id: any): any;
    /**
     * Get all patterns.
     */
    getAllPatterns(): any[];
    private selectPatterns;
    private applyEvolution;
    private updatePatterns;
    private calculateAverageFitness;
    /**
     * Initialize agent for cognitive pattern evolution.
     *
     * @param agentId
     * @param config
     */
    initializeAgent(agentId: string, config: any): Promise<{
        id: string;
        agentId: string;
        config: any;
        patterns: never[];
        fitness: number;
        generation: number;
        timestamp: Date;
    }>;
    /**
     * Assess cognitive growth for an agent.
     *
     * @param agentId
     */
    assessGrowth(agentId: string): Promise<{
        growth: number;
        patterns: number;
        latestGeneration?: never;
    } | {
        growth: number;
        patterns: number;
        latestGeneration: number;
    }>;
    /**
     * Enable cross-agent evolution.
     *
     * @param agentIds
     * @param session
     * @param _session
     */
    enableCrossAgentEvolution(agentIds: string[], _session: any): Promise<{
        success: boolean;
        sharedPatterns: number;
    }>;
    /**
     * Calculate aggregation weights for gradients.
     *
     * @param gradients
     */
    calculateAggregationWeights(gradients: any[]): number[];
    /**
     * Preserve cognitive history for an agent.
     *
     * @param agentId
     */
    preserveHistory(agentId: string): Promise<{
        agentId: string;
        patterns: any[];
        evolutionHistory: any[];
        timestamp: Date;
    }>;
    /**
     * Restore cognitive history for an agent.
     *
     * @param agentId
     * @param _agentId
     * @param history
     */
    restoreHistory(_agentId: string, history: any): Promise<{
        success: boolean;
    }>;
    /**
     * Extract patterns for an agent.
     *
     * @param agentId
     */
    extractPatterns(agentId: string): Promise<{
        id: any;
        type: any;
        fitness: any;
        generation: any;
    }[]>;
    /**
     * Transfer patterns to another agent.
     *
     * @param agentId
     * @param patterns
     */
    transferPatterns(agentId: string, patterns: any[]): Promise<{
        success: boolean;
        transferred: number;
    }>;
    /**
     * Apply pattern updates to an agent.
     *
     * @param agentId
     * @param patternUpdates
     */
    applyPatternUpdates(agentId: string, patternUpdates: any): Promise<{
        success: boolean;
        updated: number;
    }>;
    /**
     * Get evolution statistics.
     */
    getStatistics(): {
        totalPatterns: number;
        generations: number;
        averageFitness: number;
        options: any;
    };
}
export default CognitivePatternEvolution;
//# sourceMappingURL=cognitive-pattern-evolution.d.ts.map