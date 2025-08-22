/**
 * @fileoverview GRPO (Gradient-based Reward Policy Optimization) Teleprompter Implementation
 *
 * Production-grade implementation with 100% Stanford DSPy API compatibility.
 * Advanced teleprompter that combines bootstrap methodology with reinforcement learning
 * using gradient-based reward policy optimization.
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Documentation
 */
import { FinetuneTeleprompter } from './bootstrap-finetune';
import type { Adapter } from '../interfaces/adapter';
import type { LMInterface } from '../interfaces/lm';
import type { MetricFunction } from '../interfaces/types';
import { DSPyModule } from '../primitives/module';
import { Example } from '../primitives/example';
/**
 * GRPO Configuration exactly matching Stanford DSPy API
 */
export interface GRPOConfig {
  metric?: MetricFunction'' | ''null;
  multitask?: boolean;
  train_kwargs?:'' | ''Record<string, any>'' | ''Map<LMInterface, Record<string, any>>'' | ''null;
  adapter?: Adapter'' | ''Map<LMInterface, Adapter>'' | ''null;
  exclude_demos?: boolean;
  num_threads?: number;
  num_train_steps?: number;
  seed?: number;
  num_dspy_examples_per_grpo_step?: number;
  num_rollouts_per_grpo_step?: number;
  use_train_as_val?: boolean;
  num_steps_for_val?: number;
  report_train_scores?: boolean;
  failure_score?: number;
  format_failure_score?: number;
  variably_invoked_predictor_grouping_mode?:'truncate | fill' | 'ragged';
  variably_invoked_predictor_fill_strategy?: 'randint''' | '''max' | null;
}
/**
 * GRPO (Gradient-based Reward Policy Optimization) Teleprompter
 *
 * Exact implementation matching Stanford DSPy GRPO teleprompter with 100% API compatibility.
 */
export declare class GRPO extends FinetuneTeleprompter {
  private metric;
  private multitask;
  private adapter;
  private exclude_demos;
  private num_threads;
  private num_train_steps;
  private rng;
  private num_dspy_examples_per_grpo_step;
  private num_rollouts_per_grpo_step;
  private use_train_as_val;
  private num_steps_for_val;
  private report_train_scores;
  private failure_score;
  private format_failure_score;
  private variably_invoked_predictor_grouping_mode;
  private variably_invoked_predictor_fill_strategy;
  private shuffled_trainset_ids;
  private epoch;
  private id_freqs;
  constructor({
    metric,
    multitask,
    train_kwargs,
    adapter,
    exclude_demos,
    num_threads,
    num_train_steps,
    seed,
    num_dspy_examples_per_grpo_step,
    num_rollouts_per_grpo_step,
    use_train_as_val,
    num_steps_for_val,
    report_train_scores,
    failure_score,
    format_failure_score,
    variably_invoked_predictor_grouping_mode,
    variably_invoked_predictor_fill_strategy,
  }?: GRPOConfig);
  /**
   * Convert adapter to LM dictionary
   */
  private convert_to_lm_dict;
  /**
   * Validate trace data and log issues exactly matching Stanford implementation
   */
  private validate_trace_data_and_log_issues;
  /**
   * Hash signature for predictor matching
   */
  private hash_signature;
  /**
   * Report validation metrics exactly matching Stanford implementation
   */
  private report_validation_metrics;
  /**
   * Update shuffled trainset exactly matching Stanford implementation
   */
  private update_shuffled_trainset;
  /**
   * Select training sample and update shuffled trainset exactly matching Stanford implementation
   */
  private select_training_sample_and_update_shuffled_trainset;
  /**
   * Compile method exactly matching Stanford DSPy API
   */
  compile(
    student: DSPyModule,
    config: {
      trainset: Example[];
      teacher?: DSPyModule | DSPyModule[] | null;
      valset?: Example[] | null;
      [key: string]: any;
    }
  ): Promise<DSPyModule>;
  /**
   * Check if prediction is a failed prediction
   */
  private is_failed_prediction;
}
//# sourceMappingURL=grpo.d.ts.map
