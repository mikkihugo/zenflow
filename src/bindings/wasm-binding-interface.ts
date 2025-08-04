/**
 * WASM Binding Interface - Isolation Layer
 *
 * This module provides a proper abstraction layer for WASM bindings,
 * preventing direct imports between bindings and neural domains.
 *
 * Follows proper architectural boundaries:
 * bindings/ → wasm-binding-interface → neural/wasm (through abstract interface)
 */

/**
 * WASM binding interface contract
 * Defines what bindings can expect from WASM modules
 */
export interface WasmBindingInterface {
  loadWasm(): Promise<any>;
  isWasmAvailable(): boolean;
  getWasmCapabilities(): string[];
}

/**
 * WASM binding provider
 * Implements the interface by delegating to actual WASM modules
 */
class WasmBindingProvider implements WasmBindingInterface {
  private wasmModule: any = null;

  async loadWasm(): Promise<any> {
    if (!this.wasmModule) {
      try {
        // Use public API instead of direct neural/wasm import
        const { createNeuralWASM } = await import('../neural/public-api.js');
        this.wasmModule = await createNeuralWASM();
      } catch (error) {
        console.warn('Neural WASM public API not available, using fallback:', error);
        this.wasmModule = { fallback: true };
      }
    }
    return this.wasmModule;
  }

  isWasmAvailable(): boolean {
    return typeof WebAssembly !== 'undefined';
  }

  getWasmCapabilities(): string[] {
    return ['neural-networks', 'cuda-transpilation', 'gpu-acceleration', 'memory-optimization'];
  }
}

/**
 * Singleton instance for consistent binding access
 */
const wasmBindingProvider = new WasmBindingProvider();

export default wasmBindingProvider;
