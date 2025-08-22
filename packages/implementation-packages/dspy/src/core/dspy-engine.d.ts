/**
 * @fileoverview DSPy Engine - Standalone Prompt Optimization
 *
 * Lightweight DSPy (Distributed System Programming) implementation for prompt optimization,
 * few-shot learning, and neural pattern coordination. Uses @claude-zen/foundation for LLM,
 * logging, and storage when available, with fallback implementations.
 *
 * ## Core Features
 * - **Prompt Optimization**: Systematic iterative improvement
 * - **Few-Shot Learning**: Automatic example selection and optimization
 * - **Pattern Recognition**: Learn from successful optimization patterns
 * - **Fallback Architecture**: Works standalone or with shared infrastructure
 *
 * @example
 * ```typescript
 * import { DSPyEngine } from './engine';
 *
 * const engine = new DSPyEngine({
 *   maxIterations: 10,
 *   fewShotExamples: 5
 * });
 *
 * const optimized = await engine.optimizePrompt('task description', examples);
 * ```
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @license MIT
 */
import type { DSPyConfig, DSPyExample, DSPyOptimizationResult } from '../types/interfaces';
/**
 * Simple KV storage interface for DSPy persistence
 */
export interface DSPyKV {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<boolean>;
    keys(): Promise<string[]>;
}
/**
 * DSPy Engine - Standalone Prompt Optimization
 *
 * Lightweight implementation that uses @claude-zen/foundation when available,
 * falls back to simple implementations when standalone.
 */
export declare class DSPyEngine {
    private config;
    private kv;
    private llmService;
    private optimizationHistory;
    constructor(config?: Partial<DSPyConfig>);
    /**
     * Initialize storage (foundation integration)
     */
    private getKV;
    /**
     * Get LLM service (foundation integration)
     */
    private getLLMService;
    /**
     * Optimize a prompt using DSPy methodology
     */
    optimizePrompt(task: string, examples: DSPyExample[], initialPrompt?: string): Promise<DSPyOptimizationResult>;
    /**
     * Generate a new prompt variation
     */
    private generatePromptVariation;
    /**
     * Evaluate a prompt variation
     */
    private evaluatePromptVariation;
    /**
     * Simple similarity calculation (placeholder)
     */
    private calculateSimilarity;
    /**
     * Create few-shot prompt from examples (available for future enhancement)
     */
    /**
     * Extract prompt from LLM response
     */
    private extractPromptFromResponse;
    /**
     * Create initial metrics structure
     */
    private createInitialMetrics;
    /**
     * Store optimization result
     */
    private storeOptimizationResult;
    /**
     * Get optimization history for a task
     */
    getOptimizationHistory(task: string): Promise<DSPyOptimizationResult[]>;
    /**
     * Get DSPy engine statistics
     */
    getStats(): Promise<{
        totalOptimizations: number;
        averageImprovement: number;
        bestImprovement: number;
        totalTasks: number;
    }>;
    /**
     * Clear all stored optimization data
     */
    clear(): Promise<void>;
}
/**
 * Create DSPy engine instance with default configuration
 */
export declare function createDSPyEngine(config?: Partial<DSPyConfig>): DSPyEngine;
/**
 * DSPy utility functions
 */
export declare const dspyUtils: {
    /**
     * Create training examples from data
     */
    createExamples(data: Array<{
        input: string;
        output: string;
    }>): DSPyExample[];
    /**
     * Validate DSPy configuration
     */
    validateConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
};
export default DSPyEngine;
//# sourceMappingURL=dspy-engine.d.ts.map