/**
 * Type Guards Utility Module
 *
 * Provides type guard functions for safe union type property access
 * throughout the claude-code-zen codebase. This addresses TypeScript
 * strict mode compilation issues with union type handling.
 *
 * @file Comprehensive type guards for union type safety
 */

// ============================================
// Database Result Type Guards
// ============================================

/**
 * Union type for database query operations
 */
export type DatabaseResult<T = any> = QuerySuccess<T> | QueryError;

/**
 * Successful query result with discriminant property
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
 * Query error result with discriminant property
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
 * Type guard for successful database query results
 *
 * @param result
 */
export function isQuerySuccess<T = any>(result: DatabaseResult<T>): result is QuerySuccess<T> {
  return result?.success === true && 'data' in result;
}

/**
 * Type guard for database query errors
 *
 * @param result
 */
export function isQueryError(result: DatabaseResult): result is QueryError {
  return result?.success === false && 'error' in result;
}

// ============================================
// Memory Store Result Type Guards
// ============================================

/**
 * Union type for memory store operations
 */
export type MemoryResult<T = any> = MemorySuccess<T> | MemoryNotFound | MemoryError;

/**
 * Successful memory retrieval with discriminant property
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
 * Memory key not found result with discriminant property
 *
 * @example
 */
export interface MemoryNotFound {
  found: false;
  key: string;
  reason: 'not_found' | 'expired';
}

/**
 * Memory operation error with discriminant property
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
 * Type guard for successful memory operations
 *
 * @param result
 */
export function isMemorySuccess<T = any>(result: MemoryResult<T>): result is MemorySuccess<T> {
  return result?.found === true && 'data' in result;
}

/**
 * Type guard for memory not found results
 *
 * @param result
 */
export function isMemoryNotFound(result: MemoryResult): result is MemoryNotFound {
  return result?.found === false && 'reason' in result;
}

/**
 * Type guard for memory operation errors
 *
 * @param result
 */
export function isMemoryError(result: MemoryResult): result is MemoryError {
  return result?.found === false && 'error' in result;
}

// ============================================
// Neural Network Result Type Guards
// ============================================

/**
 * Union type for neural network operations
 */
export type NeuralResult = TrainingResult | InferenceResult | NeuralError;

/**
 * Neural network training result with discriminant property
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
 * Neural network inference result with discriminant property
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
 * Neural network operation error with discriminant property
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
 * Type guard for neural training results
 *
 * @param result
 */
export function isTrainingResult(result: NeuralResult): result is TrainingResult {
  return result?.type === 'training' && result?.success === true;
}

/**
 * Type guard for neural inference results
 *
 * @param result
 */
export function isInferenceResult(result: NeuralResult): result is InferenceResult {
  return result?.type === 'inference' && result?.success === true;
}

/**
 * Type guard for neural operation errors
 *
 * @param result
 */
export function isNeuralError(result: NeuralResult): result is NeuralError {
  return result?.type === 'error' && result?.success === false;
}

// ============================================
// API Response Type Guards
// ============================================

/**
 * Union type for API responses
 */
export type APIResult<T = any> = APISuccess<T> | APIError;

/**
 * Successful API response with discriminant property
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
 * API error response with discriminant property
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
 * Type guard for successful API responses
 *
 * @param result
 */
export function isAPISuccess<T = any>(result: APIResult<T>): result is APISuccess<T> {
  return result?.success === true && 'data' in result;
}

/**
 * Type guard for API error responses
 *
 * @param result
 */
export function isAPIError(result: APIResult): result is APIError {
  return result?.success === false && 'error' in result;
}

// ============================================
// WASM Operation Result Type Guards
// ============================================

/**
 * Union type for WASM operations
 */
export type WasmResult<T = any> = WasmSuccess<T> | WasmError;

/**
 * Successful WASM operation with discriminant property
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
 * WASM operation error with discriminant property
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
 * Type guard for successful WASM operations
 *
 * @param result
 */
export function isWasmSuccess<T = any>(result: WasmResult<T>): result is WasmSuccess<T> {
  return result?.wasmSuccess === true && 'result' in result;
}

/**
 * Type guard for WASM operation errors
 *
 * @param result
 */
export function isWasmError(result: WasmResult): result is WasmError {
  return result?.wasmSuccess === false && 'error' in result;
}

// ============================================
// Coordination Result Type Guards
// ============================================

/**
 * Union type for coordination operations
 */
export type CoordinationResult<T = any> = CoordinationSuccess<T> | CoordinationError;

/**
 * Successful coordination operation with discriminant property
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
 * Coordination operation error with discriminant property
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
 * Type guard for successful coordination operations
 *
 * @param result
 */
export function isCoordinationSuccess<T = any>(
  result: CoordinationResult<T>
): result is CoordinationSuccess<T> {
  return result?.coordinated === true && 'result' in result;
}

/**
 * Type guard for coordination operation errors
 *
 * @param result
 */
export function isCoordinationError(result: CoordinationResult): result is CoordinationError {
  return result?.coordinated === false && 'error' in result;
}

// ============================================
// Generic Result Type Guards
// ============================================

/**
 * Generic union type for operations with success/error states
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Generic success result
 *
 * @example
 */
export interface Success<T> {
  ok: true;
  value: T;
}

/**
 * Generic failure result
 *
 * @example
 */
export interface Failure<E = Error> {
  ok: false;
  error: E;
}

/**
 * Type guard for successful results
 *
 * @param result
 */
export function isSuccess<T, E = Error>(result: Result<T, E>): result is Success<T> {
  return result?.ok === true && 'value' in result;
}

/**
 * Type guard for failed results
 *
 * @param result
 */
export function isFailure<T, E = Error>(result: Result<T, E>): result is Failure<E> {
  return result?.ok === false && 'error' in result;
}

// ============================================
// Utility Functions for Safe Property Access
// ============================================

/**
 * Safely extract data from a result union type
 *
 * @param result
 */
export function extractData<T>(result: DatabaseResult<T>): T | null {
  if (isQuerySuccess(result)) {
    return result?.data;
  }
  return null;
}

/**
 * Safely extract error message from any result type
 *
 * @param result
 */
export function extractErrorMessage(
  result: DatabaseResult | MemoryResult | NeuralResult | APIResult | WasmResult | CoordinationResult
): string | null {
  if ('success' in result && !result?.success && 'error' in result) {
    return result?.error?.message;
  }
  if ('found' in result && !result?.found && 'error' in result) {
    return result?.error?.message;
  }
  if ('wasmSuccess' in result && !result?.wasmSuccess && 'error' in result) {
    return result?.error?.message;
  }
  if ('coordinated' in result && !result?.coordinated && 'error' in result) {
    return result?.error?.message;
  }
  if ('ok' in result && !result?.ok && 'error' in result) {
    return result?.error instanceof Error ? result?.error?.message : String(result?.error);
  }
  return null;
}

/**
 * Type predicate to check if an object has a specific property
 *
 * @param obj
 * @param prop
 */
export function hasProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj;
}

/**
 * Safe property access with type checking
 *
 * @param obj
 * @param prop
 */
export function safePropertyAccess<T, K extends keyof T>(
  obj: T | null | undefined,
  prop: K
): T[K] | undefined {
  if (obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj) {
    return obj[prop];
  }
  return undefined;
}

// ============================================
// Additional Type Guards for System Safety
// ============================================

/**
 * Type guard to check if an object is a valid neural network config
 *
 * @param obj
 */
export function isNeuralNetworkConfig(obj: any): obj is {
  layers: number[];
  activationFunctions: string[];
  learningRate: number;
} {
  return (typeof obj === 'object' &&
  obj !== null &&
  Array.isArray(obj["layers"]) &&
  obj["layers"]?.["every"]((layer: any) => typeof layer === 'number') &&
  Array.isArray(obj["activationFunctions"]) &&
  obj["activationFunctions"]?.["every"]((fn: any) => typeof fn === 'string') && typeof obj["learningRate"] === 'number');
}

/**
 * Type guard to check if a value is a valid activation function
 *
 * @param value
 */
export function isActivationFunction(value: any): value is string {
  const validFunctions = [
    'sigmoid',
    'tanh',
    'relu',
    'leaky_relu',
    'elu',
    'swish',
    'gelu',
    'softmax',
  ];
  return typeof value === 'string' && validFunctions.includes(value);
}

/**
 * Type guard for checking array of objects with required properties
 *
 * @param arr
 * @param requiredProps
 */
export function isObjectArrayWithProps<T>(arr: any, requiredProps: string[]): arr is T[] {
  if (!Array.isArray(arr)) {
    return false;
  }

  return arr.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    return requiredProps?.every((prop) => prop in item);
  });
}

/**
 * Type guard for checking if value is a non-empty string
 *
 * @param value
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for checking if value is a valid number (not NaN or Infinity)
 *
 * @param value
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}

/**
 * Type guard for checking if value is a valid positive number
 *
 * @param value
 */
export function isPositiveNumber(value: any): value is number {
  return isValidNumber(value) && value > 0;
}
