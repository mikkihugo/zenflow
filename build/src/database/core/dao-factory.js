/**
 * @file DAO Factory - Core Database Factory Functions.
 *
 * Extracted from index.ts to break circular dependencies.
 * Contains factory functions and entity type definitions.
 */
import { BaseDao } from '../base.dao.ts';
import { CoordinationDao } from '../dao/coordination.dao.ts';
import { GraphDao } from '../dao/graph.dao.ts';
import { MemoryDao } from '../dao/memory.dao.ts';
/**
 * Entity type constant mapping for type safety.
 */
export const EntityTypeValues = {
    User: 'user',
    Agent: 'agent',
    Memory: 'memory',
    Swarm: 'swarm',
    Task: 'task',
    Workflow: 'workflow',
    Document: 'document',
    Context: 'context',
    Event: 'event',
    Node: 'node',
    Edge: 'edge',
    Vector: 'vector',
    Embedding: 'embedding',
    Coordination: 'coordination',
    Product: 'product',
    Project: 'project',
    Epic: 'epic',
    Feature: 'feature',
    PRD: 'prd',
    ADR: 'adr',
    Vision: 'vision',
    Relationship: 'relationship',
    WorkflowState: 'workflowState',
};
/**
 * Create a Data Access Object (DAO) for a specific entity type and database.
 *
 * This is a factory function that creates appropriate DAO instances based on
 * the entity type and database configuration provided.
 *
 * @template T - The entity type interface.
 * @param entityType - Type of entity (from EntityTypes enum).
 * @param databaseType - Type of database to connect to.
 * @param config - Database configuration object.
 * @param options.tableName
 * @param options.primaryKey
 * @param options.enableCaching
 * @param options.connectionPoolSize
 * @param options.logger
 * @param options - Optional settings for DAO creation.
 * @returns Promise resolving to configured DAO instance.
 * @example Basic DAO Creation
 * ```typescript
 * const userDao = await createDao<User>(
 *   EntityTypes.User,
 *   DatabaseTypes.PostgreSQL,
 *   {
 *     host: 'localhost',
 *     port: 5432,
 *     database: 'myapp',
 *     username: 'user',
 *     password: 'pass'
 *   }
 * );
 * ```
 */
export async function createDao(entityType, databaseType, config, options = {}) {
    // Set defaults based on entity type
    const tableName = options?.tableName || getDefaultTableName(entityType);
    const primaryKey = options?.primaryKey || 'id';
    const logger = options?.logger || console;
    // Create a mock adapter for now - in real implementation this would connect to actual database
    const adapter = {
        connect: async () => { },
        disconnect: async () => { },
        query: async () => ({ rows: [], rowCount: 0, executionTime: 0 }),
        execute: async () => ({ affectedRows: 0, executionTime: 0 }),
        transaction: async (fn) => fn({}),
        health: async () => true,
        getSchema: async () => ({ tables: [], views: [], version: '1.0.0' }),
        getConnectionStats: async () => ({
            total: 1,
            active: 1,
            idle: 0,
            utilization: 100,
            averageConnectionTime: 0,
        }),
    };
    const iLogger = {
        debug: logger.debug?.bind(logger) || (() => { }),
        info: logger.info?.bind(logger) || (() => { }),
        warn: logger.warn?.bind(logger) || (() => { }),
        error: logger.error?.bind(logger) || (() => { }),
    };
    // Create specialized DAOs based on entity type
    switch (entityType) {
        case EntityTypeValues.Memory:
        case 'memory':
            return createMemoryDao(adapter, iLogger, tableName);
        case EntityTypeValues.Product: // Use available enum value instead of Coordination
        case 'coordination':
            return createCoordinationDao(adapter, iLogger, tableName);
        case EntityTypeValues.Vector: // Use Vector instead of Graph for GraphDao
        case 'node':
        case 'edge':
            return createGraphDao(adapter, iLogger, tableName);
        default:
            // Cannot instantiate abstract BaseDao directly - create a concrete implementation
            return new ConcreteDao(adapter, iLogger, tableName);
    }
}
/**
 * Concrete implementation of BaseDao for default cases.
 *
 * @example
 */
class ConcreteDao extends BaseDao {
    constructor(adapter, logger, tableName) {
        super(adapter, logger, tableName);
    }
    mapRowToEntity(row) {
        return row;
    }
    mapEntityToRow(entity) {
        return entity;
    }
}
/**
 * Create a multi-database setup with primary database and fallbacks.
 *
 * This function creates a DAO that can work across multiple databases,
 * with a primary database for writes and optional fallback databases
 * for reads and caching.
 *
 * @template T - The entity type interface.
 * @param entityType - Type of entity (from EntityTypes enum).
 * @param primaryDatabase - Primary database configuration.
 * @param primaryDatabase.databaseType
 * @param fallbackDatabases - Array of fallback database configurations.
 * @param primaryDatabase.config
 * @param options.readPreference
 * @param options.writePolicy
 * @param options.failoverTimeout
 * @param options.logger
 * @param options - Optional settings for multi-database setup.
 * @returns Promise resolving to multi-database DAO instance.
 * @example Multi-Database Setup
 * ```typescript
 * const multiDao = await createMultiDatabaseSetup<User>(
 *   EntityTypes.User,
 *   { databaseType: 'postgresql', config: pgConfig },
 *   [{ databaseType: 'memory', config: cacheConfig }]
 * );
 * ```
 */
export async function createMultiDatabaseSetup(entityType, primaryDatabase, fallbackDatabases = [], options = {}) {
    const primaryDao = await createDao(entityType, primaryDatabase.databaseType, primaryDatabase.config, {
        logger: options?.logger,
    });
    const fallbackDaos = await Promise.all(fallbackDatabases.map((db) => createDao(entityType, db.databaseType, db.config, {
        logger: options?.logger,
    })));
    // Return a multi-database DAO wrapper
    return {
        primary: primaryDao,
        fallbacks: fallbackDaos,
        readPreference: options?.readPreference || 'primary',
        writePolicy: options?.writePolicy || 'primary-only',
        failoverTimeout: options?.failoverTimeout || 5000,
        async findById(id) {
            try {
                return await primaryDao.findById(id);
            }
            catch (error) {
                if (fallbackDaos.length > 0) {
                    for (const fallbackDao of fallbackDaos) {
                        try {
                            return await fallbackDao.findById(id);
                        }
                        catch (fallbackError) { }
                    }
                }
                throw error;
            }
        },
        async findAll() {
            const dao = this.readPreference === 'fallback' && fallbackDaos.length > 0
                ? fallbackDaos[0]
                : primaryDao;
            if (!dao) {
                throw new Error('No DAO available');
            }
            try {
                return await dao.findAll();
            }
            catch (error) {
                if (dao !== primaryDao) {
                    return await primaryDao.findAll();
                }
                throw error;
            }
        },
        async create(entity) {
            const created = await primaryDao.create(entity);
            if (this.writePolicy === 'replicated') {
                // Fire-and-forget replication to fallbacks
                fallbackDaos.forEach((dao) => {
                    dao.create(entity).catch(() => {
                        // Log but don't fail the operation
                        options?.logger?.warn('Fallback replication failed');
                    });
                });
            }
            return created;
        },
        async update(id, updates) {
            const updated = await primaryDao.update(id, updates);
            if (this.writePolicy === 'replicated') {
                fallbackDaos.forEach((dao) => {
                    dao.update(id, updates).catch(() => {
                        options?.logger?.warn('Fallback update failed');
                    });
                });
            }
            return updated;
        },
        async delete(id) {
            const deleted = await primaryDao.delete(id);
            if (this.writePolicy === 'replicated') {
                fallbackDaos.forEach((dao) => {
                    dao.delete(id).catch(() => {
                        options?.logger?.warn('Fallback deletion failed');
                    });
                });
            }
            return deleted;
        },
        async findBy(filter) {
            const dao = this.readPreference === 'fallback' && fallbackDaos.length > 0
                ? fallbackDaos[0]
                : primaryDao;
            if (!dao) {
                throw new Error('No DAO available');
            }
            try {
                return await dao.findBy(filter);
            }
            catch (error) {
                if (dao !== primaryDao) {
                    return await primaryDao.findBy(filter);
                }
                throw error;
            }
        },
        async count(filter) {
            try {
                return await primaryDao.count(filter);
            }
            catch (error) {
                if (fallbackDaos.length > 0) {
                    const fallbackDao = fallbackDaos[0];
                    if (fallbackDao) {
                        return await fallbackDao.count(filter);
                    }
                }
                throw error;
            }
        },
    };
}
/**
 * Get default table name for entity type.
 *
 * @param entityType
 * @private
 * @example
 */
function getDefaultTableName(entityType) {
    // Convert entity type to plural table name
    const entityMap = {
        [EntityTypeValues.User]: 'users',
        [EntityTypeValues.Agent]: 'agents',
        [EntityTypeValues.Memory]: 'memories',
        [EntityTypeValues.Swarm]: 'swarms',
        [EntityTypeValues.Task]: 'tasks',
        [EntityTypeValues.Workflow]: 'workflows',
        [EntityTypeValues.Document]: 'documents',
        [EntityTypeValues.Context]: 'contexts',
        [EntityTypeValues.Event]: 'events',
        [EntityTypeValues.Node]: 'nodes',
        [EntityTypeValues.Edge]: 'edges',
        [EntityTypeValues.Vector]: 'vectors',
        [EntityTypeValues.Embedding]: 'embeddings',
        [EntityTypeValues.Coordination]: 'coordination',
        [EntityTypeValues.Product]: 'products',
        [EntityTypeValues.Project]: 'projects',
        [EntityTypeValues.Epic]: 'epics',
        [EntityTypeValues.Feature]: 'features',
        [EntityTypeValues.PRD]: 'prds',
        [EntityTypeValues.ADR]: 'adrs',
        [EntityTypeValues.Vision]: 'visions',
        [EntityTypeValues.Relationship]: 'relationships',
        [EntityTypeValues.WorkflowState]: 'workflow_states',
    };
    return entityMap[entityType] || `${entityType}s`;
}
/**
 * Factory functions to create specialized DAOs with proper constructor access.
 *
 * @param adapter
 * @param logger
 * @param tableName
 * @example
 */
function createMemoryDao(adapter, logger, tableName) {
    // Create a specialized memory DAO implementation
    class MemoryDaoImpl extends MemoryDao {
        constructor(adapter, logger, tableName) {
            super(adapter, logger, tableName);
        }
    }
    return new MemoryDaoImpl(adapter, logger, tableName);
}
function createCoordinationDao(adapter, logger, tableName) {
    // Create a specialized coordination DAO implementation
    class CoordinationDaoImpl extends CoordinationDao {
        constructor(adapter, logger, tableName) {
            super(adapter, logger, tableName);
        }
    }
    return new CoordinationDaoImpl(adapter, logger, tableName);
}
function createGraphDao(adapter, logger, tableName) {
    // Create a specialized graph DAO implementation
    class GraphDaoImpl extends GraphDao {
        constructor(adapter, logger, tableName) {
            super(adapter, logger, tableName);
        }
    }
    return new GraphDaoImpl(adapter, logger, tableName);
}
