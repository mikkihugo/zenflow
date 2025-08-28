/**
 * @file Memory-specific Error Types and Handling
 * Comprehensive error classification and recovery for memory systems.
 */
export declare enum MemoryErrorCode {
    CoordinationFailed = "MEMORY_COORDINATION_FAILED",
    ConsensusTimeout = "MEMORY_CONSENSUS_TIMEOUT",
    NodeUnreachable = "MEMORY_NODE_UNREACHABLE",
    QuorumNotReached = "MEMORY_QUORUM_NOT_REACHED",
    BackendInitializationFailed = "MEMORY_BACKEND_INIT_FAILED",
    BackendConnectionLost = "MEMORY_BACKEND_CONNECTION_LOST",
    BackendCorrupted = "MEMORY_BACKEND_CORRUPTED",
    BackendCapacityExceeded = "MEMORY_BACKEND_CAPACITY_EXCEEDED",
    DataCorruption = "MEMORY_DATA_CORRUPTION",
    DataInconsistency = "MEMORY_DATA_INCONSISTENCY",
    DataNotFound = "MEMORY_DATA_NOT_FOUND",
    DataVersionConflict = "MEMORY_DATA_VERSION_CONFLICT",
    OptimizationFailed = "MEMORY_OPTIMIZATION_FAILED",
    MemoryThresholdExceeded = "MEMORY_THRESHOLD_EXCEEDED",
    CacheMissRateHigh = "MEMORY_CACHE_MISS_RATE_HIGH",
    LatencyThresholdExceeded = "MEMORY_LATENCY_THRESHOLD_EXCEEDED",
    ResourceExhausted = "MEMORY_RESOURCE_EXHAUSTED",
    ConfigurationInvalid = "MEMORY_CONFIGURATION_INVALID",
    SystemOverload = "MEMORY_SYSTEM_OVERLOAD",
    UnknownError = "MEMORY_UNKNOWN_ERROR"
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
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    constructor(code: MemoryErrorCode, message: string, context: MemoryErrorContext, options?: {
        recoverable?: boolean;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        cause?: Error;
    });
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
    static getSeverity(code: MemoryErrorCode): 'low' | 'medium' | 'high' | 'critical';
    /**
     * Convert to a serializable object.
     */
    toJSON(): {
        name: string;
        message: string;
        code: MemoryErrorCode;
        context: MemoryErrorContext;
        recoverable: boolean;
        severity: "critical" | "low" | "medium" | "high";
        stack: string;
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
    constructor(message: string, context: MemoryErrorContext, options?: {
        cause?: Error;
    });
}
export declare class MemoryBackendError extends MemoryError {
    constructor(code: MemoryErrorCode, message: string, context: MemoryErrorContext, options?: {
        cause?: Error;
    });
}
export declare class MemoryDataError extends MemoryError {
    constructor(code: MemoryErrorCode, message: string, context: MemoryErrorContext, options?: {
        cause?: Error;
    });
}
export declare class MemoryPerformanceError extends MemoryError {
    constructor(code: MemoryErrorCode, message: string, context: MemoryErrorContext, options?: {
        cause?: Error;
    });
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
    static classify(error: Error | MemoryError): {
        category: 'coordination|backend|data|performance|system';
        priority: 'low|medium|high|critical';
        actionRequired: boolean;
        suggestedActions: string[];
    };
    private static classifyMemoryError;
    private static inferCategory;
    private static inferPriority;
    private static getSuggestedActions;
}
//# sourceMappingURL=index.d.ts.map