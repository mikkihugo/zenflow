/**
 * @fileoverview DSPy Module - Production Grade
 *
 * Core DSPy module abstraction for all DSPy programs and teleprompters.
 * 100% compatible with Stanford DSPy's Module interface.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * Abstract base class for all DSPy modules
 * Exact match with Stanford DSPy's Module class
 */
export declare abstract class DSPyModule {
	/**
	 * Whether the module has been compiled/optimized
	 */
	compiled: boolean;
	/**
	 * Forward pass through the module
	 */
	abstract forward(inputs: any): Promise<any>;
	/**
	 * Get all predictors in this module
	 */
	predictors(): any[];
	/**
	 * Get named predictors in this module
	 */
	namedPredictors(): [string, any][];
	/**
	 * Stanford DSPy compatible named_predictors method
	 */
	named_predictors(): [string, any][];
	/**
	 * Deep copy the module
	 */
	deepcopy(): DSPyModule;
	/**
	 * Stanford DSPy compatible reset_copy method
	 */
	reset_copy(): DSPyModule;
	/**
	 * Set language model for all predictors
	 */
	setLM(lm: any): void;
	/**
	 * Reset all predictors
	 */
	reset(): void;
	/**
	 * Get training history (if available)
	 */
	getTrainingHistory(): any[];
	/**
	 * Get module parameters
	 */
	getParameters(): Record<string, any>;
	/**
	 * Save module state
	 */
	save(): Record<string, any>;
	/**
	 * Load module state
	 */
	load(_state: Record<string, any>): void;
}
export { DSPyModule as default };
//# sourceMappingURL=module.d.ts.map
