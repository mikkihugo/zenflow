/**
 * @fileoverview DSPy Library - Production TypeScript Implementation
 * 
 * Complete TypeScript port of Stanford DSPy algorithms with @claude-zen/foundation integration.
 * Provides sophisticated prompt optimization, few-shot learning, and teleprompter techniques
 * for production use.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @license MIT
 */

// Export simple DSPy engine with @claude-zen/foundation integration
export { DSPyEngine, createDSPyEngine, dspyUtils } from './engine';
export type { DSPyKV } from './engine';

// Export DSPy service layer for @claude-zen/foundation integration
export { 
  DSPyService, 
  getDSPyService, 
  initializeDSPyService,
  type SharedLLMService,
  type SharedStorage,
  type SharedLogger,
  type SharedConfig
} from './dspy-service';

// Export all DSPy types
export type {
  DSPyConfig,
  DSPyExample,
  DSPyProgram,
  DSPyOptimizationResult,
  DSPyPromptVariation,
  DSPyMetrics,
  DSPyOptimizationStrategy,
  DSPyPattern,
  DSPyTaskConfig,
  DSPyEngineStats,
  DSPyStorage,
  DSPyExampleGenerator,
  DSPyPromptEvaluator,
  DSPyConfigValidator
} from './types';

// Export Stanford DSPy algorithms (production-ready)
export {
  // Core classes
  Teleprompter,
  LabeledFewShot,
  BootstrapFewShot,
  MIPROv2,
  Ensemble,
  DSPyProgramBuilder,
  
  // Utility functions
  createProgram,
  createSignature,
  createExamples,
  
  // Types
  type Example,
  type Signature,
  type Predictor,
  type Module,
  type TraceStep,
  type Prediction
} from './stanford-dspy';

// Export DSPy primitives
export {
  // Core primitives
  BaseModule,
  Predictor as DSPyPredictor,
  ChainOfThought,
  ProgramOfThought,
  Retrieve,
  PredictionResult,
  
  // Primitive factories
  PredictorFactory,
  CoTFactory,
  PoTFactory,
  RetrievalFactory,
  
  // Primitive utilities
  createPrediction,
  isPrediction,
  standardizePrediction,
  createChainOfThought,
  createProgramOfThought,
  createInMemoryRetriever,
  createVectorRetriever,
  
  // Primitive types
  type Prediction,
  type Document,
  type RetrieverBackend,
  type ChainOfThoughtConfig,
  type ProgramOfThoughtConfig,
  type CodeExecutor,
  type CodeExecutionResult
} from './primitives/index.js';

// Export DSPy teleprompters
export {
  // Core teleprompters
  BootstrapFewShot as BootstrapTeleprompter,
  BootstrapFewShotWithRandomSearch,
  MiproV2Optimizer,
  GradientBasedRewardPolicyOptimizer,
  
  // Teleprompter factories and utilities
  TeleprompterFactory,
  autoSelectTeleprompter,
  TeleprompterComparison,
  
  // Teleprompter configurations
  type BootstrapConfig,
  type BootstrapRandomSearchConfig,
  type MiproV2Config,
  type GRPOConfig,
  type AutoRunMode,
  
  // Teleprompter constants
  TELEPROMPTER_TYPES,
  DEFAULT_BOOTSTRAP_CONFIG,
  DEFAULT_BOOTSTRAP_RS_CONFIG,
  DEFAULT_MIPRO_V2_CONFIG,
  DEFAULT_GRPO_CONFIG
} from './teleprompters/index.js';

// Export DSPy evaluation system
export {
  Evaluate,
  SemanticF1,
  f1Score,
  createEvaluate,
  EvaluationFactory,
  
  // Evaluation types
  type EvaluationResult,
  type EvaluationMetric,
  type EvaluationConfig
} from './evaluation/evaluate.js';

// Export DSPy streaming system  
export {
  streamify,
  streamingResponse,
  applySyncStreaming,
  DSPyStreamListener,
  DefaultStatusMessageProvider,
  StreamListenerFactory,
  StreamifyFactory,
  
  // Streaming types
  type StatusMessage,
  type StreamResponse,
  type StreamListener,
  type StatusMessageProvider,
  type StreamifyConfig,
  type StreamGenerator,
  type StreamifiedProgram
} from './streaming/streamify.js';

// Export advanced adapters
export {
  XMLAdapter,
  createXMLAdapter,
  XMLAdapterFactory,
  
  // Adapter types
  type XMLParseError
} from './adapters/xml-adapter.js';

// Re-export defaults
import stanfordDspyDefault from './stanford-dspy';
export { stanfordDspyDefault as stanfordDspy };

// Import the necessary functions
import { DSPyEngine, createDSPyEngine, dspyUtils } from './engine';
import { createProgram, createSignature, createExamples } from './stanford-dspy';

/**
 * Production DSPy Library
 */
export const DSPy = {
  // Simple engine for basic optimization
  Engine: {
    DSPyEngine,
    createDSPyEngine,
    utils: dspyUtils
  },
  
  // Stanford algorithms for advanced optimization
  Stanford: stanfordDspyDefault,
  
  // Utility functions
  createProgram,
  createSignature,
  createExamples
} as const;

// Default export
export default DSPy;