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

export async function getDSPySystemAccess(config?: any): Promise<any> {
const { createDSPyEngine: createEngine } = await import('./core/dspy-engine');
const { getDSPyService: getService, initializeDSPyService } = await import(
'./core/service'
);
const { DSPyModule } = await import('./primitives/module');
const { Example } = await import('./primitives/example');
const { ChatAdapter } = await import('./adapters/chat-adapter');
const { Ensemble } = await import('./teleprompters/ensemble');

const engine = createEngine();
const service = await getService();

return {
createEngine: (engineConfig?: any) => createEngine(engineConfig),
getService: () => getService(),
initializeService: () => initializeDSPyService(),
createModule: (signature: any) => {
const module = new DSPyModule();
// Configure module with signature if provided
if (signature && typeof signature === 'object') {
Object.assign(module, signature);
}
return module;
},
createExample: (inputs: any, outputs?: any) => new Example(inputs, outputs),
createChatAdapter: (modelInfo: any) => new ChatAdapter(modelInfo),
createEnsemble: (predictors: any[]) => {
const ensemble = new Ensemble();
// Configure ensemble with predictors if provided
if (predictors && Array.isArray(predictors) && predictors.length > 0) {
ensemble.predictors = predictors;
}
return ensemble;
},
optimizeModule: async (module: any, examples: any[], options?: any) =>
engine.compile(module, examples, options),
evaluateModule: async (module: any, examples: any[], metrics: any[]) =>
engine.evaluate(module, examples, metrics),
trainModule: async (module: any, trainingData: any, config?: any) =>
engine.train(module, trainingData, config),
getEngineUtils: () => engine.utils || {},
shutdown: () => service?.shutdown?.(),
};
}

export async function getDSPyEngineAccess(config?: any): Promise<any> {
const { createDSPyEngine: createEngine } = await import('./core/dspy-engine');
const engine = createEngine(config);
return {
create: (engineConfig?: any) => createEngine(engineConfig),
compile: (module: any, examples: any[], options?: any) =>
engine.compile(module, examples, options),
evaluate: (module: any, examples: any[], metrics: any[]) =>
engine.evaluate(module, examples, metrics),
train: (module: any, trainingData: any, config?: any) =>
engine.train(module, trainingData, config),
optimize: (candidates: any[], config?: any) =>
engine.optimize(candidates, config),
utils: engine.utils || {},
};
}

export async function getDSPyOptimization(config?: any): Promise<any> {
const system = await getDSPySystemAccess(config);

return {
optimize: (module: any, examples: any[], options?: any) =>
system.optimizeModule(module, examples, options),
ensemble: (predictors: any[]) => system.createEnsemble(predictors),
fewShot: (module: any, examples: any[], k: number = 5) => {
// Few-shot learning implementation
const fewShotExamples = examples.slice(0, k);
return system.optimizeModule(module, fewShotExamples, {
strategy: 'few-shot',
});
},
bootstrap: (module: any, examples: any[], rounds: number = 3) =>
// Bootstrap optimization implementation
system.optimizeModule(module, examples, {
strategy: 'bootstrap',
rounds,
}),
};
}

export async function getDSPyML(config?: any): Promise<any> {
const system = await getDSPySystemAccess(config);
return {
createModule: (signature: any) => system.createModule(signature),
trainModel: (module: any, data: any) => system.trainModule(module, data),
evaluateModel: (module: any, examples: any[], metrics: any[]) =>
system.evaluateModule(module, examples, metrics),
predictBatch: async (module: any, inputs: any[]) => {
const results = [];
for (const input of inputs) {
const result = await module.forward(input);
results.push(result);
}
return results;
},
createTrainingData: (examples: any[]) => ({
examples,
size: examples.length,
validate: () => examples.every((ex) => ex.inputs && ex.outputs),
}),
};
}

export async function getDSPyTeleprompters(config?: any): Promise<any> {
const system = await getDSPySystemAccess(config);
return {
ensemble: (predictors: any[]) => system.createEnsemble(predictors),
bootstrap: (module: any, examples: any[]) =>
system.optimizeModule(module, examples, { strategy: 'bootstrap' }),
fewShot: (module: any, examples: any[], k?: number) =>
system.optimizeModule(module, examples, { strategy: 'few-shot', k }),
copro: (module: any, examples: any[]) =>
system.optimizeModule(module, examples, { strategy: 'copro' }),
miprov2: (module: any, examples: any[]) =>
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
