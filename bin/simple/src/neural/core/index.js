export { ACTIVATION_FUNCTIONS, ActivationFunctions, CascadeTrainer, COGNITIVE_PATTERNS, createAgentNeuralManager, createNeuralNetwork, createTrainer, initializeNeuralWasm, NeuralNetwork, NeuralTrainer, TRAINING_ALGORITHMS, } from './network.ts';
export { NeuralCLI, neuralCLI as NeuralCoreCLI, PATTERN_MEMORY_CONFIG, } from './neural-core.ts';
export * from './neural-network.ts';
export { NeuralNetwork as NeuralNetworkJS } from './neural-network.ts';
export { NeuralNetworkManager } from './neural-network-manager.ts';
export const NeuralCoreUtils = {
    getNetworkTypes: () => {
        return ['feedforward', 'lstm', 'transformer', 'autoencoder', 'cnn', 'gnn'];
    },
    validateNetworkConfig: (config) => {
        return Boolean(config?.layers && Array.isArray(config?.layers));
    },
    generateNetworkId: (type) => {
        return `neural-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    },
    calculateComplexity: (layers) => {
        return layers.reduce((sum, neurons, index) => {
            if (index === 0)
                return sum;
            return sum + neurons * layers[index - 1];
        }, 0);
    },
    estimateTrainingTime: (complexity, dataSize, epochs) => {
        const processingFactor = 1000;
        return Math.ceil((complexity * dataSize * epochs) / processingFactor);
    },
};
export default NeuralCoreUtils;
//# sourceMappingURL=index.js.map