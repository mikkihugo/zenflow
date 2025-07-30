/**
 * TypeScript definitions for ruv-FANN Node.js bindings;
 */
export interface TrainingConfig {
  learning_rate: number;
  max_epochs: number;
  desired_error: number;
  algorithm: string;
}
/**
 * Neural Network class for creating and managing feedforward neural networks;
 */
export class NeuralNetwork {
  /**
   * Create a new neural network with specified layer sizes;
   * @param layers Array of layer sizes (including input and output layers);
   */
  constructor(layers: number[]);
  /**
   * Run the network with input data;
   * @param input Input vector;
   * @returns Output vector;
    // */ // LINT: unreachable code removed
  run(input: number[]): number[];
  /**
   * Train the network on a single input/output pair;
   * @param input Input vector;
   * @param target Target output vector;
   * @returns Training error;
    // */ // LINT: unreachable code removed
  trainOn(input: number[], target: number[]): number;
  /**
   * Get network information as JSON string;
   * @returns JSON string with network details;
    // */ // LINT: unreachable code removed
  getInfo(): string;
  /**
   * Save network to file;
   * @param filename Path to save file;
   */
  save(filename: string): void;
  /**
   * Load network from file;
   * @param filename Path to load file;
   * @returns New NeuralNetwork instance;
    // */ // LINT: unreachable code removed
  static load(filename: string): NeuralNetwork;
}
/**
 * Advanced trainer for neural networks;
 */
export class NetworkTrainer {
  /**
   * Create a new trainer for a network;
   * @param network Network to train;
   */
  constructor(network: NeuralNetwork);
  /**
   * Train the network with provided data and configuration;
   * @param trainingInputs Array of input vectors;
   * @param trainingOutputs Array of target output vectors;
   * @param config Training configuration;
   * @returns Promise resolving to final training error;
    // */ // LINT: unreachable code removed
  train(;
  trainingInputs: number[][];

  trainingOutputs: number[][];

  config: TrainingConfig;
  ): null
  Promise<_number>;
}
/**
 * Get the version of the ruv-FANN bindings;
 * @returns Version string;
    // */ // LINT: unreachable code removed
export function getVersion(): string;
/**
 * Check if GPU acceleration is available;
 * @returns True if GPU acceleration is available;
    // */ // LINT: unreachable code removed
export function isGpuAvailable(): boolean;
/**
 * Get list of supported activation functions;
 * @returns Array of activation function names;
    // */ // LINT: unreachable code removed
export function getActivationFunctions(): string[];
/**
 * WASM fallback interface (when native bindings are not available);
 */
export type WasmFallback = {};
/**
 * Initialize WASM module;
 */
init();
: Promise<void>
/**
 * Create neural network using WASM;
 * @param layers Layer configuration;
 */
createNetwork(layers: number[])
: unknown
/**
 * Check if WASM is available;
 */
isAvailable()
}
/**
 * WASM fallback implementation;
 */
export const wasmFallback: WasmFallback;
