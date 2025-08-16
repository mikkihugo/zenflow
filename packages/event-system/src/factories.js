/**
 * Unified Event Layer (UEL) - Factory Implementation.
 *
 * Central factory for creating event manager instances based on event type,
 * processing requirements, and configuration. Supports dependency injection and
 * provides a single point of access for all event manager implementations.
 */
/**
 * @file Interface implementation: factories.
 */
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { injectable } from '../../di/decorators/injectable';
import { EventManagerPresets, EventManagerTypes, EventTypeGuards } from './core/interfaces';
import { DefaultEventManagerConfigs, EventCategories } from './types';
/**
 * Main factory class for creating UEL event manager instances.
 *
 * Provides centralized creation, caching, and management of event managers.
 * Supports factory caching, transaction logging, and batch operations.
 *
 * @class UELFactory
 * @example
 * ```typescript
 * // Create factory instance
 * const factory = new UELFactory(logger, config);
 *
 * // Create different types of event managers
 * const systemManager = await factory.createSystemEventManager('app-system');
 * const coordManager = await factory.createCoordinationEventManager('swarm-coord');
 *
 * // Execute transaction across multiple managers
 * const transaction = await factory.executeTransaction([
 *   { manager: 'app-system', operation: 'emit', data: systemEvent },
 *   { manager: 'swarm-coord', operation: 'emit', data: coordEvent }
 * ]);
 *
 * // Get factory statistics
 * const stats = factory.getStats();
 * console.log(`Total managers: ${stats.totalManagers}`);
 * ```
 */
let UELFactory = (() => {
    let _classDecorators = [injectable];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UELFactory = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UELFactory = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
        /**
         * Create an event manager instance with full configuration support.
         *
         * Creates a new event manager using the appropriate factory, with support for.
         * Caching, configuration merging, and automatic registration..
         *
         * @template T - Event manager type.
         * @param factoryConfig - Configuration for manager creation.
         * @returns Promise resolving to the created event manager.
         * @throws {Error} If manager creation or validation fails.
         * @example
         * ```typescript
         * const manager = await factory.createEventManager({
         *   managerType: EventManagerTypes.SYSTEM,
         *   name: 'critical-system',
         *   config: {
         *     maxListeners: 1000,
         *     processing: { strategy: 'immediate' }
         *   },
         *   preset: 'REAL_TIME',
         *   reuseExisting: false
         * });
         * ```
         */
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
                // Validate configuration
                this.validateManagerConfig(managerType, name, config);
                // Get or create event manager factory
                const factory = await this.getOrCreateFactory(managerType);
                // Merge with default configuration and preset
                const mergedConfig = this.mergeWithDefaults(managerType, name, config, preset);
                // Create event manager instance
                const manager = await factory.create(mergedConfig);
                // Register and cache the manager
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
        /**
         * Create system event manager with convenience methods.
         *
         * @param name
         * @param config
         */
        async createSystemEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.SYSTEM,
                name,
                config: config || undefined,
                preset: 'REAL_TIME',
            }));
        }
        /**
         * Create coordination event manager for swarm operations.
         *
         * @param name
         * @param config
         */
        async createCoordinationEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.COORDINATION,
                name,
                config: config || undefined,
                preset: 'HIGH_THROUGHPUT',
            }));
        }
        /**
         * Create communication event manager for protocol events.
         *
         * @param name
         * @param config
         */
        async createCommunicationEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.COMMUNICATION,
                name,
                config: config || undefined,
                preset: 'REAL_TIME',
            }));
        }
        /**
         * Create monitoring event manager for metrics and health.
         *
         * @param name
         * @param config
         */
        async createMonitoringEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.MONITORING,
                name,
                config: config || undefined,
                preset: 'BATCH_PROCESSING',
            }));
        }
        /**
         * Create interface event manager for UI interactions.
         *
         * @param name
         * @param config
         */
        async createInterfaceEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.INTERFACE,
                name,
                config: config || undefined,
                preset: 'REAL_TIME',
            }));
        }
        /**
         * Create neural event manager for AI operations.
         *
         * @param name
         * @param config
         */
        async createNeuralEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.NEURAL,
                name,
                config: config || undefined,
                preset: 'RELIABLE',
            }));
        }
        /**
         * Create database event manager for DB operations.
         *
         * @param name
         * @param config
         */
        async createDatabaseEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.DATABASE,
                name,
                config: config || undefined,
                preset: 'BATCH_PROCESSING',
            }));
        }
        /**
         * Create memory event manager for cache operations.
         *
         * @param name
         * @param config
         */
        async createMemoryEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.MEMORY,
                name,
                config: config || undefined,
            }));
        }
        /**
         * Create workflow event manager for orchestration.
         *
         * @param name
         * @param config
         */
        async createWorkflowEventManager(name, config) {
            return (await this.createEventManager({
                managerType: EventManagerTypes.WORKFLOW,
                name,
                config: config || undefined,
                preset: 'RELIABLE',
            }));
        }
        /**
         * Get event manager by ID from registry.
         *
         * @param managerId
         */
        getEventManager(managerId) {
            return this.managerRegistry[managerId]?.manager || null;
        }
        /**
         * List all registered event managers.
         */
        listEventManagers() {
            return { ...this.managerRegistry };
        }
        /**
         * Health check for all event managers.
         */
        async healthCheckAll() {
            const results = [];
            for (const [_managerId, entry] of Object.entries(this.managerRegistry)) {
                try {
                    const status = await entry.manager.healthCheck();
                    results.push(status);
                    // Update manager status
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
        /**
         * Execute transaction across multiple event managers.
         *
         * Performs multiple operations across different event managers as a coordinated.
         * Transaction with rollback support and detailed logging..
         *
         * @param operations - Array of operations to execute across managers.
         * @returns Promise resolving to transaction result with operation details.
         * @throws {Error} If transaction setup fails.
         * @example
         * ```typescript
         * const transaction = await factory.executeTransaction([
         *   {
         *     manager: 'system-manager',
         *     operation: 'emit',
         *     data: {
         *       event: systemEvent,
         *       options: { priority: 'high' }
         *     }
         *   },
         *   {
         *     manager: 'coord-manager',
         *     operation: 'subscribe',
         *     data: {
         *       eventTypes: ['coordination:swarm'],
         *       listener: handleCoordEvent
         *     }
         *   }
         * ]);
         *
         * console.log(`Transaction ${transaction.id}: ${transaction.status}`);
         * ```
         */
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
                // Execute operations in parallel
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
                // Update operation results
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
        /**
         * Stop and clean up all event managers.
         */
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
            // Clear caches
            this.managerCache.clear();
            this.managerRegistry = {};
            this.factoryCache.clear();
        }
        /**
         * Get factory statistics.
         */
        getStats() {
            const managersByType = {};
            const managersByStatus = {};
            // Initialize counters
            Object.values(EventManagerTypes).forEach((type) => {
                managersByType[type] = 0;
            });
            ['running', 'stopped', 'error'].forEach((status) => {
                managersByStatus[status] = 0;
            });
            // Count managers
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
        /**
         * Private methods for internal operations.
         */
        async initializeFactories() {
            this._logger.debug('Initializing event manager factories');
            // Placeholder for factory initialization
            // Real implementation would load specific factory classes
        }
        async getOrCreateFactory(managerType) {
            if (this.factoryCache.has(managerType)) {
                return this.factoryCache.get(managerType);
            }
            // Dynamic import based on manager type
            let FactoryClass;
            switch (managerType) {
                case EventManagerTypes.SYSTEM: {
                    const { SystemEventManagerFactory } = await import('./adapters/system-event-factory');
                    FactoryClass = SystemEventManagerFactory;
                    break;
                }
                case EventManagerTypes.COORDINATION: {
                    const { CoordinationEventManagerFactory } = await import('./adapters/coordination-event-factory');
                    FactoryClass = CoordinationEventManagerFactory;
                    break;
                }
                case EventManagerTypes.COMMUNICATION: {
                    const { CommunicationEventFactory: CommunicationEventManagerFactory } = await import('./adapters/communication-event-factory');
                    FactoryClass = CommunicationEventManagerFactory;
                    break;
                }
                case EventManagerTypes.MONITORING: {
                    const { MonitoringEventFactory: MonitoringEventManagerFactory } = await import('./adapters/monitoring-event-factory');
                    FactoryClass = MonitoringEventManagerFactory;
                    break;
                }
                case EventManagerTypes.INTERFACE: {
                    const { InterfaceEventManagerFactory } = await import('./adapters/interface-event-factory');
                    FactoryClass = InterfaceEventManagerFactory;
                    break;
                }
                case EventManagerTypes.NEURAL: {
                    const { NeuralEventManagerFactory } = await import('./adapters/neural-event-factory');
                    FactoryClass = NeuralEventManagerFactory;
                    break;
                }
                case EventManagerTypes.DATABASE: {
                    const { DatabaseEventManagerFactory } = await import('./adapters/database-event-factory');
                    FactoryClass = DatabaseEventManagerFactory;
                    break;
                }
                case EventManagerTypes.MEMORY: {
                    const { MemoryEventManagerFactory } = await import('./adapters/memory-event-factory');
                    FactoryClass = MemoryEventManagerFactory;
                    break;
                }
                case EventManagerTypes.WORKFLOW: {
                    const { WorkflowEventManagerFactory } = await import('./adapters/workflow-event-factory');
                    FactoryClass = WorkflowEventManagerFactory;
                    break;
                }
                case EventManagerTypes.CUSTOM: {
                    // Custom event managers need to be registered manually
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
            // Additional validation logic would go here
        }
        mergeWithDefaults(managerType, name, config, preset) {
            const defaults = DefaultEventManagerConfigs?.[managerType] ||
                DefaultEventManagerConfigs?.[EventCategories.SYSTEM];
            const presetConfig = preset ? EventManagerPresets[preset] : {};
            return {
                ...defaults,
                ...presetConfig,
                ...config,
                // Ensure required fields are not overwritten
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
            // Find manager by cache key and update last used time
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
    return UELFactory = _classThis;
})();
export { UELFactory };
/**
 * Event manager registry implementation.
 *
 * @example
 */
let UELRegistry = (() => {
    let _classDecorators = [injectable];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UELRegistry = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UELRegistry = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
    return UELRegistry = _classThis;
})();
export { UELRegistry };
// Convenience factory functions (following DAL/UACL/USL pattern)
/**
 * Create a simple event manager for quick setup.
 *
 * @param managerType
 * @param name
 * @param config
 * @example
 */
export async function createEventManager(managerType, name, config) {
    // Use the UELFactory class directly (no self-import needed)
    const { DIContainer } = await import('../../di/container/di-container');
    const { CORE_TOKENS } = await import('../../di/tokens/core-tokens');
    // Create basic DI container for factory dependencies
    const container = new DIContainer();
    // Register basic logger and config
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
    // Register UELFactory
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
/**
 * Create system event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createSystemEventBus(name = 'default-system', config) {
    return (await createEventManager(EventManagerTypes.SYSTEM, name, config));
}
/**
 * Create coordination event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createCoordinationEventBus(name = 'default-coordination', config) {
    return (await createEventManager(EventManagerTypes.COORDINATION, name, config));
}
/**
 * Create communication event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createCommunicationEventBus(name = 'default-communication', config) {
    return (await createEventManager(EventManagerTypes.COMMUNICATION, name, config));
}
/**
 * Create monitoring event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createMonitoringEventBus(name = 'default-monitoring', config) {
    return (await createEventManager(EventManagerTypes.MONITORING, name, config));
}
export default UELFactory;
//# sourceMappingURL=factories.js.map