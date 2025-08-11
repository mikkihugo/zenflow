/**
 * @file DSPy Types and Configurations.
 *
 * Comprehensive type definitions, constants, error classes, and type guards.
 * for DSPy integration in the neural system.
 *
 * Created by: Agent Juliet - Neural Domain TypeScript Error Elimination.
 * Purpose: Provide all missing types, constants, and utilities for DSPy wrapper.
 */
// =============================================================================
// Default Configuration Constants
// =============================================================================
/**
 * Default DSPy configuration with sensible defaults.
 */
const DEFAULT_DSPY_CONFIG = {
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
const DEFAULT_OPTIMIZATION_CONFIG = {
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
};
// =============================================================================
// Error Classes
// =============================================================================
/**
 * Base error class for DSPy-related errors.
 *
 * @example
 */
class DSPyBaseError extends Error {
    code;
    context;
    timestamp;
    constructor(message, code, context) {
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
    constructor(message, context) {
        super(message, 'DSPY_API_ERROR', context);
    }
}
/**
 * Error thrown when DSPy configuration is invalid.
 *
 * @example
 */
class DSPyConfigurationError extends DSPyBaseError {
    constructor(message, context) {
        super(message, 'DSPY_CONFIGURATION_ERROR', context);
    }
}
/**
 * Error thrown during DSPy program execution.
 *
 * @example
 */
class DSPyExecutionError extends DSPyBaseError {
    constructor(message, context) {
        super(message, 'DSPY_EXECUTION_ERROR', context);
    }
}
/**
 * Error thrown during DSPy program optimization.
 *
 * @example
 */
class DSPyOptimizationError extends DSPyBaseError {
    constructor(message, context) {
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
function isDSPyConfig(obj) {
    return (obj &&
        typeof obj === 'object' &&
        (obj['model'] === undefined || (typeof obj['model'] === 'string' && obj['model'].length > 0)) &&
        (obj['temperature'] === undefined ||
            (typeof obj['temperature'] === 'number' &&
                obj['temperature'] >= 0 &&
                obj['temperature'] <= 2)) &&
        (obj['maxTokens'] === undefined ||
            (typeof obj['maxTokens'] === 'number' && obj['maxTokens'] > 0)) &&
        (obj['apiKey'] === undefined || typeof obj['apiKey'] === 'string') &&
        (obj['baseURL'] === undefined || typeof obj['baseURL'] === 'string') &&
        (obj['modelParams'] === undefined ||
            (typeof obj['modelParams'] === 'object' && obj['modelParams'] !== null)) &&
        (obj['timeout'] === undefined || (typeof obj['timeout'] === 'number' && obj['timeout'] > 0)) &&
        (obj['retryCount'] === undefined ||
            (typeof obj['retryCount'] === 'number' && obj['retryCount'] >= 0)) &&
        (obj['enableLogging'] === undefined || typeof obj['enableLogging'] === 'boolean'));
}
/**
 * Type guard to check if an object is a valid DSPyProgram.
 *
 * @param obj
 * @example
 */
function isDSPyProgram(obj) {
    return (obj &&
        typeof obj === 'object' &&
        typeof obj['signature'] === 'string' &&
        obj['signature'].length > 0 &&
        typeof obj.description === 'string' &&
        obj.description.length > 0 &&
        typeof obj['forward'] === 'function');
}
/**
 * Type guard to check if an object is a valid DSPyExample.
 *
 * @param obj
 * @example
 */
function isDSPyExample(obj) {
    return (obj &&
        typeof obj === 'object' &&
        obj['input'] &&
        typeof obj['input'] === 'object' &&
        obj['input'] !== null &&
        obj['output'] &&
        typeof obj['output'] === 'object' &&
        obj['output'] !== null);
}
/**
 * Type guard to check if an object is a valid DSPyOptimizationConfig.
 *
 * @param obj
 * @example
 */
function isDSPyOptimizationConfig(obj) {
    const validStrategies = ['bootstrap', 'mipro', 'copro', 'auto', 'custom'];
    return (obj &&
        typeof obj === 'object' &&
        validStrategies.includes(obj['strategy']) &&
        typeof obj['maxIterations'] === 'number' &&
        obj['maxIterations'] > 0 &&
        (obj['minExamples'] === undefined ||
            (typeof obj['minExamples'] === 'number' && obj['minExamples'] > 0)) &&
        (obj['evaluationMetric'] === undefined || typeof obj['evaluationMetric'] === 'string') &&
        (obj['validationSplit'] === undefined ||
            (typeof obj['validationSplit'] === 'number' &&
                obj['validationSplit'] > 0 &&
                obj['validationSplit'] < 1)) &&
        (obj['earlyStoppingPatience'] === undefined ||
            (typeof obj['earlyStoppingPatience'] === 'number' && obj['earlyStoppingPatience'] > 0)) &&
        (obj['strategyParams'] === undefined ||
            (typeof obj['strategyParams'] === 'object' && obj['strategyParams'] !== null)));
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
function validateDSPyConfig(config) {
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
 *
 * @param signature
 * @example
 */
function validateSignature(signature) {
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
function createValidationError(field, value, expected) {
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
function sanitizeInput(input) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
        if (typeof value === 'string' && value.length > DSPY_LIMITS['MAX_INPUT_SIZE']) {
            sanitized[key] = value.substring(0, DSPY_LIMITS['MAX_INPUT_SIZE']);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
// =============================================================================
// Export Everything
// =============================================================================
export { DEFAULT_DSPY_CONFIG, DEFAULT_OPTIMIZATION_CONFIG, DSPY_LIMITS, DSPyBaseError, DSPyAPIError, DSPyConfigurationError, DSPyExecutionError, DSPyOptimizationError, isDSPyConfig, isDSPyProgram, isDSPyExample, isDSPyOptimizationConfig, validateDSPyConfig, validateSignature, createValidationError, sanitizeInput, };
