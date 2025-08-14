import { BaseDao } from '../base.dao.ts';
import { CoordinationDao } from '../dao/coordination.dao.ts';
import { GraphDao } from '../dao/graph.dao.ts';
import { MemoryDao } from '../dao/memory.dao.ts';
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
export async function createDao(entityType, databaseType, config, options = {}) {
    const tableName = options?.tableName || getDefaultTableName(entityType);
    const primaryKey = options?.primaryKey || 'id';
    const logger = options?.logger || console;
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
    switch (entityType) {
        case EntityTypeValues.Memory:
        case 'memory':
            return createMemoryDao(adapter, iLogger, tableName);
        case EntityTypeValues.Product:
        case 'coordination':
            return createCoordinationDao(adapter, iLogger, tableName);
        case EntityTypeValues.Vector:
        case 'node':
        case 'edge':
            return createGraphDao(adapter, iLogger, tableName);
        default:
            return new ConcreteDao(adapter, iLogger, tableName);
    }
}
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
export async function createMultiDatabaseSetup(entityType, primaryDatabase, fallbackDatabases = [], options = {}) {
    const primaryDao = await createDao(entityType, primaryDatabase.databaseType, primaryDatabase.config, {
        logger: options?.logger,
    });
    const fallbackDaos = await Promise.all(fallbackDatabases.map((db) => createDao(entityType, db.databaseType, db.config, {
        logger: options?.logger,
    })));
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
                fallbackDaos.forEach((dao) => {
                    dao.create(entity).catch(() => {
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
function getDefaultTableName(entityType) {
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
function createMemoryDao(adapter, logger, tableName) {
    class MemoryDaoImpl extends MemoryDao {
        constructor(adapter, logger, tableName) {
            super(adapter, logger, tableName);
        }
    }
    return new MemoryDaoImpl(adapter, logger, tableName);
}
function createCoordinationDao(adapter, logger, tableName) {
    class CoordinationDaoImpl extends CoordinationDao {
        constructor(adapter, logger, tableName) {
            super(adapter, logger, tableName);
        }
    }
    return new CoordinationDaoImpl(adapter, logger, tableName);
}
function createGraphDao(adapter, logger, tableName) {
    class GraphDaoImpl extends GraphDao {
        constructor(adapter, logger, tableName) {
            super(adapter, logger, tableName);
        }
    }
    return new GraphDaoImpl(adapter, logger, tableName);
}
//# sourceMappingURL=dao-factory.js.map