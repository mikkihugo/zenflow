/**
 * @fileoverview Database Types - Core Interface Definitions
 * 
 * Pure database types that are reusable across applications.
 * Application-specific entity types remain in the main app.
 */

// Database adapter configuration types
export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mysql' | 'lancedb' | 'kuzu';
  database: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  pool?: {
    min: number;
    max: number;
    timeout?: number;
    idleTimeout?: number;
  };
  ssl?: {
    enabled: boolean;
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  options?: Record<string, any>;
}

// Database adapter interface
export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<QueryResult>;
  execute(sql: string, params?: any[]): Promise<ExecuteResult>;
  transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
  health(): Promise<boolean>;
  getSchema(): Promise<SchemaInfo>;
  getConnectionStats(): Promise<ConnectionStats>;
}

// Query result types
export interface QueryResult {
  rows: any[];
  fields: FieldInfo[];
  rowCount: number;
  executionTime: number;
}

export interface ExecuteResult {
  affectedRows: number;
  insertId?: number | string;
  executionTime: number;
}

export interface FieldInfo {
  name: string;
  type: string;
  nullable: boolean;
}

// Transaction context
export interface TransactionContext {
  query(sql: string, params?: any[]): Promise<QueryResult>;
  execute(sql: string, params?: any[]): Promise<ExecuteResult>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Schema information
export interface SchemaInfo {
  tables: TableInfo[];
  views: ViewInfo[];
  version: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: any;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface ViewInfo {
  name: string;
  definition: string;
}

// Connection statistics
export interface ConnectionStats {
  total: number;
  active: number;
  idle: number;
  utilization: number;
  averageConnectionTime: number;
}

// Vector database types (LanceDB)
export interface VectorConfig extends DatabaseConfig {
  type: 'lancedb';
  options?: {
    vectorSize?: number;
    metricType?: 'cosine' | 'euclidean' | 'dot';
    indexType?: 'IVF_PQ' | 'IVF_FLAT';
  };
}

export interface VectorRecord {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

// Graph database types (Kuzu)
export interface GraphConfig extends DatabaseConfig {
  type: 'kuzu';
  options?: {
    bufferPoolSize?: string;
    maxNumThreads?: number;
  };
}

export interface GraphNode {
  id: string;
  label: string;
  properties?: Record<string, any>;
}

export interface GraphRelationship {
  from: string;
  to: string;
  type: string;
  properties?: Record<string, any>;
}