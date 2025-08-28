/**
 * @fileoverview Brain.js Neural Network Bridge
 *
 * JavaScript complement to the Rust/WASM neural network implementation.
 * Provides easy-to-use neural networks using the brain.js library for rapid
 * prototyping and JavaScript-native scenarios.
 *
 * Features:
 * - Simple neural network creation and training
 * - Feed-forward, RNN, LSTM, and GRU networks
 * - Foundation error handling patterns (Result types)
 * - Integration with existing neural coordination
 * - Professional Google TypeScript naming conventions
 *
 * @example Basic Usage
 * ```typescript`
 * const bridge = container.get(BrainJsBridge);
 * await bridge.initialize();
 *
 * const networkId = await bridge.createNeuralNet('classifier',    'feedforward', {
 *   hiddenLayers:[10, 5],
 *   activation:'relu') *});
 *
 * const result = await bridge.trainNeuralNet(networkId, trainingData);
 * ```
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { type ContextError, type Logger, type Result} from '@claude-zen/foundation';
import type { ActivationFunction, ModelMetrics} from './types/index';
/**
 * Configuration for brain.js neural networks
 */
export interface BrainJsConfig {
    /** Default learning rate for training */
    readonly learningRate?:number;
    /** Default number of iterations for training */
    readonly iterations?:number;
    /** Error threshold for training completion */
    readonly errorThreshold?:number;
    /** Enable GPU acceleration (experimental) */
    readonly gpu?:boolean;
    /** Enable logging of training progress */
    readonly logPeriod?:number;
    /** Timeout for training operations (ms) */
    readonly timeout?:number;
    /** Enable memory optimization */
    readonly memoryOptimization?:boolean;
}
/**
 * Network configuration for brain.js networks
 */
export interface BrainJsNetworkConfig {
    /** Type of neural network */
    readonly type:'feedforward' | ' rnn' | ' lstm' | ' gru';
    /** Hidden layer sizes (for feedforward networks) */
    readonly hiddenLayers?:readonly number[];
    /** Input size (for RNN/LSTM/GRU networks) */
    readonly inputSize?:number;
    /** Output size (for RNN/LSTM/GRU networks) */
    readonly outputSize?:number;
    /** Activation function */
    readonly activation?:ActivationFunction;
    /** Learning rate for this specific network */
    readonly learningRate?:number;
    /** Binary threshold (for binary classification) */
    readonly binaryThresh?:number;
    /** Enable bias neurons */
    readonly bias?:boolean;
}
/**
 * Training data format for brain.js
 */
export interface BrainJsTrainingData {
    /** Input data */
    readonly input:number[] | Record<string, number>;
    /** Expected output */
    readonly output:number[] | Record<string, number>;
}
/**
 * Training options for brain.js networks
 */
export interface BrainJsTrainingOptions {
    /** Maximum number of training iterations */
    readonly iterations?:number;
    /** Target error threshold */
    readonly errorThreshold?:number;
    /** Logging period for training progress */
    readonly logPeriod?:number;
    /** Learning rate */
    readonly learningRate?:number;
    /** Momentum for training */
    readonly momentum?:number;
    /** Callback function for training progress */
    readonly callback?:(stats: any) => void;
    /** Period for calling the callback */
    readonly callbackPeriod?:number;
    /** Timeout for training */
    readonly timeout?:number;
}
/**
 * Prediction result from brain.js networks
 */
export interface BrainJsPredictionResult {
    /** Network output */
    readonly output:number[] | Record<string, number>;
    /** Confidence score (if available) */
    readonly confidence?:number;
    /** Processing time in milliseconds */
    readonly processingTime:number;
    /** Additional metadata */
    readonly metadata?:Record<string, unknown>;
}
/**
 * Neural network instance for brain.js
 */
export interface BrainJsNetworkInstance {
    /** Unique network identifier */
    readonly id:string;
    /** Network type */
    readonly type:BrainJsNetworkConfig['type'];
    /** The actual brain.js network instance */
    readonly network:any;
    /** Network configuration */
    readonly config:BrainJsNetworkConfig;
    /** Current training state */
    readonly trainingState:{
        readonly isTrained:boolean;
        readonly isTraining:boolean;
        readonly iterations:number;
        readonly error:number;
        readonly lastTrainingTime?:string;
};
    /** Network metadata */
    readonly metadata:{
        readonly created:string;
        readonly updated:string;
        readonly inputSize?:number;
        readonly outputSize?:number;
        readonly parameterCount?:number;
};
}
/**
 * Brain.js Neural Network Bridge
 *
 * Provides JavaScript-native neural networks using brain.js as a complement
 * to the high-performance Rust/WASM implementation. Optimized for:
 * - Rapid prototyping and experimentation
 * - JavaScript-specific use cases
 * - Simple neural network scenarios
 * - Integration with existing coordination system
 *
 * @example Creating and training a feedforward network
 * ```typescript`
 * const bridge = container.get(BrainJsBridge);
 * await bridge.initialize();
 *
 * const result = await bridge.createNeuralNet('xor-classifier',    'feedforward', {
 *   hiddenLayers:[4],
 *   activation:'sigmoid') *});
 *
 * if (result.isOk()) {
 *   const trainingData = [
 *     { input:[0, 0], output:[0]},
 *     { input:[0, 1], output:[1]},
 *     { input:[1, 0], output:[1]},
 *     { input:[1, 1], output:[0]}
 *];
 *
 *   const trainResult = await bridge.trainNeuralNet(result.value, trainingData);
 *}
 * ````
 */
export declare class BrainJsBridge {
    private foundationLogger;
    private networks;
    private config;
    private initialized;
    private dbAccess;
    constructor(foundationLogger:Logger, config?:BrainJsConfig);
    /**
     * Initialize the brain.js bridge
     */
    initialize():Promise<Result<void, ContextError>>;
    /**
     * Create a new brain.js neural network
     *
     * @param id - Unique network identifier
     * @param type - Type of neural network to create
     * @param config - Network configuration
     * @returns Result containing the network ID or error
     */
    createNeuralNet(id:string, type:BrainJsNetworkConfig['type'], config:Omit<BrainJsNetworkConfig, ' type'>, :any): Promise<Result<string, ContextError>>;
    /**
     * Train a brain.js neural network
     *
     * @param networkId - ID of the network to train
     * @param trainingData - Training data for the network
     * @param options - Training options
     * @returns Result containing training success status or error
     */
    trainNeuralNet(networkId:string, trainingData:readonly BrainJsTrainingData[], options?:BrainJsTrainingOptions): Promise<Result<ModelMetrics, ContextError>>;
    /**
     * Make a prediction with a brain.js neural network
     *
     * @param networkId - ID of the network to use for prediction
     * @param input - Input data for prediction
     * @returns Result containing prediction result or error
     */
    predictWithNeuralNet(networkId:string, input:number[] | Record<string, number>):Promise<Result<BrainJsPredictionResult, ContextError>>;
    /**
     * Get network information
     *
     * @param networkId - ID of the network
     * @returns Result containing network instance or error
     */
    getNetworkInfo(networkId:string): Result<BrainJsNetworkInstance, ContextError>;
    /**
     * List all brain.js networks
     *
     * @returns Array of network instances
     */
    listNetworks():BrainJsNetworkInstance[];
    /**
     * Remove a brain.js network
     *
     * @param networkId - ID of the network to remove
     * @returns Success status
     */
    removeNetwork(networkId:string): Promise<Result<boolean, ContextError>>;
    /**
     * Export a trained network to JSON
     *
     * @param networkId - ID of the network to export
     * @returns Result containing JSON representation or error
     */
    exportNetwork(networkId:string): Result<object, ContextError>;
    /**
     * Import a network from JSON
     *
     * @param networkData - JSON representation of the network
     * @returns Result containing the network ID or error
     */
    importNetwork(networkData:any): Promise<Result<string, ContextError>>;
    /**
     * Get brain.js bridge statistics
     *
     * @returns Statistics about the bridge and networks
     */
    getStats():{
        totalNetworks:number;
        trainedNetworks:number;
        trainingNetworks:number;
        networkTypes:Record<string, number>;
        memoryUsage:number;
};
    /**
     * Shutdown the brain.js bridge
     */
    shutdown():Promise<Result<void, ContextError>>;
    /**
     * Initialize database schema for brain.js networks
     */
    private initializeDatabaseSchema;
    /**
     * Estimate parameter count for a network
     */
    private estimateParameterCount;
    /**
     * Estimate memory usage of all networks
     */
    private estimateMemoryUsage;
}
export declare function createBrainJsNetwork(id:string, type:BrainJsNetworkConfig['type'], config:Omit<BrainJsNetworkConfig, ' type'>, bridgeConfig?:BrainJsConfig): Promise<Result<string, ContextError>>;
export declare function trainBrainJsNetwork(bridge:BrainJsBridge, networkId:string, trainingData:readonly BrainJsTrainingData[], options?:BrainJsTrainingOptions): Promise<Result<ModelMetrics, ContextError>>;
export declare function predictWithBrainJsNetwork(bridge:BrainJsBridge, networkId:string, input:number[] | Record<string, number>):Promise<Result<BrainJsPredictionResult, ContextError>>;
//# sourceMappingURL=brain-js-bridge.d.ts.map