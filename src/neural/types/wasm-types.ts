/**
 * Neural WASM Interface Type Definitions.
 *
 * Type definitions for WebAssembly neural network acceleration.
 */
/**
 * @file TypeScript type definitions for neural.
 */

export interface WASMNeuralConfig {
  wasmPath: string;
  memoryPages: number;
  maxInstances: number;
  enableSIMD: boolean;
  enableThreads: boolean;
  optimizationLevel: 'O0' | 'O1' | 'O2' | 'O3';
}

export interface WASMNeuralInstance {
  exports: WASMExports;
  memory: WebAssembly.Memory | null;
}

export interface WASMExports {
  // Index signature to allow dynamic property access (fixes bracket notation TypeScript error)
  [key: string]: any;

  // Core neural operations
  create_network: (layers: number[], activations: number[]) => number;
  destroy_network: (networkId: number) => void;
  train_network: (
    networkId: number,
    inputs: number,
    outputs: number,
    epochs: number,
  ) => number;
  predict: (networkId: number, inputs: number, inputCount: number) => number;

  // Memory management
  allocate_memory: (size: number) => number;
  deallocate_memory: (ptr: number) => void;
  get_memory_usage: () => number;

  // Performance optimizations
  set_simd_enabled: (enabled: number) => void;
  set_thread_count: (count: number) => void;
  benchmark_operation: (operation: number, iterations: number) => number;

  // Data transfer
  copy_to_wasm: (ptr: number, data: ArrayBuffer) => void;
  copy_from_wasm: (ptr: number, size: number) => ArrayBuffer;

  // Neural network specific
  set_learning_rate: (networkId: number, rate: number) => void;
  get_network_error: (networkId: number) => number;
  save_network: (networkId: number, ptr: number) => number;
  load_network: (ptr: number, size: number) => number;

  // Additional WASM functions that might be dynamically loaded
  create_model?: (...args: any[]) => any;
  prepare_training_data?: (...args: any[]) => any;
  train_model?: (...args: any[]) => any;
  prepare_input?: (...args: any[]) => any;
}

export interface WASMNeuralAccelerator {
  initialize(): Promise<void>;
  createModel(modelId: string, definition: WASMModelDefinition): Promise<void>;
  trainModel(
    modelId: string,
    trainingData: WASMTrainingData,
    options?: WASMOptimizationOptions,
  ): Promise<WASMPerformanceMetrics>;
  predict(
    modelId: string,
    input: WASMPredictionInput,
  ): Promise<WASMPredictionOutput>;
  optimizeModel(
    modelId: string,
    options: WASMOptimizationOptions,
  ): Promise<WASMModelDefinition>;
  benchmark(
    operations?: Array<'create' | 'train' | 'predict'>,
  ): Promise<WASMBenchmarkResult>;
  getMetrics(): WASMPerformanceMetrics;
  shutdown(): Promise<void>;
}

export interface NetworkConfig {
  layers: number[];
  activationFunctions: ActivationFunction[];
  learningRate: number;
  optimizer: OptimizerType;
  regularization?: RegularizationConfig;
}

export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
  epochs: number;
  batchSize?: number;
  validationSplit?: number;
}

export interface TrainingResult {
  finalError: number;
  epochs: number;
  trainingTime: number;
  convergenceRate: number;
  validationError?: number;
}

export interface MemoryUsage {
  totalAllocated: number;
  currentUsage: number;
  peakUsage: number;
  availableMemory: number;
  fragmentationRatio: number;
}

export interface BenchmarkResult {
  operationsPerSecond: number;
  averageLatency: number;
  memoryBandwidth: number;
  simdUtilization: number;
  threadEfficiency: number;
}

export type ActivationFunction =
  | 'sigmoid'
  | 'tanh'
  | 'relu'
  | 'leaky_relu'
  | 'elu'
  | 'swish'
  | 'gelu'
  | 'softmax';

export type OptimizerType = 'sgd' | 'adam' | 'rmsprop' | 'adagrad' | 'momentum';

export interface RegularizationConfig {
  l1: number;
  l2: number;
  dropout: number;
}

export interface WASMPerformanceMetrics {
  // Legacy properties (kept for compatibility)
  initializationTime: number;
  averageInferenceTime: number;
  throughput: number;
  memoryEfficiency: number;
  cpuUtilization: number;
  simdAcceleration: boolean;
  threadUtilization: number;

  // Extended properties required by accelerator
  totalOperations: number;
  averageExecutionTime: number;
  memoryUsage: number;
  simdSupport: boolean;
  wasmVersion: string;
  compilationTime: number;
  lastBenchmark: number;
}

export interface WASMError extends Error {
  wasmErrorCode: number;
  wasmErrorMessage: string;
  stackTrace?: string;
}

// Additional types required by WASM neural accelerator
export interface WASMModelDefinition {
  id: string;
  name: string;
  architecture: NetworkConfig;
  metadata: {
    version: string;
    createdAt: Date;
    framework: string;
  };
}

export interface WASMPredictionInput {
  data: number[] | Float32Array;
  batchSize?: number;
  preprocessor?: string;
}

export interface WASMPredictionOutput {
  predictions: number[] | Float32Array;
  confidence?: number[];
  executionTime: number;
  memoryUsage: number;
}

export interface WASMOptimizationOptions {
  enableSIMD: boolean;
  threadCount: number;
  memoryOptimization: boolean;
  precision: 'fp16' | 'fp32' | 'fp64';
  cacheSize: number;
}

export interface WASMTrainingData extends TrainingData {
  wasmFormat: boolean;
  bufferPtr?: number;
  dataLayout: 'row_major' | 'column_major';
}

export interface WASMBenchmarkResult extends BenchmarkResult {
  wasmSpecificMetrics: {
    compilationTime: number;
    instantiationTime: number;
    memoryGrowthCount: number;
  };
}
