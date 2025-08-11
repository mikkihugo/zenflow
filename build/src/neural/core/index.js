/**
 * Neural Core Module - Barrel Export.
 *
 * Central export point for core neural network functionality.
 */
// Core neural components (explicit exports to avoid conflicts)
// Export from network module
export { ACTIVATION_FUNCTIONS, ActivationFunctions, CascadeTrainer, COGNITIVE_PATTERNS, createAgentNeuralManager, createNeuralNetwork, createTrainer, initializeNeuralWasm, NeuralNetwork, NeuralTrainer, TRAINING_ALGORITHMS, } from './network.ts';
// Export from neural module (avoid duplicates with neural-core)
// export { Neural, NeuralCLI as LegacyNeuralCLI, neuralCLI } from './neural.ts';
// Export from neural-core module (primary source)
export { NeuralCLI, 
// NeuralCore,
neuralCLI as NeuralCoreCLI, PATTERN_MEMORY_CONFIG, } from './neural-core.ts';
// Export from neural-network module
export * from './neural-network.ts';
export { NeuralNetwork as NeuralNetworkJS } from './neural-network.ts';
// Neural network manager (JavaScript)
export { NeuralNetworkManager } from './neural-network-manager.ts';
// Export from neural-network-manager module - already exported above
// Core utilities
export const NeuralCoreUtils = {
    /**
     * Get available neural network types.
     */
    getNetworkTypes: () => {
        return ['feedforward', 'lstm', 'transformer', 'autoencoder', 'cnn', 'gnn'];
    },
    /**
     * Validate network configuration.
     *
     * @param config
     */
    validateNetworkConfig: (config) => {
        return Boolean(config?.layers && Array.isArray(config?.layers));
    },
    /**
     * Generate network ID.
     *
     * @param type
     */
    generateNetworkId: (type) => {
        return `neural-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    },
    /**
     * Calculate network complexity.
     *
     * @param layers
     */
    calculateComplexity: (layers) => {
        return layers.reduce((sum, neurons, index) => {
            if (index === 0)
                return sum;
            return sum + neurons * layers[index - 1];
        }, 0);
    },
    /**
     * Estimate training time.
     *
     * @param complexity
     * @param dataSize
     * @param epochs
     */
    estimateTrainingTime: (complexity, dataSize, epochs) => {
        // Simple heuristic: complexity * dataSize * epochs / processing_factor
        const processingFactor = 1000; // Adjust based on hardware
        return Math.ceil((complexity * dataSize * epochs) / processingFactor);
    },
};
// Default export
export default NeuralCoreUtils;
