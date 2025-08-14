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
import { CORE_TOKENS } from '../../di/tokens/core-tokens.ts';
import { EventManagerTypes } from './core/interfaces.ts';
import { EventCategories, EventPriorityMap } from './types.ts';
let EventRegistry = class EventRegistry {
    _logger;
    eventManagers = new Map();
    factories = new Map();
    eventTypes = {};
    factoryRegistry = {};
    healthMonitoring;
    discoveryConfig;
    healthCheckInterval;
    initialized = false;
    constructor(_logger) {
        this._logger = _logger;
        this.healthMonitoring = {
            checkInterval: 30000,
            timeout: 5000,
            failureThreshold: 3,
            autoRecovery: true,
            maxRecoveryAttempts: 3,
            notifyOnStatusChange: true
        };
        this.discoveryConfig = {
            autoDiscover: true,
            patterns: ['*Event', '*event', 'event:*'],
            scanPaths: ['./events', './src/events'],
            fileExtensions: ['.ts', '.js']
        };
    }
    async initialize(config) {
        if (this.initialized) {
            return;
        }
        if (config?.healthMonitoring) {
            this.healthMonitoring = { ...this.healthMonitoring, ...config?.healthMonitoring };
        }
        if (config?.discovery) {
            this.discoveryConfig = { ...this.discoveryConfig, ...config?.discovery };
        }
        if (config?.autoRegisterDefaults !== false) {
            await this.registerDefaultEventTypes();
        }
        this.startHealthMonitoring();
        if (this.discoveryConfig.autoDiscover) {
            await this.performEventDiscovery();
        }
        this.initialized = true;
        this._logger.info('✅ Event Registry initialized successfully');
    }
    registerFactory(type, factory) {
        this.factories.set(type, factory);
        this.factoryRegistry[type] = {
            factory: factory,
            metadata: {
                name: factory.constructor.name,
                version: '1.0.0',
                capabilities: [],
                supported: [type],
            },
            registered: new Date(),
            usage: {
                managersCreated: 0,
                totalRequests: 0,
                successRate: 1.0,
            },
        };
        this._logger.debug(`📋 Registered event manager factory: ${type}`);
    }
    getFactory(type) {
        const factory = this.factories.get(type);
        if (factory && this.factoryRegistry[type]) {
            const registry = this.factoryRegistry[type];
            if (registry) {
                registry.usage.totalRequests++;
            }
        }
        return factory;
    }
    listFactoryTypes() {
        return Array.from(this.factories.keys());
    }
    registerManager(name, manager, factory, config) {
        const entry = {
            manager,
            factory,
            config,
            created: new Date(),
            lastAccessed: new Date(),
            lastHealthCheck: new Date(),
            status: 'healthy',
            usage: {
                accessCount: 0,
                totalEvents: 0,
                totalSubscriptions: 0,
                errorCount: 0,
            },
            metadata: {
                registryVersion: '1.0.0',
                autoRegistered: false,
            },
        };
        this.eventManagers.set(name, entry);
        if (this.factoryRegistry[config?.type]) {
            const registry = this.factoryRegistry[config?.type];
            if (registry) {
                registry.usage.managersCreated++;
            }
        }
        this._logger.info(`📝 Registered event manager: ${name} (${config?.type})`);
    }
    findEventManager(name) {
        const entry = this.eventManagers.get(name);
        if (entry) {
            entry.lastAccessed = new Date();
            entry.usage.accessCount++;
            return entry.manager;
        }
        return undefined;
    }
    getAllEventManagers() {
        const managers = new Map();
        for (const [name, entry] of this.eventManagers) {
            managers.set(name, entry.manager);
            entry.lastAccessed = new Date();
            entry.usage.accessCount++;
        }
        return managers;
    }
    getEventManagersByType(type) {
        const managers = [];
        for (const [, entry] of this.eventManagers) {
            if (entry.config.type === type) {
                managers.push(entry.manager);
                entry.lastAccessed = new Date();
                entry.usage.accessCount++;
            }
        }
        return managers;
    }
    getEventManagersByStatus(status) {
        const managers = [];
        for (const [, entry] of this.eventManagers) {
            if (entry.status === status) {
                managers.push(entry.manager);
            }
        }
        return managers;
    }
    registerEventType(eventType, config) {
        this.eventTypes[eventType] = {
            type: eventType,
            category: config?.category,
            priority: config?.priority ||
                (typeof EventPriorityMap['medium'] === 'number' ? EventPriorityMap['medium'] : 2),
            schema: config?.schema,
            managerTypes: config?.managerTypes,
            config: config?.options || {},
            registered: new Date(),
            usage: {
                totalEmissions: 0,
                totalSubscriptions: 0,
                averageLatency: 0,
            },
        };
        this._logger.debug(`🏷️ Registered event type: ${eventType}`);
    }
    getEventTypes() {
        return Object.keys(this.eventTypes);
    }
    getEventTypeConfig(eventType) {
        return this.eventTypes[eventType];
    }
    async healthCheckAll() {
        const results = new Map();
        const healthPromises = [];
        for (const [name, entry] of this.eventManagers) {
            const healthPromise = this.performHealthCheck(name, entry)
                .then((status) => {
                results?.set(name, status);
            })
                .catch((error) => {
                this._logger.error(`❌ Health check failed for ${name}:`, error);
                results?.set(name, {
                    name: entry.manager.name,
                    type: entry.manager.type,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    subscriptions: 0,
                    queueSize: 0,
                    errorRate: 1.0,
                    uptime: 0,
                    metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            });
            healthPromises.push(healthPromise);
        }
        await Promise.allSettled(healthPromises);
        return results;
    }
    async getGlobalMetrics() {
        const managers = Array.from(this.eventManagers.values());
        const metricsPromises = managers.map(async (entry) => {
            try {
                const metrics = await entry.manager.getMetrics();
                entry.metrics = metrics;
                return metrics;
            }
            catch (error) {
                this._logger.warn(`⚠️ Failed to get metrics for ${entry.manager.name}:`, error);
                entry.usage.errorCount++;
                return null;
            }
        });
        const allMetrics = (await Promise.allSettled(metricsPromises))
            .filter((result) => result?.status === 'fulfilled' && result?.value !== null)
            .map((result) => result.value);
        const totalEvents = allMetrics.reduce((sum, metrics) => sum + metrics.eventsProcessed, 0);
        const totalSubscriptions = allMetrics.reduce((sum, metrics) => sum + metrics.subscriptionCount, 0);
        const averageLatency = allMetrics.length > 0
            ? allMetrics.reduce((sum, metrics) => sum + metrics.averageLatency, 0) / allMetrics.length
            : 0;
        const errorRate = totalEvents > 0
            ? allMetrics.reduce((sum, metrics) => sum + metrics.eventsFailed, 0) / totalEvents
            : 0;
        const managersByType = {};
        const managersByStatus = {};
        Object.values(EventManagerTypes).forEach((type) => {
            managersByType[type] = 0;
        });
        managers.forEach((entry) => {
            managersByType[entry.config.type] = (managersByType[entry.config.type] || 0) + 1;
            managersByStatus[entry.status] = (managersByStatus[entry.status] || 0) + 1;
        });
        const factoryUsage = {};
        Object.values(EventManagerTypes).forEach((type) => {
            factoryUsage[type] = this.factoryRegistry[type]?.usage.managersCreated || 0;
        });
        return {
            totalManagers: managers.length,
            totalEvents,
            totalSubscriptions,
            averageLatency,
            errorRate,
            managersByType,
            managersByStatus,
            factoryUsage,
        };
    }
    async broadcast(event) {
        const broadcastPromises = [];
        for (const [name, entry] of this.eventManagers) {
            if (entry.status === 'healthy') {
                const broadcastPromise = entry.manager
                    .emit(event)
                    .then(() => {
                    entry.usage.totalEvents++;
                })
                    .catch((error) => {
                    this._logger.error(`❌ Broadcast failed for ${name}:`, error);
                    entry.usage.errorCount++;
                });
                broadcastPromises.push(broadcastPromise);
            }
        }
        await Promise.allSettled(broadcastPromises);
    }
    async broadcastToType(type, event) {
        const managers = this.getEventManagersByType(type);
        const broadcastPromises = managers.map((manager) => manager.emit(event).catch((error) => {
            this._logger.error(`❌ Type broadcast failed for ${manager.name}:`, error);
        }));
        await Promise.allSettled(broadcastPromises);
    }
    async shutdownAll() {
        this._logger.info('🔄 Shutting down all event managers...');
        this.stopHealthMonitoring();
        const shutdownPromises = Array.from(this.eventManagers.values()).map(async (entry) => {
            try {
                await entry.manager.destroy();
                entry.status = 'stopped';
            }
            catch (error) {
                this._logger.error(`❌ Failed to shutdown ${entry.manager.name}:`, error);
                entry.status = 'error';
            }
        });
        await Promise.allSettled(shutdownPromises);
        this.eventManagers.clear();
        this.factories.clear();
        this.eventTypes = {};
        this.factoryRegistry = {};
        this.initialized = false;
        this._logger.info('✅ All event managers shut down');
    }
    getRegistryStats() {
        const managers = Array.from(this.eventManagers.values());
        const healthyManagers = managers.filter((entry) => entry.status === 'healthy').length;
        const managersByType = {};
        Object.values(EventManagerTypes).forEach((type) => {
            managersByType[type] = managers.filter((entry) => entry.config.type === type).length;
        });
        const factoryUsage = {};
        Object.values(EventManagerTypes).forEach((type) => {
            factoryUsage[type] = this.factoryRegistry[type]?.usage.managersCreated || 0;
        });
        return {
            totalManagers: managers.length,
            totalFactories: this.factories.size,
            totalEventTypes: Object.keys(this.eventTypes).length,
            healthyManagers,
            managersByType,
            factoryUsage,
            uptime: this.initialized ? Date.now() - (managers[0]?.created.getTime() || Date.now()) : 0,
        };
    }
    exportConfig() {
        const managers = Array.from(this.eventManagers.entries()).map(([name, entry]) => ({
            name,
            type: entry.config.type,
            config: entry.config,
            status: entry.status,
            usage: entry.usage,
        }));
        return {
            eventTypes: this.eventTypes,
            healthMonitoring: this.healthMonitoring,
            discovery: this.discoveryConfig,
            managers,
        };
    }
    async performHealthCheck(name, entry) {
        const startTime = Date.now();
        try {
            const status = await Promise.race([
                entry.manager.healthCheck(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), this.healthMonitoring.timeout)),
            ]);
            entry.lastHealthCheck = new Date();
            entry.healthStatus = status;
            const wasUnhealthy = entry.status !== 'healthy';
            entry.status = status.status === 'healthy' ? 'healthy' : 'unhealthy';
            if (wasUnhealthy &&
                entry.status === 'healthy' &&
                this.healthMonitoring.notifyOnStatusChange) {
                this._logger.info(`✅ Event manager ${name} recovered to healthy status`);
            }
            return status;
        }
        catch (error) {
            entry.status = 'unhealthy';
            entry.usage.errorCount++;
            const errorStatus = {
                name: entry.manager.name,
                type: entry.manager.type,
                status: 'unhealthy',
                lastCheck: new Date(),
                subscriptions: 0,
                queueSize: 0,
                errorRate: 1.0,
                uptime: Date.now() - entry.created.getTime(),
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    checkDuration: Date.now() - startTime,
                },
            };
            entry.healthStatus = errorStatus;
            return errorStatus;
        }
    }
    startHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.healthCheckAll();
            }
            catch (error) {
                this._logger.error('❌ Health monitoring cycle failed:', error);
            }
        }, this.healthMonitoring.checkInterval);
        this._logger.debug(`💓 Health monitoring started (interval: ${this.healthMonitoring.checkInterval}ms)`);
    }
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
        this._logger.debug('💓 Health monitoring stopped');
    }
    async registerDefaultEventTypes() {
        const defaultEventTypes = [
            {
                type: 'system:lifecycle',
                category: EventCategories.SYSTEM,
                managerTypes: [EventManagerTypes.SYSTEM],
                priority: 3,
            },
            {
                type: 'coordination:swarm',
                category: EventCategories.COORDINATION,
                managerTypes: [EventManagerTypes.COORDINATION],
                priority: 3,
            },
            {
                type: 'communication:websocket',
                category: EventCategories.COMMUNICATION,
                managerTypes: [EventManagerTypes.COMMUNICATION],
                priority: 2,
            },
            {
                type: 'monitoring:metrics',
                category: EventCategories.MONITORING,
                managerTypes: [EventManagerTypes.MONITORING],
                priority: 2,
            },
            {
                type: 'interface:user',
                category: EventCategories.INTERFACE,
                managerTypes: [EventManagerTypes.INTERFACE],
                priority: 2,
            },
            {
                type: 'neural:training',
                category: EventCategories.NEURAL,
                managerTypes: [EventManagerTypes.NEURAL],
                priority: 2,
            },
            {
                type: 'database:query',
                category: EventCategories.DATABASE,
                managerTypes: [EventManagerTypes.DATABASE],
                priority: 1,
            },
            {
                type: 'memory:cache',
                category: EventCategories.MEMORY,
                managerTypes: [EventManagerTypes.MEMORY],
                priority: 1,
            },
            {
                type: 'workflow:execution',
                category: EventCategories.WORKFLOW,
                managerTypes: [EventManagerTypes.WORKFLOW],
                priority: 2,
            },
        ];
        for (const eventType of defaultEventTypes) {
            this.registerEventType(eventType.type, {
                category: eventType.category,
                priority: eventType.priority,
                managerTypes: eventType.managerTypes,
            });
        }
        this._logger.debug(`🏷️ Registered ${defaultEventTypes.length} default event types`);
    }
    async performEventDiscovery() {
        try {
            this._logger.debug('🔍 Event discovery completed');
        }
        catch (error) {
            this._logger.warn('⚠️ Event discovery failed:', error);
        }
    }
};
EventRegistry = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Object])
], EventRegistry);
export { EventRegistry };
export default EventRegistry;
//# sourceMappingURL=registry.js.map