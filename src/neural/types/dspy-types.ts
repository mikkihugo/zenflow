/**
 * @file DSPy Types and Configurations
 *
 * Comprehensive type definitions, constants, error classes, and type guards.
 * for DSPy integration in the neural system.
 *
 * Created by: Agent Juliet - Neural Domain TypeScript Error Elimination.
 * Purpose: Provide all missing types, constants, and utilities for DSPy wrapper.
 */

// =============================================================================
// Core Interface Definitions
// =============================================================================

/**
 * Configuration interface for DSPy language model setup.
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

// =============================================================================
// Default Configuration Constants
// =============================================================================

/**
 * Default DSPy configuration with sensible defaults.
 */
const DEFAULT_DSPY_CONFIG: DSPyConfig = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000,
  retryCount: 3,
  enableLogging: true,
  modelParams: {
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
};

/**
 * Default optimization configuration for DSPy programs.
 */
const DEFAULT_OPTIMIZATION_CONFIG: DSPyOptimizationConfig = {
  strategy: 'bootstrap',
  maxIterations: 10,
  evaluationMetric: 'accuracy',
  validationSplit: 0.2,
  earlyStoppingPatience: 3,
  strategyParams: {
    bootstrapSamples: 4,
    candidatePrograms: 16,
    maxBootstrappedDemos: 4,
    maxLabeledDemos: 16,
  },
};

/**
 * System limits and constraints for DSPy operations.
 */
const DSPY_LIMITS = {
  MAX_PROGRAMS_PER_WRAPPER: 50,
  MAX_EXAMPLES: 1000,
  MAX_SIGNATURE_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_INPUT_SIZE: 10000,
  MAX_OUTPUT_SIZE: 10000,
  MIN_OPTIMIZATION_EXAMPLES: 5,
  MAX_OPTIMIZATION_ITERATIONS: 100,
  DEFAULT_TIMEOUT_MS: 30000,
  MAX_CONCURRENT_EXECUTIONS: 5,
} as const;

// =============================================================================
// Error Classes
// =============================================================================

/**
 * Base error class for DSPy-related errors.
 */
class DSPyBaseError extends Error {
  public readonly code: string;
  public readonly context: Record<string, any> | undefined;
  public readonly timestamp: Date;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when DSPy API calls fail.
 */
class DSPyAPIError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DSPY_API_ERROR', context);
  }
}

/**
 * Error thrown when DSPy configuration is invalid.
 */
class DSPyConfigurationError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DSPY_CONFIGURATION_ERROR', context);
  }
}

/**
 * Error thrown during DSPy program execution.
 */
class DSPyExecutionError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DSPY_EXECUTION_ERROR', context);
  }
}

/**
 * Error thrown during DSPy program optimization.
 */
class DSPyOptimizationError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DSPY_OPTIMIZATION_ERROR', context);
  }
}

// =============================================================================
// Type Guards and Validation Functions
// =============================================================================

/**
 * Type guard to check if an object is a valid DSPyConfig.
 */
function isDSPyConfig(obj: any): obj is DSPyConfig {
  return (obj &&
  typeof obj === 'object' &&
  (obj["model"] === undefined || (typeof obj["model"] === 'string' && obj["model"].length > 0)) &&
  (obj["temperature"] === undefined ||
    (typeof obj["temperature"] === 'number' && obj["temperature"] >= 0 && obj["temperature"] <= 2)) &&
  (obj["maxTokens"] === undefined || (typeof obj["maxTokens"] === 'number' && obj["maxTokens"] > 0)) &&
  (obj["apiKey"] === undefined || typeof obj["apiKey"] === 'string') &&
  (obj["baseURL"] === undefined || typeof obj["baseURL"] === 'string') &&
  (obj["modelParams"] === undefined ||
    (typeof obj["modelParams"] === 'object' && obj["modelParams"] !== null)) &&
  (obj["timeout"] === undefined || (typeof obj["timeout"] === 'number' && obj["timeout"] > 0)) &&
  (obj["retryCount"] === undefined || (typeof obj["retryCount"] === 'number' && obj["retryCount"] >= 0)) && (obj["enableLogging"] === undefined || typeof obj["enableLogging"] === 'boolean'));
}

/**
 * Type guard to check if an object is a valid DSPyProgram.
 */
function isDSPyProgram(obj: any): obj is DSPyProgram {
  return (obj &&
  typeof obj === 'object' &&
  typeof obj["signature"] === 'string' &&
  obj["signature"].length > 0 &&
  typeof obj.description === 'string' &&
  obj.description.length > 0 && typeof obj["forward"] === 'function');
}

/**
 * Type guard to check if an object is a valid DSPyExample.
 */
function isDSPyExample(obj: any): obj is DSPyExample {
  return (obj &&
  typeof obj === 'object' &&
  obj["input"] &&
  typeof obj["input"] === 'object' &&
  obj["input"] !== null &&
  obj["output"] &&
  typeof obj["output"] === 'object' && obj["output"] !== null);
}

/**
 * Type guard to check if an object is a valid DSPyOptimizationConfig.
 */
function isDSPyOptimizationConfig(obj: any): obj is DSPyOptimizationConfig {
  const validStrategies = ['bootstrap', 'mipro', 'copro', 'auto', 'custom'];
  return (obj &&
  typeof obj === 'object' &&
  validStrategies.includes(obj["strategy"]) &&
  typeof obj["maxIterations"] === 'number' &&
  obj["maxIterations"] > 0 &&
  (obj["minExamples"] === undefined ||
    (typeof obj["minExamples"] === 'number' && obj["minExamples"] > 0)) &&
  (obj["evaluationMetric"] === undefined || typeof obj["evaluationMetric"] === 'string') &&
  (obj["validationSplit"] === undefined ||
    (typeof obj["validationSplit"] === 'number' &&
      obj["validationSplit"] > 0 &&
      obj["validationSplit"] < 1)) &&
  (obj["earlyStoppingPatience"] === undefined ||
    (typeof obj["earlyStoppingPatience"] === 'number' && obj["earlyStoppingPatience"] > 0)) && (obj["strategyParams"] === undefined || (typeof obj["strategyParams"] === 'object' && obj["strategyParams"] !== null)));
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validates and normalizes a DSPy configuration.
 */
function validateDSPyConfig(config: Partial<DSPyConfig>): DSPyConfig {
  if (!config || typeof config !== 'object') {
    throw new DSPyConfigurationError('Configuration must be an object');
  }

  const normalized = { ...DEFAULT_DSPY_CONFIG, ...config };

  if (!isDSPyConfig(normalized)) {
    throw new DSPyConfigurationError('Invalid configuration after normalization', {
      config: normalized,
    });
  }

  return normalized;
}

/**
 * Validates a DSPy program signature format.
 */
function validateSignature(signature: string): boolean {
  if (!signature || typeof signature !== 'string') {
    return false;
  }

  if (signature.length > DSPY_LIMITS["MAX_SIGNATURE_LENGTH"]) {
    return false;
  }

  // Check for basic signature format: "input: type -> output: type"
  const hasArrow = signature.includes('->');
  const hasInput = signature.includes(':');

  return hasArrow && hasInput;
}

/**
 * Creates a validation error with detailed context.
 */
function createValidationError(
  field: string,
  value: any,
  expected: string
): DSPyConfigurationError {
  return new DSPyConfigurationError(`Invalid ${field}: expected ${expected}`, {
    field,
    value,
    expected,
  });
}

/**
 * Sanitizes input for DSPy operations.
 */
function sanitizeInput(input: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string' && value.length > DSPY_LIMITS["MAX_INPUT_SIZE"]) {
      sanitized[key] = value.substring(0, DSPY_LIMITS["MAX_INPUT_SIZE"]);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// =============================================================================
// Performance and Metrics Types
// =============================================================================

/**
 * Performance metrics for DSPy operations.
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

// =============================================================================
// System Statistics Types
// =============================================================================

/**
 * DSPy System Statistics.
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

// =============================================================================
// Export Everything
// =============================================================================

export {
  DEFAULT_DSPY_CONFIG,
  DEFAULT_OPTIMIZATION_CONFIG,
  DSPY_LIMITS,
  DSPyBaseError,
  DSPyAPIError,
  DSPyConfigurationError,
  DSPyExecutionError,
  DSPyOptimizationError,
  isDSPyConfig,
  isDSPyProgram,
  isDSPyExample,
  isDSPyOptimizationConfig,
  validateDSPyConfig,
  validateSignature,
  createValidationError,
  sanitizeInput,
};
