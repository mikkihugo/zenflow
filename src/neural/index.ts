/**
 * Neural Module - Barrel Export
 *
 * Central export point for neural network functionality
 */

// Types (re-export shared types for convenience)
export type {
  ModelMetadata,
  ModelStatus,
  NeuralModel,
  NeuralModelType,
} from '../types/shared-types';
// Neural agents
export { NeuralAgent } from './agents/index';
// Neural coordination (exclude to avoid conflicts)
// export * from './coordination/index';
// Core neural components (specific exports to avoid conflicts)
export {
  // Neural, // Not available in core/index
  // NeuralCore, // Not available in core/index  
  NeuralCoreCLI,
  NeuralNetwork as CoreNeuralNetwork,
  NeuralNetworkManager,
} from './core/index';
// Neural models and presets
export { NEURAL_PRESETS as NeuralPresets } from './models/index';
// Neural Bridge (main interface)
export { NeuralBridge, NeuralBridge as default } from './neural-bridge';
// Public API for external access
// export { createNeuralNetwork, initializeWASM } from './public-api'; // TODO: Fix public-api exports
export { createNeuralWASM } from './public-api';
