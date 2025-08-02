/**
 * Neural Core Module - Barrel Export
 *
 * Central export point for core neural network functionality
 */

export * from './network.js';
export * from './neural.js';
// Core neural components
export * from './neural-core.js';
export * from './neural-network.js';
// Neural network manager (JavaScript)
export * from './neural-network-manager.js';

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
    return Boolean(config && config.layers && Array.isArray(config.layers));
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
