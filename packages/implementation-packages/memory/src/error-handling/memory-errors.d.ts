/**
 * @file Memory-specific Error Types and Handling
 * Comprehensive error classification and recovery for memory systems.
 */
export declare enum MemoryErrorCode {
  COORDINATION_FAILED = 'MEMORY_COORDINATION_FAILED',
  CONSENSUS_TIMEOUT = 'MEMORY_CONSENSUS_TIMEOUT',
  NODE_UNREACHABLE = 'MEMORY_NODE_UNREACHABLE',
  QUORUM_NOT_REACHED = 'MEMORY_QUORUM_NOT_REACHED',
  BACKEND_INITIALIZATION_FAILED = 'MEMORY_BACKEND_INIT_FAILED',
  BACKEND_CONNECTION_LOST = 'MEMORY_BACKEND_CONNECTION_LOST',
  BACKEND_CORRUPTED = 'MEMORY_BACKEND_CORRUPTED',
  BACKEND_CAPACITY_EXCEEDED = 'MEMORY_BACKEND_CAPACITY_EXCEEDED',
  DATA_CORRUPTION = 'MEMORY_DATA_CORRUPTION',
  DATA_INCONSISTENCY = 'MEMORY_DATA_INCONSISTENCY',
  DATA_NOT_FOUND = 'MEMORY_DATA_NOT_FOUND',
  DATA_VERSION_CONFLICT = 'MEMORY_DATA_VERSION_CONFLICT',
  OPTIMIZATION_FAILED = 'MEMORY_OPTIMIZATION_FAILED',
  MEMORY_THRESHOLD_EXCEEDED = 'MEMORY_THRESHOLD_EXCEEDED',
  CACHE_MISS_RATE_HIGH = 'MEMORY_CACHE_MISS_RATE_HIGH',
  LATENCY_THRESHOLD_EXCEEDED = 'MEMORY_LATENCY_THRESHOLD_EXCEEDED',
  RESOURCE_EXHAUSTED = 'MEMORY_RESOURCE_EXHAUSTED',
  CONFIGURATION_INVALID = 'MEMORY_CONFIGURATION_INVALID',
  SYSTEM_OVERLOAD = 'MEMORY_SYSTEM_OVERLOAD',
  UNKNOWN_ERROR = 'MEMORY_UNKNOWN_ERROR',
}
export interface MemoryErrorContext {
  sessionId?: string;
  backendId?: string;
  nodeId?: string;
  operation?: string;
  key?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
export declare class MemoryError extends Error {
  readonly code: MemoryErrorCode;
  readonly context: MemoryErrorContext;
  readonly recoverable: boolean;
  readonly severity: 'low | medium' | 'high''' | '''critical';
  constructor(
    code: MemoryErrorCode,
    message: string,
    context: MemoryErrorContext,
    options?: {
      recoverable?: boolean;
      severity?: 'low | medium' | 'high''' | '''critical';
      cause?: Error;
    }
  );
  /**
   * Check if an error code is typically recoverable.
   *
   * @param code
   */
  static isRecoverable(code: MemoryErrorCode): boolean;
  /**
   * Get severity level for an error code.
   *
   * @param code
   */
  static getSeverity(
    code: MemoryErrorCode
  ): 'low | medium' | 'high''' | '''critical';
  /**
   * Convert to a serializable object.
   */
  toJSON(): {
    name: string;
    message: string;
    code: MemoryErrorCode;
    context: MemoryErrorContext;
    recoverable: boolean;
    severity: 'low | medium' | 'high''' | '''critical';
    stack: string'' | ''undefined;
  };
  /**
   * Create a MemoryError from a generic error.
   *
   * @param error
   * @param context
   */
  static fromError(error: Error, context: MemoryErrorContext): MemoryError;
}
export declare class MemoryCoordinationError extends MemoryError {
  constructor(
    message: string,
    context: MemoryErrorContext,
    options?: {
      cause?: Error;
    }
  );
}
export declare class MemoryBackendError extends MemoryError {
  constructor(
    code: MemoryErrorCode,
    message: string,
    context: MemoryErrorContext,
    options?: {
      cause?: Error;
    }
  );
}
export declare class MemoryDataError extends MemoryError {
  constructor(
    code: MemoryErrorCode,
    message: string,
    context: MemoryErrorContext,
    options?: {
      cause?: Error;
    }
  );
}
export declare class MemoryPerformanceError extends MemoryError {
  constructor(
    code: MemoryErrorCode,
    message: string,
    context: MemoryErrorContext,
    options?: {
      cause?: Error;
    }
  );
}
/**
 * Error classification helper.
 *
 * @example
 */
export declare class MemoryErrorClassifier {
  /**
   * Classify an error by its characteristics.
   *
   * @param error
   */
  static classify(error: Error'' | ''MemoryError): {
    category:'coordination | backend' | 'data' | 'performance' | 'system';
    priority: 'low | medium' | 'high''' | '''critical';
    actionRequired: boolean;
    suggestedActions: string[];
  };
  private static classifyMemoryError;
  private static inferCategory;
  private static inferPriority;
  private static getSuggestedActions;
}
//# sourceMappingURL=memory-errors.d.ts.map
