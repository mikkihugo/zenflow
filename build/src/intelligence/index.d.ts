/**
 * Intelligence Module - Barrel Export.
 *
 * Central export point for AI intelligence and adaptive learning functionality.
 */
/**
 * @file Intelligence module exports.
 */
export * from './adaptive-learning/behavioral-optimization.ts';
export * from './adaptive-learning/knowledge-evolution.ts';
export { LearningCoordinator } from './adaptive-learning/learning-coordinator.ts';
export { EnsembleModels, MLModelRegistry, NeuralNetworkPredictor, OnlineLearningSystem, ReinforcementLearningEngine, } from './adaptive-learning/ml-integration.ts';
export { PatternRecognitionEngine } from './adaptive-learning/pattern-recognition-engine.ts';
export { PerformanceOptimizer } from './adaptive-learning/performance-optimizer.ts';
export type * from './adaptive-learning/types.ts';
export * from './conversation-framework/index.ts';
export { ConversationFramework } from './conversation-framework/index.ts';
export declare const IntelligenceUtils: {
    /**
     * Get available intelligence capabilities.
     */
    getCapabilities: () => string[];
    /**
     * Validate intelligence configuration.
     *
     * @param config
     */
    validateConfig: (config: any) => boolean;
    /**
     * Get intelligence metrics.
     */
    getMetrics: () => Record<string, any>;
    /**
     * Initialize enhanced intelligence systems.
     *
     * @param config
     */
    initialize: (config?: any) => Promise<{
        patternRecognition: import("./adaptive-learning/pattern-recognition-engine.ts").PatternRecognitionEngine;
        learningCoordinator: import("./adaptive-learning/learning-coordinator.ts").LearningCoordinator;
        performanceOptimizer: import("./adaptive-learning/performance-optimizer.ts").PerformanceOptimizer;
        mlRegistry: import("./adaptive-learning/ml-integration.ts").MLModelRegistry;
        behavioralOptimization: typeof import("./adaptive-learning/behavioral-optimization.ts");
        knowledgeEvolution: typeof import("./adaptive-learning/knowledge-evolution.ts");
        config: any;
        context: {
            environment: any;
            resources: any;
            constraints: any;
            objectives: any;
        };
    }>;
    /**
     * Create adaptive learning system factory.
     *
     * @param config
     */
    createAdaptiveLearningSystem: (config?: any) => Promise<{
        patternEngine: import("./adaptive-learning/pattern-recognition-engine.ts").PatternRecognitionEngine;
        coordinator: import("./adaptive-learning/learning-coordinator.ts").LearningCoordinator;
        optimizer: import("./adaptive-learning/performance-optimizer.ts").PerformanceOptimizer;
        mlRegistry: import("./adaptive-learning/ml-integration.ts").MLModelRegistry;
    }>;
};
export declare class IntelligenceFactory {
    private static systems;
    /**
     * Get intelligence system by type.
     *
     * @param type
     * @param config
     */
    static getSystem(type: string, config?: any): Promise<any>;
    /**
     * Get adaptive learning system.
     *
     * @param config
     */
    static getAdaptiveLearningSystem(config?: any): Promise<any>;
    /**
     * Clear all cached systems.
     */
    static clearSystems(): void;
}
export default IntelligenceUtils;
//# sourceMappingURL=index.d.ts.map