/**
 * Unified Data Access Layer (DAL) - Base Repository Implementation.
 *
 * Provides the base implementation for all repository types, with adapter pattern.
 * To support different underlying database technologies.
 */
/**
 * @file Database layer: base.dao.
 */
/**
 * Base repository implementation that adapts to different database types.
 *
 * @template T The entity type this repository manages.
 * @example
 */
export class BaseDao {
    adapter;
    logger;
    tableName;
    entitySchema;
    constructor(adapter, logger, tableName, entitySchema) {
        this.adapter = adapter;
        this.logger = logger;
        this.tableName = tableName;
        this.entitySchema = entitySchema;
    }
    /**
     * Find entity by ID.
     *
     * @param id
     */
    async findById(id) {
        this.logger.debug(`Finding entity by ID: ${id} in table: ${this.tableName}`);
        try {
            const query = this.buildFindByIdQuery(id);
            const result = await this.adapter.query(query.sql, query.params);
            if (result?.rowCount === 0) {
                return null;
            }
            return this.mapRowToEntity(result?.rows?.[0]);
        }
        catch (error) {
            this.logger.error(`Failed to find entity by ID: ${error}`);
            throw new Error(`Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Find entities by criteria.
     *
     * @param criteria
     * @param options
     */
    async findBy(criteria, options) {
        this.logger.debug(`Finding entities by criteria in table: ${this.tableName}`, {
            criteria,
            options,
        });
        try {
            const query = this.buildFindByQuery(criteria, options);
            const result = await this.adapter.query(query.sql, query.params);
            return result?.rows.map((row) => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error(`Failed to find entities by criteria: ${error}`);
            throw new Error(`Find by criteria failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Find all entities.
     *
     * @param options
     */
    async findAll(options) {
        this.logger.debug(`Finding all entities in table: ${this.tableName}`, {
            options,
        });
        try {
            const query = this.buildFindAllQuery(options);
            const result = await this.adapter.query(query.sql, query.params);
            return result?.rows.map((row) => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error(`Failed to find all entities: ${error}`);
            throw new Error(`Find all failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create a new entity.
     *
     * @param entity
     */
    async create(entity) {
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
            const createdId = result?.rows?.[0]?.id || result?.rows?.[0]?.insertId;
            if (createdId) {
                const created = await this.findById(createdId);
                if (created) {
                    return created;
                }
            }
            throw new Error('Failed to retrieve created entity');
        }
        catch (error) {
            this.logger.error(`Failed to create entity: ${error}`);
            throw new Error(`Create failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Update an existing entity.
     *
     * @param id
     * @param updates
     */
    async update(id, updates) {
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
        }
        catch (error) {
            this.logger.error(`Failed to update entity: ${error}`);
            throw new Error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete an entity by ID.
     *
     * @param id
     */
    async delete(id) {
        this.logger.debug(`Deleting entity ${id} from table: ${this.tableName}`);
        try {
            const query = this.buildDeleteQuery(id);
            const result = await this.adapter.query(query.sql, query.params);
            return result?.rowCount > 0;
        }
        catch (error) {
            this.logger.error(`Failed to delete entity: ${error}`);
            throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Count entities matching criteria.
     *
     * @param criteria
     */
    async count(criteria) {
        this.logger.debug(`Counting entities in table: ${this.tableName}`, {
            criteria,
        });
        try {
            const query = this.buildCountQuery(criteria);
            const result = await this.adapter.query(query.sql, query.params);
            return result?.rows?.[0]?.count || 0;
        }
        catch (error) {
            this.logger.error(`Failed to count entities: ${error}`);
            throw new Error(`Count failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Check if entity exists.
     *
     * @param id
     */
    async exists(id) {
        this.logger.debug(`Checking if entity ${id} exists in table: ${this.tableName}`);
        try {
            const entity = await this.findById(id);
            return entity !== null;
        }
        catch (error) {
            this.logger.error(`Failed to check entity existence: ${error}`);
            return false;
        }
    }
    /**
     * Execute custom query specific to the underlying database.
     *
     * @param query
     */
    async executeCustomQuery(query) {
        this.logger.debug(`Executing custom query: ${query.type}`);
        try {
            let sql;
            let params = [];
            if (typeof query.query === 'string') {
                sql = query.query;
                params = Object.values(query.parameters || {});
            }
            else {
                // Handle object-based queries (could be extended for different DB types)
                sql = JSON.stringify(query.query);
                params = Object.values(query.parameters || {});
            }
            const result = await this.adapter.query(sql, params);
            return result;
        }
        catch (error) {
            this.logger.error(`Custom query failed: ${error}`);
            throw new Error(`Custom query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Query building methods.
     *
     * @param id
     */
    buildFindByIdQuery(id) {
        return {
            sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
            params: [id],
        };
    }
    buildFindByQuery(criteria, options) {
        const mappedCriteria = this.mapEntityToRow(criteria);
        const whereClause = this.buildWhereClause(mappedCriteria);
        const orderClause = this.buildOrderClause(options?.['sort']);
        const limitClause = this.buildLimitClause(options?.['limit'], options?.['offset']);
        const sql = `SELECT * FROM ${this.tableName} ${whereClause} ${orderClause} ${limitClause}`.trim();
        const params = Object.values(mappedCriteria);
        return { sql, params };
    }
    buildFindAllQuery(options) {
        const orderClause = this.buildOrderClause(options?.['sort']);
        const limitClause = this.buildLimitClause(options?.['limit'], options?.['offset']);
        const sql = `SELECT * FROM ${this.tableName} ${orderClause} ${limitClause}`.trim();
        return { sql, params: [] };
    }
    buildCreateQuery(entity) {
        const mappedEntity = this.mapEntityToRow(entity);
        const columns = Object.keys(mappedEntity).join(', ');
        const placeholders = Object.keys(mappedEntity)
            .map(() => '?')
            .join(', ');
        const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
        const params = Object.values(mappedEntity);
        return { sql, params };
    }
    buildUpdateQuery(id, updates) {
        const mappedUpdates = this.mapEntityToRow(updates);
        const setClause = Object.keys(mappedUpdates)
            .map((column) => `${column} = ?`)
            .join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        const params = [...Object.values(mappedUpdates), id];
        return { sql, params };
    }
    buildDeleteQuery(id) {
        return {
            sql: `DELETE FROM ${this.tableName} WHERE id = ?`,
            params: [id],
        };
    }
    buildCountQuery(criteria) {
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
    buildWhereClause(criteria) {
        if (Object.keys(criteria).length === 0) {
            return '';
        }
        const conditions = Object.keys(criteria).map((column) => `${column} = ?`);
        return `WHERE ${conditions.join(' AND ')}`;
    }
    buildOrderClause(sortCriteria) {
        if (!sortCriteria || sortCriteria.length === 0) {
            return '';
        }
        const orderBy = sortCriteria
            .map((sort) => `${sort.field} ${sort.direction.toUpperCase()}`)
            .join(', ');
        return `ORDER BY ${orderBy}`;
    }
    buildLimitClause(limit, offset) {
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
export class BaseManager {
    repository;
    adapter;
    logger;
    constructor(repository, adapter, logger) {
        this.repository = repository;
        this.adapter = adapter;
        this.logger = logger;
    }
    /**
     * Get repository for basic CRUD operations.
     */
    getRepository() {
        return this.repository;
    }
    /**
     * Execute transaction with multiple operations.
     *
     * @param operations
     */
    async executeTransaction(operations) {
        this.logger.debug(`Executing transaction with ${operations.length} operations`);
        try {
            return await this.adapter.transaction(async (_tx) => {
                const results = [];
                for (const operation of operations) {
                    let result;
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
                return results;
            });
        }
        catch (error) {
            this.logger.error(`Transaction failed: ${error}`);
            throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get database-specific metadata.
     */
    async getMetadata() {
        this.logger.debug('Getting database metadata');
        try {
            const schema = this.adapter.getSchema ? await this.adapter.getSchema() : {};
            return {
                type: this.getDatabaseType(),
                version: schema.version || '1.0.0',
                features: this.getSupportedFeatures(),
                schema: schema,
                config: this.getConfiguration(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get database metadata: ${error}`);
            throw new Error(`Get metadata failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Perform health check.
     */
    async healthCheck() {
        this.logger.debug('Performing health check');
        try {
            // Basic health check - try to count entities
            const count = await this.repository.count();
            return {
                healthy: true,
                score: 100,
                details: {
                    entityCount: count,
                    accessible: true,
                },
                lastCheck: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error}`);
            return {
                healthy: false,
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
    async getMetrics() {
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
        }
        catch (error) {
            this.logger.error(`Failed to get performance metrics: ${error}`);
            throw new Error(`Get metrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
