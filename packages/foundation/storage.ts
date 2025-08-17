/**
 * @fileoverview Foundation Storage Interface
 * 
 * Provides a clean, type-safe interface for foundation package storage needs.
 * Hybrid approach with both simple and advanced storage access:
 * 
 * **Simple Storage (4 types):**
 * - KV: Key-value storage with JSON serialization  
 * - SQL: Structured data storage for relational data
 * - Vector: Vector storage for embeddings and similarity search
 * - Graph: Graph storage for relationships and connected data
 * 
 * **Hybrid Storage (5th type):**
 * - Multi-instance management for complex applications
 * - Cross-namespace coordination and operations
 * - Multiple databases of same type with different namespaces
 * 
 * All storage types use their dedicated database systems - no in-memory fallbacks.
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 2.0.0
 * 
 * @example
 * ```typescript
 * import { getDatabaseAccess, storage } from '@claude-zen/foundation';
 * 
 * // Simple usage - single instances
 * const kv = await storage.getNamespacedKV('my-lib');
 * await kv.set('key', { data: 'value' });
 * 
 * // Hybrid usage - multiple instances & coordination  
 * const hybrid = storage.getHybrid();
 * const multiSQL = await hybrid.createMultipleSQL(['users', 'analytics']);
 * await hybrid.executeAcrossAll(async (storage) => {
 *   await storage.kv.set('status', 'synced');
 * }, ['app1', 'app2']);
 * ```
 */

import { getLogger } from './logging';

const logger = getLogger('foundation-storage');

/**
 * Custom error types for storage operations
 */
export class StorageError extends Error {
  /**
   * Creates a new StorageError
   * @param message - Error message
   * @param cause - Optional underlying error
   */
  constructor(message: string, public override cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

export class DatabaseConnectionError extends StorageError {
  /**
   * Creates a new DatabaseConnectionError
   * @param message - Error message
   * @param cause - Optional underlying error
   */
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DatabaseConnectionError';
  }
}


/**
 * Database module interface for accessing real database backends.
 * Provides KV storage plus specialized storage types.
 * 
 * @internal
 */
interface DatabaseModule {
  /**
   * Get unified KV storage for a namespace (with JSON serialization)
   * @param namespace - Storage namespace
   * @returns Promise resolving to KeyValueStore interface with JSON support
   */
  getKVStorage(namespace: string): Promise<KeyValueStore>;

  /**
   * Get SQL database for a namespace
   * @param namespace - Storage namespace
   * @returns Promise resolving to SQL database interface
   */
  getSQLDatabase(namespace: string): Promise<any>;

  /**
   * Get vector database for a namespace
   * @param namespace - Storage namespace
   * @returns Promise resolving to vector database interface
   */
  getVectorDatabase(namespace: string): Promise<any>;

  /**
   * Get graph database for a namespace
   * @param namespace - Storage namespace
   * @returns Promise resolving to graph database interface
   */
  getGraphDatabase(namespace: string): Promise<any>;
}

/**
 * Key-value storage interface for foundation storage needs.
 * Supports JSON serialization and provides rich querying capabilities.
 * 
 * @public
 * @example
 * ```typescript
 * const kv = await storage.getNamespacedKV('my-app');
 * 
 * // Store different data types
 * await kv.set('user:123', { name: 'John', age: 30 });
 * await kv.set('config:debug', true);
 * await kv.set('metrics:count', 42);
 * 
 * // Retrieve and check existence
 * const user = await kv.get('user:123');
 * const hasConfig = await kv.has('config:debug');
 * const allKeys = await kv.keys();
 * ```
 */
export interface KeyValueStore {
  /**
   * Retrieves a value by key
   * 
   * @param key - The key to retrieve
   * @returns Promise resolving to the value as string, or null if not found
   * @throws {StorageError} When storage operation fails
   * 
   * @example
   * ```typescript
   * const value = await kv.get('user:123');
   * if (value) {
   *   const user = JSON.parse(value);
   *   console.log(user.name);
   * }
   * ```
   */
  get(key: string): Promise<string | null>;

  /**
   * Stores a value with automatic JSON serialization
   * 
   * @param key - The key to store under
   * @param value - The value to store (will be JSON serialized)
   * @returns Promise that resolves when storage is complete
   * @throws {StorageError} When storage operation fails
   * 
   * @example
   * ```typescript
   * await kv.set('user:123', { name: 'John', age: 30 });
   * await kv.set('count', 42);
   * await kv.set('enabled', true);
   * ```
   */
  set(key: string, value: string | number | boolean | Record<string, unknown>): Promise<void>;

  /**
   * Deletes a key-value pair
   * 
   * @param key - The key to delete
   * @returns Promise resolving to true if deleted, false if key didn't exist
   * @throws {StorageError} When storage operation fails
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clears all keys in this namespace
   * 
   * @returns Promise that resolves when clearing is complete
   * @throws {StorageError} When storage operation fails
   */
  clear(): Promise<void>;

  /**
   * Checks if a key exists
   * 
   * @param key - The key to check
   * @returns Promise resolving to true if key exists, false otherwise
   * @throws {StorageError} When storage operation fails
   */
  has(key: string): Promise<boolean>;

  /**
   * Gets all keys in this namespace
   * 
   * @returns Promise resolving to array of all keys
   * @throws {StorageError} When storage operation fails
   */
  keys(): Promise<string[]>;
}

/**
 * Key-value storage interface for database backend operations.
 * Provides string-based storage with optional pattern matching.
 * 
 * @public
 * @example
 * ```typescript
 * const sql = await storage.getNamespacedSQL('my-app');
 * 
 * // Store structured data as JSON strings
 * await sql.set('users_table', JSON.stringify(users));
 * await sql.set('config_table', JSON.stringify(config));
 * 
 * // Pattern-based operations
 * const tableKeys = await sql.keys('*_table');
 * await sql.clear('temp_*');
 * ```
 */
export interface KeyValueStorage {
  /**
   * Retrieves a value by key
   * 
   * @param key - The key to retrieve
   * @returns Promise resolving to the value as string, or null if not found
   * @throws {StorageError} When storage operation fails
   */
  get(key: string): Promise<string | null>;

  /**
   * Stores a string value
   * 
   * @param key - The key to store under
   * @param value - The string value to store
   * @returns Promise that resolves when storage is complete
   * @throws {StorageError} When storage operation fails
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Deletes a key-value pair
   * 
   * @param key - The key to delete
   * @returns Promise resolving to true if deleted, false if key didn't exist
   * @throws {StorageError} When storage operation fails
   */
  delete(key: string): Promise<boolean>;

  /**
   * Gets keys matching an optional pattern
   * 
   * @param pattern - Optional pattern to filter keys (implementation-specific)
   * @returns Promise resolving to array of matching keys
   * @throws {StorageError} When storage operation fails
   * 
   * @example
   * ```typescript
   * // Get all keys
   * const allKeys = await storage.keys();
   * 
   * // Get keys matching pattern (if supported by implementation)
   * const userKeys = await storage.keys('user:*');
   * ```
   */
  keys(pattern?: string): Promise<string[]>;

  /**
   * Clears keys matching an optional pattern
   * 
   * @param pattern - Optional pattern to filter keys for deletion
   * @returns Promise that resolves when clearing is complete
   * @throws {StorageError} When storage operation fails
   * 
   * @example
   * ```typescript
   * // Clear all keys
   * await storage.clear();
   * 
   * // Clear temporary keys only
   * await storage.clear('temp:*');
   * ```
   */
  clear(pattern?: string): Promise<void>;
}

/**
 * Database access interface using foundation storage.
 * Provides KV storage plus specialized database types.
 * 
 * @public
 */
export interface DatabaseAccess {
  /**
   * Gets key-value storage with JSON serialization
   * 
   * @param namespace - Storage namespace for isolation
   * @returns Promise resolving to KeyValueStore interface
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const kv = await dbAccess.getKV('my-app');
   * await kv.set('user:123', { name: 'John', active: true });
   * await kv.set('config', { debug: true });
   * ```
   */
  getKV(namespace: string): Promise<KeyValueStore>;

  /**
   * Gets SQL database for structured queries
   * 
   * @param namespace - Storage namespace for isolation
   * @returns Promise resolving to SQL database interface
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const sql = await dbAccess.getSQL('my-app');
   * await sql.query('SELECT * FROM users WHERE active = ?', [true]);
   * ```
   */
  getSQL(namespace: string): Promise<any>;

  /**
   * Gets vector database for embedding operations
   * 
   * @param namespace - Storage namespace for isolation
   * @returns Promise resolving to vector database interface
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const vector = await dbAccess.getVector('embeddings');
   * await vector.similaritySearch(queryVector, { limit: 10 });
   * ```
   */
  getVector(namespace: string): Promise<any>;

  /**
   * Gets graph database for relationship queries
   * 
   * @param namespace - Storage namespace for isolation
   * @returns Promise resolving to graph database interface
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const graph = await dbAccess.getGraph('social');
   * await graph.traverse(startNode, 'FOLLOWS', 3);
   * ```
   */
  getGraph(namespace: string): Promise<any>;

  /**
   * Gets hybrid storage manager for complex multi-instance coordination
   * 
   * @returns HybridStorage interface for advanced storage management
   * 
   * @example
   * ```typescript
   * const hybrid = await dbAccess.getHybrid();
   * const multiSQL = await hybrid.createMultipleSQL(['users', 'analytics', 'cache']);
   * ```
   */
  getHybrid(): HybridStorage;
}



/**
 * Database access implementation that delegates to the actual database package.
 * Provides caching, error handling, and unified KV storage.
 * 
 * @internal
 */
class DatabaseAccessImpl implements DatabaseAccess {
  /** @internal Cache for KeyValueStore instances by namespace */
  private readonly kvCache = new Map<string, KeyValueStore>();
  
  /** @internal Database module instance */
  private databaseModule: DatabaseModule | null = null;

  /**
   * Loads and caches the database module
   * 
   * @returns Promise resolving to the database module
   * @throws {DatabaseConnectionError} When database package cannot be loaded
   * @internal
   */
  private async getDatabaseModule(): Promise<DatabaseModule> {
    if (!this.databaseModule) {
      try {
        // Import the database package at runtime
        this.databaseModule = await import('@claude-zen/database') as DatabaseModule;
        logger.debug('Successfully loaded @claude-zen/database package');
      } catch (error) {
        logger.error('Failed to load @claude-zen/database package:', error);
        throw new DatabaseConnectionError(
          'Database package not available. Foundation requires @claude-zen/database for storage operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.databaseModule;
  }

  /**
   * Creates a safe cache key to avoid collisions
   * 
   * @param namespace - Storage namespace
   * @returns Safe cache key
   * @internal
   */
  private createCacheKey(namespace: string): string {
    // Use base64 encoding to avoid delimiter collision issues
    return Buffer.from(namespace).toString('base64');
  }

  /** @inheritdoc */
  async getKV(namespace: string): Promise<KeyValueStore> {
    const cacheKey = this.createCacheKey(namespace);
    const cached = this.kvCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const db = await this.getDatabaseModule();
      
      // Get KV storage from database package - no fallback
      const kvStorage = await db.getKVStorage(namespace);
      
      // Validate that it implements our interface
      if (kvStorage && 
          typeof kvStorage.get === 'function' &&
          typeof kvStorage.set === 'function' &&
          typeof kvStorage.delete === 'function') {
        this.kvCache.set(cacheKey, kvStorage);
        logger.debug(`Created KV storage for namespace: ${namespace}`);
        return kvStorage;
      } else {
        throw new DatabaseConnectionError(
          `Database KV storage returned invalid interface for namespace '${namespace}'`
        );
      }
    } catch (error) {
      logger.error(`Failed to create KV store for namespace ${namespace}:`, error);
      throw new DatabaseConnectionError(
        `Failed to create KV store for namespace '${namespace}'. Database must be available for KV operations.`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /** @inheritdoc */
  async getSQL(namespace: string): Promise<any> {
    try {
      const db = await this.getDatabaseModule();
      const sqlDatabase = await db.getSQLDatabase(namespace);
      logger.debug(`Created SQL database for namespace: ${namespace}`);
      return sqlDatabase;
    } catch (error) {
      logger.error(`Failed to create SQL database for namespace ${namespace}:`, error);
      throw new DatabaseConnectionError(
        `Failed to create SQL database for namespace '${namespace}'.`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /** @inheritdoc */
  async getVector(namespace: string): Promise<any> {
    try {
      const db = await this.getDatabaseModule();
      const vectorDatabase = await db.getVectorDatabase(namespace);
      logger.debug(`Created vector database for namespace: ${namespace}`);
      return vectorDatabase;
    } catch (error) {
      logger.error(`Failed to create vector database for namespace ${namespace}:`, error);
      throw new DatabaseConnectionError(
        `Failed to create vector database for namespace '${namespace}'.`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /** @inheritdoc */
  async getGraph(namespace: string): Promise<any> {
    try {
      const db = await this.getDatabaseModule();
      const graphDatabase = await db.getGraphDatabase(namespace);
      logger.debug(`Created graph database for namespace: ${namespace}`);
      return graphDatabase;
    } catch (error) {
      logger.error(`Failed to create graph database for namespace ${namespace}:`, error);
      throw new DatabaseConnectionError(
        `Failed to create graph database for namespace '${namespace}'.`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /** @inheritdoc */
  getHybrid(): HybridStorage {
    return new HybridStorageImpl(this);
  }
}

/**
 * Hybrid storage implementation for complex multi-instance coordination
 * 
 * @internal
 */
class HybridStorageImpl implements HybridStorage {
  constructor(private dbAccess: DatabaseAccess) {}

  /** @inheritdoc */
  async getKV(namespace: string): Promise<KeyValueStore> {
    return this.dbAccess.getKV(namespace);
  }

  /** @inheritdoc */
  async getSQL(namespace: string): Promise<any> {
    return this.dbAccess.getSQL(namespace);
  }

  /** @inheritdoc */
  async getVector(namespace: string): Promise<any> {
    return this.dbAccess.getVector(namespace);
  }

  /** @inheritdoc */
  async getGraph(namespace: string): Promise<any> {
    return this.dbAccess.getGraph(namespace);
  }

  /** @inheritdoc */
  async getAllForNamespace(namespace: string): Promise<AllStorageTypes> {
    return {
      kv: await this.getKV(namespace),
      sql: await this.getSQL(namespace),
      vector: await this.getVector(namespace),
      graph: await this.getGraph(namespace),
    };
  }

  /** @inheritdoc */
  async createMultipleSQL(namespaces: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const namespace of namespaces) {
      result[namespace] = await this.getSQL(namespace);
    }
    return result;
  }

  /** @inheritdoc */
  async createMultipleVector(namespaces: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const namespace of namespaces) {
      result[namespace] = await this.getVector(namespace);
    }
    return result;
  }

  /** @inheritdoc */
  async createMultipleGraph(namespaces: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const namespace of namespaces) {
      result[namespace] = await this.getGraph(namespace);
    }
    return result;
  }

  /** @inheritdoc */
  async executeAcrossAll<T>(
    operation: (storage: AllStorageTypes) => Promise<T>,
    namespaces: string[]
  ): Promise<T[]> {
    const results: T[] = [];
    for (const namespace of namespaces) {
      const storage = await this.getAllForNamespace(namespace);
      const result = await operation(storage);
      results.push(result);
    }
    return results;
  }
}

/** @internal Singleton instance for database access */
let globalDatabaseAccess: DatabaseAccess | null = null;

/**
 * Gets the global database access instance.
 * Uses singleton pattern to ensure consistent access across the application.
 * 
 * @returns DatabaseAccess instance
 * @public
 * 
 * @example
 * ```typescript
 * import { getDatabaseAccess } from '@claude-zen/foundation';
 * 
 * const dbAccess = getDatabaseAccess();
 * const kv = await dbAccess.getKV('my-app');
 * const sql = await dbAccess.getSQLite('my-app');
 * ```
 */
export function getDatabaseAccess(): DatabaseAccess {
  if (!globalDatabaseAccess) {
    globalDatabaseAccess = new DatabaseAccessImpl();
    logger.info('Initialized global database access');
  }
  return globalDatabaseAccess;
}

/**
 * Gets a simple KV store for a namespace.
 * Convenience function for quick access to key-value storage.
 * 
 * @param namespace - Storage namespace for isolation
 * @returns Promise resolving to KeyValueStore instance
 * @throws {DatabaseConnectionError} When database connection fails
 * @public
 * 
 * @example
 * ```typescript
 * import { getKVStore } from '@claude-zen/foundation';
 * 
 * const kv = await getKVStore('cache');
 * await kv.set('user:123', { name: 'John', active: true });
 * const user = await kv.get('user:123');
 * ```
 */
export async function getKVStore(namespace: string): Promise<KeyValueStore> {
  const dbAccess = getDatabaseAccess();
  return dbAccess.getKV(namespace);
}

/**
 * Collection of storage types available for namespace-based access
 * 
 * @public
 */
export interface AllStorageTypes {
  /** Key-value storage for simple caching and configuration */
  kv: KeyValueStore;
  /** SQL database for structured queries */
  sql: any;
  /** Vector database for embeddings and similarity search */
  vector: any;
  /** Graph database for relationships and connected data */
  graph: any;
}

/**
 * Hybrid storage manager for complex apps that need multiple instances
 * and coordination between storage types.
 * 
 * @public
 */
export interface HybridStorage {
  /** Get KV storage with custom namespace */
  getKV(namespace: string): Promise<KeyValueStore>;
  
  /** Get SQL database with custom namespace */
  getSQL(namespace: string): Promise<any>;
  
  /** Get vector database with custom namespace */
  getVector(namespace: string): Promise<any>;
  
  /** Get graph database with custom namespace */
  getGraph(namespace: string): Promise<any>;
  
  /** Get all storage types for a specific namespace */
  getAllForNamespace(namespace: string): Promise<AllStorageTypes>;
  
  /** Create multiple instances of same storage type */
  createMultipleSQL(namespaces: string[]): Promise<Record<string, any>>;
  createMultipleVector(namespaces: string[]): Promise<Record<string, any>>;
  createMultipleGraph(namespaces: string[]): Promise<Record<string, any>>;
  
  /** Coordinate operations across multiple storage types */
  executeAcrossAll<T>(
    operation: (storage: AllStorageTypes) => Promise<T>,
    namespaces: string[]
  ): Promise<T[]>;
}

/**
 * Generic convenience functions for common database operations.
 * Provides namespace-based access to different storage types.
 * 
 * @public
 */
export const storage = {
  /**
   * Gets KV store for a specific namespace with 'lib:' prefix
   * 
   * @param libName - Library name for namespacing
   * @returns Promise resolving to KeyValueStore instance
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const kv = await storage.getNamespacedKV('my-library');
   * await kv.set('config', { debug: true });
   * ```
   */
  getNamespacedKV: async (libName: string): Promise<KeyValueStore> => {
    return getKVStore(`lib:${libName}`);
  },

  /**
   * Gets SQL database for a specific namespace with 'lib:' prefix
   * 
   * @param libName - Library name for namespacing
   * @returns Promise resolving to SQL database interface
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const sql = await storage.getNamespacedSQL('my-library');
   * await sql.query('SELECT * FROM users WHERE active = ?', [true]);
   * ```
   */
  getNamespacedSQL: async (libName: string): Promise<any> => {
    const dbAccess = getDatabaseAccess();
    return dbAccess.getSQL(`lib:${libName}`);
  },

  /**
   * Gets vector database for a specific namespace with 'lib:' prefix
   * 
   * @param libName - Library name for namespacing
   * @returns Promise resolving to vector database interface
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const vector = await storage.getNamespacedVector('embeddings');
   * await vector.similaritySearch(queryVector, { limit: 10 });
   * ```
   */
  getNamespacedVector: async (libName: string): Promise<any> => {
    const dbAccess = getDatabaseAccess();
    return dbAccess.getVector(`lib:${libName}`);
  },

  /**
   * Gets graph database for a specific namespace with 'lib:' prefix
   * 
   * @param libName - Library name for namespacing
   * @returns Promise resolving to graph database interface
   * @throws {DatabaseConnectionError} When database connection fails
   * 
   * @example
   * ```typescript
   * const graph = await storage.getNamespacedGraph('social-network');
   * await graph.traverse(startNode, 'FOLLOWS', 3);
   * ```
   */
  getNamespacedGraph: async (libName: string): Promise<any> => {
    const dbAccess = getDatabaseAccess();
    return dbAccess.getGraph(`lib:${libName}`);
  },

  /**
   * Gets all storage types for a specific namespace.
   * Useful when a library needs access to multiple database types.
   * 
   * @param namespace - Storage namespace for isolation
   * @returns Promise resolving to object containing all storage types
   * @throws {DatabaseConnectionError} When any database connection fails
   * 
   * @example
   * ```typescript
   * // For a neural programming library that needs all storage types
   * const allStorage = await storage.getAllStorageTypes('neural-lib');
   * 
   * // Use different storage for different purposes
   * await allStorage.kv.set('cache:result', result);
   * await allStorage.sql.query('INSERT INTO training_data VALUES (?)', [data]);
   * await allStorage.vector.similaritySearch(queryVector);
   * await allStorage.graph.traverse(startNode, 'FOLLOWS');
   * ```
   */
  getAllStorageTypes: async (namespace: string): Promise<AllStorageTypes> => {
    const dbAccess = getDatabaseAccess();
    return {
      kv: await dbAccess.getKV(namespace),
      sql: await dbAccess.getSQL(namespace),
      vector: await dbAccess.getVector(namespace), 
      graph: await dbAccess.getGraph(namespace),
    };
  },

  /**
   * Gets hybrid storage manager for complex multi-instance applications
   * 
   * @returns HybridStorage interface for advanced storage coordination
   * 
   * @example
   * ```typescript
   * // For complex apps that need multiple database instances
   * const hybrid = storage.getHybrid();
   * 
   * // Create multiple SQL databases
   * const multiSQL = await hybrid.createMultipleSQL(['users', 'analytics', 'cache']);
   * 
   * // Execute operation across multiple namespaces
   * await hybrid.executeAcrossAll(async (storage) => {
   *   await storage.kv.set('status', 'processing');
   *   return storage.sql.query('UPDATE status SET value = ?', ['active']);
   * }, ['app1', 'app2', 'app3']);
   * ```
   */
  getHybrid: (): HybridStorage => {
    const dbAccess = getDatabaseAccess();
    return dbAccess.getHybrid();
  },
};

/**
 * Default export for convenience access to storage functions
 * 
 * @public
 */
export default {
  getDatabaseAccess,
  getKVStore,
  storage,
  StorageError,
  DatabaseConnectionError,
} as const;