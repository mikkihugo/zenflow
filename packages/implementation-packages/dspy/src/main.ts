/**
 * @fileoverview DSPy Package Main Implementation
 * 
 * Central export point for all Stanford DSPy functionality including
 * optimization algorithms, few-shot learning, and teleprompter techniques.
 */

// =============================================================================
// CORE DSPY ENGINE AND UTILITIES
// =============================================================================
export { DSPyEngine, createDSPyEngine, dspyUtils } from './core/dspy-engine';
export type { DSPyKV } from './core/dspy-engine';

// =============================================================================
// DSPY SERVICE LAYER (Foundation Integration)
// =============================================================================
export { 
  DSPyService, 
  getDSPyService, 
  initializeDSPyService
} from './core/service';

export type {
  SharedLLMService,
  SharedStorage,
  SharedLogger
} from './core/service';

// =============================================================================
// PRIMITIVES - Core DSPy building blocks
// =============================================================================
export { Example } from './primitives/example';
export { DSPyModule } from './primitives/module';
export type { DSPyModule as Module } from './primitives/module';
export type { Prediction } from './primitives/prediction';
export { SeededRNG } from './primitives/seeded-rng';

// =============================================================================
// TELEPROMPTERS - Optimization algorithms
// =============================================================================
export { Ensemble } from './teleprompters/ensemble';

// =============================================================================
// LM ADAPTERS - Language model interfaces
// =============================================================================
export { ChatAdapter } from './adapters/chat-adapter';

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
} from './interfaces/lm';

// Adapter interface types
export type {
  Adapter,
  FinetuneDataInput,
  FinetuneDataOutput,
  InferenceDataInput,
  InferenceDataOutput,
  EvaluationDataInput,
  EvaluationDataOutput
} from './interfaces/adapter';

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
  ProgressCallback
} from './interfaces/types';

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

export async function getDSPySystemAccess(config?: any): Promise<any> {
  const engine = createDSPyEngine();
  const service = await getDSPyService();
  
  return {
    createEngine: (engineConfig?: any) => createDSPyEngine(engineConfig),
    getService: () => getDSPyService(),
    initializeService: (serviceConfig?: any) => initializeDSPyService(serviceConfig),
    createModule: (signature: PredictorSignature) => new DSPyModule(signature),
    createExample: (inputs: any, outputs?: any) => new Example(inputs, outputs),
    createChatAdapter: (modelInfo: ModelInfo) => new ChatAdapter(modelInfo),
    createEnsemble: (predictors: any[]) => new Ensemble(predictors),
    optimizeModule: async (module: DSPyModule, examples: Example[], options?: CompileOptions) => {
      return engine.compile(module, examples, options);
    },
    evaluateModule: async (module: DSPyModule, examples: Example[], metrics: MetricFunction[]) => {
      return engine.evaluate(module, examples, metrics);
    },
    trainModule: async (module: DSPyModule, trainingData: TrainingData, config?: OptimizationConfig) => {
      return engine.train(module, trainingData, config);
    },
    getEngineUtils: () => dspyUtils,
    shutdown: () => service?.shutdown?.()
  };
}

export async function getDSPyEngineAccess(config?: any): Promise<any> {
  const engine = createDSPyEngine();
  return {
    create: (engineConfig?: any) => createDSPyEngine(engineConfig),
    compile: (module: DSPyModule, examples: Example[], options?: CompileOptions) => 
      engine.compile(module, examples, options),
    evaluate: (module: DSPyModule, examples: Example[], metrics: MetricFunction[]) => 
      engine.evaluate(module, examples, metrics),
    train: (module: DSPyModule, trainingData: TrainingData, config?: OptimizationConfig) => 
      engine.train(module, trainingData, config),
    optimize: (candidates: OptimizationCandidate[], config?: OptimizationConfig) => 
      engine.optimize(candidates, config),
    utils: dspyUtils
  };
}

export async function getDSPyOptimization(config?: any): Promise<any> {
  const system = await getDSPySystemAccess(config);
  return {
    optimize: (module: DSPyModule, examples: Example[], options?: CompileOptions) => 
      system.optimizeModule(module, examples, options),
    ensemble: (predictors: any[]) => system.createEnsemble(predictors),
    fewShot: (module: DSPyModule, examples: Example[], k: number = 5) => {
      // Few-shot learning implementation
      const fewShotExamples = examples.slice(0, k);
      return system.optimizeModule(module, fewShotExamples, { strategy: 'few-shot' });
    },
    bootstrap: (module: DSPyModule, examples: Example[], rounds: number = 3) => {
      // Bootstrap optimization implementation
      return system.optimizeModule(module, examples, { strategy: 'bootstrap', rounds });
    }
  };
}

export async function getDSPyML(config?: any): Promise<any> {
  const system = await getDSPySystemAccess(config);
  return {
    createModule: (signature: PredictorSignature) => system.createModule(signature),
    trainModel: (module: DSPyModule, data: TrainingData) => system.trainModule(module, data),
    evaluateModel: (module: DSPyModule, examples: Example[], metrics: MetricFunction[]) => 
      system.evaluateModule(module, examples, metrics),
    predictBatch: async (module: DSPyModule, inputs: any[]) => {
      const results = [];
      for (const input of inputs) {
        const result = await module.forward(input);
        results.push(result);
      }
      return results;
    },
    createTrainingData: (examples: Example[]) => ({
      examples,
      size: examples.length,
      validate: () => examples.every(ex => ex.inputs && ex.outputs)
    })
  };
}

export async function getDSPyTeleprompters(config?: any): Promise<any> {
  const system = await getDSPySystemAccess(config);
  return {
    ensemble: (predictors: any[]) => system.createEnsemble(predictors),
    bootstrap: (module: DSPyModule, examples: Example[]) => 
      system.optimizeModule(module, examples, { strategy: 'bootstrap' }),
    fewShot: (module: DSPyModule, examples: Example[], k?: number) => 
      system.optimizeModule(module, examples, { strategy: 'few-shot', k }),
    copro: (module: DSPyModule, examples: Example[]) => 
      system.optimizeModule(module, examples, { strategy: 'copro' }),
    miprov2: (module: DSPyModule, examples: Example[]) => 
      system.optimizeModule(module, examples, { strategy: 'miprov2' })
  };
}

// Professional DSPy system object with proper naming (matches brainSystem pattern)
export const dspySystem = {
  getAccess: getDSPySystemAccess,
  getEngine: getDSPyEngineAccess,
  getOptimization: getDSPyOptimization,
  getML: getDSPyML,
  getTeleprompters: getDSPyTeleprompters,
  createEngine: createDSPyEngine,
  createService: getDSPyService
};

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