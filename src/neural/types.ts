/**
 * @fileoverview Neural Domain Types - Single Source of Truth
 *
 * All neural network, AI model, and cognitive pattern types.
 * Following Google TypeScript style guide and domain architecture standard.
 */

// Neural network configuration types
export interface NeuralModelConfig {
  readonly id: string;
  readonly name: string;
  readonly type:
    | 'feedforward'
    | 'recurrent'
    | 'transformer'
    | 'cnn'
    | 'lstm'
    | 'gru';
  readonly layers: readonly NeuralLayerConfig[];
  readonly optimizer: OptimizerConfig;
  readonly loss: LossConfig;
  readonly metrics?: readonly string[];
  readonly batchSize?: number;
  readonly epochs?: number;
  readonly learningRate?: number;
  readonly dropout?: number;
  readonly regularization?: RegularizationConfig;
}

export interface NeuralLayerConfig {
  readonly type:
    | 'dense'
    | 'conv2d'
    | 'lstm'
    | 'gru'
    | 'attention'
    | 'embedding';
  readonly units?: number;
  readonly activation?: ActivationFunction;
  readonly inputShape?: readonly number[];
  readonly kernelSize?: readonly number[];
  readonly strides?: readonly number[];
  readonly padding?: 'valid' | 'same';
  readonly dropout?: number;
  readonly recurrentDropout?: number;
}

export interface OptimizerConfig {
  readonly type: 'adam' | 'sgd' | 'rmsprop' | 'adagrad' | 'adadelta';
  readonly learningRate: number;
  readonly momentum?: number;
  readonly beta1?: number;
  readonly beta2?: number;
  readonly epsilon?: number;
  readonly decay?: number;
}

export interface LossConfig {
  readonly type:
    | 'mse'
    | 'mae'
    | 'categorical_crossentropy'
    | 'binary_crossentropy'
    | 'sparse_categorical_crossentropy';
  readonly reduction?: 'mean' | 'sum' | 'none';
  readonly weights?: readonly number[];
}

export interface RegularizationConfig {
  readonly l1?: number;
  readonly l2?: number;
  readonly elasticNet?: { l1: number; l2: number };
}

export type ActivationFunction =
  | 'relu'
  | 'sigmoid'
  | 'tanh'
  | 'softmax'
  | 'leaky_relu'
  | 'elu'
  | 'swish'
  | 'gelu'
  | 'linear';

// Cognitive pattern types
export type CognitivePatternType =
  | 'convergent'
  | 'divergent'
  | 'lateral'
  | 'systems'
  | 'critical'
  | 'adaptive'
  | 'creative'
  | 'analytical'
  | 'holistic'
  | 'sequential';

export interface CognitivePattern {
  readonly id: string;
  readonly type: CognitivePatternType;
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
  readonly effectiveness: number;
  readonly usageCount: number;
  readonly lastUpdated: string;
  readonly capabilities: readonly string[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
}

export interface CognitivePatternEvolution {
  readonly patternId: string;
  readonly generation: number;
  readonly mutations: readonly {
    parameter: string;
    oldValue: unknown;
    newValue: unknown;
    impact: number;
  }[];
  readonly fitness: number;
  readonly parentPatterns?: readonly string[];
  readonly timestamp: string;
}

// Neural network instance types
export interface NeuralNetworkInstance {
  readonly id: string;
  readonly agentId?: string;
  readonly config: NeuralModelConfig;
  readonly trainingState: {
    readonly epoch: number;
    readonly loss: number;
    readonly accuracy: number;
    readonly learningRate: number;
    readonly optimizer: string;
    readonly isTraining: boolean;
    readonly lastTrainingTime: string;
  };
  readonly weights?: readonly number[][];
  readonly biases?: readonly number[];
  readonly metadata: {
    readonly created: string;
    readonly updated: string;
    readonly version: string;
    readonly checksum: string;
    readonly size: number;
  };
  readonly performance: NeuralNetworkPerformance;
}

export interface NeuralNetworkPerformance {
  readonly accuracy: number;
  readonly precision: number;
  readonly recall: number;
  readonly f1Score: number;
  readonly loss: number;
  readonly inferenceTime: number;
  readonly trainingTime: number;
  readonly memoryUsage: number;
}

// Training and evaluation types
export interface TrainingData {
  readonly inputs: readonly number[][];
  readonly outputs: readonly number[][];
  readonly validationSplit?: number;
  readonly shuffle?: boolean;
  readonly batchSize?: number;
}

export interface TrainingOptions {
  readonly epochs: number;
  readonly batchSize: number;
  readonly validationSplit: number;
  readonly callbacks?: readonly TrainingCallback[];
  readonly verbose?: boolean;
  readonly shuffle?: boolean;
  readonly saveCheckpoints?: boolean;
  readonly checkpointPath?: string;
}

export interface TrainingCallback {
  readonly type:
    | 'early_stopping'
    | 'model_checkpoint'
    | 'reduce_lr'
    | 'tensorboard';
  readonly config: Record<string, unknown>;
}

export interface TrainingResult {
  readonly success: boolean;
  readonly finalLoss: number;
  readonly finalAccuracy: number;
  readonly epochsCompleted: number;
  readonly duration: number;
  readonly history: {
    readonly loss: readonly number[];
    readonly accuracy: readonly number[];
    readonly valLoss?: readonly number[];
    readonly valAccuracy?: readonly number[];
  };
  readonly error?: string;
}

export interface EvaluationResult {
  readonly accuracy: number;
  readonly precision: number;
  readonly recall: number;
  readonly f1Score: number;
  readonly loss: number;
  readonly confusionMatrix?: readonly number[][];
  readonly classificationReport?: Record<
    string,
    {
      precision: number;
      recall: number;
      f1Score: number;
      support: number;
    }
  >;
}

// DAA (Decentralized Autonomous Agents) types
export interface DAAAgent {
  readonly id: string;
  readonly cognitivePattern: CognitivePatternType;
  readonly capabilities: readonly string[];
  readonly neuralNetworks: readonly string[]; // Network IDs
  readonly learningRate: number;
  readonly adaptationThreshold: number;
  readonly autonomyLevel: number;
  readonly collaborationScore: number;
  readonly knowledgeBase: DAAKnowledgeBase;
  readonly status: DAAAgentStatus;
}

export interface DAAKnowledgeBase {
  readonly domains: readonly string[];
  readonly facts: readonly DAAFact[];
  readonly experiences: readonly DAAExperience[];
  readonly patterns: readonly string[]; // Pattern IDs
  readonly lastUpdated: string;
  readonly size: number;
}

export interface DAAFact {
  readonly id: string;
  readonly domain: string;
  readonly content: unknown;
  readonly confidence: number;
  readonly source: string;
  readonly timestamp: string;
  readonly verified: boolean;
}

export interface DAAExperience {
  readonly id: string;
  readonly taskType: string;
  readonly context: Record<string, unknown>;
  readonly action: unknown;
  readonly outcome: unknown;
  readonly reward: number;
  readonly timestamp: string;
  readonly learned: boolean;
}

export type DAAAgentStatus =
  | 'idle'
  | 'learning'
  | 'processing'
  | 'collaborating'
  | 'adapting'
  | 'error';

// Meta-learning types
export interface MetaLearningFramework {
  readonly id: string;
  readonly algorithm: 'maml' | 'reptile' | 'model_agnostic' | 'gradient_based';
  readonly taskDistribution: MetaLearningTaskDistribution;
  readonly innerLoopSteps: number;
  readonly outerLoopSteps: number;
  readonly metaLearningRate: number;
  readonly adaptationRate: number;
  readonly performance: MetaLearningPerformance;
}

export interface MetaLearningTaskDistribution {
  readonly taskTypes: readonly string[];
  readonly taskCount: number;
  readonly supportSetSize: number;
  readonly querySetSize: number;
  readonly taskSampling: 'uniform' | 'weighted' | 'curriculum';
}

export interface MetaLearningPerformance {
  readonly fewShotAccuracy: number;
  readonly adaptationSpeed: number;
  readonly transferEfficiency: number;
  readonly generalizationScore: number;
  readonly convergenceTime: number;
}

// Neural coordination types
export interface NeuralCoordinationProtocol {
  readonly protocolId: string;
  readonly participantAgents: readonly string[];
  readonly coordinationType:
    | 'consensus'
    | 'federated'
    | 'hierarchical'
    | 'swarm';
  readonly communicationPattern: 'broadcast' | 'peer_to_peer' | 'tree' | 'ring';
  readonly syncFrequency: number;
  readonly convergenceThreshold: number;
  readonly privacy: NeuralPrivacyConfig;
}

export interface NeuralPrivacyConfig {
  readonly enabled: boolean;
  readonly technique:
    | 'differential_privacy'
    | 'homomorphic'
    | 'secure_aggregation';
  readonly privacyBudget?: number;
  readonly noiseLevel?: number;
  readonly encryptionKey?: string;
}

// Neural model presets
export interface NeuralPresetConfig {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly useCase: string;
  readonly config: NeuralModelConfig;
  readonly performance: {
    readonly accuracy: number;
    readonly speed: number;
    readonly memoryUsage: number;
  };
  readonly complexity: 'low' | 'medium' | 'high';
  readonly recommended: boolean;
}

// WASM integration types
export interface WASMNeuralEngine {
  readonly engineId: string;
  readonly wasmModule: string;
  readonly capabilities: readonly string[];
  readonly performance: {
    readonly benchmarkScore: number;
    readonly inferenceSpeed: number;
    readonly trainingSpeed: number;
    readonly memoryEfficiency: number;
  };
  readonly compatibility: {
    readonly browsers: readonly string[];
    readonly nodeVersions: readonly string[];
    readonly architectures: readonly string[];
  };
}

// Neural analytics and monitoring
export interface NeuralAnalytics {
  readonly totalNetworks: number;
  readonly activeNetworks: number;
  readonly totalTrainingTime: number;
  readonly averageAccuracy: number;
  readonly modelPerformance: Record<string, NeuralNetworkPerformance>;
  readonly resourceUsage: {
    readonly cpuUsage: number;
    readonly memoryUsage: number;
    readonly gpuUsage?: number;
    readonly wasmUsage: number;
  };
  readonly trainingMetrics: {
    readonly totalEpochs: number;
    readonly averageLoss: number;
    readonly convergenceRate: number;
    readonly failureRate: number;
  };
}

// Error types
export class NeuralError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly networkId?: string
  ) {
    super(message);
    this.name = 'NeuralError';
  }
}

export class TrainingError extends NeuralError {
  constructor(
    message: string,
    public readonly epoch?: number,
    public readonly loss?: number
  ) {
    super(message, 'TRAINING_ERROR');
    this.name = 'TrainingError';
  }
}

export class ModelError extends NeuralError {
  constructor(
    message: string,
    public readonly modelConfig?: Partial<NeuralModelConfig>
  ) {
    super(message, 'MODEL_ERROR');
    this.name = 'ModelError';
  }
}

export class CognitivePatternError extends NeuralError {
  constructor(
    message: string,
    public readonly patternType?: CognitivePatternType
  ) {
    super(message, 'COGNITIVE_PATTERN_ERROR');
    this.name = 'CognitivePatternError';
  }
}

// Event types for neural operations
export interface NeuralEvent {
  readonly type:
    | 'model_created'
    | 'training_started'
    | 'training_completed'
    | 'training_failed'
    | 'inference_completed'
    | 'pattern_evolved'
    | 'coordination_sync';
  readonly networkId?: string;
  readonly agentId?: string;
  readonly timestamp: string;
  readonly data?: Record<string, unknown>;
  readonly performance?: Partial<NeuralNetworkPerformance>;
}

// Utility types
export type NeuralNetworkId = string;
export type CognitivePatternId = string;
export type DAAAgentId = string;
export type MetaLearningTaskId = string;

// Re-export utility functions types
export interface NeuralUtilities {
  activationFunction(type: ActivationFunction, input: number): number;
  lossFunction(
    type: LossConfig['type'],
    predictions: readonly number[],
    targets: readonly number[]
  ): number;
  optimizerStep(
    type: OptimizerConfig['type'],
    gradients: readonly number[],
    config: OptimizerConfig
  ): readonly number[];
  normalizeData(data: readonly number[][]): readonly number[][];
  splitTrainValidation(
    data: TrainingData,
    split: number
  ): { train: TrainingData; validation: TrainingData };
}
