/**
 * @file Neural network: wasm-neural-accelerator.
 */
/**
 * WASM Neural Accelerator Implementation.
 *
 * High-performance WebAssembly-based neural network acceleration
 * with SIMD support and optimized mathematical operations.
 */
import type { WASMNeuralAccelerator as WASMNeuralAccelerator, WASMBenchmarkResult, WASMModelDefinition, WASMNeuralConfig, WASMOptimizationOptions, WASMPerformanceMetrics, WASMPredictionInput, WASMPredictionOutput, WASMTrainingData } from '../types/wasm-types';
/**
 * WASM-powered neural network accelerator.
 *
 * Provides high-performance neural operations through WebAssembly.
 *
 * @example
 */
export declare class WASMNeuralAccelerator implements WASMNeuralAccelerator {
    private config;
    private wasmInstance;
    private metrics;
    private isInitialized;
    private models;
    constructor(config: WASMNeuralConfig);
    /**
     * Initialize WASM module and neural accelerator.
     */
    initialize(): Promise<void>;
    /**
     * Create and configure a neural network model.
     *
     * @param modelId
     * @param definition
     */
    createModel(modelId: string, definition: WASMModelDefinition): Promise<void>;
    /**
     * Train a neural network model with provided data.
     *
     * @param modelId
     * @param trainingData
     * @param _options
     */
    trainModel(modelId: string, trainingData: WASMTrainingData, _options?: WASMOptimizationOptions): Promise<WASMPerformanceMetrics>;
    /**
     * Run prediction with a trained model.
     *
     * @param modelId
     * @param _input
     */
    predict(modelId: string, _input: WASMPredictionInput): Promise<WASMPredictionOutput>;
    /**
     * Run performance benchmarks.
     *
     * @param operations
     */
    benchmark(operations?: Array<'create' | 'train' | 'predict'>): Promise<WASMBenchmarkResult>;
    /**
     * Get current performance metrics.
     */
    getMetrics(): WASMPerformanceMetrics;
    /**
     * Get WASM capabilities and features.
     */
    getCapabilities(): {
        simdSupport: boolean;
        threadingSupport: boolean;
        memoryGrowth: boolean;
        maxMemory: number;
        supportedOperations: string[];
    };
    /**
     * Optimize model for better performance.
     *
     * @param modelId
     * @param _options
     */
    optimizeModel(modelId: string, _options: WASMOptimizationOptions): Promise<WASMModelDefinition>;
    /**
     * Clean up resources.
     */
    dispose(): Promise<void>;
    createNetwork(layers: number[]): Promise<string>;
    train(networkId: string, data: number[][], labels: number[][]): Promise<WASMPerformanceMetrics>;
    predictArray(networkId: string, input: number[]): Promise<number[]>;
    freeNetwork(networkId: string): void;
    shutdown(): Promise<void>;
    private ensureInitialized;
    /**
     * Type-safe WASM module loading with proper ArrayBuffer handling.
     */
    private loadWasmBinary;
    /**
     * Type-safe WASM module instantiation with proper exports access.
     *
     * @param wasmModule
     */
    private instantiateWasm;
    /**
     * Type-safe WASM buffer initialization.
     *
     * @param buffer
     */
    private initializeWasmWithBuffer;
    /**
     * Convert input data to proper ArrayBuffer format for WASM.
     *
     * @param data
     */
    private ensureArrayBuffer;
    /**
     * Safe WASM function call with bracket notation and type guards.
     *
     * @param functionName
     * @param {...any} args
     */
    private safeWasmCall;
    private generateBenchmarkData;
    private estimateMemoryUsage;
    private calculateMemoryEfficiency;
}
export default WASMNeuralAccelerator;
//# sourceMappingURL=wasm-neural-accelerator.d.ts.map