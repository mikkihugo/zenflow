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
export * from './agents/index';
// Neural coordination
export * from './coordination/index';
// Core neural components
export * from './core/index';
// Neural models and presets
export * from './models/index';
// Neural Bridge (main interface)
export * from './neural-bridge';
export { NeuralBridge as default } from './neural-bridge';
// WASM integration
export * from './wasm/index';
