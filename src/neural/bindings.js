import { createRequire } from 'module';
import { Logger } from '../utils/logger.js';
// Import the REAL neural integration
import { loadRealNeuralBindings } from './real-fann-integration.js';

// Main loadNeuralBindings function - unified entry point
export async function loadNeuralBindings() {
    try {
        // Try to load REAL ruv-FANN integration first
        const realBindings = await loadRealNeuralBindings();
        if (realBindings) {
            console.log('✅ Using REAL ruv-FANN neural bindings');
            return realBindings;
        }
    } catch (error) {
        console.warn('⚠️ Real neural bindings failed, falling back to stub:', error.message);
    }
    
    // Fallback to original stub loader
    return bindingsLoader.load();
}

/**
 * RuvFannBindingsLoader - Handles loading of native, WASM, or stub neural bindings
 * @class
 */
class RuvFannBindingsLoader {
    /**
     * Creates a new RuvFannBindingsLoader
     * @constructor
     */
    constructor() {
        /** @type {import('../utils/logger.js').Logger} Logger instance */
        this.logger = new Logger('RuvFannBindings');
        /** @type {RuvFannBindings|null} Loaded bindings instance */
        this.bindings = null;
        /** @type {boolean} Whether load has been attempted */
        this.loadAttempted = false;
    }

    /**
     * Load neural bindings (native, WASM, or stub)
     * @returns {Promise<RuvFannBindings|null>} The loaded bindings or null
     */
    async load() {
        if (this.loadAttempted) {
            return this.bindings;
        }

        this.loadAttempted = true;

        try {
            // First, try to load the native NAPI bindings
            const bindings = await this.loadNativeBindings();
            if (bindings) {
                this.logger.info('Native ruv-FANN bindings loaded successfully');
                this.bindings = bindings;
                return bindings;
            }

            // Fallback to WASM bindings
            const wasmBindings = await this.loadWasmBindings();
            if (wasmBindings) {
                this.logger.info('WASM ruv-FANN bindings loaded successfully');
                this.bindings = wasmBindings;
                return wasmBindings;
            }

            // If both fail, create a stub implementation
            this.logger.warn('Neither native nor WASM bindings available, creating stub implementation');
            this.bindings = this.createStubBindings();
            return this.bindings;

        } catch (error) {
            this.logger.error('Failed to load ruv-FANN bindings:', error);
            this.bindings = this.createStubBindings();
            return this.bindings;
        }
    }

    /**
     * Attempt to load native NAPI bindings
     * @private
     * @returns {Promise<RuvFannBindings|null>} Native bindings or null if unavailable
     */
    async loadNativeBindings() {
        try {
            // Try to require the native addon
            const require = createRequire(import.meta.url);
            
            // Check if the binding file exists
            const possiblePaths = [
                '../ruv-FANN/target/release/ruv_fann.node',
                './ruv-FANN/target/release/ruv_fann.node',
                './native/ruv_fann.node',
                'ruv-fann-bindings'
            ];

            for (const path of possiblePaths) {
                try {
                    const binding = require(path);
                    if (binding && typeof binding.loadModel === 'function') {
                        this.logger.info(`Native bindings loaded from: ${path}`);
                        return this.wrapNativeBindings(binding);
                    }
                } catch (err) {
                    // Try next path
                }
            }

            return null;
        } catch (error) {
            this.logger.debug('Native bindings not available:', error.message);
            return null;
        }
    }

    /**
     * Attempt to load WASM bindings
     * @private
     * @returns {Promise<RuvFannBindings|null>} WASM bindings or null if unavailable
     */
    async loadWasmBindings() {
        try {
            // Try to load WASM module
            const wasmPaths = [
                '../ruv-FANN/pkg/ruv_fann.js',
                './ruv-FANN/pkg/ruv_fann.js',
                './wasm/ruv_fann.js'
            ];

            for (const path of wasmPaths) {
                try {
                    const wasmModule = await import(path);
                    await wasmModule.default(); // Initialize WASM
                    
                    if (wasmModule.loadModel) {
                        this.logger.info(`WASM bindings loaded from: ${path}`);
                        return this.wrapWasmBindings(wasmModule);
                    }
                } catch (err) {
                    // Try next path
                }
            }

            return null;
        } catch (error) {
            this.logger.debug('WASM bindings not available:', error.message);
            return null;
        }
    }

    /**
     * Wrap native bindings with standardized interface
     * @private
     * @param {any} binding - Native binding object
     * @returns {RuvFannBindings} Wrapped bindings
     */
    wrapNativeBindings(binding) {
        return {
            loadModel: async (path) => {
                try {
                    return binding.loadModel(path);
                } catch (error) {
                    this.logger.error('Native loadModel failed:', error);
                    return false;
                }
            },

            unloadModel: async (modelName) => {
                if (binding.unloadModel) {
                    return binding.unloadModel(modelName);
                }
            },

            inference: async (prompt, options = {}) => {
                try {
                    return binding.inference(prompt, options);
                } catch (error) {
                    this.logger.error('Native inference failed:', error);
                    throw error;
                }
            },

            listModels: () => {
                try {
                    return binding.listModels() || [];
                } catch (error) {
                    this.logger.error('Native listModels failed:', error);
                    return [];
                }
            },

            isModelLoaded: (modelName) => {
                try {
                    return binding.isModelLoaded(modelName);
                } catch (error) {
                    return false;
                }
            },

            batchInference: binding.batchInference ? async (prompts, options = {}) => {
                return binding.batchInference(prompts, options);
            } : undefined,

            finetune: binding.finetune ? async (modelName, trainingData) => {
                return binding.finetune(modelName, trainingData);
            } : undefined,

            benchmark: binding.benchmark ? async (modelName) => {
                return binding.benchmark(modelName);
            } : undefined,

            enableGPU: binding.enableGPU ? async () => {
                return binding.enableGPU();
            } : undefined,

            getGPUInfo: binding.getGPUInfo ? () => {
                return binding.getGPUInfo();
            } : undefined,

            getMemoryUsage: binding.getMemoryUsage ? () => {
                return binding.getMemoryUsage();
            } : undefined,

            freeMemory: binding.freeMemory ? async () => {
                return binding.freeMemory();
            } : undefined
        };
    }

    /**
     * Wrap WASM bindings with standardized interface
     * @private
     * @param {any} wasmModule - WASM module object
     * @returns {RuvFannBindings} Wrapped bindings
     */
    wrapWasmBindings(wasmModule) {
        return {
            loadModel: async (path) => {
                try {
                    return wasmModule.load_model(path);
                } catch (error) {
                    this.logger.error('WASM loadModel failed:', error);
                    return false;
                }
            },

            inference: async (prompt, options = {}) => {
                try {
                    return wasmModule.inference(prompt, JSON.stringify(options));
                } catch (error) {
                    this.logger.error('WASM inference failed:', error);
                    throw error;
                }
            },

            listModels: () => {
                try {
                    const result = wasmModule.list_models();
                    return JSON.parse(result);
                } catch (error) {
                    this.logger.error('WASM listModels failed:', error);
                    return [];
                }
            },

            isModelLoaded: (modelName) => {
                try {
                    return wasmModule.is_model_loaded(modelName);
                } catch (error) {
                    return false;
                }
            }
        };
    }

    /**
     * Create stub bindings for development mode
     * @private
     * @returns {RuvFannBindings} Stub bindings implementation
     */
    createStubBindings() {
        this.logger.info('Creating stub bindings for development mode');
        
        return {
            loadModel: async (path) => {
                this.logger.debug(`Stub: Loading model from ${path}`);
                // Simulate loading time
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
                return true;
            },

            inference: async (prompt, options = {}) => {
                this.logger.debug(`Stub: Inference for prompt: ${prompt.substring(0, 50)}...`);
                
                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
                
                // Generate a realistic stub response based on prompt
                if (prompt.includes('function') || prompt.includes('def ')) {
                    return `function generated_${Date.now()}() {\n  // Generated by ruv-FANN stub\n  return "Hello, World!";\n}`;
                } else if (prompt.includes('class') || prompt.includes('interface')) {
                    return `interface Generated {\n  id: string;\n  name: string;\n  created: Date;\n}`;
                } else if (prompt.includes('test') || prompt.includes('spec')) {
                    return `test('generated test', () => {\n  expect(true).toBe(true);\n});`;
                } else {
                    return `// Generated response for: ${prompt.substring(0, 30)}...\n// This is a stub implementation`;
                }
            },

            listModels: () => {
                return [
                    'code-completion-base',
                    'bug-detector-v2',
                    'refactor-assistant',
                    'test-generator-pro',
                    'docs-writer'
                ];
            },

            isModelLoaded: (modelName) => {
                // Simulate some models being loaded
                const loadedModels = ['code-completion-base', 'bug-detector-v2'];
                return loadedModels.includes(modelName);
            },

            batchInference: async (prompts, options = {}) => {
                const results = [];
                for (const prompt of prompts) {
                    results.push(await this.bindings.inference(prompt, options));
                }
                return results;
            },

            benchmark: async (modelName) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return {
                    modelName,
                    averageInferenceTime: 150 + Math.random() * 100,
                    tokensPerSecond: 800 + Math.random() * 400,
                    memoryUsage: 100 + Math.random() * 200,
                    accuracy: 0.85 + Math.random() * 0.1
                };
            },

            enableGPU: async () => {
                this.logger.debug('Stub: GPU acceleration not available');
                return false;
            },

            getGPUInfo: () => {
                return {
                    available: false,
                    deviceName: 'Stub GPU',
                    memoryTotal: 0,
                    memoryUsed: 0
                };
            },

            getMemoryUsage: () => {
                return {
                    totalAllocated: 512,
                    totalUsed: 256,
                    modelMemory: {
                        'code-completion-base': 150,
                        'bug-detector-v2': 106
                    }
                };
            },

            freeMemory: async () => {
                this.logger.debug('Stub: Memory freed');
            }
        };
    }
}

// Singleton instance
const bindingsLoader = new RuvFannBindingsLoader();

/**
 * Load neural bindings (singleton pattern) - internal helper
 * @returns {Promise<RuvFannBindings|null>} The loaded neural bindings
 * @private
 */
async function loadNeuralBindingsFromLoader() {
    return bindingsLoader.load();
}

// Export the class name as default
export default RuvFannBindingsLoader;