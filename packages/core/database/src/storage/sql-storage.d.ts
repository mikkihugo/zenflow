/**
 * SQL Storage Implementation
 *
 * Provides SQL database operations with comprehensive error handling,
 * connection pooling, and performance monitoring.
 */
import {
  type DatabaseConfig,
  type DatabaseConnection,
  type QueryResult,
  type SqlStorage,
  type TableSchema,
  type TransactionContext,
} from '../types/index.js';
export declare class SQLStorageImpl implements SqlStorage {
  private connection;
  private config;
  constructor(connection: DatabaseConnection, config: DatabaseConfig);
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  execute(
    sql: string,
    params?: unknown[],
    options?: {
      correlationId?: string;
    }
  ): Promise<QueryResult>;
  transaction<T>(
    fn: (tx: SqlStorage) => Promise<T>,
    context?: TransactionContext
  ): Promise<T>;
  createTable(name: string, schema: TableSchema): Promise<void>;
  dropTable(
    name: string,
    options?: {
      ifExists?: boolean;
    }
  ): Promise<void>;
  truncateTable(name: string): Promise<void>;
  getTableSchema(name: string): Promise<TableSchema | null>;
  getTableInfo(tableName: string): Promise<
    Array<{
      name: string;
      type: string;
      nullable: boolean;
    }>
  >;
  listTables(): Promise<readonly string[]>;
  createIndex(
    name: string,
    tableName: string,
    columns: readonly string[],
    options?: {
      unique?: boolean;
      type?: string;
    }
  ): Promise<void>;
  dropIndex(
    indexName: string,
    options?: {
      ifExists?: boolean;
    }
  ): Promise<void>;
  isHealthy(): Promise<boolean>;
  getStatistics(): Promise<{
    connectionStatus: 'connected' | 'disconnected';
    tableCount: number;
    version: string;
  }>;
  close(): Promise<void>;
  private generateCorrelationId;
}
//# sourceMappingURL=sql-storage.d.ts.map
