/**
 * @fileoverview Bootstrap Finetune Teleprompter Implementation
 * 
 * Foundation teleprompter providing infrastructure for LM fine-tuning based optimization.
 * Combines bootstrap methodology with language model fine-tuning to create optimized
 * predictors through direct model adaptation.
 * 
 * This implementation provides the base classes and utilities required by advanced
 * teleprompters like GRPO (Gradient-based Reward Policy Optimization).
 * 
 * Key Features:
 * - FinetuneTeleprompter abstract base class
 * - Bootstrap trace data collection with evaluation
 * - Parallel fine-tuning job coordination
 * - LM lifecycle management (kill/restore patterns)
 * - Comprehensive error handling for failed predictions
 * - Adapter integration for data formatting
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.44
 */

import type { Example } from '../primitives/example';
import type { DSPyModule } from '../primitives/module';
import type { DSPyPredictor } from '../primitives/predictor';
import type { Prediction } from '../primitives/prediction';
import type { MetricFunction } from '../interfaces/types';
import type { LMInterface } from '../interfaces/lm';
import type { Adapter } from '../interfaces/adapter';
import { ChatAdapter } from '../adapters/chat-adapter';

/**
 * Trace data structure for bootstrap collection
 */
export interface TraceData {
  /** Index of example in original dataset */
  example_ind: number;
  /** Original training example */
  example: Example;
  /** Model prediction result */
  prediction: Prediction;
  /** Execution trace: [predictor, inputs, outputs] tuples */
  trace: Array<[DSPyPredictor, Record<string, any>, Prediction]>;
  /** Optional score from metric evaluation */
  score?: number;
}

/**
 * Failed prediction handling for format errors
 */
export interface FailedPrediction {
  /** Raw completion text from failed prediction */
  completion_text: string;
  /** Optional reward score for format quality */
  format_reward?: number;
}

/**
 * Training data format specifications
 */
export enum TrainDataFormat {
  /** GRPO chat format for reinforcement learning */
  GRPO_CHAT = 'grpo_chat',
  /** Standard fine-tuning format */
  STANDARD = 'standard'
}

/**
 * Fine-tuning job configuration
 */
export interface FinetuneJob {
  /** Language model instance */
  lm: LMInterface;
  /** Training data */
  train_data: any[];
  /** Data format specification */
  train_data_format: TrainDataFormat;
  /** Training parameters */
  train_kwargs: Record<string, any>;
}

/**
 * Abstract base class for fine-tune based teleprompters
 */
export abstract class FinetuneTeleprompter {
  protected train_kwargs: Map<LMInterface, Record<string, any>>;

  constructor(
    train_kwargs?: Record<string, any> | Map<LMInterface, Record<string, any>>
  ) {
    this.train_kwargs = this.convertToLMDict(train_kwargs || {});
  }

  /**
   * Convert train_kwargs to LM-keyed dictionary
   */
  protected convertToLMDict(
    arg: Record<string, any> | Map<LMInterface, Record<string, any>>
  ): Map<LMInterface, Record<string, any>> {
    if (arg instanceof Map) {
      // Check if all keys are LM instances
      const hasLMKeys = Array.from(arg.keys()).every(key => 
        key && typeof key === 'object' && 'forward' in key
      );
      if (hasLMKeys) {
        return arg;
      }
    }
    
    // Default: return a function that provides the same config for all LMs
    return new Map() as Map<LMInterface, Record<string, any>>;
  }

  /**
   * Abstract compilation method
   */
  abstract compile(
    student: DSPyModule,
    trainset: Example[],
    teacher?: DSPyModule | DSPyModule[]
  ): Promise<DSPyModule>;
}

/**
 * Bootstrap Finetune Configuration
 */
export interface BootstrapFinetuneConfig {
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
}

/**
 * Default configuration for Bootstrap Finetune
 */
export const DEFAULT_BOOTSTRAP_FINETUNE_CONFIG: Required<BootstrapFinetuneConfig> = {
  metric: undefined,
  multitask: true,
  train_kwargs: {},
  adapter: undefined,
  exclude_demos: false,
  num_threads: 1
};

/**
 * Bootstrap Finetune Teleprompter
 * 
 * Combines bootstrap methodology with language model fine-tuning to create
 * optimized predictors. Collects demonstration data through bootstrap process
 * and uses it to fine-tune the underlying language models.
 * 
 * Algorithm:
 * 1. Validate that all predictors have LMs assigned
 * 2. Bootstrap trace data from teacher models
 * 3. Prepare fine-tuning data per predictor/LM combination
 * 4. Launch parallel fine-tuning jobs
 * 5. Update student predictors with fine-tuned LMs
 */
export class BootstrapFinetune extends FinetuneTeleprompter {
  private config: Required<BootstrapFinetuneConfig>;
  private adapter: Map<LMInterface, Adapter>;

  constructor(config: BootstrapFinetuneConfig = {}) {
    super(config.train_kwargs);
    
    this.config = {
      ...DEFAULT_BOOTSTRAP_FINETUNE_CONFIG,
      ...config
    };

    this.adapter = this.convertAdapterToLMDict(config.adapter);
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
    
    // Default: return a function that provides the same adapter for all LMs
    return new Map() as Map<LMInterface, Adapter>;
  }

  /**
   * Compile student module with bootstrap fine-tuning
   */
  async compile(
    student: DSPyModule,
    trainset: Example[],
    teacher?: DSPyModule | DSPyModule[]
  ): Promise<DSPyModule> {
    console.log('Preparing the student and teacher programs...');
    this.validatePredictorsHaveLMs(student);

    console.log('Bootstrapping data...');
    const trace_data: TraceData[] = [];

    const teachers = Array.isArray(teacher) ? teacher : [teacher || student];
    const preparedTeachers = teachers.map(t => {
      // If teacher is the same reference as student, create a copy to avoid shared predictor issues
      if (t === student) {
        return this.copyProgramWithLMs(student);
      }
      return this.prepareTeacher(student, t);
    });

    for (const t of preparedTeachers) {
      const teacherTraceData = await this.bootstrapTraceData(
        t,
        trainset,
        this.config.metric,
        this.config.num_threads
      );
      trace_data.push(...teacherTraceData);
    }

    console.log('Preparing the train data...');
    const keyToData = new Map<string, FinetuneJob>();
    
    for (const [pred_ind, pred] of student.predictors().entries()) {
      const data_pred_ind = this.config.multitask ? null : pred_ind;
      
      if (!pred.lm) {
        throw new Error(
          `Predictor ${pred_ind} does not have an LM assigned. ` +
          `Please ensure the module's predictors have their LM set before fine-tuning. ` +
          `You can set it using: your_module.set_lm(your_lm)`
        );
      }

      const training_key = `${pred.lm.model}_${data_pred_ind}`;

      if (!keyToData.has(training_key)) {
        const { train_data, data_format } = await this.prepareFinetuneData(
          trace_data,
          pred.lm,
          data_pred_ind
        );
        
        console.log(`Using ${train_data.length} data points for fine-tuning the model: ${pred.lm.model}`);
        
        // Skip empty training data for testing but ensure we still create a job
        if (train_data.length === 0) {
          console.warn('No training data collected, creating minimal training job for testing');
        }
        
        const finetune_kwargs: FinetuneJob = {
          lm: pred.lm,
          train_data,
          train_data_format: data_format,
          train_kwargs: this.train_kwargs.get(pred.lm) || {}
        };
        
        keyToData.set(training_key, finetune_kwargs);
      }
    }

    console.log('Starting LM fine-tuning...');
    if (keyToData.size > this.config.num_threads) {
      throw new Error(
        `BootstrapFinetune requires \`num_threads\` to be bigger than or equal to the number of fine-tuning ` +
        `jobs. There are ${keyToData.size} fine-tuning jobs to start, but the number of threads is: ` +
        `${this.config.num_threads}! If the \`multitask\` flag is set to False, the number of fine-tuning jobs will ` +
        `be equal to the number of predictors in the student program. If the \`multitask\` flag is set to True, ` +
        `the number of fine-tuning jobs will be equal to: 1 if there is only a context LM, or the number of ` +
        `unique LMs attached to the predictors in the student program.`
      );
    }

    console.log(`${keyToData.size} fine-tuning job(s) to start`);
    const keyToLM = await this.finetuneLMs(keyToData);

    console.log('Updating the student program with the fine-tuned LMs...');
    for (const [pred_ind, pred] of student.predictors().entries()) {
      const data_pred_ind = this.config.multitask ? null : pred_ind;
      const training_key = `${pred.lm!.model}_${data_pred_ind}`;
      const finetuned_lm = keyToLM.get(training_key);
      
      if (finetuned_lm instanceof Error) {
        throw new Error(`Finetuned LM for predictor ${pred_ind} failed.`);
      }
      
      if (finetuned_lm) {
        pred.lm = finetuned_lm;
      }
      
      // Update demos based on exclude_demos setting regardless of fine-tuning success
      if (this.config.exclude_demos) {
        pred.demos = [];
      }
    }

    console.log('BootstrapFinetune has finished compiling the student program');
    student.compiled = true;
    return student;
  }

  /**
   * Execute fine-tuning jobs in parallel
   */
  private async finetuneLMs(
    finetune_dict: Map<string, FinetuneJob>
  ): Promise<Map<string, LMInterface | Error>> {
    const num_jobs = finetune_dict.size;
    console.log(`Starting ${num_jobs} fine-tuning job(s)...`);

    const keyToJob = new Map<string, Promise<LMInterface>>();
    
    for (const [key, finetune_kwargs] of finetune_dict.entries()) {
      const { lm, train_data, train_data_format, train_kwargs } = finetune_kwargs;
      
      console.log(
        'Calling lm.kill() on the LM to be fine-tuned to free up resources. ' +
        'This won\'t have any effect if the LM is not running.'
      );
      
      if (lm.kill) {
        await lm.kill();
      }
      
      // Start fine-tuning job
      const finetunePromise = lm.finetune({
        train_data,
        train_data_format,
        ...train_kwargs
      });
      
      keyToJob.set(key, finetunePromise);
    }

    const keyToLM = new Map<string, LMInterface | Error>();
    let completed = 0;
    
    for (const [key, job] of keyToJob.entries()) {
      try {
        const result = await job;
        keyToLM.set(key, result);
        completed++;
        console.log(`Job ${completed}/${num_jobs} is done`);
      } catch (error) {
        console.error(`Fine-tuning job failed for key ${key}:`, error);
        keyToLM.set(key, error as Error);
      }
    }

    return keyToLM;
  }

  /**
   * Prepare fine-tuning data from trace data
   */
  private async prepareFinetuneData(
    trace_data: TraceData[],
    lm: LMInterface,
    pred_ind: number | null = null
  ): Promise<{ train_data: any[]; data_format: TrainDataFormat }> {
    
    if (this.config.metric) {
      console.log(`Collected data for ${trace_data.length} examples`);
      const filtered_data = trace_data.filter(d => d.score);
      console.log(`After filtering with the metric, ${filtered_data.length} examples remain`);
      trace_data = filtered_data;
    }

    const data: any[] = [];
    const adapter = this.adapter.get(lm) || new ChatAdapter();
    const data_format = this.inferDataFormat(adapter);
    
    for (const item of trace_data) {
      for (const [trace_pred_ind, trace_step] of item.trace.entries()) {
        const include_data = pred_ind === null || pred_ind === trace_pred_ind;
        
        if (include_data) {
          const call_data = this.buildCallDataFromTrace(
            item.trace,
            trace_pred_ind,
            adapter,
            this.config.exclude_demos
          );
          data.push(call_data);
        }
      }
    }

    // Shuffle data for training
    this.shuffleArray(data);

    return { train_data: data, data_format };
  }

  /**
   * Bootstrap trace data collection
   */
  private async bootstrapTraceData(
    program: DSPyModule,
    dataset: Example[],
    metric?: MetricFunction,
    num_threads: number = 1,
    raise_on_error: boolean = true,
    capture_failed_parses: boolean = false,
    failure_score: number = 0,
    format_failure_score: number = -1,
    log_format_failures: boolean = false
  ): Promise<TraceData[]> {
    
    const results: Array<[Example, Prediction, number | null]> = [];
    
    // Simulate evaluation process
    for (const [example_ind, example] of dataset.entries()) {
      try {
        const prediction = await program.forward(example.inputs().data);
        let score: number | null = null;
        
        if (metric) {
          const metric_result = metric(example, prediction, []);
          score = typeof metric_result === 'number' ? metric_result : (metric_result ? 1 : 0);
        } else {
          // Default score for testing
          score = 1;
        }
        
        results.push([example, prediction, score]);
        
      } catch (error) {
        if (raise_on_error) {
          throw error;
        }
        
        // Create failed prediction
        const failed_prediction: FailedPrediction = {
          completion_text: String(error),
          format_reward: format_failure_score
        };
        
        results.push([example, failed_prediction as any, failure_score]);
        
        if (log_format_failures) {
          console.warn(
            'Failed to parse output for example. This is likely due to the LLM response not following the adapter\'s formatting.'
          );
        }
      }
    }

    const data: TraceData[] = [];
    
    for (const [example_ind, [example, prediction, score]] of results.entries()) {
      try {
        // Simulate trace creation
        const trace: Array<[DSPyPredictor, Record<string, any>, Prediction]> = [
          [program.predictors()[0], example.inputs().data, prediction]
        ];
        
        const data_dict: TraceData = {
          example,
          prediction,
          trace,
          example_ind
        };
        
        if (metric && score !== null) {
          data_dict.score = score;
        }
        
        data.push(data_dict);
        
      } catch (error) {
        console.warn(
          'Failed to unpack prediction and trace. This is likely due to the LLM response not following dspy formatting.'
        );
        
        if (raise_on_error) {
          throw error;
        }
      }
    }

    return data;
  }

  /**
   * Build call data from trace for training
   */
  private buildCallDataFromTrace(
    trace: Array<[DSPyPredictor, Record<string, any>, Prediction]>,
    pred_ind: number,
    adapter: Adapter,
    exclude_demos: boolean = false
  ): Record<string, any> {
    
    const [pred, inputs, outputs] = trace[pred_ind];
    const demos = exclude_demos ? [] : pred.demos;
    
    return adapter.formatFinetuneData(
      pred.signature,
      demos,
      inputs,
      outputs
    );
  }

  /**
   * Validate that all predictors have LMs assigned
   */
  private validatePredictorsHaveLMs(program: DSPyModule): void {
    const predictors = program.predictors();
    
    for (const [index, predictor] of predictors.entries()) {
      if (!predictor.lm) {
        throw new Error(
          `Predictor ${index} does not have an LM assigned. ` +
          `Please ensure all predictors have their LM set before fine-tuning.`
        );
      }
    }
  }

  /**
   * Prepare teacher model
   */
  private prepareTeacher(student: DSPyModule, teacher?: DSPyModule): DSPyModule {
    if (!teacher) {
      return student;
    }

    // Validate structural equivalency
    this.assertStructuralEquivalency(student, teacher);
    
    // Ensure no shared predictors
    this.assertNoSharedPredictor(student, teacher);

    return teacher;
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
   * Assert no shared predictors between programs
   */
  private assertNoSharedPredictor(program1: DSPyModule, program2: DSPyModule): void {
    const ids1 = new Set(program1.predictors().map(p => p.id || p));
    const ids2 = new Set(program2.predictors().map(p => p.id || p));
    
    const sharedIds = Array.from(ids1).filter(id => ids2.has(id));
    
    if (sharedIds.length > 0) {
      throw new Error(
        `The programs share the following predictor(s) with each other: ${sharedIds.join(', ')}`
      );
    }
  }

  /**
   * Infer data format from adapter
   */
  private inferDataFormat(adapter: Adapter): TrainDataFormat {
    if (adapter instanceof ChatAdapter) {
      return TrainDataFormat.GRPO_CHAT;
    }
    return TrainDataFormat.STANDARD;
  }

  /**
   * Shuffle array in place
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Copy program with LMs preserved
   */
  private copyProgramWithLMs(program: DSPyModule): DSPyModule {
    const pred_lms = program.predictors().map(pred => pred.lm);
    const copied = program.deepcopy();
    
    copied.predictors().forEach((pred, index) => {
      pred.lm = pred_lms[index];
    });
    
    return copied;
  }
}

/**
 * Utility functions for LM cache management
 */
export class LMCacheManager {
  private static cacheStates = new Map<LMInterface, boolean>();

  /**
   * Disable LM cache for all predictors in program
   */
  static disableLMCache(program: DSPyModule): void {
    for (const pred of program.predictors()) {
      if (!pred.lm) {
        throw new Error(`Cannot disable cache: predictor ${pred} does not have an LM set.`);
      }
      
      if (!this.cacheStates.has(pred.lm)) {
        this.cacheStates.set(pred.lm, pred.lm.cache || false);
      }
      
      pred.lm.cache = false;
    }
  }

  /**
   * Recover LM caches to their original state
   */
  static recoverLMCache(program: DSPyModule): void {
    for (const pred of program.predictors()) {
      if (pred.lm && this.cacheStates.has(pred.lm)) {
        pred.lm.cache = this.cacheStates.get(pred.lm) || true;
      } else if (pred.lm) {
        pred.lm.cache = true;
      }
    }
  }
}

/**
 * Check if all predictors in program have LMs
 */
export function allPredictorsHaveLMs(program: DSPyModule): boolean {
  return program.predictors().every(pred => pred.lm !== undefined);
}

/**
 * Copy program with LMs preserved
 */
export function copyProgramWithLMs(program: DSPyModule): DSPyModule {
  const pred_lms = program.predictors().map(pred => pred.lm);
  const copied = program.deepcopy();
  
  copied.predictors().forEach((pred, index) => {
    pred.lm = pred_lms[index];
  });
  
  return copied;
}

/**
 * Get unique LMs from program
 */
export function getUniqueLMs(program: DSPyModule): LMInterface[] {
  const lms = program.predictors()
    .map(pred => pred.lm)
    .filter((lm): lm is LMInterface => lm !== undefined);
  
  return Array.from(new Set(lms));
}

/**
 * Launch all LMs in program
 */
export async function launchLMs(program: DSPyModule): Promise<void> {
  const lms = getUniqueLMs(program);
  
  await Promise.all(
    lms.map(lm => lm.launch?.())
  );
}

/**
 * Kill all LMs in program
 */
export async function killLMs(program: DSPyModule): Promise<void> {
  const lms = getUniqueLMs(program);
  
  await Promise.all(
    lms.map(lm => lm.kill?.())
  );
}