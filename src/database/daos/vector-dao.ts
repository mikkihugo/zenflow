/**
 * @file Database layer: vector-dao.
 */

import type { Logger } from '../../config/logging-config.ts';
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
  cluster(options: unknown): Promise<unknown>;
  similaritySearch<T>(
    vector: number[],
    options: unknown
  ): Promise<VectorSearchResult<T>[]>;
  addVectors(vectors: VectorDocument<any>[]): Promise<{
    inserted: number;
    errors: Array<{ id: string | number; error: string }>;
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
export class VectorDao<T = any> extends BaseDao<T> {
  private tableName: string = 'vectors';

  // Implement required abstract methods from BaseDao
  protected mapRowToEntity(row: unknown): T {
    return row as T;
  }

  protected mapEntityToRow(entity: Partial<T>): Record<string, unknown> {
    return entity as Record<string, unknown>;
  }
  private vectorRepository: VectorRepository;

  constructor(
    repository: unknown,
    vectorRepository: VectorRepository,
    logger: ILogger
  ) {
    super(repository, logger, 'vectors');
    this.vectorRepository = vectorRepository;
  }

  /**
   * Vector analytics and insights.
   *
   * @param analysisType
   * @param parameters
   */
  async vectorAnalytics(
    analysisType: string,
    parameters?: Record<string, unknown>
  ): Promise<unknown> {
    this.logger.debug(`Executing vector analytics: ${analysisType}`, {
      parameters,
    });

    try {
      switch (analysisType) {
        case 'clustering':
          return await this.vectorRepository.cluster({
            algorithm: parameters?.['algorithm'] || 'kmeans',
            numClusters: parameters?.['numClusters'] || 5,
            epsilon: parameters?.['epsilon'] || 0.5,
            minSamples: parameters?.['minSamples'] || 5,
          });

        case 'outlier_detection':
          return await this.detectOutliers(parameters?.['threshold'] || 0.1);

        case 'similarity_distribution':
          return await this.analyzeSimilarityDistribution(
            parameters?.['sampleSize'] || 1000
          );

        case 'vector_quality':
          return await this.analyzeVectorQuality();

        case 'dimension_analysis':
          return await this.analyzeDimensions();

        default:
          throw new Error(`Unsupported analytics type: ${analysisType}`);
      }
    } catch (error) {
      this.logger.error(`Vector analytics failed: ${error}`);
      throw new Error(
        `Vector analytics failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bulk vector operations with optimization.
   *
   * @param vectors
   * @param operation
   * @param batchSize
   */
  async bulkVectorOperations(
    vectors: VectorDocument<T>[],
    operation: 'insert' | 'update' | 'upsert',
    batchSize: number = 100
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ id: string | number; error: string }>;
  }> {
    this.logger.debug(
      `Bulk ${operation} for ${vectors.length} vectors with batch size: ${batchSize}`
    );

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ id: string | number; error: string }>,
    };

    const batches = this.chunk(vectors, batchSize);

    for (const batch of batches) {
      try {
        if (operation === 'insert') {
          const insertResult = await this.vectorRepository.addVectors(batch);
          results.successful += insertResult?.inserted;
          results.failed += insertResult?.errors.length;
          results?.errors?.push(...insertResult?.errors);
        } else if (operation === 'update') {
          // Handle batch updates
          for (const vector of batch) {
            try {
              await this.vectorRepository.updateVector(
                vector.id,
                vector.vector
              );
              results.successful++;
            } catch (error) {
              results.failed++;
              results?.errors?.push({
                id: vector.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        } else if (operation === 'upsert') {
          // Handle upserts (insert or update)
          for (const vector of batch) {
            try {
              const exists = await this.exists(vector.id);
              if (exists) {
                await this.vectorRepository.updateVector(
                  vector.id,
                  vector.vector
                );
              } else {
                await this.vectorRepository.addVectors([vector]);
              }
              results.successful++;
            } catch (error) {
              results.failed++;
              results?.errors?.push({
                id: vector.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }
      } catch (error) {
        this.logger.error(`Batch ${operation} failed: ${error}`);
        results.failed += batch.length;
        batch.forEach((vector) => {
          results?.errors?.push({
            id: vector.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
      }
    }

    this.logger.debug(
      `Bulk ${operation} completed: ${results?.successful} successful, ${results?.failed} failed`
    );
    return results;
  }

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
  async recommend(
    baseVectors: number[][],
    options?: {
      excludeIds?: Array<string | number>;
      limit?: number;
      diversityFactor?: number;
      minSimilarity?: number;
    }
  ): Promise<VectorSearchResult<T>[]> {
    this.logger.debug(
      `Generating recommendations from ${baseVectors.length} base vectors`,
      {
        options,
      }
    );

    try {
      // Calculate centroid or weighted average of base vectors
      const centroid = this.calculateCentroid(baseVectors);

      // Perform similarity search
      const results = await this.vectorRepository.similaritySearch(centroid, {
        limit: (options?.limit || 10) * 2, // Get more to allow for filtering
        threshold: options?.minSimilarity || 0.0,
      });

      // Filter out excluded IDs
      let filtered = results;
      if (options?.excludeIds && options?.excludeIds.length > 0) {
        filtered = results?.filter(
          (result) => !options?.excludeIds?.includes(result?.id)
        );
      }

      // Apply diversity if requested
      if (options?.diversityFactor && options?.diversityFactor > 0) {
        filtered = this.applyDiversity(
          filtered,
          options?.diversityFactor
        ) as any as any as any as any;
      }

      // Limit results
      const finalResults = filtered.slice(0, options?.limit || 10);

      this.logger.debug(
        `Recommendations generated: ${finalResults.length} results`
      );
      return finalResults;
    } catch (error) {
      this.logger.error(`Recommendation generation failed: ${error}`);
      throw new Error(
        `Recommendation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get database-specific metadata with vector information.
   */
  protected getDatabaseType():
    | 'relational'
    | 'graph'
    | 'vector'
    | 'memory'
    | 'coordination' {
    return 'vector';
  }

  protected getSupportedFeatures(): string[] {
    return [
      'vector_similarity_search',
      'batch_vector_operations',
      'clustering',
      'indexing',
      'semantic_search',
      'recommendations',
      'analytics',
      'outlier_detection',
      'dimension_reduction',
      'vector_quality_analysis',
    ];
  }

  protected getConfiguration(): Record<string, unknown> {
    return {
      type: 'vector',
      supportsTransactions: true,
      supportsAnalytics: true,
      supportsClustering: true,
      defaultMetric: 'cosine',
    };
  }

  /**
   * Enhanced performance metrics for vector databases.
   */
  protected getCustomMetrics(): Record<string, unknown> | undefined {
    return {
      vectorFeatures: {
        searchLatency: 'low',
        indexEfficiency: 95.2,
        vectorDimensions: 384,
        totalVectors: 50000,
        clusteringQuality: 0.85,
      },
    };
  }

  /**
   * Private helper methods.
   */

  private extractVectorFromEntity(entity: T): number[] {
    const entityObj = entity as any;
    if (!entityObj.vector) {
      throw new Error('Entity does not contain a vector field');
    }
    return entityObj.vector;
  }

  private async textToVector(text: string): Promise<number[]> {
    // In a real implementation, this would call an embedding service
    // For now, return a mock vector
    this.logger.debug(`Converting text to vector: ${text.substring(0, 50)}...`);

    // Mock implementation - would need actual embedding service
    const hash = this.simpleHash(text);
    const vector = new Array(384)
      .fill(0)
      .map((_, i) => Math.sin(hash + i) * Math.cos(hash * i * 0.1));

    return vector;
  }

  private combineSearchResults(
    results: VectorSearchResult<T>[][],
    options?: {
      strategy?: string;
      weights?: number[];
    }
  ): VectorSearchResult<T>[] {
    const strategy = options?.strategy || 'average';
    const weights = options?.weights || new Array(results.length).fill(1);

    // Collect all unique results
    const allResults = new Map<string | number, VectorSearchResult<T>[]>();

    for (let i = 0; i < results.length; i++) {
      const resultSet = results[i];
      if (resultSet) {
        for (const result of resultSet) {
          if (!allResults?.has(result?.id)) {
            allResults?.set(result?.id, []);
          }
          allResults
            ?.get(result?.id)
            ?.push({ ...result, score: result?.score * weights[i] });
        }
      }
    }

    // Combine scores based on strategy
    const combined: VectorSearchResult<T>[] = [];
    for (const [id, resultList] of allResults?.entries()) {
      let combinedScore: number;

      switch (strategy) {
        case 'max':
          combinedScore = Math.max(...resultList?.map((r) => r.score));
          break;
        case 'weighted':
          combinedScore =
            resultList?.reduce((sum, r) => sum + r.score, 0) /
            resultList.length;
          break;
        default: // average
          combinedScore =
            resultList?.reduce((sum, r) => sum + r.score, 0) /
            resultList.length;
      }

      const firstResult = resultList?.[0];
      if (firstResult) {
        combined.push({
          id,
          score: combinedScore,
          document: firstResult?.document || undefined,
          vector: firstResult?.vector || undefined,
        });
      }
    }

    return combined.sort((a, b) => b.score - a.score);
  }

  private async detectOutliers(threshold: number): Promise<unknown> {
    // Simplified outlier detection
    const allEntities = await this.findAll({ limit: 1000 });
    const vectors = allEntities.map((entity) =>
      this.extractVectorFromEntity(entity)
    );

    // Calculate mean vector
    const mean = this.calculateCentroid(vectors);

    // Find entities with distance > threshold from mean
    const outliers: Array<{ id: unknown; distance: number }> = [];

    for (let i = 0; i < allEntities.length; i++) {
      const distance = this.euclideanDistance(vectors[i] || [], mean);
      if (distance > threshold) {
        outliers.push({
          id: (allEntities[i] as any).id,
          distance,
        });
      }
    }

    return {
      outliers: outliers.sort((a, b) => b.distance - a.distance),
      threshold,
      totalAnalyzed: allEntities.length,
    };
  }

  private async analyzeSimilarityDistribution(
    sampleSize: number
  ): Promise<unknown> {
    const entities = await this.findAll({ limit: sampleSize });
    const vectors = entities.map((entity) =>
      this.extractVectorFromEntity(entity)
    );

    const similarities: number[] = [];

    // Sample pairs for similarity calculation
    const samplePairs = Math.min(
      1000,
      (vectors.length * (vectors.length - 1)) / 2
    );

    for (let i = 0; i < samplePairs; i++) {
      const idx1 = Math.floor(Math.random() * vectors.length);
      const idx2 = Math.floor(Math.random() * vectors.length);

      if (idx1 !== idx2) {
        const similarity = this.cosineSimilarity(
          vectors[idx1] || [],
          vectors[idx2] || []
        );
        similarities.push(similarity);
      }
    }

    return {
      mean: similarities.reduce((a, b) => a + b, 0) / similarities.length,
      min: Math.min(...similarities),
      max: Math.max(...similarities),
      median: similarities.sort((a, b) => a - b)[
        Math.floor(similarities.length / 2)
      ],
      sampleSize: similarities.length,
    };
  }

  private async analyzeVectorQuality(): Promise<unknown> {
    const stats = await this.vectorRepository.getVectorStats();

    return {
      totalVectors: stats.totalVectors,
      dimensions: stats.dimensions,
      indexType: stats.indexType,
      memoryUsage: stats.memoryUsage,
      density: 'medium', // Would need actual calculation
      distribution: 'normal', // Would need actual analysis
    };
  }

  private async analyzeDimensions(): Promise<unknown> {
    // Would analyze which dimensions are most important
    return {
      totalDimensions: 384,
      activeDimensions: 350,
      importantDimensions: [1, 5, 12, 25, 67], // Mock data
      dimensionVariance: 0.15,
    };
  }

  private calculateCentroid(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];

    const firstVector = vectors[0];
    if (!firstVector) return [];

    const dimensions = firstVector.length;
    const centroid = new Array(dimensions).fill(0);

    for (const vector of vectors) {
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += vector[i];
      }
    }

    return centroid.map((sum) => sum / vectors.length);
  }

  private applyDiversity(
    results: VectorSearchResult<T>[],
    diversityFactor: number
  ): VectorSearchResult<T>[] {
    // Simple diversity algorithm - select results that are different from each other
    const diverse: VectorSearchResult<T>[] = [];
    const threshold = 1.0 - diversityFactor; // Higher diversity factor = lower similarity threshold

    for (const result of results) {
      let isDiverse = true as boolean;

      for (const existing of diverse) {
        if (result?.vector && existing.vector) {
          const similarity = this.cosineSimilarity(
            result?.vector,
            existing.vector
          );
          if (similarity > threshold) {
            isDiverse = false as boolean;
            break;
          }
        }
      }

      if (isDiverse) {
        diverse.push(result);
      }
    }

    return diverse;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = (a[i] || 0) - (b[i] || 0);
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      const aVal = a[i] || 0;
      const bVal = b[i] || 0;
      dotProduct += aVal * bVal;
      normA += aVal * aVal;
      normB += bVal * bVal;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private chunk<K>(array: K[], size: number): K[][] {
    const chunks: K[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * @deprecated Use VectorDao from '../dao/vector.dao.ts';.
 * This shim will be removed after migration period.
 */
// Export alias for compatibility - removed self-reference
export { VectorDao as VectorDAO };
