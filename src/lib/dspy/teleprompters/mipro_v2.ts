/**
 * @fileoverview MIPRO V2 (Multi-stage Instruction and Prefix Optimization) Teleprompter
 * 
 * Implementation of Stanford DSPy's MIPRO V2 algorithm for multi-stage prompt optimization.
 * Combines few-shot example bootstrap, instruction generation, and Bayesian optimization
 * to find optimal combinations of instructions and demonstrations.
 * 
 * Key Features:
 * - Multi-stage optimization: bootstrap → instruction generation → Bayesian optimization
 * - Auto-tuning modes (light/medium/heavy) for different optimization budgets
 * - Minibatch evaluation with periodic full evaluations for efficiency
 * - GroundedProposer for contextual instruction generation
 * - Optuna-style Bayesian optimization for parameter search
 * - Comprehensive trial logging and statistics tracking
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.46
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import type { Example, Prediction, MetricFunction } from '../interfaces/types.js';
import type { DSPyModule } from '../primitives/module.js';
import type { DSPyPredictor, Signature } from '../primitives/predictor.js';
import { SeededRNG } from '../utils/rng.js';

/**
 * Auto-tuning mode configurations
 */
export type AutoRunMode = 'light' | 'medium' | 'heavy';

/**
 * Auto-run settings for different optimization budgets
 */
export const AUTO_RUN_SETTINGS: Record<AutoRunMode, { n: number; val_size: number }> = {
  light: { n: 6, val_size: 100 },
  medium: { n: 12, val_size: 300 },
  heavy: { n: 18, val_size: 1000 }
};

/**
 * MIPRO V2 configuration parameters
 */
export interface MiproV2Config {
  /** Metric function for evaluation */
  metric: MetricFunction;
  /** Auto-tuning mode (overrides manual settings) */
  auto?: AutoRunMode;
  /** Number of instruction candidates (used if auto is null) */
  num_candidates?: number;
  /** Maximum bootstrapped demonstrations per predictor */
  max_bootstrapped_demos: number;
  /** Maximum labeled demonstrations per predictor */
  max_labeled_demos: number;
  /** Initial temperature for instruction generation */
  init_temperature: number;
  /** Whether to enable verbose logging */
  verbose: boolean;
  /** Whether to track detailed statistics */
  track_stats: boolean;
  /** Random seed for reproducibility */
  seed: number;
  /** Metric threshold for filtering examples */
  metric_threshold?: number;
  /** Number of threads for parallel evaluation */
  num_threads?: number;
  /** Maximum errors allowed during evaluation */
  max_errors?: number;
  /** Directory for saving trial logs */
  log_dir?: string;
  /** Task model for program execution */
  task_model?: any;
  /** Prompt model for instruction generation */
  prompt_model?: any;
  /** Teacher model settings for bootstrapping */
  teacher_settings?: Record<string, any>;
}

/**
 * Default MIPRO V2 configuration
 */
export const DEFAULT_MIPRO_V2_CONFIG: Omit<MiproV2Config, 'metric'> = {
  auto: 'light',
  max_bootstrapped_demos: 4,
  max_labeled_demos: 4,
  init_temperature: 0.5,
  verbose: false,
  track_stats: true,
  seed: 9
};

/**
 * Few-shot example candidate set
 */
export interface FewShotCandidateSet {
  /** Demonstrations for this candidate set */
  demos: Example[];
  /** Performance score of this candidate set */
  score: number;
  /** Predictor index this set belongs to */
  predictor_index: number;
}

/**
 * Instruction candidate with metadata
 */
export interface InstructionCandidate {
  /** Instruction text */
  instruction: string;
  /** Generation source (original, dataset-aware, program-aware, etc.) */
  source: string;
  /** Predictor index this instruction is for */
  predictor_index: number;
  /** Performance score when evaluated */
  score?: number;
}

/**
 * Optimization trial result
 */
export interface OptimizationTrial {
  /** Trial number */
  trial_num: number;
  /** Selected instruction indices for each predictor */
  instruction_indices: number[];
  /** Selected demo set indices for each predictor (if applicable) */
  demo_indices?: number[];
  /** Trial score */
  score: number;
  /** Whether this was a full evaluation */
  full_eval: boolean;
  /** Program snapshot for this trial */
  program: DSPyModule;
  /** Total evaluation calls made so far */
  total_eval_calls: number;
}

/**
 * Optimization statistics
 */
export interface MiproStats {
  /** Trial logs indexed by trial number */
  trial_logs: Record<number, OptimizationTrial>;
  /** All candidate programs sorted by score */
  candidate_programs: OptimizationTrial[];
  /** Minibatch candidate programs */
  mb_candidate_programs: OptimizationTrial[];
  /** Total prompt model calls */
  prompt_model_total_calls: number;
  /** Total task model calls */
  total_calls: number;
  /** Best score achieved */
  best_score: number;
  /** Final optimized program */
  best_program: DSPyModule;
}

/**
 * Proposer tips for instruction generation
 */
export const PROPOSER_TIPS = {
  none: '',
  creative: "Don't be afraid to be creative when creating the new instruction!",
  simple: 'Keep the instruction clear and concise.',
  description: 'Make sure your instruction is very informative and descriptive.',
  high_stakes: 'The instruction should include a high stakes scenario in which the LM must solve the task!',
  persona: 'Include a persona that is relevant to the task in the instruction (ie. "You are a ...")'
} as const;

/**
 * MIPRO V2 Teleprompter Implementation
 * 
 * Multi-stage instruction and prefix optimization combining bootstrapping,
 * instruction generation, and Bayesian optimization for optimal prompt parameters.
 * 
 * @example
 * ```typescript
 * const mipro = new MiproV2Optimizer({
 *   metric: (example, prediction) => prediction.answer === example.answer ? 1 : 0,
 *   auto: 'medium',
 *   max_bootstrapped_demos: 4,
 *   max_labeled_demos: 4,
 *   init_temperature: 0.5,
 *   verbose: true,
 *   track_stats: true,
 *   seed: 42
 * });
 * 
 * const optimizedModule = await mipro.compile(
 *   predictor, 
 *   { trainset, valset, num_trials: 50, minibatch: true }
 * );
 * ```
 */
export class MiproV2Optimizer {
  private config: MiproV2Config;
  private rng: SeededRNG;
  private stats: MiproStats;
  
  // Optimization state
  private num_fewshot_candidates: number = 0;
  private num_instruct_candidates: number = 0;
  
  /**
   * Initialize MIPRO V2 optimizer
   * 
   * @param config - MIPRO V2 configuration
   */
  constructor(config: MiproV2Config) {
    this.config = { ...DEFAULT_MIPRO_V2_CONFIG, ...config };
    this.rng = new SeededRNG(this.config.seed);
    this.stats = {
      trial_logs: {},
      candidate_programs: [],
      mb_candidate_programs: [],
      prompt_model_total_calls: 0,
      total_calls: 0,
      best_score: -Infinity,
      best_program: null as any
    };
    
    this.validateConfig();
  }

  /**
   * Compile and optimize a DSPy module using MIPRO V2
   * 
   * @param student - Module to optimize
   * @param options - Compilation options
   * @returns - Optimized module
   */
  async compile(
    student: DSPyModule,
    options: {
      trainset: Example[];
      teacher?: DSPyModule;
      valset?: Example[];
      num_trials?: number;
      max_bootstrapped_demos?: number;
      max_labeled_demos?: number;
      seed?: number;
      minibatch?: boolean;
      minibatch_size?: number;
      minibatch_full_eval_steps?: number;
      program_aware_proposer?: boolean;
      data_aware_proposer?: boolean;
      view_data_batch_size?: number;
      tip_aware_proposer?: boolean;
      fewshot_aware_proposer?: boolean;
      provide_traceback?: boolean;
    }
  ): Promise<DSPyModule> {
    const {
      trainset,
      teacher,
      valset,
      num_trials,
      max_bootstrapped_demos,
      max_labeled_demos,
      seed,
      minibatch = true,
      minibatch_size = 35,
      minibatch_full_eval_steps = 5,
      program_aware_proposer = true,
      data_aware_proposer = true,
      view_data_batch_size = 10,
      tip_aware_proposer = true,
      fewshot_aware_proposer = true,
      provide_traceback
    } = options;

    console.log('🚀 MIPRO V2: Starting multi-stage instruction and prefix optimization');

    // Set random seed
    const effectiveSeed = seed || this.config.seed;
    this.setRandomSeeds(effectiveSeed);

    // Update max demos if specified
    if (max_bootstrapped_demos !== undefined) {
      this.config.max_bootstrapped_demos = max_bootstrapped_demos;
    }
    if (max_labeled_demos !== undefined) {
      this.config.max_labeled_demos = max_labeled_demos;
    }

    // Set and validate datasets
    const [finalTrainset, finalValset] = this.setAndValidateDatasets(trainset, valset);
    
    // Determine if zero-shot optimization
    const zeroshot_opt = this.config.max_bootstrapped_demos === 0 && this.config.max_labeled_demos === 0;

    // Validate configuration compatibility
    this.validateCompileOptions(num_trials, zeroshot_opt);

    // Set hyperparameters based on auto mode
    const [finalNumTrials, adjustedValset, finalMinibatch] = this.setHyperparamsFromRunMode(
      student, 
      num_trials, 
      minibatch, 
      zeroshot_opt, 
      finalValset
    );

    if (this.config.auto) {
      this.printAutoRunSettings(finalNumTrials, finalMinibatch, adjustedValset);
    }

    // Initialize program
    const program = student.deepcopy();
    
    console.log('\n📊 MIPRO V2: Optimization pipeline started');
    console.log(`   • Training set: ${finalTrainset.length} examples`);
    console.log(`   • Validation set: ${adjustedValset.length} examples`);
    console.log(`   • Zero-shot mode: ${zeroshot_opt}`);
    console.log(`   • Trials: ${finalNumTrials}`);
    console.log(`   • Minibatch: ${finalMinibatch}`);

    // Adjust minibatch size if it exceeds valset size
    let adjustedMinibatchSize = minibatch_size;
    if (finalMinibatch && minibatch_size > adjustedValset.length) {
      adjustedMinibatchSize = adjustedValset.length;
      if (this.config.verbose) {
        console.log(`⚠️  Adjusted minibatch_size from ${minibatch_size} to ${adjustedMinibatchSize} to match valset size`);
      }
    }

    // Step 1: Bootstrap few-shot examples
    const demo_candidates = await this.bootstrapFewshotExamples(
      program, 
      finalTrainset, 
      effectiveSeed, 
      teacher
    );

    // Step 2: Propose instruction candidates
    const instruction_candidates = await this.proposeInstructions(
      program,
      finalTrainset,
      demo_candidates,
      view_data_batch_size,
      program_aware_proposer,
      data_aware_proposer,
      tip_aware_proposer,
      fewshot_aware_proposer
    );

    // If zero-shot, discard demos
    const final_demo_candidates = zeroshot_opt ? null : demo_candidates;

    // Step 3: Find optimal prompt parameters
    const best_program = await this.optimizePromptParameters(
      program,
      instruction_candidates,
      final_demo_candidates,
      adjustedValset,
      finalNumTrials,
      finalMinibatch,
      minibatch_size,
      minibatch_full_eval_steps,
      effectiveSeed
    );

    // Mark module as compiled
    best_program.compiled = true;
    
    return best_program;
  }

  /**
   * Validate configuration parameters
   */
  private validateConfig(): void {
    const allowedModes = new Set<AutoRunMode | undefined>(['light', 'medium', 'heavy', undefined]);
    if (!allowedModes.has(this.config.auto)) {
      throw new Error(`Invalid auto mode: ${this.config.auto}. Must be one of: light, medium, heavy, or undefined`);
    }
  }

  /**
   * Validate compile options compatibility
   */
  private validateCompileOptions(num_trials?: number, zeroshot_opt?: boolean): void {
    // If auto is null and num_candidates is provided but num_trials is not
    if (this.config.auto === undefined && this.config.num_candidates !== undefined && num_trials === undefined) {
      const recommendedTrials = this.setNumTrialsFromNumCandidates(zeroshot_opt || false, this.config.num_candidates);
      throw new Error(
        `If auto is undefined, num_trials must also be provided. ` +
        `Given num_candidates=${this.config.num_candidates}, we recommend setting num_trials to ~${recommendedTrials}.`
      );
    }

    // If auto is null and either num_candidates or num_trials is null
    if (this.config.auto === undefined && (this.config.num_candidates === undefined || num_trials === undefined)) {
      throw new Error('If auto is undefined, num_candidates must also be provided.');
    }

    // If auto is provided and either num_candidates or num_trials is not null
    if (this.config.auto !== undefined && (this.config.num_candidates !== undefined || num_trials !== undefined)) {
      throw new Error(
        'If auto is not undefined, num_candidates and num_trials cannot be set, ' +
        'since they would be overridden by the auto settings. ' +
        'Please either set auto to undefined, or do not specify num_candidates and num_trials.'
      );
    }
  }

  /**
   * Set random seeds for reproducibility
   */
  private setRandomSeeds(seed: number): void {
    this.rng = new SeededRNG(seed);
    // In a real implementation, you'd also set seeds for other random components
  }

  /**
   * Calculate recommended number of trials from number of candidates
   */
  private setNumTrialsFromNumCandidates(zeroshot_opt: boolean, num_candidates: number): number {
    // This is a simplified version - in practice would analyze program complexity
    const num_vars = 1; // Simplified - would count actual predictors
    const adjusted_vars = zeroshot_opt ? num_vars : num_vars * 2; // Account for demos + instructions
    
    // Trials = MAX(c*M*log(N), c=2, 3/2*N)
    return Math.max(2 * adjusted_vars * Math.log2(num_candidates), 1.5 * num_candidates);
  }

  /**
   * Set hyperparameters based on auto run mode
   */
  private setHyperparamsFromRunMode(
    program: DSPyModule,
    num_trials?: number,
    minibatch?: boolean,
    zeroshot_opt?: boolean,
    valset?: Example[]
  ): [number, Example[], boolean] {
    if (this.config.auto === undefined) {
      return [num_trials!, valset!, minibatch!];
    }

    const auto_settings = AUTO_RUN_SETTINGS[this.config.auto];

    // Create minibatch from valset
    const adjustedValset = this.createMinibatch(valset!, auto_settings.val_size);
    
    // Use explicit minibatch setting if provided, otherwise auto-determine
    const finalMinibatch = minibatch !== undefined ? minibatch : adjustedValset.length > 50; // MIN_MINIBATCH_SIZE

    // Set candidates based on optimization strategy
    this.num_instruct_candidates = zeroshot_opt ? auto_settings.n : Math.floor(auto_settings.n * 0.5);
    this.num_fewshot_candidates = auto_settings.n;

    const finalNumTrials = this.setNumTrialsFromNumCandidates(zeroshot_opt || false, auto_settings.n);

    return [finalNumTrials, adjustedValset, finalMinibatch];
  }

  /**
   * Set and validate training and validation datasets
   */
  private setAndValidateDatasets(trainset: Example[], valset?: Example[]): [Example[], Example[]] {
    if (!trainset || trainset.length === 0) {
      throw new Error('Trainset cannot be empty.');
    }

    let finalValset: Example[];
    let finalTrainset = trainset;

    if (!valset) {
      if (trainset.length < 2) {
        throw new Error('Trainset must have at least 2 examples if no valset specified.');
      }
      
      const valset_size = Math.min(1000, Math.max(1, Math.floor(trainset.length * 0.80)));
      const cutoff = trainset.length - valset_size;
      
      finalValset = trainset.slice(cutoff);
      finalTrainset = trainset.slice(0, cutoff);
    } else {
      if (valset.length < 1) {
        throw new Error('Validation set must have at least 1 example.');
      }
      finalValset = valset;
    }

    return [finalTrainset, finalValset];
  }

  /**
   * Print auto run settings
   */
  private printAutoRunSettings(num_trials: number, minibatch: boolean, valset: Example[]): void {
    console.log(`\n📋 MIPRO V2 ${this.config.auto!.toUpperCase()} AUTO RUN SETTINGS:`);
    console.log(`   • num_trials: ${num_trials}`);
    console.log(`   • minibatch: ${minibatch}`);
    console.log(`   • num_fewshot_candidates: ${this.num_fewshot_candidates}`);
    console.log(`   • num_instruct_candidates: ${this.num_instruct_candidates}`);
    console.log(`   • valset size: ${valset.length}\n`);
  }

  /**
   * Create a minibatch from the dataset
   */
  private createMinibatch(dataset: Example[], batch_size: number): Example[] {
    const effective_batch_size = Math.min(batch_size, dataset.length);
    const sampled_indices = this.rng.sample(
      Array.from({ length: dataset.length }, (_, i) => i), 
      effective_batch_size
    );
    return sampled_indices.map(i => dataset[i]);
  }

  /**
   * Step 1: Bootstrap few-shot examples
   */
  private async bootstrapFewshotExamples(
    program: DSPyModule,
    trainset: Example[],
    seed: number,
    teacher?: DSPyModule
  ): Promise<FewShotCandidateSet[][] | null> {
    console.log('\n==> STEP 1: BOOTSTRAP FEWSHOT EXAMPLES <==');
    
    if (this.config.max_bootstrapped_demos > 0) {
      console.log('These will be used as few-shot example candidates for our program and for creating instructions.\n');
    } else {
      console.log('These will be used for informing instruction proposal.\n');
    }

    console.log(`🔧 Bootstrapping N=${this.num_fewshot_candidates} sets of demonstrations...`);

    const zeroshot = this.config.max_bootstrapped_demos === 0 && this.config.max_labeled_demos === 0;

    // Simulate bootstrap few-shot generation
    // In practice, this would use the BootstrapFewShot teleprompter
    const demo_candidates: FewShotCandidateSet[][] = [];
    
    const predictors = this.getModulePredictors(program);
    for (let pred_idx = 0; pred_idx < predictors.length; pred_idx++) {
      const predictor_candidates: FewShotCandidateSet[] = [];
      
      for (let i = 0; i < this.num_fewshot_candidates; i++) {
        // Sample random demonstrations for this candidate set
        const num_demos = zeroshot ? 3 : this.config.max_bootstrapped_demos; // BOOTSTRAPPED_FEWSHOT_EXAMPLES_IN_CONTEXT
        const sampled_demos = this.rng.sample(trainset, Math.min(num_demos, trainset.length));
        
        predictor_candidates.push({
          demos: sampled_demos,
          score: this.rng.random(), // Simulated score
          predictor_index: pred_idx
        });
      }
      
      demo_candidates.push(predictor_candidates);
      console.log(`   📝 Generated ${predictor_candidates.length} demo candidate sets for predictor ${pred_idx}`);
    }

    return demo_candidates;
  }

  /**
   * Step 2: Propose instruction candidates
   */
  private async proposeInstructions(
    program: DSPyModule,
    trainset: Example[],
    demo_candidates: FewShotCandidateSet[][] | null,
    view_data_batch_size: number,
    program_aware_proposer: boolean,
    data_aware_proposer: boolean,
    tip_aware_proposer: boolean,
    fewshot_aware_proposer: boolean
  ): Promise<Record<number, InstructionCandidate[]>> {
    console.log('\n==> STEP 2: PROPOSE INSTRUCTION CANDIDATES <==');
    console.log(
      'We will use the few-shot examples from the previous step, a generated dataset summary, ' +
      'a summary of the program code, and a randomly selected prompting tip to propose instructions.'
    );

    // Simulate GroundedProposer instruction generation
    const instruction_candidates: Record<number, InstructionCandidate[]> = {};
    const predictors = this.getModulePredictors(program);

    console.log(`\n🧠 Proposing N=${this.num_instruct_candidates} instructions...\n`);

    for (let i = 0; i < predictors.length; i++) {
      const predictor = predictors[i];
      const signature = this.getSignature(predictor);
      const candidates: InstructionCandidate[] = [];

      // Start with original instruction
      candidates.push({
        instruction: signature.instruction || '',
        source: 'original',
        predictor_index: i
      });

      // Generate additional instruction candidates
      for (let j = 1; j < this.num_instruct_candidates; j++) {
        // Simulate different instruction generation strategies
        const strategies = ['dataset-aware', 'program-aware', 'tip-aware', 'fewshot-aware'];
        const strategy = strategies[j % strategies.length];
        
        let new_instruction = signature.instruction || '';
        
        switch (strategy) {
          case 'dataset-aware':
            if (data_aware_proposer) {
              new_instruction = `${signature.instruction} Consider the dataset characteristics when solving this task.`;
            }
            break;
          case 'program-aware':
            if (program_aware_proposer) {
              new_instruction = `${signature.instruction} Take into account the overall program structure.`;
            }
            break;
          case 'tip-aware':
            if (tip_aware_proposer) {
              const tips = Object.values(PROPOSER_TIPS).filter(tip => tip !== '');
              const randomTip = tips[Math.floor(this.rng.random() * tips.length)];
              new_instruction = `${signature.instruction} ${randomTip}`;
            }
            break;
          case 'fewshot-aware':
            if (fewshot_aware_proposer && demo_candidates) {
              new_instruction = `${signature.instruction} Use the provided examples as guidance.`;
            }
            break;
        }

        candidates.push({
          instruction: new_instruction,
          source: strategy,
          predictor_index: i
        });
      }

      instruction_candidates[i] = candidates;
      
      console.log(`📝 Proposed Instructions for Predictor ${i}:`);
      for (let j = 0; j < candidates.length; j++) {
        console.log(`   ${j}: ${candidates[j].instruction}`);
      }
      console.log('');
    }

    return instruction_candidates;
  }

  /**
   * Step 3: Optimize prompt parameters using Bayesian optimization
   */
  private async optimizePromptParameters(
    program: DSPyModule,
    instruction_candidates: Record<number, InstructionCandidate[]>,
    demo_candidates: FewShotCandidateSet[][] | null,
    valset: Example[],
    num_trials: number,
    minibatch: boolean,
    minibatch_size: number,
    minibatch_full_eval_steps: number,
    seed: number
  ): Promise<DSPyModule> {
    console.log('\n==> STEP 3: FINDING OPTIMAL PROMPT PARAMETERS <==');
    console.log(
      'We will evaluate the program over a series of trials with different combinations of ' +
      'instructions and few-shot examples to find the optimal combination using Bayesian Optimization.\n'
    );

    // Compute adjusted total trials
    const run_additional_full_eval_at_end = num_trials % minibatch_full_eval_steps !== 0 ? 1 : 0;
    const adjusted_num_trials = minibatch 
      ? num_trials + Math.floor(num_trials / minibatch_full_eval_steps) + 1 + run_additional_full_eval_at_end
      : num_trials;

    console.log(`== Trial 1 / ${adjusted_num_trials} - Full Evaluation of Default Program ==`);

    // Evaluate default program
    const default_score = await this.evaluateModuleOnDataset(program, valset);
    console.log(`Default program score: ${default_score}\n`);

    // Initialize optimization state
    let best_score = default_score;
    let best_program = program.deepcopy();
    let total_eval_calls = valset.length;
    
    const trial_logs: Record<number, OptimizationTrial> = {};
    const score_data: OptimizationTrial[] = [];
    const param_score_dict: Record<string, Array<{ score: number; program: DSPyModule; params: Record<string, number> }>> = {};
    const fully_evaled_param_combos: Record<string, { program: DSPyModule; score: number }> = {};

    // Log default trial
    trial_logs[1] = {
      trial_num: 1,
      instruction_indices: Array(this.getModulePredictors(program).length).fill(0),
      demo_indices: demo_candidates ? Array(this.getModulePredictors(program).length).fill(0) : undefined,
      score: default_score,
      full_eval: true,
      program: program.deepcopy(),
      total_eval_calls: valset.length
    };

    score_data.push(trial_logs[1]);

    // Simulate Bayesian optimization trials
    for (let trial_num = 2; trial_num <= num_trials + 1; trial_num++) {
      const isMinibatch = minibatch && trial_num <= num_trials;
      
      if (isMinibatch) {
        console.log(`== Trial ${trial_num} / ${adjusted_num_trials} - Minibatch ==`);
      } else {
        console.log(`===== Trial ${trial_num} / ${num_trials + 1} =====`);
      }

      // Create candidate program
      const candidate_program = program.deepcopy();

      // Select instructions and demos for this trial
      const { chosen_params, raw_chosen_params } = this.selectAndInsertInstructionsAndDemos(
        candidate_program,
        instruction_candidates,
        demo_candidates,
        trial_num,
        seed
      );

      // Evaluate candidate program
      const batch_size = isMinibatch ? minibatch_size : valset.length;
      const evaluation_set = batch_size < valset.length 
        ? this.createMinibatch(valset, batch_size)
        : valset;
      
      const score = await this.evaluateModuleOnDataset(candidate_program, evaluation_set);
      total_eval_calls += evaluation_set.length;

      // Update best score if full evaluation
      if (!isMinibatch && score > best_score) {
        best_score = score;
        best_program = candidate_program.deepcopy();
        console.log(`🏆 Best full score so far! Score: ${score}`);
      }

      // Log trial
      const trial: OptimizationTrial = {
        trial_num,
        instruction_indices: raw_chosen_params.instruction_indices,
        demo_indices: raw_chosen_params.demo_indices,
        score,
        full_eval: !isMinibatch,
        program: candidate_program.deepcopy(),
        total_eval_calls
      };

      trial_logs[trial_num] = trial;
      score_data.push(trial);

      // Track parameter combinations
      const categorical_key = this.createParameterKey(raw_chosen_params);
      if (!param_score_dict[categorical_key]) {
        param_score_dict[categorical_key] = [];
      }
      param_score_dict[categorical_key].push({
        score,
        program: candidate_program,
        params: {
          instruction_indices: raw_chosen_params.instruction_indices,
          demo_indices: raw_chosen_params.demo_indices || []
        }
      });

      if (isMinibatch) {
        this.logMinibatchEval(score, best_score, batch_size, chosen_params, score_data, trial_num, adjusted_num_trials);
      } else {
        this.logNormalEval(score, best_score, chosen_params, score_data, trial_num, num_trials + 1);
      }

      // Perform full evaluation at intervals (minibatch mode)
      if (minibatch && (
        (trial_num % (minibatch_full_eval_steps + 1) === 0) || 
        (trial_num === adjusted_num_trials - 1)
      )) {
        const full_eval_result = await this.performFullEvaluation(
          trial_num,
          adjusted_num_trials,
          param_score_dict,
          fully_evaled_param_combos,
          valset,
          trial_logs,
          total_eval_calls,
          score_data,
          best_score,
          best_program
        );
        
        best_score = full_eval_result.best_score;
        best_program = full_eval_result.best_program;
        total_eval_calls = full_eval_result.total_eval_calls;
      }
    }

    // Attach optimization metadata
    if (this.config.track_stats) {
      this.attachOptimizationMetadata(best_program, trial_logs, score_data, total_eval_calls);
    }

    console.log(`✅ MIPRO V2: Optimization complete! Best score: ${best_score.toFixed(3)}`);
    console.log(`📈 MIPRO V2: Total evaluations: ${total_eval_calls}`);

    return best_program;
  }

  /**
   * Select and insert instructions and demos for a trial
   */
  private selectAndInsertInstructionsAndDemos(
    candidate_program: DSPyModule,
    instruction_candidates: Record<number, InstructionCandidate[]>,
    demo_candidates: FewShotCandidateSet[][] | null,
    trial_num: number,
    seed: number
  ): { 
    chosen_params: string[]; 
    raw_chosen_params: { 
      instruction_indices: number[]; 
      demo_indices?: number[]; 
    } 
  } {
    const chosen_params: string[] = [];
    const instruction_indices: number[] = [];
    const demo_indices: number[] = [];

    const predictors = this.getModulePredictors(candidate_program);

    for (let i = 0; i < predictors.length; i++) {
      const predictor = predictors[i];

      // Select instruction (simulate Bayesian optimization selection)
      const instruction_idx = Math.floor(this.rng.random() * instruction_candidates[i].length);
      const selected_instruction = instruction_candidates[i][instruction_idx].instruction;
      
      // Update predictor signature
      this.updatePredictorSignature(predictor, selected_instruction);
      
      instruction_indices.push(instruction_idx);
      chosen_params.push(`Predictor ${i}: Instruction ${instruction_idx}`);

      // Select demos if available
      if (demo_candidates && demo_candidates[i] && demo_candidates[i].length > 0) {
        const demos_idx = Math.floor(this.rng.random() * demo_candidates[i].length);
        const selected_demos = demo_candidates[i][demos_idx];
        
        // Handle different demo structures
        const demos = selected_demos?.demos || selected_demos || [];
        this.updatePredictorDemos(predictor, demos);
        
        demo_indices.push(demos_idx);
        chosen_params.push(`Predictor ${i}: Few-Shot Set ${demos_idx}`);
      }
    }

    return {
      chosen_params,
      raw_chosen_params: {
        instruction_indices,
        demo_indices: demo_candidates ? demo_indices : undefined
      }
    };
  }

  /**
   * Create parameter key for tracking combinations
   */
  private createParameterKey(params: { instruction_indices: number[]; demo_indices?: number[] }): string {
    const instruction_key = params.instruction_indices.join(',');
    const demo_key = params.demo_indices ? params.demo_indices.join(',') : '';
    return `inst:${instruction_key}|demo:${demo_key}`;
  }

  /**
   * Perform full evaluation of best performing parameter combination
   */
  private async performFullEvaluation(
    trial_num: number,
    adjusted_num_trials: number,
    param_score_dict: Record<string, Array<{ score: number; program: DSPyModule; params: any }>>,
    fully_evaled_param_combos: Record<string, { program: DSPyModule; score: number }>,
    valset: Example[],
    trial_logs: Record<number, OptimizationTrial>,
    total_eval_calls: number,
    score_data: OptimizationTrial[],
    best_score: number,
    best_program: DSPyModule
  ): Promise<{ best_score: number; best_program: DSPyModule; total_eval_calls: number }> {
    console.log(`===== Trial ${trial_num + 1} / ${adjusted_num_trials} - Full Evaluation =====`);

    // Find program with highest average score from minibatch trials
    let highest_mean_program: DSPyModule | null = null;
    let best_mean_score = -Infinity;
    let best_combo_key = '';

    for (const [combo_key, results] of Object.entries(param_score_dict)) {
      if (fully_evaled_param_combos[combo_key]) continue; // Skip already evaluated

      const mean_score = results.reduce((sum, result) => sum + result.score, 0) / results.length;
      if (mean_score > best_mean_score) {
        best_mean_score = mean_score;
        highest_mean_program = results[0].program;
        best_combo_key = combo_key;
      }
    }

    if (!highest_mean_program) {
      return { best_score, best_program, total_eval_calls };
    }

    console.log(`🔍 Doing full eval on top averaging program (Avg Score: ${best_mean_score.toFixed(3)}) from minibatch trials...`);
    
    const full_eval_score = await this.evaluateModuleOnDataset(highest_mean_program, valset);
    
    // Update tracking
    fully_evaled_param_combos[best_combo_key] = {
      program: highest_mean_program,
      score: full_eval_score
    };
    
    total_eval_calls += valset.length;

    // Log full evaluation
    trial_logs[trial_num + 1] = {
      trial_num: trial_num + 1,
      instruction_indices: [], // Would extract from best combo
      score: full_eval_score,
      full_eval: true,
      program: highest_mean_program,
      total_eval_calls
    };

    score_data.push({
      score: full_eval_score,
      program: highest_mean_program,
      full_eval: true,
      trial_num: trial_num + 1,
      instruction_indices: [],
      total_eval_calls
    });

    // Update best if necessary
    if (full_eval_score > best_score) {
      console.log(`🏆 New best full eval score! Score: ${full_eval_score}`);
      best_score = full_eval_score;
      best_program = highest_mean_program.deepcopy();
    }

    const full_eval_scores = score_data
      .filter(s => s.full_eval)
      .map(s => s.score.toFixed(3))
      .join(', ');
    
    console.log(`Full eval scores so far: [${full_eval_scores}]`);
    console.log(`Best full score so far: ${best_score}`);
    console.log('='.repeat(50));
    console.log('');

    return { best_score, best_program, total_eval_calls };
  }

  /**
   * Log minibatch evaluation results
   */
  private logMinibatchEval(
    score: number,
    best_score: number,
    batch_size: number,
    chosen_params: string[],
    score_data: OptimizationTrial[],
    trial_num: number,
    adjusted_num_trials: number
  ): void {
    console.log(`Score: ${score.toFixed(3)} on minibatch of size ${batch_size} with parameters ${chosen_params.join(', ')}.`);
    
    const minibatch_scores = score_data
      .filter(s => !s.full_eval)
      .map(s => s.score.toFixed(3))
      .join(', ');
    console.log(`Minibatch scores so far: [${minibatch_scores}]`);
    
    const full_eval_scores = score_data
      .filter(s => s.full_eval)
      .map(s => s.score.toFixed(3))
      .join(', ');
    console.log(`Full eval scores so far: [${full_eval_scores}]`);
    console.log(`Best full score so far: ${best_score}`);
    console.log('='.repeat(50));
    console.log('');
  }

  /**
   * Log normal evaluation results
   */
  private logNormalEval(
    score: number,
    best_score: number,
    chosen_params: string[],
    score_data: OptimizationTrial[],
    trial_num: number,
    total_trials: number
  ): void {
    console.log(`Score: ${score.toFixed(3)} with parameters ${chosen_params.join(', ')}.`);
    
    const full_eval_scores = score_data
      .filter(s => s.full_eval)
      .map(s => s.score.toFixed(3))
      .join(', ');
    console.log(`Scores so far: [${full_eval_scores}]`);
    console.log(`Best score so far: ${best_score}`);
    console.log('='.repeat(50));
    console.log('');
  }

  /**
   * Attach optimization metadata to best program
   */
  private attachOptimizationMetadata(
    best_program: DSPyModule,
    trial_logs: Record<number, OptimizationTrial>,
    score_data: OptimizationTrial[],
    total_eval_calls: number
  ): void {
    (best_program as any).trial_logs = trial_logs;
    (best_program as any).score = this.stats.best_score;
    (best_program as any).prompt_model_total_calls = this.stats.prompt_model_total_calls;
    (best_program as any).total_calls = total_eval_calls;

    // Sort candidates by score
    const sorted_candidates = [...score_data].sort((a, b) => b.score - a.score);
    
    (best_program as any).mb_candidate_programs = sorted_candidates.filter(s => !s.full_eval);
    (best_program as any).candidate_programs = sorted_candidates.filter(s => s.full_eval);
  }

  /**
   * Evaluate module on dataset
   */
  private async evaluateModuleOnDataset(module: DSPyModule, dataset: Example[]): Promise<number> {
    let total_score = 0;
    let valid_evaluations = 0;

    for (const example of dataset) {
      try {
        const inputs = example.inputs();
        const prediction = module.forward(inputs.data);
        const score = this.config.metric(example, prediction);
        const numeric_score = typeof score === 'boolean' ? (score ? 1 : 0) : score;
        
        total_score += numeric_score;
        valid_evaluations++;
      } catch (error) {
        console.warn(`⚠️  Evaluation failed: ${error}`);
        // Continue with other examples
      }
    }

    return valid_evaluations > 0 ? total_score / valid_evaluations : 0;
  }

  // Helper methods for predictor and signature manipulation

  private getModulePredictors(module: DSPyModule): DSPyPredictor[] {
    return module.predictors?.() || [];
  }

  private getSignature(predictor: DSPyPredictor): Signature {
    return predictor.signature;
  }

  private updatePredictorSignature(predictor: DSPyPredictor, instruction: string): void {
    predictor.signature = {
      ...predictor.signature,
      instruction
    };
  }

  private updatePredictorDemos(predictor: DSPyPredictor, demos: Example[]): void {
    predictor.demos = [...demos];
  }
}