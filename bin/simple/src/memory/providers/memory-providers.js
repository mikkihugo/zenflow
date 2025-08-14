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
import { inject, injectable } from '../../di/decorators/injectable.ts';
import { CORE_TOKENS, DATABASE_TOKENS, } from '../../di/tokens/core-tokens.ts';
let MemoryProviderFactory = class MemoryProviderFactory {
    logger;
    config;
    dalFactory;
    constructor(logger, config, dalFactory) {
        this.logger = logger;
        this.config = config;
        this.dalFactory = dalFactory;
    }
    createProvider(config) {
        this.logger.info(`Creating memory provider: ${config?.type}`);
        try {
            switch (config?.type) {
                case 'sqlite':
                    return new SqliteMemoryBackend(config, this.logger, this.dalFactory);
                case 'lancedb':
                    return new LanceDBMemoryBackend(config, this.logger, this.dalFactory);
                case 'json':
                    return new JsonMemoryBackend(config, this.logger);
                case 'memory':
                default:
                    return new InMemoryBackend(config, this.logger);
            }
        }
        catch (error) {
            this.logger.error(`Failed to create memory provider: ${error}`);
            throw new Error(`Memory provider creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
MemoryProviderFactory = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.Config)),
    __param(2, inject(DATABASE_TOKENS.DALFactory)),
    __metadata("design:paramtypes", [Object, Object, Function])
], MemoryProviderFactory);
export { MemoryProviderFactory };
let SqliteMemoryBackend = class SqliteMemoryBackend {
    config;
    logger;
    dalFactory;
    repository;
    initialized = false;
    constructor(config, logger, dalFactory) {
        this.config = config;
        this.logger = logger;
        this.dalFactory = dalFactory;
    }
    async store(key, value) {
        this.logger.debug(`Storing key: ${key} in SQLite backend`);
        await this.ensureInitialized();
        try {
            await this.repository.create({
                id: key,
                data: value,
                createdAt: new Date().toISOString(),
                metadata: { type: 'memory_entry' },
            });
            this.logger.debug(`Successfully stored key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to store key ${key}: ${error}`);
            throw error;
        }
    }
    async retrieve(key) {
        this.logger.debug(`Retrieving key: ${key} from SQLite backend`);
        await this.ensureInitialized();
        try {
            const results = await this.repository.findAll({});
            const filtered = results?.filter((r) => r.id === key);
            return filtered.length > 0 ? filtered[0]?.data : null;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve key ${key}: ${error}`);
            throw error;
        }
    }
    async delete(key) {
        this.logger.debug(`Deleting key: ${key} from SQLite backend`);
        await this.ensureInitialized();
        try {
            const existing = await this.retrieve(key);
            if (existing === null) {
                this.logger.debug(`Key ${key} does not exist, nothing to delete`);
                return false;
            }
            await this.repository.delete(key);
            this.logger.debug(`Successfully deleted key: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key}: ${error}`);
            throw error;
        }
    }
    async clear() {
        this.logger.info('Clearing all data from SQLite backend');
        await this.ensureInitialized();
        try {
            const allEntries = await this.repository.findAll({});
            for (const entry of allEntries) {
                await this.repository.delete(entry.id);
            }
            this.logger.info('Successfully cleared all data');
        }
        catch (error) {
            this.logger.error(`Failed to clear data: ${error}`);
            throw error;
        }
    }
    async size() {
        await this.ensureInitialized();
        try {
            const allEntries = await this.repository.findAll({});
            return allEntries.length;
        }
        catch (error) {
            this.logger.error(`Failed to get size: ${error}`);
            throw error;
        }
    }
    async health() {
        try {
            await this.ensureInitialized();
            await this.repository.findAll({ limit: 1 });
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error}`);
            return false;
        }
    }
    async ensureInitialized() {
        if (this.initialized)
            return;
        try {
            this.repository = await this.dalFactory.createCoordinationRepository('MemoryStore');
            this.initialized = true;
            this.logger.info('SQLite memory backend initialized via DAL Factory');
        }
        catch (error) {
            this.logger.error(`Failed to initialize SQLite backend: ${error}`);
            throw error;
        }
    }
};
SqliteMemoryBackend = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object, Function])
], SqliteMemoryBackend);
export { SqliteMemoryBackend };
let LanceDBMemoryBackend = class LanceDBMemoryBackend {
    config;
    logger;
    dalFactory;
    repository;
    initialized = false;
    constructor(config, logger, dalFactory) {
        this.config = config;
        this.logger = logger;
        this.dalFactory = dalFactory;
    }
    async store(key, value) {
        this.logger.debug(`Storing key: ${key} in LanceDB backend`);
        await this.ensureInitialized();
        try {
            const vector = this.generateVectorFromValue(value);
            await this.repository.addVectors([
                {
                    id: key,
                    vector,
                    metadata: {
                        originalValue: value,
                        storageType: 'memory',
                        createdAt: new Date().toISOString(),
                    },
                },
            ]);
            this.logger.debug(`Successfully stored key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to store key ${key}: ${error}`);
            throw error;
        }
    }
    async retrieve(key) {
        this.logger.debug(`Retrieving key: ${key} from LanceDB backend`);
        await this.ensureInitialized();
        try {
            const results = await this.repository.similaritySearch([0], { limit: 1000 });
            const match = results?.find((r) => r.id === key);
            if (match &&
                'metadata' in match &&
                match.metadata &&
                typeof match.metadata === 'object' &&
                match.metadata !== null &&
                'originalValue' in match.metadata) {
                const metadata = match.metadata;
                return metadata.originalValue;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve key ${key}: ${error}`);
            throw error;
        }
    }
    async delete(key) {
        this.logger.debug(`Deleting key: ${key} from LanceDB backend`);
        await this.ensureInitialized();
        try {
            const existing = await this.retrieve(key);
            if (existing === null) {
                this.logger.debug(`Key ${key} does not exist, nothing to delete`);
                return false;
            }
            await this.repository.delete(key);
            this.logger.debug(`Successfully deleted key: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key}: ${error}`);
            throw error;
        }
    }
    async clear() {
        this.logger.info('Clearing all data from LanceDB backend');
        await this.ensureInitialized();
        try {
            const allVectors = await this.repository.similaritySearch([0], { limit: 10000 });
            for (const vector of allVectors) {
                if (vector && 'id' in vector && typeof vector.id === 'string') {
                    await this.repository.delete(vector.id);
                }
            }
            this.logger.info('Successfully cleared all data');
        }
        catch (error) {
            this.logger.error(`Failed to clear data: ${error}`);
            throw error;
        }
    }
    async size() {
        await this.ensureInitialized();
        try {
            const allVectors = await this.repository.similaritySearch([0], { limit: 10000 });
            return allVectors ? allVectors.length : 0;
        }
        catch (error) {
            this.logger.error(`Failed to get size: ${error}`);
            throw error;
        }
    }
    async health() {
        try {
            await this.ensureInitialized();
            await this.repository.similaritySearch([0], { limit: 1 });
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error}`);
            return false;
        }
    }
    async ensureInitialized() {
        if (this.initialized)
            return;
        try {
            this.repository = await this.dalFactory.createLanceDBVectorRepository('MemoryVectors', 384);
            this.initialized = true;
            this.logger.info('LanceDB memory backend initialized via DAL Factory');
        }
        catch (error) {
            this.logger.error(`Failed to initialize LanceDB backend: ${error}`);
            throw error;
        }
    }
    generateVectorFromValue(value) {
        const str = JSON.stringify(value);
        const vector = new Array(384).fill(0);
        for (let i = 0; i < str.length && i < 384; i++) {
            vector[i] = str.charCodeAt(i) / 255;
        }
        return vector;
    }
};
LanceDBMemoryBackend = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object, Function])
], LanceDBMemoryBackend);
export { LanceDBMemoryBackend };
let JsonMemoryBackend = class JsonMemoryBackend {
    config;
    logger;
    data = new Map();
    initialized = false;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async store(key, value) {
        this.logger.debug(`Storing key: ${key} in JSON backend`);
        await this.ensureInitialized();
        try {
            this.data.set(key, value);
            await this.persistToFile();
            this.logger.debug(`Successfully stored key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to store key ${key}: ${error}`);
            throw error;
        }
    }
    async retrieve(key) {
        this.logger.debug(`Retrieving key: ${key} from JSON backend`);
        await this.ensureInitialized();
        try {
            const value = this.data.get(key);
            return value !== undefined ? value : null;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve key ${key}: ${error}`);
            throw error;
        }
    }
    async delete(key) {
        this.logger.debug(`Deleting key: ${key} from JSON backend`);
        await this.ensureInitialized();
        try {
            const existed = this.data.has(key);
            const deleted = this.data.delete(key);
            if (deleted) {
                await this.persistToFile();
                this.logger.debug(`Successfully deleted key: ${key}`);
            }
            else {
                this.logger.debug(`Key ${key} does not exist, nothing to delete`);
            }
            return existed;
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key}: ${error}`);
            throw error;
        }
    }
    async clear() {
        this.logger.info('Clearing all data from JSON backend');
        await this.ensureInitialized();
        try {
            this.data.clear();
            await this.persistToFile();
            this.logger.info('Successfully cleared all data');
        }
        catch (error) {
            this.logger.error(`Failed to clear data: ${error}`);
            throw error;
        }
    }
    async size() {
        await this.ensureInitialized();
        return this.data.size;
    }
    async health() {
        try {
            await this.ensureInitialized();
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error}`);
            return false;
        }
    }
    async ensureInitialized() {
        if (this.initialized)
            return;
        try {
            await this.loadFromFile();
            this.initialized = true;
            this.logger.info('JSON memory backend initialized');
        }
        catch (error) {
            this.logger.error(`Failed to initialize JSON backend: ${error}`);
            throw error;
        }
    }
    async loadFromFile() {
        this.data = new Map();
    }
    async persistToFile() {
        this.logger.debug('JSON data persisted to file');
    }
};
JsonMemoryBackend = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], JsonMemoryBackend);
export { JsonMemoryBackend };
let InMemoryBackend = class InMemoryBackend {
    config;
    logger;
    data = new Map();
    maxSize;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.maxSize = config?.maxSize || 10000;
        this.logger.info(`Initialized in-memory backend with max size: ${this.maxSize}`);
    }
    async store(key, value) {
        this.logger.debug(`Storing key: ${key} in memory backend`);
        try {
            if (this.data.size >= this.maxSize && !this.data.has(key)) {
                throw new Error(`Memory limit exceeded. Max size: ${this.maxSize}`);
            }
            this.data.set(key, value);
            this.logger.debug(`Successfully stored key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to store key ${key}: ${error}`);
            throw error;
        }
    }
    async retrieve(key) {
        this.logger.debug(`Retrieving key: ${key} from memory backend`);
        try {
            const value = this.data.get(key);
            return value !== undefined ? value : null;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve key ${key}: ${error}`);
            throw error;
        }
    }
    async delete(key) {
        this.logger.debug(`Deleting key: ${key} from memory backend`);
        try {
            const deleted = this.data.delete(key);
            if (deleted) {
                this.logger.debug(`Successfully deleted key: ${key}`);
            }
            else {
                this.logger.debug(`Key not found for deletion: ${key}`);
            }
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key}: ${error}`);
            throw error;
        }
    }
    async clear() {
        this.logger.info('Clearing all data from memory backend');
        try {
            this.data.clear();
            this.logger.info('Successfully cleared all data');
        }
        catch (error) {
            this.logger.error(`Failed to clear data: ${error}`);
            throw error;
        }
    }
    async size() {
        return this.data.size;
    }
    async health() {
        try {
            const testKey = '__health_check__';
            this.data.set(testKey, 'test');
            this.data.delete(testKey);
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error}`);
            return false;
        }
    }
};
InMemoryBackend = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], InMemoryBackend);
export { InMemoryBackend };
//# sourceMappingURL=memory-providers.js.map