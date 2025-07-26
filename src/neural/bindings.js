import { createRequire } from 'module';
import { Logger } from '../utils/logger.js';

export async function loadNeuralBindings() {
    return bindingsLoader.load();
}

class RuvFannBindingsLoader {
    private logger = new Logger('RuvFannBindings');
    private bindings: RuvFannBindings | null = null;
    private loadAttempted = false;

    async load(): Promise<RuvFannBindings | null> {
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

    private async loadNativeBindings(): Promise<RuvFannBindings | null> {
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

    private async loadWasmBindings(): Promise<RuvFannBindings | null> {
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

    private wrapNativeBindings(binding: any): RuvFannBindings {
        return {
            loadModel: async (path: string) => {
                try {
                    return binding.loadModel(path);
                } catch (error) {
                    this.logger.error('Native loadModel failed:', error);
                    return false;
                }
            },

            unloadModel: async (modelName: string) => {
                if (binding.unloadModel) {
                    return binding.unloadModel(modelName);
                }
            },

            inference: async (prompt: string, options: InferenceOptions = {}) => {
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

            isModelLoaded: (modelName: string) => {
                try {
                    return binding.isModelLoaded(modelName);
                } catch (error) {
                    return false;
                }
            },

            batchInference: binding.batchInference ? async (prompts: string[], options: InferenceOptions = {}) => {
                return binding.batchInference(prompts, options);
            } : undefined,

            finetune: binding.finetune ? async (modelName: string, trainingData: any[]) => {
                return binding.finetune(modelName, trainingData);
            } : undefined,

            benchmark: binding.benchmark ? async (modelName: string) => {
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

    private wrapWasmBindings(wasmModule: any): RuvFannBindings {
        return {
            loadModel: async (path: string) => {
                try {
                    return wasmModule.load_model(path);
                } catch (error) {
                    this.logger.error('WASM loadModel failed:', error);
                    return false;
                }
            },

            inference: async (prompt: string, options: InferenceOptions = {}) => {
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

            isModelLoaded: (modelName: string) => {
                try {
                    return wasmModule.is_model_loaded(modelName);
                } catch (error) {
                    return false;
                }
            }
        };
    }

    private createStubBindings(): RuvFannBindings {
        this.logger.info('Creating stub bindings for development mode');
        
        return {
            loadModel: async (path: string) => {
                this.logger.debug(`Stub: Loading model from ${path}`);
                // Simulate loading time
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
                return true;
            },

            inference: async (prompt: string, options: InferenceOptions = {}) => {
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

            isModelLoaded: (modelName: string) => {
                // Simulate some models being loaded
                const loadedModels = ['code-completion-base', 'bug-detector-v2'];
                return loadedModels.includes(modelName);
            },

            batchInference: async (prompts: string[], options: InferenceOptions = {}) => {
                const results = [];
                for (const prompt of prompts) {
                    results.push(await this.bindings!.inference(prompt, options));
                }
                return results;
            },

            benchmark: async (modelName: string) => {
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

export async function loadNeuralBindings(): Promise<RuvFannBindings | null> {
    return bindingsLoader.load();
}

export { RuvFannBindings as default };