/**
 * Unified Data Access Layer (DAL) - Base Repository Implementation.
 *
 * Provides the base implementation for all repository types, with adapter pattern.
 * To support different underlying database technologies.
 */
/**
 * @file Database layer: base.dao.
 */

import type {
  CustomQuery,
  DatabaseMetadata,
  SortCriteria,
  TransactionOperation,
  DataAccessObject,
  Repository,
  QueryOptions,
  HealthStatus,
  PerformanceMetrics,
} from './interfaces.js';

// Create a simple logger interface to avoid import issues
interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

// Import the full DatabaseAdapter interface instead of redefining
import type { DatabaseAdapter } from './interfaces.js';

/**
 * Base Data Access Object (DAO) with embedded Query DSL.
 * 
 * This class provides:
 * - Entity mapping (TypeScript objects ↔ database rows)
 * - Query DSL (buildFindByQuery, buildWhereClause, etc.) 
 * - CRUD operations with type safety
 * - SQL injection protection through parameter binding
 * - Database adapter abstraction
 * 
 * @template T The entity type this DAO manages.
 * @example Basic Usage
 * ```typescript
 * class UserDao extends BaseDao<User> {
 *   constructor(adapter: DatabaseAdapter, logger: Logger) {
 *     super(adapter, 'users', logger);
 *   }
 *   
 *   protected mapEntityToRow(entity: Partial<User>) {
 *     return { name: entity.name, email: entity.email };
 *   }
 *   
 *   protected mapRowToEntity(row: any): User {
 *     return { id: row.id, name: row.name, email: row.email };
 *   }
 * }
 * 
 * // Usage
 * const userDao = new UserDao(sqliteAdapter, logger);
 * const users = await userDao.findBy({ status: 'active' }, { limit: 10 });
 * ```
 * @example
 */
export abstract class BaseDao<T> implements Repository<T> {
  constructor(
    protected adapter: DatabaseAdapter,
    protected logger: Logger,
    protected tableName: string,
    protected entitySchema?: Record<string, unknown>
  ) {}

  /**
   * Abstract entity mapping methods - must be implemented by subclasses.
   * 
   * These methods provide the bridge between TypeScript entities and database rows,
   * handling field name mapping, type conversion, and data transformation.
   */
  
  /**
   * Convert database row to TypeScript entity.
   * 
   * @param row Raw database row object
   * @returns Typed entity object
   * @example
   * ```typescript
   * protected mapRowToEntity(row: any): User {
   *   return {
   *     id: row.id,
   *     firstName: row.first_name, // Handle snake_case → camelCase
   *     email: row.email,
   *     createdAt: new Date(row.created_at) // Handle date conversion
   *   };
   * }
   * ```
   */
  protected abstract mapRowToEntity(row: unknown): T;
  
  /**
   * Convert TypeScript entity to database row.
   * 
   * @param entity Partial entity object (for updates/inserts)
   * @returns Database row object with proper field names
   * @example
   * ```typescript
   * protected mapEntityToRow(entity: Partial<User>) {
   *   return {
   *     first_name: entity.firstName, // Handle camelCase → snake_case
   *     email: entity.email,
   *     created_at: entity.createdAt?.toISOString() // Handle date conversion
   *   };
   * }
   * ```
   */
  protected abstract mapEntityToRow(
    entity: Partial<T>
  ): Record<string, unknown>;

  /**
   * Find entity by ID.
   *
   * @param id
   */
  async findById(id: string | number): Promise<T | null> {
    this.logger.debug(
      `Finding entity by ID: ${id} in table: ${this.tableName}`
    );

    try {
      const query = this.buildFindByIdQuery(id);
      const result = await this.adapter.query(query.sql, query.params);

      if (result?.rowCount === 0) {
        return null;
      }

      return this.mapRowToEntity(result?.rows?.[0]);
    } catch (error) {
      this.logger.error(`Failed to find entity by ID: ${error}`);
      throw new Error(
        `Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find entities by criteria.
   *
   * @param criteria
   * @param options
   */
  async findBy(criteria: Partial<T>, options?: QueryOptions): Promise<T[]> {
    this.logger.debug(
      `Finding entities by criteria in table: ${this.tableName}`,
      {
        criteria,
        options,
      }
    );

    try {
      const query = this.buildFindByQuery(criteria, options);
      const result = await this.adapter.query(query.sql, query.params);

      return result?.rows.map((row: any) => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find entities by criteria: ${error}`);
      throw new Error(
        `Find by criteria failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find all entities.
   *
   * @param options
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    this.logger.debug(`Finding all entities in table: ${this.tableName}`, {
      options,
    });

    try {
      const query = this.buildFindAllQuery(options);
      const result = await this.adapter.query(query.sql, query.params);

      return result?.rows.map((row: any) => this.mapRowToEntity(row));
    } catch (error) {
      this.logger.error(`Failed to find all entities: ${error}`);
      throw new Error(
        `Find all failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a new entity.
   *
   * @param entity
   */
  async create(entity: Omit<T, 'id'>): Promise<T> {
    this.logger.debug(`Creating new entity in table: ${this.tableName}`, {
      entity,
    });

    try {
      const query = this.buildCreateQuery(entity);
      const result = await this.adapter.query(query.sql, query.params);

      // For most databases, we need to fetch the created entity
      if (result?.rows && result?.rows.length > 0) {
        return this.mapRowToEntity(result?.rows?.[0]);
      }

      // Fallback: assume auto-generated ID and fetch the entity
      const createdId = (result as any)?.rows?.[0]?.id || (result as any)?.rows?.[0]?.insertId;
      if (createdId) {
        const created = await this.findById(createdId);
        if (created) {
          return created;
        }
      }

      throw new Error('Failed to retrieve created entity');
    } catch (error) {
      this.logger.error(`Failed to create entity: ${error}`);
      throw new Error(
        `Create failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update an existing entity.
   *
   * @param id
   * @param updates
   */
  async update(id: string | number, updates: Partial<T>): Promise<T> {
    this.logger.debug(`Updating entity ${id} in table: ${this.tableName}`, {
      updates,
    });

    try {
      const query = this.buildUpdateQuery(id, updates);
      await this.adapter.query(query.sql, query.params);

      // Fetch the updated entity
      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Entity not found after update');
      }

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update entity: ${error}`);
      throw new Error(
        `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete an entity by ID.
   *
   * @param id
   */
  async delete(id: string | number): Promise<boolean> {
    this.logger.debug(`Deleting entity ${id} from table: ${this.tableName}`);

    try {
      const query = this.buildDeleteQuery(id);
      const result = await this.adapter.query(query.sql, query.params);

      return result?.rowCount > 0;
    } catch (error) {
      this.logger.error(`Failed to delete entity: ${error}`);
      throw new Error(
        `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Count entities matching criteria.
   *
   * @param criteria
   */
  async count(criteria?: Partial<T>): Promise<number> {
    this.logger.debug(`Counting entities in table: ${this.tableName}`, {
      criteria,
    });

    try {
      const query = this.buildCountQuery(criteria);
      const result = await this.adapter.query(query.sql, query.params);

      return (result as any)?.rows?.[0]?.count || 0;
    } catch (error) {
      this.logger.error(`Failed to count entities: ${error}`);
      throw new Error(
        `Count failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if entity exists.
   *
   * @param id
   */
  async exists(id: string | number): Promise<boolean> {
    this.logger.debug(
      `Checking if entity ${id} exists in table: ${this.tableName}`
    );

    try {
      const entity = await this.findById(id);
      return entity !== null;
    } catch (error) {
      this.logger.error(`Failed to check entity existence: ${error}`);
      return false;
    }
  }

  /**
   * Execute custom query specific to the underlying database.
   *
   * @param query
   */
  async executeCustomQuery<R = any>(query: CustomQuery): Promise<R> {
    this.logger.debug(`Executing custom query: ${query.type}`);

    try {
      let sql: string;
      let params: unknown[] = [];

      if (typeof query.query === 'string') {
        sql = query.query;
        params = Object.values(query.parameters || {});
      } else {
        // Handle object-based queries (could be extended for different DB types)
        sql = JSON.stringify(query.query);
        params = Object.values(query.parameters || {});
      }

      const result = await this.adapter.query(sql, params);
      return result as R;
    } catch (error) {
      this.logger.error(`Custom query failed: ${error}`);
      throw new Error(
        `Custom query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query building methods.
   *
   * @param id
   */
  protected buildFindByIdQuery(id: string | number): {
    sql: string;
    params: unknown[];
  } {
    return {
      sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
      params: [id],
    };
  }

  /**
   * 🔧 Query DSL: Build SELECT query with WHERE, ORDER BY, and LIMIT clauses.
   * 
   * This method constructs type-safe SELECT queries using the embedded DSL.
   * It handles parameter binding to prevent SQL injection.
   * 
   * @param criteria Entity fields to filter by (becomes WHERE clause)
   * @param options Query options (sorting, pagination, etc.)
   * @returns Object with SQL string and parameter array
   * 
   * @example Generated SQL
   * ```sql
   * SELECT * FROM users 
   * WHERE status = ? AND age > ? 
   * ORDER BY created_at DESC 
   * LIMIT 10 OFFSET 0
   * ```
   * 
   * @example Usage
   * ```typescript
   * const query = this.buildFindByQuery(
   *   { status: 'active', age: 18 },
   *   { sort: [{ field: 'createdAt', direction: 'desc' }], limit: 10 }
   * );
   * // query.sql = "SELECT * FROM users WHERE status = ? AND age = ? ORDER BY created_at DESC LIMIT 10"
   * // query.params = ['active', 18]
   * ```
   */
  protected buildFindByQuery(
    criteria: Partial<T>,
    options?: QueryOptions
  ): { sql: string; params: unknown[] } {
    const mappedCriteria = this.mapEntityToRow(criteria);
    const whereClause = this.buildWhereClause(mappedCriteria);
    const orderClause = this.buildOrderClause(options?.['sort']);
    const limitClause = this.buildLimitClause(
      options?.['limit'],
      options?.['offset']
    );

    const sql =
      `SELECT * FROM ${this.tableName} ${whereClause} ${orderClause} ${limitClause}`.trim();
    const params = Object.values(mappedCriteria);

    return { sql, params };
  }

  protected buildFindAllQuery(options?: QueryOptions): {
    sql: string;
    params: unknown[];
  } {
    const orderClause = this.buildOrderClause(options?.['sort']);
    const limitClause = this.buildLimitClause(
      options?.['limit'],
      options?.['offset']
    );

    const sql =
      `SELECT * FROM ${this.tableName} ${orderClause} ${limitClause}`.trim();

    return { sql, params: [] };
  }

  /**
   * 🔧 Query DSL: Build INSERT query for entity creation.
   * 
   * Constructs parameterized INSERT statements with proper field mapping.
   * Automatically handles primary key exclusion and parameter binding.
   * 
   * @param entity Entity data (without ID - auto-generated)
   * @returns Object with INSERT SQL and parameter array
   * 
   * @example Generated SQL
   * ```sql
   * INSERT NTO users (first_name, email, status) VALUES (?, ?, ?)
   * ```
   * 
   * @example Usage
   * ```typescript
   * const query = this.buildCreateQuery({ firstName: 'John', email: 'john@example.com' });
   * // query.sql = "INSERT NTO users (first_name, email) VALUES (?, ?)"
   * // query.params = ['John', 'john@example.com']
   * ```
   */
  protected buildCreateQuery(entity: Omit<T, 'id'>): {
    sql: string;
    params: unknown[];
  } {
    const mappedEntity = this.mapEntityToRow(entity as Partial<T>);
    const columns = Object.keys(mappedEntity).join(', ');
    const placeholders = Object.keys(mappedEntity)
      .map(() => '?')
      .join(', ');

    const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const params = Object.values(mappedEntity);

    return { sql, params };
  }

  /**
   * 🔧 Query DSL: Build UPDATE query for entity modification.
   * 
   * Creates parameterized UPDATE statements with SET clauses.
   * Only updates provided fields (partial updates supported).
   * 
   * @param id Primary key of entity to update
   * @param updates Partial entity with fields to update
   * @returns Object with UPDATE SQL and parameter array
   * 
   * @example Generated SQL
   * ```sql
   * UPDATE users SET first_name = ?, email = ? WHERE id = ?
   * ```
   * 
   * @example Usage
   * ```typescript
   * const query = this.buildUpdateQuery('123', { firstName: 'Jane' });
   * // query.sql = "UPDATE users SET first_name = ? WHERE id = ?"
   * // query.params = ['Jane', '123']
   * ```
   */
  protected buildUpdateQuery(
    id: string | number,
    updates: Partial<T>
  ): { sql: string; params: unknown[] } {
    const mappedUpdates = this.mapEntityToRow(updates);
    const setClause = Object.keys(mappedUpdates)
      .map((column) => `${column} = ?`)
      .join(', ');

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const params = [...Object.values(mappedUpdates), id];

    return { sql, params };
  }

  protected buildDeleteQuery(id: string | number): {
    sql: string;
    params: unknown[];
  } {
    return {
      sql: `DELETE FROM ${this.tableName} WHERE id = ?`,
      params: [id],
    };
  }

  protected buildCountQuery(criteria?: Partial<T>): {
    sql: string;
    params: unknown[];
  } {
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
   * 🔧 DSL Helper: Build WHERE clause from criteria object.
   * 
   * Converts entity fields into parameterized WHERE conditions.
   * Uses AND logic between conditions and prevents SQL injection.
   * 
   * @param criteria Object with column names and values
   * @returns WHERE clause string or empty string if no criteria
   * 
   * @example
   * ```typescript
   * buildWhereClause({ status: 'active', age: 25 })
   * // Returns: "WHERE status = ? AND age = ?"
   * 
   * buildWhereClause({})
   * // Returns: ""
   * ```
   */
  protected buildWhereClause(criteria: Record<string, unknown>): string {
    if (Object.keys(criteria).length === 0) {
      return '';
    }

    const conditions = Object.keys(criteria).map((column) => `${column} = ?`);
    return `WHERE ${conditions.join(' AND ')}`;
  }

  /**
   * 🔧 DSL Helper: Build ORDER BY clause from sort criteria.
   * 
   * Creates sorting clauses with proper SQL syntax.
   * Supports multiple fields with different directions.
   * 
   * @param sortCriteria Array of sort criteria objects
   * @returns ORDER BY clause string or empty string if no sorting
   * 
   * @example
   * ```typescript
   * buildOrderClause([{ field: 'created_at', direction: 'desc' }, { field: 'name', direction: 'asc' }])
   * // Returns: "ORDER BY created_at DESC, name ASC"
   * 
   * buildOrderClause([])
   * // Returns: ""
   * ```
   */
  protected buildOrderClause(sortCriteria?: SortCriteria[]): string {
    if (!sortCriteria || sortCriteria.length === 0) {
      return '';
    }

    const orderBy = sortCriteria
      .map((sort) => `${sort.field} ${sort.direction.toUpperCase()}`)
      .join(', ');

    return `ORDER BY ${orderBy}`;
  }

  /**
   * 🔧 DSL Helper: Build LIMIT clause for pagination.
   * 
   * Creates LIMIT and OFFSET clauses for result pagination.
   * Handles both simple limiting and offset-based pagination.
   * 
   * @param limit Maximum number of results to return
   * @param offset Number of results to skip (for pagination)
   * @returns LIMIT clause string or empty string if no limit
   * 
   * @example
   * ```typescript
   * buildLimitClause(10, 20)
   * // Returns: "LIMIT 10 OFFSET 20" (page 3 of 10 items per page)
   * 
   * buildLimitClause(5)
   * // Returns: "LIMIT 5" (first 5 results)
   * 
   * buildLimitClause()
   * // Returns: "" (no limit)
   * ```
   */
  protected buildLimitClause(limit?: number, offset?: number): string {
    if (!limit) {
      return '';
    }

    if (offset) {
      return `LIMIT ${limit} OFFSET ${offset}`;
    }

    return `LIMIT ${limit}`;
  }
}

/**
 * Base Data Access Object implementation that wraps a repository.
 *
 * @template T The entity type.
 * @example
 */
export abstract class BaseManager<T> implements DataAccessObject<T> {
  constructor(
    protected repository: Repository<T>,
    protected adapter: DatabaseAdapter,
    protected logger: Logger
  ) {}

  /**
   * Get repository for basic CRUD operations.
   */
  getRepository(): Repository<T> {
    return this.repository;
  }

  /**
   * Execute transaction with multiple operations.
   *
   * @param operations
   */
  async executeTransaction<R>(operations: TransactionOperation[]): Promise<R> {
    this.logger.debug(
      `Executing transaction with ${operations.length} operations`
    );

    try {
      return await this.adapter.transaction(async (_tx) => {
        const results: unknown[] = [];

        for (const operation of operations) {
          let result: unknown;

          switch (operation.type) {
            case 'create':
              if ((operation as any).data && (operation as any).entityType) {
                result = await this.repository.create((operation as any).data);
              }
              break;

            case 'update':
              if ((operation as any).data?.id && (operation as any).data) {
                const { id, ...updates } = (operation as any).data;
                result = await this.repository.update(id, updates);
              }
              break;

            case 'delete':
              if ((operation as any).data?.id) {
                result = await this.repository.delete((operation as any).data.id);
              }
              break;

            case 'custom':
              if (operation.customQuery) {
                result = await this.repository.executeCustomQuery(
                  operation.customQuery
                );
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
   * Get database-specific metadata.
   */
  async getMetadata(): Promise<DatabaseMetadata> {
    this.logger.debug('Getting database metadata');

    try {
      const schema = this.adapter.getSchema
        ? await this.adapter.getSchema()
        : {};

      return {
        type: this.getDatabaseType(),
        version: (schema as any).version || '1.0.0',
        features: this.getSupportedFeatures(),
        schema: schema as any,
        config: this.getConfiguration(),
      };
    } catch (error) {
      this.logger.error(`Failed to get database metadata: ${error}`);
      throw new Error(
        `Get metadata failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform health check.
   */
  async healthCheck(): Promise<HealthStatus> {
    this.logger.debug('Performing health check');

    try {
      // Basic health check - try to count entities
      const count = await this.repository.count();

      return {
        healthy: true,
        isHealthy: true,
        status: 'healthy',
        score: 100,
        details: {
          entityCount: count,
          accessible: true,
        },
        lastCheck: new Date(),
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error}`);

      return {
        healthy: false,
        isHealthy: false,
        status: 'error',
        score: 0,
        details: {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        lastCheck: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get performance metrics.
   */
  async getMetrics(): Promise<PerformanceMetrics> {
    this.logger.debug('Getting performance metrics');

    try {
      return {
        averageQueryTime: 0,
        queriesPerSecond: 0,
        connectionPool: {
          active: 1,
          idle: 0,
          total: 1,
          utilization: 100,
        },
        memoryUsage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        custom: {
          entityCount: await this.repository.count(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get performance metrics: ${error}`);
      throw new Error(
        `Get metrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Abstract methods for subclasses to implement.
   */
  protected abstract getDatabaseType(): DatabaseMetadata['type'];
  protected abstract getSupportedFeatures(): string[];
  protected abstract getConfiguration(): Record<string, unknown>;
}
