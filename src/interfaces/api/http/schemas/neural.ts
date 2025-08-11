/**
 * Neural Network API Schemas.
 *
 * OpenAPI 3.0 schemas for neural network domain.
 * Consolidates neural network types and validation schemas.
 *
 * @file Neural network API schemas and types.
 */

import type { EntityFields, ResourceState, TimestampFields } from './common.ts';

/**
 * Neural Network Layer Configuration.
 *
 * @example
 */
export interface NeuralLayer {
  readonly type:
    | 'input'
    | 'hidden'
    | 'output'
    | 'convolutional'
    | 'pooling'
    | 'dropout'
    | 'batch_norm';
  readonly size: number;
  readonly activation: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' | 'leaky_relu' | 'gelu';
  readonly dropout?: number; // 0-1, for dropout layers
  readonly kernelSize?: readonly [number, number]; // For convolutional layers
  readonly stride?: readonly [number, number]; // For convolutional/pooling layers
  readonly padding?: 'valid' | 'same'; // For convolutional layers
}

/**
 * Neural Network Architecture.
 *
 * @example
 */
export interface NeuralNetwork extends EntityFields, TimestampFields, ResourceState {
  readonly type:
    | 'feedforward'
    | 'convolutional'
    | 'recurrent'
    | 'transformer'
    | 'autoencoder'
    | 'gan';
  readonly name?: string;
  readonly description?: string;
  readonly layers: readonly NeuralLayer[];
  readonly parameters?: {
    readonly totalParams: number;
    readonly trainableParams: number;
    readonly nonTrainableParams: number;
  };
  readonly performance?: {
    readonly accuracy?: number;
    readonly loss?: number;
    readonly trainingTime?: number; // in seconds
    readonly epochs?: number;
  };
  readonly lastTrained?: Date;
  readonly trainingData?: {
    readonly samples: number;
    readonly features: number;
    readonly classes?: number;
  };
  readonly hyperparameters?: Record<string, unknown>;
  readonly tags?: readonly string[];
}

/**
 * Training Configuration.
 *
 * @example
 */
export interface TrainingConfig {
  readonly epochs: number;
  readonly batchSize: number;
  readonly learningRate: number;
  readonly optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
  readonly lossFunction:
    | 'mse'
    | 'categorical_crossentropy'
    | 'binary_crossentropy'
    | 'sparse_categorical_crossentropy';
  readonly metrics?: readonly string[];
  readonly validationSplit?: number; // 0-1
  readonly callbacks?: readonly {
    readonly type: 'early_stopping' | 'reduce_lr' | 'checkpoint';
    readonly config: Record<string, unknown>;
  }[];
  readonly regularization?: {
    readonly l1?: number;
    readonly l2?: number;
    readonly dropout?: number;
  };
}

/**
 * Training Data Point.
 *
 * @example
 */
export interface TrainingDataPoint {
  readonly input: readonly number[];
  readonly output: readonly number[];
  readonly weight?: number; // Sample weight for weighted training
}

/**
 * Training Request.
 *
 * @example
 */
export interface TrainingRequest {
  readonly networkId: string;
  readonly trainingData: readonly TrainingDataPoint[];
  readonly config: TrainingConfig;
  readonly validationData?: readonly TrainingDataPoint[];
  readonly options?: {
    readonly saveCheckpoints?: boolean;
    readonly logMetrics?: boolean;
    readonly notifyOnComplete?: boolean;
  };
}

/**
 * Training Job Status.
 *
 * @example
 */
export interface TrainingJob extends EntityFields, TimestampFields {
  readonly networkId: string;
  readonly status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  readonly progress: number; // 0-100
  readonly currentEpoch?: number;
  readonly totalEpochs: number;
  readonly metrics?: {
    readonly epoch: number;
    readonly loss: number;
    readonly accuracy?: number;
    readonly valLoss?: number;
    readonly valAccuracy?: number;
    readonly learningRate?: number;
  }[];
  readonly estimatedCompletion?: Date;
  readonly error?: string;
  readonly config: TrainingConfig;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
}

/**
 * Prediction Request.
 *
 * @example
 */
export interface PredictionRequest {
  readonly input: readonly number[];
  readonly options?: {
    readonly includeConfidence?: boolean;
    readonly includeIntermediateOutputs?: boolean;
    readonly temperature?: number; // For probabilistic models
  };
}

/**
 * Prediction Response.
 *
 * @example
 */
export interface PredictionResponse {
  readonly output: readonly number[];
  readonly confidence?: number; // 0-1
  readonly probabilities?: readonly number[]; // For classification
  readonly intermediateOutputs?: Record<string, readonly number[]>;
  readonly processingTime: number; // in milliseconds
  readonly timestamp: string;
}

/**
 * Model Evaluation Metrics.
 *
 * @example
 */
export interface EvaluationMetrics {
  readonly accuracy?: number;
  readonly precision?: number;
  readonly recall?: number;
  readonly f1Score?: number;
  readonly loss: number;
  readonly confusionMatrix?: readonly (readonly number[])[];
  readonly rocAuc?: number;
  readonly mse?: number;
  readonly mae?: number;
  readonly customMetrics?: Record<string, number>;
}

/**
 * Model Export Configuration.
 *
 * @example
 */
export interface ModelExportConfig {
  readonly format: 'onnx' | 'tensorflow' | 'pytorch' | 'keras' | 'json';
  readonly includeWeights: boolean;
  readonly includeOptimizer?: boolean;
  readonly quantization?: {
    readonly enabled: boolean;
    readonly bits: 8 | 16 | 32;
  };
  readonly optimization?: {
    readonly pruning?: boolean;
    readonly compression?: boolean;
  };
}

/**
 * Model Import Configuration.
 *
 * @example
 */
export interface ModelImportConfig {
  readonly format: 'onnx' | 'tensorflow' | 'pytorch' | 'keras' | 'json';
  readonly validateArchitecture?: boolean;
  readonly loadWeights?: boolean;
  readonly freezeLayers?: readonly string[];
}

// OpenAPI 3.0 Schema Definitions
export const NeuralSchemas = {
  NeuralLayer: {
    type: 'object',
    required: ['type', 'size', 'activation'],
    properties: {
      type: {
        type: 'string',
        enum: ['input', 'hidden', 'output', 'convolutional', 'pooling', 'dropout', 'batch_norm'],
        description: 'Layer type',
      },
      size: {
        type: 'integer',
        minimum: 1,
        description: 'Number of neurons/units in the layer',
      },
      activation: {
        type: 'string',
        enum: ['relu', 'sigmoid', 'tanh', 'softmax', 'linear', 'leaky_relu', 'gelu'],
        description: 'Activation function',
      },
      dropout: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'Dropout rate (0-1)',
      },
      kernelSize: {
        type: 'array',
        items: { type: 'integer', minimum: 1 },
        minItems: 2,
        maxItems: 2,
        description: 'Kernel size for convolutional layers [height, width]',
      },
      stride: {
        type: 'array',
        items: { type: 'integer', minimum: 1 },
        minItems: 2,
        maxItems: 2,
        description: 'Stride for convolutional/pooling layers [height, width]',
      },
      padding: {
        type: 'string',
        enum: ['valid', 'same'],
        description: 'Padding type for convolutional layers',
      },
    },
  },

  NeuralNetwork: {
    type: 'object',
    required: ['id', 'type', 'status', 'layers', 'created'],
    properties: {
      id: {
        type: 'string',
        pattern: '^neural-[0-9a-z]+-[0-9a-z]+$',
        description: 'Unique neural network identifier',
      },
      type: {
        type: 'string',
        enum: ['feedforward', 'convolutional', 'recurrent', 'transformer', 'autoencoder', 'gan'],
        description: 'Neural network architecture type',
      },
      name: {
        type: 'string',
        maxLength: 100,
        description: 'Human-readable network name',
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Network description',
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'pending', 'error', 'deleted'],
        description: 'Current network status',
      },
      layers: {
        type: 'array',
        items: { $ref: '#/components/schemas/NeuralLayer' },
        minItems: 1,
        description: 'Network layer configuration',
      },
      parameters: {
        type: 'object',
        properties: {
          totalParams: { type: 'integer', minimum: 0 },
          trainableParams: { type: 'integer', minimum: 0 },
          nonTrainableParams: { type: 'integer', minimum: 0 },
        },
      },
      performance: {
        type: 'object',
        properties: {
          accuracy: { type: 'number', minimum: 0, maximum: 1 },
          loss: { type: 'number', minimum: 0 },
          trainingTime: { type: 'number', minimum: 0 },
          epochs: { type: 'integer', minimum: 0 },
        },
      },
      created: {
        type: 'string',
        format: 'date-time',
      },
      lastTrained: {
        type: 'string',
        format: 'date-time',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Network tags for organization',
      },
    },
  },

  TrainingConfig: {
    type: 'object',
    required: ['epochs', 'batchSize', 'learningRate', 'optimizer', 'lossFunction'],
    properties: {
      epochs: {
        type: 'integer',
        minimum: 1,
        maximum: 10000,
        description: 'Number of training epochs',
      },
      batchSize: {
        type: 'integer',
        minimum: 1,
        maximum: 1000,
        default: 32,
        description: 'Training batch size',
      },
      learningRate: {
        type: 'number',
        minimum: 0.0001,
        maximum: 1.0,
        default: 0.001,
        description: 'Learning rate',
      },
      optimizer: {
        type: 'string',
        enum: ['adam', 'sgd', 'rmsprop', 'adagrad'],
        default: 'adam',
        description: 'Optimization algorithm',
      },
      lossFunction: {
        type: 'string',
        enum: [
          'mse',
          'categorical_crossentropy',
          'binary_crossentropy',
          'sparse_categorical_crossentropy',
        ],
        description: 'Loss function',
      },
      validationSplit: {
        type: 'number',
        minimum: 0,
        maximum: 0.5,
        default: 0.2,
        description: 'Fraction of data for validation',
      },
    },
  },

  TrainingRequest: {
    type: 'object',
    required: ['networkId', 'trainingData', 'config'],
    properties: {
      networkId: {
        type: 'string',
        description: 'ID of neural network to train',
      },
      trainingData: {
        type: 'array',
        items: {
          type: 'object',
          required: ['input', 'output'],
          properties: {
            input: {
              type: 'array',
              items: { type: 'number' },
              description: 'Input features',
            },
            output: {
              type: 'array',
              items: { type: 'number' },
              description: 'Expected output',
            },
            weight: {
              type: 'number',
              minimum: 0,
              default: 1,
              description: 'Sample weight',
            },
          },
        },
        minItems: 1,
        description: 'Training dataset',
      },
      config: {
        $ref: '#/components/schemas/TrainingConfig',
      },
      validationData: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/TrainingDataPoint',
        },
        description: 'Validation dataset',
      },
    },
  },

  TrainingJob: {
    type: 'object',
    required: ['id', 'networkId', 'status', 'progress', 'totalEpochs', 'config', 'created'],
    properties: {
      id: {
        type: 'string',
        description: 'Training job ID',
      },
      networkId: {
        type: 'string',
        description: 'Associated network ID',
      },
      status: {
        type: 'string',
        enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
        description: 'Training job status',
      },
      progress: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Training progress percentage',
      },
      currentEpoch: {
        type: 'integer',
        minimum: 0,
        description: 'Current training epoch',
      },
      totalEpochs: {
        type: 'integer',
        minimum: 1,
        description: 'Total epochs to train',
      },
      created: {
        type: 'string',
        format: 'date-time',
      },
      startedAt: {
        type: 'string',
        format: 'date-time',
      },
      completedAt: {
        type: 'string',
        format: 'date-time',
      },
      estimatedCompletion: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  PredictionRequest: {
    type: 'object',
    required: ['input'],
    properties: {
      input: {
        type: 'array',
        items: { type: 'number' },
        description: 'Input data for prediction',
      },
      options: {
        type: 'object',
        properties: {
          includeConfidence: {
            type: 'boolean',
            default: false,
            description: 'Include confidence score in response',
          },
          includeIntermediateOutputs: {
            type: 'boolean',
            default: false,
            description: 'Include intermediate layer outputs',
          },
          temperature: {
            type: 'number',
            minimum: 0.1,
            maximum: 2.0,
            default: 1.0,
            description: 'Sampling temperature for probabilistic models',
          },
        },
      },
    },
  },

  PredictionResponse: {
    type: 'object',
    required: ['output', 'processingTime', 'timestamp'],
    properties: {
      output: {
        type: 'array',
        items: { type: 'number' },
        description: 'Prediction output',
      },
      confidence: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'Prediction confidence score',
      },
      probabilities: {
        type: 'array',
        items: { type: 'number' },
        description: 'Class probabilities for classification',
      },
      processingTime: {
        type: 'number',
        minimum: 0,
        description: 'Processing time in milliseconds',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'When prediction was made',
      },
    },
  },
} as const;
