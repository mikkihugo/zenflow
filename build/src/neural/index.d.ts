/**
 * Neural Domain - Main Export Module
 *
 * @file Central export point for all neural network functionality including types,
 * models, training, and cognitive patterns. This module serves as the single source
 * of truth for all neural operations and type definitions.
 *
 * Following domain architecture standard with consolidated types.
 */
export * from './types.ts';
/**
 * @deprecated Legacy export structure - use domain types instead
 * @file Neural module legacy exports.
 */
export type { ModelMetadata, ModelStatus, NeuralModel, NeuralModelType, } from '../types/shared-types.ts';
export { NeuralAgent } from './agents/index.ts';
export { NeuralCoreCLI, NeuralNetwork as CoreNeuralNetwork, NeuralNetworkManager, } from './core/index.ts';
export { createDefaultDSPyWrapper, createDSPyWrapper, DSPyWrapperImpl, default as DSPyWrapper, getSingletonDSPyWrapper, } from './dspy-wrapper.ts';
export { NEURAL_PRESETS as NeuralPresets } from './models/index.ts';
export { NeuralBridge, NeuralBridge as default } from './neural-bridge.ts';
export { createNeuralWASM } from './public-api.ts';
export type { DSPyConfig, DSPyExample, DSPyExecutionResult, DSPyHealthCheck, DSPyOptimizationConfig, DSPyOptimizationResult, DSPyPerformanceMetrics, DSPyProgram, DSPyProgramMetadata, DSPyWrapper as DSPyWrapperInterface, } from './types.ts';
export * from './types.ts';
export { createValidationError, DEFAULT_DSPY_CONFIG, DEFAULT_OPTIMIZATION_CONFIG, DSPY_LIMITS, DSPyAPIError, DSPyBaseError, DSPyConfigurationError, DSPyExecutionError, DSPyOptimizationError, isDSPyConfig, isDSPyExample, isDSPyOptimizationConfig, isDSPyProgram, sanitizeInput, validateDSPyConfig, validateSignature, } from './types.ts';
//# sourceMappingURL=index.d.ts.map