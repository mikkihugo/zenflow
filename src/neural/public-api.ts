/**
 * Public API for Neural System
 *
 * This file provides the public interface for external modules to interact
 * with the neural system without directly accessing WASM internals
 */

import type { WASMPerformanceMetrics } from './types/wasm-types.js';

/**
 * Public interface for neural WASM operations
 *
 * @example
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
 * Factory function to create a public neural WASM interface
 * This wraps the internal WASM modules with a limited public interface
 */
export async function createNeuralWASM(): Promise<NeuralWASM> {
  // Dynamically import to avoid architecture violations
  const { WASMNeuralAccelerator } = await import('./wasm/wasm-neural-accelerator');

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
