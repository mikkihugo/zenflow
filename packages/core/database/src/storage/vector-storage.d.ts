/**
 * Vector Storage Implementation
 *
 * Provides vector database operations with similarity search,
 * embeddings management, and performance monitoring.
 */
import {
  type DatabaseConfig,
  type DatabaseConnection,
  type VectorResult,
  type VectorSearchOptions,
  type VectorStorage,
} from '../types/index.js';
export declare class VectorStorageImpl implements VectorStorage {
  private connection;
  private config;
  private readonly collectionName;
  private indexCache;
  constructor(connection: DatabaseConnection, config: DatabaseConfig);
  insert(
    id: string,
    vector: readonly number[],
    metadata?: Readonly<Record<string, unknown>>
  ): Promise<void>;
  search(
    vector: readonly number[],
    options?: VectorSearchOptions
  ): Promise<readonly VectorResult[]>;
  get(id: string): Promise<VectorResult | null>;
  update(
    id: string,
    vector?: readonly number[],
    metadata?: Readonly<Record<string, unknown>>
  ): Promise<void>;
  delete(id: string): Promise<boolean>;
  createIndex(
    name: string,
    options?: {
      dimensions?: number;
      metric?: 'l2' | 'cosine' | 'dot';
      nprobes?: number;
    }
  ): Promise<void>;
  dropIndex(name: string): Promise<void>;
  count(): Promise<number>;
  getStats(): Promise<{
    totalVectors: number;
    dimensions: number;
    indexType: string;
    memoryUsageMB: number;
  }>;
  private ensureCollectionExists;
  private generateCorrelationId;
  private calculateCosineSimilarity;
  isHealthy(): Promise<boolean>;
  getStatistics(): Promise<{
    connectionStatus: 'connected' | 'disconnected';
    vectorCount: number;
  }>;
  close(): Promise<void>;
}
//# sourceMappingURL=vector-storage.d.ts.map
