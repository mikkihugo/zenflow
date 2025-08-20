/**
 * @fileoverview COPRO (Constraint-Only Prompt Optimization) Teleprompter
 *
 * Production-grade implementation with 100% Stanford DSPy API compatibility.
 * Optimizes DSPy module signatures using constraint-only prompt optimization,
 * focusing on improving instructions and output prefixes without demonstrations.
 *
 * Key Features:
 * - Exact Stanford DSPy COPRO API compatibility
 * - Iterative instruction generation with breadth/depth search
 * - LLM-based instruction improvement using previous attempts
 * - Automatic duplicate detection and filtering
 * - Statistics tracking for optimization analysis
 * - Multi-predictor support with cross-predictor evaluation
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
 * Signature for basic instruction generation
 * Matches Stanford DSPy BasicGenerateInstruction exactly
 */
export interface BasicGenerateInstructionSignature {
    basic_instruction: string;
    proposed_instruction: string;
    proposed_prefix_for_output_field: string;
}
/**
 * Signature for instruction generation with previous attempts
 * Matches Stanford DSPy GenerateInstructionGivenAttempts exactly
 */
export interface GenerateInstructionGivenAttemptsSignature {
    attempted_instructions: string[];
    proposed_instruction: string;
    proposed_prefix_for_output_field: string;
}
/**
 * Instruction completions structure matching Stanford DSPy
 */
export interface InstructionCompletions {
    proposed_instruction: string[];
    proposed_prefix_for_output_field: string[];
}
/**
 * Optimization candidate exactly matching Stanford DSPy format
 */
export interface CoproCandidate {
    program: DSPyModule;
    instruction: string;
    prefix: string;
    score: number;
    depth: number;
}
/**
 * Statistics tracking structure matching Stanford DSPy
 */
export interface CoproStats {
    results_best: Record<string, {
        depth: number[];
        max: number[];
        average: number[];
        min: number[];
        std: number[];
    }>;
    results_latest: Record<string, {
        depth: number[];
        max: number[];
        average: number[];
        min: number[];
        std: number[];
    }>;
    total_calls: number;
}
/**
 * COPRO Teleprompter with exact Stanford DSPy API compatibility
 *
 * Constraint-Only Prompt Optimization teleprompter that optimizes instructions
 * and output prefixes through iterative LLM-based generation and evaluation.
 *
 * Matches Stanford DSPy COPRO implementation exactly.
 *
 * @example
 * ```typescript
 * // Basic COPRO optimization
 * const copro = new COPRO({
 *   prompt_model: gpt4,
 *   metric: accuracyMetric
 * });
 *
 * const optimized = await copro.compile(program, {
 *   trainset: trainingData
 * });
 *
 * // Advanced COPRO with custom search parameters
 * const advancedCopro = new COPRO({
 *   prompt_model: gpt4,
 *   metric: f1ScoreMetric,
 *   breadth: 10,        // Generate 10 candidates per round
 *   depth: 5,           // Search 5 levels deep
 *   init_temperature: 1.4,
 *   track_stats: true   // Enable detailed statistics
 * });
 *
 * const result = await advancedCopro.compile(complexProgram, {
 *   trainset: examples,
 *   valset: validation,
 *   eval_kwargs: { num_threads: 4 }
 * });
 *
 * // Access optimization statistics
 * const stats = advancedCopro.getStats();
 * console.log(`Total LM calls: ${stats.total_calls}`);
 * ```
 */
export declare class COPRO extends Teleprompter {
    private metric?;
    private breadth;
    private depth;
    private init_temperature;
    private prompt_model?;
    private track_stats;
    private name2predictor;
    private predictor2name;
    private evaluated_candidates;
    private results_best;
    private results_latest;
    private total_calls;
    constructor(config?: {
        prompt_model?: any;
        metric?: MetricFunction | null;
        breadth?: number;
        depth?: number;
        init_temperature?: number;
        track_stats?: boolean;
    });
    /**
     * Compile method exactly matching Stanford DSPy API
     */
    compile(student: DSPyModule, config: {
        trainset: Example[];
        teacher?: DSPyModule | null;
        valset?: Example[] | null;
        eval_kwargs?: Record<string, any>;
        [key: string]: any;
    }): Promise<DSPyModule>;
    /**
     * Initialize tracking structures exactly matching Stanford implementation
     */
    private _initializeTracking;
    /**
     * Create evaluate function matching Stanford implementation
     */
    private _createEvaluate;
    /**
     * Generate basic instruction variations matching Stanford implementation
     */
    private _generateBasicInstructions;
    /**
     * Generate instructions from attempt history matching Stanford implementation
     */
    private _generateInstructionsFromAttempts;
    /**
     * Build attempt history exactly matching Stanford implementation
     */
    private _buildAttemptHistory;
    /**
     * Get best candidate exactly matching Stanford implementation
     */
    private _getBestCandidate;
    /**
     * Drop duplicates exactly matching Stanford implementation
     */
    private _dropDuplicates;
    /**
     * Check if candidates are equal exactly matching Stanford implementation
     */
    private _checkCandidatesEqual;
    /**
     * Update latest statistics exactly matching Stanford implementation
     */
    private _updateLatestStats;
    /**
     * Update best statistics exactly matching Stanford implementation
     */
    private _updateBestStats;
    /**
     * Calculate standard deviation exactly matching Stanford implementation
     */
    private _calculateStd;
    /**
     * Helper methods matching Stanford implementation exactly
     */
    private _getPredictorId;
    private _getSignature;
    private _getOutputPrefix;
    private _updateSignature;
    private _generateId;
}
export default COPRO;
//# sourceMappingURL=copro.d.ts.map