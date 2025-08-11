/**
 * Unified Data Access Layer (DAL) - Base Repository Implementation.
 *
 * Provides the base implementation for all repository types, with adapter pattern.
 * To support different underlying database technologies.
 */
/**
 * @file Database layer: base.dao.
 */
import type { CustomQuery, DatabaseMetadata, SortCriteria, TransactionOperation } from '../database/interfaces.ts';
import type { HealthStatus } from '../types/health-types';
import type { PerformanceMetrics } from '../types/performance-types';
import type { IDataAccessObject, IRepository, QueryOptions } from './interfaces.ts';
interface ILogger {
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
interface DatabaseAdapter {
    query(sql: string, params?: any[]): Promise<{
        rows: any[];
        rowCount: number;
    }>;
    execute(sql: string, params?: any[]): Promise<{
        affectedRows: number;
        insertId?: any;
    }>;
    transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
    getSchema?(): Promise<any>;
}
/**
 * Base repository implementation that adapts to different database types.
 *
 * @template T The entity type this repository manages.
 * @example
 */
export declare abstract class BaseDao<T> implements IRepository<T> {
    protected adapter: DatabaseAdapter;
    protected logger: ILogger;
    protected tableName: string;
    protected entitySchema?: Record<string, any> | undefined;
    protected constructor(adapter: DatabaseAdapter, logger: ILogger, tableName: string, entitySchema?: Record<string, any> | undefined);
    /**
     * Abstract methods that must be implemented by subclasses.
     */
    protected abstract mapRowToEntity(row: any): T;
    protected abstract mapEntityToRow(entity: Partial<T>): Record<string, any>;
    /**
     * Find entity by ID.
     *
     * @param id
     */
    findById(id: string | number): Promise<T | null>;
    /**
     * Find entities by criteria.
     *
     * @param criteria
     * @param options
     */
    findBy(criteria: Partial<T>, options?: QueryOptions): Promise<T[]>;
    /**
     * Find all entities.
     *
     * @param options
     */
    findAll(options?: QueryOptions): Promise<T[]>;
    /**
     * Create a new entity.
     *
     * @param entity
     */
    create(entity: Omit<T, 'id'>): Promise<T>;
    /**
     * Update an existing entity.
     *
     * @param id
     * @param updates
     */
    update(id: string | number, updates: Partial<T>): Promise<T>;
    /**
     * Delete an entity by ID.
     *
     * @param id
     */
    delete(id: string | number): Promise<boolean>;
    /**
     * Count entities matching criteria.
     *
     * @param criteria
     */
    count(criteria?: Partial<T>): Promise<number>;
    /**
     * Check if entity exists.
     *
     * @param id
     */
    exists(id: string | number): Promise<boolean>;
    /**
     * Execute custom query specific to the underlying database.
     *
     * @param query
     */
    executeCustomQuery<R = any>(query: CustomQuery): Promise<R>;
    /**
     * Query building methods.
     *
     * @param id
     */
    protected buildFindByIdQuery(id: string | number): {
        sql: string;
        params: any[];
    };
    protected buildFindByQuery(criteria: Partial<T>, options?: QueryOptions): {
        sql: string;
        params: any[];
    };
    protected buildFindAllQuery(options?: QueryOptions): {
        sql: string;
        params: any[];
    };
    protected buildCreateQuery(entity: Omit<T, 'id'>): {
        sql: string;
        params: any[];
    };
    protected buildUpdateQuery(id: string | number, updates: Partial<T>): {
        sql: string;
        params: any[];
    };
    protected buildDeleteQuery(id: string | number): {
        sql: string;
        params: any[];
    };
    protected buildCountQuery(criteria?: Partial<T>): {
        sql: string;
        params: any[];
    };
    protected buildWhereClause(criteria: Record<string, any>): string;
    protected buildOrderClause(sortCriteria?: SortCriteria[]): string;
    protected buildLimitClause(limit?: number, offset?: number): string;
}
/**
 * Base Data Access Object implementation that wraps a repository.
 *
 * @template T The entity type.
 * @example
 */
export declare abstract class BaseManager<T> implements IDataAccessObject<T> {
    protected repository: IRepository<T>;
    protected adapter: DatabaseAdapter;
    protected logger: ILogger;
    protected constructor(repository: IRepository<T>, adapter: DatabaseAdapter, logger: ILogger);
    /**
     * Get repository for basic CRUD operations.
     */
    getRepository(): IRepository<T>;
    /**
     * Execute transaction with multiple operations.
     *
     * @param operations
     */
    executeTransaction<R>(operations: TransactionOperation[]): Promise<R>;
    /**
     * Get database-specific metadata.
     */
    getMetadata(): Promise<DatabaseMetadata>;
    /**
     * Perform health check.
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * Get performance metrics.
     */
    getMetrics(): Promise<PerformanceMetrics>;
    /**
     * Abstract methods for subclasses to implement.
     */
    protected abstract getDatabaseType(): DatabaseMetadata['type'];
    protected abstract getSupportedFeatures(): string[];
    protected abstract getConfiguration(): Record<string, any>;
}
export {};
//# sourceMappingURL=base.dao.d.ts.map