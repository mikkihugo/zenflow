/**
 * @fileoverview Comprehensive Zod Schemas for Adaptive Learning Library
 * 
 * This file contains all Zod schemas for type-safe validation of data structures
 * used throughout the adaptive learning system. These schemas resolve the 200+
 * TypeScript errors by providing runtime validation and strict typing.
 * 
 * Schema Categories:
 * - Core Data Structures (ExecutionData, Pattern, Agent, Task, Resource)
 * - Pattern Recognition (PatternAnalysis, Anomaly, Insights)
 * - Learning Coordination (LearningResult, ExpertiseEvolution, BestPractice)
 * - Performance Optimization (BehaviorOptimization, AllocationStrategy)
 * - Machine Learning (MLModelRegistry, Neural Networks, Reinforcement Learning)
 * - Supporting Types (Metrics, Resources, Constraints)
 * 
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { z } from 'zod';

// ============================================
// Base Schema Primitives
// ============================================

/**
 * Common base schemas used throughout the system
 */
export const BaseSchemas = {
  /** Positive number validation */
  PositiveNumber: z.number().min(0),
  
  /** Probability value (0-1) */
  Probability: z.number().min(0).max(1),
  
  /** Percentage value (0-100) */
  Percentage: z.number().min(0).max(100),
  
  /** Unix timestamp */
  Timestamp: z.number().int().positive(),
  
  /** Non-empty string */
  NonEmptyString: z.string().min(1),
  
  /** UUID-like identifier */
  Id: z.string().min(1),
  
  /** Severity levels */
  Severity: z.enum(['low', 'medium', 'high', 'critical']),
  
  /** Priority levels */
  Priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  /** Status types */
  Status: z.enum(['completed', 'failed', 'timeout', 'cancelled']),
  
  /** Environment types */
  Environment: z.enum(['development', 'staging', 'production']),
} as const;

// ============================================
// Resource and Performance Metrics
// ============================================

/**
 * Resource metrics schema for CPU, memory, network, etc.
 */
export const ResourceMetricsSchema = z.object({
  cpu: BaseSchemas.PositiveNumber,
  memory: BaseSchemas.PositiveNumber,
  network: BaseSchemas.PositiveNumber,
  diskIO: BaseSchemas.PositiveNumber,
  bandwidth: BaseSchemas.PositiveNumber,
  latency: BaseSchemas.PositiveNumber,
});

/**
 * Comprehensive performance metrics
 */
export const PerformanceMetricsSchema = z.object({
  throughput: BaseSchemas.PositiveNumber,
  latency: BaseSchemas.PositiveNumber,
  errorRate: BaseSchemas.Probability,
  resourceUtilization: ResourceMetricsSchema,
  efficiency: BaseSchemas.Probability,
  quality: BaseSchemas.Probability,
});

/**
 * Resource usage tracking
 */
export const ResourceUsageSchema = z.object({
  timestamp: BaseSchemas.Timestamp,
  cpu: BaseSchemas.PositiveNumber,
  memory: BaseSchemas.PositiveNumber,
  network: BaseSchemas.PositiveNumber,
  diskIO: BaseSchemas.PositiveNumber,
  duration: BaseSchemas.PositiveNumber,
  context: z.string(),
});

// ============================================
// Core Data Structures
// ============================================

/**
 * Core execution data schema - foundation of all learning
 */
export const ExecutionDataSchema = z.object({
  id: BaseSchemas.Id,
  agentId: BaseSchemas.Id,
  taskType: BaseSchemas.NonEmptyString,
  action: BaseSchemas.NonEmptyString,
  parameters: z.record(z.unknown()),
  result: z.unknown(),
  duration: BaseSchemas.PositiveNumber,
  resourceUsage: ResourceMetricsSchema,
  timestamp: BaseSchemas.Timestamp,
  success: z.boolean(),
  context: z.record(z.unknown()),
});

/**
 * Pattern type enumeration
 */
export const PatternTypeSchema = z.enum([
  'task_completion',
  'communication',
  'resource_utilization',
  'failure',
  'coordination',
  'optimization'
]);

/**
 * Pattern metadata for pattern analysis
 */
export const PatternMetadataSchema = z.object({
  complexity: BaseSchemas.Probability,
  predictability: BaseSchemas.Probability,
  stability: BaseSchemas.Probability,
  anomalyScore: BaseSchemas.Probability,
  correlations: z.array(z.object({
    patternId: BaseSchemas.Id,
    strength: BaseSchemas.Probability,
    type: z.enum(['causal', 'temporal', 'spatial', 'behavioral']),
    confidence: BaseSchemas.Probability,
  })),
  quality: BaseSchemas.Probability,
  relevance: BaseSchemas.Probability,
});

/**
 * Core pattern schema
 */
export const PatternSchema = z.object({
  id: BaseSchemas.Id,
  type: PatternTypeSchema,
  data: z.unknown(),
  confidence: BaseSchemas.Probability,
  frequency: BaseSchemas.PositiveNumber,
  context: z.record(z.unknown()),
  metadata: PatternMetadataSchema,
  timestamp: BaseSchemas.Timestamp,
});

/**
 * Agent schema with capabilities and performance
 */
export const AgentSchema = z.object({
  id: BaseSchemas.Id,
  type: BaseSchemas.NonEmptyString,
  capabilities: z.array(z.string()),
  currentLoad: BaseSchemas.Probability,
  performance: PerformanceMetricsSchema,
  specializations: z.array(z.string()),
  learningProgress: z.object({
    totalExperience: BaseSchemas.PositiveNumber,
    domainsLearned: z.array(z.string()),
    currentLearningRate: BaseSchemas.Probability,
    knowledgeRetention: BaseSchemas.Probability,
    adaptability: BaseSchemas.Probability,
  }),
});

/**
 * Task constraint schema
 */
export const TaskConstraintSchema = z.object({
  type: BaseSchemas.NonEmptyString,
  value: z.unknown(),
  flexibility: BaseSchemas.Probability,
  priority: BaseSchemas.PositiveNumber,
});

/**
 * Task schema with requirements and constraints
 */
export const TaskSchema = z.object({
  id: BaseSchemas.Id,
  type: BaseSchemas.NonEmptyString,
  priority: BaseSchemas.PositiveNumber,
  complexity: BaseSchemas.Probability,
  requirements: z.array(z.string()),
  constraints: z.array(TaskConstraintSchema),
  estimatedDuration: BaseSchemas.PositiveNumber,
  dependencies: z.array(BaseSchemas.Id),
});

/**
 * Resource constraint schema
 */
export const ResourceConstraintSchema = z.object({
  type: BaseSchemas.NonEmptyString,
  limit: BaseSchemas.PositiveNumber,
  flexibility: BaseSchemas.Probability,
  cost: BaseSchemas.PositiveNumber,
});

/**
 * Resource schema with capacity and constraints
 */
export const ResourceSchema = z.object({
  id: BaseSchemas.Id,
  type: BaseSchemas.NonEmptyString,
  capacity: BaseSchemas.PositiveNumber,
  currentUsage: BaseSchemas.PositiveNumber,
  availability: BaseSchemas.Probability,
  cost: BaseSchemas.PositiveNumber,
  constraints: z.array(ResourceConstraintSchema),
});

/**
 * System context schema
 */
export const SystemContextSchema = z.object({
  environment: BaseSchemas.Environment,
  resources: z.array(ResourceConstraintSchema),
  constraints: z.array(z.object({
    type: BaseSchemas.NonEmptyString,
    description: BaseSchemas.NonEmptyString,
    limit: z.unknown(),
    priority: BaseSchemas.PositiveNumber,
  })),
  objectives: z.array(z.object({
    type: BaseSchemas.NonEmptyString,
    description: BaseSchemas.NonEmptyString,
    target: BaseSchemas.PositiveNumber,
    weight: BaseSchemas.Probability,
    measurement: BaseSchemas.NonEmptyString,
  })),
});

// ============================================
// Pattern Recognition Schemas
// ============================================

/**
 * Anomaly type enumeration
 */
export const AnomalyTypeSchema = z.enum([
  'performance',
  'behavior',
  'resource',
  'failure',
  'coordination'
]);

/**
 * Anomaly detection schema
 */
export const AnomalySchema = z.object({
  id: BaseSchemas.Id,
  type: AnomalyTypeSchema,
  severity: BaseSchemas.Severity,
  description: BaseSchemas.NonEmptyString,
  affectedData: z.array(ExecutionDataSchema),
  confidence: BaseSchemas.Probability,
  timestamp: BaseSchemas.Timestamp,
});

/**
 * Pattern insight schema
 */
export const PatternInsightSchema = z.object({
  type: z.enum(['optimization', 'warning', 'recommendation', 'prediction']),
  description: BaseSchemas.NonEmptyString,
  impact: BaseSchemas.Probability,
  confidence: BaseSchemas.Probability,
  actionable: z.boolean(),
  relatedPatterns: z.array(BaseSchemas.Id),
});

/**
 * Pattern cluster schema
 */
export const PatternClusterSchema = z.object({
  id: BaseSchemas.Id,
  type: PatternTypeSchema,
  centroid: z.unknown(),
  members: z.array(ExecutionDataSchema),
  confidence: BaseSchemas.Probability,
  stability: BaseSchemas.Probability,
});

/**
 * Complete pattern analysis result
 */
export const PatternAnalysisSchema = z.object({
  patterns: z.array(PatternClusterSchema),
  anomalies: z.array(AnomalySchema),
  confidence: BaseSchemas.Probability,
  insights: z.array(PatternInsightSchema),
  timestamp: BaseSchemas.Timestamp,
});

/**
 * Task result schema
 */
export const TaskResultSchema = z.object({
  taskId: BaseSchemas.Id,
  agentId: BaseSchemas.Id,
  status: BaseSchemas.Status,
  duration: BaseSchemas.PositiveNumber,
  quality: BaseSchemas.Probability,
  resourceUsage: ResourceMetricsSchema,
  errors: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()),
});

/**
 * Task completion pattern schema
 */
export const TaskCompletionPatternSchema = z.object({
  taskType: BaseSchemas.NonEmptyString,
  averageDuration: BaseSchemas.PositiveNumber,
  successRate: BaseSchemas.Probability,
  qualityScore: BaseSchemas.Probability,
  resourceProfile: ResourceMetricsSchema,
  optimalConditions: z.array(z.string()),
  commonFailures: z.array(z.string()),
});

/**
 * Message schema for communication patterns
 */
export const MessageSchema = z.object({
  id: BaseSchemas.Id,
  from: BaseSchemas.Id,
  to: BaseSchemas.Id,
  type: BaseSchemas.NonEmptyString,
  payload: z.unknown(),
  timestamp: BaseSchemas.Timestamp,
  priority: BaseSchemas.Priority,
  latency: BaseSchemas.PositiveNumber.optional(),
  size: BaseSchemas.PositiveNumber.optional(),
});

/**
 * Communication pattern schema
 */
export const CommunicationPatternSchema = z.object({
  source: BaseSchemas.Id,
  target: BaseSchemas.Id,
  messageType: BaseSchemas.NonEmptyString,
  frequency: BaseSchemas.PositiveNumber,
  averageLatency: BaseSchemas.PositiveNumber,
  averageSize: BaseSchemas.PositiveNumber,
  reliability: BaseSchemas.Probability,
  efficiency: BaseSchemas.Probability,
});

// ============================================
// Learning Coordination Schemas
// ============================================

/**
 * Learning type enumeration
 */
export const LearningTypeSchema = z.enum([
  'supervised',
  'unsupervised',
  'reinforcement',
  'online',
  'transfer'
]);

/**
 * Learning metadata schema
 */
export const LearningMetadataSchema = z.object({
  algorithmUsed: BaseSchemas.NonEmptyString,
  trainingTime: BaseSchemas.PositiveNumber,
  dataQuality: BaseSchemas.Probability,
  convergence: z.boolean(),
  iterations: BaseSchemas.PositiveNumber,
  validationScore: BaseSchemas.Probability,
});

/**
 * Performance improvement schema
 */
export const PerformanceImprovementSchema = z.object({
  metric: BaseSchemas.NonEmptyString,
  baseline: BaseSchemas.PositiveNumber,
  improved: BaseSchemas.PositiveNumber,
  improvement: BaseSchemas.Percentage,
  confidence: BaseSchemas.Probability,
  sustainability: BaseSchemas.Probability,
});

/**
 * Knowledge update schema
 */
export const KnowledgeUpdateSchema = z.object({
  domain: BaseSchemas.NonEmptyString,
  type: z.enum(['new', 'updated', 'refined', 'deprecated']),
  knowledge: z.unknown(),
  confidence: BaseSchemas.Probability,
  source: BaseSchemas.NonEmptyString,
  timestamp: BaseSchemas.Timestamp,
});

/**
 * Learning result schema
 */
export const LearningResultSchema = z.object({
  agentId: BaseSchemas.Id,
  learningType: LearningTypeSchema,
  patterns: z.array(PatternSchema),
  improvements: z.array(PerformanceImprovementSchema),
  knowledge: z.array(KnowledgeUpdateSchema),
  metadata: LearningMetadataSchema,
});

/**
 * Expertise timepoint schema
 */
export const ExpertiseTimepointSchema = z.object({
  timestamp: BaseSchemas.Timestamp,
  level: BaseSchemas.Probability,
  domain: BaseSchemas.NonEmptyString,
  milestone: z.string().optional(),
});

/**
 * Expertise evolution schema
 */
export const ExpertiseEvolutionSchema = z.object({
  agentId: BaseSchemas.Id,
  domain: BaseSchemas.NonEmptyString,
  currentLevel: BaseSchemas.Probability,
  growthRate: BaseSchemas.PositiveNumber,
  specializations: z.array(z.string()),
  knowledgeGaps: z.array(z.string()),
  timeline: z.array(ExpertiseTimepointSchema),
});

/**
 * Outcome metrics schema
 */
export const OutcomeMetricsSchema = z.object({
  efficiency: BaseSchemas.Probability,
  quality: BaseSchemas.Probability,
  cost: BaseSchemas.PositiveNumber,
  satisfaction: BaseSchemas.Probability,
  sustainability: BaseSchemas.Probability,
});

/**
 * Best practice schema
 */
export const BestPracticeSchema = z.object({
  id: BaseSchemas.Id,
  category: BaseSchemas.NonEmptyString,
  description: BaseSchemas.NonEmptyString,
  conditions: z.array(z.string()),
  outcomes: OutcomeMetricsSchema,
  confidence: BaseSchemas.Probability,
  usageCount: BaseSchemas.PositiveNumber,
  successRate: BaseSchemas.Probability,
});

/**
 * Anti-pattern schema
 */
export const AntiPatternSchema = z.object({
  id: BaseSchemas.Id,
  category: BaseSchemas.NonEmptyString,
  description: BaseSchemas.NonEmptyString,
  triggers: z.array(z.string()),
  consequences: z.array(z.string()),
  avoidance: z.array(z.string()),
  detectionConfidence: BaseSchemas.Probability,
});

// ============================================
// Performance Optimization Schemas
// ============================================

/**
 * Optimization action schema
 */
export const OptimizationActionSchema = z.object({
  type: BaseSchemas.NonEmptyString,
  description: BaseSchemas.NonEmptyString,
  target: BaseSchemas.NonEmptyString,
  parameters: z.record(z.unknown()),
  expectedImpact: BaseSchemas.Probability,
  effort: BaseSchemas.PositiveNumber,
  risk: BaseSchemas.Probability,
});

/**
 * Behavior optimization schema
 */
export const BehaviorOptimizationSchema = z.object({
  agentId: BaseSchemas.Id,
  optimizations: z.array(OptimizationActionSchema),
  expectedImprovement: BaseSchemas.Probability,
  confidence: BaseSchemas.Probability,
  implementationCost: BaseSchemas.PositiveNumber,
  validationMetrics: z.array(z.string()),
});

/**
 * Task allocation schema
 */
export const TaskAllocationSchema = z.object({
  taskId: BaseSchemas.Id,
  agentId: BaseSchemas.Id,
  confidence: BaseSchemas.Probability,
  expectedDuration: BaseSchemas.PositiveNumber,
  expectedQuality: BaseSchemas.Probability,
  reasoning: BaseSchemas.NonEmptyString,
});

/**
 * Allocation constraint schema
 */
export const AllocationConstraintSchema = z.object({
  type: BaseSchemas.NonEmptyString,
  description: BaseSchemas.NonEmptyString,
  priority: BaseSchemas.PositiveNumber,
  flexibility: BaseSchemas.Probability,
});

/**
 * Allocation strategy schema
 */
export const AllocationStrategySchema = z.object({
  tasks: z.array(TaskAllocationSchema),
  expectedEfficiency: BaseSchemas.Probability,
  resourceUtilization: BaseSchemas.Probability,
  balanceScore: BaseSchemas.Probability,
  constraints: z.array(AllocationConstraintSchema),
});

/**
 * Resource allocation schema
 */
export const ResourceAllocationSchema = z.object({
  resourceId: BaseSchemas.Id,
  allocation: BaseSchemas.PositiveNumber,
  duration: BaseSchemas.PositiveNumber,
  priority: BaseSchemas.PositiveNumber,
  efficiency: BaseSchemas.Probability,
});

/**
 * Adaptive threshold schema
 */
export const AdaptiveThresholdSchema = z.object({
  metric: BaseSchemas.NonEmptyString,
  currentThreshold: BaseSchemas.PositiveNumber,
  adaptiveRange: z.tuple([z.number(), z.number()]),
  adaptationRate: BaseSchemas.Probability,
  conditions: z.array(z.string()),
});

/**
 * Resource strategy schema
 */
export const ResourceStrategySchema = z.object({
  allocations: z.array(ResourceAllocationSchema),
  expectedPerformance: BaseSchemas.Probability,
  utilizationTarget: BaseSchemas.Probability,
  costEfficiency: BaseSchemas.Probability,
  adaptiveThresholds: z.array(AdaptiveThresholdSchema),
});

/**
 * Implementation step schema for optimization plans
 */
export const ImplementationStepSchema = z.object({
  id: BaseSchemas.Id,
  description: BaseSchemas.NonEmptyString,
  duration: BaseSchemas.PositiveNumber,
  dependencies: z.array(BaseSchemas.Id),
  resources: z.array(z.string()),
  validation: BaseSchemas.NonEmptyString,
});

/**
 * Monitoring metric schema
 */
export const MonitoringMetricSchema = z.object({
  name: BaseSchemas.NonEmptyString,
  type: BaseSchemas.NonEmptyString,
  threshold: BaseSchemas.PositiveNumber,
  alertLevel: z.enum(['info', 'warning', 'error', 'critical']),
});

/**
 * Latency optimization schema (resolves performance-optimizer.ts errors)
 */
export const LatencyOptimizationSchema = z.object({
  target: BaseSchemas.NonEmptyString,
  optimization: BaseSchemas.NonEmptyString,
  expectedReduction: BaseSchemas.PositiveNumber,
  implementation: z.array(ImplementationStepSchema),
  monitoring: z.array(MonitoringMetricSchema),
});

/**
 * Implementation plan schema
 */
export const ImplementationPlanSchema = z.object({
  steps: z.array(ImplementationStepSchema),
  timeline: BaseSchemas.PositiveNumber,
  resources: z.array(z.string()),
  risks: z.array(z.object({
    id: BaseSchemas.Id,
    description: BaseSchemas.NonEmptyString,
    probability: BaseSchemas.Probability,
    impact: BaseSchemas.Probability,
    mitigation: BaseSchemas.NonEmptyString,
  })),
  validation: z.array(z.object({
    step: BaseSchemas.NonEmptyString,
    criteria: BaseSchemas.NonEmptyString,
    method: BaseSchemas.NonEmptyString,
  })).optional(),
});

/**
 * Monitoring strategy schema
 */
export const MonitoringStrategySchema = z.object({
  metrics: z.array(MonitoringMetricSchema),
  frequency: BaseSchemas.PositiveNumber,
  alerts: z.array(z.object({
    metric: BaseSchemas.NonEmptyString,
    condition: BaseSchemas.NonEmptyString,
    threshold: BaseSchemas.PositiveNumber,
    severity: BaseSchemas.Severity,
    action: BaseSchemas.NonEmptyString,
  })),
  dashboards: z.array(z.string()),
});

// ============================================
// Machine Learning Schemas
// ============================================

/**
 * Training result schema
 */
export const TrainingResultSchema = z.object({
  accuracy: BaseSchemas.Probability,
  loss: BaseSchemas.PositiveNumber,
  epochs: BaseSchemas.PositiveNumber,
  trainingTime: BaseSchemas.PositiveNumber,
  validationScore: BaseSchemas.Probability,
  modelSize: BaseSchemas.PositiveNumber,
});

/**
 * Evaluation metrics schema
 */
export const EvaluationMetricsSchema = z.object({
  accuracy: BaseSchemas.Probability,
  precision: BaseSchemas.Probability,
  recall: BaseSchemas.Probability,
  f1Score: BaseSchemas.Probability,
  auc: BaseSchemas.Probability,
  confusion: z.array(z.array(z.number())),
});

/**
 * Model info schema
 */
export const ModelInfoSchema = z.object({
  name: BaseSchemas.NonEmptyString,
  version: BaseSchemas.NonEmptyString,
  architecture: BaseSchemas.NonEmptyString,
  parameters: BaseSchemas.PositiveNumber,
  trainedOn: BaseSchemas.NonEmptyString,
  lastUpdated: BaseSchemas.Timestamp,
});

/**
 * Ensemble prediction schema
 */
export const EnsemblePredictionSchema = z.object({
  prediction: z.unknown(),
  confidence: BaseSchemas.Probability,
  modelContributions: z.record(z.string(), z.number()),
  uncertainty: BaseSchemas.Probability,
});

// ============================================
// Configuration Schemas
// ============================================

/**
 * Adaptive learning configuration schema
 */
export const AdaptiveLearningConfigSchema = z.object({
  patternRecognition: z.object({
    enabled: z.boolean(),
    minPatternFrequency: BaseSchemas.PositiveNumber,
    confidenceThreshold: BaseSchemas.Probability,
    analysisWindow: BaseSchemas.PositiveNumber,
  }),
  learning: z.object({
    enabled: z.boolean(),
    learningRate: BaseSchemas.Probability,
    adaptationRate: BaseSchemas.Probability,
    knowledgeRetention: BaseSchemas.Probability,
  }),
  optimization: z.object({
    enabled: z.boolean(),
    optimizationThreshold: BaseSchemas.Probability,
    maxOptimizations: BaseSchemas.PositiveNumber,
    validationRequired: z.boolean(),
  }),
  ml: z.object({
    neuralNetwork: z.boolean(),
    reinforcementLearning: z.boolean(),
    ensemble: z.boolean(),
    onlineLearning: z.boolean(),
  }),
});

// ============================================
// Validation Schemas for Common Issues
// ============================================

/**
 * Schemas to resolve specific TypeScript errors found in compilation
 */

/**
 * Communication data schema (resolves behavioral-optimization.ts errors)
 */
export const CommunicationDataSchema = z.object({
  count: BaseSchemas.PositiveNumber,
  avgSize: BaseSchemas.PositiveNumber,
  avgLatency: BaseSchemas.PositiveNumber,
});

/**
 * Neural network weights schema (resolves ml-integration.ts errors)
 */
export const NeuralWeightsSchema = z.object({
  weights: z.array(z.number()),
  bias: z.number(),
  learningRate: BaseSchemas.Probability,
});

/**
 * Neural network model schema for more complex models
 */
export const NeuralNetworkModelSchema = z.object({
  inputSize: BaseSchemas.PositiveNumber,
  outputSize: BaseSchemas.PositiveNumber,
  weights: z.array(z.number()),
  biases: z.array(z.number()),
});

/**
 * Task completion statistics schema (resolves pattern-recognition-engine.ts errors)
 */
export const TaskCompletionStatsSchema = z.object({
  frequency: BaseSchemas.PositiveNumber,
  durationVariance: BaseSchemas.PositiveNumber,
  averageDuration: BaseSchemas.PositiveNumber,
  successRate: BaseSchemas.Probability,
});

/**
 * Resource usage statistics schema
 */
export const ResourceUsageStatsSchema = z.object({
  variance: BaseSchemas.PositiveNumber,
  average: BaseSchemas.PositiveNumber,
  peak: BaseSchemas.PositiveNumber,
  mean: BaseSchemas.PositiveNumber,
  median: BaseSchemas.PositiveNumber,
  std: BaseSchemas.PositiveNumber,
  min: BaseSchemas.PositiveNumber,
  max: BaseSchemas.PositiveNumber,
  percentiles: z.record(z.string(), z.number()),
});

/**
 * Network topology schema (resolves pattern analysis errors)
 */
export const NetworkTopologySchema = z.object({
  topology: z.enum(['mesh', 'hierarchical', 'ring', 'star']),
});

/**
 * Success prediction schema (resolves multiple prediction errors)
 */
export const SuccessDataSchema = z.object({
  success: z.boolean(),
  target: BaseSchemas.Id,
  messageType: BaseSchemas.NonEmptyString,
  error: z.string().optional(),
});

/**
 * Action pattern schema (resolves learning-coordinator.ts errors)
 */
export const ActionPatternSchema = z.object({
  action: BaseSchemas.NonEmptyString,
  frequency: BaseSchemas.PositiveNumber,
});

// ============================================
// Exported Schema Collections
// ============================================

/**
 * Core schemas collection for primary data structures
 */
export const CoreSchemas = {
  ExecutionData: ExecutionDataSchema,
  Pattern: PatternSchema,
  Agent: AgentSchema,
  Task: TaskSchema,
  Resource: ResourceSchema,
  PerformanceMetrics: PerformanceMetricsSchema,
  ResourceUsage: ResourceUsageSchema,
  SystemContext: SystemContextSchema,
} as const;

/**
 * Pattern recognition schemas collection
 */
export const PatternSchemas = {
  PatternAnalysis: PatternAnalysisSchema,
  Anomaly: AnomalySchema,
  PatternInsight: PatternInsightSchema,
  TaskCompletionPattern: TaskCompletionPatternSchema,
  CommunicationPattern: CommunicationPatternSchema,
} as const;

/**
 * Learning coordination schemas collection
 */
export const LearningSchemas = {
  LearningResult: LearningResultSchema,
  ExpertiseEvolution: ExpertiseEvolutionSchema,
  BestPractice: BestPracticeSchema,
  AntiPattern: AntiPatternSchema,
} as const;

/**
 * Performance optimization schemas collection
 */
export const OptimizationSchemas = {
  BehaviorOptimization: BehaviorOptimizationSchema,
  AllocationStrategy: AllocationStrategySchema,
  ResourceStrategy: ResourceStrategySchema,
  LatencyOptimization: LatencyOptimizationSchema,
  ImplementationPlan: ImplementationPlanSchema,
  MonitoringStrategy: MonitoringStrategySchema,
  ImplementationStep: ImplementationStepSchema,
  MonitoringMetric: MonitoringMetricSchema,
} as const;

/**
 * Machine learning schemas collection
 */
export const MLSchemas = {
  TrainingResult: TrainingResultSchema,
  EvaluationMetrics: EvaluationMetricsSchema,
  ModelInfo: ModelInfoSchema,
  EnsemblePrediction: EnsemblePredictionSchema,
} as const;

/**
 * Configuration schemas collection
 */
export const ConfigSchemas = {
  AdaptiveLearningConfig: AdaptiveLearningConfigSchema,
} as const;

/**
 * Validation schemas for error resolution
 */
export const ValidationSchemas = {
  CommunicationData: CommunicationDataSchema,
  NeuralWeights: NeuralWeightsSchema,
  NeuralNetworkModel: NeuralNetworkModelSchema,
  TaskCompletionStats: TaskCompletionStatsSchema,
  ResourceUsageStats: ResourceUsageStatsSchema,
  NetworkTopology: NetworkTopologySchema,
  SuccessData: SuccessDataSchema,
  ActionPattern: ActionPatternSchema,
} as const;

/**
 * All schemas exported as a single object for convenience
 */
export const AllSchemas = {
  ...CoreSchemas,
  ...PatternSchemas,
  ...LearningSchemas,
  ...OptimizationSchemas,
  ...MLSchemas,
  ...ConfigSchemas,
  ...ValidationSchemas,
} as const;

// ============================================
// Type Exports from Schemas
// ============================================

/**
 * TypeScript types inferred from Zod schemas
 * These replace the unknown types in the original types.ts
 */
export type ExecutionData = z.infer<typeof ExecutionDataSchema>;
export type Pattern = z.infer<typeof PatternSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type ResourceUsage = z.infer<typeof ResourceUsageSchema>;
export type SystemContext = z.infer<typeof SystemContextSchema>;

export type PatternAnalysis = z.infer<typeof PatternAnalysisSchema>;
export type Anomaly = z.infer<typeof AnomalySchema>;
export type PatternInsight = z.infer<typeof PatternInsightSchema>;

export type LearningResult = z.infer<typeof LearningResultSchema>;
export type ExpertiseEvolution = z.infer<typeof ExpertiseEvolutionSchema>;
export type BestPractice = z.infer<typeof BestPracticeSchema>;
export type AntiPattern = z.infer<typeof AntiPatternSchema>;

export type BehaviorOptimization = z.infer<typeof BehaviorOptimizationSchema>;
export type AllocationStrategy = z.infer<typeof AllocationStrategySchema>;
export type AllocationConstraint = z.infer<typeof AllocationConstraintSchema>;
export type ResourceStrategy = z.infer<typeof ResourceStrategySchema>;
export type LatencyOptimization = z.infer<typeof LatencyOptimizationSchema>;
export type ImplementationPlan = z.infer<typeof ImplementationPlanSchema>;
export type MonitoringStrategy = z.infer<typeof MonitoringStrategySchema>;
export type ImplementationStep = z.infer<typeof ImplementationStepSchema>;
export type MonitoringMetric = z.infer<typeof MonitoringMetricSchema>;

export type AdaptiveLearningConfig = z.infer<typeof AdaptiveLearningConfigSchema>;

// Validation helper types for error resolution
export type CommunicationData = z.infer<typeof CommunicationDataSchema>;
export type NeuralWeights = z.infer<typeof NeuralWeightsSchema>;
export type NeuralNetworkModel = z.infer<typeof NeuralNetworkModelSchema>;
export type TaskCompletionStats = z.infer<typeof TaskCompletionStatsSchema>;
export type ResourceUsageStats = z.infer<typeof ResourceUsageStatsSchema>;
export type NetworkTopology = z.infer<typeof NetworkTopologySchema>;
export type SuccessData = z.infer<typeof SuccessDataSchema>;
export type ActionPattern = z.infer<typeof ActionPatternSchema>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validates execution data with detailed error reporting
 */
export function validateExecutionData(data: unknown): ExecutionData {
  return ExecutionDataSchema.parse(data);
}

/**
 * Safely validates execution data, returning null on failure
 */
export function safeValidateExecutionData(data: unknown): ExecutionData | null {
  const result = ExecutionDataSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validates pattern data with detailed error reporting
 */
export function validatePattern(data: unknown): Pattern {
  return PatternSchema.parse(data);
}

/**
 * Validates performance metrics
 */
export function validatePerformanceMetrics(data: unknown): PerformanceMetrics {
  return PerformanceMetricsSchema.parse(data);
}

/**
 * Validates configuration objects
 */
export function validateConfig(data: unknown): AdaptiveLearningConfig {
  return AdaptiveLearningConfigSchema.parse(data);
}

/**
 * Generic validation function for any schema
 */
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe generic validation function that returns null on failure
 */
export function safeValidateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

// ============================================
// Schema Registry for Dynamic Validation
// ============================================

/**
 * Schema registry for runtime schema lookup
 */
export const SchemaRegistry = new Map<string, z.ZodSchema<any>>([
  ['ExecutionData', ExecutionDataSchema],
  ['Pattern', PatternSchema],
  ['Agent', AgentSchema],
  ['Task', TaskSchema],
  ['Resource', ResourceSchema],
  ['PerformanceMetrics', PerformanceMetricsSchema],
  ['ResourceUsage', ResourceUsageSchema],
  ['SystemContext', SystemContextSchema],
  ['PatternAnalysis', PatternAnalysisSchema],
  ['Anomaly', AnomalySchema],
  ['LearningResult', LearningResultSchema],
  ['BehaviorOptimization', BehaviorOptimizationSchema],
  ['AllocationStrategy', AllocationStrategySchema],
  ['ResourceStrategy', ResourceStrategySchema],
  ['LatencyOptimization', LatencyOptimizationSchema],
  ['ImplementationPlan', ImplementationPlanSchema],
  ['MonitoringStrategy', MonitoringStrategySchema],
  ['ImplementationStep', ImplementationStepSchema],
  ['MonitoringMetric', MonitoringMetricSchema],
  ['AdaptiveLearningConfig', AdaptiveLearningConfigSchema],
  // Validation schemas for error resolution
  ['CommunicationData', CommunicationDataSchema],
  ['NeuralWeights', NeuralWeightsSchema],
  ['NeuralNetworkModel', NeuralNetworkModelSchema],
  ['TaskCompletionStats', TaskCompletionStatsSchema],
  ['ResourceUsageStats', ResourceUsageStatsSchema],
  ['NetworkTopology', NetworkTopologySchema],
  ['SuccessData', SuccessDataSchema],
  ['ActionPattern', ActionPatternSchema],
]);

/**
 * Validates data using schema name lookup
 */
export function validateBySchemaName(schemaName: string, data: unknown): unknown {
  const schema = SchemaRegistry.get(schemaName);
  if (!schema) {
    throw new Error(`Schema not found: ${schemaName}`);
  }
  return schema.parse(data);
}

/**
 * Gets available schema names
 */
export function getAvailableSchemas(): string[] {
  return Array.from(SchemaRegistry.keys());
}

/**
 * Schema validation summary for development
 */
export const SchemaValidationSummary = {
  totalSchemas: SchemaRegistry.size,
  coreSchemas: Object.keys(CoreSchemas).length,
  patternSchemas: Object.keys(PatternSchemas).length,
  learningSchemas: Object.keys(LearningSchemas).length,
  optimizationSchemas: Object.keys(OptimizationSchemas).length,
  mlSchemas: Object.keys(MLSchemas).length,
  validationSchemas: Object.keys(ValidationSchemas).length,
  availableSchemas: getAvailableSchemas(),
} as const;