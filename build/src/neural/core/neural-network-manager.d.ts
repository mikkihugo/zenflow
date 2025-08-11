/**
 * @file Neural Network Manager for Per-Agent Neural Networks.
 *
 * Manages neural networks for individual agents with WASM integration,
 * cognitive pattern evolution, and collaborative learning capabilities.
 */
/**
 * Neural network instance interface.
 *
 * @example
 */
interface NeuralNetworkInstance {
    /** Unique identifier for the network */
    id?: string;
    /** Agent ID */
    agentId?: string;
    /** Network configuration */
    config?: NeuralModelConfig;
    /** Training state */
    trainingState?: {
        epoch: number;
        loss: number;
        accuracy: number;
        learningRate: number;
        optimizer: string;
    };
    /** Performance metrics */
    metrics?: PerformanceMetrics;
    /** Model type */
    modelType?: string;
    /** Training method */
    train?: (trainingData: TrainingDataItem[], options: Record<string, unknown>) => Promise<PerformanceMetrics>;
    /** Get metrics method */
    getMetrics?: () => PerformanceMetrics;
    /** Save method */
    save?: (filePath: string) => Promise<boolean>;
    /** Load method */
    load?: (filePath: string) => Promise<boolean>;
}
/**
 * Neural model configuration.
 *
 * @example
 */
interface NeuralModelConfig {
    /** Model architecture type */
    architecture: string;
    /** Input layer size */
    inputSize: number;
    /** Hidden layers configuration */
    hiddenLayers: number[];
    /** Output layer size */
    outputSize: number;
    /** Additional parameters */
    parameters?: Record<string, unknown>;
    /** Meta-learning enabled */
    enableMetaLearning?: boolean;
    /** Neural network template */
    template?: string;
    /** Network layers */
    layers?: number[];
    /** Activation function */
    activation?: string;
    /** Learning rate */
    learningRate?: number;
    /** Optimizer type */
    optimizer?: string;
}
/**
 * Performance metrics for neural networks.
 *
 * @example
 */
interface PerformanceMetrics {
    /** Training accuracy */
    accuracy: number;
    /** Training loss */
    loss: number;
    /** Training time in milliseconds */
    trainingTime: number;
    /** Inference time in milliseconds */
    inferenceTime: number;
    /** Memory usage in bytes */
    memoryUsage: number;
    /** Creation time */
    creationTime?: number;
    /** Model type */
    modelType?: string;
    /** Cognitive patterns */
    cognitivePatterns?: Array<{
        id: string;
        type: string;
        strength: number;
        pattern?: string;
        confidence?: number;
        lastUpdated?: number;
    }>;
    /** Adaptation history */
    adaptationHistory?: Array<{
        timestamp: number;
        trainingResult?: PerformanceMetrics | null;
        cognitiveGrowth?: {
            growth: number;
            patterns: number;
            latestGeneration?: number;
        };
        changes: {
            weights?: Record<string, number[]>;
            learningRate?: number;
            architecture?: string[];
        };
        performance: PerformanceMetrics;
    }>;
    /** Collaboration score */
    collaborationScore?: number;
}
/**
 * Collaborative session interface.
 *
 * @example
 */
interface CollaborativeSession {
    id?: string;
    active: boolean;
    agentIds: string[];
    syncInterval: number;
    coordinationMatrix?: number[][];
    knowledgeGraph?: Map<string, unknown>;
    evolutionTracker?: Map<string, unknown>;
    privacyLevel?: string;
    knowledgeSharingMatrix?: Record<string, Record<string, number>>;
    strategy?: unknown;
    networks?: (NeuralNetworkInstance | undefined)[];
}
/**
 * Training data interface.
 *
 * @example
 */
interface TrainingDataItem {
    input: number[];
    output: number[];
}
/**
 * Enhanced neural network instance interface.
 *
 * @example
 */
interface EnhancedNeuralNetworkInstance extends NeuralNetworkInstance {
    getWeights?: () => Record<string, number[]>;
    setWeights?: (weights: Record<string, number[]>) => void;
}
declare class NeuralNetworkManager {
    private wasmLoader;
    private neuralNetworks;
    private neuralModels;
    private cognitiveEvolution;
    private metaLearning;
    private coordinationProtocol;
    private cognitivePatternSelector;
    private neuralAdaptationEngine;
    private sharedKnowledge;
    private agentInteractions;
    private performanceMetrics;
    private templates;
    private daaCognition;
    private collaborativeMemory;
    private adaptiveOptimization;
    private federatedLearningEnabled;
    /**
     * Creates a new Neural Network Manager instance.
     *
     * @param wasmLoader - WebAssembly loader for neural computation acceleration.
     * @example
     * ```typescript
     * const wasmLoader = await import('./neural-wasm-loader')
     * const manager = new NeuralNetworkManager(wasmLoader)
     * ```
     */
    constructor(wasmLoader: unknown);
    createAgentNeuralNetwork(agentId: string, config?: Partial<NeuralModelConfig>): Promise<any>;
    createSimulatedNetwork(agentId: string, config: Partial<NeuralModelConfig>): SimulatedNeuralNetwork;
    createAdvancedNeuralModel(agentId: string, template: string, customConfig?: Record<string, unknown>): Promise<any>;
    fineTuneNetwork(agentId: string, trainingData: TrainingDataItem[], options?: Record<string, unknown>): Promise<PerformanceMetrics | null>;
    enableCollaborativeLearning(agentIds: string[], options?: Record<string, unknown>): Promise<{
        id: string;
        networks: (NeuralNetworkInstance | undefined)[];
        agentIds: string[];
        strategy: unknown;
        syncInterval: unknown;
        privacyLevel: unknown;
        active: boolean;
        knowledgeGraph: Map<any, any>;
        evolutionTracker: Map<any, any>;
        coordinationMatrix: any[][];
    }>;
    startFederatedLearning(session: any): void;
    aggregateGradients(gradients: any, privacyLevel: any): {};
    calculateSensitivity(parameterKey: any, gradients: any): number;
    generateLaplacianNoise(sensitivity: any, epsilon: any): number;
    getNetworkMetrics(agentId: any): PerformanceMetrics | null;
    saveNetworkState(agentId: any, filePath: any): Promise<boolean>;
    loadNetworkState(agentId: any, filePath: any): Promise<boolean>;
    /**
     * Create a neural network from a production preset.
     *
     * @param {string} agentId - Agent identifier.
     * @param {string} category - Preset category (nlp, vision, timeseries, graph).
     * @param {string} presetName - Name of the preset.
     * @param {object} customConfig - Optional custom configuration overrides.
     */
    createAgentFromPreset(agentId: any, category: any, presetName: any, customConfig?: {}): Promise<any>;
    /**
     * Create a neural network from complete preset (27+ models).
     *
     * @param {string} agentId - Agent identifier.
     * @param {string} modelType - Model type (transformer, cnn, lstm, etc.).
     * @param {string} presetName - Name of the preset.
     * @param {object} customConfig - Optional custom configuration overrides.
     */
    createAgentFromCompletePreset(agentId: string, modelType: string, presetName: string, customConfig?: any): Promise<any>;
    /**
     * Create a neural network from a recommended preset based on use case.
     *
     * @param {string} agentId - Agent identifier.
     * @param {string} useCase - Use case description.
     * @param {object} customConfig - Optional custom configuration overrides.
     */
    createAgentForUseCase(agentId: any, useCase: any, customConfig?: {}): Promise<any>;
    /**
     * Get all available presets for a category.
     *
     * @param {string} category - Preset category.
     */
    getAvailablePresets(category?: null): import("./neural-models/presets/index.ts").NeuralPresetMap | import("./neural-models/presets/index.ts").NeuralPreset[];
    /**
     * Search presets by use case or description.
     *
     * @param {string} searchTerm - Search term.
     */
    searchPresets(searchTerm: string): import("./neural-models/presets/index.ts").NeuralPreset[];
    /**
     * Get performance information for a preset.
     *
     * @param {string} category - Preset category.
     * @param {string} presetName - Preset name.
     */
    getPresetPerformance(category: string, presetName: string): {
        [key: string]: any;
        accuracy?: number;
        latency?: number;
        memoryUsage?: number;
    } | undefined;
    /**
     * List all available preset categories and their counts.
     */
    getPresetSummary(): Record<string, {
        count: number;
        presets: string[];
    }>;
    /**
     * Get detailed information about agent's preset (if created from preset).
     *
     * @param {string} agentId - Agent identifier.
     */
    getAgentPresetInfo(agentId: string): any;
    /**
     * Update existing agent with preset configuration.
     *
     * @param {string} agentId - Agent identifier.
     * @param {string} category - Preset category.
     * @param {string} presetName - Preset name.
     * @param {object} customConfig - Optional custom configuration overrides.
     */
    updateAgentWithPreset(agentId: string, category: string, presetName: string, customConfig?: any): Promise<any>;
    /**
     * Batch create agents from presets.
     *
     * @param {Array} agentConfigs - Array of {agentId, category, presetName, customConfig}.
     */
    batchCreateAgentsFromPresets(agentConfigs: Array<{
        agentId: string;
        category: string;
        presetName: string;
        customConfig?: any;
    }>): Promise<{
        results: {
            agentId: string;
            success: boolean;
            agent: any;
        }[];
        errors: {
            agentId: string;
            error: string;
        }[];
    }>;
    /**
     * Enable knowledge sharing between agents.
     *
     * @param {Array} agentIds - List of agent IDs.
     * @param {Object} session - Collaborative session object.
     */
    enableKnowledgeSharing(agentIds: string[], session: CollaborativeSession): Promise<void>;
    /**
     * Extract knowledge from a neural network agent.
     *
     * @param {string} agentId - Agent identifier.
     */
    extractAgentKnowledge(agentId: string): Promise<{
        agentId: string;
        timestamp: number;
        modelType: string | undefined;
        weights: {};
        patterns: {
            id: any;
            type: any;
            fitness: any;
            generation: any;
        }[];
        experiences: {
            taskId: any;
            performance: any;
            strategy: any;
            timestamp: any;
        }[];
        performance: PerformanceMetrics | undefined;
        specializations: any[];
    } | null>;
    /**
     * Extract important weights from a neural network.
     *
     * @param {Object} network - Neural network instance.
     */
    extractImportantWeights(network: EnhancedNeuralNetworkInstance): Promise<{}>;
    /**
     * Calculate importance threshold for weight selection.
     *
     * @param {Array} importance - Array of importance scores.
     */
    calculateImportanceThreshold(importance: number[]): number;
    /**
     * Identify agent specializations based on performance patterns.
     *
     * @param {string} agentId - Agent identifier.
     */
    identifySpecializations(agentId: string): Promise<any[]>;
    /**
     * Infer domain from training patterns.
     *
     * @param {Object} adaptation - Adaptation record.
     */
    inferDomainFromTraining(adaptation: any): "generation" | "general" | "classification" | "regression";
    /**
     * Create knowledge sharing matrix between agents.
     *
     * @param {Array} agentIds - List of agent IDs.
     */
    createKnowledgeSharingMatrix(agentIds: string[]): Promise<Record<string, Record<string, number>>>;
    /**
     * Calculate similarity between two agents.
     *
     * @param {string} agentA - First agent ID.
     * @param {string} agentB - Second agent ID.
     */
    calculateAgentSimilarity(agentA: string, agentB: string): Promise<number>;
    /**
     * Calculate structural similarity between agents.
     *
     * @param {Object} knowledgeA - Knowledge from agent A.
     * @param {Object} knowledgeB - Knowledge from agent B.
     */
    calculateStructuralSimilarity(knowledgeA: any, knowledgeB: any): number;
    /**
     * Calculate performance similarity between agents.
     *
     * @param {Object} knowledgeA - Knowledge from agent A.
     * @param {Object} knowledgeB - Knowledge from agent B.
     */
    calculatePerformanceSimilarity(knowledgeA: any, knowledgeB: any): number;
    /**
     * Calculate specialization similarity between agents.
     *
     * @param {Object} knowledgeA - Knowledge from agent A.
     * @param {Object} knowledgeB - Knowledge from agent B.
     */
    calculateSpecializationSimilarity(knowledgeA: any, knowledgeB: any): number;
    /**
     * Start knowledge distillation learning.
     *
     * @param {Object} session - Collaborative session.
     * @param session.active
     * @param session.agentIds
     * @param session.syncInterval
     */
    startKnowledgeDistillation(session: {
        active: boolean;
        agentIds: string[];
        syncInterval: number;
    }): void;
    /**
     * Identify teacher agents based on performance.
     *
     * @param {Array} agentIds - List of agent IDs.
     */
    identifyTeacherAgents(agentIds: string[]): Promise<string[]>;
    /**
     * Perform knowledge distillation between teacher and student.
     *
     * @param {string} teacherAgentId - Teacher agent ID.
     * @param {string} studentAgentId - Student agent ID.
     * @param {Object} session - Collaborative session.
     * @param session.agentIds
     * @param session.coordinationMatrix
     */
    performKnowledgeDistillation(teacherAgentId: string, studentAgentId: string, session: {
        agentIds: string[];
        coordinationMatrix: number[][];
    }): Promise<void>;
    /**
     * Apply knowledge distillation to student network.
     *
     * @param {Object} student - Student network.
     * @param {Object} teacherKnowledge - Teacher's knowledge.
     * @param {Object} options - Distillation options.
     * @param options.temperature
     * @param options.alpha
     */
    applyKnowledgeDistillation(student: any, teacherKnowledge: any, options: {
        temperature: number;
        alpha: number;
    }): Promise<{
        improvement: number;
        beforeMetrics: any;
        afterMetrics: any;
    }>;
    /**
     * Start neural coordination protocol.
     *
     * @param {Object} session - Collaborative session.
     * @param session.active
     * @param session.syncInterval
     */
    startNeuralCoordination(session: {
        active: boolean;
        syncInterval: number;
    }): void;
    /**
     * Update coordination matrix based on agent interactions.
     *
     * @param {Object} session - Collaborative session.
     * @param session.agentIds
     * @param session.coordinationMatrix
     */
    updateCoordinationMatrix(session: {
        agentIds: string[];
        coordinationMatrix: number[][];
    }): Promise<void>;
    /**
     * Calculate interaction strength between two agents.
     *
     * @param {string} agentA - First agent ID.
     * @param {string} agentB - Second agent ID.
     */
    calculateInteractionStrength(agentA: string, agentB: string): Promise<number>;
    /**
     * Apply coordination results to agents.
     *
     * @param {Object} session - Collaborative session.
     * @param session.id
     */
    applyCoordinationResults(session: {
        id: string;
    }): Promise<void>;
    /**
     * Apply weight adjustments to a neural network.
     *
     * @param {Object} agent - Neural network agent.
     * @param {Object} adjustments - Weight adjustments.
     */
    applyWeightAdjustments(agent: EnhancedNeuralNetworkInstance, adjustments: Record<string, number[]>): Promise<void>;
    /**
     * Record agent interaction for coordination tracking.
     *
     * @param {string} agentA - First agent ID.
     * @param {string} agentB - Second agent ID.
     * @param {number} strength - Interaction strength (0-1).
     * @param {string} type - Interaction type.
     */
    recordAgentInteraction(agentA: string, agentB: string, strength: number, type?: string): void;
    /**
     * Get all complete neural presets (27+ models).
     */
    getCompleteNeuralPresets(): import("./neural-models/neural-presets-complete.ts").CompletePresetMap;
    /**
     * Get preset recommendations based on requirements.
     *
     * @param {string} useCase - Use case description.
     * @param {Object} requirements - Performance and other requirements.
     */
    getPresetRecommendations(useCase: string, requirements?: Record<string, any>): any;
    /**
     * Get adaptation recommendations for an agent.
     *
     * @param {string} agentId - Agent identifier.
     */
    getAdaptationRecommendations(agentId: string): Promise<any>;
    /**
     * Export adaptation insights across all agents.
     */
    getAdaptationInsights(): {
        totalAdaptations: number;
        averageImprovement: number;
        commonPatterns: {
            type: string;
            count: number;
        }[];
        recommendations: any[];
    };
    /**
     * List all available neural model types with counts.
     */
    getAllNeuralModelTypes(): {};
    /**
     * Get comprehensive neural network statistics.
     */
    getEnhancedStatistics(): {
        totalAgents: number;
        modelTypes: {};
        cognitiveEvolution: {
            totalPatterns: number;
            generations: number;
            averageFitness: number;
            options: any;
        };
        metaLearning: {
            totalAgents: number;
            totalTasks: number;
            strategies: number;
            averagePerformance: number;
        };
        coordination: {
            totalNodes: number;
            totalMessages: number;
            activeSessions: number;
            averageMessageCount: number;
        };
        performance: {};
        collaborations: number;
    };
}
interface NeuralNetworkConfig {
    layers: number[];
    [key: string]: any;
}
interface TrainingHistoryEntry {
    epoch: number;
    loss: number;
}
declare class SimulatedNeuralNetwork {
    agentId: string;
    config: NeuralNetworkConfig;
    weights: number[];
    trainingHistory: TrainingHistoryEntry[];
    metrics: {
        accuracy: number;
        loss: number;
        epochs_trained: number;
        total_samples: number;
    };
    constructor(agentId: string, config: NeuralNetworkConfig);
    initializeWeights(): number[];
    forward(_input: number[] | Float32Array): Promise<Float32Array>;
    train(_trainingData: TrainingDataItem[], options: {
        epochs: number;
        batchSize?: number;
        learningRate?: number;
    }): Promise<typeof this.metrics>;
    getWeights(): Record<string, any>;
    setWeights(weights: Record<string, any>): void;
    getGradients(): {
        layer_0: number;
        layer_1: number;
    };
    applyGradients(_gradients: any): void;
    getMetrics(): {
        training_history: TrainingHistoryEntry[];
        network_info: {
            layers: number[];
            parameters: number;
        };
        accuracy: number;
        loss: number;
        epochs_trained: number;
        total_samples: number;
    };
    save(_filePath: string): Promise<boolean>;
    load(_filePath: string): Promise<boolean>;
}
declare const NeuralNetworkTemplates: {
    getTemplate: (templateName: string) => any;
};
export { NeuralNetworkManager, NeuralNetworkTemplates };
//# sourceMappingURL=neural-network-manager.d.ts.map