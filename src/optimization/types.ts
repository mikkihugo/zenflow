/**
 * @fileoverview Optimization Domain Types - Single Source of Truth
 *
 * All optimization-related types for performance, neural, data, swarm, and WASM optimization.
 * Following Google TypeScript style guide and domain architecture standard.
 */

// Base optimization types
export interface OptimizationConfig {
  readonly enabled: boolean;
  readonly level: 'basic' | 'standard' | 'aggressive';
  readonly target: OptimizationTarget;
  readonly constraints: OptimizationConstraints;
  readonly metrics: readonly string[];
  readonly timeout: number;
}

export type OptimizationTarget =
  | 'performance'
  | 'memory'
  | 'throughput'
  | 'latency'
  | 'accuracy'
  | 'energy'
  | 'cost'
  | 'quality';

export interface OptimizationConstraints {
  readonly maxMemoryUsage?: number;
  readonly maxCpuUsage?: number;
  readonly maxLatency?: number;
  readonly minAccuracy?: number;
  readonly maxCost?: number;
  readonly energyBudget?: number;
}

export interface OptimizationResult {
  readonly success: boolean;
  readonly target: OptimizationTarget;
  readonly improvement: number; // Percentage improvement
  readonly beforeMetrics: OptimizationMetrics;
  readonly afterMetrics: OptimizationMetrics;
  readonly appliedOptimizations: readonly string[];
  readonly duration: number;
  readonly error?: string;
}

export interface OptimizationMetrics {
  readonly performance: {
    readonly throughput: number;
    readonly latency: number;
    readonly responseTime: number;
    readonly cpuUsage: number;
    readonly memoryUsage: number;
  };
  readonly quality: {
    readonly accuracy?: number;
    readonly precision?: number;
    readonly recall?: number;
    readonly errorRate: number;
  };
  readonly resource: {
    readonly energyConsumption: number;
    readonly cost: number;
    readonly efficiency: number;
  };
  readonly timestamp: string;
}

// Data optimization types
export interface DataOptimizationConfig extends OptimizationConfig {
  readonly compressionLevel: 'none' | 'low' | 'medium' | 'high';
  readonly indexingStrategy: 'none' | 'btree' | 'hash' | 'bitmap' | 'vector';
  readonly cachingPolicy: 'lru' | 'lfu' | 'fifo' | 'adaptive';
  readonly partitioning: DataPartitioningConfig;
  readonly deduplication: boolean;
}

export interface DataPartitioningConfig {
  readonly enabled: boolean;
  readonly strategy: 'range' | 'hash' | 'list' | 'composite';
  readonly partitionSize: number;
  readonly partitionCount: number;
  readonly rebalanceThreshold: number;
}

export interface DataOptimizationResult extends OptimizationResult {
  readonly dataMetrics: {
    readonly originalSize: number;
    readonly optimizedSize: number;
    readonly compressionRatio: number;
    readonly indexSize: number;
    readonly cacheHitRate: number;
  };
}

// Neural optimization types
export interface NeuralOptimizationConfig extends OptimizationConfig {
  readonly pruning: PruningConfig;
  readonly quantization: QuantizationConfig;
  readonly distillation: DistillationConfig;
  readonly architecture: ArchitectureOptimizationConfig;
  readonly hyperparameter: HyperparameterOptimizationConfig;
}

export interface PruningConfig {
  readonly enabled: boolean;
  readonly strategy: 'magnitude' | 'structured' | 'unstructured' | 'lottery_ticket';
  readonly sparsityLevel: number;
  readonly gradual: boolean;
  readonly fineTuneEpochs: number;
}

export interface QuantizationConfig {
  readonly enabled: boolean;
  readonly precision: 8 | 16 | 32;
  readonly method: 'static' | 'dynamic' | 'qat';
  readonly calibrationDataset?: string;
  readonly preserveAccuracy: boolean;
}

export interface DistillationConfig {
  readonly enabled: boolean;
  readonly teacherModel: string;
  readonly temperature: number;
  readonly alpha: number;
  readonly transferMethod: 'knowledge' | 'feature' | 'attention';
}

export interface ArchitectureOptimizationConfig {
  readonly enabled: boolean;
  readonly searchMethod: 'random' | 'evolutionary' | 'reinforcement' | 'differentiable';
  readonly searchSpace: ArchitectureSearchSpace;
  readonly evaluationBudget: number;
  readonly earlyStoppingPatience: number;
}

export interface ArchitectureSearchSpace {
  readonly layers: {
    readonly types: readonly string[];
    readonly minCount: number;
    readonly maxCount: number;
  };
  readonly connections: {
    readonly skipConnections: boolean;
    readonly denseConnections: boolean;
    readonly residualConnections: boolean;
  };
  readonly hyperparameters: {
    readonly learningRateRange: readonly [number, number];
    readonly batchSizeOptions: readonly number[];
    readonly dropoutRange: readonly [number, number];
  };
}

export interface HyperparameterOptimizationConfig {
  readonly enabled: boolean;
  readonly method: 'grid' | 'random' | 'bayesian' | 'tpe' | 'optuna';
  readonly searchSpace: HyperparameterSearchSpace;
  readonly maxTrials: number;
  readonly pruner?: {
    readonly type: 'median' | 'successive_halving';
    readonly config: Record<string, unknown>;
  };
}

export interface HyperparameterSearchSpace {
  readonly learningRate: {
    readonly type: 'float';
    readonly low: number;
    readonly high: number;
    readonly log: boolean;
  };
  readonly batchSize: {
    readonly type: 'categorical';
    readonly choices: readonly number[];
  };
  readonly optimizer: {
    readonly type: 'categorical';
    readonly choices: readonly string[];
  };
  readonly [key: string]: {
    readonly type: 'float' | 'int' | 'categorical';
    readonly low?: number;
    readonly high?: number;
    readonly choices?: readonly unknown[];
    readonly log?: boolean;
  };
}

export interface NeuralOptimizationResult extends OptimizationResult {
  readonly modelMetrics: {
    readonly originalSize: number;
    readonly optimizedSize: number;
    readonly compressionRatio: number;
    readonly accuracyLoss: number;
    readonly speedupFactor: number;
    readonly memoryReduction: number;
  };
  readonly bestHyperparameters?: Record<string, unknown>;
  readonly architectureChanges?: readonly string[];
}

// Swarm optimization types
export interface SwarmOptimizationConfig extends OptimizationConfig {
  readonly topology: SwarmTopologyOptimization;
  readonly communication: SwarmCommunicationOptimization;
  readonly taskDistribution: TaskDistributionOptimization;
  readonly loadBalancing: LoadBalancingOptimization;
  readonly faultTolerance: FaultToleranceOptimization;
}

export interface SwarmTopologyOptimization {
  readonly enabled: boolean;
  readonly adaptiveTopology: boolean;
  readonly topologyTypes: readonly ('mesh' | 'ring' | 'star' | 'hierarchical')[];
  readonly switchingThreshold: number;
  readonly evaluationPeriod: number;
}

export interface SwarmCommunicationOptimization {
  readonly enabled: boolean;
  readonly protocol: 'gossip' | 'broadcast' | 'multicast' | 'p2p';
  readonly compressionEnabled: boolean;
  readonly batchingEnabled: boolean;
  readonly prioritization: boolean;
  readonly maxLatency: number;
}

export interface TaskDistributionOptimization {
  readonly enabled: boolean;
  readonly algorithm: 'round_robin' | 'least_loaded' | 'capability_based' | 'ml_based';
  readonly workloadPrediction: boolean;
  readonly dynamicRebalancing: boolean;
  readonly queueManagement: 'fifo' | 'priority' | 'deadline';
}

export interface LoadBalancingOptimization {
  readonly enabled: boolean;
  readonly strategy: 'reactive' | 'proactive' | 'predictive';
  readonly migrationThreshold: number;
  readonly migrationCost: number;
  readonly considerLocation: boolean;
}

export interface FaultToleranceOptimization {
  readonly enabled: boolean;
  readonly replicationFactor: number;
  readonly checkpointFrequency: number;
  readonly recoveryStrategy: 'restart' | 'checkpoint' | 'rollback';
  readonly healthCheckInterval: number;
}

export interface SwarmOptimizationResult extends OptimizationResult {
  readonly swarmMetrics: {
    readonly throughput: number;
    readonly latency: number;
    readonly utilizationRate: number;
    readonly faultRate: number;
    readonly communicationOverhead: number;
    readonly energyEfficiency: number;
  };
  readonly topologyChanges?: readonly string[];
  readonly agentReassignments?: number;
}

// WASM optimization types
export interface WASMOptimizationConfig extends OptimizationConfig {
  readonly compilation: WASMCompilationOptimization;
  readonly runtime: WASMRuntimeOptimization;
  readonly memory: WASMMemoryOptimization;
  readonly simd: WASMSIMDOptimization;
  readonly threading: WASMThreadingOptimization;
}

export interface WASMCompilationOptimization {
  readonly enabled: boolean;
  readonly optimizationLevel: 'O0' | 'O1' | 'O2' | 'O3' | 'Os' | 'Oz';
  readonly lto: boolean; // Link Time Optimization
  readonly deadCodeElimination: boolean;
  readonly functionInlining: boolean;
  readonly loopUnrolling: boolean;
}

export interface WASMRuntimeOptimization {
  readonly enabled: boolean;
  readonly instantiationCaching: boolean;
  readonly precompilation: boolean;
  readonly streamingCompilation: boolean;
  readonly backgroundCompilation: boolean;
}

export interface WASMMemoryOptimization {
  readonly enabled: boolean;
  readonly initialMemorySize: number;
  readonly maximumMemorySize: number;
  readonly sharedMemory: boolean;
  readonly memoryGrowth: 'static' | 'dynamic';
  readonly garbageCollection: boolean;
}

export interface WASMSIMDOptimization {
  readonly enabled: boolean;
  readonly supportedInstructions: readonly string[];
  readonly vectorization: boolean;
  readonly parallelProcessing: boolean;
}

export interface WASMThreadingOptimization {
  readonly enabled: boolean;
  readonly workerThreads: number;
  readonly sharedArrayBuffer: boolean;
  readonly atomicOperations: boolean;
  readonly workStealingScheduler: boolean;
}

export interface WASMOptimizationResult extends OptimizationResult {
  readonly wasmMetrics: {
    readonly binarySize: number;
    readonly instantiationTime: number;
    readonly executionSpeed: number;
    readonly memoryUsage: number;
    readonly startupTime: number;
  };
  readonly featureSupport: {
    readonly simd: boolean;
    readonly threading: boolean;
    readonly exceptions: boolean;
    readonly gc: boolean;
  };
}

// Optimization strategy types
export interface OptimizationStrategy {
  readonly name: string;
  readonly description: string;
  readonly applicableTo: readonly OptimizationTarget[];
  readonly complexity: 'low' | 'medium' | 'high';
  readonly effectiveness: number;
  readonly cost: number;
  readonly riskLevel: 'low' | 'medium' | 'high';
  readonly prerequisites: readonly string[];
  readonly conflicts: readonly string[];
}

export interface OptimizationPlan {
  readonly id: string;
  readonly target: OptimizationTarget;
  readonly strategies: readonly OptimizationStrategy[];
  readonly estimatedImprovement: number;
  readonly estimatedCost: number;
  readonly estimatedDuration: number;
  readonly riskAssessment: RiskAssessment;
  readonly dependencies: readonly string[];
}

export interface RiskAssessment {
  readonly overallRisk: 'low' | 'medium' | 'high';
  readonly risks: readonly {
    readonly type: string;
    readonly probability: number;
    readonly impact: number;
    readonly mitigation: string;
  }[];
}

// Optimization monitoring and analytics
export interface OptimizationAnalytics {
  readonly totalOptimizations: number;
  readonly successfulOptimizations: number;
  readonly averageImprovement: number;
  readonly optimizationsByType: Record<OptimizationTarget, number>;
  readonly resourceSavings: {
    readonly cpu: number;
    readonly memory: number;
    readonly energy: number;
    readonly cost: number;
  };
  readonly timeline: readonly {
    readonly timestamp: string;
    readonly optimizations: number;
    readonly improvement: number;
  }[];
}

export interface OptimizationRecommendation {
  readonly id: string;
  readonly target: OptimizationTarget;
  readonly strategy: OptimizationStrategy;
  readonly expectedImprovement: number;
  readonly confidence: number;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly reasoning: string;
  readonly prerequisites: readonly string[];
  readonly estimatedEffort: number;
}

// Error types
export class OptimizationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly target?: OptimizationTarget
  ) {
    super(message);
    this.name = 'OptimizationError';
  }
}

export class OptimizationConfigError extends OptimizationError {
  constructor(
    message: string,
    public readonly config?: Partial<OptimizationConfig>
  ) {
    super(message, 'OPTIMIZATION_CONFIG_ERROR');
    this.name = 'OptimizationConfigError';
  }
}

export class OptimizationTimeoutError extends OptimizationError {
  constructor(
    message: string,
    public readonly timeout?: number
  ) {
    super(message, 'OPTIMIZATION_TIMEOUT_ERROR');
    this.name = 'OptimizationTimeoutError';
  }
}

// Event types
export interface OptimizationEvent {
  readonly type:
    | 'optimization_started'
    | 'optimization_completed'
    | 'optimization_failed'
    | 'strategy_applied'
    | 'metrics_updated'
    | 'recommendation_generated';
  readonly target?: OptimizationTarget;
  readonly strategy?: string;
  readonly improvement?: number;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}

// Utility types
export type OptimizationId = string;
export type StrategyId = string;
export type RecommendationId = string;

// Performance baseline types
export interface PerformanceBaseline {
  readonly id: string;
  readonly name: string;
  readonly metrics: OptimizationMetrics;
  readonly environment: {
    readonly hardware: Record<string, unknown>;
    readonly software: Record<string, unknown>;
    readonly configuration: Record<string, unknown>;
  };
  readonly timestamp: string;
  readonly version: string;
}

export interface PerformanceComparison {
  readonly baseline: PerformanceBaseline;
  readonly current: OptimizationMetrics;
  readonly improvements: Record<string, number>;
  readonly regressions: Record<string, number>;
  readonly overallScore: number;
}
