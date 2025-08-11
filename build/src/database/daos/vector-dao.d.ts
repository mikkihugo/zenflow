/**
 * @file Database layer: vector-dao.
 */
import { BaseDao } from '../base.dao.ts';
interface VectorDocument<T> {
    id: string | number;
    vector: number[];
    document?: T;
}
interface VectorSearchResult<T> {
    id: string | number;
    score: number;
    document?: T;
    vector?: number[];
}
interface VectorRepository {
    cluster(options: any): Promise<any>;
    similaritySearch<T>(vector: number[], options: any): Promise<VectorSearchResult<T>[]>;
    addVectors(vectors: VectorDocument<any>[]): Promise<{
        inserted: number;
        errors: Array<{
            id: string | number;
            error: string;
        }>;
    }>;
    updateVector(id: string | number, vector: number[]): Promise<void>;
    getVectorStats(): Promise<{
        totalVectors: number;
        dimensions: number;
        indexType: string;
        memoryUsage: number;
    }>;
}
/**
 * Vector Database Access Object.
 * Handles vector operations, similarity search, clustering, and analytics.
 *
 * @example
 */
export declare class VectorDao<T = any> extends BaseDao<T> {
    private tableName;
    protected mapRowToEntity(row: any): T;
    protected mapEntityToRow(entity: Partial<T>): Record<string, any>;
    private vectorRepository;
    constructor(repository: any, vectorRepository: VectorRepository, logger: ILogger);
    /**
     * Vector analytics and insights.
     *
     * @param analysisType
     * @param parameters
     */
    vectorAnalytics(analysisType: string, parameters?: Record<string, any>): Promise<any>;
    /**
     * Bulk vector operations with optimization.
     *
     * @param vectors
     * @param operation
     * @param batchSize
     */
    bulkVectorOperations(vectors: VectorDocument<T>[], operation: 'insert' | 'update' | 'upsert', batchSize?: number): Promise<{
        successful: number;
        failed: number;
        errors: Array<{
            id: string | number;
            error: string;
        }>;
    }>;
    /**
     * Vector recommendation system.
     *
     * @param baseVectors
     * @param options
     * @param options.excludeIds
     * @param options.limit
     * @param options.diversityFactor
     * @param options.minSimilarity
     */
    recommend(baseVectors: number[][], options?: {
        excludeIds?: Array<string | number>;
        limit?: number;
        diversityFactor?: number;
        minSimilarity?: number;
    }): Promise<VectorSearchResult<T>[]>;
    /**
     * Get database-specific metadata with vector information.
     */
    protected getDatabaseType(): 'relational' | 'graph' | 'vector' | 'memory' | 'coordination';
    protected getSupportedFeatures(): string[];
    protected getConfiguration(): Record<string, any>;
    /**
     * Enhanced performance metrics for vector databases.
     */
    protected getCustomMetrics(): Record<string, any> | undefined;
    /**
     * Private helper methods.
     */
    private extractVectorFromEntity;
    private textToVector;
    private combineSearchResults;
    private detectOutliers;
    private analyzeSimilarityDistribution;
    private analyzeVectorQuality;
    private analyzeDimensions;
    private calculateCentroid;
    private applyDiversity;
    private euclideanDistance;
    private cosineSimilarity;
    private simpleHash;
    private chunk;
}
/**
 * @deprecated Use VectorDao from '../dao/vector.dao.ts';.
 * This shim will be removed after migration period.
 */
export { VectorDao as VectorDAO };
//# sourceMappingURL=vector-dao.d.ts.map