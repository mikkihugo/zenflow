/**
 * @fileoverview Database Domain Types - Single Source of Truth
 *
 * All database-related types, interfaces, and type definitions.
 * Following Google TypeScript style guide and domain architecture standard.
 */
// Error types
export class DatabaseError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'DatabaseError';
    }
}
export class MigrationError extends DatabaseError {
    migrationVersion;
    constructor(message, migrationVersion) {
        super(message, 'MIGRATION_ERROR');
        this.migrationVersion = migrationVersion;
        this.name = 'MigrationError';
    }
}
export class ConnectionError extends DatabaseError {
    connectionConfig;
    constructor(message, connectionConfig) {
        super(message, 'CONNECTION_ERROR');
        this.connectionConfig = connectionConfig;
        this.name = 'ConnectionError';
    }
}
export class QueryError extends DatabaseError {
    query;
    parameters;
    constructor(message, query, parameters) {
        super(message, 'QUERY_ERROR');
        this.query = query;
        this.parameters = parameters;
        this.name = 'QueryError';
    }
}
