export { CommunicationProtocols, } from './communication/communication-protocols.ts';
export { TaskDistributionEngine, } from './distribution/task-distribution-engine.ts';
export { AgentLifecycleManager, } from './lifecycle/agent-lifecycle-manager.ts';
export { PerformanceOptimizer, } from './optimization/performance-optimizer.ts';
export { CoordinationPatterns, } from './patterns/coordination-patterns.ts';
export { TopologyManager, } from './topology/topology-manager.ts';
import { CommunicationProtocols } from './communication/communication-protocols.ts';
import { TaskDistributionEngine } from './distribution/task-distribution-engine.ts';
import { AgentLifecycleManager } from './lifecycle/agent-lifecycle-manager.ts';
import { PerformanceOptimizer } from './optimization/performance-optimizer.ts';
import { CoordinationPatterns } from './patterns/coordination-patterns.ts';
import { TopologyManager, } from './topology/topology-manager.ts';
export async function createAdvancedCoordinationSystem(config, logger, eventBus) {
    const topologyManager = new TopologyManager({
        type: config?.topology?.type,
        parameters: config?.topology?.parameters,
        constraints: config?.topology?.constraints,
        adaptation: config?.topology?.adaptation,
    }, logger, eventBus);
    const distributionEngine = new TaskDistributionEngine(config?.distribution, logger, eventBus);
    const communicationProtocols = new CommunicationProtocols(config?.nodeId, config?.communication, logger, eventBus);
    const lifecycleManager = new AgentLifecycleManager({
        maxAgents: config?.lifecycle?.maxAgents,
        minAgents: config?.lifecycle?.minAgents,
        spawnTimeout: config?.lifecycle?.spawnTimeout,
        shutdownTimeout: config?.lifecycle?.shutdownTimeout,
        healthCheckInterval: config?.lifecycle?.healthCheckInterval,
        performanceWindow: config?.lifecycle?.performanceWindow,
        autoRestart: config?.lifecycle?.autoRestart,
        autoScale: config?.lifecycle?.autoScale,
        resourceLimits: config?.lifecycle?.resourceLimits,
        qualityThresholds: config?.lifecycle?.qualityThresholds,
    }, logger, eventBus);
    const coordinationPatterns = new CoordinationPatterns(config?.nodeId, config?.patterns, logger, eventBus);
    const performanceOptimizer = new PerformanceOptimizer(config?.optimization, logger, eventBus);
    await setupIntegrations({
        topologyManager,
        distributionEngine,
        communicationProtocols,
        lifecycleManager,
        coordinationPatterns,
        performanceOptimizer,
    }, logger);
    return {
        topologyManager,
        distributionEngine,
        communicationProtocols,
        lifecycleManager,
        coordinationPatterns,
        performanceOptimizer,
    };
}
async function setupIntegrations(systems, logger) {
    systems.topologyManager.on('topology:optimized', (data) => {
        logger.debug('Topology optimized, updating task distribution routes', data);
    });
    systems.distributionEngine.on('load:spike', (data) => {
        logger.info('Task load spike detected, triggering agent scaling', data);
        systems.lifecycleManager
            .triggerScaling('worker', data?.targetAgents)
            .catch((error) => {
            logger.error('Auto-scaling failed', { error });
        });
    });
    systems.communicationProtocols.on('network:partition', (data) => {
        logger.warn('Network partition detected, switching coordination pattern', data);
        systems.coordinationPatterns
            .switchPattern('leader-follower')
            .catch((error) => {
            logger.error('Pattern switch failed', { error });
        });
    });
    systems.lifecycleManager.on('agent:unhealthy', (data) => {
        logger.warn('Unhealthy agent detected, updating topology', data);
    });
    systems.coordinationPatterns.on('coordination:leader-elected', (data) => {
        logger.info('New leader elected, updating communication protocols', data);
    });
    systems.performanceOptimizer.on('optimization:applied', (data) => {
        logger.info('Performance optimization applied', data);
    });
    logger.info('Advanced coordination system integrations configured');
}
export function getCoordinationMetrics(systems) {
    const topologyMetrics = systems.topologyManager.getTopologyMetrics();
    const distributionMetrics = systems.distributionEngine.getMetrics();
    const communicationMetrics = systems.communicationProtocols.getMetrics();
    const lifecycleMetrics = systems.lifecycleManager.getMetrics();
    const patternsMetrics = systems.coordinationPatterns.getMetrics();
    const optimizationMetrics = systems.performanceOptimizer.getMetrics();
    const efficiency = (topologyMetrics.communicationEfficiency +
        distributionMetrics.successRate * distributionMetrics.resourceEfficiency +
        communicationMetrics.networkHealth +
        lifecycleMetrics.averageHealth +
        patternsMetrics.coordinationEfficiency +
        calculateOptimizationEfficiency(optimizationMetrics)) /
        6;
    const reliability = (topologyMetrics.faultTolerance +
        distributionMetrics.successRate +
        (1 - communicationMetrics.networkHealth) +
        (1 - lifecycleMetrics.failureRate) +
        (1 - patternsMetrics.failureRate) +
        (1 - optimizationMetrics.errorMetrics.errorRate)) /
        6;
    const scalability = (topologyMetrics.loadBalance +
        distributionMetrics.loadBalance +
        communicationMetrics.nodes / 100 +
        lifecycleMetrics.totalAgents / 100 +
        patternsMetrics.coordinationEfficiency +
        optimizationMetrics.throughput.requestsPerSecond / 1000) /
        6;
    const adaptability = ((topologyMetrics.networkDiameter > 0
        ? 1 / topologyMetrics.networkDiameter
        : 1) +
        distributionMetrics.resourceEfficiency +
        communicationMetrics.networkHealth +
        lifecycleMetrics.recoveryRate +
        patternsMetrics.coordinationEfficiency +
        calculateAdaptabilityScore(optimizationMetrics)) /
        6;
    return {
        topology: topologyMetrics,
        distribution: distributionMetrics,
        communication: communicationMetrics,
        lifecycle: lifecycleMetrics,
        patterns: patternsMetrics,
        optimization: optimizationMetrics,
        overall: {
            efficiency: Math.max(0, Math.min(1, efficiency)),
            reliability: Math.max(0, Math.min(1, reliability)),
            scalability: Math.max(0, Math.min(1, scalability)),
            adaptability: Math.max(0, Math.min(1, adaptability)),
        },
    };
}
function calculateOptimizationEfficiency(metrics) {
    const latencyScore = Math.max(0, 1 - metrics.latency.average / 1000);
    const throughputScore = Math.min(1, metrics.throughput.requestsPerSecond / 1000);
    const resourceScore = Math.max(0, 1 - metrics.resourceUsage.cpuUsage);
    return (latencyScore + throughputScore + resourceScore) / 3;
}
function calculateAdaptabilityScore(metrics) {
    const cacheAdaptability = metrics.cacheMetrics.hitRate;
    const batchAdaptability = metrics.batchMetrics.utilizationRate;
    const connectionAdaptability = metrics.connectionMetrics.poolUtilization;
    return (cacheAdaptability + batchAdaptability + connectionAdaptability) / 3;
}
export async function shutdownCoordinationSystem(systems, logger) {
    logger.info('Shutting down advanced coordination system...');
    try {
        await systems.performanceOptimizer.shutdown();
        await systems.coordinationPatterns.shutdown();
        await systems.lifecycleManager.shutdown();
        await systems.communicationProtocols.shutdown();
        await systems.distributionEngine.shutdown();
        await systems.topologyManager.shutdown();
        logger.info('Advanced coordination system shutdown complete');
    }
    catch (error) {
        logger.error('Error during coordination system shutdown', { error });
        throw error;
    }
}
export function getDefaultCoordinationConfig(nodeId) {
    return {
        nodeId,
        topology: {
            type: 'hybrid',
            parameters: {},
            constraints: {
                maxLatency: 1000,
                minBandwidth: 1000000,
                faultTolerance: 0.8,
                scalabilityTarget: 100,
            },
            adaptation: {
                enabled: true,
                sensitivity: 0.3,
                cooldownPeriod: 30000,
                maxSwitchesPerHour: 5,
            },
        },
        distribution: {
            maxConcurrentTasks: 100,
            defaultTimeout: 30000,
            qualityThreshold: 0.8,
            loadBalanceTarget: 0.8,
            enablePredictiveAssignment: true,
            enableDynamicRebalancing: true,
        },
        communication: {
            maxMessageHistory: 10000,
            messageTimeout: 30000,
            gossipInterval: 5000,
            heartbeatInterval: 10000,
            compressionThreshold: 1024,
            encryptionEnabled: true,
            consensusTimeout: 30000,
            maxHops: 5,
        },
        lifecycle: {
            maxAgents: 100,
            minAgents: 5,
            spawnTimeout: 30000,
            shutdownTimeout: 15000,
            healthCheckInterval: 10000,
            performanceWindow: 300000,
            autoRestart: true,
            autoScale: true,
            resourceLimits: {
                maxCpuPercent: 80,
                maxMemoryMB: 1024,
                maxNetworkMbps: 100,
                maxDiskIOPS: 1000,
                maxOpenFiles: 1000,
                maxProcesses: 50,
            },
            qualityThresholds: {
                minSuccessRate: 0.9,
                minResponseTime: 1000,
                maxErrorRate: 0.1,
                minReliability: 0.9,
                minEfficiency: 0.8,
            },
        },
        patterns: {
            election: {
                algorithm: 'raft',
                timeoutMs: 10000,
                heartbeatInterval: 5000,
                maxRetries: 3,
                priorityBased: true,
                minNodes: 3,
            },
            consensus: {
                algorithm: 'raft',
                electionTimeout: [150, 300],
                heartbeatInterval: 50,
                logReplicationTimeout: 1000,
                maxLogEntries: 10000,
                snapshotThreshold: 1000,
            },
            workStealing: {
                maxQueueSize: 1000,
                stealThreshold: 10,
                stealRatio: 0.5,
                retryInterval: 1000,
                maxRetries: 3,
                loadBalancingInterval: 5000,
            },
            hierarchical: {
                maxDepth: 4,
                fanOut: 5,
                delegationThreshold: 0.8,
                escalationTimeout: 30000,
                rebalanceInterval: 60000,
            },
        },
        optimization: {
            batchSizing: {
                initialSize: 10,
                minSize: 1,
                maxSize: 100,
                adaptationRate: 0.1,
                targetLatency: 100,
                targetThroughput: 1000,
                windowSize: 100,
            },
            connectionPooling: {
                initialSize: 5,
                maxSize: 50,
                minIdle: 2,
                maxIdle: 10,
                connectionTimeout: 5000,
                idleTimeout: 300000,
                keepAliveInterval: 30000,
                retryAttempts: 3,
            },
            caching: {
                maxSize: 10000,
                ttl: 300000,
                refreshThreshold: 0.8,
                compressionEnabled: true,
                deduplicationEnabled: true,
                prefetchEnabled: true,
            },
            monitoring: {
                metricsInterval: 5000,
                alertThresholds: {
                    latency: 1000,
                    throughput: 100,
                    errorRate: 0.1,
                    cpuUsage: 0.8,
                    memoryUsage: 0.8,
                    queueDepth: 100,
                    connectionUtilization: 0.9,
                },
                historySizeLimit: 1000,
                anomalyDetection: true,
                predictionEnabled: true,
            },
            adaptation: {
                enabled: true,
                sensitivity: 0.2,
                cooldownPeriod: 30000,
                maxChangesPerPeriod: 3,
                learningRate: 0.1,
                explorationRate: 0.1,
            },
        },
    };
}
export default {
    createAdvancedCoordinationSystem,
    getCoordinationMetrics,
    shutdownCoordinationSystem,
    getDefaultCoordinationConfig,
};
//# sourceMappingURL=index.js.map