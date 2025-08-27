/**
 * UEL (Unified Event Layer) - Event Registry System.
 *
 * Central registry for managing all event types, factories, and lifecycle management.
 */
import { getLogger } from '@claude-zen/foundation';
/**
 * Event Registry for centralized event manager lifecycle management.
 */
export class EventRegistry {
    _managers = new Map();
    _factories = new Map();
    _logger;
    constructor(logger) {
        this._logger = logger || getLogger('EventRegistry');
    }
    /**
     * Register an event manager factory for a specific type.
     */
    registerFactory(type, factory) {
        this._factories.set(type, factory);
        this._logger.info(`Registered factory for type: ${type}`);
    }
    /**
     * Register an event manager instance.
     */
    register(manager, config) {
        const entry = {
            manager,
            config: config || manager.config,
            created: new Date(),
            lastAccessed: new Date(),
            status: 'healthy',
            usage: {
                accessCount: 0,
                totalEvents: 0,
                totalSubscriptions: 0,
                errorCount: 0,
            },
        };
        this._managers.set(manager.name, entry);
        this._logger.info(`Registered event manager: ${manager.name}`);
    }
    /**
     * Get an event manager by name.
     */
    get(name) {
        const entry = this._managers.get(name);
        if (entry) {
            entry.lastAccessed = new Date();
            entry.usage.accessCount++;
            return entry.manager;
        }
        return undefined;
    }
    /**
     * List all registered event manager names.
     */
    list() {
        return Array.from(this._managers.keys());
    }
    /**
     * Check if an event manager is registered.
     */
    has(name) {
        return this._managers.has(name);
    }
    /**
     * Remove an event manager from the registry.
     */
    async remove(name) {
        const entry = this._managers.get(name);
        if (entry) {
            try {
                await entry.manager.destroy();
            }
            catch (error) {
                this._logger.warn(`Error destroying manager ${name}:`, error);
            }
            this._managers.delete(name);
            this._logger.info(`Removed event manager: ${name}`);
            return true;
        }
        return false;
    }
    /**
     * Create a new event manager using a registered factory.
     */
    async create(config) {
        const factory = this._factories.get(config.type);
        if (!factory) {
            throw new Error(`No factory registered for type: ${config.type}`);
        }
        const manager = await factory.create(config);
        this.register(manager, config);
        return manager;
    }
    /**
     * Get registry statistics.
     */
    getStats() {
        const managersByType = {};
        let healthyManagers = 0;
        let unhealthyManagers = 0;
        for (const entry of this._managers.values()) {
            const { type } = entry.manager;
            managersByType[type] = (managersByType[type] || 0) + 1;
            if (entry.status === 'healthy') {
                healthyManagers++;
            }
            else {
                unhealthyManagers++;
            }
        }
        return {
            totalManagers: this._managers.size,
            totalFactories: this._factories.size,
            managersByType,
            healthyManagers,
            unhealthyManagers,
        };
    }
    /**
     * Perform health checks on all registered managers.
     */
    async performHealthChecks() {
        const now = new Date();
        for (const [name, entry] of this._managers) {
            try {
                // Simple health check - verify manager is running
                const isHealthy = entry.manager.isRunning();
                entry.status = isHealthy ? 'healthy' : 'unhealthy';
                entry.lastHealthCheck = now;
            }
            catch (error) {
                this._logger.warn(`Health check failed for manager ${name}:`, error);
                entry.status = 'unhealthy';
                entry.usage.errorCount++;
            }
        }
    }
    /**
     * Initialize the registry.
     */
    async initialize() {
        this._logger.info('Event registry initialized');
    }
    /**
     * Register a manager.
     */
    async registerManager(name, manager, config) {
        this._managers.set(name, {
            manager,
            config,
            created: new Date(),
            lastAccessed: new Date(),
            status: 'healthy',
            usage: {
                accessCount: 0,
                totalEvents: 0,
                totalSubscriptions: 0,
                errorCount: 0,
            },
        });
        this._logger.info(`Registered manager: ${name}`);
    }
    /**
     * Find event manager by name.
     */
    findEventManager(name) {
        const entry = this._managers.get(name);
        if (entry) {
            entry.lastAccessed = new Date();
            return entry.manager;
        }
        return undefined;
    }
    /**
     * Get event managers by type.
     */
    getEventManagersByType(type) {
        return Array.from(this._managers.values())
            .filter(entry => entry.config.type === type)
            .map(entry => entry.manager);
    }
    /**
     * Health check all managers.
     */
    async healthCheckAll() {
        const results = {};
        for (const [name, entry] of this._managers.entries()) {
            try {
                results[name] = await entry.manager.healthCheck();
            }
            catch (error) {
                results[name] = { status: 'error', error: String(error) };
            }
        }
        return results;
    }
    /**
     * Get global metrics.
     */
    async getGlobalMetrics() {
        const metrics = {
            totalManagers: this._managers.size,
            activeManagers: 0,
            totalEvents: 0,
        };
        for (const entry of this._managers.values()) {
            try {
                if (entry.manager.isRunning()) {
                    metrics.activeManagers++;
                }
                const managerMetrics = await entry.manager.getMetrics();
                metrics.totalEvents += managerMetrics.eventsEmitted || 0;
            }
            catch {
                // Ignore errors
            }
        }
        return metrics;
    }
    /**
     * Broadcast to type.
     */
    async broadcastToType(type, event) {
        const managers = this.getEventManagersByType(type);
        await Promise.all(managers.map(m => m.emit(event).catch(() => { })));
    }
    /**
     * Broadcast to all.
     */
    async broadcast(event) {
        const promises = Array.from(this._managers.values()).map(entry => entry.manager.emit(event).catch(() => { }));
        await Promise.all(promises);
    }
    /**
     * Get registry stats.
     */
    getRegistryStats() {
        return {
            totalManagers: this._managers.size,
            managers: Array.from(this._managers.keys()),
            factories: Array.from(this._factories.keys()),
        };
    }
    /**
     * Shutdown all managers.
     */
    async shutdownAll() {
        for (const [name, entry] of this._managers.entries()) {
            try {
                await entry.manager.destroy();
                this._logger.info(`Shutdown manager: ${name}`);
            }
            catch (error) {
                this._logger.error(`Failed to shutdown manager ${name}:`, error);
            }
        }
        this._managers.clear();
    }
    /**
     * Get factory.
     */
    getFactory(type) {
        return this._factories.get(type);
    }
    /**
     * Cleanup the registry and destroy all managers.
     */
    async cleanup() {
        const managers = Array.from(this._managers.keys());
        for (const name of managers) {
            await this.remove(name);
        }
        this._factories.clear();
        this._logger.info('Event registry cleanup completed');
    }
}
// Global registry instance
let globalRegistry;
/**
 * Get the global event registry instance.
 */
export function getEventRegistry() {
    if (!globalRegistry) {
        globalRegistry = new EventRegistry();
    }
    return globalRegistry;
}
/**
 * Reset the global registry (mainly for testing).
 */
export function resetEventRegistry() {
    globalRegistry = undefined;
}
