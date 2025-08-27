/**
 * @file Coordination Event Factory - Main Factory Class
 *
 * Main factory class for creating and managing coordination event adapters.
 */
import { getLogger, EventEmitter } from '@claude-zen/foundation';
import { createCoordinationEventAdapter } from '../coordination';
import { CoordinationFactoryHelpers } from './helpers';
/**
 * Coordination Event Manager Factory.
 *
 * Creates and manages CoordinationEventAdapter instances for coordination-level event management.
 * Integrates with the UEL factory system to provide unified access to coordination events.
 */
export class CoordinationEventFactory extends EventEmitter {
    logger;
    instances = new Map();
    factoryConfig;
    startTime = new Date();
    totalCreated = 0;
    totalErrors = 0;
    constructor(config = { name: 'coordination-factory' }) {
        super();
        this.logger = getLogger('CoordinationEventFactory');
        this.factoryConfig = config;
        this.logger.info(`Coordination Event Factory initialized: ${config.name}`);
    }
    /**
     * Create new coordination event adapter instance.
     */
    async create(config) {
        try {
            this.logger.info(`Creating coordination event manager: ${config?.name}`);
            // Validate configuration
            CoordinationFactoryHelpers.validateConfig(config);
            // Check for duplicate names
            if (this.instances.has(config?.name)) {
                throw new Error(`Coordination event manager with name '${config?.name}' already exists`);
            }
            // Create adapter instance
            const adapter = createCoordinationEventAdapter(config);
            // Set up event forwarding
            this.setupEventForwarding(adapter, config?.name);
            // Store in registry
            this.instances.set(config?.name, adapter);
            this.totalCreated++;
            this.logger.info(`Coordination event manager created successfully: ${config?.name}`);
            this.emit('adapter-created', { name: config?.name, adapter });
            return adapter;
        }
        catch (error) {
            this.totalErrors++;
            this.logger.error(`Failed to create coordination event manager '${config?.name}':`, error);
            this.emit('adapter-creation-failed', { name: config?.name, error });
            throw error;
        }
    }
    /**
     * Create multiple coordination event adapters.
     */
    async createMultiple(configs) {
        this.logger.info(`Creating ${configs.length} coordination event managers`);
        const results = [];
        const errors = [];
        // Create adapters in parallel
        const creationPromises = configs.map(async (config) => {
            try {
                const adapter = await this.create(config);
                results.push(adapter);
                return adapter;
            }
            catch (error) {
                errors.push({ name: config?.name, error: error });
                return null;
            }
        });
        await Promise.all(creationPromises);
        if (errors.length > 0) {
            this.logger.warn(`Failed to create ${errors.length} coordination event managers:`, errors);
            this.emit('multiple-creation-partial-failure', {
                successes: results.length,
                failures: errors,
            });
        }
        this.logger.info(`Successfully created ${results.length}/${configs.length} coordination event managers`);
        return results;
    }
    /**
     * Get coordination event manager by name.
     */
    get(name) {
        return this.instances.get(name);
    }
    /**
     * List all coordination event managers.
     */
    list() {
        return Array.from(this.instances.values());
    }
    /**
     * Check if coordination event manager exists.
     */
    has(name) {
        return this.instances.has(name);
    }
    /**
     * Remove coordination event manager by name.
     */
    async remove(name) {
        const adapter = this.instances.get(name);
        if (!adapter) {
            return false;
        }
        try {
            this.logger.info(`Removing coordination event manager: ${name}`);
            // Stop the adapter if running
            if (adapter.isRunning && adapter.isRunning()) {
                await adapter.stop();
            }
            // Destroy the adapter if it has destroy method
            if (adapter.destroy) {
                await adapter.destroy();
            }
            // Remove from registry
            this.instances.delete(name);
            this.logger.info(`Coordination event manager removed successfully: ${name}`);
            this.emit('adapter-removed', { name });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to remove coordination event manager '${name}':`, error);
            this.emit('adapter-removal-failed', { name, error });
            throw error;
        }
    }
    /**
     * Health check all coordination event managers.
     */
    async healthCheckAll() {
        this.logger.debug('Performing health check on all coordination event managers');
        const results = new Map();
        const healthPromises = [];
        for (const [name, adapter] of this.instances) {
            const healthPromise = (async () => {
                try {
                    const status = await adapter.healthCheck();
                    results.set(name, status);
                }
                catch (error) {
                    this.logger.warn(`Health check failed for coordination event manager '${name}':`, error);
                    results.set(name, {
                        name,
                        type: adapter.type,
                        status: 'unhealthy',
                        isRunning: false,
                        isHealthy: false,
                        subscriptionCount: 0,
                        eventCount: 0,
                        errorCount: 1,
                        uptime: 0,
                    });
                }
            })();
            healthPromises.push(healthPromise);
        }
        await Promise.all(healthPromises);
        this.logger.debug(`Health check completed for ${results.size} coordination event managers`);
        return results;
    }
    /**
     * Get metrics for all coordination event managers.
     */
    async getMetricsAll() {
        this.logger.debug('Collecting metrics from all coordination event managers');
        const results = new Map();
        const metricsPromises = [];
        for (const [name, adapter] of this.instances) {
            const metricsPromise = (async () => {
                try {
                    const metrics = await adapter.getMetrics();
                    results.set(name, metrics);
                }
                catch (error) {
                    this.logger.warn(`Metrics collection failed for coordination event manager '${name}':`, error);
                    // Create default error metrics
                    results.set(name, {
                        name,
                        type: adapter.type,
                        eventsEmitted: 0,
                        eventsReceived: 0,
                        eventsProcessed: 0,
                        eventsFailed: 1,
                        subscriptionsCreated: 0,
                        subscriptionsRemoved: 0,
                        errorCount: 1,
                        averageProcessingTime: -1,
                        maxProcessingTime: -1,
                        minProcessingTime: -1,
                    });
                }
            })();
            metricsPromises.push(metricsPromise);
        }
        await Promise.all(metricsPromises);
        this.logger.debug(`Metrics collected from ${results.size} coordination event managers`);
        return results;
    }
    /**
     * Get active adapter count.
     */
    getActiveCount() {
        return this.instances.size;
    }
    /**
     * Get factory metrics.
     */
    getFactoryMetrics() {
        const runningAdapters = this.list().filter((adapter) => adapter.isRunning && adapter.isRunning()).length;
        return CoordinationFactoryHelpers.calculateMetrics(this.totalCreated, this.totalErrors, this.instances.size, runningAdapters, this.startTime);
    }
    /**
     * Shutdown factory and all coordination event managers.
     */
    async shutdown() {
        this.logger.info('Shutting down Coordination Event Factory');
        try {
            // Stop and destroy all adapters
            const shutdownPromises = Array.from(this.instances.entries()).map(async ([name, adapter]) => {
                try {
                    if (adapter.isRunning && adapter.isRunning()) {
                        await adapter.stop();
                    }
                    if (adapter.destroy) {
                        await adapter.destroy();
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to shutdown coordination event manager '${name}':`, error);
                }
            });
            await Promise.all(shutdownPromises);
            // Clear registry
            this.instances.clear();
            // Remove all listeners
            this.removeAllListeners();
            this.logger.info('Coordination Event Factory shutdown completed');
            this.emit('factory-shutdown', {});
        }
        catch (error) {
            this.logger.error('Failed to shutdown Coordination Event Factory:', error);
            this.emit('factory-shutdown-failed', error);
            throw error;
        }
    }
    /**
     * Set up event forwarding from adapter to factory.
     */
    setupEventForwarding(adapter, name) {
        // Forward important events from adapter to factory
        if (adapter.on) {
            adapter.on('start', () => {
                this.emit('adapter-started', { name });
            });
            adapter.on('stop', () => {
                this.emit('adapter-stopped', { name });
            });
            adapter.on('error', (error) => {
                this.emit('adapter-error', { name, error });
            });
            adapter.on('subscription', (data) => {
                this.emit('adapter-subscription', {
                    name,
                    ...data,
                });
            });
            adapter.on('emission', (data) => {
                this.emit('adapter-emission', {
                    name,
                    ...data,
                });
            });
        }
    }
}
