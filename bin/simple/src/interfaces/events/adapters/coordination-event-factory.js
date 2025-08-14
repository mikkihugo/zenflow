import { getLogger } from '../../../config/logging-config.ts';
import { EventManagerTypes } from '../core/interfaces.ts';
import { CoordinationEventAdapter, createDefaultCoordinationEventAdapterConfig, } from './coordination-event-adapter.ts';
export class CoordinationEventManagerFactory {
    logger;
    config;
    instances = new Map();
    constructor(logger, config) {
        this.logger = logger || getLogger('CoordinationEventManagerFactory');
        this.config = config || {
            get: () => undefined,
            set: () => { },
            has: () => false,
        };
        this.logger.debug('CoordinationEventManagerFactory initialized');
    }
    async create(config) {
        this.logger.info(`Creating coordination event manager: ${config?.name}`);
        try {
            this.validateConfig(config);
            const adapter = new CoordinationEventAdapter(config);
            this.instances.set(config?.name, adapter);
            this.logger.info(`Coordination event manager created successfully: ${config?.name}`);
            return adapter;
        }
        catch (error) {
            this.logger.error(`Failed to create coordination event manager ${config?.name}:`, error);
            throw error;
        }
    }
    async createMultiple(configs) {
        this.logger.info(`Creating ${configs.length} coordination event managers`);
        const createPromises = configs.map((config) => this.create(config));
        const results = await Promise.allSettled(createPromises);
        const managers = [];
        const errors = [];
        results?.forEach((result, index) => {
            if (result?.status === 'fulfilled') {
                managers.push(result?.value);
            }
            else {
                errors.push(new Error(`Failed to create coordination manager ${configs?.[index]?.name}: ${result?.reason}`));
            }
        });
        if (errors.length > 0) {
            this.logger.warn(`Created ${managers.length}/${configs.length} coordination event managers, ${errors.length} failed`);
        }
        else {
            this.logger.info(`Successfully created ${managers.length} coordination event managers`);
        }
        return managers;
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
        const manager = this.instances.get(name);
        if (!manager) {
            return false;
        }
        try {
            if (manager.isRunning()) {
                await manager.stop();
            }
            await manager.destroy();
            this.instances.delete(name);
            this.logger.info(`Coordination event manager removed: ${name}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to remove coordination event manager ${name}:`, error);
            return false;
        }
    }
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
    async getMetricsAll() {
        const results = new Map();
        const metricsPromises = Array.from(this.instances.entries()).map(async ([name, manager]) => {
            try {
                const metrics = await manager.getMetrics();
                results?.set(name, metrics);
            }
            catch (error) {
                this.logger.warn(`Failed to get metrics for coordination event manager ${name}:`, error);
            }
        });
        await Promise.allSettled(metricsPromises);
        return results;
    }
    async startAll() {
        this.logger.info(`Starting ${this.instances.size} coordination event managers`);
        const startPromises = Array.from(this.instances.values()).map(async (manager) => {
            try {
                if (!manager.isRunning()) {
                    await manager.start();
                }
            }
            catch (error) {
                this.logger.error(`Failed to start coordination event manager ${manager.name}:`, error);
            }
        });
        await Promise.allSettled(startPromises);
        this.logger.info('All coordination event managers start operation completed');
    }
    async stopAll() {
        this.logger.info(`Stopping ${this.instances.size} coordination event managers`);
        const stopPromises = Array.from(this.instances.values()).map(async (manager) => {
            try {
                if (manager.isRunning()) {
                    await manager.stop();
                }
            }
            catch (error) {
                this.logger.error(`Failed to stop coordination event manager ${manager.name}:`, error);
            }
        });
        await Promise.allSettled(stopPromises);
        this.logger.info('All coordination event managers stop operation completed');
    }
    async shutdown() {
        this.logger.info('Shutting down CoordinationEventManagerFactory');
        await this.stopAll();
        const destroyPromises = Array.from(this.instances.values()).map(async (manager) => {
            try {
                await manager.destroy();
            }
            catch (error) {
                this.logger.error(`Failed to destroy coordination event manager ${manager.name}:`, error);
            }
        });
        await Promise.allSettled(destroyPromises);
        this.instances.clear();
        this.logger.info('CoordinationEventManagerFactory shutdown completed');
    }
    getActiveCount() {
        return Array.from(this.instances.values()).filter((manager) => manager.isRunning()).length;
    }
    getFactoryMetrics() {
        const runningManagers = this.getActiveCount();
        return {
            totalManagers: this.instances.size,
            runningManagers,
            errorCount: 0,
            uptime: Date.now(),
        };
    }
    validateConfig(config) {
        if (!config?.name || typeof config?.name !== 'string') {
            throw new Error('Coordination event manager configuration must have a valid name');
        }
        if (config?.type !== EventManagerTypes.COORDINATION) {
            throw new Error(`Coordination event manager must have type '${EventManagerTypes.COORDINATION}'`);
        }
        if (config?.swarmCoordination?.enabled === undefined) {
            config.swarmCoordination = {
                ...config?.swarmCoordination,
                enabled: true,
            };
        }
        if (config?.coordination?.enabled &&
            !config?.coordination?.correlationTTL) {
            throw new Error('Coordination correlation TTL must be specified when correlation is enabled');
        }
        if (config?.agentHealthMonitoring?.enabled &&
            !config?.agentHealthMonitoring?.healthCheckInterval) {
            throw new Error('Health check interval must be specified when agent health monitoring is enabled');
        }
        if (config?.swarmOptimization?.enabled &&
            !config?.swarmOptimization?.performanceThresholds) {
            throw new Error('Performance thresholds must be specified when swarm optimization is enabled');
        }
        if (config?.swarmCoordination?.coordinators &&
            !Array.isArray(config?.swarmCoordination?.coordinators)) {
            throw new Error('Swarm coordinators must be an array');
        }
    }
}
export async function createCoordinationEventManager(name, overrides) {
    const factory = new CoordinationEventManagerFactory();
    const config = createDefaultCoordinationEventAdapterConfig(name, overrides);
    const manager = await factory.create(config);
    return manager;
}
export async function createSwarmCoordinationEventManager(name = 'swarm-coordination-events') {
    return await createCoordinationEventManager(name, {
        swarmCoordination: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapPerformanceEvents: true,
            wrapTopologyEvents: true,
            wrapHealthEvents: true,
            coordinators: ['default', 'sparc', 'hierarchical'],
        },
        agentManagement: {
            enabled: false,
        },
        taskOrchestration: {
            enabled: false,
        },
        coordination: {
            enabled: true,
            strategy: 'swarm',
            correlationTTL: 600000,
            maxCorrelationDepth: 20,
            correlationPatterns: [
                'coordination:swarm->coordination:topology',
                'coordination:topology->coordination:swarm',
            ],
            trackAgentCommunication: true,
            trackSwarmHealth: true,
        },
        swarmOptimization: {
            enabled: true,
            optimizationInterval: 30000,
            performanceThresholds: {
                latency: 25,
                throughput: 300,
                reliability: 0.99,
            },
            autoScaling: true,
            loadBalancing: true,
        },
    });
}
export async function createAgentManagementEventManager(name = 'agent-management-events') {
    return await createCoordinationEventManager(name, {
        swarmCoordination: {
            enabled: false,
        },
        agentManagement: {
            enabled: true,
            wrapAgentEvents: true,
            wrapHealthEvents: true,
            wrapRegistryEvents: true,
            wrapLifecycleEvents: true,
        },
        taskOrchestration: {
            enabled: false,
        },
        coordination: {
            enabled: true,
            strategy: 'agent',
            correlationTTL: 300000,
            maxCorrelationDepth: 15,
            correlationPatterns: ['coordination:agent->coordination:agent'],
            trackAgentCommunication: true,
            trackSwarmHealth: false,
        },
        agentHealthMonitoring: {
            enabled: true,
            healthCheckInterval: 15000,
            agentHealthThresholds: {
                'agent-manager': 0.95,
                'agent-pool': 0.9,
                'agent-registry': 0.95,
            },
            swarmHealthThresholds: {},
            autoRecoveryEnabled: true,
        },
    });
}
export async function createTaskOrchestrationEventManager(name = 'task-orchestration-events') {
    return await createCoordinationEventManager(name, {
        swarmCoordination: {
            enabled: false,
        },
        agentManagement: {
            enabled: false,
        },
        taskOrchestration: {
            enabled: true,
            wrapTaskEvents: true,
            wrapDistributionEvents: true,
            wrapExecutionEvents: true,
            wrapCompletionEvents: true,
        },
        coordination: {
            enabled: true,
            strategy: 'task',
            correlationTTL: 900000,
            maxCorrelationDepth: 25,
            correlationPatterns: [
                'coordination:task->coordination:task',
                'coordination:task->coordination:agent',
            ],
            trackAgentCommunication: true,
            trackSwarmHealth: false,
        },
        performance: {
            enableSwarmCorrelation: false,
            enableAgentTracking: true,
            enableTaskMetrics: true,
            maxConcurrentCoordinations: 200,
            coordinationTimeout: 60000,
            enablePerformanceTracking: true,
        },
    });
}
export async function createProtocolManagementEventManager(name = 'protocol-management-events') {
    return await createCoordinationEventManager(name, {
        swarmCoordination: {
            enabled: false,
        },
        agentManagement: {
            enabled: false,
        },
        taskOrchestration: {
            enabled: false,
        },
        protocolManagement: {
            enabled: true,
            wrapCommunicationEvents: true,
            wrapTopologyEvents: true,
            wrapLifecycleEvents: true,
            wrapCoordinationEvents: true,
        },
        coordination: {
            enabled: true,
            strategy: 'topology',
            correlationTTL: 600000,
            maxCorrelationDepth: 12,
            correlationPatterns: ['coordination:topology->coordination:topology'],
            trackAgentCommunication: true,
            trackSwarmHealth: true,
        },
    });
}
export async function createComprehensiveCoordinationEventManager(name = 'comprehensive-coordination-events') {
    return await createCoordinationEventManager(name, {
        swarmCoordination: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapPerformanceEvents: true,
            wrapTopologyEvents: true,
            wrapHealthEvents: true,
            coordinators: [
                'default',
                'sparc',
                'hierarchical',
                'mesh',
                'ring',
                'star',
            ],
        },
        agentManagement: {
            enabled: true,
            wrapAgentEvents: true,
            wrapHealthEvents: true,
            wrapRegistryEvents: true,
            wrapLifecycleEvents: true,
        },
        taskOrchestration: {
            enabled: true,
            wrapTaskEvents: true,
            wrapDistributionEvents: true,
            wrapExecutionEvents: true,
            wrapCompletionEvents: true,
        },
        protocolManagement: {
            enabled: true,
            wrapCommunicationEvents: true,
            wrapTopologyEvents: true,
            wrapLifecycleEvents: true,
            wrapCoordinationEvents: true,
        },
        coordination: {
            enabled: true,
            strategy: 'swarm',
            correlationTTL: 900000,
            maxCorrelationDepth: 30,
            correlationPatterns: [
                'coordination:swarm->coordination:agent',
                'coordination:agent->coordination:task',
                'coordination:task->coordination:agent',
                'coordination:topology->coordination:swarm',
                'coordination:swarm->coordination:topology',
            ],
            trackAgentCommunication: true,
            trackSwarmHealth: true,
        },
        agentHealthMonitoring: {
            enabled: true,
            healthCheckInterval: 20000,
            agentHealthThresholds: {
                'swarm-coordinator': 0.98,
                'agent-manager': 0.95,
                orchestrator: 0.9,
                'task-distributor': 0.95,
                'topology-manager': 0.85,
                'protocol-manager': 0.9,
            },
            swarmHealthThresholds: {
                'coordination-latency': 75,
                throughput: 150,
                reliability: 0.97,
                'agent-availability': 0.95,
            },
            autoRecoveryEnabled: true,
        },
        swarmOptimization: {
            enabled: true,
            optimizationInterval: 45000,
            performanceThresholds: {
                latency: 40,
                throughput: 250,
                reliability: 0.99,
            },
            autoScaling: true,
            loadBalancing: true,
        },
        performance: {
            enableSwarmCorrelation: true,
            enableAgentTracking: true,
            enableTaskMetrics: true,
            maxConcurrentCoordinations: 300,
            coordinationTimeout: 45000,
            enablePerformanceTracking: true,
        },
    });
}
export async function createHighPerformanceCoordinationEventManager(name = 'high-performance-coordination-events') {
    return await createCoordinationEventManager(name, {
        swarmCoordination: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapPerformanceEvents: true,
            wrapTopologyEvents: false,
            wrapHealthEvents: true,
            coordinators: ['default', 'sparc'],
        },
        agentManagement: {
            enabled: true,
            wrapAgentEvents: true,
            wrapHealthEvents: false,
            wrapRegistryEvents: true,
            wrapLifecycleEvents: true,
        },
        taskOrchestration: {
            enabled: true,
            wrapTaskEvents: true,
            wrapDistributionEvents: true,
            wrapExecutionEvents: true,
            wrapCompletionEvents: true,
        },
        protocolManagement: {
            enabled: false,
        },
        coordination: {
            enabled: true,
            strategy: 'swarm',
            correlationTTL: 180000,
            maxCorrelationDepth: 10,
            correlationPatterns: [
                'coordination:swarm->coordination:agent',
                'coordination:task->coordination:agent',
            ],
            trackAgentCommunication: true,
            trackSwarmHealth: false,
        },
        agentHealthMonitoring: {
            enabled: true,
            healthCheckInterval: 60000,
            agentHealthThresholds: {
                'swarm-coordinator': 0.95,
                'agent-manager': 0.9,
                orchestrator: 0.85,
            },
            swarmHealthThresholds: {
                'coordination-latency': 50,
                throughput: 500,
                reliability: 0.98,
            },
            autoRecoveryEnabled: true,
        },
        swarmOptimization: {
            enabled: true,
            optimizationInterval: 120000,
            performanceThresholds: {
                latency: 20,
                throughput: 500,
                reliability: 0.995,
            },
            autoScaling: true,
            loadBalancing: true,
        },
        performance: {
            enableSwarmCorrelation: true,
            enableAgentTracking: true,
            enableTaskMetrics: true,
            maxConcurrentCoordinations: 500,
            coordinationTimeout: 15000,
            enablePerformanceTracking: true,
        },
        processing: {
            strategy: 'immediate',
            queueSize: 5000,
        },
    });
}
export async function createDevelopmentCoordinationEventManager(name = 'development-coordination-events') {
    return await createCoordinationEventManager(name, {
        swarmCoordination: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapPerformanceEvents: true,
            wrapTopologyEvents: true,
            wrapHealthEvents: true,
            coordinators: ['default', 'sparc', 'debug'],
        },
        agentManagement: {
            enabled: true,
            wrapAgentEvents: true,
            wrapHealthEvents: true,
            wrapRegistryEvents: true,
            wrapLifecycleEvents: true,
        },
        taskOrchestration: {
            enabled: true,
            wrapTaskEvents: true,
            wrapDistributionEvents: true,
            wrapExecutionEvents: true,
            wrapCompletionEvents: true,
        },
        protocolManagement: {
            enabled: true,
            wrapCommunicationEvents: true,
            wrapTopologyEvents: true,
            wrapLifecycleEvents: true,
            wrapCoordinationEvents: true,
        },
        coordination: {
            enabled: true,
            strategy: 'swarm',
            correlationTTL: 1800000,
            maxCorrelationDepth: 50,
            correlationPatterns: [
                'coordination:swarm->coordination:agent',
                'coordination:agent->coordination:task',
                'coordination:task->coordination:agent',
                'coordination:topology->coordination:swarm',
                'coordination:swarm->coordination:topology',
            ],
            trackAgentCommunication: true,
            trackSwarmHealth: true,
        },
        agentHealthMonitoring: {
            enabled: true,
            healthCheckInterval: 10000,
            agentHealthThresholds: {
                'swarm-coordinator': 0.8,
                'agent-manager': 0.7,
                orchestrator: 0.7,
                'task-distributor': 0.8,
                'topology-manager': 0.7,
                'protocol-manager': 0.7,
            },
            swarmHealthThresholds: {
                'coordination-latency': 200,
                throughput: 50,
                reliability: 0.8,
                'agent-availability': 0.7,
            },
            autoRecoveryEnabled: true,
        },
        swarmOptimization: {
            enabled: false,
            optimizationInterval: 60000,
            performanceThresholds: {
                latency: 100,
                throughput: 50,
                reliability: 0.8,
            },
            autoScaling: false,
            loadBalancing: false,
        },
        performance: {
            enableSwarmCorrelation: true,
            enableAgentTracking: true,
            enableTaskMetrics: true,
            maxConcurrentCoordinations: 50,
            coordinationTimeout: 120000,
            enablePerformanceTracking: true,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 5000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
            enableProfiling: true,
        },
    });
}
export default CoordinationEventManagerFactory;
//# sourceMappingURL=coordination-event-factory.js.map