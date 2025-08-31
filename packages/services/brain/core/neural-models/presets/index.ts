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
  type: string; // classification | regression | deep | etc.
  architecture: string;
  layers: number[];
  activation: string;
  outputActivation: string;
  learningRate: number;
  batchSize: number;
  useCase: string[];
  dropout?: number;
  config?: Record<string, unknown>;
  model?: string;
  description?: string;
  performance?: {
    accuracy?: number;
    latency?: number;
    memoryUsage?: number;
    [key: string]: unknown;
  };
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
 * Get preset by category and name.
 *
 * @param category
 * @param presetName
 * @example
 */
export function getPreset(
  category: string,
  presetName?: string
): NeuralPreset | undefined {
  if (presetName) {
    // Two-argument version - look by category and preset name
    const presets = Object.values(NEURAL_PRESETS);
    return presets.find(
      (preset) =>
        preset.type === category &&
        (preset.id === presetName ||
          preset.name.toLowerCase().includes(presetName.toLowerCase()))
    );
  }
  // Single-argument version (legacy) - category is actually presetId
  return NEURAL_PRESETS[category.toUpperCase()];
}

/**
 * Get recommended preset for use case.
 *
 * @param useCase
 * @example
 */
export function getRecommendedPreset(useCase: string): NeuralPreset {
  const presets = Object.values(NEURAL_PRESETS);
  const found = presets.find((preset) => preset.useCase.includes(useCase));
  // Fallback to a known safe baseline preset
  return (found ?? NEURAL_PRESETS.BASIC_CLASSIFIER) as NeuralPreset;
}

/**
 * Search presets by use case.
 *
 * @param useCase
 * @example
 */
export function searchPresetsByUseCase(useCase: string): NeuralPreset[] {
  const presets = Object.values(NEURAL_PRESETS);
  return presets.filter((preset) => preset.useCase.includes(useCase));
}

/**
 * Get presets by category.
 *
 * @param category
 * @example
 */
export function getCategoryPresets(category: string): NeuralPreset[] {
  const presets = Object.values(NEURAL_PRESETS);
  return presets.filter((preset) => preset.type === category);
}

/**
 * Validate preset configuration.
 *
 * @param config
 * @example
 */
export function validatePresetConfig(config: Partial<NeuralPreset>): boolean {
  const required: Array<keyof NeuralPreset> = ['id', 'architecture', 'layers`];
  const missing = required.filter(
    (field) => !(field in config) || (config as any)[field] == null
  );

  if (missing.length > 0) {
    throw new Error(
      `Invalid preset configuration. Missing: ${missing.join(', `)}`
    );
  }

  if (!Array.isArray(config?.layers) || config?.layers.length === 0) {
    throw new Error('Layers must be a non-empty array');
  }

  return true;
}

export default {
  NEURAL_PRESETS,
  getPreset,
  getRecommendedPreset,
  searchPresetsByUseCase,
  getCategoryPresets,
  validatePresetConfig,
};
