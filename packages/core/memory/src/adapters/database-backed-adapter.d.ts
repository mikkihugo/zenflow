/**
 * Database-backed memory adapter using the database package
 * This is the correct architectural approach - memory uses database package
 */
import { Result } from '@claude-zen/foundation';
import { BaseMemoryBackend, type BackendCapabilities } from './base-backend';
export interface DatabaseMemoryConfig {
  type: 'sqlite' | ' memory';
  database: string;
  maxSize?: number;
  ttl?: number;
}
/**
 * Memory adapter that uses the database package for persistence
 * This follows the correct architecture where memory depends on database
 */
export declare class DatabaseBackedAdapter extends BaseMemoryBackend {
  private config;
  private databaseProvider;
  private storage;
  private initialized;
  constructor(config: DatabaseMemoryConfig);
  initialize(): Promise<Result<void, Error>>;
  store(key: string, value: unknown): Promise<Result<void, Error>>;
  retrieve(key: string): Promise<Result<unknown, Error>>;
  delete(key: string): Promise<Result<boolean, Error>>;
  clear(): Promise<Result<void, Error>>;
  size(): Promise<Result<number, Error>>;
  health(): Promise<Result<boolean, Error>>;
  shutdown(): Promise<Result<void, Error>>;
  getCapabilities(): BackendCapabilities;
  getConfig(): DatabaseMemoryConfig;
}
//# sourceMappingURL=database-backed-adapter.d.ts.map
