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