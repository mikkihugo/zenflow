/**
 * Neural Types - Barrel Export.
 *
 * Central export point for all neural system types and utilities.
 */

// DSPy types and utilities (complete export)
/**
 * @file types module exports
 */


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
  DSPyWrapper,
} from './dspy-types';
// Re-export everything from dspy-types for convenience
export * from './dspy-types';
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
} from './dspy-types';
// WASM types
export type {
  ActivationFunction,
  BenchmarkResult,
  MemoryUsage,
  NetworkConfig,
  OptimizerType,
  RegularizationConfig,
  TrainingData,
  TrainingResult,
  WASMBenchmarkResult,
  WASMError,
  WASMModelDefinition,
  WASMNeuralAccelerator,
  WASMNeuralConfig,
  WASMOptimizationOptions,
  WASMPerformanceMetrics,
  WASMPredictionInput,
  WASMPredictionOutput,
  WASMTrainingData,
} from './wasm-types';
export * from './wasm-types';
