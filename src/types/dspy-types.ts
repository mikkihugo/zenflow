/**
 * @file TypeScript Type Definitions for DSPy Integration
 * 
 * Provides comprehensive type safety for the ruvnet dspy.ts package integration
 * with proper wrapper interfaces, configuration types, and API contracts.
 * 
 * Created by: Type-System-Analyst agent
 * Purpose: Ensure type safety across all DSPy integrations in claude-code-zen
 */

// =============================================================================
// Core DSPy API Types (Wrapper Interfaces for dspy.ts package)
// =============================================================================

/**
 * Configuration interface for DSPy Language Model setup
 * Maps to the actual dspy.ts configureLM function parameters
 */
export interface DSPyConfig {
  /** Language model to use (e.g., 'gpt-4o-mini', 'gpt-4', 'claude-3') */
  model?: string;
  /** Temperature for model responses (0.0 - 2.0) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** API key for the model provider */
  apiKey?: string;
  /** Base URL for API requests */
  baseURL?: string;
  /** Additional model-specific parameters */
  modelParams?: Record<string, any>;
}

/**
 * DSPy Program interface - represents a compiled DSPy program
 * This wraps the actual DSPyProgram from dspy.ts with type safety
 */
export interface DSPyProgram {
  /** Unique identifier for the program */
  id?: string;
  /** Program signature (input -> output format) */
  signature: string;
  /** Description of what this program does */
  description: string;
  /** Execute the program with typed inputs */
  forward(input: Record<string, any>): Promise<Record<string, any>>;
  /** Get program metadata */
  getMetadata?(): DSPyProgramMetadata;
}

/**
 * Metadata for DSPy programs
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
 * Training example for DSPy programs
 */
export interface DSPyExample {
  input: Record<string, any>;
  output: Record<string, any>;
  metadata?: {
    quality?: number;
    timestamp?: Date;
    source?: string;
  };
}

/**
 * DSPy optimization configuration
 */
export interface DSPyOptimizationConfig {
  /** Optimization strategy to use */
  strategy: 'auto' | 'bootstrap' | 'mipro' | 'copro' | 'custom';
  /** Maximum iterations for optimization */
  maxIterations?: number;
  /** Minimum examples required for optimization */
  minExamples?: number;
  /** Target metric to optimize for */
  targetMetric?: string;
  /** Optimization timeout in milliseconds */
  timeout?: number;
  /** Additional strategy-specific parameters */
  strategyParams?: Record<string, any>;
}

/**
 * Result of DSPy optimization process
 */
export interface DSPyOptimizationResult {
  /** Whether optimization was successful */
  success: boolean;
  /** Optimized program instance */
  program: DSPyProgram;
  /** Optimization metrics */
  metrics: {
    initialAccuracy?: number;
    finalAccuracy?: number;
    improvementPercent?: number;
    iterationsCompleted: number;
    executionTime: number;
  };
  /** Any errors or warnings during optimization */
  issues?: string[];
}

/**
 * DSPy execution result with comprehensive metadata
 */
export interface DSPyExecutionResult {
  /** Whether execution was successful */
  success: boolean;
  /** Raw result from the program */
  result: Record<string, any>;
  /** Execution metadata */
  metadata: {
    executionTime: number;
    tokensUsed?: number;
    confidence?: number;
    model?: string;
    timestamp: Date;
  };
  /** Any errors that occurred */
  error?: Error;
}

// =============================================================================
// TypeScript Wrapper Classes for DSPy API
// =============================================================================

/**
 * Type-safe wrapper around the dspy.ts package
 * Provides consistent API with proper error handling and type safety
 */
export interface DSPyWrapper {
  /** Configure the language model */
  configure(config: DSPyConfig): Promise<void>;
  
  /** Create a new DSPy program */
  createProgram(signature: string, description: string): Promise<DSPyProgram>;
  
  /** Execute a program with type safety */
  execute(program: DSPyProgram, input: Record<string, any>): Promise<DSPyExecutionResult>;
  
  /** Add training examples to a program */
  addExamples(program: DSPyProgram, examples: DSPyExample[]): Promise<void>;
  
  /** Optimize a program with examples */
  optimize(program: DSPyProgram, config?: DSPyOptimizationConfig): Promise<DSPyOptimizationResult>;
  
  /** Get the current language model configuration */
  getConfig(): DSPyConfig | null;
  
  /** Health check for the DSPy system */
  healthCheck(): Promise<boolean>;
  
  /** Clean up resources */
  cleanup?(): Promise<void>;
}

// =============================================================================
// Integration-Specific Types for Claude-Code-Zen
// =============================================================================

/**
 * DSPy Agent Types (for agent integration)
 */
export type DSPyAgentType =
  | 'prompt-optimizer'
  | 'example-generator'
  | 'metric-analyzer'
  | 'pipeline-tuner'
  | 'neural-enhancer';

/**
 * DSPy Agent Configuration
 */
export interface DSPyAgentConfig {
  type: DSPyAgentType;
  capabilities: string[];
  specializedPrompts: DSPyAgentPrompts;
  optimization: {
    enableContinuousLearning: boolean;
    learningInterval: number;
    maxExamples: number;
    minAccuracy: number;
  };
}

/**
 * Specialized prompts for each DSPy agent type
 */
export interface DSPyAgentPrompts {
  systemPrompt: string;
  behaviorPrompt: string;
  expertisePrompt: string;
  taskPrompt: string;
}

/**
 * DSPy System Statistics
 */
export interface DSPySystemStats {
  totalPrograms: number;
  programsByType: Record<string, number>;
  totalExecutions: number;
  averageExecutionTime: number;
  successRate: number;
  memoryUsage: number;
  lastOptimization?: Date;
  performance: {
    coreOperations: DSPyOperationStats;
    swarmIntelligence: DSPyOperationStats;
    mcpTools: DSPyOperationStats;
  };
}

/**
 * Statistics for specific DSPy operation types
 */
export interface DSPyOperationStats {
  totalPrograms: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecution?: Date;
  mostUsedProgram?: string;
}

// =============================================================================
// Error Types for DSPy Integration
// =============================================================================

/**
 * Base class for all DSPy-related errors
 */
export abstract class DSPyError extends Error {
  abstract readonly type: string;
  public readonly timestamp: Date;
  public readonly context: Record<string, any>;

  constructor(message: string, context: Record<string, any> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
  }
}

/**
 * Configuration-related errors
 */
export class DSPyConfigurationError extends DSPyError {
  readonly type = 'configuration' as const;
}

/**
 * Program execution errors
 */
export class DSPyExecutionError extends DSPyError {
  readonly type = 'execution' as const;
}

/**
 * Optimization process errors
 */
export class DSPyOptimizationError extends DSPyError {
  readonly type = 'optimization' as const;
}

/**
 * API-related errors (communication with dspy.ts)
 */
export class DSPyAPIError extends DSPyError {
  readonly type = 'api' as const;
}

// =============================================================================
// Validation and Utility Types
// =============================================================================

/**
 * Type guard to check if an object is a valid DSPyConfig
 */
export const isDSPyConfig = (obj: any): obj is DSPyConfig => {
  return typeof obj === 'object' && obj !== null &&
    (obj.model === undefined || typeof obj.model === 'string') &&
    (obj.temperature === undefined || (typeof obj.temperature === 'number' && obj.temperature >= 0 && obj.temperature <= 2)) &&
    (obj.maxTokens === undefined || (typeof obj.maxTokens === 'number' && obj.maxTokens > 0));
};

/**
 * Type guard to check if an object is a valid DSPyProgram
 */
export const isDSPyProgram = (obj: any): obj is DSPyProgram => {
  return typeof obj === 'object' && obj !== null &&
    typeof obj.signature === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.forward === 'function';
};

/**
 * Utility type for DSPy program input validation
 */
export type DSPyProgramInput<T extends DSPyProgram = DSPyProgram> = 
  T extends DSPyProgram ? Record<string, any> : never;

/**
 * Utility type for DSPy program output validation
 */
export type DSPyProgramOutput<T extends DSPyProgram = DSPyProgram> = 
  T extends DSPyProgram ? Record<string, any> : never;

// =============================================================================
// Factory and Builder Types
// =============================================================================

/**
 * Factory interface for creating DSPy instances
 */
export interface DSPyFactory {
  createWrapper(config: DSPyConfig): Promise<DSPyWrapper>;
  createProgram(signature: string, description: string, wrapper: DSPyWrapper): Promise<DSPyProgram>;
  createAgent(type: DSPyAgentType, config: DSPyAgentConfig): Promise<any>;
}

/**
 * Builder interface for DSPy programs
 */
export interface DSPyProgramBuilder {
  withSignature(signature: string): DSPyProgramBuilder;
  withDescription(description: string): DSPyProgramBuilder;
  withExamples(examples: DSPyExample[]): DSPyProgramBuilder;
  withOptimization(config: DSPyOptimizationConfig): DSPyProgramBuilder;
  build(wrapper: DSPyWrapper): Promise<DSPyProgram>;
}

// =============================================================================
// Constants and Defaults
// =============================================================================

/**
 * Default DSPy configuration values
 */
export const DEFAULT_DSPY_CONFIG: Required<DSPyConfig> = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
  apiKey: '',
  baseURL: '',
  modelParams: {}
};

/**
 * Default optimization configuration
 */
export const DEFAULT_OPTIMIZATION_CONFIG: Required<DSPyOptimizationConfig> = {
  strategy: 'auto',
  maxIterations: 10,
  minExamples: 3,
  targetMetric: 'accuracy',
  timeout: 300000, // 5 minutes
  strategyParams: {}
};

/**
 * Supported DSPy optimization strategies
 */
export const SUPPORTED_STRATEGIES = [
  'auto',
  'bootstrap', 
  'mipro',
  'copro',
  'custom'
] as const;

/**
 * Maximum limits for DSPy operations
 */
export const DSPY_LIMITS = {
  MAX_EXAMPLES: 1000,
  MAX_ITERATIONS: 50,
  MAX_EXECUTION_TIME: 600000, // 10 minutes
  MAX_PROGRAMS_PER_WRAPPER: 100
} as const;

// Note: All types and exports are already declared above with their implementations
// No need for redundant re-exports that cause TypeScript conflicts