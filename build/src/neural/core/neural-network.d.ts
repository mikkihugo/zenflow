/**
 * @file Neural network: neural-network.
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
export declare function initializeNeuralWasm(): Promise<any>;
export declare class NeuralNetwork {
    private network;
    constructor(wasm: any, config: NetworkConfig);
    run(inputs: number[]): Promise<number[]>;
    getWeights(): Float32Array;
    setWeights(weights: Float32Array): void;
    getInfo(): NetworkInfo;
    setTrainingData(data: TrainingDataConfig): void;
    getInternalNetwork(): any;
}
export declare class NeuralTrainer {
    private trainer;
    constructor(wasm: any, config: TrainingConfig);
    trainEpoch(network: NeuralNetwork, data: TrainingDataConfig): Promise<number>;
    trainUntilTarget(network: NeuralNetwork, data: TrainingDataConfig, targetError: number, maxEpochs: number): Promise<TrainingResult>;
    getTrainingHistory(): any[];
    getAlgorithmInfo(): any;
}
export declare class AgentNeuralManager {
    private manager;
    constructor(wasm: any);
    createAgentNetwork(config: AgentNetworkConfig): Promise<string>;
    trainAgentNetwork(agentId: string, data: TrainingDataConfig): Promise<any>;
    getAgentInference(agentId: string, inputs: number[]): Promise<number[]>;
    getAgentCognitiveState(agentId: string): Promise<CognitiveState>;
    fineTuneDuringExecution(agentId: string, experienceData: any): Promise<any>;
}
export declare class ActivationFunctions {
    static getAll(wasm: any): Promise<[string, string][]>;
    static test(wasm: any, name: string, input: number, steepness?: number): Promise<number>;
    static compare(wasm: any, input: number): Promise<Record<string, number>>;
    static getProperties(wasm: any, name: string): Promise<any>;
}
export declare class CascadeTrainer {
    private wasm;
    private trainer;
    constructor(wasm: any, config: CascadeConfig | null, network: NeuralNetwork, data: TrainingDataConfig);
    train(): Promise<any>;
    getConfig(): any;
    static getDefaultConfig(wasm: any): CascadeConfig;
    private getDefaultConfig;
}
export declare function createNeuralNetwork(config: NetworkConfig): Promise<NeuralNetwork>;
export declare function createTrainer(config: TrainingConfig): Promise<NeuralTrainer>;
export declare function createAgentNeuralManager(): Promise<AgentNeuralManager>;
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
//# sourceMappingURL=neural-network.d.ts.map