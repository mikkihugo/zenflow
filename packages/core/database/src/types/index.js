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
        super(message, {
            code: 'CONNECTION_ERROR', correlationId,
            cause,
        });
        this.name = 'ConnectionError';
    }
}
export class QueryError extends DatabaseError {
    constructor(message, options = {}) {
        super(message, {
            code: 'QUERY_ERROR', correlationId: options.correlationId,
            query: options.query,
            params: options.params,
            cause: options.cause,
        });
        this.name = 'QueryError';
    }
}
export class TransactionError extends DatabaseError {
    constructor(message, correlationId, cause) {
        super(message, {
            code: 'TRANSACTION_ERROR', correlationId,
            cause,
        });
        this.name = 'TransactionError';
    }
}
