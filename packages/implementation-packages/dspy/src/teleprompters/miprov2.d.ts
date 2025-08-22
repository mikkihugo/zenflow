/**
 * @fileoverview MIPROv2 Teleprompter - 100% Stanford DSPy API Compatible
 *
 * Direct TypeScript port of Stanford's dspy/teleprompt/mipro_optimizer_v2.py
 * Maintains exact API compatibility with original Python implementation.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 * @see {@link https://github.com/stanfordnlp/dspy/blob/main/dspy/teleprompt/mipro_optimizer_v2.py} Original Implementation
 */
import { Teleprompter } from './teleprompter.js';
import { DSPyModule } from '../primitives/module';
import type { Example } from '../primitives/example';
import type { LMInterface } from '../interfaces/lm';
import type { MetricFunction } from '../interfaces/types';
/**
 * Configuration interface for MIPROv2 teleprompter
 * Exact match with Stanford DSPy MIPROv2 constructor
 */
export interface MIPROv2Config {
  /** Metric function for evaluation */
  metric: MetricFunction;
  /** Model for prompt generation (defaults to dspy.settings.lm) */
  prompt_model?: LMInterface'' | ''null;
  /** Model for task execution (defaults to dspy.settings.lm) */
  task_model?: LMInterface'' | ''null;
  /** Teacher settings for bootstrapping */
  teacher_settings?: Record<string, any>'' | ''null;
  /** Maximum bootstrapped demonstrations */
  max_bootstrapped_demos?: number;
  /** Maximum labeled demonstrations */
  max_labeled_demos?: number;
  /** Auto configuration mode */
  auto?:'light | medium' | 'heavy''' | ''null;
  /** Number of candidates (overridden by auto) */
  num_candidates?: number'' | ''null;
  /** Number of threads for evaluation */
  num_threads?: number'' | ''null;
  /** Maximum errors allowed */
  max_errors?: number'' | ''null;
  /** Random seed */
  seed?: number;
  /** Initial temperature for instruction generation */
  init_temperature?: number;
  /** Verbose logging */
  verbose?: boolean;
  /** Track statistics */
  track_stats?: boolean;
  /** Log directory for saving candidates */
  log_dir?: string'' | ''null;
  /** Metric threshold for filtering */
  metric_threshold?: number'' | ''null;
}
/**
 * Instruction candidates type
 */
export type InstructionCandidates = Record<number, string[]>;
/**
 * Demo candidates type
 */
export type DemoCandidates = Record<number, Example[][]>;
/**
 * Trial logs type
 */
export interface TrialLog {
  full_eval_program_path?: string;
  full_eval_score?: number;
  total_eval_calls_so_far?: number;
  full_eval_program?: DSPyModule;
  mb_program_path?: string;
  mb_score?: number;
  mb_program?: DSPyModule;
  [key: string]: any;
}
/**
 * MIPROv2 Teleprompter
 *
 * 100% compatible with Stanford DSPy's MIPROv2 teleprompter.
 * Multi-stage Instruction and Prefix Optimization using Bayesian optimization.
 *
 * @example
 * ```typescript
 * // Basic usage with auto mode (recommended)
 * const miprov2 = new MIPROv2({
 *   metric: exactMatch,
 *   auto: 'light'  // Quick optimization for small datasets
 * });
 * const optimizedProgram = await miprov2.compile(studentProgram, {
 *   trainset: trainingData
 * });
 *
 * // Medium auto mode for balanced optimization
 * const mediumOptimizer = new MIPROv2({
 *   metric: f1ScoreMetric,
 *   auto: 'medium',  // More thorough optimization
 *   verbose: true
 * });
 * const result = await mediumOptimizer.compile(complexProgram, {
 *   trainset: largerTrainingSet,
 *   valset: validationSet
 * });
 *
 * // Heavy auto mode for maximum optimization
 * const heavyOptimizer = new MIPROv2({
 *   metric: accuracyMetric,
 *   auto: 'heavy',  // Comprehensive optimization for critical applications
 *   track_stats: true,
 *   log_dir: './optimization_logs'
 * });
 * const bestProgram = await heavyOptimizer.compile(criticalProgram, {
 *   trainset: comprehensiveTrainingSet,
 *   valset: largeValidationSet
 * });
 *
 * // Advanced manual configuration (experts only)
 * const customOptimizer = new MIPROv2({
 *   metric: customMetric,
 *   num_candidates: 20,        // Manual candidate count
 *   max_bootstrapped_demos: 8, // More demonstrations
 *   max_labeled_demos: 6,      // More labeled examples
 *   init_temperature: 0.7,     // Higher exploration
 *   num_threads: 4,            // Parallel evaluation
 *   verbose: true
 * });
 * const optimized = await customOptimizer.compile(studentProgram, {
 *   trainset: trainingExamples,
 *   valset: validationExamples,
 *   num_trials: 100,           // More optimization rounds
 *   minibatch: true,           // Use minibatch evaluation
 *   minibatch_size: 50,        // Minibatch size
 *   program_aware_proposer: true,  // Use program-aware proposals
 *   data_aware_proposer: true      // Use data-aware proposals
 * });
 *
 * // Production configuration with error handling
 * const productionOptimizer = new MIPROv2({
 *   metric: productionMetric,
 *   auto: 'medium',
 *   max_errors: 5,             // Allow some failures
 *   metric_threshold: 0.8,     // Quality threshold
 *   seed: 42                   // Reproducible results
 * });
 *
 * try {
 *   const production = await productionOptimizer.compile(deploymentProgram, {
 *     trainset: productionTraining,
 *     valset: productionValidation,
 *     requires_permission_to_run: false,  // Skip permission prompts
 *     provide_traceback: true              // Debug information
 *   });
 *   console.log('Optimization successful!');
 * } catch (error) {
 *   console.error('Optimization failed:', error.message);
 * }
 * ```
 */
export declare class MIPROv2 extends Teleprompter {
  private config;
  private rng;
  private promptModelTotalCalls;
  private totalCalls;
  private numFewshotCandidates?;
  private numInstructCandidates?;
  /**
   * Initialize MIPROv2 teleprompter
   * Exact API match with Stanford DSPy constructor
   */
  constructor(config: MIPROv2Config);
  /**
   * Compile student program using MIPROv2 optimization
   * Exact API match with Stanford DSPy compile method
   */
  compile(
    student: DSPyModule,
    options: {
      trainset: Example[];
      teacher?: DSPyModule | DSPyModule[] | null;
      valset?: Example[] | null;
      num_trials?: number | null;
      max_bootstrapped_demos?: number | null;
      max_labeled_demos?: number | null;
      seed?: number | null;
      minibatch?: boolean;
      minibatch_size?: number;
      minibatch_full_eval_steps?: number;
      program_aware_proposer?: boolean;
      data_aware_proposer?: boolean;
      view_data_batch_size?: number;
      tip_aware_proposer?: boolean;
      fewshot_aware_proposer?: boolean;
      requires_permission_to_run?: boolean;
      provide_traceback?: boolean | null;
      strict_minibatch_validation?: boolean;
    }
  ): Promise<DSPyModule>;
  /**
   * Set random seeds for reproducibility
   */
  private setRandomSeeds;
  /**
   * Calculate number of trials from number of candidates
   */
  private setNumTrialsFromNumCandidates;
  /**
   * Set and validate datasets
   */
  private setAndValidateDatasets;
  /**
   * Get configuration
   */
  getConfig(): Required<MIPROv2Config>;
}
export { MIPROv2 as MIPROv2Teleprompter };
export default MIPROv2;
//# sourceMappingURL=miprov2.d.ts.map
