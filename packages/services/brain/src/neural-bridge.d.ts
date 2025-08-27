/**
 * @file Neural Network Bridge
 * Integrates neural network components with Claude-Zen system.
 * Enhanced with SmartNeuralCoordinator for intelligent neural backend system.
 */
import { type Logger } from '@claude-zen/foundation';
import { type NeuralBackendConfig } from './smart-neural-coordinator';
export interface NeuralConfig {
    wasmPath?: string;
    gpuAcceleration?: boolean;
    modelPath?: string;
    enableTraining?: boolean;
    smartNeuralBackend?: NeuralBackendConfig;
}
export interface NeuralNetwork {
    id: string;
    type: 'feedforward|lstm|transformer|autoencoder;;
    layers: number[];
    weights?: Float32Array;
    status: 'idle|training|predicting|error;;
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
    type: 'feedforward|lstm|transformer|autoencoder|cnn|gnn;;
    layers: number[];
    activation: ActivationFunction;
    outputActivation?: ActivationFunction;
    learningRate: number;
    batchSize: number;
    epochs?: number;
    metadata?: Record<string, unknown>;
}
export type ActivationFunction = 'sigmoid|tanh|relu|leaky_relu|softmax|linear|swish|gelu;;
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
    constructor(foundationLogger?: Logger, config?: NeuralConfig);
    static getInstance(logger?: Logger, _config?: NeuralConfig): NeuralBridge;
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
    createNetwork(id: string, type: NeuralNetwork['type'], layers: number[]): Promise<string>;
}
export declare function createNeuralNetwork(id: string, type: NeuralNetwork['type'], layers: number[], config?: NeuralConfig): Promise<string>;
export declare function trainNeuralNetwork(networkId: string, trainingData: TrainingData, epochs?: number): Promise<boolean>;
export declare function predictWithNetwork(networkId: string, inputs: number[]): Promise<PredictionResult>;
//# sourceMappingURL=neural-bridge.d.ts.map