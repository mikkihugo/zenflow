/**
 * UEL (Unified Event Layer) - Event Manager System.
 *
 * Comprehensive event manager for lifecycle management, factory registration,
 * and coordinated event processing across all UEL components.
 *
 * @file Event Manager Implementation following UACL/USL patterns.
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
import { EventManagerPresets, EventManagerTypes } from './core/interfaces.ts';
import { EventRegistry } from './registry.ts';
import { DefaultEventManagerConfigs, EventCategories } from './types.ts';
/**
 * Main event manager class for comprehensive UEL management.
 *
 * Provides centralized management of event managers, factories, and coordination.
 * Handles lifecycle management, health monitoring, and recovery operations.
 *
 * @class EventManager
 * @example
 * ```typescript
 * // Create and initialize event manager
 * const eventManager = new EventManager(logger, config);
 * await eventManager.initialize({
 *   healthMonitoring: true,
 *   autoRegisterFactories: true
 * });
 *
 * // Create specialized event managers
 * const systemManager = await eventManager.createSystemEventManager('core-system');
 * const coordManager = await eventManager.createCoordinationEventManager('swarm-coord');
 *
 * // Monitor system health
 * const healthStatus = await eventManager.performHealthCheck();
 * const metrics = await eventManager.getGlobalMetrics();
 * ```
 */
let EventManager = (() => {
    let _classDecorators = [injectable];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EventManager = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EventManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
            // Initialize connection maps for all manager types
            Object.values(EventManagerTypes).forEach(type => {
                this.connectionManager.connections.set(type, new Set());
            });
        }
        /**
         * Initialize the event manager system.
         *
         * Sets up the registry, registers default factories, and starts health monitoring.
         *
         * @param options - Initialization configuration options.
         * @param options.autoRegisterFactories - Whether to register default factories (default: true).
         * @param options.healthMonitoring - Whether to enable health monitoring (default: true).
         * @param options.coordination - Coordination settings overrides.
         * @param options.connection - Connection manager overrides.
         * @throws {Error} If initialization fails.
         * @example
         * ```typescript
         * await eventManager.initialize({
         *   autoRegisterFactories: true,
         *   healthMonitoring: true,
         *   coordination: {
         *     crossManagerRouting: true,
         *     eventDeduplication: true
         *   }
         * });
         * ```
         */
        async initialize(options) {
            if (this.initialized) {
                return;
            }
            // Initialize registry
            await this.registry.initialize({
                autoRegisterDefaults: options?.autoRegisterFactories !== false,
            });
            // Apply configuration overrides
            if (options?.coordination) {
                this.coordinationSettings = { ...this.coordinationSettings, ...options?.coordination };
            }
            if (options?.connection) {
                this.connectionManager = { ...this.connectionManager, ...options?.connection };
            }
            // Register default factories
            if (options?.autoRegisterFactories !== false) {
                await this.registerDefaultFactories();
            }
            // Start health monitoring if enabled
            if (options?.healthMonitoring !== false) {
                this.startHealthMonitoring();
            }
            this.initialized = true;
            this._logger.info('🚀 Event Manager system initialized successfully');
        }
        /**
         * Create and register a new event manager.
         *
         * Creates a new event manager instance using the appropriate factory,
         * registers it with the system, and optionally starts it.
         *
         * @template T - Event manager type.
         * @param options - Configuration options for manager creation.
         * @returns Promise resolving to the created event manager.
         * @throws {Error} If manager creation fails.
         * @example
         * ```typescript
         * const manager = await eventManager.createEventManager({
         *   type: EventManagerTypes.SYSTEM,
         *   name: 'core-system',
         *   preset: 'REAL_TIME',
         *   autoStart: true,
         *   config: {
         *     maxListeners: 1000,
         *     processing: { strategy: 'immediate' }
         *   }
         * });
         * ```
         */
        async createEventManager(options) {
            const startTime = Date.now();
            try {
                this._logger.info(`🏗️ Creating event manager: ${options?.name} (${options?.type})`);
                // Get or create factory
                const factory = await this.getOrCreateFactory(options?.type);
                // Merge configuration with defaults and presets
                const config = this.mergeConfiguration(options);
                // Create manager instance
                const manager = await factory.create(config);
                // Register with registry
                this.registry.registerManager(options?.name, manager, factory, config);
                // Add to active managers
                this.activeManagers.set(options?.name, manager);
                // Update connection tracking
                this.connectionManager.connections.get(options?.type)?.add(manager);
                this.connectionManager.health.set(options?.name, {
                    healthy: true,
                    lastCheck: new Date(),
                    failures: 0,
                });
                // Auto-start if requested
                if (options?.autoStart !== false) {
                    await manager.start();
                }
                // Update statistics
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
        /**
         * Create system event manager with UEL integration.
         *
         * @param name
         * @param config
         */
        async createSystemEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.SYSTEM,
                name,
                config: config || undefined,
                preset: 'REAL_TIME',
            });
            return manager;
        }
        /**
         * Create coordination event manager for swarm operations.
         *
         * @param name
         * @param config
         */
        async createCoordinationEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.COORDINATION,
                name,
                config: config || undefined,
                preset: 'HIGH_THROUGHPUT',
            });
            return manager;
        }
        /**
         * Create communication event manager for protocols.
         *
         * @param name
         * @param config
         */
        async createCommunicationEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.COMMUNICATION,
                name,
                config: config || undefined,
                preset: 'REAL_TIME',
            });
            return manager;
        }
        /**
         * Create monitoring event manager for metrics and health.
         *
         * @param name
         * @param config
         */
        async createMonitoringEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.MONITORING,
                name,
                config: config || undefined,
                preset: 'BATCH_PROCESSING',
            });
            return manager;
        }
        /**
         * Create interface event manager for UI interactions.
         *
         * @param name
         * @param config
         */
        async createInterfaceEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.INTERFACE,
                name,
                config: config || undefined,
                preset: 'REAL_TIME',
            });
            return manager;
        }
        /**
         * Create neural event manager for AI operations.
         *
         * @param name
         * @param config
         */
        async createNeuralEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.NEURAL,
                name,
                config: config || undefined,
                preset: 'RELIABLE',
            });
            return manager;
        }
        /**
         * Create database event manager for DB operations.
         *
         * @param name
         * @param config
         */
        async createDatabaseEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.DATABASE,
                name,
                config: config || undefined,
                preset: 'BATCH_PROCESSING',
            });
            return manager;
        }
        /**
         * Create memory event manager for cache operations.
         *
         * @param name
         * @param config
         */
        async createMemoryEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.MEMORY,
                name,
                config: config || undefined,
            });
            return manager;
        }
        /**
         * Create workflow event manager for orchestration.
         *
         * @param name
         * @param config
         */
        async createWorkflowEventManager(name, config) {
            const manager = await this.createEventManager({
                type: EventManagerTypes.WORKFLOW,
                name,
                config: config || undefined,
                preset: 'RELIABLE',
            });
            return manager;
        }
        /**
         * Get event manager by name.
         *
         * @param name
         */
        getEventManager(name) {
            return this.activeManagers.get(name) || this.registry.findEventManager(name);
        }
        /**
         * Get all event managers by type.
         *
         * @param type
         */
        getEventManagersByType(type) {
            return this.registry.getEventManagersByType(type);
        }
        /**
         * Get all active event managers.
         */
        getAllEventManagers() {
            return new Map(this.activeManagers);
        }
        /**
         * Remove and destroy event manager.
         *
         * @param name
         */
        async removeEventManager(name) {
            const manager = this.activeManagers.get(name);
            if (manager) {
                try {
                    await manager.stop();
                    await manager.destroy();
                    // Remove from tracking
                    this.activeManagers.delete(name);
                    this.connectionManager.health.delete(name);
                    // Remove from connection tracking
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
        /**
         * Restart event manager with recovery logic.
         *
         * @param name
         */
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
                // Update health status
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
                // Mark as unhealthy
                this.connectionManager.health.set(name, {
                    healthy: false,
                    lastCheck: new Date(),
                    failures: attempts + 1,
                });
                throw error;
            }
        }
        /**
         * Perform comprehensive health check.
         */
        async performHealthCheck() {
            return await this.registry.healthCheckAll();
        }
        /**
         * Get global system metrics.
         */
        async getGlobalMetrics() {
            const registryMetrics = await this.registry.getGlobalMetrics();
            // Calculate connection metrics
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
            // Update real-time statistics
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
        /**
         * Broadcast event to all managers or specific type.
         *
         * @param event
         * @param options
         * @param options.type
         * @param options.excludeManagers
         */
        async broadcast(event, options) {
            if (options?.type) {
                await this.registry.broadcastToType(options?.type, event);
            }
            else {
                await this.registry.broadcast(event);
            }
            this.statistics.totalEventsProcessed++;
        }
        /**
         * Register event manager factory.
         *
         * @param type
         * @param factory
         */
        registerFactory(type, factory) {
            this.factoryCache.set(type, factory);
            this.registry.registerFactory(type, factory);
            this._logger.debug(`🏭 Registered factory for type: ${type}`);
        }
        /**
         * Get comprehensive system status.
         */
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
        /**
         * Shutdown all event managers and cleanup.
         */
        async shutdown() {
            this._logger.info('🔄 Shutting down Event Manager system...');
            // Stop health monitoring
            this.stopHealthMonitoring();
            // Shutdown all active managers
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
            // Shutdown registry
            await this.registry.shutdownAll();
            // Clear all tracking
            this.activeManagers.clear();
            this.factoryCache.clear();
            this.connectionManager.connections.clear();
            this.connectionManager.health.clear();
            this.recoveryAttempts.clear();
            this.initialized = false;
            this._logger.info('✅ Event Manager system shut down');
        }
        /**
         * Private methods for internal operations.
         */
        async getOrCreateFactory(type) {
            // Check cache first
            const cached = this.factoryCache.get(type);
            if (cached) {
                return cached;
            }
            // Try to get from registry
            const factory = this.registry.getFactory(type);
            if (factory) {
                this.factoryCache.set(type, factory);
                return factory;
            }
            // Dynamic import based on manager type
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
                        // MonitoringEventFactory is static, wrap it in a compatible interface
                        FactoryClass = class {
                            async create(config) {
                                const adapter = MonitoringEventFactory.create(config.name, config);
                                return adapter; // Type assertion for compatibility
                            }
                        };
                        break;
                    }
                    default:
                        throw new Error(`No factory available for event manager type: ${type}`);
                }
                // Try different constructor signatures based on factory type
                let newFactory;
                try {
                    // First try with logger and config parameters (SystemEventFactory pattern)
                    newFactory = new FactoryClass(this._logger, this._config);
                }
                catch (error) {
                    // Fallback to no-parameter constructor (CommunicationEventFactory pattern)
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
                // Ensure required fields are not overwritten
                name: options?.name,
                type: options?.type,
            };
        }
        async registerDefaultFactories() {
            // Register available factories
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
                    // Process health results and trigger recovery if needed
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
            }, 30000); // Every 30 seconds
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
    return EventManager = _classThis;
})();
export { EventManager };
export default EventManager;
