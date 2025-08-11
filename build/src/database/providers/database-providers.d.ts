/**
 * Database Domain Dependency Injection Providers.
 *
 * @file Implements comprehensive database adapter providers with dependency injection
 * patterns for multi-database support. This module provides concrete implementations for
 * PostgreSQL, SQLite, MySQL, Kuzu (graph), and LanceDB (vector) databases with unified.
 * interfaces, connection pooling, transaction management, and specialized operations.
 * @author Claude-Zen DAL Team
 * @version 2.0.0
 * @since 1.0.0
 * @example Basic Database Provider Usage
 * ```typescript
 * import { DatabaseProviderFactory, DatabaseConfig } from './database-providers.ts';
 *
 * const factory = new DatabaseProviderFactory(logger, config);
 *
 * const pgAdapter = factory.createAdapter({
 *   type: 'postgresql',
 *   host: 'localhost',
 *   database: 'production',
 *   pool: { min: 5, max: 50 }
 * });
 *
 * await pgAdapter.connect();
 * const result = await pgAdapter.query('SELECT * FROM users WHERE active = $1', [true]);
 * ```
 * @example Specialized Database Operations
 * ```typescript
 * // Graph database operations.
 * const graphAdapter = factory.createGraphAdapter({
 *   type: 'kuzu',
 *   database: './knowledge-graph.kuzu'
 * });
 *
 * const graphResult = await graphAdapter.queryGraph(
 *   'MATCH (p:Person)-[:KNOWS]->(friend) WHERE p.name = $name RETURN friend',
 *   { name: 'Alice' }
 * );
 *
 * // Vector database operations
 * const vectorAdapter = factory.createVectorAdapter({
 *   type: 'lancedb',
 *   database: './embeddings.lance',
 *   options: { vectorSize: 1536 }
 * });
 *
 * const similarVectors = await vectorAdapter.vectorSearch(queryEmbedding, 10);
 * ```
 */
import type { ConnectionStats, DatabaseAdapter, ExecuteResult, IConfig, ILogger, QueryResult, SchemaInfo, TransactionContext } from '../../core/interfaces/base-interfaces.ts';
import { type DatabaseResult } from '../../utils/type-guards.ts';
export { DatabaseAdapter } from '../../core/interfaces/base-interfaces.ts';
/**
 * Graph Database Query Result Interface.
 *
 * Represents the result of a graph database query, containing nodes, relationships,
 * and execution metadata. Used for Cypher queries and graph traversal operations.
 *
 * @interface GraphResult
 * @since 1.0.0
 * @example Graph Query Result Processing
 * ```typescript
 * const result: GraphResult = await graphAdapter.queryGraph(
 *   'MATCH (a:Person)-[r:KNOWS]->(b:Person) RETURN a, r, b LIMIT 10'
 * );
 *
 * console.log(`Found ${result.nodes.length} nodes and ${result.relationships.length} relationships`);
 * console.log(`Query executed in ${result.executionTime}ms`);
 *
 * // Process nodes
 * result.nodes.forEach(node => {
 *   console.log(`Node ${node.id}: labels=${node.labels.join(',')}, properties=`, node.properties);
 * });
 *
 * // Process relationships
 * result.relationships.forEach(rel => {
 *   console.log(`${rel.startNodeId} -[${rel.type}]-> ${rel.endNodeId}`);
 * });
 * ```
 */
export interface GraphResult {
    /** Graph nodes */
    nodes: Array<{
        id: any;
        labels: string[];
        properties: Record<string, any>;
    }>;
    /** Graph relationships */
    relationships: Array<{
        id: any;
        type: string;
        startNodeId: any;
        endNodeId: any;
        properties: Record<string, any>;
    }>;
    /** Query execution time */
    executionTime: number;
}
/**
 * Vector Database Search Result Interface.
 *
 * Represents the result of a vector similarity search, containing matching vectors.
 * With similarity scores and execution metadata. Used for embedding searches and
 * semantic similarity operations..
 *
 * @interface VectorResult
 * @since 1.0.0
 * @example Vector Search Result Processing
 * ```typescript
 * const queryEmbedding = [0.1, 0.2, 0.3, ...]; // 1536-dimensional vector
 * const result: VectorResult = await vectorAdapter.vectorSearch(queryEmbedding, 5);
 *
 * console.log(`Found ${result.matches.length} similar vectors in ${result.executionTime}ms`);
 *
 * // Process matches sorted by similarity score
 * result.matches.forEach((match, index) => {
 *   console.log(`Match ${index + 1}:`);
 *   console.log(`  ID: ${match.id}`);
 *   console.log(`  Similarity Score: ${match.score}`);
 *   console.log(`  Metadata:`, match.metadata);
 * });
 *
 * // Filter by minimum similarity threshold
 * const highQualityMatches = result.matches.filter(match => match.score > 0.8);
 * ```
 */
export interface VectorResult {
    /** Matching vectors with scores */
    matches: Array<{
        id: any;
        vector: number[];
        score: number;
        metadata?: Record<string, any>;
    }>;
    /** Query execution time */
    executionTime: number;
}
/**
 * Vector Data Interface for Vector Database Operations.
 *
 * Represents a vector document for insertion or update operations in vector databases.
 * Contains the vector embedding, unique identifier, and optional metadata for.
 * Filtering and retrieval..
 *
 * @interface VectorData
 * @since 1.0.0
 * @example Creating Vector Data for Documents
 * ```typescript
 * const documentVectors: VectorData[] = [
 *   {
 *     id: 'doc-001',
 *     vector: [0.1, 0.2, 0.3, ...], // Document embedding
 *     metadata: {
 *       title: 'Introduction to AI',
 *       author: 'John Doe',
 *       category: 'technology',
 *       publishedAt: '2024-01-15',
 *       wordCount: 2500
 *     }
 *   },
 *   {
 *     id: 'doc-002',
 *     vector: [0.4, 0.5, 0.6, ...], // Another document embedding
 *     metadata: {
 *       title: 'Machine Learning Basics',
 *       author: 'Jane Smith',
 *       category: 'education',
 *       publishedAt: '2024-01-20',
 *       wordCount: 3200
 *     }
 *   }
 * ];
 *
 * // Batch insert vectors
 * await vectorAdapter.addVectors(documentVectors);
 * ```
 * @example Vector Data for Image Features
 * ```typescript
 * const imageVector: VectorData = {
 *   id: 'img-12345',
 *   vector: resNetFeatures, // 2048-dimensional image features
 *   metadata: {
 *     filename: 'sunset.jpg',
 *     width: 1920,
 *     height: 1080,
 *     fileSize: 245760,
 *     tags: ['landscape', 'sunset', 'nature'],
 *     extractedAt: new Date().toISOString()
 *   }
 * };
 * ```
 */
export interface VectorData {
    /** Vector ID */
    id: any;
    /** Vector values */
    vector: number[];
    /** Optional metadata */
    metadata?: Record<string, any>;
}
/**
 * Vector Index Configuration Interface.
 *
 * Defines the configuration for creating vector indexes to optimize similarity search.
 * Performance. Different index types and distance metrics can be configured based
 * on the specific use case and data characteristics..
 *
 * @interface IndexConfig
 * @since 1.0.0
 * @example High-Performance HNSW Index
 * ```typescript
 * const hnnswIndex: IndexConfig = {
 *   name: 'document_embeddings_hnsw',
 *   dimension: 1536, // OpenAI ada-002 embedding size
 *   metric: 'cosine', // Cosine similarity for text embeddings
 *   type: 'HNSW', // Hierarchical Navigable Small World
 *   options: {
 *     M: 16, // Number of bi-directional links for each node
 *     efConstruction: 200, // Size of dynamic candidate list
 *     efSearch: 100 // Size of search candidate list
 *   }
 * };
 *
 * await vectorAdapter.createIndex(hnnswIndex);
 * ```
 * @example IVF-PQ Index for Large Datasets
 * ```typescript
 * const ivfIndex: IndexConfig = {
 *   name: 'large_corpus_ivf_pq',
 *   dimension: 768, // BERT embedding size
 *   metric: 'euclidean', // Euclidean distance
 *   type: 'IVF_PQ', // Inverted File with Product Quantization
 *   options: {
 *     nlist: 4096, // Number of clusters
 *     m: 64, // Number of subquantizers
 *     nprobe: 128 // Number of clusters to search
 *   }
 * };
 * ```
 */
export interface IndexConfig {
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
 * Graph Database Adapter Interface.
 *
 * Extends the base DatabaseAdapter with graph-specific operations for node and.
 * Relationship management, graph traversal queries, and network analysis.
 * Designed for Kuzu and other graph databases supporting Cypher-like query languages..
 *
 * @interface GraphDatabaseAdapter
 * @augments DatabaseAdapter
 * @since 1.0.0
 * @example Graph Database Operations
 * ```typescript
 * const graphAdapter: GraphDatabaseAdapter = factory.createGraphAdapter({
 *   type: 'kuzu',
 *   database: './social-network.kuzu'
 * });
 *
 * await graphAdapter.connect();
 *
 * // Execute Cypher query
 * const socialCircle = await graphAdapter.queryGraph(
 *   'MATCH (user:User {id: $userId})-[:FOLLOWS*1..2]->(connection:User) RETURN connection',
 *   { userId: 'user-123' }
 * );
 *
 * // Get graph statistics
 * const totalNodes = await graphAdapter.getNodeCount();
 * const totalRelationships = await graphAdapter.getRelationshipCount();
 *
 * console.log(`Graph contains ${totalNodes} nodes and ${totalRelationships} relationships`);
 * ```
 */
export interface GraphDatabaseAdapter extends DatabaseAdapter {
    /** Execute a graph query (e.g., Cypher) */
    queryGraph(cypher: string, params?: any[]): Promise<GraphResult>;
    /** Get total number of nodes in the graph */
    getNodeCount(): Promise<number>;
    /** Get total number of relationships in the graph */
    getRelationshipCount(): Promise<number>;
}
/**
 * Vector Database Adapter Interface.
 *
 * Extends the base DatabaseAdapter with vector-specific operations for similarity search,
 * embedding storage, and high-dimensional data management. Designed for LanceDB and other
 * vector databases optimized for machine learning workloads.
 *
 * @interface VectorDatabaseAdapter
 * @augments DatabaseAdapter
 * @since 1.0.0
 * @example Vector Database Operations
 * ```typescript
 * const vectorAdapter: VectorDatabaseAdapter = factory.createVectorAdapter({
 *   type: 'lancedb',
 *   database: './document-embeddings.lance',
 *   options: { vectorSize: 1536, metricType: 'cosine' }
 * });
 *
 * await vectorAdapter.connect();
 *
 * // Create optimized index for search performance
 * await vectorAdapter.createIndex({
 *   name: 'fast_similarity_index',
 *   dimension: 1536,
 *   metric: 'cosine',
 *   type: 'HNSW'
 * });
 *
 * // Add document embeddings
 * await vectorAdapter.addVectors([
 *   {
 *     id: 'doc-1',
 *     vector: openaiEmbedding1,
 *     metadata: { title: 'AI Paper', category: 'research' }
 *   },
 *   {
 *     id: 'doc-2',
 *     vector: openaiEmbedding2,
 *     metadata: { title: 'ML Tutorial', category: 'education' }
 *   }
 * ]);
 *
 * // Semantic search
 * const similar = await vectorAdapter.vectorSearch(queryEmbedding, 10);
 * ```
 */
export interface VectorDatabaseAdapter extends DatabaseAdapter {
    /** Perform vector similarity search */
    vectorSearch(query: number[], limit?: number): Promise<VectorResult>;
    /** Add vectors to the database */
    addVectors(vectors: VectorData[]): Promise<void>;
    /** Create a vector index */
    createIndex(config: IndexConfig): Promise<void>;
}
/**
 * Database Configuration Interface.
 *
 * Comprehensive configuration interface supporting all database types with connection.
 * Parameters, security settings, performance tuning, and adapter-specific options.
 * Used by the DatabaseProviderFactory to create properly configured database adapters..
 *
 * @interface DatabaseConfig
 * @since 1.0.0
 * @example PostgreSQL Production Configuration
 * ```typescript
 * const pgConfig: DatabaseConfig = {
 *   type: 'postgresql',
 *   host: 'prod-db.example.com',
 *   port: 5432,
 *   database: 'application_db',
 *   username: 'app_user',
 *   password: process.env['DB_PASSWORD'],
 *   pool: {
 *     min: 5,
 *     max: 50,
 *     timeout: 30000,
 *     idleTimeout: 600000
 *   },
 *   ssl: {
 *     enabled: true,
 *     rejectUnauthorized: true,
 *     ca: fs.readFileSync('./certs/ca-cert.pem', 'utf8'),
 *     cert: fs.readFileSync('./certs/client-cert.pem', 'utf8'),
 *     key: fs.readFileSync('./certs/client-key.pem', 'utf8')
 *   },
 *   options: {
 *     statement_timeout: 30000,
 *     query_timeout: 60000,
 *     application_name: 'claude-zen-app'
 *   }
 * };
 * ```
 * @example Vector Database Configuration
 * ```typescript
 * const lanceConfig: DatabaseConfig = {
 *   type: 'lancedb',
 *   database: '/data/vectors/embeddings.lance',
 *   options: {
 *     vectorSize: 1536,
 *     metricType: 'cosine',
 *     indexType: 'HNSW',
 *     batchSize: 1000,
 *     maxConnections: 10,
 *     indexOptions: {
 *       M: 16,
 *       efConstruction: 200
 *     }
 *   }
 * };
 * ```
 * @example Development SQLite Configuration
 * ```typescript
 * const devConfig: DatabaseConfig = {
 *   type: 'sqlite',
 *   database: ':memory:', // In-memory for testing
 *   options: {
 *     pragma: {
 *       journal_mode: 'WAL',
 *       synchronous: 'NORMAL',
 *       temp_store: 'MEMORY',
 *       mmap_size: 268435456 // 256MB
 *     }
 *   }
 * };
 * ```
 */
export interface DatabaseConfig {
    /** Type of database adapter to use */
    type: 'postgresql' | 'sqlite' | 'kuzu' | 'lancedb' | 'mysql';
    /** Connection string (if applicable) */
    connectionString?: string;
    /** Database host */
    host?: string;
    /** Database port */
    port?: number;
    /** Database name */
    database?: string;
    /** Username for authentication */
    username?: string;
    /** Password for authentication */
    password?: string;
    /** Connection pool configuration */
    pool?: {
        /** Minimum number of connections */
        min?: number;
        /** Maximum number of connections */
        max?: number;
        /** Connection timeout in milliseconds */
        timeout?: number;
        /** Idle timeout in milliseconds */
        idleTimeout?: number;
    };
    /** SSL configuration */
    ssl?: {
        /** Enable SSL */
        enabled?: boolean;
        /** Reject unauthorized certificates */
        rejectUnauthorized?: boolean;
        /** CA certificate */
        ca?: string;
        /** Client certificate */
        cert?: string;
        /** Client key */
        key?: string;
    };
    /** Additional adapter-specific options */
    options?: Record<string, any>;
}
/**
 * Database Provider Factory Class.
 *
 * Central factory for creating database adapter instances with dependency injection support.
 * Handles the creation and configuration of all supported database adapters including.
 * Relational (PostgreSQL, MySQL, SQLite), graph (Kuzu), and vector (LanceDB) databases..
 *
 * @class DatabaseProviderFactory
 * @injectable
 * @since 1.0.0
 * @example Factory Initialization and Usage
 * ```typescript
 * import { DatabaseProviderFactory } from './database-providers.ts';
 * import { DIContainer } from '../di/container/di-container';
 * import { CORE_TOKENS } from '../di/tokens/core-tokens';
 *
 * const container = new DIContainer();
 * container.register(CORE_TOKENS.Logger, () => logger);
 * container.register(CORE_TOKENS.Config, () => appConfig);
 *
 * const factory = container.resolve(DatabaseProviderFactory);
 *
 * // Create different database adapters
 * const pgAdapter = factory.createAdapter({
 *   type: 'postgresql',
 *   host: 'localhost',
 *   database: 'myapp'
 * });
 *
 * const vectorAdapter = factory.createVectorAdapter({
 *   type: 'lancedb',
 *   database: './embeddings.lance',
 *   options: { vectorSize: 1536 }
 * });
 * ```
 */
export declare class DatabaseProviderFactory {
    private logger;
    private config;
    constructor(logger: ILogger, config: IConfig);
    /**
     * Create Database Adapter Based on Configuration.
     *
     * Creates and returns the appropriate database adapter implementation based on the.
     * Provided configuration. Supports all database types with automatic driver selection
     * and connection parameter validation..
     *
     * @param {DatabaseConfig} config - Database configuration specifying type and connection parameters.
     * @returns {DatabaseAdapter} A configured database adapter instance.
     * @throws {Error} When unsupported database type is specified.
     * @throws {Error} When adapter creation fails due to invalid configuration.
     * @throws {Error} When required dependencies are missing.
     * @example Creating PostgreSQL Adapter
     * ```typescript
     * const pgAdapter = factory.createAdapter({
     *   type: 'postgresql',
     *   host: 'localhost',
     *   port: 5432,
     *   database: 'production',
     *   username: 'app_user',
     *   password: 'secure_password',
     *   pool: {
     *     min: 2,
     *     max: 20,
     *     timeout: 30000
     *   }
     * });
     *
     * await pgAdapter.connect();
     * const users = await pgAdapter.query('SELECT * FROM users WHERE active = $1', [true]);
     * ```
     * @example Creating SQLite Adapter for Development
     * ```typescript.
     * const devAdapter = factory.createAdapter({
     *   type: 'sqlite',
     *   database: './dev.db', // Or ':memory:' for in-memory
     *   options: {
     *     pragma: {
     *       journal_mode: 'WAL',
     *       synchronous: 'NORMAL'
     *     }
     *   }
     * });
     * ```
     * @example Creating Kuzu Graph Adapter
     * ```typescript
     * const graphAdapter = factory.createAdapter({
     *   type: 'kuzu',
     *   database: './knowledge-graph.kuzu',
     *   options: {
     *     bufferPoolSize: '2GB',
     *     maxNumThreads: 8
     *   }
     * });
     * ```
     */
    createAdapter(config: DatabaseConfig): DatabaseAdapter;
    /**
     * Create Specialized Graph Database Adapter.
     *
     * Creates a Kuzu graph database adapter with graph-specific optimizations and operations.
     * The adapter supports Cypher-like queries, graph traversal, and network analysis operations.
     *
     * @param {DatabaseConfig & { type: 'kuzu' }} config - Kuzu-specific database configuration.
     * @returns {GraphDatabaseAdapter} A configured graph database adapter with specialized operations.
     * @throws {Error} When Kuzu configuration is invalid.
     * @throws {Error} When graph database initialization fails.
     * @example Social Network Graph Adapter
     * ```typescript
     * const socialGraphAdapter = factory.createGraphAdapter({
     *   type: 'kuzu',
     *   database: './social-network.kuzu',
     *   options: {
     *     bufferPoolSize: '4GB', // Large buffer for complex queries
     *     maxNumThreads: 12,
     *     enableCompression: true,
     *     readOnly: false
     *   }
     * });
     *
     * await socialGraphAdapter.connect();
     *
     * // Graph-specific operations
     * const friendNetwork = await socialGraphAdapter.queryGraph(
     *   `MATCH (user:User {id: $userId})-[:FRIEND*1..3]->(friend:User)
     *    WHERE friend.active = true
     *    RETURN friend.name, friend.location
     *    ORDER BY friend.lastActivity DESC
     *    LIMIT 50`,
     *   { userId: 'user-12345' }
     * );
     *
     * // Get graph statistics
     * const nodeCount = await socialGraphAdapter.getNodeCount();
     * const relationshipCount = await socialGraphAdapter.getRelationshipCount();
     *
     * console.log(`Graph contains ${nodeCount} users and ${relationshipCount} relationships`);
     * ```
     * @example Knowledge Graph Adapter
     * ```typescript
     * const knowledgeAdapter = factory.createGraphAdapter({
     *   type: 'kuzu',
     *   database: './knowledge-base.kuzu',
     *   options: {
     *     bufferPoolSize: '8GB',
     *     enableInMemoryMode: true // For faster queries
     *   }
     * });
     *
     * // Complex knowledge queries
     * const relatedConcepts = await knowledgeAdapter.queryGraph(
     *   `MATCH (c:Concept {name: $concept})-[r:RELATED_TO|PART_OF|INSTANCE_OF*1..2]->(related:Concept)
     *    RETURN related.name, type(r) as relationship_type, r.weight as strength
     *    ORDER BY r.weight DESC`,
     *   { concept: 'artificial intelligence' }
     * );
     * ```
     */
    createGraphAdapter(config: DatabaseConfig & {
        type: 'kuzu';
    }): GraphDatabaseAdapter;
    /**
     * Create Specialized Vector Database Adapter.
     *
     * Creates a LanceDB vector database adapter optimized for high-dimensional vector operations,
     * similarity search, and machine learning workloads. Supports various distance metrics and
     * indexing strategies for optimal performance.
     *
     * @param {DatabaseConfig & { type: 'lancedb' }} config - LanceDB-specific database configuration.
     * @returns {VectorDatabaseAdapter} A configured vector database adapter with specialized operations.
     * @throws {Error} When LanceDB configuration is invalid.
     * @throws {Error} When vector database initialization fails.
     * @throws {Error} When vector dimensions are invalid.
     * @example Document Embedding Vector Adapter
     * ```typescript
     * const documentVectorAdapter = factory.createVectorAdapter({
     *   type: 'lancedb',
     *   database: './document-embeddings.lance',
     *   options: {
     *     vectorSize: 1536, // OpenAI ada-002 embedding dimension
     *     metricType: 'cosine', // Cosine similarity for text
     *     indexType: 'HNSW',
     *     batchSize: 1000,
     *     indexOptions: {
     *       M: 16, // HNSW parameter
     *       efConstruction: 200
     *     }
     *   }
     * });
     *
     * await documentVectorAdapter.connect();
     *
     * // Create optimized index for fast searches
     * await documentVectorAdapter.createIndex({
     *   name: 'document_similarity_index',
     *   dimension: 1536,
     *   metric: 'cosine',
     *   type: 'HNSW'
     * });
     *
     * // Batch add document embeddings
     * await documentVectorAdapter.addVectors([
     *   {
     *     id: 'doc-1',
     *     vector: openaiEmbedding1,
     *     metadata: {
     *       title: 'Introduction to Machine Learning',
     *       author: 'Jane Doe',
     *       publishedDate: '2024-01-15',
     *       category: 'education',
     *       wordCount: 2500
     *     }
     *   }
     *   // ... more documents
     * ]);
     *
     * // Semantic similarity search
     * const similar = await documentVectorAdapter.vectorSearch(
     *   userQueryEmbedding,
     *   10 // top 10 results
     * );
     * ```
     * @example Image Feature Vector Adapter
     * ```typescript
     * const imageVectorAdapter = factory.createVectorAdapter({
     *   type: 'lancedb',
     *   database: './image-features.lance',
     *   options: {
     *     vectorSize: 2048, // ResNet-50 feature dimension
     *     metricType: 'euclidean', // Euclidean distance for image features
     *     indexType: 'IVF_PQ',
     *     indexOptions: {
     *       nlist: 4096, // Number of clusters
     *       nprobe: 128  // Number of clusters to search
     *     }
     *   }
     * });
     *
     * // Find visually similar images
     * const similarImages = await imageVectorAdapter.vectorSearch(
     *   queryImageFeatures,
     *   5 // top 5 similar images
     * );
     * ```
     */
    createVectorAdapter(config: DatabaseConfig & {
        type: 'lancedb';
    }): VectorDatabaseAdapter;
}
/**
 * PostgreSQL database adapter implementation.
 *
 * @example
 */
export declare class PostgreSQLAdapter implements DatabaseAdapter {
    private config;
    private logger;
    private connected;
    private connectionStats;
    constructor(config: DatabaseConfig, logger: ILogger);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<QueryResult>;
    /**
     * Enhanced query method with union type return for safe property access.
     *
     * @param sql
     * @param params
     */
    queryWithResult<T = any>(sql: string, params?: any[]): Promise<DatabaseResult<T>>;
    execute(sql: string, params?: any[]): Promise<ExecuteResult>;
    transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    getSchema(): Promise<SchemaInfo>;
    getConnectionStats(): Promise<ConnectionStats>;
    private ensureConnected;
    private simulateAsync;
}
/**
 * SQLite database adapter implementation.
 *
 * @example
 */
export declare class SQLiteAdapter implements DatabaseAdapter {
    private config;
    private logger;
    private connected;
    private connectionStats;
    constructor(config: DatabaseConfig, logger: ILogger);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<QueryResult>;
    execute(sql: string, params?: any[]): Promise<ExecuteResult>;
    transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    getSchema(): Promise<SchemaInfo>;
    getConnectionStats(): Promise<ConnectionStats>;
    private ensureConnected;
    private simulateAsync;
}
/**
 * Kuzu graph database adapter implementation.
 *
 * @example
 */
export declare class KuzuAdapter implements GraphDatabaseAdapter {
    private config;
    private logger;
    private connected;
    private connectionStats;
    constructor(config: DatabaseConfig, logger: ILogger);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<QueryResult>;
    execute(sql: string, params?: any[]): Promise<ExecuteResult>;
    transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    queryGraph(cypher: string, params?: any[]): Promise<GraphResult>;
    getNodeCount(): Promise<number>;
    getRelationshipCount(): Promise<number>;
    getSchema(): Promise<SchemaInfo>;
    getConnectionStats(): Promise<ConnectionStats>;
    private ensureConnected;
    private simulateAsync;
}
/**
 * LanceDB vector database adapter implementation.
 *
 * @example
 */
export declare class LanceDBAdapter implements VectorDatabaseAdapter {
    private config;
    private logger;
    private connected;
    private vectorRepository?;
    private vectorDAO?;
    private connectionStats;
    constructor(config: DatabaseConfig, logger: ILogger);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<QueryResult>;
    execute(sql: string, params?: any[]): Promise<ExecuteResult>;
    transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    vectorSearch(query: number[], limit?: number): Promise<VectorResult>;
    addVectors(vectors: VectorData[]): Promise<void>;
    createIndex(config: IndexConfig): Promise<void>;
    getSchema(): Promise<SchemaInfo>;
    getConnectionStats(): Promise<ConnectionStats>;
    private ensureConnected;
}
/**
 * MySQL database adapter implementation.
 *
 * @example
 */
export declare class MySQLAdapter implements DatabaseAdapter {
    private config;
    private logger;
    private connected;
    private connectionStats;
    constructor(config: DatabaseConfig, logger: ILogger);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<QueryResult>;
    execute(sql: string, params?: any[]): Promise<ExecuteResult>;
    transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    getSchema(): Promise<SchemaInfo>;
    getConnectionStats(): Promise<ConnectionStats>;
    private ensureConnected;
    private simulateAsync;
}
//# sourceMappingURL=database-providers.d.ts.map