/**
 * Custom Error Classes for RUV-Swarm MCP Tools.
 * Provides detailed, actionable error messages with context.
 */
/**
 * Base error class for all ruv-swarm MCP errors.
 *
 * @example
 */
/**
 * @file Coordination system: errors.
 */
declare class ZenSwarmError extends Error {
    code: string;
    details: any;
    timestamp: string;
    constructor(message: string, code?: string, details?: {});
    toJSON(): {
        name: string;
        message: string;
        code: string;
        details: any;
        timestamp: string;
        stack: string | undefined;
    };
    /**
     * Get actionable suggestions for resolving this error.
     */
    getSuggestions(): string[];
}
/**
 * Validation errors for input parameters.
 *
 * @example
 */
declare class ValidationError extends ZenSwarmError {
    field: string | null;
    value: any;
    expectedType: string | null;
    constructor(message: string, field?: string | null, value?: any, expectedType?: string | null);
    getSuggestions(): string[];
}
/**
 * Swarm-related errors.
 *
 * @example
 */
declare class SwarmError extends ZenSwarmError {
    swarmId: string | null;
    operation: string | null;
    constructor(message: string, swarmId?: string | null, operation?: string | null);
    getSuggestions(): string[];
}
/**
 * Agent-related errors.
 *
 * @example
 */
declare class AgentError extends ZenSwarmError {
    agentId: string | null;
    agentType: string | null;
    operation: string | null;
    constructor(message: string, agentId?: string | null, agentType?: string | null, operation?: string | null);
    getSuggestions(): string[];
}
/**
 * Task-related errors.
 *
 * @example
 */
declare class TaskError extends ZenSwarmError {
    taskId: string | null;
    taskType: string | null;
    operation: string | null;
    constructor(message: string, taskId?: string | null, taskType?: string | null, operation?: string | null);
    getSuggestions(): string[];
}
/**
 * Neural network related errors.
 *
 * @example
 */
declare class NeuralError extends ZenSwarmError {
    networkId: string | null;
    operation: string | null;
    modelType: string | null;
    constructor(message: string, networkId?: string | null, operation?: string | null, modelType?: string | null);
    getSuggestions(): string[];
}
/**
 * WASM-related errors.
 *
 * @example
 */
declare class WasmError extends ZenSwarmError {
    module: string | null;
    operation: string | null;
    constructor(message: string, module?: string | null, operation?: string | null);
    getSuggestions(): string[];
}
/**
 * Configuration errors.
 *
 * @example
 */
declare class ConfigurationError extends ZenSwarmError {
    configKey: string | null;
    configValue: any;
    constructor(message: string, configKey?: string | null, configValue?: any);
    getSuggestions(): string[];
}
/**
 * Network/connectivity errors.
 *
 * @example
 */
declare class NetworkError extends ZenSwarmError {
    endpoint: string | null;
    statusCode: number | null;
    constructor(message: string, endpoint?: string | null, statusCode?: number | null);
    getSuggestions(): string[];
}
/**
 * Database/persistence errors.
 *
 * @example
 */
declare class PersistenceError extends ZenSwarmError {
    operation: string | null;
    table: string | null;
    constructor(message: string, operation?: string | null, table?: string | null);
    getSuggestions(): string[];
}
/**
 * Resource/memory errors.
 *
 * @example
 */
declare class ResourceError extends ZenSwarmError {
    resourceType: string | null;
    currentUsage: number | null;
    limit: number | null;
    constructor(message: string, resourceType?: string | null, currentUsage?: number | null, limit?: number | null);
    getSuggestions(): string[];
}
/**
 * Concurrency/threading errors.
 *
 * @example
 */
declare class ConcurrencyError extends ZenSwarmError {
    operation: string | null;
    conflictType: string | null;
    constructor(message: string, operation?: string | null, conflictType?: string | null);
    getSuggestions(): string[];
}
/**
 * Error factory for creating appropriate error types.
 *
 * @example
 */
declare class ErrorFactory {
    /**
     * Create an appropriate error based on the context.
     *
     * @param type
     * @param message
     * @param details
     */
    static createError(type: string, message: string, details?: any): ZenSwarmError;
    /**
     * Wrap an existing error with additional context.
     *
     * @param originalError
     * @param type
     * @param additionalContext
     */
    static wrapError(originalError: Error, type: string, additionalContext?: any): ZenSwarmError;
}
/**
 * Error context for logging and debugging.
 *
 * @example
 */
declare class ErrorContext {
    context: Map<string, any>;
    constructor();
    set(key: string, value: any): void;
    get(key: string): any;
    clear(): void;
    toObject(): {
        [k: string]: any;
    };
    /**
     * Add context to an error.
     *
     * @param error
     */
    enrichError(error: any): any;
}
export { ZenSwarmError, ValidationError, SwarmError, AgentError, TaskError, NeuralError, WasmError, ConfigurationError, NetworkError, PersistenceError, ResourceError, ConcurrencyError, ErrorFactory, ErrorContext, };
export default ErrorFactory;
//# sourceMappingURL=errors.d.ts.map