/**
 * @fileoverview DSPy Type Definitions - Standalone Implementation
 *
 * Type definitions for the lightweight DSPy engine with @claude-zen/foundation integration.
 * Designed for prompt optimization, few-shot learning, and pattern recognition.
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @license MIT
 */

/**
 * DSPy Configuration Interface
 */
export interface DSPyConfig {
	/** Maximum optimization iterations */
	maxIterations:number;
	/** Number of few-shot examples to use */
	fewShotExamples:number;
	/** LLM temperature for optimization */
	temperature:number;
	/** LLM model to use */
	model:string;
	/** Metrics to track during optimization */
	metrics:string[];
	/** Enable swarm coordination (future enhancement) */
	swarmCoordination:boolean;
}

/**
 * DSPy Training Example
 */
export interface DSPyExample {
	/** Unique example identifier */
	id:string;
	/** Input text or data */
	input:string;
	/** Expected output */
	output:string;
	/** Optional metadata */
	metadata?:{
		createdAt:Date;
		source?:string;
		difficulty?:"easy|medium|hard";
		tags?:string[];
};
}

/**
 * DSPy Program Definition
 */
export interface DSPyProgram {
	/** Unique program identifier */
	id:string;
	/** Human-readable name */
	name:string;
	/** Input/output signature */
	signature:string;
	/** Current prompt */
	prompt:string;
	/** Training examples */
	examples:DSPyExample[];
	/** Performance metrics */
	metrics:DSPyMetrics;
}

/**
 * DSPy Performance Metrics
 */
export interface DSPyMetrics {
	/** Accuracy score (0-1) */
	accuracy:number;
	/** Response latency in ms */
	latency:number;
	/** Token usage estimate */
	tokenUsage:number;
	/** Cost estimate in USD */
	cost:number;
	/** Iterations completed */
	iterationsCompleted:number;
	/** Best score achieved */
	bestScore:number;
}

/**
 * DSPy Prompt Variation
 */
export interface DSPyPromptVariation {
	/** The prompt text */
	prompt:string;
	/** Optimization strategy used */
	strategy:"few-shot-optimization" | "fallback" | "manual";
	/** Iteration number */
	iteration:number;
	/** Evaluation score */
	score:number;
}

/**
 * DSPy Optimization Result
 */
export interface DSPyOptimizationResult {
	/** Program ID that was optimized */
	programId:string;
	/** Original prompt */
	originalPrompt:string;
	/** Optimized prompt */
	optimizedPrompt:string;
	/** Improvement score */
	improvement:number;
	/** Number of iterations performed */
	iterations:number;
	/** All prompt variations tried */
	variations:DSPyPromptVariation[];
	/** Final metrics */
	metrics:{
		accuracy:number;
		latency:number;
		tokenUsage:number;
		cost:number;
};
	/** Optimization timestamp */
	timestamp:Date;
	/** Configuration used */
	config:DSPyConfig;
}

/**
 * DSPy Optimization Strategy
 */
export type DSPyOptimizationStrategy = "few-shot-optimization"; // Use few-shot examples for improvement|'iterative-refinement'// Iterative prompt refinement|' pattern-matching'// Match successful patterns|' fallback'; // Simple fallback strategy

/**
 * DSPy Pattern for Learning
 */
export interface DSPyPattern {
	/** Pattern identifier */
	id:string;
	/** Pattern type */
	type:"prompt-template" | "example-structure" | "optimization-strategy";
	/** Pattern content */
	pattern:string;
	/** Effectiveness score */
	effectiveness:number;
	/** Usage count */
	usageCount:number;
	/** Last used timestamp */
	lastUsed:Date;
	/** Context where pattern works well */
	contexts:string[];
}

/**
 * DSPy Task Configuration
 */
export interface DSPyTaskConfig {
	/** Task identifier */
	taskId:string;
	/** Task description */
	description:string;
	/** Training dataset */
	dataset:DSPyExample[];
	/** Optimization settings */
	optimization:{
		maxIterations:number;
		strategy:DSPyOptimizationStrategy;
		parallelization:boolean;
};
	/** Persistence settings */
	persistence:{
		saveResults:boolean;
		learnFromResults:boolean;
};
}

/**
 * DSPy Engine Statistics
 */
export interface DSPyEngineStats {
	/** Total optimizations performed */
	totalOptimizations:number;
	/** Average improvement achieved */
	averageImprovement:number;
	/** Best improvement achieved */
	bestImprovement:number;
	/** Total tasks optimized */
	totalTasks:number;
}

/**
 * DSPy Storage Interface
 */
export interface DSPyStorage {
	/** Store optimization result */
	storeResult(taskId:string, result:DSPyOptimizationResult): Promise<void>;
	/** Get optimization history */
	getHistory(taskId:string): Promise<DSPyOptimizationResult[]>;
	/** Store learned pattern */
	storePattern(pattern:DSPyPattern): Promise<void>;
	/** Get effective patterns */
	getPatterns(context:string): Promise<DSPyPattern[]>;
	/** Clear all data */
	clear():Promise<void>;
}

/**
 * DSPy Example Generator Function
 */
export type DSPyExampleGenerator = (
	task:string,
	count:number,
	context?:any,
) => Promise<DSPyExample[]>;

/**
 * DSPy Prompt Evaluator Function
 */
export type DSPyPromptEvaluator = (
	prompt:string,
	examples:DSPyExample[],
) => Promise<number>;

/**
 * DSPy Configuration Validator
 */
export interface DSPyConfigValidator {
	/** Validate configuration */
	validate(config:any): { valid: boolean; errors: string[]};
}

/**
 * DSPy Utility Types
 */
export namespace DSPyUtils {
	/** Create examples from raw data */
	export type CreateExamples = (
		data:Array<{ input: string; output: string}>,
	) => DSPyExample[];

	/** Validate configuration */
	export type ValidateConfig = (config:any) => {
		valid:boolean;
		errors:string[];
};

	/** Extract patterns from results */
	export type ExtractPatterns = (
		results:DSPyOptimizationResult[],
	) => DSPyPattern[];
}
