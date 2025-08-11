/**
 * Public interface for neural WASM operations.
 *
 * @example
 */
/**
 * @file Neural network: public-api.
 */

export interface NeuralWASM {
  // Initialize WASM module
  initialize(): Promise<void>;

  // Neural network operations
  createNetwork(layers: number[]): Promise<string>;
  train(networkId: string, data: number[][], labels: number[][]): Promise<WASMPerformanceMetrics>;
  predict(networkId: string, input: number[]): Promise<number[]>;

  // Memory management
  freeNetwork(networkId: string): void;
}

/**
 * Factory function to create a public neural WASM interface.
 * This wraps the internal WASM modules with a limited public interface.
 *
 * @example
 */
export async function createNeuralWASM(): Promise<NeuralWASM> {
  // Dynamically import to avoid architecture violations
  const { WASMNeuralAccelerator } = await import('./wasm/wasm-neural-accelerator.ts');

  const accelerator = new WASMNeuralAccelerator({
    wasmPath: '/path/to/neural.wasm',
    memoryPages: 256,
    maxInstances: 1,
    enableSIMD: true,
    enableThreads: false,
    optimizationLevel: 'O2',
  });
  await accelerator.initialize();

  // Return limited public interface
  return {
    async initialize() {
      return accelerator.initialize();
    },

    async createNetwork(layers: number[]) {
      return accelerator.createNetwork(layers);
    },

    async train(networkId: string, data: number[][], labels: number[][]) {
      return accelerator.train(networkId, data, labels);
    },

    async predict(networkId: string, input: number[]): Promise<number[]> {
      return accelerator.predictArray(networkId, input);
    },

    freeNetwork(networkId: string) {
      return accelerator.freeNetwork(networkId);
    },
  };
}
