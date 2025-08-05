/**
 * Database Domain Dependency Injection Providers
 * Implements comprehensive DI patterns for database management
 *
 * @file database-providers.ts
 * @description Enhanced database providers with DI integration for Issue #63
 */

import type {
  ConnectionStats,
  DatabaseAdapter,
  ExecuteResult,
  IConfig,
  ILogger,
  QueryResult,
  SchemaInfo,
  TransactionContext,
} from '../../core/interfaces/base-interfaces';
import { injectable } from '../../di/decorators/injectable';
import { CORE_TOKENS, DATABASE_TOKENS } from '../../di/tokens/core-tokens';

import {
  type DatabaseResult,
  isQueryError,
  isQuerySuccess,
  type QueryError,
  type QuerySuccess,
} from '../../utils/type-guards';

// Re-export DatabaseAdapter for external use
export { DatabaseAdapter } from '../../core/interfaces/base-interfaces';

/**
 * Graph database specific result interface
 */
export interface GraphResult {
  /** Graph nodes */
  nodes: Array<{
    id: any;
    labels: string[];
    properties: Record<string, any>;
  }>;
  /** Graph relationships */
  relationships: Array<{
    id: any;
    type: string;
    startNodeId: any;
    endNodeId: any;
    properties: Record<string, any>;
  }>;
  /** Query execution time */
  executionTime: number;
}

/**
 * Vector database specific result interface
 */
export interface VectorResult {
  /** Matching vectors with scores */
  matches: Array<{
    id: any;
    vector: number[];
    score: number;
    metadata?: Record<string, any>;
  }>;
  /** Query execution time */
  executionTime: number;
}

/**
 * Vector data interface for adding vectors
 */
export interface VectorData {
  /** Vector ID */
  id: any;
  /** Vector values */
  vector: number[];
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Vector index configuration
 */
export interface IndexConfig {
  /** Index name */
  name: string;
  /** Vector dimension */
  dimension: number;
  /** Distance metric */
  metric: 'cosine' | 'euclidean' | 'dot';
  /** Index type */
  type?: string;
}

/**
 * Graph database specific extensions
 * Extends the base DatabaseAdapter with graph-specific operations
 */
export interface GraphDatabaseAdapter extends DatabaseAdapter {
  /** Execute a graph query (e.g., Cypher) */
  queryGraph(cypher: string, params?: any[]): Promise<GraphResult>;
  /** Get total number of nodes in the graph */
  getNodeCount(): Promise<number>;
  /** Get total number of relationships in the graph */
  getRelationshipCount(): Promise<number>;
}

/**
 * Vector database specific extensions
 * Extends the base DatabaseAdapter with vector-specific operations
 */
export interface VectorDatabaseAdapter extends DatabaseAdapter {
  /** Perform vector similarity search */
  vectorSearch(query: number[], limit?: number): Promise<VectorResult>;
  /** Add vectors to the database */
  addVectors(vectors: VectorData[]): Promise<void>;
  /** Create a vector index */
  createIndex(config: IndexConfig): Promise<void>;
}

/**
 * Configuration interface for database adapters
 */
export interface DatabaseConfig {
  /** Type of database adapter to use */
  type: 'postgresql' | 'sqlite' | 'kuzu' | 'lancedb' | 'mysql';
  /** Connection string (if applicable) */
  connectionString?: string;
  /** Database host */
  host?: string;
  /** Database port */
  port?: number;
  /** Database name */
  database?: string;
  /** Username for authentication */
  username?: string;
  /** Password for authentication */
  password?: string;
  /** Connection pool configuration */
  pool?: {
    /** Minimum number of connections */
    min?: number;
    /** Maximum number of connections */
    max?: number;
    /** Connection timeout in milliseconds */
    timeout?: number;
    /** Idle timeout in milliseconds */
    idleTimeout?: number;
  };
  /** SSL configuration */
  ssl?: {
    /** Enable SSL */
    enabled?: boolean;
    /** Reject unauthorized certificates */
    rejectUnauthorized?: boolean;
    /** CA certificate */
    ca?: string;
    /** Client certificate */
    cert?: string;
    /** Client key */
    key?: string;
  };
  /** Additional adapter-specific options */
  options?: Record<string, any>;
}

/**
 * Factory for creating database adapter providers
 * Uses dependency injection for logger and configuration
 */
@injectable
export class DatabaseProviderFactory {
  constructor(
    private logger: ILogger,
    private config: IConfig
  ) {}

  /**
   * Create a database adapter based on configuration
   * @param config Database configuration
   * @returns Appropriate database adapter implementation
   */
  createAdapter(config: DatabaseConfig): DatabaseAdapter {
    this.logger.info(`Creating database adapter: ${config.type}`);

    try {
      switch (config.type) {
        case 'postgresql':
          return new PostgreSQLAdapter(config, this.logger);
        case 'sqlite':
          return new SQLiteAdapter(config, this.logger);
        case 'kuzu':
          return new KuzuAdapter(config, this.logger) as GraphDatabaseAdapter;
        case 'lancedb':
          return new LanceDBAdapter(config, this.logger) as VectorDatabaseAdapter;
        case 'mysql':
          return new MySQLAdapter(config, this.logger);
        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create database adapter: ${error}`);
      throw new Error(
        `Database adapter creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a graph database adapter (Kuzu)
   * @param config Database configuration for Kuzu
   * @returns GraphDatabaseAdapter implementation
   */
  createGraphAdapter(config: DatabaseConfig & { type: 'kuzu' }): GraphDatabaseAdapter {
    return new KuzuAdapter(config, this.logger);
  }

  /**
   * Create a vector database adapter (LanceDB)
   * @param config Database configuration for LanceDB
   * @returns VectorDatabaseAdapter implementation
   */
  createVectorAdapter(config: DatabaseConfig & { type: 'lancedb' }): VectorDatabaseAdapter {
    return new LanceDBAdapter(config, this.logger);
  }
}

/**
 * PostgreSQL database adapter implementation
 */
@injectable
export class PostgreSQLAdapter implements DatabaseAdapter {
  private connected = false;
  private connectionStats: ConnectionStats = {
    total: 0,
    active: 0,
    idle: 0,
    utilization: 0,
    averageConnectionTime: 0,
  };

  constructor(
    private config: DatabaseConfig,
    private logger: ILogger
  ) {}

  async connect(): Promise<void> {
    this.logger.info('Connecting to PostgreSQL database');

    try {
      // PostgreSQL connection implementation would go here
      // For now, simulate connection
      await this.simulateAsync(100);
      this.connected = true;
      this.connectionStats.total = this.config.pool?.max || 10;
      this.connectionStats.active = 1;
      this.connectionStats.idle = this.connectionStats.total - 1;
      this.connectionStats.utilization =
        (this.connectionStats.active / this.connectionStats.total) * 100;

      this.logger.info('Successfully connected to PostgreSQL database');
    } catch (error) {
      this.logger.error(`Failed to connect to PostgreSQL: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from PostgreSQL database');

    try {
      // PostgreSQL disconnection implementation would go here
      await this.simulateAsync(50);
      this.connected = false;
      this.connectionStats.active = 0;
      this.connectionStats.idle = 0;
      this.connectionStats.utilization = 0;

      this.logger.info('Successfully disconnected from PostgreSQL database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from PostgreSQL: ${error}`);
      throw error;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    this.logger.debug(`Executing PostgreSQL query: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // PostgreSQL query implementation would go here
      await this.simulateAsync(10);

      const executionTime = Date.now() - startTime;

      // Mock result for demonstration
      const result: QueryResult = {
        rows: [{ id: 1, name: 'Sample Data' }],
        rowCount: 1,
        fields: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'varchar', nullable: true },
        ],
        executionTime,
      };

      this.logger.debug(`PostgreSQL query completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`PostgreSQL query failed: ${error}`);
      throw error;
    }
  }

  /**
   * Enhanced query method with union type return for safe property access
   */
  async queryWithResult<T = any>(sql: string, params?: any[]): Promise<DatabaseResult<T>> {
    this.logger.debug(`Executing PostgreSQL query with result: ${sql}`);

    try {
      await this.ensureConnected();
      const startTime = Date.now();

      // PostgreSQL query implementation would go here
      await this.simulateAsync(10);

      const executionTime = Date.now() - startTime;

      // Mock successful result
      const successResult: QuerySuccess<T> = {
        success: true,
        data: [{ id: 1, name: 'Sample Data' }] as T,
        rowCount: 1,
        executionTime,
        fields: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'varchar', nullable: true },
        ],
      };

      this.logger.debug(`PostgreSQL query completed in ${executionTime}ms`);
      return successResult;
    } catch (error) {
      const executionTime = Date.now() - Date.now();
      this.logger.error(`PostgreSQL query failed: ${error}`);

      const errorResult: QueryError = {
        success: false,
        error: {
          code: 'POSTGRESQL_QUERY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: { sql, params },
          stack: error instanceof Error ? error.stack : undefined,
        },
        executionTime,
      };

      return errorResult;
    }
  }

  async execute(sql: string, params?: any[]): Promise<ExecuteResult> {
    this.logger.debug(`Executing PostgreSQL command: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // PostgreSQL execute implementation would go here
      await this.simulateAsync(15);

      const executionTime = Date.now() - startTime;

      // Mock result for demonstration
      const result: ExecuteResult = {
        affectedRows: 1,
        insertId: sql.toLowerCase().includes('insert') ? 123 : undefined,
        executionTime,
      };

      this.logger.debug(`PostgreSQL command completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`PostgreSQL command failed: ${error}`);
      throw error;
    }
  }

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    this.logger.debug('Starting PostgreSQL transaction');
    await this.ensureConnected();

    try {
      // PostgreSQL transaction implementation would go here
      const txContext: TransactionContext = {
        query: async (sql: string, params?: any[]) => this.query(sql, params),
        execute: async (sql: string, params?: any[]) => this.execute(sql, params),
        commit: async () => {
          this.logger.debug('Committing PostgreSQL transaction');
          await this.simulateAsync(5);
        },
        rollback: async () => {
          this.logger.debug('Rolling back PostgreSQL transaction');
          await this.simulateAsync(5);
        },
      };

      const result = await fn(txContext);
      await txContext.commit();

      this.logger.debug('PostgreSQL transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error(`PostgreSQL transaction failed: ${error}`);
      // Rollback would be implemented here
      throw error;
    }
  }

  async health(): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      // PostgreSQL health check implementation would go here
      await this.query('SELECT 1 as health_check');
      return true;
    } catch (error) {
      this.logger.error(`PostgreSQL health check failed: ${error}`);
      return false;
    }
  }

  async getSchema(): Promise<SchemaInfo> {
    this.logger.debug('Getting PostgreSQL schema information');
    await this.ensureConnected();

    try {
      // PostgreSQL schema query implementation would go here
      const schemaInfo: SchemaInfo = {
        tables: [
          {
            name: 'users',
            columns: [
              {
                name: 'id',
                type: 'integer',
                nullable: false,
                isPrimaryKey: true,
                isForeignKey: false,
              },
              {
                name: 'name',
                type: 'varchar',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'email',
                type: 'varchar',
                nullable: false,
                isPrimaryKey: false,
                isForeignKey: false,
              },
            ],
            indexes: [
              { name: 'users_pkey', columns: ['id'], unique: true },
              { name: 'users_email_idx', columns: ['email'], unique: true },
            ],
          },
        ],
        views: [],
        version: '13.0',
      };

      return schemaInfo;
    } catch (error) {
      this.logger.error(`Failed to get PostgreSQL schema: ${error}`);
      throw error;
    }
  }

  async getConnectionStats(): Promise<ConnectionStats> {
    return this.connectionStats;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }

  private async simulateAsync(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * SQLite database adapter implementation
 */
@injectable
export class SQLiteAdapter implements DatabaseAdapter {
  private connected = false;
  private connectionStats: ConnectionStats = {
    total: 1,
    active: 0,
    idle: 1,
    utilization: 0,
    averageConnectionTime: 0,
  };

  constructor(
    private config: DatabaseConfig,
    private logger: ILogger
  ) {}

  async connect(): Promise<void> {
    this.logger.info(`Connecting to SQLite database: ${this.config.database || ':memory:'}`);

    try {
      // SQLite connection implementation would go here
      await this.simulateAsync(50);
      this.connected = true;
      this.connectionStats.active = 1;
      this.connectionStats.idle = 0;
      this.connectionStats.utilization = 100;

      this.logger.info('Successfully connected to SQLite database');
    } catch (error) {
      this.logger.error(`Failed to connect to SQLite: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from SQLite database');

    try {
      // SQLite disconnection implementation would go here
      await this.simulateAsync(25);
      this.connected = false;
      this.connectionStats.active = 0;
      this.connectionStats.idle = 1;
      this.connectionStats.utilization = 0;

      this.logger.info('Successfully disconnected from SQLite database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from SQLite: ${error}`);
      throw error;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    this.logger.debug(`Executing SQLite query: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // SQLite query implementation would go here
      await this.simulateAsync(5);

      const executionTime = Date.now() - startTime;

      const result: QueryResult = {
        rows: [{ id: 1, data: 'SQLite Sample' }],
        rowCount: 1,
        fields: [
          { name: 'id', type: 'INTEGER', nullable: false },
          { name: 'data', type: 'TEXT', nullable: true },
        ],
        executionTime,
      };

      this.logger.debug(`SQLite query completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`SQLite query failed: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<ExecuteResult> {
    this.logger.debug(`Executing SQLite command: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // SQLite execute implementation would go here
      await this.simulateAsync(8);

      const executionTime = Date.now() - startTime;

      const result: ExecuteResult = {
        affectedRows: 1,
        insertId: sql.toLowerCase().includes('insert') ? 456 : undefined,
        executionTime,
      };

      this.logger.debug(`SQLite command completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`SQLite command failed: ${error}`);
      throw error;
    }
  }

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    this.logger.debug('Starting SQLite transaction');
    await this.ensureConnected();

    try {
      const txContext: TransactionContext = {
        query: async (sql: string, params?: any[]) => this.query(sql, params),
        execute: async (sql: string, params?: any[]) => this.execute(sql, params),
        commit: async () => {
          this.logger.debug('Committing SQLite transaction');
          await this.simulateAsync(3);
        },
        rollback: async () => {
          this.logger.debug('Rolling back SQLite transaction');
          await this.simulateAsync(3);
        },
      };

      const result = await fn(txContext);
      await txContext.commit();

      this.logger.debug('SQLite transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error(`SQLite transaction failed: ${error}`);
      throw error;
    }
  }

  async health(): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      await this.query('SELECT 1 as health_check');
      return true;
    } catch (error) {
      this.logger.error(`SQLite health check failed: ${error}`);
      return false;
    }
  }

  async getSchema(): Promise<SchemaInfo> {
    this.logger.debug('Getting SQLite schema information');
    await this.ensureConnected();

    try {
      const schemaInfo: SchemaInfo = {
        tables: [
          {
            name: 'sqlite_master',
            columns: [
              {
                name: 'type',
                type: 'text',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'name',
                type: 'text',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'tbl_name',
                type: 'text',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'sql',
                type: 'text',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
            ],
            indexes: [],
          },
        ],
        views: [],
        version: '3.0',
      };

      return schemaInfo;
    } catch (error) {
      this.logger.error(`Failed to get SQLite schema: ${error}`);
      throw error;
    }
  }

  async getConnectionStats(): Promise<ConnectionStats> {
    return this.connectionStats;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }

  private async simulateAsync(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Kuzu graph database adapter implementation
 */
@injectable
export class KuzuAdapter implements GraphDatabaseAdapter {
  private connected = false;
  private connectionStats: ConnectionStats = {
    total: 1,
    active: 0,
    idle: 1,
    utilization: 0,
    averageConnectionTime: 0,
  };

  constructor(
    private config: DatabaseConfig,
    private logger: ILogger
  ) {}

  async connect(): Promise<void> {
    this.logger.info('Connecting to Kuzu graph database');

    try {
      // Kuzu connection implementation would go here
      await this.simulateAsync(75);
      this.connected = true;
      this.connectionStats.active = 1;
      this.connectionStats.idle = 0;
      this.connectionStats.utilization = 100;

      this.logger.info('Successfully connected to Kuzu database');
    } catch (error) {
      this.logger.error(`Failed to connect to Kuzu: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from Kuzu database');

    try {
      // Kuzu disconnection implementation would go here
      await this.simulateAsync(25);
      this.connected = false;
      this.connectionStats.active = 0;
      this.connectionStats.idle = 1;
      this.connectionStats.utilization = 0;

      this.logger.info('Successfully disconnected from Kuzu database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from Kuzu: ${error}`);
      throw error;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    this.logger.debug(`Executing Kuzu query: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // Kuzu query implementation would go here
      await this.simulateAsync(20);

      const executionTime = Date.now() - startTime;

      const result: QueryResult = {
        rows: [{ node: { id: 1, properties: { name: 'Graph Node' } } }],
        rowCount: 1,
        fields: [{ name: 'node', type: 'NODE', nullable: false }],
        executionTime,
      };

      this.logger.debug(`Kuzu query completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`Kuzu query failed: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<ExecuteResult> {
    this.logger.debug(`Executing Kuzu command: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // Kuzu execute implementation would go here
      await this.simulateAsync(25);

      const executionTime = Date.now() - startTime;

      const result: ExecuteResult = {
        affectedRows: 1,
        executionTime,
      };

      this.logger.debug(`Kuzu command completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`Kuzu command failed: ${error}`);
      throw error;
    }
  }

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    this.logger.debug('Starting Kuzu transaction');
    await this.ensureConnected();

    try {
      const txContext: TransactionContext = {
        query: async (sql: string, params?: any[]) => this.query(sql, params),
        execute: async (sql: string, params?: any[]) => this.execute(sql, params),
        commit: async () => {
          this.logger.debug('Committing Kuzu transaction');
          await this.simulateAsync(10);
        },
        rollback: async () => {
          this.logger.debug('Rolling back Kuzu transaction');
          await this.simulateAsync(10);
        },
      };

      const result = await fn(txContext);
      await txContext.commit();

      this.logger.debug('Kuzu transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error(`Kuzu transaction failed: ${error}`);
      throw error;
    }
  }

  async health(): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      await this.query('MATCH (n) RETURN count(n) LIMIT 1');
      return true;
    } catch (error) {
      this.logger.error(`Kuzu health check failed: ${error}`);
      return false;
    }
  }

  // Graph-specific methods implementation
  async queryGraph(cypher: string, params?: any[]): Promise<GraphResult> {
    this.logger.debug(`Executing Kuzu graph query: ${cypher}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // Kuzu graph query implementation would go here
      await this.simulateAsync(25);

      const executionTime = Date.now() - startTime;

      // Mock graph result for demonstration
      const result: GraphResult = {
        nodes: [
          {
            id: 1,
            labels: ['Person'],
            properties: { name: 'Alice', age: 30 },
          },
          {
            id: 2,
            labels: ['Person'],
            properties: { name: 'Bob', age: 25 },
          },
        ],
        relationships: [
          {
            id: 1,
            type: 'KNOWS',
            startNodeId: 1,
            endNodeId: 2,
            properties: { since: '2020' },
          },
        ],
        executionTime,
      };

      this.logger.debug(`Kuzu graph query completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`Kuzu graph query failed: ${error}`);
      throw error;
    }
  }

  async getNodeCount(): Promise<number> {
    this.logger.debug('Getting Kuzu node count');
    await this.ensureConnected();

    try {
      // Kuzu node count implementation would go here
      await this.simulateAsync(10);

      // Mock result for demonstration
      return 1000;
    } catch (error) {
      this.logger.error(`Failed to get Kuzu node count: ${error}`);
      throw error;
    }
  }

  async getRelationshipCount(): Promise<number> {
    this.logger.debug('Getting Kuzu relationship count');
    await this.ensureConnected();

    try {
      // Kuzu relationship count implementation would go here
      await this.simulateAsync(10);

      // Mock result for demonstration
      return 2500;
    } catch (error) {
      this.logger.error(`Failed to get Kuzu relationship count: ${error}`);
      throw error;
    }
  }

  async getSchema(): Promise<SchemaInfo> {
    this.logger.debug('Getting Kuzu schema information');
    await this.ensureConnected();

    try {
      const schemaInfo: SchemaInfo = {
        tables: [
          {
            name: 'nodes',
            columns: [
              {
                name: 'id',
                type: 'INT64',
                nullable: false,
                isPrimaryKey: true,
                isForeignKey: false,
              },
              {
                name: 'label',
                type: 'STRING',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
            ],
            indexes: [],
          },
        ],
        views: [],
        version: '0.4.0',
      };

      return schemaInfo;
    } catch (error) {
      this.logger.error(`Failed to get Kuzu schema: ${error}`);
      throw error;
    }
  }

  async getConnectionStats(): Promise<ConnectionStats> {
    return this.connectionStats;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }

  private async simulateAsync(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * LanceDB vector database adapter implementation
 */
@injectable
export class LanceDBAdapter implements VectorDatabaseAdapter {
  private connected = false;
  private lanceInterface: any = null; // LanceDBInterface instance
  private connectionStats: ConnectionStats = {
    total: 1,
    active: 0,
    idle: 1,
    utilization: 0,
    averageConnectionTime: 0,
  };

  constructor(
    private config: DatabaseConfig,
    private logger: ILogger
  ) {}

  async connect(): Promise<void> {
    this.logger.info('Connecting to LanceDB vector database');

    try {
      // Import and initialize LanceDBInterface with config options
      const { default: LanceDBInterface } = await import('../lancedb-interface');

      const lanceConfig = {
        dbPath: this.config.database || './data/vectors.lance',
        vectorDim: this.config.options?.vectorSize || 384,
        similarity: this.config.options?.metricType || 'cosine',
        indexType: this.config.options?.indexType || 'IVF_PQ',
        batchSize: this.config.options?.batchSize || 1000,
      };

      this.lanceInterface = new LanceDBInterface(lanceConfig);
      await this.lanceInterface.initialize();

      this.connected = true;
      this.connectionStats.active = 1;
      this.connectionStats.idle = 0;
      this.connectionStats.utilization = 100;

      this.logger.info('Successfully connected to LanceDB database');
    } catch (error) {
      this.logger.error(`Failed to connect to LanceDB: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from LanceDB database');

    try {
      if (this.lanceInterface) {
        await this.lanceInterface.shutdown();
        this.lanceInterface = null;
      }

      this.connected = false;
      this.connectionStats.active = 0;
      this.connectionStats.idle = 1;
      this.connectionStats.utilization = 0;

      this.logger.info('Successfully disconnected from LanceDB database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from LanceDB: ${error}`);
      throw error;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    this.logger.debug(`Executing LanceDB query: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // Support vector similarity SQL syntax like:
      // "SELECT * FROM vectors WHERE column <-> [0.1,0.2,0.3] LIMIT 5"
      if (sql.includes('<->') || sql.toLowerCase().includes('vector')) {
        // Parse vector query to extract table name, vector, and limit
        const vectorMatch = sql.match(/\[([\d.,\s]+)\]/);
        const tableMatch = sql.match(/FROM\s+(\w+)/i);
        const limitMatch = sql.match(/LIMIT\s+(\d+)/i);

        if (vectorMatch && tableMatch) {
          const vectorStr = vectorMatch[1];
          const tableName = tableMatch[1];
          const limit = limitMatch ? parseInt(limitMatch[1]) : 10;

          // Parse vector from string
          const queryVector = vectorStr.split(',').map((v) => parseFloat(v.trim()));

          // Use vector search
          const vectorResults = await this.vectorSearch(queryVector, limit);

          const executionTime = Date.now() - startTime;

          // Convert vector results to QueryResult format
          const result: QueryResult = {
            rows: vectorResults.matches.map((match) => ({
              id: match.id,
              vector: match.vector,
              score: match.score,
              metadata: match.metadata,
            })),
            rowCount: vectorResults.matches.length,
            fields: [
              { name: 'id', type: 'TEXT', nullable: false },
              { name: 'vector', type: 'VECTOR', nullable: false },
              { name: 'score', type: 'FLOAT', nullable: false },
              { name: 'metadata', type: 'JSON', nullable: true },
            ],
            executionTime,
          };

          this.logger.debug(`LanceDB vector query completed in ${executionTime}ms`);
          return result;
        }
      }

      // For other queries, return basic schema info
      const executionTime = Date.now() - startTime;
      const result: QueryResult = {
        rows: [{ count: 1, status: 'ok' }],
        rowCount: 1,
        fields: [
          { name: 'count', type: 'INT64', nullable: false },
          { name: 'status', type: 'TEXT', nullable: false },
        ],
        executionTime,
      };

      this.logger.debug(`LanceDB query completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`LanceDB query failed: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<ExecuteResult> {
    this.logger.debug(`Executing LanceDB command: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // Handle CREATE TABLE, INSERT, DELETE operations for vectors
      let affectedRows = 0;

      if (sql.toLowerCase().includes('create table')) {
        // Extract table name and create it
        const tableMatch = sql.match(/CREATE TABLE\s+(\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          await this.lanceInterface.createTable(tableName, {
            id: 'string',
            vector: `array<float>(${this.lanceInterface.config?.vectorDim || 384})`,
            metadata: 'map<string, string>',
          });
          affectedRows = 1;
        }
      }

      const executionTime = Date.now() - startTime;

      const result: ExecuteResult = {
        affectedRows,
        executionTime,
      };

      this.logger.debug(`LanceDB command completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`LanceDB command failed: ${error}`);
      throw error;
    }
  }

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    this.logger.debug('Starting LanceDB transaction');
    await this.ensureConnected();

    try {
      const txContext: TransactionContext = {
        query: async (sql: string, params?: any[]) => this.query(sql, params),
        execute: async (sql: string, params?: any[]) => this.execute(sql, params),
        commit: async () => {
          this.logger.debug('Committing LanceDB transaction');
          // LanceDB handles transactions internally
        },
        rollback: async () => {
          this.logger.debug('Rolling back LanceDB transaction');
          // LanceDB handles rollbacks internally
        },
      };

      const result = await fn(txContext);
      await txContext.commit();

      this.logger.debug('LanceDB transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error(`LanceDB transaction failed: ${error}`);
      throw error;
    }
  }

  async health(): Promise<boolean> {
    try {
      if (!this.connected || !this.lanceInterface) {
        return false;
      }

      // Check if we can get database stats
      await this.lanceInterface.getStats();
      return true;
    } catch (error) {
      this.logger.error(`LanceDB health check failed: ${error}`);
      return false;
    }
  }

  // Vector-specific methods implementation
  async vectorSearch(query: number[], limit: number = 10): Promise<VectorResult> {
    this.logger.debug(`Executing LanceDB vector search with limit: ${limit}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // Use the real LanceDB interface for vector search
      const searchResults = await this.lanceInterface.searchSimilar('embeddings', query, limit);

      const executionTime = Date.now() - startTime;

      // Convert LanceDBInterface results to VectorResult format
      const result: VectorResult = {
        matches: searchResults.map((result: any) => ({
          id: result.id,
          vector: result.document?.vector || query, // fallback to query vector if not available
          score: result.score,
          metadata: result.metadata || {},
        })),
        executionTime,
      };

      this.logger.debug(`LanceDB vector search completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`LanceDB vector search failed: ${error}`);
      throw error;
    }
  }

  async addVectors(vectors: VectorData[]): Promise<void> {
    this.logger.debug(`Adding ${vectors.length} vectors to LanceDB`);
    await this.ensureConnected();

    try {
      // Convert VectorData format to LanceDBInterface format
      const documents = vectors.map((v) => ({
        id: v.id.toString(),
        vector: v.vector,
        metadata: v.metadata || {},
        timestamp: Date.now(),
      }));

      // Use the real LanceDB interface for adding vectors
      const result = await this.lanceInterface.insertVectors('embeddings', documents);

      if (result.errors.length > 0) {
        this.logger.warn(
          `Added ${result.inserted}/${vectors.length} vectors, ${result.errors.length} errors`
        );
      }

      this.logger.debug(`Successfully added ${result.inserted} vectors to LanceDB`);
    } catch (error) {
      this.logger.error(`Failed to add vectors to LanceDB: ${error}`);
      throw error;
    }
  }

  async createIndex(config: IndexConfig): Promise<void> {
    this.logger.debug(`Creating LanceDB index: ${config.name}`);
    await this.ensureConnected();

    try {
      // LanceDB handles indexing automatically, so we just ensure the table exists
      await this.lanceInterface.createTable('embeddings', {
        id: 'string',
        vector: `array<float>(${config.dimension})`,
        metadata: 'map<string, string>',
      });

      this.logger.debug(`Successfully created LanceDB index: ${config.name}`);
    } catch (error) {
      this.logger.error(`Failed to create LanceDB index: ${error}`);
      throw error;
    }
  }

  async getSchema(): Promise<SchemaInfo> {
    this.logger.debug('Getting LanceDB schema information');
    await this.ensureConnected();

    try {
      // Get real schema info from LanceDB
      const stats = await this.lanceInterface.getStats();
      const vectorDim = this.lanceInterface.config?.vectorDim || 384;

      const schemaInfo: SchemaInfo = {
        tables: [
          {
            name: 'embeddings',
            columns: [
              {
                name: 'id',
                type: 'STRING',
                nullable: false,
                isPrimaryKey: true,
                isForeignKey: false,
              },
              {
                name: 'vector',
                type: `VECTOR(${vectorDim})`,
                nullable: false,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'metadata',
                type: 'JSON',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'timestamp',
                type: 'INT64',
                nullable: true,
                isPrimaryKey: false,
                isForeignKey: false,
              },
            ],
            indexes: [{ name: 'vector_index', columns: ['vector'], unique: false }],
          },
        ],
        views: [],
        version: '0.21.1',
      };

      return schemaInfo;
    } catch (error) {
      this.logger.error(`Failed to get LanceDB schema: ${error}`);
      throw error;
    }
  }

  async getConnectionStats(): Promise<ConnectionStats> {
    return this.connectionStats;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }
}

/**
 * MySQL database adapter implementation
 */
@injectable
export class MySQLAdapter implements DatabaseAdapter {
  private connected = false;
  private connectionStats: ConnectionStats = {
    total: 0,
    active: 0,
    idle: 0,
    utilization: 0,
    averageConnectionTime: 0,
  };

  constructor(
    private config: DatabaseConfig,
    private logger: ILogger
  ) {}

  async connect(): Promise<void> {
    this.logger.info('Connecting to MySQL database');

    try {
      // MySQL connection implementation would go here
      await this.simulateAsync(80);
      this.connected = true;
      this.connectionStats.total = this.config.pool?.max || 5;
      this.connectionStats.active = 1;
      this.connectionStats.idle = this.connectionStats.total - 1;
      this.connectionStats.utilization =
        (this.connectionStats.active / this.connectionStats.total) * 100;

      this.logger.info('Successfully connected to MySQL database');
    } catch (error) {
      this.logger.error(`Failed to connect to MySQL: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from MySQL database');

    try {
      // MySQL disconnection implementation would go here
      await this.simulateAsync(40);
      this.connected = false;
      this.connectionStats.active = 0;
      this.connectionStats.idle = 0;
      this.connectionStats.utilization = 0;

      this.logger.info('Successfully disconnected from MySQL database');
    } catch (error) {
      this.logger.error(`Failed to disconnect from MySQL: ${error}`);
      throw error;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    this.logger.debug(`Executing MySQL query: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // MySQL query implementation would go here
      await this.simulateAsync(12);

      const executionTime = Date.now() - startTime;

      const result: QueryResult = {
        rows: [{ id: 1, name: 'MySQL Sample', created_at: new Date() }],
        rowCount: 1,
        fields: [
          { name: 'id', type: 'int', nullable: false },
          { name: 'name', type: 'varchar', nullable: true },
          { name: 'created_at', type: 'datetime', nullable: false },
        ],
        executionTime,
      };

      this.logger.debug(`MySQL query completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`MySQL query failed: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<ExecuteResult> {
    this.logger.debug(`Executing MySQL command: ${sql}`);
    await this.ensureConnected();

    const startTime = Date.now();

    try {
      // MySQL execute implementation would go here
      await this.simulateAsync(18);

      const executionTime = Date.now() - startTime;

      const result: ExecuteResult = {
        affectedRows: 1,
        insertId: sql.toLowerCase().includes('insert') ? 789 : undefined,
        executionTime,
      };

      this.logger.debug(`MySQL command completed in ${executionTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`MySQL command failed: ${error}`);
      throw error;
    }
  }

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    this.logger.debug('Starting MySQL transaction');
    await this.ensureConnected();

    try {
      const txContext: TransactionContext = {
        query: async (sql: string, params?: any[]) => this.query(sql, params),
        execute: async (sql: string, params?: any[]) => this.execute(sql, params),
        commit: async () => {
          this.logger.debug('Committing MySQL transaction');
          await this.simulateAsync(8);
        },
        rollback: async () => {
          this.logger.debug('Rolling back MySQL transaction');
          await this.simulateAsync(8);
        },
      };

      const result = await fn(txContext);
      await txContext.commit();

      this.logger.debug('MySQL transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error(`MySQL transaction failed: ${error}`);
      throw error;
    }
  }

  async health(): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      await this.query('SELECT 1 as health_check');
      return true;
    } catch (error) {
      this.logger.error(`MySQL health check failed: ${error}`);
      return false;
    }
  }

  async getSchema(): Promise<SchemaInfo> {
    this.logger.debug('Getting MySQL schema information');
    await this.ensureConnected();

    try {
      const schemaInfo: SchemaInfo = {
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'int', nullable: false, isPrimaryKey: true, isForeignKey: false },
              {
                name: 'username',
                type: 'varchar',
                nullable: false,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'email',
                type: 'varchar',
                nullable: false,
                isPrimaryKey: false,
                isForeignKey: false,
              },
              {
                name: 'created_at',
                type: 'datetime',
                nullable: false,
                isPrimaryKey: false,
                isForeignKey: false,
              },
            ],
            indexes: [
              { name: 'PRIMARY', columns: ['id'], unique: true },
              { name: 'users_email_unique', columns: ['email'], unique: true },
              { name: 'users_username_idx', columns: ['username'], unique: false },
            ],
          },
        ],
        views: [],
        version: '8.0',
      };

      return schemaInfo;
    } catch (error) {
      this.logger.error(`Failed to get MySQL schema: ${error}`);
      throw error;
    }
  }

  async getConnectionStats(): Promise<ConnectionStats> {
    return this.connectionStats;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }

  private async simulateAsync(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Type definitions for DI integration - removed duplicate interfaces
// These are now imported from base-interfaces.ts
