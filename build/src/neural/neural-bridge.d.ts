/**
 * @file Neural Network Bridge
 * Integrates neural network components with Claude-Zen system.
 */
export interface NeuralConfig {
    wasmPath?: string;
    gpuAcceleration?: boolean;
    modelPath?: string;
    enableTraining?: boolean;
}
export interface NeuralNetwork {
    id: string;
    type: 'feedforward' | 'lstm' | 'transformer' | 'autoencoder';
    layers: number[];
    weights?: Float64Array;
    status: 'idle' | 'training' | 'predicting' | 'error';
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
/**
 * Neural Network Bridge for Claude-Zen integration.
 *
 * @example
 */
export declare class NeuralBridge {
    private static instance;
    private networks;
    private config;
    private initialized;
    constructor(config?: NeuralConfig);
    static getInstance(config?: NeuralConfig): NeuralBridge;
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
    /**
     * Train a neural network.
     *
     * @param networkId
     * @param trainingData
     * @param epochs
     */
    trainNetwork(networkId: string, trainingData: TrainingData, epochs?: number): Promise<boolean>;
    /**
     * Make predictions with a neural network.
     *
     * @param networkId
     * @param inputs
     */
    predict(networkId: string, inputs: number[]): Promise<PredictionResult>;
    /**
     * Get network status.
     *
     * @param networkId
     */
    getNetworkStatus(networkId: string): NeuralNetwork | undefined;
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
    private simulateTraining;
    private simulatePrediction;
    /**
     * Shutdown neural bridge.
     */
    shutdown(): Promise<void>;
}
export declare function createNeuralNetwork(id: string, type: NeuralNetwork['type'], layers: number[], config?: NeuralConfig): Promise<string>;
export declare function trainNeuralNetwork(networkId: string, trainingData: TrainingData, epochs?: number): Promise<boolean>;
export declare function predictWithNetwork(networkId: string, inputs: number[]): Promise<PredictionResult>;
//# sourceMappingURL=neural-bridge.d.ts.map