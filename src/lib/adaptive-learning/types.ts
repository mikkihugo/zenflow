/**
 * Adaptive Learning Types.
 *
 * Core interfaces and types for the adaptive learning system that learns.
 * From swarm execution patterns to optimize performance and predict failures.
 */

// ============================================
// Core Pattern Recognition Types
// ============================================
/**
 * @file TypeScript type definitions.
 */

export interface ExecutionData {
  id: string;
  agentId: string;
  taskType: string;
  action: string;
  parameters: unknown;
  result: unknown;
  duration: number;
  resourceUsage: ResourceMetrics;
  timestamp: number;
  success: boolean;
  context: Record<string, unknown>;
}

export interface PatternAnalysis {
  patterns: PatternCluster[];
  anomalies: Anomaly[];
  confidence: number;
  insights: PatternInsight[];
  timestamp: number;
}

export interface PatternCluster {
  id: string;
  type: PatternType;
  centroid: unknown;
  members: ExecutionData[];
  confidence: number;
  stability: number;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedData: ExecutionData[];
  confidence: number;
  timestamp: number;
}

export interface PatternInsight {
  type: 'optimization' | 'warning' | 'recommendation' | 'prediction';
  description: string;
  impact: number; // 0-1 scale
  confidence: number;
  actionable: boolean;
  relatedPatterns: string[];
}

// ============================================
// Learning Coordination Types
// ============================================

export interface LearningResult {
  agentId: string;
  learningType: LearningType;
  patterns: Pattern[];
  improvements: PerformanceImprovement[];
  knowledge: KnowledgeUpdate[];
  metadata: LearningMetadata;
}

export interface ExpertiseEvolution {
  agentId: string;
  domain: string;
  currentLevel: number; // 0-1 scale
  growthRate: number;
  specializations: string[];
  knowledgeGaps: string[];
  timeline: ExpertiseTimepoint[];
}

export interface BestPractice {
  id: string;
  category: string;
  description: string;
  conditions: string[];
  outcomes: OutcomeMetrics;
  confidence: number;
  usageCount: number;
  successRate: number;
}

export interface AntiPattern {
  id: string;
  category: string;
  description: string;
  triggers: string[];
  consequences: string[];
  avoidance: string[];
  detectionConfidence: number;
}

// ============================================
// Performance Optimization Types
// ============================================

export interface BehaviorOptimization {
  agentId: string;
  optimizations: OptimizationAction[];
  expectedImprovement: number;
  confidence: number;
  implementationCost: number;
  validationMetrics: string[];
}

export interface AllocationStrategy {
  tasks: TaskAllocation[];
  expectedEfficiency: number;
  resourceUtilization: number;
  balanceScore: number;
  constraints: AllocationConstraint[];
}

export interface ResourceStrategy {
  allocations: ResourceAllocation[];
  expectedPerformance: number;
  utilizationTarget: number;
  costEfficiency: number;
  adaptiveThresholds: AdaptiveThreshold[];
}

export interface EfficiencyImprovement {
  category: 'cpu' | 'memory' | 'network' | 'coordination';
  currentMetrics: PerformanceMetrics;
  targetMetrics: PerformanceMetrics;
  optimizations: OptimizationAction[];
  estimatedGain: number;
  implementation: ImplementationPlan;
}

export interface LatencyReduction {
  bottlenecks: Bottleneck[];
  optimizations: LatencyOptimization[];
  expectedReduction: number; // milliseconds
  implementation: ImplementationPlan;
  monitoringPlan: MonitoringStrategy;
}

// ============================================
// Machine Learning Types
// ============================================

export interface MLModelRegistry {
  neuralNetwork: NeuralNetworkPredictor;
  reinforcementLearning: ReinforcementLearningEngine;
  ensemble: EnsembleModels;
  onlineLearning: OnlineLearningSystem;
}

export interface NeuralNetworkPredictor {
  predict(data: ExecutionData[]): Promise<Pattern[]>;
  train(data: ExecutionData[], labels: unknown[]): Promise<TrainingResult>;
  evaluate(testData: ExecutionData[]): Promise<EvaluationMetrics>;
  getModelInfo(): ModelInfo;
}

export interface ReinforcementLearningEngine {
  selectAction(state: string, availableActions: string[]): string;
  updateQValue(
    state: string,
    action: string,
    reward: number,
    nextState: string
  ): void;
  getQValue(state: string, action: string): number;
  getPolicy(): Map<string, string>;
}

export interface EnsembleModels {
  addModel(model: unknown, weight: number): void;
  predict(data: ExecutionData[]): Promise<EnsemblePrediction>;
  getModelWeights(): Map<string, number>;
  updateWeights(performance: PerformanceMetrics[]): void;
}

export interface OnlineLearningSystem {
  processStream(data: ExecutionData): Promise<void>;
  getCurrentModel(): unknown;
  getAccuracy(): number;
  adaptToDistribution(newData: ExecutionData[]): Promise<void>;
}

// ============================================
// Core Interfaces (as specified in issue)
// ============================================

export interface PatternRecognitionEngine {
  analyzeExecutionPatterns(data: ExecutionData[]): Promise<PatternAnalysis>;
  classifyTaskCompletion(task: TaskResult): TaskCompletionPattern;
  detectCommunicationPatterns(messages: Message[]): CommunicationPattern[];
  identifyResourcePatterns(usage: ResourceUsage[]): ResourcePattern[];
  predictFailures(patterns: FailurePattern[]): FailurePrediction[];
}

export interface LearningCoordinator {
  coordinateLearning(agents: Agent[]): Promise<LearningResult>;
  updateKnowledgeBase(patterns: Pattern[]): Promise<void>;
  trackExpertiseEvolution(agent: string): ExpertiseEvolution;
  emergeBestPractices(successes: SuccessPattern[]): BestPractice[];
  detectAntiPatterns(failures: FailurePattern[]): AntiPattern[];
}

export interface PerformanceOptimizer {
  optimizeBehavior(agent: string, patterns: Pattern[]): BehaviorOptimization;
  optimizeTaskAllocation(tasks: Task[], agents: Agent[]): AllocationStrategy;
  optimizeResourceAllocation(resources: Resource[]): ResourceStrategy;
  improveEfficiency(metrics: PerformanceMetrics): EfficiencyImprovement;
  reduceLatency(bottlenecks: Bottleneck[]): LatencyReduction;
}

// ============================================
// Supporting Types
// ============================================

export type PatternType =
  | 'task_completion'
  | 'communication'
  | 'resource_utilization'
  | 'failure'
  | 'coordination'
  | 'optimization';
export type AnomalyType =
  | 'performance'
  | 'behavior'
  | 'resource'
  | 'failure'
  | 'coordination';
export type LearningType =
  | 'supervised'
  | 'unsupervised'
  | 'reinforcement'
  | 'online'
  | 'transfer';

export interface Pattern {
  id: string;
  type: PatternType;
  data: unknown;
  confidence: number;
  frequency: number;
  context: Record<string, unknown>;
  metadata: PatternMetadata;
  timestamp: number;
}

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  network: number;
  diskIO: number;
  bandwidth: number;
  latency: number;
}

export interface PerformanceMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  resourceUtilization: ResourceMetrics;
  efficiency: number;
  quality: number;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  status: 'completed' | 'failed' | 'timeout' | 'cancelled';
  duration: number;
  quality: number;
  resourceUsage: ResourceMetrics;
  errors?: string[];
  metadata: Record<string, unknown>;
}

export interface TaskCompletionPattern {
  taskType: string;
  averageDuration: number;
  successRate: number;
  qualityScore: number;
  resourceProfile: ResourceMetrics;
  optimalConditions: string[];
  commonFailures: string[];
}

export interface Message {
  id: string;
  from: string;
  to: string;
  type: string;
  payload: unknown;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  latency?: number;
  size?: number;
}

export interface CommunicationPattern {
  source: string;
  target: string;
  messageType: string;
  frequency: number;
  averageLatency: number;
  averageSize: number;
  reliability: number;
  efficiency: number;
}

export interface ResourceUsage {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
  diskIO: number;
  duration: number;
  context: string;
}

export interface ResourcePattern {
  resourceType: 'cpu' | 'memory' | 'network' | 'diskIO';
  usage: ResourceUsageStatistics;
  trends: TrendAnalysis;
  seasonality: SeasonalityPattern;
  anomalies: ResourceAnomaly[];
  optimization: ResourceOptimizationSuggestion[];
}

export interface FailurePattern {
  type: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: string[];
  preconditions: unknown[];
  impacts: string[];
  recoveryTime: number;
  prevention: PreventionStrategy[];
}

export interface FailurePrediction {
  failureType: string;
  probability: number;
  timeToFailure: number; // seconds
  confidence: number;
  affectedComponents: string[];
  preventionActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Agent {
  id: string;
  type: string;
  capabilities: string[];
  currentLoad: number;
  performance: PerformanceMetrics;
  specializations: string[];
  learningProgress: LearningProgress;
}

export interface Task {
  id: string;
  type: string;
  priority: number;
  complexity: number;
  requirements: string[];
  constraints: TaskConstraint[];
  estimatedDuration: number;
  dependencies: string[];
}

export interface Resource {
  id: string;
  type: string;
  capacity: number;
  currentUsage: number;
  availability: number;
  cost: number;
  constraints: ResourceConstraint[];
}

// ============================================
// Additional Supporting Types
// ============================================

export interface PatternMetadata {
  complexity: number;
  predictability: number;
  stability: number;
  anomalyScore: number;
  correlations: PatternCorrelation[];
  quality: number;
  relevance: number;
}

export interface PatternCorrelation {
  patternId: string;
  strength: number;
  type: 'causal' | 'temporal' | 'spatial' | 'behavioral';
  confidence: number;
}

export interface LearningMetadata {
  algorithmUsed: string;
  trainingTime: number;
  dataQuality: number;
  convergence: boolean;
  iterations: number;
  validationScore: number;
}

export interface PerformanceImprovement {
  metric: string;
  baseline: number;
  improved: number;
  improvement: number; // percentage
  confidence: number;
  sustainability: number;
}

export interface KnowledgeUpdate {
  domain: string;
  type: 'new' | 'updated' | 'refined' | 'deprecated';
  knowledge: unknown;
  confidence: number;
  source: string;
  timestamp: number;
}

export interface ExpertiseTimepoint {
  timestamp: number;
  level: number;
  domain: string;
  milestone?: string;
}

export interface OutcomeMetrics {
  efficiency: number;
  quality: number;
  cost: number;
  satisfaction: number;
  sustainability: number;
}

export interface OptimizationAction {
  type: string;
  description: string;
  target: string;
  parameters: Record<string, unknown>;
  expectedImpact: number;
  effort: number;
  risk: number;
}

export interface TaskAllocation {
  taskId: string;
  agentId: string;
  confidence: number;
  expectedDuration: number;
  expectedQuality: number;
  reasoning: string;
}

export interface AllocationConstraint {
  type: string;
  description: string;
  priority: number;
  flexibility: number;
}

export interface ResourceAllocation {
  resourceId: string;
  allocation: number;
  duration: number;
  priority: number;
  efficiency: number;
}

export interface AdaptiveThreshold {
  metric: string;
  currentThreshold: number;
  adaptiveRange: [number, number];
  adaptationRate: number;
  conditions: string[];
}

export interface Bottleneck {
  id: string;
  type: string;
  location: string;
  severity: number;
  impact: number;
  frequency: number;
  causes: string[];
}

export interface LatencyOptimization {
  target: string;
  optimization: string;
  expectedReduction: number;
  implementation: ImplementationStep[];
  monitoring: MonitoringMetric[];
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  timeline: number;
  resources: string[];
  risks: Risk[];
  validation: ValidationStep[];
}

export interface ImplementationStep {
  id: string;
  description: string;
  duration: number;
  dependencies: string[];
  resources: string[];
  validation: string;
}

export interface MonitoringStrategy {
  metrics: MonitoringMetric[];
  frequency: number;
  alerts: AlertConfiguration[];
  dashboards: string[];
}

export interface MonitoringMetric {
  name: string;
  type: string;
  threshold: number;
  alertLevel: 'info' | 'warning' | 'error' | 'critical';
}

export interface TrainingResult {
  accuracy: number;
  loss: number;
  epochs: number;
  trainingTime: number;
  validationScore: number;
  modelSize: number;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusion: number[][];
}

export interface ModelInfo {
  name: string;
  version: string;
  architecture: string;
  parameters: number;
  trainedOn: string;
  lastUpdated: number;
}

export interface EnsemblePrediction {
  prediction: unknown;
  confidence: number;
  modelContributions: Map<string, number>;
  uncertainty: number;
}

export interface SuccessPattern {
  id: string;
  context: string;
  actions: string[];
  outcomes: OutcomeMetrics;
  reproducibility: number;
  conditions: string[];
}

export interface ResourceUsageStatistics {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  percentiles: Map<number, number>;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number;
  confidence: number;
  seasonality: boolean;
  cyclePeriod?: number;
}

export interface SeasonalityPattern {
  detected: boolean;
  period: number;
  amplitude: number;
  phase: number;
  confidence: number;
}

export interface ResourceAnomaly {
  timestamp: number;
  type: string;
  severity: number;
  description: string;
  impact: number;
}

export interface ResourceOptimizationSuggestion {
  type: string;
  description: string;
  expectedSavings: number;
  effort: number;
  risk: number;
  priority: number;
}

export interface PreventionStrategy {
  type: string;
  description: string;
  effectiveness: number;
  cost: number;
  implementation: string[];
}

export interface LearningProgress {
  totalExperience: number;
  domainsLearned: string[];
  currentLearningRate: number;
  knowledgeRetention: number;
  adaptability: number;
}

export interface TaskConstraint {
  type: string;
  value: unknown;
  flexibility: number;
  priority: number;
}

export interface ResourceConstraint {
  type: string;
  limit: number;
  flexibility: number;
  cost: number;
}

export interface Risk {
  id: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface ValidationStep {
  id: string;
  description: string;
  criteria: string[];
  method: string;
  threshold: number;
}

export interface AlertConfiguration {
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
}

// ============================================
// Factory and Utility Types
// ============================================

export interface AdaptiveLearningConfig {
  patternRecognition: {
    enabled: boolean;
    minPatternFrequency: number;
    confidenceThreshold: number;
    analysisWindow: number;
  };
  learning: {
    enabled: boolean;
    learningRate: number;
    adaptationRate: number;
    knowledgeRetention: number;
  };
  optimization: {
    enabled: boolean;
    optimizationThreshold: number;
    maxOptimizations: number;
    validationRequired: boolean;
  };
  ml: {
    neuralNetwork: boolean;
    reinforcementLearning: boolean;
    ensemble: boolean;
    onlineLearning: boolean;
  };
}

export interface SystemContext {
  environment: 'development' | 'staging' | 'production';
  resources: ResourceConstraint[];
  constraints: SystemConstraint[];
  objectives: SystemObjective[];
}

export interface SystemConstraint {
  type: string;
  description: string;
  limit: unknown;
  priority: number;
}

export interface SystemObjective {
  type: string;
  description: string;
  target: number;
  weight: number;
  measurement: string;
}
