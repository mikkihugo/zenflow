/**
 * Database-backed memory adapter using the database package
 * This is the correct architectural approach - memory uses database package
 */

import {
  DatabaseProvider,
  createKeyValueStorage,
  KeyValueStorageImpl,
} from '@claude-zen/database';
import { getLogger, Result, ok, err } from '@claude-zen/foundation';
import {
  BaseMemoryBackend,
  type MemoryEntry,
  type BackendCapabilities,
} from './base-backend';

const logger = getLogger('DatabaseBackedAdapter');
const ADAPTER_NOT_INITIALIZED_ERROR = 'Adapter not initialized';

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
export class DatabaseBackedAdapter extends BaseMemoryBackend {
  private databaseProvider: DatabaseProvider;
  private storage: KeyValueStorageImpl | null = null;
  private initialized = false;

  constructor(private config: DatabaseMemoryConfig) {
    super();
    this.databaseProvider = new DatabaseProvider();
    logger.debug('DatabaseBackedAdapter created', { config });
  }

  async initialize(): Promise<Result<void, Error>> {
    try {
      logger.info('Initializing database-backed memory adapter', {
        type: this.config.type,
        database: this.config.database,
      });

      // Use database package to create storage
      this.storage = await createKeyValueStorage(this.config.database);
      this.initialized = true;

      logger.info('Database-backed memory adapter initialized successfully');
      return ok();
    } catch (error) {
      logger.error('Failed to initialize database-backed memory adapter', {
        error,
      });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async store(key: string, value: unknown): Promise<Result<void, Error>> {
    if (!this.initialized || !this.storage) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }

    try {
      const entry: MemoryEntry = {
        key,
        value,
        timestamp: Date.now(),
        ttl: this.config.ttl,
        size: JSON.stringify(value).length,
      };

      await this.storage.set(key, entry);
      logger.debug('Stored memory entry', { key, size: entry.size });
      return ok();
    } catch (error) {
      logger.error('Failed to store memory entry', { key, error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async retrieve(key: string): Promise<Result<unknown, Error>> {
    if (!this.initialized || !this.storage) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }

    try {
      const entry = (await this.storage.get(key)) as MemoryEntry | null;

      if (!entry) {
        return ok(null);
      }

      // Check TTL
      if (entry.ttl && entry.timestamp + entry.ttl < Date.now()) {
        await this.storage.delete(key);
        return ok(null);
      }

      logger.debug('Retrieved memory entry', {
        key,
        age: Date.now() - entry.timestamp,
      });
      return ok(entry.value);
    } catch (error) {
      logger.error('Failed to retrieve memory entry', { key, error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async delete(key: string): Promise<Result<boolean, Error>> {
    if (!this.initialized || !this.storage) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }

    try {
      const deleted = await this.storage.delete(key);
      logger.debug('Deleted memory entry', { key, deleted });
      return ok(deleted);
    } catch (error) {
      logger.error('Failed to delete memory entry', { key, error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async clear(): Promise<Result<void, Error>> {
    if (!this.initialized || !this.storage) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }

    try {
      await this.storage.clear();
      logger.info('Cleared all memory entries');
      return ok();
    } catch (error) {
      logger.error('Failed to clear memory entries', { error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async size(): Promise<Result<number, Error>> {
    if (!this.initialized || !this.storage) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }

    try {
      const count = await this.storage.size();
      return ok(count);
    } catch (error) {
      logger.error('Failed to get memory size', { error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async health(): Promise<Result<boolean, Error>> {
    if (!this.initialized || !this.storage) {
      return ok(false);
    }

    try {
      const healthy = await this.storage.health();
      return ok(healthy);
    } catch (error) {
      logger.error('Health check failed', { error });
      return ok(false);
    }
  }

  async shutdown(): Promise<Result<void, Error>> {
    try {
      if (this.storage) {
        await this.storage.close();
      }
      this.initialized = false;
      logger.info('Database-backed memory adapter shut down');
      return ok();
    } catch (error) {
      logger.error('Failed to shutdown adapter', { error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  getCapabilities(): BackendCapabilities {
    return {
      persistent: this.config.type === 'sqlite',
      transactional: true,
      queryable: false,
      scalable: false,
      distributed: false,
      maxSize: this.config.maxSize,
      supportsTTL: true,
      supportsMetadata: true,
    };
  }

  getConfig(): DatabaseMemoryConfig {
    return { ...this.config };
  }
}
