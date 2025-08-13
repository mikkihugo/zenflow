/**
 * Neural network tokens for dependency injection.
 * Defines tokens for neural network and AI services.
 */
/**
 * @file Neural-tokens implementation.
 */

import { createToken } from './token-factory.ts';

// Neural network interfaces (to be implemented)
export interface INeuralNetworkTrainer {
  createNetwork(config: unknown): Promise<string>;
  trainNetwork(networkId: string, data: unknown): Promise<unknown>;
  evaluateNetwork(networkId: string, testData: unknown): Promise<unknown>;
  saveModel(networkId: string, path: string): Promise<void>;
  loadModel(path: string): Promise<string>;
}

export interface IDataLoader {
  loadTrainingData(source: string): Promise<unknown>;
  loadTestData(source: string): Promise<unknown>;
  preprocessData(data: unknown, options: unknown): Promise<unknown>;
  augmentData(data: unknown, options: unknown): Promise<unknown>;
}

export interface IOptimizationEngine {
  optimize(model: unknown, data: unknown, options: unknown): Promise<unknown>;
  tuneHyperparameters(model: unknown, data: unknown): Promise<unknown>;
  validateOptimization(model: unknown, data: unknown): Promise<unknown>;
}

export interface IModelStorage {
  saveModel(model: unknown, metadata: unknown): Promise<string>;
  loadModel(modelId: string): Promise<unknown>;
  deleteModel(modelId: string): Promise<void>;
  listModels(): Promise<any[]>;
}

export interface IMetricsCollector {
  recordMetric(name: string, value: number, metadata?: unknown): Promise<void>;
  getMetrics(query: unknown): Promise<any[]>;
  clearMetrics(filter?: unknown): Promise<void>;
  generateReport(timeRange: unknown): Promise<unknown>;
}

// Neural network tokens
export const NEURAL_TOKENS = {
  NetworkTrainer: createToken<INeuralNetworkTrainer>('NetworkTrainer'),
  DataLoader: createToken<IDataLoader>('DataLoader'),
  OptimizationEngine: createToken<IOptimizationEngine>('OptimizationEngine'),
  ModelStorage: createToken<IModelStorage>('ModelStorage'),
  MetricsCollector: createToken<IMetricsCollector>('MetricsCollector'),
} as const;
