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
// =============================================================================
// DSPY SERVICE LAYER (Foundation Integration)
// =============================================================================
export { DSPyService, getDSPyService, initializeDSPyService } from './core/service.js';
// =============================================================================
// PRIMITIVES - Core DSPy building blocks
// =============================================================================
export { Example } from './primitives/example.js';
export { DSPyModule } from './primitives/module';
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
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================
export async function getDSPySystemAccess(config) {
    const engine = createDSPyEngine();
    const service = await getDSPyService();
    return {
        createEngine: (engineConfig) => createDSPyEngine(engineConfig),
        getService: () => getDSPyService(),
        initializeService: (serviceConfig) => initializeDSPyService(serviceConfig),
        createModule: (signature) => new DSPyModule(signature),
        createExample: (inputs, outputs) => new Example(inputs, outputs),
        createChatAdapter: (modelInfo) => new ChatAdapter(modelInfo),
        createEnsemble: (predictors) => new Ensemble(predictors),
        optimizeModule: async (module, examples, options) => {
            return engine.compile(module, examples, options);
        },
        evaluateModule: async (module, examples, metrics) => {
            return engine.evaluate(module, examples, metrics);
        },
        trainModule: async (module, trainingData, config) => {
            return engine.train(module, trainingData, config);
        },
        getEngineUtils: () => dspyUtils,
        shutdown: () => service?.shutdown?.()
    };
}
export async function getDSPyEngineAccess(config) {
    const engine = createDSPyEngine();
    return {
        create: (engineConfig) => createDSPyEngine(engineConfig),
        compile: (module, examples, options) => engine.compile(module, examples, options),
        evaluate: (module, examples, metrics) => engine.evaluate(module, examples, metrics),
        train: (module, trainingData, config) => engine.train(module, trainingData, config),
        optimize: (candidates, config) => engine.optimize(candidates, config),
        utils: dspyUtils
    };
}
export async function getDSPyOptimization(config) {
    const system = await getDSPySystemAccess(config);
    return {
        optimize: (module, examples, options) => system.optimizeModule(module, examples, options),
        ensemble: (predictors) => system.createEnsemble(predictors),
        fewShot: (module, examples, k = 5) => {
            // Few-shot learning implementation
            const fewShotExamples = examples.slice(0, k);
            return system.optimizeModule(module, fewShotExamples, { strategy: 'few-shot' });
        },
        bootstrap: (module, examples, rounds = 3) => {
            // Bootstrap optimization implementation
            return system.optimizeModule(module, examples, { strategy: 'bootstrap', rounds });
        }
    };
}
export async function getDSPyML(config) {
    const system = await getDSPySystemAccess(config);
    return {
        createModule: (signature) => system.createModule(signature),
        trainModel: (module, data) => system.trainModule(module, data),
        evaluateModel: (module, examples, metrics) => system.evaluateModule(module, examples, metrics),
        predictBatch: async (module, inputs) => {
            const results = [];
            for (const input of inputs) {
                const result = await module.forward(input);
                results.push(result);
            }
            return results;
        },
        createTrainingData: (examples) => ({
            examples,
            size: examples.length,
            validate: () => examples.every(ex => ex.inputs && ex.outputs)
        })
    };
}
export async function getDSPyTeleprompters(config) {
    const system = await getDSPySystemAccess(config);
    return {
        ensemble: (predictors) => system.createEnsemble(predictors),
        bootstrap: (module, examples) => system.optimizeModule(module, examples, { strategy: 'bootstrap' }),
        fewShot: (module, examples, k) => system.optimizeModule(module, examples, { strategy: 'few-shot', k }),
        copro: (module, examples) => system.optimizeModule(module, examples, { strategy: 'copro' }),
        miprov2: (module, examples) => system.optimizeModule(module, examples, { strategy: 'miprov2' })
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
};
