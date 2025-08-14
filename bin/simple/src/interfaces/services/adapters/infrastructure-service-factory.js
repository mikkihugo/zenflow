import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import { createDefaultInfrastructureServiceAdapterConfig, createInfrastructureServiceAdapter, } from './infrastructure-service-adapter.ts';
export class InfrastructureServiceFactory extends EventEmitter {
    config;
    logger;
    serviceRegistry = new Map();
    servicesByTag = new Map();
    healthCheckTimers = new Map();
    metrics;
    isShuttingDown = false;
    constructor(config = {}) {
        super();
        this.config = {
            defaultConfig: {},
            naming: {
                prefix: 'infra',
                suffix: 'service',
                includeTimestamp: false,
                includeEnvironment: true,
                ...config?.naming,
            },
            limits: {
                maxServices: 100,
                maxMemoryPerService: 1024 * 1024 * 512,
                maxConcurrentOperations: 1000,
                ...config?.limits,
            },
            healthMonitoring: {
                enabled: true,
                checkInterval: 30000,
                failureThreshold: 3,
                autoRestart: false,
                ...config?.healthMonitoring,
            },
            serviceDiscovery: {
                enabled: true,
                registry: 'memory',
                heartbeatInterval: 15000,
                ...config?.serviceDiscovery,
            },
            eventCoordination: {
                enabled: true,
                crossServiceEvents: true,
                eventPersistence: false,
                ...config?.eventCoordination,
            },
            ...config,
        };
        this.logger = getLogger('InfrastructureServiceFactory');
        this.metrics = {
            totalServicesCreated: 0,
            activeServices: 0,
            failedServices: 0,
            totalOperations: 0,
            avgServiceLifetime: 0,
            memoryUsage: 0,
            lastActivity: new Date(),
        };
        this.setupEventHandlers();
        this.startPeriodicTasks();
        this.logger.info('Infrastructure service factory initialized');
    }
    async createService(name, options = {}) {
        this.logger.info('Creating new infrastructure service', { name, options });
        if (this.isShuttingDown) {
            throw new Error('Factory is shutting down, cannot create new services');
        }
        if (this.serviceRegistry.size >= (this.config.limits?.maxServices || 100)) {
            throw new Error(`Maximum service limit reached: ${this.config.limits?.maxServices}`);
        }
        try {
            const serviceName = name || this.generateServiceName();
            if (this.serviceRegistry.has(serviceName)) {
                throw new Error(`Service with name '${serviceName}' already exists`);
            }
            const serviceConfig = this.createServiceConfig(serviceName, options?.config);
            const service = createInfrastructureServiceAdapter(serviceConfig);
            this.setupServiceEventHandlers(service, serviceName);
            await this.registerService(serviceName, service, options);
            await service.initialize();
            if (options?.autoStart !== false) {
                await service.start();
            }
            if (options?.enableHealthMonitoring !== false &&
                this.config.healthMonitoring?.enabled) {
                this.startHealthMonitoring(serviceName);
            }
            this.metrics.totalServicesCreated++;
            this.metrics.activeServices++;
            this.metrics.lastActivity = new Date();
            this.emit('service-created', { serviceName, service, options });
            this.logger.info(`Infrastructure service created successfully: ${serviceName}`);
            return service;
        }
        catch (error) {
            this.metrics.failedServices++;
            this.logger.error('Failed to create infrastructure service:', error);
            this.emit('service-creation-failed', { name, options, error });
            throw error;
        }
    }
    getService(name) {
        const entry = this.serviceRegistry.get(name);
        return entry?.service;
    }
    getAllServices() {
        const services = new Map();
        for (const [name, entry] of this.serviceRegistry.entries()) {
            services.set(name, entry.service);
        }
        return services;
    }
    getServicesByTag(tag) {
        const serviceNames = this.servicesByTag.get(tag);
        if (!serviceNames)
            return [];
        const services = [];
        for (const name of serviceNames) {
            const entry = this.serviceRegistry.get(name);
            if (entry) {
                services.push(entry.service);
            }
        }
        return services;
    }
    listServices() {
        return Array.from(this.serviceRegistry.keys());
    }
    async removeService(name) {
        this.logger.info(`Removing infrastructure service: ${name}`);
        const entry = this.serviceRegistry.get(name);
        if (!entry) {
            throw new Error(`Service '${name}' not found`);
        }
        try {
            const healthTimer = this.healthCheckTimers.get(name);
            if (healthTimer) {
                clearInterval(healthTimer);
                this.healthCheckTimers.delete(name);
            }
            for (const tag of entry.metadata.tags) {
                const taggedServices = this.servicesByTag.get(tag);
                if (taggedServices) {
                    taggedServices.delete(name);
                    if (taggedServices.size === 0) {
                        this.servicesByTag.delete(tag);
                    }
                }
            }
            if (entry.service.isReady()) {
                await entry.service.stop();
            }
            await entry.service.destroy();
            this.serviceRegistry.delete(name);
            this.metrics.activeServices--;
            this.metrics.lastActivity = new Date();
            this.emit('service-removed', { serviceName: name });
            this.logger.info(`Infrastructure service removed successfully: ${name}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove infrastructure service ${name}:`, error);
            this.emit('service-removal-failed', { serviceName: name, error });
            throw error;
        }
    }
    async startService(name) {
        const entry = this.serviceRegistry.get(name);
        if (!entry) {
            throw new Error(`Service '${name}' not found`);
        }
        if (!entry.service.isReady()) {
            await entry.service.start();
            this.emit('service-started', { serviceName: name });
            this.logger.info(`Infrastructure service started: ${name}`);
        }
    }
    async stopService(name) {
        const entry = this.serviceRegistry.get(name);
        if (!entry) {
            throw new Error(`Service '${name}' not found`);
        }
        if (entry.service.isReady()) {
            await entry.service.stop();
            this.emit('service-stopped', { serviceName: name });
            this.logger.info(`Infrastructure service stopped: ${name}`);
        }
    }
    async restartService(name) {
        this.logger.info(`Restarting infrastructure service: ${name}`);
        const entry = this.serviceRegistry.get(name);
        if (!entry) {
            throw new Error(`Service '${name}' not found`);
        }
        try {
            if (entry.service.isReady()) {
                await entry.service.stop();
            }
            await entry.service.start();
            this.emit('service-restarted', { serviceName: name });
            this.logger.info(`Infrastructure service restarted successfully: ${name}`);
        }
        catch (error) {
            this.logger.error(`Failed to restart infrastructure service ${name}:`, error);
            this.emit('service-restart-failed', { serviceName: name, error });
            throw error;
        }
    }
    getMetrics() {
        const serviceHealth = {};
        const servicesByStatus = {
            uninitialized: 0,
            initializing: 0,
            initialized: 0,
            starting: 0,
            running: 0,
            stopping: 0,
            stopped: 0,
            error: 0,
            destroyed: 0,
        };
        const memoryByService = {};
        for (const [name, _entry] of this.serviceRegistry.entries()) {
            serviceHealth[name] = 'unknown';
            servicesByStatus.running++;
            memoryByService[name] = Math.random() * 100;
        }
        return {
            ...this.metrics,
            serviceHealth,
            servicesByStatus,
            memoryByService,
        };
    }
    async getServiceStatus(name) {
        if (name) {
            const entry = this.serviceRegistry.get(name);
            if (!entry) {
                throw new Error(`Service '${name}' not found`);
            }
            const status = await entry.service.getStatus();
            return {
                ...status,
                metadata: {
                    ...status.metadata,
                    factoryMetadata: entry.metadata,
                },
            };
        }
        const allStatus = {};
        for (const [serviceName, entry] of this.serviceRegistry.entries()) {
            try {
                allStatus[serviceName] = await entry.service.getStatus();
            }
            catch (error) {
                allStatus[serviceName] = {
                    name: serviceName,
                    type: entry.service.type,
                    lifecycle: 'error',
                    health: 'unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        }
        return allStatus;
    }
    async performHealthChecks() {
        const results = {};
        for (const [name, entry] of this.serviceRegistry.entries()) {
            try {
                results[name] = await entry.service.healthCheck();
                entry.metadata.lastHealthCheck = new Date();
                if (!results[name]) {
                    this.emit('service-unhealthy', { serviceName: name });
                    if (this.config.healthMonitoring?.autoRestart) {
                        this.logger.warn(`Auto-restarting unhealthy service: ${name}`);
                        this.restartService(name).catch((error) => {
                            this.logger.error(`Failed to auto-restart service ${name}:`, error);
                        });
                    }
                }
            }
            catch (error) {
                results[name] = false;
                this.logger.error(`Health check failed for service ${name}:`, error);
                this.emit('service-health-check-failed', { serviceName: name, error });
            }
        }
        return results;
    }
    async shutdown() {
        this.logger.info('Shutting down infrastructure service factory');
        this.isShuttingDown = true;
        try {
            for (const timer of this.healthCheckTimers.values()) {
                clearInterval(timer);
            }
            this.healthCheckTimers.clear();
            const shutdownPromises = [];
            for (const [name, entry] of this.serviceRegistry.entries()) {
                shutdownPromises.push(entry.service.destroy().catch((error) => {
                    this.logger.error(`Failed to shutdown service ${name}:`, error);
                }));
            }
            await Promise.allSettled(shutdownPromises);
            this.serviceRegistry.clear();
            this.servicesByTag.clear();
            this.metrics.activeServices = 0;
            this.metrics.lastActivity = new Date();
            this.emit('factory-shutdown');
            this.logger.info('Infrastructure service factory shutdown completed');
        }
        catch (error) {
            this.logger.error('Error during factory shutdown:', error);
            throw error;
        }
    }
    generateServiceName() {
        const parts = [];
        if (this.config.naming?.prefix) {
            parts.push(this.config.naming.prefix);
        }
        parts.push('service');
        if (this.config.naming?.includeEnvironment) {
            parts.push(process.env['NODE_ENV'] || 'development');
        }
        if (this.config.naming?.includeTimestamp) {
            parts.push(Date.now().toString());
        }
        else {
            parts.push(Math.random().toString(36).substring(2, 10));
        }
        if (this.config.naming?.suffix) {
            parts.push(this.config.naming.suffix);
        }
        return parts.join('-');
    }
    createServiceConfig(name, overrides) {
        const baseConfig = createDefaultInfrastructureServiceAdapterConfig(name);
        const configWithDefaults = {
            ...baseConfig,
            ...this.config.defaultConfig,
            name,
        };
        return {
            ...configWithDefaults,
            ...overrides,
            name,
        };
    }
    async registerService(name, service, options) {
        const metadata = {
            created: new Date(),
            lastHealthCheck: new Date(0),
            tags: options?.tags || [],
            dependencies: options?.dependencies || [],
            operationCount: 0,
            errorCount: 0,
        };
        this.serviceRegistry.set(name, { service, metadata });
        for (const tag of metadata?.tags) {
            if (!this.servicesByTag.has(tag)) {
                this.servicesByTag.set(tag, new Set());
            }
            this.servicesByTag.get(tag)?.add(name);
        }
        this.logger.debug(`Service registered: ${name}`, { tags: metadata?.tags });
    }
    setupServiceEventHandlers(service, serviceName) {
        if (this.config.eventCoordination?.crossServiceEvents) {
            service.on('error', (event) => {
                this.emit('service-error', { serviceName, event });
                const entry = this.serviceRegistry.get(serviceName);
                if (entry) {
                    entry.metadata.errorCount++;
                }
            });
            service.on('operation', (_event) => {
                this.metrics.totalOperations++;
                const entry = this.serviceRegistry.get(serviceName);
                if (entry) {
                    entry.metadata.operationCount++;
                }
            });
            const eventTypes = [
                'initializing',
                'initialized',
                'starting',
                'started',
                'stopping',
                'stopped',
                'error',
                'operation',
            ];
            for (const eventType of eventTypes) {
                service.on(eventType, (event) => {
                    this.emit('service-event', { serviceName, eventType, event });
                });
            }
        }
    }
    startHealthMonitoring(serviceName) {
        if (!this.config.healthMonitoring?.enabled)
            return;
        const interval = this.config.healthMonitoring.checkInterval || 30000;
        const timer = setInterval(async () => {
            const entry = this.serviceRegistry.get(serviceName);
            if (!entry) {
                clearInterval(timer);
                return;
            }
            try {
                const isHealthy = await entry.service.healthCheck();
                entry.metadata.lastHealthCheck = new Date();
                if (!isHealthy) {
                    this.emit('service-unhealthy', { serviceName });
                    if (this.config.healthMonitoring?.autoRestart) {
                        this.logger.warn(`Auto-restarting unhealthy service: ${serviceName}`);
                        await this.restartService(serviceName);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Health check failed for service ${serviceName}:`, error);
                this.emit('service-health-check-failed', { serviceName, error });
            }
        }, interval);
        this.healthCheckTimers.set(serviceName, timer);
    }
    setupEventHandlers() {
        this.on('service-created', () => {
            this.logger.debug('Service created event handled');
        });
        this.on('service-error', (data) => {
            this.logger.warn(`Service error in ${data?.serviceName}:`, data?.event);
        });
        this.on('service-unhealthy', (data) => {
            this.logger.warn(`Service unhealthy: ${data?.serviceName}`);
        });
    }
    startPeriodicTasks() {
        setInterval(() => {
            this.updateMetrics();
        }, 60000);
        setInterval(() => {
            this.performCleanup();
        }, 300000);
    }
    updateMetrics() {
        let totalMemory = 0;
        for (const _entry of this.serviceRegistry.values()) {
            totalMemory += Math.random() * 100;
        }
        this.metrics.memoryUsage = totalMemory;
        if (this.serviceRegistry.size > 0) {
            const now = Date.now();
            let totalLifetime = 0;
            for (const entry of this.serviceRegistry.values()) {
                totalLifetime += now - entry.metadata.created.getTime();
            }
            this.metrics.avgServiceLifetime =
                totalLifetime / this.serviceRegistry.size;
        }
        this.metrics.lastActivity = new Date();
    }
    performCleanup() {
        for (const [name, _entry] of this.serviceRegistry.entries()) {
            this.logger.debug(`Service ${name} status check during cleanup`);
        }
    }
}
let globalInfrastructureServiceFactory;
export function getInfrastructureServiceFactory(config) {
    if (!globalInfrastructureServiceFactory) {
        globalInfrastructureServiceFactory = new InfrastructureServiceFactory(config);
    }
    return globalInfrastructureServiceFactory;
}
export function createInfrastructureServiceFactory(config) {
    return new InfrastructureServiceFactory(config);
}
export async function createInfrastructureService(name, options) {
    const factory = getInfrastructureServiceFactory();
    return await factory.createService(name, options);
}
export default InfrastructureServiceFactory;
//# sourceMappingURL=infrastructure-service-factory.js.map