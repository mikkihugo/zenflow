import { createRequire } from 'module';
import { Logger } from '../utils/logger.js';
// Import the REAL neural integration
import { loadRealNeuralBindings } from './real-fann-integration.js';
import type { JSONObject } from '../types/core.js';

/**
 * Neural bindings interface for FANN integration
 */
export interface RuvFannBindings {
  loadModel(path: string): Promise<boolean>;
  unloadModel?(modelName: string): Promise<boolean | void>;
  inference(prompt: string, options?: JSONObject): Promise<string>;
  listModels(): string[];
  isModelLoaded(modelName: string): boolean;
  batchInference?(prompts: string[], options?: JSONObject): Promise<string[]>;
  finetune?(modelName: string, trainingData: any): Promise<any>;
  benchmark?(modelName: string): Promise<BenchmarkResult>;
  enableGPU?(): Promise<boolean>;
  getGPUInfo?(): GPUInfo;
  getMemoryUsage?(): MemoryUsage;
  freeMemory?(): Promise<void>;
}

/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
  modelName: string;
  averageInferenceTime: number;
  tokensPerSecond: number;
  memoryUsage: number;
  accuracy: number;
}

/**
 * GPU information interface
 */
export interface GPUInfo {
  available: boolean;
  deviceName: string;
  memoryTotal: number;
  memoryUsed: number;
}

/**
 * Memory usage information interface
 */
export interface MemoryUsage {
  totalAllocated: number;
  totalUsed: number;
  modelMemory: Record<string, number>;
}

// Main loadNeuralBindings function - unified entry point
export async function loadNeuralBindings(): Promise<RuvFannBindings | null> {
    try {
        // Try to load REAL ruv-FANN integration first
        const realBindings = await loadRealNeuralBindings();
        if (realBindings) {
            console.log('✅ Using REAL ruv-FANN neural bindings');
            return realBindings;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ Real neural bindings failed, falling back to stub:', errorMessage);
    }
    
    // Fallback to original stub loader
    return bindingsLoader.load();
}

/**
 * RuvFannBindingsLoader - Handles loading of native, WASM, or stub neural bindings
 */
class RuvFannBindingsLoader {
    private logger: Logger;
    private bindings: RuvFannBindings | null = null;
    private loadAttempted: boolean = false;

    /**
     * Creates a new RuvFannBindingsLoader
     */
    constructor() {
        this.logger = new Logger('RuvFannBindings');
    }

    /**
     * Load neural bindings (native, WASM, or stub)
     * @returns The loaded bindings or null
     */
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to load ruv-FANN bindings:', errorMessage);
            this.bindings = this.createStubBindings();
            return this.bindings;
        }
    }

    /**
     * Attempt to load native NAPI bindings
     * @private
     * @returns Native bindings or null if unavailable
     */
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug('Native bindings not available:', errorMessage);
            return null;
        }
    }

    /**
     * Attempt to load WASM bindings
     * @private
     * @returns WASM bindings or null if unavailable
     */
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug('WASM bindings not available:', errorMessage);
            return null;
        }
    }

    /**
     * Wrap native bindings with standardized interface
     * @private
     * @param binding - Native binding object
     * @returns Wrapped bindings
     */
    private wrapNativeBindings(binding: any): RuvFannBindings {
        return {
            loadModel: async (path: string): Promise<boolean> => {
                try {
                    return binding.loadModel(path);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error('Native loadModel failed:', errorMessage);
                    return false;
                }
            },

            unloadModel: binding.unloadModel ? async (modelName: string): Promise<boolean | void> => {
                return binding.unloadModel(modelName);
            } : undefined,

            inference: async (prompt: string, options: JSONObject = {}): Promise<string> => {
                try {
                    return binding.inference(prompt, options);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error('Native inference failed:', errorMessage);
                    throw error;
                }
            },

            listModels: (): string[] => {
                try {
                    return binding.listModels() || [];
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error('Native listModels failed:', errorMessage);
                    return [];
                }
            },

            isModelLoaded: (modelName: string): boolean => {
                try {
                    return binding.isModelLoaded(modelName);
                } catch (error) {
                    return false;
                }
            },

            batchInference: binding.batchInference ? async (prompts: string[], options: JSONObject = {}): Promise<string[]> => {
                return binding.batchInference(prompts, options);
            } : undefined,

            finetune: binding.finetune ? async (modelName: string, trainingData: any): Promise<any> => {
                return binding.finetune(modelName, trainingData);
            } : undefined,

            benchmark: binding.benchmark ? async (modelName: string): Promise<BenchmarkResult> => {
                return binding.benchmark(modelName);
            } : undefined,

            enableGPU: binding.enableGPU ? async (): Promise<boolean> => {
                return binding.enableGPU();
            } : undefined,

            getGPUInfo: binding.getGPUInfo ? (): GPUInfo => {
                return binding.getGPUInfo();
            } : undefined,

            getMemoryUsage: binding.getMemoryUsage ? (): MemoryUsage => {
                return binding.getMemoryUsage();
            } : undefined,

            freeMemory: binding.freeMemory ? async (): Promise<void> => {
                return binding.freeMemory();
            } : undefined
        };
    }

    /**
     * Wrap WASM bindings with standardized interface
     * @private
     * @param wasmModule - WASM module object
     * @returns Wrapped bindings
     */
    private wrapWasmBindings(wasmModule: any): RuvFannBindings {
        return {
            loadModel: async (path: string): Promise<boolean> => {
                try {
                    return wasmModule.load_model(path);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error('WASM loadModel failed:', errorMessage);
                    return false;
                }
            },

            inference: async (prompt: string, options: JSONObject = {}): Promise<string> => {
                try {
                    return wasmModule.inference(prompt, JSON.stringify(options));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error('WASM inference failed:', errorMessage);
                    throw error;
                }
            },

            listModels: (): string[] => {
                try {
                    const result = wasmModule.list_models();
                    return JSON.parse(result);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error('WASM listModels failed:', errorMessage);
                    return [];
                }
            },

            isModelLoaded: (modelName: string): boolean => {
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
     * @returns Stub bindings implementation
     */
    private createStubBindings(): RuvFannBindings {
        this.logger.info('Creating stub bindings for development mode');
        
        return {
            loadModel: async (path: string): Promise<boolean> => {
                this.logger.debug(`Stub: Loading model from ${path}`);
                // Simulate loading time
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
                return true;
            },

            inference: async (prompt: string, options: JSONObject = {}): Promise<string> => {
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

            listModels: (): string[] => {
                return [
                    'code-completion-base',
                    'bug-detector-v2',
                    'refactor-assistant',
                    'test-generator-pro',
                    'docs-writer'
                ];
            },

            isModelLoaded: (modelName: string): boolean => {
                // Simulate some models being loaded
                const loadedModels = ['code-completion-base', 'bug-detector-v2'];
                return loadedModels.includes(modelName);
            },

            batchInference: async (prompts: string[], options: JSONObject = {}): Promise<string[]> => {
                const results: string[] = [];
                for (const prompt of prompts) {
                    results.push(await this.inference(prompt, options));
                }
                return results;
            },

            benchmark: async (modelName: string): Promise<BenchmarkResult> => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return {
                    modelName,
                    averageInferenceTime: 150 + Math.random() * 100,
                    tokensPerSecond: 800 + Math.random() * 400,
                    memoryUsage: 100 + Math.random() * 200,
                    accuracy: 0.85 + Math.random() * 0.1
                };
            },

            enableGPU: async (): Promise<boolean> => {
                this.logger.debug('Stub: GPU acceleration not available');
                return false;
            },

            getGPUInfo: (): GPUInfo => {
                return {
                    available: false,
                    deviceName: 'Stub GPU',
                    memoryTotal: 0,
                    memoryUsed: 0
                };
            },

            getMemoryUsage: (): MemoryUsage => {
                return {
                    totalAllocated: 512,
                    totalUsed: 256,
                    modelMemory: {
                        'code-completion-base': 150,
                        'bug-detector-v2': 106
                    }
                };
            },

            freeMemory: async (): Promise<void> => {
                this.logger.debug('Stub: Memory freed');
            }
        };
    }
}

// Singleton instance
const bindingsLoader = new RuvFannBindingsLoader();

/**
 * Load neural bindings (singleton pattern) - internal helper
 * @returns The loaded neural bindings
 * @private
 */
async function loadNeuralBindingsFromLoader(): Promise<RuvFannBindings | null> {
    return bindingsLoader.load();
}

// Export the class name as default
export default RuvFannBindingsLoader;