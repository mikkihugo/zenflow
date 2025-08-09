/**
 * WASM Compatibility Layer.
 *
 * Provides a backwards-compatible wrapper so legacy code/tests using
 * `new WasmModuleLoader()` continue to function while the system.
 * migrates to the unified `NeuralWasmGateway` facade.
 *
 * Deprecation Plan:
 * 1. Migrate imports to `NeuralWasmGateway`
 * 2. Remove this compat layer and legacy shims
 */
/**
 * @file Neural network: wasm-compat
 */


import { NeuralWasmGateway } from './gateway';

export class WasmModuleLoaderCompat {
  async initialize(): Promise<void> {
    await NeuralWasmGateway.initialize();
  }

  async load(): Promise<void> {
    await NeuralWasmGateway.initialize();
  }

  async loadModule(): Promise<void> {
    await NeuralWasmGateway.initialize();
  }

  isLoaded(): boolean {
    return NeuralWasmGateway.isInitialized();
  }

  getModule(): any {
    return { gateway: true };
  }

  async cleanup(): Promise<void> {
    // No direct cleanup semantics yet – placeholder
  }

  getTotalMemoryUsage(): number {
    // Gateway metrics currently do not expose memory – return 0 placeholder
    return 0;
  }

  getModuleStatus(): any {
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
  async optimize(): Promise<void> {
    await NeuralWasmGateway.optimize();
  }
  isOptimized(): boolean {
    return NeuralWasmGateway.getMetrics().optimized;
  }
  reset(): void {
    // Placeholder reset; real implementation would extend gateway
  }
}

export { WasmMemoryOptimizerCompat as WasmMemoryOptimizer };
