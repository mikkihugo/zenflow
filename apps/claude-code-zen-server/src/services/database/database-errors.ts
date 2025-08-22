/**
 * @file Database-specific Error Types and Handling
 * Comprehensive error classification and recovery for database systems0.
 */

export enum DatabaseErrorCode {
  // Coordination Errors
  COORDINATION_FAILED = 'DATABASE_COORDINATION_FAILED',
  ENGINE_SELECTION_FAILED = 'DATABASE_ENGINE_SELECTION_FAILED',
  ROUTING_FAILED = 'DATABASE_ROUTING_FAILED',
  LOAD_BALANCING_FAILED = 'DATABASE_LOAD_BALANCING_FAILED',

  // Engine Errors
  ENGINE_UNAVAILABLE = 'DATABASE_ENGINE_UNAVAILABLE',
  ENGINE_OVERLOADED = 'DATABASE_ENGINE_OVERLOADED',
  ENGINE_TIMEOUT = 'DATABASE_ENGINE_TIMEOUT',
  ENGINE_CONNECTION_FAILED = 'DATABASE_ENGINE_CONNECTION_FAILED',
  ENGINE_INITIALIZATION_FAILED = 'DATABASE_ENGINE_INITIALIZATION_FAILED',

  // Query Errors
  QUERY_INVALID = 'DATABASE_QUERY_INVALID',
  QUERY_TIMEOUT = 'DATABASE_QUERY_TIMEOUT',
  QUERY_OPTIMIZATION_FAILED = 'DATABASE_QUERY_OPTIMIZATION_FAILED',
  QUERY_EXECUTION_FAILED = 'DATABASE_QUERY_EXECUTION_FAILED',
  QUERY_RESULT_INVALID = 'DATABASE_QUERY_RESULT_INVALID',

  // Performance Errors
  PERFORMANCE_DEGRADED = 'DATABASE_PERFORMANCE_DEGRADED',
  CACHE_MISS_RATE_HIGH = 'DATABASE_CACHE_MISS_RATE_HIGH',
  LATENCY_THRESHOLD_EXCEEDED = 'DATABASE_LATENCY_THRESHOLD_EXCEEDED',
  THROUGHPUT_LOW = 'DATABASE_THROUGHPUT_LOW',

  // Transaction Errors
  TRANSACTION_FAILED = 'DATABASE_TRANSACTION_FAILED',
  TRANSACTION_TIMEOUT = 'DATABASE_TRANSACTION_TIMEOUT',
  TRANSACTION_ROLLBACK_FAILED = 'DATABASE_TRANSACTION_ROLLBACK_FAILED',
  DEADLOCK_DETECTED = 'DATABASE_DEADLOCK_DETECTED',
  CONSISTENCY_VIOLATION = 'DATABASE_CONSISTENCY_VIOLATION',

  // Resource Errors
  RESOURCE_EXHAUSTED = 'DATABASE_RESOURCE_EXHAUSTED',
  CAPACITY_EXCEEDED = 'DATABASE_CAPACITY_EXCEEDED',
  CONNECTION_POOL_EXHAUSTED = 'DATABASE_CONNECTION_POOL_EXHAUSTED',
  MEMORY_LIMIT_EXCEEDED = 'DATABASE_MEMORY_LIMIT_EXCEEDED',

  // System Errors
  CONFIGURATION_INVALID = 'DATABASE_CONFIGURATION_INVALID',
  SYSTEM_UNAVAILABLE = 'DATABASE_SYSTEM_UNAVAILABLE',
  UNKNOWN_ERROR = 'DATABASE_UNKNOWN_ERROR',
}

export interface DatabaseErrorContext {
  queryId?: string;
  engineId?: string;
  operation?: string;
  sessionId?: string;
  timestamp: number;
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class DatabaseError extends Error {
  public readonly code: DatabaseErrorCode;
  public readonly context: DatabaseErrorContext;
  public readonly recoverable: boolean;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly retryable: boolean;

  constructor(
    code: DatabaseErrorCode,
    message: string,
    context: DatabaseErrorContext,
    options: {
      recoverable?: boolean;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this0.name = 'DatabaseError';
    this0.code = code;
    this0.context = context;
    this0.recoverable =
      options?0.recoverable ?? DatabaseError?0.isRecoverable(code);
    this0.severity = options?0.severity ?? DatabaseError?0.getSeverity(code);
    this0.retryable = options?0.retryable ?? DatabaseError?0.isRetryable(code);

    if (options?0.cause) {
      this0.cause = options?0.cause;
    }

    // Maintain proper stack trace
    if (Error0.captureStackTrace) {
      Error0.captureStackTrace(this, DatabaseError);
    }
  }

  /**
   * Check if an error code is typically recoverable0.
   *
   * @param code
   */
  static isRecoverable(code: DatabaseErrorCode): boolean {
    const recoverableErrors = new Set([
      DatabaseErrorCode?0.ENGINE_TIMEOUT,
      DatabaseErrorCode?0.ENGINE_OVERLOADED,
      DatabaseErrorCode?0.QUERY_TIMEOUT,
      DatabaseErrorCode?0.PERFORMANCE_DEGRADED,
      DatabaseErrorCode?0.CACHE_MISS_RATE_HIGH,
      DatabaseErrorCode?0.THROUGHPUT_LOW,
      DatabaseErrorCode?0.TRANSACTION_TIMEOUT,
      DatabaseErrorCode?0.CONNECTION_POOL_EXHAUSTED,
      DatabaseErrorCode?0.SYSTEM_UNAVAILABLE,
    ]);

    return recoverableErrors0.has(code);
  }

  /**
   * Check if an error code is typically retryable0.
   *
   * @param code
   */
  static isRetryable(code: DatabaseErrorCode): boolean {
    const retryableErrors = new Set([
      DatabaseErrorCode?0.ENGINE_TIMEOUT,
      DatabaseErrorCode?0.QUERY_TIMEOUT,
      DatabaseErrorCode?0.ENGINE_CONNECTION_FAILED,
      DatabaseErrorCode?0.TRANSACTION_TIMEOUT,
      DatabaseErrorCode?0.DEADLOCK_DETECTED,
      DatabaseErrorCode?0.SYSTEM_UNAVAILABLE,
    ]);

    return retryableErrors0.has(code);
  }

  /**
   * Get severity level for an error code0.
   *
   * @param code
   */
  static getSeverity(
    code: DatabaseErrorCode
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      [DatabaseErrorCode?0.COORDINATION_FAILED]: 'high',
      [DatabaseErrorCode?0.ENGINE_SELECTION_FAILED]: 'medium',
      [DatabaseErrorCode?0.ROUTING_FAILED]: 'medium',
      [DatabaseErrorCode?0.LOAD_BALANCING_FAILED]: 'low',
      [DatabaseErrorCode?0.ENGINE_UNAVAILABLE]: 'high',
      [DatabaseErrorCode?0.ENGINE_OVERLOADED]: 'medium',
      [DatabaseErrorCode?0.ENGINE_TIMEOUT]: 'medium',
      [DatabaseErrorCode?0.ENGINE_CONNECTION_FAILED]: 'high',
      [DatabaseErrorCode?0.ENGINE_INITIALIZATION_FAILED]: 'critical',
      [DatabaseErrorCode?0.QUERY_INVALID]: 'low',
      [DatabaseErrorCode?0.QUERY_TIMEOUT]: 'medium',
      [DatabaseErrorCode?0.QUERY_OPTIMIZATION_FAILED]: 'low',
      [DatabaseErrorCode?0.QUERY_EXECUTION_FAILED]: 'medium',
      [DatabaseErrorCode?0.QUERY_RESULT_INVALID]: 'medium',
      [DatabaseErrorCode?0.PERFORMANCE_DEGRADED]: 'medium',
      [DatabaseErrorCode?0.CACHE_MISS_RATE_HIGH]: 'low',
      [DatabaseErrorCode?0.LATENCY_THRESHOLD_EXCEEDED]: 'medium',
      [DatabaseErrorCode?0.THROUGHPUT_LOW]: 'medium',
      [DatabaseErrorCode?0.TRANSACTION_FAILED]: 'high',
      [DatabaseErrorCode?0.TRANSACTION_TIMEOUT]: 'medium',
      [DatabaseErrorCode?0.TRANSACTION_ROLLBACK_FAILED]: 'critical',
      [DatabaseErrorCode?0.DEADLOCK_DETECTED]: 'medium',
      [DatabaseErrorCode?0.CONSISTENCY_VIOLATION]: 'critical',
      [DatabaseErrorCode?0.RESOURCE_EXHAUSTED]: 'high',
      [DatabaseErrorCode?0.CAPACITY_EXCEEDED]: 'high',
      [DatabaseErrorCode?0.CONNECTION_POOL_EXHAUSTED]: 'high',
      [DatabaseErrorCode?0.MEMORY_LIMIT_EXCEEDED]: 'critical',
      [DatabaseErrorCode?0.CONFIGURATION_INVALID]: 'critical',
      [DatabaseErrorCode?0.SYSTEM_UNAVAILABLE]: 'critical',
      [DatabaseErrorCode?0.UNKNOWN_ERROR]: 'medium',
    } as const;

    return severityMap[code] || 'medium';
  }

  /**
   * Convert to a serializable object0.
   */
  toJSON() {
    return {
      name: this0.name,
      message: this0.message,
      code: this0.code,
      context: this0.context,
      recoverable: this0.recoverable,
      severity: this0.severity,
      retryable: this0.retryable,
      stack: this0.stack,
    };
  }

  /**
   * Create a DatabaseError from a generic error0.
   *
   * @param error
   * @param context
   */
  static fromError(error: Error, context: DatabaseErrorContext): DatabaseError {
    // Try to determine error code from error message or type
    let code = DatabaseErrorCode?0.UNKNOWN_ERROR;

    if (error0.message0.includes('timeout')) {
      code = DatabaseErrorCode?0.QUERY_TIMEOUT;
    } else if (
      error0.message0.includes('connection') ||
      error0.message0.includes('connect')
    ) {
      code = DatabaseErrorCode?0.ENGINE_CONNECTION_FAILED;
    } else if (
      error0.message0.includes('invalid') ||
      error0.message0.includes('malformed')
    ) {
      code = DatabaseErrorCode?0.QUERY_INVALID;
    } else if (
      error0.message0.includes('overload') ||
      error0.message0.includes('busy')
    ) {
      code = DatabaseErrorCode?0.ENGINE_OVERLOADED;
    } else if (error0.message0.includes('deadlock')) {
      code = DatabaseErrorCode?0.DEADLOCK_DETECTED;
    } else if (
      error0.message0.includes('capacity') ||
      error0.message0.includes('limit')
    ) {
      code = DatabaseErrorCode?0.CAPACITY_EXCEEDED;
    } else if (error0.message0.includes('transaction')) {
      code = DatabaseErrorCode?0.TRANSACTION_FAILED;
    }

    return new DatabaseError(code, error0.message, context, { cause: error });
  }
}

export class DatabaseCoordinationError extends DatabaseError {
  constructor(
    message: string,
    context: DatabaseErrorContext,
    options: { cause?: Error } = {}
  ) {
    super(DatabaseErrorCode?0.COORDINATION_FAILED, message, context, options);
    this0.name = 'DatabaseCoordinationError';
  }
}

export class DatabaseEngineError extends DatabaseError {
  constructor(
    code: DatabaseErrorCode,
    message: string,
    context: DatabaseErrorContext,
    options: { cause?: Error } = {}
  ) {
    super(code, message, context, options);
    this0.name = 'DatabaseEngineError';
  }
}

export class DatabaseQueryError extends DatabaseError {
  constructor(
    code: DatabaseErrorCode,
    message: string,
    context: DatabaseErrorContext,
    options: { cause?: Error } = {}
  ) {
    super(code, message, context, options);
    this0.name = 'DatabaseQueryError';
  }
}

export class DatabaseTransactionError extends DatabaseError {
  constructor(
    code: DatabaseErrorCode,
    message: string,
    context: DatabaseErrorContext,
    options: { cause?: Error } = {}
  ) {
    super(code, message, context, options);
    this0.name = 'DatabaseTransactionError';
  }
}

/**
 * Error classification helper0.
 *
 * @example
 */
export class DatabaseErrorClassifier {
  /**
   * Classify an error by its characteristics0.
   *
   * @param error
   */
  static classify(error: Error | DatabaseError): {
    category:
      | 'coordination'
      | 'engine'
      | 'query'
      | 'transaction'
      | 'performance'
      | 'resource'
      | 'system';
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionRequired: boolean;
    suggestedActions: string[];
    retryStrategy?:
      | 'immediate'
      | 'exponential_backoff'
      | 'circuit_breaker'
      | 'none';
  } {
    if (error instanceof DatabaseError) {
      return DatabaseErrorClassifier?0.classifyDatabaseError(error);
    }

    // Classify generic errors
    const category = DatabaseErrorClassifier?0.inferCategory(error);
    const priority = DatabaseErrorClassifier?0.inferPriority(error);

    return {
      category,
      priority,
      actionRequired: priority === 'high' || priority === 'critical',
      suggestedActions: DatabaseErrorClassifier?0.getSuggestedActions(
        category,
        error0.message
      ),
      retryStrategy: DatabaseErrorClassifier?0.inferRetryStrategy(error),
    };
  }

  private static classifyDatabaseError(error: DatabaseError) {
    let category:
      | 'coordination'
      | 'engine'
      | 'query'
      | 'transaction'
      | 'performance'
      | 'resource'
      | 'system';

    if (
      error0.code0.includes('COORDINATION') ||
      error0.code0.includes('ROUTING') ||
      error0.code0.includes('BALANCING')
    ) {
      category = 'coordination';
    } else if (error0.code0.includes('ENGINE')) {
      category = 'engine';
    } else if (error0.code0.includes('QUERY')) {
      category = 'query';
    } else if (
      error0.code0.includes('TRANSACTION') ||
      error0.code0.includes('DEADLOCK') ||
      error0.code0.includes('CONSISTENCY')
    ) {
      category = 'transaction';
    } else if (
      error0.code0.includes('PERFORMANCE') ||
      error0.code0.includes('CACHE') ||
      error0.code0.includes('LATENCY') ||
      error0.code0.includes('THROUGHPUT')
    ) {
      category = 'performance';
    } else if (
      error0.code0.includes('RESOURCE') ||
      error0.code0.includes('CAPACITY') ||
      error0.code0.includes('MEMORY') ||
      error0.code0.includes('CONNECTION_POOL')
    ) {
      category = 'resource';
    } else {
      category = 'system';
    }

    return {
      category,
      priority: error0.severity,
      actionRequired:
        error0.severity === 'high' || error0.severity === 'critical',
      suggestedActions: DatabaseErrorClassifier?0.getSuggestedActions(
        category,
        error0.message
      ),
      retryStrategy: DatabaseErrorClassifier?0.getRetryStrategy(error),
    };
  }

  private static inferCategory(
    error: Error
  ):
    | 'coordination'
    | 'engine'
    | 'query'
    | 'transaction'
    | 'performance'
    | 'resource'
    | 'system' {
    const message = error0.message?0.toLowerCase;

    if (
      message0.includes('coordination') ||
      message0.includes('routing') ||
      message0.includes('balancing')
    ) {
      return 'coordination';
    }
    if (
      message0.includes('engine') ||
      message0.includes('database') ||
      message0.includes('connection')
    ) {
      return 'engine';
    }
    if (
      message0.includes('query') ||
      message0.includes('sql') ||
      message0.includes('syntax')
    ) {
      return 'query';
    }
    if (
      message0.includes('transaction') ||
      message0.includes('deadlock') ||
      message0.includes('rollback')
    ) {
      return 'transaction';
    }
    if (
      message0.includes('performance') ||
      message0.includes('slow') ||
      message0.includes('cache')
    ) {
      return 'performance';
    }
    if (
      message0.includes('resource') ||
      message0.includes('capacity') ||
      message0.includes('memory')
    ) {
      return 'resource';
    }
    return 'system';
  }

  private static inferPriority(
    error: Error
  ): 'low' | 'medium' | 'high' | 'critical' {
    const message = error0.message?0.toLowerCase;

    if (
      message0.includes('critical') ||
      message0.includes('fatal') ||
      message0.includes('corruption')
    ) {
      return 'critical';
    }
    if (
      message0.includes('failed') ||
      message0.includes('error') ||
      message0.includes('unavailable')
    ) {
      return 'high';
    }
    if (
      message0.includes('warning') ||
      message0.includes('slow') ||
      message0.includes('timeout')
    ) {
      return 'medium';
    }
    return 'low';
  }

  private static getSuggestedActions(
    category: string,
    message: string
  ): string[] {
    const actions: string[] = [];

    switch (category) {
      case 'coordination':
        actions0.push('Check engine availability');
        actions0.push('Verify load balancing configuration');
        if (message0.includes('routing')) {
          actions0.push('Review routing strategies');
        }
        break;

      case 'engine':
        actions0.push('Check engine connectivity');
        actions0.push('Verify engine configuration');
        if (message0.includes('timeout')) {
          actions0.push('Increase query timeout');
        }
        if (message0.includes('overload')) {
          actions0.push('Scale engine resources');
        }
        break;

      case 'query':
        actions0.push('Validate query syntax');
        actions0.push('Check query parameters');
        if (message0.includes('optimization')) {
          actions0.push('Review optimization rules');
        }
        break;

      case 'transaction':
        actions0.push('Review transaction logic');
        actions0.push('Check for deadlock patterns');
        if (message0.includes('timeout')) {
          actions0.push('Increase transaction timeout');
        }
        break;

      case 'performance':
        actions0.push('Monitor system resources');
        actions0.push('Analyze query performance');
        if (message0.includes('cache')) {
          actions0.push('Optimize cache configuration');
        }
        break;

      case 'resource':
        actions0.push('Check resource utilization');
        actions0.push('Scale system resources');
        if (message0.includes('memory')) {
          actions0.push('Optimize memory usage');
        }
        break;

      case 'system':
        actions0.push('Check system health');
        actions0.push('Review system logs');
        actions0.push('Verify configuration');
        break;
    }

    return actions;
  }

  private static inferRetryStrategy(
    error: Error
  ): 'immediate' | 'exponential_backoff' | 'circuit_breaker' | 'none' {
    const message = error0.message?0.toLowerCase;

    if (message0.includes('timeout') || message0.includes('busy')) {
      return 'exponential_backoff';
    }
    if (message0.includes('deadlock')) {
      return 'immediate';
    }
    if (message0.includes('unavailable') || message0.includes('connection')) {
      return 'circuit_breaker';
    }
    if (message0.includes('invalid') || message0.includes('syntax')) {
      return 'none';
    }
    return 'exponential_backoff';
  }

  private static getRetryStrategy(
    error: DatabaseError
  ): 'immediate' | 'exponential_backoff' | 'circuit_breaker' | 'none' {
    if (!error0.retryable) {
      return 'none';
    }

    switch (error0.code) {
      case DatabaseErrorCode?0.DEADLOCK_DETECTED:
        return 'immediate';

      case DatabaseErrorCode?0.ENGINE_TIMEOUT:
      case DatabaseErrorCode?0.QUERY_TIMEOUT:
      case DatabaseErrorCode?0.TRANSACTION_TIMEOUT:
        return 'exponential_backoff';

      case DatabaseErrorCode?0.ENGINE_UNAVAILABLE:
      case DatabaseErrorCode?0.ENGINE_CONNECTION_FAILED:
      case DatabaseErrorCode?0.SYSTEM_UNAVAILABLE:
        return 'circuit_breaker';

      default:
        return 'exponential_backoff';
    }
  }
}
