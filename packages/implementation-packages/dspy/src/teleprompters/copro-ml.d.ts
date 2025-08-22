/**
 * @fileoverview COPROML - ML-Enhanced Compositional Prefix Optimization
 *
 * Advanced ML-enhanced version of COPRO teleprompter using battle-tested
 * Rust crates (smartcore, linfa, argmin, statrs) and npm packages for
 * sophisticated Bayesian optimization, online learning with concept drift
 * detection, and adaptive feedback analysis.
 *
 * Key ML Enhancements:
 * - Bayesian optimization with acquisition function selection
 * - Online learning with concept drift detection (Page-Hinkley, ADWIN)
 * - Adaptive learning rate scheduling based on performance
 * - Real-time feedback analysis and pattern recognition
 * - Statistical significance testing for prefix effectiveness
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { Teleprompter } from './teleprompter';
import { DSPyModule } from '../primitives/module';
import type {
  OptimizationResult,
  ConceptDriftDetection,
  Pattern,
} from '@claude-zen/neural-ml';
export interface COPROMLConfig {
  maxIterations: number;
  batchSize: number;
  learningRate: number;
  convergenceThreshold: number;
  useBayesianOptimization: boolean;
  useOnlineLearning: boolean;
  useDriftDetection: boolean;
  useAdaptiveLearning: boolean;
  useFeedbackAnalysis: boolean;
  acquisitionFunction:|'expected_improvement|upper_confidence_bound|probability_improvement|entropy_search';
  initialExplorationBudget: number;
  exploitationThreshold: number;
  onlineLearningAlgorithm:|'perceptron|passive_aggressive|sgd_classifier';
  adaptiveLearningRate: boolean;
  forgettingFactor: number;
  driftDetectionMethod: 'page_hinkley|adwin|kswin|ddm';
  driftSensitivity: number;
  minDriftSamples: number;
  feedbackWindowSize: number;
  feedbackAggregationMethod:|'exponential_smoothing|sliding_window|weighted_average';
  qualityGates: {
    minAccuracy: number;
    maxLatency: number;
    minConfidence: number;
  };
  timeoutMs: number;
  memoryLimitMb: number;
  maxConcurrentEvaluations: number;
}
export interface COPROMLResult {
  optimizedModule: DSPyModule;
  finalAccuracy: number;
  convergenceRate: number;
  totalIterations: number;
  adaptationEvents: number;
  bayesianResults?: OptimizationResult;
  driftDetections: ConceptDriftDetection[];
  learningCurve: Array<{
    iteration: number;
    accuracy: number;
    learningRate: number;
  }>;
  detectedPatterns: Pattern[];
  feedbackQuality: {
    averageConfidence: number;
    feedbackLatency: number;
    qualityScore: number;
  };
  onlineLearningStats: {
    totalUpdates: number;
    driftsDetected: number;
    adaptationRate: number;
    finalLearningRate: number;
  };
  optimizationHistory: Array<{
    iteration: number;
    prefix: string;
    accuracy: number;
    confidence: number;
    learningRate: number;
    driftScore: number;
    timestamp: Date;
  }>;
  recommendations: string[];
  adaptationInsights: string[];
  totalOptimizationTime: number;
  memoryUsage: number;
  evaluationEfficiency: number;
}
/**
 * COPROML - Advanced ML-Enhanced Compositional Prefix Optimization
 *
 * This teleprompter extends COPRO with sophisticated online learning, concept drift
 * detection, and adaptive feedback processing using battle-tested ML libraries.
 */
export declare class COPROML extends Teleprompter {
  private eventEmitter;
  private logger;
  private config;
  private initialized;
  private mlEngine?;
  private bayesianOptimizer?;
  private onlineLearner?;
  private patternLearner?;
  private statisticalAnalyzer?;
  private optimizationHistory;
  private feedbackBuffer;
  private currentIteration;
  private driftDetections;
  private adaptationEvents;
  private startTime?;
  private currentLearningRate;
  private explorationBudget;
  constructor(config?: Partial<COPROMLConfig>);
  /**
   * Initialize ML components with battle-tested libraries
   */
  initialize(): Promise<void>;
  /**
   * Emit events through internal EventEmitter
   */
  private emit;
  /**
   * Compile the module with base interface compatibility
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
  compileML(student: DSPyModule, options?: any): Promise<COPROMLResult>;
  /**
   * Initial Bayesian exploration for prefix candidates
   */
  private performInitialBayesianExploration;
  /**
   * Online learning optimization with concept drift detection
   */
  private performOnlineLearningOptimization;
  /**
   * Analyze feedback patterns using clustering and temporal analysis
   */
  private analyzeFeedbackPatterns;
  /**
   * Statistical validation of learning effectiveness
   */
  private validateLearningEffectiveness;
  private checkForConceptDrift;
  private handleConceptDrift;
  private adaptLearningRate;
  private paramsToConfig;
  private extractCurrentStateFeatures;
  private getCurrentConfiguration;
  private generatePrefixFromConfig;
  private evaluatePrefixConfiguration;
  private getBestAccuracy;
  private getRecentAverageAccuracy;
  private updateFeedbackBuffer;
  private processFeedbackBuffer;
  private processExponentialSmoothing;
  private processSlidingWindow;
  private processWeightedAverage;
  private triggerQualityGateResponse;
  private getFeedbackAge;
  private generateInitialPoints;
  private calculateConvergenceRate;
  private generateLearningCurve;
  private getBayesianResults;
  private analyzeFeedbackQuality;
  private generateRecommendations;
  private generateAdaptationInsights;
  private createOptimizedModule;
  private evaluateFinalPerformance;
  private getCurrentMemoryUsage;
  private calculateEvaluationEfficiency;
  private calculateSimpleCorrelation;
}
/**
 * Factory function to create COPROML with sensible defaults
 */
export declare function createCOPROML(config?: Partial<COPROMLConfig>): COPROML;
//# sourceMappingURL=copro-ml.d.ts.map
