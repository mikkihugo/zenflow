/**
 * Neural Network Core Implementation.
 *
 * TypeScript wrapper for WASM neural network functionality.
 * Consolidated from swarm-zen/neural-network.ts with enhanced type safety.
 */
/**
 * @file Neural network: network.
 */
export interface NetworkConfig {
    inputSize: number;
    hiddenLayers: LayerConfig[];
    outputSize: number;
    outputActivation: string;
    connectionRate?: number;
    randomSeed?: number;
}
export interface LayerConfig {
    size: number;
    activation: string;
    steepness?: number;
}
export interface TrainingDataConfig {
    inputs: number[][];
    outputs: number[][];
}
export interface TrainingConfig {
    algorithm: 'incremental_backprop' | 'batch_backprop' | 'rprop' | 'quickprop' | 'sarprop';
    learningRate?: number;
    momentum?: number;
    maxEpochs: number;
    targetError: number;
    validationSplit?: number;
    earlyStopping?: boolean;
}
export interface AgentNetworkConfig {
    agentId: string;
    agentType: string;
    cognitivePattern: 'convergent' | 'divergent' | 'lateral' | 'systems' | 'critical' | 'abstract';
    inputSize: number;
    outputSize: number;
    taskSpecialization?: string[];
}
export interface CascadeConfig {
    maxHiddenNeurons: number;
    numCandidates: number;
    outputMaxEpochs: number;
    candidateMaxEpochs: number;
    outputLearningRate: number;
    candidateLearningRate: number;
    outputTargetError: number;
    candidateTargetCorrelation: number;
    minCorrelationImprovement: number;
    candidateWeightMin: number;
    candidateWeightMax: number;
    candidateActivations: string[];
    verbose: boolean;
}
export interface NetworkInfo {
    numLayers: number;
    numInputs: number;
    numOutputs: number;
    totalNeurons: number;
    totalConnections: number;
    metrics: {
        trainingError: number;
        validationError: number;
        epochsTrained: number;
        totalConnections: number;
        memoryUsage: number;
    };
}
export interface TrainingResult {
    converged: boolean;
    finalError: number;
    epochs: number;
    targetError: number;
}
export interface CognitiveState {
    agentId: string;
    cognitivePattern: any;
    neuralArchitecture: {
        layers: number;
        neurons: number;
        connections: number;
    };
    trainingProgress: {
        epochsTrained: number;
        currentLoss: number;
        bestLoss: number;
        isTraining: boolean;
    };
    performance: any;
    adaptationHistoryLength: number;
}
export declare const ACTIVATION_FUNCTIONS: {
    readonly LINEAR: "linear";
    readonly SIGMOID: "sigmoid";
    readonly SIGMOID_SYMMETRIC: "sigmoid_symmetric";
    readonly TANH: "tanh";
    readonly GAUSSIAN: "gaussian";
    readonly GAUSSIAN_SYMMETRIC: "gaussian_symmetric";
    readonly ELLIOT: "elliot";
    readonly ELLIOT_SYMMETRIC: "elliot_symmetric";
    readonly RELU: "relu";
    readonly RELU_LEAKY: "relu_leaky";
    readonly COS: "cos";
    readonly COS_SYMMETRIC: "cos_symmetric";
    readonly SIN: "sin";
    readonly SIN_SYMMETRIC: "sin_symmetric";
    readonly THRESHOLD: "threshold";
    readonly THRESHOLD_SYMMETRIC: "threshold_symmetric";
    readonly LINEAR_PIECE: "linear_piece";
    readonly LINEAR_PIECE_SYMMETRIC: "linear_piece_symmetric";
};
export declare const TRAINING_ALGORITHMS: {
    readonly INCREMENTAL_BACKPROP: "incremental_backprop";
    readonly BATCH_BACKPROP: "batch_backprop";
    readonly RPROP: "rprop";
    readonly QUICKPROP: "quickprop";
    readonly SARPROP: "sarprop";
};
export declare const COGNITIVE_PATTERNS: {
    readonly CONVERGENT: "convergent";
    readonly DIVERGENT: "divergent";
    readonly LATERAL: "lateral";
    readonly SYSTEMS: "systems";
    readonly CRITICAL: "critical";
    readonly ABSTRACT: "abstract";
};
/**
 * Initialize the WASM neural network module.
 *
 * @example
 */
export declare function initializeNeuralWasm(): Promise<any>;
/**
 * Neural Network wrapper for WASM implementation.
 *
 * @example
 */
export declare class NeuralNetwork {
    private wasm;
    private network;
    constructor(wasm: any, config: NetworkConfig);
    /**
     * Run inference on the network.
     *
     * @param inputs
     */
    run(inputs: number[]): Promise<number[]>;
    /**
     * Get network weights.
     */
    getWeights(): Float32Array;
    /**
     * Set network weights.
     *
     * @param weights
     */
    setWeights(weights: Float32Array): void;
    /**
     * Get network information and metrics.
     */
    getInfo(): NetworkInfo;
    /**
     * Set training data for the network.
     *
     * @param data
     */
    setTrainingData(data: TrainingDataConfig): void;
    /**
     * Get internal network reference for training.
     */
    getInternalNetwork(): any;
}
/**
 * Neural Network trainer with various algorithms.
 *
 * @example
 */
export declare class NeuralTrainer {
    private wasm;
    private trainer;
    constructor(wasm: any, config: TrainingConfig);
    /**
     * Train a single epoch.
     *
     * @param network
     * @param data
     */
    trainEpoch(network: NeuralNetwork, data: TrainingDataConfig): Promise<number>;
    /**
     * Train until target error is reached.
     *
     * @param network
     * @param data
     * @param targetError
     * @param maxEpochs
     */
    trainUntilTarget(network: NeuralNetwork, data: TrainingDataConfig, targetError: number, maxEpochs: number): Promise<TrainingResult>;
    /**
     * Get training history.
     */
    getTrainingHistory(): any[];
    /**
     * Get algorithm information.
     */
    getAlgorithmInfo(): any;
}
/**
 * Manager for agent-specific neural networks.
 *
 * @example
 */
export declare class AgentNeuralManager {
    private wasm;
    private manager;
    constructor(wasm: any);
    /**
     * Create a neural network for a specific agent.
     *
     * @param config
     */
    createAgentNetwork(config: AgentNetworkConfig): Promise<string>;
    /**
     * Train an agent's neural network.
     *
     * @param agentId
     * @param data
     */
    trainAgentNetwork(agentId: string, data: TrainingDataConfig): Promise<any>;
    /**
     * Get inference results from an agent's network.
     *
     * @param agentId
     * @param inputs
     */
    getAgentInference(agentId: string, inputs: number[]): Promise<number[]>;
    /**
     * Get cognitive state of an agent.
     *
     * @param agentId
     */
    getAgentCognitiveState(agentId: string): Promise<CognitiveState>;
    /**
     * Fine-tune agent network during execution.
     *
     * @param agentId
     * @param experienceData
     */
    fineTuneDuringExecution(agentId: string, experienceData: any): Promise<any>;
}
/**
 * Utility class for working with activation functions.
 *
 * @example
 */
export declare class ActivationFunctions {
    /**
     * Get all available activation functions.
     *
     * @param wasm
     */
    static getAll(wasm: any): Promise<[string, string][]>;
    /**
     * Test an activation function with specific input.
     *
     * @param wasm
     * @param name
     * @param input
     * @param steepness
     */
    static test(wasm: any, name: string, input: number, steepness?: number): Promise<number>;
    /**
     * Compare all activation functions with given input.
     *
     * @param wasm
     * @param input
     */
    static compare(wasm: any, input: number): Promise<Record<string, number>>;
    /**
     * Get properties of a specific activation function.
     *
     * @param wasm
     * @param name
     */
    static getProperties(wasm: any, name: string): Promise<any>;
}
/**
 * Cascade correlation trainer.
 *
 * @example
 */
export declare class CascadeTrainer {
    private wasm;
    private trainer;
    constructor(wasm: any, config: CascadeConfig | null, network: NeuralNetwork, data: TrainingDataConfig);
    /**
     * Train using cascade correlation.
     */
    train(): Promise<any>;
    /**
     * Get trainer configuration.
     */
    getConfig(): any;
    /**
     * Get default cascade configuration.
     *
     * @param wasm
     */
    static getDefaultConfig(wasm: any): CascadeConfig;
    /**
     * Get default configuration for this trainer.
     */
    private getDefaultConfig;
}
/**
 * Create a neural network with the given configuration.
 *
 * @param config
 * @example
 */
export declare function createNeuralNetwork(config: NetworkConfig): Promise<NeuralNetwork>;
/**
 * Create a trainer with the given configuration.
 *
 * @param config
 * @example
 */
export declare function createTrainer(config: TrainingConfig): Promise<NeuralTrainer>;
/**
 * Create an agent neural manager.
 *
 * @example
 */
export declare function createAgentNeuralManager(): Promise<AgentNeuralManager>;
/**
 * Create a cascade trainer.
 *
 * @param config
 * @param network
 * @param data
 * @example
 */
export declare function createCascadeTrainer(config: CascadeConfig | null, network: NeuralNetwork, data: TrainingDataConfig): Promise<CascadeTrainer>;
/**
 * Validate network configuration.
 *
 * @param config
 * @example
 */
export declare function validateNetworkConfig(config: NetworkConfig): boolean;
/**
 * Validate training configuration.
 *
 * @param config
 * @example
 */
export declare function validateTrainingConfig(config: TrainingConfig): boolean;
/**
 * Get recommended network configuration for agent type.
 *
 * @param cognitivePattern
 * @param inputSize
 * @param outputSize
 * @example
 */
export declare function getRecommendedAgentConfig(cognitivePattern: keyof typeof COGNITIVE_PATTERNS, inputSize: number, outputSize: number): NetworkConfig;
declare const _default: {
    NeuralNetwork: typeof NeuralNetwork;
    NeuralTrainer: typeof NeuralTrainer;
    AgentNeuralManager: typeof AgentNeuralManager;
    ActivationFunctions: typeof ActivationFunctions;
    CascadeTrainer: typeof CascadeTrainer;
    createNeuralNetwork: typeof createNeuralNetwork;
    createTrainer: typeof createTrainer;
    createAgentNeuralManager: typeof createAgentNeuralManager;
    createCascadeTrainer: typeof createCascadeTrainer;
    validateNetworkConfig: typeof validateNetworkConfig;
    validateTrainingConfig: typeof validateTrainingConfig;
    getRecommendedAgentConfig: typeof getRecommendedAgentConfig;
    initializeNeuralWasm: typeof initializeNeuralWasm;
    ACTIVATION_FUNCTIONS: {
        readonly LINEAR: "linear";
        readonly SIGMOID: "sigmoid";
        readonly SIGMOID_SYMMETRIC: "sigmoid_symmetric";
        readonly TANH: "tanh";
        readonly GAUSSIAN: "gaussian";
        readonly GAUSSIAN_SYMMETRIC: "gaussian_symmetric";
        readonly ELLIOT: "elliot";
        readonly ELLIOT_SYMMETRIC: "elliot_symmetric";
        readonly RELU: "relu";
        readonly RELU_LEAKY: "relu_leaky";
        readonly COS: "cos";
        readonly COS_SYMMETRIC: "cos_symmetric";
        readonly SIN: "sin";
        readonly SIN_SYMMETRIC: "sin_symmetric";
        readonly THRESHOLD: "threshold";
        readonly THRESHOLD_SYMMETRIC: "threshold_symmetric";
        readonly LINEAR_PIECE: "linear_piece";
        readonly LINEAR_PIECE_SYMMETRIC: "linear_piece_symmetric";
    };
    TRAINING_ALGORITHMS: {
        readonly INCREMENTAL_BACKPROP: "incremental_backprop";
        readonly BATCH_BACKPROP: "batch_backprop";
        readonly RPROP: "rprop";
        readonly QUICKPROP: "quickprop";
        readonly SARPROP: "sarprop";
    };
    COGNITIVE_PATTERNS: {
        readonly CONVERGENT: "convergent";
        readonly DIVERGENT: "divergent";
        readonly LATERAL: "lateral";
        readonly SYSTEMS: "systems";
        readonly CRITICAL: "critical";
        readonly ABSTRACT: "abstract";
    };
};
export default _default;
//# sourceMappingURL=network.d.ts.map