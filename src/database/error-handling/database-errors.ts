/**
 * @fileoverview Database-specific Error Types and Handling
 * Comprehensive error classification and recovery for database systems
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
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
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
    this.name = 'DatabaseError';
    this.code = code;
    this.context = context;
    this.recoverable = options.recoverable ?? DatabaseError.isRecoverable(code);
    this.severity = options.severity ?? DatabaseError.getSeverity(code);
    this.retryable = options.retryable ?? DatabaseError.isRetryable(code);

    if (options.cause) {
      this.cause = options.cause;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }

  /**
   * Check if an error code is typically recoverable
   */
  static isRecoverable(code: DatabaseErrorCode): boolean {
    const recoverableErrors = new Set([
      DatabaseErrorCode.ENGINE_TIMEOUT,
      DatabaseErrorCode.ENGINE_OVERLOADED,
      DatabaseErrorCode.QUERY_TIMEOUT,
      DatabaseErrorCode.PERFORMANCE_DEGRADED,
      DatabaseErrorCode.CACHE_MISS_RATE_HIGH,
      DatabaseErrorCode.THROUGHPUT_LOW,
      DatabaseErrorCode.TRANSACTION_TIMEOUT,
      DatabaseErrorCode.CONNECTION_POOL_EXHAUSTED,
      DatabaseErrorCode.SYSTEM_UNAVAILABLE,
    ]);

    return recoverableErrors.has(code);
  }

  /**
   * Check if an error code is typically retryable
   */
  static isRetryable(code: DatabaseErrorCode): boolean {
    const retryableErrors = new Set([
      DatabaseErrorCode.ENGINE_TIMEOUT,
      DatabaseErrorCode.QUERY_TIMEOUT,
      DatabaseErrorCode.ENGINE_CONNECTION_FAILED,
      DatabaseErrorCode.TRANSACTION_TIMEOUT,
      DatabaseErrorCode.DEADLOCK_DETECTED,
      DatabaseErrorCode.SYSTEM_UNAVAILABLE,
    ]);

    return retryableErrors.has(code);
  }

  /**
   * Get severity level for an error code
   */
  static getSeverity(code: DatabaseErrorCode): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      [DatabaseErrorCode.COORDINATION_FAILED]: 'high',
      [DatabaseErrorCode.ENGINE_SELECTION_FAILED]: 'medium',
      [DatabaseErrorCode.ROUTING_FAILED]: 'medium',
      [DatabaseErrorCode.LOAD_BALANCING_FAILED]: 'low',
      [DatabaseErrorCode.ENGINE_UNAVAILABLE]: 'high',
      [DatabaseErrorCode.ENGINE_OVERLOADED]: 'medium',
      [DatabaseErrorCode.ENGINE_TIMEOUT]: 'medium',
      [DatabaseErrorCode.ENGINE_CONNECTION_FAILED]: 'high',
      [DatabaseErrorCode.ENGINE_INITIALIZATION_FAILED]: 'critical',
      [DatabaseErrorCode.QUERY_INVALID]: 'low',
      [DatabaseErrorCode.QUERY_TIMEOUT]: 'medium',
      [DatabaseErrorCode.QUERY_OPTIMIZATION_FAILED]: 'low',
      [DatabaseErrorCode.QUERY_EXECUTION_FAILED]: 'medium',
      [DatabaseErrorCode.QUERY_RESULT_INVALID]: 'medium',
      [DatabaseErrorCode.PERFORMANCE_DEGRADED]: 'medium',
      [DatabaseErrorCode.CACHE_MISS_RATE_HIGH]: 'low',
      [DatabaseErrorCode.LATENCY_THRESHOLD_EXCEEDED]: 'medium',
      [DatabaseErrorCode.THROUGHPUT_LOW]: 'medium',
      [DatabaseErrorCode.TRANSACTION_FAILED]: 'high',
      [DatabaseErrorCode.TRANSACTION_TIMEOUT]: 'medium',
      [DatabaseErrorCode.TRANSACTION_ROLLBACK_FAILED]: 'critical',
      [DatabaseErrorCode.DEADLOCK_DETECTED]: 'medium',
      [DatabaseErrorCode.CONSISTENCY_VIOLATION]: 'critical',
      [DatabaseErrorCode.RESOURCE_EXHAUSTED]: 'high',
      [DatabaseErrorCode.CAPACITY_EXCEEDED]: 'high',
      [DatabaseErrorCode.CONNECTION_POOL_EXHAUSTED]: 'high',
      [DatabaseErrorCode.MEMORY_LIMIT_EXCEEDED]: 'critical',
      [DatabaseErrorCode.CONFIGURATION_INVALID]: 'critical',
      [DatabaseErrorCode.SYSTEM_UNAVAILABLE]: 'critical',
      [DatabaseErrorCode.UNKNOWN_ERROR]: 'medium',
    } as const;

    return severityMap[code] || 'medium';
  }

  /**
   * Convert to a serializable object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      recoverable: this.recoverable,
      severity: this.severity,
      retryable: this.retryable,
      stack: this.stack,
    };
  }

  /**
   * Create a DatabaseError from a generic error
   */
  static fromError(error: Error, context: DatabaseErrorContext): DatabaseError {
    // Try to determine error code from error message or type
    let code = DatabaseErrorCode.UNKNOWN_ERROR;

    if (error.message.includes('timeout')) {
      code = DatabaseErrorCode.QUERY_TIMEOUT;
    } else if (error.message.includes('connection') || error.message.includes('connect')) {
      code = DatabaseErrorCode.ENGINE_CONNECTION_FAILED;
    } else if (error.message.includes('invalid') || error.message.includes('malformed')) {
      code = DatabaseErrorCode.QUERY_INVALID;
    } else if (error.message.includes('overload') || error.message.includes('busy')) {
      code = DatabaseErrorCode.ENGINE_OVERLOADED;
    } else if (error.message.includes('deadlock')) {
      code = DatabaseErrorCode.DEADLOCK_DETECTED;
    } else if (error.message.includes('capacity') || error.message.includes('limit')) {
      code = DatabaseErrorCode.CAPACITY_EXCEEDED;
    } else if (error.message.includes('transaction')) {
      code = DatabaseErrorCode.TRANSACTION_FAILED;
    }

    return new DatabaseError(code, error.message, context, { cause: error });
  }
}

export class DatabaseCoordinationError extends DatabaseError {
  constructor(message: string, context: DatabaseErrorContext, options: { cause?: Error } = {}) {
    super(DatabaseErrorCode.COORDINATION_FAILED, message, context, options);
    this.name = 'DatabaseCoordinationError';
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
    this.name = 'DatabaseEngineError';
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
    this.name = 'DatabaseQueryError';
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
    this.name = 'DatabaseTransactionError';
  }
}

/**
 * Error classification helper
 */
export class DatabaseErrorClassifier {
  /**
   * Classify an error by its characteristics
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
    retryStrategy?: 'immediate' | 'exponential_backoff' | 'circuit_breaker' | 'none';
  } {
    if (error instanceof DatabaseError) {
      return DatabaseErrorClassifier.classifyDatabaseError(error);
    }

    // Classify generic errors
    const category = DatabaseErrorClassifier.inferCategory(error);
    const priority = DatabaseErrorClassifier.inferPriority(error);

    return {
      category,
      priority,
      actionRequired: priority === 'high' || priority === 'critical',
      suggestedActions: DatabaseErrorClassifier.getSuggestedActions(category, error.message),
      retryStrategy: DatabaseErrorClassifier.inferRetryStrategy(error),
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
      error.code.includes('COORDINATION') ||
      error.code.includes('ROUTING') ||
      error.code.includes('BALANCING')
    ) {
      category = 'coordination';
    } else if (error.code.includes('ENGINE')) {
      category = 'engine';
    } else if (error.code.includes('QUERY')) {
      category = 'query';
    } else if (
      error.code.includes('TRANSACTION') ||
      error.code.includes('DEADLOCK') ||
      error.code.includes('CONSISTENCY')
    ) {
      category = 'transaction';
    } else if (
      error.code.includes('PERFORMANCE') ||
      error.code.includes('CACHE') ||
      error.code.includes('LATENCY') ||
      error.code.includes('THROUGHPUT')
    ) {
      category = 'performance';
    } else if (
      error.code.includes('RESOURCE') ||
      error.code.includes('CAPACITY') ||
      error.code.includes('MEMORY') ||
      error.code.includes('CONNECTION_POOL')
    ) {
      category = 'resource';
    } else {
      category = 'system';
    }

    return {
      category,
      priority: error.severity,
      actionRequired: error.severity === 'high' || error.severity === 'critical',
      suggestedActions: DatabaseErrorClassifier.getSuggestedActions(category, error.message),
      retryStrategy: DatabaseErrorClassifier.getRetryStrategy(error),
    };
  }

  private static inferCategory(
    error: Error
  ): 'coordination' | 'engine' | 'query' | 'transaction' | 'performance' | 'resource' | 'system' {
    const message = error.message.toLowerCase();

    if (
      message.includes('coordination') ||
      message.includes('routing') ||
      message.includes('balancing')
    ) {
      return 'coordination';
    }
    if (
      message.includes('engine') ||
      message.includes('database') ||
      message.includes('connection')
    ) {
      return 'engine';
    }
    if (message.includes('query') || message.includes('sql') || message.includes('syntax')) {
      return 'query';
    }
    if (
      message.includes('transaction') ||
      message.includes('deadlock') ||
      message.includes('rollback')
    ) {
      return 'transaction';
    }
    if (message.includes('performance') || message.includes('slow') || message.includes('cache')) {
      return 'performance';
    }
    if (
      message.includes('resource') ||
      message.includes('capacity') ||
      message.includes('memory')
    ) {
      return 'resource';
    }
    return 'system';
  }

  private static inferPriority(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();

    if (
      message.includes('critical') ||
      message.includes('fatal') ||
      message.includes('corruption')
    ) {
      return 'critical';
    }
    if (
      message.includes('failed') ||
      message.includes('error') ||
      message.includes('unavailable')
    ) {
      return 'high';
    }
    if (message.includes('warning') || message.includes('slow') || message.includes('timeout')) {
      return 'medium';
    }
    return 'low';
  }

  private static getSuggestedActions(category: string, message: string): string[] {
    const actions = [];

    switch (category) {
      case 'coordination':
        actions.push('Check engine availability');
        actions.push('Verify load balancing configuration');
        if (message.includes('routing')) {
          actions.push('Review routing strategies');
        }
        break;

      case 'engine':
        actions.push('Check engine connectivity');
        actions.push('Verify engine configuration');
        if (message.includes('timeout')) {
          actions.push('Increase query timeout');
        }
        if (message.includes('overload')) {
          actions.push('Scale engine resources');
        }
        break;

      case 'query':
        actions.push('Validate query syntax');
        actions.push('Check query parameters');
        if (message.includes('optimization')) {
          actions.push('Review optimization rules');
        }
        break;

      case 'transaction':
        actions.push('Review transaction logic');
        actions.push('Check for deadlock patterns');
        if (message.includes('timeout')) {
          actions.push('Increase transaction timeout');
        }
        break;

      case 'performance':
        actions.push('Monitor system resources');
        actions.push('Analyze query performance');
        if (message.includes('cache')) {
          actions.push('Optimize cache configuration');
        }
        break;

      case 'resource':
        actions.push('Check resource utilization');
        actions.push('Scale system resources');
        if (message.includes('memory')) {
          actions.push('Optimize memory usage');
        }
        break;

      case 'system':
        actions.push('Check system health');
        actions.push('Review system logs');
        actions.push('Verify configuration');
        break;
    }

    return actions;
  }

  private static inferRetryStrategy(
    error: Error
  ): 'immediate' | 'exponential_backoff' | 'circuit_breaker' | 'none' {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('busy')) {
      return 'exponential_backoff';
    }
    if (message.includes('deadlock')) {
      return 'immediate';
    }
    if (message.includes('unavailable') || message.includes('connection')) {
      return 'circuit_breaker';
    }
    if (message.includes('invalid') || message.includes('syntax')) {
      return 'none';
    }
    return 'exponential_backoff';
  }

  private static getRetryStrategy(
    error: DatabaseError
  ): 'immediate' | 'exponential_backoff' | 'circuit_breaker' | 'none' {
    if (!error.retryable) {
      return 'none';
    }

    switch (error.code) {
      case DatabaseErrorCode.DEADLOCK_DETECTED:
        return 'immediate';

      case DatabaseErrorCode.ENGINE_TIMEOUT:
      case DatabaseErrorCode.QUERY_TIMEOUT:
      case DatabaseErrorCode.TRANSACTION_TIMEOUT:
        return 'exponential_backoff';

      case DatabaseErrorCode.ENGINE_UNAVAILABLE:
      case DatabaseErrorCode.ENGINE_CONNECTION_FAILED:
      case DatabaseErrorCode.SYSTEM_UNAVAILABLE:
        return 'circuit_breaker';

      default:
        return 'exponential_backoff';
    }
  }
}
