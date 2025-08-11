/**
 * DSPy Wrapper Architecture for Claude-Zen.
 *
 * This module provides a comprehensive wrapper/adapter layer that bridges the gap between:
 * 1. Claude-Zen's expected DSPy interface (full program creation, optimization, execution)
 * 2. Dspy.ts v0.1.3's actual API (basic LMDriver abstraction only).
 *
 * The wrapper implements the expected DSPy interface using the available LMDriver,
 * providing program-like functionality through structured prompting and response parsing.
 */
/**
 * @file Dspy-wrapper-architecture implementation.
 */
import { type LMDriver } from 'dspy.ts';
export interface DSPyProgram {
    signature: string;
    description: string;
    examples: Array<{
        input: any;
        output: any;
    }>;
    optimized: boolean;
    performance: {
        successRate: number;
        averageLatency: number;
        totalExecutions: number;
    };
}
export interface DSPyExecutionResult {
    [key: string]: any;
    confidence?: number;
    reasoning?: string;
    metadata?: {
        executionTime: number;
        tokensUsed?: number;
        promptUsed: string;
    };
}
export interface DSPyOptimizationOptions {
    strategy: 'auto' | 'manual' | 'bootstrap' | 'teleprompter';
    maxIterations?: number;
    validationThreshold?: number;
    temperature?: number;
}
export interface DSPyConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    enableLogging?: boolean;
    optimizationEnabled?: boolean;
}
/**
 * Main DSPy wrapper class that provides the expected DSPy interface.
 * Uses the available dspy.ts LMDriver under the hood.
 *
 * @example
 */
export declare class DSPy {
    private lmDriver;
    private config;
    private programs;
    private executionHistory;
    constructor(config?: DSPyConfig);
    /**
     * Create a DSPy program with signature and description.
     * Mimics the expected DSPy.createProgram interface.
     *
     * @param signature
     * @param description
     */
    createProgram(signature: string, description: string): Promise<DSPyProgram>;
    /**
     * Execute a DSPy program with given inputs.
     * Converts the program signature into structured prompts for the LM.
     *
     * @param program
     * @param inputs
     */
    execute(program: DSPyProgram, inputs: Record<string, any>): Promise<DSPyExecutionResult>;
    /**
     * Add examples to a program for optimization.
     *
     * @param program
     * @param examples
     */
    addExamples(program: DSPyProgram, examples: Array<{
        input: any;
        output: any;
        success?: boolean;
    }>): Promise<void>;
    /**
     * Optimize a program using examples and execution history.
     *
     * @param program
     * @param options
     */
    optimize(program: DSPyProgram, options?: DSPyOptimizationOptions): Promise<void>;
    /**
     * Get execution statistics and performance metrics.
     */
    getStats(): {
        totalPrograms: number;
        totalExecutions: number;
        averageExecutionTime: number;
        optimizedPrograms: number;
        recentExecutions: number;
    };
    private generateProgramId;
    private findProgramId;
    private parseSignature;
    private buildExecutionPrompt;
    private parseExecutionResult;
    private extractFieldFromText;
    private updateProgramMetrics;
    private performOptimization;
}
/**
 * Factory function to create DSPy wrapper instances.
 *
 * @param config
 * @example
 */
export declare function createDSPyWrapper(config?: DSPyConfig): DSPy;
/**
 * Configure the global DSPy wrapper with specific LM driver.
 *
 * @param config
 * @example
 */
export declare function configureDSPyWrapper(config: DSPyConfig): void;
/**
 * Get available LM drivers for DSPy wrapper.
 *
 * @example
 */
export declare function getAvailableLMDrivers(): string[];
/**
 * Create specific LM driver instances.
 *
 * @param driverType
 * @param config
 * @example
 */
export declare function createLMDriver(driverType: string, config: any): LMDriver;
export default DSPy;
//# sourceMappingURL=dspy-wrapper-architecture.d.ts.map