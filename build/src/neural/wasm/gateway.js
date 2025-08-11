/**
 * NeuralWasmGateway.
 * Unified, public-safe facade for all neural WebAssembly functionality.
 * Enforces controlled access, lazy initialization, and metrics capture.
 *
 * Architectural Contract:
 * - All external modules MUST import WASM capabilities only via this gateway
 * - Direct imports of deep wasm internals (src/neural/wasm/(src|binaries|fact-core)) are blocked by dependency-cruiser
 * - Provides stable surface while underlying loaders evolve.
 */
/**
 * @file Neural network: gateway.
 */
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
    /** Lazy initialization (idempotent) */
    async initialize() {
        if (this.initialized)
            return;
        const start = performance.now?.() ?? Date.now();
        await this.loader.initialize?.();
        this.initialized = true;
        this.metrics.initialized = true;
        this.metrics.initTimeMs = (performance.now?.() ?? Date.now()) - start;
        this.metrics.modulesLoaded = 1; // Adjust when multiple modules integrated
        this.metrics.lastUpdated = Date.now();
    }
    /** Memory / runtime optimization (idempotent) */
    async optimize() {
        if (this.optimizer.isOptimized())
            return;
        const start = performance.now?.() ?? Date.now();
        await this.optimizer.optimize();
        this.metrics.optimized = true;
        this.metrics.optimizeTimeMs = (performance.now?.() ?? Date.now()) - start;
        this.metrics.lastUpdated = Date.now();
    }
    /**
     * Execute a WASM-backed task (stub until real dispatch added).
     *
     * @param ctx
     */
    async execute(ctx) {
        const start = performance.now?.() ?? Date.now();
        try {
            await this.initialize();
            // TODO: Route by ctx.task -> underlying wasm exported function tables
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
// Singleton instance (stateless surface externally)
export const NeuralWasmGateway = new NeuralWasmGatewayImpl();
export default NeuralWasmGateway;
