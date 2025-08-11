/**
 * Neural Domain - Main Export Module
 *
 * @file Central export point for all neural network functionality including types,
 * models, training, and cognitive patterns. This module serves as the single source
 * of truth for all neural operations and type definitions.
 *
 * Following domain architecture standard with consolidated types.
 */
// Export all neural types (Single Source of Truth)
export * from './types.ts';
// Neural agents
export { NeuralAgent } from './agents/index.ts';
// Neural coordination (exclude to avoid conflicts)
// export * from './coordination/index.ts';
// Core neural components (specific exports to avoid conflicts)
export { 
// Neural, // Not available in core/index
// NeuralCore, // Not available in core/index
NeuralCoreCLI, NeuralNetwork as CoreNeuralNetwork, NeuralNetworkManager, } from './core/index.ts';
// DSPy wrapper implementation and factory functions
export { createDefaultDSPyWrapper, createDSPyWrapper, DSPyWrapperImpl, default as DSPyWrapper, getSingletonDSPyWrapper, } from './dspy-wrapper.ts';
// Neural models and presets
export { NEURAL_PRESETS as NeuralPresets } from './models/index.ts';
// Neural Bridge (main interface)
export { NeuralBridge, NeuralBridge as default } from './neural-bridge.ts';
// Public API for external access
// export { createNeuralNetwork, initializeWASM } from './public-api.ts'; // TODO: Fix public-api exports
export { createNeuralWASM } from './public-api.ts';
// Types barrel export
export * from './types.ts';
export { createValidationError, DEFAULT_DSPY_CONFIG, DEFAULT_OPTIMIZATION_CONFIG, DSPY_LIMITS, DSPyAPIError, DSPyBaseError, DSPyConfigurationError, DSPyExecutionError, DSPyOptimizationError, isDSPyConfig, isDSPyExample, isDSPyOptimizationConfig, isDSPyProgram, sanitizeInput, validateDSPyConfig, validateSignature, } from './types.ts';
