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
} from '../types/shared-types.ts';
// Neural agents
export * from './agents/index.ts';
// Neural coordination
export * from './coordination/index.ts';
// Core neural components
export * from './core/index.ts';
// Neural models and presets
export * from './models/index.ts';
// Neural Bridge (main interface)
export * from './neural-bridge.ts';
export { NeuralBridge as default } from './neural-bridge.ts';
// WASM integration
export * from './wasm/index.ts';
