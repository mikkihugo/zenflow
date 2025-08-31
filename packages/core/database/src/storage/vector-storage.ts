/**
 * Vector Storage Implementation
 *
 * Provides vector database operations with similarity search,
 * embeddings management, and performance monitoring.
 */

import { getLogger } from '../logger.js';
import { createErrorOptions } from '../utils/error-helpers.js';
import {
  type DatabaseConfig,
  type DatabaseConnection,
  QueryError,
  type VectorResult,
  type VectorSearchOptions,
  type VectorStorage,
} from '../types/index.js';

const logger = getLogger('vector-storage');

export class VectorStorageImpl implements VectorStorage {
  private readonly collectionName = 'vectors';
  private indexCache = new Map<string, boolean>();

  constructor(
    private connection: DatabaseConnection,
    private config: DatabaseConfig
  ) {}

  async insert(
    id: string,
    vector: readonly number[],
    metadata?: Readonly<Record<string, unknown>>
  ): Promise<void> {
    try {
      logger.debug('Inserting vector', { id, vectorLength: vector.length });

      // Ensure collection exists
      await this.ensureCollectionExists();

      // Convert vector to binary format for storage
      const vectorBlob = Buffer.from(new Float32Array(vector).buffer);
      const metadataJson = metadata ? JSON.stringify(metadata) : null;

      const sql = `INSERT OR REPLACE INTO "${this.collectionName}" (id, vector, metadata) VALUES (?, ?, ?)`;
      await this.connection.execute(sql, [id, vectorBlob, metadataJson]);

      logger.debug('Vector inserted successfully', { id });
    } catch (error) {
      logger.error('Failed to insert vector', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to insert vector:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error) as any
      );
    }
  }

  async search(
    vector: readonly number[],
    options?: VectorSearchOptions
  ): Promise<readonly VectorResult[]> {
    try {
      logger.debug('Searching vectors', {
        vectorLength: vector.length,
        limit: options?.limit || 10,
      });

      await this.ensureCollectionExists();

      // For a real vector database, this would use optimized vector similarity search
      // For SQLite fallback, we'll do a simplified approach
      const sql = `SELECT id, vector, metadata FROM "${this.collectionName}" LIMIT ${options?.limit || 10}`;
      const result = await this.connection.query<{
        id: string;
        vector: Buffer;
        metadata: string | null;
      }>(sql);

      // Calculate cosine similarity for each vector
      const results = result.rows.map((row) => {
        const storedVector = new Float32Array(row.vector.buffer);
        const score = this.calculateCosineSimilarity(
          Array.from(vector),
          Array.from(storedVector)
        );

        const vectorResult: VectorResult = {
          id: row.id,
          vector: Array.from(storedVector),
          similarity: score,
          ...(row.metadata ? { metadata: JSON.parse(row.metadata) } : {}),
        };

        return vectorResult;
      });

      // Sort by similarity score (descending) and apply threshold
      const filteredResults = results
        .filter(
          (result) =>
            !options?.threshold || result.similarity >= options.threshold
        )
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options?.limit || 10);

      logger.debug('Vector search completed', {
        resultCount: filteredResults.length,
      });

      return filteredResults;
    } catch (error) {
      logger.error('Failed to search vectors', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to search vectors:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async get(id: string): Promise<VectorResult | null> {
    try {
      logger.debug('Getting vector', { id });

      await this.ensureCollectionExists();

      const sql = `SELECT id, vector, metadata FROM "${this.collectionName}" WHERE id = ?`;
      const result = await this.connection.query<{
        id: string;
        vector: Buffer;
        metadata: string | null;
      }>(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const vector = Array.from(new Float32Array(row.vector.buffer));
      const metadata = row.metadata ? JSON.parse(row.metadata) : undefined;

      logger.debug('Vector retrieved', { id });

      return {
        id: row.id,
        vector,
        similarity: 1.0, // Exact match
        metadata,
      };
    } catch (error) {
      logger.error('Failed to get vector', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to get vector:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async update(
    id: string,
    vector?: readonly number[],
    metadata?: Readonly<Record<string, unknown>>
  ): Promise<void> {
    try {
      logger.debug('Updating vector', {
        id,
        hasVector: !!vector,
        hasMetadata: !!metadata,
      });

      await this.ensureCollectionExists();

      // First check if vector exists
      const existing = await this.get(id);
      if (!existing) {
        throw new QueryError(`Vector with id ${id} does not exist`);
      }

      // Build update query
      const updates: string[] = [];
      const params: unknown[] = [];

      if (vector) {
        updates.push('vector = ?');
        params.push(Buffer.from(new Float32Array(vector).buffer));
      }

      if (metadata !== undefined) {
        updates.push('metadata = ?');
        params.push(metadata ? JSON.stringify(metadata) : null);
      }

      if (updates.length === 0) {
        logger.debug('No updates specified for vector', { id });
        return;
      }

      params.push(id);
      const sql = `UPDATE "${this.collectionName}" SET ${updates.join(', ')} WHERE id = ?`;
      await this.connection.execute(sql, params);

      logger.debug('Vector updated successfully', { id });
    } catch (error) {
      logger.error('Failed to update vector', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to update vector:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug('Deleting vector', { id });

      await this.ensureCollectionExists();

      const result = await this.connection.execute(
        `DELETE FROM "${this.collectionName}" WHERE id = ?`,
        [id]
      );

      const deleted = (result.affectedRows ?? 0) > 0;
      logger.debug('Vector deletion completed', { id, deleted });

      return deleted;
    } catch (error) {
      logger.error('Failed to delete vector', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to delete vector:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async createIndex(
    name: string,
    options?: {
      dimensions?: number;
      metric?: 'l2' | 'cosine' | 'dot';
      nprobes?: number;
    }
  ): Promise<void> {
    try {
      logger.debug('Creating vector index', { name, options });

      // For SQLite fallback, we create a regular index on the id column
      // In a real vector database implementation, this would create a vector index
      const sql = `CREATE INDEX IF NOT EXISTS idx_${name} ON "${this.collectionName}" (id)`;
      await this.connection.execute(sql);

      this.indexCache.set(name, true);
      logger.info('Vector index created', { name });
    } catch (error) {
      logger.error('Failed to create vector index', {
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create vector index:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async dropIndex(name: string): Promise<void> {
    try {
      logger.debug('Dropping vector index', { name });

      const sql = `DROP INDEX IF EXISTS idx_${name}`;
      await this.connection.execute(sql);

      this.indexCache.delete(name);
      logger.info('Vector index dropped', { name });
    } catch (error) {
      logger.error('Failed to drop vector index', {
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      const errorOptions: Record<string, unknown> = {
        correlationId: this.generateCorrelationId(),
      };
      if (error instanceof Error) {
        errorOptions['cause'] = error;
      }
      
      throw new QueryError(
        `Failed to drop vector index:${error instanceof Error ? error.message : String(error)}`,
        errorOptions as any
      );
    }
  }

  async count(): Promise<number> {
    try {
      await this.ensureCollectionExists();
      const result = await this.connection.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM "${this.collectionName}"`
      );
      return result.rows[0]?.count || 0;
    } catch (error) {
      logger.error('Failed to count vectors', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to count vectors:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async getStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    indexType: string;
    memoryUsageMB: number;
  }> {
    try {
      await this.ensureCollectionExists();

      const countResult = await this.connection.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM "${this.collectionName}"`
      );
      const totalVectors = countResult.rows[0]?.count || 0;

      // Get sample vector to determine dimensions
      let dimensions = 0;
      if (totalVectors > 0) {
        const sampleResult = await this.connection.query<{ vector: Buffer }>(
          `SELECT vector FROM "${this.collectionName}" LIMIT 1`
        );
        if (sampleResult.rows.length > 0 && sampleResult.rows[0]?.vector) {
          const sampleVector = new Float32Array(
            sampleResult.rows[0].vector.buffer
          );
          dimensions = sampleVector.length;
        }
      }

      return {
        totalVectors,
        dimensions,
        indexType: 'btree', // SQLite fallback
        memoryUsageMB: Math.round(
          (totalVectors * dimensions * 4) / (1024 * 1024)
        ), // Rough estimate
      };
    } catch (error) {
      logger.error('Failed to get vector stats', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to get vector stats:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  // Private helper methods
  private async ensureCollectionExists(): Promise<void> {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS "${this.collectionName}" (
        id TEXT PRIMARY KEY,
        vector BLOB,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;

      await this.connection.execute(sql);
    } catch (error) {
      logger.error('Failed to create vectors table', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create vectors table:${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private generateCorrelationId(): string {
    return `vector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateCosineSimilarity(
    vectorA: number[],
    vectorB: number[]
  ): number {
    if (vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [i, element] of vectorA.entries()) {
      const valueB = vectorB[i];
      if (valueB !== undefined) {
        dotProduct += element * valueB;
        normA += element * element;
        normB += valueB * valueB;
      }
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  // Health and monitoring methods
  async isHealthy(): Promise<boolean> {
    try {
      await this.ensureCollectionExists();
      await this.connection.query(
        `SELECT COUNT(*) FROM "${this.collectionName}" LIMIT 1`
      );
      return true;
    } catch {
      return false;
    }
  }

  async getStatistics(): Promise<{
    connectionStatus: 'connected' | 'disconnected';
    vectorCount: number;
  }> {
    try {
      const isConnected = this.connection.isConnected();

      if (!isConnected) {
        return {
          connectionStatus: 'disconnected',
          vectorCount: 0,
        };
      }

      await this.ensureCollectionExists();
      const result = await this.connection.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM "${this.collectionName}"`
      );

      return {
        connectionStatus: 'connected',
        vectorCount: result.rows[0]?.count || 0,
      };
    } catch (error) {
      logger.error('Failed to get vector storage statistics', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        connectionStatus: 'disconnected',
        vectorCount: 0,
      };
    }
  }

  async close(): Promise<void> {
    try {
      logger.debug('Closing vector storage');
      await this.connection.disconnect();
      logger.info('Vector storage closed successfully');
    } catch (error) {
      logger.error('Failed to close vector storage', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
