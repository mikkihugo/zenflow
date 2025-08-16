/**
 * Database Domain REST API Controller.
 * Provides comprehensive REST endpoints for database management.
 *
 * @file Database-controller.ts.
 * @description Enhanced database controller with DI integration for Issue #63.
 */
import type { ConnectionStats, Logger } from '../../core/interfaces/base-interfaces';
import type { DatabaseConfig, DatabaseProviderFactory } from '../providers/database-providers';
/**
 * Request interface for database query operations.
 *
 * @example
 */
export interface QueryRequest {
    /** SQL query to execute */
    sql: string;
    /** Parameters for parameterized queries */
    params?: unknown[];
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
    params?: unknown[];
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
        params?: unknown[];
    }>;
    /** Whether to execute in a transaction */
    useTransaction?: boolean;
    /** Whether to continue on error */
    continueOnError?: boolean;
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
    data?: unknown;
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
 * Request interface for graph query operations.
 *
 * @example
 */
export interface GraphQueryRequest {
    /** Cypher query to execute */
    cypher: string;
    /** Parameters for parameterized queries */
    params?: unknown[];
    /** Additional query options */
    options?: {
        /** Query timeout in milliseconds */
        timeout?: number;
        /** Maximum number of nodes to return */
        maxNodes?: number;
        /** Maximum number of relationships to return */
        maxRelationships?: number;
        /** Whether to include execution plan */
        includeExecutionPlan?: boolean;
    };
}
/**
 * Request interface for graph batch operations.
 *
 * @example
 */
export interface GraphBatchRequest {
    /** Array of graph operations to execute */
    operations: Array<{
        /** Cypher query */
        cypher: string;
        /** Parameters */
        params?: unknown[];
    }>;
    /** Whether to continue on error */
    continueOnError?: boolean;
    /** Whether to include full data in response */
    includeData?: boolean;
}
/**
 * Request interface for vector search operations.
 *
 * @example
 */
export interface VectorSearchRequest {
    /** Query vector for similarity search */
    vector: number[];
    /** Maximum number of results to return */
    limit?: number;
    /** Filter criteria for metadata */
    filter?: Record<string, unknown>;
    /** Distance metric to use */
    metric?: 'cosine' | 'euclidean' | 'dot';
}
/**
 * Request interface for adding vectors.
 *
 * @example
 */
export interface VectorAddRequest {
    /** Vectors to add to the database */
    vectors: Array<{
        id: string | number;
        vector: number[];
        metadata?: Record<string, unknown>;
    }>;
    /** Table name to insert into */
    table?: string;
}
/**
 * Request interface for vector index creation.
 *
 * @example
 */
export interface VectorIndexRequest {
    /** Index name */
    name: string;
    /** Vector dimension */
    dimension: number;
    /** Distance metric */
    metric: 'cosine' | 'euclidean' | 'dot';
    /** Index type */
    type?: string;
}
/**
 * Database REST API Controller.
 * Provides comprehensive database management through REST endpoints.
 *
 * @example
 */
export declare class DatabaseController {
    private _factory;
    private _config;
    private _logger;
    private adapter;
    private performanceMetrics;
    constructor(_factory: DatabaseProviderFactory, _config: DatabaseConfig, _logger: Logger);
    /**
     * GET /api/database/status.
     * Get comprehensive database status and health information.
     */
    getDatabaseStatus(): Promise<DatabaseResponse>;
    /**
     * POST /api/database/query
     * Execute database SELECT queries with parameters.
     * Automatically detects and routes Cypher queries to graph adapter.
     *
     * @param request
     */
    executeQuery(request: QueryRequest): Promise<DatabaseResponse>;
    /**
     * POST /api/database/execute.
     * Execute database commands (INSERT, UPDATE, DELETE, DDL).
     *
     * @param request
     */
    executeCommand(request: CommandRequest): Promise<DatabaseResponse>;
    /**
     * POST /api/database/transaction.
     * Execute multiple commands within a transaction.
     *
     * @param request
     */
    executeTransaction(request: BatchRequest): Promise<DatabaseResponse>;
    /**
     * POST /api/database/batch.
     * Execute multiple operations (with optional transaction).
     *
     * @param request
     */
    executeBatch(request: BatchRequest): Promise<DatabaseResponse>;
    /**
     * GET /api/database/schema.
     * Get comprehensive database schema information.
     */
    getDatabaseSchema(): Promise<DatabaseResponse>;
    /**
     * POST /api/database/migrate.
     * Execute database migration operations.
     *
     * @param request
     */
    executeMigration(request: MigrationRequest): Promise<DatabaseResponse>;
    /**
     * GET /api/database/analytics.
     * Get comprehensive database analytics and performance metrics.
     */
    getDatabaseAnalytics(): Promise<DatabaseResponse>;
    /**
     * Initialize the database adapter.
     */
    private initializeAdapter;
    /**
     * Check if SQL statement is a query (SELECT).
     *
     * @param sql
     */
    private isQueryStatement;
    /**
     * Get statement type from SQL.
     *
     * @param sql
     */
    private getStatementType;
    /**
     * Get execution plan for a query (adapter-specific).
     *
     * @param sql
     */
    private getExecutionPlan;
    /**
     * Get database version.
     */
    private getDatabaseVersion;
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
    /**
     * POST /api/database/graph/query.
     * Execute graph-specific queries (Cypher-like syntax).
     *
     * @param request
     */
    executeGraphQuery(request: GraphQueryRequest): Promise<DatabaseResponse>;
    /**
     * GET /api/database/graph/schema.
     * Get graph-specific schema information (nodes, relationships, properties).
     */
    getGraphSchema(): Promise<DatabaseResponse>;
    /**
     * GET /api/database/graph/stats.
     * Get comprehensive graph analytics and statistics.
     */
    getGraphAnalytics(): Promise<DatabaseResponse>;
    /**
     * POST /api/database/graph/batch.
     * Execute batch graph operations.
     *
     * @param request
     */
    executeGraphBatch(request: GraphBatchRequest): Promise<DatabaseResponse>;
    /**
     * Check if current adapter supports graph operations.
     */
    private isGraphAdapter;
    /**
     * Check if SQL statement is a Cypher query.
     *
     * @param sql
     */
    private isCypherQuery;
    /**
     * Route query to graph adapter.
     *
     * @param request
     */
    private routeToGraphQuery;
    /**
     * Extract node types from schema (graph-specific).
     *
     * @param schema
     * @param _schema
     */
    private extractNodeTypes;
    /**
     * Extract relationship types from schema (graph-specific).
     *
     * @param schema
     * @param _schema
     */
    private extractRelationshipTypes;
    /**
     * POST /api/database/vector/search.
     * Perform vector similarity search.
     *
     * @param request
     */
    vectorSearch(request: VectorSearchRequest): Promise<DatabaseResponse>;
    /**
     * POST /api/database/vector/add.
     * Add vectors to the database.
     *
     * @param request
     */
    addVectors(request: VectorAddRequest): Promise<DatabaseResponse>;
    /**
     * GET /api/database/vector/stats.
     * Get vector database statistics.
     */
    getVectorStats(): Promise<DatabaseResponse>;
    /**
     * POST /api/database/vector/index.
     * Create or optimize vector index.
     *
     * @param request
     */
    createVectorIndex(request: VectorIndexRequest): Promise<DatabaseResponse>;
    /**
     * Check if adapter supports vector operations.
     *
     * @param adapter
     */
    private isVectorAdapter;
}
//# sourceMappingURL=database-controller.d.ts.map