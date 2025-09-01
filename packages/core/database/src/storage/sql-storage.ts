/**
 * SQL Storage Implementation
 *
 * Provides SQL database operations with comprehensive error handling,
 * connection pooling, and performance monitoring.
 */

import { getLogger } from '../logger.js';
import {
 type DatabaseConfig,
 type DatabaseConnection,
 QueryError,
 type QueryResult,
 type SqlStorage,
 type TableSchema,
 type TransactionConnection,
 type TransactionContext,
 TransactionError,
} from '../types/index.js';

const logger = getLogger('sql-storage');

// Transaction wrapper that adapts TransactionConnection to work with SqlStorage
class TransactionSQLStorageImpl implements SqlStorage {
 constructor(
 private txConnection: TransactionConnection,
 private config: DatabaseConfig
 ) {}

 async query<T = unknown>(
 sql: string,
 params?: unknown[]
 ): Promise<QueryResult<T>> {
 return await this.txConnection.query<T>(sql, params);
 }

 async execute(sql: string, params?: unknown[]): Promise<QueryResult> {
 return await this.txConnection.execute(sql, params);
 }

 transaction<T>(fn: (tx: SqlStorage) => Promise<T>): Promise<T> {
 // Execute function with current storage instance as transaction
 // For proper transaction support, this would need connection-level transaction handling
 return fn(this);
 }

 async createTable(name: string, schema: TableSchema): Promise<void> {
 // Build CREATE TABLE statement from schema
 const columns =
 schema.columns
 ?.map((col) => {
 let columnDef = `${col.name} ${col.type}`;
 if (!col.nullable) columnDef += ' NOT NULL';
 if (col.defaultValue !== undefined)
 columnDef += ` DEFAULT ${col.defaultValue}`;
 return columnDef;
 })
 .join(', ') || '';

 const primaryKey =
 schema.primaryKey?.length > 0
 ? `, PRIMARY KEY (${schema.primaryKey.join(', ')})`
 : '';

 const sql = `CREATE TABLE IF NOT EXISTS ${name} (${columns}${primaryKey})`;
 await this.execute(sql);
 }

 async dropTable(
 name: string,
 options?: { ifExists?: boolean }
 ): Promise<void> {
 const ifExists = options?.ifExists !== false ? 'IF EXISTS ' : '';
 const sql = `DROP TABLE ${ifExists}${name}`;
 await this.execute(sql);
 }

 async truncateTable(name: string): Promise<void> {
 await this.execute(`DELETE FROM ${name}`);
 }

 async createIndex(
 name: string,
 tableName: string,
 columns: readonly string[],
 options?: { unique?: boolean; type?: string }
 ): Promise<void> {
 const unique = options?.unique ? 'UNIQUE' : '';
 const sql = `CREATE ${unique} INDEX IF NOT EXISTS ${name} ON ${tableName} (${columns.join(', ')})`;
 await this.execute(sql);
 }

 async dropIndex(
 name: string,
 options?: { ifExists?: boolean }
 ): Promise<void> {
 const query = options?.ifExists
 ? `DROP INDEX IF EXISTS ${name}`
 : `DROP INDEX ${name}`;
 await this.execute(query);
 }

 async getTableSchema(name: string): Promise<TableSchema | null> {
 // This is a simplified implementation for transactions
 const result = await this.query<{
 name: string;
 type: string;
 notnull: number;
 }>(`PRAGMA table_info(${name})`);

 if (result.rows.length === 0) {
 return null;
 }

 return {
 name,
 columns: result.rows.map((row) => ({
 name: row.name,
 type: row.type,
 nullable: row.notnull === 0,
 defaultValue: undefined,
 maxLength: undefined,
 precision: undefined,
 scale: undefined,
 })),
 primaryKey: [],
 foreignKeys: [],
 indexes: [],
 };
 }

 async listTables(): Promise<readonly string[]> {
 const result = await this.query<{ name: string }>(
 "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE ' sqlite_%'"
 );
 return result.rows.map((row) => row.name);
 }
}

export class SQLStorageImpl implements SqlStorage {
 constructor(
 private connection: DatabaseConnection,
 private config: DatabaseConfig
 ) {}

 async query<T = unknown>(
 sql: string,
 params?: unknown[]
 ): Promise<QueryResult<T>> {
 try {
 logger.debug('Executing SQL query', {
 sql: sql.slice(0, 100),
 paramCount: params?.length || 0,
 });

 const result = await this.connection.query<T>(sql, params);

 logger.debug('SQL query completed', {
 rowCount: Array.isArray(result.rows) ? result.rows.length : 0,
 });

 return result;
 } catch (error) {
 logger.error('SQL query failed', {
 sql: sql.slice(0, 100),
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `SQL query failed:${error instanceof Error ? error.message : String(error)}`,
 { query: sql, params }
 );
 }
 }

 async execute(
 sql: string,
 params?: unknown[],
 options?: { correlationId?: string }
 ): Promise<QueryResult> {
 try {
 logger.debug('Executing SQL command', {
 correlationId: options?.correlationId,
 sql: sql.slice(0, 100),
 paramCount: params?.length || 0,
 });

 const result = await this.connection.execute(sql, params);

 logger.debug('SQL command completed', {
 affectedRows: result.affectedRows,
 insertId: result.insertId,
 });

 return {
 rows: [],
 rowCount: result.affectedRows || 0,
 executionTimeMs: 0,
 affectedRows: result.affectedRows,
 insertId: result.insertId,
 };
 } catch (error) {
 logger.error('SQL command failed', {
 sql: sql.slice(0, 100),
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `SQL command failed:${error instanceof Error ? error.message : String(error)}`,
 { query: sql, params }
 );
 }
 }

 async transaction<T>(
 fn: (tx: SqlStorage) => Promise<T>,
 context?: TransactionContext
 ): Promise<T> {
 try {
 logger.debug('Starting SQL transaction');

 const result = await this.connection.transaction(async (txConnection) => {
 // Create a wrapper SqlStorage that uses the transaction connection
 const txStorage = new TransactionSQLStorageImpl(
 txConnection,
 this.config
 );
 return await fn(txStorage);
 }, context);

 logger.debug('SQL transaction completed successfully');
 return result;
 } catch (error) {
 logger.error('SQL transaction failed', {
 error: error instanceof Error ? error.message : String(error),
 });
 throw new TransactionError(
 `Transaction failed:${error instanceof Error ? error.message : String(error)}`
 );
 }
 }

 async createTable(name: string, schema: TableSchema): Promise<void> {
 try {
 logger.debug('Creating table', {
 name,
 columnCount: schema.columns?.length,
 });

 // Build CREATE TABLE statement from schema
 const columns =
 schema.columns
 ?.map(
 (col: {
 name: string;
 type: string;
 nullable?: boolean;
 primaryKey?: boolean;
 }) => {
 let columnDef = `${col.name} ${col.type}`;
 if (!col.nullable) columnDef += ' NOT NULL';
 if (col.defaultValue !== undefined)
 columnDef += ` DEFAULT ${col.defaultValue}`;
 return columnDef;
 }
 )
 .join(', ') || '';

 const primaryKey =
 schema.primaryKey?.length > 0
 ? `, PRIMARY KEY (${schema.primaryKey.join(', ')})`
 : '';

 const sql = `CREATE TABLE IF NOT EXISTS ${name} (${columns}${primaryKey})`;
 await this.execute(sql);

 logger.info('Table created successfully', { name });
 } catch (error) {
 logger.error('Failed to create table', {
 name,
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to create table:${error instanceof Error ? error.message : String(error)}`,
 {
 correlationId: this.generateCorrelationId(),
 cause: error instanceof Error ? error : undefined,
 }
 );
 }
 }

 async dropTable(
 name: string,
 options?: { ifExists?: boolean }
 ): Promise<void> {
 try {
 logger.debug('Dropping table', { name, ifExists: options?.ifExists });

 const ifExists = options?.ifExists !== false ? 'IF EXISTS ' : '';
 const sql = `DROP TABLE ${ifExists}${name}`;

 await this.execute(sql);

 logger.info('Table dropped successfully', { name });
 } catch (error) {
 logger.error('Failed to drop table', {
 name,
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to drop table:${error instanceof Error ? error.message : String(error)}`,
 {
 correlationId: this.generateCorrelationId(),
 cause: error instanceof Error ? error : undefined,
 }
 );
 }
 }

 async truncateTable(name: string): Promise<void> {
 try {
 logger.debug('Truncating table', { name });

 await this.execute(`DELETE FROM ${name}`);

 logger.info('Table truncated successfully', { name });
 } catch (error) {
 logger.error('Failed to truncate table', {
 name,
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to truncate table:${error instanceof Error ? error.message : String(error)}`,
 {
 correlationId: this.generateCorrelationId(),
 cause: error instanceof Error ? error : undefined,
 }
 );
 }
 }

 async getTableSchema(name: string): Promise<TableSchema | null> {
 try {
 logger.debug('Getting table schema', { name });

 const columns = await this.getTableInfo(name);
 if (columns.length === 0) {
 return null;
 }

 return {
 name,
 columns: columns.map((col) => ({
 name: col.name,
 type: col.type,
 nullable: col.nullable,
 defaultValue: undefined,
 maxLength: undefined,
 precision: undefined,
 scale: undefined,
 })),
 primaryKey: [],
 foreignKeys: [],
 indexes: [],
 };
 } catch (error) {
 logger.error('Failed to get table schema', {
 name,
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to get table schema:${error instanceof Error ? error.message : String(error)}`,
 {
 correlationId: this.generateCorrelationId(),
 cause: error instanceof Error ? error : undefined,
 }
 );
 }
 }

 async getTableInfo(
 tableName: string
 ): Promise<Array<{ name: string; type: string; nullable: boolean }>> {
 try {
 logger.debug('Getting table info', { tableName });

 const result = await this.query<{
 name: string;
 type: string;
 notnull: number;
 }>(`PRAGMA table_info(${tableName})`);

 const columns = result.rows.map((row) => ({
 name: row.name,
 type: row.type,
 nullable: row.notnull === 0,
 }));

 logger.debug('Table info retrieved', {
 tableName,
 columnCount: columns.length,
 });
 return columns;
 } catch (error) {
 logger.error('Failed to get table info', {
 tableName,
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to get table info:${error instanceof Error ? error.message : String(error)}`,
 { correlationId: this.generateCorrelationId() }
 );
 }
 }

 async listTables(): Promise<readonly string[]> {
 try {
 logger.debug('Listing tables');

 const result = await this.query<{ name: string }>(
 "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE ' sqlite_%'"
 );

 const tables = result.rows.map((row) => row.name);

 logger.debug('Tables listed', { tableCount: tables.length });
 return tables;
 } catch (error) {
 logger.error('Failed to list tables', {
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to list tables:${error instanceof Error ? error.message : String(error)}`
 );
 }
 }

 async createIndex(
 name: string,
 tableName: string,
 columns: readonly string[],
 options?: { unique?: boolean; type?: string }
 ): Promise<void> {
 try {
 const indexName = name;
 const unique = options?.unique ? 'UNIQUE' : '';
 const sql = `CREATE ${unique} INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns.join(', ')})`;

 logger.debug('Creating index', {
 tableName,
 columns,
 indexName,
 unique: !!options?.unique,
 });

 await this.execute(sql);

 logger.info('Index created successfully', { tableName, indexName });
 } catch (error) {
 logger.error('Failed to create index', {
 tableName,
 columns,
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to create index:${error instanceof Error ? error.message : String(error)}`,
 { correlationId: this.generateCorrelationId() }
 );
 }
 }

 async dropIndex(
 indexName: string,
 options?: { ifExists?: boolean }
 ): Promise<void> {
 try {
 logger.debug('Dropping index', { indexName, options });

 const query = options?.ifExists
 ? `DROP INDEX IF EXISTS ${indexName}`
 : `DROP INDEX ${indexName}`;
 await this.execute(query);

 logger.info('Index dropped successfully', { indexName });
 } catch (error) {
 logger.error('Failed to drop index', {
 indexName,
 error: error instanceof Error ? error.message : String(error),
 });
 throw new QueryError(
 `Failed to drop index:${error instanceof Error ? error.message : String(error)}`,
 { correlationId: this.generateCorrelationId() }
 );
 }
 }

 // Health and monitoring methods
 async isHealthy(): Promise<boolean> {
 try {
 await this.query('SELECT 1');
 return true;
 } catch {
 return false;
 }
 }

 async getStatistics(): Promise<{
 connectionStatus: 'connected' | 'disconnected';
 tableCount: number;
 version: string;
 }> {
 try {
 const isConnected = this.connection.isConnected();
 const tables = isConnected ? await this.listTables() : [];
 const versionResult = isConnected
 ? await this.query<{ version: string }>(
 'SELECT sqlite_version() as version'
 )
 : null;

 return {
 connectionStatus: isConnected ? 'connected' : 'disconnected',
 tableCount: tables.length,
 version: versionResult?.rows[0]?.version || 'unknown',
 };
 } catch (error) {
 logger.error('Failed to get statistics', {
 error: error instanceof Error ? error.message : String(error),
 });
 return {
 connectionStatus: 'disconnected',
 tableCount: 0,
 version: 'unknown',
 };
 }
 }

 async close(): Promise<void> {
 try {
 logger.debug('Closing SQL storage');
 await this.connection.disconnect();
 logger.info('SQL storage closed successfully');
 } catch (error) {
 logger.error('Failed to close SQL storage', {
 error: error instanceof Error ? error.message : String(error),
 });
 throw error;
 }
 }

 private generateCorrelationId(): string {
 return `sql-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 }
}
