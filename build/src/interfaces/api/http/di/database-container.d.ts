/**
 * Request interface for database query operations.
 *
 * @example
 */
export interface QueryRequest {
    /** SQL query to execute */
    sql: string;
    /** Parameters for parameterized queries */
    params?: any[];
    /** Additional query options */
    options?: {
        /** Query timeout in milliseconds */
        timeout?: number;
        /** Maximum number of rows to return */
        maxRows?: number;
        /** Whether to include execution plan */
        includeExecutionPlan?: boolean;
        /** Query optimization hints */
        hints?: string[];
    };
}
/**
 * Request interface for database command operations.
 *
 * @example
 */
export interface CommandRequest {
    /** SQL command to execute */
    sql: string;
    /** Parameters for parameterized commands */
    params?: any[];
    /** Additional command options */
    options?: {
        /** Command timeout in milliseconds */
        timeout?: number;
        /** Whether to return detailed execution info */
        detailed?: boolean;
        /** Whether to use prepared statements */
        prepared?: boolean;
    };
}
/**
 * Request interface for batch operations.
 *
 * @example
 */
export interface BatchRequest {
    /** Array of operations to execute */
    operations: Array<{
        /** Type of operation */
        type: 'query' | 'execute';
        /** SQL statement */
        sql: string;
        /** Parameters */
        params?: any[];
    }>;
    /** Whether to execute in a transaction */
    useTransaction?: boolean;
    /** Whether to continue on error */
    continueOnError?: boolean;
}
/**
 * Migration operation interface.
 *
 * @example
 */
export interface MigrationRequest {
    /** Migration SQL statements */
    statements: string[];
    /** Migration version/name */
    version: string;
    /** Description of the migration */
    description?: string;
    /** Whether to run in dry-run mode */
    dryRun?: boolean;
}
/**
 * Response interface for database operations.
 *
 * @example
 */
export interface DatabaseResponse {
    /** Whether the operation was successful */
    success: boolean;
    /** Response data (varies by operation) */
    data?: any;
    /** Error message if operation failed */
    error?: string;
    /** Operation metadata and statistics */
    metadata?: {
        /** Number of rows affected/returned */
        rowCount: number;
        /** Execution time in milliseconds */
        executionTime: number;
        /** Timestamp of the operation */
        timestamp: number;
        /** Database adapter type */
        adapter?: string;
        /** Connection statistics */
        connectionStats?: ConnectionStats;
    };
}
/**
 * Database health status interface.
 *
 * @example
 */
export interface DatabaseHealthStatus {
    /** Overall health status */
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    /** Database adapter type */
    adapter: string;
    /** Connection status */
    connected: boolean;
    /** Response time for health check */
    responseTime: number;
    /** Connection pool statistics */
    connectionStats: ConnectionStats;
    /** Database version */
    version?: string;
    /** Last successful operation timestamp */
    lastSuccess: number;
    /** Error details if unhealthy */
    errorDetails?: string;
}
/**
 * Mock database configuration.
 *
 * @example
 */
interface DatabaseConfig {
    type: 'sqlite' | 'postgresql' | 'mysql' | 'lancedb' | 'kuzu';
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: {
        enabled: boolean;
        ca?: string;
        cert?: string;
        key?: string;
    };
    pool?: {
        min: number;
        max: number;
        idle: number;
    };
}
/**
 * Connection statistics interface.
 *
 * @example
 */
interface ConnectionStats {
    active: number;
    idle: number;
    max: number;
    failed: number;
}
/**
 * Simplified Database Controller without DI decorators.
 * Provides the same interface as the full DatabaseController.
 *
 * @example
 */
declare class SimplifiedDatabaseController {
    private adapter;
    private logger;
    private config;
    private performanceMetrics;
    constructor();
    /**
     * Same interface as DatabaseController methods.
     */
    getDatabaseStatus(): Promise<any>;
    executeQuery(request: any): Promise<any>;
    executeCommand(request: any): Promise<any>;
    executeTransaction(request: any): Promise<any>;
    getDatabaseSchema(): Promise<any>;
    executeMigration(request: any): Promise<any>;
    getDatabaseAnalytics(): Promise<any>;
    /**
     * Check if SQL statement is a query (SELECT).
     *
     * @param sql.
     * @param sql
     */
    private isQueryStatement;
    /**
     * Update performance metrics.
     *
     * @param responseTime
     * @param success
     */
    private updateMetrics;
    /**
     * Calculate operations per second.
     */
    private calculateOperationsPerSecond;
}
/**
 * Get database controller instance.
 *
 * @example
 */
export declare function getDatabaseController(): SimplifiedDatabaseController;
/**
 * Reset database controller (useful for testing).
 *
 * @example
 */
export declare function resetDatabaseContainer(): void;
/**
 * Health check for database container.
 *
 * @example
 */
export declare function checkDatabaseContainerHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: {
        logger: boolean;
        config: boolean;
        factory: boolean;
        controller: boolean;
    };
    errors: string[];
}>;
export type { DatabaseConfig, ConnectionStats };
//# sourceMappingURL=database-container.d.ts.map