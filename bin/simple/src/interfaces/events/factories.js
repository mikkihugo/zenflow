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
import { EventManagerPresets, EventManagerTypes, EventTypeGuards } from './core/interfaces.ts';
import { DefaultEventManagerConfigs, EventCategories } from './types.ts';
let UELFactory = class UELFactory {
    _logger;
    _config;
    managerCache = new Map();
    factoryCache = new Map();
    managerRegistry = {};
    transactionLog = new Map();
    constructor(_logger, _config) {
        this._logger = _logger;
        this._config = _config;
        this.initializeFactories();
    }
    async createEventManager(factoryConfig) {
        const { managerType, name, config, reuseExisting = true, preset } = factoryConfig;
        const cacheKey = this.generateCacheKey(managerType, name);
        if (reuseExisting && this.managerCache.has(cacheKey)) {
            this._logger.debug(`Returning cached event manager: ${cacheKey}`);
            const cachedManager = this.managerCache.get(cacheKey);
            this.updateManagerUsage(cacheKey);
            return cachedManager;
        }
        this._logger.info(`Creating new event manager: ${managerType}/${name}`);
        try {
            this.validateManagerConfig(managerType, name, config);
            const factory = await this.getOrCreateFactory(managerType);
            const mergedConfig = this.mergeWithDefaults(managerType, name, config, preset);
            const manager = await factory.create(mergedConfig);
            const managerId = this.registerManager(manager, mergedConfig, cacheKey);
            this.managerCache.set(cacheKey, manager);
            this._logger.info(`Successfully created event manager: ${managerId}`);
            return manager;
        }
        catch (error) {
            this._logger.error(`Failed to create event manager: ${error}`);
            throw new Error(`Event manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createSystemEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.SYSTEM,
            name,
            config: config || undefined,
            preset: 'REAL_TIME',
        }));
    }
    async createCoordinationEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.COORDINATION,
            name,
            config: config || undefined,
            preset: 'HIGH_THROUGHPUT',
        }));
    }
    async createCommunicationEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.COMMUNICATION,
            name,
            config: config || undefined,
            preset: 'REAL_TIME',
        }));
    }
    async createMonitoringEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.MONITORING,
            name,
            config: config || undefined,
            preset: 'BATCH_PROCESSING',
        }));
    }
    async createInterfaceEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.INTERFACE,
            name,
            config: config || undefined,
            preset: 'REAL_TIME',
        }));
    }
    async createNeuralEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.NEURAL,
            name,
            config: config || undefined,
            preset: 'RELIABLE',
        }));
    }
    async createDatabaseEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.DATABASE,
            name,
            config: config || undefined,
            preset: 'BATCH_PROCESSING',
        }));
    }
    async createMemoryEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.MEMORY,
            name,
            config: config || undefined,
        }));
    }
    async createWorkflowEventManager(name, config) {
        return (await this.createEventManager({
            managerType: EventManagerTypes.WORKFLOW,
            name,
            config: config || undefined,
            preset: 'RELIABLE',
        }));
    }
    getEventManager(managerId) {
        return this.managerRegistry[managerId]?.manager || null;
    }
    listEventManagers() {
        return { ...this.managerRegistry };
    }
    async healthCheckAll() {
        const results = [];
        for (const [_managerId, entry] of Object.entries(this.managerRegistry)) {
            try {
                const status = await entry.manager.healthCheck();
                results.push(status);
                entry.status = status.status === 'healthy' ? 'running' : 'error';
            }
            catch (error) {
                results.push({
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
                entry.status = 'error';
            }
        }
        return results;
    }
    async executeTransaction(operations) {
        const transactionId = this.generateTransactionId();
        const transaction = {
            id: transactionId,
            operations: operations.map((op) => ({ ...op })),
            status: 'executing',
            startTime: new Date(),
        };
        this.transactionLog.set(transactionId, transaction);
        try {
            const results = await Promise.allSettled(transaction.operations.map(async (op) => {
                const manager = this.getEventManager(op.manager);
                if (!manager) {
                    throw new Error(`Event manager not found: ${op.manager}`);
                }
                switch (op.operation) {
                    case 'emit':
                        return await manager.emit(op.data.event, op.data.options);
                    case 'subscribe':
                        return manager.subscribe(op.data.eventTypes, op.data.listener, op.data.options);
                    case 'unsubscribe':
                        return manager.unsubscribe(op.data.subscriptionId);
                    default:
                        throw new Error(`Unknown operation: ${op.operation}`);
                }
            }));
            transaction.operations.forEach((op, index) => {
                const result = results[index];
                if (result?.status === 'fulfilled') {
                    op.result = result?.value;
                }
                else {
                    op.error = result?.reason;
                }
            });
            transaction.status = 'completed';
            transaction.endTime = new Date();
        }
        catch (error) {
            transaction.status = 'failed';
            transaction.endTime = new Date();
            transaction.error = error;
            this._logger.error(`Transaction failed: ${transactionId}`, error);
        }
        return transaction;
    }
    async shutdownAll() {
        this._logger.info('Shutting down all event managers');
        const shutdownPromises = Object.values(this.managerRegistry).map(async (entry) => {
            try {
                await entry.manager.stop();
                await entry.manager.destroy();
                entry.status = 'stopped';
            }
            catch (error) {
                this._logger.warn(`Failed to shutdown event manager: ${error}`);
            }
        });
        await Promise.allSettled(shutdownPromises);
        this.managerCache.clear();
        this.managerRegistry = {};
        this.factoryCache.clear();
    }
    getStats() {
        const managersByType = {};
        const managersByStatus = {};
        Object.values(EventManagerTypes).forEach((type) => {
            managersByType[type] = 0;
        });
        ['running', 'stopped', 'error'].forEach((status) => {
            managersByStatus[status] = 0;
        });
        Object.values(this.managerRegistry).forEach((entry) => {
            managersByType[entry.manager.type]++;
            if (managersByStatus[entry.status] !== undefined) {
                managersByStatus[entry.status]++;
            }
        });
        return {
            totalManagers: Object.keys(this.managerRegistry).length,
            managersByType,
            managersByStatus,
            cacheSize: this.managerCache.size,
            transactions: this.transactionLog.size,
        };
    }
    async initializeFactories() {
        this._logger.debug('Initializing event manager factories');
    }
    async getOrCreateFactory(managerType) {
        if (this.factoryCache.has(managerType)) {
            return this.factoryCache.get(managerType);
        }
        let FactoryClass;
        switch (managerType) {
            case EventManagerTypes.SYSTEM: {
                const { SystemEventManagerFactory } = await import('./adapters/system-event-factory.ts');
                FactoryClass = SystemEventManagerFactory;
                break;
            }
            case EventManagerTypes.COORDINATION: {
                const { CoordinationEventManagerFactory } = await import('./adapters/coordination-event-factory.ts');
                FactoryClass = CoordinationEventManagerFactory;
                break;
            }
            case EventManagerTypes.COMMUNICATION: {
                const { CommunicationEventFactory: CommunicationEventManagerFactory } = await import('./adapters/communication-event-factory.ts');
                FactoryClass = CommunicationEventManagerFactory;
                break;
            }
            case EventManagerTypes.MONITORING: {
                const { MonitoringEventFactory: MonitoringEventManagerFactory } = await import('./adapters/monitoring-event-factory.ts');
                FactoryClass = MonitoringEventManagerFactory;
                break;
            }
            case EventManagerTypes.INTERFACE: {
                const { InterfaceEventManagerFactory } = await import('./adapters/interface-event-factory.ts');
                FactoryClass = InterfaceEventManagerFactory;
                break;
            }
            case EventManagerTypes.NEURAL: {
                const { NeuralEventManagerFactory } = await import('./adapters/neural-event-factory.ts');
                FactoryClass = NeuralEventManagerFactory;
                break;
            }
            case EventManagerTypes.DATABASE: {
                const { DatabaseEventManagerFactory } = await import('./adapters/database-event-factory.ts');
                FactoryClass = DatabaseEventManagerFactory;
                break;
            }
            case EventManagerTypes.MEMORY: {
                const { MemoryEventManagerFactory } = await import('./adapters/memory-event-factory.ts');
                FactoryClass = MemoryEventManagerFactory;
                break;
            }
            case EventManagerTypes.WORKFLOW: {
                const { WorkflowEventManagerFactory } = await import('./adapters/workflow-event-factory.ts');
                FactoryClass = WorkflowEventManagerFactory;
                break;
            }
            case EventManagerTypes.CUSTOM: {
                throw new Error('Custom event managers must be registered explicitly through the registry');
            }
            default: {
                throw new Error(`Unsupported event manager type: ${managerType}`);
            }
        }
        const factory = new FactoryClass(this._logger, this._config);
        this.factoryCache.set(managerType, factory);
        return factory;
    }
    validateManagerConfig(managerType, name, _config) {
        if (!EventTypeGuards.isEventManagerType(managerType)) {
            throw new Error(`Invalid event manager type: ${managerType}`);
        }
        if (!name || typeof name !== 'string') {
            throw new Error(`Invalid event manager name: ${name}`);
        }
    }
    mergeWithDefaults(managerType, name, config, preset) {
        const defaults = DefaultEventManagerConfigs?.[managerType] ||
            DefaultEventManagerConfigs?.[EventCategories.SYSTEM];
        const presetConfig = preset ? EventManagerPresets[preset] : {};
        return {
            ...defaults,
            ...presetConfig,
            ...config,
            name,
            type: managerType,
        };
    }
    registerManager(manager, config, cacheKey) {
        const managerId = this.generateManagerId(config);
        this.managerRegistry[managerId] = {
            manager,
            config,
            created: new Date(),
            lastUsed: new Date(),
            status: 'running',
            metadata: {
                cacheKey,
                version: '1.0.0',
            },
        };
        return managerId;
    }
    updateManagerUsage(cacheKey) {
        for (const entry of Object.values(this.managerRegistry)) {
            if (entry.metadata['cacheKey'] === cacheKey) {
                entry.lastUsed = new Date();
                break;
            }
        }
    }
    generateCacheKey(managerType, name) {
        return `${managerType}:${name}`;
    }
    generateManagerId(config) {
        return `${config?.type}:${config?.name}:${Date.now()}`;
    }
    generateTransactionId() {
        return `tx:${Date.now()}:${Math.random().toString(36).substring(2, 11)}`;
    }
};
UELFactory = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.Config)),
    __metadata("design:paramtypes", [Object, Object])
], UELFactory);
export { UELFactory };
let UELRegistry = class UELRegistry {
    _logger;
    factories = new Map();
    globalEventManagers = new Map();
    constructor(_logger) {
        this._logger = _logger;
    }
    registerFactory(type, factory) {
        this.factories.set(type, factory);
        this._logger.debug(`Registered event manager factory: ${type}`);
    }
    getFactory(type) {
        return this.factories.get(type);
    }
    listFactoryTypes() {
        return Array.from(this.factories.keys());
    }
    getAllEventManagers() {
        return new Map(this.globalEventManagers);
    }
    findEventManager(name) {
        return this.globalEventManagers.get(name);
    }
    getEventManagersByType(type) {
        return Array.from(this.globalEventManagers.values()).filter((manager) => manager.type === type);
    }
    async healthCheckAll() {
        const results = new Map();
        for (const [name, manager] of this.globalEventManagers) {
            try {
                const status = await manager.healthCheck();
                results?.set(name, status);
            }
            catch (error) {
                results?.set(name, {
                    name: manager.name,
                    type: manager.type,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    subscriptions: 0,
                    queueSize: 0,
                    errorRate: 1.0,
                    uptime: 0,
                    metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        }
        return results;
    }
    async getGlobalMetrics() {
        const managers = Array.from(this.globalEventManagers.values());
        const metricsPromises = managers.map(async (manager) => {
            try {
                return await manager.getMetrics();
            }
            catch (error) {
                this._logger.warn(`Failed to get metrics for manager ${manager.name}:`, error);
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
        return {
            totalManagers: managers.length,
            totalEvents,
            totalSubscriptions,
            averageLatency,
            errorRate,
        };
    }
    async shutdownAll() {
        const shutdownPromises = Array.from(this.globalEventManagers.values()).map((manager) => manager.destroy());
        await Promise.allSettled(shutdownPromises);
        this.globalEventManagers.clear();
        this.factories.clear();
    }
    async broadcast(event) {
        const broadcastPromises = Array.from(this.globalEventManagers.values()).map((manager) => manager.emit(event));
        await Promise.allSettled(broadcastPromises);
    }
    async broadcastToType(type, event) {
        const managers = this.getEventManagersByType(type);
        const broadcastPromises = managers.map((manager) => manager.emit(event));
        await Promise.allSettled(broadcastPromises);
    }
};
UELRegistry = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Object])
], UELRegistry);
export { UELRegistry };
export async function createEventManager(managerType, name, config) {
    const { DIContainer } = await import('../../di/container/di-container.ts');
    const { CORE_TOKENS } = await import('../../di/tokens/core-tokens.ts');
    const container = new DIContainer();
    container.register(CORE_TOKENS.Logger, {
        type: 'singleton',
        create: () => ({
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error,
        }),
    });
    container.register(CORE_TOKENS.Config, {
        type: 'singleton',
        create: () => ({}),
    });
    const uelToken = { symbol: Symbol('UELFactory'), name: 'UELFactory' };
    container.register(uelToken, {
        type: 'singleton',
        create: (container) => new UELFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config)),
    });
    const factory = container.resolve(uelToken);
    return await factory.createEventManager({
        managerType,
        name,
        config,
    });
}
export async function createSystemEventBus(name = 'default-system', config) {
    return (await createEventManager(EventManagerTypes.SYSTEM, name, config));
}
export async function createCoordinationEventBus(name = 'default-coordination', config) {
    return (await createEventManager(EventManagerTypes.COORDINATION, name, config));
}
export async function createCommunicationEventBus(name = 'default-communication', config) {
    return (await createEventManager(EventManagerTypes.COMMUNICATION, name, config));
}
export async function createMonitoringEventBus(name = 'default-monitoring', config) {
    return (await createEventManager(EventManagerTypes.MONITORING, name, config));
}
export default UELFactory;
//# sourceMappingURL=factories.js.map