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
export interface WasmGatewayMetrics {
    initialized: boolean;
    optimized: boolean;
    initTimeMs?: number;
    optimizeTimeMs?: number;
    modulesLoaded: number;
    lastUpdated: number;
}
export interface WasmExecutionContext {
    task: string;
    payload?: unknown;
    options?: Record<string, unknown>;
}
export interface WasmExecutionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    durationMs: number;
}
declare class NeuralWasmGatewayImpl {
    private loader;
    private optimizer;
    private initialized;
    private metrics;
    /** Lazy initialization (idempotent) */
    initialize(): Promise<void>;
    /** Memory / runtime optimization (idempotent) */
    optimize(): Promise<void>;
    /**
     * Execute a WASM-backed task (stub until real dispatch added).
     *
     * @param ctx
     */
    execute<T = unknown>(ctx: WasmExecutionContext): Promise<WasmExecutionResult<T>>;
    getMetrics(): WasmGatewayMetrics;
    isInitialized(): boolean;
}
export declare const NeuralWasmGateway: NeuralWasmGatewayImpl;
export type NeuralWasmGatewayType = typeof NeuralWasmGateway;
export default NeuralWasmGateway;
//# sourceMappingURL=gateway.d.ts.map