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
import { EventManagerPresets, EventManagerTypes } from './core/interfaces.ts';
import { EventRegistry } from './registry.ts';
import { DefaultEventManagerConfigs, EventCategories } from './types.ts';
let EventManager = class EventManager {
    _logger;
    _config;
    registry;
    activeManagers = new Map();
    factoryCache = new Map();
    connectionManager;
    coordinationSettings;
    statistics;
    initialized = false;
    healthCheckInterval;
    recoveryAttempts = new Map();
    constructor(_logger, _config) {
        this._logger = _logger;
        this._config = _config;
        this.registry = new EventRegistry(this._logger);
        this.connectionManager = {
            connections: new Map(),
            health: new Map(),
            autoReconnect: true,
            maxReconnectAttempts: 5,
            connectionTimeout: 30000
        };
        this.coordinationSettings = {
            crossManagerRouting: true,
            eventDeduplication: true,
            batchProcessing: {
                enabled: true,
                batchSize: 100,
                flushInterval: 5000
            },
            priorityQueue: {
                enabled: true,
                maxSize: 10000,
                processingDelay: 10
            }
        };
        this.statistics = {
            totalCreated: 0,
            activeManagers: 0,
            failedManagers: 0,
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            averageStartupTime: 0,
            totalEventsProcessed: 0,
            eventsPerSecond: 0,
            averageLatency: 0
        };
        Object.values(EventManagerTypes).forEach(type => {
            this.connectionManager.connections.set(type, new Set());
        });
    }
    async initialize(options) {
        if (this.initialized) {
            return;
        }
        await this.registry.initialize({
            autoRegisterDefaults: options?.autoRegisterFactories !== false,
        });
        if (options?.coordination) {
            this.coordinationSettings = { ...this.coordinationSettings, ...options?.coordination };
        }
        if (options?.connection) {
            this.connectionManager = { ...this.connectionManager, ...options?.connection };
        }
        if (options?.autoRegisterFactories !== false) {
            await this.registerDefaultFactories();
        }
        if (options?.healthMonitoring !== false) {
            this.startHealthMonitoring();
        }
        this.initialized = true;
        this._logger.info('🚀 Event Manager system initialized successfully');
    }
    async createEventManager(options) {
        const startTime = Date.now();
        try {
            this._logger.info(`🏗️ Creating event manager: ${options?.name} (${options?.type})`);
            const factory = await this.getOrCreateFactory(options?.type);
            const config = this.mergeConfiguration(options);
            const manager = await factory.create(config);
            this.registry.registerManager(options?.name, manager, factory, config);
            this.activeManagers.set(options?.name, manager);
            this.connectionManager.connections.get(options?.type)?.add(manager);
            this.connectionManager.health.set(options?.name, {
                healthy: true,
                lastCheck: new Date(),
                failures: 0,
            });
            if (options?.autoStart !== false) {
                await manager.start();
            }
            this.statistics.totalCreated++;
            this.statistics.activeManagers++;
            const duration = Date.now() - startTime;
            this.statistics.averageStartupTime =
                (this.statistics.averageStartupTime * (this.statistics.totalCreated - 1) + duration) /
                    this.statistics.totalCreated;
            this._logger.info(`✅ Event manager created successfully: ${options?.name} (${duration}ms)`);
            return manager;
        }
        catch (error) {
            this.statistics.failedManagers++;
            this._logger.error(`❌ Failed to create event manager ${options?.name}:`, error);
            throw new Error(`Event manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createSystemEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.SYSTEM,
            name,
            config: config || undefined,
            preset: 'REAL_TIME',
        });
        return manager;
    }
    async createCoordinationEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.COORDINATION,
            name,
            config: config || undefined,
            preset: 'HIGH_THROUGHPUT',
        });
        return manager;
    }
    async createCommunicationEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.COMMUNICATION,
            name,
            config: config || undefined,
            preset: 'REAL_TIME',
        });
        return manager;
    }
    async createMonitoringEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.MONITORING,
            name,
            config: config || undefined,
            preset: 'BATCH_PROCESSING',
        });
        return manager;
    }
    async createInterfaceEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.INTERFACE,
            name,
            config: config || undefined,
            preset: 'REAL_TIME',
        });
        return manager;
    }
    async createNeuralEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.NEURAL,
            name,
            config: config || undefined,
            preset: 'RELIABLE',
        });
        return manager;
    }
    async createDatabaseEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.DATABASE,
            name,
            config: config || undefined,
            preset: 'BATCH_PROCESSING',
        });
        return manager;
    }
    async createMemoryEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.MEMORY,
            name,
            config: config || undefined,
        });
        return manager;
    }
    async createWorkflowEventManager(name, config) {
        const manager = await this.createEventManager({
            type: EventManagerTypes.WORKFLOW,
            name,
            config: config || undefined,
            preset: 'RELIABLE',
        });
        return manager;
    }
    getEventManager(name) {
        return this.activeManagers.get(name) || this.registry.findEventManager(name);
    }
    getEventManagersByType(type) {
        return this.registry.getEventManagersByType(type);
    }
    getAllEventManagers() {
        return new Map(this.activeManagers);
    }
    async removeEventManager(name) {
        const manager = this.activeManagers.get(name);
        if (manager) {
            try {
                await manager.stop();
                await manager.destroy();
                this.activeManagers.delete(name);
                this.connectionManager.health.delete(name);
                this.connectionManager.connections.forEach((managers) => {
                    managers.delete(manager);
                });
                this.statistics.activeManagers--;
                this._logger.info(`🗑️ Event manager removed: ${name}`);
            }
            catch (error) {
                this._logger.error(`❌ Failed to remove event manager ${name}:`, error);
                throw error;
            }
        }
    }
    async restartEventManager(name) {
        const manager = this.activeManagers.get(name);
        if (!manager) {
            throw new Error(`Event manager not found: ${name}`);
        }
        const attempts = this.recoveryAttempts.get(name) || 0;
        this.recoveryAttempts.set(name, attempts + 1);
        this.statistics.recoveryAttempts++;
        try {
            this._logger.info(`🔄 Restarting event manager: ${name} (attempt ${attempts + 1})`);
            await manager.stop();
            await manager.start();
            this.connectionManager.health.set(name, {
                healthy: true,
                lastCheck: new Date(),
                failures: 0,
            });
            this.statistics.successfulRecoveries++;
            this._logger.info(`✅ Event manager restarted successfully: ${name}`);
        }
        catch (error) {
            this._logger.error(`❌ Failed to restart event manager ${name}:`, error);
            this.connectionManager.health.set(name, {
                healthy: false,
                lastCheck: new Date(),
                failures: attempts + 1,
            });
            throw error;
        }
    }
    async performHealthCheck() {
        return await this.registry.healthCheckAll();
    }
    async getGlobalMetrics() {
        const registryMetrics = await this.registry.getGlobalMetrics();
        let totalConnections = 0;
        let healthyConnections = 0;
        const connectionsByType = {};
        Object.values(EventManagerTypes).forEach((type) => {
            const connections = this.connectionManager.connections.get(type)?.size || 0;
            connectionsByType[type] = connections;
            totalConnections += connections;
        });
        this.connectionManager.health.forEach((health) => {
            if (health.healthy) {
                healthyConnections++;
            }
        });
        this.statistics.activeManagers = this.activeManagers.size;
        return {
            registry: registryMetrics,
            manager: { ...this.statistics },
            connections: {
                totalConnections,
                healthyConnections,
                connectionsByType,
            },
        };
    }
    async broadcast(event, options) {
        if (options?.type) {
            await this.registry.broadcastToType(options?.type, event);
        }
        else {
            await this.registry.broadcast(event);
        }
        this.statistics.totalEventsProcessed++;
    }
    registerFactory(type, factory) {
        this.factoryCache.set(type, factory);
        this.registry.registerFactory(type, factory);
        this._logger.debug(`🏭 Registered factory for type: ${type}`);
    }
    async getSystemStatus() {
        const healthStatus = await this.performHealthCheck();
        const healthyManagers = Array.from(healthStatus.values()).filter((status) => status.status === 'healthy').length;
        const totalManagers = healthStatus.size;
        const healthPercentage = totalManagers > 0 ? (healthyManagers / totalManagers) * 100 : 100;
        const status = healthPercentage >= 80 ? 'healthy' : healthPercentage >= 50 ? 'warning' : 'critical';
        const registryStats = this.registry.getRegistryStats();
        return {
            initialized: this.initialized,
            totalManagers,
            healthyManagers,
            healthPercentage,
            status,
            registry: registryStats,
            statistics: { ...this.statistics },
            uptime: registryStats.uptime,
        };
    }
    async shutdown() {
        this._logger.info('🔄 Shutting down Event Manager system...');
        this.stopHealthMonitoring();
        const shutdownPromises = Array.from(this.activeManagers.entries()).map(async ([name, manager]) => {
            try {
                await manager.stop();
                await manager.destroy();
            }
            catch (error) {
                this._logger.error(`❌ Failed to shutdown manager ${name}:`, error);
            }
        });
        await Promise.allSettled(shutdownPromises);
        await this.registry.shutdownAll();
        this.activeManagers.clear();
        this.factoryCache.clear();
        this.connectionManager.connections.clear();
        this.connectionManager.health.clear();
        this.recoveryAttempts.clear();
        this.initialized = false;
        this._logger.info('✅ Event Manager system shut down');
    }
    async getOrCreateFactory(type) {
        const cached = this.factoryCache.get(type);
        if (cached) {
            return cached;
        }
        const factory = this.registry.getFactory(type);
        if (factory) {
            this.factoryCache.set(type, factory);
            return factory;
        }
        let FactoryClass;
        try {
            switch (type) {
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
                    const { CommunicationEventFactory } = await import('./adapters/communication-event-factory.ts');
                    FactoryClass = CommunicationEventFactory;
                    break;
                }
                case EventManagerTypes.MONITORING: {
                    const { MonitoringEventFactory } = await import('./adapters/monitoring-event-factory.ts');
                    FactoryClass = class {
                        async create(config) {
                            const adapter = MonitoringEventFactory.create(config.name, config);
                            return adapter;
                        }
                    };
                    break;
                }
                default:
                    throw new Error(`No factory available for event manager type: ${type}`);
            }
            let newFactory;
            try {
                newFactory = new FactoryClass(this._logger, this._config);
            }
            catch (error) {
                newFactory = new FactoryClass();
            }
            this.factoryCache.set(type, newFactory);
            this.registry.registerFactory(type, newFactory);
            return newFactory;
        }
        catch (importError) {
            this._logger.error(`❌ Failed to load factory for ${type}:`, importError);
            throw new Error(`Factory not available for event manager type: ${type}`);
        }
    }
    mergeConfiguration(options) {
        const defaults = DefaultEventManagerConfigs?.[options?.type] ||
            DefaultEventManagerConfigs?.[EventCategories.SYSTEM];
        const presetConfig = options?.preset ? EventManagerPresets[options?.preset] : {};
        return {
            ...defaults,
            ...presetConfig,
            ...options?.config,
            name: options?.name,
            type: options?.type,
        };
    }
    async registerDefaultFactories() {
        const factoryTypes = [EventManagerTypes.SYSTEM, EventManagerTypes.COORDINATION];
        for (const type of factoryTypes) {
            try {
                await this.getOrCreateFactory(type);
            }
            catch (error) {
                this._logger.warn(`⚠️ Could not register factory for ${type}:`, error);
            }
        }
    }
    startHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(async () => {
            try {
                const healthStatus = await this.performHealthCheck();
                for (const [name, status] of healthStatus) {
                    const health = this.connectionManager.health.get(name);
                    if (status.status !== 'healthy' &&
                        health?.healthy &&
                        this.connectionManager.autoReconnect) {
                        const attempts = this.recoveryAttempts.get(name) || 0;
                        if (attempts < this.connectionManager.maxReconnectAttempts) {
                            this._logger.warn(`⚠️ Manager ${name} unhealthy, attempting recovery...`);
                            try {
                                await this.restartEventManager(name);
                            }
                            catch (error) {
                                this._logger.error(`❌ Recovery failed for ${name}:`, error);
                            }
                        }
                    }
                }
            }
            catch (error) {
                this._logger.error('❌ Health monitoring cycle failed:', error);
            }
        }, 30000);
        this._logger.debug('💓 Health monitoring started');
    }
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
        this._logger.debug('💓 Health monitoring stopped');
    }
};
EventManager = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __param(1, inject(CORE_TOKENS.Config)),
    __metadata("design:paramtypes", [Object, Object])
], EventManager);
export { EventManager };
export default EventManager;
//# sourceMappingURL=manager.js.map