/**
 * WASM Module Loader - Temporary stub implementation.
 * TODO: Implement full WASM loading functionality.
 */
/**
 * @file Neural network: wasm-loader.
 */
export declare class WasmModuleLoader {
    private loaded;
    private module;
    load(): Promise<void>;
    loadModule(): Promise<void>;
    isLoaded(): boolean;
    initialize(): Promise<void>;
    getModule(): any;
    cleanup(): Promise<void>;
    getTotalMemoryUsage(): number;
    getModuleStatus(): any;
}
export default WasmModuleLoader;
//# sourceMappingURL=wasm-loader.d.ts.map