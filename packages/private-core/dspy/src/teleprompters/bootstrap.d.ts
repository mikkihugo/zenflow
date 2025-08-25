/**
 * @fileoverview BootstrapFewShot Teleprompter Implementation
 *
 * Production-grade implementation with 100% Stanford DSPy API compatibility.
 * Core teleprompter for generating few-shot demonstrations by running a teacher model
 * on training examples and collecting successful traces.
 *
 * Key Features:
 * - Exact Stanford DSPy BootstrapFewShot API compatibility
 * - Teacher/Student model coordination for bootstrapping
 * - Metric-based validation of generated examples
 * - Iterative trace collection and compilation
 * - Integration with labeled examples
 * - Error handling and robust execution
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 *
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Documentation
 */
import { Example } from '../primitives/example';
import { DSPyModule } from '../primitives/module';
import { Teleprompter } from './teleprompter';
import { type MetricFunction } from '../interfaces/types';
/**
 * LabeledFewShot teleprompter matching Stanford DSPy vanilla.py implementation
 * Used as a component in Bootstrap and other teleprompters
 */
export declare class LabeledFewShot extends Teleprompter {
  private k;
  constructor(k?: number);
  /**
   * Compile module with labeled few-shot examples
   * Matches Stanford DSPy API exactly: compile(student, *, trainset, teacher=None, valset=None, **kwargs)
   */
  compile(
    student: DSPyModule,
    config: {
      trainset: Example[];
      teacher?: DSPyModule | null;
      valset?: Example[] | null;
      [key: string]: any;
    }
  ): Promise<DSPyModule>;
}
/**
 * BootstrapFewShot Teleprompter with exact Stanford DSPy API compatibility
 *
 * A Teleprompter class that composes a set of demos/examples to go into a predictor's prompt.
 * These demos come from a combination of labeled examples in the training set, and bootstrapped demos.
 *
 * Matches Stanford DSPy BootstrapFewShot implementation exactly.
 *
 * @example
 * ```typescript
 * // Basic bootstrapping with default settings
 * const bootstrap = new BootstrapFewShot();
 * const optimizedProgram = await bootstrap.compile(studentProgram, {
 *   trainset: trainingExamples,
 *   teacher: teacherProgram
 * });
 *
 * // Advanced bootstrapping with custom configuration
 * const bootstrap = new BootstrapFewShot({
 *   metric: accuracyMetric,
 *   metric_threshold: 0.8,
 *   max_bootstrapped_demos: 8,
 *   max_labeled_demos: 16,
 *   max_rounds: 3,
 *   max_errors: 10
 * });
 *
 * const result = await bootstrap.compile(studentProgram, {
 *   trainset: trainingData,
 *   teacher: teacherModel,
 *   valset: validationData
 * });
 *
 * // Self-bootstrapping (student teaches itself)
 * const selfBootstrap = new BootstrapFewShot({
 *   max_bootstrapped_demos: 4,
 *   max_labeled_demos: 8
 * });
 *
 * const improved = await selfBootstrap.compile(myProgram, {
 *   trainset: examples
 *   // No teacher specified - program teaches itself
 * });
 * ```
 */
export declare class BootstrapFewShot extends Teleprompter {
  private metric?;
  private metric_threshold?;
  private teacher_settings;
  private max_bootstrapped_demos;
  private max_labeled_demos;
  private max_rounds;
  private max_errors?;
  private error_count;
  private trainset;
  private validation;
  private student?;
  private teacher?;
  private name2predictor;
  private predictor2name;
  private name2traces;
  constructor(config?: {
    metric?: MetricFunction | null;
    metric_threshold?: number | null;
    teacher_settings?: Record<string, any> | null;
    max_bootstrapped_demos?: number;
    max_labeled_demos?: number;
    max_rounds?: number;
    max_errors?: number | null;
  });
  /**
   * Compile method exactly matching Stanford DSPy API
   */
  compile(
    student: DSPyModule,
    config: {
      trainset: Example[];
      teacher?: DSPyModule | null;
      valset?: Example[] | null;
      [key: string]: any;
    }
  ): Promise<DSPyModule>;
  /**
   * Prepare student and teacher models exactly matching Stanford implementation
   */
  private _prepare_student_and_teacher;
  /**
   * Prepare predictor mappings exactly matching Stanford implementation
   */
  private _prepare_predictor_mappings;
  /**
   * Bootstrap demonstrations exactly matching Stanford implementation
   */
  private _bootstrap;
  /**
   * Bootstrap one example exactly matching Stanford implementation
   */
  private _bootstrap_one_example;
  /**
   * Train student with collected demonstrations exactly matching Stanford implementation
   */
  private _train;
  /**
   * Helper methods for Stanford DSPy compatibility
   */
  private getObjectId;
  private examplesEqual;
  private shuffleArray;
  private sampleArray;
  private hashDemos;
  private createSeededRNG;
}
export interface BootstrapConfig {
  metric?: MetricFunction | null;
  metric_threshold?: number | null;
  teacher_settings?: Record<string, any> | null;
  max_bootstrapped_demos?: number;
  max_labeled_demos?: number;
  max_rounds?: number;
  max_errors?: number | null;
}
export declare const DEFAULT_BOOTSTRAP_CONFIG: BootstrapConfig;
export interface BootstrapCompileOptions {
  student: DSPyModule;
  teacher?: DSPyModule | null;
  trainset: Example[];
}
export default BootstrapFewShot;
//# sourceMappingURL=bootstrap.d.ts.map
