/**
 * @fileoverview BootstrapFinetune Teleprompter - 100% Stanford DSPy API Compatible
 *
 * Direct TypeScript port of Stanford's dspy/teleprompt/bootstrap_finetune.py
 * Maintains exact API compatibility with original Python implementation.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 * @see {@link https://github.com/stanfordnlp/dspy/blob/main/dspy/teleprompt/bootstrap_finetune.py} Original Implementation
 */
import { Teleprompter } from './teleprompter.js';
import { DSPyModule } from '../primitives/module';
import type { Example } from '../primitives/example';
import type { Prediction } from '../primitives/prediction';
import type { LMInterface } from '../interfaces/lm';
import type { MetricFunction } from '../interfaces/types';
import type { Adapter } from '../interfaces/adapter';
/**
 * Data format types for fine-tuning
 */
export type DataFormat = 'chat|completion|instruction';
/**
 * Failed prediction class for error handling
 */
export declare class FailedPrediction {
  completion_text: string;
  format_reward?: number|null;
  constructor(completion_text: string, format_reward?: number|null);
}
/**
 * Trace data interface
 */
export interface TraceData {
  example_ind: number;
  example: Example;
  prediction: Prediction;
  trace: Array<[any, Record<string, any>, Prediction]>;
  score?: number|null;
}
/**
 * Fine-tuning job interface
 */
export interface FinetuneJob {
  result(): Promise<LMInterface|Error>;
  thread: {
    join(): void;
  };
}
/**
 * Abstract base class for fine-tuning teleprompters
 * Exact port of Stanford DSPy's FinetuneTeleprompter
 */
export declare abstract class FinetuneTeleprompter extends Teleprompter {
  protected trainKwargs: Map<LMInterface, any>;
  constructor(
    train_kwargs?:|Record<string, any>|Map<LMInterface, Record<string, any>>|null
  );
  /**
   * Convert train_kwargs to LM-specific dictionary
   * Exact port of Stanford DSPy's convert_to_lm_dict
   */
  static convertToLMDict(arg: any): Map<LMInterface, any>;
  private static isLMInterface;
  protected convertToLMDict(arg: any): Map<LMInterface, any>;
}
/**
 * Configuration interface for BootstrapFinetune teleprompter
 * Exact match with Stanford DSPy BootstrapFinetune constructor
 */
export interface BootstrapFinetuneConfig {
  /** Metric function for evaluation */
  metric?: MetricFunction|null;
  /** Whether to use multitask fine-tuning */
  multitask?: boolean;
  /** Training kwargs for fine-tuning */
  train_kwargs?:|Record<string, any>|Map<LMInterface, Record<string, any>>|null;
  /** Adapter for formatting fine-tuning data */
  adapter?: Adapter|Map<LMInterface, Adapter>|null;
  /** Whether to exclude demos after fine-tuning */
  exclude_demos?: boolean;
  /** Number of threads for evaluation */
  num_threads?: number|null;
}
/**
 * BootstrapFinetune Teleprompter
 *
 * 100% compatible with Stanford DSPy's BootstrapFinetune teleprompter.
 * Bootstraps training data and fine-tunes language models for improved performance.
 *
 * @example
 * ```typescript
 * // Basic fine-tuning with bootstrapped demonstrations
 * const bootstrapFinetune = new BootstrapFinetune({
 *   metric: exactMatchMetric
 * });
 *
 * const fineTunedProgram = await bootstrapFinetune.compile(studentProgram, {
 *   trainset: trainingData,
 *   teacher: teacherProgram
 * });
 *
 * // Advanced fine-tuning with custom configuration
 * const advancedFinetune = new BootstrapFinetune({
 *   metric: f1ScoreMetric,
 *   multitask: false,           // Single-task fine-tuning
 *   adapter: new ChatAdapter({  // Custom format adapter
 *     model: 'gpt-3.5-turbo',
 *     system_prompt: 'You are a helpful assistant'
 *   }),
 *   exclude_demos: true,        // Exclude demo examples from fine-tuning
 *   num_threads: 4,             // Parallel processing
 *   train_kwargs: {
 *     learning_rate: 1e-5,      // Custom training parameters
 *     batch_size: 16,
 *     epochs: 3,
 *     warmup_steps: 100
 *   }
 * });
 *
 * const advancedResult = await advancedFinetune.compile(complexProgram, {
 *   trainset: largeTrainingSet,
 *   teacher: [teacher1, teacher2, teacher3],  // Multiple teachers
 *   valset: validationSet
 * });
 *
 * // Production fine-tuning with comprehensive setup
 * const productionFinetune = new BootstrapFinetune({
 *   metric: (gold, pred, trace) => {
 *     // Custom metric with trace analysis
 *     const accuracy = gold.answer === pred.answer ? 1 : 0;
 *     const efficiency = trace ? 1 / trace.length : 0.5;  // Prefer shorter traces
 *     return accuracy * 0.8 + efficiency * 0.2;
 *   },
 *   multitask: true,            // Multi-task learning
 *   adapter: new Map([          // Model-specific adapters
 *     [gpt35Model, new ChatAdapter({ model: 'gpt-3.5-turbo' })],
 *     [gpt4Model, new ChatAdapter({ model: 'gpt-4' })],
 *     [customModel, new CompletionAdapter({ format: 'instruction' })]
 *   ]),
 *   exclude_demos: false,       // Include demonstrations
 *   num_threads: 8,             // High parallelism
 *   train_kwargs: new Map([     // Model-specific training params
 *     [gpt35Model, {
 *       learning_rate: 2e-5,
 *       batch_size: 32,
 *       epochs: 5,
 *       validation_split: 0.1
 *     }],
 *     [gpt4Model, {
 *       learning_rate: 5e-6,    // Lower LR for larger model
 *       batch_size: 16,
 *       epochs: 3,
 *       gradient_clipping: 1.0
 *     }]
 *   ])
 * });
 *
 * try {
 *   const productionProgram = await productionFinetune.compile(deploymentProgram, {
 *     trainset: productionTraining,
 *     teacher: ensembleTeacher,
 *     valset: productionValidation
 *   });
 *
 *   console.log('Fine-tuning completed successfully');
 *
 *   // Evaluate fine-tuned model
 *   const testResults = await evaluate(productionProgram, testSet);
 *   console.log('Test performance:', testResults);
 * } catch (error) {
 *   console.error('Fine-tuning failed:', error.message);
 * }
 *
 * // Domain-specific fine-tuning
 * const domainFinetune = new BootstrapFinetune({
 *   metric: domainSpecificMetric,
 *   multitask: true,
 *   adapter: new InstructionAdapter({
 *     format: 'chat',
 *     system_message: 'You are an expert in medical diagnosis',
 *     response_format: 'structured'*   }),
 *   train_kwargs: {
 *     learning_rate: 1e-5,
 *     batch_size: 8,           // Smaller batch for specialized domain
 *     epochs: 10,              // More epochs for domain adaptation
 *     regularization: 0.01,    // Prevent overfitting
 *     early_stopping: true,
 *     patience: 3
 *   }
 * });
 *
 * const domainExpertProgram = await domainFinetune.compile(medicalProgram, {
 *   trainset: medicalTrainingCases,
 *   teacher: expertMedicalProgram,
 *   valset: medicalValidationCases
 * });
 *
 * // Multi-stage fine-tuning pipeline
 * async function multiStageFineTuning(baseProgram, datasets) {
 *   // Stage 1: General capability fine-tuning
 *   const stage1 = new BootstrapFinetune({
 *     metric: generalMetric,
 *     multitask: true,
 *     exclude_demos: true,
 *     train_kwargs: { learning_rate: 2e-5, epochs: 3 }
 *   });
 *
 *   const generalProgram = await stage1.compile(baseProgram, {
 *     trainset: datasets.general,
 *     teacher: generalTeacher
 *   });
 *
 *   // Stage 2: Task-specific fine-tuning
 *   const stage2 = new BootstrapFinetune({
 *     metric: taskSpecificMetric,
 *     multitask: false,
 *     exclude_demos: false,
 *     train_kwargs: { learning_rate: 1e-5, epochs: 5 }
 *   });
 *
 *   const taskProgram = await stage2.compile(generalProgram, {
 *     trainset: datasets.taskSpecific,
 *     teacher: taskSpecificTeacher,
 *     valset: datasets.validation
 *   });
 *
 *   return taskProgram;
 * }
 *
 * const multiStageProgram = await multiStageFineTuning(baseProgram, {
 *   general: generalTrainingData,
 *   taskSpecific: taskTrainingData,
 *   validation: validationData
 * });
 * ```
 */
export declare class BootstrapFinetune extends FinetuneTeleprompter {
  private config;
  private adapterMap;
  /**
   * Initialize BootstrapFinetune teleprompter
   * Exact API match with Stanford DSPy constructor
   */
  constructor(config?: BootstrapFinetuneConfig);
  /**
   * Compile student program with fine-tuning
   * Exact API match with Stanford DSPy compile method
   */
  compile(
    student: DSPyModule,
    config: {
      trainset: Example[];
      teacher?: DSPyModule|DSPyModule[]|null;
      valset?: Example[]|null;
      [key: string]: any;
    }
  ): Promise<DSPyModule>;
  /**
   * Fine-tune language models
   * Exact port of Stanford DSPy's finetune_lms static method
   */
  private finetuneLMs;
  /**
   * Prepare fine-tuning data from trace data
   */
  private prepareFinetuneData;
  /**
   * Build call data from trace
   */
  private buildCallDataFromTrace;
  /**
   * Bootstrap trace data
   */
  private bootstrapTraceData;
  /**
   * Check if all predictors have LMs assigned
   */
  private allPredictorsHaveLMs;
  /**
   * Prepare teacher program
   */
  private prepareTeacher;
  /**
   * Validate structural equivalency between student and teacher
   */
  private validateStructuralEquivalency;
  /**
   * Validate that student and teacher don't share predictor objects
   */
  private validateSharedPredictors;
  /**
   * Get configuration
   */
  getConfig(): Required<BootstrapFinetuneConfig>;
}
export { BootstrapFinetune as BootstrapFinetuneTeleprompter };
export default BootstrapFinetune;
//# sourceMappingURL=bootstrap-finetune.d.ts.map
