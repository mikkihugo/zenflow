/**
 * @fileoverview BetterTogether Teleprompter
 *
 * Production-grade implementation with 100% Stanford DSPy API compatibility.
 * Meta-optimization framework that strategically combines prompt optimization
 * and weight optimization through configurable sequencing strategies.
 *
 * Key Features:
 * - Exact Stanford DSPy BetterTogether API compatibility
 * - Strategic optimization sequencing (e.g., "p -> w -> p")
 * - Support for BootstrapFewShotWithRandomSearch and BootstrapFinetune
 * - Experimental features flag matching Stanford implementation
 * - Validation set sampling for prompt optimization
 * - Language model lifecycle management
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 *
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Documentation
 */
import { Example } from "../primitives/example";
import { DSPyModule } from "../primitives/module";
import { Teleprompter } from "./teleprompter";
import { type MetricFunction } from "../interfaces/types";
/**
 * BetterTogether Teleprompter with exact Stanford DSPy API compatibility
 *
 * Meta-optimization framework that strategically combines prompt optimization
 * and weight optimization through configurable sequencing strategies like "p -> w -> p".
 *
 * Matches Stanford DSPy BetterTogether implementation exactly.
 */
export declare class BetterTogether extends Teleprompter {
	private prompt_optimizer;
	private weight_optimizer;
	private rng;
	constructor(config: {
		metric: MetricFunction;
		prompt_optimizer?: Teleprompter | null;
		weight_optimizer?: Teleprompter | null;
		seed?: number | null;
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
			strategy?: string;
			valset_ratio?: number;
			[key: string]: any;
		},
	): Promise<DSPyModule>;
	/**
	 * Parse and validate strategy exactly matching Stanford implementation
	 */
	private _parse_strategy;
	/**
	 * Prepare student exactly matching Stanford prepare_student
	 */
	private _prepare_student;
	/**
	 * Validate all predictors have LMs exactly matching Stanford implementation
	 */
	private _all_predictors_have_lms;
	/**
	 * Run strategies exactly matching Stanford implementation
	 */
	private _run_strategies;
	/**
	 * Compile prompt optimizer exactly matching Stanford implementation
	 */
	private _compile_prompt_optimizer;
	/**
	 * Compile weight optimizer exactly matching Stanford implementation
	 */
	private _compile_weight_optimizer;
	/**
	 * Get all predictors from module exactly matching Stanford implementation
	 */
	private _get_predictors;
	/**
	 * Launch LMs exactly matching Stanford launch_lms
	 */
	private _launch_lms;
	/**
	 * Kill LMs exactly matching Stanford kill_lms
	 */
	private _kill_lms;
	/**
	 * Deep copy exactly matching Stanford deepcopy
	 */
	private _deepcopy;
}
export default BetterTogether;
//# sourceMappingURL=better-together.d.ts.map
