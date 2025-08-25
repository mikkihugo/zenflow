/**
 * @fileoverview Brain Domain Types - Neural & AI Domain
 *
 * Comprehensive type definitions for neural networks, AI agents, cognitive patterns,
 * learning algorithms, and brain coordination systems. These types define the core
 * domain model for all neural and AI operations within the brain package.
 *
 * Dependencies: Only imports from @claude-zen/foundation for shared primitives.
 * Domain Independence: Self-contained neural/AI domain types.
 *
 * @package @claude-zen/brain
 * @since 2.1.0
 * @version 1.0.0
 */
// =============================================================================
// NEURAL NETWORK CORE TYPES
// =============================================================================
/**
 * Neural model types supported by the brain system
 */
export var NeuralModelType;
(function (NeuralModelType) {
  NeuralModelType['FEEDFORWARD'] = 'feedforward';
  NeuralModelType['LSTM'] = 'lstm';
  NeuralModelType['RNN'] = 'rnn';
  NeuralModelType['CNN'] = 'cnn';
  NeuralModelType['AUTOENCODER'] = 'autoencoder';
  NeuralModelType['GAN'] = 'gan';
  NeuralModelType['TRANSFORMER'] = 'transformer';
  NeuralModelType['ATTENTION'] = 'attention';
  NeuralModelType['REINFORCEMENT'] = 'reinforcement';
})(NeuralModelType || (NeuralModelType = {}));
/**
 * Activation function types for neural networks
 */
export var ActivationFunction;
(function (ActivationFunction) {
  ActivationFunction['SIGMOID'] = 'sigmoid';
  ActivationFunction['TANH'] = 'tanh';
  ActivationFunction['RELU'] = 'relu';
  ActivationFunction['LEAKY_RELU'] = 'leaky_relu';
  ActivationFunction['SWISH'] = 'swish';
  ActivationFunction['GELU'] = 'gelu';
  ActivationFunction['SOFTMAX'] = 'softmax';
  ActivationFunction['SOFTPLUS'] = 'softplus';
  ActivationFunction['LINEAR'] = 'linear';
})(ActivationFunction || (ActivationFunction = {}));
/**
 * Loss function types for training
 */
export var LossFunction;
(function (LossFunction) {
  LossFunction['MEAN_SQUARED_ERROR'] = 'mse';
  LossFunction['CROSS_ENTROPY'] = 'cross_entropy';
  LossFunction['BINARY_CROSS_ENTROPY'] = 'binary_cross_entropy';
  LossFunction['CATEGORICAL_CROSS_ENTROPY'] = 'categorical_cross_entropy';
  LossFunction['HUBER'] = 'huber';
  LossFunction['MAE'] = 'mae';
  LossFunction['HINGE'] = 'hinge';
})(LossFunction || (LossFunction = {}));
/**
 * Optimizer types for neural network training
 */
export var OptimizerType;
(function (OptimizerType) {
  OptimizerType['SGD'] = 'sgd';
  OptimizerType['ADAM'] = 'adam';
  OptimizerType['ADAMW'] = 'adamw';
  OptimizerType['RMSPROP'] = 'rmsprop';
  OptimizerType['ADAGRAD'] = 'adagrad';
  OptimizerType['MOMENTUM'] = 'momentum';
})(OptimizerType || (OptimizerType = {}));
/**
 * Metric types for evaluation
 */
export var MetricType;
(function (MetricType) {
  MetricType['ACCURACY'] = 'accuracy';
  MetricType['PRECISION'] = 'precision';
  MetricType['RECALL'] = 'recall';
  MetricType['F1_SCORE'] = 'f1_score';
  MetricType['AUC'] = 'auc';
  MetricType['MSE'] = 'mse';
  MetricType['MAE'] = 'mae';
  MetricType['RMSE'] = 'rmse';
  MetricType['R2'] = 'r2';
  MetricType['LOSS'] = 'loss';
})(MetricType || (MetricType = {}));
/**
 * Types of neural agents
 */
export var AgentType;
(function (AgentType) {
  AgentType['RESEARCHER'] = 'researcher';
  AgentType['CODER'] = 'coder';
  AgentType['ANALYST'] = 'analyst';
  AgentType['COORDINATOR'] = 'coordinator';
  AgentType['OPTIMIZER'] = 'optimizer';
  AgentType['EVALUATOR'] = 'evaluator';
  AgentType['SPECIALIST'] = 'specialist';
  AgentType['GENERALIST'] = 'generalist';
})(AgentType || (AgentType = {}));
/**
 * Reasoning styles for cognitive processing
 */
export var ReasoningStyle;
(function (ReasoningStyle) {
  ReasoningStyle['LOGICAL'] = 'logical';
  ReasoningStyle['INTUITIVE'] = 'intuitive';
  ReasoningStyle['ANALYTICAL'] = 'analytical';
  ReasoningStyle['CREATIVE'] = 'creative';
  ReasoningStyle['SYSTEMATIC'] = 'systematic';
  ReasoningStyle['HEURISTIC'] = 'heuristic';
  ReasoningStyle['ABDUCTIVE'] = 'abductive';
  ReasoningStyle['INDUCTIVE'] = 'inductive';
  ReasoningStyle['DEDUCTIVE'] = 'deductive';
})(ReasoningStyle || (ReasoningStyle = {}));
/**
 * Collaboration styles for multi-agent coordination
 */
export var CollaborationStyle;
(function (CollaborationStyle) {
  CollaborationStyle['INDEPENDENT'] = 'independent';
  CollaborationStyle['COOPERATIVE'] = 'cooperative';
  CollaborationStyle['COMPETITIVE'] = 'competitive';
  CollaborationStyle['HIERARCHICAL'] = 'hierarchical';
  CollaborationStyle['CONSENSUS'] = 'consensus';
  CollaborationStyle['DELEGATIVE'] = 'delegative';
  CollaborationStyle['SUPPORTIVE'] = 'supportive';
})(CollaborationStyle || (CollaborationStyle = {}));
/**
 * Skill types for neural agents
 */
export var SkillType;
(function (SkillType) {
  // Technical skills
  SkillType['CODE_GENERATION'] = 'code_generation';
  SkillType['CODE_ANALYSIS'] = 'code_analysis';
  SkillType['DEBUGGING'] = 'debugging';
  SkillType['TESTING'] = 'testing';
  SkillType['DOCUMENTATION'] = 'documentation';
  // Research skills
  SkillType['INFORMATION_GATHERING'] = 'information_gathering';
  SkillType['DATA_ANALYSIS'] = 'data_analysis';
  SkillType['PATTERN_RECOGNITION'] = 'pattern_recognition';
  SkillType['HYPOTHESIS_GENERATION'] = 'hypothesis_generation';
  SkillType['LITERATURE_REVIEW'] = 'literature_review';
  // Communication skills
  SkillType['EXPLANATION'] = 'explanation';
  SkillType['TEACHING'] = 'teaching';
  SkillType['PERSUASION'] = 'persuasion';
  SkillType['NEGOTIATION'] = 'negotiation';
  SkillType['PRESENTATION'] = 'presentation';
  // Creative skills
  SkillType['IDEA_GENERATION'] = 'idea_generation';
  SkillType['PROBLEM_SOLVING'] = 'problem_solving';
  SkillType['DESIGN'] = 'design';
  SkillType['INNOVATION'] = 'innovation';
  SkillType['SYNTHESIS'] = 'synthesis';
})(SkillType || (SkillType = {}));
/**
 * Learning abilities of neural agents
 */
export var LearningAbility;
(function (LearningAbility) {
  LearningAbility['SUPERVISED_LEARNING'] = 'supervised';
  LearningAbility['UNSUPERVISED_LEARNING'] = 'unsupervised';
  LearningAbility['REINFORCEMENT_LEARNING'] = 'reinforcement';
  LearningAbility['TRANSFER_LEARNING'] = 'transfer';
  LearningAbility['META_LEARNING'] = 'meta';
  LearningAbility['FEW_SHOT_LEARNING'] = 'few_shot';
  LearningAbility['ZERO_SHOT_LEARNING'] = 'zero_shot';
  LearningAbility['ONLINE_LEARNING'] = 'online';
  LearningAbility['CONTINUOUS_LEARNING'] = 'continuous';
})(LearningAbility || (LearningAbility = {}));
/**
 * Learning strategies
 */
export var LearningStrategy;
(function (LearningStrategy) {
  LearningStrategy['GRADIENT_DESCENT'] = 'gradient_descent';
  LearningStrategy['GENETIC_ALGORITHM'] = 'genetic_algorithm';
  LearningStrategy['PARTICLE_SWARM'] = 'particle_swarm';
  LearningStrategy['SIMULATED_ANNEALING'] = 'simulated_annealing';
  LearningStrategy['BAYESIAN_OPTIMIZATION'] = 'bayesian_optimization';
  LearningStrategy['EVOLUTIONARY_STRATEGY'] = 'evolutionary_strategy';
  LearningStrategy['NEUROEVOLUTION'] = 'neuroevolution';
})(LearningStrategy || (LearningStrategy = {}));
/**
 * Metric types for evaluation - Consolidated enum
 */
export var MetricTypeExtended;
(function (MetricTypeExtended) {
  MetricTypeExtended['PERPLEXITY'] = 'perplexity';
  MetricTypeExtended['BLEU'] = 'bleu';
  MetricTypeExtended['ROUGE'] = 'rouge';
  MetricTypeExtended['METEOR'] = 'meteor';
  MetricTypeExtended['CUSTOM'] = 'custom';
})(MetricTypeExtended || (MetricTypeExtended = {}));
/**
 * Evaluation frequency settings
 */
export var EvaluationFrequency;
(function (EvaluationFrequency) {
  EvaluationFrequency['EPOCH'] = 'epoch';
  EvaluationFrequency['BATCH'] = 'batch';
  EvaluationFrequency['STEP'] = 'step';
  EvaluationFrequency['TIME_BASED'] = 'time_based';
  EvaluationFrequency['PERFORMANCE_BASED'] = 'performance_based';
  EvaluationFrequency['ADAPTIVE'] = 'adaptive';
})(EvaluationFrequency || (EvaluationFrequency = {}));
/**
 * Coordination topologies
 */
export var CoordinationTopology;
(function (CoordinationTopology) {
  CoordinationTopology['CENTRALIZED'] = 'centralized';
  CoordinationTopology['DECENTRALIZED'] = 'decentralized';
  CoordinationTopology['HIERARCHICAL'] = 'hierarchical';
  CoordinationTopology['MESH'] = 'mesh';
  CoordinationTopology['RING'] = 'ring';
  CoordinationTopology['TREE'] = 'tree';
  CoordinationTopology['HYBRID'] = 'hybrid';
})(CoordinationTopology || (CoordinationTopology = {}));
/**
 * Reliability levels for communication
 */
export var ReliabilityLevel;
(function (ReliabilityLevel) {
  ReliabilityLevel['BEST_EFFORT'] = 'best_effort';
  ReliabilityLevel['AT_LEAST_ONCE'] = 'at_least_once';
  ReliabilityLevel['AT_MOST_ONCE'] = 'at_most_once';
  ReliabilityLevel['EXACTLY_ONCE'] = 'exactly_once';
})(ReliabilityLevel || (ReliabilityLevel = {}));
/**
 * Message types for different communication purposes
 */
export var MessageType;
(function (MessageType) {
  MessageType['TASK_ASSIGNMENT'] = 'task_assignment';
  MessageType['TASK_RESULT'] = 'task_result';
  MessageType['COORDINATION_REQUEST'] = 'coordination_request';
  MessageType['STATUS_UPDATE'] = 'status_update';
  MessageType['KNOWLEDGE_SHARING'] = 'knowledge_sharing';
  MessageType['LEARNING_UPDATE'] = 'learning_update';
  MessageType['ERROR_REPORT'] = 'error_report';
  MessageType['HEARTBEAT'] = 'heartbeat';
  MessageType['SHUTDOWN'] = 'shutdown';
})(MessageType || (MessageType = {}));
/**
 * Agent status enumeration
 */
export var AgentStatus;
(function (AgentStatus) {
  AgentStatus['INITIALIZING'] = 'initializing';
  AgentStatus['READY'] = 'ready';
  AgentStatus['BUSY'] = 'busy';
  AgentStatus['LEARNING'] = 'learning';
  AgentStatus['IDLE'] = 'idle';
  AgentStatus['PAUSED'] = 'paused';
  AgentStatus['ERROR'] = 'error';
  AgentStatus['SHUTTING_DOWN'] = 'shutting_down';
  AgentStatus['OFFLINE'] = 'offline';
})(AgentStatus || (AgentStatus = {}));
/**
 * Dataset types
 */
export var DatasetType;
(function (DatasetType) {
  DatasetType['SUPERVISED'] = 'supervised';
  DatasetType['UNSUPERVISED'] = 'unsupervised';
  DatasetType['REINFORCEMENT'] = 'reinforcement';
  DatasetType['SEMI_SUPERVISED'] = 'semi_supervised';
  DatasetType['MULTIMODAL'] = 'multimodal';
  DatasetType['TIME_SERIES'] = 'time_series';
  DatasetType['GRAPH'] = 'graph';
  DatasetType['TEXT'] = 'text';
  DatasetType['IMAGE'] = 'image';
  DatasetType['AUDIO'] = 'audio';
})(DatasetType || (DatasetType = {}));
/**
 * Data format specifications
 */
export var DataFormat;
(function (DataFormat) {
  DataFormat['CSV'] = 'csv';
  DataFormat['JSON'] = 'json';
  DataFormat['PARQUET'] = 'parquet';
  DataFormat['NUMPY'] = 'numpy';
  DataFormat['TENSOR'] = 'tensor';
  DataFormat['HDF5'] = 'hdf5';
  DataFormat['TFRECORD'] = 'tfrecord';
  DataFormat['CUSTOM'] = 'custom';
})(DataFormat || (DataFormat = {}));
// =============================================================================
// EXPORTED UTILITY FUNCTIONS
// =============================================================================
/**
 * Type guard for neural agents
 */
export function isNeuralAgent(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'agentType' in obj &&
    'cognitiveModel' in obj &&
    'capabilities' in obj
  );
}
/**
 * Type guard for neural network config
 */
export function isNeuralNetworkConfig(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'modelType' in obj &&
    'architecture' in obj &&
    'training' in obj
  );
}
/**
 * Type guard for agent messages
 */
export function isAgentMessage(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'from' in obj &&
    'to' in obj &&
    'type' in obj &&
    'payload' in obj
  );
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
//# sourceMappingURL=index.js.map
