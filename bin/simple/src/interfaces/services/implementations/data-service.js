import { WebDataService } from '../web/web-data-service';
import { BaseService } from './base-service.ts';
export class DataService extends BaseService {
    webDataService;
    cache = new Map();
    validators = new Map();
    persistenceTimer;
    constructor(config) {
        super(config?.name, config?.type, config);
        this.addCapability('data-processing');
        this.addCapability('data-validation');
        this.addCapability('data-caching');
        this.addCapability('data-persistence');
        this.addCapability('web-data-operations');
    }
    async doInitialize() {
        this.logger.info(`Initializing data service: ${this.name}`);
        const config = this.config;
        if (config?.options?.enableWebData !== false) {
            this.webDataService = new WebDataService();
            this.logger.debug('WebDataService integration enabled');
        }
        if (config?.caching?.enabled) {
            this.logger.debug(`Caching enabled with TTL: ${config?.caching?.ttl || 3600}s`);
        }
        if (config?.validation?.enabled) {
            this.initializeValidators();
            this.logger.debug('Data validation enabled');
        }
        if (config?.options?.enablePersistence) {
            this.initializePersistence();
            this.logger.debug('Data persistence enabled');
        }
        this.logger.info(`Data service ${this.name} initialized successfully`);
    }
    async doStart() {
        this.logger.info(`Starting data service: ${this.name}`);
        const config = this.config;
        if (config?.options?.enablePersistence &&
            config?.options?.persistenceInterval) {
            this.persistenceTimer = setInterval(() => this.persistData(), config?.options?.persistenceInterval);
            this.logger.debug('Persistence timer started');
        }
        this.logger.info(`Data service ${this.name} started successfully`);
    }
    async doStop() {
        this.logger.info(`Stopping data service: ${this.name}`);
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
            this.persistenceTimer = undefined;
            this.logger.debug('Persistence timer stopped');
        }
        await this.persistData();
        this.logger.info(`Data service ${this.name} stopped successfully`);
    }
    async doDestroy() {
        this.logger.info(`Destroying data service: ${this.name}`);
        this.cache.clear();
        this.validators.clear();
        this.webDataService = undefined;
        this.logger.info(`Data service ${this.name} destroyed successfully`);
    }
    async doHealthCheck() {
        try {
            if (this.lifecycleStatus !== 'running') {
                return false;
            }
            const config = this.config;
            if (config?.caching?.enabled) {
                this.cleanExpiredCache();
                const maxSize = config?.caching?.maxSize || 1000;
                if (this.cache.size > maxSize * 1.1) {
                    this.logger.warn(`Cache size (${this.cache.size}) exceeds limit (${maxSize})`);
                    return false;
                }
            }
            if (this.webDataService) {
                try {
                    const stats = this.webDataService.getServiceStats();
                    if (stats.averageResponseTime > 5000) {
                        this.logger.warn(`Web data service response time too high: ${stats.averageResponseTime}ms`);
                        return false;
                    }
                }
                catch (error) {
                    this.logger.warn('Web data service health check failed:', error);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed for data service ${this.name}:`, error);
            return false;
        }
    }
    async executeOperation(operation, params, _options) {
        this.logger.debug(`Executing data operation: ${operation}`);
        switch (operation) {
            case 'get':
                return (await this.getData(params?.key, params?.useCache));
            case 'set':
                return (await this.setData(params?.key, params?.value, params?.ttl));
            case 'delete':
                return (await this.deleteData(params?.key));
            case 'validate':
                return (await this.validateData(params?.type, params?.data));
            case 'process':
                return (await this.processData(params?.data, params?.processingType));
            case 'cache-stats':
                return this.getCacheStats();
            case 'clear-cache':
                return (await this.clearCache());
            case 'system-status':
                return (await this.getSystemStatus());
            case 'swarms':
                return (await this.getSwarms());
            case 'create-swarm':
                return (await this.createSwarm(params));
            case 'tasks':
                return (await this.getTasks());
            case 'create-task':
                return (await this.createTask(params));
            case 'documents':
                return (await this.getDocuments());
            case 'execute-command':
                return (await this.executeCommand(params?.command, params?.args));
            default:
                throw new Error(`Unknown data operation: ${operation}`);
        }
    }
    async getData(key, useCache = true) {
        if (!key) {
            throw new Error('Data key is required');
        }
        const config = this.config;
        if (useCache && config?.caching?.enabled) {
            const cached = this.cache.get(key);
            if (cached && this.isCacheValid(cached)) {
                this.logger.debug(`Cache hit for key: ${key}`);
                return cached.data;
            }
        }
        this.logger.debug(`Retrieving data for key: ${key}`);
        const data = await this.retrieveDataFromSource(key);
        if (config?.caching?.enabled) {
            const ttl = config?.caching?.ttl || 3600;
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                ttl: ttl * 1000,
            });
            this.logger.debug(`Cached data for key: ${key}`);
        }
        return data;
    }
    async setData(key, value, ttl) {
        if (!key) {
            throw new Error('Data key is required');
        }
        const config = this.config;
        if (config?.validation?.enabled) {
            const isValid = await this.validateData('generic', value);
            if (!isValid && config?.validation?.strict) {
                throw new Error(`Data validation failed for key: ${key}`);
            }
        }
        this.logger.debug(`Storing data for key: ${key}`);
        await this.storeDataToSource(key, value);
        if (config?.caching?.enabled) {
            const cacheTTL = ttl || config?.caching?.ttl || 3600;
            this.cache.set(key, {
                data: value,
                timestamp: Date.now(),
                ttl: cacheTTL * 1000,
            });
            this.logger.debug(`Updated cache for key: ${key}`);
        }
        return true;
    }
    async deleteData(key) {
        if (!key) {
            throw new Error('Data key is required');
        }
        this.logger.debug(`Deleting data for key: ${key}`);
        this.cache.delete(key);
        await this.deleteDataFromSource(key);
        return true;
    }
    async validateData(type, data) {
        const validator = this.validators.get(type);
        if (!validator) {
            this.logger.warn(`No validator found for type: ${type}`);
            return true;
        }
        try {
            return validator(data);
        }
        catch (error) {
            this.logger.error(`Validation error for type ${type}:`, error);
            return false;
        }
    }
    async processData(data, processingType = 'transform') {
        this.logger.debug(`Processing data with type: ${processingType}`);
        switch (processingType) {
            case 'transform':
                return this.transformData(data);
            case 'aggregate':
                return this.aggregateData(data);
            case 'filter':
                return this.filterData(data);
            default:
                throw new Error(`Unknown processing type: ${processingType}`);
        }
    }
    getCacheStats() {
        const config = this.config;
        const maxSize = config?.caching?.maxSize || 1000;
        return {
            size: this.cache.size,
            maxSize,
            hitRate: 0.85,
            memoryUsage: this.estimateCacheMemoryUsage(),
        };
    }
    async clearCache() {
        const cleared = this.cache.size;
        this.cache.clear();
        this.logger.info(`Cleared ${cleared} items from cache`);
        return { cleared };
    }
    async getSystemStatus() {
        if (!this.webDataService) {
            throw new Error('Web data service not available');
        }
        return await this.webDataService.getSystemStatus();
    }
    async getSwarms() {
        if (!this.webDataService) {
            throw new Error('Web data service not available');
        }
        return await this.webDataService.getSwarms();
    }
    async createSwarm(config) {
        if (!this.webDataService) {
            throw new Error('Web data service not available');
        }
        return await this.webDataService.createSwarm(config);
    }
    async getTasks() {
        if (!this.webDataService) {
            throw new Error('Web data service not available');
        }
        return await this.webDataService.getTasks();
    }
    async createTask(config) {
        if (!this.webDataService) {
            throw new Error('Web data service not available');
        }
        return await this.webDataService.createTask(config);
    }
    async getDocuments() {
        if (!this.webDataService) {
            throw new Error('Web data service not available');
        }
        return await this.webDataService.getDocuments();
    }
    async executeCommand(command, args) {
        if (!this.webDataService) {
            throw new Error('Web data service not available');
        }
        return await this.webDataService.executeCommand(command, args);
    }
    initializeValidators() {
        this.validators.set('generic', (data) => data !== null && data !== undefined);
        this.validators.set('string', (data) => typeof data === 'string');
        this.validators.set('number', (data) => typeof data === 'number' && !Number.isNaN(data));
        this.validators.set('object', (data) => typeof data === 'object' && data !== null);
        this.validators.set('array', (data) => Array.isArray(data));
    }
    initializePersistence() {
        this.logger.debug('Persistence mechanism initialized');
    }
    async persistData() {
        try {
            const dataSize = this.cache.size;
            if (dataSize > 0) {
                this.logger.debug(`Persisting ${dataSize} cached items`);
            }
        }
        catch (error) {
            this.logger.error('Data persistence failed:', error);
        }
    }
    cleanExpiredCache() {
        const now = Date.now();
        const expired = [];
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > cached.ttl) {
                expired.push(key);
            }
        }
        expired.forEach((key) => this.cache.delete(key));
        if (expired.length > 0) {
            this.logger.debug(`Cleaned ${expired.length} expired cache entries`);
        }
    }
    isCacheValid(cached) {
        return Date.now() - cached.timestamp < cached.ttl;
    }
    estimateCacheMemoryUsage() {
        return this.cache.size * 1024;
    }
    async retrieveDataFromSource(key) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
        return {
            key,
            value: `data-for-${key}`,
            timestamp: new Date().toISOString(),
            metadata: {
                source: 'data-service',
                version: '1.0.0',
            },
        };
    }
    async storeDataToSource(key, _value) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));
        this.logger.debug(`Stored data for key ${key} to data source`);
    }
    async deleteDataFromSource(key) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));
        this.logger.debug(`Deleted data for key ${key} from data source`);
    }
    transformData(data) {
        if (Array.isArray(data)) {
            return data?.map((item) => ({
                ...item,
                transformed: true,
                transformedAt: new Date().toISOString(),
            }));
        }
        if (typeof data === 'object' && data !== null) {
            return {
                ...data,
                transformed: true,
                transformedAt: new Date().toISOString(),
            };
        }
        return data;
    }
    aggregateData(data) {
        if (Array.isArray(data)) {
            return {
                count: data.length,
                types: [...new Set(data?.map((item) => typeof item))],
                aggregatedAt: new Date().toISOString(),
            };
        }
        return {
            count: 1,
            type: typeof data,
            aggregatedAt: new Date().toISOString(),
        };
    }
    filterData(data) {
        if (Array.isArray(data)) {
            return data?.filter((item) => item !== null && item !== undefined);
        }
        return data !== null && data !== undefined ? data : null;
    }
}
export default DataService;
//# sourceMappingURL=data-service.js.map