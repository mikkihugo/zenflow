/**
 * @fileoverview ML Integration Interfaces for DSPy Teleprompter Optimization
 * 
 * Provides TypeScript interfaces for battle-tested ML capabilities using
 * Rust crates (smartcore, linfa, argmin) and npm packages for advanced
 * DSPy teleprompter optimization.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.1
 */

import type { Logger } from '@claude-zen/foundation';

// ===== CORE ML TYPES =====

export interface MLVector extends Float32Array {}
export interface MLMatrix extends Float32Array {}

export interface MLPoint {
  features: MLVector;
  target?: number;
  metadata?: Record<string, any>;
}

export interface MLDataset {
  points: MLPoint[];
  featureNames?: string[];
  targetName?: string;
}

// ===== BAYESIAN OPTIMIZATION =====

export interface BayesianOptimizerConfig {
  acquisitionFunction: 'expected_improvement' | 'upper_confidence_bound' | 'probability_improvement';
  kernelType: 'rbf' | 'matern' | 'linear';
  explorationWeight?: number;
  maxIterations?: number;
  convergenceThreshold?: number;
}

export interface OptimizationBounds {
  lower: number[];
  upper: number[];
}

export interface OptimizationResult {
  bestParams: number[];
  bestScore: number;
  iterations: number;
  convergence: boolean;
  evaluationHistory: Array<{
    params: number[];
    score: number;
    acquisition: number;
  }>;
}

export interface BayesianOptimizer {
  /**
   * Initialize Bayesian optimizer with configuration
   */
  configure(config: BayesianOptimizerConfig): Promise<void>;

  /**
   * Optimize objective function using Gaussian Process
   */
  optimize(
    objective: (params: number[]) => Promise<number>,
    bounds: OptimizationBounds,
    initialPoints?: number[][]
  ): Promise<OptimizationResult>;

  /**
   * Update observations and retrain GP model
   */
  updateObservations(observations: Array<{ params: number[]; score: number }>): Promise<void>;

  /**
   * Predict mean and variance for parameter set
   */
  predict(params: number[]): Promise<{ mean: number; variance: number }>;

  /**
   * Get next suggested parameters based on acquisition function
   */
  suggest(bounds: OptimizationBounds): Promise<number[]>;
}

// ===== GRADIENT OPTIMIZATION =====

export interface GradientOptimizerConfig {
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'lbfgs';
  learningRate: number;
  momentum?: number;
  beta1?: number;
  beta2?: number;
  epsilon?: number;
  maxIterations?: number;
}

export interface GradientResult {
  gradients: MLVector;
  loss: number;
  converged: boolean;
}

export interface OptimizedParameters {
  params: MLVector;
  finalLoss: number;
  iterations: number;
  convergence: boolean;
  gradientHistory: MLVector[];
}

export interface GradientOptimizer {
  /**
   * Configure gradient-based optimizer
   */
  configure(config: GradientOptimizerConfig): Promise<void>;

  /**
   * Compute gradients for loss function
   */
  computeGradients(
    lossFunction: (params: MLVector) => Promise<number>,
    params: MLVector,
    epsilon?: number
  ): Promise<GradientResult>;

  /**
   * Optimize parameters using gradient descent
   */
  optimize(
    lossFunction: (params: MLVector) => Promise<number>,
    initialParams: MLVector
  ): Promise<OptimizedParameters>;

  /**
   * Single optimization step
   */
  step(
    gradients: MLVector,
    currentParams: MLVector
  ): Promise<MLVector>;
}

// ===== MULTI-OBJECTIVE OPTIMIZATION =====

export interface MultiObjectiveConfig {
  populationSize?: number;
  generations?: number;
  crossoverRate?: number;
  mutationRate?: number;
  eliteSize?: number;
}

export interface ParetoSolution {
  params: number[];
  objectives: number[];
  rank: number;
  crowdingDistance: number;
  dominatedCount: number;
}

export interface ParetoFront {
  solutions: ParetoSolution[];
  hypervolume: number;
  convergence: boolean;
  generations: number;
}

export interface MultiObjectiveOptimizer {
  /**
   * Configure NSGA-II multi-objective optimizer
   */
  configure(config: MultiObjectiveConfig): Promise<void>;

  /**
   * Optimize multiple objectives simultaneously
   */
  optimize(
    objectives: Array<(params: number[]) => Promise<number>>,
    bounds: OptimizationBounds,
    initialPopulation?: number[][]
  ): Promise<ParetoFront>;

  /**
   * Check if solution A dominates solution B
   */
  dominates(solutionA: number[], solutionB: number[]): boolean;

  /**
   * Calculate crowding distance for diversity preservation
   */
  calculateCrowdingDistance(solutions: ParetoSolution[]): Promise<void>;

  /**
   * Select next generation using NSGA-II selection
   */
  selectNextGeneration(
    population: ParetoSolution[],
    populationSize: number
  ): Promise<ParetoSolution[]>;
}

// ===== PATTERN LEARNING =====

export interface PatternConfig {
  clusteringAlgorithm: 'kmeans' | 'dbscan' | 'gaussian_mixture';
  numClusters?: number;
  epsilon?: number;
  minSamples?: number;
  distanceMetric: 'euclidean' | 'cosine' | 'manhattan';
}

export interface Pattern {
  id: string;
  centroid: MLVector;
  examples: string[];
  frequency: number;
  quality: number;
  metadata: Record<string, any>;
}

export interface PatternPrediction {
  patternId: string;
  similarity: number;
  confidence: number;
  suggestedModifications?: string[];
}

export interface PatternLearner {
  /**
   * Configure pattern learning algorithm
   */
  configure(config: PatternConfig): Promise<void>;

  /**
   * Train pattern recognition model from examples
   */
  trainPatterns(examples: Array<{
    text: string;
    embedding: MLVector;
    success: boolean;
    metadata?: Record<string, any>;
  }>): Promise<Pattern[]>;

  /**
   * Predict pattern and quality for new input
   */
  predictPattern(
    text: string,
    embedding: MLVector
  ): Promise<PatternPrediction>;

  /**
   * Update patterns with new feedback
   */
  updatePatterns(feedback: Array<{
    patternId: string;
    text: string;
    success: boolean;
  }>): Promise<void>;

  /**
   * Get most successful patterns
   */
  getBestPatterns(limit?: number): Promise<Pattern[]>;

  /**
   * Calculate similarity between two embeddings
   */
  calculateSimilarity(
    embedding1: MLVector,
    embedding2: MLVector,
    metric: 'cosine' | 'euclidean' | 'manhattan'
  ): Promise<number>;
}

// ===== STATISTICAL ANALYSIS =====

export interface StatisticalResult {
  mean: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  median: number;
  quartiles: [number, number, number];
  confidence95: [number, number];
}

export interface RegressionResult {
  coefficients: number[];
  intercept: number;
  rSquared: number;
  adjustedRSquared: number;
  standardError: number;
  pValues: number[];
  confidenceIntervals: Array<[number, number]>;
}

export interface HypothesisTest {
  statistic: number;
  pValue: number;
  critical: number;
  significant: boolean;
  effectSize?: number;
}

export interface StatisticalAnalyzer {
  /**
   * Calculate comprehensive descriptive statistics
   */
  descriptiveStats(data: number[]): Promise<StatisticalResult>;

  /**
   * Perform linear regression analysis
   */
  linearRegression(
    features: MLMatrix,
    targets: number[]
  ): Promise<RegressionResult>;

  /**
   * Perform polynomial regression
   */
  polynomialRegression(
    x: number[],
    y: number[],
    degree: number
  ): Promise<RegressionResult>;

  /**
   * T-test for comparing means
   */
  tTest(
    sample1: number[],
    sample2?: number[],
    expectedMean?: number
  ): Promise<HypothesisTest>;

  /**
   * ANOVA for comparing multiple groups
   */
  anova(groups: number[][]): Promise<HypothesisTest>;

  /**
   * Calculate correlation coefficients
   */
  correlation(
    x: number[],
    y: number[],
    method: 'pearson' | 'spearman' | 'kendall'
  ): Promise<{ correlation: number; pValue: number }>;

  /**
   * Time series analysis with trend detection
   */
  timeSeriesAnalysis(data: Array<{
    timestamp: Date;
    value: number;
  }>): Promise<{
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonality: boolean;
    forecast: number[];
    confidence: [number[], number[]];
  }>;
}

// ===== ONLINE LEARNING =====

export interface OnlineLearnerConfig {
  algorithm: 'perceptron' | 'passive_aggressive' | 'sgd_classifier';
  learningRate: number;
  regularization?: number;
  adaptiveLearningRate?: boolean;
  forgettingFactor?: number;
}

export interface ConceptDriftDetection {
  driftDetected: boolean;
  driftStrength: number;
  changePoint?: number;
  confidence: number;
}

export interface OnlineLearner {
  /**
   * Configure online learning algorithm
   */
  configure(config: OnlineLearnerConfig): Promise<void>;

  /**
   * Update model with new observation
   */
  update(features: MLVector, target: number): Promise<void>;

  /**
   * Predict with current model
   */
  predict(features: MLVector): Promise<number>;

  /**
   * Detect concept drift in data stream
   */
  detectDrift(
    recentPredictions: number[],
    recentTargets: number[]
  ): Promise<ConceptDriftDetection>;

  /**
   * Adapt learning rate based on performance
   */
  adaptLearningRate(accuracy: number): Promise<void>;

  /**
   * Reset model (partial or complete)
   */
  reset(keepHistory?: boolean): Promise<void>;
}

// ===== MAIN ML ENGINE INTERFACE =====

export interface MLEngineConfig {
  backend: 'rust' | 'javascript' | 'hybrid';
  enableGPU?: boolean;
  maxConcurrency?: number;
  cacheSize?: number;
}

/**
 * Main ML Engine that provides all optimization capabilities for DSPy teleprompters
 */
export interface MLEngine {
  // Core components
  bayesianOptimizer: BayesianOptimizer;
  gradientOptimizer: GradientOptimizer;
  multiObjectiveOptimizer: MultiObjectiveOptimizer;
  patternLearner: PatternLearner;
  statisticalAnalyzer: StatisticalAnalyzer;
  onlineLearner: OnlineLearner;

  /**
   * Initialize ML engine with configuration
   */
  initialize(config: MLEngineConfig, logger: Logger): Promise<void>;

  /**
   * Health check for all ML components
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    performance: Record<string, number>;
  }>;

  /**
   * Get ML engine statistics
   */
  getStats(): Promise<{
    totalOperations: number;
    averageLatency: number;
    memoryUsage: number;
    cacheHitRate: number;
  }>;

  /**
   * Shutdown ML engine and cleanup resources
   */
  shutdown(): Promise<void>;
}