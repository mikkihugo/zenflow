/**
 * @file Cognitive Pattern Evolution System - Enables autonomous learning and adaptation of cognitive patterns.
 */
import type { TrainingData } from '../neural/types/wasm-types';
interface PatternCharacteristics {
    searchStrategy: 'directed' | 'undirected' | 'systematic' | 'conceptual' | 'random' | 'lateral' | 'holistic';
    explorationRate: number;
    exploitationRate: number;
    decisionMaking: 'decisive' | 'exploratory' | 'analytical' | 'principled' | 'systematic' | 'innovative';
    patternRecognition: 'exact_match' | 'fuzzy_match' | 'evidence_based' | 'abstraction_layers' | 'flexible_match' | 'analogical' | 'pattern_networks';
}
interface AdaptationRules {
    [key: string]: (context: Record<string, unknown>) => boolean;
}
interface PatternTemplate {
    name: string;
    description: string;
    characteristics: PatternCharacteristics;
    adaptationRules: AdaptationRules;
}
interface AgentPattern {
    activePatterns: string[];
    dominantPattern: string;
    adaptationHistory: AdaptationRecord[];
    evolutionScore: number;
    lastEvolution: number;
    crossAgentLearning: Map<string, unknown>;
    specializations: Set<string>;
}
interface AdaptationRecord {
    timestamp: number;
    type: string;
    details: Record<string, unknown>;
    patternType?: string;
    success?: boolean;
}
interface PatternContext {
    creativity_required?: number;
    noiseLevel?: number;
    dataComplexity?: number;
    patternRegularity?: number;
    abstractionLevel?: number;
    [key: string]: unknown;
}
interface ExtendedTrainingData extends TrainingData {
    samples?: Array<{
        input: number[];
        output: number[];
    }>;
}
interface EvolutionMetric {
    totalEvolutions: number;
    successfulAdaptations: number;
    patternSwitches: number;
    crossAgentTransfers: number;
    emergentPatterns: number;
}
interface EvolutionRecord {
    timestamp: number;
    trigger: string;
    strategy: string | Record<string, unknown>;
    oldPatterns: string[];
    newPatterns: string[];
    context: Record<string, unknown>;
    effectiveness: Record<string, {
        contextMatch: number;
        historicalPerformance: number;
        adaptationSuccess: number;
        overall: number;
    }>;
}
declare class CognitivePatternEvolution {
    agentPatterns: Map<string, AgentPattern>;
    evolutionHistory: Map<string, EvolutionRecord[]>;
    patternTemplates: Map<string, PatternTemplate>;
    crossAgentPatterns: Map<string, Record<string, unknown>>;
    evolutionMetrics: Map<string, EvolutionMetric>;
    constructor();
    /**
     * Initialize base cognitive pattern templates.
     */
    initializePatternTemplates(): void;
    /**
     * Initialize agent with cognitive patterns.
     *
     * @param {string} agentId - Agent identifier.
     * @param {Object} config - Agent configuration.
     */
    initializeAgent(agentId: string, config: any): Promise<void>;
    /**
     * Select initial cognitive patterns based on configuration.
     *
     * @param {Object} config - Agent configuration.
     */
    selectInitialPatterns(config: any): string[];
    /**
     * Evolve cognitive patterns based on training data and performance.
     *
     * @param {string} agentId - Agent identifier.
     * @param {Object} trainingData - Training data context.
     */
    evolvePatterns(agentId: string, trainingData: any): Promise<void>;
    /**
     * Analyze training context to understand cognitive requirements.
     *
     * @param {Object} trainingData - Training data.
     */
    analyzeTrainingContext(trainingData: any): {
        dataComplexity: number;
        taskType: string;
        noiseLevel: number;
        patternRegularity: number;
        dimensionality: number;
        temporalDependency: number;
        abstractionLevel: number;
        creativity_required: number;
    };
    /**
     * Calculate data complexity score.
     *
     * @param {Object} trainingData - Training data.
     */
    calculateDataComplexity(trainingData: any): number;
    /**
     * Calculate feature variance across samples.
     *
     * @param {Array} samples - Training samples.
     */
    calculateFeatureVariance(samples: any[]): number;
    /**
     * Calculate label distribution entropy.
     *
     * @param {Array} samples - Training samples.
     */
    calculateLabelDistribution(samples: any[]): number;
    /**
     * Infer task type from training data characteristics.
     *
     * @param {Object} trainingData - Training data.
     */
    inferTaskType(trainingData: any): "unknown" | "classification" | "regression" | "sequence" | "multi_classification";
    /**
     * Estimate noise level in training data.
     *
     * @param {Object} trainingData - Training data.
     */
    estimateNoiseLevel(trainingData: any): number;
    /**
     * Assess pattern regularity in data.
     *
     * @param {Object} trainingData - Training data.
     */
    assessPatternRegularity(trainingData: any): number;
    /**
     * Calculate effective dimensionality.
     *
     * @param {Object} trainingData - Training data.
     */
    calculateDimensionality(trainingData: ExtendedTrainingData): number;
    /**
     * Assess temporal dependency in data.
     *
     * @param {Object} trainingData - Training data.
     */
    assessTemporalDependency(trainingData: TrainingData | ExtendedTrainingData): number;
    /**
     * Estimate required abstraction level.
     *
     * @param {Object} trainingData - Training data.
     */
    estimateAbstractionLevel(trainingData: TrainingData | ExtendedTrainingData): number;
    /**
     * Assess creativity requirement from data.
     *
     * @param {Object} trainingData - Training data.
     */
    assessCreativityRequirement(trainingData: TrainingData | ExtendedTrainingData): number;
    /**
     * Evaluate effectiveness of current cognitive patterns.
     *
     * @param {string} agentId - Agent identifier.
     * @param {Object} context - Training context.
     */
    evaluatePatternEffectiveness(agentId: string, context: PatternContext): Promise<Record<string, any>>;
    /**
     * Calculate how well a pattern template matches the current context.
     *
     * @param {Object} template - Pattern template.
     * @param {Object} context - Current context.
     */
    calculateContextMatch(template: PatternTemplate, context: PatternContext): number;
    /**
     * Match decision making style to context needs.
     *
     * @param {string} style - Decision making style.
     * @param {number} systematicNeed - Need for systematic approach (0-1).
     */
    matchDecisionStyle(style: string, systematicNeed: number): number;
    /**
     * Match pattern recognition approach to context.
     *
     * @param {string} approach - Pattern recognition approach.
     * @param {Object} context - Context object.
     */
    matchPatternRecognition(approach: string, context: PatternContext): number;
    /**
     * Match search strategy to context.
     *
     * @param {string} strategy - Search strategy.
     * @param {Object} context - Context object.
     */
    matchSearchStrategy(strategy: string, context: PatternContext): number;
    /**
     * Get historical performance of a pattern for an agent.
     *
     * @param {string} agentId - Agent identifier.
     * @param {string} patternType - Pattern type.
     */
    getHistoricalPerformance(agentId: string, patternType: string): number;
    /**
     * Get adaptation success rate for a pattern.
     *
     * @param {string} agentId - Agent identifier.
     * @param {string} patternType - Pattern type.
     */
    getAdaptationSuccess(agentId: string, patternType: string): number;
    /**
     * Assess if cognitive evolution is needed.
     *
     * @param {Object} effectiveness - Pattern effectiveness scores.
     * @param {Object} context - Current context.
     */
    assessEvolutionNeed(effectiveness: Record<string, {
        overall?: number;
    }>, context: PatternContext): {
        required: boolean;
        reason: string;
        urgency: string;
    };
    /**
     * Select evolution strategy based on need and context.
     *
     * @param {Object} evolutionNeed - Evolution need assessment.
     * @param evolutionNeed.urgency
     * @param {Object} context - Current context.
     */
    selectEvolutionStrategy(evolutionNeed: {
        urgency: string;
    }, context: PatternContext): {
        type: string;
        description: string;
        priority: number;
    };
    /**
     * Apply evolution strategy to agent patterns.
     *
     * @param {string} agentId - Agent identifier.
     * @param {Object} strategy - Evolution strategy.
     * @param strategy.type
     * @param {Object} context - Current context.
     */
    applyEvolution(agentId: string, strategy: {
        type: string;
    }, context: PatternContext): Promise<string[]>;
    /**
     * Add new cognitive patterns.
     *
     * @param {string} agentId - Agent identifier.
     * @param _agentId
     * @param {Array} currentPatterns - Current patterns.
     * @param {Object} context - Current context.
     */
    addPatterns(_agentId: string, currentPatterns: string[], context: PatternContext): Promise<string[]>;
    /**
     * Remove ineffective cognitive patterns.
     *
     * @param {string} agentId - Agent identifier.
     * @param _agentId
     * @param {Array} currentPatterns - Current patterns.
     * @param {Object} context - Current context.
     */
    removePatterns(_agentId: string, currentPatterns: string[], context: PatternContext): Promise<string[]>;
    /**
     * Modify existing patterns (create adaptive variants).
     *
     * @param {string} agentId - Agent identifier.
     * @param _agentId
     * @param {Array} currentPatterns - Current patterns.
     * @param {Object} context - Current context.
     */
    modifyPatterns(_agentId: string, currentPatterns: string[], context: PatternContext): Promise<string[]>;
    /**
     * Create adaptive variant of a pattern template.
     *
     * @param {Object} template - Original template.
     * @param {Object} context - Current context.
     */
    createAdaptiveVariant(template: PatternTemplate, context: PatternContext): PatternTemplate;
    /**
     * Rebalance pattern priorities and weights.
     *
     * @param {string} agentId - Agent identifier.
     * @param _agentId
     * @param {Array} currentPatterns - Current patterns.
     * @param {Object} context - Current context.
     */
    rebalancePatterns(_agentId: string, currentPatterns: string[], context: PatternContext): Promise<string[]>;
    /**
     * Create hybrid patterns by combining existing ones.
     *
     * @param {string} agentId - Agent identifier.
     * @param _agentId
     * @param {Array} currentPatterns - Current patterns.
     * @param {Object} context - Current context.
     */
    hybridizePatterns(_agentId: string, currentPatterns: string[], context: PatternContext): Promise<string[]>;
    /**
     * Create hybrid template from two parent templates.
     *
     * @param {Object} template1 - First parent template.
     * @param {Object} template2 - Second parent template.
     * @param {Object} context - Current context.
     */
    createHybridTemplate(template1: PatternTemplate, template2: PatternTemplate, context: PatternContext): PatternTemplate;
    /**
     * Select dominant pattern from active patterns.
     *
     * @param {Array} patterns - Active patterns.
     * @param {Object} context - Current context.
     */
    selectDominantPattern(patterns: string[], context: PatternContext): string;
    /**
     * Record evolution event.
     *
     * @param {string} agentId - Agent identifier.
     * @param {Object} evolution - Evolution details.
     */
    recordEvolution(agentId: string, evolution: EvolutionRecord): void;
    /**
     * Enable cross-agent pattern evolution.
     *
     * @param {Array} agentIds - List of agent IDs.
     * @param {Object} session - Collaborative session.
     * @param session.id
     */
    enableCrossAgentEvolution(agentIds: string[], session: {
        id: string;
    }): Promise<void>;
    /**
     * Transfer patterns between agents.
     *
     * @param {string} targetAgentId - Target agent ID.
     * @param {Array} patterns - Patterns to transfer.
     */
    transferPatterns(targetAgentId: string, patterns: Array<{
        type?: string;
        [key: string]: unknown;
    }>): Promise<void>;
    /**
     * Evaluate pattern compatibility with target agent.
     *
     * @param {string} agentId - Target agent ID.
     * @param {Object} pattern - Pattern to evaluate.
     * @param pattern.type
     */
    evaluatePatternCompatibility(agentId: string, pattern: {
        type?: string;
        [key: string]: unknown;
    }): Promise<number>;
    /**
     * Extract patterns from agent for sharing.
     *
     * @param {string} agentId - Agent identifier.
     */
    extractPatterns(agentId: string): Promise<Array<{
        type?: string;
        [key: string]: unknown;
    }>>;
    /**
     * Apply pattern updates from coordination.
     *
     * @param {string} agentId - Agent identifier.
     * @param {Array} patternUpdates - Pattern updates.
     */
    applyPatternUpdates(agentId: string, patternUpdates: any[]): Promise<void>;
    /**
     * Calculate aggregation weights for gradient coordination.
     *
     * @param {Array} gradients - Array of gradient sets.
     */
    calculateAggregationWeights(gradients: any[]): number[];
    /**
     * Assess cognitive growth for an agent.
     *
     * @param {string} agentId - Agent identifier.
     */
    assessGrowth(agentId: string): Promise<number>;
    /**
     * Get statistics for the cognitive evolution system.
     */
    getStatistics(): {
        totalAgents: number;
        totalEvolutions: number;
        avgPatternsPerAgent: number;
        avgGrowthScore: number;
        availablePatternTypes: number;
        crossAgentSessions: number;
    };
    /**
     * Preserve cognitive evolution history before agent reset.
     *
     * @param {string} agentId - Agent identifier.
     */
    preserveHistory(agentId: string): Promise<any>;
    /**
     * Restore cognitive evolution history after agent reset.
     *
     * @param {string} agentId - Agent identifier.
     * @param {Object} preservedHistory - Preserved history.
     */
    restoreHistory(agentId: string, preservedHistory: any): Promise<void>;
}
export { CognitivePatternEvolution };
//# sourceMappingURL=cognitive-pattern-evolution.d.ts.map