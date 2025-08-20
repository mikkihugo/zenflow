/**
 * @fileoverview Comprehensive Type Guards for Foundation
 * 
 * Provides a complete set of type guard functions for safe union type property access
 * and runtime type validation. This module complements the patterns.ts module by providing
 * specific type guards for common data structures and patterns.
 * 
 * Key Features:
 * - Result pattern type guards
 * - Database result type guards
 * - Memory store operation result guards
 * - API response type guards
 * - Neural network result guards
 * - Generic utility type guards
 * - Safe property access utilities
 * 
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @example
 * ```typescript
 * import { isSuccess, isOperationResult, safePropertyAccess } from '@claude-zen/foundation/types';
 * 
 * const result = await someOperation();
 * if (isSuccess(result)) {
 *   console.log('Success:', result.value); // Type-safe access
 * }
 * ```
 */

import type { 
  OperationResult, 
  ValidationResult 
} from './patterns';

// =============================================================================
// RESULT PATTERN TYPE GUARDS - Integrates with patterns.ts
// =============================================================================

/**
 * Generic Result type following Rust/Functional patterns
 * Simpler than OperationResult for when you just need ok/error
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Generic success result
 */
export interface Success<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Generic failure result
 */
export interface Failure<E = Error> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Type guard for successful results
 */
export function isSuccess<T, E = Error>(
  result: Result<T, E>
): result is Success<T> {
  return result?.ok === true && 'value' in result;
}

/**
 * Type guard for failed results
 */
export function isFailure<T, E = Error>(
  result: Result<T, E>
): result is Failure<E> {
  return result?.ok === false && 'error' in result;
}

/**
 * Type guard for OperationResult success (from patterns.ts)
 */
export function isOperationSuccess<T, E = Error>(
  result: OperationResult<T, E>
): result is OperationResult<T, E> & { success: true; data: T } {
  return result.success === true && result.data !== undefined;
}

/**
 * Type guard for OperationResult error (from patterns.ts)
 */
export function isOperationError<T, E = Error>(
  result: OperationResult<T, E>
): result is OperationResult<T, E> & { success: false; error: E } {
  return result.success === false && result.error !== undefined;
}

/**
 * Type guard for ValidationResult success
 */
export function isValidationSuccess(
  result: ValidationResult
): result is ValidationResult & { isValid: true } {
  return result.isValid === true;
}

/**
 * Type guard for ValidationResult failure
 */
export function isValidationFailure(
  result: ValidationResult
): result is ValidationResult & { isValid: false } {
  return result.isValid === false && result.errors.length > 0;
}

// =============================================================================
// DATABASE RESULT TYPE GUARDS
// =============================================================================

/**
 * Database query result types
 */
export type DatabaseResult<T = any> = QuerySuccess<T> | QueryError;

export interface QuerySuccess<T = any> {
  readonly success: true;
  readonly data: T;
  readonly rowCount: number;
  readonly executionTime: number;
  readonly fields?: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
}

export interface QueryError {
  readonly success: false;
  readonly error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  readonly executionTime: number;
}

/**
 * Type guard for successful database queries
 */
export function isQuerySuccess<T = any>(
  result: DatabaseResult<T>
): result is QuerySuccess<T> {
  return result?.success === true && 'data' in result;
}

/**
 * Type guard for database query errors
 */
export function isQueryError(result: DatabaseResult): result is QueryError {
  return result?.success === false && 'error' in result;
}

// =============================================================================
// MEMORY STORE RESULT TYPE GUARDS
// =============================================================================

export type MemoryResult<T = any> = MemorySuccess<T> | MemoryNotFound | MemoryError;

export interface MemorySuccess<T = any> {
  readonly found: true;
  readonly data: T;
  readonly key: string;
  readonly timestamp: Date;
  readonly ttl?: number;
  readonly metadata?: Record<string, unknown>;
}

export interface MemoryNotFound {
  readonly found: false;
  readonly key: string;
  readonly reason: 'not_found' | 'expired';
}

export interface MemoryError {
  readonly found: false;
  readonly error: {
    code: string;
    message: string;
    key: string;
  };
}

/**
 * Type guard for successful memory operations
 */
export function isMemorySuccess<T = any>(
  result: MemoryResult<T>
): result is MemorySuccess<T> {
  return result?.found === true && 'data' in result;
}

/**
 * Type guard for memory not found results
 */
export function isMemoryNotFound(
  result: MemoryResult
): result is MemoryNotFound {
  return result?.found === false && 'reason' in result;
}

/**
 * Type guard for memory operation errors
 */
export function isMemoryError(result: MemoryResult): result is MemoryError {
  return result?.found === false && 'error' in result;
}

// =============================================================================
// API RESPONSE TYPE GUARDS
// =============================================================================

export type APIResult<T = any> = APISuccess<T> | APIError;

export interface APISuccess<T = any> {
  readonly success: true;
  readonly data: T;
  readonly metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface APIError {
  readonly success: false;
  readonly error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  readonly metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

/**
 * Type guard for successful API responses
 */
export function isAPISuccess<T = any>(
  result: APIResult<T>
): result is APISuccess<T> {
  return result?.success === true && 'data' in result;
}

/**
 * Type guard for API error responses
 */
export function isAPIError(result: APIResult): result is APIError {
  return result?.success === false && 'error' in result;
}

// =============================================================================
// NEURAL NETWORK RESULT TYPE GUARDS
// =============================================================================

export type NeuralResult = TrainingResult | InferenceResult | NeuralError;

export interface TrainingResult {
  readonly type: 'training';
  readonly success: true;
  readonly finalError: number;
  readonly epochsCompleted: number;
  readonly duration: number;
  readonly converged: boolean;
  readonly accuracy?: number;
  readonly validationError?: number;
}

export interface InferenceResult {
  readonly type: 'inference';
  readonly success: true;
  readonly predictions: number[];
  readonly confidence?: number[];
  readonly processingTime: number;
}

export interface NeuralError {
  readonly type: 'error';
  readonly success: false;
  readonly error: {
    code: string;
    message: string;
    operation: 'training' | 'inference' | 'initialization';
    details?: unknown;
  };
}

/**
 * Type guard for neural training results
 */
export function isTrainingResult(
  result: NeuralResult
): result is TrainingResult {
  return result?.type === 'training' && result?.success === true;
}

/**
 * Type guard for neural inference results
 */
export function isInferenceResult(
  result: NeuralResult
): result is InferenceResult {
  return result?.type === 'inference' && result?.success === true;
}

/**
 * Type guard for neural operation errors
 */
export function isNeuralError(result: NeuralResult): result is NeuralError {
  return result?.type === 'error' && result?.success === false;
}

// =============================================================================
// UTILITY TYPE GUARDS
// =============================================================================

/**
 * Type predicate to check if an object has a specific property
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
 * Safe property access with comprehensive type checking
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

/**
 * Type guard for checking if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for checking if value is a valid number (not NaN or Infinity)
 */
export function isValidNumber(value: unknown): value is number {
  return (
    typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
  );
}

/**
 * Type guard for checking if value is a valid positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0;
}

/**
 * Type guard for checking array of objects with required properties
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

// =============================================================================
// ERROR MESSAGE EXTRACTION UTILITIES
// =============================================================================

/**
 * Safely extract data from a database result
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
    | OperationResult
    | Result<any, any>
): string | null {
  // Handle OperationResult pattern
  if ('success' in result && !result.success && 'error' in result && result.error) {
    if (typeof result.error === 'string') {
      return result.error;
    }
    if (typeof result.error === 'object' && 'message' in result.error) {
      return result.error.message as string;
    }
    return String(result.error);
  }

  // Handle Result pattern
  if ('ok' in result && !result.ok && 'error' in result) {
    if (result.error instanceof Error) {
      return result.error.message;
    }
    return String(result.error);
  }

  // Handle MemoryResult pattern
  if ('found' in result && !result.found && 'error' in result) {
    return result.error.message;
  }

  // Handle other specific patterns
  if ('type' in result && result.type === 'error' && 'error' in result) {
    return result.error.message;
  }

  return null;
}

// =============================================================================
// HELPER FUNCTIONS FOR RESULT CREATION
// =============================================================================

/**
 * Create a successful Result
 */
export function createSuccess<T>(value: T): Success<T> {
  return { ok: true, value };
}

/**
 * Create a failed Result
 */
export function createFailure<E = Error>(error: E): Failure<E> {
  return { ok: false, error };
}

/**
 * Convert Result to OperationResult
 */
export function resultToOperation<T, E = Error>(
  result: Result<T, E>,
  metadata?: Record<string, unknown>
): OperationResult<T, E> {
  if (isSuccess(result)) {
    return {
      success: true,
      data: result.value,
      metadata
    };
  } else {
    return {
      success: false,
      error: result.error,
      metadata
    };
  }
}

/**
 * Convert OperationResult to Result
 */
export function operationToResult<T, E = Error>(
  operation: OperationResult<T, E>
): Result<T, E> {
  if (isOperationSuccess(operation)) {
    return createSuccess(operation.data);
  } else {
    return createFailure(operation.error!);
  }
}