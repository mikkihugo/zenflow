/**
 * @fileoverview GRPOML - ML-Enhanced Gradient-based Reward Policy Optimization
 *
 * Advanced ML-enhanced version of GRPO teleprompter using battle-tested
 * Rust crates (smartcore, linfa, argmin, statrs) and sophisticated
 * reinforcement learning with policy gradient optimization.
 *
 * Key ML Enhancements:
 * - Policy gradient optimization with natural gradients and trust regions
 * - Reward shaping and advantage estimation using Generalized Advantage Estimation (GAE)
 * - Experience replay buffer with prioritized sampling
 * - Multi-armed bandit optimization for exploration-exploitation balance
 * - Statistical significance testing for policy improvement validation
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { Teleprompter } from './teleprompter';
import { DSPyModule } from '../primitives/module';
interface PolicyUpdateResult {
  policyLoss: number;
  valueLoss: number;
  entropyBonus: number;
  klDivergence: number;
  gradientNorm: number;
  trustRegionViolation: boolean;
}
interface HypothesisTest {
  statistic: number;
  pValue: number;
  critical: number;
  significant: boolean;
  effectSize: number;
}
interface StatisticalResult {
  mean: number;
  std: number;
  min: number;
  max: number;
  confidence: number;
}
export interface GRPOMLConfig {
  maxEpisodes: number;
  maxStepsPerEpisode: number;
  gamma: number;
  lambda: number;
  usePolicyGradient: boolean;
  useNaturalGradients: boolean;
  useTrustRegion: boolean;
  useAdvantageEstimation: boolean;
  policyLearningRate: number;
  valueLearningRate: number;
  entropyCoefficient: number;
  klDivergenceLimit: number;
  gradientClipNorm: number;
  trustRegionDelta: number;
  adaptiveTrustRegion: boolean;
  backtrackingSteps: number;
  useExperienceReplay: boolean;
  bufferSize: number;
  batchSize: number;
  prioritizedReplay: boolean;
  priorityAlpha: number;
  priorityBeta: number;
  useRewardShaping: boolean;
  rewardShapingMethod: 'potential_based | human_feedback' | 'curriculum';
  baselineRewardWeight: number;
  explorationBonus: number;
  useMultiArmedBandit: boolean;
  banditAlgorithm: 'ucb1 | thompson_sampling' | 'epsilon_greedy';
  explorationRate: number;
  decayRate: number;
  significanceLevel: number;
  minSampleSize: number;
  statisticalTests: Array<'t_test | mann_whitney_u' | 'wilcoxon'>;
  timeoutMs: number;
  memoryLimitMb: number;
  maxConcurrency: number;
}
export interface GRPOMLResult {
  optimizedModule: DSPyModule;
  finalReward: number;
  averageReturn: number;
  policyConvergence: boolean;
  totalEpisodes: number;
  policyUpdateHistory: PolicyUpdateResult[];
  rewardShapingStats: RewardShapingStats;
  experienceReplayStats: ExperienceReplayStats;
  banditPerformance: BanditPerformanceStats;
  episodeRewards: number[];
  policyLosses: number[];
  valueLosses: number[];
  explorationRates: number[];
  policyImprovementTests: HypothesisTest[];
  convergenceAnalysis: StatisticalResult;
  totalExperiences: number;
  averageAdvantage: number;
  rewardVariance: number;
  totalTrainingTime: number;
  policyUpdateTime: number;
  rewardShapingTime: number;
  recommendations: string[];
  policyInsights: string[];
}
export interface RewardShapingStats {
  totalRewardsShaped: number;
  averageShapingBonus: number;
  shapingEffectiveness: number;
  humanFeedbackCount: number;
}
export interface ExperienceReplayStats {
  totalExperiences: number;
  averagePriority: number;
  replayEfficiency: number;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}
export interface BanditPerformanceStats {
  totalActions: number;
  averageReward: number;
  explorationExploitationRatio: number;
  regret: number;
  actionDistribution: Record<string, number>;
}
/**
 * GRPOML - Advanced ML-Enhanced Gradient-based Reward Policy Optimization
 *
 * This teleprompter extends GRPO with sophisticated reinforcement learning
 * capabilities using battle-tested optimization and statistical libraries.
 */
export declare class GRPOML extends Teleprompter {
  private eventEmitter;
  private logger;
  private config;
  private initialized;
  private mlEngine?;
  private policyOptimizer?;
  private rewardShaper?;
  private experienceBuffer?;
  private banditOptimizer?;
  private statisticalAnalyzer?;
  private currentPolicy?;
  private currentEpisode;
  private currentStep;
  private totalExperiences;
  private episodeRewards;
  private policyUpdateHistory;
  private experienceHistory;
  private rewardShapingHistory;
  private startTime?;
  private bestPolicyReward;
  private convergenceThreshold;
  constructor(config?: Partial<GRPOMLConfig>);
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
  compileML(student: DSPyModule, options?: any): Promise<GRPOMLResult>;
  /**
   * Perform policy gradient training with experience replay
   */
  private performPolicyGradientTraining;
  private resetTrainingState;
  private initializeEpisodeState;
  private executeAction;
  private computeAdvantagesForEpisode;
  private adaptTrustRegion;
  private validatePolicyImprovement;
  private analyzeExperienceData;
  private calculateAverageReturn;
  private checkPolicyConvergence;
  private generateExplorationRateHistory;
  private calculateRewardShapingStats;
  private calculateExperienceReplayStats;
  private calculateBanditPerformance;
  private analyzeConvergence;
  private calculatePolicyUpdateTime;
  private calculateRewardShapingTime;
  private generateRecommendations;
  private generatePolicyInsights;
  private createOptimizedModule;
  private evaluateFinalPerformance;
}
/**
 * Factory function to create GRPOML with sensible defaults
 */
export declare function createGRPOML(config?: Partial<GRPOMLConfig>): GRPOML;
export {};
//# sourceMappingURL=grpo-ml.d.ts.map
