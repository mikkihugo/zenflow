/**
 * Neural Network Types
 * Rust-based neural processing with FANN integration and GPU acceleration
 */

import { Identifiable, JSONObject, TypedEventEmitter, ResourceUsage, UUID } from './core.js';

// =============================================================================
// NEURAL CORE TYPES
// =============================================================================

export type NeuralArchitecture = 
  | 'feedforward'
  | 'recurrent'
  | 'lstm'
  | 'gru' 
  | 'transformer'
  | 'conv'
  | 'autoencoder'
  | 'gan'
  | 'vae'
  | 'reinforcement'
  | 'hybrid';

export type ActivationFunction = 
  | 'sigmoid'
  | 'tanh'
  | 'relu'
  | 'leaky_relu'
  | 'elu'
  | 'swish'
  | 'mish'
  | 'linear'
  | 'softmax'
  | 'gelu';

export type LossFunction = 
  | 'mse'
  | 'mae'
  | 'cross_entropy'
  | 'binary_cross_entropy'
  | 'huber'
  | 'focal'
  | 'dice'
  | 'iou'
  | 'custom';

export type Optimizer = 
  | 'sgd'
  | 'adam'
  | 'adamw'
  | 'rmsprop'
  | 'adagrad'
  | 'adadelta'
  | 'momentum'
  | 'nesterov'
  | 'lbfgs';

export type NeuralStatus = 'untrained' | 'training' | 'trained' | 'validating' | 'deployed' | 'error' | 'deprecated';

// =============================================================================
// NEURAL CONFIGURATION
// =============================================================================

export interface NeuralConfig {
  // System configuration
  backend: 'cpu' | 'cuda' | 'webgpu' | 'metal' | 'opencl' | 'vulkan';
  precision: 'f16' | 'f32' | 'f64' | 'mixed';
  threads: number;
  memoryPool: number; // MB
  cacheSize: number; // MB
  
  // Performance settings
  batchSize: number;
  maxEpochs: number;
  earlyStoppingPatience: number;
  validationSplit: number; // 0-1
  testSplit: number; // 0-1
  
  // Hardware acceleration
  gpu: {
    enabled: boolean;
    deviceId?: number;
    memoryFraction: number; // 0-1
    allowGrowth: boolean;
    mixedPrecision: boolean;
  };
  
  // SIMD optimizations
  simd: {
    enabled: boolean;
    vectorSize: number;
    autoVectorization: boolean;
    avx: boolean;
    sse: boolean;
  };
  
  // WebAssembly configuration
  wasm: {
    enabled: boolean;
    threads: boolean;
    simd: boolean;
    bulkMemory: boolean;
    stackSize: number; // KB
  };
  
  // Model management
  models: {
    autoSave: boolean;
    saveInterval: number; // epochs
    maxVersions: number;
    compression: boolean;
    format: 'binary' | 'json' | 'onnx' | 'tensorrt';
  };
  
  // Monitoring
  monitoring: {
    metricsEnabled: boolean;
    tensorboard: boolean;
    wandb: boolean;
    neptune: boolean;
    customLogging: boolean;
  };
}

// =============================================================================
// NEURAL NETWORK DEFINITION
// =============================================================================

export interface NeuralNetwork extends Identifiable {
  name: string;
  description: string;
  architecture: NeuralArchitecture;
  status: NeuralStatus;
  version: string;
  
  // Network structure
  layers: NeuralLayer[];
  connections: NetworkConnection[];
  inputDimensions: number[];
  outputDimensions: number[];
  
  // Training configuration
  trainingConfig: TrainingConfig;
  hyperparameters: Hyperparameters;
  
  // Model metadata
  metadata: {
    totalParameters: number;
    trainableParameters: number;
    modelSize: number; // MB
    computeComplexity: number; // FLOPs
    memoryUsage: number; // MB
    trainingTime: number; // seconds
    accuracy: number; // 0-1
    loss: number;
    lastTrained: Date;
    trainingEpochs: number;
  };
  
  // Performance metrics
  benchmarks: {
    inference_time: number; // milliseconds
    throughput: number; // samples per second
    memory_footprint: number; // MB
    energy_consumption: number; // watts
    platform: string;
    timestamp: Date;
  }[];
  
  // Deployment information
  deployment: {
    format: string;
    runtime: string;
    optimization: string[];
    quantization: boolean;
    pruning: boolean;
    distillation: boolean;
  };
}

export interface NeuralLayer {
  id: string;
  type: 'dense' | 'conv' | 'pool' | 'lstm' | 'gru' | 'attention' | 'embedding' | 'dropout' | 'normalization' | 'activation';
  name: string;
  
  // Layer configuration
  neurons: number;
  activation: ActivationFunction;
  parameters: JSONObject;
  
  // Regularization
  dropout: number; // 0-1
  batchNorm: boolean;
  layerNorm: boolean;
  weightDecay: number;
  
  // Initialization
  weightInitializer: 'xavier' | 'he' | 'random' | 'zeros' | 'ones' | 'custom';
  biasInitializer: 'zeros' | 'ones' | 'random' | 'custom';
  
  // Constraints
  constraints: {
    weights?: 'max_norm' | 'non_neg' | 'unit_norm' | 'min_max_norm';
    bias?: 'max_norm' | 'non_neg' | 'unit_norm' | 'min_max_norm';
  };
  
  // Statistics
  statistics: {
    weightMean: number;
    weightStd: number;
    gradientMean: number;
    gradientStd: number;
    activationMean: number;
    activationStd: number;
  };
}

export interface NetworkConnection {
  fromLayer: string;
  toLayer: string;
  type: 'full' | 'skip' | 'residual' | 'highway' | 'attention';
  weight: number;
  trainable: boolean;
}

// =============================================================================
// TRAINING CONFIGURATION
// =============================================================================

export interface TrainingConfig {
  // Basic training parameters
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: Optimizer;
  lossFunction: LossFunction;
  
  // Learning rate scheduling
  scheduler: {
    type: 'constant' | 'step' | 'exponential' | 'polynomial' | 'cosine' | 'cyclic' | 'plateau';
    parameters: JSONObject;
  };
  
  // Regularization
  regularization: {
    l1: number;
    l2: number;
    dropout: number; // 0-1
    earlyStoppingPatience: number;
    gradientClipping: number;
  };
  
  // Data augmentation
  augmentation: {
    enabled: boolean;
    rotation: boolean;
    scaling: boolean;
    flipping: boolean;
    noise: boolean;
    custom: JSONObject[];
  };
  
  // Validation
  validation: {
    split: number; // 0-1
    frequency: number; // epochs
    metrics: string[];
    patience: number;
    monitorMetric: string;
    mode: 'min' | 'max';
  };
  
  // Checkpointing
  checkpointing: {
    enabled: boolean;
    frequency: number; // epochs
    saveBest: boolean;
    metric: string;
    maxToKeep: number;
  };
  
  // Advanced techniques
  advanced: {
    mixedPrecision: boolean;
    gradientAccumulation: number;
    teacherForcing: boolean;
    curriculum: boolean;
    transfer: boolean;
    multitask: boolean;
  };
}

export interface Hyperparameters {
  // Architecture parameters
  hiddenLayers: number[];
  activationFunctions: ActivationFunction[];
  dropout: number[];
  
  // Training parameters
  learningRate: number;
  batchSize: number;
  momentum: number;
  weightDecay: number;
  
  // Optimizer parameters
  beta1: number; // Adam
  beta2: number; // Adam
  epsilon: number; // Adam
  rho: number; // RMSprop
  
  // Model-specific parameters
  embeddingDim: number;
  attentionHeads: number;
  sequenceLength: number;
  vocabularySize: number;
  
  // Custom parameters
  custom: JSONObject;
}

// =============================================================================
// TRAINING PROCESS
// =============================================================================

export interface TrainingJob extends Identifiable {
  networkId: UUID;
  name: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  
  // Job configuration
  config: TrainingConfig;
  hyperparameters: Hyperparameters;
  
  // Data information
  dataset: {
    name: string;
    size: number;
    features: number;
    classes: number;
    split: {
      train: number;
      validation: number;
      test: number;
    };
  };
  
  // Progress tracking
  progress: {
    epoch: number;
    totalEpochs: number;
    batch: number;
    totalBatches: number;
    percentage: number; // 0-100
    eta: Date; // estimated completion
  };
  
  // Metrics tracking
  metrics: TrainingMetrics;
  
  // Resource usage
  resources: {
    gpuMemory: number; // MB
    systemMemory: number; // MB
    diskSpace: number; // MB
    cpuUsage: number; // percentage
    gpuUsage: number; // percentage
  };
  
  // Timing information
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  estimatedCompletion?: Date;
  
  // Results
  bestModel?: {
    epoch: number;
    metrics: JSONObject;
    filepath: string;
  };
  
  // Logging
  logs: TrainingLog[];
  artifacts: string[];
}

export interface TrainingMetrics {
  // Training metrics
  trainLoss: number[];
  trainAccuracy: number[];
  trainMetrics: Record<string, number[]>;
  
  // Validation metrics
  valLoss: number[];
  valAccuracy: number[];
  valMetrics: Record<string, number[]>;
  
  // Learning curves
  learningRate: number[];
  gradientNorm: number[];
  weightNorm: number[];
  
  // Performance metrics
  epochTime: number[]; // seconds per epoch
  batchTime: number[]; // seconds per batch
  throughput: number[]; // samples per second
  
  // Model complexity
  parameters: number;
  flops: number;
  modelSize: number; // MB
  
  // Best values
  bestTrainLoss: number;
  bestTrainAccuracy: number;
  bestValLoss: number;
  bestValAccuracy: number;
  bestEpoch: number;
}

export interface TrainingLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  epoch?: number;
  batch?: number;
  metrics?: JSONObject;
  metadata?: JSONObject;
}

// =============================================================================
// INFERENCE ENGINE
// =============================================================================

export interface InferenceEngine extends Identifiable {
  name: string;
  modelId: UUID;
  status: 'loading' | 'ready' | 'busy' | 'error' | 'unloaded';
  
  // Runtime configuration
  runtime: {
    backend: 'cpu' | 'cuda' | 'webgpu' | 'tensorrt' | 'onnx';
    precision: 'f16' | 'f32' | 'int8' | 'int4';
    batchSize: number;
    parallelism: number;
    caching: boolean;
  };
  
  // Optimization settings
  optimization: {
    quantization: boolean;
    pruning: boolean;
    fusion: boolean;
    tensorrt: boolean;
    onnx: boolean;
    dynamicShapes: boolean;
  };
  
  // Performance metrics
  performance: {
    avgInferenceTime: number; // milliseconds
    throughput: number; // inferences per second
    memoryUsage: number; // MB
    cpuUsage: number; // percentage
    gpuUsage: number; // percentage
    errorRate: number; // 0-1
  };
  
  // Request queue
  queue: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    maxSize: number;
  };
  
  // Statistics
  statistics: {
    totalInferences: number;
    totalErrors: number;
    uptime: number; // seconds
    lastActivity: Date;
    averageLatency: number; // milliseconds
    p95Latency: number; // milliseconds
    p99Latency: number; // milliseconds;
  };
}

export interface InferenceRequest extends Identifiable {
  engineId: UUID;
  input: NeuralInput;
  options: InferenceOptions;
  
  // Request metadata
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeout: number; // milliseconds
  retries: number;
  
  // Tracking
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Results
  output?: NeuralOutput;
  error?: string;
  metrics?: InferenceMetrics;
}

export interface InferenceOptions {
  // Output configuration
  topK?: number;
  threshold?: number;
  temperature?: number;
  nucleus?: number; // top-p sampling
  
  // Processing options
  batch: boolean;
  streaming: boolean;
  explain: boolean;
  uncertainty: boolean;
  
  // Optimization hints
  cacheResults: boolean;
  async: boolean;
  priority: 'speed' | 'accuracy' | 'memory';
}

export interface NeuralInput {
  data: number[] | number[][] | JSONObject;
  shape: number[];
  dtype: 'float32' | 'float64' | 'int32' | 'int64' | 'uint8';
  preprocessing: {
    normalize: boolean;
    standardize: boolean;
    augment: boolean;
    custom: JSONObject[];
  };
}

export interface NeuralOutput {
  predictions: number[] | number[][] | JSONObject;
  probabilities?: number[];
  confidences?: number[];
  shape: number[];
  
  // Additional outputs
  attention?: number[][];
  embeddings?: number[];
  features?: number[];
  uncertainty?: number;
  
  // Explanability
  explanations?: {
    feature_importance: number[];
    attention_weights: number[][];
    gradient_based: number[];
    shap_values: number[];
  };
  
  // Metadata
  modelVersion: string;
  inferenceTime: number; // milliseconds
  confidence: number; // 0-1
  metadata: JSONObject;
}

export interface InferenceMetrics {
  latency: number; // milliseconds
  throughput: number; // samples per second
  memoryUsage: number; // MB
  cpuTime: number; // milliseconds
  gpuTime: number; // milliseconds
  networkIO: number; // bytes
  cacheHit: boolean;
  batchSize: number;
}

// =============================================================================
// MODEL MANAGEMENT
// =============================================================================

export interface ModelRegistry {
  // Model lifecycle
  registerModel(model: NeuralNetwork): Promise<UUID>;
  unregisterModel(modelId: UUID): Promise<boolean>;
  getModel(modelId: UUID): Promise<NeuralNetwork | null>;
  listModels(filters?: ModelFilters): Promise<NeuralNetwork[]>;
  
  // Model versions
  createVersion(modelId: UUID, changes: Partial<NeuralNetwork>): Promise<string>;
  getVersion(modelId: UUID, version: string): Promise<NeuralNetwork | null>;
  listVersions(modelId: UUID): Promise<ModelVersion[]>;
  promoteVersion(modelId: UUID, version: string): Promise<void>;
  
  // Model deployment
  deployModel(modelId: UUID, target: DeploymentTarget): Promise<InferenceEngine>;
  undeployModel(engineId: UUID): Promise<boolean>;
  getDeployment(engineId: UUID): Promise<ModelDeployment | null>;
  listDeployments(modelId?: UUID): Promise<ModelDeployment[]>;
  
  // Model optimization
  optimizeModel(modelId: UUID, options: OptimizationOptions): Promise<NeuralNetwork>;
  quantizeModel(modelId: UUID, precision: 'int8' | 'int4' | 'fp16'): Promise<NeuralNetwork>;
  pruneModel(modelId: UUID, sparsity: number): Promise<NeuralNetwork>;
  distillModel(teacherId: UUID, studentConfig: JSONObject): Promise<NeuralNetwork>;
  
  // Model validation
  validateModel(modelId: UUID, dataset: ValidationDataset): Promise<ValidationResults>;
  benchmarkModel(modelId: UUID, benchmarks: Benchmark[]): Promise<BenchmarkResults>;
  compareModels(modelIds: UUID[]): Promise<ModelComparison>;
  
  // Model monitoring
  getModelMetrics(modelId: UUID, timeRange?: TimeRange): Promise<ModelMetrics>;
  getModelHealth(modelId: UUID): Promise<ModelHealth>;
  setModelAlerts(modelId: UUID, alerts: ModelAlert[]): Promise<void>;
}

export interface ModelFilters {
  architecture?: NeuralArchitecture;
  status?: NeuralStatus;
  minAccuracy?: number;
  maxSize?: number; // MB
  tags?: string[];
  dateRange?: TimeRange;
}

export interface ModelVersion {
  version: string;
  modelId: UUID;
  changes: string[];
  performance: JSONObject;
  createdAt: Date;
  createdBy: string;
  active: boolean;
  deprecated: boolean;
}

export interface DeploymentTarget {
  platform: 'cloud' | 'edge' | 'mobile' | 'embedded' | 'web';
  environment: 'production' | 'staging' | 'development';
  region?: string;
  constraints: {
    maxLatency: number; // milliseconds
    maxMemory: number; // MB
    maxCost: number; // per hour
    minThroughput: number; // requests per second
  };
  scaling: {
    minInstances: number;
    maxInstances: number;
    targetUtilization: number; // percentage
    scaleUpThreshold: number;
    scaleDownThreshold: number;
  };
}

export interface ModelDeployment extends Identifiable {
  modelId: UUID;
  version: string;
  engineId: UUID;
  target: DeploymentTarget;
  status: 'deploying' | 'active' | 'inactive' | 'failed' | 'terminated';
  
  // Performance
  performance: {
    avgLatency: number; // milliseconds
    throughput: number; // requests per second
    errorRate: number; // 0-1
    availability: number; // 0-1
    cost: number; // per hour
  };
  
  // Scaling
  scaling: {
    currentInstances: number;
    desiredInstances: number;
    cpuUtilization: number; // percentage
    memoryUtilization: number; // percentage
    requestQueue: number;
  };
  
  // Monitoring
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastHealthCheck: Date;
  alerts: ModelAlert[];
  
  // Lifecycle
  deployedAt: Date;
  lastUpdated: Date;
  terminatedAt?: Date;
}

// =============================================================================
// NEURAL EVENTS
// =============================================================================

export interface NeuralEvents {
  // Training events
  'training-started': (jobId: UUID, config: TrainingConfig) => void;
  'training-progress': (jobId: UUID, epoch: number, metrics: JSONObject) => void;
  'training-completed': (jobId: UUID, results: TrainingMetrics) => void;
  'training-failed': (jobId: UUID, error: string) => void;
  'training-paused': (jobId: UUID, reason: string) => void;
  'training-resumed': (jobId: UUID) => void;
  
  // Model events
  'model-registered': (modelId: UUID, model: NeuralNetwork) => void;
  'model-updated': (modelId: UUID, changes: Partial<NeuralNetwork>) => void;
  'model-deployed': (modelId: UUID, engineId: UUID) => void;
  'model-undeployed': (modelId: UUID, engineId: UUID) => void;
  'model-optimized': (modelId: UUID, optimization: string) => void;
  
  // Inference events
  'inference-request': (requestId: UUID, engineId: UUID) => void;
  'inference-completed': (requestId: UUID, latency: number) => void;
  'inference-failed': (requestId: UUID, error: string) => void;
  'inference-timeout': (requestId: UUID) => void;
  
  // Performance events
  'performance-degraded': (entityId: UUID, metric: string, value: number) => void;
  'threshold-exceeded': (entityId: UUID, threshold: string, value: number) => void;
  'resource-exhausted': (entityId: UUID, resource: string) => void;
  'anomaly-detected': (entityId: UUID, anomaly: string, confidence: number) => void;
  
  // System events
  'gpu-memory-warning': (usage: number, limit: number) => void;
  'model-drift-detected': (modelId: UUID, metric: string, drift: number) => void;
  'batch-processing-completed': (batchId: UUID, count: number, duration: number) => void;
  'optimization-completed': (modelId: UUID, improvement: number) => void;
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface OptimizationOptions {
  techniques: ('quantization' | 'pruning' | 'distillation' | 'fusion' | 'tensorrt')[];
  targetLatency?: number; // milliseconds
  targetAccuracy?: number; // 0-1
  targetSize?: number; // MB
  preserveAccuracy: boolean;
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
}

export interface ValidationDataset {
  name: string;
  path: string;
  size: number;
  format: 'numpy' | 'csv' | 'json' | 'tfrecord' | 'parquet';
  preprocessing: JSONObject;
}

export interface ValidationResults {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
  classificationReport: JSONObject;
  customMetrics: Record<string, number>;
  
  // Performance analysis
  latency: {
    mean: number;
    median: number;
    p95: number;
    p99: number;
  };
  
  // Robustness
  adversarialAccuracy?: number;
  calibrationError?: number;
  uncertainty?: JSONObject;
}

export interface Benchmark {
  name: string;
  type: 'speed' | 'accuracy' | 'memory' | 'energy' | 'comprehensive';
  dataset: string;
  metrics: string[];
  constraints: JSONObject;
}

export interface BenchmarkResults {
  benchmark: string;
  modelId: UUID;
  results: Record<string, number>;
  ranking: number;
  comparison: JSONObject;
  timestamp: Date;
}

export interface ModelComparison {
  models: UUID[];
  metrics: Record<string, Record<UUID, number>>;
  rankings: Record<string, UUID[]>;
  recommendations: string[];
  tradeoffs: JSONObject;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ModelMetrics {
  modelId: UUID;
  timeRange: TimeRange;
  
  // Prediction quality
  accuracy: number[];
  precision: number[];
  recall: number[];
  f1Score: number[];
  
  // Performance
  latency: number[];
  throughput: number[];
  errorRate: number[];
  
  // Resource usage
  memoryUsage: number[];
  cpuUsage: number[];
  gpuUsage: number[];
  
  // Business metrics
  requestCount: number[];
  cost: number[];
  revenue: number[];
  
  timestamps: Date[];
}

export interface ModelHealth {
  status: 'healthy' | 'warning' | 'critical' | 'failed';
  score: number; // 0-1
  
  checks: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    value: number;
    threshold: number;
    message: string;
  }[];
  
  issues: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'performance' | 'accuracy' | 'availability' | 'resource';
    description: string;
    recommendation: string;
  }[];
  
  trends: {
    metric: string;
    direction: 'improving' | 'stable' | 'degrading';
    confidence: number;
  }[];
  
  lastCheck: Date;
  nextCheck: Date;
}

export interface ModelAlert {
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  
  actions: {
    type: 'email' | 'webhook' | 'slack' | 'pagerduty' | 'auto-scale' | 'rollback';
    config: JSONObject;
  }[];
  
  cooldown: number; // seconds
  lastTriggered?: Date;
  triggerCount: number;
}