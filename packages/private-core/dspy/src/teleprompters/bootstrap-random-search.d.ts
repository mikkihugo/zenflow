/**
 * @fileoverview Bootstrap Few-Shot with Random Search Teleprompter
 *
 * Production-grade implementation with 100% Stanford DSPy API compatibility.
 * Advanced teleprompter that combines the Bootstrap Few-Shot approach with
 * systematic random search across multiple candidate configurations.
 *
 * Key Features:
 * - Exact Stanford DSPy BootstrapFewShotWithRandomSearch API compatibility
 * - Multiple candidate program generation with different random seeds
 * - Progressive evaluation strategies (zero-shot, labeled-only, bootstrap)
 * - Parallel evaluation with configurable thread limits
 * - Early stopping based on score thresholds
 * - Comprehensive candidate comparison and selection
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
 * Candidate program evaluation result exactly matching Stanford DSPy
 */
export interface CandidateResult {
  score: number;
  subscores: number[];
  seed: number;
  program: DSPyModule;
}
/**
 * Bootstrap Few-Shot with Random Search Teleprompter
 *
 * Exactly matches Stanford DSPy BootstrapFewShotWithRandomSearch implementation.
 * Systematically explores the space of few-shot demonstrations by generating
 * multiple candidate programs using different bootstrap configurations and
 * random seeds.
 *
 * @example
 * ```typescript
 * // Basic random search with default settings
 * const randomSearch = new BootstrapFewShotWithRandomSearch({
 *   metric: exactMatchMetric,
 *   max_bootstrapped_demos: 4,
 *   num_candidate_programs: 16  // Try 16 different configurations
 * });
 *
 * const optimized = await randomSearch.compile(studentProgram, {
 *   trainset: trainingData,
 *   valset: validationData
 * });
 *
 * // Advanced search with early stopping
 * const earlyStopSearch = new BootstrapFewShotWithRandomSearch({
 *   metric: f1ScoreMetric,
 *   max_bootstrapped_demos: 8,
 *   max_labeled_demos: 16,
 *   num_candidate_programs: 32,
 *   stop_at_score: 0.95,        // Stop if score >= 0.95
 *   metric_threshold: 0.7,      // Only consider demos with score >= 0.7
 *   max_rounds: 3,              // Multiple bootstrap rounds per candidate
 *   max_errors: 10              // Allow some failures
 * });
 *
 * const result = await earlyStopSearch.compile(complexProgram, {
 *   trainset: largeTrainingSet,
 *   valset: validationSet
 * });
 *
 * // Parallel search for faster execution
 * const parallelSearch = new BootstrapFewShotWithRandomSearch({
 *   metric: accuracyMetric,
 *   max_bootstrapped_demos: 6,
 *   num_candidate_programs: 20,
 *   num_threads: 4,             // Evaluate 4 candidates in parallel
 *   teacher_settings: {
 *     temperature: 0.7,         // Teacher model configuration
 *     max_tokens: 150
 *   }
 * });
 *
 * const parallelResult = await parallelSearch.compile(program, {
 *   trainset: examples,
 *   valset: validation
 * });
 *
 * // Production search with comprehensive evaluation
 * const productionSearch = new BootstrapFewShotWithRandomSearch({
 *   metric: (gold, pred) => {
 *     // Custom metric with detailed scoring
 *     const exact = gold.answer === pred.answer ? 1 : 0;
 *     const semantic = calculateSemanticSimilarity(gold.answer, pred.answer);
 *     return exact * 0.7 + semantic * 0.3;  // Weighted combination
 *   },
 *   max_bootstrapped_demos: 10,
 *   max_labeled_demos: 20,
 *   num_candidate_programs: 50,  // Extensive search
 *   stop_at_score: 0.98,         // High quality threshold
 *   metric_threshold: 0.8,       // Strict demo filtering
 *   max_rounds: 5,               // Thorough bootstrapping
 *   num_threads: 8,              // Maximum parallelization
 *   max_errors: 20               // Allow for exploration
 * });
 *
 * try {
 *   const bestProgram = await productionSearch.compile(deploymentProgram, {
 *     trainset: productionTraining,
 *     valset: productionValidation
 *   });
 *
 *   console.log('Random search completed successfully');
 *   console.log('Best program performance:', await evaluate(bestProgram, testSet));
 * } catch (error) {
 *   console.error('Random search failed:', error.message);
 * }
 *
 * // Custom search with specific strategies
 * const strategicSearch = new BootstrapFewShotWithRandomSearch({
 *   metric: domainSpecificMetric,
 *   max_bootstrapped_demos: 4,
 *   num_candidate_programs: 12,
 *   teacher_settings: {
 *     strategy: 'diverse_sampling',  // Custom teacher behavior
 *     exploration_factor: 0.3
 *   }
 * });
 *
 * // Search with different demonstration counts
 * const adaptiveSearch = new BootstrapFewShotWithRandomSearch({
 *   metric: adaptiveMetric,
 *   max_bootstrapped_demos: 8,      // Will try 1, 2, 3, ..., 8 demos
 *   max_labeled_demos: 12,          // Will try 0, 4, 8, 12 labeled demos
 *   num_candidate_programs: 24,     // Comprehensive exploration
 *   stop_at_score: undefined,       // No early stopping - full exploration
 *   metric_threshold: 0.6           // Moderate demo quality threshold
 * });
 *
 * const adaptiveResult = await adaptiveSearch.compile(adaptiveProgram, {
 *   trainset: diverseTrainingSet,
 *   valset: representativeValidation
 * });
 * ```
 */
export declare class BootstrapFewShotWithRandomSearch extends Teleprompter {
  private metric;
  private teacher_settings;
  private max_rounds;
  private num_threads?;
  private stop_at_score?;
  private metric_threshold?;
  private min_num_samples;
  private max_num_samples;
  private max_errors?;
  private num_candidate_sets;
  private max_labeled_demos;
  private trainset;
  private valset;
  constructor(config: {
    metric: MetricFunction;
    teacher_settings?: Record<string, any> | null;
    max_bootstrapped_demos?: number;
    max_labeled_demos?: number;
    max_rounds?: number;
    num_candidate_programs?: number;
    num_threads?: number | null;
    max_errors?: number | null;
    stop_at_score?: number | null;
    metric_threshold?: number | null;
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
      restrict?: number[] | null;
      labeled_sample?: boolean;
      [key: string]: any;
    }
  ): Promise<DSPyModule>;
  /**
   * Evaluate program exactly matching Stanford Evaluate class behavior
   */
  private evaluateProgram;
  /**
   * Shuffle array with seeded random exactly matching Stanford random.Random(seed).shuffle
   */
  private shuffleArray;
  /**
   * Seeded random integer exactly matching Stanford random.Random(seed).randint
   */
  private seededRandomInt;
  /**
   * Create seeded RNG exactly matching Stanford random.Random behavior
   */
  private createSeededRNG;
}
export default BootstrapFewShotWithRandomSearch;
//# sourceMappingURL=bootstrap-random-search.d.ts.map
