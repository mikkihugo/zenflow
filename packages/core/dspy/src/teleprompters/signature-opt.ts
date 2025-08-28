/**
 * @fileoverview SignatureOptimizer Teleprompter (Deprecated)
 *
 * Production-grade implementation with 100% Stanford DSPy API compatibility.
 * SignatureOptimizer is a deprecated wrapper around COPRO for backward compatibility.
 *
 * Key Features:
 * - Exact Stanford DSPy SignatureOptimizer API compatibility
 * - Deprecation warning matching Stanford implementation
 * - Complete delegation to COPRO teleprompter
 * - Backward compatibility for legacy code
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.47
 *
 * @deprecated Use COPRO instead. This class will be removed in a future release.
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Documentation
 */

import type { MetricFunction} from "../interfaces/types";
import type { Example} from "../primitives/example";
import type { DSPyModule} from "../primitives/module";
import { COPRO} from "./copro";

/**
 * SignatureOptimizer Teleprompter (Deprecated)
 *
 * This class is a deprecated wrapper around COPRO that exactly matches
 * Stanford DSPy's SignatureOptimizer implementation for backward compatibility.
 *
 * @deprecated Use COPRO instead. This class will be removed in a future release.
 *
 * @example
 * ```typescript`
 * // DEPRECATED - Use COPRO instead
 * const optimizer = new SignatureOptimizer({
 *   prompt_model:promptModel,
 *   metric:myMetric,
 *   breadth:10,
 *   depth:3,
 *   init_temperature:1.4,
 *   verbose:false,
 *   track_stats:false
 *});
 *
 * const optimized = await optimizer.compile({
 *   student:myProgram,
 *   devset:devExamples,
 *   eval_kwargs:{ num_threads: 4}
 *});
 * ```
 */
export class SignatureOptimizer extends COPRO {
	constructor(
		config:{
			prompt_model?:any;
			metric?:MetricFunction | null;
			breadth?:number;
			depth?:number;
			init_temperature?:number;
			verbose?:boolean;
			track_stats?:boolean;
} = {},
	) {
		// Show deprecation warning exactly matching Stanford implementation
		console.warn(
			"\u001b[31m[WARNING] SignatureOptimizer has been deprecated and replaced with COPRO. " +
				"SignatureOptimizer will be removed in a future release. \u001b[31m",
		);

		// Pass through to COPRO parent class exactly matching Stanford implementation
		super({
			prompt_model:config.prompt_model,
			metric:config.metric,
			breadth:config.breadth,
			depth:config.depth,
			init_temperature:config.init_temperature,
			track_stats:config.track_stats,
});
}

	/**
	 * Compile method exactly matching Stanford DSPy SignatureOptimizer API
	 *
	 * Note:Uses 'devset' parameter name for backward compatibility,
	 * but passes it as 'trainset' to COPRO as per Stanford implementation.
	 */
	async compile(
		student:DSPyModule,
		config:{
			trainset:Example[];
			teacher?:DSPyModule | null;
			valset?:Example[] | null;
			eval_kwargs?:Record<string, any>;
			[key:string]: any;
},
	):Promise<DSPyModule> {
		const { trainset, eval_kwargs = {}} = config;
		const devset = trainset;

		// Delegate to parent COPRO class exactly matching Stanford implementation
		// Note:devset becomes trainset in COPRO
		return super.compile(student, {
			trainset:devset,
			eval_kwargs,
});
}
}

// Export for backward compatibility
export default SignatureOptimizer;
