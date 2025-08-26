// Neural Models - Export Hub
/**
 * @file Models module exports.
 */

// Model configuration exports - using local presets directory
// Import for default export
import { NEURAL_PRESETS } from './presets';

export type { NeuralPreset, NeuralPresetMap } from './presets';
export * from './presets';
// Re-export with alias for backward compatibility
// Create missing model aliases for compatibility
export { NEURAL_PRESETS, NEURAL_PRESETS as COMPLETE_NEURAL_PRESETS, NEURAL_PRESETS as NeuralModelPresets } from './presets';

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
  constructor(public config: any = {}) {}

  async train(data: any): Promise<void> {
    console.log('Training Graph Neural Network with data:', data);'
  }

  async predict(input: any): Promise<any> {
    console.log('Graph Neural Network prediction for input:', input);'
    return { prediction: 'graph_output' };'
  }
}

export class TransformerModel {
  constructor(public config: any = {}) {}

  async train(data: any): Promise<void> {
    console.log('Training Transformer Model with data:', data);'
  }

  async predict(input: any): Promise<any> {
    console.log('Transformer Model prediction for input:', input);'
    return { prediction: 'transformer_output' };'
  }
}

export class VAEModel {
  constructor(public config: any = {}) {}

  async train(data: any): Promise<void> {
    console.log('Training VAE Model with data:', data);'
  }

  async predict(input: any): Promise<any> {
    console.log('VAE Model prediction for input:', input);'
    return { prediction: 'vae_output' };'
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
