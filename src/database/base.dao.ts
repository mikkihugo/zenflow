/**
 * Unified Data Access Layer (DAL) - Base Repository Implementation
 *
 * Provides the base implementation for all repository types, with adapter pattern
 * to support different underlying database technologies.
 */

import type { DatabaseAdapter, ILogger } from '../../core/interfaces/base-interfaces';
import type {
  CustomQuery,
  DatabaseMetadata,
  HealthStatus,
  IDataAccessObject,
  IRepository,
  PerformanceMetrics,
  QueryOptions,
  SortCriteria,
  TransactionOperation,
} from './interfaces';

/**
 * Base repository implementation that adapts to different database types
 *
 * @template T The entity type this repository manages
 * @example
 */
export abstract class BaseDao<T> implements IDao<T> {
  protected constructor(
    protected adapter: DatabaseAdapter,
    protected logger: ILogger,
    protected tableName: string,
    protected entitySchema?: Record<string, any>
  ) {}

  /**
   * Find entity by ID
   *
   * @param id
   */
  async findById(id: string | number): Promise<T | null> {
    this.logger.debug(`Finding entity by ID: ${id} in table: ${this.tableName}`);

    try {
      const query = this.buildFindByIdQuery(id);
      const result = await this.adapter.query(query.sql, query.params);

      if (result.rowCount === 0) {
        return null;
      }

      return this.mapRowToEntity(result.rows[0]);
    } catch (error) {
      this.logger.error(`Failed to find entity by ID: ${error}`);
      throw new Error(
        `Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find entities by criteria
   *
   * @param criteria
   * @param options
   */
  async findBy(criteria: Partial<T>, options?: QueryOptions): Promise<T[]> {
    this.logger.debug(`Finding entities by criteria in table: ${this.tableName}`, {
      criteria,
      options,
    });

    try {
      const query = this.buildFindByQuery(criteria, options);
      const result = await this.adapter.query(query.sql, query.params);

      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find entities by criteria: ${error}`);
      throw new Error(
        `Find by criteria failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find all entities
   *
   * @param options
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    this.logger.debug(`Finding all entities in table: ${this.tableName}`, { options });

    try {
      const query = this.buildFindAllQuery(options);
      const result = await this.adapter.query(query.sql, query.params);

      return result.rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find all entities: ${error}`);
      throw new Error(
        `Find all failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a new entity
   *
   * @param entity
   */
  async create(entity: Omit<T, 'id'>): Promise<T> {
    this.logger.debug(`Creating entity in table: ${this.tableName}`, { entity });

    try {
      const query = this.buildCreateQuery(entity);
      const result = await this.adapter.execute(query.sql, query.params);

      // Get the created entity with its new ID
      if (result.insertId) {
        const created = await this.findById(result.insertId);
        if (!created) {
          throw new Error('Created entity not found after insertion');
        }
        return created;
      }

      // For databases without insertId, create the entity with all provided data
      return { ...entity, id: this.generateId() } as T;
    } catch (error) {
      this.logger.error(`Failed to create entity: ${error}`);
      throw new Error(`Create failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing entity
   *
   * @param id
   * @param updates
   */
  async update(id: string | number, updates: Partial<T>): Promise<T> {
    this.logger.debug(`Updating entity ID: ${id} in table: ${this.tableName}`, { updates });

    try {
      const query = this.buildUpdateQuery(id, updates);
      const result = await this.adapter.execute(query.sql, query.params);

      if (result.affectedRows === 0) {
        throw new Error(`Entity with ID ${id} not found for update`);
      }

      // Return the updated entity
      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Updated entity not found after update');
      }

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update entity: ${error}`);
      throw new Error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an entity by ID
   *
   * @param id
   */
  async delete(id: string | number): Promise<boolean> {
    this.logger.debug(`Deleting entity ID: ${id} from table: ${this.tableName}`);

    try {
      const query = this.buildDeleteQuery(id);
      const result = await this.adapter.execute(query.sql, query.params);

      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error(`Failed to delete entity: ${error}`);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count entities matching criteria
   *
   * @param criteria
   */
  async count(criteria?: Partial<T>): Promise<number> {
    this.logger.debug(`Counting entities in table: ${this.tableName}`, { criteria });

    try {
      const query = this.buildCountQuery(criteria);
      const result = await this.adapter.query(query.sql, query.params);

      return Number(result.rows[0]?.count || 0);
    } catch (error) {
      this.logger.error(`Failed to count entities: ${error}`);
      throw new Error(`Count failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if entity exists
   *
   * @param id
   */
  async exists(id: string | number): Promise<boolean> {
    this.logger.debug(`Checking if entity exists: ${id} in table: ${this.tableName}`);

    try {
      const entity = await this.findById(id);
      return entity !== null;
    } catch (error) {
      this.logger.error(`Failed to check entity existence: ${error}`);
      return false;
    }
  }

  /**
   * Execute custom query
   *
   * @param customQuery
   */
  async executeCustomQuery<R = any>(customQuery: CustomQuery): Promise<R> {
    this.logger.debug(`Executing custom query in table: ${this.tableName}`, { customQuery });

    try {
      if (typeof customQuery.query === 'string') {
        const result = await this.adapter.query(
          customQuery.query,
          customQuery.parameters ? Object.values(customQuery.parameters) : undefined
        );
        return result as R;
      } else {
        // Handle object-based queries (for NoSQL-like operations)
        return this.executeObjectQuery(customQuery) as R;
      }
    } catch (error) {
      this.logger.error(`Failed to execute custom query: ${error}`);
      throw new Error(
        `Custom query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Abstract methods that must be implemented by subclasses
   */

  /**
   * Map database row to entity
   */
  protected abstract mapRowToEntity(row: any): T;

  /**
   * Map entity to database row
   */
  protected abstract mapEntityToRow(entity: Partial<T>): Record<string, any>;

  /**
   * Build database-specific query builders
   */

  protected buildFindByIdQuery(id: string | number): { sql: string; params: any[] } {
    return {
      sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
      params: [id],
    };
  }

  protected buildFindByQuery(
    criteria: Partial<T>,
    options?: QueryOptions
  ): { sql: string; params: any[] } {
    const mappedCriteria = this.mapEntityToRow(criteria);
    const whereClause = this.buildWhereClause(mappedCriteria);
    const orderClause = this.buildOrderClause(options?.sort);
    const limitClause = this.buildLimitClause(options?.limit, options?.offset);

    const sql =
      `SELECT * FROM ${this.tableName} ${whereClause} ${orderClause} ${limitClause}`.trim();
    const params = Object.values(mappedCriteria);

    return { sql, params };
  }

  protected buildFindAllQuery(options?: QueryOptions): { sql: string; params: any[] } {
    const orderClause = this.buildOrderClause(options?.sort);
    const limitClause = this.buildLimitClause(options?.limit, options?.offset);

    const sql = `SELECT * FROM ${this.tableName} ${orderClause} ${limitClause}`.trim();

    return { sql, params: [] };
  }

  protected buildCreateQuery(entity: Omit<T, 'id'>): { sql: string; params: any[] } {
    const mappedEntity = this.mapEntityToRow(entity);
    const columns = Object.keys(mappedEntity).join(', ');
    const placeholders = Object.keys(mappedEntity)
      .map(() => '?')
      .join(', ');

    const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const params = Object.values(mappedEntity);

    return { sql, params };
  }

  protected buildUpdateQuery(
    id: string | number,
    updates: Partial<T>
  ): { sql: string; params: any[] } {
    const mappedUpdates = this.mapEntityToRow(updates);
    const setClause = Object.keys(mappedUpdates)
      .map((column) => `${column} = ?`)
      .join(', ');

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const params = [...Object.values(mappedUpdates), id];

    return { sql, params };
  }

  protected buildDeleteQuery(id: string | number): { sql: string; params: any[] } {
    return {
      sql: `DELETE FROM ${this.tableName} WHERE id = ?`,
      params: [id],
    };
  }

  protected buildCountQuery(criteria?: Partial<T>): { sql: string; params: any[] } {
    if (!criteria || Object.keys(criteria).length === 0) {
      return {
        sql: `SELECT COUNT(*) as count FROM ${this.tableName}`,
        params: [],
      };
    }

    const mappedCriteria = this.mapEntityToRow(criteria);
    const whereClause = this.buildWhereClause(mappedCriteria);

    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
    const params = Object.values(mappedCriteria);

    return { sql, params };
  }

  /**
   * Helper methods for query building
   */

  protected buildWhereClause(criteria: Record<string, any>): string {
    if (Object.keys(criteria).length === 0) {
      return '';
    }

    const conditions = Object.keys(criteria)
      .map((column) => `${column} = ?`)
      .join(' AND ');
    return `WHERE ${conditions}`;
  }

  protected buildOrderClause(sort?: SortCriteria[]): string {
    if (!sort || sort.length === 0) {
      return '';
    }

    const orderBy = sort.map((s) => `${s.field} ${s.direction.toUpperCase()}`).join(', ');
    return `ORDER BY ${orderBy}`;
  }

  protected buildLimitClause(limit?: number, offset?: number): string {
    if (!limit) {
      return '';
    }

    if (offset) {
      return `LIMIT ${limit} OFFSET ${offset}`;
    }

    return `LIMIT ${limit}`;
  }

  /**
   * Handle object-based queries (for NoSQL-like databases)
   *
   * @param customQuery
   */
  protected async executeObjectQuery(customQuery: CustomQuery): Promise<any> {
    // Default implementation - subclasses can override for NoSQL support
    throw new Error('Object-based queries not supported by this repository type');
  }

  /**
   * Generate ID for databases that don't support auto-increment
   */
  protected generateId(): string | number {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Base Data Access Object implementation
 *
 * @template T The entity type
 * @example
 */
export abstract class BaseManager<T> implements IManager<T> {
  protected constructor(
    protected repository: IRepository<T>,
    protected adapter: DatabaseAdapter,
    protected logger: ILogger
  ) {}

  /**
   * Get repository for basic CRUD operations
   */
  getRepository(): IRepository<T> {
    return this.repository;
  }

  /**
   * Execute transaction with multiple operations
   *
   * @param operations
   */
  async executeTransaction<R>(operations: TransactionOperation[]): Promise<R> {
    this.logger.debug(`Executing transaction with ${operations.length} operations`);

    try {
      return await this.adapter.transaction(async (tx) => {
        const results: any[] = [];

        for (const operation of operations) {
          let result: any;

          switch (operation.type) {
            case 'create':
              if (operation.data && operation.entityType) {
                result = await this.repository.create(operation.data);
              }
              break;

            case 'update':
              if (operation.data?.id && operation.data) {
                const { id, ...updates } = operation.data;
                result = await this.repository.update(id, updates);
              }
              break;

            case 'delete':
              if (operation.data?.id) {
                result = await this.repository.delete(operation.data.id);
              }
              break;

            case 'custom':
              if (operation.customQuery) {
                result = await this.repository.executeCustomQuery(operation.customQuery);
              }
              break;

            default:
              throw new Error(`Unsupported operation type: ${operation.type}`);
          }

          results.push(result);
        }

        return results as R;
      });
    } catch (error) {
      this.logger.error(`Transaction failed: ${error}`);
      throw new Error(
        `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get database-specific metadata
   */
  async getMetadata(): Promise<DatabaseMetadata> {
    this.logger.debug('Getting database metadata');

    try {
      const schema = await this.adapter.getSchema();

      return {
        type: this.getDatabaseType(),
        version: schema.version,
        features: this.getSupportedFeatures(),
        schema: schema,
        config: this.getConfiguration(),
      };
    } catch (error) {
      this.logger.error(`Failed to get database metadata: ${error}`);
      throw new Error(
        `Metadata retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<HealthStatus> {
    this.logger.debug('Performing database health check');

    try {
      const startTime = Date.now();
      const isHealthy = await this.adapter.health();
      const responseTime = Date.now() - startTime;

      const connectionStats = await this.adapter.getConnectionStats();

      const score = this.calculateHealthScore(isHealthy, responseTime, connectionStats);

      return {
        healthy: isHealthy,
        score,
        details: {
          responseTime,
          connectionStats,
          lastCheck: new Date(),
        },
        lastCheck: new Date(),
        errors: isHealthy ? undefined : ['Database health check failed'],
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error}`);

      return {
        healthy: false,
        score: 0,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        lastCheck: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<PerformanceMetrics> {
    this.logger.debug('Getting database performance metrics');

    try {
      const connectionStats = await this.adapter.getConnectionStats();

      return {
        averageQueryTime: connectionStats.averageConnectionTime || 0,
        queriesPerSecond: this.calculateQPS(connectionStats),
        connectionPool: {
          active: connectionStats.active,
          idle: connectionStats.idle,
          total: connectionStats.total,
          utilization: connectionStats.utilization,
        },
        memoryUsage: this.getMemoryUsage(),
        custom: this.getCustomMetrics(),
      };
    } catch (error) {
      this.logger.error(`Failed to get performance metrics: ${error}`);
      throw new Error(
        `Metrics retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Abstract methods for subclasses to implement
   */
  protected abstract getDatabaseType():
    | 'relational'
    | 'graph'
    | 'vector'
    | 'memory'
    | 'coordination';
  protected abstract getSupportedFeatures(): string[];
  protected abstract getConfiguration(): Record<string, any>;

  /**
   * Helper methods
   *
   * @param healthy
   * @param responseTime
   * @param connectionStats
   */
  protected calculateHealthScore(
    healthy: boolean,
    responseTime: number,
    connectionStats: any
  ): number {
    if (!healthy) return 0;

    let score = 100;

    // Deduct points for slow response time
    if (responseTime > 1000) score -= 30;
    else if (responseTime > 500) score -= 15;
    else if (responseTime > 200) score -= 5;

    // Deduct points for poor connection utilization
    if (connectionStats.utilization > 90) score -= 20;
    else if (connectionStats.utilization > 80) score -= 10;

    return Math.max(0, score);
  }

  protected calculateQPS(connectionStats: any): number {
    // Basic calculation - subclasses can provide more accurate implementations
    return connectionStats.active * 10; // Rough estimate
  }

  protected getMemoryUsage(): { used: number; total: number; percentage: number } | undefined {
    // Default implementation - subclasses can provide actual memory usage
    return undefined;
  }

  protected getCustomMetrics(): Record<string, any> | undefined {
    // Default implementation - subclasses can provide custom metrics
    return undefined;
  }
}
