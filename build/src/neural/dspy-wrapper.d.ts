/**
 * @file TypeScript Wrapper for DSPy Integration.
 *
 * Provides a type-safe, unified interface to the ruvnet dspy.ts package
 * with proper error handling, validation, and consistent API patterns.
 *
 * Created by: Type-System-Analyst agent.
 * Purpose: Centralize all DSPy API access with full TypeScript support.
 */
import { type DSPyConfig, type DSPyExample, type DSPyExecutionResult, type DSPyOptimizationConfig, type DSPyOptimizationResult, type DSPyProgram, type DSPyWrapper } from './types/index.ts';
/**
 * Type-safe wrapper implementation for the dspy.ts package
 * Provides consistent API across all DSPy integrations in claude-code-zen.
 *
 * @example
 */
export declare class DSPyWrapperImpl implements DSPyWrapper {
    private dspyInstance;
    private currentConfig;
    private programs;
    private isInitialized;
    constructor(initialConfig?: DSPyConfig);
    /**
     * Configure the DSPy language model with proper error handling.
     *
     * @param config
     */
    configure(config: DSPyConfig): Promise<void>;
    /**
     * Create a new DSPy program with type safety and validation.
     *
     * @param signature
     * @param description
     */
    createProgram(signature: string, description: string): Promise<DSPyProgram>;
    /**
     * Execute a program with comprehensive error handling and result validation.
     *
     * @param program
     * @param input
     */
    execute(program: DSPyProgram, input: Record<string, any>): Promise<DSPyExecutionResult>;
    /**
     * Add training examples to a program with validation.
     *
     * @param program
     * @param examples
     */
    addExamples(program: DSPyProgram, examples: DSPyExample[]): Promise<void>;
    /**
     * Optimize a program with comprehensive configuration and result handling.
     *
     * @param program
     * @param config
     */
    optimize(program: DSPyProgram, config?: DSPyOptimizationConfig): Promise<DSPyOptimizationResult>;
    /**
     * Get current configuration.
     */
    getConfig(): DSPyConfig | null;
    /**
     * Health check for DSPy system.
     */
    healthCheck(): Promise<boolean>;
    /**
     * Get statistics about the wrapper usage.
     */
    getStats(): {
        isInitialized: boolean;
        currentConfig: DSPyConfig | null;
        programCount: number;
        programs: {
            id: string;
            signature: string;
            description: string;
            executionCount: number;
            averageExecutionTime: number;
        }[];
    };
    /**
     * Clean up resources.
     */
    cleanup(): Promise<void>;
    private ensureInitialized;
}
/**
 * Create a new DSPy wrapper with configuration.
 *
 * @param config
 * @example
 */
export declare function createDSPyWrapper(config: DSPyConfig): Promise<DSPyWrapper>;
/**
 * Create a DSPy wrapper with default configuration.
 *
 * @example
 */
export declare function createDefaultDSPyWrapper(): Promise<DSPyWrapper>;
export declare function getSingletonDSPyWrapper(config?: DSPyConfig): Promise<DSPyWrapper>;
export type { DSPyWrapper, DSPyProgram };
export default DSPyWrapperImpl;
//# sourceMappingURL=dspy-wrapper.d.ts.map