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
} from '../types/shared-types.js';
// Neural agents
export * from './agents/index.js';
// Neural coordination
export * from './coordination/index.js';
// Core neural components
export * from './core/index.js';
// Neural models and presets
export * from './models/index.js';
// Neural Bridge (main interface)
export * from './neural-bridge.js';
export { NeuralBridge as default } from './neural-bridge.js';
// WASM integration
export * from './wasm/index.js';
