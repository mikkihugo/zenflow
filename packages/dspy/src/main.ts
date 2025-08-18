/**
 * @fileoverview DSPy Package Main Implementation
 * 
 * Central export point for all Stanford DSPy functionality including
 * optimization algorithms, few-shot learning, and teleprompter techniques.
 */

// =============================================================================
// CORE DSPY ENGINE AND UTILITIES
// =============================================================================
export { DSPyEngine, createDSPyEngine, dspyUtils } from './core/dspy-engine.js';
export type { DSPyKV } from './core/dspy-engine.js';

// =============================================================================
// DSPY SERVICE LAYER (Foundation Integration)
// =============================================================================
export { 
  DSPyService, 
  getDSPyService, 
  initializeDSPyService
} from './core/service.js';

export type {
  SharedLLMService,
  SharedStorage,
  SharedLogger
} from './core/service.js';

// =============================================================================
// PRIMITIVES - Core DSPy building blocks
// =============================================================================
export { Example } from './primitives/example.js';
export { DSPyModule } from './primitives/module';
export type { DSPyModule as Module } from './primitives/module';
export type { Prediction } from './primitives/prediction.js';
export { SeededRNG } from './primitives/seeded-rng.js';

// =============================================================================
// TELEPROMPTERS - Optimization algorithms
// =============================================================================
export { Ensemble } from './teleprompters/ensemble.js';

// =============================================================================
// LM ADAPTERS - Language model interfaces
// =============================================================================
export { ChatAdapter } from './adapters/chat-adapter.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
// Export core types if they exist
// export type { CoreTypes } from './types/core-types.js';

// LM interface types
export type {
  LMInterface,
  GenerationOptions,
  ModelInfo,
  ModelUsage
} from './interfaces/lm.js';

// Adapter interface types
export type {
  Adapter,
  FinetuneDataInput,
  FinetuneDataOutput,
  InferenceDataInput,
  InferenceDataOutput,
  EvaluationDataInput,
  EvaluationDataOutput
} from './interfaces/adapter.js';

// Core type exports
export type {
  MetricFunction,
  CompileOptions,
  PredictorSignature,
  FieldSpec,
  Predictor,
  TrainingData,
  EvaluationResult,
  OptimizationCandidate,
  Hyperparameter,
  OptimizationConfig,
  ModelConfig,
  CacheEntry,
  ProgressCallback,
  Logger
} from './interfaces/types.js';

// =============================================================================
// METADATA
// =============================================================================
export const DSPY_MAIN_INFO = {
  version: '2.0.0',
  description: 'DSPy package main implementation entry point',
  components: [
    'DSPyEngine - Core optimization engine',
    'DSPyService - Foundation integration layer',
    'Primitives - Example, Module, Prediction building blocks',
    'Teleprompters - Optimization algorithms (Ensemble)',
    'Adapters - Language model interfaces'
  ]
} as const;