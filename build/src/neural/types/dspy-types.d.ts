/**
 * @file DSPy Types and Configurations.
 *
 * Comprehensive type definitions, constants, error classes, and type guards.
 * for DSPy integration in the neural system.
 *
 * Created by: Agent Juliet - Neural Domain TypeScript Error Elimination.
 * Purpose: Provide all missing types, constants, and utilities for DSPy wrapper.
 */
/**
 * Configuration interface for DSPy language model setup.
 *
 * @example
 */
export interface DSPyConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    baseURL?: string;
    modelParams?: Record<string, any>;
    timeout?: number;
    retryCount?: number;
    enableLogging?: boolean;
}
/**
 * Training example structure for DSPy programs.
 *
 * @example
 */
export interface DSPyExample {
    input: Record<string, any>;
    output: Record<string, any>;
    metadata?: {
        source?: string;
        quality?: number;
        tags?: string[];
    };
}
/**
 * Result from DSPy program execution.
 *
 * @example
 */
export interface DSPyExecutionResult {
    success: boolean;
    result?: Record<string, any>;
    metadata: {
        executionTime: number;
        confidence: number;
        timestamp?: Date;
        model?: string;
        tokensUsed?: number;
        [key: string]: any;
    };
    error?: Error;
}
/**
 * Configuration for DSPy program optimization.
 *
 * @example
 */
export interface DSPyOptimizationConfig {
    strategy: 'bootstrap' | 'mipro' | 'copro' | 'auto' | 'custom';
    maxIterations: number;
    minExamples?: number;
    evaluationMetric?: string;
    validationSplit?: number;
    earlyStoppingPatience?: number;
    strategyParams?: Record<string, any>;
}
/**
 * Result from DSPy program optimization.
 *
 * @example
 */
export interface DSPyOptimizationResult {
    success: boolean;
    program: DSPyProgram;
    metrics: {
        iterationsCompleted: number;
        executionTime: number;
        initialAccuracy?: number;
        finalAccuracy?: number;
        improvementPercent: number;
    };
    issues?: string[];
}
/**
 * DSPy program interface with execution capabilities.
 *
 * @example
 */
export interface DSPyProgram {
    id?: string;
    signature: string;
    description: string;
    forward(input: Record<string, any>): Promise<Record<string, any>>;
    getMetadata?(): DSPyProgramMetadata;
}
/**
 * Metadata for DSPy program tracking.
 *
 * @example
 */
export interface DSPyProgramMetadata {
    signature: string;
    description: string;
    createdAt: Date;
    lastExecuted?: Date;
    executionCount: number;
    averageExecutionTime: number;
    examples: DSPyExample[];
}
/**
 * Main DSPy wrapper interface.
 *
 * @example
 */
export interface DSPyWrapper {
    configure(config: DSPyConfig): Promise<void>;
    createProgram(signature: string, description: string): Promise<DSPyProgram>;
    execute(program: DSPyProgram, input: Record<string, any>): Promise<DSPyExecutionResult>;
    addExamples(program: DSPyProgram, examples: DSPyExample[]): Promise<void>;
    optimize(program: DSPyProgram, config?: DSPyOptimizationConfig): Promise<DSPyOptimizationResult>;
    getConfig(): DSPyConfig | null;
    healthCheck(): Promise<boolean>;
    getStats(): any;
    cleanup(): Promise<void>;
}
/**
 * Default DSPy configuration with sensible defaults.
 */
declare const DEFAULT_DSPY_CONFIG: DSPyConfig;
/**
 * Default optimization configuration for DSPy programs.
 */
declare const DEFAULT_OPTIMIZATION_CONFIG: DSPyOptimizationConfig;
/**
 * System limits and constraints for DSPy operations.
 */
declare const DSPY_LIMITS: {
    readonly MAX_PROGRAMS_PER_WRAPPER: 50;
    readonly MAX_EXAMPLES: 1000;
    readonly MAX_SIGNATURE_LENGTH: 500;
    readonly MAX_DESCRIPTION_LENGTH: 2000;
    readonly MAX_INPUT_SIZE: 10000;
    readonly MAX_OUTPUT_SIZE: 10000;
    readonly MIN_OPTIMIZATION_EXAMPLES: 5;
    readonly MAX_OPTIMIZATION_ITERATIONS: 100;
    readonly DEFAULT_TIMEOUT_MS: 30000;
    readonly MAX_CONCURRENT_EXECUTIONS: 5;
};
/**
 * Base error class for DSPy-related errors.
 *
 * @example
 */
declare class DSPyBaseError extends Error {
    readonly code: string;
    readonly context: Record<string, any> | undefined;
    readonly timestamp: Date;
    constructor(message: string, code: string, context?: Record<string, any>);
}
/**
 * Error thrown when DSPy API calls fail.
 *
 * @example
 */
declare class DSPyAPIError extends DSPyBaseError {
    constructor(message: string, context?: Record<string, any>);
}
/**
 * Error thrown when DSPy configuration is invalid.
 *
 * @example
 */
declare class DSPyConfigurationError extends DSPyBaseError {
    constructor(message: string, context?: Record<string, any>);
}
/**
 * Error thrown during DSPy program execution.
 *
 * @example
 */
declare class DSPyExecutionError extends DSPyBaseError {
    constructor(message: string, context?: Record<string, any>);
}
/**
 * Error thrown during DSPy program optimization.
 *
 * @example
 */
declare class DSPyOptimizationError extends DSPyBaseError {
    constructor(message: string, context?: Record<string, any>);
}
/**
 * Type guard to check if an object is a valid DSPyConfig.
 *
 * @param obj
 * @example
 */
declare function isDSPyConfig(obj: any): obj is DSPyConfig;
/**
 * Type guard to check if an object is a valid DSPyProgram.
 *
 * @param obj
 * @example
 */
declare function isDSPyProgram(obj: any): obj is DSPyProgram;
/**
 * Type guard to check if an object is a valid DSPyExample.
 *
 * @param obj
 * @example
 */
declare function isDSPyExample(obj: any): obj is DSPyExample;
/**
 * Type guard to check if an object is a valid DSPyOptimizationConfig.
 *
 * @param obj
 * @example
 */
declare function isDSPyOptimizationConfig(obj: any): obj is DSPyOptimizationConfig;
/**
 * Validates and normalizes a DSPy configuration.
 *
 * @param config
 * @example
 */
declare function validateDSPyConfig(config: Partial<DSPyConfig>): DSPyConfig;
/**
 * Validates a DSPy program signature format.
 *
 * @param signature
 * @example
 */
declare function validateSignature(signature: string): boolean;
/**
 * Creates a validation error with detailed context.
 *
 * @param field
 * @param value
 * @param expected
 * @example
 */
declare function createValidationError(field: string, value: any, expected: string): DSPyConfigurationError;
/**
 * Sanitizes input for DSPy operations.
 *
 * @param input
 * @example
 */
declare function sanitizeInput(input: Record<string, any>): Record<string, any>;
/**
 * Performance metrics for DSPy operations.
 *
 * @example
 */
export interface DSPyPerformanceMetrics {
    executionTime: number;
    memoryUsage?: number;
    tokensUsed?: number;
    cacheHitRate?: number;
    errorRate?: number;
    throughput?: number;
}
/**
 * Health check result for DSPy systems.
 *
 * @example
 */
export interface DSPyHealthCheck {
    healthy: boolean;
    timestamp: Date;
    checks: {
        apiConnectivity: boolean;
        modelAvailability: boolean;
        memoryUsage: boolean;
        responseTime: boolean;
    };
    issues?: string[];
    metrics?: DSPyPerformanceMetrics;
}
/**
 * DSPy System Statistics.
 *
 * @example
 */
export interface DSPySystemStats {
    totalPrograms: number;
    programsByType: Record<string, number>;
    totalExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    memoryUsage: number;
    performance: {
        coreOperations: {
            totalPrograms: number;
            totalExecutions: number;
            successRate: number;
            averageExecutionTime: number;
        };
        swarmIntelligence: {
            totalPrograms: number;
            totalExecutions: number;
            successRate: number;
            averageExecutionTime: number;
        };
        mcpTools: {
            totalPrograms: number;
            totalExecutions: number;
            successRate: number;
            averageExecutionTime: number;
        };
    };
    unified: {
        totalPrograms: number;
        totalDecisions: number;
        overallSuccessRate: number;
        learningVelocity: number;
        systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    };
}
export { DEFAULT_DSPY_CONFIG, DEFAULT_OPTIMIZATION_CONFIG, DSPY_LIMITS, DSPyBaseError, DSPyAPIError, DSPyConfigurationError, DSPyExecutionError, DSPyOptimizationError, isDSPyConfig, isDSPyProgram, isDSPyExample, isDSPyOptimizationConfig, validateDSPyConfig, validateSignature, createValidationError, sanitizeInput, };
//# sourceMappingURL=dspy-types.d.ts.map