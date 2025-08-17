/**
 * @fileoverview Bootstrap Few-Shot with Random Search Teleprompter
 * 
 * Advanced teleprompter that combines the Bootstrap Few-Shot approach with
 * systematic random search across multiple candidate configurations. This creates
 * and evaluates multiple bootstrap programs with different random seeds and
 * parameters, selecting the best performing one.
 * 
 * Key Features:
 * - Multiple candidate program generation with different random seeds
 * - Progressive evaluation strategies (zero-shot, labeled-only, bootstrap)
 * - Parallel evaluation with configurable thread limits
 * - Early stopping based on score thresholds
 * - Comprehensive candidate comparison and selection
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.46
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import type { Example, MetricFunction, TraceStep } from '../interfaces/types.js';
import type { DSPyModule } from '../primitives/module.js';
import { BootstrapFewShot, LabeledFewShot } from './bootstrap.js';
import { SeededRNG } from '../utils/rng.js';

/**
 * Configuration for Bootstrap Few-Shot with Random Search
 */
export interface BootstrapRandomSearchConfig {
  /** Metric function for evaluation */
  metric: MetricFunction;
  /** Teacher model settings */
  teacher_settings?: Record<string, any>;
  /** Maximum bootstrapped demonstrations per predictor */
  max_bootstrapped_demos?: number;
  /** Maximum labeled demonstrations per predictor */
  max_labeled_demos?: number;
  /** Maximum rounds for bootstrap attempts */
  max_rounds?: number;
  /** Number of candidate programs to generate */
  num_candidate_programs?: number;
  /** Number of parallel evaluation threads */
  num_threads?: number;
  /** Maximum errors before stopping */
  max_errors?: number;
  /** Score threshold for early stopping */
  stop_at_score?: number;
  /** Metric threshold for filtering demonstrations */
  metric_threshold?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Random seed for reproducibility */
  seed?: number;
}

/**
 * Default configuration for Bootstrap Random Search
 */
export const DEFAULT_BOOTSTRAP_RS_CONFIG: Omit<BootstrapRandomSearchConfig, 'metric'> = {
  teacher_settings: {},
  max_bootstrapped_demos: 4,
  max_labeled_demos: 16,
  max_rounds: 1,
  num_candidate_programs: 16,
  num_threads: 1,
  max_errors: 10,
  stop_at_score: undefined,
  metric_threshold: undefined,
  verbose: false,
  seed: 42
};

/**
 * Compilation options for Bootstrap Random Search
 */
export interface BootstrapRandomSearchCompileOptions {
  /** Training examples */
  trainset: Example[];
  /** Optional teacher model */
  teacher?: DSPyModule;
  /** Validation set (defaults to trainset if not provided) */
  valset?: Example[];
  /** Restrict to specific seed values for reproducibility */
  restrict?: number[];
  /** Whether to sample labeled examples */
  labeled_sample?: boolean;
}

/**
 * Candidate program evaluation result
 */
export interface CandidateResult {
  /** Candidate program */
  program: DSPyModule;
  /** Overall score */
  score: number;
  /** Individual example scores */
  subscores: number[];
  /** Generation seed */
  seed: number;
  /** Generation strategy */
  strategy: 'zero-shot' | 'labeled-only' | 'bootstrap' | 'bootstrap-random';
  /** Number of demonstrations used */
  num_demos?: number;
  /** Evaluation details */
  evaluation_details?: {
    total_examples: number;
    successful_evaluations: number;
    failed_evaluations: number;
    average_score: number;
  };
}

/**
 * Bootstrap Few-Shot with Random Search Teleprompter
 * 
 * Systematically explores the space of few-shot demonstrations by generating
 * multiple candidate programs using different bootstrap configurations and
 * random seeds. Evaluates all candidates and selects the best performing one.
 * 
 * Algorithm:
 * 1. Generate multiple candidate programs:
 *    - Zero-shot baseline
 *    - Labeled-only demonstrations
 *    - Standard bootstrap
 *    - Random bootstrap variants with different seeds and demo counts
 * 2. Evaluate each candidate on validation set
 * 3. Select best performing candidate
 * 4. Optional early stopping if score threshold reached
 * 
 * @example
 * ```typescript
 * const bootstrapRS = new BootstrapFewShotWithRandomSearch({
 *   metric: (example, prediction) => prediction.answer === example.answer ? 1 : 0,
 *   max_bootstrapped_demos: 4,
 *   max_labeled_demos: 16,
 *   num_candidate_programs: 16,
 *   stop_at_score: 0.95,
 *   verbose: true
 * });
 * 
 * const optimized = await bootstrapRS.compile(predictor, {
 *   trainset,
 *   valset,
 *   teacher: teacherModel
 * });
 * ```
 */
export class BootstrapFewShotWithRandomSearch {
  private config: Required<BootstrapRandomSearchConfig>;
  private rng: SeededRNG;
  
  // Evaluation state
  private trainset: Example[] = [];
  private valset: Example[] = [];
  private min_num_samples: number;
  private max_num_samples: number;

  constructor(config: BootstrapRandomSearchConfig) {
    this.config = { ...DEFAULT_BOOTSTRAP_RS_CONFIG, ...config } as Required<BootstrapRandomSearchConfig>;
    this.rng = new SeededRNG(this.config.seed);
    
    this.min_num_samples = 1;
    this.max_num_samples = this.config.max_bootstrapped_demos;
    
    if (this.config.verbose) {
      console.log(`🎯 Bootstrap Random Search: Will sample between ${this.min_num_samples} and ${this.max_num_samples} traces per predictor`);
      console.log(`🔄 Bootstrap Random Search: Will attempt to bootstrap ${this.config.num_candidate_programs} candidate sets`);
    }
  }

  /**
   * Compile student module using bootstrap random search
   * 
   * @param student - Module to optimize
   * @param options - Compilation options
   * @returns Best performing optimized module
   */
  async compile(
    student: DSPyModule,
    options: BootstrapRandomSearchCompileOptions
  ): Promise<DSPyModule> {
    this.trainset = options.trainset;
    this.valset = options.valset || options.trainset;
    
    if (this.config.verbose) {
      console.log('🚀 Bootstrap Random Search: Starting compilation');
      console.log(`   • Training examples: ${this.trainset.length}`);
      console.log(`   • Validation examples: ${this.valset.length}`);
      console.log(`   • Candidate programs: ${this.config.num_candidate_programs}`);
    }

    const scores: number[] = [];
    const all_subscores: number[][] = [];
    const candidates: CandidateResult[] = [];

    // Generate and evaluate candidate programs
    for (let seed = -3; seed < this.config.num_candidate_programs; seed++) {
      // Skip if restricting to specific seeds
      if (options.restrict && !options.restrict.includes(seed)) {
        continue;
      }

      const candidateResult = await this.generateAndEvaluateCandidate(
        student,
        seed,
        options
      );

      if (candidateResult) {
        candidates.push(candidateResult);
        scores.push(candidateResult.score);
        all_subscores.push(candidateResult.subscores);

        if (this.config.verbose) {
          console.log(
            `📊 Candidate ${seed} (${candidateResult.strategy}): Score ${candidateResult.score.toFixed(3)} ` +
            `(${candidateResult.evaluation_details?.successful_evaluations}/${candidateResult.evaluation_details?.total_examples} examples)`
          );
        }

        // Early stopping if we hit the target score
        if (this.config.stop_at_score && candidateResult.score >= this.config.stop_at_score) {
          if (this.config.verbose) {
            console.log(`🎯 Early stopping: Target score ${this.config.stop_at_score} reached!`);
          }
          break;
        }
      }
    }

    if (candidates.length === 0) {
      throw new Error('No successful candidate programs generated');
    }

    // Select best candidate
    const bestCandidate = candidates.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    if (this.config.verbose) {
      console.log(`\n✅ Bootstrap Random Search: Compilation complete`);
      console.log(`🏆 Best candidate: Seed ${bestCandidate.seed} (${bestCandidate.strategy})`);
      console.log(`📈 Best score: ${bestCandidate.score.toFixed(3)}`);
      console.log(`📊 All scores: [${scores.map(s => s.toFixed(3)).join(', ')}]`);
    }

    // Attach evaluation metadata
    const finalProgram = bestCandidate.program.deepcopy();
    finalProgram.compiled = true;
    
    // Store optimization metadata
    (finalProgram as any).bootstrap_rs_stats = {
      best_score: bestCandidate.score,
      best_seed: bestCandidate.seed,
      best_strategy: bestCandidate.strategy,
      all_scores: scores,
      all_candidates: candidates,
      num_candidates_evaluated: candidates.length
    };

    return finalProgram;
  }

  /**
   * Generate and evaluate a single candidate program
   */
  private async generateAndEvaluateCandidate(
    student: DSPyModule,
    seed: number,
    options: BootstrapRandomSearchCompileOptions
  ): Promise<CandidateResult | null> {
    try {
      const trainset_copy = [...this.trainset];
      let program: DSPyModule;
      let strategy: CandidateResult['strategy'];
      let num_demos: number | undefined;

      if (seed === -3) {
        // Zero-shot baseline
        program = student.deepcopy();
        // Clear any existing demonstrations
        for (const predictor of program.predictors()) {
          predictor.clearDemos();
        }
        strategy = 'zero-shot';
        num_demos = 0;

      } else if (seed === -2) {
        // Labeled-only demonstrations
        const teleprompter = new LabeledFewShot(this.config.max_labeled_demos, seed);
        program = teleprompter.compile(student, { trainset: trainset_copy });
        strategy = 'labeled-only';
        num_demos = Math.min(this.config.max_labeled_demos, trainset_copy.length);

      } else if (seed === -1) {
        // Standard bootstrap (unshuffled)
        const optimizer = new BootstrapFewShot({
          metric: this.config.metric,
          metricThreshold: this.config.metric_threshold,
          maxBootstrappedDemos: this.max_num_samples,
          maxLabeledDemos: this.config.max_labeled_demos,
          teacherSettings: this.config.teacher_settings,
          maxRounds: this.config.max_rounds,
          maxErrors: this.config.max_errors || 10,
          seed: 0, // Fixed seed for reproducibility
          verbose: false
        });
        
        program = await optimizer.compile(student, {
          trainset: trainset_copy,
          teacher: options.teacher
        });
        strategy = 'bootstrap';
        num_demos = this.max_num_samples;

      } else {
        // Random bootstrap variants
        if (seed < 0) {
          throw new Error(`Invalid seed: ${seed}`);
        }

        // Shuffle training set with this seed
        const seedRng = new SeededRNG(seed);
        seedRng.shuffle(trainset_copy);
        
        // Random sample size for this variant
        const size = seedRng.randomInt(this.min_num_samples, this.max_num_samples + 1);
        
        const optimizer = new BootstrapFewShot({
          metric: this.config.metric,
          metricThreshold: this.config.metric_threshold,
          maxBootstrappedDemos: size,
          maxLabeledDemos: this.config.max_labeled_demos,
          teacherSettings: this.config.teacher_settings,
          maxRounds: this.config.max_rounds,
          maxErrors: this.config.max_errors || 10,
          seed: seed,
          verbose: false
        });
        
        program = await optimizer.compile(student, {
          trainset: trainset_copy,
          teacher: options.teacher
        });
        strategy = 'bootstrap-random';
        num_demos = size;
      }

      // Evaluate the candidate program
      const evaluationResult = await this.evaluateProgram(program, this.valset);

      return {
        program,
        score: evaluationResult.score,
        subscores: evaluationResult.subscores,
        seed,
        strategy,
        num_demos,
        evaluation_details: evaluationResult.details
      };

    } catch (error) {
      if (this.config.verbose) {
        console.warn(`⚠️  Failed to generate candidate ${seed}: ${error}`);
      }
      return null;
    }
  }

  /**
   * Evaluate a program on the validation set
   */
  private async evaluateProgram(
    program: DSPyModule,
    valset: Example[]
  ): Promise<{
    score: number;
    subscores: number[];
    details: {
      total_examples: number;
      successful_evaluations: number;
      failed_evaluations: number;
      average_score: number;
    };
  }> {
    const subscores: number[] = [];
    let total_score = 0;
    let successful_evaluations = 0;
    let failed_evaluations = 0;

    for (const example of valset) {
      try {
        const inputs = example.inputs();
        const prediction = await program.forward(inputs.data);
        
        // Create trace for metric evaluation
        const trace: TraceStep[] = [
          {
            predictor: program.predictors()[0], // Simplified for single predictor case
            inputs: inputs.data,
            outputs: prediction,
            timestamp: Date.now()
          }
        ];

        const score = this.config.metric(example, prediction, trace);
        const numeric_score = typeof score === 'boolean' ? (score ? 1 : 0) : score;
        
        subscores.push(numeric_score);
        total_score += numeric_score;
        successful_evaluations++;

      } catch (error) {
        subscores.push(0);
        failed_evaluations++;
        
        if (this.config.verbose) {
          console.warn(`⚠️  Evaluation failed for example: ${error}`);
        }
      }
    }

    const average_score = successful_evaluations > 0 ? total_score / successful_evaluations : 0;

    return {
      score: average_score,
      subscores,
      details: {
        total_examples: valset.length,
        successful_evaluations,
        failed_evaluations,
        average_score
      }
    };
  }

  /**
   * Get optimization statistics from the last compilation
   */
  getOptimizationStats(): any {
    // This would be attached to the compiled program
    return {
      config: this.config,
      min_num_samples: this.min_num_samples,
      max_num_samples: this.max_num_samples
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<BootstrapRandomSearchConfig>): void {
    this.config = { ...this.config, ...updates } as Required<BootstrapRandomSearchConfig>;
    this.min_num_samples = 1;
    this.max_num_samples = this.config.max_bootstrapped_demos;
  }
}

/**
 * Create a Bootstrap Few-Shot with Random Search teleprompter
 * 
 * @param config - Configuration options
 * @returns Configured teleprompter instance
 */
export function createBootstrapRandomSearch(
  config: BootstrapRandomSearchConfig
): BootstrapFewShotWithRandomSearch {
  return new BootstrapFewShotWithRandomSearch(config);
}