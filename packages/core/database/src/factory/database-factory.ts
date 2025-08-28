/**
 * Database Factory
 *
 * Creates database connections and storage instances with proper configuration,
 * validation, and fallback mechanisms for enterprise applications.
 */

import { URL} from 'node:url';
import { KuzuAdapter} from '../adapters/kuzu-adapter.js';
import { LanceDBAdapter} from '../adapters/lancedb-adapter.js';
import { SQLiteAdapter} from '../adapters/sqlite-adapter.js';
import { getLogger} from '../logger.js';
import { GraphStorageImpl} from '../storage/graph-storage.js';
import { KeyValueStorageImpl} from '../storage/key-value-storage.js';
import { SQLStorageImpl} from '../storage/sql-storage.js';
import { VectorStorageImpl} from '../storage/vector-storage.js';
import type {
  DatabaseConfig,
  DatabaseConnection,
  DatabaseFactory,
  DatabaseType,
  GraphStorage,
  KeyValueStorage,
  SqlStorage,
  StorageType,
  VectorStorage,
} from '../types/index.js';

const logger = getLogger('database-factory');

export class DatabaseFactoryImpl implements DatabaseFactory {
  private readonly connectionCache = new Map<string, DatabaseConnection>();
  private readonly storageCache = new Map<
    string,
    KeyValueStorage | SqlStorage | VectorStorage | GraphStorage
  >();

  /**
   * Creates a database connection based on configuration
   */
  createConnection(config:DatabaseConfig): DatabaseConnection {
    const cacheKey = this.generateCacheKey(config);

    // Return cached connection if available and still connected
    const cachedConnection = this.connectionCache.get(cacheKey);
    if (cachedConnection?.isConnected()) {
      logger.debug('Returning cached database connection', {
        type:config.type,
        database:config.database,
});
      return cachedConnection;
}

    logger.info('Creating new database connection', {
      type:config.type,
      database:config.database,
});

    // Validate configuration
    this.validateConfig(config);

    // Create appropriate adapter
    const connection = this.createConnectionAdapter(config);

    // Cache the connection
    this.connectionCache.set(cacheKey, connection);

    return connection;
}

  /**
   * Creates a key-value storage instance
   */
  createKeyValueStorage(config:DatabaseConfig): KeyValueStorage {
    const cacheKey = `kv-${this.generateCacheKey(config)}`;

    const cached = this.storageCache.get(cacheKey);
    if (cached) {
      logger.debug('Returning cached key-value storage', {
        type:config.type,
        database:config.database,
});
      return cached as KeyValueStorage;
}

    logger.info('Creating new key-value storage', {
      type:config.type,
      database:config.database,
});

    const connection = this.createConnection(config);
    const storage = new KeyValueStorageImpl(connection, config);

    this.storageCache.set(cacheKey, storage);
    return storage;
}

  /**
   * Creates a SQL storage instance
   */
  createSqlStorage(config:DatabaseConfig): SqlStorage {
    const cacheKey = `sql-${this.generateCacheKey(config)}`;

    const cached = this.storageCache.get(cacheKey);
    if (cached) {
      logger.debug('Returning cached SQL storage', {
        type:config.type,
        database:config.database,
});
      return cached as SqlStorage;
}

    logger.info('Creating new SQL storage', {
      type:config.type,
      database:config.database,
});

    const connection = this.createConnection(config);
    const storage = new SQLStorageImpl(connection, config);

    this.storageCache.set(cacheKey, storage);
    return storage;
}

  /**
   * Creates a vector storage instance
   */
  createVectorStorage(config:DatabaseConfig): VectorStorage {
    const cacheKey = `vector-${this.generateCacheKey(config)}`;

    const cached = this.storageCache.get(cacheKey);
    if (cached) {
      logger.debug('Returning cached vector storage', {
        type:config.type,
        database:config.database,
});
      return cached as VectorStorage;
}

    logger.info('Creating new vector storage', {
      type:config.type,
      database:config.database,
});

    const connection = this.createConnection(config);
    const storage = new VectorStorageImpl(connection, config);

    this.storageCache.set(cacheKey, storage);
    return storage;
}

  /**
   * Creates a graph storage instance
   */
  createGraphStorage(config:DatabaseConfig): GraphStorage {
    const cacheKey = `graph-${this.generateCacheKey(config)}`;

    const cached = this.storageCache.get(cacheKey);
    if (cached) {
      logger.debug('Returning cached graph storage', {
        type:config.type,
        database:config.database,
});
      return cached as GraphStorage;
}

    logger.info('Creating new graph storage', {
      type:config.type,
      database:config.database,
});

    const connection = this.createConnection(config);
    const storage = new GraphStorageImpl(connection, config);

    this.storageCache.set(cacheKey, storage);
    return storage;
}

  /**
   * Creates storage configuration for given storage type
   */
  createStorageConfig(
    storageType:StorageType,
    database:string,
    baseConfig?:Partial<DatabaseConfig>
  ):DatabaseConfig {
    // Determine recommended backend for storage type
    const recommendedBackend = this.getRecommendedBackend(storageType);

    // Create configuration
    const config:DatabaseConfig = {
      type:recommendedBackend,
      database:`${database}_${storageType}`,
      ...baseConfig,
      options:{
        // Storage-specific settings
        ...this.getStorageSettings(storageType, recommendedBackend),
        ...baseConfig?.options,
},
};

    return config;
}

  /**
   * Validates if a database type supports a storage paradigm
   */
  supportsStorageType(
    databaseType:DatabaseType,
    storageType:StorageType
  ):boolean {
    const supportMatrix:Record<DatabaseType, StorageType[]> = {
      sqlite:['keyValue',    'sql'],
      lancedb:['vector'],
      kuzu:['graph'],
      memory:['keyValue',    'sql'],
};

    return supportMatrix[databaseType]?.includes(storageType) || false;
}

  /**
   * Gets recommended database type for storage paradigm
   */
  getRecommendedBackend(storageType:StorageType): DatabaseType {
    const recommendedBackends:Record<StorageType, DatabaseType> = {
      keyValue: 'sqlite',      sql: 'sqlite',      vector: 'lancedb',      graph: 'kuzu',      hybrid: 'sqlite', // Default fallback
};

    return recommendedBackends[storageType];
}

  /**
   * Clears connection and storage caches
   */
  async clearCache():Promise<void> {
    logger.info('Clearing database factory caches');

    // Disconnect all cached connections
    const disconnectPromises:Promise<void>[] = [];

    for (const [key, connection] of this.connectionCache) {
      if (connection.isConnected()) {
        disconnectPromises.push(
          connection.disconnect().catch((error) => {
            logger.error('Failed to disconnect cached connection', {
              key,
              error:error instanceof Error ? error.message : String(error),
});
})
        );
}
}

    await Promise.allSettled(disconnectPromises);

    this.connectionCache.clear();
    this.storageCache.clear();

    logger.info('Database factory caches cleared');
}

  /**
   * Gets factory statistics
   */
  getStatistics():{
    connectionCacheSize:number;
    storageCacheSize:number;
    connectedConnections:number;
} {
    let connectedConnections = 0;

    for (const connection of this.connectionCache.values()) {
      if (connection.isConnected()) {
        connectedConnections++;
}
}

    return {
      connectionCacheSize:this.connectionCache.size,
      storageCacheSize:this.storageCache.size,
      connectedConnections,
};
}

  // Private methods

  private createConnectionAdapter(config:DatabaseConfig): DatabaseConnection {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteAdapter(config);

      case 'lancedb':
        return new LanceDBAdapter(config);

      case 'kuzu':
        return new KuzuAdapter(config);

      case 'memory':
        // Use SQLite in-memory mode
        return new SQLiteAdapter({
          ...config,
          database: ':memory:',});

      default:
        throw new Error(`Unsupported database type:${config.type}`);
}
}

  private validateConfig(config:DatabaseConfig): void {
    if (!config.type) {
      throw new Error('Database type is required');
}

    if (!config.database) {
      throw new Error('Database identifier is required');
}

    // Type-specific validations
    switch (config.type) {
      case 'sqlite':
        if (
          config.database !== ':memory:' &&
          !config.database.endsWith('.db')
        ) {
          logger.warn(
            'SQLite database should typically end with .db extension',            {
              database:config.database,
}
          );
}
        break;

      case 'lancedb':
        // Validate vector database configuration
        if (config.options?.storageOptions) {
          const storageOptions = config.options.storageOptions as Record<
            string,
            unknown
          >;
          if (
            storageOptions.objectStoreUrl &&
            !this.isValidUrl(String(storageOptions.objectStoreUrl))
          ) {
            throw new Error('Invalid object store URL for LanceDB');
}
}
        break;

      case 'kuzu':
        // Validate graph database path
        if (!config.database || config.database.length === 0) {
          throw new Error('Kuzu requires a valid database path');
}
        break;
}

    // Validate pool configuration if provided
    if (config.pool) {
      this.validatePoolConfig(config.pool);
}

    // Validate retry policy if provided
    if (config.retryPolicy) {
      this.validateRetryPolicy(config.retryPolicy);
}
}

  private validatePoolConfig(
    pool:Partial<{
      min:number;
      max:number;
      acquireTimeoutMillis:number;
}>
  ):void {
    if (pool.min !== undefined && pool.min < 0) {
      throw new Error('Pool minimum size cannot be negative');
}

    if (pool.max !== undefined && pool.max < 1) {
      throw new Error('Pool maximum size must be at least 1');
}

    if (
      pool.min !== undefined &&
      pool.max !== undefined &&
      pool.min > pool.max
    ) {
      throw new Error('Pool minimum size cannot be greater than maximum size');
}

    if (
      pool.acquireTimeoutMillis !== undefined &&
      pool.acquireTimeoutMillis < 100
    ) {
      throw new Error('Pool acquire timeout must be at least 100ms');
}
}

  private validateRetryPolicy(
    retryPolicy:Partial<{
      maxRetries:number;
      initialDelayMs:number;
      maxDelayMs:number;
}>
  ):void {
    if (retryPolicy.maxRetries !== undefined && retryPolicy.maxRetries < 0) {
      throw new Error('Max retries cannot be negative');
}

    if (
      retryPolicy.initialDelayMs !== undefined &&
      retryPolicy.initialDelayMs < 1
    ) {
      throw new Error('Initial delay must be at least 1ms');
}

    if (retryPolicy.maxDelayMs !== undefined && retryPolicy.maxDelayMs < 100) {
      throw new Error('Max delay must be at least 100ms');
}

    if (
      retryPolicy.initialDelayMs !== undefined &&
      retryPolicy.maxDelayMs !== undefined &&
      retryPolicy.initialDelayMs > retryPolicy.maxDelayMs
    ) {
      throw new Error('Initial delay cannot be greater than max delay');
}
}

  private getStorageSettings(
    storageType:StorageType,
    databaseType:DatabaseType
  ):Record<string, unknown> {
    const settings:Record<string, Record<string, unknown>> = {
      keyValue:{
        sqlite:{
          // Settings for key-value workload
          pragma:{
            cache_size:2000,
            journal_mode: 'WAL',            synchronous: 'NORMAL',},
},
},
      sql:{
        sqlite:{
          // Settings for OLTP workload
          pragma:{
            cache_size:5000,
            journal_mode: 'WAL',            synchronous: 'NORMAL',            foreign_keys: 'ON',},
},
},
      vector:{
        lancedb:{
          // Settings for vector operations
          writeMode: 'append',          readConsistencyInterval:1000,
},
},
      graph:{
        kuzu:{
          // Settings for graph operations
          bufferPoolSize:2 * 1024 * 1024 * 1024, // 2GB
          maxNumThreads:8,
          enableCompression:true,
},
},
};

    return (settings[storageType]?.[databaseType] || {}) as Record<
      string,
      unknown
    >;
}

  private generateCacheKey(config:DatabaseConfig): string {
    const keyParts = [
      config.type,
      config.database,
      JSON.stringify(config.options || {}),
      JSON.stringify(config.pool || {}),
      JSON.stringify(config.retryPolicy || {}),
];

    return keyParts.join('|');
}

  private isValidUrl(url:string): boolean {
    try {
      new URL(url);
      return true;
} catch {
      return false;
}
}
}

// Singleton factory instance
let factoryInstance:DatabaseFactoryImpl | null = null;

/**
 * Gets the singleton database factory instance
 */
export function getDatabaseFactory():DatabaseFactoryImpl {
  if (!factoryInstance) {
    factoryInstance = new DatabaseFactoryImpl();
}
  return factoryInstance;
}

/**
 * Creates a database connection using the factory
 */
export function createDatabaseConnection(
  config:DatabaseConfig
):DatabaseConnection {
  return getDatabaseFactory().createConnection(config);
}

/**
 * Creates storage configuration
 */
export function createStorageConfig(
  storageType:StorageType,
  database:string,
  baseConfig?:Partial<DatabaseConfig>
):DatabaseConfig {
  return getDatabaseFactory().createStorageConfig(
    storageType,
    database,
    baseConfig
  );
}

// Backward compatibility aliases
export const createOptimalConfig = createStorageConfig;
export const createOptimalStorageConfig = createStorageConfig;

/**
 * Helper function to create storage instances with recommended backends
 */
export function createStorage<T extends StorageType>(
  type:T,
  database:string,
  baseConfig?:Partial<DatabaseConfig>
): T extends 'keyValue' ? KeyValueStorage
  : T extends 'sql' ? SqlStorage
  : T extends 'vector' ? VectorStorage
  : T extends 'graph' ? GraphStorage
  : never {
  const factory = getDatabaseFactory();
  const config = factory.createStorageConfig(type, database, baseConfig);

  switch (type) {
    case 'keyValue':
      return factory.createKeyValueStorage(config);
    case 'sql':
      return factory.createSqlStorage(config);
    case 'vector':
      return factory.createVectorStorage(config);
    case 'graph':
      return factory.createGraphStorage(config);
    default:
      throw new Error(`Unsupported storage type:${type}`);
}
}
