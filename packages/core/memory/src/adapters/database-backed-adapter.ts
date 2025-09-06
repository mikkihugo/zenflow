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

// Constants for error messages to prevent duplication
const ADAPTER_NOT_INITIALIZED_ERROR = 'Database adapter not properly initialized - call initialize() first';
const ADAPTER_UNAVAILABLE_ERROR = 'Database adapter instance is not available - configuration may be invalid';
const ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR = 'Database adapter became unavailable during operation';

/**
 * Database row interface for type-safe row validation
 */
interface DatabaseRow {
  key: string;
  value: string;
  metadata: string | null;
  timestamp: number;
  size: number;
  type: string;
  ttl: number | null;
}

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


  /**
   * Validates that a database row has the expected structure for MemoryEntry conversion.
   * Provides type safety and prevents runtime errors from malformed data.
   * 
   * @param row - Raw database row to validate
   * @returns true if row has valid structure, false otherwise
   */
  private isValidDatabaseRow(row: unknown): row is DatabaseRow {
    if (!row || typeof row !== 'object') {
      return false;
    }

    const typedRow = row as Record<string, unknown>;
    
    // Validate required fields exist and have appropriate types
    return (
      typeof typedRow['key'] === 'string' &&
      typeof typedRow['value'] === 'string' &&
      typeof typedRow['timestamp'] === 'number' &&
      typeof typedRow['size'] === 'number' &&
      typeof typedRow['type'] === 'string' &&
      (typedRow['ttl'] === null || typeof typedRow['ttl'] === 'number') &&
      (typedRow['metadata'] === null || typeof typedRow['metadata'] === 'string')
    );
  }

  /**
   * Safely parses JSON strings with comprehensive error handling and context.
   * Prevents JSON parsing errors from crashing the application.
   * 
   * @param jsonString - String to parse as JSON
   * @param fieldName - Field name for error context
   * @returns Result containing parsed value or error
   */
  private safeJsonParse(jsonString: string, fieldName: string): Result<unknown, Error> {
    try {
      const parsed = JSON.parse(jsonString);
      return ok(parsed);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      return err(new Error(`JSON parse error in ${fieldName}: ${errorMessage}`));
    }
  }

  /**
   * Safely stringifies values to JSON with comprehensive error handling.
   * Prevents JSON stringification errors from crashing the application.
   * 
   * @param value - Value to stringify as JSON
   * @param fieldName - Field name for error context
   * @returns Result containing stringified value or error
   */
  private safeJsonStringify(value: unknown, fieldName: string): Result<string, Error> {
    try {
      const stringified = JSON.stringify(value);
      return ok(stringified);
    } catch (stringifyError) {
      const errorMessage = stringifyError instanceof Error ? stringifyError.message : String(stringifyError);
      return err(new Error(`JSON stringify error in ${fieldName}: ${errorMessage}`));
    }
  }

  /**
   * Initializes the database connection and ensures table schema.
   * 
   * @returns Promise resolving to Result indicating success or failure
   */
  async initialize(): Promise<Result<void, Error>> {
    return await this.emitOperation('initialize', 'system', async () => {
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

        return ok();
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

  /**
   * Retrieves a memory entry by key with TTL validation and comprehensive error handling.
   * 
   * This method performs several important operations:
   * - Validates adapter initialization state
   * - Checks TTL expiration to ensure data freshness
   * - Safely parses JSON data with error recovery
   * - Provides detailed type-safe row processing
   * - Emits telemetry events for observability
   * 
   * @param key - The unique identifier for the memory entry
   * @returns Promise resolving to Result containing MemoryEntry or null if not found
   */
  async get(key: string): Promise<Result<MemoryEntry | null, Error>> {
    // Enhanced initialization check with explicit adapter validation
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    // Use operation emission for consistent telemetry and error handling
    return await this.emitOperation('get', key, async () => {
      try {
        // Optimized query with explicit TTL handling for better performance
        const currentTimestamp = Date.now();
        const selectQuery = `SELECT * FROM ${this.tableName} WHERE key = ? AND (ttl IS NULL OR ttl > ?)`;
        
        const rows = await this.dbAdapter.query(selectQuery, [key, currentTimestamp]);
        
        // Handle empty result set with clear null return
        if (!rows || rows.length === 0) {
          return ok(null);
        }

        // Type-safe row processing with comprehensive validation
        const rawRow = rows[0];
        if (!rawRow) {
          return ok(null);
        }
        if (!this.isValidDatabaseRow(rawRow)) {
          return err(new Error(`Invalid database row structure for key: ${key}`));
        }

        // Enhanced JSON parsing with error recovery and validation
        const parsedValue = this.safeJsonParse(rawRow.value, 'value');
        const parsedMetadata = this.safeJsonParse(rawRow.metadata || '{}', 'metadata');

        if (parsedValue.isErr()) {
          return err(new Error(`Failed to parse value for key ${key}: ${parsedValue.error.message}`));
        }

        if (parsedMetadata.isErr()) {
          return err(new Error(`Failed to parse metadata for key ${key}: ${parsedMetadata.error.message}`));
        }

        // Construct type-safe MemoryEntry with validated data
        const entry: MemoryEntry = {
          key: String(rawRow['key']),
          value: parsedValue.value as JSONValue,
          metadata: parsedMetadata.value as Record<string, unknown>,
          timestamp: Number(rawRow.timestamp),
          size: Number(rawRow.size),
          type: String(rawRow.type),
          ttl: rawRow.ttl ? Number(rawRow.ttl) : undefined
        };

        return ok(entry);
      } catch (error) {
        // Enhanced error handling with context preservation
        const errorMessage = error instanceof Error ? error.message : String(error);
        return err(new Error(`Database get operation failed for key '${key}': ${errorMessage}`));
      }
    });
  }

  /**
   * Stores a memory entry with comprehensive validation and error handling.
   * 
   * This method provides several advanced features:
   * - JSON serialization with error detection
   * - TTL calculation and validation
   * - Metadata handling with defaults
   * - Atomic database operations
   * - Size calculation and optimization
   * - Type inference and storage
   * 
   * @param key - Unique identifier for the memory entry
   * @param value - JSONValue to store (will be serialized)
   * @param options - Optional TTL and metadata configuration
   * @returns Promise resolving to Result indicating success or failure
   */
  async set(
    key: string, 
    value: JSONValue, 
    options?: { ttl?: number; metadata?: Record<string, unknown> }
  ): Promise<Result<void, Error>> {
    // Enhanced initialization validation with specific error messages
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    return await this.emitOperation('set', key, async () => {
      try {
        // Safe JSON serialization with error handling
        const serializedValueResult = this.safeJsonStringify(value, 'value');
        if (serializedValueResult.isErr()) {
          return err(new Error(`Failed to serialize value for key ${key}: ${serializedValueResult.error.message}`));
        }

        const serializedValue = serializedValueResult.value;
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
        
        // Type-safe database query execution with validation
        if (!this.dbAdapter) {
          return err(new Error(ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR));
        }
        
        await this.dbAdapter.query(query, [
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

        return ok();
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Deletes a memory entry by key with comprehensive validation and event emission.
   * 
   * @param key - The unique identifier for the memory entry to delete
   * @returns Promise resolving to Result containing boolean indicating if entry was deleted
   */
  async delete(key: string): Promise<Result<boolean, Error>> {
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    return await this.emitOperation('delete', key, async () => {
      try {
        const query = `DELETE FROM ${this.tableName} WHERE key = ?`;
        
        // Type-safe database query execution
        if (!this.dbAdapter) {
          return err(new Error(ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR));
        }
        
        const result = await this.dbAdapter.query(query, [key]) as Array<{ changes?: number }>;
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

  /**
   * Clears all memory entries from the database with comprehensive validation.
   * 
   * @returns Promise resolving to Result indicating success or failure
   */
  async clear(): Promise<Result<void, Error>> {
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    return await this.emitOperation('clear', 'all', async () => {
      try {
        const query = `DELETE FROM ${this.tableName}`;
        
        // Type-safe database query execution with validation
        if (!this.dbAdapter) {
          return err(new Error(ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR));
        }
        
        await this.dbAdapter.query(query, []);

        eventBus.emit('memory:storage:cleared', {
          backendId: this.getBackendId(),
          timestamp: Date.now()
        });

        return ok();
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Gets the count of active memory entries (excluding expired ones).
   * 
   * @returns Promise resolving to Result containing the count of active entries
   */
  async size(): Promise<Result<number, Error>> {
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    return await this.emitOperation('size', 'count', async () => {
      try {
        const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE (ttl IS NULL OR ttl > ?)`;
        
        // Type-safe database query execution with validation
        if (!this.dbAdapter) {
          return err(new Error(ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR));
        }
        
        const result = await this.dbAdapter.query(query, [Date.now()]) as Array<{ count: number }>;
        const count = result[0]?.count || 0;
        return ok(count);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return err(new Error(`Failed to get memory size: ${errorMessage}`));
      }
    });
  }

  /**
   * Lists memory entry keys with optional filtering and sorting.
   * 
   * @param options - Optional query parameters for filtering and sorting
   * @returns Promise resolving to Result containing array of keys
   */
  async list(options?: MemoryQueryOptions): Promise<Result<string[], Error>> {
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    return await this.emitOperation('list', 'keys', async () => {
      try {
        let query = `SELECT key FROM ${this.tableName} WHERE (ttl IS NULL OR ttl > ?)`;
        const params: (string | number)[] = [Date.now()];

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

        // Type-safe database query execution with validation
        if (!this.dbAdapter) {
          return err(new Error(ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR));
        }
        
        const result = await this.dbAdapter.query(query, params) as Array<{ key: string }>;
        const keys = result.map(row => row.key);
        return ok(keys);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Lists all distinct namespaces found in memory keys.
   * 
   * @returns Promise resolving to Result containing array of namespace strings
   */
  async listNamespaces(): Promise<Result<string[], Error>> {
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    return await this.emitOperation('listNamespaces', 'namespaces', async () => {
      try {
        const query = `
          SELECT DISTINCT 
            SUBSTR(key, 1, INSTR(key || ':', ':') - 1) as namespace
          FROM ${this.tableName} 
          WHERE key LIKE '%:%' 
            AND (ttl IS NULL OR ttl > ?)
          ORDER BY namespace
        `;
        
        // Type-safe database query execution with validation
        if (!this.dbAdapter) {
          return err(new Error(ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR));
        }
        
        const result = await this.dbAdapter.query(query, [Date.now()]) as Array<{ namespace: string }>;
        const namespaces = result.map(row => row.namespace);
        return ok(namespaces);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Retrieves comprehensive memory usage statistics.
   * 
   * @returns Promise resolving to Result containing detailed memory statistics
   */
  async getStats(): Promise<Result<MemoryStats, Error>> {
    if (!this.isInitialized()) {
      return err(new Error(ADAPTER_NOT_INITIALIZED_ERROR));
    }
    
    if (!this.dbAdapter) {
      return err(new Error(ADAPTER_UNAVAILABLE_ERROR));
    }

    return await this.emitOperation('getStats', 'stats', async () => {
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
        
        // Type-safe database query execution with validation
        if (!this.dbAdapter) {
          return err(new Error(ADAPTER_UNAVAILABLE_DURING_OPERATION_ERROR));
        }
        
        const result = await this.dbAdapter.query(query, [Date.now()]) as Array<{ 
          totalKeys: number; 
          totalSize: number; 
          averageKeySize: number; 
          averageValueSize: number 
        }>;
        
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

  /**
   * Performs a health check on the database connection.
   * 
   * @returns Promise resolving to Result containing health status boolean
   */
  async health(): Promise<Result<boolean, Error>> {
    if (!this.isInitialized()) {
      return ok(false);
    }
    
    if (!this.dbAdapter) {
      return ok(false);
    }

    return await this.emitOperation('health', 'check', async () => {
      try {
        const query = 'SELECT 1';
        
        // Type-safe database query execution with validation
        if (!this.dbAdapter) {
          return ok(false);
        }
        
        const result = await this.dbAdapter.query(query, []);
        return ok(result.length > 0);
      } catch (healthCheckError) {
        // Log the error for debugging but return false for health status
        logger.warn('Database health check failed', { 
          error: healthCheckError instanceof Error ? healthCheckError.message : String(healthCheckError) 
        });
        return ok(false);
      }
    });
  }

  /**
   * Closes the database connection and cleans up resources.
   * 
   * @returns Promise resolving to Result indicating success or failure
   */
  async close(): Promise<Result<void, Error>> {
    return await this.emitOperation('close', 'system', async () => {
      try {
        // Gracefully close database connection if available
        if (this.dbAdapter) {
          await this.dbAdapter.close();
          this.dbAdapter = null;
        }
        
        // Update initialization state
        this.setInitialized(false);
        
        // Log successful closure for debugging
        logger.info('DatabaseBackedAdapter closed successfully', {
          backendId: this.getBackendId(),
          timestamp: Date.now()
        });

        return ok();
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

  /**
   * Ensures the memory table exists with proper schema and indexes.
   * 
   * @returns Promise resolving to Result indicating success or failure
   */
  private async ensureTable(): Promise<Result<void, Error>> {
    try {
      // Validate adapter availability before table operations
      if (!this.dbAdapter) {
        return err(new Error('Database adapter not available for table creation'));
      }

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

      await this.dbAdapter.query(createTableQuery, []);

      // Create performance-optimized index for TTL cleanup operations
      const indexQuery = `CREATE INDEX IF NOT EXISTS idx_${this.tableName}_ttl ON ${this.tableName}(ttl)`;
      
      // Additional validation for continued adapter availability
      if (!this.dbAdapter) {
        return err(new Error('Database adapter became unavailable during index creation'));
      }
      
      await this.dbAdapter.query(indexQuery, []);

      logger.debug('Database table and indexes ensured successfully', {
        tableName: this.tableName,
        backendId: this.getBackendId()
      });

      return ok();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return err(new Error(`Failed to ensure database table: ${errorMessage}`));
    }
  }
}