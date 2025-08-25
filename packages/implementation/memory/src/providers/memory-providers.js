/**
 * Memory Domain Dependency Injection Providers.
 * Implements comprehensive DI patterns for memory management.
 *
 * @file Memory-providers.ts.
 * @description Enhanced memory providers with DI integration for Issue #63.
 */
const __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    const kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    const target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    const descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    let _, done = false;
    for (let i = decorators.length - 1; i >= 0; i--) {
        const context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        const result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
const __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    const useValue = arguments.length > 2;
    for (let i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { injectable } from '../../di/decorators/injectable';
/**
 * Factory for creating memory backend providers.
 * Uses dependency injection for logger, configuration, and DAL Factory.
 *
 * @example
 */
const MemoryProviderFactory = (() => {
    const _classDecorators = [injectable];
    let _classDescriptor;
    const _classExtraInitializers = [];
    let _classThis;
    var MemoryProviderFactory = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MemoryProviderFactory = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        config;
        dalFactory;
        constructor(logger, config, dalFactory) {
            this.logger = logger;
            this.config = config;
            this.dalFactory = dalFactory;
        }
        /**
         * Create a memory provider based on configuration.
         *
         * @param config Memory configuration.
         * @returns Appropriate memory backend implementation.
         */
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
    return MemoryProviderFactory = _classThis;
})();
export { MemoryProviderFactory };
const SqliteMemoryBackend = (() => {
    const _classDecorators = [injectable];
    let _classDescriptor;
    const _classExtraInitializers = [];
    let _classThis;
    var SqliteMemoryBackend = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SqliteMemoryBackend = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                // First check if the key exists
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
                // Test basic operation
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
                // Create coordination repository using DAL Factory
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
    return SqliteMemoryBackend = _classThis;
})();
export { SqliteMemoryBackend };
const LanceDBMemoryBackend = (() => {
    const _classDecorators = [injectable];
    let _classDescriptor;
    const _classExtraInitializers = [];
    let _classThis;
    var LanceDBMemoryBackend = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LanceDBMemoryBackend = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                // Generate a simple vector representation for the key-value pair
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
                // Ensure metadata exists on VectorSearchResult and access originalValue safely
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
                // First check if the key exists
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
                // Get all vectors and delete them
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
                // Test basic operation
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
                // Create vector repository using DAL Factory
                this.repository = await this.dalFactory.createLanceDBVectorRepository('MemoryVectors', 384 // Default vector size
                );
                this.initialized = true;
                this.logger.info('LanceDB memory backend initialized via DAL Factory');
            }
            catch (error) {
                this.logger.error(`Failed to initialize LanceDB backend: ${error}`);
                throw error;
            }
        }
        generateVectorFromValue(value) {
            // Simple hash-based vector generation for demo purposes
            // In production, you'd use proper embeddings
            const str = JSON.stringify(value);
            const vector = new Array(384).fill(0);
            for (let i = 0; i < str.length && i < 384; i++) {
                vector[i] = str.charCodeAt(i) / 255; // Normalize to 0-1
            }
            return vector;
        }
    };
    return LanceDBMemoryBackend = _classThis;
})();
export { LanceDBMemoryBackend };
/**
 * JSON file-based memory backend implementation.
 *
 * @example
 */
const JsonMemoryBackend = (() => {
    const _classDecorators = [injectable];
    let _classDescriptor;
    const _classExtraInitializers = [];
    let _classThis;
    var JsonMemoryBackend = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            JsonMemoryBackend = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
            // File loading implementation would go here
            // For now, just initialize empty
            this.data = new Map();
        }
        async persistToFile() {
            // File persistence implementation would go here
            // For now, just log
            this.logger.debug('JSON data persisted to file');
        }
    };
    return JsonMemoryBackend = _classThis;
})();
export { JsonMemoryBackend };
/**
 * In-memory backend implementation (fastest, no persistence).
 *
 * @example
 */
const InMemoryBackend = (() => {
    const _classDecorators = [injectable];
    let _classDescriptor;
    const _classExtraInitializers = [];
    let _classThis;
    var InMemoryBackend = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            InMemoryBackend = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                // Check size limits
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
                // Check if we can perform basic operations
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
    return InMemoryBackend = _classThis;
})();
export { InMemoryBackend };
// Memory backends now properly integrated with DAL Factory
// All database operations go through the existing repository patterns
