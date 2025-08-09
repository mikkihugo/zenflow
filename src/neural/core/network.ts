/**
 * Neural Network Core Implementation.
 *
 * TypeScript wrapper for WASM neural network functionality.
 * Consolidated from swarm-zen/neural-network.ts with enhanced type safety
 */

// =============================================================================
// INTERFACES & TYPES
// =============================================================================
/**
 * @file Neural network: network
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
} as const;

export const TRAINING_ALGORITHMS = {
  INCREMENTAL_BACKPROP: 'incremental_backprop',
  BATCH_BACKPROP: 'batch_backprop',
  RPROP: 'rprop',
  QUICKPROP: 'quickprop',
  SARPROP: 'sarprop',
} as const;

export const COGNITIVE_PATTERNS = {
  CONVERGENT: 'convergent',
  DIVERGENT: 'divergent',
  LATERAL: 'lateral',
  SYSTEMS: 'systems',
  CRITICAL: 'critical',
  ABSTRACT: 'abstract',
} as const;

// =============================================================================
// WASM MODULE MANAGEMENT
// =============================================================================

const wasmModule: any = null;

/**
 * Initialize the WASM neural network module.
 */
export async function initializeNeuralWasm(): Promise<any> {
  if (wasmModule) return wasmModule;

  try {
    // Dynamic import of WASM module
    // const { default: init, ...exports } = await import('../../wasm/ruv_swarm_wasm.js');
    // await init();
    // wasmModule = exports;
    return null; // Temporary stub
  } catch (error) {
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
  private network: any;

  constructor(
    private wasm: any,
    config: NetworkConfig
  ) {
    this.network = new wasm.WasmNeuralNetwork(config);
  }

  /**
   * Run inference on the network.
   *
   * @param inputs
   */
  async run(inputs: number[]): Promise<number[]> {
    return this.network.run(new Float32Array(inputs));
  }

  /**
   * Get network weights.
   */
  getWeights(): Float32Array {
    return this.network.get_weights();
  }

  /**
   * Set network weights.
   *
   * @param weights
   */
  setWeights(weights: Float32Array): void {
    this.network.set_weights(weights);
  }

  /**
   * Get network information and metrics.
   */
  getInfo(): NetworkInfo {
    return this.network.get_network_info();
  }

  /**
   * Set training data for the network.
   *
   * @param data
   */
  setTrainingData(data: TrainingDataConfig): void {
    this.network.set_training_data(data);
  }

  /**
   * Get internal network reference for training.
   */
  getInternalNetwork(): any {
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
  private trainer: any;

  constructor(
    private wasm: any,
    config: TrainingConfig
  ) {
    this.trainer = new wasm.WasmTrainer(config);
  }

  /**
   * Train a single epoch.
   *
   * @param network
   * @param data
   */
  async trainEpoch(network: NeuralNetwork, data: TrainingDataConfig): Promise<number> {
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
  async trainUntilTarget(
    network: NeuralNetwork,
    data: TrainingDataConfig,
    targetError: number,
    maxEpochs: number
  ): Promise<TrainingResult> {
    return this.trainer.train_until_target(
      network.getInternalNetwork(),
      data,
      targetError,
      maxEpochs
    );
  }

  /**
   * Get training history.
   */
  getTrainingHistory(): any[] {
    return this.trainer.get_training_history();
  }

  /**
   * Get algorithm information.
   */
  getAlgorithmInfo(): any {
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
  private manager: any;

  constructor(private wasm: any) {
    this.manager = new wasm.AgentNeuralNetworkManager();
  }

  /**
   * Create a neural network for a specific agent.
   *
   * @param config
   */
  async createAgentNetwork(config: AgentNetworkConfig): Promise<string> {
    return this.manager.create_agent_network(config);
  }

  /**
   * Train an agent's neural network.
   *
   * @param agentId
   * @param data
   */
  async trainAgentNetwork(agentId: string, data: TrainingDataConfig): Promise<any> {
    return this.manager.train_agent_network(agentId, data);
  }

  /**
   * Get inference results from an agent's network.
   *
   * @param agentId
   * @param inputs
   */
  async getAgentInference(agentId: string, inputs: number[]): Promise<number[]> {
    return this.manager.get_agent_inference(agentId, new Float32Array(inputs));
  }

  /**
   * Get cognitive state of an agent.
   *
   * @param agentId
   */
  async getAgentCognitiveState(agentId: string): Promise<CognitiveState> {
    return this.manager.get_agent_cognitive_state(agentId);
  }

  /**
   * Fine-tune agent network during execution.
   *
   * @param agentId
   * @param experienceData
   */
  async fineTuneDuringExecution(agentId: string, experienceData: any): Promise<any> {
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
  static async getAll(wasm: any): Promise<[string, string][]> {
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
  static async test(
    wasm: any,
    name: string,
    input: number,
    steepness: number = 1.0
  ): Promise<number> {
    return wasm.ActivationFunctionManager.test_activation_function(name, input, steepness);
  }

  /**
   * Compare all activation functions with given input.
   *
   * @param wasm
   * @param input
   */
  static async compare(wasm: any, input: number): Promise<Record<string, number>> {
    return wasm.ActivationFunctionManager.compare_functions(input);
  }

  /**
   * Get properties of a specific activation function.
   *
   * @param wasm
   * @param name
   */
  static async getProperties(wasm: any, name: string): Promise<any> {
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
  private trainer: any;

  constructor(
    private wasm: any,
    config: CascadeConfig | null,
    network: NeuralNetwork,
    data: TrainingDataConfig
  ) {
    this.trainer = new wasm.WasmCascadeTrainer(
      config || this.getDefaultConfig(),
      network.getInternalNetwork(),
      data
    );
  }

  /**
   * Train using cascade correlation.
   */
  async train(): Promise<any> {
    return this.trainer.train();
  }

  /**
   * Get trainer configuration.
   */
  getConfig(): any {
    return this.trainer.get_config();
  }

  /**
   * Get default cascade configuration.
   *
   * @param wasm
   */
  static getDefaultConfig(wasm: any): CascadeConfig {
    return wasm.WasmCascadeTrainer.create_default_config();
  }

  /**
   * Get default configuration for this trainer.
   */
  private getDefaultConfig(): CascadeConfig {
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
 */
export async function createNeuralNetwork(config: NetworkConfig): Promise<NeuralNetwork> {
  const wasm = await initializeNeuralWasm();
  return new NeuralNetwork(wasm, config);
}

/**
 * Create a trainer with the given configuration.
 *
 * @param config
 */
export async function createTrainer(config: TrainingConfig): Promise<NeuralTrainer> {
  const wasm = await initializeNeuralWasm();
  return new NeuralTrainer(wasm, config);
}

/**
 * Create an agent neural manager.
 */
export async function createAgentNeuralManager(): Promise<AgentNeuralManager> {
  const wasm = await initializeNeuralWasm();
  return new AgentNeuralManager(wasm);
}

/**
 * Create a cascade trainer.
 *
 * @param config
 * @param network
 * @param data
 */
export async function createCascadeTrainer(
  config: CascadeConfig | null,
  network: NeuralNetwork,
  data: TrainingDataConfig
): Promise<CascadeTrainer> {
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
 */
export function validateNetworkConfig(config: NetworkConfig): boolean {
  return (
    config?.inputSize > 0 &&
    config?.outputSize > 0 &&
    config?.hiddenLayers.length > 0 &&
    config?.hiddenLayers.every((layer) => layer.size > 0)
  );
}

/**
 * Validate training configuration.
 *
 * @param config
 */
export function validateTrainingConfig(config: TrainingConfig): boolean {
  return (
    config?.maxEpochs > 0 &&
    config?.targetError >= 0 &&
    Object.values(TRAINING_ALGORITHMS).includes(config?.algorithm)
  );
}

/**
 * Get recommended network configuration for agent type.
 *
 * @param cognitivePattern
 * @param inputSize
 * @param outputSize
 */
export function getRecommendedAgentConfig(
  cognitivePattern: keyof typeof COGNITIVE_PATTERNS,
  inputSize: number,
  outputSize: number
): NetworkConfig {
  const baseConfig: NetworkConfig = {
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
  switch (cognitivePattern as any) {
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
