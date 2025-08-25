/**
 * @file Neural Network Bridge
 * Integrates neural network components with Claude-Zen system.
 * Enhanced with SmartNeuralCoordinator for intelligent neural backend system.
 */
import { type Logger } from '@claude-zen/foundation';
import {
  type NeuralBackendConfig,
  type NeuralEmbeddingResult,
} from './smart-neural-coordinator';
export interface NeuralConfig {
  wasmPath?: string;
  gpuAcceleration?: boolean;
  modelPath?: string;
  enableTraining?: boolean;
  smartNeuralBackend?: NeuralBackendConfig;
}
export interface NeuralNetwork {
  id: string;
  type: 'feedforward|lstm|transformer|autoencoder';
  layers: number[];
  weights?: Float32Array;
  status: 'idle|training|predicting|error';
  handle?: number;
}
export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
}
export interface PredictionResult {
  outputs: number[];
  confidence: number;
  processingTime: number;
}
export interface NetworkArchitecture {
  type: 'feedforward|lstm|transformer|autoencoder|cnn|gnn';
  layers: number[];
  activation: ActivationFunction;
  outputActivation?: ActivationFunction;
  learningRate: number;
  batchSize: number;
  epochs?: number;
  metadata?: Record<string, unknown>;
}
export type ActivationFunction =|'sigmoid|tanh|relu|leaky_relu|softmax|linear|swish|gelu';
export declare class NeuralBridge {
  private foundationLogger;
  private static instance;
  private networks;
  private networkMetadata;
  private config;
  private initialized;
  private wasmModule;
  private dbAccess;
  private smartNeuralCoordinator;
  constructor(foundationLogger: Logger, config?: NeuralConfig);
  static getInstance(logger?: Logger, config?: NeuralConfig): NeuralBridge;
  /**
   * Initialize neural network bridge.
   */
  initialize(): Promise<void>;
  /**
   * Create a new neural network.
   *
   * @param id
   * @param type
   * @param layers
   */
  createNetwork(
    id: string,
    type: NeuralNetwork['type'],
    layers: number[]
  ): Promise<string>;
  /**
   * Train a neural network.
   *
   * @param networkId
   * @param trainingData
   * @param epochs
   */
  trainNetwork(
    networkId: string,
    trainingData: TrainingData,
    epochs?: number
  ): Promise<boolean>;
  /**
   * Make predictions with a neural network.
   *
   * @param networkId
   * @param inputs
   */
  predict(networkId: string, inputs: number[]): Promise<PredictionResult>;
  /**
   * Calculate confidence from network outputs.
   * For softmax outputs, this would be the max probability.
   * For regression, this could be based on output variance.
   *
   * @param outputs
   */
  private calculateConfidence;
  /**
   * Get network status.
   *
   * @param networkId
   */
  getNetworkStatus(networkId: string): NeuralNetwork|undefined;
  /**
   * List all networks.
   */
  listNetworks(): NeuralNetwork[];
  /**
   * Remove a network.
   *
   * @param networkId
   */
  removeNetwork(networkId: string): boolean;
  /**
   * Get neural system stats.
   */
  getStats(): {
    totalNetworks: number;
    activeNetworks: number;
    trainingNetworks: number;
    gpuEnabled: boolean;
    wasmEnabled: boolean;
  };
  private loadWasmModule;
  private initializeGPU;
  /**
   * Initialize database schema for neural networks using foundation storage.
   */
  private initializeDatabaseSchema;
  /**
   * Generate neural embeddings using SmartNeuralCoordinator
   *
   * @param text - Text to generate embeddings for
   * @param options - Optional embedding configuration
   * @returns Promise with embedding result
   */
  generateEmbedding(
    text: string,
    options?: {
      context?: string;
      priority?:'low|medium|high';
      qualityLevel?: 'basic|standard|premium';
    }
  ): Promise<NeuralEmbeddingResult>;
  /**
   * Get SmartNeuralCoordinator statistics
   */
  getSmartNeuralStats(): any;
  /**
   * Clear SmartNeuralCoordinator cache
   */
  clearSmartNeuralCache(): Promise<void>;
  /**
   * Shutdown neural bridge.
   */
  shutdown(): Promise<void>;
}
export declare function createNeuralNetwork(
  id: string,
  type: NeuralNetwork['type'],
  layers: number[],
  config?: NeuralConfig
): Promise<string>;
export declare function trainNeuralNetwork(
  networkId: string,
  trainingData: TrainingData,
  epochs?: number
): Promise<boolean>;
export declare function predictWithNetwork(
  networkId: string,
  inputs: number[]
): Promise<PredictionResult>;
//# sourceMappingURL=neural-bridge.d.ts.map
