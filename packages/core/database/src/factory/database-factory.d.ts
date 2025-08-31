/**
 * Database Factory
 *
 * Creates database connections and storage instances with proper configuration,
 * validation, and fallback mechanisms for enterprise applications.
 */
import type { DatabaseConfig, DatabaseConnection, DatabaseFactory, DatabaseType, GraphStorage, KeyValueStorage, SqlStorage, StorageType, VectorStorage } from '../types/index.js';
export declare class DatabaseFactoryImpl implements DatabaseFactory {
 private readonly connectionCache;
 private readonly storageCache;
 /**
 * Creates a database connection based on configuration
 */
 createConnection(config: DatabaseConfig): DatabaseConnection;
 /**
 * Creates a key-value storage instance
 */
 createKeyValueStorage(config: DatabaseConfig): KeyValueStorage;
 /**
 * Creates a SQL storage instance
 */
 createSqlStorage(config: DatabaseConfig): SqlStorage;
 /**
 * Creates a vector storage instance
 */
 createVectorStorage(config: DatabaseConfig): VectorStorage;
 /**
 * Creates a graph storage instance
 */
 createGraphStorage(config: DatabaseConfig): GraphStorage;
 /**
 * Creates storage configuration for given storage type
 */
 createStorageConfig(storageType: StorageType, database: string, baseConfig?: Partial<DatabaseConfig>): DatabaseConfig;
 /**
 * Validates if a database type supports a storage paradigm
 */
 supportsStorageType(databaseType: DatabaseType, storageType: StorageType): boolean;
 /**
 * Gets recommended database type for storage paradigm
 */
 getRecommendedBackend(storageType: StorageType): DatabaseType;
 /**
 * Clears connection and storage caches
 */
 clearCache(): Promise<void>;
 /**
 * Gets factory statistics
 */
 getStatistics(): {
 connectionCacheSize: number;
 storageCacheSize: number;
 connectedConnections: number;
 };
 private createConnectionAdapter;
 private validateConfig;
 private validatePoolConfig;
 private validateRetryPolicy;
 private getStorageSettings;
 private generateCacheKey;
 private isValidUrl;
}
/**
 * Gets the singleton database factory instance
 */
export declare function getDatabaseFactory(): DatabaseFactoryImpl;
/**
 * Creates a database connection using the factory
 */
export declare function createDatabaseConnection(config: DatabaseConfig): DatabaseConnection;
/**
 * Creates storage configuration
 */
export declare function createStorageConfig(storageType: StorageType, database: string, baseConfig?: Partial<DatabaseConfig>): DatabaseConfig;
export declare const createOptimalConfig: typeof createStorageConfig;
export declare const createOptimalStorageConfig: typeof createStorageConfig;
/**
 * Helper function to create storage instances with recommended backends
 */
export declare function createStorage<T extends StorageType>(type: T, database: string, baseConfig?: Partial<DatabaseConfig>): T extends 'keyValue' ? KeyValueStorage : T extends 'sql' ? SqlStorage : T extends 'vector' ? VectorStorage : T extends 'graph' ? GraphStorage : never;
//# sourceMappingURL=database-factory.d.ts.map