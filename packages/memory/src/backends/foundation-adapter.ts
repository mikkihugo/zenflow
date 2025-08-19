/**
 * Foundation Storage Adapter for Memory Backend
 * 
 * Adapter that bridges Memory package with Foundation's storage system.
 * Leverages Foundation's database abstraction for SQLite, LanceDB, and Kuzu.
 */

import { 
  getDatabaseAccess,
  getKVStore,
  Storage,
  getLogger,
  withRetry,
  createCircuitBreaker,
  recordMetric,
  withTrace
} from '@claude-zen/foundation';
import type { 
  DatabaseAccess,
  KeyValueStore,
  Logger,
  RetryOptions,
  CircuitBreakerOptions
} from '@claude-zen/foundation';
import { BaseMemoryBackend, type BackendCapabilities } from './base-backend';
import type { MemoryConfig } from '../providers/memory-providers';
import type { JSONValue, MemoryStats } from '../core/memory-system';

interface FoundationMemoryConfig extends MemoryConfig {
  storageType: 'kv' | 'database' | 'hybrid';
  databaseType?: 'sqlite' | 'lancedb' | 'kuzu';
  retry?: RetryOptions;
  circuitBreaker?: CircuitBreakerOptions;
}

export class FoundationMemoryBackend extends BaseMemoryBackend {
  private logger: Logger;
  private kvStore?: KeyValueStore;
  private dbAccess?: DatabaseAccess;
  private storage: typeof Storage;
  private initialized = false;
  private retryWithOptions: any;
  private circuitBreaker: any;

  constructor(config: FoundationMemoryConfig) {
    super(config);
    this.logger = getLogger('FoundationMemoryBackend');
    this.storage = Storage;
    
    // Setup retry logic if configured
    if (config.retry) {
      this.retryWithOptions = (fn: () => Promise<any>) => withRetry(fn, config.retry!);
    } else {
      this.retryWithOptions = (fn: () => Promise<any>) => fn();
    }

    // Setup circuit breaker if configured
    if (config.circuitBreaker) {
      // Circuit breaker needs a function to wrap - we'll set this up later when needed
      this.circuitBreaker = null; // Will be created when first used
    }
  }

  override async initialize(): Promise<void> {
    if (this.initialized) return;

    const config = this.config as FoundationMemoryConfig;

    try {
      await withTrace('memory-backend-init', async () => {
        switch (config.storageType) {
          case 'kv':
            this.kvStore = await getKVStore(config.databaseType || 'sqlite');
            break;
          
          case 'database':
            this.dbAccess = getDatabaseAccess();
            break;
          
          case 'hybrid':
            this.kvStore = await getKVStore(config.databaseType || 'sqlite');
            this.dbAccess = getDatabaseAccess();
            break;
          
          default:
            throw new Error(`Unsupported storage type: ${config.storageType}`);
        }

        // Initialize storage tables/collections if using database
        if (this.dbAccess) {
          await this.initializeSchema();
        }

        this.initialized = true;
        this.logger.info(`Foundation backend initialized with ${config.storageType} storage`);
        recordMetric('memory_backend_initialized', 1, { storageType: config.storageType });
      });

    } catch (error) {
      this.logger.error('Failed to initialize Foundation backend:', error);
      recordMetric('memory_backend_init_errors', 1);
      throw error;
    }
  }

  override async store(key: string, value: JSONValue, namespace = 'default'): Promise<void> {
    this.validateKey(key);
    await this.ensureInitialized();

    const operation = async () => {
      return withTrace('memory-store', async (span) => {
        const finalKey = `${namespace}:${key}`;
        const now = Date.now();
        const ttl = this.config.ttl ? now + this.config.ttl : undefined;

        const entry = {
          key,
          value,
          namespace,
          created: now,
          updated: now,
          ttl,
          metadata: {
            size: this.calculateSize(value),
            backend: 'foundation'
          }
        };

        span?.setAttributes({
          'memory.operation': 'store',
          'memory.key': key,
          'memory.namespace': namespace,
          'memory.size': this.calculateSize(value)
        });

        if (this.kvStore) {
          // Use Key-Value store
          await this.kvStore.set(finalKey, JSON.stringify(entry));
        } else if (this.dbAccess) {
          // Use database access - get SQL interface
          const sql = await this.dbAccess.getSQL('memory');
          await sql.query(
            'INSERT OR REPLACE INTO memory_entries (key, value, namespace, timestamp, metadata) VALUES (?, ?, ?, ?, ?)',
            [finalKey, JSON.stringify(entry), namespace || 'default', Date.now(), JSON.stringify({})]
          );
        } else {
          throw new Error('No storage backend available');
        }

        this.updateStats('write', this.calculateSize(value));
        recordMetric('memory_operations_total', 1, { 
          operation: 'store', 
          namespace,
          backend: 'foundation' 
        });

        this.logger.debug(`Stored key: ${key} in namespace: ${namespace}`);
      });
    };

    if (this.circuitBreaker) {
      await this.circuitBreaker.fire(operation);
    } else {
      await this.retryWithOptions(operation);
    }
  }

  override async set(key: string, value: JSONValue): Promise<void> {
    return this.store(key, value);
  }

  override async retrieve<T = JSONValue>(key: string, namespace = 'default'): Promise<T | null> {
    this.validateKey(key);
    await this.ensureInitialized();

    const operation = async () => {
      return withTrace('memory-retrieve', async (span) => {
        const finalKey = `${namespace}:${key}`;

        span?.setAttributes({
          'memory.operation': 'retrieve',
          'memory.key': key,
          'memory.namespace': namespace
        });

        let entryData: any = null;

        if (this.kvStore) {
          // Use Key-Value store
          const data = await this.kvStore.get(finalKey);
          if (data) {
            entryData = JSON.parse(data as string);
          }
        } else if (this.dbAccess) {
          // Use database access - get SQL interface
          const sql = await this.dbAccess.getSQL('memory');
          const results = await sql.query(
            'SELECT * FROM memory_entries WHERE key = ? AND namespace = ?',
            [key, namespace]
          );
          entryData = results.length > 0 ? results[0] : null;
        } else {
          throw new Error('No storage backend available');
        }

        if (!entryData) {
          this.updateStats('read');
          recordMetric('memory_operations_total', 1, { 
            operation: 'retrieve_miss', 
            namespace,
            backend: 'foundation' 
          });
          return null;
        }

        // Check TTL
        if (entryData.ttl && entryData.ttl <= Date.now()) {
          await this.delete(key, namespace);
          this.updateStats('read');
          return null;
        }

        this.updateStats('read');
        recordMetric('memory_operations_total', 1, { 
          operation: 'retrieve_hit', 
          namespace,
          backend: 'foundation' 
        });

        this.logger.debug(`Retrieved key: ${key} from namespace: ${namespace}`);
        return entryData.value as T;
      });
    };

    if (this.circuitBreaker) {
      return await this.circuitBreaker.fire(operation);
    } else {
      return await this.retryWithOptions(operation);
    }
  }

  override async get<T = JSONValue>(key: string): Promise<T | null> {
    return this.retrieve<T>(key);
  }

  override async delete(key: string, namespace = 'default'): Promise<boolean> {
    this.validateKey(key);
    await this.ensureInitialized();

    const operation = async () => {
      return withTrace('memory-delete', async (span) => {
        const finalKey = `${namespace}:${key}`;

        span?.setAttributes({
          'memory.operation': 'delete',
          'memory.key': key,
          'memory.namespace': namespace
        });

        let deleted = false;

        if (this.kvStore) {
          // Use Key-Value store
          const existed = await this.kvStore.has(finalKey);
          if (existed) {
            await this.kvStore.delete(finalKey);
            deleted = true;
          }
        } else if (this.dbAccess) {
          // Use database access - get SQL interface
          const sql = await this.dbAccess.getSQL('memory');
          const result = await sql.query(
            'DELETE FROM memory_entries WHERE key = ? AND namespace = ?',
            [key, namespace]
          );
          deleted = (result as any).changes > 0;
        } else {
          throw new Error('No storage backend available');
        }

        if (deleted) {
          this.updateStats('delete');
          recordMetric('memory_operations_total', 1, { 
            operation: 'delete', 
            namespace,
            backend: 'foundation' 
          });
          this.logger.debug(`Deleted key: ${key} from namespace: ${namespace}`);
        }

        return deleted;
      });
    };

    if (this.circuitBreaker) {
      return await this.circuitBreaker.fire(operation);
    } else {
      return await this.retryWithOptions(operation);
    }
  }

  override async list(pattern?: string, namespace = 'default'): Promise<string[]> {
    await this.ensureInitialized();

    const operation = async () => {
      return withTrace('memory-list', async (span) => {
        span?.setAttributes({
          'memory.operation': 'list',
          'memory.namespace': namespace,
          'memory.pattern': pattern || 'all'
        });

        let keys: string[] = [];

        if (this.kvStore) {
          // Use Key-Value store - get all keys and filter
          const allKeys = await this.kvStore.keys();
          const namespacePrefix = `${namespace}:`;
          
          keys = allKeys
            .filter(key => key.startsWith(namespacePrefix))
            .map(key => key.substring(namespacePrefix.length))
            .filter(key => !pattern || this.matchesPattern(key, pattern));

        } else if (this.dbAccess) {
          // Use database access - get SQL interface
          const sql = await this.dbAccess.getSQL('memory');
          let query = 'SELECT key FROM memory_entries WHERE namespace = ?';
          const params: any[] = [namespace];

          if (pattern) {
            const sqlPattern = pattern.replace(/\*/g, '%');
            query += ' AND key LIKE ?';
            params.push(sqlPattern);
          }

          query += ' AND (ttl IS NULL OR ttl > ?)';
          params.push(Date.now());

          const results = await sql.query(query, params);
          keys = results.map((row: any) => row.key);

        } else {
          throw new Error('No storage backend available');
        }

        recordMetric('memory_operations_total', 1, { 
          operation: 'list', 
          namespace,
          backend: 'foundation',
          count: keys.length
        });

        return keys.sort();
      });
    };

    if (this.circuitBreaker) {
      return await this.circuitBreaker.fire(operation);
    } else {
      return await this.retryWithOptions(operation);
    }
  }

  async search(pattern: string, namespace = 'default'): Promise<Record<string, JSONValue>> {
    await this.ensureInitialized();

    const operation = async () => {
      return withTrace('memory-search', async (span) => {
        span?.setAttributes({
          'memory.operation': 'search',
          'memory.namespace': namespace,
          'memory.pattern': pattern
        });

        const results: Record<string, JSONValue> = {};

        if (this.kvStore) {
          // Use Key-Value store - get all entries and search
          const allKeys = await this.kvStore.keys();
          const namespacePrefix = `${namespace}:`;
          
          for (const fullKey of allKeys) {
            if (!fullKey.startsWith(namespacePrefix)) continue;
            
            const key = fullKey.substring(namespacePrefix.length);
            const data = await this.kvStore.get(fullKey);
            
            if (data) {
              const entry = JSON.parse(data as string);
              
              // Check TTL
              if (entry.ttl && entry.ttl <= Date.now()) continue;
              
              // Search in key or value
              const valueString = JSON.stringify(entry.value);
              if (this.matchesPattern(key, pattern) || 
                  valueString.toLowerCase().includes(pattern.toLowerCase())) {
                results[key] = entry.value;
              }
            }
          }

        } else if (this.dbAccess) {
          // Use database access with SQL search
          const sqlPattern = `%${pattern}%`;
          const query = `
            SELECT key, value FROM memory_entries 
            WHERE namespace = ? 
            AND (key LIKE ? OR json_extract(value, '$') LIKE ?)
            AND (ttl IS NULL OR ttl > ?)
          `;
          
          const sql = await this.dbAccess.getSQL('memory'); 
          const rows = await sql.query(query, [
            namespace, 
            sqlPattern, 
            sqlPattern, 
            Date.now()
          ]);
          
          for (const row of rows) {
            results[row.key] = row.value;
          }

        } else {
          throw new Error('No storage backend available');
        }

        recordMetric('memory_operations_total', 1, { 
          operation: 'search', 
          namespace,
          backend: 'foundation',
          results: Object.keys(results).length
        });

        return results;
      });
    };

    if (this.circuitBreaker) {
      return await this.circuitBreaker.fire(operation);
    } else {
      return await this.retryWithOptions(operation);
    }
  }

  override async clear(namespace?: string): Promise<void> {
    await this.ensureInitialized();

    const operation = async () => {
      return withTrace('memory-clear', async (span) => {
        span?.setAttributes({
          'memory.operation': 'clear',
          'memory.namespace': namespace || 'all'
        });

        if (this.kvStore) {
          // Use Key-Value store
          if (namespace) {
            const allKeys = await this.kvStore.keys();
            const namespacePrefix = `${namespace}:`;
            
            for (const key of allKeys) {
              if (key.startsWith(namespacePrefix)) {
                await this.kvStore.delete(key);
              }
            }
          } else {
            await this.kvStore.clear();
          }

        } else if (this.dbAccess) {
          // Use database access
          if (namespace) {
            const sql = await this.dbAccess.getSQL('memory');
            await sql.query(
              'DELETE FROM memory_entries WHERE namespace = ?',
              [namespace]
            );
          } else {
            const sql = await this.dbAccess.getSQL('memory');
            await sql.query('DELETE FROM memory_entries');
          }

        } else {
          throw new Error('No storage backend available');
        }

        this.stats.totalEntries = 0;
        this.stats.totalSize = 0;

        recordMetric('memory_operations_total', 1, { 
          operation: 'clear', 
          namespace: namespace || 'all',
          backend: 'foundation' 
        });

        this.logger.debug(`Cleared ${namespace ? `namespace: ${namespace}` : 'all entries'}`);
      });
    };

    if (this.circuitBreaker) {
      await this.circuitBreaker.fire(operation);
    } else {
      await this.retryWithOptions(operation);
    }
  }

  override async close(): Promise<void> {
    if (!this.initialized) return;

    try {
      await withTrace('memory-backend-close', async () => {
        // Foundation storage handles its own cleanup
        // We just need to mark as not initialized
        this.initialized = false;
        
        recordMetric('memory_backend_closed', 1);
        this.logger.info('Foundation backend closed');
      });

    } catch (error) {
      this.logger.error('Failed to close Foundation backend:', error);
      throw error;
    }
  }

  override getCapabilities(): BackendCapabilities {
    const config = this.config as FoundationMemoryConfig;
    
    return {
      persistent: true,
      searchable: true,
      transactional: config.storageType === 'database' || config.storageType === 'hybrid',
      vectorized: config.databaseType === 'lancedb',
      distributed: false,
      concurrent: true,
      compression: false,
      encryption: false,
    };
  }

  override async listNamespaces(): Promise<string[]> {
    await this.ensureInitialized();

    const operation = async () => {
      if (this.kvStore) {
        // Use Key-Value store
        const allKeys = await this.kvStore.keys();
        const namespaces = new Set<string>();
        
        for (const key of allKeys) {
          const colonIndex = key.indexOf(':');
          if (colonIndex > 0) {
            namespaces.add(key.substring(0, colonIndex));
          }
        }
        
        return Array.from(namespaces).sort();

      } else if (this.dbAccess) {
        // Use database access
        const sql = await this.dbAccess.getSQL('memory');
        const results = await sql.query(
          'SELECT DISTINCT namespace FROM memory_entries ORDER BY namespace'
        );
        return results.map((row: any) => row.namespace);

      } else {
        throw new Error('No storage backend available');
      }
    };

    if (this.circuitBreaker) {
      return await this.circuitBreaker.fire(operation);
    } else {
      return await this.retryWithOptions(operation);
    }
  }

  // Private methods

  private async initializeSchema(): Promise<void> {
    if (!this.dbAccess) return;

    try {
      // Create memory_entries table if it doesn't exist
      const sql = await this.dbAccess.getSQL('memory');
      await sql.query(`
        CREATE TABLE IF NOT EXISTS memory_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL,
          value JSON NOT NULL,
          namespace TEXT DEFAULT 'default',
          created INTEGER NOT NULL,
          updated INTEGER NOT NULL,
          ttl INTEGER,
          metadata JSON,
          UNIQUE(key, namespace)
        )
      `);

      // Create indexes for performance
      await sql.query(`
        CREATE INDEX IF NOT EXISTS idx_key_namespace ON memory_entries(key, namespace)
      `);
      await sql.query(`
        CREATE INDEX IF NOT EXISTS idx_namespace ON memory_entries(namespace)
      `);
      await sql.query(`
        CREATE INDEX IF NOT EXISTS idx_ttl ON memory_entries(ttl)
      `);

      this.logger.debug('Database schema initialized');

    } catch (error) {
      this.logger.error('Failed to initialize database schema:', error);
      throw error;
    }
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async getSize(): Promise<number> {
    await this.ensureInitialized();

    if (this.kvStore) {
      const keys = await this.kvStore.keys();
      return keys.length;
    } else if (this.dbAccess) {
      const sql = await this.dbAccess.getSQL('memory');
      const results = await sql.query('SELECT COUNT(*) as count FROM memory_entries');
      return results[0]?.count || 0;
    }

    return 0;
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number; capabilities: BackendCapabilities; stats: MemoryStats }> {
    const start = Date.now();
    
    try {
      // Test basic operations
      await this.store('health_check', { timestamp: start }, 'health');
      const result = await this.retrieve('health_check', 'health');
      await this.delete('health_check', 'health');
      
      const latency = Date.now() - start;
      const healthy = result !== null;
      
      recordMetric('memory_health_check', 1, { 
        healthy: healthy.toString(),
        latency: latency.toString()
      });
      
      return {
        healthy,
        latency,
        capabilities: this.getCapabilities(),
        stats: this.stats
      };
      
    } catch (error) {
      const latency = Date.now() - start;
      
      recordMetric('memory_health_check', 1, { 
        healthy: 'false',
        latency: latency.toString(),
        error: (error as Error).message
      });
      
      return {
        healthy: false,
        latency,
        capabilities: this.getCapabilities(),
        stats: this.stats
      };
    }
  }
}