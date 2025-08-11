/**
 * Neural Presets Complete.
 * Complete collection of neural network presets and utilities.
 */
/**
 * @file Neural network: neural-presets-complete.
 */
export interface Preset {
    id: string;
    architecture: string;
    layers?: number[] | number;
    hiddenSize?: number;
    heads?: number;
    sequenceLength?: number;
    learningRate: number;
    dropout?: number;
    activation?: string;
    [k: string]: any;
}
export type CompletePreset = Preset;
export type CompletePresetMap = Record<string, CompletePreset>;
export declare const COMPLETE_NEURAL_PRESETS: CompletePresetMap;
/**
 * Cognitive Pattern Selector.
 * Selects optimal neural patterns based on task requirements.
 *
 * @example
 */
export declare class CognitivePatternSelector {
    private patterns;
    private selectionHistory;
    constructor();
    /**
     * Select pattern based on task type and requirements.
     *
     * @param taskType
     * @param requirements
     */
    selectPattern(taskType: string, requirements?: Record<string, any>): Record<string, any> | null | undefined;
    /**
     * Register a custom pattern.
     *
     * @param pattern
     * @param pattern.id
     */
    registerPattern(pattern: {
        id: string;
        [k: string]: any;
    }): void;
    private getCandidatePatterns;
    private scoreAndSelect;
    private calculateScore;
    /**
     * Select patterns for a specific preset.
     *
     * @param modelType
     * @param presetName
     * @param _presetName
     * @param taskContext
     */
    selectPatternsForPreset(modelType: string, _presetName: string, taskContext?: any): string[];
    /**
     * Get preset recommendations based on use case.
     *
     * @param useCase
     * @param requirements
     * @param _requirements
     */
    getPresetRecommendations(useCase: string, _requirements?: any): {
        preset: string;
        score: number;
        reason: string;
    }[];
}
/**
 * Neural Adaptation Engine.
 * Adapts neural networks based on performance feedback.
 *
 * @example
 */
export interface AdaptationRecord {
    timestamp: Date;
    originalConfig: any;
    id?: string;
    adaptations?: Array<{
        parameter: string;
        change: string;
        factor?: number;
        reason: string;
    }>;
    expectedImprovement?: number;
    [key: string]: any;
}
export interface PerformanceRecord {
    performance: {
        accuracy?: number;
        loss?: number;
        [k: string]: any;
    };
    timestamp: Date;
}
export declare class NeuralAdaptationEngine {
    private adaptations;
    private performanceHistory;
    constructor();
    /**
     * Adapt network based on performance feedback.
     *
     * @param networkConfig
     * @param performanceData
     * @param performanceData.accuracy
     * @param performanceData.loss
     */
    adapt(networkConfig: any, performanceData: {
        accuracy?: number;
        loss?: number;
        [k: string]: any;
    }): {
        id: string;
        adaptations: {
            parameter: string;
            change: string;
            factor?: number;
            reason: string;
        }[];
        expectedImprovement: number;
    };
    /**
     * Get adaptation recommendations.
     *
     * @param _networkConfig
     */
    getRecommendations(_networkConfig: any): {
        action: string;
        reason: string;
        suggestion?: never;
    } | {
        action: string;
        reason: string;
        suggestion: string;
    };
    private generateAdaptation;
    private estimateImprovement;
    /**
     * Initialize adaptation for an agent.
     *
     * @param agentId
     * @param modelType
     * @param template
     */
    initializeAdaptation(agentId: string, modelType: string, template: string): Promise<{
        agentId: string;
        modelType: string;
        template: string;
        timestamp: Date;
        adaptationState: string;
    }>;
    /**
     * Record an adaptation result.
     *
     * @param agentId
     * @param adaptationResult
     */
    recordAdaptation(agentId: string, adaptationResult: any): Promise<{
        success: boolean;
    }>;
    /**
     * Get adaptation recommendations for an agent.
     *
     * @param agentId
     */
    getAdaptationRecommendations(agentId: string): Promise<{
        action: string;
        reason: string;
        recommendations: {
            type: string;
            action: string;
            reason: string;
        }[];
    }>;
    /**
     * Export adaptation insights.
     */
    exportAdaptationInsights(): {
        totalAdaptations: number;
        averageImprovement: number;
        commonPatterns: Array<{
            type: string;
            count: number;
        }>;
        recommendations: any[];
    };
}
declare const _default: {
    COMPLETE_NEURAL_PRESETS: CompletePresetMap;
    CognitivePatternSelector: typeof CognitivePatternSelector;
    NeuralAdaptationEngine: typeof NeuralAdaptationEngine;
};
export default _default;
//# sourceMappingURL=neural-presets-complete.d.ts.map