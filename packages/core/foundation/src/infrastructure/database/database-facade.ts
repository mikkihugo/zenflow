/**
 * @fileoverview Database Facade - Foundation-based Database Access
 *
 * Provides access to database functionality through foundation package,
 * maintaining proper tier separation while offering convenient access.
 * Uses lazy loading and graceful fallbacks when database package unavailable.
 */

import { getLogger } from '../../core/logging/index.js';
import {
  facadeStatusManager,
  CapabilityLevel,
} from '../facades/system.status.manager.js';
import { type Result, ok } from '../../error-handling/index.js';
import type {
  DatabaseConnection,
  DatabaseAdapter,
  DatabaseConfig,
  KeyValueStorage,
  VectorStorage,
  GraphStorage,
  HealthStatus,
  QueryResult,
  QueryParams,
  VectorSearchOptions,
  VectorResult,
  GraphResult,
} from './types.js';

const logger = getLogger('database-facade');
// Deduplicate common string literals to satisfy sonarjs/no-duplicate-string
const DB_PACKAGE_NAME = '@claude-zen/database';
const FALLBACK_HEALTH_MSG = `Using fallback database adapter - ${DB_PACKAGE_NAME} not available`;

// Re-export types for consumers
export type {
  DatabaseConnection,
  DatabaseAdapter,
  DatabaseConfig,
  KeyValueStorage as KeyValueStore,
  VectorStorage as VectorStore,
  GraphStorage as GraphStore,
  HealthStatus,
  QueryResult,
  QueryParams,
} from './types.js';

// Type definitions for the optional database package
interface DatabasePackage {
  DatabaseFactory?: {
    createAdapter(type: DatabaseConfig['type']): Promise<DatabaseAdapter>;
  };
  createKeyValueStorage?(): Promise<KeyValueStorage>;
  createVectorStorage?(): Promise<VectorStorage>;
  createGraphStorage?(): Promise<GraphStorage>;
}

/**
 * Database Facade providing unified access to database functionality
 */
export class DatabaseFacade {
  private static instance: DatabaseFacade | null = null;
  private databasePackage: DatabasePackage | null = null;
  private capability: CapabilityLevel = CapabilityLevel.FALLBACK;

  private constructor() {
    this.initializeFacade();
  }

  static getInstance(): DatabaseFacade {
    if (!DatabaseFacade.instance) {
      DatabaseFacade.instance = new DatabaseFacade();
    }
    return DatabaseFacade.instance;
  }

  private async initializeFacade(): Promise<void> {
    try {
      // Register database facade with status manager
      await facadeStatusManager.registerFacade(
        'database',
        [DB_PACKAGE_NAME],
        [
          'SQL database operations',
          'Key-value storage',
          'Vector database',
          'Graph database',
        ]
      );

      // Try to load the database package
      await this.loadDatabasePackage();
    } catch (error) {
      logger.warn('Database facade initialization with fallback', { error });
      this.capability = CapabilityLevel.FALLBACK;
    }
  }

  private async loadDatabasePackage(): Promise<void> {
    try {
      const packageInfo = await facadeStatusManager.checkAndRegisterPackage(
        DB_PACKAGE_NAME,
        'databaseService'
      );

      if (
        packageInfo.status === 'available' ||
        packageInfo.status === 'registered'
      ) {
        try {
          // Dynamic import with error handling for optional dependency
          const moduleName = DB_PACKAGE_NAME;
          const databaseModule = await import(moduleName).catch(() => null);
          if (databaseModule) {
            this.databasePackage = databaseModule as DatabasePackage;
            this.capability = CapabilityLevel.FULL;
            logger.info('Database package loaded successfully');
          } else {
            logger.warn('Database package not found, using fallback');
            this.capability = CapabilityLevel.FALLBACK;
          }
        } catch (importError) {
          logger.warn('Database package import failed, using fallback', {
            importError,
          });
          this.capability = CapabilityLevel.FALLBACK;
        }
      } else {
        logger.warn('Database package unavailable, using fallback');
        this.capability = CapabilityLevel.FALLBACK;
      }
    } catch (error) {
      logger.warn('Failed to load database package', { error });
      this.capability = CapabilityLevel.FALLBACK;
    }
  }

  /**
   * Get database capability level
   */
  getCapability(): CapabilityLevel {
    return this.capability;
  }

  /**
   * Create a database adapter
   */
  async createAdapter(
    type: DatabaseConfig['type']
  ): Promise<Result<DatabaseAdapter, Error>> {
    if (
      this.capability === CapabilityLevel.FULL &&
      this.databasePackage?.DatabaseFactory
    ) {
      try {
        const adapter =
          await this.databasePackage.DatabaseFactory.createAdapter(type);
        return ok(adapter);
      } catch (error) {
        logger.error('Failed to create database adapter', { type, error });
        return this.createFallbackAdapter(type);
      }
    }

    return this.createFallbackAdapter(type);
  }

  /**
   * Create fallback adapter when database package unavailable
   */
  private createFallbackAdapter(
    type: DatabaseConfig['type']
  ): Result<DatabaseAdapter, Error> {
    logger.debug('Creating fallback database adapter for ' + type);

    const fallbackAdapter: DatabaseAdapter = {
      connect(
        config: DatabaseConfig
      ): Promise<Result<DatabaseConnection, Error>> {
        logger.warn('Fallback database connection for ' + config.type);

        const fallbackConnection: DatabaseConnection = {
          query<T = unknown>(): Promise<QueryResult<T>> {
            logger.warn('Fallback database query - returning empty result');
            return Promise.resolve({
              rows: [] as readonly T[],
              rowCount: 0,
              executionTimeMs: 0,
            });
          },

          execute(): Promise<{ affectedRows: number; insertId?: number }> {
            logger.warn('Fallback database execute - no operation performed');
            return Promise.resolve({ affectedRows: 0 });
          },

          close(): Promise<void> {
            logger.debug('Fallback database connection closed');
            return Promise.resolve();
          },
        };

        return Promise.resolve(ok(fallbackConnection));
      },

      getHealth(): Promise<HealthStatus> {
        return Promise.resolve({
          healthy: false,
          status: 'unknown',
          score: 0,
          timestamp: new Date(),
          details: { fallback: true, type },
          lastError: FALLBACK_HEALTH_MSG,
        });
      },

      disconnect(): Promise<void> {
        logger.debug('Fallback database adapter disconnected');
        return Promise.resolve();
      },

      async transaction<T>(
        operation: (conn: any) => Promise<T>
      ): Promise<T> {
        logger.warn('Fallback transaction - executing without transaction safety');
        const connectionResult = await this.connect({ type, database: 'fallback' });
        const connection = connectionResult.unwrapOr(null);
        if (!connection) {
          throw new Error('Failed to create fallback connection');
        }
        return operation(connection);
      },
    };

    return ok(fallbackAdapter);
  }

  /**
   * Create key-value store
   */
  async createKeyValueStore(): Promise<Result<KeyValueStorage, Error>> {
    if (
      this.capability === CapabilityLevel.FULL &&
      this.databasePackage?.createKeyValueStorage
    ) {
      try {
        const store = await this.databasePackage.createKeyValueStorage();
        return ok(store);
      } catch (error) {
        logger.error('Failed to create key-value store', { error });
        return this.createFallbackKeyValueStore();
      }
    }

    return this.createFallbackKeyValueStore();
  }

  /**
   * Create fallback key-value store
   */
  private createFallbackKeyValueStore(): Result<KeyValueStorage, Error> {
    const fallbackStore = new Map<
      string,
      { value: unknown; expires?: number }
    >();

    const store: KeyValueStorage = {
      get<T = unknown>(key: string): Promise<T | null> {
        const entry = fallbackStore.get(key);
        if (!entry) return Promise.resolve(null);

        if (entry.expires && Date.now() > entry.expires) {
          fallbackStore.delete(key);
          return Promise.resolve(null);
        }

        return Promise.resolve(entry.value as T);
      },

      set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
        const expires = ttl ? Date.now() + ttl * 1000 : undefined;
        fallbackStore.set(key, { value, expires });
        return Promise.resolve();
      },

      delete(key: string): Promise<boolean> {
        return Promise.resolve(fallbackStore.delete(key));
      },

      clear(): Promise<void> {
        fallbackStore.clear();
        return Promise.resolve();
      },

      keys(pattern?: string): Promise<string[]> {
        const allKeys = Array.from(fallbackStore.keys());
        if (!pattern) return Promise.resolve(allKeys);

        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return Promise.resolve(allKeys.filter((key) => regex.test(key)));
      },

      exists(key: string): Promise<boolean> {
        return Promise.resolve(fallbackStore.has(key));
      },

      increment(key: string, amount: number = 1): Promise<number> {
        const current = Number(fallbackStore.get(key)?.value || 0);
        const newValue = current + amount;
        fallbackStore.set(key, { value: newValue });
        return Promise.resolve(newValue);
      },

      decrement(key: string, amount: number = 1): Promise<number> {
        const current = Number(fallbackStore.get(key)?.value || 0);
        const newValue = current - amount;
        fallbackStore.set(key, { value: newValue });
        return Promise.resolve(newValue);
      },

      expire(key: string, ttl: number): Promise<boolean> {
        const entry = fallbackStore.get(key);
        if (!entry) return Promise.resolve(false);
        
        entry.expires = Date.now() + ttl * 1000;
        return Promise.resolve(true);
      },

      getStats(): Promise<{ keys: number; memoryUsage: number }> {
        return Promise.resolve({
          keys: fallbackStore.size,
          memoryUsage: JSON.stringify(Array.from(fallbackStore.entries())).length,
        });
      },
    };

    logger.debug('Created fallback key-value store');
    return ok(store);
  }

  /**
   * Create vector store
   */
  async createVectorStore(): Promise<Result<VectorStorage, Error>> {
    if (
      this.capability === CapabilityLevel.FULL &&
      this.databasePackage?.createVectorStorage
    ) {
      try {
        const store = await this.databasePackage.createVectorStorage();
        return ok(store);
      } catch (error) {
        logger.error('Failed to create vector store', { error });
        return this.createFallbackVectorStore();
      }
    }

    return this.createFallbackVectorStore();
  }

  /**
   * Create fallback vector store
   */
  private createFallbackVectorStore(): Result<VectorStorage, Error> {
    const vectors = new Map<
      string,
      { vector: readonly number[]; metadata?: Readonly<Record<string, unknown>> }
    >();
    const cosineSimilarity = this.cosineSimilarity.bind(this);

    const store: VectorStorage = {
      insert(
        id: string,
        vector: readonly number[],
        metadata?: Readonly<Record<string, unknown>>
      ): Promise<void> {
        vectors.set(id, { vector, metadata });
        return Promise.resolve();
      },

      search(
        query: readonly number[],
        options: VectorSearchOptions = {}
      ): Promise<readonly VectorResult[]> {
        logger.warn('Fallback vector search - using simple cosine similarity');

        const results: VectorResult[] = [];
        const limit = options.limit || 10;

        for (const [id, { vector, metadata }] of vectors.entries()) {
          const similarity = cosineSimilarity(Array.from(query), Array.from(vector));
          if (!options.threshold || similarity >= options.threshold) {
            results.push({
              id,
              vector,
              similarity,
              metadata,
            });
          }
        }

        return Promise.resolve(
          results.sort((a, b) => b.similarity - a.similarity).slice(0, limit)
        );
      },

      delete(id: string): Promise<boolean> {
        return Promise.resolve(vectors.delete(id));
      },

      update(
        id: string,
        vector?: readonly number[],
        metadata?: Readonly<Record<string, unknown>>
      ): Promise<boolean> {
        const existing = vectors.get(id);
        if (!existing) return Promise.resolve(false);
        
        vectors.set(id, {
          vector: vector || existing.vector,
          metadata: metadata || existing.metadata,
        });
        return Promise.resolve(true);
      },

      clear(): Promise<void> {
        vectors.clear();
        return Promise.resolve();
      },

      getStats(): Promise<{ count: number; dimensions: number }> {
        const dimensions = vectors.size > 0 
          ? Array.from(vectors.values())[0]?.vector.length || 0 
          : 0;
        return Promise.resolve({
          count: vectors.size,
          dimensions,
        });
      },
    };

    logger.debug('Created fallback vector store');
    return ok(store);
  }

  /**
   * Simple cosine similarity calculation for fallback
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [i, element] of a.entries()) {
      const bElement = b[i];
      if (bElement !== undefined) {
        dotProduct += element * bElement;
        normA += element * element;
        normB += bElement * bElement;
      }
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Create graph store
   */
  async createGraphStore(): Promise<Result<GraphStorage, Error>> {
    if (
      this.capability === CapabilityLevel.FULL &&
      this.databasePackage?.createGraphStorage
    ) {
      try {
        const store = await this.databasePackage.createGraphStorage();
        return ok(store);
      } catch (error) {
        logger.error('Failed to create graph store', { error });
        return this.createFallbackGraphStore();
      }
    }

    return this.createFallbackGraphStore();
  }

  /**
   * Create fallback graph store
   */
  private createFallbackGraphStore(): Result<GraphStorage, Error> {
    const nodes = new Map<string, { labels: readonly string[]; properties: Readonly<Record<string, unknown>> }>();
    const edges = new Map<
      string,
      {
        id: string;
        fromId: string;
        toId: string;
        type: string;
        properties: Readonly<Record<string, unknown>>;
      }
    >();

    const store: GraphStorage = {
      addNode(
        id: string,
        labels: readonly string[],
        properties: Readonly<Record<string, unknown>> = {}
      ): Promise<void> {
        nodes.set(id, { labels, properties });
        return Promise.resolve();
      },

      addEdge(
        id: string,
        fromId: string,
        toId: string,
        type: string,
        properties: Readonly<Record<string, unknown>> = {}
      ): Promise<void> {
        edges.set(id, { id, fromId, toId, type, properties });
        return Promise.resolve();
      },

      query(cypher: string, params?: QueryParams): Promise<GraphResult> {
        logger.warn('Fallback graph query - basic implementation', { cypher, params });
        
        const graphNodes = Array.from(nodes.entries()).map(([id, node]) => ({
          id,
          labels: node.labels,
          properties: node.properties,
        }));
        
        const graphEdges = Array.from(edges.values());
        
        return Promise.resolve({
          nodes: graphNodes,
          edges: graphEdges,
          executionTimeMs: 0,
        });
      },

      deleteNode(id: string): Promise<boolean> {
        const deleted = nodes.delete(id);
        // Also remove any edges connected to this node
        for (const [edgeId, edge] of edges.entries()) {
          if (edge.fromId === id || edge.toId === id) {
            edges.delete(edgeId);
          }
        }
        return Promise.resolve(deleted);
      },

      deleteEdge(id: string): Promise<boolean> {
        return Promise.resolve(edges.delete(id));
      },

      clear(): Promise<void> {
        nodes.clear();
        edges.clear();
        return Promise.resolve();
      },

      getStats(): Promise<{ nodes: number; edges: number }> {
        return Promise.resolve({
          nodes: nodes.size,
          edges: edges.size,
        });
      },
    };

    logger.debug('Created fallback graph store');
    return ok(store);
  }
}

// Singleton instance
export const databaseFacade = DatabaseFacade.getInstance();

// Convenience functions for easy access from foundation
export async function createDatabaseAdapter(
  type: DatabaseConfig['type']
): Promise<Result<DatabaseAdapter, Error>> {
  return await databaseFacade.createAdapter(type);
}

export async function createKeyValueStore(): Promise<
  Result<KeyValueStorage, Error>
> {
  return await databaseFacade.createKeyValueStore();
}

export async function createVectorStore(): Promise<Result<VectorStorage, Error>> {
  return await databaseFacade.createVectorStore();
}

export async function createGraphStore(): Promise<Result<GraphStorage, Error>> {
  return await databaseFacade.createGraphStore();
}

export function getDatabaseCapability(): CapabilityLevel {
  return databaseFacade.getCapability();
}

// Export types for external use - already exported above as interfaces
