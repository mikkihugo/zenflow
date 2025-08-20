/**
 * @fileoverview Avatar Optimizer Teleprompter
 *
 * Production-grade implementation with 100% Stanford DSPy API compatibility.
 * Avatar optimizer for tool-using agents that optimizes instructions based on
 * performance feedback from positive and negative examples.
 *
 * Key Features:
 * - Exact Stanford DSPy AvatarOptimizer API compatibility
 * - Multi-threaded evaluation with parallel processing
 * - Feedback-based instruction generation
 * - Positive/negative example analysis
 * - Tool usage optimization
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
 * Evaluation result with actions exactly matching Stanford DSPy EvalResult
 */
export interface EvalResult {
    example: Record<string, any>;
    score: number;
    actions?: any[] | null;
}
/**
 * Action output from Avatar execution exactly matching Stanford DSPy ActionOutput
 */
export interface ActionOutput {
    action: string;
    input: any;
    output: any;
    success: boolean;
}
/**
 * Comparator signature for analyzing positive vs negative examples
 * Exactly matches Stanford DSPy Comparator signature
 */
export interface ComparatorSignature {
    instruction: string;
    actions: string[];
    pos_input_with_metrics: EvalResult[];
    neg_input_with_metrics: EvalResult[];
    feedback: string;
}
/**
 * Feedback-based instruction generation signature
 * Exactly matches Stanford DSPy FeedbackBasedInstruction signature
 */
export interface FeedbackBasedInstructionSignature {
    previous_instruction: string;
    feedback: string;
    new_instruction: string;
}
/**
 * Avatar module interface exactly matching Stanford DSPy expectations
 */
export interface AvatarModule extends DSPyModule {
    actor: {
        signature: {
            instructions: string;
            with_instructions: (instructions: string) => any;
            [key: string]: any;
        };
        [key: string]: any;
    };
    actor_clone?: any;
    tools: any[];
}
/**
 * Avatar Optimizer Teleprompter with exact Stanford DSPy API compatibility
 *
 * Optimizes tool-using agent instructions by analyzing performance patterns
 * between positive and negative examples through iterative feedback generation.
 *
 * Matches Stanford DSPy AvatarOptimizer implementation exactly.
 */
export declare class AvatarOptimizer extends Teleprompter {
    private metric;
    private max_iters;
    private lower_bound;
    private upper_bound;
    private max_positive_inputs;
    private max_negative_inputs;
    private optimize_for;
    private comparator;
    private feedback_instruction;
    constructor(config: {
        metric: MetricFunction;
        max_iters?: number;
        lower_bound?: number;
        upper_bound?: number;
        max_positive_inputs?: number | null;
        max_negative_inputs?: number | null;
        optimize_for?: string;
    });
    /**
     * Compile method exactly matching Stanford DSPy API
     */
    compile(student: AvatarModule, config: {
        trainset: Example[];
        teacher?: DSPyModule | null;
        valset?: Example[] | null;
        [key: string]: any;
    }): Promise<AvatarModule>;
    /**
     * Process single example exactly matching Stanford implementation
     */
    private process_example;
    /**
     * Thread-safe evaluator exactly matching Stanford implementation
     */
    private thread_safe_evaluator;
    /**
     * Get positive and negative results exactly matching Stanford implementation
     */
    private _get_pos_neg_results;
    /**
     * Create comparator exactly matching Stanford implementation
     */
    private _createComparator;
    /**
     * Create feedback instruction predictor exactly matching Stanford implementation
     */
    private _createFeedbackInstruction;
    /**
     * Sample array exactly matching Stanford random.sample
     */
    private _sample;
    /**
     * Deep copy exactly matching Stanford deepcopy
     */
    private _deepcopy;
}
export default AvatarOptimizer;
//# sourceMappingURL=avatar-optimizer.d.ts.map