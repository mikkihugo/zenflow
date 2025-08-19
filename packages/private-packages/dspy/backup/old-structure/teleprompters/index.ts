/**
 * @fileoverview DSPy Teleprompters Index
 * 
 * Central export point for all DSPy teleprompter implementations including
 * optimization algorithms, bootstrap methods, and specialized prompt tuning techniques.
 * 
 * Available Teleprompters:
 * - Bootstrap Few-Shot: Core demonstration generation
 * - Bootstrap Random Search: Systematic exploration of demonstration spaces
 * - MIPRO V2: Multi-stage instruction and prefix optimization
 * - GRPO: Gradient-based reward policy optimization
 * - COPRO: Contrastive prompt optimization
 * - SIMBA: Simple optimization with bootstrapping and aggregation
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.46
 */

// Core Bootstrap Teleprompters
export {
  BootstrapFewShot,
  LabeledFewShot,
  type BootstrapConfig,
  type BootstrapCompileOptions,
  DEFAULT_BOOTSTRAP_CONFIG
} from './bootstrap.js';

export {
  BootstrapFewShotWithRandomSearch,
  type BootstrapRandomSearchConfig,
  type BootstrapRandomSearchCompileOptions,
  type CandidateResult,
  DEFAULT_BOOTSTRAP_RS_CONFIG,
  createBootstrapRandomSearch
} from './bootstrap-random-search.js';

// Advanced Optimization Teleprompters
export {
  MiproV2Optimizer,
  type MiproV2Config,
  type AutoRunMode,
  type FewShotCandidateSet,
  type InstructionCandidate,
  type OptimizationTrial,
  type MiproStats,
  DEFAULT_MIPRO_V2_CONFIG,
  AUTO_RUN_SETTINGS,
  PROPOSER_TIPS
} from './mipro_v2.js';

export {
  GradientBasedRewardPolicyOptimizer,
  type GRPOConfig,
  type TraceData,
  type GRPOStep,
  type GRPOMetrics,
  type RolloutManager,
  DEFAULT_GRPO_CONFIG,
  createGRPOOptimizer
} from './grpo.js';

// Additional Optimization Methods
export {
  COPRO,
  type COPROConfig,
  type ContrastiveExample,
  DEFAULT_COPRO_CONFIG
} from './copro.js';

export {
  SIMBA,
  type SIMBAConfig,
  type SIMBAMetrics,
  DEFAULT_SIMBA_CONFIG
} from './simba.js';

export {
  BootstrapFinetune,
  type BootstrapFinetuneConfig,
  DEFAULT_BOOTSTRAP_FINETUNE_CONFIG
} from './bootstrap-finetune.js';

// Ensemble Teleprompter
export {
  Ensemble,
  EnsembledProgram,
  type EnsembleConfig,
  type EnsembleResult,
  type ReduceFunction,
  EnsembleFactory,
  createEnsemble
} from './ensemble.js';

/**
 * All available teleprompter types
 */
export const TELEPROMPTER_TYPES = {
  BOOTSTRAP_FEW_SHOT: 'bootstrap-few-shot',
  BOOTSTRAP_RANDOM_SEARCH: 'bootstrap-random-search',
  LABELED_FEW_SHOT: 'labeled-few-shot',
  MIPRO_V2: 'mipro-v2',
  GRPO: 'grpo',
  COPRO: 'copro',
  SIMBA: 'simba',
  BOOTSTRAP_FINETUNE: 'bootstrap-finetune',
  ENSEMBLE: 'ensemble'
} as const;

/**
 * Teleprompter factory for common patterns
 */
export const TeleprompterFactory = {
  /**
   * Create a basic few-shot teleprompter
   */
  basicFewShot(metric: any, k: number = 16): LabeledFewShot {
    return new LabeledFewShot(k);
  },

  /**
   * Create a bootstrap teleprompter with standard settings
   */
  bootstrap(metric: any, config: Partial<BootstrapConfig> = {}): BootstrapFewShot {
    return new BootstrapFewShot({
      metric,
      maxBootstrappedDemos: 4,
      maxLabeledDemos: 16,
      verbose: true,
      ...config
    });
  },

  /**
   * Create a bootstrap random search teleprompter
   */
  bootstrapRandomSearch(metric: any, config: Partial<BootstrapRandomSearchConfig> = {}): BootstrapFewShotWithRandomSearch {
    return new BootstrapFewShotWithRandomSearch({
      metric,
      max_bootstrapped_demos: 4,
      max_labeled_demos: 16,
      num_candidate_programs: 16,
      verbose: true,
      ...config
    });
  },

  /**
   * Create a MIPRO V2 optimizer with auto-tuning
   */
  miproV2(metric: any, mode: AutoRunMode = 'medium'): MiproV2Optimizer {
    return new MiproV2Optimizer({
      metric,
      auto: mode,
      max_bootstrapped_demos: 4,
      max_labeled_demos: 4,
      verbose: true,
      track_stats: true
    });
  },

  /**
   * Create a GRPO optimizer for neural coordination
   */
  grpo(metric: any, config: Partial<GRPOConfig> = {}): GradientBasedRewardPolicyOptimizer {
    return new GradientBasedRewardPolicyOptimizer({
      metric,
      num_trials: 100,
      batch_size: 8,
      learning_rate: 0.001,
      verbose: true,
      ...config
    });
  }
};

/**
 * Auto-select optimal teleprompter based on task characteristics
 * 
 * @param metric - Evaluation metric
 * @param taskType - Type of task (classification, generation, reasoning, etc.)
 * @param datasetSize - Size of training dataset
 * @param optimizationBudget - Available computation budget (low/medium/high)
 * @returns Recommended teleprompter configuration
 */
export function autoSelectTeleprompter(
  metric: any,
  taskType: 'classification' | 'generation' | 'reasoning' | 'qa' | 'extraction',
  datasetSize: 'small' | 'medium' | 'large',
  optimizationBudget: 'low' | 'medium' | 'high'
): {
  teleprompter: any;
  reasoning: string;
} {
  // Small datasets or low budget: simple bootstrap
  if (datasetSize === 'small' || optimizationBudget === 'low') {
    return {
      teleprompter: TeleprompterFactory.bootstrap(metric, {
        maxBootstrappedDemos: 2,
        maxLabeledDemos: 8,
        verbose: false
      }),
      reasoning: 'Small dataset or low budget: using simple bootstrap with conservative demo count'
    };
  }

  // Reasoning tasks benefit from MIPRO V2's instruction optimization
  if (taskType === 'reasoning' && optimizationBudget === 'high') {
    return {
      teleprompter: TeleprompterFactory.miproV2(metric, 'heavy'),
      reasoning: 'Complex reasoning task with high budget: using MIPRO V2 for instruction optimization'
    };
  }

  // Large datasets with medium budget: bootstrap random search
  if (datasetSize === 'large' && optimizationBudget === 'medium') {
    return {
      teleprompter: TeleprompterFactory.bootstrapRandomSearch(metric, {
        num_candidate_programs: 12,
        max_bootstrapped_demos: 4
      }),
      reasoning: 'Large dataset with medium budget: using bootstrap random search for exploration'
    };
  }

  // High budget tasks: MIPRO V2 medium
  if (optimizationBudget === 'high') {
    return {
      teleprompter: TeleprompterFactory.miproV2(metric, 'medium'),
      reasoning: 'High optimization budget: using MIPRO V2 for comprehensive optimization'
    };
  }

  // Default: standard bootstrap
  return {
    teleprompter: TeleprompterFactory.bootstrap(metric),
    reasoning: 'Default case: using standard bootstrap teleprompter'
  };
}

/**
 * Teleprompter performance comparison utility
 */
export class TeleprompterComparison {
  private results: Array<{
    name: string;
    teleprompter: any;
    score: number;
    metadata: any;
  }> = [];

  /**
   * Add a teleprompter result to comparison
   */
  addResult(name: string, teleprompter: any, score: number, metadata: any = {}): void {
    this.results.push({ name, teleprompter, score, metadata });
  }

  /**
   * Get best performing teleprompter
   */
  getBest(): { name: string; teleprompter: any; score: number; metadata: any } | null {
    if (this.results.length === 0) return null;
    return this.results.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  /**
   * Get comparison summary
   */
  getSummary(): string {
    if (this.results.length === 0) return 'No teleprompters compared yet.';
    
    const sorted = [...this.results].sort((a, b) => b.score - a.score);
    let summary = 'Teleprompter Performance Comparison:\n';
    
    sorted.forEach((result, index) => {
      const rank = index + 1;
      const emoji = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
      summary += `${emoji} ${rank}. ${result.name}: ${result.score.toFixed(3)}\n`;
    });
    
    return summary;
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results = [];
  }
}