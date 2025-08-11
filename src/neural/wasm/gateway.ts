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

class NeuralWasmGatewayImpl {
  private loader = new WasmModuleLoader();
  private optimizer = new WasmMemoryOptimizer();
  private initialized = false;
  private metrics: WasmGatewayMetrics = {
    initialized: false,
    optimized: false,
    modulesLoaded: 0,
    lastUpdated: Date.now(),
  };

  /** Lazy initialization (idempotent) */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    const start = performance.now?.() ?? Date.now();
    await (this.loader as any).initialize?.();
    this.initialized = true;
    this.metrics.initialized = true;
    this.metrics.initTimeMs = (performance.now?.() ?? Date.now()) - start;
    this.metrics.modulesLoaded = 1; // Adjust when multiple modules integrated
    this.metrics.lastUpdated = Date.now();
  }

  /** Memory / runtime optimization (idempotent) */
  async optimize(): Promise<void> {
    if (this.optimizer.isOptimized()) return;
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
  async execute<T = unknown>(ctx: WasmExecutionContext): Promise<WasmExecutionResult<T>> {
    const start = performance.now?.() ?? Date.now();
    try {
      await this.initialize();
      // TODO: Route by ctx.task -> underlying wasm exported function tables
      return {
        success: true,
        data: { task: ctx.task } as unknown as T,
        durationMs: (performance.now?.() ?? Date.now()) - start,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || 'WASM execution failed',
        durationMs: (performance.now?.() ?? Date.now()) - start,
      };
    }
  }

  getMetrics(): WasmGatewayMetrics {
    return { ...this.metrics };
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance (stateless surface externally)
export const NeuralWasmGateway = new NeuralWasmGatewayImpl();
export type NeuralWasmGatewayType = typeof NeuralWasmGateway;

export default NeuralWasmGateway;
