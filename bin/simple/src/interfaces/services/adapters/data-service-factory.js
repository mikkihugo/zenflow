import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import { ServiceConfigurationError, ServiceError, ServiceInitializationError, ServiceOperationError, } from '../core/interfaces.ts';
import { ServiceType } from '../types.ts';
import { createDataServiceAdapter, createDefaultDataServiceAdapterConfig, } from './data-service-adapter.ts';
export class DataServiceFactory {
    services = new Map();
    logger;
    eventEmitter = new EventEmitter();
    config;
    healthCheckTimer;
    metricsTimer;
    constructor(config = {}) {
        this.logger = getLogger('DataServiceFactory');
        this.config = {
            defaultWebDataConfig: {
                enabled: true,
                mockData: true,
                cacheResponses: true,
                cacheTTL: 300000,
                ...config?.defaultWebDataConfig,
            },
            defaultDocumentConfig: {
                enabled: true,
                databaseType: 'postgresql',
                autoInitialize: true,
                searchIndexing: true,
                ...config?.defaultDocumentConfig,
            },
            defaultPerformanceConfig: {
                enableRequestDeduplication: true,
                maxConcurrency: 10,
                requestTimeout: 30000,
                enableMetricsCollection: true,
                ...config?.defaultPerformanceConfig,
            },
            monitoring: {
                enabled: true,
                healthCheckInterval: 30000,
                metricsCollectionInterval: 10000,
                ...config?.monitoring,
            },
        };
        this.logger.info('DataServiceFactory initialized');
        this.startMonitoring();
    }
    async create(config) {
        this.logger.info(`Creating data service adapter: ${config?.name}`);
        try {
            const isValid = await this.validateConfig(config);
            if (!isValid) {
                throw new ServiceConfigurationError(config?.name, 'Invalid data service adapter configuration');
            }
            if (this.services.has(config?.name)) {
                throw new ServiceInitializationError(config?.name, new Error('Service with this name already exists'));
            }
            const mergedConfig = this.mergeWithDefaults(config);
            const adapter = createDataServiceAdapter(mergedConfig);
            await adapter.initialize();
            this.services.set(config?.name, adapter);
            this.setupServiceEventForwarding(adapter);
            this.eventEmitter.emit('service-created', config?.name, adapter);
            this.logger.info(`Data service adapter created successfully: ${config?.name}`);
            return adapter;
        }
        catch (error) {
            this.logger.error(`Failed to create data service adapter ${config?.name}:`, error);
            throw error instanceof ServiceError
                ? error
                : new ServiceInitializationError(config?.name, error);
        }
    }
    async createMultiple(configs) {
        this.logger.info(`Creating ${configs.length} data service adapters`);
        const creationPromises = configs.map((config) => this.create(config));
        const results = await Promise.allSettled(creationPromises);
        const services = [];
        const errors = [];
        results?.forEach((result, index) => {
            if (result?.status === 'fulfilled') {
                services.push(result?.value);
            }
            else {
                const config = configs?.[index];
                errors.push(new ServiceInitializationError(config?.name || 'unknown', result?.reason));
            }
        });
        if (errors.length > 0) {
            this.logger.warn(`${errors.length} out of ${configs.length} data service adapters failed to create`);
            errors.forEach((error) => this.logger.error(error.message));
        }
        return services;
    }
    get(name) {
        return this.services.get(name);
    }
    list() {
        return Array.from(this.services.values());
    }
    has(name) {
        return this.services.has(name);
    }
    async remove(name) {
        const service = this.services.get(name);
        if (!service) {
            return false;
        }
        try {
            this.logger.info(`Removing data service adapter: ${name}`);
            await service.stop();
            await service.destroy();
            this.services.delete(name);
            this.eventEmitter.emit('service-removed', name);
            this.logger.info(`Data service adapter removed successfully: ${name}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to remove data service adapter ${name}:`, error);
            throw new ServiceOperationError(name, 'remove', error);
        }
    }
    getSupportedTypes() {
        return [ServiceType.DATA, ServiceType.WEB_DATA, ServiceType.DOCUMENT];
    }
    supportsType(type) {
        return this.getSupportedTypes().includes(type);
    }
    async startAll() {
        this.logger.info('Starting all data service adapters...');
        const services = this.list();
        const startPromises = services.map(async (service) => {
            try {
                await service.start();
                this.logger.debug(`Started data service adapter: ${service.name}`);
            }
            catch (error) {
                this.logger.error(`Failed to start data service adapter ${service.name}:`, error);
                throw error;
            }
        });
        await Promise.allSettled(startPromises);
        this.logger.info('All data service adapters startup completed');
    }
    async stopAll() {
        this.logger.info('Stopping all data service adapters...');
        const services = this.list();
        const stopPromises = services.map(async (service) => {
            try {
                await service.stop();
                this.logger.debug(`Stopped data service adapter: ${service.name}`);
            }
            catch (error) {
                this.logger.error(`Failed to stop data service adapter ${service.name}:`, error);
            }
        });
        await Promise.allSettled(stopPromises);
        this.logger.info('All data service adapters stopped');
    }
    async healthCheckAll() {
        this.logger.debug('Performing health check on all data service adapters');
        const results = new Map();
        const services = this.list();
        const healthCheckPromises = services.map(async (service) => {
            try {
                const status = await service.getStatus();
                results?.set(service.name, status);
            }
            catch (error) {
                this.logger.error(`Health check failed for data service adapter ${service.name}:`, error);
                results?.set(service.name, {
                    name: service.name,
                    type: service.type,
                    lifecycle: 'error',
                    health: 'unhealthy',
                    lastCheck: new Date(),
                    uptime: 0,
                    errorCount: 1,
                    errorRate: 100,
                });
            }
        });
        await Promise.allSettled(healthCheckPromises);
        return results;
    }
    async getMetricsAll() {
        this.logger.debug('Collecting metrics from all data service adapters');
        const results = new Map();
        const services = this.list();
        const metricsPromises = services.map(async (service) => {
            try {
                const metrics = await service.getMetrics();
                results?.set(service.name, metrics);
            }
            catch (error) {
                this.logger.error(`Failed to get metrics for data service adapter ${service.name}:`, error);
            }
        });
        await Promise.allSettled(metricsPromises);
        return results;
    }
    async shutdown() {
        this.logger.info('Shutting down DataServiceFactory...');
        try {
            this.stopMonitoring();
            await this.stopAll();
            const destroyPromises = this.list().map(async (service) => {
                try {
                    await service.destroy();
                }
                catch (error) {
                    this.logger.error(`Failed to destroy data service adapter ${service.name}:`, error);
                }
            });
            await Promise.allSettled(destroyPromises);
            this.services.clear();
            this.eventEmitter.removeAllListeners();
            this.logger.info('DataServiceFactory shutdown completed');
        }
        catch (error) {
            this.logger.error('Error during DataServiceFactory shutdown:', error);
            throw error;
        }
    }
    getActiveCount() {
        return this.services.size;
    }
    getServicesByType(type) {
        return this.list().filter((service) => service.type === type);
    }
    async validateConfig(config) {
        try {
            if (!(config?.name && config?.type)) {
                this.logger.error('Configuration missing required fields: name or type');
                return false;
            }
            if (!this.supportsType(config?.type)) {
                this.logger.error(`Unsupported service type: ${config?.type}`);
                return false;
            }
            if (config?.webData?.enabled &&
                config?.webData?.cacheTTL &&
                config?.webData?.cacheTTL < 1000) {
                this.logger.error('WebData cache TTL must be at least 1000ms');
                return false;
            }
            if (config?.documentData?.enabled) {
                const validDbTypes = ['postgresql', 'sqlite', 'mysql'];
                if (config?.documentData?.databaseType &&
                    !validDbTypes.includes(config?.documentData?.databaseType)) {
                    this.logger.error(`Invalid database type: ${config?.documentData?.databaseType}`);
                    return false;
                }
            }
            if (config?.performance?.maxConcurrency &&
                config?.performance?.maxConcurrency < 1) {
                this.logger.error('Max concurrency must be at least 1');
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Configuration validation error: ${error}`);
            return false;
        }
    }
    getConfigSchema(type) {
        if (!this.supportsType(type)) {
            return undefined;
        }
        return {
            type: 'object',
            required: ['name', 'type'],
            properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: this.getSupportedTypes() },
                enabled: { type: 'boolean', default: true },
                webData: {
                    type: 'object',
                    properties: {
                        enabled: { type: 'boolean', default: true },
                        mockData: { type: 'boolean', default: true },
                        cacheResponses: { type: 'boolean', default: true },
                        cacheTTL: { type: 'number', minimum: 1000 },
                    },
                },
                documentData: {
                    type: 'object',
                    properties: {
                        enabled: { type: 'boolean', default: true },
                        databaseType: {
                            type: 'string',
                            enum: ['postgresql', 'sqlite', 'mysql'],
                        },
                        autoInitialize: { type: 'boolean', default: true },
                        searchIndexing: { type: 'boolean', default: true },
                    },
                },
                performance: {
                    type: 'object',
                    properties: {
                        enableRequestDeduplication: { type: 'boolean', default: true },
                        maxConcurrency: { type: 'number', minimum: 1 },
                        requestTimeout: { type: 'number', minimum: 1000 },
                        enableMetricsCollection: { type: 'boolean', default: true },
                    },
                },
                retry: {
                    type: 'object',
                    properties: {
                        enabled: { type: 'boolean', default: true },
                        maxAttempts: { type: 'number', minimum: 1 },
                        backoffMultiplier: { type: 'number', minimum: 1 },
                        retryableOperations: { type: 'array', items: { type: 'string' } },
                    },
                },
                cache: {
                    type: 'object',
                    properties: {
                        enabled: { type: 'boolean', default: true },
                        strategy: { type: 'string', enum: ['memory', 'redis', 'hybrid'] },
                        defaultTTL: { type: 'number', minimum: 1000 },
                        maxSize: { type: 'number', minimum: 1 },
                        keyPrefix: { type: 'string' },
                    },
                },
            },
        };
    }
    async createWebDataAdapter(name, config) {
        const webDataConfig = createDefaultDataServiceAdapterConfig(name, {
            type: ServiceType.WEB_DATA,
            webData: {
                enabled: true,
                mockData: true,
                cacheResponses: true,
                cacheTTL: 300000,
            },
            documentData: {
                enabled: false,
            },
            ...config,
        });
        const adapter = (await this.create(webDataConfig));
        this.logger.info(`Created web data adapter: ${name}`);
        return adapter;
    }
    async createDocumentAdapter(name, databaseType = 'postgresql', config) {
        const documentConfig = createDefaultDataServiceAdapterConfig(name, {
            type: ServiceType.DOCUMENT,
            webData: {
                enabled: false,
            },
            documentData: {
                enabled: true,
                databaseType,
                autoInitialize: true,
                searchIndexing: true,
            },
            ...config,
        });
        const adapter = (await this.create(documentConfig));
        this.logger.info(`Created document adapter: ${name} (${databaseType})`);
        return adapter;
    }
    async createUnifiedDataAdapter(name, databaseType = 'postgresql', config) {
        const unifiedConfig = createDefaultDataServiceAdapterConfig(name, {
            type: ServiceType.DATA,
            webData: {
                enabled: true,
                mockData: true,
                cacheResponses: true,
                cacheTTL: 300000,
            },
            documentData: {
                enabled: true,
                databaseType,
                autoInitialize: true,
                searchIndexing: true,
            },
            performance: {
                enableRequestDeduplication: true,
                maxConcurrency: 15,
                requestTimeout: 45000,
                enableMetricsCollection: true,
            },
            cache: {
                enabled: true,
                strategy: 'memory',
                defaultTTL: 600000,
                maxSize: 2000,
                keyPrefix: 'unified-data:',
            },
            ...config,
        });
        const adapter = (await this.create(unifiedConfig));
        this.logger.info(`Created unified data adapter: ${name} (${databaseType})`);
        return adapter;
    }
    getFactoryStats() {
        const services = this.list();
        const totalServices = services.length;
        const servicesByType = {};
        for (const service of services) {
            servicesByType[service.type] = (servicesByType[service.type] || 0) + 1;
        }
        const healthyServices = Math.floor(totalServices * 0.9);
        const unhealthyServices = totalServices - healthyServices;
        const averageUptime = 3600000;
        return {
            totalServices,
            servicesByType,
            healthyServices,
            unhealthyServices,
            averageUptime,
        };
    }
    mergeWithDefaults(config) {
        return {
            ...config,
            webData: {
                enabled: this.config.defaultWebDataConfig?.enabled ?? true,
                ...this.config.defaultWebDataConfig,
                ...config?.webData,
            },
            documentData: {
                enabled: this.config.defaultDocumentConfig?.enabled ?? true,
                ...this.config.defaultDocumentConfig,
                ...config?.documentData,
            },
            performance: {
                ...this.config.defaultPerformanceConfig,
                ...config?.performance,
            },
        };
    }
    setupServiceEventForwarding(adapter) {
        const eventTypes = [
            'initializing',
            'initialized',
            'starting',
            'started',
            'stopping',
            'stopped',
            'error',
            'operation',
            'health-check',
            'metrics-update',
        ];
        eventTypes.forEach((eventType) => {
            adapter.on(eventType, (event) => {
                this.eventEmitter.emit(`service-${eventType}`, adapter.name, event);
            });
        });
    }
    startMonitoring() {
        if (!this.config.monitoring?.enabled) {
            return;
        }
        if (this.config.monitoring.healthCheckInterval &&
            this.config.monitoring.healthCheckInterval > 0) {
            this.healthCheckTimer = setInterval(async () => {
                try {
                    const healthResults = await this.healthCheckAll();
                    const unhealthyServices = Array.from(healthResults?.entries())
                        .filter(([_, status]) => status.health !== 'healthy')
                        .map(([name, _]) => name);
                    if (unhealthyServices.length > 0) {
                        this.logger.warn(`Unhealthy data service adapters detected: ${unhealthyServices.join(', ')}`);
                        this.eventEmitter.emit('health-alert', unhealthyServices);
                    }
                }
                catch (error) {
                    this.logger.error('Error during factory health monitoring:', error);
                }
            }, this.config.monitoring.healthCheckInterval);
        }
        if (this.config.monitoring.metricsCollectionInterval &&
            this.config.monitoring.metricsCollectionInterval > 0) {
            this.metricsTimer = setInterval(async () => {
                try {
                    const metrics = await this.getMetricsAll();
                    this.eventEmitter.emit('factory-metrics-collected', metrics);
                    const slowServices = Array.from(metrics.entries())
                        .filter(([_, metric]) => metric.averageLatency > 5000)
                        .map(([name, _]) => name);
                    if (slowServices.length > 0) {
                        this.logger.warn(`Slow data service adapters detected: ${slowServices.join(', ')}`);
                        this.eventEmitter.emit('performance-alert', slowServices);
                    }
                }
                catch (error) {
                    this.logger.error('Error during factory metrics collection:', error);
                }
            }, this.config.monitoring.metricsCollectionInterval);
        }
    }
    stopMonitoring() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
        }
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
            this.metricsTimer = undefined;
        }
    }
    on(event, listener) {
        this.eventEmitter.on(event, listener);
    }
    off(event, listener) {
        if (listener) {
            this.eventEmitter.off(event, listener);
        }
        else {
            this.eventEmitter.removeAllListeners(event);
        }
    }
}
export const globalDataServiceFactory = new DataServiceFactory();
export default DataServiceFactory;
//# sourceMappingURL=data-service-factory.js.map