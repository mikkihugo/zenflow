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
    }
    getTotalMemoryUsage() {
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
    }
}
export { WasmMemoryOptimizerCompat as WasmMemoryOptimizer };
//# sourceMappingURL=wasm-compat.js.map