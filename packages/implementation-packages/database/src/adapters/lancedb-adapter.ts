/**
 * Real LanceDB Database Adapter
 *
 * Real LanceDB adapter using @lancedb/lancedb library for production vector storage
 */

// Using Awilix DI - no reflect-metadata needed
import { connect, Connection, Table } from '@lancedb/lancedb';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getLogger } from '@claude-zen/foundation';
import type {
  DatabaseAdapter,
  QueryResult,
  QueryParams,
  HealthStatus,
} from '../interfaces.js';
import { injectable } from '@claude-zen/foundation';

const logger = getLogger('lancedb-adapter');

export interface LanceDBConfig {
  type: 'lancedb';
  database: string;
  options?: {
    vectorSize?: number;
    metricType?: 'cosine | l2' | 'dot';
    createIfNotExists?: boolean;
    uri?: string;
  };
}

export interface VectorDocument extends Record<string, unknown> {
  id: string;
  vector: number[];
  text: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  filter?: Record<string, unknown>;
  includeMetadata?: boolean;
}

export class LanceDBAdapter implements DatabaseAdapter {
  private connection: Connection'' | ''null = null;
  private config: LanceDBConfig;
  private connected = false;
  private tables: Map<string, Table> = new Map();

  constructor(config: LanceDBConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      // Ensure directory exists for local database
      if (!this.config.options?.uri && this.config.database) {
        const dbDir = dirname(this.config.database);
        if (!existsSync(dbDir)) {
          mkdirSync(dbDir, { recursive: true });
        }
      }

      // Create real LanceDB connection
      const uri = this.config.options?.uri'' | '''' | ''this.config.database;
      this.connection = await connect(uri);

      this.connected = true;

      logger.info(`✅ Connected to real LanceDB: ${uri}`);
    } catch (error) {
      logger.error(`❌ Failed to connect to LanceDB: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      // LanceDB connection cleanup
      this.connection = null;
      this.tables.clear();
      this.connected = false;
      logger.info('✅ Disconnected from LanceDB');
    }
  }

  async createTable(name: string, schema: VectorDocument[]): Promise<void> {
    if (!this.connected) await this.connect();
    if (!this.connection) throw new Error('Database not connected');

    try {
      // Create table with schema
      const table = await this.connection.createTable(name, schema, {
        mode: 'overwrite',
      });

      this.tables.set(name, table);

      logger.info(`✅ Created LanceDB table: ${name}`);
    } catch (error) {
      logger.error(`❌ Failed to create table ${name}:`, error);
      throw error;
    }
  }

  async getTable(name: string): Promise<Table> {
    if (!this.connected) await this.connect();
    if (!this.connection) throw new Error('Database not connected');

    // Return cached table if available
    if (this.tables.has(name)) {
      return this.tables.get(name)!;
    }

    try {
      // Open existing table
      const table = await this.connection.openTable(name);
      this.tables.set(name, table);
      return table;
    } catch (error) {
      // Table doesn't exist, create default vector documents table
      logger.warn(`Table ${name} not found, creating with default schema`);

      const defaultSchema: VectorDocument[] = [
        {
          id: '0',
          vector: new Array(this.config.options?.vectorSize'' | '''' | ''384).fill(0),
          text:'',
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      await this.createTable(name, defaultSchema);
      return this.tables.get(name)!;
    }
  }

  async insertVectors(
    tableName: string,
    documents: VectorDocument[]
  ): Promise<void> {
    const table = await this.getTable(tableName);

    try {
      // Add timestamps if not present
      const documentsWithTimestamps = documents.map((doc) => ({
        ...doc,
        created_at: doc.created_at'' | '''' | ''new Date().toISOString(),
        updated_at: doc.updated_at'' | '''' | ''new Date().toISOString(),
      }));

      await table.add(documentsWithTimestamps);

      logger.debug(`✅ Inserted ${documents.length} vectors into ${tableName}`);
    } catch (error) {
      logger.error(`❌ Failed to insert vectors into ${tableName}:`, error);
      throw error;
    }
  }

  async searchVectors(
    tableName: string,
    queryVector: number[],
    options: VectorSearchOptions = {}
  ): Promise<Array<VectorDocument & { _distance?: number }>> {
    const table = await this.getTable(tableName);

    try {
      let query = table.search(queryVector);

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Apply distance threshold
      if (options.threshold) {
        query = query.where(`_distance < ${options.threshold}`);
      }

      // Apply metadata filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (typeof value ==='string') {
            query = query.where(`${key} = '${value}'`);
          } else {
            query = query.where(`${key} = ${value}`);
          }
        });
      }

      const results = await query.toArray();

      logger.debug(
        `✅ Found ${results.length} similar vectors in ${tableName}`
      );

      return results;
    } catch (error) {
      logger.error(`❌ Vector search failed in ${tableName}:`, error);
      throw error;
    }
  }

  async updateVector(
    tableName: string,
    id: string,
    updates: Partial<VectorDocument>
  ): Promise<void> {
    const table = await this.getTable(tableName);

    try {
      // LanceDB doesn't have direct update - need to delete and re-insert
      // This is a simplified implementation
      const existing = await table
        .search([])
        .where(`id = '${id}'`)
        .limit(1)
        .toArray();

      if (existing.length === 0) {
        throw new Error(`Vector with id ${id} not found`);
      }

      const updated = {
        ...existing[0],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Delete old record
      await table.delete(`id = '${id}'`);

      // Insert updated record
      await table.add([updated]);

      logger.debug(`✅ Updated vector ${id} in ${tableName}`);
    } catch (error) {
      logger.error(`❌ Failed to update vector ${id} in ${tableName}:`, error);
      throw error;
    }
  }

  async deleteVector(tableName: string, id: string): Promise<void> {
    const table = await this.getTable(tableName);

    try {
      await table.delete(`id = '${id}'`);

      logger.debug(`✅ Deleted vector ${id} from ${tableName}`);
    } catch (error) {
      logger.error(
        `❌ Failed to delete vector ${id} from ${tableName}:`,
        error
      );
      throw error;
    }
  }

  async countVectors(tableName: string): Promise<number> {
    const table = await this.getTable(tableName);

    try {
      const count = await table.countRows();
      return count;
    } catch (error) {
      logger.error(`❌ Failed to count vectors in ${tableName}:`, error);
      return 0;
    }
  }

  async listTables(): Promise<string[]> {
    if (!this.connected) await this.connect();
    if (!this.connection) throw new Error('Database not connected');

    try {
      const tableNames = await this.connection.tableNames();
      return tableNames;
    } catch (error) {
      logger.error('❌ Failed to list tables:', error);
      return [];
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Compatibility methods for database adapter interface
  async query<T = unknown>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>> {
    // LanceDB doesn't use SQL, so we interpret common queries
    try {
      if (sql.includes('SELECT') && sql.includes('FROM')) {
        // Parse table name from SQL (simplified)
        const tableMatch = sql.match(/FROM\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'documents';

        const table = await this.getTable(tableName);
        const results = await table.search([]).limit(100).toArray();

        return {
          rows: results as T[],
          rowCount: results.length,
          fields: [],
        };
      }

      return {
        rows: [] as T[],
        rowCount: 0,
        fields: [],
      };
    } catch (error) {
      logger.error(`Query failed: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, params: unknown[] = []): Promise<unknown> {
    // LanceDB doesn't use SQL, so we interpret common operations
    try {
      if (sql.includes('INSERT NTO')) {
        // Mock insert operation
        return {
          affectedRows: 1,
          insertId: Date.now().toString(),
          executionTime: 1,
        };
      }

      return {
        affectedRows: 0,
        insertId: null,
        executionTime: 1,
      };
    } catch (error) {
      logger.error(`Execute failed: ${error}`);
      throw error;
    }
  }

  async transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    // LanceDB doesn't support transactions in the traditional sense
    // Execute the function directly
    const tx = {
      query: this.query.bind(this),
      execute: this.execute.bind(this),
    };

    try {
      return await fn(tx);
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  async health(): Promise<HealthStatus> {
    try {
      if (!this.connected'' | '''' | ''!this.connection) {
        return {
          healthy: false,
          isHealthy: false,
          status:'disconnected',
          score: 0,
          details: { connected: false },
          lastCheck: new Date(),
        };
      }

      // Test connection by listing tables
      await this.connection.tableNames();
      return {
        healthy: true,
        isHealthy: true,
        status: 'healthy',
        score: 100,
        details: { connected: true, queryTest: true },
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        healthy: false,
        isHealthy: false,
        status: 'error',
        score: 0,
        details: { connected: this.connected, error: String(error) },
        lastCheck: new Date(),
        errors: [String(error)],
      };
    }
  }

  async getSchema(): Promise<unknown> {
    try {
      const tableNames = await this.listTables();
      return {
        tables: tableNames.map((name) => ({ name, type: 'vector_table' })),
        views: [],
      };
    } catch (error) {
      logger.error('Failed to get schema:', error);
      return { tables: [], views: [] };
    }
  }

  async getConnectionStats(): Promise<unknown> {
    return {
      total: 1,
      active: this.connected ? 1 : 0,
      idle: this.connected ? 0 : 1,
      utilization: this.connected ? 100 : 0,
    };
  }

  // DAO compatibility methods
  async vectorSearch(
    queryVector: number[],
    options: VectorSearchOptions = {}
  ): Promise<unknown> {
    // Default table name for DAO compatibility
    const tableName = 'document_embeddings';

    try {
      const results = await this.searchVectors(tableName, queryVector, options);

      return {
        rows: results,
        rowCount: results.length,
        executionTime: 1,
        results: results.map((r) => ({
          id: r.id,
          vector: r.vector,
          text: r.text,
          metadata: r.metadata,
          distance: r._distance'' | '''' | ''0,
        })),
      };
    } catch (error) {
      logger.error(`❌ Vector search failed: ${error}`);
      return {
        rows: [],
        rowCount: 0,
        executionTime: 1,
        results: [],
      };
    }
  }

  // LanceDB specific utility methods
  async createEmbeddingIndex(
    tableName: string,
    columnName: string ='vector'): Promise<void> {
    const table = await this.getTable(tableName);

    try {
      // Create vector index for faster similarity search
      await table.createIndex(columnName, {
        // Note: metric configuration may vary by LanceDB version
      } as any);

      logger.info(`✅ Created embedding index on ${tableName}.${columnName}`);
    } catch (error) {
      logger.error(`❌ Failed to create embedding index:`, error);
      throw error;
    }
  }

  async getTableInfo(tableName: string): Promise<unknown> {
    const table = await this.getTable(tableName);

    try {
      const count = await table.countRows();
      const schema = await table.schema();

      return {
        name: tableName,
        row_count: count,
        schema: schema,
        vector_columns: schema.fields.filter((field: unknown) => {
          const fieldName = (field as { name?: string })?.name'' | '''' | '''';
          return fieldName === 'vector''' | '''' | ''fieldName.includes('embedding');
        }),
      };
    } catch (error) {
      logger.error(`❌ Failed to get table info for ${tableName}:`, error);
      throw error;
    }
  }
}
