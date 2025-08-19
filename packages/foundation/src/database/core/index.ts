/**
 * @fileoverview Database Core - Base Classes and Utilities
 * 
 * Core database abstractions that provide common functionality
 * across different database adapters.
 */

import type { DatabaseAdapter, QueryResult, ExecuteResult } from '../types/index.js';
import { getLogger, type Logger } from '../logger.js';

/**
 * Base database adapter providing common functionality
 */
export abstract class BaseDatabaseAdapter implements DatabaseAdapter {
  protected logger: Logger;
  protected isConnected = false;

  constructor(
    protected config: any,
    logger?: Logger
  ) {
    this.logger = logger || getLogger('DatabaseAdapter');
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract query(sql: string, params?: any[]): Promise<QueryResult>;
  abstract execute(sql: string, params?: any[]): Promise<ExecuteResult>;
  abstract transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
  abstract getSchema(): Promise<any>;
  abstract getConnectionStats(): Promise<any>;

  async health(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      
      // Try a simple query to test connectivity
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }

  protected logQuery(sql: string, params?: any[], executionTime?: number): void {
    this.logger.debug('Query executed', {
      sql: sql.slice(0, 200) + (sql.length > 200 ? '...' : ''),
      params: params?.slice(0, 5),
      executionTime
    });
  }

  protected handleError(error: any, context: string): never {
    this.logger.error(`Database error in ${context}:`, error);
    throw new DatabaseError(`${context} failed: ${error.message}`, error);
  }
}

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Database connection pool base class
 */
export abstract class BaseConnectionPool {
  protected abstract minConnections: number;
  protected abstract maxConnections: number;
  protected abstract connections: any[];
  protected abstract availableConnections: any[];

  abstract acquire(): Promise<any>;
  abstract release(connection: any): Promise<void>;
  abstract destroy(): Promise<void>;

  get totalConnections(): number {
    return this.connections.length;
  }

  get availableConnectionCount(): number {
    return this.availableConnections.length;
  }

  get activeConnectionCount(): number {
    return this.connections.length - this.availableConnections.length;
  }

  get utilization(): number {
    return (this.activeConnectionCount / this.maxConnections) * 100;
  }
}

/**
 * Query builder utilities
 */
export class QueryBuilder {
  private selectFields: string[] = [];
  private fromTable = '';
  private whereConditions: string[] = [];
  private orderByFields: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  select(fields: string | string[]): this {
    if (typeof fields === 'string') {
      this.selectFields.push(fields);
    } else {
      this.selectFields.push(...fields);
    }
    return this;
  }

  from(table: string): this {
    this.fromTable = table;
    return this;
  }

  where(condition: string): this {
    this.whereConditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByFields.push(`${field} ${direction}`);
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  toSQL(): string {
    let sql = 'SELECT ';
    sql += this.selectFields.length > 0 ? this.selectFields.join(', ') : '*';
    sql += ` FROM ${this.fromTable}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByFields.length > 0) {
      sql += ` ORDER BY ${this.orderByFields.join(', ')}`;
    }
    
    if (this.limitValue !== undefined) {
      sql += ` LIMIT ${this.limitValue}`;
    }
    
    if (this.offsetValue !== undefined) {
      sql += ` OFFSET ${this.offsetValue}`;
    }
    
    return sql;
  }
}