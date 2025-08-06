/**
 * Relational Database Repository Implementation
 * 
 * Handles PostgreSQL, MySQL, SQLite and other SQL-based databases
 * with standardized CRUD operations and query building.
 */

import { BaseDao } from '../base.dao';
import type { IDao } from '../interfaces';
import type { DatabaseAdapter, ILogger } from '../../../core/interfaces/base-interfaces';

/**
 * Relational database repository implementation
 * @template T The entity type this repository manages
 */
export class RelationalDao<T> extends BaseDao<T> implements IDao<T> {
  constructor(
    adapter: DatabaseAdapter,
    logger: ILogger,
    tableName: string,
    entitySchema?: Record<string, any>
  ) {
    super(adapter, logger, tableName, entitySchema);
  }

  /**
   * Map database row to entity
   * Handles common SQL data type conversions
   */
  protected mapRowToEntity(row: any): T {
    if (!row) {
      throw new Error('Cannot map null/undefined row to entity');
    }

    const entity: any = {};

    // Handle common SQL data type conversions
    for (const [key, value] of Object.entries(row)) {
      if (value === null || value === undefined) {
        entity[key] = value;
        continue;
      }

      // Handle JSON columns
      if (typeof value === 'string' && this.isJsonColumn(key)) {
        try {
          entity[key] = JSON.parse(value);
        } catch {
          entity[key] = value;
        }
        continue;
      }

      // Handle boolean columns (SQLite stores as 0/1)
      if (this.isBooleanColumn(key)) {
        entity[key] = Boolean(value);
        continue;
      }

      // Handle date columns
      if (this.isDateColumn(key)) {
        entity[key] = value instanceof Date ? value : new Date(value);
        continue;
      }

      // Handle number columns
      if (this.isNumberColumn(key) && typeof value === 'string') {
        const numValue = Number(value);
        entity[key] = isNaN(numValue) ? value : numValue;
        continue;
      }

      // Default: use value as-is
      entity[key] = value;
    }

    return entity as T;
  }

  /**
   * Map entity to database row
   * Handles common SQL data type conversions for storage
   */
  protected mapEntityToRow(entity: Partial<T>): Record<string, any> {
    if (!entity) {
      return {};
    }

    const row: any = {};

    for (const [key, value] of Object.entries(entity)) {
      if (value === null || value === undefined) {
        row[key] = value;
        continue;
      }

      // Handle JSON columns - serialize objects/arrays
      if (this.isJsonColumn(key) && (typeof value === 'object' || Array.isArray(value))) {
        row[key] = JSON.stringify(value);
        continue;
      }

      // Handle date columns - ensure proper format
      if (this.isDateColumn(key)) {
        if (value instanceof Date) {
          row[key] = value.toISOString();
        } else if (typeof value === 'string' || typeof value === 'number') {
          row[key] = new Date(value).toISOString();
        } else {
          row[key] = value;
        }
        continue;
      }

      // Handle boolean columns
      if (this.isBooleanColumn(key)) {
        row[key] = Boolean(value);
        continue;
      }

      // Default: use value as-is
      row[key] = value;
    }

    return row;
  }

  /**
   * Enhanced query methods for SQL-specific operations
   */

  /**
   * Find entities with JOIN operations
   */
  async findWithJoin(
    joinTable: string,
    joinCondition: string,
    criteria?: Partial<T>,
    options?: any
  ): Promise<T[]> {
    this.logger.debug(`Finding entities with JOIN: ${this.tableName} JOIN ${joinTable}`);

    try {
      const whereClause = criteria ? this.buildWhereClause(this.mapEntityToRow(criteria)) : '';
      const orderClause = this.buildOrderClause(options?.sort);
      const limitClause = this.buildLimitClause(options?.limit, options?.offset);

      const sql = `
        SELECT ${this.tableName}.* 
        FROM ${this.tableName} 
        JOIN ${joinTable} ON ${joinCondition} 
        ${whereClause} 
        ${orderClause} 
        ${limitClause}
      `.trim();

      const params = criteria ? Object.values(this.mapEntityToRow(criteria)) : [];
      const result = await this.adapter.query(sql, params);

      return result.rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`JOIN query failed: ${error}`);
      throw new Error(`JOIN query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute aggregate queries (COUNT, SUM, AVG, etc.)
   */
  async aggregate(
    aggregateFunction: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX',
    column: string = '*',
    criteria?: Partial<T>
  ): Promise<number> {
    this.logger.debug(`Executing aggregate ${aggregateFunction}(${column}) on ${this.tableName}`);

    try {
      const whereClause = criteria ? this.buildWhereClause(this.mapEntityToRow(criteria)) : '';
      const sql = `SELECT ${aggregateFunction}(${column}) as result FROM ${this.tableName} ${whereClause}`;
      const params = criteria ? Object.values(this.mapEntityToRow(criteria)) : [];

      const result = await this.adapter.query(sql, params);
      return Number(result.rows[0]?.result || 0);
    } catch (error) {
      this.logger.error(`Aggregate query failed: ${error}`);
      throw new Error(`Aggregate query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch insert multiple entities
   */
  async batchInsert(entities: Omit<T, 'id'>[]): Promise<T[]> {
    if (entities.length === 0) return [];

    this.logger.debug(`Batch inserting ${entities.length} entities into ${this.tableName}`);

    try {
      const mappedEntities = entities.map(entity => this.mapEntityToRow(entity));
      const columns = Object.keys(mappedEntities[0]);
      const columnsList = columns.join(', ');
      
      // Build VALUES clause with placeholders
      const valuesPlaceholders = mappedEntities
        .map(() => `(${columns.map(() => '?').join(', ')})`)
        .join(', ');

      const sql = `INSERT INTO ${this.tableName} (${columnsList}) VALUES ${valuesPlaceholders}`;
      
      // Flatten all parameters
      const params = mappedEntities.flatMap(entity => Object.values(entity));

      await this.adapter.execute(sql, params);

      // Return the created entities (approximation since we can't get all IDs easily)
      return entities.map((entity, index) => ({
        ...entity,
        id: `batch_${Date.now()}_${index}`
      })) as T[];
    } catch (error) {
      this.logger.error(`Batch insert failed: ${error}`);
      throw new Error(`Batch insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update multiple entities matching criteria
   */
  async updateMany(criteria: Partial<T>, updates: Partial<T>): Promise<number> {
    this.logger.debug(`Updating multiple entities in ${this.tableName}`, { criteria, updates });

    try {
      const mappedCriteria = this.mapEntityToRow(criteria);
      const mappedUpdates = this.mapEntityToRow(updates);
      
      const setClause = Object.keys(mappedUpdates).map(column => `${column} = ?`).join(', ');
      const whereClause = this.buildWhereClause(mappedCriteria);

      const sql = `UPDATE ${this.tableName} SET ${setClause} ${whereClause}`;
      const params = [...Object.values(mappedUpdates), ...Object.values(mappedCriteria)];

      const result = await this.adapter.execute(sql, params);
      return result.affectedRows;
    } catch (error) {
      this.logger.error(`Update many failed: ${error}`);
      throw new Error(`Update many failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple entities matching criteria
   */
  async deleteMany(criteria: Partial<T>): Promise<number> {
    this.logger.debug(`Deleting multiple entities from ${this.tableName}`, { criteria });

    try {
      const mappedCriteria = this.mapEntityToRow(criteria);
      const whereClause = this.buildWhereClause(mappedCriteria);

      if (!whereClause) {
        throw new Error('DELETE without WHERE clause is not allowed for safety');
      }

      const sql = `DELETE FROM ${this.tableName} ${whereClause}`;
      const params = Object.values(mappedCriteria);

      const result = await this.adapter.execute(sql, params);
      return result.affectedRows;
    } catch (error) {
      this.logger.error(`Delete many failed: ${error}`);
      throw new Error(`Delete many failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search using LIKE operator
   */
  async search(field: string, searchTerm: string, options?: any): Promise<T[]> {
    this.logger.debug(`Searching in ${this.tableName}.${field} for: ${searchTerm}`);

    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE ${field} LIKE ?`;
      const params = [`%${searchTerm}%`];

      const result = await this.adapter.query(sql, params);
      return result.rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Search failed: ${error}`);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get entities by date range
   */
  async findByDateRange(
    dateField: string,
    startDate: Date,
    endDate: Date,
    options?: any
  ): Promise<T[]> {
    this.logger.debug(`Finding entities by date range: ${dateField} between ${startDate} and ${endDate}`);

    try {
      const orderClause = this.buildOrderClause(options?.sort);
      const limitClause = this.buildLimitClause(options?.limit, options?.offset);

      const sql = `
        SELECT * FROM ${this.tableName} 
        WHERE ${dateField} >= ? AND ${dateField} <= ? 
        ${orderClause} 
        ${limitClause}
      `.trim();

      const params = [startDate.toISOString(), endDate.toISOString()];
      const result = await this.adapter.query(sql, params);

      return result.rows.map(row => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Date range query failed: ${error}`);
      throw new Error(`Date range query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper methods for type checking based on schema
   */
  private isJsonColumn(columnName: string): boolean {
    return this.entitySchema?.[columnName]?.type === 'json' || 
           columnName.endsWith('_json') || 
           columnName === 'metadata' || 
           columnName === 'properties' ||
           columnName === 'data';
  }

  private isBooleanColumn(columnName: string): boolean {
    return this.entitySchema?.[columnName]?.type === 'boolean' ||
           columnName.startsWith('is_') ||
           columnName.startsWith('has_') ||
           columnName.endsWith('_flag') ||
           ['active', 'enabled', 'visible', 'deleted'].includes(columnName);
  }

  private isDateColumn(columnName: string): boolean {
    return this.entitySchema?.[columnName]?.type === 'date' ||
           this.entitySchema?.[columnName]?.type === 'datetime' ||
           columnName.endsWith('_at') ||
           columnName.endsWith('_date') ||
           columnName.endsWith('_time') ||
           ['created', 'updated', 'deleted', 'timestamp'].includes(columnName);
  }

  private isNumberColumn(columnName: string): boolean {
    return this.entitySchema?.[columnName]?.type === 'number' ||
           this.entitySchema?.[columnName]?.type === 'integer' ||
           this.entitySchema?.[columnName]?.type === 'float' ||
           columnName.endsWith('_id') ||
           columnName.endsWith('_count') ||
           columnName.endsWith('_size') ||
           ['id', 'count', 'size', 'length', 'duration'].includes(columnName);
  }
}