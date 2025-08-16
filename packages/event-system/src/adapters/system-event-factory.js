/**
 * System Event Manager Factory.
 *
 * Factory implementation for creating SystemEventAdapter instances.
 * Following the UEL factory pattern and integrating with the main UELFactory.
 */
/**
 * @file Interface implementation: system-event-factory.
 */
import { getLogger } from '../../../config/logging-config';
import { EventManagerTypes } from '../core/interfaces';
import { createDefaultSystemEventAdapterConfig, SystemEventAdapter, } from './system-event-adapter';
/**
 * System Event Manager Factory.
 *
 * Creates and manages SystemEventAdapter instances for system-level event management.
 * Integrates with the UEL factory system to provide unified access to system events.
 *
 * @example
 */
export class SystemEventManagerFactory {
    logger;
    config;
    instances = new Map();
    constructor(logger, config) {
        this.logger = logger || getLogger('SystemEventManagerFactory');
        this.config = config || {};
        this.logger.debug('SystemEventManagerFactory initialized');
    }
    /**
     * Create a new SystemEventAdapter instance.
     *
     * @param config
     */
    async create(config) {
        this.logger.info(`Creating system event manager: ${config?.name}`);
        try {
            // Validate configuration
            this.validateConfig(config);
            // Create adapter instance
            const adapter = new SystemEventAdapter(config);
            // Store instance for management
            this.instances.set(config?.name, adapter);
            this.logger.info(`System event manager created successfully: ${config?.name}`);
            return adapter;
        }
        catch (error) {
            this.logger.error(`Failed to create system event manager ${config?.name}:`, error);
            throw error;
        }
    }
    /**
     * Create multiple system event managers.
     *
     * @param configs
     */
    async createMultiple(configs) {
        this.logger.info(`Creating ${configs.length} system event managers`);
        const createPromises = configs.map((config) => this.create(config));
        const results = await Promise.allSettled(createPromises);
        const managers = [];
        const errors = [];
        results?.forEach((result, index) => {
            if (result?.status === 'fulfilled') {
                managers.push(result?.value);
            }
            else {
                errors.push(new Error(`Failed to create manager ${configs?.[index]?.name}: ${result?.reason}`));
            }
        });
        if (errors.length > 0) {
            this.logger.warn(`Created ${managers.length}/${configs.length} system event managers, ${errors.length} failed`);
        }
        else {
            this.logger.info(`Successfully created ${managers.length} system event managers`);
        }
        return managers;
    }
    /**
     * Get existing system event manager by name.
     *
     * @param name
     */
    get(name) {
        return this.instances.get(name);
    }
    /**
     * List all system event managers.
     */
    list() {
        return Array.from(this.instances.values());
    }
    /**
     * Check if system event manager exists.
     *
     * @param name
     */
    has(name) {
        return this.instances.has(name);
    }
    /**
     * Remove system event manager.
     *
     * @param name
     */
    async remove(name) {
        const manager = this.instances.get(name);
        if (!manager) {
            return false;
        }
        try {
            // Stop and destroy the manager
            if (manager.isRunning()) {
                await manager.stop();
            }
            await manager.destroy();
            // Remove from instances
            this.instances.delete(name);
            this.logger.info(`System event manager removed: ${name}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to remove system event manager ${name}:`, error);
            return false;
        }
    }
    /**
     * Health check all system event managers.
     */
    async healthCheckAll() {
        const results = new Map();
        const healthPromises = Array.from(this.instances.entries()).map(async ([name, manager]) => {
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
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                });
            }
        });
        await Promise.allSettled(healthPromises);
        return results;
    }
    /**
     * Get metrics from all system event managers.
     */
    async getMetricsAll() {
        const results = new Map();
        const metricsPromises = Array.from(this.instances.entries()).map(async ([name, manager]) => {
            try {
                const metrics = await manager.getMetrics();
                results?.set(name, metrics);
            }
            catch (error) {
                this.logger.warn(`Failed to get metrics for system event manager ${name}:`, error);
            }
        });
        await Promise.allSettled(metricsPromises);
        return results;
    }
    /**
     * Start all system event managers.
     */
    async startAll() {
        this.logger.info(`Starting ${this.instances.size} system event managers`);
        const startPromises = Array.from(this.instances.values()).map(async (manager) => {
            try {
                if (!manager.isRunning()) {
                    await manager.start();
                }
            }
            catch (error) {
                this.logger.error(`Failed to start system event manager ${manager.name}:`, error);
            }
        });
        await Promise.allSettled(startPromises);
        this.logger.info('All system event managers start operation completed');
    }
    /**
     * Stop all system event managers.
     */
    async stopAll() {
        this.logger.info(`Stopping ${this.instances.size} system event managers`);
        const stopPromises = Array.from(this.instances.values()).map(async (manager) => {
            try {
                if (manager.isRunning()) {
                    await manager.stop();
                }
            }
            catch (error) {
                this.logger.error(`Failed to stop system event manager ${manager.name}:`, error);
            }
        });
        await Promise.allSettled(stopPromises);
        this.logger.info('All system event managers stop operation completed');
    }
    /**
     * Shutdown the factory and all managed instances.
     */
    async shutdown() {
        this.logger.info('Shutting down SystemEventManagerFactory');
        // Stop all managers
        await this.stopAll();
        // Destroy all managers
        const destroyPromises = Array.from(this.instances.values()).map(async (manager) => {
            try {
                await manager.destroy();
            }
            catch (error) {
                this.logger.error(`Failed to destroy system event manager ${manager.name}:`, error);
            }
        });
        await Promise.allSettled(destroyPromises);
        // Clear instances
        this.instances.clear();
        this.logger.info('SystemEventManagerFactory shutdown completed');
    }
    /**
     * Get active manager count.
     */
    getActiveCount() {
        return Array.from(this.instances.values()).filter((manager) => manager.isRunning()).length;
    }
    /**
     * Get factory metrics.
     */
    getFactoryMetrics() {
        const runningManagers = this.getActiveCount();
        return {
            totalManagers: this.instances.size,
            runningManagers,
            errorCount: 0, // Would track factory-level errors in real implementation
            uptime: Date.now(), // Would track actual uptime in real implementation
        };
    }
    /**
     * Validate system event manager configuration.
     *
     * @param config
     */
    validateConfig(config) {
        if (!config?.name || typeof config?.name !== 'string') {
            throw new Error('System event manager configuration must have a valid name');
        }
        if (config?.type !== EventManagerTypes.SYSTEM) {
            throw new Error(`System event manager must have type '${EventManagerTypes.SYSTEM}'`);
        }
        // Validate system-specific configuration
        if (config?.coreSystem?.enabled === undefined) {
            config.coreSystem = { ...config?.coreSystem, enabled: true };
        }
        if (config?.correlation?.enabled && !config?.correlation?.correlationTTL) {
            throw new Error('Correlation TTL must be specified when correlation is enabled');
        }
        if (config?.healthMonitoring?.enabled &&
            !config?.healthMonitoring?.healthCheckInterval) {
            throw new Error('Health check interval must be specified when health monitoring is enabled');
        }
    }
}
/**
 * Convenience factory functions for system event managers.
 */
/**
 * Create a system event manager with default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export async function createSystemEventManager(name, overrides) {
    const factory = new SystemEventManagerFactory();
    const config = createDefaultSystemEventAdapterConfig(name, overrides);
    const manager = await factory.create(config);
    return manager;
}
/**
 * Create system event manager for core system integration.
 *
 * @param name
 * @example
 */
export async function createCoreSystemEventManager(name = 'core-system-events') {
    return await createSystemEventManager(name, {
        coreSystem: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapHealthEvents: true,
            wrapConfigEvents: true,
        },
        applicationCoordinator: {
            enabled: false,
        },
        correlation: {
            enabled: true,
            strategy: 'component',
            correlationTTL: 600000, // 10 minutes for core system events
            maxCorrelationDepth: 15,
            correlationPatterns: [
                'system:startup->system:health',
                'system:error->system:recovery',
            ],
        },
    });
}
/**
 * Create system event manager for application coordination.
 *
 * @param name
 * @example
 */
export async function createApplicationCoordinatorEventManager(name = 'app-coordinator-events') {
    return await createSystemEventManager(name, {
        coreSystem: {
            enabled: false,
        },
        applicationCoordinator: {
            enabled: true,
            wrapComponentEvents: true,
            wrapStatusEvents: true,
            wrapWorkspaceEvents: true,
        },
        correlation: {
            enabled: true,
            strategy: 'operation',
            correlationTTL: 300000, // 5 minutes for app events
            maxCorrelationDepth: 10,
            correlationPatterns: [
                'workspace:loaded->system:health',
                'component:error->system:recovery',
            ],
        },
    });
}
/**
 * Create system event manager for error recovery integration.
 *
 * @param name
 * @example
 */
export async function createErrorRecoveryEventManager(name = 'error-recovery-events') {
    return await createSystemEventManager(name, {
        coreSystem: {
            enabled: false,
        },
        applicationCoordinator: {
            enabled: false,
        },
        errorRecovery: {
            enabled: true,
            wrapRecoveryEvents: true,
            wrapStrategyEvents: true,
            correlateErrors: true,
        },
        correlation: {
            enabled: true,
            strategy: 'session',
            correlationTTL: 900000, // 15 minutes for error recovery
            maxCorrelationDepth: 20,
            correlationPatterns: [
                'system:error->recovery:started',
                'recovery:started->recovery:completed',
                'recovery:failed->system:error',
            ],
        },
        performance: {
            enableEventCorrelation: true,
            maxConcurrentEvents: 200, // Higher for error scenarios
            eventTimeout: 60000, // Longer timeout for recovery
            enablePerformanceTracking: true,
        },
    });
}
/**
 * Create comprehensive system event manager for full system monitoring.
 *
 * @param name
 * @example
 */
export async function createComprehensiveSystemEventManager(name = 'comprehensive-system-events') {
    return await createSystemEventManager(name, {
        coreSystem: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapHealthEvents: true,
            wrapConfigEvents: true,
        },
        applicationCoordinator: {
            enabled: true,
            wrapComponentEvents: true,
            wrapStatusEvents: true,
            wrapWorkspaceEvents: true,
        },
        processManagement: {
            enabled: true,
            wrapServiceEvents: true,
            wrapDaemonEvents: true,
            wrapResourceEvents: true,
        },
        errorRecovery: {
            enabled: true,
            wrapRecoveryEvents: true,
            wrapStrategyEvents: true,
            correlateErrors: true,
        },
        correlation: {
            enabled: true,
            strategy: 'component',
            correlationTTL: 600000, // 10 minutes
            maxCorrelationDepth: 25,
            correlationPatterns: [
                'system:startup->system:health',
                'system:error->recovery:started',
                'recovery:completed->system:health',
                'config:change->system:restart',
                'workspace:loaded->system:health',
            ],
        },
        healthMonitoring: {
            enabled: true,
            healthCheckInterval: 15000, // More frequent for comprehensive monitoring
            componentHealthThresholds: {
                'core-system': 0.98,
                'application-coordinator': 0.95,
                'workflow-engine': 0.9,
                'memory-system': 0.95,
                'interface-manager': 0.85,
                'error-recovery': 0.9,
            },
            autoRecoveryEnabled: true,
        },
        performance: {
            enableEventCorrelation: true,
            maxConcurrentEvents: 500, // High capacity for comprehensive monitoring
            eventTimeout: 45000,
            enablePerformanceTracking: true,
        },
    });
}
export default SystemEventManagerFactory;
//# sourceMappingURL=system-event-factory.js.map