/**
 * @file Database-specific Error Types and Handling
 * Comprehensive error classification and recovery for database systems.
 */
export declare enum DatabaseErrorCode {
    COORDINATION_FAILED = "DATABASE_COORDINATION_FAILED",
    ENGINE_SELECTION_FAILED = "DATABASE_ENGINE_SELECTION_FAILED",
    ROUTING_FAILED = "DATABASE_ROUTING_FAILED",
    LOAD_BALANCING_FAILED = "DATABASE_LOAD_BALANCING_FAILED",
    ENGINE_UNAVAILABLE = "DATABASE_ENGINE_UNAVAILABLE",
    ENGINE_OVERLOADED = "DATABASE_ENGINE_OVERLOADED",
    ENGINE_TIMEOUT = "DATABASE_ENGINE_TIMEOUT",
    ENGINE_CONNECTION_FAILED = "DATABASE_ENGINE_CONNECTION_FAILED",
    ENGINE_INITIALIZATION_FAILED = "DATABASE_ENGINE_INITIALIZATION_FAILED",
    QUERY_INVALID = "DATABASE_QUERY_INVALID",
    QUERY_TIMEOUT = "DATABASE_QUERY_TIMEOUT",
    QUERY_OPTIMIZATION_FAILED = "DATABASE_QUERY_OPTIMIZATION_FAILED",
    QUERY_EXECUTION_FAILED = "DATABASE_QUERY_EXECUTION_FAILED",
    QUERY_RESULT_INVALID = "DATABASE_QUERY_RESULT_INVALID",
    PERFORMANCE_DEGRADED = "DATABASE_PERFORMANCE_DEGRADED",
    CACHE_MISS_RATE_HIGH = "DATABASE_CACHE_MISS_RATE_HIGH",
    LATENCY_THRESHOLD_EXCEEDED = "DATABASE_LATENCY_THRESHOLD_EXCEEDED",
    THROUGHPUT_LOW = "DATABASE_THROUGHPUT_LOW",
    TRANSACTION_FAILED = "DATABASE_TRANSACTION_FAILED",
    TRANSACTION_TIMEOUT = "DATABASE_TRANSACTION_TIMEOUT",
    TRANSACTION_ROLLBACK_FAILED = "DATABASE_TRANSACTION_ROLLBACK_FAILED",
    DEADLOCK_DETECTED = "DATABASE_DEADLOCK_DETECTED",
    CONSISTENCY_VIOLATION = "DATABASE_CONSISTENCY_VIOLATION",
    RESOURCE_EXHAUSTED = "DATABASE_RESOURCE_EXHAUSTED",
    CAPACITY_EXCEEDED = "DATABASE_CAPACITY_EXCEEDED",
    CONNECTION_POOL_EXHAUSTED = "DATABASE_CONNECTION_POOL_EXHAUSTED",
    MEMORY_LIMIT_EXCEEDED = "DATABASE_MEMORY_LIMIT_EXCEEDED",
    CONFIGURATION_INVALID = "DATABASE_CONFIGURATION_INVALID",
    SYSTEM_UNAVAILABLE = "DATABASE_SYSTEM_UNAVAILABLE",
    UNKNOWN_ERROR = "DATABASE_UNKNOWN_ERROR"
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
export declare class DatabaseError extends Error {
    readonly code: DatabaseErrorCode;
    readonly context: DatabaseErrorContext;
    readonly recoverable: boolean;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly retryable: boolean;
    constructor(code: DatabaseErrorCode, message: string, context: DatabaseErrorContext, options?: {
        recoverable?: boolean;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        retryable?: boolean;
        cause?: Error;
    });
    /**
     * Check if an error code is typically recoverable.
     *
     * @param code
     */
    static isRecoverable(code: DatabaseErrorCode): boolean;
    /**
     * Check if an error code is typically retryable.
     *
     * @param code
     */
    static isRetryable(code: DatabaseErrorCode): boolean;
    /**
     * Get severity level for an error code.
     *
     * @param code
     */
    static getSeverity(code: DatabaseErrorCode): 'low' | 'medium' | 'high' | 'critical';
    /**
     * Convert to a serializable object.
     */
    toJSON(): {
        name: string;
        message: string;
        code: DatabaseErrorCode;
        context: DatabaseErrorContext;
        recoverable: boolean;
        severity: "critical" | "low" | "medium" | "high";
        retryable: boolean;
        stack: string | undefined;
    };
    /**
     * Create a DatabaseError from a generic error.
     *
     * @param error
     * @param context
     */
    static fromError(error: Error, context: DatabaseErrorContext): DatabaseError;
}
export declare class DatabaseCoordinationError extends DatabaseError {
    constructor(message: string, context: DatabaseErrorContext, options?: {
        cause?: Error;
    });
}
export declare class DatabaseEngineError extends DatabaseError {
    constructor(code: DatabaseErrorCode, message: string, context: DatabaseErrorContext, options?: {
        cause?: Error;
    });
}
export declare class DatabaseQueryError extends DatabaseError {
    constructor(code: DatabaseErrorCode, message: string, context: DatabaseErrorContext, options?: {
        cause?: Error;
    });
}
export declare class DatabaseTransactionError extends DatabaseError {
    constructor(code: DatabaseErrorCode, message: string, context: DatabaseErrorContext, options?: {
        cause?: Error;
    });
}
/**
 * Error classification helper.
 *
 * @example
 */
export declare class DatabaseErrorClassifier {
    /**
     * Classify an error by its characteristics.
     *
     * @param error
     */
    static classify(error: Error | DatabaseError): {
        category: 'coordination' | 'engine' | 'query' | 'transaction' | 'performance' | 'resource' | 'system';
        priority: 'low' | 'medium' | 'high' | 'critical';
        actionRequired: boolean;
        suggestedActions: string[];
        retryStrategy?: 'immediate' | 'exponential_backoff' | 'circuit_breaker' | 'none';
    };
    private static classifyDatabaseError;
    private static inferCategory;
    private static inferPriority;
    private static getSuggestedActions;
    private static inferRetryStrategy;
    private static getRetryStrategy;
}
//# sourceMappingURL=database-errors.d.ts.map