/**
 * @fileoverview DSPy Package Main Implementation
 *
 * Central export point for all Stanford DSPy functionality including
 * optimization algorithms, few-shot learning, and teleprompter techniques.
 */
export { DSPyEngine, createDSPyEngine, dspyUtils } from './core/dspy-engine.js';
export type { DSPyKV } from './core/dspy-engine.js';
export { DSPyService, getDSPyService, initializeDSPyService } from './core/service.js';
export type { SharedLLMService, SharedStorage, SharedLogger } from './core/service.js';
export { Example } from './primitives/example.js';
export { DSPyModule } from './primitives/module';
export type { DSPyModule as Module } from './primitives/module';
export type { Prediction } from './primitives/prediction.js';
export { SeededRNG } from './primitives/seeded-rng.js';
export { Ensemble } from './teleprompters/ensemble.js';
export { ChatAdapter } from './adapters/chat-adapter.js';
export type { LMInterface, GenerationOptions, ModelInfo, ModelUsage } from './interfaces/lm.js';
export type { Adapter, FinetuneDataInput, FinetuneDataOutput, InferenceDataInput, InferenceDataOutput, EvaluationDataInput, EvaluationDataOutput } from './interfaces/adapter.js';
export type { MetricFunction, CompileOptions, PredictorSignature, FieldSpec, Predictor, TrainingData, EvaluationResult, OptimizationCandidate, Hyperparameter, OptimizationConfig, ModelConfig, CacheEntry, ProgressCallback, Logger } from './interfaces/types.js';
export declare function getDSPySystemAccess(config?: any): Promise<any>;
export declare function getDSPyEngineAccess(config?: any): Promise<any>;
export declare function getDSPyOptimization(config?: any): Promise<any>;
export declare function getDSPyML(config?: any): Promise<any>;
export declare function getDSPyTeleprompters(config?: any): Promise<any>;
export declare const dspySystem: {
    getAccess: typeof getDSPySystemAccess;
    getEngine: typeof getDSPyEngineAccess;
    getOptimization: typeof getDSPyOptimization;
    getML: typeof getDSPyML;
    getTeleprompters: typeof getDSPyTeleprompters;
    createEngine: any;
    createService: any;
};
export declare const DSPY_MAIN_INFO: {
    readonly version: "2.0.0";
    readonly description: "DSPy package main implementation entry point";
    readonly components: readonly ["DSPyEngine - Core optimization engine", "DSPyService - Foundation integration layer", "Primitives - Example, Module, Prediction building blocks", "Teleprompters - Optimization algorithms (Ensemble)", "Adapters - Language model interfaces"];
};
//# sourceMappingURL=main.d.ts.map