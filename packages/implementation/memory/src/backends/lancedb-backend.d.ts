/**
 * LanceDB Vector Database Backend - Production Implementation
 *
 * High-performance vector database backend for AI/ML embeddings and similarity search.
 * Integrates with claude-zen foundation system for logging, error handling, and configuration.
 */
/**
 * Configuration for LanceDB vector store
 */
export interface VectorStoreConfig {
    path: string;
    vectorDimension: number;
    indexType?: 'IVF_PQ' | 'HNSW' | 'IVF_FLAT';
    numPartitions?: number;
    maxConnections?: number;
    enableCompression?: boolean;
    metricType?: 'cosine' | 'euclidean' | 'manhattan';
}
/**
 * Data structure for vector insertion
 */
export interface VectorInsertData {
    id?: string;
    vector: number[];
    metadata: Record<string, unknown>;
    timestamp?: number;
}
/**
 * Result of vector insertion operation
 */
export interface VectorInsertResult {
    success: boolean;
    id?: string;
    insertedCount?: number;
    failedCount?: number;
    processedAt?: string;
    vectorSize?: number;
    errors?: string[];
}
/**
 * Options for vector similarity search
 */
export interface VectorSearchOptions {
    vector: number[];
    k: number;
    threshold?: number;
    filter?: Record<string, unknown>;
    exact?: boolean;
    approximationFactor?: number;
    includeMetadata?: boolean;
}
/**
 * Result of vector similarity search
 */
export interface VectorSearchResult {
    id: string;
    similarity: number;
    metadata: Record<string, unknown>;
    vector?: number[];
}
/**
 * Production-grade LanceDB vector store implementation
 *
 * Features:
 * - High-performance vector operations
 * - Multiple index types (IVF, HNSW)
 * - Similarity search with filtering
 * - Batch operations for performance
 * - Comprehensive error handling
 * - Foundation integration for logging and monitoring
 */
export declare class VectorStore extends TypedEventBase {
    private readonly logger;
    private readonly config;
    private isInitialized;
    private connectionPool;
    private indexCache;
    constructor(config: VectorStoreConfig);
    private validateConfig;
    /**
     * Initialize the vector store with index creation
     */
    initialize(): Promise<void>;
    private createConnectionPool;
    private initializeIndexes;
    private setupMonitoring;
    /**
     * Insert a single vector with metadata
     */
    insert(data: VectorInsertData): Promise<VectorInsertResult>;
    /**
     * Insert multiple vectors in batch for performance
     */
    batchInsert(dataArray: VectorInsertData[]): Promise<VectorInsertResult>;
    /**
     * Perform similarity search for vectors
     */
    similaritySearch(options: VectorSearchOptions): Promise<VectorSearchResult[]>;
    /**
     * Range-based search within a distance radius
     */
    rangeSearch(options: {
        vector: number[];
        radius: number;
        maxResults: number;
    }): Promise<VectorSearchResult[]>;
    /**
     * Get vector by ID
     */
    getById(id: string): Promise<VectorSearchResult | null>;
    /**
     * Update existing vector
     */
    update(id: string, data: VectorInsertData): Promise<VectorInsertResult>;
    /**
     * Build or rebuild indexes for performance optimization
     */
    buildIndexes(config?: Partial<VectorStoreConfig>): Promise<void>;
    /**
     * Analyze data distribution for optimization
     */
    analyzeDataDistribution(): Promise<{
        clusters: number;
        averageIntraClusterDistance: number;
        averageInterClusterDistance: number;
        recommendations: string[];
    }>;
    /**
     * Optimize indexes based on usage patterns
     */
    optimizeIndex(config?: {
        dataDistribution?: {
            clusters: number;
        };
        performanceTarget?: 'speed' | 'memory' | 'balanced';
    }): Promise<{
        parameters: Record<string, unknown>;
        estimatedSearchTime: number;
        estimatedMemoryUsage: number;
    }>;
    /**
     * Get storage information and statistics
     */
    getStorageInfo(): Promise<{
        size: number;
        indexSize: number;
        vectorCount: number;
        compressionRatio?: number;
    }>;
    /**
     * Compress vectors to reduce storage
     */
    compressVectors(config?: {
        compressionType?: 'pq' | 'sq' | 'none';
        qualityTarget?: number;
    }): Promise<{
        accuracyRetention: number;
        compressionRatio: number;
        spaceSaved: number;
    }>;
    /**
     * Close the vector store and clean up resources
     */
    close(): Promise<void>;
    /**
     * Health check for monitoring
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
}
export type { VectorStoreConfig, VectorInsertData, VectorInsertResult, VectorSearchOptions, VectorSearchResult, };
//# sourceMappingURL=lancedb-backend.d.ts.map