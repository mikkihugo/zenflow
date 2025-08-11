/**
 * Neural Network API Schemas.
 *
 * OpenAPI 3.0 schemas for neural network domain.
 * Consolidates neural network types and validation schemas.
 *
 * @file Neural network API schemas and types.
 */
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
};
