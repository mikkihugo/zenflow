/**
 * Public API for Neural System
 *
 * This file provides the public interface for external modules to interact
 * with the neural system without directly accessing WASM internals
 */

/**
 * Public interface for neural WASM operations
 *
 * @example
 */
export interface NeuralWASM {
  // Initialize WASM module
  initialize(): Promise<void>;

  // Neural network operations
  createNetwork(layers: number[]): Promise<number>;
  train(networkId: number, data: number[][], labels: number[][]): Promise<void>;
  predict(networkId: number, input: number[]): Promise<number[]>;

  // Memory management
  freeNetwork(networkId: number): void;
}

/**
 * Factory function to create a public neural WASM interface
 * This wraps the internal WASM modules with a limited public interface
 */
export async function createNeuralWASM(): Promise<INeuralWASM> {
  // Dynamically import to avoid architecture violations
  const { WasmNeuralAccelerator } = await import('./wasm/wasm-neural-accelerator');

  const accelerator = new WasmNeuralAccelerator();
  await accelerator.initialize();

  // Return limited public interface
  return {
    async initialize() {
      return accelerator.initialize();
    },

    async createNetwork(layers: number[]) {
      return accelerator.createNetwork(layers);
    },

    async train(networkId: number, data: number[][], labels: number[][]) {
      return accelerator.train(networkId, data, labels);
    },

    async predict(networkId: number, input: number[]) {
      return accelerator.predict(networkId, input);
    },

    freeNetwork(networkId: number) {
      return accelerator.freeNetwork(networkId);
    },
  };
}
