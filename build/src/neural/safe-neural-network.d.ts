/**
 * @file Neural network: safe-neural-network.
 */
/**
 * Safe Neural Network Operations.
 *
 * Provides type-safe neural network operations with proper union type handling.
 * For training, inference, and error scenarios.
 */
import { type NeuralResult } from '../utils/type-guards.ts';
export interface NeuralNetworkConfig {
    layers: number[];
    activationFunction: 'sigmoid' | 'tanh' | 'relu' | 'leaky_relu';
    learningRate: number;
    useWasm: boolean;
    batchSize?: number;
    momentum?: number;
}
export interface TrainingData {
    inputs: number[][];
    outputs: number[][];
    validationInputs?: number[][];
    validationOutputs?: number[][];
}
export interface TrainingOptions {
    epochs: number;
    batchSize?: number;
    validationSplit?: number;
    earlyStop?: boolean;
    patience?: number;
    verbose?: boolean;
}
/**
 * Type-safe neural network implementation with union type results.
 *
 * @example
 */
export declare class SafeNeuralNetwork {
    private config;
    private weights;
    private biases;
    private isInitialized;
    private isTrained;
    private wasmModule;
    constructor(config: NeuralNetworkConfig);
    /**
     * Initialize the neural network with type-safe result.
     */
    initialize(): Promise<NeuralResult>;
    /**
     * Train the neural network with type-safe result handling.
     *
     * @param data
     * @param options
     */
    train(data: TrainingData, options: TrainingOptions): Promise<NeuralResult>;
    /**
     * Make predictions with type-safe result handling.
     *
     * @param inputs
     */
    predict(inputs: number[]): Promise<NeuralResult>;
    private initializeWeights;
    private initializeWasm;
    private trainEpoch;
    private validateNetwork;
    private predictWithWasm;
    private predictWithJavaScript;
    private calculateConfidence;
    private calculateAccuracy;
}
/**
 * Example function showing safe neural network usage.
 *
 * @example
 */
export declare function safeNeuralUsageExample(): Promise<void>;
//# sourceMappingURL=safe-neural-network.d.ts.map