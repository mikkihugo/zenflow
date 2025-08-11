/**
 * Neural Types - Barrel Export.
 *
 * Central export point for all neural system types and utilities.
 */

// DSPy types and utilities (complete export)
/**
 * @file Types module exports.
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
} from './dspy-types.ts';
// Re-export everything from dspy-types for convenience
export * from './dspy-types.ts';
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
} from './dspy-types.ts';
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
} from './wasm-types.ts';
export * from './wasm-types.ts';
