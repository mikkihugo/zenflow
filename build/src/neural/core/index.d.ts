/**
 * Neural Core Module - Barrel Export.
 *
 * Central export point for core neural network functionality.
 */
/**
 * @file Core module exports.
 */
export type { ActivationFunctions as ActivationFunction, AgentNetworkConfig, AgentNeuralManager, CascadeConfig, CognitiveState, LayerConfig, NetworkConfig, NetworkInfo, TrainingConfig, TrainingDataConfig, TrainingResult, } from './network.ts';
export { ACTIVATION_FUNCTIONS, ActivationFunctions, CascadeTrainer, COGNITIVE_PATTERNS, createAgentNeuralManager, createNeuralNetwork, createTrainer, initializeNeuralWasm, NeuralNetwork, NeuralTrainer, TRAINING_ALGORITHMS, } from './network.ts';
export { type ModelMetadata, NeuralCLI, type NeuralConfig, neuralCLI as NeuralCoreCLI, PATTERN_MEMORY_CONFIG, type PatternData, type PatternType, type PersistenceInfo, type TrainingResults, type WeightsExport, } from './neural-core.ts';
export * from './neural-network.ts';
export { NeuralNetwork as NeuralNetworkJS } from './neural-network.ts';
export { NeuralNetworkManager } from './neural-network-manager.ts';
export declare const NeuralCoreUtils: {
    /**
     * Get available neural network types.
     */
    getNetworkTypes: () => string[];
    /**
     * Validate network configuration.
     *
     * @param config
     */
    validateNetworkConfig: (config: any) => boolean;
    /**
     * Generate network ID.
     *
     * @param type
     */
    generateNetworkId: (type: string) => string;
    /**
     * Calculate network complexity.
     *
     * @param layers
     */
    calculateComplexity: (layers: number[]) => number;
    /**
     * Estimate training time.
     *
     * @param complexity
     * @param dataSize
     * @param epochs
     */
    estimateTrainingTime: (complexity: number, dataSize: number, epochs: number) => number;
};
export default NeuralCoreUtils;
//# sourceMappingURL=index.d.ts.map