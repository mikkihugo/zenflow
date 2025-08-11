/**
 * WASM Compatibility Layer.
 *
 * Provides a backwards-compatible wrapper so legacy code/tests using
 * `new WasmModuleLoader()` continue to function while the system.
 * Migrates to the unified `NeuralWasmGateway` facade.
 *
 * Deprecation Plan:
 * 1. Migrate imports to `NeuralWasmGateway`
 * 2. Remove this compat layer and legacy shims.
 */
/**
 * @file Neural network: wasm-compat.
 */
export declare class WasmModuleLoaderCompat {
    initialize(): Promise<void>;
    load(): Promise<void>;
    loadModule(): Promise<void>;
    isLoaded(): boolean;
    getModule(): any;
    cleanup(): Promise<void>;
    getTotalMemoryUsage(): number;
    getModuleStatus(): any;
}
export { WasmModuleLoaderCompat as WasmModuleLoader };
export declare class WasmMemoryOptimizerCompat {
    optimize(): Promise<void>;
    isOptimized(): boolean;
    reset(): void;
}
export { WasmMemoryOptimizerCompat as WasmMemoryOptimizer };
//# sourceMappingURL=wasm-compat.d.ts.map