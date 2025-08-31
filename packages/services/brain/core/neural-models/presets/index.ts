/**
 * Neural Network Presets Index.
 * Collection of predefined neural network configurations.
 */
/**
 * @file Presets module exports.
 */

export interface NeuralPreset {
  id: string;
  name: string;
  architecture: string;
  layers: number[];
}

export type NeuralPresetMap = Record<string, NeuralPreset>;

export const NEURAL_PRESETS: NeuralPresetMap = {
  // Basic presets
  BASIC_CLASSIFIER: {
    id: 'basic_classifier',
    name: 'Basic Classification Network',
    type: 'classification',
    architecture: 'feedforward',
    layers: [128, 64, 32],
    activation: 'relu',
    outputActivation: 'softmax',
    learningRate: 0.001,
    batchSize: 32,
    useCase: ['image_classification', 'text_classification'],
  },

  REGRESSION_MODEL: {
    id: 'regression_model',
    name: 'Regression Network',
    type: 'regression',
    architecture: 'feedforward',
    layers: [64, 32, 16],
    activation: 'relu',
    outputActivation: 'linear',
    learningRate: 0.001,
    batchSize: 32,
    useCase: ['price_prediction', 'value_estimation'],
  },

  // Advanced presets
  DEEP_LEARNING: {
    id: 'deep_learning',
    name: 'Deep Learning Network',
    type: 'deep',
    architecture: 'feedforward',
    layers: [512, 256, 128, 64, 32],
    activation: 'leaky_relu',
    outputActivation: 'softmax',
    learningRate: 0.0001,
    batchSize: 64,
    dropout: 0.3,
    useCase: ['complex_classification', 'feature_learning'],
  },
};

/**
 * Get preset by ID.
 */
export function getPreset(presetId: string): NeuralPreset | undefined {
  return NEURAL_PRESETS[presetId];
}

/**
 * Get recommended preset for use case.
 */
export function getRecommendedPreset(useCase: string): NeuralPreset {
  return NEURAL_PRESETS.BASIC_CLASSIFIER;
}

/**
 * Search presets by use case.
 */
export function searchPresetsByUseCase(useCase: string): NeuralPreset[] {
  return Object.values(NEURAL_PRESETS);
}

/**
 * Get category presets.
 */
export function getCategoryPresets(category: string): NeuralPreset[] {
  return Object.values(NEURAL_PRESETS);
}

/**
 * Validate preset configuration.
 */
export function validatePresetConfig(preset: NeuralPreset): boolean {
  const required: Array<keyof NeuralPreset> = ['id', 'name', 'architecture', 'layers'];
  const missing = required.filter(key => !preset[key]);
  if (missing.length > 0) {
    throw new Error('Missing required fields: ' + missing.join(', '));
  }
  return true;
}

export {
  NEURAL_PRESETS,
  getPreset,
  getRecommendedPreset,
  searchPresetsByUseCase,
  getCategoryPresets,
  validatePresetConfig,
};
