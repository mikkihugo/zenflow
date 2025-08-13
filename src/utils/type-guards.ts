/**
 * @fileoverview Comprehensive Type Guards Utility Module for Claude Code Zen
 *
 * Provides a complete set of type guard functions for safe union type property access
 * throughout the claude-code-zen codebase. This module addresses TypeScript strict mode
 * compilation issues with union type handling and provides runtime type safety.
 *
 * Key Features:
 * - Database result type guards with discriminant unions
 * - Memory store operation result guards
 * - Neural network training/inference result guards
 * - API response type guards with metadata support
 * - WASM operation result type guards
 * - Coordination system result type guards
 * - Generic Result<T, E> pattern implementation
 * - Utility functions for safe property access
 * - Specialized type guards for system components
 *
 * Type Safety Benefits:
 * - Eliminates unsafe union type access
 * - Provides compile-time type narrowing
 * - Runtime type validation with proper error handling
 * - Consistent error message extraction across result types
 * - Safe property access patterns
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 1.0.0-alpha.43
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html} TypeScript Type Narrowing
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates} Type Predicates
 *
 * @requires typescript >= 4.0 - For discriminant union support
 * @requires @types/node - For Node.js type definitions
 *
 * @example
 * ```typescript
 * // Database result handling
 * const dbResult = await queryDatabase();
 * if (isQuerySuccess(dbResult)) {
 *   console.log('Data:', dbResult.data); // Type-safe access
 * } else if (isQueryError(dbResult)) {
 *   console.error('Error:', dbResult.error.message); // Type-safe error handling
 * }
 *
 * // Memory store result handling
 * const memResult = await memoryStore.get('key');
 * if (isMemorySuccess(memResult)) {
 *   processData(memResult.data); // Guaranteed to exist
 * }
 *
 * // Neural network result handling
 * const neuralResult = await trainNetwork();
 * if (isTrainingResult(neuralResult)) {
 *   console.log('Training completed with error:', neuralResult.finalError);
 * }
 * ```
 */

// ============================================
// Database Result Type Guards
// ============================================

/**
 * Union type for database query operations.
 *
 * Discriminant union that represents the result of any database query operation.
 * Uses the `success` property as a discriminant for type narrowing.
 *
 * @template T - The type of data returned on successful queries
 * @type {QuerySuccess<T> | QueryError}
 *
 * @example
 * ```typescript
 * async function getUserById(id: string): Promise<DatabaseResult<User>> {
 *   try {
 *     const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 *     return {
 *       success: true,
 *       data: result.rows[0],
 *       rowCount: result.rowCount,
 *       executionTime: performance.now() - startTime
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: { code: 'DB_ERROR', message: error.message },
 *       executionTime: performance.now() - startTime
 *     };
 *   }
 * }
 * ```
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
    details?: unknown;
    stack?: string;
  };
  executionTime: number;
}

/**
 * Type guard for successful database query results.
 *
 * Narrows a DatabaseResult union type to QuerySuccess<T> by checking
 * the discriminant property and ensuring data property exists.
 *
 * @template T - The expected data type for successful queries
 * @param {DatabaseResult<T>} result - The database result to check
 * @returns {result is QuerySuccess<T>} True if result is a successful query
 *
 * @example
 * ```typescript
 * const result = await getUserById('123');
 * if (isQuerySuccess(result)) {
 *   // TypeScript knows result.data exists and is of type T
 *   console.log('User found:', result.data.name);
 *   console.log('Query took:', result.executionTime, 'ms');
 *   console.log('Rows returned:', result.rowCount);
 * }
 * ```
 *
 * @see {@link QuerySuccess} Success result interface
 * @see {@link DatabaseResult} Union type definition
 */
export function isQuerySuccess<T = any>(
  result: DatabaseResult<T>
): result is QuerySuccess<T> {
  return result?.success === true && 'data' in result;
}

/**
 * Type guard for database query errors.
 *
 * @param result
 * @example
 */
export function isQueryError(result: DatabaseResult): result is QueryError {
  return result?.success === false && 'error' in result;
}

// ============================================
// Memory Store Result Type Guards
// ============================================

/**
 * Union type for memory store operations.
 */
export type MemoryResult<T = any> =
  | MemorySuccess<T>
  | MemoryNotFound
  | MemoryError;

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
  metadata?: Record<string, unknown>;
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
export function isMemorySuccess<T = any>(
  result: MemoryResult<T>
): result is MemorySuccess<T> {
  return result?.found === true && 'data' in result;
}

/**
 * Type guard for memory not found results.
 *
 * @param result
 * @example
 */
export function isMemoryNotFound(
  result: MemoryResult
): result is MemoryNotFound {
  return result?.found === false && 'reason' in result;
}

/**
 * Type guard for memory operation errors.
 *
 * @param result
 * @example
 */
export function isMemoryError(result: MemoryResult): result is MemoryError {
  return result?.found === false && 'error' in result;
}

// ============================================
// Neural Network Result Type Guards
// ============================================

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
    details?: unknown;
  };
}

/**
 * Type guard for neural training results.
 *
 * @param result
 * @example
 */
export function isTrainingResult(
  result: NeuralResult
): result is TrainingResult {
  return result?.type === 'training' && result?.success === true;
}

/**
 * Type guard for neural inference results.
 *
 * @param result
 * @example
 */
export function isInferenceResult(
  result: NeuralResult
): result is InferenceResult {
  return result?.type === 'inference' && result?.success === true;
}

/**
 * Type guard for neural operation errors.
 *
 * @param result
 * @example
 */
export function isNeuralError(result: NeuralResult): result is NeuralError {
  return result?.type === 'error' && result?.success === false;
}

// ============================================
// API Response Type Guards
// ============================================

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
    details?: unknown;
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
export function isAPISuccess<T = any>(
  result: APIResult<T>
): result is APISuccess<T> {
  return result?.success === true && 'data' in result;
}

/**
 * Type guard for API error responses.
 *
 * @param result
 * @example
 */
export function isAPIError(result: APIResult): result is APIError {
  return result?.success === false && 'error' in result;
}

// ============================================
// WASM Operation Result Type Guards
// ============================================

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
export function isWasmSuccess<T = any>(
  result: WasmResult<T>
): result is WasmSuccess<T> {
  return result?.wasmSuccess === true && 'result' in result;
}

/**
 * Type guard for WASM operation errors.
 *
 * @param result
 * @example
 */
export function isWasmError(result: WasmResult): result is WasmError {
  return result?.wasmSuccess === false && 'error' in result;
}

// ============================================
// Coordination Result Type Guards
// ============================================

/**
 * Union type for coordination operations.
 */
export type CoordinationResult<T = any> =
  | CoordinationSuccess<T>
  | CoordinationError;

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
    partialResults?: unknown;
  };
  duration: number;
}

/**
 * Type guard for successful coordination operations.
 *
 * @param result
 * @example
 */
export function isCoordinationSuccess<T = any>(
  result: CoordinationResult<T>
): result is CoordinationSuccess<T> {
  return result?.coordinated === true && 'result' in result;
}

/**
 * Type guard for coordination operation errors.
 *
 * @param result
 * @example
 */
export function isCoordinationError(
  result: CoordinationResult
): result is CoordinationError {
  return result?.coordinated === false && 'error' in result;
}

// ============================================
// Generic Result Type Guards
// ============================================

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
export function isSuccess<T, E = Error>(
  result: Result<T, E>
): result is Success<T> {
  return result?.ok === true && 'value' in result;
}

/**
 * Type guard for failed results.
 *
 * @param result
 * @example
 */
export function isFailure<T, E = Error>(
  result: Result<T, E>
): result is Failure<E> {
  return result?.ok === false && 'error' in result;
}

// ============================================
// Utility Functions for Safe Property Access
// ============================================

/**
 * Safely extract data from a database result union type.
 *
 * Uses type guards internally to safely extract data from successful
 * database operations, returning null for error cases.
 *
 * @template T - The expected data type
 * @param {DatabaseResult<T>} result - The database result to extract data from
 * @returns {T | null} The extracted data or null if the operation failed
 *
 * @example
 * ```typescript
 * const dbResult = await getUserById('123');
 * const userData = extractData(dbResult);
 *
 * if (userData) {
 *   // userData is guaranteed to be of type T
 *   console.log('User:', userData.name);
 * } else {
 *   // Handle the error case
 *   const errorMsg = extractErrorMessage(dbResult);
 *   console.error('Failed to get user:', errorMsg);
 * }
 * ```
 *
 * @see {@link isQuerySuccess} Type guard used internally
 * @see {@link extractErrorMessage} For error message extraction
 */
export function extractData<T>(result: DatabaseResult<T>): T | null {
  if (isQuerySuccess(result)) {
    return result?.data;
  }
  return null;
}

/**
 * Safely extract error message from any result type.
 *
 * @param result
 * @example
 */
export function extractErrorMessage(
  result:
    | DatabaseResult
    | MemoryResult
    | NeuralResult
    | APIResult
    | WasmResult
    | CoordinationResult
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
    return result?.error instanceof Error
      ? result?.error?.message
      : String(result?.error);
  }
  return null;
}

/**
 * Type predicate to check if an object has a specific property.
 *
 * @param obj
 * @param prop
 * @example
 */
export function hasProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return (
    obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj
  );
}

/**
 * Safe property access with comprehensive type checking.
 *
 * Provides null-safe property access with TypeScript type preservation.
 * Handles null, undefined, and non-object values gracefully.
 *
 * @template T - The object type to access properties from
 * @template K - The property key type (must be keyof T)
 * @param {T | null | undefined} obj - The object to access properties from
 * @param {K} prop - The property key to access
 * @returns {T[K] | undefined} The property value or undefined if access is unsafe
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email?: string;
 * }
 *
 * const user: User | null = await getUser();
 * const userName = safePropertyAccess(user, 'name');
 * const userEmail = safePropertyAccess(user, 'email');
 *
 * if (userName) {
 *   console.log('User name:', userName); // Type is string
 * }
 *
 * if (userEmail) {
 *   console.log('User email:', userEmail); // Type is string
 * }
 * ```
 *
 * @safety
 * - Handles null and undefined objects gracefully
 * - Validates object type before property access
 * - Preserves TypeScript type information
 * - Never throws runtime errors
 *
 * @see {@link hasProperty} For existence checking without value extraction
 */
export function safePropertyAccess<T, K extends keyof T>(
  obj: T | null | undefined,
  prop: K
): T[K] | undefined {
  if (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    prop in obj
  ) {
    return obj[prop];
  }
  return undefined;
}

// ============================================
// Additional Type Guards for System Safety
// ============================================

/**
 * Type guard to check if an object is a valid neural network config.
 *
 * @param obj
 * @example
 */
export function isNeuralNetworkConfig(obj: unknown): obj is {
  layers: number[];
  activationFunctions: string[];
  learningRate: number;
} {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj['layers']) &&
    obj['layers']?.['every']((layer: unknown) => typeof layer === 'number') &&
    Array.isArray(obj['activationFunctions']) &&
    obj['activationFunctions']?.['every'](
      (fn: unknown) => typeof fn === 'string'
    ) &&
    typeof obj['learningRate'] === 'number'
  );
}

/**
 * Type guard to check if a value is a valid activation function.
 *
 * @param value
 * @example
 */
export function isActivationFunction(value: unknown): value is string {
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
 * Type guard for checking array of objects with required properties.
 *
 * @param arr
 * @param requiredProps
 * @example
 */
export function isObjectArrayWithProps<T>(
  arr: unknown,
  requiredProps: string[]
): arr is T[] {
  if (!Array.isArray(arr)) {
    return false;
  }

  return arr.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    return requiredProps.every((prop) => prop in item);
  });
}

/**
 * Type guard for checking if value is a non-empty string.
 *
 * @param value
 * @example
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for checking if value is a valid number (not NaN or Infinity).
 *
 * @param value.
 * @param value
 * @example
 */
export function isValidNumber(value: unknown): value is number {
  return (
    typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
  );
}

/**
 * Type guard for checking if value is a valid positive number.
 *
 * @param value
 * @example
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0;
}
