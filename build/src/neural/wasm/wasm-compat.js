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
import { NeuralWasmGateway } from './gateway.ts';
export class WasmModuleLoaderCompat {
    async initialize() {
        await NeuralWasmGateway.initialize();
    }
    async load() {
        await NeuralWasmGateway.initialize();
    }
    async loadModule() {
        await NeuralWasmGateway.initialize();
    }
    isLoaded() {
        return NeuralWasmGateway.isInitialized();
    }
    getModule() {
        return { gateway: true };
    }
    async cleanup() {
        // No direct cleanup semantics yet – placeholder
    }
    getTotalMemoryUsage() {
        // Gateway metrics currently do not expose memory – return 0 placeholder
        return 0;
    }
    getModuleStatus() {
        const m = NeuralWasmGateway.getMetrics();
        return {
            loaded: m.initialized,
            memoryUsage: 0,
            status: m.initialized ? 'ready' : 'unloaded',
            optimized: m.optimized,
        };
    }
}
export { WasmModuleLoaderCompat as WasmModuleLoader };
export class WasmMemoryOptimizerCompat {
    async optimize() {
        await NeuralWasmGateway.optimize();
    }
    isOptimized() {
        return NeuralWasmGateway.getMetrics().optimized;
    }
    reset() {
        // Placeholder reset; real implementation would extend gateway
    }
}
export { WasmMemoryOptimizerCompat as WasmMemoryOptimizer };
