/**
 * @fileoverview DSPy Types and Configurations - Comprehensive Neural Framework Integration
 *
 * This module provides complete TypeScript type definitions, configuration constants,
 * error handling classes, and validation utilities for DSPy framework integration
 * within Claude Code Zen's neural intelligence system.
 *
 * ## Module Organization
 *
 * ### Core Interface Definitions
 * - **DSPyConfig**: Language model configuration with defaults and validation
 * - **DSPyExample**: Training example structure with metadata support
 * - **DSPyExecutionResult**: Comprehensive execution results with metrics
 * - **DSPyProgram**: Neural program interface with execution capabilities
 * - **DSPyWrapper**: Main wrapper interface for all DSPy operations
 *
 * ### Configuration and Limits
 * - **DEFAULT_DSPY_CONFIG**: Production-ready default configuration
 * - **DEFAULT_OPTIMIZATION_CONFIG**: Optimal settings for neural program training
 * - **DSPY_LIMITS**: System constraints and safety limits
 *
 * ### Error Handling System
 * - **DSPyBaseError**: Base class with context and error codes
 * - **DSPyAPIError**: API communication and integration errors
 * - **DSPyConfigurationError**: Configuration validation errors
 * - **DSPyExecutionError**: Program execution and runtime errors
 * - **DSPyOptimizationError**: Training and optimization failures
 *
 * ### Type Safety and Validation
 * - **Type Guards**: Runtime type checking for all interfaces
 * - **Validation Functions**: Input sanitization and constraint checking
 * - **Utility Functions**: Configuration normalization and error creation
 *
 * ## Integration with Claude Code Zen
 *
 * These types power all DSPy integrations across the system:
 * - **DSPy Wrapper** (`dspy-wrapper.ts`): Core neural program execution
 * - **Swarm Coordinator** (`dspy-swarm-coordinator.ts`): Multi-agent coordination
 * - **MCP Tools** (`dspy-swarm-mcp-tools.ts`): Intelligent MCP server tools
 * - **Integration Manager** (`dspy-integration-manager.ts`): Unified coordination
 *
 * ## Production Configuration
 *
 * The default configuration is optimized for production use:
 * ```typescript
 * const config: DSPyConfig = {
 *   model: 'claude-3-5-sonnet-20241022',     // High-quality model
 *   temperature: 0.1,                        // Consistent outputs
 *   maxTokens: 2000,                        // Comprehensive responses
 *   timeout: 30000,                         // Reliable execution
 *   retryCount: 3,                          // Fault tolerance
 *   enableLogging: true                     // Comprehensive monitoring
 * };
 * ```
 *
 * @example
 * ```typescript
 * import {
 *   DSPyConfig,
 *   DSPyProgram,
 *   DSPyExecutionResult,
 *   DEFAULT_DSPY_CONFIG,
 *   isDSPyConfig,
 *   validateDSPyConfig
 * } from './dspy-types';
 *
 * // Type-safe configuration
 * const config: DSPyConfig = {
 *   ...DEFAULT_DSPY_CONFIG,
 *   model: 'claude-3-5-sonnet-20241022',
 *   temperature: 0.1
 * };
 *
 * // Runtime validation
 * if (isDSPyConfig(userConfig)) {
 *   const validated = validateDSPyConfig(userConfig);
 *   // Safe to use validated config
 * }
 * ```
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-alpha.73
 * @since 1.0.0
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Framework
 * @see {@link DSPyWrapper} Main wrapper implementation
 */

// =============================================================================
// Core Interface Definitions
// =============================================================================

/**
 * Configuration interface for DSPy language model setup and neural program execution.
 *
 * This interface defines all configuration options for connecting to and configuring
 * DSPy neural programs. It supports multiple language models, execution parameters,
 * and operational settings for production deployments.
 *
 * ## Model Support
 *
 * Supports various language models including:
 * - **Claude Models**: claude-3-5-sonnet-20241022, claude-3-haiku (recommended)
 * - **OpenAI Models**: gpt-4, gpt-3.5-turbo, gpt-4o-mini
 * - **Custom Models**: Any compatible API endpoint
 *
 * ## Configuration Categories
 *
 * - **Model Settings**: model, temperature, maxTokens for neural program behavior
 * - **Authentication**: apiKey, baseURL for custom endpoints and authentication
 * - **Performance**: timeout, retryCount for reliability and fault tolerance
 * - **Debugging**: enableLogging for comprehensive monitoring and troubleshooting
 *
 * @example
 * ```typescript
 * // Production configuration for Claude Code Zen
 * const prodConfig: DSPyConfig = {
 *   model: 'claude-3-5-sonnet-20241022',
 *   temperature: 0.1,        // Consistent, deterministic outputs
 *   maxTokens: 2000,         // Comprehensive responses
 *   timeout: 30000,          // 30 second timeout
 *   retryCount: 3,           // Fault tolerance
 *   enableLogging: true      // Full monitoring
 * };
 *
 * // Development configuration
 * const devConfig: DSPyConfig = {
 *   model: 'gpt-4o-mini',     // Cost-effective for development
 *   temperature: 0.2,         // Slightly more creative
 *   maxTokens: 1000,         // Efficient for testing
 *   enableLogging: true      // Debug information
 * };
 * ```
 */
export interface DSPyConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseURL?: string;
  modelParams?: Record<string, unknown>;
  timeout?: number;
  retryCount?: number;
  enableLogging?: boolean;
}

/**
 * Training example structure for DSPy neural program optimization.
 *
 * Training examples are the foundation of DSPy's learning system. Each example
 * represents an input-output pair that neural programs learn from during optimization.
 * High-quality examples with proper metadata lead to better program performance.
 *
 * ## Example Quality Guidelines
 *
 * - **Input Diversity**: Cover various scenarios and edge cases
 * - **Output Consistency**: Maintain consistent format and quality
 * - **Metadata Richness**: Include source, quality scores, and relevant tags
 * - **Balanced Dataset**: Ensure examples represent real-world usage patterns
 *
 * ## Quality Scoring
 *
 * Quality scores (0-1) help optimization algorithms prioritize examples:
 * - **1.0**: Perfect examples with ideal inputs and outputs
 * - **0.8-0.9**: High-quality examples with minor imperfections
 * - **0.6-0.7**: Good examples with some issues or edge cases
 * - **0.4-0.5**: Acceptable examples with notable limitations
 * - **Below 0.4**: Poor examples that may hurt training
 *
 * @example
 * ```typescript
 * // High-quality code generation example
 * const codeExample: DSPyExample = {
 *   input: {
 *     requirements: 'Create a TypeScript function to validate email addresses',
 *     context: 'User registration system with strict validation',
 *     style: 'functional programming preferred'
 *   },
 *   output: {
 *     code: 'const validateEmail = (email: string): boolean => { ... }',
 *     tests: ['test cases for validation'],
 *     documentation: 'JSDoc with examples and edge cases'
 *   },
 *   metadata: {
 *     source: 'production-code-review',
 *     quality: 0.95,
 *     tags: ['typescript', 'validation', 'email', 'functional']
 *   }
 * };
 * ```
 */
export interface DSPyExample {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  metadata?: {
    source?: string;
    quality?: number;
    tags?: string[];
  };
}

/**
 * Comprehensive result from DSPy neural program execution.
 *
 * This interface captures all information from a neural program execution,
 * including success status, results, performance metrics, and error details.
 * Essential for monitoring, debugging, and learning from program executions.
 *
 * ## Result Structure
 *
 * - **Success Status**: Boolean indicating execution success or failure
 * - **Result Data**: Actual output from the neural program
 * - **Execution Metadata**: Performance metrics, timing, and model information
 * - **Error Information**: Detailed error context when execution fails
 *
 * ## Metadata Fields
 *
 * - **executionTime**: Duration in milliseconds for performance monitoring
 * - **confidence**: Program's confidence in the result (0-1 scale)
 * - **timestamp**: Execution time for debugging and audit trails
 * - **model**: Model used for execution tracking and optimization
 * - **tokensUsed**: Token consumption for cost tracking and optimization
 *
 * @example
 * ```typescript
 * // Successful code generation result
 * const successResult: DSPyExecutionResult = {
 *   success: true,
 *   result: {
 *     code: 'function validateInput(data: unknown): boolean { ... }',
 *     tests: ['describe("validateInput", () => { ... })'],
 *     documentation: `/** Validates user input with type safety *\/`
 *   },
 *   metadata: {
 *     executionTime: 1250,
 *     confidence: 0.92,
 *     timestamp: new Date(),
 *     model: 'claude-3-5-sonnet-20241022',
 *     tokensUsed: 1847
 *   }
 * };
 *
 * // Failed execution with error details
 * const errorResult: DSPyExecutionResult = {
 *   success: false,
 *   result: {},
 *   metadata: {
 *     executionTime: 850,
 *     confidence: 0.0,
 *     timestamp: new Date(),
 *     model: 'claude-3-5-sonnet-20241022'
 *   },
 *   error: new DSPyExecutionError('Invalid input format', {
 *     inputKeys: ['malformed_request'],
 *     expectedFormat: 'object with code_request field'
 *   })
 * };
 * ```
 */
export interface DSPyExecutionResult {
  success: boolean;
  result?: Record<string, unknown>;
  metadata: {
    executionTime: number;
    confidence: number;
    timestamp?: Date;
    model?: string;
    tokensUsed?: number;
    [key: string]: unknown;
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
  strategyParams?: Record<string, unknown>;
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
  forward(input: Record<string, unknown>): Promise<Record<string, unknown>>;
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
  execute(
    program: DSPyProgram,
    input: Record<string, unknown>
  ): Promise<DSPyExecutionResult>;
  addExamples(program: DSPyProgram, examples: DSPyExample[]): Promise<void>;
  optimize(
    program: DSPyProgram,
    config?: DSPyOptimizationConfig
  ): Promise<DSPyOptimizationResult>;
  getConfig(): DSPyConfig | null;
  healthCheck(): Promise<boolean>;
  getStats(): unknown;
  cleanup(): Promise<void>;
}

// =============================================================================
// Default Configuration Constants
// =============================================================================

/**
 * Production-ready default DSPy configuration optimized for Claude Code Zen.
 *
 * This configuration provides optimal defaults for neural program execution
 * across all Claude Code Zen systems. Values are chosen based on extensive
 * testing and production usage patterns.
 *
 * ## Configuration Rationale
 *
 * - **Model**: gpt-3.5-turbo for cost-effective operations with good performance
 * - **Temperature**: 0.7 for balanced creativity and consistency
 * - **Max Tokens**: 1000 for efficient processing while allowing comprehensive responses
 * - **Timeout**: 30 seconds for reliable execution without excessive waiting
 * - **Retry Count**: 3 attempts for fault tolerance against transient failures
 * - **Logging**: Enabled for comprehensive monitoring and debugging
 *
 * ## Model Parameters
 *
 * - **top_p**: 0.9 for high-quality token selection
 * - **frequency_penalty**: 0 to avoid repetition issues
 * - **presence_penalty**: 0 for natural language generation
 *
 * @example
 * ```typescript
 * // Use defaults directly
 * const wrapper = await createDSPyWrapper(DEFAULT_DSPY_CONFIG);
 *
 * // Override specific settings
 * const customConfig = {
 *   ...DEFAULT_DSPY_CONFIG,
 *   model: 'claude-3-5-sonnet-20241022',
 *   temperature: 0.1  // Lower for production consistency
 * };
 * ```
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
 * Optimal configuration for DSPy neural program training and optimization.
 *
 * This configuration is tuned for effective learning across different types of
 * neural programs. Settings balance training effectiveness with computational
 * efficiency for production deployments.
 *
 * ## Optimization Strategy: Bootstrap
 *
 * Bootstrap is chosen as the default strategy because:
 * - **Reliability**: Consistent results across different program types
 * - **Efficiency**: Good performance with moderate computational requirements
 * - **Versatility**: Works well for both simple and complex programs
 * - **Proven**: Extensively tested in production environments
 *
 * ## Parameter Explanation
 *
 * - **maxIterations**: 10 iterations provide good improvement without overfitting
 * - **evaluationMetric**: Accuracy is the most important metric for most use cases
 * - **validationSplit**: 20% reserved for validation prevents overfitting
 * - **earlyStoppingPatience**: Stop if no improvement for 3 iterations
 *
 * ## Bootstrap-Specific Parameters
 *
 * - **bootstrapSamples**: 4 samples per iteration for stable learning
 * - **candidatePrograms**: 16 candidates provide good exploration
 * - **maxBootstrappedDemos**: 4 demos prevent overfitting to examples
 * - **maxLabeledDemos**: 16 labeled examples for comprehensive learning
 *
 * @example
 * ```typescript
 * // Use default optimization
 * const result = await wrapper.optimize(program, DEFAULT_OPTIMIZATION_CONFIG);
 *
 * // Custom optimization for complex programs
 * const advancedConfig = {
 *   ...DEFAULT_OPTIMIZATION_CONFIG,
 *   maxIterations: 20,        // More iterations for complex programs
 *   strategy: 'mipro',        // Alternative strategy for specific use cases
 *   minExamples: 10          // Require more examples before optimization
 * };
 * ```
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
 * System limits and constraints for safe and efficient DSPy operations.
 *
 * These limits protect system resources, prevent abuse, and ensure reliable
 * operation across all Claude Code Zen DSPy integrations. Limits are based
 * on production experience and system capacity analysis.
 *
 * ## Resource Limits
 *
 * - **MAX_PROGRAMS_PER_WRAPPER**: Prevents memory exhaustion from too many programs
 * - **MAX_EXAMPLES**: Limits training data size to prevent memory issues
 * - **MAX_CONCURRENT_EXECUTIONS**: Prevents system overload from parallel execution
 *
 * ## Data Size Limits
 *
 * - **MAX_INPUT_SIZE**: Prevents oversized inputs that could cause timeouts
 * - **MAX_OUTPUT_SIZE**: Limits output size to prevent memory issues
 * - **MAX_SIGNATURE_LENGTH**: Ensures signature strings remain manageable
 * - **MAX_DESCRIPTION_LENGTH**: Prevents extremely long program descriptions
 *
 * ## Optimization Limits
 *
 * - **MIN_OPTIMIZATION_EXAMPLES**: Minimum examples needed for meaningful optimization
 * - **MAX_OPTIMIZATION_ITERATIONS**: Prevents infinite optimization loops
 * - **DEFAULT_TIMEOUT_MS**: Standard timeout for all operations
 *
 * ## Safety and Performance
 *
 * These limits ensure:
 * - **System Stability**: Prevent resource exhaustion and system crashes
 * - **Performance**: Maintain responsive system behavior under load
 * - **Cost Control**: Limit expensive operations and API calls
 * - **User Experience**: Ensure reasonable response times
 *
 * @example
 * ```typescript
 * // Check against limits before processing
 * if (examples.length > DSPY_LIMITS.MAX_EXAMPLES) {
 *   throw new DSPyConfigurationError(
 *     `Too many examples: ${examples.length} > ${DSPY_LIMITS.MAX_EXAMPLES}`
 *   );
 * }
 *
 * // Validate signature length
 * if (!validateSignature(signature)) {
 *   throw new DSPyConfigurationError('Invalid signature format');
 * }
 * ```
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
 *
 * @example
 */
class DSPyBaseError extends Error {
  public readonly code: string;
  public readonly context: Record<string, unknown> | undefined;
  public readonly timestamp: Date;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
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
 *
 * @example
 */
class DSPyAPIError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DSPY_API_ERROR', context);
  }
}

/**
 * Error thrown when DSPy configuration is invalid.
 *
 * @example
 */
class DSPyConfigurationError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DSPY_CONFIGURATION_ERROR', context);
  }
}

/**
 * Error thrown during DSPy program execution.
 *
 * @example
 */
class DSPyExecutionError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DSPY_EXECUTION_ERROR', context);
  }
}

/**
 * Error thrown during DSPy program optimization.
 *
 * @example
 */
class DSPyOptimizationError extends DSPyBaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DSPY_OPTIMIZATION_ERROR', context);
  }
}

// =============================================================================
// Type Guards and Validation Functions
// =============================================================================

/**
 * Type guard to check if an object is a valid DSPyConfig.
 *
 * @param obj
 * @example
 */
function isDSPyConfig(obj: unknown): obj is DSPyConfig {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj['model'] === undefined ||
      (typeof obj['model'] === 'string' && obj['model'].length > 0)) &&
    (obj['temperature'] === undefined ||
      (typeof obj['temperature'] === 'number' &&
        obj['temperature'] >= 0 &&
        obj['temperature'] <= 2)) &&
    (obj['maxTokens'] === undefined ||
      (typeof obj['maxTokens'] === 'number' && obj['maxTokens'] > 0)) &&
    (obj['apiKey'] === undefined || typeof obj['apiKey'] === 'string') &&
    (obj['baseURL'] === undefined || typeof obj['baseURL'] === 'string') &&
    (obj['modelParams'] === undefined ||
      (typeof obj['modelParams'] === 'object' &&
        obj['modelParams'] !== null)) &&
    (obj['timeout'] === undefined ||
      (typeof obj['timeout'] === 'number' && obj['timeout'] > 0)) &&
    (obj['retryCount'] === undefined ||
      (typeof obj['retryCount'] === 'number' && obj['retryCount'] >= 0)) &&
    (obj['enableLogging'] === undefined ||
      typeof obj['enableLogging'] === 'boolean')
  );
}

/**
 * Type guard to check if an object is a valid DSPyProgram.
 *
 * @param obj
 * @example
 */
function isDSPyProgram(obj: unknown): obj is DSPyProgram {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj['signature'] === 'string' &&
    obj['signature'].length > 0 &&
    typeof obj.description === 'string' &&
    obj.description.length > 0 &&
    typeof obj['forward'] === 'function'
  );
}

/**
 * Type guard to check if an object is a valid DSPyExample.
 *
 * @param obj
 * @example
 */
function isDSPyExample(obj: unknown): obj is DSPyExample {
  return (
    obj &&
    typeof obj === 'object' &&
    obj['input'] &&
    typeof obj['input'] === 'object' &&
    obj['input'] !== null &&
    obj['output'] &&
    typeof obj['output'] === 'object' &&
    obj['output'] !== null
  );
}

/**
 * Type guard to check if an object is a valid DSPyOptimizationConfig.
 *
 * @param obj
 * @example
 */
function isDSPyOptimizationConfig(obj: unknown): obj is DSPyOptimizationConfig {
  const validStrategies = ['bootstrap', 'mipro', 'copro', 'auto', 'custom'];
  return (
    obj &&
    typeof obj === 'object' &&
    validStrategies.includes(obj['strategy']) &&
    typeof obj['maxIterations'] === 'number' &&
    obj['maxIterations'] > 0 &&
    (obj['minExamples'] === undefined ||
      (typeof obj['minExamples'] === 'number' && obj['minExamples'] > 0)) &&
    (obj['evaluationMetric'] === undefined ||
      typeof obj['evaluationMetric'] === 'string') &&
    (obj['validationSplit'] === undefined ||
      (typeof obj['validationSplit'] === 'number' &&
        obj['validationSplit'] > 0 &&
        obj['validationSplit'] < 1)) &&
    (obj['earlyStoppingPatience'] === undefined ||
      (typeof obj['earlyStoppingPatience'] === 'number' &&
        obj['earlyStoppingPatience'] > 0)) &&
    (obj['strategyParams'] === undefined ||
      (typeof obj['strategyParams'] === 'object' &&
        obj['strategyParams'] !== null))
  );
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validates and normalizes a DSPy configuration.
 *
 * @param config
 * @example
 */
function validateDSPyConfig(config: Partial<DSPyConfig>): DSPyConfig {
  if (!config || typeof config !== 'object') {
    throw new DSPyConfigurationError('Configuration must be an object');
  }

  const normalized = { ...DEFAULT_DSPY_CONFIG, ...config };

  if (!isDSPyConfig(normalized)) {
    throw new DSPyConfigurationError(
      'Invalid configuration after normalization',
      {
        config: normalized,
      }
    );
  }

  return normalized;
}

/**
 * Validates a DSPy program signature format.
 *
 * @param signature
 * @example
 */
function validateSignature(signature: string): boolean {
  if (!signature || typeof signature !== 'string') {
    return false;
  }

  if (signature.length > DSPY_LIMITS['MAX_SIGNATURE_LENGTH']) {
    return false;
  }

  // Check for basic signature format: "input: type -> output: type"
  const hasArrow = signature.includes('->');
  const hasInput = signature.includes(':');

  return hasArrow && hasInput;
}

/**
 * Creates a validation error with detailed context.
 *
 * @param field
 * @param value
 * @param expected
 * @example
 */
function createValidationError(
  field: string,
  value: unknown,
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
 *
 * @param input
 * @example
 */
function sanitizeInput(input: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (
      typeof value === 'string' &&
      value.length > DSPY_LIMITS['MAX_INPUT_SIZE']
    ) {
      sanitized[key] = value.substring(0, DSPY_LIMITS['MAX_INPUT_SIZE']);
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

// =============================================================================
// System Statistics Types
// =============================================================================

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
