export * from './types.ts';
export { BaseDao, BaseManager } from './base.dao.ts';
export { CoordinationDao } from './dao/coordination.dao.ts';
export { GraphDao } from './dao/graph.dao.ts';
export { MemoryDao } from './dao/memory.dao.ts';
export { RelationalDao } from './dao/relational.dao.ts';
export { VectorDao } from './dao/vector.dao.ts';
export { DALFactory, MultiDatabaseDAO, } from './factory.ts';
export { DatabaseTypes as DatabaseTypesEnum, EntityTypes as EntityTypesEnum, } from './interfaces.ts';
export { DocumentManager } from './managers/document-manager.ts';
export { createDao } from './core/dao-factory.ts';
export async function createManager(entityType, databaseType, config) {
    const { DALFactory } = await import('./factory.ts');
    const { DIContainer } = await import('../di/container/di-container.ts');
    const { CORE_TOKENS } = await import('../di/tokens/core-tokens.ts');
    const container = new DIContainer();
    container.register(CORE_TOKENS.Logger, (() => ({
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    })));
    container.register(CORE_TOKENS.Config, (() => ({})));
    const factory = container.resolve(DALFactory);
    return await factory.createManager({
        databaseType,
        entityType,
        databaseConfig: config || getDefaultConfig(databaseType),
    });
}
export async function createMultiDatabaseSetup(entityType, primaryConfig, secondaryConfigs) {
    const { DALFactory } = await import('./factory.ts');
    const { DIContainer } = await import('../di/container/di-container.ts');
    const { CORE_TOKENS } = await import('../di/tokens/core-tokens.ts');
    const container = new DIContainer();
    container.register(CORE_TOKENS.Logger, (() => ({
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    })));
    container.register(CORE_TOKENS.Config, (() => ({})));
    const factory = container.resolve(DALFactory);
    const primaryDaoConfig = {
        databaseType: primaryConfig?.databaseType,
        entityType,
        databaseConfig: primaryConfig?.config || getDefaultConfig(primaryConfig?.databaseType),
    };
    const secondaryDaoConfigs = secondaryConfigs?.map((sc) => ({
        databaseType: sc.databaseType,
        entityType,
        databaseConfig: sc.config || getDefaultConfig(sc.databaseType),
    }));
    return await factory.createMultiDatabaseDAO(entityType, primaryDaoConfig, secondaryDaoConfigs);
}
function getDefaultConfig(databaseType) {
    switch (databaseType) {
        case 'postgresql':
            return {
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                database: 'claudezen',
                username: 'user',
                password: 'password',
                pool: { min: 2, max: 10 },
            };
        case 'sqlite':
            return {
                type: 'sqlite',
                database: './data/claudezen.db',
            };
        case 'kuzu':
            return {
                type: 'kuzu',
                database: './data/graph.kuzu',
                options: {
                    bufferPoolSize: '1GB',
                    maxNumThreads: 4,
                },
            };
        case 'lancedb':
            return {
                type: 'lancedb',
                database: './data/vectors.lance',
                options: {
                    vectorSize: 384,
                    metricType: 'cosine',
                    indexType: 'IVF_PQ',
                },
            };
        case 'mysql':
            return {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'claudezen',
                username: 'user',
                password: 'password',
                pool: { min: 2, max: 10 },
            };
        case 'memory':
            return {
                type: 'sqlite',
                database: ':memory:',
            };
        case 'coordination':
            return {
                type: 'sqlite',
                database: './data/coordination.db',
            };
        default:
            throw new Error(`Unknown database type: ${databaseType}`);
    }
}
export { EntityTypeValues as EntityTypes } from './core/dao-factory.ts';
export const DatabaseTypes = {
    PostgreSQL: 'postgresql',
    SQLite: 'sqlite',
    MySQL: 'mysql',
    Kuzu: 'kuzu',
    LanceDB: 'lancedb',
    Memory: 'memory',
    Coordination: 'coordination',
};
export const QuickSetup = {
    async swarmCoordination() {
        const { createDao: createDaoFn } = await import('./core/dao-factory.ts');
        return {
            agents: await createDaoFn('agent', 'coordination', getDefaultConfig('coordination')),
            tasks: await createDaoFn('task', 'coordination', getDefaultConfig('coordination')),
            executions: await createDaoFn('coordination', 'coordination', getDefaultConfig('coordination')),
            memory: await createDaoFn('memory', 'memory', getDefaultConfig('memory')),
            vectors: await createDaoFn('vector', 'lancedb', getDefaultConfig('lancedb')),
        };
    },
    async aimlData() {
        const { createDao: createDaoFn } = await import('./core/dao-factory.ts');
        return {
            documents: await createDaoFn('document', 'postgresql', getDefaultConfig('postgresql')),
            embeddings: await createDaoFn('vector', 'lancedb', getDefaultConfig('lancedb')),
            relationships: await createDaoFn('node', 'kuzu', getDefaultConfig('kuzu')),
            cache: await createDaoFn('memory', 'memory', getDefaultConfig('memory')),
        };
    },
    async distributedApp() {
        const primaryDB = await createManager('User', 'postgresql');
        const cacheDB = await createManager('User', 'memory');
        const coordinationDB = await createManager('DistributedLock', 'coordination');
        return {
            primary: primaryDB,
            cache: cacheDB,
            coordination: coordinationDB,
        };
    },
};
export { DALFactory as default } from './factory.ts';
//# sourceMappingURL=index.js.map