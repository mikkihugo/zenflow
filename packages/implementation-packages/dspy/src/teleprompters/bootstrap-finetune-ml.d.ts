/**
 * @fileoverview BootstrapFinetuneML - ML-Enhanced Hyperparameter Optimization
 *
 * Advanced ML-enhanced version of Bootstrap Finetune teleprompter using battle-tested
 * Rust crates (smartcore, linfa, argmin, statrs) and npm packages for
 * intelligent hyperparameter optimization, Bayesian tuning, and adaptive learning rates.
 *
 * Key ML Enhancements:
 * - Bayesian hyperparameter optimization with Gaussian processes
 * - Multi-objective optimization (accuracy vs efficiency vs robustness)
 * - Adaptive learning rate scheduling based on performance
 * - Automated architecture search and configuration tuning
 * - Statistical significance testing for hyperparameter effectiveness
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { Teleprompter } from './teleprompter';
import { DSPyModule } from '../primitives/module';
import type { HypothesisTest } from '@claude-zen/neural-ml';
export interface BootstrapFinetuneMLConfig {
  maxCandidates: number;
  numBootstrapRounds: number;
  numFinetuneSteps: number;
  learningRate: number;
  batchSize: number;
  useBayesianOptimization: boolean;
  useMultiObjectiveOptimization: boolean;
  useAdaptiveLearningRate: boolean;
  useArchitectureSearch: boolean;
  useStatisticalValidation: boolean;
  bayesianConfig: {
    acquisitionFunction:|'expected_improvement|upper_confidence_bound|probability_improvement';
    kernelType: 'rbf|matern|linear';
    explorationRate: number;
    noiseLevel: number;
    maxIterations: number;
  };
  multiObjectiveConfig: {
    objectives: Array<'accuracy|speed|memory|robustness'>;
    scalarizationMethod:|'weighted_sum|tchebycheff|augmented_tchebycheff';
    weights: number[];
    paretoFrontSize: number;
  };
  adaptiveLearningConfig: {
    initialLearningRate: number;
    decayStrategy: 'exponential|polynomial|cosine|adaptive';
    decayRate: number;
    minLearningRate: number;
    patience: number;
    improvementThreshold: number;
  };
  architectureSearchConfig: {
    searchSpace: {
      hiddenSizes: number[];
      activationFunctions: string[];
      dropoutRates: number[];
      optimizerTypes: string[];
    };
    searchStrategy: 'grid|random|bayesian|evolutionary';
    maxArchitectures: number;
    evaluationMetric: string;
  };
  statisticalConfig: {
    significanceLevel: number;
    confidenceLevel: number;
    bootstrapSamples: number;
    crossValidationFolds: number;
    bonferroniCorrection: boolean;
  };
  parallelEvaluation: boolean;
  useEarlyStopping: boolean;
  checkpointInterval: number;
  enableProfiling: boolean;
  metaLearning: {
    enabled: boolean;
    warmStartIterations: number;
    transferLearning: boolean;
    priorKnowledge: boolean;
  };
}
export interface BootstrapFinetuneMLResult {
  optimizedModule: DSPyModule;
  bestHyperparameters: Record<string, any>;
  optimizationHistory: Array<{
    iteration: number;
    hyperparameters: Record<string, any>;
    performance: number;
    objectives: Record<string, number>;
    timestamp: number;
  }>;
  finalPerformance: number;
  paretoFront?: {
    solutions: Array<{
      hyperparameters: Record<string, any>;
      objectives: Record<string, number>;
      dominanceRank: number;
    }>;
    hypervolume: number;
    spacing: number;
    spread: number;
  };
  learningRateAnalysis: {
    initialRate: number;
    finalRate: number;
    optimalRate: number;
    convergencePoint: number;
    adaptationHistory: number[];
  };
  architectureAnalysis: {
    bestArchitecture: Record<string, any>;
    architectureRanking: Array<{
      architecture: Record<string, any>;
      score: number;
      rank: number;
    }>;
    designPrinciples: string[];
  };
  statisticalValidation: {
    significanceTests: HypothesisTest[];
    confidenceIntervals: Record<string, [number, number]>;
    effectSizes: Record<string, number>;
    pValues: Record<string, number>;
    correctedPValues: Record<string, number>;
  };
  optimizationMetrics: {
    totalIterations: number;
    convergenceIteration: number;
    explorationEfficiency: number;
    exploitationBalance: number;
    hyperparameterSensitivity: Record<string, number>;
  };
  executionTime: number;
  memoryPeakUsage: number;
  cpuUtilization: number;
  cacheEfficiency: number;
}
/**
 * BootstrapFinetuneML - ML-Enhanced Hyperparameter Optimization
 *
 * Provides intelligent hyperparameter optimization using advanced ML techniques
 * for more effective model fine-tuning and performance optimization.
 */
export declare class BootstrapFinetuneML extends Teleprompter {
  private config;
  private logger;
  private eventEmitter;
  private mlEngine;
  private bayesianOptimizer;
  private multiObjectiveOptimizer;
  private gradientOptimizer;
  private statisticalAnalyzer;
  private optimizationHistory;
  private bestConfiguration;
  private bestPerformance;
  private currentLearningRate;
  private learningRateHistory;
  private architectureCache;
  constructor(config?: Partial<BootstrapFinetuneMLConfig>);
  /**
   * Emit events through internal EventEmitter
   */
  private emit;
  /**
   * Initialize ML components with lazy loading
   */
  private initializeMLComponents;
  /**
   * Compile the module with ML-enhanced hyperparameter optimization (base interface)
   */
  compile(
    student: DSPyModule,
    config: {
      trainset: any[];
      teacher?: DSPyModule | null;
      valset?: any[] | null;
      [key: string]: any;
    }
  ): Promise<DSPyModule>;
  /**
   * ML-enhanced compilation with detailed results
   */
  compileML(
    student: DSPyModule,
    teacher?: DSPyModule,
    trainset?: any[],
    valset?: any[]
  ): Promise<BootstrapFinetuneMLResult>;
  /**
   * Bayesian hyperparameter optimization
   */
  private optimizeHyperparametersBayesian;
  /**
   * Multi-objective optimization
   */
  private optimizeMultiObjective;
  /**
   * Fine-tuning with adaptive learning rate
   */
  private finetune;
  /**
   * Helper methods for optimization
   */
  private getHyperparameterDimensions;
  private getHyperparameterBounds;
  private convertVectorToHyperparameters;
  private sampleHyperparameters;
  private configureModule;
  private trainModule;
  private evaluateModule;
  private calculateObjectives;
  private calculateObjectiveVector;
  private shouldStopEarly;
  private updateLearningRate;
  private selectBestFromParetoFront;
  private performFinetuneStep;
  private performArchitectureSearch;
  private performStatisticalValidation;
  private getEmptyStatisticalValidation;
  private saveCheckpoint;
  private generateResults;
}
/**
 * Factory function to create BootstrapFinetuneML teleprompter
 */
export declare function createBootstrapFinetuneML(
  config?: Partial<BootstrapFinetuneMLConfig>
): BootstrapFinetuneML;
//# sourceMappingURL=bootstrap-finetune-ml.d.ts.map
