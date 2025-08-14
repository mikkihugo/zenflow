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
const wasmModule = null;
export async function initializeNeuralWasm() {
    if (wasmModule)
        return wasmModule;
    try {
        return null;
    }
    catch (error) {
        throw new Error(`Failed to initialize WASM neural module: ${error}`);
    }
}
export class NeuralNetwork {
    wasm;
    network;
    constructor(wasm, config) {
        this.wasm = wasm;
        this.network = new wasm.WasmNeuralNetwork(config);
    }
    async run(inputs) {
        return this.network.run(new Float32Array(inputs));
    }
    getWeights() {
        return this.network.get_weights();
    }
    setWeights(weights) {
        this.network.set_weights(weights);
    }
    getInfo() {
        return this.network.get_network_info();
    }
    setTrainingData(data) {
        this.network.set_training_data(data);
    }
    getInternalNetwork() {
        return this.network;
    }
}
export class NeuralTrainer {
    wasm;
    trainer;
    constructor(wasm, config) {
        this.wasm = wasm;
        this.trainer = new wasm.WasmTrainer(config);
    }
    async trainEpoch(network, data) {
        return this.trainer.train_epoch(network.getInternalNetwork(), data);
    }
    async trainUntilTarget(network, data, targetError, maxEpochs) {
        return this.trainer.train_until_target(network.getInternalNetwork(), data, targetError, maxEpochs);
    }
    getTrainingHistory() {
        return this.trainer.get_training_history();
    }
    getAlgorithmInfo() {
        return this.trainer.get_algorithm_info();
    }
}
export class AgentNeuralManager {
    wasm;
    manager;
    constructor(wasm) {
        this.wasm = wasm;
        this.manager = new wasm.AgentNeuralNetworkManager();
    }
    async createAgentNetwork(config) {
        return this.manager.create_agent_network(config);
    }
    async trainAgentNetwork(agentId, data) {
        return this.manager.train_agent_network(agentId, data);
    }
    async getAgentInference(agentId, inputs) {
        return this.manager.get_agent_inference(agentId, new Float32Array(inputs));
    }
    async getAgentCognitiveState(agentId) {
        return this.manager.get_agent_cognitive_state(agentId);
    }
    async fineTuneDuringExecution(agentId, experienceData) {
        return this.manager.fine_tune_during_execution(agentId, experienceData);
    }
}
export class ActivationFunctions {
    static async getAll(wasm) {
        return wasm.ActivationFunctionManager.get_all_functions();
    }
    static async test(wasm, name, input, steepness = 1.0) {
        return wasm.ActivationFunctionManager.test_activation_function(name, input, steepness);
    }
    static async compare(wasm, input) {
        return wasm.ActivationFunctionManager.compare_functions(input);
    }
    static async getProperties(wasm, name) {
        return wasm.ActivationFunctionManager.get_function_properties(name);
    }
}
export class CascadeTrainer {
    wasm;
    trainer;
    constructor(wasm, config, network, data) {
        this.wasm = wasm;
        this.trainer = new wasm.WasmCascadeTrainer(config || this.getDefaultConfig(), network.getInternalNetwork(), data);
    }
    async train() {
        return this.trainer.train();
    }
    getConfig() {
        return this.trainer.get_config();
    }
    static getDefaultConfig(wasm) {
        return wasm.WasmCascadeTrainer.create_default_config();
    }
    getDefaultConfig() {
        return CascadeTrainer.getDefaultConfig(this.wasm);
    }
}
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
export async function createCascadeTrainer(config, network, data) {
    const wasm = await initializeNeuralWasm();
    return new CascadeTrainer(wasm, config, network, data);
}
export function validateNetworkConfig(config) {
    return (config?.inputSize > 0 &&
        config?.outputSize > 0 &&
        config?.hiddenLayers.length > 0 &&
        config?.hiddenLayers.every((layer) => layer.size > 0));
}
export function validateTrainingConfig(config) {
    return (config?.maxEpochs > 0 &&
        config?.targetError >= 0 &&
        Object.values(TRAINING_ALGORITHMS).includes(config?.algorithm));
}
export function getRecommendedAgentConfig(cognitivePattern, inputSize, outputSize) {
    const baseConfig = {
        inputSize,
        outputSize,
        outputActivation: ACTIVATION_FUNCTIONS.SIGMOID,
        hiddenLayers: [
            {
                size: Math.ceil(inputSize * 1.5),
                activation: ACTIVATION_FUNCTIONS.RELU,
            },
            {
                size: Math.ceil(inputSize * 0.75),
                activation: ACTIVATION_FUNCTIONS.TANH,
            },
        ],
        connectionRate: 1.0,
    };
    switch (cognitivePattern) {
        case 'convergent':
            baseConfig.hiddenLayers = [
                { size: inputSize * 2, activation: ACTIVATION_FUNCTIONS.RELU },
            ];
            break;
        case 'divergent':
            baseConfig.hiddenLayers = [
                {
                    size: Math.ceil(inputSize * 2.5),
                    activation: ACTIVATION_FUNCTIONS.TANH,
                },
                {
                    size: Math.ceil(inputSize * 1.5),
                    activation: ACTIVATION_FUNCTIONS.SIGMOID,
                },
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
                {
                    size: Math.ceil(inputSize * 1.2),
                    activation: ACTIVATION_FUNCTIONS.RELU,
                },
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
//# sourceMappingURL=network.js.map