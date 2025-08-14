import { WasmModuleLoader } from './wasm-loader.ts';
import { WasmMemoryOptimizer } from './wasm-memory-optimizer.ts';
class NeuralWasmGatewayImpl {
    loader = new WasmModuleLoader();
    optimizer = new WasmMemoryOptimizer();
    initialized = false;
    metrics = {
        initialized: false,
        optimized: false,
        modulesLoaded: 0,
        lastUpdated: Date.now(),
    };
    async initialize() {
        if (this.initialized)
            return;
        const start = performance.now?.() ?? Date.now();
        await this.loader.initialize?.();
        this.initialized = true;
        this.metrics.initialized = true;
        this.metrics.initTimeMs = (performance.now?.() ?? Date.now()) - start;
        this.metrics.modulesLoaded = 1;
        this.metrics.lastUpdated = Date.now();
    }
    async optimize() {
        if (this.optimizer.isOptimized())
            return;
        const start = performance.now?.() ?? Date.now();
        await this.optimizer.optimize();
        this.metrics.optimized = true;
        this.metrics.optimizeTimeMs = (performance.now?.() ?? Date.now()) - start;
        this.metrics.lastUpdated = Date.now();
    }
    async execute(ctx) {
        const start = performance.now?.() ?? Date.now();
        try {
            await this.initialize();
            return {
                success: true,
                data: { task: ctx.task },
                durationMs: (performance.now?.() ?? Date.now()) - start,
            };
        }
        catch (e) {
            return {
                success: false,
                error: e?.message || 'WASM execution failed',
                durationMs: (performance.now?.() ?? Date.now()) - start,
            };
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    isInitialized() {
        return this.initialized;
    }
}
export const NeuralWasmGateway = new NeuralWasmGatewayImpl();
export default NeuralWasmGateway;
//# sourceMappingURL=gateway.js.map