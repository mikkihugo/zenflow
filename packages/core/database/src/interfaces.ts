/**
 * Generic Database Interfaces
 *
 * Storage abstraction interfaces for KV, SQL, vector, graph, and hybrid paradigms.
 * All storage types are persistent and abstract underlying database technologies.
 */

// Storage paradigm types
export type StorageType =
 | 'keyValue'
 | ' sql'
 | ' vector'
 | ' graph'
 | ' hybrid';

// Database backend types
export type DatabaseType = 'sqlite' | ' lancedb' | ' kuzu' | ' memory';

// Query parameters
export type QueryParams = unknown[] | Record<string, unknown>;

// Storage configuration
export interface StorageConfig {
 type: StorageType;
 backend: DatabaseType;
 database: string; // App name/identifier, not file path
 options?: Record<string, unknown>;
}

// Path management for organized storage
export interface DatabasePaths {
 sqlite: string;
 lancedb: string;
 kuzu: string;
 memory: string;
}

// Health status
export interface HealthStatus {
 healthy: boolean;
 isHealthy: boolean;
 status: string;
 score: number;
 details: Record<string, unknown>;
 lastCheck: Date;
 errors?: string[];
}

// Query result
export interface QueryResult<T = unknown> {
 rows: T[];
 rowCount: number;
 fields?: unknown[];
}

// Database connection interface (used internally by storage implementations)
export interface DatabaseConnection {
 connect(): Promise<void>;
 disconnect(): Promise<void>;
 query<T = unknown>(
 sql: string,
 params?: QueryParams
 ): Promise<QueryResult<T>>;
 execute(sql: string, params?: unknown[]): Promise<unknown>;
 transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
 isConnected(): boolean;
 health(): Promise<HealthStatus>;
 getSchema(): Promise<unknown>;
 getConnectionStats(): Promise<unknown>;
}

// Storage abstraction interfaces

// Key-Value Storage Interface
export interface KeyValueStorage {
 get(key: string): Promise<unknown>;
 set(key: string, value: unknown): Promise<void>;
 delete(key: string): Promise<boolean>;
 has(key: string): Promise<boolean>;
 keys(pattern?: string): Promise<string[]>;
 clear(): Promise<void>;
 size(): Promise<number>;
}

// SQL Storage Interface
export interface SqlStorage {
 query<T = unknown>(
 sql: string,
 params?: QueryParams
 ): Promise<QueryResult<T>>;
 execute(sql: string, params?: unknown[]): Promise<unknown>;
 transaction<T>(fn: (tx: SqlStorage) => Promise<T>): Promise<T>;
 createTable(tableName: string, schema: Record<string, string>): Promise<void>;
 dropTable(tableName: string): Promise<void>;
}

// Vector Storage Interface
export interface VectorStorage {
 insert(
 id: string,
 vector: number[],
 metadata?: Record<string, unknown>
 ): Promise<void>;
 search(
 vector: number[],
 limit?: number,
 threshold?: number
 ): Promise<VectorResult[]>;
 delete(id: string): Promise<boolean>;
 update(
 id: string,
 vector?: number[],
 metadata?: Record<string, unknown>
 ): Promise<void>;
 get(id: string): Promise<VectorResult | null>;
}

export interface VectorResult {
 id: string;
 vector: number[];
 metadata?: Record<string, unknown>;
 similarity?: number;
}

// Graph Storage Interface
export interface GraphStorage {
 addNode(id: string, properties?: Record<string, unknown>): Promise<void>;
 addEdge(
 from: string,
 to: string,
 type?: string,
 properties?: Record<string, unknown>
 ): Promise<void>;
 getNode(id: string): Promise<GraphNode | null>;
 getEdges(
 nodeId: string,
 direction?: 'in' | 'out' | 'both'
 ): Promise<GraphEdge[]>;
 query(cypher: string, params?: Record<string, unknown>): Promise<GraphResult>;
 deleteNode(id: string): Promise<boolean>;
 deleteEdge(from: string, to: string, type?: string): Promise<boolean>;
}

export interface GraphNode {
 id: string;
 properties?: Record<string, unknown>;
}

export interface GraphEdge {
 from: string;
 to: string;
 type?: string;
 properties?: Record<string, unknown>;
}

export interface GraphResult {
 nodes: GraphNode[];
 edges: GraphEdge[];
}

// Hybrid Storage Interface (combines multiple paradigms)
export interface HybridStorage {
 keyValue: KeyValueStorage;
 sql: SqlStorage;
 vector: VectorStorage;
 graph: GraphStorage;

 // Unified operations across paradigms
 store(type: StorageType, data: unknown): Promise<void>;
 retrieve(type: StorageType, query: unknown): Promise<unknown>;
 search(query: HybridQuery): Promise<HybridResult>;
}

export interface HybridQuery {
 keyValue?: { keys: string[] };
 sql?: { query: string; params?: QueryParams };
 vector?: { vector: number[]; limit?: number };
 graph?: { cypher: string; params?: Record<string, unknown> };
}

export interface HybridResult {
 keyValue?: Record<string, unknown>;
 sql?: QueryResult;
 vector?: VectorResult[];
 graph?: GraphResult;
}

// Storage factory
export interface StorageFactory {
 createKeyValue(config: StorageConfig): KeyValueStorage;
 createSql(config: StorageConfig): SqlStorage;
 createVector(config: StorageConfig): VectorStorage;
 createGraph(config: StorageConfig): GraphStorage;
 createHybrid(config: StorageConfig): HybridStorage;
}
