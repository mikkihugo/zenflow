/**
 * @fileoverview Simple Storage Interface for Standalone Libraries
 * 
 * Lightweight wrapper around the existing src/database system, providing
 * simple KV access and database operations for standalone libs. Delegates
 * to the comprehensive database infrastructure already built.
 */

import { getLogger } from './logging';

const logger = getLogger('shared-storage');

/**
 * Simple key-value interface for lib storage needs
 */
export interface SimpleKV {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
}

/**
 * Database access interface using existing database system
 */
export interface DatabaseAccess {
  getSQLite(namespace: string): Promise<any>;
  getLanceDB(namespace: string): Promise<any>;
  getKuzu(namespace: string): Promise<any>;
  getKV(namespace: string): Promise<SimpleKV>;
}

/**
 * Simple KV implementation using existing database infrastructure
 */
class NamespacedKV implements SimpleKV {
  private dao: any;
  private namespace: string;

  constructor(dao: any, namespace: string) {
    this.dao = dao;
    this.namespace = namespace;
  }

  async get(key: string): Promise<any> {
    try {
      const namespacedKey = `${this.namespace}:${key}`;
      const result = await this.dao.findBy({ key: namespacedKey });
      return result?.[0]?.value;
    } catch (error) {
      logger.warn(`KV get failed for key ${key}:`, error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const namespacedKey = `${this.namespace}:${key}`;
      const serializedValue = JSON.stringify(value);
      
      // Upsert operation
      await this.dao.createOrUpdate(
        { key: namespacedKey },
        { key: namespacedKey, value: serializedValue, updated_at: new Date() }
      );
    } catch (error) {
      logger.error(`KV set failed for key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const namespacedKey = `${this.namespace}:${key}`;
      const result = await this.dao.deleteBy({ key: namespacedKey });
      return result > 0;
    } catch (error) {
      logger.warn(`KV delete failed for key ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.dao.deleteBy({ key: { startsWith: `${this.namespace}:` } });
    } catch (error) {
      logger.error(`KV clear failed for namespace ${this.namespace}:`, error);
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  async keys(): Promise<string[]> {
    try {
      const results = await this.dao.findBy({ 
        key: { startsWith: `${this.namespace}:` } 
      });
      return results.map((item: any) => 
        item.key.substring(this.namespace.length + 1)
      );
    } catch (error) {
      logger.warn(`KV keys failed for namespace ${this.namespace}:`, error);
      return [];
    }
  }
}

/**
 * Database access implementation using existing src/database system
 */
class DatabaseAccessImpl implements DatabaseAccess {
  private daoCache = new Map<string, any>();

  async getSQLite(namespace: string): Promise<any> {
    const cacheKey = `sqlite:${namespace}`;
    if (this.daoCache.has(cacheKey)) {
      return this.daoCache.get(cacheKey);
    }

    try {
      // Use existing database system at runtime
      const daoFactoryPath = process.env['NODE_ENV'] === 'production' 
        ? '../../database/core/dao-factory'
        : '../../database/core/dao-factory';
      const { createDao } = await import(daoFactoryPath);
      const dao = await createDao(namespace, 'sqlite');
      this.daoCache.set(cacheKey, dao);
      return dao;
    } catch (error) {
      logger.error(`Failed to create SQLite DAO for namespace ${namespace}:`, error);
      throw error;
    }
  }

  async getLanceDB(namespace: string): Promise<any> {
    const cacheKey = `lancedb:${namespace}`;
    if (this.daoCache.has(cacheKey)) {
      return this.daoCache.get(cacheKey);
    }

    try {
      // Use existing database system at runtime
      const daoFactoryPath = process.env['NODE_ENV'] === 'production' 
        ? '../../database/core/dao-factory'
        : '../../database/core/dao-factory';
      const { createDao } = await import(daoFactoryPath);
      const dao = await createDao(namespace, 'lancedb');
      this.daoCache.set(cacheKey, dao);
      return dao;
    } catch (error) {
      logger.error(`Failed to create LanceDB DAO for namespace ${namespace}:`, error);
      throw error;
    }
  }

  async getKuzu(namespace: string): Promise<any> {
    const cacheKey = `kuzu:${namespace}`;
    if (this.daoCache.has(cacheKey)) {
      return this.daoCache.get(cacheKey);
    }

    try {
      // Use existing database system at runtime
      const daoFactoryPath = process.env['NODE_ENV'] === 'production' 
        ? '../../database/core/dao-factory'
        : '../../database/core/dao-factory';
      const { createDao } = await import(daoFactoryPath);
      const dao = await createDao(namespace, 'kuzu');
      this.daoCache.set(cacheKey, dao);
      return dao;
    } catch (error) {
      logger.error(`Failed to create Kuzu DAO for namespace ${namespace}:`, error);
      throw error;
    }
  }

  async getKV(namespace: string): Promise<SimpleKV> {
    const cacheKey = `kv:${namespace}`;
    if (this.daoCache.has(cacheKey)) {
      return this.daoCache.get(cacheKey);
    }

    try {
      // Use SQLite as backing store for KV
      const sqliteDao = await this.getSQLite('kv_store');
      const kv = new NamespacedKV(sqliteDao, namespace);
      this.daoCache.set(cacheKey, kv);
      return kv;
    } catch (error) {
      logger.error(`Failed to create KV store for namespace ${namespace}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let globalDatabaseAccess: DatabaseAccess | null = null;

/**
 * Get global database access instance
 */
export function getDatabaseAccess(): DatabaseAccess {
  if (!globalDatabaseAccess) {
    globalDatabaseAccess = new DatabaseAccessImpl();
    logger.info('Initialized global database access');
  }
  return globalDatabaseAccess;
}

/**
 * Get simple KV store for a namespace
 */
export async function getKVStore(namespace: string): Promise<SimpleKV> {
  const dbAccess = getDatabaseAccess();
  return dbAccess.getKV(namespace);
}

/**
 * Convenience functions for common database operations
 */
export const storage = {
  /**
   * Get KV store for a specific lib
   */
  getLibKV: async (libName: string): Promise<SimpleKV> => {
    return getKVStore(`lib:${libName}`);
  },

  /**
   * Get SQLite DAO for a specific lib
   */
  getLibSQLite: async (libName: string): Promise<any> => {
    const dbAccess = getDatabaseAccess();
    return dbAccess.getSQLite(`lib:${libName}`);
  },

  /**
   * Get LanceDB DAO for a specific lib (vector operations)
   */
  getLibLanceDB: async (libName: string): Promise<any> => {
    const dbAccess = getDatabaseAccess();
    return dbAccess.getLanceDB(`lib:${libName}`);
  },

  /**
   * Get Kuzu DAO for a specific lib (graph operations)
   */
  getLibKuzu: async (libName: string): Promise<any> => {
    const dbAccess = getDatabaseAccess();
    return dbAccess.getKuzu(`lib:${libName}`);
  },

  /**
   * Quick setup for DSPy (needs all three database types)
   */
  getDSPyStorage: async (): Promise<{
    kv: SimpleKV;
    sqlite: any;
    lancedb: any;
    kuzu: any;
  }> => {
    const dbAccess = getDatabaseAccess();
    return {
      kv: await dbAccess.getKV('dspy'),
      sqlite: await dbAccess.getSQLite('dspy'),
      lancedb: await dbAccess.getLanceDB('dspy'),
      kuzu: await dbAccess.getKuzu('dspy'),
    };
  },

  /**
   * Quick setup for swarm coordination
   */
  getSwarmStorage: async (): Promise<{
    kv: SimpleKV;
    coordination: any;
  }> => {
    const dbAccess = getDatabaseAccess();
    return {
      kv: await dbAccess.getKV('swarm'),
      coordination: await dbAccess.getSQLite('swarm_coordination'),
    };
  },
};

// Default export for convenience
export default {
  getDatabaseAccess,
  getKVStore,
  storage,
};