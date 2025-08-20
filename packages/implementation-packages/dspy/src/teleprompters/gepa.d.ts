/**
 * @fileoverview GEPA (Reflective Prompt Evolution) Teleprompter Implementation
 *
 * GEPA is an evolutionary optimizer that uses reflection to evolve text components
 * of complex systems. GEPA is proposed in the paper "GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning".
 *
 * This implementation provides 100% API compatibility with Stanford DSPy GEPA.
 *
 * Key Features:
 * - Reflective prompt evolution with LLM feedback
 * - Genetic algorithm with Pareto optimization
 * - Automatic budget calculation and management
 * - Multi-objective optimization (accuracy, efficiency, diversity)
 * - Comprehensive trace capture and feedback extraction
 * - Batch inference-time search capabilities
 * - Full integration with DSPy modules and predictors
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 *
 * @see {@link https://arxiv.org/abs/2507.19457} GEPA: Reflective Prompt Evolution Paper
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Documentation
 */
import { Example } from '../primitives/example';
import { DSPyModule } from '../primitives/module';
import { type Prediction } from '../primitives/prediction';
import { Teleprompter } from './teleprompter';
import { type LMInterface } from '../interfaces/lm';
/**
 * AUTO_RUN_SETTINGS for GEPA budget configuration
 * Matches Stanford DSPy GEPA implementation exactly
 */
export declare const AUTO_RUN_SETTINGS: {
    readonly light: {
        readonly n: 6;
    };
    readonly medium: {
        readonly n: 12;
    };
    readonly heavy: {
        readonly n: 18;
    };
};
/**
 * Protocol for GEPA feedback metrics with exact Stanford API
 */
export interface GEPAFeedbackMetric {
    (gold: Example, pred: Prediction, trace?: DSPyTrace | null, pred_name?: string | null, pred_trace?: DSPyTrace | null): number | ScoreWithFeedback;
}
/**
 * DSPy trace type for execution tracking
 */
export type DSPyTrace = Array<[any, Record<string, any>, Prediction]>;
/**
 * Score with feedback for GEPA optimization
 */
export interface ScoreWithFeedback {
    score: number;
    feedback: string;
}
/**
 * Result data for GEPA optimization
 * Matches Stanford DSPy DspyGEPAResult exactly
 */
export declare class DspyGEPAResult {
    /** Proposed candidates (component_name -> component_text) */
    readonly candidates: DSPyModule[];
    /** Lineage info; for each candidate i, parents[i] is a list of parent indices or None */
    readonly parents: Array<Array<number | null>>;
    /** Per-candidate aggregate score on the validation set (higher is better) */
    readonly val_aggregate_scores: number[];
    /** Per-candidate per-instance scores on the validation set */
    readonly val_subscores: number[][];
    /** For each val instance t, a set of candidate indices achieving the best score on t */
    readonly per_val_instance_best_candidates: Set<number>[];
    /** Budget consumed up to the discovery of each candidate */
    readonly discovery_eval_counts: number[];
    /** Best outputs on validation set (optional) */
    readonly best_outputs_valset?: Array<Array<[number, Prediction[]]>> | null;
    /** Total number of metric calls made across the run */
    readonly total_metric_calls?: number | null;
    /** Number of full validation evaluations performed */
    readonly num_full_val_evals?: number | null;
    /** Where artifacts were written (if any) */
    readonly log_dir?: string | null;
    /** RNG seed for reproducibility (if known) */
    readonly seed?: number | null;
    constructor(data: {
        candidates: DSPyModule[];
        parents: Array<Array<number | null>>;
        val_aggregate_scores: number[];
        val_subscores: number[][];
        per_val_instance_best_candidates: Set<number>[];
        discovery_eval_counts: number[];
        best_outputs_valset?: Array<Array<[number, Prediction[]]>> | null;
        total_metric_calls?: number | null;
        num_full_val_evals?: number | null;
        log_dir?: string | null;
        seed?: number | null;
    });
    /** Candidate index with the highest val_aggregate_scores */
    get best_idx(): number;
    /** The program text mapping for best_idx */
    get best_candidate(): DSPyModule;
    /** Highest score achieved per validation task */
    get highest_score_achieved_per_val_task(): number[];
    /** Convert to dictionary representation */
    to_dict(): Record<string, any>;
    /** Create from GEPA result with adapter */
    static from_gepa_result(gepa_result: any, adapter: any): DspyGEPAResult;
}
/**
 * GEPA Teleprompter with exact Stanford DSPy API compatibility
 *
 * GEPA is an evolutionary optimizer that uses reflection to evolve text components
 * of complex systems. GEPA captures full traces of the DSPy module's execution,
 * identifies parts of the trace corresponding to specific predictors, and reflects
 * on the behavior to propose new instructions.
 *
 * @example
 * ```typescript
 * // Basic GEPA optimization with auto mode
 * const gepa = new GEPA({
 *   metric: (gold, pred) => gold.answer === pred.answer ? 1 : 0,
 *   auto: "light"  // Quick evolutionary optimization
 * });
 * const optimized = await gepa.compile(studentProgram, {
 *   trainset: trainingData,
 *   valset: validationData
 * });
 *
 * // Advanced GEPA with reflection and feedback
 * const advancedGepa = new GEPA({
 *   metric: (gold, pred, trace) => {
 *     const score = calculateF1Score(gold, pred);
 *     return {
 *       score,
 *       feedback: score < 0.8 ? "Consider more specific instructions" : "Good performance"
 *     };
 *   },
 *   auto: "medium",
 *   reflection_lm: async (input) => await gpt4.generate(input),
 *   candidate_selection_strategy: "pareto",  // Multi-objective optimization
 *   reflection_minibatch_size: 10,
 *   track_stats: true
 * });
 *
 * const result = await advancedGepa.compile(complexProgram, {
 *   trainset: largeTrainingSet,
 *   valset: validationSet,
 *   valset_idx: [0, 5, 10, 15]  // Select specific validation indices
 * });
 *
 * // Production GEPA with comprehensive logging
 * const productionGepa = new GEPA({
 *   metric: productionMetric,
 *   auto: "heavy",               // Maximum optimization effort
 *   reflection_lm: await openai.createModel("gpt-4"),
 *   skip_perfect_score: false,   // Continue optimizing even with perfect scores
 *   use_merge: true,             // Enable component merging
 *   max_merge_invocations: 3,    // Limit merge attempts
 *   failure_score: 0.0,          // Score for failed executions
 *   perfect_score: 1.0,          // Perfect score threshold
 *   num_threads: 4,              // Parallel evaluation
 *   log_dir: "./gepa_logs",      // Save optimization artifacts
 *   track_best_outputs: true,    // Track best outputs per validation instance
 *   use_wandb: true,             // Integration with Weights & Biases
 *   wandb_api_key: process.env.WANDB_API_KEY
 * });
 *
 * const bestProgram = await productionGepa.compile(deploymentProgram, {
 *   trainset: productionTraining,
 *   valset: productionValidation,
 *   requires_permission_to_run: false
 * });
 *
 * // Custom budget control (expert usage)
 * const customBudgetGepa = new GEPA({
 *   metric: customMetric,
 *   max_full_evals: 50,          // Manual budget control
 *   max_metric_calls: 1000,      // Total evaluation limit
 *   reflection_minibatch_size: 5,
 *   add_format_failure_as_feedback: true  // Include format errors in feedback
 * });
 *
 * const customResult = await customBudgetGepa.compile(program, {
 *   trainset: examples,
 *   valset: validation
 * });
 *
 * // Access detailed optimization results
 * console.log(`Best score: ${customResult.val_aggregate_scores[customResult.best_idx]}`);
 * console.log(`Total evaluations: ${customResult.total_metric_calls}`);
 * console.log(`Discovery budget: ${customResult.discovery_eval_counts}`);
 *
 * // Get per-instance best candidates
 * const perInstanceBest = customResult.per_val_instance_best_candidates;
 * console.log(`Best candidates per validation instance:`, perInstanceBest);
 * ```
 */
export declare class GEPA extends Teleprompter {
    private metric_fn;
    private auto?;
    private max_full_evals?;
    private max_metric_calls?;
    private reflection_minibatch_size;
    private candidate_selection_strategy;
    private reflection_lm;
    private skip_perfect_score;
    private add_format_failure_as_feedback;
    private use_merge;
    private max_merge_invocations?;
    private num_threads?;
    private failure_score;
    private perfect_score;
    private log_dir?;
    private track_stats;
    private use_wandb;
    private wandb_api_key?;
    private wandb_init_kwargs?;
    private track_best_outputs;
    private seed?;
    constructor(config: {
        metric: GEPAFeedbackMetric;
        auto?: "light" | "medium" | "heavy" | null;
        max_full_evals?: number | null;
        max_metric_calls?: number | null;
        reflection_minibatch_size?: number;
        candidate_selection_strategy?: "pareto" | "current_best";
        reflection_lm?: LMInterface | null;
        skip_perfect_score?: boolean;
        add_format_failure_as_feedback?: boolean;
        use_merge?: boolean;
        max_merge_invocations?: number | null;
        num_threads?: number | null;
        failure_score?: number;
        perfect_score?: number;
        log_dir?: string | null;
        track_stats?: boolean;
        use_wandb?: boolean;
        wandb_api_key?: string | null;
        wandb_init_kwargs?: Record<string, any> | null;
        track_best_outputs?: boolean;
        seed?: number | null;
    });
    /**
     * Auto budget calculation matching Stanford DSPy implementation
     */
    auto_budget(num_preds: number, num_candidates: number, valset_size: number, minibatch_size?: number, full_eval_steps?: number): number;
    /**
     * Compile method with exact Stanford DSPy API
     */
    compile(student: DSPyModule, config: {
        trainset: Example[];
        teacher?: DSPyModule | null;
        valset?: Example[] | null;
        [key: string]: any;
    }): Promise<DSPyModule>;
    /**
     * Create feedback function for predictor
     */
    private createFeedbackFunction;
    /**
     * Create DSPy adapter for evaluation coordination
     */
    private createDspyAdapter;
    /**
     * Core GEPA optimization algorithm
     */
    private optimize;
    /**
     * Generate new candidates through reflective mutation
     */
    private generateCandidates;
    /**
     * Mutate candidate using reflection strategy
     */
    private mutateCandidate;
    /**
     * Simplify instruction by removing redundancy
     */
    private simplifyInstruction;
    /**
     * Elaborate instruction with more detail
     */
    private elaborateInstruction;
    /**
     * Specialize instruction for domain
     */
    private specializeInstruction;
    /**
     * Generalize instruction for broader applicability
     */
    private generalizeInstruction;
    /**
     * Debug instruction to fix issues
     */
    private debugInstruction;
    /**
     * Check if candidate is duplicate
     */
    private isDuplicate;
    /**
     * Create seeded random number generator
     */
    private createSeededRNG;
}
export default GEPA;
//# sourceMappingURL=gepa.d.ts.map