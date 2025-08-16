/**
 * Neural network tokens for dependency injection.
 * Defines tokens for neural network and AI services.
 */
/**
 * @file Neural-tokens implementation.
 */

import { createToken } from './token-factory';

// Enhanced type definitions for neural network services
export interface ModelInfo {
  id: string;
  name: string;
  type: 'neural' | 'transformer' | 'cnn' | 'rnn';
  version: string;
  capabilities: string[];
  createdAt: Date;
  size?: number;
}

export interface MetricData {
  timestamp: number;
  name: string;
  value: number;
  unit?: string;
  metadata?: Record<string, unknown>;
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop';
  lossFunction: string;
  metrics: string[];
}

export interface EvaluationResult {
  accuracy: number;
  loss: number;
  metrics: Record<string, number>;
  confusionMatrix?: number[][];
}

// Neural network interfaces (to be implemented)
export interface NeuralNetworkTrainer {
  createNetwork(config: TrainingConfig): Promise<string>;
  trainNetwork(networkId: string, data: unknown): Promise<EvaluationResult>;
  evaluateNetwork(networkId: string, testData: unknown): Promise<EvaluationResult>;
  saveModel(networkId: string, path: string): Promise<void>;
  loadModel(path: string): Promise<string>;
}

export interface DataLoader {
  loadTrainingData(source: string): Promise<unknown>;
  loadTestData(source: string): Promise<unknown>;
  preprocessData(data: unknown, options: unknown): Promise<unknown>;
  augmentData(data: unknown, options: unknown): Promise<unknown>;
}

export interface OptimizationEngine {
  optimize(model: unknown, data: unknown, options: unknown): Promise<unknown>;
  tuneHyperparameters(model: unknown, data: unknown): Promise<unknown>;
  validateOptimization(model: unknown, data: unknown): Promise<EvaluationResult>;
}

export interface ModelStorage {
  saveModel(model: unknown, metadata: Record<string, unknown>): Promise<string>;
  loadModel(modelId: string): Promise<unknown>;
  deleteModel(modelId: string): Promise<void>;
  listModels(): Promise<ModelInfo[]>;
}

export interface MetricsCollector {
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>): Promise<void>;
  getMetrics(query: Record<string, unknown>): Promise<MetricData[]>;
  clearMetrics(filter?: Record<string, unknown>): Promise<void>;
  generateReport(timeRange: { start: Date; end: Date }): Promise<Record<string, unknown>>;
}

// Neural network tokens
export const NEURAL_TOKENS = {
  NetworkTrainer: createToken<NeuralNetworkTrainer>('NetworkTrainer'),
  DataLoader: createToken<DataLoader>('DataLoader'),
  OptimizationEngine: createToken<OptimizationEngine>('OptimizationEngine'),
  ModelStorage: createToken<ModelStorage>('ModelStorage'),
  MetricsCollector: createToken<MetricsCollector>('MetricsCollector'),
} as const;
