/**
 * Database Types
 *
 * Comprehensive TypeScript types for multi-database abstractions with full type safety.
 * Designed for enterprise-grade applications with proper error handling and performance monitoring.
 */
// Transaction Isolation Levels
export var IsolationLevel;
(function (IsolationLevel) {
    IsolationLevel["ReadUncommitted"] = "READ_UNCOMMITTED";
    IsolationLevel["ReadCommitted"] = "READ_COMMITTED";
    IsolationLevel["RepeatableRead"] = "REPEATABLE_READ";
    IsolationLevel["Serializable"] = "SERIALIZABLE";
})(IsolationLevel || (IsolationLevel = {}));
export class DatabaseError extends Error {
    code;
    correlationId;
    query;
    params;
    cause;
    constructor(message, options) {
        super(message);
        this.name = 'DatabaseError';
        this.code = options.code;
        this.correlationId = options.correlationId;
        this.query = options.query;
        this.params = options.params;
        this.cause = options.cause;
    }
}
export class ConnectionError extends DatabaseError {
    constructor(message, correlationId, cause) {
        const options = { code: 'CONNECTION_ERROR' };
        if (correlationId !== undefined)
            options.correlationId = correlationId;
        if (cause !== undefined)
            options.cause = cause;
        super(message, options);
        this.name = 'ConnectionError';
    }
}
export class QueryError extends DatabaseError {
    constructor(message, options = {}) {
        const dbOptions = { code: 'QUERY_ERROR' };
        if (options.correlationId !== undefined)
            dbOptions.correlationId = options.correlationId;
        if (options.query !== undefined)
            dbOptions.query = options.query;
        if (options.params !== undefined)
            dbOptions.params = options.params;
        if (options.cause !== undefined)
            dbOptions.cause = options.cause;
        super(message, dbOptions);
        this.name = 'QueryError';
    }
}
export class TransactionError extends DatabaseError {
    constructor(message, correlationId, cause) {
        const options = { code: 'TRANSACTION_ERROR' };
        if (correlationId !== undefined)
            options.correlationId = correlationId;
        if (cause !== undefined)
            options.cause = cause;
        super(message, options);
        this.name = 'TransactionError';
    }
}
