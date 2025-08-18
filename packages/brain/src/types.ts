/**
 * Core brain package type definitions
 */

export enum NeuralModelType {
  FEEDFORWARD = 'feedforward',
  LSTM = 'lstm',
  RNN = 'rnn',
  CNN = 'cnn',
  AUTOENCODER = 'autoencoder',
  GAN = 'gan'
}

export interface TrainingParameters {
  learningRate: number;
  epochs: number;
  batchSize?: number;
  validationSplit?: number;
  earlyStop?: boolean;
  patience?: number;
}

export interface ModelMetrics {
  accuracy: number;
  loss: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainingTime: number;
  validationAccuracy?: number;
  validationLoss?: number;
}

export enum ActivationFunction {
  SIGMOID = 'sigmoid',
  TANH = 'tanh',
  RELU = 'relu',
  LEAKY_RELU = 'leaky-relu',
  SOFTMAX = 'softmax',
  LINEAR = 'linear'
}

export interface NeuralNetworkConfig {
  type: NeuralModelType;
  inputSize: number;
  outputSize: number;
  hiddenLayers: number[];
  activation: ActivationFunction;
  learningRate: number;
}

export interface TrainingData {
  input: number[];
  output: number[];
}

export interface PredictionResult {
  output: number[];
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface ModelPresetConfig {
  id: string;
  name: string;
  type: string;
  architecture: string;
  layers: number[];
  activation: string;
  outputActivation: string;
  learningRate: number;
  batchSize: number;
  useCase: string[];
}