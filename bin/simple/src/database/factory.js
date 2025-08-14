var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
function injectable(constructor) {
    return constructor;
}
function inject(token) {
    return (target, propertyKey, parameterIndex) => {
    };
}
const CORE_TOKENS = {
    Logger: 'Logger',
    Config: 'Config',
};
let DALFactory = class DALFactory {
    _logger;
    _config;
    databaseProviderFactory;
    repositoryCache = new Map();
    daoCache = new Map();
    adapterCache = new Map();
    entityRegistry = {};
    constructor(_logger, _config, databaseProviderFactory) {
        this._logger = _logger;
        this._config = _config;
        this.databaseProviderFactory = databaseProviderFactory;
        this.initializeEntityRegistry();
    }
    async createRepository(config) {
        const cacheKey = this.generateCacheKey(config);
        if (this.repositoryCache.has(cacheKey)) {
            this['_logger']?.debug(`Returning cached repository: ${cacheKey}`);
            return this.repositoryCache.get(cacheKey);
        }
        this['_logger']?.info(`Creating new repository: ${config?.['entityType']} (${config?.['databaseType']})`);
        try {
            const adapter = await this.getOrCreateAdapter(config);
            const repository = await this.createRepositoryInstance(config, adapter);
            this.repositoryCache.set(cacheKey, repository);
            return repository;
        }
        catch (error) {
            this['_logger']?.error(`Failed to create repository: ${error}`);
            throw new Error(`Repository creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createDAO(config) {
        const cacheKey = this.generateCacheKey(config, 'dao');
        if (this.daoCache.has(cacheKey)) {
            this['_logger']?.debug(`Returning cached DAO: ${cacheKey}`);
            return this.daoCache.get(cacheKey);
        }
        this['_logger']?.info(`Creating new DAO: ${config?.['entityType']} (${config?.['databaseType']})`);
        try {
            const repository = await this.createRepository(config);
            const adapter = await this.getOrCreateAdapter(config);
            const dao = await this.createDAOInstance(config, repository, adapter);
            this.daoCache.set(cacheKey, dao);
            return dao;
        }
        catch (error) {
            this['_logger']?.error(`Failed to create DAO: ${error}`);
            throw new Error(`DAO creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    registerEntityType(entityType, config) {
        this['_logger']?.debug(`Registering entity type: ${entityType}`);
        this.entityRegistry[entityType] = config;
    }
    getEntityConfig(entityType) {
        return this.entityRegistry[entityType];
    }
    async createKuzuGraphRepository(entityType, tableName) {
        const config = {
            databaseType: 'kuzu',
            entityType,
            tableName: tableName || entityType,
            databaseConfig: this.getDefaultKuzuConfig(),
        };
        return (await this.createRepository(config));
    }
    async createLanceDBVectorRepository(entityType, vectorDimension = 384) {
        const config = {
            databaseType: 'lancedb',
            entityType,
            tableName: entityType,
            databaseConfig: this.getDefaultLanceDBConfig(vectorDimension),
        };
        return (await this.createRepository(config));
    }
    async createCoordinationRepository(entityType) {
        const config = {
            databaseType: 'coordination',
            entityType,
            tableName: entityType,
            databaseConfig: {
                type: 'sqlite',
                database: './data/coordination.db',
            },
        };
        return (await this.createRepository(config));
    }
    async createMemoryRepository(entityType) {
        const config = {
            databaseType: 'memory',
            entityType,
            tableName: entityType,
            options: {
                maxSize: 1000,
                ttlDefault: 3600,
            },
        };
        return (await this.createRepository(config));
    }
    async createMultiDatabaseDAO(entityType, primaryConfig, secondaryConfigs) {
        this['_logger']?.info(`Creating multi-database DAO for: ${entityType}`);
        const primaryDAO = await this.createDAO(primaryConfig);
        const secondaryDAOs = [];
        if (secondaryConfigs) {
            for (const config of secondaryConfigs) {
                const dao = await this.createDAO(config);
                secondaryDAOs.push(dao);
            }
        }
        return new MultiDatabaseDAO(primaryDAO, secondaryDAOs, this['_logger']);
    }
    clearCaches() {
        this['_logger']?.info('Clearing DAL factory caches');
        this.repositoryCache.clear();
        this.daoCache.clear();
        this.adapterCache.clear();
    }
    getCacheStats() {
        return {
            repositories: this.repositoryCache.size,
            daos: this.daoCache.size,
            adapters: this.adapterCache.size,
        };
    }
    async getOrCreateAdapter(config) {
        if (config?.['existingAdapter']) {
            return config?.['existingAdapter'];
        }
        const adapterCacheKey = this.generateAdapterCacheKey(config);
        if (this.adapterCache.has(adapterCacheKey)) {
            return this.adapterCache.get(adapterCacheKey);
        }
        if (!config?.['databaseConfig']) {
            throw new Error('Database configuration required when creating new adapter');
        }
        const adapter = await this.databaseProviderFactory.createAdapter(config?.['databaseConfig']);
        this.adapterCache.set(adapterCacheKey, adapter);
        return adapter;
    }
    async createRepositoryInstance(config, adapter) {
        const { RelationalDao } = await import('./dao/relational.dao.ts');
        const { GraphDao } = await import('./dao/graph.dao.ts');
        const { VectorDao } = await import('./dao/vector.dao.ts');
        const { MemoryDao } = await import('./dao/memory.dao.ts');
        const { CoordinationDao } = await import('./dao/coordination.dao.ts');
        const tableName = config?.['tableName'] || config?.['entityType'];
        const entitySchema = config?.['schema'] || this.entityRegistry[config?.['entityType']]?.schema;
        switch (config?.['databaseType']) {
            case 'kuzu':
                return new GraphDao(adapter, this['_logger'], tableName, entitySchema);
            case 'lancedb':
                return new VectorDao(adapter, this['_logger'], tableName, entitySchema);
            case 'memory':
                return new MemoryDao(adapter, this['_logger'], tableName, entitySchema);
            case 'coordination':
                return new CoordinationDao(adapter, this['_logger'], tableName, entitySchema);
            default:
                return new RelationalDao(adapter, this['_logger'], tableName, entitySchema);
        }
    }
    async createDAOInstance(config, repository, adapter) {
        const { RelationalDao } = await import('./dao/relational.dao.ts');
        const { GraphDao } = await import('./dao/graph.dao.ts');
        const { VectorDao } = await import('./dao/vector.dao.ts');
        const { MemoryDao } = await import('./dao/memory.dao.ts');
        const { CoordinationDao } = await import('./dao/coordination.dao.ts');
        switch (config?.['databaseType']) {
            case 'kuzu':
                return new GraphDao(repository, adapter, this['_logger']);
            case 'lancedb':
                return new VectorDao(repository, adapter, this['_logger']);
            case 'memory':
                return new MemoryDao(repository, adapter, this['_logger']);
            case 'coordination':
                return new CoordinationDao(repository, adapter, this['_logger']);
            default:
                return new RelationalDao(repository, adapter, this['_logger']);
        }
    }
    generateCacheKey(config, type = 'repo') {
        const parts = [
            type,
            config?.['databaseType'],
            config?.['entityType'],
            config?.['tableName'] || config?.['entityType'],
            JSON.stringify(config?.['options'] || {}),
        ];
        return parts.join(':');
    }
    generateAdapterCacheKey(config) {
        if (config?.['existingAdapter']) {
            return `existing:${Date.now()}`;
        }
        return [
            config?.['databaseType'],
            config?.['databaseConfig']?.host || 'localhost',
            config?.['databaseConfig']?.database || 'default',
            config?.['databaseConfig']?.port || 'default',
        ].join(':');
    }
    getDefaultKuzuConfig() {
        return {
            type: 'kuzu',
            database: './data/kuzu-graph.db',
            options: {
                bufferPoolSize: '1GB',
                maxNumThreads: 4,
            },
        };
    }
    getDefaultLanceDBConfig(vectorDimension) {
        return {
            type: 'lancedb',
            database: './data/lancedb-vectors.db',
            options: {
                vectorSize: vectorDimension,
                metricType: 'cosine',
                indexType: 'IVF_PQ',
            },
        };
    }
    initializeEntityRegistry() {
        this.registerEntityType('SwarmAgent', {
            schema: {
                id: { type: 'string', primaryKey: true },
                name: { type: 'string', required: true },
                type: { type: 'string', required: true },
                status: { type: 'string', default: 'inactive' },
                metadata: { type: 'json' },
                createdAt: { type: 'datetime', default: 'now' },
                updatedAt: { type: 'datetime', default: 'now' },
            },
            primaryKey: 'id',
            tableName: 'swarm_agents',
            databaseType: 'coordination',
        });
        this.registerEntityType('MemoryEntry', {
            schema: {
                id: { type: 'string', primaryKey: true },
                key: { type: 'string', required: true, unique: true },
                value: { type: 'json', required: true },
                ttl: { type: 'number' },
                createdAt: { type: 'datetime', default: 'now' },
                accessedAt: { type: 'datetime' },
            },
            primaryKey: 'id',
            tableName: 'memory_entries',
            databaseType: 'memory',
        });
        this.registerEntityType('VectorDocument', {
            schema: {
                id: { type: 'string', primaryKey: true },
                vector: { type: 'vector', required: true },
                metadata: { type: 'json' },
                timestamp: { type: 'datetime', default: 'now' },
            },
            primaryKey: 'id',
            tableName: 'vector_documents',
            databaseType: 'lancedb',
        });
        this.registerEntityType('GraphNode', {
            schema: {
                id: { type: 'string', primaryKey: true },
                labels: { type: 'array' },
                properties: { type: 'json' },
                createdAt: { type: 'datetime', default: 'now' },
            },
            primaryKey: 'id',
            tableName: 'nodes',
            databaseType: 'kuzu',
        });
    }
};
DALFactory = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.Config)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DALFactory);
export { DALFactory };
export class MultiDatabaseDAO {
    primaryDAO;
    secondaryDAOs;
    logger;
    constructor(primaryDAO, secondaryDAOs, logger) {
        this.primaryDAO = primaryDAO;
        this.secondaryDAOs = secondaryDAOs;
        this.logger = logger;
    }
    getRepository() {
        return this.primaryDAO.getRepository();
    }
    async executeTransaction(operations) {
        const primaryResult = await this.primaryDAO.executeTransaction(operations);
        this.replicateToSecondaries(operations).catch((error) => {
            this.logger.warn(`Secondary replication failed: ${error}`);
        });
        return primaryResult;
    }
    async getMetadata() {
        const primary = await this.primaryDAO.getMetadata();
        const secondaries = await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.getMetadata()));
        return {
            primary,
            secondaries: secondaries.map((result) => result?.status === 'fulfilled' ? result?.value : { error: result?.reason }),
        };
    }
    async healthCheck() {
        const primary = await this.primaryDAO.healthCheck();
        const secondaries = await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.healthCheck()));
        return {
            primary,
            secondaries: secondaries.map((result) => result?.status === 'fulfilled' ? result?.value : { healthy: false, error: result?.reason }),
            overall: primary.healthy && secondaries.some((s) => s.status === 'fulfilled'),
        };
    }
    async getMetrics() {
        const primary = await this.primaryDAO.getMetrics();
        const secondaries = await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.getMetrics()));
        return {
            primary,
            secondaries: secondaries.map((result) => result?.status === 'fulfilled' ? result?.value : { error: result?.reason }),
        };
    }
    async replicateToSecondaries(operations) {
        if (this.secondaryDAOs.length === 0)
            return;
        await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.executeTransaction(operations)));
    }
}
export default DALFactory;
//# sourceMappingURL=factory.js.map