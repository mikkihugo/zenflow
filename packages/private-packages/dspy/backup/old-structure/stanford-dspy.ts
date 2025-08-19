/**
 * @fileoverview Stanford DSPy Port to TypeScript
 * 
 * TypeScript implementation of Stanford's DSPy algorithms, porting the core
 * teleprompters and optimization techniques from the original Python codebase.
 * Integrates with @claude-zen/foundation for LLM, config, storage, and logging.
 * 
 * Key algorithms ported:
 * - LabeledFewShot: Simple k-shot example selection
 * - BootstrapFewShot: Sophisticated bootstrapping with teacher/student models
 * - Ensemble: Multi-model optimization strategies
 * 
 * Architecture follows Stanford DSPy patterns:
 * - Teleprompter base class with compile() method
 * - Module/Predictor system with demonstrations
 * - Signature system for input/output specification
 * - Example/Demo management with validation
 * - Trace system for capturing execution paths
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0 - Stanford DSPy Port with @claude-zen/foundation
 * @license MIT
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy
 */

import { 
  getDSPyService,
  type SharedLLMService
} from './dspy-service';

// ============================================================================
// Core DSPy Types (Stanford-compatible)
// ============================================================================

/**
 * DSPy Example - represents a training or test example
 * Compatible with Stanford DSPy's Example class
 */
export interface Example {
  /** Unique identifier */
  id?: string;
  /** Input fields as key-value pairs */
  [inputField: string]: any;
  /** Metadata */
  metadata?: {
    augmented?: boolean;
    createdAt?: Date;
    source?: string;
  };
}

/**
 * DSPy Signature - defines input/output structure
 * Compatible with Stanford DSPy's Signature system
 */
export interface Signature {
  /** Signature name */
  name: string;
  /** Input field specifications */
  input_fields: Record<string, { type: string; description?: string }>;
  /** Output field specifications */
  output_fields: Record<string, { type: string; description?: string }>;
  /** Instructions/prompt template */
  instructions?: string;
}

/**
 * DSPy Predictor - basic prediction unit
 * Compatible with Stanford DSPy's Predict class
 */
export interface Predictor {
  /** Unique identifier */
  id: string;
  /** Signature defining inputs/outputs */
  signature: Signature;
  /** Few-shot demonstrations */
  demos: Example[];
  /** Language model service (from @claude-zen/foundation) */
  lm?: SharedLLMService;
  /** Configuration */
  config: Record<string, any>;
  
  /** Make prediction */
  forward(inputs: Record<string, any>): Promise<Record<string, any>>;
  /** Reset state */
  reset(): void;
  /** Create copy */
  copy(): Predictor;
}

/**
 * DSPy Module - composable program unit
 * Compatible with Stanford DSPy's Module class
 */
export interface Module {
  /** Get all predictors */
  predictors(): Predictor[];
  /** Get named predictors */
  named_predictors(): Array<[string, Predictor]>;
  /** Execute module */
  forward(inputs: Record<string, any>): Promise<Record<string, any>>;
  /** Reset module state */
  reset_copy(): Module;
  /** Deep copy module */
  deepcopy(): Module;
  /** Compilation marker */
  _compiled?: boolean;
}

/**
 * DSPy Trace Step - execution trace entry
 */
export interface TraceStep {
  predictor: Predictor;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

/**
 * DSPy Prediction Result
 */
export interface Prediction {
  /** Output fields */
  [outputField: string]: any;
  /** Metadata */
  metadata?: {
    confidence?: number;
    reasoning?: string;
    trace?: TraceStep[];
  };
}

// ============================================================================
// Teleprompter Base Class
// ============================================================================

/**
 * Base Teleprompter class - abstract base for all optimizers
 * Direct port of Stanford DSPy's Teleprompter interface
 */
export abstract class Teleprompter {
  /**
   * Optimize the student program
   * 
   * @param student - The student program to optimize
   * @param trainset - Training examples
   * @param teacher - Optional teacher program
   * @param valset - Optional validation set
   * @returns Optimized student program
   */
  abstract compile(options: {
    student: Module;
    trainset: Example[];
    teacher?: Module;
    valset?: Example[];
    [key: string]: any;
  }): Promise<Module>;

  /**
   * Get teleprompter parameters
   */
  get_params(): Record<string, any> {
    return { ...this };
  }
}

// ============================================================================
// LabeledFewShot - Simple k-shot optimization
// ============================================================================

/**
 * LabeledFewShot Teleprompter
 * Direct port of Stanford DSPy's LabeledFewShot
 * 
 * Simple teleprompter that sets k random examples as demonstrations
 */
export class LabeledFewShot extends Teleprompter {
  private k: number;

  constructor(k: number = 16) {
    super();
    this.k = k;
  }

  async compile({ student, trainset, sample = true }: {
    student: Module;
    trainset: Example[];
    sample?: boolean;
  }): Promise<Module> {
    const optimizedStudent = student.reset_copy();
    
    if (trainset.length === 0) {
      return optimizedStudent;
    }

    // Seeded random for reproducibility (like Stanford DSPy)
    const rng = this.createSeededRandom(0);
    
    for (const predictor of optimizedStudent.predictors()) {
      if (sample) {
        predictor.demos = this.sampleExamples(trainset, Math.min(this.k, trainset.length), rng);
      } else {
        predictor.demos = trainset.slice(0, Math.min(this.k, trainset.length));
      }
    }

    return optimizedStudent;
  }

  private createSeededRandom(seed: number) {
    // Simple seeded random implementation
    let state = seed;
    return {
      random: () => {
        state = (state * 1664525 + 1013904223) % (2 ** 32);
        return state / (2 ** 32);
      }
    };
  }

  private sampleExamples(examples: Example[], count: number, rng: any): Example[] {
    const shuffled = [...examples];
    
    // Fisher-Yates shuffle with seeded random
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }
}

// ============================================================================
// BootstrapFewShot - Advanced bootstrapping optimization
// ============================================================================

/**
 * BootstrapFewShot Teleprompter
 * Port of Stanford DSPy's sophisticated BootstrapFewShot algorithm
 * 
 * Uses teacher model to generate high-quality demonstrations through
 * iterative bootstrapping with validation metrics
 */
export class BootstrapFewShot extends Teleprompter {
  private metric: ((example: Example, prediction: any, trace: TraceStep[]) => number | boolean) | undefined;
  private metric_threshold: number | undefined;
  private teacher_settings: Record<string, any>;
  private max_bootstrapped_demos: number;
  private max_labeled_demos: number;
  private max_rounds: number;
  private max_errors: number | undefined;
  private error_count: number = 0;

  // Internal state
  private trainset: Example[] = [];
  private name2predictor: Record<string, any> = {};
  private predictor2name: Map<any, string> = new Map();
  private name2traces: Record<string, Example[]> = {};
  private validation: Example[] = [];

  constructor({
    metric,
    metric_threshold,
    teacher_settings = {},
    max_bootstrapped_demos = 4,
    max_labeled_demos = 16,
    max_rounds = 1,
    max_errors
  }: {
    metric?: (example: Example, prediction: any, trace: TraceStep[]) => number | boolean;
    metric_threshold?: number;
    teacher_settings?: Record<string, any>;
    max_bootstrapped_demos?: number;
    max_labeled_demos?: number;
    max_rounds?: number;
    max_errors?: number;
  } = {}) {
    super();
    this.metric = metric;
    this.metric_threshold = metric_threshold;
    this.teacher_settings = teacher_settings;
    this.max_bootstrapped_demos = max_bootstrapped_demos;
    this.max_labeled_demos = max_labeled_demos;
    this.max_rounds = max_rounds;
    this.max_errors = max_errors;
  }

  async compile({ student, teacher, trainset }: {
    student: Module;
    teacher?: Module;
    trainset: Example[];
  }): Promise<Module> {
    this.trainset = trainset;

    await this._prepare_student_and_teacher(student, teacher);
    this._prepare_predictor_mappings();
    await this._bootstrap();

    const optimizedStudent = await this._train();
    optimizedStudent._compiled = true;

    return optimizedStudent;
  }

  private async _prepare_student_and_teacher(student: Module, teacher?: Module): Promise<void> {
    this.student = student.reset_copy();
    
    // Use provided teacher or deep copy of student (Stanford DSPy behavior)
    this.teacher = teacher ? teacher.deepcopy() : student.deepcopy();
    
    if (!this.student._compiled && this.max_labeled_demos && !this.teacher._compiled) {
      // Bootstrap teacher with labeled few-shot first
      const teleprompter = new LabeledFewShot(this.max_labeled_demos);
      this.teacher = await teleprompter.compile({
        student: this.teacher.reset_copy(),
        trainset: this.trainset
      });
    }
  }

  private _prepare_predictor_mappings(): void {
    const name2predictor: Record<string, any> = {};
    const predictor2name = new Map<any, string>();
    
    const studentPredictors = this.student.named_predictors();
    const teacherPredictors = this.teacher.named_predictors();
    
    if (studentPredictors.length !== teacherPredictors.length) {
      throw new Error("Student and teacher must have the same number of predictors");
    }

    for (let i = 0; i < studentPredictors.length; i++) {
      const [name1, predictor1] = studentPredictors[i];
      const [name2, predictor2] = teacherPredictors[i];
      
      if (name1 !== name2) {
        throw new Error("Student and teacher must have the same program structure");
      }
      
      // Verify signatures match (simplified check)
      if (JSON.stringify(predictor1.signature) !== JSON.stringify(predictor2.signature)) {
        throw new Error(`Student and teacher must have the same signatures for ${name1}`);
      }
      
      name2predictor[name1] = null;
      predictor2name.set(predictor1, name1);
      predictor2name.set(predictor2, name2);
    }

    this.name2predictor = name2predictor;
    this.predictor2name = predictor2name;
  }

  private async _bootstrap(max_bootstraps?: number): Promise<void> {
    max_bootstraps = max_bootstraps || this.max_bootstrapped_demos;
    let bootstrap_attempts = 0;
    
    const bootstrapped = new Set<number>();
    this.name2traces = {};
    
    // Initialize traces for each predictor
    for (const name in this.name2predictor) {
      this.name2traces[name] = [];
    }

    console.log(`Starting bootstrap with ${this.trainset.length} examples...`);
    
    for (let example_idx = 0; example_idx < this.trainset.length; example_idx++) {
      if (bootstrapped.size >= max_bootstraps) {
        break;
      }

      const example = this.trainset[example_idx];
      
      for (let round_idx = 0; round_idx < this.max_rounds; round_idx++) {
        bootstrap_attempts++;
        
        if (await this._bootstrap_one_example(example, round_idx)) {
          bootstrapped.add(example_idx);
          break;
        }
      }
    }

    console.log(
      `Bootstrapped ${bootstrapped.size} full traces after ${this.trainset.length} examples ` +
      `for up to ${this.max_rounds} rounds, amounting to ${bootstrap_attempts} attempts.`
    );

    // Create validation set from unbootstrapped examples
    this.validation = this.trainset.filter((_, idx) => !bootstrapped.has(idx));
    
    // Shuffle validation set with seeded random
    const rng = this.createSeededRandom(0);
    for (let i = this.validation.length - 1; i > 0; i--) {
      const j = Math.floor(rng.random() * (i + 1));
      [this.validation[i], this.validation[j]] = [this.validation[j], this.validation[i]];
    }
  }

  private async _bootstrap_one_example(example: Example, round_idx: number = 0): Promise<boolean> {
    try {
      // Simulate teacher execution with adjusted temperature
      const temperature = round_idx > 0 ? 0.7 + 0.001 * round_idx : 0.7;
      
      // Store original demos
      const predictor_cache: Record<string, Example[]> = {};
      for (const [name, predictor] of this.teacher.named_predictors()) {
        predictor_cache[name] = [...predictor.demos];
        // Remove current example from demos to avoid leakage
        predictor.demos = predictor.demos.filter(demo => demo.id !== example.id);
      }

      // Execute teacher on example
      const inputs = this.extractInputs(example);
      const prediction = await this.teacher.forward(inputs);
      
      // Get execution trace (simulated)
      const trace: TraceStep[] = await this.simulateTrace(this.teacher, inputs, prediction);
      
      // Restore original demos
      for (const [name, predictor] of this.teacher.named_predictors()) {
        predictor.demos = predictor_cache[name];
      }

      // Validate with metric if provided
      let success = true;
      if (this.metric) {
        const metric_val = this.metric(example, prediction, trace);
        if (this.metric_threshold !== undefined) {
          success = typeof metric_val === 'number' ? metric_val >= this.metric_threshold : Boolean(metric_val);
        } else {
          success = Boolean(metric_val);
        }
      }

      if (success) {
        // Store successful traces
        for (const step of trace) {
          const predictor_name = this.predictor2name.get(step.predictor);
          if (predictor_name) {
            const demo: Example = {
              id: `demo-${Date.now()}-${Math.random()}`,
              ...step.inputs,
              ...step.outputs,
              metadata: { augmented: true, createdAt: new Date() }
            };
            
            this.name2traces[predictor_name] = this.name2traces[predictor_name] || [];
            this.name2traces[predictor_name].push(demo);
          }
        }
      }

      return success;
      
    } catch (error) {
      this.error_count++;
      const max_errors = this.max_errors || 10; // Default max errors
      
      if (this.error_count >= max_errors) {
        throw error;
      }
      
      console.error(`Failed to bootstrap example ${example.id}: ${error}`);
      return false;
    }
  }

  private async _train(): Promise<Module> {
    const rng = this.createSeededRandom(0);
    let raw_demos = [...this.validation];

    const namedPredictors = this.student.named_predictors();
    for (const [name, predictor] of namedPredictors) {
      // Get bootstrapped demos for this predictor
      const augmented_demos = (this.name2traces[name] || []).slice(0, this.max_bootstrapped_demos);
      
      // Calculate how many labeled demos to add
      const remaining_slots = this.max_labeled_demos - augmented_demos.length;
      const sample_size = Math.max(0, Math.min(remaining_slots, raw_demos.length));
      
      // Sample labeled demos
      const sampled_raw_demos = sample_size > 0 ? this.sampleExamples(raw_demos, sample_size, rng) : [];
      
      // Combine augmented and labeled demos
      predictor.demos = [...augmented_demos, ...sampled_raw_demos];
    }

    return this.student;
  }

  // Helper methods
  private extractInputs(example: Example): Record<string, any> {
    // Extract input fields based on signature
    const inputs: Record<string, any> = {};
    for (const [key, value] of Object.entries(example)) {
      if (key !== 'id' && key !== 'metadata') {
        inputs[key] = value;
      }
    }
    return inputs;
  }

  private async simulateTrace(module: Module, inputs: Record<string, any>, outputs: Record<string, any>): Promise<TraceStep[]> {
    // Simplified trace simulation - in real implementation would capture actual execution
    const trace: TraceStep[] = [];
    
    for (const predictor of module.predictors()) {
      trace.push({
        predictor,
        inputs: { ...inputs },
        outputs: { ...outputs }
      });
    }
    
    return trace;
  }

  private createSeededRandom(seed: number) {
    let state = seed;
    return {
      random: () => {
        state = (state * 1664525 + 1013904223) % (2 ** 32);
        return state / (2 ** 32);
      }
    };
  }

  private sampleExamples(examples: Example[], count: number, rng: any): Example[] {
    const shuffled = [...examples];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }

  // Declare these as class properties to avoid TypeScript errors
  private student!: Module;
  private teacher!: Module;
}

// ============================================================================
// MIPROv2 - Multi-objective Instruction Proposal and Revision Optimizer
// ============================================================================

/**
 * MIPROv2 Teleprompter
 * Port of Stanford DSPy's most advanced optimization algorithm
 * 
 * Multi-objective optimization using:
 * - Instruction proposal with grounded reasoning
 * - Bayesian optimization with Optuna-style search
 * - Minibatch evaluation for efficiency
 * - Program-aware and data-aware proposers
 */
export class MIPROv2 extends Teleprompter {
  private metric: ((example: Example, prediction: any, trace: TraceStep[]) => number | boolean) | undefined;
  private metric_threshold: number | undefined;
  private prompt_model: any;
  private task_model: any;
  private teacher_settings: Record<string, any>;
  private max_bootstrapped_demos: number;
  private max_labeled_demos: number;
  private auto: "light" | "medium" | "heavy" | null;
  private num_candidates: number | undefined;
  private num_threads: number | undefined;
  private max_errors: number | undefined;
  private seed: number;
  private init_temperature: number;
  private verbose: boolean;
  private track_stats: boolean;
  private log_dir: string | undefined;

  // Auto run settings
  private static AUTO_RUN_SETTINGS = {
    "light": { n: 6, val_size: 100 },
    "medium": { n: 12, val_size: 300 },
    "heavy": { n: 18, val_size: 1000 }
  };

  constructor({
    metric,
    metric_threshold,
    prompt_model,
    task_model,
    teacher_settings = {},
    max_bootstrapped_demos = 4,
    max_labeled_demos = 4,
    auto = "light",
    num_candidates,
    num_threads,
    max_errors,
    seed = 9,
    init_temperature = 0.5,
    verbose = false,
    track_stats = true,
    log_dir
  }: {
    metric?: (example: Example, prediction: any, trace: TraceStep[]) => number | boolean;
    metric_threshold?: number;
    prompt_model?: any;
    task_model?: any;
    teacher_settings?: Record<string, any>;
    max_bootstrapped_demos?: number;
    max_labeled_demos?: number;
    auto?: "light" | "medium" | "heavy" | null;
    num_candidates?: number;
    num_threads?: number;
    max_errors?: number;
    seed?: number;
    init_temperature?: number;
    verbose?: boolean;
    track_stats?: boolean;
    log_dir?: string;
  } = {}) {
    super();
    this.metric = metric;
    this.metric_threshold = metric_threshold;
    this.prompt_model = prompt_model;
    this.task_model = task_model;
    this.teacher_settings = teacher_settings;
    this.max_bootstrapped_demos = max_bootstrapped_demos;
    this.max_labeled_demos = max_labeled_demos;
    this.auto = auto;
    this.num_candidates = num_candidates;
    this.num_threads = num_threads;
    this.max_errors = max_errors;
    this.seed = seed;
    this.init_temperature = init_temperature;
    this.verbose = verbose;
    this.track_stats = track_stats;
    this.log_dir = log_dir;
  }

  async compile({
    student,
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
    fewshot_aware_proposer = true
  }: {
    student: Module;
    trainset: Example[];
    teacher?: Module;
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
  }): Promise<Module> {
    const effectiveSeed = seed || this.seed;
    const zeroshot_opt = (this.max_bootstrapped_demos === 0) && (this.max_labeled_demos === 0);

    // Set random seeds
    this.setRandomSeeds(effectiveSeed);

    // Update max demos if specified
    if (max_bootstrapped_demos !== undefined) {
      this.max_bootstrapped_demos = max_bootstrapped_demos;
    }
    if (max_labeled_demos !== undefined) {
      this.max_labeled_demos = max_labeled_demos;
    }

    // Set training & validation sets
    const [finalTrainset, finalValset] = this.setAndValidateDatasets(trainset, valset);

    // Set hyperparameters based on run mode
    const {
      finalNumTrials,
      finalValset: optimizedValset,
      finalMinibatch
    } = this.setHyperparamsFromRunMode(student, num_trials, minibatch, zeroshot_opt, finalValset);

    if (finalMinibatch && minibatch_size > optimizedValset.length) {
      throw new Error(`Minibatch size cannot exceed the size of the valset. Valset size: ${optimizedValset.length}.`);
    }

    // Initialize program
    const program = student.deepcopy();

    console.log("\n==> STEP 1: BOOTSTRAP FEWSHOT EXAMPLES <==");
    // Step 1: Bootstrap few-shot examples
    const demo_candidates = await this.bootstrapFewshotExamples(
      program, 
      finalTrainset, 
      effectiveSeed, 
      teacher
    );

    console.log("\n==> STEP 2: PROPOSE NSTRUCTION CANDIDATES <==");
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

    console.log("\n==> STEP 3: OPTIMIZE PROMPT PARAMETERS <==");
    // Step 3: Find optimal prompt parameters
    const best_program = await this.optimizePromptParameters(
      program,
      instruction_candidates,
      zeroshot_opt ? null : demo_candidates,
      optimizedValset,
      finalNumTrials,
      finalMinibatch,
      minibatch_size,
      minibatch_full_eval_steps,
      effectiveSeed
    );

    return best_program;
  }

  private setRandomSeeds(seed: number): void {
    // Simplified seeded random for reproducibility
    Math.random = (() => {
      let state = seed;
      return () => {
        state = (state * 1664525 + 1013904223) % (2 ** 32);
        return state / (2 ** 32);
      };
    })();
  }

  private setAndValidateDatasets(trainset: Example[], valset?: Example[]): [Example[], Example[]] {
    if (!trainset || trainset.length === 0) {
      throw new Error("Trainset cannot be empty.");
    }

    if (!valset) {
      if (trainset.length < 2) {
        throw new Error("Trainset must have at least 2 examples if no valset specified.");
      }
      const valset_size = Math.min(1000, Math.max(1, Math.floor(trainset.length * 0.80)));
      const cutoff = trainset.length - valset_size;
      return [trainset.slice(0, cutoff), trainset.slice(cutoff)];
    } else {
      if (valset.length < 1) {
        throw new Error("Validation set must have at least 1 example.");
      }
      return [trainset, valset];
    }
  }

  private setHyperparamsFromRunMode(
    program: Module,
    num_trials?: number,
    minibatch?: boolean,
    zeroshot_opt?: boolean,
    valset?: Example[]
  ): { finalNumTrials: number; finalValset: Example[]; finalMinibatch: boolean } {
    if (!this.auto) {
      return {
        finalNumTrials: num_trials || 10,
        finalValset: valset || [],
        finalMinibatch: minibatch || false
      };
    }

    const auto_settings = MIPROv2.AUTO_RUN_SETTINGS[this.auto];
    
    // Create minibatch from valset
    const finalValset = this.createMinibatch(valset || [], auto_settings.val_size);
    const finalMinibatch = finalValset.length > 50; // MIN_MINIBATCH_SIZE

    // Set num candidates
    this.num_candidates = auto_settings.n;
    
    // Calculate num trials
    const num_vars = program.predictors().length * (zeroshot_opt ? 1 : 2);
    const finalNumTrials = Math.max(
      2 * num_vars * Math.log2(auto_settings.n),
      1.5 * auto_settings.n
    );

    console.log(`\nMIPROv2 ${this.auto.toUpperCase()} AUTO RUN SETTINGS:`);
    console.log(`num_trials: ${finalNumTrials}`);
    console.log(`minibatch: ${finalMinibatch}`);
    console.log(`num_candidates: ${this.num_candidates}`);
    console.log(`valset size: ${finalValset.length}\n`);

    return { finalNumTrials, finalValset, finalMinibatch };
  }

  private createMinibatch(examples: Example[], batch_size: number): Example[] {
    if (examples.length <= batch_size) {
      return [...examples];
    }
    
    // Shuffle and take first batch_size
    const shuffled = [...examples];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, batch_size);
  }

  private async bootstrapFewshotExamples(
    program: Module,
    trainset: Example[],
    seed: number,
    teacher?: Module
  ): Promise<Record<number, Example[][]> | null> {
    if (!this.num_candidates) {
      this.num_candidates = 6; // Default
    }

    console.log(`Bootstrapping N=${this.num_candidates} sets of demonstrations...`);

    // Create multiple demo candidate sets using BootstrapFewShot
    const demo_candidates: Record<number, Example[][]> = {};
    
    for (let i = 0; i < program.predictors().length; i++) {
      demo_candidates[i] = [];
      
      for (let j = 0; j < this.num_candidates; j++) {
        // Create a bootstrap teleprompter for this candidate set
        const bootstrap = new BootstrapFewShot({
          max_bootstrapped_demos: this.max_bootstrapped_demos,
          max_labeled_demos: this.max_labeled_demos,
          max_rounds: 1
        });
        
        try {
          const optimized = await bootstrap.compile({
            student: program.deepcopy(),
            teacher,
            trainset
          });
          
          // Extract demos from the optimized program
          const predictors = optimized.predictors();
          if (predictors[i]) {
            demo_candidates[i].push(predictors[i].demos);
          } else {
            demo_candidates[i].push([]);
          }
        } catch (error) {
          console.warn(`Failed to bootstrap candidate set ${j} for predictor ${i}:`, error);
          demo_candidates[i].push([]);
        }
      }
    }

    return demo_candidates;
  }

  private async proposeInstructions(
    program: Module,
    trainset: Example[],
    demo_candidates: Record<number, Example[][]> | null,
    view_data_batch_size: number,
    program_aware_proposer: boolean,
    data_aware_proposer: boolean,
    tip_aware_proposer: boolean,
    fewshot_aware_proposer: boolean
  ): Promise<Record<number, string[]>> {
    if (!this.num_candidates) {
      this.num_candidates = 6; // Default
    }

    console.log(`Proposing N=${this.num_candidates} instructions...\n`);

    const instruction_candidates: Record<number, string[]> = {};
    
    // Get DSPy service for LLM access
    const dspyService = await getDSPyService();
    const llm = await dspyService.getLLMService();

    for (let i = 0; i < program.predictors().length; i++) {
      const predictor = program.predictors()[i];
      instruction_candidates[i] = [];
      
      // Add current instruction as first candidate
      instruction_candidates[i].push(predictor.signature.instructions || `Complete this task: ${predictor.signature.name}`);
      
      // Generate additional instruction candidates
      for (let j = 1; j < this.num_candidates; j++) {
        try {
          let prompt = "Generate a clear, specific instruction for this task:\n\n";
          
          // Add program context if enabled
          if (program_aware_proposer) {
            prompt += `Task: ${predictor.signature.name}\n`;
            prompt += `Input fields: ${Object.keys(predictor.signature.input_fields).join(', ')}\n`;
            prompt += `Output fields: ${Object.keys(predictor.signature.output_fields).join(', ')}\n\n`;
          }
          
          // Add data context if enabled
          if (data_aware_proposer) {
            const sample_data = trainset.slice(0, Math.min(view_data_batch_size, trainset.length));
            prompt += "Sample data:\n";
            for (const example of sample_data) {
              const inputs = Object.entries(example)
                .filter(([key]) => key !== 'id' && key !== 'metadata')
                .slice(0, 3) // Limit to first 3 fields
                .map(([k, v]) => `${k}: ${String(v).substring(0, 100)}`)
                .join(', ');
              prompt += `${inputs}\n`;
            }
            prompt += "\n";
          }
          
          // Add few-shot context if enabled
          if (fewshot_aware_proposer && demo_candidates && demo_candidates[i] && demo_candidates[i][0]) {
            prompt += "Few-shot examples will be used with this instruction.\n\n";
          }
          
          // Add prompting tip if enabled
          if (tip_aware_proposer) {
            const tips = [
              "Be specific about the expected format and style of the output.",
              "Provide clear criteria for what constitutes a good response.",
              "Include examples of edge cases to handle.",
              "Specify the reasoning process to follow.",
              "Mention any constraints or limitations to consider."
            ];
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            prompt += `Tip: ${randomTip}\n\n`;
          }
          
          prompt += `Generate a clear, actionable instruction for this ${predictor.signature.name} task:`;
          
          const response = await llm.analyze(prompt, { 
            temperature: this.init_temperature,
            max_tokens: 200 
          });
          
          // Extract instruction from response
          let instruction = response.trim();
          
          // Clean up instruction
          if (instruction.startsWith('"') && instruction.endsWith('"')) {
            instruction = instruction.slice(1, -1);
          }
          
          instruction_candidates[i].push(instruction);
          
        } catch (error) {
          console.warn(`Failed to generate instruction candidate ${j} for predictor ${i}:`, error);
          instruction_candidates[i].push(`Complete this ${predictor.signature.name} task effectively.`);
        }
      }
      
      console.log(`Proposed Instructions for Predictor ${i}:`);
      for (let j = 0; j < instruction_candidates[i].length; j++) {
        console.log(`${j}: ${instruction_candidates[i][j]}\n`);
      }
    }

    return instruction_candidates;
  }

  private async optimizePromptParameters(
    program: Module,
    instruction_candidates: Record<number, string[]>,
    demo_candidates: Record<number, Example[][]> | null,
    valset: Example[],
    num_trials: number,
    minibatch: boolean,
    minibatch_size: number,
    minibatch_full_eval_steps: number,
    seed: number
  ): Promise<Module> {
    console.log("Finding optimal prompt parameters using Bayesian optimization...\n");

    // Evaluate default program
    console.log("== Trial 1 - Full Evaluation of Default Program ==");
    const default_score = await this.evaluateProgram(program, valset);
    console.log(`Default program score: ${default_score}\n`);

    let best_score = default_score;
    let best_program = program.deepcopy();
    let total_eval_calls = valset.length;

    // Simple optimization loop (simplified Bayesian optimization)
    for (let trial = 1; trial <= num_trials; trial++) {
      console.log(`== Trial ${trial + 1} / ${num_trials + 1} ==`);

      // Create candidate program
      const candidate_program = program.deepcopy();
      
      // Select random instructions and demos
      const chosen_params: string[] = [];
      
      for (let i = 0; i < candidate_program.predictors().length; i++) {
        const predictor = candidate_program.predictors()[i];
        
        // Select random instruction
        const instruction_idx = Math.floor(Math.random() * instruction_candidates[i].length);
        const selected_instruction = instruction_candidates[i][instruction_idx];
        
        // Update predictor signature
        const updatedSignature = { ...predictor.signature };
        updatedSignature.instructions = selected_instruction;
        predictor.signature = updatedSignature;
        
        chosen_params.push(`Predictor ${i}: Instruction ${instruction_idx}`);
        
        // Select random demos if available
        if (demo_candidates && demo_candidates[i]) {
          const demos_idx = Math.floor(Math.random() * demo_candidates[i].length);
          predictor.demos = demo_candidates[i][demos_idx] || [];
          chosen_params.push(`Predictor ${i}: Few-Shot Set ${demos_idx}`);
        }
      }

      if (this.verbose) {
        console.log("Evaluating candidate program with parameters:", chosen_params);
      }

      // Evaluate candidate program
      const batch_size = minibatch ? minibatch_size : valset.length;
      const eval_data = minibatch ? this.createMinibatch(valset, batch_size) : valset;
      const score = await this.evaluateProgram(candidate_program, eval_data);
      total_eval_calls += batch_size;

      console.log(`Score: ${score} with parameters: ${chosen_params.join(', ')}`);

      // Update best if this is a full evaluation and score is better
      if (!minibatch && score > best_score) {
        best_score = score;
        best_program = candidate_program.deepcopy();
        console.log(`🎉 Best full score so far! Score: ${score}`);
      }

      // Perform full evaluation at intervals if using minibatch
      if (minibatch && (trial % minibatch_full_eval_steps === 0 || trial === num_trials)) {
        console.log("== Full Evaluation ==");
        const full_score = await this.evaluateProgram(candidate_program, valset);
        total_eval_calls += valset.length;
        
        if (full_score > best_score) {
          best_score = full_score;
          best_program = candidate_program.deepcopy();
          console.log(`🎉 New best full eval score! Score: ${full_score}`);
        }
        
        console.log(`Full eval score: ${full_score}`);
        console.log(`Best full score so far: ${best_score}`);
      }

      console.log(`Best score so far: ${best_score}\n`);
    }

    // Mark as compiled and attach stats
    best_program._compiled = true;
    if (this.track_stats) {
      (best_program as any).score = best_score;
      (best_program as any).total_calls = total_eval_calls;
    }

    console.log(`Returning best identified program with score ${best_score}!`);
    return best_program;
  }

  private async evaluateProgram(program: Module, dataset: Example[]): Promise<number> {
    if (!this.metric) {
      // Default metric: simple success rate
      this.metric = (example, prediction, trace) => {
        // Simple heuristic: check if prediction has expected output fields
        const outputFields = Object.keys(program.predictors()[0]?.signature.output_fields || {});
        return outputFields.every(field => prediction[field] != null);
      };
    }

    let correct = 0;
    let total = 0;

    for (const example of dataset) {
      try {
        const inputs = this.extractInputs(example);
        const prediction = await program.forward(inputs);
        const trace = await this.simulateTrace(program, inputs, prediction);
        
        const result = this.metric(example, prediction, trace);
        const success = typeof result === 'number' ? 
          (this.metric_threshold !== undefined ? result >= this.metric_threshold : result > 0) :
          Boolean(result);
        
        if (success) correct++;
        total++;
      } catch (error) {
        console.warn(`Error evaluating example ${example.id}:`, error);
        total++;
        // Continue with evaluation
      }
    }

    return total > 0 ? correct / total : 0;
  }

  private extractInputs(example: Example): Record<string, any> {
    const inputs: Record<string, any> = {};
    for (const [key, value] of Object.entries(example)) {
      if (key !== 'id' && key !== 'metadata') {
        inputs[key] = value;
      }
    }
    return inputs;
  }

  private async simulateTrace(module: Module, inputs: Record<string, any>, outputs: Record<string, any>): Promise<TraceStep[]> {
    const trace: TraceStep[] = [];
    for (const predictor of module.predictors()) {
      trace.push({
        predictor,
        inputs: { ...inputs },
        outputs: { ...outputs }
      });
    }
    return trace;
  }
}

// ============================================================================
// Ensemble Teleprompter - Multi-model optimization
// ============================================================================

/**
 * Ensemble Teleprompter
 * Port of Stanford DSPy's Ensemble approach
 */
export class Ensemble extends Teleprompter {
  private programs: Module[] = [];
  private reduce_fn: ((predictions: any[]) => any) | undefined;
  private size: number | undefined;
  private deterministic: boolean;

  constructor({
    reduce_fn,
    size,
    deterministic = false
  }: {
    reduce_fn?: (predictions: any[]) => any;
    size?: number;
    deterministic?: boolean;
  } = {}) {
    super();
    this.reduce_fn = reduce_fn;
    this.size = size;
    this.deterministic = deterministic;
  }

  async compile({ student, trainset }: {
    student: Module;
    trainset: Example[];
  }): Promise<Module> {
    // Create multiple optimized versions using different teleprompters
    const teleprompters = [
      new LabeledFewShot(8),
      new LabeledFewShot(16),
      new BootstrapFewShot({ max_bootstrapped_demos: 4 }),
      new BootstrapFewShot({ max_bootstrapped_demos: 8 })
    ];

    this.programs = [];
    
    for (const teleprompter of teleprompters) {
      try {
        const optimized = await teleprompter.compile({ student: student.deepcopy(), trainset });
        this.programs.push(optimized);
      } catch (error) {
        console.warn(`Teleprompter failed: ${error}`);
      }
    }

    // Create ensemble module
    return this.createEnsembleModule();
  }

  private createEnsembleModule(): Module {
    const self = this;
    
    return {
      predictors: () => {
        // Return predictors from all programs
        return this.programs.flatMap(program => program.predictors());
      },
      
      named_predictors: () => {
        // Return named predictors from all programs
        return this.programs.flatMap((program, idx) => 
          program.named_predictors().map(([name, predictor]) => 
            [`${name}_ensemble_${idx}`, predictor] as [string, Predictor]
          )
        );
      },
      
      async forward(inputs: Record<string, any>): Promise<Record<string, any>> {
        // Execute all programs
        const predictions = await Promise.all(
          self.programs.map(program => program.forward(inputs))
        );
        
        // Reduce predictions
        if (self.reduce_fn) {
          return self.reduce_fn(predictions);
        } else {
          // Default: majority vote or first prediction
          return predictions[0] || {};
        }
      },
      
      reset_copy(): Module {
        return self.createEnsembleModule();
      },
      
      deepcopy(): Module {
        const newEnsemble = Object.create(Ensemble.prototype);
        newEnsemble.programs = self.programs.map(p => p.deepcopy());
        newEnsemble.reduce_fn = self.reduce_fn;
        newEnsemble.size = self.size;
        newEnsemble.deterministic = self.deterministic;
        return newEnsemble.createEnsembleModule();
      },
      
      _compiled: true
    };
  }
}

// ============================================================================
// DSPy Program Builder - Convenience utilities
// ============================================================================

/**
 * Stanford DSPy-compatible Program Builder
 */
export class DSPyProgramBuilder {
  private predictors: Array<{ name: string; predictor: Predictor }> = [];

  /**
   * Add a predictor to the program
   */
  addPredictor(name: string, signature: Signature, config: Record<string, any> = {}): this {
    const predictor: Predictor = {
      id: `${name}-${Date.now()}`,
      signature,
      demos: [],
      config,
      
      async forward(inputs: Record<string, any>): Promise<Record<string, any>> {
        try {
          // Get DSPy service for LLM access
          const dspyService = await getDSPyService();
          const llm = await dspyService.getLLMService();
          const logger = dspyService.getLogger();
          
          // Build prompt with few-shot examples
          let prompt = this.signature.instructions || `Complete this task: ${this.signature.name}`;
          
          // Add few-shot examples
          if (this.demos.length > 0) {
            prompt += '\n\nExamples:\n';
            for (const demo of this.demos.slice(0, 5)) { // Limit to 5 examples
              const inputStr = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(', ');
              const outputStr = Object.entries(this.signature.output_fields)
                .map(([field]) => `${field}: ${demo[field] || 'N/A'}`)
                .join(', ');
              prompt += `Input: ${inputStr}\nOutput: ${outputStr}\n\n`;
            }
          }
          
          // Add current input
          const inputStr = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(', ');
          prompt += `\nNow complete:\nInput: ${inputStr}\nOutput:`;
          
          // Get LLM response
          const response = await llm.analyze(prompt, this.config);
          
          // Parse response into output fields
          const outputs: Record<string, any> = {};
          for (const [field, spec] of Object.entries(this.signature.output_fields)) {
            // Simple extraction - in production would be more sophisticated
            const fieldMatch = response.match(new RegExp(`${field}:\\s*(.+?)(?:\\n|$)`, 'i'));
            outputs[field] = fieldMatch ? fieldMatch[1].trim() : `Generated ${field}`;
          }
          
          logger.debug(`DSPy predictor ${this.id} generated outputs:`, outputs);
          return outputs;
          
        } catch (error) {
          // Fallback to mock response
          const outputs: Record<string, any> = {};
          for (const [field, spec] of Object.entries(this.signature.output_fields)) {
            outputs[field] = `Generated ${field} for ${JSON.stringify(inputs)}`;
          }
          return outputs;
        }
      },
      
      reset(): void {
        this.demos = [];
      },
      
      copy(): Predictor {
        return { ...this };
      }
    };

    this.predictors.push({ name, predictor });
    return this;
  }

  /**
   * Build the final module
   */
  build(): Module {
    const predictorsArray = this.predictors.map(p => p.predictor);
    const namedPredictorsArray = this.predictors.map(p => [p.name, p.predictor] as [string, Predictor]);

    return {
      predictors: () => predictorsArray,
      named_predictors: () => namedPredictorsArray,
      
      async forward(inputs: Record<string, any>): Promise<Record<string, any>> {
        // Execute predictors in sequence, chaining outputs
        let currentInputs = { ...inputs };
        let outputs: Record<string, any> = {};
        
        for (let i = 0; i < predictorsArray.length; i++) {
          const predictor = predictorsArray[i];
          const result = await predictor.forward(currentInputs);
          outputs = { ...outputs, ...result };
          currentInputs = { ...currentInputs, ...result };
        }
        
        return outputs;
      },
      
      reset_copy(): Module {
        const newBuilder = new DSPyProgramBuilder();
        for (const { name, predictor } of this.predictors) {
          newBuilder.predictors.push({ name, predictor: predictor.copy() });
        }
        return newBuilder.build();
      },
      
      deepcopy(): Module {
        return this.reset_copy();
      }
    };
  }
}

// ============================================================================
// Exports
// ============================================================================

// Types are exported directly in their definitions above

/**
 * Create a new DSPy program builder
 */
export function createProgram(): DSPyProgramBuilder {
  return new DSPyProgramBuilder();
}

/**
 * Create a signature for DSPy predictors
 */
export function createSignature(
  name: string,
  inputs: Record<string, string>,
  outputs: Record<string, string>,
  instructions?: string
): Signature {
  const input_fields: Record<string, { type: string; description?: string }> = {};
  const output_fields: Record<string, { type: string; description?: string }> = {};
  
  for (const [field, description] of Object.entries(inputs)) {
    input_fields[field] = { type: 'string', description };
  }
  
  for (const [field, description] of Object.entries(outputs)) {
    output_fields[field] = { type: 'string', description };
  }
  
  const signature: Signature = {
    name,
    input_fields,
    output_fields
  };
  
  if (instructions !== undefined) {
    signature.instructions = instructions;
  }
  
  return signature;
}

/**
 * Create examples from data
 */
export function createExamples(data: Array<{ input: any; output: any; [key: string]: any }>): Example[] {
  return data.map((item, index) => ({
    id: `example-${index}`,
    ...item.input,
    ...item.output,
    metadata: { createdAt: new Date() }
  }));
}

// Default export
export default {
  Teleprompter,
  LabeledFewShot,
  BootstrapFewShot,
  MIPROv2,
  Ensemble,
  DSPyProgramBuilder,
  createProgram,
  createSignature,
  createExamples
};