/**
 * Real LanceDB Database Adapter
 *
 * Real LanceDB adapter using @lancedb/lancedb library for production vector storage
 */
import { Table } from '@lancedb/lancedb';
export interface LanceDBConfig {
    type: 'lancedb';
    database: string;
    options?: {
        vectorSize?: number;
        metricType?: 'cosine' | 'l2' | 'dot';
        createIfNotExists?: boolean;
        uri?: string;
    };
}
export interface VectorDocument extends Record<string, unknown> {
    id: string;
    vector: number[];
    text: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}
export interface VectorSearchOptions {
    limit?: number;
    threshold?: number;
    filter?: Record<string, unknown>;
    includeMetadata?: boolean;
}
export declare class LanceDBAdapter {
    private connection;
    private config;
    private connected;
    private tables;
    constructor(config: LanceDBConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    createTable(name: string, schema: VectorDocument[]): Promise<void>;
    getTable(name: string): Promise<Table>;
    insertVectors(tableName: string, documents: VectorDocument[]): Promise<void>;
    searchVectors(tableName: string, queryVector: number[], options?: VectorSearchOptions): Promise<Array<VectorDocument & {
        _distance?: number;
    }>>;
    updateVector(tableName: string, id: string, updates: Partial<VectorDocument>): Promise<void>;
    deleteVector(tableName: string, id: string): Promise<void>;
    countVectors(tableName: string): Promise<number>;
    listTables(): Promise<string[]>;
    query(sql: string, params?: unknown[]): Promise<unknown>;
    execute(sql: string, params?: unknown[]): Promise<unknown>;
    transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    getSchema(): Promise<unknown>;
    getConnectionStats(): Promise<unknown>;
    vectorSearch(queryVector: number[], options?: VectorSearchOptions): Promise<unknown>;
    createEmbeddingIndex(tableName: string, columnName?: string): Promise<void>;
    getTableInfo(tableName: string): Promise<unknown>;
}
//# sourceMappingURL=lancedb-adapter.d.ts.map