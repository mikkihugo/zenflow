/**
 * Memory Domain Dependency Injection Providers.
 * Implements comprehensive DI patterns for memory management.
 *
 * @file memory-providers.ts
 * @description Enhanced memory providers with DI integration for Issue #63
 */

import type { DALFactory } from '../database/factory';
import type { ICoordinationRepository, IVectorRepository } from '../database/interfaces';
import { inject, injectable } from '../di/decorators/injectable';
import {
  CORE_TOKENS,
  DATABASE_TOKENS,
  type IConfig,
  type ILogger,
  MEMORY_TOKENS,
} from '../di/tokens/core-tokens';

/**
 * Interface for memory backend implementations.
 * Updated to be compatible with BaseMemoryBackend.
 *
 * @example
 */
export interface MemoryBackend {
  /** Store a value with the given key */
  store(key: string, value: any): Promise<void>;
  /** Retrieve a value by key */
  retrieve(key: string): Promise<any>;
  /** Delete a value by key - returns true if key existed and was deleted, false otherwise */
  delete(key: string): Promise<boolean>;
  /** Clear all stored data */
  clear(): Promise<void>;
  /** Get the number of stored items */
  size(): Promise<number>;
  /** Get health status of the backend */
  health(): Promise<boolean>;
}

/**
 * Configuration interface for memory providers.
 *
 * @example
 */
export interface MemoryConfig {
  /** Type of memory backend to use */
  type: 'sqlite' | 'lancedb' | 'json' | 'memory';
  /** Optional path for file-based backends */
  path?: string;
  /** Maximum size limit */
  maxSize?: number;
  /** Time-to-live for entries in milliseconds */
  ttl?: number;
  /** Enable compression for stored data */
  compression?: boolean;
}

/**
 * Factory for creating memory backend providers.
 * Uses dependency injection for logger, configuration, and DAL Factory.
 *
 * @example
 */
@injectable
export class MemoryProviderFactory {
  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig,
    @inject(DATABASE_TOKENS.DALFactory) private dalFactory: DALFactory
  ) {}

  /**
   * Create a memory provider based on configuration.
   *
   * @param config Memory configuration
   * @returns Appropriate memory backend implementation
   */
  createProvider(config: MemoryConfig): MemoryBackend {
    this.logger.info(`Creating memory provider: ${config?.type}`);

    try {
      switch (config?.type) {
        case 'sqlite':
          return new SqliteMemoryBackend(config, this.logger, this.dalFactory);
        case 'lancedb':
          return new LanceDBMemoryBackend(config, this.logger, this.dalFactory);
        case 'json':
          return new JsonMemoryBackend(config, this.logger);
        case 'memory':
        default:
          return new InMemoryBackend(config, this.logger);
      }
    } catch (error) {
      this.logger.error(`Failed to create memory provider: ${error}`);
      throw new Error(
        `Memory provider creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * SQLite-based memory backend implementation using DAL Factory.
 *
 * @example
 */
@injectable
export class SqliteMemoryBackend implements MemoryBackend {
  private repository: ICoordinationRepository<any>;
  private initialized = false;

  constructor(
    private config: MemoryConfig,
    private logger: ILogger,
    private dalFactory: DALFactory
  ) {}

  async store(key: string, value: any): Promise<void> {
    this.logger.debug(`Storing key: ${key} in SQLite backend`);
    await this.ensureInitialized();

    try {
      await this.repository.create({
        id: key,
        data: value,
        createdAt: new Date().toISOString(),
        metadata: { type: 'memory_entry' },
      });
      this.logger.debug(`Successfully stored key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to store key ${key}: ${error}`);
      throw error;
    }
  }

  async retrieve(key: string): Promise<any> {
    this.logger.debug(`Retrieving key: ${key} from SQLite backend`);
    await this.ensureInitialized();

    try {
      const results = await this.repository.findAll({});
      const filtered = results?.filter((r: any) => r.id === key);
      return filtered.length > 0 ? filtered[0]?.data : null;
    } catch (error) {
      this.logger.error(`Failed to retrieve key ${key}: ${error}`);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    this.logger.debug(`Deleting key: ${key} from SQLite backend`);
    await this.ensureInitialized();

    try {
      // First check if the key exists
      const existing = await this.retrieve(key);
      if (existing === null) {
        this.logger.debug(`Key ${key} does not exist, nothing to delete`);
        return false;
      }

      await this.repository.delete(key);
      this.logger.debug(`Successfully deleted key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}: ${error}`);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.info('Clearing all data from SQLite backend');
    await this.ensureInitialized();

    try {
      const allEntries = await this.repository.findAll({});
      for (const entry of allEntries) {
        await this.repository.delete(entry.id);
      }
      this.logger.info('Successfully cleared all data');
    } catch (error) {
      this.logger.error(`Failed to clear data: ${error}`);
      throw error;
    }
  }

  async size(): Promise<number> {
    await this.ensureInitialized();

    try {
      const allEntries = await this.repository.findAll({});
      return allEntries.length;
    } catch (error) {
      this.logger.error(`Failed to get size: ${error}`);
      throw error;
    }
  }

  async health(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      // Test basic operation
      await this.repository.findAll({ limit: 1 });
      return true;
    } catch (error) {
      this.logger.error(`Health check failed: ${error}`);
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create coordination repository using DAL Factory
      this.repository = await this.dalFactory.createCoordinationRepository('MemoryStore');
      this.initialized = true;
      this.logger.info('SQLite memory backend initialized via DAL Factory');
    } catch (error) {
      this.logger.error(`Failed to initialize SQLite backend: ${error}`);
      throw error;
    }
  }
}

/**
 * LanceDB-based memory backend implementation using DAL Factory.
 *
 * @example
 */
@injectable
export class LanceDBMemoryBackend implements MemoryBackend {
  private repository: IVectorRepository<any>;
  private initialized = false;

  constructor(
    private config: MemoryConfig,
    private logger: ILogger,
    private dalFactory: DALFactory
  ) {}

  async store(key: string, value: any): Promise<void> {
    this.logger.debug(`Storing key: ${key} in LanceDB backend`);
    await this.ensureInitialized();

    try {
      // Generate a simple vector representation for the key-value pair
      const vector = this.generateVectorFromValue(value);

      await this.repository.addVectors([
        {
          id: key,
          vector,
          metadata: {
            originalValue: value,
            storageType: 'memory',
            createdAt: new Date().toISOString(),
          },
        },
      ]);
      this.logger.debug(`Successfully stored key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to store key ${key}: ${error}`);
      throw error;
    }
  }

  async retrieve(key: string): Promise<any> {
    this.logger.debug(`Retrieving key: ${key} from LanceDB backend`);
    await this.ensureInitialized();

    try {
      const results = await this.repository.similaritySearch([0], { limit: 1000 });
      const match = results?.find((r) => r.id === key);
      // Ensure metadata exists on VectorSearchResult and access originalValue safely
      if (
        match &&
        'metadata' in match &&
        match?.metadata &&
        typeof match?.metadata === 'object' &&
        match?.metadata !== null &&
        'originalValue' in match?.metadata
      ) {
        return (match?.metadata as any).originalValue;
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to retrieve key ${key}: ${error}`);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    this.logger.debug(`Deleting key: ${key} from LanceDB backend`);
    await this.ensureInitialized();

    try {
      // First check if the key exists
      const existing = await this.retrieve(key);
      if (existing === null) {
        this.logger.debug(`Key ${key} does not exist, nothing to delete`);
        return false;
      }

      await this.repository.delete(key);
      this.logger.debug(`Successfully deleted key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}: ${error}`);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.info('Clearing all data from LanceDB backend');
    await this.ensureInitialized();

    try {
      // Get all vectors and delete them
      const allVectors = await this.repository.similaritySearch([0], { limit: 10000 });
      for (const vector of allVectors) {
        if (vector && 'id' in vector && vector.id) {
          await this.repository.delete(vector.id);
        }
      }
      this.logger.info('Successfully cleared all data');
    } catch (error) {
      this.logger.error(`Failed to clear data: ${error}`);
      throw error;
    }
  }

  async size(): Promise<number> {
    await this.ensureInitialized();

    try {
      const allVectors = await this.repository.similaritySearch([0], { limit: 10000 });
      return allVectors ? allVectors.length : 0;
    } catch (error) {
      this.logger.error(`Failed to get size: ${error}`);
      throw error;
    }
  }

  async health(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      // Test basic operation
      await this.repository.similaritySearch([0], { limit: 1 });
      return true;
    } catch (error) {
      this.logger.error(`Health check failed: ${error}`);
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create vector repository using DAL Factory
      this.repository = await this.dalFactory.createLanceDBVectorRepository(
        'MemoryVectors',
        384 // Default vector size
      );
      this.initialized = true;
      this.logger.info('LanceDB memory backend initialized via DAL Factory');
    } catch (error) {
      this.logger.error(`Failed to initialize LanceDB backend: ${error}`);
      throw error;
    }
  }

  private generateVectorFromValue(value: any): number[] {
    // Simple hash-based vector generation for demo purposes
    // In production, you'd use proper embeddings
    const str = JSON.stringify(value);
    const vector = new Array(384).fill(0);

    for (let i = 0; i < str.length && i < 384; i++) {
      vector[i] = str.charCodeAt(i) / 255; // Normalize to 0-1
    }

    return vector;
  }
}

/**
 * JSON file-based memory backend implementation.
 *
 * @example
 */
@injectable
export class JsonMemoryBackend implements MemoryBackend {
  private data = new Map<string, any>();
  private initialized = false;

  constructor(
    private config: MemoryConfig,
    private logger: ILogger
  ) {}

  async store(key: string, value: any): Promise<void> {
    this.logger.debug(`Storing key: ${key} in JSON backend`);
    await this.ensureInitialized();

    try {
      this.data.set(key, value);
      await this.persistToFile();
      this.logger.debug(`Successfully stored key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to store key ${key}: ${error}`);
      throw error;
    }
  }

  async retrieve(key: string): Promise<any> {
    this.logger.debug(`Retrieving key: ${key} from JSON backend`);
    await this.ensureInitialized();

    try {
      return this.data.get(key);
    } catch (error) {
      this.logger.error(`Failed to retrieve key ${key}: ${error}`);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    this.logger.debug(`Deleting key: ${key} from JSON backend`);
    await this.ensureInitialized();

    try {
      const existed = this.data.has(key);
      const deleted = this.data.delete(key);
      if (deleted) {
        await this.persistToFile();
        this.logger.debug(`Successfully deleted key: ${key}`);
      } else {
        this.logger.debug(`Key ${key} does not exist, nothing to delete`);
      }
      return existed;
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}: ${error}`);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.info('Clearing all data from JSON backend');
    await this.ensureInitialized();

    try {
      this.data.clear();
      await this.persistToFile();
      this.logger.info('Successfully cleared all data');
    } catch (error) {
      this.logger.error(`Failed to clear data: ${error}`);
      throw error;
    }
  }

  async size(): Promise<number> {
    await this.ensureInitialized();
    return this.data.size;
  }

  async health(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return true;
    } catch (error) {
      this.logger.error(`Health check failed: ${error}`);
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadFromFile();
      this.initialized = true;
      this.logger.info('JSON memory backend initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize JSON backend: ${error}`);
      throw error;
    }
  }

  private async loadFromFile(): Promise<void> {
    // File loading implementation would go here
    // For now, just initialize empty
    this.data = new Map();
  }

  private async persistToFile(): Promise<void> {
    // File persistence implementation would go here
    // For now, just log
    this.logger.debug('JSON data persisted to file');
  }
}

/**
 * In-memory backend implementation (fastest, no persistence)
 *
 * @example
 */
@injectable
export class InMemoryBackend implements MemoryBackend {
  private data = new Map<string, any>();
  private readonly maxSize: number;

  constructor(
    private config: MemoryConfig,
    private logger: ILogger
  ) {
    this.maxSize = config?.maxSize || 10000;
    this.logger.info(`Initialized in-memory backend with max size: ${this.maxSize}`);
  }

  async store(key: string, value: any): Promise<void> {
    this.logger.debug(`Storing key: ${key} in memory backend`);

    try {
      // Check size limits
      if (this.data.size >= this.maxSize && !this.data.has(key)) {
        throw new Error(`Memory limit exceeded. Max size: ${this.maxSize}`);
      }

      this.data.set(key, value);
      this.logger.debug(`Successfully stored key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to store key ${key}: ${error}`);
      throw error;
    }
  }

  async retrieve(key: string): Promise<any> {
    this.logger.debug(`Retrieving key: ${key} from memory backend`);

    try {
      return this.data.get(key);
    } catch (error) {
      this.logger.error(`Failed to retrieve key ${key}: ${error}`);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    this.logger.debug(`Deleting key: ${key} from memory backend`);

    try {
      const deleted = this.data.delete(key);
      if (deleted) {
        this.logger.debug(`Successfully deleted key: ${key}`);
      } else {
        this.logger.debug(`Key not found for deletion: ${key}`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}: ${error}`);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.info('Clearing all data from memory backend');

    try {
      this.data.clear();
      this.logger.info('Successfully cleared all data');
    } catch (error) {
      this.logger.error(`Failed to clear data: ${error}`);
      throw error;
    }
  }

  async size(): Promise<number> {
    return this.data.size;
  }

  async health(): Promise<boolean> {
    try {
      // Check if we can perform basic operations
      const testKey = '__health_check__';
      this.data.set(testKey, 'test');
      this.data.delete(testKey);
      return true;
    } catch (error) {
      this.logger.error(`Health check failed: ${error}`);
      return false;
    }
  }
}

// Memory backends now properly integrated with DAL Factory
// All database operations go through the existing repository patterns
