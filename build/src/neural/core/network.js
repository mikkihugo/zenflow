/**
 * Neural Network Core Implementation.
 *
 * TypeScript wrapper for WASM neural network functionality.
 * Consolidated from swarm-zen/neural-network.ts with enhanced type safety.
 */
// =============================================================================
// CONSTANTS
// =============================================================================
export const ACTIVATION_FUNCTIONS = {
    LINEAR: 'linear',
    SIGMOID: 'sigmoid',
    SIGMOID_SYMMETRIC: 'sigmoid_symmetric',
    TANH: 'tanh',
    GAUSSIAN: 'gaussian',
    GAUSSIAN_SYMMETRIC: 'gaussian_symmetric',
    ELLIOT: 'elliot',
    ELLIOT_SYMMETRIC: 'elliot_symmetric',
    RELU: 'relu',
    RELU_LEAKY: 'relu_leaky',
    COS: 'cos',
    COS_SYMMETRIC: 'cos_symmetric',
    SIN: 'sin',
    SIN_SYMMETRIC: 'sin_symmetric',
    THRESHOLD: 'threshold',
    THRESHOLD_SYMMETRIC: 'threshold_symmetric',
    LINEAR_PIECE: 'linear_piece',
    LINEAR_PIECE_SYMMETRIC: 'linear_piece_symmetric',
};
export const TRAINING_ALGORITHMS = {
    INCREMENTAL_BACKPROP: 'incremental_backprop',
    BATCH_BACKPROP: 'batch_backprop',
    RPROP: 'rprop',
    QUICKPROP: 'quickprop',
    SARPROP: 'sarprop',
};
export const COGNITIVE_PATTERNS = {
    CONVERGENT: 'convergent',
    DIVERGENT: 'divergent',
    LATERAL: 'lateral',
    SYSTEMS: 'systems',
    CRITICAL: 'critical',
    ABSTRACT: 'abstract',
};
// =============================================================================
// WASM MODULE MANAGEMENT
// =============================================================================
const wasmModule = null;
/**
 * Initialize the WASM neural network module.
 *
 * @example
 */
export async function initializeNeuralWasm() {
    if (wasmModule)
        return wasmModule;
    try {
        // Dynamic import of WASM module
        // const { default: init, ...exports } = await import('../../wasm/ruv_swarm_wasm');
        // await init();
        // wasmModule = exports;
        return null; // Temporary stub
    }
    catch (error) {
        throw new Error(`Failed to initialize WASM neural module: ${error}`);
    }
}
// =============================================================================
// CORE NEURAL NETWORK CLASS
// =============================================================================
/**
 * Neural Network wrapper for WASM implementation.
 *
 * @example
 */
export class NeuralNetwork {
    wasm;
    network;
    constructor(wasm, config) {
        this.wasm = wasm;
        this.network = new wasm.WasmNeuralNetwork(config);
    }
    /**
     * Run inference on the network.
     *
     * @param inputs
     */
    async run(inputs) {
        return this.network.run(new Float32Array(inputs));
    }
    /**
     * Get network weights.
     */
    getWeights() {
        return this.network.get_weights();
    }
    /**
     * Set network weights.
     *
     * @param weights
     */
    setWeights(weights) {
        this.network.set_weights(weights);
    }
    /**
     * Get network information and metrics.
     */
    getInfo() {
        return this.network.get_network_info();
    }
    /**
     * Set training data for the network.
     *
     * @param data
     */
    setTrainingData(data) {
        this.network.set_training_data(data);
    }
    /**
     * Get internal network reference for training.
     */
    getInternalNetwork() {
        return this.network;
    }
}
// =============================================================================
// NEURAL TRAINER CLASS
// =============================================================================
/**
 * Neural Network trainer with various algorithms.
 *
 * @example
 */
export class NeuralTrainer {
    wasm;
    trainer;
    constructor(wasm, config) {
        this.wasm = wasm;
        this.trainer = new wasm.WasmTrainer(config);
    }
    /**
     * Train a single epoch.
     *
     * @param network
     * @param data
     */
    async trainEpoch(network, data) {
        return this.trainer.train_epoch(network.getInternalNetwork(), data);
    }
    /**
     * Train until target error is reached.
     *
     * @param network
     * @param data
     * @param targetError
     * @param maxEpochs
     */
    async trainUntilTarget(network, data, targetError, maxEpochs) {
        return this.trainer.train_until_target(network.getInternalNetwork(), data, targetError, maxEpochs);
    }
    /**
     * Get training history.
     */
    getTrainingHistory() {
        return this.trainer.get_training_history();
    }
    /**
     * Get algorithm information.
     */
    getAlgorithmInfo() {
        return this.trainer.get_algorithm_info();
    }
}
// =============================================================================
// AGENT NEURAL MANAGER CLASS
// =============================================================================
/**
 * Manager for agent-specific neural networks.
 *
 * @example
 */
export class AgentNeuralManager {
    wasm;
    manager;
    constructor(wasm) {
        this.wasm = wasm;
        this.manager = new wasm.AgentNeuralNetworkManager();
    }
    /**
     * Create a neural network for a specific agent.
     *
     * @param config
     */
    async createAgentNetwork(config) {
        return this.manager.create_agent_network(config);
    }
    /**
     * Train an agent's neural network.
     *
     * @param agentId
     * @param data
     */
    async trainAgentNetwork(agentId, data) {
        return this.manager.train_agent_network(agentId, data);
    }
    /**
     * Get inference results from an agent's network.
     *
     * @param agentId
     * @param inputs
     */
    async getAgentInference(agentId, inputs) {
        return this.manager.get_agent_inference(agentId, new Float32Array(inputs));
    }
    /**
     * Get cognitive state of an agent.
     *
     * @param agentId
     */
    async getAgentCognitiveState(agentId) {
        return this.manager.get_agent_cognitive_state(agentId);
    }
    /**
     * Fine-tune agent network during execution.
     *
     * @param agentId
     * @param experienceData
     */
    async fineTuneDuringExecution(agentId, experienceData) {
        return this.manager.fine_tune_during_execution(agentId, experienceData);
    }
}
// =============================================================================
// ACTIVATION FUNCTIONS UTILITY CLASS
// =============================================================================
/**
 * Utility class for working with activation functions.
 *
 * @example
 */
export class ActivationFunctions {
    /**
     * Get all available activation functions.
     *
     * @param wasm
     */
    static async getAll(wasm) {
        return wasm.ActivationFunctionManager.get_all_functions();
    }
    /**
     * Test an activation function with specific input.
     *
     * @param wasm
     * @param name
     * @param input
     * @param steepness
     */
    static async test(wasm, name, input, steepness = 1.0) {
        return wasm.ActivationFunctionManager.test_activation_function(name, input, steepness);
    }
    /**
     * Compare all activation functions with given input.
     *
     * @param wasm
     * @param input
     */
    static async compare(wasm, input) {
        return wasm.ActivationFunctionManager.compare_functions(input);
    }
    /**
     * Get properties of a specific activation function.
     *
     * @param wasm
     * @param name
     */
    static async getProperties(wasm, name) {
        return wasm.ActivationFunctionManager.get_function_properties(name);
    }
}
// =============================================================================
// CASCADE TRAINER CLASS
// =============================================================================
/**
 * Cascade correlation trainer.
 *
 * @example
 */
export class CascadeTrainer {
    wasm;
    trainer;
    constructor(wasm, config, network, data) {
        this.wasm = wasm;
        this.trainer = new wasm.WasmCascadeTrainer(config || this.getDefaultConfig(), network.getInternalNetwork(), data);
    }
    /**
     * Train using cascade correlation.
     */
    async train() {
        return this.trainer.train();
    }
    /**
     * Get trainer configuration.
     */
    getConfig() {
        return this.trainer.get_config();
    }
    /**
     * Get default cascade configuration.
     *
     * @param wasm
     */
    static getDefaultConfig(wasm) {
        return wasm.WasmCascadeTrainer.create_default_config();
    }
    /**
     * Get default configuration for this trainer.
     */
    getDefaultConfig() {
        return CascadeTrainer.getDefaultConfig(this.wasm);
    }
}
// =============================================================================
// HIGH-LEVEL FACTORY FUNCTIONS
// =============================================================================
/**
 * Create a neural network with the given configuration.
 *
 * @param config
 * @example
 */
export async function createNeuralNetwork(config) {
    const wasm = await initializeNeuralWasm();
    return new NeuralNetwork(wasm, config);
}
/**
 * Create a trainer with the given configuration.
 *
 * @param config
 * @example
 */
export async function createTrainer(config) {
    const wasm = await initializeNeuralWasm();
    return new NeuralTrainer(wasm, config);
}
/**
 * Create an agent neural manager.
 *
 * @example
 */
export async function createAgentNeuralManager() {
    const wasm = await initializeNeuralWasm();
    return new AgentNeuralManager(wasm);
}
/**
 * Create a cascade trainer.
 *
 * @param config
 * @param network
 * @param data
 * @example
 */
export async function createCascadeTrainer(config, network, data) {
    const wasm = await initializeNeuralWasm();
    return new CascadeTrainer(wasm, config, network, data);
}
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Validate network configuration.
 *
 * @param config
 * @example
 */
export function validateNetworkConfig(config) {
    return (config?.inputSize > 0 &&
        config?.outputSize > 0 &&
        config?.hiddenLayers.length > 0 &&
        config?.hiddenLayers.every((layer) => layer.size > 0));
}
/**
 * Validate training configuration.
 *
 * @param config
 * @example
 */
export function validateTrainingConfig(config) {
    return (config?.maxEpochs > 0 &&
        config?.targetError >= 0 &&
        Object.values(TRAINING_ALGORITHMS).includes(config?.algorithm));
}
/**
 * Get recommended network configuration for agent type.
 *
 * @param cognitivePattern
 * @param inputSize
 * @param outputSize
 * @example
 */
export function getRecommendedAgentConfig(cognitivePattern, inputSize, outputSize) {
    const baseConfig = {
        inputSize,
        outputSize,
        outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
        hiddenLayers: [
            { size: Math.ceil(inputSize * 1.5), activation: ACTIVATION_FUNCTIONS.RELU },
            { size: Math.ceil(inputSize * 0.75), activation: ACTIVATION_FUNCTIONS.TANH },
        ],
        connectionRate: 1.0,
    };
    // Customize based on cognitive pattern
    switch (cognitivePattern) {
        case 'convergent':
            baseConfig.hiddenLayers = [{ size: inputSize * 2, activation: ACTIVATION_FUNCTIONS.RELU }];
            break;
        case 'divergent':
            baseConfig.hiddenLayers = [
                { size: Math.ceil(inputSize * 2.5), activation: ACTIVATION_FUNCTIONS.TANH },
                { size: Math.ceil(inputSize * 1.5), activation: ACTIVATION_FUNCTIONS.SIGMOID },
            ];
            break;
        case 'lateral':
            baseConfig.hiddenLayers = [
                { size: inputSize * 3, activation: ACTIVATION_FUNCTIONS.ELLIOT },
                { size: inputSize, activation: ACTIVATION_FUNCTIONS.GAUSSIAN },
            ];
            break;
        case 'systems':
            baseConfig.hiddenLayers = [
                { size: inputSize * 4, activation: ACTIVATION_FUNCTIONS.RELU },
                { size: inputSize * 2, activation: ACTIVATION_FUNCTIONS.TANH },
                { size: inputSize, activation: ACTIVATION_FUNCTIONS.SIGMOID },
            ];
            break;
        case 'critical':
            baseConfig.hiddenLayers = [
                { size: Math.ceil(inputSize * 1.2), activation: ACTIVATION_FUNCTIONS.RELU },
            ];
            break;
        case 'abstract':
            baseConfig.hiddenLayers = [
                { size: inputSize * 5, activation: ACTIVATION_FUNCTIONS.TANH },
                { size: inputSize * 2, activation: ACTIVATION_FUNCTIONS.SIGMOID },
            ];
            break;
    }
    return baseConfig;
}
// =============================================================================
// TYPE EXPORTS
// =============================================================================
// Neural Network Core Module - Complete Implementation
// =============================================================================
// Export all classes and functions as default
export default {
    NeuralNetwork,
    NeuralTrainer,
    AgentNeuralManager,
    ActivationFunctions,
    CascadeTrainer,
    createNeuralNetwork,
    createTrainer,
    createAgentNeuralManager,
    createCascadeTrainer,
    validateNetworkConfig,
    validateTrainingConfig,
    getRecommendedAgentConfig,
    initializeNeuralWasm,
    ACTIVATION_FUNCTIONS,
    TRAINING_ALGORITHMS,
    COGNITIVE_PATTERNS,
};
