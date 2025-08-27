/**
 * Database Package
 *
 * A simplified multi-database abstraction layer with:
 * - Real SQLite adapter with connection pooling
 * - Type-safe interfaces
 * - Comprehensive error handling
 * - Health monitoring
 * - Transaction support
 * - Key-value storage abstraction
 */

export { SQLiteAdapter } from './adapters/sqlite-adapter.js';
import {
  createDatabaseConnection,
  createStorageConfig,
  getDatabaseFactory,
  createOptimalConfig,
  createOptimalStorageConfig,
} from './factory/database-factory';

export {
  createDatabaseConnection,
  createStorageConfig,
  getDatabaseFactory,
  createOptimalConfig,
  createOptimalStorageConfig,
};
export { getLogger } from './logger.js';
export { KeyValueStorageImpl } from './storage/key-value-storage.js';
export * from './types/index.js';

// Simple factory function for backward compatibility
export async function createDatabase(
  type: 'sqlite' | 'memory',
  database: string
) {
  const { SQLiteAdapter: sqliteAdapter } = await import(
    './adapters/sqlite-adapter.js'
  );

  return new sqliteAdapter({
    type: type === 'memory' ? 'sqlite' : type,
    database: type === 'memory' ? ':memory:' : database,
    pool: {
      min: 1,
      max: 5,
      acquireTimeoutMillis: 10000,
      idleTimeoutMillis: 300000,
      reapIntervalMillis: 1000,
      createTimeoutMillis: 3000,
      destroyTimeoutMillis: 5000,
      createRetryIntervalMillis: 200,
      propagateCreateError: true,
    },
    retryPolicy: {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
      backoffFactor: 2,
      retryableErrors: ['SQLITE_BUSY', 'SQLITE_LOCKED'],
    },
  });
}

// Simple storage factory for backward compatibility
export async function createKeyValueStorage(database: string) {
  const connection = await createDatabase('sqlite', database);
  const { KeyValueStorageImpl: keyValueStorageImpl } = await import(
    './storage/key-value-storage.js'
  );

  return new keyValueStorageImpl(connection, {
    type: 'sqlite',
    database,
    options: { enableCache: true, maxCacheSize: 1000 },
  });
}

export function createDatabaseAccess(config?: unknown) {
  const configuration = config ? { ...config as Record<string, unknown> } : {};
  return {
    createConnection: (dbConfig: { type?: string; database: string }) =>
      createDatabase(dbConfig.type || 'sqlite', dbConfig.database),
    createKeyValueStorage,
    getDatabaseFactory,
    createStorageConfig,
    createOptimalConfig,
    createOptimalStorageConfig,
    getConfig: () => configuration,
  };
}

// Provider class expected by infrastructure facade
export class DatabaseProvider {
  constructor(private config?: unknown) {}

  createConnection(type: 'sqlite' | 'memory', database: string) {
    return createDatabase(type, database);
  }

  createKeyValue(database: string) {
    return createKeyValueStorage(database);
  }
}

export const version = '1.0.0';
