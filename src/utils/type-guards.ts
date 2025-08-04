/**
 * Type Guards Utility Module
 *
 * Provides type guard functions for safe union type property access
 * throughout the claude-code-zen codebase. This addresses TypeScript
 * strict mode compilation issues with union type handling.
 *
 * @fileoverview Comprehensive type guards for union type safety
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
 */
export function isQuerySuccess<T = any>(result: DatabaseResult<T>): result is QuerySuccess<T> {
  return result.success === true && 'data' in result;
}

/**
 * Type guard for database query errors
 */
export function isQueryError(result: DatabaseResult): result is QueryError {
  return result.success === false && 'error' in result;
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
 */
export interface MemoryNotFound {
  found: false;
  key: string;
  reason: 'not_found' | 'expired';
}

/**
 * Memory operation error with discriminant property
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
 */
export function isMemorySuccess<T = any>(result: MemoryResult<T>): result is MemorySuccess<T> {
  return result.found === true && 'data' in result;
}

/**
 * Type guard for memory not found results
 */
export function isMemoryNotFound(result: MemoryResult): result is MemoryNotFound {
  return result.found === false && 'reason' in result;
}

/**
 * Type guard for memory operation errors
 */
export function isMemoryError(result: MemoryResult): result is MemoryError {
  return result.found === false && 'error' in result;
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
 */
export function isTrainingResult(result: NeuralResult): result is TrainingResult {
  return result.type === 'training' && result.success === true;
}

/**
 * Type guard for neural inference results
 */
export function isInferenceResult(result: NeuralResult): result is InferenceResult {
  return result.type === 'inference' && result.success === true;
}

/**
 * Type guard for neural operation errors
 */
export function isNeuralError(result: NeuralResult): result is NeuralError {
  return result.type === 'error' && result.success === false;
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
 */
export function isAPISuccess<T = any>(result: APIResult<T>): result is APISuccess<T> {
  return result.success === true && 'data' in result;
}

/**
 * Type guard for API error responses
 */
export function isAPIError(result: APIResult): result is APIError {
  return result.success === false && 'error' in result;
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
 */
export interface WasmSuccess<T = any> {
  wasmSuccess: true;
  result: T;
  executionTime: number;
  memoryUsage: number;
}

/**
 * WASM operation error with discriminant property
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
 */
export function isWasmSuccess<T = any>(result: WasmResult<T>): result is WasmSuccess<T> {
  return result.wasmSuccess === true && 'result' in result;
}

/**
 * Type guard for WASM operation errors
 */
export function isWasmError(result: WasmResult): result is WasmError {
  return result.wasmSuccess === false && 'error' in result;
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
 */
export function isCoordinationSuccess<T = any>(
  result: CoordinationResult<T>,
): result is CoordinationSuccess<T> {
  return result.coordinated === true && 'result' in result;
}

/**
 * Type guard for coordination operation errors
 */
export function isCoordinationError(result: CoordinationResult): result is CoordinationError {
  return result.coordinated === false && 'error' in result;
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
 */
export interface Success<T> {
  ok: true;
  value: T;
}

/**
 * Generic failure result
 */
export interface Failure<E = Error> {
  ok: false;
  error: E;
}

/**
 * Type guard for successful results
 */
export function isSuccess<T, E = Error>(result: Result<T, E>): result is Success<T> {
  return result.ok === true && 'value' in result;
}

/**
 * Type guard for failed results
 */
export function isFailure<T, E = Error>(result: Result<T, E>): result is Failure<E> {
  return result.ok === false && 'error' in result;
}

// ============================================
// Utility Functions for Safe Property Access
// ============================================

/**
 * Safely extract data from a result union type
 */
export function extractData<T>(result: DatabaseResult<T>): T | null {
  if (isQuerySuccess(result)) {
    return result.data;
  }
  return null;
}

/**
 * Safely extract error message from any result type
 */
export function extractErrorMessage(
  result:
    | DatabaseResult
    | MemoryResult
    | NeuralResult
    | APIResult
    | WasmResult
    | CoordinationResult,
): string | null {
  if ('success' in result && !result.success && 'error' in result) {
    return result.error.message;
  }
  if ('found' in result && !result.found && 'error' in result) {
    return result.error.message;
  }
  if ('wasmSuccess' in result && !result.wasmSuccess && 'error' in result) {
    return result.error.message;
  }
  if ('coordinated' in result && !result.coordinated && 'error' in result) {
    return result.error.message;
  }
  if ('ok' in result && !result.ok) {
    return result.error instanceof Error ? result.error.message : String(result.error);
  }
  return null;
}

/**
 * Type predicate to check if an object has a specific property
 */
export function hasProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj;
}

/**
 * Safe property access with type checking
 */
export function safePropertyAccess<T, K extends keyof T>(
  obj: T | null | undefined,
  prop: K,
): T[K] | undefined {
  if (obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj) {
    return obj[prop];
  }
  return undefined;
}
