/**
 * @file Memory-specific Error Types and Handling
 * Comprehensive error classification and recovery for memory systems.
 */
export var MemoryErrorCode;
(function (MemoryErrorCode) {
    // Coordination Errors
    MemoryErrorCode["COORDINATION_FAILED"] = "MEMORY_COORDINATION_FAILED";
    MemoryErrorCode["CONSENSUS_TIMEOUT"] = "MEMORY_CONSENSUS_TIMEOUT";
    MemoryErrorCode["NODE_UNREACHABLE"] = "MEMORY_NODE_UNREACHABLE";
    MemoryErrorCode["QUORUM_NOT_REACHED"] = "MEMORY_QUORUM_NOT_REACHED";
    // Backend Errors
    MemoryErrorCode["BACKEND_INITIALIZATION_FAILED"] = "MEMORY_BACKEND_INIT_FAILED";
    MemoryErrorCode["BACKEND_CONNECTION_LOST"] = "MEMORY_BACKEND_CONNECTION_LOST";
    MemoryErrorCode["BACKEND_CORRUPTED"] = "MEMORY_BACKEND_CORRUPTED";
    MemoryErrorCode["BACKEND_CAPACITY_EXCEEDED"] = "MEMORY_BACKEND_CAPACITY_EXCEEDED";
    // Data Errors
    MemoryErrorCode["DATA_CORRUPTION"] = "MEMORY_DATA_CORRUPTION";
    MemoryErrorCode["DATA_INCONSISTENCY"] = "MEMORY_DATA_INCONSISTENCY";
    MemoryErrorCode["DATA_NOT_FOUND"] = "MEMORY_DATA_NOT_FOUND";
    MemoryErrorCode["DATA_VERSION_CONFLICT"] = "MEMORY_DATA_VERSION_CONFLICT";
    // Performance Errors
    MemoryErrorCode["OPTIMIZATION_FAILED"] = "MEMORY_OPTIMIZATION_FAILED";
    MemoryErrorCode["MEMORY_THRESHOLD_EXCEEDED"] = "MEMORY_THRESHOLD_EXCEEDED";
    MemoryErrorCode["CACHE_MISS_RATE_HIGH"] = "MEMORY_CACHE_MISS_RATE_HIGH";
    MemoryErrorCode["LATENCY_THRESHOLD_EXCEEDED"] = "MEMORY_LATENCY_THRESHOLD_EXCEEDED";
    // System Errors
    MemoryErrorCode["RESOURCE_EXHAUSTED"] = "MEMORY_RESOURCE_EXHAUSTED";
    MemoryErrorCode["CONFIGURATION_INVALID"] = "MEMORY_CONFIGURATION_INVALID";
    MemoryErrorCode["SYSTEM_OVERLOAD"] = "MEMORY_SYSTEM_OVERLOAD";
    MemoryErrorCode["UNKNOWN_ERROR"] = "MEMORY_UNKNOWN_ERROR";
})(MemoryErrorCode || (MemoryErrorCode = {}));
export class MemoryError extends Error {
    code;
    context;
    recoverable;
    severity;
    constructor(code, message, context, options = {}) {
        super(message);
        this.name = 'MemoryError';
        this.code = code;
        this.context = context;
        this.recoverable = options?.recoverable ?? MemoryError.isRecoverable(code);
        this.severity = options?.severity ?? MemoryError.getSeverity(code);
        if (options?.cause) {
            this.cause = options?.cause;
        }
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MemoryError);
        }
    }
    /**
     * Check if an error code is typically recoverable.
     *
     * @param code
     */
    static isRecoverable(code) {
        const recoverableErrors = new Set([
            MemoryErrorCode.CONSENSUS_TIMEOUT,
            MemoryErrorCode.NODE_UNREACHABLE,
            MemoryErrorCode.BACKEND_CONNECTION_LOST,
            MemoryErrorCode.OPTIMIZATION_FAILED,
            MemoryErrorCode.CACHE_MISS_RATE_HIGH,
            MemoryErrorCode.SYSTEM_OVERLOAD,
        ]);
        return recoverableErrors.has(code);
    }
    /**
     * Get severity level for an error code.
     *
     * @param code
     */
    static getSeverity(code) {
        const severityMap = {
            [MemoryErrorCode.COORDINATION_FAILED]: 'high',
            [MemoryErrorCode.CONSENSUS_TIMEOUT]: 'medium',
            [MemoryErrorCode.NODE_UNREACHABLE]: 'medium',
            [MemoryErrorCode.QUORUM_NOT_REACHED]: 'high',
            [MemoryErrorCode.BACKEND_INITIALIZATION_FAILED]: 'critical',
            [MemoryErrorCode.BACKEND_CONNECTION_LOST]: 'high',
            [MemoryErrorCode.BACKEND_CORRUPTED]: 'critical',
            [MemoryErrorCode.BACKEND_CAPACITY_EXCEEDED]: 'high',
            [MemoryErrorCode.DATA_CORRUPTION]: 'critical',
            [MemoryErrorCode.DATA_INCONSISTENCY]: 'high',
            [MemoryErrorCode.DATA_NOT_FOUND]: 'low',
            [MemoryErrorCode.DATA_VERSION_CONFLICT]: 'medium',
            [MemoryErrorCode.OPTIMIZATION_FAILED]: 'low',
            [MemoryErrorCode.MEMORY_THRESHOLD_EXCEEDED]: 'medium',
            [MemoryErrorCode.CACHE_MISS_RATE_HIGH]: 'low',
            [MemoryErrorCode.LATENCY_THRESHOLD_EXCEEDED]: 'medium',
            [MemoryErrorCode.RESOURCE_EXHAUSTED]: 'high',
            [MemoryErrorCode.CONFIGURATION_INVALID]: 'critical',
            [MemoryErrorCode.SYSTEM_OVERLOAD]: 'medium',
            [MemoryErrorCode.UNKNOWN_ERROR]: 'medium',
        };
        return severityMap[code] || 'medium';
    }
    /**
     * Convert to a serializable object.
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            recoverable: this.recoverable,
            severity: this.severity,
            stack: this.stack,
        };
    }
    /**
     * Create a MemoryError from a generic error.
     *
     * @param error
     * @param context
     */
    static fromError(error, context) {
        // Try to determine error code from error message or type
        let code = MemoryErrorCode.UNKNOWN_ERROR;
        if (error.message.includes('timeout')) {
            code = MemoryErrorCode.CONSENSUS_TIMEOUT;
        }
        else if (error.message.includes('connection') ||
            error.message.includes('unreachable')) {
            code = MemoryErrorCode.NODE_UNREACHABLE;
        }
        else if (error.message.includes('corruption') ||
            error.message.includes('corrupted')) {
            code = MemoryErrorCode.DATA_CORRUPTION;
        }
        else if (error.message.includes('not found')) {
            code = MemoryErrorCode.DATA_NOT_FOUND;
        }
        else if (error.message.includes('capacity') ||
            error.message.includes('full')) {
            code = MemoryErrorCode.BACKEND_CAPACITY_EXCEEDED;
        }
        return new MemoryError(code, error.message, context, { cause: error });
    }
}
export class MemoryCoordinationError extends MemoryError {
    constructor(message, context, options = {}) {
        super(MemoryErrorCode.COORDINATION_FAILED, message, context, options);
        this.name = 'MemoryCoordinationError';
    }
}
export class MemoryBackendError extends MemoryError {
    constructor(code, message, context, options = {}) {
        super(code, message, context, options);
        this.name = 'MemoryBackendError';
    }
}
export class MemoryDataError extends MemoryError {
    constructor(code, message, context, options = {}) {
        super(code, message, context, options);
        this.name = 'MemoryDataError';
    }
}
export class MemoryPerformanceError extends MemoryError {
    constructor(code, message, context, options = {}) {
        super(code, message, context, options);
        this.name = 'MemoryPerformanceError';
    }
}
/**
 * Error classification helper.
 *
 * @example
 */
export class MemoryErrorClassifier {
    /**
     * Classify an error by its characteristics.
     *
     * @param error
     */
    static classify(error) {
        if (error instanceof MemoryError) {
            return MemoryErrorClassifier.classifyMemoryError(error);
        }
        // Classify generic errors
        const category = MemoryErrorClassifier.inferCategory(error);
        const priority = MemoryErrorClassifier.inferPriority(error);
        return {
            category,
            priority,
            actionRequired: priority === 'high' || priority === 'critical',
            suggestedActions: MemoryErrorClassifier.getSuggestedActions(category, error.message),
        };
    }
    static classifyMemoryError(error) {
        let category;
        if (error.code.includes('COORDINATION') ||
            error.code.includes('CONSENSUS') ||
            error.code.includes('QUORUM')) {
            category = 'coordination';
        }
        else if (error.code.includes('BACKEND')) {
            category = 'backend';
        }
        else if (error.code.includes('DATA')) {
            category = 'data';
        }
        else if (error.code.includes('OPTIMIZATION') ||
            error.code.includes('CACHE') ||
            error.code.includes('LATENCY')) {
            category = 'performance';
        }
        else {
            category = 'system';
        }
        return {
            category,
            priority: error.severity,
            actionRequired: error.severity === 'high' || error.severity === 'critical',
            suggestedActions: MemoryErrorClassifier.getSuggestedActions(category, error.message),
        };
    }
    static inferCategory(error) {
        const message = error.message.toLowerCase();
        if (message.includes('coordination') ||
            message.includes('consensus') ||
            message.includes('node')) {
            return 'coordination';
        }
        if (message.includes('backend') ||
            message.includes('connection') ||
            message.includes('database')) {
            return 'backend';
        }
        if (message.includes('data') ||
            message.includes('corruption') ||
            message.includes('not found')) {
            return 'data';
        }
        if (message.includes('performance') ||
            message.includes('slow') ||
            message.includes('cache')) {
            return 'performance';
        }
        return 'system';
    }
    static inferPriority(error) {
        const message = error.message.toLowerCase();
        if (message.includes('corruption') ||
            message.includes('critical') ||
            message.includes('fatal')) {
            return 'critical';
        }
        if (message.includes('failed') ||
            message.includes('error') ||
            message.includes('unreachable')) {
            return 'high';
        }
        if (message.includes('warning') ||
            message.includes('slow') ||
            message.includes('timeout')) {
            return 'medium';
        }
        return 'low';
    }
    static getSuggestedActions(category, message) {
        const actions = [];
        switch (category) {
            case 'coordination':
                actions.push('Check node connectivity');
                actions.push('Verify consensus configuration');
                if (message.includes('timeout')) {
                    actions.push('Increase consensus timeout');
                }
                break;
            case 'backend':
                actions.push('Check backend connectivity');
                actions.push('Verify backend configuration');
                if (message.includes('capacity')) {
                    actions.push('Scale backend storage');
                }
                break;
            case 'data':
                actions.push('Verify data integrity');
                if (message.includes('corruption')) {
                    actions.push('Run data repair');
                    actions.push('Check storage health');
                }
                break;
            case 'performance':
                actions.push('Monitor system resources');
                actions.push('Review optimization settings');
                if (message.includes('cache')) {
                    actions.push('Adjust cache configuration');
                }
                break;
            case 'system':
                actions.push('Check system resources');
                actions.push('Review system logs');
                actions.push('Verify configuration');
                break;
        }
        return actions;
    }
}
//# sourceMappingURL=memory-errors.js.map