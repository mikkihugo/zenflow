/**
 * @fileoverview Base Teleprompter Class - 100% Stanford DSPy API Compatible
 *
 * Abstract base class for all DSPy teleprompters.
 * Provides the foundation for program optimization and improvement.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */

import type { DSPyModule, Example } from "../lib/index.js";

/**
 * Compilation options for teleprompters
 */
export interface CompileOptions {
	/** Training dataset */
	trainset: Example[];
	/** Validation dataset (optional) */
	valset?: Example[];
	/** Teacher program (optional) */
	teacher?: DSPyModule | DSPyModule[];
	/** Additional compilation parameters */
	[key: string]: any;
}

/**
 * Teleprompter metrics interface
 */
export interface TeleprompterMetrics {
	/** Final score achieved */
	score: number;
	/** Number of optimization steps */
	steps: number;
	/** Training time in milliseconds */
	training_time: number;
	/** Additional metrics */
	[key: string]: any;
}

/**
 * Optimization result interface
 */
export interface OptimizationResult {
	/** Optimized program */
	program: DSPyModule;
	/** Optimization metrics */
	metrics: TeleprompterMetrics;
	/** Whether optimization was successful */
	success: boolean;
}

/**
 * Abstract base class for all DSPy teleprompters
 *
 * This class provides the interface that all teleprompters must implement.
 * It follows the exact API design of Stanford DSPy's Teleprompter class.
 *
 * EXACT Stanford DSPy API:
 * def compile(self, student: Module, *, trainset: list[Example], teacher: Module|None = None, valset: list[Example]|None = None, **kwargs) -> Module:
 *
 * @abstract
 */
export abstract class Teleprompter {
	/**
	 * Compile and optimize a DSPy program
	 *
	 * This method implements the exact Stanford DSPy Teleprompter API signature:
	 * compile(student, *, trainset, teacher=None, valset=None, **kwargs) -> Module
	 *
	 * In TypeScript, we simulate keyword-only args using a required config object after student.
	 *
	 * @param student The student program to optimize (required positional)
	 * @param config Required configuration object with trainset and optional parameters
	 * @param config.trainset Training dataset (required)
	 * @param config.teacher Teacher program (optional)
	 * @param config.valset Validation dataset (optional)
	 * @param config.kwargs Additional keyword arguments (optional)
	 * @returns Promise resolving to the optimized program
	 */
	abstract compile(
		student: DSPyModule,
		config: {
			trainset: Example[];
			teacher?: DSPyModule | null;
			valset?: Example[] | null;
			[key: string]: any;
		},
	): Promise<DSPyModule>;

	/**
	 * Get teleprompter parameters (matches Stanford get_params())
	 * Returns all instance attributes as a dictionary
	 */
	getParams(): Record<string, any> {
		// Return all enumerable properties (matches Python __dict__)
		const params: Record<string, any> = {};
		for (const key in this) {
			if (Object.hasOwn(this, key) && typeof this[key] !== "function") {
				params[key] = this[key];
			}
		}
		return params;
	}

	/**
	 * Get teleprompter configuration (alias for getParams for backwards compatibility)
	 * Optional method for teleprompters to expose their configuration
	 */
	getConfig?(): Record<string, any>;

	/**
	 * Reset teleprompter state
	 * Optional method for stateful teleprompters
	 */
	reset?(): void;
}

/**
 * Default export for compatibility
 */
export default Teleprompter;
