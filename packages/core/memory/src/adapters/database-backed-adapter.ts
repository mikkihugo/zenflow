/**
 * Golden Database-Backed Memory Adapter
 * 
 * This is the flagship adapter that demonstrates:
 * - Proper use of @claude-zen/database package
 * - Event-driven architecture with EventBus
 * - Result pattern for all operations
 * - Production-ready error handling and monitoring
 */

import { Result, ok, err, EventBus, getLogger } from '@claude-zen/foundation';
import { DatabaseEventCoordinator, SQLiteAdapter } from '@claude-zen/database';
import { 
  BaseMemoryBackend, 
  type MemoryEntry, 
  type MemoryStats, 
  type MemoryQueryOptions,
  type BackendCapabilities 
} from './base-backend';
import type { MemoryConfig } from '../types/index';
import type { JSONValue } from '../core/memory-system';

const logger = getLogger('memory:database-adapter');
const eventBus = EventBus.getInstance();

export interface DatabaseMemoryConfig extends MemoryConfig {
  database: string;
  maxSize?: number;
  ttl?: number;
  tableName?: string;
  enableWAL?: boolean;
}

/**
 * Golden Database-Backed Memory Adapter
 * 
 * Uses the database package for persistent storage with event-driven operations.
 * This is the reference implementation showing proper architecture:
 * - Memory package depends on database package
 * - All operations emit events through EventBus
 * - Result pattern for consistent error handling
 * - Full integration with database event coordination
 */
export class DatabaseBackedAdapter extends BaseMemoryBackend {
  private dbCoordinator: DatabaseEventCoordinator;
  private dbAdapter: SQLiteAdapter | null = null;
  private tableName: string;

  constructor(private config: DatabaseMemoryConfig) {
    super(config);
    this.dbCoordinator = new DatabaseEventCoordinator();
    this.tableName = config.tableName || 'memory_entries';
    
    logger.info('DatabaseBackedAdapter created', { 
      backendId: this.getBackendId(),
      config: { ...config, database: '[REDACTED]' }
    });
  }

  async initialize(): Promise<Result<void, Error>> {
    return this.emitOperation('initialize', 'system', async () => {
      try {
        // Connect using database package
        const dbType = this.config.type === 'memory' ? 'memory' : 'sqlite';
        this.dbAdapter = await this.dbCoordinator.connect(
          dbType as 'sqlite' | 'memory', 
          this.config.database
        );

        // Create memory table if it doesn't exist
        const createTableResult = await this.ensureTable();
        if (createTableResult.isErr()) {
          return createTableResult;
        }

        this.setInitialized(true);
        
        logger.info('DatabaseBackedAdapter initialized', {
          backendId: this.getBackendId(),
          tableName: this.tableName
        });

        return ok(undefined);
      } catch (error) {
        const errorMsg = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to initialize DatabaseBackedAdapter', {
          backendId: this.getBackendId(),
          error: errorMsg.message
        });
        return err(errorMsg);
      }
    });
  }

  async get(key: string): Promise<Result<MemoryEntry | null, Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('get', key, async () => {
      try {
        const query = `SELECT * FROM ${this.tableName} WHERE key = ? AND (ttl IS NULL OR ttl > ?)`;
        const rows = await this.dbAdapter!.query(query, [key, Date.now()]);
        if (!rows || rows.length === 0) {
          return ok(null);
        }

        const row = rows[0] as any;
        const entry: MemoryEntry = {
          key: row.key,
          value: JSON.parse(row.value),
          metadata: JSON.parse(row.metadata || '{}'),
          timestamp: row.timestamp,
          size: row.size,
          type: row.type,
          ttl: row.ttl
        };

        return ok(entry);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async set(
    key: string, 
    value: JSONValue, 
    options?: { ttl?: number; metadata?: Record<string, unknown> }
  ): Promise<Result<void, Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('set', key, async () => {
      try {
        const serializedValue = JSON.stringify(value);
        const metadata = JSON.stringify(options?.metadata || {});
        const timestamp = Date.now();
        const size = serializedValue.length + key.length;
        const ttl = options?.ttl ? timestamp + options.ttl : null;
        const type = typeof value;

        const query = `
          INSERT OR REPLACE INTO ${this.tableName} 
          (key, value, metadata, timestamp, size, type, ttl) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.dbAdapter!.query(query, [
          key, serializedValue, metadata, timestamp, size, type, ttl
        ]);

        // Emit memory-specific event
        eventBus.emit('memory:entry:stored', {
          backendId: this.getBackendId(),
          key,
          size,
          timestamp,
          ttl
        });

        return ok(undefined);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async delete(key: string): Promise<Result<boolean, Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('delete', key, async () => {
      try {
        const query = `DELETE FROM ${this.tableName} WHERE key = ?`;
        const result = await this.dbAdapter!.query(query, [key]) as Array<{ changes?: number }>;
        const deleted = (result[0]?.changes ?? 0) > 0;
        
        if (deleted) {
          eventBus.emit('memory:entry:deleted', {
            backendId: this.getBackendId(),
            key,
            timestamp: Date.now()
          });
        }

        return ok(deleted);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async clear(): Promise<Result<void, Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('clear', 'all', async () => {
      try {
        const query = `DELETE FROM ${this.tableName}`;
        await this.dbAdapter!.query(query, []);

        eventBus.emit('memory:storage:cleared', {
          backendId: this.getBackendId(),
          timestamp: Date.now()
        });

        return ok(undefined);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async size(): Promise<Result<number, Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('size', 'count', async () => {
      try {
        const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE (ttl IS NULL OR ttl > ?)`;
        const result = await this.dbAdapter!.query(query, [Date.now()]) as Array<{ count: number }>;
        const count = result[0]?.count || 0;
        return ok(count);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async list(options?: MemoryQueryOptions): Promise<Result<string[], Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('list', 'keys', async () => {
      try {
        let query = `SELECT key FROM ${this.tableName} WHERE (ttl IS NULL OR ttl > ?)`;
        const params: any[] = [Date.now()];

        if (options?.pattern) {
          query += ' AND key LIKE ?';
          params.push(options.pattern.replace('*', '%'));
        }

        if (options?.sortBy) {
          query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'asc'}`;
        }

        if (options?.limit) {
          query += ' LIMIT ?';
          params.push(options.limit);
          
          if (options.offset) {
            query += ' OFFSET ?';
            params.push(options.offset);
          }
        }

        const result = await this.dbAdapter!.query(query, params) as Array<{ key: string }>;
        const keys = result.map(row => row.key);
        return ok(keys);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async listNamespaces(): Promise<Result<string[], Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('listNamespaces', 'namespaces', async () => {
      try {
        const query = `
          SELECT DISTINCT 
            SUBSTR(key, 1, INSTR(key || ':', ':') - 1) as namespace
          FROM ${this.tableName} 
          WHERE key LIKE '%:%' 
            AND (ttl IS NULL OR ttl > ?)
          ORDER BY namespace
        `;
        
        const result = await this.dbAdapter!.query(query, [Date.now()]) as Array<{ namespace: string }>;
        const namespaces = result.map(row => row.namespace);
        return ok(namespaces);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async getStats(): Promise<Result<MemoryStats, Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return err(new Error('Adapter not initialized'));
    }

    return this.emitOperation('getStats', 'stats', async () => {
      try {
        const query = `
          SELECT 
            COUNT(*) as totalKeys,
            SUM(size) as totalSize,
            AVG(LENGTH(key)) as averageKeySize,
            AVG(size) as averageValueSize
          FROM ${this.tableName} 
          WHERE (ttl IS NULL OR ttl > ?)
        `;
        
        const result = await this.dbAdapter!.query(query, [Date.now()]) as Array<{ totalKeys: number; totalSize: number; averageKeySize: number; averageValueSize: number }>;
        const row = result[0];
        const stats: MemoryStats = {
          totalKeys: row?.totalKeys || 0,
          totalSize: row?.totalSize || 0,
          averageKeySize: row?.averageKeySize || 0,
          averageValueSize: row?.averageValueSize || 0,
          uptime: Date.now() - this.stats.uptime,
          operations: this.stats.operations,
          performance: this.stats.performance
        };

        return ok(stats);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async health(): Promise<Result<boolean, Error>> {
    if (!this.isInitialized() || !this.dbAdapter) {
      return ok(false);
    }

    return this.emitOperation('health', 'check', async () => {
      try {
        const query = 'SELECT 1';
        const result = await this.dbAdapter!.query(query, []);
        return ok(result.length > 0);
      } catch (error) {
        return ok(false);
      }
    });
  }

  async close(): Promise<Result<void, Error>> {
    return this.emitOperation('close', 'system', async () => {
      try {
        if (this.dbAdapter) {
          await this.dbAdapter.close();
          this.dbAdapter = null;
        }
        
        this.setInitialized(false);
        
        logger.info('DatabaseBackedAdapter closed', {
          backendId: this.getBackendId()
        });

        return ok(undefined);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  override getCapabilities(): BackendCapabilities {
    return {
      persistent: true,
      searchable: true,
      transactional: true,
      vectorized: false,
      distributed: false,
      concurrent: true,
      compression: false,
      encryption: false,
      supportsEvents: true,
      databaseIntegration: true
    };
  }

  private async ensureTable(): Promise<Result<void, Error>> {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          metadata TEXT DEFAULT '{}',
          timestamp INTEGER NOT NULL,
          size INTEGER NOT NULL,
          type TEXT NOT NULL,
          ttl INTEGER DEFAULT NULL
        )
      `;

      await this.dbAdapter!.query(createTableQuery, []);

      // Create index for TTL cleanup
      const indexQuery = `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_ttl ON ${this.tableName}(ttl)`;
      await this.dbAdapter!.query(indexQuery, []);

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}