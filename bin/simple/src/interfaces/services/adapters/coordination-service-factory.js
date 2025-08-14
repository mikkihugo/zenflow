import { getLogger } from '../../../config/logging-config.ts';
import { ServicePriority, ServiceType } from '../types.ts';
import { createCoordinationServiceAdapter, createDefaultCoordinationServiceAdapterConfig, } from './coordination-service-adapter.ts';
export class CoordinationServiceFactory {
    instances = new Map();
    logger;
    constructor() {
        this.logger = getLogger('CoordinationServiceFactory');
    }
    async create(config) {
        this.logger.info(`Creating coordination service adapter: ${config?.name}`);
        if (this.instances.has(config?.name)) {
            this.logger.warn(`Coordination service adapter ${config?.name} already exists, returning existing instance`);
            return this.instances.get(config?.name);
        }
        try {
            const adapter = createCoordinationServiceAdapter(config);
            this.instances.set(config?.name, adapter);
            this.logger.info(`Coordination service adapter created successfully: ${config?.name}`);
            return adapter;
        }
        catch (error) {
            this.logger.error(`Failed to create coordination service adapter ${config?.name}:`, error);
            throw error;
        }
    }
    async createMultiple(configs) {
        this.logger.info(`Creating ${configs.length} coordination service adapters`);
        const results = [];
        for (const config of configs) {
            try {
                const adapter = await this.create(config);
                results.push(adapter);
            }
            catch (error) {
                this.logger.error(`Failed to create coordination service adapter ${config?.name}:`, error);
                throw error;
            }
        }
        return results;
    }
    get(name) {
        return this.instances.get(name);
    }
    list() {
        return Array.from(this.instances.values());
    }
    has(name) {
        return this.instances.has(name);
    }
    async remove(name) {
        const adapter = this.instances.get(name);
        if (!adapter) {
            return false;
        }
        try {
            await adapter.destroy();
            this.instances.delete(name);
            this.logger.info(`Coordination service adapter removed: ${name}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to remove coordination service adapter ${name}:`, error);
            throw error;
        }
    }
    getSupportedTypes() {
        return [
            ServiceType.COORDINATION,
            ServiceType.DAA,
            ServiceType.SESSION_RECOVERY,
        ];
    }
    supportsType(type) {
        return this.getSupportedTypes().includes(type);
    }
    async startAll() {
        this.logger.info('Starting all coordination service adapters');
        const startPromises = this.list().map(async (adapter) => {
            try {
                await adapter.start();
                this.logger.debug(`Started coordination service adapter: ${adapter.name}`);
            }
            catch (error) {
                this.logger.error(`Failed to start coordination service adapter ${adapter.name}:`, error);
                throw error;
            }
        });
        await Promise.allSettled(startPromises);
    }
    async stopAll() {
        this.logger.info('Stopping all coordination service adapters');
        const stopPromises = this.list().map(async (adapter) => {
            try {
                await adapter.stop();
                this.logger.debug(`Stopped coordination service adapter: ${adapter.name}`);
            }
            catch (error) {
                this.logger.error(`Failed to stop coordination service adapter ${adapter.name}:`, error);
            }
        });
        await Promise.allSettled(stopPromises);
    }
    async healthCheckAll() {
        this.logger.debug('Performing health check on all coordination service adapters');
        const results = new Map();
        const adapters = this.list();
        const healthCheckPromises = adapters.map(async (adapter) => {
            try {
                const status = await adapter.getStatus();
                results?.set(adapter.name, status);
            }
            catch (error) {
                this.logger.error(`Health check failed for coordination service adapter ${adapter.name}:`, error);
                results?.set(adapter.name, {
                    name: adapter.name,
                    type: adapter.type,
                    lifecycle: 'error',
                    health: 'unhealthy',
                    lastCheck: new Date(),
                    uptime: 0,
                    errorCount: 1,
                    errorRate: 100,
                });
            }
        });
        await Promise.allSettled(healthCheckPromises);
        return results;
    }
    async getMetricsAll() {
        this.logger.debug('Collecting metrics from all coordination service adapters');
        const results = new Map();
        const adapters = this.list();
        const metricsPromises = adapters.map(async (adapter) => {
            try {
                const metrics = await adapter.getMetrics();
                results?.set(adapter.name, metrics);
            }
            catch (error) {
                this.logger.error(`Failed to get metrics for coordination service adapter ${adapter.name}:`, error);
            }
        });
        await Promise.allSettled(metricsPromises);
        return results;
    }
    async shutdown() {
        this.logger.info('Shutting down coordination service factory');
        try {
            await this.stopAll();
            const destroyPromises = this.list().map(async (adapter) => {
                try {
                    await adapter.destroy();
                }
                catch (error) {
                    this.logger.error(`Failed to destroy coordination service adapter ${adapter.name}:`, error);
                }
            });
            await Promise.allSettled(destroyPromises);
            this.instances.clear();
            this.logger.info('Coordination service factory shutdown completed');
        }
        catch (error) {
            this.logger.error('Error during coordination service factory shutdown:', error);
            throw error;
        }
    }
    getActiveCount() {
        return this.instances.size;
    }
}
export function createAgentCoordinationConfig(name, options) {
    return createDefaultCoordinationServiceAdapterConfig(name, {
        type: ServiceType.COORDINATION,
        priority: ServicePriority.HIGH,
        daaService: {
            enabled: true,
            autoInitialize: true,
            enableLearning: options?.enableLearning ?? true,
            enableCognitive: true,
            enableMetaLearning: true,
        },
        swarmCoordinator: {
            enabled: true,
            defaultTopology: options?.topology ?? 'mesh',
            maxAgents: options?.maxAgents ?? 20,
            coordinationTimeout: 15000,
            performanceThreshold: 0.85,
        },
        agentManagement: {
            autoSpawn: options?.autoSpawn ?? false,
            maxLifetime: 7200000,
            healthCheckInterval: 60000,
            performanceTracking: true,
        },
        learning: {
            enableContinuousLearning: options?.enableLearning ?? true,
            knowledgeSharing: true,
            patternAnalysis: true,
            metaLearningInterval: 1800000,
        },
    });
}
export function createSessionCoordinationConfig(name, options) {
    return createDefaultCoordinationServiceAdapterConfig(name, {
        type: ServiceType.SESSION_RECOVERY,
        priority: ServicePriority.HIGH,
        sessionService: {
            enabled: true,
            autoRecovery: options?.autoRecovery ?? true,
            healthCheckInterval: 30000,
            maxSessions: options?.maxSessions ?? 50,
            checkpointInterval: options?.checkpointInterval ?? 300000,
        },
        performance: {
            enableRequestDeduplication: true,
            maxConcurrency: 15,
            requestTimeout: 45000,
            enableMetricsCollection: true,
            sessionCaching: true,
        },
        cache: {
            enabled: true,
            strategy: 'memory',
            defaultTTL: 900000,
            maxSize: 200,
            keyPrefix: 'session-coord:',
        },
    });
}
export function createDAACoordinationConfig(name, options) {
    return createDefaultCoordinationServiceAdapterConfig(name, {
        type: ServiceType.DAA,
        priority: ServicePriority.HIGH,
        daaService: {
            enabled: true,
            autoInitialize: true,
            enableLearning: true,
            enableCognitive: options?.enableCognitive ?? true,
            enableMetaLearning: options?.enableMetaLearning ?? true,
        },
        learning: {
            enableContinuousLearning: true,
            knowledgeSharing: true,
            patternAnalysis: true,
            metaLearningInterval: options?.analysisInterval ?? 1200000,
        },
        performance: {
            enableRequestDeduplication: true,
            maxConcurrency: 25,
            requestTimeout: 60000,
            enableMetricsCollection: true,
        },
    });
}
export function createHighPerformanceCoordinationConfig(name, options) {
    return createDefaultCoordinationServiceAdapterConfig(name, {
        type: ServiceType.COORDINATION,
        priority: ServicePriority.HIGH,
        performance: {
            enableRequestDeduplication: true,
            maxConcurrency: options?.maxConcurrency ?? 50,
            requestTimeout: options?.requestTimeout ?? 20000,
            enableMetricsCollection: true,
            agentPooling: true,
            sessionCaching: true,
        },
        cache: {
            enabled: true,
            strategy: 'memory',
            defaultTTL: 300000,
            maxSize: options?.cacheSize ?? 1000,
            keyPrefix: 'perf-coord:',
        },
        retry: {
            enabled: true,
            maxAttempts: 5,
            backoffMultiplier: 1.5,
            retryableOperations: [
                'agent-create',
                'agent-adapt',
                'workflow-execute',
                'session-create',
                'session-save',
                'session-restore',
                'swarm-coordinate',
                'swarm-assign-task',
                'knowledge-share',
                'cognitive-analyze',
                'meta-learning',
            ],
        },
    });
}
export const CoordinationConfigPresets = {
    BASIC: (name) => createDefaultCoordinationServiceAdapterConfig(name, {
        type: ServiceType.COORDINATION,
        priority: ServicePriority.NORMAL,
    }),
    ADVANCED: (name) => createAgentCoordinationConfig(name, {
        maxAgents: 100,
        topology: 'hierarchical',
        enableLearning: true,
        autoSpawn: true,
    }),
    SESSION_MANAGEMENT: (name) => createSessionCoordinationConfig(name, {
        maxSessions: 200,
        checkpointInterval: 180000,
        autoRecovery: true,
    }),
    DATA_ANALYSIS: (name) => createDAACoordinationConfig(name, {
        enableMetaLearning: true,
        enableCognitive: true,
        analysisInterval: 900000,
    }),
    HIGH_PERFORMANCE: (name) => createHighPerformanceCoordinationConfig(name, {
        maxConcurrency: 100,
        requestTimeout: 15000,
        cacheSize: 2000,
    }),
};
export const coordinationServiceFactory = new CoordinationServiceFactory();
export default CoordinationServiceFactory;
//# sourceMappingURL=coordination-service-factory.js.map