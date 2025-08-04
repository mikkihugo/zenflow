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
export { NeuralCore, NeuralCoreCLI, Neural, NeuralNetworkManager } from './core/index';
export { NeuralNetwork as CoreNeuralNetwork } from './core/index';
// Neural models and presets
export { NeuralPresets } from './models/index';
// Neural Bridge (main interface)
export { NeuralBridge } from './neural-bridge';
export { NeuralBridge as default } from './neural-bridge';
// Public API for external access
export { createNeuralNetwork, initializeWASM } from './public-api';
