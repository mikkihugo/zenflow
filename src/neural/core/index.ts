/**
 * Neural Core Module - Barrel Export
 *
 * Central export point for core neural network functionality
 */

// Core neural components (explicit exports to avoid conflicts)
export { NeuralNetwork } from './network';
export { ActivationFunction, LayerType } from './network';
export { NeuralCore } from './neural-core';
export { neuralCLI as NeuralCoreCLI } from './neural-core'; // Renamed to avoid conflict
export { Neural } from './neural';
export { NeuralCLI as LegacyNeuralCLI } from './neural'; // Renamed to avoid conflict  
export { NeuralNetworkJS } from './neural-network';
// Neural network manager (JavaScript)
export { NeuralNetworkManager } from './neural-network-manager';

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
