/**
 * Neural Models Index
 * Central registry for neural network models and presets
 */

export const MODEL_PRESETS = {
  CLASSIFICATION: {
    id: 'classification',
    name: 'Classification Model',
    architecture: 'feedforward',
    layers: [128, 64, 32],
    activation: 'relu',
    outputActivation: 'softmax',
  },
  REGRESSION: {
    id: 'regression',
    name: 'Regression Model',
    architecture: 'feedforward',
    layers: [64, 32, 16],
    activation: 'relu',
    outputActivation: 'linear',
  },
  AUTOENCODER: {
    id: 'autoencoder',
    name: 'Autoencoder Model',
    architecture: 'autoencoder',
    encoderLayers: [128, 64, 32],
    decoderLayers: [32, 64, 128],
    activation: 'relu',
  },
  TRANSFORMER: {
    id: 'transformer',
    name: 'Transformer Model',
    architecture: 'transformer',
    heads: 8,
    layers: 6,
    hiddenSize: 512,
    activation: 'gelu',
  },
};

/**
 * Create a neural model from preset or custom configuration
 *
 * @param config
 */
export function createNeuralModel(config) {
  const preset = typeof config === 'string' ? MODEL_PRESETS[config.toUpperCase()] : null;

  if (preset) {
    return {
      ...preset,
      created: new Date(),
      id: `${preset.id}_${Date.now()}`,
    };
  }

  // Custom configuration
  return {
    ...config,
    created: new Date(),
    id: config.id || `custom_${Date.now()}`,
  };
}

/**
 * Get available model presets
 */
export function getAvailablePresets() {
  return Object.keys(MODEL_PRESETS);
}

/**
 * Validate model configuration
 *
 * @param config
 */
export function validateModelConfig(config) {
  const required = ['architecture', 'layers'];
  const missing = required.filter((field) => !config[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  return true;
}

export default {
  MODEL_PRESETS,
  createNeuralModel,
  getAvailablePresets,
  validateModelConfig,
};
