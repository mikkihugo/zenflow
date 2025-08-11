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
    readonly type: 'input' | 'hidden' | 'output' | 'convolutional' | 'pooling' | 'dropout' | 'batch_norm';
    readonly size: number;
    readonly activation: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' | 'leaky_relu' | 'gelu';
    readonly dropout?: number;
    readonly kernelSize?: readonly [number, number];
    readonly stride?: readonly [number, number];
    readonly padding?: 'valid' | 'same';
}
/**
 * Neural Network Architecture.
 *
 * @example
 */
export interface NeuralNetwork extends EntityFields, TimestampFields, ResourceState {
    readonly type: 'feedforward' | 'convolutional' | 'recurrent' | 'transformer' | 'autoencoder' | 'gan';
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
        readonly trainingTime?: number;
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
    readonly lossFunction: 'mse' | 'categorical_crossentropy' | 'binary_crossentropy' | 'sparse_categorical_crossentropy';
    readonly metrics?: readonly string[];
    readonly validationSplit?: number;
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
    readonly weight?: number;
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
    readonly progress: number;
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
        readonly temperature?: number;
    };
}
/**
 * Prediction Response.
 *
 * @example
 */
export interface PredictionResponse {
    readonly output: readonly number[];
    readonly confidence?: number;
    readonly probabilities?: readonly number[];
    readonly intermediateOutputs?: Record<string, readonly number[]>;
    readonly processingTime: number;
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
export declare const NeuralSchemas: {
    readonly NeuralLayer: {
        readonly type: "object";
        readonly required: readonly ["type", "size", "activation"];
        readonly properties: {
            readonly type: {
                readonly type: "string";
                readonly enum: readonly ["input", "hidden", "output", "convolutional", "pooling", "dropout", "batch_norm"];
                readonly description: "Layer type";
            };
            readonly size: {
                readonly type: "integer";
                readonly minimum: 1;
                readonly description: "Number of neurons/units in the layer";
            };
            readonly activation: {
                readonly type: "string";
                readonly enum: readonly ["relu", "sigmoid", "tanh", "softmax", "linear", "leaky_relu", "gelu"];
                readonly description: "Activation function";
            };
            readonly dropout: {
                readonly type: "number";
                readonly minimum: 0;
                readonly maximum: 1;
                readonly description: "Dropout rate (0-1)";
            };
            readonly kernelSize: {
                readonly type: "array";
                readonly items: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
                readonly minItems: 2;
                readonly maxItems: 2;
                readonly description: "Kernel size for convolutional layers [height, width]";
            };
            readonly stride: {
                readonly type: "array";
                readonly items: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
                readonly minItems: 2;
                readonly maxItems: 2;
                readonly description: "Stride for convolutional/pooling layers [height, width]";
            };
            readonly padding: {
                readonly type: "string";
                readonly enum: readonly ["valid", "same"];
                readonly description: "Padding type for convolutional layers";
            };
        };
    };
    readonly NeuralNetwork: {
        readonly type: "object";
        readonly required: readonly ["id", "type", "status", "layers", "created"];
        readonly properties: {
            readonly id: {
                readonly type: "string";
                readonly pattern: "^neural-[0-9a-z]+-[0-9a-z]+$";
                readonly description: "Unique neural network identifier";
            };
            readonly type: {
                readonly type: "string";
                readonly enum: readonly ["feedforward", "convolutional", "recurrent", "transformer", "autoencoder", "gan"];
                readonly description: "Neural network architecture type";
            };
            readonly name: {
                readonly type: "string";
                readonly maxLength: 100;
                readonly description: "Human-readable network name";
            };
            readonly description: {
                readonly type: "string";
                readonly maxLength: 500;
                readonly description: "Network description";
            };
            readonly status: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive", "pending", "error", "deleted"];
                readonly description: "Current network status";
            };
            readonly layers: {
                readonly type: "array";
                readonly items: {
                    readonly $ref: "#/components/schemas/NeuralLayer";
                };
                readonly minItems: 1;
                readonly description: "Network layer configuration";
            };
            readonly parameters: {
                readonly type: "object";
                readonly properties: {
                    readonly totalParams: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly trainableParams: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly nonTrainableParams: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
            readonly performance: {
                readonly type: "object";
                readonly properties: {
                    readonly accuracy: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 1;
                    };
                    readonly loss: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly trainingTime: {
                        readonly type: "number";
                        readonly minimum: 0;
                    };
                    readonly epochs: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
            readonly created: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly lastTrained: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly tags: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Network tags for organization";
            };
        };
    };
    readonly TrainingConfig: {
        readonly type: "object";
        readonly required: readonly ["epochs", "batchSize", "learningRate", "optimizer", "lossFunction"];
        readonly properties: {
            readonly epochs: {
                readonly type: "integer";
                readonly minimum: 1;
                readonly maximum: 10000;
                readonly description: "Number of training epochs";
            };
            readonly batchSize: {
                readonly type: "integer";
                readonly minimum: 1;
                readonly maximum: 1000;
                readonly default: 32;
                readonly description: "Training batch size";
            };
            readonly learningRate: {
                readonly type: "number";
                readonly minimum: 0.0001;
                readonly maximum: 1;
                readonly default: 0.001;
                readonly description: "Learning rate";
            };
            readonly optimizer: {
                readonly type: "string";
                readonly enum: readonly ["adam", "sgd", "rmsprop", "adagrad"];
                readonly default: "adam";
                readonly description: "Optimization algorithm";
            };
            readonly lossFunction: {
                readonly type: "string";
                readonly enum: readonly ["mse", "categorical_crossentropy", "binary_crossentropy", "sparse_categorical_crossentropy"];
                readonly description: "Loss function";
            };
            readonly validationSplit: {
                readonly type: "number";
                readonly minimum: 0;
                readonly maximum: 0.5;
                readonly default: 0.2;
                readonly description: "Fraction of data for validation";
            };
        };
    };
    readonly TrainingRequest: {
        readonly type: "object";
        readonly required: readonly ["networkId", "trainingData", "config"];
        readonly properties: {
            readonly networkId: {
                readonly type: "string";
                readonly description: "ID of neural network to train";
            };
            readonly trainingData: {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                    readonly required: readonly ["input", "output"];
                    readonly properties: {
                        readonly input: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "number";
                            };
                            readonly description: "Input features";
                        };
                        readonly output: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "number";
                            };
                            readonly description: "Expected output";
                        };
                        readonly weight: {
                            readonly type: "number";
                            readonly minimum: 0;
                            readonly default: 1;
                            readonly description: "Sample weight";
                        };
                    };
                };
                readonly minItems: 1;
                readonly description: "Training dataset";
            };
            readonly config: {
                readonly $ref: "#/components/schemas/TrainingConfig";
            };
            readonly validationData: {
                readonly type: "array";
                readonly items: {
                    readonly $ref: "#/components/schemas/TrainingDataPoint";
                };
                readonly description: "Validation dataset";
            };
        };
    };
    readonly TrainingJob: {
        readonly type: "object";
        readonly required: readonly ["id", "networkId", "status", "progress", "totalEpochs", "config", "created"];
        readonly properties: {
            readonly id: {
                readonly type: "string";
                readonly description: "Training job ID";
            };
            readonly networkId: {
                readonly type: "string";
                readonly description: "Associated network ID";
            };
            readonly status: {
                readonly type: "string";
                readonly enum: readonly ["pending", "running", "completed", "failed", "cancelled"];
                readonly description: "Training job status";
            };
            readonly progress: {
                readonly type: "number";
                readonly minimum: 0;
                readonly maximum: 100;
                readonly description: "Training progress percentage";
            };
            readonly currentEpoch: {
                readonly type: "integer";
                readonly minimum: 0;
                readonly description: "Current training epoch";
            };
            readonly totalEpochs: {
                readonly type: "integer";
                readonly minimum: 1;
                readonly description: "Total epochs to train";
            };
            readonly created: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly startedAt: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly completedAt: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly estimatedCompletion: {
                readonly type: "string";
                readonly format: "date-time";
            };
        };
    };
    readonly PredictionRequest: {
        readonly type: "object";
        readonly required: readonly ["input"];
        readonly properties: {
            readonly input: {
                readonly type: "array";
                readonly items: {
                    readonly type: "number";
                };
                readonly description: "Input data for prediction";
            };
            readonly options: {
                readonly type: "object";
                readonly properties: {
                    readonly includeConfidence: {
                        readonly type: "boolean";
                        readonly default: false;
                        readonly description: "Include confidence score in response";
                    };
                    readonly includeIntermediateOutputs: {
                        readonly type: "boolean";
                        readonly default: false;
                        readonly description: "Include intermediate layer outputs";
                    };
                    readonly temperature: {
                        readonly type: "number";
                        readonly minimum: 0.1;
                        readonly maximum: 2;
                        readonly default: 1;
                        readonly description: "Sampling temperature for probabilistic models";
                    };
                };
            };
        };
    };
    readonly PredictionResponse: {
        readonly type: "object";
        readonly required: readonly ["output", "processingTime", "timestamp"];
        readonly properties: {
            readonly output: {
                readonly type: "array";
                readonly items: {
                    readonly type: "number";
                };
                readonly description: "Prediction output";
            };
            readonly confidence: {
                readonly type: "number";
                readonly minimum: 0;
                readonly maximum: 1;
                readonly description: "Prediction confidence score";
            };
            readonly probabilities: {
                readonly type: "array";
                readonly items: {
                    readonly type: "number";
                };
                readonly description: "Class probabilities for classification";
            };
            readonly processingTime: {
                readonly type: "number";
                readonly minimum: 0;
                readonly description: "Processing time in milliseconds";
            };
            readonly timestamp: {
                readonly type: "string";
                readonly format: "date-time";
                readonly description: "When prediction was made";
            };
        };
    };
};
//# sourceMappingURL=neural.d.ts.map