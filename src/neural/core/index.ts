/**
 * Neural Core Module - Barrel Export
 *
 * Central export point for core neural network functionality
 */

// Export types from network module
export type {
  ActivationFunctions as ActivationFunction,
  AgentNetworkConfig,
  AgentNeuralManager,
  CascadeConfig,
  CognitiveState,
  LayerConfig,
  NetworkConfig,
  NetworkInfo,
  TrainingConfig,
  TrainingDataConfig,
  TrainingResult,
} from './network';
// Core neural components (explicit exports to avoid conflicts)
// Export from network module
export {
  ACTIVATION_FUNCTIONS,
  ActivationFunctions,
  CascadeTrainer,
  COGNITIVE_PATTERNS,
  createAgentNeuralManager,
  createNeuralNetwork,
  createTrainer,
  initializeNeuralWasm,
  NeuralNetwork,
  NeuralTrainer,
  TRAINING_ALGORITHMS,
} from './network';
// Export from neural module (avoid duplicates with neural-core)
// export { Neural, NeuralCLI as LegacyNeuralCLI, neuralCLI } from './neural';
// Export from neural-core module (primary source)
export {
  type ModelMetadata,
  NeuralCLI,
  type NeuralConfig,
  // NeuralCore,
  neuralCLI as NeuralCoreCLI,
  PATTERN_MEMORY_CONFIG,
  type PatternData,
  type PatternType,
  type PersistenceInfo,
  type TrainingResults,
  type WeightsExport,
} from './neural-core';
// Export from neural-network module
export * from './neural-network';
export { NeuralNetwork as NeuralNetworkJS } from './neural-network';
// Neural network manager (JavaScript)
export { NeuralNetworkManager } from './neural-network-manager';

// Export from neural-network-manager module - already exported above

// Core utilities
export const NeuralCoreUtils = {
  /**
   * Get available neural network types
   */
  getNetworkTypes: (): string[] => {
    return ['feedforward', 'lstm', 'transformer', 'autoencoder', 'cnn', 'gnn'];
  },

  /**
   * Validate network configuration
   */
  validateNetworkConfig: (config: any): boolean => {
    return Boolean(config?.layers && Array.isArray(config.layers));
  },

  /**
   * Generate network ID
   */
  generateNetworkId: (type: string): string => {
    return `neural-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Calculate network complexity
   */
  calculateComplexity: (layers: number[]): number => {
    return layers.reduce((sum, neurons, index) => {
      if (index === 0) return sum;
      return sum + neurons * layers[index - 1];
    }, 0);
  },

  /**
   * Estimate training time
   */
  estimateTrainingTime: (complexity: number, dataSize: number, epochs: number): number => {
    // Simple heuristic: complexity * dataSize * epochs / processing_factor
    const processingFactor = 1000; // Adjust based on hardware
    return Math.ceil((complexity * dataSize * epochs) / processingFactor);
  },
};

// Default export
export default NeuralCoreUtils;
