/**
 * UEL (Unified Event Layer) - Event Registry System.
 *
 * Central registry for managing all event types, factories, and lifecycle management.
 * Provides type-safe event registration, discovery, and health monitoring.
 *
 * @file Event Registry Implementation following UACL/USL patterns.
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
import { injectable } from '../../di/decorators/injectable.ts';
import { EventManagerTypes } from './core/interfaces.ts';
import { EventCategories, EventPriorityMap } from './types.ts';
/**
 * Main event registry implementation for centralized event manager management.
 *
 * Provides centralized registration, discovery, and lifecycle management of event managers.
 * And their factories. Includes health monitoring, metrics collection, and event broadcasting..
 *
 * @class EventRegistry
 * @implements IEventManagerRegistry
 * @example
 * ```typescript
 * // Initialize registry
 * const registry = new EventRegistry(logger);
 * await registry.initialize({
 *   healthMonitoring: { checkInterval: 30000, timeout: 5000 },
 *   discovery: { autoDiscover: true, patterns: ['*Event'] }
 * });
 *
 * // Register factory and managers
 * registry.registerFactory(EventManagerTypes.SYSTEM, systemFactory);
 * registry.registerManager('system-1', manager, factory, config);
 *
 * // Health monitoring and metrics
 * const healthStatus = await registry.healthCheckAll();
 * const metrics = await registry.getGlobalMetrics();
 *
 * // Event broadcasting
 * await registry.broadcast(globalEvent);
 * await registry.broadcastToType(EventManagerTypes.SYSTEM, systemEvent);
 * ```
 */
let EventRegistry = (() => {
    let _classDecorators = [injectable];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EventRegistry = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EventRegistry = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                checkInterval: 30000, // 30 seconds
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
        /**
         * Initialize the registry system.
         *
         * Sets up health monitoring, event discovery, and registers default event types.
         *
         * @param config - Initialization configuration options.
         * @param config.healthMonitoring - Health monitoring settings overrides.
         * @param config.discovery - Event discovery settings overrides.
         * @param config.autoRegisterDefaults - Whether to register default event types (default: true).
         * @throws {Error} If initialization fails.
         * @example
         * ```typescript
         * await registry.initialize({
         *   healthMonitoring: {
         *     checkInterval: 30000,
         *     timeout: 5000,
         *     failureThreshold: 3,
         *     autoRecovery: true
         *   },
         *   discovery: {
         *     autoDiscover: true,
         *     patterns: ['*Event', '*event'],
         *     scanPaths: ['./events']
         *   },
         *   autoRegisterDefaults: true
         * });
         * ```
         */
        async initialize(config) {
            if (this.initialized) {
                return;
            }
            // Apply configuration overrides
            if (config?.healthMonitoring) {
                this.healthMonitoring = { ...this.healthMonitoring, ...config?.healthMonitoring };
            }
            if (config?.discovery) {
                this.discoveryConfig = { ...this.discoveryConfig, ...config?.discovery };
            }
            // Register default event types
            if (config?.autoRegisterDefaults !== false) {
                await this.registerDefaultEventTypes();
            }
            // Start health monitoring
            this.startHealthMonitoring();
            // Perform event discovery if enabled
            if (this.discoveryConfig.autoDiscover) {
                await this.performEventDiscovery();
            }
            this.initialized = true;
            this._logger.info('✅ Event Registry initialized successfully');
        }
        /**
         * Register an event manager factory for a specific type.
         *
         * Registers a factory that can create event managers of the specified type.
         * Updates the factory registry with metadata and usage tracking.
         *
         * @template T - Configuration type extending EventManagerConfig.
         * @param type - Event manager type this factory creates.
         * @param factory - Factory instance to register.
         * @throws {Error} If factory registration fails.
         * @example
         * ```typescript
         * const systemFactory = new SystemEventManagerFactory();
         * registry.registerFactory(EventManagerTypes.SYSTEM, systemFactory);
         * ```
         */
        registerFactory(type, factory) {
            this.factories.set(type, factory);
            // Update factory registry
            this.factoryRegistry[type] = {
                factory: factory,
                metadata: {
                    name: factory.constructor.name,
                    version: '1.0.0',
                    capabilities: [], // getSupportedEventTypes method not available on IEventManagerFactory interface
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
        /**
         * Get factory for event manager type.
         */
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
        /**
         * List all registered factory types.
         */
        listFactoryTypes() {
            return Array.from(this.factories.keys());
        }
        /**
         * Register an event manager instance with the registry.
         *
         * Creates a registry entry to track the manager's lifecycle, usage, and health.
         *
         * @param name - Unique name for the event manager.
         * @param manager - Event manager instance to register.
         * @param factory - Factory that created this manager.
         * @param config - Configuration used to create the manager.
         * @example
         * ```typescript
         * registry.registerManager(
         *   'system-core',
         *   systemManager,
         *   systemFactory,
         *   managerConfig
         * );
         * ```
         */
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
            // Update factory usage statistics
            if (this.factoryRegistry[config?.type]) {
                const registry = this.factoryRegistry[config?.type];
                if (registry) {
                    registry.usage.managersCreated++;
                }
            }
            this._logger.info(`📝 Registered event manager: ${name} (${config?.type})`);
        }
        /**
         * Find event manager by name.
         */
        findEventManager(name) {
            const entry = this.eventManagers.get(name);
            if (entry) {
                entry.lastAccessed = new Date();
                entry.usage.accessCount++;
                return entry.manager;
            }
            return undefined;
        }
        /**
         * Get all event managers.
         */
        getAllEventManagers() {
            const managers = new Map();
            for (const [name, entry] of this.eventManagers) {
                managers.set(name, entry.manager);
                entry.lastAccessed = new Date();
                entry.usage.accessCount++;
            }
            return managers;
        }
        /**
         * Get event managers by type.
         */
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
        /**
         * Get event managers by status.
         */
        getEventManagersByStatus(status) {
            const managers = [];
            for (const [, entry] of this.eventManagers) {
                if (entry.status === status) {
                    managers.push(entry.manager);
                }
            }
            return managers;
        }
        /**
         * Register event type for discovery and validation.
         */
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
        /**
         * Get registered event types.
         */
        getEventTypes() {
            return Object.keys(this.eventTypes);
        }
        /**
         * Get event type configuration.
         */
        getEventTypeConfig(eventType) {
            return this.eventTypes[eventType];
        }
        /**
         * Perform health check on all event managers.
         */
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
        /**
         * Get global metrics across all event managers.
         */
        async getGlobalMetrics() {
            const managers = Array.from(this.eventManagers.values());
            // Collect metrics from all managers
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
            // Calculate aggregate metrics
            const totalEvents = allMetrics.reduce((sum, metrics) => sum + metrics.eventsProcessed, 0);
            const totalSubscriptions = allMetrics.reduce((sum, metrics) => sum + metrics.subscriptionCount, 0);
            const averageLatency = allMetrics.length > 0
                ? allMetrics.reduce((sum, metrics) => sum + metrics.averageLatency, 0) / allMetrics.length
                : 0;
            const errorRate = totalEvents > 0
                ? allMetrics.reduce((sum, metrics) => sum + metrics.eventsFailed, 0) / totalEvents
                : 0;
            // Count managers by type and status
            const managersByType = {};
            const managersByStatus = {};
            Object.values(EventManagerTypes).forEach((type) => {
                managersByType[type] = 0;
            });
            managers.forEach((entry) => {
                managersByType[entry.config.type] = (managersByType[entry.config.type] || 0) + 1;
                managersByStatus[entry.status] = (managersByStatus[entry.status] || 0) + 1;
            });
            // Factory usage statistics
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
        /**
         * Broadcast event to all event managers.
         */
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
        /**
         * Broadcast event to specific event manager type.
         */
        async broadcastToType(type, event) {
            const managers = this.getEventManagersByType(type);
            const broadcastPromises = managers.map((manager) => manager.emit(event).catch((error) => {
                this._logger.error(`❌ Type broadcast failed for ${manager.name}:`, error);
            }));
            await Promise.allSettled(broadcastPromises);
        }
        /**
         * Shutdown all event managers.
         */
        async shutdownAll() {
            this._logger.info('🔄 Shutting down all event managers...');
            // Stop health monitoring
            this.stopHealthMonitoring();
            // Shutdown all managers
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
            // Clear registries
            this.eventManagers.clear();
            this.factories.clear();
            this.eventTypes = {};
            this.factoryRegistry = {};
            this.initialized = false;
            this._logger.info('✅ All event managers shut down');
        }
        /**
         * Get registry statistics.
         */
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
        /**
         * Export registry configuration.
         */
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
        /**
         * Private methods for internal operations.
         */
        async performHealthCheck(name, entry) {
            const startTime = Date.now();
            try {
                const status = await Promise.race([
                    entry.manager.healthCheck(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), this.healthMonitoring.timeout)),
                ]);
                entry.lastHealthCheck = new Date();
                entry.healthStatus = status;
                // Update status based on health check
                const wasUnhealthy = entry.status !== 'healthy';
                entry.status = status.status === 'healthy' ? 'healthy' : 'unhealthy';
                // Notify on status change if configured
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
                // Event discovery implementation would scan specified paths
                // and automatically register discovered event types
                this._logger.debug('🔍 Event discovery completed');
            }
            catch (error) {
                this._logger.warn('⚠️ Event discovery failed:', error);
            }
        }
    };
    return EventRegistry = _classThis;
})();
export { EventRegistry };
export default EventRegistry;
