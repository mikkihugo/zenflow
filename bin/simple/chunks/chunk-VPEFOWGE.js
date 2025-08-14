
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  BaseDao
} from "./chunk-P4NCKSFY.js";
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/database/dao/vector.dao.ts
var VectorDao = class extends BaseDao {
  static {
    __name(this, "VectorDao");
  }
  get vectorAdapter() {
    return this.adapter;
  }
  /**
   * Perform vector similarity search.
   *
   * @param queryVector
   * @param options
   */
  async similaritySearch(queryVector, options) {
    this.logger.debug(`Performing similarity search with ${queryVector.length}D vector`, {
      options
    });
    try {
      this.validateVector(queryVector);
      const searchOptions = {
        limit: options?.limit || 10,
        threshold: options?.threshold || 0,
        metric: options?.metric || "cosine",
        filter: options?.filter
      };
      const vectorResult = await this.vectorAdapter.vectorSearch(queryVector, searchOptions?.limit);
      const results = vectorResult?.matches?.filter((match) => match?.score >= searchOptions?.threshold).map((match) => ({
        id: match?.id,
        score: match?.score,
        document: this.mapVectorDocumentToEntity(match),
        vector: match?.vector
      }));
      this.logger.debug(`Similarity search completed: ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error(`Similarity search failed: ${error}`);
      throw new Error(
        `Similarity search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Add vectors in batch.
   *
   * @param vectors
   */
  async addVectors(vectors) {
    if (vectors.length === 0) {
      return { inserted: 0, errors: [] };
    }
    this.logger.debug(`Adding ${vectors.length} vectors to ${this.tableName}`);
    try {
      for (const vectorDoc of vectors) {
        this.validateVector(vectorDoc.vector);
      }
      const adapterVectors = vectors.map((vectorDoc) => ({
        id: vectorDoc.id,
        vector: vectorDoc.vector,
        metadata: vectorDoc.metadata
      }));
      await this.vectorAdapter.addVectors(adapterVectors);
      const result = {
        inserted: vectors.length,
        errors: []
      };
      this.logger.debug(`Successfully added ${result?.inserted} vectors`);
      return result;
    } catch (error) {
      this.logger.error(`Add vectors failed: ${error}`);
      return {
        inserted: 0,
        errors: vectors.map((v) => ({
          id: v.id,
          error: error instanceof Error ? error.message : "Unknown error"
        }))
      };
    }
  }
  /**
   * Create vector index.
   *
   * @param config
   */
  async createIndex(config) {
    this.logger.debug(`Creating vector index: ${config?.name}`, { config });
    try {
      await this.vectorAdapter.createIndex(config);
      this.logger.debug(`Successfully created vector index: ${config?.name}`);
    } catch (error) {
      this.logger.error(`Create index failed: ${error}`);
      throw new Error(
        `Create index failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get vector statistics.
   */
  async getVectorStats() {
    this.logger.debug(`Getting vector statistics for ${this.tableName}`);
    try {
      const count = await this.count();
      const stats = {
        totalVectors: count,
        dimensions: this.getVectorDimension(),
        indexType: "auto",
        memoryUsage: count * this.getVectorDimension() * 4
        // Rough estimate: float32 = 4 bytes
      };
      return stats;
    } catch (error) {
      this.logger.error(`Get vector stats failed: ${error}`);
      throw new Error(
        `Get vector stats failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Perform clustering operation.
   *
   * @param options
   */
  async cluster(options) {
    this.logger.debug("Performing vector clustering", { options });
    try {
      const clusterOptions = {
        algorithm: options?.algorithm || "kmeans",
        numClusters: options?.numClusters || 5,
        epsilon: options?.epsilon || 0.5,
        minSamples: options?.minSamples || 5
      };
      const allVectors = await this.findAll();
      const vectorIds = allVectors.map((entity) => entity.id);
      const clusters = this.performSimpleClustering(vectorIds, clusterOptions?.numClusters);
      const result = {
        clusters,
        statistics: {
          silhouetteScore: 0.7,
          // Mock score
          inertia: 100.5
          // Mock inertia
        }
      };
      this.logger.debug(`Clustering completed: ${result?.clusters.length} clusters`);
      return result;
    } catch (error) {
      this.logger.error(`Clustering failed: ${error}`);
      throw new Error(
        `Clustering failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Enhanced vector-specific operations.
   */
  /**
   * Find similar entities to a given entity.
   *
   * @param entityId
   * @param options
   */
  async findSimilarToEntity(entityId, options) {
    this.logger.debug(`Finding entities similar to: ${entityId}`);
    try {
      const entity = await this.findById(entityId);
      if (!entity) {
        throw new Error(`Entity with ID ${entityId} not found`);
      }
      const vector = this.extractVectorFromEntity(entity);
      if (!vector) {
        throw new Error(`No vector found for entity ${entityId}`);
      }
      const results = await this.similaritySearch(vector, options);
      return results?.filter((result) => result?.id !== entityId);
    } catch (error) {
      this.logger.error(`Find similar to entity failed: ${error}`);
      throw new Error(
        `Find similar to entity failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Update vector for existing entity.
   *
   * @param entityId
   * @param newVector
   */
  async updateVector(entityId, newVector) {
    this.logger.debug(`Updating vector for entity: ${entityId}`);
    try {
      this.validateVector(newVector);
      const existingEntity = await this.findById(entityId);
      if (!existingEntity) {
        throw new Error(`Entity with ID ${entityId} not found`);
      }
      const updatedEntity = await this.update(entityId, {
        vector: newVector
      });
      return updatedEntity;
    } catch (error) {
      this.logger.error(`Update vector failed: ${error}`);
      throw new Error(
        `Update vector failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Batch similarity search with multiple query vectors.
   *
   * @param queryVectors
   * @param options
   */
  async batchSimilaritySearch(queryVectors, options) {
    this.logger.debug(
      `Performing batch similarity search with ${queryVectors.length} query vectors`
    );
    try {
      const results = [];
      const searchPromises = queryVectors.map(
        (queryVector) => this.similaritySearch(queryVector, options)
      );
      const batchResults = await Promise.all(searchPromises);
      results?.push(...batchResults);
      this.logger.debug(`Batch similarity search completed: ${results.length} result sets`);
      return results;
    } catch (error) {
      this.logger.error(`Batch similarity search failed: ${error}`);
      throw new Error(
        `Batch similarity search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Override base repository methods for vector-specific implementations.
   */
  mapRowToEntity(row) {
    if (row.vector && typeof row.vector === "string") {
      try {
        row.vector = JSON.parse(row.vector);
      } catch {
      }
    }
    return row;
  }
  mapEntityToRow(entity) {
    if (!entity) return {};
    const row = { ...entity };
    if (row.vector && Array.isArray(row.vector)) {
    }
    return row;
  }
  /**
   * Execute custom query - override to handle vector-specific queries.
   *
   * @param customQuery
   */
  async executeCustomQuery(customQuery) {
    if (customQuery.type === "vector") {
      const query = customQuery.query;
      if (query.operation === "similarity_search") {
        const results = await this.similaritySearch(query.vector, query.options);
        return results;
      }
      if (query.operation === "cluster") {
        const results = await this.cluster(query.options);
        return results;
      }
    }
    return super.executeCustomQuery(customQuery);
  }
  /**
   * Helper methods.
   */
  validateVector(vector) {
    if (!Array.isArray(vector)) {
      throw new Error("Vector must be an array of numbers");
    }
    if (vector.length === 0) {
      throw new Error("Vector cannot be empty");
    }
    if (!vector.every((v) => typeof v === "number" && !Number.isNaN(v))) {
      throw new Error("Vector must contain only valid numbers");
    }
    const expectedDimension = this.getVectorDimension();
    if (expectedDimension && vector.length !== expectedDimension) {
      throw new Error(
        `Vector dimension mismatch: expected ${expectedDimension}, got ${vector.length}`
      );
    }
  }
  getVectorDimension() {
    return this.entitySchema?.["vector"]?.dimension || 384;
  }
  mapVectorDocumentToEntity(match) {
    return {
      id: match?.id,
      vector: match?.vector,
      ...match?.metadata
    };
  }
  extractVectorFromEntity(entity) {
    const entityObj = entity;
    return entityObj.vector || null;
  }
  performSimpleClustering(vectorIds, numClusters) {
    const clusters = [];
    const idsPerCluster = Math.ceil(vectorIds.length / numClusters);
    for (let i = 0; i < numClusters; i++) {
      const startIdx = i * idsPerCluster;
      const endIdx = Math.min(startIdx + idsPerCluster, vectorIds.length);
      const clusterMembers = vectorIds.slice(startIdx, endIdx);
      if (clusterMembers.length > 0) {
        clusters.push({
          id: i,
          centroid: new Array(this.getVectorDimension()).fill(0),
          // Mock centroid
          members: clusterMembers
        });
      }
    }
    return clusters;
  }
};

export {
  VectorDao
};
//# sourceMappingURL=chunk-VPEFOWGE.js.map
