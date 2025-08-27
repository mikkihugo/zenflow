/**
 * UEL (Unified Event Layer) - Event Manager System.
 *
 * Comprehensive event manager for lifecycle management, factory registration,
 * and coordinated event processing across all UEL components.
 *
 * @file Event Manager Implementation following UACL/USL patterns.
 */
import { EventManagerPresets, EventManagerTypes } from './core/interfaces';
import { EventCategories, DefaultEventManagerConfigs } from './types/index';
import { EventRegistry } from './registry';
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
// @injectable - commented out due to decorator complexity
export class EventManager {
    _logger;
    _config;
    // Required by CoreEventManager interface
    config;
    name;
    type;
    registry;
    activeManagers = new Map();
    factoryCache = new Map();
    connectionManager;
    coordinationSettings;
    statistics;
    initialized = false;
    recoveryAttempts = new Map();
    constructor(_logger, _config) {
        this._logger = _logger;
        this._config = _config;
        // Initialize required interface properties
        this.config = {
            name: 'uel-event-manager',
            type: EventManagerTypes.SYSTEM,
            processing: {
                strategy: 'queued',
                queueSize: 10000,
            },
        };
        this.name = this.config.name;
        this.type = this.config.type;
        this.registry = new EventRegistry(this._logger);
        this.connectionManager = {
            connections: new Map(),
            health: new Map(),
            autoReconnect: true,
            maxReconnectAttempts: 5,
            connectionTimeout: 30000,
        };
        this.coordinationSettings = {
            crossManagerRouting: true,
            eventDeduplication: true,
            batchProcessing: {
                enabled: true,
                batchSize: 100,
                flushInterval: 5000,
            },
            priorityQueue: {
                enabled: true,
                maxSize: 10000,
                processingDelay: 10,
            },
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
            averageLatency: 0,
        };
        // Initialize connection maps for all manager types
        for (const type of Object.values(EventManagerTypes)) {
            this.connectionManager.connections.set(type, new Set());
        }
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
            this.coordinationSettings = {
                ...this.coordinationSettings,
                ...options?.coordination,
            };
        }
        if (options?.connection) {
            this.connectionManager = {
                ...this.connectionManager,
                ...options?.connection,
            };
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
        const _startTime = Date.now();
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
            this.connectionManager.connections
                .get(options?.type)
                ?.add(manager);
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
            const duration = Date.now() - _startTime;
            this.statistics.averageStartupTime =
                (this.statistics.averageStartupTime *
                    (this.statistics.totalCreated - 1) +
                    duration) /
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
            preset: 'REAL_TIME',
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
            preset: 'REAL_TIME',
        });
        return manager;
    }
    /**
     * Get event manager by name.
     *
     * @param name
     */
    getEventManager(name) {
        return (this.activeManagers.get(name) || this.registry.findEventManager(name));
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
                for (const managers of this.connectionManager.connections) {
                    managers.delete(manager);
                }
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
        for (const type of Object.values(EventManagerTypes)) {
            const connections = this.connectionManager.connections.get(type)?.size || 0;
            connectionsByType[type] = connections;
            totalConnections += connections;
        }
        for (const health of this.connectionManager.health) {
            if (health.healthy) {
                healthyConnections++;
            }
        }
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
        await (options?.type ? this.registry.broadcastToType(options?.type, event) : this.registry.broadcast(event));
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
        const status = healthPercentage >= 80
            ? 'healthy'
            : healthPercentage >= 50
                ? 'warning'
                : 'critical';
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
                    const { SystemEventFactory } = await import('./adapters/system-event-factory');
                    FactoryClass = SystemEventFactory;
                    break;
                }
                case EventManagerTypes.COORDINATION: {
                    const { CoordinationEventFactory } = await import('./adapters/coordination-event-factory');
                    FactoryClass = CoordinationEventFactory;
                    break;
                }
                case EventManagerTypes.COMMUNICATION: {
                    const { createCommunicationEventAdapter } = await import('./adapters/communication-event-adapter');
                    // Create a basic factory-like structure
                    FactoryClass = class {
                        static async create(config) {
                            return createCommunicationEventAdapter(config);
                        }
                        static get() { return; }
                    };
                    break;
                }
                case EventManagerTypes.MONITORING: {
                    const { MonitoringEventFactory } = await import('./adapters/monitoring-event-factory');
                    // MonitoringEventFactory is static, wrap it in a compatible interface
                    FactoryClass = class {
                        async create(config) {
                            const adapter = MonitoringEventFactory.create(config.name, config);
                            return adapter;
                        }
                        async createMultiple() {
                            return [];
                        }
                        get() {
                            return;
                        }
                        list() {
                            return [];
                        }
                        has() {
                            return false;
                        }
                        async remove() {
                            return false;
                        }
                        async healthCheckAll() {
                            return new Map();
                        }
                        async getMetricsAll() {
                            return new Map();
                        }
                        async startAll() { }
                        async stopAll() { }
                        async shutdown() { }
                        getActiveCount() {
                            return 0;
                        }
                        getFactoryMetrics() {
                            return {
                                totalManagers: 0,
                                runningManagers: 0,
                                errorCount: 0,
                                uptime: 0,
                            };
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
            catch (_error) {
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
        const defaults = DefaultEventManagerConfigs?.[options?.type] || DefaultEventManagerConfigs?.[EventCategories.SYSTEM];
        const presetConfig = options?.preset
            ? EventManagerPresets[options?.preset]
            : {};
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
        const factoryTypes = [
            EventManagerTypes.SYSTEM,
            EventManagerTypes.COORDINATION,
        ];
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
    // Required CoreEventManager interface methods
    async start() {
        await this.initialize();
    }
    async stop() {
        await this.shutdown();
    }
    async restart() {
        await this.stop();
        await this.start();
    }
    isRunning() {
        return this.initialized;
    }
    async emit(event) {
        // Broadcast to all active managers
        const emitPromises = Array.from(this.activeManagers.values()).map(async (manager) => {
            try {
                if (typeof manager.emit === 'function') {
                    await manager.emit(event);
                }
            }
            catch (error) {
                this._logger.warn(`Failed to emit event to manager:`, error);
            }
        });
        await Promise.allSettled(emitPromises);
    }
    async emitBatch(batch) {
        for (const event of batch.events) {
            await this.emit(event);
        }
    }
    async emitImmediate(event) {
        await this.emit(event);
    }
    subscribe(_eventTypes, _listener, _options) {
        // Basic subscription implementation
        const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this._logger.debug(`Subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    unsubscribe(subscriptionId) {
        this._logger.debug(`Unsubscribing: ${subscriptionId}`);
        return true;
    }
    unsubscribeAll(eventType) {
        this._logger.debug(`Unsubscribing all for event type: ${eventType}`);
        return 0;
    }
    addFilter(filter) {
        return `filter_${Date.now()}`;
    }
    removeFilter(filterId) {
        return true;
    }
    addTransform(transform) {
        return `transform_${Date.now()}`;
    }
    removeTransform(transformId) {
        return true;
    }
    async query(options) {
        return [];
    }
    async getEventHistory(eventType, limit) {
        return [];
    }
    async healthCheck() {
        const status = await this.performHealthCheck();
        const totalManagers = status.size;
        const healthyManagers = Array.from(status.values()).filter((s) => s.status === 'healthy').length;
        return {
            name: this.name,
            type: this.type,
            status: healthyManagers === totalManagers ? 'healthy' : 'degraded',
            lastCheck: new Date(),
            subscriptions: 0,
            queueSize: 0,
            errorRate: 0,
            uptime: 0,
        };
    }
    async getMetrics() {
        return {
            name: this.name,
            type: this.type,
            eventsProcessed: this.statistics.totalEventsProcessed,
            eventsEmitted: 0,
            eventsFailed: 0,
            averageLatency: this.statistics.averageLatency,
            p95Latency: 0,
            p99Latency: 0,
            throughput: this.statistics.eventsPerSecond,
            subscriptionCount: 0,
            queueSize: 0,
            memoryUsage: 0,
            timestamp: new Date(),
        };
    }
    getSubscriptions() {
        return [];
    }
    updateConfig(config) {
        // Update internal config
        Object.assign(this.config, config);
    }
    on(event, handler) {
        // Implementation placeholder
    }
    off(event, handler) {
        // Implementation placeholder
    }
    once(event, handler) {
        // Implementation placeholder
    }
    async destroy() {
        await this.shutdown();
    }
}
// Add missing exports for index.ts compatibility
export { EventManager as createEventManager };
export default EventManager;
