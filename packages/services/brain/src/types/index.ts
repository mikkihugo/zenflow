/**
 * @fileoverview Brain Domain Types - Neural & AI Domain
 *
 * Comprehensive type definitions for neural networks, AI agents, cognitive patterns,
 * learning algorithms, and brain coordination systems. These types define the core
 * domain model for all neural and AI operations within the brain package.
 *
 * Dependencies:Only imports from @claude-zen/foundation for shared primitives.
 * Domain Independence:Self-contained neural/AI domain types.
 *
 * @package @claude-zen/brain
 * @since 2.1.0
 * @version 1.0.0
 */

import type {
  Entity,
  LogLevel,
  NonEmptyArray,
  Priority,
  Result,
  Timestamp,
  UUID,
} from '@claude-zen/foundation/types';

// =============================================================================
// NEURAL NETWORK CORE TYPES
// =============================================================================

/**
 * Neural model types supported by the brain system
 */
export enum NeuralModelType {
  FEEDFORWARD = 'feedforward',  LSTM = 'lstm',  RNN = 'rnn',  CNN = 'cnn',  AUTOENCODER = 'autoencoder',  GAN = 'gan',  TRANSFORMER = 'transformer',  ATTENTION = 'attention',  REINFORCEMENT = 'reinforcement',}

/**
 * Activation function types for neural networks
 */
export enum ActivationFunction {
  SIGMOID = 'sigmoid',  TANH = 'tanh',  RELU = 'relu',  LEAKY_RELU = 'leaky_relu',  SWISH = 'swish',  GELU = 'gelu',  SOFTMAX = 'softmax',  SOFTPLUS = 'softplus',  LINEAR = 'linear',}

/**
 * Loss function types for training
 */
export enum LossFunction {
  MEAN_SQUARED_ERROR = 'mse',  CROSS_ENTROPY = 'cross_entropy',  BINARY_CROSS_ENTROPY = 'binary_cross_entropy',  CATEGORICAL_CROSS_ENTROPY = 'categorical_cross_entropy',  HUBER = 'huber',  MAE = 'mae',  HINGE = 'hinge',}

/**
 * Optimizer types for neural network training
 */
export enum OptimizerType {
  SGD = 'sgd',  ADAM = 'adam',  ADAMW = 'adamw',  RMSPROP = 'rmsprop',  ADAGRAD = 'adagrad',  MOMENTUM = 'momentum',}

/**
 * Metric types for evaluation
 */
export enum MetricType {
  ACCURACY = 'accuracy',  PRECISION = 'precision',  RECALL = 'recall',  F1_SCORE = 'f1_score',  AUC = 'auc',  MSE = 'mse',  MAE = 'mae',  RMSE = 'rmse',  R2 = 'r2',  LOSS = 'loss',}

// =============================================================================
// NEURAL NETWORK CONFIGURATION TYPES
// =============================================================================

/**
 * Configuration for neural network architecture
 */
// =============================================================================
// MISSING TYPE DEFINITIONS - ADDED TO FIX COMPILATION
// =============================================================================

/**
 * Network metadata
 */
export interface NetworkMetadata {
  version:string;
  author?:string;
  description?:string;
  tags?:string[];
  createdAt:Timestamp;
  lastModified:Timestamp;
}

/**
 * Retention policy for memory
 */
export interface RetentionPolicy {
  duration:number;
  priority:Priority;
  decayRate:number;
}

/**
 * Consolidation strategy for memory
 */
export interface ConsolidationStrategy {
  type: '...[proper format needed]
'  interval?:number;
  threshold?:number;
}

/**
 * Retrieval mechanism for memory
 */
export interface RetrievalMechanism {
  type: '...[proper format needed]
'  similarity:number;
  context:boolean;
}

/**
 * Adaptation configuration
 */
export interface AdaptationConfig {
  enabled:boolean;
  rate:number;
  threshold:number;
  strategy:'gradual' | ' immediate' | ' batch';
}

/**
 * Feedback configuration
 */
export interface FeedbackConfig {
  enabled:boolean;
  type:'explicit' | ' implicit' | ' reinforcement';
  weight:number;
  delay?:number;
}

/**
 * Evaluation criteria
 */
export interface EvaluationCriteria {
  accuracy:number;
  precision:number;
  recall:number;
  f1Score:number;
  customMetrics?:Record<string, number>;
}

/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
  name:string;
  version:string;
  datasets:string[];
  metrics:string[];
  baseline:Record<string, number>;
}

/**
 * Benchmark comparison
 */
export interface BenchmarkComparison {
  baseline:Record<string, number>;
  current:Record<string, number>;
  improvement:Record<string, number>;
  significance:number;
}

/**
 * Learning progress tracking
 */
export interface LearningProgress {
  epoch:number;
  loss:number;
  metrics:Record<string, number>;
  validationLoss?:number;
  validationMetrics?:Record<string, number>;
}

/**
 * Adaptation event
 */
export interface AdaptationEvent {
  type:'parameter' | ' architecture' | ' strategy';
  trigger:string;
  changes:Record<string, any>;
  timestamp:Timestamp;
  impact:number;
}

/**
 * Consensus algorithm
 */
export interface ConsensusAlgorithm {
  type: '...[proper format needed]
'  threshold?:number;
  weights?:Record<string, number>;
}

/**
 * Synchronization strategy
 */
export interface SynchronizationStrategy {
  type: '...[proper format needed]
'  interval?:number;
  tolerance?:number;
}

/**
 * Fault tolerance configuration
 */
export interface FaultToleranceConfig {
  enabled:boolean;
  retries:number;
  timeout:number;
  fallback?:string;
}

/**
 * Attachment interface
 */
export interface Attachment {
  id:UUID;
  type:string;
  name:string;
  size:number;
  url?:string;
  data?:Buffer;
}

/**
 * Feature specification
 */
export interface FeatureSpec {
  name:string;
  type: '...[proper format needed]
'  description?:string;
  range?:[number, number];
  categories?:string[];
}

/**
 * Label specification
 */
export interface LabelSpec {
  name:string;
  type:'binary' | ' multiclass' | ' regression';
  classes?:string[];
  range?:[number, number];
}

/**
 * Preprocessing configuration
 */
export interface PreprocessingConfig {
  normalization?:'minmax' | ' zscore' | ' robust';
  encoding?:'onehot' | ' label' | ' binary';
  featureSelection?:'variance' | ' correlation' | ' mutual_info';
  dimensionReduction?:'pca' | ' tsne' | ' umap';
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  method: 'holdout|kfold|stratified|timeseries;
'  splits:number;
  testSize:number;
  randomState?:number;
}

/**
 * Training metrics
 */
export interface TrainingMetrics {
  loss:number[];
  accuracy?:number[];
  precision?:number[];
  recall?:number[];
  f1Score?:number[];
  customMetrics?:Record<string, number[]>;
}

/**
 * Coordination response
 */
export interface CoordinationResponse {
  success:boolean;
  result?:any;
  error?:string;
  metrics?:Record<string, number>;
  timestamp:Timestamp;
}

export interface NeuralNetworkConfig extends Entity {
  modelType:NeuralModelType;
  architecture:NetworkArchitecture;
  training:TrainingConfiguration;
  optimization:OptimizationConfig;
  metadata:NetworkMetadata;
}

/**
 * Network architecture specification
 */
export interface NetworkArchitecture {
  inputSize:number;
  outputSize:number;
  hiddenLayers:NonEmptyArray<LayerConfig>;
  activation:ActivationFunction;
  outputActivation?:ActivationFunction;
  dropout?:number;
  batchNormalization?:boolean;
  skipConnections?:boolean;
}

/**
 * Layer configuration for neural networks
 */
export interface LayerConfig {
  type: '...[proper format needed]
'  size:number;
  activation?:ActivationFunction;
  dropout?:number;
  regularization?:RegularizationConfig;
  parameters?:Record<string, unknown>;
}

/**
 * Regularization configuration
 */
export interface RegularizationConfig {
  l1?:number;
  l2?:number;
  dropout?:number;
  batchNorm?:boolean;
  layerNorm?:boolean;
}

/**
 * Training configuration for neural networks
 */
export interface TrainingConfiguration {
  epochs:number;
  batchSize:number;
  learningRate:number;
  validationSplit?:number;
  earlyStop?:EarlyStoppingConfig;
  scheduler?:LearningRateScheduler;
  mixedPrecision?:boolean;
  gradientClipping?:number;
}

/**
 * Early stopping configuration
 */
export interface EarlyStoppingConfig {
  enabled:boolean;
  patience:number;
  minDelta:number;
  metric:'loss' | ' accuracy' | ' f1' | ' precision' | ' recall;
  mode:'min' | ' max;
  restoreBestWeights:boolean;
}

/**
 * Learning rate scheduler configuration
 */
export interface LearningRateScheduler {
  type: '...[proper format needed]
'  parameters:Record<string, number>;
  warmupSteps?:number;
}

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  optimizer:OptimizerType;
  lossFunction:LossFunction;
  metrics:NonEmptyArray<MetricType>;
  parameters:OptimizerParameters;
  gradientNorm?:number;
  weightDecay?:number;
}

/**
 * Optimizer parameters
 */
export interface OptimizerParameters {
  beta1?:number;
  beta2?:number;
  epsilon?:number;
  momentum?:number;
  rho?:number;
  dampening?:number;
  nesterov?:boolean;
}

// =============================================================================
// NEURAL AGENT TYPES
// =============================================================================

/**
 * Neural agent - AI entity with cognitive capabilities
 */
export interface NeuralAgent extends Entity {
  agentType:AgentType;
  cognitiveModel:CognitivePattern;
  capabilities:AgentCapabilities;
  learningConfig:LearningConfiguration;
  performance:AgentPerformance;
  state:AgentState;
}

/**
 * Types of neural agents
 */
export enum AgentType {
  RESEARCHER = 'researcher',  CODER = 'coder',  ANALYST = 'analyst',  COORDINATOR = 'coordinator',  OPTIMIZER = 'optimizer',  EVALUATOR = 'evaluator',  SPECIALIST = 'specialist',  GENERALIST = 'generalist',}

/**
 * Cognitive patterns for neural agents
 */
export interface CognitivePattern {
  reasoningStyle:ReasoningStyle;
  memoryModel:MemoryModel;
  attentionMechanism:AttentionMechanism;
  creativityLevel:number; // 0.0 - 1.0
  analyticalDepth:number; // 0.0 - 1.0
  collaborationStyle:CollaborationStyle;
}

/**
 * Reasoning styles for cognitive processing
 */
export enum ReasoningStyle {
  LOGICAL = 'logical',  INTUITIVE = 'intuitive',  ANALYTICAL = 'analytical',  CREATIVE = 'creative',  SYSTEMATIC = 'systematic',  HEURISTIC = 'heuristic',  ABDUCTIVE = 'abductive',  INDUCTIVE = 'inductive',  DEDUCTIVE = 'deductive',}

/**
 * Memory model configuration
 */
export interface MemoryModel {
  type: '...[proper format needed]
'  capacity:number;
  retention:RetentionPolicy;
  consolidation:ConsolidationStrategy;
  retrieval:RetrievalMechanism;
}

/**
 * Attention mechanism configuration
 */
export interface AttentionMechanism {
  type: '...[proper format needed]
'  scope:number; // attention span
  intensity:number; // attention strength
  adaptability:number; // dynamic adjustment
}

/**
 * Collaboration styles for multi-agent coordination
 */
export enum CollaborationStyle {
  INDEPENDENT = 'independent',  COOPERATIVE = 'cooperative',  COMPETITIVE = 'competitive',  HIERARCHICAL = 'hierarchical',  CONSENSUS = 'consensus',  DELEGATIVE = 'delegative',  SUPPORTIVE = 'supportive',}

/**
 * Agent capabilities and skills
 */
export interface AgentCapabilities {
  primarySkills:NonEmptyArray<SkillType>;
  secondarySkills:SkillType[];
  learningAbilities:LearningAbility[];
  adaptationRate:number; // 0.0 - 1.0
  specializationLevel:number; // 0.0 - 1.0
  generalKnowledge:number; // 0.0 - 1.0
}

/**
 * Skill types for neural agents
 */
export enum SkillType {
  // Technical skills
  CODE_GENERATION = 'code_generation',  CODE_ANALYSIS = 'code_analysis',  DEBUGGING = 'debugging',  TESTING = 'testing',  DOCUMENTATION = 'documentation',
  // Research skills
  INFORMATION_GATHERING = 'information_gathering',  DATA_ANALYSIS = 'data_analysis',  PATTERN_RECOGNITION = 'pattern_recognition',  HYPOTHESIS_GENERATION = 'hypothesis_generation',  LITERATURE_REVIEW = 'literature_review',
  // Communication skills
  EXPLANATION = 'explanation',  TEACHING = 'teaching',  PERSUASION = 'persuasion',  NEGOTIATION = 'negotiation',  PRESENTATION = 'presentation',
  // Creative skills
  IDEA_GENERATION = 'idea_generation',  PROBLEM_SOLVING = 'problem_solving',  DESIGN = 'design',  INNOVATION = 'innovation',  SYNTHESIS = 'synthesis',}

/**
 * Learning abilities of neural agents
 */
export enum LearningAbility {
  SUPERVISED_LEARNING = 'supervised',  UNSUPERVISED_LEARNING = 'unsupervised',  REINFORCEMENT_LEARNING = 'reinforcement',  TRANSFER_LEARNING = 'transfer',  META_LEARNING = 'meta',  FEW_SHOT_LEARNING = 'few_shot',  ZERO_SHOT_LEARNING = 'zero_shot',  ONLINE_LEARNING = 'online',  CONTINUOUS_LEARNING = 'continuous',}

// =============================================================================
// LEARNING AND ADAPTATION TYPES
// =============================================================================

/**
 * Learning configuration for neural agents
 */
export interface LearningConfiguration {
  strategy:LearningStrategy;
  parameters:LearningParameters;
  evaluation:EvaluationConfig;
  adaptation:AdaptationConfig;
  feedback:FeedbackConfig;
}

/**
 * Learning strategies
 */
export enum LearningStrategy {
  GRADIENT_DESCENT = 'gradient_descent',  GENETIC_ALGORITHM = 'genetic_algorithm',  PARTICLE_SWARM = 'particle_swarm',  SIMULATED_ANNEALING = 'simulated_annealing',  BAYESIAN_OPTIMIZATION = 'bayesian_optimization',  EVOLUTIONARY_STRATEGY = 'evolutionary_strategy',  NEUROEVOLUTION = 'neuroevolution',}

/**
 * Learning parameters configuration
 */
export interface LearningParameters {
  learningRate:number;
  adaptationThreshold:number;
  explorationRate:number; // for reinforcement learning
  exploitationRate:number;
  memoryRetention:number;
  forgettingRate:number;
  consolidationStrength:number;
}

/**
 * Evaluation configuration for learning assessment
 */
export interface EvaluationConfig {
  metrics:NonEmptyArray<MetricType>;
  frequency:EvaluationFrequency;
  criteria:EvaluationCriteria;
  benchmarks:BenchmarkConfig[];
}

/**
 * Metric types for evaluation - Consolidated enum
 */
export enum MetricTypeExtended {
  PERPLEXITY = 'perplexity',  BLEU = 'bleu',  ROUGE = 'rouge',  METEOR = 'meteor',  CUSTOM = 'custom',}

/**
 * Evaluation frequency settings
 */
export enum EvaluationFrequency {
  EPOCH = 'epoch',  BATCH = 'batch',  STEP = 'step',  TIME_BASED = 'time_based',  PERFORMANCE_BASED = 'performance_based',  ADAPTIVE = 'adaptive',}

// =============================================================================
// PERFORMANCE AND MONITORING TYPES
// =============================================================================

/**
 * Agent performance metrics and tracking
 */
export interface AgentPerformance {
  currentMetrics:PerformanceMetrics;
  historicalTrends:PerformanceTrend[];
  benchmarkComparisons:BenchmarkComparison[];
  learningProgress:LearningProgress;
  adaptationHistory:AdaptationEvent[];
}

/**
 * Performance metrics for neural agents
 */
export interface PerformanceMetrics {
  accuracy:number;
  precision:number;
  recall:number;
  f1Score:number;
  processingSpeed:number; // operations per second
  memoryEfficiency:number;
  energyConsumption:number;
  errorRate:number;
  responseTime:number;
  throughput:number;
  reliability:number;
  adaptability:number;
}

/**
 * Performance trend tracking
 */
export interface PerformanceTrend {
  metric:MetricType;
  timeWindow:TimeWindow;
  values:TimeSeriesData[];
  trend:'increasing|decreasing|' improving' | ' stable' | ' declining'|volatile;
  confidence:number;
}

/**
 * Time series data for trends
 */
export interface TimeSeriesData {
  timestamp:Timestamp;
  value:number;
  metadata?:Record<string, unknown>;
}

/**
 * Time window specification
 */
export interface TimeWindow {
  start:Timestamp;
  end:Timestamp;
  granularity: 'second|minute|hour|day|week|month;
'  aggregation: 'mean|median|max|min|sum|count;
'}

// =============================================================================
// COORDINATION AND COMMUNICATION TYPES
// =============================================================================

/**
 * Brain coordination system configuration
 */
export interface BrainCoordinationConfig {
  topology:CoordinationTopology;
  communication:CommunicationProtocol;
  consensus:ConsensusAlgorithm;
  synchronization:SynchronizationStrategy;
  faultTolerance:FaultToleranceConfig;
}

/**
 * Coordination topologies
 */
export enum CoordinationTopology {
  CENTRALIZED = 'centralized',  DECENTRALIZED = 'decentralized',  HIERARCHICAL = 'hierarchical',  MESH = 'mesh',  RING = 'ring',  TREE = 'tree',  HYBRID = 'hybrid',}

/**
 * Communication protocols for neural agents
 */
export interface CommunicationProtocol {
  type:|'message_passing|shared_memory|event_driven|rpc|streaming;
  format: 'json|binary|protobuf|custom;
'  encryption:boolean;
  compression:boolean;
  reliability:ReliabilityLevel;
}

/**
 * Reliability levels for communication
 */
export enum ReliabilityLevel {
  BEST_EFFORT = 'best_effort',  AT_LEAST_ONCE = 'at_least_once',  AT_MOST_ONCE = 'at_most_once',  EXACTLY_ONCE = 'exactly_once',}

/**
 * Message types for agent communication
 */
export interface AgentMessage {
  id:UUID;
  from:UUID; // sender agent ID
  to:UUID|UUID[]; // recipient agent ID(s)
  type:MessageType;
  payload:MessagePayload;
  priority:Priority;
  timestamp:Timestamp;
  expiresAt?:Timestamp;
  correlationId?:UUID;
  replyTo?:UUID;
}

/**
 * Message types for different communication purposes
 */
export enum MessageType {
  TASK_ASSIGNMENT ='task_assignment',  TASK_RESULT = 'task_result',  COORDINATION_REQUEST = 'coordination_request',  STATUS_UPDATE = 'status_update',  KNOWLEDGE_SHARING = 'knowledge_sharing',  LEARNING_UPDATE = 'learning_update',  ERROR_REPORT = 'error_report',  HEARTBEAT = 'heartbeat',  SHUTDOWN = 'shutdown',}

/**
 * Message payload structure
 */
export interface MessagePayload {
  data:Record<string, unknown>;
  metadata:MessageMetadata;
  attachments?:Attachment[];
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  encoding:string;
  size:number;
  checksum:string;
  compression?:string;
  encryption?:string;
  ttl?:number; // time to live in milliseconds
}

// =============================================================================
// UTILITY AND HELPER TYPES
// =============================================================================

/**
 * Agent state information
 */
export interface AgentState {
  status:AgentStatus;
  currentTask?:UUID;
  workload:number; // 0.0 - 1.0
  health:HealthStatus;
  resources:ResourceUsage;
  lastActivity:Timestamp;
  uptime:number;
}

/**
 * Agent status enumeration
 */
export enum AgentStatus {
  INITIALIZING = 'initializing',  READY = 'ready',  BUSY = 'busy',  LEARNING = 'learning',  IDLE = 'idle',  PAUSED = 'paused',  ERROR = 'error',  SHUTTING_DOWN = 'shutting_down',  OFFLINE = 'offline',}

/**
 * Health status for neural agents
 */
export interface HealthStatus {
  status: 'healthy|degraded|critical|unknown;
'  score:number; // 0.0 - 1.0
  issues:HealthIssue[];
  lastCheck:Timestamp;
  nextCheck:Timestamp;
}

/**
 * Health issue tracking
 */
export interface HealthIssue {
  type: '...[proper format needed]
'  severity: 'low|medium|high|critical;
'  message:string;
  timestamp:Timestamp;
  resolved:boolean;
  resolvedAt?:Timestamp;
}

/**
 * Resource usage tracking
 */
export interface ResourceUsage {
  cpu:number; // percentage
  memory:number; // bytes
  gpu?:number; // percentage
  network:NetworkUsage;
  storage:StorageUsage;
}

/**
 * Network usage statistics
 */
export interface NetworkUsage {
  bytesIn:number;
  bytesOut:number;
  packetsIn:number;
  packetsOut:number;
  errors:number;
  latency:number; // milliseconds
}

/**
 * Storage usage statistics
 */
export interface StorageUsage {
  used:number; // bytes
  available:number; // bytes
  reads:number;
  writes:number;
  iops:number;
}

// =============================================================================
// TRAINING AND DATASET TYPES
// =============================================================================

/**
 * Training data specification
 */
export interface TrainingDataset {
  id:UUID;
  name:string;
  type:DatasetType;
  format:DataFormat;
  size:DatasetSize;
  splits:DatasetSplits;
  features:FeatureSpec[];
  labels?:LabelSpec;
  preprocessing:PreprocessingConfig;
  validation:ValidationConfig;
}

/**
 * Dataset types
 */
export enum DatasetType {
  SUPERVISED = 'supervised',  UNSUPERVISED = 'unsupervised',  REINFORCEMENT = 'reinforcement',  SEMI_SUPERVISED = 'semi_supervised',  MULTIMODAL = 'multimodal',  TIME_SERIES = 'time_series',  GRAPH = 'graph',  TEXT = 'text',  IMAGE = 'image',  AUDIO = 'audio',}

/**
 * Data format specifications
 */
export enum DataFormat {
  CSV = 'csv',  JSON = 'json',  PARQUET = 'parquet',  NUMPY = 'numpy',  TENSOR = 'tensor',  HDF5 = 'hdf5',  TFRECORD = 'tfrecord',  CUSTOM = 'custom',}

/**
 * Dataset size information
 */
export interface DatasetSize {
  samples:number;
  features:number;
  bytes:number;
  compressed:boolean;
  estimatedMemory:number;
}

/**
 * Dataset splits for training/validation/test
 */
export interface DatasetSplits {
  train:SplitInfo;
  validation:SplitInfo;
  test:SplitInfo;
  stratified:boolean;
  randomSeed?:number;
}

/**
 * Split information
 */
export interface SplitInfo {
  size:number;
  percentage:number;
  samples:number;
}

// =============================================================================
// EXPORTED UTILITY FUNCTIONS
// =============================================================================

/**
 * Type guard for neural agents
 */
export function isNeuralAgent(obj:unknown): obj is NeuralAgent {
  return (
    typeof obj === 'object' &&')    obj !== null &&
    'agentType' in obj &&')    'cognitiveModel' in obj &&')    'capabilities' in obj')  );
}

/**
 * Type guard for neural network config
 */
export function isNeuralNetworkConfig(
  obj:unknown
):obj is NeuralNetworkConfig {
  return (
    typeof obj === 'object' &&')    obj !== null &&
    'modelType' in obj &&')    'architecture' in obj &&')    'training' in obj')  );
}

/**
 * Type guard for agent messages
 */
export function isAgentMessage(obj:unknown): obj is AgentMessage {
  return (
    typeof obj === 'object' &&')    obj !== null &&
    'id' in obj &&')    'from' in obj &&')    'to' in obj &&')    'type' in obj &&')    'payload' in obj')  );
}

// =============================================================================
// RESULT TYPES FOR BRAIN OPERATIONS
// =============================================================================

/**
 * Result types for brain-specific operations
 */
export type NeuralAgentResult<T> = Result<T, NeuralError>;
export type TrainingResult = Result<TrainingMetrics, TrainingError>;
export type CoordinationResult = Result<
  CoordinationResponse,
  CoordinationError
>;

/**
 * Neural-specific error types
 */
export interface NeuralError extends Error {
  readonly type: 'NeuralError;
'  readonly message:string;
  readonly category:|'training|inference|coordination|configuration;
  readonly modelId?:UUID;
  readonly agentId?:UUID;
  readonly timestamp:Timestamp;
  readonly code:string;
  readonly errorId:UUID;
  readonly context?:Record<string, unknown>;
  readonly cause?:Error;
  readonly retryable:boolean;
  readonly logLevel:LogLevel;
  readonly name:string;
  readonly stack?:string;
}

/**
 * Training-specific error types
 */
export interface TrainingError extends NeuralError {
  readonly category: 'training;
'  readonly epochNumber?:number;
  readonly batchNumber?:number;
  readonly lossValue?:number;
}

/**
 * Coordination-specific error types
 */
export interface CoordinationError extends NeuralError {
  readonly category: 'coordination;
'  readonly topology?:CoordinationTopology;
  readonly participantCount?:number;
}

// Export all types as the default brain domain types
export default {
  // Enums
  NeuralModelType,
  ActivationFunction,
  LossFunction,
  OptimizerType,
  AgentType,
  ReasoningStyle,
  CollaborationStyle,
  SkillType,
  LearningAbility,
  LearningStrategy,
  MetricType,
  EvaluationFrequency,
  CoordinationTopology,
  ReliabilityLevel,
  MessageType,
  AgentStatus,
  DatasetType,
  DataFormat,

  // Type guards
  isNeuralAgent,
  isNeuralNetworkConfig,
  isAgentMessage,
};

// =============================================================================
// ADDITIONAL EXPORTS FOR COMPATIBILITY
// =============================================================================

/**
 * Model metrics interface for brain.js bridge
 */
export interface ModelMetrics {
  accuracy:number;
  loss:number;
  iterations:number;
  time:number;
  errorRate:number;
  convergence:boolean;
}
