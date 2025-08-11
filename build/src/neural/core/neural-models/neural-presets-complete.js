/**
 * Neural Presets Complete.
 * Complete collection of neural network presets and utilities.
 */
/**
 * @file Neural network: neural-presets-complete.
 */
export const COMPLETE_NEURAL_PRESETS = {
    // Basic presets
    SIMPLE_MLP: {
        id: 'simple_mlp',
        architecture: 'feedforward',
        layers: [64, 32, 16],
        activation: 'relu',
        learningRate: 0.001,
    },
    // Advanced presets
    DEEP_NETWORK: {
        id: 'deep_network',
        architecture: 'feedforward',
        layers: [512, 256, 128, 64, 32],
        activation: 'leaky_relu',
        learningRate: 0.0001,
        dropout: 0.2,
    },
    // Specialized presets
    TIME_SERIES: {
        id: 'time_series',
        architecture: 'lstm',
        hiddenSize: 128,
        layers: 2,
        sequenceLength: 50,
        learningRate: 0.001,
    },
    ATTENTION_MODEL: {
        id: 'attention',
        architecture: 'transformer',
        heads: 8,
        layers: 6,
        hiddenSize: 512,
        sequenceLength: 128,
        learningRate: 0.0001,
    },
};
/**
 * Cognitive Pattern Selector.
 * Selects optimal neural patterns based on task requirements.
 *
 * @example
 */
export class CognitivePatternSelector {
    patterns;
    selectionHistory;
    constructor() {
        this.patterns = new Map();
        this.selectionHistory = [];
    }
    /**
     * Select pattern based on task type and requirements.
     *
     * @param taskType
     * @param requirements
     */
    selectPattern(taskType, requirements = {}) {
        const candidates = this.getCandidatePatterns(taskType, requirements);
        const selected = this.scoreAndSelect(candidates, requirements);
        this.selectionHistory.push({
            taskType,
            requirements,
            selected: selected?.['id'],
            timestamp: new Date(),
        });
        return selected;
    }
    /**
     * Register a custom pattern.
     *
     * @param pattern
     * @param pattern.id
     */
    registerPattern(pattern) {
        this.patterns.set(pattern.id, pattern);
    }
    getCandidatePatterns(_taskType, requirements) {
        const presets = Object.values(COMPLETE_NEURAL_PRESETS);
        const custom = Array.from(this.patterns.values());
        return [...presets, ...custom].filter((pattern) => {
            const reqArch = requirements['architecture'];
            if (reqArch && pattern['architecture'] !== reqArch) {
                return false;
            }
            return true;
        });
    }
    scoreAndSelect(candidates, requirements) {
        if (candidates.length === 0)
            return null;
        // Simple scoring based on requirements match
        const scored = candidates.map((pattern) => ({
            pattern,
            score: this.calculateScore(pattern, requirements),
        }));
        return scored.sort((a, b) => b.score - a.score)[0]?.pattern;
    }
    calculateScore(pattern, requirements) {
        let score = 0.5; // Base score
        // Architecture match
        if (requirements['architecture'] === pattern['architecture']) {
            score += 0.3;
        }
        // Size preferences
        const patternLayers = Array.isArray(pattern['layers'])
            ? pattern['layers']
            : typeof pattern['layers'] === 'number'
                ? Array(pattern['layers']).fill(0)
                : undefined;
        if (requirements['complexity'] === 'high' && patternLayers && patternLayers.length > 4) {
            score += 0.2;
        }
        else if (requirements['complexity'] === 'low' && patternLayers && patternLayers.length <= 3) {
            score += 0.2;
        }
        return score;
    }
    /**
     * Select patterns for a specific preset.
     *
     * @param modelType
     * @param presetName
     * @param _presetName
     * @param taskContext
     */
    selectPatternsForPreset(modelType, _presetName, taskContext = {}) {
        // Return appropriate cognitive patterns based on model type and context
        const patterns = [];
        if (modelType === 'transformer' || modelType === 'attention') {
            patterns.push('attention', 'abstract');
        }
        else if (modelType === 'lstm' || modelType === 'gru') {
            patterns.push('systems', 'convergent');
        }
        else if (modelType === 'cnn') {
            patterns.push('lateral', 'critical');
        }
        else {
            patterns.push('convergent');
        }
        // Add creativity-based patterns
        if (taskContext.requiresCreativity) {
            patterns.push('divergent', 'lateral');
        }
        if (taskContext.requiresPrecision) {
            patterns.push('convergent', 'critical');
        }
        return patterns;
    }
    /**
     * Get preset recommendations based on use case.
     *
     * @param useCase
     * @param requirements
     * @param _requirements
     */
    getPresetRecommendations(useCase, _requirements = {}) {
        const recommendations = [];
        // Basic matching logic
        if (useCase.toLowerCase().includes('text') || useCase.toLowerCase().includes('nlp')) {
            recommendations.push({
                preset: 'transformer',
                score: 0.9,
                reason: 'Text processing use case',
            });
        }
        else if (useCase.toLowerCase().includes('image') ||
            useCase.toLowerCase().includes('vision')) {
            recommendations.push({
                preset: 'cnn',
                score: 0.85,
                reason: 'Image processing use case',
            });
        }
        else if (useCase.toLowerCase().includes('time') ||
            useCase.toLowerCase().includes('sequence')) {
            recommendations.push({
                preset: 'lstm',
                score: 0.8,
                reason: 'Sequential data use case',
            });
        }
        else {
            recommendations.push({
                preset: 'feedforward',
                score: 0.7,
                reason: 'General purpose neural network',
            });
        }
        return recommendations;
    }
}
export class NeuralAdaptationEngine {
    adaptations;
    performanceHistory;
    constructor() {
        this.adaptations = [];
        this.performanceHistory = [];
    }
    /**
     * Adapt network based on performance feedback.
     *
     * @param networkConfig
     * @param performanceData
     * @param performanceData.accuracy
     * @param performanceData.loss
     */
    adapt(networkConfig, performanceData) {
        const adaptation = this.generateAdaptation(networkConfig, performanceData);
        this.adaptations.push({
            ...adaptation,
            timestamp: new Date(),
            originalConfig: networkConfig,
        });
        this.performanceHistory.push({
            performance: performanceData,
            timestamp: new Date(),
        });
        return adaptation;
    }
    /**
     * Get adaptation recommendations.
     *
     * @param _networkConfig
     */
    getRecommendations(_networkConfig) {
        const recentPerformance = this.performanceHistory.slice(-10);
        if (recentPerformance.length === 0) {
            return { action: 'monitor', reason: 'Insufficient performance data' };
        }
        const avgPerformance = recentPerformance.reduce((sum, p) => sum + (p.performance.accuracy || 0), 0) /
            recentPerformance.length || 0;
        if (avgPerformance < 0.7) {
            return {
                action: 'increase_complexity',
                reason: 'Low performance detected',
                suggestion: 'Add more layers or increase learning rate',
            };
        }
        else if (avgPerformance > 0.95) {
            return {
                action: 'reduce_complexity',
                reason: 'Possible overfitting',
                suggestion: 'Add dropout or reduce network size',
            };
        }
        return { action: 'maintain', reason: 'Performance is adequate' };
    }
    generateAdaptation(_config, performance) {
        const adaptations = [];
        // Learning rate adaptation
        if (performance.loss && performance.loss > 0.5) {
            adaptations.push({
                parameter: 'learningRate',
                change: 'increase',
                factor: 1.1,
                reason: 'High loss detected',
            });
        }
        else if (performance.loss && performance.loss < 0.01) {
            adaptations.push({
                parameter: 'learningRate',
                change: 'decrease',
                factor: 0.9,
                reason: 'Very low loss, may be overfitting',
            });
        }
        // Architecture adaptation
        if (performance.accuracy && performance.accuracy < 0.6) {
            adaptations.push({
                parameter: 'architecture',
                change: 'add_layer',
                reason: 'Low accuracy, need more capacity',
            });
        }
        return {
            id: `adapt_${Date.now()}`,
            adaptations,
            expectedImprovement: this.estimateImprovement(adaptations),
        };
    }
    estimateImprovement(adaptations) {
        // Simple heuristic for improvement estimation
        return adaptations.length * 0.05; // 5% improvement per adaptation
    }
    /**
     * Initialize adaptation for an agent.
     *
     * @param agentId
     * @param modelType
     * @param template
     */
    async initializeAdaptation(agentId, modelType, template) {
        const initialization = {
            agentId,
            modelType,
            template,
            timestamp: new Date(),
            adaptationState: 'initialized',
        };
        this.adaptations.push({
            ...initialization,
            timestamp: new Date(),
            originalConfig: { modelType, template },
        });
        return initialization;
    }
    /**
     * Record an adaptation result.
     *
     * @param agentId
     * @param adaptationResult
     */
    async recordAdaptation(agentId, adaptationResult) {
        this.adaptations.push({
            agentId,
            adaptationResult,
            timestamp: new Date(),
            originalConfig: {},
        });
        this.performanceHistory.push({
            performance: adaptationResult?.performance || adaptationResult,
            timestamp: new Date(),
        });
        return { success: true };
    }
    /**
     * Get adaptation recommendations for an agent.
     *
     * @param agentId
     */
    async getAdaptationRecommendations(agentId) {
        const agentAdaptations = this.adaptations.filter((a) => a['agentId'] === agentId);
        if (agentAdaptations.length === 0) {
            return {
                action: 'monitor',
                reason: 'No adaptation history available',
                recommendations: [],
            };
        }
        const recent = agentAdaptations.slice(-5);
        const recommendations = [];
        // Analyze recent adaptations for patterns
        const avgImprovement = recent.reduce((sum, a) => {
            const accuracy = a['adaptationResult']?.accuracy;
            return sum + (accuracy || 0);
        }, 0) / recent.length;
        if (avgImprovement < 0.7) {
            recommendations.push({
                type: 'architecture',
                action: 'increase_complexity',
                reason: 'Low performance trend detected',
            });
        }
        return {
            action: 'adapt',
            reason: 'Based on performance history',
            recommendations,
        };
    }
    /**
     * Export adaptation insights.
     */
    exportAdaptationInsights() {
        const insights = {
            totalAdaptations: this.adaptations.length,
            averageImprovement: 0,
            commonPatterns: [],
            recommendations: [],
        };
        if (this.adaptations.length > 0) {
            const improvements = this.adaptations
                .map((a) => a['adaptationResult']?.accuracy || 0)
                .filter((acc) => acc > 0);
            if (improvements.length > 0) {
                insights.averageImprovement =
                    improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
            }
            // Find common adaptation patterns
            const adaptationTypes = this.adaptations
                .map((a) => a['adaptationResult']?.type || 'unknown')
                .reduce((counts, type) => {
                counts[type] = (counts[type] || 0) + 1;
                return counts;
            }, {});
            insights.commonPatterns = Object.entries(adaptationTypes)
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count);
        }
        return insights;
    }
}
export default {
    COMPLETE_NEURAL_PRESETS,
    CognitivePatternSelector,
    NeuralAdaptationEngine,
};
