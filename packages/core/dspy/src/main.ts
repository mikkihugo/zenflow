/**
* @fileoverview DSPy Package Main Implementation
*
* Central export point for all Stanford DSPy functionality including
* optimization algorithms, few-shot learning, and teleprompter techniques.
*/

// =============================================================================
// LM ADAPTERS - Language model interfaces
// =============================================================================
export { ChatAdapter } from './adapters/chat-adapter';
export type { DSPyKV } from './core/dspy-engine';
// =============================================================================
// CORE DSPY ENGINE AND UTILITIES
// =============================================================================
export { createDSPyEngine, DSPyEngine, dspyUtils } from './core/dspy-engine';

export type {
SharedLLMService,
SharedLogger,
SharedStorage,
} from './core/service';
// =============================================================================
// DSPY SERVICE LAYER (Foundation Integration)
// =============================================================================
export {
DSPyService,
getDSPyService,
initializeDSPyService,
} from './core/service';
// =============================================================================
// PRIMITIVES - Core DSPy building blocks
// =============================================================================
export { Example } from './primitives/example';
export type { DSPyModule as Module } from './primitives/module';
export { DSPyModule } from './primitives/module';
export type { Prediction } from './primitives/prediction';
export { SeededRNG } from './primitives/seeded-rng';
// =============================================================================
// TELEPROMPTERS - Optimization algorithms
// =============================================================================
export { Ensemble } from './teleprompters/ensemble';

// =============================================================================
// PROMPT GENERATION - Intelligent prompt creation and optimization
// =============================================================================
export { IntelligentPromptGenerator } from './intelligent-prompt-generator';
export type { 
  IntelligentPrompt, 
  CodingStandardsConfig, 
  ProjectContext,
  DevelopmentPhase 
} from './intelligent-prompt-generator';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
// Export core types if they exist
// export type { CoreTypes} from './types/core-types.js';

// Adapter interface types
export type {
Adapter,
EvaluationDataInput,
EvaluationDataOutput,
FinetuneDataInput,
FinetuneDataOutput,
InferenceDataInput,
InferenceDataOutput,
} from './interfaces/adapter';
// LM interface types
export type {
GenerationOptions,
LMInterface,
ModelInfo,
ModelUsage,
} from './interfaces/lm';

// Core type exports
export type {
CacheEntry,
CompileOptions,
EvaluationResult,
FieldSpec,
Hyperparameter,
MetricFunction,
ModelConfig,
OptimizationCandidate,
OptimizationConfig,
Predictor,
PredictorSignature,
ProgressCallback,
TrainingData,
} from './interfaces/types';

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

// Interface for DSPy configuration
interface DSPyConfig {
  engineConfig?: Record<string, unknown>;
  serviceConfig?: Record<string, unknown>;
  [key: string]: unknown;
}

// Interface for DSPy system access result
interface DSPySystemAccess {
  createEngine: (engineConfig?: Record<string, unknown>) => unknown;
  getService: () => Promise<unknown>;
  initializeService: () => Promise<unknown>;
  dspyModule: unknown;
  example: unknown;
  chatAdapter: unknown;
  ensemble: unknown;
  optimizeModule: (module: unknown, config?: unknown, examples?: unknown) => Promise<unknown>;
  evaluateModule: (module: unknown, config?: unknown, testSet?: unknown) => Promise<unknown>;
  trainModule: (module: unknown, trainSet?: unknown, config?: unknown) => Promise<unknown>;
  [key: string]: unknown;
}

export async function getDSPySystemAccess(config?: DSPyConfig): Promise<DSPySystemAccess> {
  // Config parameter available for future use
  void config;
const { createDSPyEngine: createEngine } = await import('./core/dspy-engine');
const { getDSPyService: getService, initializeDSPyService } = await import(
'./core/service'
);
const { DSPyModule: dspyModule } = await import('./primitives/module');
const { Example: example } = await import('./primitives/example');
const { ChatAdapter: chatAdapter } = await import('./adapters/chat-adapter');
const { Ensemble: ensemble } = await import('./teleprompters/ensemble');

const engine = createEngine();
const service = await getService();

return {
createEngine: (engineConfig?: Record<string, unknown>) => createEngine(engineConfig),
getService: () => getService(),
initializeService: () => initializeDSPyService(),
dspyModule,
example,
chatAdapter,
ensemble,
createModule: (signature?: Record<string, unknown>) => {
const module = new dspyModule();
// Configure module with signature if provided
if (signature && typeof signature === 'object') {
Object.assign(module, signature);
}
return module;
},
createExample: (inputs: Record<string, unknown>, outputs?: Record<string, unknown>) => new example(inputs, outputs),
createChatAdapter: (modelInfo: Record<string, unknown>) => new chatAdapter(modelInfo),
createEnsemble: (predictors: unknown[]) => {
const ensembleInstance = new ensemble();
// Configure ensemble with predictors if provided
if (predictors && Array.isArray(predictors) && predictors.length > 0) {
ensembleInstance.predictors = predictors;
}
return ensembleInstance;
},
optimizeModule: async (module: unknown, examples: unknown[], options?: Record<string, unknown>) =>
await engine.compile(module, examples, options),
evaluateModule: async (module: unknown, examples: unknown[], metrics: unknown[]) =>
await engine.evaluate(module, examples, metrics),
trainModule: async (module: unknown, trainingData: unknown, config?: Record<string, unknown>) =>
await engine.train(module, trainingData, config),
getEngineUtils: () => engine.utils || {},
shutdown: () => service?.shutdown?.(),
};
}

export async function getDSPyEngineAccess(config?: Record<string, unknown>): Promise<Record<string, unknown>> {
const { createDSPyEngine: createEngine } = await import('./core/dspy-engine');
const engine = createEngine(config);
return {
create: (engineConfig?: Record<string, unknown>) => createEngine(engineConfig),
compile: (module: unknown, examples: unknown[], options?: Record<string, unknown>) =>
engine.compile(module, examples, options),
evaluate: (module: unknown, examples: unknown[], metrics: unknown[]) =>
engine.evaluate(module, examples, metrics),
train: (module: unknown, trainingData: unknown, config?: Record<string, unknown>) =>
engine.train(module, trainingData, config),
optimize: (candidates: unknown[], config?: Record<string, unknown>) =>
engine.optimize(candidates, config),
utils: engine.utils || {},
};
}

export async function getDSPyOptimization(config?: Record<string, unknown>): Promise<Record<string, unknown>> {
const system = await getDSPySystemAccess(config);

return {
optimize: (module: unknown, examples: unknown[], options?: Record<string, unknown>) =>
system.optimizeModule(module, examples, options),
ensemble: (predictors: unknown[]) => system.createEnsemble(predictors),
fewShot: (module: unknown, examples: unknown[], k: number = 5) => {
// Few-shot learning implementation
const fewShotExamples = (examples as unknown[]).slice(0, k);
return system.optimizeModule(module, fewShotExamples, {
strategy: 'few-shot',
});
},
bootstrap: (module: unknown, examples: unknown[], rounds: number = 3) =>
// Bootstrap optimization implementation
system.optimizeModule(module, examples, {
strategy: 'bootstrap',
rounds,
}),
};
}

export async function getDSPyML(config?: Record<string, unknown>): Promise<Record<string, unknown>> {
const system = await getDSPySystemAccess(config);
return {
createModule: (signature: unknown) => system.createModule(signature),
trainModel: (module: unknown, data: unknown) => system.trainModule(module, data),
evaluateModel: (module: unknown, examples: unknown[], metrics: unknown[]) =>
system.evaluateModule(module, examples, metrics),
predictBatch: async (module: unknown, inputs: unknown[]) => {
const results = [];
for (const input of inputs) {
const result = await (module as { forward: (input: unknown) => Promise<unknown> }).forward(input);
results.push(result);
}
return results;
},
createTrainingData: (examples: unknown[]) => ({
examples,
size: examples.length,
validate: () => Array.isArray(examples) && examples.every((ex: unknown) => 
typeof ex === 'object' && ex !== null && 
'inputs' in ex && 'outputs' in ex
),
}),
};
}

export async function getDSPyTeleprompters(config?: Record<string, unknown>): Promise<Record<string, unknown>> {
const system = await getDSPySystemAccess(config);
return {
ensemble: (predictors: unknown[]) => system.createEnsemble(predictors),
bootstrap: (module: unknown, examples: unknown[]) =>
system.optimizeModule(module, examples, { strategy: 'bootstrap' }),
fewShot: (module: unknown, examples: unknown[], k?: number) =>
system.optimizeModule(module, examples, { strategy: 'few-shot', k }),
copro: (module: unknown, examples: unknown[]) =>
system.optimizeModule(module, examples, { strategy: 'copro' }),
miprov2: (module: unknown, examples: unknown[]) =>
system.optimizeModule(module, examples, { strategy: 'miprov2' }),
};
}

// Professional DSPy system object with proper naming (matches brainSystem pattern)
export const dspySystem = {
getAccess: getDSPySystemAccess,
getEngine: getDSPyEngineAccess,
getOptimization: getDSPyOptimization,
getML: getDSPyML,
getTeleprompters: getDSPyTeleprompters,
createEngine: () =>
import('./core/dspy-engine').then((m) => m.createDSPyEngine()),
createService: () => import('./core/service').then((m) => m.getDSPyService()),
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
'Adapters - Language model interfaces',
],
} as const;
