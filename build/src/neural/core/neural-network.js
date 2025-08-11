/**
 * @file Neural network: neural-network.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('neural-core-neural-network');
let wasmModule = null;
export async function initializeNeuralWasm() {
    if (wasmModule)
        return wasmModule;
    try {
        // Dynamic import of WASM module - use placeholder if not available
        try {
            // Use require-style dynamic import to avoid TypeScript resolution issues
            const wasmModulePath = '../wasm/ruv_swarm_wasm.js';
            const importedWasmModule = await eval(`import('${wasmModulePath}')`).catch(() => null);
            if (importedWasmModule) {
                const { default: init, ...exports } = importedWasmModule;
                await init();
                wasmModule = exports;
                return wasmModule;
            }
            throw new Error('WASM module not available');
        }
        catch (importError) {
            // Fallback to simulated WASM module
            logger.warn('WASM module not found, using simulation mode');
            wasmModule = {
                create_neural_network: () => 'simulated_network_id',
                forward_pass: () => new Float32Array([0.5]),
                train_network: () => 0.1,
                get_metrics: () => ({ accuracy: 0.5, loss: 0.5 }),
            };
            return wasmModule;
        }
    }
    catch (error) {
        throw new Error(`Failed to initialize WASM neural module: ${error}`);
    }
}
export class NeuralNetwork {
    network;
    constructor(wasm, config) {
        this.network = new wasm['WasmNeuralNetwork'](config);
    }
    async run(inputs) {
        return this.network.run(new Float32Array(inputs));
    }
    getWeights() {
        return this.network['get_weights']();
    }
    setWeights(weights) {
        this.network['set_weights'](weights);
    }
    getInfo() {
        return this.network['get_network_info']();
    }
    setTrainingData(data) {
        this.network['set_training_data'](data);
    }
    // Getter method to access the internal network for training
    getInternalNetwork() {
        return this.network;
    }
}
export class NeuralTrainer {
    trainer;
    constructor(wasm, config) {
        this.trainer = new wasm['WasmTrainer'](config);
    }
    async trainEpoch(network, data) {
        return this.trainer['train_epoch'](network.getInternalNetwork(), data);
    }
    async trainUntilTarget(network, data, targetError, maxEpochs) {
        return this.trainer['train_until_target'](network.getInternalNetwork(), data, targetError, maxEpochs);
    }
    getTrainingHistory() {
        return this.trainer['get_training_history']();
    }
    getAlgorithmInfo() {
        return this.trainer['get_algorithm_info']();
    }
}
export class AgentNeuralManager {
    manager;
    constructor(wasm) {
        this.manager = new wasm['AgentNeuralNetworkManager']();
    }
    async createAgentNetwork(config) {
        return this.manager['create_agent_network'](config);
    }
    async trainAgentNetwork(agentId, data) {
        return this.manager['train_agent_network'](agentId, data);
    }
    async getAgentInference(agentId, inputs) {
        return this.manager['get_agent_inference'](agentId, new Float32Array(inputs));
    }
    async getAgentCognitiveState(agentId) {
        return this.manager['get_agent_cognitive_state'](agentId);
    }
    async fineTuneDuringExecution(agentId, experienceData) {
        return this.manager['fine_tune_during_execution'](agentId, experienceData);
    }
}
export class ActivationFunctions {
    static async getAll(wasm) {
        return wasm['ActivationFunctionManager']?.['get_all_functions']();
    }
    static async test(wasm, name, input, steepness = 1.0) {
        return wasm['ActivationFunctionManager']?.['test_activation_function'](name, input, steepness);
    }
    static async compare(wasm, input) {
        return wasm['ActivationFunctionManager']?.['compare_functions'](input);
    }
    static async getProperties(wasm, name) {
        return wasm['ActivationFunctionManager']?.['get_function_properties'](name);
    }
}
export class CascadeTrainer {
    wasm;
    trainer;
    constructor(wasm, config, network, data) {
        this.wasm = wasm;
        this.trainer = new wasm['WasmCascadeTrainer'](config || this.getDefaultConfig(), network.getInternalNetwork(), data);
    }
    async train() {
        return this.trainer.train();
    }
    getConfig() {
        return this.trainer['get_config']();
    }
    static getDefaultConfig(wasm) {
        return wasm['WasmCascadeTrainer']?.['create_default_config']();
    }
    getDefaultConfig() {
        return CascadeTrainer.getDefaultConfig(this.wasm);
    }
}
// High-level helper functions
export async function createNeuralNetwork(config) {
    const wasm = await initializeNeuralWasm();
    return new NeuralNetwork(wasm, config);
}
export async function createTrainer(config) {
    const wasm = await initializeNeuralWasm();
    return new NeuralTrainer(wasm, config);
}
export async function createAgentNeuralManager() {
    const wasm = await initializeNeuralWasm();
    return new AgentNeuralManager(wasm);
}
// Export activation function names for convenience
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
// Export training algorithm names
export const TRAINING_ALGORITHMS = {
    INCREMENTAL_BACKPROP: 'incremental_backprop',
    BATCH_BACKPROP: 'batch_backprop',
    RPROP: 'rprop',
    QUICKPROP: 'quickprop',
    SARPROP: 'sarprop',
};
// Export cognitive patterns
export const COGNITIVE_PATTERNS = {
    CONVERGENT: 'convergent',
    DIVERGENT: 'divergent',
    LATERAL: 'lateral',
    SYSTEMS: 'systems',
    CRITICAL: 'critical',
    ABSTRACT: 'abstract',
};
