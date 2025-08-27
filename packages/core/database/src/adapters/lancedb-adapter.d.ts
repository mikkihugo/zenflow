/**
 * LanceDB Vector Database Adapter
 *
 * Real implementation for LanceDB vector database with proper vector operations,
 * connection management, and comprehensive error handling for enterprise applications.
 */
import { type ConnectionStats, type DatabaseConfig, type DatabaseConnection, type HealthStatus, type Migration, type MigrationResult, type QueryParams, type QueryResult, type SchemaInfo, type TransactionConnection, type TransactionContext, type VectorResult, type VectorSearchOptions } from '../types/index.js';
export declare class LanceDBAdapter implements DatabaseConnection {
    private config;
    private lancedbModule;
    private database;
    private isConnectedState;
    private readonly stats;
    constructor(config: DatabaseConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    query<T = unknown>(sql: string, params?: QueryParams, options?: {
        correlationId?: string;
        timeoutMs?: number;
    }): Promise<QueryResult<T>>;
    execute(sql: string, params?: QueryParams, options?: {
        correlationId?: string;
        timeoutMs?: number;
    }): Promise<QueryResult>;
    transaction<T>(fn: (tx: TransactionConnection) => Promise<T>, context?: TransactionContext): Promise<T>;
    health(): Promise<HealthStatus>;
    getStats(): Promise<ConnectionStats>;
    getSchema(): Promise<SchemaInfo>;
    migrate(migrations: readonly Migration[]): Promise<readonly MigrationResult[]>;
    getCurrentMigrationVersion(): Promise<string | null>;
    explain(sql: string): Promise<QueryResult>;
    vacuum(): Promise<void>;
    analyze(): Promise<void>;
    /**
     * Create or get a table with proper schema and embedding support
     */
    createTableWithEmbedding(tableName: string, schema: {
        columns: Record<string, string>;
        vectorColumn?: string;
        dimensions?: number;
    }, embeddingFunction?: {
        model: string;
        apiKey?: string;
    }): Promise<void>;
    /**
     * Add vectors with automatic batching for better performance
     */
    addVectorsBatch(tableName: string, vectors: Array<{
        id: string;
        vector: readonly number[];
        metadata?: Record<string, unknown>;
    }>, batchSize?: number): Promise<void>;
    /**
     * Advanced vector search with multiple distance metrics and filtering
     */
    advancedVectorSearch<T = unknown>(tableName: string, queryVector: readonly number[], options?: {
        limit?: number;
        distanceType?: 'l2' | 'cosine' | 'dot';
        filter?: string;
        select?: string[];
        threshold?: number;
        includeDistance?: boolean;
    }): Promise<QueryResult<T>>;
    /**
     * Create vector index for improved search performance
     */
    createVectorIndex(tableName: string, options?: {
        column?: string;
        indexType?: 'IVF_PQ' | 'HNSW';
        metric?: 'L2' | 'cosine' | 'dot';
        numPartitions?: number;
        numSubVectors?: number;
    }): Promise<void>;
    /**
     * Hybrid search combining vector similarity and full-text search
     */
    hybridSearch<T = unknown>(tableName: string, query: {
        vector?: readonly number[];
        text?: string;
        textColumn?: string;
    }, options?: {
        vectorWeight?: number;
        textWeight?: number;
        limit?: number;
        filter?: string;
    }): Promise<QueryResult<T>>;
    /**
     * Get table statistics and schema information
     */
    getTableSchema(tableName: string): Promise<{
        name: string;
        schema: Record<string, string>;
        rowCount: number;
        vectorColumns: string[];
        hasIndex: boolean;
    }>;
    vectorSearch(tableName: string, vector: readonly number[], options?: VectorSearchOptions): Promise<readonly VectorResult[]>;
    insertVectors(tableName: string, vectors: Array<{
        id: string;
        vector: readonly number[];
        metadata?: Record<string, unknown>;
    }>): Promise<void>;
    private testConnection;
    private parseLanceDBQuery;
    private executeWithRetry;
    private updateAverageQueryTime;
    private getDatabaseVersion;
    private getLastMigrationVersion;
    private createMigrationsTable;
    private recordMigration;
    private ensureDatabaseDirectory;
    private generateCorrelationId;
    private sleep;
}
//# sourceMappingURL=lancedb-adapter.d.ts.map