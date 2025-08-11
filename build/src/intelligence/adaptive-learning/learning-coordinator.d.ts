/**
 * Learning Coordinator.
 *
 * Coordinates learning across multiple agents in the swarm, manages knowledge.
 * Sharing, tracks expertise evolution, and identifies best practices and anti-patterns.
 */
/**
 * @file Learning coordination system.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../di/index.ts';
import type { AdaptiveLearningConfig, Agent, AntiPattern, BestPractice, ExpertiseEvolution, FailurePattern, LearningCoordinator as ILearningCoordinator, LearningResult, Pattern, SuccessPattern, SystemContext } from './types.ts';
export declare class LearningCoordinator extends EventEmitter implements ILearningCoordinator {
    private _logger;
    private agents;
    private knowledgeBase;
    private expertiseTracking;
    private bestPractices;
    private antiPatterns;
    private learningHistory;
    private config;
    private context;
    constructor(config: AdaptiveLearningConfig, context: SystemContext, _logger: ILogger);
    /**
     * Coordinate learning across multiple agents.
     *
     * @param agents
     */
    coordinateLearning(agents: Agent[]): Promise<LearningResult>;
    /**
     * Update the knowledge base with new patterns.
     *
     * @param patterns
     */
    updateKnowledgeBase(patterns: Pattern[]): Promise<void>;
    /**
     * Track expertise evolution for an agent.
     *
     * @param agentId
     */
    trackExpertiseEvolution(agentId: string): ExpertiseEvolution;
    /**
     * Emerge best practices from successful patterns.
     *
     * @param successes
     */
    emergeBestPractices(successes: SuccessPattern[]): BestPractice[];
    /**
     * Detect anti-patterns from failure patterns.
     *
     * @param failures
     */
    detectAntiPatterns(failures: FailurePattern[]): AntiPattern[];
    /**
     * Get current knowledge base.
     */
    getKnowledgeBase(): Map<string, any>;
    /**
     * Get expertise evolution for all agents.
     */
    getAllExpertiseEvolution(): Map<string, ExpertiseEvolution>;
    /**
     * Get all identified best practices.
     */
    getBestPractices(): BestPractice[];
    /**
     * Get all detected anti-patterns.
     */
    getAntiPatterns(): AntiPattern[];
    /**
     * Get learning history for an agent.
     *
     * @param agentId
     */
    getLearningHistory(agentId: string): LearningResult[];
    /**
     * Clear learning data (for testing or reset).
     */
    clearLearningData(): void;
    private determineLearningStrategy;
    private executeLearning;
    private executeAgentLearning;
    private aggregateLearningResults;
    private generateLearningPatterns;
    private calculateImprovements;
    private extractKnowledgeUpdates;
    private trackLearningProgress;
    private mergePatterns;
    private pruneKnowledgeBase;
    private distributeKnowledgeUpdates;
    private initializeExpertiseTracking;
    private updateExpertiseMetrics;
    private identifyGrowthOpportunities;
    private updateLearningRecommendations;
    private groupSuccessesByCategory;
    private findCommonPatterns;
    private extractBestPractice;
    private validateAndRankPractices;
    private groupFailuresByType;
    private identifyCommonTriggers;
    private identifyCommonConsequences;
    private generateAntiPatternDescription;
    private generateAvoidanceStrategies;
    private calculateDetectionConfidence;
    private selectPatternType;
    private generatePatternData;
    private extractConditions;
    private calculateAverageOutcomes;
    private startLearningCoordination;
}
//# sourceMappingURL=learning-coordinator.d.ts.map