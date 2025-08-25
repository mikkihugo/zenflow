// Neural Models - Export Hub
/**
 * @file Models module exports.
 */
// Model configuration exports - using local presets directory
// Import for default export
import { NEURAL_PRESETS } from './presets';
export { NEURAL_PRESETS } from './presets';
export * from './presets';
// Re-export with alias for backward compatibility
export { NEURAL_PRESETS as COMPLETE_NEURAL_PRESETS } from './presets';
// Create missing model aliases for compatibility
export { NEURAL_PRESETS as NeuralModelPresets } from './presets';
// Create specific preset aliases
export const AutoencoderPreset = {
    id: 'autoencoder',
    name: 'Autoencoder Network',
    type: 'unsupervised',
    architecture: 'autoencoder',
    layers: [256, 128, 64, 128, 256],
    activation: 'relu',
    outputActivation: 'sigmoid',
    learningRate: 0.001,
    batchSize: 32,
    useCase: ['dimensionality_reduction', 'anomaly_detection'],
};
export const CNNPreset = {
    id: 'cnn',
    name: 'Convolutional Neural Network',
    type: 'computer_vision',
    architecture: 'cnn',
    layers: [32, 64, 128],
    activation: 'relu',
    outputActivation: 'softmax',
    learningRate: 0.001,
    batchSize: 32,
    useCase: ['image_classification', 'object_detection'],
};
export const LSTMPreset = {
    id: 'lstm',
    name: 'Long Short-Term Memory Network',
    type: 'sequence',
    architecture: 'lstm',
    layers: [64, 32],
    activation: 'tanh',
    outputActivation: 'softmax',
    learningRate: 0.001,
    batchSize: 32,
    useCase: ['time_series', 'text_generation'],
};
// Create placeholder model classes for missing exports
export class GraphNeuralNetwork {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    async train(data) {
        logger.info('Training Graph Neural Network with data:', data);
    }
    async predict(input) {
        logger.info('Graph Neural Network prediction for input:', input);
        return { prediction: 'graph_output' };
    }
}
export class TransformerModel {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    async train(data) {
        logger.info('Training Transformer Model with data:', data);
    }
    async predict(input) {
        logger.info('Transformer Model prediction for input:', input);
        return { prediction: 'transformer_output' };
    }
}
export class VAEModel {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    async train(data) {
        logger.info('Training VAE Model with data:', data);
    }
    async predict(input) {
        logger.info('VAE Model prediction for input:', input);
        return { prediction: 'vae_output' };
    }
}
// Default export for backward compatibility
export default {
    NEURAL_PRESETS,
    NeuralModelPresets: NEURAL_PRESETS,
    AutoencoderPreset,
    CNNPreset,
    LSTMPreset,
    GraphNeuralNetwork,
    TransformerModel,
    VAEModel,
};
//# sourceMappingURL=index.js.map