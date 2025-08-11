/**
 * Vector Database Repository Implementation (LanceDB).
 *
 * Specialized repository for vector database operations including.
 * Similarity search, vector insertion, indexing, and clustering.
 */
/**
 * @file Database layer: vector.dao.
 */
import { BaseDao } from '../base.dao.ts';
import type { ClusteringOptions, ClusterResult, CustomQuery, IVectorRepository, VectorDocument, VectorIndexConfig, VectorInsertResult, VectorSearchOptions, VectorSearchResult, VectorStats } from '../interfaces.ts';
/**
 * Vector database repository implementation for LanceDB.
 *
 * @template T The entity type this repository manages.
 * @example
 */
export declare class VectorDao<T> extends BaseDao<T> implements IVectorRepository<T> {
    private get vectorAdapter();
    /**
     * Perform vector similarity search.
     *
     * @param queryVector
     * @param options
     */
    similaritySearch(queryVector: number[], options?: VectorSearchOptions): Promise<VectorSearchResult<T>[]>;
    /**
     * Add vectors in batch.
     *
     * @param vectors
     */
    addVectors(vectors: VectorDocument<T>[]): Promise<VectorInsertResult>;
    /**
     * Create vector index.
     *
     * @param config
     */
    createIndex(config: VectorIndexConfig): Promise<void>;
    /**
     * Get vector statistics.
     */
    getVectorStats(): Promise<VectorStats>;
    /**
     * Perform clustering operation.
     *
     * @param options
     */
    cluster(options?: ClusteringOptions): Promise<ClusterResult>;
    /**
     * Enhanced vector-specific operations.
     */
    /**
     * Find similar entities to a given entity.
     *
     * @param entityId
     * @param options
     */
    findSimilarToEntity(entityId: string | number, options?: VectorSearchOptions): Promise<VectorSearchResult<T>[]>;
    /**
     * Update vector for existing entity.
     *
     * @param entityId
     * @param newVector
     */
    updateVector(entityId: string | number, newVector: number[]): Promise<T>;
    /**
     * Batch similarity search with multiple query vectors.
     *
     * @param queryVectors
     * @param options
     */
    batchSimilaritySearch(queryVectors: number[][], options?: VectorSearchOptions): Promise<VectorSearchResult<T>[][]>;
    /**
     * Override base repository methods for vector-specific implementations.
     */
    protected mapRowToEntity(row: any): T;
    protected mapEntityToRow(entity: Partial<T>): Record<string, any>;
    /**
     * Execute custom query - override to handle vector-specific queries.
     *
     * @param customQuery
     */
    executeCustomQuery<R = any>(customQuery: CustomQuery): Promise<R>;
    /**
     * Helper methods.
     */
    private validateVector;
    private getVectorDimension;
    private mapVectorDocumentToEntity;
    private extractVectorFromEntity;
    private performSimpleClustering;
}
//# sourceMappingURL=vector.dao.d.ts.map