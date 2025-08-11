/**
 * WASM Integration Performance Optimizer.
 * Optimizes WASM module loading, compilation, memory sharing, and SIMD acceleration.
 */
/**
 * @file Wasm-optimizer implementation.
 */
import type { WasmOptimizer } from '../interfaces/optimization-interfaces.ts';
export interface WasmOptimizationConfig {
    enableStreaming: boolean;
    enableSIMD: boolean;
    enableMemorySharing: boolean;
    enableCompilerOptimizations: boolean;
    maxModuleCacheSize: number;
    preloadStrategy: 'eager' | 'lazy' | 'predictive';
    optimizationLevel: 'O0' | 'O1' | 'O2' | 'O3' | 'Os' | 'Oz';
}
export interface WasmPerformanceMetrics {
    moduleLoadTime: number;
    compilationTime: number;
    instantiationTime: number;
    executionTime: number;
    memoryUsage: number;
    interopLatency: number;
}
export interface WasmCapabilities {
    streamingSupport: boolean;
    simdSupport: boolean;
    threadsSupport: boolean;
    bulkMemorySupport: boolean;
    referenceTypesSupport: boolean;
}
export interface WasmModule {
    name: string;
    size: number;
    compilationTime: number;
    instantiated: boolean;
}
export interface LoadingOptimization {
    loadTime: number;
    cacheUtilization: boolean;
    streamingEnabled: boolean;
    preloadStrategy: string;
}
export interface WasmFile {
    path: string;
}
export interface StreamingResult {
    compilationTime: number;
    streamingEnabled: boolean;
    memoryEfficiency: number;
    instantiationSpeed: number;
}
export type Bridge = {};
export interface MemoryOptimization {
    memoryReduction: number;
    compressionRatio: number;
    garbageCollectionImprovement: number;
    poolingStrategy: string;
}
export interface Kernel {
    operations: string[];
}
export interface SIMDResult {
    simdSupport: boolean;
    performanceGain: number;
    instructionOptimization: string[];
    vectorizationLevel: number;
}
export declare class WasmPerformanceOptimizer implements WasmOptimizer {
    private config;
    private moduleCache;
    private instanceCache;
    private capabilities;
    private logger;
    constructor(config?: Partial<WasmOptimizationConfig>);
    /**
     * Optimize WASM module loading performance.
     *
     * @param modules
     */
    optimizeWasmModuleLoading(modules: WasmModule[]): Promise<LoadingOptimization>;
    /**
     * Implement streaming compilation for faster startup.
     *
     * @param wasmFiles
     */
    implementStreamingCompilation(wasmFiles: WasmFile[]): Promise<StreamingResult>;
    /**
     * Optimize memory sharing between JS and WASM.
     *
     * @param jsWasmBridge
     */
    optimizeMemorySharing(jsWasmBridge: Bridge): Promise<MemoryOptimization>;
    /**
     * Enable SIMD acceleration for compute kernels.
     *
     * @param computeKernels
     */
    enableSIMDAcceleration(computeKernels: Kernel[]): Promise<SIMDResult>;
    /**
     * Detect WASM capabilities of the current environment.
     */
    private detectWasmCapabilities;
    /**
     * Implement module caching strategy.
     *
     * @param modules
     */
    private implementModuleCaching;
    /**
     * Enable module preloading based on strategy.
     *
     * @param modules
     */
    private enableModulePreloading;
    /**
     * Implement streaming compilation for a single file.
     *
     * @param wasmFile
     */
    private implementStreamingForFile;
    /**
     * Optimize compute kernel with SIMD instructions.
     *
     * @param kernel
     */
    private optimizeKernelWithSIMD;
    /**
     * Check if kernel is capable of SIMD optimization.
     *
     * @param kernel
     */
    private isKernelSIMDCapable;
    /**
     * Check if operation can be vectorized.
     *
     * @param operation
     */
    private canVectorizeOperation;
    /**
     * Vectorize a specific operation.
     *
     * @param operation
     */
    private vectorizeOperation;
    /**
     * Measure module loading performance.
     *
     * @param modules
     */
    private measureModuleLoadingPerformance;
    /**
     * Helper methods with mock implementations.
     *
     * @param _module
     */
    private compileModule;
    private getCacheSize;
    private evictLeastRecentlyUsed;
    private preloadAllModules;
    private preloadPredictedModules;
    private streamingFetch;
    private measureMemoryUsage;
    private measureStreamingMemoryEfficiency;
    private optimizeModuleBundling;
    private implementLazyModuleLoading;
    private enableModuleCompression;
    private implementModuleVersioning;
    private implementSharedArrayBuffers;
    private optimizeMemoryLayout;
    private implementWasmMemoryPooling;
    private enableMemoryCompression;
    private optimizeGarbageCollectionCoordination;
}
//# sourceMappingURL=wasm-optimizer.d.ts.map