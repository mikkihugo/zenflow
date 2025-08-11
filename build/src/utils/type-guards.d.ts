/**
 * Type Guards Utility Module.
 *
 * Provides type guard functions for safe union type property access.
 * Throughout the claude-code-zen codebase. This addresses TypeScript
 * strict mode compilation issues with union type handling..
 *
 * @file Comprehensive type guards for union type safety.
 */
/**
 * Union type for database query operations.
 */
export type DatabaseResult<T = any> = QuerySuccess<T> | QueryError;
/**
 * Successful query result with discriminant property.
 *
 * @example
 */
export interface QuerySuccess<T = any> {
    success: true;
    data: T;
    rowCount: number;
    executionTime: number;
    fields?: Array<{
        name: string;
        type: string;
        nullable: boolean;
    }>;
}
/**
 * Query error result with discriminant property.
 *
 * @example
 */
export interface QueryError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        stack?: string;
    };
    executionTime: number;
}
/**
 * Type guard for successful database query results.
 *
 * @param result
 * @example
 */
export declare function isQuerySuccess<T = any>(result: DatabaseResult<T>): result is QuerySuccess<T>;
/**
 * Type guard for database query errors.
 *
 * @param result
 * @example
 */
export declare function isQueryError(result: DatabaseResult): result is QueryError;
/**
 * Union type for memory store operations.
 */
export type MemoryResult<T = any> = MemorySuccess<T> | MemoryNotFound | MemoryError;
/**
 * Successful memory retrieval with discriminant property.
 *
 * @example
 */
export interface MemorySuccess<T = any> {
    found: true;
    data: T;
    key: string;
    timestamp: Date;
    ttl?: number;
    metadata?: Record<string, any>;
}
/**
 * Memory key not found result with discriminant property.
 *
 * @example
 */
export interface MemoryNotFound {
    found: false;
    key: string;
    reason: 'not_found' | 'expired';
}
/**
 * Memory operation error with discriminant property.
 *
 * @example
 */
export interface MemoryError {
    found: false;
    error: {
        code: string;
        message: string;
        key: string;
    };
}
/**
 * Type guard for successful memory operations.
 *
 * @param result
 * @example
 */
export declare function isMemorySuccess<T = any>(result: MemoryResult<T>): result is MemorySuccess<T>;
/**
 * Type guard for memory not found results.
 *
 * @param result
 * @example
 */
export declare function isMemoryNotFound(result: MemoryResult): result is MemoryNotFound;
/**
 * Type guard for memory operation errors.
 *
 * @param result
 * @example
 */
export declare function isMemoryError(result: MemoryResult): result is MemoryError;
/**
 * Union type for neural network operations.
 */
export type NeuralResult = TrainingResult | InferenceResult | NeuralError;
/**
 * Neural network training result with discriminant property.
 *
 * @example
 */
export interface TrainingResult {
    type: 'training';
    success: true;
    finalError: number;
    epochsCompleted: number;
    duration: number;
    converged: boolean;
    accuracy?: number;
    validationError?: number;
}
/**
 * Neural network inference result with discriminant property.
 *
 * @example
 */
export interface InferenceResult {
    type: 'inference';
    success: true;
    predictions: number[];
    confidence?: number[];
    processingTime: number;
}
/**
 * Neural network operation error with discriminant property.
 *
 * @example
 */
export interface NeuralError {
    type: 'error';
    success: false;
    error: {
        code: string;
        message: string;
        operation: 'training' | 'inference' | 'initialization';
        details?: any;
    };
}
/**
 * Type guard for neural training results.
 *
 * @param result
 * @example
 */
export declare function isTrainingResult(result: NeuralResult): result is TrainingResult;
/**
 * Type guard for neural inference results.
 *
 * @param result
 * @example
 */
export declare function isInferenceResult(result: NeuralResult): result is InferenceResult;
/**
 * Type guard for neural operation errors.
 *
 * @param result
 * @example
 */
export declare function isNeuralError(result: NeuralResult): result is NeuralError;
/**
 * Union type for API responses.
 */
export type APIResult<T = any> = APISuccess<T> | APIError;
/**
 * Successful API response with discriminant property.
 *
 * @example
 */
export interface APISuccess<T = any> {
    success: true;
    data: T;
    metadata?: {
        timestamp: string;
        requestId: string;
        version: string;
    };
}
/**
 * API error response with discriminant property.
 *
 * @example
 */
export interface APIError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        stack?: string;
    };
    metadata?: {
        timestamp: string;
        requestId: string;
        version: string;
    };
}
/**
 * Type guard for successful API responses.
 *
 * @param result
 * @example
 */
export declare function isAPISuccess<T = any>(result: APIResult<T>): result is APISuccess<T>;
/**
 * Type guard for API error responses.
 *
 * @param result
 * @example
 */
export declare function isAPIError(result: APIResult): result is APIError;
/**
 * Union type for WASM operations.
 */
export type WasmResult<T = any> = WasmSuccess<T> | WasmError;
/**
 * Successful WASM operation with discriminant property.
 *
 * @example
 */
export interface WasmSuccess<T = any> {
    wasmSuccess: true;
    result: T;
    executionTime: number;
    memoryUsage: number;
}
/**
 * WASM operation error with discriminant property.
 *
 * @example
 */
export interface WasmError {
    wasmSuccess: false;
    error: {
        code: string;
        message: string;
        wasmStack?: string;
    };
    executionTime: number;
}
/**
 * Type guard for successful WASM operations.
 *
 * @param result
 * @example
 */
export declare function isWasmSuccess<T = any>(result: WasmResult<T>): result is WasmSuccess<T>;
/**
 * Type guard for WASM operation errors.
 *
 * @param result
 * @example
 */
export declare function isWasmError(result: WasmResult): result is WasmError;
/**
 * Union type for coordination operations.
 */
export type CoordinationResult<T = any> = CoordinationSuccess<T> | CoordinationError;
/**
 * Successful coordination operation with discriminant property.
 *
 * @example
 */
export interface CoordinationSuccess<T = any> {
    coordinated: true;
    result: T;
    agentsInvolved: string[];
    duration: number;
    consensus?: boolean;
}
/**
 * Coordination operation error with discriminant property.
 *
 * @example
 */
export interface CoordinationError {
    coordinated: false;
    error: {
        code: string;
        message: string;
        failedAgents?: string[];
        partialResults?: any;
    };
    duration: number;
}
/**
 * Type guard for successful coordination operations.
 *
 * @param result
 * @example
 */
export declare function isCoordinationSuccess<T = any>(result: CoordinationResult<T>): result is CoordinationSuccess<T>;
/**
 * Type guard for coordination operation errors.
 *
 * @param result
 * @example
 */
export declare function isCoordinationError(result: CoordinationResult): result is CoordinationError;
/**
 * Generic union type for operations with success/error states.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;
/**
 * Generic success result.
 *
 * @example
 */
export interface Success<T> {
    ok: true;
    value: T;
}
/**
 * Generic failure result.
 *
 * @example
 */
export interface Failure<E = Error> {
    ok: false;
    error: E;
}
/**
 * Type guard for successful results.
 *
 * @param result
 * @example
 */
export declare function isSuccess<T, E = Error>(result: Result<T, E>): result is Success<T>;
/**
 * Type guard for failed results.
 *
 * @param result
 * @example
 */
export declare function isFailure<T, E = Error>(result: Result<T, E>): result is Failure<E>;
/**
 * Safely extract data from a result union type.
 *
 * @param result
 * @example
 */
export declare function extractData<T>(result: DatabaseResult<T>): T | null;
/**
 * Safely extract error message from any result type.
 *
 * @param result
 * @example
 */
export declare function extractErrorMessage(result: DatabaseResult | MemoryResult | NeuralResult | APIResult | WasmResult | CoordinationResult): string | null;
/**
 * Type predicate to check if an object has a specific property.
 *
 * @param obj
 * @param prop
 * @example
 */
export declare function hasProperty<T, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown>;
/**
 * Safe property access with type checking.
 *
 * @param obj
 * @param prop
 * @example
 */
export declare function safePropertyAccess<T, K extends keyof T>(obj: T | null | undefined, prop: K): T[K] | undefined;
/**
 * Type guard to check if an object is a valid neural network config.
 *
 * @param obj
 * @example
 */
export declare function isNeuralNetworkConfig(obj: any): obj is {
    layers: number[];
    activationFunctions: string[];
    learningRate: number;
};
/**
 * Type guard to check if a value is a valid activation function.
 *
 * @param value
 * @example
 */
export declare function isActivationFunction(value: any): value is string;
/**
 * Type guard for checking array of objects with required properties.
 *
 * @param arr
 * @param requiredProps
 * @example
 */
export declare function isObjectArrayWithProps<T>(arr: any, requiredProps: string[]): arr is T[];
/**
 * Type guard for checking if value is a non-empty string.
 *
 * @param value
 * @example
 */
export declare function isNonEmptyString(value: any): value is string;
/**
 * Type guard for checking if value is a valid number (not NaN or Infinity).
 *
 * @param value.
 * @param value
 * @example
 */
export declare function isValidNumber(value: any): value is number;
/**
 * Type guard for checking if value is a valid positive number.
 *
 * @param value
 * @example
 */
export declare function isPositiveNumber(value: any): value is number;
//# sourceMappingURL=type-guards.d.ts.map