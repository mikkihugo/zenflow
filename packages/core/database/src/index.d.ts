/**
 * Database Package - Event-Driven Infrastructure
 *
 * A simplified multi-database abstraction layer with:
 * - Real SQLite adapter with connection pooling
 * - Type-safe interfaces
 * - Comprehensive error handling
 * - Health monitoring
 * - Transaction support
 * - Key-value storage abstraction
 * - Event-driven coordination and monitoring
 */
import { EventEmitter } from '@claude-zen/foundation';
export { SQLiteAdapter } from './adapters/sqlite-adapter.js';
export { LanceDBAdapter } from './adapters/lancedb-adapter.js';
import { createDatabaseConnection, createStorageConfig, getDatabaseFactory, createOptimalConfig, createOptimalStorageConfig } from './factory/database-factory';
export { createDatabaseConnection, createStorageConfig, getDatabaseFactory, createOptimalConfig, createOptimalStorageConfig, };
export { getLogger } from './logger.js';
export { KeyValueStorageImpl } from './storage/key-value-storage.js';
export * from './types/index.js';
export declare function createDatabase(type: 'sqlite' | 'memory', database: string): Promise<import("./index.js").SQLiteAdapter>;
export declare function createKeyValueStorage(database: string): Promise<import("./index.js").KeyValueStorageImpl>;
export declare function createDatabaseAccess(config?: unknown): {
 createConnection: (dbConfig: {
 type?: string;
 database: string;
 }) => Promise<import("./index.js").SQLiteAdapter>;
 createKeyValueStorage: typeof createKeyValueStorage;
 getDatabaseFactory: typeof getDatabaseFactory;
 createStorageConfig: typeof createStorageConfig;
 createOptimalConfig: typeof createStorageConfig;
 createOptimalStorageConfig: typeof createStorageConfig;
 getConfig: () => {
 [x: string]: unknown;
 };
};
export declare class DatabaseEventCoordinator extends EventEmitter {
 private config?;
 constructor(config?: unknown | undefined);
 connect(type: 'sqlite' | 'memory', database: string): Promise<import("./index.js").SQLiteAdapter>;
 createStorage(database: string): Promise<import("./index.js").KeyValueStorageImpl>;
 emitOperation(operation: string, details: Record<string, unknown>): void;
 emitHealthStatus(status: 'healthy' | 'degraded' | 'unhealthy', details?: Record<string, unknown>): void;
}
export declare class DatabaseProvider extends DatabaseEventCoordinator {
 constructor(config?: unknown);
 createConnection(type: 'sqlite' | 'memory', database: string): Promise<import("./index.js").SQLiteAdapter>;
 createKeyValue(database: string): Promise<import("./index.js").KeyValueStorageImpl>;
}
export declare const version = "1.0.0";
//# sourceMappingURL=index.d.ts.map