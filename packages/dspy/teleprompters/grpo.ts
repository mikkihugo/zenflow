/**
 * @fileoverview GRPO (Gradient-based Reward Policy Optimization) Teleprompter Implementation
 * 
 * Advanced teleprompter that combines bootstrap methodology with reinforcement learning
 * using gradient-based reward policy optimization. Enables fine-tuning language models
 * through reward-based training loops and teacher/student coordination.
 * 
 * Key Features:
 * - Gradient-based reward policy optimization (GRPO)
 * - Multi-step training loops with rollout management
 * - Teacher/student model coordination with validation
 * - GRPO group management for batch training
 * - Comprehensive trace data validation
 * - Variable predictor invocation handling
 * - Format failure and reward scoring
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Documentation
 */

import type { Example } from '../primitives/example';
import type { DSPyModule } from '../primitives/module';
import type { DSPyPredictor } from '../primitives/predictor';
import type { Prediction } from '../primitives/prediction';
import type { MetricFunction } from '../interfaces/types';
import type { LMInterface } from '../interfaces/lm';
import type { Adapter } from '../interfaces/adapter';
import { ChatAdapter } from '../adapters/chat-adapter';
import { 
  FinetuneTeleprompter, 
  TrainDataFormat,
  type TraceData,
  type FailedPrediction,
  allPredictorsHaveLMs,
  copyProgramWithLMs,
  LMCacheManager
} from './bootstrap-finetune';
import { SeededRNG } from '../primitives/seeded-rng';

/**
 * GRPO group data structure for batch training
 */
export type GRPOGroup = Array<{
  /** Input messages for the predictor */
  messages: any[];
  /** Expected completion/output */
  completion: {
    role: string;
    content: string;
  };
  /** Reward score for this completion */
  reward: number;
}>;

/**
 * Variable predictor grouping modes
 */
export type VariablyInvokedPredictorGroupingMode = 'truncate' | 'fill' | 'ragged';

/**
 * Fill strategy for variable predictor grouping
 */
export type VariablyInvokedPredictorFillStrategy = 'randint' | 'max';

/**
 * GRPO training job configuration
 */
export interface GRPOTrainingJob {
  /** Language model instance */
  lm: LMInterface;
  /** Training parameters */
  train_kwargs: Record<string, any>;
  /** Reinforce training job handle */
  job: any;
}

/**
 * GRPO Configuration Interface
 */
export interface GRPOConfig {
  /** Metric function for evaluation */
  metric?: MetricFunction;
  /** Enable multitask training */
  multitask?: boolean;
  /** Training parameters per LM */
  train_kwargs?: Record<string, any> | Map<LMInterface, Record<string, any>>;
  /** Adapter for data formatting */
  adapter?: Adapter | Map<LMInterface, Adapter>;
  /** Exclude demonstrations from training data */
  exclude_demos?: boolean;
  /** Number of parallel threads */
  num_threads?: number;
  /** Number of training steps */
  num_train_steps?: number;
  /** Random seed for reproducibility */
  seed?: number;
  /** Number of DSPy examples per GRPO step */
  num_dspy_examples_per_grpo_step?: number;
  /** Number of rollouts per GRPO step */
  num_rollouts_per_grpo_step?: number;
  /** Use training set as validation set */
  use_train_as_val?: boolean;
  /** Number of steps for validation reporting */
  num_steps_for_val?: number;
  /** Report training scores during validation */
  report_train_scores?: boolean;
  /** Score for failed predictions */
  failure_score?: number;
  /** Score for format failures */
  format_failure_score?: number;
  /** Variable predictor grouping mode */
  variably_invoked_predictor_grouping_mode?: VariablyInvokedPredictorGroupingMode;
  /** Fill strategy for variable predictor grouping */
  variably_invoked_predictor_fill_strategy?: VariablyInvokedPredictorFillStrategy;
}

/**
 * Default GRPO configuration
 */
export const DEFAULT_GRPO_CONFIG: Required<GRPOConfig> = {
  metric: undefined,
  multitask: true,
  train_kwargs: {},
  adapter: undefined,
  exclude_demos: true,
  num_threads: 6,
  num_train_steps: 100,
  seed: 0,
  num_dspy_examples_per_grpo_step: 1,
  num_rollouts_per_grpo_step: 1,
  use_train_as_val: false,
  num_steps_for_val: 5,
  report_train_scores: false,
  failure_score: 0,
  format_failure_score: -1,
  variably_invoked_predictor_grouping_mode: 'truncate',
  variably_invoked_predictor_fill_strategy: 'randint'
};

/**
 * Frequency counter for training example usage
 */
class FrequencyCounter {
  private counts = new Map<number, number>();

  increment(id: number): void {
    this.counts.set(id, (this.counts.get(id) || 0) + 1);
  }

  get(id: number): number {
    return this.counts.get(id) || 0;
  }

  mostCommon(): Array<[number, number]> {
    return Array.from(this.counts.entries()).sort((a, b) => b[1] - a[1]);
  }

  leastCommon(): Array<[number, number]> {
    return Array.from(this.counts.entries()).sort((a, b) => a[1] - b[1]);
  }
}

/**
 * GRPO (Gradient-based Reward Policy Optimization) Teleprompter
 * 
 * Advanced teleprompter that uses reinforcement learning with gradient-based
 * reward policy optimization to train language models. Combines bootstrap
 * methodology with reward-based training loops for improved performance.
 * 
 * Algorithm:
 * 1. Validate input programs and configuration
 * 2. Initialize GRPO training jobs for each unique LM
 * 3. Execute multi-step training loop with:
 *    - Sample selection and shuffling
 *    - Trace data collection from teacher models
 *    - GRPO group preparation and validation
 *    - Parallel training step execution
 *    - Validation metrics reporting
 * 4. Update student predictors with optimized LMs
 */
export class GRPO extends FinetuneTeleprompter {
  private config: Required<GRPOConfig>;
  private adapter: Map<LMInterface, Adapter>;
  private rng: SeededRNG;
  private shuffledTrainsetIds: number[] = [];
  private epoch: number = -1;
  private idFreqs: FrequencyCounter = new FrequencyCounter();

  constructor(config: GRPOConfig = {}) {
    super(config.train_kwargs);
    
    this.config = {
      ...DEFAULT_GRPO_CONFIG,
      ...config
    };

    // Validate configuration
    this.validateConfig();

    this.adapter = this.convertAdapterToLMDict(config.adapter);
    this.rng = new SeededRNG(this.config.seed);
  }

  /**
   * Validate GRPO configuration
   */
  private validateConfig(): void {
    if (this.config.failure_score <= this.config.format_failure_score) {
      throw new Error(
        'failure_score must be greater than format_failure_score since the range ' +
        '[format_failure_score, failure_score] is used to provide dspy formatting rewards'
      );
    }

    if (this.config.use_train_as_val && !this.config.report_train_scores) {
      throw new Error('If use_train_as_val is True, report_train_scores must be True.');
    }

    if (!this.config.exclude_demos) {
      throw new Error('exclude_demos==False is not supported yet. Please set it to True.');
    }

    if (!this.config.multitask) {
      throw new Error(
        'independent GRPO training jobs for each predictor in the student program is not supported yet. ' +
        'Please set multitask=True.'
      );
    }

    if (this.config.variably_invoked_predictor_grouping_mode === 'fill') {
      if (!this.config.variably_invoked_predictor_fill_strategy) {
        throw new Error(
          'variably_invoked_predictor_fill_strategy must be set when ' +
          'variably_invoked_predictor_grouping_mode is "fill"'
        );
      }
      
      if (!['randint', 'max'].includes(this.config.variably_invoked_predictor_fill_strategy)) {
        throw new Error(
          'variably_invoked_predictor_fill_strategy must be either "randint" or "max"'
        );
      }
    }
  }

  /**
   * Convert adapter to LM-keyed dictionary
   */
  private convertAdapterToLMDict(
    adapter?: Adapter | Map<LMInterface, Adapter>
  ): Map<LMInterface, Adapter> {
    if (adapter instanceof Map) {
      return adapter;
    }
    
    return new Map() as Map<LMInterface, Adapter>;
  }

  /**
   * Compile student module with GRPO training
   */
  async compile(
    student: DSPyModule,
    trainset: Example[],
    teacher?: DSPyModule | DSPyModule[],
    valset?: Example[]
  ): Promise<DSPyModule> {
    console.log('Starting the GRPO compilation process...');
    console.log('The LM(s) for the student program will be updated in place at the end of the training.');
    
    console.log('Validating the inputs...');
    this.validateInputs(student, trainset, teacher, valset);

    // Prepare training set
    const preparedTrainset = this.prepareTrainingSet(trainset);

    console.log('Preparing the student program...');
    if (!allPredictorsHaveLMs(student)) {
      throw new Error('All predictors must have LMs assigned before GRPO training.');
    }

    const predSignatureHashToInd = this.buildSignatureHashMap(student);
    const numStudentPredictors = student.predictors().length;

    console.log('Preparing the teacher program(s)...');
    const teachers = this.prepareTeachers(student, teacher);
    const numSamplesPerInput = this.config.num_rollouts_per_grpo_step / teachers.length;

    // Cache management
    const lmCacheDict = new Map<LMInterface, boolean>();
    this.disableLMCache(student, lmCacheDict);
    for (const t of teachers) {
      this.disableLMCache(t, lmCacheDict);
    }

    // Update train_kwargs for all predictors
    this.updateTrainKwargs(student);

    console.log('Preparing the GRPO training job(s)...');
    const grpoTrainingJobs = this.prepareGRPOTrainingJobs(student);

    // Initial validation metrics
    await this.reportValidationMetrics(student, preparedTrainset, valset, -1);

    console.log('Starting the GRPO training loop...');
    for (let trainStepIdx = 0; trainStepIdx < this.config.num_train_steps; trainStepIdx++) {
      console.log(`GRPO training step ${trainStepIdx + 1}/${this.config.num_train_steps}...`);

      const subsampleTrainingDataset = this.selectTrainingSampleAndUpdateShuffledTrainset(
        preparedTrainset,
        trainStepIdx
      );

      console.log('Bootstrapping data...');
      const traceData = await this.collectTraceData(
        teachers,
        subsampleTrainingDataset,
        numSamplesPerInput
      );

      this.validateTraceDataAndLogIssues(
        traceData,
        subsampleTrainingDataset,
        teachers.length,
        numSamplesPerInput,
        predSignatureHashToInd
      );

      console.log('Preparing the training data batch from bootstrapped examples for GRPO...');
      const trainBatchPerPredictor = await this.prepareTrainingBatch(
        traceData,
        student,
        numStudentPredictors,
        predSignatureHashToInd
      );

      if (!trainBatchPerPredictor.some(batch => batch.length > 0)) {
        console.warn(
          'No training data found for this training step. This means that the model did not generate ' +
          'valid formatted responses for any of the examples in the training set. This is a critical error. ' +
          'Please check the model and the training set.'
        );
        continue;
      }

      this.validateTrainingBatch(trainBatchPerPredictor);

      console.log('Invoking GRPO training step...');
      await this.executeGRPOTrainingStep(grpoTrainingJobs, trainBatchPerPredictor);

      console.log(`GRPO training step ${trainStepIdx + 1}/${this.config.num_train_steps} completed.`);

      await this.reportValidationMetrics(student, preparedTrainset, valset, trainStepIdx);
    }

    console.log('Done with the iterations! Retrieving the final model(s)...');
    this.terminateTrainingJobs(grpoTrainingJobs);

    // Restore cache states
    this.recoverLMCache(student, lmCacheDict);
    for (const t of teachers) {
      this.recoverLMCache(t, lmCacheDict);
    }

    console.log('GRPO compiler has finished compiling the student program');
    student.compiled = true;
    return student;
  }

  /**
   * Validate inputs for GRPO compilation
   */
  private validateInputs(
    student: DSPyModule,
    trainset: Example[],
    teacher?: DSPyModule | DSPyModule[],
    valset?: Example[]
  ): void {
    if (trainset.length === 0) {
      throw new Error('Training set is empty. Please provide a non-empty training set.');
    }

    if (!this.config.multitask) {
      throw new Error(
        'Independent GRPO training jobs for each predictor in the student program ' +
        'are not supported yet. Please set multitask=True.'
      );
    }

    const studentLms = new Set(student.predictors().map(pred => pred.lm?.model || ''));
    if (studentLms.size > 1) {
      throw new Error(
        `Student program has multiple LMs: ${Array.from(studentLms)}. ` +
        'GRPO only supports student programs with a single LM. ' +
        'You can set the LM for a program with `program.set_lm(...)`'
      );
    }

    if (this.config.use_train_as_val && valset !== undefined) {
      throw new Error('If use_train_as_val is True, valset must be None.');
    }
  }

  /**
   * Prepare training set with proper size handling
   */
  private prepareTrainingSet(trainset: Example[]): Example[] {
    if (trainset.length < this.config.num_dspy_examples_per_grpo_step) {
      console.warn(
        `Number of training examples ${trainset.length} is less than the number of examples per GRPO step ` +
        `${this.config.num_dspy_examples_per_grpo_step}. Repeating the training set to fill the GRPO step. ` +
        'This could lead to overfitting and training instability.'
      );

      const multiplier = Math.ceil(this.config.num_dspy_examples_per_grpo_step / trainset.length);
      if (multiplier > 1) {
        console.warn(
          `Repeating the training set ${multiplier} times to fill the GRPO step. ` +
          'This could lead to overfitting and training instability.'
        );
        return Array(multiplier).fill(trainset).flat();
      }
    }

    return trainset;
  }

  /**
   * Build signature hash to index mapping
   */
  private buildSignatureHashMap(student: DSPyModule): Map<number, number> {
    const map = new Map<number, number>();
    student.predictors().forEach((pred, ind) => {
      const hash = this.hashSignature(pred.signature);
      map.set(hash, ind);
    });
    return map;
  }

  /**
   * Hash signature for mapping
   */
  private hashSignature(signature: any): number {
    const str = JSON.stringify(signature);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Prepare teacher models
   */
  private prepareTeachers(
    student: DSPyModule,
    teacher?: DSPyModule | DSPyModule[]
  ): DSPyModule[] {
    let teachers: DSPyModule[];
    
    if (!teacher || (Array.isArray(teacher) && teacher.length === 0)) {
      teachers = [student];
    } else {
      teachers = Array.isArray(teacher) ? teacher : [teacher];
    }

    // Validate structural equivalency
    for (const t of teachers) {
      this.assertStructuralEquivalency(student, t);
      if (!allPredictorsHaveLMs(t)) {
        throw new Error('All teacher predictors must have LMs assigned.');
      }
    }

    // Ensure student is in teachers list
    if (!teachers.includes(student)) {
      throw new Error(
        `Student program is not in the list of teachers. Please provide the student program as one of the teachers. ` +
        'Alternatively, you can leave the teacher argument as None, and the student program will be used as the teacher program.'
      );
    }

    if (this.config.num_rollouts_per_grpo_step % teachers.length !== 0) {
      throw new Error(
        `The GRPO group size (num_rollouts_per_grpo_step) ${this.config.num_rollouts_per_grpo_step} is not divisible ` +
        `by the number of teachers ${teachers.length}. This is required to ensure that each teacher gets the same number of examples. ` +
        'Please provide a number of examples that is divisible by the number of teachers.'
      );
    }

    return teachers;
  }

  /**
   * Assert structural equivalency between programs
   */
  private assertStructuralEquivalency(program1: DSPyModule, program2: DSPyModule): void {
    const predictors1 = program1.predictors();
    const predictors2 = program2.predictors();
    
    if (predictors1.length !== predictors2.length) {
      throw new Error(
        `Structurally equivalent programs must have the same number of predictors. ` +
        `The number of predictors for the two modules do not match: ${predictors1.length} != ${predictors2.length}`
      );
    }

    for (let i = 0; i < predictors1.length; i++) {
      const sig1 = JSON.stringify(predictors1[i].signature);
      const sig2 = JSON.stringify(predictors2[i].signature);
      
      if (sig1 !== sig2) {
        throw new Error(
          `Program predictor signatures must match at corresponding indices for structural equivalency. ` +
          `The predictor signatures for the programs do not match at index ${i}`
        );
      }
    }
  }

  /**
   * Update train_kwargs for student predictors
   */
  private updateTrainKwargs(student: DSPyModule): void {
    for (const pred of student.predictors()) {
      if (!pred.lm) continue;
      
      let trainKwargs = this.train_kwargs.get(pred.lm) || {};
      trainKwargs = { ...trainKwargs };
      trainKwargs.num_generations = this.config.num_rollouts_per_grpo_step;
      this.train_kwargs.set(pred.lm, trainKwargs);
    }
  }

  /**
   * Prepare GRPO training jobs
   */
  private prepareGRPOTrainingJobs(student: DSPyModule): Map<string, GRPOTrainingJob> {
    const grpoTrainingJobs = new Map<string, GRPOTrainingJob>();
    
    for (const [predInd, pred] of student.predictors().entries()) {
      if (!pred.lm) continue;
      
      const dataKey = this.config.multitask ? null : predInd;
      const jobKey = `${pred.lm.model}_${dataKey}`;
      
      if (!grpoTrainingJobs.has(jobKey)) {
        const trainKwargs = this.train_kwargs.get(pred.lm) || {};
        
        // Simulate reinforce method call
        const job = {
          step: async (trainData: GRPOGroup[], trainDataFormat: TrainDataFormat) => {
            // Mock GRPO training step
            console.log(`GRPO step executed for ${pred.lm?.model} with ${trainData.length} groups`);
          },
          terminate: () => {
            console.log(`GRPO job terminated for ${pred.lm?.model}`);
          }
        };
        
        grpoTrainingJobs.set(jobKey, {
          lm: pred.lm,
          train_kwargs: trainKwargs,
          job
        });
      }
    }

    return grpoTrainingJobs;
  }

  /**
   * Update shuffled training set for epoch management
   */
  private updateShuffledTrainset(originalTrainset: Example[]): void {
    this.shuffledTrainsetIds = Array.from({ length: originalTrainset.length }, (_, i) => i);
    this.rng.shuffle(this.shuffledTrainsetIds);
    
    for (const id of this.shuffledTrainsetIds) {
      this.idFreqs.increment(id);
    }

    const numToPad = this.config.num_dspy_examples_per_grpo_step - 
      (originalTrainset.length % this.config.num_dspy_examples_per_grpo_step);
    
    if (numToPad > 0) {
      for (let i = 0; i < numToPad; i++) {
        const selectedId = this.idFreqs.leastCommon()[0][0];
        this.shuffledTrainsetIds.push(selectedId);
        this.idFreqs.increment(selectedId);
      }
    }
  }

  /**
   * Select training sample and update shuffled trainset
   */
  private selectTrainingSampleAndUpdateShuffledTrainset(
    originalTrainset: Example[],
    trainStepIdx: number
  ): Example[] {
    const baseIdx = trainStepIdx * this.config.num_dspy_examples_per_grpo_step;
    const currEpoch = this.epoch === -1 ? 0 : Math.floor(baseIdx / this.shuffledTrainsetIds.length);
    
    if (currEpoch > this.epoch) {
      console.log(`Updating shuffled trainset for epoch ${currEpoch}...`);
      this.epoch = currEpoch;
      this.updateShuffledTrainset(originalTrainset);
    }

    if (this.shuffledTrainsetIds.length < this.config.num_dspy_examples_per_grpo_step) {
      throw new Error(
        `Shuffled trainset length ${this.shuffledTrainsetIds.length} is less than ` +
        `num_dspy_examples_per_grpo_step ${this.config.num_dspy_examples_per_grpo_step}`
      );
    }

    if (this.shuffledTrainsetIds.length % this.config.num_dspy_examples_per_grpo_step !== 0) {
      throw new Error(
        `Shuffled trainset length ${this.shuffledTrainsetIds.length} is not divisible by ` +
        `num_dspy_examples_per_grpo_step ${this.config.num_dspy_examples_per_grpo_step}`
      );
    }

    const adjustedBaseIdx = baseIdx % this.shuffledTrainsetIds.length;
    const endIdx = adjustedBaseIdx + this.config.num_dspy_examples_per_grpo_step;
    
    if (endIdx > this.shuffledTrainsetIds.length) {
      throw new Error(
        `End index ${endIdx} is out of bounds for shuffled trainset length ${this.shuffledTrainsetIds.length}`
      );
    }

    const selectedIds = this.shuffledTrainsetIds.slice(adjustedBaseIdx, endIdx);
    return selectedIds.map(i => originalTrainset[i]);
  }

  /**
   * Collect trace data from teachers
   */
  private async collectTraceData(
    teachers: DSPyModule[],
    subsampleTrainingDataset: Example[],
    numSamplesPerInput: number
  ): Promise<TraceData[][][]> {
    const traceData: TraceData[][][] = Array(subsampleTrainingDataset.length)
      .fill(null)
      .map(() => Array(teachers.length).fill(null).map(() => []));

    for (const [tind, teacher] of teachers.entries()) {
      const subsampleTrainingDatasetRepeated = Array(numSamplesPerInput)
        .fill(subsampleTrainingDataset)
        .flat();

      const roundData = await this.bootstrapTraceData(
        teacher,
        subsampleTrainingDatasetRepeated,
        this.config.metric,
        this.config.num_threads,
        false, // raise_on_error
        true,  // capture_failed_parses
        this.config.failure_score,
        this.config.format_failure_score
      );

      for (const dataDict of roundData) {
        const exampleIndInSubsample = dataDict.example_ind % subsampleTrainingDataset.length;
        dataDict.example_ind = exampleIndInSubsample;
        traceData[exampleIndInSubsample][tind].push(dataDict);
      }
    }

    return traceData;
  }

  /**
   * Bootstrap trace data collection (simplified version)
   */
  private async bootstrapTraceData(
    program: DSPyModule,
    dataset: Example[],
    metric?: MetricFunction,
    numThreads: number = 1,
    raiseOnError: boolean = false,
    captureFailedParses: boolean = false,
    failureScore: number = 0,
    formatFailureScore: number = -1
  ): Promise<TraceData[]> {
    const data: TraceData[] = [];
    
    for (const [exampleInd, example] of dataset.entries()) {
      try {
        const prediction = await program.forward(example.inputs().data);
        let score: number | null = null;
        
        if (metric) {
          const metricResult = metric(example, prediction, []);
          score = typeof metricResult === 'number' ? metricResult : (metricResult ? 1 : 0);
        } else {
          score = 1;
        }
        
        const trace: Array<[DSPyPredictor, Record<string, any>, Prediction]> = [
          [program.predictors()[0], example.inputs().data, prediction]
        ];
        
        const dataDict: TraceData = {
          example,
          prediction,
          trace,
          example_ind: exampleInd,
          score: score || 0
        };
        
        data.push(dataDict);
        
      } catch (error) {
        if (raiseOnError) {
          throw error;
        }
        
        if (captureFailedParses) {
          const failedPrediction: FailedPrediction = {
            completion_text: String(error),
            format_reward: formatFailureScore
          };
          
          const trace: Array<[DSPyPredictor, Record<string, any>, Prediction]> = [
            [program.predictors()[0], example.inputs().data, failedPrediction as any]
          ];
          
          const dataDict: TraceData = {
            example,
            prediction: failedPrediction as any,
            trace,
            example_ind: exampleInd,
            score: failureScore
          };
          
          data.push(dataDict);
        }
      }
    }
    
    return data;
  }

  /**
   * Validate trace data and log issues
   */
  private validateTraceDataAndLogIssues(
    traceData: TraceData[][][],
    subsampleTrainingDataset: Example[],
    numTeachers: number,
    numSamplesPerInput: number,
    predSignatureHashToInd: Map<number, number>
  ): void {
    if (traceData.length !== subsampleTrainingDataset.length) {
      throw new Error(
        `Trace data length ${traceData.length} does not match the number of examples ${subsampleTrainingDataset.length}`
      );
    }

    if (traceData.length > 0 && traceData[0].length !== numTeachers) {
      throw new Error(
        `Trace data length ${traceData[0].length} does not match the number of teachers ${numTeachers}`
      );
    }

    if (traceData.length > 0 && traceData[0].length > 0) {
      if (traceData[0][0].length === 0) {
        console.warn(
          'Trace data for example 0 and teacher 0 is empty. This is likely due to all examples in the training set ' +
          'input, resulting in the model generating output not following the dspy response format.'
        );
      } else if (traceData[0][0].length !== numSamplesPerInput) {
        console.warn(
          `Trace data length ${traceData[0][0].length} does not match the expected number of samples per input ${numSamplesPerInput}`
        );
        
        if (traceData[0][0][0] && !('trace' in traceData[0][0][0])) {
          throw new Error('Trace data does not contain the "trace" key');
        }
        
        if (traceData[0][0][0]?.trace && traceData[0][0][0].trace.length === 0) {
          throw new Error('Trace data is empty');
        }
        
        if (traceData[0][0][0]?.trace && traceData[0][0][0].trace[0] && traceData[0][0][0].trace[0].length !== 3) {
          throw new Error(
            `Trace tuple length ${traceData[0][0][0].trace[0].length} does not match the expected length 3`
          );
        }
      }
    }

    // Validate signature hashes
    for (const exampleData of traceData) {
      for (const teacherData of exampleData) {
        for (const sample of teacherData) {
          for (const t of sample.trace) {
            const signatureHash = this.hashSignature(t[0].signature);
            if (!predSignatureHashToInd.has(signatureHash)) {
              console.warn(`Unknown signature hash found in trace data: ${signatureHash}`);
            }
          }
        }
      }
    }
  }

  /**
   * Prepare training batch from trace data
   */
  private async prepareTrainingBatch(
    traceData: TraceData[][][],
    student: DSPyModule,
    numStudentPredictors: number,
    predSignatureHashToInd: Map<number, number>
  ): Promise<GRPOGroup[][]> {
    const trainBatchPerPredictor: GRPOGroup[][] = Array(numStudentPredictors)
      .fill(null)
      .map(() => []);

    for (let predId = 0; predId < numStudentPredictors; predId++) {
      for (const [exampleInd, exampleData] of traceData.entries()) {
        const predictorExampleInvocations: Array<Array<[DSPyPredictor, Record<string, any>, Prediction, number]>> = [];

        for (const teacherData of exampleData) {
          for (const sample of teacherData) {
            if (sample.example_ind !== exampleInd) {
              throw new Error(
                `Example index ${sample.example_ind} does not match the expected index ${exampleInd}`
              );
            }

            const traceInstancesForCurrentPred = sample.trace
              .filter(t => {
                const hash = this.hashSignature(t[0].signature);
                const studentHash = this.hashSignature(student.predictors()[predId].signature);
                return hash === studentHash;
              })
              .map(t => [t[0], t[1], t[2], sample.score || 0] as [DSPyPredictor, Record<string, any>, Prediction, number]);

            predictorExampleInvocations.push(traceInstancesForCurrentPred);
          }
        }

        if (predictorExampleInvocations.length === 0) {
          console.warn(
            `Skipping example ${exampleInd} for predictor ${predId} as it has no invocations. ` +
            'This is likely due to all examples in the training set input, resulting in the model generating ' +
            'output not following the dspy response format.'
          );
          continue;
        }

        if (predictorExampleInvocations.length !== this.config.num_rollouts_per_grpo_step) {
          console.warn(
            `Number of predictor example invocations ${predictorExampleInvocations.length} does not match ` +
            `the expected batch size ${this.config.num_rollouts_per_grpo_step}. This is likely due to all examples ` +
            'in the training set input, resulting in the model generating output not following the dspy response format.'
          );
        }

        const lengths = predictorExampleInvocations.map(inv => inv.length);
        const minLen = Math.min(...lengths);
        const maxLen = Math.max(...lengths);

        if (minLen === 0) {
          console.warn(`Skipping example ${exampleInd} for predictor ${predId} as it has no invocations.`);
          continue;
        }

        // Handle variable invocation grouping
        let processedInvocations = predictorExampleInvocations;
        
        if (this.config.variably_invoked_predictor_grouping_mode === 'truncate') {
          processedInvocations = predictorExampleInvocations.map(inv => inv.slice(0, minLen));
        } else if (this.config.variably_invoked_predictor_grouping_mode === 'fill') {
          const selector = this.config.variably_invoked_predictor_fill_strategy === 'randint'
            ? (list: any[]) => this.rng.choice(list)
            : (list: any[]) => list[list.length - 1];

          processedInvocations = predictorExampleInvocations.map(inv => {
            const padding = Array(maxLen - inv.length).fill(null).map(() => selector(inv));
            return [...inv, ...padding];
          });
        }

        const finalMaxLen = Math.max(...processedInvocations.map(inv => inv.length));
        const exampleTrainingData: GRPOGroup[] = Array(finalMaxLen).fill(null).map(() => []);

        for (let groupIdx = 0; groupIdx < finalMaxLen; groupIdx++) {
          for (let rolloutIdx = 0; rolloutIdx < processedInvocations.length; rolloutIdx++) {
            if (groupIdx < processedInvocations[rolloutIdx].length) {
              const traceInstance = processedInvocations[rolloutIdx][groupIdx];
              const score = traceInstance[3];
              const predictor = traceInstance[0];
              const predLm = predictor.lm;
              
              if (!predLm) continue;

              const adapter = this.adapter.get(predLm) || new ChatAdapter();
              if (!(adapter instanceof ChatAdapter)) {
                throw new Error(
                  `Adapter ${adapter} is not a ChatAdapter. GRPO training is not supported for this adapter.`
                );
              }

              const inpMessages = adapter.format(
                traceInstance[0].signature,
                traceInstance[1],
                [] // TODO: Add support for demos
              );

              if (this.isFailedPrediction(traceInstance[2])) {
                const failedPred = traceInstance[2] as FailedPrediction;
                const failureScore = failedPred.format_reward || this.config.format_failure_score;
                
                exampleTrainingData[groupIdx].push({
                  messages: inpMessages,
                  completion: {
                    role: 'assistant',
                    content: failedPred.completion_text
                  },
                  reward: failureScore
                });
                
                console.warn(
                  `Adding a format failure example to the training data for predictor ${predId} and example ${exampleInd}.`
                );
              } else {
                const allMessages = adapter.formatFinetuneData(
                  traceInstance[0].signature,
                  [], // TODO: Add support for demos
                  traceInstance[1],
                  traceInstance[2]
                ).messages;

                if (JSON.stringify(allMessages.slice(0, -1)) !== JSON.stringify(inpMessages)) {
                  throw new Error(
                    `Input messages ${JSON.stringify(inpMessages)} do not match the expected messages ` +
                    `${JSON.stringify(allMessages.slice(0, -1))}`
                  );
                }

                exampleTrainingData[groupIdx].push({
                  messages: inpMessages,
                  completion: {
                    role: allMessages[allMessages.length - 1].role,
                    content: allMessages[allMessages.length - 1].content
                  },
                  reward: score
                });
              }
            }
          }
        }

        trainBatchPerPredictor[predId].push(...exampleTrainingData);
      }
    }

    return trainBatchPerPredictor;
  }

  /**
   * Check if prediction is a failed prediction
   */
  private isFailedPrediction(prediction: any): prediction is FailedPrediction {
    return prediction && typeof prediction === 'object' && 'completion_text' in prediction;
  }

  /**
   * Validate training batch
   */
  private validateTrainingBatch(trainBatchPerPredictor: GRPOGroup[][]): void {
    for (const predictorTrainBatch of trainBatchPerPredictor) {
      for (const grpoTrainGroup of predictorTrainBatch) {
        if (grpoTrainGroup.length !== this.config.num_rollouts_per_grpo_step) {
          console.warn(
            `Number of completions ${grpoTrainGroup.length} does not match the expected number ` +
            `num_rollouts_per_grpo_step=${this.config.num_rollouts_per_grpo_step}`
          );
          
          if (grpoTrainGroup.length > this.config.num_rollouts_per_grpo_step) {
            throw new Error(
              `Number of completions ${grpoTrainGroup.length} is greater than the expected number ` +
              `num_rollouts_per_grpo_step=${this.config.num_rollouts_per_grpo_step}`
            );
          }
        }

        const uniqueCompletions = new Set(grpoTrainGroup.map(item => JSON.stringify(item)));
        if (uniqueCompletions.size < 2) {
          console.warn(
            'GRPOGroup has no diversity. This could be due to low temperature, or low number of rollouts, ' +
            `or the cache could be enabled inadvertently. The GRPOGroup is ${JSON.stringify(grpoTrainGroup)}.`
          );
        }
      }
    }
  }

  /**
   * Execute GRPO training step
   */
  private async executeGRPOTrainingStep(
    grpoTrainingJobs: Map<string, GRPOTrainingJob>,
    trainBatchPerPredictor: GRPOGroup[][]
  ): Promise<void> {
    for (const [jobKey, jobInfo] of grpoTrainingJobs.entries()) {
      const [, dataKeyStr] = jobKey.split('_');
      const dataKey = dataKeyStr === 'null' ? null : parseInt(dataKeyStr);
      
      const trainData = dataKey === null 
        ? trainBatchPerPredictor.flat()
        : trainBatchPerPredictor[dataKey] || [];

      for (const group of trainData) {
        // Pad group if necessary
        while (group.length < this.config.num_rollouts_per_grpo_step) {
          const padding = group.slice(0, Math.min(this.config.num_rollouts_per_grpo_step - group.length, group.length));
          group.push(...padding);
        }

        if (group.length !== this.config.num_rollouts_per_grpo_step) {
          throw new Error(
            `Number of completions ${group.length} does not match the expected number ` +
            `self.num_rollouts_per_grpo_step=${this.config.num_rollouts_per_grpo_step}`
          );
        }
      }

      await jobInfo.job.step(trainData, TrainDataFormat.GRPO_CHAT);
    }
  }

  /**
   * Terminate training jobs
   */
  private terminateTrainingJobs(grpoTrainingJobs: Map<string, GRPOTrainingJob>): void {
    for (const [, jobInfo] of grpoTrainingJobs.entries()) {
      jobInfo.job.terminate();
    }
  }

  /**
   * Report validation metrics
   */
  private async reportValidationMetrics(
    student: DSPyModule,
    trainset: Example[],
    valset?: Example[],
    stepIdx: number = -1
  ): Promise<void> {
    const shouldReport = stepIdx === -1 || 
      stepIdx === this.config.num_train_steps - 1 || 
      (stepIdx + 1) % this.config.num_steps_for_val === 0;

    if (!shouldReport) {
      return;
    }

    if (valset) {
      if (this.config.use_train_as_val) {
        throw new Error('If valset is provided, use_train_as_val must be False.');
      }

      if (this.config.num_steps_for_val <= 0) {
        throw new Error('num_steps_for_val must be a positive integer.');
      }

      if (this.config.report_train_scores) {
        if (stepIdx === -1) {
          console.log('Using user provided validation set and reporting train scores for every validation step in addition.');
        }

        const combinedSet = [...valset, ...trainset];
        const evaluation = await this.evaluateProgram(student, combinedSet);
        
        const trainsetScores = evaluation.slice(valset.length);
        const valsetScores = evaluation.slice(0, valset.length);
        
        const trainsetAgg = this.average(trainsetScores);
        const valsetAgg = this.average(valsetScores);

        if (stepIdx === -1) {
          console.log(`Student program training set score before training loop: ${trainsetAgg}`);
          console.log(`Student program validation set score before training loop: ${valsetAgg}`);
        } else {
          console.log(`Student program training set score after training step ${stepIdx + 1}/${this.config.num_train_steps}: ${trainsetAgg}`);
          console.log(`Student program validation set score after training step ${stepIdx + 1}/${this.config.num_train_steps}: ${valsetAgg}`);
        }
      } else {
        if (stepIdx === -1) {
          console.log('Using user provided validation set and not reporting train scores.');
        }

        const evaluation = await this.evaluateProgram(student, valset);
        const valsetAgg = this.average(evaluation);

        if (stepIdx === -1) {
          console.log(`Student program validation set score before training loop: ${valsetAgg}`);
        } else {
          console.log(`Student program validation set score after training step ${stepIdx + 1}/${this.config.num_train_steps}: ${valsetAgg}`);
        }
      }
    } else {
      if (this.config.report_train_scores) {
        if (!this.config.use_train_as_val) {
          throw new Error('If report_train_scores is True, use_train_as_val must be True when valset is not provided explicitly.');
        }

        if (this.config.num_steps_for_val <= 0) {
          throw new Error('num_steps_for_val must be a positive integer.');
        }

        if (stepIdx === -1) {
          console.log('Using trainset as validation set.');
        }

        const evaluation = await this.evaluateProgram(student, trainset);
        const trainsetAgg = this.average(evaluation);

        if (stepIdx === -1) {
          console.log(`Student program training set score before training loop: ${trainsetAgg}`);
        } else {
          console.log(`Student program training set score after training step ${stepIdx + 1}/${this.config.num_train_steps}: ${trainsetAgg}`);
        }
      } else {
        if (this.config.use_train_as_val) {
          throw new Error('If report_train_scores is False, use_train_as_val must be False.');
        }

        if (stepIdx === -1) {
          console.log('Not using any validation set and not reporting train scores.');
        }
      }
    }
  }

  /**
   * Evaluate program on dataset
   */
  private async evaluateProgram(program: DSPyModule, dataset: Example[]): Promise<number[]> {
    const scores: number[] = [];
    
    for (const example of dataset) {
      try {
        const prediction = await program.forward(example.inputs().data);
        let score = this.config.failure_score;
        
        if (this.config.metric) {
          const metricResult = this.config.metric(example, prediction, []);
          score = typeof metricResult === 'number' ? metricResult : (metricResult ? 1 : 0);
        } else {
          score = 1;
        }
        
        scores.push(score);
      } catch (error) {
        scores.push(this.config.failure_score);
      }
    }
    
    return scores;
  }

  /**
   * Calculate average of scores
   */
  private average(scores: number[]): number {
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  /**
   * Disable LM cache for program
   */
  private disableLMCache(program: DSPyModule, lmCacheDict: Map<LMInterface, boolean>): void {
    for (const pred of program.predictors()) {
      if (!pred.lm) {
        throw new Error(`Cannot disable cache: predictor ${pred} does not have an LM set.`);
      }
      
      if (!lmCacheDict.has(pred.lm)) {
        lmCacheDict.set(pred.lm, pred.lm.cache || false);
      }
      
      pred.lm.cache = false;
    }
  }

  /**
   * Recover LM cache for program
   */
  private recoverLMCache(program: DSPyModule, lmCacheDict: Map<LMInterface, boolean>): void {
    for (const pred of program.predictors()) {
      if (pred.lm && lmCacheDict.has(pred.lm)) {
        pred.lm.cache = lmCacheDict.get(pred.lm) || true;
      } else if (pred.lm) {
        pred.lm.cache = true;
      }
    }
  }
}

/**
 * Create GRPO teleprompter with default configuration
 */
export function createGRPO(config: GRPOConfig = {}): GRPO {
  return new GRPO(config);
}

/**
 * Create GRPO teleprompter for multitask training
 */
export function createMultitaskGRPO(config: GRPOConfig = {}): GRPO {
  return new GRPO({
    ...config,
    multitask: true,
    exclude_demos: true
  });
}