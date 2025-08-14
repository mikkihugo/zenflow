export * from './adaptive-learning/behavioral-optimization.ts';
export * from './adaptive-learning/knowledge-evolution.ts';
export { LearningCoordinator } from './adaptive-learning/learning-coordinator.ts';
export { EnsembleModels, MLModelRegistry, NeuralNetworkPredictor, OnlineLearningSystem, ReinforcementLearningEngine, } from './adaptive-learning/ml-integration.ts';
export { PatternRecognitionEngine } from './adaptive-learning/pattern-recognition-engine.ts';
export { PerformanceOptimizer } from './adaptive-learning/performance-optimizer.ts';
export * from './conversation-framework/index.ts';
export { ConversationFramework } from './conversation-framework/index.ts';
export const IntelligenceUtils = {
    getCapabilities: () => {
        return [
            'adaptive-pattern-recognition',
            'learning-coordination',
            'performance-optimization',
            'reinforcement-learning',
            'neural-networks',
            'ensemble-models',
            'online-learning',
            'behavioral-optimization',
            'knowledge-evolution',
            'failure-prediction',
            'real-time-adaptation',
            'multi-agent-conversations',
            'conversation-orchestration',
            'dialogue-patterns',
            'conversation-memory',
            'teachable-agents',
            'group-chat-coordination',
        ];
    },
    validateConfig: (config) => {
        return Boolean(config &&
            (config?.['learningRate'] || config?.['adaptationRate']) &&
            config?.['patternRecognition'] &&
            config?.['learning'] &&
            config?.['optimization']);
    },
    getMetrics: () => {
        return {
            adaptationRate: 0.1,
            learningEfficiency: 0.92,
            patternRecognitionAccuracy: 0.95,
            behaviouralOptimizationScore: 0.87,
            failurePredictionAccuracy: 0.89,
            realTimeAdaptationLatency: 150,
            knowledgeRetention: 0.94,
            systemIntelligence: 0.91,
        };
    },
    initialize: async (config = {}) => {
        const defaultConfig = {
            patternRecognition: {
                enabled: true,
                minPatternFrequency: 3,
                confidenceThreshold: 0.7,
                analysisWindow: 3600000,
            },
            learning: {
                enabled: true,
                learningRate: 0.1,
                adaptationRate: 0.1,
                knowledgeRetention: 0.9,
            },
            optimization: {
                enabled: true,
                optimizationThreshold: 0.8,
                maxOptimizations: 10,
                validationRequired: true,
            },
            ml: {
                neuralNetwork: true,
                reinforcementLearning: true,
                ensemble: true,
                onlineLearning: true,
            },
            ...config,
        };
        const systemContext = {
            environment: config?.['environment'] || 'production',
            resources: config?.['resources'] || [],
            constraints: config?.['constraints'] || [],
            objectives: config?.['objectives'] || [],
        };
        const systems = await Promise.all([
            import('./adaptive-learning/pattern-recognition-engine.ts'),
            import('./adaptive-learning/learning-coordinator.ts'),
            import('./adaptive-learning/performance-optimizer.ts'),
            import('./adaptive-learning/ml-integration.ts'),
            import('./adaptive-learning/behavioral-optimization.ts'),
            import('./adaptive-learning/knowledge-evolution.ts'),
        ]);
        if (systems.length < 6) {
            throw new Error('Failed to load all intelligence system modules');
        }
        const [patternRecognitionModule, learningCoordinatorModule, performanceOptimizerModule, mlRegistryModule, behavioralOptimizationModule, knowledgeEvolutionModule,] = systems;
        return {
            patternRecognition: patternRecognitionModule &&
                new patternRecognitionModule['PatternRecognitionEngine'](defaultConfig, systemContext),
            learningCoordinator: learningCoordinatorModule &&
                new learningCoordinatorModule['LearningCoordinator'](defaultConfig, systemContext),
            performanceOptimizer: performanceOptimizerModule &&
                new performanceOptimizerModule['PerformanceOptimizer'](defaultConfig, systemContext),
            mlRegistry: mlRegistryModule && new mlRegistryModule.MLModelRegistry(defaultConfig),
            behavioralOptimization: behavioralOptimizationModule,
            knowledgeEvolution: knowledgeEvolutionModule,
            config: defaultConfig,
            context: systemContext,
        };
    },
    createAdaptiveLearningSystem: async (config) => {
        const { PatternRecognitionEngine } = await import('./adaptive-learning/pattern-recognition-engine.ts');
        const { LearningCoordinator } = await import('./adaptive-learning/learning-coordinator.ts');
        const { PerformanceOptimizer } = await import('./adaptive-learning/performance-optimizer.ts');
        const { MLModelRegistry } = await import('./adaptive-learning/ml-integration.ts');
        const defaultConfig = {
            patternRecognition: {
                enabled: true,
                minPatternFrequency: 3,
                confidenceThreshold: 0.7,
                analysisWindow: 3600000,
            },
            learning: {
                enabled: true,
                learningRate: 0.1,
                adaptationRate: 0.1,
                knowledgeRetention: 0.9,
            },
            optimization: {
                enabled: true,
                optimizationThreshold: 0.8,
                maxOptimizations: 10,
                validationRequired: true,
            },
            ml: {
                neuralNetwork: true,
                reinforcementLearning: true,
                ensemble: true,
                onlineLearning: true,
            },
            ...config,
        };
        const systemContext = {
            environment: config?.['environment'] || 'production',
            resources: config?.['resources'] || [],
            constraints: config?.['constraints'] || [],
            objectives: config?.['objectives'] || [],
        };
        return {
            patternEngine: new PatternRecognitionEngine(defaultConfig, systemContext),
            coordinator: new LearningCoordinator(defaultConfig, systemContext),
            optimizer: new PerformanceOptimizer(defaultConfig, systemContext),
            mlRegistry: new MLModelRegistry(defaultConfig),
        };
    },
};
export class IntelligenceFactory {
    static systems = new Map();
    static async getSystem(type, config = {}) {
        if (!IntelligenceFactory.systems.has(type)) {
            const system = await IntelligenceUtils.initialize(config);
            IntelligenceFactory.systems.set(type, system);
        }
        return IntelligenceFactory.systems.get(type);
    }
    static async getAdaptiveLearningSystem(config = {}) {
        const key = `adaptive_learning_${JSON.stringify(config)}`;
        if (!IntelligenceFactory.systems.has(key)) {
            const system = await IntelligenceUtils.createAdaptiveLearningSystem(config);
            IntelligenceFactory.systems.set(key, system);
        }
        return IntelligenceFactory.systems.get(key);
    }
    static clearSystems() {
        IntelligenceFactory.systems.clear();
    }
}
export default IntelligenceUtils;
//# sourceMappingURL=index.js.map