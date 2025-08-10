/**
 * Neural Module - Barrel Export.
 *
 * Central export point for neural network functionality.
 */

// Types (re-export shared types for convenience)
/**
 * @file Neural module exports.
 */

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
// DSPy wrapper implementation and factory functions
export {
  createDefaultDSPyWrapper,
  createDSPyWrapper,
  DSPyWrapperImpl,
  default as DSPyWrapper,
  getSingletonDSPyWrapper,
} from './dspy-wrapper';
// Neural models and presets
export { NEURAL_PRESETS as NeuralPresets } from './models/index';
// Neural Bridge (main interface)
export { NeuralBridge, NeuralBridge as default } from './neural-bridge';
// Public API for external access
// export { createNeuralNetwork, initializeWASM } from './public-api'; // TODO: Fix public-api exports
export { createNeuralWASM } from './public-api';
// DSPy types and functionality
export type {
  DSPyConfig,
  DSPyExample,
  DSPyExecutionResult,
  DSPyHealthCheck,
  DSPyOptimizationConfig,
  DSPyOptimizationResult,
  DSPyPerformanceMetrics,
  DSPyProgram,
  DSPyProgramMetadata,
  DSPyWrapper as DSPyWrapperInterface,
} from './types';
// Types barrel export
export * from './types';
export {
  createValidationError,
  DEFAULT_DSPY_CONFIG,
  DEFAULT_OPTIMIZATION_CONFIG,
  DSPY_LIMITS,
  DSPyAPIError,
  DSPyBaseError,
  DSPyConfigurationError,
  DSPyExecutionError,
  DSPyOptimizationError,
  isDSPyConfig,
  isDSPyExample,
  isDSPyOptimizationConfig,
  isDSPyProgram,
  sanitizeInput,
  validateDSPyConfig,
  validateSignature,
} from './types';
